const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config();

// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.EMAIL,
//         pass: process.env.PASSWORD,
//     }
// });
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true cho port 465, false cho các port khác
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});
module.exports = transporter