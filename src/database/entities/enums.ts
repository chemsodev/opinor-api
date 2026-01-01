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
  // Essential Notifications (Pack de base)
  // 🔴 Critical alerts
  CRITICAL_NEGATIVE_FEEDBACK = 'critical_negative_feedback', // 1★ or 2★ reviews
  CRITICAL_KEYWORDS = 'critical_keywords', // Contains critical keywords
  LOW_SATISFACTION_SCORE = 'low_satisfaction_score', // Score drops below 50%

  // 🟢 Positive feedback
  POSITIVE_FEEDBACK = 'positive_feedback', // 4★ or 5★ reviews
  COMPLIMENT = 'compliment', // Positive comments about staff, food, etc.

  // 🟡 Admin & subscription
  SUBSCRIPTION_EXPIRING = 'subscription_expiring', // Subscription expires soon
  PAYMENT_CONFIRMED = 'payment_confirmed', // Payment confirmed
  TRIAL_ENDING = 'trial_ending', // Trial period ending
  ACCOUNT_BLOCKED = 'account_blocked', // Account blocked by admin
  ACCOUNT_UNBLOCKED = 'account_unblocked', // Account unblocked by admin
  PASSWORD_CHANGED = 'password_changed', // Password changed successfully
  ADMIN_REPLY = 'admin_reply', // Admin replied to feedback

  // Additional Notifications (À la carte)
  // 🟠 Performance notifications
  PERFORMANCE_DROP = 'performance_drop', // Satisfaction dropped vs last period
  PERFORMANCE_IMPROVEMENT = 'performance_improvement', // Improvement detected
  SHIFT_PERFORMANCE = 'shift_performance', // Performance diff between shifts/days

  // 🔵 Insights & reports
  REPORT_READY = 'report_ready', // Monthly report available
  WEEKLY_SUMMARY = 'weekly_summary', // Weekly insights
  INSIGHT_ALERT = 'insight_alert', // Important insight detected

  // ⚪ System notifications
  QR_FIRST_SCAN = 'qr_first_scan', // QR code scanned first time
  QR_SCAN_MILESTONE = 'qr_scan_milestone', // QR scanned X times today
  APP_UPDATE = 'app_update', // App update available
  SYSTEM = 'system', // General system notification

  // Legacy types (for backwards compatibility)
  NEW_FEEDBACK = 'new_feedback',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  RATING_ALERT = 'rating_alert',
}

export enum AchievementType {
  FEEDBACK_COUNT = 'feedback_count',
  RATING_STREAK = 'rating_streak',
  RESPONSE_STREAK = 'response_streak',
  FIRST_FEEDBACK = 'first_feedback',
}
