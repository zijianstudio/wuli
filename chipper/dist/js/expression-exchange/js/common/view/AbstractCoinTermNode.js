// Copyright 2016-2022, University of Colorado Boulder

/**
 * base type for the nodes that represent coin terms in the view, this exists primarily to avoid code duplication
 *
 * @author John Blanco
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import stepTimer from '../../../../axon/js/stepTimer.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { DragListener, Node, Rectangle } from '../../../../scenery/js/imports.js';
import expressionExchange from '../../expressionExchange.js';
import EESharedConstants from '../EESharedConstants.js';
import BreakApartButton from './BreakApartButton.js';

// constants
const BACKGROUND_CORNER_ROUNDING = 5;
const TOUCH_DRAG_OFFSET = new Vector2(0, -30); // empirically determined

class AbstractCoinTermNode extends Node {
  /**
   * @param {CoinTerm} coinTerm - model of a coin term
   * @param {Object} [options]
   */
  constructor(coinTerm, options) {
    options = merge({
      addDragHandler: true,
      dragBounds: Bounds2.EVERYTHING,
      breakApartButtonMode: 'normal' // valid values are 'normal' and 'inverted'
    }, options);
    super({
      pickable: true,
      cursor: 'pointer'
    });

    // @public (read-only) {CoinTerm}
    this.coinTerm = coinTerm;

    // @protected {Rectangle}
    // Add the card-like background, initially tiny, will be set in subclasses by function that updates the
    // representation.
    this.cardLikeBackground = new Rectangle(-1, -1, 2, 2, {
      fill: EESharedConstants.CARD_BACKGROUND_COLOR,
      stroke: 'black',
      cornerRadius: BACKGROUND_CORNER_ROUNDING,
      visible: false
    });
    this.addChild(this.cardLikeBackground);

    // @protected {Node}
    // Add a root node so that the bounds can be easily monitored for changes in size without getting triggered by
    // changes in position.
    this.coinAndTextRootNode = new Node();
    this.addChild(this.coinAndTextRootNode);

    // @private {String} - make option visible to methods
    this.breakApartButtonMode = options.breakApartButtonMode;

    // add a listener that will adjust opacity as existence strength changes
    const existenceStrengthListener = this.handleExistenceStrengthChanged.bind(this);
    coinTerm.existenceStrengthProperty.link(existenceStrengthListener);

    // @private {function} - timer callback will be used to hide the break apart button if user doesn't use it
    this.hideButtonTimer = null;

    // @private {BreakApartButton} - the button that will allow composite coins to be decomposed, added lazily in order
    // to conserve memory
    this.breakApartButton = null;

    // move this node as the model representation moves
    const handlePositionChanged = position => {
      // the intent here is to position the center of the coin at the position, NOT the center of the node
      this.translation = position;
    };
    coinTerm.positionProperty.link(handlePositionChanged);

    // add a listener for updating the break apart button state based on the user controlled state of this coin term
    const userControlledListener = this.handleUserControlledChanged.bind(this);
    coinTerm.userControlledProperty.lazyLink(userControlledListener);

    // add a listener to handle changes to the 'break apart allowed' state
    const breakApartAllowedListener = this.handleBreakApartAllowedChanged.bind(this);
    coinTerm.breakApartAllowedProperty.link(breakApartAllowedListener);

    // add a drag handler if specified
    if (options.addDragHandler) {
      this.addDragHandler(options.dragBounds);
    }

    // add a listener that will pop this node to the front when selected by the user
    coinTerm.userControlledProperty.link(userControlled => {
      if (userControlled) {
        this.moveToFront();
      }
    });

    // add a listener that will pop this node to the front when another coin term is combined with it
    const totalCountListener = this.handleCombinedCountChanged.bind(this);
    coinTerm.totalCountProperty.link(totalCountListener);

    // function to update the pickability as the states change
    const updatePickability = () => {
      // There is some rare race condition where the code below was being called after the node was disposed.  I
      // (jbphet) was never able to track it down, largely because it was so hard to reproduce, so I just added the
      // 'if' statement as a guard.  See https://github.com/phetsims/expression-exchange/issues/147.
      if (!this.isDisposed) {
        const expression = coinTerm.expressionProperty.get();
        this.pickable = (expression === null || expression.inEditModeProperty.get()) && !coinTerm.inProgressAnimationProperty.get() && !coinTerm.collectedProperty.get();
      }
    };

    // update the pickability of this node
    const pickabilityUpdaterMultilink = Multilink.multilink([coinTerm.expressionProperty, coinTerm.inProgressAnimationProperty, coinTerm.collectedProperty], updatePickability);

    // Hook up a listener that will allow the coin term to be pickable if the expression that it is in transitions into
    // edit mode.
    coinTerm.expressionProperty.link((expression, previousExpression) => {
      if (expression) {
        expression.inEditModeProperty.link(updatePickability);
      }
      if (previousExpression && previousExpression.inEditModeProperty.hasListener(updatePickability)) {
        previousExpression.inEditModeProperty.unlink(updatePickability);
      }
    });

    // @private - internal dispose function
    this.disposeAbstractCoinTermNode = () => {
      this.clearHideButtonTimer();
      if (this.breakApartButton) {
        this.breakApartButton.buttonModel.looksOverProperty.unlink(this.breakApartButtonOverListener);
        this.breakApartButton.removeListener(this.breakApartButtonListener);
        this.breakApartButton.dispose();
      }
      coinTerm.positionProperty.unlink(handlePositionChanged);
      coinTerm.existenceStrengthProperty.unlink(existenceStrengthListener);
      coinTerm.userControlledProperty.unlink(userControlledListener);
      coinTerm.breakApartAllowedProperty.unlink(breakApartAllowedListener);
      coinTerm.totalCountProperty.unlink(totalCountListener);
      if (coinTerm.expressionProperty.value) {
        coinTerm.expressionProperty.value.inEditModeProperty.unlink(updatePickability);
      }
      pickabilityUpdaterMultilink.dispose();
      this.removeAllChildren();
    };
    this.mutate(options);
  }

  // add a listener that will update the opacity based on the coin term's existence strength
  /**
   * listener function that will adjust opacity as existence strength changes
   * @param existenceStrength
   * @private
   */
  handleExistenceStrengthChanged(existenceStrength) {
    assert && assert(existenceStrength >= 0 && existenceStrength <= 1, 'existence strength must be between 0 and 1');
    if (!this.isDisposed) {
      this.pickable = existenceStrength === 1; // prevent interaction with fading coin term
      this.opacity = existenceStrength;
    }
  }

  /**
   * @private
   */
  clearHideButtonTimer() {
    if (this.hideButtonTimer) {
      stepTimer.clearTimeout(this.hideButtonTimer);
      this.hideButtonTimer = null;
    }
  }

  /**
   * start the timer for hiding the break-apart button
   * @private
   */
  startHideButtonTimer() {
    this.clearHideButtonTimer(); // just in case one is already running
    this.hideButtonTimer = stepTimer.setTimeout(() => {
      this.hideBreakApartButton();
      this.hideButtonTimer = null;
    }, EESharedConstants.POPUP_BUTTON_SHOW_TIME * 1000);
  }

  /**
   * position and show the break apart button
   * @private
   */
  showBreakApartButton() {
    if (!this.breakApartButton) {
      this.addBreakApartButton();
    }
    this.breakApartButton.centerX = 0;
    this.breakApartButton.bottom = this.coinAndTextRootNode.visibleLocalBounds.minY - 3; // just above the coin term
    this.breakApartButton.visible = true;
  }

  /**
   * position the break apart button such that the bounds are within the bounds of the coin term node and hide it
   * @private
   */
  hideBreakApartButton() {
    if (this.breakApartButton) {
      this.breakApartButton.center = Vector2.ZERO; // position within coin term so bounds aren't affected
      this.breakApartButton.visible = false;
    }
  }

  /**
   * add the break apart button, generally not done until needed in order to conserve memory
   * @private
   */
  addBreakApartButton() {
    this.breakApartButton = new BreakApartButton({
      visible: false,
      mode: this.breakApartButtonMode
    });

    // Add the button outside of the root coin-and-text node so that it isn't included in the bounds that are shared
    // with the model.
    this.addChild(this.breakApartButton);

    // adjust the touch area of the break apart button to make it easier to use on touch devices
    this.breakApartButton.touchArea = this.breakApartButton.localBounds.dilatedX(this.breakApartButton.width / 2).withOffsets(0, this.breakApartButton.height, 0, 0);
    this.breakApartButtonListener = this.handleBreakApartButtonPressed.bind(this); // @private, needed for disposal
    this.breakApartButton.addListener(this.breakApartButtonListener);

    // add a listener for changes to the 'break apart allowed' state
    this.breakApartButtonOverListener = this.handleOverBreakApartButtonChanged.bind(this); // @private, needed for disposal
    this.breakApartButton.buttonModel.looksOverProperty.lazyLink(this.breakApartButtonOverListener);
  }

  /**
   * listener for the 'over' state of the break-apart button
   * @param {boolean} overButton
   * @private
   */
  handleOverBreakApartButtonChanged(overButton) {
    // make sure the coin term isn't user controlled (this helps prevent some multi-touch problems)
    if (!this.coinTerm.userControlledProperty.get()) {
      if (overButton) {
        // the mouse just moved over the button, so stop the timer in order to make sure the button stays visible
        assert && assert(!!this.hideButtonTimer, 'hide button timer should be running');
        this.clearHideButtonTimer();
      } else {
        // the mouse just moved away from the button, so start a timer to hide it
        this.startHideButtonTimer();
      }
    }
  }

  /**
   * listener that updates the state of the break-apart button when the user controlled state of the coin term changes
   * @param {boolean} userControlled
   * @private
   */
  handleUserControlledChanged(userControlled) {
    if (Math.abs(this.coinTerm.composition.length) > 1 && this.coinTerm.breakApartAllowedProperty.get() && !this.isDisposed) {
      if (userControlled) {
        this.clearHideButtonTimer(); // called in case the timer was running
        this.showBreakApartButton();
      } else if (this.breakApartButton && this.breakApartButton.visible) {
        // the userControlled flag transitioned to false while the button was visible, start the time to hide it
        this.startHideButtonTimer();
      }
    }
  }

  /**
   * listener that updates the state of the break-apart button when the breakApartAllowed state changes
   * @param {boolean} breakApartAllowed
   * @private
   */
  handleBreakApartAllowedChanged(breakApartAllowed) {
    if (this.breakApartButton && this.breakApartButton.visible && !breakApartAllowed) {
      this.clearHideButtonTimer();
      this.hideBreakApartButton();
    }
  }

  /**
   * listener for handling changes to the combined count (i.e. the number of coin terms combined together)
   * @param {number} newCount
   * @param {number} oldCount
   * @private
   */
  handleCombinedCountChanged(newCount, oldCount) {
    if (newCount > oldCount) {
      this.moveToFront();
    }
    if (this.breakApartButton && this.breakApartButton.visible && Math.abs(newCount) < 2) {
      // if combined count was reduced through cancellation while the break apart button was visible, hide it, see
      // https://github.com/phetsims/expression-exchange/issues/29
      this.hideBreakApartButton();
    }
  }

  /**
   * handler for pressing of the break apart button
   * @private
   */
  handleBreakApartButtonPressed() {
    // Interrupt any dragging that is in progress, which helps to prevent weird multi-touch problems.  See
    // https://github.com/phetsims/expression-exchange/issues/151.
    this.coinAndTextRootNode.interruptInput();

    // Break this composite coin term into separate ones.
    this.coinTerm.breakApart();

    // Hide the button, since it must have been pressed to get here.
    this.hideBreakApartButton();

    // Cancel timer (if running).
    this.clearHideButtonTimer();
  }

  /**
   * add a drag handler
   * {Bounds2} dragBounds
   * @private
   */
  addDragHandler(dragBounds) {
    // Create a position property and link it to the coin term, necessary because coin term has both position and
    // destination properties, both of which must be set when dragging occurs.
    const coinTermPositionAndDestinationProperty = new Property(this.coinTerm.positionProperty.get());
    coinTermPositionAndDestinationProperty.lazyLink(positionAndDestination => {
      this.coinTerm.setPositionAndDestination(positionAndDestination);
    });

    // @public - drag handler, public in support of event forwarding from creator nodes
    this.dragHandler = new DragListener({
      positionProperty: coinTermPositionAndDestinationProperty,
      // allow moving a finger (touch) across a node to pick it up
      allowTouchSnag: true,
      // bound the area where the coin terms can go
      dragBoundsProperty: new Property(dragBounds),
      // set the target node so that DragListener knows where to get the coordinate transform, supports event
      // forwarding
      targetNode: this,
      // Offset the position a little if this is a touch pointer so that the finger doesn't cover the coin term.
      offsetPosition: (viewPoint, dragListener) => {
        return dragListener.pointer.isTouchLike() ? TOUCH_DRAG_OFFSET : Vector2.ZERO;
      },
      start: () => {
        this.coinTerm.userControlledProperty.set(true);
      },
      end: () => {
        this.coinTerm.userControlledProperty.set(false);
      }
    });

    // Add the listener that will allow the user to drag the coin around.  This is added only to the node that
    // contains the term elements, not the button, so that the button won't affect userControlled or be draggable.
    this.coinAndTextRootNode.addInputListener(this.dragHandler);
  }

  /**
   * @public
   */
  dispose() {
    this.disposeAbstractCoinTermNode();
    super.dispose();
  }
}

// statics

// @public {number} - To look correct in equations, the text all needs to be on the same baseline.  The value was
// empirically determined and may need to change if font sizes change.
AbstractCoinTermNode.TEXT_BASELINE_Y_OFFSET = 12;

// @public {number} - Height of the background cards - these are fixed so that stacks of them that are side-by-side
// look good.  The values were empirically determined.
AbstractCoinTermNode.BACKGROUND_CARD_HEIGHT_TEXT_MODE = 70;
AbstractCoinTermNode.BACKGROUND_CARD_HEIGHT_COIN_MODE = 70;

// @public {number} - horizontal margin for card background
AbstractCoinTermNode.BACKGROUND_CARD_X_MARGIN = 15;
expressionExchange.register('AbstractCoinTermNode', AbstractCoinTermNode);
export default AbstractCoinTermNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJQcm9wZXJ0eSIsInN0ZXBUaW1lciIsIkJvdW5kczIiLCJWZWN0b3IyIiwibWVyZ2UiLCJEcmFnTGlzdGVuZXIiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiZXhwcmVzc2lvbkV4Y2hhbmdlIiwiRUVTaGFyZWRDb25zdGFudHMiLCJCcmVha0FwYXJ0QnV0dG9uIiwiQkFDS0dST1VORF9DT1JORVJfUk9VTkRJTkciLCJUT1VDSF9EUkFHX09GRlNFVCIsIkFic3RyYWN0Q29pblRlcm1Ob2RlIiwiY29uc3RydWN0b3IiLCJjb2luVGVybSIsIm9wdGlvbnMiLCJhZGREcmFnSGFuZGxlciIsImRyYWdCb3VuZHMiLCJFVkVSWVRISU5HIiwiYnJlYWtBcGFydEJ1dHRvbk1vZGUiLCJwaWNrYWJsZSIsImN1cnNvciIsImNhcmRMaWtlQmFja2dyb3VuZCIsImZpbGwiLCJDQVJEX0JBQ0tHUk9VTkRfQ09MT1IiLCJzdHJva2UiLCJjb3JuZXJSYWRpdXMiLCJ2aXNpYmxlIiwiYWRkQ2hpbGQiLCJjb2luQW5kVGV4dFJvb3ROb2RlIiwiZXhpc3RlbmNlU3RyZW5ndGhMaXN0ZW5lciIsImhhbmRsZUV4aXN0ZW5jZVN0cmVuZ3RoQ2hhbmdlZCIsImJpbmQiLCJleGlzdGVuY2VTdHJlbmd0aFByb3BlcnR5IiwibGluayIsImhpZGVCdXR0b25UaW1lciIsImJyZWFrQXBhcnRCdXR0b24iLCJoYW5kbGVQb3NpdGlvbkNoYW5nZWQiLCJwb3NpdGlvbiIsInRyYW5zbGF0aW9uIiwicG9zaXRpb25Qcm9wZXJ0eSIsInVzZXJDb250cm9sbGVkTGlzdGVuZXIiLCJoYW5kbGVVc2VyQ29udHJvbGxlZENoYW5nZWQiLCJ1c2VyQ29udHJvbGxlZFByb3BlcnR5IiwibGF6eUxpbmsiLCJicmVha0FwYXJ0QWxsb3dlZExpc3RlbmVyIiwiaGFuZGxlQnJlYWtBcGFydEFsbG93ZWRDaGFuZ2VkIiwiYnJlYWtBcGFydEFsbG93ZWRQcm9wZXJ0eSIsInVzZXJDb250cm9sbGVkIiwibW92ZVRvRnJvbnQiLCJ0b3RhbENvdW50TGlzdGVuZXIiLCJoYW5kbGVDb21iaW5lZENvdW50Q2hhbmdlZCIsInRvdGFsQ291bnRQcm9wZXJ0eSIsInVwZGF0ZVBpY2thYmlsaXR5IiwiaXNEaXNwb3NlZCIsImV4cHJlc3Npb24iLCJleHByZXNzaW9uUHJvcGVydHkiLCJnZXQiLCJpbkVkaXRNb2RlUHJvcGVydHkiLCJpblByb2dyZXNzQW5pbWF0aW9uUHJvcGVydHkiLCJjb2xsZWN0ZWRQcm9wZXJ0eSIsInBpY2thYmlsaXR5VXBkYXRlck11bHRpbGluayIsIm11bHRpbGluayIsInByZXZpb3VzRXhwcmVzc2lvbiIsImhhc0xpc3RlbmVyIiwidW5saW5rIiwiZGlzcG9zZUFic3RyYWN0Q29pblRlcm1Ob2RlIiwiY2xlYXJIaWRlQnV0dG9uVGltZXIiLCJidXR0b25Nb2RlbCIsImxvb2tzT3ZlclByb3BlcnR5IiwiYnJlYWtBcGFydEJ1dHRvbk92ZXJMaXN0ZW5lciIsInJlbW92ZUxpc3RlbmVyIiwiYnJlYWtBcGFydEJ1dHRvbkxpc3RlbmVyIiwiZGlzcG9zZSIsInZhbHVlIiwicmVtb3ZlQWxsQ2hpbGRyZW4iLCJtdXRhdGUiLCJleGlzdGVuY2VTdHJlbmd0aCIsImFzc2VydCIsIm9wYWNpdHkiLCJjbGVhclRpbWVvdXQiLCJzdGFydEhpZGVCdXR0b25UaW1lciIsInNldFRpbWVvdXQiLCJoaWRlQnJlYWtBcGFydEJ1dHRvbiIsIlBPUFVQX0JVVFRPTl9TSE9XX1RJTUUiLCJzaG93QnJlYWtBcGFydEJ1dHRvbiIsImFkZEJyZWFrQXBhcnRCdXR0b24iLCJjZW50ZXJYIiwiYm90dG9tIiwidmlzaWJsZUxvY2FsQm91bmRzIiwibWluWSIsImNlbnRlciIsIlpFUk8iLCJtb2RlIiwidG91Y2hBcmVhIiwibG9jYWxCb3VuZHMiLCJkaWxhdGVkWCIsIndpZHRoIiwid2l0aE9mZnNldHMiLCJoZWlnaHQiLCJoYW5kbGVCcmVha0FwYXJ0QnV0dG9uUHJlc3NlZCIsImFkZExpc3RlbmVyIiwiaGFuZGxlT3ZlckJyZWFrQXBhcnRCdXR0b25DaGFuZ2VkIiwib3ZlckJ1dHRvbiIsIk1hdGgiLCJhYnMiLCJjb21wb3NpdGlvbiIsImxlbmd0aCIsImJyZWFrQXBhcnRBbGxvd2VkIiwibmV3Q291bnQiLCJvbGRDb3VudCIsImludGVycnVwdElucHV0IiwiYnJlYWtBcGFydCIsImNvaW5UZXJtUG9zaXRpb25BbmREZXN0aW5hdGlvblByb3BlcnR5IiwicG9zaXRpb25BbmREZXN0aW5hdGlvbiIsInNldFBvc2l0aW9uQW5kRGVzdGluYXRpb24iLCJkcmFnSGFuZGxlciIsImFsbG93VG91Y2hTbmFnIiwiZHJhZ0JvdW5kc1Byb3BlcnR5IiwidGFyZ2V0Tm9kZSIsIm9mZnNldFBvc2l0aW9uIiwidmlld1BvaW50IiwiZHJhZ0xpc3RlbmVyIiwicG9pbnRlciIsImlzVG91Y2hMaWtlIiwic3RhcnQiLCJzZXQiLCJlbmQiLCJhZGRJbnB1dExpc3RlbmVyIiwiVEVYVF9CQVNFTElORV9ZX09GRlNFVCIsIkJBQ0tHUk9VTkRfQ0FSRF9IRUlHSFRfVEVYVF9NT0RFIiwiQkFDS0dST1VORF9DQVJEX0hFSUdIVF9DT0lOX01PREUiLCJCQUNLR1JPVU5EX0NBUkRfWF9NQVJHSU4iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkFic3RyYWN0Q29pblRlcm1Ob2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIGJhc2UgdHlwZSBmb3IgdGhlIG5vZGVzIHRoYXQgcmVwcmVzZW50IGNvaW4gdGVybXMgaW4gdGhlIHZpZXcsIHRoaXMgZXhpc3RzIHByaW1hcmlseSB0byBhdm9pZCBjb2RlIGR1cGxpY2F0aW9uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgc3RlcFRpbWVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvc3RlcFRpbWVyLmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBEcmFnTGlzdGVuZXIsIE5vZGUsIFJlY3RhbmdsZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBleHByZXNzaW9uRXhjaGFuZ2UgZnJvbSAnLi4vLi4vZXhwcmVzc2lvbkV4Y2hhbmdlLmpzJztcclxuaW1wb3J0IEVFU2hhcmVkQ29uc3RhbnRzIGZyb20gJy4uL0VFU2hhcmVkQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEJyZWFrQXBhcnRCdXR0b24gZnJvbSAnLi9CcmVha0FwYXJ0QnV0dG9uLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBCQUNLR1JPVU5EX0NPUk5FUl9ST1VORElORyA9IDU7XHJcbmNvbnN0IFRPVUNIX0RSQUdfT0ZGU0VUID0gbmV3IFZlY3RvcjIoIDAsIC0zMCApOyAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcblxyXG5jbGFzcyBBYnN0cmFjdENvaW5UZXJtTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0NvaW5UZXJtfSBjb2luVGVybSAtIG1vZGVsIG9mIGEgY29pbiB0ZXJtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBjb2luVGVybSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgYWRkRHJhZ0hhbmRsZXI6IHRydWUsXHJcbiAgICAgIGRyYWdCb3VuZHM6IEJvdW5kczIuRVZFUllUSElORyxcclxuICAgICAgYnJlYWtBcGFydEJ1dHRvbk1vZGU6ICdub3JtYWwnIC8vIHZhbGlkIHZhbHVlcyBhcmUgJ25vcm1hbCcgYW5kICdpbnZlcnRlZCdcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggeyBwaWNrYWJsZTogdHJ1ZSwgY3Vyc29yOiAncG9pbnRlcicgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge0NvaW5UZXJtfVxyXG4gICAgdGhpcy5jb2luVGVybSA9IGNvaW5UZXJtO1xyXG5cclxuICAgIC8vIEBwcm90ZWN0ZWQge1JlY3RhbmdsZX1cclxuICAgIC8vIEFkZCB0aGUgY2FyZC1saWtlIGJhY2tncm91bmQsIGluaXRpYWxseSB0aW55LCB3aWxsIGJlIHNldCBpbiBzdWJjbGFzc2VzIGJ5IGZ1bmN0aW9uIHRoYXQgdXBkYXRlcyB0aGVcclxuICAgIC8vIHJlcHJlc2VudGF0aW9uLlxyXG4gICAgdGhpcy5jYXJkTGlrZUJhY2tncm91bmQgPSBuZXcgUmVjdGFuZ2xlKCAtMSwgLTEsIDIsIDIsIHtcclxuICAgICAgZmlsbDogRUVTaGFyZWRDb25zdGFudHMuQ0FSRF9CQUNLR1JPVU5EX0NPTE9SLFxyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIGNvcm5lclJhZGl1czogQkFDS0dST1VORF9DT1JORVJfUk9VTkRJTkcsXHJcbiAgICAgIHZpc2libGU6IGZhbHNlXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmNhcmRMaWtlQmFja2dyb3VuZCApO1xyXG5cclxuICAgIC8vIEBwcm90ZWN0ZWQge05vZGV9XHJcbiAgICAvLyBBZGQgYSByb290IG5vZGUgc28gdGhhdCB0aGUgYm91bmRzIGNhbiBiZSBlYXNpbHkgbW9uaXRvcmVkIGZvciBjaGFuZ2VzIGluIHNpemUgd2l0aG91dCBnZXR0aW5nIHRyaWdnZXJlZCBieVxyXG4gICAgLy8gY2hhbmdlcyBpbiBwb3NpdGlvbi5cclxuICAgIHRoaXMuY29pbkFuZFRleHRSb290Tm9kZSA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmNvaW5BbmRUZXh0Um9vdE5vZGUgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7U3RyaW5nfSAtIG1ha2Ugb3B0aW9uIHZpc2libGUgdG8gbWV0aG9kc1xyXG4gICAgdGhpcy5icmVha0FwYXJ0QnV0dG9uTW9kZSA9IG9wdGlvbnMuYnJlYWtBcGFydEJ1dHRvbk1vZGU7XHJcblxyXG4gICAgLy8gYWRkIGEgbGlzdGVuZXIgdGhhdCB3aWxsIGFkanVzdCBvcGFjaXR5IGFzIGV4aXN0ZW5jZSBzdHJlbmd0aCBjaGFuZ2VzXHJcbiAgICBjb25zdCBleGlzdGVuY2VTdHJlbmd0aExpc3RlbmVyID0gdGhpcy5oYW5kbGVFeGlzdGVuY2VTdHJlbmd0aENoYW5nZWQuYmluZCggdGhpcyApO1xyXG4gICAgY29pblRlcm0uZXhpc3RlbmNlU3RyZW5ndGhQcm9wZXJ0eS5saW5rKCBleGlzdGVuY2VTdHJlbmd0aExpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Z1bmN0aW9ufSAtIHRpbWVyIGNhbGxiYWNrIHdpbGwgYmUgdXNlZCB0byBoaWRlIHRoZSBicmVhayBhcGFydCBidXR0b24gaWYgdXNlciBkb2Vzbid0IHVzZSBpdFxyXG4gICAgdGhpcy5oaWRlQnV0dG9uVGltZXIgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtCcmVha0FwYXJ0QnV0dG9ufSAtIHRoZSBidXR0b24gdGhhdCB3aWxsIGFsbG93IGNvbXBvc2l0ZSBjb2lucyB0byBiZSBkZWNvbXBvc2VkLCBhZGRlZCBsYXppbHkgaW4gb3JkZXJcclxuICAgIC8vIHRvIGNvbnNlcnZlIG1lbW9yeVxyXG4gICAgdGhpcy5icmVha0FwYXJ0QnV0dG9uID0gbnVsbDtcclxuXHJcbiAgICAvLyBtb3ZlIHRoaXMgbm9kZSBhcyB0aGUgbW9kZWwgcmVwcmVzZW50YXRpb24gbW92ZXNcclxuICAgIGNvbnN0IGhhbmRsZVBvc2l0aW9uQ2hhbmdlZCA9IHBvc2l0aW9uID0+IHtcclxuXHJcbiAgICAgIC8vIHRoZSBpbnRlbnQgaGVyZSBpcyB0byBwb3NpdGlvbiB0aGUgY2VudGVyIG9mIHRoZSBjb2luIGF0IHRoZSBwb3NpdGlvbiwgTk9UIHRoZSBjZW50ZXIgb2YgdGhlIG5vZGVcclxuICAgICAgdGhpcy50cmFuc2xhdGlvbiA9IHBvc2l0aW9uO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb2luVGVybS5wb3NpdGlvblByb3BlcnR5LmxpbmsoIGhhbmRsZVBvc2l0aW9uQ2hhbmdlZCApO1xyXG5cclxuICAgIC8vIGFkZCBhIGxpc3RlbmVyIGZvciB1cGRhdGluZyB0aGUgYnJlYWsgYXBhcnQgYnV0dG9uIHN0YXRlIGJhc2VkIG9uIHRoZSB1c2VyIGNvbnRyb2xsZWQgc3RhdGUgb2YgdGhpcyBjb2luIHRlcm1cclxuICAgIGNvbnN0IHVzZXJDb250cm9sbGVkTGlzdGVuZXIgPSB0aGlzLmhhbmRsZVVzZXJDb250cm9sbGVkQ2hhbmdlZC5iaW5kKCB0aGlzICk7XHJcbiAgICBjb2luVGVybS51c2VyQ29udHJvbGxlZFByb3BlcnR5LmxhenlMaW5rKCB1c2VyQ29udHJvbGxlZExpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gYWRkIGEgbGlzdGVuZXIgdG8gaGFuZGxlIGNoYW5nZXMgdG8gdGhlICdicmVhayBhcGFydCBhbGxvd2VkJyBzdGF0ZVxyXG4gICAgY29uc3QgYnJlYWtBcGFydEFsbG93ZWRMaXN0ZW5lciA9IHRoaXMuaGFuZGxlQnJlYWtBcGFydEFsbG93ZWRDaGFuZ2VkLmJpbmQoIHRoaXMgKTtcclxuICAgIGNvaW5UZXJtLmJyZWFrQXBhcnRBbGxvd2VkUHJvcGVydHkubGluayggYnJlYWtBcGFydEFsbG93ZWRMaXN0ZW5lciApO1xyXG5cclxuICAgIC8vIGFkZCBhIGRyYWcgaGFuZGxlciBpZiBzcGVjaWZpZWRcclxuICAgIGlmICggb3B0aW9ucy5hZGREcmFnSGFuZGxlciApIHtcclxuICAgICAgdGhpcy5hZGREcmFnSGFuZGxlciggb3B0aW9ucy5kcmFnQm91bmRzICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYWRkIGEgbGlzdGVuZXIgdGhhdCB3aWxsIHBvcCB0aGlzIG5vZGUgdG8gdGhlIGZyb250IHdoZW4gc2VsZWN0ZWQgYnkgdGhlIHVzZXJcclxuICAgIGNvaW5UZXJtLnVzZXJDb250cm9sbGVkUHJvcGVydHkubGluayggdXNlckNvbnRyb2xsZWQgPT4ge1xyXG4gICAgICBpZiAoIHVzZXJDb250cm9sbGVkICkge1xyXG4gICAgICAgIHRoaXMubW92ZVRvRnJvbnQoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGFkZCBhIGxpc3RlbmVyIHRoYXQgd2lsbCBwb3AgdGhpcyBub2RlIHRvIHRoZSBmcm9udCB3aGVuIGFub3RoZXIgY29pbiB0ZXJtIGlzIGNvbWJpbmVkIHdpdGggaXRcclxuICAgIGNvbnN0IHRvdGFsQ291bnRMaXN0ZW5lciA9IHRoaXMuaGFuZGxlQ29tYmluZWRDb3VudENoYW5nZWQuYmluZCggdGhpcyApO1xyXG4gICAgY29pblRlcm0udG90YWxDb3VudFByb3BlcnR5LmxpbmsoIHRvdGFsQ291bnRMaXN0ZW5lciApO1xyXG5cclxuICAgIC8vIGZ1bmN0aW9uIHRvIHVwZGF0ZSB0aGUgcGlja2FiaWxpdHkgYXMgdGhlIHN0YXRlcyBjaGFuZ2VcclxuICAgIGNvbnN0IHVwZGF0ZVBpY2thYmlsaXR5ID0gKCkgPT4ge1xyXG5cclxuICAgICAgLy8gVGhlcmUgaXMgc29tZSByYXJlIHJhY2UgY29uZGl0aW9uIHdoZXJlIHRoZSBjb2RlIGJlbG93IHdhcyBiZWluZyBjYWxsZWQgYWZ0ZXIgdGhlIG5vZGUgd2FzIGRpc3Bvc2VkLiAgSVxyXG4gICAgICAvLyAoamJwaGV0KSB3YXMgbmV2ZXIgYWJsZSB0byB0cmFjayBpdCBkb3duLCBsYXJnZWx5IGJlY2F1c2UgaXQgd2FzIHNvIGhhcmQgdG8gcmVwcm9kdWNlLCBzbyBJIGp1c3QgYWRkZWQgdGhlXHJcbiAgICAgIC8vICdpZicgc3RhdGVtZW50IGFzIGEgZ3VhcmQuICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2V4cHJlc3Npb24tZXhjaGFuZ2UvaXNzdWVzLzE0Ny5cclxuICAgICAgaWYgKCAhdGhpcy5pc0Rpc3Bvc2VkICkge1xyXG4gICAgICAgIGNvbnN0IGV4cHJlc3Npb24gPSBjb2luVGVybS5leHByZXNzaW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgICAgdGhpcy5waWNrYWJsZSA9ICggZXhwcmVzc2lvbiA9PT0gbnVsbCB8fCBleHByZXNzaW9uLmluRWRpdE1vZGVQcm9wZXJ0eS5nZXQoKSApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICYmICFjb2luVGVybS5pblByb2dyZXNzQW5pbWF0aW9uUHJvcGVydHkuZ2V0KCkgJiYgIWNvaW5UZXJtLmNvbGxlY3RlZFByb3BlcnR5LmdldCgpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIHVwZGF0ZSB0aGUgcGlja2FiaWxpdHkgb2YgdGhpcyBub2RlXHJcbiAgICBjb25zdCBwaWNrYWJpbGl0eVVwZGF0ZXJNdWx0aWxpbmsgPSBNdWx0aWxpbmsubXVsdGlsaW5rKFxyXG4gICAgICBbIGNvaW5UZXJtLmV4cHJlc3Npb25Qcm9wZXJ0eSwgY29pblRlcm0uaW5Qcm9ncmVzc0FuaW1hdGlvblByb3BlcnR5LCBjb2luVGVybS5jb2xsZWN0ZWRQcm9wZXJ0eSBdLFxyXG4gICAgICB1cGRhdGVQaWNrYWJpbGl0eVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBIb29rIHVwIGEgbGlzdGVuZXIgdGhhdCB3aWxsIGFsbG93IHRoZSBjb2luIHRlcm0gdG8gYmUgcGlja2FibGUgaWYgdGhlIGV4cHJlc3Npb24gdGhhdCBpdCBpcyBpbiB0cmFuc2l0aW9ucyBpbnRvXHJcbiAgICAvLyBlZGl0IG1vZGUuXHJcbiAgICBjb2luVGVybS5leHByZXNzaW9uUHJvcGVydHkubGluayggKCBleHByZXNzaW9uLCBwcmV2aW91c0V4cHJlc3Npb24gKSA9PiB7XHJcbiAgICAgIGlmICggZXhwcmVzc2lvbiApIHtcclxuICAgICAgICBleHByZXNzaW9uLmluRWRpdE1vZGVQcm9wZXJ0eS5saW5rKCB1cGRhdGVQaWNrYWJpbGl0eSApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggcHJldmlvdXNFeHByZXNzaW9uICYmIHByZXZpb3VzRXhwcmVzc2lvbi5pbkVkaXRNb2RlUHJvcGVydHkuaGFzTGlzdGVuZXIoIHVwZGF0ZVBpY2thYmlsaXR5ICkgKSB7XHJcbiAgICAgICAgcHJldmlvdXNFeHByZXNzaW9uLmluRWRpdE1vZGVQcm9wZXJ0eS51bmxpbmsoIHVwZGF0ZVBpY2thYmlsaXR5ICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIGludGVybmFsIGRpc3Bvc2UgZnVuY3Rpb25cclxuICAgIHRoaXMuZGlzcG9zZUFic3RyYWN0Q29pblRlcm1Ob2RlID0gKCkgPT4ge1xyXG4gICAgICB0aGlzLmNsZWFySGlkZUJ1dHRvblRpbWVyKCk7XHJcbiAgICAgIGlmICggdGhpcy5icmVha0FwYXJ0QnV0dG9uICkge1xyXG4gICAgICAgIHRoaXMuYnJlYWtBcGFydEJ1dHRvbi5idXR0b25Nb2RlbC5sb29rc092ZXJQcm9wZXJ0eS51bmxpbmsoIHRoaXMuYnJlYWtBcGFydEJ1dHRvbk92ZXJMaXN0ZW5lciApO1xyXG4gICAgICAgIHRoaXMuYnJlYWtBcGFydEJ1dHRvbi5yZW1vdmVMaXN0ZW5lciggdGhpcy5icmVha0FwYXJ0QnV0dG9uTGlzdGVuZXIgKTtcclxuICAgICAgICB0aGlzLmJyZWFrQXBhcnRCdXR0b24uZGlzcG9zZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIGNvaW5UZXJtLnBvc2l0aW9uUHJvcGVydHkudW5saW5rKCBoYW5kbGVQb3NpdGlvbkNoYW5nZWQgKTtcclxuICAgICAgY29pblRlcm0uZXhpc3RlbmNlU3RyZW5ndGhQcm9wZXJ0eS51bmxpbmsoIGV4aXN0ZW5jZVN0cmVuZ3RoTGlzdGVuZXIgKTtcclxuICAgICAgY29pblRlcm0udXNlckNvbnRyb2xsZWRQcm9wZXJ0eS51bmxpbmsoIHVzZXJDb250cm9sbGVkTGlzdGVuZXIgKTtcclxuICAgICAgY29pblRlcm0uYnJlYWtBcGFydEFsbG93ZWRQcm9wZXJ0eS51bmxpbmsoIGJyZWFrQXBhcnRBbGxvd2VkTGlzdGVuZXIgKTtcclxuICAgICAgY29pblRlcm0udG90YWxDb3VudFByb3BlcnR5LnVubGluayggdG90YWxDb3VudExpc3RlbmVyICk7XHJcbiAgICAgIGlmICggY29pblRlcm0uZXhwcmVzc2lvblByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgIGNvaW5UZXJtLmV4cHJlc3Npb25Qcm9wZXJ0eS52YWx1ZS5pbkVkaXRNb2RlUHJvcGVydHkudW5saW5rKCB1cGRhdGVQaWNrYWJpbGl0eSApO1xyXG4gICAgICB9XHJcbiAgICAgIHBpY2thYmlsaXR5VXBkYXRlck11bHRpbGluay5kaXNwb3NlKCk7XHJcbiAgICAgIHRoaXMucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8vIGFkZCBhIGxpc3RlbmVyIHRoYXQgd2lsbCB1cGRhdGUgdGhlIG9wYWNpdHkgYmFzZWQgb24gdGhlIGNvaW4gdGVybSdzIGV4aXN0ZW5jZSBzdHJlbmd0aFxyXG4gIC8qKlxyXG4gICAqIGxpc3RlbmVyIGZ1bmN0aW9uIHRoYXQgd2lsbCBhZGp1c3Qgb3BhY2l0eSBhcyBleGlzdGVuY2Ugc3RyZW5ndGggY2hhbmdlc1xyXG4gICAqIEBwYXJhbSBleGlzdGVuY2VTdHJlbmd0aFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgaGFuZGxlRXhpc3RlbmNlU3RyZW5ndGhDaGFuZ2VkKCBleGlzdGVuY2VTdHJlbmd0aCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGV4aXN0ZW5jZVN0cmVuZ3RoID49IDAgJiYgZXhpc3RlbmNlU3RyZW5ndGggPD0gMSwgJ2V4aXN0ZW5jZSBzdHJlbmd0aCBtdXN0IGJlIGJldHdlZW4gMCBhbmQgMScgKTtcclxuICAgIGlmICggIXRoaXMuaXNEaXNwb3NlZCApIHtcclxuICAgICAgdGhpcy5waWNrYWJsZSA9IGV4aXN0ZW5jZVN0cmVuZ3RoID09PSAxOyAvLyBwcmV2ZW50IGludGVyYWN0aW9uIHdpdGggZmFkaW5nIGNvaW4gdGVybVxyXG4gICAgICB0aGlzLm9wYWNpdHkgPSBleGlzdGVuY2VTdHJlbmd0aDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgY2xlYXJIaWRlQnV0dG9uVGltZXIoKSB7XHJcbiAgICBpZiAoIHRoaXMuaGlkZUJ1dHRvblRpbWVyICkge1xyXG4gICAgICBzdGVwVGltZXIuY2xlYXJUaW1lb3V0KCB0aGlzLmhpZGVCdXR0b25UaW1lciApO1xyXG4gICAgICB0aGlzLmhpZGVCdXR0b25UaW1lciA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBzdGFydCB0aGUgdGltZXIgZm9yIGhpZGluZyB0aGUgYnJlYWstYXBhcnQgYnV0dG9uXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBzdGFydEhpZGVCdXR0b25UaW1lcigpIHtcclxuICAgIHRoaXMuY2xlYXJIaWRlQnV0dG9uVGltZXIoKTsgLy8ganVzdCBpbiBjYXNlIG9uZSBpcyBhbHJlYWR5IHJ1bm5pbmdcclxuICAgIHRoaXMuaGlkZUJ1dHRvblRpbWVyID0gc3RlcFRpbWVyLnNldFRpbWVvdXQoICgpID0+IHtcclxuICAgICAgdGhpcy5oaWRlQnJlYWtBcGFydEJ1dHRvbigpO1xyXG4gICAgICB0aGlzLmhpZGVCdXR0b25UaW1lciA9IG51bGw7XHJcbiAgICB9LCBFRVNoYXJlZENvbnN0YW50cy5QT1BVUF9CVVRUT05fU0hPV19USU1FICogMTAwMCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogcG9zaXRpb24gYW5kIHNob3cgdGhlIGJyZWFrIGFwYXJ0IGJ1dHRvblxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgc2hvd0JyZWFrQXBhcnRCdXR0b24oKSB7XHJcbiAgICBpZiAoICF0aGlzLmJyZWFrQXBhcnRCdXR0b24gKSB7XHJcbiAgICAgIHRoaXMuYWRkQnJlYWtBcGFydEJ1dHRvbigpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5icmVha0FwYXJ0QnV0dG9uLmNlbnRlclggPSAwO1xyXG4gICAgdGhpcy5icmVha0FwYXJ0QnV0dG9uLmJvdHRvbSA9IHRoaXMuY29pbkFuZFRleHRSb290Tm9kZS52aXNpYmxlTG9jYWxCb3VuZHMubWluWSAtIDM7IC8vIGp1c3QgYWJvdmUgdGhlIGNvaW4gdGVybVxyXG4gICAgdGhpcy5icmVha0FwYXJ0QnV0dG9uLnZpc2libGUgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogcG9zaXRpb24gdGhlIGJyZWFrIGFwYXJ0IGJ1dHRvbiBzdWNoIHRoYXQgdGhlIGJvdW5kcyBhcmUgd2l0aGluIHRoZSBib3VuZHMgb2YgdGhlIGNvaW4gdGVybSBub2RlIGFuZCBoaWRlIGl0XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBoaWRlQnJlYWtBcGFydEJ1dHRvbigpIHtcclxuICAgIGlmICggdGhpcy5icmVha0FwYXJ0QnV0dG9uICkge1xyXG4gICAgICB0aGlzLmJyZWFrQXBhcnRCdXR0b24uY2VudGVyID0gVmVjdG9yMi5aRVJPOyAvLyBwb3NpdGlvbiB3aXRoaW4gY29pbiB0ZXJtIHNvIGJvdW5kcyBhcmVuJ3QgYWZmZWN0ZWRcclxuICAgICAgdGhpcy5icmVha0FwYXJ0QnV0dG9uLnZpc2libGUgPSBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGFkZCB0aGUgYnJlYWsgYXBhcnQgYnV0dG9uLCBnZW5lcmFsbHkgbm90IGRvbmUgdW50aWwgbmVlZGVkIGluIG9yZGVyIHRvIGNvbnNlcnZlIG1lbW9yeVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgYWRkQnJlYWtBcGFydEJ1dHRvbigpIHtcclxuXHJcbiAgICB0aGlzLmJyZWFrQXBhcnRCdXR0b24gPSBuZXcgQnJlYWtBcGFydEJ1dHRvbiggeyB2aXNpYmxlOiBmYWxzZSwgbW9kZTogdGhpcy5icmVha0FwYXJ0QnV0dG9uTW9kZSB9ICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBidXR0b24gb3V0c2lkZSBvZiB0aGUgcm9vdCBjb2luLWFuZC10ZXh0IG5vZGUgc28gdGhhdCBpdCBpc24ndCBpbmNsdWRlZCBpbiB0aGUgYm91bmRzIHRoYXQgYXJlIHNoYXJlZFxyXG4gICAgLy8gd2l0aCB0aGUgbW9kZWwuXHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmJyZWFrQXBhcnRCdXR0b24gKTtcclxuXHJcbiAgICAvLyBhZGp1c3QgdGhlIHRvdWNoIGFyZWEgb2YgdGhlIGJyZWFrIGFwYXJ0IGJ1dHRvbiB0byBtYWtlIGl0IGVhc2llciB0byB1c2Ugb24gdG91Y2ggZGV2aWNlc1xyXG4gICAgdGhpcy5icmVha0FwYXJ0QnV0dG9uLnRvdWNoQXJlYSA9IHRoaXMuYnJlYWtBcGFydEJ1dHRvbi5sb2NhbEJvdW5kcy5kaWxhdGVkWCggdGhpcy5icmVha0FwYXJ0QnV0dG9uLndpZHRoIC8gMiApXHJcbiAgICAgIC53aXRoT2Zmc2V0cyggMCwgdGhpcy5icmVha0FwYXJ0QnV0dG9uLmhlaWdodCwgMCwgMCApO1xyXG5cclxuICAgIHRoaXMuYnJlYWtBcGFydEJ1dHRvbkxpc3RlbmVyID0gdGhpcy5oYW5kbGVCcmVha0FwYXJ0QnV0dG9uUHJlc3NlZC5iaW5kKCB0aGlzICk7IC8vIEBwcml2YXRlLCBuZWVkZWQgZm9yIGRpc3Bvc2FsXHJcbiAgICB0aGlzLmJyZWFrQXBhcnRCdXR0b24uYWRkTGlzdGVuZXIoIHRoaXMuYnJlYWtBcGFydEJ1dHRvbkxpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gYWRkIGEgbGlzdGVuZXIgZm9yIGNoYW5nZXMgdG8gdGhlICdicmVhayBhcGFydCBhbGxvd2VkJyBzdGF0ZVxyXG4gICAgdGhpcy5icmVha0FwYXJ0QnV0dG9uT3Zlckxpc3RlbmVyID0gdGhpcy5oYW5kbGVPdmVyQnJlYWtBcGFydEJ1dHRvbkNoYW5nZWQuYmluZCggdGhpcyApOyAvLyBAcHJpdmF0ZSwgbmVlZGVkIGZvciBkaXNwb3NhbFxyXG4gICAgdGhpcy5icmVha0FwYXJ0QnV0dG9uLmJ1dHRvbk1vZGVsLmxvb2tzT3ZlclByb3BlcnR5LmxhenlMaW5rKCB0aGlzLmJyZWFrQXBhcnRCdXR0b25PdmVyTGlzdGVuZXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGxpc3RlbmVyIGZvciB0aGUgJ292ZXInIHN0YXRlIG9mIHRoZSBicmVhay1hcGFydCBidXR0b25cclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IG92ZXJCdXR0b25cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGhhbmRsZU92ZXJCcmVha0FwYXJ0QnV0dG9uQ2hhbmdlZCggb3ZlckJ1dHRvbiApIHtcclxuXHJcbiAgICAvLyBtYWtlIHN1cmUgdGhlIGNvaW4gdGVybSBpc24ndCB1c2VyIGNvbnRyb2xsZWQgKHRoaXMgaGVscHMgcHJldmVudCBzb21lIG11bHRpLXRvdWNoIHByb2JsZW1zKVxyXG4gICAgaWYgKCAhdGhpcy5jb2luVGVybS51c2VyQ29udHJvbGxlZFByb3BlcnR5LmdldCgpICkge1xyXG4gICAgICBpZiAoIG92ZXJCdXR0b24gKSB7XHJcblxyXG4gICAgICAgIC8vIHRoZSBtb3VzZSBqdXN0IG1vdmVkIG92ZXIgdGhlIGJ1dHRvbiwgc28gc3RvcCB0aGUgdGltZXIgaW4gb3JkZXIgdG8gbWFrZSBzdXJlIHRoZSBidXR0b24gc3RheXMgdmlzaWJsZVxyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICEhdGhpcy5oaWRlQnV0dG9uVGltZXIsICdoaWRlIGJ1dHRvbiB0aW1lciBzaG91bGQgYmUgcnVubmluZycgKTtcclxuICAgICAgICB0aGlzLmNsZWFySGlkZUJ1dHRvblRpbWVyKCk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIHRoZSBtb3VzZSBqdXN0IG1vdmVkIGF3YXkgZnJvbSB0aGUgYnV0dG9uLCBzbyBzdGFydCBhIHRpbWVyIHRvIGhpZGUgaXRcclxuICAgICAgICB0aGlzLnN0YXJ0SGlkZUJ1dHRvblRpbWVyKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGxpc3RlbmVyIHRoYXQgdXBkYXRlcyB0aGUgc3RhdGUgb2YgdGhlIGJyZWFrLWFwYXJ0IGJ1dHRvbiB3aGVuIHRoZSB1c2VyIGNvbnRyb2xsZWQgc3RhdGUgb2YgdGhlIGNvaW4gdGVybSBjaGFuZ2VzXHJcbiAgICogQHBhcmFtIHtib29sZWFufSB1c2VyQ29udHJvbGxlZFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgaGFuZGxlVXNlckNvbnRyb2xsZWRDaGFuZ2VkKCB1c2VyQ29udHJvbGxlZCApIHtcclxuICAgIGlmICggTWF0aC5hYnMoIHRoaXMuY29pblRlcm0uY29tcG9zaXRpb24ubGVuZ3RoICkgPiAxICYmXHJcbiAgICAgICAgIHRoaXMuY29pblRlcm0uYnJlYWtBcGFydEFsbG93ZWRQcm9wZXJ0eS5nZXQoKSAmJlxyXG4gICAgICAgICAhdGhpcy5pc0Rpc3Bvc2VkICkge1xyXG5cclxuICAgICAgaWYgKCB1c2VyQ29udHJvbGxlZCApIHtcclxuICAgICAgICB0aGlzLmNsZWFySGlkZUJ1dHRvblRpbWVyKCk7IC8vIGNhbGxlZCBpbiBjYXNlIHRoZSB0aW1lciB3YXMgcnVubmluZ1xyXG4gICAgICAgIHRoaXMuc2hvd0JyZWFrQXBhcnRCdXR0b24oKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggdGhpcy5icmVha0FwYXJ0QnV0dG9uICYmIHRoaXMuYnJlYWtBcGFydEJ1dHRvbi52aXNpYmxlICkge1xyXG5cclxuICAgICAgICAvLyB0aGUgdXNlckNvbnRyb2xsZWQgZmxhZyB0cmFuc2l0aW9uZWQgdG8gZmFsc2Ugd2hpbGUgdGhlIGJ1dHRvbiB3YXMgdmlzaWJsZSwgc3RhcnQgdGhlIHRpbWUgdG8gaGlkZSBpdFxyXG4gICAgICAgIHRoaXMuc3RhcnRIaWRlQnV0dG9uVGltZXIoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbGlzdGVuZXIgdGhhdCB1cGRhdGVzIHRoZSBzdGF0ZSBvZiB0aGUgYnJlYWstYXBhcnQgYnV0dG9uIHdoZW4gdGhlIGJyZWFrQXBhcnRBbGxvd2VkIHN0YXRlIGNoYW5nZXNcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGJyZWFrQXBhcnRBbGxvd2VkXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBoYW5kbGVCcmVha0FwYXJ0QWxsb3dlZENoYW5nZWQoIGJyZWFrQXBhcnRBbGxvd2VkICkge1xyXG4gICAgaWYgKCB0aGlzLmJyZWFrQXBhcnRCdXR0b24gJiYgdGhpcy5icmVha0FwYXJ0QnV0dG9uLnZpc2libGUgJiYgIWJyZWFrQXBhcnRBbGxvd2VkICkge1xyXG4gICAgICB0aGlzLmNsZWFySGlkZUJ1dHRvblRpbWVyKCk7XHJcbiAgICAgIHRoaXMuaGlkZUJyZWFrQXBhcnRCdXR0b24oKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGxpc3RlbmVyIGZvciBoYW5kbGluZyBjaGFuZ2VzIHRvIHRoZSBjb21iaW5lZCBjb3VudCAoaS5lLiB0aGUgbnVtYmVyIG9mIGNvaW4gdGVybXMgY29tYmluZWQgdG9nZXRoZXIpXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG5ld0NvdW50XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG9sZENvdW50XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBoYW5kbGVDb21iaW5lZENvdW50Q2hhbmdlZCggbmV3Q291bnQsIG9sZENvdW50ICkge1xyXG4gICAgaWYgKCBuZXdDb3VudCA+IG9sZENvdW50ICkge1xyXG4gICAgICB0aGlzLm1vdmVUb0Zyb250KCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB0aGlzLmJyZWFrQXBhcnRCdXR0b24gJiYgdGhpcy5icmVha0FwYXJ0QnV0dG9uLnZpc2libGUgJiYgTWF0aC5hYnMoIG5ld0NvdW50ICkgPCAyICkge1xyXG5cclxuICAgICAgLy8gaWYgY29tYmluZWQgY291bnQgd2FzIHJlZHVjZWQgdGhyb3VnaCBjYW5jZWxsYXRpb24gd2hpbGUgdGhlIGJyZWFrIGFwYXJ0IGJ1dHRvbiB3YXMgdmlzaWJsZSwgaGlkZSBpdCwgc2VlXHJcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9leHByZXNzaW9uLWV4Y2hhbmdlL2lzc3Vlcy8yOVxyXG4gICAgICB0aGlzLmhpZGVCcmVha0FwYXJ0QnV0dG9uKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBoYW5kbGVyIGZvciBwcmVzc2luZyBvZiB0aGUgYnJlYWsgYXBhcnQgYnV0dG9uXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBoYW5kbGVCcmVha0FwYXJ0QnV0dG9uUHJlc3NlZCgpIHtcclxuXHJcbiAgICAvLyBJbnRlcnJ1cHQgYW55IGRyYWdnaW5nIHRoYXQgaXMgaW4gcHJvZ3Jlc3MsIHdoaWNoIGhlbHBzIHRvIHByZXZlbnQgd2VpcmQgbXVsdGktdG91Y2ggcHJvYmxlbXMuICBTZWVcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9leHByZXNzaW9uLWV4Y2hhbmdlL2lzc3Vlcy8xNTEuXHJcbiAgICB0aGlzLmNvaW5BbmRUZXh0Um9vdE5vZGUuaW50ZXJydXB0SW5wdXQoKTtcclxuXHJcbiAgICAvLyBCcmVhayB0aGlzIGNvbXBvc2l0ZSBjb2luIHRlcm0gaW50byBzZXBhcmF0ZSBvbmVzLlxyXG4gICAgdGhpcy5jb2luVGVybS5icmVha0FwYXJ0KCk7XHJcblxyXG4gICAgLy8gSGlkZSB0aGUgYnV0dG9uLCBzaW5jZSBpdCBtdXN0IGhhdmUgYmVlbiBwcmVzc2VkIHRvIGdldCBoZXJlLlxyXG4gICAgdGhpcy5oaWRlQnJlYWtBcGFydEJ1dHRvbigpO1xyXG5cclxuICAgIC8vIENhbmNlbCB0aW1lciAoaWYgcnVubmluZykuXHJcbiAgICB0aGlzLmNsZWFySGlkZUJ1dHRvblRpbWVyKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBhZGQgYSBkcmFnIGhhbmRsZXJcclxuICAgKiB7Qm91bmRzMn0gZHJhZ0JvdW5kc1xyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgYWRkRHJhZ0hhbmRsZXIoIGRyYWdCb3VuZHMgKSB7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgcG9zaXRpb24gcHJvcGVydHkgYW5kIGxpbmsgaXQgdG8gdGhlIGNvaW4gdGVybSwgbmVjZXNzYXJ5IGJlY2F1c2UgY29pbiB0ZXJtIGhhcyBib3RoIHBvc2l0aW9uIGFuZFxyXG4gICAgLy8gZGVzdGluYXRpb24gcHJvcGVydGllcywgYm90aCBvZiB3aGljaCBtdXN0IGJlIHNldCB3aGVuIGRyYWdnaW5nIG9jY3Vycy5cclxuICAgIGNvbnN0IGNvaW5UZXJtUG9zaXRpb25BbmREZXN0aW5hdGlvblByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCB0aGlzLmNvaW5UZXJtLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKTtcclxuICAgIGNvaW5UZXJtUG9zaXRpb25BbmREZXN0aW5hdGlvblByb3BlcnR5LmxhenlMaW5rKCBwb3NpdGlvbkFuZERlc3RpbmF0aW9uID0+IHtcclxuICAgICAgdGhpcy5jb2luVGVybS5zZXRQb3NpdGlvbkFuZERlc3RpbmF0aW9uKCBwb3NpdGlvbkFuZERlc3RpbmF0aW9uICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIGRyYWcgaGFuZGxlciwgcHVibGljIGluIHN1cHBvcnQgb2YgZXZlbnQgZm9yd2FyZGluZyBmcm9tIGNyZWF0b3Igbm9kZXNcclxuICAgIHRoaXMuZHJhZ0hhbmRsZXIgPSBuZXcgRHJhZ0xpc3RlbmVyKCB7XHJcblxyXG4gICAgICBwb3NpdGlvblByb3BlcnR5OiBjb2luVGVybVBvc2l0aW9uQW5kRGVzdGluYXRpb25Qcm9wZXJ0eSxcclxuXHJcbiAgICAgIC8vIGFsbG93IG1vdmluZyBhIGZpbmdlciAodG91Y2gpIGFjcm9zcyBhIG5vZGUgdG8gcGljayBpdCB1cFxyXG4gICAgICBhbGxvd1RvdWNoU25hZzogdHJ1ZSxcclxuXHJcbiAgICAgIC8vIGJvdW5kIHRoZSBhcmVhIHdoZXJlIHRoZSBjb2luIHRlcm1zIGNhbiBnb1xyXG4gICAgICBkcmFnQm91bmRzUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggZHJhZ0JvdW5kcyApLFxyXG5cclxuICAgICAgLy8gc2V0IHRoZSB0YXJnZXQgbm9kZSBzbyB0aGF0IERyYWdMaXN0ZW5lciBrbm93cyB3aGVyZSB0byBnZXQgdGhlIGNvb3JkaW5hdGUgdHJhbnNmb3JtLCBzdXBwb3J0cyBldmVudFxyXG4gICAgICAvLyBmb3J3YXJkaW5nXHJcbiAgICAgIHRhcmdldE5vZGU6IHRoaXMsXHJcblxyXG4gICAgICAvLyBPZmZzZXQgdGhlIHBvc2l0aW9uIGEgbGl0dGxlIGlmIHRoaXMgaXMgYSB0b3VjaCBwb2ludGVyIHNvIHRoYXQgdGhlIGZpbmdlciBkb2Vzbid0IGNvdmVyIHRoZSBjb2luIHRlcm0uXHJcbiAgICAgIG9mZnNldFBvc2l0aW9uOiAoIHZpZXdQb2ludCwgZHJhZ0xpc3RlbmVyICkgPT4ge1xyXG4gICAgICAgIHJldHVybiBkcmFnTGlzdGVuZXIucG9pbnRlci5pc1RvdWNoTGlrZSgpID8gVE9VQ0hfRFJBR19PRkZTRVQgOiBWZWN0b3IyLlpFUk87XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBzdGFydDogKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuY29pblRlcm0udXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGVuZDogKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuY29pblRlcm0udXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5zZXQoIGZhbHNlICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIGxpc3RlbmVyIHRoYXQgd2lsbCBhbGxvdyB0aGUgdXNlciB0byBkcmFnIHRoZSBjb2luIGFyb3VuZC4gIFRoaXMgaXMgYWRkZWQgb25seSB0byB0aGUgbm9kZSB0aGF0XHJcbiAgICAvLyBjb250YWlucyB0aGUgdGVybSBlbGVtZW50cywgbm90IHRoZSBidXR0b24sIHNvIHRoYXQgdGhlIGJ1dHRvbiB3b24ndCBhZmZlY3QgdXNlckNvbnRyb2xsZWQgb3IgYmUgZHJhZ2dhYmxlLlxyXG4gICAgdGhpcy5jb2luQW5kVGV4dFJvb3ROb2RlLmFkZElucHV0TGlzdGVuZXIoIHRoaXMuZHJhZ0hhbmRsZXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgdGhpcy5kaXNwb3NlQWJzdHJhY3RDb2luVGVybU5vZGUoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG59XHJcblxyXG5cclxuLy8gc3RhdGljc1xyXG5cclxuLy8gQHB1YmxpYyB7bnVtYmVyfSAtIFRvIGxvb2sgY29ycmVjdCBpbiBlcXVhdGlvbnMsIHRoZSB0ZXh0IGFsbCBuZWVkcyB0byBiZSBvbiB0aGUgc2FtZSBiYXNlbGluZS4gIFRoZSB2YWx1ZSB3YXNcclxuLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCBhbmQgbWF5IG5lZWQgdG8gY2hhbmdlIGlmIGZvbnQgc2l6ZXMgY2hhbmdlLlxyXG5BYnN0cmFjdENvaW5UZXJtTm9kZS5URVhUX0JBU0VMSU5FX1lfT0ZGU0VUID0gMTI7XHJcblxyXG4vLyBAcHVibGljIHtudW1iZXJ9IC0gSGVpZ2h0IG9mIHRoZSBiYWNrZ3JvdW5kIGNhcmRzIC0gdGhlc2UgYXJlIGZpeGVkIHNvIHRoYXQgc3RhY2tzIG9mIHRoZW0gdGhhdCBhcmUgc2lkZS1ieS1zaWRlXHJcbi8vIGxvb2sgZ29vZC4gIFRoZSB2YWx1ZXMgd2VyZSBlbXBpcmljYWxseSBkZXRlcm1pbmVkLlxyXG5BYnN0cmFjdENvaW5UZXJtTm9kZS5CQUNLR1JPVU5EX0NBUkRfSEVJR0hUX1RFWFRfTU9ERSA9IDcwO1xyXG5BYnN0cmFjdENvaW5UZXJtTm9kZS5CQUNLR1JPVU5EX0NBUkRfSEVJR0hUX0NPSU5fTU9ERSA9IDcwO1xyXG5cclxuLy8gQHB1YmxpYyB7bnVtYmVyfSAtIGhvcml6b250YWwgbWFyZ2luIGZvciBjYXJkIGJhY2tncm91bmRcclxuQWJzdHJhY3RDb2luVGVybU5vZGUuQkFDS0dST1VORF9DQVJEX1hfTUFSR0lOID0gMTU7XHJcblxyXG5leHByZXNzaW9uRXhjaGFuZ2UucmVnaXN0ZXIoICdBYnN0cmFjdENvaW5UZXJtTm9kZScsIEFic3RyYWN0Q29pblRlcm1Ob2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBYnN0cmFjdENvaW5UZXJtTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLGtDQUFrQztBQUN4RCxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLFNBQVMsTUFBTSxrQ0FBa0M7QUFDeEQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsU0FBU0MsWUFBWSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsUUFBUSxtQ0FBbUM7QUFDakYsT0FBT0Msa0JBQWtCLE1BQU0sNkJBQTZCO0FBQzVELE9BQU9DLGlCQUFpQixNQUFNLHlCQUF5QjtBQUN2RCxPQUFPQyxnQkFBZ0IsTUFBTSx1QkFBdUI7O0FBRXBEO0FBQ0EsTUFBTUMsMEJBQTBCLEdBQUcsQ0FBQztBQUNwQyxNQUFNQyxpQkFBaUIsR0FBRyxJQUFJVCxPQUFPLENB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