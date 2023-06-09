// Copyright 2022, University of Colorado Boulder

/**
 * Main file for the nitroglycerin library demo.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../axon/js/Property.js';
import Screen from '../../joist/js/Screen.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import { Color } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import MoleculesScreenView from './demo/MoleculesScreenView.js';
import NitroglycerinStrings from './NitroglycerinStrings.js';
const titleStringProperty = NitroglycerinStrings.nitroglycerin.titleStringProperty;
class Model {
  reset() {/* nothing to do */}
}
simLauncher.launch(() => {
  const screens = [new Screen(() => new Model(), () => new MoleculesScreenView(), {
    name: new Property('Molecules'),
    backgroundColorProperty: new Property(Color.grayColor(90)),
    tandem: Tandem.OPT_OUT
  })];
  const simOptions = {
    credits: {
      leadDesign: 'PhET'
    }
  };
  const sim = new Sim(titleStringProperty, screens, simOptions);
  sim.start();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlbiIsIlNpbSIsInNpbUxhdW5jaGVyIiwiQ29sb3IiLCJUYW5kZW0iLCJNb2xlY3VsZXNTY3JlZW5WaWV3IiwiTml0cm9nbHljZXJpblN0cmluZ3MiLCJ0aXRsZVN0cmluZ1Byb3BlcnR5Iiwibml0cm9nbHljZXJpbiIsIk1vZGVsIiwicmVzZXQiLCJsYXVuY2giLCJzY3JlZW5zIiwibmFtZSIsImJhY2tncm91bmRDb2xvclByb3BlcnR5IiwiZ3JheUNvbG9yIiwidGFuZGVtIiwiT1BUX09VVCIsInNpbU9wdGlvbnMiLCJjcmVkaXRzIiwibGVhZERlc2lnbiIsInNpbSIsInN0YXJ0Il0sInNvdXJjZXMiOlsibml0cm9nbHljZXJpbi1tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNYWluIGZpbGUgZm9yIHRoZSBuaXRyb2dseWNlcmluIGxpYnJhcnkgZGVtby5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBTY3JlZW4gZnJvbSAnLi4vLi4vam9pc3QvanMvU2NyZWVuLmpzJztcclxuaW1wb3J0IFNpbSwgeyBTaW1PcHRpb25zIH0gZnJvbSAnLi4vLi4vam9pc3QvanMvU2ltLmpzJztcclxuaW1wb3J0IHNpbUxhdW5jaGVyIGZyb20gJy4uLy4uL2pvaXN0L2pzL3NpbUxhdW5jaGVyLmpzJztcclxuaW1wb3J0IHsgQ29sb3IgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgTW9sZWN1bGVzU2NyZWVuVmlldyBmcm9tICcuL2RlbW8vTW9sZWN1bGVzU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBOaXRyb2dseWNlcmluU3RyaW5ncyBmcm9tICcuL05pdHJvZ2x5Y2VyaW5TdHJpbmdzLmpzJztcclxuXHJcbmNvbnN0IHRpdGxlU3RyaW5nUHJvcGVydHkgPSBOaXRyb2dseWNlcmluU3RyaW5ncy5uaXRyb2dseWNlcmluLnRpdGxlU3RyaW5nUHJvcGVydHk7XHJcblxyXG5jbGFzcyBNb2RlbCB7XHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQgeyAvKiBub3RoaW5nIHRvIGRvICovIH1cclxufVxyXG5cclxuc2ltTGF1bmNoZXIubGF1bmNoKCAoKSA9PiB7XHJcblxyXG4gIGNvbnN0IHNjcmVlbnMgPSBbXHJcbiAgICBuZXcgU2NyZWVuKFxyXG4gICAgICAoKSA9PiBuZXcgTW9kZWwoKSxcclxuICAgICAgKCkgPT4gbmV3IE1vbGVjdWxlc1NjcmVlblZpZXcoKSwge1xyXG4gICAgICAgIG5hbWU6IG5ldyBQcm9wZXJ0eSggJ01vbGVjdWxlcycgKSxcclxuICAgICAgICBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCBDb2xvci5ncmF5Q29sb3IoIDkwICkgKSxcclxuICAgICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXHJcbiAgICAgIH0gKSBdO1xyXG5cclxuICBjb25zdCBzaW1PcHRpb25zOiBTaW1PcHRpb25zID0ge1xyXG4gICAgY3JlZGl0czoge1xyXG4gICAgICBsZWFkRGVzaWduOiAnUGhFVCdcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBjb25zdCBzaW0gPSBuZXcgU2ltKCB0aXRsZVN0cmluZ1Byb3BlcnR5LCBzY3JlZW5zLCBzaW1PcHRpb25zICk7XHJcbiAgc2ltLnN0YXJ0KCk7XHJcbn0gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLDJCQUEyQjtBQUNoRCxPQUFPQyxNQUFNLE1BQU0sMEJBQTBCO0FBQzdDLE9BQU9DLEdBQUcsTUFBc0IsdUJBQXVCO0FBQ3ZELE9BQU9DLFdBQVcsTUFBTSwrQkFBK0I7QUFDdkQsU0FBU0MsS0FBSyxRQUFRLDZCQUE2QjtBQUNuRCxPQUFPQyxNQUFNLE1BQU0sMkJBQTJCO0FBQzlDLE9BQU9DLG1CQUFtQixNQUFNLCtCQUErQjtBQUMvRCxPQUFPQyxvQkFBb0IsTUFBTSwyQkFBMkI7QUFFNUQsTUFBTUMsbUJBQW1CLEdBQUdELG9CQUFvQixDQUFDRSxhQUFhLENBQUNELG1CQUFtQjtBQUVsRixNQUFNRSxLQUFLLENBQUM7RUFDSEMsS0FBS0EsQ0FBQSxFQUFTLENBQUU7QUFDekI7QUFFQVIsV0FBVyxDQUFDUyxNQUFNLENBQUUsTUFBTTtFQUV4QixNQUFNQyxPQUFPLEdBQUcsQ0FDZCxJQUFJWixNQUFNLENBQ1IsTUFBTSxJQUFJUyxLQUFLLENBQUMsQ0FBQyxFQUNqQixNQUFNLElBQUlKLG1CQUFtQixDQUFDLENBQUMsRUFBRTtJQUMvQlEsSUFBSSxFQUFFLElBQUlkLFFBQVEsQ0FBRSxXQUFZLENBQUM7SUFDakNlLHVCQUF1QixFQUFFLElBQUlmLFFBQVEsQ0FBRUksS0FBSyxDQUFDWSxTQUFTLENBQUUsRUFBRyxDQUFFLENBQUM7SUFDOURDLE1BQU0sRUFBRVosTUFBTSxDQUFDYTtFQUNqQixDQUFFLENBQUMsQ0FBRTtFQUVULE1BQU1DLFVBQXNCLEdBQUc7SUFDN0JDLE9BQU8sRUFBRTtNQUNQQyxVQUFVLEVBQUU7SUFDZDtFQUNGLENBQUM7RUFFRCxNQUFNQyxHQUFHLEdBQUcsSUFBSXBCLEdBQUcsQ0FBRU0sbUJBQW1CLEVBQUVLLE9BQU8sRUFBRU0sVUFBVyxDQUFDO0VBQy9ERyxHQUFHLENBQUNDLEtBQUssQ0FBQyxDQUFDO0FBQ2IsQ0FBRSxDQUFDIn0=