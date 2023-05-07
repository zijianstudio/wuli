// Copyright 2022, University of Colorado Boulder

import Panel from '../../../../sun/js/Panel.js';
import buildANucleus from '../../buildANucleus.js';
import PeriodicTableNode from '../../../../shred/js/view/PeriodicTableNode.js';
import { Rectangle } from '../../../../scenery/js/imports.js';
import BANColors from '../../common/BANColors.js';
import SymbolNode from '../../../../shred/js/view/SymbolNode.js';
import BANConstants from '../../common/BANConstants.js';

/**
 * A node that presents a periodic table and an enlarged and dynamic isotope symbol above the table.
 *
 * @author Luisa Vargas
 */

class PeriodicTableAndIsotopeSymbol extends Panel {
  constructor(particleAtom) {
    const panelContents = new Rectangle(0, 0, 150, 100); // empirically determined

    const options = {
      // options for the panel
      fill: BANColors.panelBackgroundColorProperty,
      xMargin: 10,
      stroke: BANConstants.PANEL_STROKE,
      cornerRadius: BANConstants.PANEL_CORNER_RADIUS
    };

    // Create and add the periodic table.
    const periodicTable = new PeriodicTableNode(particleAtom, {
      interactiveMax: 0,
      strokeHighlightWidth: 1,
      strokeHighlightColor: 'black',
      labelTextHighlightFill: 'white',
      disabledCellColor: 'white',
      selectedCellColor: BANColors.halfLifeColorProperty
    });
    periodicTable.scale(0.75);
    panelContents.addChild(periodicTable);

    // create and add the symbol node in an accordion box
    const symbolNode = new SymbolNode(particleAtom.protonCountProperty, particleAtom.massNumberProperty, {
      scale: 0.15,
      fill: BANColors.halfLifeColorProperty,
      symbolTextFill: 'white',
      protonCountDisplayFill: 'white',
      massNumberDisplayFill: 'white'
    });
    panelContents.addChild(symbolNode);
    particleAtom.massNumberProperty.link(massNumber => {
      massNumber === 0 ? symbolNode.setFillColor('white') : symbolNode.setFillColor(BANColors.halfLifeColorProperty);
      massNumber === 0 ? symbolNode.setSymbolTextColor('black') : symbolNode.setSymbolTextColor('white');
    });

    // Do the layout.  This positions the symbol to fit into the top portion
    // of the table.  The periodic table is 18 cells wide, and this needs
    // to be centered over the 8th column to be in the right place.
    symbolNode.centerX = 7.5 / 18 * periodicTable.width;
    symbolNode.top = 0;
    periodicTable.top = symbolNode.bottom - periodicTable.height / 7 * 2.5;
    periodicTable.left = 0;
    super(panelContents, options);
  }
}
buildANucleus.register('PeriodicTableAndIsotopeSymbol', PeriodicTableAndIsotopeSymbol);
export default PeriodicTableAndIsotopeSymbol;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYW5lbCIsImJ1aWxkQU51Y2xldXMiLCJQZXJpb2RpY1RhYmxlTm9kZSIsIlJlY3RhbmdsZSIsIkJBTkNvbG9ycyIsIlN5bWJvbE5vZGUiLCJCQU5Db25zdGFudHMiLCJQZXJpb2RpY1RhYmxlQW5kSXNvdG9wZVN5bWJvbCIsImNvbnN0cnVjdG9yIiwicGFydGljbGVBdG9tIiwicGFuZWxDb250ZW50cyIsIm9wdGlvbnMiLCJmaWxsIiwicGFuZWxCYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsInhNYXJnaW4iLCJzdHJva2UiLCJQQU5FTF9TVFJPS0UiLCJjb3JuZXJSYWRpdXMiLCJQQU5FTF9DT1JORVJfUkFESVVTIiwicGVyaW9kaWNUYWJsZSIsImludGVyYWN0aXZlTWF4Iiwic3Ryb2tlSGlnaGxpZ2h0V2lkdGgiLCJzdHJva2VIaWdobGlnaHRDb2xvciIsImxhYmVsVGV4dEhpZ2hsaWdodEZpbGwiLCJkaXNhYmxlZENlbGxDb2xvciIsInNlbGVjdGVkQ2VsbENvbG9yIiwiaGFsZkxpZmVDb2xvclByb3BlcnR5Iiwic2NhbGUiLCJhZGRDaGlsZCIsInN5bWJvbE5vZGUiLCJwcm90b25Db3VudFByb3BlcnR5IiwibWFzc051bWJlclByb3BlcnR5Iiwic3ltYm9sVGV4dEZpbGwiLCJwcm90b25Db3VudERpc3BsYXlGaWxsIiwibWFzc051bWJlckRpc3BsYXlGaWxsIiwibGluayIsIm1hc3NOdW1iZXIiLCJzZXRGaWxsQ29sb3IiLCJzZXRTeW1ib2xUZXh0Q29sb3IiLCJjZW50ZXJYIiwid2lkdGgiLCJ0b3AiLCJib3R0b20iLCJoZWlnaHQiLCJsZWZ0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQZXJpb2RpY1RhYmxlQW5kSXNvdG9wZVN5bWJvbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG5pbXBvcnQgUGFuZWwgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcclxuaW1wb3J0IGJ1aWxkQU51Y2xldXMgZnJvbSAnLi4vLi4vYnVpbGRBTnVjbGV1cy5qcyc7XHJcbmltcG9ydCBQZXJpb2RpY1RhYmxlTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zaHJlZC9qcy92aWV3L1BlcmlvZGljVGFibGVOb2RlLmpzJztcclxuaW1wb3J0IFBhcnRpY2xlQXRvbSBmcm9tICcuLi8uLi8uLi8uLi9zaHJlZC9qcy9tb2RlbC9QYXJ0aWNsZUF0b20uanMnO1xyXG5pbXBvcnQgeyBSZWN0YW5nbGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQkFOQ29sb3JzIGZyb20gJy4uLy4uL2NvbW1vbi9CQU5Db2xvcnMuanMnO1xyXG5pbXBvcnQgU3ltYm9sTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zaHJlZC9qcy92aWV3L1N5bWJvbE5vZGUuanMnO1xyXG5pbXBvcnQgQkFOQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9CQU5Db25zdGFudHMuanMnO1xyXG5cclxuLyoqXHJcbiAqIEEgbm9kZSB0aGF0IHByZXNlbnRzIGEgcGVyaW9kaWMgdGFibGUgYW5kIGFuIGVubGFyZ2VkIGFuZCBkeW5hbWljIGlzb3RvcGUgc3ltYm9sIGFib3ZlIHRoZSB0YWJsZS5cclxuICpcclxuICogQGF1dGhvciBMdWlzYSBWYXJnYXNcclxuICovXHJcblxyXG5jbGFzcyBQZXJpb2RpY1RhYmxlQW5kSXNvdG9wZVN5bWJvbCBleHRlbmRzIFBhbmVsIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwYXJ0aWNsZUF0b206IFBhcnRpY2xlQXRvbSApIHtcclxuXHJcbiAgICBjb25zdCBwYW5lbENvbnRlbnRzID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMTUwLCAxMDAgKTsgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSB7XHJcblxyXG4gICAgICAvLyBvcHRpb25zIGZvciB0aGUgcGFuZWxcclxuICAgICAgZmlsbDogQkFOQ29sb3JzLnBhbmVsQmFja2dyb3VuZENvbG9yUHJvcGVydHksXHJcbiAgICAgIHhNYXJnaW46IDEwLFxyXG4gICAgICBzdHJva2U6IEJBTkNvbnN0YW50cy5QQU5FTF9TVFJPS0UsXHJcbiAgICAgIGNvcm5lclJhZGl1czogQkFOQ29uc3RhbnRzLlBBTkVMX0NPUk5FUl9SQURJVVNcclxuICAgIH07XHJcblxyXG4gICAgLy8gQ3JlYXRlIGFuZCBhZGQgdGhlIHBlcmlvZGljIHRhYmxlLlxyXG4gICAgY29uc3QgcGVyaW9kaWNUYWJsZSA9IG5ldyBQZXJpb2RpY1RhYmxlTm9kZSggcGFydGljbGVBdG9tLCB7XHJcbiAgICAgIGludGVyYWN0aXZlTWF4OiAwLFxyXG4gICAgICBzdHJva2VIaWdobGlnaHRXaWR0aDogMSxcclxuICAgICAgc3Ryb2tlSGlnaGxpZ2h0Q29sb3I6ICdibGFjaycsXHJcbiAgICAgIGxhYmVsVGV4dEhpZ2hsaWdodEZpbGw6ICd3aGl0ZScsXHJcbiAgICAgIGRpc2FibGVkQ2VsbENvbG9yOiAnd2hpdGUnLFxyXG4gICAgICBzZWxlY3RlZENlbGxDb2xvcjogQkFOQ29sb3JzLmhhbGZMaWZlQ29sb3JQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG4gICAgcGVyaW9kaWNUYWJsZS5zY2FsZSggMC43NSApO1xyXG4gICAgcGFuZWxDb250ZW50cy5hZGRDaGlsZCggcGVyaW9kaWNUYWJsZSApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhbmQgYWRkIHRoZSBzeW1ib2wgbm9kZSBpbiBhbiBhY2NvcmRpb24gYm94XHJcbiAgICBjb25zdCBzeW1ib2xOb2RlID0gbmV3IFN5bWJvbE5vZGUoIHBhcnRpY2xlQXRvbS5wcm90b25Db3VudFByb3BlcnR5LCBwYXJ0aWNsZUF0b20ubWFzc051bWJlclByb3BlcnR5LCB7XHJcbiAgICAgIHNjYWxlOiAwLjE1LFxyXG4gICAgICBmaWxsOiBCQU5Db2xvcnMuaGFsZkxpZmVDb2xvclByb3BlcnR5LFxyXG4gICAgICBzeW1ib2xUZXh0RmlsbDogJ3doaXRlJyxcclxuICAgICAgcHJvdG9uQ291bnREaXNwbGF5RmlsbDogJ3doaXRlJyxcclxuICAgICAgbWFzc051bWJlckRpc3BsYXlGaWxsOiAnd2hpdGUnXHJcbiAgICB9ICk7XHJcbiAgICBwYW5lbENvbnRlbnRzLmFkZENoaWxkKCBzeW1ib2xOb2RlICk7XHJcbiAgICBwYXJ0aWNsZUF0b20ubWFzc051bWJlclByb3BlcnR5LmxpbmsoIG1hc3NOdW1iZXIgPT4ge1xyXG4gICAgICBtYXNzTnVtYmVyID09PSAwID8gc3ltYm9sTm9kZS5zZXRGaWxsQ29sb3IoICd3aGl0ZScgKSA6IHN5bWJvbE5vZGUuc2V0RmlsbENvbG9yKCBCQU5Db2xvcnMuaGFsZkxpZmVDb2xvclByb3BlcnR5ICk7XHJcbiAgICAgIG1hc3NOdW1iZXIgPT09IDAgPyBzeW1ib2xOb2RlLnNldFN5bWJvbFRleHRDb2xvciggJ2JsYWNrJyApIDogc3ltYm9sTm9kZS5zZXRTeW1ib2xUZXh0Q29sb3IoICd3aGl0ZScgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBEbyB0aGUgbGF5b3V0LiAgVGhpcyBwb3NpdGlvbnMgdGhlIHN5bWJvbCB0byBmaXQgaW50byB0aGUgdG9wIHBvcnRpb25cclxuICAgIC8vIG9mIHRoZSB0YWJsZS4gIFRoZSBwZXJpb2RpYyB0YWJsZSBpcyAxOCBjZWxscyB3aWRlLCBhbmQgdGhpcyBuZWVkc1xyXG4gICAgLy8gdG8gYmUgY2VudGVyZWQgb3ZlciB0aGUgOHRoIGNvbHVtbiB0byBiZSBpbiB0aGUgcmlnaHQgcGxhY2UuXHJcbiAgICBzeW1ib2xOb2RlLmNlbnRlclggPSAoIDcuNSAvIDE4ICkgKiBwZXJpb2RpY1RhYmxlLndpZHRoO1xyXG4gICAgc3ltYm9sTm9kZS50b3AgPSAwO1xyXG4gICAgcGVyaW9kaWNUYWJsZS50b3AgPSBzeW1ib2xOb2RlLmJvdHRvbSAtICggcGVyaW9kaWNUYWJsZS5oZWlnaHQgLyA3ICogMi41ICk7XHJcbiAgICBwZXJpb2RpY1RhYmxlLmxlZnQgPSAwO1xyXG5cclxuICAgIHN1cGVyKCBwYW5lbENvbnRlbnRzLCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5idWlsZEFOdWNsZXVzLnJlZ2lzdGVyKCAnUGVyaW9kaWNUYWJsZUFuZElzb3RvcGVTeW1ib2wnLCBQZXJpb2RpY1RhYmxlQW5kSXNvdG9wZVN5bWJvbCApO1xyXG5leHBvcnQgZGVmYXVsdCBQZXJpb2RpY1RhYmxlQW5kSXNvdG9wZVN5bWJvbDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBLE9BQU9BLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsYUFBYSxNQUFNLHdCQUF3QjtBQUNsRCxPQUFPQyxpQkFBaUIsTUFBTSxnREFBZ0Q7QUFFOUUsU0FBU0MsU0FBUyxRQUFRLG1DQUFtQztBQUM3RCxPQUFPQyxTQUFTLE1BQU0sMkJBQTJCO0FBQ2pELE9BQU9DLFVBQVUsTUFBTSx5Q0FBeUM7QUFDaEUsT0FBT0MsWUFBWSxNQUFNLDhCQUE4Qjs7QUFFdkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNQyw2QkFBNkIsU0FBU1AsS0FBSyxDQUFDO0VBRXpDUSxXQUFXQSxDQUFFQyxZQUEwQixFQUFHO0lBRS9DLE1BQU1DLGFBQWEsR0FBRyxJQUFJUCxTQUFTLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBSSxDQUFDLENBQUMsQ0FBQzs7SUFFdkQsTUFBTVEsT0FBTyxHQUFHO01BRWQ7TUFDQUMsSUFBSSxFQUFFUixTQUFTLENBQUNTLDRCQUE0QjtNQUM1Q0MsT0FBTyxFQUFFLEVBQUU7TUFDWEMsTUFBTSxFQUFFVCxZQUFZLENBQUNVLFlBQVk7TUFDakNDLFlBQVksRUFBRVgsWUFBWSxDQUFDWTtJQUM3QixDQUFDOztJQUVEO0lBQ0EsTUFBTUMsYUFBYSxHQUFHLElBQUlqQixpQkFBaUIsQ0FBRU8sWUFBWSxFQUFFO01BQ3pEVyxjQUFjLEVBQUUsQ0FBQztNQUNqQkMsb0JBQW9CLEVBQUUsQ0FBQztNQUN2QkMsb0JBQW9CLEVBQUUsT0FBTztNQUM3QkMsc0JBQXNCLEVBQUUsT0FBTztNQUMvQkMsaUJBQWlCLEVBQUUsT0FBTztNQUMxQkMsaUJBQWlCLEVBQUVyQixTQUFTLENBQUNzQjtJQUMvQixDQUFFLENBQUM7SUFDSFAsYUFBYSxDQUFDUSxLQUFLLENBQUUsSUFBSyxDQUFDO0lBQzNCakIsYUFBYSxDQUFDa0IsUUFBUSxDQUFFVCxhQUFjLENBQUM7O0lBRXZDO0lBQ0EsTUFBTVUsVUFBVSxHQUFHLElBQUl4QixVQUFVLENBQUVJLFlBQVksQ0FBQ3FCLG1CQUFtQixFQUFFckIsWUFBWSxDQUFDc0Isa0JBQWtCLEVBQUU7TUFDcEdKLEtBQUssRUFBRSxJQUFJO01BQ1hmLElBQUksRUFBRVIsU0FBUyxDQUFDc0IscUJBQXFCO01BQ3JDTSxjQUFjLEVBQUUsT0FBTztNQUN2QkMsc0JBQXNCLEVBQUUsT0FBTztNQUMvQkMscUJBQXFCLEVBQUU7SUFDekIsQ0FBRSxDQUFDO0lBQ0h4QixhQUFhLENBQUNrQixRQUFRLENBQUVDLFVBQVcsQ0FBQztJQUNwQ3BCLFlBQVksQ0FBQ3NCLGtCQUFrQixDQUFDSSxJQUFJLENBQUVDLFVBQVUsSUFBSTtNQUNsREEsVUFBVSxLQUFLLENBQUMsR0FBR1AsVUFBVSxDQUFDUSxZQUFZLENBQUUsT0FBUSxDQUFDLEdBQUdSLFVBQVUsQ0FBQ1EsWUFBWSxDQUFFakMsU0FBUyxDQUFDc0IscUJBQXNCLENBQUM7TUFDbEhVLFVBQVUsS0FBSyxDQUFDLEdBQUdQLFVBQVUsQ0FBQ1Msa0JBQWtCLENBQUUsT0FBUSxDQUFDLEdBQUdULFVBQVUsQ0FBQ1Msa0JBQWtCLENBQUUsT0FBUSxDQUFDO0lBQ3hHLENBQUUsQ0FBQzs7SUFFSDtJQUNBO0lBQ0E7SUFDQVQsVUFBVSxDQUFDVSxPQUFPLEdBQUssR0FBRyxHQUFHLEVBQUUsR0FBS3BCLGFBQWEsQ0FBQ3FCLEtBQUs7SUFDdkRYLFVBQVUsQ0FBQ1ksR0FBRyxHQUFHLENBQUM7SUFDbEJ0QixhQUFhLENBQUNzQixHQUFHLEdBQUdaLFVBQVUsQ0FBQ2EsTUFBTSxHQUFLdkIsYUFBYSxDQUFDd0IsTUFBTSxHQUFHLENBQUMsR0FBRyxHQUFLO0lBQzFFeEIsYUFBYSxDQUFDeUIsSUFBSSxHQUFHLENBQUM7SUFFdEIsS0FBSyxDQUFFbEMsYUFBYSxFQUFFQyxPQUFRLENBQUM7RUFDakM7QUFDRjtBQUVBVixhQUFhLENBQUM0QyxRQUFRLENBQUUsK0JBQStCLEVBQUV0Qyw2QkFBOEIsQ0FBQztBQUN4RixlQUFlQSw2QkFBNkIifQ==