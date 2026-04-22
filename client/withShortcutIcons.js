const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * A local Expo Config Plugin to copy custom shortcut icons to Android's native resource folder.
 */
const withShortcutIcons = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const { projectRoot } = config.modRequest;
      
      // List of icons to copy from assets to drawable resources
      const icons = [
        { src: 'assets/AddSavings.png', dest: 'shortcut_add_savings.png' }, 
        { src: 'assets/Deposite.png', dest: 'shortcut_withdraw.png' }, 
        { src: 'assets/AddGoal.png', dest: 'shortcut_add_goal.png' },
      ];

      for (const { src, dest } of icons) {
        const srcPath = path.join(projectRoot, src);
        const resDir = path.join(projectRoot, 'android/app/src/main/res/drawable');
        const destPath = path.join(resDir, dest);

        if (fs.existsSync(srcPath)) {
          // Ensure the destination directory exists
          if (!fs.existsSync(resDir)) {
            fs.mkdirSync(resDir, { recursive: true });
          }
          
          // Copy the file
          fs.copyFileSync(srcPath, destPath);
          console.log(`[withShortcutIcons] Copied ${src} to ${destPath}`);
        } else {
          console.warn(`[withShortcutIcons] Source file not found: ${srcPath}`);
        }
      }
      
      return config;
    },
  ]);
};

module.exports = withShortcutIcons;
