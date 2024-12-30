import express from "express";
import { createTransporter } from "../config/email.js";

const router = express.Router();

// Function to generate an email template
const generateEmailTemplate = (firstName, invitationLink) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>Welcome to Buzz Filling, ${firstName}!</h2>
      <p>
        We're thrilled to have you on board. Please click the link below to get started:
      </p>
      <a 
        href="${invitationLink}" 
        style="display: inline-block; padding: 10px 15px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">
        Accept Invitation
      </a>
      <p>
        If you have any questions, feel free to reach out to us at support@buzzfilling.com.
      </p>
      <p>Best regards,<br>The Buzz Filling Team</p>
    </div>
  `;
};

router.post("/send-invitation", async (req, res) => {
  const { email, firstName, invitationLink } = req.body;

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: "hello@umersaleem.com", // Update to your email
      to: email,
      subject: "You're Invited to Buzz Filling!",
      html: generateEmailTemplate(firstName, invitationLink),
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Invitation email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send email", error });
  }
});

export default router;
