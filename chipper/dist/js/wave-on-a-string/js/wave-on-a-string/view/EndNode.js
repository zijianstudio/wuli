// Copyright 2013-2022, University of Colorado Boulder

/**
 * View of the right-side end
 *
 * @author Anton Ulyanov (Mlearner)
 */

import { Image, Node, Rectangle } from '../../../../scenery/js/imports.js';
import clamp_png from '../../../images/clamp_png.js';
import ringBack_png from '../../../images/ringBack_png.js';
import ringFront_png from '../../../images/ringFront_png.js';
import windowBack_png from '../../../images/windowBack_png.js';
import waveOnAString from '../../waveOnAString.js';
import Constants from '../Constants.js';
import WOASModel from '../model/WOASModel.js';
class EndNode extends Node {
  /**
   * @param {WOASModel} model
   * @param {Emitter} frameEmitter - emits an event when animation frame changes
   * @param {Object} [options]
   */
  constructor(model, frameEmitter, options) {
    super();
    const clamp = new Image(clamp_png, {
      x: -17,
      y: -31,
      scale: 0.4
    });
    const ringBack = new Node({
      children: [new Image(ringBack_png, {
        x: 5,
        y: -14 / 2,
        scale: 0.5
      })]
    });
    const ringFront = new Node({
      children: [new Image(ringFront_png, {
        x: 4.7,
        y: 0,
        scale: 0.5
      })]
    });
    const post = new Rectangle(-5, -130, 10, 260, {
      stroke: '#000',
      fill: Constants.postGradient,
      x: 20
    });

    // @public {Node} - We need to visually stack this behind, so we can't add it as a child here
    this.windowNode = new Image(windowBack_png, {
      right: Constants.windowXOffset + Constants.windowShift,
      centerY: 0,
      scale: Constants.windowScale
    });
    this.children = [clamp, ringBack, post, ringFront];
    this.mutate(options);
    let dirty = true;
    model.yNowChangedEmitter.addListener(() => {
      dirty = true;
    });
    frameEmitter.addListener(() => {
      if (dirty) {
        ringFront.y = ringBack.y = model.getRingY();
        dirty = false;
      }
    });
    model.endTypeProperty.link(endType => {
      clamp.visible = endType === WOASModel.EndType.FIXED_END;
      ringBack.visible = post.visible = ringFront.visible = endType === WOASModel.EndType.LOOSE_END;
      this.windowNode.visible = endType === WOASModel.EndType.NO_END;
      if (endType === WOASModel.EndType.FIXED_END) {
        model.zeroOutEndPoint();
      }
    });
  }
}
waveOnAString.register('EndNode', EndNode);
export default EndNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbWFnZSIsIk5vZGUiLCJSZWN0YW5nbGUiLCJjbGFtcF9wbmciLCJyaW5nQmFja19wbmciLCJyaW5nRnJvbnRfcG5nIiwid2luZG93QmFja19wbmciLCJ3YXZlT25BU3RyaW5nIiwiQ29uc3RhbnRzIiwiV09BU01vZGVsIiwiRW5kTm9kZSIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJmcmFtZUVtaXR0ZXIiLCJvcHRpb25zIiwiY2xhbXAiLCJ4IiwieSIsInNjYWxlIiwicmluZ0JhY2siLCJjaGlsZHJlbiIsInJpbmdGcm9udCIsInBvc3QiLCJzdHJva2UiLCJmaWxsIiwicG9zdEdyYWRpZW50Iiwid2luZG93Tm9kZSIsInJpZ2h0Iiwid2luZG93WE9mZnNldCIsIndpbmRvd1NoaWZ0IiwiY2VudGVyWSIsIndpbmRvd1NjYWxlIiwibXV0YXRlIiwiZGlydHkiLCJ5Tm93Q2hhbmdlZEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImdldFJpbmdZIiwiZW5kVHlwZVByb3BlcnR5IiwibGluayIsImVuZFR5cGUiLCJ2aXNpYmxlIiwiRW5kVHlwZSIsIkZJWEVEX0VORCIsIkxPT1NFX0VORCIsIk5PX0VORCIsInplcm9PdXRFbmRQb2ludCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRW5kTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IG9mIHRoZSByaWdodC1zaWRlIGVuZFxyXG4gKlxyXG4gKiBAYXV0aG9yIEFudG9uIFVseWFub3YgKE1sZWFybmVyKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IEltYWdlLCBOb2RlLCBSZWN0YW5nbGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgY2xhbXBfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9jbGFtcF9wbmcuanMnO1xyXG5pbXBvcnQgcmluZ0JhY2tfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9yaW5nQmFja19wbmcuanMnO1xyXG5pbXBvcnQgcmluZ0Zyb250X3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvcmluZ0Zyb250X3BuZy5qcyc7XHJcbmltcG9ydCB3aW5kb3dCYWNrX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvd2luZG93QmFja19wbmcuanMnO1xyXG5pbXBvcnQgd2F2ZU9uQVN0cmluZyBmcm9tICcuLi8uLi93YXZlT25BU3RyaW5nLmpzJztcclxuaW1wb3J0IENvbnN0YW50cyBmcm9tICcuLi9Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgV09BU01vZGVsIGZyb20gJy4uL21vZGVsL1dPQVNNb2RlbC5qcyc7XHJcblxyXG5jbGFzcyBFbmROb2RlIGV4dGVuZHMgTm9kZSB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtXT0FTTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtFbWl0dGVyfSBmcmFtZUVtaXR0ZXIgLSBlbWl0cyBhbiBldmVudCB3aGVuIGFuaW1hdGlvbiBmcmFtZSBjaGFuZ2VzXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCwgZnJhbWVFbWl0dGVyLCBvcHRpb25zICkge1xyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICBjb25zdCBjbGFtcCA9IG5ldyBJbWFnZSggY2xhbXBfcG5nLCB7IHg6IC0xNywgeTogLTMxLCBzY2FsZTogMC40IH0gKTtcclxuICAgIGNvbnN0IHJpbmdCYWNrID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgbmV3IEltYWdlKCByaW5nQmFja19wbmcsIHsgeDogNSwgeTogLTE0IC8gMiwgc2NhbGU6IDAuNSB9ICkgXSB9ICk7XHJcbiAgICBjb25zdCByaW5nRnJvbnQgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBuZXcgSW1hZ2UoIHJpbmdGcm9udF9wbmcsIHsgeDogNC43LCB5OiAwLCBzY2FsZTogMC41IH0gKSBdIH0gKTtcclxuICAgIGNvbnN0IHBvc3QgPSBuZXcgUmVjdGFuZ2xlKCAtNSwgLTEzMCwgMTAsIDI2MCwge1xyXG4gICAgICBzdHJva2U6ICcjMDAwJyxcclxuICAgICAgZmlsbDogQ29uc3RhbnRzLnBvc3RHcmFkaWVudCxcclxuICAgICAgeDogMjBcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtOb2RlfSAtIFdlIG5lZWQgdG8gdmlzdWFsbHkgc3RhY2sgdGhpcyBiZWhpbmQsIHNvIHdlIGNhbid0IGFkZCBpdCBhcyBhIGNoaWxkIGhlcmVcclxuICAgIHRoaXMud2luZG93Tm9kZSA9IG5ldyBJbWFnZSggd2luZG93QmFja19wbmcsIHtcclxuICAgICAgcmlnaHQ6IENvbnN0YW50cy53aW5kb3dYT2Zmc2V0ICsgQ29uc3RhbnRzLndpbmRvd1NoaWZ0LFxyXG4gICAgICBjZW50ZXJZOiAwLFxyXG4gICAgICBzY2FsZTogQ29uc3RhbnRzLndpbmRvd1NjYWxlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5jaGlsZHJlbiA9IFtcclxuICAgICAgY2xhbXAsXHJcbiAgICAgIHJpbmdCYWNrLFxyXG4gICAgICBwb3N0LFxyXG4gICAgICByaW5nRnJvbnRcclxuICAgIF07XHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG5cclxuICAgIGxldCBkaXJ0eSA9IHRydWU7XHJcbiAgICBtb2RlbC55Tm93Q2hhbmdlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgZGlydHkgPSB0cnVlO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGZyYW1lRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICBpZiAoIGRpcnR5ICkge1xyXG4gICAgICAgIHJpbmdGcm9udC55ID0gcmluZ0JhY2sueSA9IG1vZGVsLmdldFJpbmdZKCk7XHJcbiAgICAgICAgZGlydHkgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIG1vZGVsLmVuZFR5cGVQcm9wZXJ0eS5saW5rKCBlbmRUeXBlID0+IHtcclxuICAgICAgY2xhbXAudmlzaWJsZSA9IGVuZFR5cGUgPT09IFdPQVNNb2RlbC5FbmRUeXBlLkZJWEVEX0VORDtcclxuICAgICAgcmluZ0JhY2sudmlzaWJsZSA9IHBvc3QudmlzaWJsZSA9IHJpbmdGcm9udC52aXNpYmxlID0gZW5kVHlwZSA9PT0gV09BU01vZGVsLkVuZFR5cGUuTE9PU0VfRU5EO1xyXG4gICAgICB0aGlzLndpbmRvd05vZGUudmlzaWJsZSA9IGVuZFR5cGUgPT09IFdPQVNNb2RlbC5FbmRUeXBlLk5PX0VORDtcclxuXHJcbiAgICAgIGlmICggZW5kVHlwZSA9PT0gV09BU01vZGVsLkVuZFR5cGUuRklYRURfRU5EICkge1xyXG4gICAgICAgIG1vZGVsLnplcm9PdXRFbmRQb2ludCgpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG53YXZlT25BU3RyaW5nLnJlZ2lzdGVyKCAnRW5kTm9kZScsIEVuZE5vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgRW5kTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsS0FBSyxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsUUFBUSxtQ0FBbUM7QUFDMUUsT0FBT0MsU0FBUyxNQUFNLDhCQUE4QjtBQUNwRCxPQUFPQyxZQUFZLE1BQU0saUNBQWlDO0FBQzFELE9BQU9DLGFBQWEsTUFBTSxrQ0FBa0M7QUFDNUQsT0FBT0MsY0FBYyxNQUFNLG1DQUFtQztBQUM5RCxPQUFPQyxhQUFhLE1BQU0sd0JBQXdCO0FBQ2xELE9BQU9DLFNBQVMsTUFBTSxpQkFBaUI7QUFDdkMsT0FBT0MsU0FBUyxNQUFNLHVCQUF1QjtBQUU3QyxNQUFNQyxPQUFPLFNBQVNULElBQUksQ0FBQztFQUN6QjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VVLFdBQVdBLENBQUVDLEtBQUssRUFBRUMsWUFBWSxFQUFFQyxPQUFP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