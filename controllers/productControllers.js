const {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} = require("firebase/firestore");
const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} = require("firebase/storage");
const { db } = require("../config/firebase");

// Initialize Firebase Storage
const storage = getStorage();

// Get all products from Firestore
const getAllProducts = async (req, res) => {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    const products = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      message: "Products retrieved successfully",
      products,
    });
  } catch (error) {
    console.error("Error getting products:", error);
    res.status(500).json({
      message: "Error retrieving products",
      error: error.message,
    });
  }
};

// Add a new product
const addProduct = async (req, res) => {
  const {
    name,
    brand,
    price,
    description,
    sku,
    category,
    subCategory,
    sizeOptions,
    isReturnable,
    bashProductUUID,
    productCode,
    soldBy,
    neckline,
    fit,
    sleeveLength,
    styleDetails,
    fabric,
    modelSize,
    modelMeasurements,
  } = req.body;

  // Check for required fields
  if (
    !name ||
    !brand ||
    !price ||
    !description ||
    !sku ||
    !category ||
    !subCategory ||
    !sizeOptions ||
    isReturnable === undefined ||
    !bashProductUUID ||
    !productCode
  ) {
    return res.status(400).json({
      message: "All required fields must be provided.",
    });
  }

  // Access the uploaded files (assuming multiple images)
  const imageFiles = req.files;
  if (!imageFiles || imageFiles.length === 0) {
    return res.status(400).json({
      message: "At least one image file is required.",
    });
  }

  try {
    const imagePromises = imageFiles.map(async (imageFile) => {
      const imageRef = ref(storage, `images/${Date.now()}-${imageFile.originalname}`);
      const snapshot = await uploadBytes(imageRef, imageFile.buffer);
      return getDownloadURL(snapshot.ref);
    });

    // Wait for all images to be uploaded
    const imageUrls = await Promise.all(imagePromises);

    // Add the product to Firestore
    const docRef = await addDoc(collection(db, "products"), {
      name,
      brand,
      price,
      description,
      sku,
      category,
      subCategory,
      sizeOptions,
      isReturnable,
      bashProductUUID,
      productCode,
      soldBy,
      neckline,
      fit,
      sleeveLength,
      styleDetails,
      fabric,
      modelSize,
      modelMeasurements,
      images: imageUrls, // Save array of image URLs
    });

    res.status(201).json({
      message: "Product added successfully",
      productId: docRef.id,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({
      message: "Error adding product",
      error: error.message,
    });
  }
};

// Get a product by its id
const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      res.json({
        message: "Product retrieved successfully",
        product: { id: docSnap.id, ...docSnap.data() },
      });
    } else {
      res.status(404).json({
        message: "Product not found",
      });
    }
  } catch (error) {
    console.error("Error getting product:", error);
    res.status(500).json({
      message: "Error retrieving product",
      error: error.message,
    });
  }
};

// Update a product by its id
const updateProduct = async (req, res) => {
  const id = req.params.id;
  const {
    name,
    brand,
    price,
    description,
    sku,
    category,
    subCategory,
    sizeOptions,
    isReturnable,
    bashProductUUID,
    productCode,
    soldBy,
    neckline,
    fit,
    sleeveLength,
    styleDetails,
    fabric,
    modelSize,
    modelMeasurements,
  } = req.body;

  // Check for required fields
  if (
    !name ||
    !brand ||
    !price ||
    !description ||
    !sku ||
    !category ||
    !subCategory ||
    !sizeOptions ||
    isReturnable === undefined ||
    !bashProductUUID ||
    !productCode
  ) {
    return res.status(400).json({
      message: "All required fields must be provided.",
    });
  }

  try {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const updates = {
        name,
        brand,
        price,
        description,
        sku,
        category,
        subCategory,
        sizeOptions,
        isReturnable,
        bashProductUUID,
        productCode,
        soldBy,
        neckline,
        fit,
        sleeveLength,
        styleDetails,
        fabric,
        modelSize,
        modelMeasurements,
      };

      // If new images are uploaded
      if (req.files) {
        const imageFiles = req.files;
        const imagePromises = imageFiles.map(async (imageFile) => {
          const imageRef = ref(storage, `images/${Date.now()}-${imageFile.originalname}`);
          const snapshot = await uploadBytes(imageRef, imageFile.buffer);
          return getDownloadURL(snapshot.ref);
        });

        // Wait for all new images to be uploaded
        const newImageUrls = await Promise.all(imagePromises);
        updates.images = [...(docSnap.data().images || []), ...newImageUrls];
      }

      await updateDoc(docRef, updates);

      res.json({
        message: "Product updated successfully",
        product: { id: docSnap.id, ...updates },
      });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};

// Delete a product by its id
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await deleteDoc(docRef);
      res.json({
        message: "Product deleted successfully",
      });
    } else {
      res.status(404).json({
        message: "Product not found",
      });
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      message: "Error deleting product",
      error: error.message,
    });
  }
};

module.exports = {
  getAllProducts,
  addProduct,
  getProductById,
  updateProduct,
  deleteProduct,
};
