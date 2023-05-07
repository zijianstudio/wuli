// Copyright 2016-2023, University of Colorado Boulder

/**
 * Abstract base class for card nodes. Provides a background shape for the card. Subtypes are responsible for the
 * card's 'content' (what is displayed on the card), and for constraining the content to the dimensions of the card.
 * All drag handling and animation behavior for cards is encapsulated here.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import merge from '../../../../../phet-core/js/merge.js';
import { Node, Rectangle } from '../../../../../scenery/js/imports.js';
import functionBuilder from '../../../functionBuilder.js';
import FBConstants from '../../FBConstants.js';
import MovableNode from '../MovableNode.js';
export default class CardNode extends MovableNode {
  /**
   * NOTE: The relatively large number of constructor parameters here is a trade-off. There are many things
   * involved in drag handling and animation. I could have reduced the number of parameters by distributing
   * the responsibility for drag handling and animation. But encapsulating all responsibilities here seemed
   * like a superior solution.  So I chose encapsulation at the expense of some increased coupling.
   * See discussion in https://github.com/phetsims/function-builder/issues/77
   *
   * @param {Card} card
   * @param {FunctionContainer} inputContainer - container in the input carousel
   * @param {FunctionContainer} outputContainer - container in the output carousel
   * @param {BuilderNode} builderNode
   * @param {Node} dragLayer - parent for this node when it's being dragged or animating
   * @param {Property.<boolean>} seeInsideProperty - are the 'See Inside' windows visible?
   * @param {function( CardNode, Builder, number )} updateContent - updates the card's content, based on where the card
   * is relative to the builder slots. Parameters are {CardNode} cardNode, {Builder} builder and {number}
   * numberOfFunctionsToApply, how many functions to apply from the builder.
   * @param {Object} [options]
   */
  constructor(card, inputContainer, outputContainer, builderNode, dragLayer, seeInsideProperty, updateContent, options) {
    options = merge({}, FBConstants.CARD_OPTIONS, options);

    // the basic shape of a blank card
    const backgroundNode = new Rectangle(0, 0, options.size.width, options.size.height, _.pick(options, 'cornerRadius', 'fill', 'stroke', 'lineWidth', 'lineDash'));
    assert && assert(!options.children, 'decoration not supported');
    options.children = [backgroundNode];
    const builder = builderNode.builder;
    const MIN_DISTANCE = options.size.width; // minimum distance for card to be considered 'in' slot
    const INPUT_SLOT_X = builder.left - MIN_DISTANCE; // x coordinate where card is considered to be 'in' input slot
    const OUTPUT_SLOT_X = builder.right + MIN_DISTANCE; // x coordinate where card is considered to be 'in' output slot
    const BLOCKED_X_OFFSET = 0.4 * options.size.width; // how far to move card to left of window for a non-invertible function

    let dragDx = 0; // most recent change in x while dragging
    let blocked = false; // was dragging to the left blocked by a non-invertible function?
    let slopeLeft = 0; // slope of the line connecting the input carousel and builder input slot
    let slopeRight = 0; // slope of the line connecting the output carousel and builder input slot

    //-------------------------------------------------------------------------------
    // start a drag cycle
    assert && assert(!options.startDrag);
    options.startDrag = () => {
      dragDx = 0;

      // points used to compute slope of line between input/output carousels and input/output builder slots
      let leftPoint = inputContainer.carouselPosition;
      let rightPoint = outputContainer.carouselPosition;
      if (inputContainer.containsNode(this)) {
        // card is in the input carousel, pop it out
        inputContainer.removeNode(this);
        card.moveTo(inputContainer.carouselPosition.plus(FBConstants.CARD_POP_OUT_OFFSET));
        dragLayer.addChild(this);

        // adjust for pop-out offset
        leftPoint = card.positionProperty.get();
      } else if (outputContainer.containsNode(this)) {
        // card is in the output carousel, pop it out
        outputContainer.removeNode(this);
        card.moveTo(outputContainer.carouselPosition.plus(FBConstants.CARD_POP_OUT_OFFSET));
        dragLayer.addChild(this);

        // adjust for pop-out offset
        rightPoint = card.positionProperty.get();
      } else {
        // card was grabbed while animating or while in 'see inside' window
        this.unregisterAsSeeInsideCard();
      }
      assert && assert(dragLayer.hasChild(this), 'startDrag must move node to dragLayer');

      // the card most recently grabbed is in the front
      this.moveToFront();

      // slope of line between input carousel and builder's input slot, m = (y2-y1)/(x2-x1)
      slopeLeft = (leftPoint.y - builder.position.y) / (leftPoint.x - INPUT_SLOT_X);

      // slope of line between output carousel and builder's output slot, m = (y2-y1)/(x2-x1)
      slopeRight = (rightPoint.y - builder.position.y) / (rightPoint.x - OUTPUT_SLOT_X);
    };

    //-------------------------------------------------------------------------------
    // constrain dragging
    assert && assert(!options.translateMovable);
    options.translateMovable = (card, position, delta) => {
      blocked = false; // assume we're not blocked, because functions may be changing simultaneously via multi-touch
      dragDx = delta.x;
      let y = 0;
      if (position.x > OUTPUT_SLOT_X) {
        // card is to the right of the builder, drag along the line between output carousel and builder output
        y = slopeRight * (position.x - OUTPUT_SLOT_X) + builder.position.y; // y = m(x-x1) + y1
        card.moveTo(new Vector2(position.x, y));
      } else {
        // to left of builder's output slot

        // dragging to the left, check to see if blocked by a non-invertible function
        if (dragDx < 0) {
          for (let i = builder.numberOfSlots - 1; i >= 0 && !blocked; i--) {
            const slot = builder.slots[i];

            // if slot is to the left of where the card currently is ...
            if (card.positionProperty.get().x > slot.position.x) {
              const windowPosition = builder.getWindowPosition(i);

              // card has hit a non-invertible function
              if (!slot.isInvertible() && position.x < windowPosition.x) {
                blocked = true;
                this.builderNode.getFunctionNode(i).startNotInvertibleAnimation();

                // allow left edge of card to be dragged slightly past left edge of 'see inside' window
                const blockedX = windowPosition.x - BLOCKED_X_OFFSET;
                if (position.x > blockedX) {
                  card.moveTo(new Vector2(position.x, builder.position.y));
                } else {
                  card.moveTo(new Vector2(blockedX, builder.position.y));
                }
              }
            }
          }
        }
        if (!blocked) {
          if (position.x < INPUT_SLOT_X) {
            // card is to the left of the builder, drag along the line between input carousel and builder input slot
            y = slopeLeft * (position.x - INPUT_SLOT_X) + builder.position.y; // y = m(x-x1) + y1
            card.moveTo(new Vector2(position.x, y));
          } else {
            // card is in the builder, dragging horizontally
            card.moveTo(new Vector2(position.x, builder.position.y));
          }
        }
      }
    };

    //-------------------------------------------------------------------------------
    // end a drag cycle
    assert && assert(!options.endDrag);
    options.endDrag = () => {
      assert && assert(dragLayer.hasChild(this), 'endDrag: card should be in dragLayer');
      const cardX = card.positionProperty.get().x;
      if (cardX < INPUT_SLOT_X) {
        // card is to left of builder, animate to input carousel
        this.animateToCarousel(inputContainer);
      } else if (cardX > OUTPUT_SLOT_X) {
        // card is to right of builder, animate to output carousel
        this.animateToCarousel(outputContainer);
      } else {
        // card is in the builder

        if (dragDx >= 0 || blocked) {
          // dragging to the right or blocked by a non-invertible function

          // snap to input slot
          if (cardX < builder.left) {
            card.moveTo(new Vector2(builder.left, builder.position.y));
          }
          this.animateLeftToRight(OUTPUT_SLOT_X);
        } else {
          // dragging to the left

          // snap to output slot
          if (cardX > builder.right) {
            card.moveTo(new Vector2(builder.right, builder.position.y));
          }
          this.animateRightToLeft(INPUT_SLOT_X, OUTPUT_SLOT_X, BLOCKED_X_OFFSET);
        }
      }
    };

    // {Property.<number>} Number of functions to apply is based on where the card is located relative to the
    // function slots in the builder
    const numberOfFunctionsToApplyProperty = new DerivedProperty([card.positionProperty], position => {
      for (let i = builder.numberOfSlots - 1; i >= 0; i--) {
        if (position.x >= builder.slots[i].position.x) {
          return i + 1;
        }
      }
      return 0;
    });
    super(card, options);

    //------------------------------------------------------------------------------------------------------------------
    // Define properties in one place, so we can see what's available and document visibility

    // @public
    this.card = card;

    // @protected
    this.backgroundNode = backgroundNode;

    // @private
    this.inputContainer = inputContainer;
    this.outputContainer = outputContainer;
    this.builderNode = builderNode;
    this.dragLayer = dragLayer;
    this.seeInsideProperty = seeInsideProperty;

    //------------------------------------------------------------------------------------------------------------------

    // unlink unnecessary, instances exist for lifetime of the sim
    numberOfFunctionsToApplyProperty.link(numberOfFunctionsToApply => {
      updateContent(this, builder, numberOfFunctionsToApply);
    });

    // Updates any cards that are not in the input carousel when any function in the builder changes.
    // removeListener unnecessary, instances exist for the lifetime of the sim.
    builderNode.builder.functionChangedEmitter.addListener(() => {
      if (!inputContainer.containsNode(this)) {
        updateContent(this, builder, numberOfFunctionsToApplyProperty.get());
      }
    });

    // When 'See Inside' is turned off, flush out any cards that are stopped in windows.
    // unlink unnecessary, instances exist for lifetime of the sim
    seeInsideProperty.lazyLink(seeInside => {
      if (!seeInside && !card.isAnimating() && dragLayer.hasChild(this)) {
        this.unregisterAsSeeInsideCard();
        this.animateLeftToRight(OUTPUT_SLOT_X);
      }
    });
  }

  /**
   * Animates this card to a container in a carousel.
   *
   * @param {CardContainer} container
   * @private
   */
  animateToCarousel(container) {
    assert && assert(this.dragLayer.hasChild(this), 'animateToCarousel: card should be in dragLayer');
    this.card.animateTo(container.carouselPosition, () => {
      this.dragLayer.removeChild(this);
      container.addNode(this);
    });
  }

  /**
   * Moves this card immediately to the input carousel, no animation.
   * If the card is already in the input carousel, this is a no-op.
   *
   * @public
   */
  moveToInputCarousel() {
    if (this.dragLayer.hasChild(this)) {
      // remove from drag layer
      this.interruptSubtreeInput(); // cancel drag
      this.dragLayer.removeChild(this);
      this.unregisterAsSeeInsideCard();
    } else if (this.outputContainer.containsNode(this)) {
      // remove from output carousel
      this.outputContainer.removeNode(this);
    }

    // move to input carousel
    if (!this.inputContainer.containsNode(this)) {
      this.inputContainer.addNode(this);
    }
  }

  /**
   * Animates left-to-right through the builder, stopping at the first 'See Inside' window that's visible.
   * If no 'See Inside' window is visible, the card continues to the output carousel.
   *
   * @param outputSlotX - x coordinate where card is considered to be in the output slot
   * @private
   */
  animateLeftToRight(outputSlotX) {
    assert && assert(this.dragLayer.hasChild(this), 'animateLeftToRight: card should be in dragLayer');
    const builder = this.builderNode.builder;
    const windowNumber = builder.getWindowNumberGreaterThan(this.card.positionProperty.get().x);
    if (builder.isValidWindowNumber(windowNumber)) {
      // animate to 'See Inside' window to right of card
      const windowPosition = builder.getWindowPosition(windowNumber);
      this.card.animateTo(windowPosition, () => {
        if (this.seeInsideProperty.get()) {
          // stop at this window, register as the 'see inside' card
          this.registerAsSeeInsideCard(outputSlotX);
        } else {
          // continue to next window
          this.animateLeftToRight(outputSlotX);
        }
      });
    } else {
      // animate to output slot, then to output carousel
      this.card.animateTo(new Vector2(outputSlotX, builder.position.y), () => this.animateToCarousel(this.outputContainer));
    }
  }

  /**
   * Animates right-to-left through the builder, stopping at the first 'See Inside' window that's visible.
   * If no 'See Inside' window is visible, the card continues to the input carousel.  If an non-invertible
   * function is encountered at any time, then the card reverses direction (see animateLeftToRight).
   *
   * @param {number} inputSlotX - x coordinate where card is considered to be in the input slot
   * @param {number} outputSlotX - x coordinate where card is considered to be in the output slot
   * @param {number} blockedXOffset - how far to move card to left of window for a non-invertible function
   * @private
   */
  animateRightToLeft(inputSlotX, outputSlotX, blockedXOffset) {
    assert && assert(this.dragLayer.hasChild(this), 'animateRightToLeft: card should be in dragLayer');
    const builder = this.builderNode.builder;
    const windowNumber = builder.getWindowNumberLessThanOrEqualTo(this.card.positionProperty.get().x);
    if (builder.isValidWindowNumber(windowNumber)) {
      // animate to 'See Inside' window to left of card
      const windowPosition = builder.getWindowPosition(windowNumber);
      this.card.animateTo(windowPosition, () => {
        const slot = builder.slots[windowNumber];
        if (!slot.isEmpty() && !slot.functionInstance.invertible) {
          // encountered a non-invertible function, go slightly past it, then reverse direction
          this.builderNode.getFunctionNode(windowNumber).startNotInvertibleAnimation();
          this.card.animateTo(new Vector2(windowPosition.x - blockedXOffset, windowPosition.y), () => this.animateLeftToRight(outputSlotX));
        } else if (this.seeInsideProperty.get()) {
          // stop at this window, register as the 'see inside' card
          this.registerAsSeeInsideCard(outputSlotX);
        } else {
          // If a card is exactly centered in a window, it will stop there, regardless of 'see inside' state.
          // So before continuing to the next window, move the card 1 unit to the left.
          // See https://github.com/phetsims/function-builder/issues/107
          if (this.card.positionProperty.get().x === windowPosition.x) {
            this.card.moveTo(new Vector2(this.card.positionProperty.get().x - 1, builder.position.y));
          }

          // continue to next window
          this.animateRightToLeft(inputSlotX, outputSlotX, blockedXOffset);
        }
      });
    } else {
      // animate to input slot, then to input carousel
      this.card.animateTo(new Vector2(inputSlotX, builder.position.y), () => this.animateToCarousel(this.inputContainer));
    }
  }

  /**
   * Flushes this card from a 'see inside' window.  Sends it directly to its container in the output carousel,
   * without stopping at any 'see inside' windows. See issue #44.
   *
   * @param outputSlotX - x coordinate where card is considered to be in the output slot
   * @public
   */
  flushSeeInsideCard(outputSlotX) {
    assert && assert(this.dragLayer.hasChild(this), 'flushSeeInsideCard: card should be in dragLayer');
    assert && assert(!this.card.dragging, 'flushSeeInsideCard: card should be parked in See Inside window');
    assert && assert(this.builderNode.seeInsideCardNode === this, 'flushSeeInsideCard: not a See Inside card');

    // animate to output slot, then to output carousel
    this.card.animateTo(new Vector2(outputSlotX, this.builderNode.builder.position.y), () => this.animateToCarousel(this.outputContainer));
  }

  /**
   * Registers this card as the sole card that may occupy 'see inside' windows.
   * Any card that currently occupies a window is flushed to the output carousel.
   * See issue #44.
   *
   * @param {number} outputSlotX - x coordinate where card is considered to be in the output slot
   * @private
   */
  registerAsSeeInsideCard(outputSlotX) {
    // flush any existing 'see inside' card
    if (this.builderNode.seeInsideCardNode) {
      this.builderNode.seeInsideCardNode.flushSeeInsideCard(outputSlotX);
      this.builderNode.seeInsideCardNode = null;
    }

    // register as the 'see inside' card
    this.builderNode.seeInsideCardNode = this;
  }

  /**
   * Unregisters this card as the sole card that may occupy 'see inside' windows. See issue #44.
   * If this card is not currently registered, this is a no-op.
   *
   * @private
   */
  unregisterAsSeeInsideCard() {
    if (this === this.builderNode.seeInsideCardNode) {
      this.builderNode.seeInsideCardNode = null;
    }
  }

  /**
   * Creates a 'ghost' card that appears in an empty carousel.
   * The card has a dashed outline and its content is transparent.
   *
   * @param {Node} contentNode - what appears on the card
   * @param {Object} [options]
   * @returns {Node}
   * @public
   * @static
   */
  static createGhostNode(contentNode, options) {
    options = merge({}, FBConstants.CARD_OPTIONS, options);
    options.lineDash = [4, 4];
    options.opacity = 0.5;
    const backgroundNode = new Rectangle(0, 0, options.size.width, options.size.height, _.pick(options, 'cornerRadius', 'fill', 'stroke', 'lineWidth', 'lineDash'));

    // center content on background
    contentNode.center = backgroundNode.center;
    assert && assert(!options.children, 'decoration not supported');
    options.children = [backgroundNode, contentNode];
    return new Node(options);
  }

  /**
   * Creates a card-like icon for x or y symbol, for use in equations.
   *
   * @param {Node} xyNode - the symbol on the card
   * @param {Object} [options]
   * @returns {Node}
   * @public
   * @static
   */
  static createEquationXYNode(xyNode, options) {
    options = merge({
      xMargin: 30,
      yMargin: 15,
      minHeight: 35
    }, FBConstants.CARD_OPTIONS, options);
    const backgroundHeight = Math.max(options.minHeight, xyNode.height + options.yMargin);
    const backgroundWidth = Math.max(xyNode.width + options.xMargin, backgroundHeight);
    const backgroundNode = new Rectangle(0, 0, backgroundWidth, backgroundHeight, _.pick(options, 'cornerRadius', 'fill', 'stroke', 'lineWidth', 'lineDash'));

    // center content on background
    xyNode.center = backgroundNode.center;
    assert && assert(!options.children, 'decoration not supported');
    options.children = [backgroundNode, xyNode];
    return new Node(options);
  }
}
functionBuilder.register('CardNode', CardNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJWZWN0b3IyIiwibWVyZ2UiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiZnVuY3Rpb25CdWlsZGVyIiwiRkJDb25zdGFudHMiLCJNb3ZhYmxlTm9kZSIsIkNhcmROb2RlIiwiY29uc3RydWN0b3IiLCJjYXJkIiwiaW5wdXRDb250YWluZXIiLCJvdXRwdXRDb250YWluZXIiLCJidWlsZGVyTm9kZSIsImRyYWdMYXllciIsInNlZUluc2lkZVByb3BlcnR5IiwidXBkYXRlQ29udGVudCIsIm9wdGlvbnMiLCJDQVJEX09QVElPTlMiLCJiYWNrZ3JvdW5kTm9kZSIsInNpemUiLCJ3aWR0aCIsImhlaWdodCIsIl8iLCJwaWNrIiwiYXNzZXJ0IiwiY2hpbGRyZW4iLCJidWlsZGVyIiwiTUlOX0RJU1RBTkNFIiwiSU5QVVRfU0xPVF9YIiwibGVmdCIsIk9VVFBVVF9TTE9UX1giLCJyaWdodCIsIkJMT0NLRURfWF9PRkZTRVQiLCJkcmFnRHgiLCJibG9ja2VkIiwic2xvcGVMZWZ0Iiwic2xvcGVSaWdodCIsInN0YXJ0RHJhZyIsImxlZnRQb2ludCIsImNhcm91c2VsUG9zaXRpb24iLCJyaWdodFBvaW50IiwiY29udGFpbnNOb2RlIiwicmVtb3ZlTm9kZSIsIm1vdmVUbyIsInBsdXMiLCJDQVJEX1BPUF9PVVRfT0ZGU0VUIiwiYWRkQ2hpbGQiLCJwb3NpdGlvblByb3BlcnR5IiwiZ2V0IiwidW5yZWdpc3RlckFzU2VlSW5zaWRlQ2FyZCIsImhhc0NoaWxkIiwibW92ZVRvRnJvbnQiLCJ5IiwicG9zaXRpb24iLCJ4IiwidHJhbnNsYXRlTW92YWJsZSIsImRlbHRhIiwiaSIsIm51bWJlck9mU2xvdHMiLCJzbG90Iiwic2xvdHMiLCJ3aW5kb3dQb3NpdGlvbiIsImdldFdpbmRvd1Bvc2l0aW9uIiwiaXNJbnZlcnRpYmxlIiwiZ2V0RnVuY3Rpb25Ob2RlIiwic3RhcnROb3RJbnZlcnRpYmxlQW5pbWF0aW9uIiwiYmxvY2tlZFgiLCJlbmREcmFnIiwiY2FyZFgiLCJhbmltYXRlVG9DYXJvdXNlbCIsImFuaW1hdGVMZWZ0VG9SaWdodCIsImFuaW1hdGVSaWdodFRvTGVmdCIsIm51bWJlck9mRnVuY3Rpb25zVG9BcHBseVByb3BlcnR5IiwibGluayIsIm51bWJlck9mRnVuY3Rpb25zVG9BcHBseSIsImZ1bmN0aW9uQ2hhbmdlZEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImxhenlMaW5rIiwic2VlSW5zaWRlIiwiaXNBbmltYXRpbmciLCJjb250YWluZXIiLCJhbmltYXRlVG8iLCJyZW1vdmVDaGlsZCIsImFkZE5vZGUiLCJtb3ZlVG9JbnB1dENhcm91c2VsIiwiaW50ZXJydXB0U3VidHJlZUlucHV0Iiwib3V0cHV0U2xvdFgiLCJ3aW5kb3dOdW1iZXIiLCJnZXRXaW5kb3dOdW1iZXJHcmVhdGVyVGhhbiIsImlzVmFsaWRXaW5kb3dOdW1iZXIiLCJyZWdpc3RlckFzU2VlSW5zaWRlQ2FyZCIsImlucHV0U2xvdFgiLCJibG9ja2VkWE9mZnNldCIsImdldFdpbmRvd051bWJlckxlc3NUaGFuT3JFcXVhbFRvIiwiaXNFbXB0eSIsImZ1bmN0aW9uSW5zdGFuY2UiLCJpbnZlcnRpYmxlIiwiZmx1c2hTZWVJbnNpZGVDYXJkIiwiZHJhZ2dpbmciLCJzZWVJbnNpZGVDYXJkTm9kZSIsImNyZWF0ZUdob3N0Tm9kZSIsImNvbnRlbnROb2RlIiwibGluZURhc2giLCJvcGFjaXR5IiwiY2VudGVyIiwiY3JlYXRlRXF1YXRpb25YWU5vZGUiLCJ4eU5vZGUiLCJ4TWFyZ2luIiwieU1hcmdpbiIsIm1pbkhlaWdodCIsImJhY2tncm91bmRIZWlnaHQiLCJNYXRoIiwibWF4IiwiYmFja2dyb3VuZFdpZHRoIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDYXJkTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBYnN0cmFjdCBiYXNlIGNsYXNzIGZvciBjYXJkIG5vZGVzLiBQcm92aWRlcyBhIGJhY2tncm91bmQgc2hhcGUgZm9yIHRoZSBjYXJkLiBTdWJ0eXBlcyBhcmUgcmVzcG9uc2libGUgZm9yIHRoZVxyXG4gKiBjYXJkJ3MgJ2NvbnRlbnQnICh3aGF0IGlzIGRpc3BsYXllZCBvbiB0aGUgY2FyZCksIGFuZCBmb3IgY29uc3RyYWluaW5nIHRoZSBjb250ZW50IHRvIHRoZSBkaW1lbnNpb25zIG9mIHRoZSBjYXJkLlxyXG4gKiBBbGwgZHJhZyBoYW5kbGluZyBhbmQgYW5pbWF0aW9uIGJlaGF2aW9yIGZvciBjYXJkcyBpcyBlbmNhcHN1bGF0ZWQgaGVyZS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgTm9kZSwgUmVjdGFuZ2xlIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGZ1bmN0aW9uQnVpbGRlciBmcm9tICcuLi8uLi8uLi9mdW5jdGlvbkJ1aWxkZXIuanMnO1xyXG5pbXBvcnQgRkJDb25zdGFudHMgZnJvbSAnLi4vLi4vRkJDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgTW92YWJsZU5vZGUgZnJvbSAnLi4vTW92YWJsZU5vZGUuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2FyZE5vZGUgZXh0ZW5kcyBNb3ZhYmxlTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIE5PVEU6IFRoZSByZWxhdGl2ZWx5IGxhcmdlIG51bWJlciBvZiBjb25zdHJ1Y3RvciBwYXJhbWV0ZXJzIGhlcmUgaXMgYSB0cmFkZS1vZmYuIFRoZXJlIGFyZSBtYW55IHRoaW5nc1xyXG4gICAqIGludm9sdmVkIGluIGRyYWcgaGFuZGxpbmcgYW5kIGFuaW1hdGlvbi4gSSBjb3VsZCBoYXZlIHJlZHVjZWQgdGhlIG51bWJlciBvZiBwYXJhbWV0ZXJzIGJ5IGRpc3RyaWJ1dGluZ1xyXG4gICAqIHRoZSByZXNwb25zaWJpbGl0eSBmb3IgZHJhZyBoYW5kbGluZyBhbmQgYW5pbWF0aW9uLiBCdXQgZW5jYXBzdWxhdGluZyBhbGwgcmVzcG9uc2liaWxpdGllcyBoZXJlIHNlZW1lZFxyXG4gICAqIGxpa2UgYSBzdXBlcmlvciBzb2x1dGlvbi4gIFNvIEkgY2hvc2UgZW5jYXBzdWxhdGlvbiBhdCB0aGUgZXhwZW5zZSBvZiBzb21lIGluY3JlYXNlZCBjb3VwbGluZy5cclxuICAgKiBTZWUgZGlzY3Vzc2lvbiBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZnVuY3Rpb24tYnVpbGRlci9pc3N1ZXMvNzdcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Q2FyZH0gY2FyZFxyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb25Db250YWluZXJ9IGlucHV0Q29udGFpbmVyIC0gY29udGFpbmVyIGluIHRoZSBpbnB1dCBjYXJvdXNlbFxyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb25Db250YWluZXJ9IG91dHB1dENvbnRhaW5lciAtIGNvbnRhaW5lciBpbiB0aGUgb3V0cHV0IGNhcm91c2VsXHJcbiAgICogQHBhcmFtIHtCdWlsZGVyTm9kZX0gYnVpbGRlck5vZGVcclxuICAgKiBAcGFyYW0ge05vZGV9IGRyYWdMYXllciAtIHBhcmVudCBmb3IgdGhpcyBub2RlIHdoZW4gaXQncyBiZWluZyBkcmFnZ2VkIG9yIGFuaW1hdGluZ1xyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSBzZWVJbnNpZGVQcm9wZXJ0eSAtIGFyZSB0aGUgJ1NlZSBJbnNpZGUnIHdpbmRvd3MgdmlzaWJsZT9cclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCBDYXJkTm9kZSwgQnVpbGRlciwgbnVtYmVyICl9IHVwZGF0ZUNvbnRlbnQgLSB1cGRhdGVzIHRoZSBjYXJkJ3MgY29udGVudCwgYmFzZWQgb24gd2hlcmUgdGhlIGNhcmRcclxuICAgKiBpcyByZWxhdGl2ZSB0byB0aGUgYnVpbGRlciBzbG90cy4gUGFyYW1ldGVycyBhcmUge0NhcmROb2RlfSBjYXJkTm9kZSwge0J1aWxkZXJ9IGJ1aWxkZXIgYW5kIHtudW1iZXJ9XHJcbiAgICogbnVtYmVyT2ZGdW5jdGlvbnNUb0FwcGx5LCBob3cgbWFueSBmdW5jdGlvbnMgdG8gYXBwbHkgZnJvbSB0aGUgYnVpbGRlci5cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGNhcmQsIGlucHV0Q29udGFpbmVyLCBvdXRwdXRDb250YWluZXIsIGJ1aWxkZXJOb2RlLCBkcmFnTGF5ZXIsIHNlZUluc2lkZVByb3BlcnR5LCB1cGRhdGVDb250ZW50LCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge30sIEZCQ29uc3RhbnRzLkNBUkRfT1BUSU9OUywgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIHRoZSBiYXNpYyBzaGFwZSBvZiBhIGJsYW5rIGNhcmRcclxuICAgIGNvbnN0IGJhY2tncm91bmROb2RlID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgb3B0aW9ucy5zaXplLndpZHRoLCBvcHRpb25zLnNpemUuaGVpZ2h0LFxyXG4gICAgICBfLnBpY2soIG9wdGlvbnMsICdjb3JuZXJSYWRpdXMnLCAnZmlsbCcsICdzdHJva2UnLCAnbGluZVdpZHRoJywgJ2xpbmVEYXNoJyApICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuY2hpbGRyZW4sICdkZWNvcmF0aW9uIG5vdCBzdXBwb3J0ZWQnICk7XHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyBiYWNrZ3JvdW5kTm9kZSBdO1xyXG5cclxuICAgIGNvbnN0IGJ1aWxkZXIgPSBidWlsZGVyTm9kZS5idWlsZGVyO1xyXG5cclxuICAgIGNvbnN0IE1JTl9ESVNUQU5DRSA9IG9wdGlvbnMuc2l6ZS53aWR0aDsgLy8gbWluaW11bSBkaXN0YW5jZSBmb3IgY2FyZCB0byBiZSBjb25zaWRlcmVkICdpbicgc2xvdFxyXG4gICAgY29uc3QgSU5QVVRfU0xPVF9YID0gYnVpbGRlci5sZWZ0IC0gTUlOX0RJU1RBTkNFOyAvLyB4IGNvb3JkaW5hdGUgd2hlcmUgY2FyZCBpcyBjb25zaWRlcmVkIHRvIGJlICdpbicgaW5wdXQgc2xvdFxyXG4gICAgY29uc3QgT1VUUFVUX1NMT1RfWCA9IGJ1aWxkZXIucmlnaHQgKyBNSU5fRElTVEFOQ0U7IC8vIHggY29vcmRpbmF0ZSB3aGVyZSBjYXJkIGlzIGNvbnNpZGVyZWQgdG8gYmUgJ2luJyBvdXRwdXQgc2xvdFxyXG4gICAgY29uc3QgQkxPQ0tFRF9YX09GRlNFVCA9ICggMC40ICogb3B0aW9ucy5zaXplLndpZHRoICk7IC8vIGhvdyBmYXIgdG8gbW92ZSBjYXJkIHRvIGxlZnQgb2Ygd2luZG93IGZvciBhIG5vbi1pbnZlcnRpYmxlIGZ1bmN0aW9uXHJcblxyXG4gICAgbGV0IGRyYWdEeCA9IDA7IC8vIG1vc3QgcmVjZW50IGNoYW5nZSBpbiB4IHdoaWxlIGRyYWdnaW5nXHJcbiAgICBsZXQgYmxvY2tlZCA9IGZhbHNlOyAvLyB3YXMgZHJhZ2dpbmcgdG8gdGhlIGxlZnQgYmxvY2tlZCBieSBhIG5vbi1pbnZlcnRpYmxlIGZ1bmN0aW9uP1xyXG4gICAgbGV0IHNsb3BlTGVmdCA9IDA7IC8vIHNsb3BlIG9mIHRoZSBsaW5lIGNvbm5lY3RpbmcgdGhlIGlucHV0IGNhcm91c2VsIGFuZCBidWlsZGVyIGlucHV0IHNsb3RcclxuICAgIGxldCBzbG9wZVJpZ2h0ID0gMDsgLy8gc2xvcGUgb2YgdGhlIGxpbmUgY29ubmVjdGluZyB0aGUgb3V0cHV0IGNhcm91c2VsIGFuZCBidWlsZGVyIGlucHV0IHNsb3RcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIHN0YXJ0IGEgZHJhZyBjeWNsZVxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuc3RhcnREcmFnICk7XHJcbiAgICBvcHRpb25zLnN0YXJ0RHJhZyA9ICgpID0+IHtcclxuXHJcbiAgICAgIGRyYWdEeCA9IDA7XHJcblxyXG4gICAgICAvLyBwb2ludHMgdXNlZCB0byBjb21wdXRlIHNsb3BlIG9mIGxpbmUgYmV0d2VlbiBpbnB1dC9vdXRwdXQgY2Fyb3VzZWxzIGFuZCBpbnB1dC9vdXRwdXQgYnVpbGRlciBzbG90c1xyXG4gICAgICBsZXQgbGVmdFBvaW50ID0gaW5wdXRDb250YWluZXIuY2Fyb3VzZWxQb3NpdGlvbjtcclxuICAgICAgbGV0IHJpZ2h0UG9pbnQgPSBvdXRwdXRDb250YWluZXIuY2Fyb3VzZWxQb3NpdGlvbjtcclxuXHJcbiAgICAgIGlmICggaW5wdXRDb250YWluZXIuY29udGFpbnNOb2RlKCB0aGlzICkgKSB7XHJcblxyXG4gICAgICAgIC8vIGNhcmQgaXMgaW4gdGhlIGlucHV0IGNhcm91c2VsLCBwb3AgaXQgb3V0XHJcbiAgICAgICAgaW5wdXRDb250YWluZXIucmVtb3ZlTm9kZSggdGhpcyApO1xyXG4gICAgICAgIGNhcmQubW92ZVRvKCBpbnB1dENvbnRhaW5lci5jYXJvdXNlbFBvc2l0aW9uLnBsdXMoIEZCQ29uc3RhbnRzLkNBUkRfUE9QX09VVF9PRkZTRVQgKSApO1xyXG4gICAgICAgIGRyYWdMYXllci5hZGRDaGlsZCggdGhpcyApO1xyXG5cclxuICAgICAgICAvLyBhZGp1c3QgZm9yIHBvcC1vdXQgb2Zmc2V0XHJcbiAgICAgICAgbGVmdFBvaW50ID0gY2FyZC5wb3NpdGlvblByb3BlcnR5LmdldCgpO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBvdXRwdXRDb250YWluZXIuY29udGFpbnNOb2RlKCB0aGlzICkgKSB7XHJcblxyXG4gICAgICAgIC8vIGNhcmQgaXMgaW4gdGhlIG91dHB1dCBjYXJvdXNlbCwgcG9wIGl0IG91dFxyXG4gICAgICAgIG91dHB1dENvbnRhaW5lci5yZW1vdmVOb2RlKCB0aGlzICk7XHJcbiAgICAgICAgY2FyZC5tb3ZlVG8oIG91dHB1dENvbnRhaW5lci5jYXJvdXNlbFBvc2l0aW9uLnBsdXMoIEZCQ29uc3RhbnRzLkNBUkRfUE9QX09VVF9PRkZTRVQgKSApO1xyXG4gICAgICAgIGRyYWdMYXllci5hZGRDaGlsZCggdGhpcyApO1xyXG5cclxuICAgICAgICAvLyBhZGp1c3QgZm9yIHBvcC1vdXQgb2Zmc2V0XHJcbiAgICAgICAgcmlnaHRQb2ludCA9IGNhcmQucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gY2FyZCB3YXMgZ3JhYmJlZCB3aGlsZSBhbmltYXRpbmcgb3Igd2hpbGUgaW4gJ3NlZSBpbnNpZGUnIHdpbmRvd1xyXG4gICAgICAgIHRoaXMudW5yZWdpc3RlckFzU2VlSW5zaWRlQ2FyZCgpO1xyXG4gICAgICB9XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGRyYWdMYXllci5oYXNDaGlsZCggdGhpcyApLCAnc3RhcnREcmFnIG11c3QgbW92ZSBub2RlIHRvIGRyYWdMYXllcicgKTtcclxuXHJcbiAgICAgIC8vIHRoZSBjYXJkIG1vc3QgcmVjZW50bHkgZ3JhYmJlZCBpcyBpbiB0aGUgZnJvbnRcclxuICAgICAgdGhpcy5tb3ZlVG9Gcm9udCgpO1xyXG5cclxuICAgICAgLy8gc2xvcGUgb2YgbGluZSBiZXR3ZWVuIGlucHV0IGNhcm91c2VsIGFuZCBidWlsZGVyJ3MgaW5wdXQgc2xvdCwgbSA9ICh5Mi15MSkvKHgyLXgxKVxyXG4gICAgICBzbG9wZUxlZnQgPSAoIGxlZnRQb2ludC55IC0gYnVpbGRlci5wb3NpdGlvbi55ICkgLyAoIGxlZnRQb2ludC54IC0gSU5QVVRfU0xPVF9YICk7XHJcblxyXG4gICAgICAvLyBzbG9wZSBvZiBsaW5lIGJldHdlZW4gb3V0cHV0IGNhcm91c2VsIGFuZCBidWlsZGVyJ3Mgb3V0cHV0IHNsb3QsIG0gPSAoeTIteTEpLyh4Mi14MSlcclxuICAgICAgc2xvcGVSaWdodCA9ICggcmlnaHRQb2ludC55IC0gYnVpbGRlci5wb3NpdGlvbi55ICkgLyAoIHJpZ2h0UG9pbnQueCAtIE9VVFBVVF9TTE9UX1ggKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBjb25zdHJhaW4gZHJhZ2dpbmdcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLnRyYW5zbGF0ZU1vdmFibGUgKTtcclxuICAgIG9wdGlvbnMudHJhbnNsYXRlTW92YWJsZSA9ICggY2FyZCwgcG9zaXRpb24sIGRlbHRhICkgPT4ge1xyXG5cclxuICAgICAgYmxvY2tlZCA9IGZhbHNlOyAvLyBhc3N1bWUgd2UncmUgbm90IGJsb2NrZWQsIGJlY2F1c2UgZnVuY3Rpb25zIG1heSBiZSBjaGFuZ2luZyBzaW11bHRhbmVvdXNseSB2aWEgbXVsdGktdG91Y2hcclxuICAgICAgZHJhZ0R4ID0gZGVsdGEueDtcclxuXHJcbiAgICAgIGxldCB5ID0gMDtcclxuXHJcbiAgICAgIGlmICggcG9zaXRpb24ueCA+IE9VVFBVVF9TTE9UX1ggKSB7XHJcblxyXG4gICAgICAgIC8vIGNhcmQgaXMgdG8gdGhlIHJpZ2h0IG9mIHRoZSBidWlsZGVyLCBkcmFnIGFsb25nIHRoZSBsaW5lIGJldHdlZW4gb3V0cHV0IGNhcm91c2VsIGFuZCBidWlsZGVyIG91dHB1dFxyXG4gICAgICAgIHkgPSBzbG9wZVJpZ2h0ICogKCBwb3NpdGlvbi54IC0gT1VUUFVUX1NMT1RfWCApICsgYnVpbGRlci5wb3NpdGlvbi55OyAvLyB5ID0gbSh4LXgxKSArIHkxXHJcbiAgICAgICAgY2FyZC5tb3ZlVG8oIG5ldyBWZWN0b3IyKCBwb3NpdGlvbi54LCB5ICkgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHsgLy8gdG8gbGVmdCBvZiBidWlsZGVyJ3Mgb3V0cHV0IHNsb3RcclxuXHJcbiAgICAgICAgLy8gZHJhZ2dpbmcgdG8gdGhlIGxlZnQsIGNoZWNrIHRvIHNlZSBpZiBibG9ja2VkIGJ5IGEgbm9uLWludmVydGlibGUgZnVuY3Rpb25cclxuICAgICAgICBpZiAoIGRyYWdEeCA8IDAgKSB7XHJcbiAgICAgICAgICBmb3IgKCBsZXQgaSA9IGJ1aWxkZXIubnVtYmVyT2ZTbG90cyAtIDE7IGkgPj0gMCAmJiAhYmxvY2tlZDsgaS0tICkge1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgc2xvdCA9IGJ1aWxkZXIuc2xvdHNbIGkgXTtcclxuXHJcbiAgICAgICAgICAgIC8vIGlmIHNsb3QgaXMgdG8gdGhlIGxlZnQgb2Ygd2hlcmUgdGhlIGNhcmQgY3VycmVudGx5IGlzIC4uLlxyXG4gICAgICAgICAgICBpZiAoIGNhcmQucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54ID4gc2xvdC5wb3NpdGlvbi54ICkge1xyXG5cclxuICAgICAgICAgICAgICBjb25zdCB3aW5kb3dQb3NpdGlvbiA9IGJ1aWxkZXIuZ2V0V2luZG93UG9zaXRpb24oIGkgKTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gY2FyZCBoYXMgaGl0IGEgbm9uLWludmVydGlibGUgZnVuY3Rpb25cclxuICAgICAgICAgICAgICBpZiAoICFzbG90LmlzSW52ZXJ0aWJsZSgpICYmIHBvc2l0aW9uLnggPCB3aW5kb3dQb3NpdGlvbi54ICkge1xyXG5cclxuICAgICAgICAgICAgICAgIGJsb2NrZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWlsZGVyTm9kZS5nZXRGdW5jdGlvbk5vZGUoIGkgKS5zdGFydE5vdEludmVydGlibGVBbmltYXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBhbGxvdyBsZWZ0IGVkZ2Ugb2YgY2FyZCB0byBiZSBkcmFnZ2VkIHNsaWdodGx5IHBhc3QgbGVmdCBlZGdlIG9mICdzZWUgaW5zaWRlJyB3aW5kb3dcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJsb2NrZWRYID0gd2luZG93UG9zaXRpb24ueCAtIEJMT0NLRURfWF9PRkZTRVQ7XHJcbiAgICAgICAgICAgICAgICBpZiAoIHBvc2l0aW9uLnggPiBibG9ja2VkWCApIHtcclxuICAgICAgICAgICAgICAgICAgY2FyZC5tb3ZlVG8oIG5ldyBWZWN0b3IyKCBwb3NpdGlvbi54LCBidWlsZGVyLnBvc2l0aW9uLnkgKSApO1xyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBjYXJkLm1vdmVUbyggbmV3IFZlY3RvcjIoIGJsb2NrZWRYLCBidWlsZGVyLnBvc2l0aW9uLnkgKSApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCAhYmxvY2tlZCApIHtcclxuICAgICAgICAgIGlmICggcG9zaXRpb24ueCA8IElOUFVUX1NMT1RfWCApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGNhcmQgaXMgdG8gdGhlIGxlZnQgb2YgdGhlIGJ1aWxkZXIsIGRyYWcgYWxvbmcgdGhlIGxpbmUgYmV0d2VlbiBpbnB1dCBjYXJvdXNlbCBhbmQgYnVpbGRlciBpbnB1dCBzbG90XHJcbiAgICAgICAgICAgIHkgPSBzbG9wZUxlZnQgKiAoIHBvc2l0aW9uLnggLSBJTlBVVF9TTE9UX1ggKSArIGJ1aWxkZXIucG9zaXRpb24ueTsgLy8geSA9IG0oeC14MSkgKyB5MVxyXG4gICAgICAgICAgICBjYXJkLm1vdmVUbyggbmV3IFZlY3RvcjIoIHBvc2l0aW9uLngsIHkgKSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBjYXJkIGlzIGluIHRoZSBidWlsZGVyLCBkcmFnZ2luZyBob3Jpem9udGFsbHlcclxuICAgICAgICAgICAgY2FyZC5tb3ZlVG8oIG5ldyBWZWN0b3IyKCBwb3NpdGlvbi54LCBidWlsZGVyLnBvc2l0aW9uLnkgKSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIGVuZCBhIGRyYWcgY3ljbGVcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmVuZERyYWcgKTtcclxuICAgIG9wdGlvbnMuZW5kRHJhZyA9ICgpID0+IHtcclxuXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGRyYWdMYXllci5oYXNDaGlsZCggdGhpcyApLCAnZW5kRHJhZzogY2FyZCBzaG91bGQgYmUgaW4gZHJhZ0xheWVyJyApO1xyXG5cclxuICAgICAgY29uc3QgY2FyZFggPSBjYXJkLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueDtcclxuXHJcbiAgICAgIGlmICggY2FyZFggPCBJTlBVVF9TTE9UX1ggKSB7XHJcblxyXG4gICAgICAgIC8vIGNhcmQgaXMgdG8gbGVmdCBvZiBidWlsZGVyLCBhbmltYXRlIHRvIGlucHV0IGNhcm91c2VsXHJcbiAgICAgICAgdGhpcy5hbmltYXRlVG9DYXJvdXNlbCggaW5wdXRDb250YWluZXIgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggY2FyZFggPiBPVVRQVVRfU0xPVF9YICkge1xyXG5cclxuICAgICAgICAvLyBjYXJkIGlzIHRvIHJpZ2h0IG9mIGJ1aWxkZXIsIGFuaW1hdGUgdG8gb3V0cHV0IGNhcm91c2VsXHJcbiAgICAgICAgdGhpcy5hbmltYXRlVG9DYXJvdXNlbCggb3V0cHV0Q29udGFpbmVyICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7IC8vIGNhcmQgaXMgaW4gdGhlIGJ1aWxkZXJcclxuXHJcbiAgICAgICAgaWYgKCBkcmFnRHggPj0gMCB8fCBibG9ja2VkICkgeyAvLyBkcmFnZ2luZyB0byB0aGUgcmlnaHQgb3IgYmxvY2tlZCBieSBhIG5vbi1pbnZlcnRpYmxlIGZ1bmN0aW9uXHJcblxyXG4gICAgICAgICAgLy8gc25hcCB0byBpbnB1dCBzbG90XHJcbiAgICAgICAgICBpZiAoIGNhcmRYIDwgYnVpbGRlci5sZWZ0ICkge1xyXG4gICAgICAgICAgICBjYXJkLm1vdmVUbyggbmV3IFZlY3RvcjIoIGJ1aWxkZXIubGVmdCwgYnVpbGRlci5wb3NpdGlvbi55ICkgKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB0aGlzLmFuaW1hdGVMZWZ0VG9SaWdodCggT1VUUFVUX1NMT1RfWCApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHsgLy8gZHJhZ2dpbmcgdG8gdGhlIGxlZnRcclxuXHJcbiAgICAgICAgICAvLyBzbmFwIHRvIG91dHB1dCBzbG90XHJcbiAgICAgICAgICBpZiAoIGNhcmRYID4gYnVpbGRlci5yaWdodCApIHtcclxuICAgICAgICAgICAgY2FyZC5tb3ZlVG8oIG5ldyBWZWN0b3IyKCBidWlsZGVyLnJpZ2h0LCBidWlsZGVyLnBvc2l0aW9uLnkgKSApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHRoaXMuYW5pbWF0ZVJpZ2h0VG9MZWZ0KCBJTlBVVF9TTE9UX1gsIE9VVFBVVF9TTE9UX1gsIEJMT0NLRURfWF9PRkZTRVQgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8ge1Byb3BlcnR5LjxudW1iZXI+fSBOdW1iZXIgb2YgZnVuY3Rpb25zIHRvIGFwcGx5IGlzIGJhc2VkIG9uIHdoZXJlIHRoZSBjYXJkIGlzIGxvY2F0ZWQgcmVsYXRpdmUgdG8gdGhlXHJcbiAgICAvLyBmdW5jdGlvbiBzbG90cyBpbiB0aGUgYnVpbGRlclxyXG4gICAgY29uc3QgbnVtYmVyT2ZGdW5jdGlvbnNUb0FwcGx5UHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIGNhcmQucG9zaXRpb25Qcm9wZXJ0eSBdLFxyXG4gICAgICBwb3NpdGlvbiA9PiB7XHJcbiAgICAgICAgZm9yICggbGV0IGkgPSBidWlsZGVyLm51bWJlck9mU2xvdHMgLSAxOyBpID49IDA7IGktLSApIHtcclxuICAgICAgICAgIGlmICggcG9zaXRpb24ueCA+PSBidWlsZGVyLnNsb3RzWyBpIF0ucG9zaXRpb24ueCApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGkgKyAxO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gMDtcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICBzdXBlciggY2FyZCwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBEZWZpbmUgcHJvcGVydGllcyBpbiBvbmUgcGxhY2UsIHNvIHdlIGNhbiBzZWUgd2hhdCdzIGF2YWlsYWJsZSBhbmQgZG9jdW1lbnQgdmlzaWJpbGl0eVxyXG5cclxuICAgIC8vIEBwdWJsaWNcclxuICAgIHRoaXMuY2FyZCA9IGNhcmQ7XHJcblxyXG4gICAgLy8gQHByb3RlY3RlZFxyXG4gICAgdGhpcy5iYWNrZ3JvdW5kTm9kZSA9IGJhY2tncm91bmROb2RlO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLmlucHV0Q29udGFpbmVyID0gaW5wdXRDb250YWluZXI7XHJcbiAgICB0aGlzLm91dHB1dENvbnRhaW5lciA9IG91dHB1dENvbnRhaW5lcjtcclxuICAgIHRoaXMuYnVpbGRlck5vZGUgPSBidWlsZGVyTm9kZTtcclxuICAgIHRoaXMuZHJhZ0xheWVyID0gZHJhZ0xheWVyO1xyXG4gICAgdGhpcy5zZWVJbnNpZGVQcm9wZXJ0eSA9IHNlZUluc2lkZVByb3BlcnR5O1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gdW5saW5rIHVubmVjZXNzYXJ5LCBpbnN0YW5jZXMgZXhpc3QgZm9yIGxpZmV0aW1lIG9mIHRoZSBzaW1cclxuICAgIG51bWJlck9mRnVuY3Rpb25zVG9BcHBseVByb3BlcnR5LmxpbmsoIG51bWJlck9mRnVuY3Rpb25zVG9BcHBseSA9PiB7XHJcbiAgICAgIHVwZGF0ZUNvbnRlbnQoIHRoaXMsIGJ1aWxkZXIsIG51bWJlck9mRnVuY3Rpb25zVG9BcHBseSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFVwZGF0ZXMgYW55IGNhcmRzIHRoYXQgYXJlIG5vdCBpbiB0aGUgaW5wdXQgY2Fyb3VzZWwgd2hlbiBhbnkgZnVuY3Rpb24gaW4gdGhlIGJ1aWxkZXIgY2hhbmdlcy5cclxuICAgIC8vIHJlbW92ZUxpc3RlbmVyIHVubmVjZXNzYXJ5LCBpbnN0YW5jZXMgZXhpc3QgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltLlxyXG4gICAgYnVpbGRlck5vZGUuYnVpbGRlci5mdW5jdGlvbkNoYW5nZWRFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIGlmICggIWlucHV0Q29udGFpbmVyLmNvbnRhaW5zTm9kZSggdGhpcyApICkge1xyXG4gICAgICAgIHVwZGF0ZUNvbnRlbnQoIHRoaXMsIGJ1aWxkZXIsIG51bWJlck9mRnVuY3Rpb25zVG9BcHBseVByb3BlcnR5LmdldCgpICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBXaGVuICdTZWUgSW5zaWRlJyBpcyB0dXJuZWQgb2ZmLCBmbHVzaCBvdXQgYW55IGNhcmRzIHRoYXQgYXJlIHN0b3BwZWQgaW4gd2luZG93cy5cclxuICAgIC8vIHVubGluayB1bm5lY2Vzc2FyeSwgaW5zdGFuY2VzIGV4aXN0IGZvciBsaWZldGltZSBvZiB0aGUgc2ltXHJcbiAgICBzZWVJbnNpZGVQcm9wZXJ0eS5sYXp5TGluayggc2VlSW5zaWRlID0+IHtcclxuICAgICAgaWYgKCAhc2VlSW5zaWRlICYmICFjYXJkLmlzQW5pbWF0aW5nKCkgJiYgZHJhZ0xheWVyLmhhc0NoaWxkKCB0aGlzICkgKSB7XHJcbiAgICAgICAgdGhpcy51bnJlZ2lzdGVyQXNTZWVJbnNpZGVDYXJkKCk7XHJcbiAgICAgICAgdGhpcy5hbmltYXRlTGVmdFRvUmlnaHQoIE9VVFBVVF9TTE9UX1ggKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQW5pbWF0ZXMgdGhpcyBjYXJkIHRvIGEgY29udGFpbmVyIGluIGEgY2Fyb3VzZWwuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0NhcmRDb250YWluZXJ9IGNvbnRhaW5lclxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgYW5pbWF0ZVRvQ2Fyb3VzZWwoIGNvbnRhaW5lciApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZHJhZ0xheWVyLmhhc0NoaWxkKCB0aGlzICksICdhbmltYXRlVG9DYXJvdXNlbDogY2FyZCBzaG91bGQgYmUgaW4gZHJhZ0xheWVyJyApO1xyXG4gICAgdGhpcy5jYXJkLmFuaW1hdGVUbyggY29udGFpbmVyLmNhcm91c2VsUG9zaXRpb24sICgpID0+IHtcclxuICAgICAgdGhpcy5kcmFnTGF5ZXIucmVtb3ZlQ2hpbGQoIHRoaXMgKTtcclxuICAgICAgY29udGFpbmVyLmFkZE5vZGUoIHRoaXMgKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vdmVzIHRoaXMgY2FyZCBpbW1lZGlhdGVseSB0byB0aGUgaW5wdXQgY2Fyb3VzZWwsIG5vIGFuaW1hdGlvbi5cclxuICAgKiBJZiB0aGUgY2FyZCBpcyBhbHJlYWR5IGluIHRoZSBpbnB1dCBjYXJvdXNlbCwgdGhpcyBpcyBhIG5vLW9wLlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIG1vdmVUb0lucHV0Q2Fyb3VzZWwoKSB7XHJcblxyXG4gICAgaWYgKCB0aGlzLmRyYWdMYXllci5oYXNDaGlsZCggdGhpcyApICkge1xyXG5cclxuICAgICAgLy8gcmVtb3ZlIGZyb20gZHJhZyBsYXllclxyXG4gICAgICB0aGlzLmludGVycnVwdFN1YnRyZWVJbnB1dCgpOyAvLyBjYW5jZWwgZHJhZ1xyXG4gICAgICB0aGlzLmRyYWdMYXllci5yZW1vdmVDaGlsZCggdGhpcyApO1xyXG4gICAgICB0aGlzLnVucmVnaXN0ZXJBc1NlZUluc2lkZUNhcmQoKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLm91dHB1dENvbnRhaW5lci5jb250YWluc05vZGUoIHRoaXMgKSApIHtcclxuXHJcbiAgICAgIC8vIHJlbW92ZSBmcm9tIG91dHB1dCBjYXJvdXNlbFxyXG4gICAgICB0aGlzLm91dHB1dENvbnRhaW5lci5yZW1vdmVOb2RlKCB0aGlzICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbW92ZSB0byBpbnB1dCBjYXJvdXNlbFxyXG4gICAgaWYgKCAhdGhpcy5pbnB1dENvbnRhaW5lci5jb250YWluc05vZGUoIHRoaXMgKSApIHtcclxuICAgICAgdGhpcy5pbnB1dENvbnRhaW5lci5hZGROb2RlKCB0aGlzICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBbmltYXRlcyBsZWZ0LXRvLXJpZ2h0IHRocm91Z2ggdGhlIGJ1aWxkZXIsIHN0b3BwaW5nIGF0IHRoZSBmaXJzdCAnU2VlIEluc2lkZScgd2luZG93IHRoYXQncyB2aXNpYmxlLlxyXG4gICAqIElmIG5vICdTZWUgSW5zaWRlJyB3aW5kb3cgaXMgdmlzaWJsZSwgdGhlIGNhcmQgY29udGludWVzIHRvIHRoZSBvdXRwdXQgY2Fyb3VzZWwuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gb3V0cHV0U2xvdFggLSB4IGNvb3JkaW5hdGUgd2hlcmUgY2FyZCBpcyBjb25zaWRlcmVkIHRvIGJlIGluIHRoZSBvdXRwdXQgc2xvdFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgYW5pbWF0ZUxlZnRUb1JpZ2h0KCBvdXRwdXRTbG90WCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZHJhZ0xheWVyLmhhc0NoaWxkKCB0aGlzICksICdhbmltYXRlTGVmdFRvUmlnaHQ6IGNhcmQgc2hvdWxkIGJlIGluIGRyYWdMYXllcicgKTtcclxuXHJcbiAgICBjb25zdCBidWlsZGVyID0gdGhpcy5idWlsZGVyTm9kZS5idWlsZGVyO1xyXG4gICAgY29uc3Qgd2luZG93TnVtYmVyID0gYnVpbGRlci5nZXRXaW5kb3dOdW1iZXJHcmVhdGVyVGhhbiggdGhpcy5jYXJkLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueCApO1xyXG5cclxuICAgIGlmICggYnVpbGRlci5pc1ZhbGlkV2luZG93TnVtYmVyKCB3aW5kb3dOdW1iZXIgKSApIHtcclxuXHJcbiAgICAgIC8vIGFuaW1hdGUgdG8gJ1NlZSBJbnNpZGUnIHdpbmRvdyB0byByaWdodCBvZiBjYXJkXHJcbiAgICAgIGNvbnN0IHdpbmRvd1Bvc2l0aW9uID0gYnVpbGRlci5nZXRXaW5kb3dQb3NpdGlvbiggd2luZG93TnVtYmVyICk7XHJcbiAgICAgIHRoaXMuY2FyZC5hbmltYXRlVG8oIHdpbmRvd1Bvc2l0aW9uLCAoKSA9PiB7XHJcblxyXG4gICAgICAgIGlmICggdGhpcy5zZWVJbnNpZGVQcm9wZXJ0eS5nZXQoKSApIHtcclxuXHJcbiAgICAgICAgICAvLyBzdG9wIGF0IHRoaXMgd2luZG93LCByZWdpc3RlciBhcyB0aGUgJ3NlZSBpbnNpZGUnIGNhcmRcclxuICAgICAgICAgIHRoaXMucmVnaXN0ZXJBc1NlZUluc2lkZUNhcmQoIG91dHB1dFNsb3RYICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIGNvbnRpbnVlIHRvIG5leHQgd2luZG93XHJcbiAgICAgICAgICB0aGlzLmFuaW1hdGVMZWZ0VG9SaWdodCggb3V0cHV0U2xvdFggKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gYW5pbWF0ZSB0byBvdXRwdXQgc2xvdCwgdGhlbiB0byBvdXRwdXQgY2Fyb3VzZWxcclxuICAgICAgdGhpcy5jYXJkLmFuaW1hdGVUbyggbmV3IFZlY3RvcjIoIG91dHB1dFNsb3RYLCBidWlsZGVyLnBvc2l0aW9uLnkgKSxcclxuICAgICAgICAoKSA9PiB0aGlzLmFuaW1hdGVUb0Nhcm91c2VsKCB0aGlzLm91dHB1dENvbnRhaW5lciApICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBbmltYXRlcyByaWdodC10by1sZWZ0IHRocm91Z2ggdGhlIGJ1aWxkZXIsIHN0b3BwaW5nIGF0IHRoZSBmaXJzdCAnU2VlIEluc2lkZScgd2luZG93IHRoYXQncyB2aXNpYmxlLlxyXG4gICAqIElmIG5vICdTZWUgSW5zaWRlJyB3aW5kb3cgaXMgdmlzaWJsZSwgdGhlIGNhcmQgY29udGludWVzIHRvIHRoZSBpbnB1dCBjYXJvdXNlbC4gIElmIGFuIG5vbi1pbnZlcnRpYmxlXHJcbiAgICogZnVuY3Rpb24gaXMgZW5jb3VudGVyZWQgYXQgYW55IHRpbWUsIHRoZW4gdGhlIGNhcmQgcmV2ZXJzZXMgZGlyZWN0aW9uIChzZWUgYW5pbWF0ZUxlZnRUb1JpZ2h0KS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbnB1dFNsb3RYIC0geCBjb29yZGluYXRlIHdoZXJlIGNhcmQgaXMgY29uc2lkZXJlZCB0byBiZSBpbiB0aGUgaW5wdXQgc2xvdFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBvdXRwdXRTbG90WCAtIHggY29vcmRpbmF0ZSB3aGVyZSBjYXJkIGlzIGNvbnNpZGVyZWQgdG8gYmUgaW4gdGhlIG91dHB1dCBzbG90XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGJsb2NrZWRYT2Zmc2V0IC0gaG93IGZhciB0byBtb3ZlIGNhcmQgdG8gbGVmdCBvZiB3aW5kb3cgZm9yIGEgbm9uLWludmVydGlibGUgZnVuY3Rpb25cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGFuaW1hdGVSaWdodFRvTGVmdCggaW5wdXRTbG90WCwgb3V0cHV0U2xvdFgsIGJsb2NrZWRYT2Zmc2V0ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5kcmFnTGF5ZXIuaGFzQ2hpbGQoIHRoaXMgKSwgJ2FuaW1hdGVSaWdodFRvTGVmdDogY2FyZCBzaG91bGQgYmUgaW4gZHJhZ0xheWVyJyApO1xyXG5cclxuICAgIGNvbnN0IGJ1aWxkZXIgPSB0aGlzLmJ1aWxkZXJOb2RlLmJ1aWxkZXI7XHJcbiAgICBjb25zdCB3aW5kb3dOdW1iZXIgPSBidWlsZGVyLmdldFdpbmRvd051bWJlckxlc3NUaGFuT3JFcXVhbFRvKCB0aGlzLmNhcmQucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54ICk7XHJcblxyXG4gICAgaWYgKCBidWlsZGVyLmlzVmFsaWRXaW5kb3dOdW1iZXIoIHdpbmRvd051bWJlciApICkge1xyXG5cclxuICAgICAgLy8gYW5pbWF0ZSB0byAnU2VlIEluc2lkZScgd2luZG93IHRvIGxlZnQgb2YgY2FyZFxyXG4gICAgICBjb25zdCB3aW5kb3dQb3NpdGlvbiA9IGJ1aWxkZXIuZ2V0V2luZG93UG9zaXRpb24oIHdpbmRvd051bWJlciApO1xyXG4gICAgICB0aGlzLmNhcmQuYW5pbWF0ZVRvKCB3aW5kb3dQb3NpdGlvbiwgKCkgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBzbG90ID0gYnVpbGRlci5zbG90c1sgd2luZG93TnVtYmVyIF07XHJcblxyXG4gICAgICAgIGlmICggIXNsb3QuaXNFbXB0eSgpICYmICFzbG90LmZ1bmN0aW9uSW5zdGFuY2UuaW52ZXJ0aWJsZSApIHtcclxuXHJcbiAgICAgICAgICAvLyBlbmNvdW50ZXJlZCBhIG5vbi1pbnZlcnRpYmxlIGZ1bmN0aW9uLCBnbyBzbGlnaHRseSBwYXN0IGl0LCB0aGVuIHJldmVyc2UgZGlyZWN0aW9uXHJcbiAgICAgICAgICB0aGlzLmJ1aWxkZXJOb2RlLmdldEZ1bmN0aW9uTm9kZSggd2luZG93TnVtYmVyICkuc3RhcnROb3RJbnZlcnRpYmxlQW5pbWF0aW9uKCk7XHJcbiAgICAgICAgICB0aGlzLmNhcmQuYW5pbWF0ZVRvKCBuZXcgVmVjdG9yMiggd2luZG93UG9zaXRpb24ueCAtIGJsb2NrZWRYT2Zmc2V0LCB3aW5kb3dQb3NpdGlvbi55ICksXHJcbiAgICAgICAgICAgICgpID0+IHRoaXMuYW5pbWF0ZUxlZnRUb1JpZ2h0KCBvdXRwdXRTbG90WCApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCB0aGlzLnNlZUluc2lkZVByb3BlcnR5LmdldCgpICkge1xyXG5cclxuICAgICAgICAgIC8vIHN0b3AgYXQgdGhpcyB3aW5kb3csIHJlZ2lzdGVyIGFzIHRoZSAnc2VlIGluc2lkZScgY2FyZFxyXG4gICAgICAgICAgdGhpcy5yZWdpc3RlckFzU2VlSW5zaWRlQ2FyZCggb3V0cHV0U2xvdFggKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gSWYgYSBjYXJkIGlzIGV4YWN0bHkgY2VudGVyZWQgaW4gYSB3aW5kb3csIGl0IHdpbGwgc3RvcCB0aGVyZSwgcmVnYXJkbGVzcyBvZiAnc2VlIGluc2lkZScgc3RhdGUuXHJcbiAgICAgICAgICAvLyBTbyBiZWZvcmUgY29udGludWluZyB0byB0aGUgbmV4dCB3aW5kb3csIG1vdmUgdGhlIGNhcmQgMSB1bml0IHRvIHRoZSBsZWZ0LlxyXG4gICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mdW5jdGlvbi1idWlsZGVyL2lzc3Vlcy8xMDdcclxuICAgICAgICAgIGlmICggdGhpcy5jYXJkLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueCA9PT0gd2luZG93UG9zaXRpb24ueCApIHtcclxuICAgICAgICAgICAgdGhpcy5jYXJkLm1vdmVUbyggbmV3IFZlY3RvcjIoIHRoaXMuY2FyZC5wb3NpdGlvblByb3BlcnR5LmdldCgpLnggLSAxLCBidWlsZGVyLnBvc2l0aW9uLnkgKSApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIGNvbnRpbnVlIHRvIG5leHQgd2luZG93XHJcbiAgICAgICAgICB0aGlzLmFuaW1hdGVSaWdodFRvTGVmdCggaW5wdXRTbG90WCwgb3V0cHV0U2xvdFgsIGJsb2NrZWRYT2Zmc2V0ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIGFuaW1hdGUgdG8gaW5wdXQgc2xvdCwgdGhlbiB0byBpbnB1dCBjYXJvdXNlbFxyXG4gICAgICB0aGlzLmNhcmQuYW5pbWF0ZVRvKCBuZXcgVmVjdG9yMiggaW5wdXRTbG90WCwgYnVpbGRlci5wb3NpdGlvbi55ICksXHJcbiAgICAgICAgKCkgPT4gdGhpcy5hbmltYXRlVG9DYXJvdXNlbCggdGhpcy5pbnB1dENvbnRhaW5lciApICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGbHVzaGVzIHRoaXMgY2FyZCBmcm9tIGEgJ3NlZSBpbnNpZGUnIHdpbmRvdy4gIFNlbmRzIGl0IGRpcmVjdGx5IHRvIGl0cyBjb250YWluZXIgaW4gdGhlIG91dHB1dCBjYXJvdXNlbCxcclxuICAgKiB3aXRob3V0IHN0b3BwaW5nIGF0IGFueSAnc2VlIGluc2lkZScgd2luZG93cy4gU2VlIGlzc3VlICM0NC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBvdXRwdXRTbG90WCAtIHggY29vcmRpbmF0ZSB3aGVyZSBjYXJkIGlzIGNvbnNpZGVyZWQgdG8gYmUgaW4gdGhlIG91dHB1dCBzbG90XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGZsdXNoU2VlSW5zaWRlQ2FyZCggb3V0cHV0U2xvdFggKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmRyYWdMYXllci5oYXNDaGlsZCggdGhpcyApLCAnZmx1c2hTZWVJbnNpZGVDYXJkOiBjYXJkIHNob3VsZCBiZSBpbiBkcmFnTGF5ZXInICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5jYXJkLmRyYWdnaW5nLCAnZmx1c2hTZWVJbnNpZGVDYXJkOiBjYXJkIHNob3VsZCBiZSBwYXJrZWQgaW4gU2VlIEluc2lkZSB3aW5kb3cnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmJ1aWxkZXJOb2RlLnNlZUluc2lkZUNhcmROb2RlID09PSB0aGlzLCAnZmx1c2hTZWVJbnNpZGVDYXJkOiBub3QgYSBTZWUgSW5zaWRlIGNhcmQnICk7XHJcblxyXG4gICAgLy8gYW5pbWF0ZSB0byBvdXRwdXQgc2xvdCwgdGhlbiB0byBvdXRwdXQgY2Fyb3VzZWxcclxuICAgIHRoaXMuY2FyZC5hbmltYXRlVG8oIG5ldyBWZWN0b3IyKCBvdXRwdXRTbG90WCwgdGhpcy5idWlsZGVyTm9kZS5idWlsZGVyLnBvc2l0aW9uLnkgKSxcclxuICAgICAgKCkgPT4gdGhpcy5hbmltYXRlVG9DYXJvdXNlbCggdGhpcy5vdXRwdXRDb250YWluZXIgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVnaXN0ZXJzIHRoaXMgY2FyZCBhcyB0aGUgc29sZSBjYXJkIHRoYXQgbWF5IG9jY3VweSAnc2VlIGluc2lkZScgd2luZG93cy5cclxuICAgKiBBbnkgY2FyZCB0aGF0IGN1cnJlbnRseSBvY2N1cGllcyBhIHdpbmRvdyBpcyBmbHVzaGVkIHRvIHRoZSBvdXRwdXQgY2Fyb3VzZWwuXHJcbiAgICogU2VlIGlzc3VlICM0NC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBvdXRwdXRTbG90WCAtIHggY29vcmRpbmF0ZSB3aGVyZSBjYXJkIGlzIGNvbnNpZGVyZWQgdG8gYmUgaW4gdGhlIG91dHB1dCBzbG90XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICByZWdpc3RlckFzU2VlSW5zaWRlQ2FyZCggb3V0cHV0U2xvdFggKSB7XHJcblxyXG4gICAgLy8gZmx1c2ggYW55IGV4aXN0aW5nICdzZWUgaW5zaWRlJyBjYXJkXHJcbiAgICBpZiAoIHRoaXMuYnVpbGRlck5vZGUuc2VlSW5zaWRlQ2FyZE5vZGUgKSB7XHJcbiAgICAgIHRoaXMuYnVpbGRlck5vZGUuc2VlSW5zaWRlQ2FyZE5vZGUuZmx1c2hTZWVJbnNpZGVDYXJkKCBvdXRwdXRTbG90WCApO1xyXG4gICAgICB0aGlzLmJ1aWxkZXJOb2RlLnNlZUluc2lkZUNhcmROb2RlID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvLyByZWdpc3RlciBhcyB0aGUgJ3NlZSBpbnNpZGUnIGNhcmRcclxuICAgIHRoaXMuYnVpbGRlck5vZGUuc2VlSW5zaWRlQ2FyZE5vZGUgPSB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVW5yZWdpc3RlcnMgdGhpcyBjYXJkIGFzIHRoZSBzb2xlIGNhcmQgdGhhdCBtYXkgb2NjdXB5ICdzZWUgaW5zaWRlJyB3aW5kb3dzLiBTZWUgaXNzdWUgIzQ0LlxyXG4gICAqIElmIHRoaXMgY2FyZCBpcyBub3QgY3VycmVudGx5IHJlZ2lzdGVyZWQsIHRoaXMgaXMgYSBuby1vcC5cclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdW5yZWdpc3RlckFzU2VlSW5zaWRlQ2FyZCgpIHtcclxuICAgIGlmICggdGhpcyA9PT0gdGhpcy5idWlsZGVyTm9kZS5zZWVJbnNpZGVDYXJkTm9kZSApIHtcclxuICAgICAgdGhpcy5idWlsZGVyTm9kZS5zZWVJbnNpZGVDYXJkTm9kZSA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgJ2dob3N0JyBjYXJkIHRoYXQgYXBwZWFycyBpbiBhbiBlbXB0eSBjYXJvdXNlbC5cclxuICAgKiBUaGUgY2FyZCBoYXMgYSBkYXNoZWQgb3V0bGluZSBhbmQgaXRzIGNvbnRlbnQgaXMgdHJhbnNwYXJlbnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge05vZGV9IGNvbnRlbnROb2RlIC0gd2hhdCBhcHBlYXJzIG9uIHRoZSBjYXJkXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqIEByZXR1cm5zIHtOb2RlfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAc3RhdGljXHJcbiAgICovXHJcbiAgc3RhdGljIGNyZWF0ZUdob3N0Tm9kZSggY29udGVudE5vZGUsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7fSwgRkJDb25zdGFudHMuQ0FSRF9PUFRJT05TLCBvcHRpb25zICk7XHJcbiAgICBvcHRpb25zLmxpbmVEYXNoID0gWyA0LCA0IF07XHJcbiAgICBvcHRpb25zLm9wYWNpdHkgPSAwLjU7XHJcblxyXG4gICAgY29uc3QgYmFja2dyb3VuZE5vZGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBvcHRpb25zLnNpemUud2lkdGgsIG9wdGlvbnMuc2l6ZS5oZWlnaHQsXHJcbiAgICAgIF8ucGljayggb3B0aW9ucywgJ2Nvcm5lclJhZGl1cycsICdmaWxsJywgJ3N0cm9rZScsICdsaW5lV2lkdGgnLCAnbGluZURhc2gnICkgKTtcclxuXHJcbiAgICAvLyBjZW50ZXIgY29udGVudCBvbiBiYWNrZ3JvdW5kXHJcbiAgICBjb250ZW50Tm9kZS5jZW50ZXIgPSBiYWNrZ3JvdW5kTm9kZS5jZW50ZXI7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuY2hpbGRyZW4sICdkZWNvcmF0aW9uIG5vdCBzdXBwb3J0ZWQnICk7XHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyBiYWNrZ3JvdW5kTm9kZSwgY29udGVudE5vZGUgXTtcclxuXHJcbiAgICByZXR1cm4gbmV3IE5vZGUoIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBjYXJkLWxpa2UgaWNvbiBmb3IgeCBvciB5IHN5bWJvbCwgZm9yIHVzZSBpbiBlcXVhdGlvbnMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge05vZGV9IHh5Tm9kZSAtIHRoZSBzeW1ib2wgb24gdGhlIGNhcmRcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICogQHJldHVybnMge05vZGV9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBzdGF0aWNcclxuICAgKi9cclxuICBzdGF0aWMgY3JlYXRlRXF1YXRpb25YWU5vZGUoIHh5Tm9kZSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgeE1hcmdpbjogMzAsXHJcbiAgICAgIHlNYXJnaW46IDE1LFxyXG4gICAgICBtaW5IZWlnaHQ6IDM1XHJcbiAgICB9LCBGQkNvbnN0YW50cy5DQVJEX09QVElPTlMsIG9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBiYWNrZ3JvdW5kSGVpZ2h0ID0gTWF0aC5tYXgoIG9wdGlvbnMubWluSGVpZ2h0LCB4eU5vZGUuaGVpZ2h0ICsgb3B0aW9ucy55TWFyZ2luICk7XHJcbiAgICBjb25zdCBiYWNrZ3JvdW5kV2lkdGggPSBNYXRoLm1heCggeHlOb2RlLndpZHRoICsgb3B0aW9ucy54TWFyZ2luLCBiYWNrZ3JvdW5kSGVpZ2h0ICk7XHJcblxyXG4gICAgY29uc3QgYmFja2dyb3VuZE5vZGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBiYWNrZ3JvdW5kV2lkdGgsIGJhY2tncm91bmRIZWlnaHQsXHJcbiAgICAgIF8ucGljayggb3B0aW9ucywgJ2Nvcm5lclJhZGl1cycsICdmaWxsJywgJ3N0cm9rZScsICdsaW5lV2lkdGgnLCAnbGluZURhc2gnICkgKTtcclxuXHJcbiAgICAvLyBjZW50ZXIgY29udGVudCBvbiBiYWNrZ3JvdW5kXHJcbiAgICB4eU5vZGUuY2VudGVyID0gYmFja2dyb3VuZE5vZGUuY2VudGVyO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmNoaWxkcmVuLCAnZGVjb3JhdGlvbiBub3Qgc3VwcG9ydGVkJyApO1xyXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgYmFja2dyb3VuZE5vZGUsIHh5Tm9kZSBdO1xyXG5cclxuICAgIHJldHVybiBuZXcgTm9kZSggb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb25CdWlsZGVyLnJlZ2lzdGVyKCAnQ2FyZE5vZGUnLCBDYXJkTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLDJDQUEyQztBQUN2RSxPQUFPQyxPQUFPLE1BQU0sa0NBQWtDO0FBQ3RELE9BQU9DLEtBQUssTUFBTSxzQ0FBc0M7QUFDeEQsU0FBU0MsSUFBSSxFQUFFQyxTQUFTLFFBQVEsc0NBQXNDO0FBQ3RFLE9BQU9DLGVBQWUsTUFBTSw2QkFBNkI7QUFDekQsT0FBT0MsV0FBVyxNQUFNLHNCQUFzQjtBQUM5QyxPQUFPQyxXQUFXLE1BQU0sbUJBQW1CO0FBRTNDLGVBQWUsTUFBTUMsUUFBUSxTQUFTRCxXQUFXLENBQUM7RUFFaEQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VFLFdBQVdBLENBQUVDLElBQUksRUFBRUMsY0FBYyxFQUFFQyxlQUFlLEVBQUVDLFdBQVcsRUFBRUMsU0FBUyxFQUFFQyxpQkFBaUIsRUFBRUMsYUFBYSxFQUFFQyxPQUFPLEVBQUc7SUFFdEhBLE9BQU8sR0FBR2YsS0FBSyxDQUFFLENBQUMsQ0FBQyxFQUFFSSxXQUFXLENBQUNZLFlBQVksRUFBRUQsT0FBUSxDQUFDOztJQUV4RDtJQUNBLE1BQU1FLGNBQWMs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