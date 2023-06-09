// Copyright 2022-2023, University of Colorado Boulder

/**
 * Base class which renders a Node for the SoccerBall.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import centerAndVariability from '../../centerAndVariability.js';
import { Circle, Node, Text } from '../../../../scenery/js/imports.js';
import { AnimationMode } from '../model/AnimationMode.js';
import CAVColors from '../CAVColors.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Multilink from '../../../../axon/js/Multilink.js';
// for debugging with ?dev
let index = 0;
export default class CAVObjectNode extends Node {
  constructor(soccerBall, isShowingPlayAreaMedianProperty, modelViewTransform, modelRadius, providedOptions) {
    const options = optionize()({
      cursor: 'pointer'
    }, providedOptions);
    super(options);
    const viewRadius = modelViewTransform.modelToViewDeltaX(modelRadius);

    // Visibilty controlled by subclass logic. Also this whole node is moved to front when the medianHighlight is shown
    // so it will appear in front (unless the user drags another object on top of it).
    this.medianHighlight = new Circle(viewRadius + 1.75, {
      fill: CAVColors.medianColorProperty
    });
    this.addChild(this.medianHighlight);
    soccerBall.positionProperty.link(position => {
      this.translation = modelViewTransform.modelToViewPosition(position);
    });

    // The initial ready-to-kick ball is full opacity. The rest of the balls waiting to be kicked are lower opacity so
    // they don't look like part of the data set, but still look kickable.
    Multilink.multilink([soccerBall.valueProperty, soccerBall.animationModeProperty], (value, animationMode) => {
      this.opacity = value === null && animationMode === AnimationMode.NONE && !soccerBall.isFirstObject ? 0.4 : 1;
    });

    // Show index when debugging with ?dev
    if (phet.chipper.queryParameters.dev) {
      this.addChild(new Text(index++ + '', {
        font: new PhetFont(14),
        fill: 'red',
        x: this.width / 2 + 1
      }));
    }
  }
}
centerAndVariability.register('CAVObjectNode', CAVObjectNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJjZW50ZXJBbmRWYXJpYWJpbGl0eSIsIkNpcmNsZSIsIk5vZGUiLCJUZXh0IiwiQW5pbWF0aW9uTW9kZSIsIkNBVkNvbG9ycyIsIlBoZXRGb250IiwiTXVsdGlsaW5rIiwiaW5kZXgiLCJDQVZPYmplY3ROb2RlIiwiY29uc3RydWN0b3IiLCJzb2NjZXJCYWxsIiwiaXNTaG93aW5nUGxheUFyZWFNZWRpYW5Qcm9wZXJ0eSIsIm1vZGVsVmlld1RyYW5zZm9ybSIsIm1vZGVsUmFkaXVzIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImN1cnNvciIsInZpZXdSYWRpdXMiLCJtb2RlbFRvVmlld0RlbHRhWCIsIm1lZGlhbkhpZ2hsaWdodCIsImZpbGwiLCJtZWRpYW5Db2xvclByb3BlcnR5IiwiYWRkQ2hpbGQiLCJwb3NpdGlvblByb3BlcnR5IiwibGluayIsInBvc2l0aW9uIiwidHJhbnNsYXRpb24iLCJtb2RlbFRvVmlld1Bvc2l0aW9uIiwibXVsdGlsaW5rIiwidmFsdWVQcm9wZXJ0eSIsImFuaW1hdGlvbk1vZGVQcm9wZXJ0eSIsInZhbHVlIiwiYW5pbWF0aW9uTW9kZSIsIm9wYWNpdHkiLCJOT05FIiwiaXNGaXJzdE9iamVjdCIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwiZGV2IiwiZm9udCIsIngiLCJ3aWR0aCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ0FWT2JqZWN0Tm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCYXNlIGNsYXNzIHdoaWNoIHJlbmRlcnMgYSBOb2RlIGZvciB0aGUgU29jY2VyQmFsbC5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBLbHVzZW5kb3JmIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcbmltcG9ydCBjZW50ZXJBbmRWYXJpYWJpbGl0eSBmcm9tICcuLi8uLi9jZW50ZXJBbmRWYXJpYWJpbGl0eS5qcyc7XHJcbmltcG9ydCB7IENpcmNsZSwgTm9kZSwgTm9kZU9wdGlvbnMsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgU29jY2VyQmFsbCBmcm9tICcuLi9tb2RlbC9Tb2NjZXJCYWxsLmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgeyBBbmltYXRpb25Nb2RlIH0gZnJvbSAnLi4vbW9kZWwvQW5pbWF0aW9uTW9kZS5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IENBVkNvbG9ycyBmcm9tICcuLi9DQVZDb2xvcnMuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcblxyXG5leHBvcnQgdHlwZSBDQVZPYmplY3ROb2RlT3B0aW9ucyA9XHJcblxyXG4vLyBUYWtlIGFsbCBvcHRpb25zIGZyb20gTm9kZU9wdGlvbnMsIGJ1dCBkbyBub3QgYWxsb3cgcGFzc2luZyB0aHJvdWdoIGlucHV0RW5hYmxlZFByb3BlcnR5IHNpbmNlIGl0IHJlcXVpcmVzIHNwZWNpYWwgaGFuZGxpbmcgaW4gbXVsdGlsaW5rXHJcbiAgJiBTdHJpY3RPbWl0PE5vZGVPcHRpb25zLCAnaW5wdXRFbmFibGVkUHJvcGVydHknPlxyXG4gICYgUGlja1JlcXVpcmVkPE5vZGVPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG4vLyBmb3IgZGVidWdnaW5nIHdpdGggP2RldlxyXG5sZXQgaW5kZXggPSAwO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgYWJzdHJhY3QgY2xhc3MgQ0FWT2JqZWN0Tm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgbWVkaWFuSGlnaGxpZ2h0OiBDaXJjbGU7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc29jY2VyQmFsbDogU29jY2VyQmFsbCwgaXNTaG93aW5nUGxheUFyZWFNZWRpYW5Qcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBtb2RlbFZpZXdUcmFuc2Zvcm06IE1vZGVsVmlld1RyYW5zZm9ybTIsXHJcbiAgICAgICAgICAgICAgICAgICAgICBtb2RlbFJhZGl1czogbnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zPzogQ0FWT2JqZWN0Tm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxDQVZPYmplY3ROb2RlT3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcclxuICAgICAgY3Vyc29yOiAncG9pbnRlcidcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCB2aWV3UmFkaXVzID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYKCBtb2RlbFJhZGl1cyApO1xyXG5cclxuICAgIC8vIFZpc2liaWx0eSBjb250cm9sbGVkIGJ5IHN1YmNsYXNzIGxvZ2ljLiBBbHNvIHRoaXMgd2hvbGUgbm9kZSBpcyBtb3ZlZCB0byBmcm9udCB3aGVuIHRoZSBtZWRpYW5IaWdobGlnaHQgaXMgc2hvd25cclxuICAgIC8vIHNvIGl0IHdpbGwgYXBwZWFyIGluIGZyb250ICh1bmxlc3MgdGhlIHVzZXIgZHJhZ3MgYW5vdGhlciBvYmplY3Qgb24gdG9wIG9mIGl0KS5cclxuICAgIHRoaXMubWVkaWFuSGlnaGxpZ2h0ID0gbmV3IENpcmNsZSggdmlld1JhZGl1cyArIDEuNzUsIHtcclxuICAgICAgZmlsbDogQ0FWQ29sb3JzLm1lZGlhbkNvbG9yUHJvcGVydHlcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMubWVkaWFuSGlnaGxpZ2h0ICk7XHJcblxyXG4gICAgc29jY2VyQmFsbC5wb3NpdGlvblByb3BlcnR5LmxpbmsoIHBvc2l0aW9uID0+IHtcclxuICAgICAgdGhpcy50cmFuc2xhdGlvbiA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCBwb3NpdGlvbiApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRoZSBpbml0aWFsIHJlYWR5LXRvLWtpY2sgYmFsbCBpcyBmdWxsIG9wYWNpdHkuIFRoZSByZXN0IG9mIHRoZSBiYWxscyB3YWl0aW5nIHRvIGJlIGtpY2tlZCBhcmUgbG93ZXIgb3BhY2l0eSBzb1xyXG4gICAgLy8gdGhleSBkb24ndCBsb29rIGxpa2UgcGFydCBvZiB0aGUgZGF0YSBzZXQsIGJ1dCBzdGlsbCBsb29rIGtpY2thYmxlLlxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggWyBzb2NjZXJCYWxsLnZhbHVlUHJvcGVydHksIHNvY2NlckJhbGwuYW5pbWF0aW9uTW9kZVByb3BlcnR5IF0sXHJcbiAgICAgICggdmFsdWUsIGFuaW1hdGlvbk1vZGUgKSA9PiB7XHJcbiAgICAgICAgdGhpcy5vcGFjaXR5ID0gdmFsdWUgPT09IG51bGwgJiYgYW5pbWF0aW9uTW9kZSA9PT0gQW5pbWF0aW9uTW9kZS5OT05FICYmICFzb2NjZXJCYWxsLmlzRmlyc3RPYmplY3QgPyAwLjQgOiAxO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gU2hvdyBpbmRleCB3aGVuIGRlYnVnZ2luZyB3aXRoID9kZXZcclxuICAgIGlmICggcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5kZXYgKSB7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBUZXh0KCBpbmRleCsrICsgJycsIHtcclxuICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDE0ICksXHJcbiAgICAgICAgZmlsbDogJ3JlZCcsXHJcbiAgICAgICAgeDogdGhpcy53aWR0aCAvIDIgKyAxXHJcbiAgICAgIH0gKSApO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuY2VudGVyQW5kVmFyaWFiaWxpdHkucmVnaXN0ZXIoICdDQVZPYmplY3ROb2RlJywgQ0FWT2JqZWN0Tm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBNEIsdUNBQXVDO0FBRW5GLE9BQU9DLG9CQUFvQixNQUFNLCtCQUErQjtBQUNoRSxTQUFTQyxNQUFNLEVBQUVDLElBQUksRUFBZUMsSUFBSSxRQUFRLG1DQUFtQztBQUduRixTQUFTQyxhQUFhLFFBQVEsMkJBQTJCO0FBRXpELE9BQU9DLFNBQVMsTUFBTSxpQkFBaUI7QUFDdkMsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUU5RCxPQUFPQyxTQUFTLE1BQU0sa0NBQWtDO0FBUXhEO0FBQ0EsSUFBSUMsS0FBSyxHQUFHLENBQUM7QUFFYixlQUFlLE1BQWVDLGFBQWEsU0FBU1AsSUFBSSxDQUFDO0VBSWhEUSxXQUFXQSxDQUFFQyxVQUFzQixFQUFFQywrQkFBMkQsRUFDbkZDLGtCQUF1QyxFQUN2Q0MsV0FBbUIsRUFDbkJDLGVBQXNDLEVBQUc7SUFFM0QsTUFBTUMsT0FBTyxHQUFHakIsU0FBUyxDQUFzRCxDQUFDLENBQUU7TUFDaEZrQixNQUFNLEVBQUU7SUFDVixDQUFDLEVBQUVGLGVBQWdCLENBQUM7SUFDcEIsS0FBSyxDQUFFQyxPQUFRLENBQUM7SUFFaEIsTUFBTUUsVUFBVSxHQUFHTCxrQkFBa0IsQ0FBQ00saUJBQWlCLENBQUVMLFdBQVksQ0FBQzs7SUFFdEU7SUFDQTtJQUNBLElBQUksQ0FBQ00sZUFBZSxHQUFHLElBQUluQixNQUFNLENBQUVpQixVQUFVLEdBQUcsSUFBSSxFQUFFO01BQ3BERyxJQUFJLEVBQUVoQixTQUFTLENBQUNpQjtJQUNsQixDQUFFLENBQUM7SUFDSCxJQUFJLENBQUNDLFFBQVEsQ0FBRSxJQUFJLENBQUNILGVBQWdCLENBQUM7SUFFckNULFVBQVUsQ0FBQ2EsZ0JBQWdCLENBQUNDLElBQUksQ0FBRUMsUUFBUSxJQUFJO01BQzVDLElBQUksQ0FBQ0MsV0FBVyxHQUFHZCxrQkFBa0IsQ0FBQ2UsbUJBQW1CLENBQUVGLFFBQVMsQ0FBQztJQUN2RSxDQUFFLENBQUM7O0lBRUg7SUFDQTtJQUNBbkIsU0FBUyxDQUFDc0IsU0FBUyxDQUFFLENBQUVsQixVQUFVLENBQUNtQixhQUFhLEVBQUVuQixVQUFVLENBQUNvQixxQkFBcUIsQ0FBRSxFQUNqRixDQUFFQyxLQUFLLEVBQUVDLGFBQWEsS0FBTTtNQUMxQixJQUFJLENBQUNDLE9BQU8sR0FBR0YsS0FBSyxLQUFLLElBQUksSUFBSUMsYUFBYSxLQUFLN0IsYUFBYSxDQUFDK0IsSUFBSSxJQUFJLENBQUN4QixVQUFVLENBQUN5QixhQUFhLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDOUcsQ0FBRSxDQUFDOztJQUVMO0lBQ0EsSUFBS0MsSUFBSSxDQUFDQyxPQUFPLENBQUNDLGVBQWUsQ0FBQ0MsR0FBRyxFQUFHO01BQ3RDLElBQUksQ0FBQ2pCLFFBQVEsQ0FBRSxJQUFJcEIsSUFBSSxDQUFFSyxLQUFLLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFDckNpQyxJQUFJLEVBQUUsSUFBSW5DLFFBQVEsQ0FBRSxFQUFHLENBQUM7UUFDeEJlLElBQUksRUFBRSxLQUFLO1FBQ1hxQixDQUFDLEVBQUUsSUFBSSxDQUFDQyxLQUFLLEdBQUcsQ0FBQyxHQUFHO01BQ3RCLENBQUUsQ0FBRSxDQUFDO0lBQ1A7RUFDRjtBQUNGO0FBRUEzQyxvQkFBb0IsQ0FBQzRDLFFBQVEsQ0FBRSxlQUFlLEVBQUVuQyxhQUFjLENBQUMifQ==