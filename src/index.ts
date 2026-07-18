import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import programRoutes from './routes/program.routes';
import aiRoutes from './routes/ai.routes';
import userRoutes from './routes/user.routes';
import { errorMiddleware } from './middleware/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({
  origin: (origin, callback) => {
    // In development or if FRONTEND_URL is not set, allow requests to prevent blockages
    if (!origin || origin === allowedOrigin || allowedOrigin === '*' || !process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Mount routers
app.use('/programs', programRoutes);
app.use('/ai', aiRoutes);
app.use('/users', userRoutes);

// Centralized error handling
app.use(errorMiddleware);

// Connect to MongoDB and Boot Express Server
async function startServer() {
  try {
    await connectDB();
  } catch (error: any) {
    console.warn('\n----------------------------------------------------------------------------------');
    console.warn('WARNING: Server booted but could not connect to MongoDB.');
    console.warn(`Reason: ${error.message}`);
    console.warn('Please populate MONGODB_URI in your .env file to enable full database operations.');
    console.warn('----------------------------------------------------------------------------------\n');
  }

  app.listen(PORT, () => {
    console.log(`Buildthenics Backend is running on port ${PORT}`);
  });
}

startServer();
