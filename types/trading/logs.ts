/**
 * 거래 로그 관련 타입 정의
 */

import { Timestamp, ActionType } from '../common';

/**
 * 거래 로그
 */
export interface TradingLog {
  /** 로그 ID */
  id: string;
  /** 사용자 ID */
  userId: string;
  /** 종목 코드 */
  symbol: string;
  /** 거래 액션 타입 */
  action: 'target_sell' | 'stop_loss' | 'partial_sell';
  /** 거래 수량 */
  quantity: number;
  /** 거래 가격 */
  price: number;
  /** 거래 금액 */
  amount: number;
  /** 거래 사유 */
  reason: string;
  /** 손익률 (%) */
  profitLossRate: number;
  /** 실행 시간 */
  executedAt: Timestamp;
  /** 주문 ID (선택적) */
  orderId?: string;
  /** 거래 상태 */
  status: 'pending' | 'completed' | 'failed';
  /** 실행 환경 */
  executionEnvironment: 'nextjs' | 'function';
  /** 함수명 (Functions 환경에서) */
  functionName?: string;
  /** 생성 시간 */
  createdAt?: Timestamp;
  /** 에러 메시지 (실패 시) */
  errorMessage?: string;
  /** 에러 코드 (실패 시) */
  errorCode?: string;
}