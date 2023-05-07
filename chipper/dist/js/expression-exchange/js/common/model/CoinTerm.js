// Copyright 2016-2022, University of Colorado Boulder

/**
 * This type represents a model of a single or combined coin which can be represented in the view as a coin image or a
 * mathematical term.  A 'combined' coin is one where other matching coins have been combined with this one, kind of
 * like a stack of coins, though they are not represented in the view as a stack.  A 'term' refers to a mathematical
 * term, like xy or x squared.
 *
 * @author John Blanco
 */

import Emitter from '../../../../axon/js/Emitter.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import merge from '../../../../phet-core/js/merge.js';
import Easing from '../../../../twixt/js/Easing.js';
import expressionExchange from '../../expressionExchange.js';
import EESharedConstants from '../EESharedConstants.js';
import CoinTermTypeID from '../enum/CoinTermTypeID.js';
import AnimationSpec from './AnimationSpec.js';

// constants
const COIN_TERM_FADE_TIME = 0.75; // in seconds
const CLOSE_ENOUGH_TO_HOME = 1E-6; // distance at which a coin term is considered to have returned to origin
const CARD_PRE_FADE_TIME = 0.25; // time before card starts to fade after user grabs it, in seconds
const CARD_FADE_TIME = 0.5; // time for a card to fade out
const MAX_ANIMATION_TIME = 1; // max time for an animation to complete

// class var for creating unique IDs
let creationCount = 0;
class CoinTerm {
  /**
   * @param {Property.<number>} valueProperty - value of the coin term wrapped in a property
   * @param {number} coinRadius - radius of the coin portion of the coin term, in view coordinates
   * @param {string} termText - textual representation, e.g. 'x', must be compatible with SubSupText
   * @param {Property.<string>} termValueStringProperty
   * @param {CoinTermTypeID} typeID - type identifier for this coin term
   * @param {Object} [options]
   */
  constructor(valueProperty, coinRadius, termText, termValueStringProperty, typeID, options) {
    this.id = `CT-${++creationCount}`; // @public (read-only) - unique ID useful for debugging

    options = merge({
      initialCount: 1,
      // number of instances of this coin term initially combined together, can be negative
      initialPosition: Vector2.ZERO,
      initiallyOnCard: false,
      // flag that controls whether this can be broken down below its initial count, only looked at if the absolute
      // value of the initial count is greater than one
      decomposable: true
    }, options);

    //------------------------------------------------------------------------
    // properties
    //------------------------------------------------------------------------

    // @public (read-only) - set using methods below
    this.positionProperty = new Vector2Property(options.initialPosition);

    // @public (read-only) - set using methods below
    this.destinationProperty = new Vector2Property(options.initialPosition);

    // @public {Property.<boolean>} - indicate whether user is currently dragging this coin
    this.userControlledProperty = new Property(false);

    // @public {Property.<boolean>}
    this.combineHaloActiveProperty = new Property(false);

    // @public {Property.<boolean>} - supports showing subtraction in expressions
    this.showMinusSignWhenNegativeProperty = new Property(true);

    // @public {Property.<boolean>, indicates whether this is in a collection box (for game)
    this.collectedProperty = new Property(false);

    // @public (read-only) {Property.<AnimationSpec|null>} - tracks the current in-progress animation, null if none
    this.inProgressAnimationProperty = new Property(null);

    // @public (read-only) {Property.<number>} - total number of coins/terms combined into this one, can be negative
    this.totalCountProperty = new Property(options.initialCount);

    // @public {Property.<boolean> - flag that controls whether breaking apart is allowed
    this.breakApartAllowedProperty = new Property(true);

    // @public (read-only) {Property.<Bounds2> - The bounds of this model element's view representation relative to the
    // element's current position. This admittedly breaks the usual model-view rules, but many things in the view need
    // to know this, so having it available on the model element after being set by the view worked out to be the best
    // approach.
    this.localViewBoundsProperty = new Property(null);

    // @public (read-only) {Property.<number>} - ranges from 1 to 0, used primarily for fading out of a coin term when
    // cancellation occurs, once set to any value less than 1 it will automatically fade to 0
    this.existenceStrengthProperty = new Property(1);

    // @public {Property.<number>} - determines the opacity of the card on which the coin term can reside
    this.cardOpacityProperty = new Property(options.initiallyOnCard ? 1 : 0);

    // @public {Property.<number>} - used by view to make the coin terms appear smaller if necessary when put in
    // collection areas (game only)
    this.scaleProperty = new Property(1);

    // @public {Property.<Expression|null>} - expression of which this coin term is a part, which is null for a 'solo'
    // coin term.
    this.expressionProperty = new Property(null);

    //------------------------------------------------------------------------
    // non-property attributes
    //------------------------------------------------------------------------

    // @public (read-only) - values that describe the nature of this coin term
    this.typeID = typeID;
    this.valueProperty = valueProperty;
    this.termText = termText;
    this.coinRadius = coinRadius;
    this.initiallyOnCard = options.initiallyOnCard;

    // @public (read-only) - indicates that the value will never change, will be displayed differently in the view
    this.isConstant = typeID === CoinTermTypeID.CONSTANT;

    // @public (read-only) - a property which contains the text that should be shown when displaying term value
    this.termValueStringProperty = termValueStringProperty;

    // @public (read-only) {Array.<number>} - tracks what this coin term is composed of and what it can be broken down into
    this.composition = [];
    if (Math.abs(options.initialCount) > 1 && options.decomposable) {
      _.times(Math.abs(options.initialCount), () => {
        this.composition.push(options.initialCount > 0 ? 1 : -1);
      });
    } else {
      this.composition.push(options.initialCount);
    }

    // @private {number|null} - countdown timers for fading out the card background
    this.cardPreFadeCountdown = null;
    this.cardFadeCountdown = null;

    //------------------------------------------------------------------------
    // emitters
    //------------------------------------------------------------------------

    // @public (read-only) {Emitter} - emits an event when an animation finishes and the destination is reached
    this.destinationReachedEmitter = new Emitter();

    // @public (read-only) {Emitter} - emits an event when coin terms returns to original position and is not user controlled
    this.returnedToOriginEmitter = new Emitter();

    // @public (read-only) {Emitter} - emits an event when this coin term should be broken apart
    this.breakApartEmitter = new Emitter();

    // @private {Vector2} - used when animating back to original position
    this.initialPosition = options.initialPosition;

    //------------------------------------------------------------------------
    // listeners to own properties
    //------------------------------------------------------------------------

    this.userControlledProperty.link(uc => {
      phet.log && phet.log(`coin term ${this.id} uc changed to: ${uc}`);
    });

    // monitor the total count, start fading the existence strength if it goes to zero
    this.totalCountProperty.lazyLink(totalCount => {
      if (totalCount === 0) {
        // initiate the fade out by setting the existence strength to a value just less than 1
        this.existenceStrengthProperty.set(0.9999);
      }
    });
    this.collectedProperty.link(collected => {
      // set the flag that is used to disable breaking apart whenever this coin term is captured in a collection area
      this.breakApartAllowedProperty.set(!collected);
    });

    // update the appearance of the background card as the user interacts with this coin term
    this.userControlledProperty.lazyLink(userControlled => {
      if (options.initiallyOnCard) {
        if (userControlled) {
          // If this coin term is decomposed as far as it can go, show the background card when the user grabs it, but
          // fade it out after a little while.
          if (this.composition.length === 1) {
            this.cardOpacityProperty.set(1);
            this.cardPreFadeCountdown = CARD_PRE_FADE_TIME;
            this.cardFadeCountdown = null;
          }
        } else if (this.cardOpacityProperty.get() !== 0) {
          this.cardOpacityProperty.set(0); // the card is not visible if not controlled by the user
          this.cardPreFadeCountdown = null;
          this.cardFadeCountdown = null;
        }
      }
    });
  }

  /**
   * step function, used for animations
   * @param {number} dt - delta time, in seconds
   * @public
   */
  step(dt) {
    // if there is an animation in progress, step it
    const animation = this.inProgressAnimationProperty.get();
    if (animation) {
      animation.timeSoFar += dt;
      if (animation.timeSoFar < animation.totalDuration) {
        // not there yet - take a step towards the destination
        const proportionCompleted = animation.timeSoFar / animation.totalDuration;
        const easingProportion = Easing.CUBIC_IN_OUT.value(proportionCompleted);
        this.positionProperty.set(animation.startPosition.plus(animation.travelVector.withMagnitude(animation.travelVector.magnitude * easingProportion)));
      } else {
        // destination reached, end the animation
        this.positionProperty.set(this.destinationProperty.get());
        this.inProgressAnimationProperty.set(null);
        this.destinationReachedEmitter.emit();
      }
    }

    // if this coin term is fading out, continue the fade
    if (this.isFadingOut()) {
      this.existenceStrengthProperty.set(Math.max(this.existenceStrengthProperty.get() - dt / COIN_TERM_FADE_TIME, 0));
    }

    // if the background card is visible, step its fade sequence
    if (this.cardPreFadeCountdown !== null) {
      this.cardPreFadeCountdown = Math.max(this.cardPreFadeCountdown - dt, 0);
      if (this.cardPreFadeCountdown === 0) {
        // pre-fade complete, start fade
        this.cardPreFadeCountdown = null;
        this.cardFadeCountdown = CARD_FADE_TIME;
      }
    } else if (this.cardFadeCountdown !== null) {
      this.cardFadeCountdown = Math.max(this.cardFadeCountdown - dt, 0);
      this.cardOpacityProperty.set(this.cardFadeCountdown / CARD_FADE_TIME);
      if (this.cardFadeCountdown === 0) {
        // fade complete
        this.cardFadeCountdown = null;
      }
    }

    // if this coin term has returned to its origin, emit an event to trigger removal
    if (this.positionProperty.get().distance(this.initialPosition) < CLOSE_ENOUGH_TO_HOME && !this.userControlledProperty.get()) {
      this.returnedToOriginEmitter.emit();
    }
  }

  /**
   * move to the specified destination, but do so a step at a time rather than all at once
   * @param {Vector2} destination
   * @public
   */
  travelToDestination(destination) {
    this.destinationProperty.set(destination);
    const currentPosition = this.positionProperty.get();
    if (currentPosition.equals(destination)) {
      // The coin terms is already at the destination, no animation is required, but emit a notification in case the
      // the client needs it.
      this.destinationReachedEmitter.emit();
    } else {
      // calculate the time needed to get to the destination
      const animationDuration = Math.min(this.positionProperty.get().distance(destination) / EESharedConstants.COIN_TERM_MOVEMENT_SPEED, MAX_ANIMATION_TIME);
      this.inProgressAnimationProperty.set(new AnimationSpec(this.positionProperty.get().copy(), destination.minus(this.positionProperty.get()), animationDuration));
    }
  }

  /**
   * send this coin term back to its origin, generally used when putting a coin term back in the 'creator box'
   * @public
   */
  returnToOrigin() {
    this.travelToDestination(this.initialPosition);
  }

  /**
   * set both the position and destination in such a way that no animation is initiated
   * @param {Vector2} position
   * @public
   */
  setPositionAndDestination(position) {
    this.positionProperty.set(position);
    this.destinationProperty.set(position);
  }

  /**
   * make the coin term cancel any in progress animation and go immediately to the current destination
   * @public
   */
  goImmediatelyToDestination() {
    if (this.inProgressAnimationProperty.get()) {
      this.inProgressAnimationProperty.set(null);
    }
    this.positionProperty.set(this.destinationProperty.get());
  }

  /**
   * an alternative way to set position that uses a flag to determine whether to animate or travel instantly
   * @param {Vector2} position
   * @param {boolean} animate
   * @public
   */
  goToPosition(position, animate) {
    if (animate) {
      this.travelToDestination(position);
    } else {
      this.setPositionAndDestination(position);
    }
  }

  /**
   * absorb the provided coin term into this one
   * @param {CoinTerm} coinTermToAbsorb
   * @param {boolean} doPartialCancellation - controls whether opposite terms in the composition cancel one another
   * or are retained, for example, when combining a coin term composed of [ -1, -1 ] with one composed of [ 1 ] and
   * doPartialCancellation set to true, the result is [ -1 ], if false, it's [ 1, -1, -1 ].
   * @public
   */
  absorb(coinTermToAbsorb, doPartialCancellation) {
    assert && assert(this.typeID === coinTermToAbsorb.typeID, 'can\'t combine coin terms of different types');
    this.totalCountProperty.value += coinTermToAbsorb.totalCountProperty.value;
    if (doPartialCancellation) {
      coinTermToAbsorb.composition.forEach(minDecomposableValue => {
        const index = this.composition.indexOf(-1 * minDecomposableValue);
        if (index > -1) {
          // cancel this value from the composition of the receiving coin term
          this.composition.splice(index, 1);
        } else {
          // add this element of the incoming coin term to the receiving coin term
          this.composition.push(minDecomposableValue);
        }
      });
    } else {
      coinTermToAbsorb.composition.forEach(minDecomposableValue => {
        this.composition.push(minDecomposableValue);
      });
    }
  }

  /**
   * pull out the coin terms from which this one is composed, omitting the first one
   * @returns Array.<CoinTerm>
   * @public
   */
  extractConstituentCoinTerms() {
    const extractedCoinTerms = [];

    // create a coin term to reflect each one from which this one is composed
    for (let i = 1; i < this.composition.length; i++) {
      const extractedCoinTerm = new CoinTerm(this.valueProperty, this.coinRadius, this.termText, this.termValueStringProperty, this.typeID, {
        initialCount: this.composition[i],
        initialPosition: this.initialPosition,
        initiallyOnCard: this.initiallyOnCard,
        decomposable: false
      });
      extractedCoinTerm.cardOpacityProperty.set(0); // set card invisible when extracted
      extractedCoinTerm.setPositionAndDestination(this.positionProperty.get());
      extractedCoinTerms.push(extractedCoinTerm);
    }

    // set this to be a single fully decomposed coin term
    this.composition.splice(1);
    this.totalCountProperty.set(this.composition[0]);

    // return the list of extracted coin terms
    return extractedCoinTerms;
  }

  /**
   * initiate a break apart, which just emits an event and counts on parent model to handle
   * @public
   */
  breakApart() {
    assert && assert(Math.abs(this.composition.length) > 1, 'coin term can\'t be broken apart');
    this.breakApartEmitter.emit();
  }

  /**
   * check if this coin term is eligible to combine with the provided one, see the implementation for details of what
   * it means to be 'eligible'
   * @param {CoinTerm} candidateCoinTerm
   * @returns {boolean}
   * @public
   */
  isEligibleToCombineWith(candidateCoinTerm) {
    return candidateCoinTerm !== this &&
    // can't combine with self
    candidateCoinTerm.typeID === this.typeID &&
    // can only combine with coins of same type
    !this.userControlledProperty.get() &&
    // can't combine if currently user controlled
    !this.isFadingOut() &&
    // can't combine if currently fading out
    !this.collectedProperty.get(); // can't combine if in a collection area
  }

  /**
   * return the bounds of this model elements representation in the view
   * @returns {Bounds2}
   * @public
   */
  getViewBounds() {
    const position = this.positionProperty.get();
    return this.localViewBoundsProperty.get().shiftedXY(position.x, position.y);
  }

  /**
   * returns true if this coin term is fading out, false otherwise
   * @returns {boolean}
   * @public
   */
  isFadingOut() {
    return this.existenceStrengthProperty.get() < 1;
  }
}
expressionExchange.register('CoinTerm', CoinTerm);
export default CoinTerm;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbWl0dGVyIiwiUHJvcGVydHkiLCJWZWN0b3IyIiwiVmVjdG9yMlByb3BlcnR5IiwibWVyZ2UiLCJFYXNpbmciLCJleHByZXNzaW9uRXhjaGFuZ2UiLCJFRVNoYXJlZENvbnN0YW50cyIsIkNvaW5UZXJtVHlwZUlEIiwiQW5pbWF0aW9uU3BlYyIsIkNPSU5fVEVSTV9GQURFX1RJTUUiLCJDTE9TRV9FTk9VR0hfVE9fSE9NRSIsIkNBUkRfUFJFX0ZBREVfVElNRSIsIkNBUkRfRkFERV9USU1FIiwiTUFYX0FOSU1BVElPTl9USU1FIiwiY3JlYXRpb25Db3VudCIsIkNvaW5UZXJtIiwiY29uc3RydWN0b3IiLCJ2YWx1ZVByb3BlcnR5IiwiY29pblJhZGl1cyIsInRlcm1UZXh0IiwidGVybVZhbHVlU3RyaW5nUHJvcGVydHkiLCJ0eXBlSUQiLCJvcHRpb25zIiwiaWQiLCJpbml0aWFsQ291bnQiLCJpbml0aWFsUG9zaXRpb24iLCJaRVJPIiwiaW5pdGlhbGx5T25DYXJkIiwiZGVjb21wb3NhYmxlIiwicG9zaXRpb25Qcm9wZXJ0eSIsImRlc3RpbmF0aW9uUHJvcGVydHkiLCJ1c2VyQ29udHJvbGxlZFByb3BlcnR5IiwiY29tYmluZUhhbG9BY3RpdmVQcm9wZXJ0eSIsInNob3dNaW51c1NpZ25XaGVuTmVnYXRpdmVQcm9wZXJ0eSIsImNvbGxlY3RlZFByb3BlcnR5IiwiaW5Qcm9ncmVzc0FuaW1hdGlvblByb3BlcnR5IiwidG90YWxDb3VudFByb3BlcnR5IiwiYnJlYWtBcGFydEFsbG93ZWRQcm9wZXJ0eSIsImxvY2FsVmlld0JvdW5kc1Byb3BlcnR5IiwiZXhpc3RlbmNlU3RyZW5ndGhQcm9wZXJ0eSIsImNhcmRPcGFjaXR5UHJvcGVydHkiLCJzY2FsZVByb3BlcnR5IiwiZXhwcmVzc2lvblByb3BlcnR5IiwiaXNDb25zdGFudCIsIkNPTlNUQU5UIiwiY29tcG9zaXRpb24iLCJNYXRoIiwiYWJzIiwiXyIsInRpbWVzIiwicHVzaCIsImNhcmRQcmVGYWRlQ291bnRkb3duIiwiY2FyZEZhZGVDb3VudGRvd24iLCJkZXN0aW5hdGlvblJlYWNoZWRFbWl0dGVyIiwicmV0dXJuZWRUb09yaWdpbkVtaXR0ZXIiLCJicmVha0FwYXJ0RW1pdHRlciIsImxpbmsiLCJ1YyIsInBoZXQiLCJsb2ciLCJsYXp5TGluayIsInRvdGFsQ291bnQiLCJzZXQiLCJjb2xsZWN0ZWQiLCJ1c2VyQ29udHJvbGxlZCIsImxlbmd0aCIsImdldCIsInN0ZXAiLCJkdCIsImFuaW1hdGlvbiIsInRpbWVTb0ZhciIsInRvdGFsRHVyYXRpb24iLCJwcm9wb3J0aW9uQ29tcGxldGVkIiwiZWFzaW5nUHJvcG9ydGlvbiIsIkNVQklDX0lOX09VVCIsInZhbHVlIiwic3RhcnRQb3NpdGlvbiIsInBsdXMiLCJ0cmF2ZWxWZWN0b3IiLCJ3aXRoTWFnbml0dWRlIiwibWFnbml0dWRlIiwiZW1pdCIsImlzRmFkaW5nT3V0IiwibWF4IiwiZGlzdGFuY2UiLCJ0cmF2ZWxUb0Rlc3RpbmF0aW9uIiwiZGVzdGluYXRpb24iLCJjdXJyZW50UG9zaXRpb24iLCJlcXVhbHMiLCJhbmltYXRpb25EdXJhdGlvbiIsIm1pbiIsIkNPSU5fVEVSTV9NT1ZFTUVOVF9TUEVFRCIsImNvcHkiLCJtaW51cyIsInJldHVyblRvT3JpZ2luIiwic2V0UG9zaXRpb25BbmREZXN0aW5hdGlvbiIsInBvc2l0aW9uIiwiZ29JbW1lZGlhdGVseVRvRGVzdGluYXRpb24iLCJnb1RvUG9zaXRpb24iLCJhbmltYXRlIiwiYWJzb3JiIiwiY29pblRlcm1Ub0Fic29yYiIsImRvUGFydGlhbENhbmNlbGxhdGlvbiIsImFzc2VydCIsImZvckVhY2giLCJtaW5EZWNvbXBvc2FibGVWYWx1ZSIsImluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsImV4dHJhY3RDb25zdGl0dWVudENvaW5UZXJtcyIsImV4dHJhY3RlZENvaW5UZXJtcyIsImkiLCJleHRyYWN0ZWRDb2luVGVybSIsImJyZWFrQXBhcnQiLCJpc0VsaWdpYmxlVG9Db21iaW5lV2l0aCIsImNhbmRpZGF0ZUNvaW5UZXJtIiwiZ2V0Vmlld0JvdW5kcyIsInNoaWZ0ZWRYWSIsIngiLCJ5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDb2luVGVybS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGlzIHR5cGUgcmVwcmVzZW50cyBhIG1vZGVsIG9mIGEgc2luZ2xlIG9yIGNvbWJpbmVkIGNvaW4gd2hpY2ggY2FuIGJlIHJlcHJlc2VudGVkIGluIHRoZSB2aWV3IGFzIGEgY29pbiBpbWFnZSBvciBhXHJcbiAqIG1hdGhlbWF0aWNhbCB0ZXJtLiAgQSAnY29tYmluZWQnIGNvaW4gaXMgb25lIHdoZXJlIG90aGVyIG1hdGNoaW5nIGNvaW5zIGhhdmUgYmVlbiBjb21iaW5lZCB3aXRoIHRoaXMgb25lLCBraW5kIG9mXHJcbiAqIGxpa2UgYSBzdGFjayBvZiBjb2lucywgdGhvdWdoIHRoZXkgYXJlIG5vdCByZXByZXNlbnRlZCBpbiB0aGUgdmlldyBhcyBhIHN0YWNrLiAgQSAndGVybScgcmVmZXJzIHRvIGEgbWF0aGVtYXRpY2FsXHJcbiAqIHRlcm0sIGxpa2UgeHkgb3IgeCBzcXVhcmVkLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgRWFzaW5nIGZyb20gJy4uLy4uLy4uLy4uL3R3aXh0L2pzL0Vhc2luZy5qcyc7XHJcbmltcG9ydCBleHByZXNzaW9uRXhjaGFuZ2UgZnJvbSAnLi4vLi4vZXhwcmVzc2lvbkV4Y2hhbmdlLmpzJztcclxuaW1wb3J0IEVFU2hhcmVkQ29uc3RhbnRzIGZyb20gJy4uL0VFU2hhcmVkQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IENvaW5UZXJtVHlwZUlEIGZyb20gJy4uL2VudW0vQ29pblRlcm1UeXBlSUQuanMnO1xyXG5pbXBvcnQgQW5pbWF0aW9uU3BlYyBmcm9tICcuL0FuaW1hdGlvblNwZWMuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IENPSU5fVEVSTV9GQURFX1RJTUUgPSAwLjc1OyAvLyBpbiBzZWNvbmRzXHJcbmNvbnN0IENMT1NFX0VOT1VHSF9UT19IT01FID0gMUUtNjsgLy8gZGlzdGFuY2UgYXQgd2hpY2ggYSBjb2luIHRlcm0gaXMgY29uc2lkZXJlZCB0byBoYXZlIHJldHVybmVkIHRvIG9yaWdpblxyXG5jb25zdCBDQVJEX1BSRV9GQURFX1RJTUUgPSAwLjI1OyAvLyB0aW1lIGJlZm9yZSBjYXJkIHN0YXJ0cyB0byBmYWRlIGFmdGVyIHVzZXIgZ3JhYnMgaXQsIGluIHNlY29uZHNcclxuY29uc3QgQ0FSRF9GQURFX1RJTUUgPSAwLjU7IC8vIHRpbWUgZm9yIGEgY2FyZCB0byBmYWRlIG91dFxyXG5jb25zdCBNQVhfQU5JTUFUSU9OX1RJTUUgPSAxOyAvLyBtYXggdGltZSBmb3IgYW4gYW5pbWF0aW9uIHRvIGNvbXBsZXRlXHJcblxyXG4vLyBjbGFzcyB2YXIgZm9yIGNyZWF0aW5nIHVuaXF1ZSBJRHNcclxubGV0IGNyZWF0aW9uQ291bnQgPSAwO1xyXG5cclxuY2xhc3MgQ29pblRlcm0ge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxudW1iZXI+fSB2YWx1ZVByb3BlcnR5IC0gdmFsdWUgb2YgdGhlIGNvaW4gdGVybSB3cmFwcGVkIGluIGEgcHJvcGVydHlcclxuICAgKiBAcGFyYW0ge251bWJlcn0gY29pblJhZGl1cyAtIHJhZGl1cyBvZiB0aGUgY29pbiBwb3J0aW9uIG9mIHRoZSBjb2luIHRlcm0sIGluIHZpZXcgY29vcmRpbmF0ZXNcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGVybVRleHQgLSB0ZXh0dWFsIHJlcHJlc2VudGF0aW9uLCBlLmcuICd4JywgbXVzdCBiZSBjb21wYXRpYmxlIHdpdGggU3ViU3VwVGV4dFxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPHN0cmluZz59IHRlcm1WYWx1ZVN0cmluZ1Byb3BlcnR5XHJcbiAgICogQHBhcmFtIHtDb2luVGVybVR5cGVJRH0gdHlwZUlEIC0gdHlwZSBpZGVudGlmaWVyIGZvciB0aGlzIGNvaW4gdGVybVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdmFsdWVQcm9wZXJ0eSwgY29pblJhZGl1cywgdGVybVRleHQsIHRlcm1WYWx1ZVN0cmluZ1Byb3BlcnR5LCB0eXBlSUQsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgdGhpcy5pZCA9IGBDVC0keysrY3JlYXRpb25Db3VudH1gOyAvLyBAcHVibGljIChyZWFkLW9ubHkpIC0gdW5pcXVlIElEIHVzZWZ1bCBmb3IgZGVidWdnaW5nXHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIGluaXRpYWxDb3VudDogMSwgLy8gbnVtYmVyIG9mIGluc3RhbmNlcyBvZiB0aGlzIGNvaW4gdGVybSBpbml0aWFsbHkgY29tYmluZWQgdG9nZXRoZXIsIGNhbiBiZSBuZWdhdGl2ZVxyXG4gICAgICBpbml0aWFsUG9zaXRpb246IFZlY3RvcjIuWkVSTyxcclxuICAgICAgaW5pdGlhbGx5T25DYXJkOiBmYWxzZSxcclxuXHJcbiAgICAgIC8vIGZsYWcgdGhhdCBjb250cm9scyB3aGV0aGVyIHRoaXMgY2FuIGJlIGJyb2tlbiBkb3duIGJlbG93IGl0cyBpbml0aWFsIGNvdW50LCBvbmx5IGxvb2tlZCBhdCBpZiB0aGUgYWJzb2x1dGVcclxuICAgICAgLy8gdmFsdWUgb2YgdGhlIGluaXRpYWwgY291bnQgaXMgZ3JlYXRlciB0aGFuIG9uZVxyXG4gICAgICBkZWNvbXBvc2FibGU6IHRydWVcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gcHJvcGVydGllc1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIC0gc2V0IHVzaW5nIG1ldGhvZHMgYmVsb3dcclxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIG9wdGlvbnMuaW5pdGlhbFBvc2l0aW9uICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSAtIHNldCB1c2luZyBtZXRob2RzIGJlbG93XHJcbiAgICB0aGlzLmRlc3RpbmF0aW9uUHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBvcHRpb25zLmluaXRpYWxQb3NpdGlvbiApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gLSBpbmRpY2F0ZSB3aGV0aGVyIHVzZXIgaXMgY3VycmVudGx5IGRyYWdnaW5nIHRoaXMgY29pblxyXG4gICAgdGhpcy51c2VyQ29udHJvbGxlZFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn1cclxuICAgIHRoaXMuY29tYmluZUhhbG9BY3RpdmVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59IC0gc3VwcG9ydHMgc2hvd2luZyBzdWJ0cmFjdGlvbiBpbiBleHByZXNzaW9uc1xyXG4gICAgdGhpcy5zaG93TWludXNTaWduV2hlbk5lZ2F0aXZlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIHRydWUgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj4sIGluZGljYXRlcyB3aGV0aGVyIHRoaXMgaXMgaW4gYSBjb2xsZWN0aW9uIGJveCAoZm9yIGdhbWUpXHJcbiAgICB0aGlzLmNvbGxlY3RlZFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge1Byb3BlcnR5LjxBbmltYXRpb25TcGVjfG51bGw+fSAtIHRyYWNrcyB0aGUgY3VycmVudCBpbi1wcm9ncmVzcyBhbmltYXRpb24sIG51bGwgaWYgbm9uZVxyXG4gICAgdGhpcy5pblByb2dyZXNzQW5pbWF0aW9uUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG51bGwgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtQcm9wZXJ0eS48bnVtYmVyPn0gLSB0b3RhbCBudW1iZXIgb2YgY29pbnMvdGVybXMgY29tYmluZWQgaW50byB0aGlzIG9uZSwgY2FuIGJlIG5lZ2F0aXZlXHJcbiAgICB0aGlzLnRvdGFsQ291bnRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggb3B0aW9ucy5pbml0aWFsQ291bnQgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj4gLSBmbGFnIHRoYXQgY29udHJvbHMgd2hldGhlciBicmVha2luZyBhcGFydCBpcyBhbGxvd2VkXHJcbiAgICB0aGlzLmJyZWFrQXBhcnRBbGxvd2VkUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIHRydWUgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtQcm9wZXJ0eS48Qm91bmRzMj4gLSBUaGUgYm91bmRzIG9mIHRoaXMgbW9kZWwgZWxlbWVudCdzIHZpZXcgcmVwcmVzZW50YXRpb24gcmVsYXRpdmUgdG8gdGhlXHJcbiAgICAvLyBlbGVtZW50J3MgY3VycmVudCBwb3NpdGlvbi4gVGhpcyBhZG1pdHRlZGx5IGJyZWFrcyB0aGUgdXN1YWwgbW9kZWwtdmlldyBydWxlcywgYnV0IG1hbnkgdGhpbmdzIGluIHRoZSB2aWV3IG5lZWRcclxuICAgIC8vIHRvIGtub3cgdGhpcywgc28gaGF2aW5nIGl0IGF2YWlsYWJsZSBvbiB0aGUgbW9kZWwgZWxlbWVudCBhZnRlciBiZWluZyBzZXQgYnkgdGhlIHZpZXcgd29ya2VkIG91dCB0byBiZSB0aGUgYmVzdFxyXG4gICAgLy8gYXBwcm9hY2guXHJcbiAgICB0aGlzLmxvY2FsVmlld0JvdW5kc1Byb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBudWxsICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7UHJvcGVydHkuPG51bWJlcj59IC0gcmFuZ2VzIGZyb20gMSB0byAwLCB1c2VkIHByaW1hcmlseSBmb3IgZmFkaW5nIG91dCBvZiBhIGNvaW4gdGVybSB3aGVuXHJcbiAgICAvLyBjYW5jZWxsYXRpb24gb2NjdXJzLCBvbmNlIHNldCB0byBhbnkgdmFsdWUgbGVzcyB0aGFuIDEgaXQgd2lsbCBhdXRvbWF0aWNhbGx5IGZhZGUgdG8gMFxyXG4gICAgdGhpcy5leGlzdGVuY2VTdHJlbmd0aFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAxICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59IC0gZGV0ZXJtaW5lcyB0aGUgb3BhY2l0eSBvZiB0aGUgY2FyZCBvbiB3aGljaCB0aGUgY29pbiB0ZXJtIGNhbiByZXNpZGVcclxuICAgIHRoaXMuY2FyZE9wYWNpdHlQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggb3B0aW9ucy5pbml0aWFsbHlPbkNhcmQgPyAxIDogMCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fSAtIHVzZWQgYnkgdmlldyB0byBtYWtlIHRoZSBjb2luIHRlcm1zIGFwcGVhciBzbWFsbGVyIGlmIG5lY2Vzc2FyeSB3aGVuIHB1dCBpblxyXG4gICAgLy8gY29sbGVjdGlvbiBhcmVhcyAoZ2FtZSBvbmx5KVxyXG4gICAgdGhpcy5zY2FsZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAxICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPEV4cHJlc3Npb258bnVsbD59IC0gZXhwcmVzc2lvbiBvZiB3aGljaCB0aGlzIGNvaW4gdGVybSBpcyBhIHBhcnQsIHdoaWNoIGlzIG51bGwgZm9yIGEgJ3NvbG8nXHJcbiAgICAvLyBjb2luIHRlcm0uXHJcbiAgICB0aGlzLmV4cHJlc3Npb25Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbnVsbCApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBub24tcHJvcGVydHkgYXR0cmlidXRlc1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIC0gdmFsdWVzIHRoYXQgZGVzY3JpYmUgdGhlIG5hdHVyZSBvZiB0aGlzIGNvaW4gdGVybVxyXG4gICAgdGhpcy50eXBlSUQgPSB0eXBlSUQ7XHJcbiAgICB0aGlzLnZhbHVlUHJvcGVydHkgPSB2YWx1ZVByb3BlcnR5O1xyXG4gICAgdGhpcy50ZXJtVGV4dCA9IHRlcm1UZXh0O1xyXG4gICAgdGhpcy5jb2luUmFkaXVzID0gY29pblJhZGl1cztcclxuICAgIHRoaXMuaW5pdGlhbGx5T25DYXJkID0gb3B0aW9ucy5pbml0aWFsbHlPbkNhcmQ7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSAtIGluZGljYXRlcyB0aGF0IHRoZSB2YWx1ZSB3aWxsIG5ldmVyIGNoYW5nZSwgd2lsbCBiZSBkaXNwbGF5ZWQgZGlmZmVyZW50bHkgaW4gdGhlIHZpZXdcclxuICAgIHRoaXMuaXNDb25zdGFudCA9IHR5cGVJRCA9PT0gQ29pblRlcm1UeXBlSUQuQ09OU1RBTlQ7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSAtIGEgcHJvcGVydHkgd2hpY2ggY29udGFpbnMgdGhlIHRleHQgdGhhdCBzaG91bGQgYmUgc2hvd24gd2hlbiBkaXNwbGF5aW5nIHRlcm0gdmFsdWVcclxuICAgIHRoaXMudGVybVZhbHVlU3RyaW5nUHJvcGVydHkgPSB0ZXJtVmFsdWVTdHJpbmdQcm9wZXJ0eTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtBcnJheS48bnVtYmVyPn0gLSB0cmFja3Mgd2hhdCB0aGlzIGNvaW4gdGVybSBpcyBjb21wb3NlZCBvZiBhbmQgd2hhdCBpdCBjYW4gYmUgYnJva2VuIGRvd24gaW50b1xyXG4gICAgdGhpcy5jb21wb3NpdGlvbiA9IFtdO1xyXG4gICAgaWYgKCBNYXRoLmFicyggb3B0aW9ucy5pbml0aWFsQ291bnQgKSA+IDEgJiYgb3B0aW9ucy5kZWNvbXBvc2FibGUgKSB7XHJcbiAgICAgIF8udGltZXMoIE1hdGguYWJzKCBvcHRpb25zLmluaXRpYWxDb3VudCApLCAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5jb21wb3NpdGlvbi5wdXNoKCBvcHRpb25zLmluaXRpYWxDb3VudCA+IDAgPyAxIDogLTEgKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuY29tcG9zaXRpb24ucHVzaCggb3B0aW9ucy5pbml0aWFsQ291bnQgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfG51bGx9IC0gY291bnRkb3duIHRpbWVycyBmb3IgZmFkaW5nIG91dCB0aGUgY2FyZCBiYWNrZ3JvdW5kXHJcbiAgICB0aGlzLmNhcmRQcmVGYWRlQ291bnRkb3duID0gbnVsbDtcclxuICAgIHRoaXMuY2FyZEZhZGVDb3VudGRvd24gPSBudWxsO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBlbWl0dGVyc1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtFbWl0dGVyfSAtIGVtaXRzIGFuIGV2ZW50IHdoZW4gYW4gYW5pbWF0aW9uIGZpbmlzaGVzIGFuZCB0aGUgZGVzdGluYXRpb24gaXMgcmVhY2hlZFxyXG4gICAgdGhpcy5kZXN0aW5hdGlvblJlYWNoZWRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtFbWl0dGVyfSAtIGVtaXRzIGFuIGV2ZW50IHdoZW4gY29pbiB0ZXJtcyByZXR1cm5zIHRvIG9yaWdpbmFsIHBvc2l0aW9uIGFuZCBpcyBub3QgdXNlciBjb250cm9sbGVkXHJcbiAgICB0aGlzLnJldHVybmVkVG9PcmlnaW5FbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtFbWl0dGVyfSAtIGVtaXRzIGFuIGV2ZW50IHdoZW4gdGhpcyBjb2luIHRlcm0gc2hvdWxkIGJlIGJyb2tlbiBhcGFydFxyXG4gICAgdGhpcy5icmVha0FwYXJ0RW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1ZlY3RvcjJ9IC0gdXNlZCB3aGVuIGFuaW1hdGluZyBiYWNrIHRvIG9yaWdpbmFsIHBvc2l0aW9uXHJcbiAgICB0aGlzLmluaXRpYWxQb3NpdGlvbiA9IG9wdGlvbnMuaW5pdGlhbFBvc2l0aW9uO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBsaXN0ZW5lcnMgdG8gb3duIHByb3BlcnRpZXNcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgdGhpcy51c2VyQ29udHJvbGxlZFByb3BlcnR5LmxpbmsoIHVjID0+IHtcclxuICAgICAgcGhldC5sb2cgJiYgcGhldC5sb2coIGBjb2luIHRlcm0gJHt0aGlzLmlkfSB1YyBjaGFuZ2VkIHRvOiAke3VjfWAgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBtb25pdG9yIHRoZSB0b3RhbCBjb3VudCwgc3RhcnQgZmFkaW5nIHRoZSBleGlzdGVuY2Ugc3RyZW5ndGggaWYgaXQgZ29lcyB0byB6ZXJvXHJcbiAgICB0aGlzLnRvdGFsQ291bnRQcm9wZXJ0eS5sYXp5TGluayggdG90YWxDb3VudCA9PiB7XHJcbiAgICAgIGlmICggdG90YWxDb3VudCA9PT0gMCApIHtcclxuXHJcbiAgICAgICAgLy8gaW5pdGlhdGUgdGhlIGZhZGUgb3V0IGJ5IHNldHRpbmcgdGhlIGV4aXN0ZW5jZSBzdHJlbmd0aCB0byBhIHZhbHVlIGp1c3QgbGVzcyB0aGFuIDFcclxuICAgICAgICB0aGlzLmV4aXN0ZW5jZVN0cmVuZ3RoUHJvcGVydHkuc2V0KCAwLjk5OTkgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuY29sbGVjdGVkUHJvcGVydHkubGluayggY29sbGVjdGVkID0+IHtcclxuXHJcbiAgICAgIC8vIHNldCB0aGUgZmxhZyB0aGF0IGlzIHVzZWQgdG8gZGlzYWJsZSBicmVha2luZyBhcGFydCB3aGVuZXZlciB0aGlzIGNvaW4gdGVybSBpcyBjYXB0dXJlZCBpbiBhIGNvbGxlY3Rpb24gYXJlYVxyXG4gICAgICB0aGlzLmJyZWFrQXBhcnRBbGxvd2VkUHJvcGVydHkuc2V0KCAhY29sbGVjdGVkICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBhcHBlYXJhbmNlIG9mIHRoZSBiYWNrZ3JvdW5kIGNhcmQgYXMgdGhlIHVzZXIgaW50ZXJhY3RzIHdpdGggdGhpcyBjb2luIHRlcm1cclxuICAgIHRoaXMudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5sYXp5TGluayggdXNlckNvbnRyb2xsZWQgPT4ge1xyXG5cclxuICAgICAgaWYgKCBvcHRpb25zLmluaXRpYWxseU9uQ2FyZCApIHtcclxuXHJcbiAgICAgICAgaWYgKCB1c2VyQ29udHJvbGxlZCApIHtcclxuXHJcbiAgICAgICAgICAvLyBJZiB0aGlzIGNvaW4gdGVybSBpcyBkZWNvbXBvc2VkIGFzIGZhciBhcyBpdCBjYW4gZ28sIHNob3cgdGhlIGJhY2tncm91bmQgY2FyZCB3aGVuIHRoZSB1c2VyIGdyYWJzIGl0LCBidXRcclxuICAgICAgICAgIC8vIGZhZGUgaXQgb3V0IGFmdGVyIGEgbGl0dGxlIHdoaWxlLlxyXG4gICAgICAgICAgaWYgKCB0aGlzLmNvbXBvc2l0aW9uLmxlbmd0aCA9PT0gMSApIHtcclxuICAgICAgICAgICAgdGhpcy5jYXJkT3BhY2l0eVByb3BlcnR5LnNldCggMSApO1xyXG4gICAgICAgICAgICB0aGlzLmNhcmRQcmVGYWRlQ291bnRkb3duID0gQ0FSRF9QUkVfRkFERV9USU1FO1xyXG4gICAgICAgICAgICB0aGlzLmNhcmRGYWRlQ291bnRkb3duID0gbnVsbDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIHRoaXMuY2FyZE9wYWNpdHlQcm9wZXJ0eS5nZXQoKSAhPT0gMCApIHtcclxuICAgICAgICAgIHRoaXMuY2FyZE9wYWNpdHlQcm9wZXJ0eS5zZXQoIDAgKTsgLy8gdGhlIGNhcmQgaXMgbm90IHZpc2libGUgaWYgbm90IGNvbnRyb2xsZWQgYnkgdGhlIHVzZXJcclxuICAgICAgICAgIHRoaXMuY2FyZFByZUZhZGVDb3VudGRvd24gPSBudWxsO1xyXG4gICAgICAgICAgdGhpcy5jYXJkRmFkZUNvdW50ZG93biA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBzdGVwIGZ1bmN0aW9uLCB1c2VkIGZvciBhbmltYXRpb25zXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gZGVsdGEgdGltZSwgaW4gc2Vjb25kc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuXHJcbiAgICAvLyBpZiB0aGVyZSBpcyBhbiBhbmltYXRpb24gaW4gcHJvZ3Jlc3MsIHN0ZXAgaXRcclxuICAgIGNvbnN0IGFuaW1hdGlvbiA9IHRoaXMuaW5Qcm9ncmVzc0FuaW1hdGlvblByb3BlcnR5LmdldCgpO1xyXG4gICAgaWYgKCBhbmltYXRpb24gKSB7XHJcbiAgICAgIGFuaW1hdGlvbi50aW1lU29GYXIgKz0gZHQ7XHJcbiAgICAgIGlmICggYW5pbWF0aW9uLnRpbWVTb0ZhciA8IGFuaW1hdGlvbi50b3RhbER1cmF0aW9uICkge1xyXG5cclxuICAgICAgICAvLyBub3QgdGhlcmUgeWV0IC0gdGFrZSBhIHN0ZXAgdG93YXJkcyB0aGUgZGVzdGluYXRpb25cclxuICAgICAgICBjb25zdCBwcm9wb3J0aW9uQ29tcGxldGVkID0gYW5pbWF0aW9uLnRpbWVTb0ZhciAvIGFuaW1hdGlvbi50b3RhbER1cmF0aW9uO1xyXG4gICAgICAgIGNvbnN0IGVhc2luZ1Byb3BvcnRpb24gPSBFYXNpbmcuQ1VCSUNfSU5fT1VULnZhbHVlKCBwcm9wb3J0aW9uQ29tcGxldGVkICk7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnNldChcclxuICAgICAgICAgIGFuaW1hdGlvbi5zdGFydFBvc2l0aW9uLnBsdXMoXHJcbiAgICAgICAgICAgIGFuaW1hdGlvbi50cmF2ZWxWZWN0b3Iud2l0aE1hZ25pdHVkZSggYW5pbWF0aW9uLnRyYXZlbFZlY3Rvci5tYWduaXR1ZGUgKiBlYXNpbmdQcm9wb3J0aW9uIClcclxuICAgICAgICAgIClcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBkZXN0aW5hdGlvbiByZWFjaGVkLCBlbmQgdGhlIGFuaW1hdGlvblxyXG4gICAgICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5zZXQoIHRoaXMuZGVzdGluYXRpb25Qcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgICAgIHRoaXMuaW5Qcm9ncmVzc0FuaW1hdGlvblByb3BlcnR5LnNldCggbnVsbCApO1xyXG4gICAgICAgIHRoaXMuZGVzdGluYXRpb25SZWFjaGVkRW1pdHRlci5lbWl0KCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiB0aGlzIGNvaW4gdGVybSBpcyBmYWRpbmcgb3V0LCBjb250aW51ZSB0aGUgZmFkZVxyXG4gICAgaWYgKCB0aGlzLmlzRmFkaW5nT3V0KCkgKSB7XHJcbiAgICAgIHRoaXMuZXhpc3RlbmNlU3RyZW5ndGhQcm9wZXJ0eS5zZXQoIE1hdGgubWF4KFxyXG4gICAgICAgIHRoaXMuZXhpc3RlbmNlU3RyZW5ndGhQcm9wZXJ0eS5nZXQoKSAtICggZHQgLyBDT0lOX1RFUk1fRkFERV9USU1FICksXHJcbiAgICAgICAgMFxyXG4gICAgICApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgdGhlIGJhY2tncm91bmQgY2FyZCBpcyB2aXNpYmxlLCBzdGVwIGl0cyBmYWRlIHNlcXVlbmNlXHJcbiAgICBpZiAoIHRoaXMuY2FyZFByZUZhZGVDb3VudGRvd24gIT09IG51bGwgKSB7XHJcbiAgICAgIHRoaXMuY2FyZFByZUZhZGVDb3VudGRvd24gPSBNYXRoLm1heCggdGhpcy5jYXJkUHJlRmFkZUNvdW50ZG93biAtIGR0LCAwICk7XHJcbiAgICAgIGlmICggdGhpcy5jYXJkUHJlRmFkZUNvdW50ZG93biA9PT0gMCApIHtcclxuXHJcbiAgICAgICAgLy8gcHJlLWZhZGUgY29tcGxldGUsIHN0YXJ0IGZhZGVcclxuICAgICAgICB0aGlzLmNhcmRQcmVGYWRlQ291bnRkb3duID0gbnVsbDtcclxuICAgICAgICB0aGlzLmNhcmRGYWRlQ291bnRkb3duID0gQ0FSRF9GQURFX1RJTUU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLmNhcmRGYWRlQ291bnRkb3duICE9PSBudWxsICkge1xyXG4gICAgICB0aGlzLmNhcmRGYWRlQ291bnRkb3duID0gTWF0aC5tYXgoIHRoaXMuY2FyZEZhZGVDb3VudGRvd24gLSBkdCwgMCApO1xyXG4gICAgICB0aGlzLmNhcmRPcGFjaXR5UHJvcGVydHkuc2V0KCB0aGlzLmNhcmRGYWRlQ291bnRkb3duIC8gQ0FSRF9GQURFX1RJTUUgKTtcclxuICAgICAgaWYgKCB0aGlzLmNhcmRGYWRlQ291bnRkb3duID09PSAwICkge1xyXG5cclxuICAgICAgICAvLyBmYWRlIGNvbXBsZXRlXHJcbiAgICAgICAgdGhpcy5jYXJkRmFkZUNvdW50ZG93biA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiB0aGlzIGNvaW4gdGVybSBoYXMgcmV0dXJuZWQgdG8gaXRzIG9yaWdpbiwgZW1pdCBhbiBldmVudCB0byB0cmlnZ2VyIHJlbW92YWxcclxuICAgIGlmICggdGhpcy5wb3NpdGlvblByb3BlcnR5LmdldCgpLmRpc3RhbmNlKCB0aGlzLmluaXRpYWxQb3NpdGlvbiApIDwgQ0xPU0VfRU5PVUdIX1RPX0hPTUUgJiYgIXRoaXMudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgdGhpcy5yZXR1cm5lZFRvT3JpZ2luRW1pdHRlci5lbWl0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtb3ZlIHRvIHRoZSBzcGVjaWZpZWQgZGVzdGluYXRpb24sIGJ1dCBkbyBzbyBhIHN0ZXAgYXQgYSB0aW1lIHJhdGhlciB0aGFuIGFsbCBhdCBvbmNlXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBkZXN0aW5hdGlvblxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICB0cmF2ZWxUb0Rlc3RpbmF0aW9uKCBkZXN0aW5hdGlvbiApIHtcclxuICAgIHRoaXMuZGVzdGluYXRpb25Qcm9wZXJ0eS5zZXQoIGRlc3RpbmF0aW9uICk7XHJcbiAgICBjb25zdCBjdXJyZW50UG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICBpZiAoIGN1cnJlbnRQb3NpdGlvbi5lcXVhbHMoIGRlc3RpbmF0aW9uICkgKSB7XHJcblxyXG4gICAgICAvLyBUaGUgY29pbiB0ZXJtcyBpcyBhbHJlYWR5IGF0IHRoZSBkZXN0aW5hdGlvbiwgbm8gYW5pbWF0aW9uIGlzIHJlcXVpcmVkLCBidXQgZW1pdCBhIG5vdGlmaWNhdGlvbiBpbiBjYXNlIHRoZVxyXG4gICAgICAvLyB0aGUgY2xpZW50IG5lZWRzIGl0LlxyXG4gICAgICB0aGlzLmRlc3RpbmF0aW9uUmVhY2hlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBjYWxjdWxhdGUgdGhlIHRpbWUgbmVlZGVkIHRvIGdldCB0byB0aGUgZGVzdGluYXRpb25cclxuICAgICAgY29uc3QgYW5pbWF0aW9uRHVyYXRpb24gPSBNYXRoLm1pbihcclxuICAgICAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkuZGlzdGFuY2UoIGRlc3RpbmF0aW9uICkgLyBFRVNoYXJlZENvbnN0YW50cy5DT0lOX1RFUk1fTU9WRU1FTlRfU1BFRUQsXHJcbiAgICAgICAgTUFYX0FOSU1BVElPTl9USU1FXHJcbiAgICAgICk7XHJcblxyXG4gICAgICB0aGlzLmluUHJvZ3Jlc3NBbmltYXRpb25Qcm9wZXJ0eS5zZXQoIG5ldyBBbmltYXRpb25TcGVjKFxyXG4gICAgICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS5jb3B5KCksXHJcbiAgICAgICAgZGVzdGluYXRpb24ubWludXMoIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApLFxyXG4gICAgICAgIGFuaW1hdGlvbkR1cmF0aW9uXHJcbiAgICAgICkgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHNlbmQgdGhpcyBjb2luIHRlcm0gYmFjayB0byBpdHMgb3JpZ2luLCBnZW5lcmFsbHkgdXNlZCB3aGVuIHB1dHRpbmcgYSBjb2luIHRlcm0gYmFjayBpbiB0aGUgJ2NyZWF0b3IgYm94J1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXR1cm5Ub09yaWdpbigpIHtcclxuICAgIHRoaXMudHJhdmVsVG9EZXN0aW5hdGlvbiggdGhpcy5pbml0aWFsUG9zaXRpb24gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHNldCBib3RoIHRoZSBwb3NpdGlvbiBhbmQgZGVzdGluYXRpb24gaW4gc3VjaCBhIHdheSB0aGF0IG5vIGFuaW1hdGlvbiBpcyBpbml0aWF0ZWRcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvc2l0aW9uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldFBvc2l0aW9uQW5kRGVzdGluYXRpb24oIHBvc2l0aW9uICkge1xyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnNldCggcG9zaXRpb24gKTtcclxuICAgIHRoaXMuZGVzdGluYXRpb25Qcm9wZXJ0eS5zZXQoIHBvc2l0aW9uICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYWtlIHRoZSBjb2luIHRlcm0gY2FuY2VsIGFueSBpbiBwcm9ncmVzcyBhbmltYXRpb24gYW5kIGdvIGltbWVkaWF0ZWx5IHRvIHRoZSBjdXJyZW50IGRlc3RpbmF0aW9uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdvSW1tZWRpYXRlbHlUb0Rlc3RpbmF0aW9uKCkge1xyXG4gICAgaWYgKCB0aGlzLmluUHJvZ3Jlc3NBbmltYXRpb25Qcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgdGhpcy5pblByb2dyZXNzQW5pbWF0aW9uUHJvcGVydHkuc2V0KCBudWxsICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkuc2V0KCB0aGlzLmRlc3RpbmF0aW9uUHJvcGVydHkuZ2V0KCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGFuIGFsdGVybmF0aXZlIHdheSB0byBzZXQgcG9zaXRpb24gdGhhdCB1c2VzIGEgZmxhZyB0byBkZXRlcm1pbmUgd2hldGhlciB0byBhbmltYXRlIG9yIHRyYXZlbCBpbnN0YW50bHlcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvc2l0aW9uXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBhbmltYXRlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdvVG9Qb3NpdGlvbiggcG9zaXRpb24sIGFuaW1hdGUgKSB7XHJcbiAgICBpZiAoIGFuaW1hdGUgKSB7XHJcbiAgICAgIHRoaXMudHJhdmVsVG9EZXN0aW5hdGlvbiggcG9zaXRpb24gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLnNldFBvc2l0aW9uQW5kRGVzdGluYXRpb24oIHBvc2l0aW9uICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBhYnNvcmIgdGhlIHByb3ZpZGVkIGNvaW4gdGVybSBpbnRvIHRoaXMgb25lXHJcbiAgICogQHBhcmFtIHtDb2luVGVybX0gY29pblRlcm1Ub0Fic29yYlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZG9QYXJ0aWFsQ2FuY2VsbGF0aW9uIC0gY29udHJvbHMgd2hldGhlciBvcHBvc2l0ZSB0ZXJtcyBpbiB0aGUgY29tcG9zaXRpb24gY2FuY2VsIG9uZSBhbm90aGVyXHJcbiAgICogb3IgYXJlIHJldGFpbmVkLCBmb3IgZXhhbXBsZSwgd2hlbiBjb21iaW5pbmcgYSBjb2luIHRlcm0gY29tcG9zZWQgb2YgWyAtMSwgLTEgXSB3aXRoIG9uZSBjb21wb3NlZCBvZiBbIDEgXSBhbmRcclxuICAgKiBkb1BhcnRpYWxDYW5jZWxsYXRpb24gc2V0IHRvIHRydWUsIHRoZSByZXN1bHQgaXMgWyAtMSBdLCBpZiBmYWxzZSwgaXQncyBbIDEsIC0xLCAtMSBdLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhYnNvcmIoIGNvaW5UZXJtVG9BYnNvcmIsIGRvUGFydGlhbENhbmNlbGxhdGlvbiApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMudHlwZUlEID09PSBjb2luVGVybVRvQWJzb3JiLnR5cGVJRCwgJ2NhblxcJ3QgY29tYmluZSBjb2luIHRlcm1zIG9mIGRpZmZlcmVudCB0eXBlcycgKTtcclxuICAgIHRoaXMudG90YWxDb3VudFByb3BlcnR5LnZhbHVlICs9IGNvaW5UZXJtVG9BYnNvcmIudG90YWxDb3VudFByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgIGlmICggZG9QYXJ0aWFsQ2FuY2VsbGF0aW9uICkge1xyXG4gICAgICBjb2luVGVybVRvQWJzb3JiLmNvbXBvc2l0aW9uLmZvckVhY2goIG1pbkRlY29tcG9zYWJsZVZhbHVlID0+IHtcclxuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuY29tcG9zaXRpb24uaW5kZXhPZiggLTEgKiBtaW5EZWNvbXBvc2FibGVWYWx1ZSApO1xyXG4gICAgICAgIGlmICggaW5kZXggPiAtMSApIHtcclxuICAgICAgICAgIC8vIGNhbmNlbCB0aGlzIHZhbHVlIGZyb20gdGhlIGNvbXBvc2l0aW9uIG9mIHRoZSByZWNlaXZpbmcgY29pbiB0ZXJtXHJcbiAgICAgICAgICB0aGlzLmNvbXBvc2l0aW9uLnNwbGljZSggaW5kZXgsIDEgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAvLyBhZGQgdGhpcyBlbGVtZW50IG9mIHRoZSBpbmNvbWluZyBjb2luIHRlcm0gdG8gdGhlIHJlY2VpdmluZyBjb2luIHRlcm1cclxuICAgICAgICAgIHRoaXMuY29tcG9zaXRpb24ucHVzaCggbWluRGVjb21wb3NhYmxlVmFsdWUgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBjb2luVGVybVRvQWJzb3JiLmNvbXBvc2l0aW9uLmZvckVhY2goIG1pbkRlY29tcG9zYWJsZVZhbHVlID0+IHtcclxuICAgICAgICB0aGlzLmNvbXBvc2l0aW9uLnB1c2goIG1pbkRlY29tcG9zYWJsZVZhbHVlICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHB1bGwgb3V0IHRoZSBjb2luIHRlcm1zIGZyb20gd2hpY2ggdGhpcyBvbmUgaXMgY29tcG9zZWQsIG9taXR0aW5nIHRoZSBmaXJzdCBvbmVcclxuICAgKiBAcmV0dXJucyBBcnJheS48Q29pblRlcm0+XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGV4dHJhY3RDb25zdGl0dWVudENvaW5UZXJtcygpIHtcclxuICAgIGNvbnN0IGV4dHJhY3RlZENvaW5UZXJtcyA9IFtdO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhIGNvaW4gdGVybSB0byByZWZsZWN0IGVhY2ggb25lIGZyb20gd2hpY2ggdGhpcyBvbmUgaXMgY29tcG9zZWRcclxuICAgIGZvciAoIGxldCBpID0gMTsgaSA8IHRoaXMuY29tcG9zaXRpb24ubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGV4dHJhY3RlZENvaW5UZXJtID0gbmV3IENvaW5UZXJtKFxyXG4gICAgICAgIHRoaXMudmFsdWVQcm9wZXJ0eSxcclxuICAgICAgICB0aGlzLmNvaW5SYWRpdXMsXHJcbiAgICAgICAgdGhpcy50ZXJtVGV4dCxcclxuICAgICAgICB0aGlzLnRlcm1WYWx1ZVN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICAgIHRoaXMudHlwZUlELFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGluaXRpYWxDb3VudDogdGhpcy5jb21wb3NpdGlvblsgaSBdLFxyXG4gICAgICAgICAgaW5pdGlhbFBvc2l0aW9uOiB0aGlzLmluaXRpYWxQb3NpdGlvbixcclxuICAgICAgICAgIGluaXRpYWxseU9uQ2FyZDogdGhpcy5pbml0aWFsbHlPbkNhcmQsXHJcbiAgICAgICAgICBkZWNvbXBvc2FibGU6IGZhbHNlXHJcbiAgICAgICAgfSApO1xyXG4gICAgICBleHRyYWN0ZWRDb2luVGVybS5jYXJkT3BhY2l0eVByb3BlcnR5LnNldCggMCApOyAvLyBzZXQgY2FyZCBpbnZpc2libGUgd2hlbiBleHRyYWN0ZWRcclxuICAgICAgZXh0cmFjdGVkQ29pblRlcm0uc2V0UG9zaXRpb25BbmREZXN0aW5hdGlvbiggdGhpcy5wb3NpdGlvblByb3BlcnR5LmdldCgpICk7XHJcbiAgICAgIGV4dHJhY3RlZENvaW5UZXJtcy5wdXNoKCBleHRyYWN0ZWRDb2luVGVybSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHNldCB0aGlzIHRvIGJlIGEgc2luZ2xlIGZ1bGx5IGRlY29tcG9zZWQgY29pbiB0ZXJtXHJcbiAgICB0aGlzLmNvbXBvc2l0aW9uLnNwbGljZSggMSApO1xyXG4gICAgdGhpcy50b3RhbENvdW50UHJvcGVydHkuc2V0KCB0aGlzLmNvbXBvc2l0aW9uWyAwIF0gKTtcclxuXHJcbiAgICAvLyByZXR1cm4gdGhlIGxpc3Qgb2YgZXh0cmFjdGVkIGNvaW4gdGVybXNcclxuICAgIHJldHVybiBleHRyYWN0ZWRDb2luVGVybXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBpbml0aWF0ZSBhIGJyZWFrIGFwYXJ0LCB3aGljaCBqdXN0IGVtaXRzIGFuIGV2ZW50IGFuZCBjb3VudHMgb24gcGFyZW50IG1vZGVsIHRvIGhhbmRsZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBicmVha0FwYXJ0KCkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggTWF0aC5hYnMoIHRoaXMuY29tcG9zaXRpb24ubGVuZ3RoICkgPiAxLCAnY29pbiB0ZXJtIGNhblxcJ3QgYmUgYnJva2VuIGFwYXJ0JyApO1xyXG4gICAgdGhpcy5icmVha0FwYXJ0RW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBjaGVjayBpZiB0aGlzIGNvaW4gdGVybSBpcyBlbGlnaWJsZSB0byBjb21iaW5lIHdpdGggdGhlIHByb3ZpZGVkIG9uZSwgc2VlIHRoZSBpbXBsZW1lbnRhdGlvbiBmb3IgZGV0YWlscyBvZiB3aGF0XHJcbiAgICogaXQgbWVhbnMgdG8gYmUgJ2VsaWdpYmxlJ1xyXG4gICAqIEBwYXJhbSB7Q29pblRlcm19IGNhbmRpZGF0ZUNvaW5UZXJtXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGlzRWxpZ2libGVUb0NvbWJpbmVXaXRoKCBjYW5kaWRhdGVDb2luVGVybSApIHtcclxuXHJcbiAgICByZXR1cm4gY2FuZGlkYXRlQ29pblRlcm0gIT09IHRoaXMgJiYgLy8gY2FuJ3QgY29tYmluZSB3aXRoIHNlbGZcclxuICAgICAgICAgICBjYW5kaWRhdGVDb2luVGVybS50eXBlSUQgPT09IHRoaXMudHlwZUlEICYmIC8vIGNhbiBvbmx5IGNvbWJpbmUgd2l0aCBjb2lucyBvZiBzYW1lIHR5cGVcclxuICAgICAgICAgICAhdGhpcy51c2VyQ29udHJvbGxlZFByb3BlcnR5LmdldCgpICYmIC8vIGNhbid0IGNvbWJpbmUgaWYgY3VycmVudGx5IHVzZXIgY29udHJvbGxlZFxyXG4gICAgICAgICAgICF0aGlzLmlzRmFkaW5nT3V0KCkgJiYgLy8gY2FuJ3QgY29tYmluZSBpZiBjdXJyZW50bHkgZmFkaW5nIG91dFxyXG4gICAgICAgICAgICF0aGlzLmNvbGxlY3RlZFByb3BlcnR5LmdldCgpOyAvLyBjYW4ndCBjb21iaW5lIGlmIGluIGEgY29sbGVjdGlvbiBhcmVhXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiByZXR1cm4gdGhlIGJvdW5kcyBvZiB0aGlzIG1vZGVsIGVsZW1lbnRzIHJlcHJlc2VudGF0aW9uIGluIHRoZSB2aWV3XHJcbiAgICogQHJldHVybnMge0JvdW5kczJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFZpZXdCb3VuZHMoKSB7XHJcbiAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKTtcclxuICAgIHJldHVybiB0aGlzLmxvY2FsVmlld0JvdW5kc1Byb3BlcnR5LmdldCgpLnNoaWZ0ZWRYWSggcG9zaXRpb24ueCwgcG9zaXRpb24ueSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogcmV0dXJucyB0cnVlIGlmIHRoaXMgY29pbiB0ZXJtIGlzIGZhZGluZyBvdXQsIGZhbHNlIG90aGVyd2lzZVxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBpc0ZhZGluZ091dCgpIHtcclxuICAgIHJldHVybiB0aGlzLmV4aXN0ZW5jZVN0cmVuZ3RoUHJvcGVydHkuZ2V0KCkgPCAxO1xyXG4gIH1cclxufVxyXG5cclxuZXhwcmVzc2lvbkV4Y2hhbmdlLnJlZ2lzdGVyKCAnQ29pblRlcm0nLCBDb2luVGVybSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ29pblRlcm07Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSxnQ0FBZ0M7QUFDcEQsT0FBT0MsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLGVBQWUsTUFBTSx1Q0FBdUM7QUFDbkUsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxNQUFNLE1BQU0sZ0NBQWdDO0FBQ25ELE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2QjtBQUM1RCxPQUFPQyxpQkFBaUIsTUFBTSx5QkFBeUI7QUFDdkQsT0FBT0MsY0FBYyxNQUFNLDJCQUEyQjtBQUN0RCxPQUFPQyxhQUFhLE1BQU0sb0JBQW9COztBQUU5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