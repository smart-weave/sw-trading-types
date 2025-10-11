/**
 * 미체결 주문 관련 타입 정의
 * users/{uid}/pendingOrders 서브 컬렉션을 위한 타입
 */

import { DateTimeType } from './index';

/**
 * 주문 상태
 */
export type OrderStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

/**
 * 주문 트리거 (주문 출처)
 */
export type OrderTrigger = 'manual' | 'system';

/**
 * 주문 타입
 */
export type OrderType = 'buy' | 'sell';

/**
 * 미체결 주문 정보
 */
export interface PendingOrder {
  /** Firestore 문서 ID (자동 생성) */
  id?: string;
  
  /** 연관된 포지션 ID */
  positionId: string;
  
  /** KIS에서 발급한 주문번호 */
  orderId: string;
  
  /** 주문 타입 (매수/매도) */
  orderType: OrderType;
  
  /** 종목 코드 */
  symbol: string;
  
  /** 종목명 */
  name: string;
  
  /** 주문 수량 */
  quantity: number;
  
  /** 주문 가격 */
  orderPrice: number;
  
  /** 주문 상태 */
  status: OrderStatus;
  
  /** 주문 트리거 (manual: 사용자 수동, system: 시스템 자동) */
  trigger: OrderTrigger;
  
  /** 주문 생성일 */
  createdAt: DateTimeType;
  
  /** 마지막 상태 업데이트일 */
  updatedAt?: DateTimeType;
  
  /** 체결일 (체결 완료 시) */
  executedAt?: DateTimeType;
  
  /** 체결 가격 (체결 완료 시) */
  executedPrice?: number;
  
  /** 체결 수량 (체결 완료 시) */
  executedQuantity?: number;
  
  /** 실패 사유 (실패 시) */
  failureReason?: string;
  
  /** KIS API 응답 원본 (디버깅용) */
  kisResponse?: Record<string, unknown>;
}

/**
 * 체결 조회 응답 (KIS API)
 */
export interface OrderConclusionResponse {
  /** 응답 코드 */
  rt_cd: string;
  
  /** 메시지 코드 */
  msg_cd: string;
  
  /** 메시지 */
  msg: string;
  
  /** 응답 데이터 */
  output?: {
    /** 주문번호 */
    odno: string;
    
    /** 체결여부 */
    tot_ccld_qty: string; // 총 체결 수량
    
    /** 체결가격 */
    avg_prvs: string; // 평균 체결가
    
    /** 주문상태 */
    ord_stat_cd: string; // 주문상태코드
    
    /** 체결시간 */
    ccld_dttm?: string; // 체결일시
  };
}

/**
 * Firestore 컬렉션 경로 확장
 */
export const PENDING_ORDERS_COLLECTION = 'pendingOrders' as const;

/**
 * 주문 상태별 상수
 */
export const ORDER_STATUS = {
  PENDING: 'pending' as const,
  COMPLETED: 'completed' as const,
  FAILED: 'failed' as const,
  CANCELLED: 'cancelled' as const,
} as const;

/**
 * 주문 트리거별 상수
 */
export const ORDER_TRIGGER = {
  MANUAL: 'manual' as const,
  SYSTEM: 'system' as const,
} as const;

/**
 * 주문 타입별 상수
 */
export const ORDER_TYPE = {
  BUY: 'buy' as const,
  SELL: 'sell' as const,
} as const;