// Copyright 2017-2023, University of Colorado Boulder

/**
 * Model of a shopping item.
 * Origin is at the bottom center of the item.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import URMovable from '../../common/model/URMovable.js';
import unitRates from '../../unitRates.js';
export default class ShoppingItem extends URMovable {
  /**
   * @param {string} name - for internal use
   * @param {HTMLImageElement} image - image used by the view to represent this item
   * @param {Object} [options]
   */
  constructor(name, image, options) {
    options = merge({
      animationSpeed: 400,
      // distance/second
      visible: true // {boolean} is the item initially visible?
    }, options);
    super(options);

    // @public (read-only)
    this.name = name;
    this.image = image;

    // @public
    this.visibleProperty = new BooleanProperty(options.visible);
  }

  /**
   * @public
   * @override
   */
  reset() {
    this.visibleProperty.reset();
    super.reset();
  }
}
unitRates.register('ShoppingItem', ShoppingItem);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJtZXJnZSIsIlVSTW92YWJsZSIsInVuaXRSYXRlcyIsIlNob3BwaW5nSXRlbSIsImNvbnN0cnVjdG9yIiwibmFtZSIsImltYWdlIiwib3B0aW9ucyIsImFuaW1hdGlvblNwZWVkIiwidmlzaWJsZSIsInZpc2libGVQcm9wZXJ0eSIsInJlc2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTaG9wcGluZ0l0ZW0uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTW9kZWwgb2YgYSBzaG9wcGluZyBpdGVtLlxyXG4gKiBPcmlnaW4gaXMgYXQgdGhlIGJvdHRvbSBjZW50ZXIgb2YgdGhlIGl0ZW0uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgVVJNb3ZhYmxlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9VUk1vdmFibGUuanMnO1xyXG5pbXBvcnQgdW5pdFJhdGVzIGZyb20gJy4uLy4uL3VuaXRSYXRlcy5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaG9wcGluZ0l0ZW0gZXh0ZW5kcyBVUk1vdmFibGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAtIGZvciBpbnRlcm5hbCB1c2VcclxuICAgKiBAcGFyYW0ge0hUTUxJbWFnZUVsZW1lbnR9IGltYWdlIC0gaW1hZ2UgdXNlZCBieSB0aGUgdmlldyB0byByZXByZXNlbnQgdGhpcyBpdGVtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBuYW1lLCBpbWFnZSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgYW5pbWF0aW9uU3BlZWQ6IDQwMCwgLy8gZGlzdGFuY2Uvc2Vjb25kXHJcbiAgICAgIHZpc2libGU6IHRydWUgLy8ge2Jvb2xlYW59IGlzIHRoZSBpdGVtIGluaXRpYWxseSB2aXNpYmxlP1xyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KVxyXG4gICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgIHRoaXMuaW1hZ2UgPSBpbWFnZTtcclxuXHJcbiAgICAvLyBAcHVibGljXHJcbiAgICB0aGlzLnZpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIG9wdGlvbnMudmlzaWJsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy52aXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHN1cGVyLnJlc2V0KCk7XHJcbiAgfVxyXG59XHJcblxyXG51bml0UmF0ZXMucmVnaXN0ZXIoICdTaG9wcGluZ0l0ZW0nLCBTaG9wcGluZ0l0ZW0gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsU0FBUyxNQUFNLGlDQUFpQztBQUN2RCxPQUFPQyxTQUFTLE1BQU0sb0JBQW9CO0FBRTFDLGVBQWUsTUFBTUMsWUFBWSxTQUFTRixTQUFTLENBQUM7RUFFbEQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFRyxXQUFXQSxDQUFFQyxJQUFJLEVBQUVDLEtBQUssRUFBRUMsT0FBTyxFQUFHO0lBRWxDQSxPQUFPLEdBQUdQLEtBQUssQ0FBRTtNQUNmUSxjQUFjLEVBQUUsR0FBRztNQUFFO01BQ3JCQyxPQUFPLEVBQUUsSUFBSSxDQUFDO0lBQ2hCLENBQUMsRUFBRUYsT0FBUSxDQUFDO0lBRVosS0FBSyxDQUFFQSxPQUFRLENBQUM7O0lBRWhCO0lBQ0EsSUFBSSxDQUFDRixJQUFJLEdBQUdBLElBQUk7SUFDaEIsSUFBSSxDQUFDQyxLQUFLLEdBQUdBLEtBQUs7O0lBRWxCO0lBQ0EsSUFBSSxDQUFDSSxlQUFlLEdBQUcsSUFBSVgsZUFBZSxDQUFFUSxPQUFPLENBQUNFLE9BQVEsQ0FBQztFQUMvRDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFRSxLQUFLQSxDQUFBLEVBQUc7SUFDTixJQUFJLENBQUNELGVBQWUsQ0FBQ0MsS0FBSyxDQUFDLENBQUM7SUFDNUIsS0FBSyxDQUFDQSxLQUFLLENBQUMsQ0FBQztFQUNmO0FBQ0Y7QUFFQVQsU0FBUyxDQUFDVSxRQUFRLENBQUUsY0FBYyxFQUFFVCxZQUFhLENBQUMifQ==