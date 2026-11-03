// 构建脚本
const fs = require('fs');
const path = require('path');
const { incrementVersion, getVersionString } = require('./update-version');

// 读取 index.html 文件
function readIndexHtml() {
  const indexPath = path.join(__dirname, 'index.html');
  return fs.readFileSync(indexPath, 'utf8');
}

// 写入 index.html 文件
function writeIndexHtml(content) {
  const indexPath = path.join(__dirname, 'index.html');
  fs.writeFileSync(indexPath, content);
}

// 更新 index.html 中的版本号
function updateVersionInHtml() {
  const html = readIndexHtml();
  const versionString = getVersionString();
  const updatedHtml = html.replace(/版本: v\d+\.\d+\.\d+/, `版本: ${versionString}`);
  writeIndexHtml(updatedHtml);
  console.log(`已更新 index.html 中的版本号至: ${versionString}`);
}

// 主函数
function main() {
  console.log('开始构建...');
  
  // 递增版本号
  const newVersion = incrementVersion();
  console.log(`版本已递增至: v${newVersion.major}.${newVersion.minor}.${newVersion.patch}`);
  
  // 更新 index.html 中的版本号
  updateVersionInHtml();
  
  console.log('构建完成！');
}

// 执行主函数
if (require.main === module) {
  main();
}
