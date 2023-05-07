// Copyright 2018-2023, University of Colorado Boulder

/**
 * View-specific Properties for the 'Standard Form' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import GQViewProperties from '../../common/view/GQViewProperties.js';
import graphingQuadratics from '../../graphingQuadratics.js';

export default class StandardFormViewProperties extends GQViewProperties {

  // See phetioDocumentation below
  public readonly rootsVisibleProperty: Property<boolean>;

  public constructor( tandem: Tandem ) {

    super( {
      vertexVisible: false,
      axisOfSymmetryVisible: false,
      coordinatesVisible: true,
      tandem: tandem
    } );

    this.rootsVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'rootsVisibleProperty' ),
      phetioDocumentation: 'whether the roots of the quadratic are visible'
    } );
  }

  public override reset(): void {
    this.rootsVisibleProperty.reset();
    super.reset();
  }
}

graphingQuadratics.register( 'StandardFormViewProperties', StandardFormViewProperties );