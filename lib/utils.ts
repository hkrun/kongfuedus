import bcrypt from "bcryptjs";
import crypto from "crypto";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("密码至少需要8个字符");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("密码需要包含至少一个大写字母");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("密码需要包含至少一个小写字母");
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("密码需要包含至少一个数字");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
