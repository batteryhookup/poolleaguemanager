import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token.' });
  }
};

// Update password endpoint
router.post('/update-password', authenticateToken, async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    
    // Verify that the user making the request is the same as the user being updated
    if (req.user.userId !== userId) {
      return res.status(403).json({ message: 'You can only update your own password.' });
    }
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Update the password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Error updating password.' });
  }
});

export default router; 