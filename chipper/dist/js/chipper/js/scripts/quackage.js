// Copyright 2022, University of Colorado Boulder

const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2);

/**
 * Work around import problems in WebStorm/IntelliJ by temporarily renaming package.json to another name.
 * @param {string} file - path to start searching for package.json in
 */
function visit(file) {
  const parentDir = path.dirname(file);
  const packageFile = parentDir + path.sep + 'package.json';
  const quackageFile = parentDir + path.sep + 'quackage.json';
  if (fs.existsSync(packageFile) && fs.existsSync(quackageFile)) {
    throw new Error('too many ackages');
  } else if (fs.existsSync(packageFile)) {
    console.log(`renaming ${packageFile} => ${quackageFile}`);
    fs.renameSync(packageFile, quackageFile);
  } else if (fs.existsSync(quackageFile)) {
    console.log(`renaming ${quackageFile} => ${packageFile}`);
    fs.renameSync(quackageFile, packageFile);
  } else {
    visit(parentDir);
  }
}
visit(args[0]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmcyIsInJlcXVpcmUiLCJwYXRoIiwiYXJncyIsInByb2Nlc3MiLCJhcmd2Iiwic2xpY2UiLCJ2aXNpdCIsImZpbGUiLCJwYXJlbnREaXIiLCJkaXJuYW1lIiwicGFja2FnZUZpbGUiLCJzZXAiLCJxdWFja2FnZUZpbGUiLCJleGlzdHNTeW5jIiwiRXJyb3IiLCJjb25zb2xlIiwibG9nIiwicmVuYW1lU3luYyJdLCJzb3VyY2VzIjpbInF1YWNrYWdlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbmNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xyXG5jb25zdCBwYXRoID0gcmVxdWlyZSggJ3BhdGgnICk7XHJcblxyXG5jb25zdCBhcmdzID0gcHJvY2Vzcy5hcmd2LnNsaWNlKCAyICk7XHJcblxyXG4vKipcclxuICogV29yayBhcm91bmQgaW1wb3J0IHByb2JsZW1zIGluIFdlYlN0b3JtL0ludGVsbGlKIGJ5IHRlbXBvcmFyaWx5IHJlbmFtaW5nIHBhY2thZ2UuanNvbiB0byBhbm90aGVyIG5hbWUuXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlIC0gcGF0aCB0byBzdGFydCBzZWFyY2hpbmcgZm9yIHBhY2thZ2UuanNvbiBpblxyXG4gKi9cclxuZnVuY3Rpb24gdmlzaXQoIGZpbGUgKSB7XHJcblxyXG4gIGNvbnN0IHBhcmVudERpciA9IHBhdGguZGlybmFtZSggZmlsZSApO1xyXG4gIGNvbnN0IHBhY2thZ2VGaWxlID0gcGFyZW50RGlyICsgcGF0aC5zZXAgKyAncGFja2FnZS5qc29uJztcclxuICBjb25zdCBxdWFja2FnZUZpbGUgPSBwYXJlbnREaXIgKyBwYXRoLnNlcCArICdxdWFja2FnZS5qc29uJztcclxuXHJcbiAgaWYgKCBmcy5leGlzdHNTeW5jKCBwYWNrYWdlRmlsZSApICYmIGZzLmV4aXN0c1N5bmMoIHF1YWNrYWdlRmlsZSApICkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCAndG9vIG1hbnkgYWNrYWdlcycgKTtcclxuICB9XHJcbiAgZWxzZSBpZiAoIGZzLmV4aXN0c1N5bmMoIHBhY2thZ2VGaWxlICkgKSB7XHJcbiAgICBjb25zb2xlLmxvZyggYHJlbmFtaW5nICR7cGFja2FnZUZpbGV9ID0+ICR7cXVhY2thZ2VGaWxlfWAgKTtcclxuICAgIGZzLnJlbmFtZVN5bmMoIHBhY2thZ2VGaWxlLCBxdWFja2FnZUZpbGUgKTtcclxuICB9XHJcbiAgZWxzZSBpZiAoIGZzLmV4aXN0c1N5bmMoIHF1YWNrYWdlRmlsZSApICkge1xyXG4gICAgY29uc29sZS5sb2coIGByZW5hbWluZyAke3F1YWNrYWdlRmlsZX0gPT4gJHtwYWNrYWdlRmlsZX1gICk7XHJcbiAgICBmcy5yZW5hbWVTeW5jKCBxdWFja2FnZUZpbGUsIHBhY2thZ2VGaWxlICk7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgdmlzaXQoIHBhcmVudERpciApO1xyXG4gIH1cclxufVxyXG5cclxudmlzaXQoIGFyZ3NbIDAgXSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUEsTUFBTUEsRUFBRSxHQUFHQyxPQUFPLENBQUUsSUFBSyxDQUFDO0FBQzFCLE1BQU1DLElBQUksR0FBR0QsT0FBTyxDQUFFLE1BQU8sQ0FBQztBQUU5QixNQUFNRSxJQUFJLEdBQUdDLE9BQU8sQ0FBQ0MsSUFBSSxDQUFDQyxLQUFLLENBQUUsQ0FBRSxDQUFDOztBQUVwQztBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNDLEtBQUtBLENBQUVDLElBQUksRUFBRztFQUVyQixNQUFNQyxTQUFTLEdBQUdQLElBQUksQ0FBQ1EsT0FBTyxDQUFFRixJQUFLLENBQUM7RUFDdEMsTUFBTUcsV0FBVyxHQUFHRixTQUFTLEdBQUdQLElBQUksQ0FBQ1UsR0FBRyxHQUFHLGNBQWM7RUFDekQsTUFBTUMsWUFBWSxHQUFHSixTQUFTLEdBQUdQLElBQUksQ0FBQ1UsR0FBRyxHQUFHLGVBQWU7RUFFM0QsSUFBS1osRUFBRSxDQUFDYyxVQUFVLENBQUVILFdBQVksQ0FBQyxJQUFJWCxFQUFFLENBQUNjLFVBQVUsQ0FBRUQsWUFBYSxDQUFDLEVBQUc7SUFDbkUsTUFBTSxJQUFJRSxLQUFLLENBQUUsa0JBQW1CLENBQUM7RUFDdkMsQ0FBQyxNQUNJLElBQUtmLEVBQUUsQ0FBQ2MsVUFBVSxDQUFFSCxXQUFZLENBQUMsRUFBRztJQUN2Q0ssT0FBTyxDQUFDQyxHQUFHLENBQUcsWUFBV04sV0FBWSxPQUFNRSxZQUFhLEVBQUUsQ0FBQztJQUMzRGIsRUFBRSxDQUFDa0IsVUFBVSxDQUFFUCxXQUFXLEVBQUVFLFlBQWEsQ0FBQztFQUM1QyxDQUFDLE1BQ0ksSUFBS2IsRUFBRSxDQUFDYyxVQUFVLENBQUVELFlBQWEsQ0FBQyxFQUFHO0lBQ3hDRyxPQUFPLENBQUNDLEdBQUcsQ0FBRyxZQUFXSixZQUFhLE9BQU1GLFdBQVksRUFBRSxDQUFDO0lBQzNEWCxFQUFFLENBQUNrQixVQUFVLENBQUVMLFlBQVksRUFBRUYsV0FBWSxDQUFDO0VBQzVDLENBQUMsTUFDSTtJQUNISixLQUFLLENBQUVFLFNBQVUsQ0FBQztFQUNwQjtBQUNGO0FBRUFGLEtBQUssQ0FBRUosSUFBSSxDQUFFLENBQUMsQ0FBRyxDQUFDIn0=