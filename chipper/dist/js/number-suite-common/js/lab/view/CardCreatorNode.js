// Copyright 2022-2023, University of Colorado Boulder

/**
 * A node that looks like a CardNode that creates a CardNode when pressed. (A card factor)
 *
 * Supports creating both a SymbolCardNode and a NumberCardNode, as well as handling the creator-pattern drag forwarding.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import { DragListener, Node } from '../../../../scenery/js/imports.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import SymbolCardNode from './SymbolCardNode.js';
import Easing from '../../../../twixt/js/Easing.js';
import Animation from '../../../../twixt/js/Animation.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import NumberCardNode from './NumberCardNode.js';
import CountingCommonConstants from '../../../../counting-common/js/common/CountingCommonConstants.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
class CardCreatorNode extends Node {
  constructor(screenView, contentToCountPropertyMap, options) {
    super();
    let iconNode;
    const iconOptions = {
      includeDragListener: false,
      dragBoundsProperty: screenView.symbolCardBoundsProperty,
      homePosition: Vector2.ZERO
    };
    if (options.symbolType) {
      assert && assert(!options.number, 'symbolType and number cannot both be provided');
      iconNode = new SymbolCardNode(combineOptions({
        symbolType: options.symbolType
      }, iconOptions));
    } else {
      assert && assert(options.number, 'symbolType or number must be provided');
      iconNode = new NumberCardNode(combineOptions({
        number: options.number
      }, iconOptions));
    }
    iconNode.addInputListener(DragListener.createForwardingListener(event => {
      let cardNode;
      let countProperty;
      const dropListener = () => {
        const homeNodeBounds = options.symbolType ? screenView.symbolCardCreatorPanel.bounds : screenView.numberCardCreatorCarousel.bounds;
        if (cardNode.bounds.intersectsBounds(homeNodeBounds)) {
          cardNode.inputEnabled = false;

          // Calculate the icon's origin.
          const trail = screenView.getUniqueLeafTrailTo(iconNode).slice(1);
          const globalOrigin = trail.localToGlobalPoint(iconNode.localBounds.center);

          // If returning to a different page, clamp destination at edge.
          if (globalOrigin.x < homeNodeBounds.left) {
            globalOrigin.x = homeNodeBounds.left;
          } else if (globalOrigin.x > homeNodeBounds.right) {
            globalOrigin.x = homeNodeBounds.right;
          }
          const distance = cardNode.positionProperty.value.distance(globalOrigin);
          const duration = CountingCommonConstants.ANIMATION_TIME_RANGE.constrainValue(distance / CountingCommonConstants.ANIMATION_SPEED);
          cardNode.animation = new Animation({
            duration: duration,
            targets: [{
              property: cardNode.positionProperty,
              easing: Easing.CUBIC_IN_OUT,
              to: globalOrigin
            }]
          });
          cardNode.animation.finishEmitter.addListener(() => {
            screenView.pieceLayer.removeChild(cardNode);
            cardNode.dispose();
            countProperty.value--;
          });
          cardNode.animation.start();
        }
      };
      const cardNodeOptions = {
        dropListener: dropListener
      };
      if (options.symbolType) {
        assert && assert(!options.number, 'symbolType and number cannot both be provided');
        countProperty = contentToCountPropertyMap.get(options.symbolType);
        assert && assert(countProperty, 'countProperty for inequality symbol not found: ' + options.symbolType);
        cardNode = new SymbolCardNode(combineOptions({
          symbolType: options.symbolType,
          dragBoundsProperty: screenView.symbolCardBoundsProperty
        }, cardNodeOptions));
      } else {
        assert && assert(options.number, 'symbolType or number must be provided');
        countProperty = contentToCountPropertyMap.get(options.number);
        cardNode = new NumberCardNode(combineOptions({
          number: options.number,
          dragBoundsProperty: screenView.numberCardBoundsProperty
        }, cardNodeOptions));
      }
      countProperty.value++;
      screenView.pieceLayer.addChild(cardNode);
      cardNode.positionProperty.value = screenView.globalToLocalPoint(event.pointer.point).minus(cardNode.localBounds.centerBottom.minusXY(0, 15));
      cardNode.dragListener.press(event, cardNode);
    }));
    this.addChild(iconNode);
  }
}
numberSuiteCommon.register('CardCreatorNode', CardCreatorNode);
export default CardCreatorNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEcmFnTGlzdGVuZXIiLCJOb2RlIiwibnVtYmVyU3VpdGVDb21tb24iLCJTeW1ib2xDYXJkTm9kZSIsIkVhc2luZyIsIkFuaW1hdGlvbiIsIlZlY3RvcjIiLCJOdW1iZXJDYXJkTm9kZSIsIkNvdW50aW5nQ29tbW9uQ29uc3RhbnRzIiwiY29tYmluZU9wdGlvbnMiLCJDYXJkQ3JlYXRvck5vZGUiLCJjb25zdHJ1Y3RvciIsInNjcmVlblZpZXciLCJjb250ZW50VG9Db3VudFByb3BlcnR5TWFwIiwib3B0aW9ucyIsImljb25Ob2RlIiwiaWNvbk9wdGlvbnMiLCJpbmNsdWRlRHJhZ0xpc3RlbmVyIiwiZHJhZ0JvdW5kc1Byb3BlcnR5Iiwic3ltYm9sQ2FyZEJvdW5kc1Byb3BlcnR5IiwiaG9tZVBvc2l0aW9uIiwiWkVSTyIsInN5bWJvbFR5cGUiLCJhc3NlcnQiLCJudW1iZXIiLCJhZGRJbnB1dExpc3RlbmVyIiwiY3JlYXRlRm9yd2FyZGluZ0xpc3RlbmVyIiwiZXZlbnQiLCJjYXJkTm9kZSIsImNvdW50UHJvcGVydHkiLCJkcm9wTGlzdGVuZXIiLCJob21lTm9kZUJvdW5kcyIsInN5bWJvbENhcmRDcmVhdG9yUGFuZWwiLCJib3VuZHMiLCJudW1iZXJDYXJkQ3JlYXRvckNhcm91c2VsIiwiaW50ZXJzZWN0c0JvdW5kcyIsImlucHV0RW5hYmxlZCIsInRyYWlsIiwiZ2V0VW5pcXVlTGVhZlRyYWlsVG8iLCJzbGljZSIsImdsb2JhbE9yaWdpbiIsImxvY2FsVG9HbG9iYWxQb2ludCIsImxvY2FsQm91bmRzIiwiY2VudGVyIiwieCIsImxlZnQiLCJyaWdodCIsImRpc3RhbmNlIiwicG9zaXRpb25Qcm9wZXJ0eSIsInZhbHVlIiwiZHVyYXRpb24iLCJBTklNQVRJT05fVElNRV9SQU5HRSIsImNvbnN0cmFpblZhbHVlIiwiQU5JTUFUSU9OX1NQRUVEIiwiYW5pbWF0aW9uIiwidGFyZ2V0cyIsInByb3BlcnR5IiwiZWFzaW5nIiwiQ1VCSUNfSU5fT1VUIiwidG8iLCJmaW5pc2hFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJwaWVjZUxheWVyIiwicmVtb3ZlQ2hpbGQiLCJkaXNwb3NlIiwic3RhcnQiLCJjYXJkTm9kZU9wdGlvbnMiLCJnZXQiLCJudW1iZXJDYXJkQm91bmRzUHJvcGVydHkiLCJhZGRDaGlsZCIsImdsb2JhbFRvTG9jYWxQb2ludCIsInBvaW50ZXIiLCJwb2ludCIsIm1pbnVzIiwiY2VudGVyQm90dG9tIiwibWludXNYWSIsImRyYWdMaXN0ZW5lciIsInByZXNzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDYXJkQ3JlYXRvck5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBub2RlIHRoYXQgbG9va3MgbGlrZSBhIENhcmROb2RlIHRoYXQgY3JlYXRlcyBhIENhcmROb2RlIHdoZW4gcHJlc3NlZC4gKEEgY2FyZCBmYWN0b3IpXHJcbiAqXHJcbiAqIFN1cHBvcnRzIGNyZWF0aW5nIGJvdGggYSBTeW1ib2xDYXJkTm9kZSBhbmQgYSBOdW1iZXJDYXJkTm9kZSwgYXMgd2VsbCBhcyBoYW5kbGluZyB0aGUgY3JlYXRvci1wYXR0ZXJuIGRyYWcgZm9yd2FyZGluZy5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBLbHVzZW5kb3JmIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IERyYWdMaXN0ZW5lciwgTm9kZSwgUHJlc3NMaXN0ZW5lckV2ZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG51bWJlclN1aXRlQ29tbW9uIGZyb20gJy4uLy4uL251bWJlclN1aXRlQ29tbW9uLmpzJztcclxuaW1wb3J0IFN5bWJvbENhcmROb2RlLCB7IFN5bWJvbENhcmROb2RlT3B0aW9ucyB9IGZyb20gJy4vU3ltYm9sQ2FyZE5vZGUuanMnO1xyXG5pbXBvcnQgTGFiU2NyZWVuVmlldyBmcm9tICcuL0xhYlNjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgRWFzaW5nIGZyb20gJy4uLy4uLy4uLy4uL3R3aXh0L2pzL0Vhc2luZy5qcyc7XHJcbmltcG9ydCBBbmltYXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vdHdpeHQvanMvQW5pbWF0aW9uLmpzJztcclxuaW1wb3J0IENhcmROb2RlIGZyb20gJy4vQ2FyZE5vZGUuanMnO1xyXG5pbXBvcnQgVFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgTnVtYmVyQ2FyZE5vZGUsIHsgTnVtYmVyQ2FyZE5vZGVPcHRpb25zIH0gZnJvbSAnLi9OdW1iZXJDYXJkTm9kZS5qcyc7XHJcbmltcG9ydCBOdW1iZXJTdWl0ZUNvbW1vblByZWZlcmVuY2VzIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9OdW1iZXJTdWl0ZUNvbW1vblByZWZlcmVuY2VzLmpzJztcclxuaW1wb3J0IENvdW50aW5nQ29tbW9uQ29uc3RhbnRzIGZyb20gJy4uLy4uLy4uLy4uL2NvdW50aW5nLWNvbW1vbi9qcy9jb21tb24vQ291bnRpbmdDb21tb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgU3ltYm9sVHlwZSBmcm9tICcuL1N5bWJvbFR5cGUuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBzeW1ib2xUeXBlPzogU3ltYm9sVHlwZSB8IG51bGw7XHJcbiAgbnVtYmVyPzogbnVtYmVyIHwgbnVsbDtcclxufTtcclxuZXhwb3J0IHR5cGUgQ2FyZE5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnM7XHJcblxyXG5jbGFzcyBDYXJkQ3JlYXRvck5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzY3JlZW5WaWV3OiBMYWJTY3JlZW5WaWV3PE51bWJlclN1aXRlQ29tbW9uUHJlZmVyZW5jZXM+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgY29udGVudFRvQ291bnRQcm9wZXJ0eU1hcDogTWFwPFN5bWJvbFR5cGUgfCBudW1iZXIsIFRQcm9wZXJ0eTxudW1iZXI+PixcclxuICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IENhcmROb2RlT3B0aW9ucyApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgbGV0IGljb25Ob2RlOiBOb2RlO1xyXG4gICAgY29uc3QgaWNvbk9wdGlvbnMgPSB7XHJcbiAgICAgIGluY2x1ZGVEcmFnTGlzdGVuZXI6IGZhbHNlLFxyXG4gICAgICBkcmFnQm91bmRzUHJvcGVydHk6IHNjcmVlblZpZXcuc3ltYm9sQ2FyZEJvdW5kc1Byb3BlcnR5LFxyXG4gICAgICBob21lUG9zaXRpb246IFZlY3RvcjIuWkVST1xyXG4gICAgfTtcclxuXHJcbiAgICBpZiAoIG9wdGlvbnMuc3ltYm9sVHlwZSApIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMubnVtYmVyLCAnc3ltYm9sVHlwZSBhbmQgbnVtYmVyIGNhbm5vdCBib3RoIGJlIHByb3ZpZGVkJyApO1xyXG5cclxuICAgICAgaWNvbk5vZGUgPSBuZXcgU3ltYm9sQ2FyZE5vZGUoIGNvbWJpbmVPcHRpb25zPFN5bWJvbENhcmROb2RlT3B0aW9ucz4oIHtcclxuICAgICAgICBzeW1ib2xUeXBlOiBvcHRpb25zLnN5bWJvbFR5cGVcclxuICAgICAgfSwgaWNvbk9wdGlvbnMgKSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMubnVtYmVyLCAnc3ltYm9sVHlwZSBvciBudW1iZXIgbXVzdCBiZSBwcm92aWRlZCcgKTtcclxuXHJcbiAgICAgIGljb25Ob2RlID0gbmV3IE51bWJlckNhcmROb2RlKCBjb21iaW5lT3B0aW9uczxOdW1iZXJDYXJkTm9kZU9wdGlvbnM+KCB7XHJcbiAgICAgICAgbnVtYmVyOiBvcHRpb25zLm51bWJlciFcclxuICAgICAgfSwgaWNvbk9wdGlvbnMgKSApO1xyXG4gICAgfVxyXG5cclxuICAgIGljb25Ob2RlLmFkZElucHV0TGlzdGVuZXIoIERyYWdMaXN0ZW5lci5jcmVhdGVGb3J3YXJkaW5nTGlzdGVuZXIoICggZXZlbnQ6IFByZXNzTGlzdGVuZXJFdmVudCApID0+IHtcclxuXHJcbiAgICAgIGxldCBjYXJkTm9kZTogQ2FyZE5vZGU7XHJcbiAgICAgIGxldCBjb3VudFByb3BlcnR5OiBUUHJvcGVydHk8bnVtYmVyPjtcclxuXHJcbiAgICAgIGNvbnN0IGRyb3BMaXN0ZW5lciA9ICgpID0+IHtcclxuICAgICAgICBjb25zdCBob21lTm9kZUJvdW5kcyA9IG9wdGlvbnMuc3ltYm9sVHlwZSA/IHNjcmVlblZpZXcuc3ltYm9sQ2FyZENyZWF0b3JQYW5lbC5ib3VuZHMgOiBzY3JlZW5WaWV3Lm51bWJlckNhcmRDcmVhdG9yQ2Fyb3VzZWwuYm91bmRzO1xyXG5cclxuICAgICAgICBpZiAoIGNhcmROb2RlLmJvdW5kcy5pbnRlcnNlY3RzQm91bmRzKCBob21lTm9kZUJvdW5kcyApICkge1xyXG4gICAgICAgICAgY2FyZE5vZGUuaW5wdXRFbmFibGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBpY29uJ3Mgb3JpZ2luLlxyXG4gICAgICAgICAgY29uc3QgdHJhaWwgPSBzY3JlZW5WaWV3LmdldFVuaXF1ZUxlYWZUcmFpbFRvKCBpY29uTm9kZSApLnNsaWNlKCAxICk7XHJcbiAgICAgICAgICBjb25zdCBnbG9iYWxPcmlnaW4gPSB0cmFpbC5sb2NhbFRvR2xvYmFsUG9pbnQoIGljb25Ob2RlLmxvY2FsQm91bmRzLmNlbnRlciApO1xyXG5cclxuICAgICAgICAgIC8vIElmIHJldHVybmluZyB0byBhIGRpZmZlcmVudCBwYWdlLCBjbGFtcCBkZXN0aW5hdGlvbiBhdCBlZGdlLlxyXG4gICAgICAgICAgaWYgKCBnbG9iYWxPcmlnaW4ueCA8IGhvbWVOb2RlQm91bmRzLmxlZnQgKSB7XHJcbiAgICAgICAgICAgIGdsb2JhbE9yaWdpbi54ID0gaG9tZU5vZGVCb3VuZHMubGVmdDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYgKCBnbG9iYWxPcmlnaW4ueCA+IGhvbWVOb2RlQm91bmRzLnJpZ2h0ICkge1xyXG4gICAgICAgICAgICBnbG9iYWxPcmlnaW4ueCA9IGhvbWVOb2RlQm91bmRzLnJpZ2h0O1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGNvbnN0IGRpc3RhbmNlID0gY2FyZE5vZGUucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5kaXN0YW5jZSggZ2xvYmFsT3JpZ2luICk7XHJcbiAgICAgICAgICBjb25zdCBkdXJhdGlvbiA9XHJcbiAgICAgICAgICAgIENvdW50aW5nQ29tbW9uQ29uc3RhbnRzLkFOSU1BVElPTl9USU1FX1JBTkdFLmNvbnN0cmFpblZhbHVlKCBkaXN0YW5jZSAvIENvdW50aW5nQ29tbW9uQ29uc3RhbnRzLkFOSU1BVElPTl9TUEVFRCApO1xyXG5cclxuICAgICAgICAgIGNhcmROb2RlLmFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oIHtcclxuICAgICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uLFxyXG4gICAgICAgICAgICB0YXJnZXRzOiBbIHtcclxuICAgICAgICAgICAgICBwcm9wZXJ0eTogY2FyZE5vZGUucG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgICAgICAgICBlYXNpbmc6IEVhc2luZy5DVUJJQ19JTl9PVVQsXHJcbiAgICAgICAgICAgICAgdG86IGdsb2JhbE9yaWdpblxyXG4gICAgICAgICAgICB9IF1cclxuICAgICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgICBjYXJkTm9kZS5hbmltYXRpb24uZmluaXNoRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICAgICAgICBzY3JlZW5WaWV3LnBpZWNlTGF5ZXIucmVtb3ZlQ2hpbGQoIGNhcmROb2RlICk7XHJcbiAgICAgICAgICAgIGNhcmROb2RlLmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgY291bnRQcm9wZXJ0eSEudmFsdWUtLTtcclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICAgIGNhcmROb2RlLmFuaW1hdGlvbi5zdGFydCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIGNvbnN0IGNhcmROb2RlT3B0aW9ucyA9IHtcclxuICAgICAgICBkcm9wTGlzdGVuZXI6IGRyb3BMaXN0ZW5lclxyXG4gICAgICB9O1xyXG5cclxuICAgICAgaWYgKCBvcHRpb25zLnN5bWJvbFR5cGUgKSB7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMubnVtYmVyLCAnc3ltYm9sVHlwZSBhbmQgbnVtYmVyIGNhbm5vdCBib3RoIGJlIHByb3ZpZGVkJyApO1xyXG5cclxuICAgICAgICBjb3VudFByb3BlcnR5ID0gY29udGVudFRvQ291bnRQcm9wZXJ0eU1hcC5nZXQoIG9wdGlvbnMuc3ltYm9sVHlwZSApITtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjb3VudFByb3BlcnR5LCAnY291bnRQcm9wZXJ0eSBmb3IgaW5lcXVhbGl0eSBzeW1ib2wgbm90IGZvdW5kOiAnICsgb3B0aW9ucy5zeW1ib2xUeXBlICk7XHJcblxyXG4gICAgICAgIGNhcmROb2RlID0gbmV3IFN5bWJvbENhcmROb2RlKCBjb21iaW5lT3B0aW9uczxTeW1ib2xDYXJkTm9kZU9wdGlvbnM+KCB7XHJcbiAgICAgICAgICBzeW1ib2xUeXBlOiBvcHRpb25zLnN5bWJvbFR5cGUsXHJcbiAgICAgICAgICBkcmFnQm91bmRzUHJvcGVydHk6IHNjcmVlblZpZXcuc3ltYm9sQ2FyZEJvdW5kc1Byb3BlcnR5XHJcbiAgICAgICAgfSwgY2FyZE5vZGVPcHRpb25zICkgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLm51bWJlciwgJ3N5bWJvbFR5cGUgb3IgbnVtYmVyIG11c3QgYmUgcHJvdmlkZWQnICk7XHJcblxyXG4gICAgICAgIGNvdW50UHJvcGVydHkgPSBjb250ZW50VG9Db3VudFByb3BlcnR5TWFwLmdldCggb3B0aW9ucy5udW1iZXIhICkhO1xyXG5cclxuICAgICAgICBjYXJkTm9kZSA9IG5ldyBOdW1iZXJDYXJkTm9kZSggY29tYmluZU9wdGlvbnM8TnVtYmVyQ2FyZE5vZGVPcHRpb25zPigge1xyXG4gICAgICAgICAgbnVtYmVyOiBvcHRpb25zLm51bWJlciEsXHJcbiAgICAgICAgICBkcmFnQm91bmRzUHJvcGVydHk6IHNjcmVlblZpZXcubnVtYmVyQ2FyZEJvdW5kc1Byb3BlcnR5XHJcbiAgICAgICAgfSwgY2FyZE5vZGVPcHRpb25zICkgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY291bnRQcm9wZXJ0eS52YWx1ZSsrO1xyXG5cclxuICAgICAgc2NyZWVuVmlldy5waWVjZUxheWVyLmFkZENoaWxkKCBjYXJkTm9kZSApO1xyXG4gICAgICBjYXJkTm9kZS5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gc2NyZWVuVmlldy5nbG9iYWxUb0xvY2FsUG9pbnQoIGV2ZW50LnBvaW50ZXIucG9pbnQgKS5taW51cyggY2FyZE5vZGUubG9jYWxCb3VuZHMuY2VudGVyQm90dG9tLm1pbnVzWFkoIDAsIDE1ICkgKTtcclxuICAgICAgY2FyZE5vZGUuZHJhZ0xpc3RlbmVyIS5wcmVzcyggZXZlbnQsIGNhcmROb2RlICk7XHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBpY29uTm9kZSApO1xyXG4gIH1cclxufVxyXG5cclxubnVtYmVyU3VpdGVDb21tb24ucmVnaXN0ZXIoICdDYXJkQ3JlYXRvck5vZGUnLCBDYXJkQ3JlYXRvck5vZGUgKTtcclxuZXhwb3J0IGRl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