// Copyright 2022-2023, University of Colorado Boulder

/**
 * Panel for creating symbol cards.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import { Rectangle, VBox } from '../../../../scenery/js/imports.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import NumberSuiteCommonPanel from '../../common/view/NumberSuiteCommonPanel.js';
import SymbolCardNode from './SymbolCardNode.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import CardCreatorNode from './CardCreatorNode.js';
// constants
const MAX_SYMBOL_PIECE_COUNT = 10;
const SPACING = 10;
class SymbolCardCreatorPanel extends NumberSuiteCommonPanel {
  // removes and disposes all types of symbol nodes

  constructor(model, screenView, symbolTypes) {
    const cardsHeight = (SymbolCardNode.WIDTH + SPACING) * symbolTypes.length;
    const yMargin = symbolTypes.length > 3 ? SPACING * 2 : SPACING;
    const creatorNodeBackground = new Rectangle(0, 0, SymbolCardNode.WIDTH, cardsHeight + yMargin);
    const symbolTypeToCountPropertyMap = new Map();
    const symbolTypeToCreatorNodeMap = new Map();
    symbolTypes.forEach(symbolType => {
      // Property to count the number of each type of symbol node
      const countProperty = new NumberProperty(0);
      symbolTypeToCountPropertyMap.set(symbolType, countProperty);

      // make a creator node for the SymbolNode type
      const creatorNode = new CardCreatorNode(screenView, symbolTypeToCountPropertyMap, {
        symbolType: symbolType
      });
      symbolTypeToCreatorNodeMap.set(symbolType, creatorNode);
    });
    const iconNodes = new VBox({
      children: [...Array.from(symbolTypeToCreatorNodeMap.values())],
      spacing: SPACING,
      resize: false // don't shift contents when one of the creator nodes is hidden
    });

    iconNodes.center = creatorNodeBackground.center;
    creatorNodeBackground.addChild(iconNodes);
    super(creatorNodeBackground, {
      xMargin: 10
    });
    this.screenView = screenView;
    this.symbolTypeToCountPropertyMap = symbolTypeToCountPropertyMap;

    // make a creator node invisible if the max number for its type has been created
    symbolTypeToCountPropertyMap.forEach((countProperty, symbolType) => {
      assert && assert(symbolTypeToCreatorNodeMap.has(symbolType), `Node not found for symbolType: ${symbolType}`);
      countProperty.link(count => {
        symbolTypeToCreatorNodeMap.get(symbolType).visible = count < MAX_SYMBOL_PIECE_COUNT;
      });
    });
    this.clearSymbolNodes = () => {
      const allSymbolNodes = this.getAllSymbolNodes();
      allSymbolNodes.forEach(symbolNode => {
        screenView.pieceLayer.removeChild(symbolNode);
        symbolNode.dispose();
      });
    };
  }

  /**
   * Clears all cards and resets their counts.
   */
  reset() {
    this.clearSymbolNodes();
    this.symbolTypeToCountPropertyMap.forEach(countProperty => {
      countProperty.reset();
    });
  }

  /**
   * Returns all existing cards in the countingArea.
   */
  getAllSymbolNodes() {
    const allSymbolNodes = _.filter(this.screenView.pieceLayer.children, child => child instanceof SymbolCardNode);
    return allSymbolNodes;
  }
}
numberSuiteCommon.register('SymbolCardCreatorPanel', SymbolCardCreatorPanel);
export default SymbolCardCreatorPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWN0YW5nbGUiLCJWQm94IiwibnVtYmVyU3VpdGVDb21tb24iLCJOdW1iZXJTdWl0ZUNvbW1vblBhbmVsIiwiU3ltYm9sQ2FyZE5vZGUiLCJOdW1iZXJQcm9wZXJ0eSIsIkNhcmRDcmVhdG9yTm9kZSIsIk1BWF9TWU1CT0xfUElFQ0VfQ09VTlQiLCJTUEFDSU5HIiwiU3ltYm9sQ2FyZENyZWF0b3JQYW5lbCIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJzY3JlZW5WaWV3Iiwic3ltYm9sVHlwZXMiLCJjYXJkc0hlaWdodCIsIldJRFRIIiwibGVuZ3RoIiwieU1hcmdpbiIsImNyZWF0b3JOb2RlQmFja2dyb3VuZCIsInN5bWJvbFR5cGVUb0NvdW50UHJvcGVydHlNYXAiLCJNYXAiLCJzeW1ib2xUeXBlVG9DcmVhdG9yTm9kZU1hcCIsImZvckVhY2giLCJzeW1ib2xUeXBlIiwiY291bnRQcm9wZXJ0eSIsInNldCIsImNyZWF0b3JOb2RlIiwiaWNvbk5vZGVzIiwiY2hpbGRyZW4iLCJBcnJheSIsImZyb20iLCJ2YWx1ZXMiLCJzcGFjaW5nIiwicmVzaXplIiwiY2VudGVyIiwiYWRkQ2hpbGQiLCJ4TWFyZ2luIiwiYXNzZXJ0IiwiaGFzIiwibGluayIsImNvdW50IiwiZ2V0IiwidmlzaWJsZSIsImNsZWFyU3ltYm9sTm9kZXMiLCJhbGxTeW1ib2xOb2RlcyIsImdldEFsbFN5bWJvbE5vZGVzIiwic3ltYm9sTm9kZSIsInBpZWNlTGF5ZXIiLCJyZW1vdmVDaGlsZCIsImRpc3Bvc2UiLCJyZXNldCIsIl8iLCJmaWx0ZXIiLCJjaGlsZCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU3ltYm9sQ2FyZENyZWF0b3JQYW5lbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBQYW5lbCBmb3IgY3JlYXRpbmcgc3ltYm9sIGNhcmRzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgUmVjdGFuZ2xlLCBWQm94LCBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG51bWJlclN1aXRlQ29tbW9uIGZyb20gJy4uLy4uL251bWJlclN1aXRlQ29tbW9uLmpzJztcclxuaW1wb3J0IExhYk1vZGVsIGZyb20gJy4uL21vZGVsL0xhYk1vZGVsLmpzJztcclxuaW1wb3J0IExhYlNjcmVlblZpZXcgZnJvbSAnLi9MYWJTY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IE51bWJlclN1aXRlQ29tbW9uUGFuZWwgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvTnVtYmVyU3VpdGVDb21tb25QYW5lbC5qcyc7XHJcbmltcG9ydCBTeW1ib2xDYXJkTm9kZSBmcm9tICcuL1N5bWJvbENhcmROb2RlLmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQ2FyZENyZWF0b3JOb2RlIGZyb20gJy4vQ2FyZENyZWF0b3JOb2RlLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyU3VpdGVDb21tb25QcmVmZXJlbmNlcyBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvTnVtYmVyU3VpdGVDb21tb25QcmVmZXJlbmNlcy5qcyc7XHJcbmltcG9ydCBTeW1ib2xUeXBlIGZyb20gJy4vU3ltYm9sVHlwZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTUFYX1NZTUJPTF9QSUVDRV9DT1VOVCA9IDEwO1xyXG5jb25zdCBTUEFDSU5HID0gMTA7XHJcblxyXG5jbGFzcyBTeW1ib2xDYXJkQ3JlYXRvclBhbmVsIGV4dGVuZHMgTnVtYmVyU3VpdGVDb21tb25QYW5lbCB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgc3ltYm9sVHlwZVRvQ291bnRQcm9wZXJ0eU1hcDogTWFwPFN5bWJvbFR5cGUsIFByb3BlcnR5PG51bWJlcj4+O1xyXG5cclxuICAvLyByZW1vdmVzIGFuZCBkaXNwb3NlcyBhbGwgdHlwZXMgb2Ygc3ltYm9sIG5vZGVzXHJcbiAgcHJpdmF0ZSByZWFkb25seSBjbGVhclN5bWJvbE5vZGVzOiAoKSA9PiB2b2lkO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgc2NyZWVuVmlldzogTGFiU2NyZWVuVmlldzxOdW1iZXJTdWl0ZUNvbW1vblByZWZlcmVuY2VzPjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbDogTGFiTW9kZWwsIHNjcmVlblZpZXc6IExhYlNjcmVlblZpZXc8TnVtYmVyU3VpdGVDb21tb25QcmVmZXJlbmNlcz4sIHN5bWJvbFR5cGVzOiBTeW1ib2xUeXBlW10gKSB7XHJcblxyXG4gICAgY29uc3QgY2FyZHNIZWlnaHQgPSAoIFN5bWJvbENhcmROb2RlLldJRFRIICsgU1BBQ0lORyApICogc3ltYm9sVHlwZXMubGVuZ3RoO1xyXG4gICAgY29uc3QgeU1hcmdpbiA9IHN5bWJvbFR5cGVzLmxlbmd0aCA+IDMgPyBTUEFDSU5HICogMiA6IFNQQUNJTkc7XHJcbiAgICBjb25zdCBjcmVhdG9yTm9kZUJhY2tncm91bmQgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBTeW1ib2xDYXJkTm9kZS5XSURUSCwgY2FyZHNIZWlnaHQgKyB5TWFyZ2luICk7XHJcblxyXG4gICAgY29uc3Qgc3ltYm9sVHlwZVRvQ291bnRQcm9wZXJ0eU1hcCA9IG5ldyBNYXA8U3ltYm9sVHlwZSwgUHJvcGVydHk8bnVtYmVyPj4oKTtcclxuICAgIGNvbnN0IHN5bWJvbFR5cGVUb0NyZWF0b3JOb2RlTWFwID0gbmV3IE1hcDxTeW1ib2xUeXBlLCBOb2RlPigpO1xyXG5cclxuICAgIHN5bWJvbFR5cGVzLmZvckVhY2goIHN5bWJvbFR5cGUgPT4ge1xyXG5cclxuICAgICAgLy8gUHJvcGVydHkgdG8gY291bnQgdGhlIG51bWJlciBvZiBlYWNoIHR5cGUgb2Ygc3ltYm9sIG5vZGVcclxuICAgICAgY29uc3QgY291bnRQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApO1xyXG4gICAgICBzeW1ib2xUeXBlVG9Db3VudFByb3BlcnR5TWFwLnNldCggc3ltYm9sVHlwZSwgY291bnRQcm9wZXJ0eSApO1xyXG5cclxuICAgICAgLy8gbWFrZSBhIGNyZWF0b3Igbm9kZSBmb3IgdGhlIFN5bWJvbE5vZGUgdHlwZVxyXG4gICAgICBjb25zdCBjcmVhdG9yTm9kZSA9IG5ldyBDYXJkQ3JlYXRvck5vZGUoIHNjcmVlblZpZXcsIHN5bWJvbFR5cGVUb0NvdW50UHJvcGVydHlNYXAsIHtcclxuICAgICAgICBzeW1ib2xUeXBlOiBzeW1ib2xUeXBlXHJcbiAgICAgIH0gKTtcclxuICAgICAgc3ltYm9sVHlwZVRvQ3JlYXRvck5vZGVNYXAuc2V0KCBzeW1ib2xUeXBlLCBjcmVhdG9yTm9kZSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGljb25Ob2RlcyA9IG5ldyBWQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIC4uLkFycmF5LmZyb20oIHN5bWJvbFR5cGVUb0NyZWF0b3JOb2RlTWFwLnZhbHVlcygpICkgXSxcclxuICAgICAgc3BhY2luZzogU1BBQ0lORyxcclxuICAgICAgcmVzaXplOiBmYWxzZSAvLyBkb24ndCBzaGlmdCBjb250ZW50cyB3aGVuIG9uZSBvZiB0aGUgY3JlYXRvciBub2RlcyBpcyBoaWRkZW5cclxuICAgIH0gKTtcclxuXHJcbiAgICBpY29uTm9kZXMuY2VudGVyID0gY3JlYXRvck5vZGVCYWNrZ3JvdW5kLmNlbnRlcjtcclxuICAgIGNyZWF0b3JOb2RlQmFja2dyb3VuZC5hZGRDaGlsZCggaWNvbk5vZGVzICk7XHJcblxyXG4gICAgc3VwZXIoIGNyZWF0b3JOb2RlQmFja2dyb3VuZCwge1xyXG4gICAgICB4TWFyZ2luOiAxMFxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuc2NyZWVuVmlldyA9IHNjcmVlblZpZXc7XHJcbiAgICB0aGlzLnN5bWJvbFR5cGVUb0NvdW50UHJvcGVydHlNYXAgPSBzeW1ib2xUeXBlVG9Db3VudFByb3BlcnR5TWFwO1xyXG5cclxuICAgIC8vIG1ha2UgYSBjcmVhdG9yIG5vZGUgaW52aXNpYmxlIGlmIHRoZSBtYXggbnVtYmVyIGZvciBpdHMgdHlwZSBoYXMgYmVlbiBjcmVhdGVkXHJcbiAgICBzeW1ib2xUeXBlVG9Db3VudFByb3BlcnR5TWFwLmZvckVhY2goICggY291bnRQcm9wZXJ0eSwgc3ltYm9sVHlwZSApID0+IHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggc3ltYm9sVHlwZVRvQ3JlYXRvck5vZGVNYXAuaGFzKCBzeW1ib2xUeXBlICksIGBOb2RlIG5vdCBmb3VuZCBmb3Igc3ltYm9sVHlwZTogJHtzeW1ib2xUeXBlfWAgKTtcclxuICAgICAgY291bnRQcm9wZXJ0eS5saW5rKCBjb3VudCA9PiB7XHJcbiAgICAgICAgc3ltYm9sVHlwZVRvQ3JlYXRvck5vZGVNYXAuZ2V0KCBzeW1ib2xUeXBlICkhLnZpc2libGUgPSBjb3VudCA8IE1BWF9TWU1CT0xfUElFQ0VfQ09VTlQ7XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmNsZWFyU3ltYm9sTm9kZXMgPSAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGFsbFN5bWJvbE5vZGVzID0gdGhpcy5nZXRBbGxTeW1ib2xOb2RlcygpO1xyXG4gICAgICBhbGxTeW1ib2xOb2Rlcy5mb3JFYWNoKCBzeW1ib2xOb2RlID0+IHtcclxuICAgICAgICBzY3JlZW5WaWV3LnBpZWNlTGF5ZXIucmVtb3ZlQ2hpbGQoIHN5bWJvbE5vZGUgKTtcclxuICAgICAgICBzeW1ib2xOb2RlLmRpc3Bvc2UoKTtcclxuICAgICAgfSApO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFycyBhbGwgY2FyZHMgYW5kIHJlc2V0cyB0aGVpciBjb3VudHMuXHJcbiAgICovXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5jbGVhclN5bWJvbE5vZGVzKCk7XHJcbiAgICB0aGlzLnN5bWJvbFR5cGVUb0NvdW50UHJvcGVydHlNYXAuZm9yRWFjaCggY291bnRQcm9wZXJ0eSA9PiB7XHJcbiAgICAgIGNvdW50UHJvcGVydHkucmVzZXQoKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYWxsIGV4aXN0aW5nIGNhcmRzIGluIHRoZSBjb3VudGluZ0FyZWEuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEFsbFN5bWJvbE5vZGVzKCk6IFN5bWJvbENhcmROb2RlW10ge1xyXG4gICAgY29uc3QgYWxsU3ltYm9sTm9kZXMgPSBfLmZpbHRlciggdGhpcy5zY3JlZW5WaWV3LnBpZWNlTGF5ZXIuY2hpbGRyZW4sXHJcbiAgICAgIGNoaWxkID0+IGNoaWxkIGluc3RhbmNlb2YgU3ltYm9sQ2FyZE5vZGUgKSBhcyBTeW1ib2xDYXJkTm9kZVtdO1xyXG4gICAgcmV0dXJuIGFsbFN5bWJvbE5vZGVzO1xyXG4gIH1cclxufVxyXG5cclxubnVtYmVyU3VpdGVDb21tb24ucmVnaXN0ZXIoICdTeW1ib2xDYXJkQ3JlYXRvclBhbmVsJywgU3ltYm9sQ2FyZENyZWF0b3JQYW5lbCApO1xyXG5leHBvcnQgZGVmYXVsdCBTeW1ib2xDYXJkQ3JlYXRvclBhbmVsO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsU0FBUyxFQUFFQyxJQUFJLFFBQWMsbUNBQW1DO0FBQ3pFLE9BQU9DLGlCQUFpQixNQUFNLDRCQUE0QjtBQUcxRCxPQUFPQyxzQkFBc0IsTUFBTSw2Q0FBNkM7QUFDaEYsT0FBT0MsY0FBYyxNQUFNLHFCQUFxQjtBQUNoRCxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLGVB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