// Copyright 2014-2021, University of Colorado Boulder

/**
 * Definition of the 'cylinder exploration mode' for the exploration model.
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Color } from '../../../../scenery/js/imports.js';
import EstimationConstants from '../../common/EstimationConstants.js';
import CylinderModel from '../../common/model/CylinderModel.js';
import estimation from '../../estimation.js';
import AbstractExplorationMode from './AbstractExplorationMode.js';

// constants
const MAX_CYLINDER_SLICES = 100;
const MODE_NAME = 'cylinders';
const REFERENCE_CYLINDER_WIDTH = 1.5;
const COMPARE_CYLINDER_SIZE = new Dimension2(REFERENCE_CYLINDER_WIDTH, 2);
const VALID_REF_OBJECT_SIZES = [new Dimension2(REFERENCE_CYLINDER_WIDTH, COMPARE_CYLINDER_SIZE.height / 50), new Dimension2(REFERENCE_CYLINDER_WIDTH, COMPARE_CYLINDER_SIZE.height / 20), new Dimension2(REFERENCE_CYLINDER_WIDTH, COMPARE_CYLINDER_SIZE.height / 15), new Dimension2(REFERENCE_CYLINDER_WIDTH, COMPARE_CYLINDER_SIZE.height / 10), new Dimension2(REFERENCE_CYLINDER_WIDTH, COMPARE_CYLINDER_SIZE.height / 5), new Dimension2(REFERENCE_CYLINDER_WIDTH, COMPARE_CYLINDER_SIZE.height / 3), new Dimension2(REFERENCE_CYLINDER_WIDTH, COMPARE_CYLINDER_SIZE.height / 2)];
const INITIAL_REFERENCE_OBJECT_SIZE = VALID_REF_OBJECT_SIZES[2];
class CylinderExplorationMode extends AbstractExplorationMode {
  constructor(selectedModeProperty) {
    super(selectedModeProperty, MODE_NAME);

    // Create the reference, compare, continuous, and discrete objects.
    const compareCylinderPosition = new Vector2(0.75, -0.5);
    this.compareObject = new CylinderModel(COMPARE_CYLINDER_SIZE, compareCylinderPosition, new Color(EstimationConstants.COMPARISON_OBJECT_COLOR).setAlpha(0.5), false, false);
    this.continuousSizableObject = new CylinderModel(new Dimension2(2, 1), compareCylinderPosition, EstimationConstants.REFERENCE_OBJECT_COLOR, false, false);
    this.referenceObject = new CylinderModel(INITIAL_REFERENCE_OBJECT_SIZE, new Vector2(-2.0, 0), EstimationConstants.REFERENCE_OBJECT_COLOR, false, false);
    _.times(MAX_CYLINDER_SLICES, () => {
      // Initial size is arbitrary, will be sized as needed.
      this.discreteObjectList.push(new CylinderModel(new Dimension2(1.0, 1.0), Vector2.ZERO, EstimationConstants.REFERENCE_OBJECT_COLOR, true, false));
    });
    this.setReferenceObjectSize(INITIAL_REFERENCE_OBJECT_SIZE);
    this.numVisibleDiscreteCylinders = 0;

    // Complete initialization by hooking up visibility updates in the parent class.
    this.hookUpVisibilityUpdates();

    // Maintain a short history of reference object sizes so unique ones can be chosen.
    this.previousReferenceObjectSize = INITIAL_REFERENCE_OBJECT_SIZE;
  }

  // TODO: Visibility annotations should be checked and updated, see https://github.com/phetsims/estimation/issues/9

  // @public
  setReferenceObjectSize(size) {
    this.referenceObject.sizeProperty.value = size;

    // Size and position the discrete cylinder slices based on the sizes of
    // the reference cube and the compare cylinder.
    const cylindersPerRow = this.compareObject.sizeProperty.value.width / this.referenceObject.sizeProperty.value.width;
    const numRows = this.discreteObjectList.length / cylindersPerRow;
    const origin = this.compareObject.positionProperty.value;
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < cylindersPerRow; j++) {
        const index = i * cylindersPerRow + j;
        this.discreteObjectList[index].sizeProperty.value = this.referenceObject.sizeProperty.value;
        this.discreteObjectList[index].positionProperty.value = new Vector2(origin.x + j * this.referenceObject.sizeProperty.value.width, origin.y + i * this.referenceObject.sizeProperty.value.height);
      }
    }

    // Set the initial size of the continuous object.
    this.updateContinuousObjectSize(this.estimateProperty.value);
  }

  // @public
  newReferenceObject() {
    // Choose a random size that hasn't been chosen for a while.
    let unique = false;
    let referenceObjectSize = null;
    while (!unique) {
      referenceObjectSize = VALID_REF_OBJECT_SIZES[Math.floor(dotRandom.nextDouble() * VALID_REF_OBJECT_SIZES.length)];
      unique = referenceObjectSize !== this.previousReferenceObjectSize && referenceObjectSize !== this.referenceObject.size;
    }
    this.previousReferenceObjectSize = referenceObjectSize;
    this.setReferenceObjectSize(referenceObjectSize);
  }

  // @public
  setInitialReferenceObject() {
    this.setReferenceObjectSize(INITIAL_REFERENCE_OBJECT_SIZE);
  }

  // @public
  updateDiscreteObjectVisibility(selectedMode, estimateValue) {
    const targetNumVisibleDiscreteCylinders = selectedMode === 'cylinders' && this.continuousOrDiscreteProperty.value === 'discrete' ? this.estimateProperty.value : 0;
    const startIndex = Math.min(this.numVisibleDiscreteCylinders, targetNumVisibleDiscreteCylinders);
    const endIndex = Math.max(this.numVisibleDiscreteCylinders, targetNumVisibleDiscreteCylinders);
    const visibility = targetNumVisibleDiscreteCylinders > this.numVisibleDiscreteCylinders;
    for (let i = startIndex; i < endIndex && i < MAX_CYLINDER_SLICES; i++) {
      this.discreteObjectList[i].visibleProperty.value = visibility;
    }
    this.numVisibleDiscreteCylinders = targetNumVisibleDiscreteCylinders;
  }

  // @public
  updateContinuousObjectSize(estimateValue) {
    this.continuousSizableObject.sizeProperty.value = new Dimension2(this.referenceObject.sizeProperty.value.width, this.referenceObject.sizeProperty.value.height * estimateValue);
  }
}
estimation.register('CylinderExplorationMode', CylinderExplorationMode);
export default CylinderExplorationMode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiZG90UmFuZG9tIiwiVmVjdG9yMiIsIkNvbG9yIiwiRXN0aW1hdGlvbkNvbnN0YW50cyIsIkN5bGluZGVyTW9kZWwiLCJlc3RpbWF0aW9uIiwiQWJzdHJhY3RFeHBsb3JhdGlvbk1vZGUiLCJNQVhfQ1lMSU5ERVJfU0xJQ0VTIiwiTU9ERV9OQU1FIiwiUkVGRVJFTkNFX0NZTElOREVSX1dJRFRIIiwiQ09NUEFSRV9DWUxJTkRFUl9TSVpFIiwiVkFMSURfUkVGX09CSkVDVF9TSVpFUyIsImhlaWdodCIsIklOSVRJQUxfUkVGRVJFTkNFX09CSkVDVF9TSVpFIiwiQ3lsaW5kZXJFeHBsb3JhdGlvbk1vZGUiLCJjb25zdHJ1Y3RvciIsInNlbGVjdGVkTW9kZVByb3BlcnR5IiwiY29tcGFyZUN5bGluZGVyUG9zaXRpb24iLCJjb21wYXJlT2JqZWN0IiwiQ09NUEFSSVNPTl9PQkpFQ1RfQ09MT1IiLCJzZXRBbHBoYSIsImNvbnRpbnVvdXNTaXphYmxlT2JqZWN0IiwiUkVGRVJFTkNFX09CSkVDVF9DT0xPUiIsInJlZmVyZW5jZU9iamVjdCIsIl8iLCJ0aW1lcyIsImRpc2NyZXRlT2JqZWN0TGlzdCIsInB1c2giLCJaRVJPIiwic2V0UmVmZXJlbmNlT2JqZWN0U2l6ZSIsIm51bVZpc2libGVEaXNjcmV0ZUN5bGluZGVycyIsImhvb2tVcFZpc2liaWxpdHlVcGRhdGVzIiwicHJldmlvdXNSZWZlcmVuY2VPYmplY3RTaXplIiwic2l6ZSIsInNpemVQcm9wZXJ0eSIsInZhbHVlIiwiY3lsaW5kZXJzUGVyUm93Iiwid2lkdGgiLCJudW1Sb3dzIiwibGVuZ3RoIiwib3JpZ2luIiwicG9zaXRpb25Qcm9wZXJ0eSIsImkiLCJqIiwiaW5kZXgiLCJ4IiwieSIsInVwZGF0ZUNvbnRpbnVvdXNPYmplY3RTaXplIiwiZXN0aW1hdGVQcm9wZXJ0eSIsIm5ld1JlZmVyZW5jZU9iamVjdCIsInVuaXF1ZSIsInJlZmVyZW5jZU9iamVjdFNpemUiLCJNYXRoIiwiZmxvb3IiLCJuZXh0RG91YmxlIiwic2V0SW5pdGlhbFJlZmVyZW5jZU9iamVjdCIsInVwZGF0ZURpc2NyZXRlT2JqZWN0VmlzaWJpbGl0eSIsInNlbGVjdGVkTW9kZSIsImVzdGltYXRlVmFsdWUiLCJ0YXJnZXROdW1WaXNpYmxlRGlzY3JldGVDeWxpbmRlcnMiLCJjb250aW51b3VzT3JEaXNjcmV0ZVByb3BlcnR5Iiwic3RhcnRJbmRleCIsIm1pbiIsImVuZEluZGV4IiwibWF4IiwidmlzaWJpbGl0eSIsInZpc2libGVQcm9wZXJ0eSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ3lsaW5kZXJFeHBsb3JhdGlvbk1vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRGVmaW5pdGlvbiBvZiB0aGUgJ2N5bGluZGVyIGV4cGxvcmF0aW9uIG1vZGUnIGZvciB0aGUgZXhwbG9yYXRpb24gbW9kZWwuXHJcbiAqL1xyXG5cclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEVzdGltYXRpb25Db25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0VzdGltYXRpb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgQ3lsaW5kZXJNb2RlbCBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvQ3lsaW5kZXJNb2RlbC5qcyc7XHJcbmltcG9ydCBlc3RpbWF0aW9uIGZyb20gJy4uLy4uL2VzdGltYXRpb24uanMnO1xyXG5pbXBvcnQgQWJzdHJhY3RFeHBsb3JhdGlvbk1vZGUgZnJvbSAnLi9BYnN0cmFjdEV4cGxvcmF0aW9uTW9kZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTUFYX0NZTElOREVSX1NMSUNFUyA9IDEwMDtcclxuY29uc3QgTU9ERV9OQU1FID0gJ2N5bGluZGVycyc7XHJcbmNvbnN0IFJFRkVSRU5DRV9DWUxJTkRFUl9XSURUSCA9IDEuNTtcclxuY29uc3QgQ09NUEFSRV9DWUxJTkRFUl9TSVpFID0gbmV3IERpbWVuc2lvbjIoIFJFRkVSRU5DRV9DWUxJTkRFUl9XSURUSCwgMiApO1xyXG5jb25zdCBWQUxJRF9SRUZfT0JKRUNUX1NJWkVTID0gW1xyXG4gIG5ldyBEaW1lbnNpb24yKCBSRUZFUkVOQ0VfQ1lMSU5ERVJfV0lEVEgsIENPTVBBUkVfQ1lMSU5ERVJfU0laRS5oZWlnaHQgLyA1MCApLFxyXG4gIG5ldyBEaW1lbnNpb24yKCBSRUZFUkVOQ0VfQ1lMSU5ERVJfV0lEVEgsIENPTVBBUkVfQ1lMSU5ERVJfU0laRS5oZWlnaHQgLyAyMCApLFxyXG4gIG5ldyBEaW1lbnNpb24yKCBSRUZFUkVOQ0VfQ1lMSU5ERVJfV0lEVEgsIENPTVBBUkVfQ1lMSU5ERVJfU0laRS5oZWlnaHQgLyAxNSApLFxyXG4gIG5ldyBEaW1lbnNpb24yKCBSRUZFUkVOQ0VfQ1lMSU5ERVJfV0lEVEgsIENPTVBBUkVfQ1lMSU5ERVJfU0laRS5oZWlnaHQgLyAxMCApLFxyXG4gIG5ldyBEaW1lbnNpb24yKCBSRUZFUkVOQ0VfQ1lMSU5ERVJfV0lEVEgsIENPTVBBUkVfQ1lMSU5ERVJfU0laRS5oZWlnaHQgLyA1ICksXHJcbiAgbmV3IERpbWVuc2lvbjIoIFJFRkVSRU5DRV9DWUxJTkRFUl9XSURUSCwgQ09NUEFSRV9DWUxJTkRFUl9TSVpFLmhlaWdodCAvIDMgKSxcclxuICBuZXcgRGltZW5zaW9uMiggUkVGRVJFTkNFX0NZTElOREVSX1dJRFRILCBDT01QQVJFX0NZTElOREVSX1NJWkUuaGVpZ2h0IC8gMiApXHJcbl07XHJcbmNvbnN0IElOSVRJQUxfUkVGRVJFTkNFX09CSkVDVF9TSVpFID0gVkFMSURfUkVGX09CSkVDVF9TSVpFU1sgMiBdO1xyXG5cclxuY2xhc3MgQ3lsaW5kZXJFeHBsb3JhdGlvbk1vZGUgZXh0ZW5kcyBBYnN0cmFjdEV4cGxvcmF0aW9uTW9kZSB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCBzZWxlY3RlZE1vZGVQcm9wZXJ0eSApIHtcclxuICAgIHN1cGVyKCBzZWxlY3RlZE1vZGVQcm9wZXJ0eSwgTU9ERV9OQU1FICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSByZWZlcmVuY2UsIGNvbXBhcmUsIGNvbnRpbnVvdXMsIGFuZCBkaXNjcmV0ZSBvYmplY3RzLlxyXG4gICAgY29uc3QgY29tcGFyZUN5bGluZGVyUG9zaXRpb24gPSBuZXcgVmVjdG9yMiggMC43NSwgLTAuNSApO1xyXG4gICAgdGhpcy5jb21wYXJlT2JqZWN0ID0gbmV3IEN5bGluZGVyTW9kZWwoIENPTVBBUkVfQ1lMSU5ERVJfU0laRSwgY29tcGFyZUN5bGluZGVyUG9zaXRpb24sIG5ldyBDb2xvciggRXN0aW1hdGlvbkNvbnN0YW50cy5DT01QQVJJU09OX09CSkVDVF9DT0xPUiApLnNldEFscGhhKCAwLjUgKSwgZmFsc2UsIGZhbHNlICk7XHJcbiAgICB0aGlzLmNvbnRpbnVvdXNTaXphYmxlT2JqZWN0ID0gbmV3IEN5bGluZGVyTW9kZWwoIG5ldyBEaW1lbnNpb24yKCAyLCAxICksIGNvbXBhcmVDeWxpbmRlclBvc2l0aW9uLCBFc3RpbWF0aW9uQ29uc3RhbnRzLlJFRkVSRU5DRV9PQkpFQ1RfQ09MT1IsIGZhbHNlLCBmYWxzZSApO1xyXG4gICAgdGhpcy5yZWZlcmVuY2VPYmplY3QgPSBuZXcgQ3lsaW5kZXJNb2RlbCggSU5JVElBTF9SRUZFUkVOQ0VfT0JKRUNUX1NJWkUsIG5ldyBWZWN0b3IyKCAtMi4wLCAwICksIEVzdGltYXRpb25Db25zdGFudHMuUkVGRVJFTkNFX09CSkVDVF9DT0xPUiwgZmFsc2UsIGZhbHNlICk7XHJcbiAgICBfLnRpbWVzKCBNQVhfQ1lMSU5ERVJfU0xJQ0VTLCAoKSA9PiB7XHJcbiAgICAgIC8vIEluaXRpYWwgc2l6ZSBpcyBhcmJpdHJhcnksIHdpbGwgYmUgc2l6ZWQgYXMgbmVlZGVkLlxyXG4gICAgICB0aGlzLmRpc2NyZXRlT2JqZWN0TGlzdC5wdXNoKCBuZXcgQ3lsaW5kZXJNb2RlbCggbmV3IERpbWVuc2lvbjIoIDEuMCwgMS4wICksIFZlY3RvcjIuWkVSTywgRXN0aW1hdGlvbkNvbnN0YW50cy5SRUZFUkVOQ0VfT0JKRUNUX0NPTE9SLCB0cnVlLCBmYWxzZSApICk7XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnNldFJlZmVyZW5jZU9iamVjdFNpemUoIElOSVRJQUxfUkVGRVJFTkNFX09CSkVDVF9TSVpFICk7XHJcbiAgICB0aGlzLm51bVZpc2libGVEaXNjcmV0ZUN5bGluZGVycyA9IDA7XHJcblxyXG4gICAgLy8gQ29tcGxldGUgaW5pdGlhbGl6YXRpb24gYnkgaG9va2luZyB1cCB2aXNpYmlsaXR5IHVwZGF0ZXMgaW4gdGhlIHBhcmVudCBjbGFzcy5cclxuICAgIHRoaXMuaG9va1VwVmlzaWJpbGl0eVVwZGF0ZXMoKTtcclxuXHJcbiAgICAvLyBNYWludGFpbiBhIHNob3J0IGhpc3Rvcnkgb2YgcmVmZXJlbmNlIG9iamVjdCBzaXplcyBzbyB1bmlxdWUgb25lcyBjYW4gYmUgY2hvc2VuLlxyXG4gICAgdGhpcy5wcmV2aW91c1JlZmVyZW5jZU9iamVjdFNpemUgPSBJTklUSUFMX1JFRkVSRU5DRV9PQkpFQ1RfU0laRTtcclxuICB9XHJcblxyXG4gIC8vIFRPRE86IFZpc2liaWxpdHkgYW5ub3RhdGlvbnMgc2hvdWxkIGJlIGNoZWNrZWQgYW5kIHVwZGF0ZWQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZXN0aW1hdGlvbi9pc3N1ZXMvOVxyXG5cclxuICAvLyBAcHVibGljXHJcbiAgc2V0UmVmZXJlbmNlT2JqZWN0U2l6ZSggc2l6ZSApIHtcclxuICAgIHRoaXMucmVmZXJlbmNlT2JqZWN0LnNpemVQcm9wZXJ0eS52YWx1ZSA9IHNpemU7XHJcblxyXG4gICAgLy8gU2l6ZSBhbmQgcG9zaXRpb24gdGhlIGRpc2NyZXRlIGN5bGluZGVyIHNsaWNlcyBiYXNlZCBvbiB0aGUgc2l6ZXMgb2ZcclxuICAgIC8vIHRoZSByZWZlcmVuY2UgY3ViZSBhbmQgdGhlIGNvbXBhcmUgY3lsaW5kZXIuXHJcbiAgICBjb25zdCBjeWxpbmRlcnNQZXJSb3cgPSB0aGlzLmNvbXBhcmVPYmplY3Quc2l6ZVByb3BlcnR5LnZhbHVlLndpZHRoIC8gdGhpcy5yZWZlcmVuY2VPYmplY3Quc2l6ZVByb3BlcnR5LnZhbHVlLndpZHRoO1xyXG4gICAgY29uc3QgbnVtUm93cyA9IHRoaXMuZGlzY3JldGVPYmplY3RMaXN0Lmxlbmd0aCAvIGN5bGluZGVyc1BlclJvdztcclxuICAgIGNvbnN0IG9yaWdpbiA9IHRoaXMuY29tcGFyZU9iamVjdC5wb3NpdGlvblByb3BlcnR5LnZhbHVlO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtUm93czsgaSsrICkge1xyXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBjeWxpbmRlcnNQZXJSb3c7IGorKyApIHtcclxuICAgICAgICBjb25zdCBpbmRleCA9IGkgKiBjeWxpbmRlcnNQZXJSb3cgKyBqO1xyXG4gICAgICAgIHRoaXMuZGlzY3JldGVPYmplY3RMaXN0WyBpbmRleCBdLnNpemVQcm9wZXJ0eS52YWx1ZSA9IHRoaXMucmVmZXJlbmNlT2JqZWN0LnNpemVQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICB0aGlzLmRpc2NyZXRlT2JqZWN0TGlzdFsgaW5kZXggXS5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gbmV3IFZlY3RvcjIoIG9yaWdpbi54ICsgaiAqIHRoaXMucmVmZXJlbmNlT2JqZWN0LnNpemVQcm9wZXJ0eS52YWx1ZS53aWR0aCxcclxuICAgICAgICAgIG9yaWdpbi55ICsgaSAqIHRoaXMucmVmZXJlbmNlT2JqZWN0LnNpemVQcm9wZXJ0eS52YWx1ZS5oZWlnaHQgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFNldCB0aGUgaW5pdGlhbCBzaXplIG9mIHRoZSBjb250aW51b3VzIG9iamVjdC5cclxuICAgIHRoaXMudXBkYXRlQ29udGludW91c09iamVjdFNpemUoIHRoaXMuZXN0aW1hdGVQcm9wZXJ0eS52YWx1ZSApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIG5ld1JlZmVyZW5jZU9iamVjdCgpIHtcclxuICAgIC8vIENob29zZSBhIHJhbmRvbSBzaXplIHRoYXQgaGFzbid0IGJlZW4gY2hvc2VuIGZvciBhIHdoaWxlLlxyXG4gICAgbGV0IHVuaXF1ZSA9IGZhbHNlO1xyXG4gICAgbGV0IHJlZmVyZW5jZU9iamVjdFNpemUgPSBudWxsO1xyXG4gICAgd2hpbGUgKCAhdW5pcXVlICkge1xyXG4gICAgICByZWZlcmVuY2VPYmplY3RTaXplID0gVkFMSURfUkVGX09CSkVDVF9TSVpFU1sgTWF0aC5mbG9vciggZG90UmFuZG9tLm5leHREb3VibGUoKSAqIFZBTElEX1JFRl9PQkpFQ1RfU0laRVMubGVuZ3RoICkgXTtcclxuICAgICAgdW5pcXVlID0gKCByZWZlcmVuY2VPYmplY3RTaXplICE9PSB0aGlzLnByZXZpb3VzUmVmZXJlbmNlT2JqZWN0U2l6ZSAmJiByZWZlcmVuY2VPYmplY3RTaXplICE9PSB0aGlzLnJlZmVyZW5jZU9iamVjdC5zaXplICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnByZXZpb3VzUmVmZXJlbmNlT2JqZWN0U2l6ZSA9IHJlZmVyZW5jZU9iamVjdFNpemU7XHJcbiAgICB0aGlzLnNldFJlZmVyZW5jZU9iamVjdFNpemUoIHJlZmVyZW5jZU9iamVjdFNpemUgKTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICBzZXRJbml0aWFsUmVmZXJlbmNlT2JqZWN0KCkge1xyXG4gICAgdGhpcy5zZXRSZWZlcmVuY2VPYmplY3RTaXplKCBJTklUSUFMX1JFRkVSRU5DRV9PQkpFQ1RfU0laRSApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIHVwZGF0ZURpc2NyZXRlT2JqZWN0VmlzaWJpbGl0eSggc2VsZWN0ZWRNb2RlLCBlc3RpbWF0ZVZhbHVlICkge1xyXG4gICAgY29uc3QgdGFyZ2V0TnVtVmlzaWJsZURpc2NyZXRlQ3lsaW5kZXJzID0gc2VsZWN0ZWRNb2RlID09PSAnY3lsaW5kZXJzJyAmJiB0aGlzLmNvbnRpbnVvdXNPckRpc2NyZXRlUHJvcGVydHkudmFsdWUgPT09ICdkaXNjcmV0ZScgPyB0aGlzLmVzdGltYXRlUHJvcGVydHkudmFsdWUgOiAwO1xyXG4gICAgY29uc3Qgc3RhcnRJbmRleCA9IE1hdGgubWluKCB0aGlzLm51bVZpc2libGVEaXNjcmV0ZUN5bGluZGVycywgdGFyZ2V0TnVtVmlzaWJsZURpc2NyZXRlQ3lsaW5kZXJzICk7XHJcbiAgICBjb25zdCBlbmRJbmRleCA9IE1hdGgubWF4KCB0aGlzLm51bVZpc2libGVEaXNjcmV0ZUN5bGluZGVycywgdGFyZ2V0TnVtVmlzaWJsZURpc2NyZXRlQ3lsaW5kZXJzICk7XHJcbiAgICBjb25zdCB2aXNpYmlsaXR5ID0gdGFyZ2V0TnVtVmlzaWJsZURpc2NyZXRlQ3lsaW5kZXJzID4gdGhpcy5udW1WaXNpYmxlRGlzY3JldGVDeWxpbmRlcnM7XHJcbiAgICBmb3IgKCBsZXQgaSA9IHN0YXJ0SW5kZXg7IGkgPCBlbmRJbmRleCAmJiBpIDwgTUFYX0NZTElOREVSX1NMSUNFUzsgaSsrICkge1xyXG4gICAgICB0aGlzLmRpc2NyZXRlT2JqZWN0TGlzdFsgaSBdLnZpc2libGVQcm9wZXJ0eS52YWx1ZSA9IHZpc2liaWxpdHk7XHJcbiAgICB9XHJcbiAgICB0aGlzLm51bVZpc2libGVEaXNjcmV0ZUN5bGluZGVycyA9IHRhcmdldE51bVZpc2libGVEaXNjcmV0ZUN5bGluZGVycztcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICB1cGRhdGVDb250aW51b3VzT2JqZWN0U2l6ZSggZXN0aW1hdGVWYWx1ZSApIHtcclxuICAgIHRoaXMuY29udGludW91c1NpemFibGVPYmplY3Quc2l6ZVByb3BlcnR5LnZhbHVlID0gbmV3IERpbWVuc2lvbjIoIHRoaXMucmVmZXJlbmNlT2JqZWN0LnNpemVQcm9wZXJ0eS52YWx1ZS53aWR0aCxcclxuICAgICAgdGhpcy5yZWZlcmVuY2VPYmplY3Quc2l6ZVByb3BlcnR5LnZhbHVlLmhlaWdodCAqIGVzdGltYXRlVmFsdWUgKTtcclxuICB9XHJcbn1cclxuXHJcbmVzdGltYXRpb24ucmVnaXN0ZXIoICdDeWxpbmRlckV4cGxvcmF0aW9uTW9kZScsIEN5bGluZGVyRXhwbG9yYXRpb25Nb2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDeWxpbmRlckV4cGxvcmF0aW9uTW9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxTQUFTQyxLQUFLLFFBQVEsbUNBQW1DO0FBQ3pELE9BQU9DLG1CQUFtQixNQUFNLHFDQUFxQztBQUNyRSxPQUFPQyxhQUFhLE1BQU0scUNBQXFDO0FBQy9ELE9BQU9DLFVBQVUsTUFBTSxxQkFBcUI7QUFDNUMsT0FBT0MsdUJBQXVCLE1BQU0sOEJBQThCOztBQUVsRTtBQUNBLE1BQU1DLG1CQUFtQixHQUFHLEdBQUc7QUFDL0IsTUFBTUMsU0FBUyxHQUFHLFdBQVc7QUFDN0IsTUFBTUMsd0JBQXdCLEdBQUcsR0FBRztBQUNwQyxNQUFNQyxxQkFBcUIsR0FBRyxJQUFJWCxVQUFVLENBQUVVLHdCQUF3QixFQUFFLENBQUUsQ0FBQztBQUMzRSxNQUFNRSxzQkFBc0IsR0FBRyxDQUM3QixJQUFJWixVQUFVLENBQUVVLHdCQUF3QixFQUFFQyxxQkFBcUIsQ0FBQ0UsTUFBTSxHQUFHLEVBQUcsQ0FBQyxFQUM3RSxJQUFJYixVQUFVLENBQUVVLHdCQUF3QixFQUFFQyxx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