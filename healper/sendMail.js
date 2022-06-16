const nodemailer = require("nodemailer");

async function sendMail({ subject, mailBody, toMail, attachments }) {
    try {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: process.env.NODEMAILER_MAIL_ID,
                pass: process.env.NODEMAILER_MAIL_PASS
            },
        });
        let obj = {
            from: `"Chandru"`, // sender address
            to: toMail, // list of receivers
            subject: subject, // Subject line
            html: mailBody, // html body
            attachments: attachments
        };
        let info = await transporter.sendMail(obj);
        return info;
    } catch (error) {
        console.log(error);
        return;
    }
}

module.exports = { sendMail };