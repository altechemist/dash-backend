const {
    collection,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    doc,
  } = require("firebase/firestore");
  const {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    updatePassword,
  } = require("firebase/auth");
  const { getStorage } = require("firebase/storage");
  const { db, auth } = require("../config/firebase");
  
  // Initialize Firebase Storage
  const storage = getStorage();
  
  // Register a user
  const registerUser = async (req, res) => {
    const { email, password } = req.body;

    // Validate the email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Validate the password
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: "Invalid password format." });
    }

  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      const userData = {
        uid: user.uid,
        role: "client",
        username: email.split('@')[0], 
        email: user.email,
        addresses: [],
        wishlist: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
  
      await setDoc(doc(db, "users", user.uid), userData);
  
      res.status(201).json({
        message: "User registered successfully",
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        },
      });
    } catch (error) {
      console.error("Error registering user:", error.message);
      res.status(400).json({
        message: "Error registering user",
        error: error.message,
        code: error.code,
      });
    }
  };
  
  // Login a user
  const loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      res.json({
        message: "User logged in successfully",
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        },
      });
    } catch (error) {
      console.error("Error logging in user:", error.message);
      res.status(401).json({
        message: "Invalid credentials",
        error: error.message,
        code: error.code,
      });
    }
  };
  
  // Logout a user
  const logoutUser = async (req, res) => {
    try {
      await signOut(auth);
      res.json({ message: "User logged out successfully" });
    } catch (error) {
      console.error("Error logging out user:", error.message);
      res.status(500).json({ message: "Error logging out", error: error.message });
    }
  };
  
  // Send password reset email
  const resetEmail = async (req, res) => {
    const { email } = req.body;
  
    try {
      await sendPasswordResetEmail(auth, email);
      res.json({ message: "Password reset email sent successfully" });
    } catch (error) {
      console.error("Error resetting password:", error.message);
      res.status(401).json({
        message: "Error sending password reset email",
        error: error.message,
        code: error.code,
      });
    }
  };
  
  // Get user profile
  const getUserProfile = async (req, res) => {
    const { uid } = req.params;
  
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
  
      if (userDoc.exists()) {
        res.json(userDoc.data());
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error.message);
      res.status(500).json({ message: "Error fetching user profile", error: error.message });
    }
  };
  
  // Update user profile
  const updateUserProfile = async (req, res) => {
    const { uid } = req.params;
    const updatedData = req.body;
  
    try {
      await updateDoc(doc(db, "users", uid), {
        ...updatedData,
        updatedAt: new Date(),
      });
  
      res.json({ message: "User profile updated successfully" });
    } catch (error) {
      console.error("Error updating user profile:", error.message);
      res.status(500).json({ message: "Error updating profile", error: error.message });
    }
  };
  
  // Change user password
  const changePassword = async (req, res) => {
    const { newPassword } = req.body;
    const user = auth.currentUser;
  
    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
  
    try {
      await updatePassword(user, newPassword);
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error.message);
      res.status(500).json({ message: "Error changing password", error: error.message });
    }
  };
  
  module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    resetEmail,
    getUserProfile,
    updateUserProfile,
    changePassword,
  };
  