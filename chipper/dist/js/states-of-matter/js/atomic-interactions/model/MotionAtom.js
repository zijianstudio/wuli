// Copyright 2014-2022, University of Colorado Boulder

/**
 * MotionAtom is a model of an atom with Axon Property values that track position, velocity, and acceleration, as well
 * as other attributes that needed by the Atomic Interactions screen.
 *
 * @author John Blanco
 */

import Emitter from '../../../../axon/js/Emitter.js';
import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import AtomType from '../../common/model/AtomType.js';
import SOMConstants from '../../common/SOMConstants.js';
import statesOfMatter from '../../statesOfMatter.js';
class MotionAtom {
  /**
   * @param {AtomType} initialAtomType - initial type, aka element, for this atom
   * @param {number} initialXPosition - x position in the model, in picometers
   * @param {number} initialYPosition - y position in the model, in picometers
   * @param {Tandem} tandem
   */
  constructor(initialAtomType, initialXPosition, initialYPosition, tandem) {
    // @public (read-write) {EnumerationDeprecatedProperty.<AtomType>} - the type of atom being modeled, e.g. Argon, Neon, etc.
    this.atomTypeProperty = new EnumerationDeprecatedProperty(AtomType, initialAtomType, {
      tandem: tandem.createTandem('atomTypeProperty'),
      phetioReadOnly: true
    });

    // get the default attributes associated with this atom
    const initialAtomAttributes = SOMConstants.MAP_ATOM_TYPE_TO_ATTRIBUTES.get(initialAtomType);

    // @public (read-write) {NumberProperty} - radius of this atom, should only be changed for adjustable atoms
    this.radiusProperty = new NumberProperty(initialAtomAttributes.radius, {
      units: 'pm',
      tandem: tandem.createTandem('radiusProperty'),
      phetioReadOnly: true
    });

    // @private, accessed through getter and setter methods below, see those methods for details
    this.positionProperty = new Vector2Property(new Vector2(initialXPosition, initialYPosition), {
      units: 'pm',
      tandem: tandem.createTandem('positionProperty')
    });

    // @private, accessed through the getter/setter methods below
    this.velocityProperty = new Vector2Property(Vector2.ZERO, {
      units: 'pm/s',
      tandem: tandem.createTandem('velocityProperty')
    });

    // @private, accessed through the getter/setter methods below
    this.accelerationProperty = new Vector2Property(Vector2.ZERO, {
      units: 'pm/s^2',
      tandem: tandem.createTandem('accelerationProperty')
    });

    // @public {listen-only} - An emitter that indicates that the configuration of this atom have changed, done as an
    // emitter so that the view doesn't have to separately monitor a set of properties that all change at once.
    this.configurationChanged = new Emitter();

    // @public {read-only} - attributes of the atom, changed as the atom type changes
    this.mass = 0;
    this.color = null;
    this.epsilon = 0;

    // update the attributes if and when the atom type changes
    this.atomTypeProperty.link(atomType => {
      const atomAttributes = SOMConstants.MAP_ATOM_TYPE_TO_ATTRIBUTES.get(atomType);
      this.mass = atomAttributes.mass;
      this.color = atomAttributes.color;

      // Generally the radius is set here too, but not when this is an adjustable atom and state is being set via
      // phet-io, because the radius needs to come from the atom diameter setting.
      if (!(phet.joist.sim.isSettingPhetioStateProperty.value && atomType === AtomType.ADJUSTABLE)) {
        this.radiusProperty.set(atomAttributes.radius);
      }

      // signal that the configuration has changed
      this.configurationChanged.emit();
    });
  }

  /**
   * @public
   * @param {number} x - atom x position in picometers
   * @param {number} y - atom y position in picometers
   */
  setPosition(x, y) {
    this.positionProperty.set(new Vector2(x, y));
  }

  /**
   * @returns {number}
   * @public
   */
  getVy() {
    return this.velocityProperty.value.y;
  }

  /**
   * @param {number} vy - atom velocity in y-direction
   * @public
   */
  setVy(vy) {
    this.velocityProperty.set(new Vector2(this.velocityProperty.value.x, vy));
  }

  /**
   * @returns {number}
   * @public
   */
  getVx() {
    return this.velocityProperty.value.x;
  }

  /**
   * @param {number} vx - atom velocity in x-direction
   * @public
   */
  setVx(vx) {
    this.velocityProperty.set(new Vector2(vx, this.velocityProperty.value.y));
  }

  /**
   * @returns {number}
   * @public
   */
  getAx() {
    return this.accelerationProperty.value.x;
  }

  /**
   * @returns {number}
   * @public
   */
  getAy() {
    return this.accelerationProperty.value.y;
  }

  /**
   * @param {number} ax - atom acceleration in x-direction
   * @public
   */
  setAx(ax) {
    this.accelerationProperty.set(new Vector2(ax, this.accelerationProperty.value.y));
  }

  /**
   * @param {number} ay - atom acceleration in y-direction
   * @public
   */
  setAy(ay) {
    this.accelerationProperty.set(new Vector2(this.accelerationProperty.value.x, ay));
  }

  /**
   * @returns {number}
   * @public
   */
  getX() {
    return this.positionProperty.value.x;
  }

  /**
   * @returns {number}
   * @public
   */
  getY() {
    return this.positionProperty.value.y;
  }

  /**
   * @returns {AtomType}
   * @public
   */
  getType() {
    return this.atomTypeProperty.value;
  }

  /**
   * @public
   */
  reset() {
    this.atomTypeProperty.reset();
    this.positionProperty.reset();
    this.velocityProperty.reset();
    this.accelerationProperty.reset();
  }
}
statesOfMatter.register('MotionAtom', MotionAtom);
export default MotionAtom;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbWl0dGVyIiwiRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJWZWN0b3IyUHJvcGVydHkiLCJBdG9tVHlwZSIsIlNPTUNvbnN0YW50cyIsInN0YXRlc09mTWF0dGVyIiwiTW90aW9uQXRvbSIsImNvbnN0cnVjdG9yIiwiaW5pdGlhbEF0b21UeXBlIiwiaW5pdGlhbFhQb3NpdGlvbiIsImluaXRpYWxZUG9zaXRpb24iLCJ0YW5kZW0iLCJhdG9tVHlwZVByb3BlcnR5IiwiY3JlYXRlVGFuZGVtIiwicGhldGlvUmVhZE9ubHkiLCJpbml0aWFsQXRvbUF0dHJpYnV0ZXMiLCJNQVBfQVRPTV9UWVBFX1RPX0FUVFJJQlVURVMiLCJnZXQiLCJyYWRpdXNQcm9wZXJ0eSIsInJhZGl1cyIsInVuaXRzIiwicG9zaXRpb25Qcm9wZXJ0eSIsInZlbG9jaXR5UHJvcGVydHkiLCJaRVJPIiwiYWNjZWxlcmF0aW9uUHJvcGVydHkiLCJjb25maWd1cmF0aW9uQ2hhbmdlZCIsIm1hc3MiLCJjb2xvciIsImVwc2lsb24iLCJsaW5rIiwiYXRvbVR5cGUiLCJhdG9tQXR0cmlidXRlcyIsInBoZXQiLCJqb2lzdCIsInNpbSIsImlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkiLCJ2YWx1ZSIsIkFESlVTVEFCTEUiLCJzZXQiLCJlbWl0Iiwic2V0UG9zaXRpb24iLCJ4IiwieSIsImdldFZ5Iiwic2V0VnkiLCJ2eSIsImdldFZ4Iiwic2V0VngiLCJ2eCIsImdldEF4IiwiZ2V0QXkiLCJzZXRBeCIsImF4Iiwic2V0QXkiLCJheSIsImdldFgiLCJnZXRZIiwiZ2V0VHlwZSIsInJlc2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNb3Rpb25BdG9tLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vdGlvbkF0b20gaXMgYSBtb2RlbCBvZiBhbiBhdG9tIHdpdGggQXhvbiBQcm9wZXJ0eSB2YWx1ZXMgdGhhdCB0cmFjayBwb3NpdGlvbiwgdmVsb2NpdHksIGFuZCBhY2NlbGVyYXRpb24sIGFzIHdlbGxcclxuICogYXMgb3RoZXIgYXR0cmlidXRlcyB0aGF0IG5lZWRlZCBieSB0aGUgQXRvbWljIEludGVyYWN0aW9ucyBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMlByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQXRvbVR5cGUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0F0b21UeXBlLmpzJztcclxuaW1wb3J0IFNPTUNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vU09NQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IHN0YXRlc09mTWF0dGVyIGZyb20gJy4uLy4uL3N0YXRlc09mTWF0dGVyLmpzJztcclxuXHJcbmNsYXNzIE1vdGlvbkF0b20ge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0F0b21UeXBlfSBpbml0aWFsQXRvbVR5cGUgLSBpbml0aWFsIHR5cGUsIGFrYSBlbGVtZW50LCBmb3IgdGhpcyBhdG9tXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluaXRpYWxYUG9zaXRpb24gLSB4IHBvc2l0aW9uIGluIHRoZSBtb2RlbCwgaW4gcGljb21ldGVyc1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbml0aWFsWVBvc2l0aW9uIC0geSBwb3NpdGlvbiBpbiB0aGUgbW9kZWwsIGluIHBpY29tZXRlcnNcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGluaXRpYWxBdG9tVHlwZSwgaW5pdGlhbFhQb3NpdGlvbiwgaW5pdGlhbFlQb3NpdGlvbiwgdGFuZGVtICkge1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtd3JpdGUpIHtFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eS48QXRvbVR5cGU+fSAtIHRoZSB0eXBlIG9mIGF0b20gYmVpbmcgbW9kZWxlZCwgZS5nLiBBcmdvbiwgTmVvbiwgZXRjLlxyXG4gICAgdGhpcy5hdG9tVHlwZVByb3BlcnR5ID0gbmV3IEVudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5KCBBdG9tVHlwZSwgaW5pdGlhbEF0b21UeXBlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2F0b21UeXBlUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gZ2V0IHRoZSBkZWZhdWx0IGF0dHJpYnV0ZXMgYXNzb2NpYXRlZCB3aXRoIHRoaXMgYXRvbVxyXG4gICAgY29uc3QgaW5pdGlhbEF0b21BdHRyaWJ1dGVzID0gU09NQ29uc3RhbnRzLk1BUF9BVE9NX1RZUEVfVE9fQVRUUklCVVRFUy5nZXQoIGluaXRpYWxBdG9tVHlwZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtd3JpdGUpIHtOdW1iZXJQcm9wZXJ0eX0gLSByYWRpdXMgb2YgdGhpcyBhdG9tLCBzaG91bGQgb25seSBiZSBjaGFuZ2VkIGZvciBhZGp1c3RhYmxlIGF0b21zXHJcbiAgICB0aGlzLnJhZGl1c1Byb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBpbml0aWFsQXRvbUF0dHJpYnV0ZXMucmFkaXVzLCB7XHJcbiAgICAgIHVuaXRzOiAncG0nLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyYWRpdXNQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWVcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSwgYWNjZXNzZWQgdGhyb3VnaCBnZXR0ZXIgYW5kIHNldHRlciBtZXRob2RzIGJlbG93LCBzZWUgdGhvc2UgbWV0aG9kcyBmb3IgZGV0YWlsc1xyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggbmV3IFZlY3RvcjIoIGluaXRpYWxYUG9zaXRpb24sIGluaXRpYWxZUG9zaXRpb24gKSwge1xyXG4gICAgICB1bml0czogJ3BtJyxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncG9zaXRpb25Qcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlLCBhY2Nlc3NlZCB0aHJvdWdoIHRoZSBnZXR0ZXIvc2V0dGVyIG1ldGhvZHMgYmVsb3dcclxuICAgIHRoaXMudmVsb2NpdHlQcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIFZlY3RvcjIuWkVSTywge1xyXG4gICAgICB1bml0czogJ3BtL3MnLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd2ZWxvY2l0eVByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUsIGFjY2Vzc2VkIHRocm91Z2ggdGhlIGdldHRlci9zZXR0ZXIgbWV0aG9kcyBiZWxvd1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb25Qcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIFZlY3RvcjIuWkVSTywge1xyXG4gICAgICB1bml0czogJ3BtL3NeMicsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2FjY2VsZXJhdGlvblByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bGlzdGVuLW9ubHl9IC0gQW4gZW1pdHRlciB0aGF0IGluZGljYXRlcyB0aGF0IHRoZSBjb25maWd1cmF0aW9uIG9mIHRoaXMgYXRvbSBoYXZlIGNoYW5nZWQsIGRvbmUgYXMgYW5cclxuICAgIC8vIGVtaXR0ZXIgc28gdGhhdCB0aGUgdmlldyBkb2Vzbid0IGhhdmUgdG8gc2VwYXJhdGVseSBtb25pdG9yIGEgc2V0IG9mIHByb3BlcnRpZXMgdGhhdCBhbGwgY2hhbmdlIGF0IG9uY2UuXHJcbiAgICB0aGlzLmNvbmZpZ3VyYXRpb25DaGFuZ2VkID0gbmV3IEVtaXR0ZXIoKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtyZWFkLW9ubHl9IC0gYXR0cmlidXRlcyBvZiB0aGUgYXRvbSwgY2hhbmdlZCBhcyB0aGUgYXRvbSB0eXBlIGNoYW5nZXNcclxuICAgIHRoaXMubWFzcyA9IDA7XHJcbiAgICB0aGlzLmNvbG9yID0gbnVsbDtcclxuICAgIHRoaXMuZXBzaWxvbiA9IDA7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBhdHRyaWJ1dGVzIGlmIGFuZCB3aGVuIHRoZSBhdG9tIHR5cGUgY2hhbmdlc1xyXG4gICAgdGhpcy5hdG9tVHlwZVByb3BlcnR5LmxpbmsoIGF0b21UeXBlID0+IHtcclxuICAgICAgY29uc3QgYXRvbUF0dHJpYnV0ZXMgPSBTT01Db25zdGFudHMuTUFQX0FUT01fVFlQRV9UT19BVFRSSUJVVEVTLmdldCggYXRvbVR5cGUgKTtcclxuICAgICAgdGhpcy5tYXNzID0gYXRvbUF0dHJpYnV0ZXMubWFzcztcclxuICAgICAgdGhpcy5jb2xvciA9IGF0b21BdHRyaWJ1dGVzLmNvbG9yO1xyXG5cclxuICAgICAgLy8gR2VuZXJhbGx5IHRoZSByYWRpdXMgaXMgc2V0IGhlcmUgdG9vLCBidXQgbm90IHdoZW4gdGhpcyBpcyBhbiBhZGp1c3RhYmxlIGF0b20gYW5kIHN0YXRlIGlzIGJlaW5nIHNldCB2aWFcclxuICAgICAgLy8gcGhldC1pbywgYmVjYXVzZSB0aGUgcmFkaXVzIG5lZWRzIHRvIGNvbWUgZnJvbSB0aGUgYXRvbSBkaWFtZXRlciBzZXR0aW5nLlxyXG4gICAgICBpZiAoICEoIHBoZXQuam9pc3Quc2ltLmlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkudmFsdWUgJiYgYXRvbVR5cGUgPT09IEF0b21UeXBlLkFESlVTVEFCTEUgKSApIHtcclxuICAgICAgICB0aGlzLnJhZGl1c1Byb3BlcnR5LnNldCggYXRvbUF0dHJpYnV0ZXMucmFkaXVzICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHNpZ25hbCB0aGF0IHRoZSBjb25maWd1cmF0aW9uIGhhcyBjaGFuZ2VkXHJcbiAgICAgIHRoaXMuY29uZmlndXJhdGlvbkNoYW5nZWQuZW1pdCgpO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gYXRvbSB4IHBvc2l0aW9uIGluIHBpY29tZXRlcnNcclxuICAgKiBAcGFyYW0ge251bWJlcn0geSAtIGF0b20geSBwb3NpdGlvbiBpbiBwaWNvbWV0ZXJzXHJcbiAgICovXHJcbiAgc2V0UG9zaXRpb24oIHgsIHkgKSB7XHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkuc2V0KCBuZXcgVmVjdG9yMiggeCwgeSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRWeSgpIHtcclxuICAgIHJldHVybiB0aGlzLnZlbG9jaXR5UHJvcGVydHkudmFsdWUueTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2eSAtIGF0b20gdmVsb2NpdHkgaW4geS1kaXJlY3Rpb25cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0VnkoIHZ5ICkge1xyXG4gICAgdGhpcy52ZWxvY2l0eVByb3BlcnR5LnNldCggbmV3IFZlY3RvcjIoIHRoaXMudmVsb2NpdHlQcm9wZXJ0eS52YWx1ZS54LCB2eSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRWeCgpIHtcclxuICAgIHJldHVybiB0aGlzLnZlbG9jaXR5UHJvcGVydHkudmFsdWUueDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2eCAtIGF0b20gdmVsb2NpdHkgaW4geC1kaXJlY3Rpb25cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0VngoIHZ4ICkge1xyXG4gICAgdGhpcy52ZWxvY2l0eVByb3BlcnR5LnNldCggbmV3IFZlY3RvcjIoIHZ4LCB0aGlzLnZlbG9jaXR5UHJvcGVydHkudmFsdWUueSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRBeCgpIHtcclxuICAgIHJldHVybiB0aGlzLmFjY2VsZXJhdGlvblByb3BlcnR5LnZhbHVlLng7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRBeSgpIHtcclxuICAgIHJldHVybiB0aGlzLmFjY2VsZXJhdGlvblByb3BlcnR5LnZhbHVlLnk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge251bWJlcn0gYXggLSBhdG9tIGFjY2VsZXJhdGlvbiBpbiB4LWRpcmVjdGlvblxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzZXRBeCggYXggKSB7XHJcbiAgICB0aGlzLmFjY2VsZXJhdGlvblByb3BlcnR5LnNldCggbmV3IFZlY3RvcjIoIGF4LCB0aGlzLmFjY2VsZXJhdGlvblByb3BlcnR5LnZhbHVlLnkgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGF5IC0gYXRvbSBhY2NlbGVyYXRpb24gaW4geS1kaXJlY3Rpb25cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0QXkoIGF5ICkge1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb25Qcm9wZXJ0eS5zZXQoIG5ldyBWZWN0b3IyKCB0aGlzLmFjY2VsZXJhdGlvblByb3BlcnR5LnZhbHVlLngsIGF5ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFgoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLng7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRZKCkge1xyXG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHJldHVybnMge0F0b21UeXBlfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRUeXBlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYXRvbVR5cGVQcm9wZXJ0eS52YWx1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMuYXRvbVR5cGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnZlbG9jaXR5UHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuICB9XHJcbn1cclxuXHJcbnN0YXRlc09mTWF0dGVyLnJlZ2lzdGVyKCAnTW90aW9uQXRvbScsIE1vdGlvbkF0b20gKTtcclxuZXhwb3J0IGRlZmF1bHQgTW90aW9uQXRvbTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sZ0NBQWdDO0FBQ3BELE9BQU9DLDZCQUE2QixNQUFNLHNEQUFzRDtBQUNoRyxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsZUFBZSxNQUFNLHVDQUF1QztBQUNuRSxPQUFPQyxRQUFRLE1BQU0sZ0NBQWdDO0FBQ3JELE9BQU9DLFlBQVksTUFBTSw4QkFBOEI7QUFDdkQsT0FBT0MsY0FBYyxNQUFNLHlCQUF5QjtBQUVwRCxNQUFNQyxVQUFVLENBQUM7RUFFZjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsZUFBZSxFQUFFQyxnQkFBZ0IsRUFBRUMsZ0JBQWdCLEVBQUVDLE1BQU0sRUFBRztJQUV6RTtJQUNBLElBQUksQ0FBQ0MsZ0JBQWdCLEdBQUcsSUFBSWIsNkJBQTZCLENBQUVJLFFBQVEsRUFBRUssZUFBZSxFQUFFO01BQ3BGRyxNQUFNLEVBQUVBLE1BQU0sQ0FBQ0UsWUFBWSxDQUFFLGtCQUFtQixDQUFDO01BQ2pEQyxjQUFjLEVBQUU7SUFDbEIsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsTUFBTUMscUJBQXFCLEdBQUdYLFlBQVksQ0FBQ1ksMkJBQTJCLENBQUNDLEdBQUcsQ0FBRVQsZUFBZ0IsQ0FBQzs7SUFFN0Y7SUFDQSxJQUFJLENBQUNVLGNBQWMsR0FBRyxJQUFJbEIsY0FBYyxDQUFFZSxxQkFBcUIsQ0FBQ0ksTUFBTSxFQUFFO01BQ3RFQyxLQUFLLEVBQUUsSUFBSTtNQUNYVCxNQUFNLEVBQUVBLE1BQU0sQ0FBQ0UsWUFBWSxDQUFFLGdCQUFpQixDQUFDO01BQy9DQyxjQUFjLEVBQUU7SUFDbEIsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsSUFB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