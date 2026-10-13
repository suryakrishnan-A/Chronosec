import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../types';

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true, name: true, email: true, username: true, role: true,
        avatar: true, twoFactorEnabled: true, emailVerified: true,
        provider: true, createdAt: true, lastLoginAt: true, isActive: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, message: 'Profile retrieved', data: { user } });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, username, avatar } = req.body;

    if (username) {
      const existing = await prisma.user.findFirst({
        where: { username, id: { not: req.user!.userId } },
      });
      if (existing) {
        res.status(409).json({ success: false, message: 'Username already taken' });
        return;
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { ...(name && { name }), ...(username && { username }), ...(avatar && { avatar }) },
      select: {
        id: true, name: true, email: true, username: true, role: true,
        avatar: true, twoFactorEnabled: true, updatedAt: true,
      },
    });

    res.json({ success: true, message: 'Profile updated', data: { user } });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Both passwords are required' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user || !user.password) {
      res.status(400).json({ success: false, message: 'Cannot change password for OAuth accounts' });
      return;
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      res.status(401).json({ success: false, message: 'Current password is incorrect' });
      return;
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user!.userId }, data: { password: hashed } });

    await prisma.securityLog.create({
      data: {
        eventType: 'PASSWORD_CHANGE',
        severity: 'MEDIUM',
        description: `Password changed for user: ${user.email}`,
        userId: user.id,
        ipAddress: req.ip,
      },
    });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const toggleTwoFactor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { twoFactorEnabled: !user.twoFactorEnabled },
    });

    res.json({
      success: true,
      message: `2FA ${updated.twoFactorEnabled ? 'enabled' : 'disabled'}`,
      data: { twoFactorEnabled: updated.twoFactorEnabled },
    });
  } catch (error) {
    console.error('Toggle 2FA error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin routes
export const getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true, name: true, email: true, username: true,
          role: true, isActive: true, emailVerified: true,
          provider: true, createdAt: true, lastLoginAt: true, avatar: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    res.json({
      success: true,
      message: 'Users retrieved',
      data: { users },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role' });
      return;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    await prisma.securityLog.create({
      data: {
        eventType: 'ROLE_CHANGE',
        severity: 'HIGH',
        description: `User role changed to ${role}: ${user.email}`,
        userId: req.user!.userId,
      },
    });

    res.json({ success: true, message: 'Role updated', data: { user } });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const toggleUserStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: { id: true, name: true, email: true, isActive: true },
    });

    await prisma.securityLog.create({
      data: {
        eventType: updated.isActive ? 'USER_CREATED' : 'USER_SUSPENDED',
        severity: 'HIGH',
        description: `User ${updated.isActive ? 'activated' : 'suspended'}: ${updated.email}`,
        userId: req.user!.userId,
      },
    });

    res.json({ success: true, message: `User ${updated.isActive ? 'activated' : 'suspended'}`, data: { user: updated } });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
