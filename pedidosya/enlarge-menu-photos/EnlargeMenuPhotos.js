// ==UserScript==
// @name        Enlarge menu photos - pedidosya.com.do
// @icon        https://live.pystatic.com/webassets/favicon-8f0ea2519d2575076b739999329af939.ico
// @namespace   Violentmonkey Scripts
// @match       https://www.pedidosya.com.do/restaurantes/*/*
// @grant       none
// @version     1.0
// @author      -
// @description 3/2/2021, 12:28:28 PM
// ==/UserScript==

// Supports Restaurants on Desktop version

// ============================================================================
// CSS
// ============================================================================

addStyle(`
#menu ul li.product:before { width: 0; height: 0; }

.zzoom:hover { cursor: zoom-in; }

#zzoom-modal {
  color: #000;
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(255,255,255,0.93);
}

#zzoom-modal__close {
  cursor: pointer;
  color: #fff;
  font-size: 64px;
  font-weight: bold;
  line-height: 1;
  background: #f52f41;
  position: absolute;
  right: 12%;
  top: 0;
  z-index: 101;
  padding: 10px;
  border-radius: 0 0 4px 4px;
}

#zzoom-modal__figure {
  min-width: 460px;
  min-height: 256px;
  height: 85%;
  width: 50%;
  overflow: hidden;
  position: relative;
  text-align: center;
  background: #fff;
  background-image: url("data:image/svg+xml;utf8,<svg width='38' height='38' viewBox='0 0 38 38' xmlns='http://www.w3.org/2000/svg' stroke='%23f52f41'><g fill='none' fill-rule='evenodd'><g transform='translate(1 1)' stroke-width='2'><circle stroke-opacity='.5' cx='18' cy='18' r='18'/><path d='M36 18c0-9.94-8.06-18-18-18'><animateTransform attributeName='transform' type='rotate' from='0 18 18' to='360 18 18' dur='1s' repeatCount='indefinite'/></path></g></g></svg>");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 64px;
}

#zzoom-modal__img {
  top: 0;
  left: 0;
  position: absolute;
  width: 100%;
  right: 0;
  bottom: 0;
  margin: auto;
}

#zzoom-modal__caption {
  width: 100%;
  padding-bottom: 4px;
  position: relative;
  z-index: 102;
  background: #fff;
}

#zzoom-modal__caption div:first-child {
  text-align: left;
  width: 71%;
  margin: 4px 40px 0 4px;
}

#zzoom-modal__caption div {
  display: inline-block;
  vertical-align: middle;
}

#zzoom-modal__caption .price {
  text-align: right;
  margin-right: 4px;
  width: 22%;
}

#zzoom-modal__caption .name,
#zzoom-modal__caption .price { font-size: 1.5rem; }
#zzoom-modal__caption .description { font-size: 1rem; }

#zzoom-modal__caption .price .discounted-price {
  font-size: 1.8rem;
  margin-right: 4px;
}

#zzoom-modal__caption .price .has-discount {
  color: #999;
  text-decoration: line-through;
}

#zzoom-model__close:hover,
#zzoom-model__close:focus {
  color: #bbb;
}

#zzoom-modal.modalOpen {
  display: flex;
}

#zzoom-modal,
#zzoom-modal__close {
  transition: 0.1s;
}

#zzoom-modal__img,
#zzoom-modal__caption {  
  animation-name: zoom;
  animation-duration: 0.1s;
}

@keyframes zoom {
  from {transform: scale(0.5)} 
  to {transform: scale(1)}
}

body.no-scroll { overflow: hidden !important; }
`);


// ============================================================================
// Configuration & execution
// ============================================================================

const triggerClass = 'zzoom';

const state = {
  modal: '',
  modalImg: '',
  modalClose: '',
  modalFigure: '',
  modalCaption: '',
};

init();

// ============================================================================
// Functions
// ============================================================================

function init() {
  markTriggers();  

  injectModal();

  document.getElementById('menu').addEventListener('click', menuPhotoHandler);
}

function markTriggers() {
  const nl = document.querySelectorAll('.profile-image-wrapper > img')
  nl.forEach(i => { i.classList.add(triggerClass) });
}

// Modal template:
// <div id="zzoom-modal">
//   <div id="zzoom-modal__close">&times;</div>
//   <figure>
//     <img id="zzoom-modal__img" src="" alt="">
//     <figcaption id="zzoom-modal__caption"></figcaption>
//   </figure>
// </div>

function injectModal() {
  const modal = document.createElement('div');
  const modalImg = document.createElement('img');
  const modalClose = document.createElement('div');
  const modalFigure = document.createElement('figure');
  const modalCaption = document.createElement('figcaption');

  modalImg.setAttribute('alt', '');
  modalFigure.append(modalCaption, modalImg);

  modal.id = 'zzoom-modal';
  modalImg.id = 'zzoom-modal__img';
  modalClose.id = 'zzoom-modal__close';
  modalFigure.id = 'zzoom-modal__figure';
  modalCaption.id = 'zzoom-modal__caption';
  
  modalClose.innerHTML = '&times;';
  
  modal.append(modalClose, modalFigure);

  document.body.appendChild(modal);

  updateState({
    modal: modal,
    modalImg: modalImg,
    modalClose: modalClose,
    modalFigure: modalFigure,
    modalCaption: modalCaption,
  });
  
  state.modal.addEventListener('click', modalCloseHandler);
}

// ============================================================================
// Event Handlers
// ============================================================================

function modalCloseHandler(e) {
  if (e.target.id !== state.modalImg.id) toggleModal();
}

// Handle clicking on a menu item photo and showing it in modal
function menuPhotoHandler(e) {
  if (e.target.matches('.' + triggerClass)) {
    e.stopPropagation();

    state.modalImg.src = e.target.src.substring(0, e.target.src.indexOf('?'));
    
    // Don't rely on sibling order method
    // e.target.parentNode.parentNode.querySelector('.content')

    // Rely on siblings order method
    const itemMeta = e.target.parentNode.nextElementSibling;

    state.modalCaption.innerHTML = `
    <div><p class="name">${itemMeta.querySelector('.productName').innerText.trim()}</p>
    <p class="description">${itemMeta.querySelector('.product-description').innerText.trim()}</p>
    </div><div class="price">${itemMeta.querySelector('.price').innerHTML}</div>`;
    
    toggleModal();
  }
}

function toggleModal() {
  state.modal.classList.toggle('modalOpen');
  document.body.classList.toggle('no-scroll');
}

// ============================================================================
// Utility
// ============================================================================

function addStyle(css) {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
};

function updateState(obj) {
  state.modal = obj.modal;
  state.modalImg = obj.modalImg;
  state.modalClose = obj.modalClose;
  state.modalFigure = obj.modalFigure;
  state.modalCaption = obj.modalCaption;
}
