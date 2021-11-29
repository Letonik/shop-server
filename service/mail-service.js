const nodemailer = require('nodemailer');

class MailService {

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            },
            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: false
            }
        })
    }

    async sendActivationMail(to, link) {
        await this.transporter.sendMail({
            from: process.env.MAIL_USER,
            to,
            subject: 'Активация аккаунта на ' + process.env.CLIENT_URL,
            text: '',
            html: `<div>
                       <h1>Для активации перейдите по ссылке</h1>
                       <a href="${link}">${link}</a>
                   </div>`

        })
    }
    async sendNewOrder(to, name, phone, address) {
        await this.transporter.sendMail({
            from: process.env.MAIL_USER,
            to,
            subject: 'Новый заказ!',
            text: '',
            html: `<div>
                       <h2>${name}</h2>
                       <h2>${phone}</h2>
                       <h3>${address}</h3>
                   </div>`

        })
    }
}

module.exports = new MailService();