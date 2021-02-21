// ==UserScript==
// @name        Pedidosya check shop status - pedidosya.com.do
// @icon        https://live.pystatic.com/webassets/favicon-8f0ea2519d2575076b739999329af939.ico
// @namespace   Violentmonkey Scripts
// @match       https://www.pedidosya.com.do/restaurantes/*/*
// @grant       none
// @version     1.0
// @author      -
// @description 9/17/2020, 12:38:28 PM
// ==/UserScript==

// ============================================================================
// Config variables
// ============================================================================

// When the shop is closed, it will wait this minutes to check for change:
const isClosedWait = 3;
// When the shop is open, it will wait this minutes to check for change:
const isOpenWait = 1;

// Style
const notificationIcon = document.querySelector("#profileHeader figure img")
  .src;
const notificationBadge =
  "https://live.pystatic.com/webassets/favicon-8f0ea2519d2575076b739999329af939.ico";

// ============================================================================
// Purpose, notes & description
// ============================================================================

// Notes:
// This script will ask to enable notifications for the website it works on.
// Notifications are for letting you know when the status changes and what
// will happen. It won't work if notification permission isn't granted.

// Purpose:
// Sometimes pedidosya closes shops temporarily for unknown intervals of time,
// can be an hour, half an hour or few minutes. This tool automates checking
// when the shop is open again and notifying the user of it. You can rest
// easy, this script will do the work for you.

// This event is unpredictable, it may happen that it will close a shop while
// you are looking at the menu or about to place an order. Reasons they do 
// this may be because of the local weather, not enough people online
// working for delivery and/or other mysterious reasons.

// This script will notify you when a shop closes and when it opens, as long
// as you keep the tab open and pinned so it isn't suspended by the browser.

// What this script do:
// iT Checks the shop for a change of status. If it closes or opens,
// it will notify you of the change:
// - When the shop is open, it will check if the status has changed to close.
// - When the shop is closed, it will check if the status has changed to open.
// - When it detects a change in status, it will notify the user.

// The script is stateless.

// ============================================================================
// Main
// ============================================================================

const initialStatus = JSON.parse(
  document.querySelector("input[name=googleTrackRestaurantData]").value
);

// If you entered a closed shop, you'd want to know if it is back open
if (!initialStatus.shopOpen) {
  notify(`Closed: ${initialStatus.shopName}`, {
    body: `Checking every ${isClosedWait} minutes. I\'ll notify when it's back. Pin this tab to prevent it from being suspended.`,
  });
}

startTimeout();

// ============================================================================
// Functions
// ============================================================================

async function backgroundCheck() {
  const status = await fetchShopStatus();

  // If status changed, communicate and reload the site
  if (initialStatus.shopOpen !== status.shopOpen) {
    if (status.shopOpen)
      notify(`Open: ${status.shopName}`, {
        body: "It's back open! Reloading so you can place an order.",
      });

    // If it changed to close, it will notify the user upon starting that it will start cheking for when it is open.
    reload();
  } else {
    // Keep checking
    startTimeout();
  }
}

function fetchShopStatus() {
  return fetch(location.href, { method: "GET" })
    .then((response) => {
      if (response.ok) {
        return response.text();
      } else
        notify(`HTTP error: ${response.status}`, {
          body: initialStatus.shopName,
        });
    })
    .then((text) => {
      return parseShopObject(text);
    })
    .catch((error) => {
      console.log(error);
    });
}

function notify(title, opt = {}) {
  // Check browser support
  if (!("Notification" in window)) {
    alert("This browser does not support notifications.");
    return;
  }

  // Check whether notification permissions have already been granted
  if (Notification.permission === "granted") {
    new Notification(title, {
      badge: notificationBadge,
      icon: notificationIcon,
      ...opt,
    });
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      if (permission === "granted") {
        new Notification("Notifications enabled.");
      }
    });
  }
}

// Returns a JSON with the shop's data
function parseShopObject(text) {
  const startStr = 'name="googleTrackRestaurantData" value="';
  const start = text.indexOf(startStr) + startStr.length;
  const end = text.indexOf(
    '" data-auto="gtm_restaurant_data" id="googleTrackRestaurantData" />'
  );
  return JSON.parse(text.substring(start, end).replace(/&quot;/g, '"')); // Unescape HTML entity from the string
}

function reload() {
  location.reload(true);
}

function startTimeout() {
  setTimeout(
    backgroundCheck,
    (initialStatus.shopOpen ? isOpenWait : isClosedWait) * 60000
  );
}
