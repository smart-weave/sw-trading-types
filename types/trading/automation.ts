/**
 * 자동매매 관련 타입 정의
 */

import { Timestamp, TradingDay } from '../common';

/**
 * 자동매매 설정
 */
export interface AutoTradingSettings {
  enabled: boolean;
  targetSellSettings: TargetSellSettings;
  stopLossSettings: StopLossSettings;
  kisApi: KisApiSettings;
  schedule: TradingScheduleSettings;
  lastExecutedAt?: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * 목표 매도 설정
 */
export interface TargetSellSettings {
  enabled: boolean;
  defaultTargetProfitRate: number; // 기본 목표 수익률 (%)
  partialSellEnabled: boolean; // 부분 매도 활성화
  partialSellRatio: number; // 부분 매도 비율 (%)
  remainingHoldingRate: number; // 목표 달성 후 보유 비율 (%)
}

/**
 * 손절 설정
 */
export interface StopLossSettings {
  enabled: boolean;
  defaultStopLossRate: number; // 기본 손절 비율 (%)
  trailingStopEnabled: boolean; // 트레일링 스톱 활성화
  trailingStopRate: number; // 트레일링 스톱 비율 (%)
}

/**
 * 거래 일정 설정
 */
export interface TradingScheduleSettings {
  marketOpenTime: string;
  marketCloseTime: string;
  excludeHolidays: boolean;
  tradingDays: TradingDay[];
  checkIntervalMinutes: number;
}

/**
 * KIS API 설정
 */
export interface KisApiSettings {
  appKey: string;
  appSecret: string;
  accountNumber: string;
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