// Copyright 2013-2022, University of Colorado Boulder

/**
 * Combination of a periodic table and an enlarged, dynamic, element symbol
 * sitting above the table.
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import PeriodicTableNode from '../../../../shred/js/view/PeriodicTableNode.js';
import buildAnAtom from '../../buildAnAtom.js';

// constants
const SYMBOL_WIDTH_PROPORTION = 0.2;
const SYMBOL_ASPECT_RATIO = 1.0; // Width/height.

class PeriodicTableAndSymbol extends Node {
  /**
   * @param {NumberAtom} numberAtom
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(numberAtom, tandem, options) {
    options.tandem = tandem;
    super();

    // Create and add the periodic table.
    const periodicTable = new PeriodicTableNode(numberAtom, {
      interactiveMax: 0,
      disabledCellColor: 'white',
      tandem: tandem.createTandem('periodicTable')
    });
    this.addChild(periodicTable);

    // Create and add the symbol, which only shows a bigger version of the selected element symbol.
    const symbolRectangle = new Rectangle(0, 0, periodicTable.width * SYMBOL_WIDTH_PROPORTION, periodicTable.width * SYMBOL_WIDTH_PROPORTION / SYMBOL_ASPECT_RATIO, {
      fill: 'white',
      stroke: 'black',
      lineWidth: 2,
      tandem: tandem.createTandem('symbolRectangle')
    });
    this.addChild(symbolRectangle);

    // Add the text that represents the chosen element.
    numberAtom.protonCountProperty.link(protonCount => {
      symbolRectangle.removeAllChildren();
      const symbolText = new Text(AtomIdentifier.getSymbol(protonCount), {
        font: new PhetFont({
          size: 48,
          weight: 'bold'
        })
      });
      symbolText.scale(Math.min(Math.min(symbolRectangle.width * 0.8 / symbolText.width, symbolRectangle.height * 0.8 / symbolText.height), 1));
      symbolText.center = new Vector2(symbolRectangle.width / 2, symbolRectangle.height / 2);
      symbolRectangle.addChild(symbolText);
    });

    // Do the layout.  This positions the symbol to fit into the top portion
    // of the table.  The periodic table is 18 cells wide, and this needs
    // to be centered over the 8th column to be in the right place.
    symbolRectangle.centerX = 7.5 / 18 * periodicTable.width;
    symbolRectangle.top = 0;
    periodicTable.top = symbolRectangle.bottom - periodicTable.height / 7 * 2.5;
    periodicTable.left = 0;
    this.mutate(options);
  }
}
buildAnAtom.register('PeriodicTableAndSymbol', PeriodicTableAndSymbol);
export default PeriodicTableAndSymbol;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiUGhldEZvbnQiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiVGV4dCIsIkF0b21JZGVudGlmaWVyIiwiUGVyaW9kaWNUYWJsZU5vZGUiLCJidWlsZEFuQXRvbSIsIlNZTUJPTF9XSURUSF9QUk9QT1JUSU9OIiwiU1lNQk9MX0FTUEVDVF9SQVRJTyIsIlBlcmlvZGljVGFibGVBbmRTeW1ib2wiLCJjb25zdHJ1Y3RvciIsIm51bWJlckF0b20iLCJ0YW5kZW0iLCJvcHRpb25zIiwicGVyaW9kaWNUYWJsZSIsImludGVyYWN0aXZlTWF4IiwiZGlzYWJsZWRDZWxsQ29sb3IiLCJjcmVhdGVUYW5kZW0iLCJhZGRDaGlsZCIsInN5bWJvbFJlY3RhbmdsZSIsIndpZHRoIiwiZmlsbCIsInN0cm9rZSIsImxpbmVXaWR0aCIsInByb3RvbkNvdW50UHJvcGVydHkiLCJsaW5rIiwicHJvdG9uQ291bnQiLCJyZW1vdmVBbGxDaGlsZHJlbiIsInN5bWJvbFRleHQiLCJnZXRTeW1ib2wiLCJmb250Iiwic2l6ZSIsIndlaWdodCIsInNjYWxlIiwiTWF0aCIsIm1pbiIsImhlaWdodCIsImNlbnRlciIsImNlbnRlclgiLCJ0b3AiLCJib3R0b20iLCJsZWZ0IiwibXV0YXRlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQZXJpb2RpY1RhYmxlQW5kU3ltYm9sLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENvbWJpbmF0aW9uIG9mIGEgcGVyaW9kaWMgdGFibGUgYW5kIGFuIGVubGFyZ2VkLCBkeW5hbWljLCBlbGVtZW50IHN5bWJvbFxyXG4gKiBzaXR0aW5nIGFib3ZlIHRoZSB0YWJsZS5cclxuICovXHJcblxyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBSZWN0YW5nbGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQXRvbUlkZW50aWZpZXIgZnJvbSAnLi4vLi4vLi4vLi4vc2hyZWQvanMvQXRvbUlkZW50aWZpZXIuanMnO1xyXG5pbXBvcnQgUGVyaW9kaWNUYWJsZU5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2hyZWQvanMvdmlldy9QZXJpb2RpY1RhYmxlTm9kZS5qcyc7XHJcbmltcG9ydCBidWlsZEFuQXRvbSBmcm9tICcuLi8uLi9idWlsZEFuQXRvbS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgU1lNQk9MX1dJRFRIX1BST1BPUlRJT04gPSAwLjI7XHJcbmNvbnN0IFNZTUJPTF9BU1BFQ1RfUkFUSU8gPSAxLjA7IC8vIFdpZHRoL2hlaWdodC5cclxuXHJcbmNsYXNzIFBlcmlvZGljVGFibGVBbmRTeW1ib2wgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtOdW1iZXJBdG9tfSBudW1iZXJBdG9tXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbnVtYmVyQXRvbSwgdGFuZGVtLCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMudGFuZGVtID0gdGFuZGVtO1xyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYW5kIGFkZCB0aGUgcGVyaW9kaWMgdGFibGUuXHJcbiAgICBjb25zdCBwZXJpb2RpY1RhYmxlID0gbmV3IFBlcmlvZGljVGFibGVOb2RlKCBudW1iZXJBdG9tLCB7XHJcbiAgICAgIGludGVyYWN0aXZlTWF4OiAwLFxyXG4gICAgICBkaXNhYmxlZENlbGxDb2xvcjogJ3doaXRlJyxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncGVyaW9kaWNUYWJsZScgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcGVyaW9kaWNUYWJsZSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhbmQgYWRkIHRoZSBzeW1ib2wsIHdoaWNoIG9ubHkgc2hvd3MgYSBiaWdnZXIgdmVyc2lvbiBvZiB0aGUgc2VsZWN0ZWQgZWxlbWVudCBzeW1ib2wuXHJcbiAgICBjb25zdCBzeW1ib2xSZWN0YW5nbGUgPSBuZXcgUmVjdGFuZ2xlKFxyXG4gICAgICAwLFxyXG4gICAgICAwLFxyXG4gICAgICBwZXJpb2RpY1RhYmxlLndpZHRoICogU1lNQk9MX1dJRFRIX1BST1BPUlRJT04sXHJcbiAgICAgIHBlcmlvZGljVGFibGUud2lkdGggKiBTWU1CT0xfV0lEVEhfUFJPUE9SVElPTiAvIFNZTUJPTF9BU1BFQ1RfUkFUSU8sXHJcbiAgICAgIHtcclxuICAgICAgICBmaWxsOiAnd2hpdGUnLFxyXG4gICAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgICBsaW5lV2lkdGg6IDIsXHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3ltYm9sUmVjdGFuZ2xlJyApXHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBzeW1ib2xSZWN0YW5nbGUgKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIHRleHQgdGhhdCByZXByZXNlbnRzIHRoZSBjaG9zZW4gZWxlbWVudC5cclxuICAgIG51bWJlckF0b20ucHJvdG9uQ291bnRQcm9wZXJ0eS5saW5rKCBwcm90b25Db3VudCA9PiB7XHJcbiAgICAgIHN5bWJvbFJlY3RhbmdsZS5yZW1vdmVBbGxDaGlsZHJlbigpO1xyXG4gICAgICBjb25zdCBzeW1ib2xUZXh0ID0gbmV3IFRleHQoIEF0b21JZGVudGlmaWVyLmdldFN5bWJvbCggcHJvdG9uQ291bnQgKSwge1xyXG4gICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggeyBzaXplOiA0OCwgd2VpZ2h0OiAnYm9sZCcgfSApXHJcbiAgICAgIH0gKTtcclxuICAgICAgc3ltYm9sVGV4dC5zY2FsZSggTWF0aC5taW4oIE1hdGgubWluKCBzeW1ib2xSZWN0YW5nbGUud2lkdGggKiAwLjggLyBzeW1ib2xUZXh0LndpZHRoLCBzeW1ib2xSZWN0YW5nbGUuaGVpZ2h0ICogMC44IC8gc3ltYm9sVGV4dC5oZWlnaHQgKSwgMSApICk7XHJcbiAgICAgIHN5bWJvbFRleHQuY2VudGVyID0gbmV3IFZlY3RvcjIoIHN5bWJvbFJlY3RhbmdsZS53aWR0aCAvIDIsIHN5bWJvbFJlY3RhbmdsZS5oZWlnaHQgLyAyICk7XHJcbiAgICAgIHN5bWJvbFJlY3RhbmdsZS5hZGRDaGlsZCggc3ltYm9sVGV4dCApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIERvIHRoZSBsYXlvdXQuICBUaGlzIHBvc2l0aW9ucyB0aGUgc3ltYm9sIHRvIGZpdCBpbnRvIHRoZSB0b3AgcG9ydGlvblxyXG4gICAgLy8gb2YgdGhlIHRhYmxlLiAgVGhlIHBlcmlvZGljIHRhYmxlIGlzIDE4IGNlbGxzIHdpZGUsIGFuZCB0aGlzIG5lZWRzXHJcbiAgICAvLyB0byBiZSBjZW50ZXJlZCBvdmVyIHRoZSA4dGggY29sdW1uIHRvIGJlIGluIHRoZSByaWdodCBwbGFjZS5cclxuICAgIHN5bWJvbFJlY3RhbmdsZS5jZW50ZXJYID0gKCA3LjUgLyAxOCApICogcGVyaW9kaWNUYWJsZS53aWR0aDtcclxuICAgIHN5bWJvbFJlY3RhbmdsZS50b3AgPSAwO1xyXG4gICAgcGVyaW9kaWNUYWJsZS50b3AgPSBzeW1ib2xSZWN0YW5nbGUuYm90dG9tIC0gKCBwZXJpb2RpY1RhYmxlLmhlaWdodCAvIDcgKiAyLjUgKTtcclxuICAgIHBlcmlvZGljVGFibGUubGVmdCA9IDA7XHJcblxyXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmJ1aWxkQW5BdG9tLnJlZ2lzdGVyKCAnUGVyaW9kaWNUYWJsZUFuZFN5bWJvbCcsIFBlcmlvZGljVGFibGVBbmRTeW1ib2wgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBlcmlvZGljVGFibGVBbmRTeW1ib2w7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDekUsT0FBT0MsY0FBYyxNQUFNLHdDQUF3QztBQUNuRSxPQUFPQyxpQkFBaUIsTUFBTSxnREFBZ0Q7QUFDOUUsT0FBT0MsV0FBVyxNQUFNLHNCQUFzQjs7QUFFOUM7QUFDQSxNQUFNQyx1QkFBdUIsR0FBRyxHQUFHO0FBQ25DLE1BQU1DLG1CQUFtQixHQUFHLEdBQUcsQ0FBQyxDQUFDOztBQUVqQyxNQUFNQyxzQkFBc0IsU0FBU1IsSUFBSSxDQUFDO0VBRXhDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRVMsV0FBV0EsQ0FBRUMsVUFBVSxFQUFFQyxNQUFNLEVBQUVDLE9BQU8sRUFBRztJQUV6Q0EsT0FBTyxDQUFDRCxNQUFNLEdBQUdBLE1BQU07SUFDdkIsS0FBSyxDQUFDLENBQUM7O0lBRVA7SUFDQSxNQUFNRSxhQUFhLEdBQUcsSUFBSVQsaUJBQWlCLENBQUVNLFVBQVUsRUFBRTtNQUN2REksY0FBYyxFQUFFLENBQUM7TUFDakJDLGlCQUFpQixFQUFFLE9BQU87TUFDMUJKLE1BQU0sRUFBRUEsTUFBTSxDQUFDSyxZQUFZLENBQUUsZUFBZ0I7SUFDL0MsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDQyxRQUFRLENBQUVKLGFBQWMsQ0FBQzs7SUFFOUI7SUFDQSxNQUFNSyxlQUFlLEdBQUcsSUFBSWpCLFNBQVMsQ0FDbkMsQ0FBQyxFQUNELENBQUMsRUFDRFksYUFBYSxDQUFDTSxLQUFLLEdBQUdiLHVCQUF1QixFQUM3Q08sYUFBYSxDQUFDTSxLQUFLLEdBQUdiLHVCQUF1QixHQUFHQyxtQkFBbUIsRUFDbkU7TUFDRWEsSUFBSSxFQUFFLE9BQU87TUFDYkMsTUFBTSxFQUFFLE9BQU87TUFDZkMsU0FBUyxFQUFFLENBQUM7TUFDWlgsTUFBTSxFQUFFQSxNQUFNLENBQUNLLFlBQVksQ0FBRSxpQkFBa0I7SUFDakQsQ0FDRixDQUFDO0lBQ0QsSUFBSSxDQUFDQyxRQUFRLENBQUVDLGVBQWdCLENBQUM7O0lBRWhDO0lBQ0FSLFVBQVUsQ0FBQ2EsbUJBQW1CLENBQUNDLElBQUksQ0FBRUMsV0FBVyxJQUFJO01BQ2xEUCxlQUFlLENBQUNRLGlCQUFpQixDQUFDLENBQUM7TUFDbkMsTUFBTUMsVUFBVSxHQUFHLElBQUl6QixJQUFJLENBQUVDLGNBQWMsQ0FBQ3lCLFNBQVMsQ0FBRUgsV0FBWSxDQUFDLEVBQUU7UUFDcEVJLElBQUksRUFBRSxJQUFJOUIsUUFBUSxDQUFFO1VBQUUrQixJQUFJLEVBQUUsRUFBRTtVQUFFQyxNQUFNLEVBQUU7UUFBTyxDQUFFO01BQ25ELENBQUUsQ0FBQztNQUNISixVQUFVLENBQUNLLEtBQUssQ0FBRUMsSUFBSSxDQUFDQyxHQUFHLENBQUVELElBQUksQ0FBQ0MsR0FBRyxDQUFFaEIsZUFBZSxDQUFDQyxLQUFLLEdBQUcsR0FBRyxHQUFHUSxVQUFVLENBQUNSLEtBQUssRUFBRUQsZUFBZSxDQUFDaUIsTUFBTSxHQUFHLEdBQUcsR0FBR1IsVUFBVSxDQUFDUSxNQUFPLENBQUMsRUFBRSxDQUFFLENBQUUsQ0FBQztNQUMvSVIsVUFBVSxDQUFDUyxNQUFNLEdBQUcsSUFBSXRDLE9BQU8sQ0FBRW9CLGVBQWUsQ0FBQ0MsS0FBSyxHQUFHLENBQUMsRUFBRUQsZUFBZSxDQUFDaUIsTUFBTSxHQUFHLENBQUUsQ0FBQztNQUN4RmpCLGVBQWUsQ0FBQ0QsUUFBUSxDQUFFVSxVQUFXLENBQUM7SUFDeEMsQ0FBRSxDQUFDOztJQUVIO0lBQ0E7SUFDQTtJQUNBVCxlQUFlLENBQUNtQixPQUFPLEdBQUssR0FBRyxHQUFHLEVBQUUsR0FBS3hCLGFBQWEsQ0FBQ00sS0FBSztJQUM1REQsZUFBZSxDQUFDb0IsR0FBRyxHQUFHLENBQUM7SUFDdkJ6QixhQUFhLENBQUN5QixHQUFHLEdBQUdwQixlQUFlLENBQUNxQixNQUFNLEdBQUsxQixhQUFhLENBQUNzQixNQUFNLEdBQUcsQ0FBQyxHQUFHLEdBQUs7SUFDL0V0QixhQUFhLENBQUMyQixJQUFJLEdBQUcsQ0FBQztJQUV0QixJQUFJLENBQUNDLE1BQU0sQ0FBRTdCLE9BQVEsQ0FBQztFQUN4QjtBQUNGO0FBRUFQLFdBQVcsQ0FBQ3FDLFFBQVEsQ0FBRSx3QkFBd0IsRUFBRWxDLHNCQUF1QixDQUFDO0FBRXhFLGVBQWVBLHNCQUFzQiJ9