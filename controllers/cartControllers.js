const { doc, getDoc, setDoc } = require("firebase/firestore");
const { db } = require("../config/firebase");

// Get cart for a user
const getCart = async (req, res) => {
  const { userId } = req.params; // Assuming userId is passed as a URL parameter

  try {
    const docRef = doc(db, "carts", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      res.json({
        message: "Cart retrieved successfully",
        cart: docSnap.data(),
      });
    } else {
      res.status(404).json({
        message: "Cart not found",
        cart: { userId, items: [] }, // Return an empty cart if not found
      });
    }
  } catch (error) {
    console.error("Error getting cart:", error);
    res.status(500).json({
      message: "Error retrieving cart",
      error: error.message,
    });
  }
};

// Add a product to the cart
const addToCart = async (req, res) => {
  const { userId } = req.params; // Assuming userId is passed as a URL parameter
  const { productId, productName, productPrice, productImage, quantity } = req.body;

  // Check for required fields
  if (!productId || quantity === undefined || !productName || !productPrice || !productImage) {
    return res.status(400).json({ message: "Product ID, quantity, name, price, and image are required." });
  }

  try {
    const docRef = doc(db, "carts", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const cart = docSnap.data();
      const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

      if (existingItemIndex > -1) {
        // If the item already exists in the cart, update the quantity
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Otherwise, add a new item with product details
        cart.items.push({
          productId,
          productName,
          productPrice,
          productImage,
          quantity,
        });
      }

      await setDoc(docRef, cart); // Save the updated cart in Firestore
      res.json({
        message: "Product added to cart successfully",
        cart,
      });
    } else {
      // Create a new cart if it doesn't exist
      const newCart = { userId, items: [{ productId, productName, productPrice, productImage, quantity }] };
      await setDoc(docRef, newCart);
      res.status(201).json({
        message: "Cart created and product added successfully",
        cart: newCart,
      });
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({
      message: "Error adding to cart",
      error: error.message,
    });
  }
};

// Remove a product from the cart
const removeFromCart = async (req, res) => {
  const { userId } = req.params; // Assuming userId is passed as a URL parameter
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required." });
  }

  try {
    const docRef = doc(db, "carts", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const cart = docSnap.data();
      cart.items = cart.items.filter(item => item.productId !== productId);

      await setDoc(docRef, cart);
      res.json({
        message: "Product removed from cart successfully",
        cart,
      });
    } else {
      res.status(404).json({ message: "Cart not found" });
    }
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({
      message: "Error removing from cart",
      error: error.message,
    });
  }
};

// Update the quantity of a cart item
const updateCartItemQuantity = async (req, res) => {
  const { userId } = req.params; // Assuming userId is passed as a URL parameter
  const { productId, quantity } = req.body;

  // Check for required fields
  if (!productId || quantity === undefined) {
    return res.status(400).json({ message: "Product ID and quantity are required." });
  }

  try {
    const docRef = doc(db, "carts", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const cart = docSnap.data();
      const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity = quantity; // Update quantity
        await setDoc(docRef, cart);
        res.json({
          message: "Cart item quantity updated successfully",
          cart,
        });
      } else {
        res.status(404).json({ message: "Product not found in cart" });
      }
    } else {
      res.status(404).json({ message: "Cart not found" });
    }
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({
      message: "Error updating cart item",
      error: error.message,
    });
  }
};

module.exports = { getCart, addToCart, removeFromCart, updateCartItemQuantity };
