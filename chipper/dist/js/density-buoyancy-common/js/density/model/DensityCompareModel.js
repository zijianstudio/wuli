// Copyright 2019-2022, University of Colorado Boulder

/**
 * The main model for the Compare screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BlockSetModel from '../../common/model/BlockSetModel.js';
import Cube from '../../common/model/Cube.js';
import Material from '../../common/model/Material.js';
import DensityBuoyancyCommonColors from '../../common/view/DensityBuoyancyCommonColors.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
export class BlockSet extends EnumerationValue {
  static SAME_MASS = new BlockSet();
  static SAME_VOLUME = new BlockSet();
  static SAME_DENSITY = new BlockSet();
  static enumeration = new Enumeration(BlockSet, {
    phetioDocumentation: 'Block set'
  });
}
export default class DensityCompareModel extends BlockSetModel {
  constructor(providedOptions) {
    const tandem = providedOptions.tandem;
    const blockSetsTandem = tandem.createTandem('blockSets');
    const sameMassTandem = blockSetsTandem.createTandem('sameMass');
    const sameVolumeTandem = blockSetsTandem.createTandem('sameVolume');
    const sameDensityTandem = blockSetsTandem.createTandem('sameDensity');
    const massProperty = new NumberProperty(5, {
      range: new Range(1, 10),
      tandem: tandem.createTandem('massProperty'),
      units: 'kg'
    });
    const volumeProperty = new NumberProperty(0.005, {
      range: new Range(0.001, 0.01),
      tandem: tandem.createTandem('volumeProperty'),
      units: 'm^3'
    });
    const densityProperty = new NumberProperty(500, {
      range: new Range(100, 2000),
      tandem: tandem.createTandem('densityProperty'),
      units: 'kg/m^3'
    });
    const createMaterialProperty = (colorProperty, densityProperty) => {
      return new DerivedProperty([colorProperty, densityProperty], (color, density) => {
        const lightness = Material.getCustomLightness(density); // 0-255

        const modifier = 0.1;
        const rawValue = (lightness / 128 - 1) * (1 - modifier) + modifier;
        const power = 0.7;
        const modifiedColor = color.colorUtilsBrightness(Math.sign(rawValue) * Math.pow(Math.abs(rawValue), power));
        return Material.createCustomMaterial({
          density: density,
          customColor: new Property(modifiedColor, {
            tandem: Tandem.OPT_OUT
          })
        });
      }, {
        tandem: Tandem.OPT_OUT
      });
    };
    const minScreenVolume = 0.001 - 1e-7;
    const maxScreenVolume = 0.01 + 1e-7;
    const commonCubeOptions = {
      minVolume: minScreenVolume,
      maxVolume: maxScreenVolume
    };
    const sameMassYellowDensityProperty = new NumberProperty(500, {
      tandem: Tandem.OPT_OUT
    });
    const sameMassBlueDensityProperty = new NumberProperty(1000, {
      tandem: Tandem.OPT_OUT
    });
    const sameMassGreenDensityProperty = new NumberProperty(2000, {
      tandem: Tandem.OPT_OUT
    });
    const sameMassRedDensityProperty = new NumberProperty(4000, {
      tandem: Tandem.OPT_OUT
    });
    const sameVolumeYellowDensityProperty = new NumberProperty(1600, {
      tandem: Tandem.OPT_OUT
    });
    const sameVolumeBlueDensityProperty = new NumberProperty(1200, {
      tandem: Tandem.OPT_OUT
    });
    const sameVolumeGreenDensityProperty = new NumberProperty(800, {
      tandem: Tandem.OPT_OUT
    });
    const sameVolumeRedDensityProperty = new NumberProperty(400, {
      tandem: Tandem.OPT_OUT
    });
    const sameDensityYellowDensityProperty = new NumberProperty(500, {
      tandem: Tandem.OPT_OUT
    });
    const sameDensityBlueDensityProperty = new NumberProperty(500, {
      tandem: Tandem.OPT_OUT
    });
    const sameDensityGreenDensityProperty = new NumberProperty(500, {
      tandem: Tandem.OPT_OUT
    });
    const sameDensityRedDensityProperty = new NumberProperty(500, {
      tandem: Tandem.OPT_OUT
    });
    const sameMassYellowMaterialProperty = createMaterialProperty(DensityBuoyancyCommonColors.compareYellowColorProperty, sameMassYellowDensityProperty);
    const sameMassBlueMaterialProperty = createMaterialProperty(DensityBuoyancyCommonColors.compareBlueColorProperty, sameMassBlueDensityProperty);
    const sameMassGreenMaterialProperty = createMaterialProperty(DensityBuoyancyCommonColors.compareGreenColorProperty, sameMassGreenDensityProperty);
    const sameMassRedMaterialProperty = createMaterialProperty(DensityBuoyancyCommonColors.compareRedColorProperty, sameMassRedDensityProperty);
    const sameVolumeYellowMaterialProperty = createMaterialProperty(DensityBuoyancyCommonColors.compareYellowColorProperty, sameVolumeYellowDensityProperty);
    const sameVolumeBlueMaterialProperty = createMaterialProperty(DensityBuoyancyCommonColors.compareBlueColorProperty, sameVolumeBlueDensityProperty);
    const sameVolumeGreenMaterialProperty = createMaterialProperty(DensityBuoyancyCommonColors.compareGreenColorProperty, sameVolumeGreenDensityProperty);
    const sameVolumeRedMaterialProperty = createMaterialProperty(DensityBuoyancyCommonColors.compareRedColorProperty, sameVolumeRedDensityProperty);
    const sameDensityYellowMaterialProperty = createMaterialProperty(DensityBuoyancyCommonColors.compareYellowColorProperty, sameDensityYellowDensityProperty);
    const sameDensityBlueMaterialProperty = createMaterialProperty(DensityBuoyancyCommonColors.compareBlueColorProperty, sameDensityBlueDensityProperty);
    const sameDensityGreenMaterialProperty = createMaterialProperty(DensityBuoyancyCommonColors.compareGreenColorProperty, sameDensityGreenDensityProperty);
    const sameDensityRedMaterialProperty = createMaterialProperty(DensityBuoyancyCommonColors.compareRedColorProperty, sameDensityRedDensityProperty);
    const createMasses = (model, blockSet) => {
      let masses;
      switch (blockSet) {
        case BlockSet.SAME_MASS:
          {
            const sameMassYellowMass = Cube.createWithMass(model.engine, sameMassYellowMaterialProperty.value, Vector2.ZERO, 5, combineOptions({}, commonCubeOptions, {
              tandem: sameMassTandem.createTandem('yellowBlock')
            }));
            const sameMassBlueMass = Cube.createWithMass(model.engine, sameMassBlueMaterialProperty.value, Vector2.ZERO, 5, combineOptions({}, commonCubeOptions, {
              tandem: sameMassTandem.createTandem('blueBlock')
            }));
            const sameMassGreenMass = Cube.createWithMass(model.engine, sameMassGreenMaterialProperty.value, Vector2.ZERO, 5, combineOptions({}, commonCubeOptions, {
              tandem: sameMassTandem.createTandem('greenBlock')
            }));
            const sameMassRedMass = Cube.createWithMass(model.engine, sameMassRedMaterialProperty.value, Vector2.ZERO, 5, combineOptions({}, commonCubeOptions, {
              tandem: sameMassTandem.createTandem('redBlock')
            }));
            sameMassYellowMaterialProperty.link(material => {
              sameMassYellowMass.materialProperty.value = material;
            });
            sameMassBlueMaterialProperty.link(material => {
              sameMassBlueMass.materialProperty.value = material;
            });
            sameMassGreenMaterialProperty.link(material => {
              sameMassGreenMass.materialProperty.value = material;
            });
            sameMassRedMaterialProperty.link(material => {
              sameMassRedMass.materialProperty.value = material;
            });
            masses = [sameMassYellowMass, sameMassBlueMass, sameMassGreenMass, sameMassRedMass];

            // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
            massProperty.lazyLink(massValue => {
              sameMassYellowDensityProperty.value = massValue / sameMassYellowMass.volumeProperty.value;
              sameMassBlueDensityProperty.value = massValue / sameMassBlueMass.volumeProperty.value;
              sameMassGreenDensityProperty.value = massValue / sameMassGreenMass.volumeProperty.value;
              sameMassRedDensityProperty.value = massValue / sameMassRedMass.volumeProperty.value;
            });
          }
          break;
        case BlockSet.SAME_VOLUME:
          {
            // Our volume listener is triggered AFTER the cubes have phet-io applyState run, so we can't rely on
            // inspecting their mass at that time (and instead need an external reference).
            // See https://github.com/phetsims/density/issues/111
            const massValues = {
              yellow: 8,
              blue: 6,
              green: 4,
              red: 2
            };
            const sameVolumeYellowMass = Cube.createWithMass(model.engine, sameVolumeYellowMaterialProperty.value, Vector2.ZERO, massValues.yellow, combineOptions({}, commonCubeOptions, {
              tandem: sameVolumeTandem.createTandem('yellowBlock')
            }));
            const sameVolumeBlueMass = Cube.createWithMass(model.engine, sameVolumeBlueMaterialProperty.value, Vector2.ZERO, massValues.blue, combineOptions({}, commonCubeOptions, {
              tandem: sameVolumeTandem.createTandem('blueBlock')
            }));
            const sameVolumeGreenMass = Cube.createWithMass(model.engine, sameVolumeGreenMaterialProperty.value, Vector2.ZERO, massValues.green, combineOptions({}, commonCubeOptions, {
              tandem: sameVolumeTandem.createTandem('greenBlock')
            }));
            const sameVolumeRedMass = Cube.createWithMass(model.engine, sameVolumeRedMaterialProperty.value, Vector2.ZERO, massValues.red, combineOptions({}, commonCubeOptions, {
              tandem: sameVolumeTandem.createTandem('redBlock')
            }));
            sameVolumeYellowMaterialProperty.link(material => {
              sameVolumeYellowMass.materialProperty.value = material;
            });
            sameVolumeBlueMaterialProperty.link(material => {
              sameVolumeBlueMass.materialProperty.value = material;
            });
            sameVolumeGreenMaterialProperty.link(material => {
              sameVolumeGreenMass.materialProperty.value = material;
            });
            sameVolumeRedMaterialProperty.link(material => {
              sameVolumeRedMass.materialProperty.value = material;
            });
            masses = [sameVolumeYellowMass, sameVolumeBlueMass, sameVolumeGreenMass, sameVolumeRedMass];

            // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
            volumeProperty.lazyLink(volume => {
              const size = Cube.boundsFromVolume(volume);
              sameVolumeYellowMass.updateSize(size);
              sameVolumeBlueMass.updateSize(size);
              sameVolumeGreenMass.updateSize(size);
              sameVolumeRedMass.updateSize(size);
              sameVolumeYellowDensityProperty.value = massValues.yellow / volume;
              sameVolumeBlueDensityProperty.value = massValues.blue / volume;
              sameVolumeGreenDensityProperty.value = massValues.green / volume;
              sameVolumeRedDensityProperty.value = massValues.red / volume;
            });
          }
          break;
        case BlockSet.SAME_DENSITY:
          {
            const sameDensityYellowMass = Cube.createWithMass(model.engine, sameDensityYellowMaterialProperty.value, Vector2.ZERO, 3, combineOptions({}, commonCubeOptions, {
              tandem: sameDensityTandem.createTandem('yellowBlock')
            }));
            const sameDensityBlueMass = Cube.createWithMass(model.engine, sameDensityBlueMaterialProperty.value, Vector2.ZERO, 2, combineOptions({}, commonCubeOptions, {
              tandem: sameDensityTandem.createTandem('blueBlock')
            }));
            const sameDensityGreenMass = Cube.createWithMass(model.engine, sameDensityGreenMaterialProperty.value, Vector2.ZERO, 1, combineOptions({}, commonCubeOptions, {
              tandem: sameDensityTandem.createTandem('greenBlock')
            }));
            const sameDensityRedMass = Cube.createWithMass(model.engine, sameDensityRedMaterialProperty.value, Vector2.ZERO, 0.5, combineOptions({}, commonCubeOptions, {
              tandem: sameDensityTandem.createTandem('redBlock')
            }));
            sameDensityYellowMaterialProperty.link(material => {
              sameDensityYellowMass.materialProperty.value = material;
            });
            sameDensityBlueMaterialProperty.link(material => {
              sameDensityBlueMass.materialProperty.value = material;
            });
            sameDensityGreenMaterialProperty.link(material => {
              sameDensityGreenMass.materialProperty.value = material;
            });
            sameDensityRedMaterialProperty.link(material => {
              sameDensityRedMass.materialProperty.value = material;
            });
            masses = [sameDensityYellowMass, sameDensityBlueMass, sameDensityGreenMass, sameDensityRedMass];

            // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
            densityProperty.lazyLink(density => {
              sameDensityYellowDensityProperty.value = density;
              sameDensityBlueDensityProperty.value = density;
              sameDensityGreenDensityProperty.value = density;
              sameDensityRedDensityProperty.value = density;
            });
          }
          break;
        default:
          throw new Error(`unknown blockSet: ${blockSet}`);
      }
      return masses;
    };
    const positionMasses = (model, blockSet, masses) => {
      switch (blockSet) {
        case BlockSet.SAME_MASS:
          model.positionMassesLeft([masses[0], masses[1]]);
          model.positionMassesRight([masses[2], masses[3]]);
          break;
        case BlockSet.SAME_VOLUME:
          model.positionMassesLeft([masses[3], masses[0]]);
          model.positionMassesRight([masses[1], masses[2]]);
          break;
        case BlockSet.SAME_DENSITY:
          model.positionMassesLeft([masses[0], masses[1]]);
          model.positionMassesRight([masses[2], masses[3]]);
          break;
        default:
          throw new Error(`unknown blockSet: ${blockSet}`);
      }
    };
    const options = optionize()({
      initialMode: BlockSet.SAME_MASS,
      BlockSet: BlockSet.enumeration,
      showMassesDefault: true,
      canShowForces: false,
      createMassesCallback: createMasses,
      regenerateMassesCallback: _.noop,
      positionMassesCallback: positionMasses
    }, providedOptions);
    super(options);

    // {Property.<number>}
    this.massProperty = massProperty;
    this.volumeProperty = volumeProperty;
    this.densityProperty = densityProperty;
    this.uninterpolateMasses();
  }

  /**
   * Resets values to their original state
   */
  reset() {
    this.massProperty.reset();
    this.volumeProperty.reset();
    this.densityProperty.reset();
    super.reset();
  }
}
densityBuoyancyCommon.register('DensityCompareModel', DensityCompareModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwiUmFuZ2UiLCJWZWN0b3IyIiwiRW51bWVyYXRpb24iLCJFbnVtZXJhdGlvblZhbHVlIiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJUYW5kZW0iLCJCbG9ja1NldE1vZGVsIiwiQ3ViZSIsIk1hdGVyaWFsIiwiRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29sb3JzIiwiZGVuc2l0eUJ1b3lhbmN5Q29tbW9uIiwiQmxvY2tTZXQiLCJTQU1FX01BU1MiLCJTQU1FX1ZPTFVNRSIsIlNBTUVfREVOU0lUWSIsImVudW1lcmF0aW9uIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsIkRlbnNpdHlDb21wYXJlTW9kZWwiLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsInRhbmRlbSIsImJsb2NrU2V0c1RhbmRlbSIsImNyZWF0ZVRhbmRlbSIsInNhbWVNYXNzVGFuZGVtIiwic2FtZVZvbHVtZVRhbmRlbSIsInNhbWVEZW5zaXR5VGFuZGVtIiwibWFzc1Byb3BlcnR5IiwicmFuZ2UiLCJ1bml0cyIsInZvbHVtZVByb3BlcnR5IiwiZGVuc2l0eVByb3BlcnR5IiwiY3JlYXRlTWF0ZXJpYWxQcm9wZXJ0eSIsImNvbG9yUHJvcGVydHkiLCJjb2xvciIsImRlbnNpdHkiLCJsaWdodG5lc3MiLCJnZXRDdXN0b21MaWdodG5lc3MiLCJtb2RpZmllciIsInJhd1ZhbHVlIiwicG93ZXIiLCJtb2RpZmllZENvbG9yIiwiY29sb3JVdGlsc0JyaWdodG5lc3MiLCJNYXRoIiwic2lnbiIsInBvdyIsImFicyIsImNyZWF0ZUN1c3RvbU1hdGVyaWFsIiwiY3VzdG9tQ29sb3IiLCJPUFRfT1VUIiwibWluU2NyZWVuVm9sdW1lIiwibWF4U2NyZWVuVm9sdW1lIiwiY29tbW9uQ3ViZU9wdGlvbnMiLCJtaW5Wb2x1bWUiLCJtYXhWb2x1bWUiLCJzYW1lTWFzc1llbGxvd0RlbnNpdHlQcm9wZXJ0eSIsInNhbWVNYXNzQmx1ZURlbnNpdHlQcm9wZXJ0eSIsInNhbWVNYXNzR3JlZW5EZW5zaXR5UHJvcGVydHkiLCJzYW1lTWFzc1JlZERlbnNpdHlQcm9wZXJ0eSIsInNhbWVWb2x1bWVZZWxsb3dEZW5zaXR5UHJvcGVydHkiLCJzYW1lVm9sdW1lQmx1ZURlbnNpdHlQcm9wZXJ0eSIsInNhbWVWb2x1bWVHcmVlbkRlbnNpdHlQcm9wZXJ0eSIsInNhbWVWb2x1bWVSZWREZW5zaXR5UHJvcGVydHkiLCJzYW1lRGVuc2l0eVllbGxvd0RlbnNpdHlQcm9wZXJ0eSIsInNhbWVEZW5zaXR5Qmx1ZURlbnNpdHlQcm9wZXJ0eSIsInNhbWVEZW5zaXR5R3JlZW5EZW5zaXR5UHJvcGVydHkiLCJzYW1lRGVuc2l0eVJlZERlbnNpdHlQcm9wZXJ0eSIsInNhbWVNYXNzWWVsbG93TWF0ZXJpYWxQcm9wZXJ0eSIsImNvbXBhcmVZZWxsb3dDb2xvclByb3BlcnR5Iiwic2FtZU1hc3NCbHVlTWF0ZXJpYWxQcm9wZXJ0eSIsImNvbXBhcmVCbHVlQ29sb3JQcm9wZXJ0eSIsInNhbWVNYXNzR3JlZW5NYXRlcmlhbFByb3BlcnR5IiwiY29tcGFyZUdyZWVuQ29sb3JQcm9wZXJ0eSIsInNhbWVNYXNzUmVkTWF0ZXJpYWxQcm9wZXJ0eSIsImNvbXBhcmVSZWRDb2xvclByb3BlcnR5Iiwic2FtZVZvbHVtZVllbGxvd01hdGVyaWFsUHJvcGVydHkiLCJzYW1lVm9sdW1lQmx1ZU1hdGVyaWFsUHJvcGVydHkiLCJzYW1lVm9sdW1lR3JlZW5NYXRlcmlhbFByb3BlcnR5Iiwic2FtZVZvbHVtZVJlZE1hdGVyaWFsUHJvcGVydHkiLCJzYW1lRGVuc2l0eVllbGxvd01hdGVyaWFsUHJvcGVydHkiLCJzYW1lRGVuc2l0eUJsdWVNYXRlcmlhbFByb3BlcnR5Iiwic2FtZURlbnNpdHlHcmVlbk1hdGVyaWFsUHJvcGVydHkiLCJzYW1lRGVuc2l0eVJlZE1hdGVyaWFsUHJvcGVydHkiLCJjcmVhdGVNYXNzZXMiLCJtb2RlbCIsImJsb2NrU2V0IiwibWFzc2VzIiwic2FtZU1hc3NZZWxsb3dNYXNzIiwiY3JlYXRlV2l0aE1hc3MiLCJlbmdpbmUiLCJ2YWx1ZSIsIlpFUk8iLCJzYW1lTWFzc0JsdWVNYXNzIiwic2FtZU1hc3NHcmVlbk1hc3MiLCJzYW1lTWFzc1JlZE1hc3MiLCJsaW5rIiwibWF0ZXJpYWwiLCJtYXRlcmlhbFByb3BlcnR5IiwibGF6eUxpbmsiLCJtYXNzVmFsdWUiLCJtYXNzVmFsdWVzIiwieWVsbG93IiwiYmx1ZSIsImdyZWVuIiwicmVkIiwic2FtZVZvbHVtZVllbGxvd01hc3MiLCJzYW1lVm9sdW1lQmx1ZU1hc3MiLCJzYW1lVm9sdW1lR3JlZW5NYXNzIiwic2FtZVZvbHVtZVJlZE1hc3MiLCJ2b2x1bWUiLCJzaXplIiwiYm91bmRzRnJvbVZvbHVtZSIsInVwZGF0ZVNpemUiLCJzYW1lRGVuc2l0eVllbGxvd01hc3MiLCJzYW1lRGVuc2l0eUJsdWVNYXNzIiwic2FtZURlbnNpdHlHcmVlbk1hc3MiLCJzYW1lRGVuc2l0eVJlZE1hc3MiLCJFcnJvciIsInBvc2l0aW9uTWFzc2VzIiwicG9zaXRpb25NYXNzZXNMZWZ0IiwicG9zaXRpb25NYXNzZXNSaWdodCIsIm9wdGlvbnMiLCJpbml0aWFsTW9kZSIsInNob3dNYXNzZXNEZWZhdWx0IiwiY2FuU2hvd0ZvcmNlcyIsImNyZWF0ZU1hc3Nlc0NhbGxiYWNrIiwicmVnZW5lcmF0ZU1hc3Nlc0NhbGxiYWNrIiwiXyIsIm5vb3AiLCJwb3NpdGlvbk1hc3Nlc0NhbGxiYWNrIiwidW5pbnRlcnBvbGF0ZU1hc3NlcyIsInJlc2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEZW5zaXR5Q29tcGFyZU1vZGVsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZSBtYWluIG1vZGVsIGZvciB0aGUgQ29tcGFyZSBzY3JlZW4gb2YgdGhlIERlbnNpdHkgc2ltdWxhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbi5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblZhbHVlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvblZhbHVlLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgeyBDb2xvciB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBCbG9ja1NldE1vZGVsLCB7IEJsb2NrU2V0TW9kZWxPcHRpb25zIH0gZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0Jsb2NrU2V0TW9kZWwuanMnO1xyXG5pbXBvcnQgQ3ViZSwgeyBDdWJlT3B0aW9ucyB9IGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9DdWJlLmpzJztcclxuaW1wb3J0IEN1Ym9pZCBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvQ3Vib2lkLmpzJztcclxuaW1wb3J0IE1hdGVyaWFsIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9NYXRlcmlhbC5qcyc7XHJcbmltcG9ydCBEZW5zaXR5QnVveWFuY3lDb21tb25Db2xvcnMgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29sb3JzLmpzJztcclxuaW1wb3J0IGRlbnNpdHlCdW95YW5jeUNvbW1vbiBmcm9tICcuLi8uLi9kZW5zaXR5QnVveWFuY3lDb21tb24uanMnO1xyXG5pbXBvcnQgRGVuc2l0eUJ1b3lhbmN5TW9kZWwgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0RlbnNpdHlCdW95YW5jeU1vZGVsLmpzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBCbG9ja1NldCBleHRlbmRzIEVudW1lcmF0aW9uVmFsdWUge1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgU0FNRV9NQVNTID0gbmV3IEJsb2NrU2V0KCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBTQU1FX1ZPTFVNRSA9IG5ldyBCbG9ja1NldCgpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgU0FNRV9ERU5TSVRZID0gbmV3IEJsb2NrU2V0KCk7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgZW51bWVyYXRpb24gPSBuZXcgRW51bWVyYXRpb24oIEJsb2NrU2V0LCB7XHJcbiAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnQmxvY2sgc2V0J1xyXG4gIH0gKTtcclxufVxyXG5cclxuZXhwb3J0IHR5cGUgRGVuc2l0eUNvbXBhcmVNb2RlbE9wdGlvbnMgPSBTdHJpY3RPbWl0PEJsb2NrU2V0TW9kZWxPcHRpb25zPEJsb2NrU2V0PiwgJ2luaXRpYWxNb2RlJyB8ICdCbG9ja1NldCcgfCAnY3JlYXRlTWFzc2VzQ2FsbGJhY2snIHwgJ3JlZ2VuZXJhdGVNYXNzZXNDYWxsYmFjaycgfCAncG9zaXRpb25NYXNzZXNDYWxsYmFjayc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVuc2l0eUNvbXBhcmVNb2RlbCBleHRlbmRzIEJsb2NrU2V0TW9kZWw8QmxvY2tTZXQ+IHtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IG1hc3NQcm9wZXJ0eTogTnVtYmVyUHJvcGVydHk7XHJcbiAgcHVibGljIHJlYWRvbmx5IHZvbHVtZVByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eTtcclxuICBwdWJsaWMgcmVhZG9ubHkgZGVuc2l0eVByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM6IERlbnNpdHlDb21wYXJlTW9kZWxPcHRpb25zICkge1xyXG4gICAgY29uc3QgdGFuZGVtID0gcHJvdmlkZWRPcHRpb25zLnRhbmRlbTtcclxuXHJcbiAgICBjb25zdCBibG9ja1NldHNUYW5kZW0gPSB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYmxvY2tTZXRzJyApO1xyXG4gICAgY29uc3Qgc2FtZU1hc3NUYW5kZW0gPSBibG9ja1NldHNUYW5kZW0uY3JlYXRlVGFuZGVtKCAnc2FtZU1hc3MnICk7XHJcbiAgICBjb25zdCBzYW1lVm9sdW1lVGFuZGVtID0gYmxvY2tTZXRzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NhbWVWb2x1bWUnICk7XHJcbiAgICBjb25zdCBzYW1lRGVuc2l0eVRhbmRlbSA9IGJsb2NrU2V0c1RhbmRlbS5jcmVhdGVUYW5kZW0oICdzYW1lRGVuc2l0eScgKTtcclxuXHJcbiAgICBjb25zdCBtYXNzUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDUsIHtcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMSwgMTAgKSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbWFzc1Byb3BlcnR5JyApLFxyXG4gICAgICB1bml0czogJ2tnJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHZvbHVtZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLjAwNSwge1xyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAwLjAwMSwgMC4wMSApLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd2b2x1bWVQcm9wZXJ0eScgKSxcclxuICAgICAgdW5pdHM6ICdtXjMnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgZGVuc2l0eVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCA1MDAsIHtcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMTAwLCAyMDAwICksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RlbnNpdHlQcm9wZXJ0eScgKSxcclxuICAgICAgdW5pdHM6ICdrZy9tXjMnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY3JlYXRlTWF0ZXJpYWxQcm9wZXJ0eSA9ICggY29sb3JQcm9wZXJ0eTogVFByb3BlcnR5PENvbG9yPiwgZGVuc2l0eVByb3BlcnR5OiBUUHJvcGVydHk8bnVtYmVyPiApID0+IHtcclxuICAgICAgcmV0dXJuIG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgY29sb3JQcm9wZXJ0eSwgZGVuc2l0eVByb3BlcnR5IF0sICggY29sb3IsIGRlbnNpdHkgKSA9PiB7XHJcbiAgICAgICAgY29uc3QgbGlnaHRuZXNzID0gTWF0ZXJpYWwuZ2V0Q3VzdG9tTGlnaHRuZXNzKCBkZW5zaXR5ICk7IC8vIDAtMjU1XHJcblxyXG4gICAgICAgIGNvbnN0IG1vZGlmaWVyID0gMC4xO1xyXG4gICAgICAgIGNvbnN0IHJhd1ZhbHVlID0gKCBsaWdodG5lc3MgLyAxMjggLSAxICkgKiAoIDEgLSBtb2RpZmllciApICsgbW9kaWZpZXI7XHJcbiAgICAgICAgY29uc3QgcG93ZXIgPSAwLjc7XHJcbiAgICAgICAgY29uc3QgbW9kaWZpZWRDb2xvciA9IGNvbG9yLmNvbG9yVXRpbHNCcmlnaHRuZXNzKCBNYXRoLnNpZ24oIHJhd1ZhbHVlICkgKiBNYXRoLnBvdyggTWF0aC5hYnMoIHJhd1ZhbHVlICksIHBvd2VyICkgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIE1hdGVyaWFsLmNyZWF0ZUN1c3RvbU1hdGVyaWFsKCB7XHJcbiAgICAgICAgICBkZW5zaXR5OiBkZW5zaXR5LFxyXG4gICAgICAgICAgY3VzdG9tQ29sb3I6IG5ldyBQcm9wZXJ0eSggbW9kaWZpZWRDb2xvciwgeyB0YW5kZW06IFRhbmRlbS5PUFRfT1VUIH0gKVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfSwge1xyXG4gICAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcclxuICAgICAgfSApO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBtaW5TY3JlZW5Wb2x1bWUgPSAwLjAwMSAtIDFlLTc7XHJcbiAgICBjb25zdCBtYXhTY3JlZW5Wb2x1bWUgPSAwLjAxICsgMWUtNztcclxuXHJcbiAgICBjb25zdCBjb21tb25DdWJlT3B0aW9ucyA9IHtcclxuICAgICAgbWluVm9sdW1lOiBtaW5TY3JlZW5Wb2x1bWUsXHJcbiAgICAgIG1heFZvbHVtZTogbWF4U2NyZWVuVm9sdW1lXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHNhbWVNYXNzWWVsbG93RGVuc2l0eVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCA1MDAsIHsgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCB9ICk7XHJcbiAgICBjb25zdCBzYW1lTWFzc0JsdWVEZW5zaXR5UHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDEwMDAsIHsgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCB9ICk7XHJcbiAgICBjb25zdCBzYW1lTWFzc0dyZWVuRGVuc2l0eVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAyMDAwLCB7IHRhbmRlbTogVGFuZGVtLk9QVF9PVVQgfSApO1xyXG4gICAgY29uc3Qgc2FtZU1hc3NSZWREZW5zaXR5UHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDQwMDAsIHsgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCB9ICk7XHJcblxyXG4gICAgY29uc3Qgc2FtZVZvbHVtZVllbGxvd0RlbnNpdHlQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMTYwMCwgeyB0YW5kZW06IFRhbmRlbS5PUFRfT1VUIH0gKTtcclxuICAgIGNvbnN0IHNhbWVWb2x1bWVCbHVlRGVuc2l0eVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAxMjAwLCB7IHRhbmRlbTogVGFuZGVtLk9QVF9PVVQgfSApO1xyXG4gICAgY29uc3Qgc2FtZVZvbHVtZUdyZWVuRGVuc2l0eVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCA4MDAsIHsgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCB9ICk7XHJcbiAgICBjb25zdCBzYW1lVm9sdW1lUmVkRGVuc2l0eVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCA0MDAsIHsgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCB9ICk7XHJcblxyXG4gICAgY29uc3Qgc2FtZURlbnNpdHlZZWxsb3dEZW5zaXR5UHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDUwMCwgeyB0YW5kZW06IFRhbmRlbS5PUFRfT1VUIH0gKTtcclxuICAgIGNvbnN0IHNhbWVEZW5zaXR5Qmx1ZURlbnNpdHlQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggNTAwLCB7IHRhbmRlbTogVGFuZGVtLk9QVF9PVVQgfSApO1xyXG4gICAgY29uc3Qgc2FtZURlbnNpdHlHcmVlbkRlbnNpdHlQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggNTAwLCB7IHRhbmRlbTogVGFuZGVtLk9QVF9PVVQgfSApO1xyXG4gICAgY29uc3Qgc2FtZURlbnNpdHlSZWREZW5zaXR5UHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDUwMCwgeyB0YW5kZW06IFRhbmRlbS5PUFRfT1VUIH0gKTtcclxuXHJcbiAgICBjb25zdCBzYW1lTWFzc1llbGxvd01hdGVyaWFsUHJvcGVydHkgPSBjcmVhdGVNYXRlcmlhbFByb3BlcnR5KCBEZW5zaXR5QnVveWFuY3lDb21tb25Db2xvcnMuY29tcGFyZVllbGxvd0NvbG9yUHJvcGVydHksIHNhbWVNYXNzWWVsbG93RGVuc2l0eVByb3BlcnR5ICk7XHJcbiAgICBjb25zdCBzYW1lTWFzc0JsdWVNYXRlcmlhbFByb3BlcnR5ID0gY3JlYXRlTWF0ZXJpYWxQcm9wZXJ0eSggRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29sb3JzLmNvbXBhcmVCbHVlQ29sb3JQcm9wZXJ0eSwgc2FtZU1hc3NCbHVlRGVuc2l0eVByb3BlcnR5ICk7XHJcbiAgICBjb25zdCBzYW1lTWFzc0dyZWVuTWF0ZXJpYWxQcm9wZXJ0eSA9IGNyZWF0ZU1hdGVyaWFsUHJvcGVydHkoIERlbnNpdHlCdW95YW5jeUNvbW1vbkNvbG9ycy5jb21wYXJlR3JlZW5Db2xvclByb3BlcnR5LCBzYW1lTWFzc0dyZWVuRGVuc2l0eVByb3BlcnR5ICk7XHJcbiAgICBjb25zdCBzYW1lTWFzc1JlZE1hdGVyaWFsUHJvcGVydHkgPSBjcmVhdGVNYXRlcmlhbFByb3BlcnR5KCBEZW5zaXR5QnVveWFuY3lDb21tb25Db2xvcnMuY29tcGFyZVJlZENvbG9yUHJvcGVydHksIHNhbWVNYXNzUmVkRGVuc2l0eVByb3BlcnR5ICk7XHJcblxyXG4gICAgY29uc3Qgc2FtZVZvbHVtZVllbGxvd01hdGVyaWFsUHJvcGVydHkgPSBjcmVhdGVNYXRlcmlhbFByb3BlcnR5KCBEZW5zaXR5QnVveWFuY3lDb21tb25Db2xvcnMuY29tcGFyZVllbGxvd0NvbG9yUHJvcGVydHksIHNhbWVWb2x1bWVZZWxsb3dEZW5zaXR5UHJvcGVydHkgKTtcclxuICAgIGNvbnN0IHNhbWVWb2x1bWVCbHVlTWF0ZXJpYWxQcm9wZXJ0eSA9IGNyZWF0ZU1hdGVyaWFsUHJvcGVydHkoIERlbnNpdHlCdW95YW5jeUNvbW1vbkNvbG9ycy5jb21wYXJlQmx1ZUNvbG9yUHJvcGVydHksIHNhbWVWb2x1bWVCbHVlRGVuc2l0eVByb3BlcnR5ICk7XHJcbiAgICBjb25zdCBzYW1lVm9sdW1lR3JlZW5NYXRlcmlhbFByb3BlcnR5ID0gY3JlYXRlTWF0ZXJpYWxQcm9wZXJ0eSggRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29sb3JzLmNvbXBhcmVHcmVlbkNvbG9yUHJvcGVydHksIHNhbWVWb2x1bWVHcmVlbkRlbnNpdHlQcm9wZXJ0eSApO1xyXG4gICAgY29uc3Qgc2FtZVZvbHVtZVJlZE1hdGVyaWFsUHJvcGVydHkgPSBjcmVhdGVNYXRlcmlhbFByb3BlcnR5KCBEZW5zaXR5QnVveWFuY3lDb21tb25Db2xvcnMuY29tcGFyZVJlZENvbG9yUHJvcGVydHksIHNhbWVWb2x1bWVSZWREZW5zaXR5UHJvcGVydHkgKTtcclxuXHJcbiAgICBjb25zdCBzYW1lRGVuc2l0eVllbGxvd01hdGVyaWFsUHJvcGVydHkgPSBjcmVhdGVNYXRlcmlhbFByb3BlcnR5KCBEZW5zaXR5QnVveWFuY3lDb21tb25Db2xvcnMuY29tcGFyZVllbGxvd0NvbG9yUHJvcGVydHksIHNhbWVEZW5zaXR5WWVsbG93RGVuc2l0eVByb3BlcnR5ICk7XHJcbiAgICBjb25zdCBzYW1lRGVuc2l0eUJsdWVNYXRlcmlhbFByb3BlcnR5ID0gY3JlYXRlTWF0ZXJpYWxQcm9wZXJ0eSggRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29sb3JzLmNvbXBhcmVCbHVlQ29sb3JQcm9wZXJ0eSwgc2FtZURlbnNpdHlCbHVlRGVuc2l0eVByb3BlcnR5ICk7XHJcbiAgICBjb25zdCBzYW1lRGVuc2l0eUdyZWVuTWF0ZXJpYWxQcm9wZXJ0eSA9IGNyZWF0ZU1hdGVyaWFsUHJvcGVydHkoIERlbnNpdHlCdW95YW5jeUNvbW1vbkNvbG9ycy5jb21wYXJlR3JlZW5Db2xvclByb3BlcnR5LCBzYW1lRGVuc2l0eUdyZWVuRGVuc2l0eVByb3BlcnR5ICk7XHJcbiAgICBjb25zdCBzYW1lRGVuc2l0eVJlZE1hdGVyaWFsUHJvcGVydHkgPSBjcmVhdGVNYXRlcmlhbFByb3BlcnR5KCBEZW5zaXR5QnVveWFuY3lDb21tb25Db2xvcnMuY29tcGFyZVJlZENvbG9yUHJvcGVydHksIHNhbWVEZW5zaXR5UmVkRGVuc2l0eVByb3BlcnR5ICk7XHJcblxyXG4gICAgY29uc3QgY3JlYXRlTWFzc2VzID0gKCBtb2RlbDogRGVuc2l0eUJ1b3lhbmN5TW9kZWwsIGJsb2NrU2V0OiBCbG9ja1NldCApID0+IHtcclxuICAgICAgbGV0IG1hc3NlcztcclxuICAgICAgc3dpdGNoKCBibG9ja1NldCApIHtcclxuICAgICAgICBjYXNlIEJsb2NrU2V0LlNBTUVfTUFTUzpcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3Qgc2FtZU1hc3NZZWxsb3dNYXNzID0gQ3ViZS5jcmVhdGVXaXRoTWFzcyhcclxuICAgICAgICAgICAgICBtb2RlbC5lbmdpbmUsXHJcbiAgICAgICAgICAgICAgc2FtZU1hc3NZZWxsb3dNYXRlcmlhbFByb3BlcnR5LnZhbHVlLFxyXG4gICAgICAgICAgICAgIFZlY3RvcjIuWkVSTyxcclxuICAgICAgICAgICAgICA1LFxyXG4gICAgICAgICAgICAgIGNvbWJpbmVPcHRpb25zPEN1YmVPcHRpb25zPigge30sIGNvbW1vbkN1YmVPcHRpb25zLCB7IHRhbmRlbTogc2FtZU1hc3NUYW5kZW0uY3JlYXRlVGFuZGVtKCAneWVsbG93QmxvY2snICkgfSApXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGNvbnN0IHNhbWVNYXNzQmx1ZU1hc3MgPSBDdWJlLmNyZWF0ZVdpdGhNYXNzKFxyXG4gICAgICAgICAgICAgIG1vZGVsLmVuZ2luZSxcclxuICAgICAgICAgICAgICBzYW1lTWFzc0JsdWVNYXRlcmlhbFByb3BlcnR5LnZhbHVlLFxyXG4gICAgICAgICAgICAgIFZlY3RvcjIuWkVSTyxcclxuICAgICAgICAgICAgICA1LFxyXG4gICAgICAgICAgICAgIGNvbWJpbmVPcHRpb25zPEN1YmVPcHRpb25zPigge30sIGNvbW1vbkN1YmVPcHRpb25zLCB7IHRhbmRlbTogc2FtZU1hc3NUYW5kZW0uY3JlYXRlVGFuZGVtKCAnYmx1ZUJsb2NrJyApIH0gKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBjb25zdCBzYW1lTWFzc0dyZWVuTWFzcyA9IEN1YmUuY3JlYXRlV2l0aE1hc3MoXHJcbiAgICAgICAgICAgICAgbW9kZWwuZW5naW5lLFxyXG4gICAgICAgICAgICAgIHNhbWVNYXNzR3JlZW5NYXRlcmlhbFByb3BlcnR5LnZhbHVlLFxyXG4gICAgICAgICAgICAgIFZlY3RvcjIuWkVSTyxcclxuICAgICAgICAgICAgICA1LFxyXG4gICAgICAgICAgICAgIGNvbWJpbmVPcHRpb25zPEN1YmVPcHRpb25zPigge30sIGNvbW1vbkN1YmVPcHRpb25zLCB7IHRhbmRlbTogc2FtZU1hc3NUYW5kZW0uY3JlYXRlVGFuZGVtKCAnZ3JlZW5CbG9jaycgKSB9IClcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgY29uc3Qgc2FtZU1hc3NSZWRNYXNzID0gQ3ViZS5jcmVhdGVXaXRoTWFzcyhcclxuICAgICAgICAgICAgICBtb2RlbC5lbmdpbmUsXHJcbiAgICAgICAgICAgICAgc2FtZU1hc3NSZWRNYXRlcmlhbFByb3BlcnR5LnZhbHVlLFxyXG4gICAgICAgICAgICAgIFZlY3RvcjIuWkVSTyxcclxuICAgICAgICAgICAgICA1LFxyXG4gICAgICAgICAgICAgIGNvbWJpbmVPcHRpb25zPEN1YmVPcHRpb25zPigge30sIGNvbW1vbkN1YmVPcHRpb25zLCB7IHRhbmRlbTogc2FtZU1hc3NUYW5kZW0uY3JlYXRlVGFuZGVtKCAncmVkQmxvY2snICkgfSApXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICBzYW1lTWFzc1llbGxvd01hdGVyaWFsUHJvcGVydHkubGluayggbWF0ZXJpYWwgPT4geyBzYW1lTWFzc1llbGxvd01hc3MubWF0ZXJpYWxQcm9wZXJ0eS52YWx1ZSA9IG1hdGVyaWFsOyB9ICk7XHJcbiAgICAgICAgICAgIHNhbWVNYXNzQmx1ZU1hdGVyaWFsUHJvcGVydHkubGluayggbWF0ZXJpYWwgPT4geyBzYW1lTWFzc0JsdWVNYXNzLm1hdGVyaWFsUHJvcGVydHkudmFsdWUgPSBtYXRlcmlhbDsgfSApO1xyXG4gICAgICAgICAgICBzYW1lTWFzc0dyZWVuTWF0ZXJpYWxQcm9wZXJ0eS5saW5rKCBtYXRlcmlhbCA9PiB7IHNhbWVNYXNzR3JlZW5NYXNzLm1hdGVyaWFsUHJvcGVydHkudmFsdWUgPSBtYXRlcmlhbDsgfSApO1xyXG4gICAgICAgICAgICBzYW1lTWFzc1JlZE1hdGVyaWFsUHJvcGVydHkubGluayggbWF0ZXJpYWwgPT4geyBzYW1lTWFzc1JlZE1hc3MubWF0ZXJpYWxQcm9wZXJ0eS52YWx1ZSA9IG1hdGVyaWFsOyB9ICk7XHJcblxyXG4gICAgICAgICAgICBtYXNzZXMgPSBbIHNhbWVNYXNzWWVsbG93TWFzcywgc2FtZU1hc3NCbHVlTWFzcywgc2FtZU1hc3NHcmVlbk1hc3MsIHNhbWVNYXNzUmVkTWFzcyBdO1xyXG5cclxuICAgICAgICAgICAgLy8gVGhpcyBpbnN0YW5jZSBsaXZlcyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW11bGF0aW9uLCBzbyB3ZSBkb24ndCBuZWVkIHRvIHJlbW92ZSB0aGlzIGxpc3RlbmVyXHJcbiAgICAgICAgICAgIG1hc3NQcm9wZXJ0eS5sYXp5TGluayggbWFzc1ZhbHVlID0+IHtcclxuICAgICAgICAgICAgICBzYW1lTWFzc1llbGxvd0RlbnNpdHlQcm9wZXJ0eS52YWx1ZSA9IG1hc3NWYWx1ZSAvIHNhbWVNYXNzWWVsbG93TWFzcy52b2x1bWVQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICAgICAgICBzYW1lTWFzc0JsdWVEZW5zaXR5UHJvcGVydHkudmFsdWUgPSBtYXNzVmFsdWUgLyBzYW1lTWFzc0JsdWVNYXNzLnZvbHVtZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgICAgICAgICAgIHNhbWVNYXNzR3JlZW5EZW5zaXR5UHJvcGVydHkudmFsdWUgPSBtYXNzVmFsdWUgLyBzYW1lTWFzc0dyZWVuTWFzcy52b2x1bWVQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICAgICAgICBzYW1lTWFzc1JlZERlbnNpdHlQcm9wZXJ0eS52YWx1ZSA9IG1hc3NWYWx1ZSAvIHNhbWVNYXNzUmVkTWFzcy52b2x1bWVQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICAgICAgfSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBCbG9ja1NldC5TQU1FX1ZPTFVNRTpcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgLy8gT3VyIHZvbHVtZSBsaXN0ZW5lciBpcyB0cmlnZ2VyZWQgQUZURVIgdGhlIGN1YmVzIGhhdmUgcGhldC1pbyBhcHBseVN0YXRlIHJ1biwgc28gd2UgY2FuJ3QgcmVseSBvblxyXG4gICAgICAgICAgICAvLyBpbnNwZWN0aW5nIHRoZWlyIG1hc3MgYXQgdGhhdCB0aW1lIChhbmQgaW5zdGVhZCBuZWVkIGFuIGV4dGVybmFsIHJlZmVyZW5jZSkuXHJcbiAgICAgICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZGVuc2l0eS9pc3N1ZXMvMTExXHJcbiAgICAgICAgICAgIGNvbnN0IG1hc3NWYWx1ZXMgPSB7XHJcbiAgICAgICAgICAgICAgeWVsbG93OiA4LFxyXG4gICAgICAgICAgICAgIGJsdWU6IDYsXHJcbiAgICAgICAgICAgICAgZ3JlZW46IDQsXHJcbiAgICAgICAgICAgICAgcmVkOiAyXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbnN0IHNhbWVWb2x1bWVZZWxsb3dNYXNzID0gQ3ViZS5jcmVhdGVXaXRoTWFzcyhcclxuICAgICAgICAgICAgICBtb2RlbC5lbmdpbmUsXHJcbiAgICAgICAgICAgICAgc2FtZVZvbHVtZVllbGxvd01hdGVyaWFsUHJvcGVydHkudmFsdWUsXHJcbiAgICAgICAgICAgICAgVmVjdG9yMi5aRVJPLFxyXG4gICAgICAgICAgICAgIG1hc3NWYWx1ZXMueWVsbG93LFxyXG4gICAgICAgICAgICAgIGNvbWJpbmVPcHRpb25zPEN1YmVPcHRpb25zPigge30sIGNvbW1vbkN1YmVPcHRpb25zLCB7IHRhbmRlbTogc2FtZVZvbHVtZVRhbmRlbS5jcmVhdGVUYW5kZW0oICd5ZWxsb3dCbG9jaycgKSB9IClcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgY29uc3Qgc2FtZVZvbHVtZUJsdWVNYXNzID0gQ3ViZS5jcmVhdGVXaXRoTWFzcyhcclxuICAgICAgICAgICAgICBtb2RlbC5lbmdpbmUsXHJcbiAgICAgICAgICAgICAgc2FtZVZvbHVtZUJsdWVNYXRlcmlhbFByb3BlcnR5LnZhbHVlLFxyXG4gICAgICAgICAgICAgIFZlY3RvcjIuWkVSTyxcclxuICAgICAgICAgICAgICBtYXNzVmFsdWVzLmJsdWUsXHJcbiAgICAgICAgICAgICAgY29tYmluZU9wdGlvbnM8Q3ViZU9wdGlvbnM+KCB7fSwgY29tbW9uQ3ViZU9wdGlvbnMsIHsgdGFuZGVtOiBzYW1lVm9sdW1lVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2JsdWVCbG9jaycgKSB9IClcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgY29uc3Qgc2FtZVZvbHVtZUdyZWVuTWFzcyA9IEN1YmUuY3JlYXRlV2l0aE1hc3MoXHJcbiAgICAgICAgICAgICAgbW9kZWwuZW5naW5lLFxyXG4gICAgICAgICAgICAgIHNhbWVWb2x1bWVHcmVlbk1hdGVyaWFsUHJvcGVydHkudmFsdWUsXHJcbiAgICAgICAgICAgICAgVmVjdG9yMi5aRVJPLFxyXG4gICAgICAgICAgICAgIG1hc3NWYWx1ZXMuZ3JlZW4sXHJcbiAgICAgICAgICAgICAgY29tYmluZU9wdGlvbnM8Q3ViZU9wdGlvbnM+KCB7fSwgY29tbW9uQ3ViZU9wdGlvbnMsIHsgdGFuZGVtOiBzYW1lVm9sdW1lVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2dyZWVuQmxvY2snICkgfSApXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGNvbnN0IHNhbWVWb2x1bWVSZWRNYXNzID0gQ3ViZS5jcmVhdGVXaXRoTWFzcyhcclxuICAgICAgICAgICAgICBtb2RlbC5lbmdpbmUsXHJcbiAgICAgICAgICAgICAgc2FtZVZvbHVtZVJlZE1hdGVyaWFsUHJvcGVydHkudmFsdWUsXHJcbiAgICAgICAgICAgICAgVmVjdG9yMi5aRVJPLFxyXG4gICAgICAgICAgICAgIG1hc3NWYWx1ZXMucmVkLFxyXG4gICAgICAgICAgICAgIGNvbWJpbmVPcHRpb25zPEN1YmVPcHRpb25zPigge30sIGNvbW1vbkN1YmVPcHRpb25zLCB7IHRhbmRlbTogc2FtZVZvbHVtZVRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZWRCbG9jaycgKSB9IClcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIHNhbWVWb2x1bWVZZWxsb3dNYXRlcmlhbFByb3BlcnR5LmxpbmsoIG1hdGVyaWFsID0+IHsgc2FtZVZvbHVtZVllbGxvd01hc3MubWF0ZXJpYWxQcm9wZXJ0eS52YWx1ZSA9IG1hdGVyaWFsOyB9ICk7XHJcbiAgICAgICAgICAgIHNhbWVWb2x1bWVCbHVlTWF0ZXJpYWxQcm9wZXJ0eS5saW5rKCBtYXRlcmlhbCA9PiB7IHNhbWVWb2x1bWVCbHVlTWFzcy5tYXRlcmlhbFByb3BlcnR5LnZhbHVlID0gbWF0ZXJpYWw7IH0gKTtcclxuICAgICAgICAgICAgc2FtZVZvbHVtZUdyZWVuTWF0ZXJpYWxQcm9wZXJ0eS5saW5rKCBtYXRlcmlhbCA9PiB7IHNhbWVWb2x1bWVHcmVlbk1hc3MubWF0ZXJpYWxQcm9wZXJ0eS52YWx1ZSA9IG1hdGVyaWFsOyB9ICk7XHJcbiAgICAgICAgICAgIHNhbWVWb2x1bWVSZWRNYXRlcmlhbFByb3BlcnR5LmxpbmsoIG1hdGVyaWFsID0+IHsgc2FtZVZvbHVtZVJlZE1hc3MubWF0ZXJpYWxQcm9wZXJ0eS52YWx1ZSA9IG1hdGVyaWFsOyB9ICk7XHJcblxyXG4gICAgICAgICAgICBtYXNzZXMgPSBbIHNhbWVWb2x1bWVZZWxsb3dNYXNzLCBzYW1lVm9sdW1lQmx1ZU1hc3MsIHNhbWVWb2x1bWVHcmVlbk1hc3MsIHNhbWVWb2x1bWVSZWRNYXNzIF07XHJcblxyXG4gICAgICAgICAgICAvLyBUaGlzIGluc3RhbmNlIGxpdmVzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbXVsYXRpb24sIHNvIHdlIGRvbid0IG5lZWQgdG8gcmVtb3ZlIHRoaXMgbGlzdGVuZXJcclxuICAgICAgICAgICAgdm9sdW1lUHJvcGVydHkubGF6eUxpbmsoIHZvbHVtZSA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc3Qgc2l6ZSA9IEN1YmUuYm91bmRzRnJvbVZvbHVtZSggdm9sdW1lICk7XHJcbiAgICAgICAgICAgICAgc2FtZVZvbHVtZVllbGxvd01hc3MudXBkYXRlU2l6ZSggc2l6ZSApO1xyXG4gICAgICAgICAgICAgIHNhbWVWb2x1bWVCbHVlTWFzcy51cGRhdGVTaXplKCBzaXplICk7XHJcbiAgICAgICAgICAgICAgc2FtZVZvbHVtZUdyZWVuTWFzcy51cGRhdGVTaXplKCBzaXplICk7XHJcbiAgICAgICAgICAgICAgc2FtZVZvbHVtZVJlZE1hc3MudXBkYXRlU2l6ZSggc2l6ZSApO1xyXG5cclxuICAgICAgICAgICAgICBzYW1lVm9sdW1lWWVsbG93RGVuc2l0eVByb3BlcnR5LnZhbHVlID0gbWFzc1ZhbHVlcy55ZWxsb3cgLyB2b2x1bWU7XHJcbiAgICAgICAgICAgICAgc2FtZVZvbHVtZUJsdWVEZW5zaXR5UHJvcGVydHkudmFsdWUgPSBtYXNzVmFsdWVzLmJsdWUgLyB2b2x1bWU7XHJcbiAgICAgICAgICAgICAgc2FtZVZvbHVtZUdyZWVuRGVuc2l0eVByb3BlcnR5LnZhbHVlID0gbWFzc1ZhbHVlcy5ncmVlbiAvIHZvbHVtZTtcclxuICAgICAgICAgICAgICBzYW1lVm9sdW1lUmVkRGVuc2l0eVByb3BlcnR5LnZhbHVlID0gbWFzc1ZhbHVlcy5yZWQgLyB2b2x1bWU7XHJcbiAgICAgICAgICAgIH0gKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgQmxvY2tTZXQuU0FNRV9ERU5TSVRZOlxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBzYW1lRGVuc2l0eVllbGxvd01hc3MgPSBDdWJlLmNyZWF0ZVdpdGhNYXNzKFxyXG4gICAgICAgICAgICAgIG1vZGVsLmVuZ2luZSxcclxuICAgICAgICAgICAgICBzYW1lRGVuc2l0eVllbGxvd01hdGVyaWFsUHJvcGVydHkudmFsdWUsXHJcbiAgICAgICAgICAgICAgVmVjdG9yMi5aRVJPLFxyXG4gICAgICAgICAgICAgIDMsXHJcbiAgICAgICAgICAgICAgY29tYmluZU9wdGlvbnM8Q3ViZU9wdGlvbnM+KCB7fSwgY29tbW9uQ3ViZU9wdGlvbnMsIHsgdGFuZGVtOiBzYW1lRGVuc2l0eVRhbmRlbS5jcmVhdGVUYW5kZW0oICd5ZWxsb3dCbG9jaycgKSB9IClcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgY29uc3Qgc2FtZURlbnNpdHlCbHVlTWFzcyA9IEN1YmUuY3JlYXRlV2l0aE1hc3MoXHJcbiAgICAgICAgICAgICAgbW9kZWwuZW5naW5lLFxyXG4gICAgICAgICAgICAgIHNhbWVEZW5zaXR5Qmx1ZU1hdGVyaWFsUHJvcGVydHkudmFsdWUsXHJcbiAgICAgICAgICAgICAgVmVjdG9yMi5aRVJPLFxyXG4gICAgICAgICAgICAgIDIsXHJcbiAgICAgICAgICAgICAgY29tYmluZU9wdGlvbnM8Q3ViZU9wdGlvbnM+KCB7fSwgY29tbW9uQ3ViZU9wdGlvbnMsIHsgdGFuZGVtOiBzYW1lRGVuc2l0eVRhbmRlbS5jcmVhdGVUYW5kZW0oICdibHVlQmxvY2snICkgfSApXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGNvbnN0IHNhbWVEZW5zaXR5R3JlZW5NYXNzID0gQ3ViZS5jcmVhdGVXaXRoTWFzcyhcclxuICAgICAgICAgICAgICBtb2RlbC5lbmdpbmUsXHJcbiAgICAgICAgICAgICAgc2FtZURlbnNpdHlHcmVlbk1hdGVyaWFsUHJvcGVydHkudmFsdWUsXHJcbiAgICAgICAgICAgICAgVmVjdG9yMi5aRVJPLFxyXG4gICAgICAgICAgICAgIDEsXHJcbiAgICAgICAgICAgICAgY29tYmluZU9wdGlvbnM8Q3ViZU9wdGlvbnM+KCB7fSwgY29tbW9uQ3ViZU9wdGlvbnMsIHsgdGFuZGVtOiBzYW1lRGVuc2l0eVRhbmRlbS5jcmVhdGVUYW5kZW0oICdncmVlbkJsb2NrJyApIH0gKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBjb25zdCBzYW1lRGVuc2l0eVJlZE1hc3MgPSBDdWJlLmNyZWF0ZVdpdGhNYXNzKFxyXG4gICAgICAgICAgICAgIG1vZGVsLmVuZ2luZSxcclxuICAgICAgICAgICAgICBzYW1lRGVuc2l0eVJlZE1hdGVyaWFsUHJvcGVydHkudmFsdWUsXHJcbiAgICAgICAgICAgICAgVmVjdG9yMi5aRVJPLFxyXG4gICAgICAgICAgICAgIDAuNSxcclxuICAgICAgICAgICAgICBjb21iaW5lT3B0aW9uczxDdWJlT3B0aW9ucz4oIHt9LCBjb21tb25DdWJlT3B0aW9ucywgeyB0YW5kZW06IHNhbWVEZW5zaXR5VGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3JlZEJsb2NrJyApIH0gKVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgc2FtZURlbnNpdHlZZWxsb3dNYXRlcmlhbFByb3BlcnR5LmxpbmsoIG1hdGVyaWFsID0+IHsgc2FtZURlbnNpdHlZZWxsb3dNYXNzLm1hdGVyaWFsUHJvcGVydHkudmFsdWUgPSBtYXRlcmlhbDsgfSApO1xyXG4gICAgICAgICAgICBzYW1lRGVuc2l0eUJsdWVNYXRlcmlhbFByb3BlcnR5LmxpbmsoIG1hdGVyaWFsID0+IHsgc2FtZURlbnNpdHlCbHVlTWFzcy5tYXRlcmlhbFByb3BlcnR5LnZhbHVlID0gbWF0ZXJpYWw7IH0gKTtcclxuICAgICAgICAgICAgc2FtZURlbnNpdHlHcmVlbk1hdGVyaWFsUHJvcGVydHkubGluayggbWF0ZXJpYWwgPT4geyBzYW1lRGVuc2l0eUdyZWVuTWFzcy5tYXRlcmlhbFByb3BlcnR5LnZhbHVlID0gbWF0ZXJpYWw7IH0gKTtcclxuICAgICAgICAgICAgc2FtZURlbnNpdHlSZWRNYXRlcmlhbFByb3BlcnR5LmxpbmsoIG1hdGVyaWFsID0+IHsgc2FtZURlbnNpdHlSZWRNYXNzLm1hdGVyaWFsUHJvcGVydHkudmFsdWUgPSBtYXRlcmlhbDsgfSApO1xyXG5cclxuICAgICAgICAgICAgbWFzc2VzID0gWyBzYW1lRGVuc2l0eVllbGxvd01hc3MsIHNhbWVEZW5zaXR5Qmx1ZU1hc3MsIHNhbWVEZW5zaXR5R3JlZW5NYXNzLCBzYW1lRGVuc2l0eVJlZE1hc3MgXTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRoaXMgaW5zdGFuY2UgbGl2ZXMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltdWxhdGlvbiwgc28gd2UgZG9uJ3QgbmVlZCB0byByZW1vdmUgdGhpcyBsaXN0ZW5lclxyXG4gICAgICAgICAgICBkZW5zaXR5UHJvcGVydHkubGF6eUxpbmsoIGRlbnNpdHkgPT4ge1xyXG4gICAgICAgICAgICAgIHNhbWVEZW5zaXR5WWVsbG93RGVuc2l0eVByb3BlcnR5LnZhbHVlID0gZGVuc2l0eTtcclxuICAgICAgICAgICAgICBzYW1lRGVuc2l0eUJsdWVEZW5zaXR5UHJvcGVydHkudmFsdWUgPSBkZW5zaXR5O1xyXG4gICAgICAgICAgICAgIHNhbWVEZW5zaXR5R3JlZW5EZW5zaXR5UHJvcGVydHkudmFsdWUgPSBkZW5zaXR5O1xyXG4gICAgICAgICAgICAgIHNhbWVEZW5zaXR5UmVkRGVuc2l0eVByb3BlcnR5LnZhbHVlID0gZGVuc2l0eTtcclxuICAgICAgICAgICAgfSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvciggYHVua25vd24gYmxvY2tTZXQ6ICR7YmxvY2tTZXR9YCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gbWFzc2VzO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBwb3NpdGlvbk1hc3NlcyA9ICggbW9kZWw6IERlbnNpdHlCdW95YW5jeU1vZGVsLCBibG9ja1NldDogQmxvY2tTZXQsIG1hc3NlczogQ3Vib2lkW10gKSA9PiB7XHJcbiAgICAgIHN3aXRjaCggYmxvY2tTZXQgKSB7XHJcbiAgICAgICAgY2FzZSBCbG9ja1NldC5TQU1FX01BU1M6XHJcbiAgICAgICAgICBtb2RlbC5wb3NpdGlvbk1hc3Nlc0xlZnQoIFsgbWFzc2VzWyAwIF0sIG1hc3Nlc1sgMSBdIF0gKTtcclxuICAgICAgICAgIG1vZGVsLnBvc2l0aW9uTWFzc2VzUmlnaHQoIFsgbWFzc2VzWyAyIF0sIG1hc3Nlc1sgMyBdIF0gKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgQmxvY2tTZXQuU0FNRV9WT0xVTUU6XHJcbiAgICAgICAgICBtb2RlbC5wb3NpdGlvbk1hc3Nlc0xlZnQoIFsgbWFzc2VzWyAzIF0sIG1hc3Nlc1sgMCBdIF0gKTtcclxuICAgICAgICAgIG1vZGVsLnBvc2l0aW9uTWFzc2VzUmlnaHQoIFsgbWFzc2VzWyAxIF0sIG1hc3Nlc1sgMiBdIF0gKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgQmxvY2tTZXQuU0FNRV9ERU5TSVRZOlxyXG4gICAgICAgICAgbW9kZWwucG9zaXRpb25NYXNzZXNMZWZ0KCBbIG1hc3Nlc1sgMCBdLCBtYXNzZXNbIDEgXSBdICk7XHJcbiAgICAgICAgICBtb2RlbC5wb3NpdGlvbk1hc3Nlc1JpZ2h0KCBbIG1hc3Nlc1sgMiBdLCBtYXNzZXNbIDMgXSBdICk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgdW5rbm93biBibG9ja1NldDogJHtibG9ja1NldH1gICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxEZW5zaXR5Q29tcGFyZU1vZGVsT3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucywgQmxvY2tTZXRNb2RlbE9wdGlvbnM8QmxvY2tTZXQ+PigpKCB7XHJcbiAgICAgIGluaXRpYWxNb2RlOiBCbG9ja1NldC5TQU1FX01BU1MsXHJcbiAgICAgIEJsb2NrU2V0OiBCbG9ja1NldC5lbnVtZXJhdGlvbixcclxuICAgICAgc2hvd01hc3Nlc0RlZmF1bHQ6IHRydWUsXHJcbiAgICAgIGNhblNob3dGb3JjZXM6IGZhbHNlLFxyXG4gICAgICBjcmVhdGVNYXNzZXNDYWxsYmFjazogY3JlYXRlTWFzc2VzLFxyXG4gICAgICByZWdlbmVyYXRlTWFzc2VzQ2FsbGJhY2s6IF8ubm9vcCxcclxuICAgICAgcG9zaXRpb25NYXNzZXNDYWxsYmFjazogcG9zaXRpb25NYXNzZXNcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8ge1Byb3BlcnR5LjxudW1iZXI+fVxyXG4gICAgdGhpcy5tYXNzUHJvcGVydHkgPSBtYXNzUHJvcGVydHk7XHJcbiAgICB0aGlzLnZvbHVtZVByb3BlcnR5ID0gdm9sdW1lUHJvcGVydHk7XHJcbiAgICB0aGlzLmRlbnNpdHlQcm9wZXJ0eSA9IGRlbnNpdHlQcm9wZXJ0eTtcclxuXHJcbiAgICB0aGlzLnVuaW50ZXJwb2xhdGVNYXNzZXMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0cyB2YWx1ZXMgdG8gdGhlaXIgb3JpZ2luYWwgc3RhdGVcclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgcmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLm1hc3NQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy52b2x1bWVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5kZW5zaXR5UHJvcGVydHkucmVzZXQoKTtcclxuXHJcbiAgICBzdXBlci5yZXNldCgpO1xyXG4gIH1cclxufVxyXG5cclxuZGVuc2l0eUJ1b3lhbmN5Q29tbW9uLnJlZ2lzdGVyKCAnRGVuc2l0eUNvbXBhcmVNb2RlbCcsIERlbnNpdHlDb21wYXJlTW9kZWwgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFHcEUsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxXQUFXLE1BQU0seUNBQXlDO0FBQ2pFLE9BQU9DLGdCQUFnQixNQUFNLDhDQUE4QztBQUMzRSxPQUFPQyxTQUFTLElBQUlDLGNBQWMsUUFBMEIsdUNBQXVDO0FBRW5HLE9BQU9DLE1BQU0sTUFBTSxpQ0FBaUM7QUFDcEQsT0FBT0MsYUFBYSxNQUFnQyxxQ0FBcUM7QUFDekYsT0FBT0MsSUFBSSxNQUF1Qiw0QkFBNEI7QUFFOUQsT0FBT0MsUUFBUSxNQUFNLGdDQUFnQztBQUNyRCxPQUFPQywyQkFBMkIsTUFBTSxrREFBa0Q7QUFDMUYsT0FBT0MscUJBQXFCLE1BQU0sZ0NBQWdDO0FBR2xFLE9BQU8sTUFBTUMsUUFBUSxTQUFTVCxnQkFBZ0IsQ0FBQztFQUM3QyxPQUF1QlUsU0FBUyxHQUFHLElBQUlELFFBQVEsQ0FBQyxDQUFDO0VBQ2pELE9BQXVCRSxXQUFXLEdBQUcsSUFBSUYsUUFBUSxDQUFDLENBQUM7RUFDbkQsT0FBdUJHLFlBQVksR0FBRyxJQUFJSCxRQUFRLENBQUMsQ0FBQztFQUVwRCxPQUF1QkksV0FBVyxHQUFHLElBQUlkLFdBQVcsQ0FBRVUsUUFBUSxFQUFFO0lBQzlESyxtQkFBbUIsRUFBRTtFQUN2QixDQUFF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TUFBTUksNkJBQTZCLEdBQUcsSUFBSXpELGNBQWMsQ0FBRSxHQUFHLEVBQUU7TUFBRXVCLE1BQU0sRUFBRWYsTUFBTSxDQUFDMkM7SUFBUSxDQUFFLENBQUM7SUFDM0YsTUFBTU8sMkJBQTJCLEdBQUcsSUFBSTFELGNBQWMsQ0FBRSxJQUFJLEVBQUU7TUFBRXVCLE1BQU0sRUFBRWYsTUFBTSxDQUFDMkM7SUFBUSxDQUFFLENBQUM7SUFDMUYsTUFBTVEsNEJBQTRCLEdBQUcsSUFBSTNELGNBQWMsQ0FBRSxJQUFJLEVBQUU7TUFBRXVCLE1BQU0sRUFBRWYsTUFBTSxDQUFDMkM7SUFBUSxDQUFFLENBQUM7SUFDM0YsTUFBTVMsMEJBQTBCLEdBQUcsSUFBSTVELGNBQWMsQ0FBRSxJQUFJLEVBQUU7TUFBRXVCLE1BQU0sRUFBRWYsTUFBTSxDQUFDMkM7SUFBUSxDQUFFLENBQUM7SUFFekYsTUFBTVUsK0JBQStCLEdBQUcsSUFBSTdELGNBQWMsQ0FBRSxJQUFJLEVBQUU7TUFBRXVCLE1BQU0sRUFBRWYsTUFBTSxDQUFDMkM7SUFBUSxDQUFFLENBQUM7SUFDOUYsTUFBTVcsNkJBQTZCLEdBQUcsSUFBSTlELGNBQWMsQ0FBRSxJQUFJLEVBQUU7TUFBRXVCLE1BQU0sRUFBRWYsTUFBTSxDQUFDMkM7SUFBUSxDQUFFLENBQUM7SUFDNUYsTUFBTVksOEJBQThCLEdBQUcsSUFBSS9ELGNBQWMsQ0FBRSxHQUFHLEVBQUU7TUFBRXVCLE1BQU0sRUFBRWYsTUFBTSxDQUFDMkM7SUFBUSxDQUFFLENBQUM7SUFDNUYsTUFBTWEsNEJBQTRCLEdBQUcsSUFBSWhFLGNBQWMsQ0FBRSxHQUFHLEVBQUU7TUFBRXVCLE1BQU0sRUFBRWYsTUFBTSxDQUFDMkM7SUFBUSxDQUFFLENBQUM7SUFFMUYsTUFBTWMsZ0NBQWdDLEdBQUcsSUFBSWpFLGNBQWMsQ0FBRSxHQUFHLEVBQUU7TUFBRXVCLE1BQU0sRUFBRWYsTUFBTSxDQUFDMkM7SUFBUSxDQUFFLENBQUM7SUFDOUYsTUFBTWUsOEJBQThCLEdBQUcsSUFBSWxFLGNBQWMsQ0FBRSxH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