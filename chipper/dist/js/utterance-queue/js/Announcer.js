// Copyright 2021-2022, University of Colorado Boulder

/**
 * Abstract base class for the type that wires into an UtteranceQueue to announce Utterances.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Emitter from '../../axon/js/Emitter.js';
import optionize from '../../phet-core/js/optionize.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import IOType from '../../tandem/js/types/IOType.js';
import NullableIO from '../../tandem/js/types/NullableIO.js';
import NumberIO from '../../tandem/js/types/NumberIO.js';
import OrIO from '../../tandem/js/types/OrIO.js';
import StringIO from '../../tandem/js/types/StringIO.js';
import Utterance from './Utterance.js';
import utteranceQueueNamespace from './utteranceQueueNamespace.js';

// Options for the announce method

class Announcer extends PhetioObject {
  // When an Utterance to be announced provided an alert in `ResponsePacket`-form, whether or
  // not to listen to the current values of responseCollector Properties, or to just combine all pieces of it no matter.

  // A flag that indicates to an UtteranceQueue that this Announcer is ready to speak the next Utterance.
  readyToAnnounce = true;

  // A flag that indicates whether this announcer has successfully spoken at least once.
  hasSpoken = false;

  // Emits an event when this Announcer is finished with an Utterance. It is up
  // to the Announcer subclass to emit this because different speech technologies may have different APIs
  // to determine when speaking is finished.
  constructor(providedOptions) {
    const options = optionize()({
      respectResponseCollectorProperties: true,
      tandem: Tandem.OPTIONAL,
      phetioType: Announcer.AnnouncerIO,
      phetioState: false
    }, providedOptions);
    super(options);
    this.respectResponseCollectorProperties = options.respectResponseCollectorProperties;
    this.announcementCompleteEmitter = new Emitter({
      parameters: [{
        name: 'utterance',
        phetioType: Utterance.UtteranceIO
      }, {
        name: 'text',
        phetioType: NullableIO(OrIO([StringIO, NumberIO]))
      }],
      tandem: options.tandem.createTandem('announcementCompleteEmitter'),
      phetioReadOnly: true,
      phetioDocumentation: 'The announcement that has just completed. The Utterance text could potentially differ from ' + 'the exact text that was announced, so both are emitted. Use `text` for an exact match of what was announced.'
    });
  }

  /**
   * Announce an alert, setting textContent to an aria-live element.
   *
   * @param announceText - The string that was formulated from the utterance
   * @param utterance - Utterance with content to announce
   * @param [providedOptions] - specify support for options particular to this announcer's features.
   */

  /**
   * Cancel announcement if this Announcer is currently announcing the Utterance. Does nothing
   * to queued Utterances. The announcer needs to implement cancellation of speech.
   */

  /**
   ’   * Cancel announcement of any Utterance that is being spoken. The announcer needs to implement cancellation of speech.
   */

  /**
   * Determine if one utterance should cancel another. Default behavior for this superclass is to cancel when
   * the new Utterance is of higher priority. But subclasses may re-implement this function if it has special logic
   * or announcerOptions that override this behavior.
   */
  shouldUtteranceCancelOther(utterance, utteranceToCancel) {
    return utteranceToCancel.priorityProperty.value < utterance.priorityProperty.value;
  }

  /**
   * Intended to be overridden by subtypes if necessary as a way to order the queue if there is announcer
   * specific logic.
   */
  onUtterancePriorityChange(utterance) {
    // See subclass for implementation
  }
  static AnnouncerIO = new IOType('AnnouncerIO', {
    valueType: Announcer,
    documentation: 'Announces text to a specific browser technology (like aria-live or web speech)'
  });
}
utteranceQueueNamespace.register('Announcer', Announcer);
export default Announcer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbWl0dGVyIiwib3B0aW9uaXplIiwiUGhldGlvT2JqZWN0IiwiVGFuZGVtIiwiSU9UeXBlIiwiTnVsbGFibGVJTyIsIk51bWJlcklPIiwiT3JJTyIsIlN0cmluZ0lPIiwiVXR0ZXJhbmNlIiwidXR0ZXJhbmNlUXVldWVOYW1lc3BhY2UiLCJBbm5vdW5jZXIiLCJyZWFkeVRvQW5ub3VuY2UiLCJoYXNTcG9rZW4iLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJyZXNwZWN0UmVzcG9uc2VDb2xsZWN0b3JQcm9wZXJ0aWVzIiwidGFuZGVtIiwiT1BUSU9OQUwiLCJwaGV0aW9UeXBlIiwiQW5ub3VuY2VySU8iLCJwaGV0aW9TdGF0ZSIsImFubm91bmNlbWVudENvbXBsZXRlRW1pdHRlciIsInBhcmFtZXRlcnMiLCJuYW1lIiwiVXR0ZXJhbmNlSU8iLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9SZWFkT25seSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJzaG91bGRVdHRlcmFuY2VDYW5jZWxPdGhlciIsInV0dGVyYW5jZSIsInV0dGVyYW5jZVRvQ2FuY2VsIiwicHJpb3JpdHlQcm9wZXJ0eSIsInZhbHVlIiwib25VdHRlcmFuY2VQcmlvcml0eUNoYW5nZSIsInZhbHVlVHlwZSIsImRvY3VtZW50YXRpb24iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkFubm91bmNlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBYnN0cmFjdCBiYXNlIGNsYXNzIGZvciB0aGUgdHlwZSB0aGF0IHdpcmVzIGludG8gYW4gVXR0ZXJhbmNlUXVldWUgdG8gYW5ub3VuY2UgVXR0ZXJhbmNlcy5cclxuICpcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XHJcbmltcG9ydCBURW1pdHRlciBmcm9tICcuLi8uLi9heG9uL2pzL1RFbWl0dGVyLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaGV0aW9PYmplY3QsIHsgUGhldGlvT2JqZWN0T3B0aW9ucyB9IGZyb20gJy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgTnVsbGFibGVJTyBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvTnVsbGFibGVJTy5qcyc7XHJcbmltcG9ydCBOdW1iZXJJTyBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvTnVtYmVySU8uanMnO1xyXG5pbXBvcnQgT3JJTyBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvT3JJTy5qcyc7XHJcbmltcG9ydCBTdHJpbmdJTyBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvU3RyaW5nSU8uanMnO1xyXG5pbXBvcnQgeyBSZXNvbHZlZFJlc3BvbnNlIH0gZnJvbSAnLi9SZXNwb25zZVBhY2tldC5qcyc7XHJcbmltcG9ydCBVdHRlcmFuY2UgZnJvbSAnLi9VdHRlcmFuY2UuanMnO1xyXG5pbXBvcnQgdXR0ZXJhbmNlUXVldWVOYW1lc3BhY2UgZnJvbSAnLi91dHRlcmFuY2VRdWV1ZU5hbWVzcGFjZS5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIHJlc3BlY3RSZXNwb25zZUNvbGxlY3RvclByb3BlcnRpZXM/OiBib29sZWFuO1xyXG59O1xyXG5cclxuLy8gT3B0aW9ucyBmb3IgdGhlIGFubm91bmNlIG1ldGhvZFxyXG5leHBvcnQgdHlwZSBBbm5vdW5jZXJBbm5vdW5jZU9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxuZXhwb3J0IHR5cGUgQW5ub3VuY2VyT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGhldGlvT2JqZWN0T3B0aW9ucztcclxuXHJcbmFic3RyYWN0IGNsYXNzIEFubm91bmNlciBleHRlbmRzIFBoZXRpb09iamVjdCB7XHJcblxyXG4gIC8vIFdoZW4gYW4gVXR0ZXJhbmNlIHRvIGJlIGFubm91bmNlZCBwcm92aWRlZCBhbiBhbGVydCBpbiBgUmVzcG9uc2VQYWNrZXRgLWZvcm0sIHdoZXRoZXIgb3JcclxuICAvLyBub3QgdG8gbGlzdGVuIHRvIHRoZSBjdXJyZW50IHZhbHVlcyBvZiByZXNwb25zZUNvbGxlY3RvciBQcm9wZXJ0aWVzLCBvciB0byBqdXN0IGNvbWJpbmUgYWxsIHBpZWNlcyBvZiBpdCBubyBtYXR0ZXIuXHJcbiAgcHVibGljIHJlYWRvbmx5IHJlc3BlY3RSZXNwb25zZUNvbGxlY3RvclByb3BlcnRpZXM6IGJvb2xlYW47XHJcblxyXG4gIC8vIEEgZmxhZyB0aGF0IGluZGljYXRlcyB0byBhbiBVdHRlcmFuY2VRdWV1ZSB0aGF0IHRoaXMgQW5ub3VuY2VyIGlzIHJlYWR5IHRvIHNwZWFrIHRoZSBuZXh0IFV0dGVyYW5jZS5cclxuICBwdWJsaWMgcmVhZHlUb0Fubm91bmNlID0gdHJ1ZTtcclxuXHJcbiAgLy8gQSBmbGFnIHRoYXQgaW5kaWNhdGVzIHdoZXRoZXIgdGhpcyBhbm5vdW5jZXIgaGFzIHN1Y2Nlc3NmdWxseSBzcG9rZW4gYXQgbGVhc3Qgb25jZS5cclxuICBwdWJsaWMgaGFzU3Bva2VuID0gZmFsc2U7XHJcblxyXG4gIC8vIEVtaXRzIGFuIGV2ZW50IHdoZW4gdGhpcyBBbm5vdW5jZXIgaXMgZmluaXNoZWQgd2l0aCBhbiBVdHRlcmFuY2UuIEl0IGlzIHVwXHJcbiAgLy8gdG8gdGhlIEFubm91bmNlciBzdWJjbGFzcyB0byBlbWl0IHRoaXMgYmVjYXVzZSBkaWZmZXJlbnQgc3BlZWNoIHRlY2hub2xvZ2llcyBtYXkgaGF2ZSBkaWZmZXJlbnQgQVBJc1xyXG4gIC8vIHRvIGRldGVybWluZSB3aGVuIHNwZWFraW5nIGlzIGZpbmlzaGVkLlxyXG4gIHB1YmxpYyByZWFkb25seSBhbm5vdW5jZW1lbnRDb21wbGV0ZUVtaXR0ZXI6IFRFbWl0dGVyPFsgVXR0ZXJhbmNlLCBSZXNvbHZlZFJlc3BvbnNlIF0+O1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IEFubm91bmNlck9wdGlvbnMgKSB7XHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEFubm91bmNlck9wdGlvbnMsIFNlbGZPcHRpb25zLCBQaGV0aW9PYmplY3RPcHRpb25zPigpKCB7XHJcbiAgICAgIHJlc3BlY3RSZXNwb25zZUNvbGxlY3RvclByb3BlcnRpZXM6IHRydWUsXHJcblxyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRJT05BTCxcclxuICAgICAgcGhldGlvVHlwZTogQW5ub3VuY2VyLkFubm91bmNlcklPLFxyXG4gICAgICBwaGV0aW9TdGF0ZTogZmFsc2VcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5yZXNwZWN0UmVzcG9uc2VDb2xsZWN0b3JQcm9wZXJ0aWVzID0gb3B0aW9ucy5yZXNwZWN0UmVzcG9uc2VDb2xsZWN0b3JQcm9wZXJ0aWVzO1xyXG5cclxuICAgIHRoaXMuYW5ub3VuY2VtZW50Q29tcGxldGVFbWl0dGVyID0gbmV3IEVtaXR0ZXIoIHtcclxuICAgICAgcGFyYW1ldGVyczogWyB7XHJcbiAgICAgICAgbmFtZTogJ3V0dGVyYW5jZScsIHBoZXRpb1R5cGU6IFV0dGVyYW5jZS5VdHRlcmFuY2VJT1xyXG4gICAgICB9LCB7XHJcbiAgICAgICAgbmFtZTogJ3RleHQnLFxyXG4gICAgICAgIHBoZXRpb1R5cGU6IE51bGxhYmxlSU8oIE9ySU8oIFsgU3RyaW5nSU8sIE51bWJlcklPIF0gKSApXHJcbiAgICAgIH0gXSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdhbm5vdW5jZW1lbnRDb21wbGV0ZUVtaXR0ZXInICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVGhlIGFubm91bmNlbWVudCB0aGF0IGhhcyBqdXN0IGNvbXBsZXRlZC4gVGhlIFV0dGVyYW5jZSB0ZXh0IGNvdWxkIHBvdGVudGlhbGx5IGRpZmZlciBmcm9tICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAndGhlIGV4YWN0IHRleHQgdGhhdCB3YXMgYW5ub3VuY2VkLCBzbyBib3RoIGFyZSBlbWl0dGVkLiBVc2UgYHRleHRgIGZvciBhbiBleGFjdCBtYXRjaCBvZiB3aGF0IHdhcyBhbm5vdW5jZWQuJ1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQW5ub3VuY2UgYW4gYWxlcnQsIHNldHRpbmcgdGV4dENvbnRlbnQgdG8gYW4gYXJpYS1saXZlIGVsZW1lbnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gYW5ub3VuY2VUZXh0IC0gVGhlIHN0cmluZyB0aGF0IHdhcyBmb3JtdWxhdGVkIGZyb20gdGhlIHV0dGVyYW5jZVxyXG4gICAqIEBwYXJhbSB1dHRlcmFuY2UgLSBVdHRlcmFuY2Ugd2l0aCBjb250ZW50IHRvIGFubm91bmNlXHJcbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdIC0gc3BlY2lmeSBzdXBwb3J0IGZvciBvcHRpb25zIHBhcnRpY3VsYXIgdG8gdGhpcyBhbm5vdW5jZXIncyBmZWF0dXJlcy5cclxuICAgKi9cclxuICBwdWJsaWMgYWJzdHJhY3QgYW5ub3VuY2UoIGFubm91bmNlVGV4dDogUmVzb2x2ZWRSZXNwb25zZSwgdXR0ZXJhbmNlOiBVdHRlcmFuY2UsIHByb3ZpZGVkT3B0aW9ucz86IEFubm91bmNlckFubm91bmNlT3B0aW9ucyApOiB2b2lkO1xyXG5cclxuICAvKipcclxuICAgKiBDYW5jZWwgYW5ub3VuY2VtZW50IGlmIHRoaXMgQW5ub3VuY2VyIGlzIGN1cnJlbnRseSBhbm5vdW5jaW5nIHRoZSBVdHRlcmFuY2UuIERvZXMgbm90aGluZ1xyXG4gICAqIHRvIHF1ZXVlZCBVdHRlcmFuY2VzLiBUaGUgYW5ub3VuY2VyIG5lZWRzIHRvIGltcGxlbWVudCBjYW5jZWxsYXRpb24gb2Ygc3BlZWNoLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhYnN0cmFjdCBjYW5jZWxVdHRlcmFuY2UoIHV0dGVyYW5jZTogVXR0ZXJhbmNlICk6IHZvaWQ7XHJcblxyXG4gIC8qKlxyXG4gICDigJkgICAqIENhbmNlbCBhbm5vdW5jZW1lbnQgb2YgYW55IFV0dGVyYW5jZSB0aGF0IGlzIGJlaW5nIHNwb2tlbi4gVGhlIGFubm91bmNlciBuZWVkcyB0byBpbXBsZW1lbnQgY2FuY2VsbGF0aW9uIG9mIHNwZWVjaC5cclxuICAgKi9cclxuICBwdWJsaWMgYWJzdHJhY3QgY2FuY2VsKCk6IHZvaWQ7XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZSBpZiBvbmUgdXR0ZXJhbmNlIHNob3VsZCBjYW5jZWwgYW5vdGhlci4gRGVmYXVsdCBiZWhhdmlvciBmb3IgdGhpcyBzdXBlcmNsYXNzIGlzIHRvIGNhbmNlbCB3aGVuXHJcbiAgICogdGhlIG5ldyBVdHRlcmFuY2UgaXMgb2YgaGlnaGVyIHByaW9yaXR5LiBCdXQgc3ViY2xhc3NlcyBtYXkgcmUtaW1wbGVtZW50IHRoaXMgZnVuY3Rpb24gaWYgaXQgaGFzIHNwZWNpYWwgbG9naWNcclxuICAgKiBvciBhbm5vdW5jZXJPcHRpb25zIHRoYXQgb3ZlcnJpZGUgdGhpcyBiZWhhdmlvci5cclxuICAgKi9cclxuICBwdWJsaWMgc2hvdWxkVXR0ZXJhbmNlQ2FuY2VsT3RoZXIoIHV0dGVyYW5jZTogVXR0ZXJhbmNlLCB1dHRlcmFuY2VUb0NhbmNlbDogVXR0ZXJhbmNlICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHV0dGVyYW5jZVRvQ2FuY2VsLnByaW9yaXR5UHJvcGVydHkudmFsdWUgPCB1dHRlcmFuY2UucHJpb3JpdHlQcm9wZXJ0eS52YWx1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEludGVuZGVkIHRvIGJlIG92ZXJyaWRkZW4gYnkgc3VidHlwZXMgaWYgbmVjZXNzYXJ5IGFzIGEgd2F5IHRvIG9yZGVyIHRoZSBxdWV1ZSBpZiB0aGVyZSBpcyBhbm5vdW5jZXJcclxuICAgKiBzcGVjaWZpYyBsb2dpYy5cclxuICAgKi9cclxuICBwdWJsaWMgb25VdHRlcmFuY2VQcmlvcml0eUNoYW5nZSggdXR0ZXJhbmNlOiBVdHRlcmFuY2UgKTogdm9pZCB7XHJcbiAgICAvLyBTZWUgc3ViY2xhc3MgZm9yIGltcGxlbWVudGF0aW9uXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIEFubm91bmNlcklPID0gbmV3IElPVHlwZSggJ0Fubm91bmNlcklPJywge1xyXG4gICAgdmFsdWVUeXBlOiBBbm5vdW5jZXIsXHJcbiAgICBkb2N1bWVudGF0aW9uOiAnQW5ub3VuY2VzIHRleHQgdG8gYSBzcGVjaWZpYyBicm93c2VyIHRlY2hub2xvZ3kgKGxpa2UgYXJpYS1saXZlIG9yIHdlYiBzcGVlY2gpJ1xyXG4gIH0gKTtcclxufVxyXG5cclxudXR0ZXJhbmNlUXVldWVOYW1lc3BhY2UucmVnaXN0ZXIoICdBbm5vdW5jZXInLCBBbm5vdW5jZXIgKTtcclxuZXhwb3J0IGRlZmF1bHQgQW5ub3VuY2VyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sMEJBQTBCO0FBRTlDLE9BQU9DLFNBQVMsTUFBNEIsaUNBQWlDO0FBQzdFLE9BQU9DLFlBQVksTUFBK0IsaUNBQWlDO0FBQ25GLE9BQU9DLE1BQU0sTUFBTSwyQkFBMkI7QUFDOUMsT0FBT0MsTUFBTSxNQUFNLGlDQUFpQztBQUNwRCxPQUFPQyxVQUFVLE1BQU0scUNBQXFDO0FBQzVELE9BQU9DLFFBQVEsTUFBTSxtQ0FBbUM7QUFDeEQsT0FBT0MsSUFBSSxNQUFNLCtCQUErQjtBQUNoRCxPQUFPQyxRQUFRLE1BQU0sbUNBQW1DO0FBRXhELE9BQU9DLFNBQVMsTUFBTSxnQkFBZ0I7QUFDdEMsT0FBT0MsdUJBQXVCLE1BQU0sOEJBQThCOztBQU1sRTs7QUFLQSxNQUFlQyxTQUFTLFNBQVNULFlBQVksQ0FBQztFQUU1QztFQUNBOztFQUdBO0VBQ09VLGVBQWUsR0FBRyxJQUFJOztFQUU3QjtFQUNPQyxTQUFTLEdBQUcsS0FBSzs7RUFFeEI7RUFDQTtFQUNBO0VBR09DLFdBQVdBLENBQUVDLGVBQWtDLEVBQUc7SUFDdkQsTUFBTUMsT0FBTyxHQUFHZixTQUFTLENBQXFELENBQUMsQ0FBRTtNQUMvRWdCLGtDQUFrQyxFQUFFLElBQUk7TUFFeENDLE1BQU0sRUFBRWYsTUFBTSxDQUFDZ0IsUUFBUTtNQUN2QkMsVUFBVSxFQUFFVCxTQUFTLENBQUNVLFdBQVc7TUFDakNDLFdBQVcsRUFBRTtJQUNmLENBQUMsRUFBRVAsZUFBZ0IsQ0FBQztJQUVwQixLQUFLLENBQUVDLE9BQVEsQ0FBQztJQUVoQixJQUFJLENBQUNDLGtDQUFrQyxHQUFHRCxPQUFPLENBQUNDLGtDQUFrQztJQUVwRixJQUFJLENBQUNNLDJCQUEyQixHQUFHLElBQUl2QixPQUFPLENBQUU7TUFDOUN3QixVQUFVLEVBQUUsQ0FBRTtRQUNaQyxJQUFJLEVBQUUsV0FBVztRQUFFTCxVQUFVLEVBQUVYLFNBQVMsQ0FBQ2lCO01BQzNDLENBQUMsRUFBRTtRQUNERCxJQUFJLEVBQUUsTUFBTTtRQUNaTCxVQUFVLEVBQUVmLFVBQVUsQ0FBRUUsSUFBSSxDQUFFLENBQUVDLFFBQVEsRUFBRUYsUUFBUSxDQUFHLENBQUU7TUFDekQsQ0FBQyxDQUFFO01BQ0hZLE1BQU0sRUFBRUYsT0FBTyxDQUFDRSxNQUFNLENBQUNTLFlBQVksQ0FBRSw2QkFBOEIsQ0FBQztNQUNwRUMsY0FBYyxFQUFFLElBQUk7TUFDcEJDLG1CQUFtQixFQUFFLDZGQUE2RixHQUM3RjtJQUN2QixDQUFFLENBQUM7RUFDTDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7RUFHRTtBQUNGO0FBQ0E7QUFDQTs7RUFHRTtBQUNGO0FBQ0E7O0VBR0U7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNTQywwQkFBMEJBLENBQUVDLFNBQW9CLEVBQUVDLGlCQUE0QixFQUFZO0lBQy9GLE9BQU9BLGlCQUFpQixDQUFDQyxnQkFBZ0IsQ0FBQ0MsS0FBSyxHQUFHSCxTQUFTLENBQUNFLGdCQUFnQixDQUFDQyxLQUFLO0VBQ3BGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ1NDLHlCQUF5QkEsQ0FBRUosU0FBb0IsRUFBUztJQUM3RDtFQUFBO0VBR0YsT0FBY1YsV0FBVyxHQUFHLElBQUlqQixNQUFNLENBQUUsYUFBYSxFQUFFO0lBQ3JEZ0MsU0FBUyxFQUFFekIsU0FBUztJQUNwQjBCLGFBQWEsRUFBRTtFQUNqQixDQUFFLENBQUM7QUFDTDtBQUVBM0IsdUJBQXVCLENBQUM0QixRQUFRLENBQUUsV0FBVyxFQUFFM0IsU0FBVSxDQUFDO0FBQzFELGVBQWVBLFNBQVMifQ==