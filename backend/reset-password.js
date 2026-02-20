const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Update admin user password
    const admin = await prisma.user.update({
      where: { email: 'admin@cricket.com' },
      data: { password: hashedPassword }
    });

    console.log('✅ Password reset successfully for:', admin.email);
    console.log('📧 Email: admin@cricket.com');
    console.log('🔑 Password: password123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
