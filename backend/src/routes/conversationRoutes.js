const { Router } = require('express');
const conversationController = require('../controllers/conversationController');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const {
  startConversationValidator,
  sendMessageValidator,
  conversationIdParamValidator,
  archiveValidator,
} = require('../validators/conversationValidators');

const router = Router();

router.use(requireAuth);

router.get('/', conversationController.list);
router.post('/', startConversationValidator, validate, conversationController.start);

router.get('/:id/messages', conversationIdParamValidator, validate, conversationController.getMessages);
router.post('/:id/messages', conversationIdParamValidator, sendMessageValidator, validate, conversationController.sendMessage);

router.patch('/:id/archive', conversationIdParamValidator, archiveValidator, validate, conversationController.setArchived);
router.delete('/:id', conversationIdParamValidator, validate, conversationController.remove);

module.exports = router;
