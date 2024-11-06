const express = require("express");
const multer = require("multer");
const {
  loginUser,
  registerUser,
  resetEmail,
} = require("../controllers/userControllers");
const {
  getAllProducts,
  addProduct,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productControllers");
const {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderControllers");
const {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
} = require("../controllers/cartControllers");

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// User routes
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/resetPassword", resetEmail);

// Product routes
router.get("/products", getAllProducts);
router.post("/products", upload.single("imageFile"), addProduct); // Handle image upload
router.get("/products/:id", getProductById);
router.put("/products/:id", upload.single("imageFile"), updateProduct); // Handle image upload
router.delete("/products/:id", deleteProduct);

// Order routes
router.post("/orders", createOrder);
router.get("/orders/:id", getOrderById);
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);
router.delete("/orders/:id", cancelOrder);

// Cart routes
router.get("/cart", getCart);
router.post("/cart", addToCart);
router.delete("/cart/:itemId", removeFromCart);
router.put("/cart/:itemId/quantity", updateCartItemQuantity);

// Export the router
module.exports = router;
