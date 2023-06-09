// Copyright 2013-2021, University of Colorado Boulder

import fireExtinguisher_png from '../../../../images/fireExtinguisher_png.js';
import balancingAct from '../../../balancingAct.js';
import ImageMass from '../ImageMass.js';

// constants
const MASS = 5; // In kg
const HEIGHT = 0.5; // In meters

class FireExtinguisher extends ImageMass {
  /**
   * @param initialPosition
   * @param isMystery
   * @param {Object} [options]
   */
  constructor(initialPosition, isMystery, options) {
    super(MASS, fireExtinguisher_png, HEIGHT, initialPosition, isMystery, options);
    this.centerOfMassXOffset = 0.03; // Empirically determined.
  }
}

balancingAct.register('FireExtinguisher', FireExtinguisher);
export default FireExtinguisher;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmaXJlRXh0aW5ndWlzaGVyX3BuZyIsImJhbGFuY2luZ0FjdCIsIkltYWdlTWFzcyIsIk1BU1MiLCJIRUlHSFQiLCJGaXJlRXh0aW5ndWlzaGVyIiwiY29uc3RydWN0b3IiLCJpbml0aWFsUG9zaXRpb24iLCJpc015c3RlcnkiLCJvcHRpb25zIiwiY2VudGVyT2ZNYXNzWE9mZnNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRmlyZUV4dGluZ3Vpc2hlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcblxyXG5pbXBvcnQgZmlyZUV4dGluZ3Vpc2hlcl9wbmcgZnJvbSAnLi4vLi4vLi4vLi4vaW1hZ2VzL2ZpcmVFeHRpbmd1aXNoZXJfcG5nLmpzJztcclxuaW1wb3J0IGJhbGFuY2luZ0FjdCBmcm9tICcuLi8uLi8uLi9iYWxhbmNpbmdBY3QuanMnO1xyXG5pbXBvcnQgSW1hZ2VNYXNzIGZyb20gJy4uL0ltYWdlTWFzcy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTUFTUyA9IDU7IC8vIEluIGtnXHJcbmNvbnN0IEhFSUdIVCA9IDAuNTsgLy8gSW4gbWV0ZXJzXHJcblxyXG5jbGFzcyBGaXJlRXh0aW5ndWlzaGVyIGV4dGVuZHMgSW1hZ2VNYXNzIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGluaXRpYWxQb3NpdGlvblxyXG4gICAqIEBwYXJhbSBpc015c3RlcnlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGluaXRpYWxQb3NpdGlvbiwgaXNNeXN0ZXJ5LCBvcHRpb25zICkge1xyXG4gICAgc3VwZXIoIE1BU1MsIGZpcmVFeHRpbmd1aXNoZXJfcG5nLCBIRUlHSFQsIGluaXRpYWxQb3NpdGlvbiwgaXNNeXN0ZXJ5LCBvcHRpb25zICk7XHJcbiAgICB0aGlzLmNlbnRlck9mTWFzc1hPZmZzZXQgPSAwLjAzOyAvLyBFbXBpcmljYWxseSBkZXRlcm1pbmVkLlxyXG4gIH1cclxufVxyXG5cclxuYmFsYW5jaW5nQWN0LnJlZ2lzdGVyKCAnRmlyZUV4dGluZ3Vpc2hlcicsIEZpcmVFeHRpbmd1aXNoZXIgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEZpcmVFeHRpbmd1aXNoZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFHQSxPQUFPQSxvQkFBb0IsTUFBTSw0Q0FBNEM7QUFDN0UsT0FBT0MsWUFBWSxNQUFNLDBCQUEwQjtBQUNuRCxPQUFPQyxTQUFTLE1BQU0saUJBQWlCOztBQUV2QztBQUNBLE1BQU1DLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNoQixNQUFNQyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUM7O0FBRXBCLE1BQU1DLGdCQUFnQixTQUFTSCxTQUFTLENBQUM7RUFFdkM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFSSxXQUFXQSxDQUFFQyxlQUFlLEVBQUVDLFNBQVMsRUFBRUMsT0FBTyxFQUFHO0lBQ2pELEtBQUssQ0FBRU4sSUFBSSxFQUFFSCxvQkFBb0IsRUFBRUksTUFBTSxFQUFFRyxlQUFlLEVBQUVDLFNBQVMsRUFBRUMsT0FBUSxDQUFDO0lBQ2hGLElBQUksQ0FBQ0MsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLENBQUM7RUFDbkM7QUFDRjs7QUFFQVQsWUFBWSxDQUFDVSxRQUFRLENBQUUsa0JBQWtCLEVBQUVOLGdCQUFpQixDQUFDO0FBRTdELGVBQWVBLGdCQUFnQiJ9