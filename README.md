# 📱 Hydra
A Reddit reader app built with Expo and Apollo that doesn't require an API key to function.

## 🚀 Getting Started

### Prerequisites
Before you begin, make sure you have the following installed on your system:

- **Node.js**: [Download Node.js](https://nodejs.org/)
- **Xcode**: [Install Xcode](https://docs.expo.dev/get-started/set-up-your-environment/?platform=ios&device=physical&mode=development-build&buildEnv=local#set-up-an-ios-device-with-a-development-build)
- **Homebrew**: [Install Homebrew](https://brew.sh/) (macOS only)
- **Expo CLI**: Install globally with `npm install -g expo-cli`

### 1. Clone the Repository
```bash
git clone https://github.com/dmilin1/hydra.git
cd hydra
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Install Additional Tools (macOS)
Make sure you have these tools installed if you're building the app locally:

```bash
brew install cocoapods
brew install watchman
```

### 4. Run the App
To launch the app in the iOS Simulator:

```bash
npx expo run:ios
```

> 🛠 **Note**: If you're targeting Android, use:
> ```bash
> npx expo run:android
> ```

### 🔧 Troubleshooting
If you encounter issues, try the following:

- Ensure your Xcode, Android Studio, and CLI tools are up to date.
- Clear Expo cache:
  ```bash
  npx expo start -c
  ```
- If the iOS build fails, cd to the ios directory and run:
  ```bash
  pod install --repo-update
  ```

### ✨ Additional Tips
- For hot reloading, simply press `r` in the terminal where Expo is running.
