import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.SENHAEMAIL
    }
});

export const sendConfirmationEmail = async (user) => {
    const email = user.username;
    try {
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Confirmação de E-mail',
            html: `<p>Por favor, digite o código:  <b> ${user.confirmationCode} </b> para confirmar seu e-mail!</p>`
        };

        await transporter.sendMail(mailOptions);
        return {data: mailOptions, message: "Confirmation email sent"};
    } catch (err) {
        return {data: false, message: err.message};
    }
};
