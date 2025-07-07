const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const express = require("express");
const cors = require("cors"); 
const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'orders.json');

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../public')));

// 🔑 Generate unique order ID
function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

// 📥 Create new order
app.post('/api/orders', (req, res) => {
  const order = req.body;
  order.id = Math.random().toString(36).substring(2, 9); // 👈 MUST BE HERE

  let orders = [];
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE);
    orders = JSON.parse(data);
  }

  orders.push(order);
  fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2));

  res.status(201).json(order); // ✅ Respond with order (includes ID)
});

// 📤 Get all orders
app.get('/api/orders', (req, res) => {
  if (!fs.existsSync(DATA_FILE)) {
    return res.json([]);
  }

  const data = fs.readFileSync(DATA_FILE);
  const orders = JSON.parse(data);
  res.json(orders);
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
// PATCH: update order status
app.patch('/api/orders/:id', (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  if (!fs.existsSync(DATA_FILE)) return res.status(404).send("Order not found");
  const data = fs.readFileSync(DATA_FILE);
  let orders = JSON.parse(data);

  const order = orders.find(o => o.id === orderId);
  if (!order) return res.status(404).send("Order not found");

  order.status = status;
  fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2));
  res.json({ success: true });
});

// DELETE: remove order
app.delete('/api/orders/:id', (req, res) => {
  const orderId = req.params.id;

  if (!fs.existsSync(DATA_FILE)) return res.status(404).send("Order not found");
  const data = fs.readFileSync(DATA_FILE);
  let orders = JSON.parse(data);

  const updatedOrders = orders.filter(o => o.id !== orderId);
  if (orders.length === updatedOrders.length) return res.status(404).send("Order not found");

  fs.writeFileSync(DATA_FILE, JSON.stringify(updatedOrders, null, 2));
  res.json({ success: true });
});
