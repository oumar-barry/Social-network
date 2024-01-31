const connectDb = require('./config/database');
const dotenv = require('dotenv');
const User = require('./models/User');
dotenv.config({ path: './config/config.env' });
const colors = require('colors');
connectDb();
const deleteData = async () => {
	try {
		await User.deleteMany({});
		console.log(`Data deleted successfully `.bold.red);
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};

console.log(process.argv[2]);

if (process.argv[2] == '-d') {
	deleteData();
}
