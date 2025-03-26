const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversation.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Bảo vệ tất cả routes
router.use(verifyToken);

// Chat routes
router.get('/', conversationController.getConversations.bind(conversationController));
router.get('/:conversationId/messages', conversationController.getMessages.bind(conversationController));
router.post('/message', conversationController.sendMessage.bind(conversationController));
router.post('/message/image', upload.single('image'), conversationController.uploadMessageImage.bind(conversationController));
router.post('/:conversationId/read', conversationController.markAsRead.bind(conversationController));
router.get('/direct/:instructorId', conversationController.getDirectChat.bind(conversationController));

// Group chat access
router.get('/group-access/:courseId', conversationController.checkGroupAccess.bind(conversationController));
router.post('/join-group', conversationController.joinGroupChat.bind(conversationController));

module.exports = router; 