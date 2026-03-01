import express from "express";
import path from "path";
import { ENV } from "./config/env.js";
import { clerkMiddleware } from "@clerk/express";
import { connectDB } from "./config/db.js";
import { serve } from "inngest/express"; //inngest express middleware to handle incoming events from inngest
import { functions, inngest } from "./config/inngest.js";
import adminRoutes from "./routes/admin.route.js";


const app = express();

const __dirname = path.resolve();

app.use(express.json()); // Middleware to parse JSON request bodies also needed for parsing incoming events from inngest, as they are sent as JSON payloads
app.use(clerkMiddleware()); // Clerk middleware to handle authentication
app.use("/api/inngest", serve({ client: inngest, functions })); // Use the Inngest middleware to handle incoming events at the /api/inngest endpoint
// Custom Routes
app.use("/api/admin",adminRoutes)

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "OK!" });
});

//make app ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../admin/dist")));

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../admin/dist/index.html"));
  });
}

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => {
      console.log(`Server is running on http://localhost:${ENV.PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database", error);
    process.exit(1); // Exit the process with an error code
  }
};

startServer();
