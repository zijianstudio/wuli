// Copyright 2019-2022, University of Colorado Boulder

/**
 * NaturalSelectionUtils defines utility functions that are used throughout this simulation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Tandem from '../../../tandem/js/Tandem.js';
import naturalSelection from '../naturalSelection.js';
const NaturalSelectionUtils = {
  /**
   * Determines the time that it takes to execute a specified function.
   * @param f - the function to execute
   * @returns the time to complete f, in ms
   */
  time(f) {
    const tBefore = performance.now();
    f();
    return performance.now() - tBefore;
  },
  /**
   * Logs the time that it takes to execute a specified function.
   * Used for debugging during implementation, and should not appear in production.
   *
   * For example, if you want to time this:
   *   this.step( dt );
   * Wrap it like this:
   *   logTime( 'step', () => this.step( dt ) );
   * Console output will look like this:
   *   step took 56.68500000001586 ms
   *
   * @param name - name used to identify the function in the log message
   * @param f - the function to execute
   */
  logTime(name, f) {
    console.log(`${name} took ${NaturalSelectionUtils.time(f)} ms`);
  },
  /**
   * Determines whether an array is sorted. Duplicates are allowed, and an empty array is considered sorted.
   * @param array - the array to examine
   * @param [compare] - the comparison function, defaults to ascending numbers
   */
  isSorted(array, compare) {
    compare = compare || ((value, nextValue) => value <= nextValue);
    let isSorted = true;
    for (let i = 1; i < array.length - 1 && isSorted; i++) {
      isSorted = compare(array[i], array[i + 1]);
    }
    return isSorted;
  },
  /**
   * Determines whether an array is sorted in descending order.
   * Duplicates are allowed, and an empty array is considered sorted.
   */
  isSortedDescending(array) {
    return NaturalSelectionUtils.isSorted(array, (value, nextValue) => value >= nextValue);
  },
  /**
   * Determines whether a value is a positive integer.
   */
  isPositiveInteger(value) {
    return Number.isInteger(value) && value > 0;
  },
  /**
   * Determines whether a value is a non-negative integer.
   */
  isNonNegativeInteger(value) {
    return Number.isInteger(value) && value >= 0;
  },
  /**
   * Determines whether a value is a percentage, between 0 and 1.
   */
  isPercent(value) {
    return value >= 0 && value <= 1;
  },
  /**
   * Determines whether a value is a Range for a percentage, between 0 and 1.
   */
  isPercentRange(range) {
    return range.min >= 0 && range.max <= 1;
  },
  /**
   * Gets the PhET-iO element for a specified phetioID. This is intended to be used as a debugging tool,
   * to inspect a PhET-iO element in the console. Do not use this to access elements via code!
   *
   * Example: phet.naturalSelection.NaturalSelectionUtils.getElement( 'naturalSelection.labScreen' )
   */
  getElement(phetioID) {
    if (Tandem.PHET_IO_ENABLED) {
      return phet.phetio.phetioEngine.phetioObjectMap[phetioID];
    } else {
      console.warn('PhET-iO is not initialized');
      return undefined;
    }
  }
};
naturalSelection.register('NaturalSelectionUtils', NaturalSelectionUtils);
export default NaturalSelectionUtils;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUYW5kZW0iLCJuYXR1cmFsU2VsZWN0aW9uIiwiTmF0dXJhbFNlbGVjdGlvblV0aWxzIiwidGltZSIsImYiLCJ0QmVmb3JlIiwicGVyZm9ybWFuY2UiLCJub3ciLCJsb2dUaW1lIiwibmFtZSIsImNvbnNvbGUiLCJsb2ciLCJpc1NvcnRlZCIsImFycmF5IiwiY29tcGFyZSIsInZhbHVlIiwibmV4dFZhbHVlIiwiaSIsImxlbmd0aCIsImlzU29ydGVkRGVzY2VuZGluZyIsImlzUG9zaXRpdmVJbnRlZ2VyIiwiTnVtYmVyIiwiaXNJbnRlZ2VyIiwiaXNOb25OZWdhdGl2ZUludGVnZXIiLCJpc1BlcmNlbnQiLCJpc1BlcmNlbnRSYW5nZSIsInJhbmdlIiwibWluIiwibWF4IiwiZ2V0RWxlbWVudCIsInBoZXRpb0lEIiwiUEhFVF9JT19FTkFCTEVEIiwicGhldCIsInBoZXRpbyIsInBoZXRpb0VuZ2luZSIsInBoZXRpb09iamVjdE1hcCIsIndhcm4iLCJ1bmRlZmluZWQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk5hdHVyYWxTZWxlY3Rpb25VdGlscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBOYXR1cmFsU2VsZWN0aW9uVXRpbHMgZGVmaW5lcyB1dGlsaXR5IGZ1bmN0aW9ucyB0aGF0IGFyZSB1c2VkIHRocm91Z2hvdXQgdGhpcyBzaW11bGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgUGhldGlvT2JqZWN0IGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgbmF0dXJhbFNlbGVjdGlvbiBmcm9tICcuLi9uYXR1cmFsU2VsZWN0aW9uLmpzJztcclxuXHJcbmNvbnN0IE5hdHVyYWxTZWxlY3Rpb25VdGlscyA9IHtcclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyB0aGUgdGltZSB0aGF0IGl0IHRha2VzIHRvIGV4ZWN1dGUgYSBzcGVjaWZpZWQgZnVuY3Rpb24uXHJcbiAgICogQHBhcmFtIGYgLSB0aGUgZnVuY3Rpb24gdG8gZXhlY3V0ZVxyXG4gICAqIEByZXR1cm5zIHRoZSB0aW1lIHRvIGNvbXBsZXRlIGYsIGluIG1zXHJcbiAgICovXHJcbiAgdGltZSggZjogKCkgPT4gdm9pZCApOiBudW1iZXIge1xyXG4gICAgY29uc3QgdEJlZm9yZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgZigpO1xyXG4gICAgcmV0dXJuIHBlcmZvcm1hbmNlLm5vdygpIC0gdEJlZm9yZTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBMb2dzIHRoZSB0aW1lIHRoYXQgaXQgdGFrZXMgdG8gZXhlY3V0ZSBhIHNwZWNpZmllZCBmdW5jdGlvbi5cclxuICAgKiBVc2VkIGZvciBkZWJ1Z2dpbmcgZHVyaW5nIGltcGxlbWVudGF0aW9uLCBhbmQgc2hvdWxkIG5vdCBhcHBlYXIgaW4gcHJvZHVjdGlvbi5cclxuICAgKlxyXG4gICAqIEZvciBleGFtcGxlLCBpZiB5b3Ugd2FudCB0byB0aW1lIHRoaXM6XHJcbiAgICogICB0aGlzLnN0ZXAoIGR0ICk7XHJcbiAgICogV3JhcCBpdCBsaWtlIHRoaXM6XHJcbiAgICogICBsb2dUaW1lKCAnc3RlcCcsICgpID0+IHRoaXMuc3RlcCggZHQgKSApO1xyXG4gICAqIENvbnNvbGUgb3V0cHV0IHdpbGwgbG9vayBsaWtlIHRoaXM6XHJcbiAgICogICBzdGVwIHRvb2sgNTYuNjg1MDAwMDAwMDE1ODYgbXNcclxuICAgKlxyXG4gICAqIEBwYXJhbSBuYW1lIC0gbmFtZSB1c2VkIHRvIGlkZW50aWZ5IHRoZSBmdW5jdGlvbiBpbiB0aGUgbG9nIG1lc3NhZ2VcclxuICAgKiBAcGFyYW0gZiAtIHRoZSBmdW5jdGlvbiB0byBleGVjdXRlXHJcbiAgICovXHJcbiAgbG9nVGltZSggbmFtZTogc3RyaW5nLCBmOiAoKSA9PiB2b2lkICk6IHZvaWQge1xyXG4gICAgY29uc29sZS5sb2coIGAke25hbWV9IHRvb2sgJHtOYXR1cmFsU2VsZWN0aW9uVXRpbHMudGltZSggZiApfSBtc2AgKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgYW4gYXJyYXkgaXMgc29ydGVkLiBEdXBsaWNhdGVzIGFyZSBhbGxvd2VkLCBhbmQgYW4gZW1wdHkgYXJyYXkgaXMgY29uc2lkZXJlZCBzb3J0ZWQuXHJcbiAgICogQHBhcmFtIGFycmF5IC0gdGhlIGFycmF5IHRvIGV4YW1pbmVcclxuICAgKiBAcGFyYW0gW2NvbXBhcmVdIC0gdGhlIGNvbXBhcmlzb24gZnVuY3Rpb24sIGRlZmF1bHRzIHRvIGFzY2VuZGluZyBudW1iZXJzXHJcbiAgICovXHJcbiAgaXNTb3J0ZWQ8VD4oIGFycmF5OiBUW10sIGNvbXBhcmU/OiAoIHZhbHVlOiBULCBuZXh0VmFsdWU6IFQgKSA9PiBib29sZWFuICk6IGJvb2xlYW4ge1xyXG4gICAgY29tcGFyZSA9IGNvbXBhcmUgfHwgKCAoIHZhbHVlLCBuZXh0VmFsdWUgKSA9PiB2YWx1ZSA8PSBuZXh0VmFsdWUgKTtcclxuICAgIGxldCBpc1NvcnRlZCA9IHRydWU7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPCBhcnJheS5sZW5ndGggLSAxICYmIGlzU29ydGVkOyBpKysgKSB7XHJcbiAgICAgIGlzU29ydGVkID0gY29tcGFyZSggYXJyYXlbIGkgXSwgYXJyYXlbIGkgKyAxIF0gKTtcclxuICAgIH1cclxuICAgIHJldHVybiBpc1NvcnRlZDtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgYW4gYXJyYXkgaXMgc29ydGVkIGluIGRlc2NlbmRpbmcgb3JkZXIuXHJcbiAgICogRHVwbGljYXRlcyBhcmUgYWxsb3dlZCwgYW5kIGFuIGVtcHR5IGFycmF5IGlzIGNvbnNpZGVyZWQgc29ydGVkLlxyXG4gICAqL1xyXG4gIGlzU29ydGVkRGVzY2VuZGluZzxUPiggYXJyYXk6IFRbXSApOiBib29sZWFuIHtcclxuICAgIHJldHVybiBOYXR1cmFsU2VsZWN0aW9uVXRpbHMuaXNTb3J0ZWQ8VD4oIGFycmF5LCAoIHZhbHVlLCBuZXh0VmFsdWUgKSA9PiB2YWx1ZSA+PSBuZXh0VmFsdWUgKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgYSB2YWx1ZSBpcyBhIHBvc2l0aXZlIGludGVnZXIuXHJcbiAgICovXHJcbiAgaXNQb3NpdGl2ZUludGVnZXIoIHZhbHVlOiBudW1iZXIgKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gTnVtYmVyLmlzSW50ZWdlciggdmFsdWUgKSAmJiB2YWx1ZSA+IDA7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGEgdmFsdWUgaXMgYSBub24tbmVnYXRpdmUgaW50ZWdlci5cclxuICAgKi9cclxuICBpc05vbk5lZ2F0aXZlSW50ZWdlciggdmFsdWU6IG51bWJlciApOiBib29sZWFuIHtcclxuICAgIHJldHVybiBOdW1iZXIuaXNJbnRlZ2VyKCB2YWx1ZSApICYmIHZhbHVlID49IDA7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGEgdmFsdWUgaXMgYSBwZXJjZW50YWdlLCBiZXR3ZWVuIDAgYW5kIDEuXHJcbiAgICovXHJcbiAgaXNQZXJjZW50KCB2YWx1ZTogbnVtYmVyICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICggdmFsdWUgPj0gMCApICYmICggdmFsdWUgPD0gMSApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgd2hldGhlciBhIHZhbHVlIGlzIGEgUmFuZ2UgZm9yIGEgcGVyY2VudGFnZSwgYmV0d2VlbiAwIGFuZCAxLlxyXG4gICAqL1xyXG4gIGlzUGVyY2VudFJhbmdlKCByYW5nZTogUmFuZ2UgKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gKCByYW5nZS5taW4gPj0gMCApICYmICggcmFuZ2UubWF4IDw9IDEgKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBQaEVULWlPIGVsZW1lbnQgZm9yIGEgc3BlY2lmaWVkIHBoZXRpb0lELiBUaGlzIGlzIGludGVuZGVkIHRvIGJlIHVzZWQgYXMgYSBkZWJ1Z2dpbmcgdG9vbCxcclxuICAgKiB0byBpbnNwZWN0IGEgUGhFVC1pTyBlbGVtZW50IGluIHRoZSBjb25zb2xlLiBEbyBub3QgdXNlIHRoaXMgdG8gYWNjZXNzIGVsZW1lbnRzIHZpYSBjb2RlIVxyXG4gICAqXHJcbiAgICogRXhhbXBsZTogcGhldC5uYXR1cmFsU2VsZWN0aW9uLk5hdHVyYWxTZWxlY3Rpb25VdGlscy5nZXRFbGVtZW50KCAnbmF0dXJhbFNlbGVjdGlvbi5sYWJTY3JlZW4nIClcclxuICAgKi9cclxuICBnZXRFbGVtZW50KCBwaGV0aW9JRDogc3RyaW5nICk6IFBoZXRpb09iamVjdCB8IHVuZGVmaW5lZCB7XHJcbiAgICBpZiAoIFRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgKSB7XHJcbiAgICAgIHJldHVybiBwaGV0LnBoZXRpby5waGV0aW9FbmdpbmUucGhldGlvT2JqZWN0TWFwWyBwaGV0aW9JRCBdO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGNvbnNvbGUud2FybiggJ1BoRVQtaU8gaXMgbm90IGluaXRpYWxpemVkJyApO1xyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuXHJcbm5hdHVyYWxTZWxlY3Rpb24ucmVnaXN0ZXIoICdOYXR1cmFsU2VsZWN0aW9uVXRpbHMnLCBOYXR1cmFsU2VsZWN0aW9uVXRpbHMgKTtcclxu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