import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

import App from './App';
import { widgetTaskHandler } from './src/widgets/widget-task-handler';

// Register Android Widget Task Handler if on Android platform
if (Platform.OS === 'android') {
  try {
    const { registerWidgetTaskHandler } = require('react-native-android-widget');
    registerWidgetTaskHandler(widgetTaskHandler);
  } catch (e) {
    console.warn('[index.ts] registerWidgetTaskHandler not available in this environment:', e);
  }
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

