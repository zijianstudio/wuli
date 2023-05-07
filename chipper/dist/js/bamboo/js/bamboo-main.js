// Copyright 2020-2022, University of Colorado Boulder

/**
 * Main file for the Bamboo library demo.
 */

import Property from '../../axon/js/Property.js';
import Screen from '../../joist/js/Screen.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import BambooDemoScreenView from './demo/BambooDemoScreenView.js';
import BambooStrings from './BambooStrings.js';
import Tandem from '../../tandem/js/Tandem.js';
const simOptions = {
  credits: {
    leadDesign: 'PhET'
  }
};
class Model {
  reset() {/* nothing to do */}
}
simLauncher.launch(() => {
  new Sim(BambooStrings.bamboo.titleStringProperty, [new Screen(() => new Model(), () => new BambooDemoScreenView(), {
    name: new Property('Bamboo Demo'),
    backgroundColorProperty: new Property('#e4fcf4'),
    tandem: Tandem.OPT_OUT
  })], simOptions).start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlbiIsIlNpbSIsInNpbUxhdW5jaGVyIiwiQmFtYm9vRGVtb1NjcmVlblZpZXciLCJCYW1ib29TdHJpbmdzIiwiVGFuZGVtIiwic2ltT3B0aW9ucyIsImNyZWRpdHMiLCJsZWFkRGVzaWduIiwiTW9kZWwiLCJyZXNldCIsImxhdW5jaCIsImJhbWJvbyIsInRpdGxlU3RyaW5nUHJvcGVydHkiLCJuYW1lIiwiYmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJ0YW5kZW0iLCJPUFRfT1VUIiwic3RhcnQiXSwic291cmNlcyI6WyJiYW1ib28tbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNYWluIGZpbGUgZm9yIHRoZSBCYW1ib28gbGlicmFyeSBkZW1vLlxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFNjcmVlbiBmcm9tICcuLi8uLi9qb2lzdC9qcy9TY3JlZW4uanMnO1xyXG5pbXBvcnQgU2ltLCB7IFNpbU9wdGlvbnMgfSBmcm9tICcuLi8uLi9qb2lzdC9qcy9TaW0uanMnO1xyXG5pbXBvcnQgc2ltTGF1bmNoZXIgZnJvbSAnLi4vLi4vam9pc3QvanMvc2ltTGF1bmNoZXIuanMnO1xyXG5pbXBvcnQgQmFtYm9vRGVtb1NjcmVlblZpZXcgZnJvbSAnLi9kZW1vL0JhbWJvb0RlbW9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IEJhbWJvb1N0cmluZ3MgZnJvbSAnLi9CYW1ib29TdHJpbmdzLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuXHJcbmNvbnN0IHNpbU9wdGlvbnM6IFNpbU9wdGlvbnMgPSB7XHJcbiAgY3JlZGl0czoge1xyXG4gICAgbGVhZERlc2lnbjogJ1BoRVQnXHJcbiAgfVxyXG59O1xyXG5cclxuY2xhc3MgTW9kZWwge1xyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHsgLyogbm90aGluZyB0byBkbyAqLyB9XHJcbn1cclxuXHJcbnNpbUxhdW5jaGVyLmxhdW5jaCggKCkgPT4ge1xyXG4gIG5ldyBTaW0oIEJhbWJvb1N0cmluZ3MuYmFtYm9vLnRpdGxlU3RyaW5nUHJvcGVydHksIFtcclxuICAgIG5ldyBTY3JlZW4oICgpID0+IG5ldyBNb2RlbCgpLCAoKSA9PiBuZXcgQmFtYm9vRGVtb1NjcmVlblZpZXcoKSwge1xyXG4gICAgICAgIG5hbWU6IG5ldyBQcm9wZXJ0eSggJ0JhbWJvbyBEZW1vJyApLFxyXG4gICAgICAgIGJhY2tncm91bmRDb2xvclByb3BlcnR5OiBuZXcgUHJvcGVydHkoICcjZTRmY2Y0JyApLFxyXG4gICAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcclxuICAgICAgfVxyXG4gICAgKVxyXG4gIF0sIHNpbU9wdGlvbnMgKS5zdGFydCgpO1xyXG59ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLDJCQUEyQjtBQUNoRCxPQUFPQyxNQUFNLE1BQU0sMEJBQTBCO0FBQzdDLE9BQU9DLEdBQUcsTUFBc0IsdUJBQXVCO0FBQ3ZELE9BQU9DLFdBQVcsTUFBTSwrQkFBK0I7QUFDdkQsT0FBT0Msb0JBQW9CLE1BQU0sZ0NBQWdDO0FBQ2pFLE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7QUFDOUMsT0FBT0MsTUFBTSxNQUFNLDJCQUEyQjtBQUU5QyxNQUFNQyxVQUFzQixHQUFHO0VBQzdCQyxPQUFPLEVBQUU7SUFDUEMsVUFBVSxFQUFFO0VBQ2Q7QUFDRixDQUFDO0FBRUQsTUFBTUMsS0FBSyxDQUFDO0VBQ0hDLEtBQUtBLENBQUEsRUFBUyxDQUFFO0FBQ3pCO0FBRUFSLFdBQVcsQ0FBQ1MsTUFBTSxDQUFFLE1BQU07RUFDeEIsSUFBSVYsR0FBRyxDQUFFRyxhQUFhLENBQUNRLE1BQU0sQ0FBQ0MsbUJBQW1CLEVBQUUsQ0FDakQsSUFBSWIsTUFBTSxDQUFFLE1BQU0sSUFBSVMsS0FBSyxDQUFDLENBQUMsRUFBRSxNQUFNLElBQUlOLG9CQUFvQixDQUFDLENBQUMsRUFBRTtJQUM3RFcsSUFBSSxFQUFFLElBQUlmLFFBQVEsQ0FBRSxhQUFjLENBQUM7SUFDbkNnQix1QkFBdUIsRUFBRSxJQUFJaEIsUUFBUSxDQUFFLFNBQVUsQ0FBQztJQUNsRGlCLE1BQU0sRUFBRVgsTUFBTSxDQUFDWTtFQUNqQixDQUNGLENBQUMsQ0FDRixFQUFFWCxVQUFXLENBQUMsQ0FBQ1ksS0FBSyxDQUFDLENBQUM7QUFDekIsQ0FBRSxDQUFDIn0=