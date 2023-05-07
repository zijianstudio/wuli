// Copyright 2016-2022, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from './circuitConstructionKitCommon.js';
const CCKCQueryParameters = QueryStringMachine.getAll({
  //------------------------------------------------------------------------------------------------------------------
  // Public facing
  //------------------------------------------------------------------------------------------------------------------

  // For Black Box Study & PhET-iO, selects whether to show electrons or conventional current
  currentType: {
    public: true,
    type: 'string',
    defaultValue: 'electrons',
    validValues: ['electrons', 'conventional']
  },
  // Whether the current is initially displayed
  showCurrent: {
    public: true,
    type: 'boolean',
    defaultValue: true
  },
  // Whether the carousel shows real (as opposed to just ideal) light bulbs
  addRealBulbs: {
    type: 'flag',
    public: true
  },
  // Increases the number of inductors that can be dragged from the toolbox
  // see https://github.com/phetsims/circuit-construction-kit-common/issues/774
  moreInductors: {
    public: true,
    type: 'flag'
  },
  // Determines which standard is used to display the schematics
  schematicStandard: {
    public: true,
    type: 'string',
    defaultValue: 'ieee',
    validValues: ['ieee', 'iec', 'british']
  },
  ammeterReadout: {
    public: true,
    type: 'string',
    defaultValue: 'magnitude',
    validValues: ['magnitude', 'signed']
  },
  //------------------------------------------------------------------------------------------------------------------
  // For internal use only
  //------------------------------------------------------------------------------------------------------------------

  // Show a readout for each vertex, for debugging the circuit physics
  vertexDisplay: {
    type: 'flag'
  },
  // Shows the play/pause button.  When the user changes something, the sim automatically pauses and hides indicators (like electrons and flame)
  // For Black Box Study & PhET-iO
  showDepictValuesToggleButton: {
    type: 'flag'
  },
  // This shows the voltmeter probe position and sampling points, useful for debugging voltmeter connectivity issues
  // or positioning if the voltmeter is rotated
  showVoltmeterSamplePoints: {
    type: 'flag'
  },
  batteryMinimumResistance: {
    type: 'number',
    defaultValue: 1E-4
  },
  // Model capacitors with a series resistor to help linearize the problem
  capacitorResistance: {
    type: 'number',
    defaultValue: 1E-4
  },
  // Model inductors with a series resistor to help linearize the problem
  inductorResistance: {
    type: 'number',
    defaultValue: 1E-4
  },
  fullPrecisionAmmeter: {
    type: 'flag'
  },
  wireResistivity: {
    type: 'number',
    defaultValue: 1E-10
  },
  // For debugging the current value and sense of FixedCircuitElement
  showCurrents: {
    type: 'flag'
  },
  inductanceMin: {
    type: 'number',
    defaultValue: 0.1
  },
  inductanceMax: {
    type: 'number',
    defaultValue: 10
  },
  inductanceStep: {
    type: 'number',
    defaultValue: 0.001
  },
  inductanceDefault: {
    type: 'number',
    defaultValue: 5
  },
  inductorNumberDecimalPlaces: {
    type: 'number',
    defaultValue: 3
  },
  capacitanceMin: {
    type: 'number',
    defaultValue: 0.05
  },
  capacitanceMax: {
    type: 'number',
    defaultValue: 0.2
  },
  capacitanceStep: {
    type: 'number',
    defaultValue: 0.01
  },
  capacitanceDefault: {
    type: 'number',
    defaultValue: 0.1
  },
  capacitorNumberDecimalPlaces: {
    type: 'number',
    defaultValue: 2
  },
  minDT: {
    type: 'number',
    defaultValue: 1E-3
  },
  searchTimeStep: {
    type: 'boolean',
    defaultValue: true
  },
  codap: {
    type: 'flag'
  }
});
circuitConstructionKitCommon.register('CCKCQueryParameters', CCKCQueryParameters);
export default CCKCQueryParameters;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uIiwiQ0NLQ1F1ZXJ5UGFyYW1ldGVycyIsIlF1ZXJ5U3RyaW5nTWFjaGluZSIsImdldEFsbCIsImN1cnJlbnRUeXBlIiwicHVibGljIiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsInZhbGlkVmFsdWVzIiwic2hvd0N1cnJlbnQiLCJhZGRSZWFsQnVsYnMiLCJtb3JlSW5kdWN0b3JzIiwic2NoZW1hdGljU3RhbmRhcmQiLCJhbW1ldGVyUmVhZG91dCIsInZlcnRleERpc3BsYXkiLCJzaG93RGVwaWN0VmFsdWVzVG9nZ2xlQnV0dG9uIiwic2hvd1ZvbHRtZXRlclNhbXBsZVBvaW50cyIsImJhdHRlcnlNaW5pbXVtUmVzaXN0YW5jZSIsImNhcGFjaXRvclJlc2lzdGFuY2UiLCJpbmR1Y3RvclJlc2lzdGFuY2UiLCJmdWxsUHJlY2lzaW9uQW1tZXRlciIsIndpcmVSZXNpc3Rpdml0eSIsInNob3dDdXJyZW50cyIsImluZHVjdGFuY2VNaW4iLCJpbmR1Y3RhbmNlTWF4IiwiaW5kdWN0YW5jZVN0ZXAiLCJpbmR1Y3RhbmNlRGVmYXVsdCIsImluZHVjdG9yTnVtYmVyRGVjaW1hbFBsYWNlcyIsImNhcGFjaXRhbmNlTWluIiwiY2FwYWNpdGFuY2VNYXgiLCJjYXBhY2l0YW5jZVN0ZXAiLCJjYXBhY2l0YW5jZURlZmF1bHQiLCJjYXBhY2l0b3JOdW1iZXJEZWNpbWFsUGxhY2VzIiwibWluRFQiLCJzZWFyY2hUaW1lU3RlcCIsImNvZGFwIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDQ0tDUXVlcnlQYXJhbWV0ZXJzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFF1ZXJ5IHBhcmFtZXRlcnMgc3VwcG9ydGVkIGJ5IHRoaXMgc2ltdWxhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbiBmcm9tICcuL2NpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24uanMnO1xyXG5cclxuY29uc3QgQ0NLQ1F1ZXJ5UGFyYW1ldGVycyA9IFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRBbGwoIHtcclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBQdWJsaWMgZmFjaW5nXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgLy8gRm9yIEJsYWNrIEJveCBTdHVkeSAmIFBoRVQtaU8sIHNlbGVjdHMgd2hldGhlciB0byBzaG93IGVsZWN0cm9ucyBvciBjb252ZW50aW9uYWwgY3VycmVudFxyXG4gIGN1cnJlbnRUeXBlOiB7XHJcbiAgICBwdWJsaWM6IHRydWUsXHJcbiAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgIGRlZmF1bHRWYWx1ZTogJ2VsZWN0cm9ucycsXHJcbiAgICB2YWxpZFZhbHVlczogWyAnZWxlY3Ryb25zJywgJ2NvbnZlbnRpb25hbCcgXVxyXG4gIH0sXHJcblxyXG4gIC8vIFdoZXRoZXIgdGhlIGN1cnJlbnQgaXMgaW5pdGlhbGx5IGRpc3BsYXllZFxyXG4gIHNob3dDdXJyZW50OiB7XHJcbiAgICBwdWJsaWM6IHRydWUsXHJcbiAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICBkZWZhdWx0VmFsdWU6IHRydWVcclxuICB9LFxyXG5cclxuICAvLyBXaGV0aGVyIHRoZSBjYXJvdXNlbCBzaG93cyByZWFsIChhcyBvcHBvc2VkIHRvIGp1c3QgaWRlYWwpIGxpZ2h0IGJ1bGJzXHJcbiAgYWRkUmVhbEJ1bGJzOiB7XHJcbiAgICB0eXBlOiAnZmxhZycsXHJcbiAgICBwdWJsaWM6IHRydWVcclxuICB9LFxyXG5cclxuICAvLyBJbmNyZWFzZXMgdGhlIG51bWJlciBvZiBpbmR1Y3RvcnMgdGhhdCBjYW4gYmUgZHJhZ2dlZCBmcm9tIHRoZSB0b29sYm94XHJcbiAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaXJjdWl0LWNvbnN0cnVjdGlvbi1raXQtY29tbW9uL2lzc3Vlcy83NzRcclxuICBtb3JlSW5kdWN0b3JzOiB7XHJcbiAgICBwdWJsaWM6IHRydWUsXHJcbiAgICB0eXBlOiAnZmxhZydcclxuICB9LFxyXG5cclxuICAvLyBEZXRlcm1pbmVzIHdoaWNoIHN0YW5kYXJkIGlzIHVzZWQgdG8gZGlzcGxheSB0aGUgc2NoZW1hdGljc1xyXG4gIHNjaGVtYXRpY1N0YW5kYXJkOiB7XHJcbiAgICBwdWJsaWM6IHRydWUsXHJcbiAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgIGRlZmF1bHRWYWx1ZTogJ2llZWUnLFxyXG4gICAgdmFsaWRWYWx1ZXM6IFsgJ2llZWUnLCAnaWVjJywgJ2JyaXRpc2gnIF1cclxuICB9LFxyXG5cclxuICBhbW1ldGVyUmVhZG91dDoge1xyXG4gICAgcHVibGljOiB0cnVlLFxyXG4gICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICBkZWZhdWx0VmFsdWU6ICdtYWduaXR1ZGUnLFxyXG4gICAgdmFsaWRWYWx1ZXM6IFsgJ21hZ25pdHVkZScsICdzaWduZWQnIF1cclxuICB9LFxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIEZvciBpbnRlcm5hbCB1c2Ugb25seVxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIC8vIFNob3cgYSByZWFkb3V0IGZvciBlYWNoIHZlcnRleCwgZm9yIGRlYnVnZ2luZyB0aGUgY2lyY3VpdCBwaHlzaWNzXHJcbiAgdmVydGV4RGlzcGxheToge1xyXG4gICAgdHlwZTogJ2ZsYWcnXHJcbiAgfSxcclxuXHJcbiAgLy8gU2hvd3MgdGhlIHBsYXkvcGF1c2UgYnV0dG9uLiAgV2hlbiB0aGUgdXNlciBjaGFuZ2VzIHNvbWV0aGluZywgdGhlIHNpbSBhdXRvbWF0aWNhbGx5IHBhdXNlcyBhbmQgaGlkZXMgaW5kaWNhdG9ycyAobGlrZSBlbGVjdHJvbnMgYW5kIGZsYW1lKVxyXG4gIC8vIEZvciBCbGFjayBCb3ggU3R1ZHkgJiBQaEVULWlPXHJcbiAgc2hvd0RlcGljdFZhbHVlc1RvZ2dsZUJ1dHRvbjogeyB0eXBlOiAnZmxhZycgfSxcclxuXHJcbiAgLy8gVGhpcyBzaG93cyB0aGUgdm9sdG1ldGVyIHByb2JlIHBvc2l0aW9uIGFuZCBzYW1wbGluZyBwb2ludHMsIHVzZWZ1bCBmb3IgZGVidWdnaW5nIHZvbHRtZXRlciBjb25uZWN0aXZpdHkgaXNzdWVzXHJcbiAgLy8gb3IgcG9zaXRpb25pbmcgaWYgdGhlIHZvbHRtZXRlciBpcyByb3RhdGVkXHJcbiAgc2hvd1ZvbHRtZXRlclNhbXBsZVBvaW50czoge1xyXG4gICAgdHlwZTogJ2ZsYWcnXHJcbiAgfSxcclxuXHJcbiAgYmF0dGVyeU1pbmltdW1SZXNpc3RhbmNlOiB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgIGRlZmF1bHRWYWx1ZTogMUUtNFxyXG4gIH0sXHJcblxyXG4gIC8vIE1vZGVsIGNhcGFjaXRvcnMgd2l0aCBhIHNlcmllcyByZXNpc3RvciB0byBoZWxwIGxpbmVhcml6ZSB0aGUgcHJvYmxlbVxyXG4gIGNhcGFjaXRvclJlc2lzdGFuY2U6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiAxRS00XHJcbiAgfSxcclxuXHJcbiAgLy8gTW9kZWwgaW5kdWN0b3JzIHdpdGggYSBzZXJpZXMgcmVzaXN0b3IgdG8gaGVscCBsaW5lYXJpemUgdGhlIHByb2JsZW1cclxuICBpbmR1Y3RvclJlc2lzdGFuY2U6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiAxRS00XHJcbiAgfSxcclxuXHJcbiAgZnVsbFByZWNpc2lvbkFtbWV0ZXI6IHtcclxuICAgIHR5cGU6ICdmbGFnJ1xyXG4gIH0sXHJcblxyXG4gIHdpcmVSZXNpc3Rpdml0eToge1xyXG4gICAgdHlwZTogJ251bWJlcicsXHJcbiAgICBkZWZhdWx0VmFsdWU6IDFFLTEwXHJcbiAgfSxcclxuXHJcbiAgLy8gRm9yIGRlYnVnZ2luZyB0aGUgY3VycmVudCB2YWx1ZSBhbmQgc2Vuc2Ugb2YgRml4ZWRDaXJjdWl0RWxlbWVudFxyXG4gIHNob3dDdXJyZW50czoge1xyXG4gICAgdHlwZTogJ2ZsYWcnXHJcbiAgfSxcclxuXHJcbiAgaW5kdWN0YW5jZU1pbjoge1xyXG4gICAgdHlwZTogJ251bWJlcicsXHJcbiAgICBkZWZhdWx0VmFsdWU6IDAuMVxyXG4gIH0sXHJcbiAgaW5kdWN0YW5jZU1heDoge1xyXG4gICAgdHlwZTogJ251bWJlcicsXHJcbiAgICBkZWZhdWx0VmFsdWU6IDEwXHJcbiAgfSxcclxuICBpbmR1Y3RhbmNlU3RlcDoge1xyXG4gICAgdHlwZTogJ251bWJlcicsXHJcbiAgICBkZWZhdWx0VmFsdWU6IDAuMDAxXHJcbiAgfSxcclxuICBpbmR1Y3RhbmNlRGVmYXVsdDoge1xyXG4gICAgdHlwZTogJ251bWJlcicsXHJcbiAgICBkZWZhdWx0VmFsdWU6IDVcclxuICB9LFxyXG4gIGluZHVjdG9yTnVtYmVyRGVjaW1hbFBsYWNlczoge1xyXG4gICAgdHlwZTogJ251bWJlcicsXHJcbiAgICBkZWZhdWx0VmFsdWU6IDNcclxuICB9LFxyXG5cclxuICBjYXBhY2l0YW5jZU1pbjoge1xyXG4gICAgdHlwZTogJ251bWJlcicsXHJcbiAgICBkZWZhdWx0VmFsdWU6IDAuMDVcclxuICB9LFxyXG4gIGNhcGFjaXRhbmNlTWF4OiB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgIGRlZmF1bHRWYWx1ZTogMC4yXHJcbiAgfSxcclxuICBjYXBhY2l0YW5jZVN0ZXA6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiAwLjAxXHJcbiAgfSxcclxuICBjYXBhY2l0YW5jZURlZmF1bHQ6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiAwLjFcclxuICB9LFxyXG4gIGNhcGFjaXRvck51bWJlckRlY2ltYWxQbGFjZXM6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiAyXHJcbiAgfSxcclxuXHJcbiAgbWluRFQ6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiAxRS0zXHJcbiAgfSxcclxuICBzZWFyY2hUaW1lU3RlcDoge1xyXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgZGVmYXVsdFZhbHVlOiB0cnVlXHJcbiAgfSxcclxuXHJcbiAgY29kYXA6IHtcclxuICAgIHR5cGU6ICdmbGFnJ1xyXG4gIH1cclxufSApO1xyXG5cclxuY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbi5yZWdpc3RlciggJ0NDS0NRdWVyeVBhcmFtZXRlcnMnLCBDQ0tDUXVlcnlQYXJhbWV0ZXJzICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDQ0tDUXVlcnlQYXJhbWV0ZXJzOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSw0QkFBNEIsTUFBTSxtQ0FBbUM7QUFFNUUsTUFBTUMsbUJBQW1CLEdB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