// Copyright 2015, University of Colorado Boulder

/**
 * Sorts require statements for each file in the js/ directory
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

// 3rd-party packages
const _ = require('lodash');
const grunt = require('grunt');

// constants
const KEY = ' = require( '; // the substring that is searched to find require statements

/**
 * @param {string} path
 */
module.exports = function (path) {
  // only address js files
  if (path.indexOf('.js')) {
    // read the file as text
    const text = grunt.file.read(path).toString();

    // split by line
    const lines = text.split(/\r?\n/);

    // full text
    const result = [];

    // accumulated require statement lines
    let accumulator = [];

    // total number of require statements
    let count = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // If it was a require statement, store it for sorting.
      if (line.indexOf(KEY) >= 0) {
        accumulator.push(line);
        count++;
      } else {
        // Not a require statement, sort and flush any pending require statements then continue
        accumulator = _.sortBy(accumulator, o => {
          // sort by the beginning of the line, including 'const X = require("PATH/dir/X")
          // case insensitive so that inherit and namespaces don't show up last
          return o.toLowerCase();
        });
        let previous = null;
        accumulator.forEach(a => {
          // Omit duplicate require statements
          if (a !== previous) {
            result.push(a);
          }
          previous = a;
        });
        accumulator.length = 0;
        result.push(line);
      }
    }
    grunt.file.write(path, result.join('\n'));
    grunt.log.writeln(`sorted ${count} require statements in ${path}`);
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfIiwicmVxdWlyZSIsImdydW50IiwiS0VZIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhdGgiLCJpbmRleE9mIiwidGV4dCIsImZpbGUiLCJyZWFkIiwidG9TdHJpbmciLCJsaW5lcyIsInNwbGl0IiwicmVzdWx0IiwiYWNjdW11bGF0b3IiLCJjb3VudCIsImkiLCJsZW5ndGgiLCJsaW5lIiwicHVzaCIsInNvcnRCeSIsIm8iLCJ0b0xvd2VyQ2FzZSIsInByZXZpb3VzIiwiZm9yRWFjaCIsImEiLCJ3cml0ZSIsImpvaW4iLCJsb2ciLCJ3cml0ZWxuIl0sInNvdXJjZXMiOlsic29ydFJlcXVpcmVTdGF0ZW1lbnRzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTb3J0cyByZXF1aXJlIHN0YXRlbWVudHMgZm9yIGVhY2ggZmlsZSBpbiB0aGUganMvIGRpcmVjdG9yeVxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbi8vIDNyZC1wYXJ0eSBwYWNrYWdlc1xyXG5jb25zdCBfID0gcmVxdWlyZSggJ2xvZGFzaCcgKTtcclxuY29uc3QgZ3J1bnQgPSByZXF1aXJlKCAnZ3J1bnQnICk7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgS0VZID0gJyA9IHJlcXVpcmUoICc7IC8vIHRoZSBzdWJzdHJpbmcgdGhhdCBpcyBzZWFyY2hlZCB0byBmaW5kIHJlcXVpcmUgc3RhdGVtZW50c1xyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBwYXRoICkge1xyXG5cclxuICAvLyBvbmx5IGFkZHJlc3MganMgZmlsZXNcclxuICBpZiAoIHBhdGguaW5kZXhPZiggJy5qcycgKSApIHtcclxuXHJcbiAgICAvLyByZWFkIHRoZSBmaWxlIGFzIHRleHRcclxuICAgIGNvbnN0IHRleHQgPSBncnVudC5maWxlLnJlYWQoIHBhdGggKS50b1N0cmluZygpO1xyXG5cclxuICAgIC8vIHNwbGl0IGJ5IGxpbmVcclxuICAgIGNvbnN0IGxpbmVzID0gdGV4dC5zcGxpdCggL1xccj9cXG4vICk7XHJcblxyXG4gICAgLy8gZnVsbCB0ZXh0XHJcbiAgICBjb25zdCByZXN1bHQgPSBbXTtcclxuXHJcbiAgICAvLyBhY2N1bXVsYXRlZCByZXF1aXJlIHN0YXRlbWVudCBsaW5lc1xyXG4gICAgbGV0IGFjY3VtdWxhdG9yID0gW107XHJcblxyXG4gICAgLy8gdG90YWwgbnVtYmVyIG9mIHJlcXVpcmUgc3RhdGVtZW50c1xyXG4gICAgbGV0IGNvdW50ID0gMDtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgbGluZSA9IGxpbmVzWyBpIF07XHJcblxyXG4gICAgICAvLyBJZiBpdCB3YXMgYSByZXF1aXJlIHN0YXRlbWVudCwgc3RvcmUgaXQgZm9yIHNvcnRpbmcuXHJcbiAgICAgIGlmICggbGluZS5pbmRleE9mKCBLRVkgKSA+PSAwICkge1xyXG4gICAgICAgIGFjY3VtdWxhdG9yLnB1c2goIGxpbmUgKTtcclxuICAgICAgICBjb3VudCsrO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBOb3QgYSByZXF1aXJlIHN0YXRlbWVudCwgc29ydCBhbmQgZmx1c2ggYW55IHBlbmRpbmcgcmVxdWlyZSBzdGF0ZW1lbnRzIHRoZW4gY29udGludWVcclxuICAgICAgICBhY2N1bXVsYXRvciA9IF8uc29ydEJ5KCBhY2N1bXVsYXRvciwgbyA9PiB7XHJcblxyXG4gICAgICAgICAgLy8gc29ydCBieSB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaW5lLCBpbmNsdWRpbmcgJ2NvbnN0IFggPSByZXF1aXJlKFwiUEFUSC9kaXIvWFwiKVxyXG4gICAgICAgICAgLy8gY2FzZSBpbnNlbnNpdGl2ZSBzbyB0aGF0IGluaGVyaXQgYW5kIG5hbWVzcGFjZXMgZG9uJ3Qgc2hvdyB1cCBsYXN0XHJcbiAgICAgICAgICByZXR1cm4gby50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgICBsZXQgcHJldmlvdXMgPSBudWxsO1xyXG4gICAgICAgIGFjY3VtdWxhdG9yLmZvckVhY2goIGEgPT4ge1xyXG5cclxuICAgICAgICAgIC8vIE9taXQgZHVwbGljYXRlIHJlcXVpcmUgc3RhdGVtZW50c1xyXG4gICAgICAgICAgaWYgKCBhICE9PSBwcmV2aW91cyApIHtcclxuICAgICAgICAgICAgcmVzdWx0LnB1c2goIGEgKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBwcmV2aW91cyA9IGE7XHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIGFjY3VtdWxhdG9yLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgcmVzdWx0LnB1c2goIGxpbmUgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdydW50LmZpbGUud3JpdGUoIHBhdGgsIHJlc3VsdC5qb2luKCAnXFxuJyApICk7XHJcbiAgICBncnVudC5sb2cud3JpdGVsbiggYHNvcnRlZCAke2NvdW50fSByZXF1aXJlIHN0YXRlbWVudHMgaW4gJHtwYXRofWAgKTtcclxuICB9XHJcbn07Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsTUFBTUEsQ0FBQyxHQUFHQyxPQUFPLENBQUUsUUFBUyxDQUFDO0FBQzdCLE1BQU1DLEtBQUssR0FBR0QsT0FBTyxDQUFFLE9BQVEsQ0FBQzs7QUFFaEM7QUFDQSxNQUFNRSxHQUFHLEdBQUcsY0FBYyxDQUFDLENBQUM7O0FBRTVCO0FBQ0E7QUFDQTtBQUNBQyxNQUFNLENBQUNDLE9BQU8sR0FBRyxVQUFVQyxJQUFJLEVBQUc7RUFFaEM7RUFDQSxJQUFLQSxJQUFJLENBQUNDLE9BQU8sQ0FBRSxLQUFNLENBQUMsRUFBRztJQUUzQjtJQUNBLE1BQU1DLElBQUksR0FBR04sS0FBSyxDQUFDTyxJQUFJLENBQUNDLElBQUksQ0FBRUosSUFBSyxDQUFDLENBQUNLLFFBQVEsQ0FBQyxDQUFDOztJQUUvQztJQUNBLE1BQU1DLEtBQUssR0FBR0osSUFBSSxDQUFDSyxLQUFLLENBQUUsT0FBUSxDQUFDOztJQUVuQztJQUNBLE1BQU1DLE1BQU0sR0FBRyxFQUFFOztJQUVqQjtJQUNBLElBQUlDLFdBQVcsR0FBRyxFQUFFOztJQUVwQjtJQUNBLElBQUlDLEtBQUssR0FBRyxDQUFDO0lBRWIsS0FBTSxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdMLEtBQUssQ0FBQ00sTUFBTSxFQUFFRCxDQUFDLEVBQUUsRUFBRztNQUN2QyxNQUFNRSxJQUFJLEdBQUdQLEtBQUssQ0FBRUssQ0FBQyxDQUFFOztNQUV2QjtNQUNBLElBQUtFLElBQUksQ0FBQ1osT0FBTyxDQUFFSixHQUFJLENBQUMsSUFBSSxDQUFDLEVBQUc7UUFDOUJZLFdBQVcsQ0FBQ0ssSUFBSSxDQUFFRCxJQUFLLENBQUM7UUFDeEJILEtBQUssRUFBRTtNQUNULENBQUMsTUFDSTtRQUVIO1FBQ0FELFdBQVcsR0FBR2YsQ0FBQyxDQUFDcUIsTUFBTSxDQUFFTixXQUFXLEVBQUVPLENBQUMsSUFBSTtVQUV4QztVQUNBO1VBQ0EsT0FBT0EsQ0FBQyxDQUFDQyxXQUFXLENBQUMsQ0FBQztRQUN4QixDQUFFLENBQUM7UUFDSCxJQUFJQyxRQUFRLEdBQUcsSUFBSTtRQUNuQlQsV0FBVyxDQUFDVSxPQUFPLENBQUVDLENBQUMsSUFBSTtVQUV4QjtVQUNBLElBQUtBLENBQUMsS0FBS0YsUUFBUSxFQUFHO1lBQ3BCVixNQUFNLENBQUNNLElBQUksQ0FBRU0sQ0FBRSxDQUFDO1VBQ2xCO1VBRUFGLFFBQVEsR0FBR0UsQ0FBQztRQUNkLENBQUUsQ0FBQztRQUNIWCxXQUFXLENBQUNHLE1BQU0sR0FBRyxDQUFDO1FBQ3RCSixNQUFNLENBQUNNLElBQUksQ0FBRUQsSUFBSyxDQUFDO01BQ3JCO0lBQ0Y7SUFFQWpCLEtBQUssQ0FBQ08sSUFBSSxDQUFDa0IsS0FBSyxDQUFFckIsSUFBSSxFQUFFUSxNQUFNLENBQUNjLElBQUksQ0FBRSxJQUFLLENBQUUsQ0FBQztJQUM3QzFCLEtBQUssQ0FBQzJCLEdBQUcsQ0FBQ0MsT0FBTyxDQUFHLFVBQVNkLEtBQU0sMEJBQXlCVixJQUFLLEVBQUUsQ0FBQztFQUN0RTtBQUNGLENBQUMifQ==