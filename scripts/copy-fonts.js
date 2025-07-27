#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Cross-platform script to copy font files from src/ui/assets/fonts to public/fonts
 * This runs before each build to ensure fonts are available at runtime
 */

const sourceDir = path.join(__dirname, '..', 'src', 'ui', 'assets', 'fonts');
const targetDir = path.join(__dirname, '..', 'public', 'fonts');

console.log('📦 Copying fonts to public directory...');

// Function to recursively remove directory contents
function emptyDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    console.log('🧹 Emptying existing public/fonts directory...');
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }
    }
  } else {
    console.log('📁 Creating public/fonts directory...');
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Function to copy files from source to target
function copyFiles(source, target) {
  if (!fs.existsSync(source)) {
    console.error('❌ Source directory does not exist:', source);
    process.exit(1);
  }

  const files = fs.readdirSync(source);
  console.log(`📋 Copying ${files.length} files from src/ui/assets/fonts...`);

  for (const file of files) {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);
    
    const stat = fs.statSync(sourcePath);
    if (stat.isFile()) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ Copied: ${file}`);
    }
  }
}

try {
  // Empty the target directory or create it
  emptyDirectory(targetDir);
  
  // Copy all files from source to target
  copyFiles(sourceDir, targetDir);
  
  // List what was copied
  console.log('✅ Files in public/fonts:');
  const copiedFiles = fs.readdirSync(targetDir);
  copiedFiles.forEach(file => {
    const filePath = path.join(targetDir, file);
    const stats = fs.statSync(filePath);
    console.log(`   ${file} (${Math.round(stats.size / 1024)}KB)`);
  });
  
  console.log('🎉 Font copy complete!');
} catch (error) {
  console.error('❌ Error copying fonts:', error.message);
  process.exit(1);
}
