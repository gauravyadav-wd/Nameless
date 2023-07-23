const pug = require("pug");
const nodemailer = require("nodemailer");

const email = async (options) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const html = pug.renderFile(`${__dirname}/../views/emailTemplate.pug`, {
    options,
  });
  const mailOptions = {
    from: "Gaurav yadav <gauravyadav.signin@gmail.com>",
    to: options.to,
    subject: options.subject,
    text: options.message,
    html,
  };

  const res = await transport.sendMail(mailOptions);
};

module.exports = email;
