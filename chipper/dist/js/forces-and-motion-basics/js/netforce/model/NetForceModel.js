// Copyright 2013-2022, University of Colorado Boulder

/**
 * Model for the Net Force screen, in which Pullers can pull on a rope with different forces.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import VoidIO from '../../../../tandem/js/types/VoidIO.js';
import forcesAndMotionBasics from '../../forcesAndMotionBasics.js';
import Cart from './Cart.js';
import Knot from './Knot.js';
import Puller from './Puller.js';

// constants
// puller game will extend to +/- this value - when the cart wheel hits this length, the game is over
const GAME_LENGTH = 458;

// spacing for the knots
const KNOT_SPACING = 80;
const BLUE_KNOT_OFFSET = 62;
const RED_KNOT_OFFSET = 680;
class NetForceModel extends PhetioObject {
  /**
   * Constructor for the net force model.
   *
   * @param {Tandem} tandem
   */
  constructor(tandem) {
    super({
      tandem: tandem,
      phetioType: NetForceModel.NetForceModelIO,
      phetioState: false
    });
    this.startedProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('startedProperty')
    });
    this.runningProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('runningProperty')
    });
    this.numberPullersAttachedProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('numberPullersAttachedProperty'),
      range: new Range(0, 8)
    });

    // TODO what are the valid values?
    // TODO: Why not an enum?
    this.stateProperty = new StringProperty('experimenting', {
      tandem: tandem.createTandem('stateProperty')
    });
    this.timeProperty = new Property(0, {
      // TODO: Removed this property for phet-io spam
      // tandem: tandem.createTandem( 'timeProperty' )
      // phetioValueType: NumberIO,
      // units: 'seconds'
    });
    this.netForceProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('netForceProperty'),
      units: 'N',
      range: new Range(-350, 350)
    });
    this.leftForceProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('leftForceProperty'),
      units: 'N',
      range: new Range(-350, 0)
    });
    this.rightForceProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('rightForceProperty'),
      units: 'N',
      range: new Range(0, 350)
    });
    this.speedProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('speedProperty'),
      units: 'm/s',
      range: new Range(0, 6)
    });
    this.durationProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('durationProperty'),
      units: 's',
      range: new Range(0, Number.POSITIVE_INFINITY)
    });

    // User settings
    this.showSumOfForcesProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('showSumOfForcesProperty')
    });
    this.showValuesProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('showValuesProperty')
    });
    this.showSpeedProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('showSpeedProperty')
    });
    this.volumeOnProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('volumeOnProperty')
    });
    this.cartReturnedEmitter = new Emitter();
    this.resetAllEmitter = new Emitter();
    this.cart = new Cart(tandem.createTandem('cart'));

    //Create a knot given a color and index (0-3)
    const createKnot = (color, index, tandem) => {
      const xPosition = (color === 'blue' ? BLUE_KNOT_OFFSET : RED_KNOT_OFFSET) + index * KNOT_SPACING;
      return new Knot(xPosition, color, BLUE_KNOT_OFFSET, this.getRopeLength(), {
        tandem: tandem
      });
    };

    // Create the knots
    // To support PhET-iO, the knots should be created before the pullers.
    // This allows the pullers to be attached to the knots using the PhET-iO API
    this.knots = [createKnot('blue', 0, tandem.createTandem('blueKnot0')), createKnot('blue', 1, tandem.createTandem('blueKnot1')), createKnot('blue', 2, tandem.createTandem('blueKnot2')), createKnot('blue', 3, tandem.createTandem('blueKnot3')), createKnot('red', 0, tandem.createTandem('redKnot0')), createKnot('red', 1, tandem.createTandem('redKnot1')), createKnot('red', 2, tandem.createTandem('redKnot2')), createKnot('red', 3, tandem.createTandem('redKnot3'))];

    // create the pullers
    const bigPullerY = 473;
    const mediumPullerY = 426;
    const smallPullerY = 394;
    this.pullers = [new Puller(208, bigPullerY, 'blue', 'small', 10, tandem.createTandem('smallBluePuller1')), new Puller(278, bigPullerY, 'blue', 'small', 10, tandem.createTandem('smallBluePuller2'), {
      other: 'other'
    }), new Puller(127, mediumPullerY, 'blue', 'medium', 50, tandem.createTandem('mediumBluePuller'), {
      standOffsetX: -5
    }), new Puller(38, smallPullerY, 'blue', 'large', 70, tandem.createTandem('largeBluePuller'), {
      standOffsetX: -18
    }), new Puller(648, bigPullerY, 'red', 'small', 10, tandem.createTandem('smallRedPuller1')), new Puller(717, bigPullerY, 'red', 'small', 10, tandem.createTandem('smallRedPuller2'), {
      other: 'other'
    }), new Puller(789, mediumPullerY, 'red', 'medium', 20, tandem.createTandem('mediumRedPuller')), new Puller(860, smallPullerY, 'red', 'large', 30, tandem.createTandem('largeRedPuller'))];

    // When any puller is dragged or moved with phet-io, update the closest knots to be visible
    // and change the numberPullersAttached
    this.pullers.forEach(puller => {
      puller.positionProperty.link(this.updateVisibleKnots.bind(this));
      puller.draggedEmitter.addListener(() => {
        this.numberPullersAttachedProperty.set(this.countAttachedPullers());
      });
      puller.droppedEmitter.addListener(() => {
        const knot = this.getTargetKnot(puller);
        this.movePullerToKnot(puller, knot);
      });
      puller.knotProperty.link(() => {
        this.numberPullersAttachedProperty.set(this.countAttachedPullers());
      });
    });

    //Update the started flag
    this.runningProperty.link(running => {
      if (running) {
        this.startedProperty.set(true);
      }
    });

    //Update the forces when the number of attached pullers changes
    this.numberPullersAttachedProperty.link(() => {
      this.netForceProperty.set(this.getNetForce());
    });
    this.numberPullersAttachedProperty.link(() => {
      this.leftForceProperty.set(this.getLeftForce());
    });
    this.numberPullersAttachedProperty.link(() => {
      this.rightForceProperty.set(this.getRightForce());
    });
  }

  /**
   * Move a puller to a knot.  If no knot is specified, puller is moved to its original position in the Puller
   * toolbox.
   *
   * @param {Puller} puller
   * @param {Knot} [knot] - optional knot where the puller should be moved.
   * @public
   */
  movePullerToKnot(puller, knot) {
    //try to snap to a knot
    if (knot) {
      puller.positionProperty.set(new Vector2(knot.xProperty.get(), knot.y));
      puller.knotProperty.set(knot);
    }

    //Or go back home
    else {
      puller.positionProperty.reset();
    }

    //Keep track of their position to change the attach/detach thresholds, see NetForceModel.getTargetKnot
    const newPosition = knot ? 'knot' : 'home';
    puller.lastPlacementProperty.set(newPosition);
  }

  /**
   * Shift the puller to the left.
   *
   * @param  {Puller} puller [description]
   * @public
   */
  shiftPullerLeft(puller) {
    this.shiftPuller(puller, 0, 4, -1);
  }

  /**
   * Shift a puller to the right.
   *
   * @param  {Puller} puller
   * @public
   */
  shiftPullerRight(puller) {
    this.shiftPuller(puller, 3, 7, 1);
  }

  /**
   * Shift a puller by some delta, restricted by the desired bounds
   * @param  {Puller} puller
   * @param  {number} leftBoundIndex
   * @param  {number} rightBoundIndex
   * @param  {number} delta
   * @public
   */
  shiftPuller(puller, leftBoundIndex, rightBoundIndex, delta) {
    if (puller.knotProperty.get()) {
      const currentIndex = this.knots.indexOf(puller.knotProperty.get());
      if (currentIndex !== leftBoundIndex && currentIndex !== rightBoundIndex) {
        const nextIndex = currentIndex + delta;
        const currentKnot = this.knots[currentIndex];
        const nextKnot = this.knots[nextIndex];
        const otherPuller = this.getPuller(nextKnot);
        puller.setValues({
          position: new Vector2(nextKnot.xProperty.get(), nextKnot.y),
          knot: nextKnot
        });
        otherPuller && otherPuller.setValues({
          position: new Vector2(currentKnot.xProperty.get(), currentKnot.y),
          knot: currentKnot
        });
      }
    }
  }

  // @public - Count the number of pullers attached to the rope
  countAttachedPullers() {
    let count = 0;
    for (let i = 0; i < this.pullers.length; i++) {
      if (this.pullers[i].knotProperty.get()) {
        count++;
      }
    }
    return count;
  }

  // @public - Change knot visibility (halo highlight) when the pullers are dragged
  updateVisibleKnots() {
    this.knots.forEach(knot => {
      knot.visibleProperty.set(false);
    });
    this.pullers.forEach(puller => {
      if (puller.draggingProperty.get()) {
        const knot = this.getTargetKnot(puller);
        if (knot) {
          knot.visibleProperty.set(true);
        }
      }
    });
  }

  /**
   * Gets the puller attached to a knot, or null if none attached to that knot.
   *
   * @param  {Knot} knot
   * @public
   */
  getPuller(knot) {
    const find = _.find(this.pullers, puller => puller.knotProperty.get() === knot);
    return typeof find !== 'undefined' ? find : null;
  }

  /**
   * Given a puller, returns a function that computes the distance between that puller and any knot.
   *
   * @param  {Puller} puller
   * @returns {function}
   * @public
   */
  getKnotPullerDistance(puller) {
    // the blue pullers face to the right, so add a small correction so the distance feels more 'natural' when
    // placing the blue pullers
    const dx = puller.type === 'red' ? 0 : -40;
    return knot => Math.sqrt(Math.pow(knot.xProperty.get() - puller.positionProperty.get().x + dx, 2) + Math.pow(knot.y - puller.positionProperty.get().y, 2));
  }

  /**
   * Gets the closest unoccupied knot to the given puller, which is being dragged.
   *
   * @param  {Puller} puller [description]
   * @returns {Knot}
   * @public
   */
  getClosestOpenKnot(puller) {
    const filter = this.knots.filter(knot => knot.type === puller.type && this.getPuller(knot) === null);
    return _.minBy(filter, this.getKnotPullerDistance(puller));
  }

  /**
   * Gets the closest unoccupied knot to the given puller, which is being dragged.
   *
   * @param  {Puller} puller
   * @returns {Knot}
   * @public
   */
  getClosestOpenKnotFromCart(puller) {
    let idx = puller.type === 'red' ? 4 : 3;
    const delta = puller.type === 'red' ? 1 : -1;
    while (this.getPuller(this.knots[idx]) !== null) {
      idx += delta;
    }
    return this.knots[idx];
  }

  /**
   * Gets the closest unoccupied knot to the given puller if it is close enough to grab.
   * @param  {Puller} puller
   * @returns {Knot}
   * @public
   */
  getTargetKnot(puller) {
    const target = this.getClosestOpenKnot(puller);
    const distanceToTarget = this.getKnotPullerDistance(puller)(target);

    //Only accept a target knot if the puller's head is close enough to the knot
    const threshold = puller.lastPlacementProperty.get() === 'home' ? 370 : 300;
    return distanceToTarget < 220 && puller.positionProperty.get().y < threshold ? target : null;
  }

  // @public - Return the cart and prepare the model for another "go" run
  returnCart() {
    this.cart.reset();
    this.knots.forEach(knot => {
      knot.reset();
    });
    this.runningProperty.set(false);
    this.stateProperty.set('experimenting');

    // broadcast a message that the cart was returned
    this.cartReturnedEmitter.emit();
    this.startedProperty.set(false);
    this.durationProperty.set(0); // Reset tug-of-war timer
    this.speedProperty.reset();
  }

  // @public - Reset the entire model when "reset all" is pressed
  reset() {
    // reset all Properties associated with this model
    this.startedProperty.reset();
    this.runningProperty.reset();
    this.numberPullersAttachedProperty.reset();
    this.stateProperty.reset();
    this.timeProperty.reset();
    this.netForceProperty.reset();
    this.leftForceProperty.reset();
    this.rightForceProperty.reset();
    this.speedProperty.reset();
    this.durationProperty.reset();
    this.showSumOfForcesProperty.reset();
    this.showValuesProperty.reset();
    this.showSpeedProperty.reset();
    this.volumeOnProperty.reset();

    //Unset the knots before calling reset since the change of the number of attached pullers causes the force arrows to update
    this.pullers.forEach(puller => {
      puller.disconnect();
    });
    this.cart.reset();
    this.pullers.forEach(puller => {
      // if the puller is being dragged, we will need to cancel the drag in PullerNode
      if (!puller.draggingProperty.get()) {
        puller.reset();
      }
    });
    this.knots.forEach(knot => {
      knot.reset();
    });

    // notify that the model was reset
    this.resetAllEmitter.emit();
  }

  /**
   * The length of the rope is the spacing between knots times the number of knots plus the difference between
   * the red and blue starting offsets.
   *
   * @returns {number}
   * @public
   */
  getRopeLength() {
    return 6 * KNOT_SPACING + RED_KNOT_OFFSET - (BLUE_KNOT_OFFSET + 3 * KNOT_SPACING);
  }

  /**
   * Update the physics when the clock ticks
   *
   * @param {number} dt
   * @public
   */
  step(dt) {
    if (this.runningProperty.get()) {
      // Increment tug-of-war timer
      this.durationProperty.set(this.durationProperty.get() + dt);

      // Make the simulation run about as fast as the Java version
      const newV = this.cart.vProperty.get() + this.getNetForce() * dt * 0.003;
      this.speedProperty.set(Math.abs(newV));

      // calculate new position from velocity
      const newX = this.cart.xProperty.get() + newV * dt * 60.0;

      //If the cart made it to the end, then stop and signify completion
      const gameLength = GAME_LENGTH - this.cart.widthToWheel;
      if (newX > gameLength || newX < -gameLength) {
        this.runningProperty.set(false);
        this.stateProperty.set('completed');

        // zero out the velocity
        this.speedProperty.set(0);

        // set cart and pullers back the to max position
        const maxLength = newX > gameLength ? gameLength : -gameLength;
        this.updateCartAndPullers(this.speedProperty.get(), maxLength);
      } else {
        // if the game isn't over yet, update cart and puller
        this.updateCartAndPullers(newV, newX);
      }
    }
    this.timeProperty.set(this.timeProperty.get() + dt);
  }

  /**
   * Update the velocity and position of the cart and the pullers.
   *
   * @private
   * @param  {number} newV
   * @param  {number} newX
   */
  updateCartAndPullers(newV, newX) {
    // move the cart, and update its velocity
    this.cart.vProperty.set(newV);
    this.cart.xProperty.set(newX);

    // move the knots and the pullers on those knots
    this.knots.forEach(knot => {
      knot.xProperty.set(knot.initX + newX);
    });
  }

  // @public - Gets the net force on the cart, applied by both left and right pullers
  getNetForce() {
    return this.getLeftForce() + this.getRightForce();
  }

  /**
   * Get an array of pullers of the specified type (color string)
   * @param  {string} type - one of 'red' or 'blue'
   * @returns {Array.<Puller>}
   * @public
   */
  getPullers(type) {
    return _.filter(this.pullers, p => p.type === type && p.knotProperty.get());
  }

  /**
   * Function for internal use that helps to sum forces in _.reduce, see getLeftForce, getRightForce
   *
   * @param  {string} memo
   * @param  {Puller} puller
   * @returns {string}
   * @public
   */
  sumForces(memo, puller) {
    return memo + puller.force;
  }

  // @public - Gets the left force on the cart, applied by left and pullers
  getLeftForce() {
    return -_.reduce(this.getPullers('blue'), this.sumForces, 0);
  }

  // @public - Gets the right force on the cart, applied by right pullers
  getRightForce() {
    return _.reduce(this.getPullers('red'), this.sumForces, 0);
  }

  /**
   * Gets the closest unoccupied knot to the given puller, which is being dragged.
   * @param  {Puller} puller
   * @param  {number} delta
   * @returns {Knot}
   * @public
   */
  getClosestOpenKnotInDirection(puller, delta) {
    const isInRightDirection = (sourceKnot, destinationKnot, delta) => {
      assert && assert(delta < 0 || delta > 0);
      return delta < 0 ? destinationKnot.xProperty.get() < sourceKnot.xProperty.get() : delta > 0 ? destinationKnot.xProperty.get() > sourceKnot.xProperty.get() : 'error';
    };
    const filter = this.knots.filter(knot => knot.type === puller.type && this.getPuller(knot) === null && isInRightDirection(puller.knotProperty.get(), knot, delta));
    let result = _.minBy(filter, this.getKnotPullerDistance(puller));
    if (result === Infinity || result === -Infinity) {
      result = null;
    }
    return result;
  }

  /**
   * Get the next open knot in a given direction.  Very similar to the function above, but with a resultant knot
   * is a function of the distance to the next knot, not of the distance to the puller.  This is necessary because
   * when dragging, the puller does not yet have an associated knot.
   *
   * @param {Knot} sourceKnot
   * @param {Puller} puller
   * @param {number} delta
   * @public
   */
  getNextOpenKnotInDirection(sourceKnot, puller, delta) {
    const isInRightDirection = (destinationKnot, delta) => {
      assert && assert(delta < 0 || delta > 0);
      return delta < 0 ? destinationKnot.xProperty.get() < sourceKnot.xProperty.get() : delta > 0 ? destinationKnot.xProperty.get() > sourceKnot.xProperty.get() : 'error';
    };
    const filter = this.knots.filter(knot => knot.type === puller.type && this.getPuller(knot) === null && isInRightDirection(knot, delta));
    let result = _.minBy(filter, knot => Math.abs(sourceKnot.xProperty.get() - knot.xProperty.get()));

    // we have reached the end of the knots.  Return either the first or last knot to loop the choice.
    if (result === Infinity || result === -Infinity) {
      result = null;
    }
    return result;
  }

  /**
   * For phet-io, describe what pullers are on what knots
   * @public
   */
  getKnotDescription() {
    return this.pullers.map(puller => ({
      id: puller.pullerTandem.phetioID,
      // TODO: addInstance for Puller
      knot: puller.knotProperty.get() && puller.knotProperty.get().phetioID
    }));
  }

  /**
   * Move a puller to an adjacent open knot in a direction specified by delta.
   *
   * @param {Puller} puller
   * @param {number} delta
   * @public
   */
  movePullerToAdjacentOpenKnot(puller, delta) {
    const closestOpenKnot = this.getClosestOpenKnotInDirection(puller, delta);
    if (closestOpenKnot) {
      this.movePullerToKnot(puller, closestOpenKnot);
    }
  }
}

// @static @public
NetForceModel.GAME_LENGTH = GAME_LENGTH;
forcesAndMotionBasics.register('NetForceModel', NetForceModel);
NetForceModel.NetForceModelIO = new IOType('NetForceModelIO', {
  valueType: NetForceModel,
  methods: {
    reset: {
      returnType: VoidIO,
      parameterTypes: [],
      implementation: () => this.reset(),
      documentation: 'Resets the model',
      invocableForReadOnlyElements: false
    }
  }
});
export default NetForceModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbWl0dGVyIiwiTnVtYmVyUHJvcGVydHkiLCJQcm9wZXJ0eSIsIlN0cmluZ1Byb3BlcnR5IiwiUmFuZ2UiLCJWZWN0b3IyIiwiUGhldGlvT2JqZWN0IiwiSU9UeXBlIiwiVm9pZElPIiwiZm9yY2VzQW5kTW90aW9uQmFzaWNzIiwiQ2FydCIsIktub3QiLCJQdWxsZXIiLCJHQU1FX0xFTkdUSCIsIktOT1RfU1BBQ0lORyIsIkJMVUVfS05PVF9PRkZTRVQiLCJSRURfS05PVF9PRkZTRVQiLCJOZXRGb3JjZU1vZGVsIiwiY29uc3RydWN0b3IiLCJ0YW5kZW0iLCJwaGV0aW9UeXBlIiwiTmV0Rm9yY2VNb2RlbElPIiwicGhldGlvU3RhdGUiLCJzdGFydGVkUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJydW5uaW5nUHJvcGVydHkiLCJudW1iZXJQdWxsZXJzQXR0YWNoZWRQcm9wZXJ0eSIsInJhbmdlIiwic3RhdGVQcm9wZXJ0eSIsInRpbWVQcm9wZXJ0eSIsIm5ldEZvcmNlUHJvcGVydHkiLCJ1bml0cyIsImxlZnRGb3JjZVByb3BlcnR5IiwicmlnaHRGb3JjZVByb3BlcnR5Iiwic3BlZWRQcm9wZXJ0eSIsImR1cmF0aW9uUHJvcGVydHkiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsInNob3dTdW1PZkZvcmNlc1Byb3BlcnR5Iiwic2hvd1ZhbHVlc1Byb3BlcnR5Iiwic2hvd1NwZWVkUHJvcGVydHkiLCJ2b2x1bWVPblByb3BlcnR5IiwiY2FydFJldHVybmVkRW1pdHRlciIsInJlc2V0QWxsRW1pdHRlciIsImNhcnQiLCJjcmVhdGVLbm90IiwiY29sb3IiLCJpbmRleCIsInhQb3NpdGlvbiIsImdldFJvcGVMZW5ndGgiLCJrbm90cyIsImJpZ1B1bGxlclkiLCJtZWRpdW1QdWxsZXJZIiwic21hbGxQdWxsZXJZIiwicHVsbGVycyIsIm90aGVyIiwic3RhbmRPZmZzZXRYIiwiZm9yRWFjaCIsInB1bGxlciIsInBvc2l0aW9uUHJvcGVydHkiLCJsaW5rIiwidXBkYXRlVmlzaWJsZUtub3RzIiwiYmluZCIsImRyYWdnZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJzZXQiLCJjb3VudEF0dGFjaGVkUHVsbGVycyIsImRyb3BwZWRFbWl0dGVyIiwia25vdCIsImdldFRhcmdldEtub3QiLCJtb3ZlUHVsbGVyVG9Lbm90Iiwia25vdFByb3BlcnR5IiwicnVubmluZyIsImdldE5ldEZvcmNlIiwiZ2V0TGVmdEZvcmNlIiwiZ2V0UmlnaHRGb3JjZSIsInhQcm9wZXJ0eSIsImdldCIsInkiLCJyZXNldCIsIm5ld1Bvc2l0aW9uIiwibGFzdFBsYWNlbWVudFByb3BlcnR5Iiwic2hpZnRQdWxsZXJMZWZ0Iiwic2hpZnRQdWxsZXIiLCJzaGlmdFB1bGxlclJpZ2h0IiwibGVmdEJvdW5kSW5kZXgiLCJyaWdodEJvdW5kSW5kZXgiLCJkZWx0YSIsImN1cnJlbnRJbmRleCIsImluZGV4T2YiLCJuZXh0SW5kZXgiLCJjdXJyZW50S25vdCIsIm5leHRLbm90Iiwib3RoZXJQdWxsZXIiLCJnZXRQdWxsZXIiLCJzZXRWYWx1ZXMiLCJwb3NpdGlvbiIsImNvdW50IiwiaSIsImxlbmd0aCIsInZpc2libGVQcm9wZXJ0eSIsImRyYWdnaW5nUHJvcGVydHkiLCJmaW5kIiwiXyIsImdldEtub3RQdWxsZXJEaXN0YW5jZSIsImR4IiwidHlwZSIsIk1hdGgiLCJzcXJ0IiwicG93IiwieCIsImdldENsb3Nlc3RPcGVuS25vdCIsImZpbHRlciIsIm1pbkJ5IiwiZ2V0Q2xvc2VzdE9wZW5Lbm90RnJvbUNhcnQiLCJpZHgiLCJ0YXJnZXQiLCJkaXN0YW5jZVRvVGFyZ2V0IiwidGhyZXNob2xkIiwicmV0dXJuQ2FydCIsImVtaXQiLCJkaXNjb25uZWN0Iiwic3RlcCIsImR0IiwibmV3ViIsInZQcm9wZXJ0eSIsImFicyIsIm5ld1giLCJnYW1lTGVuZ3RoIiwid2lkdGhUb1doZWVsIiwibWF4TGVuZ3RoIiwidXBkYXRlQ2FydEFuZFB1bGxlcnMiLCJpbml0WCIsImdldFB1bGxlcnMiLCJwIiwic3VtRm9yY2VzIiwibWVtbyIsImZvcmNlIiwicmVkdWNlIiwiZ2V0Q2xvc2VzdE9wZW5Lbm90SW5EaXJlY3Rpb24iLCJpc0luUmlnaHREaXJlY3Rpb24iLCJzb3VyY2VLbm90IiwiZGVzdGluYXRpb25Lbm90IiwiYXNzZXJ0IiwicmVzdWx0IiwiSW5maW5pdHkiLCJnZXROZXh0T3Blbktub3RJbkRpcmVjdGlvbiIsImdldEtub3REZXNjcmlwdGlvbiIsIm1hcCIsImlkIiwicHVsbGVyVGFuZGVtIiwicGhldGlvSUQiLCJtb3ZlUHVsbGVyVG9BZGphY2VudE9wZW5Lbm90IiwiY2xvc2VzdE9wZW5Lbm90IiwicmVnaXN0ZXIiLCJ2YWx1ZVR5cGUiLCJtZXRob2RzIiwicmV0dXJuVHlwZSIsInBhcmFtZXRlclR5cGVzIiwiaW1wbGVtZW50YXRpb24iLCJkb2N1bWVudGF0aW9uIiwiaW52b2NhYmxlRm9yUmVhZE9ubHlFbGVtZW50cyJdLCJzb3VyY2VzIjpbIk5ldEZvcmNlTW9kZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTW9kZWwgZm9yIHRoZSBOZXQgRm9yY2Ugc2NyZWVuLCBpbiB3aGljaCBQdWxsZXJzIGNhbiBwdWxsIG9uIGEgcm9wZSB3aXRoIGRpZmZlcmVudCBmb3JjZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU3RyaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9TdHJpbmdQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBQaGV0aW9PYmplY3QgZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XHJcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XHJcbmltcG9ydCBWb2lkSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1ZvaWRJTy5qcyc7XHJcbmltcG9ydCBmb3JjZXNBbmRNb3Rpb25CYXNpY3MgZnJvbSAnLi4vLi4vZm9yY2VzQW5kTW90aW9uQmFzaWNzLmpzJztcclxuaW1wb3J0IENhcnQgZnJvbSAnLi9DYXJ0LmpzJztcclxuaW1wb3J0IEtub3QgZnJvbSAnLi9Lbm90LmpzJztcclxuaW1wb3J0IFB1bGxlciBmcm9tICcuL1B1bGxlci5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuLy8gcHVsbGVyIGdhbWUgd2lsbCBleHRlbmQgdG8gKy8tIHRoaXMgdmFsdWUgLSB3aGVuIHRoZSBjYXJ0IHdoZWVsIGhpdHMgdGhpcyBsZW5ndGgsIHRoZSBnYW1lIGlzIG92ZXJcclxuY29uc3QgR0FNRV9MRU5HVEggPSA0NTg7XHJcblxyXG4vLyBzcGFjaW5nIGZvciB0aGUga25vdHNcclxuY29uc3QgS05PVF9TUEFDSU5HID0gODA7XHJcbmNvbnN0IEJMVUVfS05PVF9PRkZTRVQgPSA2MjtcclxuY29uc3QgUkVEX0tOT1RfT0ZGU0VUID0gNjgwO1xyXG5cclxuY2xhc3MgTmV0Rm9yY2VNb2RlbCBleHRlbmRzIFBoZXRpb09iamVjdCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdG9yIGZvciB0aGUgbmV0IGZvcmNlIG1vZGVsLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB0YW5kZW0gKSB7XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0sXHJcbiAgICAgIHBoZXRpb1R5cGU6IE5ldEZvcmNlTW9kZWwuTmV0Rm9yY2VNb2RlbElPLFxyXG4gICAgICBwaGV0aW9TdGF0ZTogZmFsc2VcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnN0YXJ0ZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N0YXJ0ZWRQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMucnVubmluZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncnVubmluZ1Byb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5udW1iZXJQdWxsZXJzQXR0YWNoZWRQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdudW1iZXJQdWxsZXJzQXR0YWNoZWRQcm9wZXJ0eScgKSxcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgOCApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVE9ETyB3aGF0IGFyZSB0aGUgdmFsaWQgdmFsdWVzP1xyXG4gICAgLy8gVE9ETzogV2h5IG5vdCBhbiBlbnVtP1xyXG4gICAgdGhpcy5zdGF0ZVByb3BlcnR5ID0gbmV3IFN0cmluZ1Byb3BlcnR5KCAnZXhwZXJpbWVudGluZycsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3RhdGVQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMudGltZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAwLCB7XHJcbiAgICAgIC8vIFRPRE86IFJlbW92ZWQgdGhpcyBwcm9wZXJ0eSBmb3IgcGhldC1pbyBzcGFtXHJcbiAgICAgIC8vIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RpbWVQcm9wZXJ0eScgKVxyXG4gICAgICAvLyBwaGV0aW9WYWx1ZVR5cGU6IE51bWJlcklPLFxyXG4gICAgICAvLyB1bml0czogJ3NlY29uZHMnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5uZXRGb3JjZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ25ldEZvcmNlUHJvcGVydHknICksXHJcbiAgICAgIHVuaXRzOiAnTicsXHJcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIC0zNTAsIDM1MCApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5sZWZ0Rm9yY2VQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdsZWZ0Rm9yY2VQcm9wZXJ0eScgKSxcclxuICAgICAgdW5pdHM6ICdOJyxcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggLTM1MCwgMCApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5yaWdodEZvcmNlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmlnaHRGb3JjZVByb3BlcnR5JyApLFxyXG4gICAgICB1bml0czogJ04nLFxyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAwLCAzNTAgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuc3BlZWRQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzcGVlZFByb3BlcnR5JyApLFxyXG4gICAgICB1bml0czogJ20vcycsXHJcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAsIDYgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuZHVyYXRpb25Qcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdkdXJhdGlvblByb3BlcnR5JyApLFxyXG4gICAgICB1bml0czogJ3MnLFxyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAwLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFVzZXIgc2V0dGluZ3NcclxuICAgIHRoaXMuc2hvd1N1bU9mRm9yY2VzUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzaG93U3VtT2ZGb3JjZXNQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5zaG93VmFsdWVzUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzaG93VmFsdWVzUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuc2hvd1NwZWVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzaG93U3BlZWRQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy52b2x1bWVPblByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndm9sdW1lT25Qcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuY2FydFJldHVybmVkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgICB0aGlzLnJlc2V0QWxsRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gICAgdGhpcy5jYXJ0ID0gbmV3IENhcnQoIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjYXJ0JyApICk7XHJcblxyXG4gICAgLy9DcmVhdGUgYSBrbm90IGdpdmVuIGEgY29sb3IgYW5kIGluZGV4ICgwLTMpXHJcbiAgICBjb25zdCBjcmVhdGVLbm90ID0gKCBjb2xvciwgaW5kZXgsIHRhbmRlbSApID0+IHtcclxuICAgICAgY29uc3QgeFBvc2l0aW9uID0gKCBjb2xvciA9PT0gJ2JsdWUnID8gQkxVRV9LTk9UX09GRlNFVCA6IFJFRF9LTk9UX09GRlNFVCApICsgaW5kZXggKiBLTk9UX1NQQUNJTkc7XHJcbiAgICAgIHJldHVybiBuZXcgS25vdCggeFBvc2l0aW9uLCBjb2xvciwgQkxVRV9LTk9UX09GRlNFVCwgdGhpcy5nZXRSb3BlTGVuZ3RoKCksIHsgdGFuZGVtOiB0YW5kZW0gfSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGtub3RzXHJcbiAgICAvLyBUbyBzdXBwb3J0IFBoRVQtaU8sIHRoZSBrbm90cyBzaG91bGQgYmUgY3JlYXRlZCBiZWZvcmUgdGhlIHB1bGxlcnMuXHJcbiAgICAvLyBUaGlzIGFsbG93cyB0aGUgcHVsbGVycyB0byBiZSBhdHRhY2hlZCB0byB0aGUga25vdHMgdXNpbmcgdGhlIFBoRVQtaU8gQVBJXHJcbiAgICB0aGlzLmtub3RzID0gW1xyXG4gICAgICBjcmVhdGVLbm90KCAnYmx1ZScsIDAsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdibHVlS25vdDAnICkgKSxcclxuICAgICAgY3JlYXRlS25vdCggJ2JsdWUnLCAxLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYmx1ZUtub3QxJyApICksXHJcbiAgICAgIGNyZWF0ZUtub3QoICdibHVlJywgMiwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2JsdWVLbm90MicgKSApLFxyXG4gICAgICBjcmVhdGVLbm90KCAnYmx1ZScsIDMsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdibHVlS25vdDMnICkgKSxcclxuICAgICAgY3JlYXRlS25vdCggJ3JlZCcsIDAsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZWRLbm90MCcgKSApLFxyXG4gICAgICBjcmVhdGVLbm90KCAncmVkJywgMSwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3JlZEtub3QxJyApICksXHJcbiAgICAgIGNyZWF0ZUtub3QoICdyZWQnLCAyLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmVkS25vdDInICkgKSxcclxuICAgICAgY3JlYXRlS25vdCggJ3JlZCcsIDMsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZWRLbm90MycgKSApXHJcbiAgICBdO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgcHVsbGVyc1xyXG4gICAgY29uc3QgYmlnUHVsbGVyWSA9IDQ3MztcclxuICAgIGNvbnN0IG1lZGl1bVB1bGxlclkgPSA0MjY7XHJcbiAgICBjb25zdCBzbWFsbFB1bGxlclkgPSAzOTQ7XHJcblxyXG4gICAgdGhpcy5wdWxsZXJzID0gW1xyXG4gICAgICBuZXcgUHVsbGVyKCAyMDgsIGJpZ1B1bGxlclksICdibHVlJywgJ3NtYWxsJywgMTAsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzbWFsbEJsdWVQdWxsZXIxJyApICksXHJcbiAgICAgIG5ldyBQdWxsZXIoIDI3OCwgYmlnUHVsbGVyWSwgJ2JsdWUnLCAnc21hbGwnLCAxMCwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NtYWxsQmx1ZVB1bGxlcjInICksIHsgb3RoZXI6ICdvdGhlcicgfSApLFxyXG4gICAgICBuZXcgUHVsbGVyKCAxMjcsIG1lZGl1bVB1bGxlclksICdibHVlJywgJ21lZGl1bScsIDUwLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbWVkaXVtQmx1ZVB1bGxlcicgKSwgeyBzdGFuZE9mZnNldFg6IC01IH0gKSxcclxuICAgICAgbmV3IFB1bGxlciggMzgsIHNtYWxsUHVsbGVyWSwgJ2JsdWUnLCAnbGFyZ2UnLCA3MCwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xhcmdlQmx1ZVB1bGxlcicgKSwgeyBzdGFuZE9mZnNldFg6IC0xOCB9ICksXHJcbiAgICAgIG5ldyBQdWxsZXIoIDY0OCwgYmlnUHVsbGVyWSwgJ3JlZCcsICdzbWFsbCcsIDEwLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc21hbGxSZWRQdWxsZXIxJyApICksXHJcbiAgICAgIG5ldyBQdWxsZXIoIDcxNywgYmlnUHVsbGVyWSwgJ3JlZCcsICdzbWFsbCcsIDEwLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc21hbGxSZWRQdWxsZXIyJyApLCB7IG90aGVyOiAnb3RoZXInIH0gKSxcclxuICAgICAgbmV3IFB1bGxlciggNzg5LCBtZWRpdW1QdWxsZXJZLCAncmVkJywgJ21lZGl1bScsIDIwLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbWVkaXVtUmVkUHVsbGVyJyApICksXHJcbiAgICAgIG5ldyBQdWxsZXIoIDg2MCwgc21hbGxQdWxsZXJZLCAncmVkJywgJ2xhcmdlJywgMzAsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdsYXJnZVJlZFB1bGxlcicgKSApXHJcbiAgICBdO1xyXG5cclxuXHJcbiAgICAvLyBXaGVuIGFueSBwdWxsZXIgaXMgZHJhZ2dlZCBvciBtb3ZlZCB3aXRoIHBoZXQtaW8sIHVwZGF0ZSB0aGUgY2xvc2VzdCBrbm90cyB0byBiZSB2aXNpYmxlXHJcbiAgICAvLyBhbmQgY2hhbmdlIHRoZSBudW1iZXJQdWxsZXJzQXR0YWNoZWRcclxuICAgIHRoaXMucHVsbGVycy5mb3JFYWNoKCBwdWxsZXIgPT4ge1xyXG5cclxuICAgICAgcHVsbGVyLnBvc2l0aW9uUHJvcGVydHkubGluayggdGhpcy51cGRhdGVWaXNpYmxlS25vdHMuYmluZCggdGhpcyApICk7XHJcbiAgICAgIHB1bGxlci5kcmFnZ2VkRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICAgIHRoaXMubnVtYmVyUHVsbGVyc0F0dGFjaGVkUHJvcGVydHkuc2V0KCB0aGlzLmNvdW50QXR0YWNoZWRQdWxsZXJzKCkgKTtcclxuICAgICAgfSApO1xyXG4gICAgICBwdWxsZXIuZHJvcHBlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgICBjb25zdCBrbm90ID0gdGhpcy5nZXRUYXJnZXRLbm90KCBwdWxsZXIgKTtcclxuICAgICAgICB0aGlzLm1vdmVQdWxsZXJUb0tub3QoIHB1bGxlciwga25vdCApO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIHB1bGxlci5rbm90UHJvcGVydHkubGluayggKCkgPT4ge1xyXG4gICAgICAgIHRoaXMubnVtYmVyUHVsbGVyc0F0dGFjaGVkUHJvcGVydHkuc2V0KCB0aGlzLmNvdW50QXR0YWNoZWRQdWxsZXJzKCkgKTtcclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vVXBkYXRlIHRoZSBzdGFydGVkIGZsYWdcclxuICAgIHRoaXMucnVubmluZ1Byb3BlcnR5LmxpbmsoIHJ1bm5pbmcgPT4geyBpZiAoIHJ1bm5pbmcgKSB7IHRoaXMuc3RhcnRlZFByb3BlcnR5LnNldCggdHJ1ZSApOyB9fSApO1xyXG5cclxuICAgIC8vVXBkYXRlIHRoZSBmb3JjZXMgd2hlbiB0aGUgbnVtYmVyIG9mIGF0dGFjaGVkIHB1bGxlcnMgY2hhbmdlc1xyXG4gICAgdGhpcy5udW1iZXJQdWxsZXJzQXR0YWNoZWRQcm9wZXJ0eS5saW5rKCAoKSA9PiB7IHRoaXMubmV0Rm9yY2VQcm9wZXJ0eS5zZXQoIHRoaXMuZ2V0TmV0Rm9yY2UoKSApOyB9ICk7XHJcbiAgICB0aGlzLm51bWJlclB1bGxlcnNBdHRhY2hlZFByb3BlcnR5LmxpbmsoICgpID0+IHsgdGhpcy5sZWZ0Rm9yY2VQcm9wZXJ0eS5zZXQoIHRoaXMuZ2V0TGVmdEZvcmNlKCkgKTsgfSApO1xyXG4gICAgdGhpcy5udW1iZXJQdWxsZXJzQXR0YWNoZWRQcm9wZXJ0eS5saW5rKCAoKSA9PiB7IHRoaXMucmlnaHRGb3JjZVByb3BlcnR5LnNldCggdGhpcy5nZXRSaWdodEZvcmNlKCkgKTsgfSApO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIE1vdmUgYSBwdWxsZXIgdG8gYSBrbm90LiAgSWYgbm8ga25vdCBpcyBzcGVjaWZpZWQsIHB1bGxlciBpcyBtb3ZlZCB0byBpdHMgb3JpZ2luYWwgcG9zaXRpb24gaW4gdGhlIFB1bGxlclxyXG4gICAqIHRvb2xib3guXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1B1bGxlcn0gcHVsbGVyXHJcbiAgICogQHBhcmFtIHtLbm90fSBba25vdF0gLSBvcHRpb25hbCBrbm90IHdoZXJlIHRoZSBwdWxsZXIgc2hvdWxkIGJlIG1vdmVkLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBtb3ZlUHVsbGVyVG9Lbm90KCBwdWxsZXIsIGtub3QgKSB7XHJcblxyXG4gICAgLy90cnkgdG8gc25hcCB0byBhIGtub3RcclxuICAgIGlmICgga25vdCApIHtcclxuXHJcbiAgICAgIHB1bGxlci5wb3NpdGlvblByb3BlcnR5LnNldCggbmV3IFZlY3RvcjIoIGtub3QueFByb3BlcnR5LmdldCgpLCBrbm90LnkgKSApO1xyXG4gICAgICBwdWxsZXIua25vdFByb3BlcnR5LnNldCgga25vdCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vT3IgZ28gYmFjayBob21lXHJcbiAgICBlbHNlIHtcclxuICAgICAgcHVsbGVyLnBvc2l0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvL0tlZXAgdHJhY2sgb2YgdGhlaXIgcG9zaXRpb24gdG8gY2hhbmdlIHRoZSBhdHRhY2gvZGV0YWNoIHRocmVzaG9sZHMsIHNlZSBOZXRGb3JjZU1vZGVsLmdldFRhcmdldEtub3RcclxuICAgIGNvbnN0IG5ld1Bvc2l0aW9uID0ga25vdCA/ICdrbm90JyA6ICdob21lJztcclxuICAgIHB1bGxlci5sYXN0UGxhY2VtZW50UHJvcGVydHkuc2V0KCBuZXdQb3NpdGlvbiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2hpZnQgdGhlIHB1bGxlciB0byB0aGUgbGVmdC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSAge1B1bGxlcn0gcHVsbGVyIFtkZXNjcmlwdGlvbl1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2hpZnRQdWxsZXJMZWZ0KCBwdWxsZXIgKSB7XHJcbiAgICB0aGlzLnNoaWZ0UHVsbGVyKCBwdWxsZXIsIDAsIDQsIC0xICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTaGlmdCBhIHB1bGxlciB0byB0aGUgcmlnaHQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gIHtQdWxsZXJ9IHB1bGxlclxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzaGlmdFB1bGxlclJpZ2h0KCBwdWxsZXIgKSB7XHJcbiAgICB0aGlzLnNoaWZ0UHVsbGVyKCBwdWxsZXIsIDMsIDcsIDEgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNoaWZ0IGEgcHVsbGVyIGJ5IHNvbWUgZGVsdGEsIHJlc3RyaWN0ZWQgYnkgdGhlIGRlc2lyZWQgYm91bmRzXHJcbiAgICogQHBhcmFtICB7UHVsbGVyfSBwdWxsZXJcclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGxlZnRCb3VuZEluZGV4XHJcbiAgICogQHBhcmFtICB7bnVtYmVyfSByaWdodEJvdW5kSW5kZXhcclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGRlbHRhXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNoaWZ0UHVsbGVyKCBwdWxsZXIsIGxlZnRCb3VuZEluZGV4LCByaWdodEJvdW5kSW5kZXgsIGRlbHRhICkge1xyXG4gICAgaWYgKCBwdWxsZXIua25vdFByb3BlcnR5LmdldCgpICkge1xyXG4gICAgICBjb25zdCBjdXJyZW50SW5kZXggPSB0aGlzLmtub3RzLmluZGV4T2YoIHB1bGxlci5rbm90UHJvcGVydHkuZ2V0KCkgKTtcclxuICAgICAgaWYgKCBjdXJyZW50SW5kZXggIT09IGxlZnRCb3VuZEluZGV4ICYmIGN1cnJlbnRJbmRleCAhPT0gcmlnaHRCb3VuZEluZGV4ICkge1xyXG4gICAgICAgIGNvbnN0IG5leHRJbmRleCA9IGN1cnJlbnRJbmRleCArIGRlbHRhO1xyXG5cclxuICAgICAgICBjb25zdCBjdXJyZW50S25vdCA9IHRoaXMua25vdHNbIGN1cnJlbnRJbmRleCBdO1xyXG4gICAgICAgIGNvbnN0IG5leHRLbm90ID0gdGhpcy5rbm90c1sgbmV4dEluZGV4IF07XHJcblxyXG4gICAgICAgIGNvbnN0IG90aGVyUHVsbGVyID0gdGhpcy5nZXRQdWxsZXIoIG5leHRLbm90ICk7XHJcblxyXG4gICAgICAgIHB1bGxlci5zZXRWYWx1ZXMoIHsgcG9zaXRpb246IG5ldyBWZWN0b3IyKCBuZXh0S25vdC54UHJvcGVydHkuZ2V0KCksIG5leHRLbm90LnkgKSwga25vdDogbmV4dEtub3QgfSApO1xyXG4gICAgICAgIG90aGVyUHVsbGVyICYmIG90aGVyUHVsbGVyLnNldFZhbHVlcygge1xyXG4gICAgICAgICAgcG9zaXRpb246IG5ldyBWZWN0b3IyKCBjdXJyZW50S25vdC54UHJvcGVydHkuZ2V0KCksIGN1cnJlbnRLbm90LnkgKSxcclxuICAgICAgICAgIGtub3Q6IGN1cnJlbnRLbm90XHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljIC0gQ291bnQgdGhlIG51bWJlciBvZiBwdWxsZXJzIGF0dGFjaGVkIHRvIHRoZSByb3BlXHJcbiAgY291bnRBdHRhY2hlZFB1bGxlcnMoKSB7XHJcbiAgICBsZXQgY291bnQgPSAwO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5wdWxsZXJzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpZiAoIHRoaXMucHVsbGVyc1sgaSBdLmtub3RQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgICBjb3VudCsrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY291bnQ7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljIC0gQ2hhbmdlIGtub3QgdmlzaWJpbGl0eSAoaGFsbyBoaWdobGlnaHQpIHdoZW4gdGhlIHB1bGxlcnMgYXJlIGRyYWdnZWRcclxuICB1cGRhdGVWaXNpYmxlS25vdHMoKSB7XHJcbiAgICB0aGlzLmtub3RzLmZvckVhY2goIGtub3QgPT4geyBrbm90LnZpc2libGVQcm9wZXJ0eS5zZXQoIGZhbHNlICk7IH0gKTtcclxuICAgIHRoaXMucHVsbGVycy5mb3JFYWNoKCBwdWxsZXIgPT4ge1xyXG4gICAgICBpZiAoIHB1bGxlci5kcmFnZ2luZ1Byb3BlcnR5LmdldCgpICkge1xyXG4gICAgICAgIGNvbnN0IGtub3QgPSB0aGlzLmdldFRhcmdldEtub3QoIHB1bGxlciApO1xyXG4gICAgICAgIGlmICgga25vdCApIHtcclxuICAgICAgICAgIGtub3QudmlzaWJsZVByb3BlcnR5LnNldCggdHJ1ZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgcHVsbGVyIGF0dGFjaGVkIHRvIGEga25vdCwgb3IgbnVsbCBpZiBub25lIGF0dGFjaGVkIHRvIHRoYXQga25vdC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSAge0tub3R9IGtub3RcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0UHVsbGVyKCBrbm90ICkge1xyXG4gICAgY29uc3QgZmluZCA9IF8uZmluZCggdGhpcy5wdWxsZXJzLCBwdWxsZXIgPT4gcHVsbGVyLmtub3RQcm9wZXJ0eS5nZXQoKSA9PT0ga25vdCApO1xyXG4gICAgcmV0dXJuIHR5cGVvZiAoIGZpbmQgKSAhPT0gJ3VuZGVmaW5lZCcgPyBmaW5kIDogbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdpdmVuIGEgcHVsbGVyLCByZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCBjb21wdXRlcyB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0aGF0IHB1bGxlciBhbmQgYW55IGtub3QuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gIHtQdWxsZXJ9IHB1bGxlclxyXG4gICAqIEByZXR1cm5zIHtmdW5jdGlvbn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0S25vdFB1bGxlckRpc3RhbmNlKCBwdWxsZXIgKSB7XHJcblxyXG4gICAgLy8gdGhlIGJsdWUgcHVsbGVycyBmYWNlIHRvIHRoZSByaWdodCwgc28gYWRkIGEgc21hbGwgY29ycmVjdGlvbiBzbyB0aGUgZGlzdGFuY2UgZmVlbHMgbW9yZSAnbmF0dXJhbCcgd2hlblxyXG4gICAgLy8gcGxhY2luZyB0aGUgYmx1ZSBwdWxsZXJzXHJcbiAgICBjb25zdCBkeCA9IHB1bGxlci50eXBlID09PSAncmVkJyA/IDAgOiAtNDA7XHJcbiAgICByZXR1cm4ga25vdCA9PiBNYXRoLnNxcnQoIE1hdGgucG93KCBrbm90LnhQcm9wZXJ0eS5nZXQoKSAtIHB1bGxlci5wb3NpdGlvblByb3BlcnR5LmdldCgpLnggKyBkeCwgMiApICsgTWF0aC5wb3coIGtub3QueSAtIHB1bGxlci5wb3NpdGlvblByb3BlcnR5LmdldCgpLnksIDIgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgY2xvc2VzdCB1bm9jY3VwaWVkIGtub3QgdG8gdGhlIGdpdmVuIHB1bGxlciwgd2hpY2ggaXMgYmVpbmcgZHJhZ2dlZC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSAge1B1bGxlcn0gcHVsbGVyIFtkZXNjcmlwdGlvbl1cclxuICAgKiBAcmV0dXJucyB7S25vdH1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0Q2xvc2VzdE9wZW5Lbm90KCBwdWxsZXIgKSB7XHJcbiAgICBjb25zdCBmaWx0ZXIgPSB0aGlzLmtub3RzLmZpbHRlcigga25vdCA9PiBrbm90LnR5cGUgPT09IHB1bGxlci50eXBlICYmIHRoaXMuZ2V0UHVsbGVyKCBrbm90ICkgPT09IG51bGwgKTtcclxuICAgIHJldHVybiBfLm1pbkJ5KCBmaWx0ZXIsIHRoaXMuZ2V0S25vdFB1bGxlckRpc3RhbmNlKCBwdWxsZXIgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgY2xvc2VzdCB1bm9jY3VwaWVkIGtub3QgdG8gdGhlIGdpdmVuIHB1bGxlciwgd2hpY2ggaXMgYmVpbmcgZHJhZ2dlZC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSAge1B1bGxlcn0gcHVsbGVyXHJcbiAgICogQHJldHVybnMge0tub3R9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldENsb3Nlc3RPcGVuS25vdEZyb21DYXJ0KCBwdWxsZXIgKSB7XHJcbiAgICBsZXQgaWR4ID0gcHVsbGVyLnR5cGUgPT09ICdyZWQnID8gNCA6IDM7XHJcbiAgICBjb25zdCBkZWx0YSA9IHB1bGxlci50eXBlID09PSAncmVkJyA/IDEgOiAtMTtcclxuICAgIHdoaWxlICggdGhpcy5nZXRQdWxsZXIoIHRoaXMua25vdHNbIGlkeCBdICkgIT09IG51bGwgKSB7XHJcbiAgICAgIGlkeCArPSBkZWx0YTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLmtub3RzWyBpZHggXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIGNsb3Nlc3QgdW5vY2N1cGllZCBrbm90IHRvIHRoZSBnaXZlbiBwdWxsZXIgaWYgaXQgaXMgY2xvc2UgZW5vdWdoIHRvIGdyYWIuXHJcbiAgICogQHBhcmFtICB7UHVsbGVyfSBwdWxsZXJcclxuICAgKiBAcmV0dXJucyB7S25vdH1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0VGFyZ2V0S25vdCggcHVsbGVyICkge1xyXG4gICAgY29uc3QgdGFyZ2V0ID0gdGhpcy5nZXRDbG9zZXN0T3Blbktub3QoIHB1bGxlciApO1xyXG4gICAgY29uc3QgZGlzdGFuY2VUb1RhcmdldCA9IHRoaXMuZ2V0S25vdFB1bGxlckRpc3RhbmNlKCBwdWxsZXIgKSggdGFyZ2V0ICk7XHJcblxyXG4gICAgLy9Pbmx5IGFjY2VwdCBhIHRhcmdldCBrbm90IGlmIHRoZSBwdWxsZXIncyBoZWFkIGlzIGNsb3NlIGVub3VnaCB0byB0aGUga25vdFxyXG4gICAgY29uc3QgdGhyZXNob2xkID0gcHVsbGVyLmxhc3RQbGFjZW1lbnRQcm9wZXJ0eS5nZXQoKSA9PT0gJ2hvbWUnID8gMzcwIDogMzAwO1xyXG4gICAgcmV0dXJuIGRpc3RhbmNlVG9UYXJnZXQgPCAyMjAgJiYgcHVsbGVyLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueSA8IHRocmVzaG9sZCA/IHRhcmdldCA6IG51bGw7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljIC0gUmV0dXJuIHRoZSBjYXJ0IGFuZCBwcmVwYXJlIHRoZSBtb2RlbCBmb3IgYW5vdGhlciBcImdvXCIgcnVuXHJcbiAgcmV0dXJuQ2FydCgpIHtcclxuICAgIHRoaXMuY2FydC5yZXNldCgpO1xyXG4gICAgdGhpcy5rbm90cy5mb3JFYWNoKCBrbm90ID0+IHtrbm90LnJlc2V0KCk7fSApO1xyXG4gICAgdGhpcy5ydW5uaW5nUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gICAgdGhpcy5zdGF0ZVByb3BlcnR5LnNldCggJ2V4cGVyaW1lbnRpbmcnICk7XHJcblxyXG4gICAgLy8gYnJvYWRjYXN0IGEgbWVzc2FnZSB0aGF0IHRoZSBjYXJ0IHdhcyByZXR1cm5lZFxyXG4gICAgdGhpcy5jYXJ0UmV0dXJuZWRFbWl0dGVyLmVtaXQoKTtcclxuXHJcbiAgICB0aGlzLnN0YXJ0ZWRQcm9wZXJ0eS5zZXQoIGZhbHNlICk7XHJcbiAgICB0aGlzLmR1cmF0aW9uUHJvcGVydHkuc2V0KCAwICk7IC8vIFJlc2V0IHR1Zy1vZi13YXIgdGltZXJcclxuICAgIHRoaXMuc3BlZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpYyAtIFJlc2V0IHRoZSBlbnRpcmUgbW9kZWwgd2hlbiBcInJlc2V0IGFsbFwiIGlzIHByZXNzZWRcclxuICByZXNldCgpIHtcclxuXHJcbiAgICAvLyByZXNldCBhbGwgUHJvcGVydGllcyBhc3NvY2lhdGVkIHdpdGggdGhpcyBtb2RlbFxyXG4gICAgdGhpcy5zdGFydGVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMucnVubmluZ1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLm51bWJlclB1bGxlcnNBdHRhY2hlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnN0YXRlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMudGltZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLm5ldEZvcmNlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMubGVmdEZvcmNlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMucmlnaHRGb3JjZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnNwZWVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuZHVyYXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zaG93U3VtT2ZGb3JjZXNQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zaG93VmFsdWVzUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc2hvd1NwZWVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMudm9sdW1lT25Qcm9wZXJ0eS5yZXNldCgpO1xyXG5cclxuICAgIC8vVW5zZXQgdGhlIGtub3RzIGJlZm9yZSBjYWxsaW5nIHJlc2V0IHNpbmNlIHRoZSBjaGFuZ2Ugb2YgdGhlIG51bWJlciBvZiBhdHRhY2hlZCBwdWxsZXJzIGNhdXNlcyB0aGUgZm9yY2UgYXJyb3dzIHRvIHVwZGF0ZVxyXG4gICAgdGhpcy5wdWxsZXJzLmZvckVhY2goIHB1bGxlciA9PiB7cHVsbGVyLmRpc2Nvbm5lY3QoKTt9ICk7XHJcblxyXG4gICAgdGhpcy5jYXJ0LnJlc2V0KCk7XHJcbiAgICB0aGlzLnB1bGxlcnMuZm9yRWFjaCggcHVsbGVyID0+IHtcclxuICAgICAgLy8gaWYgdGhlIHB1bGxlciBpcyBiZWluZyBkcmFnZ2VkLCB3ZSB3aWxsIG5lZWQgdG8gY2FuY2VsIHRoZSBkcmFnIGluIFB1bGxlck5vZGVcclxuICAgICAgaWYgKCAhcHVsbGVyLmRyYWdnaW5nUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgICAgcHVsbGVyLnJlc2V0KCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIHRoaXMua25vdHMuZm9yRWFjaCgga25vdCA9PiB7a25vdC5yZXNldCgpO30gKTtcclxuXHJcbiAgICAvLyBub3RpZnkgdGhhdCB0aGUgbW9kZWwgd2FzIHJlc2V0XHJcbiAgICB0aGlzLnJlc2V0QWxsRW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgbGVuZ3RoIG9mIHRoZSByb3BlIGlzIHRoZSBzcGFjaW5nIGJldHdlZW4ga25vdHMgdGltZXMgdGhlIG51bWJlciBvZiBrbm90cyBwbHVzIHRoZSBkaWZmZXJlbmNlIGJldHdlZW5cclxuICAgKiB0aGUgcmVkIGFuZCBibHVlIHN0YXJ0aW5nIG9mZnNldHMuXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRSb3BlTGVuZ3RoKCkge1xyXG4gICAgcmV0dXJuIDYgKiBLTk9UX1NQQUNJTkcgKyBSRURfS05PVF9PRkZTRVQgLSAoIEJMVUVfS05PVF9PRkZTRVQgKyAzICogS05PVF9TUEFDSU5HICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgdGhlIHBoeXNpY3Mgd2hlbiB0aGUgY2xvY2sgdGlja3NcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuXHJcbiAgICBpZiAoIHRoaXMucnVubmluZ1Byb3BlcnR5LmdldCgpICkge1xyXG5cclxuICAgICAgLy8gSW5jcmVtZW50IHR1Zy1vZi13YXIgdGltZXJcclxuICAgICAgdGhpcy5kdXJhdGlvblByb3BlcnR5LnNldCggdGhpcy5kdXJhdGlvblByb3BlcnR5LmdldCgpICsgZHQgKTtcclxuXHJcbiAgICAgIC8vIE1ha2UgdGhlIHNpbXVsYXRpb24gcnVuIGFib3V0IGFzIGZhc3QgYXMgdGhlIEphdmEgdmVyc2lvblxyXG4gICAgICBjb25zdCBuZXdWID0gdGhpcy5jYXJ0LnZQcm9wZXJ0eS5nZXQoKSArIHRoaXMuZ2V0TmV0Rm9yY2UoKSAqIGR0ICogMC4wMDM7XHJcbiAgICAgIHRoaXMuc3BlZWRQcm9wZXJ0eS5zZXQoIE1hdGguYWJzKCBuZXdWICkgKTtcclxuXHJcbiAgICAgIC8vIGNhbGN1bGF0ZSBuZXcgcG9zaXRpb24gZnJvbSB2ZWxvY2l0eVxyXG4gICAgICBjb25zdCBuZXdYID0gdGhpcy5jYXJ0LnhQcm9wZXJ0eS5nZXQoKSArIG5ld1YgKiBkdCAqIDYwLjA7XHJcblxyXG4gICAgICAvL0lmIHRoZSBjYXJ0IG1hZGUgaXQgdG8gdGhlIGVuZCwgdGhlbiBzdG9wIGFuZCBzaWduaWZ5IGNvbXBsZXRpb25cclxuICAgICAgY29uc3QgZ2FtZUxlbmd0aCA9IEdBTUVfTEVOR1RIIC0gdGhpcy5jYXJ0LndpZHRoVG9XaGVlbDtcclxuICAgICAgaWYgKCBuZXdYID4gZ2FtZUxlbmd0aCB8fCBuZXdYIDwgLWdhbWVMZW5ndGggKSB7XHJcbiAgICAgICAgdGhpcy5ydW5uaW5nUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gICAgICAgIHRoaXMuc3RhdGVQcm9wZXJ0eS5zZXQoICdjb21wbGV0ZWQnICk7XHJcblxyXG4gICAgICAgIC8vIHplcm8gb3V0IHRoZSB2ZWxvY2l0eVxyXG4gICAgICAgIHRoaXMuc3BlZWRQcm9wZXJ0eS5zZXQoIDAgKTtcclxuXHJcbiAgICAgICAgLy8gc2V0IGNhcnQgYW5kIHB1bGxlcnMgYmFjayB0aGUgdG8gbWF4IHBvc2l0aW9uXHJcbiAgICAgICAgY29uc3QgbWF4TGVuZ3RoID0gbmV3WCA+IGdhbWVMZW5ndGggPyBnYW1lTGVuZ3RoIDogLWdhbWVMZW5ndGg7XHJcbiAgICAgICAgdGhpcy51cGRhdGVDYXJ0QW5kUHVsbGVycyggdGhpcy5zcGVlZFByb3BlcnR5LmdldCgpLCBtYXhMZW5ndGggKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gaWYgdGhlIGdhbWUgaXNuJ3Qgb3ZlciB5ZXQsIHVwZGF0ZSBjYXJ0IGFuZCBwdWxsZXJcclxuICAgICAgICB0aGlzLnVwZGF0ZUNhcnRBbmRQdWxsZXJzKCBuZXdWLCBuZXdYICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnRpbWVQcm9wZXJ0eS5zZXQoIHRoaXMudGltZVByb3BlcnR5LmdldCgpICsgZHQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB0aGUgdmVsb2NpdHkgYW5kIHBvc2l0aW9uIG9mIHRoZSBjYXJ0IGFuZCB0aGUgcHVsbGVycy5cclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHBhcmFtICB7bnVtYmVyfSBuZXdWXHJcbiAgICogQHBhcmFtICB7bnVtYmVyfSBuZXdYXHJcbiAgICovXHJcbiAgdXBkYXRlQ2FydEFuZFB1bGxlcnMoIG5ld1YsIG5ld1ggKSB7XHJcblxyXG4gICAgLy8gbW92ZSB0aGUgY2FydCwgYW5kIHVwZGF0ZSBpdHMgdmVsb2NpdHlcclxuICAgIHRoaXMuY2FydC52UHJvcGVydHkuc2V0KCBuZXdWICk7XHJcbiAgICB0aGlzLmNhcnQueFByb3BlcnR5LnNldCggbmV3WCApO1xyXG5cclxuICAgIC8vIG1vdmUgdGhlIGtub3RzIGFuZCB0aGUgcHVsbGVycyBvbiB0aG9zZSBrbm90c1xyXG4gICAgdGhpcy5rbm90cy5mb3JFYWNoKCBrbm90ID0+IHsga25vdC54UHJvcGVydHkuc2V0KCBrbm90LmluaXRYICsgbmV3WCApOyB9ICk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljIC0gR2V0cyB0aGUgbmV0IGZvcmNlIG9uIHRoZSBjYXJ0LCBhcHBsaWVkIGJ5IGJvdGggbGVmdCBhbmQgcmlnaHQgcHVsbGVyc1xyXG4gIGdldE5ldEZvcmNlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0TGVmdEZvcmNlKCkgKyB0aGlzLmdldFJpZ2h0Rm9yY2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBhbiBhcnJheSBvZiBwdWxsZXJzIG9mIHRoZSBzcGVjaWZpZWQgdHlwZSAoY29sb3Igc3RyaW5nKVxyXG4gICAqIEBwYXJhbSAge3N0cmluZ30gdHlwZSAtIG9uZSBvZiAncmVkJyBvciAnYmx1ZSdcclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPFB1bGxlcj59XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFB1bGxlcnMoIHR5cGUgKSB7XHJcbiAgICByZXR1cm4gXy5maWx0ZXIoIHRoaXMucHVsbGVycywgcCA9PiBwLnR5cGUgPT09IHR5cGUgJiYgcC5rbm90UHJvcGVydHkuZ2V0KCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZ1bmN0aW9uIGZvciBpbnRlcm5hbCB1c2UgdGhhdCBoZWxwcyB0byBzdW0gZm9yY2VzIGluIF8ucmVkdWNlLCBzZWUgZ2V0TGVmdEZvcmNlLCBnZXRSaWdodEZvcmNlXHJcbiAgICpcclxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IG1lbW9cclxuICAgKiBAcGFyYW0gIHtQdWxsZXJ9IHB1bGxlclxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN1bUZvcmNlcyggbWVtbywgcHVsbGVyICkge1xyXG4gICAgcmV0dXJuIG1lbW8gKyBwdWxsZXIuZm9yY2U7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljIC0gR2V0cyB0aGUgbGVmdCBmb3JjZSBvbiB0aGUgY2FydCwgYXBwbGllZCBieSBsZWZ0IGFuZCBwdWxsZXJzXHJcbiAgZ2V0TGVmdEZvcmNlKCkge1xyXG4gICAgcmV0dXJuIC1fLnJlZHVjZSggdGhpcy5nZXRQdWxsZXJzKCAnYmx1ZScgKSwgdGhpcy5zdW1Gb3JjZXMsIDAgKTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWMgLSBHZXRzIHRoZSByaWdodCBmb3JjZSBvbiB0aGUgY2FydCwgYXBwbGllZCBieSByaWdodCBwdWxsZXJzXHJcbiAgZ2V0UmlnaHRGb3JjZSgpIHtcclxuICAgIHJldHVybiBfLnJlZHVjZSggdGhpcy5nZXRQdWxsZXJzKCAncmVkJyApLCB0aGlzLnN1bUZvcmNlcywgMCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgY2xvc2VzdCB1bm9jY3VwaWVkIGtub3QgdG8gdGhlIGdpdmVuIHB1bGxlciwgd2hpY2ggaXMgYmVpbmcgZHJhZ2dlZC5cclxuICAgKiBAcGFyYW0gIHtQdWxsZXJ9IHB1bGxlclxyXG4gICAqIEBwYXJhbSAge251bWJlcn0gZGVsdGFcclxuICAgKiBAcmV0dXJucyB7S25vdH1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0Q2xvc2VzdE9wZW5Lbm90SW5EaXJlY3Rpb24oIHB1bGxlciwgZGVsdGEgKSB7XHJcbiAgICBjb25zdCBpc0luUmlnaHREaXJlY3Rpb24gPSAoIHNvdXJjZUtub3QsIGRlc3RpbmF0aW9uS25vdCwgZGVsdGEgKSA9PiB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGRlbHRhIDwgMCB8fCBkZWx0YSA+IDAgKTtcclxuICAgICAgcmV0dXJuIGRlbHRhIDwgMCA/IGRlc3RpbmF0aW9uS25vdC54UHJvcGVydHkuZ2V0KCkgPCBzb3VyY2VLbm90LnhQcm9wZXJ0eS5nZXQoKSA6XHJcbiAgICAgICAgICAgICBkZWx0YSA+IDAgPyBkZXN0aW5hdGlvbktub3QueFByb3BlcnR5LmdldCgpID4gc291cmNlS25vdC54UHJvcGVydHkuZ2V0KCkgOlxyXG4gICAgICAgICAgICAgJ2Vycm9yJztcclxuICAgIH07XHJcbiAgICBjb25zdCBmaWx0ZXIgPSB0aGlzLmtub3RzLmZpbHRlcigga25vdCA9PiBrbm90LnR5cGUgPT09IHB1bGxlci50eXBlICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdldFB1bGxlcigga25vdCApID09PSBudWxsICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0luUmlnaHREaXJlY3Rpb24oIHB1bGxlci5rbm90UHJvcGVydHkuZ2V0KCksIGtub3QsIGRlbHRhICkgKTtcclxuICAgIGxldCByZXN1bHQgPSBfLm1pbkJ5KCBmaWx0ZXIsIHRoaXMuZ2V0S25vdFB1bGxlckRpc3RhbmNlKCBwdWxsZXIgKSApO1xyXG4gICAgaWYgKCByZXN1bHQgPT09IEluZmluaXR5IHx8IHJlc3VsdCA9PT0gLUluZmluaXR5ICkge1xyXG4gICAgICByZXN1bHQgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgbmV4dCBvcGVuIGtub3QgaW4gYSBnaXZlbiBkaXJlY3Rpb24uICBWZXJ5IHNpbWlsYXIgdG8gdGhlIGZ1bmN0aW9uIGFib3ZlLCBidXQgd2l0aCBhIHJlc3VsdGFudCBrbm90XHJcbiAgICogaXMgYSBmdW5jdGlvbiBvZiB0aGUgZGlzdGFuY2UgdG8gdGhlIG5leHQga25vdCwgbm90IG9mIHRoZSBkaXN0YW5jZSB0byB0aGUgcHVsbGVyLiAgVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZVxyXG4gICAqIHdoZW4gZHJhZ2dpbmcsIHRoZSBwdWxsZXIgZG9lcyBub3QgeWV0IGhhdmUgYW4gYXNzb2NpYXRlZCBrbm90LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtLbm90fSBzb3VyY2VLbm90XHJcbiAgICogQHBhcmFtIHtQdWxsZXJ9IHB1bGxlclxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkZWx0YVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXROZXh0T3Blbktub3RJbkRpcmVjdGlvbiggc291cmNlS25vdCwgcHVsbGVyLCBkZWx0YSApIHtcclxuICAgIGNvbnN0IGlzSW5SaWdodERpcmVjdGlvbiA9ICggZGVzdGluYXRpb25Lbm90LCBkZWx0YSApID0+IHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZGVsdGEgPCAwIHx8IGRlbHRhID4gMCApO1xyXG4gICAgICByZXR1cm4gZGVsdGEgPCAwID8gZGVzdGluYXRpb25Lbm90LnhQcm9wZXJ0eS5nZXQoKSA8IHNvdXJjZUtub3QueFByb3BlcnR5LmdldCgpIDpcclxuICAgICAgICAgICAgIGRlbHRhID4gMCA/IGRlc3RpbmF0aW9uS25vdC54UHJvcGVydHkuZ2V0KCkgPiBzb3VyY2VLbm90LnhQcm9wZXJ0eS5nZXQoKSA6XHJcbiAgICAgICAgICAgICAnZXJyb3InO1xyXG4gICAgfTtcclxuICAgIGNvbnN0IGZpbHRlciA9IHRoaXMua25vdHMuZmlsdGVyKCBrbm90ID0+IGtub3QudHlwZSA9PT0gcHVsbGVyLnR5cGUgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0UHVsbGVyKCBrbm90ICkgPT09IG51bGwgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzSW5SaWdodERpcmVjdGlvbigga25vdCwgZGVsdGEgKSApO1xyXG4gICAgbGV0IHJlc3VsdCA9IF8ubWluQnkoIGZpbHRlciwga25vdCA9PiBNYXRoLmFicyggc291cmNlS25vdC54UHJvcGVydHkuZ2V0KCkgLSBrbm90LnhQcm9wZXJ0eS5nZXQoKSApICk7XHJcblxyXG4gICAgLy8gd2UgaGF2ZSByZWFjaGVkIHRoZSBlbmQgb2YgdGhlIGtub3RzLiAgUmV0dXJuIGVpdGhlciB0aGUgZmlyc3Qgb3IgbGFzdCBrbm90IHRvIGxvb3AgdGhlIGNob2ljZS5cclxuICAgIGlmICggcmVzdWx0ID09PSBJbmZpbml0eSB8fCByZXN1bHQgPT09IC1JbmZpbml0eSApIHtcclxuICAgICAgcmVzdWx0ID0gbnVsbDtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGb3IgcGhldC1pbywgZGVzY3JpYmUgd2hhdCBwdWxsZXJzIGFyZSBvbiB3aGF0IGtub3RzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldEtub3REZXNjcmlwdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLnB1bGxlcnMubWFwKCBwdWxsZXIgPT4gKCB7XHJcbiAgICAgIGlkOiBwdWxsZXIucHVsbGVyVGFuZGVtLnBoZXRpb0lELCAvLyBUT0RPOiBhZGRJbnN0YW5jZSBmb3IgUHVsbGVyXHJcbiAgICAgIGtub3Q6IHB1bGxlci5rbm90UHJvcGVydHkuZ2V0KCkgJiYgcHVsbGVyLmtub3RQcm9wZXJ0eS5nZXQoKS5waGV0aW9JRFxyXG4gICAgfSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb3ZlIGEgcHVsbGVyIHRvIGFuIGFkamFjZW50IG9wZW4ga25vdCBpbiBhIGRpcmVjdGlvbiBzcGVjaWZpZWQgYnkgZGVsdGEuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1B1bGxlcn0gcHVsbGVyXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGRlbHRhXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIG1vdmVQdWxsZXJUb0FkamFjZW50T3Blbktub3QoIHB1bGxlciwgZGVsdGEgKSB7XHJcbiAgICBjb25zdCBjbG9zZXN0T3Blbktub3QgPSB0aGlzLmdldENsb3Nlc3RPcGVuS25vdEluRGlyZWN0aW9uKCBwdWxsZXIsIGRlbHRhICk7XHJcbiAgICBpZiAoIGNsb3Nlc3RPcGVuS25vdCApIHtcclxuICAgICAgdGhpcy5tb3ZlUHVsbGVyVG9Lbm90KCBwdWxsZXIsIGNsb3Nlc3RPcGVuS25vdCApO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLy8gQHN0YXRpYyBAcHVibGljXHJcbk5ldEZvcmNlTW9kZWwuR0FNRV9MRU5HVEggPSBHQU1FX0xFTkdUSDtcclxuXHJcbmZvcmNlc0FuZE1vdGlvbkJhc2ljcy5yZWdpc3RlciggJ05ldEZvcmNlTW9kZWwnLCBOZXRGb3JjZU1vZGVsICk7XHJcblxyXG5OZXRGb3JjZU1vZGVsLk5ldEZvcmNlTW9kZWxJTyA9IG5ldyBJT1R5cGUoICdOZXRGb3JjZU1vZGVsSU8nLCB7XHJcbiAgdmFsdWVUeXBlOiBOZXRGb3JjZU1vZGVsLFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIHJlc2V0OiB7XHJcbiAgICAgIHJldHVyblR5cGU6IFZvaWRJTyxcclxuICAgICAgcGFyYW1ldGVyVHlwZXM6IFtdLFxyXG4gICAgICBpbXBsZW1lbnRhdGlvbjogKCkgPT4gdGhpcy5yZXNldCgpLFxyXG4gICAgICBkb2N1bWVudGF0aW9uOiAnUmVzZXRzIHRoZSBtb2RlbCcsXHJcbiAgICAgIGludm9jYWJsZUZvclJlYWRPbmx5RWxlbWVudHM6IGZhbHNlXHJcbiAgICB9XHJcbiAgfVxyXG59ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBOZXRGb3JjZU1vZGVsO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxPQUFPLE1BQU0sZ0NBQWdDO0FBQ3BELE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxZQUFZLE1BQU0sdUNBQXVDO0FBQ2hFLE9BQU9DLE1BQU0sTUFBTSx1Q0FBdUM7QUFDMUQsT0FBT0MsTUFBTSxNQUFNLHVDQUF1QztBQUMxRCxPQUFPQyxxQkFBcUIsTUFBTSxnQ0FBZ0M7QUFDbEUs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