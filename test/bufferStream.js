const stream = require('stream');
const Promise = require('bluebird');

module.exports = function() {
  const buffer = [];
  const obj = stream.Transform({objectMode:true});
  obj._transform = (d,e,cb) => {
    buffer.push(d);
    cb();
  };
  
  obj.promise = () => new Promise((resolve,reject) => {
    obj._flush = (cb) => {
      if (!buffer.length)
        reject('Nothing returned from xmler');
      else
        resolve(buffer);
      cb();
    };
  });

  return obj;
};