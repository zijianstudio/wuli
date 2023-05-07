// Copyright 2020-2022, University of Colorado Boulder

/**
 * MockupOpacityControl defines a control that sets a global variable that can be used to control the opacity of the
 * mockups that are often used during early development of a sim for getting the layout right.
 *
 * Here is an example of the code to add to the ScreenView instance where the mockup should appear:
 *
 * @example
 * const mockup = new Image( mockupImage, {
 *   center: this.layoutBounds.center,
 *   minWidth: this.layoutBounds.width,
 *   maxWidth: this.layoutBounds.width,
 *   opacity: window.phet.mockupOpacityProperty.value
 * } );
 * this.addChild( mockup );
 * window.phet.mockupOpacityProperty.linkAttribute( mockup, 'opacity' );
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, Text, VBox } from '../../../../scenery/js/imports.js';
import HSlider from '../../../../sun/js/HSlider.js';
import numberLineCommon from '../../numberLineCommon.js';

// constants
const LABEL_FONT = new PhetFont(20);
const QUERY_PARAMETER = 'mockupOpacity';
class MockupOpacityControl extends VBox {
  constructor() {
    let initialOpacity = 0;
    if (QueryStringMachine.containsKey(QUERY_PARAMETER)) {
      initialOpacity = QueryStringMachine.get(QUERY_PARAMETER, {
        type: 'number'
      });
    }
    const mockupOpacityProperty = new NumberProperty(initialOpacity);

    // slider
    const slider = new HSlider(mockupOpacityProperty, new Range(0, 1), {
      trackSize: new Dimension2(200, 5),
      thumbSize: new Dimension2(20, 40)
    });

    // Put the slider together with labels.
    const sliderAndLabels = new HBox({
      children: [new Text('0', {
        font: LABEL_FONT
      }), slider, new Text('1', {
        font: LABEL_FONT
      })],
      spacing: 10
    });
    super({
      children: [new Text('Mockup Opacities (All Screens)', {
        font: new PhetFont(22)
      }), sliderAndLabels],
      spacing: 10
    });

    // Make the Property globally available.
    window.phet.mockupOpacityProperty = mockupOpacityProperty;
  }
}
const mockupOpacityControl = new MockupOpacityControl();
numberLineCommon.register('mockupOpacityControl', mockupOpacityControl);
export default mockupOpacityControl;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJSYW5nZSIsIlBoZXRGb250IiwiSEJveCIsIlRleHQiLCJWQm94IiwiSFNsaWRlciIsIm51bWJlckxpbmVDb21tb24iLCJMQUJFTF9GT05UIiwiUVVFUllfUEFSQU1FVEVSIiwiTW9ja3VwT3BhY2l0eUNvbnRyb2wiLCJjb25zdHJ1Y3RvciIsImluaXRpYWxPcGFjaXR5IiwiUXVlcnlTdHJpbmdNYWNoaW5lIiwiY29udGFpbnNLZXkiLCJnZXQiLCJ0eXBlIiwibW9ja3VwT3BhY2l0eVByb3BlcnR5Iiwic2xpZGVyIiwidHJhY2tTaXplIiwidGh1bWJTaXplIiwic2xpZGVyQW5kTGFiZWxzIiwiY2hpbGRyZW4iLCJmb250Iiwic3BhY2luZyIsIndpbmRvdyIsInBoZXQiLCJtb2NrdXBPcGFjaXR5Q29udHJvbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsibW9ja3VwT3BhY2l0eUNvbnRyb2wuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTW9ja3VwT3BhY2l0eUNvbnRyb2wgZGVmaW5lcyBhIGNvbnRyb2wgdGhhdCBzZXRzIGEgZ2xvYmFsIHZhcmlhYmxlIHRoYXQgY2FuIGJlIHVzZWQgdG8gY29udHJvbCB0aGUgb3BhY2l0eSBvZiB0aGVcclxuICogbW9ja3VwcyB0aGF0IGFyZSBvZnRlbiB1c2VkIGR1cmluZyBlYXJseSBkZXZlbG9wbWVudCBvZiBhIHNpbSBmb3IgZ2V0dGluZyB0aGUgbGF5b3V0IHJpZ2h0LlxyXG4gKlxyXG4gKiBIZXJlIGlzIGFuIGV4YW1wbGUgb2YgdGhlIGNvZGUgdG8gYWRkIHRvIHRoZSBTY3JlZW5WaWV3IGluc3RhbmNlIHdoZXJlIHRoZSBtb2NrdXAgc2hvdWxkIGFwcGVhcjpcclxuICpcclxuICogQGV4YW1wbGVcclxuICogY29uc3QgbW9ja3VwID0gbmV3IEltYWdlKCBtb2NrdXBJbWFnZSwge1xyXG4gKiAgIGNlbnRlcjogdGhpcy5sYXlvdXRCb3VuZHMuY2VudGVyLFxyXG4gKiAgIG1pbldpZHRoOiB0aGlzLmxheW91dEJvdW5kcy53aWR0aCxcclxuICogICBtYXhXaWR0aDogdGhpcy5sYXlvdXRCb3VuZHMud2lkdGgsXHJcbiAqICAgb3BhY2l0eTogd2luZG93LnBoZXQubW9ja3VwT3BhY2l0eVByb3BlcnR5LnZhbHVlXHJcbiAqIH0gKTtcclxuICogdGhpcy5hZGRDaGlsZCggbW9ja3VwICk7XHJcbiAqIHdpbmRvdy5waGV0Lm1vY2t1cE9wYWNpdHlQcm9wZXJ0eS5saW5rQXR0cmlidXRlKCBtb2NrdXAsICdvcGFjaXR5JyApO1xyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IEhCb3gsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgSFNsaWRlciBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvSFNsaWRlci5qcyc7XHJcbmltcG9ydCBudW1iZXJMaW5lQ29tbW9uIGZyb20gJy4uLy4uL251bWJlckxpbmVDb21tb24uanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IExBQkVMX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDIwICk7XHJcbmNvbnN0IFFVRVJZX1BBUkFNRVRFUiA9ICdtb2NrdXBPcGFjaXR5JztcclxuXHJcbmNsYXNzIE1vY2t1cE9wYWNpdHlDb250cm9sIGV4dGVuZHMgVkJveCB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG5cclxuICAgIGxldCBpbml0aWFsT3BhY2l0eSA9IDA7XHJcbiAgICBpZiAoIFF1ZXJ5U3RyaW5nTWFjaGluZS5jb250YWluc0tleSggUVVFUllfUEFSQU1FVEVSICkgKSB7XHJcbiAgICAgIGluaXRpYWxPcGFjaXR5ID0gUXVlcnlTdHJpbmdNYWNoaW5lLmdldCggUVVFUllfUEFSQU1FVEVSLCB7IHR5cGU6ICdudW1iZXInIH0gKTtcclxuICAgIH1cclxuICAgIGNvbnN0IG1vY2t1cE9wYWNpdHlQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggaW5pdGlhbE9wYWNpdHkgKTtcclxuXHJcbiAgICAvLyBzbGlkZXJcclxuICAgIGNvbnN0IHNsaWRlciA9IG5ldyBIU2xpZGVyKFxyXG4gICAgICBtb2NrdXBPcGFjaXR5UHJvcGVydHksXHJcbiAgICAgIG5ldyBSYW5nZSggMCwgMSApLCB7XHJcbiAgICAgICAgdHJhY2tTaXplOiBuZXcgRGltZW5zaW9uMiggMjAwLCA1ICksXHJcbiAgICAgICAgdGh1bWJTaXplOiBuZXcgRGltZW5zaW9uMiggMjAsIDQwIClcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBQdXQgdGhlIHNsaWRlciB0b2dldGhlciB3aXRoIGxhYmVscy5cclxuICAgIGNvbnN0IHNsaWRlckFuZExhYmVscyA9IG5ldyBIQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbmV3IFRleHQoICcwJywgeyBmb250OiBMQUJFTF9GT05UIH0gKSxcclxuICAgICAgICBzbGlkZXIsXHJcbiAgICAgICAgbmV3IFRleHQoICcxJywgeyBmb250OiBMQUJFTF9GT05UIH0gKVxyXG4gICAgICBdLFxyXG4gICAgICBzcGFjaW5nOiAxMFxyXG4gICAgfSApO1xyXG5cclxuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIG5ldyBUZXh0KCAnTW9ja3VwIE9wYWNpdGllcyAoQWxsIFNjcmVlbnMpJywgeyBmb250OiBuZXcgUGhldEZvbnQoIDIyICkgfSApLFxyXG4gICAgICAgIHNsaWRlckFuZExhYmVsc1xyXG4gICAgICBdLFxyXG4gICAgICBzcGFjaW5nOiAxMFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIE1ha2UgdGhlIFByb3BlcnR5IGdsb2JhbGx5IGF2YWlsYWJsZS5cclxuICAgIHdpbmRvdy5waGV0Lm1vY2t1cE9wYWNpdHlQcm9wZXJ0eSA9IG1vY2t1cE9wYWNpdHlQcm9wZXJ0eTtcclxuICB9XHJcbn1cclxuXHJcbmNvbnN0IG1vY2t1cE9wYWNpdHlDb250cm9sID0gbmV3IE1vY2t1cE9wYWNpdHlDb250cm9sKCk7XHJcblxyXG5udW1iZXJMaW5lQ29tbW9uLnJlZ2lzdGVyKCAnbW9ja3VwT3BhY2l0eUNvbnRyb2wnLCBtb2NrdXBPcGFjaXR5Q29udHJvbCApO1xyXG5leHBvcnQgZGVmYXVsdCBtb2NrdXBPcGFjaXR5Q29udHJvbDtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUNwRSxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjs7QUFFeEQ7QUFDQSxNQUFNQyxVQUFVLEdBQUcsSUFBSU4sUUFBUSxDQUFFLEVBQUcsQ0FBQztBQUNyQyxNQUFNTyxlQUFlLEdBQUcsZUFBZTtBQUV2QyxNQUFNQyxvQkFBb0IsU0FBU0wsSUFBSSxDQUFDO0VBRXRDTSxXQUFXQSxDQUFBLEVBQUc7SUFFWixJQUFJQyxjQUFjLEdBQUcsQ0FBQztJQUN0QixJQUFLQyxrQkFBa0IsQ0FBQ0MsV0FBVyxDQUFFTCxlQUFnQixDQUFDLEVBQUc7TUFDdkRHLGNBQWMsR0FBR0Msa0JBQWtCLENBQUNFLEdBQUcsQ0FBRU4sZUFBZSxFQUFFO1FBQUVPLElBQUksRUFBRTtNQUFTLENBQUUsQ0FBQztJQUNoRjtJQUNBLE1BQU1DLHFCQUFxQixHQUFHLElBQUlsQixjQUFjLENBQUVhLGNBQWUsQ0FBQzs7SUFFbEU7SUFDQSxNQUFNTSxNQUFNLEdBQUcsSUFBSVosT0FBTyxDQUN4QlcscUJBQXFCLEVBQ3JCLElBQUloQixLQUFLLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUFFO01BQ2pCa0IsU0FBUyxFQUFFLElBQUluQixVQUFVLENBQUUsR0FBRyxFQUFFLENBQUUsQ0FBQztNQUNuQ29CLFNBQVMsRUFBRSxJQUFJcEIsVUFBVSxDQUFFLEVBQUUsRUFBRSxFQUFHO0lBQ3BDLENBQ0YsQ0FBQzs7SUFFRDtJQUNBLE1BQU1xQixlQUFlLEdBQUcsSUFBSWxCLElBQUksQ0FBRTtNQUNoQ21CLFFBQVEsRUFBRSxDQUNSLElBQUlsQixJQUFJLENBQUUsR0FBRyxFQUFFO1FBQUVtQixJQUFJLEVBQUVmO01BQVcsQ0FBRSxDQUFDLEVBQ3JDVSxNQUFNLEVBQ04sSUFBSWQsSUFBSSxDQUFFLEdBQUcsRUFBRTtRQUFFbUIsSUFBSSxFQUFFZjtNQUFXLENBQUUsQ0FBQyxDQUN0QztNQUNEZ0IsT0FBTyxFQUFFO0lBQ1gsQ0FBRSxDQUFDO0lBR0gsS0FBSyxDQUFFO01BQ0xGLFFBQVEsRUFBRSxDQUNSLElBQUlsQixJQUFJLENBQUUsZ0NBQWdDLEVBQUU7UUFBRW1CLElBQUksRUFBRSxJQUFJckIsUUFBUSxDQUFFLEVBQUc7TUFBRSxDQUFFLENBQUMsRUFDMUVtQixlQUFlLENBQ2hCO01BQ0RHLE9BQU8sRUFBRTtJQUNYLENBQUUsQ0FBQzs7SUFFSDtJQUNBQyxNQUFNLENBQUNDLElBQUksQ0FBQ1QscUJBQXFCLEdBQUdBLHFCQUFxQjtFQUMzRDtBQUNGO0FBRUEsTUFBTVUsb0JBQW9CLEdBQUcsSUFBSWpCLG9CQUFvQixDQUFDLENBQUM7QUFFdkRILGdCQUFnQixDQUFDcUIsUUFBUSxDQUFFLHNCQUFzQixFQUFFRCxvQkFBcUIsQ0FBQztBQUN6RSxlQUFlQSxvQkFBb0IifQ==