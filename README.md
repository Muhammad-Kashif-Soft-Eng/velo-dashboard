# Velo Admin Dashboard

Velo is a responsive React admin dashboard for exploring sample store data. It combines store metrics, reporting charts, customer records, product management, order details, and workspace preferences in a single interface.

> **Demo project:** Velo uses [Fake Store API](https://fakestoreapi.com/) sample data and frontend-only demo authentication. It is not a production administration system and must not be used to store or protect real customer, account, or payment information.

## Table of contents

- [Features](#features)
- [Application routes](#application-routes)
- [Technology stack](#technology-stack)
- [API information](#api-information)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [Browser storage](#browser-storage)
- [Project structure](#project-structure)
- [Data and security limitations](#data-and-security-limitations)
- [Responsive behavior](#responsive-behavior)

## Features

### Dashboard
- Store totals for revenue, orders, items sold, and customers.
- Revenue trend chart based on the available sample cart dates.
- Recent orders with customer names and calculated totals.
- Loading, empty, error, and retry states.

### Customers
- Customer directory populated from the Fake Store API users endpoint.
- Search, sorting, pagination, contact details, and address/location information.

### Products
- Product catalog with search, category filtering, sorting, and pagination.
- Create, edit, and delete product dialogs.
- Form validation and product rating/category metadata.
- Add, edit, and delete actions are clearly marked as simulated operations.

### Orders
- Cart-based order list enriched with customer and product information.
- Search, sorting, and pagination.
- Item quantities and totals calculated from current sample product prices.
- Horizontal table scrolling on small screens.

### Analytics
- 7-day, 30-day, 90-day, and all-time reporting periods.
- Revenue, order, item, and customer summaries.
- Revenue trend, order volume, and category/revenue charts.
- CSV export of the filtered order data.

### Settings and navigation
- Editable display name and email profile.
- Order updates, inventory alert, and weekly summary preferences.
- Demo sign-in, protected dashboard routes, sign-out, and a not-found page.
- Responsive sidebar navigation and mobile navigation drawer.

## Application routes

| Route | Page | Access |
|---|---|---|
| `/login` | Demo sign-in | Public |
| `/` | Dashboard overview | Protected |
| `/users` | Customer directory | Protected |
| `/products` | Product catalog and CRUD demo | Protected |
| `/orders` | Order list | Protected |
| `/analytics` | Analytics and CSV export | Protected |
| `/settings` | Profile and notification preferences | Protected |
| `*` | Not-found page | Public |

## Technology stack

| Area | Technology |
|---|---|
| UI library | React 19 |
| Routing | React Router 7 |
| Build and dev server | Vite 8 |
| Styling | Tailwind CSS 4 |
| UI primitives | shadcn-style components and Base UI |
| HTTP client | Axios |
| Charts | Recharts |
| Icons | Lucide React |
| Language | JavaScript / JSX |
| Linting | ESLint |

The project also uses the Geist variable font package and the `@` import alias, configured in `vite.config.js`.

## API information

The browser sends requests directly to `https://fakestoreapi.com`. Velo does not include a custom backend, environment variable configuration, or database.

### Fake Store API CRUD limitations

Fake Store API supports create, update, and delete endpoints for demonstration purposes, but these operations are **simulated**:

| Operation | Public API response | Velo behavior | Persistence |
|---|---|---|---|
| Create | Returns a generated or example product response | Adds the returned product to the current in-memory catalog view | Not stored by Fake Store API |
| Update | Returns an example updated product response | Applies the submitted values to the matching product in the current view | Not stored by Fake Store API |
| Delete | Returns a successful example response | Removes the product from the current in-memory catalog view | Not stored by Fake Store API |

The API may confirm the request, but it does not guarantee a real server-side database change. The following behaviors are expected:

- A successful create, update, or delete response may show a temporary change in Velo.
- Refreshing the Products page or reopening Velo reloads the original public API dataset.
- Mutations do not update Fake Store API users, carts, orders, analytics, or server-side product data.
- An API success response is not proof that the change will remain available later.
- The public service, network, and response availability can change or fail independently of Velo.

Velo clearly warns users before and after simulated CRUD actions. These controls are a frontend/API integration demo, not a real catalog-management implementation. A production version would require an authenticated backend with a persistent database and server-side validation.

| Data | Method and endpoint | Dashboard usage |
|---|---|---|
| Products | `GET /products` | Catalog, overview, orders, and analytics |
| Product | `POST /products` | Simulated product creation |
| Product | `PATCH /products/{id}` | Simulated product update |
| Product | `DELETE /products/{id}` | Simulated product deletion |
| Users | `GET /users` | Customer directory and order names |
| Carts | `GET /carts` | Orders and store analytics |

Example base URLs:

```text
https://fakestoreapi.com/products
https://fakestoreapi.com/users
https://fakestoreapi.com/carts
```

The API supplies a fixed sample dataset. Availability and request success depend on the public service and network access. Order totals are calculated from cart quantities and the current sample product prices; they are not historical transaction totals.

Fake Store API mutations do not persist changes to the source dataset. Velo keeps a product mutation visible in its current in-memory catalog view, but the change disappears after refresh or reopening the app. Customer and cart records are read-only.

## Getting started

### Requirements

- Node.js 20 or later is recommended.
- npm
- A network connection for the public demo API

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/Muhammad-Kashif-Soft-Eng/velo-dashboard.git
   cd velo-dashboard
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Start the development server:

   ```sh
   npm run dev
   ```

4. Open the local URL printed by Vite and sign in.

### Demo credentials

The sign-in form is prefilled with:

- **Email:** `admin@velo.app`
- **Password:** `demo1234`

These credentials are defined only in the frontend and are not a real account.

### Production build

```sh
npm run build
npm run preview
```

`npm run build` creates the production bundle in `dist/`. `npm run preview` serves that bundle locally for verification.

## Available scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create the optimized production bundle |
| `npm run preview` | Preview the production bundle locally |
| `npm run lint` | Run ESLint across the project |

## Browser storage

Velo uses browser storage in two places:

- `sessionStorage` key `velo-demo-auth`: stores the accepted demo email for the tab/session.
- `localStorage` key `velo-workspace-settings`: stores display name, email, and notification preferences.

Authentication settings reset when the demo session ends or sign-out is selected. Workspace preferences persist in the browser until cleared or reset.

## Project structure

```text
src/
├── components/
│   ├── layouts/       # Main layout and sidebar
│   └── ui/            # Reusable UI primitives
├── hooks/             # Responsive and shared hooks
├── lib/               # Authentication and workspace settings
├── pages/             # Dashboard, users, products, orders, analytics, settings
├── App.jsx            # Routes and protected route layout
├── index.css          # Tailwind/global styles
└── main.jsx           # React entry point and auth provider
```

## Data and security limitations

- Demo sign-in is a client-side route guard; it provides no server-side authentication or authorization.
- Credentials and all API requests are visible to the browser.
- Do not enter real credentials or sensitive data into the demo.
- Public API data and service availability are not guaranteed.
- Product mutations are simulated and are not persisted.
- Notification preferences are stored locally; Velo does not send email or push notifications.
- For a real application, replace demo auth and browser-storage data with a protected backend, server-side authorization, and a persistent database.

## Responsive behavior

The interface uses responsive layouts for desktop, tablet, and mobile sizes. Velo includes a mobile navigation drawer and collapses dashboard content into smaller grids. Customer/product controls adapt to narrow viewports, and the orders table remains horizontally scrollable instead of truncating columns.
