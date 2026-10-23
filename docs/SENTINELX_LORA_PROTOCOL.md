# SentinelX 2.0 LoRa link protocol and rollout gate

## Current state

The current node sketches transmit telemetry directly over Wi-Fi. The repository's proposed SX1278 wiring shares GPIOs with existing sensor assignments, so radio support must not be enabled by copying the current sample pin map. Confirm both ESP32 board variants, sensor wiring, module frequency and antenna before enabling radio firmware.

## Packet envelope

Use a versioned, bounded packet. JSON may be used during bench development; a compact binary or CBOR envelope can follow after the contract stabilizes.

Required fields:
- `protocolVersion`: integer, initially 1
- `nodeId`: registered node identifier
- `sequenceNumber`: monotonically increasing unsigned counter per node
- `messageId`: unique per sample; derive from node ID and sequence number
- `sampledAt`: UTC timestamp when available; also include device uptime
- `type`: FLOOD or FIRE
- `payload`: typed telemetry with explicit sensor-validity flags
- `crc`: frame-integrity check at the application envelope layer if the chosen transport library does not already provide the needed check

## ACK / retry behavior

1. Sender transmits one data frame and waits for an ACK containing the same node ID and sequence number.
2. Retry at most 3 times with bounded randomized backoff; do not block local sensor sampling or local alarms while waiting.
3. Gateway ACKs only after it has accepted the frame into its receive queue. For end-to-end durability, the gateway should separately report backend delivery status.
4. Gateway deduplicates on `(node_id, sequence_number)`; duplicate retries must not create duplicate readings or duplicate alert events.
5. If ACKs fail, retain the latest N frames in a bounded queue, count drops, and expose link-down status. Never let a full queue overwrite the only record of an active critical alarm without raising a local diagnostic.
6. Reboot-safe sequence handling: persist the counter periodically or pair it with a boot/session ID.

## Gateway and backend

- Designate one node or a dedicated ESP32 as the LoRa-to-Wi-Fi gateway; a radio link alone does not provide internet access.
- Gateway forwards validated packets to FastAPI using the same telemetry schema.
- Use the original sensor timestamp and a separate gateway/server receive timestamp.
- Do not accept unknown node IDs for control commands. This link is telemetry-only until command authentication is designed.

## Electrical and regulatory gate

- Confirm the exact SX1278 module frequency variant and use the correct antenna.
- Use a frequency and transmit settings permitted by local regulations in India.
- SX1278 logic is 3.3 V; do not power the radio from 5 V.
- Coordinate SCK/MISO/MOSI/NSS/RESET/DIO0 with all existing sensor and LCD pins; the prior draft pin suggestions conflict.
- Bench-test packet loss, duplicate packets, node resets and gateway loss before field trials.

## Acceptance criteria

- A lost packet is retried without blocking local alarms.
- Duplicate frames produce one persisted sample.
- Gateway outage is visible as stale/link-down, not as normal conditions.
- Invalid sensors remain invalid through the gateway and API.
- Measured retry count, packet delivery ratio and end-to-end latency are recorded during testing.
