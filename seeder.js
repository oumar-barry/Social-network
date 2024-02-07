const connectDb = require('./config/database');
const dotenv = require('dotenv');
const User = require('./models/User');
const { faker } = require('@faker-js/faker');
dotenv.config({ path: './config/config.env' });
const colors = require('colors');
const Chat = require('./models/Chat');
const Message = require('./models/Message');
connectDb();
const deleteData = async () => {
	try {
		await Chat.deleteMany({});
		await Message.deleteMany({});
		console.log(`Data deleted successfully `.bold.red);
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};

const fakeUsers = async () => {
	try {
		for (i = 1; i <= 20; i++) {
			let data = {
				firstname: faker.person.firstName(),
				lastname: faker.person.lastName(),
				username: `${faker.person.firstName()}${faker.person.lastName()}}`,
				password: '12345',
			};

			data.email = `${data.firstname}@${faker.internet.email().split('@')[1]}`;
			let user = new User(data);
			await user.save();
		}

		console.log(`Fake users inserted successfully`.bold);
		process.exit(1);
	} catch (err) {
		console.error(`${err}`.red.bold);
	}
};

if (process.argv[2] == '-d') {
	deleteData();
} else if (process.argv[2] == '-f') {
	fakeUsers();
}
