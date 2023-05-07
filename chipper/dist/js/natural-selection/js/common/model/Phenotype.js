// Copyright 2020-2022, University of Colorado Boulder

/**
 * Phenotype describes the appearance of a bunny, the manifestation of its genotype.
 * See the 'Genotype and Phenotype' section of model.md at
 * https://github.com/phetsims/natural-selection/blob/master/doc/model.md#genotype-and-phenotype
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import required from '../../../../phet-core/js/required.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import naturalSelection from '../../naturalSelection.js';
import Allele from './Allele.js';
export default class Phenotype extends PhetioObject {
  // The alleles that determine the bunny's appearance.
  // They are private because applyState must restore them, but clients should not be able to set them.

  constructor(genotype, providedOptions) {
    const options = optionize()({
      // PhetioObjectOptions
      phetioType: Phenotype.PhenotypeIO,
      phetioDocumentation: 'the appearance of the bunny, the manifestation of its genotype'
    }, providedOptions);
    super(options);
    this._furAllele = genotype.furGenePair.getVisibleAllele();
    this._earsAllele = genotype.earsGenePair.getVisibleAllele();
    this._teethAllele = genotype.teethGenePair.getVisibleAllele();
  }
  get furAllele() {
    return this._furAllele;
  }
  get earsAllele() {
    return this._earsAllele;
  }
  get teethAllele() {
    return this._teethAllele;
  }

  /**
   * Does the phenotype show white fur?
   */
  hasWhiteFur() {
    return this.furAllele === Allele.WHITE_FUR;
  }

  /**
   * Does the phenotype show brown fur?
   */
  hasBrownFur() {
    return this.furAllele === Allele.BROWN_FUR;
  }

  /**
   * Does the phenotype show straight ears?
   */
  hasStraightEars() {
    return this.earsAllele === Allele.STRAIGHT_EARS;
  }

  /**
   * Does the phenotype show floppy ears?
   */
  hasFloppyEars() {
    return this.earsAllele === Allele.FLOPPY_EARS;
  }

  /**
   * Does the phenotype show short teeth?
   */
  hasShortTeeth() {
    return this.teethAllele === Allele.SHORT_TEETH;
  }

  /**
   * Does the phenotype show long teeth?
   */
  hasLongTeeth() {
    return this.teethAllele === Allele.LONG_TEETH;
  }

  //--------------------------------------------------------------------------------------------------------------------
  // Below here are methods used by PhenotypeIO to serialize PhET-iO state.
  //--------------------------------------------------------------------------------------------------------------------

  /**
   * Serializes this Phenotype instance.
   */
  toStateObject() {
    return {
      furAllele: Allele.AlleleIO.toStateObject(this.furAllele),
      earsAllele: Allele.AlleleIO.toStateObject(this.earsAllele),
      teethAllele: Allele.AlleleIO.toStateObject(this.teethAllele)
    };
  }

  /**
   * Restores Phenotype state after instantiation.
   */
  applyState(stateObject) {
    this._furAllele = required(Allele.AlleleIO.fromStateObject(stateObject.furAllele));
    this._earsAllele = required(Allele.AlleleIO.fromStateObject(stateObject.earsAllele));
    this._teethAllele = required(Allele.AlleleIO.fromStateObject(stateObject.teethAllele));
  }

  /**
   * PhenotypeIO handles PhET-iO serialization of Phenotype.
   * It implements 'Dynamic element serialization', as described in the Serialization section of
   * https://github.com/phetsims/phet-io/blob/master/doc/phet-io-instrumentation-technical-guide.md#serialization
   */
  static PhenotypeIO = new IOType('PhenotypeIO', {
    valueType: Phenotype,
    stateSchema: {
      furAllele: Allele.AlleleIO,
      earsAllele: Allele.AlleleIO,
      teethAllele: Allele.AlleleIO
    },
    toStateObject: phenotype => phenotype.toStateObject(),
    applyState: (phenotype, stateObject) => phenotype.applyState(stateObject)
  });
}
naturalSelection.register('Phenotype', Phenotype);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJyZXF1aXJlZCIsIlBoZXRpb09iamVjdCIsIklPVHlwZSIsIm5hdHVyYWxTZWxlY3Rpb24iLCJBbGxlbGUiLCJQaGVub3R5cGUiLCJjb25zdHJ1Y3RvciIsImdlbm90eXBlIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInBoZXRpb1R5cGUiLCJQaGVub3R5cGVJTyIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJfZnVyQWxsZWxlIiwiZnVyR2VuZVBhaXIiLCJnZXRWaXNpYmxlQWxsZWxlIiwiX2VhcnNBbGxlbGUiLCJlYXJzR2VuZVBhaXIiLCJfdGVldGhBbGxlbGUiLCJ0ZWV0aEdlbmVQYWlyIiwiZnVyQWxsZWxlIiwiZWFyc0FsbGVsZSIsInRlZXRoQWxsZWxlIiwiaGFzV2hpdGVGdXIiLCJXSElURV9GVVIiLCJoYXNCcm93bkZ1ciIsIkJST1dOX0ZVUiIsImhhc1N0cmFpZ2h0RWFycyIsIlNUUkFJR0hUX0VBUlMiLCJoYXNGbG9wcHlFYXJzIiwiRkxPUFBZX0VBUlMiLCJoYXNTaG9ydFRlZXRoIiwiU0hPUlRfVEVFVEgiLCJoYXNMb25nVGVldGgiLCJMT05HX1RFRVRIIiwidG9TdGF0ZU9iamVjdCIsIkFsbGVsZUlPIiwiYXBwbHlTdGF0ZSIsInN0YXRlT2JqZWN0IiwiZnJvbVN0YXRlT2JqZWN0IiwidmFsdWVUeXBlIiwic3RhdGVTY2hlbWEiLCJwaGVub3R5cGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBoZW5vdHlwZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBQaGVub3R5cGUgZGVzY3JpYmVzIHRoZSBhcHBlYXJhbmNlIG9mIGEgYnVubnksIHRoZSBtYW5pZmVzdGF0aW9uIG9mIGl0cyBnZW5vdHlwZS5cclxuICogU2VlIHRoZSAnR2Vub3R5cGUgYW5kIFBoZW5vdHlwZScgc2VjdGlvbiBvZiBtb2RlbC5tZCBhdFxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbmF0dXJhbC1zZWxlY3Rpb24vYmxvYi9tYXN0ZXIvZG9jL21vZGVsLm1kI2dlbm90eXBlLWFuZC1waGVub3R5cGVcclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IHJlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9yZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBQaGV0aW9PYmplY3QsIHsgUGhldGlvT2JqZWN0T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgbmF0dXJhbFNlbGVjdGlvbiBmcm9tICcuLi8uLi9uYXR1cmFsU2VsZWN0aW9uLmpzJztcclxuaW1wb3J0IEFsbGVsZSwgeyBBbGxlbGVTdGF0ZU9iamVjdCB9IGZyb20gJy4vQWxsZWxlLmpzJztcclxuaW1wb3J0IEdlbm90eXBlIGZyb20gJy4vR2Vub3R5cGUuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG50eXBlIFBoZW5vdHlwZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxQaGV0aW9PYmplY3RPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG50eXBlIFBoZW5vdHlwZVN0YXRlT2JqZWN0ID0ge1xyXG4gIGZ1ckFsbGVsZTogQWxsZWxlU3RhdGVPYmplY3Q7XHJcbiAgZWFyc0FsbGVsZTogQWxsZWxlU3RhdGVPYmplY3Q7XHJcbiAgdGVldGhBbGxlbGU6IEFsbGVsZVN0YXRlT2JqZWN0O1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGhlbm90eXBlIGV4dGVuZHMgUGhldGlvT2JqZWN0IHtcclxuXHJcbiAgLy8gVGhlIGFsbGVsZXMgdGhhdCBkZXRlcm1pbmUgdGhlIGJ1bm55J3MgYXBwZWFyYW5jZS5cclxuICAvLyBUaGV5IGFyZSBwcml2YXRlIGJlY2F1c2UgYXBwbHlTdGF0ZSBtdXN0IHJlc3RvcmUgdGhlbSwgYnV0IGNsaWVudHMgc2hvdWxkIG5vdCBiZSBhYmxlIHRvIHNldCB0aGVtLlxyXG4gIHByaXZhdGUgX2Z1ckFsbGVsZTogQWxsZWxlO1xyXG4gIHByaXZhdGUgX2VhcnNBbGxlbGU6IEFsbGVsZTtcclxuICBwcml2YXRlIF90ZWV0aEFsbGVsZTogQWxsZWxlO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGdlbm90eXBlOiBHZW5vdHlwZSwgcHJvdmlkZWRPcHRpb25zOiBQaGVub3R5cGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UGhlbm90eXBlT3B0aW9ucywgU2VsZk9wdGlvbnMsIFBoZXRpb09iamVjdE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFBoZXRpb09iamVjdE9wdGlvbnNcclxuICAgICAgcGhldGlvVHlwZTogUGhlbm90eXBlLlBoZW5vdHlwZUlPLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAndGhlIGFwcGVhcmFuY2Ugb2YgdGhlIGJ1bm55LCB0aGUgbWFuaWZlc3RhdGlvbiBvZiBpdHMgZ2Vub3R5cGUnXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuX2Z1ckFsbGVsZSA9IGdlbm90eXBlLmZ1ckdlbmVQYWlyLmdldFZpc2libGVBbGxlbGUoKTtcclxuICAgIHRoaXMuX2VhcnNBbGxlbGUgPSBnZW5vdHlwZS5lYXJzR2VuZVBhaXIuZ2V0VmlzaWJsZUFsbGVsZSgpO1xyXG4gICAgdGhpcy5fdGVldGhBbGxlbGUgPSBnZW5vdHlwZS50ZWV0aEdlbmVQYWlyLmdldFZpc2libGVBbGxlbGUoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgZnVyQWxsZWxlKCk6IEFsbGVsZSB7IHJldHVybiB0aGlzLl9mdXJBbGxlbGU7IH1cclxuXHJcbiAgcHVibGljIGdldCBlYXJzQWxsZWxlKCk6IEFsbGVsZSB7IHJldHVybiB0aGlzLl9lYXJzQWxsZWxlOyB9XHJcblxyXG4gIHB1YmxpYyBnZXQgdGVldGhBbGxlbGUoKTogQWxsZWxlIHsgcmV0dXJuIHRoaXMuX3RlZXRoQWxsZWxlOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERvZXMgdGhlIHBoZW5vdHlwZSBzaG93IHdoaXRlIGZ1cj9cclxuICAgKi9cclxuICBwdWJsaWMgaGFzV2hpdGVGdXIoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5mdXJBbGxlbGUgPT09IEFsbGVsZS5XSElURV9GVVI7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEb2VzIHRoZSBwaGVub3R5cGUgc2hvdyBicm93biBmdXI/XHJcbiAgICovXHJcbiAgcHVibGljIGhhc0Jyb3duRnVyKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuZnVyQWxsZWxlID09PSBBbGxlbGUuQlJPV05fRlVSO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRG9lcyB0aGUgcGhlbm90eXBlIHNob3cgc3RyYWlnaHQgZWFycz9cclxuICAgKi9cclxuICBwdWJsaWMgaGFzU3RyYWlnaHRFYXJzKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuZWFyc0FsbGVsZSA9PT0gQWxsZWxlLlNUUkFJR0hUX0VBUlM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEb2VzIHRoZSBwaGVub3R5cGUgc2hvdyBmbG9wcHkgZWFycz9cclxuICAgKi9cclxuICBwdWJsaWMgaGFzRmxvcHB5RWFycygpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmVhcnNBbGxlbGUgPT09IEFsbGVsZS5GTE9QUFlfRUFSUztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERvZXMgdGhlIHBoZW5vdHlwZSBzaG93IHNob3J0IHRlZXRoP1xyXG4gICAqL1xyXG4gIHB1YmxpYyBoYXNTaG9ydFRlZXRoKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMudGVldGhBbGxlbGUgPT09IEFsbGVsZS5TSE9SVF9URUVUSDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERvZXMgdGhlIHBoZW5vdHlwZSBzaG93IGxvbmcgdGVldGg/XHJcbiAgICovXHJcbiAgcHVibGljIGhhc0xvbmdUZWV0aCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLnRlZXRoQWxsZWxlID09PSBBbGxlbGUuTE9OR19URUVUSDtcclxuICB9XHJcblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBCZWxvdyBoZXJlIGFyZSBtZXRob2RzIHVzZWQgYnkgUGhlbm90eXBlSU8gdG8gc2VyaWFsaXplIFBoRVQtaU8gc3RhdGUuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAvKipcclxuICAgKiBTZXJpYWxpemVzIHRoaXMgUGhlbm90eXBlIGluc3RhbmNlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgdG9TdGF0ZU9iamVjdCgpOiBQaGVub3R5cGVTdGF0ZU9iamVjdCB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBmdXJBbGxlbGU6IEFsbGVsZS5BbGxlbGVJTy50b1N0YXRlT2JqZWN0KCB0aGlzLmZ1ckFsbGVsZSApLFxyXG4gICAgICBlYXJzQWxsZWxlOiBBbGxlbGUuQWxsZWxlSU8udG9TdGF0ZU9iamVjdCggdGhpcy5lYXJzQWxsZWxlICksXHJcbiAgICAgIHRlZXRoQWxsZWxlOiBBbGxlbGUuQWxsZWxlSU8udG9TdGF0ZU9iamVjdCggdGhpcy50ZWV0aEFsbGVsZSApXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzdG9yZXMgUGhlbm90eXBlIHN0YXRlIGFmdGVyIGluc3RhbnRpYXRpb24uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhcHBseVN0YXRlKCBzdGF0ZU9iamVjdDogUGhlbm90eXBlU3RhdGVPYmplY3QgKTogdm9pZCB7XHJcbiAgICB0aGlzLl9mdXJBbGxlbGUgPSByZXF1aXJlZCggQWxsZWxlLkFsbGVsZUlPLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QuZnVyQWxsZWxlICkgKTtcclxuICAgIHRoaXMuX2VhcnNBbGxlbGUgPSByZXF1aXJlZCggQWxsZWxlLkFsbGVsZUlPLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QuZWFyc0FsbGVsZSApICk7XHJcbiAgICB0aGlzLl90ZWV0aEFsbGVsZSA9IHJlcXVpcmVkKCBBbGxlbGUuQWxsZWxlSU8uZnJvbVN0YXRlT2JqZWN0KCBzdGF0ZU9iamVjdC50ZWV0aEFsbGVsZSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQaGVub3R5cGVJTyBoYW5kbGVzIFBoRVQtaU8gc2VyaWFsaXphdGlvbiBvZiBQaGVub3R5cGUuXHJcbiAgICogSXQgaW1wbGVtZW50cyAnRHluYW1pYyBlbGVtZW50IHNlcmlhbGl6YXRpb24nLCBhcyBkZXNjcmliZWQgaW4gdGhlIFNlcmlhbGl6YXRpb24gc2VjdGlvbiBvZlxyXG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvL2Jsb2IvbWFzdGVyL2RvYy9waGV0LWlvLWluc3RydW1lbnRhdGlvbi10ZWNobmljYWwtZ3VpZGUubWQjc2VyaWFsaXphdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgUGhlbm90eXBlSU8gPSBuZXcgSU9UeXBlPFBoZW5vdHlwZSwgUGhlbm90eXBlU3RhdGVPYmplY3Q+KCAnUGhlbm90eXBlSU8nLCB7XHJcbiAgICB2YWx1ZVR5cGU6IFBoZW5vdHlwZSxcclxuICAgIHN0YXRlU2NoZW1hOiB7XHJcbiAgICAgIGZ1ckFsbGVsZTogQWxsZWxlLkFsbGVsZUlPLFxyXG4gICAgICBlYXJzQWxsZWxlOiBBbGxlbGUuQWxsZWxlSU8sXHJcbiAgICAgIHRlZXRoQWxsZWxlOiBBbGxlbGUuQWxsZWxlSU9cclxuICAgIH0sXHJcbiAgICB0b1N0YXRlT2JqZWN0OiBwaGVub3R5cGUgPT4gcGhlbm90eXBlLnRvU3RhdGVPYmplY3QoKSxcclxuICAgIGFwcGx5U3RhdGU6ICggcGhlbm90eXBlLCBzdGF0ZU9iamVjdCApID0+IHBoZW5vdHlwZS5hcHBseVN0YXRlKCBzdGF0ZU9iamVjdCApXHJcbiAgfSApO1xyXG59XHJcblxyXG5uYXR1cmFsU2VsZWN0aW9uLnJlZ2lzdGVyKCAnUGhlbm90eXBlJywgUGhlbm90eXBlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQTRCLHVDQUF1QztBQUNuRixPQUFPQyxRQUFRLE1BQU0sc0NBQXNDO0FBRTNELE9BQU9DLFlBQVksTUFBK0IsdUNBQXVDO0FBQ3pGLE9BQU9DLE1BQU0sTUFBTSx1Q0FBdUM7QUFDMUQsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLE1BQU0sTUFBNkIsYUFBYTtBQWF2RCxlQUFlLE1BQU1DLFNBQVMsU0FBU0osWUFBWSxDQUFDO0VBRWxEO0VBQ0E7O0VB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