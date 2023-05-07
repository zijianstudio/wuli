// Copyright 2022, University of Colorado Boulder

/**
 * Generic base class responsible for interfacing between a Node to alert description.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import { Voicing } from '../../../../scenery/js/imports.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import sceneryPhet from '../../sceneryPhet.js';
class Alerter {
  constructor(providedOptions) {
    const options = optionize()({
      alertToVoicing: true,
      descriptionAlertNode: null
    }, providedOptions);
    this.alertToVoicing = options.alertToVoicing;
    this.descriptionAlertNode = options.descriptionAlertNode;
  }

  /**
   * Alert to both description and voicing utteranceQueues, depending on if both are supported by this instance
   */
  alert(alertable) {
    if (this.alertToVoicing) {
      assert && assert(alertable instanceof Utterance, 'If alerting to Voicing, the alertable needs to be an Utterance'); // eslint-disable-line no-simple-type-checking-assertions
      Voicing.alertUtterance(alertable);
    }
    this.alertDescriptionUtterance(alertable);
  }

  /**
   * Forward to provided Node for UtteranceQueue alerting logic. See ParallelDOM.alertDescriptionUtterance() for details.
   */
  alertDescriptionUtterance(alertable) {
    this.descriptionAlertNode && this.descriptionAlertNode.alertDescriptionUtterance(alertable);
  }

  /**
   * Forward to provided Node for UtteranceQueue alerting logic. See ParallelDOM.forEachUtteranceQueue() for details.
   */
  forEachUtteranceQueue(utteranceQueueCallback) {
    this.descriptionAlertNode && this.descriptionAlertNode.forEachUtteranceQueue(utteranceQueueCallback);
  }
}
sceneryPhet.register('Alerter', Alerter);
export default Alerter;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJWb2ljaW5nIiwiVXR0ZXJhbmNlIiwic2NlbmVyeVBoZXQiLCJBbGVydGVyIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiYWxlcnRUb1ZvaWNpbmciLCJkZXNjcmlwdGlvbkFsZXJ0Tm9kZSIsImFsZXJ0IiwiYWxlcnRhYmxlIiwiYXNzZXJ0IiwiYWxlcnRVdHRlcmFuY2UiLCJhbGVydERlc2NyaXB0aW9uVXR0ZXJhbmNlIiwiZm9yRWFjaFV0dGVyYW5jZVF1ZXVlIiwidXR0ZXJhbmNlUXVldWVDYWxsYmFjayIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQWxlcnRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogR2VuZXJpYyBiYXNlIGNsYXNzIHJlc3BvbnNpYmxlIGZvciBpbnRlcmZhY2luZyBiZXR3ZWVuIGEgTm9kZSB0byBhbGVydCBkZXNjcmlwdGlvbi5cclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFZvaWNpbmcgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVXR0ZXJhbmNlLCB7IFRBbGVydGFibGUgfSBmcm9tICcuLi8uLi8uLi8uLi91dHRlcmFuY2UtcXVldWUvanMvVXR0ZXJhbmNlLmpzJztcclxuaW1wb3J0IFV0dGVyYW5jZVF1ZXVlIGZyb20gJy4uLy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9VdHRlcmFuY2VRdWV1ZS5qcyc7XHJcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuLi8uLi9zY2VuZXJ5UGhldC5qcyc7XHJcblxyXG50eXBlIFV0dGVyYW5jZVF1ZXVlQ2FsbGJhY2sgPSAoIHF1ZXVlOiBVdHRlcmFuY2VRdWV1ZSApID0+IHZvaWQ7XHJcblxyXG5leHBvcnQgdHlwZSBBbGVydGVyT3B0aW9ucyA9IHtcclxuXHJcbiAgLy8gV2hlbiB0cnVlLCBhbGVydHMgd2lsbCBiZSBzZW50IHRvIHRoZSB2b2ljaW5nVXR0ZXJhbmNlUXVldWUuIFRoaXMgc2h1dG9mZiB2YWx2ZSBpcyBzaW1pbGFyIHRvXHJcbiAgLy8gZGVzY3JpcHRpb25BbGVydE5vZGUsIGJ1dCBmb3Igdm9pY2luZy5cclxuICBhbGVydFRvVm9pY2luZz86IGJvb2xlYW47XHJcblxyXG4gIC8vIElmIHByb3ZpZGVkLCB1c2UgdGhpcyBOb2RlIHRvIHNlbmQgZGVzY3JpcHRpb24gYWxlcnRzIHRvIG9uZSBvciBtb3JlIERpc3BsYXkncyBVdHRlcmFuY2VRdWV1ZS4gVW5saWtlIGZvclxyXG4gIC8vIFZvaWNpbmcsIGRlc2NyaXB0aW9uIGFsZXJ0cyBtdXN0IG9jY3VyIHRocm91Z2ggYSBOb2RlIGNvbm5lY3RlZCB0byBhIERpc3BsYXkgdGhyb3VnaCB0aGUgc2NlbmUgZ3JhcGguIElmIG51bGwsXHJcbiAgLy8gZG8gbm90IGFsZXJ0IGZvciBkZXNjcmlwdGlvbiAoc2FtZSBhcyBhbGVydFRvVm9pY2luZzpmYWxzZSkuIE5PVEU6IE5vIGRlc2NyaXB0aW9uIHdpbGwgYWxlcnQgd2l0aG91dCB0aGlzIG9wdGlvbiFcclxuICBkZXNjcmlwdGlvbkFsZXJ0Tm9kZT86IE5vZGUgfCBudWxsO1xyXG59O1xyXG5cclxuY2xhc3MgQWxlcnRlciB7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBhbGVydFRvVm9pY2luZzogYm9vbGVhbjtcclxuICBwdWJsaWMgcmVhZG9ubHkgZGVzY3JpcHRpb25BbGVydE5vZGU6IE5vZGUgfCBudWxsO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IEFsZXJ0ZXJPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8QWxlcnRlck9wdGlvbnM+KCkoIHtcclxuICAgICAgYWxlcnRUb1ZvaWNpbmc6IHRydWUsXHJcbiAgICAgIGRlc2NyaXB0aW9uQWxlcnROb2RlOiBudWxsXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmFsZXJ0VG9Wb2ljaW5nID0gb3B0aW9ucy5hbGVydFRvVm9pY2luZztcclxuICAgIHRoaXMuZGVzY3JpcHRpb25BbGVydE5vZGUgPSBvcHRpb25zLmRlc2NyaXB0aW9uQWxlcnROb2RlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWxlcnQgdG8gYm90aCBkZXNjcmlwdGlvbiBhbmQgdm9pY2luZyB1dHRlcmFuY2VRdWV1ZXMsIGRlcGVuZGluZyBvbiBpZiBib3RoIGFyZSBzdXBwb3J0ZWQgYnkgdGhpcyBpbnN0YW5jZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBhbGVydCggYWxlcnRhYmxlOiBUQWxlcnRhYmxlICk6IHZvaWQge1xyXG4gICAgaWYgKCB0aGlzLmFsZXJ0VG9Wb2ljaW5nICkge1xyXG5cclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggYWxlcnRhYmxlIGluc3RhbmNlb2YgVXR0ZXJhbmNlLCAnSWYgYWxlcnRpbmcgdG8gVm9pY2luZywgdGhlIGFsZXJ0YWJsZSBuZWVkcyB0byBiZSBhbiBVdHRlcmFuY2UnICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2ltcGxlLXR5cGUtY2hlY2tpbmctYXNzZXJ0aW9uc1xyXG4gICAgICBWb2ljaW5nLmFsZXJ0VXR0ZXJhbmNlKCBhbGVydGFibGUgYXMgVXR0ZXJhbmNlICk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5hbGVydERlc2NyaXB0aW9uVXR0ZXJhbmNlKCBhbGVydGFibGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZvcndhcmQgdG8gcHJvdmlkZWQgTm9kZSBmb3IgVXR0ZXJhbmNlUXVldWUgYWxlcnRpbmcgbG9naWMuIFNlZSBQYXJhbGxlbERPTS5hbGVydERlc2NyaXB0aW9uVXR0ZXJhbmNlKCkgZm9yIGRldGFpbHMuXHJcbiAgICovXHJcbiAgcHVibGljIGFsZXJ0RGVzY3JpcHRpb25VdHRlcmFuY2UoIGFsZXJ0YWJsZTogVEFsZXJ0YWJsZSApOiB2b2lkIHtcclxuICAgIHRoaXMuZGVzY3JpcHRpb25BbGVydE5vZGUgJiYgdGhpcy5kZXNjcmlwdGlvbkFsZXJ0Tm9kZS5hbGVydERlc2NyaXB0aW9uVXR0ZXJhbmNlKCBhbGVydGFibGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZvcndhcmQgdG8gcHJvdmlkZWQgTm9kZSBmb3IgVXR0ZXJhbmNlUXVldWUgYWxlcnRpbmcgbG9naWMuIFNlZSBQYXJhbGxlbERPTS5mb3JFYWNoVXR0ZXJhbmNlUXVldWUoKSBmb3IgZGV0YWlscy5cclxuICAgKi9cclxuICBwdWJsaWMgZm9yRWFjaFV0dGVyYW5jZVF1ZXVlKCB1dHRlcmFuY2VRdWV1ZUNhbGxiYWNrOiBVdHRlcmFuY2VRdWV1ZUNhbGxiYWNrICk6IHZvaWQge1xyXG4gICAgdGhpcy5kZXNjcmlwdGlvbkFsZXJ0Tm9kZSAmJiB0aGlzLmRlc2NyaXB0aW9uQWxlcnROb2RlLmZvckVhY2hVdHRlcmFuY2VRdWV1ZSggdXR0ZXJhbmNlUXVldWVDYWxsYmFjayApO1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdBbGVydGVyJywgQWxlcnRlciApO1xyXG5leHBvcnQgZGVmYXVsdCBBbGVydGVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLHVDQUF1QztBQUM3RCxTQUFlQyxPQUFPLFFBQVEsbUNBQW1DO0FBQ2pFLE9BQU9DLFNBQVMsTUFBc0IsNkNBQTZDO0FBRW5GLE9BQU9DLFdBQVcsTUFBTSxzQkFBc0I7QUFnQjlDLE1BQU1DLE9BQU8sQ0FBQztFQUtMQyxXQUFXQSxDQUFFQyxlQUFnQyxFQUFHO0lBRXJELE1BQU1DLE9BQU8sR0FBR1AsU0FBUyxDQUFpQixDQUFDLENBQUU7TUFDM0NRLGNBQWMsRUFBRSxJQUFJO01BQ3BCQyxvQkFBb0IsRUFBRTtJQUN4QixDQUFDLEVBQUVILGVBQWdCLENBQUM7SUFFcEIsSUFBSSxDQUFDRSxjQUFjLEdBQUdELE9BQU8sQ0FBQ0MsY0FBYztJQUM1QyxJQUFJLENBQUNDLG9CQUFvQixHQUFHRixPQUFPLENBQUNFLG9CQUFvQjtFQUMxRDs7RUFFQTtBQUNGO0FBQ0E7RUFDU0MsS0FBS0EsQ0FBRUMsU0FBcUIsRUFBUztJQUMxQyxJQUFLLElBQUksQ0FBQ0gsY0FBYyxFQUFHO01BRXpCSSxNQUFNLElBQUlBLE1BQU0sQ0FBRUQsU0FBUyxZQUFZVCxTQUFTLEVBQUUsZ0VBQWlFLENBQUMsQ0FBQyxDQUFDO01BQ3RIRCxPQUFPLENBQUNZLGNBQWMsQ0FBRUYsU0FBdUIsQ0FBQztJQUNsRDtJQUVBLElBQUksQ0FBQ0cseUJBQXlCLENBQUVILFNBQVUsQ0FBQztFQUM3Qzs7RUFFQTtBQUNGO0FBQ0E7RUFDU0cseUJBQXlCQSxDQUFFSCxTQUFxQixFQUFTO0lBQzlELElBQUksQ0FBQ0Ysb0JBQW9CLElBQUksSUFBSSxDQUFDQSxvQkFBb0IsQ0FBQ0sseUJBQXlCLENBQUVILFNBQVUsQ0FBQztFQUMvRjs7RUFFQTtBQUNGO0FBQ0E7RUFDU0kscUJBQXFCQSxDQUFFQyxzQkFBOEMsRUFBUztJQUNuRixJQUFJLENBQUNQLG9CQUFvQixJQUFJLElBQUksQ0FBQ0Esb0JBQW9CLENBQUNNLHFCQUFxQixDQUFFQyxzQkFBdUIsQ0FBQztFQUN4RztBQUNGO0FBRUFiLFdBQVcsQ0FBQ2MsUUFBUSxDQUFFLFNBQVMsRUFBRWIsT0FBUSxDQUFDO0FBQzFDLGVBQWVBLE9BQU8ifQ==