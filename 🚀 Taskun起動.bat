@echo off
chcp 65001 >nul
title 🚀 Taskun - タスク管理アプリ起動中...

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    🚀 Taskun 起動中...                      ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo ⚡ 開発サーバーを起動しています...
echo 📱 ブラウザが自動で開きます
echo ⏰ 少々お待ちください...
echo.

:: 現在のディレクトリをTaskunプロジェクトに変更
cd /d "%~dp0"

:: 依存関係のチェック
if not exist "node_modules" (
    echo 📦 依存関係をインストールしています...
    call npm install
    if errorlevel 1 (
        echo ❌ 依存関係のインストールに失敗しました
        pause
        exit /b 1
    )
)

:: 開発サーバー起動
echo ✅ Taskunを起動します！
echo 🌐 URL: http://localhost:5174/taskun/
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📝 使用方法:
echo   • タスクを追加: 右上の ➕ ボタン
echo   • 時間変更: タスクをドラッグ
echo   • 完了マーク: タスクをクリック
echo   • 終了: Ctrl + C または このウィンドウを閉じる
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

call npm run dev

:: エラーハンドリング
if errorlevel 1 (
    echo.
    echo ❌ Taskunの起動に失敗しました
    echo 🔧 トラブルシューティング:
    echo   1. Node.jsがインストールされているか確認してください
    echo   2. プロジェクトディレクトリが正しいか確認してください
    echo   3. ポート5173/5174が使用中でないか確認してください
    echo.
    pause
    exit /b 1
)

echo.
echo 👋 Taskunを終了しました
pause 