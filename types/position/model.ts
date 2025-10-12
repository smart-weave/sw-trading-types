/**
 * Position 모델 - sw-trading-types 패키지용
 * UserPosition과 통합된 완전한 포지션 모델
 */

import type { PositionLifecycleStatus } from './lifecycle';
import { Timestamp, ModelBase } from '../common/base';

/**
 * 포지션 타입 (진입/청산)
 */
export type PositionType = "진입" | "청산";

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
  
  /**
   * 수동으로 추가된 포지션 여부
   * 수동 포지션은 주문 없이 바로 확정되며, 청산 시에도 주문을 거치지 않음
   */
  isManual?: boolean;

  /**
   * 청산 주문 아이디 (선택적)
   */
  liquidationOrderId?: string;
}

/**
 * 포지션 상태별 표시 정보
 */
export interface PositionStatusDisplayInfo {
  /** 상태 라벨 */
  label: string;
  /** 텍스트 색상 */
  color: string;
  /** 배경 색상 */
  bgColor: string;
  /** 상태 설명 */
  description: string;
}