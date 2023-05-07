// Copyright 2014-2020, University of Colorado Boulder

/**
 * This class updates the positions of atoms in a water molecule based on the position and rotation information for the
 * molecule.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import statesOfMatter from '../../../statesOfMatter.js';
import WaterMoleculeStructure from './WaterMoleculeStructure.js';

// constants
const STRUCTURE_X = WaterMoleculeStructure.moleculeStructureX;
const STRUCTURE_Y = WaterMoleculeStructure.moleculeStructureY;

// static object (no constructor)
const WaterAtomPositionUpdater = {
  /**
   * @public
   * @param {MoleculeForceAndMotionDataSet} moleculeDataSet
   * @param {number} timeStep
   */
  updateAtomPositions: moleculeDataSet => {
    // Make sure this is not being used on an inappropriate data set.
    assert && assert(moleculeDataSet.getAtomsPerMolecule() === 3);

    // Get direct references to the data in the data set.
    const atomPositions = moleculeDataSet.getAtomPositions();
    const moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
    const moleculeRotationAngles = moleculeDataSet.getMoleculeRotationAngles();

    // other vars
    let xPos;
    let yPos;
    let cosineTheta;
    let sineTheta;

    // Loop through all molecules and position the individual atoms based on center of gravity position, molecule
    // structure, and rotational angle.
    for (let i = 0; i < moleculeDataSet.getNumberOfMolecules(); i++) {
      cosineTheta = Math.cos(moleculeRotationAngles[i]);
      sineTheta = Math.sin(moleculeRotationAngles[i]);
      for (let j = 0; j < 3; j++) {
        const xOffset = cosineTheta * STRUCTURE_X[j] - sineTheta * STRUCTURE_Y[j];
        const yOffset = sineTheta * STRUCTURE_X[j] + cosineTheta * STRUCTURE_Y[j];
        xPos = moleculeCenterOfMassPositions[i].x + xOffset;
        yPos = moleculeCenterOfMassPositions[i].y + yOffset;
        atomPositions[i * 3 + j].setXY(xPos, yPos);
      }
    }
  }
};
statesOfMatter.register('WaterAtomPositionUpdater', WaterAtomPositionUpdater);
export default WaterAtomPositionUpdater;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzdGF0ZXNPZk1hdHRlciIsIldhdGVyTW9sZWN1bGVTdHJ1Y3R1cmUiLCJTVFJVQ1RVUkVfWCIsIm1vbGVjdWxlU3RydWN0dXJlWCIsIlNUUlVDVFVSRV9ZIiwibW9sZWN1bGVTdHJ1Y3R1cmVZIiwiV2F0ZXJBdG9tUG9zaXRpb25VcGRhdGVyIiwidXBkYXRlQXRvbVBvc2l0aW9ucyIsIm1vbGVjdWxlRGF0YVNldCIsImFzc2VydCIsImdldEF0b21zUGVyTW9sZWN1bGUiLCJhdG9tUG9zaXRpb25zIiwiZ2V0QXRvbVBvc2l0aW9ucyIsIm1vbGVjdWxlQ2VudGVyT2ZNYXNzUG9zaXRpb25zIiwiZ2V0TW9sZWN1bGVDZW50ZXJPZk1hc3NQb3NpdGlvbnMiLCJtb2xlY3VsZVJvdGF0aW9uQW5nbGVzIiwiZ2V0TW9sZWN1bGVSb3RhdGlvbkFuZ2xlcyIsInhQb3MiLCJ5UG9zIiwiY29zaW5lVGhldGEiLCJzaW5lVGhldGEiLCJpIiwiZ2V0TnVtYmVyT2ZNb2xlY3VsZXMiLCJNYXRoIiwiY29zIiwic2luIiwiaiIsInhPZmZzZXQiLCJ5T2Zmc2V0IiwieCIsInkiLCJzZXRYWSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiV2F0ZXJBdG9tUG9zaXRpb25VcGRhdGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoaXMgY2xhc3MgdXBkYXRlcyB0aGUgcG9zaXRpb25zIG9mIGF0b21zIGluIGEgd2F0ZXIgbW9sZWN1bGUgYmFzZWQgb24gdGhlIHBvc2l0aW9uIGFuZCByb3RhdGlvbiBpbmZvcm1hdGlvbiBmb3IgdGhlXHJcbiAqIG1vbGVjdWxlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqIEBhdXRob3IgU2lkZGhhcnRoYSBDaGludGhhcGFsbHkgKEFjdHVhbCBDb25jZXB0cylcclxuICovXHJcblxyXG5pbXBvcnQgc3RhdGVzT2ZNYXR0ZXIgZnJvbSAnLi4vLi4vLi4vc3RhdGVzT2ZNYXR0ZXIuanMnO1xyXG5pbXBvcnQgV2F0ZXJNb2xlY3VsZVN0cnVjdHVyZSBmcm9tICcuL1dhdGVyTW9sZWN1bGVTdHJ1Y3R1cmUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFNUUlVDVFVSRV9YID0gV2F0ZXJNb2xlY3VsZVN0cnVjdHVyZS5tb2xlY3VsZVN0cnVjdHVyZVg7XHJcbmNvbnN0IFNUUlVDVFVSRV9ZID0gV2F0ZXJNb2xlY3VsZVN0cnVjdHVyZS5tb2xlY3VsZVN0cnVjdHVyZVk7XHJcblxyXG4vLyBzdGF0aWMgb2JqZWN0IChubyBjb25zdHJ1Y3RvcilcclxuY29uc3QgV2F0ZXJBdG9tUG9zaXRpb25VcGRhdGVyID0ge1xyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtNb2xlY3VsZUZvcmNlQW5kTW90aW9uRGF0YVNldH0gbW9sZWN1bGVEYXRhU2V0XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHRpbWVTdGVwXHJcbiAgICovXHJcbiAgdXBkYXRlQXRvbVBvc2l0aW9uczogbW9sZWN1bGVEYXRhU2V0ID0+IHtcclxuXHJcbiAgICAvLyBNYWtlIHN1cmUgdGhpcyBpcyBub3QgYmVpbmcgdXNlZCBvbiBhbiBpbmFwcHJvcHJpYXRlIGRhdGEgc2V0LlxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbW9sZWN1bGVEYXRhU2V0LmdldEF0b21zUGVyTW9sZWN1bGUoKSA9PT0gMyApO1xyXG5cclxuICAgIC8vIEdldCBkaXJlY3QgcmVmZXJlbmNlcyB0byB0aGUgZGF0YSBpbiB0aGUgZGF0YSBzZXQuXHJcbiAgICBjb25zdCBhdG9tUG9zaXRpb25zID0gbW9sZWN1bGVEYXRhU2V0LmdldEF0b21Qb3NpdGlvbnMoKTtcclxuICAgIGNvbnN0IG1vbGVjdWxlQ2VudGVyT2ZNYXNzUG9zaXRpb25zID0gbW9sZWN1bGVEYXRhU2V0LmdldE1vbGVjdWxlQ2VudGVyT2ZNYXNzUG9zaXRpb25zKCk7XHJcbiAgICBjb25zdCBtb2xlY3VsZVJvdGF0aW9uQW5nbGVzID0gbW9sZWN1bGVEYXRhU2V0LmdldE1vbGVjdWxlUm90YXRpb25BbmdsZXMoKTtcclxuXHJcbiAgICAvLyBvdGhlciB2YXJzXHJcbiAgICBsZXQgeFBvcztcclxuICAgIGxldCB5UG9zO1xyXG4gICAgbGV0IGNvc2luZVRoZXRhO1xyXG4gICAgbGV0IHNpbmVUaGV0YTtcclxuXHJcbiAgICAvLyBMb29wIHRocm91Z2ggYWxsIG1vbGVjdWxlcyBhbmQgcG9zaXRpb24gdGhlIGluZGl2aWR1YWwgYXRvbXMgYmFzZWQgb24gY2VudGVyIG9mIGdyYXZpdHkgcG9zaXRpb24sIG1vbGVjdWxlXHJcbiAgICAvLyBzdHJ1Y3R1cmUsIGFuZCByb3RhdGlvbmFsIGFuZ2xlLlxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbW9sZWN1bGVEYXRhU2V0LmdldE51bWJlck9mTW9sZWN1bGVzKCk7IGkrKyApIHtcclxuICAgICAgY29zaW5lVGhldGEgPSBNYXRoLmNvcyggbW9sZWN1bGVSb3RhdGlvbkFuZ2xlc1sgaSBdICk7XHJcbiAgICAgIHNpbmVUaGV0YSA9IE1hdGguc2luKCBtb2xlY3VsZVJvdGF0aW9uQW5nbGVzWyBpIF0gKTtcclxuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgMzsgaisrICkge1xyXG4gICAgICAgIGNvbnN0IHhPZmZzZXQgPSAoIGNvc2luZVRoZXRhICogU1RSVUNUVVJFX1hbIGogXSApIC0gKCBzaW5lVGhldGEgKiBTVFJVQ1RVUkVfWVsgaiBdICk7XHJcbiAgICAgICAgY29uc3QgeU9mZnNldCA9ICggc2luZVRoZXRhICogU1RSVUNUVVJFX1hbIGogXSApICsgKCBjb3NpbmVUaGV0YSAqIFNUUlVDVFVSRV9ZWyBqIF0gKTtcclxuICAgICAgICB4UG9zID0gbW9sZWN1bGVDZW50ZXJPZk1hc3NQb3NpdGlvbnNbIGkgXS54ICsgeE9mZnNldDtcclxuICAgICAgICB5UG9zID0gbW9sZWN1bGVDZW50ZXJPZk1hc3NQb3NpdGlvbnNbIGkgXS55ICsgeU9mZnNldDtcclxuICAgICAgICBhdG9tUG9zaXRpb25zWyBpICogMyArIGogXS5zZXRYWSggeFBvcywgeVBvcyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG5cclxuc3RhdGVzT2ZNYXR0ZXIucmVnaXN0ZXIoICdXYXRlckF0b21Qb3NpdGlvblVwZGF0ZXInLCBXYXRlckF0b21Qb3NpdGlvblVwZGF0ZXIgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFdhdGVyQXRvbVBvc2l0aW9uVXBkYXRlcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGNBQWMsTUFBTSw0QkFBNEI7QUFDdkQsT0FBT0Msc0JBQXNCLE1BQU0sNkJBQTZCOztBQUVoRTtBQUNBLE1BQU1DLFdBQVcsR0FBR0Qsc0JBQXNCLENBQUNFLGtCQUFrQjtBQUM3RCxNQUFNQyxXQUFXLEdBQUdILHNCQUFzQixDQUFDSSxrQkFBa0I7O0FBRTdEO0FBQ0EsTUFBTUMsd0JBQXdCLEdBQUc7RUFFL0I7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxtQkFBbUIsRUFBRUMsZUFBZSxJQUFJO0lBRXRDO0lBQ0FDLE1BQU0sSUFBSUEsTUFBTSxDQUFFRCxlQUFlLENBQUNFLG1CQUFtQixDQUFDLENBQUMsS0FBSyxDQUFFLENBQUM7O0lBRS9EO0lBQ0EsTUFBTUMsYUFBYSxHQUFHSCxlQUFlLENBQUNJLGdCQUFnQixDQUFDLENBQUM7SUFDeEQsTUFBTUMsNkJBQTZCLEdBQUdMLGVBQWUsQ0FBQ00sZ0NBQWdDLENBQUMsQ0FBQztJQUN4RixNQUFNQyxzQkFBc0IsR0FBR1AsZUFBZSxDQUFDUSx5QkFBeUIsQ0FBQyxDQUFDOztJQUUxRTtJQUNBLElBQUlDLElBQUk7SUFDUixJQUFJQyxJQUFJO0lBQ1IsSUFBSUMsV0FBVztJQUNmLElBQUlDLFNBQVM7O0lBRWI7SUFDQTtJQUNBLEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHYixlQUFlLENBQUNjLG9CQUFvQixDQUFDLENBQUMsRUFBRUQsQ0FBQyxFQUFFLEVBQUc7TUFDakVGLFdBQVcsR0FBR0ksSUFBSSxDQUFDQyxHQUFHLENBQUVULHNCQUFzQixDQUFFTSxDQUFDLENBQUcsQ0FBQztNQUNyREQsU0FBUyxHQUFHRyxJQUFJLENBQUNFLEdBQUcsQ0FBRVYsc0JBQXNCLENBQUVNLENBQUMsQ0FBRyxDQUFDO01BQ25ELEtBQU0sSUFBSUssQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxFQUFFLEVBQUc7UUFDNUIsTUFBTUMsT0FBTyxHQUFLUixXQUFXLEdBQUdqQixXQUFXLENBQUV3QixDQUFDLENBQUUsR0FBT04sU0FBUyxHQUFHaEIsV0FBVyxDQUFFc0IsQ0FBQyxDQUFJO1FBQ3JGLE1BQU1FLE9BQU8sR0FBS1IsU0FBUyxHQUFHbEIsV0FBVyxDQUFFd0IsQ0FBQyxDQUFFLEdBQU9QLFdBQVcsR0FBR2YsV0FBVyxDQUFFc0IsQ0FBQyxDQUFJO1FBQ3JGVCxJQUFJLEdBQUdKLDZCQUE2QixDQUFFUSxDQUFDLENBQUUsQ0FBQ1EsQ0FBQyxHQUFHRixPQUFPO1FBQ3JEVCxJQUFJLEdBQUdMLDZCQUE2QixDQUFFUSxDQUFDLENBQUUsQ0FBQ1MsQ0FBQyxHQUFHRixPQUFPO1FBQ3JEakIsYUFBYSxDQUFFVSxDQUFDLEdBQUcsQ0FBQyxHQUFHSyxDQUFDLENBQUUsQ0FBQ0ssS0FBSyxDQUFFZCxJQUFJLEVBQUVDLElBQUssQ0FBQztNQUNoRDtJQUNGO0VBQ0Y7QUFDRixDQUFDO0FBRURsQixjQUFjLENBQUNnQyxRQUFRLENBQUUsMEJBQTBCLEVBQUUxQix3QkFBeUIsQ0FBQztBQUUvRSxlQUFlQSx3QkFBd0IifQ==