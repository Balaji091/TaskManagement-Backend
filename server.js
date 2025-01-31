const express = require('express');
const cors = require('cors');
const register = require('./register'); // Import the register controller
require('dotenv').config();
const login = require('./login');
const getAllUsers = require('./getAllUsers'); 
const verifyToken = require('./middleware');
const postTask = require('./postTask');
const getUserTasks = require('./getUserTasks'); 
const app = express();
const updateTaskStatus=require('./changeStatus')
// Middleware
app.use(cors());
app.use(express.json()); // Using express.json() for parsing JSON request bodies

// Routes                                                                                                                                                                       
app.post('/register', register); // Correct route for registering
app.post('/login', login); 
app.get('/users', verifyToken, getAllUsers); 
app.post('/task', verifyToken, postTask); 
app.get('/tasks/me', verifyToken, getUserTasks);
app.patch('/tasks/update', verifyToken, updateTaskStatus);
// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
