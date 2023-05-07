// Copyright 2013-2023, University of Colorado Boulder

/**
 * View for the 'Point-Slope' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import GraphControlPanel from '../../common/view/GraphControlPanel.js';
import LineFormsScreenView from '../../common/view/LineFormsScreenView.js';
import LineFormsViewProperties from '../../common/view/LineFormsViewProperties.js';
import graphingLines from '../../graphingLines.js';
import PointSlopeGraphNode from './PointSlopeGraphNode.js';
import PointSlopeEquationAccordionBox from './PointSlopeEquationAccordionBox.js';
export default class PointSlopeScreenView extends LineFormsScreenView {
  constructor(model, tandem) {
    const viewProperties = new LineFormsViewProperties();
    const graphNode = new PointSlopeGraphNode(model, viewProperties);
    const graphControlPanel = new GraphControlPanel(viewProperties.gridVisibleProperty, viewProperties.slopeToolVisibleProperty, model.standardLines);
    const equationAccordionBox = new PointSlopeEquationAccordionBox(model, viewProperties.interactiveEquationVisibleProperty, tandem.createTandem('equationAccordionBox'));
    super(model, viewProperties, graphNode, graphControlPanel, equationAccordionBox, tandem);
  }
}
graphingLines.register('PointSlopeScreenView', PointSlopeScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJHcmFwaENvbnRyb2xQYW5lbCIsIkxpbmVGb3Jtc1NjcmVlblZpZXciLCJMaW5lRm9ybXNWaWV3UHJvcGVydGllcyIsImdyYXBoaW5nTGluZXMiLCJQb2ludFNsb3BlR3JhcGhOb2RlIiwiUG9pbnRTbG9wZUVxdWF0aW9uQWNjb3JkaW9uQm94IiwiUG9pbnRTbG9wZVNjcmVlblZpZXciLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwidGFuZGVtIiwidmlld1Byb3BlcnRpZXMiLCJncmFwaE5vZGUiLCJncmFwaENvbnRyb2xQYW5lbCIsImdyaWRWaXNpYmxlUHJvcGVydHkiLCJzbG9wZVRvb2xWaXNpYmxlUHJvcGVydHkiLCJzdGFuZGFyZExpbmVzIiwiZXF1YXRpb25BY2NvcmRpb25Cb3giLCJpbnRlcmFjdGl2ZUVxdWF0aW9uVmlzaWJsZVByb3BlcnR5IiwiY3JlYXRlVGFuZGVtIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQb2ludFNsb3BlU2NyZWVuVmlldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IGZvciB0aGUgJ1BvaW50LVNsb3BlJyBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEdyYXBoQ29udHJvbFBhbmVsIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0dyYXBoQ29udHJvbFBhbmVsLmpzJztcclxuaW1wb3J0IExpbmVGb3Jtc1NjcmVlblZpZXcgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvTGluZUZvcm1zU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBMaW5lRm9ybXNWaWV3UHJvcGVydGllcyBmcm9tICcuLi8uLi9jb21tb24vdmlldy9MaW5lRm9ybXNWaWV3UHJvcGVydGllcy5qcyc7XHJcbmltcG9ydCBncmFwaGluZ0xpbmVzIGZyb20gJy4uLy4uL2dyYXBoaW5nTGluZXMuanMnO1xyXG5pbXBvcnQgUG9pbnRTbG9wZUdyYXBoTm9kZSBmcm9tICcuL1BvaW50U2xvcGVHcmFwaE5vZGUuanMnO1xyXG5pbXBvcnQgUG9pbnRTbG9wZU1vZGVsIGZyb20gJy4uL21vZGVsL1BvaW50U2xvcGVNb2RlbC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBQb2ludFNsb3BlRXF1YXRpb25BY2NvcmRpb25Cb3ggZnJvbSAnLi9Qb2ludFNsb3BlRXF1YXRpb25BY2NvcmRpb25Cb3guanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUG9pbnRTbG9wZVNjcmVlblZpZXcgZXh0ZW5kcyBMaW5lRm9ybXNTY3JlZW5WaWV3IHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbDogUG9pbnRTbG9wZU1vZGVsLCB0YW5kZW06IFRhbmRlbSApIHtcclxuXHJcbiAgICBjb25zdCB2aWV3UHJvcGVydGllcyA9IG5ldyBMaW5lRm9ybXNWaWV3UHJvcGVydGllcygpO1xyXG5cclxuICAgIGNvbnN0IGdyYXBoTm9kZSA9IG5ldyBQb2ludFNsb3BlR3JhcGhOb2RlKCBtb2RlbCwgdmlld1Byb3BlcnRpZXMgKTtcclxuXHJcbiAgICBjb25zdCBncmFwaENvbnRyb2xQYW5lbCA9IG5ldyBHcmFwaENvbnRyb2xQYW5lbCggdmlld1Byb3BlcnRpZXMuZ3JpZFZpc2libGVQcm9wZXJ0eSxcclxuICAgICAgdmlld1Byb3BlcnRpZXMuc2xvcGVUb29sVmlzaWJsZVByb3BlcnR5LCBtb2RlbC5zdGFuZGFyZExpbmVzICk7XHJcblxyXG4gICAgY29uc3QgZXF1YXRpb25BY2NvcmRpb25Cb3ggPSBuZXcgUG9pbnRTbG9wZUVxdWF0aW9uQWNjb3JkaW9uQm94KCBtb2RlbCxcclxuICAgICAgdmlld1Byb3BlcnRpZXMuaW50ZXJhY3RpdmVFcXVhdGlvblZpc2libGVQcm9wZXJ0eSwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VxdWF0aW9uQWNjb3JkaW9uQm94JyApICk7XHJcblxyXG4gICAgc3VwZXIoIG1vZGVsLCB2aWV3UHJvcGVydGllcywgZ3JhcGhOb2RlLCBncmFwaENvbnRyb2xQYW5lbCwgZXF1YXRpb25BY2NvcmRpb25Cb3gsIHRhbmRlbSApO1xyXG4gIH1cclxufVxyXG5cclxuZ3JhcGhpbmdMaW5lcy5yZWdpc3RlciggJ1BvaW50U2xvcGVTY3JlZW5WaWV3JywgUG9pbnRTbG9wZVNjcmVlblZpZXcgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsaUJBQWlCLE1BQU0sd0NBQXdDO0FBQ3RFLE9BQU9DLG1CQUFtQixNQUFNLDBDQUEwQztBQUMxRSxPQUFPQyx1QkFBdUIsTUFBTSw4Q0FBOEM7QUFDbEYsT0FBT0MsYUFBYSxNQUFNLHdCQUF3QjtBQUNsRCxPQUFPQyxtQkFBbUIsTUFBTSwwQkFBMEI7QUFHMUQsT0FBT0MsOEJBQThCLE1BQU0scUNBQXFDO0FBRWhGLGVBQWUsTUFBTUMsb0JBQW9CLFNBQVNMLG1CQUFtQixDQUFDO0VBRTdETSxXQUFXQSxDQUFFQyxLQUFzQixFQUFFQyxNQUFjLEVBQUc7SUFFM0QsTUFBTUMsY0FBYyxHQUFHLElBQUlSLHVCQUF1QixDQUFDLENBQUM7SUFFcEQsTUFBTVMsU0FBUyxHQUFHLElBQUlQLG1CQUFtQixDQUFFSSxLQUFLLEVBQUVFLGNBQWUsQ0FBQztJQUVsRSxNQUFNRSxpQkFBaUIsR0FBRyxJQUFJWixpQkFBaUIsQ0FBRVUsY0FBYyxDQUFDRyxtQkFBbUIsRUFDakZILGNBQWMsQ0FBQ0ksd0JBQXdCLEVBQUVOLEtBQUssQ0FBQ08sYUFBYyxDQUFDO0lBRWhFLE1BQU1DLG9CQUFvQixHQUFHLElBQUlYLDhCQUE4QixDQUFFRyxLQUFLLEVBQ3BFRSxjQUFjLENBQUNPLGtDQUFrQyxFQUFFUixNQUFNLENBQUNTLFlBQVksQ0FBRSxzQkFBdUIsQ0FBRSxDQUFDO0lBRXBHLEtBQUssQ0FBRVYsS0FBSyxFQUFFRSxjQUFjLEVBQUVDLFNBQVMsRUFBRUMsaUJBQWlCLEVBQUVJLG9CQUFvQixFQUFFUCxNQUFPLENBQUM7RUFDNUY7QUFDRjtBQUVBTixhQUFhLENBQUNnQixRQUFRLENBQUUsc0JBQXNCLEVBQUViLG9CQUFxQixDQUFDIn0=