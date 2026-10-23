"""Schema contract tests for SentinelX 2.0 telemetry.

Run from ecosentinel-backend with: python -m pytest ../tests/test_sensor_data_schema.py
"""
from app.schemas.sensor_data import SensorDataIngest


def test_fire_node_raw_adc_is_not_parsed_as_ppm():
    payload = SensorDataIngest.model_validate({
        "nodeId": "NODE-02",
        "type": "FIRE",
        "mq2": 2380,
        "mq2Raw": 2380,
        "mq2Units": "adc_raw",
        "mq2DigitalAlarm": False,
        "flame": 0,
        "firmwareVersion": "2.0.0",
    })

    assert payload.mq2_smoke is None
    assert payload.mq2_raw == 2380
    assert payload.mq2_digital_alarm is False
    assert payload.firmware_version == "2.0.0"


def test_flood_node_sensor_fault_and_rain_raw_are_preserved():
    payload = SensorDataIngest.model_validate({
        "nodeId": "NODE-01",
        "type": "FLOOD",
        "waterLevel": None,
        "waterSensorValid": False,
        "rain": True,
        "rainRaw": 1740,
        "climateSensorValid": False,
    })

    assert payload.water_level is None
    assert payload.water_sensor_valid is False
    assert payload.rain is True
    assert payload.rain_raw == 1740
    assert payload.climate_sensor_valid is False
    # This is only a presence proxy for legacy compatibility, not calibrated mm/hr.
    assert payload.rain_rate == 25.0
