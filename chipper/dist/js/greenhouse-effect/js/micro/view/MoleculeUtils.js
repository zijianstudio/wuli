// Copyright 2021-2022, University of Colorado Boulder

/**
 * Provides utility functions to get information about molecules, such as their name, molecular formula
 * and geometry.
 *
 * At the time of this writing, there are some translated strings for the molecule names. But
 * they are really tied to the control panel, so new strings were added to represent them.
 *
 * @author Jesse Greenberg
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import GreenhouseEffectStrings from '../../GreenhouseEffectStrings.js';
import CH4 from '../model/molecules/CH4.js';
import CO from '../model/molecules/CO.js';
import CO2 from '../model/molecules/CO2.js';
import H2O from '../model/molecules/H2O.js';
import N2 from '../model/molecules/N2.js';
import NO from '../model/molecules/NO.js';
import NO2 from '../model/molecules/NO2.js';
import O from '../model/molecules/O.js';
import O2 from '../model/molecules/O2.js';
import O3 from '../model/molecules/O3.js';
import MolecularFormulaStrings from './MolecularFormulaStrings.js';
const carbonDioxideStringProperty = GreenhouseEffectStrings.a11y.carbonDioxideStringProperty;
const carbonMonoxideStringProperty = GreenhouseEffectStrings.a11y.carbonMonoxideStringProperty;
const diatomicOxygenStringProperty = GreenhouseEffectStrings.a11y.diatomicOxygenStringProperty;
const methaneStringProperty = GreenhouseEffectStrings.a11y.methaneStringProperty;
const nitrogenDioxideStringProperty = GreenhouseEffectStrings.a11y.nitrogenDioxideStringProperty;
const nitrogenStringProperty = GreenhouseEffectStrings.a11y.nitrogenStringProperty;
const oxygenStringProperty = GreenhouseEffectStrings.a11y.oxygenStringProperty;
const ozoneStringProperty = GreenhouseEffectStrings.a11y.ozoneStringProperty;
const waterStringProperty = GreenhouseEffectStrings.a11y.waterStringProperty;
const linearStringProperty = GreenhouseEffectStrings.a11y.linearStringProperty;
const bentStringProperty = GreenhouseEffectStrings.a11y.bentStringProperty;
const tetrahedralStringProperty = GreenhouseEffectStrings.a11y.tetrahedralStringProperty;
const diatomicStringProperty = GreenhouseEffectStrings.a11y.diatomicStringProperty;
const bentGeometryDescriptionStringProperty = GreenhouseEffectStrings.a11y.bentGeometryDescriptionStringProperty;
const tetrahedralGeometryDescriptionStringProperty = GreenhouseEffectStrings.a11y.tetrahedralGeometryDescriptionStringProperty;
const linearGeometryDescriptionStringProperty = GreenhouseEffectStrings.a11y.linearGeometryDescriptionStringProperty;

// constants
class Geometry extends EnumerationValue {
  static LINEAR = new Geometry();
  static BENT = new Geometry();
  static TETRAHEDRAL = new Geometry();
  static DIATOMIC = new Geometry();
  static enumeration = new Enumeration(Geometry);
}
const MolecularGeometryMap = new Map();
MolecularGeometryMap.set(CO, Geometry.LINEAR);
MolecularGeometryMap.set(N2, Geometry.LINEAR);
MolecularGeometryMap.set(O2, Geometry.LINEAR);
MolecularGeometryMap.set(CO2, Geometry.LINEAR);
MolecularGeometryMap.set(NO, Geometry.LINEAR);
MolecularGeometryMap.set(H2O, Geometry.BENT);
MolecularGeometryMap.set(O3, Geometry.BENT);
MolecularGeometryMap.set(CH4, Geometry.TETRAHEDRAL);
MolecularGeometryMap.set(NO2, Geometry.BENT);
MolecularGeometryMap.set(O, Geometry.DIATOMIC);
const MoleculeUtils = {
  /**
   * Get the full molecular name of a molecule. Returns something like "Carbon Dioxide" or "Oxygen".
   *
   * @param {Molecule} molecule
   * @returns {string}
   */
  getMolecularName(molecule) {
    return molecule instanceof CO ? carbonMonoxideStringProperty.value : molecule instanceof N2 ? nitrogenStringProperty.value : molecule instanceof O2 ? oxygenStringProperty.value : molecule instanceof CO2 ? carbonDioxideStringProperty.value : molecule instanceof NO2 ? nitrogenDioxideStringProperty.value : molecule instanceof H2O ? waterStringProperty.value : molecule instanceof O3 ? ozoneStringProperty.value : molecule instanceof CH4 ? methaneStringProperty.value : diatomicOxygenStringProperty.value;
  },
  /**
   * Get the molecular formula for an instance of a Molecule. Returns something like 'CO' or 'N2'.
   *
   * @param {Molecule} molecule
   * @returns {string}
   */
  getMolecularFormula(molecule) {
    return molecule instanceof CO ? MolecularFormulaStrings.CO_FORMULA_STRING : molecule instanceof N2 ? MolecularFormulaStrings.N2_FORMULA_STRING : molecule instanceof O2 ? MolecularFormulaStrings.O2_FORMULA_STRING : molecule instanceof CO2 ? MolecularFormulaStrings.CO2_FORMULA_STRING : molecule instanceof NO2 ? MolecularFormulaStrings.NO2_FORMULA_STRING : molecule instanceof H2O ? MolecularFormulaStrings.H20_FORMULA_STRING : molecule instanceof O3 ? MolecularFormulaStrings.O3_FORMULA_STRING : molecule instanceof CH4 ? MolecularFormulaStrings.CH4_FORMULA_STRING : molecule instanceof NO ? MolecularFormulaStrings.NO_FORMULA_STRING : MolecularFormulaStrings.O_FORMULA_STRING;
  },
  /**
   * Get a label string for the geometry of a molecule. To be seen by the user in some context. Will
   * return something like 'linear' or 'bent'.
   *
   * @param {Molecule} molecule
   * @returns {string}
   */
  getGeometryLabel(molecule) {
    let labelString = '';
    const geometry = MolecularGeometryMap.get(molecule.constructor);
    if (geometry === Geometry.LINEAR) {
      labelString = linearStringProperty.value;
    } else if (geometry === Geometry.BENT) {
      labelString = bentStringProperty.value;
    } else if (geometry === Geometry.TETRAHEDRAL) {
      labelString = tetrahedralStringProperty.value;
    } else if (geometry === Geometry.DIATOMIC) {
      labelString = diatomicStringProperty.value;
    } else {
      throw new Error('requesting geometry label for a geometry that is not registered');
    }
    return labelString;
  },
  /**
   * Returns a title of the molecular geometry, meant to describe geometry on its own. Will return
   * something like "Linear" or "Bent".
   *
   * @param {Molecule} molecule
   * @returns {string}
   */
  getGeometryTitleString(molecule) {
    let titleString = '';
    const geometry = MolecularGeometryMap.get(molecule.constructor);
    if (geometry === Geometry.LINEAR) {
      titleString = linearStringProperty.value;
    } else if (geometry === Geometry.BENT) {
      titleString = bentStringProperty.value;
    } else if (geometry === Geometry.TETRAHEDRAL) {
      titleString = tetrahedralStringProperty.value;
    } else if (geometry === Geometry.DIATOMIC) {
      titleString = diatomicStringProperty.value;
    } else {
      throw new Error('requesting geometry label for a geometry that is not registered');
    }
    return titleString;
  },
  /**
   * Get a description of the molecular geometry. This will be read by the user. Will return a full
   * description like
   *
   * "Linear, molecule with a central atom bonded to one or two other atoms forming a straight line. Bond angle
   * 180 degrees."
   *
   * @param {Molecule} molecule
   * @returns {string}
   */
  getGeometryDescription(molecule) {
    let descriptionString = '';
    const geometry = MolecularGeometryMap.get(molecule.constructor);
    if (geometry === Geometry.LINEAR) {
      descriptionString = linearGeometryDescriptionStringProperty.value;
    } else if (geometry === Geometry.BENT) {
      descriptionString = bentGeometryDescriptionStringProperty.value;
    } else if (geometry === Geometry.TETRAHEDRAL) {
      descriptionString = tetrahedralGeometryDescriptionStringProperty.value;
    } else {
      throw new Error('requesting geometry label for a geometry that is not registered');
    }
    return descriptionString;
  }
};

// @public
// @static
// {Map}
MoleculeUtils.MolecularGeometryMap = MolecularGeometryMap;

// @public
// @static
MoleculeUtils.Geometry = Geometry;
greenhouseEffect.register('MoleculeUtils', MoleculeUtils);
export default MoleculeUtils;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbiIsIkVudW1lcmF0aW9uVmFsdWUiLCJncmVlbmhvdXNlRWZmZWN0IiwiR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MiLCJDSDQiLCJDTyIsIkNPMiIsIkgyTyIsIk4yIiwiTk8iLCJOTzIiLCJPIiwiTzIiLCJPMyIsIk1vbGVjdWxhckZvcm11bGFTdHJpbmdzIiwiY2FyYm9uRGlveGlkZVN0cmluZ1Byb3BlcnR5IiwiYTExeSIsImNhcmJvbk1vbm94aWRlU3RyaW5nUHJvcGVydHkiLCJkaWF0b21pY094eWdlblN0cmluZ1Byb3BlcnR5IiwibWV0aGFuZVN0cmluZ1Byb3BlcnR5Iiwibml0cm9nZW5EaW94aWRlU3RyaW5nUHJvcGVydHkiLCJuaXRyb2dlblN0cmluZ1Byb3BlcnR5Iiwib3h5Z2VuU3RyaW5nUHJvcGVydHkiLCJvem9uZVN0cmluZ1Byb3BlcnR5Iiwid2F0ZXJTdHJpbmdQcm9wZXJ0eSIsImxpbmVhclN0cmluZ1Byb3BlcnR5IiwiYmVudFN0cmluZ1Byb3BlcnR5IiwidGV0cmFoZWRyYWxTdHJpbmdQcm9wZXJ0eSIsImRpYXRvbWljU3RyaW5nUHJvcGVydHkiLCJiZW50R2VvbWV0cnlEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5IiwidGV0cmFoZWRyYWxHZW9tZXRyeURlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkiLCJsaW5lYXJHZW9tZXRyeURlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkiLCJHZW9tZXRyeSIsIkxJTkVBUiIsIkJFTlQiLCJURVRSQUhFRFJBTCIsIkRJQVRPTUlDIiwiZW51bWVyYXRpb24iLCJNb2xlY3VsYXJHZW9tZXRyeU1hcCIsIk1hcCIsInNldCIsIk1vbGVjdWxlVXRpbHMiLCJnZXRNb2xlY3VsYXJOYW1lIiwibW9sZWN1bGUiLCJ2YWx1ZSIsImdldE1vbGVjdWxhckZvcm11bGEiLCJDT19GT1JNVUxBX1NUUklORyIsIk4yX0ZPUk1VTEFfU1RSSU5HIiwiTzJfRk9STVVMQV9TVFJJTkciLCJDTzJfRk9STVVMQV9TVFJJTkciLCJOTzJfRk9STVVMQV9TVFJJTkciLCJIMjBfRk9STVVMQV9TVFJJTkciLCJPM19GT1JNVUxBX1NUUklORyIsIkNINF9GT1JNVUxBX1NUUklORyIsIk5PX0ZPUk1VTEFfU1RSSU5HIiwiT19GT1JNVUxBX1NUUklORyIsImdldEdlb21ldHJ5TGFiZWwiLCJsYWJlbFN0cmluZyIsImdlb21ldHJ5IiwiZ2V0IiwiY29uc3RydWN0b3IiLCJFcnJvciIsImdldEdlb21ldHJ5VGl0bGVTdHJpbmciLCJ0aXRsZVN0cmluZyIsImdldEdlb21ldHJ5RGVzY3JpcHRpb24iLCJkZXNjcmlwdGlvblN0cmluZyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTW9sZWN1bGVVdGlscy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBQcm92aWRlcyB1dGlsaXR5IGZ1bmN0aW9ucyB0byBnZXQgaW5mb3JtYXRpb24gYWJvdXQgbW9sZWN1bGVzLCBzdWNoIGFzIHRoZWlyIG5hbWUsIG1vbGVjdWxhciBmb3JtdWxhXHJcbiAqIGFuZCBnZW9tZXRyeS5cclxuICpcclxuICogQXQgdGhlIHRpbWUgb2YgdGhpcyB3cml0aW5nLCB0aGVyZSBhcmUgc29tZSB0cmFuc2xhdGVkIHN0cmluZ3MgZm9yIHRoZSBtb2xlY3VsZSBuYW1lcy4gQnV0XHJcbiAqIHRoZXkgYXJlIHJlYWxseSB0aWVkIHRvIHRoZSBjb250cm9sIHBhbmVsLCBzbyBuZXcgc3RyaW5ncyB3ZXJlIGFkZGVkIHRvIHJlcHJlc2VudCB0aGVtLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xyXG4gKi9cclxuXHJcbmltcG9ydCBFbnVtZXJhdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb24uanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb25WYWx1ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb25WYWx1ZS5qcyc7XHJcbmltcG9ydCBncmVlbmhvdXNlRWZmZWN0IGZyb20gJy4uLy4uL2dyZWVuaG91c2VFZmZlY3QuanMnO1xyXG5pbXBvcnQgR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MgZnJvbSAnLi4vLi4vR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuanMnO1xyXG5pbXBvcnQgQ0g0IGZyb20gJy4uL21vZGVsL21vbGVjdWxlcy9DSDQuanMnO1xyXG5pbXBvcnQgQ08gZnJvbSAnLi4vbW9kZWwvbW9sZWN1bGVzL0NPLmpzJztcclxuaW1wb3J0IENPMiBmcm9tICcuLi9tb2RlbC9tb2xlY3VsZXMvQ08yLmpzJztcclxuaW1wb3J0IEgyTyBmcm9tICcuLi9tb2RlbC9tb2xlY3VsZXMvSDJPLmpzJztcclxuaW1wb3J0IE4yIGZyb20gJy4uL21vZGVsL21vbGVjdWxlcy9OMi5qcyc7XHJcbmltcG9ydCBOTyBmcm9tICcuLi9tb2RlbC9tb2xlY3VsZXMvTk8uanMnO1xyXG5pbXBvcnQgTk8yIGZyb20gJy4uL21vZGVsL21vbGVjdWxlcy9OTzIuanMnO1xyXG5pbXBvcnQgTyBmcm9tICcuLi9tb2RlbC9tb2xlY3VsZXMvTy5qcyc7XHJcbmltcG9ydCBPMiBmcm9tICcuLi9tb2RlbC9tb2xlY3VsZXMvTzIuanMnO1xyXG5pbXBvcnQgTzMgZnJvbSAnLi4vbW9kZWwvbW9sZWN1bGVzL08zLmpzJztcclxuaW1wb3J0IE1vbGVjdWxhckZvcm11bGFTdHJpbmdzIGZyb20gJy4vTW9sZWN1bGFyRm9ybXVsYVN0cmluZ3MuanMnO1xyXG5cclxuY29uc3QgY2FyYm9uRGlveGlkZVN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS5jYXJib25EaW94aWRlU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IGNhcmJvbk1vbm94aWRlU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LmNhcmJvbk1vbm94aWRlU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IGRpYXRvbWljT3h5Z2VuU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LmRpYXRvbWljT3h5Z2VuU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IG1ldGhhbmVTdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkubWV0aGFuZVN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBuaXRyb2dlbkRpb3hpZGVTdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkubml0cm9nZW5EaW94aWRlU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IG5pdHJvZ2VuU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5Lm5pdHJvZ2VuU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IG94eWdlblN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS5veHlnZW5TdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgb3pvbmVTdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkub3pvbmVTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgd2F0ZXJTdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkud2F0ZXJTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3QgbGluZWFyU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LmxpbmVhclN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBiZW50U3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LmJlbnRTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3QgdGV0cmFoZWRyYWxTdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkudGV0cmFoZWRyYWxTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3QgZGlhdG9taWNTdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkuZGlhdG9taWNTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3QgYmVudEdlb21ldHJ5RGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkuYmVudEdlb21ldHJ5RGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eTtcclxuY29uc3QgdGV0cmFoZWRyYWxHZW9tZXRyeURlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LnRldHJhaGVkcmFsR2VvbWV0cnlEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBsaW5lYXJHZW9tZXRyeURlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LmxpbmVhckdlb21ldHJ5RGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eTtcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jbGFzcyBHZW9tZXRyeSBleHRlbmRzIEVudW1lcmF0aW9uVmFsdWUge1xyXG4gIHN0YXRpYyBMSU5FQVIgPSBuZXcgR2VvbWV0cnkoKTtcclxuICBzdGF0aWMgQkVOVCA9IG5ldyBHZW9tZXRyeSgpO1xyXG4gIHN0YXRpYyBURVRSQUhFRFJBTCA9IG5ldyBHZW9tZXRyeSgpO1xyXG4gIHN0YXRpYyBESUFUT01JQyA9IG5ldyBHZW9tZXRyeSgpO1xyXG5cclxuICBzdGF0aWMgZW51bWVyYXRpb24gPSBuZXcgRW51bWVyYXRpb24oIEdlb21ldHJ5ICk7XHJcbn1cclxuXHJcbmNvbnN0IE1vbGVjdWxhckdlb21ldHJ5TWFwID0gbmV3IE1hcCgpO1xyXG5Nb2xlY3VsYXJHZW9tZXRyeU1hcC5zZXQoIENPLCBHZW9tZXRyeS5MSU5FQVIgKTtcclxuTW9sZWN1bGFyR2VvbWV0cnlNYXAuc2V0KCBOMiwgR2VvbWV0cnkuTElORUFSICk7XHJcbk1vbGVjdWxhckdlb21ldHJ5TWFwLnNldCggTzIsIEdlb21ldHJ5LkxJTkVBUiApO1xyXG5Nb2xlY3VsYXJHZW9tZXRyeU1hcC5zZXQoIENPMiwgR2VvbWV0cnkuTElORUFSICk7XHJcbk1vbGVjdWxhckdlb21ldHJ5TWFwLnNldCggTk8sIEdlb21ldHJ5LkxJTkVBUiApO1xyXG5Nb2xlY3VsYXJHZW9tZXRyeU1hcC5zZXQoIEgyTywgR2VvbWV0cnkuQkVOVCApO1xyXG5Nb2xlY3VsYXJHZW9tZXRyeU1hcC5zZXQoIE8zLCBHZW9tZXRyeS5CRU5UICk7XHJcbk1vbGVjdWxhckdlb21ldHJ5TWFwLnNldCggQ0g0LCBHZW9tZXRyeS5URVRSQUhFRFJBTCApO1xyXG5Nb2xlY3VsYXJHZW9tZXRyeU1hcC5zZXQoIE5PMiwgR2VvbWV0cnkuQkVOVCApO1xyXG5Nb2xlY3VsYXJHZW9tZXRyeU1hcC5zZXQoIE8sIEdlb21ldHJ5LkRJQVRPTUlDICk7XHJcblxyXG5jb25zdCBNb2xlY3VsZVV0aWxzID0ge1xyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGZ1bGwgbW9sZWN1bGFyIG5hbWUgb2YgYSBtb2xlY3VsZS4gUmV0dXJucyBzb21ldGhpbmcgbGlrZSBcIkNhcmJvbiBEaW94aWRlXCIgb3IgXCJPeHlnZW5cIi5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TW9sZWN1bGV9IG1vbGVjdWxlXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRNb2xlY3VsYXJOYW1lKCBtb2xlY3VsZSApIHtcclxuICAgIHJldHVybiBtb2xlY3VsZSBpbnN0YW5jZW9mIENPID8gY2FyYm9uTW9ub3hpZGVTdHJpbmdQcm9wZXJ0eS52YWx1ZSA6XHJcbiAgICAgICAgICAgbW9sZWN1bGUgaW5zdGFuY2VvZiBOMiA/IG5pdHJvZ2VuU3RyaW5nUHJvcGVydHkudmFsdWUgOlxyXG4gICAgICAgICAgIG1vbGVjdWxlIGluc3RhbmNlb2YgTzIgPyBveHlnZW5TdHJpbmdQcm9wZXJ0eS52YWx1ZSA6XHJcbiAgICAgICAgICAgbW9sZWN1bGUgaW5zdGFuY2VvZiBDTzIgPyBjYXJib25EaW94aWRlU3RyaW5nUHJvcGVydHkudmFsdWUgOlxyXG4gICAgICAgICAgIG1vbGVjdWxlIGluc3RhbmNlb2YgTk8yID8gbml0cm9nZW5EaW94aWRlU3RyaW5nUHJvcGVydHkudmFsdWUgOlxyXG4gICAgICAgICAgIG1vbGVjdWxlIGluc3RhbmNlb2YgSDJPID8gd2F0ZXJTdHJpbmdQcm9wZXJ0eS52YWx1ZSA6XHJcbiAgICAgICAgICAgbW9sZWN1bGUgaW5zdGFuY2VvZiBPMyA/IG96b25lU3RyaW5nUHJvcGVydHkudmFsdWUgOlxyXG4gICAgICAgICAgIG1vbGVjdWxlIGluc3RhbmNlb2YgQ0g0ID8gbWV0aGFuZVN0cmluZ1Byb3BlcnR5LnZhbHVlIDpcclxuICAgICAgICAgICBkaWF0b21pY094eWdlblN0cmluZ1Byb3BlcnR5LnZhbHVlO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgbW9sZWN1bGFyIGZvcm11bGEgZm9yIGFuIGluc3RhbmNlIG9mIGEgTW9sZWN1bGUuIFJldHVybnMgc29tZXRoaW5nIGxpa2UgJ0NPJyBvciAnTjInLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNb2xlY3VsZX0gbW9sZWN1bGVcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldE1vbGVjdWxhckZvcm11bGEoIG1vbGVjdWxlICkge1xyXG4gICAgcmV0dXJuIG1vbGVjdWxlIGluc3RhbmNlb2YgQ08gPyBNb2xlY3VsYXJGb3JtdWxhU3RyaW5ncy5DT19GT1JNVUxBX1NUUklORyA6XHJcbiAgICAgICAgICAgbW9sZWN1bGUgaW5zdGFuY2VvZiBOMiA/IE1vbGVjdWxhckZvcm11bGFTdHJpbmdzLk4yX0ZPUk1VTEFfU1RSSU5HIDpcclxuICAgICAgICAgICBtb2xlY3VsZSBpbnN0YW5jZW9mIE8yID8gTW9sZWN1bGFyRm9ybXVsYVN0cmluZ3MuTzJfRk9STVVMQV9TVFJJTkcgOlxyXG4gICAgICAgICAgIG1vbGVjdWxlIGluc3RhbmNlb2YgQ08yID8gTW9sZWN1bGFyRm9ybXVsYVN0cmluZ3MuQ08yX0ZPUk1VTEFfU1RSSU5HIDpcclxuICAgICAgICAgICBtb2xlY3VsZSBpbnN0YW5jZW9mIE5PMiA/IE1vbGVjdWxhckZvcm11bGFTdHJpbmdzLk5PMl9GT1JNVUxBX1NUUklORyA6XHJcbiAgICAgICAgICAgbW9sZWN1bGUgaW5zdGFuY2VvZiBIMk8gPyBNb2xlY3VsYXJGb3JtdWxhU3RyaW5ncy5IMjBfRk9STVVMQV9TVFJJTkcgOlxyXG4gICAgICAgICAgIG1vbGVjdWxlIGluc3RhbmNlb2YgTzMgPyBNb2xlY3VsYXJGb3JtdWxhU3RyaW5ncy5PM19GT1JNVUxBX1NUUklORyA6XHJcbiAgICAgICAgICAgbW9sZWN1bGUgaW5zdGFuY2VvZiBDSDQgPyBNb2xlY3VsYXJGb3JtdWxhU3RyaW5ncy5DSDRfRk9STVVMQV9TVFJJTkcgOlxyXG4gICAgICAgICAgIG1vbGVjdWxlIGluc3RhbmNlb2YgTk8gPyBNb2xlY3VsYXJGb3JtdWxhU3RyaW5ncy5OT19GT1JNVUxBX1NUUklORyA6XHJcbiAgICAgICAgICAgTW9sZWN1bGFyRm9ybXVsYVN0cmluZ3MuT19GT1JNVUxBX1NUUklORztcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBHZXQgYSBsYWJlbCBzdHJpbmcgZm9yIHRoZSBnZW9tZXRyeSBvZiBhIG1vbGVjdWxlLiBUbyBiZSBzZWVuIGJ5IHRoZSB1c2VyIGluIHNvbWUgY29udGV4dC4gV2lsbFxyXG4gICAqIHJldHVybiBzb21ldGhpbmcgbGlrZSAnbGluZWFyJyBvciAnYmVudCcuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge01vbGVjdWxlfSBtb2xlY3VsZVxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0R2VvbWV0cnlMYWJlbCggbW9sZWN1bGUgKSB7XHJcbiAgICBsZXQgbGFiZWxTdHJpbmcgPSAnJztcclxuXHJcbiAgICBjb25zdCBnZW9tZXRyeSA9IE1vbGVjdWxhckdlb21ldHJ5TWFwLmdldCggbW9sZWN1bGUuY29uc3RydWN0b3IgKTtcclxuICAgIGlmICggZ2VvbWV0cnkgPT09IEdlb21ldHJ5LkxJTkVBUiApIHtcclxuICAgICAgbGFiZWxTdHJpbmcgPSBsaW5lYXJTdHJpbmdQcm9wZXJ0eS52YWx1ZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBnZW9tZXRyeSA9PT0gR2VvbWV0cnkuQkVOVCApIHtcclxuICAgICAgbGFiZWxTdHJpbmcgPSBiZW50U3RyaW5nUHJvcGVydHkudmFsdWU7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggZ2VvbWV0cnkgPT09IEdlb21ldHJ5LlRFVFJBSEVEUkFMICkge1xyXG4gICAgICBsYWJlbFN0cmluZyA9IHRldHJhaGVkcmFsU3RyaW5nUHJvcGVydHkudmFsdWU7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggZ2VvbWV0cnkgPT09IEdlb21ldHJ5LkRJQVRPTUlDICkge1xyXG4gICAgICBsYWJlbFN0cmluZyA9IGRpYXRvbWljU3RyaW5nUHJvcGVydHkudmFsdWU7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCAncmVxdWVzdGluZyBnZW9tZXRyeSBsYWJlbCBmb3IgYSBnZW9tZXRyeSB0aGF0IGlzIG5vdCByZWdpc3RlcmVkJyApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBsYWJlbFN0cmluZztcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgdGl0bGUgb2YgdGhlIG1vbGVjdWxhciBnZW9tZXRyeSwgbWVhbnQgdG8gZGVzY3JpYmUgZ2VvbWV0cnkgb24gaXRzIG93bi4gV2lsbCByZXR1cm5cclxuICAgKiBzb21ldGhpbmcgbGlrZSBcIkxpbmVhclwiIG9yIFwiQmVudFwiLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNb2xlY3VsZX0gbW9sZWN1bGVcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldEdlb21ldHJ5VGl0bGVTdHJpbmcoIG1vbGVjdWxlICkge1xyXG4gICAgbGV0IHRpdGxlU3RyaW5nID0gJyc7XHJcblxyXG4gICAgY29uc3QgZ2VvbWV0cnkgPSBNb2xlY3VsYXJHZW9tZXRyeU1hcC5nZXQoIG1vbGVjdWxlLmNvbnN0cnVjdG9yICk7XHJcbiAgICBpZiAoIGdlb21ldHJ5ID09PSBHZW9tZXRyeS5MSU5FQVIgKSB7XHJcbiAgICAgIHRpdGxlU3RyaW5nID0gbGluZWFyU3RyaW5nUHJvcGVydHkudmFsdWU7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggZ2VvbWV0cnkgPT09IEdlb21ldHJ5LkJFTlQgKSB7XHJcbiAgICAgIHRpdGxlU3RyaW5nID0gYmVudFN0cmluZ1Byb3BlcnR5LnZhbHVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGdlb21ldHJ5ID09PSBHZW9tZXRyeS5URVRSQUhFRFJBTCApIHtcclxuICAgICAgdGl0bGVTdHJpbmcgPSB0ZXRyYWhlZHJhbFN0cmluZ1Byb3BlcnR5LnZhbHVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGdlb21ldHJ5ID09PSBHZW9tZXRyeS5ESUFUT01JQyApIHtcclxuICAgICAgdGl0bGVTdHJpbmcgPSBkaWF0b21pY1N0cmluZ1Byb3BlcnR5LnZhbHVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ3JlcXVlc3RpbmcgZ2VvbWV0cnkgbGFiZWwgZm9yIGEgZ2VvbWV0cnkgdGhhdCBpcyBub3QgcmVnaXN0ZXJlZCcgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGl0bGVTdHJpbmc7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGEgZGVzY3JpcHRpb24gb2YgdGhlIG1vbGVjdWxhciBnZW9tZXRyeS4gVGhpcyB3aWxsIGJlIHJlYWQgYnkgdGhlIHVzZXIuIFdpbGwgcmV0dXJuIGEgZnVsbFxyXG4gICAqIGRlc2NyaXB0aW9uIGxpa2VcclxuICAgKlxyXG4gICAqIFwiTGluZWFyLCBtb2xlY3VsZSB3aXRoIGEgY2VudHJhbCBhdG9tIGJvbmRlZCB0byBvbmUgb3IgdHdvIG90aGVyIGF0b21zIGZvcm1pbmcgYSBzdHJhaWdodCBsaW5lLiBCb25kIGFuZ2xlXHJcbiAgICogMTgwIGRlZ3JlZXMuXCJcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TW9sZWN1bGV9IG1vbGVjdWxlXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRHZW9tZXRyeURlc2NyaXB0aW9uKCBtb2xlY3VsZSApIHtcclxuICAgIGxldCBkZXNjcmlwdGlvblN0cmluZyA9ICcnO1xyXG5cclxuICAgIGNvbnN0IGdlb21ldHJ5ID0gTW9sZWN1bGFyR2VvbWV0cnlNYXAuZ2V0KCBtb2xlY3VsZS5jb25zdHJ1Y3RvciApO1xyXG4gICAgaWYgKCBnZW9tZXRyeSA9PT0gR2VvbWV0cnkuTElORUFSICkge1xyXG4gICAgICBkZXNjcmlwdGlvblN0cmluZyA9IGxpbmVhckdlb21ldHJ5RGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eS52YWx1ZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBnZW9tZXRyeSA9PT0gR2VvbWV0cnkuQkVOVCApIHtcclxuICAgICAgZGVzY3JpcHRpb25TdHJpbmcgPSBiZW50R2VvbWV0cnlEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5LnZhbHVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGdlb21ldHJ5ID09PSBHZW9tZXRyeS5URVRSQUhFRFJBTCApIHtcclxuICAgICAgZGVzY3JpcHRpb25TdHJpbmcgPSB0ZXRyYWhlZHJhbEdlb21ldHJ5RGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eS52YWx1ZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoICdyZXF1ZXN0aW5nIGdlb21ldHJ5IGxhYmVsIGZvciBhIGdlb21ldHJ5IHRoYXQgaXMgbm90IHJlZ2lzdGVyZWQnICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGRlc2NyaXB0aW9uU3RyaW5nO1xyXG4gIH1cclxufTtcclxuXHJcbi8vIEBwdWJsaWNcclxuLy8gQHN0YXRpY1xyXG4vLyB7TWFwfVxyXG5Nb2xlY3VsZVV0aWxzLk1vbGVjdWxhckdlb21ldHJ5TWFwID0gTW9sZWN1bGFyR2VvbWV0cnlNYXA7XHJcblxyXG4vLyBAcHVibGljXHJcbi8vIEBzdGF0aWNcclxuTW9sZWN1bGVVdGlscy5HZW9tZXRyeSA9IEdlb21ldHJ5O1xyXG5cclxuZ3JlZW5ob3VzZUVmZmVjdC5yZWdpc3RlciggJ01vbGVjdWxlVXRpbHMnLCBNb2xlY3VsZVV0aWxzICk7XHJcbmV4cG9ydCBkZWZhdWx0IE1vbGVjdWxlVXRpbHM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsV0FBVyxNQUFNLHlDQUF5QztBQUNqRSxPQUFPQyxnQkFBZ0IsTUFBTSw4Q0FBOEM7QUFDM0UsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLHVCQUF1QixNQUFNLGtDQUFrQztBQUN0RSxPQUFPQyxHQUFHLE1BQU0sMkJBQTJCO0FBQzNDLE9BQU9DLEVBQUUsTUFBTSwwQkFBMEI7QUFDekMsT0FBT0MsR0FBRyxNQUFNLDJCQUEyQjtBQUMzQyxPQUFPQyxHQUFHLE1BQU0sMkJBQTJCO0FBQzNDLE9BQU9DLEVBQUUsTUFBTSwwQkFBMEI7QUFDekMsT0FBT0MsRUFBRSxNQUFNLDBCQUEwQjtBQUN6QyxPQUFPQyxHQUFHLE1BQU0sMkJBQTJCO0FBQzNDLE9BQU9DLENBQUMsTUFBTSx5QkFBeUI7QUFDdkMsT0FBT0MsRUFBRSxNQUFNLDBCQUEwQjtBQUN6QyxPQUFPQyxFQUFFLE1BQU0sMEJBQTBCO0FBQ3pDLE9BQU9DLHVCQUF1QixNQUFNLDhCQUE4QjtBQUVsRSxNQUFNQywyQkFBMkIsR0FBR1osdUJBQXVCLENBQUNhLElBQUksQ0FBQ0QsMkJBQTJCO0FBQzVGLE1BQU1FLDRCQUE0QixHQUFHZCx1QkFBdUIsQ0FBQ2EsSUFBSSxD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