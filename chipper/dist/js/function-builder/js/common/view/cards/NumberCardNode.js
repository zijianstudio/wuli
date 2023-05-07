// Copyright 2016-2023, University of Colorado Boulder

/**
 * Node that displays a number card.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Dimension2 from '../../../../../dot/js/Dimension2.js';
import merge from '../../../../../phet-core/js/merge.js';
import { Text } from '../../../../../scenery/js/imports.js';
import functionBuilder from '../../../functionBuilder.js';
import FBConstants from '../../FBConstants.js';
import FBSymbols from '../../FBSymbols.js';
import NumberCard from '../../model/cards/NumberCard.js';
import RationalNumber from '../../model/RationalNumber.js';
import RationalNumberNode from '../RationalNumberNode.js';
import CardNode from './CardNode.js';

// constants
const DEFAULT_MAX_CONTENT_SIZE = new Dimension2(0.75 * FBConstants.CARD_OPTIONS.size.width, 0.95 * FBConstants.CARD_OPTIONS.size.height);
export default class NumberCardNode extends CardNode {
  /**
   * @param {NumberCard} card
   * @param {CardContainer} inputContainer - container in the input carousel
   * @param {CardContainer} outputContainer - container in the output carousel
   * @param {BuilderNode} builderNode
   * @param {Node} dragLayer - parent for this node when it's being dragged or animating
   * @param {Property.<boolean>} seeInsideProperty - for the 'See Inside' feature
   * @param {Object} [options]
   */
  constructor(card, inputContainer, outputContainer, builderNode, dragLayer, seeInsideProperty, options) {
    assert && assert(card instanceof NumberCard);
    options = merge({
      maxContentSize: DEFAULT_MAX_CONTENT_SIZE // {Dimension2} constrain content to fit on card
    }, options);

    // {Node} content that is displayed on the card, set by updateContent
    let rationalNumberNode = null;

    /**
     * Updates the number (value) displayed on the card.
     * @param {NumberCardNode} cardNode
     * @param {Builder} builder
     * @param {number} numberOfFunctionsToApply
     */
    function updateContent(cardNode, builder, numberOfFunctionsToApply) {
      // {RationalNumber} run the input value through the builder
      const value = builder.applyFunctions(cardNode.card.rationalNumber, numberOfFunctionsToApply);
      if (!rationalNumberNode) {
        // create the node
        rationalNumberNode = new RationalNumberNode(value, {
          mixedNumber: false,
          // display as improper fraction
          negativeSymbol: FBSymbols.MINUS,
          signFont: FBConstants.EQUATION_OPTIONS.signFont,
          wholeNumberFont: FBConstants.EQUATION_OPTIONS.wholeNumberFont,
          fractionFont: FBConstants.EQUATION_OPTIONS.fractionFont,
          maxWidth: options.maxContentSize.width,
          maxHeight: options.maxContentSize.height
        });
        cardNode.addChild(rationalNumberNode);
      } else {
        // update the node
        rationalNumberNode.setValue(value);
      }

      // center on the card
      rationalNumberNode.center = cardNode.backgroundNode.center;
    }
    super(card, inputContainer, outputContainer, builderNode, dragLayer, seeInsideProperty, updateContent, options);
  }

  /**
   * Creates a 'ghost' card that appears in an empty carousel.
   *
   * @param {RationalNumber} rationalNumber
   * @param {Object} [options]
   * @returns {Node}
   * @public
   * @static
   * @override
   */
  static createGhostNode(rationalNumber, options) {
    assert && assert(rationalNumber instanceof RationalNumber);
    options = merge({
      maxContentSize: DEFAULT_MAX_CONTENT_SIZE // {Dimension2} constrain content to fit on card
    }, options);
    const contentNode = new Text(rationalNumber.valueOf(), {
      font: FBConstants.EQUATION_OPTIONS.wholeNumberFont,
      maxWidth: options.maxContentSize.width,
      maxHeight: options.maxContentSize.height
    });
    return CardNode.createGhostNode(contentNode, options);
  }
}
functionBuilder.register('NumberCardNode', NumberCardNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwibWVyZ2UiLCJUZXh0IiwiZnVuY3Rpb25CdWlsZGVyIiwiRkJDb25zdGFudHMiLCJGQlN5bWJvbHMiLCJOdW1iZXJDYXJkIiwiUmF0aW9uYWxOdW1iZXIiLCJSYXRpb25hbE51bWJlck5vZGUiLCJDYXJkTm9kZSIsIkRFRkFVTFRfTUFYX0NPTlRFTlRfU0laRSIsIkNBUkRfT1BUSU9OUyIsInNpemUiLCJ3aWR0aCIsImhlaWdodCIsIk51bWJlckNhcmROb2RlIiwiY29uc3RydWN0b3IiLCJjYXJkIiwiaW5wdXRDb250YWluZXIiLCJvdXRwdXRDb250YWluZXIiLCJidWlsZGVyTm9kZSIsImRyYWdMYXllciIsInNlZUluc2lkZVByb3BlcnR5Iiwib3B0aW9ucyIsImFzc2VydCIsIm1heENvbnRlbnRTaXplIiwicmF0aW9uYWxOdW1iZXJOb2RlIiwidXBkYXRlQ29udGVudCIsImNhcmROb2RlIiwiYnVpbGRlciIsIm51bWJlck9mRnVuY3Rpb25zVG9BcHBseSIsInZhbHVlIiwiYXBwbHlGdW5jdGlvbnMiLCJyYXRpb25hbE51bWJlciIsIm1peGVkTnVtYmVyIiwibmVnYXRpdmVTeW1ib2wiLCJNSU5VUyIsInNpZ25Gb250IiwiRVFVQVRJT05fT1BUSU9OUyIsIndob2xlTnVtYmVyRm9udCIsImZyYWN0aW9uRm9udCIsIm1heFdpZHRoIiwibWF4SGVpZ2h0IiwiYWRkQ2hpbGQiLCJzZXRWYWx1ZSIsImNlbnRlciIsImJhY2tncm91bmROb2RlIiwiY3JlYXRlR2hvc3ROb2RlIiwiY29udGVudE5vZGUiLCJ2YWx1ZU9mIiwiZm9udCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTnVtYmVyQ2FyZE5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTm9kZSB0aGF0IGRpc3BsYXlzIGEgbnVtYmVyIGNhcmQuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBmdW5jdGlvbkJ1aWxkZXIgZnJvbSAnLi4vLi4vLi4vZnVuY3Rpb25CdWlsZGVyLmpzJztcclxuaW1wb3J0IEZCQ29uc3RhbnRzIGZyb20gJy4uLy4uL0ZCQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEZCU3ltYm9scyBmcm9tICcuLi8uLi9GQlN5bWJvbHMuanMnO1xyXG5pbXBvcnQgTnVtYmVyQ2FyZCBmcm9tICcuLi8uLi9tb2RlbC9jYXJkcy9OdW1iZXJDYXJkLmpzJztcclxuaW1wb3J0IFJhdGlvbmFsTnVtYmVyIGZyb20gJy4uLy4uL21vZGVsL1JhdGlvbmFsTnVtYmVyLmpzJztcclxuaW1wb3J0IFJhdGlvbmFsTnVtYmVyTm9kZSBmcm9tICcuLi9SYXRpb25hbE51bWJlck5vZGUuanMnO1xyXG5pbXBvcnQgQ2FyZE5vZGUgZnJvbSAnLi9DYXJkTm9kZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgREVGQVVMVF9NQVhfQ09OVEVOVF9TSVpFID0gbmV3IERpbWVuc2lvbjIoXHJcbiAgMC43NSAqIEZCQ29uc3RhbnRzLkNBUkRfT1BUSU9OUy5zaXplLndpZHRoLFxyXG4gIDAuOTUgKiBGQkNvbnN0YW50cy5DQVJEX09QVElPTlMuc2l6ZS5oZWlnaHRcclxuKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE51bWJlckNhcmROb2RlIGV4dGVuZHMgQ2FyZE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge051bWJlckNhcmR9IGNhcmRcclxuICAgKiBAcGFyYW0ge0NhcmRDb250YWluZXJ9IGlucHV0Q29udGFpbmVyIC0gY29udGFpbmVyIGluIHRoZSBpbnB1dCBjYXJvdXNlbFxyXG4gICAqIEBwYXJhbSB7Q2FyZENvbnRhaW5lcn0gb3V0cHV0Q29udGFpbmVyIC0gY29udGFpbmVyIGluIHRoZSBvdXRwdXQgY2Fyb3VzZWxcclxuICAgKiBAcGFyYW0ge0J1aWxkZXJOb2RlfSBidWlsZGVyTm9kZVxyXG4gICAqIEBwYXJhbSB7Tm9kZX0gZHJhZ0xheWVyIC0gcGFyZW50IGZvciB0aGlzIG5vZGUgd2hlbiBpdCdzIGJlaW5nIGRyYWdnZWQgb3IgYW5pbWF0aW5nXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IHNlZUluc2lkZVByb3BlcnR5IC0gZm9yIHRoZSAnU2VlIEluc2lkZScgZmVhdHVyZVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggY2FyZCwgaW5wdXRDb250YWluZXIsIG91dHB1dENvbnRhaW5lciwgYnVpbGRlck5vZGUsIGRyYWdMYXllciwgc2VlSW5zaWRlUHJvcGVydHksIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY2FyZCBpbnN0YW5jZW9mIE51bWJlckNhcmQgKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgbWF4Q29udGVudFNpemU6IERFRkFVTFRfTUFYX0NPTlRFTlRfU0laRSAvLyB7RGltZW5zaW9uMn0gY29uc3RyYWluIGNvbnRlbnQgdG8gZml0IG9uIGNhcmRcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyB7Tm9kZX0gY29udGVudCB0aGF0IGlzIGRpc3BsYXllZCBvbiB0aGUgY2FyZCwgc2V0IGJ5IHVwZGF0ZUNvbnRlbnRcclxuICAgIGxldCByYXRpb25hbE51bWJlck5vZGUgPSBudWxsO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlcyB0aGUgbnVtYmVyICh2YWx1ZSkgZGlzcGxheWVkIG9uIHRoZSBjYXJkLlxyXG4gICAgICogQHBhcmFtIHtOdW1iZXJDYXJkTm9kZX0gY2FyZE5vZGVcclxuICAgICAqIEBwYXJhbSB7QnVpbGRlcn0gYnVpbGRlclxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG51bWJlck9mRnVuY3Rpb25zVG9BcHBseVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVDb250ZW50KCBjYXJkTm9kZSwgYnVpbGRlciwgbnVtYmVyT2ZGdW5jdGlvbnNUb0FwcGx5ICkge1xyXG5cclxuICAgICAgLy8ge1JhdGlvbmFsTnVtYmVyfSBydW4gdGhlIGlucHV0IHZhbHVlIHRocm91Z2ggdGhlIGJ1aWxkZXJcclxuICAgICAgY29uc3QgdmFsdWUgPSBidWlsZGVyLmFwcGx5RnVuY3Rpb25zKCBjYXJkTm9kZS5jYXJkLnJhdGlvbmFsTnVtYmVyLCBudW1iZXJPZkZ1bmN0aW9uc1RvQXBwbHkgKTtcclxuXHJcbiAgICAgIGlmICggIXJhdGlvbmFsTnVtYmVyTm9kZSApIHtcclxuXHJcbiAgICAgICAgLy8gY3JlYXRlIHRoZSBub2RlXHJcbiAgICAgICAgcmF0aW9uYWxOdW1iZXJOb2RlID0gbmV3IFJhdGlvbmFsTnVtYmVyTm9kZSggdmFsdWUsIHtcclxuICAgICAgICAgIG1peGVkTnVtYmVyOiBmYWxzZSwgLy8gZGlzcGxheSBhcyBpbXByb3BlciBmcmFjdGlvblxyXG4gICAgICAgICAgbmVnYXRpdmVTeW1ib2w6IEZCU3ltYm9scy5NSU5VUyxcclxuICAgICAgICAgIHNpZ25Gb250OiBGQkNvbnN0YW50cy5FUVVBVElPTl9PUFRJT05TLnNpZ25Gb250LFxyXG4gICAgICAgICAgd2hvbGVOdW1iZXJGb250OiBGQkNvbnN0YW50cy5FUVVBVElPTl9PUFRJT05TLndob2xlTnVtYmVyRm9udCxcclxuICAgICAgICAgIGZyYWN0aW9uRm9udDogRkJDb25zdGFudHMuRVFVQVRJT05fT1BUSU9OUy5mcmFjdGlvbkZvbnQsXHJcbiAgICAgICAgICBtYXhXaWR0aDogb3B0aW9ucy5tYXhDb250ZW50U2l6ZS53aWR0aCxcclxuICAgICAgICAgIG1heEhlaWdodDogb3B0aW9ucy5tYXhDb250ZW50U2l6ZS5oZWlnaHRcclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgY2FyZE5vZGUuYWRkQ2hpbGQoIHJhdGlvbmFsTnVtYmVyTm9kZSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyB1cGRhdGUgdGhlIG5vZGVcclxuICAgICAgICByYXRpb25hbE51bWJlck5vZGUuc2V0VmFsdWUoIHZhbHVlICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGNlbnRlciBvbiB0aGUgY2FyZFxyXG4gICAgICByYXRpb25hbE51bWJlck5vZGUuY2VudGVyID0gY2FyZE5vZGUuYmFja2dyb3VuZE5vZGUuY2VudGVyO1xyXG4gICAgfVxyXG5cclxuICAgIHN1cGVyKCBjYXJkLCBpbnB1dENvbnRhaW5lciwgb3V0cHV0Q29udGFpbmVyLCBidWlsZGVyTm9kZSwgZHJhZ0xheWVyLCBzZWVJbnNpZGVQcm9wZXJ0eSwgdXBkYXRlQ29udGVudCwgb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhICdnaG9zdCcgY2FyZCB0aGF0IGFwcGVhcnMgaW4gYW4gZW1wdHkgY2Fyb3VzZWwuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1JhdGlvbmFsTnVtYmVyfSByYXRpb25hbE51bWJlclxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKiBAcmV0dXJucyB7Tm9kZX1cclxuICAgKiBAcHVibGljXHJcbiAgICogQHN0YXRpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjcmVhdGVHaG9zdE5vZGUoIHJhdGlvbmFsTnVtYmVyLCBvcHRpb25zICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJhdGlvbmFsTnVtYmVyIGluc3RhbmNlb2YgUmF0aW9uYWxOdW1iZXIgKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgbWF4Q29udGVudFNpemU6IERFRkFVTFRfTUFYX0NPTlRFTlRfU0laRSAvLyB7RGltZW5zaW9uMn0gY29uc3RyYWluIGNvbnRlbnQgdG8gZml0IG9uIGNhcmRcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBjb250ZW50Tm9kZSA9IG5ldyBUZXh0KCByYXRpb25hbE51bWJlci52YWx1ZU9mKCksIHtcclxuICAgICAgZm9udDogRkJDb25zdGFudHMuRVFVQVRJT05fT1BUSU9OUy53aG9sZU51bWJlckZvbnQsXHJcbiAgICAgIG1heFdpZHRoOiBvcHRpb25zLm1heENvbnRlbnRTaXplLndpZHRoLFxyXG4gICAgICBtYXhIZWlnaHQ6IG9wdGlvbnMubWF4Q29udGVudFNpemUuaGVpZ2h0XHJcbiAgICB9ICk7XHJcbiAgICByZXR1cm4gQ2FyZE5vZGUuY3JlYXRlR2hvc3ROb2RlKCBjb250ZW50Tm9kZSwgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb25CdWlsZGVyLnJlZ2lzdGVyKCAnTnVtYmVyQ2FyZE5vZGUnLCBOdW1iZXJDYXJkTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxVQUFVLE1BQU0scUNBQXFDO0FBQzVELE9BQU9DLEtBQUssTUFBTSxzQ0FBc0M7QUFDeEQsU0FBU0MsSUFBSSxRQUFRLHNDQUFzQztBQUMzRCxPQUFPQyxlQUFlLE1BQU0sNkJBQTZCO0FBQ3pELE9BQU9DLFdBQVcsTUFBTSxzQkFBc0I7QUFDOUMsT0FBT0MsU0FBUyxNQUFNLG9CQUFvQjtBQUMxQyxPQUFPQyxVQUFVLE1BQU0saUNBQWlDO0FBQ3hELE9BQU9DLGNBQWMsTUFBTSwrQkFBK0I7QUFDMUQsT0FBT0Msa0JBQWtCLE1BQU0sMEJBQTBCO0FBQ3pELE9BQU9DLFFBQVEsTUFBTSxlQUFlOztBQUVwQztBQUNBLE1BQU1DLHdCQUF3QixHQUFHLElBQUlWLFVBQVUsQ0FDN0MsSUFBSSxHQUFHSSxXQUFXLENBQUNPLFlBQVksQ0FBQ0MsSUFBSSxDQUFDQyxLQUFLLEVBQzFDLElBQUksR0FBR1QsV0FBVyxDQUFDTyxZQUFZLENBQUNDLElBQUksQ0FBQ0UsTUFDdkMsQ0FBQztBQUVELGVBQWUsTUFBTUMsY0FBYyxTQUFTTixRQUFRLENBQUM7RUFFbkQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VPLFdBQVdBLENBQUVDLElBQUksRUFBRUMsY0FBYyxFQUFFQyxlQUFlLEVBQUVDLFdBQVcsRUFBRUMsU0FBUyxFQUFFQyxpQkFBaUIsRUFBRUMsT0FBTyxFQUFHO0lBRXZHQyxNQUFNLElBQUlBLE1BQU0sQ0FBRVAsSUFBSSxZQUFZWCxVQUFXLENBQUM7SUFFOUNpQixPQUFPLEdBQUd0QixLQUFLLENBQUU7TUFDZndCLGNBQWMsRUFBRWYsd0JBQXdCLENBQUM7SUFDM0MsQ0FBQyxFQUFFYSxPQUFRLENBQUM7O0lBRVo7SUFDQSxJQUFJRyxrQkFBa0IsR0FBRyxJQUFJOztJQUU3QjtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDSSxTQUFTQyxhQUFhQSxDQUFFQyxRQUFRLEVBQUVDLE9BQU8sRUFBRUMsd0JBQXdCLEVBQUc7TUFFcEU7TUFDQSxNQUFNQyxLQUFLLEdBQUdGLE9BQU8sQ0FBQ0csY0FBYyxDQUFFSixRQUFRLENBQUNYLElBQUksQ0FBQ2dCLGNBQWMsRUFBRUgsd0JBQXlCLENBQUM7TUFFOUYsSUFBSyxDQUFDSixrQkFBa0IsRUFBRztRQUV6QjtRQUNBQSxrQkFBa0IsR0FBRyxJQUFJbEIsa0JBQWtCLENBQUV1QixLQUFLLEVBQUU7VUFDbERHLFdBQVcsRUFBRSxLQUFLO1VBQUU7VUFDcEJDLGNBQWMsRUFBRTlCLFNBQVMsQ0FBQytCLEtBQUs7VUFDL0JDLFFBQVEsRUFBRWpDLFdBQVcsQ0FBQ2tDLGdCQUFnQixDQUFDRCxRQUFRO1VBQy9DRSxlQUFlLEVBQUVuQyxXQUFXLENBQUNrQyxnQkFBZ0IsQ0FBQ0MsZUFBZTtVQUM3REMsWUFBWSxFQUFFcEMsV0FBVyxDQUFDa0MsZ0JBQWdCLENBQUNFLFlBQVk7VUFDdkRDLFFBQVEsRUFBRWxCLE9BQU8sQ0FBQ0UsY0FBYyxDQUFDWixLQUFLO1VBQ3RDNkIsU0FBUyxFQUFFbkIsT0FBTyxDQUFDRSxjQUFjLENBQUNYO1FBQ3BDLENBQUUsQ0FBQztRQUNIYyxRQUFRLENBQUNlLFFBQVEsQ0FBRWpCLGtCQUFtQixDQUFDO01BQ3pDLENBQUMsTUFDSTtRQUVIO1FBQ0FBLGtCQUFrQixDQUFDa0IsUUFBUSxDQUFFYixLQUFNLENBQUM7TUFDdEM7O01BRUE7TUFDQUwsa0JBQWtCLENBQUNtQixNQUFNLEdBQUdqQixRQUFRLENBQUNrQixjQUFjLENBQUNELE1BQU07SUFDNUQ7SUFFQSxLQUFLLENBQUU1QixJQUFJLEVBQUVDLGNBQWMsRUFBRUMsZUFBZSxFQUFFQyxXQUFXLEVBQUVDLFNBQVMsRUFBRUMsaUJBQWlCLEVBQUVLLGFBQWEsRUFBRUosT0FBUSxDQUFDO0VBQ25IOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UsT0FBT3dCLGVBQWVBLENBQUVkLGNBQWMsRUFBRVYsT0FBTyxFQUFHO0lBRWhEQyxNQUFNLElBQUlBLE1BQU0sQ0FBRVMsY0FBYyxZQUFZMUIsY0FBZSxDQUFDO0lBRTVEZ0IsT0FBTyxHQUFHdEIsS0FBSyxDQUFFO01BQ2Z3QixjQUFjLEVBQUVmLHdCQUF3QixDQUFDO0lBQzNDLENBQUMsRUFBRWEsT0FBUSxDQUFDO0lBRVosTUFBTXlCLFdBQVcsR0FBRyxJQUFJOUMsSUFBSSxDQUFFK0IsY0FBYyxDQUFDZ0IsT0FBTyxDQUFDLENBQUMsRUFBRTtNQUN0REMsSUFBSSxFQUFFOUMsV0FBVyxDQUFDa0MsZ0JBQWdCLENBQUNDLGVBQWU7TUFDbERFLFFBQVEsRUFBRWxCLE9BQU8sQ0FBQ0UsY0FBYyxDQUFDWixLQUFLO01BQ3RDNkIsU0FBUyxFQUFFbkIsT0FBTyxDQUFDRSxjQUFjLENBQUNYO0lBQ3BDLENBQUUsQ0FBQztJQUNILE9BQU9MLFFBQVEsQ0FBQ3NDLGVBQWUsQ0FBRUMsV0FBVyxFQUFFekIsT0FBUSxDQUFDO0VBQ3pEO0FBQ0Y7QUFFQXBCLGVBQWUsQ0FBQ2dELFFBQVEsQ0FBRSxnQkFBZ0IsRUFBRXBDLGNBQWUsQ0FBQyJ9