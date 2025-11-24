# Ardhisasa Lite API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-api-url.com/api
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

### Refresh Token
When the access token expires (15 minutes), use the refresh token to get a new access token.

---

## Auth Endpoints

### Register User
**POST** `/auth/register`

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "nationalId": "12345678",
  "kraPin": "A123456789B",
  "phoneNumber": "+254712345678",
  "role": "buyer",
  "county": "Nairobi" // Required only for county_admin
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "buyer",
      "isApproved": true
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### Login
**POST** `/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Refresh Token
**POST** `/auth/refresh`

**Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

### Logout
**POST** `/auth/logout`
*Requires Authentication*

### Get Current User
**GET** `/auth/me`
*Requires Authentication*

---

## Parcel Endpoints

### Get All Parcels
**GET** `/parcels`
*Requires Authentication*

**Query Parameters:**
- `county` - Filter by county
- `subCounty` - Filter by subcounty
- `constituency` - Filter by constituency
- `ward` - Filter by ward
- `owner` - Filter by owner ID
- `status` - Filter by status

### Get Parcel by ID
**GET** `/parcels/:id`
*Requires Authentication*

### Verify Title Deed
**GET** `/parcels/title/:titleNumber`
*Requires Authentication*

### Get My Parcels
**GET** `/parcels/my/parcels`
*Requires Authentication*

### Search Parcels
**GET** `/parcels/search?q=<search_query>`
*Requires Authentication*

### Create Parcel
**POST** `/parcels`
*Requires: County Admin or NLC Admin*

**Body:**
```json
{
  "titleNumber": "NAIROBI/BLOCK5/123",
  "lrNumber": "LR123/456",
  "ownerId": "user_id",
  "county": "Nairobi",
  "subCounty": "Westlands",
  "constituency": "Westlands",
  "ward": "Parklands",
  "size": {
    "value": 0.5,
    "unit": "acres"
  },
  "coordinates": {
    "latitude": -1.2921,
    "longitude": 36.8219
  },
  "zoning": "residential",
  "marketValue": 5000000
}
```

### Update Parcel
**PUT** `/parcels/:id`
*Requires: County Admin or NLC Admin*

---

## Transfer Endpoints

### Initiate Transfer
**POST** `/transfers`
*Requires: Seller*

**Body:**
```json
{
  "parcelId": "parcel_id",
  "buyerNationalId": "87654321",
  "buyerKraPin": "B987654321C",
  "agreedPrice": 5000000
}
```

### Get All Transfers
**GET** `/transfers`
*Requires Authentication*

**Query Parameters:**
- `status` - Filter by status
- `county` - Filter by county

### Get Transfer by ID
**GET** `/transfers/:id`
*Requires Authentication*

### County Verify Transfer
**PUT** `/transfers/:id/county-verify`
*Requires: County Admin*

**Body:**
```json
{
  "documentsVerified": true,
  "identityVerified": true,
  "landDetailsVerified": true,
  "remarks": "All documents verified",
  "approve": true
}
```

### NLC Approve Transfer
**PUT** `/transfers/:id/nlc-approve`
*Requires: NLC Admin*

**Body:**
```json
{
  "approve": true,
  "remarks": "Transfer approved"
}
```

### Cancel Transfer
**PUT** `/transfers/:id/cancel`
*Requires: Seller or NLC Admin*

**Body:**
```json
{
  "reason": "Reason for cancellation"
}
```

---

## User Endpoints

### Get All Users
**GET** `/users`
*Requires: NLC Admin*

**Query Parameters:**
- `role` - Filter by role
- `isApproved` - Filter by approval status
- `county` - Filter by county

### Get Pending County Admins
**GET** `/users/pending-admins`
*Requires: NLC Admin*

### Approve County Admin
**PUT** `/users/:id/approve`
*Requires: NLC Admin*

**Body:**
```json
{
  "approved": true
}
```

### Get User by ID
**GET** `/users/:id`
*Requires Authentication*

### Update User
**PUT** `/users/:id`
*Requires Authentication*

---

## Region Endpoints

### Get All Regions
**GET** `/regions`

### Get Counties List
**GET** `/regions/counties/list`

### Get Region by County
**GET** `/regions/:county`

---

## Document Endpoints

### Upload Document
**POST** `/documents`
*Requires Authentication*

**Form Data:**
- `file` - The document file
- `documentType` - Type of document
- `relatedModel` - Model name (Parcel/Transfer/User)
- `relatedId` - ID of related entity

### Get All Documents
**GET** `/documents`
*Requires Authentication*

**Query Parameters:**
- `relatedModel` - Filter by model
- `relatedId` - Filter by entity ID

### Verify Document
**PUT** `/documents/:id/verify`
*Requires: County Admin or NLC Admin*

**Body:**
```json
{
  "isVerified": true,
  "remarks": "Document verified"
}
```

---

## Notification Endpoints

### Get Notifications
**GET** `/notifications`
*Requires Authentication*

**Query Parameters:**
- `isRead` - Filter by read status

### Get Unread Count
**GET** `/notifications/unread/count`
*Requires Authentication*

### Mark as Read
**PUT** `/notifications/:id/read`
*Requires Authentication*

### Mark All as Read
**PUT** `/notifications/read-all`
*Requires Authentication*

### Delete Notification
**DELETE** `/notifications/:id`
*Requires Authentication*

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Error Response Format

```json
{
  "success": false,
  "message": "Error message"
}
```

## Socket.io Events

### Client → Server
- `join` - Join user's notification room

### Server → Client
- `notification` - New notification received

**Event Data:**
```json
{
  "type": "transfer_approved",
  "title": "Transfer Approved",
  "message": "Your transfer has been approved",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```
