import time
import random
import requests
import json

SUPABASE_URL = "https://bgeobskxeggfyhenkgjn.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZW9ic2t4ZWdnZnloZW5rZ2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NTMyMjcsImV4cCI6MjEwNDQyOTIyN30.MZXizqRdid5uTKUTPQmSnkUJg1Jm-qMJ_g3U8Efpxz8"

headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

print("==================================================")
print("  EcoSentinel AI — Virtual ESP32 Hardware Streamer")
print("==================================================")
print(f"Target: {SUPABASE_URL}/rest/v1/sensor_readings")
print("Streaming live telemetry every 3 seconds... (Press Ctrl+C to stop)\n")

while True:
    # Node 1: Flood Node Telemetry
    water_level = round(random.uniform(25.0, 58.0), 1)
    temp = round(random.uniform(28.0, 34.0), 1)
    humidity = round(random.uniform(60.0, 85.0), 1)
    risk = "HIGH" if water_level > 50.0 else ("MEDIUM" if water_level > 38.0 else "LOW")
    
    payload_node1 = {
        "node_id": "NODE-01",
        "temperature": temp,
        "humidity": humidity,
        "water_level": water_level,
        "rain_detected": random.choice([True, False]),
        "risk_level": risk,
        "battery_pct": random.randint(88, 100),
        "rssi_dbm": random.randint(-70, -55)
    }

    # Node 2: Fire Node Telemetry
    mq2 = round(random.uniform(120.0, 320.0), 1)
    fire_temp = round(random.uniform(30.0, 42.0), 1)
    fire_risk = "HIGH" if mq2 > 300.0 else ("MEDIUM" if mq2 > 200.0 else "LOW")
    
    payload_node2 = {
        "node_id": "NODE-02",
        "temperature": fire_temp,
        "humidity": round(random.uniform(30.0, 50.0), 1),
        "mq2_ppm": mq2,
        "flame_detected": False,
        "risk_level": fire_risk,
        "battery_pct": random.randint(85, 99),
        "rssi_dbm": random.randint(-72, -58)
    }

    try:
        # Push Node 1
        res1 = requests.post(f"{SUPABASE_URL}/rest/v1/sensor_readings", headers=headers, json=payload_node1, timeout=5)
        print(f"[NODE-01 FLOOD] Water: {water_level}cm | Temp: {temp}C | Risk: {risk} | Status: {res1.status_code}")
        
        # Push Node 2
        res2 = requests.post(f"{SUPABASE_URL}/rest/v1/sensor_readings", headers=headers, json=payload_node2, timeout=5)
        print(f"[NODE-02 FIRE ] Smoke: {mq2}PPM | Temp: {fire_temp}C | Risk: {fire_risk} | Status: {res2.status_code}")
    except Exception as e:
        print(f"[ERROR] Failed to send telemetry: {e}")
        
    time.sleep(3)
