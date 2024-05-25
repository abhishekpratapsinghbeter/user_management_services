const jwt = require('jsonwebtoken');

// Middleware to check user role
function authMiddleware(allowedRoles) {
    return function(req, res, next) {
        // Extract JWT token from cookie or Authorization header
        let token;
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } else if (req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        try {
            // Verify and decode JWT token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const { userID, role } = decoded;

            // Check if user role is allowed
            if (!allowedRoles.includes(role)) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            // Attach user role to request object for further processing
            req.auth = {
                userID: userID,
                userRole: role
            };
            next();
        } catch (error) {
            console.error('Error in authMiddleware:', error);
            return res.status(401).json({ error: 'Unauthorized' });
        }
    };
}

// Export the middleware function
module.exports = authMiddleware;
