// Copyright 2022, University of Colorado Boulder

/**
 * This script uses Deno and is run like so:
 *
 * grunt lint-everything > lintreport.txt
 * deno run --allow-read js/scripts/collate-lint.ts
 *
 * It counts failures of each rule
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
(() => {
  const text = Deno.readTextFileSync('./lintreport.txt');
  const lines = text.split('\n');
  let keys = [];
  lines.forEach(line => {
    if (line.includes('@typescript-eslint/')) {
      const key = line.substring(line.indexOf('@typescript-eslint/'));
      if (!keys.includes(key)) {
        keys.push(key);
      }
    }
  });
  console.log(keys);
  keys = keys.sort();
  keys.forEach(key => {
    let count = 0;
    lines.forEach(line => {
      if (line.includes(key)) {
        count++;
      }
    });
    console.log(key, count);
  });
})();
export {};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0ZXh0IiwiRGVubyIsInJlYWRUZXh0RmlsZVN5bmMiLCJsaW5lcyIsInNwbGl0Iiwia2V5cyIsImZvckVhY2giLCJsaW5lIiwiaW5jbHVkZXMiLCJrZXkiLCJzdWJzdHJpbmciLCJpbmRleE9mIiwicHVzaCIsImNvbnNvbGUiLCJsb2ciLCJzb3J0IiwiY291bnQiXSwic291cmNlcyI6WyJjb2xsYXRlLWxpbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoaXMgc2NyaXB0IHVzZXMgRGVubyBhbmQgaXMgcnVuIGxpa2Ugc286XHJcbiAqXHJcbiAqIGdydW50IGxpbnQtZXZlcnl0aGluZyA+IGxpbnRyZXBvcnQudHh0XHJcbiAqIGRlbm8gcnVuIC0tYWxsb3ctcmVhZCBqcy9zY3JpcHRzL2NvbGxhdGUtbGludC50c1xyXG4gKlxyXG4gKiBJdCBjb3VudHMgZmFpbHVyZXMgb2YgZWFjaCBydWxlXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG4oICgpID0+IHtcclxuXHJcbiAgY29uc3QgdGV4dDogc3RyaW5nID0gRGVuby5yZWFkVGV4dEZpbGVTeW5jKCAnLi9saW50cmVwb3J0LnR4dCcgKTtcclxuXHJcbiAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gdGV4dC5zcGxpdCggJ1xcbicgKTtcclxuICBsZXQga2V5czogc3RyaW5nW10gPSBbXTtcclxuICBsaW5lcy5mb3JFYWNoKCBsaW5lID0+IHtcclxuICAgIGlmICggbGluZS5pbmNsdWRlcyggJ0B0eXBlc2NyaXB0LWVzbGludC8nICkgKSB7XHJcbiAgICAgIGNvbnN0IGtleSA9IGxpbmUuc3Vic3RyaW5nKCBsaW5lLmluZGV4T2YoICdAdHlwZXNjcmlwdC1lc2xpbnQvJyApICk7XHJcbiAgICAgIGlmICggIWtleXMuaW5jbHVkZXMoIGtleSApICkge1xyXG4gICAgICAgIGtleXMucHVzaCgga2V5ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9ICk7XHJcbiAgY29uc29sZS5sb2coIGtleXMgKTtcclxuICBrZXlzID0ga2V5cy5zb3J0KCk7XHJcblxyXG4gIGtleXMuZm9yRWFjaCgga2V5ID0+IHtcclxuICAgIGxldCBjb3VudCA9IDA7XHJcbiAgICBsaW5lcy5mb3JFYWNoKCBsaW5lID0+IHtcclxuICAgICAgaWYgKCBsaW5lLmluY2x1ZGVzKCBrZXkgKSApIHtcclxuICAgICAgICBjb3VudCsrO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgICBjb25zb2xlLmxvZygga2V5LCBjb3VudCApO1xyXG4gIH0gKTtcclxufSApKCk7XHJcblxyXG5leHBvcnQge307Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUUsTUFBTTtFQUVOLE1BQU1BLElBQVksR0FBR0MsSUFBSSxDQUFDQyxnQkFBZ0IsQ0FBRSxrQkFBbUIsQ0FBQztFQUVoRSxNQUFNQyxLQUFlLEdBQUdILElBQUksQ0FBQ0ksS0FBSyxDQUFFLElBQUssQ0FBQztFQUMxQyxJQUFJQyxJQUFjLEdBQUcsRUFBRTtFQUN2QkYsS0FBSyxDQUFDRyxPQUFPLENBQUVDLElBQUksSUFBSTtJQUNyQixJQUFLQSxJQUFJLENBQUNDLFFBQVEsQ0FBRSxxQkFBc0IsQ0FBQyxFQUFHO01BQzVDLE1BQU1DLEdBQUcsR0FBR0YsSUFBSSxDQUFDRyxTQUFTLENBQUVILElBQUksQ0FBQ0ksT0FBTyxDQUFFLHFCQUFzQixDQUFFLENBQUM7TUFDbkUsSUFBSyxDQUFDTixJQUFJLENBQUNHLFFBQVEsQ0FBRUMsR0FBSSxDQUFDLEVBQUc7UUFDM0JKLElBQUksQ0FBQ08sSUFBSSxDQUFFSCxHQUFJLENBQUM7TUFDbEI7SUFDRjtFQUNGLENBQUUsQ0FBQztFQUNISSxPQUFPLENBQUNDLEdBQUcsQ0FBRVQsSUFBSyxDQUFDO0VBQ25CQSxJQUFJLEdBQUdBLElBQUksQ0FBQ1UsSUFBSSxDQUFDLENBQUM7RUFFbEJWLElBQUksQ0FBQ0MsT0FBTyxDQUFFRyxHQUFHLElBQUk7SUFDbkIsSUFBSU8sS0FBSyxHQUFHLENBQUM7SUFDYmIsS0FBSyxDQUFDRyxPQUFPLENBQUVDLElBQUksSUFBSTtNQUNyQixJQUFLQSxJQUFJLENBQUNDLFFBQVEsQ0FBRUMsR0FBSSxDQUFDLEVBQUc7UUFDMUJPLEtBQUssRUFBRTtNQUNUO0lBQ0YsQ0FBRSxDQUFDO0lBQ0hILE9BQU8sQ0FBQ0MsR0FBRyxDQUFFTCxHQUFHLEVBQUVPLEtBQU0sQ0FBQztFQUMzQixDQUFFLENBQUM7QUFDTCxDQUFDLEVBQUcsQ0FBQztBQUVMIn0=