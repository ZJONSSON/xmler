var xmler = require('../index');
var fs = require('fs');
var path = require('path');
var bufferStream = require('./bufferStream');
var expected = require('./fixtures/array-notation.json');
var assert = require('assert');

describe('array-notation',function() {
  it('should work',function() {
    
    return fs.createReadStream(path.join(__dirname,'fixtures','array-notation.xml'))
      .pipe(xmler('abcd',{arrayNotation:true}))
      .pipe(bufferStream())
      .then(function(d) {
        assert.deepEqual(d[0].value,expected.abcd[0]);
      });
  });
});