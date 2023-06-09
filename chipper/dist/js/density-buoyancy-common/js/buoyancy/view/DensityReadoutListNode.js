// Copyright 2019-2023, University of Colorado Boulder

/**
 * Shows a reference list of densities for named quantities (which can switch between different materials).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { RichText, VBox } from '../../../../scenery/js/imports.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonPreferences from '../../common/model/DensityBuoyancyCommonPreferences.js';
export default class DensityReadoutListNode extends VBox {
  constructor(materialProperties) {
    super({
      spacing: 5,
      align: 'center'
    });
    this.children = materialProperties.map(materialProperty => {
      // Exists for the lifetime of a sim, so disposal patterns not needed.
      return new RichText(new PatternStringProperty(new DerivedProperty([DensityBuoyancyCommonPreferences.volumeUnitsProperty, DensityBuoyancyCommonStrings.densityReadoutPatternStringProperty, DensityBuoyancyCommonStrings.densityReadoutDecimetersCubedPatternStringProperty], (units, litersString, decimetersCubedString) => {
        return units === 'liters' ? litersString : decimetersCubedString;
      }), {
        material: new DynamicProperty(materialProperty, {
          derive: material => material.nameProperty
        }),
        density: new DerivedProperty([materialProperty], material => material.density / 1000)
      }, {
        decimalPlaces: 2
      }), {
        font: new PhetFont(14),
        maxWidth: 200
      });
    });
  }
}
densityBuoyancyCommon.register('DensityReadoutListNode', DensityReadoutListNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJEeW5hbWljUHJvcGVydHkiLCJQYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJQaGV0Rm9udCIsIlJpY2hUZXh0IiwiVkJveCIsImRlbnNpdHlCdW95YW5jeUNvbW1vbiIsIkRlbnNpdHlCdW95YW5jeUNvbW1vblN0cmluZ3MiLCJEZW5zaXR5QnVveWFuY3lDb21tb25QcmVmZXJlbmNlcyIsIkRlbnNpdHlSZWFkb3V0TGlzdE5vZGUiLCJjb25zdHJ1Y3RvciIsIm1hdGVyaWFsUHJvcGVydGllcyIsInNwYWNpbmciLCJhbGlnbiIsImNoaWxkcmVuIiwibWFwIiwibWF0ZXJpYWxQcm9wZXJ0eSIsInZvbHVtZVVuaXRzUHJvcGVydHkiLCJkZW5zaXR5UmVhZG91dFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsImRlbnNpdHlSZWFkb3V0RGVjaW1ldGVyc0N1YmVkUGF0dGVyblN0cmluZ1Byb3BlcnR5IiwidW5pdHMiLCJsaXRlcnNTdHJpbmciLCJkZWNpbWV0ZXJzQ3ViZWRTdHJpbmciLCJtYXRlcmlhbCIsImRlcml2ZSIsIm5hbWVQcm9wZXJ0eSIsImRlbnNpdHkiLCJkZWNpbWFsUGxhY2VzIiwiZm9udCIsIm1heFdpZHRoIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEZW5zaXR5UmVhZG91dExpc3ROb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNob3dzIGEgcmVmZXJlbmNlIGxpc3Qgb2YgZGVuc2l0aWVzIGZvciBuYW1lZCBxdWFudGl0aWVzICh3aGljaCBjYW4gc3dpdGNoIGJldHdlZW4gZGlmZmVyZW50IG1hdGVyaWFscykuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IER5bmFtaWNQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0R5bmFtaWNQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1BhdHRlcm5TdHJpbmdQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBSaWNoVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBNYXRlcmlhbCBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvTWF0ZXJpYWwuanMnO1xyXG5pbXBvcnQgZGVuc2l0eUJ1b3lhbmN5Q29tbW9uIGZyb20gJy4uLy4uL2RlbnNpdHlCdW95YW5jeUNvbW1vbi5qcyc7XHJcbmltcG9ydCBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzIGZyb20gJy4uLy4uL0RlbnNpdHlCdW95YW5jeUNvbW1vblN0cmluZ3MuanMnO1xyXG5pbXBvcnQgRGVuc2l0eUJ1b3lhbmN5Q29tbW9uUHJlZmVyZW5jZXMgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0RlbnNpdHlCdW95YW5jeUNvbW1vblByZWZlcmVuY2VzLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERlbnNpdHlSZWFkb3V0TGlzdE5vZGUgZXh0ZW5kcyBWQm94IHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG1hdGVyaWFsUHJvcGVydGllczogVFJlYWRPbmx5UHJvcGVydHk8TWF0ZXJpYWw+W10gKSB7XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgc3BhY2luZzogNSxcclxuICAgICAgYWxpZ246ICdjZW50ZXInXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5jaGlsZHJlbiA9IG1hdGVyaWFsUHJvcGVydGllcy5tYXAoIG1hdGVyaWFsUHJvcGVydHkgPT4ge1xyXG4gICAgICAvLyBFeGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiBhIHNpbSwgc28gZGlzcG9zYWwgcGF0dGVybnMgbm90IG5lZWRlZC5cclxuICAgICAgcmV0dXJuIG5ldyBSaWNoVGV4dCggbmV3IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSggbmV3IERlcml2ZWRQcm9wZXJ0eSggW1xyXG4gICAgICAgIERlbnNpdHlCdW95YW5jeUNvbW1vblByZWZlcmVuY2VzLnZvbHVtZVVuaXRzUHJvcGVydHksXHJcbiAgICAgICAgRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5kZW5zaXR5UmVhZG91dFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgICBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzLmRlbnNpdHlSZWFkb3V0RGVjaW1ldGVyc0N1YmVkUGF0dGVyblN0cmluZ1Byb3BlcnR5XHJcbiAgICAgIF0sICggdW5pdHMsIGxpdGVyc1N0cmluZywgZGVjaW1ldGVyc0N1YmVkU3RyaW5nICkgPT4ge1xyXG4gICAgICAgIHJldHVybiB1bml0cyA9PT0gJ2xpdGVycycgPyBsaXRlcnNTdHJpbmcgOiBkZWNpbWV0ZXJzQ3ViZWRTdHJpbmc7XHJcbiAgICAgIH0gKSwge1xyXG4gICAgICAgIG1hdGVyaWFsOiBuZXcgRHluYW1pY1Byb3BlcnR5PHN0cmluZywgc3RyaW5nLCBNYXRlcmlhbD4oIG1hdGVyaWFsUHJvcGVydHksIHsgZGVyaXZlOiBtYXRlcmlhbCA9PiBtYXRlcmlhbC5uYW1lUHJvcGVydHkgfSApLFxyXG4gICAgICAgIGRlbnNpdHk6IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgbWF0ZXJpYWxQcm9wZXJ0eSBdLCBtYXRlcmlhbCA9PiBtYXRlcmlhbC5kZW5zaXR5IC8gMTAwMCApXHJcbiAgICAgIH0sIHtcclxuICAgICAgICBkZWNpbWFsUGxhY2VzOiAyXHJcbiAgICAgIH0gKSwgeyBmb250OiBuZXcgUGhldEZvbnQoIDE0ICksIG1heFdpZHRoOiAyMDAgfSApO1xyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuZGVuc2l0eUJ1b3lhbmN5Q29tbW9uLnJlZ2lzdGVyKCAnRGVuc2l0eVJlYWRvdXRMaXN0Tm9kZScsIERlbnNpdHlSZWFkb3V0TGlzdE5vZGUgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUVwRSxPQUFPQyxxQkFBcUIsTUFBTSw4Q0FBOEM7QUFDaEYsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxRQUFRLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFFbEUsT0FBT0MscUJBQXFCLE1BQU0sZ0NBQWdDO0FBQ2xFLE9BQU9DLDRCQUE0QixNQUFNLHVDQUF1QztBQUNoRixPQUFPQyxnQ0FBZ0MsTUFBTSx3REFBd0Q7QUFFckcsZUFBZSxNQUFNQyxzQkFBc0IsU0FBU0osSUFBSSxDQUFDO0VBQ2hESyxXQUFXQSxDQUFFQyxrQkFBaUQsRUFBRztJQUV0RSxLQUFLLENBQUU7TUFDTEMsT0FBTyxFQUFFLENBQUM7TUFDVkMsS0FBSyxFQUFFO0lBQ1QsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDQyxRQUFRLEdBQUdILGtCQUFrQixDQUFDSSxHQUFHLENBQUVDLGdCQUFnQixJQUFJO01BQzFEO01BQ0EsT0FBTyxJQUFJWixRQUFRLENBQUUsSUFBSUYscUJBQXFCLENBQUUsSUFBSUYsZUFBZSxDQUFFLENBQ25FUSxnQ0FBZ0MsQ0FBQ1MsbUJBQW1CLEVBQ3BEViw0QkFBNEIsQ0FBQ1csbUNBQW1DLEVBQ2hFWCw0QkFBNEIsQ0FBQ1ksa0RBQWtELENBQ2hGLEVBQUUsQ0FBRUMsS0FBSyxFQUFFQyxZQUFZLEVBQUVDLHFCQUFxQixLQUFNO1FBQ25ELE9BQU9GLEtBQUssS0FBSyxRQUFRLEdBQUdDLFlBQVksR0FBR0MscUJBQXFCO01BQ2xFLENBQUUsQ0FBQyxFQUFFO1FBQ0hDLFFBQVEsRUFBRSxJQUFJdEIsZUFBZSxDQUE0QmUsZ0JBQWdCLEVBQUU7VUFBRVEsTUFBTSxFQUFFRCxRQUFRLElBQUlBLFFBQVEsQ0FBQ0U7UUFBYSxDQUFFLENBQUM7UUFDMUhDLE9BQU8sRUFBRSxJQUFJMUIsZUFBZSxDQUFFLENBQUVnQixnQkFBZ0IsQ0FBRSxFQUFFTyxRQUFRLElBQUlBLFFBQVEsQ0FBQ0csT0FBTyxHQUFHLElBQUs7TUFDMUYsQ0FBQyxFQUFFO1FBQ0RDLGFBQWEsRUFBRTtNQUNqQixDQUFFLENBQUMsRUFBRTtRQUFFQyxJQUFJLEVBQUUsSUFBSXpCLFFBQVEsQ0FBRSxFQUFHLENBQUM7UUFBRTBCLFFBQVEsRUFBRTtNQUFJLENBQUUsQ0FBQztJQUNwRCxDQUFFLENBQUM7RUFDTDtBQUNGO0FBRUF2QixxQkFBcUIsQ0FBQ3dCLFFBQVEsQ0FBRSx3QkFBd0IsRUFBRXJCLHNCQUF1QixDQUFDIn0=