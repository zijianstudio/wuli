// Copyright 2016-2023, University of Colorado Boulder

/**
 * A scene is a particular configuration of functions, cards, and a builder.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import functionBuilder from '../../functionBuilder.js';
import FBConstants from '../FBConstants.js';
export default class Scene {
  /**
   * @param {*[]} cardContent - content that will appear on card, type determined by client
   * @param {FunctionCreator[]} functionCreators - describes how to create functions
   * @param {Builder} builder
   * @param {Object} [options]
   */
  constructor(cardContent, functionCreators, builder, options) {
    options = merge({
      iconNode: null,
      // {Node|null} icon that represents the scene
      cardSymbol: null,
      // {string|null} symbolic input card (e.g. 'x') added to end of card carousel
      numberOfEachCard: 1,
      // {number} number of instances of each card type
      numberOfEachFunction: 1 // {number} number of instances of each function type
    }, options);

    // validate options
    assert && assert(options.numberOfEachCard > 0);
    assert && assert(options.numberOfEachFunction > 0);

    // @public (read-only)
    this.iconNode = options.iconNode;
    this.cardContent = cardContent;
    this.cardSymbol = options.cardSymbol;
    this.numberOfEachCard = options.numberOfEachCard;
    this.functionCreators = functionCreators;
    this.numberOfEachFunction = options.numberOfEachFunction;
    this.builder = builder;

    // @public {Card[]} all cards that exist
    this.cards = [];

    // @public {AbstractFunction[]} all function instances that exist
    this.functionInstances = [];
  }

  // @public
  reset() {
    // function instances
    for (let functionIndex = 0; functionIndex < this.functionInstances.length; functionIndex++) {
      this.functionInstances[functionIndex].reset();
    }

    // cards
    for (let cardIndex = 0; cardIndex < this.cards.length; cardIndex++) {
      this.cards[cardIndex].reset();
    }
  }

  /**
   * Animates the scene.
   *
   * @param {number} dt - time since the previous step, in seconds
   * @public
   */
  step(dt) {
    // function instances
    for (let functionIndex = 0; functionIndex < this.functionInstances.length; functionIndex++) {
      this.functionInstances[functionIndex].step(dt);
    }

    // cards
    for (let cardIndex = 0; cardIndex < this.cards.length; cardIndex++) {
      this.cards[cardIndex].step(dt);
    }
  }

  /**
   * Computes the builder width for the specified number of slots.
   * Constants determined empirically.
   * @param {number} numberOfSlots
   * @returns {number}
   * @public
   * @static
   */
  static computeBuilderWidth(numberOfSlots) {
    if (numberOfSlots === 1) {
      // use a bit of extra padding for single slot
      return FBConstants.FUNCTION_SIZE.width + 200;
    } else {
      return numberOfSlots * FBConstants.FUNCTION_SIZE.width + 70;
    }
  }
}
functionBuilder.register('Scene', Scene);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsImZ1bmN0aW9uQnVpbGRlciIsIkZCQ29uc3RhbnRzIiwiU2NlbmUiLCJjb25zdHJ1Y3RvciIsImNhcmRDb250ZW50IiwiZnVuY3Rpb25DcmVhdG9ycyIsImJ1aWxkZXIiLCJvcHRpb25zIiwiaWNvbk5vZGUiLCJjYXJkU3ltYm9sIiwibnVtYmVyT2ZFYWNoQ2FyZCIsIm51bWJlck9mRWFjaEZ1bmN0aW9uIiwiYXNzZXJ0IiwiY2FyZHMiLCJmdW5jdGlvbkluc3RhbmNlcyIsInJlc2V0IiwiZnVuY3Rpb25JbmRleCIsImxlbmd0aCIsImNhcmRJbmRleCIsInN0ZXAiLCJkdCIsImNvbXB1dGVCdWlsZGVyV2lkdGgiLCJudW1iZXJPZlNsb3RzIiwiRlVOQ1RJT05fU0laRSIsIndpZHRoIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTY2VuZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIHNjZW5lIGlzIGEgcGFydGljdWxhciBjb25maWd1cmF0aW9uIG9mIGZ1bmN0aW9ucywgY2FyZHMsIGFuZCBhIGJ1aWxkZXIuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBmdW5jdGlvbkJ1aWxkZXIgZnJvbSAnLi4vLi4vZnVuY3Rpb25CdWlsZGVyLmpzJztcclxuaW1wb3J0IEZCQ29uc3RhbnRzIGZyb20gJy4uL0ZCQ29uc3RhbnRzLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjZW5lIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHsqW119IGNhcmRDb250ZW50IC0gY29udGVudCB0aGF0IHdpbGwgYXBwZWFyIG9uIGNhcmQsIHR5cGUgZGV0ZXJtaW5lZCBieSBjbGllbnRcclxuICAgKiBAcGFyYW0ge0Z1bmN0aW9uQ3JlYXRvcltdfSBmdW5jdGlvbkNyZWF0b3JzIC0gZGVzY3JpYmVzIGhvdyB0byBjcmVhdGUgZnVuY3Rpb25zXHJcbiAgICogQHBhcmFtIHtCdWlsZGVyfSBidWlsZGVyXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBjYXJkQ29udGVudCwgZnVuY3Rpb25DcmVhdG9ycywgYnVpbGRlciwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgaWNvbk5vZGU6IG51bGwsIC8vIHtOb2RlfG51bGx9IGljb24gdGhhdCByZXByZXNlbnRzIHRoZSBzY2VuZVxyXG4gICAgICBjYXJkU3ltYm9sOiBudWxsLCAvLyB7c3RyaW5nfG51bGx9IHN5bWJvbGljIGlucHV0IGNhcmQgKGUuZy4gJ3gnKSBhZGRlZCB0byBlbmQgb2YgY2FyZCBjYXJvdXNlbFxyXG4gICAgICBudW1iZXJPZkVhY2hDYXJkOiAxLCAvLyB7bnVtYmVyfSBudW1iZXIgb2YgaW5zdGFuY2VzIG9mIGVhY2ggY2FyZCB0eXBlXHJcbiAgICAgIG51bWJlck9mRWFjaEZ1bmN0aW9uOiAxIC8vIHtudW1iZXJ9IG51bWJlciBvZiBpbnN0YW5jZXMgb2YgZWFjaCBmdW5jdGlvbiB0eXBlXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gdmFsaWRhdGUgb3B0aW9uc1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5udW1iZXJPZkVhY2hDYXJkID4gMCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5udW1iZXJPZkVhY2hGdW5jdGlvbiA+IDAgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpXHJcbiAgICB0aGlzLmljb25Ob2RlID0gb3B0aW9ucy5pY29uTm9kZTtcclxuICAgIHRoaXMuY2FyZENvbnRlbnQgPSBjYXJkQ29udGVudDtcclxuICAgIHRoaXMuY2FyZFN5bWJvbCA9IG9wdGlvbnMuY2FyZFN5bWJvbDtcclxuICAgIHRoaXMubnVtYmVyT2ZFYWNoQ2FyZCA9IG9wdGlvbnMubnVtYmVyT2ZFYWNoQ2FyZDtcclxuICAgIHRoaXMuZnVuY3Rpb25DcmVhdG9ycyA9IGZ1bmN0aW9uQ3JlYXRvcnM7XHJcbiAgICB0aGlzLm51bWJlck9mRWFjaEZ1bmN0aW9uID0gb3B0aW9ucy5udW1iZXJPZkVhY2hGdW5jdGlvbjtcclxuICAgIHRoaXMuYnVpbGRlciA9IGJ1aWxkZXI7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Q2FyZFtdfSBhbGwgY2FyZHMgdGhhdCBleGlzdFxyXG4gICAgdGhpcy5jYXJkcyA9IFtdO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0Fic3RyYWN0RnVuY3Rpb25bXX0gYWxsIGZ1bmN0aW9uIGluc3RhbmNlcyB0aGF0IGV4aXN0XHJcbiAgICB0aGlzLmZ1bmN0aW9uSW5zdGFuY2VzID0gW107XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljXHJcbiAgcmVzZXQoKSB7XHJcblxyXG4gICAgLy8gZnVuY3Rpb24gaW5zdGFuY2VzXHJcbiAgICBmb3IgKCBsZXQgZnVuY3Rpb25JbmRleCA9IDA7IGZ1bmN0aW9uSW5kZXggPCB0aGlzLmZ1bmN0aW9uSW5zdGFuY2VzLmxlbmd0aDsgZnVuY3Rpb25JbmRleCsrICkge1xyXG4gICAgICB0aGlzLmZ1bmN0aW9uSW5zdGFuY2VzWyBmdW5jdGlvbkluZGV4IF0ucmVzZXQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjYXJkc1xyXG4gICAgZm9yICggbGV0IGNhcmRJbmRleCA9IDA7IGNhcmRJbmRleCA8IHRoaXMuY2FyZHMubGVuZ3RoOyBjYXJkSW5kZXgrKyApIHtcclxuICAgICAgdGhpcy5jYXJkc1sgY2FyZEluZGV4IF0ucmVzZXQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFuaW1hdGVzIHRoZSBzY2VuZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtIHRpbWUgc2luY2UgdGhlIHByZXZpb3VzIHN0ZXAsIGluIHNlY29uZHNcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc3RlcCggZHQgKSB7XHJcblxyXG4gICAgLy8gZnVuY3Rpb24gaW5zdGFuY2VzXHJcbiAgICBmb3IgKCBsZXQgZnVuY3Rpb25JbmRleCA9IDA7IGZ1bmN0aW9uSW5kZXggPCB0aGlzLmZ1bmN0aW9uSW5zdGFuY2VzLmxlbmd0aDsgZnVuY3Rpb25JbmRleCsrICkge1xyXG4gICAgICB0aGlzLmZ1bmN0aW9uSW5zdGFuY2VzWyBmdW5jdGlvbkluZGV4IF0uc3RlcCggZHQgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjYXJkc1xyXG4gICAgZm9yICggbGV0IGNhcmRJbmRleCA9IDA7IGNhcmRJbmRleCA8IHRoaXMuY2FyZHMubGVuZ3RoOyBjYXJkSW5kZXgrKyApIHtcclxuICAgICAgdGhpcy5jYXJkc1sgY2FyZEluZGV4IF0uc3RlcCggZHQgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbXB1dGVzIHRoZSBidWlsZGVyIHdpZHRoIGZvciB0aGUgc3BlY2lmaWVkIG51bWJlciBvZiBzbG90cy5cclxuICAgKiBDb25zdGFudHMgZGV0ZXJtaW5lZCBlbXBpcmljYWxseS5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gbnVtYmVyT2ZTbG90c1xyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBzdGF0aWNcclxuICAgKi9cclxuICBzdGF0aWMgY29tcHV0ZUJ1aWxkZXJXaWR0aCggbnVtYmVyT2ZTbG90cyApIHtcclxuICAgIGlmICggbnVtYmVyT2ZTbG90cyA9PT0gMSApIHtcclxuXHJcbiAgICAgIC8vIHVzZSBhIGJpdCBvZiBleHRyYSBwYWRkaW5nIGZvciBzaW5nbGUgc2xvdFxyXG4gICAgICByZXR1cm4gRkJDb25zdGFudHMuRlVOQ1RJT05fU0laRS53aWR0aCArIDIwMDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gKCBudW1iZXJPZlNsb3RzICogRkJDb25zdGFudHMuRlVOQ1RJT05fU0laRS53aWR0aCApICsgNzA7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbkJ1aWxkZXIucmVnaXN0ZXIoICdTY2VuZScsIFNjZW5lICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsZUFBZSxNQUFNLDBCQUEwQjtBQUN0RCxPQUFPQyxXQUFXLE1BQU0sbUJBQW1CO0FBRTNDLGVBQWUsTUFBTUMsS0FBSyxDQUFDO0VBRXpCO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxXQUFXLEVBQUVDLGdCQUFnQixFQUFFQyxPQUFPLEVBQUVDLE9BQU8sRUFBRztJQUU3REEsT0FBTyxHQUFHUixLQUFLLENBQUU7TUFDZlMsUUFBUSxFQUFFLElBQUk7TUFBRTtNQUNoQkMsVUFBVSxFQUFFLElBQUk7TUFBRTtNQUNsQkMsZ0JBQWdCLEVBQUUsQ0FBQztNQUFFO01BQ3JCQyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7SUFDMUIsQ0FBQyxFQUFFSixPQUFRLENBQUM7O0lBRVo7SUFDQUssTUFBTSxJQUFJQSxNQUFNLENBQUVMLE9BQU8sQ0FBQ0csZ0JBQWdCLEdBQUcsQ0FBRSxDQUFDO0lBQ2hERSxNQUFNLElBQUlBLE1BQU0sQ0FBRUwsT0FBTyxDQUFDSSxvQkFBb0IsR0FBRyxDQUFFLENBQUM7O0lBRXBEO0lBQ0EsSUFBSSxDQUFDSCxRQUFRLEdBQUdELE9BQU8sQ0FBQ0MsUUFBUTtJQUNoQyxJQUFJLENBQUNKLFdBQVcsR0FBR0EsV0FBVztJQUM5QixJQUFJLENBQUNLLFVBQVUsR0FBR0YsT0FBTyxDQUFDRSxVQUFVO0lBQ3BDLElBQUksQ0FBQ0MsZ0JBQWdCLEdBQUdILE9BQU8sQ0FBQ0csZ0JBQWdCO0lBQ2hELElBQUksQ0FBQ0wsZ0JBQWdCLEdBQUdBLGdCQUFnQjtJQUN4QyxJQUFJLENBQUNNLG9CQUFvQixHQUFHSixPQUFPLENBQUNJLG9CQUFvQjtJQUN4RCxJQUFJLENBQUNMLE9BQU8sR0FBR0EsT0FBTzs7SUFFdEI7SUFDQSxJQUFJLENBQUNPLEtBQUssR0FBRyxFQUFFOztJQUVmO0lBQ0EsSUFBSSxDQUFDQyxpQkFBaUIsR0FBRyxFQUFFO0VBQzdCOztFQUVBO0VBQ0FDLEtBQUtBLENBQUEsRUFBRztJQUVOO0lBQ0EsS0FBTSxJQUFJQyxhQUFhLEdBQUcsQ0FBQyxFQUFFQSxhQUFhLEdBQUcsSUFBSSxDQUFDRixpQkFBaUIsQ0FBQ0csTUFBTSxFQUFFRCxhQUFhLEVBQUUsRUFBRztNQUM1RixJQUFJLENBQUNGLGlCQUFpQixDQUFFRSxhQUFhLENBQUUsQ0FBQ0QsS0FBSyxDQUFDLENBQUM7SUFDakQ7O0lBRUE7SUFDQSxLQUFNLElBQUlHLFNBQVMsR0FBRyxDQUFDLEVBQUVBLFNBQVMsR0FBRyxJQUFJLENBQUNMLEtBQUssQ0FBQ0ksTUFBTSxFQUFFQyxTQUFTLEVBQUUsRUFBRztNQUNwRSxJQUFJLENBQUNMLEtBQUssQ0FBRUssU0FBUyxDQUFFLENBQUNILEtBQUssQ0FBQyxDQUFDO0lBQ2pDO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VJLElBQUlBLENBQUVDLEVBQUUsRUFBRztJQUVUO0lBQ0EsS0FBTSxJQUFJSixhQUFhLEdBQUcsQ0FBQyxFQUFFQSxhQUFhLEdBQUcsSUFBSSxDQUFDRixpQkFBaUIsQ0FBQ0csTUFBTSxFQUFFRCxhQUFhLEVBQUUsRUFBRztNQUM1RixJQUFJLENBQUNGLGlCQUFpQixDQUFFRSxhQUFhLENBQUUsQ0FBQ0csSUFBSSxDQUFFQyxFQUFHLENBQUM7SUFDcEQ7O0lBRUE7SUFDQSxLQUFNLElBQUlGLFNBQVMsR0FBRyxDQUFDLEVBQUVBLFNBQVMsR0FBRyxJQUFJLENBQUNMLEtBQUssQ0FBQ0ksTUFBTSxFQUFFQyxTQUFTLEVBQUUsRUFBRztNQUNwRSxJQUFJLENBQUNMLEtBQUssQ0FBRUssU0FBUyxDQUFFLENBQUNDLElBQUksQ0FBRUMsRUFBRyxDQUFDO0lBQ3BDO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLE9BQU9DLG1CQUFtQkEsQ0FBRUMsYUFBYSxFQUFHO0lBQzFDLElBQUtBLGFBQWEsS0FBSyxDQUFDLEVBQUc7TUFFekI7TUFDQSxPQUFPckIsV0FBVyxDQUFDc0IsYUFBYSxDQUFDQyxLQUFLLEdBQUcsR0FBRztJQUM5QyxDQUFDLE1BQ0k7TUFDSCxPQUFTRixhQUFhLEdBQUdyQixXQUFXLENBQUNzQixhQUFhLENBQUNDLEtBQUssR0FBSyxFQUFFO0lBQ2pFO0VBQ0Y7QUFDRjtBQUVBeEIsZUFBZSxDQUFDeUIsUUFBUSxDQUFFLE9BQU8sRUFBRXZCLEtBQU0sQ0FBQyJ9