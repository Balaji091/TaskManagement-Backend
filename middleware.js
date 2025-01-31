const jwt = require('jsonwebtoken');

// JWT Verification Middleware
const verifyToken = (req, res, next) => {
    // Get the token from the Authorization header (Bearer Token)
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];  // Extract token after 'Bearer'

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    // Verify the token using the secret key
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        // Attach the decoded user data to the request object for later use
        req.user = decoded;
        next();  // Proceed to the next middleware or route handler
    });
};

module.exports = verifyToken;  // Exporting the middleware
