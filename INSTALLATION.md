# Installation Guide

Complete setup guide for the Car Sound Changer Android app.

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version`

2. **Java Development Kit (JDK 17)**
   - Download from [Oracle](https://www.oracle.com/java/technologies/downloads/)
   - Set JAVA_HOME environment variable

3. **Android Studio**
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install Android SDK (API Level 24-34)
   - Install Android SDK Build-Tools
   - Install Android Emulator (optional)

4. **React Native CLI**
   ```bash
   npm install -g react-native-cli
   ```

### Android SDK Setup

1. Open Android Studio → SDK Manager
2. Install required SDK platforms:
   - Android 14.0 (API 34) - Target
   - Android 7.0 (API 24) - Minimum

3. Install SDK Build Tools (latest version)

4. Set environment variables:
   ```bash
   # Windows (PowerShell)
   $env:ANDROID_HOME = "C:\Users\YourUsername\AppData\Local\Android\Sdk"
   $env:PATH += ";$env:ANDROID_HOME\platform-tools"
   $env:PATH += ";$env:ANDROID_HOME\tools"
   ```

## Project Setup

### 1. Clone/Create Project

```bash
cd c:\Users\disha\Documents\CODES\studio\carSOUNDMOD
```

### 2. Initialize React Native Project

```bash
# If starting fresh
npx react-native init CarSoundMod --template react-native-template-typescript

# Or initialize in current directory
npm init -y
```

### 3. Install Dependencies

```bash
# Core dependencies
npm install react-native
npm install typescript @types/react @types/react-native

# Navigation
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler react-native-reanimated

# Audio
npm install react-native-sound
npm install react-native-track-player

# GPS/Location
npm install react-native-geolocation-service

# Bluetooth & Audio Routing
npm install react-native-audio-routing

# State Management
npm install zustand

# UI Components
npm install react-native-paper
npm install react-native-vector-icons

# Permissions
npm install react-native-permissions

# Background Service
npm install react-native-background-actions

# Keep Screen On
npm install react-native-keep-awake

# Charts/Gauges
npm install react-native-svg
npm install react-native-circular-progress

# Dev Dependencies
npm install -D @types/react-native-vector-icons
npm install -D @react-native-community/eslint-config
npm install -D prettier
```

### 4. Link Native Modules (if needed)

```bash
# For React Native < 0.60
react-native link react-native-sound
react-native link react-native-geolocation-service
react-native link react-native-vector-icons

# For React Native >= 0.60, auto-linking works
cd android && ./gradlew clean && cd ..
```

### 5. Configure Android Permissions

Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- GPS & Location -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    
    <!-- Bluetooth -->
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
    
    <!-- Audio -->
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    
    <!-- Background Service -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    
    <!-- Internet (for debugging) -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <application>
        <!-- Your app configuration -->
    </application>
</manifest>
```

### 6. Configure Gradle

Edit `android/app/build.gradle`:

```gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "com.carsoundmod"
        minSdkVersion 24
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

## Development Setup

### 1. Start Metro Bundler

```bash
npm start
```

### 2. Run on Android Device/Emulator

```bash
# Run on connected device
npm run android

# Or
npx react-native run-android
```

### 3. Enable USB Debugging on Device

1. Go to Settings → About Phone
2. Tap "Build Number" 7 times
3. Go to Settings → Developer Options
4. Enable "USB Debugging"
5. Connect device via USB
6. Verify: `adb devices`

## Bluetooth Speaker Setup

### Physical Setup

1. **Pair Bluetooth Speaker**
   - Turn on Bluetooth speaker
   - Go to Android Settings → Bluetooth
   - Pair your speaker

2. **Car Audio System** (Alternative)
   - Connect phone to car via Bluetooth
   - Ensure "Media Audio" is enabled for the connection

### App Configuration

The app will automatically:
- Detect connected Bluetooth devices
- Route audio to Bluetooth when connected
- Fall back to phone speaker when disconnected

## Troubleshooting

### Common Issues

#### 1. Metro Bundler Issues
```bash
# Clear cache
npm start -- --reset-cache

# Clear watchman
watchman watch-del-all

# Clear gradle
cd android && ./gradlew clean && cd ..
```

#### 2. Android Build Errors
```bash
# Clear build
cd android
./gradlew clean
cd ..

# Rebuild
npm run android
```

#### 3. GPS Not Working
- Ensure location permissions are granted
- Enable GPS in device settings
- Test outdoors for better signal

#### 4. Bluetooth Audio Not Working
- Check Bluetooth permissions
- Ensure "Media Audio" is enabled for Bluetooth device
- Restart app after connecting Bluetooth

#### 5. Audio Latency Issues
- See [PERFORMANCE.md](./docs/PERFORMANCE.md) for optimization tips
- Reduce audio buffer size in configuration

### Getting Help

- Check [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
- Review [FAQ](./docs/FAQ.md)
- Check GitHub Issues

## Next Steps

After installation:

1. Read [ARCHITECTURE.md](./docs/ARCHITECTURE.md) to understand the system
2. Review [CONFIGURATION.md](./docs/CONFIGURATION.md) to customize settings
3. Check [UI_DESIGN.md](./docs/UI_DESIGN.md) for UI customization
4. See [BLUETOOTH_AUDIO.md](./docs/BLUETOOTH_AUDIO.md) for audio setup details

## Verification

Test that everything works:

```bash
# Check dependencies
npm list

# Verify Android connection
adb devices

# Run tests
npm test

# Check TypeScript
npx tsc --noEmit
```

---

**Ready to develop!** Start with `npm run android` to launch the app.
