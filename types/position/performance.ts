/**
 * ===================================================================
 * 포지션 성과 관리 시스템 (Position Performance Management)
 * ===================================================================
 * 
 * 📋 개발팀 역할 분담:
 * 
 * 🎯 Next.js 개발팀:
 * - 성과 데이터를 UI에 표시 (일/주/월/년/전체)
 * - CRUD 함수를 Next.js용 Firestore 클라이언트로 구현
 * - 대시보드 차트 및 리포트 렌더링
 * 
 * ⚡ Functions 팀:
 * - 포지션 청산 시 성과 자동 계산 및 업데이트
 * - CRUD 함수를 Firebase Admin SDK로 구현
 * - 배치 작업으로 성과 집계 및 통계 생성
 * 
 * 🔄 공유 데이터 흐름:
 * 1. 포지션이 청산되면 Functions가 processPositionLiquidation 호출
 * 2. 청산 정보를 바탕으로 각 기간별 성과 계산
 * 3. 제공된 CRUD 함수를 통해 Firestore에 생성/업데이트
 * 4. Next.js가 실시간으로 업데이트된 성과 데이터 표시
 */

import { Timestamp, ModelBase } from '../common/base';

/**
 * 성과 집계 기간 타입
 * 
 * 🎯 Next.js 개발팀: 기간별 탭/필터 UI 구성
 * ⚡ Functions 팀: 기간별 컬렉션 분리 및 쿼리
 */
export type PerformancePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'overall';

/**
 * 포지션 청산 정보
 * 
 * processPositionLiquidation 함수의 입력 파라미터
 * 청산된 포지션의 핵심 정보를 담고 있음
 */
export interface PositionLiquidationInfo {
  /**
   * 사용자 ID
   */
  userId: string;
  
  /**
   * 포지션 ID
   */
  positionId: string;
  
  /**
   * 종목 심볼
   */
  symbol: string;
  
  /**
   * 종목명
   */
  name?: string;
  
  /**
   * 진입가
   */
  openPrice: number;
  
  /**
   * 청산가
   */
  closePrice: number;
  
  /**
   * 수량
   */
  amount: number;
  
  /**
   * 진입 시간
   */
  openDate: Timestamp;
  
  /**
   * 청산 시간
   */
  closeDate: Timestamp;
  
  /**
   * 수수료
   */
  fee?: number;
  
  /**
   * 실현 손익 (수수료 포함)
   */
  realizedPL: number;
  
  /**
   * 수익률 (%)
   */
  plRatio: number;
}

/**
 * 성과 통계 데이터
 * 
 * 각 기간별 성과를 집계한 통계 정보
 * 모든 PerformanceRecord에 공통으로 포함됨
 */
export interface PerformanceStats {
  /**
   * 총 거래 횟수
   */
  totalTrades: number;
  
  /**
   * 승리 횟수 (수익 거래)
   */
  winCount: number;
  
  /**
   * 패배 횟수 (손실 거래)
   */
  loseCount: number;
  
  /**
   * 승률 (%)
   */
  winRate: number;
  
  /**
   * 총 실현 손익
   */
  totalRealizedPL: number;
  
  /**
   * 평균 손익
   */
  averagePL: number;
  
  /**
   * 평균 수익률 (%)
   */
  averagePLRatio: number;
  
  /**
   * 최대 이익
   */
  maxProfit: number;
  
  /**
   * 최대 손실
   */
  maxLoss: number;
  
  /**
   * 총 수수료
   */
  totalFee: number;
  
  /**
   * 총 투자금액 (진입가 * 수량의 합)
   */
  totalInvestment: number;
  
  /**
   * 총 수익 (승리 거래의 손익 합)
   */
  totalProfit: number;
  
  /**
   * 총 손실 (패배 거래의 손익 합)
   */
  totalLoss: number;
  
  /**
   * 손익비 (평균이익/평균손실)
   */
  profitLossRatio?: number;
}

/**
 * 성과 기록 기본 인터페이스
 * 
 * 모든 기간별 성과 레코드가 상속받는 기본 구조
 */
export interface PerformanceRecord extends ModelBase {
  /**
   * 사용자 ID
   */
  userId: string;
  
  /**
   * 성과 집계 기간
   */
  period: PerformancePeriod;
  
  /**
   * 기간 식별자 (예: '2024-01-15', '2024-W03', '2024-01', '2024', 'overall')
   */
  periodKey: string;
  
  /**
   * 기간 시작 시간
   */
  startDate?: Timestamp;
  
  /**
   * 기간 종료 시간
   */
  endDate?: Timestamp;
  
  /**
   * 성과 통계
   */
  stats: PerformanceStats;
  
  /**
   * 청산된 포지션 ID 목록 (참조용)
   */
  liquidatedPositionIds: string[];
}

/**
 * 일별 성과 기록
 */
export interface DailyPerformanceRecord extends PerformanceRecord {
  period: 'daily';
  /**
   * 날짜 (YYYY-MM-DD)
   */
  periodKey: string;
}

/**
 * 주별 성과 기록
 */
export interface WeeklyPerformanceRecord extends PerformanceRecord {
  period: 'weekly';
  /**
   * 주 (YYYY-Www, 예: '2024-W03')
   */
  periodKey: string;
}

/**
 * 월별 성과 기록
 */
export interface MonthlyPerformanceRecord extends PerformanceRecord {
  period: 'monthly';
  /**
   * 월 (YYYY-MM)
   */
  periodKey: string;
}

/**
 * 년별 성과 기록
 */
export interface YearlyPerformanceRecord extends PerformanceRecord {
  period: 'yearly';
  /**
   * 년 (YYYY)
   */
  periodKey: string;
}

/**
 * 전체 성과 기록
 */
export interface OverallPerformanceRecord extends PerformanceRecord {
  period: 'overall';
  /**
   * 항상 'overall'
   */
  periodKey: 'overall';
}

/**
 * CRUD 인터페이스
 * 
 * Next.js와 Functions에서 각자의 Firestore 클라이언트로 구현
 * 
 * 🎯 Next.js: Firestore Web SDK 사용
 * ```typescript
 * import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
 * 
 * const crud: PerformanceCRUD = {
 *   async get(collection, docId) {
 *     const docRef = doc(db, collection, docId);
 *     const snapshot = await getDoc(docRef);
 *     return snapshot.exists() ? snapshot.data() : null;
 *   },
 *   async create(collection, docId, data) {
 *     const docRef = doc(db, collection, docId);
 *     await setDoc(docRef, data);
 *   },
 *   async update(collection, docId, data) {
 *     const docRef = doc(db, collection, docId);
 *     await setDoc(docRef, data, { merge: true });
 *   }
 * };
 * ```
 * 
 * ⚡ Functions: Firebase Admin SDK 사용
 * ```typescript
 * import { getFirestore } from 'firebase-admin/firestore';
 * 
 * const db = getFirestore();
 * const crud: PerformanceCRUD = {
 *   async get(collection, docId) {
 *     const doc = await db.collection(collection).doc(docId).get();
 *     return doc.exists ? doc.data() : null;
 *   },
 *   async create(collection, docId, data) {
 *     await db.collection(collection).doc(docId).set(data);
 *   },
 *   async update(collection, docId, data) {
 *     await db.collection(collection).doc(docId).set(data, { merge: true });
 *   }
 * };
 * ```
 */
export interface PerformanceCRUD {
  /**
   * 문서 조회
   * @param collection 컬렉션 경로
   * @param docId 문서 ID
   * @returns 문서 데이터 또는 null
   */
  get<T = any>(collection: string, docId: string): Promise<T | null>;
  
  /**
   * 문서 생성
   * @param collection 컬렉션 경로
   * @param docId 문서 ID
   * @param data 문서 데이터
   */
  create<T = any>(collection: string, docId: string, data: T): Promise<void>;
  
  /**
   * 문서 업데이트 (merge)
   * @param collection 컬렉션 경로
   * @param docId 문서 ID
   * @param data 업데이트할 데이터
   */
  update<T = any>(collection: string, docId: string, data: Partial<T>): Promise<void>;
}

/**
 * 성과 관리 설정
 * 
 * processPositionLiquidation 함수의 설정 옵션
 */
export interface PerformanceManagerConfig {
  /**
   * CRUD 구현체
   */
  crud: PerformanceCRUD;
  
  /**
   * 컬렉션 이름 매핑
   * 기본값: { daily: 'daily_performance', weekly: 'weekly_performance', ... }
   */
  collections?: {
    daily?: string;
    weekly?: string;
    monthly?: string;
    yearly?: string;
    overall?: string;
  };
  
  /**
   * 현재 시간 제공 함수 (테스트용)
   * 기본값: () => new Date()
   */
  getCurrentTime?: () => Date;
}

/**
 * 성과 처리 결과
 * 
 * processPositionLiquidation 함수의 반환 타입
 */
export interface PerformanceProcessResult {
  /**
   * 처리 성공 여부
   */
  success: boolean;
  
  /**
   * 업데이트된 기간 목록
   */
  updatedPeriods: PerformancePeriod[];
  
  /**
   * 생성된 레코드 ID 목록 (period:docId 형식)
   */
  createdRecords: string[];
  
  /**
   * 업데이트된 레코드 ID 목록 (period:docId 형식)
   */
  updatedRecords: string[];
  
  /**
   * 에러 메시지 (실패 시)
   */
  error?: string;
}

/**
 * 포지션 청산 정보를 받아 기간별 성과를 계산하고 업데이트하는 진입점 함수
 * 
 * 🎯 Next.js 개발팀: 클라이언트 측에서 호출 (예: 사용자가 수동으로 청산할 때)
 * ⚡ Functions 팀: 서버 측에서 호출 (예: 자동 청산, 배치 작업)
 * 
 * @param liquidationInfo 청산된 포지션 정보
 * @param config 성과 관리 설정 (CRUD 구현체 포함)
 * @returns 처리 결과
 * 
 * 사용 예시:
 * ```typescript
 * // Functions에서 사용
 * const result = await processPositionLiquidation(
 *   {
 *     userId: 'user123',
 *     positionId: 'pos456',
 *     symbol: '005930',
 *     name: '삼성전자',
 *     openPrice: 70000,
 *     closePrice: 75000,
 *     amount: 10,
 *     openDate: openTimestamp,
 *     closeDate: closeTimestamp,
 *     fee: 1000,
 *     realizedPL: 49000,
 *     plRatio: 7.14
 *   },
 *   {
 *     crud: adminCRUD, // Firebase Admin SDK로 구현된 CRUD
 *   }
 * );
 * 
 * // Next.js에서 사용
 * const result = await processPositionLiquidation(
 *   liquidationInfo,
 *   {
 *     crud: clientCRUD, // Firestore Web SDK로 구현된 CRUD
 *   }
 * );
 * ```
 */
export async function processPositionLiquidation(
  liquidationInfo: PositionLiquidationInfo,
  config: PerformanceManagerConfig
): Promise<PerformanceProcessResult> {
  const result: PerformanceProcessResult = {
    success: true,
    updatedPeriods: [],
    createdRecords: [],
    updatedRecords: [],
  };

  try {
    const { crud, collections = {}, getCurrentTime = () => new Date() } = config;
    
    // 기본 컬렉션 이름
    const collectionNames = {
      daily: collections.daily || 'daily_performance',
      weekly: collections.weekly || 'weekly_performance',
      monthly: collections.monthly || 'monthly_performance',
      yearly: collections.yearly || 'yearly_performance',
      overall: collections.overall || 'overall_performance',
    };

    // 청산 시간을 Date로 변환
    const closeDate = liquidationInfo.closeDate instanceof Date
      ? liquidationInfo.closeDate
      : new Date(liquidationInfo.closeDate.seconds * 1000);

    // 기간별 키 생성
    const year = closeDate.getFullYear();
    const month = String(closeDate.getMonth() + 1).padStart(2, '0');
    const day = String(closeDate.getDate()).padStart(2, '0');
    const weekNumber = getWeekNumber(closeDate);
    
    const periodKeys = {
      daily: `${year}-${month}-${day}`,
      weekly: `${year}-W${String(weekNumber).padStart(2, '0')}`,
      monthly: `${year}-${month}`,
      yearly: `${year}`,
      overall: 'overall',
    };

    // 각 기간별로 성과 업데이트
    const periods: PerformancePeriod[] = ['daily', 'weekly', 'monthly', 'yearly', 'overall'];
    
    for (const period of periods) {
      const collectionName = collectionNames[period];
      const periodKey = periodKeys[period];
      const docId = `${liquidationInfo.userId}_${periodKey}`;

      try {
        // 기존 레코드 조회
        const existingRecord = await crud.get<PerformanceRecord>(collectionName, docId);

        if (existingRecord) {
          // 기존 레코드 업데이트
          const updatedStats = calculateUpdatedStats(existingRecord.stats, liquidationInfo);
          const updatedPositionIds = [
            ...existingRecord.liquidatedPositionIds,
            liquidationInfo.positionId,
          ];

          await crud.update<PerformanceRecord>(collectionName, docId, {
            stats: updatedStats,
            liquidatedPositionIds: updatedPositionIds,
            updatedAt: getCurrentTime(),
          });

          result.updatedRecords.push(`${period}:${docId}`);
        } else {
          // 새 레코드 생성
          const initialStats = calculateInitialStats(liquidationInfo);
          const newRecord: PerformanceRecord = {
            userId: liquidationInfo.userId,
            period,
            periodKey,
            startDate: period === 'overall' ? undefined : getPeriodStartDate(closeDate, period),
            endDate: period === 'overall' ? undefined : getPeriodEndDate(closeDate, period),
            stats: initialStats,
            liquidatedPositionIds: [liquidationInfo.positionId],
            createdAt: getCurrentTime(),
            updatedAt: getCurrentTime(),
          };

          await crud.create(collectionName, docId, newRecord);
          result.createdRecords.push(`${period}:${docId}`);
        }

        result.updatedPeriods.push(period);
      } catch (error) {
        console.error(`Error processing ${period} performance:`, error);
        // 개별 기간 처리 실패는 전체 실패로 간주하지 않음
      }
    }
  } catch (error) {
    result.success = false;
    result.error = error instanceof Error ? error.message : String(error);
  }

  return result;
}

/**
 * 주차 번호 계산 (ISO 8601 기준)
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * 기간 시작 날짜 계산
 */
function getPeriodStartDate(date: Date, period: PerformancePeriod): Date {
  const result = new Date(date);
  
  switch (period) {
    case 'daily':
      result.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      const day = result.getDay();
      const diff = result.getDate() - day + (day === 0 ? -6 : 1);
      result.setDate(diff);
      result.setHours(0, 0, 0, 0);
      break;
    case 'monthly':
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
      break;
    case 'yearly':
      result.setMonth(0, 1);
      result.setHours(0, 0, 0, 0);
      break;
  }
  
  return result;
}

/**
 * 기간 종료 날짜 계산
 */
function getPeriodEndDate(date: Date, period: PerformancePeriod): Date {
  const result = new Date(date);
  
  switch (period) {
    case 'daily':
      result.setHours(23, 59, 59, 999);
      break;
    case 'weekly':
      const day = result.getDay();
      const diff = result.getDate() - day + (day === 0 ? 0 : 7);
      result.setDate(diff);
      result.setHours(23, 59, 59, 999);
      break;
    case 'monthly':
      result.setMonth(result.getMonth() + 1, 0);
      result.setHours(23, 59, 59, 999);
      break;
    case 'yearly':
      result.setMonth(11, 31);
      result.setHours(23, 59, 59, 999);
      break;
  }
  
  return result;
}

/**
 * 초기 통계 계산 (첫 번째 거래)
 */
function calculateInitialStats(liquidationInfo: PositionLiquidationInfo): PerformanceStats {
  const isWin = liquidationInfo.realizedPL > 0;
  const investment = liquidationInfo.openPrice * liquidationInfo.amount;
  
  return {
    totalTrades: 1,
    winCount: isWin ? 1 : 0,
    loseCount: isWin ? 0 : 1,
    winRate: isWin ? 100 : 0,
    totalRealizedPL: liquidationInfo.realizedPL,
    averagePL: liquidationInfo.realizedPL,
    averagePLRatio: liquidationInfo.plRatio,
    maxProfit: isWin ? liquidationInfo.realizedPL : 0,
    maxLoss: isWin ? 0 : liquidationInfo.realizedPL,
    totalFee: liquidationInfo.fee || 0,
    totalInvestment: investment,
    totalProfit: isWin ? liquidationInfo.realizedPL : 0,
    totalLoss: isWin ? 0 : Math.abs(liquidationInfo.realizedPL),
    profitLossRatio: undefined,
  };
}

/**
 * 통계 업데이트 (기존 통계에 새 거래 추가)
 */
function calculateUpdatedStats(
  existingStats: PerformanceStats,
  liquidationInfo: PositionLiquidationInfo
): PerformanceStats {
  const isWin = liquidationInfo.realizedPL > 0;
  const investment = liquidationInfo.openPrice * liquidationInfo.amount;
  
  const totalTrades = existingStats.totalTrades + 1;
  const winCount = existingStats.winCount + (isWin ? 1 : 0);
  const loseCount = existingStats.loseCount + (isWin ? 0 : 1);
  const totalRealizedPL = existingStats.totalRealizedPL + liquidationInfo.realizedPL;
  const totalFee = existingStats.totalFee + (liquidationInfo.fee || 0);
  const totalInvestment = existingStats.totalInvestment + investment;
  const totalProfit = existingStats.totalProfit + (isWin ? liquidationInfo.realizedPL : 0);
  const totalLoss = existingStats.totalLoss + (isWin ? 0 : Math.abs(liquidationInfo.realizedPL));
  
  const winRate = (winCount / totalTrades) * 100;
  const averagePL = totalRealizedPL / totalTrades;
  const averagePLRatio = ((existingStats.averagePLRatio * existingStats.totalTrades) + liquidationInfo.plRatio) / totalTrades;
  const maxProfit = Math.max(existingStats.maxProfit, isWin ? liquidationInfo.realizedPL : 0);
  const maxLoss = Math.min(existingStats.maxLoss, isWin ? 0 : liquidationInfo.realizedPL);
  
  const avgProfit = winCount > 0 ? totalProfit / winCount : 0;
  const avgLoss = loseCount > 0 ? totalLoss / loseCount : 0;
  const profitLossRatio = avgLoss !== 0 ? avgProfit / avgLoss : undefined;
  
  return {
    totalTrades,
    winCount,
    loseCount,
    winRate,
    totalRealizedPL,
    averagePL,
    averagePLRatio,
    maxProfit,
    maxLoss,
    totalFee,
    totalInvestment,
    totalProfit,
    totalLoss,
    profitLossRatio,
  };
}
