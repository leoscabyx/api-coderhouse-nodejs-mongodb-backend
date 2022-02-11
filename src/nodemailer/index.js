import nodemailer from 'nodemailer'

import config from '../config.js'

function createSendMail(mailConfig) {

  const transporter = nodemailer.createTransport(mailConfig);

  return function sendMail({ to, subject, text, html, attachments }) {
    const mailOptions = { from: mailConfig.auth.user, to, subject, text, html, attachments };
    return transporter.sendMail(mailOptions)
  }
}

function createSendMailGoogle() {
  return createSendMail({
    service: 'gmail',
    auth: {
      user: config.MAIL_ADMIN,
      pass: 'gnoykdpbilptssrx'
    }
  })
}

// const sendMail = createSendMailEthereal()
const sendMail = createSendMailGoogle()

export default sendMail;