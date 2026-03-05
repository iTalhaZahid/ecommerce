import { User } from "../models/user.model.js";

export async function addAddress(req, res) {
  try {
    const {
      label,
      fullName,
      streetAddress,
      city,
      state,
      zipCode,
      phoneNumber,
      isDefault,
    } = req.body;

    const user = req.user;

    if (!fullName || !streetAddress || !city || !state || !zipCode) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (isDefault) {
      // If the new address is marked as default, unset the default flag for all other addresses
      user.addresses.forEach((address) => {
        address.isDefault = false;
      });
    }

    user.addresses.push({
      label,
      fullName,
      streetAddress,
      city,
      state,
      zipCode,
      phoneNumber,
      isDefault: isDefault || false,
    });

    await user.save();

    res.status(201).json({
      message: "Address added successfully",
      data: user.addresses,
    });
  } catch (error) {
    console.log("Error adding address:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAddress(req, res) {
  try {
    const user = req.user;
    res.status(200).json({
      message: "Addresses retrieved successfully",
      data: user.addresses,
    });
  } catch (error) {
    console.log("Error retrieving addresses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateAddress(req, res) {
  try {
    const {
      label,
      fullName,
      streetAddress,
      city,
      state,
      zipCode,
      phoneNumber,
      isDefault,
    } = req.body;
    const { addressId } = req.params;
    const user = req.user;
    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (isDefault) {
      // If the updated address is marked as default, unset the default flag for all other addresses
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    address.label = label || address.label;
    address.fullName = fullName || address.fullName;
    address.streetAddress = streetAddress || address.streetAddress;
    address.city = city || address.city;
    address.state = state || address.state;
    address.zipCode = zipCode || address.zipCode;
    address.phoneNumber = phoneNumber || address.phoneNumber;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    await user.save();

    res.status(200).json({
      message: "Address updated successfully",
      data: user.addresses,
    });
  } catch (error) {
    console.log("Error updating address:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteAddress(req, res) {
  try {
    const { addressId } = req.params;
    const user = req.user;
    user.addresses.pull(addressId); // Mongoose's pull method to remove the address from the array
    await user.save();
    res.status(200).json({
      message: "Address deleted successfully",
      data: user.addresses,
    });
  } catch (error) {
    console.log("Error deleting address:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function addToWishlist(req, res) {
  try {
    const { productId } = req.body;
    const user = req.user;

    //check if product is already in wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }
    user.wishlist.push(productId);
    await user.save();
    res.status(200).json({
      message: "Product added to wishlist",
      data: user.wishlist,
    });
  } catch (error) {
    console.log("Error adding to wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getWishlist(req, res) {
  try {
    const user = await User.findById(req.user._id).populate("wishlist"); // Populate the wishlist with product details
    res.status(200).json({
      message: "Wishlist retrieved successfully",
      data: user.wishlist,
    });
  } catch (error) {
    console.log("Error retrieving wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function removeFromWishlist(req, res) {
  try {
    const { productId } = req.params;
    const user = req.user;

    //Check if product is in wishlist
    if (!user.wishlist.includes(productId)) {
      return res.status(400).json({ message: "Product not in wishlist" });
    }

    user.wishlist.pull(productId);
    await user.save();
    res.status(200).json({
      message: "Product removed from wishlist",
      data: user.wishlist,
    });
  } catch (error) {
    console.log("Error removing from wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
