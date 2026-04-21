# Moe VN Maker

A cross-platform visual novel creation studio built with React Native 0.74.5, targeting the Tuesday.js engine. Supports Android and iOS.

## Architecture

- **Framework**: React Native 0.74.5 + TypeScript
- **State**: Zustand
- **Navigation**: React Navigation
- **Engine**: Tuesday.js (embedded via WebView)
- **Native**: C++ LuauBridge (Luau → Tuesday.js JSON compiler)
- **Storage**: react-native-mmkv

## Project Structure

```
src/           React Native app (screens, components, store, utils)
cpp/           Native C++ layer (LuauBridge, TuesdayEmitter)
android/       Android project
ios/           iOS project (target: MoeShell)
tuesday-js/    Tuesday.js engine submodule
```

## Key Files

- `src/App.tsx` — App entry point
- `src/navigation/AppNavigator.tsx` — Navigation tree
- `src/types/TuesdayProjectJson.ts` — Tuesday.js data contract
- `cpp/luau_bridge.cpp` — Luau→JSON compilation bridge
- `android/app/src/main/AndroidManifest.xml` — Android manifest
- `ios/MoeShell/Info.plist` — iOS app configuration

## Build Notes

### Android

- `manifestPlaceholders = [usesCleartextTraffic: "true"]` is set in `defaultConfig` and per build-type in `android/app/build.gradle`. This is required because `AndroidManifest.xml` uses `${usesCleartextTraffic}` as a placeholder.
- Debug builds: cleartext traffic = `true` (needed for Metro bundler)
- Release builds: cleartext traffic = `false` (security)

### iOS

- Target: `MoeShell`
- Podfile uses `use_react_native!` standard setup
- `NSAllowsArbitraryLoads` is `false`; local networking is allowed via `NSAllowsLocalNetworking`

## Running

```bash
npm start          # Metro bundler
npm run android    # Run on Android device/emulator
npm run ios        # Run on iOS simulator
npm run typecheck  # TypeScript check
```
