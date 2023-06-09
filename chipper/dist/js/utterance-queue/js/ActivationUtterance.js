// Copyright 2019-2022, University of Colorado Boulder

/**
 * An utterance that should generally be used for announcing a change after an "activation" interaction such
 * as clicking a button or a checkbox. The delay for waiting for utterance stability is chosen such that the alert won't
 * become stable and be spoken faster than the press and hold delay for continuous clicking with the "enter" key. See
 * Utterance.js for a description of utterance "stability". The result is that pressing and holding "enter" on a
 * button will result in only a single utterance.
 *
 * @author Jesse Greenberg
 */

import optionize from '../../phet-core/js/optionize.js';
import Utterance from './Utterance.js';
import utteranceQueueNamespace from './utteranceQueueNamespace.js';
export default class ActivationUtterance extends Utterance {
  constructor(providedOptions) {
    const options = optionize()({
      // {number} - in ms, should be larger than 500, prevents the utterance from being duplicated within the delay
      // of press and hold for most typical user settings
      alertStableDelay: 500
    }, providedOptions);
    assert && assert(options.alertStableDelay >= 500, 'Utterance will likely be duplicated if activated with key press and hold');
    super(options);
  }
}
utteranceQueueNamespace.register('ActivationUtterance', ActivationUtterance);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJVdHRlcmFuY2UiLCJ1dHRlcmFuY2VRdWV1ZU5hbWVzcGFjZSIsIkFjdGl2YXRpb25VdHRlcmFuY2UiLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJhbGVydFN0YWJsZURlbGF5IiwiYXNzZXJ0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJBY3RpdmF0aW9uVXR0ZXJhbmNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEFuIHV0dGVyYW5jZSB0aGF0IHNob3VsZCBnZW5lcmFsbHkgYmUgdXNlZCBmb3IgYW5ub3VuY2luZyBhIGNoYW5nZSBhZnRlciBhbiBcImFjdGl2YXRpb25cIiBpbnRlcmFjdGlvbiBzdWNoXHJcbiAqIGFzIGNsaWNraW5nIGEgYnV0dG9uIG9yIGEgY2hlY2tib3guIFRoZSBkZWxheSBmb3Igd2FpdGluZyBmb3IgdXR0ZXJhbmNlIHN0YWJpbGl0eSBpcyBjaG9zZW4gc3VjaCB0aGF0IHRoZSBhbGVydCB3b24ndFxyXG4gKiBiZWNvbWUgc3RhYmxlIGFuZCBiZSBzcG9rZW4gZmFzdGVyIHRoYW4gdGhlIHByZXNzIGFuZCBob2xkIGRlbGF5IGZvciBjb250aW51b3VzIGNsaWNraW5nIHdpdGggdGhlIFwiZW50ZXJcIiBrZXkuIFNlZVxyXG4gKiBVdHRlcmFuY2UuanMgZm9yIGEgZGVzY3JpcHRpb24gb2YgdXR0ZXJhbmNlIFwic3RhYmlsaXR5XCIuIFRoZSByZXN1bHQgaXMgdGhhdCBwcmVzc2luZyBhbmQgaG9sZGluZyBcImVudGVyXCIgb24gYVxyXG4gKiBidXR0b24gd2lsbCByZXN1bHQgaW4gb25seSBhIHNpbmdsZSB1dHRlcmFuY2UuXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqL1xyXG5cclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBVdHRlcmFuY2UsIHsgVXR0ZXJhbmNlT3B0aW9ucyB9IGZyb20gJy4vVXR0ZXJhbmNlLmpzJztcclxuaW1wb3J0IHV0dGVyYW5jZVF1ZXVlTmFtZXNwYWNlIGZyb20gJy4vdXR0ZXJhbmNlUXVldWVOYW1lc3BhY2UuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcbmV4cG9ydCB0eXBlIEFjdGl2YXRpb25VdHRlcmFuY2VPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBVdHRlcmFuY2VPcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWN0aXZhdGlvblV0dGVyYW5jZSBleHRlbmRzIFV0dGVyYW5jZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogQWN0aXZhdGlvblV0dGVyYW5jZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxBY3RpdmF0aW9uVXR0ZXJhbmNlT3B0aW9ucywgU2VsZk9wdGlvbnMsIFV0dGVyYW5jZU9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIHtudW1iZXJ9IC0gaW4gbXMsIHNob3VsZCBiZSBsYXJnZXIgdGhhbiA1MDAsIHByZXZlbnRzIHRoZSB1dHRlcmFuY2UgZnJvbSBiZWluZyBkdXBsaWNhdGVkIHdpdGhpbiB0aGUgZGVsYXlcclxuICAgICAgLy8gb2YgcHJlc3MgYW5kIGhvbGQgZm9yIG1vc3QgdHlwaWNhbCB1c2VyIHNldHRpbmdzXHJcbiAgICAgIGFsZXJ0U3RhYmxlRGVsYXk6IDUwMFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5hbGVydFN0YWJsZURlbGF5ID49IDUwMCwgJ1V0dGVyYW5jZSB3aWxsIGxpa2VseSBiZSBkdXBsaWNhdGVkIGlmIGFjdGl2YXRlZCB3aXRoIGtleSBwcmVzcyBhbmQgaG9sZCcgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxudXR0ZXJhbmNlUXVldWVOYW1lc3BhY2UucmVnaXN0ZXIoICdBY3RpdmF0aW9uVXR0ZXJhbmNlJywgQWN0aXZhdGlvblV0dGVyYW5jZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBNEIsaUNBQWlDO0FBQzdFLE9BQU9DLFNBQVMsTUFBNEIsZ0JBQWdCO0FBQzVELE9BQU9DLHVCQUF1QixNQUFNLDhCQUE4QjtBQUtsRSxlQUFlLE1BQU1DLG1CQUFtQixTQUFTRixTQUFTLENBQUM7RUFFbERHLFdBQVdBLENBQUVDLGVBQTRDLEVBQUc7SUFFakUsTUFBTUMsT0FBTyxHQUFHTixTQUFTLENBQTRELENBQUMsQ0FBRTtNQUV0RjtNQUNBO01BQ0FPLGdCQUFnQixFQUFFO0lBQ3BCLENBQUMsRUFBRUYsZUFBZ0IsQ0FBQztJQUVwQkcsTUFBTSxJQUFJQSxNQUFNLENBQUVGLE9BQU8sQ0FBQ0MsZ0JBQWdCLElBQUksR0FBRyxFQUFFLDBFQUEyRSxDQUFDO0lBRS9ILEtBQUssQ0FBRUQsT0FBUSxDQUFDO0VBQ2xCO0FBQ0Y7QUFFQUosdUJBQXVCLENBQUNPLFFBQVEsQ0FBRSxxQkFBcUIsRUFBRU4sbUJBQW9CLENBQUMifQ==