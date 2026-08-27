const ApiError = require('../utils/ApiError');
const db = require('../db/knex');
const conversationRepository = require('../models/conversationRepository');
const messageRepository = require('../models/messageRepository');
const notificationRepository = require('../models/notificationRepository');
const chatService = require('../services/chatService');

async function start(req, res) {
  const io = req.app.get('io');
  const { conversation, message } = await chatService.startConversation(io, {
    petId: req.body.petId,
    userId: req.user.id,
    content: req.body.content,
  });
  res.status(201).json({ conversationId: conversation.id, message: message ? chatService.serializeMessage(message) : null });
}

async function list(req, res) {
  const userId = req.user.id;
  const rows = await conversationRepository.listForUser(userId);
  const convoIds = rows.map((r) => r.id);

  const [unreadRows, lastMessages] = await Promise.all([
    messageRepository.unreadCountsForConversations(convoIds, userId),
    messageRepository.lastMessageForConversations(convoIds),
  ]);
  const unreadMap = Object.fromEntries(unreadRows.map((r) => [r.conversation_id, Number(r.count)]));
  const lastMsgMap = Object.fromEntries(lastMessages.map((m) => [m.conversation_id, m]));

  const counterpartIds = [...new Set(rows.map((r) => (Number(r.user_a_id) === Number(userId) ? r.user_b_id : r.user_a_id)))];
  const counterparts = counterpartIds.length
    ? await db('users').whereIn('id', counterpartIds).select('id', 'first_name', 'last_name', 'profile_photo_url')
    : [];
  const counterpartMap = Object.fromEntries(counterparts.map((u) => [u.id, u]));

  const grouped = {};
  for (const row of rows) {
    const counterpartId = Number(row.user_a_id) === Number(userId) ? row.user_b_id : row.user_a_id;
    if (!grouped[counterpartId]) {
      const u = counterpartMap[counterpartId] || {};
      grouped[counterpartId] = {
        counterpart: { id: counterpartId, firstName: u.first_name, lastName: u.last_name, profilePhotoUrl: u.profile_photo_url },
        chats: [],
      };
    }
    const lastMsg = lastMsgMap[row.id];
    const isSideA = conversationRepository.sideOf(row, userId) === 'a';
    grouped[counterpartId].chats.push({
      conversationId: row.id,
      petId: row.pet_id,
      petName: row.pet_name,
      petStatus: row.pet_status,
      archived: isSideA ? Boolean(row.archived_by_a) : Boolean(row.archived_by_b),
      lastMessageAt: row.last_message_at,
      lastMessagePreview: lastMsg ? lastMsg.content.slice(0, 120) : null,
      unreadCount: unreadMap[row.id] || 0,
    });
  }

  res.json({ conversations: Object.values(grouped) });
}

async function getMessages(req, res) {
  const convo = await conversationRepository.findById(req.params.id);
  if (!convo) throw new ApiError(404, 'Conversación no encontrada.');
  if (!conversationRepository.isParticipant(convo, req.user.id)) throw new ApiError(403, 'No participás de esta conversación.');

  const beforeId = req.query.beforeId ? parseInt(req.query.beforeId, 10) : undefined;
  const messages = await messageRepository.findByConversation(convo.id, { beforeId, limit: 30 });

  if (!beforeId) {
    await messageRepository.markAllRead(convo.id, req.user.id);
    await notificationRepository.markReadByConversation(req.user.id, convo.id);
  }

  res.json({ messages: messages.reverse().map(chatService.serializeMessage) });
}

async function sendMessage(req, res) {
  const convo = await conversationRepository.findById(req.params.id);
  if (!convo) throw new ApiError(404, 'Conversación no encontrada.');

  const io = req.app.get('io');
  const message = await chatService.sendMessage(io, {
    conversationId: convo.id,
    senderId: req.user.id,
    content: req.body.content,
  });
  res.status(201).json({ message: chatService.serializeMessage(message) });
}

async function setArchived(req, res) {
  const convo = await conversationRepository.findById(req.params.id);
  if (!convo) throw new ApiError(404, 'Conversación no encontrada.');
  if (!conversationRepository.isParticipant(convo, req.user.id)) throw new ApiError(403, 'No participás de esta conversación.');

  await conversationRepository.setArchived(convo.id, req.user.id, Boolean(req.body.archived));
  res.json({ message: 'Listo.' });
}

async function remove(req, res) {
  const convo = await conversationRepository.findById(req.params.id);
  if (!convo) throw new ApiError(404, 'Conversación no encontrada.');
  if (!conversationRepository.isParticipant(convo, req.user.id)) throw new ApiError(403, 'No participás de esta conversación.');

  await conversationRepository.setDeleted(convo.id, req.user.id);
  res.json({ message: 'Conversación eliminada de tu lista.' });
}

module.exports = { start, list, getMessages, sendMessage, setArchived, remove };
