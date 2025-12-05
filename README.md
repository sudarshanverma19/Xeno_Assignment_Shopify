# Shopify Analytics Dashboard

Full-stack application for syncing and analyzing Shopify store data.

## Features

- Multi-tenant support for multiple Shopify stores
- Automated data sync from Shopify API
- Analytics dashboard with charts
- Scheduled background sync jobs
- RESTful API endpoints

## Tech Stack

**Backend:** Node.js, Express, Prisma, PostgreSQL, Axios, node-cron

**Frontend:** React, React Router, Recharts, Axios

## Setup

### Prerequisites

- Node.js v16+
- PostgreSQL
- Shopify store with Admin API access

### Backend

1. Navigate to backend directory
2. Install dependencies: `npm install`
3. Create `.env` file with database URL, Shopify credentials
4. Run migrations: `npx prisma migrate dev`
5. Seed database: `npm run seed`
6. Start server: `npm run dev`

### Frontend

1. Navigate to frontend directory
2. Install dependencies: `npm install`
3. Create `.env` with `REACT_APP_API_URL=http://localhost:5000`
4. Start server: `npm start`

## API Endpoints

Base URL: `http://localhost:5000/api`

- `POST /tenants/login` - Login
- `GET /tenants` - Get all tenants
- `POST /tenants` - Create tenant
- `POST /ingestion/sync-all` - Sync Shopify data
- `GET /ingestion/products` - Get products
- `GET /ingestion/customers` - Get customers
- `GET /ingestion/orders` - Get orders
- `GET /metrics/overview` - Get metrics
- `GET /metrics/orders-by-date` - Orders by date
- `GET /metrics/top-customers` - Top customers

## Database Schema

- **tenants** - Store information with credentials
- **products** - Product catalog with prices and inventory
- **customers** - Customer data with spending history
- **orders** - Order records with amounts and status

## Usage

1. Login with `admin@example.com`
2. Click "Sync Data" to fetch from Shopify
3. View analytics dashboard with charts

## Project Structure

```
backend/
├── prisma/          # Database schema
├── src/
│   ├── routes/      # API routes
│   ├── services/    # Business logic
│   └── config/      # Configuration

frontend/
├── src/
│   ├── components/  # React components
│   └── services/    # API client
```
