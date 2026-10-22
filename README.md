
# 💳 Serverless Subscription & Billing Engine

A simple subscription and billing system. Customers can subscribe to a plan, cancel it, and get invoices automatically when their billing date arrives.

live website **https://billing-engine-n0c9.onrender.com**

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | SQLite (`better-sqlite3`) |

## Features

- Subscribe to Basic, Pro or Enterprise plans
- Cancel an active subscription
- Automatic invoice on subscription
- Billing engine that renews all due subscriptions and generates invoices
- Billing simulator to fast-forward days and test renewals instantly
- Invoice history

## Project Structure

```
billing-simple/
├── server.js          # Express backend + billing engine + database
├── package.json
└── public/
    ├── index.html     # Frontend page
    ├── style.css      # Styling
    └── app.js         # Frontend logic
```

## Prerequisites

- [Node.js](https://nodejs.org) 18 or newer

## Installation

```bash
git clone <your-repo-url>
cd billing-simple
npm install
```

## Run

```bash
node server.js
```

Open **http://localhost:3000** in your browser.

## How to Use

1. Enter your name, choose a plan and click **Subscribe**. The first invoice is created.
2. In **Run Billing**, enter `30` and click **Fast-forward days & bill**.
3. A renewal invoice appears in the **Invoices** table.
4. Click **Cancel** on a subscription to stop future billing.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/plans` | List all plans |
| GET | `/api/subscriptions` | List all subscriptions |
| GET | `/api/invoices` | List all invoices |
| POST | `/api/subscribe` | Create a subscription (`name`, `plan`) |
| POST | `/api/cancel/:id` | Cancel a subscription |
| POST | `/api/billing/run` | Run the billing engine (`days` to fast-forward) |

## Database

SQLite is used, so no separate setup is needed. The file `billing.db` is created automatically on first run.

**subscriptions:** `id, name, plan, price, status, next_billing`
**invoices:** `id, sub_id, name, plan, amount, date`

To reset all data, stop the server, delete `billing.db` and start again.

## Plans

| Plan | Price (per 30 days) |
|---|---|
| Basic | $10 |
| Pro | $25 |
| Enterprise | $50 |

## Future Improvements

- User login and authentication
- Real payment gateway (Stripe / Razorpay)
- Deploy backend to AWS Lambda with DynamoDB
- Email invoices to customers

## License

MIT
