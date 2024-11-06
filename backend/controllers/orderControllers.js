const {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
} = require("firebase/firestore");
const { db } = require("../config/firebase");
const { Request, Response } = require("express");

// Create a new order
const createOrder = async (req, res) => {
  const { userId, items } = req.body;

  // Check for required fields
  if (!userId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "User ID and items are required." });
  }

  try {
    const newOrder = {
      userId,
      items,
      status: "Pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, "orders"), newOrder);
    res.status(201).json({
      message: "Order created successfully",
      orderId: docRef.id,
      order: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      message: "Error creating order",
      error: error.message,
    });
  }
};

// Get an order by its ID
const getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const docRef = doc(db, "orders", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      res.json({
        message: "Order retrieved successfully",
        order: { id: docSnap.id, ...docSnap.data() },
      });
    } else {
      res.status(404).json({
        message: "Order not found",
      });
    }
  } catch (error) {
    console.error("Error getting order:", error);
    res.status(500).json({
      message: "Error retrieving order",
    });
  }
};

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const querySnapshot = await getDocs(collection(db, "orders"));
    const orders = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      message: "Orders retrieved successfully",
      orders,
    });
  } catch (error) {
    console.error("Error getting orders", error);
    res.status(500).json({
      message: "Error retrieving orders",
    });
  }
};

// Update the status of an order
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required." });
  }

  try {
    const docRef = doc(db, "orders", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await updateDoc(docRef, { status, updatedAt: new Date() });
      res.json({
        message: "Order status updated successfully",
        order: { id: docSnap.id, ...docSnap.data(), status },
      });
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Error updating order status" });
  }
};

// Cancel an order
const cancelOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const docRef = doc(db, "orders", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await updateDoc(docRef, { status: "Canceled", updatedAt: new Date() });
      res.json({
        message: "Order canceled successfully",
        order: { id: docSnap.id, ...docSnap.data(), status: "Canceled" },
      });
    } else {
      res.status(404).json({
        message: "Order not found",
      });
    }
  } catch (error) {
    console.error("Error canceling order", error);
    res.status(500).json({
      message: "Error canceling order",
    });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};
