var xmler = require('../index');
var fs = require('fs');
var path = require('path');
var bufferStream = require('./bufferStream');
var expected = require('./fixtures/array-notation.json');
var assert = require('assert');

describe('coercion',function() {
  it('works when false',function() {   
    return fs.createReadStream(path.join(__dirname,'fixtures','coerce.xml'))
      .pipe(xmler('value',{showAttr:true}))
      .pipe(bufferStream())
      .then(function(d) {
        d = d.map( d => d.value);
        assert.equal(d[0].longValue.text,'12345');
        assert.equal(d[1].stringValue.__attr__.number,'false');
        assert.equal(d[2].moneyValue.__attr__.number,'true');
        assert.equal(d[2].moneyValue.text,'104.95');
        assert.equal(d[2].moneyValue.text,'104.95');
      });
  });

  it('works when true',function() {   
    return fs.createReadStream(path.join(__dirname,'fixtures','coerce.xml'))
      .pipe(xmler('value',{showAttr:true,coerce:{dateValue : d => new Date(d)}}))
      .pipe(bufferStream())
      .then(function(d) {
        d = d.map( d => d.value);
        assert.equal(d[0].longValue.text,12345);
        assert.equal(d[1].stringValue.__attr__.number,false);
        assert.equal(d[2].moneyValue.__attr__.number,true);
        assert.equal(d[2].moneyValue.text,104.95);
        assert.equal(d[2].moneyValue.text,104.95);
        assert.equal(+d[6].dateValue.text,1329437013000);
      });
  });
});