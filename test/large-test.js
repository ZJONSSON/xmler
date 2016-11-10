var xmler = require('../index');
var fs = require('fs');
var path = require('path');
var bufferStream = require('./bufferStream');
var expected = require('./fixtures/large.json');
var assert = require('assert');

describe('large file',function() {
  it('works',function() {   
    return fs.createReadStream(path.join(__dirname,'fixtures','large.xml'))
      .pipe(xmler(0,{showAttr:true}))
      .pipe(bufferStream())
      .then(function(d) {
        assert.deepEqual(d[0].value,expected);
      });
  });
});