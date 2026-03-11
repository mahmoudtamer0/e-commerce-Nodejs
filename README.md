# E-commerce Backend API

A fully-featured backend API for an e-commerce platform built with Node.js, Express, and MongoDB.  
Supports products, orders, categories, reviews, and user authentication.

---

## 🚀 Features

- User Authentication (JWT)
- Product Management (CRUD)
- Order Management
- Category Management
- Product Reviews
- Admin-only protected routes
- Image uploads (Cloudinary)
- Input validation

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB / Mongoose
- JWT Authentication
- Multer for file uploads


---

## ⚙️ Installation

1. Clone the repository

git clone https://github.com/YOUR_USERNAME/ecommerce-api

Install dependencies

npm install

Create a .env file

JWT_SECRET=e-commerce@2025Secure_Token!9fA3kXqPzR
DB_URL=mongodb+srv://mahmoudtamerdeveloper_db_user:mahmoudtamer2004DB@mahmoud.6hcrqom.mongodb.net/E-commerce
EMAIL_PASS=xsmtpsib-0952270e579230f5ddb3b88227b43d11fa637b916fc9800699592ce0b38b68ca-OmT1Hpzqqa5mz76I
EMAIL_USER=a3662f001@smtp-brevo.com
BREVO_API=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

Run the server
node src/server.js

📡 API Endpoints

📡 API Endpoints (User Management / Authentication)
Authentication & Registration
Method	     Endpoint	              Description	                                   Auth
POST	/api/v1/users/register	Register a new user (upload profile image + posts)	Public
POST	/api/v1/users/verify-email	Verify user email	Public
POST	/api/v1/users/login	Login with email & password	Public
GET	/api/v1/users/refresh	Refresh access token	User
POST	/api/v1/users/logout	Logout current session	User
PATCH	/api/v1/users/changepassword	Change password and logout all devices	User

Profile Management
Method	Endpoint	Description	Auth
PATCH	/api/v1/users/me/update	Update user profile (image + posts)	User
GET	/api/v1/users/:userId	Get public profile of a user	Public
Admin Actions

Method	Endpoint	Description	Auth
PATCH	/api/v1/users/ban/:userId	Ban a user	Admin



Products
Method	Endpoint	Description	Auth
GET	/api/v1/products	Get all products	Public
POST	/api/v1/products	Add a new product (max 5 images)	Admin
PATCH	/api/v1/products/:prodId	Update product details (with images)	Admin
PATCH	/api/v1/products/:prodId/delete	Delete a product	Admin

Example Request: Add Product

POST /api/v1/products
{
  "name": "Wireless Mouse",
  "price": 25,
  "category": "catId",
  "description": "High-quality wireless mouse"
}

Example Response

{
  "status": "success",
  "data": {
    "product": {
      "_id": "6412a8f6c4e3...",
      "name": "Wireless Mouse",
      "price": 25,
      "category": "Electronics",
      "images": [],
      "createdAt": "2026-03-11T10:00:00.000Z"
    }
  }
}
Orders
Method	Endpoint	Description	Auth
GET	/api/v1/orders	Get all orders	Admin
POST	/api/v1/orders	Create a new order	User
GET	/api/v1/orders/:orderId	Get order details	User
PATCH	/api/v1/orders/:orderId	Edit an order	User
PATCH	/api/v1/orders/:orderId/status	Update order status	Admin

Example Request: Create Order

POST /api/v1/orders
{
  "products": [
    { "productId": "6412a8f6c4e3...", "quantity": 2 }
  ],
  "shippingAddress": "123 Street, Cairo, Egypt"
}

Example Response

{
  "status": "success",
  "data": {
    "order": {
      "_id": "6423b1f7d5e9...",
      "user": "6411f2a3c5b2...",
      "products": [
        { "productId": "6412a8f6c4e3...", "quantity": 2 }
      ],
      "status": "pending",
      "totalPrice": 50,
      "createdAt": "2026-03-11T10:15:00.000Z"
    }
  }
}
Categories
Method	Endpoint	Description	Auth
GET	/api/v1/categories	Get all categories	Public
POST	/api/v1/categories	Add a new category	Admin
PATCH	/api/v1/categories/:catId	Update category	Admin
DELETE	/api/v1/categories/:catId	Delete category	Admin

Example Request: Add Category

POST /api/v1/categories
{
  "name": "Electronics"
}

Example Response

{
  "status": "success",
  "data": {
    "category": {
      "_id": "6412c0f9d4e5...",
      "name": "Electronics",
      "createdAt": "2026-03-11T10:20:00.000Z"
    }
  }
}
Reviews
Method	Endpoint	Description	Auth
POST	/api/v1/products/:prodId/reviews	Add a review for a product	User

Example Request: Add Review

POST /api/v1/products/6412a8f6c4e3/reviews
{
  "rating": 5,
  "comment": "Excellent product!"
}

Example Response

{
  "status": "success",
  "data": {
    "review": {
      "_id": "6434d2f6a7c9...",
      "product": "6412a8f6c4e3...",
      "user": "6411f2a3c5b2...",
      "rating": 5,
      "comment": "Excellent product!",
      "createdAt": "2026-03-11T10:25:00.000Z"
    }
  }
}
📌 Key Learning Outcomes

Building RESTful APIs with Node.js and Express

JWT authentication and role-based authorization

Handling file uploads with Multer and Cloudinary

Structuring scalable backend projects

Designing MongoDB schemas for e-commerce systems

👨‍💻 Author

Mahmoud Tamer
Backend Developer (Node.js)

GitHub: https://github.com/mahmoudtamer0
