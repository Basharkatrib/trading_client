# Trading System Setup Guide

## Overview
Complete trading platform with real-time position management, SL/TP automation, and live P&L updates via Laravel Reverb.

## Features
- ✅ Multiple currency pairs (BTC/USD, ETH/USD, XAU/USD, EUR/USD, GBP/USD, JPY/USD)
- ✅ Real-time candlestick charts
- ✅ BUY/SELL positions with Stop Loss and Take Profit
- ✅ Live P&L updates via WebSocket
- ✅ Automatic position closure when SL/TP is hit
- ✅ Wallet balance tracking
- ✅ Private channel broadcasting for user-specific position updates

## Backend Setup (Laravel)

### 1. Database is Ready
Migrations have been run:
- `wallets` table (user_id, balance, currency)
- `positions` table (user_id, symbol, type, entry_price, quantity, SL, TP, status, etc.)

### 2. Start Required Services

**Terminal 1: Reverb Server**
```bash
cd C:\Users\dell\Herd\trading
php artisan reverb:start
```

**Terminal 2: Price Broadcasting**
```bash
cd C:\Users\dell\Herd\trading
php artisan prices:broadcast
```

**Terminal 3: Position Monitoring (Auto SL/TP)**
```bash
cd C:\Users\dell\Herd\trading
php artisan positions:update
```

### 3. API Endpoints

#### Wallet
- `GET /api/wallet` - Get user's wallet balance

#### Positions
- `GET /api/positions` - List all positions (open + recent closed)
- `POST /api/positions` - Open new position
  ```json
  {
    "symbol": "BTC/USD",
    "type": "BUY",
    "entry_price": 43500.00,
    "quantity": 0.01,
    "stop_loss": 43000.00,  // optional
    "take_profit": 44000.00  // optional
  }
  ```
- `POST /api/positions/{id}/close` - Manually close position
- `DELETE /api/positions/{id}` - Cancel position

#### Broadcasting
- `POST /api/broadcasting/auth` - Authenticate for private channels (requires Bearer token)

## Frontend Setup (Next.js)

### 1. Start Development Server
```bash
cd C:\Users\dell\Desktop\Files\trading_client
npm run dev
```

### 2. Access the Platform
- Home: http://localhost:3000
- Trading: http://localhost:3000/trading (requires login)
- Login: http://localhost:3000/login
- Register: http://localhost:3000/register

### 3. Trading Page Features

#### Sidebar
- Currency pair selector
- Wallet balance display (updates in real-time)

#### Main Area
- **Chart**: Live candlestick chart for selected pair
- **Order Form**: 
  - BUY/SELL buttons
  - Quantity input
  - Stop Loss (optional)
  - Take Profit (optional)
  - Current price display
- **Positions Table**:
  - Open positions with live P&L
  - Recent closed positions
  - Manual close button

## How It Works

### Opening a Position
1. User selects currency pair from sidebar
2. Chart displays live candles for that pair
3. User enters quantity, optional SL/TP
4. Clicks BUY or SELL
5. Backend validates balance, deducts margin
6. Position created with status "open"

### Real-time Updates
1. `BroadcastPrices` command generates random prices every second
2. Prices cached and broadcast to public `prices` channel
3. `UpdatePositionsCommand` reads cached prices
4. Updates each open position's `current_price` and `profit_loss`
5. Checks if SL or TP is hit
6. If hit, closes position automatically and updates wallet
7. Broadcasts position update to private `positions.{userId}` channel
8. Frontend receives update via Echo and updates UI

### Closing a Position
**Automatic:**
- When price hits Stop Loss → position closed, loss deducted
- When price hits Take Profit → position closed, profit added

**Manual:**
- User clicks "Close" button
- Position closed at current price
- P&L calculated and added to wallet

### Wallet Management
- Initial balance: $10,000
- Opening position: margin deducted (entry_price × quantity)
- Closing position: margin + P&L returned
- Balance updates in real-time

## Architecture

### Backend Commands
1. **BroadcastPrices**: Generates random prices, caches them, broadcasts to public channel
2. **UpdatePositions**: Monitors open positions, updates P&L, checks SL/TP, broadcasts to private channels

### Frontend Components
1. **TradingPage**: Main layout with sidebar and content area
2. **TradingChart**: Candlestick chart with live updates
3. **OrderForm**: Position entry form with validation
4. **PositionsTable**: Live positions with P&L, close button
5. **WalletDisplay**: Balance with real-time updates

### WebSocket Channels
- **Public**: `prices` - All users receive live price updates
- **Private**: `positions.{userId}` - User-specific position updates

## Testing Flow

1. **Register/Login** at http://localhost:3000/register
2. **Navigate to Trading** page
3. **Select a currency pair** (e.g., BTC/USD)
4. **Open a position**:
   - Quantity: 0.01
   - Stop Loss: 43000 (if current price is ~43500)
   - Take Profit: 44000
   - Click BUY
5. **Watch the magic**:
   - Position appears in "Open Positions" table
   - P&L updates every second
   - If price drops to 43000 → auto-closes at loss
   - If price rises to 44000 → auto-closes at profit
6. **Check wallet** - balance updated with P&L

## Troubleshooting

### Positions not updating
- Ensure `php artisan positions:update` is running
- Check `php artisan reverb:start` is active
- Verify prices are being broadcast (check Terminal 2 logs)

### Private channel auth fails
- Ensure user is logged in with valid token
- Check `/api/broadcasting/auth` endpoint is accessible
- Verify token is passed to `getEcho(token)` in PositionsTable

### Prices not showing in OrderForm
- Ensure `php artisan prices:broadcast` is running
- Check browser console for WebSocket connection
- Verify public `prices` channel is subscribed

## Next Steps
- Add more currency pairs
- Implement leverage
- Add order history
- Create profit/loss reports
- Add notifications for closed positions
- Implement market/limit orders


