
export const API_CONFIG = {
  BASE_URL: "http://localhost:5000/api",
  ENDPOINTS: {
    products: "/products",
    cart: "/cart",
    walmartProducts: "/walmart-products",
    orders: "/orders"
  }
};

export const WALMART_CONFIG = {
  SEARCH_ENDPOINT: '/walmart/search',
  PRODUCT_ENDPOINT: '/walmart/product',
  CATEGORIES: ['Clothing', 'Electronics', 'Home', 'Garden', 'Sports', 'Toys'],
};

export const ECO_SCORING = {
  POINTS_PER_DOLLAR: 1,
  BONUS_POINTS: {
    ORGANIC: 5,
    RECYCLED: 3,
    LOCAL: 2,
    CARBON_NEUTRAL: 4,
  },
  MILESTONES: {
    BRONZE: 0,
    SILVER: 500,
    GOLD: 1000,
  }
};

// Instructions for your friend:
/*
1. Update BASE_URL to point to your backend server
2. Modify ENDPOINTS to match your actual API routes
3. Add any required authentication headers in REQUEST_CONFIG
4. Update FEATURE_FLAGS based on what your backend supports
5. If using Walmart API, update WALMART_CONFIG with your endpoints

Example backend endpoints your friend should implement:
- GET /api/products - Get all products
- GET /api/walmart/products?search=query - Search Walmart products
- POST /api/cart/add - Add item to cart
- DELETE /api/cart/remove - Remove item from cart
- PUT /api/cart/update - Update cart item quantity
- POST /api/orders/create - Create new order
- GET /api/user/profile - Get user profile
*/ 