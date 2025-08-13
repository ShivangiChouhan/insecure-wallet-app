const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// SECURITY FIX: Strong JWT secret (should be environment variable in production)
const JWT_SECRET = crypto.randomBytes(64).toString('hex');
const JWT_EXPIRATION = '1h'; // Token expires in 1 hour

// Rate limiting storage (in production, use Redis or similar)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 5;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // SECURITY: Limit payload size
app.use(express.static('public'));

// In-memory data store (simulating a database)
let users = [];
let transactions = [];
let invalidatedTokens = new Set(); // Track invalidated tokens

// SECURITY FIX: Input validation middleware
const validateInput = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: 'Invalid input data' });
        }
        next();
    };
};

// SECURITY FIX: Rate limiting middleware
const rateLimit = (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitStore.has(clientIP)) {
        rateLimitStore.set(clientIP, { attempts: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return next();
    }
    
    const clientData = rateLimitStore.get(clientIP);
    
    if (now > clientData.resetTime) {
        // Reset the rate limit window
        rateLimitStore.set(clientIP, { attempts: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return next();
    }
    
    if (clientData.attempts >= RATE_LIMIT_MAX_ATTEMPTS) {
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    
    clientData.attempts++;
    next();
};

// SECURITY FIX: Password validation
const validatePassword = (password) => {
    if (!password || password.length < 8) {
        return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    return null;
};

// SECURITY FIX: Input sanitization
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
};

// Helper function to find user by ID
const findUserById = (id) => users.find(user => user.id === id);

// Helper function to find user by username
const findUserByUsername = (username) => users.find(user => user.username === username);

// SECURITY FIX: Enhanced authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    // SECURITY FIX: Check if token is invalidated
    if (invalidatedTokens.has(token)) {
        return res.status(403).json({ error: 'Token has been invalidated' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // SECURITY FIX: Verify user still exists
        const user = findUserById(decoded.userId);
        if (!user) {
            return res.status(403).json({ error: 'User not found' });
        }
        
        req.user = decoded;
        next();
    } catch (err) {
        // SECURITY FIX: Generic error message
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

// SECURITY FIX: Authorization middleware for admin functions
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// SECURITY FIX: Authorization middleware for resource access
const authorizeResourceAccess = (req, res, next) => {
    const requestedUserId = req.params.userId;
    const currentUserId = req.user.userId;
    
    // Users can only access their own data, unless they're admin
    if (requestedUserId !== currentUserId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }
    next();
};

// SECURITY FIX: Registration endpoint with proper validation
app.post('/api/register', rateLimit, async (req, res) => {
    try {
        const { username, password, email } = req.body;
        
        // SECURITY FIX: Input validation and sanitization
        if (!username || !password || !email) {
            return res.status(400).json({ error: 'Username, password, and email are required' });
        }
        
        const sanitizedUsername = sanitizeInput(username);
        const sanitizedEmail = sanitizeInput(email);
        
        // SECURITY FIX: Username and email validation
        if (sanitizedUsername.length < 3 || sanitizedUsername.length > 30) {
            return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitizedEmail)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        
        // Check if user already exists
        if (findUserByUsername(sanitizedUsername)) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        
        // SECURITY FIX: Strong password validation
        const passwordError = validatePassword(password);
        if (passwordError) {
            return res.status(400).json({ error: passwordError });
        }
        
        // SECURITY FIX: Stronger password hashing
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const newUser = {
            id: uuidv4(),
            username: sanitizedUsername,
            email: sanitizedEmail,
            password: hashedPassword,
            balance: 1000, // Starting balance
            role: 'user', // Default role
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        
        // SECURITY FIX: Don't return sensitive information
        res.status(201).json({ 
            message: 'User created successfully',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        // SECURITY FIX: Generic error message
        res.status(500).json({ error: 'Registration failed' });
    }
});

// SECURITY FIX: Login endpoint with rate limiting
app.post('/api/login', rateLimit, async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        
        const user = findUserByUsername(sanitizeInput(username));
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // SECURITY FIX: JWT token with expiration and secure claims
        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username,
                role: user.role,
                iat: Math.floor(Date.now() / 1000)
            }, 
            JWT_SECRET,
            { expiresIn: JWT_EXPIRATION }
        );
        
        // SECURITY FIX: Don't expose sensitive information
        res.json({ 
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// SECURITY FIX: Logout endpoint to invalidate tokens
app.post('/api/logout', authenticateToken, (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
        invalidatedTokens.add(token);
    }
    
    res.json({ message: 'Logged out successfully' });
});

// SECURITY FIX: Get user profile with proper authorization
app.get('/api/user/:userId', authenticateToken, authorizeResourceAccess, (req, res) => {
    const { userId } = req.params;
    
    const user = findUserById(userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    // SECURITY FIX: Don't expose sensitive information
    res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        role: user.role,
        createdAt: user.createdAt
    });
});

// SECURITY FIX: Get user balance with proper authorization
app.get('/api/balance/:userId', authenticateToken, authorizeResourceAccess, (req, res) => {
    const { userId } = req.params;
    
    const user = findUserById(userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ balance: user.balance });
});

// SECURITY FIX: Send money endpoint with proper validation
app.post('/api/send', authenticateToken, async (req, res) => {
    try {
        const { recipientId, amount } = req.body;
        const senderId = req.user.userId;
        
        // SECURITY FIX: Input validation
        if (!recipientId || !amount) {
            return res.status(400).json({ error: 'Recipient and amount are required' });
        }
        
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0 || numericAmount > 1000000) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        
        // Round to 2 decimal places
        const roundedAmount = Math.round(numericAmount * 100) / 100;
        
        const sender = findUserById(senderId);
        const recipient = findUserById(recipientId);
        
        if (!sender || !recipient) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        if (sender.id === recipient.id) {
            return res.status(400).json({ error: 'Cannot send money to yourself' });
        }
        
        if (sender.balance < roundedAmount) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }
        
        // Process transaction
        sender.balance = Math.round((sender.balance - roundedAmount) * 100) / 100;
        recipient.balance = Math.round((recipient.balance + roundedAmount) * 100) / 100;
        
        const transaction = {
            id: uuidv4(),
            senderId,
            recipientId,
            amount: roundedAmount,
            timestamp: new Date().toISOString(),
            type: 'transfer'
        };
        
        transactions.push(transaction);
        
        res.json({ 
            message: 'Transfer successful',
            transaction: {
                id: transaction.id,
                amount: transaction.amount,
                timestamp: transaction.timestamp,
                recipientUsername: recipient.username
            },
            newBalance: sender.balance
        });
    } catch (error) {
        res.status(500).json({ error: 'Transfer failed' });
    }
});

// SECURITY FIX: Get transaction history with proper authorization
app.get('/api/transactions/:userId', authenticateToken, authorizeResourceAccess, (req, res) => {
    const { userId } = req.params;
    
    const userTransactions = transactions.filter(
        t => t.senderId === userId || t.recipientId === userId
    );
    
    // SECURITY FIX: Sanitize transaction data
    const sanitizedTransactions = userTransactions.map(t => ({
        id: t.id,
        senderId: t.senderId,
        recipientId: t.recipientId,
        amount: t.amount,
        timestamp: t.timestamp,
        type: t.type
    }));
    
    res.json({ transactions: sanitizedTransactions });
});

// SECURITY FIX: Admin endpoint with proper authorization
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
    // SECURITY FIX: Don't expose passwords or sensitive data
    const sanitizedUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        role: user.role,
        createdAt: user.createdAt
    }));
    
    res.json({ users: sanitizedUsers });
});

// SECURITY FIX: Admin endpoint to modify user balance with proper authorization
app.post('/api/admin/modify-balance', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { userId, newBalance } = req.body;
        
        // SECURITY FIX: Input validation
        if (!userId || newBalance === undefined) {
            return res.status(400).json({ error: 'User ID and new balance are required' });
        }
        
        const numericBalance = parseFloat(newBalance);
        if (isNaN(numericBalance) || numericBalance < 0 || numericBalance > 10000000) {
            return res.status(400).json({ error: 'Invalid balance amount' });
        }
        
        const user = findUserById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const oldBalance = user.balance;
        user.balance = Math.round(numericBalance * 100) / 100;
        
        // SECURITY FIX: Audit log for admin actions
        console.log(`Admin ${req.user.username} modified balance for user ${user.username} from ${oldBalance} to ${user.balance}`);
        
        res.json({ 
            message: 'Balance updated successfully',
            user: {
                id: user.id,
                username: user.username,
                balance: user.balance
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Balance modification failed' });
    }
});

// SECURITY FIX: Get users list with proper authorization (for dropdown)
app.get('/api/users', authenticateToken, (req, res) => {
    // SECURITY FIX: Only return minimal information needed for functionality
    const userList = users
        .filter(user => user.id !== req.user.userId) // Don't include current user
        .map(user => ({
            id: user.id,
            username: user.username
        }));
    
    res.json({ users: userList });
});

// SECURITY FIX: Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0-secure'
    });
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// SECURITY FIX: Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// SECURITY FIX: 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Secure Wallet Server running on port ${PORT}`);
    console.log('SECURITY: This is the secure version with proper security controls');
    
    // Create a default admin user for testing
    const adminUser = {
        id: uuidv4(),
        username: 'admin',
        email: 'admin@wallet.com',
        password: bcrypt.hashSync('SecureAdmin123!', 12),
        balance: 10000,
        role: 'admin',
        createdAt: new Date().toISOString()
    };
    users.push(adminUser);
    
    console.log('Default admin user created: admin/SecureAdmin123!');
    console.log('JWT Secret generated:', JWT_SECRET.substring(0, 16) + '...');
});

