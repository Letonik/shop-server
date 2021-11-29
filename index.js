require('dotenv').config();
const express = require('express');
const sequelize = require("./db");
const models = require('./models/models');
const cors = require("cors");
const cookieParser = require('cookie-parser');
const fileUpload = require("express-fileupload");
const router = require('./routes/routes');
const errorHandler = require('./middleware/ErrorHandlingMiddleware');
const path = require('path');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    exposedHeaders: ["set-cookie"],
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(fileUpload({}));
app.use('/api', router);

//Обработка ошибок
app.use(errorHandler);

app.get('*', (req, res) =>{
    res.sendfile(path.resolve(__dirname + "./static/index.html"));
});

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(PORT, () => {
            console.log(`node express work on ${PORT}`);
        });
    } catch (e) {
        console.log(e)
    }
}

start()
