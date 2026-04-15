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
const corsOriginPatterns = env.corsOrigins
	.filter((origin) => origin.includes('*') && origin !== '*')
	.map((origin) => {
		const escaped = origin
			.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
			.replace(/\*/g, '.*');

		return new RegExp(`^${escaped}$`);
	});
const corsExplicitOrigins = env.corsOrigins.filter(
	(origin) => !origin.includes('*')
);

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
			? {
					origin: true,
					credentials: true,
				}
			: {
					origin: (origin, callback) => {
						if (!origin) {
							callback(null, true);
							return;
						}

						const isExplicitMatch = corsExplicitOrigins.includes(origin);
						const isPatternMatch = corsOriginPatterns.some((pattern) =>
							pattern.test(origin)
						);

						if (isExplicitMatch || isPatternMatch) {
							callback(null, true);
							return;
						}

						callback(new Error(`CORS bloqueado para origem: ${origin}`));
					},
					credentials: true,
				}
	)
);
app.use(express.json());

app.get('/', (_req, res) => {
	res.status(200).json({ status: 'ok', service: 'app-studio-2-api' });
});

app.get('/health', (_req, res) => {
	res.status(200).json({ status: 'ok' });
});

app.use('/api', routes);

app.use((_req, _res, next) => {
	next(new AppError('Rota n�o encontrada', 404));
});

app.use(errorHandler);
