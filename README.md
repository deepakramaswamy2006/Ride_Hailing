# RideFlow — Ride-Hailing & Driver Dispatch System

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://www.mongodb.com/atlas)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-Pub%2FSub-orange.svg)](https://www.rabbitmq.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A full-stack, distributed **Ride-Hailing & Driver Dispatch Simulation System** designed for high-concurrency ride lifecycle management, dynamic fare estimation, atomic driver matching, and asynchronous event pub/sub streaming.

---

## Architecture Overview

```
                      ┌─────────────────────────────────────────┐
                      │          React 18 + Vite Frontend       │
                      │  (Dashboard, Booking, Driver Console,   │
                      │   My Rides, Notifications, SystemDesign)│
                      └────────────────────┬────────────────────┘
                                           │ HTTP / REST API (Port 5001)
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │         Express.js Backend API          │
                      │                                         │
                      │  ┌───────────────┐   ┌────────────────┐ │
                      │  │ Matching Svc  │   │ Fare Engine    │ │
                      │  └───────┬───────┘   └────────────────┘ │
                      │          │                              │
                      │  ┌───────▼───────────────────────────┐  │
                      │  │ Atomic Dispatcher (Anti-Collision)│  │
                      │  └───────────────────────────────────┘  │
                      └─────────────┬───────────────────────────┘
                                    │
               ┌────────────────────┴────────────────────┐
               ▼                                         ▼
   ┌───────────────────────┐                 ┌───────────────────────┐
   │     MongoDB Atlas     │                 │   RabbitMQ Event Bus  │
   │  (Drivers, Rides,     │                 │  (Fanout Exchange,    │
   │   Payments, Events)   │                 │   Worker Subscribers) │
   └───────────────────────┘                 └───────────────────────┘
```

---

## Key Features

- **Dynamic Fare Engine**: Tier-based pricing (Economy, Premium, XL) computed via distance matrix simulation.
- **Atomic Driver Dispatch**: Eliminates double-booking race conditions through atomic MongoDB document status updates.
- **Full Ride Lifecycle**: Complete state machine tracking:
  $$\text{Requested} \longrightarrow \text{Assigned} \longrightarrow \text{In Progress} \longrightarrow \text{Completed} \longrightarrow \text{Paid}$$
- **Driver Management Console**: Real-time driver availability toggle, location simulation, and earnings tracking.
- **Event Bus Pub/Sub**: RabbitMQ event streaming with transparent in-memory fallback when RabbitMQ is offline.
- **Embedded System Design Suite**: Interactive High-Level Design (HLD) and Low-Level Design (LLD) architectural documentation right inside the web UI.
- **Simulated Payment Gateway**: Instant transaction processing with UPI, Card, and Cash reconciliation.

---

## Tech Stack

| Domain | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router, Lucide React, Modern CSS System |
| **Backend** | Node.js, Express.js, Mongoose ODM |
| **Database** | MongoDB Atlas (Cloud NoSQL) |
| **Messaging** | RabbitMQ with `amqplib` (optional Pub/Sub fanout) |
| **Tooling** | Concurrently, Vite Proxy, ESLint |

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/deepakramaswamy2006/Ride_Hailing.git
cd Ride_Hailing
```

---

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your settings:

```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/rideflow?retryWrites=true&w=majority
RABBITMQ_URL=amqp://localhost
RABBITMQ_ENABLED=false
```

> **Note for macOS Users:** Port `5000` is reserved by macOS AirPlay / Control Center. RideFlow defaults to port `5001`.

#### Setting Up Free MongoDB Atlas:
1. Create a free account at [MongoDB Atlas](https://cloud.mongodb.com).
2. Deploy a free **M0 Sandbox** cluster.
3. Under **Database Access**, create a user with read/write credentials.
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) or your current IP.
5. Click **Connect** &rarr; **Drivers** &rarr; copy the connection URI and replace `<password>` with your user's password.

---

### 3. Run the Backend

```bash
cd backend
npm install
npm run dev
```

- Server: **http://localhost:5001**
- Health Check: **http://localhost:5001/api/health**
- *Auto-seeding:* On first startup, 5 demo drivers with real-world Bengaluru coordinates are seeded automatically.

---

### 4. Run the Frontend

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

- Web Application: **http://localhost:5173**

---

## Project Structure

```
Ride_Hailing/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js      # MongoDB Atlas connection pool
│   │   │   ├── rabbitmq.js      # RabbitMQ event publisher & broker fallback
│   │   │   ├── seed.js          # Demo driver geo-seeder
│   │   │   └── subscriber.js    # Standalone event worker subscriber
│   │   ├── models/
│   │   │   ├── Driver.js        # Driver schema & availability indices
│   │   │   ├── Ride.js          # Ride schema with state machine transitions
│   │   │   ├── Payment.js       # Transaction logs & receipt references
│   │   │   └── Notification.js  # User & system event ledger
│   │   ├── controllers/
│   │   │   ├── rideController.js
│   │   │   ├── driverController.js
│   │   │   ├── paymentController.js
│   │   │   └── notificationController.js
│   │   ├── services/
│   │   │   ├── fareService.js       # Distance & dynamic fare calculator
│   │   │   ├── matchingService.js   # Nearest-available driver search
│   │   │   └── notificationService.js
│   │   ├── routes/
│   │   │   ├── rideRoutes.js
│   │   │   ├── driverRoutes.js
│   │   │   ├── paymentRoutes.js
│   │   │   └── notificationRoutes.js
│   │   ├── middleware/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Metrics, quick actions & system health
│   │   │   ├── BookRide.jsx         # Booking form, map cards & fare preview
│   │   │   ├── MyRides.jsx          # Live ride tracking & state actions
│   │   │   ├── Drivers.jsx          # Driver fleet management
│   │   │   ├── Notifications.jsx    # Real-time event notifications
│   │   │   └── SystemDesign.jsx     # Interactive HLD/LLD diagrams
│   │   ├── components/
│   │   │   └── Shared.jsx           # Reusable UI cards, badges & alerts
│   │   ├── services/
│   │   │   └── api.js               # Centralized Axios/Fetch API client
│   │   ├── App.jsx
│   │   └── index.css
│   ├── index.html
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## API Reference

### Health & Monitoring
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and timestamp |

### Rides
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/rides/estimate` | Calculate fare estimate for distance & vehicle type |
| `POST` | `/api/rides` | Request and dispatch a new ride |
| `GET` | `/api/rides` | List rides with status filtering |
| `GET` | `/api/rides/:id` | Get individual ride details |
| `GET` | `/api/rides/stats` | Aggregated dashboard revenue & trip metrics |
| `POST` | `/api/rides/:id/start` | Driver marks trip as started |
| `POST` | `/api/rides/:id/complete`| Driver marks trip as completed |
| `POST` | `/api/rides/:id/cancel` | Cancel active ride and release driver |

### Drivers
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/drivers` | List all registered drivers |
| `GET` | `/api/drivers/available`| List available drivers |
| `PATCH` | `/api/drivers/:id/availability` | Toggle driver availability (online/offline) |

### Payments
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/payments` | List transaction history |
| `POST` | `/api/payments` | Process simulated transaction (Card / UPI / Cash) |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notifications` | Fetch system and user notifications |
| `PATCH`| `/api/notifications/read-all` | Mark all notifications as read |

---

## RabbitMQ Event Bus (Optional)

RideFlow supports asynchronous message broadcasting for events like `ride.requested`, `ride.assigned`, and `ride.completed`.

### Enabling RabbitMQ:
1. In `backend/.env`, set:
   ```env
   RABBITMQ_ENABLED=true
   RABBITMQ_URL=amqp://localhost
   ```
2. Start RabbitMQ (macOS: `brew services start rabbitmq`).
3. Launch a subscriber worker:
   ```bash
   cd backend
   RABBITMQ_ENABLED=true node src/config/subscriber.js
   ```

---

## License

This project is licensed under the [MIT License](LICENSE).
