// Copyright 2021-2023, University of Colorado Boulder

/**
 * Represents a description of the atomic layout of the molecule.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import StringProperty from '../../../../axon/js/StringProperty.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import moleculeShapes from '../../moleculeShapes.js';
import MoleculeShapesStrings from '../../MoleculeShapesStrings.js';
class MoleculeGeometryValue {
  /*
   * @param {number} x
   * @param {TProperty<string>} stringProperty
   */
  constructor(x, stringProperty) {
    // @public {number}
    this.x = x;

    // @public {TProperty<string>}
    this.stringProperty = stringProperty;
  }
}

// Global place for the empty molecule geometry string. It's not a translated string anymore, see https://github.com/phetsims/rosetta/issues/388
export const emptyMoleculeGeometryStringProperty = new StringProperty('', {
  // TODO: instrumented because of TinyForwardingProperty's assertion that we can't switch to uninstrumented Properties
  // See https://github.com/phetsims/rosetta/issues/388
  tandem: Tandem.GLOBAL_MODEL.createTandem('emptyMoleculeGeometryStringProperty'),
  phetioState: false,
  phetioFeatured: false,
  phetioDocumentation: 'Should only be the empty string',
  phetioReadOnly: true
});
const MoleculeGeometry = EnumerationDeprecated.byMap({
  EMPTY: new MoleculeGeometryValue(0, emptyMoleculeGeometryStringProperty),
  DIATOMIC: new MoleculeGeometryValue(1, MoleculeShapesStrings.shape.diatomicStringProperty),
  LINEAR: new MoleculeGeometryValue(2, MoleculeShapesStrings.shape.linearStringProperty),
  // e = 0,3,4
  BENT: new MoleculeGeometryValue(2, MoleculeShapesStrings.shape.bentStringProperty),
  // e = 1,2
  TRIGONAL_PLANAR: new MoleculeGeometryValue(3, MoleculeShapesStrings.shape.trigonalPlanarStringProperty),
  // e = 0
  TRIGONAL_PYRAMIDAL: new MoleculeGeometryValue(3, MoleculeShapesStrings.shape.trigonalPyramidalStringProperty),
  // e = 1
  T_SHAPED: new MoleculeGeometryValue(3, MoleculeShapesStrings.shape.tShapedStringProperty),
  // e = 2,3
  TETRAHEDRAL: new MoleculeGeometryValue(4, MoleculeShapesStrings.shape.tetrahedralStringProperty),
  // e = 0
  SEESAW: new MoleculeGeometryValue(4, MoleculeShapesStrings.shape.seesawStringProperty),
  // e = 1
  SQUARE_PLANAR: new MoleculeGeometryValue(4, MoleculeShapesStrings.shape.squarePlanarStringProperty),
  // e = 2
  TRIGONAL_BIPYRAMIDAL: new MoleculeGeometryValue(5, MoleculeShapesStrings.shape.trigonalBipyramidalStringProperty),
  // e = 0
  SQUARE_PYRAMIDAL: new MoleculeGeometryValue(5, MoleculeShapesStrings.shape.squarePyramidalStringProperty),
  // e = 1
  OCTAHEDRAL: new MoleculeGeometryValue(6, MoleculeShapesStrings.shape.octahedralStringProperty) // e = 0
}, {
  beforeFreeze: MoleculeGeometry => {
    /*
     * Lookup for the configuration, based on the number of pair groups it contains.
     * @public
     *
     * @param {number} x - Number of radial atoms connected to the central atom
     * @param {number} e - Number of radial lone pairs connected to the central atom
     * @returns {MoleculeGeometry}
     */
    MoleculeGeometry.getConfiguration = (x, e) => {
      // figure out what the name is
      if (x === 0) {
        return MoleculeGeometry.EMPTY;
      } else if (x === 1) {
        return MoleculeGeometry.DIATOMIC;
      } else if (x === 2) {
        if (e === 0 || e === 3 || e === 4) {
          return MoleculeGeometry.LINEAR;
        } else if (e === 1 || e === 2) {
          return MoleculeGeometry.BENT;
        } else {
          throw new Error(`invalid x: ${x}, e: ${e}`);
        }
      } else if (x === 3) {
        if (e === 0) {
          return MoleculeGeometry.TRIGONAL_PLANAR;
        } else if (e === 1) {
          return MoleculeGeometry.TRIGONAL_PYRAMIDAL;
        } else if (e === 2 || e === 3) {
          return MoleculeGeometry.T_SHAPED;
        } else {
          throw new Error(`invalid x: ${x}, e: ${e}`);
        }
      } else if (x === 4) {
        if (e === 0) {
          return MoleculeGeometry.TETRAHEDRAL;
        } else if (e === 1) {
          return MoleculeGeometry.SEESAW;
        } else if (e === 2) {
          return MoleculeGeometry.SQUARE_PLANAR;
        } else {
          throw new Error(`invalid x: ${x}, e: ${e}`);
        }
      } else if (x === 5) {
        if (e === 0) {
          return MoleculeGeometry.TRIGONAL_BIPYRAMIDAL;
        } else if (e === 1) {
          return MoleculeGeometry.SQUARE_PYRAMIDAL;
        } else {
          throw new Error(`invalid x: ${x}, e: ${e}`);
        }
      } else if (x === 6) {
        if (e === 0) {
          return MoleculeGeometry.OCTAHEDRAL;
        } else {
          throw new Error(`invalid x: ${x}, e: ${e}`);
        }
      } else {
        throw new Error(`unknown VSEPR configuration x: ${x}, e: ${e}`);
      }
    };
  }
});
moleculeShapes.register('MoleculeGeometry', MoleculeGeometry);
export default MoleculeGeometry;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdHJpbmdQcm9wZXJ0eSIsIlRhbmRlbSIsIkVudW1lcmF0aW9uRGVwcmVjYXRlZCIsIm1vbGVjdWxlU2hhcGVzIiwiTW9sZWN1bGVTaGFwZXNTdHJpbmdzIiwiTW9sZWN1bGVHZW9tZXRyeVZhbHVlIiwiY29uc3RydWN0b3IiLCJ4Iiwic3RyaW5nUHJvcGVydHkiLCJlbXB0eU1vbGVjdWxlR2VvbWV0cnlTdHJpbmdQcm9wZXJ0eSIsInRhbmRlbSIsIkdMT0JBTF9NT0RFTCIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb1N0YXRlIiwicGhldGlvRmVhdHVyZWQiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwicGhldGlvUmVhZE9ubHkiLCJNb2xlY3VsZUdlb21ldHJ5IiwiYnlNYXAiLCJFTVBUWSIsIkRJQVRPTUlDIiwic2hhcGUiLCJkaWF0b21pY1N0cmluZ1Byb3BlcnR5IiwiTElORUFSIiwibGluZWFyU3RyaW5nUHJvcGVydHkiLCJCRU5UIiwiYmVudFN0cmluZ1Byb3BlcnR5IiwiVFJJR09OQUxfUExBTkFSIiwidHJpZ29uYWxQbGFuYXJTdHJpbmdQcm9wZXJ0eSIsIlRSSUdPTkFMX1BZUkFNSURBTCIsInRyaWdvbmFsUHlyYW1pZGFsU3RyaW5nUHJvcGVydHkiLCJUX1NIQVBFRCIsInRTaGFwZWRTdHJpbmdQcm9wZXJ0eSIsIlRFVFJBSEVEUkFMIiwidGV0cmFoZWRyYWxTdHJpbmdQcm9wZXJ0eSIsIlNFRVNBVyIsInNlZXNhd1N0cmluZ1Byb3BlcnR5IiwiU1FVQVJFX1BMQU5BUiIsInNxdWFyZVBsYW5hclN0cmluZ1Byb3BlcnR5IiwiVFJJR09OQUxfQklQWVJBTUlEQUwiLCJ0cmlnb25hbEJpcHlyYW1pZGFsU3RyaW5nUHJvcGVydHkiLCJTUVVBUkVfUFlSQU1JREFMIiwic3F1YXJlUHlyYW1pZGFsU3RyaW5nUHJvcGVydHkiLCJPQ1RBSEVEUkFMIiwib2N0YWhlZHJhbFN0cmluZ1Byb3BlcnR5IiwiYmVmb3JlRnJlZXplIiwiZ2V0Q29uZmlndXJhdGlvbiIsImUiLCJFcnJvciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTW9sZWN1bGVHZW9tZXRyeS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRzIGEgZGVzY3JpcHRpb24gb2YgdGhlIGF0b21pYyBsYXlvdXQgb2YgdGhlIG1vbGVjdWxlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IFN0cmluZ1Byb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvU3RyaW5nUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb25EZXByZWNhdGVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbkRlcHJlY2F0ZWQuanMnO1xyXG5pbXBvcnQgbW9sZWN1bGVTaGFwZXMgZnJvbSAnLi4vLi4vbW9sZWN1bGVTaGFwZXMuanMnO1xyXG5pbXBvcnQgTW9sZWN1bGVTaGFwZXNTdHJpbmdzIGZyb20gJy4uLy4uL01vbGVjdWxlU2hhcGVzU3RyaW5ncy5qcyc7XHJcblxyXG5jbGFzcyBNb2xlY3VsZUdlb21ldHJ5VmFsdWUge1xyXG4gIC8qXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgKiBAcGFyYW0ge1RQcm9wZXJ0eTxzdHJpbmc+fSBzdHJpbmdQcm9wZXJ0eVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB4LCBzdHJpbmdQcm9wZXJ0eSApIHtcclxuICAgIC8vIEBwdWJsaWMge251bWJlcn1cclxuICAgIHRoaXMueCA9IHg7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7VFByb3BlcnR5PHN0cmluZz59XHJcbiAgICB0aGlzLnN0cmluZ1Byb3BlcnR5ID0gc3RyaW5nUHJvcGVydHk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBHbG9iYWwgcGxhY2UgZm9yIHRoZSBlbXB0eSBtb2xlY3VsZSBnZW9tZXRyeSBzdHJpbmcuIEl0J3Mgbm90IGEgdHJhbnNsYXRlZCBzdHJpbmcgYW55bW9yZSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9yb3NldHRhL2lzc3Vlcy8zODhcclxuZXhwb3J0IGNvbnN0IGVtcHR5TW9sZWN1bGVHZW9tZXRyeVN0cmluZ1Byb3BlcnR5ID0gbmV3IFN0cmluZ1Byb3BlcnR5KCAnJywge1xyXG4gIC8vIFRPRE86IGluc3RydW1lbnRlZCBiZWNhdXNlIG9mIFRpbnlGb3J3YXJkaW5nUHJvcGVydHkncyBhc3NlcnRpb24gdGhhdCB3ZSBjYW4ndCBzd2l0Y2ggdG8gdW5pbnN0cnVtZW50ZWQgUHJvcGVydGllc1xyXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcm9zZXR0YS9pc3N1ZXMvMzg4XHJcbiAgdGFuZGVtOiBUYW5kZW0uR0xPQkFMX01PREVMLmNyZWF0ZVRhbmRlbSggJ2VtcHR5TW9sZWN1bGVHZW9tZXRyeVN0cmluZ1Byb3BlcnR5JyApLFxyXG4gIHBoZXRpb1N0YXRlOiBmYWxzZSxcclxuICBwaGV0aW9GZWF0dXJlZDogZmFsc2UsXHJcbiAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1Nob3VsZCBvbmx5IGJlIHRoZSBlbXB0eSBzdHJpbmcnLFxyXG4gIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcbn0gKTtcclxuXHJcbmNvbnN0IE1vbGVjdWxlR2VvbWV0cnkgPSBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQuYnlNYXAoIHtcclxuICBFTVBUWTogbmV3IE1vbGVjdWxlR2VvbWV0cnlWYWx1ZSggMCwgZW1wdHlNb2xlY3VsZUdlb21ldHJ5U3RyaW5nUHJvcGVydHkgKSxcclxuICBESUFUT01JQzogbmV3IE1vbGVjdWxlR2VvbWV0cnlWYWx1ZSggMSwgTW9sZWN1bGVTaGFwZXNTdHJpbmdzLnNoYXBlLmRpYXRvbWljU3RyaW5nUHJvcGVydHkgKSxcclxuICBMSU5FQVI6IG5ldyBNb2xlY3VsZUdlb21ldHJ5VmFsdWUoIDIsIE1vbGVjdWxlU2hhcGVzU3RyaW5ncy5zaGFwZS5saW5lYXJTdHJpbmdQcm9wZXJ0eSApLCAvLyBlID0gMCwzLDRcclxuICBCRU5UOiBuZXcgTW9sZWN1bGVHZW9tZXRyeVZhbHVlKCAyLCBNb2xlY3VsZVNoYXBlc1N0cmluZ3Muc2hhcGUuYmVudFN0cmluZ1Byb3BlcnR5ICksIC8vIGUgPSAxLDJcclxuICBUUklHT05BTF9QTEFOQVI6IG5ldyBNb2xlY3VsZUdlb21ldHJ5VmFsdWUoIDMsIE1vbGVjdWxlU2hhcGVzU3RyaW5ncy5zaGFwZS50cmlnb25hbFBsYW5hclN0cmluZ1Byb3BlcnR5ICksIC8vIGUgPSAwXHJcbiAgVFJJR09OQUxfUFlSQU1JREFMOiBuZXcgTW9sZWN1bGVHZW9tZXRyeVZhbHVlKCAzLCBNb2xlY3VsZVNoYXBlc1N0cmluZ3Muc2hhcGUudHJpZ29uYWxQeXJhbWlkYWxTdHJpbmdQcm9wZXJ0eSApLCAvLyBlID0gMVxyXG4gIFRfU0hBUEVEOiBuZXcgTW9sZWN1bGVHZW9tZXRyeVZhbHVlKCAzLCBNb2xlY3VsZVNoYXBlc1N0cmluZ3Muc2hhcGUudFNoYXBlZFN0cmluZ1Byb3BlcnR5ICksIC8vIGUgPSAyLDNcclxuICBURVRSQUhFRFJBTDogbmV3IE1vbGVjdWxlR2VvbWV0cnlWYWx1ZSggNCwgTW9sZWN1bGVTaGFwZXNTdHJpbmdzLnNoYXBlLnRldHJhaGVkcmFsU3RyaW5nUHJvcGVydHkgKSwgLy8gZSA9IDBcclxuICBTRUVTQVc6IG5ldyBNb2xlY3VsZUdlb21ldHJ5VmFsdWUoIDQsIE1vbGVjdWxlU2hhcGVzU3RyaW5ncy5zaGFwZS5zZWVzYXdTdHJpbmdQcm9wZXJ0eSApLCAvLyBlID0gMVxyXG4gIFNRVUFSRV9QTEFOQVI6IG5ldyBNb2xlY3VsZUdlb21ldHJ5VmFsdWUoIDQsIE1vbGVjdWxlU2hhcGVzU3RyaW5ncy5zaGFwZS5zcXVhcmVQbGFuYXJTdHJpbmdQcm9wZXJ0eSApLCAvLyBlID0gMlxyXG4gIFRSSUdPTkFMX0JJUFlSQU1JREFMOiBuZXcgTW9sZWN1bGVHZW9tZXRyeVZhbHVlKCA1LCBNb2xlY3VsZVNoYXBlc1N0cmluZ3Muc2hhcGUudHJpZ29uYWxCaXB5cmFtaWRhbFN0cmluZ1Byb3BlcnR5ICksIC8vIGUgPSAwXHJcbiAgU1FVQVJFX1BZUkFNSURBTDogbmV3IE1vbGVjdWxlR2VvbWV0cnlWYWx1ZSggNSwgTW9sZWN1bGVTaGFwZXNTdHJpbmdzLnNoYXBlLnNxdWFyZVB5cmFtaWRhbFN0cmluZ1Byb3BlcnR5ICksIC8vIGUgPSAxXHJcbiAgT0NUQUhFRFJBTDogbmV3IE1vbGVjdWxlR2VvbWV0cnlWYWx1ZSggNiwgTW9sZWN1bGVTaGFwZXNTdHJpbmdzLnNoYXBlLm9jdGFoZWRyYWxTdHJpbmdQcm9wZXJ0eSApIC8vIGUgPSAwXHJcbn0sIHtcclxuICBiZWZvcmVGcmVlemU6IE1vbGVjdWxlR2VvbWV0cnkgPT4ge1xyXG4gICAgLypcclxuICAgICAqIExvb2t1cCBmb3IgdGhlIGNvbmZpZ3VyYXRpb24sIGJhc2VkIG9uIHRoZSBudW1iZXIgb2YgcGFpciBncm91cHMgaXQgY29udGFpbnMuXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHggLSBOdW1iZXIgb2YgcmFkaWFsIGF0b21zIGNvbm5lY3RlZCB0byB0aGUgY2VudHJhbCBhdG9tXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZSAtIE51bWJlciBvZiByYWRpYWwgbG9uZSBwYWlycyBjb25uZWN0ZWQgdG8gdGhlIGNlbnRyYWwgYXRvbVxyXG4gICAgICogQHJldHVybnMge01vbGVjdWxlR2VvbWV0cnl9XHJcbiAgICAgKi9cclxuICAgIE1vbGVjdWxlR2VvbWV0cnkuZ2V0Q29uZmlndXJhdGlvbiA9ICggeCwgZSApID0+IHtcclxuICAgICAgLy8gZmlndXJlIG91dCB3aGF0IHRoZSBuYW1lIGlzXHJcbiAgICAgIGlmICggeCA9PT0gMCApIHtcclxuICAgICAgICByZXR1cm4gTW9sZWN1bGVHZW9tZXRyeS5FTVBUWTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggeCA9PT0gMSApIHtcclxuICAgICAgICByZXR1cm4gTW9sZWN1bGVHZW9tZXRyeS5ESUFUT01JQztcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggeCA9PT0gMiApIHtcclxuICAgICAgICBpZiAoIGUgPT09IDAgfHwgZSA9PT0gMyB8fCBlID09PSA0ICkge1xyXG4gICAgICAgICAgcmV0dXJuIE1vbGVjdWxlR2VvbWV0cnkuTElORUFSO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggZSA9PT0gMSB8fCBlID09PSAyICkge1xyXG4gICAgICAgICAgcmV0dXJuIE1vbGVjdWxlR2VvbWV0cnkuQkVOVDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGBpbnZhbGlkIHg6ICR7eH0sIGU6ICR7ZX1gICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCB4ID09PSAzICkge1xyXG4gICAgICAgIGlmICggZSA9PT0gMCApIHtcclxuICAgICAgICAgIHJldHVybiBNb2xlY3VsZUdlb21ldHJ5LlRSSUdPTkFMX1BMQU5BUjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIGUgPT09IDEgKSB7XHJcbiAgICAgICAgICByZXR1cm4gTW9sZWN1bGVHZW9tZXRyeS5UUklHT05BTF9QWVJBTUlEQUw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBlID09PSAyIHx8IGUgPT09IDMgKSB7XHJcbiAgICAgICAgICByZXR1cm4gTW9sZWN1bGVHZW9tZXRyeS5UX1NIQVBFRDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGBpbnZhbGlkIHg6ICR7eH0sIGU6ICR7ZX1gICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCB4ID09PSA0ICkge1xyXG4gICAgICAgIGlmICggZSA9PT0gMCApIHtcclxuICAgICAgICAgIHJldHVybiBNb2xlY3VsZUdlb21ldHJ5LlRFVFJBSEVEUkFMO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggZSA9PT0gMSApIHtcclxuICAgICAgICAgIHJldHVybiBNb2xlY3VsZUdlb21ldHJ5LlNFRVNBVztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIGUgPT09IDIgKSB7XHJcbiAgICAgICAgICByZXR1cm4gTW9sZWN1bGVHZW9tZXRyeS5TUVVBUkVfUExBTkFSO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvciggYGludmFsaWQgeDogJHt4fSwgZTogJHtlfWAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHggPT09IDUgKSB7XHJcbiAgICAgICAgaWYgKCBlID09PSAwICkge1xyXG4gICAgICAgICAgcmV0dXJuIE1vbGVjdWxlR2VvbWV0cnkuVFJJR09OQUxfQklQWVJBTUlEQUw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBlID09PSAxICkge1xyXG4gICAgICAgICAgcmV0dXJuIE1vbGVjdWxlR2VvbWV0cnkuU1FVQVJFX1BZUkFNSURBTDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGBpbnZhbGlkIHg6ICR7eH0sIGU6ICR7ZX1gICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCB4ID09PSA2ICkge1xyXG4gICAgICAgIGlmICggZSA9PT0gMCApIHtcclxuICAgICAgICAgIHJldHVybiBNb2xlY3VsZUdlb21ldHJ5Lk9DVEFIRURSQUw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgaW52YWxpZCB4OiAke3h9LCBlOiAke2V9YCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGB1bmtub3duIFZTRVBSIGNvbmZpZ3VyYXRpb24geDogJHt4fSwgZTogJHtlfWAgKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcbn0gKTtcclxuXHJcbm1vbGVjdWxlU2hhcGVzLnJlZ2lzdGVyKCAnTW9sZWN1bGVHZW9tZXRyeScsIE1vbGVjdWxlR2VvbWV0cnkgKTtcclxuZXhwb3J0IGRlZmF1bHQgTW9sZWN1bGVHZW9tZXRyeTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxNQUFNLE1BQU0saUNBQWlDO0FBQ3BELE9BQU9DLHFCQUFxQixNQUFNLG1EQUFtRDtBQUNyRixPQUFPQyxjQUFjLE1BQU0seUJBQXlCO0FBQ3BELE9BQU9DLHFCQUFxQixNQUFNLGdDQUFnQztBQUVsRSxNQUFNQyxxQkFBcUIsQ0FBQztFQUMxQjtBQUNGO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxDQUFDLEVBQUVDLGNBQWMsRUFBRztJQUMvQjtJQUNBLElBQUksQ0FBQ0QsQ0FBQyxHQUFHQSxDQUFDOztJQUVWO0lBQ0EsSUFBSSxDQUFDQyxjQUFjLEdBQUdBLGNBQWM7RUFDdEM7QUFDRjs7QUFFQTtBQUNBLE9BQU8sTUFBTUMsbUNBQW1DLEdBQUcsSUFBSVQsY0FBYyxDQUFFLEVBQUUsRUFBRTtFQUN6RTtFQUNBO0VBQ0FVLE1BQU0sRUFBRVQsTUFBTSxDQUFDVSxZQUFZLENBQUNDLFlBQVksQ0FBRSxxQ0FBc0MsQ0FBQztFQUNqRkMsV0FBVyxFQUFFLEtBQUs7RUFDbEJDLGNBQWMsRUFBRSxLQUFLO0VBQ3JCQyxt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