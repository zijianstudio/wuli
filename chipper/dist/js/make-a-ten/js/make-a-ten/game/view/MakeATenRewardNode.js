// Copyright 2016-2021, University of Colorado Boulder

/**
 * Shows a reward, and allows the user to (a) keep going with the current level, or (b) go back to the level selection.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BaseNumber from '../../../../../counting-common/js/common/model/BaseNumber.js';
import BaseNumberNode from '../../../../../counting-common/js/common/view/BaseNumberNode.js';
import FaceNode from '../../../../../scenery-phet/js/FaceNode.js';
import StarNode from '../../../../../scenery-phet/js/StarNode.js';
import RewardNode from '../../../../../vegas/js/RewardNode.js';
import makeATen from '../../../makeATen.js';
class MakeATenRewardNode extends RewardNode {
  constructor() {
    super({
      nodes: RewardNode.createRandomNodes([new StarNode(), new StarNode(), new StarNode(), new StarNode(), new StarNode(), new StarNode(), new StarNode(), new FaceNode(40, {
        headStroke: 'black'
      }), new FaceNode(40, {
        headStroke: 'black'
      }), new FaceNode(40, {
        headStroke: 'black'
      }), new FaceNode(40, {
        headStroke: 'black'
      }), new FaceNode(40, {
        headStroke: 'black'
      }), new FaceNode(40, {
        headStroke: 'black'
      }), new FaceNode(40, {
        headStroke: 'black'
      }), createNumber(1, 0), createNumber(2, 0), createNumber(3, 0), createNumber(4, 0), createNumber(5, 0), createNumber(6, 0), createNumber(7, 0), createNumber(8, 0), createNumber(9, 0), createNumber(1, 1), createNumber(1, 1), createNumber(1, 1), createNumber(1, 1), createNumber(1, 1)], 150)
    });
  }
}
function createNumber(digit, place) {
  const node = new BaseNumberNode(new BaseNumber(digit, place), 1);
  node.scale(0.5);
  return node;
}
makeATen.register('MakeATenRewardNode', MakeATenRewardNode);
export default MakeATenRewardNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCYXNlTnVtYmVyIiwiQmFzZU51bWJlck5vZGUiLCJGYWNlTm9kZSIsIlN0YXJOb2RlIiwiUmV3YXJkTm9kZSIsIm1ha2VBVGVuIiwiTWFrZUFUZW5SZXdhcmROb2RlIiwiY29uc3RydWN0b3IiLCJub2RlcyIsImNyZWF0ZVJhbmRvbU5vZGVzIiwiaGVhZFN0cm9rZSIsImNyZWF0ZU51bWJlciIsImRpZ2l0IiwicGxhY2UiLCJub2RlIiwic2NhbGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1ha2VBVGVuUmV3YXJkTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTaG93cyBhIHJld2FyZCwgYW5kIGFsbG93cyB0aGUgdXNlciB0byAoYSkga2VlcCBnb2luZyB3aXRoIHRoZSBjdXJyZW50IGxldmVsLCBvciAoYikgZ28gYmFjayB0byB0aGUgbGV2ZWwgc2VsZWN0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IEJhc2VOdW1iZXIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vY291bnRpbmctY29tbW9uL2pzL2NvbW1vbi9tb2RlbC9CYXNlTnVtYmVyLmpzJztcclxuaW1wb3J0IEJhc2VOdW1iZXJOb2RlIGZyb20gJy4uLy4uLy4uLy4uLy4uL2NvdW50aW5nLWNvbW1vbi9qcy9jb21tb24vdmlldy9CYXNlTnVtYmVyTm9kZS5qcyc7XHJcbmltcG9ydCBGYWNlTm9kZSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvRmFjZU5vZGUuanMnO1xyXG5pbXBvcnQgU3Rhck5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1N0YXJOb2RlLmpzJztcclxuaW1wb3J0IFJld2FyZE5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vLi4vdmVnYXMvanMvUmV3YXJkTm9kZS5qcyc7XHJcbmltcG9ydCBtYWtlQVRlbiBmcm9tICcuLi8uLi8uLi9tYWtlQVRlbi5qcyc7XHJcblxyXG5jbGFzcyBNYWtlQVRlblJld2FyZE5vZGUgZXh0ZW5kcyBSZXdhcmROb2RlIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIG5vZGVzOiBSZXdhcmROb2RlLmNyZWF0ZVJhbmRvbU5vZGVzKCBbXHJcbiAgICAgICAgbmV3IFN0YXJOb2RlKCksXHJcbiAgICAgICAgbmV3IFN0YXJOb2RlKCksXHJcbiAgICAgICAgbmV3IFN0YXJOb2RlKCksXHJcbiAgICAgICAgbmV3IFN0YXJOb2RlKCksXHJcbiAgICAgICAgbmV3IFN0YXJOb2RlKCksXHJcbiAgICAgICAgbmV3IFN0YXJOb2RlKCksXHJcbiAgICAgICAgbmV3IFN0YXJOb2RlKCksXHJcbiAgICAgICAgbmV3IEZhY2VOb2RlKCA0MCwgeyBoZWFkU3Ryb2tlOiAnYmxhY2snIH0gKSxcclxuICAgICAgICBuZXcgRmFjZU5vZGUoIDQwLCB7IGhlYWRTdHJva2U6ICdibGFjaycgfSApLFxyXG4gICAgICAgIG5ldyBGYWNlTm9kZSggNDAsIHsgaGVhZFN0cm9rZTogJ2JsYWNrJyB9ICksXHJcbiAgICAgICAgbmV3IEZhY2VOb2RlKCA0MCwgeyBoZWFkU3Ryb2tlOiAnYmxhY2snIH0gKSxcclxuICAgICAgICBuZXcgRmFjZU5vZGUoIDQwLCB7IGhlYWRTdHJva2U6ICdibGFjaycgfSApLFxyXG4gICAgICAgIG5ldyBGYWNlTm9kZSggNDAsIHsgaGVhZFN0cm9rZTogJ2JsYWNrJyB9ICksXHJcbiAgICAgICAgbmV3IEZhY2VOb2RlKCA0MCwgeyBoZWFkU3Ryb2tlOiAnYmxhY2snIH0gKSxcclxuICAgICAgICBjcmVhdGVOdW1iZXIoIDEsIDAgKSxcclxuICAgICAgICBjcmVhdGVOdW1iZXIoIDIsIDAgKSxcclxuICAgICAgICBjcmVhdGVOdW1iZXIoIDMsIDAgKSxcclxuICAgICAgICBjcmVhdGVOdW1iZXIoIDQsIDAgKSxcclxuICAgICAgICBjcmVhdGVOdW1iZXIoIDUsIDAgKSxcclxuICAgICAgICBjcmVhdGVOdW1iZXIoIDYsIDAgKSxcclxuICAgICAgICBjcmVhdGVOdW1iZXIoIDcsIDAgKSxcclxuICAgICAgICBjcmVhdGVOdW1iZXIoIDgsIDAgKSxcclxuICAgICAgICBjcmVhdGVOdW1iZXIoIDksIDAgKSxcclxuICAgICAgICBjcmVhdGVOdW1iZXIoIDEsIDEgKSxcclxuICAgICAgICBjcmVhdGVOdW1iZXIoIDEsIDEgKSxcclxuICAgICAgICBjcmVhdGVOdW1iZXIoIDEsIDEgKSxcclxuICAgICAgICBjcmVhdGVOdW1iZXIoIDEsIDEgKSxcclxuICAgICAgICBjcmVhdGVOdW1iZXIoIDEsIDEgKVxyXG4gICAgICBdLCAxNTAgKVxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlTnVtYmVyKCBkaWdpdCwgcGxhY2UgKSB7XHJcbiAgY29uc3Qgbm9kZSA9IG5ldyBCYXNlTnVtYmVyTm9kZSggbmV3IEJhc2VOdW1iZXIoIGRpZ2l0LCBwbGFjZSApLCAxICk7XHJcbiAgbm9kZS5zY2FsZSggMC41ICk7XHJcbiAgcmV0dXJuIG5vZGU7XHJcbn1cclxuXHJcbm1ha2VBVGVuLnJlZ2lzdGVyKCAnTWFrZUFUZW5SZXdhcmROb2RlJywgTWFrZUFUZW5SZXdhcmROb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IE1ha2VBVGVuUmV3YXJkTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsVUFBVSxNQUFNLDhEQUE4RDtBQUNyRixPQUFPQyxjQUFjLE1BQU0saUVBQWlFO0FBQzVGLE9BQU9DLFFBQVEsTUFBTSw0Q0FBNEM7QUFDakUsT0FBT0MsUUFBUSxNQUFNLDRDQUE0QztBQUNqRSxPQUFPQyxVQUFVLE1BQU0sdUNBQXVDO0FBQzlELE9BQU9DLFFBQVEs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