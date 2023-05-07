// Copyright 2017-2021, University of Colorado Boulder

/**
 * Single location of all accessibility strings.  These strings are not meant to be translatable yet.  Rosetta needs
 * some work to provide translators with context for these strings, and we want to receive some community feedback
 * before these strings are submitted for translation.
 *
 * @author Jesse Greenberg
 */

import ohmsLaw from '../ohmsLaw.js';
const OhmsLawA11yStrings = {
  resistanceUnitsPattern: {
    value: '{{value}} Ohms'
  },
  voltageUnitsPattern: {
    value: '{{value}} Volts'
  },
  resistanceSliderLabel: {
    value: 'R, Resistance'
  },
  voltageSliderLabel: {
    value: 'V, Voltage'
  },
  currentAmps: {
    value: 'amps'
  },
  currentMilliamps: {
    value: 'milliamps'
  },
  chooseUnitForCurrent: {
    value: 'Choose unit for current.'
  },
  //--------------------------------------------------------------------------
  // Relative size strings
  //--------------------------------------------------------------------------

  // descriptions for the size of the current arrows
  // Note: Don't change number of sizes without changing the number of sizes value
  numberOfSizes: {
    value: 6
  },
  tiny: {
    value: 'Tiny'
  },
  verySmall: {
    value: 'Very small'
  },
  small: {
    value: 'Small'
  },
  mediumSize: {
    value: 'Medium size'
  },
  large: {
    value: 'Large'
  },
  veryLarge: {
    value: 'Very large'
  },
  huge: {
    value: 'Huge'
  },
  // relative descriptions that compare size of equation variables
  muchMuchSmallerThan: {
    value: 'much much smaller than'
  },
  muchSmallerThan: {
    value: 'much smaller than'
  },
  slightlySmallerThan: {
    value: 'slightly smaller than'
  },
  comparableTo: {
    value: 'comparable to'
  },
  slightlyLargerThan: {
    value: 'slightly larger than'
  },
  muchLargerThan: {
    value: 'much larger than'
  },
  muchMuchLargerThan: {
    value: 'much much larger than'
  },
  // pattern for the description of relative letter size
  relativeSizePattern: {
    value: 'In equation, <strong>letter V</strong> is <em>{{iComparison}}</em> <strong>letter I</strong> and <em>{{rComparison}}</em> <strong>letter R</strong>.'
  },
  //--------------------------------------------------------------------------
  // Equation strings
  //--------------------------------------------------------------------------
  ohmsLawEquation: {
    value: 'Ohm\'s Law Equation'
  },
  ohmsLawDefinition: {
    value: 'Voltage, <strong>V</strong>, is equal to Current, <strong>I</strong>, times Resistance, <strong>R</strong>.'
  },
  //--------------------------------------------------------------------------
  // Circuit strings
  //--------------------------------------------------------------------------
  circuitLabel: {
    value: 'The Circuit'
  },
  circuitDescription: {
    value: 'A pair of wires connect a resistor to a series of batteries. In circuit,'
  },
  //--------------------------------------------------------------------------
  // Battery strings
  //--------------------------------------------------------------------------

  batteriesSupplyPattern: {
    value: 'batteries supply <em>{{voltage}} volts</em>'
  },
  //--------------------------------------------------------------------------
  // Current strings
  //--------------------------------------------------------------------------
  currentDescriptionPattern: {
    value: '<em>{{arrowSize}} arrows</em> indicate a current flowing clockwise at <em>{{value}} {{unit}}</em>'
  },
  //--------------------------------------------------------------------------
  // Resistance strings
  //--------------------------------------------------------------------------

  tinyAmountOfImpurities: {
    value: 'a tiny amount of impurities'
  },
  verySmallAmountOfImpurities: {
    value: 'a very small amount of impurities'
  },
  smallAmountOfImpurities: {
    value: 'a small amount of impurities'
  },
  mediumAmountOfImpurities: {
    value: 'a medium amount of impurities'
  },
  largeAmountOfImpurities: {
    value: 'a large amount of impurities'
  },
  veryLargeAmountOfImpurities: {
    value: 'a very large amount of impurities'
  },
  hugeAmountOfImpurities: {
    value: 'a huge amount of impurities'
  },
  resistanceDotsPattern: {
    value: 'resistor shows <em>{{impurities}}</em>'
  },
  //--------------------------------------------------------------------------
  // Screen summary strings
  //--------------------------------------------------------------------------

  // pattern for the current arrow description in the screen summary
  summaryLookForSliders: {
    value: 'Look for voltage and resistance sliders to play, or read on for details about equation and circuit.'
  },
  summaryPlayArea: {
    value: 'In the Play Area you find the equation for Ohm\'s Law, <strong>V</strong> equals ' + '<strong>I</strong> times <strong>R</strong>, and a circuit. Voltage and resistance sliders ' + 'allow changes to the equation and circuit.'
  },
  summaryControlArea: {
    value: 'The Control Area has radio buttons to switch between milliamps and amps, and a button to reset the sim.'
  },
  stateOfSim: {
    value: 'State of Sim'
  },
  rightNow: {
    value: 'Right now,'
  },
  voltageSummaryPattern: {
    value: 'voltage, <strong>V</strong>, is <em>{{value}} volts</em>'
  },
  resistanceSummaryPattern: {
    value: 'resistance, <strong>R</strong>, is <em>{{value}} ohms</em>'
  },
  currentSummaryPattern: {
    value: 'current, <strong>I</strong>, is <em>{{value}} {{unit}}</em>'
  },
  //--------------------------------------------------------------------------
  // slider strings
  //--------------------------------------------------------------------------
  sliderControls: {
    value: 'Slider Controls'
  },
  slidersDescription: {
    value: 'Voltage and resistance sliders allow changes to equation and circuit.'
  },
  sliderChangeAlertPattern: {
    value: 'As letter {{initLetter}} {{initSizeChange}}, letter I {{iSizeChange}}.  Current now {{currentVal}} {{unit}}.'
  },
  letterR: {
    value: 'R'
  },
  letterV: {
    value: 'V'
  },
  shrinks: {
    value: 'shrinks'
  },
  grows: {
    value: 'grows'
  },
  aLot: {
    value: 'a lot'
  }
};
if (phet.chipper.queryParameters.stringTest === 'xss') {
  for (const key in OhmsLawA11yStrings) {
    OhmsLawA11yStrings[key].value += '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NkYGD4DwABCQEBtxmN7wAAAABJRU5ErkJggg==" onload="window.location.href=atob(\'aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ==\')" />';
  }
}

// verify that object is immutable, without the runtime penalty in production code
if (assert) {
  Object.freeze(OhmsLawA11yStrings);
}
ohmsLaw.register('OhmsLawA11yStrings', OhmsLawA11yStrings);
export default OhmsLawA11yStrings;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvaG1zTGF3IiwiT2htc0xhd0ExMXlTdHJpbmdzIiwicmVzaXN0YW5jZVVuaXRzUGF0dGVybiIsInZhbHVlIiwidm9sdGFnZVVuaXRzUGF0dGVybiIsInJlc2lzdGFuY2VTbGlkZXJMYWJlbCIsInZvbHRhZ2VTbGlkZXJMYWJlbCIsImN1cnJlbnRBbXBzIiwiY3VycmVudE1pbGxpYW1wcyIsImNob29zZVVuaXRGb3JDdXJyZW50IiwibnVtYmVyT2ZTaXplcyIsInRpbnkiLCJ2ZXJ5U21hbGwiLCJzbWFsbCIsIm1lZGl1bVNpemUiLCJsYXJnZSIsInZlcnlMYXJnZSIsImh1Z2UiLCJtdWNoTXVjaFNtYWxsZXJUaGFuIiwibXVjaFNtYWxsZXJUaGFuIiwic2xpZ2h0bHlTbWFsbGVyVGhhbiIsImNvbXBhcmFibGVUbyIsInNsaWdodGx5TGFyZ2VyVGhhbiIsIm11Y2hMYXJnZXJUaGFuIiwibXVjaE11Y2hMYXJnZXJUaGFuIiwicmVsYXRpdmVTaXplUGF0dGVybiIsIm9obXNMYXdFcXVhdGlvbiIsIm9obXNMYXdEZWZpbml0aW9uIiwiY2lyY3VpdExhYmVsIiwiY2lyY3VpdERlc2NyaXB0aW9uIiwiYmF0dGVyaWVzU3VwcGx5UGF0dGVybiIsImN1cnJlbnREZXNjcmlwdGlvblBhdHRlcm4iLCJ0aW55QW1vdW50T2ZJbXB1cml0aWVzIiwidmVyeVNtYWxsQW1vdW50T2ZJbXB1cml0aWVzIiwic21hbGxBbW91bnRPZkltcHVyaXRpZXMiLCJtZWRpdW1BbW91bnRPZkltcHVyaXRpZXMiLCJsYXJnZUFtb3VudE9mSW1wdXJpdGllcyIsInZlcnlMYXJnZUFtb3VudE9mSW1wdXJpdGllcyIsImh1Z2VBbW91bnRPZkltcHVyaXRpZXMiLCJyZXNpc3RhbmNlRG90c1BhdHRlcm4iLCJzdW1tYXJ5TG9va0ZvclNsaWRlcnMiLCJzdW1tYXJ5UGxheUFyZWEiLCJzdW1tYXJ5Q29udHJvbEFyZWEiLCJzdGF0ZU9mU2ltIiwicmlnaHROb3ciLCJ2b2x0YWdlU3VtbWFyeVBhdHRlcm4iLCJyZXNpc3RhbmNlU3VtbWFyeVBhdHRlcm4iLCJjdXJyZW50U3VtbWFyeVBhdHRlcm4iLCJzbGlkZXJDb250cm9scyIsInNsaWRlcnNEZXNjcmlwdGlvbiIsInNsaWRlckNoYW5nZUFsZXJ0UGF0dGVybiIsImxldHRlclIiLCJsZXR0ZXJWIiwic2hyaW5rcyIsImdyb3dzIiwiYUxvdCIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwic3RyaW5nVGVzdCIsImtleSIsImFzc2VydCIsIk9iamVjdCIsImZyZWV6ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiT2htc0xhd0ExMXlTdHJpbmdzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNpbmdsZSBsb2NhdGlvbiBvZiBhbGwgYWNjZXNzaWJpbGl0eSBzdHJpbmdzLiAgVGhlc2Ugc3RyaW5ncyBhcmUgbm90IG1lYW50IHRvIGJlIHRyYW5zbGF0YWJsZSB5ZXQuICBSb3NldHRhIG5lZWRzXHJcbiAqIHNvbWUgd29yayB0byBwcm92aWRlIHRyYW5zbGF0b3JzIHdpdGggY29udGV4dCBmb3IgdGhlc2Ugc3RyaW5ncywgYW5kIHdlIHdhbnQgdG8gcmVjZWl2ZSBzb21lIGNvbW11bml0eSBmZWVkYmFja1xyXG4gKiBiZWZvcmUgdGhlc2Ugc3RyaW5ncyBhcmUgc3VibWl0dGVkIGZvciB0cmFuc2xhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmdcclxuICovXHJcblxyXG5pbXBvcnQgb2htc0xhdyBmcm9tICcuLi9vaG1zTGF3LmpzJztcclxuXHJcbmNvbnN0IE9obXNMYXdBMTF5U3RyaW5ncyA9IHtcclxuICByZXNpc3RhbmNlVW5pdHNQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ3t7dmFsdWV9fSBPaG1zJ1xyXG4gIH0sXHJcbiAgdm9sdGFnZVVuaXRzUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICd7e3ZhbHVlfX0gVm9sdHMnXHJcbiAgfSxcclxuICByZXNpc3RhbmNlU2xpZGVyTGFiZWw6IHtcclxuICAgIHZhbHVlOiAnUiwgUmVzaXN0YW5jZSdcclxuICB9LFxyXG4gIHZvbHRhZ2VTbGlkZXJMYWJlbDoge1xyXG4gICAgdmFsdWU6ICdWLCBWb2x0YWdlJ1xyXG4gIH0sXHJcblxyXG4gIGN1cnJlbnRBbXBzOiB7XHJcbiAgICB2YWx1ZTogJ2FtcHMnXHJcbiAgfSxcclxuICBjdXJyZW50TWlsbGlhbXBzOiB7XHJcbiAgICB2YWx1ZTogJ21pbGxpYW1wcydcclxuICB9LFxyXG4gIGNob29zZVVuaXRGb3JDdXJyZW50OiB7XHJcbiAgICB2YWx1ZTogJ0Nob29zZSB1bml0IGZvciBjdXJyZW50LidcclxuICB9LFxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gUmVsYXRpdmUgc2l6ZSBzdHJpbmdzXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAvLyBkZXNjcmlwdGlvbnMgZm9yIHRoZSBzaXplIG9mIHRoZSBjdXJyZW50IGFycm93c1xyXG4gIC8vIE5vdGU6IERvbid0IGNoYW5nZSBudW1iZXIgb2Ygc2l6ZXMgd2l0aG91dCBjaGFuZ2luZyB0aGUgbnVtYmVyIG9mIHNpemVzIHZhbHVlXHJcbiAgbnVtYmVyT2ZTaXplczoge1xyXG4gICAgdmFsdWU6IDZcclxuICB9LFxyXG4gIHRpbnk6IHtcclxuICAgIHZhbHVlOiAnVGlueSdcclxuICB9LFxyXG4gIHZlcnlTbWFsbDoge1xyXG4gICAgdmFsdWU6ICdWZXJ5IHNtYWxsJ1xyXG4gIH0sXHJcbiAgc21hbGw6IHtcclxuICAgIHZhbHVlOiAnU21hbGwnXHJcbiAgfSxcclxuICBtZWRpdW1TaXplOiB7XHJcbiAgICB2YWx1ZTogJ01lZGl1bSBzaXplJ1xyXG4gIH0sXHJcbiAgbGFyZ2U6IHtcclxuICAgIHZhbHVlOiAnTGFyZ2UnXHJcbiAgfSxcclxuICB2ZXJ5TGFyZ2U6IHtcclxuICAgIHZhbHVlOiAnVmVyeSBsYXJnZSdcclxuICB9LFxyXG4gIGh1Z2U6IHtcclxuICAgIHZhbHVlOiAnSHVnZSdcclxuICB9LFxyXG5cclxuICAvLyByZWxhdGl2ZSBkZXNjcmlwdGlvbnMgdGhhdCBjb21wYXJlIHNpemUgb2YgZXF1YXRpb24gdmFyaWFibGVzXHJcbiAgbXVjaE11Y2hTbWFsbGVyVGhhbjoge1xyXG4gICAgdmFsdWU6ICdtdWNoIG11Y2ggc21hbGxlciB0aGFuJ1xyXG4gIH0sXHJcbiAgbXVjaFNtYWxsZXJUaGFuOiB7XHJcbiAgICB2YWx1ZTogJ211Y2ggc21hbGxlciB0aGFuJ1xyXG4gIH0sXHJcbiAgc2xpZ2h0bHlTbWFsbGVyVGhhbjoge1xyXG4gICAgdmFsdWU6ICdzbGlnaHRseSBzbWFsbGVyIHRoYW4nXHJcbiAgfSxcclxuICBjb21wYXJhYmxlVG86IHtcclxuICAgIHZhbHVlOiAnY29tcGFyYWJsZSB0bydcclxuICB9LFxyXG4gIHNsaWdodGx5TGFyZ2VyVGhhbjoge1xyXG4gICAgdmFsdWU6ICdzbGlnaHRseSBsYXJnZXIgdGhhbidcclxuICB9LFxyXG4gIG11Y2hMYXJnZXJUaGFuOiB7XHJcbiAgICB2YWx1ZTogJ211Y2ggbGFyZ2VyIHRoYW4nXHJcbiAgfSxcclxuICBtdWNoTXVjaExhcmdlclRoYW46IHtcclxuICAgIHZhbHVlOiAnbXVjaCBtdWNoIGxhcmdlciB0aGFuJ1xyXG4gIH0sXHJcblxyXG4gIC8vIHBhdHRlcm4gZm9yIHRoZSBkZXNjcmlwdGlvbiBvZiByZWxhdGl2ZSBsZXR0ZXIgc2l6ZVxyXG4gIHJlbGF0aXZlU2l6ZVBhdHRlcm46IHtcclxuICAgIHZhbHVlOiAnSW4gZXF1YXRpb24sIDxzdHJvbmc+bGV0dGVyIFY8L3N0cm9uZz4gaXMgPGVtPnt7aUNvbXBhcmlzb259fTwvZW0+IDxzdHJvbmc+bGV0dGVyIEk8L3N0cm9uZz4gYW5kIDxlbT57e3JDb21wYXJpc29ufX08L2VtPiA8c3Ryb25nPmxldHRlciBSPC9zdHJvbmc+LidcclxuICB9LFxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gRXF1YXRpb24gc3RyaW5nc1xyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICBvaG1zTGF3RXF1YXRpb246IHtcclxuICAgIHZhbHVlOiAnT2htXFwncyBMYXcgRXF1YXRpb24nXHJcbiAgfSxcclxuICBvaG1zTGF3RGVmaW5pdGlvbjoge1xyXG4gICAgdmFsdWU6ICdWb2x0YWdlLCA8c3Ryb25nPlY8L3N0cm9uZz4sIGlzIGVxdWFsIHRvIEN1cnJlbnQsIDxzdHJvbmc+STwvc3Ryb25nPiwgdGltZXMgUmVzaXN0YW5jZSwgPHN0cm9uZz5SPC9zdHJvbmc+LidcclxuICB9LFxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gQ2lyY3VpdCBzdHJpbmdzXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIGNpcmN1aXRMYWJlbDoge1xyXG4gICAgdmFsdWU6ICdUaGUgQ2lyY3VpdCdcclxuICB9LFxyXG4gIGNpcmN1aXREZXNjcmlwdGlvbjoge1xyXG4gICAgdmFsdWU6ICdBIHBhaXIgb2Ygd2lyZXMgY29ubmVjdCBhIHJlc2lzdG9yIHRvIGEgc2VyaWVzIG9mIGJhdHRlcmllcy4gSW4gY2lyY3VpdCwnXHJcbiAgfSxcclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIEJhdHRlcnkgc3RyaW5nc1xyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgYmF0dGVyaWVzU3VwcGx5UGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICdiYXR0ZXJpZXMgc3VwcGx5IDxlbT57e3ZvbHRhZ2V9fSB2b2x0czwvZW0+J1xyXG4gIH0sXHJcblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBDdXJyZW50IHN0cmluZ3NcclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgY3VycmVudERlc2NyaXB0aW9uUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICc8ZW0+e3thcnJvd1NpemV9fSBhcnJvd3M8L2VtPiBpbmRpY2F0ZSBhIGN1cnJlbnQgZmxvd2luZyBjbG9ja3dpc2UgYXQgPGVtPnt7dmFsdWV9fSB7e3VuaXR9fTwvZW0+J1xyXG4gIH0sXHJcblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBSZXNpc3RhbmNlIHN0cmluZ3NcclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIHRpbnlBbW91bnRPZkltcHVyaXRpZXM6IHtcclxuICAgIHZhbHVlOiAnYSB0aW55IGFtb3VudCBvZiBpbXB1cml0aWVzJ1xyXG4gIH0sXHJcbiAgdmVyeVNtYWxsQW1vdW50T2ZJbXB1cml0aWVzOiB7XHJcbiAgICB2YWx1ZTogJ2EgdmVyeSBzbWFsbCBhbW91bnQgb2YgaW1wdXJpdGllcydcclxuICB9LFxyXG4gIHNtYWxsQW1vdW50T2ZJbXB1cml0aWVzOiB7XHJcbiAgICB2YWx1ZTogJ2Egc21hbGwgYW1vdW50IG9mIGltcHVyaXRpZXMnXHJcbiAgfSxcclxuICBtZWRpdW1BbW91bnRPZkltcHVyaXRpZXM6IHtcclxuICAgIHZhbHVlOiAnYSBtZWRpdW0gYW1vdW50IG9mIGltcHVyaXRpZXMnXHJcbiAgfSxcclxuICBsYXJnZUFtb3VudE9mSW1wdXJpdGllczoge1xyXG4gICAgdmFsdWU6ICdhIGxhcmdlIGFtb3VudCBvZiBpbXB1cml0aWVzJ1xyXG4gIH0sXHJcbiAgdmVyeUxhcmdlQW1vdW50T2ZJbXB1cml0aWVzOiB7XHJcbiAgICB2YWx1ZTogJ2EgdmVyeSBsYXJnZSBhbW91bnQgb2YgaW1wdXJpdGllcydcclxuICB9LFxyXG4gIGh1Z2VBbW91bnRPZkltcHVyaXRpZXM6IHtcclxuICAgIHZhbHVlOiAnYSBodWdlIGFtb3VudCBvZiBpbXB1cml0aWVzJ1xyXG4gIH0sXHJcblxyXG4gIHJlc2lzdGFuY2VEb3RzUGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICdyZXNpc3RvciBzaG93cyA8ZW0+e3tpbXB1cml0aWVzfX08L2VtPidcclxuICB9LFxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gU2NyZWVuIHN1bW1hcnkgc3RyaW5nc1xyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgLy8gcGF0dGVybiBmb3IgdGhlIGN1cnJlbnQgYXJyb3cgZGVzY3JpcHRpb24gaW4gdGhlIHNjcmVlbiBzdW1tYXJ5XHJcbiAgc3VtbWFyeUxvb2tGb3JTbGlkZXJzOiB7XHJcbiAgICB2YWx1ZTogJ0xvb2sgZm9yIHZvbHRhZ2UgYW5kIHJlc2lzdGFuY2Ugc2xpZGVycyB0byBwbGF5LCBvciByZWFkIG9uIGZvciBkZXRhaWxzIGFib3V0IGVxdWF0aW9uIGFuZCBjaXJjdWl0LidcclxuICB9LFxyXG4gIHN1bW1hcnlQbGF5QXJlYToge1xyXG4gICAgdmFsdWU6ICdJbiB0aGUgUGxheSBBcmVhIHlvdSBmaW5kIHRoZSBlcXVhdGlvbiBmb3IgT2htXFwncyBMYXcsIDxzdHJvbmc+Vjwvc3Ryb25nPiBlcXVhbHMgJyArXHJcbiAgICAgICAgICAgJzxzdHJvbmc+STwvc3Ryb25nPiB0aW1lcyA8c3Ryb25nPlI8L3N0cm9uZz4sIGFuZCBhIGNpcmN1aXQuIFZvbHRhZ2UgYW5kIHJlc2lzdGFuY2Ugc2xpZGVycyAnICtcclxuICAgICAgICAgICAnYWxsb3cgY2hhbmdlcyB0byB0aGUgZXF1YXRpb24gYW5kIGNpcmN1aXQuJ1xyXG4gIH0sXHJcbiAgc3VtbWFyeUNvbnRyb2xBcmVhOiB7XHJcbiAgICB2YWx1ZTogJ1RoZSBDb250cm9sIEFyZWEgaGFzIHJhZGlvIGJ1dHRvbnMgdG8gc3dpdGNoIGJldHdlZW4gbWlsbGlhbXBzIGFuZCBhbXBzLCBhbmQgYSBidXR0b24gdG8gcmVzZXQgdGhlIHNpbS4nXHJcbiAgfSxcclxuXHJcbiAgc3RhdGVPZlNpbToge1xyXG4gICAgdmFsdWU6ICdTdGF0ZSBvZiBTaW0nXHJcbiAgfSxcclxuICByaWdodE5vdzoge1xyXG4gICAgdmFsdWU6ICdSaWdodCBub3csJ1xyXG4gIH0sXHJcblxyXG4gIHZvbHRhZ2VTdW1tYXJ5UGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICd2b2x0YWdlLCA8c3Ryb25nPlY8L3N0cm9uZz4sIGlzIDxlbT57e3ZhbHVlfX0gdm9sdHM8L2VtPidcclxuICB9LFxyXG4gIHJlc2lzdGFuY2VTdW1tYXJ5UGF0dGVybjoge1xyXG4gICAgdmFsdWU6ICdyZXNpc3RhbmNlLCA8c3Ryb25nPlI8L3N0cm9uZz4sIGlzIDxlbT57e3ZhbHVlfX0gb2htczwvZW0+J1xyXG4gIH0sXHJcbiAgY3VycmVudFN1bW1hcnlQYXR0ZXJuOiB7XHJcbiAgICB2YWx1ZTogJ2N1cnJlbnQsIDxzdHJvbmc+STwvc3Ryb25nPiwgaXMgPGVtPnt7dmFsdWV9fSB7e3VuaXR9fTwvZW0+J1xyXG4gIH0sXHJcblxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gc2xpZGVyIHN0cmluZ3NcclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgc2xpZGVyQ29udHJvbHM6IHtcclxuICAgIHZhbHVlOiAnU2xpZGVyIENvbnRyb2xzJ1xyXG4gIH0sXHJcbiAgc2xpZGVyc0Rlc2NyaXB0aW9uOiB7XHJcbiAgICB2YWx1ZTogJ1ZvbHRhZ2UgYW5kIHJlc2lzdGFuY2Ugc2xpZGVycyBhbGxvdyBjaGFuZ2VzIHRvIGVxdWF0aW9uIGFuZCBjaXJjdWl0LidcclxuICB9LFxyXG5cclxuICBzbGlkZXJDaGFuZ2VBbGVydFBhdHRlcm46IHtcclxuICAgIHZhbHVlOiAnQXMgbGV0dGVyIHt7aW5pdExldHRlcn19IHt7aW5pdFNpemVDaGFuZ2V9fSwgbGV0dGVyIEkge3tpU2l6ZUNoYW5nZX19LiAgQ3VycmVudCBub3cge3tjdXJyZW50VmFsfX0ge3t1bml0fX0uJ1xyXG4gIH0sXHJcbiAgbGV0dGVyUjoge1xyXG4gICAgdmFsdWU6ICdSJ1xyXG4gIH0sXHJcbiAgbGV0dGVyVjoge1xyXG4gICAgdmFsdWU6ICdWJ1xyXG4gIH0sXHJcbiAgc2hyaW5rczoge1xyXG4gICAgdmFsdWU6ICdzaHJpbmtzJ1xyXG4gIH0sXHJcbiAgZ3Jvd3M6IHtcclxuICAgIHZhbHVlOiAnZ3Jvd3MnXHJcbiAgfSxcclxuICBhTG90OiB7XHJcbiAgICB2YWx1ZTogJ2EgbG90J1xyXG4gIH1cclxufTtcclxuXHJcbmlmICggcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5zdHJpbmdUZXN0ID09PSAneHNzJyApIHtcclxuICBmb3IgKCBjb25zdCBrZXkgaW4gT2htc0xhd0ExMXlTdHJpbmdzICkge1xyXG4gICAgT2htc0xhd0ExMXlTdHJpbmdzWyBrZXkgXS52YWx1ZSArPSAnPGltZyBzcmM9XCJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFFQUFBQUJDQVlBQUFBZkZjU0pBQUFBRFVsRVFWUUlXMk5rWUdENER3QUJDUUVCdHhtTjd3QUFBQUJKUlU1RXJrSmdnZz09XCIgb25sb2FkPVwid2luZG93LmxvY2F0aW9uLmhyZWY9YXRvYihcXCdhSFIwY0hNNkx5OTNkM2N1ZVc5MWRIVmlaUzVqYjIwdmQyRjBZMmcvZGoxa1VYYzBkemxYWjFoalVRPT1cXCcpXCIgLz4nO1xyXG4gIH1cclxufVxyXG5cclxuLy8gdmVyaWZ5IHRoYXQgb2JqZWN0IGlzIGltbXV0YWJsZSwgd2l0aG91dCB0aGUgcnVudGltZSBwZW5hbHR5IGluIHByb2R1Y3Rpb24gY29kZVxyXG5pZiAoIGFzc2VydCApIHsgT2JqZWN0LmZyZWV6ZSggT2htc0xhd0ExMXlTdHJpbmdzICk7IH1cclxuXHJcbm9obXNMYXcucmVnaXN0ZXIoICdPaG1zTGF3QTExeVN0cmluZ3MnLCBPaG1zTGF3QTExeVN0cmluZ3MgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE9obXNMYXdBMTF5U3RyaW5nczsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSxlQUFlO0FBRW5DLE1BQU1DLGtCQUFrQixHQUFHO0VBQ3pCQyxzQkFBc0IsRUFBRTtJQUN0QkMsS0FBSyxFQUFFO0VBQ1QsQ0FBQztFQUNEQyxtQkFBbUIsRUFBRTtJQUNu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