// Copyright 2013-2022, University of Colorado Boulder

/**
 * Water, as a solvent. Solvents have a formula and a color.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import StringCasingPair from '../../../../scenery-phet/js/accessibility/StringCasingPair.js';
import { Color } from '../../../../scenery/js/imports.js';
import molarity from '../../molarity.js';
import MolarityStrings from '../../MolarityStrings.js';
import MolaritySymbols from '../MolaritySymbols.js';
const soluteColorsCapitalizedClearString = MolarityStrings.a11y.soluteColors.capitalized.clear;
const soluteColorsLowercaseClearString = MolarityStrings.a11y.soluteColors.lowercase.clear;
const Water = {
  formula: MolaritySymbols.WATER,
  color: new Color(224, 255, 255),
  colorStringPair: new StringCasingPair(soluteColorsLowercaseClearString, soluteColorsCapitalizedClearString)
};
molarity.register('Water', Water);
export default Water;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdHJpbmdDYXNpbmdQYWlyIiwiQ29sb3IiLCJtb2xhcml0eSIsIk1vbGFyaXR5U3RyaW5ncyIsIk1vbGFyaXR5U3ltYm9scyIsInNvbHV0ZUNvbG9yc0NhcGl0YWxpemVkQ2xlYXJTdHJpbmciLCJhMTF5Iiwic29sdXRlQ29sb3JzIiwiY2FwaXRhbGl6ZWQiLCJjbGVhciIsInNvbHV0ZUNvbG9yc0xvd2VyY2FzZUNsZWFyU3RyaW5nIiwibG93ZXJjYXNlIiwiV2F0ZXIiLCJmb3JtdWxhIiwiV0FURVIiLCJjb2xvciIsImNvbG9yU3RyaW5nUGFpciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiV2F0ZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogV2F0ZXIsIGFzIGEgc29sdmVudC4gU29sdmVudHMgaGF2ZSBhIGZvcm11bGEgYW5kIGEgY29sb3IuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFN0cmluZ0Nhc2luZ1BhaXIgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2FjY2Vzc2liaWxpdHkvU3RyaW5nQ2FzaW5nUGFpci5qcyc7XHJcbmltcG9ydCB7IENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG1vbGFyaXR5IGZyb20gJy4uLy4uL21vbGFyaXR5LmpzJztcclxuaW1wb3J0IE1vbGFyaXR5U3RyaW5ncyBmcm9tICcuLi8uLi9Nb2xhcml0eVN0cmluZ3MuanMnO1xyXG5pbXBvcnQgTW9sYXJpdHlTeW1ib2xzIGZyb20gJy4uL01vbGFyaXR5U3ltYm9scy5qcyc7XHJcblxyXG5jb25zdCBzb2x1dGVDb2xvcnNDYXBpdGFsaXplZENsZWFyU3RyaW5nID0gTW9sYXJpdHlTdHJpbmdzLmExMXkuc29sdXRlQ29sb3JzLmNhcGl0YWxpemVkLmNsZWFyO1xyXG5jb25zdCBzb2x1dGVDb2xvcnNMb3dlcmNhc2VDbGVhclN0cmluZyA9IE1vbGFyaXR5U3RyaW5ncy5hMTF5LnNvbHV0ZUNvbG9ycy5sb3dlcmNhc2UuY2xlYXI7XHJcblxyXG5jb25zdCBXYXRlciA9IHtcclxuICBmb3JtdWxhOiBNb2xhcml0eVN5bWJvbHMuV0FURVIsXHJcbiAgY29sb3I6IG5ldyBDb2xvciggMjI0LCAyNTUsIDI1NSApLFxyXG4gIGNvbG9yU3RyaW5nUGFpcjogbmV3IFN0cmluZ0Nhc2luZ1BhaXIoIHNvbHV0ZUNvbG9yc0xvd2VyY2FzZUNsZWFyU3RyaW5nLCBzb2x1dGVDb2xvcnNDYXBpdGFsaXplZENsZWFyU3RyaW5nIClcclxufTtcclxuXHJcbm1vbGFyaXR5LnJlZ2lzdGVyKCAnV2F0ZXInLCBXYXRlciApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgV2F0ZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGdCQUFnQixNQUFNLCtEQUErRDtBQUM1RixTQUFTQyxLQUFLLFFBQVEsbUNBQW1DO0FBQ3pELE9BQU9DLFFBQVEsTUFBTSxtQkFBbUI7QUFDeEMsT0FBT0MsZUFBZSxNQUFNLDBCQUEwQjtBQUN0RCxPQUFPQyxlQUFlLE1BQU0sdUJBQXVCO0FBRW5ELE1BQU1DLGtDQUFrQyxHQUFHRixlQUFlLENBQUNHLElBQUksQ0FBQ0MsWUFBWSxDQUFDQyxXQUFXLENBQUNDLEtBQUs7QUFDOUYsTUFBTUMsZ0NBQWdDLEdBQUdQLGVBQWUsQ0FBQ0csSUFBSSxDQUFDQyxZQUFZLENBQUNJLFNBQVMsQ0FBQ0YsS0FBSztBQUUxRixNQUFNRyxLQUFLLEdBQUc7RUFDWkMsT0FBTyxFQUFFVCxlQUFlLENBQUNVLEtBQUs7RUFDOUJDLEtBQUssRUFBRSxJQUFJZCxLQUFLLENBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFJLENBQUM7RUFDakNlLGVBQWUsRUFBRSxJQUFJaEIsZ0JBQWdCLENBQUVVLGdDQUFnQyxFQUFFTCxrQ0FBbUM7QUFDOUcsQ0FBQztBQUVESCxRQUFRLENBQUNlLFFBQVEsQ0FBRSxPQUFPLEVBQUVMLEtBQU0sQ0FBQztBQUVuQyxlQUFlQSxLQUFLIn0=