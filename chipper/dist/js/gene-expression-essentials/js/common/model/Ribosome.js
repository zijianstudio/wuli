// Copyright 2015-2021, University of Colorado Boulder

/**
 * Class that represents the ribosome in the model.
 *
 * @author John Blanco
 * @author Mohamed Safi
 * @author Aadish Gupta
 */

//modules
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Color } from '../../../../scenery/js/imports.js';
import geneExpressionEssentials from '../../geneExpressionEssentials.js';
import RibosomeAttachmentStateMachine from './attachment-state-machines/RibosomeAttachmentStateMachine.js';
import MobileBiomolecule from './MobileBiomolecule.js';
import ShapeUtils from './ShapeUtils.js';

// constants
const WIDTH = 430; // In nanometers.
const OVERALL_HEIGHT = 450; // In nanometers.
const TOP_SUBUNIT_HEIGHT_PROPORTION = 0.6;
const TOP_SUBUNIT_HEIGHT = OVERALL_HEIGHT * TOP_SUBUNIT_HEIGHT_PROPORTION;
const BOTTOM_SUBUNIT_HEIGHT = OVERALL_HEIGHT * (1 - TOP_SUBUNIT_HEIGHT_PROPORTION);

// Offset from the center position to the entrance of the translation channel. May require some tweaking if the shape
// changes.
const OFFSET_TO_TRANSLATION_CHANNEL_ENTRANCE = new Vector2(WIDTH * 0.45, -OVERALL_HEIGHT * 0.23);

// Offset from the center position to the point from which the protein emerges. May require some tweaking if the overall
// shape changes.
const OFFSET_TO_PROTEIN_OUTPUT_CHANNEL = new Vector2(WIDTH * 0.4, OVERALL_HEIGHT * 0.55);

// a counter used to create a unique ID for each instance
let instanceCounter = 0;
class Ribosome extends MobileBiomolecule {
  /**
   * @param {GeneExpressionModel} model
   * @param {Vector2} position
   */
  constructor(model, position) {
    super(model, Ribosome.createShape(), new Color(205, 155, 29));
    this.offsetToTranslationChannelEntrance = OFFSET_TO_TRANSLATION_CHANNEL_ENTRANCE; // @public
    position = position || new Vector2(0, 0);
    this.setPosition(position);

    // @private {MessengerRna} messenger RNA being translated, null if no translation is in progress
    this.messengerRnaBeingTranslated = null; // @private

    // @public (read-only) {String} - unique ID for this instance
    this.id = `ribosome-${instanceCounter++}`;
  }

  /**
   * @returns {MessengerRna}
   * @public
   */
  getMessengerRnaBeingTranslated() {
    return this.messengerRnaBeingTranslated;
  }

  /**
   * Scan for mRNA and propose attachments to any that are found. It is up to the mRNA to accept or refuse based on
   * distance, availability, or whatever.
   *
   * This method is called from the attachment state machine framework.
   * @override
   * @public
   */
  proposeAttachments() {
    let attachmentSite = null;
    const messengerRnaList = this.model.getMessengerRnaList();
    for (let i = 0; i < messengerRnaList.length; i++) {
      const messengerRna = messengerRnaList.get(i);
      attachmentSite = messengerRna.considerProposalFromRibosome(this);
      if (attachmentSite !== null) {
        // Proposal accepted.
        this.messengerRnaBeingTranslated = messengerRna;
        break;
      }
    }
    return attachmentSite;
  }

  /**
   * Release the messenger RNA
   * @public
   */
  releaseMessengerRna() {
    this.messengerRnaBeingTranslated.releaseFromRibosome(this);
    this.messengerRnaBeingTranslated = null;
  }

  /**
   * @override
   * Overridden in order to hook up unique attachment state machine for this biomolecule.
   * @returns {RibosomeAttachmentStateMachine}
   * @public
   */
  createAttachmentStateMachine() {
    return new RibosomeAttachmentStateMachine(this);
  }

  /**
   * @returns {Shape}
   * @private
   */
  static createShape() {
    // Draw the top portion, which in this sim is the larger subunit. The shape is essentially a lumpy ellipse, and
    // is based on some drawings seen on the web.
    const topSubunitPointList = [
    // Define the shape with a series of points.  Starts at top left.
    new Vector2(-WIDTH * 0.3, TOP_SUBUNIT_HEIGHT * 0.9), new Vector2(WIDTH * 0.3, TOP_SUBUNIT_HEIGHT), new Vector2(WIDTH * 0.5, 0), new Vector2(WIDTH * 0.3, -TOP_SUBUNIT_HEIGHT * 0.4), new Vector2(0, -TOP_SUBUNIT_HEIGHT * 0.5),
    // Center bottom.
    new Vector2(-WIDTH * 0.3, -TOP_SUBUNIT_HEIGHT * 0.4), new Vector2(-WIDTH * 0.5, 0)];
    const translation = Matrix3.translation(0, OVERALL_HEIGHT / 4);
    const topSubunitShape = ShapeUtils.createRoundedShapeFromPoints(topSubunitPointList).transformed(translation);

    // Draw the bottom portion, which in this sim is the smaller subunit.
    const startPointY = topSubunitShape.bounds.minY;
    const bottomSubunitPointList = [
    // Define the shape with a series of points.
    new Vector2(-WIDTH * 0.45, startPointY), new Vector2(0, startPointY), new Vector2(WIDTH * 0.45, startPointY), new Vector2(WIDTH * 0.45, startPointY - BOTTOM_SUBUNIT_HEIGHT), new Vector2(0, startPointY - BOTTOM_SUBUNIT_HEIGHT), new Vector2(-WIDTH * 0.45, startPointY - BOTTOM_SUBUNIT_HEIGHT)];
    const bottomSubunitTranslation = Matrix3.translation(0, -OVERALL_HEIGHT / 4);
    return ShapeUtils.createRoundedShapeFromPoints(bottomSubunitPointList, topSubunitShape).transformed(bottomSubunitTranslation);
  }

  /**
   * @returns {Vector2}
   * @public
   */
  getEntranceOfRnaChannelPosition() {
    return this.getPosition().plus(OFFSET_TO_TRANSLATION_CHANNEL_ENTRANCE);
  }

  /**
   * @returns {number}
   * @public
   */
  getTranslationChannelLength() {
    return WIDTH * 0.95;
  }

  /**
   * Advance the translation of the mRNA.
   * @param {number} amount
   * @returns {boolean} - true if translation is complete, false if not.
   * @public
   */
  advanceMessengerRnaTranslation(amount) {
    return this.messengerRnaBeingTranslated !== null && this.messengerRnaBeingTranslated.advanceTranslation(this, amount);
  }

  /**
   * Get the position in model space of the point at which a protein that is being synthesized by this ribosome should
   * be attached.
   *
   * @param {Vector2} newAttachmentPoint // optional output Vector - Added to avoid creating excessive vector2 instances
   * @returns {Vector2}
   * @public
   */
  getProteinAttachmentPoint(newAttachmentPoint) {
    newAttachmentPoint = newAttachmentPoint || new Vector2(0, 0);
    newAttachmentPoint.x = this.getPosition().x + OFFSET_TO_PROTEIN_OUTPUT_CHANNEL.x;
    newAttachmentPoint.y = this.getPosition().y + OFFSET_TO_PROTEIN_OUTPUT_CHANNEL.y;
    return newAttachmentPoint;
  }

  /**
   * Initiate translation of Messenger Rna
   * @public
   */
  initiateTranslation() {
    if (this.messengerRnaBeingTranslated !== null) {
      this.messengerRnaBeingTranslated.initiateTranslation(this);
    }
  }

  /**
   * returns true if this ribosome is currently translating mRNA, false otherwise
   * @public
   * @returns {boolean}
   */
  isTranslating() {
    return this.attachmentStateMachine.isTranslating();
  }

  /**
   * cancel a translation that was going to happen but something occured to prevent it
   * @public
   */
  cancelTranslation() {
    // make sure we're in a state that supports this operation
    assert && assert(!this.attachmentStateMachine.isTranslating());
    this.attachmentStateMachine.forceImmediateUnattachedAndAvailable();
  }
}

// statics
Ribosome.OFFSET_TO_TRANSLATION_CHANNEL_ENTRANCE = OFFSET_TO_TRANSLATION_CHANNEL_ENTRANCE;
geneExpressionEssentials.register('Ribosome', Ribosome);
export default Ribosome;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXRyaXgzIiwiVmVjdG9yMiIsIkNvbG9yIiwiZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzIiwiUmlib3NvbWVBdHRhY2htZW50U3RhdGVNYWNoaW5lIiwiTW9iaWxlQmlvbW9sZWN1bGUiLCJTaGFwZVV0aWxzIiwiV0lEVEgiLCJPVkVSQUxMX0hFSUdIVCIsIlRPUF9TVUJVTklUX0hFSUdIVF9QUk9QT1JUSU9OIiwiVE9QX1NVQlVOSVRfSEVJR0hUIiwiQk9UVE9NX1NVQlVOSVRfSEVJR0hUIiwiT0ZGU0VUX1RPX1RSQU5TTEFUSU9OX0NIQU5ORUxfRU5UUkFOQ0UiLCJPRkZTRVRfVE9fUFJPVEVJTl9PVVRQVVRfQ0hBTk5FTCIsImluc3RhbmNlQ291bnRlciIsIlJpYm9zb21lIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInBvc2l0aW9uIiwiY3JlYXRlU2hhcGUiLCJvZmZzZXRUb1RyYW5zbGF0aW9uQ2hhbm5lbEVudHJhbmNlIiwic2V0UG9zaXRpb24iLCJtZXNzZW5nZXJSbmFCZWluZ1RyYW5zbGF0ZWQiLCJpZCIsImdldE1lc3NlbmdlclJuYUJlaW5nVHJhbnNsYXRlZCIsInByb3Bvc2VBdHRhY2htZW50cyIsImF0dGFjaG1lbnRTaXRlIiwibWVzc2VuZ2VyUm5hTGlzdCIsImdldE1lc3NlbmdlclJuYUxpc3QiLCJpIiwibGVuZ3RoIiwibWVzc2VuZ2VyUm5hIiwiZ2V0IiwiY29uc2lkZXJQcm9wb3NhbEZyb21SaWJvc29tZSIsInJlbGVhc2VNZXNzZW5nZXJSbmEiLCJyZWxlYXNlRnJvbVJpYm9zb21lIiwiY3JlYXRlQXR0YWNobWVudFN0YXRlTWFjaGluZSIsInRvcFN1YnVuaXRQb2ludExpc3QiLCJ0cmFuc2xhdGlvbiIsInRvcFN1YnVuaXRTaGFwZSIsImNyZWF0ZVJvdW5kZWRTaGFwZUZyb21Qb2ludHMiLCJ0cmFuc2Zvcm1lZCIsInN0YXJ0UG9pbnRZIiwiYm91bmRzIiwibWluWSIsImJvdHRvbVN1YnVuaXRQb2ludExpc3QiLCJib3R0b21TdWJ1bml0VHJhbnNsYXRpb24iLCJnZXRFbnRyYW5jZU9mUm5hQ2hhbm5lbFBvc2l0aW9uIiwiZ2V0UG9zaXRpb24iLCJwbHVzIiwiZ2V0VHJhbnNsYXRpb25DaGFubmVsTGVuZ3RoIiwiYWR2YW5jZU1lc3NlbmdlclJuYVRyYW5zbGF0aW9uIiwiYW1vdW50IiwiYWR2YW5jZVRyYW5zbGF0aW9uIiwiZ2V0UHJvdGVpbkF0dGFjaG1lbnRQb2ludCIsIm5ld0F0dGFjaG1lbnRQb2ludCIsIngiLCJ5IiwiaW5pdGlhdGVUcmFuc2xhdGlvbiIsImlzVHJhbnNsYXRpbmciLCJhdHRhY2htZW50U3RhdGVNYWNoaW5lIiwiY2FuY2VsVHJhbnNsYXRpb24iLCJhc3NlcnQiLCJmb3JjZUltbWVkaWF0ZVVuYXR0YWNoZWRBbmRBdmFpbGFibGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlJpYm9zb21lLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENsYXNzIHRoYXQgcmVwcmVzZW50cyB0aGUgcmlib3NvbWUgaW4gdGhlIG1vZGVsLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqIEBhdXRob3IgTW9oYW1lZCBTYWZpXHJcbiAqIEBhdXRob3IgQWFkaXNoIEd1cHRhXHJcbiAqL1xyXG5cclxuXHJcbi8vbW9kdWxlc1xyXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgQ29sb3IgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzIGZyb20gJy4uLy4uL2dlbmVFeHByZXNzaW9uRXNzZW50aWFscy5qcyc7XHJcbmltcG9ydCBSaWJvc29tZUF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUgZnJvbSAnLi9hdHRhY2htZW50LXN0YXRlLW1hY2hpbmVzL1JpYm9zb21lQXR0YWNobWVudFN0YXRlTWFjaGluZS5qcyc7XHJcbmltcG9ydCBNb2JpbGVCaW9tb2xlY3VsZSBmcm9tICcuL01vYmlsZUJpb21vbGVjdWxlLmpzJztcclxuaW1wb3J0IFNoYXBlVXRpbHMgZnJvbSAnLi9TaGFwZVV0aWxzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBXSURUSCA9IDQzMDsgICAgICAgICAgICAgICAgICAvLyBJbiBuYW5vbWV0ZXJzLlxyXG5jb25zdCBPVkVSQUxMX0hFSUdIVCA9IDQ1MDsgICAgICAgICAvLyBJbiBuYW5vbWV0ZXJzLlxyXG5jb25zdCBUT1BfU1VCVU5JVF9IRUlHSFRfUFJPUE9SVElPTiA9IDAuNjtcclxuY29uc3QgVE9QX1NVQlVOSVRfSEVJR0hUID0gT1ZFUkFMTF9IRUlHSFQgKiBUT1BfU1VCVU5JVF9IRUlHSFRfUFJPUE9SVElPTjtcclxuY29uc3QgQk9UVE9NX1NVQlVOSVRfSEVJR0hUID0gT1ZFUkFMTF9IRUlHSFQgKiAoIDEgLSBUT1BfU1VCVU5JVF9IRUlHSFRfUFJPUE9SVElPTiApO1xyXG5cclxuLy8gT2Zmc2V0IGZyb20gdGhlIGNlbnRlciBwb3NpdGlvbiB0byB0aGUgZW50cmFuY2Ugb2YgdGhlIHRyYW5zbGF0aW9uIGNoYW5uZWwuIE1heSByZXF1aXJlIHNvbWUgdHdlYWtpbmcgaWYgdGhlIHNoYXBlXHJcbi8vIGNoYW5nZXMuXHJcbmNvbnN0IE9GRlNFVF9UT19UUkFOU0xBVElPTl9DSEFOTkVMX0VOVFJBTkNFID0gbmV3IFZlY3RvcjIoIFdJRFRIICogMC40NSwgLU9WRVJBTExfSEVJR0hUICogMC4yMyApO1xyXG5cclxuLy8gT2Zmc2V0IGZyb20gdGhlIGNlbnRlciBwb3NpdGlvbiB0byB0aGUgcG9pbnQgZnJvbSB3aGljaCB0aGUgcHJvdGVpbiBlbWVyZ2VzLiBNYXkgcmVxdWlyZSBzb21lIHR3ZWFraW5nIGlmIHRoZSBvdmVyYWxsXHJcbi8vIHNoYXBlIGNoYW5nZXMuXHJcbmNvbnN0IE9GRlNFVF9UT19QUk9URUlOX09VVFBVVF9DSEFOTkVMID0gbmV3IFZlY3RvcjIoIFdJRFRIICogMC40LCBPVkVSQUxMX0hFSUdIVCAqIDAuNTUgKTtcclxuXHJcbi8vIGEgY291bnRlciB1c2VkIHRvIGNyZWF0ZSBhIHVuaXF1ZSBJRCBmb3IgZWFjaCBpbnN0YW5jZVxyXG5sZXQgaW5zdGFuY2VDb3VudGVyID0gMDtcclxuXHJcbmNsYXNzIFJpYm9zb21lIGV4dGVuZHMgTW9iaWxlQmlvbW9sZWN1bGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0dlbmVFeHByZXNzaW9uTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwb3NpdGlvblxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCwgcG9zaXRpb24gKSB7XHJcbiAgICBzdXBlciggbW9kZWwsIFJpYm9zb21lLmNyZWF0ZVNoYXBlKCksIG5ldyBDb2xvciggMjA1LCAxNTUsIDI5ICkgKTtcclxuICAgIHRoaXMub2Zmc2V0VG9UcmFuc2xhdGlvbkNoYW5uZWxFbnRyYW5jZSA9IE9GRlNFVF9UT19UUkFOU0xBVElPTl9DSEFOTkVMX0VOVFJBTkNFOyAvLyBAcHVibGljXHJcbiAgICBwb3NpdGlvbiA9IHBvc2l0aW9uIHx8IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcbiAgICB0aGlzLnNldFBvc2l0aW9uKCBwb3NpdGlvbiApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtNZXNzZW5nZXJSbmF9IG1lc3NlbmdlciBSTkEgYmVpbmcgdHJhbnNsYXRlZCwgbnVsbCBpZiBubyB0cmFuc2xhdGlvbiBpcyBpbiBwcm9ncmVzc1xyXG4gICAgdGhpcy5tZXNzZW5nZXJSbmFCZWluZ1RyYW5zbGF0ZWQgPSBudWxsOyAvLyBAcHJpdmF0ZVxyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge1N0cmluZ30gLSB1bmlxdWUgSUQgZm9yIHRoaXMgaW5zdGFuY2VcclxuICAgIHRoaXMuaWQgPSBgcmlib3NvbWUtJHtpbnN0YW5jZUNvdW50ZXIrK31gO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHJldHVybnMge01lc3NlbmdlclJuYX1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0TWVzc2VuZ2VyUm5hQmVpbmdUcmFuc2xhdGVkKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubWVzc2VuZ2VyUm5hQmVpbmdUcmFuc2xhdGVkO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2NhbiBmb3IgbVJOQSBhbmQgcHJvcG9zZSBhdHRhY2htZW50cyB0byBhbnkgdGhhdCBhcmUgZm91bmQuIEl0IGlzIHVwIHRvIHRoZSBtUk5BIHRvIGFjY2VwdCBvciByZWZ1c2UgYmFzZWQgb25cclxuICAgKiBkaXN0YW5jZSwgYXZhaWxhYmlsaXR5LCBvciB3aGF0ZXZlci5cclxuICAgKlxyXG4gICAqIFRoaXMgbWV0aG9kIGlzIGNhbGxlZCBmcm9tIHRoZSBhdHRhY2htZW50IHN0YXRlIG1hY2hpbmUgZnJhbWV3b3JrLlxyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBwcm9wb3NlQXR0YWNobWVudHMoKSB7XHJcbiAgICBsZXQgYXR0YWNobWVudFNpdGUgPSBudWxsO1xyXG4gICAgY29uc3QgbWVzc2VuZ2VyUm5hTGlzdCA9IHRoaXMubW9kZWwuZ2V0TWVzc2VuZ2VyUm5hTGlzdCgpO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbWVzc2VuZ2VyUm5hTGlzdC5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgbWVzc2VuZ2VyUm5hID0gbWVzc2VuZ2VyUm5hTGlzdC5nZXQoIGkgKTtcclxuICAgICAgYXR0YWNobWVudFNpdGUgPSBtZXNzZW5nZXJSbmEuY29uc2lkZXJQcm9wb3NhbEZyb21SaWJvc29tZSggdGhpcyApO1xyXG4gICAgICBpZiAoIGF0dGFjaG1lbnRTaXRlICE9PSBudWxsICkge1xyXG5cclxuICAgICAgICAvLyBQcm9wb3NhbCBhY2NlcHRlZC5cclxuICAgICAgICB0aGlzLm1lc3NlbmdlclJuYUJlaW5nVHJhbnNsYXRlZCA9IG1lc3NlbmdlclJuYTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGF0dGFjaG1lbnRTaXRlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVsZWFzZSB0aGUgbWVzc2VuZ2VyIFJOQVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZWxlYXNlTWVzc2VuZ2VyUm5hKCkge1xyXG4gICAgdGhpcy5tZXNzZW5nZXJSbmFCZWluZ1RyYW5zbGF0ZWQucmVsZWFzZUZyb21SaWJvc29tZSggdGhpcyApO1xyXG4gICAgdGhpcy5tZXNzZW5nZXJSbmFCZWluZ1RyYW5zbGF0ZWQgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogT3ZlcnJpZGRlbiBpbiBvcmRlciB0byBob29rIHVwIHVuaXF1ZSBhdHRhY2htZW50IHN0YXRlIG1hY2hpbmUgZm9yIHRoaXMgYmlvbW9sZWN1bGUuXHJcbiAgICogQHJldHVybnMge1JpYm9zb21lQXR0YWNobWVudFN0YXRlTWFjaGluZX1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY3JlYXRlQXR0YWNobWVudFN0YXRlTWFjaGluZSgpIHtcclxuICAgIHJldHVybiBuZXcgUmlib3NvbWVBdHRhY2htZW50U3RhdGVNYWNoaW5lKCB0aGlzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBzdGF0aWMgY3JlYXRlU2hhcGUoKSB7XHJcblxyXG4gICAgLy8gRHJhdyB0aGUgdG9wIHBvcnRpb24sIHdoaWNoIGluIHRoaXMgc2ltIGlzIHRoZSBsYXJnZXIgc3VidW5pdC4gVGhlIHNoYXBlIGlzIGVzc2VudGlhbGx5IGEgbHVtcHkgZWxsaXBzZSwgYW5kXHJcbiAgICAvLyBpcyBiYXNlZCBvbiBzb21lIGRyYXdpbmdzIHNlZW4gb24gdGhlIHdlYi5cclxuICAgIGNvbnN0IHRvcFN1YnVuaXRQb2ludExpc3QgPSBbXHJcblxyXG4gICAgICAvLyBEZWZpbmUgdGhlIHNoYXBlIHdpdGggYSBzZXJpZXMgb2YgcG9pbnRzLiAgU3RhcnRzIGF0IHRvcCBsZWZ0LlxyXG4gICAgICBuZXcgVmVjdG9yMiggLVdJRFRIICogMC4zLCBUT1BfU1VCVU5JVF9IRUlHSFQgKiAwLjkgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIFdJRFRIICogMC4zLCBUT1BfU1VCVU5JVF9IRUlHSFQgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIFdJRFRIICogMC41LCAwICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCBXSURUSCAqIDAuMywgLVRPUF9TVUJVTklUX0hFSUdIVCAqIDAuNCApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggMCwgLVRPUF9TVUJVTklUX0hFSUdIVCAqIDAuNSApLCAvLyBDZW50ZXIgYm90dG9tLlxyXG4gICAgICBuZXcgVmVjdG9yMiggLVdJRFRIICogMC4zLCAtVE9QX1NVQlVOSVRfSEVJR0hUICogMC40ICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAtV0lEVEggKiAwLjUsIDAgKVxyXG4gICAgXTtcclxuXHJcbiAgICBjb25zdCB0cmFuc2xhdGlvbiA9IE1hdHJpeDMudHJhbnNsYXRpb24oIDAsIE9WRVJBTExfSEVJR0hUIC8gNCApO1xyXG4gICAgY29uc3QgdG9wU3VidW5pdFNoYXBlID0gU2hhcGVVdGlscy5jcmVhdGVSb3VuZGVkU2hhcGVGcm9tUG9pbnRzKCB0b3BTdWJ1bml0UG9pbnRMaXN0ICkudHJhbnNmb3JtZWQoIHRyYW5zbGF0aW9uICk7XHJcblxyXG4gICAgLy8gRHJhdyB0aGUgYm90dG9tIHBvcnRpb24sIHdoaWNoIGluIHRoaXMgc2ltIGlzIHRoZSBzbWFsbGVyIHN1YnVuaXQuXHJcbiAgICBjb25zdCBzdGFydFBvaW50WSA9IHRvcFN1YnVuaXRTaGFwZS5ib3VuZHMubWluWTtcclxuICAgIGNvbnN0IGJvdHRvbVN1YnVuaXRQb2ludExpc3QgPSBbXHJcblxyXG4gICAgICAvLyBEZWZpbmUgdGhlIHNoYXBlIHdpdGggYSBzZXJpZXMgb2YgcG9pbnRzLlxyXG4gICAgICBuZXcgVmVjdG9yMiggLVdJRFRIICogMC40NSwgc3RhcnRQb2ludFkgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDAsIHN0YXJ0UG9pbnRZICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCBXSURUSCAqIDAuNDUsIHN0YXJ0UG9pbnRZICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCBXSURUSCAqIDAuNDUsIHN0YXJ0UG9pbnRZIC0gQk9UVE9NX1NVQlVOSVRfSEVJR0hUICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAwLCBzdGFydFBvaW50WSAtIEJPVFRPTV9TVUJVTklUX0hFSUdIVCApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggLVdJRFRIICogMC40NSwgc3RhcnRQb2ludFkgLSBCT1RUT01fU1VCVU5JVF9IRUlHSFQgKVxyXG4gICAgXTtcclxuXHJcbiAgICBjb25zdCBib3R0b21TdWJ1bml0VHJhbnNsYXRpb24gPSBNYXRyaXgzLnRyYW5zbGF0aW9uKCAwLCAtT1ZFUkFMTF9IRUlHSFQgLyA0ICk7XHJcbiAgICByZXR1cm4gU2hhcGVVdGlscy5jcmVhdGVSb3VuZGVkU2hhcGVGcm9tUG9pbnRzKCBib3R0b21TdWJ1bml0UG9pbnRMaXN0LCB0b3BTdWJ1bml0U2hhcGUgKS50cmFuc2Zvcm1lZCggYm90dG9tU3VidW5pdFRyYW5zbGF0aW9uICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0RW50cmFuY2VPZlJuYUNoYW5uZWxQb3NpdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmdldFBvc2l0aW9uKCkucGx1cyggT0ZGU0VUX1RPX1RSQU5TTEFUSU9OX0NIQU5ORUxfRU5UUkFOQ0UgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFRyYW5zbGF0aW9uQ2hhbm5lbExlbmd0aCgpIHtcclxuICAgIHJldHVybiBXSURUSCAqIDAuOTU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZHZhbmNlIHRoZSB0cmFuc2xhdGlvbiBvZiB0aGUgbVJOQS5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gYW1vdW50XHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59IC0gdHJ1ZSBpZiB0cmFuc2xhdGlvbiBpcyBjb21wbGV0ZSwgZmFsc2UgaWYgbm90LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhZHZhbmNlTWVzc2VuZ2VyUm5hVHJhbnNsYXRpb24oIGFtb3VudCApIHtcclxuICAgIHJldHVybiB0aGlzLm1lc3NlbmdlclJuYUJlaW5nVHJhbnNsYXRlZCAhPT0gbnVsbCAmJlxyXG4gICAgICAgICAgIHRoaXMubWVzc2VuZ2VyUm5hQmVpbmdUcmFuc2xhdGVkLmFkdmFuY2VUcmFuc2xhdGlvbiggdGhpcywgYW1vdW50ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIHBvc2l0aW9uIGluIG1vZGVsIHNwYWNlIG9mIHRoZSBwb2ludCBhdCB3aGljaCBhIHByb3RlaW4gdGhhdCBpcyBiZWluZyBzeW50aGVzaXplZCBieSB0aGlzIHJpYm9zb21lIHNob3VsZFxyXG4gICAqIGJlIGF0dGFjaGVkLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBuZXdBdHRhY2htZW50UG9pbnQgLy8gb3B0aW9uYWwgb3V0cHV0IFZlY3RvciAtIEFkZGVkIHRvIGF2b2lkIGNyZWF0aW5nIGV4Y2Vzc2l2ZSB2ZWN0b3IyIGluc3RhbmNlc1xyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRQcm90ZWluQXR0YWNobWVudFBvaW50KCBuZXdBdHRhY2htZW50UG9pbnQgKSB7XHJcbiAgICBuZXdBdHRhY2htZW50UG9pbnQgPSBuZXdBdHRhY2htZW50UG9pbnQgfHwgbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuICAgIG5ld0F0dGFjaG1lbnRQb2ludC54ID0gdGhpcy5nZXRQb3NpdGlvbigpLnggKyBPRkZTRVRfVE9fUFJPVEVJTl9PVVRQVVRfQ0hBTk5FTC54O1xyXG4gICAgbmV3QXR0YWNobWVudFBvaW50LnkgPSB0aGlzLmdldFBvc2l0aW9uKCkueSArIE9GRlNFVF9UT19QUk9URUlOX09VVFBVVF9DSEFOTkVMLnk7XHJcbiAgICByZXR1cm4gbmV3QXR0YWNobWVudFBvaW50O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5pdGlhdGUgdHJhbnNsYXRpb24gb2YgTWVzc2VuZ2VyIFJuYVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBpbml0aWF0ZVRyYW5zbGF0aW9uKCkge1xyXG4gICAgaWYgKCB0aGlzLm1lc3NlbmdlclJuYUJlaW5nVHJhbnNsYXRlZCAhPT0gbnVsbCApIHtcclxuICAgICAgdGhpcy5tZXNzZW5nZXJSbmFCZWluZ1RyYW5zbGF0ZWQuaW5pdGlhdGVUcmFuc2xhdGlvbiggdGhpcyApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogcmV0dXJucyB0cnVlIGlmIHRoaXMgcmlib3NvbWUgaXMgY3VycmVudGx5IHRyYW5zbGF0aW5nIG1STkEsIGZhbHNlIG90aGVyd2lzZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBpc1RyYW5zbGF0aW5nKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYXR0YWNobWVudFN0YXRlTWFjaGluZS5pc1RyYW5zbGF0aW5nKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBjYW5jZWwgYSB0cmFuc2xhdGlvbiB0aGF0IHdhcyBnb2luZyB0byBoYXBwZW4gYnV0IHNvbWV0aGluZyBvY2N1cmVkIHRvIHByZXZlbnQgaXRcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY2FuY2VsVHJhbnNsYXRpb24oKSB7XHJcblxyXG4gICAgLy8gbWFrZSBzdXJlIHdlJ3JlIGluIGEgc3RhdGUgdGhhdCBzdXBwb3J0cyB0aGlzIG9wZXJhdGlvblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuYXR0YWNobWVudFN0YXRlTWFjaGluZS5pc1RyYW5zbGF0aW5nKCkgKTtcclxuXHJcbiAgICB0aGlzLmF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUuZm9yY2VJbW1lZGlhdGVVbmF0dGFjaGVkQW5kQXZhaWxhYmxlKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBzdGF0aWNzXHJcblJpYm9zb21lLk9GRlNFVF9UT19UUkFOU0xBVElPTl9DSEFOTkVMX0VOVFJBTkNFID0gT0ZGU0VUX1RPX1RSQU5TTEFUSU9OX0NIQU5ORUxfRU5UUkFOQ0U7XHJcblxyXG5nZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMucmVnaXN0ZXIoICdSaWJvc29tZScsIFJpYm9zb21lICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBSaWJvc29tZTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQTtBQUNBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxTQUFTQyxLQUFLLFFBQVEsbUNBQW1DO0FBQ3pELE9BQU9DLHdCQUF3QixNQUFNLG1DQUFtQztBQUN4RSxPQUFPQyw4QkFBOEIsTUFBTSwrREFBK0Q7QUFDMUcsT0FBT0MsaUJBQWlCLE1BQU0sd0JBQXdCO0FBQ3RELE9BQU9DLFVBQVUsTUFBTSxpQkFBaUI7O0FBRXhDO0FBQ0EsTUFBTUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFrQjtBQUNwQyxNQUFNQyxjQUFjLEdBQUcsR0FBRyxDQUFDLENBQVM7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