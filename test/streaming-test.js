const xmler = require('../index');
const fs = require('fs');
const path = require('path');
const bufferStream = require('./bufferStream');

module.exports = t => {
  t.test('streaming tests', t => {
    t.test('selects by string', async t => {
      let d = await fs.createReadStream(path.join(__dirname,'fixtures','stream.xml'))
        .pipe(xmler('item'))
        .pipe(bufferStream())
        .promise();
      
      d = d.map(d => d.value);
      t.equal(d[0].description,'First');
      t.equal(d[1].description,'Second');
      t.equal(d[2].description,'Third');
      t.equal(d[3].description,'Fourth');
      t.equal(d[3].item.description,'Not picked up');
    });
    
    t.test('selects by array', async t => {
      const d = await fs.createReadStream(path.join(__dirname,'fixtures','stream.xml'))
        .pipe(xmler(['item','rating']))
        .pipe(bufferStream())
        .promise();

      t.equal(d[0].value.description,'First');
      t.equal(d[1].value.description,'Second');
      t.equal(d[2].value,'8.7');
      t.equal(d[3].value.description,'Third');
    });
  

    t.test('selects by regex', async t => {
      const d = await fs.createReadStream(path.join(__dirname,'fixtures','stream.xml'))
        .pipe(xmler(/xml rati.*/))
        .pipe(bufferStream())
        .promise();
      t.equal(d.length,1);
      t.equal(d[0].tag,'rating');
      t.deepEqual(d[0].path,['xml','rating']);
    });

    t.test('selects by depth', async t => {
      let d = await fs.createReadStream(path.join(__dirname,'fixtures','stream.xml'))
        .pipe(xmler(4))
        .pipe(bufferStream())
        .promise();
      
      d.forEach(function(d) {
        t.equal(d.depth,4);
      });

      d = d.map(function(d) {
        return d.value;
      });

      t.equal(d[0],'Third');
      t.equal(d[1],'8.12');
      t.equal(d[2],'Not picked up');
      t.equal(d[3],'8.12');
    });

    t.end();
  });
};

if (!module.parent) {
  module.exports(require('tap'));
}