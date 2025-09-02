import bcrypt from 'bcryptjs';
import { sql } from '../database/db.js';

// Hash password before saving
export const hashPassword = async (plainPassword) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainPassword, salt);
};

// Compare password during login
export const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Create a new user
export const createUser = async (userData) => {
  const hashedPassword = await hashPassword(userData.password);

  await sql.query`
    INSERT INTO Users (
      FirstName, LastName, Email, Phone, Password, Role, IsActive, IsEmailVerified,
      Avatar, Department, EmployeeId, PasswordResetToken, PasswordResetExpires,
      EmailVerificationToken, EmailVerificationExpires, LastLogin, LoginAttempts,
      LockUntil, Preferences
    )
    VALUES (
      ${userData.firstName}, ${userData.lastName}, ${userData.email}, ${userData.phone},
      ${hashedPassword}, ${userData.role || 'viewer'}, ${true}, ${false},
      ${userData.avatar}, ${userData.department}, ${userData.employeeId},
      ${userData.passwordResetToken}, ${userData.passwordResetExpires},
      ${userData.emailVerificationToken}, ${userData.emailVerificationExpires},
      ${userData.lastLogin}, ${userData.loginAttempts || 0},
      ${userData.lockUntil}, ${JSON.stringify(userData.preferences || {})}
    )
  `;
};

// Find user by email
export const findUserByEmail = async (email) => {
  const result = await sql.query`SELECT * FROM Users WHERE Email = ${email}`;
  return result.recordset[0];
};

// Find user by ID
export const findUserById = async (id) => {
  const result = await sql.query`SELECT * FROM Users WHERE Id = ${id}`;
  return result.recordset[0];
};
