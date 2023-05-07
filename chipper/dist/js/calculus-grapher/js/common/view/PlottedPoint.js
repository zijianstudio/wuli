// Copyright 2022-2023, University of Colorado Boulder

/**
 * PlottedPoint is a representation of a point located at (x,y) in model Coordinates.
 * A chartTransform is used to convert from model position to view.
 * It is responsible for updating its position
 *
 * @author Martin Veillette
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import { Circle } from '../../../../scenery/js/imports.js';
import calculusGrapher from '../../calculusGrapher.js';
export default class PlottedPoint extends Circle {
  constructor(curvePointProperty, chartTransform, providedOptions) {
    const options = optionize()({
      // CircleOptions
      stroke: null,
      fill: 'black',
      radius: 4,
      pickable: false // optimization, see https://github.com/phetsims/calculus-grapher/issues/210
    }, providedOptions);
    super(options);
    const updatePosition = () => {
      const x = curvePointProperty.value.x;
      const y = curvePointProperty.value.y;
      this.center = chartTransform.modelToViewXY(x, y);
    };
    curvePointProperty.link(updatePosition);
    chartTransform.changedEmitter.addListener(updatePosition);
  }
}
calculusGrapher.register('PlottedPoint', PlottedPoint);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJDaXJjbGUiLCJjYWxjdWx1c0dyYXBoZXIiLCJQbG90dGVkUG9pbnQiLCJjb25zdHJ1Y3RvciIsImN1cnZlUG9pbnRQcm9wZXJ0eSIsImNoYXJ0VHJhbnNmb3JtIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInN0cm9rZSIsImZpbGwiLCJyYWRpdXMiLCJwaWNrYWJsZSIsInVwZGF0ZVBvc2l0aW9uIiwieCIsInZhbHVlIiwieSIsImNlbnRlciIsIm1vZGVsVG9WaWV3WFkiLCJsaW5rIiwiY2hhbmdlZEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGxvdHRlZFBvaW50LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFBsb3R0ZWRQb2ludCBpcyBhIHJlcHJlc2VudGF0aW9uIG9mIGEgcG9pbnQgbG9jYXRlZCBhdCAoeCx5KSBpbiBtb2RlbCBDb29yZGluYXRlcy5cclxuICogQSBjaGFydFRyYW5zZm9ybSBpcyB1c2VkIHRvIGNvbnZlcnQgZnJvbSBtb2RlbCBwb3NpdGlvbiB0byB2aWV3LlxyXG4gKiBJdCBpcyByZXNwb25zaWJsZSBmb3IgdXBkYXRpbmcgaXRzIHBvc2l0aW9uXHJcbiAqXHJcbiAqIEBhdXRob3IgTWFydGluIFZlaWxsZXR0ZVxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IENoYXJ0VHJhbnNmb3JtIGZyb20gJy4uLy4uLy4uLy4uL2JhbWJvby9qcy9DaGFydFRyYW5zZm9ybS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja09wdGlvbmFsIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrT3B0aW9uYWwuanMnO1xyXG5pbXBvcnQgeyBDaXJjbGUsIENpcmNsZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgY2FsY3VsdXNHcmFwaGVyIGZyb20gJy4uLy4uL2NhbGN1bHVzR3JhcGhlci5qcyc7XHJcbmltcG9ydCBDdXJ2ZVBvaW50IGZyb20gJy4uL21vZGVsL0N1cnZlUG9pbnQuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG5leHBvcnQgdHlwZSBQbG90dGVkUG9pbnRPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrT3B0aW9uYWw8Q2lyY2xlT3B0aW9ucywgJ2ZpbGwnIHwgJ3Zpc2libGVQcm9wZXJ0eScgfCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbG90dGVkUG9pbnQgZXh0ZW5kcyBDaXJjbGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGN1cnZlUG9pbnRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Q3VydmVQb2ludD4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBjaGFydFRyYW5zZm9ybTogQ2hhcnRUcmFuc2Zvcm0sXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM6IFBsb3R0ZWRQb2ludE9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxQbG90dGVkUG9pbnRPcHRpb25zLCBTZWxmT3B0aW9ucywgQ2lyY2xlT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gQ2lyY2xlT3B0aW9uc1xyXG4gICAgICBzdHJva2U6IG51bGwsXHJcbiAgICAgIGZpbGw6ICdibGFjaycsXHJcbiAgICAgIHJhZGl1czogNCxcclxuICAgICAgcGlja2FibGU6IGZhbHNlIC8vIG9wdGltaXphdGlvbiwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jYWxjdWx1cy1ncmFwaGVyL2lzc3Vlcy8yMTBcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgdXBkYXRlUG9zaXRpb24gPSAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHggPSBjdXJ2ZVBvaW50UHJvcGVydHkudmFsdWUueDtcclxuICAgICAgY29uc3QgeSA9IGN1cnZlUG9pbnRQcm9wZXJ0eS52YWx1ZS55O1xyXG4gICAgICB0aGlzLmNlbnRlciA9IGNoYXJ0VHJhbnNmb3JtLm1vZGVsVG9WaWV3WFkoIHgsIHkgKTtcclxuICAgIH07XHJcbiAgICBjdXJ2ZVBvaW50UHJvcGVydHkubGluayggdXBkYXRlUG9zaXRpb24gKTtcclxuICAgIGNoYXJ0VHJhbnNmb3JtLmNoYW5nZWRFbWl0dGVyLmFkZExpc3RlbmVyKCB1cGRhdGVQb3NpdGlvbiApO1xyXG4gIH1cclxufVxyXG5jYWxjdWx1c0dyYXBoZXIucmVnaXN0ZXIoICdQbG90dGVkUG9pbnQnLCBQbG90dGVkUG9pbnQgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUlBLE9BQU9BLFNBQVMsTUFBNEIsdUNBQXVDO0FBRW5GLFNBQVNDLE1BQU0sUUFBdUIsbUNBQW1DO0FBQ3pFLE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFPdEQsZUFBZSxNQUFNQyxZQUFZLFNBQVNGLE1BQU0sQ0FBQztFQUV4Q0csV0FBV0EsQ0FBRUMsa0JBQWlELEVBQ2pEQyxjQUE4QixFQUM5QkMsZUFBb0MsRUFBRztJQUV6RCxNQUFNQyxPQUFPLEdBQUdSLFNBQVMsQ0FBa0QsQ0FBQyxDQUFFO01BRTVFO01BQ0FTLE1BQU0sRUFBRSxJQUFJO01BQ1pDLElBQUksRUFBRSxPQUFPO01BQ2JDLE1BQU0sRUFBRSxDQUFDO01BQ1RDLFFBQVEsRUFBRSxLQUFLLENBQUM7SUFDbEIsQ0FBQyxFQUFFTCxlQUFnQixDQUFDO0lBRXBCLEtBQUssQ0FBRUMsT0FBUSxDQUFDO0lBRWhCLE1BQU1LLGNBQWMsR0FBR0EsQ0FBQSxLQUFNO01BQzNCLE1BQU1DLENBQUMsR0FBR1Qsa0JBQWtCLENBQUNVLEtBQUssQ0FBQ0QsQ0FBQztNQUNwQyxNQUFNRSxDQUFDLEdBQUdYLGtCQUFrQixDQUFDVSxLQUFLLENBQUNDLENBQUM7TUFDcEMsSUFBSSxDQUFDQyxNQUFNLEdBQUdYLGNBQWMsQ0FBQ1ksYUFBYSxDQUFFSixDQUFDLEVBQUVFLENBQUUsQ0FBQztJQUNwRCxDQUFDO0lBQ0RYLGtCQUFrQixDQUFDYyxJQUFJLENBQUVOLGNBQWUsQ0FBQztJQUN6Q1AsY0FBYyxDQUFDYyxjQUFjLENBQUNDLFdBQVcsQ0FBRVIsY0FBZSxDQUFDO0VBQzdEO0FBQ0Y7QUFDQVgsZUFBZSxDQUFDb0IsUUFBUSxDQUFFLGNBQWMsRUFBRW5CLFlBQWEsQ0FBQyJ9