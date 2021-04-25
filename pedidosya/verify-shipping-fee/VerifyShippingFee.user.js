// ==UserScript==
// @name          Verify shipping actually free - pedidosya.com.do
// @icon          https://live.pystatic.com/webassets/favicon-8f0ea2519d2575076b739999329af939.ico
// @namespace     Violentmonkey Scripts
// @match         https://www.pedidosya.com.do/restaurantes/*
// @exclude-match https://www.pedidosya.com.do/restaurantes/*/*
// @grant         none
// @version       1.0
// @author        -
// @description   2/21/2021, 3:36:29 PM
// ==/UserScript==

if (document.readyState != 'loading') {
    injectButtons();
};

function injectButtons() {
  let nodeList = document.querySelectorAll('.restaurant-wrapper.peyaCard');
  nodeList.forEach((i) => {
    const btn = createButton();
    
    btn.addEventListener('click', async (event) => {
      event.stopImmediatePropagation();
      
      const shippingEl = i.querySelector('.shipping');
      
      const loadingIndicatorId = appendLoadingIndicator(shippingEl);
      
      const data = await fetchShop(i.dataset.url);
      
      document.getElementById(loadingIndicatorId).remove();
      
      i.querySelector('.shipping').appendChild(
        document.createTextNode(`Actual: $ ${data.shopDeliveryFee}`)
      );
    });
       
    i.appendChild(btn);
  });
}

function createButton() {
  // const styleColor = 'background:#f52f41;color:#fff;border:0;padding:15px;';
  const styleLayout = 'position:absolute;top:0;right:0;z-index:9999;';
  const btn = document.createElement('button');

  btn.style.cssText = styleLayout; //+ styleColor;
  btn.setAttribute('type', 'button');
  btn.setAttribute('class', 'button');
  btn.innerText = 'Check actual shipping fee';
 
  return btn;
}

function appendLoadingIndicator(element) {
  const span = document.createElement('span');
  span.setAttribute('id', 'iAmLoading'); // a hook to remove it later
  span.innerText = 'Loading...';
  
  element.appendChild(span)
  
  return 'iAmLoading';
}

async function fetchShop(url) {
  return fetch(url, { method: 'GET' })
    .then(response => {
      if (response.ok) return response.text();
    })
    .then(text => {
      return parseShopObject(text);
    })
    .catch(error => { console.log(error) });
}

// Returns a JSON with the shops data
// Alternative methods:
// There's another input hidden with another json that also has this data:
// <input type="hidden" name="googleTrackCartData" value="{... shipping&quot;:37, ...}'>
// <script id="googlePlaceActionsScript" type="application/ld+json"> it's here as 'price'
function parseShopObject(text) {
  const startStr = 'name="googleTrackRestaurantData" value="';
  const start = text.indexOf(startStr) + startStr.length;
  const end = text.indexOf('" data-auto="gtm_restaurant_data" id="googleTrackRestaurantData" />');
  return JSON.parse( text.substring(start, end).replace(/&quot;/g, '"') ); // Unescape HTML entity from the string
}

