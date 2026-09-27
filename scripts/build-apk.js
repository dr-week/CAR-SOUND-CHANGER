#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const shouldInstall = process.argv.includes('--install');
const skipCheck = process.argv.includes('--skip-check');
const projectRoot = process.cwd();
const distDir = path.join(projectRoot, 'dist');
const assetsDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'assets');
const androidDir = path.join(projectRoot, 'android');

function step(msg) {
  console.log(`\n📦 [Step] ${msg}`);
}

function run(cmd, cwd = projectRoot) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

try {
  // 1. Quality Check
  if (!skipCheck) {
    step('1. Type Checking & Quality Gate');
    run('npm run check');
  }

  // 2. Web Application Compilation
  step('2. Compiling Vue 3 / Vite Web Application');
  run('npm run build');

  // 3. Asset Synchronization
  step('3. Syncing assets into Android App assets directory');
  if (fs.existsSync(assetsDir)) {
    fs.rmSync(assetsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(assetsDir, { recursive: true });
  fs.cpSync(distDir, assetsDir, { recursive: true });
  console.log(`✓ Copied ${fs.readdirSync(assetsDir).length} files/directories into ${path.relative(projectRoot, assetsDir)}`);

  // 4. Gradle APK Assembly
  step('4. Compiling Android Debug APK via Gradle');
  const isWin = process.platform === 'win32';
  const gradlew = isWin ? 'gradlew.bat' : './gradlew';
  const jdkPath = 'C:/Users/disha/Documents/CODES/studio/fileMAN/file-explorer-android/.jdk/jdk-17.0.20.1+1';

  if (fs.existsSync(jdkPath)) {
    process.env.JAVA_HOME = jdkPath;
  }

  run(`${gradlew} assembleDebug --console plain`, androidDir);

  const apkPath = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  if (fs.existsSync(apkPath)) {
    const sizeMb = (fs.statSync(apkPath).size / (1024 * 1024)).toFixed(2);
    console.log(`\n🎉 Android APK Built Successfully!`);
    console.log(`📍 Path: ${apkPath}`);
    console.log(`⚖️  Size: ${sizeMb} MB\n`);

    if (shouldInstall) {
      step('5. Installing APK on connected device via ADB');
      run(`adb install -r "${apkPath}"`);
      console.log('✓ Successfully flashed onto Android device!');
    }
  }
} catch (err) {
  console.error(`\n❌ APK Build Pipeline Failed:`, err.message);
  process.exit(1);
}
