# Hotel Booking System — Modern MERN Stack University Project

![Hotel Booking System Banner](https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80)

A complete, state-of-the-art, web-based **Hotel Booking System** built with **MongoDB, Express.js, React.js (Vite), and Node.js (MERN Stack)** tailored for university BIM/CS project requirements. The system supports full end-to-end customer hotel discovery, real-time backend date availability validation, server-side price calculation, modular payment gateway integration (Mock, eSewa, Khalti), role-based dashboards, verified stay reviews, and event-driven notifications.

---

## 🌟 Key Features & Functional Modules

### 1. Customer Discovery & Search Engine
- **Hero & Search Controls**: Search hotels by name, city destination (e.g., Pokhara, Kathmandu, Nagarkot, Chitwan, Patan, Bhaktapur), check-in/out dates, and guest count.
- **Dynamic Filters**: Filter properties by price range, star rating, room types, and luxury amenities.
- **Hotel Details & Room Catalog**: Detailed property showcases with high-resolution image galleries, room specs, and pricing per night.

### 2. Verified Booking Engine & Date Overlap Protection
- **Backend Availability Algorithm**: Strictly prevents double bookings using the overlap condition:
  $$\text{Overlap IF: } (\text{RequestedCheckIn} < \text{ExistingCheckOut}) \land (\text{RequestedCheckOut} > \text{ExistingCheckIn})$$
- **Server-Side Price Calculation**: Room rates are fetched directly from MongoDB (`room.pricePerNight \times \text{nights}`). Client-sent totals are strictly ignored.
- **Booking Management**: Customer booking history timeline with status badges (`pending`, `confirmed`, `completed`, `cancelled`), printable receipts, and cancellation policy guards.

### 3. Modular Payment Architecture (Adapter Pattern)
- **Decoupled Architecture**: Payment providers implement the standard `IPaymentGateway` interface.
- **Gateway Adapters Included**:
  - `MockGatewayAdapter`: Development simulator supporting `completed`, `failed`, and `cancelled` status testing.
  - `EsewaGatewayAdapter`: Production integration for eSewa (Nepal Payment Gateway).
  - `KhaltiGatewayAdapter`: Production integration for Khalti (Nepal Payment Gateway).
- **Duplicate Payment Protection**: Prevents double transactions on already-paid bookings.

### 4. Role-Based Dashboards (RBAC)
- **Customer Portal**: Booking stats, spent totals, recent reservations table, profile management.
- **Hotel Manager Dashboard**: Scoped strictly to manager's properties (`managerId === req.user._id`). Full CRUD for hotel listings, room specs, and reservation checkouts.
- **System Admin Control Center**: Master system oversight, user account moderation (Block/Unblock), inventory audit, and global financial analytics.

### 5. Verified Stay Reviews & Rating Aggregation
- **Verified Stay Guard**: Only customers with a `completed` booking can submit a review for that hotel.
- **1–5 Star Rating Bounds**: Server-validated star rating constraints.
- **Backend Rating Distribution**: Computes average rating and star distribution percentages (5★, 4★, 3★, 2★, 1★) via MongoDB `$facet` / `$group` aggregations.

### 6. Event-Driven Notifications & Toast UI
- **Notification Engine**: Dispatches notifications for reservation confirmations, payment results, and review moderation.
- **Navbar Bell Dropdown**: Real-time unread notification badge counter and mark-as-read actions.
- **Toast Notifications**: Reusable floating toast notification context (`toast.success()`, `toast.error()`, `toast.info()`).

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React.js (Vite v5), Tailwind CSS v3, React Router v6, Axios, Lucide Icons |
| **Backend** | Node.js, Express.js (REST API), Helmet, CORS, Morgan |
| **Database** | MongoDB (Mongoose ODM) with compound index optimization |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs password hashing |
| **Testing** | Node Test Runner, custom automated test suites (34/34 passing) |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Server running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed     # Populate database with realistic sample hotels, rooms, and demo accounts
npm run dev      # Start Express backend server on port 5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Start Vite development server on port 5173
```

---

## 🔑 Demo Account Credentials

| Role | Email | Password | Scope & Permissions |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@example.com` | `password123` | Search hotels, book rooms, simulate payments, write reviews |
| **Hotel Manager** | `manager@example.com` | `password123` | Manage owned hotels & rooms, check out guests, view property revenue |
| **Admin** | `admin@example.com` | `password123` | Global user moderation (Block/Unblock), system overview, master audits |

---

## 🧪 Running Automated Test Suites

The system includes 34 automated unit and integration tests covering date overlap rules, pricing calculations, payment state transitions, duplicate prevention, and review eligibility:

```bash
cd backend

# Run Booking Engine Overlap Tests (14 Tests)
npm run test:booking

# Run Payment Adapter & Idempotency Tests (9 Tests)
npm run test:payment

# Run Verified Review & Rating Distribution Tests (11 Tests)
npm run test:review
```

---

## 📦 Production Build Verification

```bash
cd frontend
npm run build
```

---

## 📄 License
This project is open-source and intended for academic and university presentation purposes.
