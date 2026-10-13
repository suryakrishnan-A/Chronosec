import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../types';

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [
      totalThreats,
      activeThreats,
      resolvedThreats,
      criticalThreats,
      recentLogs,
      totalUsers,
      recentThreats,
    ] = await Promise.all([
      prisma.threat.count(),
      prisma.threat.count({ where: { status: 'ACTIVE' } }),
      prisma.threat.count({ where: { status: 'RESOLVED' } }),
      prisma.threat.count({ where: { severity: 'CRITICAL' } }),
      prisma.securityLog.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.user.count(),
      prisma.threat.findMany({
        take: 5,
        orderBy: { timestamp: 'desc' },
        where: { status: { in: ['ACTIVE', 'INVESTIGATING'] } },
      }),
    ]);

    const threatsByDay = await prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT DATE(timestamp)::text as date, COUNT(*) as count
      FROM threats
      WHERE timestamp >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `.catch(() => []);

    const threatsBySeverity = await prisma.threat.groupBy({
      by: ['severity'],
      _count: { severity: true },
    });

    res.json({
      success: true,
      message: 'Dashboard stats retrieved',
      data: {
        stats: {
          totalThreats,
          activeThreats,
          resolvedThreats,
          criticalThreats,
          totalUsers,
          threatsByDay: (threatsByDay as { date: string; count: bigint }[]).map(d => ({
            date: d.date,
            count: Number(d.count),
          })),
          threatsBySeverity: threatsBySeverity.map(t => ({
            severity: t.severity,
            count: t._count.severity,
          })),
        },
        recentThreats,
        recentLogs,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const triggerScan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const scan = await prisma.systemScan.create({
      data: {
        status: 'running',
        triggeredBy: req.user!.userId,
      },
    });

    await prisma.securityLog.create({
      data: {
        eventType: 'SCAN_STARTED',
        severity: 'LOW',
        description: 'Security scan initiated',
        userId: req.user!.userId,
      },
    });

    // Simulate scan completion after a delay (non-blocking)
    setTimeout(async () => {
      const simulatedThreats = Math.floor(Math.random() * 5);
      await prisma.systemScan.update({
        where: { id: scan.id },
        data: { status: 'completed', threatsFound: simulatedThreats, completedAt: new Date() },
      });

      if (simulatedThreats > 0) {
        const threatTypes = ['Port Scan', 'SQL Injection', 'Brute Force', 'DDoS', 'Phishing'];
        const severities: ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
        const countries = ['US', 'CN', 'RU', 'DE', 'KR'];

        for (let i = 0; i < simulatedThreats; i++) {
          await prisma.threat.create({
            data: {
              title: `${threatTypes[Math.floor(Math.random() * threatTypes.length)]} Detected`,
              source: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
              type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
              severity: severities[Math.floor(Math.random() * severities.length)],
              description: 'Threat detected by automated security scan',
              country: countries[Math.floor(Math.random() * countries.length)],
              ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.0.${Math.floor(Math.random() * 255)}`,
            },
          });
        }
      }

      await prisma.securityLog.create({
        data: {
          eventType: 'SCAN_COMPLETED',
          severity: 'LOW',
          description: `Scan completed. Threats found: ${simulatedThreats}`,
          userId: req.user?.userId,
        },
      });
    }, 3000);

    res.json({
      success: true,
      message: 'Security scan initiated',
      data: { scanId: scan.id, status: 'running' },
    });
  } catch (error) {
    console.error('Trigger scan error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
