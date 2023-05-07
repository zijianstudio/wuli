// Copyright 2018-2022, University of Colorado Boulder

/**
 * Abstract base class for challenge generators.
 * See specification in https://docs.google.com/document/d/1vG5U9HhcqVGMvmGGXry28PLqlNWj25lStDP2vSWgUOo/edit.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import equalityExplorer from '../../equalityExplorer.js';
export default class ChallengeGenerator {
  // number of challenges generated

  // Value of x for the previous challenge, so we don't use the same value for consecutive challenges.
  // The design document says "It’s OK to generate the same coefficient or constant for consecutive challenges.
  // Do not generate the exact same challenge (coefficient, constant, AND value for x) twice in a row." So we
  // only need to pick one quantity that is not the same, and we have chosen 'x', since it's common to all
  // challenges.
  constructor() {
    this.numberOfChallenges = 0;
    this.xPrevious = 0;
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
  }
  reset() {
    this.numberOfChallenges = 0;
  }

  /**
   * Generates the next challenge for this level.
   */
  nextChallenge() {
    const challenge = this.nextChallengeProtected();
    this.numberOfChallenges++;
    return challenge;
  }

  /**
   * Subtype-specific method of generating the next challenge for this level.
   */

  /**
   * Randomly samples a value for x from a set of values, excluding zero and the previous value of x.
   */
  randomX(values) {
    const x = ChallengeGenerator.randomValue(values, [0, this.xPrevious]);
    assert && assert(x !== 0, 'x is 0');
    assert && assert(x !== this.xPrevious, `x === xPrevious: ${x}`);
    this.xPrevious = x;
    return x;
  }

  /**
   * Converts an integer range to an array of integer values.
   */
  static rangeToArray(min, max) {
    assert && assert(Number.isInteger(min), `min must be an integer: ${min}`);
    assert && assert(Number.isInteger(max), `max must be an integer: ${max}`);
    const values = []; // {number[]}
    for (let i = min; i <= max; i++) {
      values.push(i);
    }
    return values;
  }

  /**
   * Randomly samples a value from a set of values, after filtering out values that don't meet some predicate.
   */
  static randomValueBy(values, predicate) {
    const filteredValues = _.filter(values, predicate);
    assert && assert(filteredValues.length > 0, 'all values were excluded');
    return dotRandom.sample(filteredValues);
  }

  /**
   * Randomly samples a value from a set of values, after excluding an optional set of values.
   */
  static randomValue(values, excludedValues) {
    return ChallengeGenerator.randomValueBy(values, value => !_.includes(excludedValues, value));
  }
}
equalityExplorer.register('ChallengeGenerator', ChallengeGenerator);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3RSYW5kb20iLCJlcXVhbGl0eUV4cGxvcmVyIiwiQ2hhbGxlbmdlR2VuZXJhdG9yIiwiY29uc3RydWN0b3IiLCJudW1iZXJPZkNoYWxsZW5nZXMiLCJ4UHJldmlvdXMiLCJkaXNwb3NlIiwiYXNzZXJ0IiwicmVzZXQiLCJuZXh0Q2hhbGxlbmdlIiwiY2hhbGxlbmdlIiwibmV4dENoYWxsZW5nZVByb3RlY3RlZCIsInJhbmRvbVgiLCJ2YWx1ZXMiLCJ4IiwicmFuZG9tVmFsdWUiLCJyYW5nZVRvQXJyYXkiLCJtaW4iLCJtYXgiLCJOdW1iZXIiLCJpc0ludGVnZXIiLCJpIiwicHVzaCIsInJhbmRvbVZhbHVlQnkiLCJwcmVkaWNhdGUiLCJmaWx0ZXJlZFZhbHVlcyIsIl8iLCJmaWx0ZXIiLCJsZW5ndGgiLCJzYW1wbGUiLCJleGNsdWRlZFZhbHVlcyIsInZhbHVlIiwiaW5jbHVkZXMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNoYWxsZW5nZUdlbmVyYXRvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBYnN0cmFjdCBiYXNlIGNsYXNzIGZvciBjaGFsbGVuZ2UgZ2VuZXJhdG9ycy5cclxuICogU2VlIHNwZWNpZmljYXRpb24gaW4gaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZG9jdW1lbnQvZC8xdkc1VTlIaGNxVkdNdm1HR1hyeTI4UExxbE5XajI1bFN0RFAydlNXZ1VPby9lZGl0LlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XHJcbmltcG9ydCBlcXVhbGl0eUV4cGxvcmVyIGZyb20gJy4uLy4uL2VxdWFsaXR5RXhwbG9yZXIuanMnO1xyXG5pbXBvcnQgQ2hhbGxlbmdlIGZyb20gJy4vQ2hhbGxlbmdlLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGFic3RyYWN0IGNsYXNzIENoYWxsZW5nZUdlbmVyYXRvciB7XHJcblxyXG4gIC8vIG51bWJlciBvZiBjaGFsbGVuZ2VzIGdlbmVyYXRlZFxyXG4gIHB1YmxpYyBudW1iZXJPZkNoYWxsZW5nZXM6IG51bWJlcjtcclxuXHJcbiAgLy8gVmFsdWUgb2YgeCBmb3IgdGhlIHByZXZpb3VzIGNoYWxsZW5nZSwgc28gd2UgZG9uJ3QgdXNlIHRoZSBzYW1lIHZhbHVlIGZvciBjb25zZWN1dGl2ZSBjaGFsbGVuZ2VzLlxyXG4gIC8vIFRoZSBkZXNpZ24gZG9jdW1lbnQgc2F5cyBcIkl04oCZcyBPSyB0byBnZW5lcmF0ZSB0aGUgc2FtZSBjb2VmZmljaWVudCBvciBjb25zdGFudCBmb3IgY29uc2VjdXRpdmUgY2hhbGxlbmdlcy5cclxuICAvLyBEbyBub3QgZ2VuZXJhdGUgdGhlIGV4YWN0IHNhbWUgY2hhbGxlbmdlIChjb2VmZmljaWVudCwgY29uc3RhbnQsIEFORCB2YWx1ZSBmb3IgeCkgdHdpY2UgaW4gYSByb3cuXCIgU28gd2VcclxuICAvLyBvbmx5IG5lZWQgdG8gcGljayBvbmUgcXVhbnRpdHkgdGhhdCBpcyBub3QgdGhlIHNhbWUsIGFuZCB3ZSBoYXZlIGNob3NlbiAneCcsIHNpbmNlIGl0J3MgY29tbW9uIHRvIGFsbFxyXG4gIC8vIGNoYWxsZW5nZXMuXHJcbiAgcHJvdGVjdGVkIHhQcmV2aW91czogbnVtYmVyO1xyXG5cclxuICBwcm90ZWN0ZWQgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLm51bWJlck9mQ2hhbGxlbmdlcyA9IDA7XHJcbiAgICB0aGlzLnhQcmV2aW91cyA9IDA7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5udW1iZXJPZkNoYWxsZW5nZXMgPSAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2VuZXJhdGVzIHRoZSBuZXh0IGNoYWxsZW5nZSBmb3IgdGhpcyBsZXZlbC5cclxuICAgKi9cclxuICBwdWJsaWMgbmV4dENoYWxsZW5nZSgpOiBDaGFsbGVuZ2Uge1xyXG4gICAgY29uc3QgY2hhbGxlbmdlID0gdGhpcy5uZXh0Q2hhbGxlbmdlUHJvdGVjdGVkKCk7XHJcbiAgICB0aGlzLm51bWJlck9mQ2hhbGxlbmdlcysrO1xyXG4gICAgcmV0dXJuIGNoYWxsZW5nZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN1YnR5cGUtc3BlY2lmaWMgbWV0aG9kIG9mIGdlbmVyYXRpbmcgdGhlIG5leHQgY2hhbGxlbmdlIGZvciB0aGlzIGxldmVsLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBuZXh0Q2hhbGxlbmdlUHJvdGVjdGVkKCk6IENoYWxsZW5nZTtcclxuXHJcbiAgLyoqXHJcbiAgICogUmFuZG9tbHkgc2FtcGxlcyBhIHZhbHVlIGZvciB4IGZyb20gYSBzZXQgb2YgdmFsdWVzLCBleGNsdWRpbmcgemVybyBhbmQgdGhlIHByZXZpb3VzIHZhbHVlIG9mIHguXHJcbiAgICovXHJcbiAgcHVibGljIHJhbmRvbVgoIHZhbHVlczogbnVtYmVyW10gKTogbnVtYmVyIHtcclxuICAgIGNvbnN0IHggPSBDaGFsbGVuZ2VHZW5lcmF0b3IucmFuZG9tVmFsdWUoIHZhbHVlcywgWyAwLCB0aGlzLnhQcmV2aW91cyBdICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB4ICE9PSAwLCAneCBpcyAwJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggeCAhPT0gdGhpcy54UHJldmlvdXMsIGB4ID09PSB4UHJldmlvdXM6ICR7eH1gICk7XHJcbiAgICB0aGlzLnhQcmV2aW91cyA9IHg7XHJcbiAgICByZXR1cm4geDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnRzIGFuIGludGVnZXIgcmFuZ2UgdG8gYW4gYXJyYXkgb2YgaW50ZWdlciB2YWx1ZXMuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyByYW5nZVRvQXJyYXkoIG1pbjogbnVtYmVyLCBtYXg6IG51bWJlciApOiBudW1iZXJbXSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggbWluICksIGBtaW4gbXVzdCBiZSBhbiBpbnRlZ2VyOiAke21pbn1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBOdW1iZXIuaXNJbnRlZ2VyKCBtYXggKSwgYG1heCBtdXN0IGJlIGFuIGludGVnZXI6ICR7bWF4fWAgKTtcclxuXHJcbiAgICBjb25zdCB2YWx1ZXMgPSBbXTsgLy8ge251bWJlcltdfVxyXG4gICAgZm9yICggbGV0IGkgPSBtaW47IGkgPD0gbWF4OyBpKysgKSB7XHJcbiAgICAgIHZhbHVlcy5wdXNoKCBpICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdmFsdWVzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmFuZG9tbHkgc2FtcGxlcyBhIHZhbHVlIGZyb20gYSBzZXQgb2YgdmFsdWVzLCBhZnRlciBmaWx0ZXJpbmcgb3V0IHZhbHVlcyB0aGF0IGRvbid0IG1lZXQgc29tZSBwcmVkaWNhdGUuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyByYW5kb21WYWx1ZUJ5KCB2YWx1ZXM6IG51bWJlcltdLCBwcmVkaWNhdGU6ICggdmFsdWU6IG51bWJlciApID0+IGJvb2xlYW4gKTogbnVtYmVyIHtcclxuICAgIGNvbnN0IGZpbHRlcmVkVmFsdWVzID0gXy5maWx0ZXIoIHZhbHVlcywgcHJlZGljYXRlICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmaWx0ZXJlZFZhbHVlcy5sZW5ndGggPiAwLCAnYWxsIHZhbHVlcyB3ZXJlIGV4Y2x1ZGVkJyApO1xyXG4gICAgcmV0dXJuIGRvdFJhbmRvbS5zYW1wbGUoIGZpbHRlcmVkVmFsdWVzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSYW5kb21seSBzYW1wbGVzIGEgdmFsdWUgZnJvbSBhIHNldCBvZiB2YWx1ZXMsIGFmdGVyIGV4Y2x1ZGluZyBhbiBvcHRpb25hbCBzZXQgb2YgdmFsdWVzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgcmFuZG9tVmFsdWUoIHZhbHVlczogbnVtYmVyW10sIGV4Y2x1ZGVkVmFsdWVzPzogbnVtYmVyW10gKTogbnVtYmVyIHtcclxuICAgIHJldHVybiBDaGFsbGVuZ2VHZW5lcmF0b3IucmFuZG9tVmFsdWVCeSggdmFsdWVzLCB2YWx1ZSA9PiAhXy5pbmNsdWRlcyggZXhjbHVkZWRWYWx1ZXMsIHZhbHVlICkgKTtcclxuICB9XHJcbn1cclxuXHJcbmVxdWFsaXR5RXhwbG9yZXIucmVnaXN0ZXIoICdDaGFsbGVuZ2VHZW5lcmF0b3InLCBDaGFsbGVuZ2VHZW5lcmF0b3IgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUd4RCxlQUFlLE1BQWVDLGtCQUFrQixDQUFDO0VBRS9DOztFQUdBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFHVUMsV0FBV0EsQ0FBQSxFQUFHO0lBQ3RCLElBQUksQ0FBQ0Msa0JBQWtCLEdBQUcsQ0FBQztJQUMzQixJQUFJLENBQUNDLFNBQVMsR0FBRyxDQUFDO0VBQ3BCO0VBRU9DLE9BQU9BLENBQUEsRUFBUztJQUNyQkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0VBQzNGO0VBRU9DLEtBQUtBLENBQUEsRUFBUztJQUNuQixJQUFJLENBQUNKLGtCQUFrQixHQUFHLENBQUM7RUFDN0I7O0VBRUE7QUFDRjtBQUNBO0VBQ1NLLGFBQWFBLENBQUEsRUFBYztJQUNoQyxNQUFNQyxTQUFTLEdBQUcsSUFBSSxDQUFDQyxzQkFBc0IsQ0FBQyxDQUFDO0lBQy9DLElBQUksQ0FBQ1Asa0JBQWtCLEVBQUU7SUFDekIsT0FBT00sU0FBUztFQUNsQjs7RUFFQTtBQUNGO0FBQ0E7O0VBR0U7QUFDRjtBQUNBO0VBQ1NFLE9BQU9BLENBQUVDLE1BQWdCLEVBQVc7SUFDekMsTUFBTUMsQ0FBQyxHQUFHWixrQkFBa0IsQ0FBQ2EsV0FBVyxDQUFFRixNQUFNLEVBQUUsQ0FBRSxDQUFDLEVBQUUsSUFBSSxDQUFDUixTQUFTLENBQUcsQ0FBQztJQUN6RUUsTUFBTSxJQUFJQSxNQUFNLENBQUVPLENBQUMsS0FBSyxDQUFDLEVBQUUsUUFBUyxDQUFDO0lBQ3JDUCxNQUFNLElBQUlBLE1BQU0sQ0FBRU8sQ0FBQyxLQUFLLElBQUksQ0FBQ1QsU0FBUyxFQUFHLG9CQUFtQlMsQ0FBRSxFQUFFLENBQUM7SUFDakUsSUFBSSxDQUFDVCxTQUFTLEdBQUdTLENBQUM7SUFDbEIsT0FBT0EsQ0FBQztFQUNWOztFQUVBO0FBQ0Y7QUFDQTtFQUNFLE9BQWNFLFlBQVlBLENBQUVDLEdBQVcsRUFBRUMsR0FBVyxFQUFhO0lBRS9EWCxNQUFNLElBQUlBLE1BQU0sQ0FBRVksTUFBTSxDQUFDQyxTQUFTLENBQUVILEdBQUksQ0FBQyxFQUFHLDJCQUEwQkEsR0FBSSxFQUFFLENBQUM7SUFDN0VWLE1BQU0sSUFBSUEsTUFBTSxDQUFFWSxNQUFNLENBQUNDLFNBQVMsQ0FBRUYsR0FBSSxDQUFDLEVBQUcsMkJBQTBCQSxHQUFJLEVBQUUsQ0FBQztJQUU3RSxNQUFNTCxNQUFNLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDbkIsS0FBTSxJQUFJUSxDQUFDLEdBQUdKLEdBQUcsRUFBRUksQ0FBQyxJQUFJSCxHQUFHLEVBQUVHLENBQUMsRUFBRSxFQUFHO01BQ2pDUixNQUFNLENBQUNTLElBQUksQ0FBRUQsQ0FBRSxDQUFDO0lBQ2xCO0lBQ0EsT0FBT1IsTUFBTTtFQUNmOztFQUVBO0FBQ0Y7QUFDQTtFQUNFLE9BQWNVLGFBQWFBLENBQUVWLE1BQWdCLEVBQUVXLFNBQXVDLEVBQVc7SUFDL0YsTUFBTUMsY0FBYyxHQUFHQyxDQUFDLENBQUNDLE1BQU0sQ0FBRWQsTUFBTSxFQUFFVyxTQUFVLENBQUM7SUFDcERqQixNQUFNLElBQUlBLE1BQU0sQ0FBRWtCLGNBQWMsQ0FBQ0csTUFBTSxHQUFHLENBQUMsRUFBRSwwQkFBMkIsQ0FBQztJQUN6RSxPQUFPNUIsU0FBUyxDQUFDNkIsTUFBTSxDQUFFSixjQUFlLENBQUM7RUFDM0M7O0VBRUE7QUFDRjtBQUNBO0VBQ0UsT0FBY1YsV0FBV0EsQ0FBRUYsTUFBZ0IsRUFBRWlCLGNBQXlCLEVBQVc7SUFDL0UsT0FBTzVCLGtCQUFrQixDQUFDcUIsYUFBYSxDQUFFVixNQUFNLEVBQUVrQixLQUFLLElBQUksQ0FBQ0wsQ0FBQyxDQUFDTSxRQUFRLENBQUVGLGNBQWMsRUFBRUMsS0FBTSxDQUFFLENBQUM7RUFDbEc7QUFDRjtBQUVBOUIsZ0JBQWdCLENBQUNnQyxRQUFRLENBQUUsb0JBQW9CLEVBQUUvQixrQkFBbUIsQ0FBQyJ9