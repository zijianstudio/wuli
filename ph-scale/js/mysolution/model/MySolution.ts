// Copyright 2020-2022, University of Colorado Boulder

/**
 * MySolution is the model of the solution in the My Solution screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { Color } from '../../../../scenery/js/imports.js';
import PhetioObject, { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import SolutionDerivedProperties from '../../common/model/SolutionDerivedProperties.js';
import Water from '../../common/model/Water.js';
import PHScaleConstants from '../../common/PHScaleConstants.js';
import phScale from '../../phScale.js';

type SelfOptions = {
  pH?: number;
  volume?: number; // C
  maxVolume?: number; // L
};

type MySolutionOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class MySolution extends PhetioObject {

  public readonly pHProperty: NumberProperty; // pH of the solution in the beaker
  public readonly totalVolumeProperty: NumberProperty; // total volume of the solution in the beaker
  public readonly colorProperty: Property<Color>;
  public readonly derivedProperties: SolutionDerivedProperties;

  public constructor( providedOptions: MySolutionOptions ) {

    const options = optionize<MySolutionOptions, SelfOptions, PhetioObjectOptions>()( {

      // SelfOptions
      pH: 7,
      volume: 0.5,
      maxVolume: 1.2,

      // PhetioObjectOptions
      phetioState: false
    }, providedOptions );

    super( options );

    this.pHProperty = new NumberProperty( options.pH, {
      range: PHScaleConstants.PH_RANGE,
      tandem: options.tandem.createTandem( 'pHProperty' ),
      phetioDocumentation: 'pH of the solution',
      phetioHighFrequency: true
    } );

    this.totalVolumeProperty = new NumberProperty( options.volume, {
      units: 'L',
      tandem: options.tandem.createTandem( 'totalVolumeProperty' ),
      range: new Range( 0.01, options.maxVolume ), // must be > 0 !!
      phetioDocumentation: 'total volume of the solution',
      phetioHighFrequency: true
    } );

    // Do not instrument for PhET-iO.
    this.colorProperty = new Property( Water.color );

    this.derivedProperties = new SolutionDerivedProperties( this.pHProperty, this.totalVolumeProperty, {

      // Properties created by SolutionDerivedProperties should appear as if they are children of MySolution.
      tandem: options.tandem
    } );
  }

  public reset(): void {
    this.pHProperty.reset();
    this.totalVolumeProperty.reset();
    // this.derivedProperties does not need to be reset because all of its Properties are derived.
  }
}

phScale.register( 'MySolution', MySolution );