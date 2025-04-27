let savePopup;

document.addEventListener('mouseup', (e) => {
  const selectedText = window.getSelection().toString().trim();
  
  if (selectedText.length > 0) {
    if(savePopup) {
      return;
    }
    showSavePopup(e.pageX, e.pageY, selectedText);
  } else {
    removeSavePopup();
  }
});

function showSavePopup(x, y, selectedText) {
  removeSavePopup();

  savePopup = document.createElement('div');
  savePopup.id = 'highlight-save-popup';
  savePopup.innerText = 'Save Highlight?';
  savePopup.style.top = `${y + 10}px`;
  savePopup.style.left = `${x + 10}px`;
  
  savePopup.addEventListener('click', () => {
    highlightSelection();
    saveHighlight(selectedText);
    removeSavePopup();
  });

  document.body.appendChild(savePopup);
}

function removeSavePopup() {
  if (savePopup) {
    savePopup.remove();
    savePopup = null;
  }
}

function highlightSelection() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const mark = document.createElement('mark');
  mark.style.backgroundColor = '#FFFF00';
  range.surroundContents(mark);
  
  selection.removeAllRanges();
}

function saveHighlight(text) {
  chrome.storage.local.get({ highlights: [] }, (result) => {
    const highlights = result.highlights;
    highlights.push({
      text,
      url: window.location.href,
      timestamp: Date.now()
    });
    chrome.storage.local.set({ highlights });
    removeSavePopup();
  });
}