// Copyright 2017-2023, University of Colorado Boulder

/**
 * Displays cost with an optional 3rd decimal place.
 * The specifications from https://github.com/phetsims/unit-rates/issues/44 are:
 *
 * - Third decimal is gray
 * - If cost has fewer than 3 decimals, then 3rd decimal is not displayed
 * - If 3rd decimal is not displayed, it still takes up space, so that cost value doesn't shift around
 * - Cost is truncated (not rounded) to 3 decimals (e.g. $1.2349 becomes $1.234)
 */

import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import URUtils from '../../common/URUtils.js';
import unitRates from '../../unitRates.js';
import UnitRatesStrings from '../../UnitRatesStrings.js';
export default class CostNode extends Node {
  /**
   * @param {Property.<number>} costProperty
   * @param {Object} [options]
   */
  constructor(costProperty, options) {
    options = merge({
      extraDecimalVisible: false,
      // {boolean} is the extra decimal place visible?
      font: new PhetFont(20),
      // {Font} font for all parts of the value
      extraDecimalColor: 'gray' // {Color|string} color of the extra decimal place
    }, options);
    super();

    // dollar sign (or other currency symbol)
    // always to the left of the value on the scale, see https://github.com/phetsims/unit-rates/issues/176
    const dollarSignNode = new Text(UnitRatesStrings.dollarSign, {
      font: options.font
    });
    this.addChild(dollarSignNode);

    // the primary part of the value, without the extra decimal place
    const primaryNode = new Text('', {
      font: options.font
    });
    this.addChild(primaryNode);

    // the extra decimal place
    const extraDecimalNode = new Text('', {
      font: options.font,
      fill: options.extraDecimalColor
    });
    if (options.extraDecimalVisible) {
      this.addChild(extraDecimalNode);
    }

    // When cost changes, update the displayed value
    const costObserver = cost => {
      assert && assert(cost >= 0, `negative cost not supported: ${cost}`);
      const visibleDecimalPlaces = 3;

      // First round to a large number of decimal places, in an attempt to identify floating point error.
      // For example, Javascript computes 3 * 0.4 as 1.2000000000000002.
      // This determines whether the cost has relevant non-zero decimal places,
      // and therefore whether the extra decimal place should be visible.
      // See https://github.com/phetsims/unit-rates/issues/202
      const costRounded = Utils.toFixedNumber(cost, 10);
      extraDecimalNode.visible = URUtils.decimalPlaces(costRounded) >= visibleDecimalPlaces;
      if (options.extraDecimalVisible && extraDecimalNode.visible) {
        // Truncate to the number of decimal places that we're interested in.
        // This determines the cost value that is displayed.
        const powerOfTen = Math.pow(10, visibleDecimalPlaces);
        const costTruncated = Math.floor(cost * powerOfTen) / powerOfTen;

        // convert to string, then pick it apart
        const costString = URUtils.numberToString(costTruncated, visibleDecimalPlaces, false /* trimZeros */);
        primaryNode.string = costString.substring(0, costString.length - 1);
        extraDecimalNode.string = costString.substring(costString.length - 1, costString.length);
      } else {
        primaryNode.string = URUtils.numberToString(cost, 2, false /* trimZeros */);
        extraDecimalNode.string = '0'; // will be invisible, but needs a valid digit for layout purposes
      }

      // adjust layout
      primaryNode.left = dollarSignNode.right + 1;
      primaryNode.y = dollarSignNode.y;
      extraDecimalNode.left = primaryNode.right + 1;
      extraDecimalNode.y = primaryNode.y;
    };
    costProperty.link(costObserver); // unlink in dispose

    // @private
    this.disposeCostNode = () => {
      costProperty.unlink(costObserver);
    };
    this.mutate(options);
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeCostNode();
    super.dispose();
  }
}
unitRates.register('CostNode', CostNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIm1lcmdlIiwiUGhldEZvbnQiLCJOb2RlIiwiVGV4dCIsIlVSVXRpbHMiLCJ1bml0UmF0ZXMiLCJVbml0UmF0ZXNTdHJpbmdzIiwiQ29zdE5vZGUiLCJjb25zdHJ1Y3RvciIsImNvc3RQcm9wZXJ0eSIsIm9wdGlvbnMiLCJleHRyYURlY2ltYWxWaXNpYmxlIiwiZm9udCIsImV4dHJhRGVjaW1hbENvbG9yIiwiZG9sbGFyU2lnbk5vZGUiLCJkb2xsYXJTaWduIiwiYWRkQ2hpbGQiLCJwcmltYXJ5Tm9kZSIsImV4dHJhRGVjaW1hbE5vZGUiLCJmaWxsIiwiY29zdE9ic2VydmVyIiwiY29zdCIsImFzc2VydCIsInZpc2libGVEZWNpbWFsUGxhY2VzIiwiY29zdFJvdW5kZWQiLCJ0b0ZpeGVkTnVtYmVyIiwidmlzaWJsZSIsImRlY2ltYWxQbGFjZXMiLCJwb3dlck9mVGVuIiwiTWF0aCIsInBvdyIsImNvc3RUcnVuY2F0ZWQiLCJmbG9vciIsImNvc3RTdHJpbmciLCJudW1iZXJUb1N0cmluZyIsInN0cmluZyIsInN1YnN0cmluZyIsImxlbmd0aCIsImxlZnQiLCJyaWdodCIsInkiLCJsaW5rIiwiZGlzcG9zZUNvc3ROb2RlIiwidW5saW5rIiwibXV0YXRlIiwiZGlzcG9zZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ29zdE5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRGlzcGxheXMgY29zdCB3aXRoIGFuIG9wdGlvbmFsIDNyZCBkZWNpbWFsIHBsYWNlLlxyXG4gKiBUaGUgc3BlY2lmaWNhdGlvbnMgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdW5pdC1yYXRlcy9pc3N1ZXMvNDQgYXJlOlxyXG4gKlxyXG4gKiAtIFRoaXJkIGRlY2ltYWwgaXMgZ3JheVxyXG4gKiAtIElmIGNvc3QgaGFzIGZld2VyIHRoYW4gMyBkZWNpbWFscywgdGhlbiAzcmQgZGVjaW1hbCBpcyBub3QgZGlzcGxheWVkXHJcbiAqIC0gSWYgM3JkIGRlY2ltYWwgaXMgbm90IGRpc3BsYXllZCwgaXQgc3RpbGwgdGFrZXMgdXAgc3BhY2UsIHNvIHRoYXQgY29zdCB2YWx1ZSBkb2Vzbid0IHNoaWZ0IGFyb3VuZFxyXG4gKiAtIENvc3QgaXMgdHJ1bmNhdGVkIChub3Qgcm91bmRlZCkgdG8gMyBkZWNpbWFscyAoZS5nLiAkMS4yMzQ5IGJlY29tZXMgJDEuMjM0KVxyXG4gKi9cclxuXHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVVJVdGlscyBmcm9tICcuLi8uLi9jb21tb24vVVJVdGlscy5qcyc7XHJcbmltcG9ydCB1bml0UmF0ZXMgZnJvbSAnLi4vLi4vdW5pdFJhdGVzLmpzJztcclxuaW1wb3J0IFVuaXRSYXRlc1N0cmluZ3MgZnJvbSAnLi4vLi4vVW5pdFJhdGVzU3RyaW5ncy5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb3N0Tm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxudW1iZXI+fSBjb3N0UHJvcGVydHlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGNvc3RQcm9wZXJ0eSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgZXh0cmFEZWNpbWFsVmlzaWJsZTogZmFsc2UsIC8vIHtib29sZWFufSBpcyB0aGUgZXh0cmEgZGVjaW1hbCBwbGFjZSB2aXNpYmxlP1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDIwICksIC8vIHtGb250fSBmb250IGZvciBhbGwgcGFydHMgb2YgdGhlIHZhbHVlXHJcbiAgICAgIGV4dHJhRGVjaW1hbENvbG9yOiAnZ3JheScgLy8ge0NvbG9yfHN0cmluZ30gY29sb3Igb2YgdGhlIGV4dHJhIGRlY2ltYWwgcGxhY2VcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIGRvbGxhciBzaWduIChvciBvdGhlciBjdXJyZW5jeSBzeW1ib2wpXHJcbiAgICAvLyBhbHdheXMgdG8gdGhlIGxlZnQgb2YgdGhlIHZhbHVlIG9uIHRoZSBzY2FsZSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy91bml0LXJhdGVzL2lzc3Vlcy8xNzZcclxuICAgIGNvbnN0IGRvbGxhclNpZ25Ob2RlID0gbmV3IFRleHQoIFVuaXRSYXRlc1N0cmluZ3MuZG9sbGFyU2lnbiwge1xyXG4gICAgICBmb250OiBvcHRpb25zLmZvbnRcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGRvbGxhclNpZ25Ob2RlICk7XHJcblxyXG4gICAgLy8gdGhlIHByaW1hcnkgcGFydCBvZiB0aGUgdmFsdWUsIHdpdGhvdXQgdGhlIGV4dHJhIGRlY2ltYWwgcGxhY2VcclxuICAgIGNvbnN0IHByaW1hcnlOb2RlID0gbmV3IFRleHQoICcnLCB7XHJcbiAgICAgIGZvbnQ6IG9wdGlvbnMuZm9udFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcHJpbWFyeU5vZGUgKTtcclxuXHJcbiAgICAvLyB0aGUgZXh0cmEgZGVjaW1hbCBwbGFjZVxyXG4gICAgY29uc3QgZXh0cmFEZWNpbWFsTm9kZSA9IG5ldyBUZXh0KCAnJywge1xyXG4gICAgICBmb250OiBvcHRpb25zLmZvbnQsXHJcbiAgICAgIGZpbGw6IG9wdGlvbnMuZXh0cmFEZWNpbWFsQ29sb3JcclxuICAgIH0gKTtcclxuICAgIGlmICggb3B0aW9ucy5leHRyYURlY2ltYWxWaXNpYmxlICkge1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCBleHRyYURlY2ltYWxOb2RlICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gV2hlbiBjb3N0IGNoYW5nZXMsIHVwZGF0ZSB0aGUgZGlzcGxheWVkIHZhbHVlXHJcbiAgICBjb25zdCBjb3N0T2JzZXJ2ZXIgPSBjb3N0ID0+IHtcclxuXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvc3QgPj0gMCwgYG5lZ2F0aXZlIGNvc3Qgbm90IHN1cHBvcnRlZDogJHtjb3N0fWAgKTtcclxuXHJcbiAgICAgIGNvbnN0IHZpc2libGVEZWNpbWFsUGxhY2VzID0gMztcclxuXHJcbiAgICAgIC8vIEZpcnN0IHJvdW5kIHRvIGEgbGFyZ2UgbnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzLCBpbiBhbiBhdHRlbXB0IHRvIGlkZW50aWZ5IGZsb2F0aW5nIHBvaW50IGVycm9yLlxyXG4gICAgICAvLyBGb3IgZXhhbXBsZSwgSmF2YXNjcmlwdCBjb21wdXRlcyAzICogMC40IGFzIDEuMjAwMDAwMDAwMDAwMDAwMi5cclxuICAgICAgLy8gVGhpcyBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGNvc3QgaGFzIHJlbGV2YW50IG5vbi16ZXJvIGRlY2ltYWwgcGxhY2VzLFxyXG4gICAgICAvLyBhbmQgdGhlcmVmb3JlIHdoZXRoZXIgdGhlIGV4dHJhIGRlY2ltYWwgcGxhY2Ugc2hvdWxkIGJlIHZpc2libGUuXHJcbiAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdW5pdC1yYXRlcy9pc3N1ZXMvMjAyXHJcbiAgICAgIGNvbnN0IGNvc3RSb3VuZGVkID0gVXRpbHMudG9GaXhlZE51bWJlciggY29zdCwgMTAgKTtcclxuICAgICAgZXh0cmFEZWNpbWFsTm9kZS52aXNpYmxlID0gKCBVUlV0aWxzLmRlY2ltYWxQbGFjZXMoIGNvc3RSb3VuZGVkICkgPj0gdmlzaWJsZURlY2ltYWxQbGFjZXMgKTtcclxuXHJcbiAgICAgIGlmICggb3B0aW9ucy5leHRyYURlY2ltYWxWaXNpYmxlICYmIGV4dHJhRGVjaW1hbE5vZGUudmlzaWJsZSApIHtcclxuXHJcbiAgICAgICAgLy8gVHJ1bmNhdGUgdG8gdGhlIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyB0aGF0IHdlJ3JlIGludGVyZXN0ZWQgaW4uXHJcbiAgICAgICAgLy8gVGhpcyBkZXRlcm1pbmVzIHRoZSBjb3N0IHZhbHVlIHRoYXQgaXMgZGlzcGxheWVkLlxyXG4gICAgICAgIGNvbnN0IHBvd2VyT2ZUZW4gPSBNYXRoLnBvdyggMTAsIHZpc2libGVEZWNpbWFsUGxhY2VzICk7XHJcbiAgICAgICAgY29uc3QgY29zdFRydW5jYXRlZCA9IE1hdGguZmxvb3IoIGNvc3QgKiBwb3dlck9mVGVuICkgLyBwb3dlck9mVGVuO1xyXG5cclxuICAgICAgICAvLyBjb252ZXJ0IHRvIHN0cmluZywgdGhlbiBwaWNrIGl0IGFwYXJ0XHJcbiAgICAgICAgY29uc3QgY29zdFN0cmluZyA9IFVSVXRpbHMubnVtYmVyVG9TdHJpbmcoIGNvc3RUcnVuY2F0ZWQsIHZpc2libGVEZWNpbWFsUGxhY2VzLCBmYWxzZSAvKiB0cmltWmVyb3MgKi8gKTtcclxuICAgICAgICBwcmltYXJ5Tm9kZS5zdHJpbmcgPSBjb3N0U3RyaW5nLnN1YnN0cmluZyggMCwgY29zdFN0cmluZy5sZW5ndGggLSAxICk7XHJcbiAgICAgICAgZXh0cmFEZWNpbWFsTm9kZS5zdHJpbmcgPSBjb3N0U3RyaW5nLnN1YnN0cmluZyggY29zdFN0cmluZy5sZW5ndGggLSAxLCBjb3N0U3RyaW5nLmxlbmd0aCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHByaW1hcnlOb2RlLnN0cmluZyA9IFVSVXRpbHMubnVtYmVyVG9TdHJpbmcoIGNvc3QsIDIsIGZhbHNlIC8qIHRyaW1aZXJvcyAqLyApO1xyXG4gICAgICAgIGV4dHJhRGVjaW1hbE5vZGUuc3RyaW5nID0gJzAnOyAvLyB3aWxsIGJlIGludmlzaWJsZSwgYnV0IG5lZWRzIGEgdmFsaWQgZGlnaXQgZm9yIGxheW91dCBwdXJwb3Nlc1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBhZGp1c3QgbGF5b3V0XHJcbiAgICAgIHByaW1hcnlOb2RlLmxlZnQgPSBkb2xsYXJTaWduTm9kZS5yaWdodCArIDE7XHJcbiAgICAgIHByaW1hcnlOb2RlLnkgPSBkb2xsYXJTaWduTm9kZS55O1xyXG4gICAgICBleHRyYURlY2ltYWxOb2RlLmxlZnQgPSBwcmltYXJ5Tm9kZS5yaWdodCArIDE7XHJcbiAgICAgIGV4dHJhRGVjaW1hbE5vZGUueSA9IHByaW1hcnlOb2RlLnk7XHJcbiAgICB9O1xyXG4gICAgY29zdFByb3BlcnR5LmxpbmsoIGNvc3RPYnNlcnZlciApOyAvLyB1bmxpbmsgaW4gZGlzcG9zZVxyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLmRpc3Bvc2VDb3N0Tm9kZSA9ICgpID0+IHtcclxuICAgICAgY29zdFByb3BlcnR5LnVubGluayggY29zdE9ic2VydmVyICk7XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHRoaXMuZGlzcG9zZUNvc3ROb2RlKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG51bml0UmF0ZXMucmVnaXN0ZXIoICdDb3N0Tm9kZScsIENvc3ROb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FB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