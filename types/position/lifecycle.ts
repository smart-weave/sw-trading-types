/**
 * ===================================================================
 * 포지션 생명주기 상태 관리 시스템 (팀별 역할 구분)
 * ===================================================================
 * 
 * 📋 개발팀 역할 분담:
 * 
 * 🎯 Next.js 개발팀 (클라이언트):
 * - UI 컴포넌트에서 STATUS_DISPLAY_INFO 활용한 상태 표시
 * - usePositionLifecycle 훅으로 상태 관리 및 액션 처리
 * - 사용자 액션(확정, 취소, 청산) 트리거
 * - 실시간 상태 업데이트 및 알림 표시
 * 
 * ⚡ Functions 주문 처리팀 (백엔드):
 * - 거래소 API와 포지션 상태 동기화
 * - DAILY_SYNC_RULES 기반 자동 상태 전환
 * - 주문 체결/실패/취소 처리
 * - 만료 처리 및 일일 정리 작업
 * - 상태 전환 로그 기록 및 모니터링
 * 
 * 🔄 공유 데이터 흐름:
 * 1. 사용자가 Next.js에서 주문 요청
 * 2. Functions가 거래소 API 호출 및 상태 업데이트
 * 3. Next.js가 Firestore 변경 감지하여 UI 업데이트
 * 4. Functions가 주기적으로 상태 동기화 수행
 * 
 * 핵심 개념:
 * - 포지션 방향(long/short)과 주문 방향(buy/sell)은 별개입니다
 * - Long 포지션: 진입=buy 주문, 청산=sell 주문
 * - Short 포지션: 진입=sell 주문, 청산=buy 주문
 */

import { Timestamp } from '../common/base';

/**
 * 포지션 방향 타입
 * 
 * 🎯 Next.js 개발팀: 포지션 생성 시 direction 선택 UI 구성
 * ⚡ Functions 팀: 진입/청산 주문 방향 결정 로직
 */
export type PositionDirection = 'long' | 'short';

/**
 * 포지션 생명주기 상태 열거형
 * 
 * 🎯 Next.js 개발팀 주요 사용:
 * 1. 상태별 UI 컴포넌트 렌더링 (진행률, 버튼 표시/숨김)
 * 2. 사용자 액션 가능 여부 확인 (확정, 취소, 청산 버튼)
 * 3. 실시간 상태 변경 감지 및 알림 표시
 * 4. 포지션 목록 필터링 및 정렬
 * 
 * ⚡ Functions 팀 주요 사용:
 * 1. 일일 동기화 함수에서 현재 상태 확인
 * 2. 주문 API 결과에 따른 상태 전환
 * 3. 만료 처리 및 정리 작업
 * 4. 상태 변경 로그 기록
 * 
 * 상태 분류:
 * - entry_*: 포지션 생성(진입) 관련 - 새로운 포지션을 만드는 과정
 * - exit_*: 포지션 청산(종료) 관련 - 기존 포지션을 닫는 과정
 * - confirmed: 활성 포지션 상태 - 정상 보유 중
 * - liquidated/expired: 최종 상태 - 더 이상 변경되지 않음
 */
export type PositionLifecycleStatus = 
  // 포지션 생성 관련 상태 (진입 단계)
  | 'entry_order_pending'    // 진입 주문 접수됨, 거래소에서 체결 대기 중
  | 'entry_order_failed'     // 진입 주문 실패 (자금 부족, 시장 조건 등)
  | 'entry_order_cancelled'  // 진입 주문 취소됨 (사용자 또는 시스템)
  | 'entry_unconfirmed'      // 진입 체결 완료, 사용자 확정 대기 중
  | 'confirmed'              // 확정 완료, 정상 보유 중 (청산 가능 상태)
  
  // 포지션 청산 관련 상태 (종료 단계)
  | 'exit_order_pending'     // 청산 주문 접수됨, 거래소에서 체결 대기 중
  | 'exit_order_failed'      // 청산 주문 실패 (시장 조건, 네트워크 등)
  | 'exit_order_cancelled'   // 청산 주문 취소됨 (사용자 또는 시스템)
  | 'liquidated'             // 청산 완료 (최종 상태)
  
  // 공통 상태
  | 'expired';               // 미확정 상태에서 시간 초과로 만료됨

/**
 * 상태 전환 이벤트 타입
 * 
 * 🎯 Next.js 개발팀: 사용자 액션 트리거 시 이벤트 타입 지정
 * ⚡ Functions 팀: 상태 변경 로그 기록 시 사용
 * 
 * 이벤트 명명 규칙:
 * - entry_*: 포지션 진입 관련 이벤트
 * - exit_*: 포지션 청산 관련 이벤트
 * - user_*: 사용자 액션
 * - system_*: 시스템 자동 처리
 */
export type StatusTransitionEvent = 
  // 포지션 진입 관련 이벤트
  | 'entry_order_submitted'      // 진입 주문 접수
  | 'entry_order_executed'       // 진입 주문 체결
  | 'entry_order_failed'         // 진입 주문 실패
  | 'entry_order_cancelled'      // 진입 주문 취소
  | 'user_confirmed'              // 사용자 포지션 확정
  
  // 포지션 청산 관련 이벤트
  | 'exit_order_submitted'       // 청산 주문 접수
  | 'exit_order_executed'        // 청산 주문 체결
  | 'exit_order_failed'          // 청산 주문 실패
  | 'exit_order_cancelled'       // 청산 주문 취소
  
  // 시스템 이벤트
  | 'auto_expired'               // 자동 만료 (24시간 초과)
  | 'daily_cleanup';             // 일일 정리 작업

/**
 * 허용되는 상태 전환 매트릭스
 * 
 * 🎯 Next.js 개발팀 사용법:
 * - 사용자 액션 버튼 활성화/비활성화 결정
 * - 클라이언트 측 상태 변경 검증
 * - 사용자에게 가능한 다음 단계 안내
 * 
 * ⚡ Functions 팀 사용법:
 * - 상태 변경 전 ALLOWED_TRANSITIONS[currentStatus].includes(newStatus) 체크
 * - 유효하지 않은 전환 시도 시 에러 로그 및 차단
 * - API 엔드포인트 권한 검증
 * 
 * 전환 시나리오:
 * 1. 정상 진입: entry_order_pending → entry_unconfirmed → confirmed
 * 2. 정상 청산: confirmed → exit_order_pending → liquidated
 * 3. 실패 처리: *_order_pending → *_order_failed → *_order_pending (재시도)
 * 4. 만료 처리: entry_unconfirmed → expired (24시간 후)
 */
export const ALLOWED_TRANSITIONS: Record<PositionLifecycleStatus, PositionLifecycleStatus[]> = {
  // 포지션 생성 프로세스 (진입)
  'entry_order_pending': ['entry_unconfirmed', 'entry_order_failed', 'entry_order_cancelled', 'expired'],
  'entry_order_failed': ['entry_order_pending'], // 재주문 가능
  'entry_order_cancelled': ['entry_order_pending'], // 재주문 가능
  'entry_unconfirmed': ['confirmed', 'expired'], // 확정 또는 만료
  
  // 확정된 포지션에서 청산 프로세스
  'confirmed': ['exit_order_pending'], // 청산 주문만 가능
  
  // 포지션 청산 프로세스 (종료)
  'exit_order_pending': ['liquidated', 'exit_order_failed', 'exit_order_cancelled'],
  'exit_order_failed': ['exit_order_pending', 'confirmed'], // 재시도 또는 보유 상태로 복귀
  'exit_order_cancelled': ['exit_order_pending', 'confirmed'], // 재시도 또는 보유 상태로 복귀
  
  // 최종 상태
  'liquidated': [], // 최종 상태
  'expired': ['entry_order_pending'] // 만료된 경우 재주문 가능
};

/**
 * 상태별 UI 표시 정보
 * 
 * 🎯 Next.js 개발팀 활용:
 * - 포지션 카드/테이블에서 상태 라벨 및 색상 표시
 * - 진행률 바 및 아이콘 선택
 * - 토스트 알림 메시지 생성
 * - 상태별 액션 버튼 렌더링 (actions 배열 활용)
 * 
 * ⚡ Functions 팀 활용:
 * - 클라이언트로 전송할 상태 정보 구성
 * - 이메일/SMS 알림 메시지 생성 시 description 활용
 * - API 권한 검증 (허용 액션 확인)
 * - 관리자 대시보드용 상태 요약 정보 제공
 * 
 * UI 색상 규칙:
 * - 파란색: 진입 관련 상태 (entry_*)
 * - 주황색: 청산 관련 상태 (exit_*)
 * - 초록색: 정상 상태 (confirmed)
 * - 빨간색: 실패 상태 (*_failed)
 * - 회색: 취소/만료 상태
 */
export const STATUS_DISPLAY_INFO: Record<PositionLifecycleStatus, {
  label: string;
  color: string;
  bgColor: string;
  description: string;
  actions: string[];
}> = {
  // 포지션 생성 관련 상태 (진입)
  'entry_order_pending': {
    label: '진입대기',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: '포지션 진입 주문이 접수되어 체결을 기다리고 있습니다',
    actions: ['cancel'] // 주문 취소 가능
  },
  'entry_order_failed': {
    label: '진입실패',
    color: 'text-red-600', 
    bgColor: 'bg-red-100',
    description: '포지션 진입 주문 처리 중 오류가 발생했습니다',
    actions: ['retry', 'delete'] // 재시도 또는 삭제
  },
  'entry_order_cancelled': {
    label: '진입취소',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100', 
    description: '포지션 진입 주문이 취소되었습니다',
    actions: ['retry', 'delete'] // 재시도 또는 삭제
  },
  'entry_unconfirmed': {
    label: '진입완료(미확정)',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    description: '포지션 진입이 체결되었지만 아직 확정되지 않았습니다',
    actions: ['confirm', 'exit'] // 확정 또는 즉시 청산
  },
  
  // 확정된 포지션
  'confirmed': {
    label: '보유중',
    color: 'text-green-600',
    bgColor: 'bg-green-100', 
    description: '포지션이 확정되어 정상 보유 중입니다',
    actions: ['exit', 'edit'] // 청산 또는 수정
  },
  
  // 포지션 청산 관련 상태 (종료)
  'exit_order_pending': {
    label: '청산대기',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    description: '포지션 청산 주문이 접수되어 체결을 기다리고 있습니다',
    actions: ['cancel'] // 주문 취소 가능
  },
  'exit_order_failed': {
    label: '청산실패',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    description: '포지션 청산 주문 처리 중 오류가 발생했습니다',
    actions: ['retry', 'cancel'] // 재시도 또는 취소
  },
  'exit_order_cancelled': {
    label: '청산취소',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    description: '포지션 청산 주문이 취소되었습니다',
    actions: ['retry', 'hold'] // 재시도 또는 보유 유지
  },
  
  // 최종 상태
  'liquidated': {
    label: '청산완료',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    description: '포지션이 청산 완료되었습니다',
    actions: ['archive'] // 아카이브만 가능
  },
  'expired': {
    label: '만료',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    description: '미확정 상태로 하루가 지나 만료되었습니다',
    actions: ['reorder', 'delete'] // 재주문 또는 삭제
  }
};

/**
 * 포지션 상태 동기화 규칙 인터페이스
 * 
 * ⚡ Functions 팀 전용 인터페이스:
 * PendingOrder 상태와 Position 상태를 동기화할 때 사용
 * 
 * 🎯 Next.js 개발팀: 직접 사용하지 않음 (읽기 전용 참조)
 * 
 * 필드 설명:
 * - pendingOrderStatus: 거래소 API에서 조회한 주문 상태
 * - currentPositionStatus: 현재 Firestore에 저장된 포지션 상태
 * - targetPositionStatus: 변경되어야 할 목표 포지션 상태
 * - action: 수행할 작업 ('transition': 상태변경, 'expire': 만료처리, 'maintain': 유지)
 * - reason: 변경 사유 (로그 기록용)
 */
export interface SyncRule {
  pendingOrderStatus: 'pending' | 'completed' | 'failed' | 'cancelled';
  currentPositionStatus: PositionLifecycleStatus;
  targetPositionStatus: PositionLifecycleStatus;
  action: 'transition' | 'expire' | 'maintain';
  reason: string;
}

/**
 * 일일 정리 동기화 규칙 매트릭스
 * 
 * ⚡ Functions 팀 일일 동기화 함수에서 사용:
 * 1. 모든 활성 포지션을 순회
 * 2. 각 포지션의 현재 상태와 PendingOrder 상태 비교
 * 3. 일치하는 규칙이 있으면 해당 액션 수행
 * 4. 상태 변경 로그 기록
 * 
 * 🎯 Next.js 개발팀: 직접 사용하지 않음 (참조용으로만 확인)
 * 
 * Functions 팀 사용 예시:
 * ```typescript
 * for (const position of positions) {
 *   const orderStatus = await checkOrderStatus(position.orderId);
 *   const rule = DAILY_SYNC_RULES.find(r => 
 *     r.pendingOrderStatus === orderStatus && 
 *     r.currentPositionStatus === position.status
 *   );
 *   if (rule && rule.action === 'transition') {
 *     await updatePositionStatus(position.id, rule.targetPositionStatus);
 *   }
 * }
 * ```
 */
export const DAILY_SYNC_RULES: SyncRule[] = [
  // 포지션 진입 주문 관련 규칙
  
  // 진입 PendingOrder가 완료되었지만 Position이 아직 entry_order_pending인 경우
  {
    pendingOrderStatus: 'completed',
    currentPositionStatus: 'entry_order_pending',
    targetPositionStatus: 'entry_unconfirmed',
    action: 'transition',
    reason: '진입 주문 체결 완료, 미확정 상태로 전환'
  },
  
  // 진입 PendingOrder가 실패했지만 Position이 아직 entry_order_pending인 경우
  {
    pendingOrderStatus: 'failed',
    currentPositionStatus: 'entry_order_pending',
    targetPositionStatus: 'entry_order_failed',
    action: 'transition',
    reason: '진입 주문 실패, 실패 상태로 전환'
  },
  
  // 진입 PendingOrder가 취소되었지만 Position이 아직 entry_order_pending인 경우
  {
    pendingOrderStatus: 'cancelled',
    currentPositionStatus: 'entry_order_pending',
    targetPositionStatus: 'entry_order_cancelled',
    action: 'transition',
    reason: '진입 주문 취소, 취소 상태로 전환'
  },
  
  // 진입 PendingOrder가 하루 이상 pending 상태인 경우
  {
    pendingOrderStatus: 'pending',
    currentPositionStatus: 'entry_order_pending',
    targetPositionStatus: 'expired',
    action: 'expire',
    reason: '진입 주문 대기 시간 초과, 만료 처리'
  },
  
  // 진입 미확정 상태가 하루 이상 지속된 경우
  {
    pendingOrderStatus: 'completed',
    currentPositionStatus: 'entry_unconfirmed',
    targetPositionStatus: 'expired',
    action: 'expire',
    reason: '진입 미확정 상태 시간 초과, 만료 처리'
  },
  
  // 포지션 청산 주문 관련 규칙
  
  // 청산 PendingOrder가 완료되었지만 Position이 아직 exit_order_pending인 경우
  {
    pendingOrderStatus: 'completed',
    currentPositionStatus: 'exit_order_pending',
    targetPositionStatus: 'liquidated',
    action: 'transition',
    reason: '청산 주문 체결 완료, 청산 완료로 전환'
  },
  
  // 청산 PendingOrder가 실패했지만 Position이 아직 exit_order_pending인 경우
  {
    pendingOrderStatus: 'failed',
    currentPositionStatus: 'exit_order_pending',
    targetPositionStatus: 'exit_order_failed',
    action: 'transition',
    reason: '청산 주문 실패, 실패 상태로 전환'
  },
  
  // 청산 PendingOrder가 취소되었지만 Position이 아직 exit_order_pending인 경우
  {
    pendingOrderStatus: 'cancelled',
    currentPositionStatus: 'exit_order_pending',
    targetPositionStatus: 'exit_order_cancelled',
    action: 'transition',
    reason: '청산 주문 취소, 취소 상태로 전환'
  }
];

/**
 * 상태 전환 로그 인터페이스
 * 
 * ⚡ Functions 팀: 모든 상태 변경을 추적하기 위한 로그 구조
 * Firestore 'status_transition_logs' 컬렉션에 저장
 * 
 * 🎯 Next.js 개발팀: 
 * - 사용자별 거래 히스토리 조회 시 참조
 * - 디버깅용 상태 변경 이력 확인
 * - 관리자 페이지에서 상태 변경 이력 표시
 * 
 * 사용 시나리오:
 * - 포지션 상태 변경 시 자동 로그 생성 (Functions)
 * - 디버깅 및 감사를 위한 상태 변경 이력 추적
 * - 사용자별 거래 패턴 분석
 * 
 * triggeredBy 분류:
 * - 'system': Functions 자동 처리 (일일 동기화 등)
 * - 'user': 사용자 직접 액션 (확정, 취소 등)
 * - 'scheduler': 스케줄러 작업 (만료 처리 등)
 */
export interface StatusTransitionLog {
  id: string;
  userId: string;
  positionId: string;
  fromStatus: PositionLifecycleStatus;
  toStatus: PositionLifecycleStatus;
  event: StatusTransitionEvent;
  timestamp: Timestamp;
  triggeredBy: 'system' | 'user' | 'scheduler';
  metadata: {
    orderId?: string;
    reason?: string;
    errorMessage?: string;
    userAction?: string;
    systemProcess?: string;
  };
}

/**
 * 포지션 확장 정보 인터페이스
 * 
 * 🎯 Next.js 개발팀과 ⚡ Functions 팀 공통 사용:
 * Position 문서의 lifecycleInfo 필드에 저장
 * 
 * 🎯 Next.js 개발팀 활용:
 * - 포지션 상세 페이지에서 히스토리 표시
 * - 상태 변경 타임라인 UI 구성
 * - 만료 시간 카운트다운 표시
 * 
 * ⚡ Functions 팀 활용:
 * - 주문 히스토리 추적 (진입→청산 전체 과정)
 * - 상태 변경 이력 보관 (디버깅 및 감사용)
 * - 만료 처리 시점 판단
 */
export interface PositionLifecycleInfo {
  /**
   * 현재 생명주기 상태
   */
  lifecycleStatus: PositionLifecycleStatus;
  
  /**
   * 연결된 주문 ID들 (히스토리)
   * 
   * ⚡ Functions 팀: 주문 상태 조회 시 사용
   * 🎯 Next.js 개발팀: 주문 히스토리 UI 표시
   */
  orderHistory: {
    orderId: string;
    orderType: 'entry' | 'exit'; // 진입 또는 청산 주문
    timestamp: Timestamp;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
  }[];
  
  /**
   * 상태 변경 이력 (최근 10개 보관)
   * 
   * 🎯 Next.js 개발팀: 상태 변경 타임라인 UI
   * ⚡ Functions 팀: 디버깅 및 감사용
   */
  statusHistory: {
    from: PositionLifecycleStatus;
    to: PositionLifecycleStatus;
    timestamp: Timestamp;
    reason: string;
    triggeredBy: 'system' | 'user' | 'scheduler';
  }[];
  
  /**
   * 만료 관련 정보
   * 
   * ⚡ Functions 팀: 만료 처리 로직에서 사용
   * 🎯 Next.js 개발팀: 만료 카운트다운 표시
   */
  expirationInfo?: {
    lastOrderDate: Timestamp;
    expiredAt?: Timestamp;
    autoExpired: boolean;
  };
}

/**
 * 일일 정리 작업 결과 반환 타입
 * 
 * ⚡ Functions 팀: 일일 정리 함수의 반환값
 * 🎯 Next.js 개발팀: 관리자 대시보드에서 모니터링 표시
 * 
 * 활용:
 * - 모니터링 및 로그 분석
 * - 관리자 알림 및 리포트 생성
 * - 시스템 성능 추적
 * 
 * 필드 설명:
 * - processedUsers: 처리된 사용자 수
 * - pendingOrdersCleared: 정리된 대기 중 주문 수
 * - positionsExpired: 만료 처리된 포지션 수
 * - positionsTransitioned: 상태 전환된 포지션 수
 * - errors: 처리 중 발생한 에러 목록
 * - summary: 상태별 처리 건수 요약
 */
export interface DailyCleanupResult {
  processedUsers: number;
  pendingOrdersCleared: number;
  positionsExpired: number;
  positionsTransitioned: number;
  errors: string[];
  summary: {
    [key: string]: number;
  };
}

/**
 * ===================================================================
 * 유틸리티 함수들 (팀별 사용 구분)
 * ===================================================================
 */

/**
 * 상태 전환 유효성 검사
 * 
 * 🎯 Next.js 개발팀: 사용자 액션 전 클라이언트 측 검증
 * ⚡ Functions 팀: 상태 변경 전 서버 측 검증
 * 
 * @param from 현재 상태
 * @param to 변경하려는 상태
 * @returns 유효한 전환인지 여부
 * 
 * Next.js 사용 예시:
 * ```typescript
 * const canConfirm = isValidTransition('entry_unconfirmed', 'confirmed');
 * <button disabled={!canConfirm}>확정</button>
 * ```
 * 
 * Functions 사용 예시:
 * ```typescript
 * if (!isValidTransition(currentStatus, newStatus)) {
 *   throw new Error(`Invalid transition: ${currentStatus} -> ${newStatus}`);
 * }
 * ```
 */
export function isValidTransition(
  from: PositionLifecycleStatus, 
  to: PositionLifecycleStatus
): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * 상태별 UI 컴포넌트 정보 조회
 * 
 * 🎯 Next.js 개발팀: 포지션 UI 렌더링 시 사용
 * ⚡ Functions 팀: 클라이언트로 전송할 UI 정보 생성 시 사용
 * 
 * @param status 포지션 상태
 * @returns UI 표시 정보 객체
 * 
 * Next.js 사용 예시:
 * ```typescript
 * const { label, color, bgColor } = getStatusDisplayInfo(position.status);
 * <Badge className={`${color} ${bgColor}`}>{label}</Badge>
 * ```
 */
export function getStatusDisplayInfo(status: PositionLifecycleStatus) {
  return STATUS_DISPLAY_INFO[status];
}

/**
 * 상태별 가능한 액션 조회
 * 
 * 🎯 Next.js 개발팀: 액션 버튼 렌더링 결정
 * ⚡ Functions 팀: API 권한 검증 시 사용
 * 
 * @param status 포지션 상태
 * @returns 허용된 액션 목록
 * 
 * Next.js 사용 예시:
 * ```typescript
 * const actions = getAvailableActions(position.status);
 * {actions.includes('confirm') && <ConfirmButton />}
 * {actions.includes('exit') && <ExitButton />}
 * ```
 */
export function getAvailableActions(status: PositionLifecycleStatus): string[] {
  return STATUS_DISPLAY_INFO[status]?.actions || [];
}

/**
 * 상태 전환 로그 생성 헬퍼 함수
 * 
 * ⚡ Functions 팀 전용: 포지션 상태 변경 시 호출하여 로그 객체 생성
 * 🎯 Next.js 개발팀: 직접 사용하지 않음
 * 
 * 생성된 로그는 Firestore 'status_transition_logs' 컬렉션에 저장
 * 
 * @param userId 사용자 ID
 * @param positionId 포지션 ID
 * @param from 이전 상태
 * @param to 새로운 상태
 * @param event 발생한 이벤트
 * @param triggeredBy 트리거 주체
 * @param metadata 추가 메타데이터
 * @returns 상태 전환 로그 객체
 * 
 * Functions 사용 예시:
 * ```typescript
 * const log = createStatusTransitionLog(
 *   userId,
 *   positionId,
 *   'entry_order_pending',
 *   'entry_unconfirmed',
 *   'entry_order_executed',
 *   'system',
 *   { orderId: 'ORDER_123', reason: '주문 체결 완료' }
 * );
 * await firestore.collection('status_transition_logs').doc(log.id).set(log);
 * ```
 */
export function createStatusTransitionLog(
  userId: string,
  positionId: string,
  from: PositionLifecycleStatus,
  to: PositionLifecycleStatus,
  event: StatusTransitionEvent,
  triggeredBy: 'system' | 'user' | 'scheduler',
  metadata: StatusTransitionLog['metadata'] = {}
): StatusTransitionLog {
  return {
    id: `${positionId}_${Date.now()}`,
    userId,
    positionId,
    fromStatus: from,
    toStatus: to,
    event,
    timestamp: new Date() as Timestamp,
    triggeredBy,
    metadata
  };
}

/**
 * ===================================================================
 * 팀별 주요 사용 가이드 및 책임 분담
 * ===================================================================
 * 
 * 🎯 Next.js 개발팀 담당 영역:
 * 
 * 1. UI 상태 표시:
 *    - STATUS_DISPLAY_INFO 활용한 포지션 카드/테이블 렌더링
 *    - 상태별 색상, 라벨, 아이콘 표시
 *    - 진행률 바 및 상태 애니메이션
 * 
 * 2. 사용자 액션 처리:
 *    - getAvailableActions()로 버튼 활성화/비활성화
 *    - isValidTransition()으로 클라이언트 측 검증
 *    - 사용자 액션 트리거 (확정, 취소, 청산)
 * 
 * 3. 실시간 업데이트:
 *    - Firestore 실시간 리스너로 상태 변경 감지
 *    - 토스트 알림 및 상태 변경 애니메이션
 *    - 포지션 목록 필터링 및 정렬
 * 
 * 4. 히스토리 표시:
 *    - PositionLifecycleInfo로 상태 변경 타임라인
 *    - 주문 히스토리 및 상세 정보 표시
 *    - 만료 시간 카운트다운
 * 
 * ⚡ Functions 주문 처리팀 담당 영역:
 * 
 * 1. 일일 동기화 작업:
 *    - DAILY_SYNC_RULES 기반 모든 포지션 상태 확인
 *    - 거래소 API 결과와 Firestore 상태 동기화
 *    - 상태 불일치 자동 수정
 * 
 * 2. 주문 처리 워크플로우:
 *    - 거래소 API 호출 및 결과 처리
 *    - 주문 체결/실패/취소에 따른 상태 전환
 *    - isValidTransition()으로 서버 측 검증
 * 
 * 3. 만료 및 정리 작업:
 *    - entry_unconfirmed 상태 24시간 초과 시 expired 전환
 *    - 오래된 로그 정리 및 아카이브
 *    - 시스템 성능 모니터링
 * 
 * 4. 로깅 및 모니터링:
 *    - createStatusTransitionLog()로 모든 상태 변경 기록
 *    - DailyCleanupResult 생성 및 알림
 *    - 에러 처리 및 복구 로직
 * 
 * 5. API 권한 관리:
 *    - getAvailableActions()로 API 엔드포인트 권한 검증
 *    - 사용자별 액션 제한 및 보안 검사
 * 
 * 🔄 팀 간 협업 포인트:
 * 
 * 1. 상태 정의 변경:
 *    - PositionLifecycleStatus 수정 시 양 팀 동시 배포 필요
 *    - UI 색상 및 라벨 변경 시 Functions 알림 로직도 업데이트
 * 
 * 2. 새로운 액션 추가:
 *    - STATUS_DISPLAY_INFO.actions 배열 업데이트
 *    - Next.js: UI 버튼 추가, Functions: API 엔드포인트 추가
 * 
 * 3. 상태 전환 로직 변경:
 *    - ALLOWED_TRANSITIONS 매트릭스 수정 시 협의 필요
 *    - 클라이언트 검증과 서버 검증 로직 일치 보장
 * 
 * 4. 에러 처리:
 *    - Functions에서 발생한 에러를 Next.js에서 적절히 표시
 *    - 사용자 친화적 에러 메시지 및 복구 가이드 제공
 */