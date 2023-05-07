// Copyright 2017-2022, University of Colorado Boulder

/**
 * Snapshot of a scene, saves state needed to restore the scene.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import equalityExplorer from '../../equalityExplorer.js';

// A Term's snapshot is a copy of that Term, and where it appeared on the plate.

// A Plate's snapshot is the set of TermSnapshots for each TermCreator associated with the plate.

// The snapshot for a set of Variables captures the value of each Variable.

export default class Snapshot {
  // Terms on the left plate of the balance scale
  // Terms on the right plate of the balance scale
  // Variable values

  constructor(scene) {
    this.scene = scene;

    // Snapshot of Terms that are on the plates.
    this.leftPlateSnapshot = createPlateSnapshot(scene.scale.leftPlate);
    this.rightPlateSnapshot = createPlateSnapshot(scene.scale.rightPlate);

    // Snapshot of Variable values.
    this.variablesSnapshot = createVariablesSnapshot(scene.variables);
  }

  /**
   * Restores this snapshot.
   */
  restore() {
    // Dispose of all terms, including those on the plates, dragging, or animating.
    // See https://github.com/phetsims/equality-explorer/issues/73
    this.scene.disposeAllTerms();

    // Restore terms to the plates.
    restorePlateSnapshot(this.scene.scale.leftPlate, this.leftPlateSnapshot);
    restorePlateSnapshot(this.scene.scale.rightPlate, this.rightPlateSnapshot);

    // Restore variable values.
    restoreVariablesSnapshot(this.variablesSnapshot);
  }

  /**
   * Disposes this snapshot.
   */
  dispose() {
    disposePlateSnapshot(this.leftPlateSnapshot);
    disposePlateSnapshot(this.rightPlateSnapshot);
  }
}

/**
 * Creates the snapshot for a plate.
 */
function createPlateSnapshot(plate) {
  const plateSnapshot = new Map();
  plate.termCreators.forEach(termCreator => {
    const termSnapshots = termCreator.getTermsOnPlate().map(term => {
      return {
        term: term.copy(),
        cell: plate.getCellForTerm(term)
      };
    });
    plateSnapshot.set(termCreator, termSnapshots);
  });
  assert && assert(plateSnapshot.size === plate.termCreators.length);
  return plateSnapshot;
}

/**
 * Restores the snapshot for a plate. Note that this needs to put a COPY of each Term onto the plate, because terms
 * on the plate may be disposed via the Clear button, and we don't want the snapshot Terms to be affected.
 */
function restorePlateSnapshot(plate, plateSnapshot) {
  assert && assert(plateSnapshot.size === plate.termCreators.length);
  plate.termCreators.forEach(termCreator => {
    termCreator.disposeAllTerms();
    const termSnapshots = plateSnapshot.get(termCreator);
    assert && assert(termSnapshots);
    termSnapshots.forEach(termSnapshot => termCreator.putTermOnPlate(termSnapshot.term.copy(), termSnapshot.cell));
  });
}

/**
 * Disposes of the snapshot for a plate, including all Terms that make up that snapshot.
 * @param plateSnapshot
 */
function disposePlateSnapshot(plateSnapshot) {
  plateSnapshot.forEach(termSnapshots => termSnapshots.forEach(termSnapshot => termSnapshot.term.dispose()));
}

/**
 * Creates a snapshot for a set of Variables.
 */
function createVariablesSnapshot(variables) {
  const variablesSnapshot = new Map();
  if (variables) {
    variables.forEach(variable => {
      variablesSnapshot.set(variable, variable.valueProperty.value);
    });
  }
  return variablesSnapshot;
}

/**
 * Restores the snapshot for a set of Variables.
 */
function restoreVariablesSnapshot(variablesSnapshot) {
  variablesSnapshot.forEach((value, variable) => {
    variable.valueProperty.value = value;
  });
}
equalityExplorer.register('Snapshot', Snapshot);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJlcXVhbGl0eUV4cGxvcmVyIiwiU25hcHNob3QiLCJjb25zdHJ1Y3RvciIsInNjZW5lIiwibGVmdFBsYXRlU25hcHNob3QiLCJjcmVhdGVQbGF0ZVNuYXBzaG90Iiwic2NhbGUiLCJsZWZ0UGxhdGUiLCJyaWdodFBsYXRlU25hcHNob3QiLCJyaWdodFBsYXRlIiwidmFyaWFibGVzU25hcHNob3QiLCJjcmVhdGVWYXJpYWJsZXNTbmFwc2hvdCIsInZhcmlhYmxlcyIsInJlc3RvcmUiLCJkaXNwb3NlQWxsVGVybXMiLCJyZXN0b3JlUGxhdGVTbmFwc2hvdCIsInJlc3RvcmVWYXJpYWJsZXNTbmFwc2hvdCIsImRpc3Bvc2UiLCJkaXNwb3NlUGxhdGVTbmFwc2hvdCIsInBsYXRlIiwicGxhdGVTbmFwc2hvdCIsIk1hcCIsInRlcm1DcmVhdG9ycyIsImZvckVhY2giLCJ0ZXJtQ3JlYXRvciIsInRlcm1TbmFwc2hvdHMiLCJnZXRUZXJtc09uUGxhdGUiLCJtYXAiLCJ0ZXJtIiwiY29weSIsImNlbGwiLCJnZXRDZWxsRm9yVGVybSIsInNldCIsImFzc2VydCIsInNpemUiLCJsZW5ndGgiLCJnZXQiLCJ0ZXJtU25hcHNob3QiLCJwdXRUZXJtT25QbGF0ZSIsInZhcmlhYmxlIiwidmFsdWVQcm9wZXJ0eSIsInZhbHVlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTbmFwc2hvdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTbmFwc2hvdCBvZiBhIHNjZW5lLCBzYXZlcyBzdGF0ZSBuZWVkZWQgdG8gcmVzdG9yZSB0aGUgc2NlbmUuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IGVxdWFsaXR5RXhwbG9yZXIgZnJvbSAnLi4vLi4vZXF1YWxpdHlFeHBsb3Jlci5qcyc7XHJcbmltcG9ydCBFcXVhbGl0eUV4cGxvcmVyU2NlbmUgZnJvbSAnLi9FcXVhbGl0eUV4cGxvcmVyU2NlbmUuanMnO1xyXG5pbXBvcnQgUGxhdGUgZnJvbSAnLi9QbGF0ZS5qcyc7XHJcbmltcG9ydCBUZXJtIGZyb20gJy4vVGVybS5qcyc7XHJcbmltcG9ydCBUZXJtQ3JlYXRvciBmcm9tICcuL1Rlcm1DcmVhdG9yLmpzJztcclxuaW1wb3J0IFZhcmlhYmxlIGZyb20gJy4vVmFyaWFibGUuanMnO1xyXG5cclxuLy8gQSBUZXJtJ3Mgc25hcHNob3QgaXMgYSBjb3B5IG9mIHRoYXQgVGVybSwgYW5kIHdoZXJlIGl0IGFwcGVhcmVkIG9uIHRoZSBwbGF0ZS5cclxudHlwZSBUZXJtU25hcHNob3QgPSB7XHJcbiAgdGVybTogVGVybTsgLy8gY29weSBvZiB0aGUgVGVybSwgd2hpY2ggd2lsbCBiZSB1c2VkIHRvIHJlc3RvcmUgYSBzbmFwc2hvdFxyXG4gIGNlbGw6IG51bWJlcjsgLy8gY2VsbCB0aGF0IHRoZSBUZXJtIG9jY3VwaWVzIGluIHRoZSBncmlkIGFzc29jaWF0ZWQgd2l0aCBhIGJhbGFuY2Utc2NhbGUgcGxhdGVcclxufTtcclxuXHJcbi8vIEEgUGxhdGUncyBzbmFwc2hvdCBpcyB0aGUgc2V0IG9mIFRlcm1TbmFwc2hvdHMgZm9yIGVhY2ggVGVybUNyZWF0b3IgYXNzb2NpYXRlZCB3aXRoIHRoZSBwbGF0ZS5cclxudHlwZSBQbGF0ZVNuYXBzaG90ID0gTWFwPFRlcm1DcmVhdG9yLCBUZXJtU25hcHNob3RbXT47XHJcblxyXG4vLyBUaGUgc25hcHNob3QgZm9yIGEgc2V0IG9mIFZhcmlhYmxlcyBjYXB0dXJlcyB0aGUgdmFsdWUgb2YgZWFjaCBWYXJpYWJsZS5cclxudHlwZSBWYXJpYWJsZXNTbmFwc2hvdCA9IE1hcDxWYXJpYWJsZSwgbnVtYmVyPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNuYXBzaG90IHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBzY2VuZTogRXF1YWxpdHlFeHBsb3JlclNjZW5lO1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGxlZnRQbGF0ZVNuYXBzaG90OiBQbGF0ZVNuYXBzaG90OyAvLyBUZXJtcyBvbiB0aGUgbGVmdCBwbGF0ZSBvZiB0aGUgYmFsYW5jZSBzY2FsZVxyXG4gIHByaXZhdGUgcmVhZG9ubHkgcmlnaHRQbGF0ZVNuYXBzaG90OiBQbGF0ZVNuYXBzaG90OyAvLyBUZXJtcyBvbiB0aGUgcmlnaHQgcGxhdGUgb2YgdGhlIGJhbGFuY2Ugc2NhbGVcclxuICBwcml2YXRlIHJlYWRvbmx5IHZhcmlhYmxlc1NuYXBzaG90OiBWYXJpYWJsZXNTbmFwc2hvdDsgLy8gVmFyaWFibGUgdmFsdWVzXHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc2NlbmU6IEVxdWFsaXR5RXhwbG9yZXJTY2VuZSApIHtcclxuXHJcbiAgICB0aGlzLnNjZW5lID0gc2NlbmU7XHJcblxyXG4gICAgLy8gU25hcHNob3Qgb2YgVGVybXMgdGhhdCBhcmUgb24gdGhlIHBsYXRlcy5cclxuICAgIHRoaXMubGVmdFBsYXRlU25hcHNob3QgPSBjcmVhdGVQbGF0ZVNuYXBzaG90KCBzY2VuZS5zY2FsZS5sZWZ0UGxhdGUgKTtcclxuICAgIHRoaXMucmlnaHRQbGF0ZVNuYXBzaG90ID0gY3JlYXRlUGxhdGVTbmFwc2hvdCggc2NlbmUuc2NhbGUucmlnaHRQbGF0ZSApO1xyXG5cclxuICAgIC8vIFNuYXBzaG90IG9mIFZhcmlhYmxlIHZhbHVlcy5cclxuICAgIHRoaXMudmFyaWFibGVzU25hcHNob3QgPSBjcmVhdGVWYXJpYWJsZXNTbmFwc2hvdCggc2NlbmUudmFyaWFibGVzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXN0b3JlcyB0aGlzIHNuYXBzaG90LlxyXG4gICAqL1xyXG4gIHB1YmxpYyByZXN0b3JlKCk6IHZvaWQge1xyXG5cclxuICAgIC8vIERpc3Bvc2Ugb2YgYWxsIHRlcm1zLCBpbmNsdWRpbmcgdGhvc2Ugb24gdGhlIHBsYXRlcywgZHJhZ2dpbmcsIG9yIGFuaW1hdGluZy5cclxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZXF1YWxpdHktZXhwbG9yZXIvaXNzdWVzLzczXHJcbiAgICB0aGlzLnNjZW5lLmRpc3Bvc2VBbGxUZXJtcygpO1xyXG5cclxuICAgIC8vIFJlc3RvcmUgdGVybXMgdG8gdGhlIHBsYXRlcy5cclxuICAgIHJlc3RvcmVQbGF0ZVNuYXBzaG90KCB0aGlzLnNjZW5lLnNjYWxlLmxlZnRQbGF0ZSwgdGhpcy5sZWZ0UGxhdGVTbmFwc2hvdCApO1xyXG4gICAgcmVzdG9yZVBsYXRlU25hcHNob3QoIHRoaXMuc2NlbmUuc2NhbGUucmlnaHRQbGF0ZSwgdGhpcy5yaWdodFBsYXRlU25hcHNob3QgKTtcclxuXHJcbiAgICAvLyBSZXN0b3JlIHZhcmlhYmxlIHZhbHVlcy5cclxuICAgIHJlc3RvcmVWYXJpYWJsZXNTbmFwc2hvdCggdGhpcy52YXJpYWJsZXNTbmFwc2hvdCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGlzcG9zZXMgdGhpcyBzbmFwc2hvdC5cclxuICAgKi9cclxuICBwdWJsaWMgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGRpc3Bvc2VQbGF0ZVNuYXBzaG90KCB0aGlzLmxlZnRQbGF0ZVNuYXBzaG90ICk7XHJcbiAgICBkaXNwb3NlUGxhdGVTbmFwc2hvdCggdGhpcy5yaWdodFBsYXRlU25hcHNob3QgKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIHRoZSBzbmFwc2hvdCBmb3IgYSBwbGF0ZS5cclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZVBsYXRlU25hcHNob3QoIHBsYXRlOiBQbGF0ZSApOiBQbGF0ZVNuYXBzaG90IHtcclxuICBjb25zdCBwbGF0ZVNuYXBzaG90ID0gbmV3IE1hcDxUZXJtQ3JlYXRvciwgVGVybVNuYXBzaG90W10+KCk7XHJcbiAgcGxhdGUudGVybUNyZWF0b3JzLmZvckVhY2goIHRlcm1DcmVhdG9yID0+IHtcclxuICAgIGNvbnN0IHRlcm1TbmFwc2hvdHMgPSB0ZXJtQ3JlYXRvci5nZXRUZXJtc09uUGxhdGUoKS5tYXAoIHRlcm0gPT4ge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHRlcm06IHRlcm0uY29weSgpLFxyXG4gICAgICAgIGNlbGw6IHBsYXRlLmdldENlbGxGb3JUZXJtKCB0ZXJtICkhXHJcbiAgICAgIH07XHJcbiAgICB9ICk7XHJcbiAgICBwbGF0ZVNuYXBzaG90LnNldCggdGVybUNyZWF0b3IsIHRlcm1TbmFwc2hvdHMgKTtcclxuICB9ICk7XHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggcGxhdGVTbmFwc2hvdC5zaXplID09PSBwbGF0ZS50ZXJtQ3JlYXRvcnMubGVuZ3RoICk7XHJcbiAgcmV0dXJuIHBsYXRlU25hcHNob3Q7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXN0b3JlcyB0aGUgc25hcHNob3QgZm9yIGEgcGxhdGUuIE5vdGUgdGhhdCB0aGlzIG5lZWRzIHRvIHB1dCBhIENPUFkgb2YgZWFjaCBUZXJtIG9udG8gdGhlIHBsYXRlLCBiZWNhdXNlIHRlcm1zXHJcbiAqIG9uIHRoZSBwbGF0ZSBtYXkgYmUgZGlzcG9zZWQgdmlhIHRoZSBDbGVhciBidXR0b24sIGFuZCB3ZSBkb24ndCB3YW50IHRoZSBzbmFwc2hvdCBUZXJtcyB0byBiZSBhZmZlY3RlZC5cclxuICovXHJcbmZ1bmN0aW9uIHJlc3RvcmVQbGF0ZVNuYXBzaG90KCBwbGF0ZTogUGxhdGUsIHBsYXRlU25hcHNob3Q6IFBsYXRlU25hcHNob3QgKTogdm9pZCB7XHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggcGxhdGVTbmFwc2hvdC5zaXplID09PSBwbGF0ZS50ZXJtQ3JlYXRvcnMubGVuZ3RoICk7XHJcbiAgcGxhdGUudGVybUNyZWF0b3JzLmZvckVhY2goIHRlcm1DcmVhdG9yID0+IHtcclxuICAgIHRlcm1DcmVhdG9yLmRpc3Bvc2VBbGxUZXJtcygpO1xyXG4gICAgY29uc3QgdGVybVNuYXBzaG90cyA9IHBsYXRlU25hcHNob3QuZ2V0KCB0ZXJtQ3JlYXRvciApITtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRlcm1TbmFwc2hvdHMgKTtcclxuICAgIHRlcm1TbmFwc2hvdHMuZm9yRWFjaCggdGVybVNuYXBzaG90ID0+IHRlcm1DcmVhdG9yLnB1dFRlcm1PblBsYXRlKCB0ZXJtU25hcHNob3QudGVybS5jb3B5KCksIHRlcm1TbmFwc2hvdC5jZWxsICkgKTtcclxuICB9ICk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEaXNwb3NlcyBvZiB0aGUgc25hcHNob3QgZm9yIGEgcGxhdGUsIGluY2x1ZGluZyBhbGwgVGVybXMgdGhhdCBtYWtlIHVwIHRoYXQgc25hcHNob3QuXHJcbiAqIEBwYXJhbSBwbGF0ZVNuYXBzaG90XHJcbiAqL1xyXG5mdW5jdGlvbiBkaXNwb3NlUGxhdGVTbmFwc2hvdCggcGxhdGVTbmFwc2hvdDogUGxhdGVTbmFwc2hvdCApOiB2b2lkIHtcclxuICBwbGF0ZVNuYXBzaG90LmZvckVhY2goIHRlcm1TbmFwc2hvdHMgPT4gdGVybVNuYXBzaG90cy5mb3JFYWNoKFxyXG4gICAgdGVybVNuYXBzaG90ID0+IHRlcm1TbmFwc2hvdC50ZXJtLmRpc3Bvc2UoKVxyXG4gICkgKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBzbmFwc2hvdCBmb3IgYSBzZXQgb2YgVmFyaWFibGVzLlxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlVmFyaWFibGVzU25hcHNob3QoIHZhcmlhYmxlczogVmFyaWFibGVbXSB8IG51bGwgKTogVmFyaWFibGVzU25hcHNob3Qge1xyXG4gIGNvbnN0IHZhcmlhYmxlc1NuYXBzaG90ID0gbmV3IE1hcDxWYXJpYWJsZSwgbnVtYmVyPigpO1xyXG4gIGlmICggdmFyaWFibGVzICkge1xyXG4gICAgdmFyaWFibGVzLmZvckVhY2goIHZhcmlhYmxlID0+IHtcclxuICAgICAgdmFyaWFibGVzU25hcHNob3Quc2V0KCB2YXJpYWJsZSwgdmFyaWFibGUudmFsdWVQcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuICByZXR1cm4gdmFyaWFibGVzU25hcHNob3Q7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXN0b3JlcyB0aGUgc25hcHNob3QgZm9yIGEgc2V0IG9mIFZhcmlhYmxlcy5cclxuICovXHJcbmZ1bmN0aW9uIHJlc3RvcmVWYXJpYWJsZXNTbmFwc2hvdCggdmFyaWFibGVzU25hcHNob3Q6IFZhcmlhYmxlc1NuYXBzaG90ICk6IHZvaWQge1xyXG4gIHZhcmlhYmxlc1NuYXBzaG90LmZvckVhY2goICggdmFsdWUsIHZhcmlhYmxlICkgPT4ge1xyXG4gICAgdmFyaWFibGUudmFsdWVQcm9wZXJ0eS52YWx1ZSA9IHZhbHVlO1xyXG4gIH0gKTtcclxufVxyXG5cclxuZXF1YWxpdHlFeHBsb3Jlci5yZWdpc3RlciggJ1NuYXBzaG90JywgU25hcHNob3QgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZ0JBQWdCLE1BQU0sMkJBQTJCOztBQU94RDs7QUFNQTs7QUFHQTs7QUFHQSxlQUFlLE1BQU1DLFFBQVEsQ0FBQztFQUl1QjtFQUNDO0VBQ0c7O0VBRWhEQyxXQUFXQSxDQUFFQyxLQUE0QixFQUFHO0lBRWpELElBQUksQ0FBQ0EsS0FBSyxHQUFHQSxLQUFLOztJQUVsQjtJQUNBLElBQUksQ0FBQ0MsaUJBQWlCLEdBQUdDLG1CQUFtQixDQUFFRixLQUFLLENBQUNHLEtBQUssQ0FBQ0MsU0FBVSxDQUFDO0lBQ3JFLElBQUksQ0FBQ0Msa0JBQWtCLEdBQUdILG1CQUFtQixDQUFFRixLQUFLLENBQUNHLEtBQUssQ0FBQ0csVUFBVyxDQUFDOztJQUV2RTtJQUNBLElBQUksQ0FBQ0MsaUJBQWlCLEdBQUdDLHVCQUF1QixDQUFFUixLQUFLLENBQUNTLFNBQVUsQ0FBQztFQUNyRTs7RUFFQTtBQUNGO0FBQ0E7RUFDU0MsT0FBT0EsQ0FBQSxFQUFTO0lBRXJCO0lBQ0E7SUFDQSxJQUFJLENBQUNWLEtBQUssQ0FBQ1csZUFBZSxDQUFDLENB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