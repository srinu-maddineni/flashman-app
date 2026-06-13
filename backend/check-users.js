import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import usermodel from './model/usermodel.js';

async function run() {
    try {
        await mongoose.connect(`${process.env.MONGODB}/srinu`);
        console.log("Connected to DB.");
        const users = await usermodel.find({}).sort({ _id: -1 }).limit(5);
        console.log("Last 5 users registered:");
        users.forEach(u => {
            console.log(`- ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Verified: ${u.isverified}, verifyotp: "${u.verifyotp}"`);
        });
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

run();
