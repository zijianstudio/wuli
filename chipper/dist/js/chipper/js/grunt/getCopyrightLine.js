// Copyright 2021, University of Colorado Boulder

/**
 * Function that determines created and last modified dates from git, see #403. If the file is not tracked in git
 * then returns a copyright statement with the current year.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const execute = require('../../../perennial-alias/js/common/execute');

/**
 * @public
 * @param {string} repo - The repository of the file to update (should be a git root)
 * @param {string} relativeFile - The filename relative to the repository root.
 * @returns {Promise}
 */
module.exports = async (repo, relativeFile) => {
  let startDate = (await execute('git', ['log', '--diff-filter=A', '--follow', '--date=short', '--format=%cd', '-1', '--', relativeFile], `../${repo}`)).trim().split('-')[0];
  const endDate = (await execute('git', ['log', '--follow', '--date=short', '--format=%cd', '-1', '--', relativeFile], `../${repo}`)).trim().split('-')[0];
  let dateString = '';

  // git was unable to get any information about the file. Perhaps it is new or not yet tracked in get? Use the current year.
  if (startDate === '' && endDate === '') {
    dateString = new Date().getFullYear();
  } else {
    // There is a bug with the first git log command that sometimes yields a blank link as output
    // You can find occurrences of this by searching our repos for "Copyright 2002-"
    if (startDate === '') {
      startDate = '2002';
    }

    // Create the single date or date range to use in the copyright statement
    dateString = startDate === endDate ? startDate : `${startDate}-${endDate}`;
  }
  return `// Copyright ${dateString}, University of Colorado Boulder`;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJleGVjdXRlIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJyZXBvIiwicmVsYXRpdmVGaWxlIiwic3RhcnREYXRlIiwidHJpbSIsInNwbGl0IiwiZW5kRGF0ZSIsImRhdGVTdHJpbmciLCJEYXRlIiwiZ2V0RnVsbFllYXIiXSwic291cmNlcyI6WyJnZXRDb3B5cmlnaHRMaW5lLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBGdW5jdGlvbiB0aGF0IGRldGVybWluZXMgY3JlYXRlZCBhbmQgbGFzdCBtb2RpZmllZCBkYXRlcyBmcm9tIGdpdCwgc2VlICM0MDMuIElmIHRoZSBmaWxlIGlzIG5vdCB0cmFja2VkIGluIGdpdFxyXG4gKiB0aGVuIHJldHVybnMgYSBjb3B5cmlnaHQgc3RhdGVtZW50IHdpdGggdGhlIGN1cnJlbnQgeWVhci5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcblxyXG5jb25zdCBleGVjdXRlID0gcmVxdWlyZSggJy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vZXhlY3V0ZScgKTtcclxuXHJcbi8qKlxyXG4gKiBAcHVibGljXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvIC0gVGhlIHJlcG9zaXRvcnkgb2YgdGhlIGZpbGUgdG8gdXBkYXRlIChzaG91bGQgYmUgYSBnaXQgcm9vdClcclxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlRmlsZSAtIFRoZSBmaWxlbmFtZSByZWxhdGl2ZSB0byB0aGUgcmVwb3NpdG9yeSByb290LlxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZX1cclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgKCByZXBvLCByZWxhdGl2ZUZpbGUgKSA9PiB7XHJcblxyXG4gIGxldCBzdGFydERhdGUgPSAoIGF3YWl0IGV4ZWN1dGUoICdnaXQnLCBbXHJcbiAgICAnbG9nJywgJy0tZGlmZi1maWx0ZXI9QScsICctLWZvbGxvdycsICctLWRhdGU9c2hvcnQnLCAnLS1mb3JtYXQ9JWNkJywgJy0xJywgJy0tJywgcmVsYXRpdmVGaWxlXHJcbiAgXSwgYC4uLyR7cmVwb31gICkgKS50cmltKCkuc3BsaXQoICctJyApWyAwIF07XHJcblxyXG4gIGNvbnN0IGVuZERhdGUgPSAoIGF3YWl0IGV4ZWN1dGUoICdnaXQnLCBbXHJcbiAgICAnbG9nJywgJy0tZm9sbG93JywgJy0tZGF0ZT1zaG9ydCcsICctLWZvcm1hdD0lY2QnLCAnLTEnLCAnLS0nLCByZWxhdGl2ZUZpbGVcclxuICBdLCBgLi4vJHtyZXBvfWAgKSApLnRyaW0oKS5zcGxpdCggJy0nIClbIDAgXTtcclxuXHJcbiAgbGV0IGRhdGVTdHJpbmcgPSAnJztcclxuXHJcbiAgLy8gZ2l0IHdhcyB1bmFibGUgdG8gZ2V0IGFueSBpbmZvcm1hdGlvbiBhYm91dCB0aGUgZmlsZS4gUGVyaGFwcyBpdCBpcyBuZXcgb3Igbm90IHlldCB0cmFja2VkIGluIGdldD8gVXNlIHRoZSBjdXJyZW50IHllYXIuXHJcbiAgaWYgKCBzdGFydERhdGUgPT09ICcnICYmIGVuZERhdGUgPT09ICcnICkge1xyXG4gICAgZGF0ZVN0cmluZyA9IG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKTtcclxuICB9XHJcbiAgZWxzZSB7XHJcblxyXG4gICAgLy8gVGhlcmUgaXMgYSBidWcgd2l0aCB0aGUgZmlyc3QgZ2l0IGxvZyBjb21tYW5kIHRoYXQgc29tZXRpbWVzIHlpZWxkcyBhIGJsYW5rIGxpbmsgYXMgb3V0cHV0XHJcbiAgICAvLyBZb3UgY2FuIGZpbmQgb2NjdXJyZW5jZXMgb2YgdGhpcyBieSBzZWFyY2hpbmcgb3VyIHJlcG9zIGZvciBcIkNvcHlyaWdodCAyMDAyLVwiXHJcbiAgICBpZiAoIHN0YXJ0RGF0ZSA9PT0gJycgKSB7XHJcbiAgICAgIHN0YXJ0RGF0ZSA9ICcyMDAyJztcclxuICAgIH1cclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIHNpbmdsZSBkYXRlIG9yIGRhdGUgcmFuZ2UgdG8gdXNlIGluIHRoZSBjb3B5cmlnaHQgc3RhdGVtZW50XHJcbiAgICBkYXRlU3RyaW5nID0gKCBzdGFydERhdGUgPT09IGVuZERhdGUgKSA/IHN0YXJ0RGF0ZSA6ICggYCR7c3RhcnREYXRlfS0ke2VuZERhdGV9YCApO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGAvLyBDb3B5cmlnaHQgJHtkYXRlU3RyaW5nfSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyYDtcclxufTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxNQUFNQSxPQUFPLEdBQUdDLE9BQU8sQ0FBRSw0Q0FBNkMsQ0FBQzs7QUFFdkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FDLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHLE9BQVFDLElBQUksRUFBRUMsWUFBWSxLQUFNO0VBRS9DLElBQUlDLFNBQVMsR0FBRyxDQUFFLE1BQU1OLE9BQU8sQ0FBRSxLQUFLLEVBQUUsQ0FDdEMsS0FBSyxFQUFFLGlCQUFpQixFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUVLLFlBQVksQ0FDL0YsRUFBRyxNQUFLRCxJQUFLLEVBQUUsQ0FBQyxFQUFHRyxJQUFJLENBQUMsQ0FBQyxDQUFDQyxLQUFLLENBQUUsR0FBSSxDQUFDLENBQUUsQ0FBQyxDQUFFO0VBRTVDLE1BQU1DLE9BQU8sR0FBRyxDQUFFLE1BQU1ULE9BQU8sQ0FBRSxLQUFLLEVBQUUsQ0FDdEMsS0FBSyxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUVLLFlBQVksQ0FDNUUsRUFBRyxNQUFLRCxJQUFLLEVBQUUsQ0FBQyxFQUFHRyxJQUFJLENBQUMsQ0FBQyxDQUFDQyxLQUFLLENBQUUsR0FBSSxDQUFDLENBQUUsQ0FBQyxDQUFFO0VBRTVDLElBQUlFLFVBQVUsR0FBRyxFQUFFOztFQUVuQjtFQUNBLElBQUtKLFNBQVMsS0FBSyxFQUFFLElBQUlHLE9BQU8sS0FBSyxFQUFFLEVBQUc7SUFDeENDLFVBQVUsR0FBRyxJQUFJQyxJQUFJLENBQUMsQ0FBQyxDQUFDQyxXQUFXLENBQUMsQ0FBQztFQUN2QyxDQUFDLE1BQ0k7SUFFSDtJQUNBO0lBQ0EsSUFBS04sU0FBUyxLQUFLLEVBQUUsRUFBRztNQUN0QkEsU0FBUyxHQUFHLE1BQU07SUFDcEI7O0lBRUE7SUFDQUksVUFBVSxHQUFLSixTQUFTLEtBQUtHLE9BQU8sR0FBS0gsU0FBUyxHQUFNLEdBQUVBLFNBQVUsSUFBR0csT0FBUSxFQUFHO0VBQ3BGO0VBRUEsT0FBUSxnQkFBZUMsVUFBVyxrQ0FBaUM7QUFDckUsQ0FBQyJ9