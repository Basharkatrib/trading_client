# Reverb Setup Instructions

## Backend (Laravel)

### 1. Configure .env
Add these to your Laravel `.env`:
```
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=your-app-id
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
```

### 2. Start Reverb Server
```bash
cd C:\Users\dell\Herd\trading
php artisan reverb:start
```

### 3. Start Broadcasting Prices (in another terminal)
```bash
cd C:\Users\dell\Herd\trading
php artisan prices:broadcast
```

## Frontend (Next.js)

### 1. Create .env.local
Create `C:\Users\dell\Desktop\Files\trading_client\.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://trading.test/api
NEXT_PUBLIC_REVERB_APP_KEY=your-app-key
NEXT_PUBLIC_REVERB_HOST=localhost
NEXT_PUBLIC_REVERB_PORT=8080
NEXT_PUBLIC_REVERB_SCHEME=http
```

### 2. Start Next.js
```bash
cd C:\Users\dell\Desktop\Files\trading_client
npm run dev
```

## Testing
1. Open http://localhost:3000
2. You should see "Live Market Prices" section
3. Prices should update every second with green/red animations
4. Status indicator should show "Connected" with green pulse

## Currencies Broadcasting
- BTC/USD
- ETH/USD
- XAU/USD (Gold)
- EUR/USD
- GBP/USD
- JPY/USD


