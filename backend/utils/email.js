const nodemailer = require('nodemailer');

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send email notification for interview scheduling
 * @param {Object} candidate - Candidate object
 * @param {Object} job - Job object
 * @param {Object} interview - Interview object
 * @param {boolean} isRescheduled - Whether the interview was rescheduled
 * @returns {Promise} - Email send result
 */
const sendInterviewNotification = async (candidate, job, interview, isRescheduled = false) => {
  const scheduledDate = new Date(interview.scheduledDate);
  const formattedDate = scheduledDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedTime = scheduledDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const subject = isRescheduled
    ? `RESCHEDULED: Interview for ${job.title} at ${job.company}`
    : `Interview Scheduled: ${job.title} at ${job.company}`;
  
  const candidateHtml = `
    <h2>${isRescheduled ? 'Your interview has been rescheduled' : 'Interview Scheduled'}</h2>
    <p>Hello ${candidate.name},</p>
    <p>We are pleased to inform you that an interview has been ${isRescheduled ? 'rescheduled' : 'scheduled'} for the position of <strong>${job.title}</strong> at <strong>${job.company}</strong>.</p>
    
    <h3>Interview Details:</h3>
    <ul>
      <li><strong>Date:</strong> ${formattedDate}</li>
      <li><strong>Time:</strong> ${formattedTime}</li>
      <li><strong>Duration:</strong> ${interview.duration} minutes</li>
      <li><strong>Location:</strong> ${interview.location}</li>
      ${interview.meetingLink ? `<li><strong>Meeting Link:</strong> <a href="${interview.meetingLink}">${interview.meetingLink}</a></li>` : ''}
    </ul>
    
    <h3>Job Description Summary:</h3>
    <p>${job.summary || 'No summary available.'}</p>
    
    <p>Please be prepared to discuss your qualifications and experience related to this position. If you need to reschedule or have any questions, please contact us as soon as possible.</p>
    
    <p>Best regards,<br>Recruitment Team<br>${job.company}</p>
  `;
  
  const hrHtml = `
    <h2>Interview ${isRescheduled ? 'Rescheduled' : 'Scheduled'}</h2>
    <p>An interview has been ${isRescheduled ? 'rescheduled' : 'scheduled'} for the following candidate:</p>
    
    <h3>Candidate Information:</h3>
    <ul>
      <li><strong>Name:</strong> ${candidate.name}</li>
      <li><strong>Email:</strong> ${candidate.email}</li>
      <li><strong>Phone:</strong> ${candidate.phone || 'Not provided'}</li>
    </ul>
    
    <h3>Interview Details:</h3>
    <ul>
      <li><strong>Position:</strong> ${job.title}</li>
      <li><strong>Date:</strong> ${formattedDate}</li>
      <li><strong>Time:</strong> ${formattedTime}</li>
      <li><strong>Duration:</strong> ${interview.duration} minutes</li>
      <li><strong>Location:</strong> ${interview.location}</li>
      ${interview.meetingLink ? `<li><strong>Meeting Link:</strong> <a href="${interview.meetingLink}">${interview.meetingLink}</a></li>` : ''}
    </ul>
    
    <h3>Candidate Summary:</h3>
    <p>${candidate.summary || 'No summary available.'}</p>
    
    <p>Please ensure all necessary preparations are made for the interview.</p>
  `;
  
  // Send email to candidate
  await transporter.sendMail({
    from: `"${job.company} Recruitment" <${process.env.EMAIL_FROM}>`,
    to: candidate.email,
    subject,
    html: candidateHtml
  });
  
  // Send email to HR
  await transporter.sendMail({
    from: `"Recruitment System" <${process.env.EMAIL_FROM}>`,
    to: process.env.EMAIL_USER,
    subject: `HR Notification: ${subject}`,
    html: hrHtml
  });
  
  return true;
};

module.exports = {
  sendInterviewNotification
};
