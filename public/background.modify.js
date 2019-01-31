  chrome.runtime.onInstalled.addListener(function() {
    
    chrome.storage.sync.set({settings:{enabled:true,useTitle:true}}, function() {
    });


/*
    chrome.storage.sync.set({settings: {}}, function() { //solo se non set

    });
*/
  


    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostEquals: '#####'},
        })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });


  });
