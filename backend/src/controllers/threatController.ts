import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../types';

export const getThreats = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;
    const severity = req.query.severity as string;
    const search = req.query.search as string;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { source: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [threats, total] = await Promise.all([
      prisma.threat.findMany({ where, skip, take: limit, orderBy: { timestamp: 'desc' } }),
      prisma.threat.count({ where }),
    ]);

    res.json({
      success: true,
      message: 'Threats retrieved',
      data: { threats },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get threats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getThreatById = async (req: Request, res: Response): Promise<void> => {
  try {
    const threat = await prisma.threat.findUnique({ where: { id: req.params.id } });
    if (!threat) {
      res.status(404).json({ success: false, message: 'Threat not found' });
      return;
    }
    res.json({ success: true, message: 'Threat retrieved', data: { threat } });
  } catch (error) {
    console.error('Get threat error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateThreatStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const validStatuses = ['ACTIVE', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE'];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const threat = await prisma.threat.update({
      where: { id: req.params.id },
      data: {
        status,
        ...(status === 'RESOLVED' && { resolvedAt: new Date() }),
      },
    });

    await prisma.securityLog.create({
      data: {
        eventType: status === 'RESOLVED' ? 'THREAT_RESOLVED' : 'THREAT_DETECTED',
        severity: 'MEDIUM',
        description: `Threat status updated to ${status}: ${threat.title}`,
        userId: req.user?.userId,
      },
    });

    res.json({ success: true, message: 'Threat status updated', data: { threat } });
  } catch (error) {
    console.error('Update threat status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createThreat = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, source, type, severity, description, ipAddress, country } = req.body;

    const threat = await prisma.threat.create({
      data: { title, source, type, severity, description, ipAddress, country },
    });

    await prisma.securityLog.create({
      data: {
        eventType: 'THREAT_DETECTED',
        severity,
        description: `New threat created: ${title}`,
        userId: req.user?.userId,
      },
    });

    res.status(201).json({ success: true, message: 'Threat created', data: { threat } });
  } catch (error) {
    console.error('Create threat error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getSecurityLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.securityLog.findMany({
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.securityLog.count(),
    ]);

    res.json({
      success: true,
      message: 'Security logs retrieved',
      data: { logs },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get security logs error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
