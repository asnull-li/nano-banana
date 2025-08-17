#!/usr/bin/env node

const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

// 读取 .env.development 文件
const envFile = path.join(__dirname, ".env.development");

if (!fs.existsSync(envFile)) {
  console.error("❌ .env.development 文件不存在");
  process.exit(1);
}

const envContent = fs.readFileSync(envFile, "utf8");
const envVars = {};

// 解析环境变量
envContent.split("\n").forEach((line) => {
  line = line.trim();
  if (line && !line.startsWith("#") && line.includes("=")) {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      // 移除首尾的引号
      let value = valueParts.join("=").trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      envVars[key.trim()] = value;
    }
  }
});

console.log(`📋 找到 ${Object.keys(envVars).length} 个环境变量`);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function updateEnvVar(key, value) {
  const environments = ["production", "preview", "development"];

  console.log(`\n🔄 处理变量: ${key}`);

  for (const env of environments) {
    try {
      // 删除现有变量
      console.log(`  🗑️  删除 ${env} 环境中的 ${key}`);
      try {
        execSync(`vercel env rm "${key}" ${env} --yes`, {
          stdio: "pipe",
          timeout: 30000,
        });
        console.log(`    ✅ 删除成功`);
      } catch (rmError) {
        console.log(`    ℹ️  变量不存在或删除失败，继续添加`);
      }

      // 短暂延迟以避免API限制
      await sleep(500);

      // 添加新变量
      console.log(`  ➕ 添加 ${key} 到 ${env} 环境`);

      // 使用临时文件来避免shell引号问题
      const tempFile = `/tmp/env_value_${Date.now()}.txt`;
      fs.writeFileSync(tempFile, value);

      try {
        execSync(`cat "${tempFile}" | vercel env add "${key}" ${env}`, {
          stdio: "pipe",
          timeout: 30000,
        });
        console.log(`    ✅ 添加成功`);
      } finally {
        // 清理临时文件
        try {
          fs.unlinkSync(tempFile);
        } catch (e) {}
      }

      // 短暂延迟
      await sleep(500);
    } catch (error) {
      console.error(`    ❌ 在 ${env} 环境更新失败:`, error.message);
      return false;
    }
  }

  console.log(`✅ ${key} 在所有环境更新成功`);
  return true;
}

async function main() {
  console.log("\n🚀 开始更新环境变量...\n");

  let successCount = 0;
  const totalVars = Object.keys(envVars).length;

  for (const [key, value] of Object.entries(envVars)) {
    const success = await updateEnvVar(key, value);
    if (success) {
      successCount++;
    }

    // 在每个变量之间添加延迟以避免API限制
    if (successCount < totalVars) {
      console.log("⏳ 等待 2 秒以避免API限制...");
      await sleep(2000);
    }
  }

  console.log(`\n🎉 环境变量更新完成！`);
  console.log(`✅ 成功: ${successCount}/${totalVars} 个变量`);
  console.log(`❌ 失败: ${totalVars - successCount}/${totalVars} 个变量`);
}

main().catch((error) => {
  console.error("\n💥 脚本执行失败:", error);
  process.exit(1);
});
