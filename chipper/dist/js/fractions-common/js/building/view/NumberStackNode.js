// Copyright 2018-2020, University of Colorado Boulder

/**
 * View for a NumberStack.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import fractionsCommon from '../../fractionsCommon.js';
import NumberPiece from '../model/NumberPiece.js';
import NumberStack from '../model/NumberStack.js';
import NumberPieceNode from './NumberPieceNode.js';
import StackNode from './StackNode.js';
class NumberStackNode extends StackNode {
  /**
   * @param {NumberStack} numberStack
   * @param {Object} [options]
   */
  constructor(numberStack, options) {
    assert && assert(numberStack instanceof NumberStack);
    super(numberStack);

    // @public {NumberStack}
    this.numberStack = numberStack;

    // @private {Array.<NumberPieceNode>}
    this.numberPieceNodes = [];

    // @private {function}
    this.numberPieceAddedListener = this.addNumberPiece.bind(this);
    this.numberPieceRemovedListener = this.removeNumberPiece.bind(this);
    this.stack.numberPieces.addItemAddedListener(this.numberPieceAddedListener);
    this.stack.numberPieces.addItemRemovedListener(this.numberPieceRemovedListener);
    this.stack.numberPieces.forEach(this.numberPieceAddedListener);

    // Inform about our available layout bounds
    const bounds = Bounds2.NOTHING.copy();
    const numberPiece = new NumberPiece(this.numberStack.number);
    const numberPieceNode = new NumberPieceNode(numberPiece);
    for (let i = 0; i < this.numberStack.layoutQuantity; i++) {
      numberPieceNode.translation = NumberStack.getOffset(i);
      bounds.includeBounds(numberPieceNode.bounds);
    }
    numberPieceNode.dispose();
    this.layoutBounds = bounds;
    this.mutate(options);
  }

  /**
   * Adds a NumberPiece's view
   * @private
   *
   * @param {NumberPiece} numberPiece
   */
  addNumberPiece(numberPiece) {
    assert && assert(numberPiece.number === this.numberStack.number);
    const index = this.numberPieceNodes.length;
    const numberPieceNode = new NumberPieceNode(numberPiece, {
      translation: NumberStack.getOffset(index)
    });
    this.numberPieceNodes.push(numberPieceNode);
    this.addChild(numberPieceNode);
  }

  /**
   * Removes a NumberPiece's view
   * @private
   *
   * @param {NumberPiece} numberPiece
   */
  removeNumberPiece(numberPiece) {
    const numberPieceNode = _.find(this.numberPieceNodes, numberPieceNode => {
      return numberPieceNode.numberPiece === numberPiece;
    });
    assert && assert(numberPieceNode);
    arrayRemove(this.numberPieceNodes, numberPieceNode);
    this.removeChild(numberPieceNode);
    numberPieceNode.dispose();
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    this.numberPieceNodes.forEach(numberPieceNode => numberPieceNode.dispose());
    this.stack.numberPieces.removeItemAddedListener(this.numberPieceAddedListener);
    this.stack.numberPieces.removeItemRemovedListener(this.numberPieceRemovedListener);
    super.dispose();
  }
}
fractionsCommon.register('NumberStackNode', NumberStackNode);
export default NumberStackNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiYXJyYXlSZW1vdmUiLCJmcmFjdGlvbnNDb21tb24iLCJOdW1iZXJQaWVjZSIsIk51bWJlclN0YWNrIiwiTnVtYmVyUGllY2VOb2RlIiwiU3RhY2tOb2RlIiwiTnVtYmVyU3RhY2tOb2RlIiwiY29uc3RydWN0b3IiLCJudW1iZXJTdGFjayIsIm9wdGlvbnMiLCJhc3NlcnQiLCJudW1iZXJQaWVjZU5vZGVzIiwibnVtYmVyUGllY2VBZGRlZExpc3RlbmVyIiwiYWRkTnVtYmVyUGllY2UiLCJiaW5kIiwibnVtYmVyUGllY2VSZW1vdmVkTGlzdGVuZXIiLCJyZW1vdmVOdW1iZXJQaWVjZSIsInN0YWNrIiwibnVtYmVyUGllY2VzIiwiYWRkSXRlbUFkZGVkTGlzdGVuZXIiLCJhZGRJdGVtUmVtb3ZlZExpc3RlbmVyIiwiZm9yRWFjaCIsImJvdW5kcyIsIk5PVEhJTkciLCJjb3B5IiwibnVtYmVyUGllY2UiLCJudW1iZXIiLCJudW1iZXJQaWVjZU5vZGUiLCJpIiwibGF5b3V0UXVhbnRpdHkiLCJ0cmFuc2xhdGlvbiIsImdldE9mZnNldCIsImluY2x1ZGVCb3VuZHMiLCJkaXNwb3NlIiwibGF5b3V0Qm91bmRzIiwibXV0YXRlIiwiaW5kZXgiLCJsZW5ndGgiLCJwdXNoIiwiYWRkQ2hpbGQiLCJfIiwiZmluZCIsInJlbW92ZUNoaWxkIiwicmVtb3ZlSXRlbUFkZGVkTGlzdGVuZXIiLCJyZW1vdmVJdGVtUmVtb3ZlZExpc3RlbmVyIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJOdW1iZXJTdGFja05vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVmlldyBmb3IgYSBOdW1iZXJTdGFjay5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IGFycmF5UmVtb3ZlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9hcnJheVJlbW92ZS5qcyc7XHJcbmltcG9ydCBmcmFjdGlvbnNDb21tb24gZnJvbSAnLi4vLi4vZnJhY3Rpb25zQ29tbW9uLmpzJztcclxuaW1wb3J0IE51bWJlclBpZWNlIGZyb20gJy4uL21vZGVsL051bWJlclBpZWNlLmpzJztcclxuaW1wb3J0IE51bWJlclN0YWNrIGZyb20gJy4uL21vZGVsL051bWJlclN0YWNrLmpzJztcclxuaW1wb3J0IE51bWJlclBpZWNlTm9kZSBmcm9tICcuL051bWJlclBpZWNlTm9kZS5qcyc7XHJcbmltcG9ydCBTdGFja05vZGUgZnJvbSAnLi9TdGFja05vZGUuanMnO1xyXG5cclxuY2xhc3MgTnVtYmVyU3RhY2tOb2RlIGV4dGVuZHMgU3RhY2tOb2RlIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge051bWJlclN0YWNrfSBudW1iZXJTdGFja1xyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbnVtYmVyU3RhY2ssIG9wdGlvbnMgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBudW1iZXJTdGFjayBpbnN0YW5jZW9mIE51bWJlclN0YWNrICk7XHJcblxyXG4gICAgc3VwZXIoIG51bWJlclN0YWNrICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7TnVtYmVyU3RhY2t9XHJcbiAgICB0aGlzLm51bWJlclN0YWNrID0gbnVtYmVyU3RhY2s7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0FycmF5LjxOdW1iZXJQaWVjZU5vZGU+fVxyXG4gICAgdGhpcy5udW1iZXJQaWVjZU5vZGVzID0gW107XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Z1bmN0aW9ufVxyXG4gICAgdGhpcy5udW1iZXJQaWVjZUFkZGVkTGlzdGVuZXIgPSB0aGlzLmFkZE51bWJlclBpZWNlLmJpbmQoIHRoaXMgKTtcclxuICAgIHRoaXMubnVtYmVyUGllY2VSZW1vdmVkTGlzdGVuZXIgPSB0aGlzLnJlbW92ZU51bWJlclBpZWNlLmJpbmQoIHRoaXMgKTtcclxuXHJcbiAgICB0aGlzLnN0YWNrLm51bWJlclBpZWNlcy5hZGRJdGVtQWRkZWRMaXN0ZW5lciggdGhpcy5udW1iZXJQaWVjZUFkZGVkTGlzdGVuZXIgKTtcclxuICAgIHRoaXMuc3RhY2subnVtYmVyUGllY2VzLmFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIoIHRoaXMubnVtYmVyUGllY2VSZW1vdmVkTGlzdGVuZXIgKTtcclxuICAgIHRoaXMuc3RhY2subnVtYmVyUGllY2VzLmZvckVhY2goIHRoaXMubnVtYmVyUGllY2VBZGRlZExpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gSW5mb3JtIGFib3V0IG91ciBhdmFpbGFibGUgbGF5b3V0IGJvdW5kc1xyXG4gICAgY29uc3QgYm91bmRzID0gQm91bmRzMi5OT1RISU5HLmNvcHkoKTtcclxuICAgIGNvbnN0IG51bWJlclBpZWNlID0gbmV3IE51bWJlclBpZWNlKCB0aGlzLm51bWJlclN0YWNrLm51bWJlciApO1xyXG4gICAgY29uc3QgbnVtYmVyUGllY2VOb2RlID0gbmV3IE51bWJlclBpZWNlTm9kZSggbnVtYmVyUGllY2UgKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubnVtYmVyU3RhY2subGF5b3V0UXVhbnRpdHk7IGkrKyApIHtcclxuICAgICAgbnVtYmVyUGllY2VOb2RlLnRyYW5zbGF0aW9uID0gTnVtYmVyU3RhY2suZ2V0T2Zmc2V0KCBpICk7XHJcbiAgICAgIGJvdW5kcy5pbmNsdWRlQm91bmRzKCBudW1iZXJQaWVjZU5vZGUuYm91bmRzICk7XHJcbiAgICB9XHJcbiAgICBudW1iZXJQaWVjZU5vZGUuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5sYXlvdXRCb3VuZHMgPSBib3VuZHM7XHJcblxyXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBOdW1iZXJQaWVjZSdzIHZpZXdcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtOdW1iZXJQaWVjZX0gbnVtYmVyUGllY2VcclxuICAgKi9cclxuICBhZGROdW1iZXJQaWVjZSggbnVtYmVyUGllY2UgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBudW1iZXJQaWVjZS5udW1iZXIgPT09IHRoaXMubnVtYmVyU3RhY2subnVtYmVyICk7XHJcblxyXG4gICAgY29uc3QgaW5kZXggPSB0aGlzLm51bWJlclBpZWNlTm9kZXMubGVuZ3RoO1xyXG4gICAgY29uc3QgbnVtYmVyUGllY2VOb2RlID0gbmV3IE51bWJlclBpZWNlTm9kZSggbnVtYmVyUGllY2UsIHtcclxuICAgICAgdHJhbnNsYXRpb246IE51bWJlclN0YWNrLmdldE9mZnNldCggaW5kZXggKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5udW1iZXJQaWVjZU5vZGVzLnB1c2goIG51bWJlclBpZWNlTm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbnVtYmVyUGllY2VOb2RlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIGEgTnVtYmVyUGllY2UncyB2aWV3XHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyUGllY2V9IG51bWJlclBpZWNlXHJcbiAgICovXHJcbiAgcmVtb3ZlTnVtYmVyUGllY2UoIG51bWJlclBpZWNlICkge1xyXG4gICAgY29uc3QgbnVtYmVyUGllY2VOb2RlID0gXy5maW5kKCB0aGlzLm51bWJlclBpZWNlTm9kZXMsIG51bWJlclBpZWNlTm9kZSA9PiB7XHJcbiAgICAgIHJldHVybiBudW1iZXJQaWVjZU5vZGUubnVtYmVyUGllY2UgPT09IG51bWJlclBpZWNlO1xyXG4gICAgfSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbnVtYmVyUGllY2VOb2RlICk7XHJcblxyXG4gICAgYXJyYXlSZW1vdmUoIHRoaXMubnVtYmVyUGllY2VOb2RlcywgbnVtYmVyUGllY2VOb2RlICk7XHJcbiAgICB0aGlzLnJlbW92ZUNoaWxkKCBudW1iZXJQaWVjZU5vZGUgKTtcclxuICAgIG51bWJlclBpZWNlTm9kZS5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWxlYXNlcyByZWZlcmVuY2VzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgdGhpcy5udW1iZXJQaWVjZU5vZGVzLmZvckVhY2goIG51bWJlclBpZWNlTm9kZSA9PiBudW1iZXJQaWVjZU5vZGUuZGlzcG9zZSgpICk7XHJcbiAgICB0aGlzLnN0YWNrLm51bWJlclBpZWNlcy5yZW1vdmVJdGVtQWRkZWRMaXN0ZW5lciggdGhpcy5udW1iZXJQaWVjZUFkZGVkTGlzdGVuZXIgKTtcclxuICAgIHRoaXMuc3RhY2subnVtYmVyUGllY2VzLnJlbW92ZUl0ZW1SZW1vdmVkTGlzdGVuZXIoIHRoaXMubnVtYmVyUGllY2VSZW1vdmVkTGlzdGVuZXIgKTtcclxuXHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5mcmFjdGlvbnNDb21tb24ucmVnaXN0ZXIoICdOdW1iZXJTdGFja05vZGUnLCBOdW1iZXJTdGFja05vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgTnVtYmVyU3RhY2tOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFdBQVcsTUFBTSx5Q0FBeUM7QUFDakUsT0FBT0MsZUFBZSxNQUFNLDBCQUEwQjtBQUN0RCxPQUFPQyxXQUFXLE1BQU0seUJBQXlCO0FBQ2pELE9BQU9DLFdBQVcsTUFBTSx5QkFBeUI7QUFDakQsT0FBT0MsZUFBZSxNQUFNLHNCQUFzQjtBQUNs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