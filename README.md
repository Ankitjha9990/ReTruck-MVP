# ReTruck - MVP

ReTruck is a modern trucking marketplace web application designed to connect shippers with drivers. Shippers can search for trucks, view details, and book them for routes, while drivers/operators can manage their truck profiles, list routes, and handle booking requests.

## Technology Stack

* Core Framework: React (v19)
* Build Tool: Vite
* Routing: React Router DOM (v7)
* Database and Authentication: Supabase (via @supabase/supabase-js)
* Icons: Lucide React
* Styling: Vanilla CSS

## Features

### For Shippers
* Truck Search: Search for available trucks based on origin, destination, and payload requirements.
* Detailed Listings: View detailed driver/truck information including capacity, equipment types, and reviews.
* Booking Management: Request bookings, view booking statuses (pending, confirmed, completed), and view booking details.
* Saved Listings: Save trucks for quick access.
* Notifications: Receive updates when bookings are confirmed or updated.

### For Drivers & Operators
* Route Listings: Add and manage route listings (origin, destination, date, capacity, rate).
* Truck Profile: Maintain truck details (license plate, dimensions, max payload, equipment types).
* Booking Request Management: Approve or reject incoming booking requests from shippers.
* Active Bookings: Track ongoing and confirmed bookings.
* Business Profile: Manage company/operator information and settings.

## Getting Started

### Prerequisites
* Node.js (v18 or higher recommended)
* npm (Node Package Manager)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   * Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   * Open `.env` and fill in your Supabase project credentials:
     ```env
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```text
src/
├── assets/          # Static assets (images, logos)
├── components/      # Reusable UI components (buttons, cards, forms)
├── context/         # React Contexts (Auth, Booking, Search, Toast)
├── data/            # Mock data and static configuration
├── hooks/           # Custom React hooks (realtime listeners, UI helpers)
├── layouts/         # Page layout structures
├── pages/           # Application views/screens (Dashboard, Search, Auth, etc.)
├── routes/          # Navigation and route definitions
├── services/        # API integrations and database clients (Supabase)
├── styles/          # Design system, CSS variables, and global styles
└── utils/           # Helper functions and utilities
```
