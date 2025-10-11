/**
 * 애플리케이션 전반에서 사용되는 상수 정의
 */

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
 * 거래 요일 옵션
 */
export const TRADING_DAY_OPTIONS = [
  { value: 'monday', label: '월요일' },
  { value: 'tuesday', label: '화요일' },
  { value: 'wednesday', label: '수요일' },
  { value: 'thursday', label: '목요일' },
  { value: 'friday', label: '금요일' }
] as const;

export type TradingDay = typeof TRADING_DAY_OPTIONS[number]['value'];