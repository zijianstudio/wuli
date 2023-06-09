// Copyright 2017-2022, University of Colorado Boulder

import FaceNode from '../../../../scenery-phet/js/FaceNode.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import expressionExchange from '../../expressionExchange.js';
import ExpressionExchangeStrings from '../../ExpressionExchangeStrings.js';

// constants
const FACE_DIAMETER = 150; // empirically determined

const nextString = ExpressionExchangeStrings.next;
class NextLevelNode extends Node {
  /**
   * @param {Function} listener - function that gets called when 'next' button is pressed
   * @param {Object} [options]
   */
  constructor(listener, options) {
    super();

    // add the smiley face
    const faceNode = new FaceNode(FACE_DIAMETER);
    this.addChild(faceNode);
    const button = new RectangularPushButton({
      content: new Text(nextString, {
        font: new PhetFont(30)
      }),
      centerX: faceNode.centerX,
      top: faceNode.bottom + 10,
      listener: listener,
      baseColor: PhetColorScheme.BUTTON_YELLOW
    });

    // add the push button
    this.addChild(button);
    this.mutate(options);
  }
}
expressionExchange.register('NextLevelNode', NextLevelNode);
export default NextLevelNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGYWNlTm9kZSIsIlBoZXRDb2xvclNjaGVtZSIsIlBoZXRGb250IiwiTm9kZSIsIlRleHQiLCJSZWN0YW5ndWxhclB1c2hCdXR0b24iLCJleHByZXNzaW9uRXhjaGFuZ2UiLCJFeHByZXNzaW9uRXhjaGFuZ2VTdHJpbmdzIiwiRkFDRV9ESUFNRVRFUiIsIm5leHRTdHJpbmciLCJuZXh0IiwiTmV4dExldmVsTm9kZSIsImNvbnN0cnVjdG9yIiwibGlzdGVuZXIiLCJvcHRpb25zIiwiZmFjZU5vZGUiLCJhZGRDaGlsZCIsImJ1dHRvbiIsImNvbnRlbnQiLCJmb250IiwiY2VudGVyWCIsInRvcCIsImJvdHRvbSIsImJhc2VDb2xvciIsIkJVVFRPTl9ZRUxMT1ciLCJtdXRhdGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk5leHRMZXZlbE5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG5cclxuaW1wb3J0IEZhY2VOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9GYWNlTm9kZS5qcyc7XHJcbmltcG9ydCBQaGV0Q29sb3JTY2hlbWUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRDb2xvclNjaGVtZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9SZWN0YW5ndWxhclB1c2hCdXR0b24uanMnO1xyXG5pbXBvcnQgZXhwcmVzc2lvbkV4Y2hhbmdlIGZyb20gJy4uLy4uL2V4cHJlc3Npb25FeGNoYW5nZS5qcyc7XHJcbmltcG9ydCBFeHByZXNzaW9uRXhjaGFuZ2VTdHJpbmdzIGZyb20gJy4uLy4uL0V4cHJlc3Npb25FeGNoYW5nZVN0cmluZ3MuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEZBQ0VfRElBTUVURVIgPSAxNTA7IC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuXHJcbmNvbnN0IG5leHRTdHJpbmcgPSBFeHByZXNzaW9uRXhjaGFuZ2VTdHJpbmdzLm5leHQ7XHJcblxyXG5jbGFzcyBOZXh0TGV2ZWxOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyIC0gZnVuY3Rpb24gdGhhdCBnZXRzIGNhbGxlZCB3aGVuICduZXh0JyBidXR0b24gaXMgcHJlc3NlZFxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbGlzdGVuZXIsIG9wdGlvbnMgKSB7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIGFkZCB0aGUgc21pbGV5IGZhY2VcclxuICAgIGNvbnN0IGZhY2VOb2RlID0gbmV3IEZhY2VOb2RlKCBGQUNFX0RJQU1FVEVSICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBmYWNlTm9kZSApO1xyXG5cclxuICAgIGNvbnN0IGJ1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcclxuICAgICAgY29udGVudDogbmV3IFRleHQoIG5leHRTdHJpbmcsIHsgZm9udDogbmV3IFBoZXRGb250KCAzMCApIH0gKSxcclxuICAgICAgY2VudGVyWDogZmFjZU5vZGUuY2VudGVyWCxcclxuICAgICAgdG9wOiBmYWNlTm9kZS5ib3R0b20gKyAxMCxcclxuICAgICAgbGlzdGVuZXI6IGxpc3RlbmVyLFxyXG4gICAgICBiYXNlQ29sb3I6IFBoZXRDb2xvclNjaGVtZS5CVVRUT05fWUVMTE9XXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gYWRkIHRoZSBwdXNoIGJ1dHRvblxyXG4gICAgdGhpcy5hZGRDaGlsZCggYnV0dG9uICk7XHJcblxyXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cHJlc3Npb25FeGNoYW5nZS5yZWdpc3RlciggJ05leHRMZXZlbE5vZGUnLCBOZXh0TGV2ZWxOb2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBOZXh0TGV2ZWxOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBR0EsT0FBT0EsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxPQUFPQyxlQUFlLE1BQU0sZ0RBQWdEO0FBQzVFLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQzlELE9BQU9DLHFCQUFxQixNQUFNLHFEQUFxRDtBQUN2RixPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7QUFDNUQsT0FBT0MseUJBQXlCLE1BQU0sb0NBQW9DOztBQUUxRTtBQUNBLE1BQU1DLGFBQWEsR0FBRyxHQUFHLENBQUMsQ0FBQzs7QUFFM0IsTUFBTUMsVUFBVSxHQUFHRix5QkFBeUIsQ0FBQ0csSUFBSTtBQUVqRCxNQUFNQyxhQUFhLFNBQVNSLElBQUksQ0FBQztFQUUvQjtBQUNGO0FBQ0E7QUFDQTtFQUNFUyxXQUFXQSxDQUFFQyxRQUFRLEVBQUVDLE9BQU8sRUFBRztJQUMvQixLQUFLLENBQUMsQ0FBQzs7SUFFUDtJQUNBLE1BQU1DLFFBQVEsR0FBRyxJQUFJZixRQUFRLENBQUVRLGFBQWMsQ0FBQztJQUM5QyxJQUFJLENBQUNRLFFBQVEsQ0FBRUQsUUFBUyxDQUFDO0lBRXpCLE1BQU1FLE1BQU0sR0FBRyxJQUFJWixxQkFBcUIsQ0FBRTtNQUN4Q2EsT0FBTyxFQUFFLElBQUlkLElBQUksQ0FBRUssVUFBVSxFQUFFO1FBQUVVLElBQUksRUFBRSxJQUFJakIsUUFBUSxDQUFFLEVBQUc7TUFBRSxDQUFFLENBQUM7TUFDN0RrQixPQUFPLEVBQUVMLFFBQVEsQ0FBQ0ssT0FBTztNQUN6QkMsR0FBRyxFQUFFTixRQUFRLENBQUNPLE1BQU0sR0FBRyxFQUFFO01BQ3pCVCxRQUFRLEVBQUVBLFFBQVE7TUFDbEJVLFNBQVMsRUFBRXRCLGVBQWUsQ0FBQ3VCO0lBQzdCLENBQUUsQ0FBQzs7SUFFSDtJQUNBLElBQUksQ0FBQ1IsUUFBUSxDQUFFQyxNQUFPLENBQUM7SUFFdkIsSUFBSSxDQUFDUSxNQUFNLENBQUVYLE9BQVEsQ0FBQztFQUN4QjtBQUNGO0FBRUFSLGtCQUFrQixDQUFDb0IsUUFBUSxDQUFFLGVBQWUsRUFBRWYsYUFBYyxDQUFDO0FBRTdELGVBQWVBLGFBQWEifQ==