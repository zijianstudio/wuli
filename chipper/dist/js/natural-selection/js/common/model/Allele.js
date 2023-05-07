// Copyright 2020-2022, University of Colorado Boulder

/**
 * Allele is a variant form of a gene.  In this sim, the language used to name an allele (a gene variant) and
 * a phenotype (expression of that gene) are synonymous. For example, 'White Fur' is used to describe both the
 * allele and the phenotype. Note that gene and allele are often used interchangeably in the literature,
 * but we attempt to use them consistently in this implementation.
 *
 * There is one instance of each Allele, and they are global to the simulation. They are defined herein as
 * static instances, and appear in Studio as children of the element 'naturalSelection.global.model.alleles'.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import brownFur_png from '../../../images/brownFur_png.js';
import floppyEars_png from '../../../images/floppyEars_png.js';
import longTeeth_png from '../../../images/longTeeth_png.js';
import shortTeeth_png from '../../../images/shortTeeth_png.js';
import straightEars_png from '../../../images/straightEars_png.js';
import whiteFur_png from '../../../images/whiteFur_png.js';
import naturalSelection from '../../naturalSelection.js';
import NaturalSelectionStrings from '../../NaturalSelectionStrings.js';

// tandem for all static instances of Allele
const ALLELES_TANDEM = Tandem.GLOBAL_MODEL.createTandem('alleles');
// because AlleleIO is a subtype of ReferenceIO

export default class Allele extends PhetioObject {
  /**
   * The constructor is private because only the static instances are used.
   *
   * @param nameProperty - name of the allele
   * @param image - image used to represent the allele in the UI
   * @param tandemPrefix - prefix used for tandem names for the allele, like 'whiteFur' for 'whiteFurCheckbox'
   * @param [providedOptions]
   */
  constructor(nameProperty, image, tandemPrefix, providedOptions) {
    const options = optionize()({
      // PhetioObjectOptions
      phetioType: Allele.AlleleIO,
      phetioState: false
    }, providedOptions);
    assert && assert(options.tandem.name.startsWith(tandemPrefix), `tandem name ${options.tandem.name} must start with ${tandemPrefix}`);
    super(options);
    this.nameProperty = nameProperty;
    this.image = image;
    this.tandemPrefix = tandemPrefix;
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }

  /**
   * AlleleIO handles PhET-iO serialization of Allele.
   * It implements 'Reference type serialization', as described in the Serialization section of
   * https://github.com/phetsims/phet-io/blob/master/doc/phet-io-instrumentation-technical-guide.md#serialization
   * This must be defined before instantiating static instances.
   */
  static AlleleIO = new IOType('AlleleIO', {
    valueType: Allele,
    supertype: ReferenceIO(IOType.ObjectIO)
  });

  // Static instances

  static WHITE_FUR = new Allele(NaturalSelectionStrings.whiteFurStringProperty, whiteFur_png, 'whiteFur', {
    tandem: ALLELES_TANDEM.createTandem('whiteFurAllele')
  });
  static BROWN_FUR = new Allele(NaturalSelectionStrings.brownFurStringProperty, brownFur_png, 'brownFur', {
    tandem: ALLELES_TANDEM.createTandem('brownFurAllele')
  });
  static FLOPPY_EARS = new Allele(NaturalSelectionStrings.floppyEarsStringProperty, floppyEars_png, 'floppyEars', {
    tandem: ALLELES_TANDEM.createTandem('floppyEarsAllele')
  });
  static STRAIGHT_EARS = new Allele(NaturalSelectionStrings.straightEarsStringProperty, straightEars_png, 'straightEars', {
    tandem: ALLELES_TANDEM.createTandem('straightEarsAllele')
  });
  static SHORT_TEETH = new Allele(NaturalSelectionStrings.shortTeethStringProperty, shortTeeth_png, 'shortTeeth', {
    tandem: ALLELES_TANDEM.createTandem('shortTeethAllele')
  });
  static LONG_TEETH = new Allele(NaturalSelectionStrings.longTeethStringProperty, longTeeth_png, 'longTeeth', {
    tandem: ALLELES_TANDEM.createTandem('longTeethAllele')
  });
}
naturalSelection.register('Allele', Allele);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJQaGV0aW9PYmplY3QiLCJUYW5kZW0iLCJJT1R5cGUiLCJSZWZlcmVuY2VJTyIsImJyb3duRnVyX3BuZyIsImZsb3BweUVhcnNfcG5nIiwibG9uZ1RlZXRoX3BuZyIsInNob3J0VGVldGhfcG5nIiwic3RyYWlnaHRFYXJzX3BuZyIsIndoaXRlRnVyX3BuZyIsIm5hdHVyYWxTZWxlY3Rpb24iLCJOYXR1cmFsU2VsZWN0aW9uU3RyaW5ncyIsIkFMTEVMRVNfVEFOREVNIiwiR0xPQkFMX01PREVMIiwiY3JlYXRlVGFuZGVtIiwiQWxsZWxlIiwiY29uc3RydWN0b3IiLCJuYW1lUHJvcGVydHkiLCJpbWFnZSIsInRhbmRlbVByZWZpeCIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJwaGV0aW9UeXBlIiwiQWxsZWxlSU8iLCJwaGV0aW9TdGF0ZSIsImFzc2VydCIsInRhbmRlbSIsIm5hbWUiLCJzdGFydHNXaXRoIiwiZGlzcG9zZSIsInZhbHVlVHlwZSIsInN1cGVydHlwZSIsIk9iamVjdElPIiwiV0hJVEVfRlVSIiwid2hpdGVGdXJTdHJpbmdQcm9wZXJ0eSIsIkJST1dOX0ZVUiIsImJyb3duRnVyU3RyaW5nUHJvcGVydHkiLCJGTE9QUFlfRUFSUyIsImZsb3BweUVhcnNTdHJpbmdQcm9wZXJ0eSIsIlNUUkFJR0hUX0VBUlMiLCJzdHJhaWdodEVhcnNTdHJpbmdQcm9wZXJ0eSIsIlNIT1JUX1RFRVRIIiwic2hvcnRUZWV0aFN0cmluZ1Byb3BlcnR5IiwiTE9OR19URUVUSCIsImxvbmdUZWV0aFN0cmluZ1Byb3BlcnR5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJBbGxlbGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQWxsZWxlIGlzIGEgdmFyaWFudCBmb3JtIG9mIGEgZ2VuZS4gIEluIHRoaXMgc2ltLCB0aGUgbGFuZ3VhZ2UgdXNlZCB0byBuYW1lIGFuIGFsbGVsZSAoYSBnZW5lIHZhcmlhbnQpIGFuZFxyXG4gKiBhIHBoZW5vdHlwZSAoZXhwcmVzc2lvbiBvZiB0aGF0IGdlbmUpIGFyZSBzeW5vbnltb3VzLiBGb3IgZXhhbXBsZSwgJ1doaXRlIEZ1cicgaXMgdXNlZCB0byBkZXNjcmliZSBib3RoIHRoZVxyXG4gKiBhbGxlbGUgYW5kIHRoZSBwaGVub3R5cGUuIE5vdGUgdGhhdCBnZW5lIGFuZCBhbGxlbGUgYXJlIG9mdGVuIHVzZWQgaW50ZXJjaGFuZ2VhYmx5IGluIHRoZSBsaXRlcmF0dXJlLFxyXG4gKiBidXQgd2UgYXR0ZW1wdCB0byB1c2UgdGhlbSBjb25zaXN0ZW50bHkgaW4gdGhpcyBpbXBsZW1lbnRhdGlvbi5cclxuICpcclxuICogVGhlcmUgaXMgb25lIGluc3RhbmNlIG9mIGVhY2ggQWxsZWxlLCBhbmQgdGhleSBhcmUgZ2xvYmFsIHRvIHRoZSBzaW11bGF0aW9uLiBUaGV5IGFyZSBkZWZpbmVkIGhlcmVpbiBhc1xyXG4gKiBzdGF0aWMgaW5zdGFuY2VzLCBhbmQgYXBwZWFyIGluIFN0dWRpbyBhcyBjaGlsZHJlbiBvZiB0aGUgZWxlbWVudCAnbmF0dXJhbFNlbGVjdGlvbi5nbG9iYWwubW9kZWwuYWxsZWxlcycuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IFBoZXRpb09iamVjdCwgeyBQaGV0aW9PYmplY3RPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XHJcbmltcG9ydCBSZWZlcmVuY2VJTywgeyBSZWZlcmVuY2VJT1N0YXRlIH0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1JlZmVyZW5jZUlPLmpzJztcclxuaW1wb3J0IGJyb3duRnVyX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvYnJvd25GdXJfcG5nLmpzJztcclxuaW1wb3J0IGZsb3BweUVhcnNfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9mbG9wcHlFYXJzX3BuZy5qcyc7XHJcbmltcG9ydCBsb25nVGVldGhfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9sb25nVGVldGhfcG5nLmpzJztcclxuaW1wb3J0IHNob3J0VGVldGhfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9zaG9ydFRlZXRoX3BuZy5qcyc7XHJcbmltcG9ydCBzdHJhaWdodEVhcnNfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9zdHJhaWdodEVhcnNfcG5nLmpzJztcclxuaW1wb3J0IHdoaXRlRnVyX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvd2hpdGVGdXJfcG5nLmpzJztcclxuaW1wb3J0IG5hdHVyYWxTZWxlY3Rpb24gZnJvbSAnLi4vLi4vbmF0dXJhbFNlbGVjdGlvbi5qcyc7XHJcbmltcG9ydCBOYXR1cmFsU2VsZWN0aW9uU3RyaW5ncyBmcm9tICcuLi8uLi9OYXR1cmFsU2VsZWN0aW9uU3RyaW5ncy5qcyc7XHJcblxyXG4vLyB0YW5kZW0gZm9yIGFsbCBzdGF0aWMgaW5zdGFuY2VzIG9mIEFsbGVsZVxyXG5jb25zdCBBTExFTEVTX1RBTkRFTSA9IFRhbmRlbS5HTE9CQUxfTU9ERUwuY3JlYXRlVGFuZGVtKCAnYWxsZWxlcycgKTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBBbGxlbGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8UGhldGlvT2JqZWN0T3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IHR5cGUgQWxsZWxlU3RhdGVPYmplY3QgPSBSZWZlcmVuY2VJT1N0YXRlOyAvLyBiZWNhdXNlIEFsbGVsZUlPIGlzIGEgc3VidHlwZSBvZiBSZWZlcmVuY2VJT1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWxsZWxlIGV4dGVuZHMgUGhldGlvT2JqZWN0IHtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IG5hbWVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgaW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQ7XHJcbiAgcHVibGljIHJlYWRvbmx5IHRhbmRlbVByZWZpeDogc3RyaW5nO1xyXG5cclxuICAvKipcclxuICAgKiBUaGUgY29uc3RydWN0b3IgaXMgcHJpdmF0ZSBiZWNhdXNlIG9ubHkgdGhlIHN0YXRpYyBpbnN0YW5jZXMgYXJlIHVzZWQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gbmFtZVByb3BlcnR5IC0gbmFtZSBvZiB0aGUgYWxsZWxlXHJcbiAgICogQHBhcmFtIGltYWdlIC0gaW1hZ2UgdXNlZCB0byByZXByZXNlbnQgdGhlIGFsbGVsZSBpbiB0aGUgVUlcclxuICAgKiBAcGFyYW0gdGFuZGVtUHJlZml4IC0gcHJlZml4IHVzZWQgZm9yIHRhbmRlbSBuYW1lcyBmb3IgdGhlIGFsbGVsZSwgbGlrZSAnd2hpdGVGdXInIGZvciAnd2hpdGVGdXJDaGVja2JveCdcclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cclxuICAgKi9cclxuICBwcml2YXRlIGNvbnN0cnVjdG9yKCBuYW1lUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4sIGltYWdlOiBIVE1MSW1hZ2VFbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgdGFuZGVtUHJlZml4OiBzdHJpbmcsIHByb3ZpZGVkT3B0aW9uczogQWxsZWxlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEFsbGVsZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBQaGV0aW9PYmplY3RPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBQaGV0aW9PYmplY3RPcHRpb25zXHJcbiAgICAgIHBoZXRpb1R5cGU6IEFsbGVsZS5BbGxlbGVJTyxcclxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnRhbmRlbS5uYW1lLnN0YXJ0c1dpdGgoIHRhbmRlbVByZWZpeCApLFxyXG4gICAgICBgdGFuZGVtIG5hbWUgJHtvcHRpb25zLnRhbmRlbS5uYW1lfSBtdXN0IHN0YXJ0IHdpdGggJHt0YW5kZW1QcmVmaXh9YCApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5uYW1lUHJvcGVydHkgPSBuYW1lUHJvcGVydHk7XHJcbiAgICB0aGlzLmltYWdlID0gaW1hZ2U7XHJcbiAgICB0aGlzLnRhbmRlbVByZWZpeCA9IHRhbmRlbVByZWZpeDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBbGxlbGVJTyBoYW5kbGVzIFBoRVQtaU8gc2VyaWFsaXphdGlvbiBvZiBBbGxlbGUuXHJcbiAgICogSXQgaW1wbGVtZW50cyAnUmVmZXJlbmNlIHR5cGUgc2VyaWFsaXphdGlvbicsIGFzIGRlc2NyaWJlZCBpbiB0aGUgU2VyaWFsaXphdGlvbiBzZWN0aW9uIG9mXHJcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8vYmxvYi9tYXN0ZXIvZG9jL3BoZXQtaW8taW5zdHJ1bWVudGF0aW9uLXRlY2huaWNhbC1ndWlkZS5tZCNzZXJpYWxpemF0aW9uXHJcbiAgICogVGhpcyBtdXN0IGJlIGRlZmluZWQgYmVmb3JlIGluc3RhbnRpYXRpbmcgc3RhdGljIGluc3RhbmNlcy5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEFsbGVsZUlPID0gbmV3IElPVHlwZTxBbGxlbGUsIEFsbGVsZVN0YXRlT2JqZWN0PiggJ0FsbGVsZUlPJywge1xyXG4gICAgdmFsdWVUeXBlOiBBbGxlbGUsXHJcbiAgICBzdXBlcnR5cGU6IFJlZmVyZW5jZUlPKCBJT1R5cGUuT2JqZWN0SU8gKVxyXG4gIH0gKTtcclxuXHJcbiAgLy8gU3RhdGljIGluc3RhbmNlc1xyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFdISVRFX0ZVUiA9IG5ldyBBbGxlbGUoIE5hdHVyYWxTZWxlY3Rpb25TdHJpbmdzLndoaXRlRnVyU3RyaW5nUHJvcGVydHksIHdoaXRlRnVyX3BuZywgJ3doaXRlRnVyJywge1xyXG4gICAgdGFuZGVtOiBBTExFTEVTX1RBTkRFTS5jcmVhdGVUYW5kZW0oICd3aGl0ZUZ1ckFsbGVsZScgKVxyXG4gIH0gKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBCUk9XTl9GVVIgPSBuZXcgQWxsZWxlKCBOYXR1cmFsU2VsZWN0aW9uU3RyaW5ncy5icm93bkZ1clN0cmluZ1Byb3BlcnR5LCBicm93bkZ1cl9wbmcsICdicm93bkZ1cicsIHtcclxuICAgIHRhbmRlbTogQUxMRUxFU19UQU5ERU0uY3JlYXRlVGFuZGVtKCAnYnJvd25GdXJBbGxlbGUnIClcclxuICB9ICk7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgRkxPUFBZX0VBUlMgPSBuZXcgQWxsZWxlKCBOYXR1cmFsU2VsZWN0aW9uU3RyaW5ncy5mbG9wcHlFYXJzU3RyaW5nUHJvcGVydHksIGZsb3BweUVhcnNfcG5nLCAnZmxvcHB5RWFycycsIHtcclxuICAgIHRhbmRlbTogQUxMRUxFU19UQU5ERU0uY3JlYXRlVGFuZGVtKCAnZmxvcHB5RWFyc0FsbGVsZScgKVxyXG4gIH0gKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBTVFJBSUdIVF9FQVJTID0gbmV3IEFsbGVsZSggTmF0dXJhbFNlbGVjdGlvblN0cmluZ3Muc3RyYWlnaHRFYXJzU3RyaW5nUHJvcGVydHksIHN0cmFpZ2h0RWFyc19wbmcsICdzdHJhaWdodEVhcnMnLCB7XHJcbiAgICB0YW5kZW06IEFMTEVMRVNfVEFOREVNLmNyZWF0ZVRhbmRlbSggJ3N0cmFpZ2h0RWFyc0FsbGVsZScgKVxyXG4gIH0gKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBTSE9SVF9URUVUSCA9IG5ldyBBbGxlbGUoIE5hdHVyYWxTZWxlY3Rpb25TdHJpbmdzLnNob3J0VGVldGhTdHJpbmdQcm9wZXJ0eSwgc2hvcnRUZWV0aF9wbmcsICdzaG9ydFRlZXRoJywge1xyXG4gICAgdGFuZGVtOiBBTExFTEVTX1RBTkRFTS5jcmVhdGVUYW5kZW0oICdzaG9ydFRlZXRoQWxsZWxlJyApXHJcbiAgfSApO1xyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IExPTkdfVEVFVEggPSBuZXcgQWxsZWxlKCBOYXR1cmFsU2VsZWN0aW9uU3RyaW5ncy5sb25nVGVldGhTdHJpbmdQcm9wZXJ0eSwgbG9uZ1RlZXRoX3BuZywgJ2xvbmdUZWV0aCcsIHtcclxuICAgIHRhbmRlbTogQUxMRUxFU19UQU5ERU0uY3JlYXRlVGFuZGVtKCAnbG9uZ1RlZXRoQWxsZWxlJyApXHJcbiAgfSApO1xyXG59XHJcblxy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