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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'active') { activate.checked = true; }
  else if (request.message === 'videos') {
    const videos = document.getElementById('videos');
    if (request.data === 0) {
      activate.disabled = true;
      videos.innerHTML = 'No video found.';
      return;
    }
    for (let i = 0; i < request.data; i++) {
      let parent = document.createElement('div');     // Create a <div> element
      let btn = document.createElement('button');     // Create a <button> element
      let upbtn = document.createElement('button');
      let downbtn = document.createElement('button');
      btn.innerHTML = 'Video ' + (i + 1);             // Insert text
      upbtn.innerHTML = '&uarr;';
      downbtn.innerHTML = '&darr;';
      parent.appendChild(btn);                        // Append <button> to <div>
      parent.appendChild(upbtn);
      parent.appendChild(downbtn);
      videos.appendChild(parent);
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        btn.addEventListener('click', () => {
          chrome.tabs.sendMessage(tabs[0].id, { message: 'video', data: i });
        });
        upbtn.addEventListener('click', () => {
          chrome.tabs.sendMessage(tabs[0].id, { message: 'up', data: i });
        });
        downbtn.addEventListener('click', () => {
          chrome.tabs.sendMessage(tabs[0].id, { message: 'down', data: i });
        });
      });
    }
  }
});

// The body of this function will be executed as a content script inside the current page
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
    parent.appendChild(btn);                       // Append <button> to <div>
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
      const divId = 'translate-extension-div-ia';
      if (document.getElementById(divId)) { chrome.runtime.sendMessage({ message: 'active' }); }
      const elements = document.getElementsByTagName('video');
      for (let i = 0; i < elements.length; i++) { elements[i].dataset.translateExtension = i; }
      chrome.runtime.sendMessage({ message: 'videos', data: elements.length });
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        const element = document.getElementById(divId);
        if (element && (request.message === 'video' || request.message === 'down')) {
          document.querySelector(`[data-translate-extension="${request.data}"]`).parentElement.appendChild(element);
        }
        else if (element && request.message === 'up') {
          element.parentElement.parentElement.appendChild(element);
        }
      });
    }
  });
})();