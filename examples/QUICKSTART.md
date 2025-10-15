# Performance Management Quick Start

Get started with position performance management in 5 minutes.

## Installation

```bash
npm install @smart-weave/sw-trading-types
```

## Step 1: Implement CRUD Interface

Choose your platform and implement the `PerformanceCRUD` interface:

### Option A: Firebase Functions (Admin SDK)

```typescript
import { getFirestore } from 'firebase-admin/firestore';
import { PerformanceCRUD } from '@smart-weave/sw-trading-types';

const db = getFirestore();

export const performanceCRUD: PerformanceCRUD = {
  async get(collection, docId) {
    const doc = await db.collection(collection).doc(docId).get();
    return doc.exists ? doc.data() : null;
  },
  async create(collection, docId, data) {
    await db.collection(collection).doc(docId).set(data);
  },
  async update(collection, docId, data) {
    await db.collection(collection).doc(docId).set(data, { merge: true });
  }
};
```

### Option B: Next.js (Firestore Web SDK)

```typescript
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { PerformanceCRUD } from '@smart-weave/sw-trading-types';

const db = getFirestore();

export const performanceCRUD: PerformanceCRUD = {
  async get(collection, docId) {
    const docRef = doc(db, collection, docId);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? snapshot.data() : null;
  },
  async create(collection, docId, data) {
    await setDoc(doc(db, collection, docId), data);
  },
  async update(collection, docId, data) {
    await setDoc(doc(db, collection, docId), data, { merge: true });
  }
};
```

## Step 2: Call on Position Liquidation

When a position is liquidated, call `processPositionLiquidation`:

```typescript
import { 
  processPositionLiquidation,
  PositionLiquidationInfo 
} from '@smart-weave/sw-trading-types';
import { performanceCRUD } from './crud'; // from Step 1

// Example: When liquidating a position
async function onPositionLiquidated(position: Position) {
  const liquidationInfo: PositionLiquidationInfo = {
    userId: position.userId,
    positionId: position.id,
    symbol: position.symbol,
    name: position.name,
    openPrice: position.openPrice,
    closePrice: position.closePrice,
    amount: position.amount,
    openDate: position.openDate,
    closeDate: new Date(),
    fee: position.fee || 0,
    realizedPL: calculatePL(position),
    plRatio: calculatePLRatio(position)
  };

  const result = await processPositionLiquidation(liquidationInfo, {
    crud: performanceCRUD
  });

  if (result.success) {
    console.log('✅ Performance updated:', result.updatedPeriods);
  } else {
    console.error('❌ Update failed:', result.error);
  }
}
```

## Step 3: Read Performance Data

### Read Today's Performance

```typescript
import { PerformanceRecord } from '@smart-weave/sw-trading-types';

async function getTodayPerformance(userId: string): Promise<PerformanceRecord | null> {
  const today = new Date();
  const periodKey = today.toISOString().split('T')[0]; // YYYY-MM-DD
  const docId = `${userId}_${periodKey}`;
  
  return performanceCRUD.get<PerformanceRecord>('daily_performance', docId);
}

// Usage
const todayStats = await getTodayPerformance('user123');
if (todayStats) {
  console.log(`Win rate: ${todayStats.stats.winRate}%`);
  console.log(`Total P/L: ${todayStats.stats.totalRealizedPL}`);
}
```

### Read Monthly Performance

```typescript
async function getMonthlyPerformance(userId: string, year: number, month: number) {
  const periodKey = `${year}-${String(month).padStart(2, '0')}`;
  const docId = `${userId}_${periodKey}`;
  
  return performanceCRUD.get<PerformanceRecord>('monthly_performance', docId);
}

// Usage
const septemberStats = await getMonthlyPerformance('user123', 2025, 9);
```

### Read Overall Performance

```typescript
async function getOverallPerformance(userId: string) {
  const docId = `${userId}_overall`;
  return performanceCRUD.get<PerformanceRecord>('overall_performance', docId);
}

// Usage
const allTimeStats = await getOverallPerformance('user123');
```

## Step 4: Display in UI (React Example)

```typescript
import { useEffect, useState } from 'react';
import { PerformanceRecord } from '@smart-weave/sw-trading-types';

export function PerformanceCard({ userId }: { userId: string }) {
  const [performance, setPerformance] = useState<PerformanceRecord | null>(null);

  useEffect(() => {
    getTodayPerformance(userId).then(setPerformance);
  }, [userId]);

  if (!performance) return <div>No trades today</div>;

  const { stats } = performance;

  return (
    <div className="card">
      <h3>Today's Performance</h3>
      <div>Trades: {stats.totalTrades}</div>
      <div>Win Rate: {stats.winRate.toFixed(1)}%</div>
      <div>
        Total P/L: 
        <span className={stats.totalRealizedPL >= 0 ? 'profit' : 'loss'}>
          {stats.totalRealizedPL.toLocaleString()}원
        </span>
      </div>
      <div>Avg Return: {stats.averagePLRatio.toFixed(2)}%</div>
    </div>
  );
}
```

## Common Patterns

### Pattern 1: Firebase Cloud Function Trigger

```typescript
export const onPositionUpdate = functions.firestore
  .document('positions/{userId}/positions/{positionId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    if (before.lifecycleStatus !== 'liquidated' && 
        after.lifecycleStatus === 'liquidated') {
      
      await processPositionLiquidation({
        userId: context.params.userId,
        positionId: context.params.positionId,
        symbol: after.symbol,
        name: after.name,
        openPrice: after.openPrice,
        closePrice: after.closePrice,
        amount: after.amount,
        openDate: after.openDate,
        closeDate: after.closeDate,
        fee: after.fee,
        realizedPL: after.netPL,
        plRatio: after.plRatio
      }, { crud: performanceCRUD });
    }
  });
```

### Pattern 2: Real-time Updates in Next.js

```typescript
import { onSnapshot, doc } from 'firebase/firestore';

export function usePerformance(userId: string, period: 'daily' | 'monthly' | 'overall') {
  const [performance, setPerformance] = useState<PerformanceRecord | null>(null);

  useEffect(() => {
    const periodKey = getCurrentPeriodKey(period);
    const docId = `${userId}_${periodKey}`;
    const collectionName = `${period}_performance`;

    const unsubscribe = onSnapshot(
      doc(db, collectionName, docId),
      (snapshot) => {
        setPerformance(snapshot.exists() ? snapshot.data() as PerformanceRecord : null);
      }
    );

    return () => unsubscribe();
  }, [userId, period]);

  return performance;
}
```

## Available Statistics

Each `PerformanceRecord` includes these statistics:

| Metric | Description | Type |
|--------|-------------|------|
| `totalTrades` | Total number of completed trades | number |
| `winCount` | Number of profitable trades | number |
| `loseCount` | Number of losing trades | number |
| `winRate` | Win rate percentage | number |
| `totalRealizedPL` | Total profit/loss | number |
| `averagePL` | Average profit/loss per trade | number |
| `averagePLRatio` | Average return percentage | number |
| `maxProfit` | Largest single profit | number |
| `maxLoss` | Largest single loss | number |
| `totalFee` | Total fees paid | number |
| `totalInvestment` | Total capital invested | number |
| `totalProfit` | Sum of all profits | number |
| `totalLoss` | Sum of all losses | number |
| `profitLossRatio` | Risk-reward ratio | number \| undefined |

## Firestore Collections

The system creates these collections automatically:

```
daily_performance/
  {userId}_2025-10-14
  {userId}_2025-10-15
  ...

weekly_performance/
  {userId}_2025-W42
  {userId}_2025-W43
  ...

monthly_performance/
  {userId}_2025-10
  {userId}_2025-11
  ...

yearly_performance/
  {userId}_2025
  {userId}_2026
  ...

overall_performance/
  {userId}_overall
```

## Next Steps

- 📖 Read [examples/performance-management.md](./performance-management.md) for detailed examples
- 🏗️ Read [examples/ARCHITECTURE.md](./ARCHITECTURE.md) to understand the design
- 💡 Check the main [README.md](../README.md) for package information

## Troubleshooting

### Issue: Permission Denied

Make sure your Firestore security rules allow reading/writing performance collections:

```javascript
match /daily_performance/{docId} {
  allow read: if request.auth.uid == docId.split('_')[0];
  allow write: if request.auth != null; // or restrict to Functions only
}
```

### Issue: Data Not Updating

Check that:
1. CRUD functions are correctly implemented
2. `closeDate` is a valid Date or Timestamp
3. `userId` and `positionId` are not empty
4. Check console for error messages

### Issue: Wrong Time Period

Verify:
1. Server timezone is correct
2. `closeDate` is in the expected timezone
3. Use `getCurrentTime` config option for testing:

```typescript
await processPositionLiquidation(liquidationInfo, {
  crud: performanceCRUD,
  getCurrentTime: () => new Date('2025-10-14T10:00:00Z')
});
```

## Support

For issues or questions:
- GitHub Issues: [smart-weave/sw-trading-types/issues](https://github.com/smart-weave/sw-trading-types/issues)
- Documentation: [README.md](../README.md)
