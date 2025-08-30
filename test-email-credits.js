// 测试邮箱注册用户是否获得初始积分
require('dotenv').config({ path: '.env.development' });

const { db } = require('./src/db');
const { users, credits } = require('./src/db/schema');
const { eq } = require('drizzle-orm');

async function checkUserCredits(email) {
  console.log(`\n检查用户 ${email} 的积分情况：`);
  
  try {
    // 获取用户信息
    const [user] = await db()
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (!user) {
      console.log('❌ 用户不存在');
      return;
    }
    
    console.log('✅ 用户信息：');
    console.log('   UUID:', user.uuid);
    console.log('   昵称:', user.nickname);
    console.log('   登录方式:', user.signin_provider);
    console.log('   创建时间:', user.created_at);
    
    // 获取用户积分记录
    const userCredits = await db()
      .select()
      .from(credits)
      .where(eq(credits.user_uuid, user.uuid));
    
    console.log('\n📊 积分记录：');
    if (userCredits.length === 0) {
      console.log('   ❌ 没有积分记录（问题所在！）');
    } else {
      userCredits.forEach((credit, index) => {
        console.log(`   ${index + 1}. 类型: ${credit.trans_type}, 积分: ${credit.credits}, 时间: ${credit.created_at}`);
      });
      
      const totalCredits = userCredits.reduce((sum, c) => sum + (c.credits || 0), 0);
      console.log(`   💰 总积分: ${totalCredits}`);
    }
  } catch (error) {
    console.error('查询错误:', error);
  }
}

// 如果提供了邮箱参数，使用该邮箱，否则提示输入
const email = process.argv[2];
if (email) {
  checkUserCredits(email).then(() => process.exit(0));
} else {
  console.log('使用方法: node test-email-credits.js <email>');
  console.log('例如: node test-email-credits.js test@example.com');
}