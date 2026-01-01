# Viba Business Manager Integration Guide

## Overview

This guide explains how to integrate SolarlyAU with your Viba business manager app. The integration provides real-time access to business metrics, leads, transactions, and system health data through a comprehensive API and webhook system.

---

## Table of Contents

1. [Authentication](#authentication)
2. [API Endpoints](#api-endpoints)
3. [Webhook Events](#webhook-events)
4. [Setup Instructions](#setup-instructions)
5. [Example Usage](#example-usage)
6. [Rate Limiting](#rate-limiting)
7. [Error Handling](#error-handling)

---

## Authentication

All API requests require an API key for authentication. The API key must be passed in the request payload.

### Setting Up API Key

1. Generate a secure API key (recommended: 32+ character random string)
2. Add to SolarlyAU environment variables:
   ```bash
   VIBA_API_KEY=your_secure_api_key_here
   ```
3. Use this key in all API requests from Viba

---

## API Endpoints

All endpoints are accessible via tRPC at `/api/trpc/viba.*`

### 1. Get Business Overview

**Endpoint:** `viba.getBusinessOverview`

**Description:** Get comprehensive business metrics for dashboard display

**Input:**
```typescript
{
  apiKey: string;
  timeRange?: 'today' | 'week' | 'month' | 'year' | 'all'; // default: 'all'
}
```

**Response:**
```typescript
{
  businessName: 'SolarlyAU';
  timeRange: string;
  timestamp: string; // ISO 8601
  leads: {
    total: number;
    active: number;
    sold: number;
    avgQuality: number; // 0-100
    last24h: number;
  };
  installers: {
    total: number;
    verified: number;
    active: number;
    newLast24h: number;
  };
  revenue: {
    totalTransactions: number;
    totalRevenue: number; // in dollars
    avgTransactionValue: number;
    last24h: number;
  };
  stateDistribution: Array<{
    state: string;
    count: number;
  }>;
}
```

**Example:**
```typescript
const overview = await trpc.viba.getBusinessOverview.query({
  apiKey: process.env.VIBA_API_KEY,
  timeRange: 'month'
});

console.log(`Total Revenue: $${overview.revenue.totalRevenue}`);
console.log(`Active Leads: ${overview.leads.active}`);
```

---

### 2. Get Leads

**Endpoint:** `viba.getLeads`

**Description:** Get detailed lead list with filters and pagination

**Input:**
```typescript
{
  apiKey: string;
  limit?: number; // 1-1000, default: 100
  offset?: number; // default: 0
  state?: string; // e.g., 'QLD', 'NSW'
  isPurchased?: boolean;
  minQuality?: number; // 0-100
}
```

**Response:**
```typescript
{
  leads: Array<{
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    suburb: string;
    state: string;
    postcode: string;
    propertyType: string;
    roofType: string;
    estimatedSystemSize: number;
    monthlyBill: number;
    qualityScore: number;
    isPurchased: boolean;
    createdAt: Date;
  }>;
  total: number;
  limit: number;
  offset: number;
}
```

**Example:**
```typescript
// Get high-quality unpurchased leads in QLD
const leads = await trpc.viba.getLeads.query({
  apiKey: process.env.VIBA_API_KEY,
  state: 'QLD',
  isPurchased: false,
  minQuality: 85,
  limit: 50
});

console.log(`Found ${leads.total} high-quality QLD leads`);
```

---

### 3. Get Transactions

**Endpoint:** `viba.getTransactions`

**Description:** Get transaction history with filters

**Input:**
```typescript
{
  apiKey: string;
  limit?: number; // 1-1000, default: 100
  offset?: number; // default: 0
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
}
```

**Response:**
```typescript
{
  transactions: Array<{
    id: number;
    installerId: number;
    leadId: number;
    amount: number;
    status: string;
    stripePaymentIntentId: string;
    createdAt: Date;
    installerName: string;
    leadName: string;
    suburb: string;
    state: string;
  }>;
  total: number;
  limit: number;
  offset: number;
}
```

**Example:**
```typescript
// Get recent completed transactions
const transactions = await trpc.viba.getTransactions.query({
  apiKey: process.env.VIBA_API_KEY,
  status: 'completed',
  limit: 20
});

const totalRevenue = transactions.transactions.reduce(
  (sum, t) => sum + t.amount, 
  0
);
```

---

### 4. Get Revenue Analytics

**Endpoint:** `viba.getRevenueAnalytics`

**Description:** Get revenue time series data for charts

**Input:**
```typescript
{
  apiKey: string;
  groupBy?: 'day' | 'week' | 'month'; // default: 'day'
  days?: number; // 1-365, default: 30
}
```

**Response:**
```typescript
{
  groupBy: string;
  days: number;
  timeSeries: Array<{
    period: string; // e.g., '2025-01-15'
    transactionCount: number;
    revenue: number;
  }>;
}
```

**Example:**
```typescript
// Get daily revenue for last 30 days
const analytics = await trpc.viba.getRevenueAnalytics.query({
  apiKey: process.env.VIBA_API_KEY,
  groupBy: 'day',
  days: 30
});

// Use for charts in Viba dashboard
```

---

### 5. Get System Health

**Endpoint:** `viba.getSystemHealth`

**Description:** Get system health and autonomous operation status

**Input:**
```typescript
{
  apiKey: string;
}
```

**Response:**
```typescript
{
  status: 'operational' | 'degraded' | 'down';
  timestamp: string;
  database: 'connected' | 'disconnected';
  autonomousSystems: {
    leadGeneration: 'active' | 'idle';
    installerRecruitment: 'active' | 'idle';
  };
  uptime: number; // seconds
}
```

**Example:**
```typescript
const health = await trpc.viba.getSystemHealth.query({
  apiKey: process.env.VIBA_API_KEY
});

if (health.status !== 'operational') {
  console.warn('SolarlyAU system degraded!');
}
```

---

## Webhook Events

Configure webhooks to receive real-time notifications from SolarlyAU.

### Setup

1. Add webhook URL to SolarlyAU environment:
   ```bash
   VIBA_WEBHOOK_URL=https://your-viba-app.com/webhooks/solarlyau
   ```

2. Webhook payloads include:
   ```typescript
   {
     event: string; // Event type
     timestamp: string; // ISO 8601
     data: any; // Event-specific data
   }
   ```

3. Verify webhook authenticity using `X-API-Key` header

### Event Types

#### Transaction Events

**`transaction.completed`**
```typescript
{
  event: 'transaction.completed',
  timestamp: '2025-01-15T10:30:00Z',
  data: {
    transactionId: 123,
    amount: 250,
    installerName: 'Solar Pro QLD',
    leadDetails: { ... }
  }
}
```

**`transaction.refunded`**
```typescript
{
  event: 'transaction.refunded',
  timestamp: '2025-01-15T11:00:00Z',
  data: {
    transactionId: 123,
    amount: 250,
    reason: 'Invalid lead'
  }
}
```

#### Lead Events

**`lead.created`**
```typescript
{
  event: 'lead.created',
  timestamp: '2025-01-15T09:00:00Z',
  data: {
    leadId: 456,
    state: 'QLD',
    qualityScore: 92
  }
}
```

**`lead.purchased`**
```typescript
{
  event: 'lead.purchased',
  timestamp: '2025-01-15T10:30:00Z',
  data: {
    leadId: 456,
    installerId: 789,
    price: 250
  }
}
```

#### Installer Events

**`installer.registered`**
```typescript
{
  event: 'installer.registered',
  timestamp: '2025-01-15T08:00:00Z',
  data: {
    installerId: 789,
    companyName: 'Solar Pro QLD',
    state: 'QLD'
  }
}
```

**`installer.verified`**
```typescript
{
  event: 'installer.verified',
  timestamp: '2025-01-15T08:30:00Z',
  data: {
    installerId: 789,
    companyName: 'Solar Pro QLD'
  }
}
```

#### Revenue Events

**`revenue.milestone`**
```typescript
{
  event: 'revenue.milestone',
  timestamp: '2025-01-15T14:00:00Z',
  data: {
    milestone: 10000, // $10k milestone
    currentRevenue: 10250,
    achievedAt: '2025-01-15T14:00:00Z'
  }
}
```

**`revenue.daily_summary`**
```typescript
{
  event: 'revenue.daily_summary',
  timestamp: '2025-01-15T23:59:59Z',
  data: {
    date: '2025-01-15',
    revenue: 1250,
    transactions: 5,
    newLeads: 47,
    newInstallers: 2
  }
}
```

#### System Events

**`system.alert`**
```typescript
{
  event: 'system.alert',
  timestamp: '2025-01-15T12:00:00Z',
  data: {
    severity: 'warning',
    message: 'Lead generation rate below threshold',
    details: { ... }
  }
}
```

---

## Setup Instructions

### 1. Generate API Key

```bash
# Generate secure random API key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Configure SolarlyAU

Add to environment variables (via Manus Secrets panel):

```bash
VIBA_API_KEY=your_generated_api_key_here
VIBA_WEBHOOK_URL=https://your-viba-app.com/webhooks/solarlyau
```

### 3. Configure Viba

Store the API key in Viba's environment:

```bash
SOLARLYAU_API_KEY=your_generated_api_key_here
```

### 4. Test Connection

```typescript
// In Viba app
const health = await fetch('https://solarlyau.com/api/trpc/viba.getSystemHealth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: process.env.SOLARLYAU_API_KEY
  })
});

console.log(await health.json());
```

---

## Example Usage

### Dashboard Widget in Viba

```typescript
import { trpc } from './trpc'; // Your Viba tRPC client

export function SolarlyAUWidget() {
  const { data, isLoading } = trpc.viba.getBusinessOverview.useQuery({
    apiKey: process.env.SOLARLYAU_API_KEY,
    timeRange: 'month'
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="business-card">
      <h2>SolarlyAU - This Month</h2>
      <div className="metrics">
        <div>
          <strong>Revenue:</strong> ${data.revenue.totalRevenue.toLocaleString()}
        </div>
        <div>
          <strong>Transactions:</strong> {data.revenue.totalTransactions}
        </div>
        <div>
          <strong>Active Leads:</strong> {data.leads.active}
        </div>
        <div>
          <strong>Verified Installers:</strong> {data.installers.verified}
        </div>
      </div>
    </div>
  );
}
```

### Webhook Handler in Viba

```typescript
// Viba webhook endpoint
export async function POST(request: Request) {
  const apiKey = request.headers.get('X-API-Key');
  
  // Verify webhook authenticity
  if (apiKey !== process.env.SOLARLYAU_API_KEY) {
    return new Response('Unauthorized', { status: 401 });
  }

  const webhook = await request.json();

  // Handle different event types
  switch (webhook.event) {
    case 'transaction.completed':
      await handleTransactionCompleted(webhook.data);
      break;
    case 'revenue.milestone':
      await notifyOwner(`SolarlyAU hit $${webhook.data.milestone} milestone!`);
      break;
    case 'system.alert':
      if (webhook.data.severity === 'error') {
        await sendAlert(webhook.data.message);
      }
      break;
  }

  return new Response('OK', { status: 200 });
}
```

---

## Rate Limiting

- **API Requests:** 100 requests per minute per API key
- **Webhook Retries:** 3 attempts with exponential backoff (1s, 5s, 25s)
- **Burst Allowance:** Up to 200 requests in 10 seconds

---

## Error Handling

### API Errors

```typescript
try {
  const data = await trpc.viba.getBusinessOverview.query({
    apiKey: process.env.SOLARLYAU_API_KEY
  });
} catch (error) {
  if (error.code === 'UNAUTHORIZED') {
    console.error('Invalid API key');
  } else if (error.code === 'INTERNAL_SERVER_ERROR') {
    console.error('SolarlyAU database unavailable');
  }
}
```

### Webhook Failures

If webhook delivery fails, SolarlyAU will:
1. Retry 3 times with exponential backoff
2. Log failure for manual review
3. Continue normal operation (webhooks are non-blocking)

---

## Support

For integration support or questions:
- **Email:** support@solarlyau.com
- **Documentation:** https://solarlyau.com/api-docs
- **Status Page:** https://solarlyau.com/status

---

## Security Best Practices

1. **Never expose API keys** in client-side code
2. **Use HTTPS** for all API requests
3. **Rotate API keys** every 90 days
4. **Validate webhook signatures** using X-API-Key header
5. **Implement rate limiting** on your webhook endpoint
6. **Log all API access** for audit trails

---

## Changelog

**v1.0.0** (2025-01-15)
- Initial release
- 5 API endpoints
- 10 webhook event types
- Full tRPC integration
