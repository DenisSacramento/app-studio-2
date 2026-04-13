import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env } from './config/env';
import { routes } from './routes';
import { AppError } from './shared/errors/app-error';
import { errorHandler } from './shared/http/error-handler';

export const app = express();

const isWildcardCors = env.corsOrigins.includes('*');

app.use(helmet());
app.use(
	rateLimit({
		windowMs: 15 * 60 * 1000,
		max: 300,
		standardHeaders: true,
		legacyHeaders: false,
	})
);
app.use(
	cors(
		isWildcardCors
			? {}
			: {
					origin: env.corsOrigins,
					credentials: true,
				}
	)
);
app.use(express.json());

app.get('/health', (_req, res) => {
	res.status(200).json({ status: 'ok' });
});

app.use('/api', routes);

app.use((_req, _res, next) => {
	next(new AppError('Rota n�o encontrada', 404));
});

app.use(errorHandler);
