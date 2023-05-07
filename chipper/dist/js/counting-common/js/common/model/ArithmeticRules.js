// Copyright 2021-2022, University of Colorado Boulder

/**
 * Logic for determining whether numbers can be added together, and how numbers should be split apart.
 *
 * @author Sharfudeen Ashraf
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import countingCommon from '../../countingCommon.js';
import CountingCommonUtils from '../CountingCommonUtils.js';
class ArithmeticRules {
  /**
   * Whether the two numbers can be added together.
   */
  static canAddNumbers(a, b) {
    // Don't allow carrying "past" the 10s, 100s or 1000s place.
    return a % 1000 + b % 1000 <= 1000 && a % 100 + b % 100 <= 100 && a % 10 + b % 10 <= 10 && (a <= 10 || b <= 10 || a + b >= 100 || a % 10 === 0 || b % 10 === 0 || (a + b) % 10 !== 0);
  }

  /**
   * Determines how much of a number can be pulled off at a specific place in the number.
   *
   * e.g.:
   * - If our number is 102, and our pulledPlace is 0 (mouse at the 2), it will pull 2 off.
   * - If our number is 102, and our pulledPlace is 2 (mouse at the 1), it will pull 100 off.
   *
   * @param numberValue - Numeric value that could potentially be pulled apart.
   * @param pulledPlace - Index in number where the user dragged. 0 is the 1s place, 1 is the 10s place, 2
   *                 is the 100s place, and 3 is the 1000s place.
   * @returns - How much to remove from numberValue (0 indicates can't be pulled off)
   */
  static pullApartNumbers(numberValue, pulledPlace) {
    if (numberValue <= 1) {
      return 0;
    }

    // Find the minimum place (0: singles, 1: doubles, etc.) where we can pull off from
    let minimumPlace = 0;
    for (let i = 1; i < 3; i++) {
      const power = Math.pow(10, i);
      if (numberValue % power === 0 && numberValue > power) {
        minimumPlace = i;
      }
    }

    // How many places are on the number?
    const maximumPlace = CountingCommonUtils.digitsInNumber(numberValue) - 1;

    // Grab the place we'll try to remove from.
    const place = Math.max(minimumPlace, pulledPlace);
    let amountToRemove;
    if (place === maximumPlace) {
      amountToRemove = Math.pow(10, place);
    } else {
      amountToRemove = numberValue % Math.pow(10, place + 1);
    }
    if (amountToRemove === 0) {
      amountToRemove = Math.pow(10, place);
    }
    if (amountToRemove === numberValue) {
      amountToRemove = Math.pow(10, place - 1);
    }
    return amountToRemove;
  }
}
countingCommon.register('ArithmeticRules', ArithmeticRules);
export default ArithmeticRules;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb3VudGluZ0NvbW1vbiIsIkNvdW50aW5nQ29tbW9uVXRpbHMiLCJBcml0aG1ldGljUnVsZXMiLCJjYW5BZGROdW1iZXJzIiwiYSIsImIiLCJwdWxsQXBhcnROdW1iZXJzIiwibnVtYmVyVmFsdWUiLCJwdWxsZWRQbGFjZSIsIm1pbmltdW1QbGFjZSIsImkiLCJwb3dlciIsIk1hdGgiLCJwb3ciLCJtYXhpbXVtUGxhY2UiLCJkaWdpdHNJbk51bWJlciIsInBsYWNlIiwibWF4IiwiYW1vdW50VG9SZW1vdmUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkFyaXRobWV0aWNSdWxlcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBMb2dpYyBmb3IgZGV0ZXJtaW5pbmcgd2hldGhlciBudW1iZXJzIGNhbiBiZSBhZGRlZCB0b2dldGhlciwgYW5kIGhvdyBudW1iZXJzIHNob3VsZCBiZSBzcGxpdCBhcGFydC5cclxuICpcclxuICogQGF1dGhvciBTaGFyZnVkZWVuIEFzaHJhZlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IGNvdW50aW5nQ29tbW9uIGZyb20gJy4uLy4uL2NvdW50aW5nQ29tbW9uLmpzJztcclxuaW1wb3J0IENvdW50aW5nQ29tbW9uVXRpbHMgZnJvbSAnLi4vQ291bnRpbmdDb21tb25VdGlscy5qcyc7XHJcblxyXG5jbGFzcyBBcml0aG1ldGljUnVsZXMge1xyXG4gIC8qKlxyXG4gICAqIFdoZXRoZXIgdGhlIHR3byBudW1iZXJzIGNhbiBiZSBhZGRlZCB0b2dldGhlci5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGNhbkFkZE51bWJlcnMoIGE6IG51bWJlciwgYjogbnVtYmVyICk6IGJvb2xlYW4ge1xyXG5cclxuICAgIC8vIERvbid0IGFsbG93IGNhcnJ5aW5nIFwicGFzdFwiIHRoZSAxMHMsIDEwMHMgb3IgMTAwMHMgcGxhY2UuXHJcbiAgICByZXR1cm4gKCBhICUgMTAwMCApICsgKCBiICUgMTAwMCApIDw9IDEwMDAgJiZcclxuICAgICAgICAgICAoIGEgJSAxMDAgKSArICggYiAlIDEwMCApIDw9IDEwMCAmJlxyXG4gICAgICAgICAgICggYSAlIDEwICkgKyAoIGIgJSAxMCApIDw9IDEwICYmXHJcbiAgICAgICAgICAgKCBhIDw9IDEwIHx8IGIgPD0gMTAgfHwgYSArIGIgPj0gMTAwIHx8IGEgJSAxMCA9PT0gMCB8fCBiICUgMTAgPT09IDAgfHwgKCBhICsgYiApICUgMTAgIT09IDAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgaG93IG11Y2ggb2YgYSBudW1iZXIgY2FuIGJlIHB1bGxlZCBvZmYgYXQgYSBzcGVjaWZpYyBwbGFjZSBpbiB0aGUgbnVtYmVyLlxyXG4gICAqXHJcbiAgICogZS5nLjpcclxuICAgKiAtIElmIG91ciBudW1iZXIgaXMgMTAyLCBhbmQgb3VyIHB1bGxlZFBsYWNlIGlzIDAgKG1vdXNlIGF0IHRoZSAyKSwgaXQgd2lsbCBwdWxsIDIgb2ZmLlxyXG4gICAqIC0gSWYgb3VyIG51bWJlciBpcyAxMDIsIGFuZCBvdXIgcHVsbGVkUGxhY2UgaXMgMiAobW91c2UgYXQgdGhlIDEpLCBpdCB3aWxsIHB1bGwgMTAwIG9mZi5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBudW1iZXJWYWx1ZSAtIE51bWVyaWMgdmFsdWUgdGhhdCBjb3VsZCBwb3RlbnRpYWxseSBiZSBwdWxsZWQgYXBhcnQuXHJcbiAgICogQHBhcmFtIHB1bGxlZFBsYWNlIC0gSW5kZXggaW4gbnVtYmVyIHdoZXJlIHRoZSB1c2VyIGRyYWdnZWQuIDAgaXMgdGhlIDFzIHBsYWNlLCAxIGlzIHRoZSAxMHMgcGxhY2UsIDJcclxuICAgKiAgICAgICAgICAgICAgICAgaXMgdGhlIDEwMHMgcGxhY2UsIGFuZCAzIGlzIHRoZSAxMDAwcyBwbGFjZS5cclxuICAgKiBAcmV0dXJucyAtIEhvdyBtdWNoIHRvIHJlbW92ZSBmcm9tIG51bWJlclZhbHVlICgwIGluZGljYXRlcyBjYW4ndCBiZSBwdWxsZWQgb2ZmKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgcHVsbEFwYXJ0TnVtYmVycyggbnVtYmVyVmFsdWU6IG51bWJlciwgcHVsbGVkUGxhY2U6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgaWYgKCBudW1iZXJWYWx1ZSA8PSAxICkge1xyXG4gICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGaW5kIHRoZSBtaW5pbXVtIHBsYWNlICgwOiBzaW5nbGVzLCAxOiBkb3VibGVzLCBldGMuKSB3aGVyZSB3ZSBjYW4gcHVsbCBvZmYgZnJvbVxyXG4gICAgbGV0IG1pbmltdW1QbGFjZSA9IDA7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPCAzOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHBvd2VyID0gTWF0aC5wb3coIDEwLCBpICk7XHJcbiAgICAgIGlmICggbnVtYmVyVmFsdWUgJSBwb3dlciA9PT0gMCAmJiBudW1iZXJWYWx1ZSA+IHBvd2VyICkge1xyXG4gICAgICAgIG1pbmltdW1QbGFjZSA9IGk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBIb3cgbWFueSBwbGFjZXMgYXJlIG9uIHRoZSBudW1iZXI/XHJcbiAgICBjb25zdCBtYXhpbXVtUGxhY2UgPSBDb3VudGluZ0NvbW1vblV0aWxzLmRpZ2l0c0luTnVtYmVyKCBudW1iZXJWYWx1ZSApIC0gMTtcclxuXHJcbiAgICAvLyBHcmFiIHRoZSBwbGFjZSB3ZSdsbCB0cnkgdG8gcmVtb3ZlIGZyb20uXHJcbiAgICBjb25zdCBwbGFjZSA9IE1hdGgubWF4KCBtaW5pbXVtUGxhY2UsIHB1bGxlZFBsYWNlICk7XHJcblxyXG4gICAgbGV0IGFtb3VudFRvUmVtb3ZlO1xyXG4gICAgaWYgKCBwbGFjZSA9PT0gbWF4aW11bVBsYWNlICkge1xyXG4gICAgICBhbW91bnRUb1JlbW92ZSA9IE1hdGgucG93KCAxMCwgcGxhY2UgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBhbW91bnRUb1JlbW92ZSA9IG51bWJlclZhbHVlICUgTWF0aC5wb3coIDEwLCBwbGFjZSArIDEgKTtcclxuICAgIH1cclxuICAgIGlmICggYW1vdW50VG9SZW1vdmUgPT09IDAgKSB7XHJcbiAgICAgIGFtb3VudFRvUmVtb3ZlID0gTWF0aC5wb3coIDEwLCBwbGFjZSApO1xyXG4gICAgfVxyXG4gICAgaWYgKCBhbW91bnRUb1JlbW92ZSA9PT0gbnVtYmVyVmFsdWUgKSB7XHJcbiAgICAgIGFtb3VudFRvUmVtb3ZlID0gTWF0aC5wb3coIDEwLCBwbGFjZSAtIDEgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYW1vdW50VG9SZW1vdmU7XHJcbiAgfVxyXG59XHJcblxyXG5jb3VudGluZ0NvbW1vbi5yZWdpc3RlciggJ0FyaXRobWV0aWNSdWxlcycsIEFyaXRobWV0aWNSdWxlcyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQXJpdGhtZXRpY1J1bGVzO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxjQUFjLE1BQU0seUJBQXlCO0FBQ3BELE9BQU9DLG1CQUFtQixNQUFNLDJCQUEyQjtBQUUzRCxNQUFNQyxlQUFlLENBQUM7RUFDcEI7QUFDRjtBQUNBO0VBQ0UsT0FBY0MsYUFBYUEsQ0FBRUMsQ0FBUyxFQUFFQyxDQUFTLEVBQVk7SUFFM0Q7SUFDQSxPQUFTRCxDQUFDLEdBQUcsSUFBSSxHQUFPQyxDQUFDLEdBQUcsSUFBTSxJQUFJLElBQUksSUFDakNELENBQUMsR0FBRyxHQUFHLEdBQU9DLENBQUMsR0FBRyxHQUFLLElBQUksR0FBRyxJQUM5QkQsQ0FBQyxHQUFHLEVBQUUsR0FBT0MsQ0FBQyxHQUFHLEVBQUksSUFBSSxFQUFFLEtBQzNCRCxDQUFDLElBQUksRUFBRSxJQUFJQyxDQUFDLElBQUksRUFBRSxJQUFJRCxDQUFDLEdBQUdDLENBQUMsSUFBSSxHQUFHLElBQUlELENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFFRCxDQUFDLEdBQUdDLENBQUMsSUFBSyxFQUFFLEtBQUssQ0FBQyxDQUFFO0VBQ3ZHOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLE9BQWNDLGdCQUFnQkEsQ0FBRUMsV0FBbUIsRUFBRUMsV0FBbUIsRUFBVztJQUNqRixJQUFLRCxXQUFXLElBQUksQ0FBQyxFQUFHO01BQ3RCLE9BQU8sQ0FBQztJQUNWOztJQUVBO0lBQ0EsSUFBSUUsWUFBWSxHQUFHLENBQUM7SUFDcEIsS0FBTSxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEVBQUUsRUFBRztNQUM1QixNQUFNQyxLQUFLLEdBQUdDLElBQUksQ0FBQ0MsR0FBRyxDQUFFLEVBQUUsRUFBRUgsQ0FBRSxDQUFDO01BQy9CLElBQUtILFdBQVcsR0FBR0ksS0FBSyxLQUFLLENBQUMsSUFBSUosV0FBVyxHQUFHSSxLQUFLLEVBQUc7UUFDdERGLFlBQVksR0FBR0MsQ0FBQztNQUNsQjtJQUNGOztJQUVBO0lBQ0EsTUFBTUksWUFBWSxHQUFHYixtQkFBbUIsQ0FBQ2MsY0FBYyxDQUFFUixXQUFZLENBQUMsR0FBRyxDQUFDOztJQUUxRTtJQUNBLE1BQU1TLEtBQUssR0FBR0osSUFBSSxDQUFDSyxHQUFHLENBQUVSLFlBQVksRUFBRUQsV0FBWSxDQUFDO0lBRW5ELElBQUlVLGNBQWM7SUFDbEIsSUFBS0YsS0FBSyxLQUFLRixZQUFZLEVBQUc7TUFDNUJJLGNBQWMsR0FBR04sSUFBSSxDQUFDQyxHQUFHLENBQUUsRUFBRSxFQUFFRyxLQUFNLENBQUM7SUFDeEMsQ0FBQyxNQUNJO01BQ0hFLGNBQWMsR0FBR1gsV0FBVyxHQUFHSyxJQUFJLENBQUNDLEdBQUcsQ0FBRSxFQUFFLEVBQUVHLEtBQUssR0FBRyxDQUFFLENBQUM7SUFDMUQ7SUFDQSxJQUFLRSxjQUFjLEtBQUssQ0FBQyxFQUFHO01BQzFCQSxjQUFjLEdBQUdOLElBQUksQ0FBQ0MsR0FBRyxDQUFFLEVBQUUsRUFBRUcsS0FBTSxDQUFDO0lBQ3hDO0lBQ0EsSUFBS0UsY0FBYyxLQUFLWCxXQUFXLEVBQUc7TUFDcENXLGNBQWMsR0FBR04sSUFBSSxDQUFDQyxHQUFHLENBQUUsRUFBRSxFQUFFRyxLQUFLLEdBQUcsQ0FBRSxDQUFDO0lBQzVDO0lBRUEsT0FBT0UsY0FBYztFQUN2QjtBQUNGO0FBRUFsQixjQUFjLENBQUNtQixRQUFRLENBQUUsaUJBQWlCLEVBQUVqQixlQUFnQixDQUFDO0FBRTdELGVBQWVBLGVBQWUifQ==