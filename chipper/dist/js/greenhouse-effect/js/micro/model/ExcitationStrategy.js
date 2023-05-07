// Copyright 2021, University of Colorado Boulder

/**
 * MicroPhoton absorption strategy that causes a molecule to enter an exited state after absorbing a photon, and then re-emit
 * the photon after some length of time.  The "excited state" is depicted in the view as a glow that surrounds the
 * molecule.
 *
 * @author Jesse Greenberg
 */

import greenhouseEffect from '../../greenhouseEffect.js';
import PhotonHoldStrategy from './PhotonHoldStrategy.js';
class ExcitationStrategy extends PhotonHoldStrategy {
  /**
   * Constructor for the excitation strategy.
   *
   * @param {Molecule} molecule - The molecule which will use this strategy.
   */
  constructor(molecule) {
    // Supertype constructor
    super(molecule);
  }

  /**
   * @protected
   */
  photonAbsorbed() {
    this.molecule.highElectronicEnergyStateProperty.set(true);
  }

  /**
   * @protected
   */
  reemitPhoton() {
    super.reemitPhoton();
    this.molecule.highElectronicEnergyStateProperty.set(false);
  }
}
greenhouseEffect.register('ExcitationStrategy', ExcitationStrategy);
export default ExcitationStrategy;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJncmVlbmhvdXNlRWZmZWN0IiwiUGhvdG9uSG9sZFN0cmF0ZWd5IiwiRXhjaXRhdGlvblN0cmF0ZWd5IiwiY29uc3RydWN0b3IiLCJtb2xlY3VsZSIsInBob3RvbkFic29yYmVkIiwiaGlnaEVsZWN0cm9uaWNFbmVyZ3lTdGF0ZVByb3BlcnR5Iiwic2V0IiwicmVlbWl0UGhvdG9uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFeGNpdGF0aW9uU3RyYXRlZ3kuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1pY3JvUGhvdG9uIGFic29ycHRpb24gc3RyYXRlZ3kgdGhhdCBjYXVzZXMgYSBtb2xlY3VsZSB0byBlbnRlciBhbiBleGl0ZWQgc3RhdGUgYWZ0ZXIgYWJzb3JiaW5nIGEgcGhvdG9uLCBhbmQgdGhlbiByZS1lbWl0XHJcbiAqIHRoZSBwaG90b24gYWZ0ZXIgc29tZSBsZW5ndGggb2YgdGltZS4gIFRoZSBcImV4Y2l0ZWQgc3RhdGVcIiBpcyBkZXBpY3RlZCBpbiB0aGUgdmlldyBhcyBhIGdsb3cgdGhhdCBzdXJyb3VuZHMgdGhlXHJcbiAqIG1vbGVjdWxlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xyXG4gKi9cclxuXHJcbmltcG9ydCBncmVlbmhvdXNlRWZmZWN0IGZyb20gJy4uLy4uL2dyZWVuaG91c2VFZmZlY3QuanMnO1xyXG5pbXBvcnQgUGhvdG9uSG9sZFN0cmF0ZWd5IGZyb20gJy4vUGhvdG9uSG9sZFN0cmF0ZWd5LmpzJztcclxuXHJcbmNsYXNzIEV4Y2l0YXRpb25TdHJhdGVneSBleHRlbmRzIFBob3RvbkhvbGRTdHJhdGVneSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdG9yIGZvciB0aGUgZXhjaXRhdGlvbiBzdHJhdGVneS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TW9sZWN1bGV9IG1vbGVjdWxlIC0gVGhlIG1vbGVjdWxlIHdoaWNoIHdpbGwgdXNlIHRoaXMgc3RyYXRlZ3kuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vbGVjdWxlICkge1xyXG5cclxuICAgIC8vIFN1cGVydHlwZSBjb25zdHJ1Y3RvclxyXG4gICAgc3VwZXIoIG1vbGVjdWxlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICovXHJcbiAgcGhvdG9uQWJzb3JiZWQoKSB7XHJcbiAgICB0aGlzLm1vbGVjdWxlLmhpZ2hFbGVjdHJvbmljRW5lcmd5U3RhdGVQcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKi9cclxuICByZWVtaXRQaG90b24oKSB7XHJcbiAgICBzdXBlci5yZWVtaXRQaG90b24oKTtcclxuICAgIHRoaXMubW9sZWN1bGUuaGlnaEVsZWN0cm9uaWNFbmVyZ3lTdGF0ZVByb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICB9XHJcbn1cclxuXHJcbmdyZWVuaG91c2VFZmZlY3QucmVnaXN0ZXIoICdFeGNpdGF0aW9uU3RyYXRlZ3knLCBFeGNpdGF0aW9uU3RyYXRlZ3kgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEV4Y2l0YXRpb25TdHJhdGVneTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyxrQkFBa0IsTUFBTSx5QkFBeUI7QUFFeEQsTUFBTUMsa0JBQWtCLFNBQVNELGtCQUFrQixDQUFDO0VBRWxEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUUsV0FBV0EsQ0FBRUMsUUFBUSxFQUFHO0lBRXRCO0lBQ0EsS0FBSyxDQUFFQSxRQUFTLENBQUM7RUFDbkI7O0VBRUE7QUFDRjtBQUNBO0VBQ0VDLGNBQWNBLENBQUEsRUFBRztJQUNmLElBQUksQ0FBQ0QsUUFBUSxDQUFDRSxpQ0FBaUMsQ0FBQ0MsR0FBRyxDQUFFLElBQUssQ0FBQztFQUM3RDs7RUFFQTtBQUNGO0FBQ0E7RUFDRUMsWUFBWUEsQ0FBQSxFQUFHO0lBQ2IsS0FBSyxDQUFDQSxZQUFZLENBQUMsQ0FBQztJQUNwQixJQUFJLENBQUNKLFFBQVEsQ0FBQ0UsaUNBQWlDLENBQUNDLEdBQUcsQ0FBRSxLQUFNLENBQUM7RUFDOUQ7QUFDRjtBQUVBUCxnQkFBZ0IsQ0FBQ1MsUUFBUSxDQUFFLG9CQUFvQixFQUFFUCxrQkFBbUIsQ0FBQztBQUVyRSxlQUFlQSxrQkFBa0IifQ==