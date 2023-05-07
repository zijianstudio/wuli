// Copyright 2016-2022, University of Colorado Boulder

/**
 * This type represents a model of an expression.  An expression is a set of coin terms all positioned in a line.  In
 * the view, an expression is represented as a box containing the coin terms with plus symboles between them.
 *
 * @author John Blanco
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Easing from '../../../../twixt/js/Easing.js';
import expressionExchange from '../../expressionExchange.js';
import EESharedConstants from '../EESharedConstants.js';
import AnimationSpec from './AnimationSpec.js';

// constants
const INTER_COIN_TERM_SPACING = 30; // in model units, empirically determined
const X_MARGIN = 14; // margin for coin terms, empirically determined
const Y_MARGIN = 12; // margin for coin terms, empirically determined
const ANIMATION_SPEED = 400; // in model units (which are basically screen coordinates) per second
const MAX_ANIMATION_TIME = 1; // seconds

// class var for creating unique IDs
let creationCount = 0;
class Expression {
  /**
   * @param {CoinTerm} anchorCoinTerm
   * @param {CoinTerm} floatingCoinTerm
   * @param {Property.<boolean>} simplifyNegativesProperty
   */
  constructor(anchorCoinTerm, floatingCoinTerm, simplifyNegativesProperty) {
    const self = this;
    this.id = `EX-${++creationCount}`;

    //------------------------------------------------------------------------
    // properties
    //------------------------------------------------------------------------

    this.upperLeftCornerProperty = new Vector2Property(Vector2.ZERO); // @public
    this.widthProperty = new Property(0); // @public (read-only) {Property.<number>}
    this.heightProperty = new Property(0); // @public (read-only) {Property.<number>}
    this.userControlledProperty = new Property(false); // @public {Property.<boolean>}
    this.inEditModeProperty = new Property(false); // @public {Property.<boolean>} - indicates whether this expression is being edited
    this.collectedProperty = new Property(false); // @public {Property.<boolean>} - indicates whether this is in a collection box (for game)

    // @public (read-only) {Property.<AnimationSpec>} - tracks the current in-progress animation, if any
    this.inProgressAnimationProperty = new Property(null);

    // @public (read-only) {Property.<boolean>} indicates whether the 'combine halo' should be visible
    this.combineHaloActiveProperty = new Property(false);

    // @public (read-only) - size and state of the hints that can appear at left and right of the expression
    this.leftHintActiveProperty = new Property(false);
    this.leftHintWidthProperty = new Property(0);
    this.rightHintActiveProperty = new Property(false);
    this.rightHintWidthProperty = new Property(0);

    // @private, used to update whether or not coin terms should show minus sign when negative
    this.simplifyNegativesProperty = simplifyNegativesProperty;

    // @public (read-only) - scale, used to shrink the expression when it is collected or uncollected
    this.scaleProperty = new DerivedProperty([this.collectedProperty], collected => collected ? Math.min(EESharedConstants.COLLECTION_AREA_SIZE.width / this.widthProperty.get(), 1) * 0.9 : 1);

    //------------------------------------------------------------------------
    // observable arrays
    //------------------------------------------------------------------------

    // @public (read/listen-only) {ObservableArrayDef.<CoinTerm>} - items should be added and removed via methods
    this.coinTerms = createObservableArray();

    //------------------------------------------------------------------------
    // emitters
    //------------------------------------------------------------------------

    // @public (read-only) {Emitter} - emits an event when an animation finishes and the destination is reached
    this.destinationReachedEmitter = new Emitter();

    // @public (read-only) {Emitter} - emits an event when the size of the expression or the relative positions of the coins
    // change, generally used by the view so that it knows when to update, does NOT fire for position-only changes
    // or for activation/deactivation of hints
    this.layoutChangedEmitter = new Emitter();

    // @public (read-only) {Emitter} - emits an event when this expression should be broken apart
    this.breakApartEmitter = new Emitter();

    //------------------------------------------------------------------------
    // non-observable attributes
    //------------------------------------------------------------------------

    // @private {Array.<CoinTerm>} - tracks coin terms that are hovering over this expression but are being controlled by
    // the user so are not yet part of the expression.  This is used to activate and size the hints.  Coin terms should
    // be added and removed via methods.
    this.hoveringCoinTerms = [];

    // @private {Array.<Expression>} - tracks expressions that are hovering over this expression and would be combined
    // with this one if released by the user.  This is used to activate the 'halo' that indicates that potential
    // combination.
    this.hoveringExpressions = [];

    // @private {boolean} - tracks whether the expression should be resized on the next step
    this.resizeNeeded = false;

    // @private {CoinTerm.id} => {Function} - map used to track user controlled listeners that are added to coin terms
    // that join this expression
    this.mapCoinTermsToUCListeners = {};

    // @private {Bounds2} - bounds that will be used to decide if coin terms or other expressions are in a position to
    // join this one
    this.joinZone = new Bounds2(0, 0, 0, 0);

    // update the join zone as the size and/or position of the expression changes
    Multilink.multilink([this.upperLeftCornerProperty, this.widthProperty, this.heightProperty], (upperLeftCorner, width, height) => {
      this.joinZone.setMinMax(upperLeftCorner.x - height, upperLeftCorner.y, upperLeftCorner.x + width + height, upperLeftCorner.y + height);
    });

    //------------------------------------------------------------------------
    // other initialization
    //------------------------------------------------------------------------

    // @private
    this.setResizeNeededFlagBound = this.setResizeNeededFlag.bind(this);

    // add the initial coin term
    this.addCoinTerm(anchorCoinTerm);

    // add the second coin term
    this.addCoinTerm(floatingCoinTerm);

    // add a listener that will immediately finish animations for incoming coin terms if the expression is grabbed
    this.userControlledProperty.link(userControlled => {
      if (userControlled) {
        this.coinTerms.forEach(coinTerm => {
          if (coinTerm.inProgressAnimationProperty.get()) {
            coinTerm.goImmediatelyToDestination();
          }
        });
      }
    });

    // add a listener that will adjust the scale when needed, generally done when expression is collected or uncollected
    this.scaleProperty.lazyLink((scale, previousScale) => {
      // state checking
      assert && assert(scale <= 1, 'scaling up beyond 1 is not supported');
      assert && assert(scale <= 1 && previousScale === 1 || scale === 1 && previousScale <= 1, 'expressions only scale down from 1 or up to 1, anything else is unexpected');

      // set the scale of each constituent coin term
      this.coinTerms.forEach(coinTerm => {
        coinTerm.scaleProperty.set(scale);
      });

      // Setting the scale of the resident coin terms will often set the 'resizeNeeded' flag, which is intended to be
      // handled during the next call to the step function.  This is done for efficiency, since we don't want to resize
      // the expression on every single coin term size change.  However, this approach is problematic in the case of
      // scale changes because expressions are often scaled when collected and then immediately moved into or out of a
      // collection area, and if the expression's bounds aren't accurate, the placement of the expression (generally
      // animated) gets screwed up.  Because of this, we handle the resizing immediately when the scale changes.
      if (this.resizeNeeded) {
        this.updateSizeAndCoinTermPositions(false);
        this.resizeNeeded = false;
      }
    });

    // monitor the setting for whether negatives are simplified and update the contained coin terms when it changes
    function updateCoinTermMinusSignFlags() {
      self.updateCoinTermShowMinusSignFlag();
    }
    simplifyNegativesProperty.link(updateCoinTermMinusSignFlags);

    // create a dispose function
    this.disposeExpression = () => {
      simplifyNegativesProperty.unlink(updateCoinTermMinusSignFlags);
    };

    // logging, for debug purposes
    phet.log && phet.log(`created ${this.id} with anchor = ${anchorCoinTerm.id} and floating = ${floatingCoinTerm.id}`);
  }

  /**
   * step this expression in time, which will cause it to make any updates in its state that are needed
   * @param dt
   * @public
   */
  step(dt) {
    // If needed, adjust the size of the expression and the positions of the contained coin terms.  This is done here
    // in the step function so that it is only done a max of once per animation frame rather than redoing it for each
    // coin term whose bounds change.
    if (this.resizeNeeded) {
      const animateUpdateMotion = !this.userControlledProperty.get() && !this.inProgressAnimationProperty.get();
      this.updateSizeAndCoinTermPositions(animateUpdateMotion);
      this.resizeNeeded = false;
    }

    // determine the needed height and which hints should be active
    let tallestCoinTermHeight = 0;
    this.coinTerms.forEach(residentCoinTerm => {
      tallestCoinTermHeight = Math.max(tallestCoinTermHeight, residentCoinTerm.localViewBoundsProperty.get().height);
    });
    let rightHintActive = false;
    let rightHintMaxCoinWidth = 0;
    let leftHintActive = false;
    let leftHintMaxCoinWidth = 0;
    this.hoveringCoinTerms.forEach(hoveringCoinTerm => {
      const hctRelativeViewBounds = hoveringCoinTerm.localViewBoundsProperty.get();
      tallestCoinTermHeight = Math.max(tallestCoinTermHeight, hctRelativeViewBounds.height);
      if (hoveringCoinTerm.positionProperty.get().x > this.upperLeftCornerProperty.get().x + this.widthProperty.get() / 2) {
        // coin is over right half of the expression
        rightHintActive = true;
        rightHintMaxCoinWidth = Math.max(rightHintMaxCoinWidth, hctRelativeViewBounds.width);
      } else {
        // coin is over left half of the expression
        leftHintActive = true;
        leftHintMaxCoinWidth = Math.max(leftHintMaxCoinWidth, hctRelativeViewBounds.width);
      }
    });

    // update the hint states
    this.rightHintActiveProperty.set(rightHintActive);
    this.leftHintActiveProperty.set(leftHintActive);

    // to minimize redraws in the view, only update width when the hints are active
    if (this.rightHintActiveProperty.get()) {
      this.rightHintWidthProperty.set(rightHintMaxCoinWidth + 2 * X_MARGIN);
    }
    if (this.leftHintActiveProperty.get()) {
      this.leftHintWidthProperty.set(leftHintMaxCoinWidth + 2 * X_MARGIN);
    }

    // update the property that indicates whether the combine halo is active
    this.combineHaloActiveProperty.set(this.hoveringExpressions.length > 0);

    // update the overall height of the expression if needed
    const neededHeight = tallestCoinTermHeight + 2 * Y_MARGIN;
    if (this.heightProperty.get() !== neededHeight) {
      this.upperLeftCornerProperty.set(this.upperLeftCornerProperty.get().minusXY(0, (neededHeight - this.heightProperty.get()) / 2));
      this.heightProperty.set(neededHeight);
      this.layoutChangedEmitter.emit();
    }

    // Do any motion animation.  This is done last because the animation can sometimes cause the expression to be
    // removed from the model (such as when it joins another expression), and this can cause the prior steps to fail.
    const animation = this.inProgressAnimationProperty.get();
    if (animation) {
      animation.timeSoFar += dt;
      if (animation.timeSoFar < animation.totalDuration) {
        // not there yet - take a step towards the destination
        const easingProportion = Easing.CUBIC_IN_OUT.value(animation.timeSoFar / animation.totalDuration);
        const nextPosition = animation.startPosition.plus(animation.travelVector.withMagnitude(animation.travelVector.magnitude * easingProportion));
        const deltaPosition = nextPosition.minus(this.upperLeftCornerProperty.get());
        this.translate(deltaPosition);
      } else {
        // destination reached, end the animation
        this.setPositionAndDestination(animation.startPosition.plus(animation.travelVector));
        this.inProgressAnimationProperty.set(null);
        this.destinationReachedEmitter.emit();
      }
    }
  }

  /**
   * @public
   */
  dispose() {
    this.disposeExpression();
  }

  /**
   * get the current bounds of this expression
   * @param {Bounds2} [boundsToSet] - optional bounds to set if caller wants to avoid an allocation
   * @public
   */
  getBounds(boundsToSet) {
    const bounds = boundsToSet || new Bounds2(0, 0, 1, 1);
    const upperLeftCorner = this.upperLeftCornerProperty.get();
    bounds.setMinMax(upperLeftCorner.x, upperLeftCorner.y, upperLeftCorner.x + this.widthProperty.get(), upperLeftCorner.y + this.heightProperty.get());
    return bounds;
  }

  /**
   * get a list of the coin terms ordered from left to right based on their position in the expression
   * @private
   */
  getCoinTermsLeftToRight() {
    return this.coinTerms.slice(0).sort((ct1, ct2) => ct1.destinationProperty.get().x - ct2.destinationProperty.get().x);
  }

  /**
   * Size the expression and, if necessary, move the contained coin terms so that all coin terms are appropriately
   * positioned.  This is generally done when something affects the view bounds of the coin terms, such as turning
   * on coefficients or switching from coin view to variable view.
   * @param {boolean} animate
   * @private
   */
  updateSizeAndCoinTermPositions(animate) {
    // keep track of original size so we know when to fire event about layout changes
    const originalWidth = this.widthProperty.get();
    const originalHeight = this.heightProperty.get();
    let coinTermsMoved = false;

    // get an array of the coin terms sorted from left to right
    const coinTermsLeftToRight = this.getCoinTermsLeftToRight();
    const middleCoinTermIndex = Math.floor((coinTermsLeftToRight.length - 1) / 2);
    let xPos;
    const yPos = coinTermsLeftToRight[middleCoinTermIndex].destinationProperty.get().y;
    const scaledCoinTermSpacing = INTER_COIN_TERM_SPACING * this.scaleProperty.get();

    // adjust the positions of coin terms to the right of the middle
    for (let i = middleCoinTermIndex + 1; i < coinTermsLeftToRight.length; i++) {
      // adjust the position of this coin term to be the correct distance from its neighbor to the left
      const leftNeighbor = coinTermsLeftToRight[i - 1];
      xPos = leftNeighbor.destinationProperty.get().x + leftNeighbor.localViewBoundsProperty.get().maxX + scaledCoinTermSpacing - coinTermsLeftToRight[i].localViewBoundsProperty.get().minX;
      if (coinTermsLeftToRight[i].destinationProperty.get().x !== xPos) {
        coinTermsLeftToRight[i].goToPosition(new Vector2(xPos, yPos), animate);
        coinTermsMoved = true;
      }
    }

    // adjust the positions of coin terms to the left of the middle
    for (let i = middleCoinTermIndex - 1; i >= 0; i--) {
      // adjust the position of this coin term to be the correct distance from its neighbor to the right
      const rightNeighbor = coinTermsLeftToRight[i + 1];
      xPos = rightNeighbor.destinationProperty.get().x + rightNeighbor.localViewBoundsProperty.get().minX - scaledCoinTermSpacing - coinTermsLeftToRight[i].localViewBoundsProperty.get().maxX;
      if (coinTermsLeftToRight[i].positionProperty.get().x !== xPos) {
        coinTermsLeftToRight[i].goToPosition(new Vector2(xPos, yPos), animate);
        coinTermsMoved = true;
      }
    }

    // adjust the size and position of this expression
    let maxHeight = 0;
    let totalWidth = 0;
    coinTermsLeftToRight.forEach(coinTerm => {
      const relativeViewBounds = coinTerm.localViewBoundsProperty.get();
      maxHeight = relativeViewBounds.height > maxHeight ? relativeViewBounds.height : maxHeight;
      totalWidth += relativeViewBounds.width;
    });
    const scaledXMargin = X_MARGIN * this.scaleProperty.get();
    const scaledYMargin = Y_MARGIN * this.scaleProperty.get();
    this.upperLeftCornerProperty.set(new Vector2(coinTermsLeftToRight[0].destinationProperty.get().x + coinTermsLeftToRight[0].localViewBoundsProperty.get().minX - scaledXMargin, yPos - maxHeight / 2 - scaledYMargin));
    this.widthProperty.set(totalWidth + 2 * scaledXMargin + scaledCoinTermSpacing * (coinTermsLeftToRight.length - 1));
    this.heightProperty.set(maxHeight + 2 * scaledYMargin);

    // emit an event if the size or the coin term positions changed
    if (this.widthProperty.get() !== originalWidth || this.heightProperty.get() !== originalHeight || coinTermsMoved) {
      this.layoutChangedEmitter.emit();
    }
  }

  /**
   * add the specified coin term to this expression, moving it to the correct position
   * @param {CoinTerm} coinTerm
   * @public
   */
  addCoinTerm(coinTerm) {
    assert && assert(!this.coinTerms.includes(coinTerm), 'coin term is already present in expression');

    // prevent the user from direct interaction with this coin term while it's in this expression
    coinTerm.expressionProperty.set(this);
    this.coinTerms.push(coinTerm);
    const coinTermRelativeViewBounds = coinTerm.localViewBoundsProperty.get();
    const coinTermPosition = coinTerm.positionProperty.get();
    if (this.coinTerms.length === 1) {
      // this is the first coin term, so set the initial width and height
      this.widthProperty.set(coinTermRelativeViewBounds.width + 2 * X_MARGIN);
      this.heightProperty.set(coinTermRelativeViewBounds.height + 2 * X_MARGIN);
      this.upperLeftCornerProperty.set(new Vector2(coinTermPosition.x + coinTermRelativeViewBounds.minX - X_MARGIN, coinTermPosition.y - this.heightProperty.get() / 2));
    } else {
      // adjust the expression's width to accommodate the new coin term
      const originalWidth = this.widthProperty.get();
      this.widthProperty.set(this.widthProperty.get() + INTER_COIN_TERM_SPACING + coinTermRelativeViewBounds.width);
      const upperLeftCorner = this.upperLeftCornerProperty.get();

      // figure out where the coin term should go
      let xDestination;
      if (coinTermPosition.x > upperLeftCorner.x + originalWidth / 2) {
        // add to the right side
        xDestination = upperLeftCorner.x + this.widthProperty.get() - X_MARGIN - coinTermRelativeViewBounds.maxX;
      } else {
        // add to the left side, and shift the expression accordingly
        this.upperLeftCornerProperty.set(upperLeftCorner.minusXY(INTER_COIN_TERM_SPACING + coinTermRelativeViewBounds.width, 0));
        xDestination = this.upperLeftCornerProperty.get().x + X_MARGIN - coinTermRelativeViewBounds.minX;
      }
      const destination = new Vector2(xDestination, this.upperLeftCornerProperty.get().y + this.heightProperty.get() / 2);

      // decide whether or not to animate to the destination
      if (!this.userControlledProperty.get() && !this.inProgressAnimationProperty.get()) {
        // animate to the new position
        coinTerm.travelToDestination(destination);
      } else {
        // if this expression is being moved by the user or is animating, don't animate - it won't end well
        coinTerm.setPositionAndDestination(destination);
      }
    }

    // if the coin term being added is currently on the list of hovering coin terms, remove it
    if (this.isCoinTermHovering(coinTerm)) {
      this.removeHoveringCoinTerm(coinTerm);
      if (this.hoveringCoinTerms.length === 0) {
        this.rightHintActiveProperty.set(false);
        this.leftHintActiveProperty.set(false);
      }
    }

    // make sure that the coin term can't be broken apart while in an expression
    coinTerm.breakApartAllowedProperty.set(false);

    // add a listener to resize the expression if the bounds of this coin term change
    coinTerm.localViewBoundsProperty.lazyLink(this.setResizeNeededFlagBound);

    // add a listener to update whether minus sign is shown when negative when the user moves this coin term
    const userControlledListener = this.updateCoinTermShowMinusSignFlag.bind(this);
    assert && assert(!this.mapCoinTermsToUCListeners[coinTerm.id], 'key should not yet exist in map');
    this.mapCoinTermsToUCListeners[coinTerm.id] = userControlledListener;
    coinTerm.userControlledProperty.link(userControlledListener);

    // update whether the coin terms should be showing minus signs
    this.updateCoinTermShowMinusSignFlag();

    // trigger an event so that the view is sure to be updated
    this.layoutChangedEmitter.emit();
  }

  /**
   * remove a coin term from this expression
   * @param {CoinTerm} coinTerm
   * @public
   */
  removeCoinTerm(coinTerm) {
    coinTerm.expressionProperty.set(null);
    coinTerm.breakApartAllowedProperty.set(true);
    coinTerm.showMinusSignWhenNegativeProperty.set(true);
    this.coinTerms.remove(coinTerm);
    coinTerm.localViewBoundsProperty.unlink(this.setResizeNeededFlagBound);
    coinTerm.userControlledProperty.unlink(this.mapCoinTermsToUCListeners[coinTerm.id]);
    delete this.mapCoinTermsToUCListeners[coinTerm.id];
    if (this.coinTerms.length > 0) {
      this.updateSizeAndCoinTermPositions();
      this.updateCoinTermShowMinusSignFlag();
    }
    phet.log && phet.log(`removed ${coinTerm.id} from ${this.id}`);
  }

  /**
   * @param {CoinTerm} coinTerm
   * @private
   */
  containsCoinTerm(coinTerm) {
    return this.coinTerms.includes(coinTerm);
  }

  /**
   * remove all coin terms
   * @returns {Array.<CoinTerm>} a simple array with all coin terms, sorted in left-to-right order
   * @public
   */
  removeAllCoinTerms() {
    // make a copy of the coin terms and sort them in left to right order
    const coinTermsLeftToRight = this.getCoinTermsLeftToRight();

    // remove them from this expression
    coinTermsLeftToRight.forEach(coinTerm => {
      this.removeCoinTerm(coinTerm);
    });

    // return the sorted array
    return coinTermsLeftToRight;
  }

  /**
   * add back a coin term that is already part of this expression, but something about it (most likely its position)
   * has changed
   * @param {CoinTerm} coinTerm
   * @public
   */
  reintegrateCoinTerm(coinTerm) {
    assert && assert(this.containsCoinTerm(coinTerm), 'coin term is not part of this expression, can\'t be reintegrated');

    // get an array of the coin terms sorted from left to right
    const coinTermsLeftToRight = this.getCoinTermsLeftToRight();

    // update coin term minus sign flags
    this.updateCoinTermShowMinusSignFlag();

    // set the position of each coin term based on its order
    let leftEdge = this.upperLeftCornerProperty.get().x + X_MARGIN;
    const centerY = this.upperLeftCornerProperty.get().y + this.heightProperty.get() / 2;
    coinTermsLeftToRight.forEach(orderedCoinTerm => {
      orderedCoinTerm.travelToDestination(new Vector2(leftEdge - orderedCoinTerm.localViewBoundsProperty.get().minX, centerY));
      leftEdge += orderedCoinTerm.localViewBoundsProperty.get().width + INTER_COIN_TERM_SPACING;
    });

    // trigger an event so that the view is sure to be updated
    this.layoutChangedEmitter.emit();
  }

  /**
   * update the contained coin terms for whether they should show minus sign when negative, supports subtraction mode
   * @private
   */
  updateCoinTermShowMinusSignFlag() {
    const coinTermsLeftToRight = this.getCoinTermsLeftToRight();
    let oneOrMoreChanged = false;
    coinTermsLeftToRight.forEach((residentCoinTerm, index) => {
      // The minus sign is suppressed if subtraction is being shown, the coin term is not user controlled, and the
      // coin term is not the first one in the expression so that subtraction expressions will look correct.
      const showMinusSignWhenNegative = !(this.simplifyNegativesProperty.value && index > 0) || residentCoinTerm.userControlledProperty.get();
      if (showMinusSignWhenNegative !== residentCoinTerm.showMinusSignWhenNegativeProperty.get()) {
        residentCoinTerm.showMinusSignWhenNegativeProperty.set(showMinusSignWhenNegative);
        oneOrMoreChanged = true;
      }
    });
    if (oneOrMoreChanged) {
      this.layoutChangedEmitter.emit();
    }
  }

  /**
   * move, a.k.a. translate, by the specified amount and move the coin terms too
   * @param {Vector2} deltaPosition
   * @private
   */
  translate(deltaPosition) {
    // move the coin terms
    this.coinTerms.forEach(coinTerm => {
      coinTerm.setPositionAndDestination(coinTerm.positionProperty.get().plus(deltaPosition));
    });

    // move the outline shape
    this.upperLeftCornerProperty.set(this.upperLeftCornerProperty.get().plus(deltaPosition));
  }

  /**
   * move to the specified destination, but do so a step at a time rather than all at once
   * @param {Vector2} upperLeftCornerDestination
   * @public
   */
  travelToDestination(upperLeftCornerDestination) {
    const animationDuration = Math.min(this.upperLeftCornerProperty.get().distance(upperLeftCornerDestination) / ANIMATION_SPEED, MAX_ANIMATION_TIME);
    if (animationDuration === 0) {
      // already there, so emit a notification and call it good
      this.destinationReachedEmitter.emit();
    } else {
      // set up the animation to get to the destination
      this.inProgressAnimationProperty.set(new AnimationSpec(this.upperLeftCornerProperty.get().copy(), upperLeftCornerDestination.minus(this.upperLeftCornerProperty.get()), animationDuration));
    }
  }

  /**
   * set both the position and destination of the upper left corner immediately, i.e. without animation
   * @param {Vector2} upperLeftCornerDestination
   * @public
   */
  setPositionAndDestination(upperLeftCornerDestination) {
    this.translate(upperLeftCornerDestination.minus(this.upperLeftCornerProperty.get()));
  }

  /**
   * initiate a break apart, which just emits an event and counts on parent model to handle
   * @public
   */
  breakApart() {
    this.breakApartEmitter.emit();
  }

  /**
   * get the amount of overlap between the provided coin term's bounds and this expression's "join zone"
   * @param {CoinTerm} coinTerm
   * @returns {number} the area of the overlap
   * @public
   */
  getCoinTermJoinZoneOverlap(coinTerm) {
    const coinTermBounds = coinTerm.getViewBounds();
    const xOverlap = Math.max(0, Math.min(coinTermBounds.maxX, this.joinZone.maxX) - Math.max(coinTermBounds.minX, this.joinZone.minX));
    const yOverlap = Math.max(0, Math.min(coinTermBounds.maxY, this.joinZone.maxY) - Math.max(coinTermBounds.minY, this.joinZone.minY));
    return xOverlap * yOverlap;
  }

  /**
   * get the amount of overlap between the provided expression and this expression
   * @param {Expression||EECollectionArea} otherEntity - must provide a 'getBounds' method
   * @returns {number} the area of the overlap
   * @public
   */
  getOverlap(otherEntity) {
    const otherExpressionBounds = otherEntity.getBounds();
    const thisExpressionBounds = this.getBounds();
    const xOverlap = Math.max(0, Math.min(otherExpressionBounds.maxX, thisExpressionBounds.maxX) - Math.max(otherExpressionBounds.minX, thisExpressionBounds.minX));
    const yOverlap = Math.max(0, Math.min(otherExpressionBounds.maxY, thisExpressionBounds.maxY) - Math.max(otherExpressionBounds.minY, thisExpressionBounds.minY));
    return xOverlap * yOverlap;
  }

  /**
   * get the upper right corner of this expression
   * @returns {Vector2}
   * @public
   */
  getUpperRightCorner() {
    return this.upperLeftCornerProperty.get().plusXY(this.widthProperty.get(), 0);
  }

  /**
   * Add a coin term to the list of those that are hovering over this expression.  This is a no-op if the coin term is
   * already on the list.
   * @param {CoinTerm} coinTerm
   * @public
   */
  addHoveringCoinTerm(coinTerm) {
    if (this.hoveringCoinTerms.indexOf(coinTerm) === -1) {
      this.hoveringCoinTerms.push(coinTerm);
      coinTerm.breakApartAllowedProperty.set(false);
    }
  }

  /**
   * Remove a coin term from the list of those that are hovering over this expression.  This is a no-op if the coin
   * term is not on the list.
   * @param {CoinTerm} coinTerm
   * @public
   */
  removeHoveringCoinTerm(coinTerm) {
    const index = this.hoveringCoinTerms.indexOf(coinTerm);
    if (index !== -1) {
      this.hoveringCoinTerms.splice(index, 1);
      coinTerm.breakApartAllowedProperty.set(true);
    }
  }

  /**
   * clear the list of coin terms that are currently hovering over this expression
   * @public
   */
  clearHoveringCoinTerms() {
    this.hoveringCoinTerms.forEach(hoveringCoinTerm => {
      hoveringCoinTerm.breakApartAllowedProperty.set(true);
    });
    this.hoveringCoinTerms.length = 0;
  }

  /**
   * Add an expression to the list of those that are hovering over this expression.  This is a no-op if the expression
   * is already on the list.
   * @param {Expression} expression
   * @public
   */
  addHoveringExpression(expression) {
    if (this.hoveringExpressions.indexOf(expression) === -1) {
      this.hoveringExpressions.push(expression);
    }
  }

  /**
   * Remove an expression from the list of those that are hovering over this expression.  This is a no-op if the
   * provided expression is not on the list.
   * @param {Expression} expression
   * @public
   */
  removeHoveringExpression(expression) {
    const index = this.hoveringExpressions.indexOf(expression);
    if (index !== -1) {
      this.hoveringExpressions.splice(index, 1);
    }
  }

  /**
   * clear the list of other expressions that are currently hovering over this expression
   * @public
   */
  clearHoveringExpressions() {
    this.hoveringExpressions.length = 0;
  }

  /**
   * returns true if the given coin term is on the list of those hovering over the expression
   * @param {CoinTerm} coinTerm
   * @returns {boolean}
   * @private
   */
  isCoinTermHovering(coinTerm) {
    return this.hoveringCoinTerms.indexOf(coinTerm) > -1;
  }

  /**
   * set the resize needed flag, used to hook up listeners
   * @private
   */
  setResizeNeededFlag() {
    this.resizeNeeded = true;
  }
}
expressionExchange.register('Expression', Expression);
export default Expression;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJEZXJpdmVkUHJvcGVydHkiLCJFbWl0dGVyIiwiTXVsdGlsaW5rIiwiUHJvcGVydHkiLCJCb3VuZHMyIiwiVmVjdG9yMiIsIlZlY3RvcjJQcm9wZXJ0eSIsIkVhc2luZyIsImV4cHJlc3Npb25FeGNoYW5nZSIsIkVFU2hhcmVkQ29uc3RhbnRzIiwiQW5pbWF0aW9uU3BlYyIsIklOVEVSX0NPSU5fVEVSTV9TUEFDSU5HIiwiWF9NQVJHSU4iLCJZX01BUkdJTiIsIkFOSU1BVElPTl9TUEVFRCIsIk1BWF9BTklNQVRJT05fVElNRSIsImNyZWF0aW9uQ291bnQiLCJFeHByZXNzaW9uIiwiY29uc3RydWN0b3IiLCJhbmNob3JDb2luVGVybSIsImZsb2F0aW5nQ29pblRlcm0iLCJzaW1wbGlmeU5lZ2F0aXZlc1Byb3BlcnR5Iiwic2VsZiIsImlkIiwidXBwZXJMZWZ0Q29ybmVyUHJvcGVydHkiLCJaRVJPIiwid2lkdGhQcm9wZXJ0eSIsImhlaWdodFByb3BlcnR5IiwidXNlckNvbnRyb2xsZWRQcm9wZXJ0eSIsImluRWRpdE1vZGVQcm9wZXJ0eSIsImNvbGxlY3RlZFByb3BlcnR5IiwiaW5Qcm9ncmVzc0FuaW1hdGlvblByb3BlcnR5IiwiY29tYmluZUhhbG9BY3RpdmVQcm9wZXJ0eSIsImxlZnRIaW50QWN0aXZlUHJvcGVydHkiLCJsZWZ0SGludFdpZHRoUHJvcGVydHkiLCJyaWdodEhpbnRBY3RpdmVQcm9wZXJ0eSIsInJpZ2h0SGludFdpZHRoUHJvcGVydHkiLCJzY2FsZVByb3BlcnR5IiwiY29sbGVjdGVkIiwiTWF0aCIsIm1pbiIsIkNPTExFQ1RJT05fQVJFQV9TSVpFIiwid2lkdGgiLCJnZXQiLCJjb2luVGVybXMiLCJkZXN0aW5hdGlvblJlYWNoZWRFbWl0dGVyIiwibGF5b3V0Q2hhbmdlZEVtaXR0ZXIiLCJicmVha0FwYXJ0RW1pdHRlciIsImhvdmVyaW5nQ29pblRlcm1zIiwiaG92ZXJpbmdFeHByZXNzaW9ucyIsInJlc2l6ZU5lZWRlZCIsIm1hcENvaW5UZXJtc1RvVUNMaXN0ZW5lcnMiLCJqb2luWm9uZSIsIm11bHRpbGluayIsInVwcGVyTGVmdENvcm5lciIsImhlaWdodCIsInNldE1pbk1heCIsIngiLCJ5Iiwic2V0UmVzaXplTmVlZGVkRmxhZ0JvdW5kIiwic2V0UmVzaXplTmVlZGVkRmxhZyIsImJpbmQiLCJhZGRDb2luVGVybSIsImxpbmsiLCJ1c2VyQ29udHJvbGxlZCIsImZvckVhY2giLCJjb2luVGVybSIsImdvSW1tZWRpYXRlbHlUb0Rlc3RpbmF0aW9uIiwibGF6eUxpbmsiLCJzY2FsZSIsInByZXZpb3VzU2NhbGUiLCJhc3NlcnQiLCJzZXQiLCJ1cGRhdGVTaXplQW5kQ29pblRlcm1Qb3NpdGlvbnMiLCJ1cGRhdGVDb2luVGVybU1pbnVzU2lnbkZsYWdzIiwidXBkYXRlQ29pblRlcm1TaG93TWludXNTaWduRmxhZyIsImRpc3Bvc2VFeHByZXNzaW9uIiwidW5saW5rIiwicGhldCIsImxvZyIsInN0ZXAiLCJkdCIsImFuaW1hdGVVcGRhdGVNb3Rpb24iLCJ0YWxsZXN0Q29pblRlcm1IZWlnaHQiLCJyZXNpZGVudENvaW5UZXJtIiwibWF4IiwibG9jYWxWaWV3Qm91bmRzUHJvcGVydHkiLCJyaWdodEhpbnRBY3RpdmUiLCJyaWdodEhpbnRNYXhDb2luV2lkdGgiLCJsZWZ0SGludEFjdGl2ZSIsImxlZnRIaW50TWF4Q29pbldpZHRoIiwiaG92ZXJpbmdDb2luVGVybSIsImhjdFJlbGF0aXZlVmlld0JvdW5kcyIsInBvc2l0aW9uUHJvcGVydHkiLCJsZW5ndGgiLCJuZWVkZWRIZWlnaHQiLCJtaW51c1hZIiwiZW1pdCIsImFuaW1hdGlvbiIsInRpbWVTb0ZhciIsInRvdGFsRHVyYXRpb24iLCJlYXNpbmdQcm9wb3J0aW9uIiwiQ1VCSUNfSU5fT1VUIiwidmFsdWUiLCJuZXh0UG9zaXRpb24iLCJzdGFydFBvc2l0aW9uIiwicGx1cyIsInRyYXZlbFZlY3RvciIsIndpdGhNYWduaXR1ZGUiLCJtYWduaXR1ZGUiLCJkZWx0YVBvc2l0aW9uIiwibWludXMiLCJ0cmFuc2xhdGUiLCJzZXRQb3NpdGlvbkFuZERlc3RpbmF0aW9uIiwiZGlzcG9zZSIsImdldEJvdW5kcyIsImJvdW5kc1RvU2V0IiwiYm91bmRzIiwiZ2V0Q29pblRlcm1zTGVmdFRvUmlnaHQiLCJzbGljZSIsInNvcnQiLCJjdDEiLCJjdDIiLCJkZXN0aW5hdGlvblByb3BlcnR5IiwiYW5pbWF0ZSIsIm9yaWdpbmFsV2lkdGgiLCJvcmlnaW5hbEhlaWdodCIsImNvaW5UZXJtc01vdmVkIiwiY29pblRlcm1zTGVmdFRvUmlnaHQiLCJtaWRkbGVDb2luVGVybUluZGV4IiwiZmxvb3IiLCJ4UG9zIiwieVBvcyIsInNjYWxlZENvaW5UZXJtU3BhY2luZyIsImkiLCJsZWZ0TmVpZ2hib3IiLCJtYXhYIiwibWluWCIsImdvVG9Qb3NpdGlvbiIsInJpZ2h0TmVpZ2hib3IiLCJtYXhIZWlnaHQiLCJ0b3RhbFdpZHRoIiwicmVsYXRpdmVWaWV3Qm91bmRzIiwic2NhbGVkWE1hcmdpbiIsInNjYWxlZFlNYXJnaW4iLCJpbmNsdWRlcyIsImV4cHJlc3Npb25Qcm9wZXJ0eSIsInB1c2giLCJjb2luVGVybVJlbGF0aXZlVmlld0JvdW5kcyIsImNvaW5UZXJtUG9zaXRpb24iLCJ4RGVzdGluYXRpb24iLCJkZXN0aW5hdGlvbiIsInRyYXZlbFRvRGVzdGluYXRpb24iLCJpc0NvaW5UZXJtSG92ZXJpbmciLCJyZW1vdmVIb3ZlcmluZ0NvaW5UZXJtIiwiYnJlYWtBcGFydEFsbG93ZWRQcm9wZXJ0eSIsInVzZXJDb250cm9sbGVkTGlzdGVuZXIiLCJyZW1vdmVDb2luVGVybSIsInNob3dNaW51c1NpZ25XaGVuTmVnYXRpdmVQcm9wZXJ0eSIsInJlbW92ZSIsImNvbnRhaW5zQ29pblRlcm0iLCJyZW1vdmVBbGxDb2luVGVybXMiLCJyZWludGVncmF0ZUNvaW5UZXJtIiwibGVmdEVkZ2UiLCJjZW50ZXJZIiwib3JkZXJlZENvaW5UZXJtIiwib25lT3JNb3JlQ2hhbmdlZCIsImluZGV4Iiwic2hvd01pbnVzU2lnbldoZW5OZWdhdGl2ZSIsInVwcGVyTGVmdENvcm5lckRlc3RpbmF0aW9uIiwiYW5pbWF0aW9uRHVyYXRpb24iLCJkaXN0YW5jZSIsImNvcHkiLCJicmVha0FwYXJ0IiwiZ2V0Q29pblRlcm1Kb2luWm9uZU92ZXJsYXAiLCJjb2luVGVybUJvdW5kcyIsImdldFZpZXdCb3VuZHMiLCJ4T3ZlcmxhcCIsInlPdmVybGFwIiwibWF4WSIsIm1pblkiLCJnZXRPdmVybGFwIiwib3RoZXJFbnRpdHkiLCJvdGhlckV4cHJlc3Npb25Cb3VuZHMiLCJ0aGlzRXhwcmVzc2lvbkJvdW5kcyIsImdldFVwcGVyUmlnaHRDb3JuZXIiLCJwbHVzWFkiLCJhZGRIb3ZlcmluZ0NvaW5UZXJtIiwiaW5kZXhPZiIsInNwbGljZSIsImNsZWFySG92ZXJpbmdDb2luVGVybXMiLCJhZGRIb3ZlcmluZ0V4cHJlc3Npb24iLCJleHByZXNzaW9uIiwicmVtb3ZlSG92ZXJpbmdFeHByZXNzaW9uIiwiY2xlYXJIb3ZlcmluZ0V4cHJlc3Npb25zIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFeHByZXNzaW9uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoaXMgdHlwZSByZXByZXNlbnRzIGEgbW9kZWwgb2YgYW4gZXhwcmVzc2lvbi4gIEFuIGV4cHJlc3Npb24gaXMgYSBzZXQgb2YgY29pbiB0ZXJtcyBhbGwgcG9zaXRpb25lZCBpbiBhIGxpbmUuICBJblxyXG4gKiB0aGUgdmlldywgYW4gZXhwcmVzc2lvbiBpcyByZXByZXNlbnRlZCBhcyBhIGJveCBjb250YWluaW5nIHRoZSBjb2luIHRlcm1zIHdpdGggcGx1cyBzeW1ib2xlcyBiZXR3ZWVuIHRoZW0uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgY3JlYXRlT2JzZXJ2YWJsZUFycmF5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMlByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRWFzaW5nIGZyb20gJy4uLy4uLy4uLy4uL3R3aXh0L2pzL0Vhc2luZy5qcyc7XHJcbmltcG9ydCBleHByZXNzaW9uRXhjaGFuZ2UgZnJvbSAnLi4vLi4vZXhwcmVzc2lvbkV4Y2hhbmdlLmpzJztcclxuaW1wb3J0IEVFU2hhcmVkQ29uc3RhbnRzIGZyb20gJy4uL0VFU2hhcmVkQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEFuaW1hdGlvblNwZWMgZnJvbSAnLi9BbmltYXRpb25TcGVjLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBJTlRFUl9DT0lOX1RFUk1fU1BBQ0lORyA9IDMwOyAvLyBpbiBtb2RlbCB1bml0cywgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG5jb25zdCBYX01BUkdJTiA9IDE0OyAvLyBtYXJnaW4gZm9yIGNvaW4gdGVybXMsIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuY29uc3QgWV9NQVJHSU4gPSAxMjsgLy8gbWFyZ2luIGZvciBjb2luIHRlcm1zLCBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbmNvbnN0IEFOSU1BVElPTl9TUEVFRCA9IDQwMDsgLy8gaW4gbW9kZWwgdW5pdHMgKHdoaWNoIGFyZSBiYXNpY2FsbHkgc2NyZWVuIGNvb3JkaW5hdGVzKSBwZXIgc2Vjb25kXHJcbmNvbnN0IE1BWF9BTklNQVRJT05fVElNRSA9IDE7IC8vIHNlY29uZHNcclxuXHJcbi8vIGNsYXNzIHZhciBmb3IgY3JlYXRpbmcgdW5pcXVlIElEc1xyXG5sZXQgY3JlYXRpb25Db3VudCA9IDA7XHJcblxyXG5jbGFzcyBFeHByZXNzaW9uIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtDb2luVGVybX0gYW5jaG9yQ29pblRlcm1cclxuICAgKiBAcGFyYW0ge0NvaW5UZXJtfSBmbG9hdGluZ0NvaW5UZXJtXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IHNpbXBsaWZ5TmVnYXRpdmVzUHJvcGVydHlcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggYW5jaG9yQ29pblRlcm0sIGZsb2F0aW5nQ29pblRlcm0sIHNpbXBsaWZ5TmVnYXRpdmVzUHJvcGVydHkgKSB7XHJcblxyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICB0aGlzLmlkID0gYEVYLSR7KytjcmVhdGlvbkNvdW50fWA7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIHByb3BlcnRpZXNcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgdGhpcy51cHBlckxlZnRDb3JuZXJQcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIFZlY3RvcjIuWkVSTyApOyAvLyBAcHVibGljXHJcbiAgICB0aGlzLndpZHRoUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDAgKTsgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7UHJvcGVydHkuPG51bWJlcj59XHJcbiAgICB0aGlzLmhlaWdodFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAwICk7IC8vIEBwdWJsaWMgKHJlYWQtb25seSkge1Byb3BlcnR5LjxudW1iZXI+fVxyXG4gICAgdGhpcy51c2VyQ29udHJvbGxlZFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBmYWxzZSApOyAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59XHJcbiAgICB0aGlzLmluRWRpdE1vZGVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggZmFsc2UgKTsgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fSAtIGluZGljYXRlcyB3aGV0aGVyIHRoaXMgZXhwcmVzc2lvbiBpcyBiZWluZyBlZGl0ZWRcclxuICAgIHRoaXMuY29sbGVjdGVkUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIGZhbHNlICk7IC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gLSBpbmRpY2F0ZXMgd2hldGhlciB0aGlzIGlzIGluIGEgY29sbGVjdGlvbiBib3ggKGZvciBnYW1lKVxyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge1Byb3BlcnR5LjxBbmltYXRpb25TcGVjPn0gLSB0cmFja3MgdGhlIGN1cnJlbnQgaW4tcHJvZ3Jlc3MgYW5pbWF0aW9uLCBpZiBhbnlcclxuICAgIHRoaXMuaW5Qcm9ncmVzc0FuaW1hdGlvblByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBudWxsICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7UHJvcGVydHkuPGJvb2xlYW4+fSBpbmRpY2F0ZXMgd2hldGhlciB0aGUgJ2NvbWJpbmUgaGFsbycgc2hvdWxkIGJlIHZpc2libGVcclxuICAgIHRoaXMuY29tYmluZUhhbG9BY3RpdmVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIC0gc2l6ZSBhbmQgc3RhdGUgb2YgdGhlIGhpbnRzIHRoYXQgY2FuIGFwcGVhciBhdCBsZWZ0IGFuZCByaWdodCBvZiB0aGUgZXhwcmVzc2lvblxyXG4gICAgdGhpcy5sZWZ0SGludEFjdGl2ZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBmYWxzZSApO1xyXG4gICAgdGhpcy5sZWZ0SGludFdpZHRoUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDAgKTtcclxuICAgIHRoaXMucmlnaHRIaW50QWN0aXZlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIGZhbHNlICk7XHJcbiAgICB0aGlzLnJpZ2h0SGludFdpZHRoUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDAgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSwgdXNlZCB0byB1cGRhdGUgd2hldGhlciBvciBub3QgY29pbiB0ZXJtcyBzaG91bGQgc2hvdyBtaW51cyBzaWduIHdoZW4gbmVnYXRpdmVcclxuICAgIHRoaXMuc2ltcGxpZnlOZWdhdGl2ZXNQcm9wZXJ0eSA9IHNpbXBsaWZ5TmVnYXRpdmVzUHJvcGVydHk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSAtIHNjYWxlLCB1c2VkIHRvIHNocmluayB0aGUgZXhwcmVzc2lvbiB3aGVuIGl0IGlzIGNvbGxlY3RlZCBvciB1bmNvbGxlY3RlZFxyXG4gICAgdGhpcy5zY2FsZVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLmNvbGxlY3RlZFByb3BlcnR5IF0sIGNvbGxlY3RlZCA9PiBjb2xsZWN0ZWQgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLm1pbiggRUVTaGFyZWRDb25zdGFudHMuQ09MTEVDVElPTl9BUkVBX1NJWkUud2lkdGggLyB0aGlzLndpZHRoUHJvcGVydHkuZ2V0KCksIDEgKSAqIDAuOSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDEgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gb2JzZXJ2YWJsZSBhcnJheXNcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC9saXN0ZW4tb25seSkge09ic2VydmFibGVBcnJheURlZi48Q29pblRlcm0+fSAtIGl0ZW1zIHNob3VsZCBiZSBhZGRlZCBhbmQgcmVtb3ZlZCB2aWEgbWV0aG9kc1xyXG4gICAgdGhpcy5jb2luVGVybXMgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gZW1pdHRlcnNcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7RW1pdHRlcn0gLSBlbWl0cyBhbiBldmVudCB3aGVuIGFuIGFuaW1hdGlvbiBmaW5pc2hlcyBhbmQgdGhlIGRlc3RpbmF0aW9uIGlzIHJlYWNoZWRcclxuICAgIHRoaXMuZGVzdGluYXRpb25SZWFjaGVkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7RW1pdHRlcn0gLSBlbWl0cyBhbiBldmVudCB3aGVuIHRoZSBzaXplIG9mIHRoZSBleHByZXNzaW9uIG9yIHRoZSByZWxhdGl2ZSBwb3NpdGlvbnMgb2YgdGhlIGNvaW5zXHJcbiAgICAvLyBjaGFuZ2UsIGdlbmVyYWxseSB1c2VkIGJ5IHRoZSB2aWV3IHNvIHRoYXQgaXQga25vd3Mgd2hlbiB0byB1cGRhdGUsIGRvZXMgTk9UIGZpcmUgZm9yIHBvc2l0aW9uLW9ubHkgY2hhbmdlc1xyXG4gICAgLy8gb3IgZm9yIGFjdGl2YXRpb24vZGVhY3RpdmF0aW9uIG9mIGhpbnRzXHJcbiAgICB0aGlzLmxheW91dENoYW5nZWRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtFbWl0dGVyfSAtIGVtaXRzIGFuIGV2ZW50IHdoZW4gdGhpcyBleHByZXNzaW9uIHNob3VsZCBiZSBicm9rZW4gYXBhcnRcclxuICAgIHRoaXMuYnJlYWtBcGFydEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBub24tb2JzZXJ2YWJsZSBhdHRyaWJ1dGVzXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIEBwcml2YXRlIHtBcnJheS48Q29pblRlcm0+fSAtIHRyYWNrcyBjb2luIHRlcm1zIHRoYXQgYXJlIGhvdmVyaW5nIG92ZXIgdGhpcyBleHByZXNzaW9uIGJ1dCBhcmUgYmVpbmcgY29udHJvbGxlZCBieVxyXG4gICAgLy8gdGhlIHVzZXIgc28gYXJlIG5vdCB5ZXQgcGFydCBvZiB0aGUgZXhwcmVzc2lvbi4gIFRoaXMgaXMgdXNlZCB0byBhY3RpdmF0ZSBhbmQgc2l6ZSB0aGUgaGludHMuICBDb2luIHRlcm1zIHNob3VsZFxyXG4gICAgLy8gYmUgYWRkZWQgYW5kIHJlbW92ZWQgdmlhIG1ldGhvZHMuXHJcbiAgICB0aGlzLmhvdmVyaW5nQ29pblRlcm1zID0gW107XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0FycmF5LjxFeHByZXNzaW9uPn0gLSB0cmFja3MgZXhwcmVzc2lvbnMgdGhhdCBhcmUgaG92ZXJpbmcgb3ZlciB0aGlzIGV4cHJlc3Npb24gYW5kIHdvdWxkIGJlIGNvbWJpbmVkXHJcbiAgICAvLyB3aXRoIHRoaXMgb25lIGlmIHJlbGVhc2VkIGJ5IHRoZSB1c2VyLiAgVGhpcyBpcyB1c2VkIHRvIGFjdGl2YXRlIHRoZSAnaGFsbycgdGhhdCBpbmRpY2F0ZXMgdGhhdCBwb3RlbnRpYWxcclxuICAgIC8vIGNvbWJpbmF0aW9uLlxyXG4gICAgdGhpcy5ob3ZlcmluZ0V4cHJlc3Npb25zID0gW107XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gdHJhY2tzIHdoZXRoZXIgdGhlIGV4cHJlc3Npb24gc2hvdWxkIGJlIHJlc2l6ZWQgb24gdGhlIG5leHQgc3RlcFxyXG4gICAgdGhpcy5yZXNpemVOZWVkZWQgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Q29pblRlcm0uaWR9ID0+IHtGdW5jdGlvbn0gLSBtYXAgdXNlZCB0byB0cmFjayB1c2VyIGNvbnRyb2xsZWQgbGlzdGVuZXJzIHRoYXQgYXJlIGFkZGVkIHRvIGNvaW4gdGVybXNcclxuICAgIC8vIHRoYXQgam9pbiB0aGlzIGV4cHJlc3Npb25cclxuICAgIHRoaXMubWFwQ29pblRlcm1zVG9VQ0xpc3RlbmVycyA9IHt9O1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtCb3VuZHMyfSAtIGJvdW5kcyB0aGF0IHdpbGwgYmUgdXNlZCB0byBkZWNpZGUgaWYgY29pbiB0ZXJtcyBvciBvdGhlciBleHByZXNzaW9ucyBhcmUgaW4gYSBwb3NpdGlvbiB0b1xyXG4gICAgLy8gam9pbiB0aGlzIG9uZVxyXG4gICAgdGhpcy5qb2luWm9uZSA9IG5ldyBCb3VuZHMyKCAwLCAwLCAwLCAwICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBqb2luIHpvbmUgYXMgdGhlIHNpemUgYW5kL29yIHBvc2l0aW9uIG9mIHRoZSBleHByZXNzaW9uIGNoYW5nZXNcclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoXHJcbiAgICAgIFsgdGhpcy51cHBlckxlZnRDb3JuZXJQcm9wZXJ0eSwgdGhpcy53aWR0aFByb3BlcnR5LCB0aGlzLmhlaWdodFByb3BlcnR5IF0sXHJcbiAgICAgICggdXBwZXJMZWZ0Q29ybmVyLCB3aWR0aCwgaGVpZ2h0ICkgPT4ge1xyXG4gICAgICAgIHRoaXMuam9pblpvbmUuc2V0TWluTWF4KFxyXG4gICAgICAgICAgdXBwZXJMZWZ0Q29ybmVyLnggLSBoZWlnaHQsXHJcbiAgICAgICAgICB1cHBlckxlZnRDb3JuZXIueSxcclxuICAgICAgICAgIHVwcGVyTGVmdENvcm5lci54ICsgd2lkdGggKyBoZWlnaHQsXHJcbiAgICAgICAgICB1cHBlckxlZnRDb3JuZXIueSArIGhlaWdodCApO1xyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBvdGhlciBpbml0aWFsaXphdGlvblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5zZXRSZXNpemVOZWVkZWRGbGFnQm91bmQgPSB0aGlzLnNldFJlc2l6ZU5lZWRlZEZsYWcuYmluZCggdGhpcyApO1xyXG5cclxuICAgIC8vIGFkZCB0aGUgaW5pdGlhbCBjb2luIHRlcm1cclxuICAgIHRoaXMuYWRkQ29pblRlcm0oIGFuY2hvckNvaW5UZXJtICk7XHJcblxyXG4gICAgLy8gYWRkIHRoZSBzZWNvbmQgY29pbiB0ZXJtXHJcbiAgICB0aGlzLmFkZENvaW5UZXJtKCBmbG9hdGluZ0NvaW5UZXJtICk7XHJcblxyXG4gICAgLy8gYWRkIGEgbGlzdGVuZXIgdGhhdCB3aWxsIGltbWVkaWF0ZWx5IGZpbmlzaCBhbmltYXRpb25zIGZvciBpbmNvbWluZyBjb2luIHRlcm1zIGlmIHRoZSBleHByZXNzaW9uIGlzIGdyYWJiZWRcclxuICAgIHRoaXMudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5saW5rKCB1c2VyQ29udHJvbGxlZCA9PiB7XHJcbiAgICAgIGlmICggdXNlckNvbnRyb2xsZWQgKSB7XHJcbiAgICAgICAgdGhpcy5jb2luVGVybXMuZm9yRWFjaCggY29pblRlcm0gPT4ge1xyXG4gICAgICAgICAgaWYgKCBjb2luVGVybS5pblByb2dyZXNzQW5pbWF0aW9uUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgICAgICAgIGNvaW5UZXJtLmdvSW1tZWRpYXRlbHlUb0Rlc3RpbmF0aW9uKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gYWRkIGEgbGlzdGVuZXIgdGhhdCB3aWxsIGFkanVzdCB0aGUgc2NhbGUgd2hlbiBuZWVkZWQsIGdlbmVyYWxseSBkb25lIHdoZW4gZXhwcmVzc2lvbiBpcyBjb2xsZWN0ZWQgb3IgdW5jb2xsZWN0ZWRcclxuICAgIHRoaXMuc2NhbGVQcm9wZXJ0eS5sYXp5TGluayggKCBzY2FsZSwgcHJldmlvdXNTY2FsZSApID0+IHtcclxuXHJcbiAgICAgIC8vIHN0YXRlIGNoZWNraW5nXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHNjYWxlIDw9IDEsICdzY2FsaW5nIHVwIGJleW9uZCAxIGlzIG5vdCBzdXBwb3J0ZWQnICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICAgICAgKCBzY2FsZSA8PSAxICYmIHByZXZpb3VzU2NhbGUgPT09IDEgKSB8fCAoIHNjYWxlID09PSAxICYmIHByZXZpb3VzU2NhbGUgPD0gMSApLFxyXG4gICAgICAgICdleHByZXNzaW9ucyBvbmx5IHNjYWxlIGRvd24gZnJvbSAxIG9yIHVwIHRvIDEsIGFueXRoaW5nIGVsc2UgaXMgdW5leHBlY3RlZCdcclxuICAgICAgKTtcclxuXHJcbiAgICAgIC8vIHNldCB0aGUgc2NhbGUgb2YgZWFjaCBjb25zdGl0dWVudCBjb2luIHRlcm1cclxuICAgICAgdGhpcy5jb2luVGVybXMuZm9yRWFjaCggY29pblRlcm0gPT4ge1xyXG4gICAgICAgIGNvaW5UZXJtLnNjYWxlUHJvcGVydHkuc2V0KCBzY2FsZSApO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBTZXR0aW5nIHRoZSBzY2FsZSBvZiB0aGUgcmVzaWRlbnQgY29pbiB0ZXJtcyB3aWxsIG9mdGVuIHNldCB0aGUgJ3Jlc2l6ZU5lZWRlZCcgZmxhZywgd2hpY2ggaXMgaW50ZW5kZWQgdG8gYmVcclxuICAgICAgLy8gaGFuZGxlZCBkdXJpbmcgdGhlIG5leHQgY2FsbCB0byB0aGUgc3RlcCBmdW5jdGlvbi4gIFRoaXMgaXMgZG9uZSBmb3IgZWZmaWNpZW5jeSwgc2luY2Ugd2UgZG9uJ3Qgd2FudCB0byByZXNpemVcclxuICAgICAgLy8gdGhlIGV4cHJlc3Npb24gb24gZXZlcnkgc2luZ2xlIGNvaW4gdGVybSBzaXplIGNoYW5nZS4gIEhvd2V2ZXIsIHRoaXMgYXBwcm9hY2ggaXMgcHJvYmxlbWF0aWMgaW4gdGhlIGNhc2Ugb2ZcclxuICAgICAgLy8gc2NhbGUgY2hhbmdlcyBiZWNhdXNlIGV4cHJlc3Npb25zIGFyZSBvZnRlbiBzY2FsZWQgd2hlbiBjb2xsZWN0ZWQgYW5kIHRoZW4gaW1tZWRpYXRlbHkgbW92ZWQgaW50byBvciBvdXQgb2YgYVxyXG4gICAgICAvLyBjb2xsZWN0aW9uIGFyZWEsIGFuZCBpZiB0aGUgZXhwcmVzc2lvbidzIGJvdW5kcyBhcmVuJ3QgYWNjdXJhdGUsIHRoZSBwbGFjZW1lbnQgb2YgdGhlIGV4cHJlc3Npb24gKGdlbmVyYWxseVxyXG4gICAgICAvLyBhbmltYXRlZCkgZ2V0cyBzY3Jld2VkIHVwLiAgQmVjYXVzZSBvZiB0aGlzLCB3ZSBoYW5kbGUgdGhlIHJlc2l6aW5nIGltbWVkaWF0ZWx5IHdoZW4gdGhlIHNjYWxlIGNoYW5nZXMuXHJcbiAgICAgIGlmICggdGhpcy5yZXNpemVOZWVkZWQgKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVTaXplQW5kQ29pblRlcm1Qb3NpdGlvbnMoIGZhbHNlICk7XHJcbiAgICAgICAgdGhpcy5yZXNpemVOZWVkZWQgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIG1vbml0b3IgdGhlIHNldHRpbmcgZm9yIHdoZXRoZXIgbmVnYXRpdmVzIGFyZSBzaW1wbGlmaWVkIGFuZCB1cGRhdGUgdGhlIGNvbnRhaW5lZCBjb2luIHRlcm1zIHdoZW4gaXQgY2hhbmdlc1xyXG4gICAgZnVuY3Rpb24gdXBkYXRlQ29pblRlcm1NaW51c1NpZ25GbGFncygpIHtcclxuICAgICAgc2VsZi51cGRhdGVDb2luVGVybVNob3dNaW51c1NpZ25GbGFnKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2ltcGxpZnlOZWdhdGl2ZXNQcm9wZXJ0eS5saW5rKCB1cGRhdGVDb2luVGVybU1pbnVzU2lnbkZsYWdzICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIGEgZGlzcG9zZSBmdW5jdGlvblxyXG4gICAgdGhpcy5kaXNwb3NlRXhwcmVzc2lvbiA9ICgpID0+IHtcclxuICAgICAgc2ltcGxpZnlOZWdhdGl2ZXNQcm9wZXJ0eS51bmxpbmsoIHVwZGF0ZUNvaW5UZXJtTWludXNTaWduRmxhZ3MgKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gbG9nZ2luZywgZm9yIGRlYnVnIHB1cnBvc2VzXHJcbiAgICBwaGV0LmxvZyAmJiBwaGV0LmxvZyggYGNyZWF0ZWQgJHt0aGlzLmlkfSB3aXRoIGFuY2hvciA9ICR7YW5jaG9yQ29pblRlcm0uaWRcclxuICAgIH0gYW5kIGZsb2F0aW5nID0gJHtmbG9hdGluZ0NvaW5UZXJtLmlkfWAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHN0ZXAgdGhpcyBleHByZXNzaW9uIGluIHRpbWUsIHdoaWNoIHdpbGwgY2F1c2UgaXQgdG8gbWFrZSBhbnkgdXBkYXRlcyBpbiBpdHMgc3RhdGUgdGhhdCBhcmUgbmVlZGVkXHJcbiAgICogQHBhcmFtIGR0XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG5cclxuICAgIC8vIElmIG5lZWRlZCwgYWRqdXN0IHRoZSBzaXplIG9mIHRoZSBleHByZXNzaW9uIGFuZCB0aGUgcG9zaXRpb25zIG9mIHRoZSBjb250YWluZWQgY29pbiB0ZXJtcy4gIFRoaXMgaXMgZG9uZSBoZXJlXHJcbiAgICAvLyBpbiB0aGUgc3RlcCBmdW5jdGlvbiBzbyB0aGF0IGl0IGlzIG9ubHkgZG9uZSBhIG1heCBvZiBvbmNlIHBlciBhbmltYXRpb24gZnJhbWUgcmF0aGVyIHRoYW4gcmVkb2luZyBpdCBmb3IgZWFjaFxyXG4gICAgLy8gY29pbiB0ZXJtIHdob3NlIGJvdW5kcyBjaGFuZ2UuXHJcbiAgICBpZiAoIHRoaXMucmVzaXplTmVlZGVkICkge1xyXG4gICAgICBjb25zdCBhbmltYXRlVXBkYXRlTW90aW9uID0gIXRoaXMudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5nZXQoKSAmJiAhdGhpcy5pblByb2dyZXNzQW5pbWF0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgIHRoaXMudXBkYXRlU2l6ZUFuZENvaW5UZXJtUG9zaXRpb25zKCBhbmltYXRlVXBkYXRlTW90aW9uICk7XHJcbiAgICAgIHRoaXMucmVzaXplTmVlZGVkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZGV0ZXJtaW5lIHRoZSBuZWVkZWQgaGVpZ2h0IGFuZCB3aGljaCBoaW50cyBzaG91bGQgYmUgYWN0aXZlXHJcbiAgICBsZXQgdGFsbGVzdENvaW5UZXJtSGVpZ2h0ID0gMDtcclxuICAgIHRoaXMuY29pblRlcm1zLmZvckVhY2goIHJlc2lkZW50Q29pblRlcm0gPT4ge1xyXG4gICAgICB0YWxsZXN0Q29pblRlcm1IZWlnaHQgPSBNYXRoLm1heCggdGFsbGVzdENvaW5UZXJtSGVpZ2h0LCByZXNpZGVudENvaW5UZXJtLmxvY2FsVmlld0JvdW5kc1Byb3BlcnR5LmdldCgpLmhlaWdodCApO1xyXG4gICAgfSApO1xyXG4gICAgbGV0IHJpZ2h0SGludEFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgbGV0IHJpZ2h0SGludE1heENvaW5XaWR0aCA9IDA7XHJcbiAgICBsZXQgbGVmdEhpbnRBY3RpdmUgPSBmYWxzZTtcclxuICAgIGxldCBsZWZ0SGludE1heENvaW5XaWR0aCA9IDA7XHJcbiAgICB0aGlzLmhvdmVyaW5nQ29pblRlcm1zLmZvckVhY2goIGhvdmVyaW5nQ29pblRlcm0gPT4ge1xyXG4gICAgICBjb25zdCBoY3RSZWxhdGl2ZVZpZXdCb3VuZHMgPSBob3ZlcmluZ0NvaW5UZXJtLmxvY2FsVmlld0JvdW5kc1Byb3BlcnR5LmdldCgpO1xyXG4gICAgICB0YWxsZXN0Q29pblRlcm1IZWlnaHQgPSBNYXRoLm1heCggdGFsbGVzdENvaW5UZXJtSGVpZ2h0LCBoY3RSZWxhdGl2ZVZpZXdCb3VuZHMuaGVpZ2h0ICk7XHJcbiAgICAgIGlmICggaG92ZXJpbmdDb2luVGVybS5wb3NpdGlvblByb3BlcnR5LmdldCgpLnggPiB0aGlzLnVwcGVyTGVmdENvcm5lclByb3BlcnR5LmdldCgpLnggKyB0aGlzLndpZHRoUHJvcGVydHkuZ2V0KCkgLyAyICkge1xyXG5cclxuICAgICAgICAvLyBjb2luIGlzIG92ZXIgcmlnaHQgaGFsZiBvZiB0aGUgZXhwcmVzc2lvblxyXG4gICAgICAgIHJpZ2h0SGludEFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgcmlnaHRIaW50TWF4Q29pbldpZHRoID0gTWF0aC5tYXgoIHJpZ2h0SGludE1heENvaW5XaWR0aCwgaGN0UmVsYXRpdmVWaWV3Qm91bmRzLndpZHRoICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIGNvaW4gaXMgb3ZlciBsZWZ0IGhhbGYgb2YgdGhlIGV4cHJlc3Npb25cclxuICAgICAgICBsZWZ0SGludEFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgbGVmdEhpbnRNYXhDb2luV2lkdGggPSBNYXRoLm1heCggbGVmdEhpbnRNYXhDb2luV2lkdGgsIGhjdFJlbGF0aXZlVmlld0JvdW5kcy53aWR0aCApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBoaW50IHN0YXRlc1xyXG4gICAgdGhpcy5yaWdodEhpbnRBY3RpdmVQcm9wZXJ0eS5zZXQoIHJpZ2h0SGludEFjdGl2ZSApO1xyXG4gICAgdGhpcy5sZWZ0SGludEFjdGl2ZVByb3BlcnR5LnNldCggbGVmdEhpbnRBY3RpdmUgKTtcclxuXHJcbiAgICAvLyB0byBtaW5pbWl6ZSByZWRyYXdzIGluIHRoZSB2aWV3LCBvbmx5IHVwZGF0ZSB3aWR0aCB3aGVuIHRoZSBoaW50cyBhcmUgYWN0aXZlXHJcbiAgICBpZiAoIHRoaXMucmlnaHRIaW50QWN0aXZlUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIHRoaXMucmlnaHRIaW50V2lkdGhQcm9wZXJ0eS5zZXQoIHJpZ2h0SGludE1heENvaW5XaWR0aCArIDIgKiBYX01BUkdJTiApO1xyXG4gICAgfVxyXG4gICAgaWYgKCB0aGlzLmxlZnRIaW50QWN0aXZlUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIHRoaXMubGVmdEhpbnRXaWR0aFByb3BlcnR5LnNldCggbGVmdEhpbnRNYXhDb2luV2lkdGggKyAyICogWF9NQVJHSU4gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB1cGRhdGUgdGhlIHByb3BlcnR5IHRoYXQgaW5kaWNhdGVzIHdoZXRoZXIgdGhlIGNvbWJpbmUgaGFsbyBpcyBhY3RpdmVcclxuICAgIHRoaXMuY29tYmluZUhhbG9BY3RpdmVQcm9wZXJ0eS5zZXQoIHRoaXMuaG92ZXJpbmdFeHByZXNzaW9ucy5sZW5ndGggPiAwICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBvdmVyYWxsIGhlaWdodCBvZiB0aGUgZXhwcmVzc2lvbiBpZiBuZWVkZWRcclxuICAgIGNvbnN0IG5lZWRlZEhlaWdodCA9IHRhbGxlc3RDb2luVGVybUhlaWdodCArIDIgKiBZX01BUkdJTjtcclxuICAgIGlmICggdGhpcy5oZWlnaHRQcm9wZXJ0eS5nZXQoKSAhPT0gbmVlZGVkSGVpZ2h0ICkge1xyXG4gICAgICB0aGlzLnVwcGVyTGVmdENvcm5lclByb3BlcnR5LnNldCggdGhpcy51cHBlckxlZnRDb3JuZXJQcm9wZXJ0eS5nZXQoKS5taW51c1hZKFxyXG4gICAgICAgIDAsXHJcbiAgICAgICAgKCBuZWVkZWRIZWlnaHQgLSB0aGlzLmhlaWdodFByb3BlcnR5LmdldCgpICkgLyAyXHJcbiAgICAgICkgKTtcclxuICAgICAgdGhpcy5oZWlnaHRQcm9wZXJ0eS5zZXQoIG5lZWRlZEhlaWdodCApO1xyXG4gICAgICB0aGlzLmxheW91dENoYW5nZWRFbWl0dGVyLmVtaXQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBEbyBhbnkgbW90aW9uIGFuaW1hdGlvbi4gIFRoaXMgaXMgZG9uZSBsYXN0IGJlY2F1c2UgdGhlIGFuaW1hdGlvbiBjYW4gc29tZXRpbWVzIGNhdXNlIHRoZSBleHByZXNzaW9uIHRvIGJlXHJcbiAgICAvLyByZW1vdmVkIGZyb20gdGhlIG1vZGVsIChzdWNoIGFzIHdoZW4gaXQgam9pbnMgYW5vdGhlciBleHByZXNzaW9uKSwgYW5kIHRoaXMgY2FuIGNhdXNlIHRoZSBwcmlvciBzdGVwcyB0byBmYWlsLlxyXG4gICAgY29uc3QgYW5pbWF0aW9uID0gdGhpcy5pblByb2dyZXNzQW5pbWF0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICBpZiAoIGFuaW1hdGlvbiApIHtcclxuICAgICAgYW5pbWF0aW9uLnRpbWVTb0ZhciArPSBkdDtcclxuICAgICAgaWYgKCBhbmltYXRpb24udGltZVNvRmFyIDwgYW5pbWF0aW9uLnRvdGFsRHVyYXRpb24gKSB7XHJcblxyXG4gICAgICAgIC8vIG5vdCB0aGVyZSB5ZXQgLSB0YWtlIGEgc3RlcCB0b3dhcmRzIHRoZSBkZXN0aW5hdGlvblxyXG4gICAgICAgIGNvbnN0IGVhc2luZ1Byb3BvcnRpb24gPSBFYXNpbmcuQ1VCSUNfSU5fT1VULnZhbHVlKCBhbmltYXRpb24udGltZVNvRmFyIC8gYW5pbWF0aW9uLnRvdGFsRHVyYXRpb24gKTtcclxuICAgICAgICBjb25zdCBuZXh0UG9zaXRpb24gPSBhbmltYXRpb24uc3RhcnRQb3NpdGlvbi5wbHVzKFxyXG4gICAgICAgICAgYW5pbWF0aW9uLnRyYXZlbFZlY3Rvci53aXRoTWFnbml0dWRlKCBhbmltYXRpb24udHJhdmVsVmVjdG9yLm1hZ25pdHVkZSAqIGVhc2luZ1Byb3BvcnRpb24gKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgY29uc3QgZGVsdGFQb3NpdGlvbiA9IG5leHRQb3NpdGlvbi5taW51cyggdGhpcy51cHBlckxlZnRDb3JuZXJQcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgICAgIHRoaXMudHJhbnNsYXRlKCBkZWx0YVBvc2l0aW9uICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIGRlc3RpbmF0aW9uIHJlYWNoZWQsIGVuZCB0aGUgYW5pbWF0aW9uXHJcbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvbkFuZERlc3RpbmF0aW9uKCBhbmltYXRpb24uc3RhcnRQb3NpdGlvbi5wbHVzKCBhbmltYXRpb24udHJhdmVsVmVjdG9yICkgKTtcclxuICAgICAgICB0aGlzLmluUHJvZ3Jlc3NBbmltYXRpb25Qcm9wZXJ0eS5zZXQoIG51bGwgKTtcclxuICAgICAgICB0aGlzLmRlc3RpbmF0aW9uUmVhY2hlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHRoaXMuZGlzcG9zZUV4cHJlc3Npb24oKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGdldCB0aGUgY3VycmVudCBib3VuZHMgb2YgdGhpcyBleHByZXNzaW9uXHJcbiAgICogQHBhcmFtIHtCb3VuZHMyfSBbYm91bmRzVG9TZXRdIC0gb3B0aW9uYWwgYm91bmRzIHRvIHNldCBpZiBjYWxsZXIgd2FudHMgdG8gYXZvaWQgYW4gYWxsb2NhdGlvblxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRCb3VuZHMoIGJvdW5kc1RvU2V0ICkge1xyXG4gICAgY29uc3QgYm91bmRzID0gYm91bmRzVG9TZXQgfHwgbmV3IEJvdW5kczIoIDAsIDAsIDEsIDEgKTtcclxuICAgIGNvbnN0IHVwcGVyTGVmdENvcm5lciA9IHRoaXMudXBwZXJMZWZ0Q29ybmVyUHJvcGVydHkuZ2V0KCk7XHJcbiAgICBib3VuZHMuc2V0TWluTWF4KFxyXG4gICAgICB1cHBlckxlZnRDb3JuZXIueCxcclxuICAgICAgdXBwZXJMZWZ0Q29ybmVyLnksXHJcbiAgICAgIHVwcGVyTGVmdENvcm5lci54ICsgdGhpcy53aWR0aFByb3BlcnR5LmdldCgpLFxyXG4gICAgICB1cHBlckxlZnRDb3JuZXIueSArIHRoaXMuaGVpZ2h0UHJvcGVydHkuZ2V0KClcclxuICAgICk7XHJcbiAgICByZXR1cm4gYm91bmRzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogZ2V0IGEgbGlzdCBvZiB0aGUgY29pbiB0ZXJtcyBvcmRlcmVkIGZyb20gbGVmdCB0byByaWdodCBiYXNlZCBvbiB0aGVpciBwb3NpdGlvbiBpbiB0aGUgZXhwcmVzc2lvblxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgZ2V0Q29pblRlcm1zTGVmdFRvUmlnaHQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jb2luVGVybXMuc2xpY2UoIDAgKS5zb3J0KCAoIGN0MSwgY3QyICkgPT4gY3QxLmRlc3RpbmF0aW9uUHJvcGVydHkuZ2V0KCkueCAtIGN0Mi5kZXN0aW5hdGlvblByb3BlcnR5LmdldCgpLnggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNpemUgdGhlIGV4cHJlc3Npb24gYW5kLCBpZiBuZWNlc3NhcnksIG1vdmUgdGhlIGNvbnRhaW5lZCBjb2luIHRlcm1zIHNvIHRoYXQgYWxsIGNvaW4gdGVybXMgYXJlIGFwcHJvcHJpYXRlbHlcclxuICAgKiBwb3NpdGlvbmVkLiAgVGhpcyBpcyBnZW5lcmFsbHkgZG9uZSB3aGVuIHNvbWV0aGluZyBhZmZlY3RzIHRoZSB2aWV3IGJvdW5kcyBvZiB0aGUgY29pbiB0ZXJtcywgc3VjaCBhcyB0dXJuaW5nXHJcbiAgICogb24gY29lZmZpY2llbnRzIG9yIHN3aXRjaGluZyBmcm9tIGNvaW4gdmlldyB0byB2YXJpYWJsZSB2aWV3LlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gYW5pbWF0ZVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdXBkYXRlU2l6ZUFuZENvaW5UZXJtUG9zaXRpb25zKCBhbmltYXRlICkge1xyXG5cclxuICAgIC8vIGtlZXAgdHJhY2sgb2Ygb3JpZ2luYWwgc2l6ZSBzbyB3ZSBrbm93IHdoZW4gdG8gZmlyZSBldmVudCBhYm91dCBsYXlvdXQgY2hhbmdlc1xyXG4gICAgY29uc3Qgb3JpZ2luYWxXaWR0aCA9IHRoaXMud2lkdGhQcm9wZXJ0eS5nZXQoKTtcclxuICAgIGNvbnN0IG9yaWdpbmFsSGVpZ2h0ID0gdGhpcy5oZWlnaHRQcm9wZXJ0eS5nZXQoKTtcclxuICAgIGxldCBjb2luVGVybXNNb3ZlZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIGdldCBhbiBhcnJheSBvZiB0aGUgY29pbiB0ZXJtcyBzb3J0ZWQgZnJvbSBsZWZ0IHRvIHJpZ2h0XHJcbiAgICBjb25zdCBjb2luVGVybXNMZWZ0VG9SaWdodCA9IHRoaXMuZ2V0Q29pblRlcm1zTGVmdFRvUmlnaHQoKTtcclxuXHJcbiAgICBjb25zdCBtaWRkbGVDb2luVGVybUluZGV4ID0gTWF0aC5mbG9vciggKCBjb2luVGVybXNMZWZ0VG9SaWdodC5sZW5ndGggLSAxICkgLyAyICk7XHJcbiAgICBsZXQgeFBvcztcclxuICAgIGNvbnN0IHlQb3MgPSBjb2luVGVybXNMZWZ0VG9SaWdodFsgbWlkZGxlQ29pblRlcm1JbmRleCBdLmRlc3RpbmF0aW9uUHJvcGVydHkuZ2V0KCkueTtcclxuICAgIGNvbnN0IHNjYWxlZENvaW5UZXJtU3BhY2luZyA9IElOVEVSX0NPSU5fVEVSTV9TUEFDSU5HICogdGhpcy5zY2FsZVByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgIC8vIGFkanVzdCB0aGUgcG9zaXRpb25zIG9mIGNvaW4gdGVybXMgdG8gdGhlIHJpZ2h0IG9mIHRoZSBtaWRkbGVcclxuICAgIGZvciAoIGxldCBpID0gbWlkZGxlQ29pblRlcm1JbmRleCArIDE7IGkgPCBjb2luVGVybXNMZWZ0VG9SaWdodC5sZW5ndGg7IGkrKyApIHtcclxuXHJcbiAgICAgIC8vIGFkanVzdCB0aGUgcG9zaXRpb24gb2YgdGhpcyBjb2luIHRlcm0gdG8gYmUgdGhlIGNvcnJlY3QgZGlzdGFuY2UgZnJvbSBpdHMgbmVpZ2hib3IgdG8gdGhlIGxlZnRcclxuICAgICAgY29uc3QgbGVmdE5laWdoYm9yID0gY29pblRlcm1zTGVmdFRvUmlnaHRbIGkgLSAxIF07XHJcbiAgICAgIHhQb3MgPSBsZWZ0TmVpZ2hib3IuZGVzdGluYXRpb25Qcm9wZXJ0eS5nZXQoKS54ICsgbGVmdE5laWdoYm9yLmxvY2FsVmlld0JvdW5kc1Byb3BlcnR5LmdldCgpLm1heFggK1xyXG4gICAgICAgICAgICAgc2NhbGVkQ29pblRlcm1TcGFjaW5nIC0gY29pblRlcm1zTGVmdFRvUmlnaHRbIGkgXS5sb2NhbFZpZXdCb3VuZHNQcm9wZXJ0eS5nZXQoKS5taW5YO1xyXG4gICAgICBpZiAoIGNvaW5UZXJtc0xlZnRUb1JpZ2h0WyBpIF0uZGVzdGluYXRpb25Qcm9wZXJ0eS5nZXQoKS54ICE9PSB4UG9zICkge1xyXG4gICAgICAgIGNvaW5UZXJtc0xlZnRUb1JpZ2h0WyBpIF0uZ29Ub1Bvc2l0aW9uKCBuZXcgVmVjdG9yMiggeFBvcywgeVBvcyApLCBhbmltYXRlICk7XHJcbiAgICAgICAgY29pblRlcm1zTW92ZWQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYWRqdXN0IHRoZSBwb3NpdGlvbnMgb2YgY29pbiB0ZXJtcyB0byB0aGUgbGVmdCBvZiB0aGUgbWlkZGxlXHJcbiAgICBmb3IgKCBsZXQgaSA9IG1pZGRsZUNvaW5UZXJtSW5kZXggLSAxOyBpID49IDA7IGktLSApIHtcclxuICAgICAgLy8gYWRqdXN0IHRoZSBwb3NpdGlvbiBvZiB0aGlzIGNvaW4gdGVybSB0byBiZSB0aGUgY29ycmVjdCBkaXN0YW5jZSBmcm9tIGl0cyBuZWlnaGJvciB0byB0aGUgcmlnaHRcclxuICAgICAgY29uc3QgcmlnaHROZWlnaGJvciA9IGNvaW5UZXJtc0xlZnRUb1JpZ2h0WyBpICsgMSBdO1xyXG4gICAgICB4UG9zID0gcmlnaHROZWlnaGJvci5kZXN0aW5hdGlvblByb3BlcnR5LmdldCgpLnggKyByaWdodE5laWdoYm9yLmxvY2FsVmlld0JvdW5kc1Byb3BlcnR5LmdldCgpLm1pblggLVxyXG4gICAgICAgICAgICAgc2NhbGVkQ29pblRlcm1TcGFjaW5nIC0gY29pblRlcm1zTGVmdFRvUmlnaHRbIGkgXS5sb2NhbFZpZXdCb3VuZHNQcm9wZXJ0eS5nZXQoKS5tYXhYO1xyXG4gICAgICBpZiAoIGNvaW5UZXJtc0xlZnRUb1JpZ2h0WyBpIF0ucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54ICE9PSB4UG9zICkge1xyXG4gICAgICAgIGNvaW5UZXJtc0xlZnRUb1JpZ2h0WyBpIF0uZ29Ub1Bvc2l0aW9uKCBuZXcgVmVjdG9yMiggeFBvcywgeVBvcyApLCBhbmltYXRlICk7XHJcbiAgICAgICAgY29pblRlcm1zTW92ZWQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYWRqdXN0IHRoZSBzaXplIGFuZCBwb3NpdGlvbiBvZiB0aGlzIGV4cHJlc3Npb25cclxuICAgIGxldCBtYXhIZWlnaHQgPSAwO1xyXG4gICAgbGV0IHRvdGFsV2lkdGggPSAwO1xyXG4gICAgY29pblRlcm1zTGVmdFRvUmlnaHQuZm9yRWFjaCggY29pblRlcm0gPT4ge1xyXG4gICAgICBjb25zdCByZWxhdGl2ZVZpZXdCb3VuZHMgPSBjb2luVGVybS5sb2NhbFZpZXdCb3VuZHNQcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgbWF4SGVpZ2h0ID0gcmVsYXRpdmVWaWV3Qm91bmRzLmhlaWdodCA+IG1heEhlaWdodCA/IHJlbGF0aXZlVmlld0JvdW5kcy5oZWlnaHQgOiBtYXhIZWlnaHQ7XHJcbiAgICAgIHRvdGFsV2lkdGggKz0gcmVsYXRpdmVWaWV3Qm91bmRzLndpZHRoO1xyXG4gICAgfSApO1xyXG4gICAgY29uc3Qgc2NhbGVkWE1hcmdpbiA9IFhfTUFSR0lOICogdGhpcy5zY2FsZVByb3BlcnR5LmdldCgpO1xyXG4gICAgY29uc3Qgc2NhbGVkWU1hcmdpbiA9IFlfTUFSR0lOICogdGhpcy5zY2FsZVByb3BlcnR5LmdldCgpO1xyXG4gICAgdGhpcy51cHBlckxlZnRDb3JuZXJQcm9wZXJ0eS5zZXQoIG5ldyBWZWN0b3IyKFxyXG4gICAgICBjb2luVGVybXNMZWZ0VG9SaWdodFsgMCBdLmRlc3RpbmF0aW9uUHJvcGVydHkuZ2V0KCkueCArXHJcbiAgICAgIGNvaW5UZXJtc0xlZnRUb1JpZ2h0WyAwIF0ubG9jYWxWaWV3Qm91bmRzUHJvcGVydHkuZ2V0KCkubWluWCAtIHNjYWxlZFhNYXJnaW4sXHJcbiAgICAgIHlQb3MgLSBtYXhIZWlnaHQgLyAyIC0gc2NhbGVkWU1hcmdpblxyXG4gICAgKSApO1xyXG4gICAgdGhpcy53aWR0aFByb3BlcnR5LnNldCggdG90YWxXaWR0aCArIDIgKiBzY2FsZWRYTWFyZ2luICsgc2NhbGVkQ29pblRlcm1TcGFjaW5nICogKCBjb2luVGVybXNMZWZ0VG9SaWdodC5sZW5ndGggLSAxICkgKTtcclxuICAgIHRoaXMuaGVpZ2h0UHJvcGVydHkuc2V0KCBtYXhIZWlnaHQgKyAyICogc2NhbGVkWU1hcmdpbiApO1xyXG5cclxuICAgIC8vIGVtaXQgYW4gZXZlbnQgaWYgdGhlIHNpemUgb3IgdGhlIGNvaW4gdGVybSBwb3NpdGlvbnMgY2hhbmdlZFxyXG4gICAgaWYgKCB0aGlzLndpZHRoUHJvcGVydHkuZ2V0KCkgIT09IG9yaWdpbmFsV2lkdGggfHwgdGhpcy5oZWlnaHRQcm9wZXJ0eS5nZXQoKSAhPT0gb3JpZ2luYWxIZWlnaHQgfHwgY29pblRlcm1zTW92ZWQgKSB7XHJcbiAgICAgIHRoaXMubGF5b3V0Q2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogYWRkIHRoZSBzcGVjaWZpZWQgY29pbiB0ZXJtIHRvIHRoaXMgZXhwcmVzc2lvbiwgbW92aW5nIGl0IHRvIHRoZSBjb3JyZWN0IHBvc2l0aW9uXHJcbiAgICogQHBhcmFtIHtDb2luVGVybX0gY29pblRlcm1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYWRkQ29pblRlcm0oIGNvaW5UZXJtICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmNvaW5UZXJtcy5pbmNsdWRlcyggY29pblRlcm0gKSwgJ2NvaW4gdGVybSBpcyBhbHJlYWR5IHByZXNlbnQgaW4gZXhwcmVzc2lvbicgKTtcclxuXHJcbiAgICAvLyBwcmV2ZW50IHRoZSB1c2VyIGZyb20gZGlyZWN0IGludGVyYWN0aW9uIHdpdGggdGhpcyBjb2luIHRlcm0gd2hpbGUgaXQncyBpbiB0aGlzIGV4cHJlc3Npb25cclxuICAgIGNvaW5UZXJtLmV4cHJlc3Npb25Qcm9wZXJ0eS5zZXQoIHRoaXMgKTtcclxuXHJcbiAgICB0aGlzLmNvaW5UZXJtcy5wdXNoKCBjb2luVGVybSApO1xyXG5cclxuICAgIGNvbnN0IGNvaW5UZXJtUmVsYXRpdmVWaWV3Qm91bmRzID0gY29pblRlcm0ubG9jYWxWaWV3Qm91bmRzUHJvcGVydHkuZ2V0KCk7XHJcbiAgICBjb25zdCBjb2luVGVybVBvc2l0aW9uID0gY29pblRlcm0ucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKTtcclxuXHJcbiAgICBpZiAoIHRoaXMuY29pblRlcm1zLmxlbmd0aCA9PT0gMSApIHtcclxuXHJcbiAgICAgIC8vIHRoaXMgaXMgdGhlIGZpcnN0IGNvaW4gdGVybSwgc28gc2V0IHRoZSBpbml0aWFsIHdpZHRoIGFuZCBoZWlnaHRcclxuICAgICAgdGhpcy53aWR0aFByb3BlcnR5LnNldCggY29pblRlcm1SZWxhdGl2ZVZpZXdCb3VuZHMud2lkdGggKyAyICogWF9NQVJHSU4gKTtcclxuICAgICAgdGhpcy5oZWlnaHRQcm9wZXJ0eS5zZXQoIGNvaW5UZXJtUmVsYXRpdmVWaWV3Qm91bmRzLmhlaWdodCArIDIgKiBYX01BUkdJTiApO1xyXG4gICAgICB0aGlzLnVwcGVyTGVmdENvcm5lclByb3BlcnR5LnNldCggbmV3IFZlY3RvcjIoXHJcbiAgICAgICAgY29pblRlcm1Qb3NpdGlvbi54ICsgY29pblRlcm1SZWxhdGl2ZVZpZXdCb3VuZHMubWluWCAtIFhfTUFSR0lOLFxyXG4gICAgICAgIGNvaW5UZXJtUG9zaXRpb24ueSAtIHRoaXMuaGVpZ2h0UHJvcGVydHkuZ2V0KCkgLyAyXHJcbiAgICAgICkgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gYWRqdXN0IHRoZSBleHByZXNzaW9uJ3Mgd2lkdGggdG8gYWNjb21tb2RhdGUgdGhlIG5ldyBjb2luIHRlcm1cclxuICAgICAgY29uc3Qgb3JpZ2luYWxXaWR0aCA9IHRoaXMud2lkdGhQcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgdGhpcy53aWR0aFByb3BlcnR5LnNldCggdGhpcy53aWR0aFByb3BlcnR5LmdldCgpICsgSU5URVJfQ09JTl9URVJNX1NQQUNJTkcgKyBjb2luVGVybVJlbGF0aXZlVmlld0JvdW5kcy53aWR0aCApO1xyXG4gICAgICBjb25zdCB1cHBlckxlZnRDb3JuZXIgPSB0aGlzLnVwcGVyTGVmdENvcm5lclByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgICAgLy8gZmlndXJlIG91dCB3aGVyZSB0aGUgY29pbiB0ZXJtIHNob3VsZCBnb1xyXG4gICAgICBsZXQgeERlc3RpbmF0aW9uO1xyXG4gICAgICBpZiAoIGNvaW5UZXJtUG9zaXRpb24ueCA+IHVwcGVyTGVmdENvcm5lci54ICsgb3JpZ2luYWxXaWR0aCAvIDIgKSB7XHJcbiAgICAgICAgLy8gYWRkIHRvIHRoZSByaWdodCBzaWRlXHJcbiAgICAgICAgeERlc3RpbmF0aW9uID0gdXBwZXJMZWZ0Q29ybmVyLnggKyB0aGlzLndpZHRoUHJvcGVydHkuZ2V0KCkgLSBYX01BUkdJTiAtIGNvaW5UZXJtUmVsYXRpdmVWaWV3Qm91bmRzLm1heFg7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgLy8gYWRkIHRvIHRoZSBsZWZ0IHNpZGUsIGFuZCBzaGlmdCB0aGUgZXhwcmVzc2lvbiBhY2NvcmRpbmdseVxyXG4gICAgICAgIHRoaXMudXBwZXJMZWZ0Q29ybmVyUHJvcGVydHkuc2V0KFxyXG4gICAgICAgICAgdXBwZXJMZWZ0Q29ybmVyLm1pbnVzWFkoIElOVEVSX0NPSU5fVEVSTV9TUEFDSU5HICsgY29pblRlcm1SZWxhdGl2ZVZpZXdCb3VuZHMud2lkdGgsIDAgKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgeERlc3RpbmF0aW9uID0gdGhpcy51cHBlckxlZnRDb3JuZXJQcm9wZXJ0eS5nZXQoKS54ICsgWF9NQVJHSU4gLSBjb2luVGVybVJlbGF0aXZlVmlld0JvdW5kcy5taW5YO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBkZXN0aW5hdGlvbiA9IG5ldyBWZWN0b3IyKFxyXG4gICAgICAgIHhEZXN0aW5hdGlvbixcclxuICAgICAgICB0aGlzLnVwcGVyTGVmdENvcm5lclByb3BlcnR5LmdldCgpLnkgKyB0aGlzLmhlaWdodFByb3BlcnR5LmdldCgpIC8gMlxyXG4gICAgICApO1xyXG5cclxuICAgICAgLy8gZGVjaWRlIHdoZXRoZXIgb3Igbm90IHRvIGFuaW1hdGUgdG8gdGhlIGRlc3RpbmF0aW9uXHJcbiAgICAgIGlmICggIXRoaXMudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5nZXQoKSAmJiAhdGhpcy5pblByb2dyZXNzQW5pbWF0aW9uUHJvcGVydHkuZ2V0KCkgKSB7XHJcblxyXG4gICAgICAgIC8vIGFuaW1hdGUgdG8gdGhlIG5ldyBwb3NpdGlvblxyXG4gICAgICAgIGNvaW5UZXJtLnRyYXZlbFRvRGVzdGluYXRpb24oIGRlc3RpbmF0aW9uICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIGlmIHRoaXMgZXhwcmVzc2lvbiBpcyBiZWluZyBtb3ZlZCBieSB0aGUgdXNlciBvciBpcyBhbmltYXRpbmcsIGRvbid0IGFuaW1hdGUgLSBpdCB3b24ndCBlbmQgd2VsbFxyXG4gICAgICAgIGNvaW5UZXJtLnNldFBvc2l0aW9uQW5kRGVzdGluYXRpb24oIGRlc3RpbmF0aW9uICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiB0aGUgY29pbiB0ZXJtIGJlaW5nIGFkZGVkIGlzIGN1cnJlbnRseSBvbiB0aGUgbGlzdCBvZiBob3ZlcmluZyBjb2luIHRlcm1zLCByZW1vdmUgaXRcclxuICAgIGlmICggdGhpcy5pc0NvaW5UZXJtSG92ZXJpbmcoIGNvaW5UZXJtICkgKSB7XHJcbiAgICAgIHRoaXMucmVtb3ZlSG92ZXJpbmdDb2luVGVybSggY29pblRlcm0gKTtcclxuICAgICAgaWYgKCB0aGlzLmhvdmVyaW5nQ29pblRlcm1zLmxlbmd0aCA9PT0gMCApIHtcclxuICAgICAgICB0aGlzLnJpZ2h0SGludEFjdGl2ZVByb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICAgICAgICB0aGlzLmxlZnRIaW50QWN0aXZlUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbWFrZSBzdXJlIHRoYXQgdGhlIGNvaW4gdGVybSBjYW4ndCBiZSBicm9rZW4gYXBhcnQgd2hpbGUgaW4gYW4gZXhwcmVzc2lvblxyXG4gICAgY29pblRlcm0uYnJlYWtBcGFydEFsbG93ZWRQcm9wZXJ0eS5zZXQoIGZhbHNlICk7XHJcblxyXG4gICAgLy8gYWRkIGEgbGlzdGVuZXIgdG8gcmVzaXplIHRoZSBleHByZXNzaW9uIGlmIHRoZSBib3VuZHMgb2YgdGhpcyBjb2luIHRlcm0gY2hhbmdlXHJcbiAgICBjb2luVGVybS5sb2NhbFZpZXdCb3VuZHNQcm9wZXJ0eS5sYXp5TGluayggdGhpcy5zZXRSZXNpemVOZWVkZWRGbGFnQm91bmQgKTtcclxuXHJcbiAgICAvLyBhZGQgYSBsaXN0ZW5lciB0byB1cGRhdGUgd2hldGhlciBtaW51cyBzaWduIGlzIHNob3duIHdoZW4gbmVnYXRpdmUgd2hlbiB0aGUgdXNlciBtb3ZlcyB0aGlzIGNvaW4gdGVybVxyXG4gICAgY29uc3QgdXNlckNvbnRyb2xsZWRMaXN0ZW5lciA9IHRoaXMudXBkYXRlQ29pblRlcm1TaG93TWludXNTaWduRmxhZy5iaW5kKCB0aGlzICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5tYXBDb2luVGVybXNUb1VDTGlzdGVuZXJzWyBjb2luVGVybS5pZCBdLCAna2V5IHNob3VsZCBub3QgeWV0IGV4aXN0IGluIG1hcCcgKTtcclxuICAgIHRoaXMubWFwQ29pblRlcm1zVG9VQ0xpc3RlbmVyc1sgY29pblRlcm0uaWQgXSA9IHVzZXJDb250cm9sbGVkTGlzdGVuZXI7XHJcbiAgICBjb2luVGVybS51c2VyQ29udHJvbGxlZFByb3BlcnR5LmxpbmsoIHVzZXJDb250cm9sbGVkTGlzdGVuZXIgKTtcclxuXHJcbiAgICAvLyB1cGRhdGUgd2hldGhlciB0aGUgY29pbiB0ZXJtcyBzaG91bGQgYmUgc2hvd2luZyBtaW51cyBzaWduc1xyXG4gICAgdGhpcy51cGRhdGVDb2luVGVybVNob3dNaW51c1NpZ25GbGFnKCk7XHJcblxyXG4gICAgLy8gdHJpZ2dlciBhbiBldmVudCBzbyB0aGF0IHRoZSB2aWV3IGlzIHN1cmUgdG8gYmUgdXBkYXRlZFxyXG4gICAgdGhpcy5sYXlvdXRDaGFuZ2VkRW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiByZW1vdmUgYSBjb2luIHRlcm0gZnJvbSB0aGlzIGV4cHJlc3Npb25cclxuICAgKiBAcGFyYW0ge0NvaW5UZXJtfSBjb2luVGVybVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZW1vdmVDb2luVGVybSggY29pblRlcm0gKSB7XHJcbiAgICBjb2luVGVybS5leHByZXNzaW9uUHJvcGVydHkuc2V0KCBudWxsICk7XHJcbiAgICBjb2luVGVybS5icmVha0FwYXJ0QWxsb3dlZFByb3BlcnR5LnNldCggdHJ1ZSApO1xyXG4gICAgY29pblRlcm0uc2hvd01pbnVzU2lnbldoZW5OZWdhdGl2ZVByb3BlcnR5LnNldCggdHJ1ZSApO1xyXG4gICAgdGhpcy5jb2luVGVybXMucmVtb3ZlKCBjb2luVGVybSApO1xyXG4gICAgY29pblRlcm0ubG9jYWxWaWV3Qm91bmRzUHJvcGVydHkudW5saW5rKCB0aGlzLnNldFJlc2l6ZU5lZWRlZEZsYWdCb3VuZCApO1xyXG4gICAgY29pblRlcm0udXNlckNvbnRyb2xsZWRQcm9wZXJ0eS51bmxpbmsoIHRoaXMubWFwQ29pblRlcm1zVG9VQ0xpc3RlbmVyc1sgY29pblRlcm0uaWQgXSApO1xyXG4gICAgZGVsZXRlIHRoaXMubWFwQ29pblRlcm1zVG9VQ0xpc3RlbmVyc1sgY29pblRlcm0uaWQgXTtcclxuXHJcbiAgICBpZiAoIHRoaXMuY29pblRlcm1zLmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgIHRoaXMudXBkYXRlU2l6ZUFuZENvaW5UZXJtUG9zaXRpb25zKCk7XHJcbiAgICAgIHRoaXMudXBkYXRlQ29pblRlcm1TaG93TWludXNTaWduRmxhZygpO1xyXG4gICAgfVxyXG5cclxuICAgIHBoZXQubG9nICYmIHBoZXQubG9nKCBgcmVtb3ZlZCAke2NvaW5UZXJtLmlkfSBmcm9tICR7dGhpcy5pZH1gICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0NvaW5UZXJtfSBjb2luVGVybVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgY29udGFpbnNDb2luVGVybSggY29pblRlcm0gKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jb2luVGVybXMuaW5jbHVkZXMoIGNvaW5UZXJtICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiByZW1vdmUgYWxsIGNvaW4gdGVybXNcclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPENvaW5UZXJtPn0gYSBzaW1wbGUgYXJyYXkgd2l0aCBhbGwgY29pbiB0ZXJtcywgc29ydGVkIGluIGxlZnQtdG8tcmlnaHQgb3JkZXJcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVtb3ZlQWxsQ29pblRlcm1zKCkge1xyXG5cclxuICAgIC8vIG1ha2UgYSBjb3B5IG9mIHRoZSBjb2luIHRlcm1zIGFuZCBzb3J0IHRoZW0gaW4gbGVmdCB0byByaWdodCBvcmRlclxyXG4gICAgY29uc3QgY29pblRlcm1zTGVmdFRvUmlnaHQgPSB0aGlzLmdldENvaW5UZXJtc0xlZnRUb1JpZ2h0KCk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIHRoZW0gZnJvbSB0aGlzIGV4cHJlc3Npb25cclxuICAgIGNvaW5UZXJtc0xlZnRUb1JpZ2h0LmZvckVhY2goIGNvaW5UZXJtID0+IHtcclxuICAgICAgdGhpcy5yZW1vdmVDb2luVGVybSggY29pblRlcm0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyByZXR1cm4gdGhlIHNvcnRlZCBhcnJheVxyXG4gICAgcmV0dXJuIGNvaW5UZXJtc0xlZnRUb1JpZ2h0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogYWRkIGJhY2sgYSBjb2luIHRlcm0gdGhhdCBpcyBhbHJlYWR5IHBhcnQgb2YgdGhpcyBleHByZXNzaW9uLCBidXQgc29tZXRoaW5nIGFib3V0IGl0IChtb3N0IGxpa2VseSBpdHMgcG9zaXRpb24pXHJcbiAgICogaGFzIGNoYW5nZWRcclxuICAgKiBAcGFyYW0ge0NvaW5UZXJtfSBjb2luVGVybVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZWludGVncmF0ZUNvaW5UZXJtKCBjb2luVGVybSApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmNvbnRhaW5zQ29pblRlcm0oIGNvaW5UZXJtICksICdjb2luIHRlcm0gaXMgbm90IHBhcnQgb2YgdGhpcyBleHByZXNzaW9uLCBjYW5cXCd0IGJlIHJlaW50ZWdyYXRlZCcgKTtcclxuXHJcbiAgICAvLyBnZXQgYW4gYXJyYXkgb2YgdGhlIGNvaW4gdGVybXMgc29ydGVkIGZyb20gbGVmdCB0byByaWdodFxyXG4gICAgY29uc3QgY29pblRlcm1zTGVmdFRvUmlnaHQgPSB0aGlzLmdldENvaW5UZXJtc0xlZnRUb1JpZ2h0KCk7XHJcblxyXG4gICAgLy8gdXBkYXRlIGNvaW4gdGVybSBtaW51cyBzaWduIGZsYWdzXHJcbiAgICB0aGlzLnVwZGF0ZUNvaW5UZXJtU2hvd01pbnVzU2lnbkZsYWcoKTtcclxuXHJcbiAgICAvLyBzZXQgdGhlIHBvc2l0aW9uIG9mIGVhY2ggY29pbiB0ZXJtIGJhc2VkIG9uIGl0cyBvcmRlclxyXG4gICAgbGV0IGxlZnRFZGdlID0gdGhpcy51cHBlckxlZnRDb3JuZXJQcm9wZXJ0eS5nZXQoKS54ICsgWF9NQVJHSU47XHJcbiAgICBjb25zdCBjZW50ZXJZID0gdGhpcy51cHBlckxlZnRDb3JuZXJQcm9wZXJ0eS5nZXQoKS55ICsgdGhpcy5oZWlnaHRQcm9wZXJ0eS5nZXQoKSAvIDI7XHJcbiAgICBjb2luVGVybXNMZWZ0VG9SaWdodC5mb3JFYWNoKCBvcmRlcmVkQ29pblRlcm0gPT4ge1xyXG4gICAgICBvcmRlcmVkQ29pblRlcm0udHJhdmVsVG9EZXN0aW5hdGlvbiggbmV3IFZlY3RvcjIoXHJcbiAgICAgICAgbGVmdEVkZ2UgLSBvcmRlcmVkQ29pblRlcm0ubG9jYWxWaWV3Qm91bmRzUHJvcGVydHkuZ2V0KCkubWluWCxcclxuICAgICAgICBjZW50ZXJZXHJcbiAgICAgICkgKTtcclxuICAgICAgbGVmdEVkZ2UgKz0gb3JkZXJlZENvaW5UZXJtLmxvY2FsVmlld0JvdW5kc1Byb3BlcnR5LmdldCgpLndpZHRoICsgSU5URVJfQ09JTl9URVJNX1NQQUNJTkc7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdHJpZ2dlciBhbiBldmVudCBzbyB0aGF0IHRoZSB2aWV3IGlzIHN1cmUgdG8gYmUgdXBkYXRlZFxyXG4gICAgdGhpcy5sYXlvdXRDaGFuZ2VkRW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiB1cGRhdGUgdGhlIGNvbnRhaW5lZCBjb2luIHRlcm1zIGZvciB3aGV0aGVyIHRoZXkgc2hvdWxkIHNob3cgbWludXMgc2lnbiB3aGVuIG5lZ2F0aXZlLCBzdXBwb3J0cyBzdWJ0cmFjdGlvbiBtb2RlXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVDb2luVGVybVNob3dNaW51c1NpZ25GbGFnKCkge1xyXG4gICAgY29uc3QgY29pblRlcm1zTGVmdFRvUmlnaHQgPSB0aGlzLmdldENvaW5UZXJtc0xlZnRUb1JpZ2h0KCk7XHJcbiAgICBsZXQgb25lT3JNb3JlQ2hhbmdlZCA9IGZhbHNlO1xyXG4gICAgY29pblRlcm1zTGVmdFRvUmlnaHQuZm9yRWFjaCggKCByZXNpZGVudENvaW5UZXJtLCBpbmRleCApID0+IHtcclxuXHJcbiAgICAgIC8vIFRoZSBtaW51cyBzaWduIGlzIHN1cHByZXNzZWQgaWYgc3VidHJhY3Rpb24gaXMgYmVpbmcgc2hvd24sIHRoZSBjb2luIHRlcm0gaXMgbm90IHVzZXIgY29udHJvbGxlZCwgYW5kIHRoZVxyXG4gICAgICAvLyBjb2luIHRlcm0gaXMgbm90IHRoZSBmaXJzdCBvbmUgaW4gdGhlIGV4cHJlc3Npb24gc28gdGhhdCBzdWJ0cmFjdGlvbiBleHByZXNzaW9ucyB3aWxsIGxvb2sgY29ycmVjdC5cclxuICAgICAgY29uc3Qgc2hvd01pbnVzU2lnbldoZW5OZWdhdGl2ZSA9ICEoIHRoaXMuc2ltcGxpZnlOZWdhdGl2ZXNQcm9wZXJ0eS52YWx1ZSAmJiBpbmRleCA+IDAgKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzaWRlbnRDb2luVGVybS51c2VyQ29udHJvbGxlZFByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgICAgaWYgKCBzaG93TWludXNTaWduV2hlbk5lZ2F0aXZlICE9PSByZXNpZGVudENvaW5UZXJtLnNob3dNaW51c1NpZ25XaGVuTmVnYXRpdmVQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgICByZXNpZGVudENvaW5UZXJtLnNob3dNaW51c1NpZ25XaGVuTmVnYXRpdmVQcm9wZXJ0eS5zZXQoIHNob3dNaW51c1NpZ25XaGVuTmVnYXRpdmUgKTtcclxuICAgICAgICBvbmVPck1vcmVDaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGlmICggb25lT3JNb3JlQ2hhbmdlZCApIHtcclxuICAgICAgdGhpcy5sYXlvdXRDaGFuZ2VkRW1pdHRlci5lbWl0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtb3ZlLCBhLmsuYS4gdHJhbnNsYXRlLCBieSB0aGUgc3BlY2lmaWVkIGFtb3VudCBhbmQgbW92ZSB0aGUgY29pbiB0ZXJtcyB0b29cclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGRlbHRhUG9zaXRpb25cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHRyYW5zbGF0ZSggZGVsdGFQb3NpdGlvbiApIHtcclxuXHJcbiAgICAvLyBtb3ZlIHRoZSBjb2luIHRlcm1zXHJcbiAgICB0aGlzLmNvaW5UZXJtcy5mb3JFYWNoKCBjb2luVGVybSA9PiB7XHJcbiAgICAgIGNvaW5UZXJtLnNldFBvc2l0aW9uQW5kRGVzdGluYXRpb24oIGNvaW5UZXJtLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkucGx1cyggZGVsdGFQb3NpdGlvbiApICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gbW92ZSB0aGUgb3V0bGluZSBzaGFwZVxyXG4gICAgdGhpcy51cHBlckxlZnRDb3JuZXJQcm9wZXJ0eS5zZXQoIHRoaXMudXBwZXJMZWZ0Q29ybmVyUHJvcGVydHkuZ2V0KCkucGx1cyggZGVsdGFQb3NpdGlvbiApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtb3ZlIHRvIHRoZSBzcGVjaWZpZWQgZGVzdGluYXRpb24sIGJ1dCBkbyBzbyBhIHN0ZXAgYXQgYSB0aW1lIHJhdGhlciB0aGFuIGFsbCBhdCBvbmNlXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSB1cHBlckxlZnRDb3JuZXJEZXN0aW5hdGlvblxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICB0cmF2ZWxUb0Rlc3RpbmF0aW9uKCB1cHBlckxlZnRDb3JuZXJEZXN0aW5hdGlvbiApIHtcclxuICAgIGNvbnN0IGFuaW1hdGlvbkR1cmF0aW9uID0gTWF0aC5taW4oXHJcbiAgICAgIHRoaXMudXBwZXJMZWZ0Q29ybmVyUHJvcGVydHkuZ2V0KCkuZGlzdGFuY2UoIHVwcGVyTGVmdENvcm5lckRlc3RpbmF0aW9uICkgLyBBTklNQVRJT05fU1BFRUQsXHJcbiAgICAgIE1BWF9BTklNQVRJT05fVElNRVxyXG4gICAgKTtcclxuICAgIGlmICggYW5pbWF0aW9uRHVyYXRpb24gPT09IDAgKSB7XHJcblxyXG4gICAgICAvLyBhbHJlYWR5IHRoZXJlLCBzbyBlbWl0IGEgbm90aWZpY2F0aW9uIGFuZCBjYWxsIGl0IGdvb2RcclxuICAgICAgdGhpcy5kZXN0aW5hdGlvblJlYWNoZWRFbWl0dGVyLmVtaXQoKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gc2V0IHVwIHRoZSBhbmltYXRpb24gdG8gZ2V0IHRvIHRoZSBkZXN0aW5hdGlvblxyXG4gICAgICB0aGlzLmluUHJvZ3Jlc3NBbmltYXRpb25Qcm9wZXJ0eS5zZXQoIG5ldyBBbmltYXRpb25TcGVjKFxyXG4gICAgICAgIHRoaXMudXBwZXJMZWZ0Q29ybmVyUHJvcGVydHkuZ2V0KCkuY29weSgpLFxyXG4gICAgICAgIHVwcGVyTGVmdENvcm5lckRlc3RpbmF0aW9uLm1pbnVzKCB0aGlzLnVwcGVyTGVmdENvcm5lclByb3BlcnR5LmdldCgpICksXHJcbiAgICAgICAgYW5pbWF0aW9uRHVyYXRpb25cclxuICAgICAgKSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogc2V0IGJvdGggdGhlIHBvc2l0aW9uIGFuZCBkZXN0aW5hdGlvbiBvZiB0aGUgdXBwZXIgbGVmdCBjb3JuZXIgaW1tZWRpYXRlbHksIGkuZS4gd2l0aG91dCBhbmltYXRpb25cclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHVwcGVyTGVmdENvcm5lckRlc3RpbmF0aW9uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldFBvc2l0aW9uQW5kRGVzdGluYXRpb24oIHVwcGVyTGVmdENvcm5lckRlc3RpbmF0aW9uICkge1xyXG4gICAgdGhpcy50cmFuc2xhdGUoIHVwcGVyTGVmdENvcm5lckRlc3RpbmF0aW9uLm1pbnVzKCB0aGlzLnVwcGVyTGVmdENvcm5lclByb3BlcnR5LmdldCgpICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGluaXRpYXRlIGEgYnJlYWsgYXBhcnQsIHdoaWNoIGp1c3QgZW1pdHMgYW4gZXZlbnQgYW5kIGNvdW50cyBvbiBwYXJlbnQgbW9kZWwgdG8gaGFuZGxlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGJyZWFrQXBhcnQoKSB7XHJcbiAgICB0aGlzLmJyZWFrQXBhcnRFbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGdldCB0aGUgYW1vdW50IG9mIG92ZXJsYXAgYmV0d2VlbiB0aGUgcHJvdmlkZWQgY29pbiB0ZXJtJ3MgYm91bmRzIGFuZCB0aGlzIGV4cHJlc3Npb24ncyBcImpvaW4gem9uZVwiXHJcbiAgICogQHBhcmFtIHtDb2luVGVybX0gY29pblRlcm1cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgYXJlYSBvZiB0aGUgb3ZlcmxhcFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRDb2luVGVybUpvaW5ab25lT3ZlcmxhcCggY29pblRlcm0gKSB7XHJcbiAgICBjb25zdCBjb2luVGVybUJvdW5kcyA9IGNvaW5UZXJtLmdldFZpZXdCb3VuZHMoKTtcclxuICAgIGNvbnN0IHhPdmVybGFwID0gTWF0aC5tYXgoXHJcbiAgICAgIDAsXHJcbiAgICAgIE1hdGgubWluKCBjb2luVGVybUJvdW5kcy5tYXhYLCB0aGlzLmpvaW5ab25lLm1heFggKSAtIE1hdGgubWF4KCBjb2luVGVybUJvdW5kcy5taW5YLCB0aGlzLmpvaW5ab25lLm1pblggKVxyXG4gICAgKTtcclxuICAgIGNvbnN0IHlPdmVybGFwID0gTWF0aC5tYXgoXHJcbiAgICAgIDAsXHJcbiAgICAgIE1hdGgubWluKCBjb2luVGVybUJvdW5kcy5tYXhZLCB0aGlzLmpvaW5ab25lLm1heFkgKSAtIE1hdGgubWF4KCBjb2luVGVybUJvdW5kcy5taW5ZLCB0aGlzLmpvaW5ab25lLm1pblkgKVxyXG4gICAgKTtcclxuICAgIHJldHVybiB4T3ZlcmxhcCAqIHlPdmVybGFwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogZ2V0IHRoZSBhbW91bnQgb2Ygb3ZlcmxhcCBiZXR3ZWVuIHRoZSBwcm92aWRlZCBleHByZXNzaW9uIGFuZCB0aGlzIGV4cHJlc3Npb25cclxuICAgKiBAcGFyYW0ge0V4cHJlc3Npb258fEVFQ29sbGVjdGlvbkFyZWF9IG90aGVyRW50aXR5IC0gbXVzdCBwcm92aWRlIGEgJ2dldEJvdW5kcycgbWV0aG9kXHJcbiAgICogQHJldHVybnMge251bWJlcn0gdGhlIGFyZWEgb2YgdGhlIG92ZXJsYXBcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0T3ZlcmxhcCggb3RoZXJFbnRpdHkgKSB7XHJcbiAgICBjb25zdCBvdGhlckV4cHJlc3Npb25Cb3VuZHMgPSBvdGhlckVudGl0eS5nZXRCb3VuZHMoKTtcclxuICAgIGNvbnN0IHRoaXNFeHByZXNzaW9uQm91bmRzID0gdGhpcy5nZXRCb3VuZHMoKTtcclxuICAgIGNvbnN0IHhPdmVybGFwID0gTWF0aC5tYXgoXHJcbiAgICAgIDAsXHJcbiAgICAgIE1hdGgubWluKCBvdGhlckV4cHJlc3Npb25Cb3VuZHMubWF4WCwgdGhpc0V4cHJlc3Npb25Cb3VuZHMubWF4WCApIC0gTWF0aC5tYXgoIG90aGVyRXhwcmVzc2lvbkJvdW5kcy5taW5YLCB0aGlzRXhwcmVzc2lvbkJvdW5kcy5taW5YIClcclxuICAgICk7XHJcbiAgICBjb25zdCB5T3ZlcmxhcCA9IE1hdGgubWF4KFxyXG4gICAgICAwLFxyXG4gICAgICBNYXRoLm1pbiggb3RoZXJFeHByZXNzaW9uQm91bmRzLm1heFksIHRoaXNFeHByZXNzaW9uQm91bmRzLm1heFkgKSAtIE1hdGgubWF4KCBvdGhlckV4cHJlc3Npb25Cb3VuZHMubWluWSwgdGhpc0V4cHJlc3Npb25Cb3VuZHMubWluWSApXHJcbiAgICApO1xyXG4gICAgcmV0dXJuIHhPdmVybGFwICogeU92ZXJsYXA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBnZXQgdGhlIHVwcGVyIHJpZ2h0IGNvcm5lciBvZiB0aGlzIGV4cHJlc3Npb25cclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0VXBwZXJSaWdodENvcm5lcigpIHtcclxuICAgIHJldHVybiB0aGlzLnVwcGVyTGVmdENvcm5lclByb3BlcnR5LmdldCgpLnBsdXNYWSggdGhpcy53aWR0aFByb3BlcnR5LmdldCgpLCAwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgYSBjb2luIHRlcm0gdG8gdGhlIGxpc3Qgb2YgdGhvc2UgdGhhdCBhcmUgaG92ZXJpbmcgb3ZlciB0aGlzIGV4cHJlc3Npb24uICBUaGlzIGlzIGEgbm8tb3AgaWYgdGhlIGNvaW4gdGVybSBpc1xyXG4gICAqIGFscmVhZHkgb24gdGhlIGxpc3QuXHJcbiAgICogQHBhcmFtIHtDb2luVGVybX0gY29pblRlcm1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYWRkSG92ZXJpbmdDb2luVGVybSggY29pblRlcm0gKSB7XHJcbiAgICBpZiAoIHRoaXMuaG92ZXJpbmdDb2luVGVybXMuaW5kZXhPZiggY29pblRlcm0gKSA9PT0gLTEgKSB7XHJcbiAgICAgIHRoaXMuaG92ZXJpbmdDb2luVGVybXMucHVzaCggY29pblRlcm0gKTtcclxuICAgICAgY29pblRlcm0uYnJlYWtBcGFydEFsbG93ZWRQcm9wZXJ0eS5zZXQoIGZhbHNlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgYSBjb2luIHRlcm0gZnJvbSB0aGUgbGlzdCBvZiB0aG9zZSB0aGF0IGFyZSBob3ZlcmluZyBvdmVyIHRoaXMgZXhwcmVzc2lvbi4gIFRoaXMgaXMgYSBuby1vcCBpZiB0aGUgY29pblxyXG4gICAqIHRlcm0gaXMgbm90IG9uIHRoZSBsaXN0LlxyXG4gICAqIEBwYXJhbSB7Q29pblRlcm19IGNvaW5UZXJtXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlbW92ZUhvdmVyaW5nQ29pblRlcm0oIGNvaW5UZXJtICkge1xyXG4gICAgY29uc3QgaW5kZXggPSB0aGlzLmhvdmVyaW5nQ29pblRlcm1zLmluZGV4T2YoIGNvaW5UZXJtICk7XHJcbiAgICBpZiAoIGluZGV4ICE9PSAtMSApIHtcclxuICAgICAgdGhpcy5ob3ZlcmluZ0NvaW5UZXJtcy5zcGxpY2UoIGluZGV4LCAxICk7XHJcbiAgICAgIGNvaW5UZXJtLmJyZWFrQXBhcnRBbGxvd2VkUHJvcGVydHkuc2V0KCB0cnVlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBjbGVhciB0aGUgbGlzdCBvZiBjb2luIHRlcm1zIHRoYXQgYXJlIGN1cnJlbnRseSBob3ZlcmluZyBvdmVyIHRoaXMgZXhwcmVzc2lvblxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBjbGVhckhvdmVyaW5nQ29pblRlcm1zKCkge1xyXG4gICAgdGhpcy5ob3ZlcmluZ0NvaW5UZXJtcy5mb3JFYWNoKCBob3ZlcmluZ0NvaW5UZXJtID0+IHtcclxuICAgICAgaG92ZXJpbmdDb2luVGVybS5icmVha0FwYXJ0QWxsb3dlZFByb3BlcnR5LnNldCggdHJ1ZSApO1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5ob3ZlcmluZ0NvaW5UZXJtcy5sZW5ndGggPSAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIGFuIGV4cHJlc3Npb24gdG8gdGhlIGxpc3Qgb2YgdGhvc2UgdGhhdCBhcmUgaG92ZXJpbmcgb3ZlciB0aGlzIGV4cHJlc3Npb24uICBUaGlzIGlzIGEgbm8tb3AgaWYgdGhlIGV4cHJlc3Npb25cclxuICAgKiBpcyBhbHJlYWR5IG9uIHRoZSBsaXN0LlxyXG4gICAqIEBwYXJhbSB7RXhwcmVzc2lvbn0gZXhwcmVzc2lvblxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhZGRIb3ZlcmluZ0V4cHJlc3Npb24oIGV4cHJlc3Npb24gKSB7XHJcbiAgICBpZiAoIHRoaXMuaG92ZXJpbmdFeHByZXNzaW9ucy5pbmRleE9mKCBleHByZXNzaW9uICkgPT09IC0xICkge1xyXG4gICAgICB0aGlzLmhvdmVyaW5nRXhwcmVzc2lvbnMucHVzaCggZXhwcmVzc2lvbiApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIGFuIGV4cHJlc3Npb24gZnJvbSB0aGUgbGlzdCBvZiB0aG9zZSB0aGF0IGFyZSBob3ZlcmluZyBvdmVyIHRoaXMgZXhwcmVzc2lvbi4gIFRoaXMgaXMgYSBuby1vcCBpZiB0aGVcclxuICAgKiBwcm92aWRlZCBleHByZXNzaW9uIGlzIG5vdCBvbiB0aGUgbGlzdC5cclxuICAgKiBAcGFyYW0ge0V4cHJlc3Npb259IGV4cHJlc3Npb25cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVtb3ZlSG92ZXJpbmdFeHByZXNzaW9uKCBleHByZXNzaW9uICkge1xyXG4gICAgY29uc3QgaW5kZXggPSB0aGlzLmhvdmVyaW5nRXhwcmVzc2lvbnMuaW5kZXhPZiggZXhwcmVzc2lvbiApO1xyXG4gICAgaWYgKCBpbmRleCAhPT0gLTEgKSB7XHJcbiAgICAgIHRoaXMuaG92ZXJpbmdFeHByZXNzaW9ucy5zcGxpY2UoIGluZGV4LCAxICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBjbGVhciB0aGUgbGlzdCBvZiBvdGhlciBleHByZXNzaW9ucyB0aGF0IGFyZSBjdXJyZW50bHkgaG92ZXJpbmcgb3ZlciB0aGlzIGV4cHJlc3Npb25cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY2xlYXJIb3ZlcmluZ0V4cHJlc3Npb25zKCkge1xyXG4gICAgdGhpcy5ob3ZlcmluZ0V4cHJlc3Npb25zLmxlbmd0aCA9IDA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiByZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIGNvaW4gdGVybSBpcyBvbiB0aGUgbGlzdCBvZiB0aG9zZSBob3ZlcmluZyBvdmVyIHRoZSBleHByZXNzaW9uXHJcbiAgICogQHBhcmFtIHtDb2luVGVybX0gY29pblRlcm1cclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGlzQ29pblRlcm1Ib3ZlcmluZyggY29pblRlcm0gKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ob3ZlcmluZ0NvaW5UZXJtcy5pbmRleE9mKCBjb2luVGVybSApID4gLTE7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBzZXQgdGhlIHJlc2l6ZSBuZWVkZWQgZmxhZywgdXNlZCB0byBob29rIHVwIGxpc3RlbmVyc1xyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgc2V0UmVzaXplTmVlZGVkRmxhZygpIHtcclxuICAgIHRoaXMucmVzaXplTmVlZGVkID0gdHJ1ZTtcclxuICB9XHJcbn1cclxuXHJcbmV4cHJlc3Npb25FeGNoYW5nZS5yZWdpc3RlciggJ0V4cHJlc3Npb24nLCBFeHByZXNzaW9uICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBFeHByZXNzaW9uO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxxQkFBcUIsTUFBTSw4Q0FBOEM7QUFDaEYsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxPQUFPLE1BQU0sZ0NBQWdDO0FBQ3BELE9BQU9DLFNBQVMsTUFBTSxrQ0FBa0M7QUFDeEQsT0FBT0MsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsZUFBZSxNQUFNLHVDQUF1QztBQUNuRSxPQUFPQyxNQUFNLE1BQU0sZ0NBQWdDO0FBQ25ELE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2QjtBQUM1RCxPQUFPQyxpQkFBaUIsTUFBTSx5QkFBeUI7QUFDdkQsT0FBT0MsYUFBYSxNQUFNLG9CQUFvQjs7QUFFOUM7QUFDQSxNQUFNQyx1QkFBdUIsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUNwQyxNQUFNQyxRQUFRLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDckIsTUFBTUMsUUFBUSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ3JCLE1BQU1DLGVBQWUsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUM3QixNQUFNQyxrQkFBa0IsR0FBRyxDQUFDLENBQUMsQ0FBQzs7QUFFOUI7QUFDQSxJQUFJQyxhQUFhLEdBQUcsQ0FBQztBQUVyQixNQUFNQyxVQUFVLENBQUM7RUFFZjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLFdBQVdBLENBQUVDLGNBQWMsRUFBRUMsZ0JBQWdCLEVBQUVDLHlCQUF5QixFQUFHO0lBRXpFLE1BQU1DLElBQUksR0FBRyxJQUFJO0lBQ2pCLElBQUksQ0FBQ0Ms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