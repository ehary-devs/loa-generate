import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'siloa_super_secret_key_2026';

export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, isSuperAdmin: user.isSuperAdmin },
    SECRET_KEY,
    { expiresIn: '24h' }
  );
};

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requireSuperAdmin = (req, res, next) => {
  if (!req.user?.isSuperAdmin) {
    return res.status(403).json({ error: 'Forbidden: Requires super_admin role' });
  }
  next();
};
