// Copyright 2017-2022, University of Colorado Boulder

/**
 * View of a scene in the 'Operations' screen.
 * Like the scene in the 'Variables' screen, but with an added control for applying a universal operation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Node } from '../../../../scenery/js/imports.js';
import SumToZeroNode from '../../common/view/SumToZeroNode.js';
import UniversalOperationControl from '../../common/view/UniversalOperationControl.js';
import equalityExplorer from '../../equalityExplorer.js';
import VariablesSceneNode from '../../variables/view/VariablesSceneNode.js';
import optionize from '../../../../phet-core/js/optionize.js';
export default class OperationsSceneNode extends VariablesSceneNode {
  // Universal Operation control, below Equation accordion box

  constructor(scene, equationAccordionBoxExpandedProperty, snapshotsAccordionBoxExpandedProperty, layoutBounds, providedOptions) {
    const options = optionize()({
      // VariablesSceneNodeOptions
      organizeButtonVisible: false // like terms are combines, so the organize button is not relevant in this screen
    }, providedOptions);
    super(scene, equationAccordionBoxExpandedProperty, snapshotsAccordionBoxExpandedProperty, layoutBounds, options);

    // Layer when universal operation animation occurs
    const operationAnimationLayer = new Node();
    this.universalOperationControl = new UniversalOperationControl(scene, operationAnimationLayer, {
      tandem: options.tandem.createTandem('universalOperationControl')
    });
    this.addChild(this.universalOperationControl);
    this.universalOperationControl.moveToBack();
    this.universalOperationControl.boundsProperty.link(bounds => {
      this.universalOperationControl.centerX = scene.scale.position.x; // centered on the scale
      this.universalOperationControl.top = this.equationAccordionBox.bottom + 10;
    });

    // Put animation layer on top of everything
    this.addChild(operationAnimationLayer);

    // Perform sum-to-zero animation for any terms that became zero as the result of a universal operation.
    scene.sumToZeroEmitter.addListener(termCreators => SumToZeroNode.animateSumToZero(termCreators, this.termsLayer));
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }

  /**
   * @param dt - time step, in seconds
   */
  step(dt) {
    this.universalOperationControl.step(dt);
    super.step(dt);
  }
  reset() {
    // universal operation control has Properties and animations that may be in progress
    this.universalOperationControl.reset();
    super.reset();
  }
}
equalityExplorer.register('OperationsSceneNode', OperationsSceneNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOb2RlIiwiU3VtVG9aZXJvTm9kZSIsIlVuaXZlcnNhbE9wZXJhdGlvbkNvbnRyb2wiLCJlcXVhbGl0eUV4cGxvcmVyIiwiVmFyaWFibGVzU2NlbmVOb2RlIiwib3B0aW9uaXplIiwiT3BlcmF0aW9uc1NjZW5lTm9kZSIsImNvbnN0cnVjdG9yIiwic2NlbmUiLCJlcXVhdGlvbkFjY29yZGlvbkJveEV4cGFuZGVkUHJvcGVydHkiLCJzbmFwc2hvdHNBY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5IiwibGF5b3V0Qm91bmRzIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsIm9yZ2FuaXplQnV0dG9uVmlzaWJsZSIsIm9wZXJhdGlvbkFuaW1hdGlvbkxheWVyIiwidW5pdmVyc2FsT3BlcmF0aW9uQ29udHJvbCIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsImFkZENoaWxkIiwibW92ZVRvQmFjayIsImJvdW5kc1Byb3BlcnR5IiwibGluayIsImJvdW5kcyIsImNlbnRlclgiLCJzY2FsZSIsInBvc2l0aW9uIiwieCIsInRvcCIsImVxdWF0aW9uQWNjb3JkaW9uQm94IiwiYm90dG9tIiwic3VtVG9aZXJvRW1pdHRlciIsImFkZExpc3RlbmVyIiwidGVybUNyZWF0b3JzIiwiYW5pbWF0ZVN1bVRvWmVybyIsInRlcm1zTGF5ZXIiLCJkaXNwb3NlIiwiYXNzZXJ0Iiwic3RlcCIsImR0IiwicmVzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk9wZXJhdGlvbnNTY2VuZU5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVmlldyBvZiBhIHNjZW5lIGluIHRoZSAnT3BlcmF0aW9ucycgc2NyZWVuLlxyXG4gKiBMaWtlIHRoZSBzY2VuZSBpbiB0aGUgJ1ZhcmlhYmxlcycgc2NyZWVuLCBidXQgd2l0aCBhbiBhZGRlZCBjb250cm9sIGZvciBhcHBseWluZyBhIHVuaXZlcnNhbCBvcGVyYXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBTdW1Ub1plcm9Ob2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1N1bVRvWmVyb05vZGUuanMnO1xyXG5pbXBvcnQgVW5pdmVyc2FsT3BlcmF0aW9uQ29udHJvbCBmcm9tICcuLi8uLi9jb21tb24vdmlldy9Vbml2ZXJzYWxPcGVyYXRpb25Db250cm9sLmpzJztcclxuaW1wb3J0IGVxdWFsaXR5RXhwbG9yZXIgZnJvbSAnLi4vLi4vZXF1YWxpdHlFeHBsb3Jlci5qcyc7XHJcbmltcG9ydCBWYXJpYWJsZXNTY2VuZU5vZGUsIHsgVmFyaWFibGVzU2NlbmVOb2RlT3B0aW9ucyB9IGZyb20gJy4uLy4uL3ZhcmlhYmxlcy92aWV3L1ZhcmlhYmxlc1NjZW5lTm9kZS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IE9wZXJhdGlvbnNTY2VuZSBmcm9tICcuLi9tb2RlbC9PcGVyYXRpb25zU2NlbmUuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG5leHBvcnQgdHlwZSBPcGVyYXRpb25zU2NlbmVOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgVmFyaWFibGVzU2NlbmVOb2RlT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9wZXJhdGlvbnNTY2VuZU5vZGUgZXh0ZW5kcyBWYXJpYWJsZXNTY2VuZU5vZGUge1xyXG5cclxuICAvLyBVbml2ZXJzYWwgT3BlcmF0aW9uIGNvbnRyb2wsIGJlbG93IEVxdWF0aW9uIGFjY29yZGlvbiBib3hcclxuICBwcml2YXRlIHJlYWRvbmx5IHVuaXZlcnNhbE9wZXJhdGlvbkNvbnRyb2w6IFVuaXZlcnNhbE9wZXJhdGlvbkNvbnRyb2w7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc2NlbmU6IE9wZXJhdGlvbnNTY2VuZSxcclxuICAgICAgICAgICAgICAgICAgICAgIGVxdWF0aW9uQWNjb3JkaW9uQm94RXhwYW5kZWRQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBzbmFwc2hvdHNBY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPixcclxuICAgICAgICAgICAgICAgICAgICAgIGxheW91dEJvdW5kczogQm91bmRzMixcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9uczogT3BlcmF0aW9uc1NjZW5lTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxPcGVyYXRpb25zU2NlbmVOb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIFZhcmlhYmxlc1NjZW5lTm9kZU9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFZhcmlhYmxlc1NjZW5lTm9kZU9wdGlvbnNcclxuICAgICAgb3JnYW5pemVCdXR0b25WaXNpYmxlOiBmYWxzZSAvLyBsaWtlIHRlcm1zIGFyZSBjb21iaW5lcywgc28gdGhlIG9yZ2FuaXplIGJ1dHRvbiBpcyBub3QgcmVsZXZhbnQgaW4gdGhpcyBzY3JlZW5cclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBzY2VuZSwgZXF1YXRpb25BY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5LCBzbmFwc2hvdHNBY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5LCBsYXlvdXRCb3VuZHMsIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBMYXllciB3aGVuIHVuaXZlcnNhbCBvcGVyYXRpb24gYW5pbWF0aW9uIG9jY3Vyc1xyXG4gICAgY29uc3Qgb3BlcmF0aW9uQW5pbWF0aW9uTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG5cclxuICAgIHRoaXMudW5pdmVyc2FsT3BlcmF0aW9uQ29udHJvbCA9IG5ldyBVbml2ZXJzYWxPcGVyYXRpb25Db250cm9sKCBzY2VuZSwgb3BlcmF0aW9uQW5pbWF0aW9uTGF5ZXIsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd1bml2ZXJzYWxPcGVyYXRpb25Db250cm9sJyApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnVuaXZlcnNhbE9wZXJhdGlvbkNvbnRyb2wgKTtcclxuICAgIHRoaXMudW5pdmVyc2FsT3BlcmF0aW9uQ29udHJvbC5tb3ZlVG9CYWNrKCk7XHJcblxyXG4gICAgdGhpcy51bml2ZXJzYWxPcGVyYXRpb25Db250cm9sLmJvdW5kc1Byb3BlcnR5LmxpbmsoIGJvdW5kcyA9PiB7XHJcbiAgICAgIHRoaXMudW5pdmVyc2FsT3BlcmF0aW9uQ29udHJvbC5jZW50ZXJYID0gc2NlbmUuc2NhbGUucG9zaXRpb24ueDsgLy8gY2VudGVyZWQgb24gdGhlIHNjYWxlXHJcbiAgICAgIHRoaXMudW5pdmVyc2FsT3BlcmF0aW9uQ29udHJvbC50b3AgPSB0aGlzLmVxdWF0aW9uQWNjb3JkaW9uQm94LmJvdHRvbSArIDEwO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFB1dCBhbmltYXRpb24gbGF5ZXIgb24gdG9wIG9mIGV2ZXJ5dGhpbmdcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG9wZXJhdGlvbkFuaW1hdGlvbkxheWVyICk7XHJcblxyXG4gICAgLy8gUGVyZm9ybSBzdW0tdG8temVybyBhbmltYXRpb24gZm9yIGFueSB0ZXJtcyB0aGF0IGJlY2FtZSB6ZXJvIGFzIHRoZSByZXN1bHQgb2YgYSB1bml2ZXJzYWwgb3BlcmF0aW9uLlxyXG4gICAgc2NlbmUuc3VtVG9aZXJvRW1pdHRlci5hZGRMaXN0ZW5lciggdGVybUNyZWF0b3JzID0+IFN1bVRvWmVyb05vZGUuYW5pbWF0ZVN1bVRvWmVybyggdGVybUNyZWF0b3JzLCB0aGlzLnRlcm1zTGF5ZXIgKSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBkdCAtIHRpbWUgc3RlcCwgaW4gc2Vjb25kc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBzdGVwKCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgdGhpcy51bml2ZXJzYWxPcGVyYXRpb25Db250cm9sLnN0ZXAoIGR0ICk7XHJcbiAgICBzdXBlci5zdGVwKCBkdCApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIHJlc2V0KCk6IHZvaWQge1xyXG5cclxuICAgIC8vIHVuaXZlcnNhbCBvcGVyYXRpb24gY29udHJvbCBoYXMgUHJvcGVydGllcyBhbmQgYW5pbWF0aW9ucyB0aGF0IG1heSBiZSBpbiBwcm9ncmVzc1xyXG4gICAgdGhpcy51bml2ZXJzYWxPcGVyYXRpb25Db250cm9sLnJlc2V0KCk7XHJcblxyXG4gICAgc3VwZXIucmVzZXQoKTtcclxuICB9XHJcbn1cclxuXHJcbmVxdWFsaXR5RXhwbG9yZXIucmVnaXN0ZXIoICdPcGVyYXRpb25zU2NlbmVOb2RlJywgT3BlcmF0aW9uc1NjZW5lTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFB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