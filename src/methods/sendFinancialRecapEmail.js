import emailjs from '@emailjs/browser';
import emailjsConfig from '../config/emailjs.config';


const sendFinancialRecapEmail = (client) => {
  try {
    const appointmentTableHtml = buildAppointmentTable(client.appointments);

    const formData = {
      userMail: client.mailAddress,
      firstName: client.firstName,
      lastName: client.lastName,
      totalOwed: client.totalOwed,
      appointmentTableHtml
    };

    emailjs.send(
      emailjsConfig.serviceID,
      emailjsConfig.financialRecapTemplate,
      formData,
      emailjsConfig.publicApiKey
    );

  } catch (e) {
    console.error('Error sending email:', e);
    throw e;
  }
};

const buildAppointmentTable = (appointments) => {
  return `
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr style="background-color: #343a40; color: white;">
          <th style="padding: 10px; text-align: left;">Service</th>
          <th style="padding: 10px; text-align: left;">Date</th>
          <th style="padding: 10px; text-align: left;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${appointments.map(app => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${app.serviceName}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${new Date(app.dateFrom).toLocaleString()}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">$${app.amount}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
};


export default sendFinancialRecapEmail;
