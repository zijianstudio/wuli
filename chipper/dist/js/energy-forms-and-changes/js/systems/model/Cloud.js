// Copyright 2016-2022, University of Colorado Boulder

/**
 * model of a cloud that can block energy coming from the sun
 *
 * @author  John Blanco
 * @author  Andrew Adare
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import { Shape } from '../../../../kite/js/imports.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

// constants
const WIDTH = 0.035; // In meters, though obviously not to scale.  Empirically determined.
const HEIGHT = WIDTH * 0.55; // determined from the approximate aspect ratio of the image

class Cloud {
  /**
   * @param {Vector2} offsetFromParent
   * @param {Property.<Vector2>} parentPositionProperty
   */
  constructor(offsetFromParent, parentPositionProperty) {
    // @public {NumberProperty} - existence strength, which basically translates to opacity, of the cloud
    this.existenceStrengthProperty = new NumberProperty(1, {
      range: new Range(0, 1)
    });

    // @public (read-only) {number} - offset position for this cloud
    this.offsetFromParent = offsetFromParent;

    // @private {number} - used to calculate this cloud's position
    this.parentPositionProperty = parentPositionProperty;

    // @private {Shape|null} - the ellipse that defines the shape of this cloud. only null until the parent position
    // is linked
    this.cloudEllipse = null;
    this.parentPositionProperty.link(parentPosition => {
      const center = parentPosition.plus(this.offsetFromParent);
      this.cloudEllipse = Shape.ellipse(center.x, center.y, WIDTH / 2, HEIGHT / 2, 0, 0, 0, false);
    });
  }

  /**
   * return ellipse with size of this cloud
   * @returns {Shape.ellipse} - ellipse with axes sized to width and height of cloud
   * @public
   */
  getCloudAbsorptionReflectionShape() {
    return this.cloudEllipse;
  }

  /**
   * @returns {Vector2} Center position of cloud
   * @public
   */
  getCenterPosition() {
    return this.parentPositionProperty.get().plus(this.offsetFromParent);
  }
}

// statics
Cloud.WIDTH = WIDTH;
Cloud.HEIGHT = HEIGHT;
energyFormsAndChanges.register('Cloud', Cloud);
export default Cloud;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlIiwiU2hhcGUiLCJlbmVyZ3lGb3Jtc0FuZENoYW5nZXMiLCJXSURUSCIsIkhFSUdIVCIsIkNsb3VkIiwiY29uc3RydWN0b3IiLCJvZmZzZXRGcm9tUGFyZW50IiwicGFyZW50UG9zaXRpb25Qcm9wZXJ0eSIsImV4aXN0ZW5jZVN0cmVuZ3RoUHJvcGVydHkiLCJyYW5nZSIsImNsb3VkRWxsaXBzZSIsImxpbmsiLCJwYXJlbnRQb3NpdGlvbiIsImNlbnRlciIsInBsdXMiLCJlbGxpcHNlIiwieCIsInkiLCJnZXRDbG91ZEFic29ycHRpb25SZWZsZWN0aW9uU2hhcGUiLCJnZXRDZW50ZXJQb3NpdGlvbiIsImdldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ2xvdWQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogbW9kZWwgb2YgYSBjbG91ZCB0aGF0IGNhbiBibG9jayBlbmVyZ3kgY29taW5nIGZyb20gdGhlIHN1blxyXG4gKlxyXG4gKiBAYXV0aG9yICBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yICBBbmRyZXcgQWRhcmVcclxuICovXHJcblxyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBlbmVyZ3lGb3Jtc0FuZENoYW5nZXMgZnJvbSAnLi4vLi4vZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBXSURUSCA9IDAuMDM1OyAvLyBJbiBtZXRlcnMsIHRob3VnaCBvYnZpb3VzbHkgbm90IHRvIHNjYWxlLiAgRW1waXJpY2FsbHkgZGV0ZXJtaW5lZC5cclxuY29uc3QgSEVJR0hUID0gV0lEVEggKiAwLjU1OyAvLyBkZXRlcm1pbmVkIGZyb20gdGhlIGFwcHJveGltYXRlIGFzcGVjdCByYXRpbyBvZiB0aGUgaW1hZ2VcclxuXHJcbmNsYXNzIENsb3VkIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBvZmZzZXRGcm9tUGFyZW50XHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48VmVjdG9yMj59IHBhcmVudFBvc2l0aW9uUHJvcGVydHlcclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggb2Zmc2V0RnJvbVBhcmVudCwgcGFyZW50UG9zaXRpb25Qcm9wZXJ0eSApIHtcclxuXHJcbiAgICAvLyBAcHVibGljIHtOdW1iZXJQcm9wZXJ0eX0gLSBleGlzdGVuY2Ugc3RyZW5ndGgsIHdoaWNoIGJhc2ljYWxseSB0cmFuc2xhdGVzIHRvIG9wYWNpdHksIG9mIHRoZSBjbG91ZFxyXG4gICAgdGhpcy5leGlzdGVuY2VTdHJlbmd0aFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAxLCB7XHJcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAsIDEgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge251bWJlcn0gLSBvZmZzZXQgcG9zaXRpb24gZm9yIHRoaXMgY2xvdWRcclxuICAgIHRoaXMub2Zmc2V0RnJvbVBhcmVudCA9IG9mZnNldEZyb21QYXJlbnQ7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bWJlcn0gLSB1c2VkIHRvIGNhbGN1bGF0ZSB0aGlzIGNsb3VkJ3MgcG9zaXRpb25cclxuICAgIHRoaXMucGFyZW50UG9zaXRpb25Qcm9wZXJ0eSA9IHBhcmVudFBvc2l0aW9uUHJvcGVydHk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1NoYXBlfG51bGx9IC0gdGhlIGVsbGlwc2UgdGhhdCBkZWZpbmVzIHRoZSBzaGFwZSBvZiB0aGlzIGNsb3VkLiBvbmx5IG51bGwgdW50aWwgdGhlIHBhcmVudCBwb3NpdGlvblxyXG4gICAgLy8gaXMgbGlua2VkXHJcbiAgICB0aGlzLmNsb3VkRWxsaXBzZSA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5wYXJlbnRQb3NpdGlvblByb3BlcnR5LmxpbmsoIHBhcmVudFBvc2l0aW9uID0+IHtcclxuICAgICAgY29uc3QgY2VudGVyID0gcGFyZW50UG9zaXRpb24ucGx1cyggdGhpcy5vZmZzZXRGcm9tUGFyZW50ICk7XHJcbiAgICAgIHRoaXMuY2xvdWRFbGxpcHNlID0gU2hhcGUuZWxsaXBzZSggY2VudGVyLngsIGNlbnRlci55LCBXSURUSCAvIDIsIEhFSUdIVCAvIDIsIDAsIDAsIDAsIGZhbHNlICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiByZXR1cm4gZWxsaXBzZSB3aXRoIHNpemUgb2YgdGhpcyBjbG91ZFxyXG4gICAqIEByZXR1cm5zIHtTaGFwZS5lbGxpcHNlfSAtIGVsbGlwc2Ugd2l0aCBheGVzIHNpemVkIHRvIHdpZHRoIGFuZCBoZWlnaHQgb2YgY2xvdWRcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0Q2xvdWRBYnNvcnB0aW9uUmVmbGVjdGlvblNoYXBlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY2xvdWRFbGxpcHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9IENlbnRlciBwb3NpdGlvbiBvZiBjbG91ZFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRDZW50ZXJQb3NpdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLnBhcmVudFBvc2l0aW9uUHJvcGVydHkuZ2V0KCkucGx1cyggdGhpcy5vZmZzZXRGcm9tUGFyZW50ICk7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuLy8gc3RhdGljc1xyXG5DbG91ZC5XSURUSCA9IFdJRFRIO1xyXG5DbG91ZC5IRUlHSFQgPSBIRUlHSFQ7XHJcblxyXG5lbmVyZ3lGb3Jtc0FuZENoYW5nZXMucmVnaXN0ZXIoICdDbG91ZCcsIENsb3VkICk7XHJcbmV4cG9ydCBkZWZhdWx0IENsb3VkOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLHFCQUFxQixNQUFNLGdDQUFnQzs7QUFFbEU7QUFDQSxNQUFNQyxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUM7QUFDckIsTUFBTUMsTUFBTSxHQUFHRCxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUM7O0FBRTdCLE1BQU1FLEtBQUssQ0FBQztFQUVWO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VDLFdBQVdBLENBQUVDLGdCQUFnQixFQUFFQyxzQkFBc0IsRUFBRztJQUV0RDtJQUNBLElBQUksQ0FBQ0MseUJBQXlCLEdBQUcsSUFBSVYsY0FBYyxDQUFFLENBQUMsRUFBRTtNQUN0RFcsS0FBSyxFQUFFLElBQUlWLEtBQUssQ0FBRSxDQUFDLEVBQUUsQ0FBRTtJQUN6QixDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNPLGdCQUFnQixHQUFHQSxnQkFBZ0I7O0lBRXhDO0lBQ0EsSUFBSSxDQUFDQyxzQkFBc0IsR0FBR0Esc0JBQXNCOztJQUVwRDtJQUNBO0lBQ0EsSUFBSSxDQUFDRyxZQUFZLEdBQUcsSUFBSTtJQUV4QixJQUFJLENBQUNILHNCQUFzQixDQUFDSSxJQUFJLENBQUVDLGNBQWMsSUFBSTtNQUNsRCxNQUFNQyxNQUFNLEdBQUdELGNBQWMsQ0FBQ0UsSUFBSSxDQUFFLElBQUksQ0FBQ1IsZ0JBQWlCLENBQUM7TUFDM0QsSUFBSSxDQUFDSSxZQUFZLEdBQUdWLEtBQUssQ0FBQ2UsT0FBTyxDQUFFRixNQUFNLENBQUNHLENBQUMsRUFBRUgsTUFBTSxDQUFDSSxDQUFDLEVBQUVmLEtBQUssR0FBRyxDQUFDLEVBQUVDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBTSxDQUFDO0lBQ2hHLENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRWUsaUNBQWlDQSxDQUFBLEVBQUc7SUFDbEMsT0FBTyxJQUFJLENBQUNSLFlBQVk7RUFDMUI7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRVMsaUJBQWlCQSxDQUFBLEVBQUc7SUFDbEIsT0FBTyxJQUFJLENBQUNaLHNCQUFzQixDQUFDYSxHQUFHLENBQUMsQ0FBQyxDQUFDTixJQUFJLENBQUUsSUFBSSxDQUFDUixnQkFBaUIsQ0FBQztFQUN4RTtBQUVGOztBQUVBO0FBQ0FGLEtBQUssQ0FBQ0YsS0FBSyxHQUFHQSxLQUFLO0FBQ25CRSxLQUFLLENBQUNELE1BQU0sR0FBR0EsTUFBTTtBQUVyQkYscUJBQXFCLENBQUNvQixRQUFRLENBQUUsT0FBTyxFQUFFakIsS0FBTSxDQUFDO0FBQ2hELGVBQWVBLEtBQUsifQ==