# Opinor API - Sample JSON Responses

Sample JSON data for all API endpoints needed by the Opinor mobile app.

---

## 1. Authentication Endpoints

### 1.1 Login Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "paul@coffee.com",
      "firstName": "Paul",
      "lastName": "Barista",
      "businessName": "Paul's coffee",
      "role": "business_owner",
      "avatar": "https://api.example.com/avatars/user_123.jpg",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

### 1.2 Signup Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_456",
      "email": "newuser@business.com",
      "firstName": "John",
      "lastName": "Doe",
      "businessName": "John's Restaurant",
      "role": "business_owner",
      "createdAt": "2025-12-31T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Account created successfully"
}
```

### 1.3 User Profile Response
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "paul@coffee.com",
    "firstName": "Paul",
    "lastName": "Barista",
    "businessName": "Paul's coffee",
    "businessCategory": "Café/Coffee Shop",
    "businessAddress": "123 Main St, City, Country",
    "businessPhone": "+1234567890",
    "businessEmail": "contact@paulscoffee.com",
    "logo": "https://api.example.com/logos/paulscoffee.jpg",
    "avatar": "https://api.example.com/avatars/user_123.jpg",
    "language": "en",
    "theme": "light",
    "notificationsEnabled": true,
    "emailNotifications": true,
    "pushNotifications": true,
    "verifiedEmail": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2025-12-31T15:45:00Z"
  }
}
```

---

## 2. Home Dashboard Endpoints

### 2.1 Dashboard Summary (Average Rating & Quick Stats)
```json
{
  "success": true,
  "data": {
    "averageRating": 4.2,
    "totalFeedbacksToday": 20,
    "totalFeedbacksThisWeek": 120,
    "totalFeedbacksThisMonth": 480,
    "lastUpdated": "2025-12-31T16:30:00Z"
  }
}
```

### 2.2 Received Feedback Chart Data (Last 7/30 days)
```json
{
  "success": true,
  "data": {
    "period": "week",
    "feedbackTrend": [
      {
        "date": "2025-12-25",
        "count": 45,
        "averageRating": 4.1
      },
      {
        "date": "2025-12-26",
        "count": 52,
        "averageRating": 4.3
      },
      {
        "date": "2025-12-27",
        "count": 48,
        "averageRating": 4.0
      },
      {
        "date": "2025-12-28",
        "count": 55,
        "averageRating": 4.4
      },
      {
        "date": "2025-12-29",
        "count": 60,
        "averageRating": 4.2
      },
      {
        "date": "2025-12-30",
        "count": 58,
        "averageRating": 4.3
      },
      {
        "date": "2025-12-31",
        "count": 50,
        "averageRating": 4.1
      }
    ]
  }
}
```

### 2.3 Last Achievements
```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "id": "ach_001",
        "title": "Rising Star",
        "description": "Received 100 feedbacks this month",
        "icon": "star",
        "badgeColor": "#FFD700",
        "unlockedAt": "2025-12-28T10:15:00Z",
        "progress": 100
      },
      {
        "id": "ach_002",
        "title": "Excellent Rating",
        "description": "Maintained 4.5+ rating for 7 days",
        "icon": "medal",
        "badgeColor": "#87CEEB",
        "unlockedAt": "2025-12-25T14:20:00Z",
        "progress": 100
      },
      {
        "id": "ach_003",
        "title": "Consistency King",
        "description": "Posted feedback responses 10 days in a row",
        "icon": "fire",
        "badgeColor": "#FF6347",
        "unlockedAt": "2025-12-29T09:00:00Z",
        "progress": 100
      }
    ]
  }
}
```

---

## 3. Feedbacks Endpoints

### 3.1 Get All Feedbacks (with pagination)
```json
{
  "success": true,
  "data": {
    "feedbacks": [
      {
        "id": "feedback_001",
        "rating": 4,
        "text": "The overall experience was really good. The only reason I didn't give five stars is because my order took a bit longer than expected, but everything else was great. I'll definitely come again.",
        "date": "2025-10-11T14:30:00Z",
        "customerName": "Anonymous",
        "customerEmail": null,
        "sentiment": "positive",
        "category": "service",
        "status": "new",
        "location": "Cafeteria",
        "hasResponse": false
      },
      {
        "id": "feedback_002",
        "rating": 5,
        "text": "Excellent coffee and friendly staff! Highly recommend.",
        "date": "2025-10-11T12:15:00Z",
        "customerName": "Sarah M.",
        "customerEmail": "sarah@example.com",
        "sentiment": "positive",
        "category": "product_quality",
        "status": "viewed",
        "location": "Main Branch",
        "hasResponse": true,
        "response": {
          "text": "Thank you Sarah! We appreciate your kind words and look forward to seeing you again!",
          "respondedAt": "2025-10-11T16:45:00Z"
        }
      },
      {
        "id": "feedback_003",
        "rating": 2,
        "text": "The coffee was cold and the wait time was too long.",
        "date": "2025-10-11T10:00:00Z",
        "customerName": "John D.",
        "customerEmail": "john@example.com",
        "sentiment": "negative",
        "category": "service",
        "status": "new",
        "location": "Downtown",
        "hasResponse": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### 3.2 Get Single Feedback
```json
{
  "success": true,
  "data": {
    "id": "feedback_001",
    "rating": 4,
    "text": "The overall experience was really good. The only reason I didn't give five stars is because my order took a bit longer than expected, but everything else was great. I'll definitely come again.",
    "date": "2025-10-11T14:30:00Z",
    "customerName": "Anonymous",
    "customerEmail": null,
    "sentiment": "positive",
    "category": "service",
    "status": "new",
    "location": "Cafeteria",
    "images": [],
    "tags": ["delivery", "timing"],
    "hasResponse": false,
    "helpful": 0,
    "unhelpful": 0,
    "createdAt": "2025-10-11T14:30:00Z",
    "updatedAt": "2025-10-11T14:30:00Z"
  }
}
```

### 3.3 Submit Response to Feedback
```json
{
  "success": true,
  "data": {
    "id": "response_001",
    "feedbackId": "feedback_001",
    "text": "Thank you for your feedback! We appreciate you taking the time to share your experience.",
    "respondedAt": "2025-12-31T16:50:00Z",
    "respondedBy": "user_123"
  },
  "message": "Response submitted successfully"
}
```

---

## 4. Reports Endpoints

### 4.1 Statistics by Period (Today, This Week, This Month)
```json
{
  "success": true,
  "data": {
    "period": "today",
    "statistics": {
      "totalFeedbacks": 24,
      "negativeCount": 8,
      "positiveCount": 16,
      "neutralCount": 0,
      "averageRating": 4.2,
      "ratingOutOf5": "4.2 / 5",
      "trend": "+1.2%"
    }
  }
}
```

Alternative response for "This Week":
```json
{
  "success": true,
  "data": {
    "period": "week",
    "statistics": {
      "totalFeedbacks": 120,
      "negativeCount": 45,
      "positiveCount": 75,
      "neutralCount": 0,
      "averageRating": 4.1,
      "ratingOutOf5": "4.1 / 5",
      "trend": "+8%"
    }
  }
}
```

Alternative response for "This Month":
```json
{
  "success": true,
  "data": {
    "period": "month",
    "statistics": {
      "totalFeedbacks": 480,
      "negativeCount": 190,
      "positiveCount": 290,
      "neutralCount": 0,
      "averageRating": 4.9,
      "ratingOutOf5": "4.9 / 5",
      "trend": "+12%"
    }
  }
}
```

### 4.2 Rating Distribution (Diagram Data)
```json
{
  "success": true,
  "data": {
    "period": "today",
    "ratingDistribution": [
      {
        "ratingScore": 1.0,
        "count": 12,
        "percentage": 5.2
      },
      {
        "ratingScore": 1.5,
        "count": 8,
        "percentage": 3.5
      },
      {
        "ratingScore": 2.0,
        "count": 15,
        "percentage": 6.5
      },
      {
        "ratingScore": 2.5,
        "count": 20,
        "percentage": 8.7
      },
      {
        "ratingScore": 3.0,
        "count": 18,
        "percentage": 7.8
      },
      {
        "ratingScore": 3.5,
        "count": 22,
        "percentage": 9.6
      },
      {
        "ratingScore": 4.0,
        "count": 10,
        "percentage": 4.3
      },
      {
        "ratingScore": 4.5,
        "count": 14,
        "percentage": 6.1
      },
      {
        "ratingScore": 5.0,
        "count": 16,
        "percentage": 7.0
      }
    ]
  }
}
```

Alternative for "This Week":
```json
{
  "success": true,
  "data": {
    "period": "week",
    "ratingDistribution": [
      {
        "ratingScore": 1.0,
        "count": 45,
        "percentage": 3.8
      },
      {
        "ratingScore": 1.5,
        "count": 60,
        "percentage": 5.0
      },
      {
        "ratingScore": 2.0,
        "count": 55,
        "percentage": 4.6
      },
      {
        "ratingScore": 2.5,
        "count": 70,
        "percentage": 5.8
      },
      {
        "ratingScore": 3.0,
        "count": 80,
        "percentage": 6.7
      },
      {
        "ratingScore": 3.5,
        "count": 65,
        "percentage": 5.4
      },
      {
        "ratingScore": 4.0,
        "count": 75,
        "percentage": 6.3
      },
      {
        "ratingScore": 4.5,
        "count": 50,
        "percentage": 4.2
      },
      {
        "ratingScore": 5.0,
        "count": 68,
        "percentage": 5.7
      }
    ]
  }
}
```

### 4.3 Monthly Reports History
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "report_001",
        "date": "December 2025",
        "location": "Cafeteria",
        "feedbackCount": 36,
        "averageRating": 4.3,
        "generatedAt": "2025-12-31T23:59:59Z",
        "reportUrl": "https://api.example.com/reports/report_001.pdf"
      },
      {
        "id": "report_002",
        "date": "November 2025",
        "location": "Restaurant",
        "feedbackCount": 28,
        "averageRating": 4.1,
        "generatedAt": "2025-11-30T23:59:59Z",
        "reportUrl": "https://api.example.com/reports/report_002.pdf"
      },
      {
        "id": "report_003",
        "date": "October 2025",
        "location": "Coffee Shop",
        "feedbackCount": 45,
        "averageRating": 4.5,
        "generatedAt": "2025-10-31T23:59:59Z",
        "reportUrl": "https://api.example.com/reports/report_003.pdf"
      },
      {
        "id": "report_004",
        "date": "September 2025",
        "location": "Cafeteria",
        "feedbackCount": 31,
        "averageRating": 4.0,
        "generatedAt": "2025-09-30T23:59:59Z",
        "reportUrl": "https://api.example.com/reports/report_004.pdf"
      },
      {
        "id": "report_005",
        "date": "August 2025",
        "location": "Bar & Grill",
        "feedbackCount": 52,
        "averageRating": 4.6,
        "generatedAt": "2025-08-31T23:59:59Z",
        "reportUrl": "https://api.example.com/reports/report_005.pdf"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 12,
      "totalPages": 2
    }
  }
}
```

### 4.4 Detailed Monthly Report
```json
{
  "success": true,
  "data": {
    "reportId": "report_001",
    "date": "December 2025",
    "location": "Cafeteria",
    "summary": {
      "totalFeedbacks": 36,
      "averageRating": 4.3,
      "totalPositive": 28,
      "totalNegative": 8,
      "trend": "+5%"
    },
    "dailyBreakdown": [
      {
        "date": "2025-12-01",
        "feedbackCount": 3,
        "averageRating": 4.0
      },
      {
        "date": "2025-12-02",
        "feedbackCount": 2,
        "averageRating": 4.5
      },
      {
        "date": "2025-12-03",
        "feedbackCount": 4,
        "averageRating": 4.2
      }
    ],
    "topComments": [
      {
        "feedbackId": "feedback_001",
        "text": "Great service!",
        "rating": 5,
        "count": 15
      },
      {
        "feedbackId": "feedback_002",
        "text": "Good food, long wait",
        "rating": 3,
        "count": 8
      }
    ],
    "categories": [
      {
        "category": "service",
        "count": 18,
        "sentiment": "positive"
      },
      {
        "category": "product_quality",
        "count": 12,
        "sentiment": "positive"
      },
      {
        "category": "ambiance",
        "count": 6,
        "sentiment": "neutral"
      }
    ],
    "generatedAt": "2025-12-31T23:59:59Z"
  }
}
```

### 4.5 Export Report (PDF/CSV Response)
```json
{
  "success": true,
  "data": {
    "reportId": "report_001",
    "exportUrl": "https://api.example.com/reports/report_001_export_20251231.pdf",
    "fileName": "Paul's_Coffee_Report_December_2025.pdf",
    "fileSize": "2.5 MB",
    "createdAt": "2025-12-31T16:55:00Z",
    "expiresAt": "2026-01-07T16:55:00Z"
  },
  "message": "Report exported successfully. Download link is valid for 7 days."
}
```

---

## 5. Notifications Endpoints

### 5.1 Get Notifications
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_001",
        "type": "new_feedback",
        "title": "New Feedback Received",
        "message": "You received a new 5-star feedback",
        "relatedId": "feedback_001",
        "icon": "chatbubble-outline",
        "isRead": false,
        "createdAt": "2025-12-31T16:30:00Z"
      },
      {
        "id": "notif_002",
        "type": "report_ready",
        "title": "Monthly Report Ready",
        "message": "Your December report is now available",
        "relatedId": "report_001",
        "icon": "document-outline",
        "isRead": false,
        "createdAt": "2025-12-31T00:00:00Z"
      },
      {
        "id": "notif_003",
        "type": "achievement_unlocked",
        "title": "Achievement Unlocked!",
        "message": "You've reached 100 feedbacks this month",
        "relatedId": "ach_001",
        "icon": "star",
        "isRead": true,
        "createdAt": "2025-12-28T10:15:00Z"
      },
      {
        "id": "notif_004",
        "type": "rating_alert",
        "title": "Rating Alert",
        "message": "Your rating dropped below 4.0",
        "relatedId": null,
        "icon": "alert-circle",
        "isRead": true,
        "createdAt": "2025-12-25T14:20:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### 5.2 Mark Notification as Read
```json
{
  "success": true,
  "data": {
    "id": "notif_001",
    "isRead": true,
    "readAt": "2025-12-31T16:32:00Z"
  },
  "message": "Notification marked as read"
}
```

---

## 6. QR Code Endpoints

### 6.1 Get QR Code
```json
{
  "success": true,
  "data": {
    "id": "qrcode_001",
    "businessId": "user_123",
    "qrCode": "https://api.example.com/qr/user_123.png",
    "feedbackUrl": "https://opinor.app/feedback/user_123",
    "scans": 156,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2025-12-31T16:30:00Z"
  }
}
```

### 6.2 QR Code Statistics
```json
{
  "success": true,
  "data": {
    "qrcodeId": "qrcode_001",
    "totalScans": 156,
    "scansThisMonth": 45,
    "scansThisWeek": 12,
    "scansToday": 3,
    "feedbacksGenerated": 120,
    "conversionRate": 76.9,
    "topLocations": [
      {
        "location": "Main Branch",
        "scans": 95,
        "percentage": 60.9
      },
      {
        "location": "Downtown",
        "scans": 45,
        "percentage": 28.8
      },
      {
        "location": "Airport",
        "scans": 16,
        "percentage": 10.3
      }
    ]
  }
}
```

---

## 7. Profile/Settings Endpoints

### 7.1 Update Profile
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "paul@coffee.com",
    "firstName": "Paul",
    "lastName": "Barista",
    "businessName": "Paul's Premium Coffee",
    "avatar": "https://api.example.com/avatars/user_123_updated.jpg",
    "updatedAt": "2025-12-31T16:35:00Z"
  },
  "message": "Profile updated successfully"
}
```

### 7.2 Update Business Info
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "businessName": "Paul's Coffee",
    "businessCategory": "Café/Coffee Shop",
    "businessAddress": "123 Main St, City, Country",
    "businessPhone": "+1234567890",
    "businessEmail": "contact@paulscoffee.com",
    "logo": "https://api.example.com/logos/paulscoffee_updated.jpg",
    "updatedAt": "2025-12-31T16:35:00Z"
  },
  "message": "Business information updated successfully"
}
```

### 7.3 Update Settings
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "language": "en",
    "theme": "light",
    "notificationsEnabled": true,
    "emailNotifications": true,
    "pushNotifications": true,
    "emailFrequency": "daily",
    "updatedAt": "2025-12-31T16:35:00Z"
  },
  "message": "Settings updated successfully"
}
```

---

## 8. Error Responses

### 8.1 Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  }
}
```

### 8.2 Authentication Error
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid credentials"
  },
  "statusCode": 401
}
```

### 8.3 Not Found Error
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  },
  "statusCode": 404
}
```

### 8.4 Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred"
  },
  "statusCode": 500
}
```

---

## Summary of All Endpoints Needed

| Feature | Endpoints | Method |
|---------|-----------|--------|
| **Auth** | POST /auth/login | Login |
| | POST /auth/signup | Register |
| | POST /auth/refresh | Refresh Token |
| | GET /auth/me | Get Current User |
| **Profile** | GET /users/profile | Get Profile |
| | PATCH /users/profile | Update Profile |
| | PATCH /users/business-info | Update Business |
| | PATCH /users/settings | Update Settings |
| **Feedbacks** | GET /feedbacks | List All |
| | GET /feedbacks/:id | Get Single |
| | POST /feedbacks/:id/response | Submit Response |
| | GET /feedbacks/stats/summary | Dashboard Summary |
| **Reports** | GET /reports/statistics | Statistics |
| | GET /reports/ratings-distribution | Rating Distribution |
| | GET /reports/history | Monthly History |
| | GET /reports/:id | Detailed Report |
| | POST /reports/:id/export | Export PDF/CSV |
| **Home** | GET /dashboard/summary | Dashboard Data |
| | GET /dashboard/feedback-chart | Feedback Trend |
| | GET /dashboard/achievements | Achievements |
| **Notifications** | GET /notifications | List |
| | PATCH /notifications/:id/read | Mark as Read |
| **QR Code** | GET /qrcode | Get QR Code |
| | GET /qrcode/stats | QR Statistics |

---

**Note**: All timestamps should be in ISO 8601 format (UTC).
All monetary values should include currency code if applicable.
Use pagination with page, limit, total, and totalPages for list endpoints.
Include proper error handling with appropriate HTTP status codes.
