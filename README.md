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
