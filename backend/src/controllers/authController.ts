import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../lib/jwt';
import { AuthenticatedRequest } from '../types';

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, username, password } = req.body;

    if (!name || !email || !username || !password) {
      res.status(400).json({ success: false, message: 'All fields are required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: existingUser.email === email ? 'Email already in use' : 'Username already taken',
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
        provider: 'email',
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    await prisma.securityLog.create({
      data: {
        eventType: 'USER_CREATED',
        severity: 'LOW',
        description: `New user registered: ${email}`,
        userId: user.id,
        ipAddress: req.ip,
      },
    });

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user, accessToken, refreshToken },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error?.message || 'Internal server error',
      code: error?.code,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, message: 'Account has been suspended' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await prisma.securityLog.create({
        data: {
          eventType: 'LOGIN_FAILED',
          severity: 'MEDIUM',
          description: `Failed login attempt for: ${email}`,
          ipAddress: req.ip,
          userId: user.id,
        },
      });
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Generate OTP
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await prisma.otpCode.create({
        data: { email: user.email, code: otp, expiresAt },
      });

      // In production, send via email/SMS. For demo, return in response.
      res.status(200).json({
        success: true,
        message: '2FA verification required',
        data: {
          requiresOtp: true,
          email: user.email,
          // Only in dev mode - remove in production
          ...(process.env.NODE_ENV === 'development' && { otp }),
        },
      });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await prisma.securityLog.create({
      data: {
        eventType: 'LOGIN_SUCCESS',
        severity: 'LOW',
        description: `User logged in: ${email}`,
        userId: user.id,
        ipAddress: req.ip,
      },
    });

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
      twoFactorEnabled: user.twoFactorEnabled,
      lastLoginAt: user.lastLoginAt,
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user: userData, accessToken, refreshToken },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error?.message || 'Internal server error',
      code: error?.code,
    });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ success: false, message: 'Email and OTP are required' });
      return;
    }

    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        email,
        code: otp,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      return;
    }

    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await prisma.securityLog.create({
      data: {
        eventType: 'OTP_VERIFIED',
        severity: 'LOW',
        description: `OTP verified for: ${email}`,
        userId: user.id,
        ipAddress: req.ip,
      },
    });

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          avatar: user.avatar,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    console.error('OTP verify error:', error);
    res.status(500).json({ success: false, message: error?.message || 'Internal server error' });
  }
};

export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({ success: false, message: 'Refresh token required' });
      return;
    }

    const tokenRecord = await prisma.refreshToken.findFirst({
      where: { token: refreshToken, isRevoked: false, expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    if (!tokenRecord) {
      res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
      return;
    }

    try {
      verifyRefreshToken(refreshToken);
    } catch {
      await prisma.refreshToken.update({ where: { id: tokenRecord.id }, data: { isRevoked: true } });
      res.status(403).json({ success: false, message: 'Invalid refresh token' });
      return;
    }

    const user = tokenRecord.user;
    const newAccessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const newRefreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    await prisma.refreshToken.update({ where: { id: tokenRecord.id }, data: { isRevoked: true } });
    await prisma.refreshToken.create({
      data: { token: newRefreshToken, userId: user.id, expiresAt: getRefreshTokenExpiry() },
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed',
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch (error: any) {
    console.error('Refresh token error:', error);
    res.status(500).json({ success: false, message: error?.message || 'Internal server error' });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { isRevoked: true },
      });
    }

    if (req.user) {
      await prisma.securityLog.create({
        data: {
          eventType: 'LOGOUT',
          severity: 'LOW',
          description: `User logged out: ${req.user.email}`,
          userId: req.user.userId,
          ipAddress: req.ip,
        },
      });
    }

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: error?.message || 'Internal server error' });
  }
};

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpCode.create({ data: { email, code: otp, expiresAt } });

    res.status(200).json({
      success: true,
      message: 'OTP sent to email',
      data: { ...(process.env.NODE_ENV === 'development' && { otp }) },
    });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: error?.message || 'Internal server error' });
  }
};

// Mock OAuth handler
export const oauthCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { provider, providerId, email, name, avatar } = req.body;

    if (!provider || !email) {
      res.status(400).json({ success: false, message: 'Provider and email are required' });
      return;
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const username = email.split('@')[0] + '_' + uuidv4().slice(0, 4);
      user = await prisma.user.create({
        data: {
          name: name || email.split('@')[0],
          email,
          username,
          provider,
          providerId,
          avatar,
          emailVerified: true,
        },
      });
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: getRefreshTokenExpiry() },
    });

    res.status(200).json({
      success: true,
      message: `${provider} authentication successful`,
      data: {
        user: { id: user.id, name: user.name, email: user.email, username: user.username, role: user.role, avatar: user.avatar },
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    console.error('OAuth error:', error);
    res.status(500).json({ success: false, message: error?.message || 'Internal server error' });
  }
};
