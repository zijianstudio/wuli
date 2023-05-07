// Copyright 2018-2023, University of Colorado Boulder

/**
 * View-specific Properties and properties for the 'Explore' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import GQViewProperties from '../../common/view/GQViewProperties.js';
import graphingQuadratics from '../../graphingQuadratics.js';

export default class ExploreViewProperties extends GQViewProperties {

  // See phetioDocumentation below
  public readonly quadraticTermsAccordionBoxExpandedProperty: Property<boolean>;
  public readonly quadraticTermVisibleProperty: Property<boolean>;
  public readonly linearTermVisibleProperty: Property<boolean>;
  public readonly constantTermVisibleProperty: Property<boolean>;

  public constructor( tandem: Tandem ) {

    super( {
      tandem: tandem
    } );

    this.quadraticTermsAccordionBoxExpandedProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'quadraticTermsAccordionBoxExpandedProperty' ),
      phetioDocumentation: 'whether the Quadratic Terms accordion box is expanded'
    } );

    this.quadraticTermVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'quadraticTermVisibleProperty' ),
      phetioDocumentation: 'whether the quadratic term (y = ax^2) is visible'
    } );

    this.linearTermVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'linearTermVisibleProperty' ),
      phetioDocumentation: 'whether the linear term (y = bx) is visible'
    } );

    this.constantTermVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'constantTermVisibleProperty' ),
      phetioDocumentation: 'whether the constant term (y = c) is visible'
    } );
  }

  public override reset(): void {
    this.quadraticTermsAccordionBoxExpandedProperty.reset();
    this.quadraticTermVisibleProperty.reset();
    this.linearTermVisibleProperty.reset();
    this.constantTermVisibleProperty.reset();
    super.reset();
  }
}

graphingQuadratics.register( 'ExploreViewProperties', ExploreViewProperties );