// Copyright 2015-2021, University of Colorado Boulder

/**
 * This class is the model representation of a gene on a DNA molecule. It consists of a regulatory region and a
 * transcribed region, and it keeps track of where the transcription factors and polymerase attaches, and how strong the
 * affinities are for attachment. In real life, a gene is just a collection of base pairs on the DNA strand.
 *
 * @author John Blanco
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Mohamed Safi
 * @author Aadish Gupta
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import geneExpressionEssentials from '../../geneExpressionEssentials.js';
import GEEConstants from '../GEEConstants.js';
import AttachmentSite from './AttachmentSite.js';
import PlacementHint from './PlacementHint.js';
import RnaPolymerase from './RnaPolymerase.js';
import StubGeneExpressionModel from './StubGeneExpressionModel.js';
import TranscriptionFactor from './TranscriptionFactor.js';
import TranscriptionFactorAttachmentSite from './TranscriptionFactorAttachmentSite.js';
import TranscriptionFactorPlacementHint from './TranscriptionFactorPlacementHint.js';
class Gene {
  /**
   * @param {DnaMolecule} dnaMolecule - The DNA molecule within which this gene exists.
   * @param {Range} regulatoryRegion - The range, in terms of base pairs on the DNA strand, where this region exists.
   * @param {Color} regulatoryRegionColor
   * @param {Range} transcribedRegion - The range, in terms of base pairs on the DNA strand, where this region exists.
   * @param {Color} transcribedRegionColor
   * @param {number} windingAlgorithmParameterSet - algorithm used to wind mRNA produced from this gene
   */
  constructor(dnaMolecule, regulatoryRegion, regulatoryRegionColor, transcribedRegion, transcribedRegionColor, windingAlgorithmParameterSet) {
    // @public (read-only) {Color}
    this.regulatoryRegionColor = regulatoryRegionColor;

    // @public (read-only) {Color}
    this.transcribedRegionColor = transcribedRegionColor;

    // @public (read-only) {number}
    this.windingAlgorithmParameterSet = windingAlgorithmParameterSet;

    // @private {AttachmentSite} - attachment site for polymerase. It is always at the end of the regulatory region.
    this.polymeraseAttachmentSite = new AttachmentSite(dnaMolecule, new Vector2(dnaMolecule.getBasePairXOffsetByIndex(regulatoryRegion.max), GEEConstants.DNA_MOLECULE_Y_POS), 1);

    // @private - internal variables used by the methods
    this.dnaMolecule = dnaMolecule;
    this.regulatoryRegion = regulatoryRegion;
    this.transcribedRegion = transcribedRegion;

    // @private {PlacementHint} - Placement hint for polymerase. There is always only one.  Strictly speaking it is
    // private, but it is accessed by methods to allow it to be portrayed in the view.
    this.rnaPolymerasePlacementHint = new PlacementHint(new RnaPolymerase()); // @private

    // @private {Array.<PlacementHint>} - Placement hint for polymerase. There is always only one.  Strictly speaking
    // this is private, but the hints are accessed by methods to allow them to be portrayed in the view.
    this.transcriptionFactorPlacementHints = [];

    // @private {Array.<TranscriptionFactorAttachmentSite>} - attachment sites for transcription factors, private, but
    // accessible via methods
    this.transcriptionFactorAttachmentSites = []; // @private

    // @private {Object} - Map of transcription factors that interact with this gene to the base pair offset
    // where the TF attaches.
    this.transcriptionFactorMap = {}; // @private

    // @public {Property.<number>}} - Property that determines the affinity of the site where polymerase attaches when the transcription factors
    // support transcription.
    this.polymeraseAffinityProperty = new Property(1.0);

    // Initialize the placement hint for polymerase.
    this.rnaPolymerasePlacementHint.setPosition(this.polymeraseAttachmentSite.positionProperty.get());
  }

  /**
   * Returns the regulatory region color
   * @returns {Color}
   * @public
   */
  getRegulatoryRegionColor() {
    return this.regulatoryRegionColor;
  }

  /**
   * Returns ths transcribed region color
   * @returns {Color}
   * @public
   */
  getTranscribedRegionColor() {
    return this.transcribedRegionColor;
  }

  /**
   * @returns {number}
   * @public
   */
  getCenterX() {
    return this.getStartX() + (this.getEndX() - this.getStartX()) / 2;
  }

  /**
   * @returns {number}
   * @public
   */
  getStartX() {
    return this.dnaMolecule.getBasePairXOffsetByIndex(this.regulatoryRegion.min);
  }

  /**
   * @returns {number}
   * @public
   */
  getEndX() {
    return this.dnaMolecule.getBasePairXOffsetByIndex(this.transcribedRegion.max);
  }

  /**
   * @returns {Range}
   * @public
   */
  getRegulatoryRegion() {
    return this.regulatoryRegion;
  }

  /**
   * @returns {Range}
   * @public
   */
  getTranscribedRegion() {
    return this.transcribedRegion;
  }

  /**
   * Get the attachment site for a base pair that is contained within this gene. In many cases, the affinity of the
   * attachment site will be the same as the default for any DNA, but in some cases it may be especially strong.
   *
   * @param {number} basePairIndex - Index of the base pair on the DNA strand, NOT the index within this gene. In the
   * real world, affinities are associated with sets of base pairs rather than an individual one, so this is a bit of a
   * simplification.
   * @returns {AttachmentSite}
   * @public
   */
  getPolymeraseAttachmentSiteByIndex(basePairIndex) {
    if (basePairIndex === this.regulatoryRegion.max) {
      // This is the last base pair within the regulatory region, which is where the polymerase would begin transcription.
      return this.polymeraseAttachmentSite;
    }

    // There is currently nothing special about this site, so return a default affinity site.
    return this.dnaMolecule.createDefaultAffinityAttachmentSite(this.dnaMolecule.getBasePairXOffsetByIndex(basePairIndex));
  }

  /**
   * Get the attachment site where RNA polymerase would start transcribing the DNA. This is assumes that there is only
   * one such site on the gene.
   *
   * @returns {AttachmentSite}
   * @public
   */
  getPolymeraseAttachmentSite() {
    return this.polymeraseAttachmentSite;
  }

  /**
   * Update the affinity of attachment sites
   * @public
   */
  updateAffinities() {
    // Update the affinity of the polymerase attachment site based upon the state of the transcription factors.
    if (this.transcriptionFactorsSupportTranscription()) {
      this.polymeraseAttachmentSite.affinityProperty.set(this.polymeraseAffinityProperty.get());
    } else {
      this.polymeraseAttachmentSite.affinityProperty.set(GEEConstants.DEFAULT_AFFINITY);
    }
  }

  /**
   * Method used by descendant classes to add positions where transcription factors go on the gene. Generally this is
   * only used during construction.
   *
   * @param {number} basePairOffset - Offset WITHIN THIS GENE where the transcription factor's high affinity site will exist.
   * @param {TranscriptionFactorConfig} tfConfig
   * @protected
   */
  addTranscriptionFactorPosition(basePairOffset, tfConfig) {
    this.transcriptionFactorMap[basePairOffset] = new TranscriptionFactor(null, tfConfig);
    const position = new Vector2(this.dnaMolecule.getBasePairXOffsetByIndex(basePairOffset + this.regulatoryRegion.min), GEEConstants.DNA_MOLECULE_Y_POS);
    this.transcriptionFactorPlacementHints.push(new TranscriptionFactorPlacementHint(new TranscriptionFactor(new StubGeneExpressionModel(), tfConfig, position)));
    this.transcriptionFactorAttachmentSites.push(new TranscriptionFactorAttachmentSite(this.dnaMolecule, position, tfConfig, 1));
  }

  /**
   * Returns true if all positive transcription factors are attached and no negative ones are attached, which indicates
   * that transcription is essentially enabled.
   * @returns {boolean}
   * @public
   */
  transcriptionFactorsSupportTranscription() {
    // In this sim, blocking factors overrule positive factors, so test for those first.
    if (this.transcriptionFactorsBlockTranscription()) {
      return false;
    }

    // Count the number of positive transcription factors needed to enable transcription.
    let numPositiveTranscriptionFactorsNeeded = 0;
    _.values(this.transcriptionFactorMap).forEach(transcriptionFactor => {
      if (transcriptionFactor.getConfig().isPositive) {
        numPositiveTranscriptionFactorsNeeded += 1;
      }
    });

    // Count the number of positive transcription factors attached.
    let numPositiveTranscriptionFactorsAttached = 0;
    this.transcriptionFactorAttachmentSites.forEach(transcriptionFactorAttachmentSite => {
      if (transcriptionFactorAttachmentSite.attachedOrAttachingMoleculeProperty.get() !== null) {
        const tf = transcriptionFactorAttachmentSite.attachedOrAttachingMoleculeProperty.get();

        // there is a very slight difference in the y direction and to mitigate that we use an empirically determined
        // tolerance factor
        if (tf.getPosition().distance(transcriptionFactorAttachmentSite.positionProperty.get()) < 0.001 && tf.isPositive()) {
          numPositiveTranscriptionFactorsAttached += 1;
        }
      }
    });
    return numPositiveTranscriptionFactorsAttached === numPositiveTranscriptionFactorsNeeded;
  }

  /**
   * Evaluate if transcription factors are blocking transcription.
   *
   * @returns {boolean} true if there are transcription factors that block transcription.
   * @private
   */
  transcriptionFactorsBlockTranscription() {
    for (let i = 0; i < this.transcriptionFactorAttachmentSites.length; i++) {
      const transcriptionFactorAttachmentSite = this.transcriptionFactorAttachmentSites[i];
      if (transcriptionFactorAttachmentSite.attachedOrAttachingMoleculeProperty.get() !== null) {
        if (!transcriptionFactorAttachmentSite.attachedOrAttachingMoleculeProperty.get().isPositive()) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get the attachment site for a base pair that is contained within this gene. In many cases, the affinity of the
   * attachment site will be the same as the default for any base pair on the DNA, but if the specified base pair matches
   * the index of the high-affinity site for this transcription factory, it will generally be higher than the default.
   *
   * @param {number} basePairIndex - Index of the base pair on the DNA strand, NOT the index within this gene. In the
   * real world, affinities are associated with sets of base pairs rather than an individual one, so this is a bit of a
   * simplification.
   * @param {TranscriptionFactorConfig} tfConfig
   * @returns {AttachmentSite}
   * @public
   */
  getTranscriptionFactorAttachmentSite(basePairIndex, tfConfig) {
    // Assume a default affinity site until proven otherwise.
    let attachmentSite = this.dnaMolecule.createDefaultAffinityAttachmentSite(this.dnaMolecule.getBasePairXOffsetByIndex(basePairIndex));

    // Determine whether there are any transcription factor attachment sites on this gene that match the specified
    // configuration.
    for (let i = 0; i < this.transcriptionFactorAttachmentSites.length; i++) {
      const transcriptionFactorAttachmentSite = this.transcriptionFactorAttachmentSites[i];
      if (transcriptionFactorAttachmentSite.configurationMatches(tfConfig)) {
        // Found matching site.  Is it available and in the right place?
        if (transcriptionFactorAttachmentSite.attachedOrAttachingMoleculeProperty.get() === null && Math.abs(transcriptionFactorAttachmentSite.positionProperty.get().x - this.dnaMolecule.getBasePairXOffsetByIndex(basePairIndex)) < GEEConstants.DISTANCE_BETWEEN_BASE_PAIRS / 2) {
          // Yes, so this is the site where the given TF should go.
          attachmentSite = transcriptionFactorAttachmentSite;
          break;
        }
      }
    }
    return attachmentSite;
  }

  /**
   * Get the attachment site that is specific to the given transcription factor configuration, if one exists.
   *
   * NOTE: This assumes a max of one site per TF config. This will need to change if multiple identical configs are
   * supported on a single gene.
   *
   * @param {TranscriptionFactorConfig} transcriptionFactorConfig
   * @returns {AttachmentSite} attachment site for the config if present on the gene, null if not.
   * @public
   */
  getMatchingSite(transcriptionFactorConfig) {
    for (let i = 0; i < this.transcriptionFactorAttachmentSites.length; i++) {
      const transcriptionFactorAttachmentSite = this.transcriptionFactorAttachmentSites[i];
      if (transcriptionFactorAttachmentSite.configurationMatches(transcriptionFactorConfig)) {
        return transcriptionFactorAttachmentSite;
      }
    }
    return null;
  }

  /**
   * Get a property that can be used to vary the affinity of the attachment site associated with the specified
   * transcription factor.
   *
   * @param {TranscriptionFactorConfig} tfConfig
   * @returns {Property.<number>}
   * @public
   */
  getTranscriptionFactorAffinityProperty(tfConfig) {
    let affinityProperty = null;
    for (let i = 0; i < this.transcriptionFactorAttachmentSites.length; i++) {
      const transcriptionFactorAttachmentSite = this.transcriptionFactorAttachmentSites[i];
      if (transcriptionFactorAttachmentSite.configurationMatches(tfConfig)) {
        affinityProperty = transcriptionFactorAttachmentSite.affinityProperty;
        // Built-in assumption here: Only one site for given TF config.
        break;
      }
    }
    return affinityProperty;
  }

  /**
   * Get the property that controls the affinity of the site where polymerase binds when initiating transcription.
   * @returns {Property.<number>}
   * @public
   */
  getPolymeraseAffinityProperty() {
    return this.polymeraseAffinityProperty;
  }

  /**
   * @param {number} basePairIndex
   * @returns {boolean}
   * @public
   */
  containsBasePair(basePairIndex) {
    return this.regulatoryRegion.contains(basePairIndex) || this.transcribedRegion.contains(basePairIndex);
  }

  /**
   * Activate any and all placement hints associated with the given biomolecule.
   * @param {MobileBiomolecule} biomolecule
   * @public
   */
  activateHints(biomolecule) {
    if (this.rnaPolymerasePlacementHint.isMatchingBiomolecule(biomolecule)) {
      if (!this.transcriptionFactorsBlockTranscription()) {
        // Activate the polymerase hint.
        this.rnaPolymerasePlacementHint.activeProperty.set(true);

        // Also activate any unoccupied positive transcription factor hints in order to convey to the user that these
        // are needed for transcription to start.
        this.transcriptionFactorAttachmentSites.forEach(transcriptionFactorAttachmentSite => {
          if (transcriptionFactorAttachmentSite.attachedOrAttachingMoleculeProperty.get() === null && transcriptionFactorAttachmentSite.getTfConfig().isPositive) {
            this.activateTranscriptionFactorHint(transcriptionFactorAttachmentSite.getTfConfig());
          }
        });
      }
    } else if (biomolecule instanceof TranscriptionFactor) {
      // Activate hint that matches this transcription factor.
      this.transcriptionFactorPlacementHints.forEach(transcriptionFactorPlacementHint => {
        transcriptionFactorPlacementHint.activateIfMatch(biomolecule);
      });
    }
  }

  /**
   * @param { TranscriptionFactorConfig } tfConfig
   * @private
   */
  activateTranscriptionFactorHint(tfConfig) {
    this.transcriptionFactorPlacementHints.forEach(transcriptionFactorPlacementHint => {
      transcriptionFactorPlacementHint.activateIfConfigMatch(tfConfig);
    });
  }

  /**
   * Deactivate Hints for the biomolecules
   * @public
   */
  deactivateHints() {
    this.rnaPolymerasePlacementHint.activeProperty.set(false);
    this.transcriptionFactorPlacementHints.forEach(transcriptionFactorPlacementHint => {
      transcriptionFactorPlacementHint.activeProperty.set(false);
    });
  }

  /**
   * @returns {Array.<PlacementHint>}
   * @public
   */
  getPlacementHints() {
    const placementHints = [this.rnaPolymerasePlacementHint];
    this.transcriptionFactorPlacementHints.forEach(transcriptionFactorPlacementHint => {
      placementHints.push(transcriptionFactorPlacementHint);
    });
    return placementHints;
  }

  /**
   * Clear the attachment sites, generally only done as part of a reset operation.
   * @public
   */
  clearAttachmentSites() {
    this.polymeraseAttachmentSite.attachedOrAttachingMoleculeProperty.set(null);
    this.transcriptionFactorAttachmentSites.forEach(transcriptionFactorAttachmentSite => {
      transcriptionFactorAttachmentSite.attachedOrAttachingMoleculeProperty.set(null);
    });
  }

  /**
   * Get an instance (a.k.a. a prototype) of the protein associated with this gene.
   * @returns {Protein}
   * @public
   */
  getProteinPrototype() {
    throw new Error('getProteinPrototype should be implemented in descendant classes of Gene .');
  }

  /**
   * Get the list of all transcription factors that have high-affinity binding sites on this gene.
   * @returns {Array.<TranscriptionFactorConfig>}
   * @public
   */
  getTranscriptionFactorConfigs() {
    const configList = [];
    for (const key in this.transcriptionFactorMap) {
      if (this.transcriptionFactorMap.hasOwnProperty(key)) {
        const transcriptionFactor = this.transcriptionFactorMap[key];
        configList.push(transcriptionFactor.getConfig());
      }
    }
    return configList;
  }
}
geneExpressionEssentials.register('Gene', Gene);
export default Gene;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJnZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMiLCJHRUVDb25zdGFudHMiLCJBdHRhY2htZW50U2l0ZSIsIlBsYWNlbWVudEhpbnQiLCJSbmFQb2x5bWVyYXNlIiwiU3R1YkdlbmVFeHByZXNzaW9uTW9kZWwiLCJUcmFuc2NyaXB0aW9uRmFjdG9yIiwiVHJhbnNjcmlwdGlvbkZhY3RvckF0dGFjaG1lbnRTaXRlIiwiVHJhbnNjcmlwdGlvbkZhY3RvclBsYWNlbWVudEhpbnQiLCJHZW5lIiwiY29uc3RydWN0b3IiLCJkbmFNb2xlY3VsZSIsInJlZ3VsYXRvcnlSZWdpb24iLCJyZWd1bGF0b3J5UmVnaW9uQ29sb3IiLCJ0cmFuc2NyaWJlZFJlZ2lvbiIsInRyYW5zY3JpYmVkUmVnaW9uQ29sb3IiLCJ3aW5kaW5nQWxnb3JpdGhtUGFyYW1ldGVyU2V0IiwicG9seW1lcmFzZUF0dGFjaG1lbnRTaXRlIiwiZ2V0QmFzZVBhaXJYT2Zmc2V0QnlJbmRleCIsIm1heCIsIkROQV9NT0xFQ1VMRV9ZX1BPUyIsInJuYVBvbHltZXJhc2VQbGFjZW1lbnRIaW50IiwidHJhbnNjcmlwdGlvbkZhY3RvclBsYWNlbWVudEhpbnRzIiwidHJhbnNjcmlwdGlvbkZhY3RvckF0dGFjaG1lbnRTaXRlcyIsInRyYW5zY3JpcHRpb25GYWN0b3JNYXAiLCJwb2x5bWVyYXNlQWZmaW5pdHlQcm9wZXJ0eSIsInNldFBvc2l0aW9uIiwicG9zaXRpb25Qcm9wZXJ0eSIsImdldCIsImdldFJlZ3VsYXRvcnlSZWdpb25Db2xvciIsImdldFRyYW5zY3JpYmVkUmVnaW9uQ29sb3IiLCJnZXRDZW50ZXJYIiwiZ2V0U3RhcnRYIiwiZ2V0RW5kWCIsIm1pbiIsImdldFJlZ3VsYXRvcnlSZWdpb24iLCJnZXRUcmFuc2NyaWJlZFJlZ2lvbiIsImdldFBvbHltZXJhc2VBdHRhY2htZW50U2l0ZUJ5SW5kZXgiLCJiYXNlUGFpckluZGV4IiwiY3JlYXRlRGVmYXVsdEFmZmluaXR5QXR0YWNobWVudFNpdGUiLCJnZXRQb2x5bWVyYXNlQXR0YWNobWVudFNpdGUiLCJ1cGRhdGVBZmZpbml0aWVzIiwidHJhbnNjcmlwdGlvbkZhY3RvcnNTdXBwb3J0VHJhbnNjcmlwdGlvbiIsImFmZmluaXR5UHJvcGVydHkiLCJzZXQiLCJERUZBVUxUX0FGRklOSVRZIiwiYWRkVHJhbnNjcmlwdGlvbkZhY3RvclBvc2l0aW9uIiwiYmFzZVBhaXJPZmZzZXQiLCJ0ZkNvbmZpZyIsInBvc2l0aW9uIiwicHVzaCIsInRyYW5zY3JpcHRpb25GYWN0b3JzQmxvY2tUcmFuc2NyaXB0aW9uIiwibnVtUG9zaXRpdmVUcmFuc2NyaXB0aW9uRmFjdG9yc05lZWRlZCIsIl8iLCJ2YWx1ZXMiLCJmb3JFYWNoIiwidHJhbnNjcmlwdGlvbkZhY3RvciIsImdldENvbmZpZyIsImlzUG9zaXRpdmUiLCJudW1Qb3NpdGl2ZVRyYW5zY3JpcHRpb25GYWN0b3JzQXR0YWNoZWQiLCJ0cmFuc2NyaXB0aW9uRmFjdG9yQXR0YWNobWVudFNpdGUiLCJhdHRhY2hlZE9yQXR0YWNoaW5nTW9sZWN1bGVQcm9wZXJ0eSIsInRmIiwiZ2V0UG9zaXRpb24iLCJkaXN0YW5jZSIsImkiLCJsZW5ndGgiLCJnZXRUcmFuc2NyaXB0aW9uRmFjdG9yQXR0YWNobWVudFNpdGUiLCJhdHRhY2htZW50U2l0ZSIsImNvbmZpZ3VyYXRpb25NYXRjaGVzIiwiTWF0aCIsImFicyIsIngiLCJESVNUQU5DRV9CRVRXRUVOX0JBU0VfUEFJUlMiLCJnZXRNYXRjaGluZ1NpdGUiLCJ0cmFuc2NyaXB0aW9uRmFjdG9yQ29uZmlnIiwiZ2V0VHJhbnNjcmlwdGlvbkZhY3RvckFmZmluaXR5UHJvcGVydHkiLCJnZXRQb2x5bWVyYXNlQWZmaW5pdHlQcm9wZXJ0eSIsImNvbnRhaW5zQmFzZVBhaXIiLCJjb250YWlucyIsImFjdGl2YXRlSGludHMiLCJiaW9tb2xlY3VsZSIsImlzTWF0Y2hpbmdCaW9tb2xlY3VsZSIsImFjdGl2ZVByb3BlcnR5IiwiZ2V0VGZDb25maWciLCJhY3RpdmF0ZVRyYW5zY3JpcHRpb25GYWN0b3JIaW50IiwidHJhbnNjcmlwdGlvbkZhY3RvclBsYWNlbWVudEhpbnQiLCJhY3RpdmF0ZUlmTWF0Y2giLCJhY3RpdmF0ZUlmQ29uZmlnTWF0Y2giLCJkZWFjdGl2YXRlSGludHMiLCJnZXRQbGFjZW1lbnRIaW50cyIsInBsYWNlbWVudEhpbnRzIiwiY2xlYXJBdHRhY2htZW50U2l0ZXMiLCJnZXRQcm90ZWluUHJvdG90eXBlIiwiRXJyb3IiLCJnZXRUcmFuc2NyaXB0aW9uRmFjdG9yQ29uZmlncyIsImNvbmZpZ0xpc3QiLCJrZXkiLCJoYXNPd25Qcm9wZXJ0eSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiR2VuZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGlzIGNsYXNzIGlzIHRoZSBtb2RlbCByZXByZXNlbnRhdGlvbiBvZiBhIGdlbmUgb24gYSBETkEgbW9sZWN1bGUuIEl0IGNvbnNpc3RzIG9mIGEgcmVndWxhdG9yeSByZWdpb24gYW5kIGFcclxuICogdHJhbnNjcmliZWQgcmVnaW9uLCBhbmQgaXQga2VlcHMgdHJhY2sgb2Ygd2hlcmUgdGhlIHRyYW5zY3JpcHRpb24gZmFjdG9ycyBhbmQgcG9seW1lcmFzZSBhdHRhY2hlcywgYW5kIGhvdyBzdHJvbmcgdGhlXHJcbiAqIGFmZmluaXRpZXMgYXJlIGZvciBhdHRhY2htZW50LiBJbiByZWFsIGxpZmUsIGEgZ2VuZSBpcyBqdXN0IGEgY29sbGVjdGlvbiBvZiBiYXNlIHBhaXJzIG9uIHRoZSBETkEgc3RyYW5kLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgTW9oYW1lZCBTYWZpXHJcbiAqIEBhdXRob3IgQWFkaXNoIEd1cHRhXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBnZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMgZnJvbSAnLi4vLi4vZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzLmpzJztcclxuaW1wb3J0IEdFRUNvbnN0YW50cyBmcm9tICcuLi9HRUVDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQXR0YWNobWVudFNpdGUgZnJvbSAnLi9BdHRhY2htZW50U2l0ZS5qcyc7XHJcbmltcG9ydCBQbGFjZW1lbnRIaW50IGZyb20gJy4vUGxhY2VtZW50SGludC5qcyc7XHJcbmltcG9ydCBSbmFQb2x5bWVyYXNlIGZyb20gJy4vUm5hUG9seW1lcmFzZS5qcyc7XHJcbmltcG9ydCBTdHViR2VuZUV4cHJlc3Npb25Nb2RlbCBmcm9tICcuL1N0dWJHZW5lRXhwcmVzc2lvbk1vZGVsLmpzJztcclxuaW1wb3J0IFRyYW5zY3JpcHRpb25GYWN0b3IgZnJvbSAnLi9UcmFuc2NyaXB0aW9uRmFjdG9yLmpzJztcclxuaW1wb3J0IFRyYW5zY3JpcHRpb25GYWN0b3JBdHRhY2htZW50U2l0ZSBmcm9tICcuL1RyYW5zY3JpcHRpb25GYWN0b3JBdHRhY2htZW50U2l0ZS5qcyc7XHJcbmltcG9ydCBUcmFuc2NyaXB0aW9uRmFjdG9yUGxhY2VtZW50SGludCBmcm9tICcuL1RyYW5zY3JpcHRpb25GYWN0b3JQbGFjZW1lbnRIaW50LmpzJztcclxuXHJcbmNsYXNzIEdlbmUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0RuYU1vbGVjdWxlfSBkbmFNb2xlY3VsZSAtIFRoZSBETkEgbW9sZWN1bGUgd2l0aGluIHdoaWNoIHRoaXMgZ2VuZSBleGlzdHMuXHJcbiAgICogQHBhcmFtIHtSYW5nZX0gcmVndWxhdG9yeVJlZ2lvbiAtIFRoZSByYW5nZSwgaW4gdGVybXMgb2YgYmFzZSBwYWlycyBvbiB0aGUgRE5BIHN0cmFuZCwgd2hlcmUgdGhpcyByZWdpb24gZXhpc3RzLlxyXG4gICAqIEBwYXJhbSB7Q29sb3J9IHJlZ3VsYXRvcnlSZWdpb25Db2xvclxyXG4gICAqIEBwYXJhbSB7UmFuZ2V9IHRyYW5zY3JpYmVkUmVnaW9uIC0gVGhlIHJhbmdlLCBpbiB0ZXJtcyBvZiBiYXNlIHBhaXJzIG9uIHRoZSBETkEgc3RyYW5kLCB3aGVyZSB0aGlzIHJlZ2lvbiBleGlzdHMuXHJcbiAgICogQHBhcmFtIHtDb2xvcn0gdHJhbnNjcmliZWRSZWdpb25Db2xvclxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB3aW5kaW5nQWxnb3JpdGhtUGFyYW1ldGVyU2V0IC0gYWxnb3JpdGhtIHVzZWQgdG8gd2luZCBtUk5BIHByb2R1Y2VkIGZyb20gdGhpcyBnZW5lXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGRuYU1vbGVjdWxlLCByZWd1bGF0b3J5UmVnaW9uLCByZWd1bGF0b3J5UmVnaW9uQ29sb3IsIHRyYW5zY3JpYmVkUmVnaW9uLCB0cmFuc2NyaWJlZFJlZ2lvbkNvbG9yLCB3aW5kaW5nQWxnb3JpdGhtUGFyYW1ldGVyU2V0ICkge1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge0NvbG9yfVxyXG4gICAgdGhpcy5yZWd1bGF0b3J5UmVnaW9uQ29sb3IgPSByZWd1bGF0b3J5UmVnaW9uQ29sb3I7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7Q29sb3J9XHJcbiAgICB0aGlzLnRyYW5zY3JpYmVkUmVnaW9uQ29sb3IgPSB0cmFuc2NyaWJlZFJlZ2lvbkNvbG9yO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge251bWJlcn1cclxuICAgIHRoaXMud2luZGluZ0FsZ29yaXRobVBhcmFtZXRlclNldCA9IHdpbmRpbmdBbGdvcml0aG1QYXJhbWV0ZXJTZXQ7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0F0dGFjaG1lbnRTaXRlfSAtIGF0dGFjaG1lbnQgc2l0ZSBmb3IgcG9seW1lcmFzZS4gSXQgaXMgYWx3YXlzIGF0IHRoZSBlbmQgb2YgdGhlIHJlZ3VsYXRvcnkgcmVnaW9uLlxyXG4gICAgdGhpcy5wb2x5bWVyYXNlQXR0YWNobWVudFNpdGUgPSBuZXcgQXR0YWNobWVudFNpdGUoXHJcbiAgICAgIGRuYU1vbGVjdWxlLFxyXG4gICAgICBuZXcgVmVjdG9yMiggZG5hTW9sZWN1bGUuZ2V0QmFzZVBhaXJYT2Zmc2V0QnlJbmRleCggcmVndWxhdG9yeVJlZ2lvbi5tYXggKSwgR0VFQ29uc3RhbnRzLkROQV9NT0xFQ1VMRV9ZX1BPUyApLFxyXG4gICAgICAxXHJcbiAgICApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gaW50ZXJuYWwgdmFyaWFibGVzIHVzZWQgYnkgdGhlIG1ldGhvZHNcclxuICAgIHRoaXMuZG5hTW9sZWN1bGUgPSBkbmFNb2xlY3VsZTtcclxuICAgIHRoaXMucmVndWxhdG9yeVJlZ2lvbiA9IHJlZ3VsYXRvcnlSZWdpb247XHJcbiAgICB0aGlzLnRyYW5zY3JpYmVkUmVnaW9uID0gdHJhbnNjcmliZWRSZWdpb247XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1BsYWNlbWVudEhpbnR9IC0gUGxhY2VtZW50IGhpbnQgZm9yIHBvbHltZXJhc2UuIFRoZXJlIGlzIGFsd2F5cyBvbmx5IG9uZS4gIFN0cmljdGx5IHNwZWFraW5nIGl0IGlzXHJcbiAgICAvLyBwcml2YXRlLCBidXQgaXQgaXMgYWNjZXNzZWQgYnkgbWV0aG9kcyB0byBhbGxvdyBpdCB0byBiZSBwb3J0cmF5ZWQgaW4gdGhlIHZpZXcuXHJcbiAgICB0aGlzLnJuYVBvbHltZXJhc2VQbGFjZW1lbnRIaW50ID0gbmV3IFBsYWNlbWVudEhpbnQoIG5ldyBSbmFQb2x5bWVyYXNlKCkgKTsgLy8gQHByaXZhdGVcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7QXJyYXkuPFBsYWNlbWVudEhpbnQ+fSAtIFBsYWNlbWVudCBoaW50IGZvciBwb2x5bWVyYXNlLiBUaGVyZSBpcyBhbHdheXMgb25seSBvbmUuICBTdHJpY3RseSBzcGVha2luZ1xyXG4gICAgLy8gdGhpcyBpcyBwcml2YXRlLCBidXQgdGhlIGhpbnRzIGFyZSBhY2Nlc3NlZCBieSBtZXRob2RzIHRvIGFsbG93IHRoZW0gdG8gYmUgcG9ydHJheWVkIGluIHRoZSB2aWV3LlxyXG4gICAgdGhpcy50cmFuc2NyaXB0aW9uRmFjdG9yUGxhY2VtZW50SGludHMgPSBbXTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7QXJyYXkuPFRyYW5zY3JpcHRpb25GYWN0b3JBdHRhY2htZW50U2l0ZT59IC0gYXR0YWNobWVudCBzaXRlcyBmb3IgdHJhbnNjcmlwdGlvbiBmYWN0b3JzLCBwcml2YXRlLCBidXRcclxuICAgIC8vIGFjY2Vzc2libGUgdmlhIG1ldGhvZHNcclxuICAgIHRoaXMudHJhbnNjcmlwdGlvbkZhY3RvckF0dGFjaG1lbnRTaXRlcyA9IFtdOyAvLyBAcHJpdmF0ZVxyXG5cclxuICAgIC8vIEBwcml2YXRlIHtPYmplY3R9IC0gTWFwIG9mIHRyYW5zY3JpcHRpb24gZmFjdG9ycyB0aGF0IGludGVyYWN0IHdpdGggdGhpcyBnZW5lIHRvIHRoZSBiYXNlIHBhaXIgb2Zmc2V0XHJcbiAgICAvLyB3aGVyZSB0aGUgVEYgYXR0YWNoZXMuXHJcbiAgICB0aGlzLnRyYW5zY3JpcHRpb25GYWN0b3JNYXAgPSB7fTsgLy8gQHByaXZhdGVcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48bnVtYmVyPn19IC0gUHJvcGVydHkgdGhhdCBkZXRlcm1pbmVzIHRoZSBhZmZpbml0eSBvZiB0aGUgc2l0ZSB3aGVyZSBwb2x5bWVyYXNlIGF0dGFjaGVzIHdoZW4gdGhlIHRyYW5zY3JpcHRpb24gZmFjdG9yc1xyXG4gICAgLy8gc3VwcG9ydCB0cmFuc2NyaXB0aW9uLlxyXG4gICAgdGhpcy5wb2x5bWVyYXNlQWZmaW5pdHlQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggMS4wICk7XHJcblxyXG4gICAgLy8gSW5pdGlhbGl6ZSB0aGUgcGxhY2VtZW50IGhpbnQgZm9yIHBvbHltZXJhc2UuXHJcbiAgICB0aGlzLnJuYVBvbHltZXJhc2VQbGFjZW1lbnRIaW50LnNldFBvc2l0aW9uKCB0aGlzLnBvbHltZXJhc2VBdHRhY2htZW50U2l0ZS5wb3NpdGlvblByb3BlcnR5LmdldCgpICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSByZWd1bGF0b3J5IHJlZ2lvbiBjb2xvclxyXG4gICAqIEByZXR1cm5zIHtDb2xvcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0UmVndWxhdG9yeVJlZ2lvbkNvbG9yKCkge1xyXG4gICAgcmV0dXJuIHRoaXMucmVndWxhdG9yeVJlZ2lvbkNvbG9yO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aHMgdHJhbnNjcmliZWQgcmVnaW9uIGNvbG9yXHJcbiAgICogQHJldHVybnMge0NvbG9yfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRUcmFuc2NyaWJlZFJlZ2lvbkNvbG9yKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudHJhbnNjcmliZWRSZWdpb25Db2xvcjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldENlbnRlclgoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRTdGFydFgoKSArICggdGhpcy5nZXRFbmRYKCkgLSB0aGlzLmdldFN0YXJ0WCgpICkgLyAyO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0U3RhcnRYKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZG5hTW9sZWN1bGUuZ2V0QmFzZVBhaXJYT2Zmc2V0QnlJbmRleCggdGhpcy5yZWd1bGF0b3J5UmVnaW9uLm1pbiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0RW5kWCgpIHtcclxuICAgIHJldHVybiB0aGlzLmRuYU1vbGVjdWxlLmdldEJhc2VQYWlyWE9mZnNldEJ5SW5kZXgoIHRoaXMudHJhbnNjcmliZWRSZWdpb24ubWF4ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7UmFuZ2V9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFJlZ3VsYXRvcnlSZWdpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5yZWd1bGF0b3J5UmVnaW9uO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHJldHVybnMge1JhbmdlfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRUcmFuc2NyaWJlZFJlZ2lvbigpIHtcclxuICAgIHJldHVybiB0aGlzLnRyYW5zY3JpYmVkUmVnaW9uO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBhdHRhY2htZW50IHNpdGUgZm9yIGEgYmFzZSBwYWlyIHRoYXQgaXMgY29udGFpbmVkIHdpdGhpbiB0aGlzIGdlbmUuIEluIG1hbnkgY2FzZXMsIHRoZSBhZmZpbml0eSBvZiB0aGVcclxuICAgKiBhdHRhY2htZW50IHNpdGUgd2lsbCBiZSB0aGUgc2FtZSBhcyB0aGUgZGVmYXVsdCBmb3IgYW55IEROQSwgYnV0IGluIHNvbWUgY2FzZXMgaXQgbWF5IGJlIGVzcGVjaWFsbHkgc3Ryb25nLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGJhc2VQYWlySW5kZXggLSBJbmRleCBvZiB0aGUgYmFzZSBwYWlyIG9uIHRoZSBETkEgc3RyYW5kLCBOT1QgdGhlIGluZGV4IHdpdGhpbiB0aGlzIGdlbmUuIEluIHRoZVxyXG4gICAqIHJlYWwgd29ybGQsIGFmZmluaXRpZXMgYXJlIGFzc29jaWF0ZWQgd2l0aCBzZXRzIG9mIGJhc2UgcGFpcnMgcmF0aGVyIHRoYW4gYW4gaW5kaXZpZHVhbCBvbmUsIHNvIHRoaXMgaXMgYSBiaXQgb2YgYVxyXG4gICAqIHNpbXBsaWZpY2F0aW9uLlxyXG4gICAqIEByZXR1cm5zIHtBdHRhY2htZW50U2l0ZX1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0UG9seW1lcmFzZUF0dGFjaG1lbnRTaXRlQnlJbmRleCggYmFzZVBhaXJJbmRleCApIHtcclxuICAgIGlmICggYmFzZVBhaXJJbmRleCA9PT0gdGhpcy5yZWd1bGF0b3J5UmVnaW9uLm1heCApIHtcclxuXHJcbiAgICAgIC8vIFRoaXMgaXMgdGhlIGxhc3QgYmFzZSBwYWlyIHdpdGhpbiB0aGUgcmVndWxhdG9yeSByZWdpb24sIHdoaWNoIGlzIHdoZXJlIHRoZSBwb2x5bWVyYXNlIHdvdWxkIGJlZ2luIHRyYW5zY3JpcHRpb24uXHJcbiAgICAgIHJldHVybiB0aGlzLnBvbHltZXJhc2VBdHRhY2htZW50U2l0ZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUaGVyZSBpcyBjdXJyZW50bHkgbm90aGluZyBzcGVjaWFsIGFib3V0IHRoaXMgc2l0ZSwgc28gcmV0dXJuIGEgZGVmYXVsdCBhZmZpbml0eSBzaXRlLlxyXG4gICAgcmV0dXJuIHRoaXMuZG5hTW9sZWN1bGUuY3JlYXRlRGVmYXVsdEFmZmluaXR5QXR0YWNobWVudFNpdGUoXHJcbiAgICAgIHRoaXMuZG5hTW9sZWN1bGUuZ2V0QmFzZVBhaXJYT2Zmc2V0QnlJbmRleCggYmFzZVBhaXJJbmRleCApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGF0dGFjaG1lbnQgc2l0ZSB3aGVyZSBSTkEgcG9seW1lcmFzZSB3b3VsZCBzdGFydCB0cmFuc2NyaWJpbmcgdGhlIEROQS4gVGhpcyBpcyBhc3N1bWVzIHRoYXQgdGhlcmUgaXMgb25seVxyXG4gICAqIG9uZSBzdWNoIHNpdGUgb24gdGhlIGdlbmUuXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7QXR0YWNobWVudFNpdGV9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFBvbHltZXJhc2VBdHRhY2htZW50U2l0ZSgpIHtcclxuICAgIHJldHVybiB0aGlzLnBvbHltZXJhc2VBdHRhY2htZW50U2l0ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB0aGUgYWZmaW5pdHkgb2YgYXR0YWNobWVudCBzaXRlc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICB1cGRhdGVBZmZpbml0aWVzKCkge1xyXG4gICAgLy8gVXBkYXRlIHRoZSBhZmZpbml0eSBvZiB0aGUgcG9seW1lcmFzZSBhdHRhY2htZW50IHNpdGUgYmFzZWQgdXBvbiB0aGUgc3RhdGUgb2YgdGhlIHRyYW5zY3JpcHRpb24gZmFjdG9ycy5cclxuICAgIGlmICggdGhpcy50cmFuc2NyaXB0aW9uRmFjdG9yc1N1cHBvcnRUcmFuc2NyaXB0aW9uKCkgKSB7XHJcbiAgICAgIHRoaXMucG9seW1lcmFzZUF0dGFjaG1lbnRTaXRlLmFmZmluaXR5UHJvcGVydHkuc2V0KCB0aGlzLnBvbHltZXJhc2VBZmZpbml0eVByb3BlcnR5LmdldCgpICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5wb2x5bWVyYXNlQXR0YWNobWVudFNpdGUuYWZmaW5pdHlQcm9wZXJ0eS5zZXQoIEdFRUNvbnN0YW50cy5ERUZBVUxUX0FGRklOSVRZICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNZXRob2QgdXNlZCBieSBkZXNjZW5kYW50IGNsYXNzZXMgdG8gYWRkIHBvc2l0aW9ucyB3aGVyZSB0cmFuc2NyaXB0aW9uIGZhY3RvcnMgZ28gb24gdGhlIGdlbmUuIEdlbmVyYWxseSB0aGlzIGlzXHJcbiAgICogb25seSB1c2VkIGR1cmluZyBjb25zdHJ1Y3Rpb24uXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYmFzZVBhaXJPZmZzZXQgLSBPZmZzZXQgV0lUSElOIFRISVMgR0VORSB3aGVyZSB0aGUgdHJhbnNjcmlwdGlvbiBmYWN0b3IncyBoaWdoIGFmZmluaXR5IHNpdGUgd2lsbCBleGlzdC5cclxuICAgKiBAcGFyYW0ge1RyYW5zY3JpcHRpb25GYWN0b3JDb25maWd9IHRmQ29uZmlnXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqL1xyXG4gIGFkZFRyYW5zY3JpcHRpb25GYWN0b3JQb3NpdGlvbiggYmFzZVBhaXJPZmZzZXQsIHRmQ29uZmlnICkge1xyXG4gICAgdGhpcy50cmFuc2NyaXB0aW9uRmFjdG9yTWFwWyBiYXNlUGFpck9mZnNldCBdID0gbmV3IFRyYW5zY3JpcHRpb25GYWN0b3IoIG51bGwsIHRmQ29uZmlnICk7XHJcbiAgICBjb25zdCBwb3NpdGlvbiA9IG5ldyBWZWN0b3IyKFxyXG4gICAgICB0aGlzLmRuYU1vbGVjdWxlLmdldEJhc2VQYWlyWE9mZnNldEJ5SW5kZXgoIGJhc2VQYWlyT2Zmc2V0ICsgdGhpcy5yZWd1bGF0b3J5UmVnaW9uLm1pbiApLFxyXG4gICAgICBHRUVDb25zdGFudHMuRE5BX01PTEVDVUxFX1lfUE9TXHJcbiAgICApO1xyXG4gICAgdGhpcy50cmFuc2NyaXB0aW9uRmFjdG9yUGxhY2VtZW50SGludHMucHVzaCggbmV3IFRyYW5zY3JpcHRpb25GYWN0b3JQbGFjZW1lbnRIaW50KFxyXG4gICAgICBuZXcgVHJhbnNjcmlwdGlvbkZhY3RvciggbmV3IFN0dWJHZW5lRXhwcmVzc2lvbk1vZGVsKCksIHRmQ29uZmlnLCBwb3NpdGlvbiApXHJcbiAgICApICk7XHJcbiAgICB0aGlzLnRyYW5zY3JpcHRpb25GYWN0b3JBdHRhY2htZW50U2l0ZXMucHVzaChcclxuICAgICAgbmV3IFRyYW5zY3JpcHRpb25GYWN0b3JBdHRhY2htZW50U2l0ZSggdGhpcy5kbmFNb2xlY3VsZSwgcG9zaXRpb24sIHRmQ29uZmlnLCAxIClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgYWxsIHBvc2l0aXZlIHRyYW5zY3JpcHRpb24gZmFjdG9ycyBhcmUgYXR0YWNoZWQgYW5kIG5vIG5lZ2F0aXZlIG9uZXMgYXJlIGF0dGFjaGVkLCB3aGljaCBpbmRpY2F0ZXNcclxuICAgKiB0aGF0IHRyYW5zY3JpcHRpb24gaXMgZXNzZW50aWFsbHkgZW5hYmxlZC5cclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgdHJhbnNjcmlwdGlvbkZhY3RvcnNTdXBwb3J0VHJhbnNjcmlwdGlvbigpIHtcclxuXHJcbiAgICAvLyBJbiB0aGlzIHNpbSwgYmxvY2tpbmcgZmFjdG9ycyBvdmVycnVsZSBwb3NpdGl2ZSBmYWN0b3JzLCBzbyB0ZXN0IGZvciB0aG9zZSBmaXJzdC5cclxuICAgIGlmICggdGhpcy50cmFuc2NyaXB0aW9uRmFjdG9yc0Jsb2NrVHJhbnNjcmlwdGlvbigpICkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ291bnQgdGhlIG51bWJlciBvZiBwb3NpdGl2ZSB0cmFuc2NyaXB0aW9uIGZhY3RvcnMgbmVlZGVkIHRvIGVuYWJsZSB0cmFuc2NyaXB0aW9uLlxyXG4gICAgbGV0IG51bVBvc2l0aXZlVHJhbnNjcmlwdGlvbkZhY3RvcnNOZWVkZWQgPSAwO1xyXG4gICAgXy52YWx1ZXMoIHRoaXMudHJhbnNjcmlwdGlvbkZhY3Rvck1hcCApLmZvckVhY2goIHRyYW5zY3JpcHRpb25GYWN0b3IgPT4ge1xyXG4gICAgICBpZiAoIHRyYW5zY3JpcHRpb25GYWN0b3IuZ2V0Q29uZmlnKCkuaXNQb3NpdGl2ZSApIHtcclxuICAgICAgICBudW1Qb3NpdGl2ZVRyYW5zY3JpcHRpb25GYWN0b3JzTmVlZGVkICs9IDE7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDb3VudCB0aGUgbnVtYmVyIG9mIHBvc2l0aXZlIHRyYW5zY3JpcHRpb24gZmFjdG9ycyBhdHRhY2hlZC5cclxuICAgIGxldCBudW1Qb3NpdGl2ZVRyYW5zY3JpcHRpb25GYWN0b3JzQXR0YWNoZWQgPSAwO1xyXG4gICAgdGhpcy50cmFuc2NyaXB0aW9uRmFjdG9yQXR0YWNobWVudFNpdGVzLmZvckVhY2goIHRyYW5zY3JpcHRpb25GYWN0b3JBdHRhY2htZW50U2l0ZSA9PiB7XHJcbiAgICAgIGlmICggdHJhbnNjcmlwdGlvbkZhY3RvckF0dGFjaG1lbnRTaXRlLmF0dGFjaGVkT3JBdHRhY2hpbmdNb2xlY3VsZVByb3BlcnR5LmdldCgpICE9PSBudWxsICkge1xyXG4gICAgICAgIGNvbnN0IHRmID0gdHJhbnNjcmlwdGlvbkZhY3RvckF0dGFjaG1lbnRTaXRlLmF0dGFjaGVkT3JBdHRhY2hpbmdNb2xlY3VsZVByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgICAgICAvLyB0aGVyZSBpcyBhIHZlcnkgc2xpZ2h0IGRpZmZlcmVuY2UgaW4gdGhlIHkgZGlyZWN0aW9uIGFuZCB0byBtaXRpZ2F0ZSB0aGF0IHdlIHVzZSBhbiBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbiAgICAgICAgLy8gdG9sZXJhbmNlIGZhY3RvclxyXG4gICAgICAgIGlmICggdGYuZ2V0UG9zaXRpb24oKS5kaXN0YW5jZSggdHJhbnNjcmlwdGlvbkZhY3RvckF0dGFjaG1lbnRTaXRlLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKSA8IDAuMDAxICYmXHJcbiAgICAgICAgICAgICB0Zi5pc1Bvc2l0aXZlKCkgKSB7XHJcbiAgICAgICAgICBudW1Qb3NpdGl2ZVRyYW5zY3JpcHRpb25GYWN0b3JzQXR0YWNoZWQgKz0gMTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICByZXR1cm4gbnVtUG9zaXRpdmVUcmFuc2NyaXB0aW9uRmFjdG9yc0F0dGFjaGVkID09PSBudW1Qb3NpdGl2ZVRyYW5zY3JpcHRpb25GYWN0b3JzTmVlZGVkO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRXZhbHVhdGUgaWYgdHJhbnNjcmlwdGlvbiBmYWN0b3JzIGFyZSBibG9ja2luZyB0cmFuc2NyaXB0aW9uLlxyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlcmUgYXJlIHRyYW5zY3JpcHRpb24gZmFjdG9ycyB0aGF0IGJsb2NrIHRyYW5zY3JpcHRpb24uXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB0cmFuc2NyaXB0aW9uRmFjdG9yc0Jsb2NrVHJhbnNjcmlwdGlvbigpIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMudHJhbnNjcmlwdGlvbkZhY3RvckF0dGFjaG1lbnRTaXRlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgdHJhbnNjcmlwdGlvbkZhY3RvckF0dGFjaG1lbnRTaXRlID0gdGhpcy50cmFuc2NyaXB0aW9uRmFjdG9yQXR0YWNobWVudFNpdGVzWyBpIF07XHJcbiAgICAgIGlmICggdHJhbnNjcmlwdGlvbkZhY3RvckF0dGFjaG1lbnRTaXRlLmF0dGFjaGVkT3JBdHRhY2hpbmdNb2xlY3VsZVByb3BlcnR5LmdldCgpICE9PSBudWxsICkge1xyXG4gICAgICAgIGlmICggISggdHJhbnNjcmlwdGlvbkZhY3RvckF0dGFjaG1lbnRTaXRlLmF0dGFjaGVkT3JBdHRhY2hpbmdNb2xlY3VsZVByb3BlcnR5LmdldCgpICkuaXNQb3NpdGl2ZSgpICkge1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBhdHRhY2htZW50IHNpdGUgZm9yIGEgYmFzZSBwYWlyIHRoYXQgaXMgY29udGFpbmVkIHdpdGhpbiB0aGlzIGdlbmUuIEluIG1hbnkgY2FzZXMsIHRoZSBhZmZpbml0eSBvZiB0aGVcclxuICAgKiBhdHRhY2htZW50IHNpdGUgd2lsbCBiZSB0aGUgc2FtZSBhcyB0aGUgZGVmYXVsdCBmb3IgYW55IGJhc2UgcGFpciBvbiB0aGUgRE5BLCBidXQgaWYgdGhlIHNwZWNpZmllZCBiYXNlIHBhaXIgbWF0Y2hlc1xyXG4gICAqIHRoZSBpbmRleCBvZiB0aGUgaGlnaC1hZmZpbml0eSBzaXRlIGZvciB0aGlzIHRyYW5zY3JpcHRpb24gZmFjdG9yeSwgaXQgd2lsbCBnZW5lcmFsbHkgYmUgaGlnaGVyIHRoYW4gdGhlIGRlZmF1bHQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYmFzZVBhaXJJbmRleCAtIEluZGV4IG9mIHRoZSBiYXNlIHBhaXIgb24gdGhlIEROQSBzdHJhbmQsIE5PVCB0aGUgaW5kZXggd2l0aGluIHRoaXMgZ2VuZS4gSW4gdGhlXHJcbiAgICogcmVhbCB3b3JsZCwgYWZmaW5pdGllcyBhcmUgYXNzb2NpYXRlZCB3aXRoIHNldHMgb2YgYmFzZSBwYWlycyByYXRoZXIgdGhhbiBhbiBpbmRpdmlkdWFsIG9uZSwgc28gdGhpcyBpcyBhIGJpdCBvZiBhXHJcbiAgICogc2ltcGxpZmljYXRpb24uXHJcbiAgICogQHBhcmFtIHtUcmFuc2NyaXB0aW9uRmFjdG9yQ29uZmlnfSB0ZkNvbmZpZ1xyXG4gICAqIEByZXR1cm5zIHtBdHRhY2htZW50U2l0ZX1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0VHJhbnNjcmlwdGlvbkZhY3RvckF0dGFjaG1lbnRTaXRlKCBiYXNlUGFpckluZGV4LCB0ZkNvbmZpZyApIHtcclxuICAgIC8vIEFzc3VtZSBhIGRlZmF1bHQgYWZmaW5pdHkgc2l0ZSB1bnRpbCBwcm92ZW4gb3RoZXJ3aXNlLlxyXG4gICAgbGV0IGF0dGFjaG1lbnRTaXRlID0gdGhpcy5kbmFNb2xlY3VsZS5jcmVhdGVEZWZhdWx0QWZmaW5pdHlBdHRhY2htZW50U2l0ZShcclxuICAgICAgdGhpcy5kbmFNb2xlY3VsZS5nZXRCYXNlUGFpclhPZmZzZXRCeUluZGV4KCBiYXNlUGFpckluZGV4ICkgKTtcclxuXHJcbiAgICAvLyBEZXRlcm1pbmUgd2hldGhlciB0aGVyZSBhcmUgYW55IHRyYW5zY3JpcHRpb24gZmFjdG9yIGF0dGFjaG1lbnQgc2l0ZXMgb24gdGhpcyBnZW5lIHRoYXQgbWF0Y2ggdGhlIHNwZWNpZmllZFxyXG4gICAgLy8gY29uZmlndXJhdGlvbi5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMudHJhbnNjcmlwdGlvbkZhY3RvckF0dGFjaG1lbnRTaXRlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgdHJhbnNjcmlwdGlvbkZhY3RvckF0dGFjaG1lbnRTaXRlID0gdGhpcy50cmFuc2NyaXB0aW9uRmFjdG9yQXR0YWNobWVudFNpdGVzWyBpIF07XHJcbiAgICAgIGlmICggdHJhbnNjcmlwdGlvbkZhY3RvckF0dGFjaG1lbnRTaXRlLmNvbmZpZ3VyYXRpb25NYXRjaGVzKCB0ZkNvbmZpZyApICkge1xyXG4gICAgICAgIC8vIEZvdW5kIG1hdGNoaW5nIHNpdGUuICBJcyBpdCBhdmFpbGFibGUgYW5kIGluIHRoZSByaWdodCBwbGFjZT9cclxuICAgICAgICBpZiAoIHRyYW5zY3JpcHRpb25GYWN0b3JBdHRhY2htZW50U2l0ZS5hdHRhY2hlZE9yQXR0YWNoaW5nTW9sZWN1bGVQcm9wZXJ0eS5nZXQoKSA9PT0gbnVsbCAmJlxyXG4gICAgICAgICAgICAgTWF0aC5hYnMoIHRyYW5zY3JpcHRpb25GYWN0b3JBdHRhY2htZW50U2l0ZS5wb3NpdGlvblByb3BlcnR5LmdldCgpLnggLVxyXG4gICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZG5hTW9sZWN1bGUuZ2V0QmFzZVBhaXJYT2Zmc2V0QnlJbmRleCggYmFzZVBhaXJJbmRleCApICkgPFxyXG4gICAgICAgICAgICAgR0VFQ29uc3RhbnRzLkRJU1RBTkNFX0JFVFdFRU5fQkFTRV9QQUlSUyAvIDIgKSB7XHJcblxyXG4gICAgICAgICAgLy8gWWVzLCBzbyB0aGlzIGlzIHRoZSBzaXRlIHdoZXJlIHRoZSBnaXZlbiBURiBzaG91bGQgZ28uXHJcbiAgICAgICAgICBhdHRhY2htZW50U2l0ZSA9IHRyYW5zY3JpcHRpb25GYWN0b3JBdHRhY2htZW50U2l0ZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGF0dGFjaG1lbnRTaXRlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBhdHRhY2htZW50IHNpdGUgdGhhdCBpcyBzcGVjaWZpYyB0byB0aGUgZ2l2ZW4gdHJhbnNjcmlwdGlvbiBmYWN0b3IgY29uZmlndXJhdGlvbiwgaWYgb25lIGV4aXN0cy5cclxuICAgKlxyXG4gICAqIE5PVEU6IFRoaXMgYXNzdW1lcyBhIG1heCBvZiBvbmUgc2l0ZSBwZXIgVEYgY29uZmlnLiBUaGlzIHdpbGwgbmVlZCB0byBjaGFuZ2UgaWYgbXVsdGlwbGUgaWRlbnRpY2FsIGNvbmZpZ3MgYXJlXHJcbiAgICogc3VwcG9ydGVkIG9uIGEgc2luZ2xlIGdlbmUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1RyYW5zY3JpcHRpb25GYWN0b3JDb25maWd9IHRyYW5zY3JpcHRpb25GYWN0b3JDb25maWdcclxuICAgKiBAcmV0dXJucyB7QXR0YWNobWVudFNpdGV9IGF0dGFjaG1lbnQgc2l0ZSBmb3IgdGhlIGNvbmZpZyBpZiBwcmVzZW50IG9uIHRoZSBnZW5lLCBudWxsIGlmIG5vdC5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0TWF0Y2hpbmdTaXRlKCB0cmFuc2NyaXB0aW9uRmFjdG9yQ29uZmlnICkge1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy50cmFuc2NyaXB0aW9uRmFjdG9yQXR0YWNobWVudFNpdGVzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCB0cmFuc2NyaXB0aW9uRmFjdG9yQXR0YWNobWVudFNpdGUgPSB0aGlzLnRyYW5zY3JpcHRpb25GYWN0b3JBdHRhY2htZW50U2l0ZXNbIGkgXTtcclxuICAgICAgaWYgKCB0cmFuc2NyaXB0aW9uRmFjdG9yQXR0YWNobWVudFNpdGUuY29uZmlndXJhdGlvbk1hdGNoZXMoIHRyYW5zY3JpcHRpb25GYWN0b3JDb25maWcgKSApIHtcclxuICAgICAgICByZXR1cm4gdHJhbnNjcmlwdGlvbkZhY3RvckF0dGFjaG1lbnRTaXRlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhIHByb3BlcnR5IHRoYXQgY2FuIGJlIHVzZWQgdG8gdmFyeSB0aGUgYWZmaW5pdHkgb2YgdGhlIGF0dGFjaG1lbnQgc2l0ZSBhc3NvY2lhdGVkIHdpdGggdGhlIHNwZWNpZmllZFxyXG4gICAqIHRyYW5zY3JpcHRpb24gZmFjdG9yLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtUcmFuc2NyaXB0aW9uRmFjdG9yQ29uZmlnfSB0ZkNvbmZpZ1xyXG4gICAqIEByZXR1cm5zIHtQcm9wZXJ0eS48bnVtYmVyPn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0VHJhbnNjcmlwdGlvbkZhY3RvckFmZmluaXR5UHJvcGVydHkoIHRmQ29uZmlnICkge1xyXG4gICAgbGV0IGFmZmluaXR5UHJvcGVydHkgPSBudWxsO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy50cmFuc2NyaXB0aW9uRmFjdG9yQXR0YWNobWVudFNpdGVzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCB0cmFuc2NyaXB0aW9uRmFjdG9yQXR0YWNobWVudFNpdGUgPSB0aGlzLnRyYW5zY3JpcHRpb25GYWN0b3JBdHRhY2htZW50U2l0ZXNbIGkgXTtcclxuICAgICAgaWYgKCB0cmFuc2NyaXB0aW9uRmFjdG9yQXR0YWNobWVudFNpdGUuY29uZmlndXJhdGlvbk1hdGNoZXMoIHRmQ29uZmlnICkgKSB7XHJcbiAgICAgICAgYWZmaW5pdHlQcm9wZXJ0eSA9IHRyYW5zY3JpcHRpb25GYWN0b3JBdHRhY2htZW50U2l0ZS5hZmZpbml0eVByb3BlcnR5O1xyXG4gICAgICAgIC8vIEJ1aWx0LWluIGFzc3VtcHRpb24gaGVyZTogT25seSBvbmUgc2l0ZSBmb3IgZ2l2ZW4gVEYgY29uZmlnLlxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYWZmaW5pdHlQcm9wZXJ0eTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgcHJvcGVydHkgdGhhdCBjb250cm9scyB0aGUgYWZmaW5pdHkgb2YgdGhlIHNpdGUgd2hlcmUgcG9seW1lcmFzZSBiaW5kcyB3aGVuIGluaXRpYXRpbmcgdHJhbnNjcmlwdGlvbi5cclxuICAgKiBAcmV0dXJucyB7UHJvcGVydHkuPG51bWJlcj59XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFBvbHltZXJhc2VBZmZpbml0eVByb3BlcnR5KCkge1xyXG4gICAgcmV0dXJuIHRoaXMucG9seW1lcmFzZUFmZmluaXR5UHJvcGVydHk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYmFzZVBhaXJJbmRleFxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBjb250YWluc0Jhc2VQYWlyKCBiYXNlUGFpckluZGV4ICkge1xyXG4gICAgcmV0dXJuIHRoaXMucmVndWxhdG9yeVJlZ2lvbi5jb250YWlucyggYmFzZVBhaXJJbmRleCApIHx8IHRoaXMudHJhbnNjcmliZWRSZWdpb24uY29udGFpbnMoIGJhc2VQYWlySW5kZXggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFjdGl2YXRlIGFueSBhbmQgYWxsIHBsYWNlbWVudCBoaW50cyBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIGJpb21vbGVjdWxlLlxyXG4gICAqIEBwYXJhbSB7TW9iaWxlQmlvbW9sZWN1bGV9IGJpb21vbGVjdWxlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGFjdGl2YXRlSGludHMoIGJpb21vbGVjdWxlICkge1xyXG4gICAgaWYgKCB0aGlzLnJuYVBvbHltZXJhc2VQbGFjZW1lbnRIaW50LmlzTWF0Y2hpbmdCaW9tb2xlY3VsZSggYmlvbW9sZWN1bGUgKSApIHtcclxuICAgICAgaWYgKCAhdGhpcy50cmFuc2NyaXB0aW9uRmFjdG9yc0Jsb2NrVHJhbnNjcmlwdGlvbigpICkge1xyXG5cclxuICAgICAgICAvLyBBY3RpdmF0ZSB0aGUgcG9seW1lcmFzZSBoaW50LlxyXG4gICAgICAgIHRoaXMucm5hUG9seW1lcmFzZVBsYWNlbWVudEhpbnQuYWN0aXZlUHJvcGVydHkuc2V0KCB0cnVlICk7XHJcblxyXG4gICAgICAgIC8vIEFsc28gYWN0aXZhdGUgYW55IHVub2NjdXBpZWQgcG9zaXRpdmUgdHJhbnNjcmlwdGlvbiBmYWN0b3IgaGludHMgaW4gb3JkZXIgdG8gY29udmV5IHRvIHRoZSB1c2VyIHRoYXQgdGhlc2VcclxuICAgICAgICAvLyBhcmUgbmVlZGVkIGZvciB0cmFuc2NyaXB0aW9uIHRvIHN0YXJ0LlxyXG4gICAgICAgIHRoaXMudHJhbnNjcmlwdGlvbkZhY3RvckF0dGFjaG1lbnRTaXRlcy5mb3JFYWNoKCB0cmFuc2NyaXB0aW9uRmFjdG9yQXR0YWNobWVudFNpdGUgPT4ge1xyXG4gICAgICAgICAgaWYgKCB0cmFuc2NyaXB0aW9uRmFjdG9yQXR0YWNobWVudFNpdGUuYXR0YWNoZWRPckF0dGFjaGluZ01vbGVjdWxlUHJvcGVydHkuZ2V0KCkgPT09IG51bGwgJiZcclxuICAgICAgICAgICAgICAgdHJhbnNjcmlwdGlvbkZhY3RvckF0dGFjaG1lbnRTaXRlLmdldFRmQ29uZmlnKCkuaXNQb3NpdGl2ZSApIHtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmF0ZVRyYW5zY3JpcHRpb25GYWN0b3JIaW50KCB0cmFuc2NyaXB0aW9uRmFjdG9yQXR0YWNobWVudFNpdGUuZ2V0VGZDb25maWcoKSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGJpb21vbGVjdWxlIGluc3RhbmNlb2YgVHJhbnNjcmlwdGlvbkZhY3RvciApIHtcclxuICAgICAgLy8gQWN0aXZhdGUgaGludCB0aGF0IG1hdGNoZXMgdGhpcyB0cmFuc2NyaXB0aW9uIGZhY3Rvci5cclxuICAgICAgdGhpcy50cmFuc2NyaXB0aW9uRmFjdG9yUGxhY2VtZW50SGludHMuZm9yRWFjaCggdHJhbnNjcmlwdGlvbkZhY3RvclBsYWNlbWVudEhpbnQgPT4ge1xyXG4gICAgICAgIHRyYW5zY3JpcHRpb25GYWN0b3JQbGFjZW1lbnRIaW50LmFjdGl2YXRlSWZNYXRjaCggYmlvbW9sZWN1bGUgKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHsgVHJhbnNjcmlwdGlvbkZhY3RvckNvbmZpZyB9IHRmQ29uZmlnXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBhY3RpdmF0ZVRyYW5zY3JpcHRpb25GYWN0b3JIaW50KCB0ZkNvbmZpZyApIHtcclxuICAgIHRoaXMudHJhbnNjcmlwdGlvbkZhY3RvclBsYWNlbWVudEhpbnRzLmZvckVhY2goIHRyYW5zY3JpcHRpb25GYWN0b3JQbGFjZW1lbnRIaW50ID0+IHtcclxuICAgICAgdHJhbnNjcmlwdGlvbkZhY3RvclBsYWNlbWVudEhpbnQuYWN0aXZhdGVJZkNvbmZpZ01hdGNoKCB0ZkNvbmZpZyApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGVhY3RpdmF0ZSBIaW50cyBmb3IgdGhlIGJpb21vbGVjdWxlc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBkZWFjdGl2YXRlSGludHMoKSB7XHJcbiAgICB0aGlzLnJuYVBvbHltZXJhc2VQbGFjZW1lbnRIaW50LmFjdGl2ZVByb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICAgIHRoaXMudHJhbnNjcmlwdGlvbkZhY3RvclBsYWNlbWVudEhpbnRzLmZvckVhY2goIHRyYW5zY3JpcHRpb25GYWN0b3JQbGFjZW1lbnRIaW50ID0+IHtcclxuICAgICAgdHJhbnNjcmlwdGlvbkZhY3RvclBsYWNlbWVudEhpbnQuYWN0aXZlUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHJldHVybnMge0FycmF5LjxQbGFjZW1lbnRIaW50Pn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0UGxhY2VtZW50SGludHMoKSB7XHJcbiAgICBjb25zdCBwbGFjZW1lbnRIaW50cyA9IFsgdGhpcy5ybmFQb2x5bWVyYXNlUGxhY2VtZW50SGludCBdO1xyXG4gICAgdGhpcy50cmFuc2NyaXB0aW9uRmFjdG9yUGxhY2VtZW50SGludHMuZm9yRWFjaCggdHJhbnNjcmlwdGlvbkZhY3RvclBsYWNlbWVudEhpbnQgPT4ge1xyXG4gICAgICBwbGFjZW1lbnRIaW50cy5wdXNoKCB0cmFuc2NyaXB0aW9uRmFjdG9yUGxhY2VtZW50SGludCApO1xyXG4gICAgfSApO1xyXG4gICAgcmV0dXJuIHBsYWNlbWVudEhpbnRzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2xlYXIgdGhlIGF0dGFjaG1lbnQgc2l0ZXMsIGdlbmVyYWxseSBvbmx5IGRvbmUgYXMgcGFydCBvZiBhIHJlc2V0IG9wZXJhdGlvbi5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY2xlYXJBdHRhY2htZW50U2l0ZXMoKSB7XHJcbiAgICB0aGlzLnBvbHltZXJhc2VBdHRhY2htZW50U2l0ZS5hdHRhY2hlZE9yQXR0YWNoaW5nTW9sZWN1bGVQcm9wZXJ0eS5zZXQoIG51bGwgKTtcclxuICAgIHRoaXMudHJhbnNjcmlwdGlvbkZhY3RvckF0dGFjaG1lbnRTaXRlcy5mb3JFYWNoKCB0cmFuc2NyaXB0aW9uRmFjdG9yQXR0YWNobWVudFNpdGUgPT4ge1xyXG4gICAgICB0cmFuc2NyaXB0aW9uRmFjdG9yQXR0YWNobWVudFNpdGUuYXR0YWNoZWRPckF0dGFjaGluZ01vbGVjdWxlUHJvcGVydHkuc2V0KCBudWxsICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYW4gaW5zdGFuY2UgKGEuay5hLiBhIHByb3RvdHlwZSkgb2YgdGhlIHByb3RlaW4gYXNzb2NpYXRlZCB3aXRoIHRoaXMgZ2VuZS5cclxuICAgKiBAcmV0dXJucyB7UHJvdGVpbn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0UHJvdGVpblByb3RvdHlwZSgpIHtcclxuICAgIHRocm93IG5ldyBFcnJvciggJ2dldFByb3RlaW5Qcm90b3R5cGUgc2hvdWxkIGJlIGltcGxlbWVudGVkIGluIGRlc2NlbmRhbnQgY2xhc3NlcyBvZiBHZW5lIC4nICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGxpc3Qgb2YgYWxsIHRyYW5zY3JpcHRpb24gZmFjdG9ycyB0aGF0IGhhdmUgaGlnaC1hZmZpbml0eSBiaW5kaW5nIHNpdGVzIG9uIHRoaXMgZ2VuZS5cclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPFRyYW5zY3JpcHRpb25GYWN0b3JDb25maWc+fVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRUcmFuc2NyaXB0aW9uRmFjdG9yQ29uZmlncygpIHtcclxuICAgIGNvbnN0IGNvbmZpZ0xpc3QgPSBbXTtcclxuICAgIGZvciAoIGNvbnN0IGtleSBpbiB0aGlzLnRyYW5zY3JpcHRpb25GYWN0b3JNYXAgKSB7XHJcbiAgICAgIGlmICggdGhpcy50cmFuc2NyaXB0aW9uRmFjdG9yTWFwLmhhc093blByb3BlcnR5KCBrZXkgKSApIHtcclxuICAgICAgICBjb25zdCB0cmFuc2NyaXB0aW9uRmFjdG9yID0gdGhpcy50cmFuc2NyaXB0aW9uRmFjdG9yTWFwWyBrZXkgXTtcclxuICAgICAgICBjb25maWdMaXN0LnB1c2goIHRyYW5zY3JpcHRpb25GYWN0b3IuZ2V0Q29uZmlnKCkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGNvbmZpZ0xpc3Q7XHJcbiAgfVxyXG59XHJcblxyXG5nZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMucmVnaXN0ZXIoICdHZW5lJywgR2VuZSApO1xyXG5cclxuZXhw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