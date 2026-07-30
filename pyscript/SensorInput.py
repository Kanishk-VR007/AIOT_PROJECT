import serial
import json
import time
import sqlite3
import requests

# --- Configuration ---
# You MUST change this to match your actual Arduino port!
# On Windows: It will look like 'COM3', 'COM4', etc. (Check Device Manager)
# On Mac/Linux: It will look like '/dev/tty.usbmodem14101' or '/dev/ttyUSB0'
ARDUINO_PORT = 'COM5' 
BAUD_RATE = 9600

# --- Database Setup ---
DB_NAME = "aiot_home.db"

def setup_database():
    print("Initializing SQLite Database...")
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Create tables for our 3 subsystems
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS climate_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            temperature REAL,
            humidity REAL,
            rain_value INTEGER,
            is_raining BOOLEAN
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS occupancy_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            event_type TEXT,
            total_people INTEGER
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS garden_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            ldr_value INTEGER,
            water_level_percent INTEGER,
            module_raw_data TEXT,
            ai_advice TEXT
        )
    ''')
    conn.commit()
    conn.close()
    print("Database ready!\n")

def log_to_db(query, data_tuple):
    # Helper function to open, write, and close the DB quickly
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute(query, data_tuple)
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[DB ERROR] {e}")

# --- Ollama AI Integration ---
def get_llama2_advice(ldr_value, water_level, raw_module_data):
    """
    Sends the current garden sensor data to the local Ollama (Llama-2) server
    and returns a short piece of advice.
    """
    url = "http://localhost:11434/api/generate"
    
    prompt = f"""
    You are an expert AI automated gardening system.
    Current Sensor Data:
    - Light Intensity (LDR): {ldr_value}
    - Water Level: {water_level}%
    - Additional Raw Data: {raw_module_data}
    
    Based ONLY on this data, provide a single, short sentence of advice for the garden.
    """
    
    payload = {
        "model": "llama3.2",
        "prompt": prompt,
        "stream": False
    }
    
    try:
        print("\n[AI] Asking Llama-2 for advice...")
        response = requests.post(url, json=payload, timeout=10) # 10 second timeout
        response_data = response.json()
        advice = response_data.get("response", "No advice generated.")
        print(f"[AI] Llama-2 Advice: {advice}\n")
        return advice
    except requests.exceptions.RequestException as e:
        print(f"\n[AI ERROR] Could not connect to local Ollama server. Is it running? Error: {e}\n")
        return "AI Offline."

def main():
    setup_database()
    print(f"Attempting to connect to Arduino on {ARDUINO_PORT} at {BAUD_RATE} baud...")
    
    try:
        # Open the serial connection
        ser = serial.Serial(ARDUINO_PORT, BAUD_RATE, timeout=1)
        # Give the Arduino a second to reset after connecting
        time.sleep(2) 
        print("Successfully connected! Listening for sensor data...\n")
        print("-" * 50)
        
    except serial.SerialException as e:
        print(f"\n[ERROR] Could not connect to {ARDUINO_PORT}.")
        print("Please check that your Arduino is plugged in and the port name is correct.")
        print(f"Technical details: {e}")
        return

    # Keep listening forever
    try:
        while True:
            # Check if there is data waiting to be read
            if ser.in_waiting > 0:
                # Read a line of text, decode it from bytes to string, and remove trailing whitespace
                raw_line = ser.readline().decode('utf-8').strip()
                
                # We only care if the line has actual content
                if raw_line:
                    try:
                        # Attempt to parse the incoming text as a JSON dictionary
                        data = json.loads(raw_line)
                        
                        # --- Handle different types of incoming data ---
                        data_type = data.get("type", "unknown")
                        
                        if data_type == "climate":
                            print(f"[CLIMATE] Temp: {data['temperature']}°C | Hum: {data['humidity']}% | Raining: {data['is_raining']} (Raw: {data['rain_value']})")
                            log_to_db(
                                "INSERT INTO climate_logs (temperature, humidity, rain_value, is_raining) VALUES (?, ?, ?, ?)",
                                (data['temperature'], data['humidity'], data['rain_value'], str(data['is_raining']))
                            )
                            
                        elif data_type == "occupancy":
                            print(f"[OCCUPANCY] Event: {data['event']} | Total People Inside: {data['occupancy']}")
                            log_to_db(
                                "INSERT INTO occupancy_logs (event_type, total_people) VALUES (?, ?)",
                                (data['event'], data['occupancy'])
                            )
                            
                        elif data_type == "garden":
                            ldr = data.get('ldr_value', 0)
                            water = data.get('water_level_percent', 0)
                            serial_string = data.get("module_serial_raw", "")
                            
                            print(f"[GARDEN] Light (LDR): {ldr} | Water Level: {water}%")
                            
                            if serial_string:
                                print(f"          [Module Raw Data]: {serial_string}")
                                
                            # 1. Ask Llama-2 for advice
                            ai_advice = get_llama2_advice(ldr, water, serial_string)
                                
                            # 2. Log the data AND the AI advice to the database
                            log_to_db(
                                "INSERT INTO garden_logs (ldr_value, water_level_percent, module_raw_data, ai_advice) VALUES (?, ?, ?, ?)",
                                (ldr, water, serial_string, ai_advice)
                            )
                                
                        else:
                            print(f"[OTHER JSON] {data}")
                            
                    except json.JSONDecodeError:
                        # If the Arduino prints normal text (like "System Initialized..."), just print it normally
                        print(f"[ARDUINO MSG] {raw_line}")
                        
            # A tiny sleep to prevent the loop from maxing out your laptop's CPU
            time.sleep(0.01)

    except KeyboardInterrupt:
        print("\n\nUser stopped the script. Closing connection.")
        ser.close()

if __name__ == "__main__":
    main()