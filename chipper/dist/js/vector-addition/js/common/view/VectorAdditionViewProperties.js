// Copyright 2019-2023, University of Colorado Boulder

/**
 * View-specific Properties for the sim. Can be subclassed to add more Properties.
 *
 * @author Brandon Li
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import vectorAddition from '../../vectorAddition.js';
import CoordinateSnapModes from '../model/CoordinateSnapModes.js';
export default class VectorAdditionViewProperties {
  constructor() {
    // @public indicates if the labels should contain the magnitudes
    this.valuesVisibleProperty = new BooleanProperty(false);

    // @public controls the visibility of the angle
    this.anglesVisibleProperty = new BooleanProperty(false);

    // @public indicates if the graph background grid is visible
    this.gridVisibleProperty = new BooleanProperty(true);

    // @public controls the snapping mode for the vectors
    this.coordinateSnapModeProperty = new EnumerationProperty(CoordinateSnapModes.CARTESIAN);

    // @public whether the VectorValuesToggleBox is expanded
    this.vectorValuesExpandedProperty = new BooleanProperty(true);
  }

  /**
   * Resets the view properties
   * @public
   */
  reset() {
    this.valuesVisibleProperty.reset();
    this.anglesVisibleProperty.reset();
    this.gridVisibleProperty.reset();
    this.coordinateSnapModeProperty.reset();
    this.vectorValuesExpandedProperty.reset();
  }

  /**
   * @public
   */
  dispose() {
    assert && assert(false, 'VectorAdditionViewProperties are not intended to be disposed');
  }
}
vectorAddition.register('VectorAdditionViewProperties', VectorAdditionViewProperties);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbnVtZXJhdGlvblByb3BlcnR5IiwidmVjdG9yQWRkaXRpb24iLCJDb29yZGluYXRlU25hcE1vZGVzIiwiVmVjdG9yQWRkaXRpb25WaWV3UHJvcGVydGllcyIsImNvbnN0cnVjdG9yIiwidmFsdWVzVmlzaWJsZVByb3BlcnR5IiwiYW5nbGVzVmlzaWJsZVByb3BlcnR5IiwiZ3JpZFZpc2libGVQcm9wZXJ0eSIsImNvb3JkaW5hdGVTbmFwTW9kZVByb3BlcnR5IiwiQ0FSVEVTSUFOIiwidmVjdG9yVmFsdWVzRXhwYW5kZWRQcm9wZXJ0eSIsInJlc2V0IiwiZGlzcG9zZSIsImFzc2VydCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVmVjdG9yQWRkaXRpb25WaWV3UHJvcGVydGllcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3LXNwZWNpZmljIFByb3BlcnRpZXMgZm9yIHRoZSBzaW0uIENhbiBiZSBzdWJjbGFzc2VkIHRvIGFkZCBtb3JlIFByb3BlcnRpZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb25Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VudW1lcmF0aW9uUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgdmVjdG9yQWRkaXRpb24gZnJvbSAnLi4vLi4vdmVjdG9yQWRkaXRpb24uanMnO1xyXG5pbXBvcnQgQ29vcmRpbmF0ZVNuYXBNb2RlcyBmcm9tICcuLi9tb2RlbC9Db29yZGluYXRlU25hcE1vZGVzLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZlY3RvckFkZGl0aW9uVmlld1Byb3BlcnRpZXMge1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICAvLyBAcHVibGljIGluZGljYXRlcyBpZiB0aGUgbGFiZWxzIHNob3VsZCBjb250YWluIHRoZSBtYWduaXR1ZGVzXHJcbiAgICB0aGlzLnZhbHVlc1Zpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyBjb250cm9scyB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgYW5nbGVcclxuICAgIHRoaXMuYW5nbGVzVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIGluZGljYXRlcyBpZiB0aGUgZ3JhcGggYmFja2dyb3VuZCBncmlkIGlzIHZpc2libGVcclxuICAgIHRoaXMuZ3JpZFZpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIGNvbnRyb2xzIHRoZSBzbmFwcGluZyBtb2RlIGZvciB0aGUgdmVjdG9yc1xyXG4gICAgdGhpcy5jb29yZGluYXRlU25hcE1vZGVQcm9wZXJ0eSA9IG5ldyBFbnVtZXJhdGlvblByb3BlcnR5KCBDb29yZGluYXRlU25hcE1vZGVzLkNBUlRFU0lBTiApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgd2hldGhlciB0aGUgVmVjdG9yVmFsdWVzVG9nZ2xlQm94IGlzIGV4cGFuZGVkXHJcbiAgICB0aGlzLnZlY3RvclZhbHVlc0V4cGFuZGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldHMgdGhlIHZpZXcgcHJvcGVydGllc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMudmFsdWVzVmlzaWJsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmFuZ2xlc1Zpc2libGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5ncmlkVmlzaWJsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmNvb3JkaW5hdGVTbmFwTW9kZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnZlY3RvclZhbHVlc0V4cGFuZGVkUHJvcGVydHkucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdWZWN0b3JBZGRpdGlvblZpZXdQcm9wZXJ0aWVzIGFyZSBub3QgaW50ZW5kZWQgdG8gYmUgZGlzcG9zZWQnICk7XHJcbiAgfVxyXG59XHJcblxyXG52ZWN0b3JBZGRpdGlvbi5yZWdpc3RlciggJ1ZlY3RvckFkZGl0aW9uVmlld1Byb3BlcnRpZXMnLCBWZWN0b3JBZGRpdGlvblZpZXdQcm9wZXJ0aWVzICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsbUJBQW1CLE1BQU0sNENBQTRDO0FBQzVFLE9BQU9DLGNBQWMsTUFBTSx5QkFBeUI7QUFDcEQsT0FBT0MsbUJBQW1CLE1BQU0saUNBQWlDO0FBRWpFLGVBQWUsTUFBTUMsNEJBQTRCLENBQUM7RUFFaERDLFdBQVdBLENBQUEsRUFBRztJQUVaO0lBQ0EsSUFBSSxDQUFDQyxxQkFBcUIsR0FBRyxJQUFJTixlQUFlLENBQUUsS0FBTSxDQUFDOztJQUV6RDtJQUNBLElBQUksQ0FBQ08scUJBQXFCLEdBQUcsSUFBSVAsZUFBZSxDQUFFLEtBQU0sQ0FBQzs7SUFFekQ7SUFDQSxJQUFJLENBQUNRLG1CQUFtQixHQUFHLElBQUlSLGVBQWUsQ0FBRSxJQUFLLENBQUM7O0lBRXREO0lBQ0EsSUFBSSxDQUFDUywwQkFBMEIsR0FBRyxJQUFJUixtQkFBbUIsQ0FBRUUsbUJBQW1CLENBQUNPLFNBQVUsQ0FBQzs7SUFFMUY7SUFDQSxJQUFJLENBQUNDLDRCQUE0QixHQUFHLElBQUlYLGVBQWUsQ0FBRSxJQUFLLENBQUM7RUFDakU7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRVksS0FBS0EsQ0FBQSxFQUFHO0lBQ04sSUFBSSxDQUFDTixxQkFBcUIsQ0FBQ00sS0FBSyxDQUFDLENBQUM7SUFDbEMsSUFBSSxDQUFDTCxxQkFBcUIsQ0FBQ0ssS0FBSyxDQUFDLENBQUM7SUFDbEMsSUFBSSxDQUFDSixtQkFBbUIsQ0FBQ0ksS0FBSyxDQUFDLENBQUM7SUFDaEMsSUFBSSxDQUFDSCwwQkFBMEIsQ0FBQ0csS0FBSyxDQUFDLENBQUM7SUFDdkMsSUFBSSxDQUFDRCw0QkFBNEIsQ0FBQ0MsS0FBSyxDQUFDLENBQUM7RUFDM0M7O0VBRUE7QUFDRjtBQUNBO0VBQ0VDLE9BQU9BLENBQUEsRUFBRztJQUNSQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsOERBQStELENBQUM7RUFDM0Y7QUFDRjtBQUVBWixjQUFjLENBQUNhLFFBQVEsQ0FBRSw4QkFBOEIsRUFBRVgsNEJBQTZCLENBQUMifQ==