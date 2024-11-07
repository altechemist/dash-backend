const { doc, getDoc, setDoc } = require("firebase/firestore");
const { db } = require("../config/firebase");

// Get cart for a user (initialize empty cart if it doesn't exist)
const getCart = async (req, res) => {
  const { userId } = req.params;

  try {
    const docRef = doc(db, "carts", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Cart exists
      res.json({
        message: "Cart retrieved successfully",
        cart: docSnap.data(),
      });
    } else {
      // Cart doesn't exist, create and return empty cart
      const newCart = { userId, items: [] };
      await setDoc(docRef, newCart);

      res.status(201).json({
        message: "Cart created and empty",
        cart: newCart,
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

// Add a product to the cart (create cart if it doesn't exist)
const addToCart = async (req, res) => {
  const { userId } = req.params;
  const { productId, productName, productPrice, productImage, quantity } = req.body;

  // Check for required fields
  if (!productId || quantity === undefined || !productName || !productPrice || !productImage) {
    return res.status(400).json({ message: "Product ID, quantity, name, price, and image are required." });
  }

  // Ensure userId is provided and is valid
  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    // Log userId and document reference for debugging
    console.log("UserID:", userId);
    
    const docRef = doc(db, "carts", userId);
    
    // Log the docRef path
    console.log("Firestore Doc Ref:", docRef.path);
    
    const docSnap = await getDoc(docRef);

    let cart;

    if (docSnap.exists()) {
      // Cart exists, retrieve it
      cart = docSnap.data();

      // Ensure the 'items' array exists (initialize if missing)
      if (!cart.items) {
        cart.items = [];
      }

      // Log the items array to check for undefined or incorrect structure
      console.log("Cart items: ", cart.items);

      const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

      if (existingItemIndex > -1) {
        // Update quantity if product already exists
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new product to the cart
        cart.items.push({ productId, productName, productPrice, productImage, quantity });
      }

      // Save the updated cart
      await setDoc(docRef, cart);
    } else {
      // Cart doesn't exist, create a new one
      cart = { userId, items: [{ productId, productName, productPrice, productImage, quantity }] };
      await setDoc(docRef, cart);
    }

    res.json({
      message: "Product added to cart successfully",
      cart,
    });
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
  const { userId } = req.params;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required." });
  }

  try {
    const docRef = doc(db, "carts", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const cart = docSnap.data();
      cart.items = cart.items.filter((item) => item.productId !== productId);

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
  const { userId } = req.params;
  const { productId, quantity } = req.body;

  if (!productId || quantity === undefined) {
    return res
      .status(400)
      .json({ message: "Product ID and quantity are required." });
  }

  try {
    const docRef = doc(db, "carts", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const cart = docSnap.data();
      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId === productId
      );

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
