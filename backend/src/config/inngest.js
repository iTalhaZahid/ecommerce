import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import { User } from "../models/user.model.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "ecommerce-app" });

const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();
    const { id, email_addresses, first_name, last_name, image_url } =
      event.data;
    //for mongoose, we need to create a new instance of the model and then save it to the database
    const newUser = {
      clerkId: id,
      email: email_addresses[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}` || "User",
      imageUrl: image_url,
    };

    //Now we can create a new user document and save it to the database
    await User.create(newUser);
  },
);

// delete user when clerk/user.deleted event is triggered

const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();
    const { id } = event.data;
    await User.findOneAndDelete({ clerkId: id });
  },
);



export const functions = [syncUser, deleteUserFromDB];
