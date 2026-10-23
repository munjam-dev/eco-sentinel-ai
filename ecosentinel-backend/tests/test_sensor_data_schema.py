"""SentinelX 2.0 telemetry contract tests."""
from app.schemas.sensor_data import SensorDataIngest


def test_fire_node_raw_adc_is_not_parsed_as_ppm():
    payload = SensorDataIngest.model_validate({
        "nodeId": "NODE-02", "type": "FIRE", "mq2": 2380,
        "mq2Raw": 2380, "mq2Units": "adc_raw",
        "mq2DigitalAlarm": False, "flame": 0,
        "firmwareVersion": "2.0.0", "battery": 74,
        "signal": -88, "sequenceNumber": 10,
    })
    assert payload.mq2_smoke is None
    assert payload.mq2_raw == 2380
    assert payload.mq2_digital_alarm is False
    assert payload.firmware_version == "2.0.0"
    assert payload.battery_level == 74
    assert payload.rssi == -88
    assert payload.sequence_number == 10


def test_flood_fault_and_raw_rain_are_preserved_without_fake_rain_rate():
    payload = SensorDataIngest.model_validate({
        "nodeId": "NODE-01", "type": "FLOOD",
        "waterLevel": None, "waterSensorValid": False,
        "rain": True, "rainRaw": 1740, "climateSensorValid": False,
        "pressureHpa": 1008.4, "batteryVoltage": 3.91,
    })
    assert payload.water_level is None
    assert payload.water_sensor_valid is False
    assert payload.rain is True
    assert payload.rain_detected is True
    assert payload.rain_raw == 1740
    assert payload.rain_rate is None
    assert payload.climate_sensor_valid is False
    assert payload.pressure_hpa == 1008.4
    assert payload.battery_voltage == 3.91


def test_invalid_gps_ranges_are_rejected():
    try:
        SensorDataIngest.model_validate({
            "nodeId": "NODE-01", "gpsLatitude": 190,
        })
    except Exception:
        return
    raise AssertionError("Out-of-range GPS coordinates should be rejected")


def test_missing_battery_and_signal_remain_unknown():
    payload = SensorDataIngest.model_validate({"nodeId": "NODE-01"})
    assert payload.battery_level is None
    assert payload.rssi is None
