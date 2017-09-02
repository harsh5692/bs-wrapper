var request = require('request');
var __ = require('underscore');


/*
 Adding Constants for BrowserStack API system
 */
const api_url = "https://api.browserstack.com/4";
const username = "harshagrawal3";
const api_key = "UNFe7iyDVP8jzszAgeaG";
const auth = new Buffer(username + ':' + api_key).toString('base64');

const _CUSTOM_ERR_TIMEOUT = 810;
const _CUSTOM_ERR_PARSE = 820;

const fileTypeMapper = {
  json: "text/json",
  xml: "text/xml",
  png: "image/png"
};


function Wrapper(id) {

  if (id)
    this.id = id;

  this.options = {};
  this.conditions = {};
  this.options.headers = {
    "Authorization": "Basic " + auth,
    "Content-Type": "application/json"
  }
  this.url = {
    head: '/',
    status: '/status',
    browser: {
      'find': '/browsers',
    },
    worker: {
      'find': '/workers',
      'get': '/worker/',
      'save': '/worker/',
      'update': '/worker/',
      'delete': '/worker/'
    }
  };
  this.options.timeout = 300000;
}


Wrapper.prototype.addHeader = function addHeader(header) {
  if (!this.options.headers)
    this.options.headers = {};

  __.extend(this.options.headers, header);

}

Wrapper.prototype.setContentType = function(type) {
  var allowed = ["application/json", "text/json", "text/xml", "image/png"];
  if (type && allowed.indexOf(type) > -1)
    this.options.headers["Content-Type"] = type;
}

Wrapper.prototype.setParams = function(params) {
  this.conditions.params = params;
}

Wrapper.prototype.addParams = function(params) {
  if (!this.conditions.params)
    this.conditions.params = {};

  __.extend(this.conditions.params, params);
}

Wrapper.prototype.setUrl = function(url) {
  this.conditions.url = url;
}

Wrapper.prototype.getUrl = function() {
  return this.conditions.url;
}

Wrapper.prototype.setMethod = function(method) {
  this.conditions.method = method;
}

Wrapper.prototype.getMethod = function() {
  return this.conditions.method;
}

Wrapper.prototype.sendNative = function sendNative(callback) {
  var self = this;
  request.debug = true;
  // console.log("\n\n\nself.options", self.options);
  request(self.options, function(err, msg, response) {
    // console.log("Error response", err, response);
    // console.log("message", msg);
    /*
     Handles Error for Timeout and error recieved due to request module
     */
    if (err) {

      if (err.code == "ETIMEDOUT") {
        //[TODO] Handle timeout differently maybe
        // return callback(_CUSTOM_ERR_TIMEOUT, err);
        return callback(err);
      };
      return callback(err);

      // Error occured
    } else if (msg.statusCode >= 400 && msg.statusCode < 600) {
      return callback({ code: msg.statusCode, error: msg.body });
    } else if (msg.statusCode >= 200 && msg.statusCode < 300) {
      //[TODO] if empty response, send headers as response
      if (!response) {
        return callback(null, msg.headers);
      } else {
        var jsonResponse = {};
        // Parse response from String to JSON
        try {
          jsonResponse = JSON.parse(response);
        } catch (e) {
          // handle Improper JSON Response with code and send out raw response
          return callback(_CUSTOM_ERR_PARSE, response);
        }
        return callback(null, jsonResponse);
      }
    }
  });
}


Wrapper.prototype.setOptions = function() {
  var self = this;

  if (!self.getUrl())
    return new Error({ message: "API URL not defined" });
  if (!self.getMethod())
    return new Error({ message: "API Method not defined" });


  self.options.url = api_url + self.getUrl();
  self.options.method = self.getMethod();

  if (self.options.method == 'PUT' || self.options.method == 'POST') {
    if (self.conditions.params)
      self.options.body = JSON.stringify(self.conditions.params);
  }

  // [TODO] this if block might not be needed
  if (self.options.method == 'DELETE' || self.options.method == 'HEAD') {
    // do nothig
  }

  if (self.options.method == 'GET') {
    self.options.qs = {};
    self.options.qs = self.conditions.params || '';
  }
  
  // all OK
  return null;
}


Wrapper.prototype.send = function(callback) {

  //Error Handling and messages to be written
  var self = this;

  var err = self.setOptions();
  if (err)
    return callback(err);
  self.sendNative(callback);
}

Wrapper.prototype.head = function(callback) {
  var self = this;

  if (!self.url && !self.url.head)
    return callback(new Error({ message: "Head Resource Endpoint Not Defined" }));

  self.setUrl(self.url.head);
  self.setMethod('HEAD');
  self.send(callback);
}


Wrapper.prototype.find = function(callback) {
  var self = this;

  if (!self.url && !self.url.find)
    return callback(new Error({ message: "Resource Endpoint Not Defined" }));
  if (!self.conditions.params)
    self.conditions.params = {};
  __.extend(self.conditions.params, self.conditions.all);
  __.extend(self.conditions.params, self.conditions.flat);

  self.setUrl(self.url.find);
  self.setMethod('GET');
  self.send(callback);
}

Wrapper.prototype.findById = function(callback) {
  var self = this;

  if (!self.id)
    return callback(new Error({ message: "Resource ID Not Defined" }))
  if (!self.url && !self.url.get)
    return callback(new Error({ message: "Resource Endpoint Not Defined" }));

  self.setUrl(self.url.get + self.id + '/');
  self.setMethod('GET');
  self.send(callback);
}

Wrapper.prototype.save = function(callback) {
  var self = this;

  if (!self.url && !self.url.save)
    return callback(new Error({ message: "Resource Endpoint Not Defined" }));

  self.setUrl(self.url.save);
  self.setMethod('POST');
  self.send(callback);
}

Wrapper.prototype.update = function(callback) {
  var self = this;

  if (!self.id)
    return callback(new Error({ message: "Resource ID Not Defined" }))
  if (!self.url && !self.url.update)
    return callback(new Error({ message: "Resource Endpoint Not Defined" }));

  self.setUrl(self.url.update + self.id + '/');
  self.setMethod('PUT');
  self.send(callback);
}

Wrapper.prototype.remove = function(callback) {
  var self = this;

  if (!self.id)
    return callback(new Error({ message: "Resource ID Not Defined" }))
  if (!self.url && !self.url.delete)
    return callback(new Error({ message: "Resource Endpoint Not Defined" }));

  self.setUrl(self.url.delete + self.id + '/');
  self.setMethod('DELETE');
  self.send(callback);
}

Wrapper.prototype.listBrowsers = function(callback) {
  var self = this;
  if (!self.url.browser.find)
    return callback(new Error({ message: "Browser Endpoint Not Found" }));
  self.url.find = self.url.browser.find
  self.find(callback);
}

Wrapper.prototype.listWorkers = function(callback) {
  var self = this;
  if (!self.url.worker.find)
    return callback(new Error({ message: "Browser Endpoint Not Found" }));
  self.url.find = self.url.worker.find
  self.find(callback);
}

Wrapper.prototype.checkStatus = function(callback) {
  var self = this;
  if (!self.url.status)
    return callback(new Error({ message: "Browser Endpoint Not Found" }));
  self.url.find = self.url.status
  self.find(callback);
}


Wrapper.prototype.getWorkerById = function(callback) {
  var self = this;
  if (!self.url.worker.get)
    return callback(new Error({ message: "Browser Endpoint Not Found" }));
  self.url.get = self.url.worker.get
  self.findById(callback);
}

Wrapper.prototype.takeScreenshot = function(callback) {
  var self = this;
  if (!self.url.worker.get)
    return callback(new Error({ message: "Browser Endpoint Not Found" }));
  self.setMethod('GET');
  self.send(callback);
}

Wrapper.prototype.setFileType = function(file_type) {
  if (file_type) {
    this.setUrl(this.url.worker.get + this.id + '/screenshot.' + file_type);
    this.setContentType(fileTypeMapper.file_type);
  }
}

Wrapper.prototype.createWorker = function(callback) {
  var self = this;
  if (!self.url.worker.save)
    return callback(new Error({ message: "Browser Endpoint Not Found" }));
  self.url.save = self.url.worker.save
  self.save(callback);
}

Wrapper.prototype.updateWorker = function(callback) {
  var self = this;
  if (!self.url.worker.update)
    return callback(new Error({ message: "Browser Endpoint Not Found" }));
  self.url.update = self.url.worker.update
  self.update(callback);
}


Wrapper.prototype.removeWorker = function(callback) {
  var self = this;
  if (!self.url.worker.delete)
    return callback(new Error({ message: "Browser Endpoint Not Found" }));
  self.url.delete = self.url.worker.delete
  self.remove(callback);
}


module.exports = Wrapper;