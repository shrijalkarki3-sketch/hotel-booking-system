# Hotel Booking System — University Project Documentation (BIM / CS)

## 1. Project Overview & Problem Statement
Traditional hotel reservation workflows often suffer from double-booking conflicts, unverified client-side price tampering, fragmented payment processing, and fake customer reviews. This project delivers a production-ready, full-stack web application designed to solve these challenges using a robust **MERN (MongoDB, Express.js, React.js, Node.js)** architecture.

### Objectives
1. **Automated Overlap Protection**: Eliminate double bookings via backend date validation algorithms.
2. **Server-Authoritative Pricing**: Ensure financial integrity by computing stay totals server-side.
3. **Decoupled Payment Processing**: Provide a modular gateway adapter pattern supporting Mock, eSewa, and Khalti digital wallets.
4. **Verified Stay Reviews**: Enforce a strict policy requiring a completed stay before a guest can submit a review.
5. **Role-Based Resource Isolation**: Guarantee that hotel managers can only access and control properties they own.

---

## 2. System Architecture & Data Flow

```
                      ┌─────────────────────────────────┐
                      │    Vite React Frontend (UI)     │
                      │  (Tailwind CSS + Axios + Auth)  │
                      └────────────────┬────────────────┘
                                       │ HTTPS / REST API
                                       ▼
                      ┌─────────────────────────────────┐
                      │    Express.js REST API Server   │
                      │   (Controllers, Middlewares)    │
                      └────────────────┬────────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
  ┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
  │ MongoDB Database │       │  Payment Adapter │       │  Notification    │
  │ (Mongoose Models)│       │ (Mock, eSewa, etc)│       │  Engine          │
  └──────────────────┘       └──────────────────┘       └──────────────────┘
```

---

## 3. Database Entity Relationship (ER) Summary

### Collections & Schemas
1. **Users (`User.js`)**:
   - `_id`, `name`, `email` (unique index), `password` (bcrypt hash), `role` (`'customer' | 'hotel_manager' | 'admin'`), `status` (`'active' | 'blocked'`).
2. **Hotels (`Hotel.js`)**:
   - `_id`, `name`, `description`, `location` (`city`, `address`, `country`), `managerId` (Ref: User), `rating` (`average`, `count`), `status`.
3. **Rooms (`Room.js`)**:
   - `_id`, `hotelId` (Ref: Hotel), `roomNumber`, `roomType` (`'Single' | 'Double' | 'Deluxe' | 'Suite' | 'Family'`), `pricePerNight`, `capacity`, `status`.
4. **Bookings (`Booking.js`)**:
   - `_id`, `userId` (Ref: User), `hotelId` (Ref: Hotel), `roomId` (Ref: Room), `checkIn` (Date), `checkOut` (Date), `numberOfNights`, `totalAmount`, `bookingStatus` (`'pending' | 'confirmed' | 'completed' | 'cancelled'`), `paymentStatus` (`'unpaid' | 'paid' | 'refunded'`).
   - Compound Index: `{ roomId: 1, checkIn: 1, checkOut: 1, bookingStatus: 1 }`.
5. **Payments (`Payment.js`)**:
   - `_id`, `bookingId` (Ref: Booking), `userId` (Ref: User), `amount`, `paymentMethod`, `gateway` (`'mock' | 'esewa' | 'khalti'`), `transactionId` (Unique), `paymentStatus` (`'initiated' | 'completed' | 'failed' | 'cancelled'`).
6. **Reviews (`Review.js`)**:
   - `_id`, `userId` (Ref: User), `hotelId` (Ref: Hotel), `bookingId` (Ref: Booking), `rating` (1–5), `comment`, `status` (`'approved' | 'pending' | 'rejected' | 'hidden'`).
7. **Notifications (`Notification.js`)**:
   - `_id`, `userId` (Ref: User), `type`, `title`, `message`, `relatedEntityId`, `isRead`.

---

## 4. Security & Compliance Measures
- **Stateless JWT Authorization**: Bearer token authentication verified on every protected API route.
- **Role-Based Access Control (RBAC)**: Role verification middleware prevents horizontal and vertical privilege escalation.
- **Resource Scoping**: Backend checks `managerId === req.user._id` before permitting hotel/room edits.
- **Environment Protection**: Credentials, JWT secrets, and database URIs are isolated in `backend/.env` (excluded from Git).

---

## 5. Summary of REST API Endpoints

### Authentication & Users
- `POST /api/v1/auth/register` — Register user account
- `POST /api/v1/auth/login` — Login & receive JWT token
- `GET /api/v1/auth/me` — Get authenticated profile
- `PATCH /api/v1/users/:id/status` — Admin block/unblock user account

### Hotel & Room Management
- `GET /api/v1/hotels` — Search hotels with location, price, rating, amenity filters
- `GET /api/v1/hotels/:id` — Get detailed hotel page & room catalog
- `POST /api/v1/hotels` — Manager/Admin create hotel listing
- `POST /api/v1/hotels/:hotelId/rooms` — Manager/Admin add room spec to hotel

### Booking & Payment Engine
- `POST /api/v1/bookings/check-availability` — Verify room availability & calculate price
- `POST /api/v1/bookings` — Create authenticated booking
- `POST /api/v1/payments/initiate` — Generate payment transaction session
- `POST /api/v1/payments/verify` — Verify transaction & synchronize booking status

### Reviews & Notifications
- `GET /api/v1/reviews/hotel/:hotelId` — Get published reviews & rating distribution
- `POST /api/v1/reviews` — Submit verified stay review
- `GET /api/v1/notifications` — Fetch user notifications & unread count

---

## 6. Testing Strategy & Results
All 34 automated unit/integration tests passed successfully:
- **Booking Engine**: 14/14 Passed (Date overlap equation, back-to-back stays, price validation, cancellation rules).
- **Payment Subsystem**: 9/9 Passed (Gateway adapter instantiation, success/fail verification, duplicate payment protection).
- **Verified Stay Reviews**: 11/11 Passed (Stay eligibility, star rating boundaries, rating distribution calculation).
- **Production Build**: Vite build passed in 4.54s with 0 errors.
