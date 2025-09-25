// 强制重新初始化IndexedDB数据的脚本
console.log('🔄 开始强制重新初始化IndexedDB数据...');

// 1. 清空IndexedDB
if (window.indexedDB) {
  const deleteReq = indexedDB.deleteDatabase('OnlyTextDB');
  deleteReq.onsuccess = function () {
    console.log('✅ IndexedDB数据库已清空');
    
    // 2. 刷新页面重新初始化
    console.log('🔄 正在刷新页面重新初始化...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };
  
  deleteReq.onerror = function (event) {
    console.error('❌ 清空IndexedDB失败:', event);
  };
  
  deleteReq.onblocked = function () {
    console.warn('⚠️ IndexedDB被阻塞，请关闭所有相关标签页后重试');
  };
} else {
  console.error('❌ 浏览器不支持IndexedDB');
}
