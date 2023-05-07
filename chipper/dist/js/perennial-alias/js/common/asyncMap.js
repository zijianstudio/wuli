// Copyright 2020, University of Colorado Boulder

/**
 * Returns an array mapped asynchronously
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

/**
 * Returns an array mapped asynchronously
 *
 * @param {Array.<*>} list
 * @param {function({*}):*})} f
 * @returns {Promise.<Array.<*>>}
 */
const asyncMap = async (list, f) => {
  const items = [];
  let index = 0;
  for (const item of list) {
    items.push(await f(item, index++));
  }
  return items;
};
module.exports = asyncMap;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3luY01hcCIsImxpc3QiLCJmIiwiaXRlbXMiLCJpbmRleCIsIml0ZW0iLCJwdXNoIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJzb3VyY2VzIjpbImFzeW5jTWFwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIGFuIGFycmF5IG1hcHBlZCBhc3luY2hyb25vdXNseVxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYW4gYXJyYXkgbWFwcGVkIGFzeW5jaHJvbm91c2x5XHJcbiAqXHJcbiAqIEBwYXJhbSB7QXJyYXkuPCo+fSBsaXN0XHJcbiAqIEBwYXJhbSB7ZnVuY3Rpb24oeyp9KToqfSl9IGZcclxuICogQHJldHVybnMge1Byb21pc2UuPEFycmF5LjwqPj59XHJcbiAqL1xyXG5jb25zdCBhc3luY01hcCA9IGFzeW5jICggbGlzdCwgZiApID0+IHtcclxuICBjb25zdCBpdGVtcyA9IFtdO1xyXG4gIGxldCBpbmRleCA9IDA7XHJcbiAgZm9yICggY29uc3QgaXRlbSBvZiBsaXN0ICkge1xyXG4gICAgaXRlbXMucHVzaCggYXdhaXQgZiggaXRlbSwgaW5kZXgrKyApICk7XHJcbiAgfVxyXG4gIHJldHVybiBpdGVtcztcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYXN5bmNNYXA7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU1BLFFBQVEsR0FBRyxNQUFBQSxDQUFRQyxJQUFJLEVBQUVDLENBQUMsS0FBTTtFQUNwQyxNQUFNQyxLQUFLLEdBQUcsRUFBRTtFQUNoQixJQUFJQyxLQUFLLEdBQUcsQ0FBQztFQUNiLEtBQU0sTUFBTUMsSUFBSSxJQUFJSixJQUFJLEVBQUc7SUFDekJFLEtBQUssQ0FBQ0csSUFBSSxDQUFFLE1BQU1KLENBQUMsQ0FBRUcsSUFBSSxFQUFFRCxLQUFLLEVBQUcsQ0FBRSxDQUFDO0VBQ3hDO0VBQ0EsT0FBT0QsS0FBSztBQUNkLENBQUM7QUFFREksTUFBTSxDQUFDQyxPQUFPLEdBQUdSLFFBQVEifQ==