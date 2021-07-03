let color = '#3aa757';
let selector = '.vjs-text-track-cue';
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color });
  chrome.storage.sync.set({ selector });
  console.log('Default background color set to %cgreen', `color: ${color}`);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'translate') {
    const url = 'https://translate.google.com/?sl=en&tl=tr&text=' + escape(request.text);
    chrome.windows.getAll({ populate: true }, windows => {
      if (windows.length > 1) {
        let open = true; let target = 0;
        for (const window of windows) {
          if (window.id === sender.tab.windowId) { continue; }
          target = window.id;
          for (const tab of window.tabs) {
            if (/^https:\/\/translate.google.com/.test(tab.url)) {
              open = false; chrome.tabs.update(tab.id, { url });
            }
          }
        }
        if (open) { chrome.tabs.create({ windowId: target, url }); }
      } else { chrome.windows.create({ url }); }
    });
  }
});