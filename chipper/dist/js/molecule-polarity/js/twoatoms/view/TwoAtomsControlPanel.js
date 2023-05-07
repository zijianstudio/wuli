// Copyright 2021-2022, University of Colorado Boulder

/**
 * TwoAtomsControlPanel is the control panel in the 'Two Atoms' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import EFieldControl from '../../common/view/EFieldControl.js';
import MPControlPanel from '../../common/view/MPControlPanel.js';
import SurfaceControl from '../../common/view/SurfaceControl.js';
import moleculePolarity from '../../moleculePolarity.js';
import TwoAtomsViewControls from './TwoAtomsViewControls.js';
export default class TwoAtomsControlPanel extends MPControlPanel {
  constructor(viewProperties, eFieldEnabledProperty, providedOptions) {
    const options = providedOptions;
    const subPanels = [new TwoAtomsViewControls(viewProperties, {
      tandem: options.tandem.createTandem('viewControls')
    }), new SurfaceControl(viewProperties.surfaceTypeProperty, {
      tandem: options.tandem.createTandem('surfaceControl')
    }), new EFieldControl(eFieldEnabledProperty, {
      tandem: options.tandem.createTandem('eFieldControl')
    })];
    super(subPanels, options);
  }
}
moleculePolarity.register('TwoAtomsControlPanel', TwoAtomsControlPanel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFRmllbGRDb250cm9sIiwiTVBDb250cm9sUGFuZWwiLCJTdXJmYWNlQ29udHJvbCIsIm1vbGVjdWxlUG9sYXJpdHkiLCJUd29BdG9tc1ZpZXdDb250cm9scyIsIlR3b0F0b21zQ29udHJvbFBhbmVsIiwiY29uc3RydWN0b3IiLCJ2aWV3UHJvcGVydGllcyIsImVGaWVsZEVuYWJsZWRQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJzdWJQYW5lbHMiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJzdXJmYWNlVHlwZVByb3BlcnR5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJUd29BdG9tc0NvbnRyb2xQYW5lbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUd29BdG9tc0NvbnRyb2xQYW5lbCBpcyB0aGUgY29udHJvbCBwYW5lbCBpbiB0aGUgJ1R3byBBdG9tcycgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgRUZpZWxkQ29udHJvbCBmcm9tICcuLi8uLi9jb21tb24vdmlldy9FRmllbGRDb250cm9sLmpzJztcclxuaW1wb3J0IE1QQ29udHJvbFBhbmVsLCB7IE1QQ29udHJvbFBhbmVsT3B0aW9ucyB9IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L01QQ29udHJvbFBhbmVsLmpzJztcclxuaW1wb3J0IFN1cmZhY2VDb250cm9sIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1N1cmZhY2VDb250cm9sLmpzJztcclxuaW1wb3J0IG1vbGVjdWxlUG9sYXJpdHkgZnJvbSAnLi4vLi4vbW9sZWN1bGVQb2xhcml0eS5qcyc7XHJcbmltcG9ydCBUd29BdG9tc1ZpZXdDb250cm9scyBmcm9tICcuL1R3b0F0b21zVmlld0NvbnRyb2xzLmpzJztcclxuaW1wb3J0IFR3b0F0b21zVmlld1Byb3BlcnRpZXMgZnJvbSAnLi9Ud29BdG9tc1ZpZXdQcm9wZXJ0aWVzLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBUd29BdG9tc0NvbnRyb2xQYW5lbE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxNUENvbnRyb2xQYW5lbE9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFR3b0F0b21zQ29udHJvbFBhbmVsIGV4dGVuZHMgTVBDb250cm9sUGFuZWwge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHZpZXdQcm9wZXJ0aWVzOiBUd29BdG9tc1ZpZXdQcm9wZXJ0aWVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgZUZpZWxkRW5hYmxlZFByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPixcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9uczogVHdvQXRvbXNDb250cm9sUGFuZWxPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBwcm92aWRlZE9wdGlvbnM7XHJcblxyXG4gICAgY29uc3Qgc3ViUGFuZWxzID0gW1xyXG4gICAgICBuZXcgVHdvQXRvbXNWaWV3Q29udHJvbHMoIHZpZXdQcm9wZXJ0aWVzLCB7XHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd2aWV3Q29udHJvbHMnIClcclxuICAgICAgfSApLFxyXG4gICAgICBuZXcgU3VyZmFjZUNvbnRyb2woIHZpZXdQcm9wZXJ0aWVzLnN1cmZhY2VUeXBlUHJvcGVydHksIHtcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N1cmZhY2VDb250cm9sJyApXHJcbiAgICAgIH0gKSxcclxuICAgICAgbmV3IEVGaWVsZENvbnRyb2woIGVGaWVsZEVuYWJsZWRQcm9wZXJ0eSwge1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZUZpZWxkQ29udHJvbCcgKVxyXG4gICAgICB9IClcclxuICAgIF07XHJcblxyXG4gICAgc3VwZXIoIHN1YlBhbmVscywgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxubW9sZWN1bGVQb2xhcml0eS5yZWdpc3RlciggJ1R3b0F0b21zQ29udHJvbFBhbmVsJywgVHdvQXRvbXNDb250cm9sUGFuZWwgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBS0EsT0FBT0EsYUFBYSxNQUFNLG9DQUFvQztBQUM5RCxPQUFPQyxjQUFjLE1BQWlDLHFDQUFxQztBQUMzRixPQUFPQyxjQUFjLE1BQU0scUNBQXFDO0FBQ2hFLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyxvQkFBb0IsTUFBTSwyQkFBMkI7QUFPNUQsZUFBZSxNQUFNQyxvQkFBb0IsU0FBU0osY0FBYyxDQUFDO0VBRXhESyxXQUFXQSxDQUFFQyxjQUFzQyxFQUN0Q0MscUJBQXdDLEVBQ3hDQyxlQUE0QyxFQUFHO0lBRWpFLE1BQU1DLE9BQU8sR0FBR0QsZUFBZTtJQUUvQixNQUFNRSxTQUFTLEdBQUcsQ0FDaEIsSUFBSVAsb0JBQW9CLENBQUVHLGNBQWMsRUFBRTtNQUN4Q0ssTUFBTSxFQUFFRixPQUFPLENBQUNFLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLGNBQWU7SUFDdEQsQ0FBRSxDQUFDLEVBQ0gsSUFBSVgsY0FBYyxDQUFFSyxjQUFjLENBQUNPLG1CQUFtQixFQUFFO01BQ3RERixNQUFNLEVBQUVGLE9BQU8sQ0FBQ0UsTUFBTSxDQUFDQyxZQUFZLENBQUUsZ0JBQWlCO0lBQ3hELENBQUUsQ0FBQyxFQUNILElBQUliLGFBQWEsQ0FBRVEscUJBQXFCLEVBQUU7TUFDeENJLE1BQU0sRUFBRUYsT0FBTyxDQUFDRSxNQUFNLENBQUNDLFlBQVksQ0FBRSxlQUFnQjtJQUN2RCxDQUFFLENBQUMsQ0FDSjtJQUVELEtBQUssQ0FBRUYsU0FBUyxFQUFFRCxPQUFRLENBQUM7RUFDN0I7QUFDRjtBQUVBUCxnQkFBZ0IsQ0FBQ1ksUUFBUSxDQUFFLHNCQUFzQixFQUFFVixvQkFBcUIsQ0FBQyJ9