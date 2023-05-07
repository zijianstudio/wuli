// Copyright 2002-2015, University of Colorado Boulder

/**
 * This grunt task checks out master for all sims. Useful in some cases where different shas with conflicting dependencies are checked out.
 */

const _ = require('lodash');
const child_process = require('child_process');
const grunt = require('grunt');

/**
 * Checks out master for all repositories in the git root directory.
 * @public
 */
module.exports = function () {
  const command = 'git checkout master';
  const done = grunt.task.current.async();
  const gitRoots = grunt.file.expand({
    cwd: '..'
  }, '*');
  const finished = _.after(gitRoots.length, done);
  for (let i = 0; i < gitRoots.length; i++) {
    const filename = gitRoots[i]; // Don't change to const without rewrapping usages in the closure
    if (filename !== 'babel' && grunt.file.isDir(`../${filename}`) && grunt.file.exists(`../${filename}/.git`)) {
      child_process.exec(command, {
        cwd: `../${filename}`
      }, error => {
        if (error) {
          grunt.log.writeln(`error in ${command} for repo ${filename}`);
        }
        finished();
      });
    } else {
      finished();
    }
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfIiwicmVxdWlyZSIsImNoaWxkX3Byb2Nlc3MiLCJncnVudCIsIm1vZHVsZSIsImV4cG9ydHMiLCJjb21tYW5kIiwiZG9uZSIsInRhc2siLCJjdXJyZW50IiwiYXN5bmMiLCJnaXRSb290cyIsImZpbGUiLCJleHBhbmQiLCJjd2QiLCJmaW5pc2hlZCIsImFmdGVyIiwibGVuZ3RoIiwiaSIsImZpbGVuYW1lIiwiaXNEaXIiLCJleGlzdHMiLCJleGVjIiwiZXJyb3IiLCJsb2ciLCJ3cml0ZWxuIl0sInNvdXJjZXMiOlsiY2hlY2tvdXRNYXN0ZXJBbGwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMDItMjAxNSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhpcyBncnVudCB0YXNrIGNoZWNrcyBvdXQgbWFzdGVyIGZvciBhbGwgc2ltcy4gVXNlZnVsIGluIHNvbWUgY2FzZXMgd2hlcmUgZGlmZmVyZW50IHNoYXMgd2l0aCBjb25mbGljdGluZyBkZXBlbmRlbmNpZXMgYXJlIGNoZWNrZWQgb3V0LlxyXG4gKi9cclxuXHJcbmNvbnN0IF8gPSByZXF1aXJlKCAnbG9kYXNoJyApO1xyXG5jb25zdCBjaGlsZF9wcm9jZXNzID0gcmVxdWlyZSggJ2NoaWxkX3Byb2Nlc3MnICk7XHJcbmNvbnN0IGdydW50ID0gcmVxdWlyZSggJ2dydW50JyApO1xyXG5cclxuLyoqXHJcbiAqIENoZWNrcyBvdXQgbWFzdGVyIGZvciBhbGwgcmVwb3NpdG9yaWVzIGluIHRoZSBnaXQgcm9vdCBkaXJlY3RvcnkuXHJcbiAqIEBwdWJsaWNcclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gIGNvbnN0IGNvbW1hbmQgPSAnZ2l0IGNoZWNrb3V0IG1hc3Rlcic7XHJcbiAgY29uc3QgZG9uZSA9IGdydW50LnRhc2suY3VycmVudC5hc3luYygpO1xyXG5cclxuICBjb25zdCBnaXRSb290cyA9IGdydW50LmZpbGUuZXhwYW5kKCB7IGN3ZDogJy4uJyB9LCAnKicgKTtcclxuICBjb25zdCBmaW5pc2hlZCA9IF8uYWZ0ZXIoIGdpdFJvb3RzLmxlbmd0aCwgZG9uZSApO1xyXG5cclxuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBnaXRSb290cy5sZW5ndGg7IGkrKyApIHtcclxuICAgIGNvbnN0IGZpbGVuYW1lID0gZ2l0Um9vdHNbIGkgXTsgLy8gRG9uJ3QgY2hhbmdlIHRvIGNvbnN0IHdpdGhvdXQgcmV3cmFwcGluZyB1c2FnZXMgaW4gdGhlIGNsb3N1cmVcclxuICAgIGlmICggZmlsZW5hbWUgIT09ICdiYWJlbCcgJiYgZ3J1bnQuZmlsZS5pc0RpciggYC4uLyR7ZmlsZW5hbWV9YCApICYmIGdydW50LmZpbGUuZXhpc3RzKCBgLi4vJHtmaWxlbmFtZX0vLmdpdGAgKSApIHtcclxuICAgICAgY2hpbGRfcHJvY2Vzcy5leGVjKCBjb21tYW5kLCB7IGN3ZDogYC4uLyR7ZmlsZW5hbWV9YCB9LCBlcnJvciA9PiB7XHJcbiAgICAgICAgaWYgKCBlcnJvciApIHtcclxuICAgICAgICAgIGdydW50LmxvZy53cml0ZWxuKCBgZXJyb3IgaW4gJHtjb21tYW5kfSBmb3IgcmVwbyAke2ZpbGVuYW1lfWAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmluaXNoZWQoKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGZpbmlzaGVkKCk7XHJcbiAgICB9XHJcbiAgfVxyXG59OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBLE1BQU1BLENBQUMsR0FBR0MsT0FBTyxDQUFFLFFBQVMsQ0FBQztBQUM3QixNQUFNQyxhQUFhLEdBQUdELE9BQU8sQ0FBRSxlQUFnQixDQUFDO0FBQ2hELE1BQU1FLEtBQUssR0FBR0YsT0FBTyxDQUFFLE9BQVEsQ0FBQzs7QUFFaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQUcsTUFBTSxDQUFDQyxPQUFPLEdBQUcsWUFBVztFQUUxQixNQUFNQyxPQUFPLEdBQUcscUJBQXFCO0VBQ3JDLE1BQU1DLElBQUksR0FBR0osS0FBSyxDQUFDSyxJQUFJLENBQUNDLE9BQU8sQ0FBQ0MsS0FBSyxDQUFDLENBQUM7RUFFdkMsTUFBTUMsUUFBUSxHQUFHUixLQUFLLENBQUNTLElBQUksQ0FBQ0MsTUFBTSxDQUFFO0lBQUVDLEdBQUcsRUFBRTtFQUFLLENBQUMsRUFBRSxHQUFJLENBQUM7RUFDeEQsTUFBTUMsUUFBUSxHQUFHZixDQUFDLENBQUNnQixLQUFLLENBQUVMLFFBQVEsQ0FBQ00sTUFBTSxFQUFFVixJQUFLLENBQUM7RUFFakQsS0FBTSxJQUFJVyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdQLFFBQVEsQ0FBQ00sTUFBTSxFQUFFQyxDQUFDLEVBQUUsRUFBRztJQUMxQyxNQUFNQyxRQUFRLEdBQUdSLFFBQVEsQ0FBRU8sQ0FBQyxDQUFFLENBQUMsQ0FBQztJQUNoQyxJQUFLQyxRQUFRLEtBQUssT0FBTyxJQUFJaEIsS0FBSyxDQUFDUyxJQUFJLENBQUNRLEtBQUssQ0FBRyxNQUFLRCxRQUFTLEVBQUUsQ0FBQyxJQUFJaEIsS0FBSyxDQUFDUyxJQUFJLENBQUNTLE1BQU0sQ0FBRyxNQUFLRixRQUFTLE9BQU8sQ0FBQyxFQUFHO01BQ2hIakIsYUFBYSxDQUFDb0IsSUFBSSxDQUFFaEIsT0FBTyxFQUFFO1FBQUVRLEdBQUcsRUFBRyxNQUFLSyxRQUFTO01BQUUsQ0FBQyxFQUFFSSxLQUFLLElBQUk7UUFDL0QsSUFBS0EsS0FBSyxFQUFHO1VBQ1hwQixLQUFLLENBQUNxQixHQUFHLENBQUNDLE9BQU8sQ0FBRyxZQUFXbkIsT0FBUSxhQUFZYSxRQUFTLEVBQUUsQ0FBQztRQUNqRTtRQUNBSixRQUFRLENBQUMsQ0FBQztNQUNaLENBQUUsQ0FBQztJQUNMLENBQUMsTUFDSTtNQUNIQSxRQUFRLENBQUMsQ0FBQztJQUNaO0VBQ0Y7QUFDRixDQUFDIn0=