// Copyright 2015-2021, University of Colorado Boulder

/**
 * This class models a molecule of DNA. It includes the shape of the two "backbone" strands of the DNA and the
 * individual base pairs, defines where the various genes reside, and retains other information about the DNA molecule.
 * This is an important and central object in the model for this simulation.
 *
 * A big simplifying assumption that this class makes is that molecules that attach to the DNA do so to individual base
 * pairs. In reality, biomolecules attach to groups of base pairs, the exact configuration of which dictate where
 * biomolecules attach. This was unnecessarily complicated for the needs of this sim.
 *
 * @author Sharfudeen Ashraf
 * @author John Blanco
 * @author Aadish Gupta
 */

import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import geneExpressionEssentials from '../../geneExpressionEssentials.js';
import GEEConstants from '../GEEConstants.js';
import AttachmentSite from './AttachmentSite.js';
import BasePair from './BasePair.js';
import DnaStrandPoint from './DnaStrandPoint.js';
import StubGeneExpressionModel from './StubGeneExpressionModel.js';

// constants

// distance within which transcription factors may attach
const TRANSCRIPTION_FACTOR_ATTACHMENT_DISTANCE = 400;

// distance within which RNA polymerase may attach
const RNA_POLYMERASE_ATTACHMENT_DISTANCE = 400;
const attachmentSitePosition = new Vector2(0, 0);
class DnaMolecule {
  /**
   * @param {GeneExpressionModel|null} model - the gene expression model within which this DNA strand exists, null for
   * a standalone instance
   * @param {number} numBasePairs - number of base pairs in the strand
   * @param {number} leftEdgeXOffset - x position in model space of the left side of the molecule. Y position is assumed
   * to be zero
   * @param {boolean} pursueAttachments - flag that controls whether the DNA strand actively pulls in transcription
   * factors and polymerase or just lets them drift into place
   */
  constructor(model, numBasePairs, leftEdgeXOffset, pursueAttachments) {
    // @public (read-only) {Array.<Array.<Vector2>>} These arrays contain lists of "segments" that define the shape of
    // the DNA strand.  Each segment is comprised of a set of points that, when smoothly connected, define one half of
    // a "cycle" of the DNA.  The motivation behind having the separate segments is to make it easier to render the
    // DNA as appearing to twist.  These segments change position when the DNA strands separates, which occurs when the
    // DNA is transcribed by RNA polymerase.
    this.strand1Segments = []; // @public
    this.strand2Segments = []; // @public

    // @public (read-only) {Array.<BasePair>} - base pairs within the DNA strand
    this.basePairs = [];

    // @public (read-only) {number} - height of the tallest base pair, set during initialization below
    this.maxBasePairHeight = 0;

    // @public {boolean} - dirty bit which tells the view when to redraw DNA
    this.redraw = false;

    // @private {Array.<DnaStrandPoint>} - points that, when connected, define the shape of the DNA strands - these
    // used for internal manipulations, and their positions are copied into the layered, separated "strand segements"
    // as changes occur.
    this.strandPoints = [];

    // @private - shadow of the points that define the strand shapes, used for rapid evaluation of any shape changes
    this.strandPointsShadow = [];

    // @private - internal variable that define shape, size, and behavior
    this.model = model || new StubGeneExpressionModel(); // support creation without model for control panels and such
    this.leftEdgeXOffset = leftEdgeXOffset;
    this.pursueAttachments = pursueAttachments;
    this.moleculeLength = numBasePairs * GEEConstants.DISTANCE_BETWEEN_BASE_PAIRS;
    this.numberOfTwists = this.moleculeLength / GEEConstants.LENGTH_PER_TWIST;

    // @private {Array.<Gene>}
    this.genes = [];

    // @private - list of forced separations between the two strands of the DNA
    this.separations = [];

    // Add the initial set of shape-defining points for each of the two strands.  Points are spaced the same as the
    // base pairs.
    for (let i = 0; i < numBasePairs; i++) {
      const xPos = leftEdgeXOffset + i * GEEConstants.DISTANCE_BETWEEN_BASE_PAIRS;
      const strand1YPos = this.getDnaStrandYPosition(xPos, 0);
      const strand2YPos = this.getDnaStrandYPosition(xPos, GEEConstants.INTER_STRAND_OFFSET);
      const height = Math.abs(strand1YPos - strand2YPos);
      this.maxBasePairHeight = height > this.maxBasePairHeight ? height : this.maxBasePairHeight;

      // Add in the base pairs between the backbone strands.  This calculates the distance between the two strands and
      // puts a line between them in  order to look like the base pair.
      this.basePairs.push(new BasePair(xPos, Math.min(strand1YPos, strand2YPos), Math.max(strand1YPos, strand2YPos)));
      this.strandPoints.push(new DnaStrandPoint(xPos, strand1YPos, strand2YPos));
      this.strandPointsShadow.push(new DnaStrandPoint(xPos, strand1YPos, strand2YPos));
    }

    // Create the sets of segments that will be observed by the view.
    this.initializeStrandSegments();
  }

  /**
   * get the index of the nearest base pair given an X position in model space
   * @param {number} xOffset
   * @returns {number}
   * @private
   */
  getBasePairIndexFromXOffset(xOffset) {
    assert && assert(xOffset >= this.leftEdgeXOffset && xOffset < this.leftEdgeXOffset + this.moleculeLength);
    xOffset = Utils.clamp(xOffset, this.leftEdgeXOffset, this.leftEdgeXOffset + GEEConstants.LENGTH_PER_TWIST * this.numberOfTwists);
    return Math.trunc(Utils.roundSymmetric((xOffset - this.leftEdgeXOffset - GEEConstants.INTER_STRAND_OFFSET) / GEEConstants.DISTANCE_BETWEEN_BASE_PAIRS));
  }

  /**
   * get the X position of the nearest base pair given an arbitrary X position in model coordinates
   * @param {number} xPos
   * @returns {number}
   * @private
   */
  getNearestBasePairXOffset(xPos) {
    return this.getBasePairXOffsetByIndex(this.getBasePairIndexFromXOffset(xPos));
  }

  /**
   * initialize the DNA stand segment lists
   * @private
   */
  initializeStrandSegments() {
    let strand1SegmentPoints = [];
    let strand2SegmentPoints = [];
    let segmentStartX = this.strandPoints[0].xPos;
    let strand1InFront = true;
    for (let i = 0; i < this.strandPoints.length; i++) {
      const dnaStrandPoint = this.strandPoints[i];
      const xPos = dnaStrandPoint.xPos;
      strand1SegmentPoints.push(new Vector2(xPos, dnaStrandPoint.strand1YPos));
      strand2SegmentPoints.push(new Vector2(xPos, dnaStrandPoint.strand2YPos));
      if (xPos - segmentStartX >= GEEConstants.LENGTH_PER_TWIST / 2) {
        // Time to add these segments and start a new ones.
        this.strand1Segments.push(strand1SegmentPoints);
        this.strand2Segments.push(strand2SegmentPoints);
        let firstPointOfNextSegment = strand1SegmentPoints[strand1SegmentPoints.length - 1];
        strand1SegmentPoints = []; // clear;
        strand1SegmentPoints.push(firstPointOfNextSegment); // This point must be on this segment too in order to prevent gaps.
        firstPointOfNextSegment = strand2SegmentPoints[strand2SegmentPoints.length - 1];
        strand2SegmentPoints = []; //clear;
        strand2SegmentPoints.push(firstPointOfNextSegment); // This point must be on this segment too in order to prevent gaps.
        segmentStartX = firstPointOfNextSegment.x;
        strand1InFront = !strand1InFront;
      }
    }

    // add the strand for the remaining base segments
    this.strand1Segments.push(strand1SegmentPoints);
    this.strand2Segments.push(strand2SegmentPoints);
    this.redraw = true;
  }

  /**
   * Get the Y position in model space for a DNA strand for the given X position and offset. The offset acts like a
   * "phase difference", thus allowing this method to be used to get position information for both DNA strands.
   * @param {number} xPos
   * @param {number} offset
   * @returns {number}
   * @private
   */
  getDnaStrandYPosition(xPos, offset) {
    return Math.sin((xPos + offset) / GEEConstants.LENGTH_PER_TWIST * Math.PI * 2) * GEEConstants.DNA_MOLECULE_DIAMETER / 2;
  }

  /**
   * Update the strand segment shapes based on things that might have changed, such as biomolecules attaching and
   * separating the strands or otherwise deforming the nominal double-helix shape.
   * @private
   */
  updateStrandSegments() {
    this.redraw = false;

    // Set the shadow points to the nominal, non-deformed positions.
    this.strandPointsShadow.forEach((dnaStrandPoint, i) => {
      dnaStrandPoint.strand1YPos = this.getDnaStrandYPosition(dnaStrandPoint.xPos, 0);
      dnaStrandPoint.strand2YPos = this.getDnaStrandYPosition(dnaStrandPoint.xPos, GEEConstants.INTER_STRAND_OFFSET);
      this.basePairs[i].topYPosition = Math.min(dnaStrandPoint.strand1YPos, dnaStrandPoint.strand2YPos);
      this.basePairs[i].bottomYPosition = Math.max(dnaStrandPoint.strand1YPos, dnaStrandPoint.strand2YPos);
    });

    // Move the shadow points to account for any separations.
    this.separations.forEach(separation => {
      // Make the window wider than it is high.  This was chosen to look decent, tweak if needed.
      const windowWidth = separation.getAmount() * 1.5;
      const separationWindowXIndexRange = new Range(Math.floor((separation.getXPosition() - windowWidth / 2 - this.leftEdgeXOffset) / GEEConstants.DISTANCE_BETWEEN_BASE_PAIRS), Math.floor((separation.getXPosition() + windowWidth / 2 - this.leftEdgeXOffset) / GEEConstants.DISTANCE_BETWEEN_BASE_PAIRS));
      for (let i = separationWindowXIndexRange.min; i < separationWindowXIndexRange.max; i++) {
        const windowCenterX = (separationWindowXIndexRange.min + separationWindowXIndexRange.max) / 2;
        if (i >= 0 && i < this.strandPointsShadow.length) {
          // Perform a windowing algorithm that weights the separation at 1 in the center, 0 at the edges, and linear
          // graduations in between.
          const separationWeight = 1 - Math.abs(2 * (i - windowCenterX) / separationWindowXIndexRange.getLength());
          this.strandPointsShadow[i].strand1YPos = (1 - separationWeight) * this.strandPointsShadow[i].strand1YPos + separationWeight * separation.getAmount() / 2;
          this.strandPointsShadow[i].strand2YPos = (1 - separationWeight) * this.strandPointsShadow[i].strand2YPos - separationWeight * separation.getAmount() / 2;
          this.basePairs[i].topYPosition = Math.max(this.strandPointsShadow[i].strand1YPos, this.strandPointsShadow[i].strand2YPos);
          this.basePairs[i].bottomYPosition = Math.min(this.strandPointsShadow[i].strand1YPos, this.strandPointsShadow[i].strand2YPos);
        }
      }
    });

    // See if any of the points have moved and, if so, update the corresponding shape segment.
    const numSegments = this.strand1Segments.length;
    for (let i = 0; i < numSegments; i++) {
      let segmentChanged = false;
      const strand1Segment = this.strand1Segments[i];

      // Determine the bounds of the current segment. Assumes that the bounds for the strand1 and strand2 segments are
      // the same, which should be a safe assumption.
      const minX = strand1Segment[0].x;
      const maxX = strand1Segment[strand1Segment.length - 1].x;
      const pointIndexRange = new Range(Math.floor((minX - this.leftEdgeXOffset) / GEEConstants.DISTANCE_BETWEEN_BASE_PAIRS), Math.floor((maxX - this.leftEdgeXOffset) / GEEConstants.DISTANCE_BETWEEN_BASE_PAIRS));

      // Check to see if any of the points within the identified range have changed and, if so, update the
      // corresponding segment shape in the strands. If the points for either strand has changed, both are updated.
      for (let j = pointIndexRange.min; j < pointIndexRange.max; j++) {
        if (!this.strandPoints[j].equals(this.strandPointsShadow[j])) {
          // The point has changed.  Update it, mark the change.
          this.strandPoints[j].set(this.strandPointsShadow[j]);
          segmentChanged = true;
        }
      }
      if (!this.strandPoints[pointIndexRange.max].equals(this.strandPointsShadow[pointIndexRange.max])) {
        // The point has changed.  Update it, mark the change.
        segmentChanged = true;
      }
      if (segmentChanged) {
        this.redraw = true;
        // Update the shape of this segment.
        const strand1ShapePoints = [];
        const strand2ShapePoints = [];
        for (let k = pointIndexRange.min; k < pointIndexRange.max; k++) {
          //for performance reasons using object literals instead of Vector instances
          strand1ShapePoints.push({
            x: this.strandPoints[k].xPos,
            y: this.strandPoints[k].strand1YPos
          });
          strand2ShapePoints.push({
            x: this.strandPoints[k].xPos,
            y: this.strandPoints[k].strand2YPos
          });
        }
        strand1ShapePoints.push({
          x: this.strandPointsShadow[pointIndexRange.max].xPos,
          y: this.strandPointsShadow[pointIndexRange.max].strand1YPos
        });
        strand2ShapePoints.push({
          x: this.strandPointsShadow[pointIndexRange.max].xPos,
          y: this.strandPointsShadow[pointIndexRange.max].strand2YPos
        });
        this.strand1Segments[i] = strand1ShapePoints;
        this.strand2Segments[i] = strand2ShapePoints;
      }
    }
  }

  /**
   * @param {number} dt
   * @public
   */
  step(dt) {
    this.updateStrandSegments();
    this.genes.forEach(gene => {
      gene.updateAffinities();
    });
  }

  /**
   * Returns the length of the DNA molecule
   * @returns {number}
   * @public
   */
  getLength() {
    return this.moleculeLength;
  }

  /**
   * Add a gene to the DNA strand. Adding a gene essentially defines it, since in this sim, the base pairs don't
   * actually encode anything, so adding the gene essentially delineates where it is on the strand.
   *
   * @param {Gene} geneToAdd Gene to add to the DNA strand.
   * @public
   */
  addGene(geneToAdd) {
    this.genes.push(geneToAdd);
  }

  /**
   * Get the X position of the specified base pair. The first base pair at the left side of the DNA molecule is base
   * pair 0, and it goes up from there.
   *
   * @param {number} basePairNumber
   * @returns {number}
   * @public
   */
  getBasePairXOffsetByIndex(basePairNumber) {
    return this.leftEdgeXOffset + GEEConstants.INTER_STRAND_OFFSET + basePairNumber * GEEConstants.DISTANCE_BETWEEN_BASE_PAIRS;
  }

  /**
   * @param {DnaSeparation} separation
   * @public
   */
  addSeparation(separation) {
    this.separations.push(separation);
  }

  /**
   * @param {DnaSeparation} separation
   * @public
   */
  removeSeparation(separation) {
    const index = this.separations.indexOf(separation);
    if (index !== -1) {
      this.separations.splice(index, 1);
    }
  }

  /**
   * @returns {Array.<Gene>}
   * @public
   */
  getGenes() {
    return this.genes;
  }

  /**
   * @returns {Gene}
   * @public
   */
  getLastGene() {
    return this.genes[this.genes.length - 1];
  }

  /**
   * @param {MobileBiomolecule} biomolecule
   * @public
   */
  activateHints(biomolecule) {
    this.genes.forEach(gene => {
      gene.activateHints(biomolecule);
    });
  }

  /**
   * Deactivate the hints for the genes
   * @public
   */
  deactivateAllHints() {
    this.genes.forEach(gene => {
      gene.deactivateHints();
    });
  }

  /**
   * Get the position in model space of the leftmost edge of the DNA strand. The Y position is in the vertical center
   * of the strand.
   *
   * @returns {Vector2}
   * @public
   */
  getLeftEdgePosition() {
    return new Vector2(this.leftEdgeXOffset, GEEConstants.DNA_MOLECULE_Y_POS);
  }

  /**
   * Get the x-position in model space of the leftmost edge of the DNA strand.
   * @returns {number}
   * @public
   */
  getLeftEdgeXPosition() {
    return this.leftEdgeXOffset;
  }

  /**
   * Get the x-position in model space of the rightmost edge of the DNA strand.
   * @returns {number}
   * @public
   */
  getRightEdgeXPosition() {
    return this.strandPoints[this.strandPoints.length - 1].xPos;
  }

  /**
   * Get the y-position in model space of the topmost point in the edge of the DNA strand.
   * @returns {number}
   * @public
   */
  getTopEdgeYPosition() {
    const dnaStrand = this.strand1Segments[0];
    const index = Math.floor(dnaStrand.length / 2);
    return dnaStrand[index].y;
  }

  /**
   * Get the y-position in model space of the topmost point in the edge of the DNA strand.
   * @returns {number}
   * @public
   */
  getBottomEdgeYPosition() {
    // assert statement here
    const dnaStrand = this.strand1Segments[1];
    const index = Math.floor(dnaStrand.length / 2);
    return dnaStrand[index].y;
  }

  /**
   * Consider an attachment proposal from a transcription factor instance. To determine whether or not to accept or
   * reject this proposal, the base pairs are scanned in order to determine whether there is an appropriate and
   * available attachment site within the attachment distance.
   *
   * @param {TranscriptionFactor} transcriptionFactor
   * @returns {AttachmentSite}
   * @public
   */
  considerProposalFromTranscriptionFactor(transcriptionFactor) {
    return this.considerProposalFromBiomolecule(transcriptionFactor, TRANSCRIPTION_FACTOR_ATTACHMENT_DISTANCE, basePairIndex => this.getTranscriptionFactorAttachmentSiteForBasePairIndex(basePairIndex, transcriptionFactor.getConfig()), gene => true, gene => gene.getMatchingSite(transcriptionFactor.getConfig()));
  }

  /**
   * Consider an attachment proposal from a rna polymerase instance. To determine whether or not to accept or
   * reject this proposal, the base pairs are scanned in order to determine whether there is an appropriate and
   * available attachment site within the attachment distance
   *
   * @param {RnaPolymerase} rnaPolymerase
   * @returns {AttachmentSite}
   * @public
   */
  considerProposalFromRnaPolymerase(rnaPolymerase) {
    return this.considerProposalFromBiomolecule(rnaPolymerase, RNA_POLYMERASE_ATTACHMENT_DISTANCE, basePairIndex => this.getRnaPolymeraseAttachmentSiteForBasePairIndex(basePairIndex), gene => gene.transcriptionFactorsSupportTranscription(), gene => gene.getPolymeraseAttachmentSite());
  }

  /**
   * Consider a proposal from a biomolecule. This is the generic version that avoids duplicated code.
   * @param {MobileBiomolecule} biomolecule
   * @param {number} maxAttachDistance
   * @param {function(number):AttachmentSite} getAttachSiteForBasePair
   * @param {function(Gene):boolean} isOkayToAttach
   * @param {function(Gene):AttachmentSite} getAttachmentSite
   * @returns {AttachmentSite}
   * @private
   */
  considerProposalFromBiomolecule(biomolecule, maxAttachDistance, getAttachSiteForBasePair, isOkayToAttach, getAttachmentSite) {
    let potentialAttachmentSites = [];
    for (let i = 0; i < this.basePairs.length; i++) {
      // See if the base pair is within the max attachment distance.
      attachmentSitePosition.setXY(this.basePairs[i].getCenterPositionX(), GEEConstants.DNA_MOLECULE_Y_POS);
      if (attachmentSitePosition.distance(biomolecule.getPosition()) <= maxAttachDistance) {
        // In range.  Add it to the list if it is available.
        const potentialAttachmentSite = getAttachSiteForBasePair(i);
        if (potentialAttachmentSite.attachedOrAttachingMoleculeProperty.get() === null) {
          potentialAttachmentSites.push(potentialAttachmentSite);
        }
      }
    }

    // If there aren't any potential attachment sites in range, check for a particular set of conditions under which
    // the DNA provides an attachment site anyways.
    if (potentialAttachmentSites.length === 0 && this.pursueAttachments) {
      this.genes.forEach(gene => {
        if (isOkayToAttach(gene)) {
          const matchingSite = getAttachmentSite(gene);

          // Found a matching site on a gene.
          if (matchingSite.attachedOrAttachingMoleculeProperty.get() === null) {
            // The site is unoccupied, so add it to the list of  potential sites.
            potentialAttachmentSites.push(matchingSite);
          } else if (!matchingSite.isMoleculeAttached()) {
            const thisDistance = biomolecule.getPosition().distance(matchingSite.positionProperty.get());
            const thatDistance = matchingSite.attachedOrAttachingMoleculeProperty.get().getPosition().distance(matchingSite.positionProperty.get());
            if (thisDistance < thatDistance) {
              // The other molecule is not yet attached, and this one is closer, so force the other molecule to
              // abort its pending attachment.
              matchingSite.attachedOrAttachingMoleculeProperty.get().forceAbortPendingAttachment();

              // Add this site to the list of potential sites.
              potentialAttachmentSites.push(matchingSite);
            }
          }
        }
      });
    }

    // Eliminate sites that would put the molecule out of bounds or would overlap with other attached biomolecules.
    potentialAttachmentSites = this.eliminateInvalidAttachmentSites(biomolecule, potentialAttachmentSites);
    if (potentialAttachmentSites.length === 0) {
      // No acceptable sites found.
      return null;
    }
    const exponent = 1;
    const attachPosition = biomolecule.getPosition();

    // Sort the collection so that the best site is at the top of the list.
    potentialAttachmentSites.sort((attachmentSite1, attachmentSite2) => {
      // The comparison is based on a combination of the affinity and the distance, much like gravitational attraction.
      // The exponent effectively sets the relative weighting of one versus another. An exponent value of zero means
      // only the affinity matters, a value of 100 means it is pretty much entirely distance. A value of 2 is how
      // gravity works, so it appears kind of natural. Tweak as needed.
      const as1Factor = attachmentSite1.getAffinity() / Math.pow(attachPosition.distance(attachmentSite1.positionProperty.get()), exponent);
      const as2Factor = attachmentSite2.getAffinity() / Math.pow(attachPosition.distance(attachmentSite2.positionProperty.get()), exponent);
      if (as2Factor > as1Factor) {
        return 1;
      }
      if (as2Factor < as1Factor) {
        return -1;
      }
      return 0;
    });

    // Return the optimal attachment site.
    return potentialAttachmentSites[0];
  }

  /**
   * Take a list of attachment sites and eliminate any of them that, if the given molecule attaches, it would end up
   * out of bounds or overlapping with another biomolecule that is already attached to the DNA strand.
   *
   * @param  {MobileBiomolecule} biomolecule - The biomolecule that is potentially going to attach to the provided
   * list of attachment sites.
   * @param {Array.<AttachmentSite>} potentialAttachmentSites
   * @private
   */
  eliminateInvalidAttachmentSites(biomolecule, potentialAttachmentSites) {
    return _.filter(potentialAttachmentSites, attachmentSite => {
      // determine the bounds for the provided biomolecule when translated to the attachment site
      let translationVector = attachmentSite.positionProperty.get().minus(biomolecule.getPosition());
      const translatedShapeBounds = biomolecule.bounds.shiftedXY(translationVector.x, translationVector.y);

      // if the biomolecule would be out of the model bounds, the site should be excluded
      if (!biomolecule.motionBoundsProperty.get().inBounds(translatedShapeBounds)) {
        return false;
      }

      // make a list of the bounds where all attached or incoming biomolecules are or will be (once attached)
      const attachedOrIncomingBiomoleculeBounds = [];
      this.model.mobileBiomoleculeList.forEach(mobileBiomolecule => {
        // skip the biomolecule being tested for overlap
        if (mobileBiomolecule === biomolecule) {
          return;
        }
        const attachmentSite = mobileBiomolecule.attachmentStateMachine.attachmentSite;
        if (attachmentSite && attachmentSite.owner === this) {
          if (mobileBiomolecule.attachedToDnaProperty.get()) {
            // this biomolecule is attached, so add its bounds with no translation
            attachedOrIncomingBiomoleculeBounds.push(mobileBiomolecule.bounds);
          } else {
            // This biomolecule is moving towards attachment but not yet attached, so translate to bounds to where
            // they will be once attachment occurs.
            translationVector = attachmentSite.positionProperty.get().minus(mobileBiomolecule.getPosition());
            attachedOrIncomingBiomoleculeBounds.push(mobileBiomolecule.bounds.shiftedXY(translationVector.x, translationVector.y));
          }
        }
      });
      let overlapsOtherMolecules = false;
      for (let i = 0; i < attachedOrIncomingBiomoleculeBounds.length; i++) {
        const mobileBiomoleculeBounds = attachedOrIncomingBiomoleculeBounds[i];
        if (mobileBiomoleculeBounds.intersectsBounds(translatedShapeBounds)) {
          overlapsOtherMolecules = true;
          break;
        }
      }
      return !overlapsOtherMolecules;
    });
  }

  /**
   * @param {number} i
   * @param {TranscriptionFactorConfig} tfConfig
   * @returns {AttachmentSite}
   * @private
   */
  getTranscriptionFactorAttachmentSiteForBasePairIndex(i, tfConfig) {
    // See if this base pair is inside a gene.
    const gene = this.getGeneContainingBasePair(i);
    if (gene !== null) {
      // Base pair is in a gene, so get it from the gene.
      return gene.getTranscriptionFactorAttachmentSite(i, tfConfig);
    } else {
      // Base pair is not contained within a gene, so use the default.
      return this.createDefaultAffinityAttachmentSite(i);
    }
  }

  /**
   * @param {number} i
   * @returns {AttachmentSite}
   * @private
   */
  getRnaPolymeraseAttachmentSiteForBasePairIndex(i) {
    // See if this base pair is inside a gene.
    const gene = this.getGeneContainingBasePair(i);
    if (gene !== null) {
      // Base pair is in a gene.  See if site is available.
      return gene.getPolymeraseAttachmentSiteByIndex(i);
    } else {
      // Base pair is not contained within a gene, so use the default.
      return this.createDefaultAffinityAttachmentSite(i);
    }
  }

  /**
   * Get the two base pair attachment sites that are next to the provided one, i.e. the one before it on the DNA
   * strand and the one after it. If at one end of the strand, only one site will be returned. Occupied sites are not
   * returned.
   *
   * @param {TranscriptionFactor} transcriptionFactor
   * @param {AttachmentSite} attachmentSite
   * @returns {Array.<AttachmentSite>}
   * @public
   */
  getAdjacentAttachmentSitesTranscriptionFactor(transcriptionFactor, attachmentSite) {
    const basePairIndex = this.getBasePairIndexFromXOffset(attachmentSite.positionProperty.get().x);
    const attachmentSites = [];
    let potentialSite;
    if (basePairIndex !== 0) {
      potentialSite = this.getTranscriptionFactorAttachmentSiteForBasePairIndex(basePairIndex - 1, transcriptionFactor.getConfig());
      if (potentialSite.attachedOrAttachingMoleculeProperty.get() === null) {
        attachmentSites.push(potentialSite);
      }
    }
    if (basePairIndex !== this.basePairs.length - 1) {
      potentialSite = this.getTranscriptionFactorAttachmentSiteForBasePairIndex(basePairIndex + 1, transcriptionFactor.getConfig());
      if (potentialSite.attachedOrAttachingMoleculeProperty.get() === null) {
        attachmentSites.push(potentialSite);
      }
    }
    return this.eliminateInvalidAttachmentSites(transcriptionFactor, attachmentSites);
  }

  /**
   * Get the two base pair attachment sites that are next to the provided one, i.e. the one before it on the DNA
   * strand and the one after it. If at one end of the strand, only one site will be returned. Occupied sites are not
   * returned.
   *
   * @param {RnaPolymerase} rnaPolymerase
   * @param  {AttachmentSite} attachmentSite
   * @returns {Array.<AttachmentSite>}
   * @public
   */
  getAdjacentAttachmentSitesRnaPolymerase(rnaPolymerase, attachmentSite) {
    const basePairIndex = this.getBasePairIndexFromXOffset(attachmentSite.positionProperty.get().x);
    const attachmentSites = [];
    let potentialSite;
    if (basePairIndex !== 0) {
      potentialSite = this.getRnaPolymeraseAttachmentSiteForBasePairIndex(basePairIndex - 1);
      if (potentialSite.attachedOrAttachingMoleculeProperty.get() === null) {
        attachmentSites.push(potentialSite);
      }
    }
    if (basePairIndex !== this.basePairs.length - 1) {
      potentialSite = this.getRnaPolymeraseAttachmentSiteForBasePairIndex(basePairIndex + 1);
      if (potentialSite.attachedOrAttachingMoleculeProperty.get() === null) {
        attachmentSites.push(potentialSite);
      }
    }

    // Eliminate sites that would put the molecule out of bounds or would overlap with other attached biomolecules.
    return this.eliminateInvalidAttachmentSites(rnaPolymerase, attachmentSites);
  }

  /**
   * @param {number} basePairIndex
   * @returns {Gene}
   * @private
   */
  getGeneContainingBasePair(basePairIndex) {
    let geneContainingBasePair = null;
    for (let i = 0; i < this.genes.length; i++) {
      const gene = this.genes[i];
      if (gene.containsBasePair(basePairIndex)) {
        geneContainingBasePair = gene;
        break;
      }
    }
    return geneContainingBasePair;
  }

  /**
   * Create an attachment site instance with the default affinity for all DNA-attaching biomolecules at the specified
   * x offset.
   *
   * @param {number} xOffset
   * @returns {AttachmentSite}
   * @public
   */
  createDefaultAffinityAttachmentSite(xOffset) {
    return new AttachmentSite(this, new Vector2(this.getNearestBasePairXOffset(xOffset), GEEConstants.DNA_MOLECULE_Y_POS), GEEConstants.DEFAULT_AFFINITY);
  }

  /**
   * Get a reference to the gene that contains the given position.
   *
   * @param {Vector2} position
   * @returns {Gene|null} Gene at the position, null if no gene exists.
   * @public
   */
  getGeneAtPosition(position) {
    // make sure the position is reasonable
    assert && assert(position.x >= this.leftEdgeXOffset && position.x <= this.leftEdgeXOffset + this.moleculeLength && position.y >= GEEConstants.DNA_MOLECULE_Y_POS - GEEConstants.DNA_MOLECULE_DIAMETER / 2 && position.y <= GEEConstants.DNA_MOLECULE_Y_POS + GEEConstants.DNA_MOLECULE_DIAMETER / 2, `requested position is not on DNA molecule: ${position}`);
    let geneAtPosition = null;
    const basePairIndex = this.getBasePairIndexFromXOffset(position.x);
    for (let i = 0; i < this.genes.length && geneAtPosition === null; i++) {
      const gene = this.genes[i];
      if (gene.containsBasePair(basePairIndex)) {
        // Found the corresponding gene.
        geneAtPosition = gene;
      }
    }
    return geneAtPosition;
  }

  /**
   * Resets the DNA Molecule
   * @public
   */
  reset() {
    this.genes.forEach(gene => {
      gene.clearAttachmentSites();
    });
    this.separations = [];
  }
}
geneExpressionEssentials.register('DnaMolecule', DnaMolecule);
export default DnaMolecule;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZSIsIlV0aWxzIiwiVmVjdG9yMiIsImdlbmVFeHByZXNzaW9uRXNzZW50aWFscyIsIkdFRUNvbnN0YW50cyIsIkF0dGFjaG1lbnRTaXRlIiwiQmFzZVBhaXIiLCJEbmFTdHJhbmRQb2ludCIsIlN0dWJHZW5lRXhwcmVzc2lvbk1vZGVsIiwiVFJBTlNDUklQVElPTl9GQUNUT1JfQVRUQUNITUVOVF9ESVNUQU5DRSIsIlJOQV9QT0xZTUVSQVNFX0FUVEFDSE1FTlRfRElTVEFOQ0UiLCJhdHRhY2htZW50U2l0ZVBvc2l0aW9uIiwiRG5hTW9sZWN1bGUiLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwibnVtQmFzZVBhaXJzIiwibGVmdEVkZ2VYT2Zmc2V0IiwicHVyc3VlQXR0YWNobWVudHMiLCJzdHJhbmQxU2VnbWVudHMiLCJzdHJhbmQyU2VnbWVudHMiLCJiYXNlUGFpcnMiLCJtYXhCYXNlUGFpckhlaWdodCIsInJlZHJhdyIsInN0cmFuZFBvaW50cyIsInN0cmFuZFBvaW50c1NoYWRvdyIsIm1vbGVjdWxlTGVuZ3RoIiwiRElTVEFOQ0VfQkVUV0VFTl9CQVNFX1BBSVJTIiwibnVtYmVyT2ZUd2lzdHMiLCJMRU5HVEhfUEVSX1RXSVNUIiwiZ2VuZXMiLCJzZXBhcmF0aW9ucyIsImkiLCJ4UG9zIiwic3RyYW5kMVlQb3MiLCJnZXREbmFTdHJhbmRZUG9zaXRpb24iLCJzdHJhbmQyWVBvcyIsIklOVEVSX1NUUkFORF9PRkZTRVQiLCJoZWlnaHQiLCJNYXRoIiwiYWJzIiwicHVzaCIsIm1pbiIsIm1heCIsImluaXRpYWxpemVTdHJhbmRTZWdtZW50cyIsImdldEJhc2VQYWlySW5kZXhGcm9tWE9mZnNldCIsInhPZmZzZXQiLCJhc3NlcnQiLCJjbGFtcCIsInRydW5jIiwicm91bmRTeW1tZXRyaWMiLCJnZXROZWFyZXN0QmFzZVBhaXJYT2Zmc2V0IiwiZ2V0QmFzZVBhaXJYT2Zmc2V0QnlJbmRleCIsInN0cmFuZDFTZWdtZW50UG9pbnRzIiwic3RyYW5kMlNlZ21lbnRQb2ludHMiLCJzZWdtZW50U3RhcnRYIiwic3RyYW5kMUluRnJvbnQiLCJsZW5ndGgiLCJkbmFTdHJhbmRQb2ludCIsImZpcnN0UG9pbnRPZk5leHRTZWdtZW50IiwieCIsIm9mZnNldCIsInNpbiIsIlBJIiwiRE5BX01PTEVDVUxFX0RJQU1FVEVSIiwidXBkYXRlU3RyYW5kU2VnbWVudHMiLCJmb3JFYWNoIiwidG9wWVBvc2l0aW9uIiwiYm90dG9tWVBvc2l0aW9uIiwic2VwYXJhdGlvbiIsIndpbmRvd1dpZHRoIiwiZ2V0QW1vdW50Iiwic2VwYXJhdGlvbldpbmRvd1hJbmRleFJhbmdlIiwiZmxvb3IiLCJnZXRYUG9zaXRpb24iLCJ3aW5kb3dDZW50ZXJYIiwic2VwYXJhdGlvbldlaWdodCIsImdldExlbmd0aCIsIm51bVNlZ21lbnRzIiwic2VnbWVudENoYW5nZWQiLCJzdHJhbmQxU2VnbWVudCIsIm1pblgiLCJtYXhYIiwicG9pbnRJbmRleFJhbmdlIiwiaiIsImVxdWFscyIsInNldCIsInN0cmFuZDFTaGFwZVBvaW50cyIsInN0cmFuZDJTaGFwZVBvaW50cyIsImsiLCJ5Iiwic3RlcCIsImR0IiwiZ2VuZSIsInVwZGF0ZUFmZmluaXRpZXMiLCJhZGRHZW5lIiwiZ2VuZVRvQWRkIiwiYmFzZVBhaXJOdW1iZXIiLCJhZGRTZXBhcmF0aW9uIiwicmVtb3ZlU2VwYXJhdGlvbiIsImluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsImdldEdlbmVzIiwiZ2V0TGFzdEdlbmUiLCJhY3RpdmF0ZUhpbnRzIiwiYmlvbW9sZWN1bGUiLCJkZWFjdGl2YXRlQWxsSGludHMiLCJkZWFjdGl2YXRlSGludHMiLCJnZXRMZWZ0RWRnZVBvc2l0aW9uIiwiRE5BX01PTEVDVUxFX1lfUE9TIiwiZ2V0TGVmdEVkZ2VYUG9zaXRpb24iLCJnZXRSaWdodEVkZ2VYUG9zaXRpb24iLCJnZXRUb3BFZGdlWVBvc2l0aW9uIiwiZG5hU3RyYW5kIiwiZ2V0Qm90dG9tRWRnZVlQb3NpdGlvbiIsImNvbnNpZGVyUHJvcG9zYWxGcm9tVHJhbnNjcmlwdGlvbkZhY3RvciIsInRyYW5zY3JpcHRpb25GYWN0b3IiLCJjb25zaWRlclByb3Bvc2FsRnJvbUJpb21vbGVjdWxlIiwiYmFzZVBhaXJJbmRleCIsImdldFRyYW5zY3JpcHRpb25GYWN0b3JBdHRhY2htZW50U2l0ZUZvckJhc2VQYWlySW5kZXgiLCJnZXRDb25maWciLCJnZXRNYXRjaGluZ1NpdGUiLCJjb25zaWRlclByb3Bvc2FsRnJvbVJuYVBvbHltZXJhc2UiLCJybmFQb2x5bWVyYXNlIiwiZ2V0Um5hUG9seW1lcmFzZUF0dGFjaG1lbnRTaXRlRm9yQmFzZVBhaXJJbmRleCIsInRyYW5zY3JpcHRpb25GYWN0b3JzU3VwcG9ydFRyYW5zY3JpcHRpb24iLCJnZXRQb2x5bWVyYXNlQXR0YWNobWVudFNpdGUiLCJtYXhBdHRhY2hEaXN0YW5jZSIsImdldEF0dGFjaFNpdGVGb3JCYXNlUGFpciIsImlzT2theVRvQXR0YWNoIiwiZ2V0QXR0YWNobWVudFNpdGUiLCJwb3RlbnRpYWxBdHRhY2htZW50U2l0ZXMiLCJzZXRYWSIsImdldENlbnRlclBvc2l0aW9uWCIsImRpc3RhbmNlIiwiZ2V0UG9zaXRpb24iLCJwb3RlbnRpYWxBdHRhY2htZW50U2l0ZSIsImF0dGFjaGVkT3JBdHRhY2hpbmdNb2xlY3VsZVByb3BlcnR5IiwiZ2V0IiwibWF0Y2hpbmdTaXRlIiwiaXNNb2xlY3VsZUF0dGFjaGVkIiwidGhpc0Rpc3RhbmNlIiwicG9zaXRpb25Qcm9wZXJ0eSIsInRoYXREaXN0YW5jZSIsImZvcmNlQWJvcnRQZW5kaW5nQXR0YWNobWVudCIsImVsaW1pbmF0ZUludmFsaWRBdHRhY2htZW50U2l0ZXMiLCJleHBvbmVudCIsImF0dGFjaFBvc2l0aW9uIiwic29ydCIsImF0dGFjaG1lbnRTaXRlMSIsImF0dGFjaG1lbnRTaXRlMiIsImFzMUZhY3RvciIsImdldEFmZmluaXR5IiwicG93IiwiYXMyRmFjdG9yIiwiXyIsImZpbHRlciIsImF0dGFjaG1lbnRTaXRlIiwidHJhbnNsYXRpb25WZWN0b3IiLCJtaW51cyIsInRyYW5zbGF0ZWRTaGFwZUJvdW5kcyIsImJvdW5kcyIsInNoaWZ0ZWRYWSIsIm1vdGlvbkJvdW5kc1Byb3BlcnR5IiwiaW5Cb3VuZHMiLCJhdHRhY2hlZE9ySW5jb21pbmdCaW9tb2xlY3VsZUJvdW5kcyIsIm1vYmlsZUJpb21vbGVjdWxlTGlzdCIsIm1vYmlsZUJpb21vbGVjdWxlIiwiYXR0YWNobWVudFN0YXRlTWFjaGluZSIsIm93bmVyIiwiYXR0YWNoZWRUb0RuYVByb3BlcnR5Iiwib3ZlcmxhcHNPdGhlck1vbGVjdWxlcyIsIm1vYmlsZUJpb21vbGVjdWxlQm91bmRzIiwiaW50ZXJzZWN0c0JvdW5kcyIsInRmQ29uZmlnIiwiZ2V0R2VuZUNvbnRhaW5pbmdCYXNlUGFpciIsImdldFRyYW5zY3JpcHRpb25GYWN0b3JBdHRhY2htZW50U2l0ZSIsImNyZWF0ZURlZmF1bHRBZmZpbml0eUF0dGFjaG1lbnRTaXRlIiwiZ2V0UG9seW1lcmFzZUF0dGFjaG1lbnRTaXRlQnlJbmRleCIsImdldEFkamFjZW50QXR0YWNobWVudFNpdGVzVHJhbnNjcmlwdGlvbkZhY3RvciIsImF0dGFjaG1lbnRTaXRlcyIsInBvdGVudGlhbFNpdGUiLCJnZXRBZGphY2VudEF0dGFjaG1lbnRTaXRlc1JuYVBvbHltZXJhc2UiLCJnZW5lQ29udGFpbmluZ0Jhc2VQYWlyIiwiY29udGFpbnNCYXNlUGFpciIsIkRFRkFVTFRfQUZGSU5JVFkiLCJnZXRHZW5lQXRQb3NpdGlvbiIsInBvc2l0aW9uIiwiZ2VuZUF0UG9zaXRpb24iLCJyZXNldCIsImNsZWFyQXR0YWNobWVudFNpdGVzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEbmFNb2xlY3VsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGlzIGNsYXNzIG1vZGVscyBhIG1vbGVjdWxlIG9mIEROQS4gSXQgaW5jbHVkZXMgdGhlIHNoYXBlIG9mIHRoZSB0d28gXCJiYWNrYm9uZVwiIHN0cmFuZHMgb2YgdGhlIEROQSBhbmQgdGhlXHJcbiAqIGluZGl2aWR1YWwgYmFzZSBwYWlycywgZGVmaW5lcyB3aGVyZSB0aGUgdmFyaW91cyBnZW5lcyByZXNpZGUsIGFuZCByZXRhaW5zIG90aGVyIGluZm9ybWF0aW9uIGFib3V0IHRoZSBETkEgbW9sZWN1bGUuXHJcbiAqIFRoaXMgaXMgYW4gaW1wb3J0YW50IGFuZCBjZW50cmFsIG9iamVjdCBpbiB0aGUgbW9kZWwgZm9yIHRoaXMgc2ltdWxhdGlvbi5cclxuICpcclxuICogQSBiaWcgc2ltcGxpZnlpbmcgYXNzdW1wdGlvbiB0aGF0IHRoaXMgY2xhc3MgbWFrZXMgaXMgdGhhdCBtb2xlY3VsZXMgdGhhdCBhdHRhY2ggdG8gdGhlIEROQSBkbyBzbyB0byBpbmRpdmlkdWFsIGJhc2VcclxuICogcGFpcnMuIEluIHJlYWxpdHksIGJpb21vbGVjdWxlcyBhdHRhY2ggdG8gZ3JvdXBzIG9mIGJhc2UgcGFpcnMsIHRoZSBleGFjdCBjb25maWd1cmF0aW9uIG9mIHdoaWNoIGRpY3RhdGUgd2hlcmVcclxuICogYmlvbW9sZWN1bGVzIGF0dGFjaC4gVGhpcyB3YXMgdW5uZWNlc3NhcmlseSBjb21wbGljYXRlZCBmb3IgdGhlIG5lZWRzIG9mIHRoaXMgc2ltLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNoYXJmdWRlZW4gQXNocmFmXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBBYWRpc2ggR3VwdGFcclxuICovXHJcblxyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IGdlbmVFeHByZXNzaW9uRXNzZW50aWFscyBmcm9tICcuLi8uLi9nZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMuanMnO1xyXG5pbXBvcnQgR0VFQ29uc3RhbnRzIGZyb20gJy4uL0dFRUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBBdHRhY2htZW50U2l0ZSBmcm9tICcuL0F0dGFjaG1lbnRTaXRlLmpzJztcclxuaW1wb3J0IEJhc2VQYWlyIGZyb20gJy4vQmFzZVBhaXIuanMnO1xyXG5pbXBvcnQgRG5hU3RyYW5kUG9pbnQgZnJvbSAnLi9EbmFTdHJhbmRQb2ludC5qcyc7XHJcbmltcG9ydCBTdHViR2VuZUV4cHJlc3Npb25Nb2RlbCBmcm9tICcuL1N0dWJHZW5lRXhwcmVzc2lvbk1vZGVsLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5cclxuLy8gZGlzdGFuY2Ugd2l0aGluIHdoaWNoIHRyYW5zY3JpcHRpb24gZmFjdG9ycyBtYXkgYXR0YWNoXHJcbmNvbnN0IFRSQU5TQ1JJUFRJT05fRkFDVE9SX0FUVEFDSE1FTlRfRElTVEFOQ0UgPSA0MDA7XHJcblxyXG4vLyBkaXN0YW5jZSB3aXRoaW4gd2hpY2ggUk5BIHBvbHltZXJhc2UgbWF5IGF0dGFjaFxyXG5jb25zdCBSTkFfUE9MWU1FUkFTRV9BVFRBQ0hNRU5UX0RJU1RBTkNFID0gNDAwO1xyXG5cclxuY29uc3QgYXR0YWNobWVudFNpdGVQb3NpdGlvbiA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcblxyXG5jbGFzcyBEbmFNb2xlY3VsZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7R2VuZUV4cHJlc3Npb25Nb2RlbHxudWxsfSBtb2RlbCAtIHRoZSBnZW5lIGV4cHJlc3Npb24gbW9kZWwgd2l0aGluIHdoaWNoIHRoaXMgRE5BIHN0cmFuZCBleGlzdHMsIG51bGwgZm9yXHJcbiAgICogYSBzdGFuZGFsb25lIGluc3RhbmNlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG51bUJhc2VQYWlycyAtIG51bWJlciBvZiBiYXNlIHBhaXJzIGluIHRoZSBzdHJhbmRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbGVmdEVkZ2VYT2Zmc2V0IC0geCBwb3NpdGlvbiBpbiBtb2RlbCBzcGFjZSBvZiB0aGUgbGVmdCBzaWRlIG9mIHRoZSBtb2xlY3VsZS4gWSBwb3NpdGlvbiBpcyBhc3N1bWVkXHJcbiAgICogdG8gYmUgemVyb1xyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gcHVyc3VlQXR0YWNobWVudHMgLSBmbGFnIHRoYXQgY29udHJvbHMgd2hldGhlciB0aGUgRE5BIHN0cmFuZCBhY3RpdmVseSBwdWxscyBpbiB0cmFuc2NyaXB0aW9uXHJcbiAgICogZmFjdG9ycyBhbmQgcG9seW1lcmFzZSBvciBqdXN0IGxldHMgdGhlbSBkcmlmdCBpbnRvIHBsYWNlXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCBudW1CYXNlUGFpcnMsIGxlZnRFZGdlWE9mZnNldCwgcHVyc3VlQXR0YWNobWVudHMgKSB7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7QXJyYXkuPEFycmF5LjxWZWN0b3IyPj59IFRoZXNlIGFycmF5cyBjb250YWluIGxpc3RzIG9mIFwic2VnbWVudHNcIiB0aGF0IGRlZmluZSB0aGUgc2hhcGUgb2ZcclxuICAgIC8vIHRoZSBETkEgc3RyYW5kLiAgRWFjaCBzZWdtZW50IGlzIGNvbXByaXNlZCBvZiBhIHNldCBvZiBwb2ludHMgdGhhdCwgd2hlbiBzbW9vdGhseSBjb25uZWN0ZWQsIGRlZmluZSBvbmUgaGFsZiBvZlxyXG4gICAgLy8gYSBcImN5Y2xlXCIgb2YgdGhlIEROQS4gIFRoZSBtb3RpdmF0aW9uIGJlaGluZCBoYXZpbmcgdGhlIHNlcGFyYXRlIHNlZ21lbnRzIGlzIHRvIG1ha2UgaXQgZWFzaWVyIHRvIHJlbmRlciB0aGVcclxuICAgIC8vIEROQSBhcyBhcHBlYXJpbmcgdG8gdHdpc3QuICBUaGVzZSBzZWdtZW50cyBjaGFuZ2UgcG9zaXRpb24gd2hlbiB0aGUgRE5BIHN0cmFuZHMgc2VwYXJhdGVzLCB3aGljaCBvY2N1cnMgd2hlbiB0aGVcclxuICAgIC8vIEROQSBpcyB0cmFuc2NyaWJlZCBieSBSTkEgcG9seW1lcmFzZS5cclxuICAgIHRoaXMuc3RyYW5kMVNlZ21lbnRzID0gW107IC8vIEBwdWJsaWNcclxuICAgIHRoaXMuc3RyYW5kMlNlZ21lbnRzID0gW107IC8vIEBwdWJsaWNcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtBcnJheS48QmFzZVBhaXI+fSAtIGJhc2UgcGFpcnMgd2l0aGluIHRoZSBETkEgc3RyYW5kXHJcbiAgICB0aGlzLmJhc2VQYWlycyA9IFtdO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge251bWJlcn0gLSBoZWlnaHQgb2YgdGhlIHRhbGxlc3QgYmFzZSBwYWlyLCBzZXQgZHVyaW5nIGluaXRpYWxpemF0aW9uIGJlbG93XHJcbiAgICB0aGlzLm1heEJhc2VQYWlySGVpZ2h0ID0gMDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtib29sZWFufSAtIGRpcnR5IGJpdCB3aGljaCB0ZWxscyB0aGUgdmlldyB3aGVuIHRvIHJlZHJhdyBETkFcclxuICAgIHRoaXMucmVkcmF3ID0gZmFsc2U7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0FycmF5LjxEbmFTdHJhbmRQb2ludD59IC0gcG9pbnRzIHRoYXQsIHdoZW4gY29ubmVjdGVkLCBkZWZpbmUgdGhlIHNoYXBlIG9mIHRoZSBETkEgc3RyYW5kcyAtIHRoZXNlXHJcbiAgICAvLyB1c2VkIGZvciBpbnRlcm5hbCBtYW5pcHVsYXRpb25zLCBhbmQgdGhlaXIgcG9zaXRpb25zIGFyZSBjb3BpZWQgaW50byB0aGUgbGF5ZXJlZCwgc2VwYXJhdGVkIFwic3RyYW5kIHNlZ2VtZW50c1wiXHJcbiAgICAvLyBhcyBjaGFuZ2VzIG9jY3VyLlxyXG4gICAgdGhpcy5zdHJhbmRQb2ludHMgPSBbXTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIHNoYWRvdyBvZiB0aGUgcG9pbnRzIHRoYXQgZGVmaW5lIHRoZSBzdHJhbmQgc2hhcGVzLCB1c2VkIGZvciByYXBpZCBldmFsdWF0aW9uIG9mIGFueSBzaGFwZSBjaGFuZ2VzXHJcbiAgICB0aGlzLnN0cmFuZFBvaW50c1NoYWRvdyA9IFtdO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gaW50ZXJuYWwgdmFyaWFibGUgdGhhdCBkZWZpbmUgc2hhcGUsIHNpemUsIGFuZCBiZWhhdmlvclxyXG4gICAgdGhpcy5tb2RlbCA9IG1vZGVsIHx8IG5ldyBTdHViR2VuZUV4cHJlc3Npb25Nb2RlbCgpOyAvLyBzdXBwb3J0IGNyZWF0aW9uIHdpdGhvdXQgbW9kZWwgZm9yIGNvbnRyb2wgcGFuZWxzIGFuZCBzdWNoXHJcbiAgICB0aGlzLmxlZnRFZGdlWE9mZnNldCA9IGxlZnRFZGdlWE9mZnNldDtcclxuICAgIHRoaXMucHVyc3VlQXR0YWNobWVudHMgPSBwdXJzdWVBdHRhY2htZW50cztcclxuICAgIHRoaXMubW9sZWN1bGVMZW5ndGggPSBudW1CYXNlUGFpcnMgKiBHRUVDb25zdGFudHMuRElTVEFOQ0VfQkVUV0VFTl9CQVNFX1BBSVJTO1xyXG4gICAgdGhpcy5udW1iZXJPZlR3aXN0cyA9IHRoaXMubW9sZWN1bGVMZW5ndGggLyBHRUVDb25zdGFudHMuTEVOR1RIX1BFUl9UV0lTVDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7QXJyYXkuPEdlbmU+fVxyXG4gICAgdGhpcy5nZW5lcyA9IFtdO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gbGlzdCBvZiBmb3JjZWQgc2VwYXJhdGlvbnMgYmV0d2VlbiB0aGUgdHdvIHN0cmFuZHMgb2YgdGhlIEROQVxyXG4gICAgdGhpcy5zZXBhcmF0aW9ucyA9IFtdO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgaW5pdGlhbCBzZXQgb2Ygc2hhcGUtZGVmaW5pbmcgcG9pbnRzIGZvciBlYWNoIG9mIHRoZSB0d28gc3RyYW5kcy4gIFBvaW50cyBhcmUgc3BhY2VkIHRoZSBzYW1lIGFzIHRoZVxyXG4gICAgLy8gYmFzZSBwYWlycy5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bUJhc2VQYWlyczsgaSsrICkge1xyXG4gICAgICBjb25zdCB4UG9zID0gbGVmdEVkZ2VYT2Zmc2V0ICsgaSAqIEdFRUNvbnN0YW50cy5ESVNUQU5DRV9CRVRXRUVOX0JBU0VfUEFJUlM7XHJcbiAgICAgIGNvbnN0IHN0cmFuZDFZUG9zID0gdGhpcy5nZXREbmFTdHJhbmRZUG9zaXRpb24oIHhQb3MsIDAgKTtcclxuICAgICAgY29uc3Qgc3RyYW5kMllQb3MgPSB0aGlzLmdldERuYVN0cmFuZFlQb3NpdGlvbiggeFBvcywgR0VFQ29uc3RhbnRzLklOVEVSX1NUUkFORF9PRkZTRVQgKTtcclxuICAgICAgY29uc3QgaGVpZ2h0ID0gTWF0aC5hYnMoIHN0cmFuZDFZUG9zIC0gc3RyYW5kMllQb3MgKTtcclxuICAgICAgdGhpcy5tYXhCYXNlUGFpckhlaWdodCA9IGhlaWdodCA+IHRoaXMubWF4QmFzZVBhaXJIZWlnaHQgPyBoZWlnaHQgOiB0aGlzLm1heEJhc2VQYWlySGVpZ2h0O1xyXG5cclxuICAgICAgLy8gQWRkIGluIHRoZSBiYXNlIHBhaXJzIGJldHdlZW4gdGhlIGJhY2tib25lIHN0cmFuZHMuICBUaGlzIGNhbGN1bGF0ZXMgdGhlIGRpc3RhbmNlIGJldHdlZW4gdGhlIHR3byBzdHJhbmRzIGFuZFxyXG4gICAgICAvLyBwdXRzIGEgbGluZSBiZXR3ZWVuIHRoZW0gaW4gIG9yZGVyIHRvIGxvb2sgbGlrZSB0aGUgYmFzZSBwYWlyLlxyXG4gICAgICB0aGlzLmJhc2VQYWlycy5wdXNoKCBuZXcgQmFzZVBhaXIoXHJcbiAgICAgICAgeFBvcyxcclxuICAgICAgICBNYXRoLm1pbiggc3RyYW5kMVlQb3MsIHN0cmFuZDJZUG9zICksXHJcbiAgICAgICAgTWF0aC5tYXgoIHN0cmFuZDFZUG9zLCBzdHJhbmQyWVBvcyApXHJcbiAgICAgICkgKTtcclxuICAgICAgdGhpcy5zdHJhbmRQb2ludHMucHVzaCggbmV3IERuYVN0cmFuZFBvaW50KCB4UG9zLCBzdHJhbmQxWVBvcywgc3RyYW5kMllQb3MgKSApO1xyXG4gICAgICB0aGlzLnN0cmFuZFBvaW50c1NoYWRvdy5wdXNoKCBuZXcgRG5hU3RyYW5kUG9pbnQoIHhQb3MsIHN0cmFuZDFZUG9zLCBzdHJhbmQyWVBvcyApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBzZXRzIG9mIHNlZ21lbnRzIHRoYXQgd2lsbCBiZSBvYnNlcnZlZCBieSB0aGUgdmlldy5cclxuICAgIHRoaXMuaW5pdGlhbGl6ZVN0cmFuZFNlZ21lbnRzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBnZXQgdGhlIGluZGV4IG9mIHRoZSBuZWFyZXN0IGJhc2UgcGFpciBnaXZlbiBhbiBYIHBvc2l0aW9uIGluIG1vZGVsIHNwYWNlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhPZmZzZXRcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgZ2V0QmFzZVBhaXJJbmRleEZyb21YT2Zmc2V0KCB4T2Zmc2V0ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggeE9mZnNldCA+PSB0aGlzLmxlZnRFZGdlWE9mZnNldCAmJiB4T2Zmc2V0IDwgdGhpcy5sZWZ0RWRnZVhPZmZzZXQgKyB0aGlzLm1vbGVjdWxlTGVuZ3RoICk7XHJcbiAgICB4T2Zmc2V0ID0gVXRpbHMuY2xhbXAoXHJcbiAgICAgIHhPZmZzZXQsXHJcbiAgICAgIHRoaXMubGVmdEVkZ2VYT2Zmc2V0LFxyXG4gICAgICB0aGlzLmxlZnRFZGdlWE9mZnNldCArIEdFRUNvbnN0YW50cy5MRU5HVEhfUEVSX1RXSVNUICogdGhpcy5udW1iZXJPZlR3aXN0c1xyXG4gICAgKTtcclxuICAgIHJldHVybiBNYXRoLnRydW5jKCBVdGlscy5yb3VuZFN5bW1ldHJpYyggKCB4T2Zmc2V0IC0gdGhpcy5sZWZ0RWRnZVhPZmZzZXQgLSBHRUVDb25zdGFudHMuSU5URVJfU1RSQU5EX09GRlNFVCApIC9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgR0VFQ29uc3RhbnRzLkRJU1RBTkNFX0JFVFdFRU5fQkFTRV9QQUlSUyApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBnZXQgdGhlIFggcG9zaXRpb24gb2YgdGhlIG5lYXJlc3QgYmFzZSBwYWlyIGdpdmVuIGFuIGFyYml0cmFyeSBYIHBvc2l0aW9uIGluIG1vZGVsIGNvb3JkaW5hdGVzXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhQb3NcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgZ2V0TmVhcmVzdEJhc2VQYWlyWE9mZnNldCggeFBvcyApIHtcclxuICAgIHJldHVybiB0aGlzLmdldEJhc2VQYWlyWE9mZnNldEJ5SW5kZXgoIHRoaXMuZ2V0QmFzZVBhaXJJbmRleEZyb21YT2Zmc2V0KCB4UG9zICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGluaXRpYWxpemUgdGhlIEROQSBzdGFuZCBzZWdtZW50IGxpc3RzXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBpbml0aWFsaXplU3RyYW5kU2VnbWVudHMoKSB7XHJcbiAgICBsZXQgc3RyYW5kMVNlZ21lbnRQb2ludHMgPSBbXTtcclxuICAgIGxldCBzdHJhbmQyU2VnbWVudFBvaW50cyA9IFtdO1xyXG4gICAgbGV0IHNlZ21lbnRTdGFydFggPSB0aGlzLnN0cmFuZFBvaW50c1sgMCBdLnhQb3M7XHJcbiAgICBsZXQgc3RyYW5kMUluRnJvbnQgPSB0cnVlO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5zdHJhbmRQb2ludHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGRuYVN0cmFuZFBvaW50ID0gdGhpcy5zdHJhbmRQb2ludHNbIGkgXTtcclxuICAgICAgY29uc3QgeFBvcyA9IGRuYVN0cmFuZFBvaW50LnhQb3M7XHJcbiAgICAgIHN0cmFuZDFTZWdtZW50UG9pbnRzLnB1c2goIG5ldyBWZWN0b3IyKCB4UG9zLCBkbmFTdHJhbmRQb2ludC5zdHJhbmQxWVBvcyApICk7XHJcbiAgICAgIHN0cmFuZDJTZWdtZW50UG9pbnRzLnB1c2goIG5ldyBWZWN0b3IyKCB4UG9zLCBkbmFTdHJhbmRQb2ludC5zdHJhbmQyWVBvcyApICk7XHJcbiAgICAgIGlmICggeFBvcyAtIHNlZ21lbnRTdGFydFggPj0gKCBHRUVDb25zdGFudHMuTEVOR1RIX1BFUl9UV0lTVCAvIDIgKSApIHtcclxuXHJcbiAgICAgICAgLy8gVGltZSB0byBhZGQgdGhlc2Ugc2VnbWVudHMgYW5kIHN0YXJ0IGEgbmV3IG9uZXMuXHJcbiAgICAgICAgdGhpcy5zdHJhbmQxU2VnbWVudHMucHVzaCggc3RyYW5kMVNlZ21lbnRQb2ludHMgKTtcclxuICAgICAgICB0aGlzLnN0cmFuZDJTZWdtZW50cy5wdXNoKCBzdHJhbmQyU2VnbWVudFBvaW50cyApO1xyXG4gICAgICAgIGxldCBmaXJzdFBvaW50T2ZOZXh0U2VnbWVudCA9IHN0cmFuZDFTZWdtZW50UG9pbnRzWyBzdHJhbmQxU2VnbWVudFBvaW50cy5sZW5ndGggLSAxIF07XHJcbiAgICAgICAgc3RyYW5kMVNlZ21lbnRQb2ludHMgPSBbXTsgLy8gY2xlYXI7XHJcbiAgICAgICAgc3RyYW5kMVNlZ21lbnRQb2ludHMucHVzaCggZmlyc3RQb2ludE9mTmV4dFNlZ21lbnQgKTsgLy8gVGhpcyBwb2ludCBtdXN0IGJlIG9uIHRoaXMgc2VnbWVudCB0b28gaW4gb3JkZXIgdG8gcHJldmVudCBnYXBzLlxyXG4gICAgICAgIGZpcnN0UG9pbnRPZk5leHRTZWdtZW50ID0gc3RyYW5kMlNlZ21lbnRQb2ludHNbIHN0cmFuZDJTZWdtZW50UG9pbnRzLmxlbmd0aCAtIDEgXTtcclxuICAgICAgICBzdHJhbmQyU2VnbWVudFBvaW50cyA9IFtdOyAvL2NsZWFyO1xyXG4gICAgICAgIHN0cmFuZDJTZWdtZW50UG9pbnRzLnB1c2goIGZpcnN0UG9pbnRPZk5leHRTZWdtZW50ICk7IC8vIFRoaXMgcG9pbnQgbXVzdCBiZSBvbiB0aGlzIHNlZ21lbnQgdG9vIGluIG9yZGVyIHRvIHByZXZlbnQgZ2Fwcy5cclxuICAgICAgICBzZWdtZW50U3RhcnRYID0gZmlyc3RQb2ludE9mTmV4dFNlZ21lbnQueDtcclxuICAgICAgICBzdHJhbmQxSW5Gcm9udCA9ICFzdHJhbmQxSW5Gcm9udDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGFkZCB0aGUgc3RyYW5kIGZvciB0aGUgcmVtYWluaW5nIGJhc2Ugc2VnbWVudHNcclxuICAgIHRoaXMuc3RyYW5kMVNlZ21lbnRzLnB1c2goIHN0cmFuZDFTZWdtZW50UG9pbnRzICk7XHJcbiAgICB0aGlzLnN0cmFuZDJTZWdtZW50cy5wdXNoKCBzdHJhbmQyU2VnbWVudFBvaW50cyApO1xyXG5cclxuICAgIHRoaXMucmVkcmF3ID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgWSBwb3NpdGlvbiBpbiBtb2RlbCBzcGFjZSBmb3IgYSBETkEgc3RyYW5kIGZvciB0aGUgZ2l2ZW4gWCBwb3NpdGlvbiBhbmQgb2Zmc2V0LiBUaGUgb2Zmc2V0IGFjdHMgbGlrZSBhXHJcbiAgICogXCJwaGFzZSBkaWZmZXJlbmNlXCIsIHRodXMgYWxsb3dpbmcgdGhpcyBtZXRob2QgdG8gYmUgdXNlZCB0byBnZXQgcG9zaXRpb24gaW5mb3JtYXRpb24gZm9yIGJvdGggRE5BIHN0cmFuZHMuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhQb3NcclxuICAgKiBAcGFyYW0ge251bWJlcn0gb2Zmc2V0XHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGdldERuYVN0cmFuZFlQb3NpdGlvbiggeFBvcywgb2Zmc2V0ICkge1xyXG4gICAgcmV0dXJuIE1hdGguc2luKCAoIHhQb3MgKyBvZmZzZXQgKSAvIEdFRUNvbnN0YW50cy5MRU5HVEhfUEVSX1RXSVNUICogTWF0aC5QSSAqIDIgKSAqIEdFRUNvbnN0YW50cy5ETkFfTU9MRUNVTEVfRElBTUVURVIgLyAyO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHRoZSBzdHJhbmQgc2VnbWVudCBzaGFwZXMgYmFzZWQgb24gdGhpbmdzIHRoYXQgbWlnaHQgaGF2ZSBjaGFuZ2VkLCBzdWNoIGFzIGJpb21vbGVjdWxlcyBhdHRhY2hpbmcgYW5kXHJcbiAgICogc2VwYXJhdGluZyB0aGUgc3RyYW5kcyBvciBvdGhlcndpc2UgZGVmb3JtaW5nIHRoZSBub21pbmFsIGRvdWJsZS1oZWxpeCBzaGFwZS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHVwZGF0ZVN0cmFuZFNlZ21lbnRzKCkge1xyXG4gICAgdGhpcy5yZWRyYXcgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBTZXQgdGhlIHNoYWRvdyBwb2ludHMgdG8gdGhlIG5vbWluYWwsIG5vbi1kZWZvcm1lZCBwb3NpdGlvbnMuXHJcbiAgICB0aGlzLnN0cmFuZFBvaW50c1NoYWRvdy5mb3JFYWNoKCAoIGRuYVN0cmFuZFBvaW50LCBpICkgPT4ge1xyXG4gICAgICBkbmFTdHJhbmRQb2ludC5zdHJhbmQxWVBvcyA9IHRoaXMuZ2V0RG5hU3RyYW5kWVBvc2l0aW9uKCBkbmFTdHJhbmRQb2ludC54UG9zLCAwICk7XHJcbiAgICAgIGRuYVN0cmFuZFBvaW50LnN0cmFuZDJZUG9zID0gdGhpcy5nZXREbmFTdHJhbmRZUG9zaXRpb24oIGRuYVN0cmFuZFBvaW50LnhQb3MsIEdFRUNvbnN0YW50cy5JTlRFUl9TVFJBTkRfT0ZGU0VUICk7XHJcbiAgICAgIHRoaXMuYmFzZVBhaXJzWyBpIF0udG9wWVBvc2l0aW9uID0gTWF0aC5taW4oIGRuYVN0cmFuZFBvaW50LnN0cmFuZDFZUG9zLCBkbmFTdHJhbmRQb2ludC5zdHJhbmQyWVBvcyApO1xyXG4gICAgICB0aGlzLmJhc2VQYWlyc1sgaSBdLmJvdHRvbVlQb3NpdGlvbiA9IE1hdGgubWF4KCBkbmFTdHJhbmRQb2ludC5zdHJhbmQxWVBvcywgZG5hU3RyYW5kUG9pbnQuc3RyYW5kMllQb3MgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBNb3ZlIHRoZSBzaGFkb3cgcG9pbnRzIHRvIGFjY291bnQgZm9yIGFueSBzZXBhcmF0aW9ucy5cclxuICAgIHRoaXMuc2VwYXJhdGlvbnMuZm9yRWFjaCggc2VwYXJhdGlvbiA9PiB7XHJcblxyXG4gICAgICAvLyBNYWtlIHRoZSB3aW5kb3cgd2lkZXIgdGhhbiBpdCBpcyBoaWdoLiAgVGhpcyB3YXMgY2hvc2VuIHRvIGxvb2sgZGVjZW50LCB0d2VhayBpZiBuZWVkZWQuXHJcbiAgICAgIGNvbnN0IHdpbmRvd1dpZHRoID0gc2VwYXJhdGlvbi5nZXRBbW91bnQoKSAqIDEuNTtcclxuXHJcbiAgICAgIGNvbnN0IHNlcGFyYXRpb25XaW5kb3dYSW5kZXhSYW5nZSA9IG5ldyBSYW5nZShcclxuICAgICAgICBNYXRoLmZsb29yKFxyXG4gICAgICAgICAgKCBzZXBhcmF0aW9uLmdldFhQb3NpdGlvbigpIC0gKCB3aW5kb3dXaWR0aCAvIDIgKSAtIHRoaXMubGVmdEVkZ2VYT2Zmc2V0ICkgLyBHRUVDb25zdGFudHMuRElTVEFOQ0VfQkVUV0VFTl9CQVNFX1BBSVJTXHJcbiAgICAgICAgKSxcclxuICAgICAgICBNYXRoLmZsb29yKFxyXG4gICAgICAgICAgKCBzZXBhcmF0aW9uLmdldFhQb3NpdGlvbigpICsgKCB3aW5kb3dXaWR0aCAvIDIgKSAtIHRoaXMubGVmdEVkZ2VYT2Zmc2V0ICkgLyBHRUVDb25zdGFudHMuRElTVEFOQ0VfQkVUV0VFTl9CQVNFX1BBSVJTXHJcbiAgICAgICAgKVxyXG4gICAgICApO1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IHNlcGFyYXRpb25XaW5kb3dYSW5kZXhSYW5nZS5taW47IGkgPCBzZXBhcmF0aW9uV2luZG93WEluZGV4UmFuZ2UubWF4OyBpKysgKSB7XHJcbiAgICAgICAgY29uc3Qgd2luZG93Q2VudGVyWCA9ICggc2VwYXJhdGlvbldpbmRvd1hJbmRleFJhbmdlLm1pbiArIHNlcGFyYXRpb25XaW5kb3dYSW5kZXhSYW5nZS5tYXggKSAvIDI7XHJcbiAgICAgICAgaWYgKCBpID49IDAgJiYgaSA8IHRoaXMuc3RyYW5kUG9pbnRzU2hhZG93Lmxlbmd0aCApIHtcclxuXHJcbiAgICAgICAgICAvLyBQZXJmb3JtIGEgd2luZG93aW5nIGFsZ29yaXRobSB0aGF0IHdlaWdodHMgdGhlIHNlcGFyYXRpb24gYXQgMSBpbiB0aGUgY2VudGVyLCAwIGF0IHRoZSBlZGdlcywgYW5kIGxpbmVhclxyXG4gICAgICAgICAgLy8gZ3JhZHVhdGlvbnMgaW4gYmV0d2Vlbi5cclxuICAgICAgICAgIGNvbnN0IHNlcGFyYXRpb25XZWlnaHQgPSAxIC0gTWF0aC5hYnMoIDIgKiAoIGkgLSB3aW5kb3dDZW50ZXJYICkgLyBzZXBhcmF0aW9uV2luZG93WEluZGV4UmFuZ2UuZ2V0TGVuZ3RoKCkgKTtcclxuICAgICAgICAgIHRoaXMuc3RyYW5kUG9pbnRzU2hhZG93WyBpIF0uc3RyYW5kMVlQb3MgPSAoIDEgLSBzZXBhcmF0aW9uV2VpZ2h0ICkgKiB0aGlzLnN0cmFuZFBvaW50c1NoYWRvd1sgaSBdLnN0cmFuZDFZUG9zICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXBhcmF0aW9uV2VpZ2h0ICogc2VwYXJhdGlvbi5nZXRBbW91bnQoKSAvIDI7XHJcbiAgICAgICAgICB0aGlzLnN0cmFuZFBvaW50c1NoYWRvd1sgaSBdLnN0cmFuZDJZUG9zID0gKCAxIC0gc2VwYXJhdGlvbldlaWdodCApICogdGhpcy5zdHJhbmRQb2ludHNTaGFkb3dbIGkgXS5zdHJhbmQyWVBvcyAtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VwYXJhdGlvbldlaWdodCAqIHNlcGFyYXRpb24uZ2V0QW1vdW50KCkgLyAyO1xyXG4gICAgICAgICAgdGhpcy5iYXNlUGFpcnNbIGkgXS50b3BZUG9zaXRpb24gPSBNYXRoLm1heChcclxuICAgICAgICAgICAgdGhpcy5zdHJhbmRQb2ludHNTaGFkb3dbIGkgXS5zdHJhbmQxWVBvcywgdGhpcy5zdHJhbmRQb2ludHNTaGFkb3dbIGkgXS5zdHJhbmQyWVBvc1xyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHRoaXMuYmFzZVBhaXJzWyBpIF0uYm90dG9tWVBvc2l0aW9uID0gTWF0aC5taW4oXHJcbiAgICAgICAgICAgIHRoaXMuc3RyYW5kUG9pbnRzU2hhZG93WyBpIF0uc3RyYW5kMVlQb3MsIHRoaXMuc3RyYW5kUG9pbnRzU2hhZG93WyBpIF0uc3RyYW5kMllQb3NcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gU2VlIGlmIGFueSBvZiB0aGUgcG9pbnRzIGhhdmUgbW92ZWQgYW5kLCBpZiBzbywgdXBkYXRlIHRoZSBjb3JyZXNwb25kaW5nIHNoYXBlIHNlZ21lbnQuXHJcbiAgICBjb25zdCBudW1TZWdtZW50cyA9IHRoaXMuc3RyYW5kMVNlZ21lbnRzLmxlbmd0aDtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bVNlZ21lbnRzOyBpKysgKSB7XHJcbiAgICAgIGxldCBzZWdtZW50Q2hhbmdlZCA9IGZhbHNlO1xyXG4gICAgICBjb25zdCBzdHJhbmQxU2VnbWVudCA9IHRoaXMuc3RyYW5kMVNlZ21lbnRzWyBpIF07XHJcblxyXG4gICAgICAvLyBEZXRlcm1pbmUgdGhlIGJvdW5kcyBvZiB0aGUgY3VycmVudCBzZWdtZW50LiBBc3N1bWVzIHRoYXQgdGhlIGJvdW5kcyBmb3IgdGhlIHN0cmFuZDEgYW5kIHN0cmFuZDIgc2VnbWVudHMgYXJlXHJcbiAgICAgIC8vIHRoZSBzYW1lLCB3aGljaCBzaG91bGQgYmUgYSBzYWZlIGFzc3VtcHRpb24uXHJcbiAgICAgIGNvbnN0IG1pblggPSBzdHJhbmQxU2VnbWVudFsgMCBdLng7XHJcbiAgICAgIGNvbnN0IG1heFggPSBzdHJhbmQxU2VnbWVudFsgc3RyYW5kMVNlZ21lbnQubGVuZ3RoIC0gMSBdLng7XHJcbiAgICAgIGNvbnN0IHBvaW50SW5kZXhSYW5nZSA9IG5ldyBSYW5nZSggTWF0aC5mbG9vciggKCBtaW5YIC0gdGhpcy5sZWZ0RWRnZVhPZmZzZXQgKSAvIEdFRUNvbnN0YW50cy5ESVNUQU5DRV9CRVRXRUVOX0JBU0VfUEFJUlMgKSxcclxuICAgICAgICBNYXRoLmZsb29yKCAoIG1heFggLSB0aGlzLmxlZnRFZGdlWE9mZnNldCApIC8gR0VFQ29uc3RhbnRzLkRJU1RBTkNFX0JFVFdFRU5fQkFTRV9QQUlSUyApICk7XHJcblxyXG4gICAgICAvLyBDaGVjayB0byBzZWUgaWYgYW55IG9mIHRoZSBwb2ludHMgd2l0aGluIHRoZSBpZGVudGlmaWVkIHJhbmdlIGhhdmUgY2hhbmdlZCBhbmQsIGlmIHNvLCB1cGRhdGUgdGhlXHJcbiAgICAgIC8vIGNvcnJlc3BvbmRpbmcgc2VnbWVudCBzaGFwZSBpbiB0aGUgc3RyYW5kcy4gSWYgdGhlIHBvaW50cyBmb3IgZWl0aGVyIHN0cmFuZCBoYXMgY2hhbmdlZCwgYm90aCBhcmUgdXBkYXRlZC5cclxuICAgICAgZm9yICggbGV0IGogPSBwb2ludEluZGV4UmFuZ2UubWluOyBqIDwgcG9pbnRJbmRleFJhbmdlLm1heDsgaisrICkge1xyXG4gICAgICAgIGlmICggIXRoaXMuc3RyYW5kUG9pbnRzWyBqIF0uZXF1YWxzKCB0aGlzLnN0cmFuZFBvaW50c1NoYWRvd1sgaiBdICkgKSB7XHJcblxyXG4gICAgICAgICAgLy8gVGhlIHBvaW50IGhhcyBjaGFuZ2VkLiAgVXBkYXRlIGl0LCBtYXJrIHRoZSBjaGFuZ2UuXHJcbiAgICAgICAgICB0aGlzLnN0cmFuZFBvaW50c1sgaiBdLnNldCggdGhpcy5zdHJhbmRQb2ludHNTaGFkb3dbIGogXSApO1xyXG4gICAgICAgICAgc2VnbWVudENoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCAhdGhpcy5zdHJhbmRQb2ludHNbIHBvaW50SW5kZXhSYW5nZS5tYXggXS5lcXVhbHMoIHRoaXMuc3RyYW5kUG9pbnRzU2hhZG93WyBwb2ludEluZGV4UmFuZ2UubWF4IF0gKSApIHtcclxuICAgICAgICAvLyBUaGUgcG9pbnQgaGFzIGNoYW5nZWQuICBVcGRhdGUgaXQsIG1hcmsgdGhlIGNoYW5nZS5cclxuICAgICAgICBzZWdtZW50Q2hhbmdlZCA9IHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggc2VnbWVudENoYW5nZWQgKSB7XHJcbiAgICAgICAgdGhpcy5yZWRyYXcgPSB0cnVlO1xyXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgc2hhcGUgb2YgdGhpcyBzZWdtZW50LlxyXG4gICAgICAgIGNvbnN0IHN0cmFuZDFTaGFwZVBvaW50cyA9IFtdO1xyXG4gICAgICAgIGNvbnN0IHN0cmFuZDJTaGFwZVBvaW50cyA9IFtdO1xyXG4gICAgICAgIGZvciAoIGxldCBrID0gcG9pbnRJbmRleFJhbmdlLm1pbjsgayA8IHBvaW50SW5kZXhSYW5nZS5tYXg7IGsrKyApIHtcclxuXHJcbiAgICAgICAgICAvL2ZvciBwZXJmb3JtYW5jZSByZWFzb25zIHVzaW5nIG9iamVjdCBsaXRlcmFscyBpbnN0ZWFkIG9mIFZlY3RvciBpbnN0YW5jZXNcclxuICAgICAgICAgIHN0cmFuZDFTaGFwZVBvaW50cy5wdXNoKCB7IHg6IHRoaXMuc3RyYW5kUG9pbnRzWyBrIF0ueFBvcywgeTogdGhpcy5zdHJhbmRQb2ludHNbIGsgXS5zdHJhbmQxWVBvcyB9ICk7XHJcbiAgICAgICAgICBzdHJhbmQyU2hhcGVQb2ludHMucHVzaCggeyB4OiB0aGlzLnN0cmFuZFBvaW50c1sgayBdLnhQb3MsIHk6IHRoaXMuc3RyYW5kUG9pbnRzWyBrIF0uc3RyYW5kMllQb3MgfSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzdHJhbmQxU2hhcGVQb2ludHMucHVzaCgge1xyXG4gICAgICAgICAgeDogdGhpcy5zdHJhbmRQb2ludHNTaGFkb3dbIHBvaW50SW5kZXhSYW5nZS5tYXggXS54UG9zLFxyXG4gICAgICAgICAgeTogdGhpcy5zdHJhbmRQb2ludHNTaGFkb3dbIHBvaW50SW5kZXhSYW5nZS5tYXggXS5zdHJhbmQxWVBvc1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgICBzdHJhbmQyU2hhcGVQb2ludHMucHVzaCgge1xyXG4gICAgICAgICAgeDogdGhpcy5zdHJhbmRQb2ludHNTaGFkb3dbIHBvaW50SW5kZXhSYW5nZS5tYXggXS54UG9zLFxyXG4gICAgICAgICAgeTogdGhpcy5zdHJhbmRQb2ludHNTaGFkb3dbIHBvaW50SW5kZXhSYW5nZS5tYXggXS5zdHJhbmQyWVBvc1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgICB0aGlzLnN0cmFuZDFTZWdtZW50c1sgaSBdID0gc3RyYW5kMVNoYXBlUG9pbnRzO1xyXG4gICAgICAgIHRoaXMuc3RyYW5kMlNlZ21lbnRzWyBpIF0gPSBzdHJhbmQyU2hhcGVQb2ludHM7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIHRoaXMudXBkYXRlU3RyYW5kU2VnbWVudHMoKTtcclxuICAgIHRoaXMuZ2VuZXMuZm9yRWFjaCggZ2VuZSA9PiB7XHJcbiAgICAgIGdlbmUudXBkYXRlQWZmaW5pdGllcygpO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbGVuZ3RoIG9mIHRoZSBETkEgbW9sZWN1bGVcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRMZW5ndGgoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5tb2xlY3VsZUxlbmd0aDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBhIGdlbmUgdG8gdGhlIEROQSBzdHJhbmQuIEFkZGluZyBhIGdlbmUgZXNzZW50aWFsbHkgZGVmaW5lcyBpdCwgc2luY2UgaW4gdGhpcyBzaW0sIHRoZSBiYXNlIHBhaXJzIGRvbid0XHJcbiAgICogYWN0dWFsbHkgZW5jb2RlIGFueXRoaW5nLCBzbyBhZGRpbmcgdGhlIGdlbmUgZXNzZW50aWFsbHkgZGVsaW5lYXRlcyB3aGVyZSBpdCBpcyBvbiB0aGUgc3RyYW5kLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtHZW5lfSBnZW5lVG9BZGQgR2VuZSB0byBhZGQgdG8gdGhlIEROQSBzdHJhbmQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGFkZEdlbmUoIGdlbmVUb0FkZCApIHtcclxuICAgIHRoaXMuZ2VuZXMucHVzaCggZ2VuZVRvQWRkICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIFggcG9zaXRpb24gb2YgdGhlIHNwZWNpZmllZCBiYXNlIHBhaXIuIFRoZSBmaXJzdCBiYXNlIHBhaXIgYXQgdGhlIGxlZnQgc2lkZSBvZiB0aGUgRE5BIG1vbGVjdWxlIGlzIGJhc2VcclxuICAgKiBwYWlyIDAsIGFuZCBpdCBnb2VzIHVwIGZyb20gdGhlcmUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYmFzZVBhaXJOdW1iZXJcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRCYXNlUGFpclhPZmZzZXRCeUluZGV4KCBiYXNlUGFpck51bWJlciApIHtcclxuICAgIHJldHVybiB0aGlzLmxlZnRFZGdlWE9mZnNldCArIEdFRUNvbnN0YW50cy5JTlRFUl9TVFJBTkRfT0ZGU0VUICtcclxuICAgICAgICAgICBiYXNlUGFpck51bWJlciAqIEdFRUNvbnN0YW50cy5ESVNUQU5DRV9CRVRXRUVOX0JBU0VfUEFJUlM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0RuYVNlcGFyYXRpb259IHNlcGFyYXRpb25cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYWRkU2VwYXJhdGlvbiggc2VwYXJhdGlvbiApIHtcclxuICAgIHRoaXMuc2VwYXJhdGlvbnMucHVzaCggc2VwYXJhdGlvbiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtEbmFTZXBhcmF0aW9ufSBzZXBhcmF0aW9uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlbW92ZVNlcGFyYXRpb24oIHNlcGFyYXRpb24gKSB7XHJcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuc2VwYXJhdGlvbnMuaW5kZXhPZiggc2VwYXJhdGlvbiApO1xyXG4gICAgaWYgKCBpbmRleCAhPT0gLTEgKSB7XHJcbiAgICAgIHRoaXMuc2VwYXJhdGlvbnMuc3BsaWNlKCBpbmRleCwgMSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHJldHVybnMge0FycmF5LjxHZW5lPn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0R2VuZXMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZW5lcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEByZXR1cm5zIHtHZW5lfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRMYXN0R2VuZSgpIHtcclxuICAgIHJldHVybiB0aGlzLmdlbmVzWyB0aGlzLmdlbmVzLmxlbmd0aCAtIDEgXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TW9iaWxlQmlvbW9sZWN1bGV9IGJpb21vbGVjdWxlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGFjdGl2YXRlSGludHMoIGJpb21vbGVjdWxlICkge1xyXG4gICAgdGhpcy5nZW5lcy5mb3JFYWNoKCBnZW5lID0+IHtcclxuICAgICAgZ2VuZS5hY3RpdmF0ZUhpbnRzKCBiaW9tb2xlY3VsZSApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGVhY3RpdmF0ZSB0aGUgaGludHMgZm9yIHRoZSBnZW5lc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBkZWFjdGl2YXRlQWxsSGludHMoKSB7XHJcbiAgICB0aGlzLmdlbmVzLmZvckVhY2goIGdlbmUgPT4ge1xyXG4gICAgICBnZW5lLmRlYWN0aXZhdGVIaW50cygpO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBwb3NpdGlvbiBpbiBtb2RlbCBzcGFjZSBvZiB0aGUgbGVmdG1vc3QgZWRnZSBvZiB0aGUgRE5BIHN0cmFuZC4gVGhlIFkgcG9zaXRpb24gaXMgaW4gdGhlIHZlcnRpY2FsIGNlbnRlclxyXG4gICAqIG9mIHRoZSBzdHJhbmQuXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0TGVmdEVkZ2VQb3NpdGlvbigpIHtcclxuICAgIHJldHVybiBuZXcgVmVjdG9yMiggdGhpcy5sZWZ0RWRnZVhPZmZzZXQsIEdFRUNvbnN0YW50cy5ETkFfTU9MRUNVTEVfWV9QT1MgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgeC1wb3NpdGlvbiBpbiBtb2RlbCBzcGFjZSBvZiB0aGUgbGVmdG1vc3QgZWRnZSBvZiB0aGUgRE5BIHN0cmFuZC5cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRMZWZ0RWRnZVhQb3NpdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLmxlZnRFZGdlWE9mZnNldDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgeC1wb3NpdGlvbiBpbiBtb2RlbCBzcGFjZSBvZiB0aGUgcmlnaHRtb3N0IGVkZ2Ugb2YgdGhlIEROQSBzdHJhbmQuXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0UmlnaHRFZGdlWFBvc2l0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuc3RyYW5kUG9pbnRzWyB0aGlzLnN0cmFuZFBvaW50cy5sZW5ndGggLSAxIF0ueFBvcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgeS1wb3NpdGlvbiBpbiBtb2RlbCBzcGFjZSBvZiB0aGUgdG9wbW9zdCBwb2ludCBpbiB0aGUgZWRnZSBvZiB0aGUgRE5BIHN0cmFuZC5cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRUb3BFZGdlWVBvc2l0aW9uKCkge1xyXG4gICAgY29uc3QgZG5hU3RyYW5kID0gdGhpcy5zdHJhbmQxU2VnbWVudHNbIDAgXTtcclxuICAgIGNvbnN0IGluZGV4ID0gTWF0aC5mbG9vciggZG5hU3RyYW5kLmxlbmd0aCAvIDIgKTtcclxuICAgIHJldHVybiBkbmFTdHJhbmRbIGluZGV4IF0ueTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgeS1wb3NpdGlvbiBpbiBtb2RlbCBzcGFjZSBvZiB0aGUgdG9wbW9zdCBwb2ludCBpbiB0aGUgZWRnZSBvZiB0aGUgRE5BIHN0cmFuZC5cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRCb3R0b21FZGdlWVBvc2l0aW9uKCkge1xyXG4gICAgLy8gYXNzZXJ0IHN0YXRlbWVudCBoZXJlXHJcbiAgICBjb25zdCBkbmFTdHJhbmQgPSB0aGlzLnN0cmFuZDFTZWdtZW50c1sgMSBdO1xyXG4gICAgY29uc3QgaW5kZXggPSBNYXRoLmZsb29yKCBkbmFTdHJhbmQubGVuZ3RoIC8gMiApO1xyXG4gICAgcmV0dXJuIGRuYVN0cmFuZFsgaW5kZXggXS55O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29uc2lkZXIgYW4gYXR0YWNobWVudCBwcm9wb3NhbCBmcm9tIGEgdHJhbnNjcmlwdGlvbiBmYWN0b3IgaW5zdGFuY2UuIFRvIGRldGVybWluZSB3aGV0aGVyIG9yIG5vdCB0byBhY2NlcHQgb3JcclxuICAgKiByZWplY3QgdGhpcyBwcm9wb3NhbCwgdGhlIGJhc2UgcGFpcnMgYXJlIHNjYW5uZWQgaW4gb3JkZXIgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhlcmUgaXMgYW4gYXBwcm9wcmlhdGUgYW5kXHJcbiAgICogYXZhaWxhYmxlIGF0dGFjaG1lbnQgc2l0ZSB3aXRoaW4gdGhlIGF0dGFjaG1lbnQgZGlzdGFuY2UuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1RyYW5zY3JpcHRpb25GYWN0b3J9IHRyYW5zY3JpcHRpb25GYWN0b3JcclxuICAgKiBAcmV0dXJucyB7QXR0YWNobWVudFNpdGV9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGNvbnNpZGVyUHJvcG9zYWxGcm9tVHJhbnNjcmlwdGlvbkZhY3RvciggdHJhbnNjcmlwdGlvbkZhY3RvciApIHtcclxuICAgIHJldHVybiB0aGlzLmNvbnNpZGVyUHJvcG9zYWxGcm9tQmlvbW9sZWN1bGUoXHJcbiAgICAgIHRyYW5zY3JpcHRpb25GYWN0b3IsXHJcbiAgICAgIFRSQU5TQ1JJUFRJT05fRkFDVE9SX0FUVEFDSE1FTlRfRElTVEFOQ0UsXHJcbiAgICAgIGJhc2VQYWlySW5kZXggPT4gdGhpcy5nZXRUcmFuc2NyaXB0aW9uRmFjdG9yQXR0YWNobWVudFNpdGVGb3JCYXNlUGFpckluZGV4KCBiYXNlUGFpckluZGV4LCB0cmFuc2NyaXB0aW9uRmFjdG9yLmdldENvbmZpZygpICksXHJcbiAgICAgIGdlbmUgPT4gdHJ1ZSxcclxuICAgICAgZ2VuZSA9PiBnZW5lLmdldE1hdGNoaW5nU2l0ZSggdHJhbnNjcmlwdGlvbkZhY3Rvci5nZXRDb25maWcoKSApXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29uc2lkZXIgYW4gYXR0YWNobWVudCBwcm9wb3NhbCBmcm9tIGEgcm5hIHBvbHltZXJhc2UgaW5zdGFuY2UuIFRvIGRldGVybWluZSB3aGV0aGVyIG9yIG5vdCB0byBhY2NlcHQgb3JcclxuICAgKiByZWplY3QgdGhpcyBwcm9wb3NhbCwgdGhlIGJhc2UgcGFpcnMgYXJlIHNjYW5uZWQgaW4gb3JkZXIgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhlcmUgaXMgYW4gYXBwcm9wcmlhdGUgYW5kXHJcbiAgICogYXZhaWxhYmxlIGF0dGFjaG1lbnQgc2l0ZSB3aXRoaW4gdGhlIGF0dGFjaG1lbnQgZGlzdGFuY2VcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Um5hUG9seW1lcmFzZX0gcm5hUG9seW1lcmFzZVxyXG4gICAqIEByZXR1cm5zIHtBdHRhY2htZW50U2l0ZX1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY29uc2lkZXJQcm9wb3NhbEZyb21SbmFQb2x5bWVyYXNlKCBybmFQb2x5bWVyYXNlICkge1xyXG4gICAgcmV0dXJuIHRoaXMuY29uc2lkZXJQcm9wb3NhbEZyb21CaW9tb2xlY3VsZSggcm5hUG9seW1lcmFzZSwgUk5BX1BPTFlNRVJBU0VfQVRUQUNITUVOVF9ESVNUQU5DRSxcclxuICAgICAgYmFzZVBhaXJJbmRleCA9PiB0aGlzLmdldFJuYVBvbHltZXJhc2VBdHRhY2htZW50U2l0ZUZvckJhc2VQYWlySW5kZXgoIGJhc2VQYWlySW5kZXggKSxcclxuICAgICAgZ2VuZSA9PiBnZW5lLnRyYW5zY3JpcHRpb25GYWN0b3JzU3VwcG9ydFRyYW5zY3JpcHRpb24oKSxcclxuICAgICAgZ2VuZSA9PiBnZW5lLmdldFBvbHltZXJhc2VBdHRhY2htZW50U2l0ZSgpXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29uc2lkZXIgYSBwcm9wb3NhbCBmcm9tIGEgYmlvbW9sZWN1bGUuIFRoaXMgaXMgdGhlIGdlbmVyaWMgdmVyc2lvbiB0aGF0IGF2b2lkcyBkdXBsaWNhdGVkIGNvZGUuXHJcbiAgICogQHBhcmFtIHtNb2JpbGVCaW9tb2xlY3VsZX0gYmlvbW9sZWN1bGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWF4QXR0YWNoRGlzdGFuY2VcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKG51bWJlcik6QXR0YWNobWVudFNpdGV9IGdldEF0dGFjaFNpdGVGb3JCYXNlUGFpclxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oR2VuZSk6Ym9vbGVhbn0gaXNPa2F5VG9BdHRhY2hcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKEdlbmUpOkF0dGFjaG1lbnRTaXRlfSBnZXRBdHRhY2htZW50U2l0ZVxyXG4gICAqIEByZXR1cm5zIHtBdHRhY2htZW50U2l0ZX1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGNvbnNpZGVyUHJvcG9zYWxGcm9tQmlvbW9sZWN1bGUoIGJpb21vbGVjdWxlLCBtYXhBdHRhY2hEaXN0YW5jZSwgZ2V0QXR0YWNoU2l0ZUZvckJhc2VQYWlyLCBpc09rYXlUb0F0dGFjaCwgZ2V0QXR0YWNobWVudFNpdGUgKSB7XHJcblxyXG4gICAgbGV0IHBvdGVudGlhbEF0dGFjaG1lbnRTaXRlcyA9IFtdO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5iYXNlUGFpcnMubGVuZ3RoOyBpKysgKSB7XHJcblxyXG4gICAgICAvLyBTZWUgaWYgdGhlIGJhc2UgcGFpciBpcyB3aXRoaW4gdGhlIG1heCBhdHRhY2htZW50IGRpc3RhbmNlLlxyXG4gICAgICBhdHRhY2htZW50U2l0ZVBvc2l0aW9uLnNldFhZKCB0aGlzLmJhc2VQYWlyc1sgaSBdLmdldENlbnRlclBvc2l0aW9uWCgpLCBHRUVDb25zdGFudHMuRE5BX01PTEVDVUxFX1lfUE9TICk7XHJcblxyXG4gICAgICBpZiAoIGF0dGFjaG1lbnRTaXRlUG9zaXRpb24uZGlzdGFuY2UoIGJpb21vbGVjdWxlLmdldFBvc2l0aW9uKCkgKSA8PSBtYXhBdHRhY2hEaXN0YW5jZSApIHtcclxuXHJcbiAgICAgICAgLy8gSW4gcmFuZ2UuICBBZGQgaXQgdG8gdGhlIGxpc3QgaWYgaXQgaXMgYXZhaWxhYmxlLlxyXG4gICAgICAgIGNvbnN0IHBvdGVudGlhbEF0dGFjaG1lbnRTaXRlID0gZ2V0QXR0YWNoU2l0ZUZvckJhc2VQYWlyKCBpICk7XHJcbiAgICAgICAgaWYgKCBwb3RlbnRpYWxBdHRhY2htZW50U2l0ZS5hdHRhY2hlZE9yQXR0YWNoaW5nTW9sZWN1bGVQcm9wZXJ0eS5nZXQoKSA9PT0gbnVsbCApIHtcclxuICAgICAgICAgIHBvdGVudGlhbEF0dGFjaG1lbnRTaXRlcy5wdXNoKCBwb3RlbnRpYWxBdHRhY2htZW50U2l0ZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIHRoZXJlIGFyZW4ndCBhbnkgcG90ZW50aWFsIGF0dGFjaG1lbnQgc2l0ZXMgaW4gcmFuZ2UsIGNoZWNrIGZvciBhIHBhcnRpY3VsYXIgc2V0IG9mIGNvbmRpdGlvbnMgdW5kZXIgd2hpY2hcclxuICAgIC8vIHRoZSBETkEgcHJvdmlkZXMgYW4gYXR0YWNobWVudCBzaXRlIGFueXdheXMuXHJcbiAgICBpZiAoIHBvdGVudGlhbEF0dGFjaG1lbnRTaXRlcy5sZW5ndGggPT09IDAgJiYgdGhpcy5wdXJzdWVBdHRhY2htZW50cyApIHtcclxuICAgICAgdGhpcy5nZW5lcy5mb3JFYWNoKCBnZW5lID0+IHtcclxuICAgICAgICBpZiAoIGlzT2theVRvQXR0YWNoKCBnZW5lICkgKSB7XHJcbiAgICAgICAgICBjb25zdCBtYXRjaGluZ1NpdGUgPSBnZXRBdHRhY2htZW50U2l0ZSggZ2VuZSApO1xyXG5cclxuICAgICAgICAgIC8vIEZvdW5kIGEgbWF0Y2hpbmcgc2l0ZSBvbiBhIGdlbmUuXHJcbiAgICAgICAgICBpZiAoIG1hdGNoaW5nU2l0ZS5hdHRhY2hlZE9yQXR0YWNoaW5nTW9sZWN1bGVQcm9wZXJ0eS5nZXQoKSA9PT0gbnVsbCApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBzaXRlIGlzIHVub2NjdXBpZWQsIHNvIGFkZCBpdCB0byB0aGUgbGlzdCBvZiAgcG90ZW50aWFsIHNpdGVzLlxyXG4gICAgICAgICAgICBwb3RlbnRpYWxBdHRhY2htZW50U2l0ZXMucHVzaCggbWF0Y2hpbmdTaXRlICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmICggIW1hdGNoaW5nU2l0ZS5pc01vbGVjdWxlQXR0YWNoZWQoKSApIHtcclxuICAgICAgICAgICAgY29uc3QgdGhpc0Rpc3RhbmNlID0gYmlvbW9sZWN1bGUuZ2V0UG9zaXRpb24oKS5kaXN0YW5jZSggbWF0Y2hpbmdTaXRlLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKTtcclxuICAgICAgICAgICAgY29uc3QgdGhhdERpc3RhbmNlID0gbWF0Y2hpbmdTaXRlLmF0dGFjaGVkT3JBdHRhY2hpbmdNb2xlY3VsZVByb3BlcnR5LmdldCgpLmdldFBvc2l0aW9uKCkuZGlzdGFuY2UoXHJcbiAgICAgICAgICAgICAgbWF0Y2hpbmdTaXRlLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKTtcclxuICAgICAgICAgICAgaWYgKCB0aGlzRGlzdGFuY2UgPCB0aGF0RGlzdGFuY2UgKSB7XHJcblxyXG4gICAgICAgICAgICAgIC8vIFRoZSBvdGhlciBtb2xlY3VsZSBpcyBub3QgeWV0IGF0dGFjaGVkLCBhbmQgdGhpcyBvbmUgaXMgY2xvc2VyLCBzbyBmb3JjZSB0aGUgb3RoZXIgbW9sZWN1bGUgdG9cclxuICAgICAgICAgICAgICAvLyBhYm9ydCBpdHMgcGVuZGluZyBhdHRhY2htZW50LlxyXG4gICAgICAgICAgICAgIG1hdGNoaW5nU2l0ZS5hdHRhY2hlZE9yQXR0YWNoaW5nTW9sZWN1bGVQcm9wZXJ0eS5nZXQoKS5mb3JjZUFib3J0UGVuZGluZ0F0dGFjaG1lbnQoKTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gQWRkIHRoaXMgc2l0ZSB0byB0aGUgbGlzdCBvZiBwb3RlbnRpYWwgc2l0ZXMuXHJcbiAgICAgICAgICAgICAgcG90ZW50aWFsQXR0YWNobWVudFNpdGVzLnB1c2goIG1hdGNoaW5nU2l0ZSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRWxpbWluYXRlIHNpdGVzIHRoYXQgd291bGQgcHV0IHRoZSBtb2xlY3VsZSBvdXQgb2YgYm91bmRzIG9yIHdvdWxkIG92ZXJsYXAgd2l0aCBvdGhlciBhdHRhY2hlZCBiaW9tb2xlY3VsZXMuXHJcbiAgICBwb3RlbnRpYWxBdHRhY2htZW50U2l0ZXMgPSB0aGlzLmVsaW1pbmF0ZUludmFsaWRBdHRhY2htZW50U2l0ZXMoIGJpb21vbGVjdWxlLCBwb3RlbnRpYWxBdHRhY2htZW50U2l0ZXMgKTtcclxuICAgIGlmICggcG90ZW50aWFsQXR0YWNobWVudFNpdGVzLmxlbmd0aCA9PT0gMCApIHtcclxuXHJcbiAgICAgIC8vIE5vIGFjY2VwdGFibGUgc2l0ZXMgZm91bmQuXHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGV4cG9uZW50ID0gMTtcclxuICAgIGNvbnN0IGF0dGFjaFBvc2l0aW9uID0gYmlvbW9sZWN1bGUuZ2V0UG9zaXRpb24oKTtcclxuXHJcbiAgICAvLyBTb3J0IHRoZSBjb2xsZWN0aW9uIHNvIHRoYXQgdGhlIGJlc3Qgc2l0ZSBpcyBhdCB0aGUgdG9wIG9mIHRoZSBsaXN0LlxyXG4gICAgcG90ZW50aWFsQXR0YWNobWVudFNpdGVzLnNvcnQoICggYXR0YWNobWVudFNpdGUxLCBhdHRhY2htZW50U2l0ZTIgKSA9PiB7XHJcblxyXG4gICAgICAvLyBUaGUgY29tcGFyaXNvbiBpcyBiYXNlZCBvbiBhIGNvbWJpbmF0aW9uIG9mIHRoZSBhZmZpbml0eSBhbmQgdGhlIGRpc3RhbmNlLCBtdWNoIGxpa2UgZ3Jhdml0YXRpb25hbCBhdHRyYWN0aW9uLlxyXG4gICAgICAvLyBUaGUgZXhwb25lbnQgZWZmZWN0aXZlbHkgc2V0cyB0aGUgcmVsYXRpdmUgd2VpZ2h0aW5nIG9mIG9uZSB2ZXJzdXMgYW5vdGhlci4gQW4gZXhwb25lbnQgdmFsdWUgb2YgemVybyBtZWFuc1xyXG4gICAgICAvLyBvbmx5IHRoZSBhZmZpbml0eSBtYXR0ZXJzLCBhIHZhbHVlIG9mIDEwMCBtZWFucyBpdCBpcyBwcmV0dHkgbXVjaCBlbnRpcmVseSBkaXN0YW5jZS4gQSB2YWx1ZSBvZiAyIGlzIGhvd1xyXG4gICAgICAvLyBncmF2aXR5IHdvcmtzLCBzbyBpdCBhcHBlYXJzIGtpbmQgb2YgbmF0dXJhbC4gVHdlYWsgYXMgbmVlZGVkLlxyXG4gICAgICBjb25zdCBhczFGYWN0b3IgPSBhdHRhY2htZW50U2l0ZTEuZ2V0QWZmaW5pdHkoKSAvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE1hdGgucG93KCBhdHRhY2hQb3NpdGlvbi5kaXN0YW5jZSggYXR0YWNobWVudFNpdGUxLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKSwgZXhwb25lbnQgKTtcclxuICAgICAgY29uc3QgYXMyRmFjdG9yID0gYXR0YWNobWVudFNpdGUyLmdldEFmZmluaXR5KCkgL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBNYXRoLnBvdyggYXR0YWNoUG9zaXRpb24uZGlzdGFuY2UoIGF0dGFjaG1lbnRTaXRlMi5wb3NpdGlvblByb3BlcnR5LmdldCgpICksIGV4cG9uZW50ICk7XHJcblxyXG4gICAgICBpZiAoIGFzMkZhY3RvciA+IGFzMUZhY3RvciApIHtcclxuICAgICAgICByZXR1cm4gMTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCBhczJGYWN0b3IgPCBhczFGYWN0b3IgKSB7XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiAwO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFJldHVybiB0aGUgb3B0aW1hbCBhdHRhY2htZW50IHNpdGUuXHJcbiAgICByZXR1cm4gcG90ZW50aWFsQXR0YWNobWVudFNpdGVzWyAwIF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUYWtlIGEgbGlzdCBvZiBhdHRhY2htZW50IHNpdGVzIGFuZCBlbGltaW5hdGUgYW55IG9mIHRoZW0gdGhhdCwgaWYgdGhlIGdpdmVuIG1vbGVjdWxlIGF0dGFjaGVzLCBpdCB3b3VsZCBlbmQgdXBcclxuICAgKiBvdXQgb2YgYm91bmRzIG9yIG92ZXJsYXBwaW5nIHdpdGggYW5vdGhlciBiaW9tb2xlY3VsZSB0aGF0IGlzIGFscmVhZHkgYXR0YWNoZWQgdG8gdGhlIEROQSBzdHJhbmQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gIHtNb2JpbGVCaW9tb2xlY3VsZX0gYmlvbW9sZWN1bGUgLSBUaGUgYmlvbW9sZWN1bGUgdGhhdCBpcyBwb3RlbnRpYWxseSBnb2luZyB0byBhdHRhY2ggdG8gdGhlIHByb3ZpZGVkXHJcbiAgICogbGlzdCBvZiBhdHRhY2htZW50IHNpdGVzLlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPEF0dGFjaG1lbnRTaXRlPn0gcG90ZW50aWFsQXR0YWNobWVudFNpdGVzXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBlbGltaW5hdGVJbnZhbGlkQXR0YWNobWVudFNpdGVzKCBiaW9tb2xlY3VsZSwgcG90ZW50aWFsQXR0YWNobWVudFNpdGVzICkge1xyXG4gICAgcmV0dXJuIF8uZmlsdGVyKCBwb3RlbnRpYWxBdHRhY2htZW50U2l0ZXMsIGF0dGFjaG1lbnRTaXRlID0+IHtcclxuXHJcbiAgICAgIC8vIGRldGVybWluZSB0aGUgYm91bmRzIGZvciB0aGUgcHJvdmlkZWQgYmlvbW9sZWN1bGUgd2hlbiB0cmFuc2xhdGVkIHRvIHRoZSBhdHRhY2htZW50IHNpdGVcclxuICAgICAgbGV0IHRyYW5zbGF0aW9uVmVjdG9yID0gYXR0YWNobWVudFNpdGUucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS5taW51cyggYmlvbW9sZWN1bGUuZ2V0UG9zaXRpb24oKSApO1xyXG4gICAgICBjb25zdCB0cmFuc2xhdGVkU2hhcGVCb3VuZHMgPSBiaW9tb2xlY3VsZS5ib3VuZHMuc2hpZnRlZFhZKCB0cmFuc2xhdGlvblZlY3Rvci54LCB0cmFuc2xhdGlvblZlY3Rvci55ICk7XHJcblxyXG4gICAgICAvLyBpZiB0aGUgYmlvbW9sZWN1bGUgd291bGQgYmUgb3V0IG9mIHRoZSBtb2RlbCBib3VuZHMsIHRoZSBzaXRlIHNob3VsZCBiZSBleGNsdWRlZFxyXG4gICAgICBpZiAoICFiaW9tb2xlY3VsZS5tb3Rpb25Cb3VuZHNQcm9wZXJ0eS5nZXQoKS5pbkJvdW5kcyggdHJhbnNsYXRlZFNoYXBlQm91bmRzICkgKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBtYWtlIGEgbGlzdCBvZiB0aGUgYm91bmRzIHdoZXJlIGFsbCBhdHRhY2hlZCBvciBpbmNvbWluZyBiaW9tb2xlY3VsZXMgYXJlIG9yIHdpbGwgYmUgKG9uY2UgYXR0YWNoZWQpXHJcbiAgICAgIGNvbnN0IGF0dGFjaGVkT3JJbmNvbWluZ0Jpb21vbGVjdWxlQm91bmRzID0gW107XHJcbiAgICAgIHRoaXMubW9kZWwubW9iaWxlQmlvbW9sZWN1bGVMaXN0LmZvckVhY2goIG1vYmlsZUJpb21vbGVjdWxlID0+IHtcclxuXHJcbiAgICAgICAgLy8gc2tpcCB0aGUgYmlvbW9sZWN1bGUgYmVpbmcgdGVzdGVkIGZvciBvdmVybGFwXHJcbiAgICAgICAgaWYgKCBtb2JpbGVCaW9tb2xlY3VsZSA9PT0gYmlvbW9sZWN1bGUgKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBhdHRhY2htZW50U2l0ZSA9IG1vYmlsZUJpb21vbGVjdWxlLmF0dGFjaG1lbnRTdGF0ZU1hY2hpbmUuYXR0YWNobWVudFNpdGU7XHJcblxyXG4gICAgICAgIGlmICggYXR0YWNobWVudFNpdGUgJiYgYXR0YWNobWVudFNpdGUub3duZXIgPT09IHRoaXMgKSB7XHJcbiAgICAgICAgICBpZiAoIG1vYmlsZUJpb21vbGVjdWxlLmF0dGFjaGVkVG9EbmFQcm9wZXJ0eS5nZXQoKSApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHRoaXMgYmlvbW9sZWN1bGUgaXMgYXR0YWNoZWQsIHNvIGFkZCBpdHMgYm91bmRzIHdpdGggbm8gdHJhbnNsYXRpb25cclxuICAgICAgICAgICAgYXR0YWNoZWRPckluY29taW5nQmlvbW9sZWN1bGVCb3VuZHMucHVzaCggbW9iaWxlQmlvbW9sZWN1bGUuYm91bmRzICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFRoaXMgYmlvbW9sZWN1bGUgaXMgbW92aW5nIHRvd2FyZHMgYXR0YWNobWVudCBidXQgbm90IHlldCBhdHRhY2hlZCwgc28gdHJhbnNsYXRlIHRvIGJvdW5kcyB0byB3aGVyZVxyXG4gICAgICAgICAgICAvLyB0aGV5IHdpbGwgYmUgb25jZSBhdHRhY2htZW50IG9jY3Vycy5cclxuICAgICAgICAgICAgdHJhbnNsYXRpb25WZWN0b3IgPSBhdHRhY2htZW50U2l0ZS5wb3NpdGlvblByb3BlcnR5LmdldCgpLm1pbnVzKCBtb2JpbGVCaW9tb2xlY3VsZS5nZXRQb3NpdGlvbigpICk7XHJcbiAgICAgICAgICAgIGF0dGFjaGVkT3JJbmNvbWluZ0Jpb21vbGVjdWxlQm91bmRzLnB1c2goXHJcbiAgICAgICAgICAgICAgbW9iaWxlQmlvbW9sZWN1bGUuYm91bmRzLnNoaWZ0ZWRYWSggdHJhbnNsYXRpb25WZWN0b3IueCwgdHJhbnNsYXRpb25WZWN0b3IueSApXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBsZXQgb3ZlcmxhcHNPdGhlck1vbGVjdWxlcyA9IGZhbHNlO1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhdHRhY2hlZE9ySW5jb21pbmdCaW9tb2xlY3VsZUJvdW5kcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBjb25zdCBtb2JpbGVCaW9tb2xlY3VsZUJvdW5kcyA9IGF0dGFjaGVkT3JJbmNvbWluZ0Jpb21vbGVjdWxlQm91bmRzWyBpIF07XHJcbiAgICAgICAgaWYgKCBtb2JpbGVCaW9tb2xlY3VsZUJvdW5kcy5pbnRlcnNlY3RzQm91bmRzKCB0cmFuc2xhdGVkU2hhcGVCb3VuZHMgKSApIHtcclxuICAgICAgICAgIG92ZXJsYXBzT3RoZXJNb2xlY3VsZXMgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiAhb3ZlcmxhcHNPdGhlck1vbGVjdWxlcztcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpXHJcbiAgICogQHBhcmFtIHtUcmFuc2NyaXB0aW9uRmFjdG9yQ29uZmlnfSB0ZkNvbmZpZ1xyXG4gICAqIEByZXR1cm5zIHtBdHRhY2htZW50U2l0ZX1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGdldFRyYW5zY3JpcHRpb25GYWN0b3JBdHRhY2htZW50U2l0ZUZvckJhc2VQYWlySW5kZXgoIGksIHRmQ29uZmlnICkge1xyXG4gICAgLy8gU2VlIGlmIHRoaXMgYmFzZSBwYWlyIGlzIGluc2lkZSBhIGdlbmUuXHJcbiAgICBjb25zdCBnZW5lID0gdGhpcy5nZXRHZW5lQ29udGFpbmluZ0Jhc2VQYWlyKCBpICk7XHJcblxyXG4gICAgaWYgKCBnZW5lICE9PSBudWxsICkge1xyXG4gICAgICAvLyBCYXNlIHBhaXIgaXMgaW4gYSBnZW5lLCBzbyBnZXQgaXQgZnJvbSB0aGUgZ2VuZS5cclxuICAgICAgcmV0dXJuIGdlbmUuZ2V0VHJhbnNjcmlwdGlvbkZhY3RvckF0dGFjaG1lbnRTaXRlKCBpLCB0ZkNvbmZpZyApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIEJhc2UgcGFpciBpcyBub3QgY29udGFpbmVkIHdpdGhpbiBhIGdlbmUsIHNvIHVzZSB0aGUgZGVmYXVsdC5cclxuICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlRGVmYXVsdEFmZmluaXR5QXR0YWNobWVudFNpdGUoIGkgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpXHJcbiAgICogQHJldHVybnMge0F0dGFjaG1lbnRTaXRlfVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgZ2V0Um5hUG9seW1lcmFzZUF0dGFjaG1lbnRTaXRlRm9yQmFzZVBhaXJJbmRleCggaSApIHtcclxuICAgIC8vIFNlZSBpZiB0aGlzIGJhc2UgcGFpciBpcyBpbnNpZGUgYSBnZW5lLlxyXG4gICAgY29uc3QgZ2VuZSA9IHRoaXMuZ2V0R2VuZUNvbnRhaW5pbmdCYXNlUGFpciggaSApO1xyXG4gICAgaWYgKCBnZW5lICE9PSBudWxsICkge1xyXG4gICAgICAvLyBCYXNlIHBhaXIgaXMgaW4gYSBnZW5lLiAgU2VlIGlmIHNpdGUgaXMgYXZhaWxhYmxlLlxyXG4gICAgICByZXR1cm4gZ2VuZS5nZXRQb2x5bWVyYXNlQXR0YWNobWVudFNpdGVCeUluZGV4KCBpICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgLy8gQmFzZSBwYWlyIGlzIG5vdCBjb250YWluZWQgd2l0aGluIGEgZ2VuZSwgc28gdXNlIHRoZSBkZWZhdWx0LlxyXG4gICAgICByZXR1cm4gdGhpcy5jcmVhdGVEZWZhdWx0QWZmaW5pdHlBdHRhY2htZW50U2l0ZSggaSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSB0d28gYmFzZSBwYWlyIGF0dGFjaG1lbnQgc2l0ZXMgdGhhdCBhcmUgbmV4dCB0byB0aGUgcHJvdmlkZWQgb25lLCBpLmUuIHRoZSBvbmUgYmVmb3JlIGl0IG9uIHRoZSBETkFcclxuICAgKiBzdHJhbmQgYW5kIHRoZSBvbmUgYWZ0ZXIgaXQuIElmIGF0IG9uZSBlbmQgb2YgdGhlIHN0cmFuZCwgb25seSBvbmUgc2l0ZSB3aWxsIGJlIHJldHVybmVkLiBPY2N1cGllZCBzaXRlcyBhcmUgbm90XHJcbiAgICogcmV0dXJuZWQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1RyYW5zY3JpcHRpb25GYWN0b3J9IHRyYW5zY3JpcHRpb25GYWN0b3JcclxuICAgKiBAcGFyYW0ge0F0dGFjaG1lbnRTaXRlfSBhdHRhY2htZW50U2l0ZVxyXG4gICAqIEByZXR1cm5zIHtBcnJheS48QXR0YWNobWVudFNpdGU+fVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRBZGphY2VudEF0dGFjaG1lbnRTaXRlc1RyYW5zY3JpcHRpb25GYWN0b3IoIHRyYW5zY3JpcHRpb25GYWN0b3IsIGF0dGFjaG1lbnRTaXRlICkge1xyXG4gICAgY29uc3QgYmFzZVBhaXJJbmRleCA9IHRoaXMuZ2V0QmFzZVBhaXJJbmRleEZyb21YT2Zmc2V0KCBhdHRhY2htZW50U2l0ZS5wb3NpdGlvblByb3BlcnR5LmdldCgpLnggKTtcclxuICAgIGNvbnN0IGF0dGFjaG1lbnRTaXRlcyA9IFtdO1xyXG4gICAgbGV0IHBvdGVudGlhbFNpdGU7XHJcbiAgICBpZiAoIGJhc2VQYWlySW5kZXggIT09IDAgKSB7XHJcbiAgICAgIHBvdGVudGlhbFNpdGUgPSB0aGlzLmdldFRyYW5zY3JpcHRpb25GYWN0b3JBdHRhY2htZW50U2l0ZUZvckJhc2VQYWlySW5kZXgoIGJhc2VQYWlySW5kZXggLSAxLFxyXG4gICAgICAgIHRyYW5zY3JpcHRpb25GYWN0b3IuZ2V0Q29uZmlnKCkgKTtcclxuICAgICAgaWYgKCBwb3RlbnRpYWxTaXRlLmF0dGFjaGVkT3JBdHRhY2hpbmdNb2xlY3VsZVByb3BlcnR5LmdldCgpID09PSBudWxsICkge1xyXG4gICAgICAgIGF0dGFjaG1lbnRTaXRlcy5wdXNoKCBwb3RlbnRpYWxTaXRlICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICggYmFzZVBhaXJJbmRleCAhPT0gdGhpcy5iYXNlUGFpcnMubGVuZ3RoIC0gMSApIHtcclxuICAgICAgcG90ZW50aWFsU2l0ZSA9IHRoaXMuZ2V0VHJhbnNjcmlwdGlvbkZhY3RvckF0dGFjaG1lbnRTaXRlRm9yQmFzZVBhaXJJbmRleCggYmFzZVBhaXJJbmRleCArIDEsXHJcbiAgICAgICAgdHJhbnNjcmlwdGlvbkZhY3Rvci5nZXRDb25maWcoKSApO1xyXG4gICAgICBpZiAoIHBvdGVudGlhbFNpdGUuYXR0YWNoZWRPckF0dGFjaGluZ01vbGVjdWxlUHJvcGVydHkuZ2V0KCkgPT09IG51bGwgKSB7XHJcbiAgICAgICAgYXR0YWNobWVudFNpdGVzLnB1c2goIHBvdGVudGlhbFNpdGUgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuZWxpbWluYXRlSW52YWxpZEF0dGFjaG1lbnRTaXRlcyggdHJhbnNjcmlwdGlvbkZhY3RvciwgYXR0YWNobWVudFNpdGVzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIHR3byBiYXNlIHBhaXIgYXR0YWNobWVudCBzaXRlcyB0aGF0IGFyZSBuZXh0IHRvIHRoZSBwcm92aWRlZCBvbmUsIGkuZS4gdGhlIG9uZSBiZWZvcmUgaXQgb24gdGhlIEROQVxyXG4gICAqIHN0cmFuZCBhbmQgdGhlIG9uZSBhZnRlciBpdC4gSWYgYXQgb25lIGVuZCBvZiB0aGUgc3RyYW5kLCBvbmx5IG9uZSBzaXRlIHdpbGwgYmUgcmV0dXJuZWQuIE9jY3VwaWVkIHNpdGVzIGFyZSBub3RcclxuICAgKiByZXR1cm5lZC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Um5hUG9seW1lcmFzZX0gcm5hUG9seW1lcmFzZVxyXG4gICAqIEBwYXJhbSAge0F0dGFjaG1lbnRTaXRlfSBhdHRhY2htZW50U2l0ZVxyXG4gICAqIEByZXR1cm5zIHtBcnJheS48QXR0YWNobWVudFNpdGU+fVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRBZGphY2VudEF0dGFjaG1lbnRTaXRlc1JuYVBvbHltZXJhc2UoIHJuYVBvbHltZXJhc2UsIGF0dGFjaG1lbnRTaXRlICkge1xyXG4gICAgY29uc3QgYmFzZVBhaXJJbmRleCA9IHRoaXMuZ2V0QmFzZVBhaXJJbmRleEZyb21YT2Zmc2V0KCBhdHRhY2htZW50U2l0ZS5wb3NpdGlvblByb3BlcnR5LmdldCgpLnggKTtcclxuICAgIGNvbnN0IGF0dGFjaG1lbnRTaXRlcyA9IFtdO1xyXG4gICAgbGV0IHBvdGVudGlhbFNpdGU7XHJcbiAgICBpZiAoIGJhc2VQYWlySW5kZXggIT09IDAgKSB7XHJcbiAgICAgIHBvdGVudGlhbFNpdGUgPSB0aGlzLmdldFJuYVBvbHltZXJhc2VBdHRhY2htZW50U2l0ZUZvckJhc2VQYWlySW5kZXgoIGJhc2VQYWlySW5kZXggLSAxICk7XHJcbiAgICAgIGlmICggcG90ZW50aWFsU2l0ZS5hdHRhY2hlZE9yQXR0YWNoaW5nTW9sZWN1bGVQcm9wZXJ0eS5nZXQoKSA9PT0gbnVsbCApIHtcclxuICAgICAgICBhdHRhY2htZW50U2l0ZXMucHVzaCggcG90ZW50aWFsU2l0ZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoIGJhc2VQYWlySW5kZXggIT09IHRoaXMuYmFzZVBhaXJzLmxlbmd0aCAtIDEgKSB7XHJcbiAgICAgIHBvdGVudGlhbFNpdGUgPSB0aGlzLmdldFJuYVBvbHltZXJhc2VBdHRhY2htZW50U2l0ZUZvckJhc2VQYWlySW5kZXgoIGJhc2VQYWlySW5kZXggKyAxICk7XHJcbiAgICAgIGlmICggcG90ZW50aWFsU2l0ZS5hdHRhY2hlZE9yQXR0YWNoaW5nTW9sZWN1bGVQcm9wZXJ0eS5nZXQoKSA9PT0gbnVsbCApIHtcclxuICAgICAgICBhdHRhY2htZW50U2l0ZXMucHVzaCggcG90ZW50aWFsU2l0ZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRWxpbWluYXRlIHNpdGVzIHRoYXQgd291bGQgcHV0IHRoZSBtb2xlY3VsZSBvdXQgb2YgYm91bmRzIG9yIHdvdWxkIG92ZXJsYXAgd2l0aCBvdGhlciBhdHRhY2hlZCBiaW9tb2xlY3VsZXMuXHJcbiAgICByZXR1cm4gdGhpcy5lbGltaW5hdGVJbnZhbGlkQXR0YWNobWVudFNpdGVzKCBybmFQb2x5bWVyYXNlLCBhdHRhY2htZW50U2l0ZXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBiYXNlUGFpckluZGV4XHJcbiAgICogQHJldHVybnMge0dlbmV9XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBnZXRHZW5lQ29udGFpbmluZ0Jhc2VQYWlyKCBiYXNlUGFpckluZGV4ICkge1xyXG4gICAgbGV0IGdlbmVDb250YWluaW5nQmFzZVBhaXIgPSBudWxsO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5nZW5lcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgZ2VuZSA9IHRoaXMuZ2VuZXNbIGkgXTtcclxuICAgICAgaWYgKCBnZW5lLmNvbnRhaW5zQmFzZVBhaXIoIGJhc2VQYWlySW5kZXggKSApIHtcclxuICAgICAgICBnZW5lQ29udGFpbmluZ0Jhc2VQYWlyID0gZ2VuZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGdlbmVDb250YWluaW5nQmFzZVBhaXI7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYW4gYXR0YWNobWVudCBzaXRlIGluc3RhbmNlIHdpdGggdGhlIGRlZmF1bHQgYWZmaW5pdHkgZm9yIGFsbCBETkEtYXR0YWNoaW5nIGJpb21vbGVjdWxlcyBhdCB0aGUgc3BlY2lmaWVkXHJcbiAgICogeCBvZmZzZXQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0geE9mZnNldFxyXG4gICAqIEByZXR1cm5zIHtBdHRhY2htZW50U2l0ZX1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY3JlYXRlRGVmYXVsdEFmZmluaXR5QXR0YWNobWVudFNpdGUoIHhPZmZzZXQgKSB7XHJcbiAgICByZXR1cm4gbmV3IEF0dGFjaG1lbnRTaXRlKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBuZXcgVmVjdG9yMiggdGhpcy5nZXROZWFyZXN0QmFzZVBhaXJYT2Zmc2V0KCB4T2Zmc2V0ICksXHJcbiAgICAgICAgR0VFQ29uc3RhbnRzLkROQV9NT0xFQ1VMRV9ZX1BPUyApLFxyXG4gICAgICBHRUVDb25zdGFudHMuREVGQVVMVF9BRkZJTklUWVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhIHJlZmVyZW5jZSB0byB0aGUgZ2VuZSB0aGF0IGNvbnRhaW5zIHRoZSBnaXZlbiBwb3NpdGlvbi5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcG9zaXRpb25cclxuICAgKiBAcmV0dXJucyB7R2VuZXxudWxsfSBHZW5lIGF0IHRoZSBwb3NpdGlvbiwgbnVsbCBpZiBubyBnZW5lIGV4aXN0cy5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0R2VuZUF0UG9zaXRpb24oIHBvc2l0aW9uICkge1xyXG5cclxuICAgIC8vIG1ha2Ugc3VyZSB0aGUgcG9zaXRpb24gaXMgcmVhc29uYWJsZVxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydChcclxuICAgIHBvc2l0aW9uLnggPj0gdGhpcy5sZWZ0RWRnZVhPZmZzZXQgJiYgcG9zaXRpb24ueCA8PSB0aGlzLmxlZnRFZGdlWE9mZnNldCArIHRoaXMubW9sZWN1bGVMZW5ndGggJiZcclxuICAgIHBvc2l0aW9uLnkgPj0gR0VFQ29uc3RhbnRzLkROQV9NT0xFQ1VMRV9ZX1BPUyAtIEdFRUNvbnN0YW50cy5ETkFfTU9MRUNVTEVfRElBTUVURVIgLyAyICYmXHJcbiAgICBwb3NpdGlvbi55IDw9IEdFRUNvbnN0YW50cy5ETkFfTU9MRUNVTEVfWV9QT1MgKyBHRUVDb25zdGFudHMuRE5BX01PTEVDVUxFX0RJQU1FVEVSIC8gMixcclxuICAgICAgYHJlcXVlc3RlZCBwb3NpdGlvbiBpcyBub3Qgb24gRE5BIG1vbGVjdWxlOiAke3Bvc2l0aW9ufWBcclxuICAgICk7XHJcblxyXG4gICAgbGV0IGdlbmVBdFBvc2l0aW9uID0gbnVsbDtcclxuICAgIGNvbnN0IGJhc2VQYWlySW5kZXggPSB0aGlzLmdldEJhc2VQYWlySW5kZXhGcm9tWE9mZnNldCggcG9zaXRpb24ueCApO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5nZW5lcy5sZW5ndGggJiYgZ2VuZUF0UG9zaXRpb24gPT09IG51bGw7IGkrKyApIHtcclxuICAgICAgY29uc3QgZ2VuZSA9IHRoaXMuZ2VuZXNbIGkgXTtcclxuICAgICAgaWYgKCBnZW5lLmNvbnRhaW5zQmFzZVBhaXIoIGJhc2VQYWlySW5kZXggKSApIHtcclxuXHJcbiAgICAgICAgLy8gRm91bmQgdGhlIGNvcnJlc3BvbmRpbmcgZ2VuZS5cclxuICAgICAgICBnZW5lQXRQb3NpdGlvbiA9IGdlbmU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBnZW5lQXRQb3NpdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0cyB0aGUgRE5BIE1vbGVjdWxlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5nZW5lcy5mb3JFYWNoKCBnZW5lID0+IHtcclxuICAgICAgZ2VuZS5jbGVhckF0dGFjaG1lbnRTaXRlcygpO1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5zZXBhcmF0aW9ucyA9IFtdO1xyXG4gIH1cclxufVxyXG5cclxuZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzLnJlZ2lzdGVyKCAnRG5hTW9sZWN1bGUnLCBEbmFNb2xlY3VsZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgRG5hTW9sZWN1bGU7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0Msd0JBQXdCLE1BQU0sbUNBQW1DO0FBQ3hFLE9BQU9DLFlBQVksTUFBTSxvQkFBb0I7QUFDN0MsT0FBT0MsY0FBYyxNQUFNLHFCQUFxQjtBQUNoRCxPQUFPQyxRQUFRLE1BQU0sZUFBZTtBQUNwQyxPQUFPQyxjQUFjLE1BQU0scUJBQXFCO0FBQ2hELE9BQU9DLHVCQUF1QixNQUFNLDhCQUE4Qjs7QUFF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