// Copyright 2014-2022, University of Colorado Boulder

/**
 * ConcentrationBarNode is a bar in the 'Equilibrium Concentration' graph.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Rectangle, RichText } from '../../../../scenery/js/imports.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import acidBaseSolutions from '../../acidBaseSolutions.js';
import AcidBaseSolutionsStrings from '../../AcidBaseSolutionsStrings.js';

// constants
const FONT = new PhetFont(12);
export default class ConcentrationBarNode extends Node {
  // Concentration value associated with this bar. This is a Property for PhET-iO.

  constructor(maxBarHeight, tandem) {
    const concentrationProperty = new Property(0, {
      units: 'mol/L',
      tandem: tandem.createTandem('concentrationProperty'),
      phetioValueType: NullableIO(NumberIO),
      phetioReadOnly: true,
      phetioDocumentation: 'Concentration associated with this bar. null if the bar is not relevant for the selected solution.'
    });

    // add rectangle to represent concentration
    const bar = new Rectangle(0, 0, 25, 0, {
      fill: 'white'
    });
    bar.rotate(Math.PI); // so that bar grows upward

    // Set the bar height
    concentrationProperty.link(concentration => {
      if (concentration === null) {
        bar.setRectHeight(0);
      } else {
        const barHeight = Math.abs(Utils.log10(concentration) + 8) * maxBarHeight / 10;
        if (isFinite(barHeight)) {
          bar.setRectHeight(barHeight);
        } else {
          bar.setRectHeight(0);
        }
      }
    });

    // Text for concentration value, typically in scientific notation.
    const textTandem = tandem.createTandem('text');
    const stringProperty = new DerivedProperty([concentrationProperty], concentration => concentrationToString(concentration), {
      tandem: textTandem.createTandem(RichText.STRING_PROPERTY_TANDEM_NAME),
      phetioValueType: StringIO
    });
    const text = new RichText(stringProperty, {
      font: FONT,
      maxWidth: 0.85 * maxBarHeight,
      rotation: -Math.PI / 2,
      // vertical
      tandem: textTandem
    });
    Multilink.multilink([bar.boundsProperty, text.boundsProperty], () => {
      text.centerX = bar.centerX;
      text.bottom = bar.bottom - 6;
    });
    super({
      children: [bar, text],
      tandem: tandem,
      visiblePropertyOptions: {
        phetioReadOnly: true
      }
    });
    this.concentrationProperty = concentrationProperty;
    this.bar = bar;
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }

  /**
   * Sets the fill color of the bar.
   */
  setBarFill(color) {
    this.bar.setFill(color);
  }
}
function concentrationToString(concentration) {
  let string;
  if (concentration === null) {
    string = 'null';
  } else if (concentration < 1e-13) {
    string = AcidBaseSolutionsStrings.negligibleStringProperty.value;
  } else if (concentration <= 1) {
    // find power of 10
    let pow = Math.floor(Utils.log10(concentration));

    // find value
    concentration = concentration * Math.pow(10, -pow);

    // show 10.00 as 1.00 x 10
    if (Math.abs(concentration - 10) < 1e-2) {
      pow++;
      concentration = 1;
    }
    if (pow === 0) {
      // issue #109, show 'N.NN x 10^0' as 'N.NN'
      string = Utils.toFixed(concentration, 2);
    } else {
      const mantissaString = Utils.toFixed(concentration, 2);
      string = `${mantissaString} x 10<sup>${pow}</sup>`;
    }
  } else {
    string = Utils.toFixed(concentration, 1);
  }
  return string;
}
acidBaseSolutions.register('ConcentrationBarNode', ConcentrationBarNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJQcm9wZXJ0eSIsIlV0aWxzIiwiUGhldEZvbnQiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiUmljaFRleHQiLCJOdWxsYWJsZUlPIiwiTnVtYmVySU8iLCJTdHJpbmdJTyIsImFjaWRCYXNlU29sdXRpb25zIiwiQWNpZEJhc2VTb2x1dGlvbnNTdHJpbmdzIiwiRk9OVCIsIkNvbmNlbnRyYXRpb25CYXJOb2RlIiwiY29uc3RydWN0b3IiLCJtYXhCYXJIZWlnaHQiLCJ0YW5kZW0iLCJjb25jZW50cmF0aW9uUHJvcGVydHkiLCJ1bml0cyIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb1ZhbHVlVHlwZSIsInBoZXRpb1JlYWRPbmx5IiwicGhldGlvRG9jdW1lbnRhdGlvbiIsImJhciIsImZpbGwiLCJyb3RhdGUiLCJNYXRoIiwiUEkiLCJsaW5rIiwiY29uY2VudHJhdGlvbiIsInNldFJlY3RIZWlnaHQiLCJiYXJIZWlnaHQiLCJhYnMiLCJsb2cxMCIsImlzRmluaXRlIiwidGV4dFRhbmRlbSIsInN0cmluZ1Byb3BlcnR5IiwiY29uY2VudHJhdGlvblRvU3RyaW5nIiwiU1RSSU5HX1BST1BFUlRZX1RBTkRFTV9OQU1FIiwidGV4dCIsImZvbnQiLCJtYXhXaWR0aCIsInJvdGF0aW9uIiwibXVsdGlsaW5rIiwiYm91bmRzUHJvcGVydHkiLCJjZW50ZXJYIiwiYm90dG9tIiwiY2hpbGRyZW4iLCJ2aXNpYmxlUHJvcGVydHlPcHRpb25zIiwiZGlzcG9zZSIsImFzc2VydCIsInNldEJhckZpbGwiLCJjb2xvciIsInNldEZpbGwiLCJzdHJpbmciLCJuZWdsaWdpYmxlU3RyaW5nUHJvcGVydHkiLCJ2YWx1ZSIsInBvdyIsImZsb29yIiwidG9GaXhlZCIsIm1hbnRpc3NhU3RyaW5nIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDb25jZW50cmF0aW9uQmFyTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb25jZW50cmF0aW9uQmFyTm9kZSBpcyBhIGJhciBpbiB0aGUgJ0VxdWlsaWJyaXVtIENvbmNlbnRyYXRpb24nIGdyYXBoLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEFuZHJleSBaZWxlbmtvdiAoTWxlYXJuZXIpXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgTm9kZSwgUmVjdGFuZ2xlLCBSaWNoVGV4dCwgVENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IE51bGxhYmxlSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bGxhYmxlSU8uanMnO1xyXG5pbXBvcnQgTnVtYmVySU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bWJlcklPLmpzJztcclxuaW1wb3J0IFN0cmluZ0lPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9TdHJpbmdJTy5qcyc7XHJcbmltcG9ydCBhY2lkQmFzZVNvbHV0aW9ucyBmcm9tICcuLi8uLi9hY2lkQmFzZVNvbHV0aW9ucy5qcyc7XHJcbmltcG9ydCBBY2lkQmFzZVNvbHV0aW9uc1N0cmluZ3MgZnJvbSAnLi4vLi4vQWNpZEJhc2VTb2x1dGlvbnNTdHJpbmdzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBGT05UID0gbmV3IFBoZXRGb250KCAxMiApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29uY2VudHJhdGlvbkJhck5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLy8gQ29uY2VudHJhdGlvbiB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhpcyBiYXIuIFRoaXMgaXMgYSBQcm9wZXJ0eSBmb3IgUGhFVC1pTy5cclxuICBwdWJsaWMgcmVhZG9ubHkgY29uY2VudHJhdGlvblByb3BlcnR5OiBQcm9wZXJ0eTxudW1iZXIgfCBudWxsPjtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBiYXI6IFJlY3RhbmdsZTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtYXhCYXJIZWlnaHQ6IG51bWJlciwgdGFuZGVtOiBUYW5kZW0gKSB7XHJcblxyXG4gICAgY29uc3QgY29uY2VudHJhdGlvblByb3BlcnR5ID0gbmV3IFByb3BlcnR5PG51bWJlciB8IG51bGw+KCAwLCB7XHJcbiAgICAgIHVuaXRzOiAnbW9sL0wnLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjb25jZW50cmF0aW9uUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1ZhbHVlVHlwZTogTnVsbGFibGVJTyggTnVtYmVySU8gKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdDb25jZW50cmF0aW9uIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGJhci4gbnVsbCBpZiB0aGUgYmFyIGlzIG5vdCByZWxldmFudCBmb3IgdGhlIHNlbGVjdGVkIHNvbHV0aW9uLidcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBhZGQgcmVjdGFuZ2xlIHRvIHJlcHJlc2VudCBjb25jZW50cmF0aW9uXHJcbiAgICBjb25zdCBiYXIgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAyNSwgMCwgeyBmaWxsOiAnd2hpdGUnIH0gKTtcclxuICAgIGJhci5yb3RhdGUoIE1hdGguUEkgKTsgLy8gc28gdGhhdCBiYXIgZ3Jvd3MgdXB3YXJkXHJcblxyXG4gICAgLy8gU2V0IHRoZSBiYXIgaGVpZ2h0XHJcbiAgICBjb25jZW50cmF0aW9uUHJvcGVydHkubGluayggY29uY2VudHJhdGlvbiA9PiB7XHJcbiAgICAgIGlmICggY29uY2VudHJhdGlvbiA9PT0gbnVsbCApIHtcclxuICAgICAgICBiYXIuc2V0UmVjdEhlaWdodCggMCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IGJhckhlaWdodCA9IE1hdGguYWJzKCBVdGlscy5sb2cxMCggY29uY2VudHJhdGlvbiApICsgOCApICogbWF4QmFySGVpZ2h0IC8gMTA7XHJcbiAgICAgICAgaWYgKCBpc0Zpbml0ZSggYmFySGVpZ2h0ICkgKSB7XHJcbiAgICAgICAgICBiYXIuc2V0UmVjdEhlaWdodCggYmFySGVpZ2h0ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgYmFyLnNldFJlY3RIZWlnaHQoIDAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBUZXh0IGZvciBjb25jZW50cmF0aW9uIHZhbHVlLCB0eXBpY2FsbHkgaW4gc2NpZW50aWZpYyBub3RhdGlvbi5cclxuICAgIGNvbnN0IHRleHRUYW5kZW0gPSB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndGV4dCcgKTtcclxuICAgIGNvbnN0IHN0cmluZ1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBjb25jZW50cmF0aW9uUHJvcGVydHkgXSxcclxuICAgICAgY29uY2VudHJhdGlvbiA9PiBjb25jZW50cmF0aW9uVG9TdHJpbmcoIGNvbmNlbnRyYXRpb24gKSwge1xyXG4gICAgICAgIHRhbmRlbTogdGV4dFRhbmRlbS5jcmVhdGVUYW5kZW0oIFJpY2hUZXh0LlNUUklOR19QUk9QRVJUWV9UQU5ERU1fTkFNRSApLFxyXG4gICAgICAgIHBoZXRpb1ZhbHVlVHlwZTogU3RyaW5nSU9cclxuICAgICAgfSApO1xyXG4gICAgY29uc3QgdGV4dCA9IG5ldyBSaWNoVGV4dCggc3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgZm9udDogRk9OVCxcclxuICAgICAgbWF4V2lkdGg6IDAuODUgKiBtYXhCYXJIZWlnaHQsXHJcbiAgICAgIHJvdGF0aW9uOiAtTWF0aC5QSSAvIDIsIC8vIHZlcnRpY2FsXHJcbiAgICAgIHRhbmRlbTogdGV4dFRhbmRlbVxyXG4gICAgfSApO1xyXG5cclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFsgYmFyLmJvdW5kc1Byb3BlcnR5LCB0ZXh0LmJvdW5kc1Byb3BlcnR5IF0sICgpID0+IHtcclxuICAgICAgdGV4dC5jZW50ZXJYID0gYmFyLmNlbnRlclg7XHJcbiAgICAgIHRleHQuYm90dG9tID0gYmFyLmJvdHRvbSAtIDY7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgY2hpbGRyZW46IFsgYmFyLCB0ZXh0IF0sXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLFxyXG4gICAgICB2aXNpYmxlUHJvcGVydHlPcHRpb25zOiB7IHBoZXRpb1JlYWRPbmx5OiB0cnVlIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmNvbmNlbnRyYXRpb25Qcm9wZXJ0eSA9IGNvbmNlbnRyYXRpb25Qcm9wZXJ0eTtcclxuICAgIHRoaXMuYmFyID0gYmFyO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGZpbGwgY29sb3Igb2YgdGhlIGJhci5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0QmFyRmlsbCggY29sb3I6IFRDb2xvciApOiB2b2lkIHtcclxuICAgIHRoaXMuYmFyLnNldEZpbGwoIGNvbG9yICk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjb25jZW50cmF0aW9uVG9TdHJpbmcoIGNvbmNlbnRyYXRpb246IG51bWJlciB8IG51bGwgKTogc3RyaW5nIHtcclxuICBsZXQgc3RyaW5nO1xyXG4gIGlmICggY29uY2VudHJhdGlvbiA9PT0gbnVsbCApIHtcclxuICAgIHN0cmluZyA9ICdudWxsJztcclxuICB9XHJcbiAgZWxzZSBpZiAoIGNvbmNlbnRyYXRpb24gPCAxZS0xMyApIHtcclxuICAgIHN0cmluZyA9IEFjaWRCYXNlU29sdXRpb25zU3RyaW5ncy5uZWdsaWdpYmxlU3RyaW5nUHJvcGVydHkudmFsdWU7XHJcbiAgfVxyXG4gIGVsc2UgaWYgKCBjb25jZW50cmF0aW9uIDw9IDEgKSB7XHJcblxyXG4gICAgLy8gZmluZCBwb3dlciBvZiAxMFxyXG4gICAgbGV0IHBvdyA9IE1hdGguZmxvb3IoIFV0aWxzLmxvZzEwKCBjb25jZW50cmF0aW9uICkgKTtcclxuXHJcbiAgICAvLyBmaW5kIHZhbHVlXHJcbiAgICBjb25jZW50cmF0aW9uID0gKCBjb25jZW50cmF0aW9uICogTWF0aC5wb3coIDEwLCAtcG93ICkgKTtcclxuXHJcbiAgICAvLyBzaG93IDEwLjAwIGFzIDEuMDAgeCAxMFxyXG4gICAgaWYgKCBNYXRoLmFicyggY29uY2VudHJhdGlvbiAtIDEwICkgPCAxZS0yICkge1xyXG4gICAgICBwb3crKztcclxuICAgICAgY29uY2VudHJhdGlvbiA9IDE7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBwb3cgPT09IDAgKSB7XHJcbiAgICAgIC8vIGlzc3VlICMxMDksIHNob3cgJ04uTk4geCAxMF4wJyBhcyAnTi5OTidcclxuICAgICAgc3RyaW5nID0gVXRpbHMudG9GaXhlZCggY29uY2VudHJhdGlvbiwgMiApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGNvbnN0IG1hbnRpc3NhU3RyaW5nID0gVXRpbHMudG9GaXhlZCggY29uY2VudHJhdGlvbiwgMiApO1xyXG4gICAgICBzdHJpbmcgPSBgJHttYW50aXNzYVN0cmluZ30geCAxMDxzdXA+JHtwb3d9PC9zdXA+YDtcclxuICAgIH1cclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICBzdHJpbmcgPSBVdGlscy50b0ZpeGVkKCBjb25jZW50cmF0aW9uLCAxICk7XHJcbiAgfVxyXG4gIHJldHVybiBzdHJpbmc7XHJcbn1cclxuXHJcbmFjaWRCYXNlU29sdXRpb25zLnJlZ2lzdGVyKCAnQ29uY2VudHJhdGlvbkJhck5vZGUnLCBDb25jZW50cmF0aW9uQmFyTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsU0FBUyxNQUFNLGtDQUFrQztBQUN4RCxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsUUFBUSxRQUFnQixtQ0FBbUM7QUFFckYsT0FBT0MsVUFBVSxNQUFNLDJDQUEyQztBQUNsRSxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsT0FBT0MsaUJBQWlCLE1BQU0sNEJBQTRCO0FBQzFELE9BQU9DLHdCQUF3QixNQUFNLG1DQUFtQzs7QUFFeEU7QUFDQSxNQUFNQyxJQUFJLEdBQUcsSUFBSVQsUUFBUSxDQUFF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