import nodemailer from "nodemailer";

// Create the transporter using Gmail's SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // App password (not your real password!)
  },
});

export async function sendApplicationRejectionEmail(
  email: string,
  jobTitle: string,
  companyName: string,
  candidate: string,
  recruiter: string
) {
  try {
    const mailOptions = {
      from: `Imisebenzi <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Application rejection at ${companyName}`,
      text: `Dear ${candidate} `,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #c62828;">Application Rejected</h2>

          <p>Thank you for taking the time to apply for the ${jobTitle} position at ${companyName}. We truly appreciate your interest in joining our team and the effort you put into your application.</p>

          <p>After careful consideration, we regret to inform you that you have not been selected to move forward in the recruitment process at this time.</p>

          <p>This decision was not easy due to the high quality of applications we received. Although your profile is strong, we have decided to proceed with candidates whose experience and qualifications more closely match the specific requirements of the role.</p>

          <p>We encourage you to apply for future opportunities with us. Your passion and background are impressive, and we’d be happy to consider you for roles that may align better with your skills.</p>

          <p>We wish you the very best in your career journey and thank you again for your interest in ${jobTitle}.</p>

          <p>Sincerely,<br/>
          <strong>${recruiter}</strong> <br/>
          Recruiting Manager</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully!");
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}

export async function sendApplicationInvitationEmail(
  email: string,
  jobTitle: string,
  companyName: string,
  candidate: string,
  recruiter: string,
  jobId: string
) {
  try {
    const mailOptions = {
      from: `Imisebenzi <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Application invitation at ${companyName}`,
      text: `Dear ${candidate} `,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2 style="color: #2e7d32;">Interview Invitation</h2>

  <p>Thank you for applying for the <strong>${jobTitle}</strong> position 
  <a href=https://imi-jobs.vercel.app/vaccancy/${jobId} style="color: #1a73e8; font-weight: bold;" target="_blank">
       https://imi-jobs.vercel.app/vaccancy/${jobId}
      </a>
 
  at <strong>${companyName}</strong>. After reviewing your application, we are pleased to invite you to the next stage of our recruitment process.</p>

  <p>We were impressed by your qualifications and believe your experience could be a strong match for our team. As the next step, we would like to schedule an interview to learn more about your background and to give you the opportunity to ask us questions as well.</p>

  <p>Please reply to this email with your availability over the next few days so that we can coordinate a suitable time for the interview.</p>

  <p>If you have any questions in the meantime, feel free to reach out.</p
  <p>We look forward to speaking with you soon.</p>

  <p>Sincerely,<br/>
  <strong>${recruiter}</strong><br/>
  Recruiting Manager</p>
</div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully!");
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}

export async function sendJobProposalEmail(
  email: string,
  jobTitle: string,
  companyName: string,
  candidate: string,
  recruiter: string,
  jobId: string
) {
  try {
    const mailOptions = {
      from: `Imisebenzi <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Job Offer Proposal at ${companyName}`,
      text: `Dear ${candidate} `,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2 style="color: #2e7d32;">Job Offer Proposal</h2>

  <p>We are pleased to inform you that after reviewing your application and qualifications, we would like to offer you the opportunity to join <strong>${companyName}</strong> as a <strong>${jobTitle}</strong> .
  You can read more about the job on this link
  <a href=https://imi-jobs.vercel.app/vaccancy/${jobId} style="color: #1a73e8; font-weight: bold;" target="_blank">
       https://imi-jobs.vercel.app/vaccancy/${jobId}
      </a>
  <p>We were impressed by your qualifications and believe your experience could be a strong match for our team. As the next step, we would like to schedule an interview to learn more about your background and to give you the opportunity to ask us questions as well.</p>

  <p>Please reply to this email with your availability over the next few days so that we can coordinate a suitable time for the interview.</p>

  <p>If you have any questions in the meantime, feel free to reach out.</p
  <p>We’re excited about the possibility of working together and look forward to your response.</p>

  <p>Sincerely,<br/>
  <strong>${recruiter}</strong><br/>
  Recruiting Manager</p>
</div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully!");
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}
