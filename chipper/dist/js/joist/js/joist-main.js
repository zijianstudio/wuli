// Copyright 2015-2022, University of Colorado Boulder

/**
 * Main file for the Joist demo.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../axon/js/Property.js';
import Tandem from '../../tandem/js/Tandem.js';
import DialogsScreenView from './demo/DialogsScreenView.js';
import JoistStrings from './JoistStrings.js';
import Screen from './Screen.js';
import Sim from './Sim.js';
import simLauncher from './simLauncher.js';
const joistTitleStringProperty = JoistStrings.joist.titleStringProperty;
const simOptions = {
  credits: {
    leadDesign: 'PhET'
  }
};
class DemoModel {
  reset() {/* nothing to do */}
}
simLauncher.launch(() => {
  const dialogsScreenTandem = Tandem.ROOT.createTandem('dialogsScreen');
  const screens = [new Screen(() => new DemoModel(), () => new DialogsScreenView({
    tandem: dialogsScreenTandem.createTandem('view')
  }), {
    name: new Property('Dialogs'),
    backgroundColorProperty: new Property('white'),
    tandem: Tandem.OPT_OUT
  })];
  new Sim(joistTitleStringProperty, screens, simOptions).start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlRhbmRlbSIsIkRpYWxvZ3NTY3JlZW5WaWV3IiwiSm9pc3RTdHJpbmdzIiwiU2NyZWVuIiwiU2ltIiwic2ltTGF1bmNoZXIiLCJqb2lzdFRpdGxlU3RyaW5nUHJvcGVydHkiLCJqb2lzdCIsInRpdGxlU3RyaW5nUHJvcGVydHkiLCJzaW1PcHRpb25zIiwiY3JlZGl0cyIsImxlYWREZXNpZ24iLCJEZW1vTW9kZWwiLCJyZXNldCIsImxhdW5jaCIsImRpYWxvZ3NTY3JlZW5UYW5kZW0iLCJST09UIiwiY3JlYXRlVGFuZGVtIiwic2NyZWVucyIsInRhbmRlbSIsIm5hbWUiLCJiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsIk9QVF9PVVQiLCJzdGFydCJdLCJzb3VyY2VzIjpbImpvaXN0LW1haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFpbiBmaWxlIGZvciB0aGUgSm9pc3QgZGVtby5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBEaWFsb2dzU2NyZWVuVmlldyBmcm9tICcuL2RlbW8vRGlhbG9nc1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgSm9pc3RTdHJpbmdzIGZyb20gJy4vSm9pc3RTdHJpbmdzLmpzJztcclxuaW1wb3J0IFNjcmVlbiBmcm9tICcuL1NjcmVlbi5qcyc7XHJcbmltcG9ydCBTaW0sIHsgU2ltT3B0aW9ucyB9IGZyb20gJy4vU2ltLmpzJztcclxuaW1wb3J0IHNpbUxhdW5jaGVyIGZyb20gJy4vc2ltTGF1bmNoZXIuanMnO1xyXG5cclxuY29uc3Qgam9pc3RUaXRsZVN0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmpvaXN0LnRpdGxlU3RyaW5nUHJvcGVydHk7XHJcblxyXG5jb25zdCBzaW1PcHRpb25zOiBTaW1PcHRpb25zID0ge1xyXG4gIGNyZWRpdHM6IHtcclxuICAgIGxlYWREZXNpZ246ICdQaEVUJ1xyXG4gIH1cclxufTtcclxuXHJcbmNsYXNzIERlbW9Nb2RlbCB7XHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQgeyAvKiBub3RoaW5nIHRvIGRvICovIH1cclxufVxyXG5cclxuc2ltTGF1bmNoZXIubGF1bmNoKCAoKSA9PiB7XHJcblxyXG4gIGNvbnN0IGRpYWxvZ3NTY3JlZW5UYW5kZW0gPSBUYW5kZW0uUk9PVC5jcmVhdGVUYW5kZW0oICdkaWFsb2dzU2NyZWVuJyApO1xyXG5cclxuICBjb25zdCBzY3JlZW5zID0gW1xyXG4gICAgbmV3IFNjcmVlbihcclxuICAgICAgKCAoKSA9PiBuZXcgRGVtb01vZGVsKCkgKSxcclxuICAgICAgKCAoKSA9PiBuZXcgRGlhbG9nc1NjcmVlblZpZXcoIHsgdGFuZGVtOiBkaWFsb2dzU2NyZWVuVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZpZXcnICkgfSApICksIHtcclxuICAgICAgICBuYW1lOiBuZXcgUHJvcGVydHkoICdEaWFsb2dzJyApLFxyXG4gICAgICAgIGJhY2tncm91bmRDb2xvclByb3BlcnR5OiBuZXcgUHJvcGVydHkoICd3aGl0ZScgKSxcclxuICAgICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXHJcbiAgICAgIH0gKVxyXG4gIF07XHJcblxyXG4gIG5ldyBTaW0oIGpvaXN0VGl0bGVTdHJpbmdQcm9wZXJ0eSwgc2NyZWVucywgc2ltT3B0aW9ucyApLnN0YXJ0KCk7XHJcbn0gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLDJCQUEyQjtBQUNoRCxPQUFPQyxNQUFNLE1BQU0sMkJBQTJCO0FBQzlDLE9BQU9DLGlCQUFpQixNQUFNLDZCQUE2QjtBQUMzRCxPQUFPQyxZQUFZLE1BQU0sbUJBQW1CO0FBQzVDLE9BQU9DLE1BQU0sTUFBTSxhQUFhO0FBQ2hDLE9BQU9DLEdBQUcsTUFBc0IsVUFBVTtBQUMxQyxPQUFPQyxXQUFXLE1BQU0sa0JBQWtCO0FBRTFDLE1BQU1DLHdCQUF3QixHQUFHSixZQUFZLENBQUNLLEtBQUssQ0FBQ0MsbUJBQW1CO0FBRXZFLE1BQU1DLFVBQXNCLEdBQUc7RUFDN0JDLE9BQU8sRUFBRTtJQUNQQyxVQUFVLEVBQUU7RUFDZDtBQUNGLENBQUM7QUFFRCxNQUFNQyxTQUFTLENBQUM7RUFDUEMsS0FBS0EsQ0FBQSxFQUFTLENBQUU7QUFDekI7QUFFQVIsV0FBVyxDQUFDUyxNQUFNLENBQUUsTUFBTTtFQUV4QixNQUFNQyxtQkFBbUIsR0FBR2YsTUFBTSxDQUFDZ0IsSUFBSSxDQUFDQyxZQUFZLENBQUUsZUFBZ0IsQ0FBQztFQUV2RSxNQUFNQyxPQUFPLEdBQUcsQ0FDZCxJQUFJZixNQUFNLENBQ04sTUFBTSxJQUFJUyxTQUFTLENBQUMsQ0FBQyxFQUNyQixNQUFNLElBQUlYLGlCQUFpQixDQUFFO0lBQUVrQixNQUFNLEVBQUVKLG1CQUFtQixDQUFDRSxZQUFZLENBQUUsTUFBTztFQUFFLENBQUUsQ0FBQyxFQUFJO0lBQ3pGRyxJQUFJLEVBQUUsSUFBSXJCLFFBQVEsQ0FBRSxTQUFVLENBQUM7SUFDL0JzQix1QkFBdUIsRUFBRSxJQUFJdEIsUUFBUSxDQUFFLE9BQVEsQ0FBQztJQUNoRG9CLE1BQU0sRUFBRW5CLE1BQU0sQ0FBQ3NCO0VBQ2pCLENBQUUsQ0FBQyxDQUNOO0VBRUQsSUFBSWxCLEdBQUcsQ0FBRUUsd0JBQXdCLEVBQUVZLE9BQU8sRUFBRVQsVUFBVyxDQUFDLENBQUNjLEtBQUssQ0FBQyxDQUFDO0FBQ2xFLENBQUUsQ0FBQyJ9