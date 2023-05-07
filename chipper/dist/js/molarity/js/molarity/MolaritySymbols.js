// Copyright 2013-2022, University of Colorado Boulder

/**
 * Universal chemical symbols, no i18n needed.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import ChemUtils from '../../../nitroglycerin/js/ChemUtils.js';
import molarity from '../molarity.js';
import MolarityStrings from '../MolarityStrings.js';
const drinkMixString = MolarityStrings.drinkMix;

// constants
const toSubscript = ChemUtils.toSubscript;
const MolaritySymbols = {
  COBALT_II_NITRATE: toSubscript('Co(NO3)2'),
  COBALT_CHLORIDE: toSubscript('CoCl2'),
  COPPER_SULFATE: toSubscript('CuSO4'),
  DRINK_MIX: drinkMixString,
  GOLD_III_CHLORIDE: toSubscript('AuCl3'),
  NICKEL_II_CHLORIDE: toSubscript('NiCl2'),
  POTASSIUM_CHROMATE: toSubscript('K2CrO4'),
  POTASSIUM_DICHROMATE: toSubscript('K2Cr2O7'),
  POTASSIUM_PERMANGANATE: toSubscript('KMnO4'),
  WATER: toSubscript('H2O'),
  CITRIC_ACID: toSubscript('C6H8O7')
};
molarity.register('MolaritySymbols', MolaritySymbols);
export default MolaritySymbols;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDaGVtVXRpbHMiLCJtb2xhcml0eSIsIk1vbGFyaXR5U3RyaW5ncyIsImRyaW5rTWl4U3RyaW5nIiwiZHJpbmtNaXgiLCJ0b1N1YnNjcmlwdCIsIk1vbGFyaXR5U3ltYm9scyIsIkNPQkFMVF9JSV9OSVRSQVRFIiwiQ09CQUxUX0NITE9SSURFIiwiQ09QUEVSX1NVTEZBVEUiLCJEUklOS19NSVgiLCJHT0xEX0lJSV9DSExPUklERSIsIk5JQ0tFTF9JSV9DSExPUklERSIsIlBPVEFTU0lVTV9DSFJPTUFURSIsIlBPVEFTU0lVTV9ESUNIUk9NQVRFIiwiUE9UQVNTSVVNX1BFUk1BTkdBTkFURSIsIldBVEVSIiwiQ0lUUklDX0FDSUQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1vbGFyaXR5U3ltYm9scy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBVbml2ZXJzYWwgY2hlbWljYWwgc3ltYm9scywgbm8gaTE4biBuZWVkZWQuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IENoZW1VdGlscyBmcm9tICcuLi8uLi8uLi9uaXRyb2dseWNlcmluL2pzL0NoZW1VdGlscy5qcyc7XHJcbmltcG9ydCBtb2xhcml0eSBmcm9tICcuLi9tb2xhcml0eS5qcyc7XHJcbmltcG9ydCBNb2xhcml0eVN0cmluZ3MgZnJvbSAnLi4vTW9sYXJpdHlTdHJpbmdzLmpzJztcclxuXHJcbmNvbnN0IGRyaW5rTWl4U3RyaW5nID0gTW9sYXJpdHlTdHJpbmdzLmRyaW5rTWl4O1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IHRvU3Vic2NyaXB0ID0gQ2hlbVV0aWxzLnRvU3Vic2NyaXB0O1xyXG5cclxuY29uc3QgTW9sYXJpdHlTeW1ib2xzID0ge1xyXG4gIENPQkFMVF9JSV9OSVRSQVRFOiB0b1N1YnNjcmlwdCggJ0NvKE5PMykyJyApLFxyXG4gIENPQkFMVF9DSExPUklERTogdG9TdWJzY3JpcHQoICdDb0NsMicgKSxcclxuICBDT1BQRVJfU1VMRkFURTogdG9TdWJzY3JpcHQoICdDdVNPNCcgKSxcclxuICBEUklOS19NSVg6IGRyaW5rTWl4U3RyaW5nLFxyXG4gIEdPTERfSUlJX0NITE9SSURFOiB0b1N1YnNjcmlwdCggJ0F1Q2wzJyApLFxyXG4gIE5JQ0tFTF9JSV9DSExPUklERTogdG9TdWJzY3JpcHQoICdOaUNsMicgKSxcclxuICBQT1RBU1NJVU1fQ0hST01BVEU6IHRvU3Vic2NyaXB0KCAnSzJDck80JyApLFxyXG4gIFBPVEFTU0lVTV9ESUNIUk9NQVRFOiB0b1N1YnNjcmlwdCggJ0syQ3IyTzcnICksXHJcbiAgUE9UQVNTSVVNX1BFUk1BTkdBTkFURTogdG9TdWJzY3JpcHQoICdLTW5PNCcgKSxcclxuICBXQVRFUjogdG9TdWJzY3JpcHQoICdIMk8nICksXHJcbiAgQ0lUUklDX0FDSUQ6IHRvU3Vic2NyaXB0KCAnQzZIOE83JyApXHJcbn07XHJcblxyXG5tb2xhcml0eS5yZWdpc3RlciggJ01vbGFyaXR5U3ltYm9scycsIE1vbGFyaXR5U3ltYm9scyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTW9sYXJpdHlTeW1ib2xzOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sd0NBQXdDO0FBQzlELE9BQU9DLFFBQVEsTUFBTSxnQkFBZ0I7QUFDckMsT0FBT0MsZUFBZSxNQUFNLHVCQUF1QjtBQUVuRCxNQUFNQyxjQUFjLEdBQUdELGVBQWUsQ0FBQ0UsUUFBUTs7QUFFL0M7QUFDQSxNQUFNQyxXQUFXLEdBQUdMLFNBQVMsQ0FBQ0ssV0FBVztBQUV6QyxNQUFNQyxlQUFlLEdBQUc7RUFDdEJDLGlCQUFpQixFQUFFRixXQUFXLENBQUUsVUFBVyxDQUFDO0VBQzVDRyxlQUFlLEVBQUVILFdBQVcsQ0FBRSxPQUFRLENBQUM7RUFDdkNJLGNBQWMsRUFBRUosV0FBVyxDQUFFLE9BQVEsQ0FBQztFQUN0Q0ssU0FBUyxFQUFFUCxjQUFjO0VBQ3pCUSxpQkFBaUIsRUFBRU4sV0FBVyxDQUFFLE9BQVEsQ0FBQztFQUN6Q08sa0JBQWtCLEVBQUVQLFdBQVcsQ0FBRSxPQUFRLENBQUM7RUFDMUNRLGtCQUFrQixFQUFFUixXQUFXLENBQUUsUUFBUyxDQUFDO0VBQzNDUyxvQkFBb0IsRUFBRVQsV0FBVyxDQUFFLFNBQVUsQ0FBQztFQUM5Q1Usc0JBQXNCLEVBQUVWLFdBQVcsQ0FBRSxPQUFRLENBQUM7RUFDOUNXLEtBQUssRUFBRVgsV0FBVyxDQUFFLEtBQU0sQ0FBQztFQUMzQlksV0FBVyxFQUFFWixXQUFXLENBQUUsUUFBUztBQUNyQyxDQUFDO0FBRURKLFFBQVEsQ0FBQ2lCLFFBQVEsQ0FBRSxpQkFBaUIsRUFBRVosZUFBZ0IsQ0FBQztBQUV2RCxlQUFlQSxlQUFlIn0=