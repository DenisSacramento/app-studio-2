import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
	log: ['error', 'warn'],
});

prisma.$on('error', (event) => {
	console.error('[prisma:error]', {
		target: event.target,
		message: event.message,
		timestamp: event.timestamp,
	});
});
