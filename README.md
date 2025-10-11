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

### Basic Import
```typescript
import { 
  PendingOrder, 
  PositionLifecycleState, 
  AutoTradingSettings,
  DateTimeType 
} from '@smart-weave/sw-trading-types';
```

### Example Usage

#### Working with Pending Orders
```typescript
import { PendingOrder, OrderSide, OrderType } from '@smart-weave/sw-trading-types';

const order: PendingOrder = {
  id: 'order-123',
  symbol: 'BTCUSDT',
  side: OrderSide.BUY,
  type: OrderType.LIMIT,
  quantity: 1.5,
  price: 45000,
  status: 'pending',
  createdAt: new Date(),
  // ... other required fields
};
```

#### Position Lifecycle Management
```typescript
import { PositionLifecycleState } from '@smart-weave/sw-trading-types';

const currentState: PositionLifecycleState = PositionLifecycleState.MONITORING;
```

#### Auto Trading Settings
```typescript
import { AutoTradingSettings } from '@smart-weave/sw-trading-types';

const settings: AutoTradingSettings = {
  enabled: true,
  maxPositionSize: 10000,
  riskLevel: 'medium',
  // ... other settings
};
```

## Available Types

### Core Types
- `PendingOrder` - Represents an unfilled trading order
- `PositionLifecycleState` - Enum for position states (OPENED, MONITORING, CLOSING, etc.)
- `AutoTradingSettings` - Configuration for automated trading
- `DateTimeType` - Flexible datetime type for different runtime environments

### Enums
- `OrderSide` - BUY or SELL
- `OrderType` - MARKET, LIMIT, STOP, etc.
- `OrderStatus` - Order execution status

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

This package is published to npm as a public package. To publish a new version:

1. Update the version in `package.json`
2. Run `npm publish`

The package will automatically build before publishing thanks to the `prepublishOnly` script.

## License

MIT

## Repository

[GitHub Repository](https://github.com/smart-weave/sw-trading-types)
