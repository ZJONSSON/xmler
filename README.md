Streaming XML->JS parser that extracts selected components from XML documents one-by-ony as they are found and pipes them downstream.  This method ensures a low memory footprint as neither the XML file nor the corresponding JSON have to be fully loaded into memory at any point in time.

Usage:
```js
xmler([selector],[options])
// returns a stream
```

The selector can be any of the following:
* `String` => a selected tag has to match the supplied selector exactly
* `RegExp` => the fullpath (space delimited) has to pass the regex
* `Number` => pipes down all element (with any child objects) that reside at a particular depth inside the document.
* `Function` => element selected when function returns `true`. The function will be called with the following object:
  * `tag` : name of the tag
  * `path` : an array of the tags of the full path
  * `attr` : an object with the attributes of the element
  * `depth` : the depth of the object within the xml document 
* `Array` => Each element is a criteria - will be evaluated as `or`

Each selected element will include all children as a json object.  Selecting depth 0 for example will just result in the whole document piped down as one json record.   Each object (+ children) will contain a `property` named `__attr__` that contains any attributes defined in the XML document. By default the `__attr__` object is non-enumerable, meaning that its not visible to screen or Object keys but can still be accessable.

The piped record will include the following properties: `tag`, `path`,`depth` and `value` with the element+children placed in the `value` property.

The following `options` can be defined

* `arrayNotation` : default false - enforces that all children are within an array, even when there is only one child node
* `coerce` : default false - coerces numbers and booleans if turned on, both in text and attribute values.  If `coerce` is an object then custom coercion methods can be defined for each element name / attribute name
* `textObject` : default false -  Enforces that each text element is placed under `.text` property.   The default behavior is:  if text object the only child of a node:|{text:'xxxx'} is simplified to `'xxxx'.  
* `valuesOnly` : pipes down just the matched record (i.e. the `.value` of the default record)
* `showAttr` : default false - show the `__att__` object instead of hiding it behind the non-enumerable definition
* `mergeAttr` : default false - merges the attributes with the children objects (risking collisions when attribute name == children tag name)


### Simple example
Given a sample `file.xml`

```xml
<xml>
  <item>
    <description>First</description>
    <price>4.32</price>
  </item>
  <item>
    <description>Second</description>
    <price>5.73</price>
  </item>
</xml>
```

Running the following:


```js
fs.createReadStream('file.xml')
  .pipe(xmler(1,{coerce:true}))
  .pipe(stream.Transform({
    transform: (d,e,cb) => return console.log(d) && cb();
  }));
```

will console.log the following records one by one:
```
{
  tag: 'item',
  path: ['xml','item'],
  depth: 1,
  value: {
    description: 'First',
    price: 4.32
  }
}

{
  tag: 'item',
  path: ['xml','item'],
  depth: 1,
  value: {
  description: 'Second',
    price: 4.73
  }
}
```

Using `.pipe(xmler('item'),{coerce:true})` will extract the same records.     Using `.pipe(xmler('price',{coerce:true}))` will return an array where the values will be 4.32 and 4.37 and the `path` will be `['xml','item','price']`

### Real life example

This example streams information about all census products pipes the records into mongo (10 at a time)

```
request.get('http://api.census.gov/data.xml')
  .pipe(xmler('dct:dataset',{valuesOnly: true, mergeAttr: true}))
  .pipe(etl.collect(10))  // collect 10 record at a time for bulkinsert
  .pipe(etl.mongo.insert(collection))  // insert each bulk into mongo
``

