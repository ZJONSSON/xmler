var xmler = require('../index');
var fs = require('fs');
var path = require('path');
var bufferStream = require('./bufferStream');
var expected = require('./fixtures/reorder.json');
var assert = require('assert');

describe('domain',function() {
  it('works',function() {   
    return fs.createReadStream(path.join(__dirname,'fixtures','reorder.xml'))
      .pipe(xmler(0,{showAttr:true}))
      .pipe(bufferStream())
      .then(function(d) {
        assert.deepEqual(d[0].value,expected);
      });
  });
});