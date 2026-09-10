# EcoSentinel AI — 100% Free Production Deployment Guide

Deploy EcoSentinel AI to the cloud using exclusively free tier services.

---

## Architecture Stack (Free Tier Allocation)

| Component | Cloud Provider | Free Tier Specification |
|---|---|---|
| **Database** | **Supabase** | 500 MB PostgreSQL, Instant Realtime, Built-in RLS |
| **Backend API** | **Render** | 512 MB Web Service, Automatic HTTPS, Free WebSockets |
| **Frontend Web** | **Vercel** | Edge Network, Unlimited Static Deployments, Next.js 15 |
| **Code Repository** | **GitHub** | Free Public/Private Repositories & CI/CD Actions |

---

## Step 1: Database Setup on Supabase

1. Navigate to [Supabase](https://supabase.com) and create a free project named `ecosentinel-ai`.
2. Once the project initializes, navigate to the **SQL Editor**.
3. Copy the contents of [`database/schema.sql`](../database/schema.sql) and execute the query to create all tables and indexes.
4. Copy the contents of [`database/seed_data.sql`](../database/seed_data.sql) and execute the query to seed initial nodes and thresholds.
5. In **Project Settings** &rarr; **Database**, copy your **Connection String (URI)**:
   ```
   postgresql+asyncpg://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

---

## Step 2: Backend API Deployment on Render

1. Create a free account on [Render](https://render.com).
2. Click **New +** &rarr; **Web Service** and connect your GitHub repository.
3. Configure the service:
   - **Root Directory**: `ecosentinel-backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. In **Environment Variables**, add:
   ```ini
   ENVIRONMENT=production
   DATABASE_URL=postgresql+asyncpg://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   BACKEND_CORS_ORIGINS=["https://ecosentinel-app.vercel.app","http://localhost:3000"]
   LOG_LEVEL=INFO
   ```
5. Click **Create Web Service**. Your API will be live at `https://ecosentinel-api.onrender.com`.

---

## Step 3: Frontend Web Deployment on Vercel

1. Navigate to [Vercel](https://vercel.com) and click **Add New...** &rarr; **Project**.
2. Select your GitHub repository.
3. Configure project settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `ecosentinel-app`
4. Add Environment Variables:
   ```ini
   NEXT_PUBLIC_API_URL=https://ecosentinel-api.onrender.com/api/v1
   NEXT_PUBLIC_WS_URL=wss://ecosentinel-api.onrender.com/ws/live
   NEXT_PUBLIC_MAPBOX_TOKEN=YOUR_MAPBOX_OR_GOOGLE_KEY
   ```
5. Click **Deploy**. Your dashboard is now live globally with sub-second worldwide edge routing.

---

## Step 4: Configure ESP32 Nodes

1. Open `firmware/common/config.h`.
2. Set the `BACKEND_API_URL` to your live Render endpoint:
   ```c
   #define BACKEND_API_URL "https://ecosentinel-api.onrender.com/api/v1/node-data"
   ```
3. Flash the firmware to your nodes. Telemetry will instantly sync to Supabase and stream live to your Vercel dashboard.
