import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import type { Response } from 'express';
import * as os from 'os';
import { PublicRoute } from './auth/decorators/public.decorator';

@PublicRoute()
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectConnection() private connection: Connection,
  ) {}

  @Get('health')
  healthCheck(@Res() res: Response) {
    try {
      // Check database connection (readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting)
      const dbStatus =
        Number(this.connection.readyState) === 1 ? 'connected' : 'disconnected';
      const isHealthy = Number(this.connection.readyState) === 1;

      // Get memory usage
      const memUsage = process.memoryUsage();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;

      // Get CPU usage
      const cpus = os.cpus();
      const cpuUsage = process.cpuUsage();

      const healthData = {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
          database: dbStatus,
        },
        system: {
          memory: {
            total: `${(totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
            used: `${(usedMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
            free: `${(freeMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
            usagePercent: `${((usedMemory / totalMemory) * 100).toFixed(2)}%`,
          },
          process: {
            memoryUsage: {
              rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
              heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
              heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
              external: `${(memUsage.external / 1024 / 1024).toFixed(2)} MB`,
            },
            cpu: {
              user: `${(cpuUsage.user / 1000000).toFixed(2)}s`,
              system: `${(cpuUsage.system / 1000000).toFixed(2)}s`,
            },
          },
          cpu: {
            cores: cpus.length,
            model: cpus[0]?.model || 'unknown',
          },
        },
      };

      if (!isHealthy) {
        return res.status(HttpStatus.SERVICE_UNAVAILABLE).json(healthData);
      }

      return res.status(HttpStatus.OK).json(healthData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: errorMessage,
      });
    }
  }

  @Get('auth')
  getHello(): string {
    return this.appService.sayHi();
  }
}
