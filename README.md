# 🛍️ Shop-Co — E-Commerce REST API

> A full-featured e-commerce backend built with Node.js & Express, supporting authentication, product management, orders, reviews, and more.

[![Portfolio](https://img.shields.io/badge/Portfolio-mahmoudtamer-black?style=for-the-badge&logo=vercel)](https://mahmoud-tamer-portfolio.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-mahmoudtamer0-181717?style=for-the-badge&logo=github)](https://github.com/mahmoudtamer0)
[![Postman](https://img.shields.io/badge/API%20Docs-Postman-FF6C37?style=for-the-badge&logo=postman)](https://www.postman.com/mahmoudtamer0-8816438/workspace/default-workspace/collection/50295562-d9c8f40c-9f51-4ef7-be12-1efcd1cdef60?action=share&source=copy-link&creator=50295562)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Postman Collection](#-postman-collection)
- [API Reference](#api-reference)
  - [Auth & Users](#auth--users)
  - [Products](#products)
  - [Orders](#orders)
  - [Reviews](#reviews)
  - [Categories](#categories)
- [Authentication](#authentication)
- [Roles & Permissions](#roles--permissions)
- [File Uploads](#file-uploads)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)

---

## Overview

**Shop-Co** is a RESTful e-commerce API that handles the full shopping lifecycle — from user registration and OAuth login to product browsing, cart management, order placement, and admin controls.

Key capabilities:
- 🔐 JWT-based auth with refresh tokens + Google OAuth2
- 📦 Product CRUD with multi-image upload
- 🛒 Cart calculation and order management
- ⭐ Product reviews
- 🏷️ Category management
- 🛡️ Role-based access control (USER / ADMIN)
- 📧 Email verification via OTP

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Auth | JWT + Passport.js (Google OAuth2) |
| File Storage | Multer (multi-file upload) |
| Validation | Custom validators (middleware) |
| Rate Limiting | express-rate-limit |
| API Docs | Swagger (swagger-jsdoc + swagger-ui-express) |

---

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/mahmoudtamer0/shop-co.git
cd shop-co

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env

# 4. Start the development server
npm run dev
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/shop-co

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/users/google/callback

# Email (for OTP)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your@email.com
MAIL_PASS=your_mail_password
```

---

## 📮 Postman Collection

Test all API endpoints directly via the public Postman collection:

[![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/mahmoudtamer0-8816438/workspace/default-workspace/collection/50295562-d9c8f40c-9f51-4ef7-be12-1efcd1cdef60?action=share&source=copy-link&creator=50295562)

> The collection includes all endpoints grouped by module, with example requests and environment variables for `baseUrl` and `token`.

---

## API Reference

**Base URL:** `http://localhost:3000/api/v1`

---

### Auth & Users

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/users/register` | ❌ | — | Register a new user (supports image + posts upload) |
| `POST` | `/users/verify-email` | ❌ | — | Verify email using OTP |
| `POST` | `/users/resend-otp` | ❌ | — | Resend email verification OTP |
| `POST` | `/users/login` | ❌ | — | Login with email & password |
| `GET` | `/users/google` | ❌ | — | Initiate Google OAuth2 login |
| `GET` | `/users/google/callback` | ❌ | — | Google OAuth2 callback |
| `POST` | `/users/refresh` | ❌ | — | Refresh access token |
| `POST` | `/users/logout` | ❌ | — | Logout current session |
| `PATCH` | `/users/me/update` | ✅ | USER | Update profile (supports image + posts upload) |
| `PATCH` | `/users/changepassword` | ✅ | USER | Change password & logout all devices |
| `PATCH` | `/users/ban/:userId` | ✅ | ADMIN | Ban a user |
| `GET` | `/users/:userId` | ❌ | — | Get public user profile |

---

#### Register

```http
POST /api/v1/users/register
Content-Type: multipart/form-data
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Full name |
| `email` | string | ✅ | Valid email address |
| `password` | string | ✅ | Min 8 characters |
| `image` | file | ❌ | Profile picture (max 1) |
| `posts` | file[] | ❌ | Post images (max 5) |

**Response `201`:**
```json
{
  "message": "Registration successful. Check your email for OTP.",
  "userId": "64abc..."
}
```

---

#### Login

```http
POST /api/v1/users/login
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response `200`:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

> ⚠️ Login endpoint is **rate-limited** — see [Rate Limiting](#rate-limiting).

---

### Products

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/products/` | ✅ | ADMIN | Add a new product (up to 5 images) |
| `GET` | `/products/` | ❌ | — | Get all products |
| `GET` | `/products/:prodId` | ❌ | — | Get single product details |
| `PATCH` | `/products/:prodId` | ✅ | ADMIN | Update a product (up to 5 images) |
| `DELETE` | `/products/:prodId` | ✅ | ADMIN | Delete a product |
| `POST` | `/products/many` | ❌ | — | Bulk insert products |
| `POST` | `/products/add-to-cart` | ❌ | — | Add product to cart |
| `POST` | `/products/calculate-cart` | ❌ | — | Calculate cart totals |

---

#### Add Product

```http
POST /api/v1/products/
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Product name |
| `price` | number | ✅ | Product price |
| `description` | string | ✅ | Product description |
| `category` | string | ✅ | Category ID |
| `stock` | number | ✅ | Available quantity |
| `productImages` | file[] | ❌ | Up to 5 product images |

---

#### Calculate Cart

```http
POST /api/v1/products/calculate-cart
Content-Type: application/json
```

```json
{
  "items": [
    { "productId": "64abc...", "quantity": 2 },
    { "productId": "64def...", "quantity": 1 }
  ]
}
```

---

### Orders

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/orders/` | ✅ | USER | Place a new order |
| `GET` | `/orders/` | ✅ | ADMIN | Get all orders |
| `GET` | `/orders/my-orders` | ✅ | USER | Get current user's orders |
| `GET` | `/orders/:orderId` | ✅ | USER | Get order details |
| `PATCH` | `/orders/:orderId` | ✅ | USER | Edit an order |
| `PATCH` | `/orders/:orderId/status` | ✅ | ADMIN | Update order status |

---

#### Place Order

```http
POST /api/v1/orders/
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "items": [
    { "productId": "64abc...", "quantity": 2 }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Cairo",
    "country": "Egypt"
  }
}
```

---

#### Order Status Values

| Status | Description |
|--------|-------------|
| `PENDING` | Order placed, awaiting confirmation |
| `CONFIRMED` | Order confirmed by admin |
| `SHIPPED` | Order has been shipped |
| `DELIVERED` | Order delivered to customer |
| `CANCELLED` | Order was cancelled |

---

### Reviews

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/review/:prodId` | ✅ | USER | Add a review for a product |

---

#### Add Review

```http
POST /api/v1/review/:prodId
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "rating": 5,
  "comment": "Great product, highly recommended!"
}
```

---

### Categories

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `GET` | `/categories/` | ❌ | — | Get all categories |
| `POST` | `/categories/` | ✅ | ADMIN | Add a new category |
| `PATCH` | `/categories/:catId` | ✅ | ADMIN | Update a category |
| `DELETE` | `/categories/:catId` | ✅ | ADMIN | Delete a category |

---

## Authentication

This API uses **JWT Bearer Token** authentication.

Include the token in the `Authorization` header for protected routes:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Refresh Flow

```
POST /api/v1/users/refresh
Body: { "refreshToken": "your_refresh_token" }
```

Returns a new `accessToken` without requiring re-login.

### Google OAuth Flow

```
1. GET  /api/v1/users/google              → Redirects to Google
2. GET  /api/v1/users/google/callback     → Google redirects here
3. API returns { accessToken, refreshToken }
```

---

## Roles & Permissions

| Role | Permissions |
|------|-------------|
| `USER` | View products, place orders, write reviews, manage own profile |
| `ADMIN` | All USER permissions + manage products, categories, orders, and ban users |

---

## File Uploads

File uploads are handled via **Multer** with the following rules:

| Endpoint | Field Name | Max Files | Notes |
|----------|------------|-----------|-------|
| `/users/register` | `image` | 1 | Profile picture |
| `/users/register` | `posts` | 5 | Post images |
| `/users/me/update` | `image` | 1 | Profile picture |
| `/users/me/update` | `posts` | 5 | Post images |
| `/products/` (POST) | `productImages` | 5 | Product images |
| `/products/:prodId` (PATCH) | `productImages` | 5 | Product images |

All uploads use `multipart/form-data`.

---

## Rate Limiting

The login endpoint is protected against brute-force attacks:

| Endpoint | Limit |
|----------|-------|
| `POST /api/v1/users/login` | Restricted (configured via `authLimiter`) |

Exceeding the limit returns:
```json
{
  "status": "error",
  "message": "Too many login attempts. Please try again later."
}
```

---

## Error Handling

All errors follow a consistent response format:

```json
{
  "status": "error",
  "message": "Descriptive error message",
  "errors": [ ... ]
}
```

| Status Code | Meaning |
|-------------|---------|
| `400` | Bad Request / Validation Error |
| `401` | Unauthorized — missing or invalid token |
| `403` | Forbidden — insufficient role |
| `404` | Resource Not Found |
| `429` | Too Many Requests |
| `500` | Internal Server Error |

---

## 📁 Project Structure

```
shop-co/
├── src/
│   ├── modules/
│   │   ├── users/
│   │   │   ├── user.router.js
│   │   │   ├── user.controller.js
│   │   │   └── user.validator.js
│   │   ├── products/
│   │   │   ├── product.router.js
│   │   │   ├── product.controller.js
│   │   │   └── product.validator.js
│   │   ├── orders/
│   │   │   ├── order.router.js
│   │   │   ├── order.controller.js
│   │   │   └── order.validator.js
│   │   ├── reviews/
│   │   │   ├── review.router.js
│   │   │   └── review.controller.js
│   │   └── categories/
│   │       ├── category.router.js
│   │       └── category.controller.js
│   ├── middleware/
│   │   ├── verifyToken.js
│   │   ├── allowTo.js
│   │   └── upload.js
│   └── app.js
├── .env.example
├── package.json
└── README.md
```

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Mahmoud Tamer**

[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-black?style=flat-square&logo=vercel)](https://mahmoud-tamer-portfolio.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-mahmoudtamer0-181717?style=flat-square&logo=github)](https://github.com/mahmoudtamer0)

---

*Built with ❤️ by Mahmoud Tamer*
