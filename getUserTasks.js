const pool = require('./connection');  // Import database connection

// Get User Tasks Controller Function
const getUserTasks = async (req, res) => {
    try {
        // Extract user role and email from the authenticated request (JWT token)
        const { role, email } = req.user;

        let tasksQuery;
        let queryParams;

        if (role === 'Admin') {
            // Fetch tasks assigned by the admin (created by the admin)
            tasksQuery = `
                SELECT t.task_id, t.title, t.description, t.status, u.email AS assignee_email
                FROM tasks t
                JOIN users u ON t.assignee_email = u.email
                WHERE t.created_by = $1
            `;
            queryParams = [email];
        } else {
            // Fetch tasks assigned to the logged-in user
            tasksQuery = `
                SELECT t.task_id, t.title, t.description, t.status
                FROM tasks t
                WHERE t.assignee_email = $1
            `;
            queryParams = [email];
        }

        // Execute the query
        const result = await pool.query(tasksQuery, queryParams);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No tasks found' });
        }

        // Return the tasks
        res.status(200).json({ tasks: result.rows });

    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'An internal server error occurred. Please try again later.' });
    }
};

module.exports = getUserTasks;  // Export function
