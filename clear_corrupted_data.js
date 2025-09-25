// 清理损坏的认证数据
console.log('🧹 开始清理损坏的认证数据...');

// 检查localStorage中的认证token
const authToken = localStorage.getItem('auth_token');
if (authToken && (authToken.includes('¢') || authToken.includes('Ü') || authToken.includes('µ') || !authToken.includes('.'))) {
  console.log('⚠️ 发现损坏的auth_token:', authToken.substring(0, 20) + '...');
  localStorage.removeItem('auth_token');
  console.log('✅ 已清理auth_token');
}

// 检查refresh_token
const refreshToken = localStorage.getItem('refresh_token');
if (refreshToken && (refreshToken.includes('¢') || refreshToken.includes('Ü') || refreshToken.includes('µ') || !refreshToken.includes('.'))) {
  console.log('⚠️ 发现损坏的refresh_token:', refreshToken.substring(0, 20) + '...');
  localStorage.removeItem('refresh_token');
  console.log('✅ 已清理refresh_token');
}

// 清理用户数据
localStorage.removeItem('user_data');

console.log('🎉 数据清理完成！请刷新页面。');
