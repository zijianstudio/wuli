// Copyright 2013-2022, University of Colorado Boulder

/**
 * A molecule that behaves with a behavior that doesn't discriminate between bond or atom types (only lone pairs vs
 * bonds). Used in the "Model" screens.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import moleculeShapes from '../../moleculeShapes.js';
import Molecule from './Molecule.js';
import PairGroup from './PairGroup.js';
class VSEPRMolecule extends Molecule {
  constructor() {
    super(false);

    // @public {number|null}
    // Override the length of the displayed bond (the bond will not stretch between both atoms, but will be able to
    // detach from the central atom to stay the same length)
    this.bondLengthOverride = null;
  }

  /**
   * Steps the model.
   * @override
   * @public
   *
   * @param {number} dt - Amount of time elapsed
   */
  update(dt) {
    super.update(dt);
    const radialGroups = this.radialGroups;

    // coulomb-style repulsion around the central atom (or angle-based for terminal lone pairs)
    for (let i = 0; i < this.atoms.length; i++) {
      const atom = this.atoms[i];
      if (this.getNeighborCount(atom) > 1) {
        if (atom.isCentralAtom) {
          // attractive force to the correct position
          const error = this.getLocalShape(atom).applyAttraction(dt);

          // factor that basically states "if we are close to an ideal state, force the coulomb force to ignore differences between bonds and lone pairs based on their distance"
          const trueLengthsRatioOverride = Math.max(0, Math.min(1, Math.log(error + 1) - 0.5));
          for (let j = 0; j < radialGroups.length; j++) {
            const group = radialGroups[j];
            for (let k = 0; k < radialGroups.length; k++) {
              const otherGroup = radialGroups[k];
              if (otherGroup !== group && group !== this.centralAtom) {
                group.repulseFrom(otherGroup, dt, trueLengthsRatioOverride);
              }
            }
          }
        } else {
          // handle terminal lone pairs gracefully
          this.getLocalShape(atom).applyAngleAttractionRepulsion(dt);
        }
      }
    }
  }

  /**
   * Returns the LocalShape around a specific atom.
   * @public
   *
   * @param {PairGroup} atom
   * @returns {LocalShape}
   */
  getLocalShape(atom) {
    return this.getLocalVSEPRShape(atom);
  }

  /**
   * Returns the maximum bond length (either overridden, or the normal bonded pair distance).
   * @override
   * @public
   *
   * @returns {number}
   */
  getMaximumBondLength() {
    // PhET-iO sets a null value
    if (this.bondLengthOverride !== null) {
      return this.bondLengthOverride;
    } else {
      return PairGroup.BONDED_PAIR_DISTANCE;
    }
  }
}
moleculeShapes.register('VSEPRMolecule', VSEPRMolecule);
export default VSEPRMolecule;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtb2xlY3VsZVNoYXBlcyIsIk1vbGVjdWxlIiwiUGFpckdyb3VwIiwiVlNFUFJNb2xlY3VsZSIsImNvbnN0cnVjdG9yIiwiYm9uZExlbmd0aE92ZXJyaWRlIiwidXBkYXRlIiwiZHQiLCJyYWRpYWxHcm91cHMiLCJpIiwiYXRvbXMiLCJsZW5ndGgiLCJhdG9tIiwiZ2V0TmVpZ2hib3JDb3VudCIsImlzQ2VudHJhbEF0b20iLCJlcnJvciIsImdldExvY2FsU2hhcGUiLCJhcHBseUF0dHJhY3Rpb24iLCJ0cnVlTGVuZ3Roc1JhdGlvT3ZlcnJpZGUiLCJNYXRoIiwibWF4IiwibWluIiwibG9nIiwiaiIsImdyb3VwIiwiayIsIm90aGVyR3JvdXAiLCJjZW50cmFsQXRvbSIsInJlcHVsc2VGcm9tIiwiYXBwbHlBbmdsZUF0dHJhY3Rpb25SZXB1bHNpb24iLCJnZXRMb2NhbFZTRVBSU2hhcGUiLCJnZXRNYXhpbXVtQm9uZExlbmd0aCIsIkJPTkRFRF9QQUlSX0RJU1RBTkNFIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJWU0VQUk1vbGVjdWxlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgbW9sZWN1bGUgdGhhdCBiZWhhdmVzIHdpdGggYSBiZWhhdmlvciB0aGF0IGRvZXNuJ3QgZGlzY3JpbWluYXRlIGJldHdlZW4gYm9uZCBvciBhdG9tIHR5cGVzIChvbmx5IGxvbmUgcGFpcnMgdnNcclxuICogYm9uZHMpLiBVc2VkIGluIHRoZSBcIk1vZGVsXCIgc2NyZWVucy5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBtb2xlY3VsZVNoYXBlcyBmcm9tICcuLi8uLi9tb2xlY3VsZVNoYXBlcy5qcyc7XHJcbmltcG9ydCBNb2xlY3VsZSBmcm9tICcuL01vbGVjdWxlLmpzJztcclxuaW1wb3J0IFBhaXJHcm91cCBmcm9tICcuL1BhaXJHcm91cC5qcyc7XHJcblxyXG5jbGFzcyBWU0VQUk1vbGVjdWxlIGV4dGVuZHMgTW9sZWN1bGUge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoIGZhbHNlICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfG51bGx9XHJcbiAgICAvLyBPdmVycmlkZSB0aGUgbGVuZ3RoIG9mIHRoZSBkaXNwbGF5ZWQgYm9uZCAodGhlIGJvbmQgd2lsbCBub3Qgc3RyZXRjaCBiZXR3ZWVuIGJvdGggYXRvbXMsIGJ1dCB3aWxsIGJlIGFibGUgdG9cclxuICAgIC8vIGRldGFjaCBmcm9tIHRoZSBjZW50cmFsIGF0b20gdG8gc3RheSB0aGUgc2FtZSBsZW5ndGgpXHJcbiAgICB0aGlzLmJvbmRMZW5ndGhPdmVycmlkZSA9IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGVwcyB0aGUgbW9kZWwuXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gQW1vdW50IG9mIHRpbWUgZWxhcHNlZFxyXG4gICAqL1xyXG4gIHVwZGF0ZSggZHQgKSB7XHJcbiAgICBzdXBlci51cGRhdGUoIGR0ICk7XHJcblxyXG4gICAgY29uc3QgcmFkaWFsR3JvdXBzID0gdGhpcy5yYWRpYWxHcm91cHM7XHJcblxyXG4gICAgLy8gY291bG9tYi1zdHlsZSByZXB1bHNpb24gYXJvdW5kIHRoZSBjZW50cmFsIGF0b20gKG9yIGFuZ2xlLWJhc2VkIGZvciB0ZXJtaW5hbCBsb25lIHBhaXJzKVxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5hdG9tcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgYXRvbSA9IHRoaXMuYXRvbXNbIGkgXTtcclxuICAgICAgaWYgKCB0aGlzLmdldE5laWdoYm9yQ291bnQoIGF0b20gKSA+IDEgKSB7XHJcbiAgICAgICAgaWYgKCBhdG9tLmlzQ2VudHJhbEF0b20gKSB7XHJcbiAgICAgICAgICAvLyBhdHRyYWN0aXZlIGZvcmNlIHRvIHRoZSBjb3JyZWN0IHBvc2l0aW9uXHJcbiAgICAgICAgICBjb25zdCBlcnJvciA9IHRoaXMuZ2V0TG9jYWxTaGFwZSggYXRvbSApLmFwcGx5QXR0cmFjdGlvbiggZHQgKTtcclxuXHJcbiAgICAgICAgICAvLyBmYWN0b3IgdGhhdCBiYXNpY2FsbHkgc3RhdGVzIFwiaWYgd2UgYXJlIGNsb3NlIHRvIGFuIGlkZWFsIHN0YXRlLCBmb3JjZSB0aGUgY291bG9tYiBmb3JjZSB0byBpZ25vcmUgZGlmZmVyZW5jZXMgYmV0d2VlbiBib25kcyBhbmQgbG9uZSBwYWlycyBiYXNlZCBvbiB0aGVpciBkaXN0YW5jZVwiXHJcbiAgICAgICAgICBjb25zdCB0cnVlTGVuZ3Roc1JhdGlvT3ZlcnJpZGUgPSBNYXRoLm1heCggMCwgTWF0aC5taW4oIDEsIE1hdGgubG9nKCBlcnJvciArIDEgKSAtIDAuNSApICk7XHJcblxyXG4gICAgICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgcmFkaWFsR3JvdXBzLmxlbmd0aDsgaisrICkge1xyXG4gICAgICAgICAgICBjb25zdCBncm91cCA9IHJhZGlhbEdyb3Vwc1sgaiBdO1xyXG4gICAgICAgICAgICBmb3IgKCBsZXQgayA9IDA7IGsgPCByYWRpYWxHcm91cHMubGVuZ3RoOyBrKysgKSB7XHJcbiAgICAgICAgICAgICAgY29uc3Qgb3RoZXJHcm91cCA9IHJhZGlhbEdyb3Vwc1sgayBdO1xyXG5cclxuICAgICAgICAgICAgICBpZiAoIG90aGVyR3JvdXAgIT09IGdyb3VwICYmIGdyb3VwICE9PSB0aGlzLmNlbnRyYWxBdG9tICkge1xyXG4gICAgICAgICAgICAgICAgZ3JvdXAucmVwdWxzZUZyb20oIG90aGVyR3JvdXAsIGR0LCB0cnVlTGVuZ3Roc1JhdGlvT3ZlcnJpZGUgKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAvLyBoYW5kbGUgdGVybWluYWwgbG9uZSBwYWlycyBncmFjZWZ1bGx5XHJcbiAgICAgICAgICB0aGlzLmdldExvY2FsU2hhcGUoIGF0b20gKS5hcHBseUFuZ2xlQXR0cmFjdGlvblJlcHVsc2lvbiggZHQgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIExvY2FsU2hhcGUgYXJvdW5kIGEgc3BlY2lmaWMgYXRvbS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1BhaXJHcm91cH0gYXRvbVxyXG4gICAqIEByZXR1cm5zIHtMb2NhbFNoYXBlfVxyXG4gICAqL1xyXG4gIGdldExvY2FsU2hhcGUoIGF0b20gKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRMb2NhbFZTRVBSU2hhcGUoIGF0b20gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIG1heGltdW0gYm9uZCBsZW5ndGggKGVpdGhlciBvdmVycmlkZGVuLCBvciB0aGUgbm9ybWFsIGJvbmRlZCBwYWlyIGRpc3RhbmNlKS5cclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldE1heGltdW1Cb25kTGVuZ3RoKCkge1xyXG5cclxuICAgIC8vIFBoRVQtaU8gc2V0cyBhIG51bGwgdmFsdWVcclxuICAgIGlmICggdGhpcy5ib25kTGVuZ3RoT3ZlcnJpZGUgIT09IG51bGwgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmJvbmRMZW5ndGhPdmVycmlkZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gUGFpckdyb3VwLkJPTkRFRF9QQUlSX0RJU1RBTkNFO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxubW9sZWN1bGVTaGFwZXMucmVnaXN0ZXIoICdWU0VQUk1vbGVjdWxlJywgVlNFUFJNb2xlY3VsZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgVlNFUFJNb2xlY3VsZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxjQUFjLE1BQU0seUJBQXlCO0FBQ3BELE9BQU9DLFFBQVEsTUFBTSxlQUFlO0FBQ3BDLE9BQU9DLFNBQVMsTUFBTSxnQkFBZ0I7QUFFdEMsTUFBTUMsYUFBYSxTQUFTRixRQUFRLENBQUM7RUFDbkNHLFdBQVdBLENBQUEsRUFBRztJQUNaLEtBQUssQ0FBRSxLQUFNLENBQUM7O0lBRWQ7SUFDQTtJQUNBO0lBQ0EsSUFBSSxDQUFDQyxrQkFBa0IsR0FBRyxJQUFJO0VBQ2hDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLE1BQU1BLENBQUVDLEVBQUUsRUFBRztJQUNYLEtBQUssQ0FBQ0QsTUFBTSxDQUFFQyxFQUFHLENBQUM7SUFFbEIsTUFBTUMsWUFBWSxHQUFHLElBQUksQ0FBQ0EsWUFBWTs7SUFFdEM7SUFDQSxLQUFNLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRyxJQUFJLENBQUNDLEtBQUssQ0FBQ0MsTUFBTSxFQUFFRixDQUFDLEVBQUUsRUFBRztNQUM1QyxNQUFNRyxJQUFJLEdBQUcsSUFBSSxDQUFDRixLQUFLLENBQUVELENBQUMsQ0FBRTtNQUM1QixJQUFLLElBQUksQ0FBQ0ksZ0JBQWdCLENBQUVELElBQUssQ0FBQyxHQUFHLENBQUMsRUFBRztRQUN2QyxJQUFLQSxJQUFJLENBQUNFLGFBQWEsRUFBRztVQUN4QjtVQUNBLE1BQU1DLEtBQUssR0FBRyxJQUFJLENBQUNDLGFBQWEsQ0FBRUosSUFBSyxDQUFDLENBQUNLLGVBQWUsQ0FBRVYsRUFBRyxDQUFDOztVQUU5RDtVQUNBLE1BQU1XLHdCQUF3QixHQUFHQyxJQUFJLENBQUNDLEdBQUcsQ0FBRSxDQUFDLEVBQUVELElBQUksQ0FBQ0UsR0FBRyxDQUFFLENBQUMsRUFBRUYsSUFBSSxDQUFDRyxHQUFHLENBQUVQLEtBQUssR0FBRyxDQUFFLENBQUMsR0FBRyxHQUFJLENBQUUsQ0FBQztVQUUxRixLQUFNLElBQUlRLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR2YsWUFBWSxDQUFDRyxNQUFNLEVBQUVZLENBQUMsRUFBRSxFQUFHO1lBQzlDLE1BQU1DLEtBQUssR0FBR2hCLFlBQVksQ0FBRWUsQ0FBQyxDQUFFO1lBQy9CLEtBQU0sSUFBSUUsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHakIsWUFBWSxDQUFDRyxNQUFNLEVBQUVjLENBQUMsRUFBRSxFQUFHO2NBQzlDLE1BQU1DLFVBQVUsR0FBR2xCLFlBQVksQ0FBRWlCLENBQUMsQ0FBRTtjQUVwQyxJQUFLQyxVQUFVLEtBQUtGLEtBQUssSUFBSUEsS0FBSyxLQUFLLElBQUksQ0FBQ0csV0FBVyxFQUFHO2dCQUN4REgsS0FBSyxDQUFDSSxXQUFXLENBQUVGLFVBQVUsRUFBRW5CLEVBQUUsRUFBRVcsd0JBQXlCLENBQUM7Y0FDL0Q7WUFDRjtVQUNGO1FBQ0YsQ0FBQyxNQUNJO1VBQ0g7VUFDQSxJQUFJLENBQUNGLGFBQWEsQ0FBRUosSUFBSyxDQUFDLENBQUNpQiw2QkFBNkIsQ0FBRXRCLEVBQUcsQ0FBQztRQUNoRTtNQUNGO0lBQ0Y7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFUyxhQUFhQSxDQUFFSixJQUFJLEVBQUc7SUFDcEIsT0FBTyxJQUFJLENBQUNrQixrQkFBa0IsQ0FBRWxCLElBQUssQ0FBQztFQUN4Qzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFbUIsb0JBQW9CQSxDQUFBLEVBQUc7SUFFckI7SUFDQSxJQUFLLElBQUksQ0FBQzFCLGtCQUFrQixLQUFLLElBQUksRUFBRztNQUN0QyxPQUFPLElBQUksQ0FBQ0Esa0JBQWtCO0lBQ2hDLENBQUMsTUFDSTtNQUNILE9BQU9ILFNBQVMsQ0FBQzhCLG9CQUFvQjtJQUN2QztFQUNGO0FBQ0Y7QUFFQWhDLGNBQWMsQ0FBQ2lDLFFBQVEsQ0FBRSxlQUFlLEVBQUU5QixhQUFjLENBQUM7QUFFekQsZUFBZUEsYUFBYSJ9