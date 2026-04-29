const bcrypt = require("bcryptjs"),
    { generateToken, createSession } = require("../utils/authProvider");
const { users, sessionLogs } = require("../models");

const salt = 12;

// Signup Route
exports.userSignup = async (req, res) => {
    try {
        const { email, password, userType } = req.body;

        // Validate input
        if (!email || !password || !userType) {
            return res.status(402).json({ message: "All fields are required." });
        }
        // Validate user type
        if (!['candidate', 'employer'].includes(userType)) {
            return res.status(402).json({
                success: false,
                message: 'Invalid user type. Must be either "candidate" or "employer"'
            });
        }

        // Check if user exists
        const existingUser = await users.findOne({ where: { email } });
        if (existingUser) {
            return res.status(402).json({
                success: false,
                message: 'Email already registered'
            });
        }

        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await users.create({
            email,
            userType,
            password: hashedPassword,
            authProvider: 'local'
        });

        // Generate token
        const token = generateToken(user);

        // Create session
        await createSession(user, token);

        return res.status(201).json({ success: true, message: "User registered successfully.", User: user });
    } catch (error) {
        return res.status(402).json({
            success: false,
            message: 'Error in signup',
            error: error.message
        });
    }
};

// LogIn Route
exports.userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await users.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if this user is OAuth-only
        if (user.authProvider !== 'local' || !user.password) {
            return res.status(401).json({
                success: false,
                message: `This account uses ${user.authProvider} authentication. Please login using ${user.authProvider}.`
            });
        }

        const isActive = await user.status === 'active';
        // Check if user is active
        if (!isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is restricted'
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user);

        // Invalidate existing sessions
        await sessionLogs.update(
            {
                status: 'loggedout',
                logoutTime: new Date()
            },
            {
                where: {
                    userId: user._id,
                    email: user.email,
                    status: 'active'
                }
            }
        );

        // Create new session with email
        const session = await createSession(user, token);

        res.json({
            success: true,
            message: "User logged in successfully.",
            user: {
                _id: user._id,
                email: user.email,
                userType: user.userType,
                profileStatus: user.profileStatus,
                isActive: user.status,
                token: token,
                authProvider: user.authProvider,
                session: {
                    id: session._id,
                    loginTime: session.loginTime
                }
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(402).json({
            success: false,
            message: 'Error in login'
        });
    }
};

// Google Authentication Response
// exports.googleAuth = async (req, res) => {
//     try {
//         const user = req.user;

//         console.log("Google auth user:", user);
//         if (!user) {
//             return res.status(401).json({ message: "Google authentication failed" });
//         }

//         // Generate JWT Token
//         const token = generateToken(user);

//         console.log("Google auth token:", token);

//         // Save session log
//         await createSession({ user, token });

//         // Redirect user to frontend with token
//         return res.redirect('/ping');
//     } catch (error) {
//         console.error("Google auth error:", error);
//         return res.status(500).json({ message: "Error in Google authentication" });
//     }
// };

// Google Authentication Response
exports.googleAuth = async (req, res) => {
    try {
        const { user, token } = req.user;

        if (!user) {
            return res.status(401).json({ message: "Google authentication failed" });
        }

        // Save session log
        await createSession(user, token);

        // Redirect user to frontend with token
        // return res.redirect(`http://localhost:3000?token=${token}`);
    } catch (error) {
        console.error("Google auth error:", error);
        return res.status(500).json({ message: "Error in Google authentication" });
    }
};

// Logout Route
exports.logOut = async (req, res) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "Bearer token is required in Authorization header"
            });
        }

        // Get the token part after 'Bearer '
        const token = authHeader.split(' ')[1];

        // Find session and update logoutTime
        const session = await sessionLogs.findOne({
            where: {
                jwtToken: token,
                status: "active"
            }
        });

        if (!session) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired session"
            });
        }

        // Update session
        await session.update({
            status: "loggedout",
            logoutTime: new Date()
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};