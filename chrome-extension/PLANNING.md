# Aiflo Chrome Extension Planning

## Overview

This document outlines the plan to implement the Aiflo webapp as a Chrome extension sidebar, similar to the Gemini sidebar in Gmail. The extension will allow users to open the Aiflo webapp in a persistent right sidebar on any website, triggered by a floating button or keyboard shortcut (Cmd+M/Ctrl+M). The sidebar always loads the `/new` route (redirects to `/c` for new chats).

---

## Architecture Overview

- **Extension Type:** Manifest V3, content script injects UI into all pages.
- **Sidebar:** Iframe pointing to hosted Aiflo webapp `/new`.
- **Trigger:** Floating button (bottom right) or keyboard shortcut (Cmd+M/Ctrl+M).
- **Background Script:** Handles keyboard shortcut, communicates with content script.
- **Security:** Ensure Aiflo webapp allows embedding in iframe (CSP/X-Frame-Options).
- **Optional:** Button in sidebar to open full webapp in new tab.

---

## Task Breakdown

### 1. Preparation

- [ ] Confirm Aiflo webapp is deployed and allows iframe embedding.
- [ ] Decide on extension icon assets.

### 2. Extension Manifest

- [ ] Create `manifest.json` (MV3) with:
  - Content script
  - Background script
  - Command for keyboard shortcut
  - Permissions (`scripting`, `activeTab`, `host_permissions`)
  - Icons

### 3. Content Script

- [ ] Inject floating button at bottom right of every page.
- [ ] On button click, toggle sidebar.
- [ ] Inject sidebar as a fixed iframe (loads `/new` route).
- [ ] Add close button to sidebar.
- [ ] Listen for messages from background script to toggle sidebar (for keyboard shortcut).

### 4. Background Script

- [ ] Listen for `toggle-sidebar` command (Cmd+M/Ctrl+M).
- [ ] Send message to content script in active tab to toggle sidebar.

### 5. Styling

- [ ] Create `sidebar.css` for:
  - Floating button (z-index, shadow, round, hover)
  - Sidebar (fixed, right, full height, shadow, close button)
  - Responsive design

### 6. Testing

- [ ] Load extension as "unpacked" in Chrome.
- [ ] Test floating button, sidebar, and keyboard shortcut on various sites.
- [ ] Ensure `/new` always loads in sidebar and redirects to `/c` for new chats.
- [ ] Test sidebar close and re-open.
- [ ] Test on both Mac and Windows for shortcut compatibility.

### 7. (Optional) Full Webapp Button

- [ ] Add a button in the sidebar to open the full Aiflo webapp in a new tab.

### 8. Documentation

- [ ] Update `README.md` with:
  - How to build and load the extension
  - Usage instructions (button, shortcut)
  - Limitations (CSP, iframe, etc.)

### 9. Task Tracking

- [ ] Add this feature to `TASK.md` with today's date.
- [ ] Mark tasks as completed as you progress.
- [ ] Add any discovered sub-tasks to `TASK.md` under "Discovered During Work".

---

## Example Directory Structure

```
/chrome-extension
  /manifest.json
  /content.js
  /background.js
  /sidebar.css
  /icon16.png
  /icon48.png
  /icon128.png
  /PLANNING.md
```
