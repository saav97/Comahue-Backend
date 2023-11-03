const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'avisos.virtual.uncoma.edu.ar',
            port: 25,
            secure: false,
            auth: {
                user: 'noreply@virtual.uncoma.edu.ar',
                pass: 'Noreply.2020',
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
    }

    async sendEmail(name, email, asunto, message) {
        const contentHTML = `
          <h1 style="color: red; font-size: 24px;">Información usuario</h1>
          <ul style="list-style-type: none; padding: 0;">
            <li style="margin-bottom: 10px;">Usuario: ${name}</li>
            <li style="margin-bottom: 10px;">Usuario Email: ${email}</li>
          </ul>
          <p style="text-align: center;">${message}</p>
        `;

        try {
            const info = await this.transporter.sendMail({
                from: `${email}`,
                to: 'plataforma@dti.uncoma.edu.ar',
                subject: `${asunto}`,
                html: contentHTML,
            });

            console.log('Message sent', info.messageId);

            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    }
}

module.exports = EmailService;
