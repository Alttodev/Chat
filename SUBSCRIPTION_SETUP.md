# Subscription & Payment Configuration

## Frontend Setup

### Required Environment Variables

Add these to your `.env.local` or `.env` file:

```
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here
VITE_APP_API_URL=your_backend_api_url
```

### Backend Setup

The backend should have:
1. **Razorpay Account** - Sign up at https://razorpay.com
2. **Environment Variables**:
   - `RAZORPAY_KEY_ID` - Your Razorpay API Key
   - `RAZORPAY_KEY_SECRET` - Your Razorpay API Secret

3. **Subscription Endpoints** - Already implemented in your backend:
   - `POST /api/subscription/create-order/monthly`
   - `POST /api/subscription/create-order/yearly`
   - `POST /api/subscription/verify-payment`
   - `GET /api/subscription/status`
   - `POST /api/subscription/cancel`

## Frontend Implementation

### How It Works

1. **User clicks Subscribe** → SubscriptionCard calls `handleSubscribe(planId)`
2. **Create Order** → Frontend calls `/api/subscription/create-order/{monthly|yearly}`
3. **Open Payment Modal** → Razorpay checkout opens
4. **User Pays** → Payment is processed
5. **Verify Payment** → Frontend calls `/api/subscription/verify-payment`
6. **Redirect** → User is redirected to `/profileViews` on success

### Components & Hooks

- `SubscriptionCard.jsx` - Main subscription UI with payment integration
- `ProfileViewsCard.jsx` - Shows profile viewers (free: 5 views, paid: unlimited)
- `useSubscriptionStatus()` - Hook to check user's subscription status

### API Functions

Located in `src/api/subscription.js`:
- `createSubscriptionOrder(planType)` - Creates payment order
- `handleRazorpayPayment(orderData, userEmail, userName)` - Opens Razorpay modal
- `verifySubscriptionPayment(paymentDetails)` - Verifies payment signature
- `getSubscriptionStatus()` - Fetches current subscription status
- `cancelSubscription()` - Cancels active subscription
- `loadRazorpay()` - Loads Razorpay script dynamically

### Feature Limitations

**Free Users:**
- Can see only 5 profile viewers
- See "Subscribe" button to unlock all viewers

**Premium Users:**
- Unlimited profile views
- Monthly: ₹2/month (30-day history)
- Yearly: ₹24/year (unlimited history)

## Testing

For testing with Razorpay in sandbox mode:
- Use card: `4111 1111 1111 1111`
- Expiry: `12/25` (any future date)
- CVV: `123` (any 3 digits)

## Payment Flow Diagram

```
Subscribe Click
     ↓
Create Order API
     ↓
Razorpay Checkout Opens
     ↓
User Pays
     ↓
Verify Payment API
     ↓
Save Subscription
     ↓
Redirect to ProfileViews
```

## Troubleshooting

1. **"Failed to load Razorpay"** - Check internet connection and Razorpay script loading
2. **"Payment verification failed"** - Ensure backend secret is correct and signature verification works
3. **"Order creation failed"** - Check user authentication and API endpoint availability
4. **Missing Razorpay key** - Add `VITE_RAZORPAY_KEY_ID` to .env file
