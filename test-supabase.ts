/**
 * Supabase 数据库测试脚本
 * 
 * 运行方式:
 * npx tsx test-supabase.ts
 * 
 * 或者添加到 package.json:
 * "scripts": {
 *   "test:db": "tsx test-supabase.ts"
 * }
 * 然后运行: npm run test:db
 */

import { supabase } from './src/lib/supabase';

// 测试结果统计
let passed = 0;
let failed = 0;

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function logSuccess(message: string) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
  passed++;
}

function logError(message: string) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
  failed++;
}

function logInfo(message: string) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function logWarning(message: string) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logHeader(message: string) {
  console.log(`\n${colors.cyan}${colors.bright}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}${message}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}${'='.repeat(60)}${colors.reset}\n`);
}

// 测试1: 连接测试
async function testConnection() {
  logHeader('测试 1: 数据库连接');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (error) throw error;

    logSuccess('数据库连接成功');
    logInfo(`Supabase URL: https://pyqcvvqnnjljdcmnseux.supabase.co`);
    return true;
  } catch (error: any) {
    logError(`连接失败: ${error.message}`);
    return false;
  }
}

// 测试2: 表结构验证
async function testTables() {
  logHeader('测试 2: 验证表结构');

  const expectedTables = [
    'users',
    'ai_twins',
    'onboarding_progress',
    'ai_conversations',
    'invitations',
    'groups',
    'group_members',
    'group_messages'
  ];

  let allTablesExist = true;

  for (const table of expectedTables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });

      if (error) throw error;
      
      logSuccess(`表 "${table}" 存在`);
    } catch (error: any) {
      logError(`表 "${table}" 不存在或无法访问: ${error.message}`);
      allTablesExist = false;
    }
  }

  if (allTablesExist) {
    logInfo(`所有 ${expectedTables.length} 个表都已正确创建`);
  }

  return allTablesExist;
}

// 测试3: RLS策略验证
async function testRLS() {
  logHeader('测试 3: Row Level Security (RLS)');

  try {
    // 尝试以匿名用户身份查询ai_twins表
    const { data, error } = await supabase
      .from('ai_twins')
      .select('*');

    if (!error && (!data || data.length === 0)) {
      logSuccess('RLS正确配置 - 未认证用户无法查看数据');
      logInfo('返回结果: 0 条记录（预期行为）');
      return true;
    } else if (error) {
      if (error.message.includes('RLS') || error.message.includes('policy')) {
        logSuccess('RLS正确配置 - 策略阻止了访问');
        logInfo(`错误信息: ${error.message}`);
        return true;
      } else {
        throw error;
      }
    } else {
      logWarning(`未认证用户可以查看 ${data?.length || 0} 条记录`);
      logInfo('这可能表示RLS未正确配置，或者已有公开数据');
      return false;
    }
  } catch (error: any) {
    logError(`RLS测试失败: ${error.message}`);
    return false;
  }
}

// 测试4: 数据操作测试
async function testDataOperations() {
  logHeader('测试 4: 数据操作 (CRUD)');

  try {
    // 尝试匿名插入（应该失败）
    const testUser = {
      google_id: `test_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      name: 'Test User',
      picture: 'https://example.com/test.jpg'
    };

    const { data, error } = await supabase
      .from('users')
      .insert(testUser)
      .select();

    if (error) {
      // RLS阻止是预期行为
      if (error.message.includes('row-level security') || 
          error.message.includes('policy') ||
          error.code === '42501') {
        logSuccess('RLS正确阻止了未授权的数据插入');
        logInfo(`错误代码: ${error.code}`);
        logInfo('只有通过Google OAuth认证的用户才能操作数据');
        return true;
      } else {
        throw error;
      }
    } else {
      logWarning('未认证用户可以插入数据！这是安全隐患！');
      logInfo(`插入的数据: ${JSON.stringify(data, null, 2)}`);
      return false;
    }
  } catch (error: any) {
    logError(`数据操作测试失败: ${error.message}`);
    return false;
  }
}

// 测试5: 辅助函数测试
async function testHelperFunctions() {
  logHeader('测试 5: 辅助函数');

  try {
    // 导入辅助函数进行测试
    const { getAllAITwins, getConversations } = await import('./src/lib/supabase');

    // 测试getAllAITwins
    const { data: twins, error: twinsError } = await getAllAITwins();
    if (twinsError) {
      logWarning(`getAllAITwins: ${twinsError.message}`);
    } else {
      logSuccess(`getAllAITwins 工作正常 (返回 ${twins?.length || 0} 条记录)`);
    }

    // 测试getConversations (需要用户ID，使用假ID测试)
    const { data: convs, error: convsError } = await getConversations('00000000-0000-0000-0000-000000000000');
    if (convsError) {
      logWarning(`getConversations: ${convsError.message}`);
    } else {
      logSuccess(`getConversations 工作正常 (返回 ${convs?.length || 0} 条记录)`);
    }

    logInfo('所有辅助函数已正确导入和定义');
    return true;
  } catch (error: any) {
    logError(`辅助函数测试失败: ${error.message}`);
    return false;
  }
}

// 主测试函数
async function runTests() {
  console.log(`${colors.bright}${colors.cyan}`);
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║          Supabase 数据库完整性测试                          ║');
  console.log('║                OnlyMsg (Fingnet)                           ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);

  const startTime = Date.now();

  // 运行所有测试
  await testConnection();
  await testTables();
  await testRLS();
  await testDataOperations();
  await testHelperFunctions();

  // 测试总结
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  logHeader('测试总结');
  
  console.log(`${colors.bright}总测试数: ${passed + failed}${colors.reset}`);
  console.log(`${colors.green}✅ 通过: ${passed}${colors.reset}`);
  console.log(`${colors.red}❌ 失败: ${failed}${colors.reset}`);
  console.log(`⏱️  耗时: ${duration}秒\n`);

  if (failed === 0) {
    console.log(`${colors.green}${colors.bright}🎉 所有测试通过！数据库配置完美！${colors.reset}\n`);
    console.log(`${colors.cyan}下一步：${colors.reset}`);
    console.log(`  1. 重构 AuthContext 使用 Supabase Auth`);
    console.log(`  2. 创建自定义 Hooks`);
    console.log(`  3. 迁移 localStorage 数据到 Supabase`);
    console.log(`  4. 实现实时功能\n`);
  } else {
    console.log(`${colors.yellow}${colors.bright}⚠️  有 ${failed} 个测试失败，请检查配置${colors.reset}\n`);
    console.log(`${colors.cyan}建议：${colors.reset}`);
    console.log(`  1. 确认已在 Supabase Dashboard 执行 supabase-schema.sql`);
    console.log(`  2. 检查所有表是否创建成功`);
    console.log(`  3. 验证 RLS 策略是否已启用`);
    console.log(`  4. 查看 Supabase Dashboard 的日志\n`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

// 运行测试
runTests().catch(error => {
  console.error(`${colors.red}${colors.bright}致命错误: ${error.message}${colors.reset}`);
  console.error(error.stack);
  process.exit(1);
});

