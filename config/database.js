const mongoose = require('mongoose');
const connectDb = async () => {
	try {
		const con = await mongoose.connect(process.env.DB_STRING);
		console.log(`Sucessfully connected to database `.bold);
	} catch (err) {
		console.error(`${err}`.red.bold);
		process.exit(1);
	}
};

module.exports = connectDb;
