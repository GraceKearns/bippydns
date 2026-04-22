const nodemailer = require('nodemailer')

const CLIENT_EMAIL = process.env.CLIENT_EMAIL
const CLIENT_SECRET = process.env.CLIENT_SECRET
console.log(CLIENT_EMAIL)
console.log(CLIENT_SECRET)
const transporter = nodemailer.createTransport({
  service: "gmail", // or better: SMTP provider
  auth: {
    user: CLIENT_EMAIL,
    pass: CLIENT_SECRET
  }
});
module.exports = transporter

