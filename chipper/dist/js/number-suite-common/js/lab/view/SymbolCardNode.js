// Copyright 2022-2023, University of Colorado Boulder

/**
 * A CardNode with an inequality symbol on it.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../scenery/js/imports.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import CardNode from './CardNode.js';
class SymbolCardNode extends CardNode {
  constructor(providedOptions) {
    const options = optionize()({
      height: CardNode.WIDTH,
      width: CardNode.WIDTH
    }, providedOptions);
    const inequalitySymbol = new Text(providedOptions.symbolType, {
      font: new PhetFont(46)
    });
    super(inequalitySymbol, options);
  }
}
numberSuiteCommon.register('SymbolCardNode', SymbolCardNode);
export default SymbolCardNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJQaGV0Rm9udCIsIlRleHQiLCJudW1iZXJTdWl0ZUNvbW1vbiIsIkNhcmROb2RlIiwiU3ltYm9sQ2FyZE5vZGUiLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJoZWlnaHQiLCJXSURUSCIsIndpZHRoIiwiaW5lcXVhbGl0eVN5bWJvbCIsInN5bWJvbFR5cGUiLCJmb250IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTeW1ib2xDYXJkTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIENhcmROb2RlIHdpdGggYW4gaW5lcXVhbGl0eSBzeW1ib2wgb24gaXQuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgS2x1c2VuZG9yZiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG51bWJlclN1aXRlQ29tbW9uIGZyb20gJy4uLy4uL251bWJlclN1aXRlQ29tbW9uLmpzJztcclxuaW1wb3J0IENhcmROb2RlLCB7IENhcmROb2RlT3B0aW9ucyB9IGZyb20gJy4vQ2FyZE5vZGUuanMnO1xyXG5pbXBvcnQgU3ltYm9sVHlwZSBmcm9tICcuL1N5bWJvbFR5cGUuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBzeW1ib2xUeXBlOiBTeW1ib2xUeXBlO1xyXG59O1xyXG5leHBvcnQgdHlwZSBTeW1ib2xDYXJkTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8Q2FyZE5vZGVPcHRpb25zLCAnaGVpZ2h0JyB8ICd3aWR0aCc+O1xyXG5cclxuY2xhc3MgU3ltYm9sQ2FyZE5vZGUgZXh0ZW5kcyBDYXJkTm9kZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zOiBTeW1ib2xDYXJkTm9kZU9wdGlvbnMgKSB7XHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFN5bWJvbENhcmROb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIENhcmROb2RlT3B0aW9ucz4oKSgge1xyXG4gICAgICBoZWlnaHQ6IENhcmROb2RlLldJRFRILFxyXG4gICAgICB3aWR0aDogQ2FyZE5vZGUuV0lEVEhcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IGluZXF1YWxpdHlTeW1ib2wgPSBuZXcgVGV4dCggcHJvdmlkZWRPcHRpb25zLnN5bWJvbFR5cGUsIHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCA0NiApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIGluZXF1YWxpdHlTeW1ib2wsIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbm51bWJlclN1aXRlQ29tbW9uLnJlZ2lzdGVyKCAnU3ltYm9sQ2FyZE5vZGUnLCBTeW1ib2xDYXJkTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBTeW1ib2xDYXJkTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLHVDQUF1QztBQUU3RCxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLElBQUksUUFBUSxtQ0FBbUM7QUFDeEQsT0FBT0MsaUJBQWlCLE1BQU0sNEJBQTRCO0FBQzFELE9BQU9DLFFBQVEsTUFBMkIsZUFBZTtBQVF6RCxNQUFNQyxjQUFjLFNBQVNELFFBQVEsQ0FBQztFQUU3QkUsV0FBV0EsQ0FBRUMsZUFBc0MsRUFBRztJQUMzRCxNQUFNQyxPQUFPLEdBQUdSLFNBQVMsQ0FBc0QsQ0FBQyxDQUFFO01BQ2hGUyxNQUFNLEVBQUVMLFFBQVEsQ0FBQ00sS0FBSztNQUN0QkMsS0FBSyxFQUFFUCxRQUFRLENBQUNNO0lBQ2xCLENBQUMsRUFBRUgsZUFBZ0IsQ0FBQztJQUVwQixNQUFNSyxnQkFBZ0IsR0FBRyxJQUFJVixJQUFJLENBQUVLLGVBQWUsQ0FBQ00sVUFBVSxFQUFFO01BQzdEQyxJQUFJLEVBQUUsSUFBSWIsUUFBUSxDQUFFLEVBQUc7SUFDekIsQ0FBRSxDQUFDO0lBRUgsS0FBSyxDQUFFVyxnQkFBZ0IsRUFBRUosT0FBUSxDQUFDO0VBQ3BDO0FBQ0Y7QUFFQUwsaUJBQWlCLENBQUNZLFFBQVEsQ0FBRSxnQkFBZ0IsRUFBRVYsY0FBZSxDQUFDO0FBQzlELGVBQWVBLGNBQWMifQ==