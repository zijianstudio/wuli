// Copyright 2020-2022, University of Colorado Boulder

/**
 * Model for the trailing 'Path' behind a moving object, including Balls and the Center of Mass. Originally called
 * 'Path' but changed to 'CollisionLabPath'. See https://github.com/phetsims/collision-lab/issues/79.
 *
 * Its main responsibility is to keep track of PathDataPoints that map out the trail of a Ball or the Center of Mass as
 * time progresses. In the design, the trailing 'Paths' only shows the recent path of the moving object AFTER the
 * visibility checkbox is checked, meaning the Path is always empty if the checkbox isn't checked and PathDataPoints
 * are only recorded if the checkbox is checked.
 *
 * CollisionLabPath will also remove PathDataPoints that are past the set time period, which allows the trailing 'Path'
 * to fade over time. See https://github.com/phetsims/collision-lab/issues/61.
 *
 * CollisionLabPaths are created for each Ball, which are never disposed, meaning CollisionLabPaths are also never
 * disposed and internal links are left as-is. This doesn't negatively impact performance since Balls that aren't in the
 * system aren't stepped and their positions don't change.
 *
 * @author Brandon Li
 */

import Emitter from '../../../../axon/js/Emitter.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import CollisionLabQueryParameters from '../../common/CollisionLabQueryParameters.js';
import CollisionLabUtils from '../../common/CollisionLabUtils.js';
import PathDataPoint from './PathDataPoint.js';

// constants
const PATH_DATA_POINT_LIFETIME = CollisionLabQueryParameters.pathPointLifetime;
class CollisionLabPath {
  /**
   * @param {ReadOnlyProperty.<Vector2>} positionProperty - the position of the moving object, in meters.
   * @param {ReadOnlyProperty.<boolean>} pathsVisibleProperty - indicates if the 'Path' is visible. PathDataPoints are
   *                                                    only recorded if this is true and are cleared when set to false.
   */
  constructor(positionProperty, pathsVisibleProperty) {
    assert && AssertUtils.assertAbstractPropertyOf(positionProperty, Vector2);
    assert && AssertUtils.assertAbstractPropertyOf(pathsVisibleProperty, 'boolean');

    // @public (read-only) {PathDataPoint[]} - the recorded points of the trailing points of the 'Path' within a given
    //                                         time period, which is PATH_DATA_POINT_LIFETIME seconds.
    this.dataPoints = [];

    // @public (read-only) {Emitter} - Emits when the trailing 'path' has changed in any form. Using an ObservableArrayDef
    //                                 was considered for the dataPoints array instead of this, but ObservableArrayDef's
    //                                 itemRemovedEmitter emits after each item removed, which would result in redrawing
    //                                 too many times when multiple dataPoints are cleared. Thus, this is used for a
    //                                 slight performance boost.
    this.pathChangedEmitter = new Emitter();

    // @private {Property.<Vector2>} - reference to the passed-in positionProperty.
    this.positionProperty = positionProperty;

    // @private {Property.<boolean>} - reference to the passed-in pathsVisibleProperty.
    this.pathsVisibleProperty = pathsVisibleProperty;

    //----------------------------------------------------------------------------------------

    // Observe when the pathsVisibleProperty is manipulated and clear the 'Path' when set to false. Link lasts for the
    // lifetime of the simulation and is never disposed.
    pathsVisibleProperty.lazyLink(pathVisible => {
      !pathVisible && this.clear();
    });
  }

  /**
   * Clears the Path's DataPoints.
   * @public
   *
   * This is invoked in the following scenarios:
   *   - the reset all button is pressed.
   *   - the restart button is pressed.
   *   - when the 'Path' checkbox is un-checked.
   *   - when the Ball (if the moving object is a ball) is user-manipulated, either by dragging or from the Keypad.
   *   - when the Ball (if the moving object is a ball) is removed from the system.
   */
  clear() {
    while (this.dataPoints.length) {
      this.dataPoints.pop();
    }

    // Signal once that the trailing 'Path' has changed.
    this.pathChangedEmitter.emit();
  }

  /**
   * Updates the path by:
   *   - adding a new PathDataPoint for the current position of the moving object.
   *   - removing any expired PathDataPoints that are past the MAX_DATA_POINT_LIFETIME.
   *   - removing any PathDataPoints that are ahead of the total elapsed time of the simulation. This occurs when the
   *     step-backward button is pressed.
   * @public
   *
   * NOTE: No-op for when the path is not visible.
   *
   * @param {number} elapsedTime - the total elapsed elapsedTime of the simulation, in seconds.
   */
  updatePath(elapsedTime) {
    assert && assert(typeof elapsedTime === 'number' && elapsedTime >= 0, `invalid elapsedTime: ${elapsedTime}`);
    if (!this.pathsVisibleProperty.value) {
      return; /** do nothing **/
    }

    for (let i = 0; i < this.dataPoints.length; i++) {
      const dataPoint = this.dataPoints[i];

      // Remove any expired PathDataPoints that are not within the MAX_DATA_POINT_LIFETIME or that are ahead of the
      // total elapsedTime of the simulation. This occurs when the step-backward button is pressed.
      if (dataPoint.time + PATH_DATA_POINT_LIFETIME <= elapsedTime || dataPoint.time >= elapsedTime) {
        this.dataPoints.splice(i--, 1); // Remove it, and step back so we'll scan the next index
      }
    }

    // Add a new PathDataPoint for the current position of the moving object.
    this.dataPoints.push(new PathDataPoint(elapsedTime, this.positionProperty.value));

    // Verify that the dataPoints are strictly sorted by time.
    assert && assert(CollisionLabUtils.isSorted(this.dataPoints, dataPoint => dataPoint.time));

    // Signal that the trailing 'Path' has changed.
    this.pathChangedEmitter.emit();
  }
}
collisionLab.register('CollisionLabPath', CollisionLabPath);
export default CollisionLabPath;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbWl0dGVyIiwiVmVjdG9yMiIsIkFzc2VydFV0aWxzIiwiY29sbGlzaW9uTGFiIiwiQ29sbGlzaW9uTGFiUXVlcnlQYXJhbWV0ZXJzIiwiQ29sbGlzaW9uTGFiVXRpbHMiLCJQYXRoRGF0YVBvaW50IiwiUEFUSF9EQVRBX1BPSU5UX0xJRkVUSU1FIiwicGF0aFBvaW50TGlmZXRpbWUiLCJDb2xsaXNpb25MYWJQYXRoIiwiY29uc3RydWN0b3IiLCJwb3NpdGlvblByb3BlcnR5IiwicGF0aHNWaXNpYmxlUHJvcGVydHkiLCJhc3NlcnQiLCJhc3NlcnRBYnN0cmFjdFByb3BlcnR5T2YiLCJkYXRhUG9pbnRzIiwicGF0aENoYW5nZWRFbWl0dGVyIiwibGF6eUxpbmsiLCJwYXRoVmlzaWJsZSIsImNsZWFyIiwibGVuZ3RoIiwicG9wIiwiZW1pdCIsInVwZGF0ZVBhdGgiLCJlbGFwc2VkVGltZSIsInZhbHVlIiwiaSIsImRhdGFQb2ludCIsInRpbWUiLCJzcGxpY2UiLCJwdXNoIiwiaXNTb3J0ZWQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNvbGxpc2lvbkxhYlBhdGguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTW9kZWwgZm9yIHRoZSB0cmFpbGluZyAnUGF0aCcgYmVoaW5kIGEgbW92aW5nIG9iamVjdCwgaW5jbHVkaW5nIEJhbGxzIGFuZCB0aGUgQ2VudGVyIG9mIE1hc3MuIE9yaWdpbmFsbHkgY2FsbGVkXHJcbiAqICdQYXRoJyBidXQgY2hhbmdlZCB0byAnQ29sbGlzaW9uTGFiUGF0aCcuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY29sbGlzaW9uLWxhYi9pc3N1ZXMvNzkuXHJcbiAqXHJcbiAqIEl0cyBtYWluIHJlc3BvbnNpYmlsaXR5IGlzIHRvIGtlZXAgdHJhY2sgb2YgUGF0aERhdGFQb2ludHMgdGhhdCBtYXAgb3V0IHRoZSB0cmFpbCBvZiBhIEJhbGwgb3IgdGhlIENlbnRlciBvZiBNYXNzIGFzXHJcbiAqIHRpbWUgcHJvZ3Jlc3Nlcy4gSW4gdGhlIGRlc2lnbiwgdGhlIHRyYWlsaW5nICdQYXRocycgb25seSBzaG93cyB0aGUgcmVjZW50IHBhdGggb2YgdGhlIG1vdmluZyBvYmplY3QgQUZURVIgdGhlXHJcbiAqIHZpc2liaWxpdHkgY2hlY2tib3ggaXMgY2hlY2tlZCwgbWVhbmluZyB0aGUgUGF0aCBpcyBhbHdheXMgZW1wdHkgaWYgdGhlIGNoZWNrYm94IGlzbid0IGNoZWNrZWQgYW5kIFBhdGhEYXRhUG9pbnRzXHJcbiAqIGFyZSBvbmx5IHJlY29yZGVkIGlmIHRoZSBjaGVja2JveCBpcyBjaGVja2VkLlxyXG4gKlxyXG4gKiBDb2xsaXNpb25MYWJQYXRoIHdpbGwgYWxzbyByZW1vdmUgUGF0aERhdGFQb2ludHMgdGhhdCBhcmUgcGFzdCB0aGUgc2V0IHRpbWUgcGVyaW9kLCB3aGljaCBhbGxvd3MgdGhlIHRyYWlsaW5nICdQYXRoJ1xyXG4gKiB0byBmYWRlIG92ZXIgdGltZS4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jb2xsaXNpb24tbGFiL2lzc3Vlcy82MS5cclxuICpcclxuICogQ29sbGlzaW9uTGFiUGF0aHMgYXJlIGNyZWF0ZWQgZm9yIGVhY2ggQmFsbCwgd2hpY2ggYXJlIG5ldmVyIGRpc3Bvc2VkLCBtZWFuaW5nIENvbGxpc2lvbkxhYlBhdGhzIGFyZSBhbHNvIG5ldmVyXHJcbiAqIGRpc3Bvc2VkIGFuZCBpbnRlcm5hbCBsaW5rcyBhcmUgbGVmdCBhcy1pcy4gVGhpcyBkb2Vzbid0IG5lZ2F0aXZlbHkgaW1wYWN0IHBlcmZvcm1hbmNlIHNpbmNlIEJhbGxzIHRoYXQgYXJlbid0IGluIHRoZVxyXG4gKiBzeXN0ZW0gYXJlbid0IHN0ZXBwZWQgYW5kIHRoZWlyIHBvc2l0aW9ucyBkb24ndCBjaGFuZ2UuXHJcbiAqXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKi9cclxuXHJcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IEFzc2VydFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvQXNzZXJ0VXRpbHMuanMnO1xyXG5pbXBvcnQgY29sbGlzaW9uTGFiIGZyb20gJy4uLy4uL2NvbGxpc2lvbkxhYi5qcyc7XHJcbmltcG9ydCBDb2xsaXNpb25MYWJRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vLi4vY29tbW9uL0NvbGxpc2lvbkxhYlF1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBDb2xsaXNpb25MYWJVdGlscyBmcm9tICcuLi8uLi9jb21tb24vQ29sbGlzaW9uTGFiVXRpbHMuanMnO1xyXG5pbXBvcnQgUGF0aERhdGFQb2ludCBmcm9tICcuL1BhdGhEYXRhUG9pbnQuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFBBVEhfREFUQV9QT0lOVF9MSUZFVElNRSA9IENvbGxpc2lvbkxhYlF1ZXJ5UGFyYW1ldGVycy5wYXRoUG9pbnRMaWZldGltZTtcclxuXHJcbmNsYXNzIENvbGxpc2lvbkxhYlBhdGgge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1JlYWRPbmx5UHJvcGVydHkuPFZlY3RvcjI+fSBwb3NpdGlvblByb3BlcnR5IC0gdGhlIHBvc2l0aW9uIG9mIHRoZSBtb3Zpbmcgb2JqZWN0LCBpbiBtZXRlcnMuXHJcbiAgICogQHBhcmFtIHtSZWFkT25seVByb3BlcnR5Ljxib29sZWFuPn0gcGF0aHNWaXNpYmxlUHJvcGVydHkgLSBpbmRpY2F0ZXMgaWYgdGhlICdQYXRoJyBpcyB2aXNpYmxlLiBQYXRoRGF0YVBvaW50cyBhcmVcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmx5IHJlY29yZGVkIGlmIHRoaXMgaXMgdHJ1ZSBhbmQgYXJlIGNsZWFyZWQgd2hlbiBzZXQgdG8gZmFsc2UuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHBvc2l0aW9uUHJvcGVydHksIHBhdGhzVmlzaWJsZVByb3BlcnR5ICkge1xyXG4gICAgYXNzZXJ0ICYmIEFzc2VydFV0aWxzLmFzc2VydEFic3RyYWN0UHJvcGVydHlPZiggcG9zaXRpb25Qcm9wZXJ0eSwgVmVjdG9yMiApO1xyXG4gICAgYXNzZXJ0ICYmIEFzc2VydFV0aWxzLmFzc2VydEFic3RyYWN0UHJvcGVydHlPZiggcGF0aHNWaXNpYmxlUHJvcGVydHksICdib29sZWFuJyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge1BhdGhEYXRhUG9pbnRbXX0gLSB0aGUgcmVjb3JkZWQgcG9pbnRzIG9mIHRoZSB0cmFpbGluZyBwb2ludHMgb2YgdGhlICdQYXRoJyB3aXRoaW4gYSBnaXZlblxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWUgcGVyaW9kLCB3aGljaCBpcyBQQVRIX0RBVEFfUE9JTlRfTElGRVRJTUUgc2Vjb25kcy5cclxuICAgIHRoaXMuZGF0YVBvaW50cyA9IFtdO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge0VtaXR0ZXJ9IC0gRW1pdHMgd2hlbiB0aGUgdHJhaWxpbmcgJ3BhdGgnIGhhcyBjaGFuZ2VkIGluIGFueSBmb3JtLiBVc2luZyBhbiBPYnNlcnZhYmxlQXJyYXlEZWZcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2FzIGNvbnNpZGVyZWQgZm9yIHRoZSBkYXRhUG9pbnRzIGFycmF5IGluc3RlYWQgb2YgdGhpcywgYnV0IE9ic2VydmFibGVBcnJheURlZidzXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1SZW1vdmVkRW1pdHRlciBlbWl0cyBhZnRlciBlYWNoIGl0ZW0gcmVtb3ZlZCwgd2hpY2ggd291bGQgcmVzdWx0IGluIHJlZHJhd2luZ1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b28gbWFueSB0aW1lcyB3aGVuIG11bHRpcGxlIGRhdGFQb2ludHMgYXJlIGNsZWFyZWQuIFRodXMsIHRoaXMgaXMgdXNlZCBmb3IgYVxyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzbGlnaHQgcGVyZm9ybWFuY2UgYm9vc3QuXHJcbiAgICB0aGlzLnBhdGhDaGFuZ2VkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1Byb3BlcnR5LjxWZWN0b3IyPn0gLSByZWZlcmVuY2UgdG8gdGhlIHBhc3NlZC1pbiBwb3NpdGlvblByb3BlcnR5LlxyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5ID0gcG9zaXRpb25Qcm9wZXJ0eTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7UHJvcGVydHkuPGJvb2xlYW4+fSAtIHJlZmVyZW5jZSB0byB0aGUgcGFzc2VkLWluIHBhdGhzVmlzaWJsZVByb3BlcnR5LlxyXG4gICAgdGhpcy5wYXRoc1Zpc2libGVQcm9wZXJ0eSA9IHBhdGhzVmlzaWJsZVByb3BlcnR5O1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIE9ic2VydmUgd2hlbiB0aGUgcGF0aHNWaXNpYmxlUHJvcGVydHkgaXMgbWFuaXB1bGF0ZWQgYW5kIGNsZWFyIHRoZSAnUGF0aCcgd2hlbiBzZXQgdG8gZmFsc2UuIExpbmsgbGFzdHMgZm9yIHRoZVxyXG4gICAgLy8gbGlmZXRpbWUgb2YgdGhlIHNpbXVsYXRpb24gYW5kIGlzIG5ldmVyIGRpc3Bvc2VkLlxyXG4gICAgcGF0aHNWaXNpYmxlUHJvcGVydHkubGF6eUxpbmsoIHBhdGhWaXNpYmxlID0+IHtcclxuICAgICAgIXBhdGhWaXNpYmxlICYmIHRoaXMuY2xlYXIoKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFycyB0aGUgUGF0aCdzIERhdGFQb2ludHMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogVGhpcyBpcyBpbnZva2VkIGluIHRoZSBmb2xsb3dpbmcgc2NlbmFyaW9zOlxyXG4gICAqICAgLSB0aGUgcmVzZXQgYWxsIGJ1dHRvbiBpcyBwcmVzc2VkLlxyXG4gICAqICAgLSB0aGUgcmVzdGFydCBidXR0b24gaXMgcHJlc3NlZC5cclxuICAgKiAgIC0gd2hlbiB0aGUgJ1BhdGgnIGNoZWNrYm94IGlzIHVuLWNoZWNrZWQuXHJcbiAgICogICAtIHdoZW4gdGhlIEJhbGwgKGlmIHRoZSBtb3Zpbmcgb2JqZWN0IGlzIGEgYmFsbCkgaXMgdXNlci1tYW5pcHVsYXRlZCwgZWl0aGVyIGJ5IGRyYWdnaW5nIG9yIGZyb20gdGhlIEtleXBhZC5cclxuICAgKiAgIC0gd2hlbiB0aGUgQmFsbCAoaWYgdGhlIG1vdmluZyBvYmplY3QgaXMgYSBiYWxsKSBpcyByZW1vdmVkIGZyb20gdGhlIHN5c3RlbS5cclxuICAgKi9cclxuICBjbGVhcigpIHtcclxuICAgIHdoaWxlICggdGhpcy5kYXRhUG9pbnRzLmxlbmd0aCApIHtcclxuICAgICAgdGhpcy5kYXRhUG9pbnRzLnBvcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNpZ25hbCBvbmNlIHRoYXQgdGhlIHRyYWlsaW5nICdQYXRoJyBoYXMgY2hhbmdlZC5cclxuICAgIHRoaXMucGF0aENoYW5nZWRFbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIHBhdGggYnk6XHJcbiAgICogICAtIGFkZGluZyBhIG5ldyBQYXRoRGF0YVBvaW50IGZvciB0aGUgY3VycmVudCBwb3NpdGlvbiBvZiB0aGUgbW92aW5nIG9iamVjdC5cclxuICAgKiAgIC0gcmVtb3ZpbmcgYW55IGV4cGlyZWQgUGF0aERhdGFQb2ludHMgdGhhdCBhcmUgcGFzdCB0aGUgTUFYX0RBVEFfUE9JTlRfTElGRVRJTUUuXHJcbiAgICogICAtIHJlbW92aW5nIGFueSBQYXRoRGF0YVBvaW50cyB0aGF0IGFyZSBhaGVhZCBvZiB0aGUgdG90YWwgZWxhcHNlZCB0aW1lIG9mIHRoZSBzaW11bGF0aW9uLiBUaGlzIG9jY3VycyB3aGVuIHRoZVxyXG4gICAqICAgICBzdGVwLWJhY2t3YXJkIGJ1dHRvbiBpcyBwcmVzc2VkLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIE5PVEU6IE5vLW9wIGZvciB3aGVuIHRoZSBwYXRoIGlzIG5vdCB2aXNpYmxlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGVsYXBzZWRUaW1lIC0gdGhlIHRvdGFsIGVsYXBzZWQgZWxhcHNlZFRpbWUgb2YgdGhlIHNpbXVsYXRpb24sIGluIHNlY29uZHMuXHJcbiAgICovXHJcbiAgdXBkYXRlUGF0aCggZWxhcHNlZFRpbWUgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgZWxhcHNlZFRpbWUgPT09ICdudW1iZXInICYmIGVsYXBzZWRUaW1lID49IDAsIGBpbnZhbGlkIGVsYXBzZWRUaW1lOiAke2VsYXBzZWRUaW1lfWAgKTtcclxuICAgIGlmICggIXRoaXMucGF0aHNWaXNpYmxlUHJvcGVydHkudmFsdWUgKSB7IHJldHVybjsgLyoqIGRvIG5vdGhpbmcgKiovIH1cclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmRhdGFQb2ludHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGRhdGFQb2ludCA9IHRoaXMuZGF0YVBvaW50c1sgaSBdO1xyXG5cclxuICAgICAgLy8gUmVtb3ZlIGFueSBleHBpcmVkIFBhdGhEYXRhUG9pbnRzIHRoYXQgYXJlIG5vdCB3aXRoaW4gdGhlIE1BWF9EQVRBX1BPSU5UX0xJRkVUSU1FIG9yIHRoYXQgYXJlIGFoZWFkIG9mIHRoZVxyXG4gICAgICAvLyB0b3RhbCBlbGFwc2VkVGltZSBvZiB0aGUgc2ltdWxhdGlvbi4gVGhpcyBvY2N1cnMgd2hlbiB0aGUgc3RlcC1iYWNrd2FyZCBidXR0b24gaXMgcHJlc3NlZC5cclxuICAgICAgaWYgKCBkYXRhUG9pbnQudGltZSArIFBBVEhfREFUQV9QT0lOVF9MSUZFVElNRSA8PSBlbGFwc2VkVGltZSB8fCBkYXRhUG9pbnQudGltZSA+PSBlbGFwc2VkVGltZSApIHtcclxuICAgICAgICB0aGlzLmRhdGFQb2ludHMuc3BsaWNlKCBpLS0sIDEgKTsgLy8gUmVtb3ZlIGl0LCBhbmQgc3RlcCBiYWNrIHNvIHdlJ2xsIHNjYW4gdGhlIG5leHQgaW5kZXhcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkZCBhIG5ldyBQYXRoRGF0YVBvaW50IGZvciB0aGUgY3VycmVudCBwb3NpdGlvbiBvZiB0aGUgbW92aW5nIG9iamVjdC5cclxuICAgIHRoaXMuZGF0YVBvaW50cy5wdXNoKCBuZXcgUGF0aERhdGFQb2ludCggZWxhcHNlZFRpbWUsIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApICk7XHJcblxyXG4gICAgLy8gVmVyaWZ5IHRoYXQgdGhlIGRhdGFQb2ludHMgYXJlIHN0cmljdGx5IHNvcnRlZCBieSB0aW1lLlxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQ29sbGlzaW9uTGFiVXRpbHMuaXNTb3J0ZWQoIHRoaXMuZGF0YVBvaW50cywgZGF0YVBvaW50ID0+IGRhdGFQb2ludC50aW1lICkgKTtcclxuXHJcbiAgICAvLyBTaWduYWwgdGhhdCB0aGUgdHJhaWxpbmcgJ1BhdGgnIGhhcyBjaGFuZ2VkLlxyXG4gICAgdGhpcy5wYXRoQ2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gIH1cclxufVxyXG5cclxuY29sbGlzaW9uTGFiLnJlZ2lzdGVyKCAnQ29sbGlzaW9uTGFiUGF0aCcsIENvbGxpc2lvbkxhYlBhdGggKTtcclxuZXhwb3J0IGRlZmF1bHQgQ29sbGlzaW9uTGFiUGF0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