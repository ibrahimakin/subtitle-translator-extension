let activate = document.getElementById('activate');
let select = document.getElementById('select');
// let finder = document.getElementById('finder');

activate.addEventListener('change', async e => {
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

select.addEventListener('change', e => chrome.storage.sync.set({ select: e.target.checked }));

// finder.addEventListener('change', async (e) => {
//   let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//   if (e.target.checked) { 
//     chrome.scripting.executeScript({
//       target: { tabId: tab.id },
//       function: createOverlay
//     });
//   }
//   else {
//     chrome.scripting.executeScript({
//       target: { tabId: tab.id },
//       function: removeOverlay
//     });
//   }
// });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'active') { activate.checked = true; }
  else if (request.message === 'select') { select.checked = true; }
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
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
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
  if (element) element.remove();
}

function createElements() {
  const divID = 'translate-extension-div-ia';
  let parent = document.getElementById(divID);
  let previous = '';
  if (parent) return;
  function openTranslate(e, plus) {
    chrome.storage.sync.get('selector', ({ selector }) => {
      const element = document.querySelector(selector);
      const text = element.children[0].innerText.replace(/(\r\n|\n|\r)/gm, ' ');
      if (plus) previous += text;
      else previous = text;
      chrome.storage.sync.get('select', ({ select }) => {
        if (select) {
          fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=tr&dt=bd&dt=t&dj=1&q=' + previous)
            .then(res => res.json()).then(data => {
              let translation = '';
              for (const sentence of data.sentences) translation += sentence.trans;
              createTranslation(translation);
            });
        }
        chrome.runtime.sendMessage({ message: 'translate', text: previous });
      });
    });
  }
  function createTranslation(translation) {
    const id = 'translate-extension-translation-div-ia';
    let div = document.getElementById(id);
    if (div) div.innerHTML = translation;
    else {
      div = document.createElement('div');
      div.addEventListener('click', e => e.target.remove());
      div.innerText = translation;
      div.id = id;
      parent.appendChild(div);
    }
  }
  parent = document.createElement('div');        // Create a <div> element
  let btn = document.createElement('button');    // Create a <button> element
  let add = document.createElement('button');
  btn.addEventListener('click', openTranslate);
  add.addEventListener('click', e => openTranslate(e, true));
  btn.innerHTML = 'Translate';                   // Insert text
  add.innerHTML = '+';
  parent.appendChild(btn);                       // Append <button> to <div>
  parent.appendChild(add);
  parent.id = divID;
  document.getElementsByTagName('video')[0].parentElement.appendChild(parent);
}

function removeOverlay() { }

function createOverlay() {
  let div = document.createElement('div');
  div.setAttribute('id', 'mouseover_overlay');
  document.body.appendChild(div);
  let overlay = document.querySelector('#mouseover_overlay');
  document.addEventListener('mouseover', e => {
    let elem = e.target;
    let rect = elem.getBoundingClientRect();
    overlay.style.top = rect.top + 'px';
    overlay.style.left = rect.left + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';
  });
}

(async function () {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => {
      const divID = 'translate-extension-div-ia';
      if (document.getElementById(divID)) { chrome.runtime.sendMessage({ message: 'active' }); }
      chrome.storage.sync.get('select', ({ select }) => {
        if (select) chrome.runtime.sendMessage({ message: 'select' });
      });
      const elements = document.getElementsByTagName('video');
      for (let i = 0; i < elements.length; i++) { elements[i].dataset.translateExtension = i; }
      chrome.runtime.sendMessage({ message: 'videos', data: elements.length });
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        const element = document.getElementById(divID);
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