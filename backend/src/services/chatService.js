const ApiError = require('../utils/ApiError');
const conversationRepository = require('../models/conversationRepository');
const messageRepository = require('../models/messageRepository');
const notificationService = require('./notificationService');
const petRepository = require('../models/petRepository');

function serializeMessage(m) {
  return {
    id: m.id,
    conversationId: m.conversation_id,
    senderId: m.sender_id,
    content: m.content,
    createdAt: m.created_at,
    readAt: m.read_at,
  };
}

/**
 * Punto único para enviar un mensaje, usado tanto por el endpoint REST como
 * por el handler de Socket.io, así la notificación y el broadcast nunca se duplican ni se olvidan.
 */
async function sendMessage(io, { conversationId, senderId, content }) {
  const trimmed = (content || '').trim();
  if (!trimmed) throw new ApiError(422, 'El mensaje no puede estar vacío.');
  if (trimmed.length > 2000) throw new ApiError(422, 'El mensaje es demasiado largo.');

  const convo = await conversationRepository.findById(conversationId);
  if (!convo) throw new ApiError(404, 'Conversación no encontrada.');
  if (!conversationRepository.isParticipant(convo, senderId)) {
    throw new ApiError(403, 'No participás de esta conversación.');
  }

  const recipientId = Number(convo.user_a_id) === Number(senderId) ? convo.user_b_id : convo.user_a_id;

  const messageId = await messageRepository.create({ conversation_id: convo.id, sender_id: senderId, content: trimmed });
  await conversationRepository.touchLastMessage(convo.id);
  await conversationRepository.reviveForRecipient(convo.id, recipientId);

  const message = await messageRepository.findById(messageId);
  const pet = await petRepository.findById(convo.pet_id);

  const notifType = pet && Number(pet.owner_id) === Number(recipientId) ? 'new_message_on_your_pet' : 'reply_to_inquiry';
  await notificationService.create(io, {
    user_id: recipientId,
    type: notifType,
    payload: { conversationId: convo.id, petId: convo.pet_id, petName: pet ? pet.name : null, senderId: Number(senderId) },
  });

  const payload = { conversationId: convo.id, message: serializeMessage(message) };
  if (io) {
    io.to(`user:${recipientId}`).emit('message:new', payload);
    io.to(`user:${senderId}`).emit('message:new', payload);
  }

  return message;
}

/**
 * Crea (o recupera) la conversación entre el usuario y el dueño de la mascota,
 * y opcionalmente manda el primer mensaje. Así se cumple la regla de que el
 * chat nace la primera vez que alguien escribe por esa mascota puntual.
 */
async function startConversation(io, { petId, userId, content }) {
  const pet = await petRepository.findById(petId);
  if (!pet) throw new ApiError(404, 'Publicación no encontrada.');
  if (Number(pet.owner_id) === Number(userId)) {
    throw new ApiError(400, 'No podés iniciar un chat sobre tu propia publicación.');
  }

  const convo = await conversationRepository.findOrCreate(pet.id, userId, pet.owner_id);
  await conversationRepository.reviveForUser(convo.id, userId);

  let message = null;
  if (content) {
    message = await sendMessage(io, { conversationId: convo.id, senderId: userId, content });
  }

  return { conversation: convo, message };
}

module.exports = { sendMessage, startConversation, serializeMessage };
