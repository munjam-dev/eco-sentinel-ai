import time
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.logging import logger


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests: int = 100, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.clients = {}

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "127.0.0.1"
        current_time = time.time()

        # Clean old entries
        if client_ip in self.clients:
            req_times = [t for t in self.clients[client_ip] if current_time - t < self.window_seconds]
            self.clients[client_ip] = req_times

            if len(req_times) >= self.max_requests:
                logger.warning(f"Rate limit exceeded for IP: {client_ip}")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded. Too many requests."
                )

        self.clients.setdefault(client_ip, []).append(current_time)
        return await call_next(request)
