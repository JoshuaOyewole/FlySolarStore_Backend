# Orders Endpoint Fixes Applied

## Summary
Fixed backend order endpoints to match frontend expectations, added authentication, and implemented pagination support.

## Changes Made

### 1. **routes/orderRoutes.js**
- ✅ Added authentication middleware import
- ✅ Added new `/my-orders` route for authenticated users
- ✅ Protected all sensitive routes with `authenticate` middleware
- ✅ Protected admin routes with `authorize('admin')` middleware
- ✅ Reordered routes to prevent path conflicts (specific routes before parameterized ones)

**Route Structure:**
```javascript
POST   /api/orders              - Public (create order)
GET    /api/orders/my-orders    - Protected (get user's orders with pagination)
GET    /api/orders/user/:userId - Protected + Admin (get any user's orders)
GET    /api/orders/:identifier  - Protected (get order by ID/orderNumber)
PATCH  /api/orders/:id/status   - Protected + Admin (update order status)
POST   /api/orders/:id/resend-invoice - Protected (resend invoice)
```

### 2. **controllers/orderController.js**
- ✅ Added `getMyOrders()` controller for authenticated users
- ✅ Implemented pagination support (page, limit, skip)
- ✅ Response includes pagination metadata:
  - `currentPage`
  - `totalPages`
  - `totalOrders`
  - `hasNextPage`
  - `hasPrevPage`
- ✅ Updated `createOrder()` to accept optional `userId` for user association

**Response Format:**
```json
{
  "success": true,
  "data": {
    "orders": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalOrders": 48,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 3. **services/orderService.js**
- ✅ Added `getUserOrdersWithPagination()` method
- ✅ Supports skip/limit for pagination
- ✅ Returns both orders array and total count
- ✅ Updated `createOrder()` to accept optional `userId` parameter
- ✅ Associates order with user when `userId` is provided

## Frontend Integration

The frontend is already set up to use these endpoints:

### Orders Page (`app/(customer)/orders/page.jsx`)
```javascript
// Calls: GET /api/orders/my-orders?page=1&limit=10
const { data } = await ordersAPI.getMyOrders({ page: 1, limit: 10 });
// Receives: { data: { orders: [], pagination: {} } }
```

### Order Details Page (`app/(customer)/orders/[id]/page.jsx`)
```javascript
// Calls: GET /api/orders/:id
const { data } = await ordersAPI.getById(orderId);
// Receives: { data: order }
```

### Create Order (`app/(checkout)/checkout/CheckoutForm.jsx`)
```javascript
// Calls: POST /api/orders
const { data } = await ordersAPI.create({
  items, 
  shippingAddress, 
  billingAddress, 
  sameAsShipping,
  userId // Optional - associate with user
});
```

## Authentication Flow

1. **Frontend**: Sends JWT token in `Authorization: Bearer <token>` header
2. **Backend**: `authenticate` middleware validates token and loads user into `req.user`
3. **Controller**: Uses `req.user._id` to fetch user-specific data
4. **Response**: Returns only data belonging to the authenticated user

## What Still Needs to be Done

### ❌ CRITICAL: Fix User Model Address Error

The `/api/auth/me` endpoint is failing with "Schema hasn't been registered for model 'Address'".

**Solution**: Copy the fixed User model to replace the current one:

```powershell
# Navigate to backend directory
cd c:\Users\ORISFINA\coding\v2\backend

# Backup current User model
Copy-Item models\User.js models\User.js.backup

# Copy fixed model (from my-next-mui-app directory)
Copy-Item ..\my-next-mui-app\FIXED_USER_MODEL.js models\User.js
```

The `FIXED_USER_MODEL.js` includes:
- Embedded addresses (no separate Address model)
- All required fields (name, email, password, phone, avatar, dateOfBirth)
- Role-based access (user, admin)
- Account status (isActive, isLocked, isVerified)
- Password hashing with bcrypt
- JWT token generation

### Optional Improvements

1. **Add Status Filter to My Orders**
   ```javascript
   // In orderController.getMyOrders()
   const { status } = req.query;
   if (status) {
     // Pass to service
   }
   ```

2. **Add Date Range Filtering**
   ```javascript
   const { startDate, endDate } = req.query;
   // Filter orders by date range
   ```

3. **Add Order Search**
   ```javascript
   const { search } = req.query;
   // Search by order number, product name, etc.
   ```

4. **Add Sorting Options**
   ```javascript
   const { sortBy, sortOrder } = req.query;
   // Sort by date, total, status, etc.
   ```

## Testing the Endpoints

### 1. Create Order (Public)
```bash
POST http://localhost:5000/api/orders
Content-Type: application/json

{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "qty": 2
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "email": "john@example.com",
    "contact": "+2348012345678",
    "address": "123 Main St",
    "state": "Lagos",
    "country": "Nigeria"
  },
  "sameAsShipping": true,
  "userId": "507f1f77bcf86cd799439012"
}
```

### 2. Get My Orders (Protected)
```bash
GET http://localhost:5000/api/orders/my-orders?page=1&limit=10
Authorization: Bearer <your_jwt_token>
```

### 3. Get Order Details (Protected)
```bash
GET http://localhost:5000/api/orders/FS-ABC123-XYZ
Authorization: Bearer <your_jwt_token>
```

### 4. Get User Orders - Admin (Protected + Admin)
```bash
GET http://localhost:5000/api/orders/user/507f1f77bcf86cd799439012
Authorization: Bearer <admin_jwt_token>
```

## Common Issues & Solutions

### Issue: "Schema hasn't been registered for model 'Address'"
**Solution**: Apply the fixed User model as described above.

### Issue: "jwt malformed" or "No token provided"
**Solution**: Ensure the frontend is sending the JWT token in the Authorization header:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

### Issue: Orders not showing up in /my-orders
**Solution**: 
1. Verify orders are associated with user: Check `order.user` field in database
2. Ensure JWT token is valid and contains correct user ID
3. Check authentication middleware is working

### Issue: Pagination not working
**Solution**: Verify query parameters are being passed:
```javascript
GET /api/orders/my-orders?page=2&limit=5
```

## Next Steps

1. ✅ **Apply User Model Fix** (see instructions above)
2. ✅ **Test Authentication**: Verify JWT tokens are working
3. ✅ **Test /my-orders endpoint**: Log in and view orders
4. ✅ **Test Order Creation**: Create order with userId
5. ✅ **Test Order Details**: View individual order

## Notes

- All routes except `POST /orders` require authentication
- Admin routes require both authentication and admin role
- Orders are automatically associated with users when `userId` is provided
- Pagination defaults: page=1, limit=10
- Order numbers format: `FS-{base36timestamp}-{random}`
- Email invoices sent asynchronously (order creation won't fail if email fails)
