// Copyright 2020-2022, University of Colorado Boulder

/**
 * View portion of the demo and test harness for the AmplitudeModulator class.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import Range from '../../../../../dot/js/Range.js';
import optionize from '../../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { HBox, Text, VBox } from '../../../../../scenery/js/imports.js';
import AquaRadioButtonGroup from '../../../../../sun/js/AquaRadioButtonGroup.js';
import Checkbox from '../../../../../sun/js/Checkbox.js';
import HSlider from '../../../../../sun/js/HSlider.js';
import soundManager from '../../../soundManager.js';
import tambo from '../../../tambo.js';
import AmplitudeModulatorDemo from '../model/AmplitudeModulatorDemo.js';
// constants
const LABEL_FONT = new PhetFont(16);
class AmplitudeModulatorDemoNode extends VBox {
  constructor(providedOptions) {
    const soundSourceRadioButtonItems = [{
      createNode: tandem => new Text('None', {
        font: LABEL_FONT
      }),
      value: 0
    }, {
      createNode: tandem => new Text('Sound 1', {
        font: LABEL_FONT
      }),
      value: 1
    }, {
      createNode: tandem => new Text('Sound 2', {
        font: LABEL_FONT
      }),
      value: 2
    }, {
      createNode: tandem => new Text('Sound 3', {
        font: LABEL_FONT
      }),
      value: 3
    }];
    const sourceSoundIndexProperty = new NumberProperty(0);
    const soundIndexSelector = new AquaRadioButtonGroup(sourceSoundIndexProperty, soundSourceRadioButtonItems);
    const soundIndexSelectorVBox = new VBox({
      children: [new Text('Source Sound:', {
        font: LABEL_FONT
      }), soundIndexSelector],
      spacing: 5
    });

    // Create the amplitude modulator demo instance and add it to the sound manager.
    const amplitudeModulatorDemo = new AmplitudeModulatorDemo(sourceSoundIndexProperty);
    soundManager.addSoundGenerator(amplitudeModulatorDemo);

    // LFO enabled control
    const lfoEnabled = new Checkbox(amplitudeModulatorDemo.amplitudeModulator.myEnabledProperty, new Text('LFO Enabled', {
      font: LABEL_FONT
    }), {
      boxWidth: 16
    });

    // frequency control
    const frequencyControlHBox = new HBox({
      children: [new Text('Frequency: ', {
        font: LABEL_FONT
      }), new HSlider(amplitudeModulatorDemo.amplitudeModulator.frequencyProperty, new Range(0.5, 20))]
    });

    // depth control
    const depthControlHBox = new HBox({
      children: [new Text('Depth: ', {
        font: LABEL_FONT
      }), new HSlider(amplitudeModulatorDemo.amplitudeModulator.depthProperty, new Range(0, 1))]
    });

    // waveform type selector
    const waveformRadioButtonItems = [{
      createNode: tandem => new Text('Sine', {
        font: LABEL_FONT
      }),
      value: 'sine'
    }, {
      createNode: tandem => new Text('Square', {
        font: LABEL_FONT
      }),
      value: 'square'
    }, {
      createNode: tandem => new Text('Triangle', {
        font: LABEL_FONT
      }),
      value: 'triangle'
    }, {
      createNode: tandem => new Text('Sawtooth', {
        font: LABEL_FONT
      }),
      value: 'sawtooth'
    }];
    const waveformSelector = new AquaRadioButtonGroup(amplitudeModulatorDemo.amplitudeModulator.waveformProperty, waveformRadioButtonItems);
    const waveformSelectorVBox = new VBox({
      children: [new Text('Modulation Waveform:', {
        font: LABEL_FONT
      }), waveformSelector],
      spacing: 5
    });
    super(optionize()({
      children: [soundIndexSelectorVBox, lfoEnabled, frequencyControlHBox, depthControlHBox, waveformSelectorVBox],
      spacing: 15,
      align: 'left'
    }, providedOptions));
  }
}
tambo.register('AmplitudeModulatorDemoNode', AmplitudeModulatorDemoNode);
export default AmplitudeModulatorDemoNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlIiwib3B0aW9uaXplIiwiUGhldEZvbnQiLCJIQm94IiwiVGV4dCIsIlZCb3giLCJBcXVhUmFkaW9CdXR0b25Hcm91cCIsIkNoZWNrYm94IiwiSFNsaWRlciIsInNvdW5kTWFuYWdlciIsInRhbWJvIiwiQW1wbGl0dWRlTW9kdWxhdG9yRGVtbyIsIkxBQkVMX0ZPTlQiLCJBbXBsaXR1ZGVNb2R1bGF0b3JEZW1vTm9kZSIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwic291bmRTb3VyY2VSYWRpb0J1dHRvbkl0ZW1zIiwiY3JlYXRlTm9kZSIsInRhbmRlbSIsImZvbnQiLCJ2YWx1ZSIsInNvdXJjZVNvdW5kSW5kZXhQcm9wZXJ0eSIsInNvdW5kSW5kZXhTZWxlY3RvciIsInNvdW5kSW5kZXhTZWxlY3RvclZCb3giLCJjaGlsZHJlbiIsInNwYWNpbmciLCJhbXBsaXR1ZGVNb2R1bGF0b3JEZW1vIiwiYWRkU291bmRHZW5lcmF0b3IiLCJsZm9FbmFibGVkIiwiYW1wbGl0dWRlTW9kdWxhdG9yIiwibXlFbmFibGVkUHJvcGVydHkiLCJib3hXaWR0aCIsImZyZXF1ZW5jeUNvbnRyb2xIQm94IiwiZnJlcXVlbmN5UHJvcGVydHkiLCJkZXB0aENvbnRyb2xIQm94IiwiZGVwdGhQcm9wZXJ0eSIsIndhdmVmb3JtUmFkaW9CdXR0b25JdGVtcyIsIndhdmVmb3JtU2VsZWN0b3IiLCJ3YXZlZm9ybVByb3BlcnR5Iiwid2F2ZWZvcm1TZWxlY3RvclZCb3giLCJhbGlnbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQW1wbGl0dWRlTW9kdWxhdG9yRGVtb05vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVmlldyBwb3J0aW9uIG9mIHRoZSBkZW1vIGFuZCB0ZXN0IGhhcm5lc3MgZm9yIHRoZSBBbXBsaXR1ZGVNb2R1bGF0b3IgY2xhc3MuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBIQm94LCBUZXh0LCBWQm94LCBWQm94T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBBcXVhUmFkaW9CdXR0b25Hcm91cCwgeyBBcXVhUmFkaW9CdXR0b25Hcm91cEl0ZW0gfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zdW4vanMvQXF1YVJhZGlvQnV0dG9uR3JvdXAuanMnO1xyXG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnLi4vLi4vLi4vLi4vLi4vc3VuL2pzL0NoZWNrYm94LmpzJztcclxuaW1wb3J0IEhTbGlkZXIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vc3VuL2pzL0hTbGlkZXIuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgc291bmRNYW5hZ2VyIGZyb20gJy4uLy4uLy4uL3NvdW5kTWFuYWdlci5qcyc7XHJcbmltcG9ydCB0YW1ibyBmcm9tICcuLi8uLi8uLi90YW1iby5qcyc7XHJcbmltcG9ydCBBbXBsaXR1ZGVNb2R1bGF0b3JEZW1vIGZyb20gJy4uL21vZGVsL0FtcGxpdHVkZU1vZHVsYXRvckRlbW8uanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcbmV4cG9ydCB0eXBlIEFtcGxpdHVkZU1vZHVsYXRvckRlbW9Ob2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgVkJveE9wdGlvbnM7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTEFCRUxfRk9OVCA9IG5ldyBQaGV0Rm9udCggMTYgKTtcclxuXHJcbmNsYXNzIEFtcGxpdHVkZU1vZHVsYXRvckRlbW9Ob2RlIGV4dGVuZHMgVkJveCB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogQW1wbGl0dWRlTW9kdWxhdG9yRGVtb05vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IHNvdW5kU291cmNlUmFkaW9CdXR0b25JdGVtcyA9IFtcclxuICAgICAge1xyXG4gICAgICAgIGNyZWF0ZU5vZGU6ICggdGFuZGVtOiBUYW5kZW0gKSA9PiBuZXcgVGV4dCggJ05vbmUnLCB7IGZvbnQ6IExBQkVMX0ZPTlQgfSApLFxyXG4gICAgICAgIHZhbHVlOiAwXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBjcmVhdGVOb2RlOiAoIHRhbmRlbTogVGFuZGVtICkgPT4gbmV3IFRleHQoICdTb3VuZCAxJywgeyBmb250OiBMQUJFTF9GT05UIH0gKSxcclxuICAgICAgICB2YWx1ZTogMVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgY3JlYXRlTm9kZTogKCB0YW5kZW06IFRhbmRlbSApID0+IG5ldyBUZXh0KCAnU291bmQgMicsIHsgZm9udDogTEFCRUxfRk9OVCB9ICksXHJcbiAgICAgICAgdmFsdWU6IDJcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGNyZWF0ZU5vZGU6ICggdGFuZGVtOiBUYW5kZW0gKSA9PiBuZXcgVGV4dCggJ1NvdW5kIDMnLCB7IGZvbnQ6IExBQkVMX0ZPTlQgfSApLFxyXG4gICAgICAgIHZhbHVlOiAzXHJcbiAgICAgIH1cclxuICAgIF07XHJcblxyXG4gICAgY29uc3Qgc291cmNlU291bmRJbmRleFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwICk7XHJcbiAgICBjb25zdCBzb3VuZEluZGV4U2VsZWN0b3IgPSBuZXcgQXF1YVJhZGlvQnV0dG9uR3JvdXAoIHNvdXJjZVNvdW5kSW5kZXhQcm9wZXJ0eSwgc291bmRTb3VyY2VSYWRpb0J1dHRvbkl0ZW1zICk7XHJcbiAgICBjb25zdCBzb3VuZEluZGV4U2VsZWN0b3JWQm94ID0gbmV3IFZCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgVGV4dCggJ1NvdXJjZSBTb3VuZDonLCB7IGZvbnQ6IExBQkVMX0ZPTlQgfSApLFxyXG4gICAgICAgIHNvdW5kSW5kZXhTZWxlY3RvclxyXG4gICAgICBdLFxyXG4gICAgICBzcGFjaW5nOiA1XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBhbXBsaXR1ZGUgbW9kdWxhdG9yIGRlbW8gaW5zdGFuY2UgYW5kIGFkZCBpdCB0byB0aGUgc291bmQgbWFuYWdlci5cclxuICAgIGNvbnN0IGFtcGxpdHVkZU1vZHVsYXRvckRlbW8gPSBuZXcgQW1wbGl0dWRlTW9kdWxhdG9yRGVtbyggc291cmNlU291bmRJbmRleFByb3BlcnR5ICk7XHJcbiAgICBzb3VuZE1hbmFnZXIuYWRkU291bmRHZW5lcmF0b3IoIGFtcGxpdHVkZU1vZHVsYXRvckRlbW8gKTtcclxuXHJcbiAgICAvLyBMRk8gZW5hYmxlZCBjb250cm9sXHJcbiAgICBjb25zdCBsZm9FbmFibGVkID0gbmV3IENoZWNrYm94KCBhbXBsaXR1ZGVNb2R1bGF0b3JEZW1vLmFtcGxpdHVkZU1vZHVsYXRvci5teUVuYWJsZWRQcm9wZXJ0eSwgbmV3IFRleHQoICdMRk8gRW5hYmxlZCcsIHsgZm9udDogTEFCRUxfRk9OVCB9ICksIHsgYm94V2lkdGg6IDE2IH0gKTtcclxuXHJcbiAgICAvLyBmcmVxdWVuY3kgY29udHJvbFxyXG4gICAgY29uc3QgZnJlcXVlbmN5Q29udHJvbEhCb3ggPSBuZXcgSEJveCgge1xyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIG5ldyBUZXh0KCAnRnJlcXVlbmN5OiAnLCB7IGZvbnQ6IExBQkVMX0ZPTlQgfSApLFxyXG4gICAgICAgIG5ldyBIU2xpZGVyKFxyXG4gICAgICAgICAgYW1wbGl0dWRlTW9kdWxhdG9yRGVtby5hbXBsaXR1ZGVNb2R1bGF0b3IuZnJlcXVlbmN5UHJvcGVydHksXHJcbiAgICAgICAgICBuZXcgUmFuZ2UoIDAuNSwgMjAgKVxyXG4gICAgICAgIClcclxuICAgICAgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGRlcHRoIGNvbnRyb2xcclxuICAgIGNvbnN0IGRlcHRoQ29udHJvbEhCb3ggPSBuZXcgSEJveCgge1xyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIG5ldyBUZXh0KCAnRGVwdGg6ICcsIHsgZm9udDogTEFCRUxfRk9OVCB9ICksXHJcbiAgICAgICAgbmV3IEhTbGlkZXIoXHJcbiAgICAgICAgICBhbXBsaXR1ZGVNb2R1bGF0b3JEZW1vLmFtcGxpdHVkZU1vZHVsYXRvci5kZXB0aFByb3BlcnR5LFxyXG4gICAgICAgICAgbmV3IFJhbmdlKCAwLCAxIClcclxuICAgICAgICApXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB3YXZlZm9ybSB0eXBlIHNlbGVjdG9yXHJcbiAgICBjb25zdCB3YXZlZm9ybVJhZGlvQnV0dG9uSXRlbXM6IEFxdWFSYWRpb0J1dHRvbkdyb3VwSXRlbTxPc2NpbGxhdG9yVHlwZT5bXSA9IFtcclxuICAgICAge1xyXG4gICAgICAgIGNyZWF0ZU5vZGU6ICggdGFuZGVtOiBUYW5kZW0gKSA9PiBuZXcgVGV4dCggJ1NpbmUnLCB7IGZvbnQ6IExBQkVMX0ZPTlQgfSApLFxyXG4gICAgICAgIHZhbHVlOiAnc2luZSdcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGNyZWF0ZU5vZGU6ICggdGFuZGVtOiBUYW5kZW0gKSA9PiBuZXcgVGV4dCggJ1NxdWFyZScsIHsgZm9udDogTEFCRUxfRk9OVCB9ICksXHJcbiAgICAgICAgdmFsdWU6ICdzcXVhcmUnXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBjcmVhdGVOb2RlOiAoIHRhbmRlbTogVGFuZGVtICkgPT4gbmV3IFRleHQoICdUcmlhbmdsZScsIHsgZm9udDogTEFCRUxfRk9OVCB9ICksXHJcbiAgICAgICAgdmFsdWU6ICd0cmlhbmdsZSdcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGNyZWF0ZU5vZGU6ICggdGFuZGVtOiBUYW5kZW0gKSA9PiBuZXcgVGV4dCggJ1Nhd3Rvb3RoJywgeyBmb250OiBMQUJFTF9GT05UIH0gKSxcclxuICAgICAgICB2YWx1ZTogJ3Nhd3Rvb3RoJ1xyXG4gICAgICB9XHJcbiAgICBdO1xyXG5cclxuICAgIGNvbnN0IHdhdmVmb3JtU2VsZWN0b3IgPSBuZXcgQXF1YVJhZGlvQnV0dG9uR3JvdXA8T3NjaWxsYXRvclR5cGU+KFxyXG4gICAgICBhbXBsaXR1ZGVNb2R1bGF0b3JEZW1vLmFtcGxpdHVkZU1vZHVsYXRvci53YXZlZm9ybVByb3BlcnR5LFxyXG4gICAgICB3YXZlZm9ybVJhZGlvQnV0dG9uSXRlbXNcclxuICAgICk7XHJcbiAgICBjb25zdCB3YXZlZm9ybVNlbGVjdG9yVkJveCA9IG5ldyBWQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbmV3IFRleHQoICdNb2R1bGF0aW9uIFdhdmVmb3JtOicsIHsgZm9udDogTEFCRUxfRk9OVCB9ICksXHJcbiAgICAgICAgd2F2ZWZvcm1TZWxlY3RvclxyXG4gICAgICBdLFxyXG4gICAgICBzcGFjaW5nOiA1XHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbml6ZTxBbXBsaXR1ZGVNb2R1bGF0b3JEZW1vTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBWQm94T3B0aW9ucz4oKSgge1xyXG4gICAgICBjaGlsZHJlbjogWyBzb3VuZEluZGV4U2VsZWN0b3JWQm94LCBsZm9FbmFibGVkLCBmcmVxdWVuY3lDb250cm9sSEJveCwgZGVwdGhDb250cm9sSEJveCwgd2F2ZWZvcm1TZWxlY3RvclZCb3ggXSxcclxuICAgICAgc3BhY2luZzogMTUsXHJcbiAgICAgIGFsaWduOiAnbGVmdCdcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApICk7XHJcbiAgfVxyXG59XHJcblxyXG50YW1iby5yZWdpc3RlciggJ0FtcGxpdHVkZU1vZHVsYXRvckRlbW9Ob2RlJywgQW1wbGl0dWRlTW9kdWxhdG9yRGVtb05vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgQW1wbGl0dWRlTW9kdWxhdG9yRGVtb05vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGNBQWMsTUFBTSwwQ0FBMEM7QUFDckUsT0FBT0MsS0FBSyxNQUFNLGdDQUFnQztBQUNsRCxPQUFPQyxTQUFTLE1BQTRCLDBDQUEwQztBQUN0RixPQUFPQyxRQUFRLE1BQU0sNENBQTRDO0FBQ2pFLFNBQVNDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQXFCLHNDQUFzQztBQUNwRixPQUFPQyxvQkFBb0IsTUFBb0MsK0NBQStDO0FBQzlHLE9BQU9DLFFBQVEsTUFBTSxtQ0FBbUM7QUFDeEQsT0FBT0MsT0FBTyxNQUFNLGtDQUFrQztBQUV0RCxPQUFPQyxZQUFZLE1BQU0sMEJBQTBCO0FBQ25ELE9BQU9DLEtBQUssTUFBTSxtQkFBbUI7QUFDckMsT0FBT0Msc0JBQXNCLE1BQU0sb0NBQW9DO0FBS3ZFO0FBQ0EsTUFBTUMsVUFBVSxHQUFHLElBQUlWLFFBQVEsQ0FBRSxFQUFHLENBQUM7QUFFckMsTUFBTVcsMEJBQTBCLFNBQVNSLElBQUksQ0FBQztFQUVyQ1MsV0FBV0EsQ0FBRUMsZUFBbUQsRUFBRztJQUV4RSxNQUFNQywyQkFBMkIs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