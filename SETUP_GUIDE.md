# Eco-Cart Frontend Setup Guide

## 🚀 Quick Setup

### 1. Update Backend URL
Open `src/config.ts` and change the `BASE_URL` to your friend's backend server:

```typescript
BASE_URL: 'http://YOUR_FRIEND_SERVER_IP:PORT/api'
```

**Examples:**
- Local development: `http://localhost:3000/api`
- Remote server: `http://192.168.1.100:5000/api`
- Cloud server: `https://your-backend-domain.com/api`

### 2. Install Dependencies
```bash
cd eco-cart
npm install
```

### 3. Start the Frontend
```bash
npm start
```

The app will open at `http://localhost:3000`

## 🔧 Configuration Options

### Backend Endpoints
If your friend's backend uses different endpoint names, update them in `src/config.ts`:

```typescript
ENDPOINTS: {
  products: '/your-products-endpoint',
  cart: '/your-cart-endpoint',
  // ... etc
}
```

### Authentication
If your friend's backend requires authentication, add headers in `src/config.ts`:

```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer YOUR_TOKEN_HERE',
}
```

## 📋 What Your Friend's Backend Should Provide

Your friend's backend needs these endpoints:

### Products
- `GET /api/products` - Get all products
- `GET /api/walmart/products?search=query` - Search Walmart products

### Cart
- `POST /api/cart/add` - Add item to cart
- `DELETE /api/cart/remove` - Remove item from cart  
- `PUT /api/cart/update` - Update cart item quantity
- `GET /api/cart` - Get current cart

### Orders
- `POST /api/orders/create` - Create new order

### Expected Data Format

**Product Object:**
```json
{
  "id": 1,
  "name": "Eco-Friendly Water Bottle",
  "score": 85,
  "ecoPoints": 50,
  "price": 19.99,
  "image": "https://example.com/image.jpg",
  "description": "Reusable water bottle",
  "category": "Kitchen",
  "inStock": true
}
```

**Cart Response:**
```json
{
  "1": {
    "product": { /* product object */ },
    "quantity": 2
  }
}
```

## 🐛 Troubleshooting

### Connection Error
- Check if your friend's backend is running
- Verify the URL in `src/config.ts`
- Check browser console for detailed errors

### CORS Issues
Your friend's backend needs to allow requests from your frontend:
```
Access-Control-Allow-Origin: http://localhost:3000
```

### Port Conflicts
If port 3000 is busy, React will automatically use the next available port.

## 📱 Features

- ✅ Real-time product search
- ✅ Cart management
- ✅ Eco points tracking
- ✅ Reward system
- ✅ Walmart integration
- ✅ Responsive design

## 🔄 Development

- **Hot reload**: Changes appear instantly
- **Error overlay**: Errors show in browser
- **Console logs**: Check browser console for API responses 