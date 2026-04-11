const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@studio-karine.com';
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      throw new Error(
        'ADMIN_PASSWORD não configurada em .env. Defina ADMIN_PASSWORD antes de executar o seed.'
      );
    }

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      if (existingAdmin.role !== 'ADMIN') {
        await prisma.user.update({
          where: { id: existingAdmin.id },
          data: { role: 'ADMIN' },
        });
        console.log('Conta existente promovida para ADMIN com sucesso.');
      } else {
        console.log('Admin account já existe. Seed concluído sem alterações.');
      }
      return;
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.create({
      data: {
        name: 'Karine',
        lastName: 'Reverte',
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
      },
    });

    console.log('Admin account criado com sucesso.');
    console.log(`Email: ${admin.email}`);
    console.log(`ID: ${admin.id}`);
    console.log(`Role: ${admin.role}`);
  } catch (error) {
    console.error('Erro ao executar seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
