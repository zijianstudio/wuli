// Copyright 2023, University of Colorado Boulder

/**
 * PointSlopeEquationAccordionBox is the equation accordion box for the 'Point-Slope' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import EquationAccordionBox from '../../common/view/EquationAccordionBox.js';
import graphingLines from '../../graphingLines.js';
import PointSlopeEquationNode from './PointSlopeEquationNode.js';
export default class PointSlopeEquationAccordionBox extends EquationAccordionBox {
  constructor(model, expandedProperty, tandem) {
    super(
    // title
    PointSlopeEquationNode.createGeneralFormNode(),
    // interactive equation
    new PointSlopeEquationNode(model.interactiveLineProperty, {
      x1RangeProperty: model.x1RangeProperty,
      y1RangeProperty: model.y1RangeProperty,
      riseRangeProperty: model.riseRangeProperty,
      runRangeProperty: model.runRangeProperty,
      maxWidth: 400
    }),
    // Properties
    model.interactiveLineProperty, model.savedLines, expandedProperty,
    // phet-io
    tandem);
  }
}
graphingLines.register('PointSlopeEquationAccordionBox', PointSlopeEquationAccordionBox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFcXVhdGlvbkFjY29yZGlvbkJveCIsImdyYXBoaW5nTGluZXMiLCJQb2ludFNsb3BlRXF1YXRpb25Ob2RlIiwiUG9pbnRTbG9wZUVxdWF0aW9uQWNjb3JkaW9uQm94IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsImV4cGFuZGVkUHJvcGVydHkiLCJ0YW5kZW0iLCJjcmVhdGVHZW5lcmFsRm9ybU5vZGUiLCJpbnRlcmFjdGl2ZUxpbmVQcm9wZXJ0eSIsIngxUmFuZ2VQcm9wZXJ0eSIsInkxUmFuZ2VQcm9wZXJ0eSIsInJpc2VSYW5nZVByb3BlcnR5IiwicnVuUmFuZ2VQcm9wZXJ0eSIsIm1heFdpZHRoIiwic2F2ZWRMaW5lcyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUG9pbnRTbG9wZUVxdWF0aW9uQWNjb3JkaW9uQm94LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBQb2ludFNsb3BlRXF1YXRpb25BY2NvcmRpb25Cb3ggaXMgdGhlIGVxdWF0aW9uIGFjY29yZGlvbiBib3ggZm9yIHRoZSAnUG9pbnQtU2xvcGUnIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBFcXVhdGlvbkFjY29yZGlvbkJveCBmcm9tICcuLi8uLi9jb21tb24vdmlldy9FcXVhdGlvbkFjY29yZGlvbkJveC5qcyc7XHJcbmltcG9ydCBncmFwaGluZ0xpbmVzIGZyb20gJy4uLy4uL2dyYXBoaW5nTGluZXMuanMnO1xyXG5pbXBvcnQgUG9pbnRTbG9wZU1vZGVsIGZyb20gJy4uL21vZGVsL1BvaW50U2xvcGVNb2RlbC5qcyc7XHJcbmltcG9ydCBQb2ludFNsb3BlRXF1YXRpb25Ob2RlIGZyb20gJy4vUG9pbnRTbG9wZUVxdWF0aW9uTm9kZS5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQb2ludFNsb3BlRXF1YXRpb25BY2NvcmRpb25Cb3ggZXh0ZW5kcyBFcXVhdGlvbkFjY29yZGlvbkJveCB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbW9kZWw6IFBvaW50U2xvcGVNb2RlbCwgZXhwYW5kZWRQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4sIHRhbmRlbTogVGFuZGVtICkge1xyXG4gICAgc3VwZXIoXHJcbiAgICAgIC8vIHRpdGxlXHJcbiAgICAgIFBvaW50U2xvcGVFcXVhdGlvbk5vZGUuY3JlYXRlR2VuZXJhbEZvcm1Ob2RlKCksXHJcblxyXG4gICAgICAvLyBpbnRlcmFjdGl2ZSBlcXVhdGlvblxyXG4gICAgICBuZXcgUG9pbnRTbG9wZUVxdWF0aW9uTm9kZSggbW9kZWwuaW50ZXJhY3RpdmVMaW5lUHJvcGVydHksIHtcclxuICAgICAgICB4MVJhbmdlUHJvcGVydHk6IG1vZGVsLngxUmFuZ2VQcm9wZXJ0eSxcclxuICAgICAgICB5MVJhbmdlUHJvcGVydHk6IG1vZGVsLnkxUmFuZ2VQcm9wZXJ0eSxcclxuICAgICAgICByaXNlUmFuZ2VQcm9wZXJ0eTogbW9kZWwucmlzZVJhbmdlUHJvcGVydHksXHJcbiAgICAgICAgcnVuUmFuZ2VQcm9wZXJ0eTogbW9kZWwucnVuUmFuZ2VQcm9wZXJ0eSxcclxuICAgICAgICBtYXhXaWR0aDogNDAwXHJcbiAgICAgIH0gKSxcclxuXHJcbiAgICAgIC8vIFByb3BlcnRpZXNcclxuICAgICAgbW9kZWwuaW50ZXJhY3RpdmVMaW5lUHJvcGVydHksXHJcbiAgICAgIG1vZGVsLnNhdmVkTGluZXMsXHJcbiAgICAgIGV4cGFuZGVkUHJvcGVydHksXHJcblxyXG4gICAgICAvLyBwaGV0LWlvXHJcbiAgICAgIHRhbmRlbVxyXG4gICAgKTtcclxuICB9XHJcbn1cclxuXHJcbmdyYXBoaW5nTGluZXMucmVnaXN0ZXIoICdQb2ludFNsb3BlRXF1YXRpb25BY2NvcmRpb25Cb3gnLCBQb2ludFNsb3BlRXF1YXRpb25BY2NvcmRpb25Cb3ggKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBSUEsT0FBT0Esb0JBQW9CLE1BQU0sMkNBQTJDO0FBQzVFLE9BQU9DLGFBQWEsTUFBTSx3QkFBd0I7QUFFbEQsT0FBT0Msc0JBQXNCLE1BQU0sNkJBQTZCO0FBRWhFLGVBQWUsTUFBTUMsOEJBQThCLFNBQVNILG9CQUFvQixDQUFDO0VBRXhFSSxXQUFXQSxDQUFFQyxLQUFzQixFQUFFQyxnQkFBbUMsRUFBRUMsTUFBYyxFQUFHO0lBQ2hHLEtBQUs7SUFDSDtJQUNBTCxzQkFBc0IsQ0FBQ00scUJBQXFCLENBQUMsQ0FBQztJQUU5QztJQUNBLElBQUlOLHNCQUFzQixDQUFFRyxLQUFLLENBQUNJLHVCQUF1QixFQUFFO01BQ3pEQyxlQUFlLEVBQUVMLEtBQUssQ0FBQ0ssZUFBZTtNQUN0Q0MsZUFBZSxFQUFFTixLQUFLLENBQUNNLGVBQWU7TUFDdENDLGlCQUFpQixFQUFFUCxLQUFLLENBQUNPLGlCQUFpQjtNQUMxQ0MsZ0JBQWdCLEVBQUVSLEtBQUssQ0FBQ1EsZ0JBQWdCO01BQ3hDQyxRQUFRLEVBQUU7SUFDWixDQUFFLENBQUM7SUFFSDtJQUNBVCxLQUFLLENBQUNJLHVCQUF1QixFQUM3QkosS0FBSyxDQUFDVSxVQUFVLEVBQ2hCVCxnQkFBZ0I7SUFFaEI7SUFDQUMsTUFDRixDQUFDO0VBQ0g7QUFDRjtBQUVBTixhQUFhLENBQUNlLFFBQVEsQ0FBRSxnQ0FBZ0MsRUFBRWIsOEJBQStCLENBQUMifQ==