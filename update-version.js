// 版本管理模块：读取/递增 version.json，生成版本字符串
const fs = require('fs');
const path = require('path');

const versionPath = path.join(__dirname, 'version.json');

function readVersion() {
  return JSON.parse(fs.readFileSync(versionPath, 'utf8'));
}

function writeVersion(version) {
  fs.writeFileSync(versionPath, JSON.stringify(version, null, 2) + '\n');
}

// 递增版本号（patch +1，build 重置为 0）并写回 version.json
function incrementVersion() {
  const version = readVersion();
  version.patch = (version.patch || 0) + 1;
  version.build = 0;
  writeVersion(version);
  return version;
}

// 生成形如 "v1.1.3" 的版本字符串
function getVersionString() {
  const version = readVersion();
  return `v${version.major}.${version.minor}.${version.patch}`;
}

module.exports = { incrementVersion, getVersionString };
