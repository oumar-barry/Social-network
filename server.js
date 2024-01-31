const express = require('express');
const app = express();
const dotenv = require('dotenv');
const colors = require('colors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('./middleware/error');
dotenv.config({ path: 'config/config.env' });
const connectDb = require('./config/database');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/user', require('./routes/userRoute'));

if (process.env.NODE_ENV == 'development') {
	app.use(morgan('dev'));
	app.use(errorHandler);
}

process.on('unhandledRejection', (err, promise) => {
	console.log(`Error: ${err.message}`.red.bold);
});

connectDb();
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
	console.log(`server up and running on port ${PORT}`.bold);
});
