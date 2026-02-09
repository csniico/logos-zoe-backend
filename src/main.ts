import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import * as os from 'os';

async function getPublicIp(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = (await response.json()) as { ip: string };
    return data.ip;
  } catch {
    return 'Unable to fetch';
  }
}

function getLocalIpAddress(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (!iface) continue;

    for (const addr of iface) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (addr.family === 'IPv4' && !addr.internal) {
        return addr.address;
      }
    }
  }
  return '127.0.0.1';
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  const adapter = app.getHttpAdapter() as ExpressAdapter;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const instance = adapter.getInstance();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  instance.disable('x-powered-by');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  // Get IP addresses
  const localIp = getLocalIpAddress();
  const publicIp = await getPublicIp();

  // Log server information
  console.log('\n==============================================');
  console.log('Server started successfully!');
  console.log('==============================================');
  console.log(`📍 Local:        http://localhost:${port}`);
  console.log(`🌐 Network:      http://${localIp}:${port}`);
  console.log(`🌍 Public IP:    ${publicIp}`);
  console.log(`⚙️  Environment:  ${process.env.NODE_ENV || 'development'}`);
  console.log('==============================================\n');
}
bootstrap()
  .then(() => {
    // Additional success message if needed
  })
  .catch(console.error);
