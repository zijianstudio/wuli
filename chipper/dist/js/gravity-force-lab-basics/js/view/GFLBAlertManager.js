// Copyright 2018-2022, University of Colorado Boulder

/**
 * This alert manager is responsible for all gravity-force-lab-basics specific aria-live alerts.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import GravityForceLabAlertManager from '../../../gravity-force-lab/js/view/GravityForceLabAlertManager.js';
import merge from '../../../phet-core/js/merge.js';
import ActivationUtterance from '../../../utterance-queue/js/ActivationUtterance.js';
import gravityForceLabBasics from '../gravityForceLabBasics.js';
import GravityForceLabBasicsStrings from '../GravityForceLabBasicsStrings.js';
const distanceArrowVisibleString = GravityForceLabBasicsStrings.a11y.distanceArrowVisible;
const distanceArrowRemovedString = GravityForceLabBasicsStrings.a11y.distanceArrowRemoved;
class GFLBAlertManager extends GravityForceLabAlertManager {
  /**
   * @param {GFLBModel} model
   * @param {GFLBForceDescriber} massDescriber
   * @param {GFLBForceDescriber} forceDescriber
   * @param {Object} [options]
   */
  constructor(model, massDescriber, forceDescriber, options) {
    options = merge({
      linkToForceValuesDisplayProperty: false,
      // opt out of REGULAR specific linking

      // by default the REGULAR version is different from this because of scientific notation
      showForceValuesListener: showValues => {
        this.alertShowForceValues(showValues);
      }
    }, options);
    super(model, massDescriber, forceDescriber, options);

    // @private {Utterance}
    this.distanceVisibleUtterance = new ActivationUtterance();
    model.showDistanceProperty.lazyLink(showDistance => {
      this.alertDistanceVisible(showDistance);
    });
  }

  /**
   * @private
   * @param {boolean} showDistance
   */
  alertDistanceVisible(showDistance) {
    this.distanceVisibleUtterance.alert = this.getDistanceVisibleAlert(showDistance);
    this.alertDescriptionUtterance(this.distanceVisibleUtterance);
  }

  /**
   * Get an alert that describes the changing visibility of the distance value.
   * @public
   *
   * @param {boolean} showDistance
   * @returns {string}
   */
  getDistanceVisibleAlert(showDistance) {
    return showDistance ? distanceArrowVisibleString : distanceArrowRemovedString;
  }
}
gravityForceLabBasics.register('GFLBAlertManager', GFLBAlertManager);
export default GFLBAlertManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJHcmF2aXR5Rm9yY2VMYWJBbGVydE1hbmFnZXIiLCJtZXJnZSIsIkFjdGl2YXRpb25VdHRlcmFuY2UiLCJncmF2aXR5Rm9yY2VMYWJCYXNpY3MiLCJHcmF2aXR5Rm9yY2VMYWJCYXNpY3NTdHJpbmdzIiwiZGlzdGFuY2VBcnJvd1Zpc2libGVTdHJpbmciLCJhMTF5IiwiZGlzdGFuY2VBcnJvd1Zpc2libGUiLCJkaXN0YW5jZUFycm93UmVtb3ZlZFN0cmluZyIsImRpc3RhbmNlQXJyb3dSZW1vdmVkIiwiR0ZMQkFsZXJ0TWFuYWdlciIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJtYXNzRGVzY3JpYmVyIiwiZm9yY2VEZXNjcmliZXIiLCJvcHRpb25zIiwibGlua1RvRm9yY2VWYWx1ZXNEaXNwbGF5UHJvcGVydHkiLCJzaG93Rm9yY2VWYWx1ZXNMaXN0ZW5lciIsInNob3dWYWx1ZXMiLCJhbGVydFNob3dGb3JjZVZhbHVlcyIsImRpc3RhbmNlVmlzaWJsZVV0dGVyYW5jZSIsInNob3dEaXN0YW5jZVByb3BlcnR5IiwibGF6eUxpbmsiLCJzaG93RGlzdGFuY2UiLCJhbGVydERpc3RhbmNlVmlzaWJsZSIsImFsZXJ0IiwiZ2V0RGlzdGFuY2VWaXNpYmxlQWxlcnQiLCJhbGVydERlc2NyaXB0aW9uVXR0ZXJhbmNlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJHRkxCQWxlcnRNYW5hZ2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoaXMgYWxlcnQgbWFuYWdlciBpcyByZXNwb25zaWJsZSBmb3IgYWxsIGdyYXZpdHktZm9yY2UtbGFiLWJhc2ljcyBzcGVjaWZpYyBhcmlhLWxpdmUgYWxlcnRzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEdyYXZpdHlGb3JjZUxhYkFsZXJ0TWFuYWdlciBmcm9tICcuLi8uLi8uLi9ncmF2aXR5LWZvcmNlLWxhYi9qcy92aWV3L0dyYXZpdHlGb3JjZUxhYkFsZXJ0TWFuYWdlci5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgQWN0aXZhdGlvblV0dGVyYW5jZSBmcm9tICcuLi8uLi8uLi91dHRlcmFuY2UtcXVldWUvanMvQWN0aXZhdGlvblV0dGVyYW5jZS5qcyc7XHJcbmltcG9ydCBncmF2aXR5Rm9yY2VMYWJCYXNpY3MgZnJvbSAnLi4vZ3Jhdml0eUZvcmNlTGFiQmFzaWNzLmpzJztcclxuaW1wb3J0IEdyYXZpdHlGb3JjZUxhYkJhc2ljc1N0cmluZ3MgZnJvbSAnLi4vR3Jhdml0eUZvcmNlTGFiQmFzaWNzU3RyaW5ncy5qcyc7XHJcblxyXG5jb25zdCBkaXN0YW5jZUFycm93VmlzaWJsZVN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYkJhc2ljc1N0cmluZ3MuYTExeS5kaXN0YW5jZUFycm93VmlzaWJsZTtcclxuY29uc3QgZGlzdGFuY2VBcnJvd1JlbW92ZWRTdHJpbmcgPSBHcmF2aXR5Rm9yY2VMYWJCYXNpY3NTdHJpbmdzLmExMXkuZGlzdGFuY2VBcnJvd1JlbW92ZWQ7XHJcblxyXG5jbGFzcyBHRkxCQWxlcnRNYW5hZ2VyIGV4dGVuZHMgR3Jhdml0eUZvcmNlTGFiQWxlcnRNYW5hZ2VyIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtHRkxCTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtHRkxCRm9yY2VEZXNjcmliZXJ9IG1hc3NEZXNjcmliZXJcclxuICAgKiBAcGFyYW0ge0dGTEJGb3JjZURlc2NyaWJlcn0gZm9yY2VEZXNjcmliZXJcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCBtYXNzRGVzY3JpYmVyLCBmb3JjZURlc2NyaWJlciwgb3B0aW9ucyApIHtcclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBsaW5rVG9Gb3JjZVZhbHVlc0Rpc3BsYXlQcm9wZXJ0eTogZmFsc2UsIC8vIG9wdCBvdXQgb2YgUkVHVUxBUiBzcGVjaWZpYyBsaW5raW5nXHJcblxyXG4gICAgICAvLyBieSBkZWZhdWx0IHRoZSBSRUdVTEFSIHZlcnNpb24gaXMgZGlmZmVyZW50IGZyb20gdGhpcyBiZWNhdXNlIG9mIHNjaWVudGlmaWMgbm90YXRpb25cclxuICAgICAgc2hvd0ZvcmNlVmFsdWVzTGlzdGVuZXI6IHNob3dWYWx1ZXMgPT4ge1xyXG4gICAgICAgIHRoaXMuYWxlcnRTaG93Rm9yY2VWYWx1ZXMoIHNob3dWYWx1ZXMgKTtcclxuICAgICAgfVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG4gICAgc3VwZXIoIG1vZGVsLCBtYXNzRGVzY3JpYmVyLCBmb3JjZURlc2NyaWJlciwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtVdHRlcmFuY2V9XHJcbiAgICB0aGlzLmRpc3RhbmNlVmlzaWJsZVV0dGVyYW5jZSA9IG5ldyBBY3RpdmF0aW9uVXR0ZXJhbmNlKCk7XHJcblxyXG4gICAgbW9kZWwuc2hvd0Rpc3RhbmNlUHJvcGVydHkubGF6eUxpbmsoIHNob3dEaXN0YW5jZSA9PiB7XHJcbiAgICAgIHRoaXMuYWxlcnREaXN0YW5jZVZpc2libGUoIHNob3dEaXN0YW5jZSApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHNob3dEaXN0YW5jZVxyXG4gICAqL1xyXG4gIGFsZXJ0RGlzdGFuY2VWaXNpYmxlKCBzaG93RGlzdGFuY2UgKSB7XHJcbiAgICB0aGlzLmRpc3RhbmNlVmlzaWJsZVV0dGVyYW5jZS5hbGVydCA9IHRoaXMuZ2V0RGlzdGFuY2VWaXNpYmxlQWxlcnQoIHNob3dEaXN0YW5jZSApO1xyXG4gICAgdGhpcy5hbGVydERlc2NyaXB0aW9uVXR0ZXJhbmNlKCB0aGlzLmRpc3RhbmNlVmlzaWJsZVV0dGVyYW5jZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGFuIGFsZXJ0IHRoYXQgZGVzY3JpYmVzIHRoZSBjaGFuZ2luZyB2aXNpYmlsaXR5IG9mIHRoZSBkaXN0YW5jZSB2YWx1ZS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHNob3dEaXN0YW5jZVxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0RGlzdGFuY2VWaXNpYmxlQWxlcnQoIHNob3dEaXN0YW5jZSApIHtcclxuICAgIHJldHVybiBzaG93RGlzdGFuY2UgPyBkaXN0YW5jZUFycm93VmlzaWJsZVN0cmluZyA6IGRpc3RhbmNlQXJyb3dSZW1vdmVkU3RyaW5nO1xyXG4gIH1cclxufVxyXG5cclxuZ3Jhdml0eUZvcmNlTGFiQmFzaWNzLnJlZ2lzdGVyKCAnR0ZMQkFsZXJ0TWFuYWdlcicsIEdGTEJBbGVydE1hbmFnZXIgKTtcclxuZXhwb3J0IGRlZmF1bHQgR0ZMQkFsZXJ0TWFuYWdlcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsMkJBQTJCLE1BQU0sbUVBQW1FO0FBQzNHLE9BQU9DLEtBQUssTUFBTSxnQ0FBZ0M7QUFDbEQsT0FBT0MsbUJBQW1CLE1BQU0sb0RBQW9EO0FBQ3BGLE9BQU9DLHFCQUFxQixNQUFNLDZCQUE2QjtBQUMvRCxPQUFPQyw0QkFBNEIsTUFBTSxvQ0FBb0M7QUFFN0UsTUFBTUMsMEJBQTBCLEdBQUdELDRCQUE0QixDQUFDRSxJQUFJLENBQUNDLG9CQUFvQjtBQUN6RixNQUFNQywwQkFBMEIsR0FBR0osNEJBQTRCLENBQUNFLElBQUksQ0FBQ0csb0JBQW9CO0FBRXpGLE1BQU1DLGdCQUFnQixTQUFTViwyQkFBMkIsQ0FBQztFQUV6RDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRVcsV0FBV0EsQ0FBRUMsS0FBSyxFQUFFQyxhQUFhLEVBQUVDLGNBQWMsRUFBRUMsT0FBTyxFQUFHO0lBQzNEQSxPQUFPLEdBQUdkLEtBQUssQ0FBRTtNQUNmZSxnQ0FBZ0MsRUFBRSxLQUFLO01BQUU7O01BRXpDO01BQ0FDLHVCQUF1QixFQUFFQyxVQUFVLElBQUk7UUFDckMsSUFBSSxDQUFDQyxvQkFBb0IsQ0FBRUQsVUFBVyxDQUFDO01BQ3pDO0lBQ0YsQ0FBQyxFQUFFSCxPQUFRLENBQUM7SUFDWixLQUFLLENBQUVILEtBQUssRUFBRUMsYUFBYSxFQUFFQyxjQUFjLEVBQUVDLE9BQVEsQ0FBQzs7SUFFdEQ7SUFDQSxJQUFJLENBQUNLLHdCQUF3QixHQUFHLElBQUlsQixtQkFBbUIsQ0FBQyxDQUFDO0lBRXpEVSxLQUFLLENBQUNTLG9CQUFvQixDQUFDQyxRQUFRLENBQUVDLFlBQVksSUFBSTtNQUNuRCxJQUFJLENBQUNDLG9CQUFvQixDQUFFRCxZQUFhLENBQUM7SUFDM0MsQ0FBRSxDQUFDO0VBQ0w7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRUMsb0JBQW9CQSxDQUFFRCxZQUFZLEVBQUc7SUFDbkMsSUFBSSxDQUFDSCx3QkFBd0IsQ0FBQ0ssS0FBSyxHQUFHLElBQUksQ0FBQ0MsdUJBQXVCLENBQUVILFlBQWEsQ0FBQztJQUNsRixJQUFJLENBQUNJLHlCQUF5QixDQUFFLElBQUksQ0FBQ1Asd0JBQXlCLENBQUM7RUFDakU7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRU0sdUJBQXVCQSxDQUFFSCxZQUFZLEVBQUc7SUFDdEMsT0FBT0EsWUFBWSxHQUFHbEIsMEJBQTBCLEdBQUdHLDBCQUEwQjtFQUMvRTtBQUNGO0FBRUFMLHFCQUFxQixDQUFDeUIsUUFBUSxDQUFFLGtCQUFrQixFQUFFbEIsZ0JBQWlCLENBQUM7QUFDdEUsZUFBZUEsZ0JBQWdCIn0=