require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require("fs")
const path = require("path");

const contacto = async (req, res) => {
    let params = req.body;
    try {
        if (!params.nombre ||!params.apellido || !params.telefono || !params.email || !params.mensaje) {
            return res.status(400).json({
                status: "error",
                message: "faltan datos por enviar"
            })
        }
        

        // Envío del correo con la nueva contraseña al usuario
        await enviarCorreoContacto(params.email, params.apellido, params.telefono, params.mensaje, params.nombre);

        return res.status(200).json({
            status: 'success',
            message: 'Se ha enviado un correo de contacto'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al enviar correo',
            error: error.message
        });
    }
};

// Función para enviar correo de recuperación utilizando servidor SMTP
async function enviarCorreoContacto(email, apellido,telefono,mensaje,nombre) {
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;

    const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 587,
        secure: false,
        auth: {
            user: emailUser, // Cambia con tu dirección de correo de tu servidor 
            pass: emailPassword // Cambia con tu contraseña
        }
    });

    const emailTemplatePath = path.join('uploads', 'html', 'contacto.html');
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

    const mailOptions = {
        from: emailUser, // Cambia con tu dirección de correo de tu servidor
        cc:emailUser,
        to: email,
        subject: 'Solicitud de contacto',
        html: emailTemplate.replace('{{nombre}}', nombre).replace('{{apellido}}', apellido).replace('{{telefono}}', telefono).replace('{{mensaje}}', mensaje)

    };


    await transporter.sendMail(mailOptions);
}

module.exports = {
    contacto
};
