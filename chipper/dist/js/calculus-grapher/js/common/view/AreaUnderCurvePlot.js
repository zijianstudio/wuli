// Copyright 2022-2023, University of Colorado Boulder

/**
 * AreaUnderCurvePlot creates two AreaPlots, for positive area and negative area under a curve.
 *
 * @author Martin Veillette
 */

import optionize from '../../../../phet-core/js/optionize.js';
import { Node } from '../../../../scenery/js/imports.js';
import calculusGrapher from '../../calculusGrapher.js';
import AreaPlot from '../../../../bamboo/js/AreaPlot.js';

// A function that will be used for filtering points from a dataSet

export default class AreaUnderCurvePlot extends Node {
  /**
   * @param areaUnderCurveScrubber
   * @param curve - the curve model to which the area plots are added
   * @param chartTransform
   * @param xProperty - the Property that limits the horizontal extent of the area plot
   * @param providedOptions
   */
  constructor(areaUnderCurveScrubber, curve, chartTransform, xProperty, providedOptions) {
    const options = optionize()({
      // NodeOptions
      pickable: false // optimization, see https://github.com/phetsims/calculus-grapher/issues/210
    }, providedOptions);

    // A curvePoint function to determine if the y-value of a curvePoint is positive
    const isPositiveFunction = point => point.y > 0;

    // A curvePoint function to determine if the y-value of a curvePoint is negative
    const isNegativeFunction = point => point.y < 0;

    // Function that returns a dataSet, filtered by a curvePointFunction
    // All curve points that have an x-value greater than xProperty are filtered out
    const getDataSet = pointFunction => {
      return curve.points.map(point => {
        if (pointFunction(point) && point.x <= xProperty.value) {
          return point.getVector();
        } else {
          return null;
        }
      });
    };

    // AreaPlot for the points with positive y values
    const positiveAreaPlot = new AreaPlot(chartTransform, getDataSet(isPositiveFunction), {
      fill: areaUnderCurveScrubber.positiveFillProperty
    });

    // AreaPlot for the points with negative y values
    const negativeAreaPlot = new AreaPlot(chartTransform, getDataSet(isNegativeFunction), {
      fill: areaUnderCurveScrubber.negativeFillProperty
    });
    options.children = [positiveAreaPlot, negativeAreaPlot];
    super(options);

    // Update the plot if its visible
    const updateDataSets = () => {
      if (this.visible) {
        positiveAreaPlot.setDataSet(getDataSet(isPositiveFunction));
        negativeAreaPlot.setDataSet(getDataSet(isNegativeFunction));
      }
    };
    curve.curveChangedEmitter.addListener(updateDataSets);
    xProperty.link(updateDataSets);

    // Update when this plot becomes visible
    this.visibleProperty.link(visible => {
      visible && updateDataSets();
    });
    this.addLinkedElement(areaUnderCurveScrubber, {
      tandem: options.tandem.createTandem(areaUnderCurveScrubber.tandem.name)
    });
  }
}
calculusGrapher.register('AreaUnderCurvePlot', AreaUnderCurvePlot);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJOb2RlIiwiY2FsY3VsdXNHcmFwaGVyIiwiQXJlYVBsb3QiLCJBcmVhVW5kZXJDdXJ2ZVBsb3QiLCJjb25zdHJ1Y3RvciIsImFyZWFVbmRlckN1cnZlU2NydWJiZXIiLCJjdXJ2ZSIsImNoYXJ0VHJhbnNmb3JtIiwieFByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInBpY2thYmxlIiwiaXNQb3NpdGl2ZUZ1bmN0aW9uIiwicG9pbnQiLCJ5IiwiaXNOZWdhdGl2ZUZ1bmN0aW9uIiwiZ2V0RGF0YVNldCIsInBvaW50RnVuY3Rpb24iLCJwb2ludHMiLCJtYXAiLCJ4IiwidmFsdWUiLCJnZXRWZWN0b3IiLCJwb3NpdGl2ZUFyZWFQbG90IiwiZmlsbCIsInBvc2l0aXZlRmlsbFByb3BlcnR5IiwibmVnYXRpdmVBcmVhUGxvdCIsIm5lZ2F0aXZlRmlsbFByb3BlcnR5IiwiY2hpbGRyZW4iLCJ1cGRhdGVEYXRhU2V0cyIsInZpc2libGUiLCJzZXREYXRhU2V0IiwiY3VydmVDaGFuZ2VkRW1pdHRlciIsImFkZExpc3RlbmVyIiwibGluayIsInZpc2libGVQcm9wZXJ0eSIsImFkZExpbmtlZEVsZW1lbnQiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJuYW1lIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJBcmVhVW5kZXJDdXJ2ZVBsb3QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQXJlYVVuZGVyQ3VydmVQbG90IGNyZWF0ZXMgdHdvIEFyZWFQbG90cywgZm9yIHBvc2l0aXZlIGFyZWEgYW5kIG5lZ2F0aXZlIGFyZWEgdW5kZXIgYSBjdXJ2ZS5cclxuICpcclxuICogQGF1dGhvciBNYXJ0aW4gVmVpbGxldHRlXHJcbiAqL1xyXG5cclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IHsgTm9kZSwgTm9kZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgY2FsY3VsdXNHcmFwaGVyIGZyb20gJy4uLy4uL2NhbGN1bHVzR3JhcGhlci5qcyc7XHJcbmltcG9ydCBDdXJ2ZSBmcm9tICcuLi9tb2RlbC9DdXJ2ZS5qcyc7XHJcbmltcG9ydCBBcmVhUGxvdCBmcm9tICcuLi8uLi8uLi8uLi9iYW1ib28vanMvQXJlYVBsb3QuanMnO1xyXG5pbXBvcnQgQ3VydmVQb2ludCBmcm9tICcuLi9tb2RlbC9DdXJ2ZVBvaW50LmpzJztcclxuaW1wb3J0IENoYXJ0VHJhbnNmb3JtIGZyb20gJy4uLy4uLy4uLy4uL2JhbWJvby9qcy9DaGFydFRyYW5zZm9ybS5qcyc7XHJcbmltcG9ydCBBcmVhVW5kZXJDdXJ2ZVNjcnViYmVyIGZyb20gJy4uL21vZGVsL0FyZWFVbmRlckN1cnZlU2NydWJiZXIuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG5leHBvcnQgdHlwZSBBcmVhVW5kZXJDdXJ2ZVBsb3RPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8Tm9kZU9wdGlvbnMsICd0YW5kZW0nIHwgJ3Zpc2libGVQcm9wZXJ0eSc+O1xyXG5cclxuLy8gQSBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgdXNlZCBmb3IgZmlsdGVyaW5nIHBvaW50cyBmcm9tIGEgZGF0YVNldFxyXG50eXBlIEN1cnZlUG9pbnRGdW5jdGlvbiA9ICggcG9pbnQ6IEN1cnZlUG9pbnQgKSA9PiBib29sZWFuO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXJlYVVuZGVyQ3VydmVQbG90IGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBhcmVhVW5kZXJDdXJ2ZVNjcnViYmVyXHJcbiAgICogQHBhcmFtIGN1cnZlIC0gdGhlIGN1cnZlIG1vZGVsIHRvIHdoaWNoIHRoZSBhcmVhIHBsb3RzIGFyZSBhZGRlZFxyXG4gICAqIEBwYXJhbSBjaGFydFRyYW5zZm9ybVxyXG4gICAqIEBwYXJhbSB4UHJvcGVydHkgLSB0aGUgUHJvcGVydHkgdGhhdCBsaW1pdHMgdGhlIGhvcml6b250YWwgZXh0ZW50IG9mIHRoZSBhcmVhIHBsb3RcclxuICAgKiBAcGFyYW0gcHJvdmlkZWRPcHRpb25zXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBhcmVhVW5kZXJDdXJ2ZVNjcnViYmVyOiBBcmVhVW5kZXJDdXJ2ZVNjcnViYmVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgY3VydmU6IEN1cnZlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgY2hhcnRUcmFuc2Zvcm06IENoYXJ0VHJhbnNmb3JtLFxyXG4gICAgICAgICAgICAgICAgICAgICAgeFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zOiBBcmVhVW5kZXJDdXJ2ZVBsb3RPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8QXJlYVVuZGVyQ3VydmVQbG90T3B0aW9ucywgU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBOb2RlT3B0aW9uc1xyXG4gICAgICBwaWNrYWJsZTogZmFsc2UgLy8gb3B0aW1pemF0aW9uLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NhbGN1bHVzLWdyYXBoZXIvaXNzdWVzLzIxMFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgLy8gQSBjdXJ2ZVBvaW50IGZ1bmN0aW9uIHRvIGRldGVybWluZSBpZiB0aGUgeS12YWx1ZSBvZiBhIGN1cnZlUG9pbnQgaXMgcG9zaXRpdmVcclxuICAgIGNvbnN0IGlzUG9zaXRpdmVGdW5jdGlvbjogQ3VydmVQb2ludEZ1bmN0aW9uID0gcG9pbnQgPT4gcG9pbnQueSA+IDA7XHJcblxyXG4gICAgLy8gQSBjdXJ2ZVBvaW50IGZ1bmN0aW9uIHRvIGRldGVybWluZSBpZiB0aGUgeS12YWx1ZSBvZiBhIGN1cnZlUG9pbnQgaXMgbmVnYXRpdmVcclxuICAgIGNvbnN0IGlzTmVnYXRpdmVGdW5jdGlvbjogQ3VydmVQb2ludEZ1bmN0aW9uID0gcG9pbnQgPT4gcG9pbnQueSA8IDA7XHJcblxyXG4gICAgLy8gRnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgZGF0YVNldCwgZmlsdGVyZWQgYnkgYSBjdXJ2ZVBvaW50RnVuY3Rpb25cclxuICAgIC8vIEFsbCBjdXJ2ZSBwb2ludHMgdGhhdCBoYXZlIGFuIHgtdmFsdWUgZ3JlYXRlciB0aGFuIHhQcm9wZXJ0eSBhcmUgZmlsdGVyZWQgb3V0XHJcbiAgICBjb25zdCBnZXREYXRhU2V0ID0gKCBwb2ludEZ1bmN0aW9uOiBDdXJ2ZVBvaW50RnVuY3Rpb24gKSA9PiB7XHJcbiAgICAgIHJldHVybiBjdXJ2ZS5wb2ludHMubWFwKCBwb2ludCA9PiB7XHJcbiAgICAgICAgaWYgKCBwb2ludEZ1bmN0aW9uKCBwb2ludCApICYmIHBvaW50LnggPD0geFByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgICAgcmV0dXJuIHBvaW50LmdldFZlY3RvcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBBcmVhUGxvdCBmb3IgdGhlIHBvaW50cyB3aXRoIHBvc2l0aXZlIHkgdmFsdWVzXHJcbiAgICBjb25zdCBwb3NpdGl2ZUFyZWFQbG90ID0gbmV3IEFyZWFQbG90KCBjaGFydFRyYW5zZm9ybSwgZ2V0RGF0YVNldCggaXNQb3NpdGl2ZUZ1bmN0aW9uICksIHtcclxuICAgICAgZmlsbDogYXJlYVVuZGVyQ3VydmVTY3J1YmJlci5wb3NpdGl2ZUZpbGxQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEFyZWFQbG90IGZvciB0aGUgcG9pbnRzIHdpdGggbmVnYXRpdmUgeSB2YWx1ZXNcclxuICAgIGNvbnN0IG5lZ2F0aXZlQXJlYVBsb3QgPSBuZXcgQXJlYVBsb3QoIGNoYXJ0VHJhbnNmb3JtLCBnZXREYXRhU2V0KCBpc05lZ2F0aXZlRnVuY3Rpb24gKSwge1xyXG4gICAgICBmaWxsOiBhcmVhVW5kZXJDdXJ2ZVNjcnViYmVyLm5lZ2F0aXZlRmlsbFByb3BlcnR5XHJcbiAgICB9ICk7XHJcblxyXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgcG9zaXRpdmVBcmVhUGxvdCwgbmVnYXRpdmVBcmVhUGxvdCBdO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBwbG90IGlmIGl0cyB2aXNpYmxlXHJcbiAgICBjb25zdCB1cGRhdGVEYXRhU2V0cyA9ICgpID0+IHtcclxuICAgICAgaWYgKCB0aGlzLnZpc2libGUgKSB7XHJcbiAgICAgICAgcG9zaXRpdmVBcmVhUGxvdC5zZXREYXRhU2V0KCBnZXREYXRhU2V0KCBpc1Bvc2l0aXZlRnVuY3Rpb24gKSApO1xyXG4gICAgICAgIG5lZ2F0aXZlQXJlYVBsb3Quc2V0RGF0YVNldCggZ2V0RGF0YVNldCggaXNOZWdhdGl2ZUZ1bmN0aW9uICkgKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIGN1cnZlLmN1cnZlQ2hhbmdlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHVwZGF0ZURhdGFTZXRzICk7XHJcbiAgICB4UHJvcGVydHkubGluayggdXBkYXRlRGF0YVNldHMgKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgd2hlbiB0aGlzIHBsb3QgYmVjb21lcyB2aXNpYmxlXHJcbiAgICB0aGlzLnZpc2libGVQcm9wZXJ0eS5saW5rKCB2aXNpYmxlID0+IHtcclxuICAgICAgdmlzaWJsZSAmJiB1cGRhdGVEYXRhU2V0cygpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYWRkTGlua2VkRWxlbWVudCggYXJlYVVuZGVyQ3VydmVTY3J1YmJlciwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggYXJlYVVuZGVyQ3VydmVTY3J1YmJlci50YW5kZW0ubmFtZSApXHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5jYWxjdWx1c0dyYXBoZXIucmVnaXN0ZXIoICdBcmVhVW5kZXJDdXJ2ZVBsb3QnLCBBcmVhVW5kZXJDdXJ2ZVBsb3QgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLFNBQVMsTUFBNEIsdUNBQXVDO0FBQ25GLFNBQVNDLElBQUksUUFBcUIsbUNBQW1DO0FBQ3JFLE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFFdEQsT0FBT0MsUUFBUSxNQUFNLG1DQUFtQzs7QUFVeEQ7O0FBR0EsZUFBZSxNQUFNQyxrQkFBa0IsU0FBU0gsSUFBSSxDQUFDO0VBRW5EO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1NJLFdBQVdBLENBQUVDLHNCQUE4QyxFQUM5Q0MsS0FBWSxFQUNaQyxjQUE4QixFQUM5QkMsU0FBb0MsRUFDcENDLGVBQTBDLEVBQUc7SUFFL0QsTUFBTUMsT0FBTyxHQUFHWCxTQUFTLENBQXNELENBQUMsQ0FBRTtNQUVoRjtNQUNBWSxRQUFRLEVBQUUsS0FBSyxDQUFDO0lBQ2xCLENBQUMsRUFBRUYsZUFBZ0IsQ0FBQzs7SUFFcEI7SUFDQSxNQUFNRyxrQkFBc0MsR0FBR0MsS0FBSyxJQUFJQSxLQUFLLENBQUNDLENBQUMsR0FBRyxDQUFDOztJQUVuRTtJQUNBLE1BQU1DLGtCQUFzQyxHQUFHRixLQUFLLElBQUlBLEtBQUssQ0FBQ0MsQ0FBQyxHQUFHLENBQUM7O0lBRW5FO0lBQ0E7SUFDQSxNQUFNRSxVQUFVLEdBQUtDLGFBQWlDLElBQU07TUFDMUQsT0FBT1gsS0FBSyxDQUFDWSxNQUFNLENBQUNDLEdBQUcsQ0FBRU4sS0FBSyxJQUFJO1FBQ2hDLElBQUtJLGFBQWEsQ0FBRUosS0FBTSxDQUFDLElBQUlBLEtBQUssQ0FBQ08sQ0FBQyxJQUFJWixTQUFTLENBQUNhLEtBQUssRUFBRztVQUMxRCxPQUFPUixLQUFLLENBQUNTLFNBQVMsQ0FBQyxDQUFDO1FBQzFCLENBQUMsTUFDSTtVQUNILE9BQU8sSUFBSTtRQUNiO01BQ0YsQ0FBRSxDQUFDO0lBQ0wsQ0FBQzs7SUFFRDtJQUNBLE1BQU1DLGdCQUFnQixHQUFHLElBQUlyQixRQUFRLENBQUVLLGNBQWMsRUFBRVMsVUFBVSxDQUFFSixrQkFBbUIsQ0FBQyxFQUFFO01BQ3ZGWSxJQUFJLEVBQUVuQixzQkFBc0IsQ0FBQ29CO0lBQy9CLENBQUUsQ0FBQzs7SUFFSDtJQUNBLE1BQU1DLGdCQUFnQixHQUFHLElBQUl4QixRQUFRLENBQUVLLGNBQWMsRUFBRVMsVUFBVSxDQUFFRCxrQkFBbUIsQ0FBQyxFQUFFO01BQ3ZGUyxJQUFJLEVBQUVuQixzQkFBc0IsQ0FBQ3NCO0lBQy9CLENBQUUsQ0FBQztJQUVIakIsT0FBTyxDQUFDa0IsUUFBUSxHQUFHLENBQUVMLGdCQUFnQixFQUFFRyxnQkFBZ0IsQ0FBRTtJQUV6RCxLQUFLLENBQUVoQixPQUFRLENBQUM7O0lBRWhCO0lBQ0EsTUFBTW1CLGNBQWMsR0FBR0EsQ0FBQSxLQUFNO01BQzNCLElBQUssSUFBSSxDQUFDQyxPQUFPLEVBQUc7UUFDbEJQLGdCQUFnQixDQUFDUSxVQUFVLENBQUVmLFVBQVUsQ0FBRUosa0JBQW1CLENBQUUsQ0FBQztRQUMvRGMsZ0JBQWdCLENBQUNLLFVBQVUsQ0FBRWYsVUFBVSxDQUFFRCxrQkFBbUIsQ0FBRSxDQUFDO01BQ2pFO0lBQ0YsQ0FBQztJQUNEVCxLQUFLLENBQUMwQixtQkFBbUIsQ0FBQ0MsV0FBVyxDQUFFSixjQUFlLENBQUM7SUFDdkRyQixTQUFTLENBQUMwQixJQUFJLENBQUVMLGNBQWUsQ0FBQzs7SUFFaEM7SUFDQSxJQUFJLENBQUNNLGVBQWUsQ0FBQ0QsSUFBSSxDQUFFSixPQUFPLElBQUk7TUFDcENBLE9BQU8sSUFBSUQsY0FBYyxDQUFDLENBQUM7SUFDN0IsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDTyxnQkFBZ0IsQ0FBRS9CLHNCQUFzQixFQUFFO01BQzdDZ0MsTUFBTSxFQUFFM0IsT0FBTyxDQUFDMkIsTUFBTSxDQUFDQyxZQUFZLENBQUVqQyxzQkFBc0IsQ0FBQ2dDLE1BQU0sQ0FBQ0UsSUFBSztJQUMxRSxDQUFFLENBQUM7RUFDTDtBQUNGO0FBRUF0QyxlQUFlLENBQUN1QyxRQUFRLENBQUUsb0JBQW9CLEVBQUVyQyxrQkFBbUIsQ0FBQyJ9