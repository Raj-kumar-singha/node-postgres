const express = require("express"),
    router = express.Router(),
    v1AuthRoutes = require('./v1/authRoutes');

router.use("/auth", v1AuthRoutes);

module.exports = router;
