import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface UserInterface extends Document {
  username: string;
  password?: string;
  levelOfAccess: 'Администратор' | 'Сотрудник' | 'Клиент';
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  store?: string;
  address?: string;
  birthDate?: Date;
  contactNumber?: string;
  name?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(passwordToCompare: string): Promise<boolean>;
  getFullName(): string;
}

const UserSchema = new Schema<UserInterface>({
  username: {
    type: String,
    
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: false,
  },
  levelOfAccess: {
    type: String,
    enum: ['Администратор', 'Сотрудник', 'Клиент'],
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  store: {
    type: String,
  },
  address: {
    type: String,
  },
  birthDate: {
    type: Date,
  },
  contactNumber: {
    type: String,
  },
  name: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Хеширование пароля перед сохранением
UserSchema.pre<UserInterface>('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Метод для проверки пароля
UserSchema.methods.comparePassword = async function(passwordToCompare: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(passwordToCompare, this.password);
};

// Метод для получения полного имени
UserSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

export const User = mongoose.model<UserInterface>('User', UserSchema);
export default User;
