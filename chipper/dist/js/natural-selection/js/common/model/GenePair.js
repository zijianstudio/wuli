// Copyright 2020-2022, University of Colorado Boulder

/**
 * GenePair is a pair of alleles for a specific Gene, one inherited from each parent.
 * If an individual's alleles are identical, it is homozygous. If its alleles are different, it is heterozygous.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import naturalSelection from '../../naturalSelection.js';
import Allele from './Allele.js';
import Gene from './Gene.js';
export default class GenePair extends PhetioObject {
  // Private because applyState must restore it, but clients should not be able to set it.

  constructor(gene, fatherAllele, motherAllele, providedOptions) {
    const options = optionize()({
      // PhetioObjectOptions
      phetioType: GenePair.GenePairIO
    }, providedOptions);
    super(options);
    this._gene = gene;
    this.fatherAllele = fatherAllele;
    this.motherAllele = motherAllele;
  }
  get gene() {
    return this._gene;
  }

  /**
   * Mutates the gene pair.
   */
  mutate(mutantAllele) {
    // The mutation is randomly applied to either the father or mother allele, but not both. If the mutant allele is
    // recessive, the mutation will not immediately affect appearance. It appears in the phenotype in some later
    // generation, when a homozygous recessive bunny is born.
    if (dotRandom.nextBoolean()) {
      this.fatherAllele = mutantAllele;
    } else {
      this.motherAllele = mutantAllele;
    }
  }

  /**
   * Is this gene pair homozygous (same alleles)?
   */
  isHomozygous() {
    return this.fatherAllele === this.motherAllele;
  }

  /**
   * Is this gene pair heterozygous (different alleles)?
   */
  isHeterozygous() {
    return this.fatherAllele !== this.motherAllele;
  }

  /**
   * Gets the allele that determines the bunny's appearance. This is how genotype manifests as phenotype.
   */
  getVisibleAllele() {
    if (this.isHomozygous()) {
      return this.fatherAllele;
    } else {
      const dominantAllele = this.gene.dominantAlleleProperty.value;
      assert && assert(dominantAllele !== null, 'dominantAllele should not be null');
      return dominantAllele;
    }
  }

  /**
   * Does this gene pair contain a specific allele?
   */
  hasAllele(allele) {
    return this.fatherAllele === allele || this.motherAllele === allele;
  }

  /**
   * Gets the genotype abbreviation for the alleles in this gene pair. If there is no dominant gene (and therefore
   * no dominance relationship), then an abbreviation is meaningless, and the empty string is returned.
   * @param translated - true = translated (default), false = untranslated
   */
  getGenotypeAbbreviation(translated = true) {
    const dominantAbbreviation = translated ? this.gene.dominantAbbreviationTranslatedProperty.value : this.gene.dominantAbbreviationEnglish;
    const recessiveAbbreviation = translated ? this.gene.recessiveAbbreviationTranslatedProperty.value : this.gene.recessiveAbbreviationEnglish;
    let s = '';
    const dominantAllele = this.gene.dominantAlleleProperty.value;
    if (dominantAllele) {
      s = this.fatherAllele === dominantAllele ? dominantAbbreviation : recessiveAbbreviation;
      s += this.motherAllele === dominantAllele ? dominantAbbreviation : recessiveAbbreviation;
    }
    return s;
  }

  //--------------------------------------------------------------------------------------------------------------------
  // Below here are methods used by GenePairIO to serialize PhET-iO state.
  //--------------------------------------------------------------------------------------------------------------------

  /**
   * Serializes a GenePair instance.
   * Because this._gene is private, it does not match the gene field name in stateSchema, and we cannot use
   * the default implementation of toStateObject.
   */
  toStateObject() {
    return {
      gene: Gene.GeneIO.toStateObject(this._gene),
      fatherAllele: Allele.AlleleIO.toStateObject(this.fatherAllele),
      motherAllele: Allele.AlleleIO.toStateObject(this.motherAllele)
    };
  }

  /**
   * Restores GenePair state after instantiation.
   */
  applyState(stateObject) {
    this._gene = Gene.GeneIO.fromStateObject(stateObject.gene);
    this.fatherAllele = Allele.AlleleIO.fromStateObject(stateObject.fatherAllele);
    this.motherAllele = Allele.AlleleIO.fromStateObject(stateObject.motherAllele);
  }

  /**
   * GenePairIO handles PhET-iO serialization of GenePair.
   * It implements 'Dynamic element serialization', as described in the Serialization section of
   * https://github.com/phetsims/phet-io/blob/master/doc/phet-io-instrumentation-technical-guide.md#serialization
   */
  static GenePairIO = new IOType('GenePairIO', {
    valueType: GenePair,
    stateSchema: {
      gene: Gene.GeneIO,
      fatherAllele: Allele.AlleleIO,
      motherAllele: Allele.AlleleIO
    },
    toStateObject: genePair => genePair.toStateObject(),
    applyState: (genePair, stateObject) => genePair.applyState(stateObject)
  });
}
naturalSelection.register('GenePair', GenePair);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3RSYW5kb20iLCJvcHRpb25pemUiLCJQaGV0aW9PYmplY3QiLCJJT1R5cGUiLCJuYXR1cmFsU2VsZWN0aW9uIiwiQWxsZWxlIiwiR2VuZSIsIkdlbmVQYWlyIiwiY29uc3RydWN0b3IiLCJnZW5lIiwiZmF0aGVyQWxsZWxlIiwibW90aGVyQWxsZWxlIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInBoZXRpb1R5cGUiLCJHZW5lUGFpcklPIiwiX2dlbmUiLCJtdXRhdGUiLCJtdXRhbnRBbGxlbGUiLCJuZXh0Qm9vbGVhbiIsImlzSG9tb3p5Z291cyIsImlzSGV0ZXJvenlnb3VzIiwiZ2V0VmlzaWJsZUFsbGVsZSIsImRvbWluYW50QWxsZWxlIiwiZG9taW5hbnRBbGxlbGVQcm9wZXJ0eSIsInZhbHVlIiwiYXNzZXJ0IiwiaGFzQWxsZWxlIiwiYWxsZWxlIiwiZ2V0R2Vub3R5cGVBYmJyZXZpYXRpb24iLCJ0cmFuc2xhdGVkIiwiZG9taW5hbnRBYmJyZXZpYXRpb24iLCJkb21pbmFudEFiYnJldmlhdGlvblRyYW5zbGF0ZWRQcm9wZXJ0eSIsImRvbWluYW50QWJicmV2aWF0aW9uRW5nbGlzaCIsInJlY2Vzc2l2ZUFiYnJldmlhdGlvbiIsInJlY2Vzc2l2ZUFiYnJldmlhdGlvblRyYW5zbGF0ZWRQcm9wZXJ0eSIsInJlY2Vzc2l2ZUFiYnJldmlhdGlvbkVuZ2xpc2giLCJzIiwidG9TdGF0ZU9iamVjdCIsIkdlbmVJTyIsIkFsbGVsZUlPIiwiYXBwbHlTdGF0ZSIsInN0YXRlT2JqZWN0IiwiZnJvbVN0YXRlT2JqZWN0IiwidmFsdWVUeXBlIiwic3RhdGVTY2hlbWEiLCJnZW5lUGFpciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiR2VuZVBhaXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogR2VuZVBhaXIgaXMgYSBwYWlyIG9mIGFsbGVsZXMgZm9yIGEgc3BlY2lmaWMgR2VuZSwgb25lIGluaGVyaXRlZCBmcm9tIGVhY2ggcGFyZW50LlxyXG4gKiBJZiBhbiBpbmRpdmlkdWFsJ3MgYWxsZWxlcyBhcmUgaWRlbnRpY2FsLCBpdCBpcyBob21venlnb3VzLiBJZiBpdHMgYWxsZWxlcyBhcmUgZGlmZmVyZW50LCBpdCBpcyBoZXRlcm96eWdvdXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBQaGV0aW9PYmplY3QsIHsgUGhldGlvT2JqZWN0T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgbmF0dXJhbFNlbGVjdGlvbiBmcm9tICcuLi8uLi9uYXR1cmFsU2VsZWN0aW9uLmpzJztcclxuaW1wb3J0IEFsbGVsZSwgeyBBbGxlbGVTdGF0ZU9iamVjdCB9IGZyb20gJy4vQWxsZWxlLmpzJztcclxuaW1wb3J0IEdlbmUsIHsgR2VuZVN0YXRlT2JqZWN0IH0gZnJvbSAnLi9HZW5lLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBHZW5lUGFpck9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmXHJcbiAgUGlja1JlcXVpcmVkPFBoZXRpb09iamVjdE9wdGlvbnMsICd0YW5kZW0nIHwgJ3BoZXRpb0RvY3VtZW50YXRpb24nPjtcclxuXHJcbnR5cGUgR2VuZVBhaXJTdGF0ZU9iamVjdCA9IHtcclxuICBnZW5lOiBHZW5lU3RhdGVPYmplY3Q7XHJcbiAgZmF0aGVyQWxsZWxlOiBBbGxlbGVTdGF0ZU9iamVjdDtcclxuICBtb3RoZXJBbGxlbGU6IEFsbGVsZVN0YXRlT2JqZWN0O1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2VuZVBhaXIgZXh0ZW5kcyBQaGV0aW9PYmplY3Qge1xyXG5cclxuICAvLyBQcml2YXRlIGJlY2F1c2UgYXBwbHlTdGF0ZSBtdXN0IHJlc3RvcmUgaXQsIGJ1dCBjbGllbnRzIHNob3VsZCBub3QgYmUgYWJsZSB0byBzZXQgaXQuXHJcbiAgcHJpdmF0ZSBfZ2VuZTogR2VuZTtcclxuXHJcbiAgcHVibGljIGZhdGhlckFsbGVsZTogQWxsZWxlO1xyXG4gIHB1YmxpYyBtb3RoZXJBbGxlbGU6IEFsbGVsZTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBnZW5lOiBHZW5lLCBmYXRoZXJBbGxlbGU6IEFsbGVsZSwgbW90aGVyQWxsZWxlOiBBbGxlbGUsIHByb3ZpZGVkT3B0aW9uczogR2VuZVBhaXJPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8R2VuZVBhaXJPcHRpb25zLCBTZWxmT3B0aW9ucywgUGhldGlvT2JqZWN0T3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gUGhldGlvT2JqZWN0T3B0aW9uc1xyXG4gICAgICBwaGV0aW9UeXBlOiBHZW5lUGFpci5HZW5lUGFpcklPXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuX2dlbmUgPSBnZW5lO1xyXG4gICAgdGhpcy5mYXRoZXJBbGxlbGUgPSBmYXRoZXJBbGxlbGU7XHJcbiAgICB0aGlzLm1vdGhlckFsbGVsZSA9IG1vdGhlckFsbGVsZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgZ2VuZSgpOiBHZW5lIHsgcmV0dXJuIHRoaXMuX2dlbmU7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogTXV0YXRlcyB0aGUgZ2VuZSBwYWlyLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBtdXRhdGUoIG11dGFudEFsbGVsZTogQWxsZWxlICk6IHZvaWQge1xyXG5cclxuICAgIC8vIFRoZSBtdXRhdGlvbiBpcyByYW5kb21seSBhcHBsaWVkIHRvIGVpdGhlciB0aGUgZmF0aGVyIG9yIG1vdGhlciBhbGxlbGUsIGJ1dCBub3QgYm90aC4gSWYgdGhlIG11dGFudCBhbGxlbGUgaXNcclxuICAgIC8vIHJlY2Vzc2l2ZSwgdGhlIG11dGF0aW9uIHdpbGwgbm90IGltbWVkaWF0ZWx5IGFmZmVjdCBhcHBlYXJhbmNlLiBJdCBhcHBlYXJzIGluIHRoZSBwaGVub3R5cGUgaW4gc29tZSBsYXRlclxyXG4gICAgLy8gZ2VuZXJhdGlvbiwgd2hlbiBhIGhvbW96eWdvdXMgcmVjZXNzaXZlIGJ1bm55IGlzIGJvcm4uXHJcbiAgICBpZiAoIGRvdFJhbmRvbS5uZXh0Qm9vbGVhbigpICkge1xyXG4gICAgICB0aGlzLmZhdGhlckFsbGVsZSA9IG11dGFudEFsbGVsZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLm1vdGhlckFsbGVsZSA9IG11dGFudEFsbGVsZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIElzIHRoaXMgZ2VuZSBwYWlyIGhvbW96eWdvdXMgKHNhbWUgYWxsZWxlcyk/XHJcbiAgICovXHJcbiAgcHVibGljIGlzSG9tb3p5Z291cygpOiBib29sZWFuIHtcclxuICAgIHJldHVybiAoIHRoaXMuZmF0aGVyQWxsZWxlID09PSB0aGlzLm1vdGhlckFsbGVsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSXMgdGhpcyBnZW5lIHBhaXIgaGV0ZXJvenlnb3VzIChkaWZmZXJlbnQgYWxsZWxlcyk/XHJcbiAgICovXHJcbiAgcHVibGljIGlzSGV0ZXJvenlnb3VzKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICggdGhpcy5mYXRoZXJBbGxlbGUgIT09IHRoaXMubW90aGVyQWxsZWxlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBhbGxlbGUgdGhhdCBkZXRlcm1pbmVzIHRoZSBidW5ueSdzIGFwcGVhcmFuY2UuIFRoaXMgaXMgaG93IGdlbm90eXBlIG1hbmlmZXN0cyBhcyBwaGVub3R5cGUuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFZpc2libGVBbGxlbGUoKTogQWxsZWxlIHtcclxuICAgIGlmICggdGhpcy5pc0hvbW96eWdvdXMoKSApIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZmF0aGVyQWxsZWxlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGNvbnN0IGRvbWluYW50QWxsZWxlID0gdGhpcy5nZW5lLmRvbWluYW50QWxsZWxlUHJvcGVydHkudmFsdWUhO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkb21pbmFudEFsbGVsZSAhPT0gbnVsbCwgJ2RvbWluYW50QWxsZWxlIHNob3VsZCBub3QgYmUgbnVsbCcgKTtcclxuICAgICAgcmV0dXJuIGRvbWluYW50QWxsZWxlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRG9lcyB0aGlzIGdlbmUgcGFpciBjb250YWluIGEgc3BlY2lmaWMgYWxsZWxlP1xyXG4gICAqL1xyXG4gIHB1YmxpYyBoYXNBbGxlbGUoIGFsbGVsZTogQWxsZWxlIHwgbnVsbCApOiBib29sZWFuIHtcclxuICAgIHJldHVybiAoIHRoaXMuZmF0aGVyQWxsZWxlID09PSBhbGxlbGUgfHwgdGhpcy5tb3RoZXJBbGxlbGUgPT09IGFsbGVsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgZ2Vub3R5cGUgYWJicmV2aWF0aW9uIGZvciB0aGUgYWxsZWxlcyBpbiB0aGlzIGdlbmUgcGFpci4gSWYgdGhlcmUgaXMgbm8gZG9taW5hbnQgZ2VuZSAoYW5kIHRoZXJlZm9yZVxyXG4gICAqIG5vIGRvbWluYW5jZSByZWxhdGlvbnNoaXApLCB0aGVuIGFuIGFiYnJldmlhdGlvbiBpcyBtZWFuaW5nbGVzcywgYW5kIHRoZSBlbXB0eSBzdHJpbmcgaXMgcmV0dXJuZWQuXHJcbiAgICogQHBhcmFtIHRyYW5zbGF0ZWQgLSB0cnVlID0gdHJhbnNsYXRlZCAoZGVmYXVsdCksIGZhbHNlID0gdW50cmFuc2xhdGVkXHJcbiAgICovXHJcbiAgcHVibGljIGdldEdlbm90eXBlQWJicmV2aWF0aW9uKCB0cmFuc2xhdGVkID0gdHJ1ZSApOiBzdHJpbmcge1xyXG5cclxuICAgIGNvbnN0IGRvbWluYW50QWJicmV2aWF0aW9uID0gdHJhbnNsYXRlZCA/IHRoaXMuZ2VuZS5kb21pbmFudEFiYnJldmlhdGlvblRyYW5zbGF0ZWRQcm9wZXJ0eS52YWx1ZSA6IHRoaXMuZ2VuZS5kb21pbmFudEFiYnJldmlhdGlvbkVuZ2xpc2g7XHJcbiAgICBjb25zdCByZWNlc3NpdmVBYmJyZXZpYXRpb24gPSB0cmFuc2xhdGVkID8gdGhpcy5nZW5lLnJlY2Vzc2l2ZUFiYnJldmlhdGlvblRyYW5zbGF0ZWRQcm9wZXJ0eS52YWx1ZSA6IHRoaXMuZ2VuZS5yZWNlc3NpdmVBYmJyZXZpYXRpb25FbmdsaXNoO1xyXG5cclxuICAgIGxldCBzID0gJyc7XHJcbiAgICBjb25zdCBkb21pbmFudEFsbGVsZSA9IHRoaXMuZ2VuZS5kb21pbmFudEFsbGVsZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgaWYgKCBkb21pbmFudEFsbGVsZSApIHtcclxuICAgICAgcyA9ICggdGhpcy5mYXRoZXJBbGxlbGUgPT09IGRvbWluYW50QWxsZWxlICkgPyBkb21pbmFudEFiYnJldmlhdGlvbiA6IHJlY2Vzc2l2ZUFiYnJldmlhdGlvbjtcclxuICAgICAgcyArPSAoIHRoaXMubW90aGVyQWxsZWxlID09PSBkb21pbmFudEFsbGVsZSApID8gZG9taW5hbnRBYmJyZXZpYXRpb24gOiByZWNlc3NpdmVBYmJyZXZpYXRpb247XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcztcclxuICB9XHJcblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBCZWxvdyBoZXJlIGFyZSBtZXRob2RzIHVzZWQgYnkgR2VuZVBhaXJJTyB0byBzZXJpYWxpemUgUGhFVC1pTyBzdGF0ZS5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIC8qKlxyXG4gICAqIFNlcmlhbGl6ZXMgYSBHZW5lUGFpciBpbnN0YW5jZS5cclxuICAgKiBCZWNhdXNlIHRoaXMuX2dlbmUgaXMgcHJpdmF0ZSwgaXQgZG9lcyBub3QgbWF0Y2ggdGhlIGdlbmUgZmllbGQgbmFtZSBpbiBzdGF0ZVNjaGVtYSwgYW5kIHdlIGNhbm5vdCB1c2VcclxuICAgKiB0aGUgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBvZiB0b1N0YXRlT2JqZWN0LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgdG9TdGF0ZU9iamVjdCgpOiBHZW5lUGFpclN0YXRlT2JqZWN0IHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGdlbmU6IEdlbmUuR2VuZUlPLnRvU3RhdGVPYmplY3QoIHRoaXMuX2dlbmUgKSxcclxuICAgICAgZmF0aGVyQWxsZWxlOiBBbGxlbGUuQWxsZWxlSU8udG9TdGF0ZU9iamVjdCggdGhpcy5mYXRoZXJBbGxlbGUgKSxcclxuICAgICAgbW90aGVyQWxsZWxlOiBBbGxlbGUuQWxsZWxlSU8udG9TdGF0ZU9iamVjdCggdGhpcy5tb3RoZXJBbGxlbGUgKVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc3RvcmVzIEdlbmVQYWlyIHN0YXRlIGFmdGVyIGluc3RhbnRpYXRpb24uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhcHBseVN0YXRlKCBzdGF0ZU9iamVjdDogR2VuZVBhaXJTdGF0ZU9iamVjdCApOiB2b2lkIHtcclxuICAgIHRoaXMuX2dlbmUgPSBHZW5lLkdlbmVJTy5mcm9tU3RhdGVPYmplY3QoIHN0YXRlT2JqZWN0LmdlbmUgKTtcclxuICAgIHRoaXMuZmF0aGVyQWxsZWxlID0gQWxsZWxlLkFsbGVsZUlPLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QuZmF0aGVyQWxsZWxlICk7XHJcbiAgICB0aGlzLm1vdGhlckFsbGVsZSA9IEFsbGVsZS5BbGxlbGVJTy5mcm9tU3RhdGVPYmplY3QoIHN0YXRlT2JqZWN0Lm1vdGhlckFsbGVsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2VuZVBhaXJJTyBoYW5kbGVzIFBoRVQtaU8gc2VyaWFsaXphdGlvbiBvZiBHZW5lUGFpci5cclxuICAgKiBJdCBpbXBsZW1lbnRzICdEeW5hbWljIGVsZW1lbnQgc2VyaWFsaXphdGlvbicsIGFzIGRlc2NyaWJlZCBpbiB0aGUgU2VyaWFsaXphdGlvbiBzZWN0aW9uIG9mXHJcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8vYmxvYi9tYXN0ZXIvZG9jL3BoZXQtaW8taW5zdHJ1bWVudGF0aW9uLXRlY2huaWNhbC1ndWlkZS5tZCNzZXJpYWxpemF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBHZW5lUGFpcklPID0gbmV3IElPVHlwZTxHZW5lUGFpciwgR2VuZVBhaXJTdGF0ZU9iamVjdD4oICdHZW5lUGFpcklPJywge1xyXG4gICAgdmFsdWVUeXBlOiBHZW5lUGFpcixcclxuICAgIHN0YXRlU2NoZW1hOiB7XHJcbiAgICAgIGdlbmU6IEdlbmUuR2VuZUlPLFxyXG4gICAgICBmYXRoZXJBbGxlbGU6IEFsbGVsZS5BbGxlbGVJTyxcclxuICAgICAgbW90aGVyQWxsZWxlOiBBbGxlbGUuQWxsZWxlSU9cclxuICAgIH0sXHJcbiAgICB0b1N0YXRlT2JqZWN0OiBnZW5lUGFpciA9PiBnZW5lUGFpci50b1N0YXRlT2JqZWN0KCksXHJcbiAgICBhcHBseVN0YXRlOiAoIGdlbmVQYWlyLCBzdGF0ZU9iamVjdCApID0+IGdlbmVQYWlyLmFwcGx5U3RhdGUoIHN0YXRlT2JqZWN0IClcclxuICB9ICk7XHJcbn1cclxuXHJcbm5hdHVyYWxTZWxlY3Rpb24ucmVnaXN0ZXIoICdHZW5lUGFpcicsIEdlbmVQYWlyICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0MsU0FBUyxNQUE0Qix1Q0FBdUM7QUFFbkYsT0FBT0MsWUFBWSxNQUErQix1Q0FBdUM7QUFDekYsT0FBT0MsTUFBTSxNQUFNLHVDQUF1QztBQUMxRCxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFDeEQsT0FBT0MsTUFBTSxNQUE2QixhQUFhO0FBQ3ZELE9BQU9DLElBQUksTUFBMkIsV0FBVztBQWFqRCxlQUFlLE1BQU1DLFFBQVEsU0FBU0wsWUFBWSxDQUFDO0VBRWpEOztFQU1PTSxXQUFXQSxDQUFFQyxJQUFVLEVBQUVDLFlBQW9CLEVBQUVDLFlBQW9CLEVBQUVDLGVBQWdDLEVBQUc7SUFFN0csTUFBTUMsT0FBTyxHQUFHWixTQUFTLENBQW9ELENBQUMsQ0FBRTtNQUU5RTtNQUNBYSxVQUFVLEVBQUVQLFFBQVEsQ0FBQ1E7SUFDdkIsQ0FBQyxFQUFFSCxlQUFnQixDQUFDO0lBRXBCLEtBQUssQ0FBRUMsT0FBUSxDQUFDO0lBRWhCLElBQUksQ0FBQ0csS0FBSyxHQUFHUCxJQUFJO0lBQ2pCLElBQUksQ0FBQ0MsWUFBWSxHQUFHQSxZQUFZO0lBQ2hDLElBQUksQ0FBQ0MsWUFBWSxHQUFHQSxZ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