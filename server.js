const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// VULNERABILITY: Weak JWT secret (easily guessable)
const JWT_SECRET = 'secret123';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory data store (simulating a database)
let users = [];
let transactions = [];

// Helper function to find user by ID
const findUserById = (id) => users.find(user => user.id === id);

// Helper function to find user by username
const findUserByUsername = (username) => users.find(user => user.username === username);

// VULNERABILITY: No rate limiting for authentication endpoints
// Registration endpoint
app.post('/api/register', async (req, res) => {
    const { username, password, email } = req.body;
    
    // VULNERABILITY: Weak input validation
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    
    // Check if user already exists
    if (findUserByUsername(username)) {
        return res.status(400).json({ error: 'User already exists' });
    }
    
    // VULNERABILITY: Weak password requirements (no complexity checks)
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
        id: uuidv4(),
        username,
        email,
        password: hashedPassword,
        balance: 1000, // Starting balance
        role: 'user' // Default role
    };
    
    users.push(newUser);
    
    // VULNERABILITY: Returning sensitive information in response
    res.status(201).json({ 
        message: 'User created successfully',
        user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            balance: newUser.balance,
            role: newUser.role
        }
    });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    const user = findUserByUsername(username);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // VULNERABILITY: JWT token with no expiration
    const token = jwt.sign(
        { 
            userId: user.id, 
            username: user.username,
            role: user.role 
        }, 
        JWT_SECRET
        // No expiration set - vulnerability
    );
    
    res.json({ 
        message: 'Login successful',
        token,
        user: {
            id: user.id,
            username: user.username,
            balance: user.balance,
            role: user.role
        }
    });
});

// VULNERABILITY: Weak authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    // VULNERABILITY: No proper error handling for JWT verification
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        // VULNERABILITY: Revealing internal error information
        return res.status(403).json({ error: 'Invalid token', details: err.message });
    }
};

// VULNERABILITY: IDOR - Get user profile (any user can access any profile)
app.get('/api/user/:userId', authenticateToken, (req, res) => {
    const { userId } = req.params;
    
    // VULNERABILITY: No authorization check - any authenticated user can access any profile
    const user = findUserById(userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    // VULNERABILITY: Exposing sensitive information
    res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        role: user.role
    });
});

// VULNERABILITY: IDOR - Get user balance
app.get('/api/balance/:userId', authenticateToken, (req, res) => {
    const { userId } = req.params;
    
    // VULNERABILITY: No check if the requesting user is the same as the userId in params
    const user = findUserById(userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ balance: user.balance });
});

// Send money endpoint
app.post('/api/send', authenticateToken, (req, res) => {
    const { recipientId, amount } = req.body;
    const senderId = req.user.userId;
    
    if (!recipientId || !amount || amount <= 0) {
        return res.status(400).json({ error: 'Valid recipient and amount required' });
    }
    
    const sender = findUserById(senderId);
    const recipient = findUserById(recipientId);
    
    if (!sender || !recipient) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    if (sender.balance < amount) {
        return res.status(400).json({ error: 'Insufficient funds' });
    }
    
    // Process transaction
    sender.balance -= amount;
    recipient.balance += amount;
    
    const transaction = {
        id: uuidv4(),
        senderId,
        recipientId,
        amount,
        timestamp: new Date().toISOString(),
        type: 'transfer'
    };
    
    transactions.push(transaction);
    
    res.json({ 
        message: 'Transfer successful',
        transaction,
        newBalance: sender.balance
    });
});

// VULNERABILITY: IDOR - Get transaction history for any user
app.get('/api/transactions/:userId', authenticateToken, (req, res) => {
    const { userId } = req.params;
    
    // VULNERABILITY: No authorization check - any user can view any user's transactions
    const userTransactions = transactions.filter(
        t => t.senderId === userId || t.recipientId === userId
    );
    
    res.json({ transactions: userTransactions });
});

// VULNERABILITY: Admin endpoint with weak authorization
app.get('/api/admin/users', authenticateToken, (req, res) => {
    // VULNERABILITY: Only checking if user is authenticated, not if they're admin
    // Should check req.user.role === 'admin'
    
    res.json({ 
        users: users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            balance: user.balance,
            role: user.role
        }))
    });
});

// VULNERABILITY: Admin endpoint to modify user balance
app.post('/api/admin/modify-balance', authenticateToken, (req, res) => {
    const { userId, newBalance } = req.body;
    
    // VULNERABILITY: No admin role check
    const user = findUserById(userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    user.balance = newBalance;
    
    res.json({ 
        message: 'Balance updated successfully',
        user: {
            id: user.id,
            username: user.username,
            balance: user.balance
        }
    });
});

// Get all users (for frontend dropdown)
app.get('/api/users', authenticateToken, (req, res) => {
    res.json({ 
        users: users.map(user => ({
            id: user.id,
            username: user.username
        }))
    });
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Insecure Wallet Server running on port ${PORT}`);
    console.log('SECURITY WARNING: This application contains intentional vulnerabilities for educational purposes');
    
    // Create a default admin user for testing
    const adminUser = {
        id: uuidv4(),
        username: 'admin',
        email: 'admin@wallet.com',
        password: bcrypt.hashSync('admin123', 10),
        balance: 10000,
        role: 'admin'
    };
    users.push(adminUser);
    
    console.log('Default admin user created: admin/admin123');
});

