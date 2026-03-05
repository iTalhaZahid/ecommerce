import {Router} from "express"
import { addAddress, addToWishlist, deleteAddress, getAddress, getWishlist, removeFromWishlist, updateAddress } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router()

router.use(protectRoute) // Apply the protectRoute middleware to all routes in this router to ensure they are protected and require authentication

//address routes

router.post("/address",addAddress)
router.get("/address",getAddress)
router.put("/address/:addressId",updateAddress)
router.delete("/address/:addressId",deleteAddress)

//wishlist routes

router.post("/wishlist",addToWishlist)
router.get("/wishlist",getWishlist)
router.delete("/wishlist/:productId",removeFromWishlist)

export default router;