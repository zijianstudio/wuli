// Copyright 2014-2023, University of Colorado Boulder

/**
 * View for the 'Standard Form' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import GQScreenView from '../../common/view/GQScreenView.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import StandardFormEquationAccordionBox from './StandardFormEquationAccordionBox.js';
import StandardFormGraphControlPanel from './StandardFormGraphControlPanel.js';
import StandardFormGraphNode from './StandardFormGraphNode.js';
import StandardFormViewProperties from './StandardFormViewProperties.js';
export default class StandardFormScreenView extends GQScreenView {
  constructor(model, tandem) {
    const viewProperties = new StandardFormViewProperties(tandem.createTandem('viewProperties'));
    super(model, viewProperties, new StandardFormGraphNode(model, viewProperties, tandem), new StandardFormEquationAccordionBox(model, {
      expandedProperty: viewProperties.equationAccordionBoxExpandedProperty,
      tandem: tandem.createTandem('equationAccordionBox')
    }), new StandardFormGraphControlPanel(viewProperties, tandem.createTandem('graphControlPanel')), tandem);
  }
}
graphingQuadratics.register('StandardFormScreenView', StandardFormScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJHUVNjcmVlblZpZXciLCJncmFwaGluZ1F1YWRyYXRpY3MiLCJTdGFuZGFyZEZvcm1FcXVhdGlvbkFjY29yZGlvbkJveCIsIlN0YW5kYXJkRm9ybUdyYXBoQ29udHJvbFBhbmVsIiwiU3RhbmRhcmRGb3JtR3JhcGhOb2RlIiwiU3RhbmRhcmRGb3JtVmlld1Byb3BlcnRpZXMiLCJTdGFuZGFyZEZvcm1TY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInRhbmRlbSIsInZpZXdQcm9wZXJ0aWVzIiwiY3JlYXRlVGFuZGVtIiwiZXhwYW5kZWRQcm9wZXJ0eSIsImVxdWF0aW9uQWNjb3JkaW9uQm94RXhwYW5kZWRQcm9wZXJ0eSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU3RhbmRhcmRGb3JtU2NyZWVuVmlldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IGZvciB0aGUgJ1N0YW5kYXJkIEZvcm0nIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgR1FTY3JlZW5WaWV3IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0dRU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBncmFwaGluZ1F1YWRyYXRpY3MgZnJvbSAnLi4vLi4vZ3JhcGhpbmdRdWFkcmF0aWNzLmpzJztcclxuaW1wb3J0IFN0YW5kYXJkRm9ybU1vZGVsIGZyb20gJy4uL21vZGVsL1N0YW5kYXJkRm9ybU1vZGVsLmpzJztcclxuaW1wb3J0IFN0YW5kYXJkRm9ybUVxdWF0aW9uQWNjb3JkaW9uQm94IGZyb20gJy4vU3RhbmRhcmRGb3JtRXF1YXRpb25BY2NvcmRpb25Cb3guanMnO1xyXG5pbXBvcnQgU3RhbmRhcmRGb3JtR3JhcGhDb250cm9sUGFuZWwgZnJvbSAnLi9TdGFuZGFyZEZvcm1HcmFwaENvbnRyb2xQYW5lbC5qcyc7XHJcbmltcG9ydCBTdGFuZGFyZEZvcm1HcmFwaE5vZGUgZnJvbSAnLi9TdGFuZGFyZEZvcm1HcmFwaE5vZGUuanMnO1xyXG5pbXBvcnQgU3RhbmRhcmRGb3JtVmlld1Byb3BlcnRpZXMgZnJvbSAnLi9TdGFuZGFyZEZvcm1WaWV3UHJvcGVydGllcy5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGFuZGFyZEZvcm1TY3JlZW5WaWV3IGV4dGVuZHMgR1FTY3JlZW5WaWV3IHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbDogU3RhbmRhcmRGb3JtTW9kZWwsIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIGNvbnN0IHZpZXdQcm9wZXJ0aWVzID0gbmV3IFN0YW5kYXJkRm9ybVZpZXdQcm9wZXJ0aWVzKCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmlld1Byb3BlcnRpZXMnICkgKTtcclxuXHJcbiAgICBzdXBlciggbW9kZWwsXHJcbiAgICAgIHZpZXdQcm9wZXJ0aWVzLFxyXG4gICAgICBuZXcgU3RhbmRhcmRGb3JtR3JhcGhOb2RlKCBtb2RlbCwgdmlld1Byb3BlcnRpZXMsIHRhbmRlbSApLFxyXG4gICAgICBuZXcgU3RhbmRhcmRGb3JtRXF1YXRpb25BY2NvcmRpb25Cb3goIG1vZGVsLCB7XHJcbiAgICAgICAgZXhwYW5kZWRQcm9wZXJ0eTogdmlld1Byb3BlcnRpZXMuZXF1YXRpb25BY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5LFxyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VxdWF0aW9uQWNjb3JkaW9uQm94JyApXHJcbiAgICAgIH0gKSxcclxuICAgICAgbmV3IFN0YW5kYXJkRm9ybUdyYXBoQ29udHJvbFBhbmVsKCB2aWV3UHJvcGVydGllcywgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2dyYXBoQ29udHJvbFBhbmVsJyApICksXHJcbiAgICAgIHRhbmRlbVxyXG4gICAgKTtcclxuICB9XHJcbn1cclxuXHJcbmdyYXBoaW5nUXVhZHJhdGljcy5yZWdpc3RlciggJ1N0YW5kYXJkRm9ybVNjcmVlblZpZXcnLCBTdGFuZGFyZEZvcm1TY3JlZW5WaWV3ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLFlBQVksTUFBTSxtQ0FBbUM7QUFDNUQsT0FBT0Msa0JBQWtCLE1BQU0sNkJBQTZCO0FBRTVELE9BQU9DLGdDQUFnQyxNQUFNLHVDQUF1QztBQUNwRixPQUFPQyw2QkFBNkIsTUFBTSxvQ0FBb0M7QUFDOUUsT0FBT0MscUJBQXFCLE1BQU0sNEJBQTRCO0FBQzlELE9BQU9DLDBCQUEwQixNQUFNLGlDQUFpQztBQUV4RSxlQUFlLE1BQU1DLHNCQUFzQixTQUFTTixZQUFZLENBQUM7RUFFeERPLFdBQVdBLENBQUVDLEtBQXdCLEVBQUVDLE1BQWMsRUFBRztJQUU3RCxNQUFNQyxjQUFjLEdBQUcsSUFBSUwsMEJBQTBCLENBQUVJLE1BQU0sQ0FBQ0UsWUFBWSxDQUFFLGdCQUFpQixDQUFFLENBQUM7SUFFaEcsS0FBSyxDQUFFSCxLQUFLLEVBQ1ZFLGNBQWMsRUFDZCxJQUFJTixxQkFBcUIsQ0FBRUksS0FBSyxFQUFFRSxjQUFjLEVBQUVELE1BQU8sQ0FBQyxFQUMxRCxJQUFJUCxnQ0FBZ0MsQ0FBRU0sS0FBSyxFQUFFO01BQzNDSSxnQkFBZ0IsRUFBRUYsY0FBYyxDQUFDRyxvQ0FBb0M7TUFDckVKLE1BQU0sRUFBRUEsTUFBTSxDQUFDRSxZQUFZLENBQUUsc0JBQXVCO0lBQ3RELENBQUUsQ0FBQyxFQUNILElBQUlSLDZCQUE2QixDQUFFTyxjQUFjLEVBQUVELE1BQU0sQ0FBQ0UsWUFBWSxDQUFFLG1CQUFvQixDQUFFLENBQUMsRUFDL0ZGLE1BQ0YsQ0FBQztFQUNIO0FBQ0Y7QUFFQVIsa0JBQWtCLENBQUNhLFFBQVEsQ0FBRSx3QkFBd0IsRUFBRVIsc0JBQXVCLENBQUMifQ==