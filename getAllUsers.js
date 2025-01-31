const pool = require('./connection');  // Import the pool for database connection

// Get All Users Controller Function (for Admin)
const getAllUsers = async (req, res) => {
    try {
        // Check if the logged-in user has 'admin' role
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        // Fetch all users from the database
        const getUsersQuery = 'SELECT id, name, email, role FROM users';
        const result = await pool.query(getUsersQuery);

        // Return the list of users
        res.status(200).json({
            message: 'Users retrieved successfully',
            users: result.rows,
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'An internal server error occurred. Please try again later.' });
    }
};

module.exports = getAllUsers;  // Exporting the getAllUsers function
