// Copyright 2014-2020, University of Colorado Boulder

/**
 * Base class for the various modes that the user can select in the "Explore"
 * screen.
 *
 * TODO: There are several things in the descendant classes that can be pulled into this class,
 * such as the function to set the initial and new reference objects.  I just didn't want to
 * take the time when doing early proof of concept to do this.
 */

import Property from '../../../../axon/js/Property.js';
import EstimationConstants from '../../common/EstimationConstants.js';
import estimation from '../../estimation.js';
class AbstractExplorationMode {
  constructor(selectedModeProperty, modeName) {
    this.selectedModeProperty = selectedModeProperty;
    this.modeName = modeName;

    // Properties that are part of the public API.
    this.estimateProperty = new Property(1);
    this.continuousOrDiscreteProperty = new Property('discrete');

    // Storage for this mode's estimate parameters for when the mode is
    // inactive. Necessary because the ranges overlap.
    this.selectedRange = EstimationConstants.RANGE_1_TO_10;
    this.offsetIntoRange = 0;

    // Every mode has the following objects.  Descendant classes should populate.
    this.referenceObject = null;
    this.compareObject = null;
    this.continuousSizableObject = null;
    this.discreteObjectList = [];
  }

  // TODO: Visibility annotations should be checked and updated, see https://github.com/phetsims/estimation/issues/9

  // @public
  createNewReferenceObject() {
    throw new Error('createNewReferenceObject must be overridden in descendant class');
  }

  // @public
  updateDiscreteObjectVisibility(modeName) {
    throw new Error('updateDiscreteObjectVisibility must be overridden in descendant class');
  }

  // @public
  updateContinuousObjectSize() {
    throw new Error('updateContinuousObjectSize must be overridden in descendant class');
  }

  // @public
  setInitialReferenceObject() {
    throw new Error('setInitialReferenceObject must be overridden in descendant class');
  }

  // @public
  updateObjectVisibility() {
    const selectedMode = this.selectedModeProperty.value;
    this.referenceObject.visibleProperty.value = selectedMode === this.modeName;
    this.compareObject.visibleProperty.value = selectedMode === this.modeName;
    this.continuousSizableObject.visibleProperty.value = selectedMode === this.modeName && this.continuousOrDiscreteProperty.value === 'continuous';
    this.updateDiscreteObjectVisibility(selectedMode, this.estimateProperty.value);
  }

  /**
   * Must be called by descendant classes to complete initialization.
   * @public
   */
  hookUpVisibilityUpdates() {
    this.selectedModeProperty.link(this.updateObjectVisibility.bind(this));
    this.continuousOrDiscreteProperty.link(this.updateObjectVisibility.bind(this));
    this.estimateProperty.link(this.updateObjectVisibility.bind(this));
    this.estimateProperty.link(this.updateContinuousObjectSize.bind(this));
  }

  /**
   * restore initial state
   * @public
   */
  reset() {
    this.continuousOrDiscreteProperty.reset();
    this.estimateProperty.reset();
    this.selectedRange = EstimationConstants.RANGE_1_TO_10;
    this.offsetIntoRange = 0;
    this.setInitialReferenceObject();
  }
}
estimation.register('AbstractExplorationMode', AbstractExplorationMode);
export default AbstractExplorationMode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkVzdGltYXRpb25Db25zdGFudHMiLCJlc3RpbWF0aW9uIiwiQWJzdHJhY3RFeHBsb3JhdGlvbk1vZGUiLCJjb25zdHJ1Y3RvciIsInNlbGVjdGVkTW9kZVByb3BlcnR5IiwibW9kZU5hbWUiLCJlc3RpbWF0ZVByb3BlcnR5IiwiY29udGludW91c09yRGlzY3JldGVQcm9wZXJ0eSIsInNlbGVjdGVkUmFuZ2UiLCJSQU5HRV8xX1RPXzEwIiwib2Zmc2V0SW50b1JhbmdlIiwicmVmZXJlbmNlT2JqZWN0IiwiY29tcGFyZU9iamVjdCIsImNvbnRpbnVvdXNTaXphYmxlT2JqZWN0IiwiZGlzY3JldGVPYmplY3RMaXN0IiwiY3JlYXRlTmV3UmVmZXJlbmNlT2JqZWN0IiwiRXJyb3IiLCJ1cGRhdGVEaXNjcmV0ZU9iamVjdFZpc2liaWxpdHkiLCJ1cGRhdGVDb250aW51b3VzT2JqZWN0U2l6ZSIsInNldEluaXRpYWxSZWZlcmVuY2VPYmplY3QiLCJ1cGRhdGVPYmplY3RWaXNpYmlsaXR5Iiwic2VsZWN0ZWRNb2RlIiwidmFsdWUiLCJ2aXNpYmxlUHJvcGVydHkiLCJob29rVXBWaXNpYmlsaXR5VXBkYXRlcyIsImxpbmsiLCJiaW5kIiwicmVzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkFic3RyYWN0RXhwbG9yYXRpb25Nb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEJhc2UgY2xhc3MgZm9yIHRoZSB2YXJpb3VzIG1vZGVzIHRoYXQgdGhlIHVzZXIgY2FuIHNlbGVjdCBpbiB0aGUgXCJFeHBsb3JlXCJcclxuICogc2NyZWVuLlxyXG4gKlxyXG4gKiBUT0RPOiBUaGVyZSBhcmUgc2V2ZXJhbCB0aGluZ3MgaW4gdGhlIGRlc2NlbmRhbnQgY2xhc3NlcyB0aGF0IGNhbiBiZSBwdWxsZWQgaW50byB0aGlzIGNsYXNzLFxyXG4gKiBzdWNoIGFzIHRoZSBmdW5jdGlvbiB0byBzZXQgdGhlIGluaXRpYWwgYW5kIG5ldyByZWZlcmVuY2Ugb2JqZWN0cy4gIEkganVzdCBkaWRuJ3Qgd2FudCB0b1xyXG4gKiB0YWtlIHRoZSB0aW1lIHdoZW4gZG9pbmcgZWFybHkgcHJvb2Ygb2YgY29uY2VwdCB0byBkbyB0aGlzLlxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IEVzdGltYXRpb25Db25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0VzdGltYXRpb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgZXN0aW1hdGlvbiBmcm9tICcuLi8uLi9lc3RpbWF0aW9uLmpzJztcclxuXHJcbmNsYXNzIEFic3RyYWN0RXhwbG9yYXRpb25Nb2RlIHtcclxuXHJcbiAgY29uc3RydWN0b3IoIHNlbGVjdGVkTW9kZVByb3BlcnR5LCBtb2RlTmFtZSApIHtcclxuICAgIHRoaXMuc2VsZWN0ZWRNb2RlUHJvcGVydHkgPSBzZWxlY3RlZE1vZGVQcm9wZXJ0eTtcclxuICAgIHRoaXMubW9kZU5hbWUgPSBtb2RlTmFtZTtcclxuXHJcbiAgICAvLyBQcm9wZXJ0aWVzIHRoYXQgYXJlIHBhcnQgb2YgdGhlIHB1YmxpYyBBUEkuXHJcbiAgICB0aGlzLmVzdGltYXRlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDEgKTtcclxuICAgIHRoaXMuY29udGludW91c09yRGlzY3JldGVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggJ2Rpc2NyZXRlJyApO1xyXG5cclxuICAgIC8vIFN0b3JhZ2UgZm9yIHRoaXMgbW9kZSdzIGVzdGltYXRlIHBhcmFtZXRlcnMgZm9yIHdoZW4gdGhlIG1vZGUgaXNcclxuICAgIC8vIGluYWN0aXZlLiBOZWNlc3NhcnkgYmVjYXVzZSB0aGUgcmFuZ2VzIG92ZXJsYXAuXHJcbiAgICB0aGlzLnNlbGVjdGVkUmFuZ2UgPSBFc3RpbWF0aW9uQ29uc3RhbnRzLlJBTkdFXzFfVE9fMTA7XHJcbiAgICB0aGlzLm9mZnNldEludG9SYW5nZSA9IDA7XHJcblxyXG4gICAgLy8gRXZlcnkgbW9kZSBoYXMgdGhlIGZvbGxvd2luZyBvYmplY3RzLiAgRGVzY2VuZGFudCBjbGFzc2VzIHNob3VsZCBwb3B1bGF0ZS5cclxuICAgIHRoaXMucmVmZXJlbmNlT2JqZWN0ID0gbnVsbDtcclxuICAgIHRoaXMuY29tcGFyZU9iamVjdCA9IG51bGw7XHJcbiAgICB0aGlzLmNvbnRpbnVvdXNTaXphYmxlT2JqZWN0ID0gbnVsbDtcclxuICAgIHRoaXMuZGlzY3JldGVPYmplY3RMaXN0ID0gW107XHJcbiAgfVxyXG5cclxuICAvLyBUT0RPOiBWaXNpYmlsaXR5IGFubm90YXRpb25zIHNob3VsZCBiZSBjaGVja2VkIGFuZCB1cGRhdGVkLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VzdGltYXRpb24vaXNzdWVzLzlcclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIGNyZWF0ZU5ld1JlZmVyZW5jZU9iamVjdCgpIHtcclxuICAgIHRocm93IG5ldyBFcnJvciggJ2NyZWF0ZU5ld1JlZmVyZW5jZU9iamVjdCBtdXN0IGJlIG92ZXJyaWRkZW4gaW4gZGVzY2VuZGFudCBjbGFzcycgKTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICB1cGRhdGVEaXNjcmV0ZU9iamVjdFZpc2liaWxpdHkoIG1vZGVOYW1lICkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCAndXBkYXRlRGlzY3JldGVPYmplY3RWaXNpYmlsaXR5IG11c3QgYmUgb3ZlcnJpZGRlbiBpbiBkZXNjZW5kYW50IGNsYXNzJyApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIHVwZGF0ZUNvbnRpbnVvdXNPYmplY3RTaXplKCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCAndXBkYXRlQ29udGludW91c09iamVjdFNpemUgbXVzdCBiZSBvdmVycmlkZGVuIGluIGRlc2NlbmRhbnQgY2xhc3MnICk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljXHJcbiAgc2V0SW5pdGlhbFJlZmVyZW5jZU9iamVjdCgpIHtcclxuICAgIHRocm93IG5ldyBFcnJvciggJ3NldEluaXRpYWxSZWZlcmVuY2VPYmplY3QgbXVzdCBiZSBvdmVycmlkZGVuIGluIGRlc2NlbmRhbnQgY2xhc3MnICk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljXHJcbiAgdXBkYXRlT2JqZWN0VmlzaWJpbGl0eSgpIHtcclxuICAgIGNvbnN0IHNlbGVjdGVkTW9kZSA9IHRoaXMuc2VsZWN0ZWRNb2RlUHJvcGVydHkudmFsdWU7XHJcbiAgICB0aGlzLnJlZmVyZW5jZU9iamVjdC52aXNpYmxlUHJvcGVydHkudmFsdWUgPSBzZWxlY3RlZE1vZGUgPT09IHRoaXMubW9kZU5hbWU7XHJcbiAgICB0aGlzLmNvbXBhcmVPYmplY3QudmlzaWJsZVByb3BlcnR5LnZhbHVlID0gc2VsZWN0ZWRNb2RlID09PSB0aGlzLm1vZGVOYW1lO1xyXG4gICAgdGhpcy5jb250aW51b3VzU2l6YWJsZU9iamVjdC52aXNpYmxlUHJvcGVydHkudmFsdWUgPSBzZWxlY3RlZE1vZGUgPT09IHRoaXMubW9kZU5hbWUgJiYgdGhpcy5jb250aW51b3VzT3JEaXNjcmV0ZVByb3BlcnR5LnZhbHVlID09PSAnY29udGludW91cyc7XHJcbiAgICB0aGlzLnVwZGF0ZURpc2NyZXRlT2JqZWN0VmlzaWJpbGl0eSggc2VsZWN0ZWRNb2RlLCB0aGlzLmVzdGltYXRlUHJvcGVydHkudmFsdWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE11c3QgYmUgY2FsbGVkIGJ5IGRlc2NlbmRhbnQgY2xhc3NlcyB0byBjb21wbGV0ZSBpbml0aWFsaXphdGlvbi5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgaG9va1VwVmlzaWJpbGl0eVVwZGF0ZXMoKSB7XHJcbiAgICB0aGlzLnNlbGVjdGVkTW9kZVByb3BlcnR5LmxpbmsoIHRoaXMudXBkYXRlT2JqZWN0VmlzaWJpbGl0eS5iaW5kKCB0aGlzICkgKTtcclxuICAgIHRoaXMuY29udGludW91c09yRGlzY3JldGVQcm9wZXJ0eS5saW5rKCB0aGlzLnVwZGF0ZU9iamVjdFZpc2liaWxpdHkuYmluZCggdGhpcyApICk7XHJcbiAgICB0aGlzLmVzdGltYXRlUHJvcGVydHkubGluayggdGhpcy51cGRhdGVPYmplY3RWaXNpYmlsaXR5LmJpbmQoIHRoaXMgKSApO1xyXG4gICAgdGhpcy5lc3RpbWF0ZVByb3BlcnR5LmxpbmsoIHRoaXMudXBkYXRlQ29udGludW91c09iamVjdFNpemUuYmluZCggdGhpcyApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiByZXN0b3JlIGluaXRpYWwgc3RhdGVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLmNvbnRpbnVvdXNPckRpc2NyZXRlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuZXN0aW1hdGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zZWxlY3RlZFJhbmdlID0gRXN0aW1hdGlvbkNvbnN0YW50cy5SQU5HRV8xX1RPXzEwO1xyXG4gICAgdGhpcy5vZmZzZXRJbnRvUmFuZ2UgPSAwO1xyXG4gICAgdGhpcy5zZXRJbml0aWFsUmVmZXJlbmNlT2JqZWN0KCk7XHJcbiAgfVxyXG59XHJcblxyXG5lc3RpbWF0aW9uLnJlZ2lzdGVyKCAnQWJzdHJhY3RFeHBsb3JhdGlvbk1vZGUnLCBBYnN0cmFjdEV4cGxvcmF0aW9uTW9kZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQWJzdHJhY3RFeHBsb3JhdGlvbk1vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsbUJBQW1CLE1BQU0scUNBQXFDO0FBQ3JFLE9BQU9DLFVBQVUsTUFBTSxxQkFBcUI7QUFFNUMsTUFBTUMsdUJBQXVC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