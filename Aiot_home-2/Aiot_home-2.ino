#include <DHT.h>

#define DHTPIN 2
#define DHTTYPE DHT11

#define RAIN_SENSOR_PIN A0
#define SOIL_MOISTURE_PIN A1 // NEW: Dedicated Soil Moisture Sensor
#define LDR_PIN A3

#define PUMP_RELAY_PIN 8

#define SENSOR_A_PIN 4
#define SENSOR_B_PIN 5

// NEW: Smart Lighting Pins
#define PIR_PIN 9
#define MOSFET_PIN 10

DHT dht(DHTPIN, DHTTYPE);

int totalOccupancy = 0;
int currentState = 0; 
unsigned long lastTriggerTime = 0;
const unsigned long TIMEOUT_MS = 3000; 

unsigned long previousMillisSensors = 0;
const long intervalSensors = 2000; 

bool isPumpOn = false;

String latestSerialData = "";
int currentWaterRaw = 0; 

// NEW: Smart Lighting State Variables
int currentBrightness = 0;    
int targetBrightness = 0;     
unsigned long lastMotionTime = 0;
const unsigned long motionTimeout = 5000; 
bool motionActive = false;
unsigned long lastFadeTime = 0; // Timer for smooth LED fading

// NEW: PIR Calibration Variables
bool pirCalibrated = false;
unsigned long calibrationStartTime = 0;

void setup() {
  Serial.begin(9600);
  
  pinMode(PUMP_RELAY_PIN, OUTPUT);
  digitalWrite(PUMP_RELAY_PIN, LOW); 
  
  Serial1.begin(9600);
  
  pinMode(SENSOR_A_PIN, INPUT);
  pinMode(SENSOR_B_PIN, INPUT);
  
  // NEW: Lighting Pins Initialization
  pinMode(PIR_PIN, INPUT);
  pinMode(MOSFET_PIN, OUTPUT);
  analogWrite(MOSFET_PIN, 0); // Start with lights OFF
  
  dht.begin();
  
  calibrationStartTime = millis(); // Start PIR calibration timer
  
  delay(1000);
  Serial.println("{\"status\": \"System Initialized. PIR calibrating (30s)...\"}");
}

void loop() {
  unsigned long currentMillis = millis();

  // ==========================================
  // 1. COMMAND LISTENER (FROM PYTHON)
  // ==========================================
  if (Serial.available() > 0) {
    String incomingCommand = Serial.readStringUntil('\n');
    incomingCommand.trim(); 
    
    if (incomingCommand == "PUMP_OFF") {
      digitalWrite(PUMP_RELAY_PIN, HIGH);
      isPumpOn = true;
    } 
    else if (incomingCommand == "PUMP_ON") {
      digitalWrite(PUMP_RELAY_PIN, LOW);
      isPumpOn = false;
    }
    // Intercept LIGHT commands from Python
    else if (incomingCommand.startsWith("LIGHT:")) {
      String valueStr = incomingCommand.substring(6); // Extract the number
      int requestedPercent = valueStr.toInt();

      if (requestedPercent >= 0 && requestedPercent <= 100) {
        targetBrightness = map(requestedPercent, 0, 100, 0, 255);
        Serial.print("{\"ack\": \"Target brightness set to: ");
        Serial.print(requestedPercent);
        Serial.println("%\"}");
      } else {
        Serial.print("{\"error\": \"Validation failed! Value out of bounds: ");
        Serial.print(requestedPercent);
        Serial.println("\"}");
      }
    }
  }

  // ==========================================
  // 2. pH SENSOR SERIAL LISTENER
  // ==========================================
  if (Serial1.available() > 0) {
    String rawData = Serial1.readStringUntil('\n');
    rawData.trim();
    if (rawData.length() > 0) {
      latestSerialData = rawData; 
      
      int wIndex = latestSerialData.indexOf("W:");
      if (wIndex != -1) {
        int commaIndex = latestSerialData.indexOf(",", wIndex);
        if (commaIndex == -1) commaIndex = latestSerialData.length();
        String wStr = latestSerialData.substring(wIndex + 2, commaIndex);
        wStr.trim();
        currentWaterRaw = wStr.toInt(); 
      }
    }
  }

  // ==========================================
  // 3. CLIMATE & GARDEN SENSORS (NON-BLOCKING)
  // ==========================================
  if (currentMillis - previousMillisSensors >= intervalSensors) {
    previousMillisSensors = currentMillis;
    
    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();
    int rainValue = analogRead(RAIN_SENSOR_PIN);

    if (!isnan(humidity) && !isnan(temperature)) {
      sendClimateDataToLaptop(temperature, humidity, rainValue);
    } else {
      Serial.println("{\"error\": \"Failed to read from DHT sensor\"}");
    }

    int ldrValue = analogRead(LDR_PIN);
    
    int waterLevelPercent = currentWaterRaw * 25;
    waterLevelPercent = constrain(waterLevelPercent, 0, 100);

    // Read and calculate Soil Moisture percentage
    int soilRaw = analogRead(SOIL_MOISTURE_PIN);
    // Typical sensors output ~1023 in completely dry air, and ~300 in water.
    int soilMoisturePercent = map(soilRaw, 1023, 300, 0, 100);
    soilMoisturePercent = constrain(soilMoisturePercent, 0, 100);

    sendGardenDataToLaptop(ldrValue, waterLevelPercent, currentWaterRaw, soilMoisturePercent, latestSerialData, isPumpOn);
    
    latestSerialData = ""; 
  }

  // ==========================================
  // 4. DOORWAY OCCUPANCY LOGIC (IR SENSORS)
  // ==========================================
  bool sensorA_Detected = (digitalRead(SENSOR_A_PIN) == LOW);
  bool sensorB_Detected = (digitalRead(SENSOR_B_PIN) == LOW);

  if (currentState != 0 && (currentMillis - lastTriggerTime > TIMEOUT_MS)) {
    currentState = 0; 
  }

  if (currentState == 0) {
    if (sensorA_Detected && !sensorB_Detected) {
      currentState = 1;
      lastTriggerTime = currentMillis;
    } 
    else if (sensorB_Detected && !sensorA_Detected) {
      currentState = 2;
      lastTriggerTime = currentMillis;
    }
  } 
  else if (currentState == 1) {
    if (sensorB_Detected) {
      totalOccupancy++; 
      sendOccupancyDataToLaptop("Entry");
      currentState = 3;
      lastTriggerTime = currentMillis;
    }
  } 
  else if (currentState == 2) {
    if (sensorA_Detected) {
      if (totalOccupancy > 0) {
        totalOccupancy--; 
      }
      sendOccupancyDataToLaptop("Exit");
      currentState = 3; 
      lastTriggerTime = currentMillis;
    }
  } 
  else if (currentState == 3) {
    if (!sensorA_Detected && !sensorB_Detected) {
      currentState = 0; 
    }
  }

  // ==========================================
  // 5. PIR SENSOR LOGIC (NON-BLOCKING)
  // ==========================================
  if (!pirCalibrated) {
    // Wait 30 seconds for the PIR to map the room's thermal signature
    if (currentMillis - calibrationStartTime > 30000) {
      pirCalibrated = true;
      Serial.println("{\"status\": \"PIR Calibration Complete! Lighting System Active\"}");
    }
  } else {
    int pirState = digitalRead(PIR_PIN);

    // If motion is detected, update the timer
    if (pirState == HIGH) {
      lastMotionTime = currentMillis;
      if (!motionActive) {
        motionActive = true;
        sendLightingDataToLaptop(true);
      }
    }

    // If no motion is detected for 5 seconds, turn it off
    if (motionActive && (currentMillis - lastMotionTime > motionTimeout)) {
      motionActive = false;
      sendLightingDataToLaptop(false);
    }
  }

  // ==========================================
  // 6. BULLETPROOF MOSFET FADING LOGIC
  // ==========================================
  // Instead of delay(3), we use millis() so the Doorway IR sensors aren't blocked
  if (currentMillis - lastFadeTime > 3) { 
    if (currentBrightness < targetBrightness) {
      currentBrightness++;
      // The constrain() function ensures the PWM value NEVER goes above 255 
      // preventing the violent flickering/wrap-around bug!
      analogWrite(MOSFET_PIN, constrain(currentBrightness, 0, 255));
    } 
    else if (currentBrightness > targetBrightness) {
      currentBrightness--;
      // Prevents value from dropping below 0
      analogWrite(MOSFET_PIN, constrain(currentBrightness, 0, 255));
    }
    lastFadeTime = currentMillis;
  }
} 

// ==========================================
// DATA FORMATTING FUNCTIONS
// ==========================================

void sendLightingDataToLaptop(bool motion) {
  Serial.print("{\"type\": \"lighting\", \"motion\": ");
  Serial.print(motion ? "true" : "false");
  Serial.println("}");
}

void sendOccupancyDataToLaptop(String eventType) {
  Serial.print("{\"type\": \"occupancy\", \"occupancy\": ");
  Serial.print(totalOccupancy);
  Serial.print(", \"event\": \"");
  Serial.print(eventType);
  Serial.println("\"}");
}

void sendClimateDataToLaptop(float temp, float hum, int rainVal) {
  bool isRaining = (rainVal < 800);
  Serial.print("{\"type\": \"climate\", \"temperature\": ");
  Serial.print(temp);
  Serial.print(", \"humidity\": ");
  Serial.print(hum);
  Serial.print(", \"rain_value\": ");
  Serial.print(rainVal);
  Serial.print(", \"is_raining\": ");
  Serial.print(isRaining ? "true" : "false");
  Serial.println("}");
}

void sendGardenDataToLaptop(int ldr, int waterLvl, int waterRaw, int soilMoisture, String rawSerial, bool pumpState) {
  Serial.print("{\"type\": \"garden\", \"ldr_value\": ");
  Serial.print(ldr);
  Serial.print(", \"water_level_percent\": ");
  Serial.print(waterLvl);
  Serial.print(", \"water_raw\": ");
  Serial.print(waterRaw);
  Serial.print(", \"soil_moisture_percent\": ");
  Serial.print(soilMoisture);
  Serial.print(", \"pump_status\": ");
  Serial.print(pumpState ? "true" : "false");
  Serial.print(", \"module_serial_raw\": \"");
  Serial.print(rawSerial);
  Serial.println("\"}");
}