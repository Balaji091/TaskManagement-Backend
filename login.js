const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');  // Importing the JWT library
const pool = require('./connection');  // Import the pool for database connection

// Login Controller Function
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Check if the email exists in the database
        const emailExistsQuery = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(emailExistsQuery, [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },  // Payload
            process.env.JWT_SECRET,  // Secret key (stored in .env file)
            { expiresIn: '1h' }  // Token expiration time (1 hour)
        );

        // Return the response with the JWT token
        res.status(200).json({
            message: 'Login successful',
            token: token,  // Send the generated JWT token
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,  // Ensure role is included
            },
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'An internal server error occurred. Please try again later.' });
    }
};

module.exports = login;  // Exporting the login function as middleware
