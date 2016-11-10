var stream = require('stream');
var Promise = require('bluebird');

module.exports = function() {
  var buffer = [];
  var obj = stream.Transform({objectMode:true});
  obj._transform = function(d,e,cb) {
    buffer.push(d);
    cb();
  };
  
  var promise = new Promise(function(resolve,reject) {
    obj._flush = function(cb) {
      if (!buffer.length)
        reject('Nothing returned from xmler');
      else
        resolve(buffer);
      cb();
    };
  });
  obj.then = promise.then.bind(promise)
  return obj;
};