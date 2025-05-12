import { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../index";
import crypto from "crypto";
import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";
import UserModel from "../models/User";
import ResetTokenModel from "../models/ResetToken";
import CreatePasswordTokenModel from "../models/CreatePasswordToken";
import { UserInterface } from "../types";

export const signInController = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    console.log(`Поиск пользователя: ${username}`);
    const existingUser = await UserModel.findOne({ username });
    if (!existingUser || !existingUser.password) {
      return res.status(404).json({ message: "Пользователь не существует или пароль не установлен" });
    }

    const comparedPassword = await bcrypt.compare(password, existingUser.password);
    if (!comparedPassword) {
      return res.status(400).json({ message: "Неверный пароль" });
    }

    const token = jwt.sign(
      {
        id: existingUser.id,
        username: existingUser.username,
        store: existingUser.store,
      },
      SECRET_KEY,
      {
        expiresIn: "24h",
      }
    );

    res.status(200).json({
      token,
      levelOfAccess: existingUser.levelOfAccess,
      message: "Вход выполнен успешно",
    });
  } catch (error) {
    console.error("Ошибка входа:", error);
    res.status(500).json({ message: "Что-то пошло не так" });
  }
};

export const forgotPasswordController = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const existingEmail = await UserModel.findOne({ email });
    if (!existingEmail)
      return res.status(404).json({ message: "Email doesn't exist" });

    // res.status(200).json({ message: "Email verification sent to your email" }); // Commented out as it might be confusing for user

    const generatedToken = crypto.randomBytes(64);
    const convertTokenToHexString = generatedToken.toString("hex");

    const filePath = path.join(
      __dirname,
      "../emailTemplate/resetPassword.html"
    );

    const source = fs.readFileSync(filePath, "utf-8").toString();
    const template = handlebars.compile(source);
    const replacements = {
      email: email,
      resetToken: convertTokenToHexString,
      resetLink: `${req.protocol}://${req.get('host')}/reset-password/${convertTokenToHexString}` // Added reset link
    };
    const htmlToSend = template(replacements);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // Replace with your SMTP provider
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // Use environment variables
        pass: process.env.EMAIL_PASS, // Use environment variables
      },
    });

    await transporter.sendMail({
      from: `"Your App Name" <${process.env.EMAIL_USER}>`, // Replace with your app name and email
      to: email,
      subject: "Сброс пароля",
      text: "Вы запросили сброс пароля. Перейдите по ссылке для сброса.",
      html: htmlToSend,
    });

    await ResetTokenModel.create({
      email,
      resetToken: convertTokenToHexString,
    });
    res.status(200).json({ message: "Письмо для сброса пароля отправлено на ваш email" }); // Confirmation message

  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ message: "Что-то пошло не так при отправке email" });
  }
};

export const resetPasswordController = async (req: Request, res: Response) => {
  const { password, confirmPassword, resetToken } = req.body;

  try {
    const existingToken = await ResetTokenModel.findOne({ resetToken });
    if (!existingToken) {
      return res.status(404).json({ message: "Токен недействителен или истек" });
    }

    const existingUser = await UserModel.findOne({ email: existingToken.email });
    if (!existingUser) {
      return res.status(404).json({ message: "Пользователь с этим email не найден" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Пароли не совпадают" });
    }

    existingUser.password = password; // Hashing is done by pre-save hook
    await existingUser.save();
    await ResetTokenModel.deleteMany({ email: existingUser.email });
    res.status(200).json({ message: "Пароль успешно обновлен" });
  } catch (error) {
    return res.status(500).json({ message: "Что-то пошло не так при сбросе пароля" });
  }
};

export const createPasswordController = async (req: Request, res: Response) => {
  const { email, password, confirmPassword, createPasswordToken } = req.body;

  try {
    const existingToken = await CreatePasswordTokenModel.findOne({
      createPasswordToken,
    });
    if (!existingToken) {
      return res.status(404).json({ message: "Токен недействителен или истек" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "Пользователь с этим email не найден" });
    }

    if (existingToken.email !== email) {
      return res.status(400).json({ message: "Неверный email для этого токена" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Пароли не совпадают" });
    }

    existingUser.password = password; // Hashing is done by pre-save hook
    await existingUser.save();
    await CreatePasswordTokenModel.deleteMany({ email: existingUser.email });
    res.status(200).json({ message: "Пароль успешно создан" });
  } catch (error) {
    return res.status(500).json({ message: "Что-то пошло не так при создании пароля" });
  }
};

export const getProfileController = async (req: Request, res: Response) => {
  try {
    let decoded;
    
    // Check if decoded is in query params or request body
    if (req.query.decoded) {
      try {
        // If it's a string (from query params), parse the JWT
        const token = req.query.decoded as string;
        decoded = jwt.verify(token, SECRET_KEY);
      } catch (err) {
        console.error("getProfile: ошибка декодирования токена из query", err);
        return res.status(401).json({ message: "Недействительный токен" });
      }
    } else if (req.body.decoded) {
      // If it's in the body
      decoded = req.body.decoded;
    } else {
      console.error("getProfile: токен отсутствует");
      return res.status(400).json({ message: "Токен не предоставлен" });
    }
    
    if (!decoded || !decoded.id) {
      console.error("getProfile: отсутствует ID в токене");
      return res.status(400).json({ message: "Неверный токен" });
    }
    
    console.log(`getProfile: ищу пользователя с ID ${decoded.id}`);
    const user = await UserModel.findById(decoded.id).select("-password");
    
    if (!user) {
      console.error("getProfile: пользователь не найден");
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    
    console.log("getProfile: пользователь найден, формирую данные");
    const userData = {
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      address: user.address,
      birthDate: user.birthDate,
      contactNumber: user.contactNumber,
      levelOfAccess: user.levelOfAccess,
      store: user.store,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      fullName: `${user.firstName} ${user.lastName}`,
    };
    
    console.log("getProfile: успешно отправляю ответ");
    res.status(200).json(userData);
  } catch (error) {
    console.error("getProfile ошибка:", error);
    return res.status(500).json({ message: "Что-то пошло не так" });
  }
};

export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const ITEMS_PER_PAGE = 10;
    const page = parseInt(req.query.page as string) || 1;
    
    // Фильтруем только сотрудников
    const query = { levelOfAccess: "Сотрудник" };
    
    const skip = (page - 1) * ITEMS_PER_PAGE;
    
    const countPromise = UserModel.countDocuments(query);
    const usersPromise = UserModel.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(ITEMS_PER_PAGE)
      .skip(skip);
    
    const [count, filteredItems] = await Promise.all([countPromise, usersPromise]);
    
    const pageCount = Math.ceil(count / ITEMS_PER_PAGE);
    
    res.json({
      pagination: {
        count,
        pageCount
      },
      filteredItems
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createUserController = async (req: Request, res: Response) => {
  const {
    username,
    firstName, // Changed from name
    lastName, // Added
    email,
    address,
    birthDate,
    contactNumber,
    levelOfAccess,
    store,
    password, // Added for initial password creation
  } = req.body;

  try {
    const existingUsername = await UserModel.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Имя пользователя уже существует" });
    }

    const existingEmail = await UserModel.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email уже существует" });
    }

    if (contactNumber) { // Check if contactNumber is provided
      const existingContactNumber = await UserModel.findOne({ contactNumber });
      if (existingContactNumber) {
        return res.status(400).json({ message: "Контактный номер уже существует" });
      }
    }

    const newUser = new UserModel({
      username,
      firstName,
      lastName,
      email,
      address,
      birthDate,
      contactNumber,
      levelOfAccess,
      store,
      password, // Password will be hashed by pre-save hook
    });

    await newUser.save();

    // Send create password email if password was not provided initially
    if (!password) {
      const generatedToken = crypto.randomBytes(64).toString("hex");
      const filePath = path.join(__dirname, "../emailTemplate/createPassword.html");
      const source = fs.readFileSync(filePath, "utf-8").toString();
      const template = handlebars.compile(source);
      const replacements = {
        email: email,
        createPasswordToken: generatedToken,
        createLink: `${req.protocol}://${req.get('host')}/create-password/${generatedToken}`
      };
      const htmlToSend = template(replacements);

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Your App Name" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Создание пароля",
        text: "Пожалуйста, создайте пароль для вашего аккаунта.",
        html: htmlToSend,
      });

      await CreatePasswordTokenModel.create({
        email,
        createPasswordToken: generatedToken,
      });
      return res.status(201).json({ message: "Пользователь успешно создан. Письмо для создания пароля отправлено." });
    }

    res.status(201).json({ message: "Пользователь успешно создан." });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Что-то пошло не так при создании пользователя" });
  }
};

export const getUserByIdController = async (req: Request, res: Response) => { // Renamed to avoid conflict
  try {
    const user = await UserModel.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    const userData = {
      id: user._id,
      username: user.username,
      levelOfAccess: user.levelOfAccess,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      store: user.store,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    };
    res.json(userData);
  } catch (error: any) {
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    username,
    firstName,
    lastName,
    address,
    contactNumber,
    store,
    levelOfAccess,
    isActive,
  } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid ID" });

    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.username = username || user.username;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.address = address || user.address;
    user.contactNumber = contactNumber || user.contactNumber;
    user.store = store || user.store;
    user.levelOfAccess = levelOfAccess || user.levelOfAccess;
    user.isActive = isActive;

    const updatedUser = await user.save();

    const userData = {
      _id: updatedUser._id,
      username: updatedUser.username,
      name: updatedUser.name,
      email: updatedUser.email,
      address: updatedUser.address,
      contactNumber: updatedUser.contactNumber,
      levelOfAccess: updatedUser.levelOfAccess,
      store: updatedUser.store,
      isActive: updatedUser.isActive,
      fullName: `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim(),
    };

    res.status(200).json(userData);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Неверный ID пользователя" });
    }
    const deletedUser = await UserModel.findByIdAndDelete(id);
    if (!deletedUser) {
        return res.status(404).json({ message: "Пользователь не найден" });
    }
    return res.status(200).json({ message: "Пользователь успешно удален" }); // Changed to 200 for consistency
  } catch (error) {
    return res.status(500).json({ message: "Что-то пошло не так" });
  }
};

export const updateProfileController = async (req: Request, res: Response) => {
  const { decoded, username, firstName, lastName, email, address, birthDate, contactNumber, store } = req.body; // Assuming decoded token from auth middleware

  try {
    const userToUpdate = await UserModel.findById(decoded.id);
    if (!userToUpdate) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    if (email && email !== userToUpdate.email) {
      const existingEmail = await UserModel.findOne({ email: email, _id: { $ne: decoded.id } });
      if (existingEmail) {
        return res.status(400).json({ message: "Email уже используется" });
      }
      userToUpdate.email = email;
      userToUpdate.username = username || email; // Update username if provided, else use email
    }

    if (contactNumber && contactNumber !== userToUpdate.contactNumber) {
      const existingContactNumber = await UserModel.findOne({ contactNumber: contactNumber, _id: { $ne: decoded.id } });
      if (existingContactNumber) {
        return res.status(400).json({ message: "Контактный номер уже используется" });
      }
      userToUpdate.contactNumber = contactNumber;
    }
    
    if (username && username !== userToUpdate.username && (!email || email === userToUpdate.email) ) {
        // if username changes and email does not, or email is not provided
        const existingUsername = await UserModel.findOne({ username: username, _id: { $ne: decoded.id } });
        if (existingUsername) {
            return res.status(400).json({ message: "Имя пользователя уже используется" });
        }
        userToUpdate.username = username;
    }

    if (firstName) userToUpdate.firstName = firstName;
    if (lastName) userToUpdate.lastName = lastName;
    if (address) userToUpdate.address = address;
    if (birthDate) userToUpdate.birthDate = birthDate;
    if (store) userToUpdate.store = store;

    await userToUpdate.save();
    return res.status(200).json({ message: "Профиль успешно обновлен" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Что-то пошло не так при обновлении профиля" });
  }
};

export const validateTokenController = async (req: Request, res: Response) => {
  try {
    res.status(200).json({ valid: true });
  } catch (error) {
    res.status(401).json({ valid: false, message: "Неверный токен" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { password, ...userData } = req.body;
    
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await UserModel.create({
      ...userData,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Не возвращаем пароль
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    res.status(201).json(userWithoutPassword);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { password, ...updateData } = req.body;
    
    // Если передан новый пароль, хешируем его
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    res.json({ message: 'Пользователь успешно удален' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
