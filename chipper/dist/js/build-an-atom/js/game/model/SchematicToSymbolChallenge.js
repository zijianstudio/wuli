// Copyright 2013-2021, University of Colorado Boulder

/**
 * Type for game challenges where the user is presented with a set of particle
 * counts for an atom and must determine the total charge and enter it in an
 * interactive element symbol.
 *
 * @author John Blanco
 */

import buildAnAtom from '../../buildAnAtom.js';
import SchematicToSymbolChallengeView from '../view/SchematicToSymbolChallengeView.js';
import BAAGameChallenge from './BAAGameChallenge.js';
class SchematicToSymbolChallenge extends BAAGameChallenge {
  /**
   * @param {GameModel} buildAnAtomGameModel
   * @param {NumberAtom} answerAtom
   * @param {string} challengeType
   * @param {Tandem} tandem
   * @param {boolean} configurableProtonCount
   * @param {boolean} configurableMassNumber
   * @param {boolean} configurableCharge
   */
  constructor(buildAnAtomGameModel, answerAtom, challengeType, tandem, configurableProtonCount, configurableMassNumber, configurableCharge) {
    super(buildAnAtomGameModel, answerAtom, challengeType, tandem);
    this.configurableProtonCount = configurableProtonCount;
    this.configurableMassNumber = configurableMassNumber;
    this.configurableCharge = configurableCharge;
  }

  /**
   * Create the view needed to visual represent this challenge.
   * @param {Bounds2} layoutBounds
   * @param {Tandem} tandem
   * @returns {CountsToChargeChallengeView}
   * @public
   */
  createView(layoutBounds, tandem) {
    return new SchematicToSymbolChallengeView(this, layoutBounds, tandem.createTandem('schematicToSymbolChallengeView'));
  }
}
buildAnAtom.register('SchematicToSymbolChallenge', SchematicToSymbolChallenge);
export default SchematicToSymbolChallenge;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJidWlsZEFuQXRvbSIsIlNjaGVtYXRpY1RvU3ltYm9sQ2hhbGxlbmdlVmlldyIsIkJBQUdhbWVDaGFsbGVuZ2UiLCJTY2hlbWF0aWNUb1N5bWJvbENoYWxsZW5nZSIsImNvbnN0cnVjdG9yIiwiYnVpbGRBbkF0b21HYW1lTW9kZWwiLCJhbnN3ZXJBdG9tIiwiY2hhbGxlbmdlVHlwZSIsInRhbmRlbSIsImNvbmZpZ3VyYWJsZVByb3RvbkNvdW50IiwiY29uZmlndXJhYmxlTWFzc051bWJlciIsImNvbmZpZ3VyYWJsZUNoYXJnZSIsImNyZWF0ZVZpZXciLCJsYXlvdXRCb3VuZHMiLCJjcmVhdGVUYW5kZW0iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNjaGVtYXRpY1RvU3ltYm9sQ2hhbGxlbmdlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFR5cGUgZm9yIGdhbWUgY2hhbGxlbmdlcyB3aGVyZSB0aGUgdXNlciBpcyBwcmVzZW50ZWQgd2l0aCBhIHNldCBvZiBwYXJ0aWNsZVxyXG4gKiBjb3VudHMgZm9yIGFuIGF0b20gYW5kIG11c3QgZGV0ZXJtaW5lIHRoZSB0b3RhbCBjaGFyZ2UgYW5kIGVudGVyIGl0IGluIGFuXHJcbiAqIGludGVyYWN0aXZlIGVsZW1lbnQgc3ltYm9sLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IGJ1aWxkQW5BdG9tIGZyb20gJy4uLy4uL2J1aWxkQW5BdG9tLmpzJztcclxuaW1wb3J0IFNjaGVtYXRpY1RvU3ltYm9sQ2hhbGxlbmdlVmlldyBmcm9tICcuLi92aWV3L1NjaGVtYXRpY1RvU3ltYm9sQ2hhbGxlbmdlVmlldy5qcyc7XHJcbmltcG9ydCBCQUFHYW1lQ2hhbGxlbmdlIGZyb20gJy4vQkFBR2FtZUNoYWxsZW5nZS5qcyc7XHJcblxyXG5jbGFzcyBTY2hlbWF0aWNUb1N5bWJvbENoYWxsZW5nZSBleHRlbmRzIEJBQUdhbWVDaGFsbGVuZ2Uge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0dhbWVNb2RlbH0gYnVpbGRBbkF0b21HYW1lTW9kZWxcclxuICAgKiBAcGFyYW0ge051bWJlckF0b219IGFuc3dlckF0b21cclxuICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhbGxlbmdlVHlwZVxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGNvbmZpZ3VyYWJsZVByb3RvbkNvdW50XHJcbiAgICogQHBhcmFtIHtib29sZWFufSBjb25maWd1cmFibGVNYXNzTnVtYmVyXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBjb25maWd1cmFibGVDaGFyZ2VcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggYnVpbGRBbkF0b21HYW1lTW9kZWwsIGFuc3dlckF0b20sIGNoYWxsZW5nZVR5cGUsIHRhbmRlbSwgY29uZmlndXJhYmxlUHJvdG9uQ291bnQsIGNvbmZpZ3VyYWJsZU1hc3NOdW1iZXIsIGNvbmZpZ3VyYWJsZUNoYXJnZSApIHtcclxuICAgIHN1cGVyKCBidWlsZEFuQXRvbUdhbWVNb2RlbCwgYW5zd2VyQXRvbSwgY2hhbGxlbmdlVHlwZSwgdGFuZGVtICk7XHJcbiAgICB0aGlzLmNvbmZpZ3VyYWJsZVByb3RvbkNvdW50ID0gY29uZmlndXJhYmxlUHJvdG9uQ291bnQ7XHJcbiAgICB0aGlzLmNvbmZpZ3VyYWJsZU1hc3NOdW1iZXIgPSBjb25maWd1cmFibGVNYXNzTnVtYmVyO1xyXG4gICAgdGhpcy5jb25maWd1cmFibGVDaGFyZ2UgPSBjb25maWd1cmFibGVDaGFyZ2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgdGhlIHZpZXcgbmVlZGVkIHRvIHZpc3VhbCByZXByZXNlbnQgdGhpcyBjaGFsbGVuZ2UuXHJcbiAgICogQHBhcmFtIHtCb3VuZHMyfSBsYXlvdXRCb3VuZHNcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICogQHJldHVybnMge0NvdW50c1RvQ2hhcmdlQ2hhbGxlbmdlVmlld31cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY3JlYXRlVmlldyggbGF5b3V0Qm91bmRzLCB0YW5kZW0gKSB7XHJcbiAgICByZXR1cm4gbmV3IFNjaGVtYXRpY1RvU3ltYm9sQ2hhbGxlbmdlVmlldyggdGhpcywgbGF5b3V0Qm91bmRzLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc2NoZW1hdGljVG9TeW1ib2xDaGFsbGVuZ2VWaWV3JyApICk7XHJcbiAgfVxyXG59XHJcblxyXG5idWlsZEFuQXRvbS5yZWdpc3RlciggJ1NjaGVtYXRpY1RvU3ltYm9sQ2hhbGxlbmdlJywgU2NoZW1hdGljVG9TeW1ib2xDaGFsbGVuZ2UgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNjaGVtYXRpY1RvU3ltYm9sQ2hhbGxlbmdlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsV0FBVyxNQUFNLHNCQUFzQjtBQUM5QyxPQUFPQyw4QkFBOEIsTUFBTSwyQ0FBMkM7QUFDdEYsT0FBT0MsZ0JBQWdCLE1BQU0sdUJBQXVCO0FBRXBELE1BQU1DLDBCQUEwQixTQUFTRCxnQkFBZ0IsQ0FBQztFQUV4RDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUUsV0FBV0EsQ0FBRUMsb0JBQW9CLEVBQUVDLFVBQVUsRUFBRUMsYUFBYSxFQUFFQyxNQUFNLEVBQUVDLHVCQUF1QixFQUFFQyxzQkFBc0IsRUFBRUMsa0JBQWtCLEVBQUc7SUFDMUksS0FBSyxDQUFFTixvQkFBb0IsRUFBRUMsVUFBVSxFQUFFQyxhQUFhLEVBQUVDLE1BQU8sQ0FBQztJQUNoRSxJQUFJLENBQUNDLHVCQUF1QixHQUFHQSx1QkFBdUI7SUFDdEQsSUFBSSxDQUFDQyxzQkFBc0IsR0FBR0Esc0JBQXNCO0lBQ3BELElBQUksQ0FBQ0Msa0JBQWtCLEdBQUdBLGtCQUFrQjtFQUM5Qzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxVQUFVQSxDQUFFQyxZQUFZLEVBQUVMLE1BQU0sRUFBRztJQUNqQyxPQUFPLElBQUlQLDhCQUE4QixDQUFFLElBQUksRUFBRVksWUFBWSxFQUFFTCxNQUFNLENBQUNNLFlBQVksQ0FBRSxnQ0FBaUMsQ0FBRSxDQUFDO0VBQzFIO0FBQ0Y7QUFFQWQsV0FBVyxDQUFDZSxRQUFRLENBQUUsNEJBQTRCLEVBQUVaLDBCQUEyQixDQUFDO0FBRWhGLGVBQWVBLDBCQUEwQiJ9