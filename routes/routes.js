const express = require("express");
const multer = require("multer");
const {
  loginUser,
  registerUser,
  logoutUser,
  resetEmail,
  getUserProfile,
  updateUserProfile,
  changePassword,
  addToWishlist,
  removeFromWishlist,
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
router.post("/users/login", loginUser);
router.post("/users/register", registerUser);
router.post("/users/logout", logoutUser)
router.post("users/reset-password", resetEmail);
router.get("/users/:id", getUserProfile);
router.put("/users/:id", updateUserProfile);
router.put("/users/:id/wishlist/add", addToWishlist);
router.put("/users/:id/wishlist/remove")


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
router.get("/carts/:userId", getCart);
router.post("/carts/:userId/add", addToCart);
router.delete("/carts/:userId/remove", removeFromCart);
router.put("/cart/:userId/quantity", updateCartItemQuantity);

// Export the router
module.exports = router;
