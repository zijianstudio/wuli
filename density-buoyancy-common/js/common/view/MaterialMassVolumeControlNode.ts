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
import ReadOnlyProperty from '../../../../axon/js/ReadOnlyProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import NumberControl, { NumberControlOptions } from '../../../../scenery-phet/js/NumberControl.js';
import { HBox, Node, Text, TPaint, VBox, VBoxOptions } from '../../../../scenery/js/imports.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import Material, { MaterialName } from '../model/Material.js';
import PrecisionSliderThumb from './PrecisionSliderThumb.js';

// constants
const LITERS_IN_CUBIC_METER = 1000;
const TRACK_HEIGHT = 3;

// A workaround for changing a DerivedProperty range Property to a NumberProperty, where the new range AND value will
// not overlap with the previous one.
class WorkaroundRange extends Range {
  public override contains( value: number ): boolean { return true; }
}

type SelfOptions = {
  labelNode?: Node | null;

  minMass?: number;
  minCustomMass?: number;
  maxCustomMass?: number;
  maxMass?: number;
  minVolumeLiters?: number;
  maxVolumeLiters?: number;
  minCustomVolumeLiters?: number;

  color?: TPaint;

  // Require the tandem
  tandem: Tandem;
};

export type MaterialMassVolumeControlNodeOptions = SelfOptions & VBoxOptions;

export default class MaterialMassVolumeControlNode extends VBox {

  public constructor( materialProperty: Property<Material>, massProperty: ReadOnlyProperty<number>, volumeProperty: Property<number>, materials: Material[], setVolume: ( volume: number ) => void, listParent: Node, providedOptions?: MaterialMassVolumeControlNodeOptions ) {

    const options = optionize<MaterialMassVolumeControlNodeOptions, SelfOptions, VBoxOptions>()( {
      labelNode: null,

      minMass: 0.1,
      minCustomMass: 0.5,
      maxCustomMass: 10,
      maxMass: 27,
      minVolumeLiters: 1,
      maxVolumeLiters: 10,
      minCustomVolumeLiters: 1,

      color: null
    }, providedOptions );

    const tandem = options.tandem;

    const massNumberControlTandem = tandem.createTandem( 'massNumberControl' );
    const volumeNumberControlTandem = tandem.createTandem( 'volumeNumberControl' );

    super( {
      spacing: 15,
      align: 'left'
    } );

    const materialNames: MaterialName[] = [ ...materials.map( material => material.identifier! ), 'CUSTOM' ];

    const comboBoxMaterialProperty = new DynamicProperty( new Property( materialProperty ), {
      bidirectional: true,
      map: ( material: Material ) => {
        return material.custom ? 'CUSTOM' : material.identifier!;
      },
      inverseMap: ( materialName: MaterialName ): Material => {
        if ( materialName === 'CUSTOM' ) {
          // Handle our minimum volume if we're switched to custom (if needed)
          const volume = Math.max( volumeProperty.value, options.minCustomVolumeLiters / LITERS_IN_CUBIC_METER );
          return Material.createCustomSolidMaterial( {
            density: Utils.clamp( materialProperty.value.density, options.minCustomMass / volume, options.maxCustomMass / volume )
          } );
        }
        else {
          return Material[ materialName ] as Material;
        }
      },
      reentrant: true,
      phetioState: false,
      tandem: options.tandem.createTandem( 'comboBoxMaterialProperty' ),
      phetioDocumentation: 'Current material of the block. Changing the material will result in changes to the mass, but the volume will remain the same.',
      validValues: materialNames,
      phetioValueType: StringIO
    } );

    // We need to use "locks" since our behavior is different based on whether the model or user is changing the value
    let modelMassChanging = false;
    let userMassChanging = false;
    let modelVolumeChanging = false;
    let userVolumeChanging = false;

    // DerivedProperty doesn't need disposal, since everything here lives for the lifetime of the simulation
    const enabledMassRangeProperty = new DerivedProperty( [ materialProperty ], material => {
      if ( material.custom ) {
        return new Range( options.minCustomMass, options.maxCustomMass );
      }
      else {
        const density = material.density;

        const minMass = Utils.clamp( density * options.minVolumeLiters / LITERS_IN_CUBIC_METER, options.minMass, options.maxMass );
        const maxMass = Utils.clamp( density * options.maxVolumeLiters / LITERS_IN_CUBIC_METER, options.minMass, options.maxMass );

        return new WorkaroundRange( minMass, maxMass );
      }
    }, {
      reentrant: true,
      phetioState: false,
      phetioValueType: Range.RangeIO,
      tandem: massNumberControlTandem.createTandem( 'enabledMassRangeProperty' )
    } );

    const enabledVolumeRangeProperty = new DerivedProperty( [ materialProperty ], material => {
      return new WorkaroundRange(
        material.custom ? Math.max( options.minVolumeLiters, options.minCustomVolumeLiters ) : options.minVolumeLiters,
        options.maxVolumeLiters
      );
    } );

    // passed to the NumberControl
    const massNumberProperty = new NumberProperty( massProperty.value, {
      tandem: massNumberControlTandem.createTandem( 'numberControlMassProperty' ),
      phetioState: false,
      phetioReadOnly: true,
      units: 'kg'
    } );

    // passed to the NumberControl - liters from m^3
    const numberControlVolumeProperty = new NumberProperty( volumeProperty.value * LITERS_IN_CUBIC_METER, {
      range: new Range( options.minVolumeLiters, options.maxVolumeLiters ),
      tandem: volumeNumberControlTandem.createTandem( 'numberControlVolumeProperty' ),
      phetioState: false,
      phetioReadOnly: true,
      units: 'L'
    } );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    numberControlVolumeProperty.lazyLink( liters => {
      if ( !modelVolumeChanging && !userMassChanging ) {
        const cubicMeters = liters / LITERS_IN_CUBIC_METER;

        userVolumeChanging = true;

        // If we're custom, adjust the density
        if ( materialProperty.value.custom ) {
          materialProperty.value = Material.createCustomSolidMaterial( {
            density: massProperty.value / cubicMeters
          } );
        }
        setVolume( cubicMeters );

        userVolumeChanging = false;
      }
    } );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    volumeProperty.lazyLink( cubicMeters => {
      if ( !userVolumeChanging ) {
        modelVolumeChanging = true;

        // If the value is close to min/max, massage it to the exact value, see https://github.com/phetsims/density/issues/46
        let volumeLiters = cubicMeters * LITERS_IN_CUBIC_METER;
        if ( volumeLiters > options.minVolumeLiters && volumeLiters < options.minVolumeLiters + 1e-10 ) {
          volumeLiters = options.minVolumeLiters;
        }
        if ( volumeLiters < options.maxVolumeLiters && volumeLiters > options.maxVolumeLiters - 1e-10 ) {
          volumeLiters = options.maxVolumeLiters;
        }

        numberControlVolumeProperty.value = Utils.clamp( volumeLiters, options.minVolumeLiters, options.maxVolumeLiters );

        modelVolumeChanging = false;
      }
    } );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    massNumberProperty.lazyLink( mass => {
      if ( !modelMassChanging && !userVolumeChanging ) {
        userMassChanging = true;

        if ( materialProperty.value.custom ) {
          materialProperty.value = Material.createCustomSolidMaterial( {
            density: mass / volumeProperty.value
          } );
        }
        else {
          setVolume( mass / materialProperty.value.density );
        }

        userMassChanging = false;
      }
    } );

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    massProperty.lazyLink( mass => {
      if ( !userMassChanging ) {
        modelMassChanging = true;

        enabledMassRangeProperty.recomputeDerivation();

        // If the value is close to min/max, massage it to the exact value, see https://github.com/phetsims/density/issues/46
        let adjustedMass = mass;
        const min = enabledMassRangeProperty.value.min;
        const max = enabledMassRangeProperty.value.max;
        if ( adjustedMass > min && adjustedMass < min + 1e-10 ) {
          adjustedMass = min;
        }
        if ( adjustedMass < max && adjustedMass > max - 1e-10 ) {
          adjustedMass = max;
        }

        massNumberProperty.value = Utils.clamp( adjustedMass, min, max );

        modelMassChanging = false;
      }
    } );

    const comboMaxWidth = options.labelNode ? 110 : 160;
    const comboBox = new ComboBox( comboBoxMaterialProperty, [
      ...materials.map( material => {
        return {
          value: material.identifier!,
          createNode: () => new Text( material.nameProperty, {
            font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
            maxWidth: comboMaxWidth
          } ),
          tandemName: `${material.tandemName}${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
        };
      } ),
      {
        value: 'CUSTOM',
        createNode: () => new Text( DensityBuoyancyCommonStrings.material.customStringProperty, {
          font: DensityBuoyancyCommonConstants.COMBO_BOX_ITEM_FONT,
          maxWidth: comboMaxWidth
        } ),
        tandemName: `custom${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
      }
    ], listParent, {
      xMargin: 8,
      yMargin: 4,
      tandem: tandem.createTandem( 'comboBox' )
    } );

    const massNumberControl = new NumberControl( DensityBuoyancyCommonStrings.massStringProperty, massNumberProperty, new Range( options.minMass, options.maxMass ), combineOptions<NumberControlOptions>( {
      sliderOptions: {
        thumbNode: new PrecisionSliderThumb( {
          thumbFill: options.color,
          tandem: massNumberControlTandem.createTandem( 'slider' ).createTandem( 'thumbNode' )
        } ),
        thumbYOffset: new PrecisionSliderThumb().height / 2 - TRACK_HEIGHT / 2,
        constrainValue: ( value: number ) => {
          const range = enabledMassRangeProperty.value;

          // Don't snap before ranges, since this doesn't work for Styrofoam case, see
          // https://github.com/phetsims/density/issues/46
          if ( value <= range.min ) {
            return range.min;
          }
          if ( value >= range.max ) {
            return range.max;
          }
          return enabledMassRangeProperty.value.constrainValue( Utils.toFixedNumber( value, 1 ) );
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
    }, MaterialMassVolumeControlNode.getNumberControlOptions() ) );

    const volumeNumberControl = new NumberControl( DensityBuoyancyCommonStrings.volumeStringProperty, numberControlVolumeProperty, new Range( options.minVolumeLiters, options.maxVolumeLiters ), combineOptions<NumberControlOptions>( {
      sliderOptions: {
        thumbNode: new PrecisionSliderThumb( {
          thumbFill: options.color,
          tandem: volumeNumberControlTandem.createTandem( 'slider' ).createTandem( 'thumbNode' )
        } ),
        thumbYOffset: new PrecisionSliderThumb().height / 2 - TRACK_HEIGHT / 2,
        constrainValue: ( value: number ) => Utils.roundSymmetric( value * 2 ) / 2,
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
    }, MaterialMassVolumeControlNode.getNumberControlOptions() ) );

    this.children = [
      new HBox( {
        spacing: 5,
        children: [
          comboBox,
          ...( [ options.labelNode ].filter( _.identity ) as Node[] )
        ]
      } ),
      massNumberControl,
      volumeNumberControl
    ];

    this.mutate( options );
  }

  /**
   * Returns the default NumberControl options used by this component.
   */
  public static getNumberControlOptions(): NumberControlOptions {
    return {
      delta: 0.01,
      sliderOptions: {
        trackSize: new Dimension2( 120, TRACK_HEIGHT )
      },
      numberDisplayOptions: {
        decimalPlaces: 2,
        textOptions: {
          maxWidth: 60
        },
        useFullHeight: true
      },
      layoutFunction: NumberControl.createLayoutFunction4( {
        sliderPadding: 5
      } ),
      titleNodeOptions: {
        font: DensityBuoyancyCommonConstants.ITEM_FONT,
        maxWidth: 90
      }
    };
  }
}

densityBuoyancyCommon.register( 'MaterialMassVolumeControlNode', MaterialMassVolumeControlNode );
