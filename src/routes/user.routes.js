const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { verifyToken, restrictTo } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const { updateUserSchema, changePasswordSchema, setRoleSchema } = require('../validators/user.validator');
const upload = require('../middleware/upload.middleware');

// Protected routes
router.use(verifyToken);

// User routes
router.get('/info', UserController.getUserInfo);
router.get('/profile', UserController.getProfile);
router.put('/profile', validateRequest(updateUserSchema), UserController.updateProfile);
router.put('/change-password', validateRequest(changePasswordSchema), UserController.changePassword);

// Upload avatar
router.post('/avatar', upload.single('avatar'), UserController.uploadAvatar);

// Admin only routes
router.use(restrictTo('admin', 'super_admin'));
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id', validateRequest(updateUserSchema), UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

// Role management
router.post('/set-role', validateRequest(setRoleSchema), UserController.setUserRole);

module.exports = router; 