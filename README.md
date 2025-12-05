# Shopify Data Ingestion & Insights Dashboard

A comprehensive full-stack multi-tenant system for ingesting Shopify store data and providing business analytics through an intuitive dashboard.

![Architecture](./docs/architecture.png)

## 🎯 Features

- **Multi-Tenant Architecture**: Support multiple Shopify stores with isolated data
- **Automated Data Ingestion**: Sync products, customers, and orders from Shopify Admin API
- **Real-Time Analytics**: Business insights including revenue, orders, and customer metrics
- **Interactive Dashboard**: Visual charts and graphs for data analysis
- **Scheduled Sync**: Automated periodic data synchronization using cron jobs
- **Webhook Support**: Real-time updates via Shopify webhooks
- **RESTful API**: Clean and documented API endpoints

## 🏗️ Architecture

```
┌─────────────────┐
│   Shopify API   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│           Backend (Node.js)             │
│  ┌──────────────────────────────────┐  │
│  │   Express Server + Prisma ORM    │  │
│  ├──────────────────────────────────┤  │
│  │  • Shopify API Integration       │  │
│  │  • Data Ingestion Service        │  │
│  │  • Analytics Service             │  │
│  │  • Cron Jobs (6-hour sync)       │  │
│  │  • Webhook Handlers              │  │
│  └──────────────────────────────────┘  │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
│   (Database)    │
└─────────────────┘
         ▲
         │
┌────────┴────────────────────────────────┐
│     Frontend (React)                    │
│  ┌──────────────────────────────────┐  │
│  │   Dashboard UI + Recharts        │  │
│  ├──────────────────────────────────┤  │
│  │  • Login Screen                  │  │
│  │  • Metrics Cards                 │  │
│  │  • Orders Line Chart             │  │
│  │  • Top Customers Bar Chart       │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## 📦 Tech Stack

### Backend
- **Node.js** + **Express.js**: RESTful API server
- **Prisma ORM**: Database management and migrations
- **PostgreSQL**: Primary database
- **Axios**: HTTP client for Shopify API calls
- **node-cron**: Scheduled data synchronization

### Frontend
- **React.js**: UI framework
- **React Router**: Navigation
- **Recharts**: Data visualization
- **Axios**: API communication

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Shopify store with Admin API access

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/shopify_db?schema=public"
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   SHOPIFY_STORE_URL=your-store.myshopify.com
   SHOPIFY_ACCESS_TOKEN=your_shopify_admin_api_token
   ```

   **Important**: To get full access to customers and orders data:
   - Go to your Shopify Admin → Settings → Apps and sales channels
   - Click "Develop apps" → "Create an app"
   - Configure API scopes: `read_products`, `read_customers`, `read_orders`
   - Install the app and copy the Admin API access token
   - Use this token as `SHOPIFY_ACCESS_TOKEN`

4. **Run database migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Seed initial tenant**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   npm run dev
   ```

   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `frontend` directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

   Application will run on `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Tenant Endpoints

#### Login
```http
POST /tenants/login
Content-Type: application/json

{
  "email": "admin@example.com"
}
```

#### Get All Tenants
```http
GET /tenants
```

#### Create Tenant
```http
POST /tenants
Content-Type: application/json

{
  "shopUrl": "yourstore.myshopify.com",
  "accessToken": "shpat_xxxxx",
  "email": "admin@yourstore.com"
}
```

### Ingestion Endpoints

#### Sync All Data
```http
POST /ingestion/sync-all
Content-Type: application/json

{
  "tenantId": "uuid"
}
```

#### Get Products
```http
GET /ingestion/products?tenantId=uuid
```

#### Get Customers
```http
GET /ingestion/customers?tenantId=uuid
```

#### Get Orders
```http
GET /ingestion/orders?tenantId=uuid
```

### Analytics Endpoints

#### Get Overview Metrics
```http
GET /metrics/overview?tenantId=uuid

Response:
{
  "totalCustomers": 150,
  "totalOrders": 500,
  "totalRevenue": 25000.00
}
```

#### Get Orders by Date
```http
GET /metrics/orders-by-date?tenantId=uuid&range=30d

Response:
[
  {
    "date": "2024-12-01",
    "orders": 10,
    "revenue": 1500.00
  }
]
```

#### Get Top Customers
```http
GET /metrics/top-customers?tenantId=uuid&limit=5

Response:
[
  {
    "id": "customer_id",
    "name": "John Doe",
    "email": "john@example.com",
    "totalSpent": 5000.00,
    "ordersCount": 25
  }
]
```

### Webhook Endpoints

#### Order Created
```http
POST /webhooks/shopify/orders/create
X-Shopify-Shop-Domain: yourstore.myshopify.com
Content-Type: application/json

{...order data...}
```

## 🗄️ Database Schema

### Tables

**tenants**
- `id` (UUID, PK)
- `shop_url` (String, Unique)
- `access_token` (String)
- `email` (String)
- `is_active` (Boolean)
- `created_at` (DateTime)
- `updated_at` (DateTime)

**products**
- `id` (String, PK)
- `tenant_id` (UUID, FK)
- `title` (String)
- `price` (Float)
- `status` (String)
- `inventory_quantity` (Int)
- Various metadata fields

**customers**
- `id` (String, PK)
- `tenant_id` (UUID, FK)
- `email` (String)
- `first_name` (String)
- `last_name` (String)
- `total_spent` (Float)
- `orders_count` (Int)

**orders**
- `id` (String, PK)
- `tenant_id` (UUID, FK)
- `customer_id` (String, FK)
- `order_number` (Int)
- `total_price` (Float)
- `financial_status` (String)
- `created_at` (DateTime)

## ⏰ Cron Jobs

The system runs automated data synchronization every 6 hours for all active tenants:

- **Schedule**: `0 */6 * * *` (Every 6 hours)
- **Actions**: Syncs products, customers, and orders
- **Configuration**: See `backend/src/services/cronService.js`

To modify the schedule, edit the cron expression in `cronService.js`.

## 🚢 Deployment

### Backend Deployment (Render/Railway)

1. **Create a new web service**
2. **Connect your repository**
3. **Configure environment variables**:
   - `DATABASE_URL`
   - `SHOPIFY_STORE_URL`
   - `SHOPIFY_ACCESS_TOKEN`
   - `FRONTEND_URL`
   - `NODE_ENV=production`

4. **Build command**: `npm install && npx prisma generate && npx prisma migrate deploy`
5. **Start command**: `npm start`

### Frontend Deployment (Vercel)

1. **Import project to Vercel**
2. **Configure environment variables**:
   - `REACT_APP_API_URL` (your backend URL)
3. **Build settings**:
   - Framework: Create React App
   - Build command: `npm run build`
   - Output directory: `build`

### Database Deployment (Neon/Supabase)

1. **Create PostgreSQL database**
2. **Get connection string**
3. **Update `DATABASE_URL` in backend environment**

## 🧪 Testing the Application

1. **Login** with `admin@example.com`
2. **Click "Sync Data"** to fetch Shopify data
3. **View Metrics**:
   - Total Customers
   - Total Orders
   - Total Revenue
4. **Analyze Charts**:
   - Orders over time (line chart)
   - Top 5 customers by spend (bar chart)

## 📁 Project Structure

```
Shopify/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js        # Prisma client
│   │   ├── routes/
│   │   │   ├── tenants.js         # Tenant routes
│   │   │   ├── ingestion.js       # Data ingestion routes
│   │   │   ├── analytics.js       # Analytics routes
│   │   │   └── webhooks.js        # Webhook routes
│   │   ├── services/
│   │   │   ├── shopifyService.js  # Shopify API integration
│   │   │   ├── ingestionService.js # Data ingestion logic
│   │   │   ├── analyticsService.js # Analytics logic
│   │   │   └── cronService.js      # Cron job scheduler
│   │   ├── scripts/
│   │   │   └── seed.js            # Database seeding
│   │   └── index.js               # Express server
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Login.css
│   │   │   ├── Dashboard.js
│   │   │   └── Dashboard.css
│   │   ├── services/
│   │   │   └── api.js             # API client
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## 🔒 Security Notes

- Store API tokens securely in environment variables
- Never commit `.env` files to version control
- Implement HMAC verification for Shopify webhooks in production
- Use HTTPS for all production deployments
- Implement authentication middleware for API routes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues or questions, please open an issue on the repository.

---

**Built with ❤️ for Shopify merchants**
