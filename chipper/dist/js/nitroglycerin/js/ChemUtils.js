// Copyright 2013-2023, University of Colorado Boulder

/**
 * Miscellaneous chemistry functions.
 */

import nitroglycerin from './nitroglycerin.js';
const ChemUtils = {
  /**
   * Creates a symbol (HTML fragment) based on the list of atoms in the molecule.
   * The atoms must be specified in order of appearance in the symbol.
   * Examples:
   *    [C,C,H,H,H,H] becomes "C<sub>2</sub>H<sub>4</sub>"
   *    [H,H,O] becomes "H<sub>2</sub>O"
   */
  createSymbol: function (elements) {
    return ChemUtils.toSubscript(ChemUtils.createSymbolWithoutSubscripts(elements));
  },
  /**
   * Creates a symbol (text) based on the list of atoms in the molecule.
   * The atoms must be specified in order of appearance in the symbol.
   * Examples:
   *    [C,C,H,H,H,H] becomes "C2H4"
   *    [H,H,O] becomes "H2O"
   */
  createSymbolWithoutSubscripts: function (elements) {
    let result = '';
    let atomCount = 1;
    const length = elements.length;
    for (let i = 0; i < length; i++) {
      if (i === 0) {
        // first atom is treated differently
        result += elements[i].symbol;
      } else if (elements[i] === elements[i - 1]) {
        // this atom is the same as the previous atom
        atomCount++;
      } else {
        // this atom is NOT the same
        if (atomCount > 1) {
          // create a subscript
          result += atomCount;
        }
        atomCount = 1;
        result += elements[i].symbol;
      }
    }
    if (atomCount > 1) {
      // create a subscript for the final atom
      result += atomCount;
    }
    return result;
  },
  /**
   * Return an integer that can be used for sorting atom symbols alphabetically. Lower values will be returned for
   * symbols that should go first. Two-letter symbols will come after a one-letter symbol with the same first
   * character (Br after B). See http://en.wikipedia.org/wiki/Hill_system, for without carbon
   */
  nonCarbonHillSortValue: function (element) {
    // TODO: if it's a performance issue, we should put these in Element itself, https://github.com/phetsims/nitroglycerin/issues/14
    // yes, will totally fail if our Unicode code point of the 2nd character is >1000. Agile coding? We like to live on the edge
    let value = 1000 * element.symbol.charCodeAt(0);
    if (element.symbol.length > 1) {
      value += element.symbol.charCodeAt(1);
    }
    return value;
  },
  /**
   * Returns an integer that can be used for sorting atom symbols for the Hill system when the molecule contains
   * carbon. Lowest value is first. See http://en.wikipedia.org/wiki/Hill_system
   */
  carbonHillSortValue: function (element) {
    // TODO: if it's a performance issue, we should put these in Element itself, https://github.com/phetsims/nitroglycerin/issues/14
    if (element.isCarbon()) {
      return 0;
    } else if (element.isHydrogen()) {
      return 1;
    } else {
      return ChemUtils.nonCarbonHillSortValue(element);
    }
  },
  /**
   * Handles HTML subscript formatting for molecule symbols.
   * All numbers in a string are assumed to be part of a subscript, and will be enclosed in a <sub> tag.
   * For example, 'C2H4' becomes 'C<sub>2</sub>H<sub>4</sub>'.
   * @param inputString - the input plaintext string
   * @returns - the HTML fragment
   */
  toSubscript: function (inputString) {
    let outString = '';
    let sub = false; // are we in a <sub> tag?
    const isDigit = c => c >= '0' && c <= '9';
    for (let i = 0; i < inputString.length; i++) {
      const c = inputString.charAt(i);
      if (!sub && isDigit(c)) {
        // start the subscript tag when a digit is found
        outString += '<sub>';
        sub = true;
      } else if (sub && !isDigit(c)) {
        // end the subscript tag when a non-digit is found
        outString += '</sub>';
        sub = false;
      }
      outString += c;
    }

    // end the subscript tag if inputString ends with a digit
    if (sub) {
      outString += '</sub>';
      sub = false;
    }
    return outString;
  },
  /**
   * @param elements - a collection of elements in a molecule
   * @returns The molecular formula of the molecule in the Hill system. Returned as an HTML fragment.
   *          See http://en.wikipedia.org/wiki/Hill_system for more information.
   */
  hillOrderedSymbol: function (elements) {
    const containsCarbon = _.some(elements, element => element.isCarbon());
    const sortFunction = containsCarbon ? ChemUtils.carbonHillSortValue :
    // carbon first, then hydrogen, then others alphabetically
    ChemUtils.nonCarbonHillSortValue; // compare alphabetically since there is no carbon
    const sortedElements = _.sortBy(elements, sortFunction);
    return ChemUtils.createSymbol(sortedElements);
  }
};
nitroglycerin.register('ChemUtils', ChemUtils);
export default ChemUtils;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJuaXRyb2dseWNlcmluIiwiQ2hlbVV0aWxzIiwiY3JlYXRlU3ltYm9sIiwiZWxlbWVudHMiLCJ0b1N1YnNjcmlwdCIsImNyZWF0ZVN5bWJvbFdpdGhvdXRTdWJzY3JpcHRzIiwicmVzdWx0IiwiYXRvbUNvdW50IiwibGVuZ3RoIiwiaSIsInN5bWJvbCIsIm5vbkNhcmJvbkhpbGxTb3J0VmFsdWUiLCJlbGVtZW50IiwidmFsdWUiLCJjaGFyQ29kZUF0IiwiY2FyYm9uSGlsbFNvcnRWYWx1ZSIsImlzQ2FyYm9uIiwiaXNIeWRyb2dlbiIsImlucHV0U3RyaW5nIiwib3V0U3RyaW5nIiwic3ViIiwiaXNEaWdpdCIsImMiLCJjaGFyQXQiLCJoaWxsT3JkZXJlZFN5bWJvbCIsImNvbnRhaW5zQ2FyYm9uIiwiXyIsInNvbWUiLCJzb3J0RnVuY3Rpb24iLCJzb3J0ZWRFbGVtZW50cyIsInNvcnRCeSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ2hlbVV0aWxzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1pc2NlbGxhbmVvdXMgY2hlbWlzdHJ5IGZ1bmN0aW9ucy5cclxuICovXHJcblxyXG5pbXBvcnQgbml0cm9nbHljZXJpbiBmcm9tICcuL25pdHJvZ2x5Y2VyaW4uanMnO1xyXG5pbXBvcnQgRWxlbWVudCBmcm9tICcuL0VsZW1lbnQuanMnO1xyXG5cclxuY29uc3QgQ2hlbVV0aWxzID0ge1xyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgc3ltYm9sIChIVE1MIGZyYWdtZW50KSBiYXNlZCBvbiB0aGUgbGlzdCBvZiBhdG9tcyBpbiB0aGUgbW9sZWN1bGUuXHJcbiAgICogVGhlIGF0b21zIG11c3QgYmUgc3BlY2lmaWVkIGluIG9yZGVyIG9mIGFwcGVhcmFuY2UgaW4gdGhlIHN5bWJvbC5cclxuICAgKiBFeGFtcGxlczpcclxuICAgKiAgICBbQyxDLEgsSCxILEhdIGJlY29tZXMgXCJDPHN1Yj4yPC9zdWI+SDxzdWI+NDwvc3ViPlwiXHJcbiAgICogICAgW0gsSCxPXSBiZWNvbWVzIFwiSDxzdWI+Mjwvc3ViPk9cIlxyXG4gICAqL1xyXG4gIGNyZWF0ZVN5bWJvbDogZnVuY3Rpb24oIGVsZW1lbnRzOiBFbGVtZW50W10gKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBDaGVtVXRpbHMudG9TdWJzY3JpcHQoIENoZW1VdGlscy5jcmVhdGVTeW1ib2xXaXRob3V0U3Vic2NyaXB0cyggZWxlbWVudHMgKSApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBzeW1ib2wgKHRleHQpIGJhc2VkIG9uIHRoZSBsaXN0IG9mIGF0b21zIGluIHRoZSBtb2xlY3VsZS5cclxuICAgKiBUaGUgYXRvbXMgbXVzdCBiZSBzcGVjaWZpZWQgaW4gb3JkZXIgb2YgYXBwZWFyYW5jZSBpbiB0aGUgc3ltYm9sLlxyXG4gICAqIEV4YW1wbGVzOlxyXG4gICAqICAgIFtDLEMsSCxILEgsSF0gYmVjb21lcyBcIkMySDRcIlxyXG4gICAqICAgIFtILEgsT10gYmVjb21lcyBcIkgyT1wiXHJcbiAgICovXHJcbiAgY3JlYXRlU3ltYm9sV2l0aG91dFN1YnNjcmlwdHM6IGZ1bmN0aW9uKCBlbGVtZW50czogRWxlbWVudFtdICk6IHN0cmluZyB7XHJcbiAgICBsZXQgcmVzdWx0ID0gJyc7XHJcbiAgICBsZXQgYXRvbUNvdW50ID0gMTtcclxuICAgIGNvbnN0IGxlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpZiAoIGkgPT09IDAgKSB7XHJcbiAgICAgICAgLy8gZmlyc3QgYXRvbSBpcyB0cmVhdGVkIGRpZmZlcmVudGx5XHJcbiAgICAgICAgcmVzdWx0ICs9IGVsZW1lbnRzWyBpIF0uc3ltYm9sO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBlbGVtZW50c1sgaSBdID09PSBlbGVtZW50c1sgaSAtIDEgXSApIHtcclxuICAgICAgICAvLyB0aGlzIGF0b20gaXMgdGhlIHNhbWUgYXMgdGhlIHByZXZpb3VzIGF0b21cclxuICAgICAgICBhdG9tQ291bnQrKztcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICAvLyB0aGlzIGF0b20gaXMgTk9UIHRoZSBzYW1lXHJcbiAgICAgICAgaWYgKCBhdG9tQ291bnQgPiAxICkge1xyXG4gICAgICAgICAgLy8gY3JlYXRlIGEgc3Vic2NyaXB0XHJcbiAgICAgICAgICByZXN1bHQgKz0gYXRvbUNvdW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICBhdG9tQ291bnQgPSAxO1xyXG4gICAgICAgIHJlc3VsdCArPSBlbGVtZW50c1sgaSBdLnN5bWJvbDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKCBhdG9tQ291bnQgPiAxICkge1xyXG4gICAgICAvLyBjcmVhdGUgYSBzdWJzY3JpcHQgZm9yIHRoZSBmaW5hbCBhdG9tXHJcbiAgICAgIHJlc3VsdCArPSBhdG9tQ291bnQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybiBhbiBpbnRlZ2VyIHRoYXQgY2FuIGJlIHVzZWQgZm9yIHNvcnRpbmcgYXRvbSBzeW1ib2xzIGFscGhhYmV0aWNhbGx5LiBMb3dlciB2YWx1ZXMgd2lsbCBiZSByZXR1cm5lZCBmb3JcclxuICAgKiBzeW1ib2xzIHRoYXQgc2hvdWxkIGdvIGZpcnN0LiBUd28tbGV0dGVyIHN5bWJvbHMgd2lsbCBjb21lIGFmdGVyIGEgb25lLWxldHRlciBzeW1ib2wgd2l0aCB0aGUgc2FtZSBmaXJzdFxyXG4gICAqIGNoYXJhY3RlciAoQnIgYWZ0ZXIgQikuIFNlZSBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0hpbGxfc3lzdGVtLCBmb3Igd2l0aG91dCBjYXJib25cclxuICAgKi9cclxuICBub25DYXJib25IaWxsU29ydFZhbHVlOiBmdW5jdGlvbiggZWxlbWVudDogRWxlbWVudCApOiBudW1iZXIge1xyXG4gICAgLy8gVE9ETzogaWYgaXQncyBhIHBlcmZvcm1hbmNlIGlzc3VlLCB3ZSBzaG91bGQgcHV0IHRoZXNlIGluIEVsZW1lbnQgaXRzZWxmLCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbml0cm9nbHljZXJpbi9pc3N1ZXMvMTRcclxuICAgIC8vIHllcywgd2lsbCB0b3RhbGx5IGZhaWwgaWYgb3VyIFVuaWNvZGUgY29kZSBwb2ludCBvZiB0aGUgMm5kIGNoYXJhY3RlciBpcyA+MTAwMC4gQWdpbGUgY29kaW5nPyBXZSBsaWtlIHRvIGxpdmUgb24gdGhlIGVkZ2VcclxuICAgIGxldCB2YWx1ZSA9IDEwMDAgKiBlbGVtZW50LnN5bWJvbC5jaGFyQ29kZUF0KCAwICk7XHJcbiAgICBpZiAoIGVsZW1lbnQuc3ltYm9sLmxlbmd0aCA+IDEgKSB7XHJcbiAgICAgIHZhbHVlICs9IGVsZW1lbnQuc3ltYm9sLmNoYXJDb2RlQXQoIDEgKTtcclxuICAgIH1cclxuICAgIHJldHVybiB2YWx1ZTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIGludGVnZXIgdGhhdCBjYW4gYmUgdXNlZCBmb3Igc29ydGluZyBhdG9tIHN5bWJvbHMgZm9yIHRoZSBIaWxsIHN5c3RlbSB3aGVuIHRoZSBtb2xlY3VsZSBjb250YWluc1xyXG4gICAqIGNhcmJvbi4gTG93ZXN0IHZhbHVlIGlzIGZpcnN0LiBTZWUgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9IaWxsX3N5c3RlbVxyXG4gICAqL1xyXG4gIGNhcmJvbkhpbGxTb3J0VmFsdWU6IGZ1bmN0aW9uKCBlbGVtZW50OiBFbGVtZW50ICk6IG51bWJlciB7XHJcbiAgICAvLyBUT0RPOiBpZiBpdCdzIGEgcGVyZm9ybWFuY2UgaXNzdWUsIHdlIHNob3VsZCBwdXQgdGhlc2UgaW4gRWxlbWVudCBpdHNlbGYsIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9uaXRyb2dseWNlcmluL2lzc3Vlcy8xNFxyXG4gICAgaWYgKCBlbGVtZW50LmlzQ2FyYm9uKCkgKSB7XHJcbiAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGVsZW1lbnQuaXNIeWRyb2dlbigpICkge1xyXG4gICAgICByZXR1cm4gMTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gQ2hlbVV0aWxzLm5vbkNhcmJvbkhpbGxTb3J0VmFsdWUoIGVsZW1lbnQgKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBIYW5kbGVzIEhUTUwgc3Vic2NyaXB0IGZvcm1hdHRpbmcgZm9yIG1vbGVjdWxlIHN5bWJvbHMuXHJcbiAgICogQWxsIG51bWJlcnMgaW4gYSBzdHJpbmcgYXJlIGFzc3VtZWQgdG8gYmUgcGFydCBvZiBhIHN1YnNjcmlwdCwgYW5kIHdpbGwgYmUgZW5jbG9zZWQgaW4gYSA8c3ViPiB0YWcuXHJcbiAgICogRm9yIGV4YW1wbGUsICdDMkg0JyBiZWNvbWVzICdDPHN1Yj4yPC9zdWI+SDxzdWI+NDwvc3ViPicuXHJcbiAgICogQHBhcmFtIGlucHV0U3RyaW5nIC0gdGhlIGlucHV0IHBsYWludGV4dCBzdHJpbmdcclxuICAgKiBAcmV0dXJucyAtIHRoZSBIVE1MIGZyYWdtZW50XHJcbiAgICovXHJcbiAgdG9TdWJzY3JpcHQ6IGZ1bmN0aW9uKCBpbnB1dFN0cmluZzogc3RyaW5nICk6IHN0cmluZyB7XHJcbiAgICBsZXQgb3V0U3RyaW5nID0gJyc7XHJcbiAgICBsZXQgc3ViID0gZmFsc2U7IC8vIGFyZSB3ZSBpbiBhIDxzdWI+IHRhZz9cclxuICAgIGNvbnN0IGlzRGlnaXQgPSAoIGM6IHN0cmluZyApID0+ICggYyA+PSAnMCcgJiYgYyA8PSAnOScgKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGlucHV0U3RyaW5nLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBjID0gaW5wdXRTdHJpbmcuY2hhckF0KCBpICk7XHJcbiAgICAgIGlmICggIXN1YiAmJiBpc0RpZ2l0KCBjICkgKSB7XHJcblxyXG4gICAgICAgIC8vIHN0YXJ0IHRoZSBzdWJzY3JpcHQgdGFnIHdoZW4gYSBkaWdpdCBpcyBmb3VuZFxyXG4gICAgICAgIG91dFN0cmluZyArPSAnPHN1Yj4nO1xyXG4gICAgICAgIHN1YiA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHN1YiAmJiAhaXNEaWdpdCggYyApICkge1xyXG5cclxuICAgICAgICAvLyBlbmQgdGhlIHN1YnNjcmlwdCB0YWcgd2hlbiBhIG5vbi1kaWdpdCBpcyBmb3VuZFxyXG4gICAgICAgIG91dFN0cmluZyArPSAnPC9zdWI+JztcclxuICAgICAgICBzdWIgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICBvdXRTdHJpbmcgKz0gYztcclxuICAgIH1cclxuXHJcbiAgICAvLyBlbmQgdGhlIHN1YnNjcmlwdCB0YWcgaWYgaW5wdXRTdHJpbmcgZW5kcyB3aXRoIGEgZGlnaXRcclxuICAgIGlmICggc3ViICkge1xyXG4gICAgICBvdXRTdHJpbmcgKz0gJzwvc3ViPic7XHJcbiAgICAgIHN1YiA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG91dFN0cmluZztcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gZWxlbWVudHMgLSBhIGNvbGxlY3Rpb24gb2YgZWxlbWVudHMgaW4gYSBtb2xlY3VsZVxyXG4gICAqIEByZXR1cm5zIFRoZSBtb2xlY3VsYXIgZm9ybXVsYSBvZiB0aGUgbW9sZWN1bGUgaW4gdGhlIEhpbGwgc3lzdGVtLiBSZXR1cm5lZCBhcyBhbiBIVE1MIGZyYWdtZW50LlxyXG4gICAqICAgICAgICAgIFNlZSBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0hpbGxfc3lzdGVtIGZvciBtb3JlIGluZm9ybWF0aW9uLlxyXG4gICAqL1xyXG4gIGhpbGxPcmRlcmVkU3ltYm9sOiBmdW5jdGlvbiggZWxlbWVudHM6IEVsZW1lbnRbXSApOiBzdHJpbmcge1xyXG4gICAgY29uc3QgY29udGFpbnNDYXJib24gPSBfLnNvbWUoIGVsZW1lbnRzLCBlbGVtZW50ID0+IGVsZW1lbnQuaXNDYXJib24oKSApO1xyXG4gICAgY29uc3Qgc29ydEZ1bmN0aW9uID0gY29udGFpbnNDYXJib24gP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgQ2hlbVV0aWxzLmNhcmJvbkhpbGxTb3J0VmFsdWUgOiAgLy8gY2FyYm9uIGZpcnN0LCB0aGVuIGh5ZHJvZ2VuLCB0aGVuIG90aGVycyBhbHBoYWJldGljYWxseVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgQ2hlbVV0aWxzLm5vbkNhcmJvbkhpbGxTb3J0VmFsdWU7IC8vIGNvbXBhcmUgYWxwaGFiZXRpY2FsbHkgc2luY2UgdGhlcmUgaXMgbm8gY2FyYm9uXHJcbiAgICBjb25zdCBzb3J0ZWRFbGVtZW50cyA9IF8uc29ydEJ5KCBlbGVtZW50cywgc29ydEZ1bmN0aW9uICk7XHJcbiAgICByZXR1cm4gQ2hlbVV0aWxzLmNyZWF0ZVN5bWJvbCggc29ydGVkRWxlbWVudHMgKTtcclxuICB9XHJcbn07XHJcblxyXG5uaXRyb2dseWNlcmluLnJlZ2lzdGVyKCAnQ2hlbVV0aWxzJywgQ2hlbVV0aWxzICk7XHJcbmV4cG9ydCBkZWZhdWx0IENoZW1VdGlsczsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxhQUFhLE1BQU0sb0JBQW9CO0FBRzlDLE1BQU1DLFNBQVMsR0FBRztFQUVoQjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxZQUFZLEVBQUUsU0FBQUEsQ0FBVUMsUUFBbUIsRUFBVztJQUNwRCxPQUFPRixTQUFTLENBQUNHLFdBQVcsQ0FBRUgsU0FBUyxDQUFDSSw2QkFBNkIsQ0FBRUYsUUFBUyxDQUFFLENBQUM7RUFDckYsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VFLDZCQUE2QixFQUFFLFNBQUFBLENBQVVGLFFBQW1CLEVBQVc7SUFDckUsSUFBSUcsTUFBTSxHQUFHLEVBQUU7SUFDZixJQUFJQyxTQUFTLEdBQUcsQ0FBQztJQUNqQixNQUFNQyxNQUFNLEdBQUdMLFFBQVEsQ0FBQ0ssTUFBTTtJQUM5QixLQUFNLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR0QsTUFBTSxFQUFFQyxDQUFDLEVBQUUsRUFBRztNQUNqQyxJQUFLQSxDQUFDLEtBQUssQ0FBQyxFQUFHO1FBQ2I7UUFDQUgsTUFBTSxJQUFJSCxRQUFRLENBQUVNLENBQUMsQ0FBRSxDQUFDQyxNQUFNO01BQ2hDLENBQUMsTUFDSSxJQUFLUCxRQUFRLENBQUVNLENBQUMsQ0FBRSxLQUFLTixRQUFRLENBQUVNLENBQUMsR0FBRyxDQUFDLENBQUUsRUFBRztRQUM5QztRQUNBRixTQUFTLEVBQUU7TUFDYixDQUFDLE1BQ0k7UUFDSDtRQUNBLElBQUtBLFNBQVMsR0FBRyxDQUFDLEVBQUc7VUFDbkI7VUFDQUQsTUFBTSxJQUFJQyxTQUFTO1FBQ3JCO1FBQ0FBLFNBQVMsR0FBRyxDQUFDO1FBQ2JELE1BQU0sSUFBSUgsUUFBUSxDQUFFTSxDQUFDLENBQUUsQ0FBQ0MsTUFBTTtNQUNoQztJQUNGO0lBQ0EsSUFBS0gsU0FBUyxHQUFHLENBQUMsRUFBRztNQUNuQjtNQUNBRCxNQUFNLElBQUlDLFNBQVM7SUFDckI7SUFDQSxPQUFPRCxNQUFNO0VBQ2YsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUssc0JBQXNCLEVBQUUsU0FBQUEsQ0FBVUMsT0FBZ0IsRUFBVztJQUMzRDtJQUNBO0lBQ0EsSUFBSUMsS0FBSyxHQUFHLElBQUksR0FBR0QsT0FBTyxDQUFDRixNQUFNLENBQUNJLFVBQVUsQ0FBRSxDQUFFLENBQUM7SUFDakQsSUFBS0YsT0FBTyxDQUFDRixNQUFNLENBQUNGLE1BQU0sR0FBRyxDQUFDLEVBQUc7TUFDL0JLLEtBQUssSUFBSUQsT0FBTyxDQUFDRixNQUFNLENBQUNJLFVBQVUsQ0FBRSxDQUFFLENBQUM7SUFDekM7SUFDQSxPQUFPRCxLQUFLO0VBQ2QsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VFLG1CQUFtQixFQUFFLFNBQUFBLENBQVVILE9BQWdCLEVBQVc7SUFDeEQ7SUFDQSxJQUFLQSxPQUFPLENBQUNJLFFBQVEsQ0FBQyxDQUFDLEVBQUc7TUFDeEIsT0FBTyxDQUFDO0lBQ1YsQ0FBQyxNQUNJLElBQUtKLE9BQU8sQ0FBQ0ssVUFBVSxDQUFDLENBQUMsRUFBRztNQUMvQixPQUFPLENBQUM7SUFDVixDQUFDLE1BQ0k7TUFDSCxPQUFPaEIsU0FBUyxDQUFDVSxzQkFBc0IsQ0FBRUMsT0FBUSxDQUFDO0lBQ3BEO0VBQ0YsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VSLFdBQVcsRUFBRSxTQUFBQSxDQUFVYyxXQUFtQixFQUFXO0lBQ25ELElBQUlDLFNBQVMsR0FBRyxFQUFFO0lBQ2xCLElBQUlDLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQztJQUNqQixNQUFNQyxPQUFPLEdBQUtDLENBQVMsSUFBUUEsQ0FBQyxJQUFJLEdBQUcsSUFBSUEsQ0FBQyxJQUFJLEdBQUs7SUFDekQsS0FBTSxJQUFJYixDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdTLFdBQVcsQ0FBQ1YsTUFBTSxFQUFFQyxDQUFDLEVBQUUsRUFBRztNQUM3QyxNQUFNYSxDQUFDLEdBQUdKLFdBQVcsQ0FBQ0ssTUFBTSxDQUFFZCxDQUFFLENBQUM7TUFDakMsSUFBSyxDQUFDVyxHQUFHLElBQUlDLE9BQU8sQ0FBRUMsQ0FBRSxDQUFDLEVBQUc7UUFFMUI7UUFDQUgsU0FBUyxJQUFJLE9BQU87UUFDcEJDLEdBQUcsR0FBRyxJQUFJO01BQ1osQ0FBQyxNQUNJLElBQUtBLEdBQUcsSUFBSSxDQUFDQyxPQUFPLENBQUVDLENBQUUsQ0FBQyxFQUFHO1FBRS9CO1FBQ0FILFNBQVMsSUFBSSxRQUFRO1FBQ3JCQyxHQUFHLEdBQUcsS0FBSztNQUNiO01BQ0FELFNBQVMsSUFBSUcsQ0FBQztJQUNoQjs7SUFFQTtJQUNBLElBQUtGLEdBQUcsRUFBRztNQUNURCxTQUFTLElBQUksUUFBUTtNQUNyQkMsR0FBRyxHQUFHLEtBQUs7SUFDYjtJQUNBLE9BQU9ELFNBQVM7RUFDbEIsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUssaUJBQWlCLEVBQUUsU0FBQUEsQ0FBVXJCLFFBQW1CLEVBQVc7SUFDekQsTUFBTXNCLGNBQWMsR0FBR0MsQ0FBQyxDQUFDQyxJQUFJLENBQUV4QixRQUFRLEVBQUVTLE9BQU8sSUFBSUEsT0FBTyxDQUFDSSxRQUFRLENBQUMsQ0FBRSxDQUFDO0lBQ3hFLE1BQU1ZLFlBQVksR0FBR0gsY0FBYyxHQUNkeEIsU0FBUyxDQUFDYyxtQkFBbUI7SUFBSTtJQUNqQ2QsU0FBUyxDQUFDVSxzQkFBc0IsQ0FBQyxDQUFDO0lBQ3ZELE1BQU1rQixjQUFjLEdBQUdILENBQUMsQ0FBQ0ksTUFBTSxDQUFFM0IsUUFBUSxFQUFFeUIsWUFBYSxDQUFDO0lBQ3pELE9BQU8zQixTQUFTLENBQUNDLFlBQVksQ0FBRTJCLGNBQWUsQ0FBQztFQUNqRDtBQUNGLENBQUM7QUFFRDdCLGFBQWEsQ0FBQytCLFFBQVEsQ0FBRSxXQUFXLEVBQUU5QixTQUFVLENBQUM7QUFDaEQsZUFBZUEsU0FBUyJ9