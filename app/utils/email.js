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
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: subject,
            html: htmlTemplate(user.username, user.confirmationCode, user.language)
        };

        //await transporter.sendMail(mailOptions);
        return { data: mailOptions, message: "Email sent successfully" };
    } catch (err) {
        return { data: false, message: err.message };
    }
};

export default sendEmail;