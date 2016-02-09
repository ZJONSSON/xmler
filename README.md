Super simple XML->JS convert focusing on speed.  The parser ignores attributes and collects all elements belonging to the supplied `root` type and pushes them forward in a stream. xmler is a tranform stream and fits well into pipelines.

Example:

```js
fs.createReadStream('test.xml')
  .pipe(xmler('itemName'))
  .pipe(...  // this part of the chain receive js objects
```