import serial
import requests
import time
import json
import sqlite3
import asyncio
import websockets
import threading
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore

# --- Configuration ---
ARDUINO_PORT = 'COM6'  
BAUD_RATE = 9600

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL_NAME = "llama3.2"  

DB_NAME = "aiot_home.db"

# --- Firebase Initialization ---
print("Initializing Firebase Connection...")
if not firebase_admin._apps:
    # Use the downloaded Service Account Key JSON file
    cred = credentials.Certificate('aiot-key.json')
    firebase_admin.initialize_app(cred, {
        'projectId': 'aiot-19b51'
    })

# Get Firestore client
db = firestore.client()

# --- Global System State ---
system_state = {
    "occupancy": 0,
    "motion_detected": False,
    "temperature": 0.0,
    "humidity": 0.0,
    "rain_detected": False,
    "water_level_percent": 0,
    "soil_moisture_percent": 0,
    "soil_ph": 7.0, 
    "ldr_value": 0,
    "pump_status": False,
    "planted_crop": "Tomato",
    "weather_prediction": "Waiting for AI analysis...",
    "ai_suggestion": "Waiting for AI analysis...",
    "ai_reasoning": "Waiting for AI analysis...",
    "led_brightness": 0  # Tracks current LED brightness
}

# ==========================================
# WEBSOCKET SERVER
# ==========================================
connected_clients = set()
ws_loop = asyncio.new_event_loop()

async def websocket_handler(websocket):
    connected_clients.add(websocket)
    try:
        # Send initial state immediately upon connection
        await websocket.send(json.dumps(system_state))
        await websocket.wait_closed()
    finally:
        connected_clients.remove(websocket)

def start_websocket_server():
    async def serve():
        async with websockets.serve(websocket_handler, "localhost", 8000):
            print("WebSocket Server running on ws://localhost:8000")
            await asyncio.Future()  # run forever

    asyncio.set_event_loop(ws_loop)
    ws_loop.run_until_complete(serve())

def broadcast_state():
    if not connected_clients:
        return
    message = json.dumps(system_state)
    for ws in connected_clients:
        asyncio.run_coroutine_threadsafe(ws.send(message), ws_loop)

# ==========================================
# DATABASE LOGIC: Setup, Logging, & Wipe
# ==========================================
def setup_database():
    print("Initializing Local SQLite Database...")
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Create the base table if it's completely brand new
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS daily_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            temperature REAL,
            humidity REAL,
            soil_moisture REAL,
            soil_ph REAL,
            water_level REAL
        )
    ''')
    
    # Safely attempt to add our new columns to an older database
    try:
        cursor.execute("ALTER TABLE daily_logs ADD COLUMN ambient_light REAL")
    except sqlite3.OperationalError:
        pass # Column already exists, safe to ignore
        
    try:
        cursor.execute("ALTER TABLE daily_logs ADD COLUMN led_brightness REAL")
    except sqlite3.OperationalError:
        pass # Column already exists, safe to ignore

    conn.commit()
    conn.close()

def log_to_db(temp, hum, moisture, ph, water, ambient_light, led_brightness):
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO daily_logs (temperature, humidity, soil_moisture, soil_ph, water_level, ambient_light, led_brightness) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (temp, hum, moisture, ph, water, ambient_light, led_brightness))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[DB ERROR] {e}")

def summarize_and_upload():
    print("\n" + "="*50)
    print("[SYSTEM] 11:59 PM Reached! Compiling daily averages...")
    
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        
        cursor.execute("SELECT AVG(temperature), AVG(humidity), AVG(soil_moisture), AVG(soil_ph), AVG(water_level), AVG(ambient_light), AVG(led_brightness) FROM daily_logs")
        summary = cursor.fetchone()
        
        # Prepare your payload with strict floating-point values
        payload = {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "avg_temperature": float(round(summary[0] or 0.0, 2)),
            "avg_humidity": float(round(summary[1] or 0.0, 2)),
            "avg_soil_moisture": float(round(summary[2] or 0.0, 2)),
            "avg_soil_ph": float(round(summary[3] or 0.0, 2)),
            "avg_water_level": float(round(summary[4] or 0.0, 2)),
            "avg_ambient_light": float(round(summary[5] or 0.0, 2)),
            "avg_led_brightness": float(round(summary[6] or 0.0, 2))
        }
        
        print(f"[CLOUD] Uploading payload to Firebase Firestore: {payload}")
        try:
            # Push to Firebase: Collection = "Smart Home table", Document ID = the Date
            doc_ref = db.collection("Smart Home table").document(payload["date"])
            doc_ref.set(payload)
            print(f"[CLOUD] Successfully backed up to Firestore Document: {payload['date']}!")
        except Exception as e:
            print(f"[CLOUD ERROR] Firebase Upload Failed: {e}")
            
        print("[SYSTEM] Wiping local database tables for the new day...")
        cursor.execute("DELETE FROM daily_logs")
        cursor.execute("VACUUM") 
        
        conn.commit()
        conn.close()
        print("[SYSTEM] Cleanup complete. Ready for tomorrow!\n" + "="*50)
        
    except Exception as e:
        print(f"[SYSTEM ERROR] Cleanup failed: {e}")

# ==========================================
# Llama AI Logic & Parsing
# ==========================================
def process_with_ollama():
    """Sends current state to Ollama for multi-factor reasoning."""
    
    current_time_str = datetime.now().strftime("%H:%M")
    
    prompt = f"""
    You are the AI brain of an AIoT Smart Home and Garden.
    Current Time: {current_time_str}
    
    CURRENT SYSTEM STATE:
    - Occupancy: {system_state['occupancy']} people home
    - Motion Detected: {system_state['motion_detected']}
    - Indoor Light Level (LDR): {system_state['ldr_value']} (Higher = Darker)
    - Climate: {system_state['temperature']}°C, {system_state['humidity']}% Humidity, Raining: {system_state['rain_detected']}
    - Garden: Tank {system_state['water_level_percent']}%, Soil Moisture {system_state['soil_moisture_percent']}%, Soil pH {system_state['soil_ph']}
    - Planted Crop: {system_state['planted_crop']}
    
    YOUR LOGIC RULES:
    1. WEATHER PREDICTION: Analyze Temp, Humidity, and Rain to predict weather (e.g., "Impending Storm").
    2. WATERING DECISION: If the water level percentage < 40% then trigger the pump on.
    3. NUTRITION: Give a 1-sentence fertilizer recommendation based on the current Soil pH and the Planted Crop.
    4. AMBIENT LIGHTING: 
       - ONLY turn lights on IF Motion Detected is True AND LDR > 400 (it is dark) AND Occupancy > 0.
       - IF it meets the conditions, set brightness based on time: Day (06:00-18:00)=100, Evening (18:00-22:00)=75, Night (22:00-06:00)=15.
       - IF NO motion, or room is bright, or no one is home, set COMMAND_LIGHT: 0.
    
    You MUST respond STRICTLY in the exact format below, with no extra text:
    COMMAND_PUMP: [PUMP_ON or PUMP_OFF]
    COMMAND_LIGHT: [0, 15, 75, or 100]
    WEATHER_PREDICTION: [Your short forecast]
    NUTRITION_ADVICE: [Your short suggestion]
    REASON: [1 short sentence explaining pump/light decisions]
    """
    
    payload = {"model": MODEL_NAME, "prompt": prompt, "stream": False}
    
    try:
        print("\n[AI] Analyzing weather, soil, and lighting context...")
        response = requests.post(OLLAMA_URL, json=payload, timeout=15)
        response.raise_for_status() 
        ai_response = response.json().get("response", "").strip()
        print(f"--- Ollama Output ---\n{ai_response}\n---------------------")
        return ai_response
    except Exception as e:
        print(f"[ERROR] Communicating with Ollama: {e}")
        return ""

def execute_hardware_command(ser, ai_response):
    """Parses Llama's response to send physical signals to Arduino & UI."""
    lines = ai_response.split('\n')
    
    for line in lines:
        line = line.strip()
        if line.startswith("COMMAND_PUMP:"):
            cmd = line.split(":", 1)[1].strip().upper()
            if cmd in ["PUMP_ON", "PUMP_OFF"]:
                print(f">> ACTION: Sending {cmd} to Arduino!")
                ser.write(f"{cmd}\n".encode())
                
        elif line.startswith("COMMAND_LIGHT:"):
            try:
                brightness = int(line.split(":", 1)[1].strip())
                system_state["led_brightness"] = brightness # Update global state
                # Sends actual hardware command to dim the MOSFET!
                ser.write(f"LIGHT:{brightness}\n".encode())
                print(f">> ACTION: Sent LIGHT:{brightness} to Arduino MOSFET")
            except ValueError:
                pass
                
        elif line.startswith("WEATHER_PREDICTION:"):
            prediction = line.split(":", 1)[1].strip()
            system_state["weather_prediction"] = prediction
            print(f">> UI UPDATE: Weather Forecast -> {prediction}")
            
        elif line.startswith("NUTRITION_ADVICE:"):
            advice = line.split(":", 1)[1].strip()
            system_state["ai_suggestion"] = advice
            print(f">> UI UPDATE: Nutrition Advice -> {advice}")
            
        elif line.startswith("REASON:"):
            reason = line.split(":", 1)[1].strip()
            system_state["ai_reasoning"] = reason
            print(f">> UI UPDATE: AI Reasoning -> {reason}")
            
    # Broadcast the AI updates to the frontend
    broadcast_state()

# ==========================================
# Main USB Listener Loop
# ==========================================
def main():
    threading.Thread(target=start_websocket_server, daemon=True).start()
    setup_database()
    last_cleanup_date = None
    last_ai_check_time = 0
    
    try:
        ser = serial.Serial(ARDUINO_PORT, BAUD_RATE, timeout=1)
        print(f"Listening to Arduino on {ARDUINO_PORT}...")
        time.sleep(2) 

        while True:
            # 1. Check for Daily Database Wipe (11:59 PM)
            now = datetime.now()
            current_date = now.date()
            if now.hour == 23 and now.minute == 59:
                if last_cleanup_date != current_date:
                    summarize_and_upload()
                    last_cleanup_date = current_date
            
            # 2. Process incoming USB Data
            if ser.in_waiting > 0:
                line = ser.readline().decode('utf-8').strip()
                if not line: continue
                    
                try:
                    data = json.loads(line)
                    data_type = data.get("type", "")
                    force_ai_update = False
                    
                    if data_type == "occupancy":
                        system_state["occupancy"] = data.get("occupancy", 0)
                        
                    elif data_type == "lighting":
                        # Instant trigger when someone triggers the PIR sensor!
                        system_state["motion_detected"] = data.get("motion", False)
                        force_ai_update = True 
                        
                    elif data_type == "climate":
                        system_state["temperature"] = data.get("temperature", 0)
                        system_state["humidity"] = data.get("humidity", 0)
                        system_state["rain_detected"] = data.get("is_raining", False)
                        
                    elif data_type == "garden":
                        system_state["water_level_percent"] = data.get("water_level_percent", 0)
                        system_state["soil_moisture_percent"] = data.get("soil_moisture_percent", 0)
                        system_state["pump_status"] = data.get("pump_status", False)
                        system_state["ldr_value"] = data.get("ldr_value", 0)
                        
                        raw_serial = data.get("module_serial_raw", "")
                        if "PH:" in raw_serial:
                            try:
                                ph_part = raw_serial.split("PH:")[1].split(",")[0].strip()
                                system_state["soil_ph"] = float(ph_part)
                            except: pass

                        # Only collect light data if the lights are turned on (> 0%)
                        current_ldr = system_state["ldr_value"] if system_state["led_brightness"] > 0 else None
                        current_led = system_state["led_brightness"] if system_state["led_brightness"] > 0 else None

                        # Log state to DB
                        log_to_db(
                            system_state["temperature"], system_state["humidity"], 
                            system_state["soil_moisture_percent"], system_state["soil_ph"], 
                            system_state["water_level_percent"], current_ldr, current_led
                        )
                        
                    # Broadcast the updated state to the frontend
                    broadcast_state()
                        
                    # 3. Trigger AI Check (Either forced by motion, or every 10 seconds normally)
                    current_time = time.time()
                    if force_ai_update or (current_time - last_ai_check_time > 10):
                        ai_response = process_with_ollama()
                        if ai_response:
                            execute_hardware_command(ser, ai_response)
                        last_ai_check_time = current_time
                        
                except json.JSONDecodeError:
                    pass

            # Tiny sleep prevents maxing out CPU without blocking serial reads
            time.sleep(0.01)

    except KeyboardInterrupt:
        print("\nShutting down script...")
    except Exception as e:
        print(f"Serial connection error: {e}")
    finally:
        if 'ser' in locals() and ser.is_open:
            ser.close()

if __name__ == "__main__":
    main()