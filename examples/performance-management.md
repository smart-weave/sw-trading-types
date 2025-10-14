# Position Performance Management Examples

This document provides comprehensive examples of how to use the position performance management system in both Next.js and Firebase Functions.

## Table of Contents
- [Firebase Functions Implementation](#firebase-functions-implementation)
- [Next.js Implementation](#nextjs-implementation)
- [Custom Collection Names](#custom-collection-names)
- [Reading Performance Data](#reading-performance-data)
- [Error Handling](#error-handling)

## Firebase Functions Implementation

### 1. Setup CRUD Interface

```typescript
import { getFirestore } from 'firebase-admin/firestore';
import { PerformanceCRUD } from '@smart-weave/sw-trading-types';

const db = getFirestore();

// Implement the CRUD interface using Firebase Admin SDK
const adminCRUD: PerformanceCRUD = {
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

### 2. Process Position Liquidation

```typescript
import { 
  processPositionLiquidation,
  PositionLiquidationInfo 
} from '@smart-weave/sw-trading-types';

// Cloud Function triggered when a position is liquidated
export const onPositionLiquidated = functions.firestore
  .document('positions/{userId}/positions/{positionId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Check if position was just liquidated
    if (before.lifecycleStatus !== 'liquidated' && after.lifecycleStatus === 'liquidated') {
      const liquidationInfo: PositionLiquidationInfo = {
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
      };
      
      const result = await processPositionLiquidation(liquidationInfo, {
        crud: adminCRUD
      });
      
      if (result.success) {
        console.log(`Performance updated for periods: ${result.updatedPeriods.join(', ')}`);
        console.log(`Created records: ${result.createdRecords.join(', ')}`);
        console.log(`Updated records: ${result.updatedRecords.join(', ')}`);
      } else {
        console.error(`Failed to update performance: ${result.error}`);
      }
    }
  });
```

### 3. Batch Processing (Daily Job)

```typescript
import { processPositionLiquidation } from '@smart-weave/sw-trading-types';

// Scheduled function to process liquidations from the previous day
export const dailyPerformanceUpdate = functions.pubsub
  .schedule('0 1 * * *') // Run at 1 AM daily
  .onRun(async (context) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const today = new Date(yesterday);
    today.setDate(today.getDate() + 1);
    
    // Query liquidated positions from yesterday
    const snapshot = await db.collectionGroup('positions')
      .where('lifecycleStatus', '==', 'liquidated')
      .where('closeDate', '>=', yesterday)
      .where('closeDate', '<', today)
      .get();
    
    const results = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const liquidationInfo: PositionLiquidationInfo = {
          userId: data.userId,
          positionId: doc.id,
          symbol: data.symbol,
          name: data.name,
          openPrice: data.openPrice,
          closePrice: data.closePrice,
          amount: data.amount,
          openDate: data.openDate,
          closeDate: data.closeDate,
          fee: data.fee,
          realizedPL: data.netPL,
          plRatio: data.plRatio
        };
        
        return processPositionLiquidation(liquidationInfo, {
          crud: adminCRUD
        });
      })
    );
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`Processed ${successful} positions successfully, ${failed} failed`);
  });
```

## Next.js Implementation

### 1. Setup CRUD Interface

```typescript
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { PerformanceCRUD } from '@smart-weave/sw-trading-types';

// Initialize Firestore (do this once in your app)
const db = getFirestore();

// Implement the CRUD interface using Firestore Web SDK
const clientCRUD: PerformanceCRUD = {
  async get(collection, docId) {
    const docRef = doc(db, collection, docId);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? snapshot.data() : null;
  },
  
  async create(collection, docId, data) {
    const docRef = doc(db, collection, docId);
    await setDoc(docRef, data);
  },
  
  async update(collection, docId, data) {
    const docRef = doc(db, collection, docId);
    await setDoc(docRef, data, { merge: true });
  }
};
```

### 2. Manual Position Liquidation

```typescript
import { processPositionLiquidation } from '@smart-weave/sw-trading-types';

// In your position liquidation handler
async function handleManualLiquidation(position: Position) {
  // First, liquidate the position in Firestore
  const positionRef = doc(db, `positions/${userId}/positions/${position.id}`);
  await updateDoc(positionRef, {
    lifecycleStatus: 'liquidated',
    closeDate: new Date(),
    closePrice: currentPrice,
    netPL: calculatePL(position, currentPrice),
    plRatio: calculatePLRatio(position, currentPrice),
    updatedAt: new Date()
  });
  
  // Then update performance records
  const liquidationInfo: PositionLiquidationInfo = {
    userId: userId,
    positionId: position.id!,
    symbol: position.symbol!,
    name: position.name,
    openPrice: position.openPrice!,
    closePrice: currentPrice,
    amount: position.amount!,
    openDate: position.openDate,
    closeDate: new Date(),
    fee: position.fee || 0,
    realizedPL: calculatePL(position, currentPrice),
    plRatio: calculatePLRatio(position, currentPrice)
  };
  
  const result = await processPositionLiquidation(liquidationInfo, {
    crud: clientCRUD
  });
  
  if (result.success) {
    toast.success('Position liquidated and performance updated!');
  } else {
    toast.error(`Position liquidated but performance update failed: ${result.error}`);
  }
}
```

### 3. React Hook for Performance Data

```typescript
import { useEffect, useState } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot,
  PerformanceRecord,
  PerformancePeriod 
} from '@smart-weave/sw-trading-types';

export function usePerformance(userId: string, period: PerformancePeriod) {
  const [performance, setPerformance] = useState<PerformanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const collectionName = `${period}_performance`;
    const periodKey = getCurrentPeriodKey(period);
    const docId = `${userId}_${periodKey}`;
    
    const unsubscribe = onSnapshot(
      doc(db, collectionName, docId),
      (snapshot) => {
        if (snapshot.exists()) {
          setPerformance(snapshot.data() as PerformanceRecord);
        } else {
          setPerformance(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching performance:', error);
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [userId, period]);
  
  return { performance, loading };
}

// Helper function to get current period key
function getCurrentPeriodKey(period: PerformancePeriod): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  switch (period) {
    case 'daily':
      return `${year}-${month}-${day}`;
    case 'weekly':
      const weekNumber = getWeekNumber(now);
      return `${year}-W${String(weekNumber).padStart(2, '0')}`;
    case 'monthly':
      return `${year}-${month}`;
    case 'yearly':
      return `${year}`;
    case 'overall':
      return 'overall';
  }
}
```

## Custom Collection Names

You can customize the collection names used for each period:

```typescript
const result = await processPositionLiquidation(liquidationInfo, {
  crud: adminCRUD,
  collections: {
    daily: 'user_performance_daily',
    weekly: 'user_performance_weekly',
    monthly: 'user_performance_monthly',
    yearly: 'user_performance_yearly',
    overall: 'user_performance_overall'
  }
});
```

## Reading Performance Data

### Query Daily Performance

```typescript
// Firebase Admin
const dailyPerf = await db
  .collection('daily_performance')
  .doc(`${userId}_2025-10-14`)
  .get();

if (dailyPerf.exists) {
  const stats = dailyPerf.data() as PerformanceRecord;
  console.log(`Win rate: ${stats.stats.winRate}%`);
  console.log(`Total P/L: ${stats.stats.totalRealizedPL}`);
}

// Firestore Web SDK
const docRef = doc(db, 'daily_performance', `${userId}_2025-10-14`);
const snapshot = await getDoc(docRef);

if (snapshot.exists()) {
  const stats = snapshot.data() as PerformanceRecord;
  console.log(`Win rate: ${stats.stats.winRate}%`);
}
```

### Query Monthly Performance Range

```typescript
// Get last 6 months of performance
const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

const snapshot = await db
  .collection('monthly_performance')
  .where('userId', '==', userId)
  .where('startDate', '>=', sixMonthsAgo)
  .orderBy('startDate', 'desc')
  .get();

const monthlyStats = snapshot.docs.map(doc => doc.data() as PerformanceRecord);
```

## Error Handling

```typescript
const result = await processPositionLiquidation(liquidationInfo, {
  crud: adminCRUD
});

if (!result.success) {
  console.error('Performance update failed:', result.error);
  
  // Log which periods were updated before the error
  if (result.updatedPeriods.length > 0) {
    console.log('Partially updated periods:', result.updatedPeriods);
  }
  
  // You might want to retry or alert admins
  await alertAdmins({
    type: 'performance_update_failed',
    userId: liquidationInfo.userId,
    positionId: liquidationInfo.positionId,
    error: result.error
  });
}
```

## Testing with Mock CRUD

For unit tests, you can create a mock CRUD implementation:

```typescript
const mockData = new Map<string, any>();

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

// Use in tests
const result = await processPositionLiquidation(testLiquidationInfo, {
  crud: mockCRUD,
  getCurrentTime: () => new Date('2025-10-14T10:00:00Z') // Fixed time for testing
});
```

## Performance Monitoring Dashboard

Example React component for displaying performance:

```typescript
import { usePerformance } from './hooks/usePerformance';

export function PerformanceDashboard({ userId }: { userId: string }) {
  const { performance: daily, loading: loadingDaily } = usePerformance(userId, 'daily');
  const { performance: monthly, loading: loadingMonthly } = usePerformance(userId, 'monthly');
  const { performance: overall, loading: loadingOverall } = usePerformance(userId, 'overall');
  
  if (loadingDaily || loadingMonthly || loadingOverall) {
    return <div>Loading performance data...</div>;
  }
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <PerformanceCard title="Today" performance={daily} />
      <PerformanceCard title="This Month" performance={monthly} />
      <PerformanceCard title="All Time" performance={overall} />
    </div>
  );
}

function PerformanceCard({ 
  title, 
  performance 
}: { 
  title: string; 
  performance: PerformanceRecord | null;
}) {
  if (!performance) {
    return (
      <div className="card">
        <h3>{title}</h3>
        <p>No trades yet</p>
      </div>
    );
  }
  
  const { stats } = performance;
  
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="stats">
        <div className="stat">
          <span className="label">Total Trades</span>
          <span className="value">{stats.totalTrades}</span>
        </div>
        <div className="stat">
          <span className="label">Win Rate</span>
          <span className="value">{stats.winRate.toFixed(1)}%</span>
        </div>
        <div className="stat">
          <span className="label">Total P/L</span>
          <span className={`value ${stats.totalRealizedPL >= 0 ? 'positive' : 'negative'}`}>
            {stats.totalRealizedPL.toLocaleString()}원
          </span>
        </div>
        <div className="stat">
          <span className="label">Avg P/L Ratio</span>
          <span className="value">{stats.averagePLRatio.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
}
```
