# Opinor API - Postman Collection

## 📁 Files

| File                                          | Description                              |
| --------------------------------------------- | ---------------------------------------- |
| `Opinor_API.postman_collection.json`          | Main collection with all endpoints       |
| `Opinor_Development.postman_environment.json` | Development environment (localhost:3000) |
| `Opinor_Production.postman_environment.json`  | Production environment template          |

## 🚀 Quick Start

### 1. Import into Postman

1. Open Postman
2. Click **Import** (or Ctrl+O)
3. Drag and drop all 3 JSON files
4. Select **Opinor - Development** environment from the dropdown

### 2. Test Accounts

| Role  | Email                 | Password    |
| ----- | --------------------- | ----------- |
| Admin | `admin@opinor.com`    | `Admin@123` |
| User  | `demo@restaurant.com` | `Demo@123`  |

### 3. Business Code for Testing

```
DA469176
```

## 📂 Collection Structure

```
Opinor API/
├── Auth - User/
│   ├── Login
│   ├── Register (with invitation code)
│   ├── Get Current User
│   ├── Refresh Token
│   ├── Forgot Password
│   ├── Reset Password
│   └── Logout
├── Auth - Admin/
│   ├── Admin Login
│   └── Get Current Admin
├── Join Requests/
│   ├── Submit Join Request (Public)
│   ├── Verify Invitation Code (Public)
│   ├── Get All Join Requests (Admin)
│   ├── Get Join Request by ID (Admin)
│   ├── Approve Join Request (Admin)
│   └── Reject Join Request (Admin)
├── Feedbacks - Public/
│   ├── Submit Feedback
│   └── Get Public Stats
├── Feedbacks - Business Owner/
│   ├── Get My Feedbacks
│   ├── Get Feedback by ID
│   ├── Get My Stats
│   └── Hide Feedback (Soft Delete)
├── Users/
│   ├── Get Profile
│   └── Update Profile
└── 🧪 Test Flows/
    ├── Flow 1: Complete Registration/
    │   ├── 1. Submit Join Request
    │   ├── 2. Admin Login
    │   ├── 3. Approve Join Request
    │   ├── 4. Complete Registration
    │   └── 5. Verify User Profile
    └── Flow 2: Feedback Cycle/
        ├── 1. User Login
        ├── 2. Submit 5-Star Feedback
        ├── 3. Get Public Stats
        ├── 4. View My Feedbacks
        └── 5. View My Detailed Stats
```

## 🔧 Variables

The collection uses variables that are automatically populated:

| Variable           | Description             | Auto-set By         |
| ------------------ | ----------------------- | ------------------- |
| `baseUrl`          | API base URL            | Environment         |
| `accessToken`      | User JWT token          | Login endpoints     |
| `refreshToken`     | User refresh token      | Login endpoints     |
| `adminAccessToken` | Admin JWT token         | Admin login         |
| `businessCode`     | Business unique code    | Login/Register      |
| `joinRequestId`    | Current join request ID | Submit join request |
| `invitationCode`   | Invitation code         | Submit join request |
| `feedbackId`       | Current feedback ID     | Submit feedback     |

## 🧪 Running Test Flows

### Complete Registration Flow

1. Select **Opinor - Development** environment
2. Open **🧪 Test Flows > Flow 1: Complete Registration**
3. Run requests in order (1 → 5)
4. Each request auto-populates variables for the next

### Feedback Cycle Flow

1. Select **Opinor - Development** environment
2. Open **🧪 Test Flows > Flow 2: Feedback Cycle**
3. Run requests in order (1 → 5)

### Run Entire Collection

1. Click the **Run** button on the collection
2. Select environment
3. Click **Run Opinor API**

## 📝 Notes

- **Rate Limiting**: Feedback submission is limited to 1 per IP per business per 24 hours
- **Token Expiry**: Access tokens expire in 15 minutes, use refresh token endpoint
- **Business Types**: RESTAURANT, BEACH, CLINIC, OTHER
- **Join Request Status**: PENDING, APPROVED, REJECTED

## 🔒 Authentication

Most endpoints require JWT authentication. After logging in:

1. Token is automatically saved to `accessToken` variable
2. Subsequent requests use `Bearer {{accessToken}}` header

Admin endpoints use `adminAccessToken` variable.
