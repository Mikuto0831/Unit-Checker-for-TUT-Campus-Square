// Campus Square Shortcut Links Extension - Service Worker
// 東京工科大学 Campus Square ポータルページ用ショートカットリンク機能

console.log('Campus Square Shortcut Links Extension - Service Worker loaded');

// 拡張機能のインストール時
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Extension installed');
    } else if (details.reason === 'update') {
        console.log('Extension updated');
    }
});

// 拡張機能の起動時
chrome.runtime.onStartup.addListener(() => {
    console.log('Extension started');
});