// Copyright 2022, University of Colorado Boulder

/**
 * A script that should only be run when factoring out disable-eslint comments so that we can turn on
 * Unicorn's no-abusive-disable-line rule.
 * The regex used to delete eslint-disable-line ^(.*) // ?eslint-disable-line$
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

const fs = require('fs');

/**
 * @param {ESLint.LintResult[]} results - the results from eslint.lintFiles( patterns )
 *                                      - { filePath: string, errorCount: number, warningCount: number }
 *                                      - see https://eslint.org/docs/latest/developer-guide/nodejs-api#-lintresult-type
 */
module.exports = results => {
  const errors = results.filter(result => result.errorCount > 0);
  errors.forEach(error => {
    error.messages.forEach(message => {
      if (!message.fix) {
        const fileContents = fs.readFileSync(error.filePath, 'utf-8');
        const fileLines = fileContents.split(/\r?\n/);
        if (fileLines[message.line - 1].includes('eslint-disable-line')) {
          fileLines[message.line - 1] += `, ${message.ruleId}`;
        } else {
          fileLines[message.line - 1] += ` // eslint-disable-line ${message.ruleId}`;
        }
        const newFileContents = fileLines.join('\n');
        fs.writeFileSync(error.filePath, newFileContents);
      }
    });
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmcyIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwicmVzdWx0cyIsImVycm9ycyIsImZpbHRlciIsInJlc3VsdCIsImVycm9yQ291bnQiLCJmb3JFYWNoIiwiZXJyb3IiLCJtZXNzYWdlcyIsIm1lc3NhZ2UiLCJmaXgiLCJmaWxlQ29udGVudHMiLCJyZWFkRmlsZVN5bmMiLCJmaWxlUGF0aCIsImZpbGVMaW5lcyIsInNwbGl0IiwibGluZSIsImluY2x1ZGVzIiwicnVsZUlkIiwibmV3RmlsZUNvbnRlbnRzIiwiam9pbiIsIndyaXRlRmlsZVN5bmMiXSwic291cmNlcyI6WyJkaXNhYmxlV2l0aENvbW1lbnQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgc2NyaXB0IHRoYXQgc2hvdWxkIG9ubHkgYmUgcnVuIHdoZW4gZmFjdG9yaW5nIG91dCBkaXNhYmxlLWVzbGludCBjb21tZW50cyBzbyB0aGF0IHdlIGNhbiB0dXJuIG9uXHJcbiAqIFVuaWNvcm4ncyBuby1hYnVzaXZlLWRpc2FibGUtbGluZSBydWxlLlxyXG4gKiBUaGUgcmVnZXggdXNlZCB0byBkZWxldGUgZXNsaW50LWRpc2FibGUtbGluZSBeKC4qKSAvLyA/ZXNsaW50LWRpc2FibGUtbGluZSRcclxuICpcclxuICogQGF1dGhvciBNYXJsYSBTY2h1bHogKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtFU0xpbnQuTGludFJlc3VsdFtdfSByZXN1bHRzIC0gdGhlIHJlc3VsdHMgZnJvbSBlc2xpbnQubGludEZpbGVzKCBwYXR0ZXJucyApXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIHsgZmlsZVBhdGg6IHN0cmluZywgZXJyb3JDb3VudDogbnVtYmVyLCB3YXJuaW5nQ291bnQ6IG51bWJlciB9XHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIHNlZSBodHRwczovL2VzbGludC5vcmcvZG9jcy9sYXRlc3QvZGV2ZWxvcGVyLWd1aWRlL25vZGVqcy1hcGkjLWxpbnRyZXN1bHQtdHlwZVxyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSByZXN1bHRzID0+IHtcclxuXHJcbiAgY29uc3QgZXJyb3JzID0gcmVzdWx0cy5maWx0ZXIoIHJlc3VsdCA9PiByZXN1bHQuZXJyb3JDb3VudCA+IDAgKTtcclxuICBlcnJvcnMuZm9yRWFjaCggZXJyb3IgPT4ge1xyXG4gICAgZXJyb3IubWVzc2FnZXMuZm9yRWFjaCggbWVzc2FnZSA9PiB7XHJcbiAgICAgIGlmICggIW1lc3NhZ2UuZml4ICkge1xyXG4gICAgICAgIGNvbnN0IGZpbGVDb250ZW50cyA9IGZzLnJlYWRGaWxlU3luYyggZXJyb3IuZmlsZVBhdGgsICd1dGYtOCcgKTtcclxuICAgICAgICBjb25zdCBmaWxlTGluZXMgPSBmaWxlQ29udGVudHMuc3BsaXQoIC9cXHI/XFxuLyApO1xyXG5cclxuICAgICAgICBpZiAoIGZpbGVMaW5lc1sgbWVzc2FnZS5saW5lIC0gMSBdLmluY2x1ZGVzKCAnZXNsaW50LWRpc2FibGUtbGluZScgKSApIHtcclxuICAgICAgICAgIGZpbGVMaW5lc1sgbWVzc2FnZS5saW5lIC0gMSBdICs9IGAsICR7bWVzc2FnZS5ydWxlSWR9YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBmaWxlTGluZXNbIG1lc3NhZ2UubGluZSAtIDEgXSArPSBgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgJHttZXNzYWdlLnJ1bGVJZH1gO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbmV3RmlsZUNvbnRlbnRzID0gZmlsZUxpbmVzLmpvaW4oICdcXG4nICk7XHJcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyggZXJyb3IuZmlsZVBhdGgsIG5ld0ZpbGVDb250ZW50cyApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfSApO1xyXG59OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNQSxFQUFFLEdBQUdDLE9BQU8sQ0FBRSxJQUFLLENBQUM7O0FBRTFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQUMsTUFBTSxDQUFDQyxPQUFPLEdBQUdDLE9BQU8sSUFBSTtFQUUxQixNQUFNQyxNQUFNLEdBQUdELE9BQU8sQ0FBQ0UsTUFBTSxDQUFFQyxNQUFNLElBQUlBLE1BQU0sQ0FBQ0MsVUFBVSxHQUFHLENBQUUsQ0FBQztFQUNoRUgsTUFBTSxDQUFDSSxPQUFPLENBQUVDLEtBQUssSUFBSTtJQUN2QkEsS0FBSyxDQUFDQyxRQUFRLENBQUNGLE9BQU8sQ0FBRUcsT0FBTyxJQUFJO01BQ2pDLElBQUssQ0FBQ0EsT0FBTyxDQUFDQyxHQUFHLEVBQUc7UUFDbEIsTUFBTUMsWUFBWSxHQUFHZCxFQUFFLENBQUNlLFlBQVksQ0FBRUwsS0FBSyxDQUFDTSxRQUFRLEVBQUUsT0FBUSxDQUFDO1FBQy9ELE1BQU1DLFNBQVMsR0FBR0gsWUFBWSxDQUFDSSxLQUFLLENBQUUsT0FBUSxDQUFDO1FBRS9DLElBQUtELFNBQVMsQ0FBRUwsT0FBTyxDQUFDTyxJQUFJLEdBQUcsQ0FBQyxDQUFFLENBQUNDLFFBQVEsQ0FBRSxxQkFBc0IsQ0FBQyxFQUFHO1VBQ3JFSCxTQUFTLENBQUVMLE9BQU8sQ0FBQ08sSUFBSSxHQUFHLENBQUMsQ0FBRSxJQUFLLEtBQUlQLE9BQU8sQ0FBQ1MsTUFBTyxFQUFDO1FBQ3hELENBQUMsTUFDSTtVQUNISixTQUFTLENBQUVMLE9BQU8sQ0FBQ08sSUFBSSxHQUFHLENBQUMsQ0FBRSxJQUFLLDJCQUEwQlAsT0FBTyxDQUFDUyxNQUFPLEVBQUM7UUFDOUU7UUFFQSxNQUFNQyxlQUFlLEdBQUdMLFNBQVMsQ0FBQ00sSUFBSSxDQUFFLElBQUssQ0FBQztRQUM5Q3ZCLEVBQUUsQ0FBQ3dCLGFBQWEsQ0FBRWQsS0FBSyxDQUFDTSxRQUFRLEVBQUVNLGVBQWdCLENBQUM7TUFDckQ7SUFDRixDQUFFLENBQUM7RUFDTCxDQUFFLENBQUM7QUFDTCxDQUFDIn0=