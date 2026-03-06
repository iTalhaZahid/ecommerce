import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";

export async function createOrder(req, res) {
  try {
    const user = req.user;
    const { orderItems, shippingAddress, paymentResult, totalPrice } = req.body;
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items provided" });
    }
    //validate product and stock
    for (const item of orderItems) {
      const product = await Product.findById(item._id);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found: ${item._id}` });
      }
      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for product: ${item._id}` });
      }

      const order = await Order.create({
        user: user._id,
        clerkId: user.clerkId,
        orderItems,
        shippingAddress,
        paymentResult,
        totalPrice,
      });
      //reduce stock
      for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { stock: -item.quantity },
        });
      }

      res.status(201).json({
        message: "Order created successfully",
        data: order,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}

export async function getUserOrders(req, res) {
  try {
    const orders = await Order.find({ clerkId: req.user.clerkId })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    //check if have been reviewed

    const ordersWithReviewStatus = await Promise.all(
      orders.map(async (order) => {
        const review = await Review.findOne({ orderId: order._id });
        return {
          ...order.toObject(),
          hasReviewed: !!review, //double bangle converts to boolean, true if review exists, false if not
        };
      }),
    );

    res.status(200).json({
      message: "Orders retrieved successfully",
      data: ordersWithReviewStatus,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
}
