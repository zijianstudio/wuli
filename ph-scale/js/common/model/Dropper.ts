// Copyright 2013-2023, University of Colorado Boulder

/**
 * Model of the dropper, contains solute in solution form (stock solution).
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import phScale from '../../phScale.js';
import Solute from './Solute.js';

type SelfOptions = {
  flowRate?: number; // L/sec
  maxFlowRate?: number; // L/sec
  dispensing?: boolean; // is the dropper dispensing solute?
  empty?: boolean; // is the dropper empty?
  enabled?: boolean; // is the dropper enabled?
  visible?: boolean; // is the dropper visible?
};

type DropperOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class Dropper {

  public readonly position: Vector2;
  public readonly soluteProperty: Property<Solute>;
  public readonly flowRateProperty: Property<number>;
  public readonly isDispensingProperty: Property<boolean>;
  public readonly enabledProperty: Property<boolean>;

  // Added for PhET-iO clients, so they can choose to make the dropper invisible.
  // See https://github.com/phetsims/ph-scale/issues/178
  public readonly visibleProperty: Property<boolean>;

  public constructor( solute: Solute, solutes: Solute[], position: Vector2, providedOptions: DropperOptions ) {

    const options = optionize<DropperOptions, SelfOptions>()( {

      // SelfOptions
      flowRate: 0,
      maxFlowRate: 0.05,
      dispensing: false,
      empty: false,
      enabled: true,
      visible: true
    }, providedOptions );

    this.position = position;

    this.soluteProperty = new Property( solute, {
      validValues: solutes,
      tandem: options.tandem.createTandem( 'soluteProperty' ),
      phetioValueType: Solute.SoluteIO,
      phetioDocumentation: 'the solute dispensed by the dropper'
    } );

    this.flowRateProperty = new NumberProperty( options.flowRate, {
      units: 'L/s',
      isValidValue: value => ( value >= 0 ),
      tandem: options.tandem.createTandem( 'flowRateProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'the flow rate of solute coming out of the dropper'
    } ); // L/sec

    this.isDispensingProperty = new BooleanProperty( options.dispensing, {
      tandem: options.tandem.createTandem( 'isDispensingProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'whether solute is currently flowing out of the dropper'
    } );

    this.enabledProperty = new BooleanProperty( options.enabled, {
      tandem: options.tandem.createTandem( 'enabledProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'whether the button on the dropper is enabled'
    } );

    this.visibleProperty = new BooleanProperty( true, {
      tandem: options.tandem.createTandem( 'visibleProperty' ),
      phetioDocumentation: 'whether the dropper is visible'
    } );

    // Turn off the dropper when it's disabled.
    this.enabledProperty.link( enabled => {
      if ( !enabled && !phet.joist.sim.isSettingPhetioStateProperty.value ) {
        this.isDispensingProperty.value = false;
      }
    } );

    // Toggle the flow rate when the dropper is turned on/off.
    this.isDispensingProperty.link( dispensing => {
      if ( !phet.joist.sim.isSettingPhetioStateProperty.value ) {
        this.flowRateProperty.value = dispensing ? options.maxFlowRate : 0;
      }
    } );
  }

  public reset(): void {
    this.soluteProperty.reset();
    this.isDispensingProperty.reset();
    this.enabledProperty.reset();
    this.flowRateProperty.reset();
  }
}

phScale.register( 'Dropper', Dropper );