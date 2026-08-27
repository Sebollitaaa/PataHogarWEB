const { body, param } = require('express-validator');

const startConversationValidator = [
  body('petId').isInt({ min: 1 }).withMessage('Publicación inválida.'),
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Escribí un mensaje.'),
];

const sendMessageValidator = [
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Escribí un mensaje.'),
];

const conversationIdParamValidator = [param('id').isInt({ min: 1 })];

const archiveValidator = [body('archived').isBoolean().withMessage('Valor inválido.')];

module.exports = { startConversationValidator, sendMessageValidator, conversationIdParamValidator, archiveValidator };
