# Shopify Data Ingestion Setup Script

Write-Host "🚀 Starting Shopify Data Ingestion Setup..." -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js v16+ first." -ForegroundColor Red
    exit 1
}

# Check PostgreSQL
try {
    $pgVersion = psql --version
    Write-Host "✓ PostgreSQL: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠ PostgreSQL not found. Please ensure it's installed and running." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Setting up Backend..." -ForegroundColor Cyan
Write-Host ""

# Backend setup
Set-Location backend

Write-Host "Installing backend dependencies..."
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Backend installation failed" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Backend dependencies installed" -ForegroundColor Green

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host ""
    Write-Host "⚠ .env file not found. Please configure your database:" -ForegroundColor Yellow
    Write-Host "  1. Copy .env.example to .env"
    Write-Host "  2. Update DATABASE_URL with your PostgreSQL credentials"
    Write-Host "  3. Run this script again"
    Write-Host ""
    Copy-Item .env.example .env
    Write-Host "Created .env file from template. Please edit it and run again." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Running database migrations..."
npx prisma migrate dev --name init

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Database migration failed. Check your DATABASE_URL." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Database migrated successfully" -ForegroundColor Green

Write-Host ""
Write-Host "Seeding database..."
npm run seed

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Database seeding failed" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Database seeded successfully" -ForegroundColor Green

# Return to root
Set-Location ..

Write-Host ""
Write-Host "📦 Setting up Frontend..." -ForegroundColor Cyan
Write-Host ""

# Frontend setup
Set-Location frontend

Write-Host "Installing frontend dependencies..."
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Frontend installation failed" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green

# Check frontend .env
if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✓ Created frontend .env file" -ForegroundColor Green
}

# Return to root
Set-Location ..

Write-Host ""
Write-Host "✅ Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Start backend:  cd backend && npm run dev"
Write-Host "  2. Start frontend: cd frontend && npm start"
Write-Host "  3. Open browser:   http://localhost:3000"
Write-Host "  4. Login with:     admin@example.com"
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "  - Quick Start:   QUICKSTART.md"
Write-Host "  - Full Guide:    README.md"
Write-Host "  - API Docs:      README.md#api-documentation"
Write-Host "  - Deployment:    DEPLOYMENT.md"
Write-Host ""
Write-Host "Happy coding! 🎉" -ForegroundColor Magenta
