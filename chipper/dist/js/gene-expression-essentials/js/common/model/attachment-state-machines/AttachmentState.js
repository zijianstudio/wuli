// Copyright 2015-2020, University of Colorado Boulder

/**
 * Base class for individual attachment states, used by the various attachment state machines.
 *
 * @author John Blanco
 * @author Mohamed Safi
 * @author Aadish Gupta
 */

import geneExpressionEssentials from '../../../geneExpressionEssentials.js';
class AttachmentState {
  /**
   * @abstract class
   */
  constructor() {
    // does nothing in base type
  }

  /**
   * Step function for this attachment state and is called by the step function of AttachmentStateMachine
   * @param {AttachmentStateMachine} enclosingStateMachine
   * @param {number} dt
   * @public
   */
  step(enclosingStateMachine, dt) {
    // By default does nothing, override to implement unique behavior.
  }

  /**
   * This is called whenever biomolecules state changes. This is called when setState function of
   * AttachmentStateMachine is called
   * @param {AttachmentStateMachine} enclosingStateMachine
   * @public
   */
  entered(enclosingStateMachine) {
    // By default does nothing, override to implement unique behavior.
  }
}

// Distance within which a molecule is considered to be attached to an attachment site. This essentially avoids
// floating point issues.
AttachmentState.ATTACHED_DISTANCE_THRESHOLD = 1;
geneExpressionEssentials.register('AttachmentState', AttachmentState);
export default AttachmentState;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMiLCJBdHRhY2htZW50U3RhdGUiLCJjb25zdHJ1Y3RvciIsInN0ZXAiLCJlbmNsb3NpbmdTdGF0ZU1hY2hpbmUiLCJkdCIsImVudGVyZWQiLCJBVFRBQ0hFRF9ESVNUQU5DRV9USFJFU0hPTEQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkF0dGFjaG1lbnRTdGF0ZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCYXNlIGNsYXNzIGZvciBpbmRpdmlkdWFsIGF0dGFjaG1lbnQgc3RhdGVzLCB1c2VkIGJ5IHRoZSB2YXJpb3VzIGF0dGFjaG1lbnQgc3RhdGUgbWFjaGluZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBNb2hhbWVkIFNhZmlcclxuICogQGF1dGhvciBBYWRpc2ggR3VwdGFcclxuICovXHJcblxyXG5pbXBvcnQgZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzIGZyb20gJy4uLy4uLy4uL2dlbmVFeHByZXNzaW9uRXNzZW50aWFscy5qcyc7XHJcblxyXG5jbGFzcyBBdHRhY2htZW50U3RhdGUge1xyXG5cclxuICAvKipcclxuICAgKiBAYWJzdHJhY3QgY2xhc3NcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIC8vIGRvZXMgbm90aGluZyBpbiBiYXNlIHR5cGVcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0ZXAgZnVuY3Rpb24gZm9yIHRoaXMgYXR0YWNobWVudCBzdGF0ZSBhbmQgaXMgY2FsbGVkIGJ5IHRoZSBzdGVwIGZ1bmN0aW9uIG9mIEF0dGFjaG1lbnRTdGF0ZU1hY2hpbmVcclxuICAgKiBAcGFyYW0ge0F0dGFjaG1lbnRTdGF0ZU1hY2hpbmV9IGVuY2xvc2luZ1N0YXRlTWFjaGluZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBlbmNsb3NpbmdTdGF0ZU1hY2hpbmUsIGR0ICkge1xyXG4gICAgLy8gQnkgZGVmYXVsdCBkb2VzIG5vdGhpbmcsIG92ZXJyaWRlIHRvIGltcGxlbWVudCB1bmlxdWUgYmVoYXZpb3IuXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGlzIGlzIGNhbGxlZCB3aGVuZXZlciBiaW9tb2xlY3VsZXMgc3RhdGUgY2hhbmdlcy4gVGhpcyBpcyBjYWxsZWQgd2hlbiBzZXRTdGF0ZSBmdW5jdGlvbiBvZlxyXG4gICAqIEF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUgaXMgY2FsbGVkXHJcbiAgICogQHBhcmFtIHtBdHRhY2htZW50U3RhdGVNYWNoaW5lfSBlbmNsb3NpbmdTdGF0ZU1hY2hpbmVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZW50ZXJlZCggZW5jbG9zaW5nU3RhdGVNYWNoaW5lICkge1xyXG4gICAgLy8gQnkgZGVmYXVsdCBkb2VzIG5vdGhpbmcsIG92ZXJyaWRlIHRvIGltcGxlbWVudCB1bmlxdWUgYmVoYXZpb3IuXHJcbiAgfVxyXG5cclxufVxyXG5cclxuLy8gRGlzdGFuY2Ugd2l0aGluIHdoaWNoIGEgbW9sZWN1bGUgaXMgY29uc2lkZXJlZCB0byBiZSBhdHRhY2hlZCB0byBhbiBhdHRhY2htZW50IHNpdGUuIFRoaXMgZXNzZW50aWFsbHkgYXZvaWRzXHJcbi8vIGZsb2F0aW5nIHBvaW50IGlzc3Vlcy5cclxuQXR0YWNobWVudFN0YXRlLkFUVEFDSEVEX0RJU1RBTkNFX1RIUkVTSE9MRCA9IDE7XHJcblxyXG5nZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMucmVnaXN0ZXIoICdBdHRhY2htZW50U3RhdGUnLCBBdHRhY2htZW50U3RhdGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEF0dGFjaG1lbnRTdGF0ZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLHdCQUF3QixNQUFNLHNDQUFzQztBQUUzRSxNQUFNQyxlQUFlLENBQUM7RUFFcEI7QUFDRjtBQUNBO0VBQ0VDLFdBQVdBLENBQUEsRUFBRztJQUNaO0VBQUE7O0VBR0Y7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLElBQUlBLENBQUVDLHFCQUFxQixFQUFFQyxFQUFFLEVBQUc7SUFDaEM7RUFBQTs7RUFHRjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsT0FBT0EsQ0FBRUYscUJBQXFCLEVBQUc7SUFDL0I7RUFBQTtBQUdKOztBQUVBO0FBQ0E7QUFDQUgsZUFBZSxDQUFDTSwyQkFBMkIsR0FBRyxDQUFDO0FBRS9DUCx3QkFBd0IsQ0FBQ1EsUUFBUSxDQUFFLGlCQUFpQixFQUFFUCxlQUFnQixDQUFDO0FBRXZFLGVBQWVBLGVBQWUifQ==