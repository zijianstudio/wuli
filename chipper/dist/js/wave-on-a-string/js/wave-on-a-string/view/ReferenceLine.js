// Copyright 2013-2023, University of Colorado Boulder

/**
 * reference line Node.
 *
 * @author Anton Ulyanov (Mlearner)
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import { DragListener, Line, Node, Rectangle } from '../../../../scenery/js/imports.js';
import waveOnAString from '../../waveOnAString.js';
import Constants from '../Constants.js';
class ReferenceLine extends Node {
  /**
   * @param {WOASModel} model
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    super({
      cursor: 'pointer',
      tandem: tandem
    });
    this.addChild(new Rectangle(740 * 2, -10, 40, 20, {
      fill: Constants.referenceLineBlockGradient,
      scale: 0.5,
      stroke: '#000',
      lineWidth: 0.5
    }));
    this.addChild(new Rectangle(750, -10, 20, 20, {
      fill: Constants.referenceLineBlockGradient,
      stroke: '#000',
      lineWidth: 0.5
    }));
    this.addChild(new Line(0, 0, 750, 0, merge({
      mouseArea: new Bounds2(0, 0, 750, 0).dilated(5),
      touchArea: new Bounds2(0, 0, 750, 0).dilated(10)
    }, {
      stroke: '#F00',
      lineDash: [10, 6],
      lineWidth: 2
    })));
    model.referenceLineVisibleProperty.link(visible => {
      this.visible = visible;
    });
    model.referenceLinePositionProperty.link(position => {
      this.translation = position;
    });
    this.touchArea = Shape.bounds(Bounds2.point(755, 0).dilated(Constants.dilatedReferenceLineTouchArea));
    this.mouseArea = Shape.bounds(Bounds2.point(755, 0).dilatedXY(15, 10));
    this.addInputListener(new DragListener({
      positionProperty: model.referenceLinePositionProperty,
      tandem: tandem.createTandem('dragListener'),
      dragBoundsProperty: new Property(new Bounds2(Constants.VIEW_BOUNDS.minX + 30 - Constants.VIEW_BOUNDS.width, Constants.VIEW_BOUNDS.minY + 30, Constants.VIEW_BOUNDS.maxX - Constants.VIEW_BOUNDS.width, Constants.VIEW_BOUNDS.maxY - 30))
    }));
  }
}
waveOnAString.register('ReferenceLine', ReferenceLine);
export default ReferenceLine;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkJvdW5kczIiLCJTaGFwZSIsIm1lcmdlIiwiRHJhZ0xpc3RlbmVyIiwiTGluZSIsIk5vZGUiLCJSZWN0YW5nbGUiLCJ3YXZlT25BU3RyaW5nIiwiQ29uc3RhbnRzIiwiUmVmZXJlbmNlTGluZSIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJ0YW5kZW0iLCJjdXJzb3IiLCJhZGRDaGlsZCIsImZpbGwiLCJyZWZlcmVuY2VMaW5lQmxvY2tHcmFkaWVudCIsInNjYWxlIiwic3Ryb2tlIiwibGluZVdpZHRoIiwibW91c2VBcmVhIiwiZGlsYXRlZCIsInRvdWNoQXJlYSIsImxpbmVEYXNoIiwicmVmZXJlbmNlTGluZVZpc2libGVQcm9wZXJ0eSIsImxpbmsiLCJ2aXNpYmxlIiwicmVmZXJlbmNlTGluZVBvc2l0aW9uUHJvcGVydHkiLCJwb3NpdGlvbiIsInRyYW5zbGF0aW9uIiwiYm91bmRzIiwicG9pbnQiLCJkaWxhdGVkUmVmZXJlbmNlTGluZVRvdWNoQXJlYSIsImRpbGF0ZWRYWSIsImFkZElucHV0TGlzdGVuZXIiLCJwb3NpdGlvblByb3BlcnR5IiwiY3JlYXRlVGFuZGVtIiwiZHJhZ0JvdW5kc1Byb3BlcnR5IiwiVklFV19CT1VORFMiLCJtaW5YIiwid2lkdGgiLCJtaW5ZIiwibWF4WCIsIm1heFkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlJlZmVyZW5jZUxpbmUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogcmVmZXJlbmNlIGxpbmUgTm9kZS5cclxuICpcclxuICogQGF1dGhvciBBbnRvbiBVbHlhbm92IChNbGVhcm5lcilcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgRHJhZ0xpc3RlbmVyLCBMaW5lLCBOb2RlLCBSZWN0YW5nbGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgd2F2ZU9uQVN0cmluZyBmcm9tICcuLi8uLi93YXZlT25BU3RyaW5nLmpzJztcclxuaW1wb3J0IENvbnN0YW50cyBmcm9tICcuLi9Db25zdGFudHMuanMnO1xyXG5cclxuY2xhc3MgUmVmZXJlbmNlTGluZSBleHRlbmRzIE5vZGUge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7V09BU01vZGVsfSBtb2RlbFxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIHRhbmRlbSApIHtcclxuICAgIHN1cGVyKCB7IGN1cnNvcjogJ3BvaW50ZXInLCB0YW5kZW06IHRhbmRlbSB9ICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IFJlY3RhbmdsZSggNzQwICogMiwgLTEwLCA0MCwgMjAsIHtcclxuICAgICAgZmlsbDogQ29uc3RhbnRzLnJlZmVyZW5jZUxpbmVCbG9ja0dyYWRpZW50LFxyXG4gICAgICBzY2FsZTogMC41LFxyXG4gICAgICBzdHJva2U6ICcjMDAwJyxcclxuICAgICAgbGluZVdpZHRoOiAwLjVcclxuICAgIH0gKSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IFJlY3RhbmdsZSggNzUwLCAtMTAsIDIwLCAyMCwge1xyXG4gICAgICBmaWxsOiBDb25zdGFudHMucmVmZXJlbmNlTGluZUJsb2NrR3JhZGllbnQsXHJcbiAgICAgIHN0cm9rZTogJyMwMDAnLFxyXG4gICAgICBsaW5lV2lkdGg6IDAuNVxyXG4gICAgfSApICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgTGluZSggMCwgMCwgNzUwLCAwLCBtZXJnZSgge1xyXG4gICAgICBtb3VzZUFyZWE6IG5ldyBCb3VuZHMyKCAwLCAwLCA3NTAsIDAgKS5kaWxhdGVkKCA1ICksXHJcbiAgICAgIHRvdWNoQXJlYTogbmV3IEJvdW5kczIoIDAsIDAsIDc1MCwgMCApLmRpbGF0ZWQoIDEwIClcclxuICAgIH0sIHtcclxuICAgICAgc3Ryb2tlOiAnI0YwMCcsXHJcbiAgICAgIGxpbmVEYXNoOiBbIDEwLCA2IF0sXHJcbiAgICAgIGxpbmVXaWR0aDogMlxyXG4gICAgfSApICkgKTtcclxuXHJcbiAgICBtb2RlbC5yZWZlcmVuY2VMaW5lVmlzaWJsZVByb3BlcnR5LmxpbmsoIHZpc2libGUgPT4ge1xyXG4gICAgICB0aGlzLnZpc2libGUgPSB2aXNpYmxlO1xyXG4gICAgfSApO1xyXG4gICAgbW9kZWwucmVmZXJlbmNlTGluZVBvc2l0aW9uUHJvcGVydHkubGluayggcG9zaXRpb24gPT4ge1xyXG4gICAgICB0aGlzLnRyYW5zbGF0aW9uID0gcG9zaXRpb247XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy50b3VjaEFyZWEgPSBTaGFwZS5ib3VuZHMoIEJvdW5kczIucG9pbnQoIDc1NSwgMCApLmRpbGF0ZWQoIENvbnN0YW50cy5kaWxhdGVkUmVmZXJlbmNlTGluZVRvdWNoQXJlYSApICk7XHJcbiAgICB0aGlzLm1vdXNlQXJlYSA9IFNoYXBlLmJvdW5kcyggQm91bmRzMi5wb2ludCggNzU1LCAwICkuZGlsYXRlZFhZKCAxNSwgMTAgKSApO1xyXG5cclxuICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lciggbmV3IERyYWdMaXN0ZW5lcigge1xyXG4gICAgICBwb3NpdGlvblByb3BlcnR5OiBtb2RlbC5yZWZlcmVuY2VMaW5lUG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZHJhZ0xpc3RlbmVyJyApLFxyXG4gICAgICBkcmFnQm91bmRzUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggbmV3IEJvdW5kczIoXHJcbiAgICAgICAgQ29uc3RhbnRzLlZJRVdfQk9VTkRTLm1pblggKyAzMCAtIENvbnN0YW50cy5WSUVXX0JPVU5EUy53aWR0aCxcclxuICAgICAgICBDb25zdGFudHMuVklFV19CT1VORFMubWluWSArIDMwLFxyXG4gICAgICAgIENvbnN0YW50cy5WSUVXX0JPVU5EUy5tYXhYIC0gQ29uc3RhbnRzLlZJRVdfQk9VTkRTLndpZHRoLFxyXG4gICAgICAgIENvbnN0YW50cy5WSUVXX0JPVU5EUy5tYXhZIC0gMzBcclxuICAgICAgKSApXHJcbiAgICB9ICkgKTtcclxuICB9XHJcbn1cclxuXHJcbndhdmVPbkFTdHJpbmcucmVnaXN0ZXIoICdSZWZlcmVuY2VMaW5lJywgUmVmZXJlbmNlTGluZSApO1xyXG5leHBvcnQgZGVmYXVsdCBSZWZlcmVuY2VMaW5lOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELFNBQVNDLFlBQVksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsUUFBUSxtQ0FBbUM7QUFDdkYsT0FBT0MsYUFBYSxNQUFNLHdCQUF3QjtBQUNsRCxPQUFPQyxTQUFTLE1BQU0saUJBQWlCO0FBRXZDLE1BQU1DLGFBQWEsU0FBU0osSUFBSSxDQUFDO0VBQy9CO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VLLFdBQVdBLENBQUVDLEtBQUssRUFBRUMsTUFBTSxFQUFHO0lBQzNCLEtBQUssQ0FBRTtNQUFFQyxNQUFNLEVBQUUsU0FBUztNQUFFRCxNQUFNLEVBQUVBO0lBQU8sQ0FBRSxDQUFDO0lBRTlDLElBQUksQ0FBQ0UsUUFBUSxDQUFFLElB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