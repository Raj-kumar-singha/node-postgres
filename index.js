
const express = require('express'),
    app = express(),
    cors = require('cors'),
    helmet = require('helmet'),
    obj = require('./models'),
    allRoutes = require('./routes/index.js'),
    passport = require('passport'),
    { port } = require('./config/envConfig');


app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(passport.initialize());

app.use("/api/v1", allRoutes)

app.get('/ping', (req, res) => {
    return res.status(200).json({ message: 'pong' });
});



app.use((req, res, next) => {
    res.status(404).json({
        error: 'Bad Request',
    });
    next();
});

obj.sequelize
    .sync()
    .then(() => {
        console.log('Synced db.');
    })
    .catch((err) => {
        console.log('Failed to sync db: ' + err.message);
    });

app.listen(port || 8080, () => {
    console.log(`Server is running on http://localhost:${port}`);
});