/**
 * 자동매매 관련 타입 정의
 */

import { Timestamp, TradingDay } from '../common';

/**
 * 자동매매 설정
 */
export interface AutoTradingSettings {
  /** 자동매매 활성화 여부 */
  enabled: boolean;
  /** 목표 매도 설정 */
  targetSellSettings: TargetSellSettings;
  /** 손절 설정 */
  stopLossSettings: StopLossSettings;
  /** KIS API 설정 */
  kisApi: KisApiSettings;
  /** 거래 일정 설정 */
  schedule: TradingScheduleSettings;
  /** 마지막 실행 시간 */
  lastExecutedAt?: Timestamp;
  /** 생성 시간 */
  createdAt?: Timestamp;
  /** 업데이트 시간 */
  updatedAt?: Timestamp;
}

/**
 * 목표 매도 설정
 */
export interface TargetSellSettings {
  /** 목표 매도 활성화 여부 */
  enabled: boolean;
  /** 기본 목표 수익률 (%) */
  defaultTargetProfitRate: number;
  /** 부분 매도 활성화 */
  partialSellEnabled: boolean;
  /** 부분 매도 비율 (%) */
  partialSellRatio: number;
  /** 목표 달성 후 보유 비율 (%) */
  remainingHoldingRate: number;
}

/**
 * 손절 설정
 */
export interface StopLossSettings {
  /** 손절 활성화 여부 */
  enabled: boolean;
  /** 기본 손절 비율 (%) */
  defaultStopLossRate: number;
  /** 트레일링 스톱 활성화 */
  trailingStopEnabled: boolean;
  /** 트레일링 스톱 비율 (%) */
  trailingStopRate: number;
}

/**
 * 거래 일정 설정
 */
export interface TradingScheduleSettings {
  /** 장 시작 시간 */
  marketOpenTime: string;
  /** 장 마감 시간 */
  marketCloseTime: string;
  /** 공휴일 제외 여부 */
  excludeHolidays: boolean;
  /** 거래 요일 목록 */
  tradingDays: TradingDay[];
  /** 확인 간격 (분) */
  checkIntervalMinutes: number;
}

/**
 * KIS API 설정
 */
export interface KisApiSettings {
  /** 앱 키 */
  appKey: string;
  /** 앱 시크릿 */
  appSecret: string;
  /** 계좌번호 */
  accountNumber: string;
  /** API 활성화 여부 */
  enabled: boolean;
}

/**
 * 기본값 설정
 */
export const DEFAULT_AUTO_TRADING_SETTINGS: AutoTradingSettings = {
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