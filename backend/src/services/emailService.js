const { Resend } = require('resend');
const env = require('../config/env');
const logger = require('../utils/logger');

const resend = env.email.resendApiKey ? new Resend(env.email.resendApiKey) : null;

async function sendEmail(to, subject, html) {
  if (!resend) {
    if (env.nodeEnv === 'production') {
      throw new Error('RESEND_API_KEY no está configurado, no se puede enviar email en producción.');
    }
    logger.warn(`[EMAIL SIMULADO - falta RESEND_API_KEY] Para: ${to} | Asunto: ${subject}\n${html}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: env.email.from,
    to,
    subject,
    html,
  });

  if (error) {
    logger.error('Error enviando email con Resend:', error);
    throw new Error('No se pudo enviar el email.');
  }
}

function sendVerificationCodeEmail(to, firstName, code) {
  return sendEmail(
    to,
    'Verificá tu cuenta de PataHogar',
    `<p>Hola ${firstName},</p>
     <p>Tu código de verificación es:</p>
     <h2 style="letter-spacing:4px;">${code}</h2>
     <p>Este código vence en ${env.verificationCodeExpiresMin} minutos. Si no fuiste vos, ignorá este email.</p>`
  );
}

function sendPasswordResetEmail(to, firstName, code) {
  return sendEmail(
    to,
    'Recuperá tu contraseña de PataHogar',
    `<p>Hola ${firstName},</p>
     <p>Usá este código para definir una nueva contraseña:</p>
     <h2 style="letter-spacing:4px;">${code}</h2>
     <p>Este código vence en ${env.verificationCodeExpiresMin} minutos. Si no fuiste vos, ignorá este email.</p>`
  );
}

module.exports = { sendEmail, sendVerificationCodeEmail, sendPasswordResetEmail };
