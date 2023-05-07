// Copyright 2021, University of Colorado Boulder

/**
 * MicroPhoton absorption strategy that causes a molecule to rotate after absorbing a photon, and re-emit the photon after
 * some length of time.  This is to be inherited by the general PhotonAbsorptionStrategy class.
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import PhotonHoldStrategy from './PhotonHoldStrategy.js';

// random boolean generator
const RAND = {
  nextBoolean: () => dotRandom.nextDouble() < 0.50
};
class RotationStrategy extends PhotonHoldStrategy {
  /**
   * Constructor for a rotation strategy.
   *
   * @param {Molecule} molecule - The molecule which will use this strategy.
   */
  constructor(molecule) {
    // Supertype constructor
    super(molecule);
  }

  /**
   * Handle when a photon is absorbed.  Set the molecule to a rotating state
   * and set the direction of rotation to a random direction.
   * @public
   */
  photonAbsorbed() {
    this.molecule.rotationDirectionClockwiseProperty.set(RAND.nextBoolean());
    this.molecule.rotatingProperty.set(true);
  }

  /**
   * Re-emit the absorbed photon.  Set the molecule to a non-rotating state.
   * @protected
   */
  reemitPhoton() {
    super.reemitPhoton();
    this.molecule.rotatingProperty.set(false);
  }
}
greenhouseEffect.register('RotationStrategy', RotationStrategy);
export default RotationStrategy;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3RSYW5kb20iLCJncmVlbmhvdXNlRWZmZWN0IiwiUGhvdG9uSG9sZFN0cmF0ZWd5IiwiUkFORCIsIm5leHRCb29sZWFuIiwibmV4dERvdWJsZSIsIlJvdGF0aW9uU3RyYXRlZ3kiLCJjb25zdHJ1Y3RvciIsIm1vbGVjdWxlIiwicGhvdG9uQWJzb3JiZWQiLCJyb3RhdGlvbkRpcmVjdGlvbkNsb2Nrd2lzZVByb3BlcnR5Iiwic2V0Iiwicm90YXRpbmdQcm9wZXJ0eSIsInJlZW1pdFBob3RvbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUm90YXRpb25TdHJhdGVneS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWljcm9QaG90b24gYWJzb3JwdGlvbiBzdHJhdGVneSB0aGF0IGNhdXNlcyBhIG1vbGVjdWxlIHRvIHJvdGF0ZSBhZnRlciBhYnNvcmJpbmcgYSBwaG90b24sIGFuZCByZS1lbWl0IHRoZSBwaG90b24gYWZ0ZXJcclxuICogc29tZSBsZW5ndGggb2YgdGltZS4gIFRoaXMgaXMgdG8gYmUgaW5oZXJpdGVkIGJ5IHRoZSBnZW5lcmFsIFBob3RvbkFic29ycHRpb25TdHJhdGVneSBjbGFzcy5cclxuICovXHJcblxyXG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xyXG5pbXBvcnQgZ3JlZW5ob3VzZUVmZmVjdCBmcm9tICcuLi8uLi9ncmVlbmhvdXNlRWZmZWN0LmpzJztcclxuaW1wb3J0IFBob3RvbkhvbGRTdHJhdGVneSBmcm9tICcuL1Bob3RvbkhvbGRTdHJhdGVneS5qcyc7XHJcblxyXG4vLyByYW5kb20gYm9vbGVhbiBnZW5lcmF0b3JcclxuY29uc3QgUkFORCA9IHtcclxuICBuZXh0Qm9vbGVhbjogKCkgPT4gZG90UmFuZG9tLm5leHREb3VibGUoKSA8IDAuNTBcclxufTtcclxuXHJcbmNsYXNzIFJvdGF0aW9uU3RyYXRlZ3kgZXh0ZW5kcyBQaG90b25Ib2xkU3RyYXRlZ3kge1xyXG5cclxuICAvKipcclxuICAgKiBDb25zdHJ1Y3RvciBmb3IgYSByb3RhdGlvbiBzdHJhdGVneS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TW9sZWN1bGV9IG1vbGVjdWxlIC0gVGhlIG1vbGVjdWxlIHdoaWNoIHdpbGwgdXNlIHRoaXMgc3RyYXRlZ3kuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vbGVjdWxlICkge1xyXG5cclxuICAgIC8vIFN1cGVydHlwZSBjb25zdHJ1Y3RvclxyXG4gICAgc3VwZXIoIG1vbGVjdWxlICk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogSGFuZGxlIHdoZW4gYSBwaG90b24gaXMgYWJzb3JiZWQuICBTZXQgdGhlIG1vbGVjdWxlIHRvIGEgcm90YXRpbmcgc3RhdGVcclxuICAgKiBhbmQgc2V0IHRoZSBkaXJlY3Rpb24gb2Ygcm90YXRpb24gdG8gYSByYW5kb20gZGlyZWN0aW9uLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBwaG90b25BYnNvcmJlZCgpIHtcclxuICAgIHRoaXMubW9sZWN1bGUucm90YXRpb25EaXJlY3Rpb25DbG9ja3dpc2VQcm9wZXJ0eS5zZXQoIFJBTkQubmV4dEJvb2xlYW4oKSApO1xyXG4gICAgdGhpcy5tb2xlY3VsZS5yb3RhdGluZ1Byb3BlcnR5LnNldCggdHJ1ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmUtZW1pdCB0aGUgYWJzb3JiZWQgcGhvdG9uLiAgU2V0IHRoZSBtb2xlY3VsZSB0byBhIG5vbi1yb3RhdGluZyBzdGF0ZS5cclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICovXHJcbiAgcmVlbWl0UGhvdG9uKCkge1xyXG4gICAgc3VwZXIucmVlbWl0UGhvdG9uKCk7XHJcbiAgICB0aGlzLm1vbGVjdWxlLnJvdGF0aW5nUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gIH1cclxufVxyXG5cclxuZ3JlZW5ob3VzZUVmZmVjdC5yZWdpc3RlciggJ1JvdGF0aW9uU3RyYXRlZ3knLCBSb3RhdGlvblN0cmF0ZWd5ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBSb3RhdGlvblN0cmF0ZWd5OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLGlDQUFpQztBQUN2RCxPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFDeEQsT0FBT0Msa0JBQWtCLE1BQU0seUJBQXlCOztBQUV4RDtBQUNBLE1BQU1DLElBQUksR0FBRztFQUNYQyxXQUFXLEVBQUVBLENBQUEsS0FBTUosU0FBUyxDQUFDSyxVQUFVLENBQUMsQ0FBQyxHQUFHO0FBQzlDLENBQUM7QUFFRCxNQUFNQyxnQkFBZ0IsU0FBU0osa0JBQWtCLENBQUM7RUFFaEQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFSyxXQUFXQSxDQUFFQyxRQUFRLEVBQUc7SUFFdEI7SUFDQSxLQUFLLENBQUVBLFFBQVMsQ0FBQztFQUNuQjs7RUFHQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLGNBQWNBLENBQUEsRUFBRztJQUNmLElBQUksQ0FBQ0QsUUFBUSxDQUFDRSxrQ0FBa0MsQ0FBQ0MsR0FBRyxDQUFFUixJQUFJLENBQUNDLFdBQVcsQ0FBQyxDQUFFLENBQUM7SUFDMUUsSUFBSSxDQUFDSSxRQUFRLENBQUNJLGdCQUFnQixDQUFDRCxHQUFHLENBQUUsSUFBSyxDQUFDO0VBQzVDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VFLFlBQVlBLENBQUEsRUFBRztJQUNiLEtBQUssQ0FBQ0EsWUFBWSxDQUFDLENBQUM7SUFDcEIsSUFBSSxDQUFDTCxRQUFRLENBQUNJLGdCQUFnQixDQUFDRCxHQUFHLENBQUUsS0FBTSxDQUFDO0VBQzdDO0FBQ0Y7QUFFQVYsZ0JBQWdCLENBQUNhLFFBQVEsQ0FBRSxrQkFBa0IsRUFBRVIsZ0JBQWlCLENBQUM7QUFFakUsZUFBZUEsZ0JBQWdCIn0=