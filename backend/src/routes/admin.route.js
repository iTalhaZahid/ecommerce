import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  updateProduct,
} from "../controllers/admin.controller.js";
import { adminOnly, protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.use(protectRoute, adminOnly); // Apply protectRoute and adminOnly middleware to all routes in this router

router.post("/products", upload.array("images", 3), createProduct); // Use multer middleware to handle file uploads, allowing up to 3 images per product
router.get("/products", getAllProducts);
router.put("/products/:id", upload.array("images", 3), updateProduct);

export default router;
