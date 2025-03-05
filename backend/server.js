import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:8080', 
    'http://localhost:5173', 
    'http://localhost:3000', 
    'http://localhost:8081', 
    'http://localhost:8082', 
    'https://poolleaguemanager.com',
    'https://pool-league-manager.onrender.com',
    'https://poolleaguemanager.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS before other middleware
app.use(cors(corsOptions));
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB with improved options
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000, // Timeout after 30 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true,
  w: "majority",
  ssl: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Could not connect to MongoDB:', err);
    // Continue running the server even if MongoDB connection fails
  });

// Add connection error handler
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// Health check route
app.use('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Pool League Manager API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5001;

// Check if port is in use before starting
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please use a different port.`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
}); 