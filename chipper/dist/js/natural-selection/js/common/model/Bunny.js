// Copyright 2019-2023, University of Colorado Boulder

/**
 * Bunny is the model of a bunny. Every bunny has a Genotype (genetic blueprint) and Phenotype (appearance).
 * All bunnies except generation-zero have 2 parents, referred to as 'father' and 'mother', although bunnies
 * are sexless. Generation-zero bunnies have no parents.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Emitter from '../../../../axon/js/Emitter.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import naturalSelection from '../../naturalSelection.js';
import Genotype from './Genotype.js';
import Organism from './Organism.js';
import Phenotype from './Phenotype.js';
import XDirection from './XDirection.js';
import NaturalSelectionUtils from '../NaturalSelectionUtils.js';
// constants
const HOP_TIME_RANGE = new Range(0.25, 0.5); // time to complete a hop cycle, in seconds
const HOP_DISTANCE_RANGE = new Range(15, 20); // straight-line distance that a bunny hops in the xz plane
const HOP_HEIGHT_RANGE = new Range(30, 50); // how high above the ground a bunny hops
const X_MARGIN = 28; // determined empirically, to keep bunnies inside bounds of the environment

export default class Bunny extends Organism {
  //TODO https://github.com/phetsims/natural-selection/issues/327 father, mother, isAlive, age should be readonly for clients

  // the bunny's genetic blueprint

  // the bunny's appearance, the manifestation of its genotype

  // Dynamic range for time spent resting between hops, in seconds. This is set by BunnyCollection based
  // on the total number of bunnies, so that bunnies rest longer when the population is larger. More details at
  // BunnyCollection.bunnyRestRangeProperty.
  // time to rest before hopping, randomized in initializeMotion
  // the cumulative time spent resting since the last hop, in seconds
  // Initialized with a random value so that bunnies born at the same time don't all hop at the same time.
  // time to complete one full hop, randomized in initializeMotion
  // the cumulative time spent hopping since the last reset, in seconds
  // the change in position when the bunny hops, randomized in initializeMotion
  // position at the start of a hop cycle
  // fires when the Bunny has died. dispose is required.
  // fires when the Bunny has been disposed. dispose is required.
  /**
   * @param genePool
   * @param modelViewTransform
   * @param bunnyRestRangeProperty - range for time spent resting between hops, in seconds
   * @param providedOptions
   */
  constructor(genePool, modelViewTransform, bunnyRestRangeProperty, providedOptions) {
    const options = optionize()({
      // SelfOptions
      father: null,
      mother: null,
      generation: 0,
      // OrganismOptions
      position: modelViewTransform.getRandomGroundPosition(X_MARGIN),
      xDirection: XDirection.getRandom(),
      phetioType: Bunny.BunnyIO,
      phetioDynamicElement: true
    }, providedOptions);

    // Validate options
    assert && assert(options.father && options.mother || !options.father && !options.mother, 'bunny must have both parents or no parents');
    assert && assert(NaturalSelectionUtils.isNonNegativeInteger(options.generation), 'invalid generation');
    super(modelViewTransform, options);
    this.father = options.father;
    this.mother = options.mother;
    this.generation = options.generation;
    this.isAlive = true;
    this.age = 0;

    //TODO https://github.com/phetsims/natural-selection/issues/327 how are this.genotype and this.phenotype getting restored?
    this.genotype = new Genotype(genePool, combineOptions({
      tandem: options.tandem.createTandem('genotype')
    }, options.genotypeOptions));
    this.phenotype = new Phenotype(this.genotype, {
      tandem: options.tandem.createTandem('phenotype')
    });
    this.bunnyRestRangeProperty = bunnyRestRangeProperty;
    this.restTime = this.bunnyRestRangeProperty.value.min;
    this.cumulativeRestTime = dotRandom.nextDoubleInRange(this.bunnyRestRangeProperty.value);
    this.hopTime = HOP_TIME_RANGE.max;
    this.cumulativeHopTime = 0;
    this.hopDelta = new Vector3(0, 0, 0);
    this.hopStartPosition = this.positionProperty.value;

    // Initialize the first motion cycle.
    this.initializeMotion();
    this.diedEmitter = new Emitter();
    this.disposedEmitter = new Emitter();

    // When the father or mother is disposed, set them to null to free memory.
    // See https://github.com/phetsims/natural-selection/issues/112
    const fatherDisposedListener = () => {
      if (this.father) {
        this.father.disposedEmitter.removeListener(fatherDisposedListener);
        this.father = null;
      }
    };
    this.father && this.father.disposedEmitter.addListener(fatherDisposedListener);
    const motherDisposedListener = () => {
      if (this.mother) {
        this.mother.disposedEmitter.removeListener(motherDisposedListener);
        this.mother = null;
      }
    };
    this.mother && this.mother.disposedEmitter.addListener(motherDisposedListener);
    this.disposeBunny = () => {
      this.genotype.dispose();
      this.phenotype.dispose();

      // diedEmitter is disposed after it fires, so don't do dispose again if the bunny is already dead.
      if (!this.diedEmitter.isDisposed) {
        this.diedEmitter.dispose();
      }
      if (this.father && this.father.disposedEmitter.hasListener(fatherDisposedListener)) {
        this.father.disposedEmitter.removeListener(fatherDisposedListener);
      }
      if (this.mother && this.mother.disposedEmitter.hasListener(motherDisposedListener)) {
        this.mother.disposedEmitter.removeListener(motherDisposedListener);
      }
    };
  }
  dispose() {
    assert && assert(!this.isDisposed, 'bunny is already disposed');
    this.disposeBunny();
    super.dispose();
    this.disposedEmitter.emit();
    this.disposedEmitter.dispose();
  }

  /**
   * Kills this bunny, forever and ever. (This sim does not support reincarnation or other forms of 'pooling' :)
   */
  die() {
    assert && assert(this.isAlive, 'bunny is already dead');
    this.isAlive = false;
    this.diedEmitter.emit();
    this.diedEmitter.dispose();
  }

  /**
   * Moves the Bunny around. This is the motion cycle for a bunny. Each bunny rests, hops, rests, hops, ...
   * @param dt - time step, in seconds
   */
  move(dt) {
    assert && assert(this.isAlive, 'dead bunny cannot move');
    if (this.cumulativeRestTime < this.restTime) {
      // The bunny is resting.
      this.cumulativeRestTime += dt;
    } else if (this.cumulativeHopTime < this.hopTime) {
      // Do part of the hop cycle.
      this.hop(dt);
    } else {
      // When we've completed a motion cycle, initialize the next cycle.
      this.initializeMotion();
    }
  }

  /**
   * Initializes the next motion cycle. A bunny will continue to hop until it gets to the edge of the screen.
   * Then it reverses direction.
   */
  initializeMotion() {
    // Verify that the bunny is in z bounds.
    // See https://github.com/phetsims/natural-selection/issues/131
    const currentZ = this.positionProperty.value.z;
    const minZ = this.getMinimumZ();
    const maxZ = this.getMaximumZ();
    assert && assert(currentZ >= minZ || currentZ <= maxZ, `bunny is out of z bounds: z=${currentZ}, minZ=${minZ}, maxZ=${maxZ}`);

    // Verify that the bunny is 'reasonably' in x bounds. The modelViewTransform is a trapezoid, where x range depends
    // on z coordinate. So a bunny may be slightly outside of this trapezoid. We decided that's OK, and it doesn't
    // negatively impact the learning goals. The assertion below detects bounds conditions are not 'reasonable'.
    // See https://github.com/phetsims/natural-selection/issues/131
    const currentX = this.positionProperty.value.x;
    const minX = this.getMinimumX() + X_MARGIN;
    const maxX = this.getMaximumX() - X_MARGIN;
    assert && assert(currentX >= minX - HOP_DISTANCE_RANGE.max || currentX <= maxX + HOP_DISTANCE_RANGE.max, `bunny is way out of x bounds: x=${currentX}, minX=${minX}, maxX=${maxX}`);

    // Record the position at the start of the hop.
    this.hopStartPosition = this.positionProperty.value;

    // Zero out cumulative times
    this.cumulativeRestTime = 0;
    this.cumulativeHopTime = 0;

    // Randomize motion for the next cycle
    this.restTime = dotRandom.nextDoubleInRange(this.bunnyRestRangeProperty.value);
    this.hopTime = dotRandom.nextDoubleInRange(HOP_TIME_RANGE);
    const hopDistance = dotRandom.nextDoubleInRange(HOP_DISTANCE_RANGE);
    const hopHeight = dotRandom.nextDoubleInRange(HOP_HEIGHT_RANGE);

    // Get motion delta for the next cycle
    this.hopDelta = getHopDelta(hopDistance, hopHeight, this.xDirectionProperty.value);

    // If the hop will exceed z boundaries, reverse delta z.  Do this before checking x, because the range of
    // x depends on the value of z.
    let hopEndZ = this.hopStartPosition.z + this.hopDelta.z;
    if (hopEndZ < minZ || hopEndZ > maxZ) {
      this.hopDelta.setZ(-this.hopDelta.z);
      hopEndZ = this.hopStartPosition.z + this.hopDelta.z;
    }

    // After checking z, now we can check x. If the hop will exceed x boundaries, point the bunny in the correct
    // direction. Note that this is not a matter of simply flipping the sign of hopDelta.x, because the range of
    // x is based on z. See https://github.com/phetsims/natural-selection/issues/131
    const hopEndX = this.hopStartPosition.x + this.hopDelta.x;
    const endMinX = this.modelViewTransform.getMinimumX(hopEndZ) + X_MARGIN;
    const endMaxX = this.modelViewTransform.getMaximumX(hopEndZ) - X_MARGIN;
    if (hopEndX < endMinX) {
      this.hopDelta.setX(Math.abs(this.hopDelta.x)); // move to the right
    } else if (hopEndX > endMaxX) {
      this.hopDelta.setX(-Math.abs(this.hopDelta.x)); // move to the left
    }

    // Adjust the x direction to match the hop delta x
    this.xDirectionProperty.value = this.hopDelta.x >= 0 ? XDirection.RIGHT : XDirection.LEFT;
  }

  /**
   * Performs part of a hop cycle.
   * @param dt - time step, in seconds
   */
  hop(dt) {
    assert && assert(this.cumulativeHopTime < this.hopTime, 'hop should not have been called');
    this.cumulativeHopTime += dt;

    // Portion of the hop cycle to do. Don't do more than 1 hop cycle.
    const hopFraction = Math.min(1, this.cumulativeHopTime / this.hopTime);

    // x and z components of the hop.
    const x = this.hopStartPosition.x + hopFraction * this.hopDelta.x;
    const z = this.hopStartPosition.z + hopFraction * this.hopDelta.z;

    // Hop height (y) follows a quadratic arc.
    const yAboveGround = this.hopDelta.y * 2 * (-(hopFraction * hopFraction) + hopFraction);
    const y = this.modelViewTransform.getGroundY(z) + yAboveGround;
    this.positionProperty.value = new Vector3(x, y, z);
  }

  /**
   * Interrupts a bunny's hop, and moves it immediately to the ground. This is used to prevent bunnies from being
   * stuck up in the air mid-hop when the simulation ends.
   */
  interruptHop() {
    // move bunny to the ground
    const position = this.positionProperty.value;
    const y = this.modelViewTransform.getGroundY(position.z);
    this.positionProperty.value = new Vector3(position.x, y, position.z);

    // initialization the next motion cycle
    this.initializeMotion();
  }

  /**
   * Is this bunny an 'original mutant'? An original mutant is a bunny in which the mutation first occurred.
   * These bunnies are labeled with a mutation icon in the Pedigree graph.
   */
  isOriginalMutant() {
    return !!this.genotype.mutation;
  }

  /**
   * Converts Bunny to a string. This is intended for debugging only. Do not rely on the format of this string!
   */
  toString() {
    return `${this.tandem.name}, ` + `generation=${this.generation}, ` + `age=${this.age}, ` + `isAlive=${this.isAlive}, ` + `genotype='${this.genotype.toAbbreviation()}', ` + `father=${this.father ? this.father.tandem.name : null}, ` + `mother=${this.mother ? this.mother.tandem.name : null}, ` + `isOriginalMutant=${this.isOriginalMutant()}`;
  }

  //--------------------------------------------------------------------------------------------------------------------
  // Below here are methods used by BunnyIO to serialize PhET-iO state.
  //--------------------------------------------------------------------------------------------------------------------

  /**
   * Returns a function that returns a map of state keys and their associated IOTypes, see IOType for details.
   * We need to use a function because the state schema recursive references BunnyIO.
   */
  static getStateSchema(BunnyIO) {
    return {
      // Even though father and mother are stateful, we need a reference to them.
      father: NullableIO(ReferenceIO(BunnyIO)),
      mother: NullableIO(ReferenceIO(BunnyIO)),
      generation: NumberIO,
      isAlive: BooleanIO,
      age: NumberIO,
      // genotype and phenotype are stateful and will be serialized automatically.

      // private fields, will not be shown in Studio
      _restTime: NumberIO,
      _hopTime: NumberIO,
      _cumulativeRestTime: NumberIO,
      _cumulativeHopTime: NumberIO,
      _hopDelta: Vector3.Vector3IO,
      _hopStartPosition: Vector3.Vector3IO
    };
  }

  //TODO https://github.com/phetsims/natural-selection/issues/327 need to restore what we can via constructor
  /**
   * Creates the arguments that BunnyGroup.createElement uses to create a Bunny.
   * While we could restore a few things via the constructor, we're going to instantiate with defaults
   * and restore everything via applyState.
   */
  static stateObjectToCreateElementArguments(stateObject) {
    return [{}];
  }

  //TODO https://github.com/phetsims/natural-selection/issues/327 does defaultApplyState work here? why?
  /**
   * Restores Bunny state after instantiation.
   */
  applyState(stateObject) {
    Bunny.BunnyIO.stateSchema.defaultApplyState(this, stateObject);
  }

  /**
   * BunnyIO handles PhET-iO serialization of Bunny.
   * It implements 'Dynamic element serialization', as described in the Serialization section of
   * https://github.com/phetsims/phet-io/blob/master/doc/phet-io-instrumentation-technical-guide.md#serialization
   */
  static BunnyIO = new IOType('BunnyIO', {
    valueType: Bunny,
    stateSchema: Bunny.getStateSchema,
    //TODO https://github.com/phetsims/natural-selection/issues/327 need to implement bunny.toStateObject()
    stateObjectToCreateElementArguments: stateObject => Bunny.stateObjectToCreateElementArguments(stateObject),
    applyState: (bunny, stateObject) => bunny.applyState(stateObject)
  });
}

/**
 * Gets the (dx, dy, dz) for a hop cycle.
 * @param hopDistance - maximum straight-line distance that the bunny will hop in the xz plane
 * @param hopHeight - height above the ground that the bunny will hop
 * @param xDirection - direction that the bunny is facing along the x-axis
 */
function getHopDelta(hopDistance, hopHeight, xDirection) {
  assert && assert(hopHeight > 0, `invalid hopHeight: ${hopHeight}`);
  const angle = dotRandom.nextDoubleBetween(0, 2 * Math.PI);

  // Do some basic trig to compute motion in x and z planes
  const hypotenuse = hopDistance;
  const adjacent = hypotenuse * Math.cos(angle); // cos(theta) = adjacent/hypotenuse
  const opposite = hypotenuse * Math.sin(angle); // sin(theta) = opposite/hypotenuse

  // We'll use the larger motion for dx, the smaller for dz.
  const oppositeIsLarger = Math.abs(opposite) > Math.abs(adjacent);
  const dx = Math.abs(oppositeIsLarger ? opposite : adjacent) * XDirection.toSign(xDirection);
  const dy = hopHeight;
  const dz = oppositeIsLarger ? adjacent : opposite;
  return new Vector3(dx, dy, dz);
}
naturalSelection.register('Bunny', Bunny);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbWl0dGVyIiwiZG90UmFuZG9tIiwiUmFuZ2UiLCJWZWN0b3IzIiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJCb29sZWFuSU8iLCJJT1R5cGUiLCJOdWxsYWJsZUlPIiwiTnVtYmVySU8iLCJSZWZlcmVuY2VJTyIsIm5hdHVyYWxTZWxlY3Rpb24iLCJHZW5vdHlwZSIsIk9yZ2FuaXNtIiwiUGhlbm90eXBlIiwiWERpcmVjdGlvbiIsIk5hdHVyYWxTZWxlY3Rpb25VdGlscyIsIkhPUF9USU1FX1JBTkdFIiwiSE9QX0RJU1RBTkNFX1JBTkdFIiwiSE9QX0hFSUdIVF9SQU5HRSIsIlhfTUFSR0lOIiwiQnVubnkiLCJjb25zdHJ1Y3RvciIsImdlbmVQb29sIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiYnVubnlSZXN0UmFuZ2VQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJmYXRoZXIiLCJtb3RoZXIiLCJnZW5lcmF0aW9uIiwicG9zaXRpb24iLCJnZXRSYW5kb21Hcm91bmRQb3NpdGlvbiIsInhEaXJlY3Rpb24iLCJnZXRSYW5kb20iLCJwaGV0aW9UeXBlIiwiQnVubnlJTyIsInBoZXRpb0R5bmFtaWNFbGVtZW50IiwiYXNzZXJ0IiwiaXNOb25OZWdhdGl2ZUludGVnZXIiLCJpc0FsaXZlIiwiYWdlIiwiZ2Vub3R5cGUiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJnZW5vdHlwZU9wdGlvbnMiLCJwaGVub3R5cGUiLCJyZXN0VGltZSIsInZhbHVlIiwibWluIiwiY3VtdWxhdGl2ZVJlc3RUaW1lIiwibmV4dERvdWJsZUluUmFuZ2UiLCJob3BUaW1lIiwibWF4IiwiY3VtdWxhdGl2ZUhvcFRpbWUiLCJob3BEZWx0YSIsImhvcFN0YXJ0UG9zaXRpb24iLCJwb3NpdGlvblByb3BlcnR5IiwiaW5pdGlhbGl6ZU1vdGlvbiIsImRpZWRFbWl0dGVyIiwiZGlzcG9zZWRFbWl0dGVyIiwiZmF0aGVyRGlzcG9zZWRMaXN0ZW5lciIsInJlbW92ZUxpc3RlbmVyIiwiYWRkTGlzdGVuZXIiLCJtb3RoZXJEaXNwb3NlZExpc3RlbmVyIiwiZGlzcG9zZUJ1bm55IiwiZGlzcG9zZSIsImlzRGlzcG9zZWQiLCJoYXNMaXN0ZW5lciIsImVtaXQiLCJkaWUiLCJtb3ZlIiwiZHQiLCJob3AiLCJjdXJyZW50WiIsInoiLCJtaW5aIiwiZ2V0TWluaW11bVoiLCJtYXhaIiwiZ2V0TWF4aW11bVoiLCJjdXJyZW50WCIsIngiLCJtaW5YIiwiZ2V0TWluaW11bVgiLCJtYXhYIiwiZ2V0TWF4aW11bVgiLCJob3BEaXN0YW5jZSIsImhvcEhlaWdodCIsImdldEhvcERlbHRhIiwieERpcmVjdGlvblByb3BlcnR5IiwiaG9wRW5kWiIsInNldFoiLCJob3BFbmRYIiwiZW5kTWluWCIsImVuZE1heFgiLCJzZXRYIiwiTWF0aCIsImFicyIsIlJJR0hUIiwiTEVGVCIsImhvcEZyYWN0aW9uIiwieUFib3ZlR3JvdW5kIiwieSIsImdldEdyb3VuZFkiLCJpbnRlcnJ1cHRIb3AiLCJpc09yaWdpbmFsTXV0YW50IiwibXV0YXRpb24iLCJ0b1N0cmluZyIsIm5hbWUiLCJ0b0FiYnJldmlhdGlvbiIsImdldFN0YXRlU2NoZW1hIiwiX3Jlc3RUaW1lIiwiX2hvcFRpbWUiLCJfY3VtdWxhdGl2ZVJlc3RUaW1lIiwiX2N1bXVsYXRpdmVIb3BUaW1lIiwiX2hvcERlbHRhIiwiVmVjdG9yM0lPIiwiX2hvcFN0YXJ0UG9zaXRpb24iLCJzdGF0ZU9iamVjdFRvQ3JlYXRlRWxlbWVudEFyZ3VtZW50cyIsInN0YXRlT2JqZWN0IiwiYXBwbHlTdGF0ZSIsInN0YXRlU2NoZW1hIiwiZGVmYXVsdEFwcGx5U3RhdGUiLCJ2YWx1ZVR5cGUiLCJidW5ueSIsImFuZ2xlIiwibmV4dERvdWJsZUJldHdlZW4iLCJQSSIsImh5cG90ZW51c2UiLCJhZGphY2VudCIsImNvcyIsIm9wcG9zaXRlIiwic2luIiwib3Bwb3NpdGVJc0xhcmdlciIsImR4IiwidG9TaWduIiwiZHkiLCJkeiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQnVubnkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQnVubnkgaXMgdGhlIG1vZGVsIG9mIGEgYnVubnkuIEV2ZXJ5IGJ1bm55IGhhcyBhIEdlbm90eXBlIChnZW5ldGljIGJsdWVwcmludCkgYW5kIFBoZW5vdHlwZSAoYXBwZWFyYW5jZSkuXHJcbiAqIEFsbCBidW5uaWVzIGV4Y2VwdCBnZW5lcmF0aW9uLXplcm8gaGF2ZSAyIHBhcmVudHMsIHJlZmVycmVkIHRvIGFzICdmYXRoZXInIGFuZCAnbW90aGVyJywgYWx0aG91Z2ggYnVubmllc1xyXG4gKiBhcmUgc2V4bGVzcy4gR2VuZXJhdGlvbi16ZXJvIGJ1bm5pZXMgaGF2ZSBubyBwYXJlbnRzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBWZWN0b3IzLCB7IFZlY3RvcjNTdGF0ZU9iamVjdCB9IGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IzLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcbmltcG9ydCBCb29sZWFuSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0Jvb2xlYW5JTy5qcyc7XHJcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XHJcbmltcG9ydCBOdWxsYWJsZUlPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdWxsYWJsZUlPLmpzJztcclxuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XHJcbmltcG9ydCBSZWZlcmVuY2VJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvUmVmZXJlbmNlSU8uanMnO1xyXG5pbXBvcnQgbmF0dXJhbFNlbGVjdGlvbiBmcm9tICcuLi8uLi9uYXR1cmFsU2VsZWN0aW9uLmpzJztcclxuaW1wb3J0IEVudmlyb25tZW50TW9kZWxWaWV3VHJhbnNmb3JtIGZyb20gJy4vRW52aXJvbm1lbnRNb2RlbFZpZXdUcmFuc2Zvcm0uanMnO1xyXG5pbXBvcnQgR2VuZVBvb2wgZnJvbSAnLi9HZW5lUG9vbC5qcyc7XHJcbmltcG9ydCBHZW5vdHlwZSwgeyBHZW5vdHlwZU9wdGlvbnMgfSBmcm9tICcuL0dlbm90eXBlLmpzJztcclxuaW1wb3J0IE9yZ2FuaXNtLCB7IE9yZ2FuaXNtT3B0aW9ucyB9IGZyb20gJy4vT3JnYW5pc20uanMnO1xyXG5pbXBvcnQgUGhlbm90eXBlIGZyb20gJy4vUGhlbm90eXBlLmpzJztcclxuaW1wb3J0IFhEaXJlY3Rpb24gZnJvbSAnLi9YRGlyZWN0aW9uLmpzJztcclxuaW1wb3J0IHsgQ29tcG9zaXRlU2NoZW1hIH0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1N0YXRlU2NoZW1hLmpzJztcclxuaW1wb3J0IE5hdHVyYWxTZWxlY3Rpb25VdGlscyBmcm9tICcuLi9OYXR1cmFsU2VsZWN0aW9uVXRpbHMuanMnO1xyXG5pbXBvcnQgeyBCdW5ueUdyb3VwQ3JlYXRlRWxlbWVudEFyZ3VtZW50cyB9IGZyb20gJy4vQnVubnlHcm91cC5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgSE9QX1RJTUVfUkFOR0UgPSBuZXcgUmFuZ2UoIDAuMjUsIDAuNSApOyAvLyB0aW1lIHRvIGNvbXBsZXRlIGEgaG9wIGN5Y2xlLCBpbiBzZWNvbmRzXHJcbmNvbnN0IEhPUF9ESVNUQU5DRV9SQU5HRSA9IG5ldyBSYW5nZSggMTUsIDIwICk7IC8vIHN0cmFpZ2h0LWxpbmUgZGlzdGFuY2UgdGhhdCBhIGJ1bm55IGhvcHMgaW4gdGhlIHh6IHBsYW5lXHJcbmNvbnN0IEhPUF9IRUlHSFRfUkFOR0UgPSBuZXcgUmFuZ2UoIDMwLCA1MCApOyAvLyBob3cgaGlnaCBhYm92ZSB0aGUgZ3JvdW5kIGEgYnVubnkgaG9wc1xyXG5jb25zdCBYX01BUkdJTiA9IDI4OyAvLyBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5LCB0byBrZWVwIGJ1bm5pZXMgaW5zaWRlIGJvdW5kcyBvZiB0aGUgZW52aXJvbm1lbnRcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgZmF0aGVyPzogQnVubnkgfCBudWxsOyAvLyB0aGUgQnVubnkncyBmYXRoZXIsIG51bGwgaWYgbm8gZmF0aGVyXHJcbiAgbW90aGVyPzogQnVubnkgfCBudWxsOyAvLyB0aGUgQnVubnkncyBtb3RoZXIsIG51bGwgaWYgbm8gbW90aGVyXHJcbiAgZ2VuZXJhdGlvbj86IG51bWJlcjsgLy8gZ2VuZXJhdGlvbiB0aGF0IHRoaXMgQnVubnkgYmVsb25ncyB0b1xyXG4gIGdlbm90eXBlT3B0aW9ucz86IFN0cmljdE9taXQ8R2Vub3R5cGVPcHRpb25zLCAndGFuZGVtJz47XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBCdW5ueU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxPcmdhbmlzbU9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbnR5cGUgQnVubnlTdGF0ZU9iamVjdCA9IHtcclxuICBmYXRoZXI6IEJ1bm55U3RhdGVPYmplY3QgfCBudWxsO1xyXG4gIG1vdGhlcjogQnVubnlTdGF0ZU9iamVjdCB8IG51bGw7XHJcbiAgZ2VuZXJhdGlvbjogbnVtYmVyO1xyXG4gIGlzQWxpdmU6IGJvb2xlYW47XHJcbiAgYWdlOiBudW1iZXI7XHJcbiAgX3Jlc3RUaW1lOiBudW1iZXI7XHJcbiAgX2hvcFRpbWU6IG51bWJlcjtcclxuICBfY3VtdWxhdGl2ZVJlc3RUaW1lOiBudW1iZXI7XHJcbiAgX2N1bXVsYXRpdmVIb3BUaW1lOiBudW1iZXI7XHJcbiAgX2hvcERlbHRhOiBWZWN0b3IzU3RhdGVPYmplY3Q7XHJcbiAgX2hvcFN0YXJ0UG9zaXRpb246IFZlY3RvcjNTdGF0ZU9iamVjdDtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJ1bm55IGV4dGVuZHMgT3JnYW5pc20ge1xyXG5cclxuICAvL1RPRE8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL25hdHVyYWwtc2VsZWN0aW9uL2lzc3Vlcy8zMjcgZmF0aGVyLCBtb3RoZXIsIGlzQWxpdmUsIGFnZSBzaG91bGQgYmUgcmVhZG9ubHkgZm9yIGNsaWVudHNcclxuICBwdWJsaWMgZmF0aGVyOiBCdW5ueSB8IG51bGw7XHJcbiAgcHVibGljIG1vdGhlcjogQnVubnkgfCBudWxsO1xyXG4gIHB1YmxpYyByZWFkb25seSBnZW5lcmF0aW9uOiBudW1iZXI7XHJcbiAgcHVibGljIGlzQWxpdmU6IGJvb2xlYW47XHJcbiAgcHVibGljIGFnZTogbnVtYmVyO1xyXG5cclxuICAvLyB0aGUgYnVubnkncyBnZW5ldGljIGJsdWVwcmludFxyXG4gIHB1YmxpYyByZWFkb25seSBnZW5vdHlwZTogR2Vub3R5cGU7XHJcblxyXG4gIC8vIHRoZSBidW5ueSdzIGFwcGVhcmFuY2UsIHRoZSBtYW5pZmVzdGF0aW9uIG9mIGl0cyBnZW5vdHlwZVxyXG4gIHB1YmxpYyByZWFkb25seSBwaGVub3R5cGU6IFBoZW5vdHlwZTtcclxuXHJcbiAgLy8gRHluYW1pYyByYW5nZSBmb3IgdGltZSBzcGVudCByZXN0aW5nIGJldHdlZW4gaG9wcywgaW4gc2Vjb25kcy4gVGhpcyBpcyBzZXQgYnkgQnVubnlDb2xsZWN0aW9uIGJhc2VkXHJcbiAgLy8gb24gdGhlIHRvdGFsIG51bWJlciBvZiBidW5uaWVzLCBzbyB0aGF0IGJ1bm5pZXMgcmVzdCBsb25nZXIgd2hlbiB0aGUgcG9wdWxhdGlvbiBpcyBsYXJnZXIuIE1vcmUgZGV0YWlscyBhdFxyXG4gIC8vIEJ1bm55Q29sbGVjdGlvbi5idW5ueVJlc3RSYW5nZVByb3BlcnR5LlxyXG4gIHByaXZhdGUgcmVhZG9ubHkgYnVubnlSZXN0UmFuZ2VQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8UmFuZ2U+O1xyXG5cclxuICAvLyB0aW1lIHRvIHJlc3QgYmVmb3JlIGhvcHBpbmcsIHJhbmRvbWl6ZWQgaW4gaW5pdGlhbGl6ZU1vdGlvblxyXG4gIHByaXZhdGUgcmVzdFRpbWU6IG51bWJlcjtcclxuXHJcbiAgLy8gdGhlIGN1bXVsYXRpdmUgdGltZSBzcGVudCByZXN0aW5nIHNpbmNlIHRoZSBsYXN0IGhvcCwgaW4gc2Vjb25kc1xyXG4gIC8vIEluaXRpYWxpemVkIHdpdGggYSByYW5kb20gdmFsdWUgc28gdGhhdCBidW5uaWVzIGJvcm4gYXQgdGhlIHNhbWUgdGltZSBkb24ndCBhbGwgaG9wIGF0IHRoZSBzYW1lIHRpbWUuXHJcbiAgcHJpdmF0ZSBjdW11bGF0aXZlUmVzdFRpbWU6IG51bWJlcjtcclxuXHJcbiAgLy8gdGltZSB0byBjb21wbGV0ZSBvbmUgZnVsbCBob3AsIHJhbmRvbWl6ZWQgaW4gaW5pdGlhbGl6ZU1vdGlvblxyXG4gIHByaXZhdGUgaG9wVGltZTogbnVtYmVyO1xyXG5cclxuICAvLyB0aGUgY3VtdWxhdGl2ZSB0aW1lIHNwZW50IGhvcHBpbmcgc2luY2UgdGhlIGxhc3QgcmVzZXQsIGluIHNlY29uZHNcclxuICBwcml2YXRlIGN1bXVsYXRpdmVIb3BUaW1lOiBudW1iZXI7XHJcblxyXG4gIC8vIHRoZSBjaGFuZ2UgaW4gcG9zaXRpb24gd2hlbiB0aGUgYnVubnkgaG9wcywgcmFuZG9taXplZCBpbiBpbml0aWFsaXplTW90aW9uXHJcbiAgcHJpdmF0ZSBob3BEZWx0YTogVmVjdG9yMztcclxuXHJcbiAgLy8gcG9zaXRpb24gYXQgdGhlIHN0YXJ0IG9mIGEgaG9wIGN5Y2xlXHJcbiAgcHJpdmF0ZSBob3BTdGFydFBvc2l0aW9uOiBWZWN0b3IzO1xyXG5cclxuICAvLyBmaXJlcyB3aGVuIHRoZSBCdW5ueSBoYXMgZGllZC4gZGlzcG9zZSBpcyByZXF1aXJlZC5cclxuICBwdWJsaWMgcmVhZG9ubHkgZGllZEVtaXR0ZXI6IEVtaXR0ZXI7XHJcblxyXG4gIC8vIGZpcmVzIHdoZW4gdGhlIEJ1bm55IGhhcyBiZWVuIGRpc3Bvc2VkLiBkaXNwb3NlIGlzIHJlcXVpcmVkLlxyXG4gIHB1YmxpYyByZWFkb25seSBkaXNwb3NlZEVtaXR0ZXI6IEVtaXR0ZXI7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZUJ1bm55OiAoKSA9PiB2b2lkO1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gZ2VuZVBvb2xcclxuICAgKiBAcGFyYW0gbW9kZWxWaWV3VHJhbnNmb3JtXHJcbiAgICogQHBhcmFtIGJ1bm55UmVzdFJhbmdlUHJvcGVydHkgLSByYW5nZSBmb3IgdGltZSBzcGVudCByZXN0aW5nIGJldHdlZW4gaG9wcywgaW4gc2Vjb25kc1xyXG4gICAqIEBwYXJhbSBwcm92aWRlZE9wdGlvbnNcclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGdlbmVQb29sOiBHZW5lUG9vbCxcclxuICAgICAgICAgICAgICAgICAgICAgIG1vZGVsVmlld1RyYW5zZm9ybTogRW52aXJvbm1lbnRNb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgICAgICAgICAgICAgICAgICBidW5ueVJlc3RSYW5nZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxSYW5nZT4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM6IEJ1bm55T3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEJ1bm55T3B0aW9ucywgU3RyaWN0T21pdDxTZWxmT3B0aW9ucywgJ2dlbm90eXBlT3B0aW9ucyc+LCBPcmdhbmlzbU9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFNlbGZPcHRpb25zXHJcbiAgICAgIGZhdGhlcjogbnVsbCxcclxuICAgICAgbW90aGVyOiBudWxsLFxyXG4gICAgICBnZW5lcmF0aW9uOiAwLFxyXG5cclxuICAgICAgLy8gT3JnYW5pc21PcHRpb25zXHJcbiAgICAgIHBvc2l0aW9uOiBtb2RlbFZpZXdUcmFuc2Zvcm0uZ2V0UmFuZG9tR3JvdW5kUG9zaXRpb24oIFhfTUFSR0lOICksXHJcbiAgICAgIHhEaXJlY3Rpb246IFhEaXJlY3Rpb24uZ2V0UmFuZG9tKCksXHJcbiAgICAgIHBoZXRpb1R5cGU6IEJ1bm55LkJ1bm55SU8sXHJcbiAgICAgIHBoZXRpb0R5bmFtaWNFbGVtZW50OiB0cnVlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBWYWxpZGF0ZSBvcHRpb25zXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAoIG9wdGlvbnMuZmF0aGVyICYmIG9wdGlvbnMubW90aGVyICkgfHwgKCAhb3B0aW9ucy5mYXRoZXIgJiYgIW9wdGlvbnMubW90aGVyICksXHJcbiAgICAgICdidW5ueSBtdXN0IGhhdmUgYm90aCBwYXJlbnRzIG9yIG5vIHBhcmVudHMnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBOYXR1cmFsU2VsZWN0aW9uVXRpbHMuaXNOb25OZWdhdGl2ZUludGVnZXIoIG9wdGlvbnMuZ2VuZXJhdGlvbiApLCAnaW52YWxpZCBnZW5lcmF0aW9uJyApO1xyXG5cclxuICAgIHN1cGVyKCBtb2RlbFZpZXdUcmFuc2Zvcm0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmZhdGhlciA9IG9wdGlvbnMuZmF0aGVyO1xyXG4gICAgdGhpcy5tb3RoZXIgPSBvcHRpb25zLm1vdGhlcjtcclxuICAgIHRoaXMuZ2VuZXJhdGlvbiA9IG9wdGlvbnMuZ2VuZXJhdGlvbjtcclxuICAgIHRoaXMuaXNBbGl2ZSA9IHRydWU7XHJcbiAgICB0aGlzLmFnZSA9IDA7XHJcblxyXG4gICAgLy9UT0RPIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9uYXR1cmFsLXNlbGVjdGlvbi9pc3N1ZXMvMzI3IGhvdyBhcmUgdGhpcy5nZW5vdHlwZSBhbmQgdGhpcy5waGVub3R5cGUgZ2V0dGluZyByZXN0b3JlZD9cclxuICAgIHRoaXMuZ2Vub3R5cGUgPSBuZXcgR2Vub3R5cGUoIGdlbmVQb29sLCBjb21iaW5lT3B0aW9uczxHZW5vdHlwZU9wdGlvbnM+KCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZ2Vub3R5cGUnIClcclxuICAgIH0sIG9wdGlvbnMuZ2Vub3R5cGVPcHRpb25zICkgKTtcclxuXHJcbiAgICB0aGlzLnBoZW5vdHlwZSA9IG5ldyBQaGVub3R5cGUoIHRoaXMuZ2Vub3R5cGUsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdwaGVub3R5cGUnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmJ1bm55UmVzdFJhbmdlUHJvcGVydHkgPSBidW5ueVJlc3RSYW5nZVByb3BlcnR5O1xyXG4gICAgdGhpcy5yZXN0VGltZSA9IHRoaXMuYnVubnlSZXN0UmFuZ2VQcm9wZXJ0eS52YWx1ZS5taW47XHJcbiAgICB0aGlzLmN1bXVsYXRpdmVSZXN0VGltZSA9IGRvdFJhbmRvbS5uZXh0RG91YmxlSW5SYW5nZSggdGhpcy5idW5ueVJlc3RSYW5nZVByb3BlcnR5LnZhbHVlICk7XHJcbiAgICB0aGlzLmhvcFRpbWUgPSBIT1BfVElNRV9SQU5HRS5tYXg7XHJcbiAgICB0aGlzLmN1bXVsYXRpdmVIb3BUaW1lID0gMDtcclxuICAgIHRoaXMuaG9wRGVsdGEgPSBuZXcgVmVjdG9yMyggMCwgMCwgMCApO1xyXG4gICAgdGhpcy5ob3BTdGFydFBvc2l0aW9uID0gdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgIC8vIEluaXRpYWxpemUgdGhlIGZpcnN0IG1vdGlvbiBjeWNsZS5cclxuICAgIHRoaXMuaW5pdGlhbGl6ZU1vdGlvbigpO1xyXG5cclxuICAgIHRoaXMuZGllZEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgdGhpcy5kaXNwb3NlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG5cclxuICAgIC8vIFdoZW4gdGhlIGZhdGhlciBvciBtb3RoZXIgaXMgZGlzcG9zZWQsIHNldCB0aGVtIHRvIG51bGwgdG8gZnJlZSBtZW1vcnkuXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL25hdHVyYWwtc2VsZWN0aW9uL2lzc3Vlcy8xMTJcclxuICAgIGNvbnN0IGZhdGhlckRpc3Bvc2VkTGlzdGVuZXIgPSAoKSA9PiB7XHJcbiAgICAgIGlmICggdGhpcy5mYXRoZXIgKSB7XHJcbiAgICAgICAgdGhpcy5mYXRoZXIuZGlzcG9zZWRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCBmYXRoZXJEaXNwb3NlZExpc3RlbmVyICk7XHJcbiAgICAgICAgdGhpcy5mYXRoZXIgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhpcy5mYXRoZXIgJiYgdGhpcy5mYXRoZXIuZGlzcG9zZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBmYXRoZXJEaXNwb3NlZExpc3RlbmVyICk7XHJcblxyXG4gICAgY29uc3QgbW90aGVyRGlzcG9zZWRMaXN0ZW5lciA9ICgpID0+IHtcclxuICAgICAgaWYgKCB0aGlzLm1vdGhlciApIHtcclxuICAgICAgICB0aGlzLm1vdGhlci5kaXNwb3NlZEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIG1vdGhlckRpc3Bvc2VkTGlzdGVuZXIgKTtcclxuICAgICAgICB0aGlzLm1vdGhlciA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aGlzLm1vdGhlciAmJiB0aGlzLm1vdGhlci5kaXNwb3NlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIG1vdGhlckRpc3Bvc2VkTGlzdGVuZXIgKTtcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2VCdW5ueSA9ICgpID0+IHtcclxuICAgICAgdGhpcy5nZW5vdHlwZS5kaXNwb3NlKCk7XHJcbiAgICAgIHRoaXMucGhlbm90eXBlLmRpc3Bvc2UoKTtcclxuXHJcbiAgICAgIC8vIGRpZWRFbWl0dGVyIGlzIGRpc3Bvc2VkIGFmdGVyIGl0IGZpcmVzLCBzbyBkb24ndCBkbyBkaXNwb3NlIGFnYWluIGlmIHRoZSBidW5ueSBpcyBhbHJlYWR5IGRlYWQuXHJcbiAgICAgIGlmICggIXRoaXMuZGllZEVtaXR0ZXIuaXNEaXNwb3NlZCApIHtcclxuICAgICAgICB0aGlzLmRpZWRFbWl0dGVyLmRpc3Bvc2UoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCB0aGlzLmZhdGhlciAmJiB0aGlzLmZhdGhlci5kaXNwb3NlZEVtaXR0ZXIuaGFzTGlzdGVuZXIoIGZhdGhlckRpc3Bvc2VkTGlzdGVuZXIgKSApIHtcclxuICAgICAgICB0aGlzLmZhdGhlci5kaXNwb3NlZEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIGZhdGhlckRpc3Bvc2VkTGlzdGVuZXIgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIHRoaXMubW90aGVyICYmIHRoaXMubW90aGVyLmRpc3Bvc2VkRW1pdHRlci5oYXNMaXN0ZW5lciggbW90aGVyRGlzcG9zZWRMaXN0ZW5lciApICkge1xyXG4gICAgICAgIHRoaXMubW90aGVyLmRpc3Bvc2VkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggbW90aGVyRGlzcG9zZWRMaXN0ZW5lciApO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pc0Rpc3Bvc2VkLCAnYnVubnkgaXMgYWxyZWFkeSBkaXNwb3NlZCcgKTtcclxuICAgIHRoaXMuZGlzcG9zZUJ1bm55KCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLmRpc3Bvc2VkRW1pdHRlci5lbWl0KCk7XHJcbiAgICB0aGlzLmRpc3Bvc2VkRW1pdHRlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBLaWxscyB0aGlzIGJ1bm55LCBmb3JldmVyIGFuZCBldmVyLiAoVGhpcyBzaW0gZG9lcyBub3Qgc3VwcG9ydCByZWluY2FybmF0aW9uIG9yIG90aGVyIGZvcm1zIG9mICdwb29saW5nJyA6KVxyXG4gICAqL1xyXG4gIHB1YmxpYyBkaWUoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzQWxpdmUsICdidW5ueSBpcyBhbHJlYWR5IGRlYWQnICk7XHJcbiAgICB0aGlzLmlzQWxpdmUgPSBmYWxzZTtcclxuICAgIHRoaXMuZGllZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgdGhpcy5kaWVkRW1pdHRlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb3ZlcyB0aGUgQnVubnkgYXJvdW5kLiBUaGlzIGlzIHRoZSBtb3Rpb24gY3ljbGUgZm9yIGEgYnVubnkuIEVhY2ggYnVubnkgcmVzdHMsIGhvcHMsIHJlc3RzLCBob3BzLCAuLi5cclxuICAgKiBAcGFyYW0gZHQgLSB0aW1lIHN0ZXAsIGluIHNlY29uZHNcclxuICAgKi9cclxuICBwdWJsaWMgbW92ZSggZHQ6IG51bWJlciApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNBbGl2ZSwgJ2RlYWQgYnVubnkgY2Fubm90IG1vdmUnICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLmN1bXVsYXRpdmVSZXN0VGltZSA8IHRoaXMucmVzdFRpbWUgKSB7XHJcblxyXG4gICAgICAvLyBUaGUgYnVubnkgaXMgcmVzdGluZy5cclxuICAgICAgdGhpcy5jdW11bGF0aXZlUmVzdFRpbWUgKz0gZHQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5jdW11bGF0aXZlSG9wVGltZSA8IHRoaXMuaG9wVGltZSApIHtcclxuXHJcbiAgICAgIC8vIERvIHBhcnQgb2YgdGhlIGhvcCBjeWNsZS5cclxuICAgICAgdGhpcy5ob3AoIGR0ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIFdoZW4gd2UndmUgY29tcGxldGVkIGEgbW90aW9uIGN5Y2xlLCBpbml0aWFsaXplIHRoZSBuZXh0IGN5Y2xlLlxyXG4gICAgICB0aGlzLmluaXRpYWxpemVNb3Rpb24oKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEluaXRpYWxpemVzIHRoZSBuZXh0IG1vdGlvbiBjeWNsZS4gQSBidW5ueSB3aWxsIGNvbnRpbnVlIHRvIGhvcCB1bnRpbCBpdCBnZXRzIHRvIHRoZSBlZGdlIG9mIHRoZSBzY3JlZW4uXHJcbiAgICogVGhlbiBpdCByZXZlcnNlcyBkaXJlY3Rpb24uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBpbml0aWFsaXplTW90aW9uKCk6IHZvaWQge1xyXG5cclxuICAgIC8vIFZlcmlmeSB0aGF0IHRoZSBidW5ueSBpcyBpbiB6IGJvdW5kcy5cclxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbmF0dXJhbC1zZWxlY3Rpb24vaXNzdWVzLzEzMVxyXG4gICAgY29uc3QgY3VycmVudFogPSB0aGlzLnBvc2l0aW9uUHJvcGVydHkudmFsdWUuejtcclxuICAgIGNvbnN0IG1pblogPSB0aGlzLmdldE1pbmltdW1aKCk7XHJcbiAgICBjb25zdCBtYXhaID0gdGhpcy5nZXRNYXhpbXVtWigpO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY3VycmVudFogPj0gbWluWiB8fCBjdXJyZW50WiA8PSBtYXhaLFxyXG4gICAgICBgYnVubnkgaXMgb3V0IG9mIHogYm91bmRzOiB6PSR7Y3VycmVudFp9LCBtaW5aPSR7bWluWn0sIG1heFo9JHttYXhafWAgKTtcclxuXHJcbiAgICAvLyBWZXJpZnkgdGhhdCB0aGUgYnVubnkgaXMgJ3JlYXNvbmFibHknIGluIHggYm91bmRzLiBUaGUgbW9kZWxWaWV3VHJhbnNmb3JtIGlzIGEgdHJhcGV6b2lkLCB3aGVyZSB4IHJhbmdlIGRlcGVuZHNcclxuICAgIC8vIG9uIHogY29vcmRpbmF0ZS4gU28gYSBidW5ueSBtYXkgYmUgc2xpZ2h0bHkgb3V0c2lkZSBvZiB0aGlzIHRyYXBlem9pZC4gV2UgZGVjaWRlZCB0aGF0J3MgT0ssIGFuZCBpdCBkb2Vzbid0XHJcbiAgICAvLyBuZWdhdGl2ZWx5IGltcGFjdCB0aGUgbGVhcm5pbmcgZ29hbHMuIFRoZSBhc3NlcnRpb24gYmVsb3cgZGV0ZWN0cyBib3VuZHMgY29uZGl0aW9ucyBhcmUgbm90ICdyZWFzb25hYmxlJy5cclxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbmF0dXJhbC1zZWxlY3Rpb24vaXNzdWVzLzEzMVxyXG4gICAgY29uc3QgY3VycmVudFggPSB0aGlzLnBvc2l0aW9uUHJvcGVydHkudmFsdWUueDtcclxuICAgIGNvbnN0IG1pblggPSB0aGlzLmdldE1pbmltdW1YKCkgKyBYX01BUkdJTjtcclxuICAgIGNvbnN0IG1heFggPSB0aGlzLmdldE1heGltdW1YKCkgLSBYX01BUkdJTjtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGN1cnJlbnRYID49IG1pblggLSBIT1BfRElTVEFOQ0VfUkFOR0UubWF4IHx8IGN1cnJlbnRYIDw9IG1heFggKyBIT1BfRElTVEFOQ0VfUkFOR0UubWF4LFxyXG4gICAgICBgYnVubnkgaXMgd2F5IG91dCBvZiB4IGJvdW5kczogeD0ke2N1cnJlbnRYfSwgbWluWD0ke21pblh9LCBtYXhYPSR7bWF4WH1gICk7XHJcblxyXG4gICAgLy8gUmVjb3JkIHRoZSBwb3NpdGlvbiBhdCB0aGUgc3RhcnQgb2YgdGhlIGhvcC5cclxuICAgIHRoaXMuaG9wU3RhcnRQb3NpdGlvbiA9IHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAvLyBaZXJvIG91dCBjdW11bGF0aXZlIHRpbWVzXHJcbiAgICB0aGlzLmN1bXVsYXRpdmVSZXN0VGltZSA9IDA7XHJcbiAgICB0aGlzLmN1bXVsYXRpdmVIb3BUaW1lID0gMDtcclxuXHJcbiAgICAvLyBSYW5kb21pemUgbW90aW9uIGZvciB0aGUgbmV4dCBjeWNsZVxyXG4gICAgdGhpcy5yZXN0VGltZSA9IGRvdFJhbmRvbS5uZXh0RG91YmxlSW5SYW5nZSggdGhpcy5idW5ueVJlc3RSYW5nZVByb3BlcnR5LnZhbHVlICk7XHJcbiAgICB0aGlzLmhvcFRpbWUgPSBkb3RSYW5kb20ubmV4dERvdWJsZUluUmFuZ2UoIEhPUF9USU1FX1JBTkdFICk7XHJcbiAgICBjb25zdCBob3BEaXN0YW5jZSA9IGRvdFJhbmRvbS5uZXh0RG91YmxlSW5SYW5nZSggSE9QX0RJU1RBTkNFX1JBTkdFICk7XHJcbiAgICBjb25zdCBob3BIZWlnaHQgPSBkb3RSYW5kb20ubmV4dERvdWJsZUluUmFuZ2UoIEhPUF9IRUlHSFRfUkFOR0UgKTtcclxuXHJcbiAgICAvLyBHZXQgbW90aW9uIGRlbHRhIGZvciB0aGUgbmV4dCBjeWNsZVxyXG4gICAgdGhpcy5ob3BEZWx0YSA9IGdldEhvcERlbHRhKCBob3BEaXN0YW5jZSwgaG9wSGVpZ2h0LCB0aGlzLnhEaXJlY3Rpb25Qcm9wZXJ0eS52YWx1ZSApO1xyXG5cclxuICAgIC8vIElmIHRoZSBob3Agd2lsbCBleGNlZWQgeiBib3VuZGFyaWVzLCByZXZlcnNlIGRlbHRhIHouICBEbyB0aGlzIGJlZm9yZSBjaGVja2luZyB4LCBiZWNhdXNlIHRoZSByYW5nZSBvZlxyXG4gICAgLy8geCBkZXBlbmRzIG9uIHRoZSB2YWx1ZSBvZiB6LlxyXG4gICAgbGV0IGhvcEVuZFogPSB0aGlzLmhvcFN0YXJ0UG9zaXRpb24ueiArIHRoaXMuaG9wRGVsdGEuejtcclxuICAgIGlmICggaG9wRW5kWiA8IG1pblogfHwgaG9wRW5kWiA+IG1heFogKSB7XHJcbiAgICAgIHRoaXMuaG9wRGVsdGEuc2V0WiggLXRoaXMuaG9wRGVsdGEueiApO1xyXG4gICAgICBob3BFbmRaID0gdGhpcy5ob3BTdGFydFBvc2l0aW9uLnogKyB0aGlzLmhvcERlbHRhLno7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWZ0ZXIgY2hlY2tpbmcgeiwgbm93IHdlIGNhbiBjaGVjayB4LiBJZiB0aGUgaG9wIHdpbGwgZXhjZWVkIHggYm91bmRhcmllcywgcG9pbnQgdGhlIGJ1bm55IGluIHRoZSBjb3JyZWN0XHJcbiAgICAvLyBkaXJlY3Rpb24uIE5vdGUgdGhhdCB0aGlzIGlzIG5vdCBhIG1hdHRlciBvZiBzaW1wbHkgZmxpcHBpbmcgdGhlIHNpZ24gb2YgaG9wRGVsdGEueCwgYmVjYXVzZSB0aGUgcmFuZ2Ugb2ZcclxuICAgIC8vIHggaXMgYmFzZWQgb24gei4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9uYXR1cmFsLXNlbGVjdGlvbi9pc3N1ZXMvMTMxXHJcbiAgICBjb25zdCBob3BFbmRYID0gdGhpcy5ob3BTdGFydFBvc2l0aW9uLnggKyB0aGlzLmhvcERlbHRhLng7XHJcbiAgICBjb25zdCBlbmRNaW5YID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0uZ2V0TWluaW11bVgoIGhvcEVuZFogKSArIFhfTUFSR0lOO1xyXG4gICAgY29uc3QgZW5kTWF4WCA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLmdldE1heGltdW1YKCBob3BFbmRaICkgLSBYX01BUkdJTjtcclxuICAgIGlmICggaG9wRW5kWCA8IGVuZE1pblggKSB7XHJcbiAgICAgIHRoaXMuaG9wRGVsdGEuc2V0WCggTWF0aC5hYnMoIHRoaXMuaG9wRGVsdGEueCApICk7IC8vIG1vdmUgdG8gdGhlIHJpZ2h0XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggaG9wRW5kWCA+IGVuZE1heFggKSB7XHJcbiAgICAgIHRoaXMuaG9wRGVsdGEuc2V0WCggLU1hdGguYWJzKCB0aGlzLmhvcERlbHRhLnggKSApOyAvLyBtb3ZlIHRvIHRoZSBsZWZ0XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWRqdXN0IHRoZSB4IGRpcmVjdGlvbiB0byBtYXRjaCB0aGUgaG9wIGRlbHRhIHhcclxuICAgIHRoaXMueERpcmVjdGlvblByb3BlcnR5LnZhbHVlID0gKCB0aGlzLmhvcERlbHRhLnggPj0gMCApID8gWERpcmVjdGlvbi5SSUdIVCA6IFhEaXJlY3Rpb24uTEVGVDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBlcmZvcm1zIHBhcnQgb2YgYSBob3AgY3ljbGUuXHJcbiAgICogQHBhcmFtIGR0IC0gdGltZSBzdGVwLCBpbiBzZWNvbmRzXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBob3AoIGR0OiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmN1bXVsYXRpdmVIb3BUaW1lIDwgdGhpcy5ob3BUaW1lLCAnaG9wIHNob3VsZCBub3QgaGF2ZSBiZWVuIGNhbGxlZCcgKTtcclxuXHJcbiAgICB0aGlzLmN1bXVsYXRpdmVIb3BUaW1lICs9IGR0O1xyXG5cclxuICAgIC8vIFBvcnRpb24gb2YgdGhlIGhvcCBjeWNsZSB0byBkby4gRG9uJ3QgZG8gbW9yZSB0aGFuIDEgaG9wIGN5Y2xlLlxyXG4gICAgY29uc3QgaG9wRnJhY3Rpb24gPSBNYXRoLm1pbiggMSwgdGhpcy5jdW11bGF0aXZlSG9wVGltZSAvIHRoaXMuaG9wVGltZSApO1xyXG5cclxuICAgIC8vIHggYW5kIHogY29tcG9uZW50cyBvZiB0aGUgaG9wLlxyXG4gICAgY29uc3QgeCA9IHRoaXMuaG9wU3RhcnRQb3NpdGlvbi54ICsgKCBob3BGcmFjdGlvbiAqIHRoaXMuaG9wRGVsdGEueCApO1xyXG4gICAgY29uc3QgeiA9IHRoaXMuaG9wU3RhcnRQb3NpdGlvbi56ICsgKCBob3BGcmFjdGlvbiAqIHRoaXMuaG9wRGVsdGEueiApO1xyXG5cclxuICAgIC8vIEhvcCBoZWlnaHQgKHkpIGZvbGxvd3MgYSBxdWFkcmF0aWMgYXJjLlxyXG4gICAgY29uc3QgeUFib3ZlR3JvdW5kID0gdGhpcy5ob3BEZWx0YS55ICogMiAqICggLSggaG9wRnJhY3Rpb24gKiBob3BGcmFjdGlvbiApICsgaG9wRnJhY3Rpb24gKTtcclxuICAgIGNvbnN0IHkgPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5nZXRHcm91bmRZKCB6ICkgKyB5QWJvdmVHcm91bmQ7XHJcblxyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gbmV3IFZlY3RvcjMoIHgsIHksIHogKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEludGVycnVwdHMgYSBidW5ueSdzIGhvcCwgYW5kIG1vdmVzIGl0IGltbWVkaWF0ZWx5IHRvIHRoZSBncm91bmQuIFRoaXMgaXMgdXNlZCB0byBwcmV2ZW50IGJ1bm5pZXMgZnJvbSBiZWluZ1xyXG4gICAqIHN0dWNrIHVwIGluIHRoZSBhaXIgbWlkLWhvcCB3aGVuIHRoZSBzaW11bGF0aW9uIGVuZHMuXHJcbiAgICovXHJcbiAgcHVibGljIGludGVycnVwdEhvcCgpOiB2b2lkIHtcclxuXHJcbiAgICAvLyBtb3ZlIGJ1bm55IHRvIHRoZSBncm91bmRcclxuICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlO1xyXG4gICAgY29uc3QgeSA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLmdldEdyb3VuZFkoIHBvc2l0aW9uLnogKTtcclxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IG5ldyBWZWN0b3IzKCBwb3NpdGlvbi54LCB5LCBwb3NpdGlvbi56ICk7XHJcblxyXG4gICAgLy8gaW5pdGlhbGl6YXRpb24gdGhlIG5leHQgbW90aW9uIGN5Y2xlXHJcbiAgICB0aGlzLmluaXRpYWxpemVNb3Rpb24oKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIElzIHRoaXMgYnVubnkgYW4gJ29yaWdpbmFsIG11dGFudCc/IEFuIG9yaWdpbmFsIG11dGFudCBpcyBhIGJ1bm55IGluIHdoaWNoIHRoZSBtdXRhdGlvbiBmaXJzdCBvY2N1cnJlZC5cclxuICAgKiBUaGVzZSBidW5uaWVzIGFyZSBsYWJlbGVkIHdpdGggYSBtdXRhdGlvbiBpY29uIGluIHRoZSBQZWRpZ3JlZSBncmFwaC5cclxuICAgKi9cclxuICBwdWJsaWMgaXNPcmlnaW5hbE11dGFudCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiAhIXRoaXMuZ2Vub3R5cGUubXV0YXRpb247XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0cyBCdW5ueSB0byBhIHN0cmluZy4gVGhpcyBpcyBpbnRlbmRlZCBmb3IgZGVidWdnaW5nIG9ubHkuIERvIG5vdCByZWx5IG9uIHRoZSBmb3JtYXQgb2YgdGhpcyBzdHJpbmchXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gYCR7dGhpcy50YW5kZW0ubmFtZX0sIGAgK1xyXG4gICAgICAgICAgIGBnZW5lcmF0aW9uPSR7dGhpcy5nZW5lcmF0aW9ufSwgYCArXHJcbiAgICAgICAgICAgYGFnZT0ke3RoaXMuYWdlfSwgYCArXHJcbiAgICAgICAgICAgYGlzQWxpdmU9JHt0aGlzLmlzQWxpdmV9LCBgICtcclxuICAgICAgICAgICBgZ2Vub3R5cGU9JyR7dGhpcy5nZW5vdHlwZS50b0FiYnJldmlhdGlvbigpfScsIGAgK1xyXG4gICAgICAgICAgIGBmYXRoZXI9JHt0aGlzLmZhdGhlciA/IHRoaXMuZmF0aGVyLnRhbmRlbS5uYW1lIDogbnVsbH0sIGAgK1xyXG4gICAgICAgICAgIGBtb3RoZXI9JHt0aGlzLm1vdGhlciA/IHRoaXMubW90aGVyLnRhbmRlbS5uYW1lIDogbnVsbH0sIGAgK1xyXG4gICAgICAgICAgIGBpc09yaWdpbmFsTXV0YW50PSR7dGhpcy5pc09yaWdpbmFsTXV0YW50KCl9YDtcclxuICB9XHJcblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBCZWxvdyBoZXJlIGFyZSBtZXRob2RzIHVzZWQgYnkgQnVubnlJTyB0byBzZXJpYWxpemUgUGhFVC1pTyBzdGF0ZS5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBtYXAgb2Ygc3RhdGUga2V5cyBhbmQgdGhlaXIgYXNzb2NpYXRlZCBJT1R5cGVzLCBzZWUgSU9UeXBlIGZvciBkZXRhaWxzLlxyXG4gICAqIFdlIG5lZWQgdG8gdXNlIGEgZnVuY3Rpb24gYmVjYXVzZSB0aGUgc3RhdGUgc2NoZW1hIHJlY3Vyc2l2ZSByZWZlcmVuY2VzIEJ1bm55SU8uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0U3RhdGVTY2hlbWEoIEJ1bm55SU86IElPVHlwZSApOiBDb21wb3NpdGVTY2hlbWEge1xyXG4gICAgcmV0dXJuIHtcclxuXHJcbiAgICAgIC8vIEV2ZW4gdGhvdWdoIGZhdGhlciBhbmQgbW90aGVyIGFyZSBzdGF0ZWZ1bCwgd2UgbmVlZCBhIHJlZmVyZW5jZSB0byB0aGVtLlxyXG4gICAgICBmYXRoZXI6IE51bGxhYmxlSU8oIFJlZmVyZW5jZUlPKCBCdW5ueUlPICkgKSxcclxuICAgICAgbW90aGVyOiBOdWxsYWJsZUlPKCBSZWZlcmVuY2VJTyggQnVubnlJTyApICksXHJcbiAgICAgIGdlbmVyYXRpb246IE51bWJlcklPLFxyXG4gICAgICBpc0FsaXZlOiBCb29sZWFuSU8sXHJcbiAgICAgIGFnZTogTnVtYmVySU8sXHJcblxyXG4gICAgICAvLyBnZW5vdHlwZSBhbmQgcGhlbm90eXBlIGFyZSBzdGF0ZWZ1bCBhbmQgd2lsbCBiZSBzZXJpYWxpemVkIGF1dG9tYXRpY2FsbHkuXHJcblxyXG4gICAgICAvLyBwcml2YXRlIGZpZWxkcywgd2lsbCBub3QgYmUgc2hvd24gaW4gU3R1ZGlvXHJcbiAgICAgIF9yZXN0VGltZTogTnVtYmVySU8sXHJcbiAgICAgIF9ob3BUaW1lOiBOdW1iZXJJTyxcclxuICAgICAgX2N1bXVsYXRpdmVSZXN0VGltZTogTnVtYmVySU8sXHJcbiAgICAgIF9jdW11bGF0aXZlSG9wVGltZTogTnVtYmVySU8sXHJcbiAgICAgIF9ob3BEZWx0YTogVmVjdG9yMy5WZWN0b3IzSU8sXHJcbiAgICAgIF9ob3BTdGFydFBvc2l0aW9uOiBWZWN0b3IzLlZlY3RvcjNJT1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vVE9ETyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbmF0dXJhbC1zZWxlY3Rpb24vaXNzdWVzLzMyNyBuZWVkIHRvIHJlc3RvcmUgd2hhdCB3ZSBjYW4gdmlhIGNvbnN0cnVjdG9yXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyB0aGUgYXJndW1lbnRzIHRoYXQgQnVubnlHcm91cC5jcmVhdGVFbGVtZW50IHVzZXMgdG8gY3JlYXRlIGEgQnVubnkuXHJcbiAgICogV2hpbGUgd2UgY291bGQgcmVzdG9yZSBhIGZldyB0aGluZ3MgdmlhIHRoZSBjb25zdHJ1Y3Rvciwgd2UncmUgZ29pbmcgdG8gaW5zdGFudGlhdGUgd2l0aCBkZWZhdWx0c1xyXG4gICAqIGFuZCByZXN0b3JlIGV2ZXJ5dGhpbmcgdmlhIGFwcGx5U3RhdGUuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzdGF0aWMgc3RhdGVPYmplY3RUb0NyZWF0ZUVsZW1lbnRBcmd1bWVudHMoIHN0YXRlT2JqZWN0OiBCdW5ueVN0YXRlT2JqZWN0ICk6IEJ1bm55R3JvdXBDcmVhdGVFbGVtZW50QXJndW1lbnRzIHtcclxuICAgIHJldHVybiBbIHt9IF07XHJcbiAgfVxyXG5cclxuICAvL1RPRE8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL25hdHVyYWwtc2VsZWN0aW9uL2lzc3Vlcy8zMjcgZG9lcyBkZWZhdWx0QXBwbHlTdGF0ZSB3b3JrIGhlcmU/IHdoeT9cclxuICAvKipcclxuICAgKiBSZXN0b3JlcyBCdW5ueSBzdGF0ZSBhZnRlciBpbnN0YW50aWF0aW9uLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgYXBwbHlTdGF0ZSggc3RhdGVPYmplY3Q6IEJ1bm55U3RhdGVPYmplY3QgKTogdm9pZCB7XHJcbiAgICBCdW5ueS5CdW5ueUlPLnN0YXRlU2NoZW1hLmRlZmF1bHRBcHBseVN0YXRlKCB0aGlzLCBzdGF0ZU9iamVjdCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQnVubnlJTyBoYW5kbGVzIFBoRVQtaU8gc2VyaWFsaXphdGlvbiBvZiBCdW5ueS5cclxuICAgKiBJdCBpbXBsZW1lbnRzICdEeW5hbWljIGVsZW1lbnQgc2VyaWFsaXphdGlvbicsIGFzIGRlc2NyaWJlZCBpbiB0aGUgU2VyaWFsaXphdGlvbiBzZWN0aW9uIG9mXHJcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8vYmxvYi9tYXN0ZXIvZG9jL3BoZXQtaW8taW5zdHJ1bWVudGF0aW9uLXRlY2huaWNhbC1ndWlkZS5tZCNzZXJpYWxpemF0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBCdW5ueUlPID0gbmV3IElPVHlwZSggJ0J1bm55SU8nLCB7XHJcbiAgICB2YWx1ZVR5cGU6IEJ1bm55LFxyXG4gICAgc3RhdGVTY2hlbWE6IEJ1bm55LmdldFN0YXRlU2NoZW1hLFxyXG4gICAgLy9UT0RPIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9uYXR1cmFsLXNlbGVjdGlvbi9pc3N1ZXMvMzI3IG5lZWQgdG8gaW1wbGVtZW50IGJ1bm55LnRvU3RhdGVPYmplY3QoKVxyXG4gICAgc3RhdGVPYmplY3RUb0NyZWF0ZUVsZW1lbnRBcmd1bWVudHM6IHN0YXRlT2JqZWN0ID0+IEJ1bm55LnN0YXRlT2JqZWN0VG9DcmVhdGVFbGVtZW50QXJndW1lbnRzKCBzdGF0ZU9iamVjdCApLFxyXG4gICAgYXBwbHlTdGF0ZTogKCBidW5ueSwgc3RhdGVPYmplY3QgKSA9PiBidW5ueS5hcHBseVN0YXRlKCBzdGF0ZU9iamVjdCApXHJcbiAgfSApO1xyXG59XHJcblxyXG4vKipcclxuICogR2V0cyB0aGUgKGR4LCBkeSwgZHopIGZvciBhIGhvcCBjeWNsZS5cclxuICogQHBhcmFtIGhvcERpc3RhbmNlIC0gbWF4aW11bSBzdHJhaWdodC1saW5lIGRpc3RhbmNlIHRoYXQgdGhlIGJ1bm55IHdpbGwgaG9wIGluIHRoZSB4eiBwbGFuZVxyXG4gKiBAcGFyYW0gaG9wSGVpZ2h0IC0gaGVpZ2h0IGFib3ZlIHRoZSBncm91bmQgdGhhdCB0aGUgYnVubnkgd2lsbCBob3BcclxuICogQHBhcmFtIHhEaXJlY3Rpb24gLSBkaXJlY3Rpb24gdGhhdCB0aGUgYnVubnkgaXMgZmFjaW5nIGFsb25nIHRoZSB4LWF4aXNcclxuICovXHJcbmZ1bmN0aW9uIGdldEhvcERlbHRhKCBob3BEaXN0YW5jZTogbnVtYmVyLCBob3BIZWlnaHQ6IG51bWJlciwgeERpcmVjdGlvbjogWERpcmVjdGlvbiApOiBWZWN0b3IzIHtcclxuXHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggaG9wSGVpZ2h0ID4gMCwgYGludmFsaWQgaG9wSGVpZ2h0OiAke2hvcEhlaWdodH1gICk7XHJcblxyXG4gIGNvbnN0IGFuZ2xlID0gZG90UmFuZG9tLm5leHREb3VibGVCZXR3ZWVuKCAwLCAyICogTWF0aC5QSSApO1xyXG5cclxuICAvLyBEbyBzb21lIGJhc2ljIHRyaWcgdG8gY29tcHV0ZSBtb3Rpb24gaW4geCBhbmQgeiBwbGFuZXNcclxuICBjb25zdCBoeXBvdGVudXNlID0gaG9wRGlzdGFuY2U7XHJcbiAgY29uc3QgYWRqYWNlbnQgPSBoeXBvdGVudXNlICogTWF0aC5jb3MoIGFuZ2xlICk7IC8vIGNvcyh0aGV0YSkgPSBhZGphY2VudC9oeXBvdGVudXNlXHJcbiAgY29uc3Qgb3Bwb3NpdGUgPSBoeXBvdGVudXNlICogTWF0aC5zaW4oIGFuZ2xlICk7IC8vIHNpbih0aGV0YSkgPSBvcHBvc2l0ZS9oeXBvdGVudXNlXHJcblxyXG4gIC8vIFdlJ2xsIHVzZSB0aGUgbGFyZ2VyIG1vdGlvbiBmb3IgZHgsIHRoZSBzbWFsbGVyIGZvciBkei5cclxuICBjb25zdCBvcHBvc2l0ZUlzTGFyZ2VyID0gKCBNYXRoLmFicyggb3Bwb3NpdGUgKSA+IE1hdGguYWJzKCBhZGphY2VudCApICk7XHJcblxyXG4gIGNvbnN0IGR4ID0gTWF0aC5hYnMoIG9wcG9zaXRlSXNMYXJnZXIgPyBvcHBvc2l0ZSA6IGFkamFjZW50ICkgKiBYRGlyZWN0aW9uLnRvU2lnbiggeERpcmVjdGlvbiApO1xyXG4gIGNvbnN0IGR5ID0gaG9wSGVpZ2h0O1xyXG4gIGNvbnN0IGR6ID0gKCBvcHBvc2l0ZUlzTGFyZ2VyID8gYWRqYWNlbnQgOiBvcHBvc2l0ZSApO1xyXG4gIHJldHVybiBuZXcgVmVjdG9yMyggZHgsIGR5LCBkeiApO1xyXG59XHJcblxyXG5uYXR1cmFsU2VsZWN0aW9uLnJlZ2lzdGVyKCAnQnVubnknLCBCdW5ueSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLGdDQUFnQztBQUVwRCxPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsT0FBTyxNQUE4QiwrQkFBK0I7QUFDM0UsT0FBT0MsU0FBUyxJQUFJQyxjQUFjLFFBQVEsdUNBQXVDO0FBR2pGLE9BQU9DLFNB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