const pool = require('./connection');  // Import the pool for database connection

// Post Task Controller Function (for Admin)
const postTask = async (req, res) => {
    try {
        // Check if the logged-in user has 'Admin' role
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        // Destructure data from request body and authenticated user
        const { title, description, assigneeEmail } = req.body;
        const createdBy = req.user.email;  // Get the admin's email

        // Check if all required fields are provided
        if (!title || !description || !assigneeEmail) {
            return res.status(400).json({ message: 'Title, description, and assignee email are required' });
        }

        // Check if the assignee exists in the database by email
        const getUserQuery = 'SELECT id FROM users WHERE email = $1';
        const result = await pool.query(getUserQuery, [assigneeEmail]);

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Assignee not found' });
        }

        // Insert new task into the database with assignee_email and created_by
        const createTaskQuery = `
            INSERT INTO tasks (title, description, assignee_email, created_by)
            VALUES ($1, $2, $3, $4)
            RETURNING task_id, title, description, assignee_email, created_by;
        `;
        const taskResult = await pool.query(createTaskQuery, [title, description, assigneeEmail, createdBy]);
        const newTask = taskResult.rows[0];

        // Return response with task details
        res.status(201).json({
            message: 'Task created successfully',
            task: {
                id: newTask.task_id,
                title: newTask.title,
                description: newTask.description,
                assignee_email: newTask.assignee_email,
                created_by: newTask.created_by,  // Include creator's email
            },
        });
    } catch (error) {
        console.error('Error posting task:', error);
        res.status(500).json({ message: 'An internal server error occurred. Please try again later.' });
    }
};

module.exports = postTask;  // Export the function
