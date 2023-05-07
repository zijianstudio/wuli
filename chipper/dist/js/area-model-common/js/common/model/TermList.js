// Copyright 2017-2021, University of Colorado Boulder

/**
 * An ordered list of terms.  Note that throughout the simulation, to represent a "no terms" we use null instead
 * of TermList([]).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import areaModelCommon from '../../areaModelCommon.js';
class TermList {
  /**
   * @param {Array.<Term>} terms
   */
  constructor(terms) {
    // @public {Array.<Term>}
    this.terms = terms;
  }

  /**
   * Addition of term lists.
   * @public
   *
   * @param {TermList} termList
   * @returns {TermList}
   */
  plus(termList) {
    return new TermList(this.terms.concat(termList.terms));
  }

  /**
   * Multiplication of term lists.
   * @public
   *
   * @param {TermList} termList
   * @returns {TermList}
   */
  times(termList) {
    return new TermList(_.flatten(this.terms.map(term => termList.terms.map(otherTerm => term.times(otherTerm)))));
  }

  /**
   * Returns a new TermList, (stable) sorted by the exponent.
   * @public
   *
   * @returns {TermList}
   */
  orderedByExponent() {
    return new TermList(_.sortBy(this.terms, term => -term.power));
  }

  /**
   * Returns whether any of the terms have a negative coefficient.
   * @public
   *
   * @returns {boolean}
   */
  hasNegativeTerm() {
    return _.some(this.terms, term => term.coefficient < 0);
  }

  /**
   * Returns a string suitable for RichText
   * @public
   *
   * @returns {string}
   */
  toRichString() {
    return this.terms.map((term, index) => term.toRichString(index > 0)).join('');
  }

  /**
   * Equality for just whether the terms are the same (so a TermList can be compared to a Polynomial and be equal
   * despite being different types.)  Note that Polynomial orders the terms so this order-dependent check will still
   * work.
   * @public
   *
   * @param {TermList} termList
   */
  equals(termList) {
    if (this.terms.length !== termList.terms.length) {
      return false;
    }

    // This uses a reverse search instead of a forward search for optimization--probably not important for Area Model,
    // but optimized in case it is moved to common code.
    for (let i = this.terms.length - 1; i >= 0; i--) {
      if (!this.terms[i].equals(termList.terms[i])) {
        return false;
      }
    }
    return true;
  }
}
areaModelCommon.register('TermList', TermList);
export default TermList;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhcmVhTW9kZWxDb21tb24iLCJUZXJtTGlzdCIsImNvbnN0cnVjdG9yIiwidGVybXMiLCJwbHVzIiwidGVybUxpc3QiLCJjb25jYXQiLCJ0aW1lcyIsIl8iLCJmbGF0dGVuIiwibWFwIiwidGVybSIsIm90aGVyVGVybSIsIm9yZGVyZWRCeUV4cG9uZW50Iiwic29ydEJ5IiwicG93ZXIiLCJoYXNOZWdhdGl2ZVRlcm0iLCJzb21lIiwiY29lZmZpY2llbnQiLCJ0b1JpY2hTdHJpbmciLCJpbmRleCIsImpvaW4iLCJlcXVhbHMiLCJsZW5ndGgiLCJpIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJUZXJtTGlzdC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBbiBvcmRlcmVkIGxpc3Qgb2YgdGVybXMuICBOb3RlIHRoYXQgdGhyb3VnaG91dCB0aGUgc2ltdWxhdGlvbiwgdG8gcmVwcmVzZW50IGEgXCJubyB0ZXJtc1wiIHdlIHVzZSBudWxsIGluc3RlYWRcclxuICogb2YgVGVybUxpc3QoW10pLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IGFyZWFNb2RlbENvbW1vbiBmcm9tICcuLi8uLi9hcmVhTW9kZWxDb21tb24uanMnO1xyXG5cclxuY2xhc3MgVGVybUxpc3Qge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPFRlcm0+fSB0ZXJtc1xyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB0ZXJtcyApIHtcclxuXHJcbiAgICAvLyBAcHVibGljIHtBcnJheS48VGVybT59XHJcbiAgICB0aGlzLnRlcm1zID0gdGVybXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGRpdGlvbiBvZiB0ZXJtIGxpc3RzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VGVybUxpc3R9IHRlcm1MaXN0XHJcbiAgICogQHJldHVybnMge1Rlcm1MaXN0fVxyXG4gICAqL1xyXG4gIHBsdXMoIHRlcm1MaXN0ICkge1xyXG4gICAgcmV0dXJuIG5ldyBUZXJtTGlzdCggdGhpcy50ZXJtcy5jb25jYXQoIHRlcm1MaXN0LnRlcm1zICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE11bHRpcGxpY2F0aW9uIG9mIHRlcm0gbGlzdHMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtUZXJtTGlzdH0gdGVybUxpc3RcclxuICAgKiBAcmV0dXJucyB7VGVybUxpc3R9XHJcbiAgICovXHJcbiAgdGltZXMoIHRlcm1MaXN0ICkge1xyXG4gICAgcmV0dXJuIG5ldyBUZXJtTGlzdCggXy5mbGF0dGVuKCB0aGlzLnRlcm1zLm1hcCggdGVybSA9PiB0ZXJtTGlzdC50ZXJtcy5tYXAoIG90aGVyVGVybSA9PiB0ZXJtLnRpbWVzKCBvdGhlclRlcm0gKSApICkgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIG5ldyBUZXJtTGlzdCwgKHN0YWJsZSkgc29ydGVkIGJ5IHRoZSBleHBvbmVudC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7VGVybUxpc3R9XHJcbiAgICovXHJcbiAgb3JkZXJlZEJ5RXhwb25lbnQoKSB7XHJcbiAgICByZXR1cm4gbmV3IFRlcm1MaXN0KCBfLnNvcnRCeSggdGhpcy50ZXJtcywgdGVybSA9PiAtdGVybS5wb3dlciApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgYW55IG9mIHRoZSB0ZXJtcyBoYXZlIGEgbmVnYXRpdmUgY29lZmZpY2llbnQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaGFzTmVnYXRpdmVUZXJtKCkge1xyXG4gICAgcmV0dXJuIF8uc29tZSggdGhpcy50ZXJtcywgdGVybSA9PiB0ZXJtLmNvZWZmaWNpZW50IDwgMCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHN0cmluZyBzdWl0YWJsZSBmb3IgUmljaFRleHRcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIHRvUmljaFN0cmluZygpIHtcclxuICAgIHJldHVybiB0aGlzLnRlcm1zLm1hcCggKCB0ZXJtLCBpbmRleCApID0+IHRlcm0udG9SaWNoU3RyaW5nKCBpbmRleCA+IDAgKSApLmpvaW4oICcnICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBFcXVhbGl0eSBmb3IganVzdCB3aGV0aGVyIHRoZSB0ZXJtcyBhcmUgdGhlIHNhbWUgKHNvIGEgVGVybUxpc3QgY2FuIGJlIGNvbXBhcmVkIHRvIGEgUG9seW5vbWlhbCBhbmQgYmUgZXF1YWxcclxuICAgKiBkZXNwaXRlIGJlaW5nIGRpZmZlcmVudCB0eXBlcy4pICBOb3RlIHRoYXQgUG9seW5vbWlhbCBvcmRlcnMgdGhlIHRlcm1zIHNvIHRoaXMgb3JkZXItZGVwZW5kZW50IGNoZWNrIHdpbGwgc3RpbGxcclxuICAgKiB3b3JrLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VGVybUxpc3R9IHRlcm1MaXN0XHJcbiAgICovXHJcbiAgZXF1YWxzKCB0ZXJtTGlzdCApIHtcclxuICAgIGlmICggdGhpcy50ZXJtcy5sZW5ndGggIT09IHRlcm1MaXN0LnRlcm1zLmxlbmd0aCApIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRoaXMgdXNlcyBhIHJldmVyc2Ugc2VhcmNoIGluc3RlYWQgb2YgYSBmb3J3YXJkIHNlYXJjaCBmb3Igb3B0aW1pemF0aW9uLS1wcm9iYWJseSBub3QgaW1wb3J0YW50IGZvciBBcmVhIE1vZGVsLFxyXG4gICAgLy8gYnV0IG9wdGltaXplZCBpbiBjYXNlIGl0IGlzIG1vdmVkIHRvIGNvbW1vbiBjb2RlLlxyXG4gICAgZm9yICggbGV0IGkgPSB0aGlzLnRlcm1zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xyXG4gICAgICBpZiAoICF0aGlzLnRlcm1zWyBpIF0uZXF1YWxzKCB0ZXJtTGlzdC50ZXJtc1sgaSBdICkgKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG59XHJcblxyXG5hcmVhTW9kZWxDb21tb24ucmVnaXN0ZXIoICdUZXJtTGlzdCcsIFRlcm1MaXN0ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUZXJtTGlzdDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sMEJBQTBCO0FBRXRELE1BQU1DLFFBQVEsQ0FBQztFQUNiO0FBQ0Y7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxLQUFLLEVBQUc7SUFFbkI7SUFDQSxJQUFJLENBQUNBLEtBQUssR0FBR0EsS0FBSztFQUNwQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFQyxJQUFJQSxDQUFFQyxRQUFRLEVBQUc7SUFDZixPQUFPLElBQUlKLFFBQVEsQ0FBRSxJQUFJLENBQUNFLEtBQUssQ0FBQ0csTUFBTSxDQUFFRCxRQUFRLENBQUNGLEtBQU0sQ0FBRSxDQUFDO0VBQzVEOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VJLEtBQUtBLENBQUVGLFFBQVEsRUFBRztJQUNoQixPQUFPLElBQUlKLFFBQVEsQ0FBRU8sQ0FBQyxDQUFDQyxPQUFPLENBQUUsSUFBSSxDQUFDTixLQUFLLENBQUNPLEdBQUcsQ0FBRUMsSUFBSSxJQUFJTixRQUFRLENBQUNGLEtBQUssQ0FBQ08sR0FBRyxDQUFFRSxTQUFTLElBQUlELElBQUksQ0FBQ0osS0FBSyxDQUFFSyxTQUFVLENBQUUsQ0FBRSxDQUFFLENBQUUsQ0FBQztFQUMxSDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsaUJBQWlCQSxDQUFBLEVBQUc7SUFDbEIsT0FBTyxJQUFJWixRQUFRLENBQUVPLENBQUMsQ0FBQ00sTUFBTSxDQUFFLElBQUksQ0FBQ1gsS0FBSyxFQUFFUSxJQUFJLElBQUksQ0FBQ0EsSUFBSSxDQUFDSSxLQUFNLENBQUUsQ0FBQztFQUNwRTs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsZUFBZUEsQ0FBQSxFQUFHO0lBQ2hCLE9BQU9SLENBQUMsQ0FBQ1MsSUFBSSxDQUFFLElBQUksQ0FBQ2QsS0FBSyxFQUFFUSxJQUFJLElBQUlBLElBQUksQ0FBQ08sV0FBVyxHQUFHLENBQUUsQ0FBQztFQUMzRDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsWUFBWUEsQ0FBQSxFQUFHO0lBQ2IsT0FBTyxJQUFJLENBQUNoQixLQUFLLENBQUNPLEdBQUcsQ0FBRSxDQUFFQyxJQUFJLEVBQUVTLEtBQUssS0FBTVQsSUFBSSxDQUFDUSxZQUFZLENBQUVDLEtBQUssR0FBRyxDQUFFLENBQUUsQ0FBQyxDQUFDQyxJQUFJLENBQUUsRUFBRyxDQUFDO0VBQ3ZGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsTUFBTUEsQ0FBRWpCLFFBQVEsRUFBRztJQUNqQixJQUFLLElBQUksQ0FBQ0YsS0FBSyxDQUFDb0IsTUFBTSxLQUFLbEIsUUFBUSxDQUFDRixLQUFLLENBQUNvQixNQUFNLEVBQUc7TUFDakQsT0FBTyxLQUFLO0lBQ2Q7O0lBRUE7SUFDQTtJQUNBLEtBQU0sSUFBSUMsQ0FBQyxHQUFHLElBQUksQ0FBQ3JCLEtBQUssQ0FBQ29CLE1BQU0sR0FBRyxDQUFDLEVBQUVDLENBQUMsSUFBSSxDQUFDLEVBQUVBLENBQUMsRUFBRSxFQUFHO01BQ2pELElBQUssQ0FBQyxJQUFJLENBQUNyQixLQUFLLENBQUVxQixDQUFDLENBQUUsQ0FBQ0YsTUFBTSxDQUFFakIsUUFBUSxDQUFDRixLQUFLLENBQUVxQixDQUFDLENBQUcsQ0FBQyxFQUFHO1FBQ3BELE9BQU8sS0FBSztNQUNkO0lBQ0Y7SUFFQSxPQUFPLElBQUk7RUFDYjtBQUNGO0FBRUF4QixlQUFlLENBQUN5QixRQUFRLENBQUUsVUFBVSxFQUFFeEIsUUFBUyxDQUFDO0FBRWhELGVBQWVBLFFBQVEifQ==