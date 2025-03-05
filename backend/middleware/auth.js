import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  try {
    console.log(`Auth middleware called for ${req.method} ${req.originalUrl}`);
    
    // Get token from header
    const authHeader = req.header('Authorization');
    console.log(`Authorization header: ${authHeader ? 'present' : 'missing'}`);
    
    const token = authHeader?.replace('Bearer ', '');
    
    // Check if no token
    if (!token) {
      console.log('No token provided in request');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Log token details (safely)
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      try {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        console.log(`Token payload: userId=${payload.userId}, exp=${new Date(payload.exp * 1000).toISOString()}`);
        
        // Check if token is expired
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
          console.log(`Token expired at ${new Date(payload.exp * 1000).toISOString()}, current time is ${new Date().toISOString()}`);
        }
      } catch (e) {
        console.log('Could not parse token payload:', e.message);
      }
    } else {
      console.log('Token does not have the expected JWT format');
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(`Token verified successfully for user ${decoded.userId}`);
      
      // Add user from payload
      req.user = decoded;
      next();
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError.message);
      return res.status(401).json({ message: 'Token is not valid', error: verifyError.message });
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: 'Token is not valid', error: err.message });
  }
};

export default auth; 