const EmailService = require('../services/email.service');

class EmailController {
    constructor() {
        this.emailService = new EmailService();
        this.sendEmail = this.sendEmail.bind(this);
    }

    async sendEmail(req, res) {
        try {
            const { name, email, asunto, message } = req.body;

            const emailSent = await this.emailService.sendEmail(name, email, asunto, message);

            if (emailSent) {
                return res.status(200).json({
                    ok: true,
                    msg: 'Mensaje enviado con éxito'
                })
            } else {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error al enviar el mensaje',
                });
            }

        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({
                ok: false,
                msg: 'Error al enviar el mensaje',
            });
        }
    }
}

module.exports = {EmailController};