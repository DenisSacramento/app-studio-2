import { app } from './app';
import { env } from './config/env';

app.listen(env.port, env.host, () => {
  console.log(`API rodando em http://${env.host}:${env.port}`);
});
