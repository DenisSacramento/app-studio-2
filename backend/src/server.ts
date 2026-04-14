import { app } from './app';
import { env } from './config/env';
import { prisma } from './shared/database/prisma';

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('[startup] Conexao com banco estabelecida com sucesso');

    app.listen(env.port, env.host, () => {
      console.log(`API rodando em http://${env.host}:${env.port}`);
      console.log(`[startup] NODE_ENV=${env.nodeEnv}`);
    });
  } catch (error) {
    console.error('[startup] Falha ao iniciar API:', error);
    process.exit(1);
  }
}

void bootstrap();
