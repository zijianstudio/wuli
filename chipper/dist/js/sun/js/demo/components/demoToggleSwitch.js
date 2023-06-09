// Copyright 2022, University of Colorado Boulder

/**
 * Demo for ToggleSwitch
 */

import ToggleSwitch from '../../ToggleSwitch.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
export default function demoToggleSwitch(layoutBounds) {
  return new ToggleSwitch(new StringProperty('left'), 'left', 'right', {
    center: layoutBounds.center
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUb2dnbGVTd2l0Y2giLCJTdHJpbmdQcm9wZXJ0eSIsImRlbW9Ub2dnbGVTd2l0Y2giLCJsYXlvdXRCb3VuZHMiLCJjZW50ZXIiXSwic291cmNlcyI6WyJkZW1vVG9nZ2xlU3dpdGNoLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEZW1vIGZvciBUb2dnbGVTd2l0Y2hcclxuICovXHJcblxyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBUb2dnbGVTd2l0Y2ggZnJvbSAnLi4vLi4vVG9nZ2xlU3dpdGNoLmpzJztcclxuaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBTdHJpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1N0cmluZ1Byb3BlcnR5LmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbW9Ub2dnbGVTd2l0Y2goIGxheW91dEJvdW5kczogQm91bmRzMiApOiBOb2RlIHtcclxuICByZXR1cm4gbmV3IFRvZ2dsZVN3aXRjaCggbmV3IFN0cmluZ1Byb3BlcnR5KCAnbGVmdCcgKSwgJ2xlZnQnLCAncmlnaHQnLCB7XHJcbiAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXJcclxuICB9ICk7XHJcbn0iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTs7QUFHQSxPQUFPQSxZQUFZLE1BQU0sdUJBQXVCO0FBRWhELE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFFbEUsZUFBZSxTQUFTQyxnQkFBZ0JBLENBQUVDLFlBQXFCLEVBQVM7RUFDdEUsT0FBTyxJQUFJSCxZQUFZLENBQUUsSUFBSUMsY0FBYyxDQUFFLE1BQU8sQ0FBQyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUU7SUFDdEVHLE1BQU0sRUFBRUQsWUFBWSxDQUFDQztFQUN2QixDQUFFLENBQUM7QUFDTCJ9