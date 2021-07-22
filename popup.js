let activate = document.getElementById('activate');

activate.addEventListener('change', async (e) => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (e.target.checked) { 
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: createElements
    });
  }
  else {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: removeElements
    });
  }
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.active) { activate.checked = true; }
});

// The body of this function will be execuetd as a content script inside the current page
function removeElements() {
  const element = document.getElementById('translate-extension-div-ia');
  if (element) { element.remove(); }
}

function createElements() {
  const divId = 'translate-extension-div-ia';
  if (document.getElementById(divId)) { return; }
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
  let parent = document.createElement('div');      // Create a <div> element
  parent.id = divId;
  parent.style = 'position:fixed;bottom:80px;right:40px;font-size:15px;z-index:1';
  createButton(parent, 'Translate', openTranslate);
  document.getElementsByTagName('video')[0].parentElement.appendChild(parent);
}

(async function () {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => {
      if (document.getElementById('translate-extension-div-ia')) {
        chrome.runtime.sendMessage({ active: true });
      }
    }
  });
})();