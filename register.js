const bcrypt = require('bcrypt');
const pool = require('./connection');  // Import the pool for database connection

// Register Controller Function
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if all required fields are provided
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if email already exists in the database
        const emailExistsQuery = 'SELECT * FROM users WHERE email = $1';
        const emailExists = await pool.query(emailExistsQuery, [email]);

        if (emailExists.rows.length > 0) {
            return res.status(400).json({ message: 'Email already in use.' });
        }

        // Insert new user into the database
        const createUserQuery = `
            INSERT INTO users (name, email, password, role)
            VALUES ($1, $2, $3, $4) RETURNING id, name, email, role;
        `;
        const result = await pool.query(createUserQuery, [name, email, hashedPassword, role]);
        const newUser = result.rows[0];

        // Return the response with user data (excluding password) and success message
        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'An internal server error occurred. Please try again later.' });
    }
};

module.exports = register; // Exporting the register function as middleware
