import React, { useState, useEffect } from "react";
import "./style.css";
import { API_CONFIG } from "./config";

type Product = {
  id: number;
  name: string;
  score: number;
  ecoPoints: number;
  price: number;
  image?: string;
  description?: string;
  category?: string;
  inStock?: boolean;
  walmartId?: string; 
};



function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Record<number, { product: Product; quantity: number }>>({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');


  useEffect(() => {
    fetchProductsFromBackend();
  }, []);

  const fetchProductsFromBackend = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.products}`);
      
      if (response.ok) {
        const backendProducts = await response.json();
        setProducts(backendProducts);
        console.log('✅ Connected to backend successfully!');
      } else {
        throw new Error(`Backend error: ${response.status}`);
      }

    } catch (err) {
      console.error('Failed to connect to backend:', err);
      setError('Cannot connect to backend. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };


  const fetchWalmartProducts = async (searchQuery: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.walmartProducts}?search=${searchQuery}`);
      if (response.ok) {
        const walmartProducts = await response.json();
        setProducts(walmartProducts);
      } else {
        throw new Error(`Walmart API error: ${response.status}`);
      }
    } catch (err) {
      console.error('Failed to fetch Walmart products:', err);
      setError('Failed to fetch Walmart products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item: Product) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.cart}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: item.id, quantity: 1 })
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
        
       
        const newTotalPoints = getTotalPoints() + item.ecoPoints;
        if (newTotalPoints >= 500 && getTotalPoints() < 500) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      } else {
        throw new Error('Failed to add item to cart');
      }
      
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add item to cart. Please try again.');
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.cart}/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: itemId })
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
      } else {
        throw new Error('Failed to remove item from cart');
      }
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError('Failed to remove item from cart. Please try again.');
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.cart}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: itemId, quantity: newQuantity })
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
      } else {
        throw new Error('Failed to update cart');
      }
    } catch (err) {
      console.error('Error updating cart:', err);
      setError('Failed to update cart. Please try again.');
    }
  };

  const checkout = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.orders}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: Object.values(cart),
          totalAmount: getTotalPrice(),
          ecoPoints: getTotalPoints()
        })
      });

      if (response.ok) {
        const order = await response.json();
        setCart({});
        alert(`Order placed successfully! Order ID: ${order.id}`);
      } else {
        throw new Error('Checkout failed');
      }
    } catch (err) {
      console.error('Error during checkout:', err);
      setError('Checkout failed. Please try again.');
    }
  };

  const getTotalPoints = () => Object.values(cart).reduce((acc, item) => acc + (item.product.ecoPoints * item.quantity), 0);
  const getTotalPrice = () => Object.values(cart).reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const getTotalItems = () => Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);
  const getAvgScore = () => {
    const totalScore = Object.values(cart).reduce((acc, item) => acc + (item.product.score * item.quantity), 0);
    return getTotalItems() > 0 ? Math.round(totalScore / getTotalItems()) : 0;
  };


  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === 'all' || product.category === selectedCategory)
  );

  const getRewardTier = () => {
    const totalPoints = getTotalPoints();
    if (totalPoints >= 1000) return { tier: "Gold", discount: "50% + Free Plant", color: "#FFD700" };
    if (totalPoints >= 500) return { tier: "Silver", discount: "20%", color: "#C0C0C0" };
    return { tier: "Bronze", discount: "No discount yet", color: "#CD7F32" };
  };

  const progressTo500 = Math.min((getTotalPoints() / 500) * 100, 100);
  const showHurray = getTotalPoints() >= 500;
  const rewardTier = getRewardTier();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">🌱</div>
        <p>Loading eco-friendly products...</p>
        <p className="loading-subtitle">Connecting to backend...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h2>Connection Error</h2>
        <p>{error}</p>
        <button onClick={fetchProductsFromBackend} className="retry-btn">
          🔄 Retry Connection
        </button>
        <div className="error-help">
          <p>Make sure your backend server is running at:</p>
          <code>{API_CONFIG.BASE_URL}</code>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {showConfetti && <div className="confetti-overlay">🎉</div>}
      
      <header className="app-header">
        <h1>Eco-Cart ♻️</h1>
        <div className="header-info">
          <div className="data-source-badge">
            🌐 Backend Connected
          </div>
          <div className="cart-badge">
            🛒 {getTotalItems()}
          </div>
        </div>
      </header>

      {/* Search and Filter Section */}
      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search eco-friendly products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button 
            onClick={() => fetchWalmartProducts(searchTerm)}
            className="walmart-search-btn"
          >
            🔍 Search Walmart
          </button>
        </div>
        <div className="category-filter">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="all">All Categories</option>
            <option value="Clothing">Clothing</option>
            <option value="Accessories">Accessories</option>
            <option value="Personal Care">Personal Care</option>
            <option value="Toys">Toys</option>
            <option value="Electronics">Electronics</option>
            <option value="Kitchen">Kitchen</option>
          </select>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressTo500}%` }}></div>
        </div>
        <p className="progress-text">
          🌱 {getTotalPoints()} / 500 Eco Points ({Math.round(progressTo500)}%)
        </p>
        <div className="reward-tier">
          <span className="tier-badge" style={{ backgroundColor: rewardTier.color }}>
            {rewardTier.tier} Tier
          </span>
          <span className="discount-text">{rewardTier.discount}</span>
        </div>
      </div>

      <div className="product-list">
        {filteredProducts.map((item) => (
          <div key={item.id} className="card">
            <div className="product-image">
              {item.image ? (
                <img src={item.image} alt={item.name} className="product-img" />
              ) : (
                <div className="product-placeholder">🛍️</div>
              )}
            </div>
            <h2>{item.name}</h2>
            {item.description && (
              <p className="product-description">{item.description}</p>
            )}
            <p>
              🌿 <strong>Green Score:</strong>{" "}
              <span className={item.score > 70 ? "high" : "low"}>{item.score}</span>
            </p>
            <p>🏅 Eco Points: {item.ecoPoints}</p>
            <p>💰 Price: ${item.price}</p>
            {item.category && (
              <p className="product-category">📦 {item.category}</p>
            )}
            {item.inStock !== undefined && (
              <p className={item.inStock ? "in-stock" : "out-of-stock"}>
                {item.inStock ? "✅ In Stock" : "❌ Out of Stock"}
              </p>
            )}
            <button 
              onClick={() => addToCart(item)}
              className="add-button"
              disabled={item.inStock === false}
            >
              ➕ Add to Cart
            </button>
          </div>
        ))}
      </div>

      {showHurray && (
        <div className="hurray">
          🎉 <strong>Hurray!</strong> You've crossed 500 Eco Points! Take your reward and Keep going green! 🌱
        </div>
      )}

      <div className="summary">
        <h3>🧾 Carbon Receipt</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-icon">🛒</span>
            <span className="stat-value">{getTotalItems()}</span>
            <span className="stat-label">Items</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🌱</span>
            <span className="stat-value">{getTotalPoints()}</span>
            <span className="stat-label">Eco Points</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">📊</span>
            <span className="stat-value">{getAvgScore()}</span>
            <span className="stat-label">Avg Score</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">💰</span>
            <span className="stat-value">${getTotalPrice().toFixed(2)}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>

        <div className="cart-items">
          <h4>🛍️ Cart Items:</h4>
          {getTotalItems() === 0 ? (
            <p className="empty-cart">No items added yet. Start shopping for eco-friendly products! 🌿</p>
          ) : (
            <>
              <ul>
                {Object.values(cart).map((entry, index) => (
                  <li key={index} className="cart-item">
                    <div className="item-info">
                      <span className="item-image">
                        {entry.product.image ? (
                          <img src={entry.product.image} alt={entry.product.name} className="cart-img" />
                        ) : (
                          <span className="cart-placeholder">🛍️</span>
                        )}
                      </span>
                      <span className="item-name">{entry.product.name}</span>
                    </div>
                    <div className="item-controls">
                      <button 
                        onClick={() => updateQuantity(entry.product.id, entry.quantity - 1)}
                        className="quantity-btn"
                      >
                        ➖
                      </button>
                      <span className="quantity">{entry.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(entry.product.id, entry.quantity + 1)}
                        className="quantity-btn"
                      >
                        ➕
                      </button>
                      <button 
                        onClick={() => removeFromCart(entry.product.id)}
                        className="remove-btn"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="item-details">
                      <span>Score: {entry.product.score}</span>
                      <span>Points: {entry.product.ecoPoints * entry.quantity}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="checkout-section">
                <button onClick={checkout} className="checkout-button">
                  🛒 Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="reward-info">
        <h3>🎁 Reward Offers</h3>
        <div className="rewards-grid">
          <div className={`reward-card ${getTotalPoints() >= 500 ? 'achieved' : ''}`}>
            <div className="reward-icon">🌱</div>
            <h4>500+ Eco Points</h4>
            <p>Get 20% Discount</p>
            {getTotalPoints() >= 500 && <span className="achieved-badge">✅ Achieved!</span>}
          </div>
          <div className={`reward-card ${getTotalPoints() >= 1000 ? 'achieved' : ''}`}>
            <div className="reward-icon">🌿</div>
            <h4>1000+ Eco Points</h4>
            <p>Get 50% Discount</p>
            {getTotalPoints() >= 1000 && <span className="achieved-badge">✅ Achieved!</span>}
          </div>
          <div className={`reward-card ${getTotalPoints() >= 1000 ? 'achieved' : ''}`}>
            <div className="reward-icon">🌳</div>
            <h4>1000+ Eco Points</h4>
            <p>50% + 1 Free Plant</p>
            {getTotalPoints() >= 1000 && <span className="achieved-badge">✅ Achieved!</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;