import express from 'express';
import { register, login, getProfile, updateProfile, changePassword } from '../controllers/authController';
 

const router = express.Router();

// Публичные маршруты
router.post('/register', register);
router.post('/login', login);

// Защищенные маршруты
router.get('/profile',   getProfile);
router.put('/profile',   updateProfile);
router.put('/change-password',   changePassword);

export default router; 