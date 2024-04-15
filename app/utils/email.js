import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: process.env.EMAILSERVICE,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSEMAIL
    }
});

const sendEmail = async (user, subject, htmlTemplate) => {
    const email = user.username;
    try {
        let mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: subject,
            html: ''
        };
        switch (htmlTemplate.name) {
            case 'recoveryPassTemplate':
                mailOptions.html = htmlTemplate(user.username, user.recoveryCode, user.language);
                break;
            case 'confirmationTemplate':
                mailOptions.html = htmlTemplate(user.username, user.confirmationCode, user.language);
                break;
            default:
                //
                break;
        }
        await transporter.sendMail(mailOptions);
        return { data: mailOptions, message: "Email sent successfully" };
    } catch (err) {
        return { data: false, message: err.message };
    }
};

export default sendEmail;