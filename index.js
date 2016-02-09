var stream = require('stream'),
    expat = require('node-expat');

module.exports = function xmler(root) {
  var parser = new expat.Parser('UTF-8'),
      transform = stream.Transform({objectMode:true}),
      base,pointer,level,element;

  transform._transform = function(chunk,encoding,callback) {
    parser.parse(chunk.toString());
    callback();
  };

  parser.on('startElement',function(d) {
    // If we already have a pointer, we need to create next level and register current as parent
    if (pointer) {
      level++;
      var parent = pointer;
      pointer = transform.pointer = {parent:parent};
      if (!parent[d]) parent[d] = pointer;
      // If this child has already been registered, we ensure it's an array, and append to it
      else {
        parent[d] = [].concat(parent[d]);
        parent[d].push(pointer);
      }
    } else if(d === root) {
      base = transform.base = pointer = {};
      level = 0;
    }
    element =  d;
    transform.emit('startElement',d);
  });

  parser.on('text',function(e) {
    if (!pointer) return;
    e=e.toString().trim();
    // If string has no length we skip
    if (!e.length) return;
    pointer.text = e;
    transform.emit('text',{element:element,text:e});
  });

  parser.on('endElement',function(d) {
    // We ignore any elements when not within root structure
    if (!pointer) return;
    if (!(level--)) {
      transform.push(base);
      base = pointer = null;
      level = 0;
    } else {
      var parent = pointer.parent;
      // On each closing we clean up if text is the only child
      if (Object.keys(pointer).length == 2 && pointer.text) {
        var p = pointer.parent[element].length;
        if (p) pointer.parent[element][p-1] = pointer.text;
        else pointer.parent[element] = pointer.text;
      }
      // get rid of the parent reference and move pointer to parent
      delete pointer.parent;
      pointer = transform.pointer = parent;
    }
    transform.emit('endElement',d);
  });
       
  return transform;
};