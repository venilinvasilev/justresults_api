const nodemailer = require('nodemailer');

const sendEmail = async options => {
    //1) Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
        //Activate in gmail "less secure app option"
        // host: process.env.EMAIL_HOST,
        // port: process.env.EMAIL_PORT,
        // auth: {
        //     user: process.env.EMAIL_USERNAME,
        //     pass: process.env.EMAIL_PASSWORD
        // }
    });
     //2) Define email options
    const mailOptions = {
        from: 'Venilin Vasilev <justresults.bg@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
        //html
    }
    //3) Send email
    await transporter.sendMail(mailOptions)
}
module.exports = sendEmail;