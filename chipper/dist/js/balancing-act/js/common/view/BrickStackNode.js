// Copyright 2013-2022, University of Colorado Boulder

/**
 * A node that represents a stack of bricks in the view.
 *
 * @author John Blanco
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Path, Text } from '../../../../scenery/js/imports.js';
import balancingAct from '../../balancingAct.js';
import BalancingActStrings from '../../BalancingActStrings.js';
import BAQueryParameters from '../BAQueryParameters.js';
import ColumnState from '../model/ColumnState.js';
import MassDragHandler from './MassDragHandler.js';
const kgString = BalancingActStrings.kg;
const unknownMassLabelString = BalancingActStrings.unknownMassLabel;

// constants
const LABEL_FONT = new PhetFont(12);
class BrickStackNode extends Node {
  /**
   * @param {BrickStack} brickStack
   * @param {ModelViewTransform2} modelViewTransform
   * @param {boolean} isLabeled
   * @param {Property} labelVisibleProperty
   * @param {boolean} draggable
   * @param {EnumerationDeprecatedProperty.<ColumnState>} columnStateProperty
   */
  constructor(brickStack, modelViewTransform, isLabeled, labelVisibleProperty, draggable, columnStateProperty) {
    super({
      cursor: 'pointer'
    });
    BAQueryParameters.stanford && columnStateProperty.link(columnState => {
      this.cursor = columnState === ColumnState.DOUBLE_COLUMNS ? 'pointer' : 'default';
      this.pickable = columnState === ColumnState.DOUBLE_COLUMNS;
    });
    this.brickStack = brickStack;
    this.modelViewTransform = modelViewTransform;
    this.previousAngle = 0;

    // Create and add the main shape node.
    const transformedBrickShape = modelViewTransform.modelToViewShape(brickStack.shape);
    const shapeNode = new Path(transformedBrickShape, {
      fill: 'rgb( 205, 38, 38 )',
      stroke: 'black',
      lineWidth: 1,
      touchArea: transformedBrickShape.bounds.dilatedY(10)
    });
    this.addChild(shapeNode);

    // Create and add the mass label.
    if (isLabeled) {
      let massLabel;
      const maxTextWidth = shapeNode.bounds.width;
      if (brickStack.isMystery) {
        massLabel = new Text(unknownMassLabelString, {
          font: LABEL_FONT,
          maxWidth: maxTextWidth
        });
      } else {
        // NOTE: The MultiLineText node was tried for this, but the spacing looked bad.
        massLabel = new Node();
        const massValueText = new Text(brickStack.massValue, {
          font: LABEL_FONT,
          centerX: 0,
          maxWidth: maxTextWidth
        });
        massLabel.addChild(massValueText);
        massLabel.addChild(new Text(kgString, {
          font: LABEL_FONT,
          centerX: 0,
          top: massValueText.bottom - 4,
          maxWidth: maxTextWidth
        }));
      }
      massLabel.centerX = shapeNode.centerX;
      massLabel.bottom = shapeNode.top - 1;
      this.addChild(massLabel);

      // Control label visibility.
      labelVisibleProperty.link(visible => {
        massLabel.visible = visible;
      });
    }

    // Set initial position and record so deltas can be subsequently used. This helps minimize transformation when
    // moving the items.

    let offsetToBottom = new Vector2(0, -this.height / 2);
    let previousRotationAngle = 0;

    // Monitor the brick stack for position and angle changes.
    brickStack.rotationAngleProperty.link(newAngle => {
      this.rotateAround(this.center.plus(offsetToBottom), previousRotationAngle - newAngle);
      offsetToBottom = offsetToBottom.rotated(previousRotationAngle - newAngle);
      previousRotationAngle = newAngle;
    });
    brickStack.positionProperty.link(newPosition => {
      this.center = modelViewTransform.modelToViewPosition(newPosition).plus(offsetToBottom);
    });

    // Make this non-pickable when animating so that users can't grab it mid-flight.
    brickStack.animatingProperty.link(animating => {
      this.pickable = !animating;
    });

    // Add the drag handler if this is intended to be draggable.
    if (draggable) {
      // @public (read-only) {MassDragHandler} - drag handler, made available for use by creator nodes
      this.dragHandler = new MassDragHandler(brickStack, modelViewTransform);
      this.addInputListener(this.dragHandler);
    }
  }
}
balancingAct.register('BrickStackNode', BrickStackNode);
export default BrickStackNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiUGhldEZvbnQiLCJOb2RlIiwiUGF0aCIsIlRleHQiLCJiYWxhbmNpbmdBY3QiLCJCYWxhbmNpbmdBY3RTdHJpbmdzIiwiQkFRdWVyeVBhcmFtZXRlcnMiLCJDb2x1bW5TdGF0ZSIsIk1hc3NEcmFnSGFuZGxlciIsImtnU3RyaW5nIiwia2ciLCJ1bmtub3duTWFzc0xhYmVsU3RyaW5nIiwidW5rbm93bk1hc3NMYWJlbCIsIkxBQkVMX0ZPTlQiLCJCcmlja1N0YWNrTm9kZSIsImNvbnN0cnVjdG9yIiwiYnJpY2tTdGFjayIsIm1vZGVsVmlld1RyYW5zZm9ybSIsImlzTGFiZWxlZCIsImxhYmVsVmlzaWJsZVByb3BlcnR5IiwiZHJhZ2dhYmxlIiwiY29sdW1uU3RhdGVQcm9wZXJ0eSIsImN1cnNvciIsInN0YW5mb3JkIiwibGluayIsImNvbHVtblN0YXRlIiwiRE9VQkxFX0NPTFVNTlMiLCJwaWNrYWJsZSIsInByZXZpb3VzQW5nbGUiLCJ0cmFuc2Zvcm1lZEJyaWNrU2hhcGUiLCJtb2RlbFRvVmlld1NoYXBlIiwic2hhcGUiLCJzaGFwZU5vZGUiLCJmaWxsIiwic3Ryb2tlIiwibGluZVdpZHRoIiwidG91Y2hBcmVhIiwiYm91bmRzIiwiZGlsYXRlZFkiLCJhZGRDaGlsZCIsIm1hc3NMYWJlbCIsIm1heFRleHRXaWR0aCIsIndpZHRoIiwiaXNNeXN0ZXJ5IiwiZm9udCIsIm1heFdpZHRoIiwibWFzc1ZhbHVlVGV4dCIsIm1hc3NWYWx1ZSIsImNlbnRlclgiLCJ0b3AiLCJib3R0b20iLCJ2aXNpYmxlIiwib2Zmc2V0VG9Cb3R0b20iLCJoZWlnaHQiLCJwcmV2aW91c1JvdGF0aW9uQW5nbGUiLCJyb3RhdGlvbkFuZ2xlUHJvcGVydHkiLCJuZXdBbmdsZSIsInJvdGF0ZUFyb3VuZCIsImNlbnRlciIsInBsdXMiLCJyb3RhdGVkIiwicG9zaXRpb25Qcm9wZXJ0eSIsIm5ld1Bvc2l0aW9uIiwibW9kZWxUb1ZpZXdQb3NpdGlvbiIsImFuaW1hdGluZ1Byb3BlcnR5IiwiYW5pbWF0aW5nIiwiZHJhZ0hhbmRsZXIiLCJhZGRJbnB1dExpc3RlbmVyIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCcmlja1N0YWNrTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIG5vZGUgdGhhdCByZXByZXNlbnRzIGEgc3RhY2sgb2YgYnJpY2tzIGluIHRoZSB2aWV3LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgTm9kZSwgUGF0aCwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBiYWxhbmNpbmdBY3QgZnJvbSAnLi4vLi4vYmFsYW5jaW5nQWN0LmpzJztcclxuaW1wb3J0IEJhbGFuY2luZ0FjdFN0cmluZ3MgZnJvbSAnLi4vLi4vQmFsYW5jaW5nQWN0U3RyaW5ncy5qcyc7XHJcbmltcG9ydCBCQVF1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi9CQVF1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBDb2x1bW5TdGF0ZSBmcm9tICcuLi9tb2RlbC9Db2x1bW5TdGF0ZS5qcyc7XHJcbmltcG9ydCBNYXNzRHJhZ0hhbmRsZXIgZnJvbSAnLi9NYXNzRHJhZ0hhbmRsZXIuanMnO1xyXG5cclxuY29uc3Qga2dTdHJpbmcgPSBCYWxhbmNpbmdBY3RTdHJpbmdzLmtnO1xyXG5jb25zdCB1bmtub3duTWFzc0xhYmVsU3RyaW5nID0gQmFsYW5jaW5nQWN0U3RyaW5ncy51bmtub3duTWFzc0xhYmVsO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IExBQkVMX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDEyICk7XHJcblxyXG5jbGFzcyBCcmlja1N0YWNrTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0JyaWNrU3RhY2t9IGJyaWNrU3RhY2tcclxuICAgKiBAcGFyYW0ge01vZGVsVmlld1RyYW5zZm9ybTJ9IG1vZGVsVmlld1RyYW5zZm9ybVxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNMYWJlbGVkXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eX0gbGFiZWxWaXNpYmxlUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGRyYWdnYWJsZVxyXG4gICAqIEBwYXJhbSB7RW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkuPENvbHVtblN0YXRlPn0gY29sdW1uU3RhdGVQcm9wZXJ0eVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBicmlja1N0YWNrLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIGlzTGFiZWxlZCwgbGFiZWxWaXNpYmxlUHJvcGVydHksIGRyYWdnYWJsZSwgY29sdW1uU3RhdGVQcm9wZXJ0eSApIHtcclxuICAgIHN1cGVyKCB7IGN1cnNvcjogJ3BvaW50ZXInIH0gKTtcclxuXHJcbiAgICBCQVF1ZXJ5UGFyYW1ldGVycy5zdGFuZm9yZCAmJiBjb2x1bW5TdGF0ZVByb3BlcnR5LmxpbmsoIGNvbHVtblN0YXRlID0+IHtcclxuICAgICAgdGhpcy5jdXJzb3IgPSBjb2x1bW5TdGF0ZSA9PT0gQ29sdW1uU3RhdGUuRE9VQkxFX0NPTFVNTlMgPyAncG9pbnRlcicgOiAnZGVmYXVsdCc7XHJcbiAgICAgIHRoaXMucGlja2FibGUgPSBjb2x1bW5TdGF0ZSA9PT0gQ29sdW1uU3RhdGUuRE9VQkxFX0NPTFVNTlM7XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmJyaWNrU3RhY2sgPSBicmlja1N0YWNrO1xyXG4gICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0gPSBtb2RlbFZpZXdUcmFuc2Zvcm07XHJcbiAgICB0aGlzLnByZXZpb3VzQW5nbGUgPSAwO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhbmQgYWRkIHRoZSBtYWluIHNoYXBlIG5vZGUuXHJcbiAgICBjb25zdCB0cmFuc2Zvcm1lZEJyaWNrU2hhcGUgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdTaGFwZSggYnJpY2tTdGFjay5zaGFwZSApO1xyXG4gICAgY29uc3Qgc2hhcGVOb2RlID0gbmV3IFBhdGgoIHRyYW5zZm9ybWVkQnJpY2tTaGFwZSwge1xyXG4gICAgICBmaWxsOiAncmdiKCAyMDUsIDM4LCAzOCApJyxcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBsaW5lV2lkdGg6IDEsXHJcbiAgICAgIHRvdWNoQXJlYTogdHJhbnNmb3JtZWRCcmlja1NoYXBlLmJvdW5kcy5kaWxhdGVkWSggMTAgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggc2hhcGVOb2RlICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGFuZCBhZGQgdGhlIG1hc3MgbGFiZWwuXHJcbiAgICBpZiAoIGlzTGFiZWxlZCApIHtcclxuICAgICAgbGV0IG1hc3NMYWJlbDtcclxuICAgICAgY29uc3QgbWF4VGV4dFdpZHRoID0gc2hhcGVOb2RlLmJvdW5kcy53aWR0aDtcclxuICAgICAgaWYgKCBicmlja1N0YWNrLmlzTXlzdGVyeSApIHtcclxuICAgICAgICBtYXNzTGFiZWwgPSBuZXcgVGV4dCggdW5rbm93bk1hc3NMYWJlbFN0cmluZywge1xyXG4gICAgICAgICAgZm9udDogTEFCRUxfRk9OVCxcclxuICAgICAgICAgIG1heFdpZHRoOiBtYXhUZXh0V2lkdGhcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIE5PVEU6IFRoZSBNdWx0aUxpbmVUZXh0IG5vZGUgd2FzIHRyaWVkIGZvciB0aGlzLCBidXQgdGhlIHNwYWNpbmcgbG9va2VkIGJhZC5cclxuICAgICAgICBtYXNzTGFiZWwgPSBuZXcgTm9kZSgpO1xyXG4gICAgICAgIGNvbnN0IG1hc3NWYWx1ZVRleHQgPSBuZXcgVGV4dChcclxuICAgICAgICAgIGJyaWNrU3RhY2subWFzc1ZhbHVlLFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBmb250OiBMQUJFTF9GT05ULFxyXG4gICAgICAgICAgICBjZW50ZXJYOiAwLFxyXG4gICAgICAgICAgICBtYXhXaWR0aDogbWF4VGV4dFdpZHRoXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgKTtcclxuICAgICAgICBtYXNzTGFiZWwuYWRkQ2hpbGQoIG1hc3NWYWx1ZVRleHQgKTtcclxuICAgICAgICBtYXNzTGFiZWwuYWRkQ2hpbGQoIG5ldyBUZXh0KFxyXG4gICAgICAgICAga2dTdHJpbmcsXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvbnQ6IExBQkVMX0ZPTlQsXHJcbiAgICAgICAgICAgIGNlbnRlclg6IDAsXHJcbiAgICAgICAgICAgIHRvcDogbWFzc1ZhbHVlVGV4dC5ib3R0b20gLSA0LFxyXG4gICAgICAgICAgICBtYXhXaWR0aDogbWF4VGV4dFdpZHRoXHJcbiAgICAgICAgICB9IClcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICAgIG1hc3NMYWJlbC5jZW50ZXJYID0gc2hhcGVOb2RlLmNlbnRlclg7XHJcbiAgICAgIG1hc3NMYWJlbC5ib3R0b20gPSBzaGFwZU5vZGUudG9wIC0gMTtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggbWFzc0xhYmVsICk7XHJcblxyXG4gICAgICAvLyBDb250cm9sIGxhYmVsIHZpc2liaWxpdHkuXHJcbiAgICAgIGxhYmVsVmlzaWJsZVByb3BlcnR5LmxpbmsoIHZpc2libGUgPT4ge1xyXG4gICAgICAgIG1hc3NMYWJlbC52aXNpYmxlID0gdmlzaWJsZTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFNldCBpbml0aWFsIHBvc2l0aW9uIGFuZCByZWNvcmQgc28gZGVsdGFzIGNhbiBiZSBzdWJzZXF1ZW50bHkgdXNlZC4gVGhpcyBoZWxwcyBtaW5pbWl6ZSB0cmFuc2Zvcm1hdGlvbiB3aGVuXHJcbiAgICAvLyBtb3ZpbmcgdGhlIGl0ZW1zLlxyXG5cclxuICAgIGxldCBvZmZzZXRUb0JvdHRvbSA9IG5ldyBWZWN0b3IyKCAwLCAtdGhpcy5oZWlnaHQgLyAyICk7XHJcbiAgICBsZXQgcHJldmlvdXNSb3RhdGlvbkFuZ2xlID0gMDtcclxuXHJcbiAgICAvLyBNb25pdG9yIHRoZSBicmljayBzdGFjayBmb3IgcG9zaXRpb24gYW5kIGFuZ2xlIGNoYW5nZXMuXHJcbiAgICBicmlja1N0YWNrLnJvdGF0aW9uQW5nbGVQcm9wZXJ0eS5saW5rKCBuZXdBbmdsZSA9PiB7XHJcbiAgICAgIHRoaXMucm90YXRlQXJvdW5kKCB0aGlzLmNlbnRlci5wbHVzKCBvZmZzZXRUb0JvdHRvbSApLCBwcmV2aW91c1JvdGF0aW9uQW5nbGUgLSBuZXdBbmdsZSApO1xyXG4gICAgICBvZmZzZXRUb0JvdHRvbSA9IG9mZnNldFRvQm90dG9tLnJvdGF0ZWQoIHByZXZpb3VzUm90YXRpb25BbmdsZSAtIG5ld0FuZ2xlICk7XHJcbiAgICAgIHByZXZpb3VzUm90YXRpb25BbmdsZSA9IG5ld0FuZ2xlO1xyXG4gICAgfSApO1xyXG4gICAgYnJpY2tTdGFjay5wb3NpdGlvblByb3BlcnR5LmxpbmsoIG5ld1Bvc2l0aW9uID0+IHtcclxuICAgICAgdGhpcy5jZW50ZXIgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggbmV3UG9zaXRpb24gKS5wbHVzKCBvZmZzZXRUb0JvdHRvbSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIE1ha2UgdGhpcyBub24tcGlja2FibGUgd2hlbiBhbmltYXRpbmcgc28gdGhhdCB1c2VycyBjYW4ndCBncmFiIGl0IG1pZC1mbGlnaHQuXHJcbiAgICBicmlja1N0YWNrLmFuaW1hdGluZ1Byb3BlcnR5LmxpbmsoIGFuaW1hdGluZyA9PiB7XHJcbiAgICAgIHRoaXMucGlja2FibGUgPSAhYW5pbWF0aW5nO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgZHJhZyBoYW5kbGVyIGlmIHRoaXMgaXMgaW50ZW5kZWQgdG8gYmUgZHJhZ2dhYmxlLlxyXG4gICAgaWYgKCBkcmFnZ2FibGUgKSB7XHJcblxyXG4gICAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtNYXNzRHJhZ0hhbmRsZXJ9IC0gZHJhZyBoYW5kbGVyLCBtYWRlIGF2YWlsYWJsZSBmb3IgdXNlIGJ5IGNyZWF0b3Igbm9kZXNcclxuICAgICAgdGhpcy5kcmFnSGFuZGxlciA9IG5ldyBNYXNzRHJhZ0hhbmRsZXIoIGJyaWNrU3RhY2ssIG1vZGVsVmlld1RyYW5zZm9ybSApO1xyXG5cclxuICAgICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCB0aGlzLmRyYWdIYW5kbGVyICk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5iYWxhbmNpbmdBY3QucmVnaXN0ZXIoICdCcmlja1N0YWNrTm9kZScsIEJyaWNrU3RhY2tOb2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBCcmlja1N0YWNrTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3BFLE9BQU9DLFlBQVksTUFBTSx1QkFBdUI7QUFDaEQsT0FBT0MsbUJBQW1CLE1BQU0sOEJBQThCO0FBQzlELE9BQU9DLGlCQUFpQixNQUFNLHlCQUF5QjtBQUN2RCxPQUFPQyxXQUFXLE1BQU0seUJBQXlCO0FBQ2pELE9BQU9DLGVBQWUsTUFBTSxzQkFBc0I7QUFFbEQsTUFBTUMsUUFBUSxHQUFHSixtQkFBbUIsQ0FBQ0ssRUFBRTtBQUN2QyxNQUFNQyxzQkFBc0IsR0FBR04sbUJBQW1CLENBQUNP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