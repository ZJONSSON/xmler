const xmler = require('../index');
const fs = require('fs');
const path = require('path');
const bufferStream = require('./bufferStream');

module.exports = t => {
  t.test('coercion',t => {
    t.test('when false', async t => {
      let d = await fs.createReadStream(path.join(__dirname,'fixtures','coerce.xml'))
        .pipe(xmler('value',{showAttr:true}))
        .pipe(bufferStream())
        .promise();

      d = d.map(d => d.value);
      t.equal(d[0].longValue.text,'12345');
      t.equal(d[1].stringValue.__attr__.number,'false');
      t.equal(d[2].moneyValue.__attr__.number,'true');
      t.equal(d[2].moneyValue.text,'104.95');
      t.equal(d[2].moneyValue.text,'104.95');
    });

    t.test('when true', async t => {
      let d = await fs.createReadStream(path.join(__dirname,'fixtures','coerce.xml'))
        .pipe(xmler('value',{showAttr:true,coerce:{dateValue : d => new Date(d)}}))
        .pipe(bufferStream())
        .promise();

      d = d.map( d => d.value);
      t.equal(d[0].longValue.text,12345);
      t.equal(d[1].stringValue.__attr__.number,false);
      t.equal(d[2].moneyValue.__attr__.number,true);
      t.equal(d[2].moneyValue.text,104.95);
      t.equal(d[2].moneyValue.text,104.95);
      t.equal(+d[6].dateValue.text,1329437013000);
    });

    t.end();
  });
};

if (!module.parent) {
  module.exports(require('tap'));
}