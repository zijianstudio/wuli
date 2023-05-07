// Copyright 2016-2022, University of Colorado Boulder

/**
 * View-specific Properties for the 'My Solution' and 'Micro' screens.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import phScale from '../../phScale.js';

export default class PHScaleViewProperties {

  public readonly ratioVisibleProperty: Property<boolean>;
  public readonly particleCountsVisibleProperty: Property<boolean>;

  public constructor( tandem: Tandem ) {

    this.ratioVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'ratioVisibleProperty' ),
      phetioDocumentation: 'controls visibility of the H3O+/OH- Ratio view'
    } );

    this.particleCountsVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'particleCountsVisibleProperty' ),
      phetioDocumentation: 'controls visibility of the Particle Counts view'
    } );
  }

  public reset(): void {
    this.ratioVisibleProperty.reset();
    this.particleCountsVisibleProperty.reset();
  }
}

phScale.register( 'PHScaleViewProperties', PHScaleViewProperties );