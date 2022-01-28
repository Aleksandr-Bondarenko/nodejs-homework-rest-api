const sgMail = require("@sendgrid/mail");

require("dotenv").config();
const { SEND_GRID_API_KEY, FROM_EMAIL } = process.env;
sgMail.setApiKey(SEND_GRID_API_KEY);

const sendEmail = async (data) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const email = { ...data, from: FROM_EMAIL };
    await sgMail.send(email);
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  sendEmail,
};
