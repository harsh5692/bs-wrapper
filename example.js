
// USAGE
var Wrapper = require('./index.js')

function listBrowsers() {
  var model = new Wrapper();
  model.addParams({ all: false, flat: true })

  model.checkStatus(function(err, res) {
    console.log("[Err ]in here!! ", err)
    console.log("[Res ]in here!! ", res)
  });
}

function listWorkers() {
  var model = new Wrapper();
  model.setContentType("text/json")
  // model.setContentType("harsh")
  model.listWorkers(function(err, res) {
    console.log("[Err ]in here!! ", err)
    console.log("[Res ]in here!! ", res)
  });
}

function head() {
  var model = new Wrapper();

  model.head(function(err, res) {
    console.log("[Err ]in here!! ", err)
    console.log("[Res ]in here!! ", res)
  });
}


function create() {
  var model = new Wrapper();
  model.addParams({
    "os": "Windows",
    "os_version": "XP",
    "browser": "opera",
    "url": "www.google.com",
    "browser_version": "10.6"
  });
  model.createWorker(function(err, res) {
    console.log("[Err ]in here!! ", err)
    console.log("[Res ]in here!! ", res)
  });
}

function getWorkerById() {
  var model = new Wrapper(79734563);
  model.getWorkerById(function(err, res) {
    console.log("[Err ]in here!! ", JSON.stringify(err))
    console.log("[Res ]in here!! ", res)
  });
}

function remove() {
  var model = new Wrapper(79735108);
  model.removeWorker(function(err, res) {
    console.log("[Err ]in here!! ", JSON.stringify(err))
    console.log("[Res ]in here!! ", res)
  });
}

function click() {
  var model = new Wrapper(79734829);
  model.setFileType('png');
  model.takeScreenshot(function(err, res) {
    console.log("[Err ]in here!! ", JSON.stringify(err))
    console.log("[Res ]in here!! ", res)
  });
}

// head()
// listBrowsers();
// listWorkers();
// getWorkerById();
// create();
// remove();
// click();
