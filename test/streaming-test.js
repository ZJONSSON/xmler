var xmler = require('../index');
var fs = require('fs');
var path = require('path');
var bufferStream = require('./bufferStream');
var expected = require('./fixtures/large.json');
var assert = require('assert');

describe('streaming tests',function() {
  it('selects by string',function() {   
    return fs.createReadStream(path.join(__dirname,'fixtures','stream.xml'))
      .pipe(xmler('item'))
      .pipe(bufferStream())
      .then(function(d) {
        d = d.map(d => d.value);
        assert.equal(d[0].description,'First');
        assert.equal(d[1].description,'Second');
        assert.equal(d[2].description,'Third');
        assert.equal(d[3].description,'Fourth');
        assert.equal(d[3].item.description,'Not picked up');
      });
  });

  it('selects by array',function() {   
    return fs.createReadStream(path.join(__dirname,'fixtures','stream.xml'))
      .pipe(xmler(['item','rating']))
      .pipe(bufferStream())
      .then(function(d) {
        assert.equal(d[0].value.description,'First');
        assert.equal(d[1].value.description,'Second');
        assert.equal(d[2].value,'8.7');
        assert.equal(d[3].value.description,'Third');
      });
  });

  it('selects by regex',function() {   
    return fs.createReadStream(path.join(__dirname,'fixtures','stream.xml'))
      .pipe(xmler(/xml rati.*/))
      .pipe(bufferStream())
      .then(function(d) {
        assert.equal(d.length,1);
        assert.equal(d[0].tag,'rating');
        assert.deepEqual(d[0].path,['xml','rating']);
      });
  });

  it('selects by depth',function() {
    return fs.createReadStream(path.join(__dirname,'fixtures','stream.xml'))
      .pipe(xmler(4))
      .pipe(bufferStream())
      .then(function(d) {
        d.forEach(function(d) {
          assert.equal(d.depth,4);
        });

        d = d.map(function(d) {
          return d.value;
        });

        assert.equal(d[0],'Third');
        assert.equal(d[1],'8.12');
        assert.equal(d[2],'Not picked up');
        assert.equal(d[3],'8.12');
      });
  });
});