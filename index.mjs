import express from 'express';
import db from './config/db.js';
import cors from 'cors';
import bodyParser from "body-parser";
import authRoutes from "./routes/userauth.js";
import adminRoutes from './routes/admin.js';

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
db.connection.once('open', () => {
    console.log('Database connected successfully!');
});

app.use("/api/auth/user", authRoutes);
app.use("/api/auth/admin", adminRoutes);

// Export the app for Vercel
export default app;
