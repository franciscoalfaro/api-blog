require('dotenv').config();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const fs = require("fs")
const path = require("path");


const recuperarContrasena = async (req, res) => {
    const { email } = req.body;
    try {
        // Buscar el usuario por su correo electrónico
        const usuario = await User.findOne({ email });

        if (!usuario) {
            return res.status(404).json({
                status: 'error',
                message: 'El correo electrónico no está registrado'
            });
        }

        // Generar una nueva contraseña temporal
        const nuevaContrasena = generarNuevaContrasena();
        const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

        // Actualizar la contraseña hasheada en la base de datos
        usuario.password = hashedPassword;
        await usuario.save();

        // Envío del correo con la nueva contraseña al usuario
        await enviarCorreoRecuperacion(email, nuevaContrasena);

        return res.status(200).json({
            status: 'success',
            message: 'Se ha enviado una nueva contraseña al correo electrónico registrado'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al recuperar la contraseña',
            error: error.message
        });
    }
};

// Función para generar una nueva contraseña aleatoria
function generarNuevaContrasena() {
    const longitud = 10;
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let nuevaContrasena = '';

    for (let i = 0; i < longitud; i++) {
        nuevaContrasena += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }

    return nuevaContrasena;
}

// Función para enviar correo de recuperación utilizando servidor SMTP
async function enviarCorreoRecuperacion(email, nuevaContrasena) {
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

    const emailTemplatePath = path.join('uploads', 'html', 'reset-password.html');
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf8');

    const mailOptions = {
        from: emailUser, // Cambia con tu dirección de correo de tu servidor
        to: email,
        subject: 'Recuperación de Contraseña',
        html: emailTemplate.replace('${nuevaContrasena}', nuevaContrasena)
    };


    await transporter.sendMail(mailOptions);
}

module.exports = {
    recuperarContrasena
};

