// Copyright 2022, University of Colorado Boulder

/**
 * SolutionVolumeNode displays the volume of the solution, in L. See https://github.com/phetsims/beers-law-lab/issues/161
 *
 * Note that this is a Node instead of an HBox because the local y origin must be at the center of the tick mark,
 * so that it aligns with tick marks on the beaker.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import { Shape } from '../../../../kite/js/imports.js';
import optionize from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Path, Text } from '../../../../scenery/js/imports.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import beersLawLab from '../../beersLawLab.js';
import BeersLawLabStrings from '../../BeersLawLabStrings.js';
import BLLPreferences from '../../common/model/BLLPreferences.js';
export default class SolutionVolumeNode extends Node {
  constructor(volumeProperty, providedOptions) {
    const options = optionize()({
      // NodeOptions
      visibleProperty: BLLPreferences.showSolutionVolumeProperty
    }, providedOptions);
    const triangleSize = 15;
    const triangleShape = new Shape().moveTo(0, 0).lineTo(triangleSize, triangleSize / 2).lineTo(0, triangleSize).close();
    const triangleNode = new Path(triangleShape, {
      fill: 'black',
      centerY: 0
    });
    const textTandem = options.tandem.createTandem('text');
    const stringProperty = new DerivedProperty([BeersLawLabStrings.pattern['0value']['1unitsStringProperty'], volumeProperty, BeersLawLabStrings.units.litersStringProperty, BeersLawLabStrings.units.millilitersStringProperty, BLLPreferences.beakerUnitsProperty], (pattern, volume, litersString, millilitersString, beakerUnits) => {
      // Display integer values with 0 decimal places, non-integer values with 2 decimal places.
      let volumeString;
      let units;
      if (beakerUnits === 'liters') {
        volumeString = Number.isInteger(volume) ? Utils.toFixed(volume, 0) : Utils.toFixed(volume, 2);
        units = litersString;
      } else {
        volumeString = Utils.toFixed(volume * 1000, 0); // convert L to mL
        units = millilitersString;
      }
      return StringUtils.format(pattern, volumeString, units);
    }, {
      tandem: textTandem.createTandem(Text.STRING_PROPERTY_TANDEM_NAME),
      phetioValueType: StringIO
    });
    const text = new Text(stringProperty, {
      font: new PhetFont(22),
      maxWidth: 100,
      // determined empirically
      tandem: textTandem
    });
    text.boundsProperty.link(bounds => {
      text.right = triangleNode.left - 6;
      text.bottom = triangleNode.centerY - 1;
    });
    options.children = [text, triangleNode];
    super(options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
beersLawLab.register('SolutionVolumeNode', SolutionVolumeNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJVdGlscyIsIlNoYXBlIiwib3B0aW9uaXplIiwiU3RyaW5nVXRpbHMiLCJQaGV0Rm9udCIsIk5vZGUiLCJQYXRoIiwiVGV4dCIsIlN0cmluZ0lPIiwiYmVlcnNMYXdMYWIiLCJCZWVyc0xhd0xhYlN0cmluZ3MiLCJCTExQcmVmZXJlbmNlcyIsIlNvbHV0aW9uVm9sdW1lTm9kZSIsImNvbnN0cnVjdG9yIiwidm9sdW1lUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwidmlzaWJsZVByb3BlcnR5Iiwic2hvd1NvbHV0aW9uVm9sdW1lUHJvcGVydHkiLCJ0cmlhbmdsZVNpemUiLCJ0cmlhbmdsZVNoYXBlIiwibW92ZVRvIiwibGluZVRvIiwiY2xvc2UiLCJ0cmlhbmdsZU5vZGUiLCJmaWxsIiwiY2VudGVyWSIsInRleHRUYW5kZW0iLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJzdHJpbmdQcm9wZXJ0eSIsInBhdHRlcm4iLCJ1bml0cyIsImxpdGVyc1N0cmluZ1Byb3BlcnR5IiwibWlsbGlsaXRlcnNTdHJpbmdQcm9wZXJ0eSIsImJlYWtlclVuaXRzUHJvcGVydHkiLCJ2b2x1bWUiLCJsaXRlcnNTdHJpbmciLCJtaWxsaWxpdGVyc1N0cmluZyIsImJlYWtlclVuaXRzIiwidm9sdW1lU3RyaW5nIiwiTnVtYmVyIiwiaXNJbnRlZ2VyIiwidG9GaXhlZCIsImZvcm1hdCIsIlNUUklOR19QUk9QRVJUWV9UQU5ERU1fTkFNRSIsInBoZXRpb1ZhbHVlVHlwZSIsInRleHQiLCJmb250IiwibWF4V2lkdGgiLCJib3VuZHNQcm9wZXJ0eSIsImxpbmsiLCJib3VuZHMiLCJyaWdodCIsImxlZnQiLCJib3R0b20iLCJjaGlsZHJlbiIsImRpc3Bvc2UiLCJhc3NlcnQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNvbHV0aW9uVm9sdW1lTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU29sdXRpb25Wb2x1bWVOb2RlIGRpc3BsYXlzIHRoZSB2b2x1bWUgb2YgdGhlIHNvbHV0aW9uLCBpbiBMLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2JlZXJzLWxhdy1sYWIvaXNzdWVzLzE2MVxyXG4gKlxyXG4gKiBOb3RlIHRoYXQgdGhpcyBpcyBhIE5vZGUgaW5zdGVhZCBvZiBhbiBIQm94IGJlY2F1c2UgdGhlIGxvY2FsIHkgb3JpZ2luIG11c3QgYmUgYXQgdGhlIGNlbnRlciBvZiB0aGUgdGljayBtYXJrLFxyXG4gKiBzbyB0aGF0IGl0IGFsaWducyB3aXRoIHRpY2sgbWFya3Mgb24gdGhlIGJlYWtlci5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBOb2RlT3B0aW9ucywgUGF0aCwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBTdHJpbmdJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvU3RyaW5nSU8uanMnO1xyXG5pbXBvcnQgYmVlcnNMYXdMYWIgZnJvbSAnLi4vLi4vYmVlcnNMYXdMYWIuanMnO1xyXG5pbXBvcnQgQmVlcnNMYXdMYWJTdHJpbmdzIGZyb20gJy4uLy4uL0JlZXJzTGF3TGFiU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBCTExQcmVmZXJlbmNlcyBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvQkxMUHJlZmVyZW5jZXMuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG50eXBlIFNvbHV0aW9uVm9sdW1lTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxOb2RlT3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU29sdXRpb25Wb2x1bWVOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggdm9sdW1lUHJvcGVydHk6IFByb3BlcnR5PG51bWJlcj4sIHByb3ZpZGVkT3B0aW9uczogU29sdXRpb25Wb2x1bWVOb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFNvbHV0aW9uVm9sdW1lTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gTm9kZU9wdGlvbnNcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiBCTExQcmVmZXJlbmNlcy5zaG93U29sdXRpb25Wb2x1bWVQcm9wZXJ0eVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgdHJpYW5nbGVTaXplID0gMTU7XHJcbiAgICBjb25zdCB0cmlhbmdsZVNoYXBlID0gbmV3IFNoYXBlKClcclxuICAgICAgLm1vdmVUbyggMCwgMCApXHJcbiAgICAgIC5saW5lVG8oIHRyaWFuZ2xlU2l6ZSwgdHJpYW5nbGVTaXplIC8gMiApXHJcbiAgICAgIC5saW5lVG8oIDAsIHRyaWFuZ2xlU2l6ZSApXHJcbiAgICAgIC5jbG9zZSgpO1xyXG4gICAgY29uc3QgdHJpYW5nbGVOb2RlID0gbmV3IFBhdGgoIHRyaWFuZ2xlU2hhcGUsIHtcclxuICAgICAgZmlsbDogJ2JsYWNrJyxcclxuICAgICAgY2VudGVyWTogMFxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHRleHRUYW5kZW0gPSBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd0ZXh0JyApO1xyXG5cclxuICAgIGNvbnN0IHN0cmluZ1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggW1xyXG4gICAgICAgIEJlZXJzTGF3TGFiU3RyaW5ncy5wYXR0ZXJuWyAnMHZhbHVlJyBdWyAnMXVuaXRzU3RyaW5nUHJvcGVydHknIF0sXHJcbiAgICAgICAgdm9sdW1lUHJvcGVydHksXHJcbiAgICAgICAgQmVlcnNMYXdMYWJTdHJpbmdzLnVuaXRzLmxpdGVyc1N0cmluZ1Byb3BlcnR5LFxyXG4gICAgICAgIEJlZXJzTGF3TGFiU3RyaW5ncy51bml0cy5taWxsaWxpdGVyc1N0cmluZ1Byb3BlcnR5LFxyXG4gICAgICAgIEJMTFByZWZlcmVuY2VzLmJlYWtlclVuaXRzUHJvcGVydHlcclxuICAgICAgXSxcclxuICAgICAgKCBwYXR0ZXJuLCB2b2x1bWUsIGxpdGVyc1N0cmluZywgbWlsbGlsaXRlcnNTdHJpbmcsIGJlYWtlclVuaXRzICkgPT4ge1xyXG5cclxuICAgICAgICAvLyBEaXNwbGF5IGludGVnZXIgdmFsdWVzIHdpdGggMCBkZWNpbWFsIHBsYWNlcywgbm9uLWludGVnZXIgdmFsdWVzIHdpdGggMiBkZWNpbWFsIHBsYWNlcy5cclxuICAgICAgICBsZXQgdm9sdW1lU3RyaW5nOiBzdHJpbmc7XHJcbiAgICAgICAgbGV0IHVuaXRzOiBzdHJpbmc7XHJcbiAgICAgICAgaWYgKCBiZWFrZXJVbml0cyA9PT0gJ2xpdGVycycgKSB7XHJcbiAgICAgICAgICB2b2x1bWVTdHJpbmcgPSBOdW1iZXIuaXNJbnRlZ2VyKCB2b2x1bWUgKSA/IFV0aWxzLnRvRml4ZWQoIHZvbHVtZSwgMCApIDogVXRpbHMudG9GaXhlZCggdm9sdW1lLCAyICk7XHJcbiAgICAgICAgICB1bml0cyA9IGxpdGVyc1N0cmluZztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB2b2x1bWVTdHJpbmcgPSBVdGlscy50b0ZpeGVkKCB2b2x1bWUgKiAxMDAwLCAwICk7IC8vIGNvbnZlcnQgTCB0byBtTFxyXG4gICAgICAgICAgdW5pdHMgPSBtaWxsaWxpdGVyc1N0cmluZztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZvcm1hdCggcGF0dGVybiwgdm9sdW1lU3RyaW5nLCB1bml0cyApO1xyXG4gICAgICB9LCB7XHJcbiAgICAgICAgdGFuZGVtOiB0ZXh0VGFuZGVtLmNyZWF0ZVRhbmRlbSggVGV4dC5TVFJJTkdfUFJPUEVSVFlfVEFOREVNX05BTUUgKSxcclxuICAgICAgICBwaGV0aW9WYWx1ZVR5cGU6IFN0cmluZ0lPXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCB0ZXh0ID0gbmV3IFRleHQoIHN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMjIgKSxcclxuICAgICAgbWF4V2lkdGg6IDEwMCwgLy8gZGV0ZXJtaW5lZCBlbXBpcmljYWxseVxyXG4gICAgICB0YW5kZW06IHRleHRUYW5kZW1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0ZXh0LmJvdW5kc1Byb3BlcnR5LmxpbmsoIGJvdW5kcyA9PiB7XHJcbiAgICAgIHRleHQucmlnaHQgPSB0cmlhbmdsZU5vZGUubGVmdCAtIDY7XHJcbiAgICAgIHRleHQuYm90dG9tID0gdHJpYW5nbGVOb2RlLmNlbnRlclkgLSAxO1xyXG4gICAgfSApO1xyXG5cclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIHRleHQsIHRyaWFuZ2xlTm9kZSBdO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuYmVlcnNMYXdMYWIucmVnaXN0ZXIoICdTb2x1dGlvblZvbHVtZU5vZGUnLCBTb2x1dGlvblZvbHVtZU5vZGUgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFFcEUsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLFNBQVMsTUFBNEIsdUNBQXVDO0FBRW5GLE9BQU9DLFdBQVcsTUFBTSwrQ0FBK0M7QUFDdkUsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxJQUFJLEVBQWVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUNqRixPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELE9BQU9DLFdBQVcsTUFBTSxzQkFBc0I7QUFDOUMsT0FBT0Msa0JBQWtCLE1BQU0sNkJBQTZCO0FBQzVELE9BQU9DLGNBQWMsTUFBTSxzQ0FBc0M7QUFNakUsZUFBZSxNQUFNQyxrQkFBa0IsU0FBU1AsSUFBSSxDQUFDO0VB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