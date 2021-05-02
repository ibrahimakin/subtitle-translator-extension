let color = '#3aa757';
let selector = '.vjs-text-track-cue';
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color });
  chrome.storage.sync.set({ selector });
  console.log('Default background color set to %cgreen', `color: ${color}`);
});
