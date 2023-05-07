// Copyright 2019-2022, University of Colorado Boulder

/**
 * Handles controlling a quantity with a NumberControl, but combined with a ComboBox for specific non-custom values.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import NumberControl, { NumberControlOptions } from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text, VBox, VBoxOptions } from '../../../../scenery/js/imports.js';
import ComboBox, { ComboBoxItem, ComboBoxOptions } from '../../../../sun/js/ComboBox.js';
import SunConstants from '../../../../sun/js/SunConstants.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';

type SelfOptions<T> = {
  titleProperty: TReadOnlyProperty<string>;
  valuePatternProperty: TReadOnlyProperty<string>; // with {{value}} placeholder
  property: Property<T>;
  range: Range;

  // Converts the Property values into numeric values
  toNumericValue: ( t: T ) => number;

  // Given a numeric value, creates the corresponding rich object
  createCustomValue: ( n: number ) => T;

  // Given a main value, returns whether it is a custom value or not
  isCustomValue: ( t: T ) => boolean;

  // Given a main value, returns whether it is a hidden value or not
  isHiddenValue: ( t: T ) => boolean;

  listParent: Node;

  comboItems: ComboBoxItem<T>[];

  // The token value in items that is the designated custom value
  customValue: T;

  getFallbackNode?: ( t: T ) => Node | null;

  numberControlOptions?: NumberControlOptions;
  comboBoxOptions?: ComboBoxOptions;

  tandem: Tandem;
};

export type ComboNumberControlOptions<T> = SelfOptions<T> & VBoxOptions;

export default class ComboNumberControl<T> extends VBox {

  private readonly property: Property<T>;
  private readonly numberProperty: Property<number>;
  private readonly comboProperty: Property<T>;
  private readonly disposalCallbacks: ( () => void )[];
  private readonly numberControl: NumberControl;
  private readonly comboBox: ComboBox<T>;

  public constructor( providedConfig: SelfOptions<T> ) {

    const disposalCallbacks: ( () => void )[] = [];
    const numberDisplayVisibleProperty = new BooleanProperty( true );

    const config = optionize<ComboNumberControlOptions<T>, SelfOptions<T>, VBoxOptions>()( {
      getFallbackNode: () => null,

      // {Object} Options for the number control
      numberControlOptions: {
        layoutFunction: NumberControl.createLayoutFunction4( {
          createBottomContent: bottomBox => {

            const fallbackContainer = new Node();

            // Supports Pendulum Lab's questionText where a question is substituted for the slider
            const bottomContent = new Node( {
              children: [
                bottomBox,
                fallbackContainer
              ]
            } );

            const listener = ( value: T ) => {
              const fallbackNode = getFallbackNode( value );
              const hasFallback = fallbackNode !== null;

              bottomBox.visible = !hasFallback;
              numberDisplayVisibleProperty.value = !hasFallback;
              fallbackContainer.removeAllChildren();

              if ( fallbackNode !== null ) {
                fallbackContainer.addChild( fallbackNode );
                fallbackNode.maxWidth = bottomBox.width;
                fallbackNode.center = bottomBox.center;
              }
            };

            // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
            this.property.link( listener );
            disposalCallbacks.push( () => this.property.unlink( listener ) );

            return bottomContent;
          },
          sliderPadding: 5
        } ),
        titleNodeOptions: {
          font: DensityBuoyancyCommonConstants.TITLE_FONT,
          maxWidth: 120
        },
        numberDisplayOptions: {
          textOptions: {
            font: DensityBuoyancyCommonConstants.READOUT_FONT
          },
          valuePattern: new PatternStringProperty( providedConfig.valuePatternProperty, {
            value: SunConstants.VALUE_NAMED_PLACEHOLDER
          } ),
          maxWidth: 100,
          decimalPlaces: 2,
          useRichText: true,
          useFullHeight: true,
          visibleProperty: numberDisplayVisibleProperty
        },
        arrowButtonOptions: { scale: 0.56 },

        sliderOptions: {
          majorTickLength: 5,
          thumbSize: DensityBuoyancyCommonConstants.THUMB_SIZE,
          thumbTouchAreaXDilation: 5,
          thumbTouchAreaYDilation: 4,
          majorTicks: [ {
            value: providedConfig.range.min,
            label: new Text( providedConfig.range.min, { font: new PhetFont( 12 ), maxWidth: 50 } )
          }, {
            value: providedConfig.range.max,
            label: new Text( providedConfig.range.max, { font: new PhetFont( 12 ), maxWidth: 50 } )
          } ],
          trackSize: new Dimension2( 120, 0.5 )
        }
      },

      // {Object} Options for the combo box
      comboBoxOptions: {
        cornerRadius: 3,
        xMargin: 13,
        yMargin: 5
      },

      // VBox options
      spacing: 10,
      align: 'center'
    }, providedConfig );

    assert && assert( !config.children, 'Children should not be specified for ComboNumberControl' );
    assert && assert( config.property instanceof Property );
    assert && assert( config.range instanceof Range );
    assert && assert( typeof config.toNumericValue === 'function' );
    assert && assert( typeof config.createCustomValue === 'function' );
    assert && assert( typeof config.isCustomValue === 'function' );
    assert && assert( config.listParent instanceof Node );
    assert && assert( Array.isArray( config.comboItems ) );
    assert && assert( config.customValue );

    const getFallbackNode = config.getFallbackNode;

    super();

    const getNumericValue = ( value: T ) => config.toNumericValue( value );
    const getComboValue = ( value: T ) => config.isCustomValue( value ) ? config.customValue : value;

    this.property = config.property;
    this.numberProperty = new NumberProperty( getNumericValue( this.property.value ) );
    this.comboProperty = new Property( getComboValue( this.property.value ) );
    this.disposalCallbacks = disposalCallbacks;

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    // Track the last non-hidden value, so that if we go to CUSTOM, we'll use this (and not just show the hidden value,
    // see https://github.com/phetsims/buoyancy/issues/54
    let lastNonHiddenValue = this.property.value;
    this.property.link( value => {
      if ( !config.isHiddenValue( value ) ) {
        lastNonHiddenValue = value;
      }
    } );

    let locked = false;

    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    this.property.lazyLink( value => {
      if ( !locked ) {
        locked = true;

        this.numberProperty.value = getNumericValue( value );
        this.comboProperty.value = getComboValue( value );

        locked = false;
      }
    } );
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    this.numberProperty.lazyLink( value => {
      if ( !locked ) {
        locked = true;

        this.property.value = config.createCustomValue( value );
        this.comboProperty.value = config.customValue;

        locked = false;
      }
    } );
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    this.comboProperty.lazyLink( value => {
      if ( !locked ) {
        locked = true;

        if ( config.isCustomValue( value ) ) {
          // We'll swap to the last non-hidden value (and make it custom). This is so that we don't immediately show a
          // "hidden" previous value (e.g. DENSITY_A) and the students have to guess it.
          // See https://github.com/phetsims/buoyancy/issues/54
          const newValue = getNumericValue( lastNonHiddenValue );
          this.property.value = config.createCustomValue( newValue );
          this.numberProperty.value = newValue;
        }
        else {
          this.property.value = value;
          this.numberProperty.value = getNumericValue( value );
        }

        locked = false;
      }
    } );

    const numberControlTandem = config.tandem.createTandem( 'numberControl' );
    this.numberControl = new NumberControl( config.titleProperty, this.numberProperty, config.range, combineOptions<NumberControlOptions>( {
      tandem: numberControlTandem
    }, config.numberControlOptions ) );
    this.numberControl.addLinkedElement( this.property, {
      tandem: numberControlTandem.createTandem( 'valueProperty' )
    } );

    this.comboBox = new ComboBox( this.comboProperty, config.comboItems, config.listParent, config.comboBoxOptions );

    config.children = [
      this.numberControl,
      this.comboBox
    ];

    this.mutate( config );
  }

  /**
   * Releases references.
   */
  public override dispose(): void {
    this.numberControl.dispose();
    this.comboBox.dispose();

    this.numberProperty.dispose();
    this.comboProperty.dispose();

    this.disposalCallbacks.forEach( callback => callback() );

    super.dispose();
  }
}

densityBuoyancyCommon.register( 'ComboNumberControl', ComboNumberControl );
