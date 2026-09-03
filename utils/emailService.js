const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('📧 Email not configured. Skipping email to:', to);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"CampusBook" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log('📧 Email sent to:', to);
  } catch (error) {
    console.error('📧 Email failed:', error.message);
  }
};

const sendBookingApproved = async (userEmail, userName, roomName, date, time, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 20px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">✅ Booking Approved!</h1>
      </div>
      <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
        <p>Hi <strong>${userName}</strong>,</p>
        <p>Your booking has been <strong style="color: #10b981;">approved</strong>!</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; color: #64748b;">Room:</td><td style="padding: 8px; font-weight: 600;">${roomName}</td></tr>
          <tr><td style="padding: 8px; color: #64748b;">Date:</td><td style="padding: 8px; font-weight: 600;">${date}</td></tr>
          <tr><td style="padding: 8px; color: #64748b;">Time:</td><td style="padding: 8px; font-weight: 600;">${time}</td></tr>
        </table>
        <div style="margin: 20px 0; padding: 15px; background: #e0e7ff; border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: #4338ca; font-size: 14px;">Your Check-In OTP:</p>
          <h2 style="margin: 5px 0 0 0; color: #3730a3; letter-spacing: 5px;">${otp}</h2>
        </div>
        <p style="color: #64748b;">— CampusBook Team</p>
      </div>
    </div>
  `;
  await sendEmail(userEmail, '✅ Booking Approved - CampusBook', html);
};

const sendBookingRejected = async (userEmail, userName, roomName, date, time) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ef4444, #f87171); padding: 20px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">❌ Booking Rejected</h1>
      </div>
      <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
        <p>Hi <strong>${userName}</strong>,</p>
        <p>Unfortunately, your booking has been <strong style="color: #ef4444;">rejected</strong>.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; color: #64748b;">Room:</td><td style="padding: 8px; font-weight: 600;">${roomName}</td></tr>
          <tr><td style="padding: 8px; color: #64748b;">Date:</td><td style="padding: 8px; font-weight: 600;">${date}</td></tr>
          <tr><td style="padding: 8px; color: #64748b;">Time:</td><td style="padding: 8px; font-weight: 600;">${time}</td></tr>
        </table>
        <p>Please try booking a different room or time slot.</p>
        <p style="color: #64748b;">— CampusBook Team</p>
      </div>
    </div>
  `;
  await sendEmail(userEmail, '❌ Booking Rejected - CampusBook', html);
};

module.exports = { sendBookingApproved, sendBookingRejected };
