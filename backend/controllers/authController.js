const bcrypt = require('bcrypt');
const supabase = require('../config/supabase');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, verifyAccessToken } = require('../utils/jwt');

/**
 * User Signup Controller
 * Creates a new user account with hashed password and returns JWT tokens
 */
const signup = async (req, res) => {
  try {
        const { email, password } = req.body;
        if (!email || !password) {
          return res.status(400).json({ 
            error: 'Email and password are required' 
          });
      }
    
      if (password.length < 8) {
        return res.status(400).json({ 
          error: 'Password must be at least 8 characters long' 
        });
      }
    
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          error: 'Invalid email format' 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
         
     // Create user in database
      const { data: user, error } = await supabase
            .from('users')
            .insert([{ 
              email, 
              password: hashedPassword 
            }])
            .select()
            .single();

          if (error) {
            // Handle duplicate email
            if (error.code === '23505') {
              return res.status(400).json({ 
                error: 'Email already exists' 
              });
            }
            return res.status(400).json({ 
              error: error.message 
            });
          }

          // Generate tokens
          const accessToken = generateAccessToken(user.id);
          const refreshToken = generateRefreshToken(user.id);

          // Set HTTP-only cookies
          res.cookie('accessToken', accessToken, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'lax', 
            maxAge: 15 * 60 * 1000 // 15 minutes
          });
          
          res.cookie('refreshToken', refreshToken, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'lax', 
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
          });

          // Return success response
          res.status(201).json({ 
            message: 'Signup successful',
            user: { 
              id: user.id, 
              email: user.email 
            }
          });
          
        } catch (err) {
          console.error('Signup error:', err);
          res.status(500).json({ 
            error: 'Internal server error' 
          });
        }
      };

      /**
       * User Login Controller
       * Authenticates user credentials and returns JWT tokens
       */
      const login = async (req, res) => {
        try {
          const { email, password } = req.body;
          
          // Validation
          if (!email || !password) {
            return res.status(400).json({ 
              error: 'Email and password are required' 
            });
          }

          // Find user by email
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
            
          if (error || !user) {
            return res.status(401).json({ 
              error: 'Invalid email or password' 
            });
          }

          // Verify password
          const validPassword = await bcrypt.compare(password, user.password);
          if (!validPassword) {
            return res.status(401).json({ 
              error: 'Invalid email or password' 
            });
          }

          // Generate tokens
          const accessToken = generateAccessToken(user.id);
          const refreshToken = generateRefreshToken(user.id);

          // Set HTTP-only cookies
          res.cookie('accessToken', accessToken, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'lax', 
            maxAge: 15 * 60 * 1000 
          });
          
          res.cookie('refreshToken', refreshToken, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'lax', 
            maxAge: 7 * 24 * 60 * 60 * 1000 
          });

          // Return success response
          res.json({ 
            message: 'Login successful',
            user: { 
              id: user.id, 
              email: user.email 
            }
          });
          
        } catch (err) {
          console.error('Login error:', err);
          res.status(500).json({ 
            error: 'Internal server error' 
          });
        }
      };

      /**
       * Refresh Token Controller
       * Generates a new access token using refresh token
       */
      const refreshToken = async (req, res) => {
        try {
          const refreshToken = req.cookies.refreshToken;
          
          if (!refreshToken) {
            return res.status(401).json({ 
              error: 'Refresh token required' 
            });
          }

          // Verify refresh token
          const decoded = verifyRefreshToken(refreshToken);
          if (!decoded) {
            return res.status(403).json({ 
              error: 'Invalid or expired refresh token' 
            });
          }

          // Generate new access token
          const newAccessToken = generateAccessToken(decoded.userId);
          
          res.cookie('accessToken', newAccessToken, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'lax', 
            maxAge: 15 * 60 * 1000 
          });

          res.json({ 
            message: 'Access token refreshed successfully' 
          });
          
        } catch (err) {
          console.error('Token refresh error:', err);
          res.status(500).json({ 
            error: 'Internal server error' 
          });
        }
      };

      /**
       * Logout Controller
       * Clears authentication cookies
       */
      const logout = (req, res) => {
        try {
          res.clearCookie('accessToken');
          res.clearCookie('refreshToken');
          
          res.json({ 
            message: 'Logout successful' 
          });
        } catch (err) {
          console.error('Logout error:', err);
          res.status(500).json({ 
            error: 'Internal server error' 
          });
        }
      };

      /**
       * Get Current User Controller
       * Returns authenticated user information
       */
      const getCurrentUser = async (req, res) => {
        try {
          const token = req.cookies.accessToken;
          
          if (!token) {
            return res.status(401).json({ 
              error: 'Not authenticated' 
            });
          }

          // Verify access token
          const decoded = verifyAccessToken(token);
          if (!decoded) {
            return res.status(403).json({ 
              error: 'Invalid or expired token' 
            });
          }

          // Fetch user data
          const { data: user, error } = await supabase
            .from('users')
            .select('id, email, created_at')
            .eq('id', decoded.userId)
            .single();
            
          if (error || !user) {
            return res.status(404).json({ 
              error: 'User not found' 
            });
          }

          res.json({ 
            user 
          });
          
        } catch (err) {
          console.error('Get current user error:', err);
          res.status(500).json({ 
            error: 'Internal server error' 
          });
        }
      };

      module.exports = {
        signup,
        login,
        refreshToken,
        logout,
        getCurrentUser
      };