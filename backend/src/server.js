import express from 'express';
import path from 'path';
import {ENV} from './config/env.js';
import {clerkMiddleware} from "@clerk/express"
import { connectDB } from './config/db.js';
const app = express();

const __dirname = path.resolve();

app.use(clerkMiddleware()); // Clerk middleware to handle authentication

app.get('/api/health', (req, res) => {
  res.status(200).json({message:'OK!'});
});

//make app ready for deployment
if(ENV.NODE_ENV==='production'){
  app.use(express.static(path.join(__dirname,'../admin/dist')));

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname,'../admin/dist/index.html'));
  });
}
 

app.listen(ENV.PORT, () => {
  console.log(`Server is running on http://localhost:${ENV.PORT}`);
  connectDB();
});
