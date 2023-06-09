// Copyright 2014-2020, University of Colorado Boulder

/**
 * The main screen class for the 'Neuron' simulation.  This is where the main model and view instances are created and
 * inserted into the framework.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Screen from '../../../../joist/js/Screen.js';
import neuron from '../../neuron.js';
import NeuronClockModelAdapter from '../model/NeuronClockModelAdapter.js';
import NeuronModel from '../model/NeuronModel.js';
import NeuronScreenView from './NeuronScreenView.js';
class NeuronScreen extends Screen {
  constructor() {
    super(() => new NeuronClockModelAdapter(new NeuronModel()),
    // clock model adapter provides constant ticks to model
    model => new NeuronScreenView(model), {
      backgroundColorProperty: new Property('#ccfefa')
    });
  }
}
neuron.register('NeuronScreen', NeuronScreen);
export default NeuronScreen;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlbiIsIm5ldXJvbiIsIk5ldXJvbkNsb2NrTW9kZWxBZGFwdGVyIiwiTmV1cm9uTW9kZWwiLCJOZXVyb25TY3JlZW5WaWV3IiwiTmV1cm9uU2NyZWVuIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsImJhY2tncm91bmRDb2xvclByb3BlcnR5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJOZXVyb25TY3JlZW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhlIG1haW4gc2NyZWVuIGNsYXNzIGZvciB0aGUgJ05ldXJvbicgc2ltdWxhdGlvbi4gIFRoaXMgaXMgd2hlcmUgdGhlIG1haW4gbW9kZWwgYW5kIHZpZXcgaW5zdGFuY2VzIGFyZSBjcmVhdGVkIGFuZFxyXG4gKiBpbnNlcnRlZCBpbnRvIHRoZSBmcmFtZXdvcmsuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU2NyZWVuIGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlbi5qcyc7XHJcbmltcG9ydCBuZXVyb24gZnJvbSAnLi4vLi4vbmV1cm9uLmpzJztcclxuaW1wb3J0IE5ldXJvbkNsb2NrTW9kZWxBZGFwdGVyIGZyb20gJy4uL21vZGVsL05ldXJvbkNsb2NrTW9kZWxBZGFwdGVyLmpzJztcclxuaW1wb3J0IE5ldXJvbk1vZGVsIGZyb20gJy4uL21vZGVsL05ldXJvbk1vZGVsLmpzJztcclxuaW1wb3J0IE5ldXJvblNjcmVlblZpZXcgZnJvbSAnLi9OZXVyb25TY3JlZW5WaWV3LmpzJztcclxuXHJcbmNsYXNzIE5ldXJvblNjcmVlbiBleHRlbmRzIFNjcmVlbiB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoXHJcbiAgICAgICgpID0+IG5ldyBOZXVyb25DbG9ja01vZGVsQWRhcHRlciggbmV3IE5ldXJvbk1vZGVsKCkgKSwgLy8gY2xvY2sgbW9kZWwgYWRhcHRlciBwcm92aWRlcyBjb25zdGFudCB0aWNrcyB0byBtb2RlbFxyXG4gICAgICBtb2RlbCA9PiBuZXcgTmV1cm9uU2NyZWVuVmlldyggbW9kZWwgKSxcclxuICAgICAgeyBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCAnI2NjZmVmYScgKSB9XHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxubmV1cm9uLnJlZ2lzdGVyKCAnTmV1cm9uU2NyZWVuJywgTmV1cm9uU2NyZWVuICk7XHJcbmV4cG9ydCBkZWZhdWx0IE5ldXJvblNjcmVlbjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLE1BQU0sTUFBTSxnQ0FBZ0M7QUFDbkQsT0FBT0MsTUFBTSxNQUFNLGlCQUFpQjtBQUNwQyxPQUFPQyx1QkFBdUIsTUFBTSxxQ0FBcUM7QUFDekUsT0FBT0MsV0FBVyxNQUFNLHlCQUF5QjtBQUNqRCxPQUFPQyxnQkFBZ0IsTUFBTSx1QkFBdUI7QUFFcEQsTUFBTUMsWUFBWSxTQUFTTCxNQUFNLENBQUM7RUFFaENNLFdBQVdBLENBQUEsRUFBRztJQUNaLEtBQUssQ0FDSCxNQUFNLElBQUlKLHVCQUF1QixDQUFFLElBQUlDLFdBQVcsQ0FBQyxDQUFFLENBQUM7SUFBRTtJQUN4REksS0FBSyxJQUFJLElBQUlILGdCQUFnQixDQUFFRyxLQUFNLENBQUMsRUFDdEM7TUFBRUMsdUJBQXVCLEVBQUUsSUFBSVQsUUFBUSxDQUFFLFNBQVU7SUFBRSxDQUN2RCxDQUFDO0VBQ0g7QUFDRjtBQUVBRSxNQUFNLENBQUNRLFFBQVEsQ0FBRSxjQUFjLEVBQUVKLFlBQWEsQ0FBQztBQUMvQyxlQUFlQSxZQUFZIn0=