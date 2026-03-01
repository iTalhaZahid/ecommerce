import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import { User } from "../models/user.model.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "ecommerce-app" });

const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      await connectDB();
      const { id, email_addresses, first_name, last_name, image_url } =
        event.data;
      //for mongoose, we need to create a new instance of the model and then save it to the database
      const newUser = {
        clerkId: id,
        email: email_addresses[0]?.email_address,
        name: `${first_name || ""} ${last_name || ""}`.trim() || "User",
        imageUrl: image_url,
      };

      //Now we can create a new user document and save it to the database
      await User.create(newUser);
    } catch (e) {
      console.error("Failed to sync user", e);
      throw e;
    }
  },
);

// delete user when clerk/user.deleted event is triggered

const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      await connectDB();
      const { id } = event.data;
      await User.findOneAndDelete({ clerkId: id });
    } catch (e) {
      console.error("Failed to delete user", e);
      throw e;
    }
  },
);

//for updating user when clerk/user.updated event is triggered, we can create another function

const updateUserInDB = inngest.createFunction(
  { id: "update-user-in-db" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    try {
      await connectDB();
      const { id, email_addresses, first_name, last_name, image_url } =
        event.data;
      const updatedUser = {
        email: email_addresses[0]?.email_address,
        name: `${first_name || ""} ${last_name || ""}`.trim() || "User",
        imageUrl: image_url,
      };
      await User.findOneAndUpdate({ clerkId: id }, updatedUser, { new: true }); //{new:true} option is used to return the updated document instead of the old one
    } catch (e) {
      console.error("Failed to update user", e);
      throw e;
    }
  },
);

export const functions = [syncUser, deleteUserFromDB, updateUserInDB];
