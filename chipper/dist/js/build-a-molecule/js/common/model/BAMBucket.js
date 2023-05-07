// Copyright 2020-2021, University of Colorado Boulder

/**
 * A bucket for Atom2
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import SphereBucket from '../../../../phetcommon/js/model/SphereBucket.js';
import { Color } from '../../../../scenery/js/imports.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMStrings from '../BAMStrings.js';
import AtomNode from '../view/AtomNode.js';
import Atom2 from './Atom2.js';
class BAMBucket extends SphereBucket {
  /**
   * The dimensions used are unit less, i.e. they are not meant to be any specific size (such as meters).  This enabled
   * reusability in any 2D model.
   * @param {Dimension2} size - Physical size of the bucket (model space)
   * @param {Emitter} stepEmitter
   * @param {Element} element - The element of the atoms in the bucket
   * @param {number} quantity - The number of atoms starting in the bucket
   */
  constructor(size, stepEmitter, element, quantity) {
    super({
      position: Vector2.ZERO,
      size: size,
      sphereRadius: element.covalentRadius,
      baseColor: element.color,
      captionText: BAMStrings[element],
      captionColor: AtomNode.getTextColor(new Color(element.color)),
      verticalParticleOffset: -30 + element.covalentRadius / 2
    });

    // @private {Property.<Vector2>}
    this.positionProperty = new Vector2Property(this.position);

    // @public {ObservableArrayDef.<Atom2>} Tracks all of the particles in this bucket
    this.particleList = createObservableArray();

    // @public {Array.<Atom2>} Contains atoms for a bucket when the bucket is full.
    this.fullState = [];

    // @public {Element}
    this.element = element;

    // @public {number}
    this.width = this.containerShape.bounds.width * 0.95;

    // Update the atoms when bucket's position is changed
    this.positionProperty.link(position => {
      this.getParticleList().forEach(atom => {
        atom.translatePositionAndDestination(position);
      });
    });

    // Create the atoms for each element and add them to the bucket. These exists for the sims lifetime.
    for (let i = 0; i < quantity; i++) {
      this.addParticleNearestOpen(new Atom2(element, stepEmitter), false);
    }
  }

  /**
   * Instantly place the atom in the correct position, whether or not it is in the bucket
   * @param {Atom2} atom
   * @param {boolean} addFirstOpen
   *
   * @public
   */
  placeAtom(atom, addFirstOpen) {
    if (this.containsParticle(atom)) {
      this.removeParticle(atom, true);
    }
    addFirstOpen ? this.addParticleFirstOpen(atom, false) : this.addParticleNearestOpen(atom, false);
  }

  /**
   * Used to assign atoms to bucket's initial state.
   *
   * @public
   */
  setToFullState() {
    this.fullState.forEach(atom => {
      if (!this.particleList.includes(atom)) {
        this.particleList.push(atom);
        this.placeAtom(atom, true);
      }
    });
  }

  /**
   * Checks if the bucket is full.
   *
   * @public
   * @returns {boolean}
   */
  isFull() {
    return this.fullState.length === this.particleList.length;
  }

  /**
   * Make sure we can fit all of our atoms in just two rows
   * @param {number} radius - Atomic radius (picometers)
   * @param {number} quantity - quantity of atoms in bucket
   *
   * @public
   * @returns {number} Width of bucket
   */
  static calculateIdealBucketWidth(radius, quantity) {
    // calculate atoms to go on the bottom row
    const numOnBottomRow = Math.floor(quantity <= 2 ? quantity : quantity / 2 + 1);

    // figure out our width, accounting for radius-padding on each side
    const width = 2 * radius * (numOnBottomRow + 1);

    // add a bit, and make sure we don't go under 350
    return Math.floor(Math.max(350, width + 1));
  }

  /**
   * Return bucket with an ideal width to fit all its atoms.
   * @param {Emitter} stepEmitter
   * @param {Element} element
   * @param {number} quantity
   *
   * @public
   * @returns {BAMBucket}
   */
  static createAutoSized(stepEmitter, element, quantity) {
    return new BAMBucket(new Dimension2(BAMBucket.calculateIdealBucketWidth(element.covalentRadius, quantity), 200), stepEmitter, element, quantity);
  }
}
buildAMolecule.register('BAMBucket', BAMBucket);
export default BAMBucket;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJEaW1lbnNpb24yIiwiVmVjdG9yMiIsIlZlY3RvcjJQcm9wZXJ0eSIsIlNwaGVyZUJ1Y2tldCIsIkNvbG9yIiwiYnVpbGRBTW9sZWN1bGUiLCJCQU1TdHJpbmdzIiwiQXRvbU5vZGUiLCJBdG9tMiIsIkJBTUJ1Y2tldCIsImNvbnN0cnVjdG9yIiwic2l6ZSIsInN0ZXBFbWl0dGVyIiwiZWxlbWVudCIsInF1YW50aXR5IiwicG9zaXRpb24iLCJaRVJPIiwic3BoZXJlUmFkaXVzIiwiY292YWxlbnRSYWRpdXMiLCJiYXNlQ29sb3IiLCJjb2xvciIsImNhcHRpb25UZXh0IiwiY2FwdGlvbkNvbG9yIiwiZ2V0VGV4dENvbG9yIiwidmVydGljYWxQYXJ0aWNsZU9mZnNldCIsInBvc2l0aW9uUHJvcGVydHkiLCJwYXJ0aWNsZUxpc3QiLCJmdWxsU3RhdGUiLCJ3aWR0aCIsImNvbnRhaW5lclNoYXBlIiwiYm91bmRzIiwibGluayIsImdldFBhcnRpY2xlTGlzdCIsImZvckVhY2giLCJhdG9tIiwidHJhbnNsYXRlUG9zaXRpb25BbmREZXN0aW5hdGlvbiIsImkiLCJhZGRQYXJ0aWNsZU5lYXJlc3RPcGVuIiwicGxhY2VBdG9tIiwiYWRkRmlyc3RPcGVuIiwiY29udGFpbnNQYXJ0aWNsZSIsInJlbW92ZVBhcnRpY2xlIiwiYWRkUGFydGljbGVGaXJzdE9wZW4iLCJzZXRUb0Z1bGxTdGF0ZSIsImluY2x1ZGVzIiwicHVzaCIsImlzRnVsbCIsImxlbmd0aCIsImNhbGN1bGF0ZUlkZWFsQnVja2V0V2lkdGgiLCJyYWRpdXMiLCJudW1PbkJvdHRvbVJvdyIsIk1hdGgiLCJmbG9vciIsIm1heCIsImNyZWF0ZUF1dG9TaXplZCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQkFNQnVja2V0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgYnVja2V0IGZvciBBdG9tMlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqIEBhdXRob3IgRGVuemVsbCBCYXJuZXR0IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMlByb3BlcnR5LmpzJztcclxuaW1wb3J0IFNwaGVyZUJ1Y2tldCBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL21vZGVsL1NwaGVyZUJ1Y2tldC5qcyc7XHJcbmltcG9ydCB7IENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGJ1aWxkQU1vbGVjdWxlIGZyb20gJy4uLy4uL2J1aWxkQU1vbGVjdWxlLmpzJztcclxuaW1wb3J0IEJBTVN0cmluZ3MgZnJvbSAnLi4vQkFNU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBBdG9tTm9kZSBmcm9tICcuLi92aWV3L0F0b21Ob2RlLmpzJztcclxuaW1wb3J0IEF0b20yIGZyb20gJy4vQXRvbTIuanMnO1xyXG5cclxuY2xhc3MgQkFNQnVja2V0IGV4dGVuZHMgU3BoZXJlQnVja2V0IHtcclxuICAvKipcclxuICAgKiBUaGUgZGltZW5zaW9ucyB1c2VkIGFyZSB1bml0IGxlc3MsIGkuZS4gdGhleSBhcmUgbm90IG1lYW50IHRvIGJlIGFueSBzcGVjaWZpYyBzaXplIChzdWNoIGFzIG1ldGVycykuICBUaGlzIGVuYWJsZWRcclxuICAgKiByZXVzYWJpbGl0eSBpbiBhbnkgMkQgbW9kZWwuXHJcbiAgICogQHBhcmFtIHtEaW1lbnNpb24yfSBzaXplIC0gUGh5c2ljYWwgc2l6ZSBvZiB0aGUgYnVja2V0IChtb2RlbCBzcGFjZSlcclxuICAgKiBAcGFyYW0ge0VtaXR0ZXJ9IHN0ZXBFbWl0dGVyXHJcbiAgICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IC0gVGhlIGVsZW1lbnQgb2YgdGhlIGF0b21zIGluIHRoZSBidWNrZXRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcXVhbnRpdHkgLSBUaGUgbnVtYmVyIG9mIGF0b21zIHN0YXJ0aW5nIGluIHRoZSBidWNrZXRcclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggc2l6ZSwgc3RlcEVtaXR0ZXIsIGVsZW1lbnQsIHF1YW50aXR5ICkge1xyXG4gICAgc3VwZXIoIHtcclxuICAgICAgcG9zaXRpb246IFZlY3RvcjIuWkVSTyxcclxuICAgICAgc2l6ZTogc2l6ZSxcclxuICAgICAgc3BoZXJlUmFkaXVzOiBlbGVtZW50LmNvdmFsZW50UmFkaXVzLFxyXG4gICAgICBiYXNlQ29sb3I6IGVsZW1lbnQuY29sb3IsXHJcbiAgICAgIGNhcHRpb25UZXh0OiBCQU1TdHJpbmdzWyBlbGVtZW50IF0sXHJcbiAgICAgIGNhcHRpb25Db2xvcjogQXRvbU5vZGUuZ2V0VGV4dENvbG9yKCBuZXcgQ29sb3IoIGVsZW1lbnQuY29sb3IgKSApLFxyXG4gICAgICB2ZXJ0aWNhbFBhcnRpY2xlT2Zmc2V0OiAtMzAgKyBlbGVtZW50LmNvdmFsZW50UmFkaXVzIC8gMlxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtQcm9wZXJ0eS48VmVjdG9yMj59XHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCB0aGlzLnBvc2l0aW9uICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7T2JzZXJ2YWJsZUFycmF5RGVmLjxBdG9tMj59IFRyYWNrcyBhbGwgb2YgdGhlIHBhcnRpY2xlcyBpbiB0aGlzIGJ1Y2tldFxyXG4gICAgdGhpcy5wYXJ0aWNsZUxpc3QgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtBcnJheS48QXRvbTI+fSBDb250YWlucyBhdG9tcyBmb3IgYSBidWNrZXQgd2hlbiB0aGUgYnVja2V0IGlzIGZ1bGwuXHJcbiAgICB0aGlzLmZ1bGxTdGF0ZSA9IFtdO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0VsZW1lbnR9XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bWJlcn1cclxuICAgIHRoaXMud2lkdGggPSB0aGlzLmNvbnRhaW5lclNoYXBlLmJvdW5kcy53aWR0aCAqIDAuOTU7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBhdG9tcyB3aGVuIGJ1Y2tldCdzIHBvc2l0aW9uIGlzIGNoYW5nZWRcclxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5saW5rKCBwb3NpdGlvbiA9PiB7XHJcbiAgICAgIHRoaXMuZ2V0UGFydGljbGVMaXN0KCkuZm9yRWFjaCggYXRvbSA9PiB7XHJcbiAgICAgICAgYXRvbS50cmFuc2xhdGVQb3NpdGlvbkFuZERlc3RpbmF0aW9uKCBwb3NpdGlvbiApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBhdG9tcyBmb3IgZWFjaCBlbGVtZW50IGFuZCBhZGQgdGhlbSB0byB0aGUgYnVja2V0LiBUaGVzZSBleGlzdHMgZm9yIHRoZSBzaW1zIGxpZmV0aW1lLlxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcXVhbnRpdHk7IGkrKyApIHtcclxuICAgICAgdGhpcy5hZGRQYXJ0aWNsZU5lYXJlc3RPcGVuKCBuZXcgQXRvbTIoIGVsZW1lbnQsIHN0ZXBFbWl0dGVyICksIGZhbHNlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbnN0YW50bHkgcGxhY2UgdGhlIGF0b20gaW4gdGhlIGNvcnJlY3QgcG9zaXRpb24sIHdoZXRoZXIgb3Igbm90IGl0IGlzIGluIHRoZSBidWNrZXRcclxuICAgKiBAcGFyYW0ge0F0b20yfSBhdG9tXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBhZGRGaXJzdE9wZW5cclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBwbGFjZUF0b20oIGF0b20sIGFkZEZpcnN0T3BlbiApIHtcclxuICAgIGlmICggdGhpcy5jb250YWluc1BhcnRpY2xlKCBhdG9tICkgKSB7XHJcbiAgICAgIHRoaXMucmVtb3ZlUGFydGljbGUoIGF0b20sIHRydWUgKTtcclxuICAgIH1cclxuICAgIGFkZEZpcnN0T3BlbiA/IHRoaXMuYWRkUGFydGljbGVGaXJzdE9wZW4oIGF0b20sIGZhbHNlICkgOiB0aGlzLmFkZFBhcnRpY2xlTmVhcmVzdE9wZW4oIGF0b20sIGZhbHNlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVc2VkIHRvIGFzc2lnbiBhdG9tcyB0byBidWNrZXQncyBpbml0aWFsIHN0YXRlLlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldFRvRnVsbFN0YXRlKCkge1xyXG4gICAgdGhpcy5mdWxsU3RhdGUuZm9yRWFjaCggYXRvbSA9PiB7XHJcbiAgICAgIGlmICggIXRoaXMucGFydGljbGVMaXN0LmluY2x1ZGVzKCBhdG9tICkgKSB7XHJcbiAgICAgICAgdGhpcy5wYXJ0aWNsZUxpc3QucHVzaCggYXRvbSApO1xyXG4gICAgICAgIHRoaXMucGxhY2VBdG9tKCBhdG9tLCB0cnVlICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrcyBpZiB0aGUgYnVja2V0IGlzIGZ1bGwuXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaXNGdWxsKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZnVsbFN0YXRlLmxlbmd0aCA9PT0gdGhpcy5wYXJ0aWNsZUxpc3QubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFrZSBzdXJlIHdlIGNhbiBmaXQgYWxsIG9mIG91ciBhdG9tcyBpbiBqdXN0IHR3byByb3dzXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1cyAtIEF0b21pYyByYWRpdXMgKHBpY29tZXRlcnMpXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHF1YW50aXR5IC0gcXVhbnRpdHkgb2YgYXRvbXMgaW4gYnVja2V0XHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge251bWJlcn0gV2lkdGggb2YgYnVja2V0XHJcbiAgICovXHJcbiAgc3RhdGljIGNhbGN1bGF0ZUlkZWFsQnVja2V0V2lkdGgoIHJhZGl1cywgcXVhbnRpdHkgKSB7XHJcbiAgICAvLyBjYWxjdWxhdGUgYXRvbXMgdG8gZ28gb24gdGhlIGJvdHRvbSByb3dcclxuICAgIGNvbnN0IG51bU9uQm90dG9tUm93ID0gTWF0aC5mbG9vciggKCBxdWFudGl0eSA8PSAyICkgPyBxdWFudGl0eSA6ICggcXVhbnRpdHkgLyAyICsgMSApICk7XHJcblxyXG4gICAgLy8gZmlndXJlIG91dCBvdXIgd2lkdGgsIGFjY291bnRpbmcgZm9yIHJhZGl1cy1wYWRkaW5nIG9uIGVhY2ggc2lkZVxyXG4gICAgY29uc3Qgd2lkdGggPSAyICogcmFkaXVzICogKCBudW1PbkJvdHRvbVJvdyArIDEgKTtcclxuXHJcbiAgICAvLyBhZGQgYSBiaXQsIGFuZCBtYWtlIHN1cmUgd2UgZG9uJ3QgZ28gdW5kZXIgMzUwXHJcbiAgICByZXR1cm4gTWF0aC5mbG9vciggTWF0aC5tYXgoIDM1MCwgd2lkdGggKyAxICkgKTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm4gYnVja2V0IHdpdGggYW4gaWRlYWwgd2lkdGggdG8gZml0IGFsbCBpdHMgYXRvbXMuXHJcbiAgICogQHBhcmFtIHtFbWl0dGVyfSBzdGVwRW1pdHRlclxyXG4gICAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBxdWFudGl0eVxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtCQU1CdWNrZXR9XHJcbiAgICovXHJcbiAgc3RhdGljIGNyZWF0ZUF1dG9TaXplZCggc3RlcEVtaXR0ZXIsIGVsZW1lbnQsIHF1YW50aXR5ICkge1xyXG4gICAgcmV0dXJuIG5ldyBCQU1CdWNrZXQoIG5ldyBEaW1lbnNpb24yKCBCQU1CdWNrZXQuY2FsY3VsYXRlSWRlYWxCdWNrZXRXaWR0aCggZWxlbWVudC5jb3ZhbGVudFJhZGl1cywgcXVhbnRpdHkgKSwgMjAwICksIHN0ZXBFbWl0dGVyLCBlbGVtZW50LCBxdWFudGl0eSApO1xyXG4gIH1cclxufVxyXG5cclxuYnVpbGRBTW9sZWN1bGUucmVnaXN0ZXIoICdCQU1CdWNrZXQnLCBCQU1CdWNrZXQgKTtcclxuZXhwb3J0IGRlZmF1bHQgQkFNQnVja2V0OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLHFCQUFxQixNQUFNLDhDQUE4QztBQUNoRixPQUFPQyxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsZUFBZSxNQUFNLHVDQUF1QztBQUNuRSxPQUFPQyxZQUFZLE1BQU0saURBQWlEO0FBQzFFLFNBQVNDLEtBQUssUUFBUSxtQ0FBbUM7QUFDekQsT0FBT0MsY0FBYyxNQUFNLHlCQUF5QjtBQUNwRCxPQUFPQyxVQUFVLE1BQU0sa0JBQWtCO0FBQ3pDLE9BQU9DLFFBQVEsTUFBTSxxQkFBcUI7QUFDMUMsT0FBT0MsS0FBSyxNQUFNLFlBQVk7QUFFOUIsTUFBTUMsU0FBUyxTQUFTTixZQUFZLENBQUM7RUFDbkM7QUFDRjtB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