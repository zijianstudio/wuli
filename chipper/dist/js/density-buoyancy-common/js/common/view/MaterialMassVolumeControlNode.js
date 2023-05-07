// Copyright 2019-2023, University of Colorado Boulder

/**
 * A control that allows modification of the mass and volume (which can be linked, or unlinked for custom materials).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import { HBox, Text, VBox } from '../../../../scenery/js/imports.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import Material from '../model/Material.js';
import PrecisionSliderThumb from './PrecisionSliderThumb.js';

// constants
const LITERS_IN_CUBIC_METER = 1000;
const TRACK_HEIGHT = 3;

// A workaround for changing a DerivedProperty range Property to a NumberProperty, where the new range AND value will
// not overlap with the previous one.
class WorkaroundRange extends Range {
  contains(value) {
    return true;
  }
}
export default class MaterialMassVolumeControlNode extends VBox {
  constructor(materialProperty, massProperty, volumeProperty, materials, setVolume, listParent, providedOptions) {
    const options = optionize()({
      labelNode: null,
      minMass: 0.1,
      minCustomMass: 0.5,
      maxCustomMass: 10,
      maxMass: 27,
      minVolumeLiters: 1,
      maxVolumeLiters: 10,
      minCustomVolumeLiters: 1,
      color: null
    }, providedOptions);
    const tandem = options.tandem;
    const massNumberControlTandem = tandem.createTandem('massNumberControl');
    const volumeNumberControlTandem = tandem.createTandem('volumeNumberControl');
    super({
      spacing: 15,
      align: 'left'
    });
    const materialNames = [...materials.map(material => material.identifier), 'CUSTOM'];
    const comboBoxMaterialProperty = new DynamicProperty(new Property(materialProperty), {
      bidirectional: true,
      map: material => {
        return material.custom ? 'CUSTOM' : material.identifier;
      },
      inverseMap: materialName => {
        if (materialName === 'CUSTOM') {
          // Handle our minimum volume if we're switched to custom (if needed)
          const volume = Math.max(volumeProperty.value, options.minCustomVolumeLiters / LITERS_IN_CUBIC_METER);
          return Material.createCustomSolidMaterial({
            density: Utils.clamp(materialProperty.value.density, options.minCustomMass / volume, options.maxCustomMass / volume)
          });
        } else {
          return Material[materialName];
        }
      },
      reentrant: true,
      phetioState: false,
      tandem: options.tandem.createTandem('comboBoxMaterialProperty'),
      phetioDocumentation: 'Current material of the block. Changing the material will result in changes to the mass, but the volume will remain the same.',
      validValues: materialNames,
      phetioValueType: StringIO
    });

    // We need to use "locks" since our behavior is different based on whether the model or user is changing the value
    let modelMassChanging = false;
    let userMassChanging = false;
    let modelVolumeChanging = false;
    let userVolumeChanging = false;

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    const enabledMassRangeProperty = new DerivedProperty([materialProperty], material => {
      if (material.custom) {
        return new Range(options.minCustomMass, options.maxCustomMass);
      } else {
        const density = material.density;
        const minMass = Utils.clamp(density * options.minVolumeLiters / LITERS_IN_CUBIC_METER, options.minMass, options.maxMass);
        const maxMass = Utils.clamp(density * options.maxVolumeLiters / LITERS_IN_CUBIC_METER, options.minMass, options.maxMass);
        return new WorkaroundRange(minMass, maxMass);
      }
    }, {
      reentrant: true,
      phetioState: false,
      phetioValueType: Range.RangeIO,
      tandem: massNumberControlTandem.createTandem('enabledMassRangeProperty')
    });
    const enabledVolumeRangeProperty = new DerivedProperty([materialProperty], material => {
      return new WorkaroundRange(material.custom ? Math.max(options.minVolumeLiters, options.minCustomVolumeLiters) : options.minVolumeLiters, options.maxVolumeLiters);
    });

    // passed to the NumberControl
    const massNumberProperty = new NumberProperty(massProperty.value, {
      tandem: massNumberControlTandem.createTandem('numberControlMassProperty'),
      phetioState: false,
      phetioReadOnly: true,
      units: 'kg'
    });

    // passed to the NumberControl - liters from m^3
    const numberControlVolumeProperty = new NumberProperty(volumeProperty.value * LITERS_IN_CUBIC_METER, {
      range: new Range(options.minVolumeLiters, options.maxVolumeLiters),
      tandem: volumeNumberControlTandem.createTandem('numberControlVolumeProperty'),
      phetioState: false,
      phetioReadOnly: true,
      units: 'L'
    });

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    numberControlVolumeProperty.lazyLink(liters => {
      if (!modelVolumeChanging && !userMassChanging) {
        const cubicMeters = liters / LITERS_IN_CUBIC_METER;
        userVolumeChanging = true;

        // If we're custom, adjust the density
        if (materialProperty.value.custom) {
          materialProperty.value = Material.createCustomSolidMaterial({
            density: massProperty.value / cubicMeters
          });
        }
        setVolume(cubicMeters);
        userVolumeChanging = false;
      }
    });

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    volumeProperty.lazyLink(cubicMeters => {
      if (!userVolumeChanging) {
        modelVolumeChanging = true;

        // If the value is close to min/max, massage it to the exact value, see https://github.com/phetsims/density/issues/46
        let volumeLiters = cubicMeters * LITERS_IN_CUBIC_METER;
        if (volumeLiters > options.minVolumeLiters && volumeLiters < options.minVolumeLiters + 1e-10) {
          volumeLiters = options.minVolumeLiters;
        }
        if (volumeLiters < options.maxVolumeLiters && volumeLiters > options.maxVolumeLiters - 1e-10) {
          volumeLiters = options.maxVolumeLiters;
        }
        numberControlVolumeProperty.value = Utils.clamp(volumeLiters, options.minVolumeLiters, options.maxVolumeLiters);
        modelVolumeChanging = false;
      }
    });

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    massNumberProperty.lazyLink(mass => {
      if (!modelMassChanging && !userVolumeChanging) {
        userMassChanging = true;
        if (materialProperty.value.custom) {
          materialProperty.value = Material.createCustomSolidMaterial({
            density: mass / volumeProperty.value
          });
        } else {
          setVolume(mass / materialProperty.value.density);
        }
        userMassChanging = false;
      }
    });

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    massProperty.lazyLink(mass => {
      if (!userMassChanging) {
        modelMassChanging = true;
        enabledMassRangeProperty.recomputeDerivation();

        // If the value is close to min/max, massage it to the exact value, see https://github.com/phetsims/density/issues/46
        let adjustedMass = mass;
        const min = enabledMassRangeProperty.value.min;
        const max = enabledMassRangeProperty.value.max;
        if (adjustedMass > min && adjustedMass < min + 1e-10) {
          adjustedMass = min;
        }
        if (adjustedMass < max && adjustedMass > max - 1e-10) {
          adjustedMass = max;
        }
        massNumberProperty.value = Utils.clamp(adjustedMass, min, max);
        modelMassChanging = false;
      }
    });
    const comboMaxWidth = options.labelNode ? 110 : 160;
    const comboBox = new ComboBox(comboBoxMaterialProperty, [...materials.map(material => {
      return {
        value: material.identifier,
        createNode: () => new Text(material.nameProperty, {
          font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
          maxWidth: comboMaxWidth
        }),
        tandemName: `${material.tandemName}${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
      };
    }), {
      value: 'CUSTOM',
      createNode: () => new Text(DensityBuoyancyCommonStrings.material.customStringProperty, {
        font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
        maxWidth: comboMaxWidth
      }),
      tandemName: `custom${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
    }], listParent, {
      xMargin: 8,
      yMargin: 4,
      tandem: tandem.createTandem('comboBox')
    });
    const massNumberControl = new NumberControl(DensityBuoyancyCommonStrings.massStringProperty, massNumberProperty, new Range(options.minMass, options.maxMass), combineOptions({
      sliderOptions: {
        thumbNode: new PrecisionSliderThumb({
          thumbFill: options.color,
          tandem: massNumberControlTandem.createTandem('slider').createTandem('thumbNode')
        }),
        thumbYOffset: new PrecisionSliderThumb().height / 2 - TRACK_HEIGHT / 2,
        constrainValue: value => {
          const range = enabledMassRangeProperty.value;

          // Don't snap before ranges, since this doesn't work for Styrofoam case, see
          // https://github.com/phetsims/density/issues/46
          if (value <= range.min) {
            return range.min;
          }
          if (value >= range.max) {
            return range.max;
          }
          return enabledMassRangeProperty.value.constrainValue(Utils.toFixedNumber(value, 1));
        },
        phetioLinkedProperty: massProperty
      },
      numberDisplayOptions: {
        valuePattern: DensityBuoyancyCommonConstants.KILOGRAMS_PATTERN_STRING_PROPERTY,
        useFullHeight: true
      },
      arrowButtonOptions: {
        enabledEpsilon: 1e-7
      },
      enabledRangeProperty: enabledMassRangeProperty,
      tandem: massNumberControlTandem,
      titleNodeOptions: {
        visiblePropertyOptions: {
          phetioReadOnly: true
        }
      }
    }, MaterialMassVolumeControlNode.getNumberControlOptions()));
    const volumeNumberControl = new NumberControl(DensityBuoyancyCommonStrings.volumeStringProperty, numberControlVolumeProperty, new Range(options.minVolumeLiters, options.maxVolumeLiters), combineOptions({
      sliderOptions: {
        thumbNode: new PrecisionSliderThumb({
          thumbFill: options.color,
          tandem: volumeNumberControlTandem.createTandem('slider').createTandem('thumbNode')
        }),
        thumbYOffset: new PrecisionSliderThumb().height / 2 - TRACK_HEIGHT / 2,
        constrainValue: value => Utils.roundSymmetric(value * 2) / 2,
        phetioLinkedProperty: volumeProperty
      },
      numberDisplayOptions: {
        valuePattern: DensityBuoyancyCommonConstants.VOLUME_PATTERN_STRING_PROPERTY,
        useRichText: true,
        useFullHeight: true
      },
      arrowButtonOptions: {
        enabledEpsilon: 1e-7
      },
      enabledRangeProperty: enabledVolumeRangeProperty,
      tandem: volumeNumberControlTandem,
      titleNodeOptions: {
        visiblePropertyOptions: {
          phetioReadOnly: true
        }
      }
    }, MaterialMassVolumeControlNode.getNumberControlOptions()));
    this.children = [new HBox({
      spacing: 5,
      children: [comboBox, ...[options.labelNode].filter(_.identity)]
    }), massNumberControl, volumeNumberControl];
    this.mutate(options);
  }

  /**
   * Returns the default NumberControl options used by this component.
   */
  static getNumberControlOptions() {
    return {
      delta: 0.01,
      sliderOptions: {
        trackSize: new Dimension2(120, TRACK_HEIGHT)
      },
      numberDisplayOptions: {
        decimalPlaces: 2,
        textOptions: {
          maxWidth: 60
        },
        useFullHeight: true
      },
      layoutFunction: NumberControl.createLayoutFunction4({
        sliderPadding: 5
      }),
      titleNodeOptions: {
        font: DensityBuoyancyCommonConstants.ITEM_FONT,
        maxWidth: 90
      }
    };
  }
}
densityBuoyancyCommon.register('MaterialMassVolumeControlNode', MaterialMassVolumeControlNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJEeW5hbWljUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwiRGltZW5zaW9uMiIsIlJhbmdlIiwiVXRpbHMiLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIk51bWJlckNvbnRyb2wiLCJIQm94IiwiVGV4dCIsIlZCb3giLCJDb21ib0JveCIsIlN0cmluZ0lPIiwiZGVuc2l0eUJ1b3lhbmN5Q29tbW9uIiwiRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncyIsIkRlbnNpdHlCdW95YW5jeUNvbW1vbkNvbnN0YW50cyIsIk1hdGVyaWFsIiwiUHJlY2lzaW9uU2xpZGVyVGh1bWIiLCJMSVRFUlNfSU5fQ1VCSUNfTUVURVIiLCJUUkFDS19IRUlHSFQiLCJXb3JrYXJvdW5kUmFuZ2UiLCJjb250YWlucyIsInZhbHVlIiwiTWF0ZXJpYWxNYXNzVm9sdW1lQ29udHJvbE5vZGUiLCJjb25zdHJ1Y3RvciIsIm1hdGVyaWFsUHJvcGVydHkiLCJtYXNzUHJvcGVydHkiLCJ2b2x1bWVQcm9wZXJ0eSIsIm1hdGVyaWFscyIsInNldFZvbHVtZSIsImxpc3RQYXJlbnQiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwibGFiZWxOb2RlIiwibWluTWFzcyIsIm1pbkN1c3RvbU1hc3MiLCJtYXhDdXN0b21NYXNzIiwibWF4TWFzcyIsIm1pblZvbHVtZUxpdGVycyIsIm1heFZvbHVtZUxpdGVycyIsIm1pbkN1c3RvbVZvbHVtZUxpdGVycyIsImNvbG9yIiwidGFuZGVtIiwibWFzc051bWJlckNvbnRyb2xUYW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJ2b2x1bWVOdW1iZXJDb250cm9sVGFuZGVtIiwic3BhY2luZyIsImFsaWduIiwibWF0ZXJpYWxOYW1lcyIsIm1hcCIsIm1hdGVyaWFsIiwiaWRlbnRpZmllciIsImNvbWJvQm94TWF0ZXJpYWxQcm9wZXJ0eSIsImJpZGlyZWN0aW9uYWwiLCJjdXN0b20iLCJpbnZlcnNlTWFwIiwibWF0ZXJpYWxOYW1lIiwidm9sdW1lIiwiTWF0aCIsIm1heCIsImNyZWF0ZUN1c3RvbVNvbGlkTWF0ZXJpYWwiLCJkZW5zaXR5IiwiY2xhbXAiLCJyZWVudHJhbnQiLCJwaGV0aW9TdGF0ZSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJ2YWxpZFZhbHVlcyIsInBoZXRpb1ZhbHVlVHlwZSIsIm1vZGVsTWFzc0NoYW5naW5nIiwidXNlck1hc3NDaGFuZ2luZyIsIm1vZGVsVm9sdW1lQ2hhbmdpbmciLCJ1c2VyVm9sdW1lQ2hhbmdpbmciLCJlbmFibGVkTWFzc1JhbmdlUHJvcGVydHkiLCJSYW5nZUlPIiwiZW5hYmxlZFZvbHVtZVJhbmdlUHJvcGVydHkiLCJtYXNzTnVtYmVyUHJvcGVydHkiLCJwaGV0aW9SZWFkT25seSIsInVuaXRzIiwibnVtYmVyQ29udHJvbFZvbHVtZVByb3BlcnR5IiwicmFuZ2UiLCJsYXp5TGluayIsImxpdGVycyIsImN1YmljTWV0ZXJzIiwidm9sdW1lTGl0ZXJzIiwibWFzcyIsInJlY29tcHV0ZURlcml2YXRpb24iLCJhZGp1c3RlZE1hc3MiLCJtaW4iLCJjb21ib01heFdpZHRoIiwiY29tYm9Cb3giLCJjcmVhdGVOb2RlIiwibmFtZVByb3BlcnR5IiwiZm9udCIsIkNPTUJPX0JPWF9JVEVNX0ZPTlQiLCJtYXhXaWR0aCIsInRhbmRlbU5hbWUiLCJJVEVNX1RBTkRFTV9OQU1FX1NVRkZJWCIsImN1c3RvbVN0cmluZ1Byb3BlcnR5IiwieE1hcmdpbiIsInlNYXJnaW4iLCJtYXNzTnVtYmVyQ29udHJvbCIsIm1hc3NTdHJpbmdQcm9wZXJ0eSIsInNsaWRlck9wdGlvbnMiLCJ0aHVtYk5vZGUiLCJ0aHVtYkZpbGwiLCJ0aHVtYllPZmZzZXQiLCJoZWlnaHQiLCJjb25zdHJhaW5WYWx1ZSIsInRvRml4ZWROdW1iZXIiLCJwaGV0aW9MaW5rZWRQcm9wZXJ0eSIsIm51bWJlckRpc3BsYXlPcHRpb25zIiwidmFsdWVQYXR0ZXJuIiwiS0lMT0dSQU1TX1BBVFRFUk5fU1RSSU5HX1BST1BFUlRZIiwidXNlRnVsbEhlaWdodCIsImFycm93QnV0dG9uT3B0aW9ucyIsImVuYWJsZWRFcHNpbG9uIiwiZW5hYmxlZFJhbmdlUHJvcGVydHkiLCJ0aXRsZU5vZGVPcHRpb25zIiwidmlzaWJsZVByb3BlcnR5T3B0aW9ucyIsImdldE51bWJlckNvbnRyb2xPcHRpb25zIiwidm9sdW1lTnVtYmVyQ29udHJvbCIsInZvbHVtZVN0cmluZ1Byb3BlcnR5Iiwicm91bmRTeW1tZXRyaWMiLCJWT0xVTUVfUEFUVEVSTl9TVFJJTkdfUFJPUEVSVFkiLCJ1c2VSaWNoVGV4dCIsImNoaWxkcmVuIiwiZmlsdGVyIiwiXyIsImlkZW50aXR5IiwibXV0YXRlIiwiZGVsdGEiLCJ0cmFja1NpemUiLCJkZWNpbWFsUGxhY2VzIiwidGV4dE9wdGlvbnMiLCJsYXlvdXRGdW5jdGlvbiIsImNyZWF0ZUxheW91dEZ1bmN0aW9uNCIsInNsaWRlclBhZGRpbmciLCJJVEVNX0ZPTlQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1hdGVyaWFsTWFzc1ZvbHVtZUNvbnRyb2xOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgY29udHJvbCB0aGF0IGFsbG93cyBtb2RpZmljYXRpb24gb2YgdGhlIG1hc3MgYW5kIHZvbHVtZSAod2hpY2ggY2FuIGJlIGxpbmtlZCwgb3IgdW5saW5rZWQgZm9yIGN1c3RvbSBtYXRlcmlhbHMpLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEeW5hbWljUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EeW5hbWljUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9SZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IE51bWJlckNvbnRyb2wsIHsgTnVtYmVyQ29udHJvbE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTnVtYmVyQ29udHJvbC5qcyc7XHJcbmltcG9ydCB7IEhCb3gsIE5vZGUsIFRleHQsIFRQYWludCwgVkJveCwgVkJveE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQ29tYm9Cb3ggZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0NvbWJvQm94LmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IFN0cmluZ0lPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9TdHJpbmdJTy5qcyc7XHJcbmltcG9ydCBkZW5zaXR5QnVveWFuY3lDb21tb24gZnJvbSAnLi4vLi4vZGVuc2l0eUJ1b3lhbmN5Q29tbW9uLmpzJztcclxuaW1wb3J0IERlbnNpdHlCdW95YW5jeUNvbW1vblN0cmluZ3MgZnJvbSAnLi4vLi4vRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBEZW5zaXR5QnVveWFuY3lDb21tb25Db25zdGFudHMgZnJvbSAnLi4vRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IE1hdGVyaWFsLCB7IE1hdGVyaWFsTmFtZSB9IGZyb20gJy4uL21vZGVsL01hdGVyaWFsLmpzJztcclxuaW1wb3J0IFByZWNpc2lvblNsaWRlclRodW1iIGZyb20gJy4vUHJlY2lzaW9uU2xpZGVyVGh1bWIuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IExJVEVSU19JTl9DVUJJQ19NRVRFUiA9IDEwMDA7XHJcbmNvbnN0IFRSQUNLX0hFSUdIVCA9IDM7XHJcblxyXG4vLyBBIHdvcmthcm91bmQgZm9yIGNoYW5naW5nIGEgRGVyaXZlZFByb3BlcnR5IHJhbmdlIFByb3BlcnR5IHRvIGEgTnVtYmVyUHJvcGVydHksIHdoZXJlIHRoZSBuZXcgcmFuZ2UgQU5EIHZhbHVlIHdpbGxcclxuLy8gbm90IG92ZXJsYXAgd2l0aCB0aGUgcHJldmlvdXMgb25lLlxyXG5jbGFzcyBXb3JrYXJvdW5kUmFuZ2UgZXh0ZW5kcyBSYW5nZSB7XHJcbiAgcHVibGljIG92ZXJyaWRlIGNvbnRhaW5zKCB2YWx1ZTogbnVtYmVyICk6IGJvb2xlYW4geyByZXR1cm4gdHJ1ZTsgfVxyXG59XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIGxhYmVsTm9kZT86IE5vZGUgfCBudWxsO1xyXG5cclxuICBtaW5NYXNzPzogbnVtYmVyO1xyXG4gIG1pbkN1c3RvbU1hc3M/OiBudW1iZXI7XHJcbiAgbWF4Q3VzdG9tTWFzcz86IG51bWJlcjtcclxuICBtYXhNYXNzPzogbnVtYmVyO1xyXG4gIG1pblZvbHVtZUxpdGVycz86IG51bWJlcjtcclxuICBtYXhWb2x1bWVMaXRlcnM/OiBudW1iZXI7XHJcbiAgbWluQ3VzdG9tVm9sdW1lTGl0ZXJzPzogbnVtYmVyO1xyXG5cclxuICBjb2xvcj86IFRQYWludDtcclxuXHJcbiAgLy8gUmVxdWlyZSB0aGUgdGFuZGVtXHJcbiAgdGFuZGVtOiBUYW5kZW07XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBNYXRlcmlhbE1hc3NWb2x1bWVDb250cm9sTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFZCb3hPcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWF0ZXJpYWxNYXNzVm9sdW1lQ29udHJvbE5vZGUgZXh0ZW5kcyBWQm94IHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtYXRlcmlhbFByb3BlcnR5OiBQcm9wZXJ0eTxNYXRlcmlhbD4sIG1hc3NQcm9wZXJ0eTogUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+LCB2b2x1bWVQcm9wZXJ0eTogUHJvcGVydHk8bnVtYmVyPiwgbWF0ZXJpYWxzOiBNYXRlcmlhbFtdLCBzZXRWb2x1bWU6ICggdm9sdW1lOiBudW1iZXIgKSA9PiB2b2lkLCBsaXN0UGFyZW50OiBOb2RlLCBwcm92aWRlZE9wdGlvbnM/OiBNYXRlcmlhbE1hc3NWb2x1bWVDb250cm9sTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxNYXRlcmlhbE1hc3NWb2x1bWVDb250cm9sTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBWQm94T3B0aW9ucz4oKSgge1xyXG4gICAgICBsYWJlbE5vZGU6IG51bGwsXHJcblxyXG4gICAgICBtaW5NYXNzOiAwLjEsXHJcbiAgICAgIG1pbkN1c3RvbU1hc3M6IDAuNSxcclxuICAgICAgbWF4Q3VzdG9tTWFzczogMTAsXHJcbiAgICAgIG1heE1hc3M6IDI3LFxyXG4gICAgICBtaW5Wb2x1bWVMaXRlcnM6IDEsXHJcbiAgICAgIG1heFZvbHVtZUxpdGVyczogMTAsXHJcbiAgICAgIG1pbkN1c3RvbVZvbHVtZUxpdGVyczogMSxcclxuXHJcbiAgICAgIGNvbG9yOiBudWxsXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCB0YW5kZW0gPSBvcHRpb25zLnRhbmRlbTtcclxuXHJcbiAgICBjb25zdCBtYXNzTnVtYmVyQ29udHJvbFRhbmRlbSA9IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtYXNzTnVtYmVyQ29udHJvbCcgKTtcclxuICAgIGNvbnN0IHZvbHVtZU51bWJlckNvbnRyb2xUYW5kZW0gPSB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndm9sdW1lTnVtYmVyQ29udHJvbCcgKTtcclxuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICBzcGFjaW5nOiAxNSxcclxuICAgICAgYWxpZ246ICdsZWZ0J1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IG1hdGVyaWFsTmFtZXM6IE1hdGVyaWFsTmFtZVtdID0gWyAuLi5tYXRlcmlhbHMubWFwKCBtYXRlcmlhbCA9PiBtYXRlcmlhbC5pZGVudGlmaWVyISApLCAnQ1VTVE9NJyBdO1xyXG5cclxuICAgIGNvbnN0IGNvbWJvQm94TWF0ZXJpYWxQcm9wZXJ0eSA9IG5ldyBEeW5hbWljUHJvcGVydHkoIG5ldyBQcm9wZXJ0eSggbWF0ZXJpYWxQcm9wZXJ0eSApLCB7XHJcbiAgICAgIGJpZGlyZWN0aW9uYWw6IHRydWUsXHJcbiAgICAgIG1hcDogKCBtYXRlcmlhbDogTWF0ZXJpYWwgKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIG1hdGVyaWFsLmN1c3RvbSA/ICdDVVNUT00nIDogbWF0ZXJpYWwuaWRlbnRpZmllciE7XHJcbiAgICAgIH0sXHJcbiAgICAgIGludmVyc2VNYXA6ICggbWF0ZXJpYWxOYW1lOiBNYXRlcmlhbE5hbWUgKTogTWF0ZXJpYWwgPT4ge1xyXG4gICAgICAgIGlmICggbWF0ZXJpYWxOYW1lID09PSAnQ1VTVE9NJyApIHtcclxuICAgICAgICAgIC8vIEhhbmRsZSBvdXIgbWluaW11bSB2b2x1bWUgaWYgd2UncmUgc3dpdGNoZWQgdG8gY3VzdG9tIChpZiBuZWVkZWQpXHJcbiAgICAgICAgICBjb25zdCB2b2x1bWUgPSBNYXRoLm1heCggdm9sdW1lUHJvcGVydHkudmFsdWUsIG9wdGlvbnMubWluQ3VzdG9tVm9sdW1lTGl0ZXJzIC8gTElURVJTX0lOX0NVQklDX01FVEVSICk7XHJcbiAgICAgICAgICByZXR1cm4gTWF0ZXJpYWwuY3JlYXRlQ3VzdG9tU29saWRNYXRlcmlhbCgge1xyXG4gICAgICAgICAgICBkZW5zaXR5OiBVdGlscy5jbGFtcCggbWF0ZXJpYWxQcm9wZXJ0eS52YWx1ZS5kZW5zaXR5LCBvcHRpb25zLm1pbkN1c3RvbU1hc3MgLyB2b2x1bWUsIG9wdGlvbnMubWF4Q3VzdG9tTWFzcyAvIHZvbHVtZSApXHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuIE1hdGVyaWFsWyBtYXRlcmlhbE5hbWUgXSBhcyBNYXRlcmlhbDtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHJlZW50cmFudDogdHJ1ZSxcclxuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NvbWJvQm94TWF0ZXJpYWxQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0N1cnJlbnQgbWF0ZXJpYWwgb2YgdGhlIGJsb2NrLiBDaGFuZ2luZyB0aGUgbWF0ZXJpYWwgd2lsbCByZXN1bHQgaW4gY2hhbmdlcyB0byB0aGUgbWFzcywgYnV0IHRoZSB2b2x1bWUgd2lsbCByZW1haW4gdGhlIHNhbWUuJyxcclxuICAgICAgdmFsaWRWYWx1ZXM6IG1hdGVyaWFsTmFtZXMsXHJcbiAgICAgIHBoZXRpb1ZhbHVlVHlwZTogU3RyaW5nSU9cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBXZSBuZWVkIHRvIHVzZSBcImxvY2tzXCIgc2luY2Ugb3VyIGJlaGF2aW9yIGlzIGRpZmZlcmVudCBiYXNlZCBvbiB3aGV0aGVyIHRoZSBtb2RlbCBvciB1c2VyIGlzIGNoYW5naW5nIHRoZSB2YWx1ZVxyXG4gICAgbGV0IG1vZGVsTWFzc0NoYW5naW5nID0gZmFsc2U7XHJcbiAgICBsZXQgdXNlck1hc3NDaGFuZ2luZyA9IGZhbHNlO1xyXG4gICAgbGV0IG1vZGVsVm9sdW1lQ2hhbmdpbmcgPSBmYWxzZTtcclxuICAgIGxldCB1c2VyVm9sdW1lQ2hhbmdpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBEZXJpdmVkUHJvcGVydHkgZG9lc24ndCBuZWVkIGRpc3Bvc2FsLCBzaW5jZSBldmVyeXRoaW5nIGhlcmUgbGl2ZXMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltdWxhdGlvblxyXG4gICAgY29uc3QgZW5hYmxlZE1hc3NSYW5nZVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBtYXRlcmlhbFByb3BlcnR5IF0sIG1hdGVyaWFsID0+IHtcclxuICAgICAgaWYgKCBtYXRlcmlhbC5jdXN0b20gKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBSYW5nZSggb3B0aW9ucy5taW5DdXN0b21NYXNzLCBvcHRpb25zLm1heEN1c3RvbU1hc3MgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBjb25zdCBkZW5zaXR5ID0gbWF0ZXJpYWwuZGVuc2l0eTtcclxuXHJcbiAgICAgICAgY29uc3QgbWluTWFzcyA9IFV0aWxzLmNsYW1wKCBkZW5zaXR5ICogb3B0aW9ucy5taW5Wb2x1bWVMaXRlcnMgLyBMSVRFUlNfSU5fQ1VCSUNfTUVURVIsIG9wdGlvbnMubWluTWFzcywgb3B0aW9ucy5tYXhNYXNzICk7XHJcbiAgICAgICAgY29uc3QgbWF4TWFzcyA9IFV0aWxzLmNsYW1wKCBkZW5zaXR5ICogb3B0aW9ucy5tYXhWb2x1bWVMaXRlcnMgLyBMSVRFUlNfSU5fQ1VCSUNfTUVURVIsIG9wdGlvbnMubWluTWFzcywgb3B0aW9ucy5tYXhNYXNzICk7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgV29ya2Fyb3VuZFJhbmdlKCBtaW5NYXNzLCBtYXhNYXNzICk7XHJcbiAgICAgIH1cclxuICAgIH0sIHtcclxuICAgICAgcmVlbnRyYW50OiB0cnVlLFxyXG4gICAgICBwaGV0aW9TdGF0ZTogZmFsc2UsXHJcbiAgICAgIHBoZXRpb1ZhbHVlVHlwZTogUmFuZ2UuUmFuZ2VJTyxcclxuICAgICAgdGFuZGVtOiBtYXNzTnVtYmVyQ29udHJvbFRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbmFibGVkTWFzc1JhbmdlUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBlbmFibGVkVm9sdW1lUmFuZ2VQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgbWF0ZXJpYWxQcm9wZXJ0eSBdLCBtYXRlcmlhbCA9PiB7XHJcbiAgICAgIHJldHVybiBuZXcgV29ya2Fyb3VuZFJhbmdlKFxyXG4gICAgICAgIG1hdGVyaWFsLmN1c3RvbSA/IE1hdGgubWF4KCBvcHRpb25zLm1pblZvbHVtZUxpdGVycywgb3B0aW9ucy5taW5DdXN0b21Wb2x1bWVMaXRlcnMgKSA6IG9wdGlvbnMubWluVm9sdW1lTGl0ZXJzLFxyXG4gICAgICAgIG9wdGlvbnMubWF4Vm9sdW1lTGl0ZXJzXHJcbiAgICAgICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gcGFzc2VkIHRvIHRoZSBOdW1iZXJDb250cm9sXHJcbiAgICBjb25zdCBtYXNzTnVtYmVyUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIG1hc3NQcm9wZXJ0eS52YWx1ZSwge1xyXG4gICAgICB0YW5kZW06IG1hc3NOdW1iZXJDb250cm9sVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ251bWJlckNvbnRyb2xNYXNzUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1N0YXRlOiBmYWxzZSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHVuaXRzOiAna2cnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gcGFzc2VkIHRvIHRoZSBOdW1iZXJDb250cm9sIC0gbGl0ZXJzIGZyb20gbV4zXHJcbiAgICBjb25zdCBudW1iZXJDb250cm9sVm9sdW1lUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIHZvbHVtZVByb3BlcnR5LnZhbHVlICogTElURVJTX0lOX0NVQklDX01FVEVSLCB7XHJcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIG9wdGlvbnMubWluVm9sdW1lTGl0ZXJzLCBvcHRpb25zLm1heFZvbHVtZUxpdGVycyApLFxyXG4gICAgICB0YW5kZW06IHZvbHVtZU51bWJlckNvbnRyb2xUYW5kZW0uY3JlYXRlVGFuZGVtKCAnbnVtYmVyQ29udHJvbFZvbHVtZVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9TdGF0ZTogZmFsc2UsXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICB1bml0czogJ0wnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVGhpcyBpbnN0YW5jZSBsaXZlcyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW11bGF0aW9uLCBzbyB3ZSBkb24ndCBuZWVkIHRvIHJlbW92ZSB0aGlzIGxpc3RlbmVyXHJcbiAgICBudW1iZXJDb250cm9sVm9sdW1lUHJvcGVydHkubGF6eUxpbmsoIGxpdGVycyA9PiB7XHJcbiAgICAgIGlmICggIW1vZGVsVm9sdW1lQ2hhbmdpbmcgJiYgIXVzZXJNYXNzQ2hhbmdpbmcgKSB7XHJcbiAgICAgICAgY29uc3QgY3ViaWNNZXRlcnMgPSBsaXRlcnMgLyBMSVRFUlNfSU5fQ1VCSUNfTUVURVI7XHJcblxyXG4gICAgICAgIHVzZXJWb2x1bWVDaGFuZ2luZyA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vIElmIHdlJ3JlIGN1c3RvbSwgYWRqdXN0IHRoZSBkZW5zaXR5XHJcbiAgICAgICAgaWYgKCBtYXRlcmlhbFByb3BlcnR5LnZhbHVlLmN1c3RvbSApIHtcclxuICAgICAgICAgIG1hdGVyaWFsUHJvcGVydHkudmFsdWUgPSBNYXRlcmlhbC5jcmVhdGVDdXN0b21Tb2xpZE1hdGVyaWFsKCB7XHJcbiAgICAgICAgICAgIGRlbnNpdHk6IG1hc3NQcm9wZXJ0eS52YWx1ZSAvIGN1YmljTWV0ZXJzXHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldFZvbHVtZSggY3ViaWNNZXRlcnMgKTtcclxuXHJcbiAgICAgICAgdXNlclZvbHVtZUNoYW5naW5nID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBUaGlzIGluc3RhbmNlIGxpdmVzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbXVsYXRpb24sIHNvIHdlIGRvbid0IG5lZWQgdG8gcmVtb3ZlIHRoaXMgbGlzdGVuZXJcclxuICAgIHZvbHVtZVByb3BlcnR5LmxhenlMaW5rKCBjdWJpY01ldGVycyA9PiB7XHJcbiAgICAgIGlmICggIXVzZXJWb2x1bWVDaGFuZ2luZyApIHtcclxuICAgICAgICBtb2RlbFZvbHVtZUNoYW5naW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIHZhbHVlIGlzIGNsb3NlIHRvIG1pbi9tYXgsIG1hc3NhZ2UgaXQgdG8gdGhlIGV4YWN0IHZhbHVlLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2RlbnNpdHkvaXNzdWVzLzQ2XHJcbiAgICAgICAgbGV0IHZvbHVtZUxpdGVycyA9IGN1YmljTWV0ZXJzICogTElURVJTX0lOX0NVQklDX01FVEVSO1xyXG4gICAgICAgIGlmICggdm9sdW1lTGl0ZXJzID4gb3B0aW9ucy5taW5Wb2x1bWVMaXRlcnMgJiYgdm9sdW1lTGl0ZXJzIDwgb3B0aW9ucy5taW5Wb2x1bWVMaXRlcnMgKyAxZS0xMCApIHtcclxuICAgICAgICAgIHZvbHVtZUxpdGVycyA9IG9wdGlvbnMubWluVm9sdW1lTGl0ZXJzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIHZvbHVtZUxpdGVycyA8IG9wdGlvbnMubWF4Vm9sdW1lTGl0ZXJzICYmIHZvbHVtZUxpdGVycyA+IG9wdGlvbnMubWF4Vm9sdW1lTGl0ZXJzIC0gMWUtMTAgKSB7XHJcbiAgICAgICAgICB2b2x1bWVMaXRlcnMgPSBvcHRpb25zLm1heFZvbHVtZUxpdGVycztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG51bWJlckNvbnRyb2xWb2x1bWVQcm9wZXJ0eS52YWx1ZSA9IFV0aWxzLmNsYW1wKCB2b2x1bWVMaXRlcnMsIG9wdGlvbnMubWluVm9sdW1lTGl0ZXJzLCBvcHRpb25zLm1heFZvbHVtZUxpdGVycyApO1xyXG5cclxuICAgICAgICBtb2RlbFZvbHVtZUNoYW5naW5nID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBUaGlzIGluc3RhbmNlIGxpdmVzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbXVsYXRpb24sIHNvIHdlIGRvbid0IG5lZWQgdG8gcmVtb3ZlIHRoaXMgbGlzdGVuZXJcclxuICAgIG1hc3NOdW1iZXJQcm9wZXJ0eS5sYXp5TGluayggbWFzcyA9PiB7XHJcbiAgICAgIGlmICggIW1vZGVsTWFzc0NoYW5naW5nICYmICF1c2VyVm9sdW1lQ2hhbmdpbmcgKSB7XHJcbiAgICAgICAgdXNlck1hc3NDaGFuZ2luZyA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmICggbWF0ZXJpYWxQcm9wZXJ0eS52YWx1ZS5jdXN0b20gKSB7XHJcbiAgICAgICAgICBtYXRlcmlhbFByb3BlcnR5LnZhbHVlID0gTWF0ZXJpYWwuY3JlYXRlQ3VzdG9tU29saWRNYXRlcmlhbCgge1xyXG4gICAgICAgICAgICBkZW5zaXR5OiBtYXNzIC8gdm9sdW1lUHJvcGVydHkudmFsdWVcclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBzZXRWb2x1bWUoIG1hc3MgLyBtYXRlcmlhbFByb3BlcnR5LnZhbHVlLmRlbnNpdHkgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHVzZXJNYXNzQ2hhbmdpbmcgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRoaXMgaW5zdGFuY2UgbGl2ZXMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltdWxhdGlvbiwgc28gd2UgZG9uJ3QgbmVlZCB0byByZW1vdmUgdGhpcyBsaXN0ZW5lclxyXG4gICAgbWFzc1Byb3BlcnR5LmxhenlMaW5rKCBtYXNzID0+IHtcclxuICAgICAgaWYgKCAhdXNlck1hc3NDaGFuZ2luZyApIHtcclxuICAgICAgICBtb2RlbE1hc3NDaGFuZ2luZyA9IHRydWU7XHJcblxyXG4gICAgICAgIGVuYWJsZWRNYXNzUmFuZ2VQcm9wZXJ0eS5yZWNvbXB1dGVEZXJpdmF0aW9uKCk7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSB2YWx1ZSBpcyBjbG9zZSB0byBtaW4vbWF4LCBtYXNzYWdlIGl0IHRvIHRoZSBleGFjdCB2YWx1ZSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9kZW5zaXR5L2lzc3Vlcy80NlxyXG4gICAgICAgIGxldCBhZGp1c3RlZE1hc3MgPSBtYXNzO1xyXG4gICAgICAgIGNvbnN0IG1pbiA9IGVuYWJsZWRNYXNzUmFuZ2VQcm9wZXJ0eS52YWx1ZS5taW47XHJcbiAgICAgICAgY29uc3QgbWF4ID0gZW5hYmxlZE1hc3NSYW5nZVByb3BlcnR5LnZhbHVlLm1heDtcclxuICAgICAgICBpZiAoIGFkanVzdGVkTWFzcyA+IG1pbiAmJiBhZGp1c3RlZE1hc3MgPCBtaW4gKyAxZS0xMCApIHtcclxuICAgICAgICAgIGFkanVzdGVkTWFzcyA9IG1pbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCBhZGp1c3RlZE1hc3MgPCBtYXggJiYgYWRqdXN0ZWRNYXNzID4gbWF4IC0gMWUtMTAgKSB7XHJcbiAgICAgICAgICBhZGp1c3RlZE1hc3MgPSBtYXg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBtYXNzTnVtYmVyUHJvcGVydHkudmFsdWUgPSBVdGlscy5jbGFtcCggYWRqdXN0ZWRNYXNzLCBtaW4sIG1heCApO1xyXG5cclxuICAgICAgICBtb2RlbE1hc3NDaGFuZ2luZyA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY29tYm9NYXhXaWR0aCA9IG9wdGlvbnMubGFiZWxOb2RlID8gMTEwIDogMTYwO1xyXG4gICAgY29uc3QgY29tYm9Cb3ggPSBuZXcgQ29tYm9Cb3goIGNvbWJvQm94TWF0ZXJpYWxQcm9wZXJ0eSwgW1xyXG4gICAgICAuLi5tYXRlcmlhbHMubWFwKCBtYXRlcmlhbCA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHZhbHVlOiBtYXRlcmlhbC5pZGVudGlmaWVyISxcclxuICAgICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBUZXh0KCBtYXRlcmlhbC5uYW1lUHJvcGVydHksIHtcclxuICAgICAgICAgICAgZm9udDogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29uc3RhbnRzLkNPTUJPX0JPWF9JVEVNX0ZPTlQsXHJcbiAgICAgICAgICAgIG1heFdpZHRoOiBjb21ib01heFdpZHRoXHJcbiAgICAgICAgICB9ICksXHJcbiAgICAgICAgICB0YW5kZW1OYW1lOiBgJHttYXRlcmlhbC50YW5kZW1OYW1lfSR7Q29tYm9Cb3guSVRFTV9UQU5ERU1fTkFNRV9TVUZGSVh9YFxyXG4gICAgICAgIH07XHJcbiAgICAgIH0gKSxcclxuICAgICAge1xyXG4gICAgICAgIHZhbHVlOiAnQ1VTVE9NJyxcclxuICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgVGV4dCggRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXRlcmlhbC5jdXN0b21TdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICAgICAgZm9udDogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29uc3RhbnRzLkNPTUJPX0JPWF9JVEVNX0ZPTlQsXHJcbiAgICAgICAgICBtYXhXaWR0aDogY29tYm9NYXhXaWR0aFxyXG4gICAgICAgIH0gKSxcclxuICAgICAgICB0YW5kZW1OYW1lOiBgY3VzdG9tJHtDb21ib0JveC5JVEVNX1RBTkRFTV9OQU1FX1NVRkZJWH1gXHJcbiAgICAgIH1cclxuICAgIF0sIGxpc3RQYXJlbnQsIHtcclxuICAgICAgeE1hcmdpbjogOCxcclxuICAgICAgeU1hcmdpbjogNCxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY29tYm9Cb3gnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBtYXNzTnVtYmVyQ29udHJvbCA9IG5ldyBOdW1iZXJDb250cm9sKCBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzLm1hc3NTdHJpbmdQcm9wZXJ0eSwgbWFzc051bWJlclByb3BlcnR5LCBuZXcgUmFuZ2UoIG9wdGlvbnMubWluTWFzcywgb3B0aW9ucy5tYXhNYXNzICksIGNvbWJpbmVPcHRpb25zPE51bWJlckNvbnRyb2xPcHRpb25zPigge1xyXG4gICAgICBzbGlkZXJPcHRpb25zOiB7XHJcbiAgICAgICAgdGh1bWJOb2RlOiBuZXcgUHJlY2lzaW9uU2xpZGVyVGh1bWIoIHtcclxuICAgICAgICAgIHRodW1iRmlsbDogb3B0aW9ucy5jb2xvcixcclxuICAgICAgICAgIHRhbmRlbTogbWFzc051bWJlckNvbnRyb2xUYW5kZW0uY3JlYXRlVGFuZGVtKCAnc2xpZGVyJyApLmNyZWF0ZVRhbmRlbSggJ3RodW1iTm9kZScgKVxyXG4gICAgICAgIH0gKSxcclxuICAgICAgICB0aHVtYllPZmZzZXQ6IG5ldyBQcmVjaXNpb25TbGlkZXJUaHVtYigpLmhlaWdodCAvIDIgLSBUUkFDS19IRUlHSFQgLyAyLFxyXG4gICAgICAgIGNvbnN0cmFpblZhbHVlOiAoIHZhbHVlOiBudW1iZXIgKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCByYW5nZSA9IGVuYWJsZWRNYXNzUmFuZ2VQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAgICAgICAvLyBEb24ndCBzbmFwIGJlZm9yZSByYW5nZXMsIHNpbmNlIHRoaXMgZG9lc24ndCB3b3JrIGZvciBTdHlyb2ZvYW0gY2FzZSwgc2VlXHJcbiAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZGVuc2l0eS9pc3N1ZXMvNDZcclxuICAgICAgICAgIGlmICggdmFsdWUgPD0gcmFuZ2UubWluICkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmFuZ2UubWluO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKCB2YWx1ZSA+PSByYW5nZS5tYXggKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByYW5nZS5tYXg7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gZW5hYmxlZE1hc3NSYW5nZVByb3BlcnR5LnZhbHVlLmNvbnN0cmFpblZhbHVlKCBVdGlscy50b0ZpeGVkTnVtYmVyKCB2YWx1ZSwgMSApICk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwaGV0aW9MaW5rZWRQcm9wZXJ0eTogbWFzc1Byb3BlcnR5XHJcbiAgICAgIH0sXHJcbiAgICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XHJcbiAgICAgICAgdmFsdWVQYXR0ZXJuOiBEZW5zaXR5QnVveWFuY3lDb21tb25Db25zdGFudHMuS0lMT0dSQU1TX1BBVFRFUk5fU1RSSU5HX1BST1BFUlRZLFxyXG4gICAgICAgIHVzZUZ1bGxIZWlnaHQ6IHRydWVcclxuICAgICAgfSxcclxuICAgICAgYXJyb3dCdXR0b25PcHRpb25zOiB7XHJcbiAgICAgICAgZW5hYmxlZEVwc2lsb246IDFlLTdcclxuICAgICAgfSxcclxuICAgICAgZW5hYmxlZFJhbmdlUHJvcGVydHk6IGVuYWJsZWRNYXNzUmFuZ2VQcm9wZXJ0eSxcclxuICAgICAgdGFuZGVtOiBtYXNzTnVtYmVyQ29udHJvbFRhbmRlbSxcclxuICAgICAgdGl0bGVOb2RlT3B0aW9uczoge1xyXG4gICAgICAgIHZpc2libGVQcm9wZXJ0eU9wdGlvbnM6IHtcclxuICAgICAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LCBNYXRlcmlhbE1hc3NWb2x1bWVDb250cm9sTm9kZS5nZXROdW1iZXJDb250cm9sT3B0aW9ucygpICkgKTtcclxuXHJcbiAgICBjb25zdCB2b2x1bWVOdW1iZXJDb250cm9sID0gbmV3IE51bWJlckNvbnRyb2woIERlbnNpdHlCdW95YW5jeUNvbW1vblN0cmluZ3Mudm9sdW1lU3RyaW5nUHJvcGVydHksIG51bWJlckNvbnRyb2xWb2x1bWVQcm9wZXJ0eSwgbmV3IFJhbmdlKCBvcHRpb25zLm1pblZvbHVtZUxpdGVycywgb3B0aW9ucy5tYXhWb2x1bWVMaXRlcnMgKSwgY29tYmluZU9wdGlvbnM8TnVtYmVyQ29udHJvbE9wdGlvbnM+KCB7XHJcbiAgICAgIHNsaWRlck9wdGlvbnM6IHtcclxuICAgICAgICB0aHVtYk5vZGU6IG5ldyBQcmVjaXNpb25TbGlkZXJUaHVtYigge1xyXG4gICAgICAgICAgdGh1bWJGaWxsOiBvcHRpb25zLmNvbG9yLFxyXG4gICAgICAgICAgdGFuZGVtOiB2b2x1bWVOdW1iZXJDb250cm9sVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NsaWRlcicgKS5jcmVhdGVUYW5kZW0oICd0aHVtYk5vZGUnIClcclxuICAgICAgICB9ICksXHJcbiAgICAgICAgdGh1bWJZT2Zmc2V0OiBuZXcgUHJlY2lzaW9uU2xpZGVyVGh1bWIoKS5oZWlnaHQgLyAyIC0gVFJBQ0tfSEVJR0hUIC8gMixcclxuICAgICAgICBjb25zdHJhaW5WYWx1ZTogKCB2YWx1ZTogbnVtYmVyICkgPT4gVXRpbHMucm91bmRTeW1tZXRyaWMoIHZhbHVlICogMiApIC8gMixcclxuICAgICAgICBwaGV0aW9MaW5rZWRQcm9wZXJ0eTogdm9sdW1lUHJvcGVydHlcclxuICAgICAgfSxcclxuICAgICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcclxuICAgICAgICB2YWx1ZVBhdHRlcm46IERlbnNpdHlCdW95YW5jeUNvbW1vbkNvbnN0YW50cy5WT0xVTUVfUEFUVEVSTl9TVFJJTkdfUFJPUEVSVFksXHJcbiAgICAgICAgdXNlUmljaFRleHQ6IHRydWUsXHJcbiAgICAgICAgdXNlRnVsbEhlaWdodDogdHJ1ZVxyXG4gICAgICB9LFxyXG4gICAgICBhcnJvd0J1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICBlbmFibGVkRXBzaWxvbjogMWUtN1xyXG4gICAgICB9LFxyXG4gICAgICBlbmFibGVkUmFuZ2VQcm9wZXJ0eTogZW5hYmxlZFZvbHVtZVJhbmdlUHJvcGVydHksXHJcbiAgICAgIHRhbmRlbTogdm9sdW1lTnVtYmVyQ29udHJvbFRhbmRlbSxcclxuICAgICAgdGl0bGVOb2RlT3B0aW9uczoge1xyXG4gICAgICAgIHZpc2libGVQcm9wZXJ0eU9wdGlvbnM6IHtcclxuICAgICAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LCBNYXRlcmlhbE1hc3NWb2x1bWVDb250cm9sTm9kZS5nZXROdW1iZXJDb250cm9sT3B0aW9ucygpICkgKTtcclxuXHJcbiAgICB0aGlzLmNoaWxkcmVuID0gW1xyXG4gICAgICBuZXcgSEJveCgge1xyXG4gICAgICAgIHNwYWNpbmc6IDUsXHJcbiAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgIGNvbWJvQm94LFxyXG4gICAgICAgICAgLi4uKCBbIG9wdGlvbnMubGFiZWxOb2RlIF0uZmlsdGVyKCBfLmlkZW50aXR5ICkgYXMgTm9kZVtdIClcclxuICAgICAgICBdXHJcbiAgICAgIH0gKSxcclxuICAgICAgbWFzc051bWJlckNvbnRyb2wsXHJcbiAgICAgIHZvbHVtZU51bWJlckNvbnRyb2xcclxuICAgIF07XHJcblxyXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGRlZmF1bHQgTnVtYmVyQ29udHJvbCBvcHRpb25zIHVzZWQgYnkgdGhpcyBjb21wb25lbnQuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBnZXROdW1iZXJDb250cm9sT3B0aW9ucygpOiBOdW1iZXJDb250cm9sT3B0aW9ucyB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBkZWx0YTogMC4wMSxcclxuICAgICAgc2xpZGVyT3B0aW9uczoge1xyXG4gICAgICAgIHRyYWNrU2l6ZTogbmV3IERpbWVuc2lvbjIoIDEyMCwgVFJBQ0tfSEVJR0hUIClcclxuICAgICAgfSxcclxuICAgICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcclxuICAgICAgICBkZWNpbWFsUGxhY2VzOiAyLFxyXG4gICAgICAgIHRleHRPcHRpb25zOiB7XHJcbiAgICAgICAgICBtYXhXaWR0aDogNjBcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVzZUZ1bGxIZWlnaHQ6IHRydWVcclxuICAgICAgfSxcclxuICAgICAgbGF5b3V0RnVuY3Rpb246IE51bWJlckNvbnRyb2wuY3JlYXRlTGF5b3V0RnVuY3Rpb240KCB7XHJcbiAgICAgICAgc2xpZGVyUGFkZGluZzogNVxyXG4gICAgICB9ICksXHJcbiAgICAgIHRpdGxlTm9kZU9wdGlvbnM6IHtcclxuICAgICAgICBmb250OiBEZW5zaXR5QnVveWFuY3lDb21tb25Db25zdGFudHMuSVRFTV9GT05ULFxyXG4gICAgICAgIG1heFdpZHRoOiA5MFxyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG5cclxuZGVuc2l0eUJ1b3lhbmN5Q29tbW9uLnJlZ2lzdGVyKCAnTWF0ZXJpYWxNYXNzVm9sdW1lQ29udHJvbE5vZGUnLCBNYXRlcmlhbE1hc3NWb2x1bWVDb250cm9sTm9kZSApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsUUFBUSxNQUFNLGlDQUFpQztBQUV0RCxPQUFPQyxVQUFVLE1BQU0sa0NBQWtDO0FB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