var nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "bacnxph44315@fpt.edu.vn",
        pass: "bacnxph44315"
    }
});
module.exports = transporter 