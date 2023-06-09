// Copyright 2018-2022, University of Colorado Boulder

/**
 * The ScreenView for the "Measure" Screen.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import { Node } from '../../../../scenery/js/imports.js';
import EnergySkateParkTrackSetScreenView from '../../common/view/EnergySkateParkTrackSetScreenView.js';
import energySkatePark from '../../energySkatePark.js';
import InspectedSampleHaloNode from './InspectedSampleHaloNode.js';
import SkaterPathSensorNode from './SkaterPathSensorNode.js';
class MeasureScreenView extends EnergySkateParkTrackSetScreenView {
  /**
   * @param {MeasureModel} model
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    // parent layer for ComboBox, would use this but it is not available until after super
    const comboBoxParent = new Node();
    super(model, tandem, {
      showBarGraph: false,
      showSkaterPath: true,
      controlPanelOptions: {
        visibilityControlsOptions: {
          showStickToTrackCheckbox: true
        },
        gravityControlsOptions: {
          includeGravityComboBox: true
        }
      }
    });
    this.addChild(comboBoxParent);
    const inspectedSampleHaloNode = new InspectedSampleHaloNode(model.dataSamples, this.modelViewTransform);
    this.topLayer.addChild(inspectedSampleHaloNode);

    // @private - for layout
    this.pathSensor = new SkaterPathSensorNode(model.dataSamples, model.sensorProbePositionProperty, model.sensorBodyPositionProperty, model.availableModelBoundsProperty, this.modelViewTransform, this.controlPanel, {
      tandem: tandem.createTandem('pathSensor')
    });
    this.topLayer.addChild(this.pathSensor);
  }

  /**
   * Custom floating layout for this screen, dependent on available view bounds.
   * @public
   *
   * @param {Bounds2} viewBounds
   * @override
   */
  layout(viewBounds) {
    super.layout(viewBounds);

    // in the measure screen the legend is in the top left of the screen
    this.pieChartLegend.mutate({
      top: this.controlPanel.top,
      left: this.fixedLeft
    });

    // position the body relative to the pie chart legend, this sets the origin of the body (top left)
    this.model.sensorBodyPositionProperty.set(this.modelViewTransform.viewToModelXY(this.fixedLeft, this.pieChartLegend.bottom + 10));
  }
}
energySkatePark.register('MeasureScreenView', MeasureScreenView);
export default MeasureScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOb2RlIiwiRW5lcmd5U2thdGVQYXJrVHJhY2tTZXRTY3JlZW5WaWV3IiwiZW5lcmd5U2thdGVQYXJrIiwiSW5zcGVjdGVkU2FtcGxlSGFsb05vZGUiLCJTa2F0ZXJQYXRoU2Vuc29yTm9kZSIsIk1lYXN1cmVTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInRhbmRlbSIsImNvbWJvQm94UGFyZW50Iiwic2hvd0JhckdyYXBoIiwic2hvd1NrYXRlclBhdGgiLCJjb250cm9sUGFuZWxPcHRpb25zIiwidmlzaWJpbGl0eUNvbnRyb2xzT3B0aW9ucyIsInNob3dTdGlja1RvVHJhY2tDaGVja2JveCIsImdyYXZpdHlDb250cm9sc09wdGlvbnMiLCJpbmNsdWRlR3Jhdml0eUNvbWJvQm94IiwiYWRkQ2hpbGQiLCJpbnNwZWN0ZWRTYW1wbGVIYWxvTm9kZSIsImRhdGFTYW1wbGVzIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwidG9wTGF5ZXIiLCJwYXRoU2Vuc29yIiwic2Vuc29yUHJvYmVQb3NpdGlvblByb3BlcnR5Iiwic2Vuc29yQm9keVBvc2l0aW9uUHJvcGVydHkiLCJhdmFpbGFibGVNb2RlbEJvdW5kc1Byb3BlcnR5IiwiY29udHJvbFBhbmVsIiwiY3JlYXRlVGFuZGVtIiwibGF5b3V0Iiwidmlld0JvdW5kcyIsInBpZUNoYXJ0TGVnZW5kIiwibXV0YXRlIiwidG9wIiwibGVmdCIsImZpeGVkTGVmdCIsInNldCIsInZpZXdUb01vZGVsWFkiLCJib3R0b20iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1lYXN1cmVTY3JlZW5WaWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZSBTY3JlZW5WaWV3IGZvciB0aGUgXCJNZWFzdXJlXCIgU2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEVuZXJneVNrYXRlUGFya1RyYWNrU2V0U2NyZWVuVmlldyBmcm9tICcuLi8uLi9jb21tb24vdmlldy9FbmVyZ3lTa2F0ZVBhcmtUcmFja1NldFNjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgZW5lcmd5U2thdGVQYXJrIGZyb20gJy4uLy4uL2VuZXJneVNrYXRlUGFyay5qcyc7XHJcbmltcG9ydCBJbnNwZWN0ZWRTYW1wbGVIYWxvTm9kZSBmcm9tICcuL0luc3BlY3RlZFNhbXBsZUhhbG9Ob2RlLmpzJztcclxuaW1wb3J0IFNrYXRlclBhdGhTZW5zb3JOb2RlIGZyb20gJy4vU2thdGVyUGF0aFNlbnNvck5vZGUuanMnO1xyXG5cclxuY2xhc3MgTWVhc3VyZVNjcmVlblZpZXcgZXh0ZW5kcyBFbmVyZ3lTa2F0ZVBhcmtUcmFja1NldFNjcmVlblZpZXcge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge01lYXN1cmVNb2RlbH0gbW9kZWxcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCB0YW5kZW0gKSB7XHJcblxyXG4gICAgLy8gcGFyZW50IGxheWVyIGZvciBDb21ib0JveCwgd291bGQgdXNlIHRoaXMgYnV0IGl0IGlzIG5vdCBhdmFpbGFibGUgdW50aWwgYWZ0ZXIgc3VwZXJcclxuICAgIGNvbnN0IGNvbWJvQm94UGFyZW50ID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgICBzdXBlciggbW9kZWwsIHRhbmRlbSwge1xyXG4gICAgICBzaG93QmFyR3JhcGg6IGZhbHNlLFxyXG4gICAgICBzaG93U2thdGVyUGF0aDogdHJ1ZSxcclxuICAgICAgY29udHJvbFBhbmVsT3B0aW9uczoge1xyXG4gICAgICAgIHZpc2liaWxpdHlDb250cm9sc09wdGlvbnM6IHtcclxuICAgICAgICAgIHNob3dTdGlja1RvVHJhY2tDaGVja2JveDogdHJ1ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ3Jhdml0eUNvbnRyb2xzT3B0aW9uczoge1xyXG4gICAgICAgICAgaW5jbHVkZUdyYXZpdHlDb21ib0JveDogdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIGNvbWJvQm94UGFyZW50ICk7XHJcblxyXG4gICAgY29uc3QgaW5zcGVjdGVkU2FtcGxlSGFsb05vZGUgPSBuZXcgSW5zcGVjdGVkU2FtcGxlSGFsb05vZGUoIG1vZGVsLmRhdGFTYW1wbGVzLCB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSApO1xyXG4gICAgdGhpcy50b3BMYXllci5hZGRDaGlsZCggaW5zcGVjdGVkU2FtcGxlSGFsb05vZGUgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIGZvciBsYXlvdXRcclxuICAgIHRoaXMucGF0aFNlbnNvciA9IG5ldyBTa2F0ZXJQYXRoU2Vuc29yTm9kZSggbW9kZWwuZGF0YVNhbXBsZXMsIG1vZGVsLnNlbnNvclByb2JlUG9zaXRpb25Qcm9wZXJ0eSwgbW9kZWwuc2Vuc29yQm9keVBvc2l0aW9uUHJvcGVydHksIG1vZGVsLmF2YWlsYWJsZU1vZGVsQm91bmRzUHJvcGVydHksIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLCB0aGlzLmNvbnRyb2xQYW5lbCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwYXRoU2Vuc29yJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy50b3BMYXllci5hZGRDaGlsZCggdGhpcy5wYXRoU2Vuc29yICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDdXN0b20gZmxvYXRpbmcgbGF5b3V0IGZvciB0aGlzIHNjcmVlbiwgZGVwZW5kZW50IG9uIGF2YWlsYWJsZSB2aWV3IGJvdW5kcy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0JvdW5kczJ9IHZpZXdCb3VuZHNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBsYXlvdXQoIHZpZXdCb3VuZHMgKSB7XHJcbiAgICBzdXBlci5sYXlvdXQoIHZpZXdCb3VuZHMgKTtcclxuXHJcbiAgICAvLyBpbiB0aGUgbWVhc3VyZSBzY3JlZW4gdGhlIGxlZ2VuZCBpcyBpbiB0aGUgdG9wIGxlZnQgb2YgdGhlIHNjcmVlblxyXG4gICAgdGhpcy5waWVDaGFydExlZ2VuZC5tdXRhdGUoIHsgdG9wOiB0aGlzLmNvbnRyb2xQYW5lbC50b3AsIGxlZnQ6IHRoaXMuZml4ZWRMZWZ0IH0gKTtcclxuXHJcbiAgICAvLyBwb3NpdGlvbiB0aGUgYm9keSByZWxhdGl2ZSB0byB0aGUgcGllIGNoYXJ0IGxlZ2VuZCwgdGhpcyBzZXRzIHRoZSBvcmlnaW4gb2YgdGhlIGJvZHkgKHRvcCBsZWZ0KVxyXG4gICAgdGhpcy5tb2RlbC5zZW5zb3JCb2R5UG9zaXRpb25Qcm9wZXJ0eS5zZXQoIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLnZpZXdUb01vZGVsWFkoIHRoaXMuZml4ZWRMZWZ0LCB0aGlzLnBpZUNoYXJ0TGVnZW5kLmJvdHRvbSArIDEwICkgKTtcclxuICB9XHJcbn1cclxuXHJcbmVuZXJneVNrYXRlUGFyay5yZWdpc3RlciggJ01lYXN1cmVTY3JlZW5WaWV3JywgTWVhc3VyZVNjcmVlblZpZXcgKTtcclxuZXhwb3J0IGRlZmF1bHQgTWVhc3VyZVNjcmVlblZpZXc7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLElBQUksUUFBUSxtQ0FBbUM7QUFDeEQsT0FBT0MsaUNBQWlDLE1BQU0sd0RBQXdEO0FBQ3RHLE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFDdEQsT0FBT0MsdUJBQXVCLE1BQU0sOEJBQThCO0FBQ2xFLE9BQU9DLG9CQUFvQixNQUFNLDJCQUEyQjtBQUU1RCxNQUFNQyxpQkFBaUIsU0FBU0osaUNBQWlDLENBQUM7RUFFaEU7QUFDRjtBQUNBO0FBQ0E7RUFDRUssV0FBV0EsQ0FBRUMsS0FBSyxFQUFFQyxNQUFNLEVBQUc7SUFFM0I7SUFDQSxNQUFNQyxjQUFjLEdBQUcsSUFBSVQsSUFBSSxDQUFDLENBQUM7SUFFakMsS0FBSyxDQUFFTyxLQUFLLEVBQUVDLE1BQU0sRUFBRTtNQUNwQkUsWUFBWSxFQUFFLEtBQUs7TUFDbkJDLGNBQWMsRUFBRSxJQUFJO01BQ3BCQyxtQkFBbUIsRUFBRTtRQUNuQkMseUJBQXlCLEVBQUU7VUFDekJDLHdCQUF3QixFQUFFO1FBQzVCLENBQUM7UUFDREMsc0JBQXNCLEVBQUU7VUFDdEJDLHNCQUFzQixFQUFFO1FBQzFCO01BQ0Y7SUFDRixDQUFFLENBQUM7SUFFSCxJQUFJLENBQUNDLFFBQVEsQ0FBRVIsY0FBZSxDQUFDO0lBRS9CLE1BQU1TLHVCQUF1QixHQUFHLElBQUlmLHVCQUF1QixDQUFFSSxLQUFLLENBQUNZLFdBQVcsRUFBRSxJQUFJLENBQUNDLGtCQUFtQixDQUFDO0lBQ3pHLElBQUksQ0FBQ0MsUUFBUSxDQUFDSixRQUFRLENBQUVDLHVCQUF3QixDQUFDOztJQUVqRDtJQUNBLElBQUksQ0FBQ0ksVUFBVSxHQUFHLElBQUlsQixvQkFBb0IsQ0FBRUcsS0FBSyxDQUFDWSxXQUFXLEVBQUVaLEtBQUssQ0FBQ2dCLDJCQUEyQixFQUFFaEIsS0FBSyxDQUFDaUIsMEJBQTBCLEVBQUVqQixLQUFLLENBQUNrQiw0QkFBNEIsRUFBRSxJQUFJLENBQUNMLGtCQUFrQixFQUFFLElBQUksQ0FBQ00sWUFBWSxFQUFFO01BQ2xObEIsTUFBTSxFQUFFQSxNQUFNLENBQUNtQixZQUFZLENBQUUsWUFBYTtJQUM1QyxDQUFFLENBQUM7SUFFSCxJQUFJLENBQUNOLFFBQVEsQ0FBQ0osUUFBUSxDQUFFLElBQUksQ0FBQ0ssVUFBVyxDQUFDO0VBQzNDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VNLE1BQU1BLENBQUVDLFVBQVUsRUFBRztJQUNuQixLQUFLLENBQUNELE1BQU0sQ0FBRUMsVUFBVyxDQUFDOztJQUUxQjtJQUNBLElBQUksQ0FBQ0MsY0FBYyxDQUFDQyxNQUFNLENBQUU7TUFBRUMsR0FBRyxFQUFFLElBQUksQ0FBQ04sWUFBWSxDQUFDTSxHQUFHO01BQUVDLElBQUksRUFBRSxJQUFJLENBQUNDO0lBQVUsQ0FBRSxDQUFDOztJQUVsRjtJQUNBLElBQUksQ0FBQzNCLEtBQUssQ0FBQ2lCLDBCQUEwQixDQUFDVyxHQUFHLENBQUUsSUFBSSxDQUFDZixrQkFBa0IsQ0FBQ2dCLGFBQWEsQ0FBRSxJQUFJLENBQUNGLFNBQVMsRUFBRSxJQUFJLENBQUNKLGNBQWMsQ0FBQ08sTUFBTSxHQUFHLEVBQUcsQ0FBRSxDQUFDO0VBQ3ZJO0FBQ0Y7QUFFQW5DLGVBQWUsQ0FBQ29DLFFBQVEsQ0FBRSxtQkFBbUIsRUFBRWpDLGlCQUFrQixDQUFDO0FBQ2xFLGVBQWVBLGlCQUFpQiJ9