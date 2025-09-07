(function() {
  window.OmegaDebug = {
    getProjectVersion: function() {
      return chrome.runtime.getManifest().version;
    },
    getExtensionVersion: function() {
      return chrome.runtime.getManifest().version;
    },
    downloadLog: function() {
      var blob, filename;
      blob = new Blob([localStorage['log']], {
        type: "text/plain;charset=utf-8"
      });
      filename = "OmegaLog_" + (Date.now()) + ".txt";
      return saveAs(blob, filename);
    },
    resetOptions: function() {
      localStorage.clear();
      localStorage['omega.local.syncOptions'] = '"conflict"';
      chrome.storage.local.clear();
      return chrome.runtime.reload();
    },
    reportIssue: function() {
      var body, env, err, extensionVersion, finalUrl, projectVersion, url;
      url = 'https://github.com/mrfanii/SwitchyOmega-V3/issues/new?title=&body=';
      finalUrl = url;
      try {
        projectVersion = OmegaDebug.getProjectVersion();
        extensionVersion = OmegaDebug.getExtensionVersion();
        env = {
          extensionVersion: extensionVersion,
          projectVersion: extensionVersion,
          userAgent: navigator.userAgent
        };
        body = chrome.i18n.getMessage('popup_issueTemplate', [env.projectVersion, env.userAgent]);
        body || (body = "\n\n\n<!-- Please write your comment ABOVE this line. -->\nSwitchyOmega " + env.projectVersion + "\n" + env.userAgent);
        finalUrl = url + encodeURIComponent(body);
        err = localStorage['logLastError'];
        if (err) {
          body += "\n```\n" + err + "\n```";
          finalUrl = (url + encodeURIComponent(body)).substr(0, 2000);
        }
      } catch (_error) {}
      return chrome.tabs.create({
        url: finalUrl
      });
    }
  };

}).call(this);
