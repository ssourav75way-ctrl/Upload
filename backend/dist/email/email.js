import nodemailer from "nodemailer";
import "dotenv/config";
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
    },
});
export async function sendEmail(to, subject, html) {
    try {
        const info = await transporter.sendMail({
            from: `"USER-AUTH" <${process.env.EMAIL_ADDRESS}>`,
            to,
            subject,
            html,
        });
        console.log("Email sent:", info.messageId);
    }
    catch (err) {
        console.error("Error sending email:", err);
    }
}
//# sourceMappingURL=email.js.map