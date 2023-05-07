// Copyright 2014-2023, University of Colorado Boulder

/**
 * A pair of boxes that show the number of molecules indicated by the equation's user coefficients.
 * Left box is for the reactants, right box is for the products.
 *
 * @author Vasily Shakhov (mlearner.com)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Node } from '../../../../scenery/js/imports.js';
import balancingChemicalEquations from '../../balancingChemicalEquations.js';
import BalancingChemicalEquationsStrings from '../../BalancingChemicalEquationsStrings.js';
import BoxNode from './BoxNode.js';
import RightArrowNode from './RightArrowNode.js';
import optionize from '../../../../phet-core/js/optionize.js';
export default class BoxesNode extends Node {
  /**
   * @param equationProperty - the equation displayed in the boxes
   * @param coefficientsRange
   * @param aligner - provides layout information to ensure horizontal alignment with other user-interface elements
   * @param boxSize
   * @param boxColor - fill color of the boxes
   * @param reactantsBoxExpandedProperty
   * @param productsBoxExpandedProperty
   * @param [providedOptions]
   */
  constructor(equationProperty, coefficientsRange, aligner, boxSize, boxColor, reactantsBoxExpandedProperty, productsBoxExpandedProperty, providedOptions) {
    const options = optionize()({}, providedOptions);

    // reactants box, on the left
    const reactantsBoxNode = new BoxNode(equationProperty, equation => equation.reactants, equation => aligner.getReactantXOffsets(equation), coefficientsRange, BalancingChemicalEquationsStrings.reactantsStringProperty, {
      expandedProperty: reactantsBoxExpandedProperty,
      fill: boxColor,
      boxWidth: boxSize.width,
      boxHeight: boxSize.height,
      x: aligner.getReactantsBoxLeft(),
      y: 0
    });

    // products box, on the right
    const productsBoxNode = new BoxNode(equationProperty, equation => equation.products, equation => aligner.getProductXOffsets(equation), coefficientsRange, BalancingChemicalEquationsStrings.productsStringProperty, {
      expandedProperty: productsBoxExpandedProperty,
      fill: boxColor,
      boxWidth: boxSize.width,
      boxHeight: boxSize.height,
      x: aligner.getProductsBoxLeft(),
      y: 0
    });

    // right-pointing arrow, in the middle
    const arrowNode = new RightArrowNode(equationProperty, {
      center: new Vector2(aligner.getScreenCenterX(), boxSize.height / 2)
    });
    options.children = [reactantsBoxNode, productsBoxNode, arrowNode];
    super(options);
    this.arrowNode = arrowNode;
  }

  // No dispose needed, instances of this type persist for lifetime of the sim.

  /**
   * Enables or disables the highlighting feature.
   * When enabled, the arrow between the boxes will light up when the equation is balanced.
   * This is enabled by default, but we want to disable in the Game until the user presses the "Check" button.
   */
  setBalancedHighlightEnabled(enabled) {
    this.arrowNode.setHighlightEnabled(enabled);
  }
}
balancingChemicalEquations.register('BoxesNode', BoxesNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiTm9kZSIsImJhbGFuY2luZ0NoZW1pY2FsRXF1YXRpb25zIiwiQmFsYW5jaW5nQ2hlbWljYWxFcXVhdGlvbnNTdHJpbmdzIiwiQm94Tm9kZSIsIlJpZ2h0QXJyb3dOb2RlIiwib3B0aW9uaXplIiwiQm94ZXNOb2RlIiwiY29uc3RydWN0b3IiLCJlcXVhdGlvblByb3BlcnR5IiwiY29lZmZpY2llbnRzUmFuZ2UiLCJhbGlnbmVyIiwiYm94U2l6ZSIsImJveENvbG9yIiwicmVhY3RhbnRzQm94RXhwYW5kZWRQcm9wZXJ0eSIsInByb2R1Y3RzQm94RXhwYW5kZWRQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJyZWFjdGFudHNCb3hOb2RlIiwiZXF1YXRpb24iLCJyZWFjdGFudHMiLCJnZXRSZWFjdGFudFhPZmZzZXRzIiwicmVhY3RhbnRzU3RyaW5nUHJvcGVydHkiLCJleHBhbmRlZFByb3BlcnR5IiwiZmlsbCIsImJveFdpZHRoIiwid2lkdGgiLCJib3hIZWlnaHQiLCJoZWlnaHQiLCJ4IiwiZ2V0UmVhY3RhbnRzQm94TGVmdCIsInkiLCJwcm9kdWN0c0JveE5vZGUiLCJwcm9kdWN0cyIsImdldFByb2R1Y3RYT2Zmc2V0cyIsInByb2R1Y3RzU3RyaW5nUHJvcGVydHkiLCJnZXRQcm9kdWN0c0JveExlZnQiLCJhcnJvd05vZGUiLCJjZW50ZXIiLCJnZXRTY3JlZW5DZW50ZXJYIiwiY2hpbGRyZW4iLCJzZXRCYWxhbmNlZEhpZ2hsaWdodEVuYWJsZWQiLCJlbmFibGVkIiwic2V0SGlnaGxpZ2h0RW5hYmxlZCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQm94ZXNOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgcGFpciBvZiBib3hlcyB0aGF0IHNob3cgdGhlIG51bWJlciBvZiBtb2xlY3VsZXMgaW5kaWNhdGVkIGJ5IHRoZSBlcXVhdGlvbidzIHVzZXIgY29lZmZpY2llbnRzLlxyXG4gKiBMZWZ0IGJveCBpcyBmb3IgdGhlIHJlYWN0YW50cywgcmlnaHQgYm94IGlzIGZvciB0aGUgcHJvZHVjdHMuXHJcbiAqXHJcbiAqIEBhdXRob3IgVmFzaWx5IFNoYWtob3YgKG1sZWFybmVyLmNvbSlcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBOb2RlT3B0aW9ucywgTm9kZVRyYW5zbGF0aW9uT3B0aW9ucywgVENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGJhbGFuY2luZ0NoZW1pY2FsRXF1YXRpb25zIGZyb20gJy4uLy4uL2JhbGFuY2luZ0NoZW1pY2FsRXF1YXRpb25zLmpzJztcclxuaW1wb3J0IEJhbGFuY2luZ0NoZW1pY2FsRXF1YXRpb25zU3RyaW5ncyBmcm9tICcuLi8uLi9CYWxhbmNpbmdDaGVtaWNhbEVxdWF0aW9uc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgQm94Tm9kZSBmcm9tICcuL0JveE5vZGUuanMnO1xyXG5pbXBvcnQgUmlnaHRBcnJvd05vZGUgZnJvbSAnLi9SaWdodEFycm93Tm9kZS5qcyc7XHJcbmltcG9ydCBFcXVhdGlvbiBmcm9tICcuLi9tb2RlbC9FcXVhdGlvbi5qcyc7XHJcbmltcG9ydCBIb3Jpem9udGFsQWxpZ25lciBmcm9tICcuL0hvcml6b250YWxBbGlnbmVyLmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgQm94ZXNOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZVRyYW5zbGF0aW9uT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJveGVzTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGFycm93Tm9kZTogUmlnaHRBcnJvd05vZGU7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBlcXVhdGlvblByb3BlcnR5IC0gdGhlIGVxdWF0aW9uIGRpc3BsYXllZCBpbiB0aGUgYm94ZXNcclxuICAgKiBAcGFyYW0gY29lZmZpY2llbnRzUmFuZ2VcclxuICAgKiBAcGFyYW0gYWxpZ25lciAtIHByb3ZpZGVzIGxheW91dCBpbmZvcm1hdGlvbiB0byBlbnN1cmUgaG9yaXpvbnRhbCBhbGlnbm1lbnQgd2l0aCBvdGhlciB1c2VyLWludGVyZmFjZSBlbGVtZW50c1xyXG4gICAqIEBwYXJhbSBib3hTaXplXHJcbiAgICogQHBhcmFtIGJveENvbG9yIC0gZmlsbCBjb2xvciBvZiB0aGUgYm94ZXNcclxuICAgKiBAcGFyYW0gcmVhY3RhbnRzQm94RXhwYW5kZWRQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSBwcm9kdWN0c0JveEV4cGFuZGVkUHJvcGVydHlcclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGVxdWF0aW9uUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PEVxdWF0aW9uPixcclxuICAgICAgICAgICAgICAgICAgICAgIGNvZWZmaWNpZW50c1JhbmdlOiBSYW5nZSxcclxuICAgICAgICAgICAgICAgICAgICAgIGFsaWduZXI6IEhvcml6b250YWxBbGlnbmVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgYm94U2l6ZTogRGltZW5zaW9uMixcclxuICAgICAgICAgICAgICAgICAgICAgIGJveENvbG9yOiBUQ29sb3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICByZWFjdGFudHNCb3hFeHBhbmRlZFByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPixcclxuICAgICAgICAgICAgICAgICAgICAgIHByb2R1Y3RzQm94RXhwYW5kZWRQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM/OiBCb3hlc05vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Qm94ZXNOb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7fSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgLy8gcmVhY3RhbnRzIGJveCwgb24gdGhlIGxlZnRcclxuICAgIGNvbnN0IHJlYWN0YW50c0JveE5vZGUgPSBuZXcgQm94Tm9kZSggZXF1YXRpb25Qcm9wZXJ0eSxcclxuICAgICAgZXF1YXRpb24gPT4gZXF1YXRpb24ucmVhY3RhbnRzLFxyXG4gICAgICBlcXVhdGlvbiA9PiBhbGlnbmVyLmdldFJlYWN0YW50WE9mZnNldHMoIGVxdWF0aW9uICksXHJcbiAgICAgIGNvZWZmaWNpZW50c1JhbmdlLFxyXG4gICAgICBCYWxhbmNpbmdDaGVtaWNhbEVxdWF0aW9uc1N0cmluZ3MucmVhY3RhbnRzU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgICBleHBhbmRlZFByb3BlcnR5OiByZWFjdGFudHNCb3hFeHBhbmRlZFByb3BlcnR5LFxyXG4gICAgICAgIGZpbGw6IGJveENvbG9yLFxyXG4gICAgICAgIGJveFdpZHRoOiBib3hTaXplLndpZHRoLFxyXG4gICAgICAgIGJveEhlaWdodDogYm94U2l6ZS5oZWlnaHQsXHJcbiAgICAgICAgeDogYWxpZ25lci5nZXRSZWFjdGFudHNCb3hMZWZ0KCksXHJcbiAgICAgICAgeTogMFxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gcHJvZHVjdHMgYm94LCBvbiB0aGUgcmlnaHRcclxuICAgIGNvbnN0IHByb2R1Y3RzQm94Tm9kZSA9IG5ldyBCb3hOb2RlKCBlcXVhdGlvblByb3BlcnR5LFxyXG4gICAgICBlcXVhdGlvbiA9PiBlcXVhdGlvbi5wcm9kdWN0cyxcclxuICAgICAgZXF1YXRpb24gPT4gYWxpZ25lci5nZXRQcm9kdWN0WE9mZnNldHMoIGVxdWF0aW9uICksXHJcbiAgICAgIGNvZWZmaWNpZW50c1JhbmdlLFxyXG4gICAgICBCYWxhbmNpbmdDaGVtaWNhbEVxdWF0aW9uc1N0cmluZ3MucHJvZHVjdHNTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICAgIGV4cGFuZGVkUHJvcGVydHk6IHByb2R1Y3RzQm94RXhwYW5kZWRQcm9wZXJ0eSxcclxuICAgICAgICBmaWxsOiBib3hDb2xvcixcclxuICAgICAgICBib3hXaWR0aDogYm94U2l6ZS53aWR0aCxcclxuICAgICAgICBib3hIZWlnaHQ6IGJveFNpemUuaGVpZ2h0LFxyXG4gICAgICAgIHg6IGFsaWduZXIuZ2V0UHJvZHVjdHNCb3hMZWZ0KCksXHJcbiAgICAgICAgeTogMFxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gcmlnaHQtcG9pbnRpbmcgYXJyb3csIGluIHRoZSBtaWRkbGVcclxuICAgIGNvbnN0IGFycm93Tm9kZSA9IG5ldyBSaWdodEFycm93Tm9kZSggZXF1YXRpb25Qcm9wZXJ0eSwge1xyXG4gICAgICBjZW50ZXI6IG5ldyBWZWN0b3IyKCBhbGlnbmVyLmdldFNjcmVlbkNlbnRlclgoKSwgYm94U2l6ZS5oZWlnaHQgLyAyIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyByZWFjdGFudHNCb3hOb2RlLCBwcm9kdWN0c0JveE5vZGUsIGFycm93Tm9kZSBdO1xyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmFycm93Tm9kZSA9IGFycm93Tm9kZTtcclxuICB9XHJcblxyXG4gIC8vIE5vIGRpc3Bvc2UgbmVlZGVkLCBpbnN0YW5jZXMgb2YgdGhpcyB0eXBlIHBlcnNpc3QgZm9yIGxpZmV0aW1lIG9mIHRoZSBzaW0uXHJcblxyXG4gIC8qKlxyXG4gICAqIEVuYWJsZXMgb3IgZGlzYWJsZXMgdGhlIGhpZ2hsaWdodGluZyBmZWF0dXJlLlxyXG4gICAqIFdoZW4gZW5hYmxlZCwgdGhlIGFycm93IGJldHdlZW4gdGhlIGJveGVzIHdpbGwgbGlnaHQgdXAgd2hlbiB0aGUgZXF1YXRpb24gaXMgYmFsYW5jZWQuXHJcbiAgICogVGhpcyBpcyBlbmFibGVkIGJ5IGRlZmF1bHQsIGJ1dCB3ZSB3YW50IHRvIGRpc2FibGUgaW4gdGhlIEdhbWUgdW50aWwgdGhlIHVzZXIgcHJlc3NlcyB0aGUgXCJDaGVja1wiIGJ1dHRvbi5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0QmFsYW5jZWRIaWdobGlnaHRFbmFibGVkKCBlbmFibGVkOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgdGhpcy5hcnJvd05vZGUuc2V0SGlnaGxpZ2h0RW5hYmxlZCggZW5hYmxlZCApO1xyXG4gIH1cclxufVxyXG5cclxuYmFsYW5jaW5nQ2hlbWljYWxFcXVhdGlvbnMucmVnaXN0ZXIoICdCb3hlc05vZGUnLCBCb3hlc05vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsU0FBU0MsSUFBSSxRQUFxRCxtQ0FBbUM7QUFDckcsT0FBT0MsMEJBQTBCLE1BQU0scUNBQXFDO0FBQzVFLE9B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