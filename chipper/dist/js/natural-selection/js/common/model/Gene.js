// Copyright 2020-2022, University of Colorado Boulder

/**
 * Gene is the basic physical and functional unit of heredity that is transferred from a parent to its offspring,
 * and controls the expression of a trait. An allele is a variation of a gene. For this sim, we assume that there
 * will only be 2 alleles per gene. Note that gene and allele are often used interchangeably in the literature,
 * but we attempt to use them consistently in this implementation.
 *
 * There is one instance of each gene in the GenePool - i.e., 1 fur gene, 1 ears gene, and 1 teeth gene.
 * A Gene identifies the normal and mutant alleles for the gene, and (if the gene has mutated) defines the
 * dominance relationship between the alleles. See also the 'Mutation' section of model.md at
 * https://github.com/phetsims/natural-selection/blob/master/doc/model.md#mutation
 *
 * Dominance is the effect of one allele masking the expression of a different allele. The first allele is referred
 * to as dominant and the second is recessive. Note that since dominance is a relationship between 2 alleles, it
 * is impossible to have a dominance relationship until the mutation has occurred.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import naturalSelection from '../../naturalSelection.js';
import NaturalSelectionStrings from '../../NaturalSelectionStrings.js';
import NaturalSelectionColors from '../NaturalSelectionColors.js';
import Allele from './Allele.js';

// Untranslated (English) abbreviations of dominant alleles

// Untranslated (English) abbreviations of recessive alleles

// because GeneIO is a subtype of ReferenceIO

export default class Gene extends PhetioObject {
  // properties that are supplied via SelfOptions

  // The dominant allele, null until the gene has mutated.  Until a mutation occurs, only the normal allele exists
  // in the population, and the concepts of dominant and recessive are meaningless.
  // The recessive allele, null until the gene has mutated. Until a mutation occurs, only the normal allele exists
  // in the population, and the concepts of dominant and recessive are meaningless.
  // Is a mutation coming in the next generation of bunnies?
  /**
   * Constructor is private. Use the static factory methods: createFurGene, createEarsGene, createTeethGene
   */
  constructor(providedOptions) {
    const options = optionize()({
      // PhetioObjectOptions
      phetioType: Gene.GeneIO,
      phetioState: false
    }, providedOptions);

    // validate config fields
    assert && assert(options.tandem.name.startsWith(options.tandemPrefix), `tandem name ${options.tandem.name} must start with ${options.tandemPrefix}`);
    super(options);

    // save options to properties
    this.nameProperty = options.nameProperty;
    this.tandemPrefix = options.tandemPrefix;
    this.normalAllele = options.normalAllele;
    this.mutantAllele = options.mutantAllele;
    this.dominantAbbreviationEnglish = options.dominantAbbreviationEnglish;
    this.dominantAbbreviationTranslatedProperty = options.dominantAbbreviationTranslatedProperty;
    this.recessiveAbbreviationEnglish = options.recessiveAbbreviationEnglish;
    this.recessiveAbbreviationTranslatedProperty = options.recessiveAbbreviationTranslatedProperty;
    this.color = options.color;
    this.dominantAlleleProperty = new Property(null, {
      validValues: [null, this.normalAllele, this.mutantAllele],
      tandem: options.tandem.createTandem('dominantAlleleProperty'),
      phetioValueType: NullableIO(Allele.AlleleIO),
      phetioReadOnly: true
    });
    this.recessiveAlleleProperty = new DerivedProperty([this.dominantAlleleProperty], dominantAllele => {
      let recessiveAllele = null;
      if (dominantAllele) {
        recessiveAllele = dominantAllele === this.normalAllele ? this.mutantAllele : this.normalAllele;
      }
      return recessiveAllele;
    }, {
      validValues: [null, this.normalAllele, this.mutantAllele],
      tandem: options.tandem.createTandem('recessiveAlleleProperty'),
      phetioValueType: NullableIO(Allele.AlleleIO)
    });
    this.mutationComingProperty = new BooleanProperty(false, {
      tandem: options.tandem.createTandem('mutationComingProperty'),
      phetioReadOnly: true
    });
  }
  reset() {
    this.dominantAlleleProperty.reset();
    this.mutationComingProperty.reset();
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }

  /**
   * Cancels a mutation that has been scheduled.
   */
  cancelMutation() {
    assert && assert(this.mutationComingProperty.value, `${this.nameProperty.value} mutation is not scheduled`);
    this.reset();
  }

  /**
   * Creates a gene for fur.
   */
  static createFurGene(tandem) {
    return new Gene({
      nameProperty: NaturalSelectionStrings.furStringProperty,
      tandemPrefix: 'fur',
      normalAllele: Allele.WHITE_FUR,
      mutantAllele: Allele.BROWN_FUR,
      dominantAbbreviationEnglish: 'F',
      dominantAbbreviationTranslatedProperty: NaturalSelectionStrings.furDominantStringProperty,
      recessiveAbbreviationEnglish: 'f',
      recessiveAbbreviationTranslatedProperty: NaturalSelectionStrings.furRecessiveStringProperty,
      color: NaturalSelectionColors.FUR,
      tandem: tandem
    });
  }

  /**
   * Creates a gene for ears.
   */
  static createEarsGene(tandem) {
    return new Gene({
      nameProperty: NaturalSelectionStrings.earsStringProperty,
      tandemPrefix: 'ears',
      normalAllele: Allele.STRAIGHT_EARS,
      mutantAllele: Allele.FLOPPY_EARS,
      dominantAbbreviationEnglish: 'E',
      dominantAbbreviationTranslatedProperty: NaturalSelectionStrings.earsDominantStringProperty,
      recessiveAbbreviationEnglish: 'e',
      recessiveAbbreviationTranslatedProperty: NaturalSelectionStrings.earsRecessiveStringProperty,
      color: NaturalSelectionColors.EARS,
      tandem: tandem
    });
  }

  /**
   * Creates a gene for teeth.
   */
  static createTeethGene(tandem) {
    return new Gene({
      nameProperty: NaturalSelectionStrings.teethStringProperty,
      tandemPrefix: 'teeth',
      normalAllele: Allele.SHORT_TEETH,
      mutantAllele: Allele.LONG_TEETH,
      dominantAbbreviationEnglish: 'T',
      dominantAbbreviationTranslatedProperty: NaturalSelectionStrings.teethDominantStringProperty,
      recessiveAbbreviationEnglish: 't',
      recessiveAbbreviationTranslatedProperty: NaturalSelectionStrings.teethRecessiveStringProperty,
      color: NaturalSelectionColors.TEETH,
      tandem: tandem
    });
  }

  /**
   * GeneIO handles PhET-iO serialization of Gene.
   * It implements 'Reference type serialization', as described in the Serialization section of
   * https://github.com/phetsims/phet-io/blob/master/doc/phet-io-instrumentation-technical-guide.md#serialization
   */
  static GeneIO = new IOType('GeneIO', {
    valueType: Gene,
    supertype: ReferenceIO(IOType.ObjectIO)
  });
}
naturalSelection.register('Gene', Gene);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJQcm9wZXJ0eSIsIm9wdGlvbml6ZSIsIlBoZXRpb09iamVjdCIsIklPVHlwZSIsIk51bGxhYmxlSU8iLCJSZWZlcmVuY2VJTyIsIm5hdHVyYWxTZWxlY3Rpb24iLCJOYXR1cmFsU2VsZWN0aW9uU3RyaW5ncyIsIk5hdHVyYWxTZWxlY3Rpb25Db2xvcnMiLCJBbGxlbGUiLCJHZW5lIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwicGhldGlvVHlwZSIsIkdlbmVJTyIsInBoZXRpb1N0YXRlIiwiYXNzZXJ0IiwidGFuZGVtIiwibmFtZSIsInN0YXJ0c1dpdGgiLCJ0YW5kZW1QcmVmaXgiLCJuYW1lUHJvcGVydHkiLCJub3JtYWxBbGxlbGUiLCJtdXRhbnRBbGxlbGUiLCJkb21pbmFudEFiYnJldmlhdGlvbkVuZ2xpc2giLCJkb21pbmFudEFiYnJldmlhdGlvblRyYW5zbGF0ZWRQcm9wZXJ0eSIsInJlY2Vzc2l2ZUFiYnJldmlhdGlvbkVuZ2xpc2giLCJyZWNlc3NpdmVBYmJyZXZpYXRpb25UcmFuc2xhdGVkUHJvcGVydHkiLCJjb2xvciIsImRvbWluYW50QWxsZWxlUHJvcGVydHkiLCJ2YWxpZFZhbHVlcyIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb1ZhbHVlVHlwZSIsIkFsbGVsZUlPIiwicGhldGlvUmVhZE9ubHkiLCJyZWNlc3NpdmVBbGxlbGVQcm9wZXJ0eSIsImRvbWluYW50QWxsZWxlIiwicmVjZXNzaXZlQWxsZWxlIiwibXV0YXRpb25Db21pbmdQcm9wZXJ0eSIsInJlc2V0IiwiZGlzcG9zZSIsImNhbmNlbE11dGF0aW9uIiwidmFsdWUiLCJjcmVhdGVGdXJHZW5lIiwiZnVyU3RyaW5nUHJvcGVydHkiLCJXSElURV9GVVIiLCJCUk9XTl9GVVIiLCJmdXJEb21pbmFudFN0cmluZ1Byb3BlcnR5IiwiZnVyUmVjZXNzaXZlU3RyaW5nUHJvcGVydHkiLCJGVVIiLCJjcmVhdGVFYXJzR2VuZSIsImVhcnNTdHJpbmdQcm9wZXJ0eSIsIlNUUkFJR0hUX0VBUlMiLCJGTE9QUFlfRUFSUyIsImVhcnNEb21pbmFudFN0cmluZ1Byb3BlcnR5IiwiZWFyc1JlY2Vzc2l2ZVN0cmluZ1Byb3BlcnR5IiwiRUFSUyIsImNyZWF0ZVRlZXRoR2VuZSIsInRlZXRoU3RyaW5nUHJvcGVydHkiLCJTSE9SVF9URUVUSCIsIkxPTkdfVEVFVEgiLCJ0ZWV0aERvbWluYW50U3RyaW5nUHJvcGVydHkiLCJ0ZWV0aFJlY2Vzc2l2ZVN0cmluZ1Byb3BlcnR5IiwiVEVFVEgiLCJ2YWx1ZVR5cGUiLCJzdXBlcnR5cGUiLCJPYmplY3RJTyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiR2VuZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBHZW5lIGlzIHRoZSBiYXNpYyBwaHlzaWNhbCBhbmQgZnVuY3Rpb25hbCB1bml0IG9mIGhlcmVkaXR5IHRoYXQgaXMgdHJhbnNmZXJyZWQgZnJvbSBhIHBhcmVudCB0byBpdHMgb2Zmc3ByaW5nLFxyXG4gKiBhbmQgY29udHJvbHMgdGhlIGV4cHJlc3Npb24gb2YgYSB0cmFpdC4gQW4gYWxsZWxlIGlzIGEgdmFyaWF0aW9uIG9mIGEgZ2VuZS4gRm9yIHRoaXMgc2ltLCB3ZSBhc3N1bWUgdGhhdCB0aGVyZVxyXG4gKiB3aWxsIG9ubHkgYmUgMiBhbGxlbGVzIHBlciBnZW5lLiBOb3RlIHRoYXQgZ2VuZSBhbmQgYWxsZWxlIGFyZSBvZnRlbiB1c2VkIGludGVyY2hhbmdlYWJseSBpbiB0aGUgbGl0ZXJhdHVyZSxcclxuICogYnV0IHdlIGF0dGVtcHQgdG8gdXNlIHRoZW0gY29uc2lzdGVudGx5IGluIHRoaXMgaW1wbGVtZW50YXRpb24uXHJcbiAqXHJcbiAqIFRoZXJlIGlzIG9uZSBpbnN0YW5jZSBvZiBlYWNoIGdlbmUgaW4gdGhlIEdlbmVQb29sIC0gaS5lLiwgMSBmdXIgZ2VuZSwgMSBlYXJzIGdlbmUsIGFuZCAxIHRlZXRoIGdlbmUuXHJcbiAqIEEgR2VuZSBpZGVudGlmaWVzIHRoZSBub3JtYWwgYW5kIG11dGFudCBhbGxlbGVzIGZvciB0aGUgZ2VuZSwgYW5kIChpZiB0aGUgZ2VuZSBoYXMgbXV0YXRlZCkgZGVmaW5lcyB0aGVcclxuICogZG9taW5hbmNlIHJlbGF0aW9uc2hpcCBiZXR3ZWVuIHRoZSBhbGxlbGVzLiBTZWUgYWxzbyB0aGUgJ011dGF0aW9uJyBzZWN0aW9uIG9mIG1vZGVsLm1kIGF0XHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9uYXR1cmFsLXNlbGVjdGlvbi9ibG9iL21hc3Rlci9kb2MvbW9kZWwubWQjbXV0YXRpb25cclxuICpcclxuICogRG9taW5hbmNlIGlzIHRoZSBlZmZlY3Qgb2Ygb25lIGFsbGVsZSBtYXNraW5nIHRoZSBleHByZXNzaW9uIG9mIGEgZGlmZmVyZW50IGFsbGVsZS4gVGhlIGZpcnN0IGFsbGVsZSBpcyByZWZlcnJlZFxyXG4gKiB0byBhcyBkb21pbmFudCBhbmQgdGhlIHNlY29uZCBpcyByZWNlc3NpdmUuIE5vdGUgdGhhdCBzaW5jZSBkb21pbmFuY2UgaXMgYSByZWxhdGlvbnNoaXAgYmV0d2VlbiAyIGFsbGVsZXMsIGl0XHJcbiAqIGlzIGltcG9zc2libGUgdG8gaGF2ZSBhIGRvbWluYW5jZSByZWxhdGlvbnNoaXAgdW50aWwgdGhlIG11dGF0aW9uIGhhcyBvY2N1cnJlZC5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgeyBDb2xvciB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBQaGV0aW9PYmplY3QsIHsgUGhldGlvT2JqZWN0T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgTnVsbGFibGVJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvTnVsbGFibGVJTy5qcyc7XHJcbmltcG9ydCBSZWZlcmVuY2VJTywgeyBSZWZlcmVuY2VJT1N0YXRlIH0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1JlZmVyZW5jZUlPLmpzJztcclxuaW1wb3J0IG5hdHVyYWxTZWxlY3Rpb24gZnJvbSAnLi4vLi4vbmF0dXJhbFNlbGVjdGlvbi5qcyc7XHJcbmltcG9ydCBOYXR1cmFsU2VsZWN0aW9uU3RyaW5ncyBmcm9tICcuLi8uLi9OYXR1cmFsU2VsZWN0aW9uU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBOYXR1cmFsU2VsZWN0aW9uQ29sb3JzIGZyb20gJy4uL05hdHVyYWxTZWxlY3Rpb25Db2xvcnMuanMnO1xyXG5pbXBvcnQgQWxsZWxlIGZyb20gJy4vQWxsZWxlLmpzJztcclxuXHJcbi8vIFVudHJhbnNsYXRlZCAoRW5nbGlzaCkgYWJicmV2aWF0aW9ucyBvZiBkb21pbmFudCBhbGxlbGVzXHJcbnR5cGUgRG9taW5hbnRBYmJyZXZpYXRpb25FbmdsaXNoID0gJ0YnIHwgJ0UnIHwgJ1QnO1xyXG5cclxuLy8gVW50cmFuc2xhdGVkIChFbmdsaXNoKSBhYmJyZXZpYXRpb25zIG9mIHJlY2Vzc2l2ZSBhbGxlbGVzXHJcbnR5cGUgUmVjZXNzaXZlQWJicmV2aWF0aW9uRW5nbGlzaCA9ICdmJyB8ICdlJyB8ICd0JztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcblxyXG4gIC8vIHRoZSBuYW1lIG9mIHRoZSBnZW5lLCB2aXNpYmxlIGluIHRoZSBVSVxyXG4gIG5hbWVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPjtcclxuXHJcbiAgLy8gcHJlZml4IHVzZWQgZm9yIHRhbmRlbSBuYW1lcyBmb3IgdGhlIGdlbmUsIGxpa2UgJ2Z1cicgZm9yICdmdXJDaGVja2JveCdcclxuICB0YW5kZW1QcmVmaXg6IHN0cmluZztcclxuXHJcbiAgLy8gdGhlIHN0YW5kYXJkICdub3JtYWwnIG9yICd3aWxkIHR5cGUnIHZhcmlhbnQgb2YgdGhlIGdlbmVcclxuICBub3JtYWxBbGxlbGU6IEFsbGVsZTtcclxuXHJcbiAgLy8gdGhlIG5vbi1zdGFuZGFyZCAnbXV0YW50JyB2YXJpYW50IG9mIHRoZSBnZW5lXHJcbiAgbXV0YW50QWxsZWxlOiBBbGxlbGU7XHJcblxyXG4gIC8vIHRoZSB1bnRyYW5zbGF0ZWQgKEVuZ2xpc2gpIGFiYnJldmlhdGlvbiBvZiB0aGUgZG9taW5hbnQgYWxsZWxlLCB1c2VkIGluIHF1ZXJ5IHBhcmFtZXRlcnNcclxuICBkb21pbmFudEFiYnJldmlhdGlvbkVuZ2xpc2g6IERvbWluYW50QWJicmV2aWF0aW9uRW5nbGlzaDtcclxuXHJcbiAgLy8gdGhlIHRyYW5zbGF0ZWQgYWJicmV2aWF0aW9uIG9mIHRoZSBkb21pbmFudCBhbGxlbGUsIHZpc2libGUgaW4gdGhlIFVJXHJcbiAgZG9taW5hbnRBYmJyZXZpYXRpb25UcmFuc2xhdGVkUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz47XHJcblxyXG4gIC8vIHtzdHJpbmd9IHRoZSB1bnRyYW5zbGF0ZWQgKEVuZ2xpc2gpIGFiYnJldmlhdGlvbiBvZiB0aGUgcmVjZXNzaXZlIGFsbGVsZSwgdXNlZCBpbiBxdWVyeSBwYXJhbWV0ZXJzXHJcbiAgcmVjZXNzaXZlQWJicmV2aWF0aW9uRW5nbGlzaDogUmVjZXNzaXZlQWJicmV2aWF0aW9uRW5nbGlzaDtcclxuXHJcbiAgLy8ge1RSZWFkT25seVByb3BlcnR5PHN0cmluZz59IHRoZSB0cmFuc2xhdGVkIGFiYnJldmlhdGlvbiBvZiB0aGUgcmVjZXNzaXZlIGFsbGVsZSwgdmlzaWJsZSBpbiB0aGUgVUlcclxuICByZWNlc3NpdmVBYmJyZXZpYXRpb25UcmFuc2xhdGVkUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz47XHJcblxyXG4gIC8vIHRoZSBjb2xvciB1c2VkIHRvIGNvbG9yLWNvZGUgdGhpbmdzIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGdlbmUgaW4gdGhlIFVJXHJcbiAgY29sb3I6IENvbG9yIHwgc3RyaW5nO1xyXG59O1xyXG5cclxudHlwZSBHZW5lT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPFBoZXRpb09iamVjdE9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCB0eXBlIEdlbmVTdGF0ZU9iamVjdCA9IFJlZmVyZW5jZUlPU3RhdGU7IC8vIGJlY2F1c2UgR2VuZUlPIGlzIGEgc3VidHlwZSBvZiBSZWZlcmVuY2VJT1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2VuZSBleHRlbmRzIFBoZXRpb09iamVjdCB7XHJcblxyXG4gIC8vIHByb3BlcnRpZXMgdGhhdCBhcmUgc3VwcGxpZWQgdmlhIFNlbGZPcHRpb25zXHJcbiAgcHVibGljIHJlYWRvbmx5IG5hbWVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgdGFuZGVtUHJlZml4OiBzdHJpbmc7XHJcbiAgcHVibGljIHJlYWRvbmx5IG5vcm1hbEFsbGVsZTogQWxsZWxlO1xyXG4gIHB1YmxpYyByZWFkb25seSBtdXRhbnRBbGxlbGU6IEFsbGVsZTtcclxuICBwdWJsaWMgcmVhZG9ubHkgZG9taW5hbnRBYmJyZXZpYXRpb25FbmdsaXNoOiBEb21pbmFudEFiYnJldmlhdGlvbkVuZ2xpc2g7XHJcbiAgcHVibGljIHJlYWRvbmx5IGRvbWluYW50QWJicmV2aWF0aW9uVHJhbnNsYXRlZFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+O1xyXG4gIHB1YmxpYyByZWFkb25seSByZWNlc3NpdmVBYmJyZXZpYXRpb25FbmdsaXNoOiBSZWNlc3NpdmVBYmJyZXZpYXRpb25FbmdsaXNoO1xyXG4gIHB1YmxpYyByZWFkb25seSByZWNlc3NpdmVBYmJyZXZpYXRpb25UcmFuc2xhdGVkUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz47XHJcbiAgcHVibGljIHJlYWRvbmx5IGNvbG9yOiBDb2xvciB8IHN0cmluZztcclxuXHJcbiAgLy8gVGhlIGRvbWluYW50IGFsbGVsZSwgbnVsbCB1bnRpbCB0aGUgZ2VuZSBoYXMgbXV0YXRlZC4gIFVudGlsIGEgbXV0YXRpb24gb2NjdXJzLCBvbmx5IHRoZSBub3JtYWwgYWxsZWxlIGV4aXN0c1xyXG4gIC8vIGluIHRoZSBwb3B1bGF0aW9uLCBhbmQgdGhlIGNvbmNlcHRzIG9mIGRvbWluYW50IGFuZCByZWNlc3NpdmUgYXJlIG1lYW5pbmdsZXNzLlxyXG4gIHB1YmxpYyByZWFkb25seSBkb21pbmFudEFsbGVsZVByb3BlcnR5OiBQcm9wZXJ0eTxBbGxlbGUgfCBudWxsPjtcclxuXHJcbiAgLy8gVGhlIHJlY2Vzc2l2ZSBhbGxlbGUsIG51bGwgdW50aWwgdGhlIGdlbmUgaGFzIG11dGF0ZWQuIFVudGlsIGEgbXV0YXRpb24gb2NjdXJzLCBvbmx5IHRoZSBub3JtYWwgYWxsZWxlIGV4aXN0c1xyXG4gIC8vIGluIHRoZSBwb3B1bGF0aW9uLCBhbmQgdGhlIGNvbmNlcHRzIG9mIGRvbWluYW50IGFuZCByZWNlc3NpdmUgYXJlIG1lYW5pbmdsZXNzLlxyXG4gIHB1YmxpYyByZWFkb25seSByZWNlc3NpdmVBbGxlbGVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8QWxsZWxlIHwgbnVsbD47XHJcblxyXG4gIC8vIElzIGEgbXV0YXRpb24gY29taW5nIGluIHRoZSBuZXh0IGdlbmVyYXRpb24gb2YgYnVubmllcz9cclxuICBwdWJsaWMgcmVhZG9ubHkgbXV0YXRpb25Db21pbmdQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdG9yIGlzIHByaXZhdGUuIFVzZSB0aGUgc3RhdGljIGZhY3RvcnkgbWV0aG9kczogY3JlYXRlRnVyR2VuZSwgY3JlYXRlRWFyc0dlbmUsIGNyZWF0ZVRlZXRoR2VuZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9uczogR2VuZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxHZW5lT3B0aW9ucywgU2VsZk9wdGlvbnMsIFBoZXRpb09iamVjdE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFBoZXRpb09iamVjdE9wdGlvbnNcclxuICAgICAgcGhldGlvVHlwZTogR2VuZS5HZW5lSU8sXHJcbiAgICAgIHBoZXRpb1N0YXRlOiBmYWxzZVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgLy8gdmFsaWRhdGUgY29uZmlnIGZpZWxkc1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy50YW5kZW0ubmFtZS5zdGFydHNXaXRoKCBvcHRpb25zLnRhbmRlbVByZWZpeCApLFxyXG4gICAgICBgdGFuZGVtIG5hbWUgJHtvcHRpb25zLnRhbmRlbS5uYW1lfSBtdXN0IHN0YXJ0IHdpdGggJHtvcHRpb25zLnRhbmRlbVByZWZpeH1gICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBzYXZlIG9wdGlvbnMgdG8gcHJvcGVydGllc1xyXG4gICAgdGhpcy5uYW1lUHJvcGVydHkgPSBvcHRpb25zLm5hbWVQcm9wZXJ0eTtcclxuICAgIHRoaXMudGFuZGVtUHJlZml4ID0gb3B0aW9ucy50YW5kZW1QcmVmaXg7XHJcbiAgICB0aGlzLm5vcm1hbEFsbGVsZSA9IG9wdGlvbnMubm9ybWFsQWxsZWxlO1xyXG4gICAgdGhpcy5tdXRhbnRBbGxlbGUgPSBvcHRpb25zLm11dGFudEFsbGVsZTtcclxuICAgIHRoaXMuZG9taW5hbnRBYmJyZXZpYXRpb25FbmdsaXNoID0gb3B0aW9ucy5kb21pbmFudEFiYnJldmlhdGlvbkVuZ2xpc2g7XHJcbiAgICB0aGlzLmRvbWluYW50QWJicmV2aWF0aW9uVHJhbnNsYXRlZFByb3BlcnR5ID0gb3B0aW9ucy5kb21pbmFudEFiYnJldmlhdGlvblRyYW5zbGF0ZWRQcm9wZXJ0eTtcclxuICAgIHRoaXMucmVjZXNzaXZlQWJicmV2aWF0aW9uRW5nbGlzaCA9IG9wdGlvbnMucmVjZXNzaXZlQWJicmV2aWF0aW9uRW5nbGlzaDtcclxuICAgIHRoaXMucmVjZXNzaXZlQWJicmV2aWF0aW9uVHJhbnNsYXRlZFByb3BlcnR5ID0gb3B0aW9ucy5yZWNlc3NpdmVBYmJyZXZpYXRpb25UcmFuc2xhdGVkUHJvcGVydHk7XHJcbiAgICB0aGlzLmNvbG9yID0gb3B0aW9ucy5jb2xvcjtcclxuXHJcbiAgICB0aGlzLmRvbWluYW50QWxsZWxlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG51bGwsIHtcclxuICAgICAgdmFsaWRWYWx1ZXM6IFsgbnVsbCwgdGhpcy5ub3JtYWxBbGxlbGUsIHRoaXMubXV0YW50QWxsZWxlIF0sXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZG9taW5hbnRBbGxlbGVQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBOdWxsYWJsZUlPKCBBbGxlbGUuQWxsZWxlSU8gKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWVcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnJlY2Vzc2l2ZUFsbGVsZVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyB0aGlzLmRvbWluYW50QWxsZWxlUHJvcGVydHkgXSxcclxuICAgICAgZG9taW5hbnRBbGxlbGUgPT4ge1xyXG4gICAgICAgIGxldCByZWNlc3NpdmVBbGxlbGUgPSBudWxsO1xyXG4gICAgICAgIGlmICggZG9taW5hbnRBbGxlbGUgKSB7XHJcbiAgICAgICAgICByZWNlc3NpdmVBbGxlbGUgPSAoIGRvbWluYW50QWxsZWxlID09PSB0aGlzLm5vcm1hbEFsbGVsZSApID8gdGhpcy5tdXRhbnRBbGxlbGUgOiB0aGlzLm5vcm1hbEFsbGVsZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlY2Vzc2l2ZUFsbGVsZTtcclxuICAgICAgfSwge1xyXG4gICAgICAgIHZhbGlkVmFsdWVzOiBbIG51bGwsIHRoaXMubm9ybWFsQWxsZWxlLCB0aGlzLm11dGFudEFsbGVsZSBdLFxyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncmVjZXNzaXZlQWxsZWxlUHJvcGVydHknICksXHJcbiAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBOdWxsYWJsZUlPKCBBbGxlbGUuQWxsZWxlSU8gKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5tdXRhdGlvbkNvbWluZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdtdXRhdGlvbkNvbWluZ1Byb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5kb21pbmFudEFsbGVsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLm11dGF0aW9uQ29taW5nUHJvcGVydHkucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYW5jZWxzIGEgbXV0YXRpb24gdGhhdCBoYXMgYmVlbiBzY2hlZHVsZWQuXHJcbiAgICovXHJcbiAgcHVibGljIGNhbmNlbE11dGF0aW9uKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5tdXRhdGlvbkNvbWluZ1Byb3BlcnR5LnZhbHVlLCBgJHt0aGlzLm5hbWVQcm9wZXJ0eS52YWx1ZX0gbXV0YXRpb24gaXMgbm90IHNjaGVkdWxlZGAgKTtcclxuICAgIHRoaXMucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBnZW5lIGZvciBmdXIuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBjcmVhdGVGdXJHZW5lKCB0YW5kZW06IFRhbmRlbSApOiBHZW5lIHtcclxuICAgIHJldHVybiBuZXcgR2VuZSgge1xyXG4gICAgICBuYW1lUHJvcGVydHk6IE5hdHVyYWxTZWxlY3Rpb25TdHJpbmdzLmZ1clN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICB0YW5kZW1QcmVmaXg6ICdmdXInLFxyXG4gICAgICBub3JtYWxBbGxlbGU6IEFsbGVsZS5XSElURV9GVVIsXHJcbiAgICAgIG11dGFudEFsbGVsZTogQWxsZWxlLkJST1dOX0ZVUixcclxuICAgICAgZG9taW5hbnRBYmJyZXZpYXRpb25FbmdsaXNoOiAnRicsXHJcbiAgICAgIGRvbWluYW50QWJicmV2aWF0aW9uVHJhbnNsYXRlZFByb3BlcnR5OiBOYXR1cmFsU2VsZWN0aW9uU3RyaW5ncy5mdXJEb21pbmFudFN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICByZWNlc3NpdmVBYmJyZXZpYXRpb25FbmdsaXNoOiAnZicsXHJcbiAgICAgIHJlY2Vzc2l2ZUFiYnJldmlhdGlvblRyYW5zbGF0ZWRQcm9wZXJ0eTogTmF0dXJhbFNlbGVjdGlvblN0cmluZ3MuZnVyUmVjZXNzaXZlU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGNvbG9yOiBOYXR1cmFsU2VsZWN0aW9uQ29sb3JzLkZVUixcclxuICAgICAgdGFuZGVtOiB0YW5kZW1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBnZW5lIGZvciBlYXJzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlRWFyc0dlbmUoIHRhbmRlbTogVGFuZGVtICk6IEdlbmUge1xyXG4gICAgcmV0dXJuIG5ldyBHZW5lKCB7XHJcbiAgICAgIG5hbWVQcm9wZXJ0eTogTmF0dXJhbFNlbGVjdGlvblN0cmluZ3MuZWFyc1N0cmluZ1Byb3BlcnR5LFxyXG4gICAgICB0YW5kZW1QcmVmaXg6ICdlYXJzJyxcclxuICAgICAgbm9ybWFsQWxsZWxlOiBBbGxlbGUuU1RSQUlHSFRfRUFSUyxcclxuICAgICAgbXV0YW50QWxsZWxlOiBBbGxlbGUuRkxPUFBZX0VBUlMsXHJcbiAgICAgIGRvbWluYW50QWJicmV2aWF0aW9uRW5nbGlzaDogJ0UnLFxyXG4gICAgICBkb21pbmFudEFiYnJldmlhdGlvblRyYW5zbGF0ZWRQcm9wZXJ0eTogTmF0dXJhbFNlbGVjdGlvblN0cmluZ3MuZWFyc0RvbWluYW50U3RyaW5nUHJvcGVydHksXHJcbiAgICAgIHJlY2Vzc2l2ZUFiYnJldmlhdGlvbkVuZ2xpc2g6ICdlJyxcclxuICAgICAgcmVjZXNzaXZlQWJicmV2aWF0aW9uVHJhbnNsYXRlZFByb3BlcnR5OiBOYXR1cmFsU2VsZWN0aW9uU3RyaW5ncy5lYXJzUmVjZXNzaXZlU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGNvbG9yOiBOYXR1cmFsU2VsZWN0aW9uQ29sb3JzLkVBUlMsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgZ2VuZSBmb3IgdGVldGguXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBjcmVhdGVUZWV0aEdlbmUoIHRhbmRlbTogVGFuZGVtICk6IEdlbmUge1xyXG4gICAgcmV0dXJuIG5ldyBHZW5lKCB7XHJcbiAgICAgIG5hbWVQcm9wZXJ0eTogTmF0dXJhbFNlbGVjdGlvblN0cmluZ3MudGVldGhTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgdGFuZGVtUHJlZml4OiAndGVldGgnLFxyXG4gICAgICBub3JtYWxBbGxlbGU6IEFsbGVsZS5TSE9SVF9URUVUSCxcclxuICAgICAgbXV0YW50QWxsZWxlOiBBbGxlbGUuTE9OR19URUVUSCxcclxuICAgICAgZG9taW5hbnRBYmJyZXZpYXRpb25FbmdsaXNoOiAnVCcsXHJcbiAgICAgIGRvbWluYW50QWJicmV2aWF0aW9uVHJhbnNsYXRlZFByb3BlcnR5OiBOYXR1cmFsU2VsZWN0aW9uU3RyaW5ncy50ZWV0aERvbWluYW50U3RyaW5nUHJvcGVydHksXHJcbiAgICAgIHJlY2Vzc2l2ZUFiYnJldmlhdGlvbkVuZ2xpc2g6ICd0JyxcclxuICAgICAgcmVjZXNzaXZlQWJicmV2aWF0aW9uVHJhbnNsYXRlZFByb3BlcnR5OiBOYXR1cmFsU2VsZWN0aW9uU3RyaW5ncy50ZWV0aFJlY2Vzc2l2ZVN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBjb2xvcjogTmF0dXJhbFNlbGVjdGlvbkNvbG9ycy5URUVUSCxcclxuICAgICAgdGFuZGVtOiB0YW5kZW1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdlbmVJTyBoYW5kbGVzIFBoRVQtaU8gc2VyaWFsaXphdGlvbiBvZiBHZW5lLlxyXG4gICAqIEl0IGltcGxlbWVudHMgJ1JlZmVyZW5jZSB0eXBlIHNlcmlhbGl6YXRpb24nLCBhcyBkZXNjcmliZWQgaW4gdGhlIFNlcmlhbGl6YXRpb24gc2VjdGlvbiBvZlxyXG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvL2Jsb2IvbWFzdGVyL2RvYy9waGV0LWlvLWluc3RydW1lbnRhdGlvbi10ZWNobmljYWwtZ3VpZGUubWQjc2VyaWFsaXphdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgR2VuZUlPID0gbmV3IElPVHlwZTxHZW5lLCBHZW5lU3RhdGVPYmplY3Q+KCAnR2VuZUlPJywge1xyXG4gICAgdmFsdWVUeXBlOiBHZW5lLFxyXG4gICAgc3VwZXJ0eXBlOiBSZWZlcmVuY2VJTyggSU9UeXBlLk9iamVjdElPIClcclxuICB9ICk7XHJcbn1cclxuXHJcbm5hdHVyYWxTZWxlY3Rpb24ucmVnaXN0ZXIoICdHZW5lJywgR2VuZSApO1xyXG5cclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBRXRELE9BQU9DLFNBQVMsTUFBTSx1Q0FBdUM7QUFHN0QsT0FBT0MsWUFBWSxNQUErQix1Q0FBdUM7QUFFekYsT0FBT0MsTUFBTSxNQUFNLHVDQUF1QztBQUMxRCxPQUFPQyxVQUFVLE1BQU0sMkNBQTJDO0FBQ2xFLE9BQU9DLFdBQVcsTUFBNEIsNENBQTRDO0FBQzFGLE9BQU9DLGdCQUFnQixN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