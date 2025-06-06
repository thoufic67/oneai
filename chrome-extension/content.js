// @file chrome-extension/content.js
// @description Content script for Aiflo Chrome extension. Injects a floating button and sidebar iframe into every page. Handles button click and message from background script to toggle the sidebar.

const AIFLO_SIDEBAR_ID = "aiflo-sidebar";
const AIFLO_BUTTON_ID = "aiflo-sidebar-toggle-btn";
const AIFLO_IFRAME_URL = "https://aiflo.space/new";

function createSidebar() {
  if (document.getElementById(AIFLO_SIDEBAR_ID)) return;
  const sidebar = document.createElement("div");
  sidebar.id = AIFLO_SIDEBAR_ID;
  sidebar.innerHTML = `
    <div class="aiflo-sidebar-header">
      <button id="aiflo-sidebar-close-btn" title="Close">×</button>
    </div>
    <iframe src="${AIFLO_IFRAME_URL}" class="aiflo-sidebar-iframe" frameborder="0"></iframe>
  `;
  document.body.appendChild(sidebar);
  document.getElementById("aiflo-sidebar-close-btn").onclick = removeSidebar;
}

function removeSidebar() {
  const sidebar = document.getElementById(AIFLO_SIDEBAR_ID);
  if (sidebar) sidebar.remove();
}

function toggleSidebar() {
  if (document.getElementById(AIFLO_SIDEBAR_ID)) {
    removeSidebar();
  } else {
    createSidebar();
  }
}

function injectButton() {
  if (document.getElementById(AIFLO_BUTTON_ID)) return;
  const btn = document.createElement("button");
  btn.id = AIFLO_BUTTON_ID;
  btn.title = "Open Aiflo Sidebar";
  btn.innerText = "Aiflo";
  btn.className = "aiflo-sidebar-toggle-btn";
  btn.onclick = toggleSidebar;
  document.body.appendChild(btn);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.action === "toggleSidebar") {
    toggleSidebar();
  }
});

// Inject button on page load
document.addEventListener("DOMContentLoaded", injectButton);
// Fallback for SPA sites
document.addEventListener("readystatechange", injectButton);
setTimeout(injectButton, 1000);
