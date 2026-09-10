"""
EcoSentinel AI — Supabase Database Provisioning & Migration Utility
Connects to Supabase PostgreSQL, executes database/schema.sql and seed_data.sql.
"""

import os
import sys
import asyncio
from pathlib import Path

# Add parent directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from sqlalchemy import text


async def init_supabase():
    print("=" * 70)
    print("  EcoSentinel AI — Supabase Database Setup & Schema Provisioner")
    print("=" * 70)

    from app.core.config import settings
    from app.database.session import engine

    db_url = settings.DATABASE_URL
    
    print(f"\n[1/3] Connecting to Database...")
    # Hide password in logs
    masked_url = db_url
    if "@" in db_url:
        user_part, host_part = db_url.split("@", 1)
        masked_url = f"{user_part.split(':')[0]}:****@{host_part}"
    print(f"      Target: {masked_url}")

    schema_file = BASE_DIR.parent / "database" / "schema.sql"
    seed_file = BASE_DIR.parent / "database" / "seed_data.sql"

    if not schema_file.exists():
        print(f"[ERROR] Schema file not found at: {schema_file}")
        return False

    try:
        async with engine.begin() as conn:
            print("[SUCCESS] Connected to PostgreSQL / Supabase successfully!")

            # 2. Execute Schema DDL
            print("\n[2/3] Executing schema.sql (Creating 9 production tables + indexes)...")
            with open(schema_file, "r", encoding="utf-8") as f:
                schema_sql = f.read()

            # Split statements by semicolon for clean execution
            statements = [s.strip() for s in schema_sql.split(";") if s.strip()]
            for stmt in statements:
                await conn.execute(text(stmt))

            print("      ✓ Created tables: nodes, sensor_readings, alerts, ai_predictions,")
            print("                        node_health, users, settings, notification_logs, system_logs")
            print("      ✓ Created time-series indexes & constraints")

            # 3. Execute Seed Data
            if seed_file.exists():
                print("\n[3/3] Executing seed_data.sql (Populating default nodes & settings)...")
                with open(seed_file, "r", encoding="utf-8") as f:
                    seed_sql = f.read()
                seed_statements = [s.strip() for s in seed_sql.split(";") if s.strip()]
                for stmt in seed_statements:
                    await conn.execute(text(stmt))
                print("      ✓ Seeded initial sensor nodes (NODE-01, NODE-02, NODE-03, NODE-04)")
                print("      ✓ Seeded disaster risk threshold settings")

        print("\n" + "=" * 70)
        print("  ✓ Supabase Database is 100% Configured and Ready for Production!")
        print("=" * 70)
        return True

    except Exception as e:
        print(f"\n[NOTICE / ERROR] Database initialization: {e}")
        print("\nTroubleshooting Tips for Supabase:")
        print(" 1. Copy your Supabase URI from: Dashboard -> Project Settings -> Database -> Connection string (URI)")
        print(" 2. Set DATABASE_URL in ecosentinel-backend/.env:")
        print("    DATABASE_URL=postgresql+asyncpg://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres")
        print(" 3. Alternatively, copy database/schema.sql and database/seed_data.sql directly into the Supabase SQL Editor!")
        return False


if __name__ == "__main__":
    success = asyncio.run(init_supabase())
    sys.exit(0 if success else 1)
