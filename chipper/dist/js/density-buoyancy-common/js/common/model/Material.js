// Copyright 2022-2023, University of Colorado Boulder

/**
 * Represents different materials that solids/liquids in the simulations can take, including density/viscosity/color.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import { Color, ColorProperty } from '../../../../scenery/js/imports.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonColors from '../view/DensityBuoyancyCommonColors.js';
import TinyProperty from '../../../../axon/js/TinyProperty.js';
import ReadOnlyProperty from '../../../../axon/js/ReadOnlyProperty.js';
const NullableColorPropertyReferenceType = NullableIO(ReferenceIO(Property.PropertyIO(Color.ColorIO)));
export default class Material {
  constructor(providedConfig) {
    const config = optionize()({
      nameProperty: new TinyProperty('unknown'),
      identifier: null,
      tandemName: null,
      density: 1,
      viscosity: 1e-3,
      custom: false,
      hidden: false,
      customColor: null,
      liquidColor: null
    }, providedConfig);
    assert && assert(isFinite(config.density));
    this.nameProperty = config.nameProperty;
    this.identifier = config.identifier;
    this.tandemName = config.tandemName;
    this.density = config.density;
    this.viscosity = config.viscosity;
    this.custom = config.custom;
    this.hidden = config.hidden;
    this.customColor = config.customColor;
    this.liquidColor = config.liquidColor;
  }

  /**
   * Returns a custom material that can be modified at will.
   */
  static createCustomMaterial(config) {
    return new Material(combineOptions({
      nameProperty: DensityBuoyancyCommonStrings.material.customStringProperty,
      tandemName: 'custom',
      custom: true
    }, config));
  }

  /**
   * Returns a custom material that can be modified at will, but with a liquid color specified.
   */
  static createCustomLiquidMaterial(config) {
    return Material.createCustomMaterial(combineOptions({
      liquidColor: Material.getCustomLiquidColor(config.density)
    }, config));
  }

  /**
   * Returns a custom material that can be modified at will, but with a solid color specified
   */
  static createCustomSolidMaterial(config) {
    return Material.createCustomMaterial(combineOptions({
      liquidColor: Material.getCustomSolidColor(config.density)
    }, config));
  }

  /**
   * Returns a value suitable for use in colors (0-255 value) that should be used as a grayscale value for
   * a material of a given density.
   */
  static getCustomLightness(density) {
    return Utils.roundSymmetric(Utils.clamp(Utils.linear(1, -2, 0, 255, Utils.log10(density / 1000)), 0, 255));
  }

  /**
   * Similar to getCustomLightness, but returns the generated color, with an included alpha effect.
   */
  static getCustomLiquidColor(density) {
    const lightness = Material.getCustomLightness(density * 0.25);
    return new ColorProperty(new Color(lightness, lightness, lightness, 0.8 * (1 - lightness / 255)));
  }

  /**
   * Similar to getCustomLightness, but returns the generated color
   */
  static getCustomSolidColor(density) {
    const lightness = Material.getCustomLightness(density);
    return new ColorProperty(new Color(lightness, lightness, lightness));
  }

  /**
   * Keep a material's color and opacity to match the liquid color from a given Property<Material>
   *
   * NOTE: Only call this for things that exist for the lifetime of this simulation (otherwise it would leak memory)
   */
  static linkLiquidColor(property, threeMaterial) {
    new DynamicProperty(property, {
      derive: material => {
        assert && assert(material.liquidColor);
        return material.liquidColor;
      }
    }).link(color => {
      threeMaterial.color = ThreeUtils.colorToThree(color);
      threeMaterial.opacity = color.alpha;
    });
  }

  // (read-only) {Material} - "Solids"

  static ALUMINUM = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.aluminumStringProperty,
    tandemName: 'aluminum',
    identifier: 'ALUMINUM',
    density: 2700
  });
  static APPLE = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.appleStringProperty,
    tandemName: 'apple',
    identifier: 'APPLE',
    // "Some Physical Properties of Apple" - Averaged the two cultivars' densities for this
    // http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.548.1131&rep=rep1&type=pdf
    density: 832
  });
  static BRICK = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.brickStringProperty,
    tandemName: 'brick',
    identifier: 'BRICK',
    density: 2000
  });
  static CEMENT = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.cementStringProperty,
    tandemName: 'cement',
    identifier: 'CEMENT',
    density: 3150,
    liquidColor: DensityBuoyancyCommonColors.materialCementColorProperty
  });
  static COPPER = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.copperStringProperty,
    tandemName: 'copper',
    identifier: 'COPPER',
    density: 8960,
    liquidColor: DensityBuoyancyCommonColors.materialCopperColorProperty
  });
  static DIAMOND = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.diamondStringProperty,
    tandemName: 'diamond',
    identifier: 'DIAMOND',
    density: 3510
  });
  static GLASS = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.glassStringProperty,
    tandemName: 'glass',
    identifier: 'GLASS',
    density: 2700
  });
  static GOLD = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.goldStringProperty,
    tandemName: 'gold',
    identifier: 'GOLD',
    density: 19320
  });
  static HUMAN = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.humanStringProperty,
    tandemName: 'human',
    identifier: 'HUMAN',
    density: 950
  });
  static ICE = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.iceStringProperty,
    tandemName: 'ice',
    identifier: 'ICE',
    density: 919
  });
  static LEAD = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.leadStringProperty,
    tandemName: 'lead',
    identifier: 'LEAD',
    density: 11342,
    liquidColor: DensityBuoyancyCommonColors.materialLeadColorProperty
  });
  static PLATINUM = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.platinumStringProperty,
    tandemName: 'platinum',
    identifier: 'PLATINUM',
    density: 21450
  });
  static PYRITE = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.pyriteStringProperty,
    tandemName: 'pyrite',
    identifier: 'PYRITE',
    density: 5010
  });
  static SILVER = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.silverStringProperty,
    tandemName: 'silver',
    identifier: 'SILVER',
    density: 10490
  });
  static STEEL = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.steelStringProperty,
    tandemName: 'steel',
    identifier: 'STEEL',
    density: 7800
  });
  static STYROFOAM = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.styrofoamStringProperty,
    tandemName: 'styrofoam',
    identifier: 'STYROFOAM',
    // From Flash version: between 25 and 200 according to http://wiki.answers.com/Q/What_is_the_density_of_styrofoam;
    // chose 150 so it isn't too low to show on slider, but not 200 so it's not half of wood
    density: 150
  });
  static TANTALUM = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.tantalumStringProperty,
    tandemName: 'tantalum',
    identifier: 'TANTALUM',
    density: 16650
  });
  static TITANIUM = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.titaniumStringProperty,
    tandemName: 'titanium',
    identifier: 'TITANIUM',
    density: 4500
  });
  static WOOD = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.woodStringProperty,
    tandemName: 'wood',
    identifier: 'WOOD',
    density: 400
  });

  // (read-only) {Material} - "Liquids".

  static AIR = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.airStringProperty,
    tandemName: 'air',
    identifier: 'AIR',
    density: 1.2,
    viscosity: 0,
    liquidColor: DensityBuoyancyCommonColors.materialAirColorProperty
  });
  static DENSITY_A = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.densityAStringProperty,
    tandemName: 'densityA',
    identifier: 'DENSITY_A',
    density: 3100,
    liquidColor: DensityBuoyancyCommonColors.materialDensityAColorProperty,
    hidden: true
  });
  static DENSITY_B = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.densityBStringProperty,
    tandemName: 'densityB',
    identifier: 'DENSITY_B',
    density: 790,
    liquidColor: DensityBuoyancyCommonColors.materialDensityBColorProperty,
    hidden: true
  });
  static DENSITY_C = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.densityCStringProperty,
    tandemName: 'densityC',
    identifier: 'DENSITY_C',
    density: 490,
    liquidColor: DensityBuoyancyCommonColors.materialDensityCColorProperty,
    hidden: true
  });
  static DENSITY_D = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.densityDStringProperty,
    tandemName: 'densityD',
    identifier: 'DENSITY_D',
    density: 2890,
    liquidColor: DensityBuoyancyCommonColors.materialDensityDColorProperty,
    hidden: true
  });
  static DENSITY_E = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.densityEStringProperty,
    tandemName: 'densityE',
    identifier: 'DENSITY_E',
    density: 1260,
    liquidColor: DensityBuoyancyCommonColors.materialDensityEColorProperty,
    hidden: true
  });
  static DENSITY_F = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.densityFStringProperty,
    tandemName: 'densityF',
    identifier: 'DENSITY_F',
    density: 6440,
    liquidColor: DensityBuoyancyCommonColors.materialDensityFColorProperty,
    hidden: true
  });
  static GASOLINE = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.gasolineStringProperty,
    tandemName: 'gasoline',
    identifier: 'GASOLINE',
    density: 680,
    viscosity: 6e-4,
    liquidColor: DensityBuoyancyCommonColors.materialGasolineColorProperty
  });
  static HONEY = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.honeyStringProperty,
    tandemName: 'honey',
    identifier: 'HONEY',
    density: 1440,
    viscosity: 0.03,
    // NOTE: actual value around 2.5, but we can get away with this for animation
    liquidColor: DensityBuoyancyCommonColors.materialHoneyColorProperty
  });
  static MERCURY = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.mercuryStringProperty,
    tandemName: 'mercury',
    identifier: 'MERCURY',
    density: 13593,
    viscosity: 1.53e-3,
    liquidColor: DensityBuoyancyCommonColors.materialMercuryColorProperty
  });
  static OIL = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.oilStringProperty,
    tandemName: 'oil',
    identifier: 'OIL',
    density: 920,
    viscosity: 0.02,
    // Too much bigger and it won't work, not particularly physical
    liquidColor: DensityBuoyancyCommonColors.materialOilColorProperty
  });
  static SAND = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.sandStringProperty,
    tandemName: 'sand',
    identifier: 'SAND',
    density: 1442,
    viscosity: 0.03,
    // Too much bigger and it won't work, not particularly physical
    liquidColor: DensityBuoyancyCommonColors.materialSandColorProperty
  });
  static SEAWATER = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.seawaterStringProperty,
    tandemName: 'seawater',
    identifier: 'SEAWATER',
    density: 1029,
    viscosity: 1.88e-3,
    liquidColor: DensityBuoyancyCommonColors.materialSeawaterColorProperty
  });
  static WATER = new Material({
    nameProperty: DensityBuoyancyCommonStrings.material.waterStringProperty,
    tandemName: 'water',
    identifier: 'WATER',
    density: 1000,
    viscosity: 8.9e-4,
    liquidColor: DensityBuoyancyCommonColors.materialWaterColorProperty
  });
  static MATERIALS = [Material.AIR, Material.ALUMINUM, Material.APPLE, Material.BRICK, Material.CEMENT, Material.COPPER, Material.DENSITY_E, Material.DENSITY_F, Material.DENSITY_A, Material.DENSITY_B, Material.DIAMOND, Material.GASOLINE, Material.GLASS, Material.GOLD, Material.HONEY, Material.HUMAN, Material.ICE, Material.LEAD, Material.MERCURY, Material.OIL, Material.PLATINUM, Material.PYRITE, Material.SAND, Material.SEAWATER, Material.SILVER, Material.STEEL, Material.STYROFOAM, Material.TANTALUM, Material.TITANIUM, Material.WATER, Material.WOOD];
  static MaterialIO = new IOType('MaterialIO', {
    valueType: Material,
    documentation: 'Represents different materials that solids/liquids in the simulations can take, including density (kg/m^3), viscosity (Pa * s), and color.',
    stateSchema: {
      name: ReferenceIO(ReadOnlyProperty.PropertyIO(StringIO)),
      identifier: NullableIO(StringIO),
      tandemName: NullableIO(StringIO),
      density: NumberIO,
      viscosity: NumberIO,
      custom: BooleanIO,
      hidden: BooleanIO,
      staticCustomColor: NullableIO(Color.ColorIO),
      customColor: NullableColorPropertyReferenceType,
      staticLiquidColor: NullableIO(Color.ColorIO),
      liquidColor: NullableColorPropertyReferenceType
    },
    toStateObject(material) {
      const isCustomColorUninstrumented = material.customColor && !material.customColor.isPhetioInstrumented();
      const isLiquidColorUninstrumented = material.liquidColor && !material.liquidColor.isPhetioInstrumented();
      return {
        name: ReferenceIO(ReadOnlyProperty.PropertyIO(StringIO)).toStateObject(material.nameProperty),
        identifier: NullableIO(StringIO).toStateObject(material.identifier),
        tandemName: NullableIO(StringIO).toStateObject(material.tandemName),
        density: material.density,
        viscosity: material.viscosity,
        custom: material.custom,
        hidden: material.hidden,
        staticCustomColor: NullableIO(Color.ColorIO).toStateObject(isCustomColorUninstrumented ? material.customColor.value : null),
        customColor: NullableColorPropertyReferenceType.toStateObject(isCustomColorUninstrumented ? null : material.customColor),
        staticLiquidColor: NullableIO(Color.ColorIO).toStateObject(isLiquidColorUninstrumented ? material.liquidColor.value : null),
        liquidColor: NullableColorPropertyReferenceType.toStateObject(isLiquidColorUninstrumented ? null : material.liquidColor)
      };
    },
    fromStateObject(obj) {
      if (obj.identifier) {
        const material = Material[obj.identifier];
        assert && assert(material, `Unknown material: ${obj.identifier}`);
        return material;
      } else {
        const staticCustomColor = NullableIO(Color.ColorIO).fromStateObject(obj.staticCustomColor);
        const staticLiquidColor = NullableIO(Color.ColorIO).fromStateObject(obj.staticLiquidColor);
        return new Material({
          nameProperty: ReferenceIO(ReadOnlyProperty.PropertyIO(StringIO)).fromStateObject(obj.name),
          identifier: NullableIO(StringIO).fromStateObject(obj.identifier),
          tandemName: NullableIO(StringIO).fromStateObject(obj.tandemName),
          density: obj.density,
          viscosity: obj.viscosity,
          custom: obj.custom,
          hidden: obj.hidden,
          customColor: staticCustomColor ? new ColorProperty(staticCustomColor) : NullableColorPropertyReferenceType.fromStateObject(obj.customColor),
          liquidColor: staticLiquidColor ? new ColorProperty(staticLiquidColor) : NullableColorPropertyReferenceType.fromStateObject(obj.liquidColor)
        });
      }
    }
  });
}
densityBuoyancyCommon.register('Material', Material);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEeW5hbWljUHJvcGVydHkiLCJQcm9wZXJ0eSIsIlV0aWxzIiwiVGhyZWVVdGlscyIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiQ29sb3IiLCJDb2xvclByb3BlcnR5IiwiQm9vbGVhbklPIiwiSU9UeXBlIiwiTnVsbGFibGVJTyIsIk51bWJlcklPIiwiUmVmZXJlbmNlSU8iLCJTdHJpbmdJTyIsImRlbnNpdHlCdW95YW5jeUNvbW1vbiIsIkRlbnNpdHlCdW95YW5jeUNvbW1vblN0cmluZ3MiLCJEZW5zaXR5QnVveWFuY3lDb21tb25Db2xvcnMiLCJUaW55UHJvcGVydHkiLCJSZWFkT25seVByb3BlcnR5IiwiTnVsbGFibGVDb2xvclByb3BlcnR5UmVmZXJlbmNlVHlwZSIsIlByb3BlcnR5SU8iLCJDb2xvcklPIiwiTWF0ZXJpYWwiLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkQ29uZmlnIiwiY29uZmlnIiwibmFtZVByb3BlcnR5IiwiaWRlbnRpZmllciIsInRhbmRlbU5hbWUiLCJkZW5zaXR5IiwidmlzY29zaXR5IiwiY3VzdG9tIiwiaGlkZGVuIiwiY3VzdG9tQ29sb3IiLCJsaXF1aWRDb2xvciIsImFzc2VydCIsImlzRmluaXRlIiwiY3JlYXRlQ3VzdG9tTWF0ZXJpYWwiLCJtYXRlcmlhbCIsImN1c3RvbVN0cmluZ1Byb3BlcnR5IiwiY3JlYXRlQ3VzdG9tTGlxdWlkTWF0ZXJpYWwiLCJnZXRDdXN0b21MaXF1aWRDb2xvciIsImNyZWF0ZUN1c3RvbVNvbGlkTWF0ZXJpYWwiLCJnZXRDdXN0b21Tb2xpZENvbG9yIiwiZ2V0Q3VzdG9tTGlnaHRuZXNzIiwicm91bmRTeW1tZXRyaWMiLCJjbGFtcCIsImxpbmVhciIsImxvZzEwIiwibGlnaHRuZXNzIiwibGlua0xpcXVpZENvbG9yIiwicHJvcGVydHkiLCJ0aHJlZU1hdGVyaWFsIiwiZGVyaXZlIiwibGluayIsImNvbG9yIiwiY29sb3JUb1RocmVlIiwib3BhY2l0eSIsImFscGhhIiwiQUxVTUlOVU0iLCJhbHVtaW51bVN0cmluZ1Byb3BlcnR5IiwiQVBQTEUiLCJhcHBsZVN0cmluZ1Byb3BlcnR5IiwiQlJJQ0siLCJicmlja1N0cmluZ1Byb3BlcnR5IiwiQ0VNRU5UIiwiY2VtZW50U3RyaW5nUHJvcGVydHkiLCJtYXRlcmlhbENlbWVudENvbG9yUHJvcGVydHkiLCJDT1BQRVIiLCJjb3BwZXJTdHJpbmdQcm9wZXJ0eSIsIm1hdGVyaWFsQ29wcGVyQ29sb3JQcm9wZXJ0eSIsIkRJQU1PTkQiLCJkaWFtb25kU3RyaW5nUHJvcGVydHkiLCJHTEFTUyIsImdsYXNzU3RyaW5nUHJvcGVydHkiLCJHT0xEIiwiZ29sZFN0cmluZ1Byb3BlcnR5IiwiSFVNQU4iLCJodW1hblN0cmluZ1Byb3BlcnR5IiwiSUNFIiwiaWNlU3RyaW5nUHJvcGVydHkiLCJMRUFEIiwibGVhZFN0cmluZ1Byb3BlcnR5IiwibWF0ZXJpYWxMZWFkQ29sb3JQcm9wZXJ0eSIsIlBMQVRJTlVNIiwicGxhdGludW1TdHJpbmdQcm9wZXJ0eSIsIlBZUklURSIsInB5cml0ZVN0cmluZ1Byb3BlcnR5IiwiU0lMVkVSIiwic2lsdmVyU3RyaW5nUHJvcGVydHkiLCJTVEVFTCIsInN0ZWVsU3RyaW5nUHJvcGVydHkiLCJTVFlST0ZPQU0iLCJzdHlyb2ZvYW1TdHJpbmdQcm9wZXJ0eSIsIlRBTlRBTFVNIiwidGFudGFsdW1TdHJpbmdQcm9wZXJ0eSIsIlRJVEFOSVVNIiwidGl0YW5pdW1TdHJpbmdQcm9wZXJ0eSIsIldPT0QiLCJ3b29kU3RyaW5nUHJvcGVydHkiLCJBSVIiLCJhaXJTdHJpbmdQcm9wZXJ0eSIsIm1hdGVyaWFsQWlyQ29sb3JQcm9wZXJ0eSIsIkRFTlNJVFlfQSIsImRlbnNpdHlBU3RyaW5nUHJvcGVydHkiLCJtYXRlcmlhbERlbnNpdHlBQ29sb3JQcm9wZXJ0eSIsIkRFTlNJVFlfQiIsImRlbnNpdHlCU3RyaW5nUHJvcGVydHkiLCJtYXRlcmlhbERlbnNpdHlCQ29sb3JQcm9wZXJ0eSIsIkRFTlNJVFlfQyIsImRlbnNpdHlDU3RyaW5nUHJvcGVydHkiLCJtYXRlcmlhbERlbnNpdHlDQ29sb3JQcm9wZXJ0eSIsIkRFTlNJVFlfRCIsImRlbnNpdHlEU3RyaW5nUHJvcGVydHkiLCJtYXRlcmlhbERlbnNpdHlEQ29sb3JQcm9wZXJ0eSIsIkRFTlNJVFlfRSIsImRlbnNpdHlFU3RyaW5nUHJvcGVydHkiLCJtYXRlcmlhbERlbnNpdHlFQ29sb3JQcm9wZXJ0eSIsIkRFTlNJVFlfRiIsImRlbnNpdHlGU3RyaW5nUHJvcGVydHkiLCJtYXRlcmlhbERlbnNpdHlGQ29sb3JQcm9wZXJ0eSIsIkdBU09MSU5FIiwiZ2Fzb2xpbmVTdHJpbmdQcm9wZXJ0eSIsIm1hdGVyaWFsR2Fzb2xpbmVDb2xvclByb3BlcnR5IiwiSE9ORVkiLCJob25leVN0cmluZ1Byb3BlcnR5IiwibWF0ZXJpYWxIb25leUNvbG9yUHJvcGVydHkiLCJNRVJDVVJZIiwibWVyY3VyeVN0cmluZ1Byb3BlcnR5IiwibWF0ZXJpYWxNZXJjdXJ5Q29sb3JQcm9wZXJ0eSIsIk9JTCIsIm9pbFN0cmluZ1Byb3BlcnR5IiwibWF0ZXJpYWxPaWxDb2xvclByb3BlcnR5IiwiU0FORCIsInNhbmRTdHJpbmdQcm9wZXJ0eSIsIm1hdGVyaWFsU2FuZENvbG9yUHJvcGVydHkiLCJTRUFXQVRFUiIsInNlYXdhdGVyU3RyaW5nUHJvcGVydHkiLCJtYXRlcmlhbFNlYXdhdGVyQ29sb3JQcm9wZXJ0eSIsIldBVEVSIiwid2F0ZXJTdHJpbmdQcm9wZXJ0eSIsIm1hdGVyaWFsV2F0ZXJDb2xvclByb3BlcnR5IiwiTUFURVJJQUxTIiwiTWF0ZXJpYWxJTyIsInZhbHVlVHlwZSIsImRvY3VtZW50YXRpb24iLCJzdGF0ZVNjaGVtYSIsIm5hbWUiLCJzdGF0aWNDdXN0b21Db2xvciIsInN0YXRpY0xpcXVpZENvbG9yIiwidG9TdGF0ZU9iamVjdCIsImlzQ3VzdG9tQ29sb3JVbmluc3RydW1lbnRlZCIsImlzUGhldGlvSW5zdHJ1bWVudGVkIiwiaXNMaXF1aWRDb2xvclVuaW5zdHJ1bWVudGVkIiwidmFsdWUiLCJmcm9tU3RhdGVPYmplY3QiLCJvYmoiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1hdGVyaWFsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudHMgZGlmZmVyZW50IG1hdGVyaWFscyB0aGF0IHNvbGlkcy9saXF1aWRzIGluIHRoZSBzaW11bGF0aW9ucyBjYW4gdGFrZSwgaW5jbHVkaW5nIGRlbnNpdHkvdmlzY29zaXR5L2NvbG9yLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IER5bmFtaWNQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0R5bmFtaWNQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVGhyZWVVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9tb2JpdXMvanMvVGhyZWVVdGlscy5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIENvbG9yUHJvcGVydHksIENvbG9yU3RhdGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQm9vbGVhbklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9Cb29sZWFuSU8uanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgTnVsbGFibGVJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvTnVsbGFibGVJTy5qcyc7XHJcbmltcG9ydCBOdW1iZXJJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvTnVtYmVySU8uanMnO1xyXG5pbXBvcnQgUmVmZXJlbmNlSU8sIHsgUmVmZXJlbmNlSU9TdGF0ZSB9IGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9SZWZlcmVuY2VJTy5qcyc7XHJcbmltcG9ydCBTdHJpbmdJTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvU3RyaW5nSU8uanMnO1xyXG5pbXBvcnQgZGVuc2l0eUJ1b3lhbmN5Q29tbW9uIGZyb20gJy4uLy4uL2RlbnNpdHlCdW95YW5jeUNvbW1vbi5qcyc7XHJcbmltcG9ydCBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzIGZyb20gJy4uLy4uL0RlbnNpdHlCdW95YW5jeUNvbW1vblN0cmluZ3MuanMnO1xyXG5pbXBvcnQgRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29sb3JzIGZyb20gJy4uL3ZpZXcvRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29sb3JzLmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVGlueVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVGlueVByb3BlcnR5LmpzJztcclxuaW1wb3J0IFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9SZWFkT25seVByb3BlcnR5LmpzJztcclxuXHJcblxyXG5jb25zdCBOdWxsYWJsZUNvbG9yUHJvcGVydHlSZWZlcmVuY2VUeXBlID0gTnVsbGFibGVJTyggUmVmZXJlbmNlSU8oIFByb3BlcnR5LlByb3BlcnR5SU8oIENvbG9yLkNvbG9ySU8gKSApICk7XHJcblxyXG50eXBlIE1hdGVyaWFsU3RhdGUgPSB7XHJcbiAgaWRlbnRpZmllcjogbnVsbCB8IGtleW9mIHR5cGVvZiBNYXRlcmlhbDtcclxuICBuYW1lOiBSZWZlcmVuY2VJT1N0YXRlO1xyXG4gIHRhbmRlbU5hbWU6IHN0cmluZyB8IG51bGw7XHJcbiAgZGVuc2l0eTogbnVtYmVyO1xyXG4gIHZpc2Nvc2l0eTogbnVtYmVyO1xyXG4gIGN1c3RvbTogYm9vbGVhbjtcclxuICBoaWRkZW46IGJvb2xlYW47XHJcbiAgc3RhdGljQ3VzdG9tQ29sb3I6IG51bGwgfCBDb2xvclN0YXRlO1xyXG4gIGN1c3RvbUNvbG9yOiBudWxsIHwgQ29sb3JTdGF0ZTtcclxuICBzdGF0aWNMaXF1aWRDb2xvcjogbnVsbCB8IENvbG9yU3RhdGU7XHJcbiAgbGlxdWlkQ29sb3I6IG51bGwgfCBDb2xvclN0YXRlO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgTWF0ZXJpYWxOYW1lID0ga2V5b2YgKCB0eXBlb2YgTWF0ZXJpYWwgKSB8ICdDVVNUT00nO1xyXG5cclxuZXhwb3J0IHR5cGUgTWF0ZXJpYWxPcHRpb25zID0ge1xyXG4gIG5hbWVQcm9wZXJ0eT86IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz47XHJcblxyXG4gIC8vIElmIHNldCwgdGhpcyBtYXRlcmlhbCB3aWxsIGJlIGF2YWlsYWJsZSBhdCBNYXRlcmlhbFsgaWRlbnRpZmllciBdIGFzIGEgZ2xvYmFsXHJcbiAgaWRlbnRpZmllcj86IE1hdGVyaWFsTmFtZSB8IG51bGw7XHJcblxyXG4gIC8vIFVzZWQgZm9yIHRhbmRlbXNcclxuICB0YW5kZW1OYW1lPzogc3RyaW5nIHwgbnVsbDtcclxuXHJcbiAgLy8gaW4gU0kgKGtnL21eMylcclxuICBkZW5zaXR5PzogbnVtYmVyO1xyXG5cclxuICAvLyBpbiBTSSAoUGEgKiBzKS4gRm9yIHJlZmVyZW5jZSBhIHBvaXNlIGlzIDFlLTIgUGEqcywgYW5kIGEgY2VudGlwb2lzZSBpcyAxZS0zIFBhKnMuXHJcbiAgdmlzY29zaXR5PzogbnVtYmVyO1xyXG5cclxuICBjdXN0b20/OiBib29sZWFuO1xyXG5cclxuICAvLyBJZiB0cnVlLCBkb24ndCBzaG93IHRoZSBkZW5zaXR5IGluIG51bWJlciBwaWNrZXJzL3JlYWRvdXRzXHJcbiAgaGlkZGVuPzogYm9vbGVhbjtcclxuXHJcbiAgLy8gVXNlcyB0aGUgY29sb3IgZm9yIGEgc29saWQgbWF0ZXJpYWwncyBjb2xvclxyXG4gIGN1c3RvbUNvbG9yPzogUHJvcGVydHk8Q29sb3I+IHwgbnVsbDtcclxuXHJcbiAgLy8gVXNlcyB0aGUgYWxwaGEgY2hhbm5lbCBmb3Igb3BhY2l0eVxyXG4gIGxpcXVpZENvbG9yPzogUHJvcGVydHk8Q29sb3I+IHwgbnVsbDtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hdGVyaWFsIHtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IG5hbWVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgaWRlbnRpZmllcjogTWF0ZXJpYWxOYW1lIHwgbnVsbDtcclxuICBwdWJsaWMgcmVhZG9ubHkgdGFuZGVtTmFtZTogc3RyaW5nIHwgbnVsbDtcclxuICBwdWJsaWMgcmVhZG9ubHkgZGVuc2l0eTogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSB2aXNjb3NpdHk6IG51bWJlcjtcclxuICBwdWJsaWMgcmVhZG9ubHkgY3VzdG9tOiBib29sZWFuO1xyXG4gIHB1YmxpYyByZWFkb25seSBoaWRkZW46IGJvb2xlYW47XHJcbiAgcHVibGljIHJlYWRvbmx5IGN1c3RvbUNvbG9yOiBQcm9wZXJ0eTxDb2xvcj4gfCBudWxsO1xyXG4gIHB1YmxpYyByZWFkb25seSBsaXF1aWRDb2xvcjogUHJvcGVydHk8Q29sb3I+IHwgbnVsbDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZENvbmZpZzogTWF0ZXJpYWxPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IGNvbmZpZyA9IG9wdGlvbml6ZTxNYXRlcmlhbE9wdGlvbnMsIE1hdGVyaWFsT3B0aW9ucz4oKSgge1xyXG4gICAgICBuYW1lUHJvcGVydHk6IG5ldyBUaW55UHJvcGVydHkoICd1bmtub3duJyApLFxyXG4gICAgICBpZGVudGlmaWVyOiBudWxsLFxyXG4gICAgICB0YW5kZW1OYW1lOiBudWxsLFxyXG4gICAgICBkZW5zaXR5OiAxLFxyXG4gICAgICB2aXNjb3NpdHk6IDFlLTMsXHJcbiAgICAgIGN1c3RvbTogZmFsc2UsXHJcbiAgICAgIGhpZGRlbjogZmFsc2UsXHJcbiAgICAgIGN1c3RvbUNvbG9yOiBudWxsLFxyXG4gICAgICBsaXF1aWRDb2xvcjogbnVsbFxyXG4gICAgfSwgcHJvdmlkZWRDb25maWcgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggY29uZmlnLmRlbnNpdHkgKSApO1xyXG5cclxuICAgIHRoaXMubmFtZVByb3BlcnR5ID0gY29uZmlnLm5hbWVQcm9wZXJ0eTtcclxuICAgIHRoaXMuaWRlbnRpZmllciA9IGNvbmZpZy5pZGVudGlmaWVyO1xyXG4gICAgdGhpcy50YW5kZW1OYW1lID0gY29uZmlnLnRhbmRlbU5hbWU7XHJcbiAgICB0aGlzLmRlbnNpdHkgPSBjb25maWcuZGVuc2l0eTtcclxuICAgIHRoaXMudmlzY29zaXR5ID0gY29uZmlnLnZpc2Nvc2l0eTtcclxuICAgIHRoaXMuY3VzdG9tID0gY29uZmlnLmN1c3RvbTtcclxuICAgIHRoaXMuaGlkZGVuID0gY29uZmlnLmhpZGRlbjtcclxuICAgIHRoaXMuY3VzdG9tQ29sb3IgPSBjb25maWcuY3VzdG9tQ29sb3I7XHJcbiAgICB0aGlzLmxpcXVpZENvbG9yID0gY29uZmlnLmxpcXVpZENvbG9yO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIGN1c3RvbSBtYXRlcmlhbCB0aGF0IGNhbiBiZSBtb2RpZmllZCBhdCB3aWxsLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlQ3VzdG9tTWF0ZXJpYWwoIGNvbmZpZzogTWF0ZXJpYWxPcHRpb25zICk6IE1hdGVyaWFsIHtcclxuICAgIHJldHVybiBuZXcgTWF0ZXJpYWwoIGNvbWJpbmVPcHRpb25zPE1hdGVyaWFsT3B0aW9ucz4oIHtcclxuICAgICAgbmFtZVByb3BlcnR5OiBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzLm1hdGVyaWFsLmN1c3RvbVN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICB0YW5kZW1OYW1lOiAnY3VzdG9tJyxcclxuICAgICAgY3VzdG9tOiB0cnVlXHJcbiAgICB9LCBjb25maWcgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIGN1c3RvbSBtYXRlcmlhbCB0aGF0IGNhbiBiZSBtb2RpZmllZCBhdCB3aWxsLCBidXQgd2l0aCBhIGxpcXVpZCBjb2xvciBzcGVjaWZpZWQuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBjcmVhdGVDdXN0b21MaXF1aWRNYXRlcmlhbCggY29uZmlnOiBNYXRlcmlhbE9wdGlvbnMgJiBSZXF1aXJlZDxQaWNrPE1hdGVyaWFsT3B0aW9ucywgJ2RlbnNpdHknPj4gKTogTWF0ZXJpYWwge1xyXG4gICAgcmV0dXJuIE1hdGVyaWFsLmNyZWF0ZUN1c3RvbU1hdGVyaWFsKCBjb21iaW5lT3B0aW9uczxNYXRlcmlhbE9wdGlvbnM+KCB7XHJcbiAgICAgIGxpcXVpZENvbG9yOiBNYXRlcmlhbC5nZXRDdXN0b21MaXF1aWRDb2xvciggY29uZmlnLmRlbnNpdHkgKVxyXG4gICAgfSwgY29uZmlnICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBjdXN0b20gbWF0ZXJpYWwgdGhhdCBjYW4gYmUgbW9kaWZpZWQgYXQgd2lsbCwgYnV0IHdpdGggYSBzb2xpZCBjb2xvciBzcGVjaWZpZWRcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGNyZWF0ZUN1c3RvbVNvbGlkTWF0ZXJpYWwoIGNvbmZpZzogTWF0ZXJpYWxPcHRpb25zICYgUmVxdWlyZWQ8UGljazxNYXRlcmlhbE9wdGlvbnMsICdkZW5zaXR5Jz4+ICk6IE1hdGVyaWFsIHtcclxuICAgIHJldHVybiBNYXRlcmlhbC5jcmVhdGVDdXN0b21NYXRlcmlhbCggY29tYmluZU9wdGlvbnM8TWF0ZXJpYWxPcHRpb25zPigge1xyXG4gICAgICBsaXF1aWRDb2xvcjogTWF0ZXJpYWwuZ2V0Q3VzdG9tU29saWRDb2xvciggY29uZmlnLmRlbnNpdHkgKVxyXG4gICAgfSwgY29uZmlnICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSB2YWx1ZSBzdWl0YWJsZSBmb3IgdXNlIGluIGNvbG9ycyAoMC0yNTUgdmFsdWUpIHRoYXQgc2hvdWxkIGJlIHVzZWQgYXMgYSBncmF5c2NhbGUgdmFsdWUgZm9yXHJcbiAgICogYSBtYXRlcmlhbCBvZiBhIGdpdmVuIGRlbnNpdHkuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBnZXRDdXN0b21MaWdodG5lc3MoIGRlbnNpdHk6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIFV0aWxzLnJvdW5kU3ltbWV0cmljKCBVdGlscy5jbGFtcCggVXRpbHMubGluZWFyKCAxLCAtMiwgMCwgMjU1LCBVdGlscy5sb2cxMCggZGVuc2l0eSAvIDEwMDAgKSApLCAwLCAyNTUgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2ltaWxhciB0byBnZXRDdXN0b21MaWdodG5lc3MsIGJ1dCByZXR1cm5zIHRoZSBnZW5lcmF0ZWQgY29sb3IsIHdpdGggYW4gaW5jbHVkZWQgYWxwaGEgZWZmZWN0LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgZ2V0Q3VzdG9tTGlxdWlkQ29sb3IoIGRlbnNpdHk6IG51bWJlciApOiBDb2xvclByb3BlcnR5IHtcclxuICAgIGNvbnN0IGxpZ2h0bmVzcyA9IE1hdGVyaWFsLmdldEN1c3RvbUxpZ2h0bmVzcyggZGVuc2l0eSAqIDAuMjUgKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IENvbG9yUHJvcGVydHkoIG5ldyBDb2xvciggbGlnaHRuZXNzLCBsaWdodG5lc3MsIGxpZ2h0bmVzcywgMC44ICogKCAxIC0gbGlnaHRuZXNzIC8gMjU1ICkgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2ltaWxhciB0byBnZXRDdXN0b21MaWdodG5lc3MsIGJ1dCByZXR1cm5zIHRoZSBnZW5lcmF0ZWQgY29sb3JcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGdldEN1c3RvbVNvbGlkQ29sb3IoIGRlbnNpdHk6IG51bWJlciApOiBDb2xvclByb3BlcnR5IHtcclxuICAgIGNvbnN0IGxpZ2h0bmVzcyA9IE1hdGVyaWFsLmdldEN1c3RvbUxpZ2h0bmVzcyggZGVuc2l0eSApO1xyXG5cclxuICAgIHJldHVybiBuZXcgQ29sb3JQcm9wZXJ0eSggbmV3IENvbG9yKCBsaWdodG5lc3MsIGxpZ2h0bmVzcywgbGlnaHRuZXNzICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEtlZXAgYSBtYXRlcmlhbCdzIGNvbG9yIGFuZCBvcGFjaXR5IHRvIG1hdGNoIHRoZSBsaXF1aWQgY29sb3IgZnJvbSBhIGdpdmVuIFByb3BlcnR5PE1hdGVyaWFsPlxyXG4gICAqXHJcbiAgICogTk9URTogT25seSBjYWxsIHRoaXMgZm9yIHRoaW5ncyB0aGF0IGV4aXN0IGZvciB0aGUgbGlmZXRpbWUgb2YgdGhpcyBzaW11bGF0aW9uIChvdGhlcndpc2UgaXQgd291bGQgbGVhayBtZW1vcnkpXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBsaW5rTGlxdWlkQ29sb3IoIHByb3BlcnR5OiBUUHJvcGVydHk8TWF0ZXJpYWw+LCB0aHJlZU1hdGVyaWFsOiBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCB8IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwgfCBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCApOiB2b2lkIHtcclxuICAgIG5ldyBEeW5hbWljUHJvcGVydHk8Q29sb3IsIENvbG9yLCBNYXRlcmlhbD4oIHByb3BlcnR5LCB7XHJcbiAgICAgIGRlcml2ZTogbWF0ZXJpYWwgPT4ge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG1hdGVyaWFsLmxpcXVpZENvbG9yICk7XHJcblxyXG4gICAgICAgIHJldHVybiBtYXRlcmlhbC5saXF1aWRDb2xvciE7XHJcbiAgICAgIH1cclxuICAgIH0gKS5saW5rKCAoIGNvbG9yOiBDb2xvciApID0+IHtcclxuICAgICAgdGhyZWVNYXRlcmlhbC5jb2xvciA9IFRocmVlVXRpbHMuY29sb3JUb1RocmVlKCBjb2xvciApO1xyXG4gICAgICB0aHJlZU1hdGVyaWFsLm9wYWNpdHkgPSBjb2xvci5hbHBoYTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8vIChyZWFkLW9ubHkpIHtNYXRlcmlhbH0gLSBcIlNvbGlkc1wiXHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgQUxVTUlOVU0gPSBuZXcgTWF0ZXJpYWwoIHtcclxuICAgIG5hbWVQcm9wZXJ0eTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXRlcmlhbC5hbHVtaW51bVN0cmluZ1Byb3BlcnR5LFxyXG4gICAgdGFuZGVtTmFtZTogJ2FsdW1pbnVtJyxcclxuICAgIGlkZW50aWZpZXI6ICdBTFVNSU5VTScsXHJcbiAgICBkZW5zaXR5OiAyNzAwXHJcbiAgfSApO1xyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEFQUExFID0gbmV3IE1hdGVyaWFsKCB7XHJcbiAgICBuYW1lUHJvcGVydHk6IERlbnNpdHlCdW95YW5jeUNvbW1vblN0cmluZ3MubWF0ZXJpYWwuYXBwbGVTdHJpbmdQcm9wZXJ0eSxcclxuICAgIHRhbmRlbU5hbWU6ICdhcHBsZScsXHJcbiAgICBpZGVudGlmaWVyOiAnQVBQTEUnLFxyXG4gICAgLy8gXCJTb21lIFBoeXNpY2FsIFByb3BlcnRpZXMgb2YgQXBwbGVcIiAtIEF2ZXJhZ2VkIHRoZSB0d28gY3VsdGl2YXJzJyBkZW5zaXRpZXMgZm9yIHRoaXNcclxuICAgIC8vIGh0dHA6Ly9jaXRlc2VlcnguaXN0LnBzdS5lZHUvdmlld2RvYy9kb3dubG9hZD9kb2k9MTAuMS4xLjU0OC4xMTMxJnJlcD1yZXAxJnR5cGU9cGRmXHJcbiAgICBkZW5zaXR5OiA4MzJcclxuICB9ICk7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgQlJJQ0sgPSBuZXcgTWF0ZXJpYWwoIHtcclxuICAgIG5hbWVQcm9wZXJ0eTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXRlcmlhbC5icmlja1N0cmluZ1Byb3BlcnR5LFxyXG4gICAgdGFuZGVtTmFtZTogJ2JyaWNrJyxcclxuICAgIGlkZW50aWZpZXI6ICdCUklDSycsXHJcbiAgICBkZW5zaXR5OiAyMDAwXHJcbiAgfSApO1xyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IENFTUVOVCA9IG5ldyBNYXRlcmlhbCgge1xyXG4gICAgbmFtZVByb3BlcnR5OiBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzLm1hdGVyaWFsLmNlbWVudFN0cmluZ1Byb3BlcnR5LFxyXG4gICAgdGFuZGVtTmFtZTogJ2NlbWVudCcsXHJcbiAgICBpZGVudGlmaWVyOiAnQ0VNRU5UJyxcclxuICAgIGRlbnNpdHk6IDMxNTAsXHJcbiAgICBsaXF1aWRDb2xvcjogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29sb3JzLm1hdGVyaWFsQ2VtZW50Q29sb3JQcm9wZXJ0eVxyXG4gIH0gKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBDT1BQRVIgPSBuZXcgTWF0ZXJpYWwoIHtcclxuICAgIG5hbWVQcm9wZXJ0eTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXRlcmlhbC5jb3BwZXJTdHJpbmdQcm9wZXJ0eSxcclxuICAgIHRhbmRlbU5hbWU6ICdjb3BwZXInLFxyXG4gICAgaWRlbnRpZmllcjogJ0NPUFBFUicsXHJcbiAgICBkZW5zaXR5OiA4OTYwLFxyXG4gICAgbGlxdWlkQ29sb3I6IERlbnNpdHlCdW95YW5jeUNvbW1vbkNvbG9ycy5tYXRlcmlhbENvcHBlckNvbG9yUHJvcGVydHlcclxuICB9ICk7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgRElBTU9ORCA9IG5ldyBNYXRlcmlhbCgge1xyXG4gICAgbmFtZVByb3BlcnR5OiBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzLm1hdGVyaWFsLmRpYW1vbmRTdHJpbmdQcm9wZXJ0eSxcclxuICAgIHRhbmRlbU5hbWU6ICdkaWFtb25kJyxcclxuICAgIGlkZW50aWZpZXI6ICdESUFNT05EJyxcclxuICAgIGRlbnNpdHk6IDM1MTBcclxuICB9ICk7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgR0xBU1MgPSBuZXcgTWF0ZXJpYWwoIHtcclxuICAgIG5hbWVQcm9wZXJ0eTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXRlcmlhbC5nbGFzc1N0cmluZ1Byb3BlcnR5LFxyXG4gICAgdGFuZGVtTmFtZTogJ2dsYXNzJyxcclxuICAgIGlkZW50aWZpZXI6ICdHTEFTUycsXHJcbiAgICBkZW5zaXR5OiAyNzAwXHJcbiAgfSApO1xyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEdPTEQgPSBuZXcgTWF0ZXJpYWwoIHtcclxuICAgIG5hbWVQcm9wZXJ0eTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXRlcmlhbC5nb2xkU3RyaW5nUHJvcGVydHksXHJcbiAgICB0YW5kZW1OYW1lOiAnZ29sZCcsXHJcbiAgICBpZGVudGlmaWVyOiAnR09MRCcsXHJcbiAgICBkZW5zaXR5OiAxOTMyMFxyXG4gIH0gKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBIVU1BTiA9IG5ldyBNYXRlcmlhbCgge1xyXG4gICAgbmFtZVByb3BlcnR5OiBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzLm1hdGVyaWFsLmh1bWFuU3RyaW5nUHJvcGVydHksXHJcbiAgICB0YW5kZW1OYW1lOiAnaHVtYW4nLFxyXG4gICAgaWRlbnRpZmllcjogJ0hVTUFOJyxcclxuICAgIGRlbnNpdHk6IDk1MFxyXG4gIH0gKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBJQ0UgPSBuZXcgTWF0ZXJpYWwoIHtcclxuICAgIG5hbWVQcm9wZXJ0eTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXRlcmlhbC5pY2VTdHJpbmdQcm9wZXJ0eSxcclxuICAgIHRhbmRlbU5hbWU6ICdpY2UnLFxyXG4gICAgaWRlbnRpZmllcjogJ0lDRScsXHJcbiAgICBkZW5zaXR5OiA5MTlcclxuICB9ICk7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgTEVBRCA9IG5ldyBNYXRlcmlhbCgge1xyXG4gICAgbmFtZVByb3BlcnR5OiBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzLm1hdGVyaWFsLmxlYWRTdHJpbmdQcm9wZXJ0eSxcclxuICAgIHRhbmRlbU5hbWU6ICdsZWFkJyxcclxuICAgIGlkZW50aWZpZXI6ICdMRUFEJyxcclxuICAgIGRlbnNpdHk6IDExMzQyLFxyXG4gICAgbGlxdWlkQ29sb3I6IERlbnNpdHlCdW95YW5jeUNvbW1vbkNvbG9ycy5tYXRlcmlhbExlYWRDb2xvclByb3BlcnR5XHJcbiAgfSApO1xyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFBMQVRJTlVNID0gbmV3IE1hdGVyaWFsKCB7XHJcbiAgICBuYW1lUHJvcGVydHk6IERlbnNpdHlCdW95YW5jeUNvbW1vblN0cmluZ3MubWF0ZXJpYWwucGxhdGludW1TdHJpbmdQcm9wZXJ0eSxcclxuICAgIHRhbmRlbU5hbWU6ICdwbGF0aW51bScsXHJcbiAgICBpZGVudGlmaWVyOiAnUExBVElOVU0nLFxyXG4gICAgZGVuc2l0eTogMjE0NTBcclxuICB9ICk7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgUFlSSVRFID0gbmV3IE1hdGVyaWFsKCB7XHJcbiAgICBuYW1lUHJvcGVydHk6IERlbnNpdHlCdW95YW5jeUNvbW1vblN0cmluZ3MubWF0ZXJpYWwucHlyaXRlU3RyaW5nUHJvcGVydHksXHJcbiAgICB0YW5kZW1OYW1lOiAncHlyaXRlJyxcclxuICAgIGlkZW50aWZpZXI6ICdQWVJJVEUnLFxyXG4gICAgZGVuc2l0eTogNTAxMFxyXG4gIH0gKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBTSUxWRVIgPSBuZXcgTWF0ZXJpYWwoIHtcclxuICAgIG5hbWVQcm9wZXJ0eTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXRlcmlhbC5zaWx2ZXJTdHJpbmdQcm9wZXJ0eSxcclxuICAgIHRhbmRlbU5hbWU6ICdzaWx2ZXInLFxyXG4gICAgaWRlbnRpZmllcjogJ1NJTFZFUicsXHJcbiAgICBkZW5zaXR5OiAxMDQ5MFxyXG4gIH0gKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBTVEVFTCA9IG5ldyBNYXRlcmlhbCgge1xyXG4gICAgbmFtZVByb3BlcnR5OiBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzLm1hdGVyaWFsLnN0ZWVsU3RyaW5nUHJvcGVydHksXHJcbiAgICB0YW5kZW1OYW1lOiAnc3RlZWwnLFxyXG4gICAgaWRlbnRpZmllcjogJ1NURUVMJyxcclxuICAgIGRlbnNpdHk6IDc4MDBcclxuICB9ICk7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgU1RZUk9GT0FNID0gbmV3IE1hdGVyaWFsKCB7XHJcbiAgICBuYW1lUHJvcGVydHk6IERlbnNpdHlCdW95YW5jeUNvbW1vblN0cmluZ3MubWF0ZXJpYWwuc3R5cm9mb2FtU3RyaW5nUHJvcGVydHksXHJcbiAgICB0YW5kZW1OYW1lOiAnc3R5cm9mb2FtJyxcclxuICAgIGlkZW50aWZpZXI6ICdTVFlST0ZPQU0nLFxyXG4gICAgLy8gRnJvbSBGbGFzaCB2ZXJzaW9uOiBiZXR3ZWVuIDI1IGFuZCAyMDAgYWNjb3JkaW5nIHRvIGh0dHA6Ly93aWtpLmFuc3dlcnMuY29tL1EvV2hhdF9pc190aGVfZGVuc2l0eV9vZl9zdHlyb2ZvYW07XHJcbiAgICAvLyBjaG9zZSAxNTAgc28gaXQgaXNuJ3QgdG9vIGxvdyB0byBzaG93IG9uIHNsaWRlciwgYnV0IG5vdCAyMDAgc28gaXQncyBub3QgaGFsZiBvZiB3b29kXHJcbiAgICBkZW5zaXR5OiAxNTBcclxuICB9ICk7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgVEFOVEFMVU0gPSBuZXcgTWF0ZXJpYWwoIHtcclxuICAgIG5hbWVQcm9wZXJ0eTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXRlcmlhbC50YW50YWx1bVN0cmluZ1Byb3BlcnR5LFxyXG4gICAgdGFuZGVtTmFtZTogJ3RhbnRhbHVtJyxcclxuICAgIGlkZW50aWZpZXI6ICdUQU5UQUxVTScsXHJcbiAgICBkZW5zaXR5OiAxNjY1MFxyXG4gIH0gKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBUSVRBTklVTSA9IG5ldyBNYXRlcmlhbCgge1xyXG4gICAgbmFtZVByb3BlcnR5OiBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzLm1hdGVyaWFsLnRpdGFuaXVtU3RyaW5nUHJvcGVydHksXHJcbiAgICB0YW5kZW1OYW1lOiAndGl0YW5pdW0nLFxyXG4gICAgaWRlbnRpZmllcjogJ1RJVEFOSVVNJyxcclxuICAgIGRlbnNpdHk6IDQ1MDBcclxuICB9ICk7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgV09PRCA9IG5ldyBNYXRlcmlhbCgge1xyXG4gICAgbmFtZVByb3BlcnR5OiBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzLm1hdGVyaWFsLndvb2RTdHJpbmdQcm9wZXJ0eSxcclxuICAgIHRhbmRlbU5hbWU6ICd3b29kJyxcclxuICAgIGlkZW50aWZpZXI6ICdXT09EJyxcclxuICAgIGRlbnNpdHk6IDQwMFxyXG4gIH0gKTtcclxuXHJcbiAgLy8gKHJlYWQtb25seSkge01hdGVyaWFsfSAtIFwiTGlxdWlkc1wiLlxyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEFJUiA9IG5ldyBNYXRlcmlhbCgge1xyXG4gICAgbmFtZVByb3BlcnR5OiBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzLm1hdGVyaWFsLmFpclN0cmluZ1Byb3BlcnR5LFxyXG4gICAgdGFuZGVtTmFtZTogJ2FpcicsXHJcbiAgICBpZGVudGlmaWVyOiAnQUlSJyxcclxuICAgIGRlbnNpdHk6IDEuMixcclxuICAgIHZpc2Nvc2l0eTogMCxcclxuICAgIGxpcXVpZENvbG9yOiBEZW5zaXR5QnVveWFuY3lDb21tb25Db2xvcnMubWF0ZXJpYWxBaXJDb2xvclByb3BlcnR5XHJcbiAgfSApO1xyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IERFTlNJVFlfQSA9IG5ldyBNYXRlcmlhbCgge1xyXG4gICAgbmFtZVByb3BlcnR5OiBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzLm1hdGVyaWFsLmRlbnNpdHlBU3RyaW5nUHJvcGVydHksXHJcbiAgICB0YW5kZW1OYW1lOiAnZGVuc2l0eUEnLFxyXG4gICAgaWRlbnRpZmllcjogJ0RFTlNJVFlfQScsXHJcbiAgICBkZW5zaXR5OiAzMTAwLFxyXG4gICAgbGlxdWlkQ29sb3I6IERlbnNpdHlCdW95YW5jeUNvbW1vbkNvbG9ycy5tYXRlcmlhbERlbnNpdHlBQ29sb3JQcm9wZXJ0eSxcclxuICAgIGhpZGRlbjogdHJ1ZVxyXG4gIH0gKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBERU5TSVRZX0IgPSBuZXcgTWF0ZXJpYWwoIHtcclxuICAgIG5hbWVQcm9wZXJ0eTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXRlcmlhbC5kZW5zaXR5QlN0cmluZ1Byb3BlcnR5LFxyXG4gICAgdGFuZGVtTmFtZTogJ2RlbnNpdHlCJyxcclxuICAgIGlkZW50aWZpZXI6ICdERU5TSVRZX0InLFxyXG4gICAgZGVuc2l0eTogNzkwLFxyXG4gICAgbGlxdWlkQ29sb3I6IERlbnNpdHlCdW95YW5jeUNvbW1vbkNvbG9ycy5tYXRlcmlhbERlbnNpdHlCQ29sb3JQcm9wZXJ0eSxcclxuICAgIGhpZGRlbjogdHJ1ZVxyXG4gIH0gKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBERU5TSVRZX0MgPSBuZXcgTWF0ZXJpYWwoIHtcclxuICAgIG5hbWVQcm9wZXJ0eTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXRlcmlhbC5kZW5zaXR5Q1N0cmluZ1Byb3BlcnR5LFxyXG4gICAgdGFuZGVtTmFtZTogJ2RlbnNpdHlDJyxcclxuICAgIGlkZW50aWZpZXI6ICdERU5TSVRZX0MnLFxyXG4gICAgZGVuc2l0eTogNDkwLFxyXG4gICAgbGlxdWlkQ29sb3I6IERlbnNpdHlCdW95YW5jeUNvbW1vbkNvbG9ycy5tYXRlcmlhbERlbnNpdHlDQ29sb3JQcm9wZXJ0eSxcclxuICAgIGhpZGRlbjogdHJ1ZVxyXG4gIH0gKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBERU5TSVRZX0QgPSBuZXcgTWF0ZXJpYWwoIHtcclxuICAgIG5hbWVQcm9wZXJ0eTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXRlcmlhbC5kZW5zaXR5RFN0cmluZ1Byb3BlcnR5LFxyXG4gICAgdGFuZGVtTmFtZTogJ2RlbnNpdHlEJyxcclxuICAgIGlkZW50aWZpZXI6ICdERU5TSVRZX0QnLFxyXG4gICAgZGVuc2l0eTogMjg5MCxcclxuICAgIGxpcXVpZENvbG9yOiBEZW5zaXR5QnVveWFuY3lDb21tb25Db2xvcnMubWF0ZXJpYWxEZW5zaXR5RENvbG9yUHJvcGVydHksXHJcbiAgICBoaWRkZW46IHRydWVcclxuICB9ICk7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgREVOU0lUWV9FID0gbmV3IE1hdGVyaWFsKCB7XHJcbiAgICBuYW1lUHJvcGVydHk6IERlbnNpdHlCdW95YW5jeUNvbW1vblN0cmluZ3MubWF0ZXJpYWwuZGVuc2l0eUVTdHJpbmdQcm9wZXJ0eSxcclxuICAgIHRhbmRlbU5hbWU6ICdkZW5zaXR5RScsXHJcbiAgICBpZGVudGlmaWVyOiAnREVOU0lUWV9FJyxcclxuICAgIGRlbnNpdHk6IDEyNjAsXHJcbiAgICBsaXF1aWRDb2xvcjogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29sb3JzLm1hdGVyaWFsRGVuc2l0eUVDb2xvclByb3BlcnR5LFxyXG4gICAgaGlkZGVuOiB0cnVlXHJcbiAgfSApO1xyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IERFTlNJVFlfRiA9IG5ldyBNYXRlcmlhbCgge1xyXG4gICAgbmFtZVByb3BlcnR5OiBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzLm1hdGVyaWFsLmRlbnNpdHlGU3RyaW5nUHJvcGVydHksXHJcbiAgICB0YW5kZW1OYW1lOiAnZGVuc2l0eUYnLFxyXG4gICAgaWRlbnRpZmllcjogJ0RFTlNJVFlfRicsXHJcbiAgICBkZW5zaXR5OiA2NDQwLFxyXG4gICAgbGlxdWlkQ29sb3I6IERlbnNpdHlCdW95YW5jeUNvbW1vbkNvbG9ycy5tYXRlcmlhbERlbnNpdHlGQ29sb3JQcm9wZXJ0eSxcclxuICAgIGhpZGRlbjogdHJ1ZVxyXG4gIH0gKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBHQVNPTElORSA9IG5ldyBNYXRlcmlhbCgge1xyXG4gICAgbmFtZVByb3BlcnR5OiBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzLm1hdGVyaWFsLmdhc29saW5lU3RyaW5nUHJvcGVydHksXHJcbiAgICB0YW5kZW1OYW1lOiAnZ2Fzb2xpbmUnLFxyXG4gICAgaWRlbnRpZmllcjogJ0dBU09MSU5FJyxcclxuICAgIGRlbnNpdHk6IDY4MCxcclxuICAgIHZpc2Nvc2l0eTogNmUtNCxcclxuICAgIGxpcXVpZENvbG9yOiBEZW5zaXR5QnVveWFuY3lDb21tb25Db2xvcnMubWF0ZXJpYWxHYXNvbGluZUNvbG9yUHJvcGVydHlcclxuICB9ICk7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSE9ORVkgPSBuZXcgTWF0ZXJpYWwoIHtcclxuICAgIG5hbWVQcm9wZXJ0eTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXRlcmlhbC5ob25leVN0cmluZ1Byb3BlcnR5LFxyXG4gICAgdGFuZGVtTmFtZTogJ2hvbmV5JyxcclxuICAgIGlkZW50aWZpZXI6ICdIT05FWScsXHJcbiAgICBkZW5zaXR5OiAxNDQwLFxyXG4gICAgdmlzY29zaXR5OiAwLjAzLCAvLyBOT1RFOiBhY3R1YWwgdmFsdWUgYXJvdW5kIDIuNSwgYnV0IHdlIGNhbiBnZXQgYXdheSB3aXRoIHRoaXMgZm9yIGFuaW1hdGlvblxyXG4gICAgbGlxdWlkQ29sb3I6IERlbnNpdHlCdW95YW5jeUNvbW1vbkNvbG9ycy5tYXRlcmlhbEhvbmV5Q29sb3JQcm9wZXJ0eVxyXG4gIH0gKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBNRVJDVVJZID0gbmV3IE1hdGVyaWFsKCB7XHJcbiAgICBuYW1lUHJvcGVydHk6IERlbnNpdHlCdW95YW5jeUNvbW1vblN0cmluZ3MubWF0ZXJpYWwubWVyY3VyeVN0cmluZ1Byb3BlcnR5LFxyXG4gICAgdGFuZGVtTmFtZTogJ21lcmN1cnknLFxyXG4gICAgaWRlbnRpZmllcjogJ01FUkNVUlknLFxyXG4gICAgZGVuc2l0eTogMTM1OTMsXHJcbiAgICB2aXNjb3NpdHk6IDEuNTNlLTMsXHJcbiAgICBsaXF1aWRDb2xvcjogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29sb3JzLm1hdGVyaWFsTWVyY3VyeUNvbG9yUHJvcGVydHlcclxuICB9ICk7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgT0lMID0gbmV3IE1hdGVyaWFsKCB7XHJcbiAgICBuYW1lUHJvcGVydHk6IERlbnNpdHlCdW95YW5jeUNvbW1vblN0cmluZ3MubWF0ZXJpYWwub2lsU3RyaW5nUHJvcGVydHksXHJcbiAgICB0YW5kZW1OYW1lOiAnb2lsJyxcclxuICAgIGlkZW50aWZpZXI6ICdPSUwnLFxyXG4gICAgZGVuc2l0eTogOTIwLFxyXG4gICAgdmlzY29zaXR5OiAwLjAyLCAvLyBUb28gbXVjaCBiaWdnZXIgYW5kIGl0IHdvbid0IHdvcmssIG5vdCBwYXJ0aWN1bGFybHkgcGh5c2ljYWxcclxuICAgIGxpcXVpZENvbG9yOiBEZW5zaXR5QnVveWFuY3lDb21tb25Db2xvcnMubWF0ZXJpYWxPaWxDb2xvclByb3BlcnR5XHJcbiAgfSApO1xyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFNBTkQgPSBuZXcgTWF0ZXJpYWwoIHtcclxuICAgIG5hbWVQcm9wZXJ0eTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXRlcmlhbC5zYW5kU3RyaW5nUHJvcGVydHksXHJcbiAgICB0YW5kZW1OYW1lOiAnc2FuZCcsXHJcbiAgICBpZGVudGlmaWVyOiAnU0FORCcsXHJcbiAgICBkZW5zaXR5OiAxNDQyLFxyXG4gICAgdmlzY29zaXR5OiAwLjAzLCAvLyBUb28gbXVjaCBiaWdnZXIgYW5kIGl0IHdvbid0IHdvcmssIG5vdCBwYXJ0aWN1bGFybHkgcGh5c2ljYWxcclxuICAgIGxpcXVpZENvbG9yOiBEZW5zaXR5QnVveWFuY3lDb21tb25Db2xvcnMubWF0ZXJpYWxTYW5kQ29sb3JQcm9wZXJ0eVxyXG4gIH0gKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBTRUFXQVRFUiA9IG5ldyBNYXRlcmlhbCgge1xyXG4gICAgbmFtZVByb3BlcnR5OiBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzLm1hdGVyaWFsLnNlYXdhdGVyU3RyaW5nUHJvcGVydHksXHJcbiAgICB0YW5kZW1OYW1lOiAnc2Vhd2F0ZXInLFxyXG4gICAgaWRlbnRpZmllcjogJ1NFQVdBVEVSJyxcclxuICAgIGRlbnNpdHk6IDEwMjksXHJcbiAgICB2aXNjb3NpdHk6IDEuODhlLTMsXHJcbiAgICBsaXF1aWRDb2xvcjogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29sb3JzLm1hdGVyaWFsU2Vhd2F0ZXJDb2xvclByb3BlcnR5XHJcbiAgfSApO1xyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFdBVEVSID0gbmV3IE1hdGVyaWFsKCB7XHJcbiAgICBuYW1lUHJvcGVydHk6IERlbnNpdHlCdW95YW5jeUNvbW1vblN0cmluZ3MubWF0ZXJpYWwud2F0ZXJTdHJpbmdQcm9wZXJ0eSxcclxuICAgIHRhbmRlbU5hbWU6ICd3YXRlcicsXHJcbiAgICBpZGVudGlmaWVyOiAnV0FURVInLFxyXG4gICAgZGVuc2l0eTogMTAwMCxcclxuICAgIHZpc2Nvc2l0eTogOC45ZS00LFxyXG4gICAgbGlxdWlkQ29sb3I6IERlbnNpdHlCdW95YW5jeUNvbW1vbkNvbG9ycy5tYXRlcmlhbFdhdGVyQ29sb3JQcm9wZXJ0eVxyXG4gIH0gKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBNQVRFUklBTFMgPSBbXHJcbiAgICBNYXRlcmlhbC5BSVIsXHJcbiAgICBNYXRlcmlhbC5BTFVNSU5VTSxcclxuICAgIE1hdGVyaWFsLkFQUExFLFxyXG4gICAgTWF0ZXJpYWwuQlJJQ0ssXHJcbiAgICBNYXRlcmlhbC5DRU1FTlQsXHJcbiAgICBNYXRlcmlhbC5DT1BQRVIsXHJcbiAgICBNYXRlcmlhbC5ERU5TSVRZX0UsXHJcbiAgICBNYXRlcmlhbC5ERU5TSVRZX0YsXHJcbiAgICBNYXRlcmlhbC5ERU5TSVRZX0EsXHJcbiAgICBNYXRlcmlhbC5ERU5TSVRZX0IsXHJcbiAgICBNYXRlcmlhbC5ESUFNT05ELFxyXG4gICAgTWF0ZXJpYWwuR0FTT0xJTkUsXHJcbiAgICBNYXRlcmlhbC5HTEFTUyxcclxuICAgIE1hdGVyaWFsLkdPTEQsXHJcbiAgICBNYXRlcmlhbC5IT05FWSxcclxuICAgIE1hdGVyaWFsLkhVTUFOLFxyXG4gICAgTWF0ZXJpYWwuSUNFLFxyXG4gICAgTWF0ZXJpYWwuTEVBRCxcclxuICAgIE1hdGVyaWFsLk1FUkNVUlksXHJcbiAgICBNYXRlcmlhbC5PSUwsXHJcbiAgICBNYXRlcmlhbC5QTEFUSU5VTSxcclxuICAgIE1hdGVyaWFsLlBZUklURSxcclxuICAgIE1hdGVyaWFsLlNBTkQsXHJcbiAgICBNYXRlcmlhbC5TRUFXQVRFUixcclxuICAgIE1hdGVyaWFsLlNJTFZFUixcclxuICAgIE1hdGVyaWFsLlNURUVMLFxyXG4gICAgTWF0ZXJpYWwuU1RZUk9GT0FNLFxyXG4gICAgTWF0ZXJpYWwuVEFOVEFMVU0sXHJcbiAgICBNYXRlcmlhbC5USVRBTklVTSxcclxuICAgIE1hdGVyaWFsLldBVEVSLFxyXG4gICAgTWF0ZXJpYWwuV09PRFxyXG4gIF07XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBNYXRlcmlhbElPID0gbmV3IElPVHlwZTxNYXRlcmlhbCwgTWF0ZXJpYWxTdGF0ZT4oICdNYXRlcmlhbElPJywge1xyXG4gICAgdmFsdWVUeXBlOiBNYXRlcmlhbCxcclxuICAgIGRvY3VtZW50YXRpb246ICdSZXByZXNlbnRzIGRpZmZlcmVudCBtYXRlcmlhbHMgdGhhdCBzb2xpZHMvbGlxdWlkcyBpbiB0aGUgc2ltdWxhdGlvbnMgY2FuIHRha2UsIGluY2x1ZGluZyBkZW5zaXR5IChrZy9tXjMpLCB2aXNjb3NpdHkgKFBhICogcyksIGFuZCBjb2xvci4nLFxyXG4gICAgc3RhdGVTY2hlbWE6IHtcclxuICAgICAgbmFtZTogUmVmZXJlbmNlSU8oIFJlYWRPbmx5UHJvcGVydHkuUHJvcGVydHlJTyggU3RyaW5nSU8gKSApLFxyXG4gICAgICBpZGVudGlmaWVyOiBOdWxsYWJsZUlPKCBTdHJpbmdJTyApLFxyXG4gICAgICB0YW5kZW1OYW1lOiBOdWxsYWJsZUlPKCBTdHJpbmdJTyApLFxyXG4gICAgICBkZW5zaXR5OiBOdW1iZXJJTyxcclxuICAgICAgdmlzY29zaXR5OiBOdW1iZXJJTyxcclxuICAgICAgY3VzdG9tOiBCb29sZWFuSU8sXHJcbiAgICAgIGhpZGRlbjogQm9vbGVhbklPLFxyXG4gICAgICBzdGF0aWNDdXN0b21Db2xvcjogTnVsbGFibGVJTyggQ29sb3IuQ29sb3JJTyApLFxyXG4gICAgICBjdXN0b21Db2xvcjogTnVsbGFibGVDb2xvclByb3BlcnR5UmVmZXJlbmNlVHlwZSxcclxuICAgICAgc3RhdGljTGlxdWlkQ29sb3I6IE51bGxhYmxlSU8oIENvbG9yLkNvbG9ySU8gKSxcclxuICAgICAgbGlxdWlkQ29sb3I6IE51bGxhYmxlQ29sb3JQcm9wZXJ0eVJlZmVyZW5jZVR5cGVcclxuICAgIH0sXHJcbiAgICB0b1N0YXRlT2JqZWN0KCBtYXRlcmlhbDogTWF0ZXJpYWwgKTogTWF0ZXJpYWxTdGF0ZSB7XHJcblxyXG4gICAgICBjb25zdCBpc0N1c3RvbUNvbG9yVW5pbnN0cnVtZW50ZWQgPSBtYXRlcmlhbC5jdXN0b21Db2xvciAmJiAhbWF0ZXJpYWwuY3VzdG9tQ29sb3IuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKTtcclxuICAgICAgY29uc3QgaXNMaXF1aWRDb2xvclVuaW5zdHJ1bWVudGVkID0gbWF0ZXJpYWwubGlxdWlkQ29sb3IgJiYgIW1hdGVyaWFsLmxpcXVpZENvbG9yLmlzUGhldGlvSW5zdHJ1bWVudGVkKCk7XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIG5hbWU6IFJlZmVyZW5jZUlPKCBSZWFkT25seVByb3BlcnR5LlByb3BlcnR5SU8oIFN0cmluZ0lPICkgKS50b1N0YXRlT2JqZWN0KCBtYXRlcmlhbC5uYW1lUHJvcGVydHkgKSxcclxuICAgICAgICBpZGVudGlmaWVyOiBOdWxsYWJsZUlPKCBTdHJpbmdJTyApLnRvU3RhdGVPYmplY3QoIG1hdGVyaWFsLmlkZW50aWZpZXIgKSxcclxuICAgICAgICB0YW5kZW1OYW1lOiBOdWxsYWJsZUlPKCBTdHJpbmdJTyApLnRvU3RhdGVPYmplY3QoIG1hdGVyaWFsLnRhbmRlbU5hbWUgKSxcclxuICAgICAgICBkZW5zaXR5OiBtYXRlcmlhbC5kZW5zaXR5LFxyXG4gICAgICAgIHZpc2Nvc2l0eTogbWF0ZXJpYWwudmlzY29zaXR5LFxyXG4gICAgICAgIGN1c3RvbTogbWF0ZXJpYWwuY3VzdG9tLFxyXG4gICAgICAgIGhpZGRlbjogbWF0ZXJpYWwuaGlkZGVuLFxyXG4gICAgICAgIHN0YXRpY0N1c3RvbUNvbG9yOiBOdWxsYWJsZUlPKCBDb2xvci5Db2xvcklPICkudG9TdGF0ZU9iamVjdCggaXNDdXN0b21Db2xvclVuaW5zdHJ1bWVudGVkID8gbWF0ZXJpYWwuY3VzdG9tQ29sb3IudmFsdWUgOiBudWxsICksXHJcbiAgICAgICAgY3VzdG9tQ29sb3I6IE51bGxhYmxlQ29sb3JQcm9wZXJ0eVJlZmVyZW5jZVR5cGUudG9TdGF0ZU9iamVjdCggaXNDdXN0b21Db2xvclVuaW5zdHJ1bWVudGVkID8gbnVsbCA6IG1hdGVyaWFsLmN1c3RvbUNvbG9yICksXHJcbiAgICAgICAgc3RhdGljTGlxdWlkQ29sb3I6IE51bGxhYmxlSU8oIENvbG9yLkNvbG9ySU8gKS50b1N0YXRlT2JqZWN0KCBpc0xpcXVpZENvbG9yVW5pbnN0cnVtZW50ZWQgPyBtYXRlcmlhbC5saXF1aWRDb2xvci52YWx1ZSA6IG51bGwgKSxcclxuICAgICAgICBsaXF1aWRDb2xvcjogTnVsbGFibGVDb2xvclByb3BlcnR5UmVmZXJlbmNlVHlwZS50b1N0YXRlT2JqZWN0KCBpc0xpcXVpZENvbG9yVW5pbnN0cnVtZW50ZWQgPyBudWxsIDogbWF0ZXJpYWwubGlxdWlkQ29sb3IgKVxyXG4gICAgICB9O1xyXG4gICAgfSxcclxuICAgIGZyb21TdGF0ZU9iamVjdCggb2JqOiBNYXRlcmlhbFN0YXRlICk6IE1hdGVyaWFsIHtcclxuICAgICAgaWYgKCBvYmouaWRlbnRpZmllciApIHtcclxuICAgICAgICBjb25zdCBtYXRlcmlhbCA9IE1hdGVyaWFsWyBvYmouaWRlbnRpZmllciBdO1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG1hdGVyaWFsLCBgVW5rbm93biBtYXRlcmlhbDogJHtvYmouaWRlbnRpZmllcn1gICk7XHJcbiAgICAgICAgcmV0dXJuIG1hdGVyaWFsIGFzIE1hdGVyaWFsO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IHN0YXRpY0N1c3RvbUNvbG9yID0gTnVsbGFibGVJTyggQ29sb3IuQ29sb3JJTyApLmZyb21TdGF0ZU9iamVjdCggb2JqLnN0YXRpY0N1c3RvbUNvbG9yICk7XHJcbiAgICAgICAgY29uc3Qgc3RhdGljTGlxdWlkQ29sb3IgPSBOdWxsYWJsZUlPKCBDb2xvci5Db2xvcklPICkuZnJvbVN0YXRlT2JqZWN0KCBvYmouc3RhdGljTGlxdWlkQ29sb3IgKTtcclxuICAgICAgICByZXR1cm4gbmV3IE1hdGVyaWFsKCB7XHJcbiAgICAgICAgICBuYW1lUHJvcGVydHk6IFJlZmVyZW5jZUlPKCBSZWFkT25seVByb3BlcnR5LlByb3BlcnR5SU8oIFN0cmluZ0lPICkgKS5mcm9tU3RhdGVPYmplY3QoIG9iai5uYW1lICksXHJcbiAgICAgICAgICBpZGVudGlmaWVyOiBOdWxsYWJsZUlPKCBTdHJpbmdJTyApLmZyb21TdGF0ZU9iamVjdCggb2JqLmlkZW50aWZpZXIgKSxcclxuICAgICAgICAgIHRhbmRlbU5hbWU6IE51bGxhYmxlSU8oIFN0cmluZ0lPICkuZnJvbVN0YXRlT2JqZWN0KCBvYmoudGFuZGVtTmFtZSApLFxyXG4gICAgICAgICAgZGVuc2l0eTogb2JqLmRlbnNpdHksXHJcbiAgICAgICAgICB2aXNjb3NpdHk6IG9iai52aXNjb3NpdHksXHJcbiAgICAgICAgICBjdXN0b206IG9iai5jdXN0b20sXHJcbiAgICAgICAgICBoaWRkZW46IG9iai5oaWRkZW4sXHJcbiAgICAgICAgICBjdXN0b21Db2xvcjogc3RhdGljQ3VzdG9tQ29sb3IgPyBuZXcgQ29sb3JQcm9wZXJ0eSggc3RhdGljQ3VzdG9tQ29sb3IgKSA6IE51bGxhYmxlQ29sb3JQcm9wZXJ0eVJlZmVyZW5jZVR5cGUuZnJvbVN0YXRlT2JqZWN0KCBvYmouY3VzdG9tQ29sb3IgKSxcclxuICAgICAgICAgIGxpcXVpZENvbG9yOiBzdGF0aWNMaXF1aWRDb2xvciA/IG5ldyBDb2xvclByb3BlcnR5KCBzdGF0aWNMaXF1aWRDb2xvciApIDogTnVsbGFibGVDb2xvclByb3BlcnR5UmVmZXJlbmNlVHlwZS5mcm9tU3RhdGVPYmplY3QoIG9iai5saXF1aWRDb2xvciApXHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSApO1xyXG59XHJcblxyXG5kZW5zaXR5QnVveWFuY3lDb21tb24ucmVnaXN0ZXIoICdNYXRlcmlhbCcsIE1hdGVyaWFsICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBRXBFLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxVQUFVLE1BQU0scUNBQXFDO0FBQzVELE9BQU9DLFNBQVMsSUFBSUMsY0FBYyxRQUFRLHVDQUF1QztBQUNqRixTQUFTQyxLQUFLLEVBQUVDLGFBQWEsUUFBb0IsbUNBQW1DO0FBQ3BGLE9BQU9DLFNBQVMsTUFBTSwwQ0FBMEM7QUFDaEUsT0FBT0MsTUFBTSxNQUFNLHVDQUF1QztBQUMxRCxPQUFPQyxVQUFVLE1BQU0sMkNBQTJDO0FBQ2xFLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsT0FBT0MsV0FBVyxNQUE0Qiw0Q0FBNEM7QUFDMUYsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxPQUFPQyxxQkFBcUIsTUFBTSxnQ0FBZ0M7QUFDbEUsT0FBT0MsNEJBQTRCLE1BQU0sdUNBQXVDO0FBQ2hGLE9BQU9DLDJCQUEyQixNQUFNLHdDQUF3QztBQUVoRixPQUFPQyxZQUFZLE1BQU0scUNBQXFDO0FBQzlELE9BQU9DLGdCQUFnQixNQUFNLHlDQUF5QztBQUd0RSxNQUFNQyxrQ0FBa0MsR0FBR1QsVUFBVSxDQUFFRSxXQUFXLENBQUVYLFFBQVEsQ0FBQ21CLFVBQVUsQ0FBRWQsS0FBSyxDQUFDZSxPQUFRLENBQUUsQ0FBRSxDQUFDO0FBNkM1RyxlQUFlLE1BQU1DLFFBQVEsQ0FBQztFQVlyQkMsV0FBV0EsQ0FBRUMsY0FBK0IsRUFBRztJQUVwRCxNQUFNQyxN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