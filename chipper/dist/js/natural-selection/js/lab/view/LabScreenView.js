// Copyright 2019-2022, University of Colorado Boulder

/**
 * LabScreenView is the view for the 'Lab' screen. Adds no additional functionality to NaturalSelectionScreenView,
 * but included for completeness of the class hierarchy.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NaturalSelectionScreenView from '../../common/view/NaturalSelectionScreenView.js';
import naturalSelection from '../../naturalSelection.js';
export default class LabScreenView extends NaturalSelectionScreenView {
  constructor(model, tandem) {
    super(model, {
      // phet-io
      tandem: tandem
    });
  }
}
naturalSelection.register('LabScreenView', LabScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOYXR1cmFsU2VsZWN0aW9uU2NyZWVuVmlldyIsIm5hdHVyYWxTZWxlY3Rpb24iLCJMYWJTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInRhbmRlbSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTGFiU2NyZWVuVmlldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBMYWJTY3JlZW5WaWV3IGlzIHRoZSB2aWV3IGZvciB0aGUgJ0xhYicgc2NyZWVuLiBBZGRzIG5vIGFkZGl0aW9uYWwgZnVuY3Rpb25hbGl0eSB0byBOYXR1cmFsU2VsZWN0aW9uU2NyZWVuVmlldyxcclxuICogYnV0IGluY2x1ZGVkIGZvciBjb21wbGV0ZW5lc3Mgb2YgdGhlIGNsYXNzIGhpZXJhcmNoeS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgTmF0dXJhbFNlbGVjdGlvblNjcmVlblZpZXcgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvTmF0dXJhbFNlbGVjdGlvblNjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgbmF0dXJhbFNlbGVjdGlvbiBmcm9tICcuLi8uLi9uYXR1cmFsU2VsZWN0aW9uLmpzJztcclxuaW1wb3J0IExhYk1vZGVsIGZyb20gJy4uL21vZGVsL0xhYk1vZGVsLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExhYlNjcmVlblZpZXcgZXh0ZW5kcyBOYXR1cmFsU2VsZWN0aW9uU2NyZWVuVmlldyB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbW9kZWw6IExhYk1vZGVsLCB0YW5kZW06IFRhbmRlbSApIHtcclxuICAgIHN1cGVyKCBtb2RlbCwge1xyXG5cclxuICAgICAgLy8gcGhldC1pb1xyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxubmF0dXJhbFNlbGVjdGlvbi5yZWdpc3RlciggJ0xhYlNjcmVlblZpZXcnLCBMYWJTY3JlZW5WaWV3ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsMEJBQTBCLE1BQU0saURBQWlEO0FBQ3hGLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUd4RCxlQUFlLE1BQU1DLGFBQWEsU0FBU0YsMEJBQTBCLENBQUM7RUFFN0RHLFdBQVdBLENBQUVDLEtBQWUsRUFBRUMsTUFBYyxFQUFHO0lBQ3BELEtBQUssQ0FBRUQsS0FBSyxFQUFFO01BRVo7TUFDQUMsTUFBTSxFQUFFQTtJQUNWLENBQUUsQ0FBQztFQUNMO0FBQ0Y7QUFFQUosZ0JBQWdCLENBQUNLLFFBQVEsQ0FBRSxlQUFlLEVBQUVKLGFBQWMsQ0FBQyJ9