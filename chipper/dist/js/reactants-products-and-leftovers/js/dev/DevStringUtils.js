// Copyright 2014-2023, University of Colorado Boulder

/**
 * Collection of static string utilities used for development.
 * Some of this began its life as toString functions associated with various types.
 * But it's a decent chunk of code, and very development-specific, so it was consolidated here.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import reactantsProductsAndLeftovers from '../reactantsProductsAndLeftovers.js';
const DevStringUtils = {
  /**
   * String representation of a reaction equation, with HTML stripped out.
   */
  equationString(reaction) {
    let s = '';
    // reactants
    for (let i = 0; i < reaction.reactants.length; i++) {
      if (i !== 0) {
        s += '+ ';
      }
      s += `${reaction.reactants[i].coefficientProperty.value} ${reaction.reactants[i].symbol} `;
    }
    // right arrow
    s += '\u2192 ';
    // products
    for (let i = 0; i < reaction.products.length; i++) {
      if (i !== 0) {
        s += '+ ';
      }
      s += `${reaction.products[i].coefficientProperty.value} ${reaction.products[i].symbol}`;
      if (i < reaction.products.length - 1) {
        s += ' ';
      }
    }
    return s.replace(/<sub>/g, '').replace(/<\/sub>/g, '');
  },
  /**
   * String representation of quantities for reactants, products and leftovers.
   * Example: 4,1 -> 1,2,2,0
   */
  quantitiesString(reaction) {
    let s = '';
    let i = 0;
    // reactants
    for (i = 0; i < reaction.reactants.length; i++) {
      if (i !== 0) {
        s += ',';
      }
      s += reaction.reactants[i].quantityProperty.value;
    }
    // right arrow
    s += ' \u2192 ';
    // products
    for (i = 0; i < reaction.products.length; i++) {
      if (i !== 0) {
        s += ',';
      }
      s += reaction.products[i].quantityProperty.value;
    }
    // leftovers
    for (i = 0; i < reaction.leftovers.length; i++) {
      s += ',';
      s += reaction.leftovers[i].quantityProperty.value;
    }
    return s;
  },
  /**
   * String representation of a reaction, including quantities.
   * Example: 2H2 + 1O2 -> 2H2O : 2,2 -> 2,0,1
   */
  reactionString(reaction) {
    return `${DevStringUtils.equationString(reaction)} : ${DevStringUtils.quantitiesString(reaction)}`;
  }
};
reactantsProductsAndLeftovers.register('DevStringUtils', DevStringUtils);
export default DevStringUtils;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJyZWFjdGFudHNQcm9kdWN0c0FuZExlZnRvdmVycyIsIkRldlN0cmluZ1V0aWxzIiwiZXF1YXRpb25TdHJpbmciLCJyZWFjdGlvbiIsInMiLCJpIiwicmVhY3RhbnRzIiwibGVuZ3RoIiwiY29lZmZpY2llbnRQcm9wZXJ0eSIsInZhbHVlIiwic3ltYm9sIiwicHJvZHVjdHMiLCJyZXBsYWNlIiwicXVhbnRpdGllc1N0cmluZyIsInF1YW50aXR5UHJvcGVydHkiLCJsZWZ0b3ZlcnMiLCJyZWFjdGlvblN0cmluZyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRGV2U3RyaW5nVXRpbHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29sbGVjdGlvbiBvZiBzdGF0aWMgc3RyaW5nIHV0aWxpdGllcyB1c2VkIGZvciBkZXZlbG9wbWVudC5cclxuICogU29tZSBvZiB0aGlzIGJlZ2FuIGl0cyBsaWZlIGFzIHRvU3RyaW5nIGZ1bmN0aW9ucyBhc3NvY2lhdGVkIHdpdGggdmFyaW91cyB0eXBlcy5cclxuICogQnV0IGl0J3MgYSBkZWNlbnQgY2h1bmsgb2YgY29kZSwgYW5kIHZlcnkgZGV2ZWxvcG1lbnQtc3BlY2lmaWMsIHNvIGl0IHdhcyBjb25zb2xpZGF0ZWQgaGVyZS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUmVhY3Rpb24gZnJvbSAnLi4vY29tbW9uL21vZGVsL1JlYWN0aW9uLmpzJztcclxuaW1wb3J0IHJlYWN0YW50c1Byb2R1Y3RzQW5kTGVmdG92ZXJzIGZyb20gJy4uL3JlYWN0YW50c1Byb2R1Y3RzQW5kTGVmdG92ZXJzLmpzJztcclxuXHJcbmNvbnN0IERldlN0cmluZ1V0aWxzID0ge1xyXG5cclxuICAvKipcclxuICAgKiBTdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSByZWFjdGlvbiBlcXVhdGlvbiwgd2l0aCBIVE1MIHN0cmlwcGVkIG91dC5cclxuICAgKi9cclxuICBlcXVhdGlvblN0cmluZyggcmVhY3Rpb246IFJlYWN0aW9uICk6IHN0cmluZyB7XHJcbiAgICBsZXQgcyA9ICcnO1xyXG4gICAgLy8gcmVhY3RhbnRzXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCByZWFjdGlvbi5yZWFjdGFudHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGlmICggaSAhPT0gMCApIHsgcyArPSAnKyAnOyB9XHJcbiAgICAgIHMgKz0gKCBgJHtyZWFjdGlvbi5yZWFjdGFudHNbIGkgXS5jb2VmZmljaWVudFByb3BlcnR5LnZhbHVlfSAke3JlYWN0aW9uLnJlYWN0YW50c1sgaSBdLnN5bWJvbH0gYCApO1xyXG4gICAgfVxyXG4gICAgLy8gcmlnaHQgYXJyb3dcclxuICAgIHMgKz0gJ1xcdTIxOTIgJztcclxuICAgIC8vIHByb2R1Y3RzXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCByZWFjdGlvbi5wcm9kdWN0cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgaWYgKCBpICE9PSAwICkgeyBzICs9ICcrICc7IH1cclxuICAgICAgcyArPSAoIGAke3JlYWN0aW9uLnByb2R1Y3RzWyBpIF0uY29lZmZpY2llbnRQcm9wZXJ0eS52YWx1ZX0gJHtyZWFjdGlvbi5wcm9kdWN0c1sgaSBdLnN5bWJvbH1gICk7XHJcbiAgICAgIGlmICggaSA8IHJlYWN0aW9uLnByb2R1Y3RzLmxlbmd0aCAtIDEgKSB7XHJcbiAgICAgICAgcyArPSAnICc7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBzLnJlcGxhY2UoIC88c3ViPi9nLCAnJyApLnJlcGxhY2UoIC88XFwvc3ViPi9nLCAnJyApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBxdWFudGl0aWVzIGZvciByZWFjdGFudHMsIHByb2R1Y3RzIGFuZCBsZWZ0b3ZlcnMuXHJcbiAgICogRXhhbXBsZTogNCwxIC0+IDEsMiwyLDBcclxuICAgKi9cclxuICBxdWFudGl0aWVzU3RyaW5nKCByZWFjdGlvbjogUmVhY3Rpb24gKTogc3RyaW5nIHtcclxuICAgIGxldCBzID0gJyc7XHJcbiAgICBsZXQgaSA9IDA7XHJcbiAgICAvLyByZWFjdGFudHNcclxuICAgIGZvciAoIGkgPSAwOyBpIDwgcmVhY3Rpb24ucmVhY3RhbnRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpZiAoIGkgIT09IDAgKSB7IHMgKz0gJywnOyB9XHJcbiAgICAgIHMgKz0gcmVhY3Rpb24ucmVhY3RhbnRzWyBpIF0ucXVhbnRpdHlQcm9wZXJ0eS52YWx1ZTtcclxuICAgIH1cclxuICAgIC8vIHJpZ2h0IGFycm93XHJcbiAgICBzICs9ICcgXFx1MjE5MiAnO1xyXG4gICAgLy8gcHJvZHVjdHNcclxuICAgIGZvciAoIGkgPSAwOyBpIDwgcmVhY3Rpb24ucHJvZHVjdHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGlmICggaSAhPT0gMCApIHsgcyArPSAnLCc7IH1cclxuICAgICAgcyArPSByZWFjdGlvbi5wcm9kdWN0c1sgaSBdLnF1YW50aXR5UHJvcGVydHkudmFsdWU7XHJcbiAgICB9XHJcbiAgICAvLyBsZWZ0b3ZlcnNcclxuICAgIGZvciAoIGkgPSAwOyBpIDwgcmVhY3Rpb24ubGVmdG92ZXJzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBzICs9ICcsJztcclxuICAgICAgcyArPSByZWFjdGlvbi5sZWZ0b3ZlcnNbIGkgXS5xdWFudGl0eVByb3BlcnR5LnZhbHVlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHM7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogU3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgcmVhY3Rpb24sIGluY2x1ZGluZyBxdWFudGl0aWVzLlxyXG4gICAqIEV4YW1wbGU6IDJIMiArIDFPMiAtPiAySDJPIDogMiwyIC0+IDIsMCwxXHJcbiAgICovXHJcbiAgcmVhY3Rpb25TdHJpbmcoIHJlYWN0aW9uOiBSZWFjdGlvbiApOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGAke0RldlN0cmluZ1V0aWxzLmVxdWF0aW9uU3RyaW5nKCByZWFjdGlvbiApfSA6ICR7RGV2U3RyaW5nVXRpbHMucXVhbnRpdGllc1N0cmluZyggcmVhY3Rpb24gKX1gO1xyXG4gIH1cclxufTtcclxuXHJcbnJlYWN0YW50c1Byb2R1Y3RzQW5kTGVmdG92ZXJzLnJlZ2lzdGVyKCAnRGV2U3RyaW5nVXRpbHMnLCBEZXZTdHJpbmdVdGlscyApO1xyXG5leHBvcnQgZGVmYXVsdCBEZXZTdHJpbmdVdGlsczsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLDZCQUE2QixNQUFNLHFDQUFxQztBQUUvRSxNQUFNQyxjQUFjLEdBQUc7RUFFckI7QUFDRjtBQUNBO0VBQ0VDLGNBQWNBLENBQUVDLFFBQWtCLEVBQVc7SUFDM0MsSUFBSUMsQ0FBQyxHQUFHLEVBQUU7SUFDVjtJQUNBLEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHRixRQUFRLENBQUNHLFNBQVMsQ0FBQ0MsTUFBTSxFQUFFRixDQUFDLEVBQUUsRUFBRztNQUNwRCxJQUFLQSxDQUFDLEtBQUssQ0FBQyxFQUFHO1FBQUVELENBQUMsSUFBSSxJQUFJO01BQUU7TUFDNUJBLENBQUMsSUFBTyxHQUFFRCxRQUFRLENBQUNHLFNBQVMsQ0FBRUQsQ0FBQyxDQUFFLENBQUNHLG1CQUFtQixDQUFDQyxLQUFNLElBQUdOLFFBQVEsQ0FBQ0csU0FBUyxDQUFFRCxDQUFDLENBQUUsQ0FBQ0ssTUFBTyxHQUFJO0lBQ3BHO0lBQ0E7SUFDQU4sQ0FBQyxJQUFJLFNBQVM7SUFDZDtJQUNBLEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHRixRQUFRLENBQUNRLFFBQVEsQ0FBQ0osTUFBTSxFQUFFRixDQUFDLEVBQUUsRUFBRztNQUNuRCxJQUFLQSxDQUFDLEtBQUssQ0FBQyxFQUFHO1FBQUVELENBQUMsSUFBSSxJQUFJO01BQUU7TUFDNUJBLENBQUMsSUFBTyxHQUFFRCxRQUFRLENBQUNRLFFBQVEsQ0FBRU4sQ0FBQyxDQUFFLENBQUNHLG1CQUFtQixDQUFDQyxLQUFNLElBQUdOLFFBQVEsQ0FBQ1EsUUFBUSxDQUFFTixDQUFDLENBQUUsQ0FBQ0ssTUFBTyxFQUFHO01BQy9GLElBQUtMLENBQUMsR0FBR0YsUUFBUSxDQUFDUSxRQUFRLENBQUNKLE1BQU0sR0FBRyxDQUFDLEVBQUc7UUFDdENILENBQUMsSUFBSSxHQUFHO01BQ1Y7SUFDRjtJQUNBLE9BQU9BLENBQUMsQ0FBQ1EsT0FBTyxDQUFFLFFBQVEsRUFBRSxFQUFHLENBQUMsQ0FBQ0EsT0FBTyxDQUFFLFVBQVUsRUFBRSxFQUFHLENBQUM7RUFDNUQsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VDLGdCQUFnQkEsQ0FBRVYsUUFBa0IsRUFBVztJQUM3QyxJQUFJQyxDQUFDLEdBQUcsRUFBRTtJQUNWLElBQUlDLENBQUMsR0FBRyxDQUFDO0lBQ1Q7SUFDQSxLQUFNQSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdGLFFBQVEsQ0FBQ0csU0FBUyxDQUFDQyxNQUFNLEVBQUVGLENBQUMsRUFBRSxFQUFHO01BQ2hELElBQUtBLENBQUMsS0FBSyxDQUFDLEVBQUc7UUFBRUQsQ0FBQyxJQUFJLEdBQUc7TUFBRTtNQUMzQkEsQ0FBQyxJQUFJRCxRQUFRLENBQUNHLFNBQVMsQ0FBRUQsQ0FBQyxDQUFFLENBQUNTLGdCQUFnQixDQUFDTCxLQUFLO0lBQ3JEO0lBQ0E7SUFDQUwsQ0FBQyxJQUFJLFVBQVU7SUFDZjtJQUNBLEtBQU1DLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR0YsUUFBUSxDQUFDUSxRQUFRLENBQUNKLE1BQU0sRUFBRUYsQ0FBQyxFQUFFLEVBQUc7TUFDL0MsSUFBS0EsQ0FBQyxLQUFLLENBQUMsRUFBRztRQUFFRCxDQUFDLElBQUksR0FBRztNQUFFO01BQzNCQSxDQUFDLElBQUlELFFBQVEsQ0FBQ1EsUUFBUSxDQUFFTixDQUFDLENBQUUsQ0FBQ1MsZ0JBQWdCLENBQUNMLEtBQUs7SUFDcEQ7SUFDQTtJQUNBLEtBQU1KLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR0YsUUFBUSxDQUFDWSxTQUFTLENBQUNSLE1BQU0sRUFBRUYsQ0FBQyxFQUFFLEVBQUc7TUFDaERELENBQUMsSUFBSSxHQUFHO01BQ1JBLENBQUMsSUFBSUQsUUFBUSxDQUFDWSxTQUFTLENBQUVWLENBQUMsQ0FBRSxDQUFDUyxnQkFBZ0IsQ0FBQ0wsS0FBSztJQUNyRDtJQUNBLE9BQU9MLENBQUM7RUFDVixDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7RUFDRVksY0FBY0EsQ0FBRWIsUUFBa0IsRUFBVztJQUMzQyxPQUFRLEdBQUVGLGNBQWMsQ0FBQ0MsY0FBYyxDQUFFQyxRQUFTLENBQUUsTUFBS0YsY0FBYyxDQUFDWSxnQkFBZ0IsQ0FBRVYsUUFBUyxDQUFFLEVBQUM7RUFDeEc7QUFDRixDQUFDO0FBRURILDZCQUE2QixDQUFDaUIsUUFBUSxDQUFFLGdCQUFnQixFQUFFaEIsY0FBZSxDQUFDO0FBQzFFLGVBQWVBLGNBQWMifQ==