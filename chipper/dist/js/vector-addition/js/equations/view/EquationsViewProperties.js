// Copyright 2019-2023, University of Colorado Boulder

/**
 * View-specific Properties for the 'Equations' screen. Expands on the base view Properties, and adds Properties
 * that are unique to this screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import VectorAdditionViewProperties from '../../common/view/VectorAdditionViewProperties.js';
import vectorAddition from '../../vectorAddition.js';
export default class EquationsViewProperties extends VectorAdditionViewProperties {
  constructor() {
    super();

    // @public whether the EquationToggleBox is expanded
    this.equationExpandedProperty = new BooleanProperty(true);

    // @public whether the BaseVectorsAccordionBox is expanded
    this.baseVectorsExpandedProperty = new BooleanProperty(false);

    // @public whether base vectors are visible on the graph
    this.baseVectorsVisibleProperty = new BooleanProperty(false);
  }

  /**
   * @public
   * @override
   */
  reset() {
    super.reset();
    this.equationExpandedProperty.reset();
    this.baseVectorsExpandedProperty.reset();
    this.baseVectorsVisibleProperty.reset();
  }
}
vectorAddition.register('EquationsViewProperties', EquationsViewProperties);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJWZWN0b3JBZGRpdGlvblZpZXdQcm9wZXJ0aWVzIiwidmVjdG9yQWRkaXRpb24iLCJFcXVhdGlvbnNWaWV3UHJvcGVydGllcyIsImNvbnN0cnVjdG9yIiwiZXF1YXRpb25FeHBhbmRlZFByb3BlcnR5IiwiYmFzZVZlY3RvcnNFeHBhbmRlZFByb3BlcnR5IiwiYmFzZVZlY3RvcnNWaXNpYmxlUHJvcGVydHkiLCJyZXNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRXF1YXRpb25zVmlld1Byb3BlcnRpZXMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVmlldy1zcGVjaWZpYyBQcm9wZXJ0aWVzIGZvciB0aGUgJ0VxdWF0aW9ucycgc2NyZWVuLiBFeHBhbmRzIG9uIHRoZSBiYXNlIHZpZXcgUHJvcGVydGllcywgYW5kIGFkZHMgUHJvcGVydGllc1xyXG4gKiB0aGF0IGFyZSB1bmlxdWUgdG8gdGhpcyBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBWZWN0b3JBZGRpdGlvblZpZXdQcm9wZXJ0aWVzIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1ZlY3RvckFkZGl0aW9uVmlld1Byb3BlcnRpZXMuanMnO1xyXG5pbXBvcnQgdmVjdG9yQWRkaXRpb24gZnJvbSAnLi4vLi4vdmVjdG9yQWRkaXRpb24uanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXF1YXRpb25zVmlld1Byb3BlcnRpZXMgZXh0ZW5kcyBWZWN0b3JBZGRpdGlvblZpZXdQcm9wZXJ0aWVzIHtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgd2hldGhlciB0aGUgRXF1YXRpb25Ub2dnbGVCb3ggaXMgZXhwYW5kZWRcclxuICAgIHRoaXMuZXF1YXRpb25FeHBhbmRlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgd2hldGhlciB0aGUgQmFzZVZlY3RvcnNBY2NvcmRpb25Cb3ggaXMgZXhwYW5kZWRcclxuICAgIHRoaXMuYmFzZVZlY3RvcnNFeHBhbmRlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHdoZXRoZXIgYmFzZSB2ZWN0b3JzIGFyZSB2aXNpYmxlIG9uIHRoZSBncmFwaFxyXG4gICAgdGhpcy5iYXNlVmVjdG9yc1Zpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICBzdXBlci5yZXNldCgpO1xyXG4gICAgdGhpcy5lcXVhdGlvbkV4cGFuZGVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuYmFzZVZlY3RvcnNFeHBhbmRlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmJhc2VWZWN0b3JzVmlzaWJsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG59XHJcblxyXG52ZWN0b3JBZGRpdGlvbi5yZWdpc3RlciggJ0VxdWF0aW9uc1ZpZXdQcm9wZXJ0aWVzJywgRXF1YXRpb25zVmlld1Byb3BlcnRpZXMgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLDRCQUE0QixNQUFNLG1EQUFtRDtBQUM1RixPQUFPQyxjQUFjLE1BQU0seUJBQXlCO0FBRXBELGVBQWUsTUFBTUMsdUJBQXVCLFNBQVNGLDRCQUE0QixDQUFDO0VBRWhGRyxXQUFXQSxDQUFBLEVBQUc7SUFDWixLQUFLLENBQUMsQ0FBQzs7SUFFUDtJQUNBLElBQUksQ0FBQ0Msd0JBQXdCLEdBQUcsSUFBSUwsZUFBZSxDQUFFLElBQUssQ0FBQzs7SUFFM0Q7SUFDQSxJQUFJLENBQUNNLDJCQUEyQixHQUFHLElBQUlOLGVBQWUsQ0FBRSxLQUFNLENBQUM7O0lBRS9EO0lBQ0EsSUFBSSxDQUFDTywwQkFBMEIsR0FBRyxJQUFJUCxlQUFlLENBQUUsS0FBTSxDQUFDO0VBQ2hFOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VRLEtBQUtBLENBQUEsRUFBRztJQUNOLEtBQUssQ0FBQ0EsS0FBSyxDQUFDLENBQUM7SUFDYixJQUFJLENBQUNILHdCQUF3QixDQUFDRyxLQUFLLENBQUMsQ0FBQztJQUNyQyxJQUFJLENBQUNGLDJCQUEyQixDQUFDRSxLQUFLLENBQUMsQ0FBQztJQUN4QyxJQUFJLENBQUNELDBCQUEwQixDQUFDQyxLQUFLLENBQUMsQ0FBQztFQUN6QztBQUNGO0FBRUFOLGNBQWMsQ0FBQ08sUUFBUSxDQUFFLHlCQUF5QixFQUFFTix1QkFBd0IsQ0FBQyJ9