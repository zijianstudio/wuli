// Copyright 2017-2023, University of Colorado Boulder

/**
 * A base type for appedages in this sim. Extended by Arm.js and Leg.js.  Appendages have a pivot point, and an
 * observable angle which is used for dragging.
 *
 * @author Jesse Greenberg
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import johnTravoltage from '../../johnTravoltage.js';
const MOVEMENT_DIRECTIONS = {
  CLOSER: 'CLOSER',
  FARTHER: 'FARTHER'
};
class Appendage {
  /**
   * @param {Vector2} pivotPoint
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(pivotPoint, tandem, options) {
    options = merge({
      initialAngle: -0.5,
      // radians
      range: new Range(-Math.PI, Math.PI),
      precision: 7
    }, options);

    // @private
    this.initialAngle = options.initialAngle;

    // @public
    this.angleProperty = new NumberProperty(this.initialAngle, {
      tandem: tandem.createTandem('angleProperty'),
      units: 'radians',
      range: options.range
    });

    // @public
    this.borderVisibleProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('borderVisibleProperty')
    });

    // @public (read-only)
    this.position = pivotPoint;

    // @public - Whether the appendage is currently being dragged
    this.isDraggingProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('draggingProperty')
    });

    // @public - emits an event when the appendage is reset
    this.appendageResetEmitter = new Emitter();
  }

  /**
   * Reset the appendage.
   * @public
   */
  reset() {
    this.angleProperty.reset();
    this.appendageResetEmitter.emit();
  }
}

// @public @static
Appendage.MOVEMENT_DIRECTIONS = MOVEMENT_DIRECTIONS;
johnTravoltage.register('Appendage', Appendage);
export default Appendage;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbWl0dGVyIiwiTnVtYmVyUHJvcGVydHkiLCJSYW5nZSIsIm1lcmdlIiwiam9oblRyYXZvbHRhZ2UiLCJNT1ZFTUVOVF9ESVJFQ1RJT05TIiwiQ0xPU0VSIiwiRkFSVEhFUiIsIkFwcGVuZGFnZSIsImNvbnN0cnVjdG9yIiwicGl2b3RQb2ludCIsInRhbmRlbSIsIm9wdGlvbnMiLCJpbml0aWFsQW5nbGUiLCJyYW5nZSIsIk1hdGgiLCJQSSIsInByZWNpc2lvbiIsImFuZ2xlUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJ1bml0cyIsImJvcmRlclZpc2libGVQcm9wZXJ0eSIsInBvc2l0aW9uIiwiaXNEcmFnZ2luZ1Byb3BlcnR5IiwiYXBwZW5kYWdlUmVzZXRFbWl0dGVyIiwicmVzZXQiLCJlbWl0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJBcHBlbmRhZ2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBiYXNlIHR5cGUgZm9yIGFwcGVkYWdlcyBpbiB0aGlzIHNpbS4gRXh0ZW5kZWQgYnkgQXJtLmpzIGFuZCBMZWcuanMuICBBcHBlbmRhZ2VzIGhhdmUgYSBwaXZvdCBwb2ludCwgYW5kIGFuXHJcbiAqIG9ic2VydmFibGUgYW5nbGUgd2hpY2ggaXMgdXNlZCBmb3IgZHJhZ2dpbmcuXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgam9oblRyYXZvbHRhZ2UgZnJvbSAnLi4vLi4vam9oblRyYXZvbHRhZ2UuanMnO1xyXG5cclxuY29uc3QgTU9WRU1FTlRfRElSRUNUSU9OUyA9IHtcclxuICBDTE9TRVI6ICdDTE9TRVInLFxyXG4gIEZBUlRIRVI6ICdGQVJUSEVSJ1xyXG59O1xyXG5cclxuY2xhc3MgQXBwZW5kYWdlIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBpdm90UG9pbnRcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBwaXZvdFBvaW50LCB0YW5kZW0sIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIGluaXRpYWxBbmdsZTogLTAuNSwgLy8gcmFkaWFuc1xyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAtTWF0aC5QSSwgTWF0aC5QSSApLFxyXG4gICAgICBwcmVjaXNpb246IDdcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5pbml0aWFsQW5nbGUgPSBvcHRpb25zLmluaXRpYWxBbmdsZTtcclxuXHJcbiAgICAvLyBAcHVibGljXHJcbiAgICB0aGlzLmFuZ2xlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIHRoaXMuaW5pdGlhbEFuZ2xlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2FuZ2xlUHJvcGVydHknICksXHJcbiAgICAgIHVuaXRzOiAncmFkaWFucycsXHJcbiAgICAgIHJhbmdlOiBvcHRpb25zLnJhbmdlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpY1xyXG4gICAgdGhpcy5ib3JkZXJWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2JvcmRlclZpc2libGVQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSlcclxuICAgIHRoaXMucG9zaXRpb24gPSBwaXZvdFBvaW50O1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSBXaGV0aGVyIHRoZSBhcHBlbmRhZ2UgaXMgY3VycmVudGx5IGJlaW5nIGRyYWdnZWRcclxuICAgIHRoaXMuaXNEcmFnZ2luZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZHJhZ2dpbmdQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSBlbWl0cyBhbiBldmVudCB3aGVuIHRoZSBhcHBlbmRhZ2UgaXMgcmVzZXRcclxuICAgIHRoaXMuYXBwZW5kYWdlUmVzZXRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBSZXNldCB0aGUgYXBwZW5kYWdlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMuYW5nbGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5hcHBlbmRhZ2VSZXNldEVtaXR0ZXIuZW1pdCgpO1xyXG4gIH1cclxuXHJcbn1cclxuXHJcblxyXG4vLyBAcHVibGljIEBzdGF0aWNcclxuQXBwZW5kYWdlLk1PVkVNRU5UX0RJUkVDVElPTlMgPSBNT1ZFTUVOVF9ESVJFQ1RJT05TO1xyXG5cclxuam9oblRyYXZvbHRhZ2UucmVnaXN0ZXIoICdBcHBlbmRhZ2UnLCBBcHBlbmRhZ2UgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEFwcGVuZGFnZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLE9BQU8sTUFBTSxnQ0FBZ0M7QUFDcEQsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsY0FBYyxNQUFNLHlCQUF5QjtBQUVwRCxNQUFNQyxtQkFBbUIsR0FBRztFQUMxQkMsTUFBTSxFQUFFLFFBQVE7RUFDaEJDLE9BQU8sRUFBRTtBQUNYLENBQUM7QUFFRCxNQUFNQyxTQUFTLENBQUM7RUFDZDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLFdBQVdBLENBQUVDLFVBQVUsRUFBRUMsTUFBTSxFQUFFQyxPQUFPLEVBQUc7SUFFekNBLE9BQU8sR0FBR1QsS0FBSyxDQUFFO01BQ2ZVLFlBQVksRUFBRSxDQUFDLEdBQUc7TUFBRTtNQUNwQkMsS0FBSyxFQUFFLElBQUlaLEtBQUssQ0FBRSxDQUFDYSxJQUFJLENBQUNDLEVBQUUsRUFBRUQsSUFBSSxDQUFDQyxFQUFHLENBQUM7TUFDckNDLFNBQVMsRUFBRTtJQUNiLENBQUMsRUFBRUwsT0FBUSxDQUFDOztJQUVaO0lBQ0EsSUFBSSxDQUFDQyxZQUFZLEdBQUdELE9BQU8sQ0FBQ0MsWUFBWTs7SUFFeEM7SUFDQSxJQUFJLENBQUNLLGFBQWEsR0FBRyxJQUFJakIsY0FBYyxDQUFFLElBQUksQ0FBQ1ksWUFBWSxFQUFFO01BQzFERixNQUFNLEVBQUVBLE1BQU0sQ0FBQ1EsWUFBWSxDQUFFLGVBQWdCLENBQUM7TUFDOUNDLEtBQUssRUFBRSxTQUFTO01BQ2hCTixLQUFLLEVBQUVGLE9BQU8sQ0FBQ0U7SUFDakIsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsSUFBSSxDQUFDTyxxQkFBcUIsR0FBRyxJQUFJdEIsZUFBZSxDQUFFLElBQUksRUFBRTtNQUN0RFksTUFBTSxFQUFFQSxNQUFNLENBQUNRLFlBQVksQ0FBRSx1QkFBd0I7SUFDdkQsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsSUFBSSxDQUFDRyxRQUFRLEdBQUdaLFVBQVU7O0lBRTFCO0lBQ0EsSUFBSSxDQUFDYSxrQkFBa0IsR0FBRyxJQUFJeEIsZUFBZSxDQUFFLEtBQUssRUFBRTtNQUNwRFksTUFBTSxFQUFFQSxNQUFNLENBQUNRLFlBQVksQ0FBRSxrQkFBbUI7SUFDbEQsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsSUFBSSxDQUFDSyxxQkFBcUIsR0FBRyxJQUFJeEIsT0FBTyxDQUFDLENBQUM7RUFDNUM7O0VBR0E7QUFDRjtBQUNBO0FBQ0E7RUFDRXlCLEtBQUtBLENBQUEsRUFBRztJQUNOLElBQUksQ0FBQ1AsYUFBYSxDQUFDTyxLQUFLLENBQUMsQ0FBQztJQUMxQixJQUFJLENBQUNELHFCQUFxQixDQUFDRSxJQUFJLENBQUMsQ0FBQztFQUNuQztBQUVGOztBQUdBO0FBQ0FsQixTQUFTLENBQUNILG1CQUFtQixHQUFHQSxtQkFBbUI7QUFFbkRELGNBQWMsQ0FBQ3VCLFFBQVEsQ0FBRSxXQUFXLEVBQUVuQixTQUFVLENBQUM7QUFFakQsZUFBZUEsU0FBUyJ9