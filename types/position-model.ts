/**
 * Position 모델 - sw-trading-types 패키지용
 * UserPosition과 통합된 완전한 포지션 모델
 */

import type { PositionLifecycleStatus } from './position-lifecycle';

/**
 * 시간 타입 - 런타임에 따라 다르게 처리
 */
export type Timestamp = Date | { seconds: number; nanoseconds: number };

/**
 * 포지션 타입 (진입/청산)
 */
export type PositionType = "진입" | "청산";

/**
 * 기본 모델 인터페이스
 */
export interface ModelBase {
  /**
   * 생성 시간
   */
  createdAt?: Timestamp;
  
  /**
   * 업데이트 시간
   */
  updatedAt?: Timestamp;
}

/**
 * 통합 Position 모델
 * UserPosition의 모든 필드를 포함하는 완전한 포지션 모델
 */
export interface Position extends ModelBase {
  /**
   * 포지션 ID (문서 ID와 동일)
   */
  id?: string;
  
  /**
   * 종목 심볼 (예: "005930")
   */
  symbol?: string;
  
  /**
   * 포지션 타입 (진입/청산)
   */
  positionType?: PositionType;
  
  /**
   * 수량
   */
  amount?: number;
  
  /**
   * 진입가
   */
  openPrice?: number;
  
  /**
   * 포지션 오픈 날짜
   */
  openDate?: string;
  
  /**
   * 포지션 청산 날짜 (청산된 경우)
   */
  closeDate?: string;
  
  /**
   * 청산가 (청산된 경우)
   */
  closePrice?: number;
  
  /**
   * 종목명
   */
  name?: string;
  
  /**
   * 타입 (추가 분류)
   */
  type?: string;
  
  /**
   * 포지션 생명주기 상태 (entry/exit 기반 시스템)
   */
  lifecycleStatus: PositionLifecycleStatus;
  
  /**
   * 투자 원금
   */
  currentValue?: number;
  
  /**
   * 현재가
   */
  currentPrice?: number;
  
  /**
   * 시장 가치
   */
  marketValue?: number;
  
  /**
   * 미청산 손익
   */
  netPL?: number;
  
  /**
   * 손익률 (%)
   */
  plRatio?: number;
  
  /**
   * 목표가
   */
  targetPrice?: number;
  
  /**
   * 목표 가치
   */
  targetValue?: number;
  
  /**
   * 목표 손익
   */
  targetPL?: number;
  
  /**
   * 목표 손익률 (%)
   */
  targetPLRatio?: number;
  
  /**
   * 수수료
   */
  fee?: number;
  
  /**
   * 설명/메모
   */
  description?: string;
  
  /**
   * 투자 포인트/근거
   */
  investmentPoints?: string;
  
  /**
   * 리스크 요인
   */
  riskFactors?: string;
  
  /**
   * 감춤 여부 (새로 추가된 필드)
   */
  hidden?: boolean;
}

/**
 * 포지션 상태별 표시 정보
 * (이미 패키지에 있다면 이 인터페이스도 제거 가능)
 */
export interface PositionStatusDisplayInfo {
  label: string;
  color: string;
  bgColor: string;
  description: string;
}

// 모든 유틸리티 함수들은 패키지의 position-lifecycle.ts에서 제공하므로 제거
// - getStatusDisplayInfo
// - getAvailableActions  
// - isValidTransition
// - isEntryStatus
// - isExitStatus
// - isActiveStatus
// - isConfirmedStatus