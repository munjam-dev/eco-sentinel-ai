import json
import logging
from typing import Dict, Set, Any
from fastapi import WebSocket

logger = logging.getLogger("ecosentinel.websocket")


class ConnectionManager:
    """Enterprise Realtime WebSocket Connection & Broadcast Manager."""

    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WebSocket client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Remaining connections: {len(self.active_connections)}")

    async def broadcast(self, event_type: str, payload: Any):
        """Broadcast real-time JSON message to all connected clients."""
        if not self.active_connections:
            return

        message = json.dumps({
            "event": event_type,
            "payload": payload
        }, default=str)

        disconnected: Set[WebSocket] = set()
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.warning(f"Failed to send WS message: {e}")
                disconnected.add(connection)

        for conn in disconnected:
            self.disconnect(conn)


# Global Singleton Instance
ws_manager = ConnectionManager()
