import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";

export async function createOrder(req, res) {
  try {
    const session = await Product.startSession(); // Start a Mongoose session for transaction
    session.startTransaction();

    const user = req.user;
    const { orderItems, shippingAddress, paymentResult, totalPrice } = req.body;
    if (!orderItems || orderItems.length === 0) {
      await session.abortTransaction(); // Abort the transaction if validation fails
      session.endSession(); // End the session
      return res.status(400).json({ message: "No order items provided" });
    }
    //validate product and stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product._id).session(session); // Use the session for the query
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(404)
          .json({ message: `Product not found: ${item._id}` });
      }
      if (product.stock < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ message: `Insufficient stock for product: ${item._id}` });
      }

      const order = await Order.create(
        [
          {
            user: user._id,
            clerkId: user.clerkId,
            orderItems,
            shippingAddress,
            paymentResult,
            totalPrice,
          },
        ],
        { session },
      ); // Create the order within the transaction

      //reduce stock
      for (const item of orderItems) {
        await Product.findByIdAndUpdate(
          item.product._id,
          {
            $inc: { stock: -item.quantity },
          },
          { session },
        ); // Use the session for the update
      }

      await session.commitTransaction(); // Commit the transaction
      session.endSession(); // End the session

      res.status(201).json({
        message: "Order created successfully",
        data: order,
      });
    }
  } catch (error) {
    console.log("Error in Creating Order", error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Internal server error", error });
  }
}

export async function getUserOrders(req, res) {
  try {
    const orders = await Order.find({ clerkId: req.user.clerkId })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    //check if have been reviewed

    const orderIds = orders.map((order) => order._id);
    const reviews = await Review.find({ orderId: { $in: orderIds } });
    const reviewOrderIds = new Set(reviews.map((review) => review.orderId.toString()));

    const ordersWithReviewStatus = await Promise.all(
      orders.map(async (order) => {
        return {
          ...order.toObject(),
          hasReviewed: reviewOrderIds.has(order._id.toString()), 
        };
      }),
    );

    res.status(200).json({
      message: "Orders retrieved successfully",
      data: ordersWithReviewStatus,
    });
  } catch (error) {
    console.log("Error getting orders:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
}
