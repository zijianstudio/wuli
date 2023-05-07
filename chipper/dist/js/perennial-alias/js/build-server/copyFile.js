// Copyright 2017-2018, University of Colorado Boulder

const fs = require('graceful-fs'); // eslint-disable-line require-statement-match

module.exports = async function (src, dest) {
  return new Promise((resolve, reject) => {
    fs.copyFile(src, dest, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmcyIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwic3JjIiwiZGVzdCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiY29weUZpbGUiLCJlcnIiXSwic291cmNlcyI6WyJjb3B5RmlsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDE4LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcblxyXG5jb25zdCBmcyA9IHJlcXVpcmUoICdncmFjZWZ1bC1mcycgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSByZXF1aXJlLXN0YXRlbWVudC1tYXRjaFxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiggc3JjLCBkZXN0ICkge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlLCByZWplY3QgKSA9PiB7XHJcbiAgICBmcy5jb3B5RmlsZSggc3JjLCBkZXN0LCBlcnIgPT4ge1xyXG4gICAgICBpZiAoIGVyciApIHtcclxuICAgICAgICByZWplY3QoIGVyciApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH0gKTtcclxufTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUdBLE1BQU1BLEVBQUUsR0FBR0MsT0FBTyxDQUFFLGFBQWMsQ0FBQyxDQUFDLENBQUM7O0FBRXJDQyxNQUFNLENBQUNDLE9BQU8sR0FBRyxnQkFBZ0JDLEdBQUcsRUFBRUMsSUFBSSxFQUFHO0VBQzNDLE9BQU8sSUFBSUMsT0FBTyxDQUFFLENBQUVDLE9BQU8sRUFBRUMsTUFBTSxLQUFNO0lBQ3pDUixFQUFFLENBQUNTLFFBQVEsQ0FBRUwsR0FBRyxFQUFFQyxJQUFJLEVBQUVLLEdBQUcsSUFBSTtNQUM3QixJQUFLQSxHQUFHLEVBQUc7UUFDVEYsTUFBTSxDQUFFRSxHQUFJLENBQUM7TUFDZixDQUFDLE1BQ0k7UUFDSEgsT0FBTyxDQUFDLENBQUM7TUFDWDtJQUNGLENBQUUsQ0FBQztFQUNMLENBQUUsQ0FBQztBQUNMLENBQUMifQ==