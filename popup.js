// Initialize butotn with users's prefered color
let changeColor = document.getElementById('changeColor');

chrome.storage.sync.get('color', ({ color }) => {
  changeColor.style.backgroundColor = color;
});

// When the button is clicked, inject setPageBackgroundColor into current page
changeColor.addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: setPageBackgroundColor,
  });
});

// The body of this function will be execuetd as a content script inside the
// current page
function setPageBackgroundColor() {
  let element;
  chrome.storage.sync.get('selector', ({ selector }) => {
    element = document.querySelector(selector).children[0];
  });
  chrome.storage.sync.get('color', ({ color }) => {
    element.style.backgroundColor = color;
  });
}

function createElements() {
  function openTranslate() {
    chrome.storage.sync.get('selector', ({ selector }) => {
      const element = document.querySelector(selector);
      const text = element.children[0].innerText.replace(/(\r\n|\n|\r)/gm, ' ');
      chrome.runtime.sendMessage({ message: 'translate', text });
    });
  }
  function createButton(parent, text, listener) {
    let btn = document.createElement('button');    // Create a <button> element
    btn.style = 'padding:5px;cursor:pointer;border-radius:5px;border-style:outset;border-width:1px';
    btn.innerHTML = text;                          // Insert text
    parent.appendChild(btn);                       // Append <button> to <body>
    btn.addEventListener('click', listener);
  }
  const divId = 'translate-extension-div-ia';
  if (document.getElementById(divId)) { return; }
  let parent = document.createElement('div');      // Create a <div> element
  parent.id = divId;
  parent.style = 'position:fixed;bottom:80px;right:40px;font-size:15px;z-index:1';
  createButton(parent, 'Translate', openTranslate);
  document.getElementsByTagName('video')[0].parentElement.appendChild(parent);
}

async function init() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: createElements,
  });
}

init();