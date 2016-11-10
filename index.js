var stream = require('stream'),
    expat = require('node-expat');

function coerce(e,fn) {
  var _value = e.toLowerCase();
  if (typeof fn === 'function')
    return fn(e);
  else if (!isNaN(e))
    return +e;
  else if (_value == 'true')
    return true;
  else if (_value == 'false')
    return false;
  else
    return e;
}

module.exports = function xmler(criteria,options) {
  options = options || {};
  criteria = criteria || 0;
  
  var path = [],
      depth = 0,
      parser = new expat.Parser('UTF-8'),
      transform = stream.Transform({objectMode:true}),
      base,pointer,selected,current;

  // Parse criteria into a function
  criteria = [].concat(criteria).map(function(criteria) {
    if (typeof criteria === 'function')
      return criteria;
    else if (criteria instanceof RegExp)
      return d => criteria.exec(d.path.join(' '));
    else if (!isNaN(criteria))
      return d => d.depth == criteria;  
    else
      return d => d.tag === criteria;
  });

  // The transform function feeds the expat parser
  transform._transform = function(chunk,encoding,callback) {
    parser.parse(chunk.toString());
    callback();
  };

  // For each new element we bump up depth and add to path
  parser.on('startElement',function(tag,attr) {
    path.push(tag);
    transform.emit('startElement', {tag, path: path.slice(), depth, attr});
    depth += 1;
  });

  // For each ending we take down one depth and pop from path
  parser.on('endElement',function(tag) {
    depth -= 1;
    transform.emit('endElement',{tag, path: path.slice(), depth});
    path.pop();
  });

  parser.on('text',function(text) {
    transform.emit('text',text,path,depth);
  });

  parser.on('finish',function() {
    transform.end();
  });

  transform.on('startElement',function(d) {
    current = d;
    // If we already have a pointer, we need to create next depth and register current as parent
    if (pointer) {
      var parent = pointer;
      pointer = transform.pointer = {};
      Object.defineProperty(pointer,'parent',{value:parent, enumerable: false});
      
      if (!parent[d.tag]) parent[d.tag] = options.arrayNotation ? [pointer] : pointer;
      // If this child has already been registered, we ensure it's an array, and append to it
      else {
        parent[d.tag] = [].concat(parent[d.tag]);
        parent[d.tag].push(pointer);
      }
    } else if(criteria.some(fn => fn(d))) {
      selected = d;
      base =  pointer = {};
      Object.defineProperty(base,'__name__',{value: d, enumerable: false});
    }
    if (pointer) {
      if (options.coerce || options.mergeAttr)
        for (var key in d.attr) {
          if (options.coerce) 
            d.attr[key] = coerce(d.attr[key],options.coerce[key]);
          if (options.mergeAttr)
            pointer[key] = d.attr[key];
        }
      Object.defineProperty(pointer,'__attr__',{value:d.attr, enumerable: options.showAttr});
    }
  });

  transform.on('text',function(e) {
    e = e.toString().trim();
    if (!pointer || !e.length) return;
    if (options.coerce)
      e = coerce(e,options.coerce[current.tag]);
    pointer.text = e;
  });

  transform.on('endElement',function() {
    // We ignore any elements when not within root structure
    if (!pointer) return;
    
    if (depth === selected.depth) {
      if (!options.textObject && Object.keys(base).length == 1 && base.text !== undefined)
        base = base.text;
      selected.value = base;
      transform.push(options.valuesOnly ? base : selected);
      base = pointer = null;
    } else {
      var parent = pointer.parent;
      // On each closing we clean up if text is the only child
      if (!options.textObject && Object.keys(pointer).length == 1 && pointer.text !== undefined) {
        if (!pointer.parent) pointer = pointer.text;
        var p = pointer.parent[current.tag].length;
        if (p) pointer.parent[current.tag][p-1] = pointer.text;
        else pointer.parent[current.tag] = pointer.text;
      }
      // get rid of the parent reference and move pointer to parent
      delete pointer.parent;
      pointer = transform.pointer = parent;
    }
  });
       
  return transform;
};