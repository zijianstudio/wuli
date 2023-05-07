// Copyright 2018, University of Colorado Boulder

/**
 * Represents a specific patch being applied to a repository for maintenance purposes.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const assert = require('assert');
module.exports = function () {
  class Patch {
    /**
     * @public
     * @constructor
     *
     * @param {string} repo
     * @param {string} name
     * @param {string} message - Usually an issue URL, but can include other things
     * @param {Array.<string>} shas - SHAs used to cherry-pick
     */
    constructor(repo, name, message, shas = []) {
      assert(typeof repo === 'string');
      assert(typeof name === 'string');
      assert(typeof message === 'string');
      assert(Array.isArray(shas));
      shas.forEach(sha => assert(typeof sha === 'string'));

      // @public {string}
      this.repo = repo;
      this.name = name;
      this.message = message;

      // @public {Array.<string>}
      this.shas = shas;
    }

    /**
     * Convert into a plain JS object meant for JSON serialization.
     * @public
     *
     * @returns {Object}
     */
    serialize() {
      return {
        repo: this.repo,
        name: this.name,
        message: this.message,
        shas: this.shas
      };
    }

    /**
     * Takes a serialized form of the Patch and returns an actual instance.
     * @public
     *
     * @param {Object}
     * @returns {Patch}
     */
    static deserialize({
      repo,
      name,
      message,
      shas
    }) {
      return new Patch(repo, name, message, shas);
    }
  }
  return Patch;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3NlcnQiLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsIlBhdGNoIiwiY29uc3RydWN0b3IiLCJyZXBvIiwibmFtZSIsIm1lc3NhZ2UiLCJzaGFzIiwiQXJyYXkiLCJpc0FycmF5IiwiZm9yRWFjaCIsInNoYSIsInNlcmlhbGl6ZSIsImRlc2VyaWFsaXplIl0sInNvdXJjZXMiOlsiUGF0Y2guanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudHMgYSBzcGVjaWZpYyBwYXRjaCBiZWluZyBhcHBsaWVkIHRvIGEgcmVwb3NpdG9yeSBmb3IgbWFpbnRlbmFuY2UgcHVycG9zZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5jb25zdCBhc3NlcnQgPSByZXF1aXJlKCAnYXNzZXJ0JyApO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSAoIGZ1bmN0aW9uKCkge1xyXG5cclxuICBjbGFzcyBQYXRjaCB7XHJcbiAgICAvKipcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqIEBjb25zdHJ1Y3RvclxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSByZXBvXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgLSBVc3VhbGx5IGFuIGlzc3VlIFVSTCwgYnV0IGNhbiBpbmNsdWRlIG90aGVyIHRoaW5nc1xyXG4gICAgICogQHBhcmFtIHtBcnJheS48c3RyaW5nPn0gc2hhcyAtIFNIQXMgdXNlZCB0byBjaGVycnktcGlja1xyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvciggcmVwbywgbmFtZSwgbWVzc2FnZSwgc2hhcyA9IFtdICkge1xyXG4gICAgICBhc3NlcnQoIHR5cGVvZiByZXBvID09PSAnc3RyaW5nJyApO1xyXG4gICAgICBhc3NlcnQoIHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJyApO1xyXG4gICAgICBhc3NlcnQoIHR5cGVvZiBtZXNzYWdlID09PSAnc3RyaW5nJyApO1xyXG4gICAgICBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIHNoYXMgKSApO1xyXG4gICAgICBzaGFzLmZvckVhY2goIHNoYSA9PiBhc3NlcnQoIHR5cGVvZiBzaGEgPT09ICdzdHJpbmcnICkgKTtcclxuXHJcbiAgICAgIC8vIEBwdWJsaWMge3N0cmluZ31cclxuICAgICAgdGhpcy5yZXBvID0gcmVwbztcclxuICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcclxuXHJcbiAgICAgIC8vIEBwdWJsaWMge0FycmF5LjxzdHJpbmc+fVxyXG4gICAgICB0aGlzLnNoYXMgPSBzaGFzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydCBpbnRvIGEgcGxhaW4gSlMgb2JqZWN0IG1lYW50IGZvciBKU09OIHNlcmlhbGl6YXRpb24uXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge09iamVjdH1cclxuICAgICAqL1xyXG4gICAgc2VyaWFsaXplKCkge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlcG86IHRoaXMucmVwbyxcclxuICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXHJcbiAgICAgICAgbWVzc2FnZTogdGhpcy5tZXNzYWdlLFxyXG4gICAgICAgIHNoYXM6IHRoaXMuc2hhc1xyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGFrZXMgYSBzZXJpYWxpemVkIGZvcm0gb2YgdGhlIFBhdGNoIGFuZCByZXR1cm5zIGFuIGFjdHVhbCBpbnN0YW5jZS5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH1cclxuICAgICAqIEByZXR1cm5zIHtQYXRjaH1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGRlc2VyaWFsaXplKCB7IHJlcG8sIG5hbWUsIG1lc3NhZ2UsIHNoYXMgfSApIHtcclxuICAgICAgcmV0dXJuIG5ldyBQYXRjaCggcmVwbywgbmFtZSwgbWVzc2FnZSwgc2hhcyApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIFBhdGNoO1xyXG59ICkoKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU1BLE1BQU0sR0FBR0MsT0FBTyxDQUFFLFFBQVMsQ0FBQztBQUVsQ0MsTUFBTSxDQUFDQyxPQUFPLEdBQUssWUFBVztFQUU1QixNQUFNQyxLQUFLLENBQUM7SUFDVjtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDSUMsV0FBV0EsQ0FBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLE9BQU8sRUFBRUMsSUFBSSxHQUFHLEVBQUUsRUFBRztNQUM1Q1QsTUFBTSxDQUFFLE9BQU9NLElBQUksS0FBSyxRQUFTLENBQUM7TUFDbENOLE1BQU0sQ0FBRSxPQUFPTyxJQUFJLEtBQUssUUFBUyxDQUFDO01BQ2xDUCxNQUFNLENBQUUsT0FBT1EsT0FBTyxLQUFLLFFBQVMsQ0FBQztNQUNyQ1IsTUFBTSxDQUFFVSxLQUFLLENBQUNDLE9BQU8sQ0FBRUYsSUFBSyxDQUFFLENBQUM7TUFDL0JBLElBQUksQ0FBQ0csT0FBTyxDQUFFQyxHQUFHLElBQUliLE1BQU0sQ0FBRSxPQUFPYSxHQUFHLEtBQUssUUFBUyxDQUFFLENBQUM7O01BRXhEO01BQ0EsSUFBSSxDQUFDUCxJQUFJLEdBQUdBLElBQUk7TUFDaEIsSUFBSSxDQUFDQyxJQUFJLEdBQUdBLElBQUk7TUFDaEIsSUFBSSxDQUFDQyxPQUFPLEdBQUdBLE9BQU87O01BRXRCO01BQ0EsSUFBSSxDQUFDQyxJQUFJLEdBQUdBLElBQUk7SUFDbEI7O0lBRUE7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0lLLFNBQVNBLENBQUEsRUFBRztNQUNWLE9BQU87UUFDTFIsSUFBSSxFQUFFLElBQUksQ0FBQ0EsSUFBSTtRQUNmQyxJQUFJLEVBQUUsSUFBSSxDQUFDQSxJQUFJO1FBQ2ZDLE9BQU8sRUFBRSxJQUFJLENBQUNBLE9BQU87UUFDckJDLElBQUksRUFBRSxJQUFJLENBQUNBO01BQ2IsQ0FBQztJQUNIOztJQUVBO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0ksT0FBT00sV0FBV0EsQ0FBRTtNQUFFVCxJQUFJO01BQUVDLElBQUk7TUFBRUMsT0FBTztNQUFFQztJQUFLLENBQUMsRUFBRztNQUNsRCxPQUFPLElBQUlMLEtBQUssQ0FBRUUsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLE9BQU8sRUFBRUMsSUFBSyxDQUFDO0lBQy9DO0VBQ0Y7RUFFQSxPQUFPTCxLQUFLO0FBQ2QsQ0FBQyxDQUFHLENBQUMifQ==