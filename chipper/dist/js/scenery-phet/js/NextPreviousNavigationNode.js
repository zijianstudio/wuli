// Copyright 2013-2022, University of Colorado Boulder

/**
 * Shows a central node surrounded with next/previous arrows. Need to implement next(),previous(),
 * and when availability changes modify hasNextProperty and hasPreviousProperty
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../axon/js/Property.js';
import { Shape } from '../../kite/js/imports.js';
import merge from '../../phet-core/js/merge.js';
import { Color, FireListener, Node, Path } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
import deprecationWarning from '../../phet-core/js/deprecationWarning.js';

/**
 * @deprecated Do not use in new code until https://github.com/phetsims/scenery-phet/issues/763 is addressed.
 * This is currently used only in build-a-molecule.
 */
class NextPreviousNavigationNode extends Node {
  /**
   * @param {Node} centerNode
   * @param {Object} [selfOptions]  Valid options are:
   *                                arrowColor         - color for the arrow's fill
   *                                arrowStrokeColor   - color for the arrow's stroke
   *                                arrowWidth         - the width of the arrow, from its point to its side
   *                                arrowHeight        - the height of the arrow, from tip to tip
   *                                next               - a function to be called when the "next" arrow is pressed
   *                                previous           - a function to be called when the "previous" arrow is pressed
   *                                createTouchAreaShape - function( shape, isPrevious ) that returns the touch area for the specified arrow
   * @param {Object} [nodeOptions] passed to the Node (super) constructor
   */
  constructor(centerNode, selfOptions, nodeOptions) {
    assert && deprecationWarning('NextPreviousNavigationNode is deprecated, see https://github.com/phetsims/scenery-phet/issues/763');
    selfOptions = merge({
      arrowColor: Color.YELLOW,
      arrowStrokeColor: Color.BLACK,
      arrowWidth: 14,
      arrowHeight: 18,
      arrowPadding: 15,
      next: null,
      // function() { ... }
      previous: null,
      // function() { ... }
      createTouchAreaShape: function (shape, isPrevious) {
        return null; // pass in function that returns a shape given the shape of the arrow
      }
    }, selfOptions);
    super();

    // @public
    this.hasNextProperty = new Property(false);
    this.hasPreviousProperty = new Property(false);
    const arrowWidth = selfOptions.arrowWidth;
    const arrowHeight = selfOptions.arrowHeight;

    /*---------------------------------------------------------------------------*
     * previous
     *----------------------------------------------------------------------------*/

    // triangle pointing to the left
    const previousShape = new Shape().moveTo(0, arrowHeight / 2).lineTo(arrowWidth, 0).lineTo(arrowWidth, arrowHeight).close();
    const previousKitNode = new Path(previousShape, {
      fill: selfOptions.arrowColor,
      stroke: selfOptions.arrowStrokeColor,
      cursor: 'pointer',
      touchArea: selfOptions.createTouchAreaShape(previousShape, true)
    });
    previousKitNode.addInputListener(new FireListener({
      fire: () => {
        if (this.hasPreviousProperty.value) {
          selfOptions.previous && selfOptions.previous();
        }
      }
    }));
    this.hasPreviousProperty.link(available => {
      previousKitNode.visible = available;
    });
    this.addChild(previousKitNode);

    /*---------------------------------------------------------------------------*
     * center
     *----------------------------------------------------------------------------*/

    this.addChild(centerNode);

    /*---------------------------------------------------------------------------*
     * next
     *----------------------------------------------------------------------------*/

    // triangle pointing to the right
    const nextShape = new Shape().moveTo(arrowWidth, arrowHeight / 2).lineTo(0, 0).lineTo(0, arrowHeight).close();
    const nextKitNode = new Path(nextShape, {
      fill: selfOptions.arrowColor,
      stroke: selfOptions.arrowStrokeColor,
      cursor: 'pointer',
      touchArea: selfOptions.createTouchAreaShape(nextShape, false)
    });
    nextKitNode.addInputListener(new FireListener({
      fire: () => {
        if (this.hasNextProperty.value) {
          selfOptions.next && selfOptions.next();
        }
      }
    }));
    this.hasNextProperty.link(available => {
      nextKitNode.visible = available;
    });
    this.addChild(nextKitNode);

    /*---------------------------------------------------------------------------*
     * positioning
     *----------------------------------------------------------------------------*/

    const maxHeight = Math.max(arrowHeight, centerNode.height);
    previousKitNode.centerY = maxHeight / 2;
    centerNode.centerY = maxHeight / 2;
    nextKitNode.centerY = maxHeight / 2;

    // previousKitNode.x = 0;
    centerNode.x = arrowWidth + selfOptions.arrowPadding;
    nextKitNode.x = centerNode.right + selfOptions.arrowPadding;
    this.mutate(nodeOptions);
  }
}
sceneryPhet.register('NextPreviousNavigationNode', NextPreviousNavigationNode);
export default NextPreviousNavigationNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNoYXBlIiwibWVyZ2UiLCJDb2xvciIsIkZpcmVMaXN0ZW5lciIsIk5vZGUiLCJQYXRoIiwic2NlbmVyeVBoZXQiLCJkZXByZWNhdGlvbldhcm5pbmciLCJOZXh0UHJldmlvdXNOYXZpZ2F0aW9uTm9kZSIsImNvbnN0cnVjdG9yIiwiY2VudGVyTm9kZSIsInNlbGZPcHRpb25zIiwibm9kZU9wdGlvbnMiLCJhc3NlcnQiLCJhcnJvd0NvbG9yIiwiWUVMTE9XIiwiYXJyb3dTdHJva2VDb2xvciIsIkJMQUNLIiwiYXJyb3dXaWR0aCIsImFycm93SGVpZ2h0IiwiYXJyb3dQYWRkaW5nIiwibmV4dCIsInByZXZpb3VzIiwiY3JlYXRlVG91Y2hBcmVhU2hhcGUiLCJzaGFwZSIsImlzUHJldmlvdXMiLCJoYXNOZXh0UHJvcGVydHkiLCJoYXNQcmV2aW91c1Byb3BlcnR5IiwicHJldmlvdXNTaGFwZSIsIm1vdmVUbyIsImxpbmVUbyIsImNsb3NlIiwicHJldmlvdXNLaXROb2RlIiwiZmlsbCIsInN0cm9rZSIsImN1cnNvciIsInRvdWNoQXJlYSIsImFkZElucHV0TGlzdGVuZXIiLCJmaXJlIiwidmFsdWUiLCJsaW5rIiwiYXZhaWxhYmxlIiwidmlzaWJsZSIsImFkZENoaWxkIiwibmV4dFNoYXBlIiwibmV4dEtpdE5vZGUiLCJtYXhIZWlnaHQiLCJNYXRoIiwibWF4IiwiaGVpZ2h0IiwiY2VudGVyWSIsIngiLCJyaWdodCIsIm11dGF0ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTmV4dFByZXZpb3VzTmF2aWdhdGlvbk5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU2hvd3MgYSBjZW50cmFsIG5vZGUgc3Vycm91bmRlZCB3aXRoIG5leHQvcHJldmlvdXMgYXJyb3dzLiBOZWVkIHRvIGltcGxlbWVudCBuZXh0KCkscHJldmlvdXMoKSxcclxuICogYW5kIHdoZW4gYXZhaWxhYmlsaXR5IGNoYW5nZXMgbW9kaWZ5IGhhc05leHRQcm9wZXJ0eSBhbmQgaGFzUHJldmlvdXNQcm9wZXJ0eVxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBDb2xvciwgRmlyZUxpc3RlbmVyLCBOb2RlLCBQYXRoIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xyXG5pbXBvcnQgZGVwcmVjYXRpb25XYXJuaW5nIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9kZXByZWNhdGlvbldhcm5pbmcuanMnO1xyXG5cclxuLyoqXHJcbiAqIEBkZXByZWNhdGVkIERvIG5vdCB1c2UgaW4gbmV3IGNvZGUgdW50aWwgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvNzYzIGlzIGFkZHJlc3NlZC5cclxuICogVGhpcyBpcyBjdXJyZW50bHkgdXNlZCBvbmx5IGluIGJ1aWxkLWEtbW9sZWN1bGUuXHJcbiAqL1xyXG5jbGFzcyBOZXh0UHJldmlvdXNOYXZpZ2F0aW9uTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge05vZGV9IGNlbnRlck5vZGVcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW3NlbGZPcHRpb25zXSAgVmFsaWQgb3B0aW9ucyBhcmU6XHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycm93Q29sb3IgICAgICAgICAtIGNvbG9yIGZvciB0aGUgYXJyb3cncyBmaWxsXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycm93U3Ryb2tlQ29sb3IgICAtIGNvbG9yIGZvciB0aGUgYXJyb3cncyBzdHJva2VcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyb3dXaWR0aCAgICAgICAgIC0gdGhlIHdpZHRoIG9mIHRoZSBhcnJvdywgZnJvbSBpdHMgcG9pbnQgdG8gaXRzIHNpZGVcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyb3dIZWlnaHQgICAgICAgIC0gdGhlIGhlaWdodCBvZiB0aGUgYXJyb3csIGZyb20gdGlwIHRvIHRpcFxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0ICAgICAgICAgICAgICAgLSBhIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBcIm5leHRcIiBhcnJvdyBpcyBwcmVzc2VkXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXZpb3VzICAgICAgICAgICAtIGEgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIFwicHJldmlvdXNcIiBhcnJvdyBpcyBwcmVzc2VkXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZVRvdWNoQXJlYVNoYXBlIC0gZnVuY3Rpb24oIHNoYXBlLCBpc1ByZXZpb3VzICkgdGhhdCByZXR1cm5zIHRoZSB0b3VjaCBhcmVhIGZvciB0aGUgc3BlY2lmaWVkIGFycm93XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtub2RlT3B0aW9uc10gcGFzc2VkIHRvIHRoZSBOb2RlIChzdXBlcikgY29uc3RydWN0b3JcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggY2VudGVyTm9kZSwgc2VsZk9wdGlvbnMsIG5vZGVPcHRpb25zICkge1xyXG4gICAgYXNzZXJ0ICYmIGRlcHJlY2F0aW9uV2FybmluZyggJ05leHRQcmV2aW91c05hdmlnYXRpb25Ob2RlIGlzIGRlcHJlY2F0ZWQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy83NjMnICk7XHJcblxyXG4gICAgc2VsZk9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBhcnJvd0NvbG9yOiBDb2xvci5ZRUxMT1csXHJcbiAgICAgIGFycm93U3Ryb2tlQ29sb3I6IENvbG9yLkJMQUNLLFxyXG4gICAgICBhcnJvd1dpZHRoOiAxNCxcclxuICAgICAgYXJyb3dIZWlnaHQ6IDE4LFxyXG4gICAgICBhcnJvd1BhZGRpbmc6IDE1LFxyXG4gICAgICBuZXh0OiBudWxsLCAvLyBmdW5jdGlvbigpIHsgLi4uIH1cclxuICAgICAgcHJldmlvdXM6IG51bGwsIC8vIGZ1bmN0aW9uKCkgeyAuLi4gfVxyXG4gICAgICBjcmVhdGVUb3VjaEFyZWFTaGFwZTogZnVuY3Rpb24oIHNoYXBlLCBpc1ByZXZpb3VzICkge1xyXG4gICAgICAgIHJldHVybiBudWxsOyAvLyBwYXNzIGluIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHNoYXBlIGdpdmVuIHRoZSBzaGFwZSBvZiB0aGUgYXJyb3dcclxuICAgICAgfVxyXG4gICAgfSwgc2VsZk9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIEBwdWJsaWNcclxuICAgIHRoaXMuaGFzTmV4dFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBmYWxzZSApO1xyXG4gICAgdGhpcy5oYXNQcmV2aW91c1Byb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIGNvbnN0IGFycm93V2lkdGggPSBzZWxmT3B0aW9ucy5hcnJvd1dpZHRoO1xyXG4gICAgY29uc3QgYXJyb3dIZWlnaHQgPSBzZWxmT3B0aW9ucy5hcnJvd0hlaWdodDtcclxuXHJcbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICAgICAqIHByZXZpb3VzXHJcbiAgICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAgIC8vIHRyaWFuZ2xlIHBvaW50aW5nIHRvIHRoZSBsZWZ0XHJcbiAgICBjb25zdCBwcmV2aW91c1NoYXBlID0gbmV3IFNoYXBlKCkubW92ZVRvKCAwLCBhcnJvd0hlaWdodCAvIDIgKVxyXG4gICAgICAubGluZVRvKCBhcnJvd1dpZHRoLCAwIClcclxuICAgICAgLmxpbmVUbyggYXJyb3dXaWR0aCwgYXJyb3dIZWlnaHQgKVxyXG4gICAgICAuY2xvc2UoKTtcclxuXHJcbiAgICBjb25zdCBwcmV2aW91c0tpdE5vZGUgPSBuZXcgUGF0aCggcHJldmlvdXNTaGFwZSwge1xyXG4gICAgICBmaWxsOiBzZWxmT3B0aW9ucy5hcnJvd0NvbG9yLFxyXG4gICAgICBzdHJva2U6IHNlbGZPcHRpb25zLmFycm93U3Ryb2tlQ29sb3IsXHJcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICB0b3VjaEFyZWE6IHNlbGZPcHRpb25zLmNyZWF0ZVRvdWNoQXJlYVNoYXBlKCBwcmV2aW91c1NoYXBlLCB0cnVlIClcclxuICAgIH0gKTtcclxuICAgIHByZXZpb3VzS2l0Tm9kZS5hZGRJbnB1dExpc3RlbmVyKCBuZXcgRmlyZUxpc3RlbmVyKCB7XHJcbiAgICAgIGZpcmU6ICgpID0+IHtcclxuICAgICAgICBpZiAoIHRoaXMuaGFzUHJldmlvdXNQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICAgIHNlbGZPcHRpb25zLnByZXZpb3VzICYmIHNlbGZPcHRpb25zLnByZXZpb3VzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICkgKTtcclxuICAgIHRoaXMuaGFzUHJldmlvdXNQcm9wZXJ0eS5saW5rKCBhdmFpbGFibGUgPT4ge1xyXG4gICAgICBwcmV2aW91c0tpdE5vZGUudmlzaWJsZSA9IGF2YWlsYWJsZTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBwcmV2aW91c0tpdE5vZGUgKTtcclxuXHJcbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICAgICAqIGNlbnRlclxyXG4gICAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBjZW50ZXJOb2RlICk7XHJcblxyXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXHJcbiAgICAgKiBuZXh0XHJcbiAgICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAgIC8vIHRyaWFuZ2xlIHBvaW50aW5nIHRvIHRoZSByaWdodFxyXG4gICAgY29uc3QgbmV4dFNoYXBlID0gbmV3IFNoYXBlKCkubW92ZVRvKCBhcnJvd1dpZHRoLCBhcnJvd0hlaWdodCAvIDIgKVxyXG4gICAgICAubGluZVRvKCAwLCAwIClcclxuICAgICAgLmxpbmVUbyggMCwgYXJyb3dIZWlnaHQgKVxyXG4gICAgICAuY2xvc2UoKTtcclxuXHJcbiAgICBjb25zdCBuZXh0S2l0Tm9kZSA9IG5ldyBQYXRoKCBuZXh0U2hhcGUsIHtcclxuICAgICAgZmlsbDogc2VsZk9wdGlvbnMuYXJyb3dDb2xvcixcclxuICAgICAgc3Ryb2tlOiBzZWxmT3B0aW9ucy5hcnJvd1N0cm9rZUNvbG9yLFxyXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgdG91Y2hBcmVhOiBzZWxmT3B0aW9ucy5jcmVhdGVUb3VjaEFyZWFTaGFwZSggbmV4dFNoYXBlLCBmYWxzZSApXHJcbiAgICB9ICk7XHJcbiAgICBuZXh0S2l0Tm9kZS5hZGRJbnB1dExpc3RlbmVyKCBuZXcgRmlyZUxpc3RlbmVyKCB7XHJcbiAgICAgIGZpcmU6ICgpID0+IHtcclxuICAgICAgICBpZiAoIHRoaXMuaGFzTmV4dFByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgICAgc2VsZk9wdGlvbnMubmV4dCAmJiBzZWxmT3B0aW9ucy5uZXh0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICkgKTtcclxuICAgIHRoaXMuaGFzTmV4dFByb3BlcnR5LmxpbmsoIGF2YWlsYWJsZSA9PiB7XHJcbiAgICAgIG5leHRLaXROb2RlLnZpc2libGUgPSBhdmFpbGFibGU7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV4dEtpdE5vZGUgKTtcclxuXHJcbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcclxuICAgICAqIHBvc2l0aW9uaW5nXHJcbiAgICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5cclxuICAgIGNvbnN0IG1heEhlaWdodCA9IE1hdGgubWF4KCBhcnJvd0hlaWdodCwgY2VudGVyTm9kZS5oZWlnaHQgKTtcclxuXHJcbiAgICBwcmV2aW91c0tpdE5vZGUuY2VudGVyWSA9IG1heEhlaWdodCAvIDI7XHJcbiAgICBjZW50ZXJOb2RlLmNlbnRlclkgPSBtYXhIZWlnaHQgLyAyO1xyXG4gICAgbmV4dEtpdE5vZGUuY2VudGVyWSA9IG1heEhlaWdodCAvIDI7XHJcblxyXG4gICAgLy8gcHJldmlvdXNLaXROb2RlLnggPSAwO1xyXG4gICAgY2VudGVyTm9kZS54ID0gYXJyb3dXaWR0aCArIHNlbGZPcHRpb25zLmFycm93UGFkZGluZztcclxuICAgIG5leHRLaXROb2RlLnggPSBjZW50ZXJOb2RlLnJpZ2h0ICsgc2VsZk9wdGlvbnMuYXJyb3dQYWRkaW5nO1xyXG5cclxuICAgIHRoaXMubXV0YXRlKCBub2RlT3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdOZXh0UHJldmlvdXNOYXZpZ2F0aW9uTm9kZScsIE5leHRQcmV2aW91c05hdmlnYXRpb25Ob2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IE5leHRQcmV2aW91c05hdmlnYXRpb25Ob2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSwyQkFBMkI7QUFDaEQsU0FBU0MsS0FBSyxRQUFRLDBCQUEwQjtBQUNoRCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLFNBQVNDLEtBQUssRUFBRUMsWUFBWSxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSw2QkFBNkI7QUFDN0UsT0FBT0MsV0FBVyxNQUFNLGtCQUFrQjtBQUMxQyxPQUFPQyxrQkFBa0IsTUFBTSwwQ0FBMEM7O0FBRXpFO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTUMsMEJBQTBCLFNBQVNKLElBQUksQ0FBQztFQUU1QztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUssV0FBV0EsQ0FBRUMsVUFBVSxFQUFFQyxXQUFXLEVBQUVDLFdBQVcsRUFBRztJQUNsREMsTUFBTSxJQUFJTixrQkFBa0IsQ0FBRSxtR0FBb0csQ0FBQztJQUVuSUksV0FBVyxHQUFHVixLQUFLLENBQUU7TUFDbkJhLFVBQVUsRUFBRVosS0FBSyxDQUFDYSxNQUFNO01BQ3hCQyxnQkFBZ0IsRUFBRWQsS0FBSyxDQUFDZSxLQUFLO01B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