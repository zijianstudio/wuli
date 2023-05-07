// Copyright 2018-2022, University of Colorado Boulder

/**
 * Extends the base GrabDragInteraction to supply consistent description and alternative input to all the possible ways
 * of interacting with the top book. This type serves as a central place to factor out duplicate description and voicing
 * implementations used by BookNode and MagnifyingGlassNode, both of which have almost identical interactions.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import GrabDragInteraction from '../../../../scenery-phet/js/accessibility/GrabDragInteraction.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import friction from '../../friction.js';
class FrictionGrabDragInteraction extends GrabDragInteraction {
  /**
   * @param {FrictionModel} model
   * @param {KeyboardDragListener} keyboardDragListener
   * @param {Node} wrappedNode
   * @param {GrabbedDescriber} grabbedDescriber
   * @param {function():} alertSettledAndCool
   * @param {Object} [options]
   */
  constructor(model, keyboardDragListener, wrappedNode, grabbedDescriber, alertSettledAndCool, options) {
    assert && assert(wrappedNode.isVoicing, 'wrappedNode must support voicing');
    options = merge({
      // Function that returns whether or not the drag cue should be shown.
      showDragCueNode: () => {
        return model.topBookPositionProperty.value.equals(model.topBookPositionProperty.initialValue);
      },
      // appended to in this type
      listenersForDragState: []
    }, options);

    // Keep track of the passed in grab listener, to add to it below
    const oldGrab = options.onGrab;
    const grabbedUtterance = new Utterance();

    // Wrap the onGrab option in default functionality for al of the type in Friction
    options.onGrab = event => {
      oldGrab && oldGrab();

      // just for pdom
      grabbedUtterance.alert = grabbedDescriber.getGrabbedString();
      wrappedNode.alertDescriptionUtterance(grabbedUtterance);

      // When using mouse/touch FrictionDragListener will cover voicing responses.
      if (event.isFromPDOM()) {
        // No name response from PDOM, that comes from focus
        wrappedNode.voicingSpeakResponse({
          objectResponse: grabbedDescriber.getVoicingGrabbedObjectResponse()
        });
      }

      // alert after grabbed alert
      if (model.vibrationAmplitudeProperty.value === model.vibrationAmplitudeProperty.initialValue) {
        alertSettledAndCool();
      }
    };
    super(wrappedNode, keyboardDragListener, options);

    // @private
    this.model = model;
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.model.vibrationAmplitudeProperty.unlink(this.amplitudeListener);
  }
}
friction.register('FrictionGrabDragInteraction', FrictionGrabDragInteraction);
export default FrictionGrabDragInteraction;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIkdyYWJEcmFnSW50ZXJhY3Rpb24iLCJVdHRlcmFuY2UiLCJmcmljdGlvbiIsIkZyaWN0aW9uR3JhYkRyYWdJbnRlcmFjdGlvbiIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJrZXlib2FyZERyYWdMaXN0ZW5lciIsIndyYXBwZWROb2RlIiwiZ3JhYmJlZERlc2NyaWJlciIsImFsZXJ0U2V0dGxlZEFuZENvb2wiLCJvcHRpb25zIiwiYXNzZXJ0IiwiaXNWb2ljaW5nIiwic2hvd0RyYWdDdWVOb2RlIiwidG9wQm9va1Bvc2l0aW9uUHJvcGVydHkiLCJ2YWx1ZSIsImVxdWFscyIsImluaXRpYWxWYWx1ZSIsImxpc3RlbmVyc0ZvckRyYWdTdGF0ZSIsIm9sZEdyYWIiLCJvbkdyYWIiLCJncmFiYmVkVXR0ZXJhbmNlIiwiZXZlbnQiLCJhbGVydCIsImdldEdyYWJiZWRTdHJpbmciLCJhbGVydERlc2NyaXB0aW9uVXR0ZXJhbmNlIiwiaXNGcm9tUERPTSIsInZvaWNpbmdTcGVha1Jlc3BvbnNlIiwib2JqZWN0UmVzcG9uc2UiLCJnZXRWb2ljaW5nR3JhYmJlZE9iamVjdFJlc3BvbnNlIiwidmlicmF0aW9uQW1wbGl0dWRlUHJvcGVydHkiLCJkaXNwb3NlIiwidW5saW5rIiwiYW1wbGl0dWRlTGlzdGVuZXIiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkZyaWN0aW9uR3JhYkRyYWdJbnRlcmFjdGlvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBFeHRlbmRzIHRoZSBiYXNlIEdyYWJEcmFnSW50ZXJhY3Rpb24gdG8gc3VwcGx5IGNvbnNpc3RlbnQgZGVzY3JpcHRpb24gYW5kIGFsdGVybmF0aXZlIGlucHV0IHRvIGFsbCB0aGUgcG9zc2libGUgd2F5c1xyXG4gKiBvZiBpbnRlcmFjdGluZyB3aXRoIHRoZSB0b3AgYm9vay4gVGhpcyB0eXBlIHNlcnZlcyBhcyBhIGNlbnRyYWwgcGxhY2UgdG8gZmFjdG9yIG91dCBkdXBsaWNhdGUgZGVzY3JpcHRpb24gYW5kIHZvaWNpbmdcclxuICogaW1wbGVtZW50YXRpb25zIHVzZWQgYnkgQm9va05vZGUgYW5kIE1hZ25pZnlpbmdHbGFzc05vZGUsIGJvdGggb2Ygd2hpY2ggaGF2ZSBhbG1vc3QgaWRlbnRpY2FsIGludGVyYWN0aW9ucy5cclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgR3JhYkRyYWdJbnRlcmFjdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYWNjZXNzaWJpbGl0eS9HcmFiRHJhZ0ludGVyYWN0aW9uLmpzJztcclxuaW1wb3J0IFV0dGVyYW5jZSBmcm9tICcuLi8uLi8uLi8uLi91dHRlcmFuY2UtcXVldWUvanMvVXR0ZXJhbmNlLmpzJztcclxuaW1wb3J0IGZyaWN0aW9uIGZyb20gJy4uLy4uL2ZyaWN0aW9uLmpzJztcclxuXHJcbmNsYXNzIEZyaWN0aW9uR3JhYkRyYWdJbnRlcmFjdGlvbiBleHRlbmRzIEdyYWJEcmFnSW50ZXJhY3Rpb24ge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0ZyaWN0aW9uTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtLZXlib2FyZERyYWdMaXN0ZW5lcn0ga2V5Ym9hcmREcmFnTGlzdGVuZXJcclxuICAgKiBAcGFyYW0ge05vZGV9IHdyYXBwZWROb2RlXHJcbiAgICogQHBhcmFtIHtHcmFiYmVkRGVzY3JpYmVyfSBncmFiYmVkRGVzY3JpYmVyXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbigpOn0gYWxlcnRTZXR0bGVkQW5kQ29vbFxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIGtleWJvYXJkRHJhZ0xpc3RlbmVyLCB3cmFwcGVkTm9kZSwgZ3JhYmJlZERlc2NyaWJlciwgYWxlcnRTZXR0bGVkQW5kQ29vbCwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB3cmFwcGVkTm9kZS5pc1ZvaWNpbmcsICd3cmFwcGVkTm9kZSBtdXN0IHN1cHBvcnQgdm9pY2luZycgKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgZHJhZyBjdWUgc2hvdWxkIGJlIHNob3duLlxyXG4gICAgICBzaG93RHJhZ0N1ZU5vZGU6ICgpID0+IHtcclxuICAgICAgICByZXR1cm4gbW9kZWwudG9wQm9va1Bvc2l0aW9uUHJvcGVydHkudmFsdWUuZXF1YWxzKCBtb2RlbC50b3BCb29rUG9zaXRpb25Qcm9wZXJ0eS5pbml0aWFsVmFsdWUgKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIGFwcGVuZGVkIHRvIGluIHRoaXMgdHlwZVxyXG4gICAgICBsaXN0ZW5lcnNGb3JEcmFnU3RhdGU6IFtdXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG5cclxuICAgIC8vIEtlZXAgdHJhY2sgb2YgdGhlIHBhc3NlZCBpbiBncmFiIGxpc3RlbmVyLCB0byBhZGQgdG8gaXQgYmVsb3dcclxuICAgIGNvbnN0IG9sZEdyYWIgPSBvcHRpb25zLm9uR3JhYjtcclxuXHJcbiAgICBjb25zdCBncmFiYmVkVXR0ZXJhbmNlID0gbmV3IFV0dGVyYW5jZSgpO1xyXG5cclxuICAgIC8vIFdyYXAgdGhlIG9uR3JhYiBvcHRpb24gaW4gZGVmYXVsdCBmdW5jdGlvbmFsaXR5IGZvciBhbCBvZiB0aGUgdHlwZSBpbiBGcmljdGlvblxyXG4gICAgb3B0aW9ucy5vbkdyYWIgPSBldmVudCA9PiB7XHJcbiAgICAgIG9sZEdyYWIgJiYgb2xkR3JhYigpO1xyXG5cclxuICAgICAgLy8ganVzdCBmb3IgcGRvbVxyXG4gICAgICBncmFiYmVkVXR0ZXJhbmNlLmFsZXJ0ID0gZ3JhYmJlZERlc2NyaWJlci5nZXRHcmFiYmVkU3RyaW5nKCk7XHJcbiAgICAgIHdyYXBwZWROb2RlLmFsZXJ0RGVzY3JpcHRpb25VdHRlcmFuY2UoIGdyYWJiZWRVdHRlcmFuY2UgKTtcclxuXHJcbiAgICAgIC8vIFdoZW4gdXNpbmcgbW91c2UvdG91Y2ggRnJpY3Rpb25EcmFnTGlzdGVuZXIgd2lsbCBjb3ZlciB2b2ljaW5nIHJlc3BvbnNlcy5cclxuICAgICAgaWYgKCBldmVudC5pc0Zyb21QRE9NKCkgKSB7XHJcblxyXG4gICAgICAgIC8vIE5vIG5hbWUgcmVzcG9uc2UgZnJvbSBQRE9NLCB0aGF0IGNvbWVzIGZyb20gZm9jdXNcclxuICAgICAgICB3cmFwcGVkTm9kZS52b2ljaW5nU3BlYWtSZXNwb25zZSgge1xyXG4gICAgICAgICAgb2JqZWN0UmVzcG9uc2U6IGdyYWJiZWREZXNjcmliZXIuZ2V0Vm9pY2luZ0dyYWJiZWRPYmplY3RSZXNwb25zZSgpXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBhbGVydCBhZnRlciBncmFiYmVkIGFsZXJ0XHJcbiAgICAgIGlmICggbW9kZWwudmlicmF0aW9uQW1wbGl0dWRlUHJvcGVydHkudmFsdWUgPT09IG1vZGVsLnZpYnJhdGlvbkFtcGxpdHVkZVByb3BlcnR5LmluaXRpYWxWYWx1ZSApIHtcclxuICAgICAgICBhbGVydFNldHRsZWRBbmRDb29sKCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgc3VwZXIoIHdyYXBwZWROb2RlLCBrZXlib2FyZERyYWdMaXN0ZW5lciwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLm1vZGVsID0gbW9kZWw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHRoaXMubW9kZWwudmlicmF0aW9uQW1wbGl0dWRlUHJvcGVydHkudW5saW5rKCB0aGlzLmFtcGxpdHVkZUxpc3RlbmVyICk7XHJcbiAgfVxyXG59XHJcblxyXG5mcmljdGlvbi5yZWdpc3RlciggJ0ZyaWN0aW9uR3JhYkRyYWdJbnRlcmFjdGlvbicsIEZyaWN0aW9uR3JhYkRyYWdJbnRlcmFjdGlvbiApO1xyXG5leHBvcnQgZGVmYXVsdCBGcmljdGlvbkdyYWJEcmFnSW50ZXJhY3Rpb247Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxtQkFBbUIsTUFBTSxrRUFBa0U7QUFDbEcsT0FBT0MsU0FBUyxNQUFNLDZDQUE2QztBQUNuRSxPQUFPQyxRQUFRLE1BQU0sbUJBQW1CO0FBRXhDLE1BQU1DLDJCQUEyQixTQUFTSCxtQkFBbUIsQ0FBQztFQUU1RDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VJLFdBQVdBLENBQUVDLEtBQUssRUFBRUMsb0JBQW9CLEVBQUVDLFdBQVcsRUFBRUMsZ0JBQWdCLEVBQUVDLG1CQUFtQixFQUFFQyxPQUFPLEVBQUc7SUFFdEdDLE1BQU0sSUFBSUEsTUFBTSxDQUFFSixXQUFXLENBQUNLLFNBQVMsRUFBRSxrQ0FBbUMsQ0FBQztJQUU3RUYsT0FBTyxHQUFHWCxLQUFLLENBQUU7TUFFZjtNQUNBYyxlQUFlLEVBQUVBLENBQUEsS0FBTTtRQUNyQixPQUFPUixLQUFLLENBQUNTLHVCQUF1QixDQUFDQyxLQUFLLENBQUNDLE1BQU0sQ0FBRVgsS0FBSyxDQUFDUyx1QkFBdUIsQ0FBQ0csWUFBYSxDQUFDO01BQ2pHLENBQUM7TUFFRDtNQUNBQyxxQkFBcUIsRUFBRTtJQUN6QixDQUFDLEVBQUVSLE9BQVEsQ0FBQzs7SUFHWjtJQUNBLE1BQU1TLE9BQU8sR0FBR1QsT0FBTyxDQUFDVSxNQUFNO0lBRTlCLE1BQU1DLGdCQUFnQixHQUFHLElBQUlwQixTQUFTLENBQUMsQ0FBQzs7SUFFeEM7SUFDQVMsT0FBTyxDQUFDVSxNQUFNLEdBQUdFLEtBQUssSUFBSTtNQUN4QkgsT0FBTyxJQUFJQSxPQUFPLENBQUMsQ0FBQzs7TUFFcEI7TUFDQUUsZ0JBQWdCLENBQUNFLEtBQUssR0FBR2YsZ0JBQWdCLENBQUNnQixnQkFBZ0IsQ0FBQyxDQUFDO01BQzVEakIsV0FBVyxDQUFDa0IseUJBQXlCLENBQUVKLGdCQUFpQixDQUFDOztNQUV6RDtNQUNBLElBQUtDLEtBQUssQ0FBQ0ksVUFBVSxDQUFDLENBQUMsRUFBRztRQUV4QjtRQUNBbkIsV0FBVyxDQUFDb0Isb0JBQW9CLENBQUU7VUFDaENDLGNBQWMsRUFBRXBCLGdCQUFnQixDQUFDcUIsK0JBQStCLENBQUM7UUFDbkUsQ0FBRSxDQUFDO01BQ0w7O01BRUE7TUFDQSxJQUFLeEIsS0FBSyxDQUFDeUIsMEJBQTBCLENBQUNmLEtBQUssS0FBS1YsS0FBSyxDQUFDeUIsMEJBQTBCLENBQUNiLFlBQVksRUFBRztRQUM5RlIsbUJBQW1CLENBQUMsQ0FBQztNQUN2QjtJQUNGLENBQUM7SUFFRCxLQUFLLENBQUVGLFdBQVcsRUFBRUQsb0JBQW9CLEVBQUVJLE9BQVEsQ0FBQzs7SUFFbkQ7SUFDQSxJQUFJLENBQUNMLEtBQUssR0FBR0EsS0FBSztFQUNwQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFMEIsT0FBT0EsQ0FBQSxFQUFHO0lBQ1IsSUFBSSxDQUFDMUIsS0FBSyxDQUFDeUIsMEJBQTBCLENBQUNFLE1BQU0sQ0FBRSxJQUFJLENBQUNDLGlCQUFrQixDQUFDO0VBQ3hFO0FBQ0Y7QUFFQS9CLFFBQVEsQ0FBQ2dDLFFBQVEsQ0FBRSw2QkFBNkIsRUFBRS9CLDJCQUE0QixDQUFDO0FBQy9FLGVBQWVBLDJCQUEyQiJ9