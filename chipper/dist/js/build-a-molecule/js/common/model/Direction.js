// Copyright 2020-2022, University of Colorado Boulder

/**
 * Represents a cardinal direction for use in our model. Also includes unit vector version
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import buildAMolecule from '../../buildAMolecule.js';

// constants
const DirectionOrientation = EnumerationDeprecated.byKeys(['NORTH', 'EAST', 'SOUTH', 'WEST']);
class DirectionValue {
  /**
   * @param {Vector2} vector
   * @param {string} id
   */
  constructor(vector, id) {
    // @public {Vector2}
    this.vector = vector;

    // @public {number}
    this.id = id;

    // @public {DirectionValue}
    this.opposite = null;
  }
}

// Declare cardinal direction values
const NORTH = new DirectionValue(new Vector2(0, 1), DirectionOrientation.NORTH);
const SOUTH = new DirectionValue(new Vector2(0, -1), DirectionOrientation.SOUTH);
const EAST = new DirectionValue(new Vector2(1, 0), DirectionOrientation.EAST);
const WEST = new DirectionValue(new Vector2(-1, 0), DirectionOrientation.WEST);

// Declare opposites
NORTH.opposite = SOUTH;
SOUTH.opposite = NORTH;
EAST.opposite = WEST;
WEST.opposite = EAST;
const Direction = EnumerationDeprecated.byMap({
  NORTH: NORTH,
  SOUTH: SOUTH,
  EAST: EAST,
  WEST: WEST
});
buildAMolecule.register('Direction', Direction);
export default Direction;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiRW51bWVyYXRpb25EZXByZWNhdGVkIiwiYnVpbGRBTW9sZWN1bGUiLCJEaXJlY3Rpb25PcmllbnRhdGlvbiIsImJ5S2V5cyIsIkRpcmVjdGlvblZhbHVlIiwiY29uc3RydWN0b3IiLCJ2ZWN0b3IiLCJpZCIsIm9wcG9zaXRlIiwiTk9SVEgiLCJTT1VUSCIsIkVBU1QiLCJXRVNUIiwiRGlyZWN0aW9uIiwiYnlNYXAiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkRpcmVjdGlvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRzIGEgY2FyZGluYWwgZGlyZWN0aW9uIGZvciB1c2UgaW4gb3VyIG1vZGVsLiBBbHNvIGluY2x1ZGVzIHVuaXQgdmVjdG9yIHZlcnNpb25cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKiBAYXV0aG9yIERlbnplbGwgQmFybmV0dCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uRGVwcmVjYXRlZC5qcyc7XHJcbmltcG9ydCBidWlsZEFNb2xlY3VsZSBmcm9tICcuLi8uLi9idWlsZEFNb2xlY3VsZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgRGlyZWN0aW9uT3JpZW50YXRpb24gPSBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQuYnlLZXlzKCBbICdOT1JUSCcsICdFQVNUJywgJ1NPVVRIJywgJ1dFU1QnIF0gKTtcclxuXHJcbmNsYXNzIERpcmVjdGlvblZhbHVlIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHZlY3RvclxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBpZFxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB2ZWN0b3IsIGlkICkge1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1ZlY3RvcjJ9XHJcbiAgICB0aGlzLnZlY3RvciA9IHZlY3RvcjtcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9XHJcbiAgICB0aGlzLmlkID0gaWQ7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7RGlyZWN0aW9uVmFsdWV9XHJcbiAgICB0aGlzLm9wcG9zaXRlID0gbnVsbDtcclxuICB9XHJcbn1cclxuXHJcbi8vIERlY2xhcmUgY2FyZGluYWwgZGlyZWN0aW9uIHZhbHVlc1xyXG5jb25zdCBOT1JUSCA9IG5ldyBEaXJlY3Rpb25WYWx1ZSggbmV3IFZlY3RvcjIoIDAsIDEgKSwgRGlyZWN0aW9uT3JpZW50YXRpb24uTk9SVEggKTtcclxuY29uc3QgU09VVEggPSBuZXcgRGlyZWN0aW9uVmFsdWUoIG5ldyBWZWN0b3IyKCAwLCAtMSApLCBEaXJlY3Rpb25PcmllbnRhdGlvbi5TT1VUSCApO1xyXG5jb25zdCBFQVNUID0gbmV3IERpcmVjdGlvblZhbHVlKCBuZXcgVmVjdG9yMiggMSwgMCApLCBEaXJlY3Rpb25PcmllbnRhdGlvbi5FQVNUICk7XHJcbmNvbnN0IFdFU1QgPSBuZXcgRGlyZWN0aW9uVmFsdWUoIG5ldyBWZWN0b3IyKCAtMSwgMCApLCBEaXJlY3Rpb25PcmllbnRhdGlvbi5XRVNUICk7XHJcblxyXG4vLyBEZWNsYXJlIG9wcG9zaXRlc1xyXG5OT1JUSC5vcHBvc2l0ZSA9IFNPVVRIO1xyXG5TT1VUSC5vcHBvc2l0ZSA9IE5PUlRIO1xyXG5FQVNULm9wcG9zaXRlID0gV0VTVDtcclxuV0VTVC5vcHBvc2l0ZSA9IEVBU1Q7XHJcblxyXG5jb25zdCBEaXJlY3Rpb24gPSBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQuYnlNYXAoIHtcclxuICBOT1JUSDogTk9SVEgsXHJcbiAgU09VVEg6IFNPVVRILFxyXG4gIEVBU1Q6IEVBU1QsXHJcbiAgV0VTVDogV0VTVFxyXG59ICk7XHJcblxyXG5idWlsZEFNb2xlY3VsZS5yZWdpc3RlciggJ0RpcmVjdGlvbicsIERpcmVjdGlvbiApO1xyXG5leHBvcnQgZGVmYXVsdCBEaXJlY3Rpb247Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxxQkFBcUIsTUFBTSxtREFBbUQ7QUFDckYsT0FBT0MsY0FBYyxNQUFNLHlCQUF5Qjs7QUFFcEQ7QUFDQSxNQUFNQyxvQkFBb0IsR0FBR0YscUJBQXFCLENBQUNHLE1BQU0sQ0FBRSxDQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBRyxDQUFDO0FBRWpHLE1BQU1DLGNBQWMsQ0FBQztFQUNuQjtBQUNGO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxNQUFNLEVBQUVDLEVBQUUsRUFBRztJQUV4QjtJQUNBLElBQUksQ0FBQ0QsTUFBTSxHQUFHQSxNQUFNOztJQUVwQjtJQUNBLElBQUksQ0FBQ0MsRUFBRSxHQUFHQSxFQUFFOztJQUVaO0lBQ0EsSUFBSSxDQUFDQyxRQUFRLEdBQUcsSUFBSTtFQUN0QjtBQUNGOztBQUVBO0FBQ0EsTUFBTUMsS0FBSyxHQUFHLElBQUlMLGNBQWMsQ0FBRSxJQUFJTCxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQyxFQUFFRyxvQkFBb0IsQ0FBQ08sS0FBTSxDQUFDO0FBQ25GLE1BQU1DLEtBQUssR0FBRyxJQUFJTixjQUFjLENBQUUsSUFBSUwsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FBQyxFQUFFRyxvQkFBb0IsQ0FBQ1EsS0FBTSxDQUFDO0FBQ3BGLE1BQU1DLElBQUksR0FBRyxJQUFJUCxjQUFjLENBQUUsSUFBSUwsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUMsRUFBRUcsb0JBQW9CLENBQUNTLElBQUssQ0FBQztBQUNqRixNQUFNQyxJQUFJLEdBQUcsSUFBSVIsY0FBYyxDQUFFLElBQUlMLE9BQU8sQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFFLENBQUMsRUFBRUcsb0JBQW9CLENBQUNVLElBQUssQ0FBQzs7QUFFbEY7QUFDQUgsS0FBSyxDQUFDRCxRQUFRLEdBQUdFLEtBQUs7QUFDdEJBLEtBQUssQ0FBQ0YsUUFBUSxHQUFHQyxLQUFLO0FBQ3RCRSxJQUFJLENBQUNILFFBQVEsR0FBR0ksSUFBSTtBQUNwQkEsSUFBSSxDQUFDSixRQUFRLEdBQUdHLElBQUk7QUFFcEIsTUFBTUUsU0FBUyxHQUFHYixxQkFBcUIsQ0FBQ2MsS0FBSyxDQUFFO0VBQzdDTCxLQUFLLEVBQUVBLEtBQUs7RUFDWkMsS0FBSyxFQUFFQSxLQUFLO0VBQ1pDLElBQUksRUFBRUEsSUFBSTtFQUNWQyxJQUFJLEVBQUVBO0FBQ1IsQ0FBRSxDQUFDO0FBRUhYLGNBQWMsQ0FBQ2MsUUFBUSxDQUFFLFdBQVcsRUFBRUYsU0FBVSxDQUFDO0FBQ2pELGVBQWVBLFNBQVMifQ==