const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let cart = {};
let orders = [];
let nextOrderId = 1;

app.get('/api/products', async (req, res) => {
  try {
    const response = await axios.get('https://fakestoreapi.com/products');

    const products = response.data.map((item) => ({
      id: item.id,
      name: item.title,
      price: item.price,
      image: item.image,
      description: item.description,
      category: item.category,
      score: Math.floor(Math.random() * 21) + 70,
      ecoPoints: Math.floor(Math.random() * 150) + 50,
      inStock: true
    }));

    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/cart/add', async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const response = await axios.get(`https://fakestoreapi.com/products/${productId}`);
    const data = response.data;

    const product = {
      id: data.id,
      name: data.title,
      price: data.price,
      image: data.image,
      description: data.description,
      category: data.category,
      score: Math.floor(Math.random() * 21) + 70,
      ecoPoints: Math.floor(Math.random() * 150) + 50,
      inStock: true
    };

    if (!cart[productId]) {
      cart[productId] = { product, quantity };
    } else {
      cart[productId].quantity += quantity;
    }

    res.json(cart);
  } catch (err) {
    console.error('Error adding to cart:', err.message);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});


app.put('/api/cart/update', (req, res) => {
  const { productId, quantity } = req.body;

  if (cart[productId]) {
    cart[productId].quantity = quantity;
    if (quantity <= 0) {
      delete cart[productId];
    }
  }

  res.json(cart);
});


app.delete('/api/cart/remove', (req, res) => {
  const { productId } = req.body;

  if (cart[productId]) {
    delete cart[productId];
  }

  res.json(cart);
});

app.post('/api/orders/create', (req, res) => {
  const { items, totalAmount, ecoPoints } = req.body;

  const order = {
    id: nextOrderId++,
    items,
    totalAmount,
    ecoPoints,
    date: new Date().toISOString()
  };

  orders.push(order);
  cart = {}; 

  res.json(order);
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
