// Copyright 2016-2023, University of Colorado Boulder

/**
 * a Scenery node that represents a coin term whose underlying value can vary in the view
 *
 * @author John Blanco
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import MathSymbolFont from '../../../../scenery-phet/js/MathSymbolFont.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Rectangle, RichText, Text } from '../../../../scenery/js/imports.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import expressionExchange from '../../expressionExchange.js';
import EEQueryParameters from '../EEQueryParameters.js';
import ViewMode from '../enum/ViewMode.js';
import AbstractCoinTermNode from './AbstractCoinTermNode.js';
import CoinNodeFactory from './CoinNodeFactory.js';

// constants
const COEFFICIENT_FONT = new PhetFont({
  size: 34
});
const COEFFICIENT_X_SPACING = 3; // in screen coords
const SUPERSCRIPT_SCALE = 0.65;
const VALUE_FONT = new PhetFont({
  size: 30
});
const VARIABLE_FONT = new MathSymbolFont(36);
const COIN_FLIP_TIME = 0.5; // in seconds
const MIN_SCALE_FOR_FLIP = 0.05;

// The following constants control how the pointer areas (mouse and touch) are set up for the textual representation
// of the coin term.  These are empirically determined such that they are easy for users to grab but the don't
// protrude from expressions.
const POINTER_AREA_X_DILATION_AMOUNT = 15; // in screen coords
const POINTER_AREA_Y_DILATION_AMOUNT = 8; // in screen coords, less than X amt to avoid protruding out of expression
const POINTER_AREA_DOWN_SHIFT = 3; // in screen coords

class VariableCoinTermNode extends AbstractCoinTermNode {
  /**
   * @param {CoinTerm} coinTerm - model of a coin
   * @param {Property.<ViewMode>} viewModeProperty - controls whether to show the coin or the term
   * @param {Property.<boolean>} showCoinValuesProperty - controls whether or not coin value is shown
   * @param {Property.<boolean>} showVariableValuesProperty - controls whether or not variable values are shown
   * @param {Property.<boolean>} showAllCoefficientsProperty - controls whether 1 is shown for non-combined coins
   * @param {Object} [options]
   */
  constructor(coinTerm, viewModeProperty, showCoinValuesProperty, showVariableValuesProperty, showAllCoefficientsProperty, options) {
    options = merge({
      // this value can be set to false in order to conserve nodes, and therefore memory, if this node will never need
      // to show the value of the coin term
      supportShowValues: true
    }, options);
    super(coinTerm, options);

    // @private {CoinTerm} - make the coin term available to methods
    this.coinTerm = coinTerm;

    // @private {Property.<ViewMode>} - make the view mode available to methods
    this.viewModeProperty = viewModeProperty;

    // @private {Rectangle} - an invisible node used to make sure text is rendered without bounds issues, see
    // https://github.com/phetsims/expression-exchange/issues/26
    this.boundsRect = new Rectangle(0, 0, 1, 1, {
      fill: 'transparent'
    });
    this.coinAndTextRootNode.addChild(this.boundsRect);

    // @private {Image} - add the images for the front and back of the coin
    const coinImageNodes = [];
    this.coinFrontImageNode = CoinNodeFactory.createImageNode(coinTerm.typeID, coinTerm.coinRadius, true);
    coinImageNodes.push(this.coinFrontImageNode);
    if (options.supportShowValues) {
      this.coinBackImageNode = CoinNodeFactory.createImageNode(coinTerm.typeID, coinTerm.coinRadius, false);
      coinImageNodes.push(this.coinBackImageNode);
    }

    // @private - add a parent node that contains the two coin images, and also maintains consistent bounds, necessary
    // to prevent a bunch of bounds change notification when the coin term is flipped
    this.coinImagesNode = new Rectangle(0, 0, coinTerm.coinRadius * 2, coinTerm.coinRadius * 2, {
      fill: 'transparent',
      // invisible
      children: coinImageNodes,
      x: -coinTerm.coinRadius,
      y: -coinTerm.coinRadius
    });
    this.coinAndTextRootNode.addChild(this.coinImagesNode);

    // @private - add the coin value text
    if (options.supportShowValues) {
      this.coinValueText = new Text('', {
        font: VALUE_FONT
      });
      this.coinImagesNode.addChild(this.coinValueText);
    }

    // @private - add the 'term' text, e.g. xy
    this.termText = new RichText('temp', {
      font: VARIABLE_FONT,
      supScale: SUPERSCRIPT_SCALE
    });
    this.coinAndTextRootNode.addChild(this.termText);
    if (options.supportShowValues) {
      // @private - Add the text that includes the variable values.  This can change, so it starts off blank.
      this.termWithVariableValuesText = new RichText(' ', {
        font: VARIABLE_FONT,
        supScale: SUPERSCRIPT_SCALE
      });
      this.coinAndTextRootNode.addChild(this.termWithVariableValuesText);
    }

    // @private - add the coefficient value
    this.coefficientText = new Text('', {
      font: COEFFICIENT_FONT
    });
    this.coinAndTextRootNode.addChild(this.coefficientText);

    // @private {Property.<number>} - view-specific property for controlling the coin flip animation, 0 = heads, 1 =
    // tails, values in between are used to scale the coin term and thus make it look like it's flipping
    this.flipStateProperty = new Property(showCoinValuesProperty.get() ? 1 : 0);

    // @private {Animation} - tracks current animation
    this.activeFlipAnimation = null;

    // if anything about the coin term's values changes or any of the display mode, the representation needs to be updated
    const updateRepresentationMultilink = Multilink.multilink([viewModeProperty, showAllCoefficientsProperty, showVariableValuesProperty, showCoinValuesProperty, coinTerm.totalCountProperty, coinTerm.valueProperty, coinTerm.termValueStringProperty, coinTerm.showMinusSignWhenNegativeProperty, coinTerm.cardOpacityProperty, coinTerm.scaleProperty], this.updateRepresentation.bind(this));
    let flipStateAnimator;
    if (options.supportShowValues) {
      // hook up the listener that will step the changes to the flip state when the 'show values' state changes
      flipStateAnimator = this.updateCoinFlipAnimations.bind(this);
      showCoinValuesProperty.link(flipStateAnimator);

      // adjust the coin images when the flipped state changes
      this.flipStateProperty.link(this.updateFlipAppearance.bind(this));
    }

    // @private
    this.disposeVariableCoinTermNode = () => {
      updateRepresentationMultilink.dispose();
      if (flipStateAnimator) {
        showCoinValuesProperty.unlink(flipStateAnimator);
      }
    };
  }

  // helper function to take the view bounds information and communicates it to the model
  /**
   * update the bounds used by the model to position and align coin terms
   * @private
   */
  updateBoundsInModel() {
    // make the bounds relative to the coin term's position, which corresponds to the center of the coin
    let relativeVisibleBounds = this.coinAndTextRootNode.visibleLocalBounds;

    // Expressions are kept the same width whether the view mode is set to coins or variables, but it is possible to
    // override this behavior using a query parameter.  This behavior is being retained in case we ever want to
    // experiment with it in the future.  See https://github.com/phetsims/expression-exchange/issues/10
    if (!EEQueryParameters.adjustExpressionWidth) {
      const termWithVariableValuesTextWidth = this.termWithVariableValuesText ? this.termWithVariableValuesText.width : 0;
      let width = Math.max(this.coinImagesNode.width, this.termText.width, termWithVariableValuesTextWidth);
      if (this.coefficientText.visible || Math.abs(this.coinTerm.totalCountProperty.get()) > 1) {
        width += this.coefficientText.width + COEFFICIENT_X_SPACING;
      }

      // set the view bounds such that the non-coefficient portion is always the same width
      relativeVisibleBounds = relativeVisibleBounds.dilatedX((width - relativeVisibleBounds.width) / 2);
    }

    // only update if the bounds have changed in order to avoid unnecessary updates in other portions of the code
    if (!this.coinTerm.localViewBoundsProperty.get() || !this.coinTerm.localViewBoundsProperty.get().equals(relativeVisibleBounds)) {
      this.coinTerm.localViewBoundsProperty.set(relativeVisibleBounds);
    }
  }

  /**
   * function that updates all nodes that comprise this composite node
   * @private
   */
  updateRepresentation(viewMode, showAllCoefficients, showVariableValues) {
    // convenience vars
    const textBaseline = AbstractCoinTermNode.TEXT_BASELINE_Y_OFFSET;
    const scale = this.coinTerm.scaleProperty.get(); // for convenience

    // control front coin image visibility
    this.coinImagesNode.visible = viewMode === ViewMode.COINS;

    // adjust the size of the coin term images
    const desiredCoinImageWidth = this.coinTerm.coinRadius * 2 * scale;
    if (Math.abs(this.coinImagesNode.width - desiredCoinImageWidth) > 1E-4) {
      this.coinImagesNode.setScaleMagnitude(1);
      this.coinImagesNode.setScaleMagnitude(desiredCoinImageWidth / this.coinImagesNode.width);
      this.coinImagesNode.center = Vector2.ZERO;
    }

    // update coin value text
    if (this.coinValueText) {
      this.coinValueText.string = this.coinTerm.valueProperty.value;
      this.coinValueText.centerX = this.coinTerm.coinRadius;
      this.coinValueText.centerY = this.coinTerm.coinRadius;
    }

    // determine if the coefficient is visible, since this will be used several times below
    const coefficientVisible = Math.abs(this.coinTerm.totalCountProperty.get()) !== 1 || showAllCoefficients;

    // update the term text, which only changes if it switches from positive to negative
    this.termText.setScaleMagnitude(scale);
    if (this.coinTerm.totalCountProperty.get() < 0 && !coefficientVisible && this.coinTerm.showMinusSignWhenNegativeProperty.get()) {
      this.termText.string = MathSymbols.UNARY_MINUS + this.coinTerm.termText;
    } else {
      this.termText.string = this.coinTerm.termText;
    }
    this.termText.centerX = 0;
    this.termText.y = textBaseline * scale;
    this.termText.mouseArea = this.termText.localBounds.dilatedXY(POINTER_AREA_X_DILATION_AMOUNT, POINTER_AREA_Y_DILATION_AMOUNT).shiftedY(POINTER_AREA_DOWN_SHIFT);
    this.termText.touchArea = this.termText.mouseArea;
    this.termText.visible = viewMode === ViewMode.VARIABLES && !showVariableValues;

    // term value text, which shows the variable values and operators such as exponents
    let termValueText = this.coinTerm.termValueStringProperty.value;
    if (this.coinTerm.totalCountProperty.get() === -1 && !showAllCoefficients && this.coinTerm.showMinusSignWhenNegativeProperty.get()) {
      // prepend a minus sign
      termValueText = MathSymbols.UNARY_MINUS + termValueText;
    }
    if (this.termWithVariableValuesText) {
      this.termWithVariableValuesText.setScaleMagnitude(scale);
      this.termWithVariableValuesText.string = termValueText;
      this.termWithVariableValuesText.centerX = 0;
      this.termWithVariableValuesText.y = textBaseline * scale;
      this.termWithVariableValuesText.mouseArea = this.termWithVariableValuesText.localBounds.dilatedX(POINTER_AREA_X_DILATION_AMOUNT).dilatedY(POINTER_AREA_Y_DILATION_AMOUNT).shiftedY(POINTER_AREA_DOWN_SHIFT);
      this.termWithVariableValuesText.touchArea = this.termWithVariableValuesText.mouseArea;
      this.termWithVariableValuesText.visible = viewMode === ViewMode.VARIABLES && showVariableValues;
    }

    // coefficient value and visibility
    this.coefficientText.setScaleMagnitude(scale);
    this.coefficientText.string = this.coinTerm.showMinusSignWhenNegativeProperty.get() ? this.coinTerm.totalCountProperty.get() : Math.abs(this.coinTerm.totalCountProperty.get());
    this.coefficientText.visible = coefficientVisible;

    // position the coefficient
    if (viewMode === ViewMode.COINS) {
      this.coefficientText.right = this.coinImagesNode.left - COEFFICIENT_X_SPACING;
      this.coefficientText.centerY = this.coinImagesNode.centerY;
    } else if (this.termText.visible) {
      this.coefficientText.right = this.termText.left - COEFFICIENT_X_SPACING;
      this.coefficientText.y = textBaseline * scale;
    } else if (this.termWithVariableValuesText) {
      this.coefficientText.right = this.termWithVariableValuesText.left - COEFFICIENT_X_SPACING;
      this.coefficientText.y = textBaseline * scale;
    }

    // update the card background
    const targetCardHeight = viewMode === ViewMode.COINS ? AbstractCoinTermNode.BACKGROUND_CARD_HEIGHT_COIN_MODE : AbstractCoinTermNode.BACKGROUND_CARD_HEIGHT_TEXT_MODE;
    this.cardLikeBackground.setRectBounds(this.coinAndTextRootNode.visibleLocalBounds.dilatedXY(AbstractCoinTermNode.BACKGROUND_CARD_X_MARGIN, (targetCardHeight - this.coinAndTextRootNode.visibleLocalBounds.height) / 2));
    this.cardLikeBackground.opacity = this.coinTerm.cardOpacityProperty.get();
    this.cardLikeBackground.visible = this.cardLikeBackground.opacity > 0;

    // Update the invisible rectangle that mimics and expands upon the bounds.  The amount of dilation was
    // empirically determined.
    this.boundsRect.visible = false;
    this.boundsRect.setRectBounds(this.coinAndTextRootNode.visibleLocalBounds.dilated(3));
    this.boundsRect.visible = true;

    // update the bounds that are registered with the model
    this.updateBoundsInModel();
  }

  /**
   * update the coin flip animation, used to show or hide the coin values
   * @param {boolean} showCoinValues
   * @private
   */
  updateCoinFlipAnimations(showCoinValues) {
    if (this.viewModeProperty.get() === ViewMode.COINS) {
      if (this.activeFlipAnimation) {
        this.activeFlipAnimation.stop();
      }
      const targetFlipState = showCoinValues ? 1 : 0;
      if (this.flipStateProperty.get() !== targetFlipState) {
        // use an animation to depict the coin flip
        this.activeFlipAnimation = new Animation({
          duration: COIN_FLIP_TIME,
          easing: Easing.CUBIC_IN_OUT,
          setValue: newFlipState => {
            this.flipStateProperty.set(newFlipState);
          },
          from: this.flipStateProperty.get(),
          to: targetFlipState
        });
        this.activeFlipAnimation.finishEmitter.addListener(() => {
          this.activeFlipAnimation = null;
        });
        this.activeFlipAnimation.start();
      }
    } else {
      // do the change immediately, heads if NOT showing coin values, tails if we are
      this.flipStateProperty.set(showCoinValues ? 1 : 0);
    }
  }

  /**
   * update the scale and visibility of the images in order to make it look like the coin is flipping, works in
   * conjunction with the "flipState" variable to perform the flip animation
   * @param {number} flipState
   * @private
   */
  updateFlipAppearance(flipState) {
    assert && assert(this.coinBackImageNode, 'options were not correctly set on this node to support coin flip');

    // Use the y scale as the 'full scale' value.  This assumes that the two images are the same size, that they are
    // equal in width and height when unscaled, and that the Y dimension is not being scaled.
    const fullScale = this.coinFrontImageNode.getScaleVector().y;
    const centerX = this.coinTerm.coinRadius;

    // set the width of the front image
    this.coinFrontImageNode.setScaleMagnitude(Math.max((1 - 2 * flipState) * fullScale, MIN_SCALE_FOR_FLIP), fullScale);
    this.coinFrontImageNode.centerX = centerX;

    // set the width of the back image
    this.coinBackImageNode.setScaleMagnitude(Math.max(2 * (flipState - 0.5) * fullScale, MIN_SCALE_FOR_FLIP), fullScale);
    this.coinBackImageNode.centerX = centerX;

    // set the width of the coin value text
    this.coinValueText.setScaleMagnitude(Math.max(2 * (flipState - 0.5), MIN_SCALE_FOR_FLIP), 1);
    this.coinValueText.centerX = this.coinTerm.coinRadius;

    // set visibility of both images and the value text
    this.coinFrontImageNode.visible = flipState <= 0.5;
    this.coinBackImageNode.visible = flipState >= 0.5;
    this.coinValueText.visible = this.coinBackImageNode.visible;
  }

  /**
   * @public
   */
  dispose() {
    this.disposeVariableCoinTermNode();
    super.dispose();
  }
}
expressionExchange.register('VariableCoinTermNode', VariableCoinTermNode);
export default VariableCoinTermNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJtZXJnZSIsIk1hdGhTeW1ib2xGb250IiwiTWF0aFN5bWJvbHMiLCJQaGV0Rm9udCIsIlJlY3RhbmdsZSIsIlJpY2hUZXh0IiwiVGV4dCIsIkFuaW1hdGlvbiIsIkVhc2luZyIsImV4cHJlc3Npb25FeGNoYW5nZSIsIkVFUXVlcnlQYXJhbWV0ZXJzIiwiVmlld01vZGUiLCJBYnN0cmFjdENvaW5UZXJtTm9kZSIsIkNvaW5Ob2RlRmFjdG9yeSIsIkNPRUZGSUNJRU5UX0ZPTlQiLCJzaXplIiwiQ09FRkZJQ0lFTlRfWF9TUEFDSU5HIiwiU1VQRVJTQ1JJUFRfU0NBTEUiLCJWQUxVRV9GT05UIiwiVkFSSUFCTEVfRk9OVCIsIkNPSU5fRkxJUF9USU1FIiwiTUlOX1NDQUxFX0ZPUl9GTElQIiwiUE9JTlRFUl9BUkVBX1hfRElMQVRJT05fQU1PVU5UIiwiUE9JTlRFUl9BUkVBX1lfRElMQVRJT05fQU1PVU5UIiwiUE9JTlRFUl9BUkVBX0RPV05fU0hJRlQiLCJWYXJpYWJsZUNvaW5UZXJtTm9kZSIsImNvbnN0cnVjdG9yIiwiY29pblRlcm0iLCJ2aWV3TW9kZVByb3BlcnR5Iiwic2hvd0NvaW5WYWx1ZXNQcm9wZXJ0eSIsInNob3dWYXJpYWJsZVZhbHVlc1Byb3BlcnR5Iiwic2hvd0FsbENvZWZmaWNpZW50c1Byb3BlcnR5Iiwib3B0aW9ucyIsInN1cHBvcnRTaG93VmFsdWVzIiwiYm91bmRzUmVjdCIsImZpbGwiLCJjb2luQW5kVGV4dFJvb3ROb2RlIiwiYWRkQ2hpbGQiLCJjb2luSW1hZ2VOb2RlcyIsImNvaW5Gcm9udEltYWdlTm9kZSIsImNyZWF0ZUltYWdlTm9kZSIsInR5cGVJRCIsImNvaW5SYWRpdXMiLCJwdXNoIiwiY29pbkJhY2tJbWFnZU5vZGUiLCJjb2luSW1hZ2VzTm9kZSIsImNoaWxkcmVuIiwieCIsInkiLCJjb2luVmFsdWVUZXh0IiwiZm9udCIsInRlcm1UZXh0Iiwic3VwU2NhbGUiLCJ0ZXJtV2l0aFZhcmlhYmxlVmFsdWVzVGV4dCIsImNvZWZmaWNpZW50VGV4dCIsImZsaXBTdGF0ZVByb3BlcnR5IiwiZ2V0IiwiYWN0aXZlRmxpcEFuaW1hdGlvbiIsInVwZGF0ZVJlcHJlc2VudGF0aW9uTXVsdGlsaW5rIiwibXVsdGlsaW5rIiwidG90YWxDb3VudFByb3BlcnR5IiwidmFsdWVQcm9wZXJ0eSIsInRlcm1WYWx1ZVN0cmluZ1Byb3BlcnR5Iiwic2hvd01pbnVzU2lnbldoZW5OZWdhdGl2ZVByb3BlcnR5IiwiY2FyZE9wYWNpdHlQcm9wZXJ0eSIsInNjYWxlUHJvcGVydHkiLCJ1cGRhdGVSZXByZXNlbnRhdGlvbiIsImJpbmQiLCJmbGlwU3RhdGVBbmltYXRvciIsInVwZGF0ZUNvaW5GbGlwQW5pbWF0aW9ucyIsImxpbmsiLCJ1cGRhdGVGbGlwQXBwZWFyYW5jZSIsImRpc3Bvc2VWYXJpYWJsZUNvaW5UZXJtTm9kZSIsImRpc3Bvc2UiLCJ1bmxpbmsiLCJ1cGRhdGVCb3VuZHNJbk1vZGVsIiwicmVsYXRpdmVWaXNpYmxlQm91bmRzIiwidmlzaWJsZUxvY2FsQm91bmRzIiwiYWRqdXN0RXhwcmVzc2lvbldpZHRoIiwidGVybVdpdGhWYXJpYWJsZVZhbHVlc1RleHRXaWR0aCIsIndpZHRoIiwiTWF0aCIsIm1heCIsInZpc2libGUiLCJhYnMiLCJkaWxhdGVkWCIsImxvY2FsVmlld0JvdW5kc1Byb3BlcnR5IiwiZXF1YWxzIiwic2V0Iiwidmlld01vZGUiLCJzaG93QWxsQ29lZmZpY2llbnRzIiwic2hvd1ZhcmlhYmxlVmFsdWVzIiwidGV4dEJhc2VsaW5lIiwiVEVYVF9CQVNFTElORV9ZX09GRlNFVCIsInNjYWxlIiwiQ09JTlMiLCJkZXNpcmVkQ29pbkltYWdlV2lkdGgiLCJzZXRTY2FsZU1hZ25pdHVkZSIsImNlbnRlciIsIlpFUk8iLCJzdHJpbmciLCJ2YWx1ZSIsImNlbnRlclgiLCJjZW50ZXJZIiwiY29lZmZpY2llbnRWaXNpYmxlIiwiVU5BUllfTUlOVVMiLCJtb3VzZUFyZWEiLCJsb2NhbEJvdW5kcyIsImRpbGF0ZWRYWSIsInNoaWZ0ZWRZIiwidG91Y2hBcmVhIiwiVkFSSUFCTEVTIiwidGVybVZhbHVlVGV4dCIsImRpbGF0ZWRZIiwicmlnaHQiLCJsZWZ0IiwidGFyZ2V0Q2FyZEhlaWdodCIsIkJBQ0tHUk9VTkRfQ0FSRF9IRUlHSFRfQ09JTl9NT0RFIiwiQkFDS0dST1VORF9DQVJEX0hFSUdIVF9URVhUX01PREUiLCJjYXJkTGlrZUJhY2tncm91bmQiLCJzZXRSZWN0Qm91bmRzIiwiQkFDS0dST1VORF9DQVJEX1hfTUFSR0lOIiwiaGVpZ2h0Iiwib3BhY2l0eSIsImRpbGF0ZWQiLCJzaG93Q29pblZhbHVlcyIsInN0b3AiLCJ0YXJnZXRGbGlwU3RhdGUiLCJkdXJhdGlvbiIsImVhc2luZyIsIkNVQklDX0lOX09VVCIsInNldFZhbHVlIiwibmV3RmxpcFN0YXRlIiwiZnJvbSIsInRvIiwiZmluaXNoRW1pdHRlciIsImFkZExpc3RlbmVyIiwic3RhcnQiLCJmbGlwU3RhdGUiLCJhc3NlcnQiLCJmdWxsU2NhbGUiLCJnZXRTY2FsZVZlY3RvciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVmFyaWFibGVDb2luVGVybU5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogYSBTY2VuZXJ5IG5vZGUgdGhhdCByZXByZXNlbnRzIGEgY29pbiB0ZXJtIHdob3NlIHVuZGVybHlpbmcgdmFsdWUgY2FuIHZhcnkgaW4gdGhlIHZpZXdcclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBNYXRoU3ltYm9sRm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTWF0aFN5bWJvbEZvbnQuanMnO1xyXG5pbXBvcnQgTWF0aFN5bWJvbHMgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01hdGhTeW1ib2xzLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IFJlY3RhbmdsZSwgUmljaFRleHQsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQW5pbWF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3R3aXh0L2pzL0FuaW1hdGlvbi5qcyc7XHJcbmltcG9ydCBFYXNpbmcgZnJvbSAnLi4vLi4vLi4vLi4vdHdpeHQvanMvRWFzaW5nLmpzJztcclxuaW1wb3J0IGV4cHJlc3Npb25FeGNoYW5nZSBmcm9tICcuLi8uLi9leHByZXNzaW9uRXhjaGFuZ2UuanMnO1xyXG5pbXBvcnQgRUVRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vRUVRdWVyeVBhcmFtZXRlcnMuanMnO1xyXG5pbXBvcnQgVmlld01vZGUgZnJvbSAnLi4vZW51bS9WaWV3TW9kZS5qcyc7XHJcbmltcG9ydCBBYnN0cmFjdENvaW5UZXJtTm9kZSBmcm9tICcuL0Fic3RyYWN0Q29pblRlcm1Ob2RlLmpzJztcclxuaW1wb3J0IENvaW5Ob2RlRmFjdG9yeSBmcm9tICcuL0NvaW5Ob2RlRmFjdG9yeS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQ09FRkZJQ0lFTlRfRk9OVCA9IG5ldyBQaGV0Rm9udCggeyBzaXplOiAzNCB9ICk7XHJcbmNvbnN0IENPRUZGSUNJRU5UX1hfU1BBQ0lORyA9IDM7IC8vIGluIHNjcmVlbiBjb29yZHNcclxuY29uc3QgU1VQRVJTQ1JJUFRfU0NBTEUgPSAwLjY1O1xyXG5jb25zdCBWQUxVRV9GT05UID0gbmV3IFBoZXRGb250KCB7IHNpemU6IDMwIH0gKTtcclxuY29uc3QgVkFSSUFCTEVfRk9OVCA9IG5ldyBNYXRoU3ltYm9sRm9udCggMzYgKTtcclxuY29uc3QgQ09JTl9GTElQX1RJTUUgPSAwLjU7IC8vIGluIHNlY29uZHNcclxuY29uc3QgTUlOX1NDQUxFX0ZPUl9GTElQID0gMC4wNTtcclxuXHJcbi8vIFRoZSBmb2xsb3dpbmcgY29uc3RhbnRzIGNvbnRyb2wgaG93IHRoZSBwb2ludGVyIGFyZWFzIChtb3VzZSBhbmQgdG91Y2gpIGFyZSBzZXQgdXAgZm9yIHRoZSB0ZXh0dWFsIHJlcHJlc2VudGF0aW9uXHJcbi8vIG9mIHRoZSBjb2luIHRlcm0uICBUaGVzZSBhcmUgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCBzdWNoIHRoYXQgdGhleSBhcmUgZWFzeSBmb3IgdXNlcnMgdG8gZ3JhYiBidXQgdGhlIGRvbid0XHJcbi8vIHByb3RydWRlIGZyb20gZXhwcmVzc2lvbnMuXHJcbmNvbnN0IFBPSU5URVJfQVJFQV9YX0RJTEFUSU9OX0FNT1VOVCA9IDE1OyAvLyBpbiBzY3JlZW4gY29vcmRzXHJcbmNvbnN0IFBPSU5URVJfQVJFQV9ZX0RJTEFUSU9OX0FNT1VOVCA9IDg7IC8vIGluIHNjcmVlbiBjb29yZHMsIGxlc3MgdGhhbiBYIGFtdCB0byBhdm9pZCBwcm90cnVkaW5nIG91dCBvZiBleHByZXNzaW9uXHJcbmNvbnN0IFBPSU5URVJfQVJFQV9ET1dOX1NISUZUID0gMzsgLy8gaW4gc2NyZWVuIGNvb3Jkc1xyXG5cclxuY2xhc3MgVmFyaWFibGVDb2luVGVybU5vZGUgZXh0ZW5kcyBBYnN0cmFjdENvaW5UZXJtTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7Q29pblRlcm19IGNvaW5UZXJtIC0gbW9kZWwgb2YgYSBjb2luXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Vmlld01vZGU+fSB2aWV3TW9kZVByb3BlcnR5IC0gY29udHJvbHMgd2hldGhlciB0byBzaG93IHRoZSBjb2luIG9yIHRoZSB0ZXJtXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IHNob3dDb2luVmFsdWVzUHJvcGVydHkgLSBjb250cm9scyB3aGV0aGVyIG9yIG5vdCBjb2luIHZhbHVlIGlzIHNob3duXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IHNob3dWYXJpYWJsZVZhbHVlc1Byb3BlcnR5IC0gY29udHJvbHMgd2hldGhlciBvciBub3QgdmFyaWFibGUgdmFsdWVzIGFyZSBzaG93blxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSBzaG93QWxsQ29lZmZpY2llbnRzUHJvcGVydHkgLSBjb250cm9scyB3aGV0aGVyIDEgaXMgc2hvd24gZm9yIG5vbi1jb21iaW5lZCBjb2luc1xyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggY29pblRlcm0sIHZpZXdNb2RlUHJvcGVydHksIHNob3dDb2luVmFsdWVzUHJvcGVydHksIHNob3dWYXJpYWJsZVZhbHVlc1Byb3BlcnR5LCBzaG93QWxsQ29lZmZpY2llbnRzUHJvcGVydHksIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyB0aGlzIHZhbHVlIGNhbiBiZSBzZXQgdG8gZmFsc2UgaW4gb3JkZXIgdG8gY29uc2VydmUgbm9kZXMsIGFuZCB0aGVyZWZvcmUgbWVtb3J5LCBpZiB0aGlzIG5vZGUgd2lsbCBuZXZlciBuZWVkXHJcbiAgICAgIC8vIHRvIHNob3cgdGhlIHZhbHVlIG9mIHRoZSBjb2luIHRlcm1cclxuICAgICAgc3VwcG9ydFNob3dWYWx1ZXM6IHRydWVcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggY29pblRlcm0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Q29pblRlcm19IC0gbWFrZSB0aGUgY29pbiB0ZXJtIGF2YWlsYWJsZSB0byBtZXRob2RzXHJcbiAgICB0aGlzLmNvaW5UZXJtID0gY29pblRlcm07XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1Byb3BlcnR5LjxWaWV3TW9kZT59IC0gbWFrZSB0aGUgdmlldyBtb2RlIGF2YWlsYWJsZSB0byBtZXRob2RzXHJcbiAgICB0aGlzLnZpZXdNb2RlUHJvcGVydHkgPSB2aWV3TW9kZVByb3BlcnR5O1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtSZWN0YW5nbGV9IC0gYW4gaW52aXNpYmxlIG5vZGUgdXNlZCB0byBtYWtlIHN1cmUgdGV4dCBpcyByZW5kZXJlZCB3aXRob3V0IGJvdW5kcyBpc3N1ZXMsIHNlZVxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2V4cHJlc3Npb24tZXhjaGFuZ2UvaXNzdWVzLzI2XHJcbiAgICB0aGlzLmJvdW5kc1JlY3QgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAxLCAxLCB7IGZpbGw6ICd0cmFuc3BhcmVudCcgfSApO1xyXG4gICAgdGhpcy5jb2luQW5kVGV4dFJvb3ROb2RlLmFkZENoaWxkKCB0aGlzLmJvdW5kc1JlY3QgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7SW1hZ2V9IC0gYWRkIHRoZSBpbWFnZXMgZm9yIHRoZSBmcm9udCBhbmQgYmFjayBvZiB0aGUgY29pblxyXG4gICAgY29uc3QgY29pbkltYWdlTm9kZXMgPSBbXTtcclxuICAgIHRoaXMuY29pbkZyb250SW1hZ2VOb2RlID0gQ29pbk5vZGVGYWN0b3J5LmNyZWF0ZUltYWdlTm9kZSggY29pblRlcm0udHlwZUlELCBjb2luVGVybS5jb2luUmFkaXVzLCB0cnVlICk7XHJcbiAgICBjb2luSW1hZ2VOb2Rlcy5wdXNoKCB0aGlzLmNvaW5Gcm9udEltYWdlTm9kZSApO1xyXG4gICAgaWYgKCBvcHRpb25zLnN1cHBvcnRTaG93VmFsdWVzICkge1xyXG4gICAgICB0aGlzLmNvaW5CYWNrSW1hZ2VOb2RlID0gQ29pbk5vZGVGYWN0b3J5LmNyZWF0ZUltYWdlTm9kZSggY29pblRlcm0udHlwZUlELCBjb2luVGVybS5jb2luUmFkaXVzLCBmYWxzZSApO1xyXG4gICAgICBjb2luSW1hZ2VOb2Rlcy5wdXNoKCB0aGlzLmNvaW5CYWNrSW1hZ2VOb2RlICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBhZGQgYSBwYXJlbnQgbm9kZSB0aGF0IGNvbnRhaW5zIHRoZSB0d28gY29pbiBpbWFnZXMsIGFuZCBhbHNvIG1haW50YWlucyBjb25zaXN0ZW50IGJvdW5kcywgbmVjZXNzYXJ5XHJcbiAgICAvLyB0byBwcmV2ZW50IGEgYnVuY2ggb2YgYm91bmRzIGNoYW5nZSBub3RpZmljYXRpb24gd2hlbiB0aGUgY29pbiB0ZXJtIGlzIGZsaXBwZWRcclxuICAgIHRoaXMuY29pbkltYWdlc05vZGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBjb2luVGVybS5jb2luUmFkaXVzICogMiwgY29pblRlcm0uY29pblJhZGl1cyAqIDIsIHtcclxuICAgICAgZmlsbDogJ3RyYW5zcGFyZW50JywgLy8gaW52aXNpYmxlXHJcbiAgICAgIGNoaWxkcmVuOiBjb2luSW1hZ2VOb2RlcyxcclxuICAgICAgeDogLWNvaW5UZXJtLmNvaW5SYWRpdXMsXHJcbiAgICAgIHk6IC1jb2luVGVybS5jb2luUmFkaXVzXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmNvaW5BbmRUZXh0Um9vdE5vZGUuYWRkQ2hpbGQoIHRoaXMuY29pbkltYWdlc05vZGUgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIGFkZCB0aGUgY29pbiB2YWx1ZSB0ZXh0XHJcbiAgICBpZiAoIG9wdGlvbnMuc3VwcG9ydFNob3dWYWx1ZXMgKSB7XHJcbiAgICAgIHRoaXMuY29pblZhbHVlVGV4dCA9IG5ldyBUZXh0KCAnJywgeyBmb250OiBWQUxVRV9GT05UIH0gKTtcclxuICAgICAgdGhpcy5jb2luSW1hZ2VzTm9kZS5hZGRDaGlsZCggdGhpcy5jb2luVmFsdWVUZXh0ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBhZGQgdGhlICd0ZXJtJyB0ZXh0LCBlLmcuIHh5XHJcbiAgICB0aGlzLnRlcm1UZXh0ID0gbmV3IFJpY2hUZXh0KCAndGVtcCcsIHsgZm9udDogVkFSSUFCTEVfRk9OVCwgc3VwU2NhbGU6IFNVUEVSU0NSSVBUX1NDQUxFIH0gKTtcclxuICAgIHRoaXMuY29pbkFuZFRleHRSb290Tm9kZS5hZGRDaGlsZCggdGhpcy50ZXJtVGV4dCApO1xyXG5cclxuICAgIGlmICggb3B0aW9ucy5zdXBwb3J0U2hvd1ZhbHVlcyApIHtcclxuXHJcbiAgICAgIC8vIEBwcml2YXRlIC0gQWRkIHRoZSB0ZXh0IHRoYXQgaW5jbHVkZXMgdGhlIHZhcmlhYmxlIHZhbHVlcy4gIFRoaXMgY2FuIGNoYW5nZSwgc28gaXQgc3RhcnRzIG9mZiBibGFuay5cclxuICAgICAgdGhpcy50ZXJtV2l0aFZhcmlhYmxlVmFsdWVzVGV4dCA9IG5ldyBSaWNoVGV4dCggJyAnLCB7IGZvbnQ6IFZBUklBQkxFX0ZPTlQsIHN1cFNjYWxlOiBTVVBFUlNDUklQVF9TQ0FMRSB9ICk7XHJcbiAgICAgIHRoaXMuY29pbkFuZFRleHRSb290Tm9kZS5hZGRDaGlsZCggdGhpcy50ZXJtV2l0aFZhcmlhYmxlVmFsdWVzVGV4dCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gYWRkIHRoZSBjb2VmZmljaWVudCB2YWx1ZVxyXG4gICAgdGhpcy5jb2VmZmljaWVudFRleHQgPSBuZXcgVGV4dCggJycsIHtcclxuICAgICAgZm9udDogQ09FRkZJQ0lFTlRfRk9OVFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5jb2luQW5kVGV4dFJvb3ROb2RlLmFkZENoaWxkKCB0aGlzLmNvZWZmaWNpZW50VGV4dCApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtQcm9wZXJ0eS48bnVtYmVyPn0gLSB2aWV3LXNwZWNpZmljIHByb3BlcnR5IGZvciBjb250cm9sbGluZyB0aGUgY29pbiBmbGlwIGFuaW1hdGlvbiwgMCA9IGhlYWRzLCAxID1cclxuICAgIC8vIHRhaWxzLCB2YWx1ZXMgaW4gYmV0d2VlbiBhcmUgdXNlZCB0byBzY2FsZSB0aGUgY29pbiB0ZXJtIGFuZCB0aHVzIG1ha2UgaXQgbG9vayBsaWtlIGl0J3MgZmxpcHBpbmdcclxuICAgIHRoaXMuZmxpcFN0YXRlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIHNob3dDb2luVmFsdWVzUHJvcGVydHkuZ2V0KCkgPyAxIDogMCApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtBbmltYXRpb259IC0gdHJhY2tzIGN1cnJlbnQgYW5pbWF0aW9uXHJcbiAgICB0aGlzLmFjdGl2ZUZsaXBBbmltYXRpb24gPSBudWxsO1xyXG5cclxuICAgIC8vIGlmIGFueXRoaW5nIGFib3V0IHRoZSBjb2luIHRlcm0ncyB2YWx1ZXMgY2hhbmdlcyBvciBhbnkgb2YgdGhlIGRpc3BsYXkgbW9kZSwgdGhlIHJlcHJlc2VudGF0aW9uIG5lZWRzIHRvIGJlIHVwZGF0ZWRcclxuICAgIGNvbnN0IHVwZGF0ZVJlcHJlc2VudGF0aW9uTXVsdGlsaW5rID0gTXVsdGlsaW5rLm11bHRpbGluayhcclxuICAgICAgW1xyXG4gICAgICAgIHZpZXdNb2RlUHJvcGVydHksXHJcbiAgICAgICAgc2hvd0FsbENvZWZmaWNpZW50c1Byb3BlcnR5LFxyXG4gICAgICAgIHNob3dWYXJpYWJsZVZhbHVlc1Byb3BlcnR5LFxyXG4gICAgICAgIHNob3dDb2luVmFsdWVzUHJvcGVydHksXHJcbiAgICAgICAgY29pblRlcm0udG90YWxDb3VudFByb3BlcnR5LFxyXG4gICAgICAgIGNvaW5UZXJtLnZhbHVlUHJvcGVydHksXHJcbiAgICAgICAgY29pblRlcm0udGVybVZhbHVlU3RyaW5nUHJvcGVydHksXHJcbiAgICAgICAgY29pblRlcm0uc2hvd01pbnVzU2lnbldoZW5OZWdhdGl2ZVByb3BlcnR5LFxyXG4gICAgICAgIGNvaW5UZXJtLmNhcmRPcGFjaXR5UHJvcGVydHksXHJcbiAgICAgICAgY29pblRlcm0uc2NhbGVQcm9wZXJ0eVxyXG4gICAgICBdLFxyXG4gICAgICB0aGlzLnVwZGF0ZVJlcHJlc2VudGF0aW9uLmJpbmQoIHRoaXMgKVxyXG4gICAgKTtcclxuXHJcbiAgICBsZXQgZmxpcFN0YXRlQW5pbWF0b3I7XHJcbiAgICBpZiAoIG9wdGlvbnMuc3VwcG9ydFNob3dWYWx1ZXMgKSB7XHJcblxyXG4gICAgICAvLyBob29rIHVwIHRoZSBsaXN0ZW5lciB0aGF0IHdpbGwgc3RlcCB0aGUgY2hhbmdlcyB0byB0aGUgZmxpcCBzdGF0ZSB3aGVuIHRoZSAnc2hvdyB2YWx1ZXMnIHN0YXRlIGNoYW5nZXNcclxuICAgICAgZmxpcFN0YXRlQW5pbWF0b3IgPSB0aGlzLnVwZGF0ZUNvaW5GbGlwQW5pbWF0aW9ucy5iaW5kKCB0aGlzICk7XHJcbiAgICAgIHNob3dDb2luVmFsdWVzUHJvcGVydHkubGluayggZmxpcFN0YXRlQW5pbWF0b3IgKTtcclxuXHJcbiAgICAgIC8vIGFkanVzdCB0aGUgY29pbiBpbWFnZXMgd2hlbiB0aGUgZmxpcHBlZCBzdGF0ZSBjaGFuZ2VzXHJcbiAgICAgIHRoaXMuZmxpcFN0YXRlUHJvcGVydHkubGluayggdGhpcy51cGRhdGVGbGlwQXBwZWFyYW5jZS5iaW5kKCB0aGlzICkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5kaXNwb3NlVmFyaWFibGVDb2luVGVybU5vZGUgPSAoKSA9PiB7XHJcbiAgICAgIHVwZGF0ZVJlcHJlc2VudGF0aW9uTXVsdGlsaW5rLmRpc3Bvc2UoKTtcclxuICAgICAgaWYgKCBmbGlwU3RhdGVBbmltYXRvciApIHtcclxuICAgICAgICBzaG93Q29pblZhbHVlc1Byb3BlcnR5LnVubGluayggZmxpcFN0YXRlQW5pbWF0b3IgKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vIGhlbHBlciBmdW5jdGlvbiB0byB0YWtlIHRoZSB2aWV3IGJvdW5kcyBpbmZvcm1hdGlvbiBhbmQgY29tbXVuaWNhdGVzIGl0IHRvIHRoZSBtb2RlbFxyXG4gIC8qKlxyXG4gICAqIHVwZGF0ZSB0aGUgYm91bmRzIHVzZWQgYnkgdGhlIG1vZGVsIHRvIHBvc2l0aW9uIGFuZCBhbGlnbiBjb2luIHRlcm1zXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVCb3VuZHNJbk1vZGVsKCkge1xyXG5cclxuICAgIC8vIG1ha2UgdGhlIGJvdW5kcyByZWxhdGl2ZSB0byB0aGUgY29pbiB0ZXJtJ3MgcG9zaXRpb24sIHdoaWNoIGNvcnJlc3BvbmRzIHRvIHRoZSBjZW50ZXIgb2YgdGhlIGNvaW5cclxuICAgIGxldCByZWxhdGl2ZVZpc2libGVCb3VuZHMgPSB0aGlzLmNvaW5BbmRUZXh0Um9vdE5vZGUudmlzaWJsZUxvY2FsQm91bmRzO1xyXG5cclxuICAgIC8vIEV4cHJlc3Npb25zIGFyZSBrZXB0IHRoZSBzYW1lIHdpZHRoIHdoZXRoZXIgdGhlIHZpZXcgbW9kZSBpcyBzZXQgdG8gY29pbnMgb3IgdmFyaWFibGVzLCBidXQgaXQgaXMgcG9zc2libGUgdG9cclxuICAgIC8vIG92ZXJyaWRlIHRoaXMgYmVoYXZpb3IgdXNpbmcgYSBxdWVyeSBwYXJhbWV0ZXIuICBUaGlzIGJlaGF2aW9yIGlzIGJlaW5nIHJldGFpbmVkIGluIGNhc2Ugd2UgZXZlciB3YW50IHRvXHJcbiAgICAvLyBleHBlcmltZW50IHdpdGggaXQgaW4gdGhlIGZ1dHVyZS4gIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZXhwcmVzc2lvbi1leGNoYW5nZS9pc3N1ZXMvMTBcclxuICAgIGlmICggIUVFUXVlcnlQYXJhbWV0ZXJzLmFkanVzdEV4cHJlc3Npb25XaWR0aCApIHtcclxuXHJcbiAgICAgIGNvbnN0IHRlcm1XaXRoVmFyaWFibGVWYWx1ZXNUZXh0V2lkdGggPSB0aGlzLnRlcm1XaXRoVmFyaWFibGVWYWx1ZXNUZXh0ID8gdGhpcy50ZXJtV2l0aFZhcmlhYmxlVmFsdWVzVGV4dC53aWR0aCA6IDA7XHJcblxyXG4gICAgICBsZXQgd2lkdGggPSBNYXRoLm1heCggdGhpcy5jb2luSW1hZ2VzTm9kZS53aWR0aCwgdGhpcy50ZXJtVGV4dC53aWR0aCwgdGVybVdpdGhWYXJpYWJsZVZhbHVlc1RleHRXaWR0aCApO1xyXG5cclxuICAgICAgaWYgKCB0aGlzLmNvZWZmaWNpZW50VGV4dC52aXNpYmxlIHx8IE1hdGguYWJzKCB0aGlzLmNvaW5UZXJtLnRvdGFsQ291bnRQcm9wZXJ0eS5nZXQoKSApID4gMSApIHtcclxuICAgICAgICB3aWR0aCArPSB0aGlzLmNvZWZmaWNpZW50VGV4dC53aWR0aCArIENPRUZGSUNJRU5UX1hfU1BBQ0lORztcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gc2V0IHRoZSB2aWV3IGJvdW5kcyBzdWNoIHRoYXQgdGhlIG5vbi1jb2VmZmljaWVudCBwb3J0aW9uIGlzIGFsd2F5cyB0aGUgc2FtZSB3aWR0aFxyXG4gICAgICByZWxhdGl2ZVZpc2libGVCb3VuZHMgPSByZWxhdGl2ZVZpc2libGVCb3VuZHMuZGlsYXRlZFgoICggd2lkdGggLSByZWxhdGl2ZVZpc2libGVCb3VuZHMud2lkdGggKSAvIDIgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBvbmx5IHVwZGF0ZSBpZiB0aGUgYm91bmRzIGhhdmUgY2hhbmdlZCBpbiBvcmRlciB0byBhdm9pZCB1bm5lY2Vzc2FyeSB1cGRhdGVzIGluIG90aGVyIHBvcnRpb25zIG9mIHRoZSBjb2RlXHJcbiAgICBpZiAoICF0aGlzLmNvaW5UZXJtLmxvY2FsVmlld0JvdW5kc1Byb3BlcnR5LmdldCgpIHx8ICF0aGlzLmNvaW5UZXJtLmxvY2FsVmlld0JvdW5kc1Byb3BlcnR5LmdldCgpLmVxdWFscyggcmVsYXRpdmVWaXNpYmxlQm91bmRzICkgKSB7XHJcbiAgICAgIHRoaXMuY29pblRlcm0ubG9jYWxWaWV3Qm91bmRzUHJvcGVydHkuc2V0KCByZWxhdGl2ZVZpc2libGVCb3VuZHMgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGZ1bmN0aW9uIHRoYXQgdXBkYXRlcyBhbGwgbm9kZXMgdGhhdCBjb21wcmlzZSB0aGlzIGNvbXBvc2l0ZSBub2RlXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVSZXByZXNlbnRhdGlvbiggdmlld01vZGUsIHNob3dBbGxDb2VmZmljaWVudHMsIHNob3dWYXJpYWJsZVZhbHVlcyApIHtcclxuXHJcbiAgICAvLyBjb252ZW5pZW5jZSB2YXJzXHJcbiAgICBjb25zdCB0ZXh0QmFzZWxpbmUgPSBBYnN0cmFjdENvaW5UZXJtTm9kZS5URVhUX0JBU0VMSU5FX1lfT0ZGU0VUO1xyXG4gICAgY29uc3Qgc2NhbGUgPSB0aGlzLmNvaW5UZXJtLnNjYWxlUHJvcGVydHkuZ2V0KCk7IC8vIGZvciBjb252ZW5pZW5jZVxyXG5cclxuICAgIC8vIGNvbnRyb2wgZnJvbnQgY29pbiBpbWFnZSB2aXNpYmlsaXR5XHJcbiAgICB0aGlzLmNvaW5JbWFnZXNOb2RlLnZpc2libGUgPSB2aWV3TW9kZSA9PT0gVmlld01vZGUuQ09JTlM7XHJcblxyXG4gICAgLy8gYWRqdXN0IHRoZSBzaXplIG9mIHRoZSBjb2luIHRlcm0gaW1hZ2VzXHJcbiAgICBjb25zdCBkZXNpcmVkQ29pbkltYWdlV2lkdGggPSB0aGlzLmNvaW5UZXJtLmNvaW5SYWRpdXMgKiAyICogc2NhbGU7XHJcbiAgICBpZiAoIE1hdGguYWJzKCB0aGlzLmNvaW5JbWFnZXNOb2RlLndpZHRoIC0gZGVzaXJlZENvaW5JbWFnZVdpZHRoICkgPiAxRS00ICkge1xyXG4gICAgICB0aGlzLmNvaW5JbWFnZXNOb2RlLnNldFNjYWxlTWFnbml0dWRlKCAxICk7XHJcbiAgICAgIHRoaXMuY29pbkltYWdlc05vZGUuc2V0U2NhbGVNYWduaXR1ZGUoIGRlc2lyZWRDb2luSW1hZ2VXaWR0aCAvIHRoaXMuY29pbkltYWdlc05vZGUud2lkdGggKTtcclxuICAgICAgdGhpcy5jb2luSW1hZ2VzTm9kZS5jZW50ZXIgPSBWZWN0b3IyLlpFUk87XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdXBkYXRlIGNvaW4gdmFsdWUgdGV4dFxyXG4gICAgaWYgKCB0aGlzLmNvaW5WYWx1ZVRleHQgKSB7XHJcbiAgICAgIHRoaXMuY29pblZhbHVlVGV4dC5zdHJpbmcgPSB0aGlzLmNvaW5UZXJtLnZhbHVlUHJvcGVydHkudmFsdWU7XHJcbiAgICAgIHRoaXMuY29pblZhbHVlVGV4dC5jZW50ZXJYID0gdGhpcy5jb2luVGVybS5jb2luUmFkaXVzO1xyXG4gICAgICB0aGlzLmNvaW5WYWx1ZVRleHQuY2VudGVyWSA9IHRoaXMuY29pblRlcm0uY29pblJhZGl1cztcclxuICAgIH1cclxuXHJcbiAgICAvLyBkZXRlcm1pbmUgaWYgdGhlIGNvZWZmaWNpZW50IGlzIHZpc2libGUsIHNpbmNlIHRoaXMgd2lsbCBiZSB1c2VkIHNldmVyYWwgdGltZXMgYmVsb3dcclxuICAgIGNvbnN0IGNvZWZmaWNpZW50VmlzaWJsZSA9IE1hdGguYWJzKCB0aGlzLmNvaW5UZXJtLnRvdGFsQ291bnRQcm9wZXJ0eS5nZXQoKSApICE9PSAxIHx8IHNob3dBbGxDb2VmZmljaWVudHM7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSB0ZXJtIHRleHQsIHdoaWNoIG9ubHkgY2hhbmdlcyBpZiBpdCBzd2l0Y2hlcyBmcm9tIHBvc2l0aXZlIHRvIG5lZ2F0aXZlXHJcbiAgICB0aGlzLnRlcm1UZXh0LnNldFNjYWxlTWFnbml0dWRlKCBzY2FsZSApO1xyXG4gICAgaWYgKCB0aGlzLmNvaW5UZXJtLnRvdGFsQ291bnRQcm9wZXJ0eS5nZXQoKSA8IDAgJiYgIWNvZWZmaWNpZW50VmlzaWJsZSAmJlxyXG4gICAgICAgICB0aGlzLmNvaW5UZXJtLnNob3dNaW51c1NpZ25XaGVuTmVnYXRpdmVQcm9wZXJ0eS5nZXQoKSApIHtcclxuXHJcbiAgICAgIHRoaXMudGVybVRleHQuc3RyaW5nID0gTWF0aFN5bWJvbHMuVU5BUllfTUlOVVMgKyB0aGlzLmNvaW5UZXJtLnRlcm1UZXh0O1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMudGVybVRleHQuc3RyaW5nID0gdGhpcy5jb2luVGVybS50ZXJtVGV4dDtcclxuICAgIH1cclxuICAgIHRoaXMudGVybVRleHQuY2VudGVyWCA9IDA7XHJcbiAgICB0aGlzLnRlcm1UZXh0LnkgPSB0ZXh0QmFzZWxpbmUgKiBzY2FsZTtcclxuICAgIHRoaXMudGVybVRleHQubW91c2VBcmVhID0gdGhpcy50ZXJtVGV4dC5sb2NhbEJvdW5kc1xyXG4gICAgICAuZGlsYXRlZFhZKCBQT0lOVEVSX0FSRUFfWF9ESUxBVElPTl9BTU9VTlQsIFBPSU5URVJfQVJFQV9ZX0RJTEFUSU9OX0FNT1VOVCApXHJcbiAgICAgIC5zaGlmdGVkWSggUE9JTlRFUl9BUkVBX0RPV05fU0hJRlQgKTtcclxuICAgIHRoaXMudGVybVRleHQudG91Y2hBcmVhID0gdGhpcy50ZXJtVGV4dC5tb3VzZUFyZWE7XHJcbiAgICB0aGlzLnRlcm1UZXh0LnZpc2libGUgPSB2aWV3TW9kZSA9PT0gVmlld01vZGUuVkFSSUFCTEVTICYmICFzaG93VmFyaWFibGVWYWx1ZXM7XHJcblxyXG4gICAgLy8gdGVybSB2YWx1ZSB0ZXh0LCB3aGljaCBzaG93cyB0aGUgdmFyaWFibGUgdmFsdWVzIGFuZCBvcGVyYXRvcnMgc3VjaCBhcyBleHBvbmVudHNcclxuICAgIGxldCB0ZXJtVmFsdWVUZXh0ID0gdGhpcy5jb2luVGVybS50ZXJtVmFsdWVTdHJpbmdQcm9wZXJ0eS52YWx1ZTtcclxuICAgIGlmICggdGhpcy5jb2luVGVybS50b3RhbENvdW50UHJvcGVydHkuZ2V0KCkgPT09IC0xICYmICFzaG93QWxsQ29lZmZpY2llbnRzICYmXHJcbiAgICAgICAgIHRoaXMuY29pblRlcm0uc2hvd01pbnVzU2lnbldoZW5OZWdhdGl2ZVByb3BlcnR5LmdldCgpICkge1xyXG4gICAgICAvLyBwcmVwZW5kIGEgbWludXMgc2lnblxyXG4gICAgICB0ZXJtVmFsdWVUZXh0ID0gTWF0aFN5bWJvbHMuVU5BUllfTUlOVVMgKyB0ZXJtVmFsdWVUZXh0O1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggdGhpcy50ZXJtV2l0aFZhcmlhYmxlVmFsdWVzVGV4dCApIHtcclxuICAgICAgdGhpcy50ZXJtV2l0aFZhcmlhYmxlVmFsdWVzVGV4dC5zZXRTY2FsZU1hZ25pdHVkZSggc2NhbGUgKTtcclxuICAgICAgdGhpcy50ZXJtV2l0aFZhcmlhYmxlVmFsdWVzVGV4dC5zdHJpbmcgPSB0ZXJtVmFsdWVUZXh0O1xyXG4gICAgICB0aGlzLnRlcm1XaXRoVmFyaWFibGVWYWx1ZXNUZXh0LmNlbnRlclggPSAwO1xyXG4gICAgICB0aGlzLnRlcm1XaXRoVmFyaWFibGVWYWx1ZXNUZXh0LnkgPSB0ZXh0QmFzZWxpbmUgKiBzY2FsZTtcclxuICAgICAgdGhpcy50ZXJtV2l0aFZhcmlhYmxlVmFsdWVzVGV4dC5tb3VzZUFyZWEgPSB0aGlzLnRlcm1XaXRoVmFyaWFibGVWYWx1ZXNUZXh0LmxvY2FsQm91bmRzXHJcbiAgICAgICAgLmRpbGF0ZWRYKCBQT0lOVEVSX0FSRUFfWF9ESUxBVElPTl9BTU9VTlQgKVxyXG4gICAgICAgIC5kaWxhdGVkWSggUE9JTlRFUl9BUkVBX1lfRElMQVRJT05fQU1PVU5UIClcclxuICAgICAgICAuc2hpZnRlZFkoIFBPSU5URVJfQVJFQV9ET1dOX1NISUZUICk7XHJcbiAgICAgIHRoaXMudGVybVdpdGhWYXJpYWJsZVZhbHVlc1RleHQudG91Y2hBcmVhID0gdGhpcy50ZXJtV2l0aFZhcmlhYmxlVmFsdWVzVGV4dC5tb3VzZUFyZWE7XHJcbiAgICAgIHRoaXMudGVybVdpdGhWYXJpYWJsZVZhbHVlc1RleHQudmlzaWJsZSA9IHZpZXdNb2RlID09PSBWaWV3TW9kZS5WQVJJQUJMRVMgJiYgc2hvd1ZhcmlhYmxlVmFsdWVzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNvZWZmaWNpZW50IHZhbHVlIGFuZCB2aXNpYmlsaXR5XHJcbiAgICB0aGlzLmNvZWZmaWNpZW50VGV4dC5zZXRTY2FsZU1hZ25pdHVkZSggc2NhbGUgKTtcclxuICAgIHRoaXMuY29lZmZpY2llbnRUZXh0LnN0cmluZyA9IHRoaXMuY29pblRlcm0uc2hvd01pbnVzU2lnbldoZW5OZWdhdGl2ZVByb3BlcnR5LmdldCgpID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvaW5UZXJtLnRvdGFsQ291bnRQcm9wZXJ0eS5nZXQoKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5hYnMoIHRoaXMuY29pblRlcm0udG90YWxDb3VudFByb3BlcnR5LmdldCgpICk7XHJcbiAgICB0aGlzLmNvZWZmaWNpZW50VGV4dC52aXNpYmxlID0gY29lZmZpY2llbnRWaXNpYmxlO1xyXG5cclxuICAgIC8vIHBvc2l0aW9uIHRoZSBjb2VmZmljaWVudFxyXG4gICAgaWYgKCB2aWV3TW9kZSA9PT0gVmlld01vZGUuQ09JTlMgKSB7XHJcbiAgICAgIHRoaXMuY29lZmZpY2llbnRUZXh0LnJpZ2h0ID0gdGhpcy5jb2luSW1hZ2VzTm9kZS5sZWZ0IC0gQ09FRkZJQ0lFTlRfWF9TUEFDSU5HO1xyXG4gICAgICB0aGlzLmNvZWZmaWNpZW50VGV4dC5jZW50ZXJZID0gdGhpcy5jb2luSW1hZ2VzTm9kZS5jZW50ZXJZO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMudGVybVRleHQudmlzaWJsZSApIHtcclxuICAgICAgdGhpcy5jb2VmZmljaWVudFRleHQucmlnaHQgPSB0aGlzLnRlcm1UZXh0LmxlZnQgLSBDT0VGRklDSUVOVF9YX1NQQUNJTkc7XHJcbiAgICAgIHRoaXMuY29lZmZpY2llbnRUZXh0LnkgPSB0ZXh0QmFzZWxpbmUgKiBzY2FsZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLnRlcm1XaXRoVmFyaWFibGVWYWx1ZXNUZXh0ICkge1xyXG4gICAgICB0aGlzLmNvZWZmaWNpZW50VGV4dC5yaWdodCA9IHRoaXMudGVybVdpdGhWYXJpYWJsZVZhbHVlc1RleHQubGVmdCAtIENPRUZGSUNJRU5UX1hfU1BBQ0lORztcclxuICAgICAgdGhpcy5jb2VmZmljaWVudFRleHQueSA9IHRleHRCYXNlbGluZSAqIHNjYWxlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHVwZGF0ZSB0aGUgY2FyZCBiYWNrZ3JvdW5kXHJcbiAgICBjb25zdCB0YXJnZXRDYXJkSGVpZ2h0ID0gdmlld01vZGUgPT09IFZpZXdNb2RlLkNPSU5TID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBYnN0cmFjdENvaW5UZXJtTm9kZS5CQUNLR1JPVU5EX0NBUkRfSEVJR0hUX0NPSU5fTU9ERSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWJzdHJhY3RDb2luVGVybU5vZGUuQkFDS0dST1VORF9DQVJEX0hFSUdIVF9URVhUX01PREU7XHJcbiAgICB0aGlzLmNhcmRMaWtlQmFja2dyb3VuZC5zZXRSZWN0Qm91bmRzKCB0aGlzLmNvaW5BbmRUZXh0Um9vdE5vZGUudmlzaWJsZUxvY2FsQm91bmRzLmRpbGF0ZWRYWShcclxuICAgICAgQWJzdHJhY3RDb2luVGVybU5vZGUuQkFDS0dST1VORF9DQVJEX1hfTUFSR0lOLFxyXG4gICAgICAoIHRhcmdldENhcmRIZWlnaHQgLSB0aGlzLmNvaW5BbmRUZXh0Um9vdE5vZGUudmlzaWJsZUxvY2FsQm91bmRzLmhlaWdodCApIC8gMlxyXG4gICAgKSApO1xyXG4gICAgdGhpcy5jYXJkTGlrZUJhY2tncm91bmQub3BhY2l0eSA9IHRoaXMuY29pblRlcm0uY2FyZE9wYWNpdHlQcm9wZXJ0eS5nZXQoKTtcclxuICAgIHRoaXMuY2FyZExpa2VCYWNrZ3JvdW5kLnZpc2libGUgPSB0aGlzLmNhcmRMaWtlQmFja2dyb3VuZC5vcGFjaXR5ID4gMDtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIGludmlzaWJsZSByZWN0YW5nbGUgdGhhdCBtaW1pY3MgYW5kIGV4cGFuZHMgdXBvbiB0aGUgYm91bmRzLiAgVGhlIGFtb3VudCBvZiBkaWxhdGlvbiB3YXNcclxuICAgIC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWQuXHJcbiAgICB0aGlzLmJvdW5kc1JlY3QudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5ib3VuZHNSZWN0LnNldFJlY3RCb3VuZHMoIHRoaXMuY29pbkFuZFRleHRSb290Tm9kZS52aXNpYmxlTG9jYWxCb3VuZHMuZGlsYXRlZCggMyApICk7XHJcbiAgICB0aGlzLmJvdW5kc1JlY3QudmlzaWJsZSA9IHRydWU7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBib3VuZHMgdGhhdCBhcmUgcmVnaXN0ZXJlZCB3aXRoIHRoZSBtb2RlbFxyXG4gICAgdGhpcy51cGRhdGVCb3VuZHNJbk1vZGVsKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiB1cGRhdGUgdGhlIGNvaW4gZmxpcCBhbmltYXRpb24sIHVzZWQgdG8gc2hvdyBvciBoaWRlIHRoZSBjb2luIHZhbHVlc1xyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gc2hvd0NvaW5WYWx1ZXNcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHVwZGF0ZUNvaW5GbGlwQW5pbWF0aW9ucyggc2hvd0NvaW5WYWx1ZXMgKSB7XHJcblxyXG4gICAgaWYgKCB0aGlzLnZpZXdNb2RlUHJvcGVydHkuZ2V0KCkgPT09IFZpZXdNb2RlLkNPSU5TICkge1xyXG4gICAgICBpZiAoIHRoaXMuYWN0aXZlRmxpcEFuaW1hdGlvbiApIHtcclxuICAgICAgICB0aGlzLmFjdGl2ZUZsaXBBbmltYXRpb24uc3RvcCgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCB0YXJnZXRGbGlwU3RhdGUgPSBzaG93Q29pblZhbHVlcyA/IDEgOiAwO1xyXG5cclxuICAgICAgaWYgKCB0aGlzLmZsaXBTdGF0ZVByb3BlcnR5LmdldCgpICE9PSB0YXJnZXRGbGlwU3RhdGUgKSB7XHJcblxyXG4gICAgICAgIC8vIHVzZSBhbiBhbmltYXRpb24gdG8gZGVwaWN0IHRoZSBjb2luIGZsaXBcclxuICAgICAgICB0aGlzLmFjdGl2ZUZsaXBBbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKCB7XHJcbiAgICAgICAgICBkdXJhdGlvbjogQ09JTl9GTElQX1RJTUUsXHJcbiAgICAgICAgICBlYXNpbmc6IEVhc2luZy5DVUJJQ19JTl9PVVQsXHJcbiAgICAgICAgICBzZXRWYWx1ZTogbmV3RmxpcFN0YXRlID0+IHtcclxuICAgICAgICAgICAgdGhpcy5mbGlwU3RhdGVQcm9wZXJ0eS5zZXQoIG5ld0ZsaXBTdGF0ZSApO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGZyb206IHRoaXMuZmxpcFN0YXRlUHJvcGVydHkuZ2V0KCksXHJcbiAgICAgICAgICB0bzogdGFyZ2V0RmxpcFN0YXRlXHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlRmxpcEFuaW1hdGlvbi5maW5pc2hFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmFjdGl2ZUZsaXBBbmltYXRpb24gPSBudWxsO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgICB0aGlzLmFjdGl2ZUZsaXBBbmltYXRpb24uc3RhcnQoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBkbyB0aGUgY2hhbmdlIGltbWVkaWF0ZWx5LCBoZWFkcyBpZiBOT1Qgc2hvd2luZyBjb2luIHZhbHVlcywgdGFpbHMgaWYgd2UgYXJlXHJcbiAgICAgIHRoaXMuZmxpcFN0YXRlUHJvcGVydHkuc2V0KCBzaG93Q29pblZhbHVlcyA/IDEgOiAwICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiB1cGRhdGUgdGhlIHNjYWxlIGFuZCB2aXNpYmlsaXR5IG9mIHRoZSBpbWFnZXMgaW4gb3JkZXIgdG8gbWFrZSBpdCBsb29rIGxpa2UgdGhlIGNvaW4gaXMgZmxpcHBpbmcsIHdvcmtzIGluXHJcbiAgICogY29uanVuY3Rpb24gd2l0aCB0aGUgXCJmbGlwU3RhdGVcIiB2YXJpYWJsZSB0byBwZXJmb3JtIHRoZSBmbGlwIGFuaW1hdGlvblxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBmbGlwU3RhdGVcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHVwZGF0ZUZsaXBBcHBlYXJhbmNlKCBmbGlwU3RhdGUgKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5jb2luQmFja0ltYWdlTm9kZSwgJ29wdGlvbnMgd2VyZSBub3QgY29ycmVjdGx5IHNldCBvbiB0aGlzIG5vZGUgdG8gc3VwcG9ydCBjb2luIGZsaXAnICk7XHJcblxyXG4gICAgLy8gVXNlIHRoZSB5IHNjYWxlIGFzIHRoZSAnZnVsbCBzY2FsZScgdmFsdWUuICBUaGlzIGFzc3VtZXMgdGhhdCB0aGUgdHdvIGltYWdlcyBhcmUgdGhlIHNhbWUgc2l6ZSwgdGhhdCB0aGV5IGFyZVxyXG4gICAgLy8gZXF1YWwgaW4gd2lkdGggYW5kIGhlaWdodCB3aGVuIHVuc2NhbGVkLCBhbmQgdGhhdCB0aGUgWSBkaW1lbnNpb24gaXMgbm90IGJlaW5nIHNjYWxlZC5cclxuICAgIGNvbnN0IGZ1bGxTY2FsZSA9IHRoaXMuY29pbkZyb250SW1hZ2VOb2RlLmdldFNjYWxlVmVjdG9yKCkueTtcclxuXHJcbiAgICBjb25zdCBjZW50ZXJYID0gdGhpcy5jb2luVGVybS5jb2luUmFkaXVzO1xyXG5cclxuICAgIC8vIHNldCB0aGUgd2lkdGggb2YgdGhlIGZyb250IGltYWdlXHJcbiAgICB0aGlzLmNvaW5Gcm9udEltYWdlTm9kZS5zZXRTY2FsZU1hZ25pdHVkZShcclxuICAgICAgTWF0aC5tYXgoICggMSAtIDIgKiBmbGlwU3RhdGUgKSAqIGZ1bGxTY2FsZSwgTUlOX1NDQUxFX0ZPUl9GTElQICksXHJcbiAgICAgIGZ1bGxTY2FsZVxyXG4gICAgKTtcclxuICAgIHRoaXMuY29pbkZyb250SW1hZ2VOb2RlLmNlbnRlclggPSBjZW50ZXJYO1xyXG5cclxuICAgIC8vIHNldCB0aGUgd2lkdGggb2YgdGhlIGJhY2sgaW1hZ2VcclxuICAgIHRoaXMuY29pbkJhY2tJbWFnZU5vZGUuc2V0U2NhbGVNYWduaXR1ZGUoXHJcbiAgICAgIE1hdGgubWF4KCAyICogKCBmbGlwU3RhdGUgLSAwLjUgKSAqIGZ1bGxTY2FsZSwgTUlOX1NDQUxFX0ZPUl9GTElQICksXHJcbiAgICAgIGZ1bGxTY2FsZVxyXG4gICAgKTtcclxuICAgIHRoaXMuY29pbkJhY2tJbWFnZU5vZGUuY2VudGVyWCA9IGNlbnRlclg7XHJcblxyXG4gICAgLy8gc2V0IHRoZSB3aWR0aCBvZiB0aGUgY29pbiB2YWx1ZSB0ZXh0XHJcbiAgICB0aGlzLmNvaW5WYWx1ZVRleHQuc2V0U2NhbGVNYWduaXR1ZGUoIE1hdGgubWF4KCAyICogKCBmbGlwU3RhdGUgLSAwLjUgKSwgTUlOX1NDQUxFX0ZPUl9GTElQICksIDEgKTtcclxuICAgIHRoaXMuY29pblZhbHVlVGV4dC5jZW50ZXJYID0gdGhpcy5jb2luVGVybS5jb2luUmFkaXVzO1xyXG5cclxuICAgIC8vIHNldCB2aXNpYmlsaXR5IG9mIGJvdGggaW1hZ2VzIGFuZCB0aGUgdmFsdWUgdGV4dFxyXG4gICAgdGhpcy5jb2luRnJvbnRJbWFnZU5vZGUudmlzaWJsZSA9IGZsaXBTdGF0ZSA8PSAwLjU7XHJcbiAgICB0aGlzLmNvaW5CYWNrSW1hZ2VOb2RlLnZpc2libGUgPSBmbGlwU3RhdGUgPj0gMC41O1xyXG4gICAgdGhpcy5jb2luVmFsdWVUZXh0LnZpc2libGUgPSB0aGlzLmNvaW5CYWNrSW1hZ2VOb2RlLnZpc2libGU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHRoaXMuZGlzcG9zZVZhcmlhYmxlQ29pblRlcm1Ob2RlKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5leHByZXNzaW9uRXhjaGFuZ2UucmVnaXN0ZXIoICdWYXJpYWJsZUNvaW5UZXJtTm9kZScsIFZhcmlhYmxlQ29pblRlcm1Ob2RlICk7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