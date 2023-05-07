// Copyright 2021, University of Colorado Boulder

const _ = require('lodash'); // eslint-disable-line no-unused-vars
const fs = require('fs');

/**
 *
 * Autofix missing accessibility modifiers. NOTE: This script is horribly inefficient, writing the same file over and over
 * N times, where N is the number of errors in that file.
 *
 * USAGE:
 * (1) Make sure you have a clean working copy
 * (2) cd directory-with-all-repos
 * (3) Generate a lint report and save it in a file
 *       cd axon
 *       grunt lint > lintreport.txt
 * (4) Run the script
 *       cd ..
 *       node perennial/js/scripts/add-accessibility-modifier axon/lintreport.txt private
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
(async () => {
  const args = process.argv.slice(2);
  const filename = args[0];
  const modifier = args[1];
  const report = fs.readFileSync(filename, 'utf8').trim();
  const lines = report.split('\n').map(sim => sim.trim());
  let currentFile = null;
  lines.forEach(line => {
    if (line.endsWith('.ts') && (line.includes('/') || line.includes('\\'))) {
      currentFile = line;
    } else if (line.includes('error') && line.endsWith('@typescript-eslint/explicit-member-accessibility')) {
      const substring = line.substring(0, line.indexOf('error'));
      const terms = substring.trim().split(':');
      const lineNumber = Number(terms[0]);
      const column = Number(terms[1]);
      console.log(currentFile, lineNumber, column);
      const file = fs.readFileSync(currentFile, 'utf8');
      const lines = file.split('\n');
      lines[lineNumber - 1] = lines[lineNumber - 1].substring(0, column - 1) + modifier + ' ' + lines[lineNumber - 1].substring(column - 1);
      console.log(lines[lineNumber - 1]);
      fs.writeFileSync(currentFile, lines.join('\n'));
    }
  });
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfIiwicmVxdWlyZSIsImZzIiwiYXJncyIsInByb2Nlc3MiLCJhcmd2Iiwic2xpY2UiLCJmaWxlbmFtZSIsIm1vZGlmaWVyIiwicmVwb3J0IiwicmVhZEZpbGVTeW5jIiwidHJpbSIsImxpbmVzIiwic3BsaXQiLCJtYXAiLCJzaW0iLCJjdXJyZW50RmlsZSIsImZvckVhY2giLCJsaW5lIiwiZW5kc1dpdGgiLCJpbmNsdWRlcyIsInN1YnN0cmluZyIsImluZGV4T2YiLCJ0ZXJtcyIsImxpbmVOdW1iZXIiLCJOdW1iZXIiLCJjb2x1bW4iLCJjb25zb2xlIiwibG9nIiwiZmlsZSIsIndyaXRlRmlsZVN5bmMiLCJqb2luIl0sInNvdXJjZXMiOlsiYWRkLWFjY2Vzc2liaWxpdHktbW9kaWZpZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuY29uc3QgXyA9IHJlcXVpcmUoICdsb2Rhc2gnICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcclxuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XHJcblxyXG4vKipcclxuICpcclxuICogQXV0b2ZpeCBtaXNzaW5nIGFjY2Vzc2liaWxpdHkgbW9kaWZpZXJzLiBOT1RFOiBUaGlzIHNjcmlwdCBpcyBob3JyaWJseSBpbmVmZmljaWVudCwgd3JpdGluZyB0aGUgc2FtZSBmaWxlIG92ZXIgYW5kIG92ZXJcclxuICogTiB0aW1lcywgd2hlcmUgTiBpcyB0aGUgbnVtYmVyIG9mIGVycm9ycyBpbiB0aGF0IGZpbGUuXHJcbiAqXHJcbiAqIFVTQUdFOlxyXG4gKiAoMSkgTWFrZSBzdXJlIHlvdSBoYXZlIGEgY2xlYW4gd29ya2luZyBjb3B5XHJcbiAqICgyKSBjZCBkaXJlY3Rvcnktd2l0aC1hbGwtcmVwb3NcclxuICogKDMpIEdlbmVyYXRlIGEgbGludCByZXBvcnQgYW5kIHNhdmUgaXQgaW4gYSBmaWxlXHJcbiAqICAgICAgIGNkIGF4b25cclxuICogICAgICAgZ3J1bnQgbGludCA+IGxpbnRyZXBvcnQudHh0XHJcbiAqICg0KSBSdW4gdGhlIHNjcmlwdFxyXG4gKiAgICAgICBjZCAuLlxyXG4gKiAgICAgICBub2RlIHBlcmVubmlhbC9qcy9zY3JpcHRzL2FkZC1hY2Nlc3NpYmlsaXR5LW1vZGlmaWVyIGF4b24vbGludHJlcG9ydC50eHQgcHJpdmF0ZVxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuKCBhc3luYyAoKSA9PiB7XHJcbiAgY29uc3QgYXJncyA9IHByb2Nlc3MuYXJndi5zbGljZSggMiApO1xyXG4gIGNvbnN0IGZpbGVuYW1lID0gYXJnc1sgMCBdO1xyXG4gIGNvbnN0IG1vZGlmaWVyID0gYXJnc1sgMSBdO1xyXG5cclxuICBjb25zdCByZXBvcnQgPSBmcy5yZWFkRmlsZVN5bmMoIGZpbGVuYW1lLCAndXRmOCcgKS50cmltKCk7XHJcbiAgY29uc3QgbGluZXMgPSByZXBvcnQuc3BsaXQoICdcXG4nICkubWFwKCBzaW0gPT4gc2ltLnRyaW0oKSApO1xyXG5cclxuICBsZXQgY3VycmVudEZpbGUgPSBudWxsO1xyXG4gIGxpbmVzLmZvckVhY2goIGxpbmUgPT4ge1xyXG4gICAgaWYgKCBsaW5lLmVuZHNXaXRoKCAnLnRzJyApICYmICggbGluZS5pbmNsdWRlcyggJy8nICkgfHwgbGluZS5pbmNsdWRlcyggJ1xcXFwnICkgKSApIHtcclxuICAgICAgY3VycmVudEZpbGUgPSBsaW5lO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGxpbmUuaW5jbHVkZXMoICdlcnJvcicgKSAmJiBsaW5lLmVuZHNXaXRoKCAnQHR5cGVzY3JpcHQtZXNsaW50L2V4cGxpY2l0LW1lbWJlci1hY2Nlc3NpYmlsaXR5JyApICkge1xyXG4gICAgICBjb25zdCBzdWJzdHJpbmcgPSBsaW5lLnN1YnN0cmluZyggMCwgbGluZS5pbmRleE9mKCAnZXJyb3InICkgKTtcclxuICAgICAgY29uc3QgdGVybXMgPSBzdWJzdHJpbmcudHJpbSgpLnNwbGl0KCAnOicgKTtcclxuICAgICAgY29uc3QgbGluZU51bWJlciA9IE51bWJlciggdGVybXNbIDAgXSApO1xyXG4gICAgICBjb25zdCBjb2x1bW4gPSBOdW1iZXIoIHRlcm1zWyAxIF0gKTtcclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKCBjdXJyZW50RmlsZSwgbGluZU51bWJlciwgY29sdW1uICk7XHJcblxyXG4gICAgICBjb25zdCBmaWxlID0gZnMucmVhZEZpbGVTeW5jKCBjdXJyZW50RmlsZSwgJ3V0ZjgnICk7XHJcbiAgICAgIGNvbnN0IGxpbmVzID0gZmlsZS5zcGxpdCggJ1xcbicgKTtcclxuXHJcbiAgICAgIGxpbmVzWyBsaW5lTnVtYmVyIC0gMSBdID0gbGluZXNbIGxpbmVOdW1iZXIgLSAxIF0uc3Vic3RyaW5nKCAwLCBjb2x1bW4gLSAxICkgKyBtb2RpZmllciArICcgJyArIGxpbmVzWyBsaW5lTnVtYmVyIC0gMSBdLnN1YnN0cmluZyggY29sdW1uIC0gMSApO1xyXG4gICAgICBjb25zb2xlLmxvZyggbGluZXNbIGxpbmVOdW1iZXIgLSAxIF0gKTtcclxuXHJcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoIGN1cnJlbnRGaWxlLCBsaW5lcy5qb2luKCAnXFxuJyApICk7XHJcbiAgICB9XHJcbiAgfSApO1xyXG59ICkoKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBLE1BQU1BLENBQUMsR0FBR0MsT0FBTyxDQUFFLFFBQVMsQ0FBQyxDQUFDLENBQUM7QUFDL0IsTUFBTUMsRUFBRSxHQUFHRCxPQUFPLENBQUUsSUFBSyxDQUFDOztBQUUxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBRSxZQUFZO0VBQ1osTUFBTUUsSUFBSSxHQUFHQyxPQUFPLENBQUNDLElBQUksQ0FBQ0MsS0FBSyxDQUFFLENBQUUsQ0FBQztFQUNwQyxNQUFNQyxRQUFRLEdBQUdKLElBQUksQ0FBRSxDQUFDLENBQUU7RUFDMUIsTUFBTUssUUFBUSxHQUFHTCxJQUFJLENBQUUsQ0FBQyxDQUFFO0VBRTFCLE1BQU1NLE1BQU0sR0FBR1AsRUFBRSxDQUFDUSxZQUFZLENBQUVILFFBQVEsRUFBRSxNQUFPLENBQUMsQ0FBQ0ksSUFBSSxDQUFDLENBQUM7RUFDekQsTUFBTUMsS0FBSyxHQUFHSCxNQUFNLENBQUNJLEtBQUssQ0FBRSxJQUFLLENBQUMsQ0FBQ0MsR0FBRyxDQUFFQyxHQUFHLElBQUlBLEdBQUcsQ0FBQ0osSUFBSSxDQUFDLENBQUUsQ0FBQztFQUUzRCxJQUFJSyxXQUFXLEdBQUcsSUFBSTtFQUN0QkosS0FBSyxDQUFDSyxPQUFPLENBQUVDLElBQUksSUFBSTtJQUNyQixJQUFLQSxJQUFJLENBQUNDLFFBQVEsQ0FBRSxLQUFNLENBQUMsS0FBTUQsSUFBSSxDQUFDRSxRQUFRLENBQUUsR0FBSSxDQUFDLElBQUlGLElBQUksQ0FBQ0UsUUFBUSxDQUFFLElBQUssQ0FBQyxDQUFFLEVBQUc7TUFDakZKLFdBQVcsR0FBR0UsSUFBSTtJQUNwQixDQUFDLE1BQ0ksSUFBS0EsSUFBSSxDQUFDRSxRQUFRLENBQUUsT0FBUSxDQUFDLElBQUlGLElBQUksQ0FBQ0MsUUFBUSxDQUFFLGtEQUFtRCxDQUFDLEVBQUc7TUFDMUcsTUFBTUUsU0FBUyxHQUFHSCxJQUFJLENBQUNHLFNBQVMsQ0FBRSxDQUFDLEVBQUVILElBQUksQ0FBQ0ksT0FBTyxDQUFFLE9BQVEsQ0FBRSxDQUFDO01BQzlELE1BQU1DLEtBQUssR0FBR0YsU0FBUyxDQUFDVixJQUFJLENBQUMsQ0FBQyxDQUFDRSxLQUFLLENBQUUsR0FBSSxDQUFDO01BQzNDLE1BQU1XLFVBQVUsR0FBR0MsTUFBTSxDQUFFRixLQUFLLENBQUUsQ0FBQyxDQUFHLENBQUM7TUFDdkMsTUFBTUcsTUFBTSxHQUFHRCxNQUFNLENBQUVGLEtBQUssQ0FBRSxDQUFDLENBQUcsQ0FBQztNQUVuQ0ksT0FBTyxDQUFDQyxHQUFHLENBQUVaLFdBQVcsRUFBRVEsVUFBVSxFQUFFRSxNQUFPLENBQUM7TUFFOUMsTUFBTUcsSUFBSSxHQUFHM0IsRUFBRSxDQUFDUSxZQUFZLENBQUVNLFdBQVcsRUFBRSxNQUFPLENBQUM7TUFDbkQsTUFBTUosS0FBSyxHQUFHaUIsSUFBSSxDQUFDaEIsS0FBSyxDQUFFLElBQUssQ0FBQztNQUVoQ0QsS0FBSyxDQUFFWSxVQUFVLEdBQUcsQ0FBQyxDQUFFLEdBQUdaLEtBQUssQ0FBRVksVUFBVSxHQUFHLENBQUMsQ0FBRSxDQUFDSCxTQUFTLENBQUUsQ0FBQyxFQUFFSyxNQUFNLEdBQUcsQ0FBRSxDQUFDLEdBQUdsQixRQUFRLEdBQUcsR0FBRyxHQUFHSSxLQUFLLENBQUVZLFVBQVUsR0FBRyxDQUFDLENBQUUsQ0FBQ0gsU0FBUyxDQUFFSyxNQUFNLEdBQUcsQ0FBRSxDQUFDO01BQy9JQyxPQUFPLENBQUNDLEdBQUcsQ0FBRWhCLEtBQUssQ0FBRVksVUFBVSxHQUFHLENBQUMsQ0FBRyxDQUFDO01BRXRDdEIsRUFBRSxDQUFDNEIsYUFBYSxDQUFFZCxXQUFXLEVBQUVKLEtBQUssQ0FBQ21CLElBQUksQ0FBRSxJQUFLLENBQUUsQ0FBQztJQUNyRDtFQUNGLENBQUUsQ0FBQztBQUNMLENBQUMsRUFBRyxDQUFDIn0=