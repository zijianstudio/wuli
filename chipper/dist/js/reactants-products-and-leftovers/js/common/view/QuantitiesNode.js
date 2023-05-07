// Copyright 2014-2023, University of Colorado Boulder

/**
 * The 'quantities' interface includes everything that's displayed below the Before/After boxes.
 * It indicates the quantities of reactants, products and leftovers, and allows interaction
 * with either the Before or After quantities.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import BracketNode from '../../../../scenery-phet/js/BracketNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, RichText, Text } from '../../../../scenery/js/imports.js';
import NumberSpinner from '../../../../sun/js/NumberSpinner.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
import ReactantsProductsAndLeftoversStrings from '../../ReactantsProductsAndLeftoversStrings.js';
import BoxType from '../model/BoxType.js';
import RPALColors from '../RPALColors.js';
import RPALConstants from '../RPALConstants.js';
import HideBox from './HideBox.js';
import NumberNode from './NumberNode.js';
import SubstanceIcon from './SubstanceIcon.js';
const NUMBER_SPINNER_OPTIONS = RPALConstants.NUMBER_SPINNER_OPTIONS;
const QUANTITY_FONT = new PhetFont(28); // font for the quantities that appear below the boxes
const SYMBOL_FONT = new PhetFont(16); // font for the symbols that appear below the boxes
const QUANTITY_IMAGE_Y_SPACING = 4; // vertical space between quantity and image
const IMAGE_SYMBOL_Y_SPACING = 2; // vertical space between image and symbol
const BRACKET_Y_SPACING = 1; // vertical space between the brackets and whatever is directly above it
const BRACKET_X_MARGIN = 6; // amount that brackets extend beyond the things they bracket
const BRACKET_TEXT_OPTIONS = {
  font: new PhetFont(12),
  fill: 'black',
  maxWidth: 140 // maximum width of bracket labels, determined empirically
};

export default class QuantitiesNode extends Node {
  // reactants, below the 'Before' box
  // products, below the 'After' box
  // leftovers, below the 'After' box, to the right of the products
  // 'Hide numbers' box, to hide static quantities

  /**
   * @param reactants
   * @param products
   * @param leftovers
   * @param beforeXOffsets - offsets of reactants relative to the left edge of the 'Before' box
   * @param afterXOffsets - offsets of products and leftovers relative to the left edge of the 'Before' box
   * @param [providedOptions]
   */
  constructor(reactants, products, leftovers, beforeXOffsets, afterXOffsets, providedOptions) {
    assert && assert(reactants.length === beforeXOffsets.length);
    assert && assert(products.length + leftovers.length === afterXOffsets.length);
    const options = optionize()({
      // SelfOptions
      interactiveBox: BoxType.BEFORE,
      // interactiveBox which box is interactive
      boxWidth: 100,
      // width of the Before and After boxes
      afterBoxXOffset: 200,
      // x-offset of left of After box, relative to left of Before box
      quantityRange: RPALConstants.QUANTITY_RANGE,
      // range of spinners
      hideNumbersBox: false,
      // should we include a 'hide box' to cover the static numbers?
      minIconSize: new Dimension2(0, 0),
      // minimum amount of layout space reserved for Substance icons
      showSymbols: true // whether to show symbols (eg, H2O) for the substances in the reactions
    }, providedOptions);
    const afterQuantitiesNodeTandem = options.tandem.createTandem('afterQuantitiesNode');
    const beforeQuantitiesNodeTandem = options.tandem.createTandem('beforeQuantitiesNode');

    // Keep track of components that appear below the boxes, so we can handle their vertical alignment.
    const spinnerNodes = [];
    const beforeNumberNodes = [];
    const afterNumberNodes = [];
    const iconNodes = [];
    const symbolNodes = [];

    // reactants, below the 'Before' box
    const reactantsParent = new Node();
    for (let i = 0; i < reactants.length; i++) {
      const reactant = reactants[i];
      const centerX = beforeXOffsets[i];
      if (options.interactiveBox === BoxType.BEFORE) {
        // spinner
        const spinnerNode = new NumberSpinner(reactant.quantityProperty, new Property(options.quantityRange), combineOptions({
          centerX: centerX
        }, NUMBER_SPINNER_OPTIONS));
        reactantsParent.addChild(spinnerNode);
        spinnerNodes.push(spinnerNode);
      } else {
        // static number
        const numberNode = new NumberNode(reactant.quantityProperty, {
          font: QUANTITY_FONT,
          centerX: centerX
        });
        reactantsParent.addChild(numberNode);
        beforeNumberNodes.push(numberNode);
      }

      // substance icon
      const iconNode = new SubstanceIcon(reactant.iconProperty, {
        centerX: centerX
      });
      reactantsParent.addChild(iconNode);
      iconNodes.push(iconNode);

      // symbol
      if (options.showSymbols) {
        const symbolNode = new RichText(StringUtils.wrapLTR(reactant.symbol), {
          font: SYMBOL_FONT,
          centerX: centerX
        });
        reactantsParent.addChild(symbolNode);
        symbolNodes.push(symbolNode);
      }
    }

    // products, below the 'After' box
    const productsParent = new Node();
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const centerX = options.afterBoxXOffset + afterXOffsets[i];
      if (options.interactiveBox === BoxType.AFTER) {
        // spinner
        const spinnerNode = new NumberSpinner(product.quantityProperty, new Property(options.quantityRange), combineOptions({
          centerX: centerX
        }, NUMBER_SPINNER_OPTIONS));
        productsParent.addChild(spinnerNode);
        spinnerNodes.push(spinnerNode);
      } else {
        // static number
        const numberNode = new NumberNode(product.quantityProperty, {
          font: QUANTITY_FONT,
          centerX: centerX
        });
        productsParent.addChild(numberNode);
        afterNumberNodes.push(numberNode);
      }

      // substance icon
      const iconNode = new SubstanceIcon(product.iconProperty, {
        centerX: centerX
      });
      productsParent.addChild(iconNode);
      iconNodes.push(iconNode);

      // symbol
      if (options.showSymbols) {
        const symbolNode = new RichText(product.symbol, {
          font: SYMBOL_FONT,
          centerX: centerX
        });
        productsParent.addChild(symbolNode);
        symbolNodes.push(symbolNode);
      }
    }

    // leftovers, below the 'After' box, to the right of the products
    const leftoversParent = new Node();
    for (let i = 0; i < leftovers.length; i++) {
      const leftover = leftovers[i];
      const centerX = options.afterBoxXOffset + afterXOffsets[i + products.length]; // leftovers follow products in afterXOffsets

      if (options.interactiveBox === BoxType.AFTER) {
        // spinner
        const spinnerNode = new NumberSpinner(leftover.quantityProperty, new Property(options.quantityRange), combineOptions({
          centerX: centerX
        }, NUMBER_SPINNER_OPTIONS));
        leftoversParent.addChild(spinnerNode);
        spinnerNodes.push(spinnerNode);
      } else {
        // static number
        const numberNode = new NumberNode(leftover.quantityProperty, {
          font: QUANTITY_FONT,
          centerX: centerX
        });
        leftoversParent.addChild(numberNode);
        afterNumberNodes.push(numberNode);
      }

      // substance icon
      const iconNode = new SubstanceIcon(leftover.iconProperty, {
        centerX: centerX
      });
      leftoversParent.addChild(iconNode);
      iconNodes.push(iconNode);

      // symbol
      if (options.showSymbols) {
        const symbolNode = new RichText(leftover.symbol, {
          font: SYMBOL_FONT,
          centerX: centerX
        });
        leftoversParent.addChild(symbolNode);
        symbolNodes.push(symbolNode);
      }
    }

    /*
     * Vertical layout of components below the boxes.
     * Ensures that all similar components (spinners, numbers, icons, symbols) are vertically centered.
     */
    const spinnerHeight = spinnerNodes[0].height;
    const maxIconHeight = Math.max(options.minIconSize.height, _.maxBy(iconNodes, node => node.height).height);
    const maxSymbolHeight = symbolNodes.length ? _.maxBy(symbolNodes, node => node.height).height : 0;
    spinnerNodes.forEach(spinnerNode => {
      spinnerNode.centerY = spinnerHeight / 2;
    });
    beforeNumberNodes.forEach(numberNode => {
      numberNode.centerY = spinnerHeight / 2;
    });
    afterNumberNodes.forEach(numberNode => {
      numberNode.centerY = spinnerHeight / 2;
    });
    iconNodes.forEach(iconNode => {
      iconNode.centerY = spinnerHeight + QUANTITY_IMAGE_Y_SPACING + maxIconHeight / 2;
    });
    if (options.showSymbols) {
      symbolNodes.forEach(symbolNode => {
        symbolNode.top = spinnerHeight + QUANTITY_IMAGE_Y_SPACING + maxIconHeight + IMAGE_SYMBOL_Y_SPACING;
      });
    }

    // top of brackets is relative to the bottom of the stuff above
    let bracketsTop = spinnerHeight + QUANTITY_IMAGE_Y_SPACING + maxIconHeight + BRACKET_Y_SPACING;
    if (options.showSymbols) {
      bracketsTop += maxSymbolHeight + IMAGE_SYMBOL_Y_SPACING;
    }

    // 'Reactants' bracket
    const reactantsText = new Text(ReactantsProductsAndLeftoversStrings.reactantsStringProperty, combineOptions({
      tandem: beforeQuantitiesNodeTandem.createTandem('reactantsText')
    }, BRACKET_TEXT_OPTIONS));
    const reactantsBracket = new BracketNode({
      bracketStroke: RPALColors.BRACKET_NODE_STROKE,
      labelNode: reactantsText,
      bracketLength: Math.max(options.minIconSize.width, reactantsParent.width + 2 * BRACKET_X_MARGIN),
      centerX: reactantsParent.centerX,
      top: bracketsTop
    });

    // 'Products' bracket
    const productsText = new Text(ReactantsProductsAndLeftoversStrings.productsStringProperty, combineOptions({
      tandem: afterQuantitiesNodeTandem.createTandem('productsText')
    }, BRACKET_TEXT_OPTIONS));
    const productsBracket = new BracketNode({
      bracketStroke: RPALColors.BRACKET_NODE_STROKE,
      labelNode: productsText,
      bracketLength: Math.max(options.minIconSize.width, productsParent.width + 2 * BRACKET_X_MARGIN),
      centerX: productsParent.centerX,
      top: bracketsTop
    });

    // 'Leftovers' bracket
    const leftoversText = new Text(ReactantsProductsAndLeftoversStrings.leftoversStringProperty, combineOptions({
      tandem: afterQuantitiesNodeTandem.createTandem('leftoversText')
    }, BRACKET_TEXT_OPTIONS));
    const leftoversBracket = new BracketNode({
      bracketStroke: RPALColors.BRACKET_NODE_STROKE,
      labelNode: leftoversText,
      bracketLength: Math.max(options.minIconSize.width, leftoversParent.width + 2 * BRACKET_X_MARGIN),
      centerX: leftoversParent.centerX,
      top: bracketsTop
    });

    // 'Hide numbers' box on top of the static quantities
    const hideNumbersBox = new HideBox({
      visible: options.hideNumbersBox,
      boxSize: new Dimension2(options.boxWidth, spinnerHeight),
      iconHeight: 0.65 * spinnerHeight,
      cornerRadius: 3,
      left: options.interactiveBox === BoxType.BEFORE ? options.afterBoxXOffset : 0,
      centerY: spinnerNodes[0].centerY
    });
    const beforeQuantitiesNode = new Node({
      children: [reactantsParent, reactantsBracket],
      tandem: beforeQuantitiesNodeTandem
    });
    const afterQuantitiesNode = new Node({
      children: [productsParent, leftoversParent, productsBracket, leftoversBracket],
      tandem: afterQuantitiesNodeTandem
    });
    options.children = [beforeQuantitiesNode, afterQuantitiesNode, hideNumbersBox];
    super(options);
    this.reactants = reactants;
    this.products = products;
    this.leftovers = leftovers;
    this.interactiveBox = options.interactiveBox;
    this.spinnerNodes = spinnerNodes;
    this.beforeNumberNodes = beforeNumberNodes;
    this.afterNumberNodes = afterNumberNodes;
    this.reactantsParent = reactantsParent;
    this.productsParent = productsParent;
    this.leftoversParent = leftoversParent;
    this.hideNumbersBox = hideNumbersBox;
    this.disposeQuantitiesNode = () => {
      reactantsText.dispose();
      productsText.dispose();
      leftoversText.dispose();
      this.spinnerNodes.forEach(node => node.dispose());
      this.beforeNumberNodes.forEach(node => node.dispose());
      this.afterNumberNodes.forEach(node => node.dispose());
      iconNodes.forEach(node => node.dispose());
    };
  }
  dispose() {
    this.disposeQuantitiesNode();
    super.dispose();
  }

  /**
   * Determines whether this UI component is interactive (true on creation).
   * When it's interactive, spinners are visible; when not, static numbers are visible.
   * Static numbers are created on demand, so that we don't have unnecessary nodes for situations
   * that are always interactive, and to improve performance on creation.
   */
  setInteractive(interactive) {
    // spinners
    this.spinnerNodes.forEach(spinnerNode => {
      spinnerNode.visible = interactive;
    });
    const centerY = this.spinnerNodes[0].height / 2;
    if (this.interactiveBox === BoxType.BEFORE) {
      // reactants, create static numbers on demand
      if (!interactive && this.beforeNumberNodes.length === 0) {
        for (let i = 0; i < this.reactants.length; i++) {
          const centerX = this.spinnerNodes[i].centerX;
          const numberNode = new NumberNode(this.reactants[i].quantityProperty, {
            font: QUANTITY_FONT,
            centerX: centerX,
            centerY: centerY
          });
          this.reactantsParent.addChild(numberNode);
          this.beforeNumberNodes.push(numberNode);
        }
      }

      // visibility
      if (this.beforeNumberNodes.length > 0) {
        this.beforeNumberNodes.forEach(node => {
          node.visible = !interactive;
        });
      }
    } else {
      // create static numbers on demand
      if (!interactive && this.afterNumberNodes.length === 0) {
        // products
        for (let i = 0; i < this.products.length; i++) {
          const centerX = this.spinnerNodes[i].centerX;
          const numberNode = new NumberNode(this.products[i].quantityProperty, {
            font: QUANTITY_FONT,
            centerX: centerX,
            centerY: centerY
          });
          this.productsParent.addChild(numberNode);
          this.afterNumberNodes.push(numberNode);
        }

        // leftovers
        for (let i = 0; i < this.leftovers.length; i++) {
          const centerX = this.spinnerNodes[i + this.products.length].centerX; // leftover spinners follow product spinners
          const numberNode = new NumberNode(this.leftovers[i].quantityProperty, {
            font: QUANTITY_FONT,
            centerX: centerX,
            centerY: centerY
          });
          this.leftoversParent.addChild(numberNode);
          this.afterNumberNodes.push(numberNode);
        }
      }

      // visibility
      if (this.afterNumberNodes.length > 0) {
        this.afterNumberNodes.forEach(node => {
          node.visible = !interactive;
        });
      }
    }
  }

  /**
   * Changes visibility of the 'Hide numbers' box.
   */
  setHideNumbersBoxVisible(visible) {
    this.hideNumbersBox.visible = visible;
  }

  /**
   * Creates x-offsets for substances, relative to the left edge of their 'Before' or 'After' box.
   */
  static createXOffsets(numberOfSubstances, boxWidth) {
    assert && assert(Number.isInteger(numberOfSubstances) && numberOfSubstances > 0);
    assert && assert(boxWidth > 0);
    const xOffsets = [];
    const xMargin = numberOfSubstances > 2 ? 0 : 0.15 * boxWidth; // make 2-reactant case look nice
    const deltaX = (boxWidth - 2 * xMargin) / numberOfSubstances;
    let xOffset = xMargin + deltaX / 2;
    for (let i = 0; i < numberOfSubstances; i++) {
      xOffsets.push(xOffset);
      xOffset += deltaX;
    }
    return xOffsets;
  }
}
reactantsProductsAndLeftovers.register('QuantitiesNode', QuantitiesNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIlN0cmluZ1V0aWxzIiwiQnJhY2tldE5vZGUiLCJQaGV0Rm9udCIsIk5vZGUiLCJSaWNoVGV4dCIsIlRleHQiLCJOdW1iZXJTcGlubmVyIiwicmVhY3RhbnRzUHJvZHVjdHNBbmRMZWZ0b3ZlcnMiLCJSZWFjdGFudHNQcm9kdWN0c0FuZExlZnRvdmVyc1N0cmluZ3MiLCJCb3hUeXBlIiwiUlBBTENvbG9ycyIsIlJQQUxDb25zdGFudHMiLCJIaWRlQm94IiwiTnVtYmVyTm9kZSIsIlN1YnN0YW5jZUljb24iLCJOVU1CRVJfU1BJTk5FUl9PUFRJT05TIiwiUVVBTlRJVFlfRk9OVCIsIlNZTUJPTF9GT05UIiwiUVVBTlRJVFlfSU1BR0VfWV9TUEFDSU5HIiwiSU1BR0VfU1lNQk9MX1lfU1BBQ0lORyIsIkJSQUNLRVRfWV9TUEFDSU5HIiwiQlJBQ0tFVF9YX01BUkdJTiIsIkJSQUNLRVRfVEVYVF9PUFRJT05TIiwiZm9udCIsImZpbGwiLCJtYXhXaWR0aCIsIlF1YW50aXRpZXNOb2RlIiwiY29uc3RydWN0b3IiLCJyZWFjdGFudHMiLCJwcm9kdWN0cyIsImxlZnRvdmVycyIsImJlZm9yZVhPZmZzZXRzIiwiYWZ0ZXJYT2Zmc2V0cyIsInByb3ZpZGVkT3B0aW9ucyIsImFzc2VydCIsImxlbmd0aCIsIm9wdGlvbnMiLCJpbnRlcmFjdGl2ZUJveCIsIkJFRk9SRSIsImJveFdpZHRoIiwiYWZ0ZXJCb3hYT2Zmc2V0IiwicXVhbnRpdHlSYW5nZSIsIlFVQU5USVRZX1JBTkdFIiwiaGlkZU51bWJlcnNCb3giLCJtaW5JY29uU2l6ZSIsInNob3dTeW1ib2xzIiwiYWZ0ZXJRdWFudGl0aWVzTm9kZVRhbmRlbSIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsImJlZm9yZVF1YW50aXRpZXNOb2RlVGFuZGVtIiwic3Bpbm5lck5vZGVzIiwiYmVmb3JlTnVtYmVyTm9kZXMiLCJhZnRlck51bWJlck5vZGVzIiwiaWNvbk5vZGVzIiwic3ltYm9sTm9kZXMiLCJyZWFjdGFudHNQYXJlbnQiLCJpIiwicmVhY3RhbnQiLCJjZW50ZXJYIiwic3Bpbm5lck5vZGUiLCJxdWFudGl0eVByb3BlcnR5IiwiYWRkQ2hpbGQiLCJwdXNoIiwibnVtYmVyTm9kZSIsImljb25Ob2RlIiwiaWNvblByb3BlcnR5Iiwic3ltYm9sTm9kZSIsIndyYXBMVFIiLCJzeW1ib2wiLCJwcm9kdWN0c1BhcmVudCIsInByb2R1Y3QiLCJBRlRFUiIsImxlZnRvdmVyc1BhcmVudCIsImxlZnRvdmVyIiwic3Bpbm5lckhlaWdodCIsImhlaWdodCIsIm1heEljb25IZWlnaHQiLCJNYXRoIiwibWF4IiwiXyIsIm1heEJ5Iiwibm9kZSIsIm1heFN5bWJvbEhlaWdodCIsImZvckVhY2giLCJjZW50ZXJZIiwidG9wIiwiYnJhY2tldHNUb3AiLCJyZWFjdGFudHNUZXh0IiwicmVhY3RhbnRzU3RyaW5nUHJvcGVydHkiLCJyZWFjdGFudHNCcmFja2V0IiwiYnJhY2tldFN0cm9rZSIsIkJSQUNLRVRfTk9ERV9TVFJPS0UiLCJsYWJlbE5vZGUiLCJicmFja2V0TGVuZ3RoIiwid2lkdGgiLCJwcm9kdWN0c1RleHQiLCJwcm9kdWN0c1N0cmluZ1Byb3BlcnR5IiwicHJvZHVjdHNCcmFja2V0IiwibGVmdG92ZXJzVGV4dCIsImxlZnRvdmVyc1N0cmluZ1Byb3BlcnR5IiwibGVmdG92ZXJzQnJhY2tldCIsInZpc2libGUiLCJib3hTaXplIiwiaWNvbkhlaWdodCIsImNvcm5lclJhZGl1cyIsImxlZnQiLCJiZWZvcmVRdWFudGl0aWVzTm9kZSIsImNoaWxkcmVuIiwiYWZ0ZXJRdWFudGl0aWVzTm9kZSIsImRpc3Bvc2VRdWFudGl0aWVzTm9kZSIsImRpc3Bvc2UiLCJzZXRJbnRlcmFjdGl2ZSIsImludGVyYWN0aXZlIiwic2V0SGlkZU51bWJlcnNCb3hWaXNpYmxlIiwiY3JlYXRlWE9mZnNldHMiLCJudW1iZXJPZlN1YnN0YW5jZXMiLCJOdW1iZXIiLCJpc0ludGVnZXIiLCJ4T2Zmc2V0cyIsInhNYXJnaW4iLCJkZWx0YVgiLCJ4T2Zmc2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJRdWFudGl0aWVzTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgJ3F1YW50aXRpZXMnIGludGVyZmFjZSBpbmNsdWRlcyBldmVyeXRoaW5nIHRoYXQncyBkaXNwbGF5ZWQgYmVsb3cgdGhlIEJlZm9yZS9BZnRlciBib3hlcy5cclxuICogSXQgaW5kaWNhdGVzIHRoZSBxdWFudGl0aWVzIG9mIHJlYWN0YW50cywgcHJvZHVjdHMgYW5kIGxlZnRvdmVycywgYW5kIGFsbG93cyBpbnRlcmFjdGlvblxyXG4gKiB3aXRoIGVpdGhlciB0aGUgQmVmb3JlIG9yIEFmdGVyIHF1YW50aXRpZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgQnJhY2tldE5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0JyYWNrZXROb2RlLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIE5vZGVPcHRpb25zLCBOb2RlVHJhbnNsYXRpb25PcHRpb25zLCBSaWNoVGV4dCwgVGV4dCwgVGV4dE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgTnVtYmVyU3Bpbm5lciwgeyBOdW1iZXJTcGlubmVyT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9OdW1iZXJTcGlubmVyLmpzJztcclxuaW1wb3J0IHJlYWN0YW50c1Byb2R1Y3RzQW5kTGVmdG92ZXJzIGZyb20gJy4uLy4uL3JlYWN0YW50c1Byb2R1Y3RzQW5kTGVmdG92ZXJzLmpzJztcclxuaW1wb3J0IFJlYWN0YW50c1Byb2R1Y3RzQW5kTGVmdG92ZXJzU3RyaW5ncyBmcm9tICcuLi8uLi9SZWFjdGFudHNQcm9kdWN0c0FuZExlZnRvdmVyc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgQm94VHlwZSBmcm9tICcuLi9tb2RlbC9Cb3hUeXBlLmpzJztcclxuaW1wb3J0IFN1YnN0YW5jZSBmcm9tICcuLi9tb2RlbC9TdWJzdGFuY2UuanMnO1xyXG5pbXBvcnQgUlBBTENvbG9ycyBmcm9tICcuLi9SUEFMQ29sb3JzLmpzJztcclxuaW1wb3J0IFJQQUxDb25zdGFudHMgZnJvbSAnLi4vUlBBTENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBIaWRlQm94IGZyb20gJy4vSGlkZUJveC5qcyc7XHJcbmltcG9ydCBOdW1iZXJOb2RlIGZyb20gJy4vTnVtYmVyTm9kZS5qcyc7XHJcbmltcG9ydCBTdWJzdGFuY2VJY29uIGZyb20gJy4vU3Vic3RhbmNlSWNvbi5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcblxyXG5jb25zdCBOVU1CRVJfU1BJTk5FUl9PUFRJT05TID0gUlBBTENvbnN0YW50cy5OVU1CRVJfU1BJTk5FUl9PUFRJT05TO1xyXG5jb25zdCBRVUFOVElUWV9GT05UID0gbmV3IFBoZXRGb250KCAyOCApOyAvLyBmb250IGZvciB0aGUgcXVhbnRpdGllcyB0aGF0IGFwcGVhciBiZWxvdyB0aGUgYm94ZXNcclxuY29uc3QgU1lNQk9MX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDE2ICk7IC8vIGZvbnQgZm9yIHRoZSBzeW1ib2xzIHRoYXQgYXBwZWFyIGJlbG93IHRoZSBib3hlc1xyXG5jb25zdCBRVUFOVElUWV9JTUFHRV9ZX1NQQUNJTkcgPSA0OyAvLyB2ZXJ0aWNhbCBzcGFjZSBiZXR3ZWVuIHF1YW50aXR5IGFuZCBpbWFnZVxyXG5jb25zdCBJTUFHRV9TWU1CT0xfWV9TUEFDSU5HID0gMjsgLy8gdmVydGljYWwgc3BhY2UgYmV0d2VlbiBpbWFnZSBhbmQgc3ltYm9sXHJcbmNvbnN0IEJSQUNLRVRfWV9TUEFDSU5HID0gMTsgLy8gdmVydGljYWwgc3BhY2UgYmV0d2VlbiB0aGUgYnJhY2tldHMgYW5kIHdoYXRldmVyIGlzIGRpcmVjdGx5IGFib3ZlIGl0XHJcbmNvbnN0IEJSQUNLRVRfWF9NQVJHSU4gPSA2OyAvLyBhbW91bnQgdGhhdCBicmFja2V0cyBleHRlbmQgYmV5b25kIHRoZSB0aGluZ3MgdGhleSBicmFja2V0XHJcbmNvbnN0IEJSQUNLRVRfVEVYVF9PUFRJT05TID0ge1xyXG4gIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTIgKSxcclxuICBmaWxsOiAnYmxhY2snLFxyXG4gIG1heFdpZHRoOiAxNDAgLy8gbWF4aW11bSB3aWR0aCBvZiBicmFja2V0IGxhYmVscywgZGV0ZXJtaW5lZCBlbXBpcmljYWxseVxyXG59O1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBpbnRlcmFjdGl2ZUJveD86IEJveFR5cGU7IC8vIHdoaWNoIGJveCBpcyBpbnRlcmFjdGl2ZSAoQmVmb3JlIG9yIEFmdGVyKVxyXG4gIGJveFdpZHRoPzogbnVtYmVyOyAvLyB3aWR0aCBvZiB0aGUgQmVmb3JlIGFuZCBBZnRlciBib3hlc1xyXG4gIGFmdGVyQm94WE9mZnNldD86IG51bWJlcjsgLy8geC1vZmZzZXQgb2YgbGVmdCBvZiBBZnRlciBib3gsIHJlbGF0aXZlIHRvIGxlZnQgb2YgQmVmb3JlIGJveFxyXG4gIHF1YW50aXR5UmFuZ2U/OiBSYW5nZTsgLy8gcmFuZ2Ugb2Ygc3Bpbm5lcnNcclxuICBoaWRlTnVtYmVyc0JveD86IGJvb2xlYW47IC8vIHNob3VsZCB3ZSBpbmNsdWRlIGEgJ2hpZGUgYm94JyB0byBjb3ZlciB0aGUgc3RhdGljIG51bWJlcnM/XHJcbiAgbWluSWNvblNpemU/OiBEaW1lbnNpb24yOyAvLyBtaW5pbXVtIGFtb3VudCBvZiBsYXlvdXQgc3BhY2UgcmVzZXJ2ZWQgZm9yIFN1YnN0YW5jZSBpY29uc1xyXG4gIHNob3dTeW1ib2xzPzogYm9vbGVhbjsgLy8gd2hldGhlciB0byBzaG93IHN5bWJvbHMgKGVnLCBIMk8pIGZvciB0aGUgc3Vic3RhbmNlcyBpbiB0aGUgcmVhY3Rpb25zXHJcbn07XHJcblxyXG50eXBlIFF1YW50aXRpZXNOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZVRyYW5zbGF0aW9uT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxOb2RlT3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUXVhbnRpdGllc05vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSByZWFjdGFudHM6IFN1YnN0YW5jZVtdO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgcHJvZHVjdHM6IFN1YnN0YW5jZVtdO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgbGVmdG92ZXJzOiBTdWJzdGFuY2VbXTtcclxuICBwcml2YXRlIHJlYWRvbmx5IGludGVyYWN0aXZlQm94OiBCb3hUeXBlO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgc3Bpbm5lck5vZGVzOiBOdW1iZXJTcGlubmVyW107XHJcbiAgcHJpdmF0ZSByZWFkb25seSBiZWZvcmVOdW1iZXJOb2RlczogTnVtYmVyTm9kZVtdO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgYWZ0ZXJOdW1iZXJOb2RlczogTnVtYmVyTm9kZVtdO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgcmVhY3RhbnRzUGFyZW50OiBOb2RlOyAvLyByZWFjdGFudHMsIGJlbG93IHRoZSAnQmVmb3JlJyBib3hcclxuICBwcml2YXRlIHJlYWRvbmx5IHByb2R1Y3RzUGFyZW50OiBOb2RlOyAvLyBwcm9kdWN0cywgYmVsb3cgdGhlICdBZnRlcicgYm94XHJcbiAgcHJpdmF0ZSByZWFkb25seSBsZWZ0b3ZlcnNQYXJlbnQ6IE5vZGU7IC8vIGxlZnRvdmVycywgYmVsb3cgdGhlICdBZnRlcicgYm94LCB0byB0aGUgcmlnaHQgb2YgdGhlIHByb2R1Y3RzXHJcbiAgcHJpdmF0ZSByZWFkb25seSBoaWRlTnVtYmVyc0JveDogTm9kZTsgLy8gJ0hpZGUgbnVtYmVycycgYm94LCB0byBoaWRlIHN0YXRpYyBxdWFudGl0aWVzXHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZVF1YW50aXRpZXNOb2RlOiAoKSA9PiB2b2lkO1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gcmVhY3RhbnRzXHJcbiAgICogQHBhcmFtIHByb2R1Y3RzXHJcbiAgICogQHBhcmFtIGxlZnRvdmVyc1xyXG4gICAqIEBwYXJhbSBiZWZvcmVYT2Zmc2V0cyAtIG9mZnNldHMgb2YgcmVhY3RhbnRzIHJlbGF0aXZlIHRvIHRoZSBsZWZ0IGVkZ2Ugb2YgdGhlICdCZWZvcmUnIGJveFxyXG4gICAqIEBwYXJhbSBhZnRlclhPZmZzZXRzIC0gb2Zmc2V0cyBvZiBwcm9kdWN0cyBhbmQgbGVmdG92ZXJzIHJlbGF0aXZlIHRvIHRoZSBsZWZ0IGVkZ2Ugb2YgdGhlICdCZWZvcmUnIGJveFxyXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcmVhY3RhbnRzOiBTdWJzdGFuY2VbXSwgcHJvZHVjdHM6IFN1YnN0YW5jZVtdLCBsZWZ0b3ZlcnM6IFN1YnN0YW5jZVtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgYmVmb3JlWE9mZnNldHM6IG51bWJlcltdLCBhZnRlclhPZmZzZXRzOiBudW1iZXJbXSwgcHJvdmlkZWRPcHRpb25zPzogUXVhbnRpdGllc05vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJlYWN0YW50cy5sZW5ndGggPT09IGJlZm9yZVhPZmZzZXRzLmxlbmd0aCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcHJvZHVjdHMubGVuZ3RoICsgbGVmdG92ZXJzLmxlbmd0aCA9PT0gYWZ0ZXJYT2Zmc2V0cy5sZW5ndGggKTtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFF1YW50aXRpZXNOb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBTZWxmT3B0aW9uc1xyXG4gICAgICBpbnRlcmFjdGl2ZUJveDogQm94VHlwZS5CRUZPUkUsIC8vIGludGVyYWN0aXZlQm94IHdoaWNoIGJveCBpcyBpbnRlcmFjdGl2ZVxyXG4gICAgICBib3hXaWR0aDogMTAwLCAvLyB3aWR0aCBvZiB0aGUgQmVmb3JlIGFuZCBBZnRlciBib3hlc1xyXG4gICAgICBhZnRlckJveFhPZmZzZXQ6IDIwMCwgLy8geC1vZmZzZXQgb2YgbGVmdCBvZiBBZnRlciBib3gsIHJlbGF0aXZlIHRvIGxlZnQgb2YgQmVmb3JlIGJveFxyXG4gICAgICBxdWFudGl0eVJhbmdlOiBSUEFMQ29uc3RhbnRzLlFVQU5USVRZX1JBTkdFLCAvLyByYW5nZSBvZiBzcGlubmVyc1xyXG4gICAgICBoaWRlTnVtYmVyc0JveDogZmFsc2UsICAvLyBzaG91bGQgd2UgaW5jbHVkZSBhICdoaWRlIGJveCcgdG8gY292ZXIgdGhlIHN0YXRpYyBudW1iZXJzP1xyXG4gICAgICBtaW5JY29uU2l6ZTogbmV3IERpbWVuc2lvbjIoIDAsIDAgKSwgLy8gbWluaW11bSBhbW91bnQgb2YgbGF5b3V0IHNwYWNlIHJlc2VydmVkIGZvciBTdWJzdGFuY2UgaWNvbnNcclxuICAgICAgc2hvd1N5bWJvbHM6IHRydWUgLy8gd2hldGhlciB0byBzaG93IHN5bWJvbHMgKGVnLCBIMk8pIGZvciB0aGUgc3Vic3RhbmNlcyBpbiB0aGUgcmVhY3Rpb25zXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBhZnRlclF1YW50aXRpZXNOb2RlVGFuZGVtID0gb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnYWZ0ZXJRdWFudGl0aWVzTm9kZScgKTtcclxuICAgIGNvbnN0IGJlZm9yZVF1YW50aXRpZXNOb2RlVGFuZGVtID0gb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnYmVmb3JlUXVhbnRpdGllc05vZGUnICk7XHJcblxyXG4gICAgLy8gS2VlcCB0cmFjayBvZiBjb21wb25lbnRzIHRoYXQgYXBwZWFyIGJlbG93IHRoZSBib3hlcywgc28gd2UgY2FuIGhhbmRsZSB0aGVpciB2ZXJ0aWNhbCBhbGlnbm1lbnQuXHJcbiAgICBjb25zdCBzcGlubmVyTm9kZXM6IE51bWJlclNwaW5uZXJbXSA9IFtdO1xyXG4gICAgY29uc3QgYmVmb3JlTnVtYmVyTm9kZXM6IE51bWJlck5vZGVbXSA9IFtdO1xyXG4gICAgY29uc3QgYWZ0ZXJOdW1iZXJOb2RlczogTnVtYmVyTm9kZVtdID0gW107XHJcblxyXG4gICAgY29uc3QgaWNvbk5vZGVzOiBOb2RlW10gPSBbXTtcclxuICAgIGNvbnN0IHN5bWJvbE5vZGVzOiBOb2RlW10gPSBbXTtcclxuXHJcbiAgICAvLyByZWFjdGFudHMsIGJlbG93IHRoZSAnQmVmb3JlJyBib3hcclxuICAgIGNvbnN0IHJlYWN0YW50c1BhcmVudCA9IG5ldyBOb2RlKCk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCByZWFjdGFudHMubGVuZ3RoOyBpKysgKSB7XHJcblxyXG4gICAgICBjb25zdCByZWFjdGFudCA9IHJlYWN0YW50c1sgaSBdO1xyXG4gICAgICBjb25zdCBjZW50ZXJYID0gYmVmb3JlWE9mZnNldHNbIGkgXTtcclxuXHJcbiAgICAgIGlmICggb3B0aW9ucy5pbnRlcmFjdGl2ZUJveCA9PT0gQm94VHlwZS5CRUZPUkUgKSB7XHJcblxyXG4gICAgICAgIC8vIHNwaW5uZXJcclxuICAgICAgICBjb25zdCBzcGlubmVyTm9kZSA9IG5ldyBOdW1iZXJTcGlubmVyKCByZWFjdGFudC5xdWFudGl0eVByb3BlcnR5LCBuZXcgUHJvcGVydHkoIG9wdGlvbnMucXVhbnRpdHlSYW5nZSApLFxyXG4gICAgICAgICAgY29tYmluZU9wdGlvbnM8TnVtYmVyU3Bpbm5lck9wdGlvbnM+KCB7XHJcbiAgICAgICAgICAgIGNlbnRlclg6IGNlbnRlclhcclxuICAgICAgICAgIH0sIE5VTUJFUl9TUElOTkVSX09QVElPTlMgKSApO1xyXG4gICAgICAgIHJlYWN0YW50c1BhcmVudC5hZGRDaGlsZCggc3Bpbm5lck5vZGUgKTtcclxuICAgICAgICBzcGlubmVyTm9kZXMucHVzaCggc3Bpbm5lck5vZGUgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gc3RhdGljIG51bWJlclxyXG4gICAgICAgIGNvbnN0IG51bWJlck5vZGUgPSBuZXcgTnVtYmVyTm9kZSggcmVhY3RhbnQucXVhbnRpdHlQcm9wZXJ0eSwge1xyXG4gICAgICAgICAgZm9udDogUVVBTlRJVFlfRk9OVCxcclxuICAgICAgICAgIGNlbnRlclg6IGNlbnRlclhcclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgcmVhY3RhbnRzUGFyZW50LmFkZENoaWxkKCBudW1iZXJOb2RlICk7XHJcbiAgICAgICAgYmVmb3JlTnVtYmVyTm9kZXMucHVzaCggbnVtYmVyTm9kZSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBzdWJzdGFuY2UgaWNvblxyXG4gICAgICBjb25zdCBpY29uTm9kZSA9IG5ldyBTdWJzdGFuY2VJY29uKCByZWFjdGFudC5pY29uUHJvcGVydHksIHtcclxuICAgICAgICBjZW50ZXJYOiBjZW50ZXJYXHJcbiAgICAgIH0gKTtcclxuICAgICAgcmVhY3RhbnRzUGFyZW50LmFkZENoaWxkKCBpY29uTm9kZSApO1xyXG4gICAgICBpY29uTm9kZXMucHVzaCggaWNvbk5vZGUgKTtcclxuXHJcbiAgICAgIC8vIHN5bWJvbFxyXG4gICAgICBpZiAoIG9wdGlvbnMuc2hvd1N5bWJvbHMgKSB7XHJcbiAgICAgICAgY29uc3Qgc3ltYm9sTm9kZSA9IG5ldyBSaWNoVGV4dCggU3RyaW5nVXRpbHMud3JhcExUUiggcmVhY3RhbnQuc3ltYm9sICksIHtcclxuICAgICAgICAgIGZvbnQ6IFNZTUJPTF9GT05ULFxyXG4gICAgICAgICAgY2VudGVyWDogY2VudGVyWFxyXG4gICAgICAgIH0gKTtcclxuICAgICAgICByZWFjdGFudHNQYXJlbnQuYWRkQ2hpbGQoIHN5bWJvbE5vZGUgKTtcclxuICAgICAgICBzeW1ib2xOb2Rlcy5wdXNoKCBzeW1ib2xOb2RlICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBwcm9kdWN0cywgYmVsb3cgdGhlICdBZnRlcicgYm94XHJcbiAgICBjb25zdCBwcm9kdWN0c1BhcmVudCA9IG5ldyBOb2RlKCk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBwcm9kdWN0cy5sZW5ndGg7IGkrKyApIHtcclxuXHJcbiAgICAgIGNvbnN0IHByb2R1Y3QgPSBwcm9kdWN0c1sgaSBdO1xyXG4gICAgICBjb25zdCBjZW50ZXJYID0gb3B0aW9ucy5hZnRlckJveFhPZmZzZXQgKyBhZnRlclhPZmZzZXRzWyBpIF07XHJcblxyXG4gICAgICBpZiAoIG9wdGlvbnMuaW50ZXJhY3RpdmVCb3ggPT09IEJveFR5cGUuQUZURVIgKSB7XHJcblxyXG4gICAgICAgIC8vIHNwaW5uZXJcclxuICAgICAgICBjb25zdCBzcGlubmVyTm9kZSA9IG5ldyBOdW1iZXJTcGlubmVyKCBwcm9kdWN0LnF1YW50aXR5UHJvcGVydHksIG5ldyBQcm9wZXJ0eSggb3B0aW9ucy5xdWFudGl0eVJhbmdlICksXHJcbiAgICAgICAgICBjb21iaW5lT3B0aW9uczxOdW1iZXJTcGlubmVyT3B0aW9ucz4oIHtcclxuICAgICAgICAgICAgY2VudGVyWDogY2VudGVyWFxyXG4gICAgICAgICAgfSwgTlVNQkVSX1NQSU5ORVJfT1BUSU9OUyApICk7XHJcbiAgICAgICAgcHJvZHVjdHNQYXJlbnQuYWRkQ2hpbGQoIHNwaW5uZXJOb2RlICk7XHJcbiAgICAgICAgc3Bpbm5lck5vZGVzLnB1c2goIHNwaW5uZXJOb2RlICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIHN0YXRpYyBudW1iZXJcclxuICAgICAgICBjb25zdCBudW1iZXJOb2RlID0gbmV3IE51bWJlck5vZGUoIHByb2R1Y3QucXVhbnRpdHlQcm9wZXJ0eSwge1xyXG4gICAgICAgICAgZm9udDogUVVBTlRJVFlfRk9OVCxcclxuICAgICAgICAgIGNlbnRlclg6IGNlbnRlclhcclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgcHJvZHVjdHNQYXJlbnQuYWRkQ2hpbGQoIG51bWJlck5vZGUgKTtcclxuICAgICAgICBhZnRlck51bWJlck5vZGVzLnB1c2goIG51bWJlck5vZGUgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gc3Vic3RhbmNlIGljb25cclxuICAgICAgY29uc3QgaWNvbk5vZGUgPSBuZXcgU3Vic3RhbmNlSWNvbiggcHJvZHVjdC5pY29uUHJvcGVydHksIHtcclxuICAgICAgICBjZW50ZXJYOiBjZW50ZXJYXHJcbiAgICAgIH0gKTtcclxuICAgICAgcHJvZHVjdHNQYXJlbnQuYWRkQ2hpbGQoIGljb25Ob2RlICk7XHJcbiAgICAgIGljb25Ob2Rlcy5wdXNoKCBpY29uTm9kZSApO1xyXG5cclxuICAgICAgLy8gc3ltYm9sXHJcbiAgICAgIGlmICggb3B0aW9ucy5zaG93U3ltYm9scyApIHtcclxuICAgICAgICBjb25zdCBzeW1ib2xOb2RlID0gbmV3IFJpY2hUZXh0KCBwcm9kdWN0LnN5bWJvbCwge1xyXG4gICAgICAgICAgZm9udDogU1lNQk9MX0ZPTlQsXHJcbiAgICAgICAgICBjZW50ZXJYOiBjZW50ZXJYXHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIHByb2R1Y3RzUGFyZW50LmFkZENoaWxkKCBzeW1ib2xOb2RlICk7XHJcbiAgICAgICAgc3ltYm9sTm9kZXMucHVzaCggc3ltYm9sTm9kZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbGVmdG92ZXJzLCBiZWxvdyB0aGUgJ0FmdGVyJyBib3gsIHRvIHRoZSByaWdodCBvZiB0aGUgcHJvZHVjdHNcclxuICAgIGNvbnN0IGxlZnRvdmVyc1BhcmVudCA9IG5ldyBOb2RlKCk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsZWZ0b3ZlcnMubGVuZ3RoOyBpKysgKSB7XHJcblxyXG4gICAgICBjb25zdCBsZWZ0b3ZlciA9IGxlZnRvdmVyc1sgaSBdO1xyXG4gICAgICBjb25zdCBjZW50ZXJYID0gb3B0aW9ucy5hZnRlckJveFhPZmZzZXQgKyBhZnRlclhPZmZzZXRzWyBpICsgcHJvZHVjdHMubGVuZ3RoIF07IC8vIGxlZnRvdmVycyBmb2xsb3cgcHJvZHVjdHMgaW4gYWZ0ZXJYT2Zmc2V0c1xyXG5cclxuICAgICAgaWYgKCBvcHRpb25zLmludGVyYWN0aXZlQm94ID09PSBCb3hUeXBlLkFGVEVSICkge1xyXG5cclxuICAgICAgICAvLyBzcGlubmVyXHJcbiAgICAgICAgY29uc3Qgc3Bpbm5lck5vZGUgPSBuZXcgTnVtYmVyU3Bpbm5lciggbGVmdG92ZXIucXVhbnRpdHlQcm9wZXJ0eSwgbmV3IFByb3BlcnR5KCBvcHRpb25zLnF1YW50aXR5UmFuZ2UgKSxcclxuICAgICAgICAgIGNvbWJpbmVPcHRpb25zPE51bWJlclNwaW5uZXJPcHRpb25zPigge1xyXG4gICAgICAgICAgICBjZW50ZXJYOiBjZW50ZXJYXHJcbiAgICAgICAgICB9LCBOVU1CRVJfU1BJTk5FUl9PUFRJT05TICkgKTtcclxuICAgICAgICBsZWZ0b3ZlcnNQYXJlbnQuYWRkQ2hpbGQoIHNwaW5uZXJOb2RlICk7XHJcbiAgICAgICAgc3Bpbm5lck5vZGVzLnB1c2goIHNwaW5uZXJOb2RlICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIHN0YXRpYyBudW1iZXJcclxuICAgICAgICBjb25zdCBudW1iZXJOb2RlID0gbmV3IE51bWJlck5vZGUoIGxlZnRvdmVyLnF1YW50aXR5UHJvcGVydHksIHtcclxuICAgICAgICAgIGZvbnQ6IFFVQU5USVRZX0ZPTlQsXHJcbiAgICAgICAgICBjZW50ZXJYOiBjZW50ZXJYXHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIGxlZnRvdmVyc1BhcmVudC5hZGRDaGlsZCggbnVtYmVyTm9kZSApO1xyXG4gICAgICAgIGFmdGVyTnVtYmVyTm9kZXMucHVzaCggbnVtYmVyTm9kZSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBzdWJzdGFuY2UgaWNvblxyXG4gICAgICBjb25zdCBpY29uTm9kZSA9IG5ldyBTdWJzdGFuY2VJY29uKCBsZWZ0b3Zlci5pY29uUHJvcGVydHksIHtcclxuICAgICAgICBjZW50ZXJYOiBjZW50ZXJYXHJcbiAgICAgIH0gKTtcclxuICAgICAgbGVmdG92ZXJzUGFyZW50LmFkZENoaWxkKCBpY29uTm9kZSApO1xyXG4gICAgICBpY29uTm9kZXMucHVzaCggaWNvbk5vZGUgKTtcclxuXHJcbiAgICAgIC8vIHN5bWJvbFxyXG4gICAgICBpZiAoIG9wdGlvbnMuc2hvd1N5bWJvbHMgKSB7XHJcbiAgICAgICAgY29uc3Qgc3ltYm9sTm9kZSA9IG5ldyBSaWNoVGV4dCggbGVmdG92ZXIuc3ltYm9sLCB7XHJcbiAgICAgICAgICBmb250OiBTWU1CT0xfRk9OVCxcclxuICAgICAgICAgIGNlbnRlclg6IGNlbnRlclhcclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgbGVmdG92ZXJzUGFyZW50LmFkZENoaWxkKCBzeW1ib2xOb2RlICk7XHJcbiAgICAgICAgc3ltYm9sTm9kZXMucHVzaCggc3ltYm9sTm9kZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIFZlcnRpY2FsIGxheW91dCBvZiBjb21wb25lbnRzIGJlbG93IHRoZSBib3hlcy5cclxuICAgICAqIEVuc3VyZXMgdGhhdCBhbGwgc2ltaWxhciBjb21wb25lbnRzIChzcGlubmVycywgbnVtYmVycywgaWNvbnMsIHN5bWJvbHMpIGFyZSB2ZXJ0aWNhbGx5IGNlbnRlcmVkLlxyXG4gICAgICovXHJcbiAgICBjb25zdCBzcGlubmVySGVpZ2h0ID0gc3Bpbm5lck5vZGVzWyAwIF0uaGVpZ2h0O1xyXG4gICAgY29uc3QgbWF4SWNvbkhlaWdodCA9IE1hdGgubWF4KCBvcHRpb25zLm1pbkljb25TaXplLmhlaWdodCwgXy5tYXhCeSggaWNvbk5vZGVzLCBub2RlID0+IG5vZGUuaGVpZ2h0ICkhLmhlaWdodCApO1xyXG4gICAgY29uc3QgbWF4U3ltYm9sSGVpZ2h0ID0gc3ltYm9sTm9kZXMubGVuZ3RoID8gXy5tYXhCeSggc3ltYm9sTm9kZXMsIG5vZGUgPT4gbm9kZS5oZWlnaHQgKSEuaGVpZ2h0IDogMDtcclxuXHJcbiAgICBzcGlubmVyTm9kZXMuZm9yRWFjaCggc3Bpbm5lck5vZGUgPT4ge1xyXG4gICAgICBzcGlubmVyTm9kZS5jZW50ZXJZID0gKCBzcGlubmVySGVpZ2h0IC8gMiApO1xyXG4gICAgfSApO1xyXG4gICAgYmVmb3JlTnVtYmVyTm9kZXMuZm9yRWFjaCggbnVtYmVyTm9kZSA9PiB7XHJcbiAgICAgIG51bWJlck5vZGUuY2VudGVyWSA9ICggc3Bpbm5lckhlaWdodCAvIDIgKTtcclxuICAgIH0gKTtcclxuICAgIGFmdGVyTnVtYmVyTm9kZXMuZm9yRWFjaCggbnVtYmVyTm9kZSA9PiB7XHJcbiAgICAgIG51bWJlck5vZGUuY2VudGVyWSA9ICggc3Bpbm5lckhlaWdodCAvIDIgKTtcclxuICAgIH0gKTtcclxuICAgIGljb25Ob2Rlcy5mb3JFYWNoKCBpY29uTm9kZSA9PiB7XHJcbiAgICAgIGljb25Ob2RlLmNlbnRlclkgPSBzcGlubmVySGVpZ2h0ICsgUVVBTlRJVFlfSU1BR0VfWV9TUEFDSU5HICsgKCBtYXhJY29uSGVpZ2h0IC8gMiApO1xyXG4gICAgfSApO1xyXG4gICAgaWYgKCBvcHRpb25zLnNob3dTeW1ib2xzICkge1xyXG4gICAgICBzeW1ib2xOb2Rlcy5mb3JFYWNoKCBzeW1ib2xOb2RlID0+IHtcclxuICAgICAgICBzeW1ib2xOb2RlLnRvcCA9IHNwaW5uZXJIZWlnaHQgKyBRVUFOVElUWV9JTUFHRV9ZX1NQQUNJTkcgKyBtYXhJY29uSGVpZ2h0ICsgSU1BR0VfU1lNQk9MX1lfU1BBQ0lORztcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRvcCBvZiBicmFja2V0cyBpcyByZWxhdGl2ZSB0byB0aGUgYm90dG9tIG9mIHRoZSBzdHVmZiBhYm92ZVxyXG4gICAgbGV0IGJyYWNrZXRzVG9wID0gc3Bpbm5lckhlaWdodCArIFFVQU5USVRZX0lNQUdFX1lfU1BBQ0lORyArIG1heEljb25IZWlnaHQgKyBCUkFDS0VUX1lfU1BBQ0lORztcclxuICAgIGlmICggb3B0aW9ucy5zaG93U3ltYm9scyApIHtcclxuICAgICAgYnJhY2tldHNUb3AgKz0gKCBtYXhTeW1ib2xIZWlnaHQgKyBJTUFHRV9TWU1CT0xfWV9TUEFDSU5HICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gJ1JlYWN0YW50cycgYnJhY2tldFxyXG4gICAgY29uc3QgcmVhY3RhbnRzVGV4dCA9IG5ldyBUZXh0KCBSZWFjdGFudHNQcm9kdWN0c0FuZExlZnRvdmVyc1N0cmluZ3MucmVhY3RhbnRzU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGNvbWJpbmVPcHRpb25zPFRleHRPcHRpb25zPigge1xyXG4gICAgICAgIHRhbmRlbTogYmVmb3JlUXVhbnRpdGllc05vZGVUYW5kZW0uY3JlYXRlVGFuZGVtKCAncmVhY3RhbnRzVGV4dCcgKVxyXG4gICAgICB9LCBCUkFDS0VUX1RFWFRfT1BUSU9OUyApICk7XHJcbiAgICBjb25zdCByZWFjdGFudHNCcmFja2V0ID0gbmV3IEJyYWNrZXROb2RlKCB7XHJcbiAgICAgIGJyYWNrZXRTdHJva2U6IFJQQUxDb2xvcnMuQlJBQ0tFVF9OT0RFX1NUUk9LRSxcclxuICAgICAgbGFiZWxOb2RlOiByZWFjdGFudHNUZXh0LFxyXG4gICAgICBicmFja2V0TGVuZ3RoOiBNYXRoLm1heCggb3B0aW9ucy5taW5JY29uU2l6ZS53aWR0aCwgcmVhY3RhbnRzUGFyZW50LndpZHRoICsgKCAyICogQlJBQ0tFVF9YX01BUkdJTiApICksXHJcbiAgICAgIGNlbnRlclg6IHJlYWN0YW50c1BhcmVudC5jZW50ZXJYLFxyXG4gICAgICB0b3A6IGJyYWNrZXRzVG9wXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gJ1Byb2R1Y3RzJyBicmFja2V0XHJcbiAgICBjb25zdCBwcm9kdWN0c1RleHQgPSBuZXcgVGV4dCggUmVhY3RhbnRzUHJvZHVjdHNBbmRMZWZ0b3ZlcnNTdHJpbmdzLnByb2R1Y3RzU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGNvbWJpbmVPcHRpb25zPFRleHRPcHRpb25zPigge1xyXG4gICAgICAgIHRhbmRlbTogYWZ0ZXJRdWFudGl0aWVzTm9kZVRhbmRlbS5jcmVhdGVUYW5kZW0oICdwcm9kdWN0c1RleHQnIClcclxuICAgICAgfSwgQlJBQ0tFVF9URVhUX09QVElPTlMgKSApO1xyXG4gICAgY29uc3QgcHJvZHVjdHNCcmFja2V0ID0gbmV3IEJyYWNrZXROb2RlKCB7XHJcbiAgICAgIGJyYWNrZXRTdHJva2U6IFJQQUxDb2xvcnMuQlJBQ0tFVF9OT0RFX1NUUk9LRSxcclxuICAgICAgbGFiZWxOb2RlOiBwcm9kdWN0c1RleHQsXHJcbiAgICAgIGJyYWNrZXRMZW5ndGg6IE1hdGgubWF4KCBvcHRpb25zLm1pbkljb25TaXplLndpZHRoLCBwcm9kdWN0c1BhcmVudC53aWR0aCArICggMiAqIEJSQUNLRVRfWF9NQVJHSU4gKSApLFxyXG4gICAgICBjZW50ZXJYOiBwcm9kdWN0c1BhcmVudC5jZW50ZXJYLFxyXG4gICAgICB0b3A6IGJyYWNrZXRzVG9wXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gJ0xlZnRvdmVycycgYnJhY2tldFxyXG4gICAgY29uc3QgbGVmdG92ZXJzVGV4dCA9IG5ldyBUZXh0KCBSZWFjdGFudHNQcm9kdWN0c0FuZExlZnRvdmVyc1N0cmluZ3MubGVmdG92ZXJzU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGNvbWJpbmVPcHRpb25zPFRleHRPcHRpb25zPigge1xyXG4gICAgICAgIHRhbmRlbTogYWZ0ZXJRdWFudGl0aWVzTm9kZVRhbmRlbS5jcmVhdGVUYW5kZW0oICdsZWZ0b3ZlcnNUZXh0JyApXHJcbiAgICAgIH0sIEJSQUNLRVRfVEVYVF9PUFRJT05TICkgKTtcclxuICAgIGNvbnN0IGxlZnRvdmVyc0JyYWNrZXQgPSBuZXcgQnJhY2tldE5vZGUoIHtcclxuICAgICAgYnJhY2tldFN0cm9rZTogUlBBTENvbG9ycy5CUkFDS0VUX05PREVfU1RST0tFLFxyXG4gICAgICBsYWJlbE5vZGU6IGxlZnRvdmVyc1RleHQsXHJcbiAgICAgIGJyYWNrZXRMZW5ndGg6IE1hdGgubWF4KCBvcHRpb25zLm1pbkljb25TaXplLndpZHRoLCBsZWZ0b3ZlcnNQYXJlbnQud2lkdGggKyAoIDIgKiBCUkFDS0VUX1hfTUFSR0lOICkgKSxcclxuICAgICAgY2VudGVyWDogbGVmdG92ZXJzUGFyZW50LmNlbnRlclgsXHJcbiAgICAgIHRvcDogYnJhY2tldHNUb3BcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyAnSGlkZSBudW1iZXJzJyBib3ggb24gdG9wIG9mIHRoZSBzdGF0aWMgcXVhbnRpdGllc1xyXG4gICAgY29uc3QgaGlkZU51bWJlcnNCb3ggPSBuZXcgSGlkZUJveCgge1xyXG4gICAgICB2aXNpYmxlOiBvcHRpb25zLmhpZGVOdW1iZXJzQm94LFxyXG4gICAgICBib3hTaXplOiBuZXcgRGltZW5zaW9uMiggb3B0aW9ucy5ib3hXaWR0aCwgc3Bpbm5lckhlaWdodCApLFxyXG4gICAgICBpY29uSGVpZ2h0OiAwLjY1ICogc3Bpbm5lckhlaWdodCxcclxuICAgICAgY29ybmVyUmFkaXVzOiAzLFxyXG4gICAgICBsZWZ0OiAoIG9wdGlvbnMuaW50ZXJhY3RpdmVCb3ggPT09IEJveFR5cGUuQkVGT1JFICkgPyBvcHRpb25zLmFmdGVyQm94WE9mZnNldCA6IDAsXHJcbiAgICAgIGNlbnRlclk6IHNwaW5uZXJOb2Rlc1sgMCBdLmNlbnRlcllcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBiZWZvcmVRdWFudGl0aWVzTm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIHJlYWN0YW50c1BhcmVudCwgcmVhY3RhbnRzQnJhY2tldCBdLFxyXG4gICAgICB0YW5kZW06IGJlZm9yZVF1YW50aXRpZXNOb2RlVGFuZGVtXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgYWZ0ZXJRdWFudGl0aWVzTm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIHByb2R1Y3RzUGFyZW50LCBsZWZ0b3ZlcnNQYXJlbnQsIHByb2R1Y3RzQnJhY2tldCwgbGVmdG92ZXJzQnJhY2tldCBdLFxyXG4gICAgICB0YW5kZW06IGFmdGVyUXVhbnRpdGllc05vZGVUYW5kZW1cclxuICAgIH0gKTtcclxuXHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyBiZWZvcmVRdWFudGl0aWVzTm9kZSwgYWZ0ZXJRdWFudGl0aWVzTm9kZSwgaGlkZU51bWJlcnNCb3ggXTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMucmVhY3RhbnRzID0gcmVhY3RhbnRzO1xyXG4gICAgdGhpcy5wcm9kdWN0cyA9IHByb2R1Y3RzO1xyXG4gICAgdGhpcy5sZWZ0b3ZlcnMgPSBsZWZ0b3ZlcnM7XHJcbiAgICB0aGlzLmludGVyYWN0aXZlQm94ID0gb3B0aW9ucy5pbnRlcmFjdGl2ZUJveDtcclxuICAgIHRoaXMuc3Bpbm5lck5vZGVzID0gc3Bpbm5lck5vZGVzO1xyXG4gICAgdGhpcy5iZWZvcmVOdW1iZXJOb2RlcyA9IGJlZm9yZU51bWJlck5vZGVzO1xyXG4gICAgdGhpcy5hZnRlck51bWJlck5vZGVzID0gYWZ0ZXJOdW1iZXJOb2RlcztcclxuICAgIHRoaXMucmVhY3RhbnRzUGFyZW50ID0gcmVhY3RhbnRzUGFyZW50O1xyXG4gICAgdGhpcy5wcm9kdWN0c1BhcmVudCA9IHByb2R1Y3RzUGFyZW50O1xyXG4gICAgdGhpcy5sZWZ0b3ZlcnNQYXJlbnQgPSBsZWZ0b3ZlcnNQYXJlbnQ7XHJcbiAgICB0aGlzLmhpZGVOdW1iZXJzQm94ID0gaGlkZU51bWJlcnNCb3g7XHJcblxyXG4gICAgdGhpcy5kaXNwb3NlUXVhbnRpdGllc05vZGUgPSAoKSA9PiB7XHJcbiAgICAgIHJlYWN0YW50c1RleHQuZGlzcG9zZSgpO1xyXG4gICAgICBwcm9kdWN0c1RleHQuZGlzcG9zZSgpO1xyXG4gICAgICBsZWZ0b3ZlcnNUZXh0LmRpc3Bvc2UoKTtcclxuICAgICAgdGhpcy5zcGlubmVyTm9kZXMuZm9yRWFjaCggbm9kZSA9PiBub2RlLmRpc3Bvc2UoKSApO1xyXG4gICAgICB0aGlzLmJlZm9yZU51bWJlck5vZGVzLmZvckVhY2goIG5vZGUgPT4gbm9kZS5kaXNwb3NlKCkgKTtcclxuICAgICAgdGhpcy5hZnRlck51bWJlck5vZGVzLmZvckVhY2goIG5vZGUgPT4gbm9kZS5kaXNwb3NlKCkgKTtcclxuICAgICAgaWNvbk5vZGVzLmZvckVhY2goIG5vZGUgPT4gbm9kZS5kaXNwb3NlKCkgKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZGlzcG9zZVF1YW50aXRpZXNOb2RlKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhpcyBVSSBjb21wb25lbnQgaXMgaW50ZXJhY3RpdmUgKHRydWUgb24gY3JlYXRpb24pLlxyXG4gICAqIFdoZW4gaXQncyBpbnRlcmFjdGl2ZSwgc3Bpbm5lcnMgYXJlIHZpc2libGU7IHdoZW4gbm90LCBzdGF0aWMgbnVtYmVycyBhcmUgdmlzaWJsZS5cclxuICAgKiBTdGF0aWMgbnVtYmVycyBhcmUgY3JlYXRlZCBvbiBkZW1hbmQsIHNvIHRoYXQgd2UgZG9uJ3QgaGF2ZSB1bm5lY2Vzc2FyeSBub2RlcyBmb3Igc2l0dWF0aW9uc1xyXG4gICAqIHRoYXQgYXJlIGFsd2F5cyBpbnRlcmFjdGl2ZSwgYW5kIHRvIGltcHJvdmUgcGVyZm9ybWFuY2Ugb24gY3JlYXRpb24uXHJcbiAgICovXHJcbiAgcHVibGljIHNldEludGVyYWN0aXZlKCBpbnRlcmFjdGl2ZTogYm9vbGVhbiApOiB2b2lkIHtcclxuXHJcbiAgICAvLyBzcGlubmVyc1xyXG4gICAgdGhpcy5zcGlubmVyTm9kZXMuZm9yRWFjaCggc3Bpbm5lck5vZGUgPT4geyBzcGlubmVyTm9kZS52aXNpYmxlID0gaW50ZXJhY3RpdmU7IH0gKTtcclxuXHJcbiAgICBjb25zdCBjZW50ZXJZID0gdGhpcy5zcGlubmVyTm9kZXNbIDAgXS5oZWlnaHQgLyAyO1xyXG5cclxuICAgIGlmICggdGhpcy5pbnRlcmFjdGl2ZUJveCA9PT0gQm94VHlwZS5CRUZPUkUgKSB7XHJcblxyXG4gICAgICAvLyByZWFjdGFudHMsIGNyZWF0ZSBzdGF0aWMgbnVtYmVycyBvbiBkZW1hbmRcclxuICAgICAgaWYgKCAhaW50ZXJhY3RpdmUgJiYgdGhpcy5iZWZvcmVOdW1iZXJOb2Rlcy5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5yZWFjdGFudHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgICBjb25zdCBjZW50ZXJYID0gdGhpcy5zcGlubmVyTm9kZXNbIGkgXS5jZW50ZXJYO1xyXG4gICAgICAgICAgY29uc3QgbnVtYmVyTm9kZSA9IG5ldyBOdW1iZXJOb2RlKCB0aGlzLnJlYWN0YW50c1sgaSBdLnF1YW50aXR5UHJvcGVydHksIHtcclxuICAgICAgICAgICAgZm9udDogUVVBTlRJVFlfRk9OVCxcclxuICAgICAgICAgICAgY2VudGVyWDogY2VudGVyWCxcclxuICAgICAgICAgICAgY2VudGVyWTogY2VudGVyWVxyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgICAgdGhpcy5yZWFjdGFudHNQYXJlbnQuYWRkQ2hpbGQoIG51bWJlck5vZGUgKTtcclxuICAgICAgICAgIHRoaXMuYmVmb3JlTnVtYmVyTm9kZXMucHVzaCggbnVtYmVyTm9kZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gdmlzaWJpbGl0eVxyXG4gICAgICBpZiAoIHRoaXMuYmVmb3JlTnVtYmVyTm9kZXMubGVuZ3RoID4gMCApIHtcclxuICAgICAgICB0aGlzLmJlZm9yZU51bWJlck5vZGVzLmZvckVhY2goIG5vZGUgPT4geyBub2RlLnZpc2libGUgPSAhaW50ZXJhY3RpdmU7IH0gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBjcmVhdGUgc3RhdGljIG51bWJlcnMgb24gZGVtYW5kXHJcbiAgICAgIGlmICggIWludGVyYWN0aXZlICYmIHRoaXMuYWZ0ZXJOdW1iZXJOb2Rlcy5sZW5ndGggPT09IDAgKSB7XHJcblxyXG4gICAgICAgIC8vIHByb2R1Y3RzXHJcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5wcm9kdWN0cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICAgIGNvbnN0IGNlbnRlclggPSB0aGlzLnNwaW5uZXJOb2Rlc1sgaSBdLmNlbnRlclg7XHJcbiAgICAgICAgICBjb25zdCBudW1iZXJOb2RlID0gbmV3IE51bWJlck5vZGUoIHRoaXMucHJvZHVjdHNbIGkgXS5xdWFudGl0eVByb3BlcnR5LCB7XHJcbiAgICAgICAgICAgIGZvbnQ6IFFVQU5USVRZX0ZPTlQsXHJcbiAgICAgICAgICAgIGNlbnRlclg6IGNlbnRlclgsXHJcbiAgICAgICAgICAgIGNlbnRlclk6IGNlbnRlcllcclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICAgIHRoaXMucHJvZHVjdHNQYXJlbnQuYWRkQ2hpbGQoIG51bWJlck5vZGUgKTtcclxuICAgICAgICAgIHRoaXMuYWZ0ZXJOdW1iZXJOb2Rlcy5wdXNoKCBudW1iZXJOb2RlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBsZWZ0b3ZlcnNcclxuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmxlZnRvdmVycy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICAgIGNvbnN0IGNlbnRlclggPSB0aGlzLnNwaW5uZXJOb2Rlc1sgaSArIHRoaXMucHJvZHVjdHMubGVuZ3RoIF0uY2VudGVyWDsgLy8gbGVmdG92ZXIgc3Bpbm5lcnMgZm9sbG93IHByb2R1Y3Qgc3Bpbm5lcnNcclxuICAgICAgICAgIGNvbnN0IG51bWJlck5vZGUgPSBuZXcgTnVtYmVyTm9kZSggdGhpcy5sZWZ0b3ZlcnNbIGkgXS5xdWFudGl0eVByb3BlcnR5LCB7XHJcbiAgICAgICAgICAgIGZvbnQ6IFFVQU5USVRZX0ZPTlQsXHJcbiAgICAgICAgICAgIGNlbnRlclg6IGNlbnRlclgsXHJcbiAgICAgICAgICAgIGNlbnRlclk6IGNlbnRlcllcclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICAgIHRoaXMubGVmdG92ZXJzUGFyZW50LmFkZENoaWxkKCBudW1iZXJOb2RlICk7XHJcbiAgICAgICAgICB0aGlzLmFmdGVyTnVtYmVyTm9kZXMucHVzaCggbnVtYmVyTm9kZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gdmlzaWJpbGl0eVxyXG4gICAgICBpZiAoIHRoaXMuYWZ0ZXJOdW1iZXJOb2Rlcy5sZW5ndGggPiAwICkge1xyXG4gICAgICAgIHRoaXMuYWZ0ZXJOdW1iZXJOb2Rlcy5mb3JFYWNoKCBub2RlID0+IHsgbm9kZS52aXNpYmxlID0gIWludGVyYWN0aXZlOyB9ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoYW5nZXMgdmlzaWJpbGl0eSBvZiB0aGUgJ0hpZGUgbnVtYmVycycgYm94LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRIaWRlTnVtYmVyc0JveFZpc2libGUoIHZpc2libGU6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICB0aGlzLmhpZGVOdW1iZXJzQm94LnZpc2libGUgPSB2aXNpYmxlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyB4LW9mZnNldHMgZm9yIHN1YnN0YW5jZXMsIHJlbGF0aXZlIHRvIHRoZSBsZWZ0IGVkZ2Ugb2YgdGhlaXIgJ0JlZm9yZScgb3IgJ0FmdGVyJyBib3guXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBjcmVhdGVYT2Zmc2V0cyggbnVtYmVyT2ZTdWJzdGFuY2VzOiBudW1iZXIsIGJveFdpZHRoOiBudW1iZXIgKTogbnVtYmVyW10ge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggbnVtYmVyT2ZTdWJzdGFuY2VzICkgJiYgbnVtYmVyT2ZTdWJzdGFuY2VzID4gMCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYm94V2lkdGggPiAwICk7XHJcblxyXG4gICAgY29uc3QgeE9mZnNldHMgPSBbXTtcclxuICAgIGNvbnN0IHhNYXJnaW4gPSAoIG51bWJlck9mU3Vic3RhbmNlcyA+IDIgKSA/IDAgOiAoIDAuMTUgKiBib3hXaWR0aCApOyAvLyBtYWtlIDItcmVhY3RhbnQgY2FzZSBsb29rIG5pY2VcclxuICAgIGNvbnN0IGRlbHRhWCA9ICggYm94V2lkdGggLSAoIDIgKiB4TWFyZ2luICkgKSAvIG51bWJlck9mU3Vic3RhbmNlcztcclxuICAgIGxldCB4T2Zmc2V0ID0geE1hcmdpbiArICggZGVsdGFYIC8gMiApO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZTdWJzdGFuY2VzOyBpKysgKSB7XHJcbiAgICAgIHhPZmZzZXRzLnB1c2goIHhPZmZzZXQgKTtcclxuICAgICAgeE9mZnNldCArPSBkZWx0YVg7XHJcbiAgICB9XHJcbiAgICByZXR1cm4geE9mZnNldHM7XHJcbiAgfVxyXG59XHJcblxyXG5yZWFjdGFudHNQcm9kdWN0c0FuZExlZnRvdmVycy5yZWdpc3RlciggJ1F1YW50aXRpZXNOb2RlJywgUXVhbnRpdGllc05vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsVUFBVSxNQUFNLGtDQUFrQztBQUV6RCxPQUFPQyxTQUFTLElBQUlDLGNBQWMsUUFBUSx1Q0FBdUM7QUFDakYsT0FBT0MsV0FBVyxNQUFNLCtDQUErQztBQUN2RSxPQUFPQyxXQUFXLE1BQU0sNENBQTRDO0FBQ3BFLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsSUFBSSxFQUF1Q0MsUUFBUSxFQUFFQyxJQUFJLFFBQXFCLG1DQUFtQztBQUMxSCxPQUFPQyxhQUFhLE1BQWdDLHFDQUFxQztBQUN6RixPQUFPQyw2QkFBNkIsTUFBTSx3Q0FBd0M7QUFDbEYsT0FBT0Msb0NBQW9DLE1BQU0sK0NBQStDO0FBQ2hHLE9BQU9DLE9BQU8sTUFBTSxxQkFBcUI7QUFFekMsT0FBT0MsVUFBVSxNQUFNLGtCQUFrQjtBQUN6QyxPQUFPQyxhQUFhLE1BQU0scUJBQXFCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSxjQUFjO0FBQ2xDLE9BQU9DLFVBQVUsTUFBTSxpQkFBaUI7QUFDeEMsT0FBT0MsYUFBYSxNQUFNLG9CQUFvQjtBQUc5QyxNQUFNQyxzQkFBc0IsR0FBR0osYUFBYSxDQUFDSSxzQkFBc0I7QUFDbkUsTUFBTUMsYUFBYSxHQUFHLElBQUlk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