// Copyright 2020-2021, University of Colorado Boulder

/**
 * Represents the lewis-dot directional connections between atoms. Holds information for all atoms within a particular kit, but it is generic
 * enough to handle other situations
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import buildAMolecule from '../../buildAMolecule.js';
import Direction from './Direction.js';
class LewisDotModel {
  constructor() {
    // @public {Object.<atomId:number, LewisDotAtom>}
    this.atomMap = {};
  }

  /**
   * Add an atom to the atom map
   * @param {Atom} atom
   *
   * @public
   */
  addAtom(atom) {
    this.atomMap[atom.id] = new LewisDotAtom(atom);
  }

  /**
   * Remove the bonds from an atom
   * @param {Atom} atom
   *
   * @public
   */
  breakBondsOfAtom(atom) {
    const dotAtom = this.getLewisDotAtom(atom);

    // disconnect all of its bonds
    Direction.VALUES.forEach(direction => {
      if (dotAtom && dotAtom.hasConnection(direction)) {
        const otherDotAtom = dotAtom.getLewisDotAtom(direction);
        this.breakBond(dotAtom.atom, otherDotAtom.atom);
      }
    });
  }

  /**
   * Break the bond between A and B (if it exists)
   * @param {Atom} a - A
   * @param {Atom} b - B
   *
   * @public
   */
  breakBond(a, b) {
    const dotA = this.getLewisDotAtom(a);
    const dotB = this.getLewisDotAtom(b);
    const direction = this.getBondDirection(a, b);
    dotA.disconnect(direction);
    dotB.disconnect(direction.opposite);
  }

  /**
   * Bond together atoms A and B.
   *
   * @param {Atom}      a       A
   * @param {Direction} dirAtoB The direction from A to B. So if A is to the left, B is on the right, the direction would be East
   * @param {Atom}      b       B
   *
   * @public
   */
  bond(a, dirAtoB, b) {
    const dotA = this.getLewisDotAtom(a);
    const dotB = this.getLewisDotAtom(b);
    dotA.connect(dirAtoB, dotB);
    dotB.connect(dirAtoB.opposite, dotA);
  }

  /**
   * Returns all of the directions that are open (not bonded to another) on the atom
   * @param {Atom} atom
   *
   * @public
   * @returns {Array.<Direction>}
   */
  getOpenDirections(atom) {
    const result = [];
    const dotAtom = this.getLewisDotAtom(atom);
    Direction.VALUES.forEach(direction => {
      if (dotAtom && !dotAtom.hasConnection(direction)) {
        result.push(direction);
      }
    });
    return result;
  }

  /**
   * Returns the bond direction from A to B. If it doesn't exist, an exception is thrown
   * @param {Atom} a - A
   * @param {Atom} b - B
   *
   * @public
   * @returns {Direction}
   */
  getBondDirection(a, b) {
    const dotA = this.getLewisDotAtom(a);
    for (let i = 0; i < 4; i++) {
      const direction = Direction.VALUES[i];
      if (dotA && dotA.hasConnection(direction) && dotA.getLewisDotAtom(direction).atom === b) {
        return direction;
      }
    }
    throw new Error('Bond not found');
  }

  /**
   * Decide whether this bonding would cause any layout issues. Does NOT detect loops, and will
   * fail if given molecules with loops.
   * @param {Atom}      a         A
   * @param {Direction} direction Direction from A to B
   * @param {Atom}      b         B
   *
   * @public
   * @returns {boolean} Whether this bond is considered acceptable
   */
  willAllowBond(a, direction, b) {
    /*---------------------------------------------------------------------------*
     * We need to verify that if we bind these two together that no overlaps occur.
     * This can be done by creating a coordinate system where atom A is our origin,
     * and verifying that no atoms share the same coordinates if they are not both
     * hydrogen.
     *----------------------------------------------------------------------------*/

    const coordinateMap = {};

    // map the molecule on the A side, from the origin
    let success = this.mapMolecule(Vector2.ZERO, a, null, coordinateMap);

    // map the molecule on the B side, with the offset from direction
    success = success && this.mapMolecule(direction.vector, b, null, coordinateMap);

    // we would have false if a conflict was found
    return success;
  }

  /*---------------------------------------------------------------------------*
   * implementation details
   *----------------------------------------------------------------------------*/

  /**
   * Add "atom" to our coordinate map, and all of its neighbors EXCEPT for excludedAtom.
   * This allows mapping a molecule without loops quite easily
   *
   * @param {Vector2}             coordinates   Coordinates of "atom"
   * @param {Atom}                atom          Atom to add
   * @param {Atom}                excludedAtom  Atom not to
   * @param {Map x+','+y => Atom} coordinateMap Coordinate map to which we add the atoms to
   *
   * @private
   * @returns {boolean} Success. Will return false if any heavy atom overlaps on another atom. If it returns false, the coordinate map may be inconsistent
   */
  mapMolecule(coordinates, atom, excludedAtom, coordinateMap) {
    const dotAtom = this.getLewisDotAtom(atom);

    // for sanity and equality (negative zero equals zero, so don't worry about that)
    const point = new Vector2(Utils.roundSymmetric(coordinates.x), Utils.roundSymmetric(coordinates.y));
    const idx = `${point.x},${point.y}`;

    // if we have seen a different atom in this position
    if (coordinateMap[idx]) {
      // if at least one isn't hydrogen, fail out
      if (!atom.isHydrogen() || !coordinateMap[idx].isHydrogen()) {
        return false;
      }
      // here, they both must be hydrogen, so we don't need to worry about adding it in
    } else {
      coordinateMap[idx] = atom;
    }
    let success = true;

    // check all directions so we can explore all other atoms that need to be mapped
    for (let i = 0; i < 4; i++) {
      const direction = Direction.VALUES[i];
      if (dotAtom && dotAtom.hasConnection(direction)) {
        const otherDot = dotAtom.getLewisDotAtom(direction);

        // if this atom isn't excluded
        if (otherDot.atom !== excludedAtom) {
          success = this.mapMolecule(coordinates.plus(direction.vector), otherDot.atom, atom, coordinateMap);

          // if we had a failure mapping that one, bail out
          if (!success) {
            return false;
          }
        }
      }
    }

    // everything worked
    return success;
  }

  /**
   * @param {Atom} atom
   *
   * @private
   * @returns {Atom}
   */
  getLewisDotAtom(atom) {
    return this.atomMap[atom.id];
  }
}
class LewisDotAtom {
  /**
   * @param {Atom} atom
   */
  constructor(atom) {
    // @private {Atom}
    this.atom = atom;

    // @private {Object.<DirectionID:null|LewisDotAtom>}
    this.connections = {};
    Direction.VALUES.forEach(direction => {
      this.connections[direction.id] = null; // nothing in this direction
    });
  }

  /**
   * Checks if a specific direction has any connections
   * @param {Direction} direction
   *
   * @public
   * @returns {boolean}
   */
  hasConnection(direction) {
    return this.connections[direction.id] !== null;
  }

  /**
   * Returns the atom connected in a specific direction
   * @param {Direction} direction
   *
   * @public
   * @returns {LewisDotAtom}
   */
  getLewisDotAtom(direction) {
    return this.connections[direction.id];
  }

  /**
   * Assign a lewis dot atom connection to a specific direction
   * @param {Direction} direction
   * @param {LewisDotAtom} lewisDotAtom
   * @private
   */
  connect(direction, lewisDotAtom) {
    this.connections[direction.id] = lewisDotAtom;
  }

  /**
   * Unassign a lewis dot atom connection to a specific direction
   * @param {Direction} direction
   * @private
   */
  disconnect(direction) {
    this.connections[direction.id] = null;
  }
}
buildAMolecule.register('LewisDotModel', LewisDotModel);
export default LewisDotModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIlZlY3RvcjIiLCJidWlsZEFNb2xlY3VsZSIsIkRpcmVjdGlvbiIsIkxld2lzRG90TW9kZWwiLCJjb25zdHJ1Y3RvciIsImF0b21NYXAiLCJhZGRBdG9tIiwiYXRvbSIsImlkIiwiTGV3aXNEb3RBdG9tIiwiYnJlYWtCb25kc09mQXRvbSIsImRvdEF0b20iLCJnZXRMZXdpc0RvdEF0b20iLCJWQUxVRVMiLCJmb3JFYWNoIiwiZGlyZWN0aW9uIiwiaGFzQ29ubmVjdGlvbiIsIm90aGVyRG90QXRvbSIsImJyZWFrQm9uZCIsImEiLCJiIiwiZG90QSIsImRvdEIiLCJnZXRCb25kRGlyZWN0aW9uIiwiZGlzY29ubmVjdCIsIm9wcG9zaXRlIiwiYm9uZCIsImRpckF0b0IiLCJjb25uZWN0IiwiZ2V0T3BlbkRpcmVjdGlvbnMiLCJyZXN1bHQiLCJwdXNoIiwiaSIsIkVycm9yIiwid2lsbEFsbG93Qm9uZCIsImNvb3JkaW5hdGVNYXAiLCJzdWNjZXNzIiwibWFwTW9sZWN1bGUiLCJaRVJPIiwidmVjdG9yIiwiY29vcmRpbmF0ZXMiLCJleGNsdWRlZEF0b20iLCJwb2ludCIsInJvdW5kU3ltbWV0cmljIiwieCIsInkiLCJpZHgiLCJpc0h5ZHJvZ2VuIiwib3RoZXJEb3QiLCJwbHVzIiwiY29ubmVjdGlvbnMiLCJsZXdpc0RvdEF0b20iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkxld2lzRG90TW9kZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUmVwcmVzZW50cyB0aGUgbGV3aXMtZG90IGRpcmVjdGlvbmFsIGNvbm5lY3Rpb25zIGJldHdlZW4gYXRvbXMuIEhvbGRzIGluZm9ybWF0aW9uIGZvciBhbGwgYXRvbXMgd2l0aGluIGEgcGFydGljdWxhciBraXQsIGJ1dCBpdCBpcyBnZW5lcmljXHJcbiAqIGVub3VnaCB0byBoYW5kbGUgb3RoZXIgc2l0dWF0aW9uc1xyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqIEBhdXRob3IgRGVuemVsbCBCYXJuZXR0IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBidWlsZEFNb2xlY3VsZSBmcm9tICcuLi8uLi9idWlsZEFNb2xlY3VsZS5qcyc7XHJcbmltcG9ydCBEaXJlY3Rpb24gZnJvbSAnLi9EaXJlY3Rpb24uanMnO1xyXG5cclxuY2xhc3MgTGV3aXNEb3RNb2RlbCB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7T2JqZWN0LjxhdG9tSWQ6bnVtYmVyLCBMZXdpc0RvdEF0b20+fVxyXG4gICAgdGhpcy5hdG9tTWFwID0ge307XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgYW4gYXRvbSB0byB0aGUgYXRvbSBtYXBcclxuICAgKiBAcGFyYW0ge0F0b219IGF0b21cclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhZGRBdG9tKCBhdG9tICkge1xyXG4gICAgdGhpcy5hdG9tTWFwWyBhdG9tLmlkIF0gPSBuZXcgTGV3aXNEb3RBdG9tKCBhdG9tICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgdGhlIGJvbmRzIGZyb20gYW4gYXRvbVxyXG4gICAqIEBwYXJhbSB7QXRvbX0gYXRvbVxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGJyZWFrQm9uZHNPZkF0b20oIGF0b20gKSB7XHJcbiAgICBjb25zdCBkb3RBdG9tID0gdGhpcy5nZXRMZXdpc0RvdEF0b20oIGF0b20gKTtcclxuXHJcbiAgICAvLyBkaXNjb25uZWN0IGFsbCBvZiBpdHMgYm9uZHNcclxuICAgIERpcmVjdGlvbi5WQUxVRVMuZm9yRWFjaCggZGlyZWN0aW9uID0+IHtcclxuICAgICAgaWYgKCBkb3RBdG9tICYmIGRvdEF0b20uaGFzQ29ubmVjdGlvbiggZGlyZWN0aW9uICkgKSB7XHJcbiAgICAgICAgY29uc3Qgb3RoZXJEb3RBdG9tID0gZG90QXRvbS5nZXRMZXdpc0RvdEF0b20oIGRpcmVjdGlvbiApO1xyXG4gICAgICAgIHRoaXMuYnJlYWtCb25kKCBkb3RBdG9tLmF0b20sIG90aGVyRG90QXRvbS5hdG9tICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEJyZWFrIHRoZSBib25kIGJldHdlZW4gQSBhbmQgQiAoaWYgaXQgZXhpc3RzKVxyXG4gICAqIEBwYXJhbSB7QXRvbX0gYSAtIEFcclxuICAgKiBAcGFyYW0ge0F0b219IGIgLSBCXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYnJlYWtCb25kKCBhLCBiICkge1xyXG4gICAgY29uc3QgZG90QSA9IHRoaXMuZ2V0TGV3aXNEb3RBdG9tKCBhICk7XHJcbiAgICBjb25zdCBkb3RCID0gdGhpcy5nZXRMZXdpc0RvdEF0b20oIGIgKTtcclxuICAgIGNvbnN0IGRpcmVjdGlvbiA9IHRoaXMuZ2V0Qm9uZERpcmVjdGlvbiggYSwgYiApO1xyXG4gICAgZG90QS5kaXNjb25uZWN0KCBkaXJlY3Rpb24gKTtcclxuICAgIGRvdEIuZGlzY29ubmVjdCggZGlyZWN0aW9uLm9wcG9zaXRlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBCb25kIHRvZ2V0aGVyIGF0b21zIEEgYW5kIEIuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0F0b219ICAgICAgYSAgICAgICBBXHJcbiAgICogQHBhcmFtIHtEaXJlY3Rpb259IGRpckF0b0IgVGhlIGRpcmVjdGlvbiBmcm9tIEEgdG8gQi4gU28gaWYgQSBpcyB0byB0aGUgbGVmdCwgQiBpcyBvbiB0aGUgcmlnaHQsIHRoZSBkaXJlY3Rpb24gd291bGQgYmUgRWFzdFxyXG4gICAqIEBwYXJhbSB7QXRvbX0gICAgICBiICAgICAgIEJcclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBib25kKCBhLCBkaXJBdG9CLCBiICkge1xyXG4gICAgY29uc3QgZG90QSA9IHRoaXMuZ2V0TGV3aXNEb3RBdG9tKCBhICk7XHJcbiAgICBjb25zdCBkb3RCID0gdGhpcy5nZXRMZXdpc0RvdEF0b20oIGIgKTtcclxuICAgIGRvdEEuY29ubmVjdCggZGlyQXRvQiwgZG90QiApO1xyXG4gICAgZG90Qi5jb25uZWN0KCBkaXJBdG9CLm9wcG9zaXRlLCBkb3RBICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFsbCBvZiB0aGUgZGlyZWN0aW9ucyB0aGF0IGFyZSBvcGVuIChub3QgYm9uZGVkIHRvIGFub3RoZXIpIG9uIHRoZSBhdG9tXHJcbiAgICogQHBhcmFtIHtBdG9tfSBhdG9tXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge0FycmF5LjxEaXJlY3Rpb24+fVxyXG4gICAqL1xyXG4gIGdldE9wZW5EaXJlY3Rpb25zKCBhdG9tICkge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gW107XHJcbiAgICBjb25zdCBkb3RBdG9tID0gdGhpcy5nZXRMZXdpc0RvdEF0b20oIGF0b20gKTtcclxuICAgIERpcmVjdGlvbi5WQUxVRVMuZm9yRWFjaCggZGlyZWN0aW9uID0+IHtcclxuICAgICAgaWYgKCBkb3RBdG9tICYmICFkb3RBdG9tLmhhc0Nvbm5lY3Rpb24oIGRpcmVjdGlvbiApICkge1xyXG4gICAgICAgIHJlc3VsdC5wdXNoKCBkaXJlY3Rpb24gKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGJvbmQgZGlyZWN0aW9uIGZyb20gQSB0byBCLiBJZiBpdCBkb2Vzbid0IGV4aXN0LCBhbiBleGNlcHRpb24gaXMgdGhyb3duXHJcbiAgICogQHBhcmFtIHtBdG9tfSBhIC0gQVxyXG4gICAqIEBwYXJhbSB7QXRvbX0gYiAtIEJcclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7RGlyZWN0aW9ufVxyXG4gICAqL1xyXG4gIGdldEJvbmREaXJlY3Rpb24oIGEsIGIgKSB7XHJcbiAgICBjb25zdCBkb3RBID0gdGhpcy5nZXRMZXdpc0RvdEF0b20oIGEgKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IDQ7IGkrKyApIHtcclxuICAgICAgY29uc3QgZGlyZWN0aW9uID0gRGlyZWN0aW9uLlZBTFVFU1sgaSBdO1xyXG4gICAgICBpZiAoIGRvdEEgJiYgZG90QS5oYXNDb25uZWN0aW9uKCBkaXJlY3Rpb24gKSAmJiBkb3RBLmdldExld2lzRG90QXRvbSggZGlyZWN0aW9uICkuYXRvbSA9PT0gYiApIHtcclxuICAgICAgICByZXR1cm4gZGlyZWN0aW9uO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoICdCb25kIG5vdCBmb3VuZCcgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERlY2lkZSB3aGV0aGVyIHRoaXMgYm9uZGluZyB3b3VsZCBjYXVzZSBhbnkgbGF5b3V0IGlzc3Vlcy4gRG9lcyBOT1QgZGV0ZWN0IGxvb3BzLCBhbmQgd2lsbFxyXG4gICAqIGZhaWwgaWYgZ2l2ZW4gbW9sZWN1bGVzIHdpdGggbG9vcHMuXHJcbiAgICogQHBhcmFtIHtBdG9tfSAgICAgIGEgICAgICAgICBBXHJcbiAgICogQHBhcmFtIHtEaXJlY3Rpb259IGRpcmVjdGlvbiBEaXJlY3Rpb24gZnJvbSBBIHRvIEJcclxuICAgKiBAcGFyYW0ge0F0b219ICAgICAgYiAgICAgICAgIEJcclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gV2hldGhlciB0aGlzIGJvbmQgaXMgY29uc2lkZXJlZCBhY2NlcHRhYmxlXHJcbiAgICovXHJcbiAgd2lsbEFsbG93Qm9uZCggYSwgZGlyZWN0aW9uLCBiICkge1xyXG5cclxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gICAgICogV2UgbmVlZCB0byB2ZXJpZnkgdGhhdCBpZiB3ZSBiaW5kIHRoZXNlIHR3byB0b2dldGhlciB0aGF0IG5vIG92ZXJsYXBzIG9jY3VyLlxyXG4gICAgICogVGhpcyBjYW4gYmUgZG9uZSBieSBjcmVhdGluZyBhIGNvb3JkaW5hdGUgc3lzdGVtIHdoZXJlIGF0b20gQSBpcyBvdXIgb3JpZ2luLFxyXG4gICAgICogYW5kIHZlcmlmeWluZyB0aGF0IG5vIGF0b21zIHNoYXJlIHRoZSBzYW1lIGNvb3JkaW5hdGVzIGlmIHRoZXkgYXJlIG5vdCBib3RoXHJcbiAgICAgKiBoeWRyb2dlbi5cclxuICAgICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gICAgY29uc3QgY29vcmRpbmF0ZU1hcCA9IHt9O1xyXG5cclxuICAgIC8vIG1hcCB0aGUgbW9sZWN1bGUgb24gdGhlIEEgc2lkZSwgZnJvbSB0aGUgb3JpZ2luXHJcbiAgICBsZXQgc3VjY2VzcyA9IHRoaXMubWFwTW9sZWN1bGUoIFZlY3RvcjIuWkVSTywgYSwgbnVsbCwgY29vcmRpbmF0ZU1hcCApO1xyXG5cclxuICAgIC8vIG1hcCB0aGUgbW9sZWN1bGUgb24gdGhlIEIgc2lkZSwgd2l0aCB0aGUgb2Zmc2V0IGZyb20gZGlyZWN0aW9uXHJcbiAgICBzdWNjZXNzID0gc3VjY2VzcyAmJiB0aGlzLm1hcE1vbGVjdWxlKCBkaXJlY3Rpb24udmVjdG9yLCBiLCBudWxsLCBjb29yZGluYXRlTWFwICk7XHJcblxyXG4gICAgLy8gd2Ugd291bGQgaGF2ZSBmYWxzZSBpZiBhIGNvbmZsaWN0IHdhcyBmb3VuZFxyXG4gICAgcmV0dXJuIHN1Y2Nlc3M7XHJcbiAgfVxyXG5cclxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICAgKiBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzXHJcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIFwiYXRvbVwiIHRvIG91ciBjb29yZGluYXRlIG1hcCwgYW5kIGFsbCBvZiBpdHMgbmVpZ2hib3JzIEVYQ0VQVCBmb3IgZXhjbHVkZWRBdG9tLlxyXG4gICAqIFRoaXMgYWxsb3dzIG1hcHBpbmcgYSBtb2xlY3VsZSB3aXRob3V0IGxvb3BzIHF1aXRlIGVhc2lseVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSAgICAgICAgICAgICBjb29yZGluYXRlcyAgIENvb3JkaW5hdGVzIG9mIFwiYXRvbVwiXHJcbiAgICogQHBhcmFtIHtBdG9tfSAgICAgICAgICAgICAgICBhdG9tICAgICAgICAgIEF0b20gdG8gYWRkXHJcbiAgICogQHBhcmFtIHtBdG9tfSAgICAgICAgICAgICAgICBleGNsdWRlZEF0b20gIEF0b20gbm90IHRvXHJcbiAgICogQHBhcmFtIHtNYXAgeCsnLCcreSA9PiBBdG9tfSBjb29yZGluYXRlTWFwIENvb3JkaW5hdGUgbWFwIHRvIHdoaWNoIHdlIGFkZCB0aGUgYXRvbXMgdG9cclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59IFN1Y2Nlc3MuIFdpbGwgcmV0dXJuIGZhbHNlIGlmIGFueSBoZWF2eSBhdG9tIG92ZXJsYXBzIG9uIGFub3RoZXIgYXRvbS4gSWYgaXQgcmV0dXJucyBmYWxzZSwgdGhlIGNvb3JkaW5hdGUgbWFwIG1heSBiZSBpbmNvbnNpc3RlbnRcclxuICAgKi9cclxuICBtYXBNb2xlY3VsZSggY29vcmRpbmF0ZXMsIGF0b20sIGV4Y2x1ZGVkQXRvbSwgY29vcmRpbmF0ZU1hcCApIHtcclxuXHJcbiAgICBjb25zdCBkb3RBdG9tID0gdGhpcy5nZXRMZXdpc0RvdEF0b20oIGF0b20gKTtcclxuXHJcbiAgICAvLyBmb3Igc2FuaXR5IGFuZCBlcXVhbGl0eSAobmVnYXRpdmUgemVybyBlcXVhbHMgemVybywgc28gZG9uJ3Qgd29ycnkgYWJvdXQgdGhhdClcclxuICAgIGNvbnN0IHBvaW50ID0gbmV3IFZlY3RvcjIoIFV0aWxzLnJvdW5kU3ltbWV0cmljKCBjb29yZGluYXRlcy54ICksIFV0aWxzLnJvdW5kU3ltbWV0cmljKCBjb29yZGluYXRlcy55ICkgKTtcclxuXHJcbiAgICBjb25zdCBpZHggPSBgJHtwb2ludC54fSwke3BvaW50Lnl9YDtcclxuXHJcbiAgICAvLyBpZiB3ZSBoYXZlIHNlZW4gYSBkaWZmZXJlbnQgYXRvbSBpbiB0aGlzIHBvc2l0aW9uXHJcbiAgICBpZiAoIGNvb3JkaW5hdGVNYXBbIGlkeCBdICkge1xyXG4gICAgICAvLyBpZiBhdCBsZWFzdCBvbmUgaXNuJ3QgaHlkcm9nZW4sIGZhaWwgb3V0XHJcbiAgICAgIGlmICggIWF0b20uaXNIeWRyb2dlbigpIHx8ICFjb29yZGluYXRlTWFwWyBpZHggXS5pc0h5ZHJvZ2VuKCkgKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIGhlcmUsIHRoZXkgYm90aCBtdXN0IGJlIGh5ZHJvZ2VuLCBzbyB3ZSBkb24ndCBuZWVkIHRvIHdvcnJ5IGFib3V0IGFkZGluZyBpdCBpblxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGNvb3JkaW5hdGVNYXBbIGlkeCBdID0gYXRvbTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgc3VjY2VzcyA9IHRydWU7XHJcblxyXG4gICAgLy8gY2hlY2sgYWxsIGRpcmVjdGlvbnMgc28gd2UgY2FuIGV4cGxvcmUgYWxsIG90aGVyIGF0b21zIHRoYXQgbmVlZCB0byBiZSBtYXBwZWRcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IDQ7IGkrKyApIHtcclxuICAgICAgY29uc3QgZGlyZWN0aW9uID0gRGlyZWN0aW9uLlZBTFVFU1sgaSBdO1xyXG4gICAgICBpZiAoIGRvdEF0b20gJiYgZG90QXRvbS5oYXNDb25uZWN0aW9uKCBkaXJlY3Rpb24gKSApIHtcclxuICAgICAgICBjb25zdCBvdGhlckRvdCA9IGRvdEF0b20uZ2V0TGV3aXNEb3RBdG9tKCBkaXJlY3Rpb24gKTtcclxuXHJcbiAgICAgICAgLy8gaWYgdGhpcyBhdG9tIGlzbid0IGV4Y2x1ZGVkXHJcbiAgICAgICAgaWYgKCBvdGhlckRvdC5hdG9tICE9PSBleGNsdWRlZEF0b20gKSB7XHJcbiAgICAgICAgICBzdWNjZXNzID0gdGhpcy5tYXBNb2xlY3VsZSggY29vcmRpbmF0ZXMucGx1cyggZGlyZWN0aW9uLnZlY3RvciApLCBvdGhlckRvdC5hdG9tLCBhdG9tLCBjb29yZGluYXRlTWFwICk7XHJcblxyXG4gICAgICAgICAgLy8gaWYgd2UgaGFkIGEgZmFpbHVyZSBtYXBwaW5nIHRoYXQgb25lLCBiYWlsIG91dFxyXG4gICAgICAgICAgaWYgKCAhc3VjY2VzcyApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGV2ZXJ5dGhpbmcgd29ya2VkXHJcbiAgICByZXR1cm4gc3VjY2VzcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7QXRvbX0gYXRvbVxyXG4gICAqXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcmV0dXJucyB7QXRvbX1cclxuICAgKi9cclxuICBnZXRMZXdpc0RvdEF0b20oIGF0b20gKSB7XHJcbiAgICByZXR1cm4gdGhpcy5hdG9tTWFwWyBhdG9tLmlkIF07XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBMZXdpc0RvdEF0b20ge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7QXRvbX0gYXRvbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBhdG9tICkge1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtBdG9tfVxyXG4gICAgdGhpcy5hdG9tID0gYXRvbTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7T2JqZWN0LjxEaXJlY3Rpb25JRDpudWxsfExld2lzRG90QXRvbT59XHJcbiAgICB0aGlzLmNvbm5lY3Rpb25zID0ge307XHJcbiAgICBEaXJlY3Rpb24uVkFMVUVTLmZvckVhY2goIGRpcmVjdGlvbiA9PiB7XHJcbiAgICAgIHRoaXMuY29ubmVjdGlvbnNbIGRpcmVjdGlvbi5pZCBdID0gbnVsbDsgLy8gbm90aGluZyBpbiB0aGlzIGRpcmVjdGlvblxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2tzIGlmIGEgc3BlY2lmaWMgZGlyZWN0aW9uIGhhcyBhbnkgY29ubmVjdGlvbnNcclxuICAgKiBAcGFyYW0ge0RpcmVjdGlvbn0gZGlyZWN0aW9uXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaGFzQ29ubmVjdGlvbiggZGlyZWN0aW9uICkge1xyXG4gICAgcmV0dXJuIHRoaXMuY29ubmVjdGlvbnNbIGRpcmVjdGlvbi5pZCBdICE9PSBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgYXRvbSBjb25uZWN0ZWQgaW4gYSBzcGVjaWZpYyBkaXJlY3Rpb25cclxuICAgKiBAcGFyYW0ge0RpcmVjdGlvbn0gZGlyZWN0aW9uXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge0xld2lzRG90QXRvbX1cclxuICAgKi9cclxuICBnZXRMZXdpc0RvdEF0b20oIGRpcmVjdGlvbiApIHtcclxuICAgIHJldHVybiB0aGlzLmNvbm5lY3Rpb25zWyBkaXJlY3Rpb24uaWQgXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFzc2lnbiBhIGxld2lzIGRvdCBhdG9tIGNvbm5lY3Rpb24gdG8gYSBzcGVjaWZpYyBkaXJlY3Rpb25cclxuICAgKiBAcGFyYW0ge0RpcmVjdGlvbn0gZGlyZWN0aW9uXHJcbiAgICogQHBhcmFtIHtMZXdpc0RvdEF0b219IGxld2lzRG90QXRvbVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgY29ubmVjdCggZGlyZWN0aW9uLCBsZXdpc0RvdEF0b20gKSB7XHJcbiAgICB0aGlzLmNvbm5lY3Rpb25zWyBkaXJlY3Rpb24uaWQgXSA9IGxld2lzRG90QXRvbTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVuYXNzaWduIGEgbGV3aXMgZG90IGF0b20gY29ubmVjdGlvbiB0byBhIHNwZWNpZmljIGRpcmVjdGlvblxyXG4gICAqIEBwYXJhbSB7RGlyZWN0aW9ufSBkaXJlY3Rpb25cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGRpc2Nvbm5lY3QoIGRpcmVjdGlvbiApIHtcclxuICAgIHRoaXMuY29ubmVjdGlvbnNbIGRpcmVjdGlvbi5pZCBdID0gbnVsbDtcclxuICB9XHJcbn1cclxuXHJcbmJ1aWxkQU1vbGVjdWxlLnJlZ2lzdGVyKCAnTGV3aXNEb3RNb2RlbCcsIExld2lzRG90TW9kZWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgTGV3aXNEb3RNb2RlbDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxjQUFjLE1BQU0seUJBQXlCO0FBQ3BELE9BQU9DLFNBQVMsTUFBTSxnQkFBZ0I7QUFFdEMsTUFBTUMsYUFBYSxDQUFDO0VBQ2xCQyxXQUFX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