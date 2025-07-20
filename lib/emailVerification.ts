import nodemailer from "nodemailer";

// Create the transporter using Gmail's SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,      // Your Gmail address
    pass: process.env.EMAIL_PASS,      // App password (not your real password!)
  },
});

// Function to send a verification email
export async function sendVerificationEmail(email:string , code:string) {
  try {

    const mailOptions = {
      from: `Imisebenzi <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email",
      text: `Your verification code is: ${code}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Welcome to Imisebenzi!</h2>
          <p>Your verification code is:</p>
          <h3 style="color: #2e6c80;">${code}</h3>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}