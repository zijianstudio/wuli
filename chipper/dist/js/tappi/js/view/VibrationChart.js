// Copyright 2019-2022, University of Colorado Boulder

/**
 * A chart that visualizes vibration. Either "on" or "off", it produces a square wave to display vibration
 * over time.
 *
 * @author Jesse Greenberg
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Range from '../../../dot/js/Range.js';
import DynamicSeries from '../../../griddle/js/DynamicSeries.js';
import SeismographNode from '../../../griddle/js/SeismographNode.js';
import merge from '../../../phet-core/js/merge.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../scenery/js/imports.js';
import Panel from '../../../sun/js/Panel.js';
import tappi from '../tappi.js';

// constants
const MAX_TIME = 10; // seconds of plotted data

class VibrationChart extends Node {
  /**
   * @param {BooleanProperty} vibratingProperty
   * @param {number} width
   * @param {number} height
   * @param {Object} [options]
   */
  constructor(vibratingProperty, width, height, options) {
    // beware this also gets passed to mutate for the supertype later
    options = merge({
      // font for the vibration/time labels
      labelFont: new PhetFont(24)
    }, options);
    super();

    // @private
    this.vibratingProperty = vibratingProperty;

    // @private {NumberProperty} - amount of time that has elapsed in order to plot vibration against time
    this.timeProperty = new NumberProperty(0);

    // create the plot
    this.vibrationSeries = new DynamicSeries({
      color: 'orange'
    });
    const verticalAxisTitleNode = new Text('Vibration', {
      rotation: -Math.PI / 2,
      font: options.labelFont
    });
    const horizontalAxisTitleNode = new Text('Time (s)', {
      font: options.labelFont
    });
    const seismographNode = new SeismographNode(this.timeProperty, [this.vibrationSeries], new Text(''), {
      width: width,
      height: height,
      verticalAxisLabelNode: verticalAxisTitleNode,
      horizontalAxisLabelNode: horizontalAxisTitleNode,
      numberVerticalLines: MAX_TIME,
      numberHorizontalLines: 3,
      verticalRanges: [new Range(-1.5, 1.5)]
    });

    // layout
    const labeledChartNode = new Node();
    labeledChartNode.addChild(seismographNode);

    // contain in a panel
    const panel = new Panel(labeledChartNode, {
      fill: 'lightgrey'
    });
    this.addChild(panel);

    // mutate with options after bounds are defined
    this.mutate(options);
  }

  /**
   * Add data to the scrolling chart.
   * @public
   *
   * @param {number} dt - in ms
   */
  step(dt) {
    this.timeProperty.set(this.timeProperty.get() + dt);
    const vibrationDataPoint = this.vibratingProperty.get() ? 1 : -1;
    this.vibrationSeries.addXYDataPoint(this.timeProperty.get(), vibrationDataPoint);
    while (this.vibrationSeries.getDataPoint(0).x < this.timeProperty.value - MAX_TIME) {
      this.vibrationSeries.shiftData();
    }
  }
}
tappi.register('VibrationChart', VibrationChart);
export default VibrationChart;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlIiwiRHluYW1pY1NlcmllcyIsIlNlaXNtb2dyYXBoTm9kZSIsIm1lcmdlIiwiUGhldEZvbnQiLCJOb2RlIiwiVGV4dCIsIlBhbmVsIiwidGFwcGkiLCJNQVhfVElNRSIsIlZpYnJhdGlvbkNoYXJ0IiwiY29uc3RydWN0b3IiLCJ2aWJyYXRpbmdQcm9wZXJ0eSIsIndpZHRoIiwiaGVpZ2h0Iiwib3B0aW9ucyIsImxhYmVsRm9udCIsInRpbWVQcm9wZXJ0eSIsInZpYnJhdGlvblNlcmllcyIsImNvbG9yIiwidmVydGljYWxBeGlzVGl0bGVOb2RlIiwicm90YXRpb24iLCJNYXRoIiwiUEkiLCJmb250IiwiaG9yaXpvbnRhbEF4aXNUaXRsZU5vZGUiLCJzZWlzbW9ncmFwaE5vZGUiLCJ2ZXJ0aWNhbEF4aXNMYWJlbE5vZGUiLCJob3Jpem9udGFsQXhpc0xhYmVsTm9kZSIsIm51bWJlclZlcnRpY2FsTGluZXMiLCJudW1iZXJIb3Jpem9udGFsTGluZXMiLCJ2ZXJ0aWNhbFJhbmdlcyIsImxhYmVsZWRDaGFydE5vZGUiLCJhZGRDaGlsZCIsInBhbmVsIiwiZmlsbCIsIm11dGF0ZSIsInN0ZXAiLCJkdCIsInNldCIsImdldCIsInZpYnJhdGlvbkRhdGFQb2ludCIsImFkZFhZRGF0YVBvaW50IiwiZ2V0RGF0YVBvaW50IiwieCIsInZhbHVlIiwic2hpZnREYXRhIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJWaWJyYXRpb25DaGFydC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIGNoYXJ0IHRoYXQgdmlzdWFsaXplcyB2aWJyYXRpb24uIEVpdGhlciBcIm9uXCIgb3IgXCJvZmZcIiwgaXQgcHJvZHVjZXMgYSBzcXVhcmUgd2F2ZSB0byBkaXNwbGF5IHZpYnJhdGlvblxyXG4gKiBvdmVyIHRpbWUuXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqL1xyXG5cclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IER5bmFtaWNTZXJpZXMgZnJvbSAnLi4vLi4vLi4vZ3JpZGRsZS9qcy9EeW5hbWljU2VyaWVzLmpzJztcclxuaW1wb3J0IFNlaXNtb2dyYXBoTm9kZSBmcm9tICcuLi8uLi8uLi9ncmlkZGxlL2pzL1NlaXNtb2dyYXBoTm9kZS5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgTm9kZSwgVGV4dCB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBQYW5lbCBmcm9tICcuLi8uLi8uLi9zdW4vanMvUGFuZWwuanMnO1xyXG5pbXBvcnQgdGFwcGkgZnJvbSAnLi4vdGFwcGkuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IE1BWF9USU1FID0gMTA7IC8vIHNlY29uZHMgb2YgcGxvdHRlZCBkYXRhXHJcblxyXG5jbGFzcyBWaWJyYXRpb25DaGFydCBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0Jvb2xlYW5Qcm9wZXJ0eX0gdmlicmF0aW5nUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB2aWJyYXRpbmdQcm9wZXJ0eSwgd2lkdGgsIGhlaWdodCwgb3B0aW9ucyApIHtcclxuXHJcbiAgICAvLyBiZXdhcmUgdGhpcyBhbHNvIGdldHMgcGFzc2VkIHRvIG11dGF0ZSBmb3IgdGhlIHN1cGVydHlwZSBsYXRlclxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyBmb250IGZvciB0aGUgdmlicmF0aW9uL3RpbWUgbGFiZWxzXHJcbiAgICAgIGxhYmVsRm9udDogbmV3IFBoZXRGb250KCAyNCApXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy52aWJyYXRpbmdQcm9wZXJ0eSA9IHZpYnJhdGluZ1Byb3BlcnR5O1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtOdW1iZXJQcm9wZXJ0eX0gLSBhbW91bnQgb2YgdGltZSB0aGF0IGhhcyBlbGFwc2VkIGluIG9yZGVyIHRvIHBsb3QgdmlicmF0aW9uIGFnYWluc3QgdGltZVxyXG4gICAgdGhpcy50aW1lUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAgKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgdGhlIHBsb3RcclxuICAgIHRoaXMudmlicmF0aW9uU2VyaWVzID0gbmV3IER5bmFtaWNTZXJpZXMoIHsgY29sb3I6ICdvcmFuZ2UnIH0gKTtcclxuXHJcbiAgICBjb25zdCB2ZXJ0aWNhbEF4aXNUaXRsZU5vZGUgPSBuZXcgVGV4dCggJ1ZpYnJhdGlvbicsIHtcclxuICAgICAgcm90YXRpb246IC1NYXRoLlBJIC8gMixcclxuICAgICAgZm9udDogb3B0aW9ucy5sYWJlbEZvbnRcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IGhvcml6b250YWxBeGlzVGl0bGVOb2RlID0gbmV3IFRleHQoICdUaW1lIChzKScsIHtcclxuICAgICAgZm9udDogb3B0aW9ucy5sYWJlbEZvbnRcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHNlaXNtb2dyYXBoTm9kZSA9IG5ldyBTZWlzbW9ncmFwaE5vZGUoIHRoaXMudGltZVByb3BlcnR5LCBbIHRoaXMudmlicmF0aW9uU2VyaWVzIF0sIG5ldyBUZXh0KCAnJyApLCB7XHJcbiAgICAgIHdpZHRoOiB3aWR0aCxcclxuICAgICAgaGVpZ2h0OiBoZWlnaHQsXHJcbiAgICAgIHZlcnRpY2FsQXhpc0xhYmVsTm9kZTogdmVydGljYWxBeGlzVGl0bGVOb2RlLFxyXG4gICAgICBob3Jpem9udGFsQXhpc0xhYmVsTm9kZTogaG9yaXpvbnRhbEF4aXNUaXRsZU5vZGUsXHJcbiAgICAgIG51bWJlclZlcnRpY2FsTGluZXM6IE1BWF9USU1FLFxyXG4gICAgICBudW1iZXJIb3Jpem9udGFsTGluZXM6IDMsXHJcbiAgICAgIHZlcnRpY2FsUmFuZ2VzOiBbIG5ldyBSYW5nZSggLTEuNSwgMS41ICkgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGxheW91dFxyXG4gICAgY29uc3QgbGFiZWxlZENoYXJ0Tm9kZSA9IG5ldyBOb2RlKCk7XHJcbiAgICBsYWJlbGVkQ2hhcnROb2RlLmFkZENoaWxkKCBzZWlzbW9ncmFwaE5vZGUgKTtcclxuXHJcbiAgICAvLyBjb250YWluIGluIGEgcGFuZWxcclxuICAgIGNvbnN0IHBhbmVsID0gbmV3IFBhbmVsKCBsYWJlbGVkQ2hhcnROb2RlLCB7XHJcbiAgICAgIGZpbGw6ICdsaWdodGdyZXknXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBwYW5lbCApO1xyXG5cclxuICAgIC8vIG11dGF0ZSB3aXRoIG9wdGlvbnMgYWZ0ZXIgYm91bmRzIGFyZSBkZWZpbmVkXHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIGRhdGEgdG8gdGhlIHNjcm9sbGluZyBjaGFydC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHQgLSBpbiBtc1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG4gICAgdGhpcy50aW1lUHJvcGVydHkuc2V0KCB0aGlzLnRpbWVQcm9wZXJ0eS5nZXQoKSArIGR0ICk7XHJcblxyXG4gICAgY29uc3QgdmlicmF0aW9uRGF0YVBvaW50ID0gdGhpcy52aWJyYXRpbmdQcm9wZXJ0eS5nZXQoKSA/IDEgOiAtMTtcclxuICAgIHRoaXMudmlicmF0aW9uU2VyaWVzLmFkZFhZRGF0YVBvaW50KCB0aGlzLnRpbWVQcm9wZXJ0eS5nZXQoKSwgdmlicmF0aW9uRGF0YVBvaW50ICk7XHJcblxyXG4gICAgd2hpbGUgKCB0aGlzLnZpYnJhdGlvblNlcmllcy5nZXREYXRhUG9pbnQoIDAgKS54IDwgdGhpcy50aW1lUHJvcGVydHkudmFsdWUgLSBNQVhfVElNRSApIHtcclxuICAgICAgdGhpcy52aWJyYXRpb25TZXJpZXMuc2hpZnREYXRhKCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG50YXBwaS5yZWdpc3RlciggJ1ZpYnJhdGlvbkNoYXJ0JywgVmlicmF0aW9uQ2hhcnQgKTtcclxuZXhwb3J0IGRlZmF1bHQgVmlicmF0aW9uQ2hhcnQ7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsY0FBYyxNQUFNLG9DQUFvQztBQUMvRCxPQUFPQyxLQUFLLE1BQU0sMEJBQTBCO0FBQzVDLE9BQU9DLGFBQWEsTUFBTSxzQ0FBc0M7QUFDaEUsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxLQUFLLE1BQU0sZ0NBQWdDO0FBQ2xELE9BQU9DLFFBQVEsTUFBTSxzQ0FBc0M7QUFDM0QsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLFFBQVEsZ0NBQWdDO0FBQzNELE9BQU9DLEtBQUssTUFBTSwwQkFBMEI7QUFDNUMsT0FBT0MsS0FBSyxNQUFNLGFBQWE7O0FBRS9CO0FBQ0EsTUFBTUMsUUFBUSxHQUFHLEVBQUUsQ0FBQyxDQUFDOztBQUVyQixNQUFNQyxjQUFjLFNBQVNMLElBQUksQ0FBQztFQUVoQztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRU0sV0FBV0EsQ0FBRUMsaUJBQWlCLEVBQUVDLEtBQUssRUFBRUMsTUFBTSxFQUFFQyxPQUFPLEVBQUc7SUFFdkQ7SUFDQUEsT0FBTyxHQUFHWixLQUFLLENBQUU7TUFFZjtNQUNBYSxTQUFTLEVBQUUsSUFBSVosUUFBUSxDQUFFLEVBQUc7SUFDOUIsQ0FBQyxFQUFFVyxPQUFRLENBQUM7SUFFWixLQUFLLENBQUMsQ0FBQzs7SUFFUDtJQUNBLElBQUksQ0FBQ0gsaUJBQWlCLEdBQUdBLGlCQUFpQjs7SUFFMUM7SUFDQSxJQUFJLENBQUNLLFlBQVksR0FBRyxJQUFJbEIsY0FBYyxDQUFFLENBQUUsQ0FBQzs7SUFFM0M7SUFDQSxJQUFJLENBQUNtQixlQUFlLEdBQUcsSUFBSWpCLGFBQWEsQ0FBRTtNQUFFa0IsS0FBSyxFQUFFO0lBQVMsQ0FBRSxDQUFDO0lBRS9ELE1BQU1DLHFCQUFxQixHQUFHLElBQUlkLElBQUksQ0FBRSxXQUFXLEVBQUU7TUFDbkRlLFFBQVEsRUFBRSxDQUFDQyxJQUFJLENBQUNDLEVBQUUsR0FBRyxDQUFDO01BQ3RCQyxJQUFJLEVBQUVULE9BQU8sQ0FBQ0M7SUFDaEIsQ0FBRSxDQUFDO0lBQ0gsTUFBTVMsdUJBQXVCLEdBQUcsSUFBSW5CLElBQUksQ0FBRSxVQUFVLEVBQUU7TUFDcERrQixJQUFJLEVBQUVULE9BQU8sQ0FBQ0M7SUFDaEIsQ0FBRSxDQUFDO0lBQ0gsTUFBTVUsZUFBZSxHQUFHLElBQUl4QixlQUFlLENBQUUsSUFBSSxDQUFDZSxZQUFZLEVBQUUsQ0FBRSxJQUFJLENBQUNDLGVBQWUsQ0FBRSxFQUFFLElBQUlaLElBQUksQ0FBRSxFQUFHLENBQUMsRUFBRTtNQUN4R08sS0FBSyxFQUFFQSxLQUFLO01BQ1pDLE1BQU0sRUFBRUEsTUFBTTtNQUNkYSxxQkFBcUIsRUFBRVAscUJBQXFCO01BQzVDUSx1QkFBdUIsRUFBRUgsdUJBQXVCO01BQ2hESSxtQkFBbUIsRUFBRXBCLFFBQVE7TUFDN0JxQixxQkFBcUIsRUFBRSxDQUFDO01BQ3hCQyxjQUFjLEVBQUUsQ0FBRSxJQUFJL0IsS0FBSyxDQUFFLENBQUMsR0FBRyxFQUFFLEdBQUksQ0FBQztJQUMxQyxDQUFFLENBQUM7O0lBRUg7SUFDQSxNQUFNZ0MsZ0JBQWdCLEdBQUcsSUFBSTNCLElBQUksQ0FBQyxDQUFDO0lBQ25DMkIsZ0JBQWdCLENBQUNDLFFBQVEsQ0FBRVAsZUFBZ0IsQ0FBQzs7SUFFNUM7SUFDQSxNQUFNUSxLQUFLLEdBQUcsSUFBSTNCLEtBQUssQ0FBRXlCLGdCQUFnQixFQUFFO01BQ3pDRyxJQUFJLEVBQUU7SUFDUixDQUFFLENBQUM7SUFDSCxJQUFJLENBQUNGLFFBQVEsQ0FBRUMsS0FBTSxDQUFDOztJQUV0QjtJQUNBLElBQUksQ0FBQ0UsTUFBTSxDQUFFckIsT0FBUSxDQUFDO0VBQ3hCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFc0IsSUFBSUEsQ0FBRUMsRUFBRSxFQUFHO0lBQ1QsSUFBSSxDQUFDckIsWUFBWSxDQUFDc0IsR0FBRyxDQUFFLElBQUksQ0FBQ3RCLFlBQVksQ0FBQ3VCLEdBQUcsQ0FBQyxDQUFDLEdBQUdGLEVBQUcsQ0FBQztJQUVyRCxNQUFNRyxrQkFBa0IsR0FBRyxJQUFJLENBQUM3QixpQkFBaUIsQ0FBQzRCLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNoRSxJQUFJLENBQUN0QixlQUFlLENBQUN3QixjQUFjLENBQUUsSUFBSSxDQUFDekIsWUFBWSxDQUFDdUIsR0FBRyxDQUFDLENBQUMsRUFBRUMsa0JBQW1CLENBQUM7SUFFbEYsT0FBUSxJQUFJLENBQUN2QixlQUFlLENBQUN5QixZQUFZLENBQUUsQ0FBRSxDQUFDLENBQUNDLENBQUMsR0FBRyxJQUFJLENBQUMzQixZQUFZLENBQUM0QixLQUFLLEdBQUdwQyxRQUFRLEVBQUc7TUFDdEYsSUFBSSxDQUFDUyxlQUFlLENBQUM0QixTQUFTLENBQUMsQ0FBQztJQUNsQztFQUNGO0FBQ0Y7QUFFQXRDLEtBQUssQ0FBQ3VDLFFBQVEsQ0FBRSxnQkFBZ0IsRUFBRXJDLGNBQWUsQ0FBQztBQUNsRCxlQUFlQSxjQUFjIn0=