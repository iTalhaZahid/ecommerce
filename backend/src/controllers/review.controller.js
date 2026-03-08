import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";

export async function createReview(req, res) {
  try {
    const { productId, rating, orderId } = req.body;
    if (!productId || !orderId) {
      return res
        .status(400)
        .json({ message: "ProductId and OrderId required" });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Invalid rating-Must be between 1 and 5" });
    }
    const user = req.user;
    //verify that the user has purchased the product before allowing them to review
    const order = await Order.findById(orderId);
    if (!order || order.user.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only review products you have purchased" });
    }
    if (order.status !== "delivered") {
      return res.status(403).json({
        message: "You can only review products after they have been delivered",
      });
    }

    //Verify that the order contains the product being reviewed
    const productInOrder = order.orderItems.find(
      (item) => item.product.toString() === productId,
    );
    if (!productInOrder) {
      return res.status(403).json({
        message: "You can only review products that are in your order",
      });
    }

    //Check if the user has already reviewed this product in this order
    const existingReview = await Review.findOne({
      userId: user._id,
      productId: productId,
    });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this product" });
    }

    //Create the review and update the product's average rating and review count

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    //Create the review
    const review = await Review.create({
      userId: user._id,
      productId: productId,
      orderId: orderId,
      rating,
    });
    //Update the product's average rating and review count
    product.totalReviews += 1;
    product.averageRating =
      (product.averageRating * (product.totalReviews - 1) + rating) /
      product.totalReviews;
    product.averageRating = Number(product.averageRating.toFixed(1));

    await product.save();

    return res
      .status(201)
      .json({ message: "Review created successfully", review });
  } catch (error) {
    console.log("Error in creating review", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteReview(req, res) {
  try {
    const user = req.user;
    const { reviewId } = req.params;

    // Find review first
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Authorization check
    if (review.userId.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only delete your own reviews" });
    }

    const productId = review.productId;

    // Delete review
    await review.deleteOne();

    // Update product rating
    const product = await Product.findById(productId);

    if (product) {
      product.totalReviews -= 1;

      if (product.totalReviews === 0) {
        product.averageRating = 0;
      } else {
        const reviews = await Review.find({ productId });

        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);

        product.averageRating = Number(
          (totalRating / reviews.length).toFixed(1)
        );
      }

      await product.save();
    }

    return res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.log("Error in deleting review", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
