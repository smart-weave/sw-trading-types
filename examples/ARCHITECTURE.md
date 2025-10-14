# Position Performance Management Architecture

## Overview

This document explains the architecture and design decisions behind the position performance management system.

## Problem Statement

The original requirement (translated from Korean):
- Next.js and Firebase Functions use different Firestore connection libraries but need to share types
- Define common types and create entry points for operations
- Entry points should provide parameters that can accept CRUD functions appropriate to each framework
- Performance management is divided into daily, weekly, monthly, yearly, and overall tables
- When position liquidation information enters the entry point, calculate each period and call the provided CRUD functions to create or update records
- Provide interfaces and methodologies so Next.js and Functions can implement these CRUDs with the same prototype

## Solution Architecture

### 1. Framework-Agnostic Design

The core challenge is that Next.js uses Firestore Web SDK while Firebase Functions uses Firebase Admin SDK. These have different APIs:

```typescript
// Next.js (Firestore Web SDK)
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// Firebase Functions (Admin SDK)
import { getFirestore } from 'firebase-admin/firestore';
```

**Solution**: Define a simple `PerformanceCRUD` interface that both platforms can implement:

```typescript
export interface PerformanceCRUD {
  get<T = any>(collection: string, docId: string): Promise<T | null>;
  create<T = any>(collection: string, docId: string, data: T): Promise<void>;
  update<T = any>(collection: string, docId: string, data: Partial<T>): Promise<void>;
}
```

This abstraction allows the core logic to be framework-independent.

### 2. Multi-Period Tracking

Performance is tracked across five different time periods:
- **Daily**: Day-by-day performance (e.g., "2025-10-14")
- **Weekly**: Week-by-week (ISO 8601 format, e.g., "2025-W42")
- **Monthly**: Month-by-month (e.g., "2025-10")
- **Yearly**: Year-by-year (e.g., "2025")
- **Overall**: All-time cumulative performance

**Design Decision**: Each period type has its own Firestore collection:
```
daily_performance/
weekly_performance/
monthly_performance/
yearly_performance/
overall_performance/
```

This separation allows:
- Efficient queries for specific time periods
- Easy data lifecycle management (e.g., archive old daily records)
- Parallel writes without conflicts
- Flexible security rules per collection

### 3. Entry Point Function

The `processPositionLiquidation()` function serves as the single entry point:

```typescript
export async function processPositionLiquidation(
  liquidationInfo: PositionLiquidationInfo,
  config: PerformanceManagerConfig
): Promise<PerformanceProcessResult>
```

**Key Features**:
- Takes liquidation info and configuration as input
- Calculates period keys automatically based on closeDate
- Updates all five period types in a single call
- Returns detailed results (success/failure, updated records)
- Handles partial failures gracefully

**Why a function instead of a class?**
- Simpler to use (no instantiation needed)
- Stateless (no side effects between calls)
- Easier to test (pure function with injected dependencies)
- Better tree-shaking in bundlers

### 4. Data Model

#### PerformanceRecord Structure

```typescript
export interface PerformanceRecord extends ModelBase {
  userId: string;
  period: PerformancePeriod;
  periodKey: string;
  startDate?: Timestamp;
  endDate?: Timestamp;
  stats: PerformanceStats;
  liquidatedPositionIds: string[];
}
```

**Document IDs**: `{userId}_{periodKey}` format ensures:
- One record per user per period
- Predictable document paths
- No accidental duplicates
- Easy to query

#### PerformanceStats

Contains all calculated metrics:
```typescript
{
  totalTrades: number;
  winCount: number;
  loseCount: number;
  winRate: number;
  totalRealizedPL: number;
  averagePL: number;
  averagePLRatio: number;
  maxProfit: number;
  maxLoss: number;
  totalFee: number;
  totalInvestment: number;
  totalProfit: number;
  totalLoss: number;
  profitLossRatio?: number;
}
```

### 5. Calculation Logic

#### Initial Stats (First Trade)
When creating a new performance record, initialize stats based on the first trade:
```typescript
function calculateInitialStats(liquidationInfo: PositionLiquidationInfo): PerformanceStats
```

#### Updated Stats (Subsequent Trades)
When updating an existing record, merge new trade data with existing stats:
```typescript
function calculateUpdatedStats(
  existingStats: PerformanceStats,
  liquidationInfo: PositionLiquidationInfo
): PerformanceStats
```

**Important Calculations**:
- **Win Rate**: `(winCount / totalTrades) * 100`
- **Average P/L**: `totalRealizedPL / totalTrades`
- **Profit/Loss Ratio**: `avgProfit / avgLoss` (measures risk-reward efficiency)

### 6. Error Handling Strategy

The system uses graceful degradation:

1. **Individual Period Failures**: If one period fails to update, others continue
2. **Detailed Results**: Return which periods succeeded/failed
3. **No Rollbacks**: Each period update is independent (eventual consistency)

```typescript
interface PerformanceProcessResult {
  success: boolean;
  updatedPeriods: PerformancePeriod[];
  createdRecords: string[];
  updatedRecords: string[];
  error?: string;
}
```

This approach is chosen because:
- Performance updates are not critical transactions
- Partial success is better than complete failure
- Failed periods can be retried independently
- Simplifies implementation (no distributed transactions)

### 7. Time Handling

All time calculations are done using the `closeDate` of the liquidation:

```typescript
const closeDate = liquidationInfo.closeDate instanceof Date
  ? liquidationInfo.closeDate
  : new Date(liquidationInfo.closeDate.seconds * 1000);
```

**Period Key Generation**:
- Daily: `YYYY-MM-DD`
- Weekly: `YYYY-Www` (ISO 8601 week numbering)
- Monthly: `YYYY-MM`
- Yearly: `YYYY`
- Overall: `'overall'` (constant)

**Time Zone Consideration**: All calculations use local server time. For production, consider:
- Storing timezone information in config
- Using UTC consistently
- Converting to user's local timezone in UI

### 8. Testing Strategy

The system is designed to be easily testable:

```typescript
const mockCRUD: PerformanceCRUD = {
  async get(collection, docId) {
    return mockData.get(`${collection}/${docId}`) || null;
  },
  async create(collection, docId, data) {
    mockData.set(`${collection}/${docId}`, data);
  },
  async update(collection, docId, data) {
    const existing = mockData.get(`${collection}/${docId}`) || {};
    mockData.set(`${collection}/${docId}`, { ...existing, ...data });
  }
};

const result = await processPositionLiquidation(liquidationInfo, {
  crud: mockCRUD,
  getCurrentTime: () => new Date('2025-10-14T10:00:00Z')
});
```

## Trade-offs and Future Improvements

### Current Limitations

1. **No Atomic Transactions**: Updates across collections are not atomic
   - **Impact**: Low (performance data is analytical, not transactional)
   - **Mitigation**: Eventual consistency is acceptable

2. **No Retroactive Recalculation**: If stats need correction, no built-in mechanism
   - **Impact**: Medium
   - **Future**: Add `recalculatePerformance()` function

3. **Fixed Time Periods**: Week starts on Monday (ISO 8601)
   - **Impact**: Low (industry standard)
   - **Future**: Add configurable week start day

4. **Memory Usage**: All position IDs stored in array
   - **Impact**: Low for typical usage (100s of trades per period)
   - **Future**: Move to subcollection if needed (1000s of trades)

### Potential Enhancements

1. **Batch Operations**
   ```typescript
   processBatchLiquidations(liquidations: PositionLiquidationInfo[], config)
   ```

2. **Performance Snapshots**
   - Daily snapshots for historical comparison
   - Chart-friendly data structures

3. **Currency Support**
   - Multi-currency tracking
   - Exchange rate conversion

4. **Performance Metrics**
   - Sharpe ratio
   - Maximum drawdown
   - Recovery factor

5. **Comparison Features**
   - Compare periods (this month vs last month)
   - Compare strategies
   - Compare symbols

## Integration Patterns

### Pattern 1: Real-time Updates (Next.js)

```typescript
// Subscribe to performance updates
const unsubscribe = onSnapshot(
  doc(db, 'daily_performance', `${userId}_${todayKey}`),
  (snapshot) => {
    if (snapshot.exists()) {
      setPerformance(snapshot.data() as PerformanceRecord);
    }
  }
);
```

### Pattern 2: Scheduled Updates (Functions)

```typescript
// Daily batch processing
export const dailyPerformanceUpdate = functions.pubsub
  .schedule('0 1 * * *')
  .onRun(async () => {
    // Process all liquidations from previous day
  });
```

### Pattern 3: Event-driven Updates (Functions)

```typescript
// Trigger on position liquidation
export const onPositionLiquidated = functions.firestore
  .document('positions/{userId}/positions/{positionId}')
  .onUpdate(async (change, context) => {
    // Process liquidation immediately
  });
```

## Performance Considerations

### Database Operations

Per liquidation, the system performs:
- 5 reads (one per period, to check if record exists)
- 5 writes (one per period, create or update)

**Optimization Opportunities**:
- Batch writes using Firestore batch API
- Cache frequently accessed records
- Use transactions only when necessary

### Computation Cost

The calculation logic is lightweight:
- Simple arithmetic operations
- No complex algorithms
- O(1) time complexity per period

### Scalability

The design scales well:
- **Horizontal**: Each user's performance is independent
- **Vertical**: Firestore handles sharding automatically
- **Temporal**: Old periods can be archived or aggregated

## Security Considerations

### Firestore Rules Example

```javascript
match /daily_performance/{docId} {
  // Ensure users can only access their own performance
  allow read: if request.auth != null && 
    docId.matches('^' + request.auth.uid + '_.*$');
  
  // Only Functions can write
  allow write: if false;
}
```

### Data Privacy

- Performance data is user-specific (userId-based)
- No cross-user data exposure
- Position IDs stored for audit trail (consider privacy implications)

## Monitoring and Observability

### Metrics to Track

1. **Success Rate**: Percentage of successful updates
2. **Latency**: Time to process liquidation
3. **Partial Failures**: Count of partial update failures
4. **Data Quality**: Missing or invalid data points

### Logging Strategy

```typescript
console.log(`Performance updated for periods: ${result.updatedPeriods.join(', ')}`);
console.log(`Created records: ${result.createdRecords.join(', ')}`);
console.log(`Updated records: ${result.updatedRecords.join(', ')}`);

if (!result.success) {
  console.error(`Performance update failed: ${result.error}`);
}
```

## Conclusion

This architecture provides:
- ✅ Framework-agnostic design
- ✅ Type safety across platforms
- ✅ Multi-period tracking
- ✅ Comprehensive statistics
- ✅ Graceful error handling
- ✅ Easy testing
- ✅ Clear separation of concerns

The design prioritizes:
1. **Simplicity**: Easy to understand and use
2. **Flexibility**: Works with different Firestore SDKs
3. **Reliability**: Handles failures gracefully
4. **Maintainability**: Well-documented and type-safe
5. **Scalability**: Designed for growth

For questions or improvements, please refer to the examples in `examples/performance-management.md`.
