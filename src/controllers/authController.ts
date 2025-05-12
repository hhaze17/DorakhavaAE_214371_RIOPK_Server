import { Request, Response } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../types';

// Генерация JWT токена
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d'
  });
};

// Регистрация пользователя
export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, firstName, lastName, email, phone, levelOfAccess } = req.body;

    // Проверка существования пользователя
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    // Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Создание пользователя
    const user = await User.create({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      email,
      phone,
      levelOfAccess,
      isActive: true
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        levelOfAccess: user.levelOfAccess,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Неверные данные пользователя' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Вход в систему
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Поиск пользователя
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    // Проверка пароля
    if (!user.password) {
      return res.status(401).json({ message: 'Учетная запись без пароля' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    // Проверка активности пользователя
    if (!user.isActive) {
      return res.status(401).json({ message: 'Пользователь деактивирован' });
    }

    // Обновление времени последнего входа
    user.lastLogin = new Date();
    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      levelOfAccess: user.levelOfAccess,
      token: generateToken(user._id)
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Получение профиля пользователя
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Обновление профиля пользователя
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      levelOfAccess: updatedUser.levelOfAccess,
      token: generateToken(updatedUser._id)
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Смена пароля
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Требуется текущий и новый пароль' });
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Проверка текущего пароля
    if (!user.password) {
      return res.status(400).json({ message: 'Учетная запись без пароля' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверный текущий пароль' });
    }

    // Хеширование нового пароля
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Пароль успешно изменен' });
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
}; 