// Copyright 2013-2022, University of Colorado Boulder

/**
 * Faucet model, used for input and output faucets.
 * This model assumes that the pipe enters the faucet from the left.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import phScale from '../../phScale.js';

type SelfOptions = {
  spoutWidth?: number; // pixels
  maxFlowRate?: number; // L/sec
  flowRate?: number; // L/sec
  enabled?: boolean;
};

type FaucetOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class Faucet {

  public readonly position: Vector2;
  public readonly pipeMinX: number;
  public readonly spoutWidth: number;
  public readonly maxFlowRate: number;
  public readonly flowRateProperty: NumberProperty;
  public readonly enabledProperty: Property<boolean>;

  /**
   * @param position - center of output pipe
   * @param pipeMinX - x-coordinate of where the pipe starts
   * @param [providedOptions]
   */
  public constructor( position: Vector2, pipeMinX: number, providedOptions: FaucetOptions ) {

    const options = optionize<FaucetOptions, SelfOptions>()( {

      // SelfOptions
      spoutWidth: 45, // pixels
      maxFlowRate: 0.25, // L/sec
      flowRate: 0,
      enabled: true
    }, providedOptions );

    this.position = position;
    this.pipeMinX = pipeMinX;
    this.spoutWidth = options.spoutWidth;
    this.maxFlowRate = options.maxFlowRate;

    this.flowRateProperty = new NumberProperty( options.flowRate, {
      range: new Range( 0, options.maxFlowRate ),
      units: 'L/s',
      tandem: options.tandem.createTandem( 'flowRateProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'the flow rate of solution coming out of the faucet',
      phetioHighFrequency: true
    } );

    this.enabledProperty = new BooleanProperty( options.enabled, {
      tandem: options.tandem.createTandem( 'enabledProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'whether the faucet is enabled'
    } );

    // when disabled, turn off the faucet.
    this.enabledProperty.link( enabled => {
      if ( !enabled && !phet.joist.sim.isSettingPhetioStateProperty.value ) {
        this.flowRateProperty.value = 0;
      }
    } );
  }

  public reset(): void {
    this.flowRateProperty.reset();
    this.enabledProperty.reset();
  }
}

phScale.register( 'Faucet', Faucet );