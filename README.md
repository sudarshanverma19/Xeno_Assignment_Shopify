# Shopify Analytics Dashboard

A full-stack multi-tenant analytics platform for syncing and visualizing Shopify store data with real-time insights, automated data ingestion, and comprehensive business metrics.

## 🌟 Features

- **Multi-tenant Architecture** - Support for multiple Shopify stores with isolated data
- **Automated Data Sync** - Scheduled background jobs sync data every 6 hours
- **Real-time Analytics** - Interactive dashboard with 6 chart visualizations
- **RESTful API** - Comprehensive API endpoints for data access
- **Responsive Design** - Modern UI with gradient backgrounds and hover effects
- **Currency Localization** - Support for INR (₹) currency format

## 🏗️ Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Login      │  │  Dashboard   │  │   Charts     │         │
│  │   Component  │  │  Component   │  │  (Recharts)  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                 │
│                           │                                      │
│                    API Service Layer                             │
│                           │                                      │
└───────────────────────────┼──────────────────────────────────────┘
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (Node.js/Express)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     API Routes Layer                      │  │
│  │  /tenants  │  /ingestion  │  /metrics  │  /webhooks     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Service Layer                           │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │   Shopify    │  │  Analytics   │  │    Cron      │  │  │
│  │  │   Service    │  │   Service    │  │   Service    │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│                    Prisma ORM Layer                              │
│                           │                                      │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                PostgreSQL Database (Neon)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ tenants  │  │ products │  │customers │  │  orders  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
                            ▲
                            │
                    Shopify Admin API
                  (2024-01 REST API)
```

### Data Flow

1. **Authentication**: User logs in → Backend validates credentials → Returns tenant info
2. **Data Ingestion**: User clicks "Sync" → Backend fetches from Shopify API → Stores in PostgreSQL
3. **Analytics**: Dashboard requests metrics → Backend aggregates data → Returns formatted JSON
4. **Scheduled Sync**: Cron job runs every 6 hours → Auto-syncs all tenant data

## 🛠️ Tech Stack

**Backend:** 
- Node.js v16+
- Express v4.18
- Prisma ORM v5.22
- PostgreSQL (Neon)
- Axios v1.7
- node-cron v3.0

**Frontend:** 
- React v18.2
- React Router v6.21
- Recharts v2.10
- Axios v1.6

**Deployment:**
- Backend: Render
- Frontend: Vercel
- Database: Neon PostgreSQL

## 📋 Setup Instructions

### Prerequisites

- **Node.js** v16 or higher
- **PostgreSQL** database (or Neon account)
- **Shopify Store** with Admin API access
- **Git** for version control

### Step 1: Clone Repository

```bash
git clone https://github.com/sudarshanverma19/Xeno_Assignment_Shopify.git
cd Xeno_Assignment_Shopify
```

### Step 2: Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** in the `backend` directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

   # Server
   PORT=5000
   NODE_ENV=development

   # CORS
   FRONTEND_URL=http://localhost:3000

   # Shopify Credentials
   SHOPIFY_STORE_URL=your-store.myshopify.com
   SHOPIFY_ACCESS_TOKEN=shpat_your_access_token_here
   ```

4. **Get Shopify Admin API Access Token**:
   - Go to Shopify Admin → Settings → Apps and sales channels
   - Click "Develop apps" → "Create an app"
   - Configure Admin API scopes: `read_products`, `read_customers`, `read_orders`
   - Install the app and copy the Admin API access token
   - **Important**: Use API version **2024-01**

5. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

6. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

7. **Start development server**
   ```bash
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

### Step 3: Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** in the `frontend` directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

4. **Start development server**
   ```bash
   npm start
   ```
   Frontend will run on `http://localhost:3000`

### Step 4: Initial Data Sync

1. Open browser and navigate to `http://localhost:3000`
2. Login with default credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Click **"Sync Data"** button to fetch data from Shopify
4. Dashboard will populate with your store's data

## 🔌 API Endpoints

Base URL: `http://localhost:5000/api`

### Authentication & Tenants

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/tenants/login` | User login | `{ email, password }` | `{ success, tenant: {...} }` |
| GET | `/tenants` | Get all tenants | - | `[{ id, shopUrl, email, ... }]` |
| POST | `/tenants` | Create new tenant | `{ shopUrl, accessToken, email }` | `{ id, shopUrl, ... }` |
| GET | `/tenants/:id` | Get tenant by ID | - | `{ id, shopUrl, email, ... }` |
| PUT | `/tenants/:id` | Update tenant | `{ email, isActive }` | `{ success, tenant }` |

### Data Ingestion

| Method | Endpoint | Description | Query Params | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/ingestion/sync-all` | Sync all data from Shopify | `{ tenantId }` | `{ success, results: {...} }` |
| GET | `/ingestion/products` | Get synced products | `tenantId` | `[{ id, title, price, ... }]` |
| GET | `/ingestion/customers` | Get synced customers | `tenantId` | `[{ id, firstName, lastName, ... }]` |
| GET | `/ingestion/orders` | Get synced orders | `tenantId` | `[{ id, orderNumber, totalPrice, ... }]` |

### Analytics Metrics

| Method | Endpoint | Description | Query Params | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/metrics/overview` | Get dashboard overview | `tenantId` | `{ totalCustomers, totalOrders, totalRevenue }` |
| GET | `/metrics/orders-by-date` | Orders timeline | `tenantId, range` | `[{ date, orders, revenue }]` |
| GET | `/metrics/top-customers` | Top customers by spend | `tenantId, limit` | `[{ id, name, totalSpent, ordersCount }]` |
| GET | `/metrics/top-products` | Top products by stock | `tenantId, limit` | `[{ id, title, inventoryQuantity }]` |
| GET | `/metrics/product-breakdown` | Product category breakdown | `tenantId` | `[{ name, value }]` |
| GET | `/metrics/inventory-alerts` | Low/high stock alerts | `tenantId` | `{ lowStock: [...], highStock: [...] }` |

### Webhooks (Future Enhancement)

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| POST | `/webhooks/products/create` | Shopify product created | `{ received: true }` |
| POST | `/webhooks/orders/create` | Shopify order created | `{ received: true }` |
| POST | `/webhooks/customers/create` | Shopify customer created | `{ received: true }` |

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                             TENANTS                                 │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ id (UUID, PK)                                              │    │
│  │ shop_url (String, Unique)                                  │    │
│  │ access_token (String)                                      │    │
│  │ email (String)                                             │    │
│  │ is_active (Boolean)                                        │    │
│  │ created_at (DateTime)                                      │    │
│  │ updated_at (DateTime)                                      │    │
│  └────────────────────────────────────────────────────────────┘    │
│                      │                                              │
│         ┌────────────┴────────────┬─────────────────┐              │
│         ▼                         ▼                 ▼              │
│  ┌─────────────┐         ┌──────────────┐   ┌─────────────┐      │
│  │  PRODUCTS   │         │  CUSTOMERS   │   │   ORDERS    │      │
│  └─────────────┘         └──────────────┘   └─────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

### Table Schemas

#### `tenants`
Stores Shopify store credentials and configuration.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `shop_url` | VARCHAR | Shopify store URL (e.g., mystore.myshopify.com) |
| `access_token` | VARCHAR | Shopify Admin API access token |
| `email` | VARCHAR | Tenant admin email |
| `is_active` | BOOLEAN | Whether tenant is active (default: true) |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

**Indexes**: `shop_url` (unique)

#### `products`
Stores product catalog from Shopify.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (from Shopify) |
| `tenant_id` | UUID | Foreign key → tenants.id |
| `title` | VARCHAR | Product name |
| `body_html` | TEXT | Product description (HTML) |
| `vendor` | VARCHAR | Product vendor/brand |
| `product_type` | VARCHAR | Product category |
| `handle` | VARCHAR | URL-friendly identifier |
| `status` | VARCHAR | Product status (active/draft/archived) |
| `published_at` | TIMESTAMP | Publication date |
| `variants_count` | INTEGER | Number of variants |
| `price` | DECIMAL | Product price |
| `compare_at_price` | DECIMAL | Original price (for discounts) |
| `inventory_quantity` | INTEGER | Stock quantity |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

**Indexes**: `tenant_id`

#### `customers`
Stores customer information and spending history.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (from Shopify) |
| `tenant_id` | UUID | Foreign key → tenants.id |
| `email` | VARCHAR | Customer email |
| `first_name` | VARCHAR | First name |
| `last_name` | VARCHAR | Last name |
| `orders_count` | INTEGER | Total orders placed (default: 0) |
| `total_spent` | DECIMAL | Lifetime value (default: 0) |
| `phone` | VARCHAR | Phone number |
| `verified_email` | BOOLEAN | Email verification status |
| `state` | VARCHAR | Customer state/region |
| `note` | TEXT | Admin notes |
| `currency` | VARCHAR | Currency code (e.g., INR) |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

**Indexes**: `tenant_id`, `email`

#### `orders`
Stores order transaction records.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (from Shopify) |
| `tenant_id` | UUID | Foreign key → tenants.id |
| `customer_id` | UUID | Foreign key → customers.id (nullable) |
| `email` | VARCHAR | Order email |
| `order_number` | INTEGER | Sequential order number |
| `financial_status` | VARCHAR | Payment status (paid/pending/refunded) |
| `fulfillment_status` | VARCHAR | Shipping status (fulfilled/pending) |
| `total_price` | DECIMAL | Total order amount |
| `subtotal_price` | DECIMAL | Subtotal before tax/shipping |
| `total_tax` | DECIMAL | Total tax amount |
| `total_discounts` | DECIMAL | Total discounts applied |
| `currency` | VARCHAR | Currency code |
| `line_items_count` | INTEGER | Number of products ordered |
| `total_weight` | INTEGER | Total weight (grams) |
| `cancelled_at` | TIMESTAMP | Cancellation timestamp |
| `closed_at` | TIMESTAMP | Order closure timestamp |
| `processed_at` | TIMESTAMP | Processing timestamp |
| `created_at` | TIMESTAMP | Order creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

**Indexes**: `tenant_id`, `customer_id`, `created_at`

### Database Relationships

- **One-to-Many**: `tenants` → `products` (One tenant has many products)
- **One-to-Many**: `tenants` → `customers` (One tenant has many customers)
- **One-to-Many**: `tenants` → `orders` (One tenant has many orders)
- **One-to-Many**: `customers` → `orders` (One customer has many orders)
- **Cascade Delete**: Deleting a tenant removes all associated products, customers, and orders

## 📊 Dashboard Features

The analytics dashboard provides 6 interactive visualizations:

1. **Orders Over Time** - Line chart showing order trends and revenue over 7/30/90 days
2. **Top 5 Customers by Spend** - Bar chart with colorful bars showing highest-value customers
3. **Top 5 Products (Lowest Stock)** - Bar chart highlighting products needing restocking
4. **Product Inventory Breakdown** - Pie chart showing product distribution with percentages
5. **Critical Low Stock Alert** - Red-bordered section listing products below threshold
6. **Excess Stock Warning** - Yellow-bordered section listing overstocked products

### Enhanced Chart Features
- **Thick lines (3px)** for better visibility
- **Large interactive dots (5px, 7px on hover)** on line charts
- **Rounded bar corners** for modern look
- **Color-coded bars** from predefined palette
- **Percentage labels** on pie charts
- **Custom tooltips** with rounded corners and shadows
- **Gradient backgrounds** and hover effects
- **Responsive design** for all screen sizes

## 🚀 Usage

1. **Login**: Navigate to `http://localhost:3000` and login with `admin@example.com` / `admin123`
2. **Sync Data**: Click the **"Sync Data"** button to fetch latest data from Shopify
3. **View Analytics**: Explore 6 interactive charts showing business insights
4. **Change Date Range**: Use dropdown to view orders over 7, 30, or 90 days
5. **Monitor Inventory**: Check low stock and excess stock alerts

## 📁 Project Structure

```
Shopify/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema definition
│   │   └── migrations/             # Database migration files
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js         # Prisma client configuration
│   │   ├── routes/
│   │   │   ├── tenants.js          # Tenant management routes
│   │   │   ├── ingestion.js        # Data sync routes
│   │   │   ├── analytics.js        # Metrics endpoints
│   │   │   └── webhooks.js         # Webhook handlers
│   │   ├── services/
│   │   │   ├── shopifyService.js   # Shopify API integration
│   │   │   ├── analyticsService.js # Business metrics logic
│   │   │   └── cronService.js      # Scheduled job management
│   │   ├── middleware/
│   │   │   └── errorHandler.js     # Global error handling
│   │   └── index.js                # Express app entry point
│   ├── .env                        # Environment variables
│   ├── package.json                # Dependencies
│   └── README.md                   # Backend documentation
│
├── frontend/
│   ├── public/
│   │   └── index.html              # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js            # Login component
│   │   │   ├── Login.css           # Login styles
│   │   │   ├── Dashboard.js        # Main dashboard component
│   │   │   └── Dashboard.css       # Dashboard styles (gradients, charts)
│   │   ├── services/
│   │   │   └── api.js              # Axios API client
│   │   ├── App.js                  # Root component with routing
│   │   ├── App.css                 # Global styles
│   │   └── index.js                # React entry point
│   ├── .env                        # Environment variables
│   ├── package.json                # Dependencies
│   └── README.md                   # Frontend documentation
│
└── README.md                       # This file
```

## ⚠️ Known Limitations and Assumptions

### Limitations

1. **API Version**: Currently uses Shopify Admin API **v2024-01**. Newer versions may require code updates.

2. **Pagination**: Product/customer/order fetching is limited to 250 items per request. Full pagination with `page_info` is not fully implemented.

3. **Webhook Integration**: Webhook endpoints are defined but not fully integrated. Real-time updates require manual sync clicks.

4. **Authentication**: Uses simple email/password authentication without JWT tokens or session management.

5. **Single Currency**: Dashboard displays currency in INR (₹). Multi-currency support not implemented.

6. **Customer Aggregation**: `totalSpent` calculation may show 0 for some customers due to order-customer linking issues.

7. **Date Filtering**: Orders by date only supports 7/30/90 day ranges. Custom date selection not available.

8. **No Product Images**: Dashboard does not display product images from Shopify.

9. **Limited Error Handling**: Some API errors may not provide user-friendly messages.

10. **No Data Export**: Cannot export analytics data to CSV/Excel.

### Assumptions

1. **Single Store per Tenant**: Each tenant is associated with one Shopify store.

2. **Admin Credentials**: Assumes default admin account exists (`admin@example.com` / `admin123`).

3. **Environment Variables**: Assumes `.env` files are properly configured before running.

4. **Database Access**: Assumes PostgreSQL database is accessible and properly configured.

5. **Shopify Permissions**: Assumes Shopify app has been granted `read_products`, `read_customers`, and `read_orders` scopes.

6. **Network Connectivity**: Assumes stable internet connection for Shopify API calls.

7. **Port Availability**: Assumes ports 3000 (frontend) and 5000 (backend) are available.

8. **Node Version**: Assumes Node.js v16+ is installed on the system.

9. **Browser Compatibility**: Assumes modern browser with ES6+ support.

10. **Data Privacy**: Assumes tenant data isolation is sufficient for security requirements.

## 🔒 Security Considerations

- Store Shopify access tokens securely in environment variables
- Never commit `.env` files to version control
- Use HTTPS in production for API communication
- Implement proper authentication and authorization
- Sanitize user inputs to prevent SQL injection
- Rate limit API endpoints to prevent abuse
- Regularly update dependencies for security patches

## 🐛 Troubleshooting

### Common Issues

**Issue**: "401 Unauthorized" when syncing data
- **Solution**: Verify Shopify access token is correct and has required permissions

**Issue**: Charts show "No data available"
- **Solution**: Click "Sync Data" button to fetch data from Shopify

**Issue**: "EADDRINUSE: address already in use"
- **Solution**: Kill process using the port or change PORT in `.env`

**Issue**: Database connection errors
- **Solution**: Check `DATABASE_URL` in `.env` and ensure database is running

**Issue**: Frontend shows "Unknown" for customer names
- **Solution**: Run `node backend/check-customer-names.js` to update customer data

## 📝 License

MIT License - feel free to use this project for learning and commercial purposes.

## 👨‍💻 Author

**Sudarshan Verma**
- GitHub: [@sudarshanverma19](https://github.com/sudarshanverma19)
- Project: [Xeno_Assignment_Shopify](https://github.com/sudarshanverma19/Xeno_Assignment_Shopify)

## 🙏 Acknowledgments

- Shopify Admin API Documentation
- Recharts for beautiful chart visualizations
- Neon for PostgreSQL hosting
- Render and Vercel for deployment platforms
