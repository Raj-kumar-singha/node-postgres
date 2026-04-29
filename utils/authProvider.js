const { jwtSecret, jwtExpiry } = require("../config/envConfig"),
    jwt = require("jsonwebtoken"),
    { sessionLogs } = require("../models");

exports.generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            userType: user.userType,
            authProvider: user.authProvider
        },
        jwtSecret,
        { expiresIn: jwtExpiry }

    );
};

exports.createSession = async (user, token) => {
    return await sessionLogs.create({
        userId: user._id,
        email: user.email,
        jwtToken: token,
        loginTime: new Date(),
        status: 'active'
    });
};