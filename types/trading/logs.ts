/**
 * 거래 로그 관련 타입 정의
 */

import { Timestamp, ActionType } from '../common';

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
  executedAt: Timestamp;
  orderId?: string;
  status: 'pending' | 'completed' | 'failed';
  executionEnvironment: 'nextjs' | 'function';
  functionName?: string;
  createdAt?: Timestamp;
  // 에러 관련 필드 (실패 시)
  errorMessage?: string;
  errorCode?: string;
}