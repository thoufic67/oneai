// @file chrome-extension/background.js
// @description Background script for Aiflo Chrome extension. Listens for the 'toggle-sidebar' command and sends a message to the content script in the active tab to toggle the sidebar.

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-sidebar") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "toggleSidebar" });
      }
    });
  }
});
