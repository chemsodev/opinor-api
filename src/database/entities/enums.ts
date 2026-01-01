export enum BusinessType {
  RESTAURANT = 'RESTAURANT',
  BEACH = 'BEACH',
  CLINIC = 'CLINIC',
  CAFE = 'CAFE',
  HOTEL = 'HOTEL',
  RETAIL = 'RETAIL',
  OTHER = 'OTHER',
}

export enum JoinRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
}

export enum FeedbackSentiment {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral',
}

export enum FeedbackCategory {
  SERVICE = 'service',
  PRODUCT_QUALITY = 'product_quality',
  AMBIANCE = 'ambiance',
  PRICING = 'pricing',
  CLEANLINESS = 'cleanliness',
  OTHER = 'other',
}

export enum FeedbackStatus {
  NEW = 'new',
  VIEWED = 'viewed',
  RESPONDED = 'responded',
  ARCHIVED = 'archived',
}

export enum NotificationType {
  NEW_FEEDBACK = 'new_feedback',
  REPORT_READY = 'report_ready',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  RATING_ALERT = 'rating_alert',
  SYSTEM = 'system',
}

export enum AchievementType {
  FEEDBACK_COUNT = 'feedback_count',
  RATING_STREAK = 'rating_streak',
  RESPONSE_STREAK = 'response_streak',
  FIRST_FEEDBACK = 'first_feedback',
}
