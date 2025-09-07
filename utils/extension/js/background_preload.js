(function() {
  var createContextMenu, _ref;

  if (!globalThis.window) {
    globalThis.window = globalThis;
    globalThis.global = globalThis;
  }

  window.UglifyJS_NoUnsafeEval = true;

  createContextMenu = function() {
    return chrome.contextMenus.create({
      id: 'enableQuickSwitch',
      title: chrome.i18n.getMessage('contextMenu_enableQuickSwitch'),
      type: 'checkbox',
      checked: false,
      contexts: ["action"]
    });
  };

  chrome.runtime.onInstalled.addListener(function() {
    if (chrome.i18n.getUILanguage != null) {
      return createContextMenu();
    }
  });

  if ((typeof browser !== "undefined" && browser !== null ? (_ref = browser.proxy) != null ? _ref.onRequest : void 0 : void 0) != null) {
    createContextMenu();
  }

}).call(this);
