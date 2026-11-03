<div align="center">
    <img src="./assets/images/icon.png" alt="Hydra" width="100" style="border-radius: 22px; overflow: hidden;"/> <br/>
    <h1>Hydra</h1> <br/>
    <p>A mobile reddit client built with Expo that doesn't require an API key to function.</p>
<br />
<a href="https://github.com/dmilin1/hydra/blob/master/LICENSE"><img alt="License" src="https://badgen.net/badge/license/AGPL-3.0"></a>
<a href="https://discord.gg/ypaD4KYJ3R"><img alt="Join the community on Discord" src="https://img.shields.io/discord/1257191666771558492.svg"></a>
</div>
<br />


## 🚀 Getting Started

### Prerequisites
Before you begin, make sure you have the following installed on your system:

- **Node.js** 22.13+ or 24.3+: [Download Node.js](https://nodejs.org/)
- **Xcode** (iOS): [Install Xcode](https://docs.expo.dev/get-started/set-up-your-environment/?platform=ios&device=physical&mode=development-build&buildEnv=local#set-up-an-ios-device-with-a-development-build)
- **Android Studio** (Android): [Install Android Studio](https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=physical&mode=development-build&buildEnv=local)
- **Homebrew**: [Install Homebrew](https://brew.sh/) (macOS only)

The Expo CLI ships with the project, so there's nothing to install globally. Use it through `npx expo`.

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
SENTRY_DISABLE_AUTO_UPLOAD=true npx expo run:ios
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
- If native builds get into a bad state, regenerate the `ios` and `android` directories:
  ```bash
  npx expo prebuild --clean
  ```

### ✨ Additional Tips
- For hot reloading, simply press `r` in the terminal where Expo is running.
- Before opening a PR, run `npm run lint:fix` to lint and format your changes, and `npm run tsc` to type-check them.

## ⭐ Star History

<a href="https://www.star-history.com/?repos=dmilin1%2Fhydra&type=date&legend=top-left">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=dmilin1/hydra&type=date&legend=top-left&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=dmilin1/hydra&type=date&legend=top-left" />
    <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=dmilin1/hydra&type=date&legend=top-left" />
  </picture>
</a>
