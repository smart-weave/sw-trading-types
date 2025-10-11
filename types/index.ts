/**
 * 공유 타입 정의 (단일 타입 방식)
 * Next.js와 Functions에서 공통으로 사용하는 타입들
 */

// 미체결 주문 타입 export
export * from './pending-order';

// 포지션 생명주기 상태 타입 export
export * from './position-lifecycle';

// 포지션 모델 타입 export
export * from './position-model';

/**
 * 시간 타입 - 런타임에 따라 다르게 처리
 * @deprecated position-model.ts의 Timestamp 타입을 사용하세요
 */
export type DateTimeType = Date | { seconds: number; nanoseconds: number };

/**
 * 자동매매 설정
 */
export interface AutoTradingSettings {
  enabled: boolean;
  targetSellSettings: TargetSellSettings;
  stopLossSettings: StopLossSettings;
  kisApi: KisApiSettings;
  schedule: TradingScheduleSettings;
  lastExecutedAt?: DateTimeType;
  createdAt?: DateTimeType;
  updatedAt?: DateTimeType;
}

export interface TargetSellSettings {
  enabled: boolean;
  defaultTargetProfitRate: number; // 기본 목표 수익률 (%)
  partialSellEnabled: boolean; // 부분 매도 활성화
  partialSellRatio: number; // 부분 매도 비율 (%)
  remainingHoldingRate: number; // 목표 달성 후 보유 비율 (%)
}

export interface StopLossSettings {
  enabled: boolean;
  defaultStopLossRate: number; // 기본 손절 비율 (%)
  trailingStopEnabled: boolean; // 트레일링 스톱 활성화
  trailingStopRate: number; // 트레일링 스톱 비율 (%)
}

export interface TradingScheduleSettings {
  marketOpenTime: string;
  marketCloseTime: string;
  excludeHolidays: boolean;
  tradingDays: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday')[];
  checkIntervalMinutes: number;
}

// 거래 요일 옵션
export const tradingDayOptions = [
  { value: 'monday', label: '월요일' },
  { value: 'tuesday', label: '화요일' },
  { value: 'wednesday', label: '수요일' },
  { value: 'thursday', label: '목요일' },
  { value: 'friday', label: '금요일' }
] as const;

export interface KisApiSettings {
  appKey: string;
  appSecret: string;
  accountNumber: string;
  enabled: boolean;
}

/**
 * 거래 로그
 */
export interface TradingLog {
  id: string;
  userId: string;
  symbol: string;
  action: 'target_sell' | 'stop_loss' | 'partial_sell';
  quantity: number;
  price: number;
  amount: number;
  reason: string;
  profitLossRate: number;
  executedAt: DateTimeType;
  orderId?: string;
  status: 'pending' | 'completed' | 'failed';
  executionEnvironment: 'nextjs' | 'function';
  functionName?: string;
  createdAt?: DateTimeType;
  // 에러 관련 필드 (실패 시)
  errorMessage?: string;
  errorCode?: string;
}

/**
 * Firestore 컬렉션 경로 상수
 */
export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  POSITIONS: 'positions',
  ACTION_LOGS: 'actionlogs',
  SETTINGS: 'settings',
  AUTO_TRADING_DOC: 'autoTrading',
} as const;

/**
 * 액션 타입 상수
 */
export const ACTION_TYPES = {
  BUY: 'BUY',
  SELL: 'SELL',
  TARGET_SELL: 'target_sell',
  STOP_LOSS: 'stop_loss',
  PARTIAL_SELL: 'partial_sell',
} as const;

export type ActionType = typeof ACTION_TYPES[keyof typeof ACTION_TYPES];

/**
 * 기본값 설정
 */
export const defaultAutoTradingSettings: AutoTradingSettings = {
  enabled: false,
  targetSellSettings: {
    enabled: true,
    defaultTargetProfitRate: 10, // 10%
    partialSellEnabled: false,
    partialSellRatio: 50, // 50%
    remainingHoldingRate: 50, // 50%
  },
  stopLossSettings: {
    enabled: true,
    defaultStopLossRate: 5, // 5%
    trailingStopEnabled: false,
    trailingStopRate: 2, // 2%
  },
  kisApi: {
    appKey: '',
    appSecret: '',
    accountNumber: '',
    enabled: false,
  },
  schedule: {
    marketOpenTime: '09:00',
    marketCloseTime: '15:30',
    excludeHolidays: true,
    tradingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    checkIntervalMinutes: 5,
  },
};