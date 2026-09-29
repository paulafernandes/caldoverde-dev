import nodemailer from "nodemailer";

let transporter;

function getSmtpConfig() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASSWORD,
    SMTP_FROM,
  } = process.env;

  if (
    !SMTP_HOST ||
    !SMTP_PORT ||
    !SMTP_USER ||
    !SMTP_PASSWORD ||
    !SMTP_FROM
  ) {
    throw new Error("A configuração SMTP está incompleta.");
  }

  return {
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
    from: SMTP_FROM,
  };
}

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const config = getSmtpConfig();

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  return transporter;
}

export async function sendEmail({ to, subject, text, html }) {
  const config = getSmtpConfig();
  const mailTransporter = getTransporter();

  return mailTransporter.sendMail({
    from: config.from,
    to,
    subject,
    text,
    html,
  });
}
