# @smart-weave/sw-trading-types

TypeScript types for Smart Weave trading system. This package provides shared type definitions for trading operations, orders, and position lifecycle management.

## Installation

### Using pnpm (recommended)
```bash
pnpm add @smart-weave/sw-trading-types
```

### Using npm
```bash
npm install @smart-weave/sw-trading-types
```

### Using yarn
```bash
yarn add @smart-weave/sw-trading-types
```

## Usage

### Basic Import (All Types)
```typescript
import { 
  // Common types
  Timestamp, 
  
  // Trading types
  PendingOrder, 
  AutoTradingSettings,
  TradingLog,
  
  // Position types
  Position,
  PositionLifecycleStatus,
  
  // Constants
  FIRESTORE_COLLECTIONS,
  ACTION_TYPES
} from '@smart-weave/sw-trading-types';
```

### Structured Imports (Recommended)
```typescript
// Import by category for better organization
import { Timestamp, FIRESTORE_COLLECTIONS } from '@smart-weave/sw-trading-types/common';
import { PendingOrder, AutoTradingSettings } from '@smart-weave/sw-trading-types/trading';
import { Position, PositionLifecycleStatus } from '@smart-weave/sw-trading-types/position';
```

### Example Usage

#### Working with Orders
```typescript
import { PendingOrder, OrderType, OrderStatus } from '@smart-weave/sw-trading-types';

const order: PendingOrder = {
  positionId: 'pos-123',
  orderId: 'order-456',
  orderType: 'buy',
  symbol: '005930',
  name: '삼성전자',
  quantity: 10,
  orderPrice: 75000,
  status: 'pending',
  trigger: 'manual',
  createdAt: new Date(),
};
```

#### Position Management
```typescript
import { Position, PositionLifecycleStatus } from '@smart-weave/sw-trading-types';

const position: Position = {
  symbol: '005930',
  name: '삼성전자',
  amount: 10,
  openPrice: 75000,
  lifecycleStatus: 'confirmed',
  openDate: '2025-10-11',
  currentPrice: 77000,
  netPL: 20000,
  plRatio: 2.67
};
```

#### Auto Trading Configuration
```typescript
import { AutoTradingSettings, DEFAULT_AUTO_TRADING_SETTINGS } from '@smart-weave/sw-trading-types';

const settings: AutoTradingSettings = {
  ...DEFAULT_AUTO_TRADING_SETTINGS,
  enabled: true,
  targetSellSettings: {
    enabled: true,
    defaultTargetProfitRate: 15, // 15% profit target
    partialSellEnabled: true,
    partialSellRatio: 50,
    remainingHoldingRate: 50
  }
};
```

## Package Structure

The package is organized into logical modules:

```
@smart-weave/sw-trading-types/
├── common/          # Base types and constants
├── trading/         # Trading operations (orders, automation, logs)
├── position/        # Position management and lifecycle
└── index           # Main export (all types)
```

## Available Types

### Common Types (`/common`)
- `Timestamp` - Universal timestamp type (Date | Firestore timestamp)
- `ModelBase` - Base interface for all domain models
- `FIRESTORE_COLLECTIONS` - Collection path constants
- `ACTION_TYPES` - Trading action constants
- `TRADING_DAY_OPTIONS` - Trading day configuration

### Trading Types (`/trading`)
- `PendingOrder` - Unfilled trading orders
- `AutoTradingSettings` - Automated trading configuration
- `TradingLog` - Trading execution logs
- `OrderStatus` - Order status states (`pending`, `completed`, `failed`, `cancelled`)
- `OrderType` - Order types (`buy`, `sell`)
- `OrderTrigger` - Order triggers (`manual`, `system`)

### Position Types (`/position`)
- `Position` - Complete position model with lifecycle
- `PositionLifecycleStatus` - Detailed position states
- `PositionType` - Position classification
- `PositionStatusDisplayInfo` - UI display information

### Lifecycle States
Position lifecycle includes granular states:
- **Entry**: `entry_order_pending`, `entry_order_failed`, `entry_unconfirmed`
- **Active**: `confirmed` 
- **Exit**: `exit_order_pending`, `exit_order_failed`, `liquidated`
- **Final**: `expired`

## Development

### Building the package
```bash
npm run build
```

### Cleaning build artifacts
```bash
npm run clean
```

## Publishing

This package is published to npm as a public package under the `@smart-weave` organization.

### For Maintainers

#### Prerequisites
1. You must be a member of the `@smart-weave` npm organization
2. You must be logged in to npm: `npm login`
3. Ensure all changes are committed and pushed to GitHub

#### Publishing Steps

1. **Commit all changes**:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push
   ```

2. **Update version** (choose one):
   ```bash
   # For bug fixes (1.0.2 -> 1.0.3)
   npm version patch
   
   # For new features (1.0.2 -> 1.1.0)
   npm version minor
   
   # For breaking changes (1.0.2 -> 2.0.0)
   npm version major
   ```

3. **Publish to npm**:
   ```bash
   npm publish
   ```

#### Automated Build Process
The package automatically:
- Cleans the `dist` folder
- Compiles TypeScript files
- Generates type definitions (`.d.ts` files)
- Creates source maps

#### Version History
- `1.0.0` - Initial release
- `1.0.1` - Package setup and configuration
- `1.0.2` - Added position-model.ts and removed duplicates

### What gets published
- `dist/` - Compiled JavaScript and TypeScript declaration files
- `types/` - Source TypeScript files (for reference)
- `README.md`, `LICENSE`, `package.json`

## License

MIT

## Repository

[GitHub Repository](https://github.com/smart-weave/sw-trading-types)
