# ShopKart

ShopKart is a full-stack e-commerce application built with the MERN stack (MongoDB, Express, React, and Node.js). The platform is designed to provide a smooth shopping experience with secure customer authentication, product browsing, wishlist management, cart operations, and secure payment processing using Razorpay.

This project demonstrates a production-style architecture with a dedicated backend API and a modern frontend client, offering a complete customer journey from account creation to checkout and order confirmation.

## Overview

ShopKart enables users to:

- Register and sign in securely.
- Browse and search products by category and name.
- View detailed product information.
- Save products to a wishlist.
- Add items to a shopping cart and update quantities.
- Complete checkout using Razorpay.
- Track order status and payment state.

The application follows a modern client-server separation model:

- Frontend: React + Vite + JavaScript
- Backend: Node.js + Express + MongoDB
- Authentication: JWT-based cookies
- Payments: Razorpay integration

## Key Features

### Customer Experience
- User registration and login
- Protected routes for authenticated access
- Cookie-based JWT authentication for secure session management
- Role-independent shopping experience for individual customers

### Product Management
- Product listing with live search
- Category-based filtering
- Detailed product pages with descriptions, price, and stock information
- Inventory validation during checkout

### Wishlist and Cart
- Add or remove products from the wishlist
- Maintain personalized cart data per customer
- Quantity updates and stock checks before purchase
- Cart total and count display in the UI

### Checkout and Payments
- Razorpay order creation
- Payment verification using signatures
- Reserved inventory updates after successful payment
- Order persistence in MongoDB

### Order Tracking
- Order history retrieval for authenticated users
- Payment and order status tracking
- Structured order records with item details and payment metadata

## Tech Stack

### Frontend
- React 19
- Vite
- JavaScript (JSX)
- React Router DOM
- Axios
- CSS for component styling

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose ODM
- JWT
- bcryptjs
- Razorpay
- dotenv
- CORS
- cookie-parser

## Project Structure

```text
mern project-3/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   ├── .env
│   ├── index.js
│   ├── package.json
│   ├── package-lock.json
│   ├── seedProducts.js
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── .gitignore
│   ├── .oxlintrc.json
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── README.md
│   └── ...
│
├── PROJECT_SUMMARY.md
├── .gitignore
├── README.md
└── ...
```

## Application Architecture

The application follows a simple but effective layered architecture:

1. Client Layer
   - React frontend renders the UI and manages user interactions.
   - Browser routes handle login, registration, home, product browsing, cart, wishlist, and orders.

2. API Layer
   - Express routes expose REST endpoints for products, customers, wishlist, cart, and payments.
   - Requests are validated and processed through controllers.

3. Data Layer
   - MongoDB stores customer profiles, products, carts, wishlists, and orders.
   - Mongoose models provide schema-based data validation and interaction.

4. Security Layer
   - Passwords are hashed before storage.
   - JWT tokens are issued and stored in HTTP-only cookies.
   - Protected endpoints validate user identity using middleware.

## Backend Functionality

The backend exposes RESTful endpoints for core features:

- Customer registration and authentication
- Product listing and retrieval
- Search and category filtering
- Wishlist creation and item management
- Cart operations including quantity updates and removal
- Payment order creation and verification
- Order placement and retrieval

The backend also includes a health endpoint:

- `GET /health` – checks MongoDB connection status

## Frontend Functionality

The frontend provides a user-centric shopping experience with:

- `Login` and `Register` pages
- Home and product listing pages
- Product detail page for each item
- Wishlist management page
- Cart summary and checkout flow
- Orders page for user purchase history
- Protected route gating for authenticated screens

## Authentication Flow

The application uses a cookie-based JWT authentication model:

1. The user logs in with email and password.
2. The backend validates the credentials.
3. A JWT is generated and stored as an HTTP-only cookie.
4. Authenticated requests include the cookie automatically.
5. Middleware verifies the token and populates `req.user` for protected routes.
6. The server clears the token during logout.

This approach helps keep authentication state secure while simplifying session handling for browser-based clients.

## Payment Workflow

The project integrates with Razorpay to support online transactions:

1. The customer initiates checkout with items in the cart.
2. The backend creates a Razorpay order and returns payment credentials.
3. The frontend opens the Razorpay checkout flow.
4. The backend verifies the payment signature.
5. Stock is updated and the order is marked as paid if validation succeeds.

This ensures a secure and reliable checkout process for digital payments.

## Environment Configuration

Create a `.env` file in the backend directory based on the `.env.example` template:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/shopkart
JWT_SECRET=replace_with_a_long_random_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Notes:
- `MONGO_URI` should point to a local MongoDB instance or a MongoDB Atlas cluster.
- `JWT_SECRET` should be a strong, random secret for signing tokens.
- Razorpay keys are required for payment functionality.

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "mern project-3"
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The backend runs by default on port `5000` unless configured otherwise.

### 3. Frontend Setup

Open a new terminal and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend typically runs on `http://localhost:5173`.

## Available Scripts

### Backend
- `npm run dev` – start the server in watch mode
- `npm run start` – run the backend normally
- `npm run seed` – seed products into the database

### Frontend
- `npm run dev` – start the Vite development server
- `npm run build` – build the production bundle
- `npm run preview` – preview the production build locally
- `npm run lint` – lint the frontend codebase

## Database Models

The application uses MongoDB with schema-based models such as:

- `Customer` – stores personal details, password hash, wishlist, and cart
- `Product` – stores product metadata including name, price, stock, and category
- `Order` – tracks customer purchases, payment status, and Razorpay metadata

## Notes

- The project is structured as a clean full-stack application suitable for learning, demo deployment, or extension into a production-ready commerce solution.
- The application can be extended with additional features such as admin dashboards, product reviews, order filters, coupon management, and advanced analytics.
- For a more detailed project breakdown, refer to [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md).

## License

This project is currently distributed without an explicit license file. Please confirm repository ownership and licensing requirements before commercial deployment or public distribution.
