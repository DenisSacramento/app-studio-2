import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Verificar se admin já existe
    const existingAdmin = await prisma.user.findUnique({
      where: {
        email: process.env.ADMIN_EMAIL || 'admin@studio-karine.com',
      },
    });

    if (existingAdmin) {
      console.log('✅ Admin account já existe. Pulando seed...');
      return;
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@studio-karine.com';
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      throw new Error(
        '❌ ADMIN_PASSWORD não configurada em .env. ' +
        'Por favor, defina ADMIN_PASSWORD antes de executar o seed.'
      );
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Criar usuário admin
    const admin = await prisma.user.create({
      data: {
        name: 'Administrador',
        lastName: 'Studio Karine',
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin account criado com sucesso!');
    console.log(`   Email: ${admin.email}`);
    console.log(`   ID: ${admin.id}`);
    console.log(`   Role: ${admin.role}`);
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
