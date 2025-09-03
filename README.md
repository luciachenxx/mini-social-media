# Social Snap

一個現代化的即時社交媒體平台，使用 React、TypeScript 和 Firebase 構建。

## 專案特色

- 🔐 多重身份驗證（Google OAuth、匿名登入、示範帳號）
- ⚡ 即時資料同步與更新
- 💬 三層嵌套留言回覆系統
- ❤️ 智慧按讚功能與用戶追蹤
- 🌙 深色/淺色主題切換
- 📱 完全響應式設計
- 🎨 流暢的動畫效果

## 技術棧

### 前端
- **React 19** - 現代化 UI 框架
- **TypeScript** - 型別安全的 JavaScript
- **Tailwind CSS** - 實用優先的 CSS 框架
- **Framer Motion** - 動畫庫
- **React Hot Toast** - 通知系統

### 後端服務
- **Firebase Authentication** - 用戶認證
- **Firebase Firestore** - NoSQL 資料庫
- **Firebase Security Rules** - 資料安全控制

### 開發工具
- **Create React App** - 專案建置工具
- **ESLint** - 程式碼品質檢查
- **npm** - 套件管理

## 功能展示

### 身份驗證
- Google OAuth 一鍵登入
- 匿名訪客模式
- 帳號連結功能
- 示範帳號快速體驗

### 社交功能
- 發佈文字和圖片貼文
- 即時按讚/取消按讚
- 多層級留言系統
- @用戶提及功能
- #標籤分類

### 用戶體驗
- 即時資料更新（無需重新整理）
- 深色模式支援
- 響應式設計（桌面/平板/手機）
- 流暢的頁面轉場動畫

## 快速開始

### 環境需求
- Node.js 16.0 或更高版本
- npm 或 yarn

### 安裝步驟

1. **複製專案**
```bash
git clone https://github.com/your-username/social-snap.git
cd social-snap
```

2. **安裝相依套件**
```bash
npm install
```

3. **設定 Firebase**
   - 在 [Firebase Console](https://console.firebase.google.com/) 建立新專案
   - 啟用 Authentication 和 Firestore Database
   - 複製 Firebase 配置到 `src/services/firebase.js`

4. **啟動開發伺服器**
```bash
npm start
```

5. **開啟瀏覽器訪問** `http://localhost:3000`
