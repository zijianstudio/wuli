// Copyright 2016-2020, University of Colorado Boulder

/**
 * Models a paint balloon thrown at the splotch.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import proportionPlayground from '../../../proportionPlayground.js';

// {number} - In seconds, the time from "launch" to when the balloon "hits" the splotch.
const TIME_TO_HIT = 0.5;

// {number} - Number of balloons created. We rotate through 3 different graphic images, so we can take the number of
// balloons mod 3 to determine which image to use.
let numberOfBalloons = 0;
class PaintBalloon {
  /**
   * @param {Side} side - Whether this balloon contains the left or right color
   * @param {function} hitCallback - Called with this as a single arg when the balloon hits
   */
  constructor(side, hitCallback) {
    // @public {number}
    this.timeToHit = TIME_TO_HIT;

    // @public {boolean}
    this.side = side;

    // @public {function}
    this.hitCallback = hitCallback;

    // @public {number} - Determines which balloon orientation image is used
    this.balloonType = numberOfBalloons++ % 3;
  }

  /**
   * Steps the balloon forward in time.
   * @public
   *
   * @param {number} dt
   */
  step(dt) {
    this.timeToHit -= dt;
    if (this.timeToHit <= 0) {
      this.hit();
    }
  }

  /**
   * Triggers a (possibly premature) hit.
   * @public
   */
  hit() {
    this.hitCallback(this);
  }

  /**
   * Returns 0 when the balloon starts and 1 when it hits.
   * @public
   *
   * @returns {number}
   */
  getRatioToEnd() {
    return (TIME_TO_HIT - this.timeToHit) / TIME_TO_HIT;
  }
}
proportionPlayground.register('PaintBalloon', PaintBalloon);
export default PaintBalloon;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwcm9wb3J0aW9uUGxheWdyb3VuZCIsIlRJTUVfVE9fSElUIiwibnVtYmVyT2ZCYWxsb29ucyIsIlBhaW50QmFsbG9vbiIsImNvbnN0cnVjdG9yIiwic2lkZSIsImhpdENhbGxiYWNrIiwidGltZVRvSGl0IiwiYmFsbG9vblR5cGUiLCJzdGVwIiwiZHQiLCJoaXQiLCJnZXRSYXRpb1RvRW5kIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQYWludEJhbGxvb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTW9kZWxzIGEgcGFpbnQgYmFsbG9vbiB0aHJvd24gYXQgdGhlIHNwbG90Y2guXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IHByb3BvcnRpb25QbGF5Z3JvdW5kIGZyb20gJy4uLy4uLy4uL3Byb3BvcnRpb25QbGF5Z3JvdW5kLmpzJztcclxuXHJcbi8vIHtudW1iZXJ9IC0gSW4gc2Vjb25kcywgdGhlIHRpbWUgZnJvbSBcImxhdW5jaFwiIHRvIHdoZW4gdGhlIGJhbGxvb24gXCJoaXRzXCIgdGhlIHNwbG90Y2guXHJcbmNvbnN0IFRJTUVfVE9fSElUID0gMC41O1xyXG5cclxuLy8ge251bWJlcn0gLSBOdW1iZXIgb2YgYmFsbG9vbnMgY3JlYXRlZC4gV2Ugcm90YXRlIHRocm91Z2ggMyBkaWZmZXJlbnQgZ3JhcGhpYyBpbWFnZXMsIHNvIHdlIGNhbiB0YWtlIHRoZSBudW1iZXIgb2ZcclxuLy8gYmFsbG9vbnMgbW9kIDMgdG8gZGV0ZXJtaW5lIHdoaWNoIGltYWdlIHRvIHVzZS5cclxubGV0IG51bWJlck9mQmFsbG9vbnMgPSAwO1xyXG5cclxuY2xhc3MgUGFpbnRCYWxsb29uIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge1NpZGV9IHNpZGUgLSBXaGV0aGVyIHRoaXMgYmFsbG9vbiBjb250YWlucyB0aGUgbGVmdCBvciByaWdodCBjb2xvclxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGhpdENhbGxiYWNrIC0gQ2FsbGVkIHdpdGggdGhpcyBhcyBhIHNpbmdsZSBhcmcgd2hlbiB0aGUgYmFsbG9vbiBoaXRzXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHNpZGUsIGhpdENhbGxiYWNrICkge1xyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxyXG4gICAgdGhpcy50aW1lVG9IaXQgPSBUSU1FX1RPX0hJVDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtib29sZWFufVxyXG4gICAgdGhpcy5zaWRlID0gc2lkZTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtmdW5jdGlvbn1cclxuICAgIHRoaXMuaGl0Q2FsbGJhY2sgPSBoaXRDYWxsYmFjaztcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9IC0gRGV0ZXJtaW5lcyB3aGljaCBiYWxsb29uIG9yaWVudGF0aW9uIGltYWdlIGlzIHVzZWRcclxuICAgIHRoaXMuYmFsbG9vblR5cGUgPSAoIG51bWJlck9mQmFsbG9vbnMrKyApICUgMztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0ZXBzIHRoZSBiYWxsb29uIGZvcndhcmQgaW4gdGltZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIHRoaXMudGltZVRvSGl0IC09IGR0O1xyXG4gICAgaWYgKCB0aGlzLnRpbWVUb0hpdCA8PSAwICkge1xyXG4gICAgICB0aGlzLmhpdCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJpZ2dlcnMgYSAocG9zc2libHkgcHJlbWF0dXJlKSBoaXQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGhpdCgpIHtcclxuICAgIHRoaXMuaGl0Q2FsbGJhY2soIHRoaXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgMCB3aGVuIHRoZSBiYWxsb29uIHN0YXJ0cyBhbmQgMSB3aGVuIGl0IGhpdHMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRSYXRpb1RvRW5kKCkge1xyXG4gICAgcmV0dXJuICggVElNRV9UT19ISVQgLSB0aGlzLnRpbWVUb0hpdCApIC8gVElNRV9UT19ISVQ7XHJcbiAgfVxyXG59XHJcblxyXG5wcm9wb3J0aW9uUGxheWdyb3VuZC5yZWdpc3RlciggJ1BhaW50QmFsbG9vbicsIFBhaW50QmFsbG9vbiApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGFpbnRCYWxsb29uOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxvQkFBb0IsTUFBTSxrQ0FBa0M7O0FBRW5FO0FBQ0EsTUFBTUMsV0FBVyxHQUFHLEdBQUc7O0FBRXZCO0FBQ0E7QUFDQSxJQUFJQyxnQkFBZ0IsR0FBRyxDQUFDO0FBRXhCLE1BQU1DLFlBQVksQ0FBQztFQUNqQjtBQUNGO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxJQUFJLEVBQUVDLFdBQVcsRUFBRztJQUMvQjtJQUNBLElBQUksQ0FBQ0MsU0FBUyxHQUFHTixXQUFXOztJQUU1QjtJQUNBLElBQUksQ0FBQ0ksSUFBSSxHQUFHQSxJQUFJOztJQUVoQjtJQUNBLElBQUksQ0FBQ0MsV0FBVyxHQUFHQSxXQUFXOztJQUU5QjtJQUNBLElBQUksQ0FBQ0UsV0FBVyxHQUFLTixnQkFBZ0IsRUFBRSxHQUFLLENBQUM7RUFDL0M7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VPLElBQUlBLENBQUVDLEVBQUUsRUFBRztJQUNULElBQUksQ0FBQ0gsU0FBUyxJQUFJRyxFQUFFO0lBQ3BCLElBQUssSUFBSSxDQUFDSCxTQUFTLElBQUksQ0FBQyxFQUFHO01BQ3pCLElBQUksQ0FBQ0ksR0FBRyxDQUFDLENBQUM7SUFDWjtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VBLEdBQUdBLENBQUEsRUFBRztJQUNKLElBQUksQ0FBQ0wsV0FBVyxDQUFFLElBQUssQ0FBQztFQUMxQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRU0sYUFBYUEsQ0FBQSxFQUFHO0lBQ2QsT0FBTyxDQUFFWCxXQUFXLEdBQUcsSUFBSSxDQUFDTSxTQUFTLElBQUtOLFdBQVc7RUFDdkQ7QUFDRjtBQUVBRCxvQkFBb0IsQ0FBQ2EsUUFBUSxDQUFFLGNBQWMsRUFBRVYsWUFBYSxDQUFDO0FBRTdELGVBQWVBLFlBQVkifQ==