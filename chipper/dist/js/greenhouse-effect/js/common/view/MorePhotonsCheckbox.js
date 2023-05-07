// Copyright 2022, University of Colorado Boulder

/**
 * A reusable checkbox that controls whether all simulated photons are shown in the view.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */

import greenhouseEffect from '../../greenhouseEffect.js';
import GreenhouseEffectStrings from '../../GreenhouseEffectStrings.js';
import GreenhouseEffectCheckbox from './GreenhouseEffectCheckbox.js';
class MorePhotonsCheckbox extends GreenhouseEffectCheckbox {
  constructor(property, tandem) {
    super(property, GreenhouseEffectStrings.morePhotonsStringProperty, {
      // pdom
      helpText: 'help text not yet implemented',
      checkedContextResponse: 'utterance not yet implement',
      uncheckedContextResponse: 'utterance not yet implement',
      // phet-io
      tandem: tandem
    });
  }
}
greenhouseEffect.register('MorePhotonsCheckbox', MorePhotonsCheckbox);
export default MorePhotonsCheckbox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJncmVlbmhvdXNlRWZmZWN0IiwiR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MiLCJHcmVlbmhvdXNlRWZmZWN0Q2hlY2tib3giLCJNb3JlUGhvdG9uc0NoZWNrYm94IiwiY29uc3RydWN0b3IiLCJwcm9wZXJ0eSIsInRhbmRlbSIsIm1vcmVQaG90b25zU3RyaW5nUHJvcGVydHkiLCJoZWxwVGV4dCIsImNoZWNrZWRDb250ZXh0UmVzcG9uc2UiLCJ1bmNoZWNrZWRDb250ZXh0UmVzcG9uc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1vcmVQaG90b25zQ2hlY2tib3gudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgcmV1c2FibGUgY2hlY2tib3ggdGhhdCBjb250cm9scyB3aGV0aGVyIGFsbCBzaW11bGF0ZWQgcGhvdG9ucyBhcmUgc2hvd24gaW4gdGhlIHZpZXcuXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBncmVlbmhvdXNlRWZmZWN0IGZyb20gJy4uLy4uL2dyZWVuaG91c2VFZmZlY3QuanMnO1xyXG5pbXBvcnQgR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MgZnJvbSAnLi4vLi4vR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuanMnO1xyXG5pbXBvcnQgR3JlZW5ob3VzZUVmZmVjdENoZWNrYm94IGZyb20gJy4vR3JlZW5ob3VzZUVmZmVjdENoZWNrYm94LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5cclxuY2xhc3MgTW9yZVBob3RvbnNDaGVja2JveCBleHRlbmRzIEdyZWVuaG91c2VFZmZlY3RDaGVja2JveCB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+LCB0YW5kZW06IFRhbmRlbSApIHtcclxuXHJcbiAgICBzdXBlciggcHJvcGVydHksIEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLm1vcmVQaG90b25zU3RyaW5nUHJvcGVydHksIHtcclxuXHJcbiAgICAgIC8vIHBkb21cclxuICAgICAgaGVscFRleHQ6ICdoZWxwIHRleHQgbm90IHlldCBpbXBsZW1lbnRlZCcsXHJcbiAgICAgIGNoZWNrZWRDb250ZXh0UmVzcG9uc2U6ICd1dHRlcmFuY2Ugbm90IHlldCBpbXBsZW1lbnQnLFxyXG4gICAgICB1bmNoZWNrZWRDb250ZXh0UmVzcG9uc2U6ICd1dHRlcmFuY2Ugbm90IHlldCBpbXBsZW1lbnQnLFxyXG5cclxuICAgICAgLy8gcGhldC1pb1xyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuZ3JlZW5ob3VzZUVmZmVjdC5yZWdpc3RlciggJ01vcmVQaG90b25zQ2hlY2tib3gnLCBNb3JlUGhvdG9uc0NoZWNrYm94ICk7XHJcbmV4cG9ydCBkZWZhdWx0IE1vcmVQaG90b25zQ2hlY2tib3g7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLHVCQUF1QixNQUFNLGtDQUFrQztBQUN0RSxPQUFPQyx3QkFBd0IsTUFBTSwrQkFBK0I7QUFJcEUsTUFBTUMsbUJBQW1CLFNBQVNELHdCQUF3QixDQUFDO0VBRWxERSxXQUFXQSxDQUFFQyxRQUEyQixFQUFFQyxNQUFjLEVBQUc7SUFFaEUsS0FBSyxDQUFFRCxRQUFRLEVBQUVKLHVCQUF1QixDQUFDTSx5QkFBeUIsRUFBRTtNQUVsRTtNQUNBQyxRQUFRLEVBQUUsK0JBQStCO01BQ3pDQyxzQkFBc0IsRUFBRSw2QkFBNkI7TUFDckRDLHdCQUF3QixFQUFFLDZCQUE2QjtNQUV2RDtNQUNBSixNQUFNLEVBQUVBO0lBQ1YsQ0FBRSxDQUFDO0VBQ0w7QUFDRjtBQUVBTixnQkFBZ0IsQ0FBQ1csUUFBUSxDQUFFLHFCQUFxQixFQUFFUixtQkFBb0IsQ0FBQztBQUN2RSxlQUFlQSxtQkFBbUIifQ==