// Copyright 2015-2022, University of Colorado Boulder

/**
 * BracketNode draws a bracket with an optional label.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../phet-core/js/optionize.js';
import { Node, Path } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
export default class BracketNode extends Node {
  constructor(providedOptions) {
    const options = optionize()({
      // SelfOptions
      orientation: 'down',
      labelNode: null,
      bracketLength: 100,
      bracketTipPosition: 0.5,
      bracketEndRadius: 5,
      bracketTipRadius: 6,
      bracketStroke: 'black',
      bracketLineWidth: 1,
      spacing: 2
    }, providedOptions);

    // validate options
    assert && assert(options.bracketTipPosition > 0 && options.bracketTipPosition < 1);
    super();

    // compute tip position
    let tipX;
    if (options.orientation === 'down' || options.orientation === 'left') {
      tipX = options.bracketTipPosition * options.bracketLength;
    } else {
      tipX = (1 - options.bracketTipPosition) * options.bracketLength;
    }
    assert && assert(tipX > options.bracketEndRadius + options.bracketTipRadius);
    assert && assert(tipX < options.bracketLength - (options.bracketEndRadius + options.bracketTipRadius));

    // bracket shape, created for 'down' orientation, left-to-right
    const bracketShape = new Shape()
    // left end curves up
    .arc(options.bracketEndRadius, 0, options.bracketEndRadius, Math.PI, 0.5 * Math.PI, true).lineTo(tipX - options.bracketTipRadius, options.bracketEndRadius)
    // tip points down
    .arc(tipX - options.bracketTipRadius, options.bracketEndRadius + options.bracketTipRadius, options.bracketTipRadius, 1.5 * Math.PI, 0).arc(tipX + options.bracketTipRadius, options.bracketEndRadius + options.bracketTipRadius, options.bracketTipRadius, Math.PI, 1.5 * Math.PI)
    // right end curves up
    .lineTo(options.bracketLength - options.bracketEndRadius, options.bracketEndRadius).arc(options.bracketLength - options.bracketEndRadius, 0, options.bracketEndRadius, 0.5 * Math.PI, 0, true);

    // bracket node
    const bracketNode = new Path(bracketShape, {
      stroke: options.bracketStroke,
      lineWidth: options.bracketLineWidth
    });
    this.addChild(bracketNode);

    // put the bracket in the correct orientation
    switch (options.orientation) {
      case 'up':
        bracketNode.rotation = Math.PI;
        break;
      case 'down':
        // do nothing, this is how the shape was created
        break;
      case 'left':
        bracketNode.rotation = Math.PI / 2;
        break;
      case 'right':
        bracketNode.rotation = -Math.PI / 2;
        break;
      default:
        throw new Error(`unsupported orientation: ${options.orientation}`);
    }

    // optional label, centered on the bracket's tip
    let labelNodeBoundsListener;
    if (options.labelNode) {
      const labelNode = options.labelNode;
      this.addChild(labelNode);
      labelNodeBoundsListener = () => {
        switch (options.orientation) {
          case 'up':
            labelNode.centerX = bracketNode.left + options.bracketTipPosition * bracketNode.width;
            labelNode.bottom = bracketNode.top - options.spacing;
            break;
          case 'down':
            labelNode.centerX = bracketNode.left + options.bracketTipPosition * bracketNode.width;
            labelNode.top = bracketNode.bottom + options.spacing;
            break;
          case 'left':
            labelNode.right = bracketNode.left - options.spacing;
            labelNode.centerY = bracketNode.top + options.bracketTipPosition * bracketNode.height;
            break;
          case 'right':
            labelNode.left = bracketNode.right + options.spacing;
            labelNode.centerY = bracketNode.top + options.bracketTipPosition * bracketNode.height;
            break;
          default:
            throw new Error(`unsupported orientation: ${options.orientation}`);
        }
      };
      labelNode.boundsProperty.link(labelNodeBoundsListener);
    }
    this.mutate(options);

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL('scenery-phet', 'BracketNode', this);
    this.disposeBracketNode = () => {
      if (options.labelNode && labelNodeBoundsListener && options.labelNode.boundsProperty.hasListener(labelNodeBoundsListener)) {
        options.labelNode.boundsProperty.removeListener(labelNodeBoundsListener);
      }
    };
  }
  dispose() {
    this.disposeBracketNode();
    super.dispose();
  }
}
sceneryPhet.register('BracketNode', BracketNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIkluc3RhbmNlUmVnaXN0cnkiLCJvcHRpb25pemUiLCJOb2RlIiwiUGF0aCIsInNjZW5lcnlQaGV0IiwiQnJhY2tldE5vZGUiLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJvcmllbnRhdGlvbiIsImxhYmVsTm9kZSIsImJyYWNrZXRMZW5ndGgiLCJicmFja2V0VGlwUG9zaXRpb24iLCJicmFja2V0RW5kUmFkaXVzIiwiYnJhY2tldFRpcFJhZGl1cyIsImJyYWNrZXRTdHJva2UiLCJicmFja2V0TGluZVdpZHRoIiwic3BhY2luZyIsImFzc2VydCIsInRpcFgiLCJicmFja2V0U2hhcGUiLCJhcmMiLCJNYXRoIiwiUEkiLCJsaW5lVG8iLCJicmFja2V0Tm9kZSIsInN0cm9rZSIsImxpbmVXaWR0aCIsImFkZENoaWxkIiwicm90YXRpb24iLCJFcnJvciIsImxhYmVsTm9kZUJvdW5kc0xpc3RlbmVyIiwiY2VudGVyWCIsImxlZnQiLCJ3aWR0aCIsImJvdHRvbSIsInRvcCIsInJpZ2h0IiwiY2VudGVyWSIsImhlaWdodCIsImJvdW5kc1Byb3BlcnR5IiwibGluayIsIm11dGF0ZSIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwiYmluZGVyIiwicmVnaXN0ZXJEYXRhVVJMIiwiZGlzcG9zZUJyYWNrZXROb2RlIiwiaGFzTGlzdGVuZXIiLCJyZW1vdmVMaXN0ZW5lciIsImRpc3Bvc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkJyYWNrZXROb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEJyYWNrZXROb2RlIGRyYXdzIGEgYnJhY2tldCB3aXRoIGFuIG9wdGlvbmFsIGxhYmVsLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEluc3RhbmNlUmVnaXN0cnkgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2RvY3VtZW50YXRpb24vSW5zdGFuY2VSZWdpc3RyeS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIE5vZGVPcHRpb25zLCBQYXRoLCBUUGFpbnQgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi9zY2VuZXJ5UGhldC5qcyc7XHJcblxyXG50eXBlIEJyYWNrZXROb2RlT3JpZW50YXRpb24gPSAnbGVmdCcgfCAncmlnaHQnIHwgJ3VwJyB8ICdkb3duJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcblxyXG4gIC8vIHJlZmVycyB0byB0aGUgZGlyZWN0aW9uIHRoYXQgdGhlIHRpcCBvZiB0aGUgYnJhY2tldCBwb2ludHNcclxuICBvcmllbnRhdGlvbj86IEJyYWNrZXROb2RlT3JpZW50YXRpb247XHJcblxyXG4gIC8vIG9wdGlvbmFsIGxhYmVsIHRoYXQgd2lsbCBiZSBjZW50ZXJlZCBiZWxvdyBicmFja2V0J3MgdGlwXHJcbiAgbGFiZWxOb2RlPzogTm9kZSB8IG51bGw7XHJcblxyXG4gIC8vIGxlbmd0aCBvZiB0aGUgYnJhY2tldFxyXG4gIGJyYWNrZXRMZW5ndGg/OiBudW1iZXI7XHJcblxyXG4gIC8vIFswLDFdIGV4Y2x1c2l2ZSwgZGV0ZXJtaW5lcyB3aGVyZSBhbG9uZyB0aGUgd2lkdGggb2YgdGhlIGJyYWNrZXQgdGhlIHRpcCAoYW5kIG9wdGlvbmFsIGxhYmVsKSBhcmUgcGxhY2VkXHJcbiAgYnJhY2tldFRpcFBvc2l0aW9uPzogbnVtYmVyO1xyXG5cclxuICAvLyByYWRpdXMgb2YgdGhlIGFyY3MgYXQgdGhlIGVuZHMgb2YgdGhlIGJyYWNrZXRcclxuICBicmFja2V0RW5kUmFkaXVzPzogbnVtYmVyO1xyXG5cclxuICAvLyByYWRpdXMgb2YgdGhlIGFyY3MgYXQgdGhlIHRpcCAoY2VudGVyKSBvZiB0aGUgYnJhY2tldFxyXG4gIGJyYWNrZXRUaXBSYWRpdXM/OiBudW1iZXI7XHJcblxyXG4gIC8vIGNvbG9yIG9mIHRoZSBicmFja2V0XHJcbiAgYnJhY2tldFN0cm9rZT86IFRQYWludDtcclxuXHJcbiAgLy8gbGluZSB3aWR0aCAodGhpY2tuZXNzKSBvZiB0aGUgYnJhY2tldFxyXG4gIGJyYWNrZXRMaW5lV2lkdGg/OiBudW1iZXI7XHJcblxyXG4gIC8vIHNwYWNlIGJldHdlZW4gb3B0aW9uYWwgbGFiZWwgYW5kIHRpcCBvZiBicmFja2V0XHJcbiAgc3BhY2luZz86IG51bWJlcjtcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIEJyYWNrZXROb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZU9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCcmFja2V0Tm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VCcmFja2V0Tm9kZTogKCkgPT4gdm9pZDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBCcmFja2V0Tm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxCcmFja2V0Tm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgb3JpZW50YXRpb246ICdkb3duJyxcclxuICAgICAgbGFiZWxOb2RlOiBudWxsLFxyXG4gICAgICBicmFja2V0TGVuZ3RoOiAxMDAsXHJcbiAgICAgIGJyYWNrZXRUaXBQb3NpdGlvbjogMC41LFxyXG4gICAgICBicmFja2V0RW5kUmFkaXVzOiA1LFxyXG4gICAgICBicmFja2V0VGlwUmFkaXVzOiA2LFxyXG4gICAgICBicmFja2V0U3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBicmFja2V0TGluZVdpZHRoOiAxLFxyXG4gICAgICBzcGFjaW5nOiAyXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyB2YWxpZGF0ZSBvcHRpb25zXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLmJyYWNrZXRUaXBQb3NpdGlvbiA+IDAgJiYgb3B0aW9ucy5icmFja2V0VGlwUG9zaXRpb24gPCAxICk7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBjb21wdXRlIHRpcCBwb3NpdGlvblxyXG4gICAgbGV0IHRpcFg7XHJcbiAgICBpZiAoIG9wdGlvbnMub3JpZW50YXRpb24gPT09ICdkb3duJyB8fCBvcHRpb25zLm9yaWVudGF0aW9uID09PSAnbGVmdCcgKSB7XHJcbiAgICAgIHRpcFggPSBvcHRpb25zLmJyYWNrZXRUaXBQb3NpdGlvbiAqIG9wdGlvbnMuYnJhY2tldExlbmd0aDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aXBYID0gKCAxIC0gb3B0aW9ucy5icmFja2V0VGlwUG9zaXRpb24gKSAqIG9wdGlvbnMuYnJhY2tldExlbmd0aDtcclxuICAgIH1cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRpcFggPiAoIG9wdGlvbnMuYnJhY2tldEVuZFJhZGl1cyArIG9wdGlvbnMuYnJhY2tldFRpcFJhZGl1cyApICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aXBYIDwgb3B0aW9ucy5icmFja2V0TGVuZ3RoIC0gKCBvcHRpb25zLmJyYWNrZXRFbmRSYWRpdXMgKyBvcHRpb25zLmJyYWNrZXRUaXBSYWRpdXMgKSApO1xyXG5cclxuICAgIC8vIGJyYWNrZXQgc2hhcGUsIGNyZWF0ZWQgZm9yICdkb3duJyBvcmllbnRhdGlvbiwgbGVmdC10by1yaWdodFxyXG4gICAgY29uc3QgYnJhY2tldFNoYXBlID0gbmV3IFNoYXBlKClcclxuICAgICAgLy8gbGVmdCBlbmQgY3VydmVzIHVwXHJcbiAgICAgIC5hcmMoIG9wdGlvbnMuYnJhY2tldEVuZFJhZGl1cywgMCwgb3B0aW9ucy5icmFja2V0RW5kUmFkaXVzLCBNYXRoLlBJLCAwLjUgKiBNYXRoLlBJLCB0cnVlIClcclxuICAgICAgLmxpbmVUbyggdGlwWCAtIG9wdGlvbnMuYnJhY2tldFRpcFJhZGl1cywgb3B0aW9ucy5icmFja2V0RW5kUmFkaXVzIClcclxuICAgICAgLy8gdGlwIHBvaW50cyBkb3duXHJcbiAgICAgIC5hcmMoIHRpcFggLSBvcHRpb25zLmJyYWNrZXRUaXBSYWRpdXMsIG9wdGlvbnMuYnJhY2tldEVuZFJhZGl1cyArIG9wdGlvbnMuYnJhY2tldFRpcFJhZGl1cywgb3B0aW9ucy5icmFja2V0VGlwUmFkaXVzLCAxLjUgKiBNYXRoLlBJLCAwIClcclxuICAgICAgLmFyYyggdGlwWCArIG9wdGlvbnMuYnJhY2tldFRpcFJhZGl1cywgb3B0aW9ucy5icmFja2V0RW5kUmFkaXVzICsgb3B0aW9ucy5icmFja2V0VGlwUmFkaXVzLCBvcHRpb25zLmJyYWNrZXRUaXBSYWRpdXMsIE1hdGguUEksIDEuNSAqIE1hdGguUEkgKVxyXG4gICAgICAvLyByaWdodCBlbmQgY3VydmVzIHVwXHJcbiAgICAgIC5saW5lVG8oIG9wdGlvbnMuYnJhY2tldExlbmd0aCAtIG9wdGlvbnMuYnJhY2tldEVuZFJhZGl1cywgb3B0aW9ucy5icmFja2V0RW5kUmFkaXVzIClcclxuICAgICAgLmFyYyggb3B0aW9ucy5icmFja2V0TGVuZ3RoIC0gb3B0aW9ucy5icmFja2V0RW5kUmFkaXVzLCAwLCBvcHRpb25zLmJyYWNrZXRFbmRSYWRpdXMsIDAuNSAqIE1hdGguUEksIDAsIHRydWUgKTtcclxuXHJcbiAgICAvLyBicmFja2V0IG5vZGVcclxuICAgIGNvbnN0IGJyYWNrZXROb2RlID0gbmV3IFBhdGgoIGJyYWNrZXRTaGFwZSwge1xyXG4gICAgICBzdHJva2U6IG9wdGlvbnMuYnJhY2tldFN0cm9rZSxcclxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLmJyYWNrZXRMaW5lV2lkdGhcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGJyYWNrZXROb2RlICk7XHJcblxyXG4gICAgLy8gcHV0IHRoZSBicmFja2V0IGluIHRoZSBjb3JyZWN0IG9yaWVudGF0aW9uXHJcbiAgICBzd2l0Y2goIG9wdGlvbnMub3JpZW50YXRpb24gKSB7XHJcbiAgICAgIGNhc2UgJ3VwJzpcclxuICAgICAgICBicmFja2V0Tm9kZS5yb3RhdGlvbiA9IE1hdGguUEk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2Rvd24nOlxyXG4gICAgICAgIC8vIGRvIG5vdGhpbmcsIHRoaXMgaXMgaG93IHRoZSBzaGFwZSB3YXMgY3JlYXRlZFxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgICBicmFja2V0Tm9kZS5yb3RhdGlvbiA9IE1hdGguUEkgLyAyO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdyaWdodCc6XHJcbiAgICAgICAgYnJhY2tldE5vZGUucm90YXRpb24gPSAtTWF0aC5QSSAvIDI7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgdW5zdXBwb3J0ZWQgb3JpZW50YXRpb246ICR7b3B0aW9ucy5vcmllbnRhdGlvbn1gICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gb3B0aW9uYWwgbGFiZWwsIGNlbnRlcmVkIG9uIHRoZSBicmFja2V0J3MgdGlwXHJcbiAgICBsZXQgbGFiZWxOb2RlQm91bmRzTGlzdGVuZXI6ICgpID0+IHZvaWQ7XHJcbiAgICBpZiAoIG9wdGlvbnMubGFiZWxOb2RlICkge1xyXG5cclxuICAgICAgY29uc3QgbGFiZWxOb2RlID0gb3B0aW9ucy5sYWJlbE5vZGU7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIGxhYmVsTm9kZSApO1xyXG5cclxuICAgICAgbGFiZWxOb2RlQm91bmRzTGlzdGVuZXIgPSAoKSA9PiB7XHJcbiAgICAgICAgc3dpdGNoKCBvcHRpb25zLm9yaWVudGF0aW9uICkge1xyXG4gICAgICAgICAgY2FzZSAndXAnOlxyXG4gICAgICAgICAgICBsYWJlbE5vZGUuY2VudGVyWCA9IGJyYWNrZXROb2RlLmxlZnQgKyAoIG9wdGlvbnMuYnJhY2tldFRpcFBvc2l0aW9uICogYnJhY2tldE5vZGUud2lkdGggKTtcclxuICAgICAgICAgICAgbGFiZWxOb2RlLmJvdHRvbSA9IGJyYWNrZXROb2RlLnRvcCAtIG9wdGlvbnMuc3BhY2luZztcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlICdkb3duJzpcclxuICAgICAgICAgICAgbGFiZWxOb2RlLmNlbnRlclggPSBicmFja2V0Tm9kZS5sZWZ0ICsgKCBvcHRpb25zLmJyYWNrZXRUaXBQb3NpdGlvbiAqIGJyYWNrZXROb2RlLndpZHRoICk7XHJcbiAgICAgICAgICAgIGxhYmVsTm9kZS50b3AgPSBicmFja2V0Tm9kZS5ib3R0b20gKyBvcHRpb25zLnNwYWNpbmc7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgICAgIGxhYmVsTm9kZS5yaWdodCA9IGJyYWNrZXROb2RlLmxlZnQgLSBvcHRpb25zLnNwYWNpbmc7XHJcbiAgICAgICAgICAgIGxhYmVsTm9kZS5jZW50ZXJZID0gYnJhY2tldE5vZGUudG9wICsgKCBvcHRpb25zLmJyYWNrZXRUaXBQb3NpdGlvbiAqIGJyYWNrZXROb2RlLmhlaWdodCApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICAgICAgbGFiZWxOb2RlLmxlZnQgPSBicmFja2V0Tm9kZS5yaWdodCArIG9wdGlvbnMuc3BhY2luZztcclxuICAgICAgICAgICAgbGFiZWxOb2RlLmNlbnRlclkgPSBicmFja2V0Tm9kZS50b3AgKyAoIG9wdGlvbnMuYnJhY2tldFRpcFBvc2l0aW9uICogYnJhY2tldE5vZGUuaGVpZ2h0ICk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgdW5zdXBwb3J0ZWQgb3JpZW50YXRpb246ICR7b3B0aW9ucy5vcmllbnRhdGlvbn1gICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICBsYWJlbE5vZGUuYm91bmRzUHJvcGVydHkubGluayggbGFiZWxOb2RlQm91bmRzTGlzdGVuZXIgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIHN1cHBvcnQgZm9yIGJpbmRlciBkb2N1bWVudGF0aW9uLCBzdHJpcHBlZCBvdXQgaW4gYnVpbGRzIGFuZCBvbmx5IHJ1bnMgd2hlbiA/YmluZGVyIGlzIHNwZWNpZmllZFxyXG4gICAgYXNzZXJ0ICYmIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuYmluZGVyICYmIEluc3RhbmNlUmVnaXN0cnkucmVnaXN0ZXJEYXRhVVJMKCAnc2NlbmVyeS1waGV0JywgJ0JyYWNrZXROb2RlJywgdGhpcyApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZUJyYWNrZXROb2RlID0gKCkgPT4ge1xyXG4gICAgICBpZiAoIG9wdGlvbnMubGFiZWxOb2RlICYmIGxhYmVsTm9kZUJvdW5kc0xpc3RlbmVyICYmIG9wdGlvbnMubGFiZWxOb2RlLmJvdW5kc1Byb3BlcnR5Lmhhc0xpc3RlbmVyKCBsYWJlbE5vZGVCb3VuZHNMaXN0ZW5lciApICkge1xyXG4gICAgICAgIG9wdGlvbnMubGFiZWxOb2RlLmJvdW5kc1Byb3BlcnR5LnJlbW92ZUxpc3RlbmVyKCBsYWJlbE5vZGVCb3VuZHNMaXN0ZW5lciApO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VCcmFja2V0Tm9kZSgpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdCcmFja2V0Tm9kZScsIEJyYWNrZXROb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLEtBQUssUUFBUSwwQkFBMEI7QUFDaEQsT0FBT0MsZ0JBQWdCLE1BQU0sc0RBQXNEO0FBQ25GLE9BQU9DLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsU0FBU0MsSUFBSSxFQUFlQyxJQUFJLFFBQWdCLDZCQUE2QjtBQUM3RSxPQUFPQyxXQUFXLE1BQU0sa0JBQWtCO0FBb0MxQyxlQUFlLE1BQU1DLFdBQVcsU0FBU0gsSUFBSSxDQUFDO0VBSXJDSSxXQUFXQSxDQUFFQyxlQUFvQyxFQUFHO0lBRXpELE1BQU1DLE9BQU8sR0FBR1AsU0FBUyxDQUErQyxDQUFDLENBQUU7TUFFekU7TUFDQVEsV0FBVyxFQUFFLE1BQU07TUFDbkJDLFNBQVMsRUFBRSxJQUFJO01BQ2ZDLGFBQWEsRUFBRSxHQUFHO01BQ2xCQyxrQkFBa0IsRUFBRSxHQUFHO01BQ3ZCQyxnQkFBZ0IsRUFBRSxDQUFDO01BQ25CQyxnQkFBZ0IsRUFBRSxDQUFDO01BQ25CQyxhQUFhLEVBQUUsT0FBTztNQUN0QkMsZ0JBQWdCLEVBQUUsQ0FBQztNQUNuQkMsT0FBTyxFQUFFO0lBQ1gsQ0FBQyxFQUFFVixlQUFnQixDQUFDOztJQUVwQjtJQUNBVyxNQUFNLElBQUlBLE1BQU0sQ0FBRVYsT0FBTyxDQUFDSSxrQkFBa0IsR0FBRyxDQUFDLElBQUlKLE9BQU8sQ0FBQ0ksa0JBQWtCLEdBQUcsQ0FBRSxDQUFDO0lBRXBGLEtBQUssQ0FBQyxDQUFDOztJQUVQO0lBQ0EsSUFBSU8sSUFBSTtJQUNSLElBQUtYLE9BQU8sQ0FBQ0MsV0FBVyxLQUFLLE1BQU0sSUFBSUQsT0FBTyxDQUFDQyxXQUFXLEtBQUssTUFB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