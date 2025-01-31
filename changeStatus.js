const pool = require('./connection');  // Import the pool for database connection

// Change Task Status Controller Function (for users)
const updateTaskStatus = async (req, res) => {
    try {
        // Verify user authentication from the JWT token middleware
        const { taskId, status } = req.body;

        // Verify the status is one of the valid options
        const validStatuses = ['Pending', 'In Progress', 'Completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Choose from "Pending", "In Progress", or "Completed".' });
        }

        // Check if the task exists
        const getTaskQuery = 'SELECT * FROM tasks WHERE task_id = $1';
        const taskResult = await pool.query(getTaskQuery, [taskId]);

        if (taskResult.rows.length === 0) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        const task = taskResult.rows[0];

        // Check if the logged-in user is the assignee of the task
        if (task.assignee_email !== req.user.email) {
            return res.status(403).json({ message: 'You can only update tasks assigned to you.' });
        }

        // Update the task status
        const updateTaskQuery = 'UPDATE tasks SET status = $1 WHERE task_id = $2 RETURNING task_id, title, description, status, assignee_email';
        const updatedTaskResult = await pool.query(updateTaskQuery, [status, taskId]);

        const updatedTask = updatedTaskResult.rows[0];

        // Return the updated task details
        res.status(200).json({
            message: 'Task status updated successfully',
            task: {
                id: updatedTask.task_id,
                title: updatedTask.title,
                description: updatedTask.description,
                status: updatedTask.status,
                assignee_email: updatedTask.assignee_email,
            },
        });
    } catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({ message: 'An internal server error occurred. Please try again later.' });
    }
};

module.exports = updateTaskStatus;  // Exporting the updateTaskStatus function
