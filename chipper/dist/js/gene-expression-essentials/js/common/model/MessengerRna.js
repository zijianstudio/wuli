// Copyright 2015-2022, University of Colorado Boulder

/**
 * Class that represents messenger ribonucleic acid, or mRNA, in the model. This class is fairly complex, due to the
 * need for mRNA to wind up and unwind as it is transcribed, translated, and destroyed.
 *
 * @author John Blanco
 * @author Mohamed Safi
 * @author Aadish Gupta
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import geneExpressionEssentials from '../../geneExpressionEssentials.js';
import GEEConstants from '../GEEConstants.js';
import MessengerRnaAttachmentStateMachine from './attachment-state-machines/MessengerRnaAttachmentStateMachine.js';
import AttachmentSite from './AttachmentSite.js';
import FlatSegment from './FlatSegment.js';
import MessengerRnaDestroyer from './MessengerRnaDestroyer.js';
import PlacementHint from './PlacementHint.js';
import Ribosome from './Ribosome.js';
import WindingBiomolecule from './WindingBiomolecule.js';

// constants
const RIBOSOME_CONNECTION_DISTANCE = 400; // picometers - distance within which this will connect to a ribosome
const MRNA_DESTROYER_CONNECT_DISTANCE = 400; // picometers - Distance within which this will connect to a mRNA destroyer
const INITIAL_MRNA_SHAPE = Shape.circle(0, 0, 0.1); // tiny circle until the strand starts to grow
const MIN_LENGTH_TO_ATTACH = 75; // picometers - min length before attachments are allowed

class MessengerRna extends WindingBiomolecule {
  /**
   * Constructor.  This creates the mRNA as a single point, with the intention of growing it.
   *
   * @param {GeneExpressionModel} model
   * @param {Protein} proteinPrototype
   * @param {Vector2} position
   * @param {Object} [options]
   */
  constructor(model, proteinPrototype, position, options) {
    super(model, INITIAL_MRNA_SHAPE, position, options);

    // @private {Object} - object that maps from ribosomes to the shape segment to which they are attached
    this.mapRibosomeToShapeSegment = {};

    // @public {BooleanProperty} - externally visible indicator for whether this mRNA is being synthesized, assumes that
    // it is being synthesized when initially created
    this.beingSynthesizedProperty = new BooleanProperty(true); //@public

    // @private - protein prototype, used to keep track of protein that should be synthesized from this particular
    // strand of mRNA
    this.proteinPrototype = proteinPrototype;

    // @private - local reference to the non-generic state machine used by this molecule
    this.mRnaAttachmentStateMachine = this.attachmentStateMachine;

    // @private - mRNA destroyer that is destroying this mRNA. Null until and unless destruction has begun.
    this.messengerRnaDestroyer = null;

    // @private - Shape segment where the mRNA destroyer is connected. This is null until destruction has begun.
    this.segmentBeingDestroyed = null;

    // @private {AttachmentSite} - site where ribosomes or mRNA destroyers can attach
    this.attachmentSite = new AttachmentSite(this, new Vector2(0, 0), 1);

    // set the initial position
    this.setPosition(position);

    // Add the first segment to the shape segment list. This segment will contain the "leader" for the mRNA.
    const segment = new FlatSegment(this, Vector2.ZERO);
    segment.setCapacity(GEEConstants.LEADER_LENGTH);
    this.shapeSegments.push(segment);

    // Add the placement hints for the positions where the user can attach a ribosome or an mRNA destroyer.
    const ribosome = new Ribosome(model);
    this.ribosomePlacementHint = new PlacementHint(ribosome); //@public(read-only)
    this.mRnaDestroyerPlacementHint = new PlacementHint(new MessengerRnaDestroyer(model)); //@public(read-only)

    const updateHintPositions = shape => {
      // All hints always sit at the beginning of the RNA strand and are positioned relative to its center.
      const strandStartPosition = new Vector2(shape.bounds.minX, shape.bounds.maxY);
      this.ribosomePlacementHint.setPosition(strandStartPosition.minus(ribosome.offsetToTranslationChannelEntrance));
      this.mRnaDestroyerPlacementHint.setPosition(strandStartPosition);
    };
    this.shapeProperty.link(updateHintPositions);

    // update the attachment site position when the mRNA moves or changes shape
    const attachmentSitePositionUpdater = this.updateAttachmentSitePosition.bind(this);
    this.positionProperty.link(attachmentSitePositionUpdater);
    this.shapeProperty.link(attachmentSitePositionUpdater);
    this.disposeMessengerRna = function () {
      this.shapeProperty.unlink(updateHintPositions);
      this.shapeProperty.unlink(attachmentSitePositionUpdater);
      this.positionProperty.unlink(attachmentSitePositionUpdater);
    };
  }

  /**
   * @public
   */
  dispose() {
    this.mapRibosomeToShapeSegment = null;
    this.disposeMessengerRna();
    super.dispose();
  }

  /**
   * Command this mRNA strand to fade away when it has become fully formed. This was created for use in the 2nd
   * screen, where mRNA is never translated once it is produced.
   * @param {boolean} fadeAwayWhenFormed
   * @public
   */
  setFadeAwayWhenFormed(fadeAwayWhenFormed) {
    // Just pass this through to the state machine.
    this.mRnaAttachmentStateMachine.setFadeAwayWhenFormed(fadeAwayWhenFormed);
  }

  /**
   * Advance the translation of the mRNA through the given ribosome by the specified length. The given ribosome must
   * already be attached to the mRNA.
   * @param {Ribosome} ribosome - The ribosome by which the mRNA is being translated.
   * @param {number} length   - The amount of mRNA to move through the translation channel.
   * @returns - true if the mRNA is completely through the channel, indicating, that transcription is complete, and false
   * if not.
   * @public
   */
  advanceTranslation(ribosome, length) {
    const segmentToAdvance = this.mapRibosomeToShapeSegment[ribosome.id];

    // Error checking.
    assert && assert(segmentToAdvance !== null); // Should never happen, since it means that the ribosome isn't attached.

    // Advance the translation by advancing the position of the mRNA in the segment that corresponds to the translation
    // channel of the ribosome.
    segmentToAdvance.advance(length, this, this.shapeSegments);

    // Realign the segments, since they may well have changed shape.
    if (this.shapeSegments.indexOf(segmentToAdvance) !== -1) {
      this.realignSegmentsFrom(segmentToAdvance);
      this.recenter();
    }

    // Since the sizes and relationships of the segments probably changed, the winding algorithm needs to be rerun.
    this.windPointsThroughSegments();

    // If there is anything left in this segment, then transcription is not yet complete.
    return segmentToAdvance.getContainedLength() <= 0;
  }

  /**
   * Advance the destruction of the mRNA by the specified length. This pulls the strand into the lead segment much like
   * translation does, but does not move the points into new segment, it just gets rid of them.
   * @param {number} length
   * @returns {boolean}
   * @public
   */
  advanceDestruction(length) {
    // Error checking.
    assert && assert(this.segmentBeingDestroyed !== null, 'error - attempt to advance the destruction of mRNA that has no content left');

    // Advance the destruction by reducing the length of the mRNA.
    this.reduceLength(length);

    // Realign the segments, since they may well have changed shape.
    if (this.shapeSegments.indexOf(this.segmentBeingDestroyed) !== -1) {
      this.realignSegmentsFrom(this.segmentBeingDestroyed);
    }
    if (this.shapeSegments.length > 0) {
      // Since the sizes and relationships of the segments probably changed, the winding algorithm needs to be rerun.
      this.windPointsThroughSegments();
    }

    // If there is any length left, then the destruction is not yet complete. This is a quick way to test this.
    return this.firstShapeDefiningPoint === this.lastShapeDefiningPoint;
  }

  /**
   * Reduce the length of the mRNA. This handles both the shape segments and the shape-defining points.
   * @param {number} reductionAmount
   * @private
   */
  reduceLength(reductionAmount) {
    if (reductionAmount >= this.getLength()) {
      // Reduce length to be zero.
      this.lastShapeDefiningPoint = this.firstShapeDefiningPoint;
      this.lastShapeDefiningPoint.setNextPoint(null);
      this.shapeSegments.length = 0;
    } else {
      // Remove the length from the shape segments.
      this.segmentBeingDestroyed.advanceAndRemove(reductionAmount, this, this.shapeSegments);

      // Remove the length from the shape defining points.
      for (let amountRemoved = 0; amountRemoved < reductionAmount;) {
        if (this.lastShapeDefiningPoint.getTargetDistanceToPreviousPoint() <= reductionAmount - amountRemoved) {
          // Remove the last point from the list.
          amountRemoved += this.lastShapeDefiningPoint.getTargetDistanceToPreviousPoint();
          this.lastShapeDefiningPoint = this.lastShapeDefiningPoint.getPreviousPoint();
          this.lastShapeDefiningPoint.setNextPoint(null);
        } else {
          // Reduce the distance of the last point from the previous point.
          this.lastShapeDefiningPoint.setTargetDistanceToPreviousPoint(this.lastShapeDefiningPoint.getTargetDistanceToPreviousPoint() - (reductionAmount - amountRemoved));
          amountRemoved = reductionAmount;
        }
      }
    }
  }

  /**
   * @private
   */
  updateAttachmentSitePosition() {
    if (this.shapeSegments.length > 0) {
      const leadingShapeSegment = this.shapeSegments[0];
      this.attachmentSite.positionProperty.set(new Vector2(this.positionProperty.get().x + leadingShapeSegment.bounds.minX, this.positionProperty.get().y + leadingShapeSegment.bounds.minY));
    } else {
      this.attachmentSite.positionProperty.set(this.positionProperty.get());
    }
  }

  /**
   * Create a new version of the protein that should result when this strand of mRNA is translated.
   * @returns {Protein}
   * @public
   */
  getProteinPrototype() {
    return this.proteinPrototype;
  }

  /**
   * Get the point in model space where the entrance of the given ribosome's translation channel should be in order to
   * be correctly attached to this strand of messenger RNA. This allows the ribosome to "follow" the mRNA if it is
   * moving or changing shape.
   * @param {Ribosome} ribosome
   * @returns {Vector2}
   * @public
   */
  getRibosomeGenerateInitialPosition3D(ribosome) {
    assert && assert(this.mapRibosomeToShapeSegment[ribosome.id], 'attempt made to get attachment position for unattached ribosome');
    let generateInitialPosition3D;
    const mRnaPosition = this.positionProperty.get();
    const segment = this.mapRibosomeToShapeSegment[ribosome.id];
    let segmentCornerPosition;
    if (this.getPreviousShapeSegment(segment) === null) {
      // There is no previous segment, which means that the segment to which this ribosome is attached is the leader
      // segment. The attachment point is thus the leader length from its rightmost edge.
      segmentCornerPosition = segment.getLowerRightCornerPosition();
      generateInitialPosition3D = mRnaPosition.plusXY(segmentCornerPosition.x - GEEConstants.LEADER_LENGTH, segmentCornerPosition.y);
    } else {
      // The segment has filled up the channel, so calculate the position based on its left edge.
      segmentCornerPosition = segment.getUpperLeftCornerPosition();
      generateInitialPosition3D = mRnaPosition.plusXY(segmentCornerPosition.x + ribosome.getTranslationChannelLength(), segmentCornerPosition.y);
    }
    return generateInitialPosition3D;
  }

  /**
   * Release this mRNA from a ribosome. If this is the only ribosome to which the mRNA is connected, the mRNA will
   * start wandering.
   * @param {Ribosome} ribosome
   * @public
   */
  releaseFromRibosome(ribosome) {
    delete this.mapRibosomeToShapeSegment[ribosome.id];
    if (_.keys(this.mapRibosomeToShapeSegment).length === 0) {
      this.mRnaAttachmentStateMachine.allRibosomesDetached();
    }
  }

  /**
   * Release this mRNA from the polymerase which is, presumably, transcribing it.
   * @public
   */
  releaseFromPolymerase() {
    this.mRnaAttachmentStateMachine.detach();
  }

  /**
   * This override checks to see if the mRNA is about to be translated and destroyed and, if so, aborts those
   * operations.  If translation or destruction are in progress, nothing is done, since those can't be stopped once
   * they've started.
   * @override
   * @public
   */
  handleGrabbedByUser() {
    const attachedOrAttachingMolecule = this.attachmentSite.attachedOrAttachingMoleculeProperty.get();
    if (attachedOrAttachingMolecule instanceof Ribosome) {
      // if a ribosome is moving towards this mRNA strand but translation hasn't started, call off the wedding
      if (!attachedOrAttachingMolecule.isTranslating()) {
        attachedOrAttachingMolecule.cancelTranslation();
        this.releaseFromRibosome(attachedOrAttachingMolecule);
        this.attachmentStateMachine.forceImmediateUnattachedAndAvailable();
      }
    } else if (attachedOrAttachingMolecule instanceof MessengerRnaDestroyer) {
      // state checking
      assert && assert(this.messengerRnaDestroyer === attachedOrAttachingMolecule, 'something isn\t right - the destroyer for the attachment site doesn\'t match the expected reference');

      // if an mRNA destroyer is moving towards this mRNA strand but translation hasn't started, call off the wedding
      if (!this.isDestructionInProgress()) {
        attachedOrAttachingMolecule.cancelMessengerRnaDestruction();
        this.messengerRnaDestroyer = null;
        this.attachmentStateMachine.forceImmediateUnattachedAndAvailable();
      }
    }
  }

  /**
   * Activate the placement hint(s) as appropriate for the given biomolecule.
   * @param {MobileBiomolecule} biomolecule - instance of the type of biomolecule for which any matching hints
   * should be activated.
   * @public
   */
  activateHints(biomolecule) {
    this.ribosomePlacementHint.activateIfMatch(biomolecule);
    this.mRnaDestroyerPlacementHint.activateIfMatch(biomolecule);
  }

  /**
   * Deactivate placement hints for all biomolecules
   * @public
   */
  deactivateAllHints() {
    this.ribosomePlacementHint.activeProperty.set(false);
    this.mRnaDestroyerPlacementHint.activeProperty.set(false);
  }

  /**
   * Initiate the translation process by setting up the segments as needed. This should only be called after a ribosome
   * that was moving to attach with this mRNA arrives at the attachment point.
   * @param {Ribosome} ribosome
   * @public
   */
  initiateTranslation(ribosome) {
    assert && assert(this.mapRibosomeToShapeSegment[ribosome.id]); // State checking.

    // Set the capacity of the first segment to the size of the channel through which it will be pulled plus the
    // leader length.
    const firstShapeSegment = this.shapeSegments[0];
    assert && assert(firstShapeSegment.isFlat());
    firstShapeSegment.setCapacity(ribosome.getTranslationChannelLength() + GEEConstants.LEADER_LENGTH);
  }

  /**
   * Initiate the destruction of this mRNA strand by setting up the segments as needed. This should only be called
   * after an mRNA destroyer has attached to the front of the mRNA strand. Once initiated, destruction cannot be stopped.
   * @param {MessengerRnaDestroyer} messengerRnaDestroyer
   * @public
   */
  initiateDestruction(messengerRnaDestroyer) {
    assert && assert(this.messengerRnaDestroyer === messengerRnaDestroyer); // Shouldn't get this from unattached destroyers.

    // Set the capacity of the first segment to the size of the channel through which it will be pulled plus the leader length.
    this.segmentBeingDestroyed = this.shapeSegments[0];
    assert && assert(this.segmentBeingDestroyed.isFlat());
    this.segmentBeingDestroyed.setCapacity(this.messengerRnaDestroyer.getDestructionChannelLength() + GEEConstants.LEADER_LENGTH);
  }

  /**
   * returns true if destruction has started, false if not - note that destruction must actually have started, and
   * the state where an mRNA destroyer is moving towards the mRNA doesn't count
   * @private
   */
  isDestructionInProgress() {
    return this.segmentBeingDestroyed !== null;
  }

  /**
   * Get the proportion of the entire mRNA that has been translated by the given ribosome.
   * @param {Ribosome} ribosome
   * @returns {number}
   * @public
   */
  getProportionOfRnaTranslated(ribosome) {
    const translatedLength = this.getLengthOfRnaTranslated(ribosome);
    return Math.max(translatedLength / this.getLength(), 0);
  }

  /**
   * Get the length of the mRNA that has been translated by the given ribosome.
   * @param {Ribosome} ribosome
   * @returns {number}
   * @public
   */
  getLengthOfRnaTranslated(ribosome) {
    assert && assert(this.mapRibosomeToShapeSegment[ribosome.id]); // Makes no sense if ribosome isn't attached.
    let translatedLength = 0;
    const segmentInRibosomeChannel = this.mapRibosomeToShapeSegment[ribosome.id];
    assert && assert(segmentInRibosomeChannel.isFlat()); // Make sure things are as we expect.

    // Add the length for each segment that precedes this ribosome.
    for (let i = 0; i < this.shapeSegments.length; i++) {
      const shapeSegment = this.shapeSegments[i];
      if (shapeSegment === segmentInRibosomeChannel) {
        break;
      }
      translatedLength += shapeSegment.getContainedLength();
    }

    // Add the length for the segment that is inside the translation channel of this ribosome.
    translatedLength += segmentInRibosomeChannel.getContainedLength() - (segmentInRibosomeChannel.getLowerRightCornerPosition().x - segmentInRibosomeChannel.attachmentSite.positionProperty.get().x);
    return translatedLength;
  }

  /**
   * returns true if this messenger RNA is in a state where attachments can occur
   * @returns {boolean}
   * @private
   */
  attachmentAllowed() {
    // For an attachment proposal to be considered, the mRNA can't be controlled by the user, too short, or in the
    // process of being destroyed.
    return !this.userControlledProperty.get() && this.getLength() >= MIN_LENGTH_TO_ATTACH && this.messengerRnaDestroyer === null;
  }

  /**
   * Consider proposal from ribosome, and, if the proposal is accepted, return the attachment position
   * @param {Ribosome} ribosome
   * @returns {AttachmentSite}
   * @public
   */
  considerProposalFromRibosome(ribosome) {
    assert && assert(!this.mapRibosomeToShapeSegment[ribosome.id]); // Shouldn't get redundant proposals from a ribosome.
    let returnValue = null;
    if (this.attachmentAllowed()) {
      // See if the attachment site at the leading edge of the mRNA is available and close by.
      if (this.attachmentSite.attachedOrAttachingMoleculeProperty.get() === null && this.attachmentSite.positionProperty.get().distance(ribosome.getEntranceOfRnaChannelPosition()) < RIBOSOME_CONNECTION_DISTANCE) {
        // This attachment site is in range and available.
        returnValue = this.attachmentSite;

        // Update the attachment state machine.
        this.mRnaAttachmentStateMachine.attachedToRibosome();

        // Enter this connection in the map.
        this.mapRibosomeToShapeSegment[ribosome.id] = this.shapeSegments[0];
      }
    }
    return returnValue;
  }

  /**
   * Consider proposal from mRnaDestroyer and if it can attach return the attachment position
   * @param {MessengerRnaDestroyer} messengerRnaDestroyer
   * @returns {AttachmentSite}
   * @public
   */
  considerProposalFromMessengerRnaDestroyer(messengerRnaDestroyer) {
    assert && assert(this.messengerRnaDestroyer !== messengerRnaDestroyer); // Shouldn't get redundant proposals from same destroyer.

    let returnValue = null;
    if (this.attachmentAllowed()) {
      // See if the attachment site at the leading edge of the mRNA is available and close by.
      if (this.attachmentSite.attachedOrAttachingMoleculeProperty.get() === null && this.attachmentSite.positionProperty.get().distance(messengerRnaDestroyer.getPosition()) < MRNA_DESTROYER_CONNECT_DISTANCE) {
        // This attachment site is in range and available.
        returnValue = this.attachmentSite;

        // Update the attachment state machine.
        this.mRnaAttachmentStateMachine.attachToDestroyer();

        // Keep track of the destroyer.
        this.messengerRnaDestroyer = messengerRnaDestroyer;
      }
    }
    return returnValue;
  }

  /**
   * Aborts the destruction process, used if the mRNA destroyer was on its way to the mRNA but the user picked up
   * once of the two biomolecules before destruction started.
   * @public
   */
  abortDestruction() {
    this.messengerRnaDestroyer = null;
    this.attachmentStateMachine.forceImmediateUnattachedAndAvailable();
  }

  /**
   * @override
   * @returns {MessengerRnaAttachmentStateMachine}
   * @public
   */
  createAttachmentStateMachine() {
    return new MessengerRnaAttachmentStateMachine(this);
  }

  /**
   * Get the point in model space where the entrance of the given destroyer's translation channel should be in order to
   * be correctly attached to this strand of messenger RNA.
   * @returns {Vector2}
   * @public
   */
  getDestroyerGenerateInitialPosition3D() {
    // state checking - shouldn't be called before this is set
    assert && assert(this.segmentBeingDestroyed !== null);

    // the attachment position is at the right most side of the segment minus the leader length
    return this.attachmentSite.positionProperty.get();
  }
}
geneExpressionEssentials.register('MessengerRna', MessengerRna);
export default MessengerRna;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJWZWN0b3IyIiwiU2hhcGUiLCJnZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMiLCJHRUVDb25zdGFudHMiLCJNZXNzZW5nZXJSbmFBdHRhY2htZW50U3RhdGVNYWNoaW5lIiwiQXR0YWNobWVudFNpdGUiLCJGbGF0U2VnbWVudCIsIk1lc3NlbmdlclJuYURlc3Ryb3llciIsIlBsYWNlbWVudEhpbnQiLCJSaWJvc29tZSIsIldpbmRpbmdCaW9tb2xlY3VsZSIsIlJJQk9TT01FX0NPTk5FQ1RJT05fRElTVEFOQ0UiLCJNUk5BX0RFU1RST1lFUl9DT05ORUNUX0RJU1RBTkNFIiwiSU5JVElBTF9NUk5BX1NIQVBFIiwiY2lyY2xlIiwiTUlOX0xFTkdUSF9UT19BVFRBQ0giLCJNZXNzZW5nZXJSbmEiLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwicHJvdGVpblByb3RvdHlwZSIsInBvc2l0aW9uIiwib3B0aW9ucyIsIm1hcFJpYm9zb21lVG9TaGFwZVNlZ21lbnQiLCJiZWluZ1N5bnRoZXNpemVkUHJvcGVydHkiLCJtUm5hQXR0YWNobWVudFN0YXRlTWFjaGluZSIsImF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUiLCJtZXNzZW5nZXJSbmFEZXN0cm95ZXIiLCJzZWdtZW50QmVpbmdEZXN0cm95ZWQiLCJhdHRhY2htZW50U2l0ZSIsInNldFBvc2l0aW9uIiwic2VnbWVudCIsIlpFUk8iLCJzZXRDYXBhY2l0eSIsIkxFQURFUl9MRU5HVEgiLCJzaGFwZVNlZ21lbnRzIiwicHVzaCIsInJpYm9zb21lIiwicmlib3NvbWVQbGFjZW1lbnRIaW50IiwibVJuYURlc3Ryb3llclBsYWNlbWVudEhpbnQiLCJ1cGRhdGVIaW50UG9zaXRpb25zIiwic2hhcGUiLCJzdHJhbmRTdGFydFBvc2l0aW9uIiwiYm91bmRzIiwibWluWCIsIm1heFkiLCJtaW51cyIsIm9mZnNldFRvVHJhbnNsYXRpb25DaGFubmVsRW50cmFuY2UiLCJzaGFwZVByb3BlcnR5IiwibGluayIsImF0dGFjaG1lbnRTaXRlUG9zaXRpb25VcGRhdGVyIiwidXBkYXRlQXR0YWNobWVudFNpdGVQb3NpdGlvbiIsImJpbmQiLCJwb3NpdGlvblByb3BlcnR5IiwiZGlzcG9zZU1lc3NlbmdlclJuYSIsInVubGluayIsImRpc3Bvc2UiLCJzZXRGYWRlQXdheVdoZW5Gb3JtZWQiLCJmYWRlQXdheVdoZW5Gb3JtZWQiLCJhZHZhbmNlVHJhbnNsYXRpb24iLCJsZW5ndGgiLCJzZWdtZW50VG9BZHZhbmNlIiwiaWQiLCJhc3NlcnQiLCJhZHZhbmNlIiwiaW5kZXhPZiIsInJlYWxpZ25TZWdtZW50c0Zyb20iLCJyZWNlbnRlciIsIndpbmRQb2ludHNUaHJvdWdoU2VnbWVudHMiLCJnZXRDb250YWluZWRMZW5ndGgiLCJhZHZhbmNlRGVzdHJ1Y3Rpb24iLCJyZWR1Y2VMZW5ndGgiLCJmaXJzdFNoYXBlRGVmaW5pbmdQb2ludCIsImxhc3RTaGFwZURlZmluaW5nUG9pbnQiLCJyZWR1Y3Rpb25BbW91bnQiLCJnZXRMZW5ndGgiLCJzZXROZXh0UG9pbnQiLCJhZHZhbmNlQW5kUmVtb3ZlIiwiYW1vdW50UmVtb3ZlZCIsImdldFRhcmdldERpc3RhbmNlVG9QcmV2aW91c1BvaW50IiwiZ2V0UHJldmlvdXNQb2ludCIsInNldFRhcmdldERpc3RhbmNlVG9QcmV2aW91c1BvaW50IiwibGVhZGluZ1NoYXBlU2VnbWVudCIsInNldCIsImdldCIsIngiLCJ5IiwibWluWSIsImdldFByb3RlaW5Qcm90b3R5cGUiLCJnZXRSaWJvc29tZUdlbmVyYXRlSW5pdGlhbFBvc2l0aW9uM0QiLCJnZW5lcmF0ZUluaXRpYWxQb3NpdGlvbjNEIiwibVJuYVBvc2l0aW9uIiwic2VnbWVudENvcm5lclBvc2l0aW9uIiwiZ2V0UHJldmlvdXNTaGFwZVNlZ21lbnQiLCJnZXRMb3dlclJpZ2h0Q29ybmVyUG9zaXRpb24iLCJwbHVzWFkiLCJnZXRVcHBlckxlZnRDb3JuZXJQb3NpdGlvbiIsImdldFRyYW5zbGF0aW9uQ2hhbm5lbExlbmd0aCIsInJlbGVhc2VGcm9tUmlib3NvbWUiLCJfIiwia2V5cyIsImFsbFJpYm9zb21lc0RldGFjaGVkIiwicmVsZWFzZUZyb21Qb2x5bWVyYXNlIiwiZGV0YWNoIiwiaGFuZGxlR3JhYmJlZEJ5VXNlciIsImF0dGFjaGVkT3JBdHRhY2hpbmdNb2xlY3VsZSIsImF0dGFjaGVkT3JBdHRhY2hpbmdNb2xlY3VsZVByb3BlcnR5IiwiaXNUcmFuc2xhdGluZyIsImNhbmNlbFRyYW5zbGF0aW9uIiwiZm9yY2VJbW1lZGlhdGVVbmF0dGFjaGVkQW5kQXZhaWxhYmxlIiwiaXNEZXN0cnVjdGlvbkluUHJvZ3Jlc3MiLCJjYW5jZWxNZXNzZW5nZXJSbmFEZXN0cnVjdGlvbiIsImFjdGl2YXRlSGludHMiLCJiaW9tb2xlY3VsZSIsImFjdGl2YXRlSWZNYXRjaCIsImRlYWN0aXZhdGVBbGxIaW50cyIsImFjdGl2ZVByb3BlcnR5IiwiaW5pdGlhdGVUcmFuc2xhdGlvbiIsImZpcnN0U2hhcGVTZWdtZW50IiwiaXNGbGF0IiwiaW5pdGlhdGVEZXN0cnVjdGlvbiIsImdldERlc3RydWN0aW9uQ2hhbm5lbExlbmd0aCIsImdldFByb3BvcnRpb25PZlJuYVRyYW5zbGF0ZWQiLCJ0cmFuc2xhdGVkTGVuZ3RoIiwiZ2V0TGVuZ3RoT2ZSbmFUcmFuc2xhdGVkIiwiTWF0aCIsIm1heCIsInNlZ21lbnRJblJpYm9zb21lQ2hhbm5lbCIsImkiLCJzaGFwZVNlZ21lbnQiLCJhdHRhY2htZW50QWxsb3dlZCIsInVzZXJDb250cm9sbGVkUHJvcGVydHkiLCJjb25zaWRlclByb3Bvc2FsRnJvbVJpYm9zb21lIiwicmV0dXJuVmFsdWUiLCJkaXN0YW5jZSIsImdldEVudHJhbmNlT2ZSbmFDaGFubmVsUG9zaXRpb24iLCJhdHRhY2hlZFRvUmlib3NvbWUiLCJjb25zaWRlclByb3Bvc2FsRnJvbU1lc3NlbmdlclJuYURlc3Ryb3llciIsImdldFBvc2l0aW9uIiwiYXR0YWNoVG9EZXN0cm95ZXIiLCJhYm9ydERlc3RydWN0aW9uIiwiY3JlYXRlQXR0YWNobWVudFN0YXRlTWFjaGluZSIsImdldERlc3Ryb3llckdlbmVyYXRlSW5pdGlhbFBvc2l0aW9uM0QiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1lc3NlbmdlclJuYS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDbGFzcyB0aGF0IHJlcHJlc2VudHMgbWVzc2VuZ2VyIHJpYm9udWNsZWljIGFjaWQsIG9yIG1STkEsIGluIHRoZSBtb2RlbC4gVGhpcyBjbGFzcyBpcyBmYWlybHkgY29tcGxleCwgZHVlIHRvIHRoZVxyXG4gKiBuZWVkIGZvciBtUk5BIHRvIHdpbmQgdXAgYW5kIHVud2luZCBhcyBpdCBpcyB0cmFuc2NyaWJlZCwgdHJhbnNsYXRlZCwgYW5kIGRlc3Ryb3llZC5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIE1vaGFtZWQgU2FmaVxyXG4gKiBAYXV0aG9yIEFhZGlzaCBHdXB0YVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGdlbmVFeHByZXNzaW9uRXNzZW50aWFscyBmcm9tICcuLi8uLi9nZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMuanMnO1xyXG5pbXBvcnQgR0VFQ29uc3RhbnRzIGZyb20gJy4uL0dFRUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBNZXNzZW5nZXJSbmFBdHRhY2htZW50U3RhdGVNYWNoaW5lIGZyb20gJy4vYXR0YWNobWVudC1zdGF0ZS1tYWNoaW5lcy9NZXNzZW5nZXJSbmFBdHRhY2htZW50U3RhdGVNYWNoaW5lLmpzJztcclxuaW1wb3J0IEF0dGFjaG1lbnRTaXRlIGZyb20gJy4vQXR0YWNobWVudFNpdGUuanMnO1xyXG5pbXBvcnQgRmxhdFNlZ21lbnQgZnJvbSAnLi9GbGF0U2VnbWVudC5qcyc7XHJcbmltcG9ydCBNZXNzZW5nZXJSbmFEZXN0cm95ZXIgZnJvbSAnLi9NZXNzZW5nZXJSbmFEZXN0cm95ZXIuanMnO1xyXG5pbXBvcnQgUGxhY2VtZW50SGludCBmcm9tICcuL1BsYWNlbWVudEhpbnQuanMnO1xyXG5pbXBvcnQgUmlib3NvbWUgZnJvbSAnLi9SaWJvc29tZS5qcyc7XHJcbmltcG9ydCBXaW5kaW5nQmlvbW9sZWN1bGUgZnJvbSAnLi9XaW5kaW5nQmlvbW9sZWN1bGUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFJJQk9TT01FX0NPTk5FQ1RJT05fRElTVEFOQ0UgPSA0MDA7IC8vIHBpY29tZXRlcnMgLSBkaXN0YW5jZSB3aXRoaW4gd2hpY2ggdGhpcyB3aWxsIGNvbm5lY3QgdG8gYSByaWJvc29tZVxyXG5jb25zdCBNUk5BX0RFU1RST1lFUl9DT05ORUNUX0RJU1RBTkNFID0gNDAwOyAvLyBwaWNvbWV0ZXJzIC0gRGlzdGFuY2Ugd2l0aGluIHdoaWNoIHRoaXMgd2lsbCBjb25uZWN0IHRvIGEgbVJOQSBkZXN0cm95ZXJcclxuY29uc3QgSU5JVElBTF9NUk5BX1NIQVBFID0gU2hhcGUuY2lyY2xlKCAwLCAwLCAwLjEgKTsgLy8gdGlueSBjaXJjbGUgdW50aWwgdGhlIHN0cmFuZCBzdGFydHMgdG8gZ3Jvd1xyXG5jb25zdCBNSU5fTEVOR1RIX1RPX0FUVEFDSCA9IDc1OyAvLyBwaWNvbWV0ZXJzIC0gbWluIGxlbmd0aCBiZWZvcmUgYXR0YWNobWVudHMgYXJlIGFsbG93ZWRcclxuXHJcbmNsYXNzIE1lc3NlbmdlclJuYSBleHRlbmRzIFdpbmRpbmdCaW9tb2xlY3VsZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdG9yLiAgVGhpcyBjcmVhdGVzIHRoZSBtUk5BIGFzIGEgc2luZ2xlIHBvaW50LCB3aXRoIHRoZSBpbnRlbnRpb24gb2YgZ3Jvd2luZyBpdC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7R2VuZUV4cHJlc3Npb25Nb2RlbH0gbW9kZWxcclxuICAgKiBAcGFyYW0ge1Byb3RlaW59IHByb3RlaW5Qcm90b3R5cGVcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvc2l0aW9uXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCwgcHJvdGVpblByb3RvdHlwZSwgcG9zaXRpb24sIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgc3VwZXIoIG1vZGVsLCBJTklUSUFMX01STkFfU0hBUEUsIHBvc2l0aW9uLCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge09iamVjdH0gLSBvYmplY3QgdGhhdCBtYXBzIGZyb20gcmlib3NvbWVzIHRvIHRoZSBzaGFwZSBzZWdtZW50IHRvIHdoaWNoIHRoZXkgYXJlIGF0dGFjaGVkXHJcbiAgICB0aGlzLm1hcFJpYm9zb21lVG9TaGFwZVNlZ21lbnQgPSB7fTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtCb29sZWFuUHJvcGVydHl9IC0gZXh0ZXJuYWxseSB2aXNpYmxlIGluZGljYXRvciBmb3Igd2hldGhlciB0aGlzIG1STkEgaXMgYmVpbmcgc3ludGhlc2l6ZWQsIGFzc3VtZXMgdGhhdFxyXG4gICAgLy8gaXQgaXMgYmVpbmcgc3ludGhlc2l6ZWQgd2hlbiBpbml0aWFsbHkgY3JlYXRlZFxyXG4gICAgdGhpcy5iZWluZ1N5bnRoZXNpemVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICk7IC8vQHB1YmxpY1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gcHJvdGVpbiBwcm90b3R5cGUsIHVzZWQgdG8ga2VlcCB0cmFjayBvZiBwcm90ZWluIHRoYXQgc2hvdWxkIGJlIHN5bnRoZXNpemVkIGZyb20gdGhpcyBwYXJ0aWN1bGFyXHJcbiAgICAvLyBzdHJhbmQgb2YgbVJOQVxyXG4gICAgdGhpcy5wcm90ZWluUHJvdG90eXBlID0gcHJvdGVpblByb3RvdHlwZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIGxvY2FsIHJlZmVyZW5jZSB0byB0aGUgbm9uLWdlbmVyaWMgc3RhdGUgbWFjaGluZSB1c2VkIGJ5IHRoaXMgbW9sZWN1bGVcclxuICAgIHRoaXMubVJuYUF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUgPSB0aGlzLmF0dGFjaG1lbnRTdGF0ZU1hY2hpbmU7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBtUk5BIGRlc3Ryb3llciB0aGF0IGlzIGRlc3Ryb3lpbmcgdGhpcyBtUk5BLiBOdWxsIHVudGlsIGFuZCB1bmxlc3MgZGVzdHJ1Y3Rpb24gaGFzIGJlZ3VuLlxyXG4gICAgdGhpcy5tZXNzZW5nZXJSbmFEZXN0cm95ZXIgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gU2hhcGUgc2VnbWVudCB3aGVyZSB0aGUgbVJOQSBkZXN0cm95ZXIgaXMgY29ubmVjdGVkLiBUaGlzIGlzIG51bGwgdW50aWwgZGVzdHJ1Y3Rpb24gaGFzIGJlZ3VuLlxyXG4gICAgdGhpcy5zZWdtZW50QmVpbmdEZXN0cm95ZWQgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtBdHRhY2htZW50U2l0ZX0gLSBzaXRlIHdoZXJlIHJpYm9zb21lcyBvciBtUk5BIGRlc3Ryb3llcnMgY2FuIGF0dGFjaFxyXG4gICAgdGhpcy5hdHRhY2htZW50U2l0ZSA9IG5ldyBBdHRhY2htZW50U2l0ZSggdGhpcywgbmV3IFZlY3RvcjIoIDAsIDAgKSwgMSApO1xyXG5cclxuICAgIC8vIHNldCB0aGUgaW5pdGlhbCBwb3NpdGlvblxyXG4gICAgdGhpcy5zZXRQb3NpdGlvbiggcG9zaXRpb24gKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIGZpcnN0IHNlZ21lbnQgdG8gdGhlIHNoYXBlIHNlZ21lbnQgbGlzdC4gVGhpcyBzZWdtZW50IHdpbGwgY29udGFpbiB0aGUgXCJsZWFkZXJcIiBmb3IgdGhlIG1STkEuXHJcbiAgICBjb25zdCBzZWdtZW50ID0gbmV3IEZsYXRTZWdtZW50KCB0aGlzLCBWZWN0b3IyLlpFUk8gKTtcclxuICAgIHNlZ21lbnQuc2V0Q2FwYWNpdHkoIEdFRUNvbnN0YW50cy5MRUFERVJfTEVOR1RIICk7XHJcbiAgICB0aGlzLnNoYXBlU2VnbWVudHMucHVzaCggc2VnbWVudCApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgcGxhY2VtZW50IGhpbnRzIGZvciB0aGUgcG9zaXRpb25zIHdoZXJlIHRoZSB1c2VyIGNhbiBhdHRhY2ggYSByaWJvc29tZSBvciBhbiBtUk5BIGRlc3Ryb3llci5cclxuICAgIGNvbnN0IHJpYm9zb21lID0gbmV3IFJpYm9zb21lKCBtb2RlbCApO1xyXG4gICAgdGhpcy5yaWJvc29tZVBsYWNlbWVudEhpbnQgPSBuZXcgUGxhY2VtZW50SGludCggcmlib3NvbWUgKTsgLy9AcHVibGljKHJlYWQtb25seSlcclxuICAgIHRoaXMubVJuYURlc3Ryb3llclBsYWNlbWVudEhpbnQgPSBuZXcgUGxhY2VtZW50SGludCggbmV3IE1lc3NlbmdlclJuYURlc3Ryb3llciggbW9kZWwgKSApOyAvL0BwdWJsaWMocmVhZC1vbmx5KVxyXG5cclxuICAgIGNvbnN0IHVwZGF0ZUhpbnRQb3NpdGlvbnMgPSBzaGFwZSA9PiB7XHJcblxyXG4gICAgICAvLyBBbGwgaGludHMgYWx3YXlzIHNpdCBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBSTkEgc3RyYW5kIGFuZCBhcmUgcG9zaXRpb25lZCByZWxhdGl2ZSB0byBpdHMgY2VudGVyLlxyXG4gICAgICBjb25zdCBzdHJhbmRTdGFydFBvc2l0aW9uID0gbmV3IFZlY3RvcjIoIHNoYXBlLmJvdW5kcy5taW5YLCBzaGFwZS5ib3VuZHMubWF4WSApO1xyXG4gICAgICB0aGlzLnJpYm9zb21lUGxhY2VtZW50SGludC5zZXRQb3NpdGlvbiggc3RyYW5kU3RhcnRQb3NpdGlvbi5taW51cyggcmlib3NvbWUub2Zmc2V0VG9UcmFuc2xhdGlvbkNoYW5uZWxFbnRyYW5jZSApICk7XHJcbiAgICAgIHRoaXMubVJuYURlc3Ryb3llclBsYWNlbWVudEhpbnQuc2V0UG9zaXRpb24oIHN0cmFuZFN0YXJ0UG9zaXRpb24gKTtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5zaGFwZVByb3BlcnR5LmxpbmsoIHVwZGF0ZUhpbnRQb3NpdGlvbnMgKTtcclxuXHJcbiAgICAvLyB1cGRhdGUgdGhlIGF0dGFjaG1lbnQgc2l0ZSBwb3NpdGlvbiB3aGVuIHRoZSBtUk5BIG1vdmVzIG9yIGNoYW5nZXMgc2hhcGVcclxuICAgIGNvbnN0IGF0dGFjaG1lbnRTaXRlUG9zaXRpb25VcGRhdGVyID0gdGhpcy51cGRhdGVBdHRhY2htZW50U2l0ZVBvc2l0aW9uLmJpbmQoIHRoaXMgKTtcclxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5saW5rKCBhdHRhY2htZW50U2l0ZVBvc2l0aW9uVXBkYXRlciApO1xyXG4gICAgdGhpcy5zaGFwZVByb3BlcnR5LmxpbmsoIGF0dGFjaG1lbnRTaXRlUG9zaXRpb25VcGRhdGVyICk7XHJcblxyXG4gICAgdGhpcy5kaXNwb3NlTWVzc2VuZ2VyUm5hID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHRoaXMuc2hhcGVQcm9wZXJ0eS51bmxpbmsoIHVwZGF0ZUhpbnRQb3NpdGlvbnMgKTtcclxuICAgICAgdGhpcy5zaGFwZVByb3BlcnR5LnVubGluayggYXR0YWNobWVudFNpdGVQb3NpdGlvblVwZGF0ZXIgKTtcclxuICAgICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnVubGluayggYXR0YWNobWVudFNpdGVQb3NpdGlvblVwZGF0ZXIgKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHRoaXMubWFwUmlib3NvbWVUb1NoYXBlU2VnbWVudCA9IG51bGw7XHJcbiAgICB0aGlzLmRpc3Bvc2VNZXNzZW5nZXJSbmEoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbW1hbmQgdGhpcyBtUk5BIHN0cmFuZCB0byBmYWRlIGF3YXkgd2hlbiBpdCBoYXMgYmVjb21lIGZ1bGx5IGZvcm1lZC4gVGhpcyB3YXMgY3JlYXRlZCBmb3IgdXNlIGluIHRoZSAybmRcclxuICAgKiBzY3JlZW4sIHdoZXJlIG1STkEgaXMgbmV2ZXIgdHJhbnNsYXRlZCBvbmNlIGl0IGlzIHByb2R1Y2VkLlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZmFkZUF3YXlXaGVuRm9ybWVkXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldEZhZGVBd2F5V2hlbkZvcm1lZCggZmFkZUF3YXlXaGVuRm9ybWVkICkge1xyXG5cclxuICAgIC8vIEp1c3QgcGFzcyB0aGlzIHRocm91Z2ggdG8gdGhlIHN0YXRlIG1hY2hpbmUuXHJcbiAgICB0aGlzLm1SbmFBdHRhY2htZW50U3RhdGVNYWNoaW5lLnNldEZhZGVBd2F5V2hlbkZvcm1lZCggZmFkZUF3YXlXaGVuRm9ybWVkICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZHZhbmNlIHRoZSB0cmFuc2xhdGlvbiBvZiB0aGUgbVJOQSB0aHJvdWdoIHRoZSBnaXZlbiByaWJvc29tZSBieSB0aGUgc3BlY2lmaWVkIGxlbmd0aC4gVGhlIGdpdmVuIHJpYm9zb21lIG11c3RcclxuICAgKiBhbHJlYWR5IGJlIGF0dGFjaGVkIHRvIHRoZSBtUk5BLlxyXG4gICAqIEBwYXJhbSB7Umlib3NvbWV9IHJpYm9zb21lIC0gVGhlIHJpYm9zb21lIGJ5IHdoaWNoIHRoZSBtUk5BIGlzIGJlaW5nIHRyYW5zbGF0ZWQuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aCAgIC0gVGhlIGFtb3VudCBvZiBtUk5BIHRvIG1vdmUgdGhyb3VnaCB0aGUgdHJhbnNsYXRpb24gY2hhbm5lbC5cclxuICAgKiBAcmV0dXJucyAtIHRydWUgaWYgdGhlIG1STkEgaXMgY29tcGxldGVseSB0aHJvdWdoIHRoZSBjaGFubmVsLCBpbmRpY2F0aW5nLCB0aGF0IHRyYW5zY3JpcHRpb24gaXMgY29tcGxldGUsIGFuZCBmYWxzZVxyXG4gICAqIGlmIG5vdC5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYWR2YW5jZVRyYW5zbGF0aW9uKCByaWJvc29tZSwgbGVuZ3RoICkge1xyXG5cclxuICAgIGNvbnN0IHNlZ21lbnRUb0FkdmFuY2UgPSB0aGlzLm1hcFJpYm9zb21lVG9TaGFwZVNlZ21lbnRbIHJpYm9zb21lLmlkIF07XHJcblxyXG4gICAgLy8gRXJyb3IgY2hlY2tpbmcuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzZWdtZW50VG9BZHZhbmNlICE9PSBudWxsICk7IC8vIFNob3VsZCBuZXZlciBoYXBwZW4sIHNpbmNlIGl0IG1lYW5zIHRoYXQgdGhlIHJpYm9zb21lIGlzbid0IGF0dGFjaGVkLlxyXG5cclxuICAgIC8vIEFkdmFuY2UgdGhlIHRyYW5zbGF0aW9uIGJ5IGFkdmFuY2luZyB0aGUgcG9zaXRpb24gb2YgdGhlIG1STkEgaW4gdGhlIHNlZ21lbnQgdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgdHJhbnNsYXRpb25cclxuICAgIC8vIGNoYW5uZWwgb2YgdGhlIHJpYm9zb21lLlxyXG4gICAgc2VnbWVudFRvQWR2YW5jZS5hZHZhbmNlKCBsZW5ndGgsIHRoaXMsIHRoaXMuc2hhcGVTZWdtZW50cyApO1xyXG5cclxuICAgIC8vIFJlYWxpZ24gdGhlIHNlZ21lbnRzLCBzaW5jZSB0aGV5IG1heSB3ZWxsIGhhdmUgY2hhbmdlZCBzaGFwZS5cclxuICAgIGlmICggdGhpcy5zaGFwZVNlZ21lbnRzLmluZGV4T2YoIHNlZ21lbnRUb0FkdmFuY2UgKSAhPT0gLTEgKSB7XHJcbiAgICAgIHRoaXMucmVhbGlnblNlZ21lbnRzRnJvbSggc2VnbWVudFRvQWR2YW5jZSApO1xyXG4gICAgICB0aGlzLnJlY2VudGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2luY2UgdGhlIHNpemVzIGFuZCByZWxhdGlvbnNoaXBzIG9mIHRoZSBzZWdtZW50cyBwcm9iYWJseSBjaGFuZ2VkLCB0aGUgd2luZGluZyBhbGdvcml0aG0gbmVlZHMgdG8gYmUgcmVydW4uXHJcbiAgICB0aGlzLndpbmRQb2ludHNUaHJvdWdoU2VnbWVudHMoKTtcclxuXHJcbiAgICAvLyBJZiB0aGVyZSBpcyBhbnl0aGluZyBsZWZ0IGluIHRoaXMgc2VnbWVudCwgdGhlbiB0cmFuc2NyaXB0aW9uIGlzIG5vdCB5ZXQgY29tcGxldGUuXHJcbiAgICByZXR1cm4gc2VnbWVudFRvQWR2YW5jZS5nZXRDb250YWluZWRMZW5ndGgoKSA8PSAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWR2YW5jZSB0aGUgZGVzdHJ1Y3Rpb24gb2YgdGhlIG1STkEgYnkgdGhlIHNwZWNpZmllZCBsZW5ndGguIFRoaXMgcHVsbHMgdGhlIHN0cmFuZCBpbnRvIHRoZSBsZWFkIHNlZ21lbnQgbXVjaCBsaWtlXHJcbiAgICogdHJhbnNsYXRpb24gZG9lcywgYnV0IGRvZXMgbm90IG1vdmUgdGhlIHBvaW50cyBpbnRvIG5ldyBzZWdtZW50LCBpdCBqdXN0IGdldHMgcmlkIG9mIHRoZW0uXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxlbmd0aFxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhZHZhbmNlRGVzdHJ1Y3Rpb24oIGxlbmd0aCApIHtcclxuXHJcbiAgICAvLyBFcnJvciBjaGVja2luZy5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICAgIHRoaXMuc2VnbWVudEJlaW5nRGVzdHJveWVkICE9PSBudWxsLFxyXG4gICAgICAnZXJyb3IgLSBhdHRlbXB0IHRvIGFkdmFuY2UgdGhlIGRlc3RydWN0aW9uIG9mIG1STkEgdGhhdCBoYXMgbm8gY29udGVudCBsZWZ0J1xyXG4gICAgKTtcclxuXHJcbiAgICAvLyBBZHZhbmNlIHRoZSBkZXN0cnVjdGlvbiBieSByZWR1Y2luZyB0aGUgbGVuZ3RoIG9mIHRoZSBtUk5BLlxyXG4gICAgdGhpcy5yZWR1Y2VMZW5ndGgoIGxlbmd0aCApO1xyXG5cclxuICAgIC8vIFJlYWxpZ24gdGhlIHNlZ21lbnRzLCBzaW5jZSB0aGV5IG1heSB3ZWxsIGhhdmUgY2hhbmdlZCBzaGFwZS5cclxuICAgIGlmICggdGhpcy5zaGFwZVNlZ21lbnRzLmluZGV4T2YoIHRoaXMuc2VnbWVudEJlaW5nRGVzdHJveWVkICkgIT09IC0xICkge1xyXG4gICAgICB0aGlzLnJlYWxpZ25TZWdtZW50c0Zyb20oIHRoaXMuc2VnbWVudEJlaW5nRGVzdHJveWVkICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB0aGlzLnNoYXBlU2VnbWVudHMubGVuZ3RoID4gMCApIHtcclxuXHJcbiAgICAgIC8vIFNpbmNlIHRoZSBzaXplcyBhbmQgcmVsYXRpb25zaGlwcyBvZiB0aGUgc2VnbWVudHMgcHJvYmFibHkgY2hhbmdlZCwgdGhlIHdpbmRpbmcgYWxnb3JpdGhtIG5lZWRzIHRvIGJlIHJlcnVuLlxyXG4gICAgICB0aGlzLndpbmRQb2ludHNUaHJvdWdoU2VnbWVudHMoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiB0aGVyZSBpcyBhbnkgbGVuZ3RoIGxlZnQsIHRoZW4gdGhlIGRlc3RydWN0aW9uIGlzIG5vdCB5ZXQgY29tcGxldGUuIFRoaXMgaXMgYSBxdWljayB3YXkgdG8gdGVzdCB0aGlzLlxyXG4gICAgcmV0dXJuIHRoaXMuZmlyc3RTaGFwZURlZmluaW5nUG9pbnQgPT09IHRoaXMubGFzdFNoYXBlRGVmaW5pbmdQb2ludDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlZHVjZSB0aGUgbGVuZ3RoIG9mIHRoZSBtUk5BLiBUaGlzIGhhbmRsZXMgYm90aCB0aGUgc2hhcGUgc2VnbWVudHMgYW5kIHRoZSBzaGFwZS1kZWZpbmluZyBwb2ludHMuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlZHVjdGlvbkFtb3VudFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgcmVkdWNlTGVuZ3RoKCByZWR1Y3Rpb25BbW91bnQgKSB7XHJcbiAgICBpZiAoIHJlZHVjdGlvbkFtb3VudCA+PSB0aGlzLmdldExlbmd0aCgpICkge1xyXG5cclxuICAgICAgLy8gUmVkdWNlIGxlbmd0aCB0byBiZSB6ZXJvLlxyXG4gICAgICB0aGlzLmxhc3RTaGFwZURlZmluaW5nUG9pbnQgPSB0aGlzLmZpcnN0U2hhcGVEZWZpbmluZ1BvaW50O1xyXG4gICAgICB0aGlzLmxhc3RTaGFwZURlZmluaW5nUG9pbnQuc2V0TmV4dFBvaW50KCBudWxsICk7XHJcbiAgICAgIHRoaXMuc2hhcGVTZWdtZW50cy5sZW5ndGggPSAwO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBSZW1vdmUgdGhlIGxlbmd0aCBmcm9tIHRoZSBzaGFwZSBzZWdtZW50cy5cclxuICAgICAgdGhpcy5zZWdtZW50QmVpbmdEZXN0cm95ZWQuYWR2YW5jZUFuZFJlbW92ZSggcmVkdWN0aW9uQW1vdW50LCB0aGlzLCB0aGlzLnNoYXBlU2VnbWVudHMgKTtcclxuXHJcbiAgICAgIC8vIFJlbW92ZSB0aGUgbGVuZ3RoIGZyb20gdGhlIHNoYXBlIGRlZmluaW5nIHBvaW50cy5cclxuICAgICAgZm9yICggbGV0IGFtb3VudFJlbW92ZWQgPSAwOyBhbW91bnRSZW1vdmVkIDwgcmVkdWN0aW9uQW1vdW50OyApIHtcclxuICAgICAgICBpZiAoIHRoaXMubGFzdFNoYXBlRGVmaW5pbmdQb2ludC5nZXRUYXJnZXREaXN0YW5jZVRvUHJldmlvdXNQb2ludCgpIDw9IHJlZHVjdGlvbkFtb3VudCAtIGFtb3VudFJlbW92ZWQgKSB7XHJcblxyXG4gICAgICAgICAgLy8gUmVtb3ZlIHRoZSBsYXN0IHBvaW50IGZyb20gdGhlIGxpc3QuXHJcbiAgICAgICAgICBhbW91bnRSZW1vdmVkICs9IHRoaXMubGFzdFNoYXBlRGVmaW5pbmdQb2ludC5nZXRUYXJnZXREaXN0YW5jZVRvUHJldmlvdXNQb2ludCgpO1xyXG4gICAgICAgICAgdGhpcy5sYXN0U2hhcGVEZWZpbmluZ1BvaW50ID0gdGhpcy5sYXN0U2hhcGVEZWZpbmluZ1BvaW50LmdldFByZXZpb3VzUG9pbnQoKTtcclxuICAgICAgICAgIHRoaXMubGFzdFNoYXBlRGVmaW5pbmdQb2ludC5zZXROZXh0UG9pbnQoIG51bGwgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gUmVkdWNlIHRoZSBkaXN0YW5jZSBvZiB0aGUgbGFzdCBwb2ludCBmcm9tIHRoZSBwcmV2aW91cyBwb2ludC5cclxuICAgICAgICAgIHRoaXMubGFzdFNoYXBlRGVmaW5pbmdQb2ludC5zZXRUYXJnZXREaXN0YW5jZVRvUHJldmlvdXNQb2ludCggdGhpcy5sYXN0U2hhcGVEZWZpbmluZ1BvaW50LmdldFRhcmdldERpc3RhbmNlVG9QcmV2aW91c1BvaW50KCkgLSAoIHJlZHVjdGlvbkFtb3VudCAtIGFtb3VudFJlbW92ZWQgKSApO1xyXG4gICAgICAgICAgYW1vdW50UmVtb3ZlZCA9IHJlZHVjdGlvbkFtb3VudDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdXBkYXRlQXR0YWNobWVudFNpdGVQb3NpdGlvbigpIHtcclxuICAgIGlmICggdGhpcy5zaGFwZVNlZ21lbnRzLmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgIGNvbnN0IGxlYWRpbmdTaGFwZVNlZ21lbnQgPSB0aGlzLnNoYXBlU2VnbWVudHNbIDAgXTtcclxuICAgICAgdGhpcy5hdHRhY2htZW50U2l0ZS5wb3NpdGlvblByb3BlcnR5LnNldCggbmV3IFZlY3RvcjIoXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LmdldCgpLnggKyBsZWFkaW5nU2hhcGVTZWdtZW50LmJvdW5kcy5taW5YLFxyXG4gICAgICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS55ICsgbGVhZGluZ1NoYXBlU2VnbWVudC5ib3VuZHMubWluWVxyXG4gICAgICApICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5hdHRhY2htZW50U2l0ZS5wb3NpdGlvblByb3BlcnR5LnNldCggdGhpcy5wb3NpdGlvblByb3BlcnR5LmdldCgpICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYSBuZXcgdmVyc2lvbiBvZiB0aGUgcHJvdGVpbiB0aGF0IHNob3VsZCByZXN1bHQgd2hlbiB0aGlzIHN0cmFuZCBvZiBtUk5BIGlzIHRyYW5zbGF0ZWQuXHJcbiAgICogQHJldHVybnMge1Byb3RlaW59XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFByb3RlaW5Qcm90b3R5cGUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5wcm90ZWluUHJvdG90eXBlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBwb2ludCBpbiBtb2RlbCBzcGFjZSB3aGVyZSB0aGUgZW50cmFuY2Ugb2YgdGhlIGdpdmVuIHJpYm9zb21lJ3MgdHJhbnNsYXRpb24gY2hhbm5lbCBzaG91bGQgYmUgaW4gb3JkZXIgdG9cclxuICAgKiBiZSBjb3JyZWN0bHkgYXR0YWNoZWQgdG8gdGhpcyBzdHJhbmQgb2YgbWVzc2VuZ2VyIFJOQS4gVGhpcyBhbGxvd3MgdGhlIHJpYm9zb21lIHRvIFwiZm9sbG93XCIgdGhlIG1STkEgaWYgaXQgaXNcclxuICAgKiBtb3Zpbmcgb3IgY2hhbmdpbmcgc2hhcGUuXHJcbiAgICogQHBhcmFtIHtSaWJvc29tZX0gcmlib3NvbWVcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0Umlib3NvbWVHZW5lcmF0ZUluaXRpYWxQb3NpdGlvbjNEKCByaWJvc29tZSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICAgIHRoaXMubWFwUmlib3NvbWVUb1NoYXBlU2VnbWVudFsgcmlib3NvbWUuaWQgXSxcclxuICAgICAgJ2F0dGVtcHQgbWFkZSB0byBnZXQgYXR0YWNobWVudCBwb3NpdGlvbiBmb3IgdW5hdHRhY2hlZCByaWJvc29tZSdcclxuICAgICk7XHJcbiAgICBsZXQgZ2VuZXJhdGVJbml0aWFsUG9zaXRpb24zRDtcclxuICAgIGNvbnN0IG1SbmFQb3NpdGlvbiA9IHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKTtcclxuICAgIGNvbnN0IHNlZ21lbnQgPSB0aGlzLm1hcFJpYm9zb21lVG9TaGFwZVNlZ21lbnRbIHJpYm9zb21lLmlkIF07XHJcbiAgICBsZXQgc2VnbWVudENvcm5lclBvc2l0aW9uO1xyXG4gICAgaWYgKCB0aGlzLmdldFByZXZpb3VzU2hhcGVTZWdtZW50KCBzZWdtZW50ICkgPT09IG51bGwgKSB7XHJcblxyXG4gICAgICAvLyBUaGVyZSBpcyBubyBwcmV2aW91cyBzZWdtZW50LCB3aGljaCBtZWFucyB0aGF0IHRoZSBzZWdtZW50IHRvIHdoaWNoIHRoaXMgcmlib3NvbWUgaXMgYXR0YWNoZWQgaXMgdGhlIGxlYWRlclxyXG4gICAgICAvLyBzZWdtZW50LiBUaGUgYXR0YWNobWVudCBwb2ludCBpcyB0aHVzIHRoZSBsZWFkZXIgbGVuZ3RoIGZyb20gaXRzIHJpZ2h0bW9zdCBlZGdlLlxyXG4gICAgICBzZWdtZW50Q29ybmVyUG9zaXRpb24gPSBzZWdtZW50LmdldExvd2VyUmlnaHRDb3JuZXJQb3NpdGlvbigpO1xyXG4gICAgICBnZW5lcmF0ZUluaXRpYWxQb3NpdGlvbjNEID0gbVJuYVBvc2l0aW9uLnBsdXNYWShcclxuICAgICAgICBzZWdtZW50Q29ybmVyUG9zaXRpb24ueCAtIEdFRUNvbnN0YW50cy5MRUFERVJfTEVOR1RILFxyXG4gICAgICAgIHNlZ21lbnRDb3JuZXJQb3NpdGlvbi55XHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIFRoZSBzZWdtZW50IGhhcyBmaWxsZWQgdXAgdGhlIGNoYW5uZWwsIHNvIGNhbGN1bGF0ZSB0aGUgcG9zaXRpb24gYmFzZWQgb24gaXRzIGxlZnQgZWRnZS5cclxuICAgICAgc2VnbWVudENvcm5lclBvc2l0aW9uID0gc2VnbWVudC5nZXRVcHBlckxlZnRDb3JuZXJQb3NpdGlvbigpO1xyXG4gICAgICBnZW5lcmF0ZUluaXRpYWxQb3NpdGlvbjNEID0gbVJuYVBvc2l0aW9uLnBsdXNYWShcclxuICAgICAgICBzZWdtZW50Q29ybmVyUG9zaXRpb24ueCArIHJpYm9zb21lLmdldFRyYW5zbGF0aW9uQ2hhbm5lbExlbmd0aCgpLFxyXG4gICAgICAgIHNlZ21lbnRDb3JuZXJQb3NpdGlvbi55XHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZ2VuZXJhdGVJbml0aWFsUG9zaXRpb24zRDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbGVhc2UgdGhpcyBtUk5BIGZyb20gYSByaWJvc29tZS4gSWYgdGhpcyBpcyB0aGUgb25seSByaWJvc29tZSB0byB3aGljaCB0aGUgbVJOQSBpcyBjb25uZWN0ZWQsIHRoZSBtUk5BIHdpbGxcclxuICAgKiBzdGFydCB3YW5kZXJpbmcuXHJcbiAgICogQHBhcmFtIHtSaWJvc29tZX0gcmlib3NvbWVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVsZWFzZUZyb21SaWJvc29tZSggcmlib3NvbWUgKSB7XHJcbiAgICBkZWxldGUgdGhpcy5tYXBSaWJvc29tZVRvU2hhcGVTZWdtZW50WyByaWJvc29tZS5pZCBdO1xyXG4gICAgaWYgKCBfLmtleXMoIHRoaXMubWFwUmlib3NvbWVUb1NoYXBlU2VnbWVudCApLmxlbmd0aCA9PT0gMCApIHtcclxuICAgICAgdGhpcy5tUm5hQXR0YWNobWVudFN0YXRlTWFjaGluZS5hbGxSaWJvc29tZXNEZXRhY2hlZCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVsZWFzZSB0aGlzIG1STkEgZnJvbSB0aGUgcG9seW1lcmFzZSB3aGljaCBpcywgcHJlc3VtYWJseSwgdHJhbnNjcmliaW5nIGl0LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZWxlYXNlRnJvbVBvbHltZXJhc2UoKSB7XHJcbiAgICB0aGlzLm1SbmFBdHRhY2htZW50U3RhdGVNYWNoaW5lLmRldGFjaCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhpcyBvdmVycmlkZSBjaGVja3MgdG8gc2VlIGlmIHRoZSBtUk5BIGlzIGFib3V0IHRvIGJlIHRyYW5zbGF0ZWQgYW5kIGRlc3Ryb3llZCBhbmQsIGlmIHNvLCBhYm9ydHMgdGhvc2VcclxuICAgKiBvcGVyYXRpb25zLiAgSWYgdHJhbnNsYXRpb24gb3IgZGVzdHJ1Y3Rpb24gYXJlIGluIHByb2dyZXNzLCBub3RoaW5nIGlzIGRvbmUsIHNpbmNlIHRob3NlIGNhbid0IGJlIHN0b3BwZWQgb25jZVxyXG4gICAqIHRoZXkndmUgc3RhcnRlZC5cclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgaGFuZGxlR3JhYmJlZEJ5VXNlcigpIHtcclxuXHJcbiAgICBjb25zdCBhdHRhY2hlZE9yQXR0YWNoaW5nTW9sZWN1bGUgPSB0aGlzLmF0dGFjaG1lbnRTaXRlLmF0dGFjaGVkT3JBdHRhY2hpbmdNb2xlY3VsZVByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgIGlmICggYXR0YWNoZWRPckF0dGFjaGluZ01vbGVjdWxlIGluc3RhbmNlb2YgUmlib3NvbWUgKSB7XHJcblxyXG4gICAgICAvLyBpZiBhIHJpYm9zb21lIGlzIG1vdmluZyB0b3dhcmRzIHRoaXMgbVJOQSBzdHJhbmQgYnV0IHRyYW5zbGF0aW9uIGhhc24ndCBzdGFydGVkLCBjYWxsIG9mZiB0aGUgd2VkZGluZ1xyXG4gICAgICBpZiAoICFhdHRhY2hlZE9yQXR0YWNoaW5nTW9sZWN1bGUuaXNUcmFuc2xhdGluZygpICkge1xyXG4gICAgICAgIGF0dGFjaGVkT3JBdHRhY2hpbmdNb2xlY3VsZS5jYW5jZWxUcmFuc2xhdGlvbigpO1xyXG4gICAgICAgIHRoaXMucmVsZWFzZUZyb21SaWJvc29tZSggYXR0YWNoZWRPckF0dGFjaGluZ01vbGVjdWxlICk7XHJcbiAgICAgICAgdGhpcy5hdHRhY2htZW50U3RhdGVNYWNoaW5lLmZvcmNlSW1tZWRpYXRlVW5hdHRhY2hlZEFuZEF2YWlsYWJsZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggYXR0YWNoZWRPckF0dGFjaGluZ01vbGVjdWxlIGluc3RhbmNlb2YgTWVzc2VuZ2VyUm5hRGVzdHJveWVyICkge1xyXG5cclxuICAgICAgLy8gc3RhdGUgY2hlY2tpbmdcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydChcclxuICAgICAgICB0aGlzLm1lc3NlbmdlclJuYURlc3Ryb3llciA9PT0gYXR0YWNoZWRPckF0dGFjaGluZ01vbGVjdWxlLFxyXG4gICAgICAgICdzb21ldGhpbmcgaXNuXFx0IHJpZ2h0IC0gdGhlIGRlc3Ryb3llciBmb3IgdGhlIGF0dGFjaG1lbnQgc2l0ZSBkb2VzblxcJ3QgbWF0Y2ggdGhlIGV4cGVjdGVkIHJlZmVyZW5jZSdcclxuICAgICAgKTtcclxuXHJcbiAgICAgIC8vIGlmIGFuIG1STkEgZGVzdHJveWVyIGlzIG1vdmluZyB0b3dhcmRzIHRoaXMgbVJOQSBzdHJhbmQgYnV0IHRyYW5zbGF0aW9uIGhhc24ndCBzdGFydGVkLCBjYWxsIG9mZiB0aGUgd2VkZGluZ1xyXG4gICAgICBpZiAoICF0aGlzLmlzRGVzdHJ1Y3Rpb25JblByb2dyZXNzKCkgKSB7XHJcbiAgICAgICAgYXR0YWNoZWRPckF0dGFjaGluZ01vbGVjdWxlLmNhbmNlbE1lc3NlbmdlclJuYURlc3RydWN0aW9uKCk7XHJcbiAgICAgICAgdGhpcy5tZXNzZW5nZXJSbmFEZXN0cm95ZXIgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuYXR0YWNobWVudFN0YXRlTWFjaGluZS5mb3JjZUltbWVkaWF0ZVVuYXR0YWNoZWRBbmRBdmFpbGFibGUoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWN0aXZhdGUgdGhlIHBsYWNlbWVudCBoaW50KHMpIGFzIGFwcHJvcHJpYXRlIGZvciB0aGUgZ2l2ZW4gYmlvbW9sZWN1bGUuXHJcbiAgICogQHBhcmFtIHtNb2JpbGVCaW9tb2xlY3VsZX0gYmlvbW9sZWN1bGUgLSBpbnN0YW5jZSBvZiB0aGUgdHlwZSBvZiBiaW9tb2xlY3VsZSBmb3Igd2hpY2ggYW55IG1hdGNoaW5nIGhpbnRzXHJcbiAgICogc2hvdWxkIGJlIGFjdGl2YXRlZC5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYWN0aXZhdGVIaW50cyggYmlvbW9sZWN1bGUgKSB7XHJcbiAgICB0aGlzLnJpYm9zb21lUGxhY2VtZW50SGludC5hY3RpdmF0ZUlmTWF0Y2goIGJpb21vbGVjdWxlICk7XHJcbiAgICB0aGlzLm1SbmFEZXN0cm95ZXJQbGFjZW1lbnRIaW50LmFjdGl2YXRlSWZNYXRjaCggYmlvbW9sZWN1bGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERlYWN0aXZhdGUgcGxhY2VtZW50IGhpbnRzIGZvciBhbGwgYmlvbW9sZWN1bGVzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGRlYWN0aXZhdGVBbGxIaW50cygpIHtcclxuICAgIHRoaXMucmlib3NvbWVQbGFjZW1lbnRIaW50LmFjdGl2ZVByb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICAgIHRoaXMubVJuYURlc3Ryb3llclBsYWNlbWVudEhpbnQuYWN0aXZlUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5pdGlhdGUgdGhlIHRyYW5zbGF0aW9uIHByb2Nlc3MgYnkgc2V0dGluZyB1cCB0aGUgc2VnbWVudHMgYXMgbmVlZGVkLiBUaGlzIHNob3VsZCBvbmx5IGJlIGNhbGxlZCBhZnRlciBhIHJpYm9zb21lXHJcbiAgICogdGhhdCB3YXMgbW92aW5nIHRvIGF0dGFjaCB3aXRoIHRoaXMgbVJOQSBhcnJpdmVzIGF0IHRoZSBhdHRhY2htZW50IHBvaW50LlxyXG4gICAqIEBwYXJhbSB7Umlib3NvbWV9IHJpYm9zb21lXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGluaXRpYXRlVHJhbnNsYXRpb24oIHJpYm9zb21lICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5tYXBSaWJvc29tZVRvU2hhcGVTZWdtZW50WyByaWJvc29tZS5pZCBdICk7IC8vIFN0YXRlIGNoZWNraW5nLlxyXG5cclxuICAgIC8vIFNldCB0aGUgY2FwYWNpdHkgb2YgdGhlIGZpcnN0IHNlZ21lbnQgdG8gdGhlIHNpemUgb2YgdGhlIGNoYW5uZWwgdGhyb3VnaCB3aGljaCBpdCB3aWxsIGJlIHB1bGxlZCBwbHVzIHRoZVxyXG4gICAgLy8gbGVhZGVyIGxlbmd0aC5cclxuICAgIGNvbnN0IGZpcnN0U2hhcGVTZWdtZW50ID0gdGhpcy5zaGFwZVNlZ21lbnRzWyAwIF07XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmaXJzdFNoYXBlU2VnbWVudC5pc0ZsYXQoKSApO1xyXG4gICAgZmlyc3RTaGFwZVNlZ21lbnQuc2V0Q2FwYWNpdHkoIHJpYm9zb21lLmdldFRyYW5zbGF0aW9uQ2hhbm5lbExlbmd0aCgpICsgR0VFQ29uc3RhbnRzLkxFQURFUl9MRU5HVEggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEluaXRpYXRlIHRoZSBkZXN0cnVjdGlvbiBvZiB0aGlzIG1STkEgc3RyYW5kIGJ5IHNldHRpbmcgdXAgdGhlIHNlZ21lbnRzIGFzIG5lZWRlZC4gVGhpcyBzaG91bGQgb25seSBiZSBjYWxsZWRcclxuICAgKiBhZnRlciBhbiBtUk5BIGRlc3Ryb3llciBoYXMgYXR0YWNoZWQgdG8gdGhlIGZyb250IG9mIHRoZSBtUk5BIHN0cmFuZC4gT25jZSBpbml0aWF0ZWQsIGRlc3RydWN0aW9uIGNhbm5vdCBiZSBzdG9wcGVkLlxyXG4gICAqIEBwYXJhbSB7TWVzc2VuZ2VyUm5hRGVzdHJveWVyfSBtZXNzZW5nZXJSbmFEZXN0cm95ZXJcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgaW5pdGlhdGVEZXN0cnVjdGlvbiggbWVzc2VuZ2VyUm5hRGVzdHJveWVyICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5tZXNzZW5nZXJSbmFEZXN0cm95ZXIgPT09IG1lc3NlbmdlclJuYURlc3Ryb3llciApOyAvLyBTaG91bGRuJ3QgZ2V0IHRoaXMgZnJvbSB1bmF0dGFjaGVkIGRlc3Ryb3llcnMuXHJcblxyXG4gICAgLy8gU2V0IHRoZSBjYXBhY2l0eSBvZiB0aGUgZmlyc3Qgc2VnbWVudCB0byB0aGUgc2l6ZSBvZiB0aGUgY2hhbm5lbCB0aHJvdWdoIHdoaWNoIGl0IHdpbGwgYmUgcHVsbGVkIHBsdXMgdGhlIGxlYWRlciBsZW5ndGguXHJcbiAgICB0aGlzLnNlZ21lbnRCZWluZ0Rlc3Ryb3llZCA9IHRoaXMuc2hhcGVTZWdtZW50c1sgMCBdO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuc2VnbWVudEJlaW5nRGVzdHJveWVkLmlzRmxhdCgpICk7XHJcbiAgICB0aGlzLnNlZ21lbnRCZWluZ0Rlc3Ryb3llZC5zZXRDYXBhY2l0eShcclxuICAgICAgdGhpcy5tZXNzZW5nZXJSbmFEZXN0cm95ZXIuZ2V0RGVzdHJ1Y3Rpb25DaGFubmVsTGVuZ3RoKCkgKyBHRUVDb25zdGFudHMuTEVBREVSX0xFTkdUSFxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHJldHVybnMgdHJ1ZSBpZiBkZXN0cnVjdGlvbiBoYXMgc3RhcnRlZCwgZmFsc2UgaWYgbm90IC0gbm90ZSB0aGF0IGRlc3RydWN0aW9uIG11c3QgYWN0dWFsbHkgaGF2ZSBzdGFydGVkLCBhbmRcclxuICAgKiB0aGUgc3RhdGUgd2hlcmUgYW4gbVJOQSBkZXN0cm95ZXIgaXMgbW92aW5nIHRvd2FyZHMgdGhlIG1STkEgZG9lc24ndCBjb3VudFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgaXNEZXN0cnVjdGlvbkluUHJvZ3Jlc3MoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zZWdtZW50QmVpbmdEZXN0cm95ZWQgIT09IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIHByb3BvcnRpb24gb2YgdGhlIGVudGlyZSBtUk5BIHRoYXQgaGFzIGJlZW4gdHJhbnNsYXRlZCBieSB0aGUgZ2l2ZW4gcmlib3NvbWUuXHJcbiAgICogQHBhcmFtIHtSaWJvc29tZX0gcmlib3NvbWVcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRQcm9wb3J0aW9uT2ZSbmFUcmFuc2xhdGVkKCByaWJvc29tZSApIHtcclxuICAgIGNvbnN0IHRyYW5zbGF0ZWRMZW5ndGggPSB0aGlzLmdldExlbmd0aE9mUm5hVHJhbnNsYXRlZCggcmlib3NvbWUgKTtcclxuICAgIHJldHVybiBNYXRoLm1heCggdHJhbnNsYXRlZExlbmd0aCAvIHRoaXMuZ2V0TGVuZ3RoKCksIDAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgbGVuZ3RoIG9mIHRoZSBtUk5BIHRoYXQgaGFzIGJlZW4gdHJhbnNsYXRlZCBieSB0aGUgZ2l2ZW4gcmlib3NvbWUuXHJcbiAgICogQHBhcmFtIHtSaWJvc29tZX0gcmlib3NvbWVcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRMZW5ndGhPZlJuYVRyYW5zbGF0ZWQoIHJpYm9zb21lICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5tYXBSaWJvc29tZVRvU2hhcGVTZWdtZW50WyByaWJvc29tZS5pZCBdICk7IC8vIE1ha2VzIG5vIHNlbnNlIGlmIHJpYm9zb21lIGlzbid0IGF0dGFjaGVkLlxyXG4gICAgbGV0IHRyYW5zbGF0ZWRMZW5ndGggPSAwO1xyXG4gICAgY29uc3Qgc2VnbWVudEluUmlib3NvbWVDaGFubmVsID0gdGhpcy5tYXBSaWJvc29tZVRvU2hhcGVTZWdtZW50WyByaWJvc29tZS5pZCBdO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNlZ21lbnRJblJpYm9zb21lQ2hhbm5lbC5pc0ZsYXQoKSApOyAvLyBNYWtlIHN1cmUgdGhpbmdzIGFyZSBhcyB3ZSBleHBlY3QuXHJcblxyXG4gICAgLy8gQWRkIHRoZSBsZW5ndGggZm9yIGVhY2ggc2VnbWVudCB0aGF0IHByZWNlZGVzIHRoaXMgcmlib3NvbWUuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnNoYXBlU2VnbWVudHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHNoYXBlU2VnbWVudCA9IHRoaXMuc2hhcGVTZWdtZW50c1sgaSBdO1xyXG4gICAgICBpZiAoIHNoYXBlU2VnbWVudCA9PT0gc2VnbWVudEluUmlib3NvbWVDaGFubmVsICkge1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIHRyYW5zbGF0ZWRMZW5ndGggKz0gc2hhcGVTZWdtZW50LmdldENvbnRhaW5lZExlbmd0aCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkZCB0aGUgbGVuZ3RoIGZvciB0aGUgc2VnbWVudCB0aGF0IGlzIGluc2lkZSB0aGUgdHJhbnNsYXRpb24gY2hhbm5lbCBvZiB0aGlzIHJpYm9zb21lLlxyXG4gICAgdHJhbnNsYXRlZExlbmd0aCArPSBzZWdtZW50SW5SaWJvc29tZUNoYW5uZWwuZ2V0Q29udGFpbmVkTGVuZ3RoKCkgLVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoIHNlZ21lbnRJblJpYm9zb21lQ2hhbm5lbC5nZXRMb3dlclJpZ2h0Q29ybmVyUG9zaXRpb24oKS54IC1cclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VnbWVudEluUmlib3NvbWVDaGFubmVsLmF0dGFjaG1lbnRTaXRlLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueCApO1xyXG5cclxuICAgIHJldHVybiB0cmFuc2xhdGVkTGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogcmV0dXJucyB0cnVlIGlmIHRoaXMgbWVzc2VuZ2VyIFJOQSBpcyBpbiBhIHN0YXRlIHdoZXJlIGF0dGFjaG1lbnRzIGNhbiBvY2N1clxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgYXR0YWNobWVudEFsbG93ZWQoKSB7XHJcblxyXG4gICAgLy8gRm9yIGFuIGF0dGFjaG1lbnQgcHJvcG9zYWwgdG8gYmUgY29uc2lkZXJlZCwgdGhlIG1STkEgY2FuJ3QgYmUgY29udHJvbGxlZCBieSB0aGUgdXNlciwgdG9vIHNob3J0LCBvciBpbiB0aGVcclxuICAgIC8vIHByb2Nlc3Mgb2YgYmVpbmcgZGVzdHJveWVkLlxyXG4gICAgcmV0dXJuICF0aGlzLnVzZXJDb250cm9sbGVkUHJvcGVydHkuZ2V0KCkgJiZcclxuICAgICAgICAgICB0aGlzLmdldExlbmd0aCgpID49IE1JTl9MRU5HVEhfVE9fQVRUQUNIICYmXHJcbiAgICAgICAgICAgdGhpcy5tZXNzZW5nZXJSbmFEZXN0cm95ZXIgPT09IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb25zaWRlciBwcm9wb3NhbCBmcm9tIHJpYm9zb21lLCBhbmQsIGlmIHRoZSBwcm9wb3NhbCBpcyBhY2NlcHRlZCwgcmV0dXJuIHRoZSBhdHRhY2htZW50IHBvc2l0aW9uXHJcbiAgICogQHBhcmFtIHtSaWJvc29tZX0gcmlib3NvbWVcclxuICAgKiBAcmV0dXJucyB7QXR0YWNobWVudFNpdGV9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGNvbnNpZGVyUHJvcG9zYWxGcm9tUmlib3NvbWUoIHJpYm9zb21lICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMubWFwUmlib3NvbWVUb1NoYXBlU2VnbWVudFsgcmlib3NvbWUuaWQgXSApOyAvLyBTaG91bGRuJ3QgZ2V0IHJlZHVuZGFudCBwcm9wb3NhbHMgZnJvbSBhIHJpYm9zb21lLlxyXG4gICAgbGV0IHJldHVyblZhbHVlID0gbnVsbDtcclxuXHJcbiAgICBpZiAoIHRoaXMuYXR0YWNobWVudEFsbG93ZWQoKSApIHtcclxuXHJcbiAgICAgIC8vIFNlZSBpZiB0aGUgYXR0YWNobWVudCBzaXRlIGF0IHRoZSBsZWFkaW5nIGVkZ2Ugb2YgdGhlIG1STkEgaXMgYXZhaWxhYmxlIGFuZCBjbG9zZSBieS5cclxuICAgICAgaWYgKCB0aGlzLmF0dGFjaG1lbnRTaXRlLmF0dGFjaGVkT3JBdHRhY2hpbmdNb2xlY3VsZVByb3BlcnR5LmdldCgpID09PSBudWxsICYmXHJcbiAgICAgICAgICAgdGhpcy5hdHRhY2htZW50U2l0ZS5wb3NpdGlvblByb3BlcnR5LmdldCgpLmRpc3RhbmNlKCByaWJvc29tZS5nZXRFbnRyYW5jZU9mUm5hQ2hhbm5lbFBvc2l0aW9uKCkgKSA8IFJJQk9TT01FX0NPTk5FQ1RJT05fRElTVEFOQ0UgKSB7XHJcblxyXG4gICAgICAgIC8vIFRoaXMgYXR0YWNobWVudCBzaXRlIGlzIGluIHJhbmdlIGFuZCBhdmFpbGFibGUuXHJcbiAgICAgICAgcmV0dXJuVmFsdWUgPSB0aGlzLmF0dGFjaG1lbnRTaXRlO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgdGhlIGF0dGFjaG1lbnQgc3RhdGUgbWFjaGluZS5cclxuICAgICAgICB0aGlzLm1SbmFBdHRhY2htZW50U3RhdGVNYWNoaW5lLmF0dGFjaGVkVG9SaWJvc29tZSgpO1xyXG5cclxuICAgICAgICAvLyBFbnRlciB0aGlzIGNvbm5lY3Rpb24gaW4gdGhlIG1hcC5cclxuICAgICAgICB0aGlzLm1hcFJpYm9zb21lVG9TaGFwZVNlZ21lbnRbIHJpYm9zb21lLmlkIF0gPSB0aGlzLnNoYXBlU2VnbWVudHNbIDAgXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJldHVyblZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29uc2lkZXIgcHJvcG9zYWwgZnJvbSBtUm5hRGVzdHJveWVyIGFuZCBpZiBpdCBjYW4gYXR0YWNoIHJldHVybiB0aGUgYXR0YWNobWVudCBwb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7TWVzc2VuZ2VyUm5hRGVzdHJveWVyfSBtZXNzZW5nZXJSbmFEZXN0cm95ZXJcclxuICAgKiBAcmV0dXJucyB7QXR0YWNobWVudFNpdGV9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGNvbnNpZGVyUHJvcG9zYWxGcm9tTWVzc2VuZ2VyUm5hRGVzdHJveWVyKCBtZXNzZW5nZXJSbmFEZXN0cm95ZXIgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLm1lc3NlbmdlclJuYURlc3Ryb3llciAhPT0gbWVzc2VuZ2VyUm5hRGVzdHJveWVyICk7IC8vIFNob3VsZG4ndCBnZXQgcmVkdW5kYW50IHByb3Bvc2FscyBmcm9tIHNhbWUgZGVzdHJveWVyLlxyXG5cclxuICAgIGxldCByZXR1cm5WYWx1ZSA9IG51bGw7XHJcblxyXG4gICAgaWYgKCB0aGlzLmF0dGFjaG1lbnRBbGxvd2VkKCkgKSB7XHJcblxyXG4gICAgICAvLyBTZWUgaWYgdGhlIGF0dGFjaG1lbnQgc2l0ZSBhdCB0aGUgbGVhZGluZyBlZGdlIG9mIHRoZSBtUk5BIGlzIGF2YWlsYWJsZSBhbmQgY2xvc2UgYnkuXHJcbiAgICAgIGlmICggdGhpcy5hdHRhY2htZW50U2l0ZS5hdHRhY2hlZE9yQXR0YWNoaW5nTW9sZWN1bGVQcm9wZXJ0eS5nZXQoKSA9PT0gbnVsbCAmJlxyXG4gICAgICAgICAgIHRoaXMuYXR0YWNobWVudFNpdGUucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS5kaXN0YW5jZSggbWVzc2VuZ2VyUm5hRGVzdHJveWVyLmdldFBvc2l0aW9uKCkgKSA8XHJcbiAgICAgICAgICAgTVJOQV9ERVNUUk9ZRVJfQ09OTkVDVF9ESVNUQU5DRSApIHtcclxuXHJcbiAgICAgICAgLy8gVGhpcyBhdHRhY2htZW50IHNpdGUgaXMgaW4gcmFuZ2UgYW5kIGF2YWlsYWJsZS5cclxuICAgICAgICByZXR1cm5WYWx1ZSA9IHRoaXMuYXR0YWNobWVudFNpdGU7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgYXR0YWNobWVudCBzdGF0ZSBtYWNoaW5lLlxyXG4gICAgICAgIHRoaXMubVJuYUF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUuYXR0YWNoVG9EZXN0cm95ZXIoKTtcclxuXHJcbiAgICAgICAgLy8gS2VlcCB0cmFjayBvZiB0aGUgZGVzdHJveWVyLlxyXG4gICAgICAgIHRoaXMubWVzc2VuZ2VyUm5hRGVzdHJveWVyID0gbWVzc2VuZ2VyUm5hRGVzdHJveWVyO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJldHVyblZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWJvcnRzIHRoZSBkZXN0cnVjdGlvbiBwcm9jZXNzLCB1c2VkIGlmIHRoZSBtUk5BIGRlc3Ryb3llciB3YXMgb24gaXRzIHdheSB0byB0aGUgbVJOQSBidXQgdGhlIHVzZXIgcGlja2VkIHVwXHJcbiAgICogb25jZSBvZiB0aGUgdHdvIGJpb21vbGVjdWxlcyBiZWZvcmUgZGVzdHJ1Y3Rpb24gc3RhcnRlZC5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYWJvcnREZXN0cnVjdGlvbigpIHtcclxuICAgIHRoaXMubWVzc2VuZ2VyUm5hRGVzdHJveWVyID0gbnVsbDtcclxuICAgIHRoaXMuYXR0YWNobWVudFN0YXRlTWFjaGluZS5mb3JjZUltbWVkaWF0ZVVuYXR0YWNoZWRBbmRBdmFpbGFibGUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqIEByZXR1cm5zIHtNZXNzZW5nZXJSbmFBdHRhY2htZW50U3RhdGVNYWNoaW5lfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBjcmVhdGVBdHRhY2htZW50U3RhdGVNYWNoaW5lKCkge1xyXG4gICAgcmV0dXJuIG5ldyBNZXNzZW5nZXJSbmFBdHRhY2htZW50U3RhdGVNYWNoaW5lKCB0aGlzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIHBvaW50IGluIG1vZGVsIHNwYWNlIHdoZXJlIHRoZSBlbnRyYW5jZSBvZiB0aGUgZ2l2ZW4gZGVzdHJveWVyJ3MgdHJhbnNsYXRpb24gY2hhbm5lbCBzaG91bGQgYmUgaW4gb3JkZXIgdG9cclxuICAgKiBiZSBjb3JyZWN0bHkgYXR0YWNoZWQgdG8gdGhpcyBzdHJhbmQgb2YgbWVzc2VuZ2VyIFJOQS5cclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0RGVzdHJveWVyR2VuZXJhdGVJbml0aWFsUG9zaXRpb24zRCgpIHtcclxuXHJcbiAgICAvLyBzdGF0ZSBjaGVja2luZyAtIHNob3VsZG4ndCBiZSBjYWxsZWQgYmVmb3JlIHRoaXMgaXMgc2V0XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnNlZ21lbnRCZWluZ0Rlc3Ryb3llZCAhPT0gbnVsbCApO1xyXG5cclxuICAgIC8vIHRoZSBhdHRhY2htZW50IHBvc2l0aW9uIGlzIGF0IHRoZSByaWdodCBtb3N0IHNpZGUgb2YgdGhlIHNlZ21lbnQgbWludXMgdGhlIGxlYWRlciBsZW5ndGhcclxuICAgIHJldHVybiB0aGlzLmF0dGFjaG1lbnRTaXRlLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgfVxyXG59XHJcblxyXG5nZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMucmVnaXN0ZXIoICdNZXNzZW5nZXJSbmEnLCBNZXNzZW5nZXJSbmEgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1lc3NlbmdlclJuYTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLHdCQUF3QixNQUFNLG1DQUFtQztBQUN4RSxPQUFP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