// Copyright 2013-2021, University of Colorado Boulder

/**
 * This class represents a "mystery mass" in a toolbox.  When the user clicks on this node, the corresponding model
 * element is added to the model at the user's mouse position.
 *
 * @author John Blanco
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import balancingAct from '../../balancingAct.js';
import MysteryMass from '../../common/model/masses/MysteryMass.js';
import MysteryMassNode from '../../common/view/MysteryMassNode.js';
import ImageMassCreatorNode from './ImageMassCreatorNode.js';

// Model-view transform for scaling the node used in the toolbox.  This may scale the node differently than what is
// used in the model so that items in the toolbox can be sized differently (generally smaller).
const SCALING_MVT = ModelViewTransform2.createOffsetScaleMapping(Vector2.ZERO, 150);
class MysteryMassCreatorNode extends ImageMassCreatorNode {
  /**
   * @param {number} mysteryMassID
   * @param {BalanceLabModel} model
   * @param {BasicBalanceScreenView} screenView
   * @param {Object} [options]
   */
  constructor(mysteryMassID, model, screenView, options) {
    super(model, screenView, new MysteryMass(Vector2.ZERO, mysteryMassID, {
      tandem: Tandem.OPT_OUT
    }), false, options);
    this.mysteryMassId = mysteryMassID;
    this.setSelectionNode(new MysteryMassNode(this.prototypeImageMass, SCALING_MVT, false, new Property(false), false, model.columnStateProperty));
    this.positioningOffset = new Vector2(0, -screenView.modelViewTransform.modelToViewDeltaY(this.prototypeImageMass.heightProperty.get() / 2));
  }

  /**
   * @param position
   * @returns {PhetioObject}
   * @override
   * @public
   */
  addElementToModel(position) {
    const mass = this.model.mysteryMassGroup.createNextElement(position, this.mysteryMassId);
    this.model.addMass(mass);
    return mass;
  }
}
balancingAct.register('MysteryMassCreatorNode', MysteryMassCreatorNode);
export default MysteryMassCreatorNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJNb2RlbFZpZXdUcmFuc2Zvcm0yIiwiVGFuZGVtIiwiYmFsYW5jaW5nQWN0IiwiTXlzdGVyeU1hc3MiLCJNeXN0ZXJ5TWFzc05vZGUiLCJJbWFnZU1hc3NDcmVhdG9yTm9kZSIsIlNDQUxJTkdfTVZUIiwiY3JlYXRlT2Zmc2V0U2NhbGVNYXBwaW5nIiwiWkVSTyIsIk15c3RlcnlNYXNzQ3JlYXRvck5vZGUiLCJjb25zdHJ1Y3RvciIsIm15c3RlcnlNYXNzSUQiLCJtb2RlbCIsInNjcmVlblZpZXciLCJvcHRpb25zIiwidGFuZGVtIiwiT1BUX09VVCIsIm15c3RlcnlNYXNzSWQiLCJzZXRTZWxlY3Rpb25Ob2RlIiwicHJvdG90eXBlSW1hZ2VNYXNzIiwiY29sdW1uU3RhdGVQcm9wZXJ0eSIsInBvc2l0aW9uaW5nT2Zmc2V0IiwibW9kZWxWaWV3VHJhbnNmb3JtIiwibW9kZWxUb1ZpZXdEZWx0YVkiLCJoZWlnaHRQcm9wZXJ0eSIsImdldCIsImFkZEVsZW1lbnRUb01vZGVsIiwicG9zaXRpb24iLCJtYXNzIiwibXlzdGVyeU1hc3NHcm91cCIsImNyZWF0ZU5leHRFbGVtZW50IiwiYWRkTWFzcyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTXlzdGVyeU1hc3NDcmVhdG9yTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGlzIGNsYXNzIHJlcHJlc2VudHMgYSBcIm15c3RlcnkgbWFzc1wiIGluIGEgdG9vbGJveC4gIFdoZW4gdGhlIHVzZXIgY2xpY2tzIG9uIHRoaXMgbm9kZSwgdGhlIGNvcnJlc3BvbmRpbmcgbW9kZWxcclxuICogZWxlbWVudCBpcyBhZGRlZCB0byB0aGUgbW9kZWwgYXQgdGhlIHVzZXIncyBtb3VzZSBwb3NpdGlvbi5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBiYWxhbmNpbmdBY3QgZnJvbSAnLi4vLi4vYmFsYW5jaW5nQWN0LmpzJztcclxuaW1wb3J0IE15c3RlcnlNYXNzIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9tYXNzZXMvTXlzdGVyeU1hc3MuanMnO1xyXG5pbXBvcnQgTXlzdGVyeU1hc3NOb2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L015c3RlcnlNYXNzTm9kZS5qcyc7XHJcbmltcG9ydCBJbWFnZU1hc3NDcmVhdG9yTm9kZSBmcm9tICcuL0ltYWdlTWFzc0NyZWF0b3JOb2RlLmpzJztcclxuXHJcbi8vIE1vZGVsLXZpZXcgdHJhbnNmb3JtIGZvciBzY2FsaW5nIHRoZSBub2RlIHVzZWQgaW4gdGhlIHRvb2xib3guICBUaGlzIG1heSBzY2FsZSB0aGUgbm9kZSBkaWZmZXJlbnRseSB0aGFuIHdoYXQgaXNcclxuLy8gdXNlZCBpbiB0aGUgbW9kZWwgc28gdGhhdCBpdGVtcyBpbiB0aGUgdG9vbGJveCBjYW4gYmUgc2l6ZWQgZGlmZmVyZW50bHkgKGdlbmVyYWxseSBzbWFsbGVyKS5cclxuY29uc3QgU0NBTElOR19NVlQgPSBNb2RlbFZpZXdUcmFuc2Zvcm0yLmNyZWF0ZU9mZnNldFNjYWxlTWFwcGluZyggVmVjdG9yMi5aRVJPLCAxNTAgKTtcclxuXHJcbmNsYXNzIE15c3RlcnlNYXNzQ3JlYXRvck5vZGUgZXh0ZW5kcyBJbWFnZU1hc3NDcmVhdG9yTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBteXN0ZXJ5TWFzc0lEXHJcbiAgICogQHBhcmFtIHtCYWxhbmNlTGFiTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtCYXNpY0JhbGFuY2VTY3JlZW5WaWV3fSBzY3JlZW5WaWV3XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBteXN0ZXJ5TWFzc0lELCBtb2RlbCwgc2NyZWVuVmlldywgb3B0aW9ucyApIHtcclxuICAgIHN1cGVyKCBtb2RlbCwgc2NyZWVuVmlldywgbmV3IE15c3RlcnlNYXNzKCBWZWN0b3IyLlpFUk8sIG15c3RlcnlNYXNzSUQsIHsgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCB9ICksIGZhbHNlLCBvcHRpb25zICk7XHJcbiAgICB0aGlzLm15c3RlcnlNYXNzSWQgPSBteXN0ZXJ5TWFzc0lEO1xyXG4gICAgdGhpcy5zZXRTZWxlY3Rpb25Ob2RlKFxyXG4gICAgICBuZXcgTXlzdGVyeU1hc3NOb2RlKFxyXG4gICAgICAgIHRoaXMucHJvdG90eXBlSW1hZ2VNYXNzLFxyXG4gICAgICAgIFNDQUxJTkdfTVZULFxyXG4gICAgICAgIGZhbHNlLFxyXG4gICAgICAgIG5ldyBQcm9wZXJ0eSggZmFsc2UgKSxcclxuICAgICAgICBmYWxzZSxcclxuICAgICAgICBtb2RlbC5jb2x1bW5TdGF0ZVByb3BlcnR5XHJcbiAgICAgIClcclxuICAgICk7XHJcbiAgICB0aGlzLnBvc2l0aW9uaW5nT2Zmc2V0ID0gbmV3IFZlY3RvcjIoXHJcbiAgICAgIDAsXHJcbiAgICAgIC1zY3JlZW5WaWV3Lm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld0RlbHRhWSggdGhpcy5wcm90b3R5cGVJbWFnZU1hc3MuaGVpZ2h0UHJvcGVydHkuZ2V0KCkgLyAyIClcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gcG9zaXRpb25cclxuICAgKiBAcmV0dXJucyB7UGhldGlvT2JqZWN0fVxyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBhZGRFbGVtZW50VG9Nb2RlbCggcG9zaXRpb24gKSB7XHJcbiAgICBjb25zdCBtYXNzID0gdGhpcy5tb2RlbC5teXN0ZXJ5TWFzc0dyb3VwLmNyZWF0ZU5leHRFbGVtZW50KCBwb3NpdGlvbiwgdGhpcy5teXN0ZXJ5TWFzc0lkICk7XHJcbiAgICB0aGlzLm1vZGVsLmFkZE1hc3MoIG1hc3MgKTtcclxuICAgIHJldHVybiBtYXNzO1xyXG4gIH1cclxufVxyXG5cclxuYmFsYW5jaW5nQWN0LnJlZ2lzdGVyKCAnTXlzdGVyeU1hc3NDcmVhdG9yTm9kZScsIE15c3RlcnlNYXNzQ3JlYXRvck5vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE15c3RlcnlNYXNzQ3JlYXRvck5vZGU7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxtQkFBbUIsTUFBTSx1REFBdUQ7QUFDdkYsT0FBT0MsTUFBTSxNQUFNLGlDQUFpQztBQUNwRCxPQUFPQyxZQUFZLE1BQU0sdUJBQXVCO0FBQ2hELE9BQU9DLFdBQVcsTUFBTSwwQ0FBMEM7QUFDbEUsT0FBT0MsZUFBZSxNQUFNLHNDQUFzQztBQUNsRSxPQUFPQyxvQkFBb0IsTUFBTSwyQkFBMkI7O0FBRTVEO0FBQ0E7QUFDQSxNQUFNQyxXQUFXLEdBQUdOLG1CQUFtQixDQUFDTyx3QkFBd0IsQ0FBRVIsT0FBTyxDQUFDUyxJQUFJLEVBQUUsR0FBSSxDQUFDO0FBRXJGLE1BQU1DLHNCQUFzQixTQUFTSixvQkFBb0IsQ0FBQztFQUV4RDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUssV0FBV0EsQ0FBRUMsYUFBYSxFQUFFQyxLQUFLLEVBQUVDLFVBQVUsRUFBRUMsT0FBTyxFQUFHO0lBQ3ZELEtBQUssQ0FBRUYsS0FBSyxFQUFFQyxVQUFVLEVBQUUsSUFBSVYsV0FBVyxDQUFFSixPQUFPLENBQUNTLElBQUksRUFBRUcsYUFBYSxFQUFFO01BQUVJLE1BQU0sRUFBRWQsTUFBTSxDQUFDZTtJQUFRLENBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRUYsT0FBUSxDQUFDO0lBQ3RILElBQUksQ0FBQ0csYUFBYSxHQUFHTixhQUFhO0lBQ2xDLElBQUksQ0FBQ08sZ0JBQWdCLENBQ25CLElBQUlkLGVBQWUsQ0FDakIsSUFBSSxDQUFDZSxrQkFBa0IsRUFDdkJiLFdBQVcsRUFDWCxLQUFLLEVBQ0wsSUFBSVIsUUFBUSxDQUFFLEtBQU0sQ0FBQyxFQUNyQixLQUFLLEVBQ0xjLEtBQUssQ0FBQ1EsbUJBQ1IsQ0FDRixDQUFDO0lBQ0QsSUFBSSxDQUFDQyxpQkFBaUIsR0FBRyxJQUFJdEIsT0FBTyxDQUNsQyxDQUFDLEVBQ0QsQ0FBQ2MsVUFBVSxDQUFDUyxrQkFBa0IsQ0FBQ0MsaUJBQWlCLENBQUUsSUFBSSxDQUFDSixrQkFBa0IsQ0FBQ0ssY0FBYyxDQUFDQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUUsQ0FDckcsQ0FBQztFQUNIOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxpQkFBaUJBLENBQUVDLFFBQVEsRUFBRztJQUM1QixNQUFNQyxJQUFJLEdBQUcsSUFBSSxDQUFDaEIsS0FBSyxDQUFDaUIsZ0JBQWdCLENBQUNDLGlCQUFpQixDQUFFSCxRQUFRLEVBQUUsSUFBSSxDQUFDVixhQUFjLENBQUM7SUFDMUYsSUFBSSxDQUFDTCxLQUFLLENBQUNtQixPQUFPLENBQUVILElBQUssQ0FBQztJQUMxQixPQUFPQSxJQUFJO0VBQ2I7QUFDRjtBQUVBMUIsWUFBWSxDQUFDOEIsUUFBUSxDQUFFLHdCQUF3QixFQUFFdkIsc0JBQXVCLENBQUM7QUFFekUsZUFBZUEsc0JBQXNCIn0=