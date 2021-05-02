// Initialize butotn with users's prefered color
let changeColor = document.getElementById("changeColor");

chrome.storage.sync.get("color", ({ color }) => {
  changeColor.style.backgroundColor = color;
});

async function init() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: addButton,
  });
}

init();

function addButton() {
  let btn = document.createElement('BUTTON');    // Create a <button> element
  btn.style = 'position:fixed;bottom:20px;right:20px;z-index:1';
  btn.innerHTML = 'Translate';                   // Insert text
  document.body.appendChild(btn);                // Append <button> to <body>
  btn.addEventListener('click', () => {
    const element = document.querySelector('.vjs-text-track-cue');
    const copyText = element.children[0].innerHTML.replace(/(\r\n|\n|\r)/gm, ' ');
    console.log(copyText);
    window.open('https://translate.google.com/?sl=en&tl=tr&text=' + escape(copyText), '_blank');
  })
}

// When the button is clicked, inject setPageBackgroundColor into current page
changeColor.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: setPageBackgroundColor,
  });
});

// The body of this function will be execuetd as a content script inside the
// current page
function setPageBackgroundColor() {
  chrome.storage.sync.get("color", ({ color }) => {
    const element = document.querySelector('.vjs-text-track-cue');
    const copyText = element.children[0].innerHTML.replace(/(\r\n|\n|\r)/gm, ' ');
    console.log(copyText);
    window.open('https://translate.google.com/?sl=en&tl=tr&text=' + escape(copyText), '_blank');
    element.style.backgroundColor = color;
  });
}
