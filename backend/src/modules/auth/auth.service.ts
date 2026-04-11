import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import jwt from 'jsonwebtoken';
import { randomBytes, randomUUID } from 'node:crypto';

import { env } from '../../config/env';
import { prisma } from '../../shared/database/prisma';
import { emailService } from '../../shared/email/email.service';
import { AppError } from '../../shared/errors/app-error';
import { ForgotPasswordInput, LoginInput, RegisterInput, ResetPasswordInput } from './auth.schemas';
import { AuthResult, PasswordResetResult } from './auth.types';

class AuthService {
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private createAccessToken(userId: string, email: string): string {
    const expiresIn = env.jwtExpiresIn as jwt.SignOptions['expiresIn'];

    return jwt.sign({ sub: userId, email }, env.jwtSecret, {
      expiresIn,
    });
  }

  private createRefreshToken(userId: string): string {
    const expiresIn = env.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn'];

    return jwt.sign({ sub: userId, type: 'refresh', jti: randomUUID() }, env.jwtRefreshSecret, {
      expiresIn,
    });
  }

  private createResetToken(): string {
    return randomBytes(32).toString('hex');
  }

  private async persistRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret) as jwt.JwtPayload;

    if (!decoded.exp) {
      throw new AppError('Refresh token inv�lido', 401);
    }

    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(decoded.exp * 1000),
      },
    });
  }

  private async issueAuthTokens(userId: string, email: string) {
    const token = this.createAccessToken(userId, email);
    const refreshToken = this.createRefreshToken(userId);

    await this.persistRefreshToken(userId, refreshToken);

    return { token, refreshToken };
  }

  async requestPasswordReset(data: ForgotPasswordInput): Promise<PasswordResetResult> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return {
        message: 'Se o email estiver cadastrado, você receberá as instruções de redefinição.',
      };
    }

    const token = this.createResetToken();
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + env.resetPasswordTokenTtlMinutes * 60 * 1000);

    await prisma.$executeRaw`
      DELETE FROM password_reset_tokens
      WHERE user_id = ${user.id}::uuid
        AND used_at IS NULL
    `;

    await prisma.$executeRaw`
      INSERT INTO password_reset_tokens (id, token_hash, user_id, expires_at, created_at)
      VALUES (${randomUUID()}::uuid, ${tokenHash}, ${user.id}::uuid, ${expiresAt}, NOW())
    `;

    await emailService.sendPasswordResetInstructions({
      to: user.email,
      name: user.name,
      token,
      expiresInMinutes: env.resetPasswordTokenTtlMinutes,
    });

    return {
      message: 'Se o email estiver cadastrado, você receberá as instruções de redefinição.',
    };
  }

  async resetPassword(data: ResetPasswordInput): Promise<PasswordResetResult> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (!user) {
      throw new AppError('Token ou email inválido', 400);
    }

    const tokenHash = this.hashToken(data.token);
    const resetTokens = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM password_reset_tokens
      WHERE user_id = ${user.id}::uuid
        AND token_hash = ${tokenHash}
        AND used_at IS NULL
        AND expires_at > NOW()
      LIMIT 1
    `;

    const resetToken = resetTokens[0];

    if (!resetToken) {
      throw new AppError('Token ou email inválido', 400);
    }

    const passwordHash = await bcrypt.hash(data.password, env.bcryptRounds);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
    ]);

    await prisma.$executeRaw`
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE id = ${resetToken.id}::uuid
    `;

    return {
      message: 'Senha redefinida com sucesso',
    };
  }

  async register(data: RegisterInput): Promise<AuthResult> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new AppError('Email j� est� em uso', 409, {
        email: 'Email j� cadastrado',
      });
    }

    const passwordHash = await bcrypt.hash(data.password, env.bcryptRounds);

    try {
      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash,
        },
      });

      const tokens = await this.issueAuthTokens(user.id, user.email);

      return {
        message: 'Usuário cadastrado com sucesso',
        token: tokens.token,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new AppError('Email j� est� em uso', 409, {
          email: 'Email j� cadastrado',
        });
      }

      throw error;
    }
  }

  async login(data: LoginInput): Promise<AuthResult> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError('Credenciais inv�lidas', 401);
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Credenciais inv�lidas', 401);
    }

    const tokens = await this.issueAuthTokens(user.id, user.email);

    return {
      message: 'Login realizado com sucesso',
      token: tokens.token,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refreshSession(refreshToken: string): Promise<{ message: string; token: string; refreshToken: string }> {
    let payload: jwt.JwtPayload;

    try {
      payload = jwt.verify(refreshToken, env.jwtRefreshSecret) as jwt.JwtPayload;
    } catch {
      throw new AppError('Refresh token inv�lido ou expirado', 401);
    }

    if (payload.type !== 'refresh' || typeof payload.sub !== 'string') {
      throw new AppError('Refresh token inv�lido', 401);
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash: this.hashToken(refreshToken) },
      include: { user: true },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new AppError('Refresh token inv�lido', 401);
    }

    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this.issueAuthTokens(storedToken.user.id, storedToken.user.email);

    return {
      message: 'Sess�o renovada com sucesso',
      token: tokens.token,
      refreshToken: tokens.refreshToken,
    };
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);

    await prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}

export const authService = new AuthService();
