# TransitOps: Smart Transport Operations Platform

![React](https://img.shields.io/badge/React-19.2.7-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Express.js](https://img.shields.io/badge/Express.js-5.2.1-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![Vite](https://img.shields.io/badge/Vite-8.1.4-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![NodeJS](https://img.shields.io/badge/Node.js-v24.14.0-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-7.8.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18.4-316192?style=for-the-badge&logo=postgresql&logoColor=white)

## Overview

TransitOps is an end-to-end transport operations platform designed to digitize vehicle, driver, dispatch, maintenance, and expense management. The platform enforces business rules and provides operational insights, replacing manual logbooks and spreadsheets to prevent scheduling conflicts, underutilized vehicles, missed maintenance, and inaccurate expense tracking.

## Database Schema

View the database schema on DrawSQL: [DrawSQL Database Link](https://drawsql.app/teams/goon-squad/diagrams/transitops-db)

## Target Users

* **Fleet Manager**: Oversees fleet assets, maintenance, vehicle lifecycle, and operational efficiency.
* **Driver**: Creates trips, assigns vehicles and drivers, and monitors active deliveries.
* **Safety Officer**: Ensures driver compliance, tracks license validity, and monitors safety scores.
* **Financial Analyst**: Reviews operational expenses, fuel consumption, maintenance costs, and profitability.

## Technology Stack

The platform follows a modular architecture separating frontend interfaces and backend APIs.

### Frontend

| Component                   | Technology     | Version | Description                             |
| --------------------------- | -------------- | ------- | --------------------------------------- |
| **UI Framework**      | React          | 19.2.7  | Component-based UI creation             |
| **Build Tool**        | Vite           | 8.1.4   | Fast frontend build tool                |
| **Language**          | TypeScript     | 7.0.2   | Typed JavaScript for robust development |
| **CSS Framework**     | Tailwind CSS   | 4.3.0   | Utility-first styling                   |
| **Component Library** | DaisyUI        | 5.6.17  | Pre-built UI components                 |
| **Icons**             | Phosphor Icons | 2.1.10  | Clean and consistent iconography        |

### Backend

| Component                     | Technology   | Version       | Description                                                              |
| ----------------------------- | ------------ | ------------- | ------------------------------------------------------------------------ |
| **Runtime Environment** | Node.js      | v24.14.0      | JavaScript runtime for scalable network applications                     |
| **Framework**           | Express.js   | 5.2.1         | Minimal and flexible web application framework                           |
| **ORM**                 | Prisma       | 7.8.0         | Database toolkit and object-relational mapper                            |
| **Database**            | PostgreSQL   | 18.4          | Relational DB with enumerated types, complex relationships, and triggers |
| **Authentication**      | JWT & bcrypt | 9.0.3 / 6.0.0 | JSON Web Tokens for stateless auth and bcrypt for password hashing       |

## API & Routing (Backend)

| Route Group              | Base Path            | Description                                              | Access Roles                       |
| ------------------------ | -------------------- | -------------------------------------------------------- | ---------------------------------- |
| **Authentication** | `/api/auth`        | User login, registration, and profile management         | All Authenticated                  |
| **Dashboard**      | `/api/dashboard`   | Key Performance Indicators and real-time statistics      | All Authenticated                  |
| **Vehicles**       | `/api/vehicles`    | CRUD for fleet vehicles and document management          | Fleet Manager, Dispatcher          |
| **Drivers**        | `/api/drivers`     | CRUD for drivers, status updates, safety monitoring      | Safety Officer, Dispatcher         |
| **Trips**          | `/api/trips`       | Trip creation, dispatching, completion, and cancellation | Dispatcher, Financial Analyst      |
| **Maintenance**    | `/api/maintenance` | Maintenance logging and shop workflows                   | Fleet Manager, Financial Analyst   |
| **Expenses**       | `/api/expenses`    | Fuel logs and general vehicle expenses                   | Fleet Manager, Dispatcher, Analyst |
| **Reports**        | `/api/reports`     | Analytical data and ROI calculations via DB views        | Financial Analyst                  |

## Testing

All automated tests, including unit and integration tests, reside in the `tests/` directory of the backend repository to ensure application stability and reliability.

## Functionalities

### 1. Authentication

* Implemented secure login using email and password.
* Supported Role-Based Access Control (RBAC).
* Strictly restricted access to authenticated users.

### 2. Dashboard

* Displayed Key Performance Indicators (KPIs): Active Vehicles, Available Vehicles, Vehicles in Maintenance, Active Trips, Pending Trips, Drivers On Duty, and Fleet Utilization (%).
* Provided filters by vehicle type, status, and region.

### 3. Vehicle Registry

* Maintained a master list of vehicles with: Registration Number (unique), Vehicle Name/Model, Type, Maximum Load Capacity, Odometer, Acquisition Cost, and Status.
* Enforced status values: Available, On Trip, In Shop, Retired.

### 4. Driver Management

* Maintained driver profiles including: Name, License Number, License Category, License Expiry Date, Contact Number, Safety Score, and Status.
* Enforced status values: Available, On Trip, Off Duty, Suspended.

### 5. Trip Management

* Created trips by selecting a source, destination, available vehicle, available driver, cargo weight, and planned distance.
* Automated trip lifecycle: Draft -> Dispatched -> Completed -> Cancelled.

### 6. Maintenance

* Logged maintenance records for vehicles.
* Automatically switched vehicle status to In Shop upon adding to a Maintenance Log, removing it from the dispatch selection pool.

### 7. Fuel and Expense Management

* Recorded fuel logs (liters, cost, date) and other expenses such as tolls or maintenance.
* Automatically computed total operational cost (Fuel + Maintenance) per vehicle.

### 8. Reports and Analytics

* Displayed Fuel Efficiency (Distance/Fuel), Fleet Utilization, Operational Cost, and Vehicle ROI.
* Supported data export.

## Business Rules Enforced

1. The vehicle registration number was made strictly unique.
2. Retired or In Shop vehicles were hidden from the dispatch selection.
3. Drivers with expired licenses or Suspended status were blocked from being assigned to trips.
4. A driver or vehicle already marked On Trip was prevented from being assigned to another trip.
5. Cargo Weight validation was added to prevent exceeding the vehicle maximum load capacity.
6. Dispatching a trip automatically changed both the vehicle and driver status to On Trip.
7. Completing a trip automatically changed both the vehicle and driver status back to Available.
8. Cancelling a dispatched trip restored the vehicle and driver to Available.
9. Creating an active maintenance record automatically changed vehicle status to In Shop.
10. Closing maintenance restored the vehicle to Available (unless retired).

## Deliverables & Features

**Mandatory Deliverables:**

* Responsive web interface
* Authentication with RBAC
* CRUD for Vehicles and Drivers
* Trip Management with validations
* Automatic status transitions
* Maintenance workflow
* Fuel and Expense tracking
* Dashboard with KPIs
* Charts and visual analytics

**Bonus Features:**

* Search, filters, and sorting
* Dark mode

## Closure

Built from scratch within an intense 8-hour hackathon, **TransitOps** successfully demonstrates a fully functional, end-to-end transport operations ERP.

By replacing manual spreadsheets with a centralized, automated system, it provides immediate value in operational visibility, resource utilization, and cost tracking. This project showcases not just rapid prototyping, but the ability to enforce strict business rules within a short timeframe.
