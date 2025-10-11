/**
 * 기본 공통 타입 정의
 * 모든 모델에서 공통으로 사용되는 기본 타입들
 */

/**
 * 시간 타입 - 런타임에 따라 다르게 처리
 * Date 객체 또는 Firestore Timestamp 형식 지원
 */
export type Timestamp = Date | { seconds: number; nanoseconds: number };

/**
 * @deprecated Timestamp 타입을 사용하세요
 */
export type DateTimeType = Date | { seconds: number; nanoseconds: number };

/**
 * 기본 모델 인터페이스
 * 모든 도메인 모델이 상속받는 기본 인터페이스
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