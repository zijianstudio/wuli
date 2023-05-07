// Copyright 2018-2023, University of Colorado Boulder

/**
 * View-specific Properties and properties for the 'Focus & Directrix' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import GQViewProperties from '../../common/view/GQViewProperties.js';
import graphingQuadratics from '../../graphingQuadratics.js';

export default class FocusAndDirectrixViewProperties extends GQViewProperties {

  // See phetioDocumentation below
  public readonly focusVisibleProperty: Property<boolean>;
  public readonly directrixVisibleProperty: Property<boolean>;
  public readonly pointOnParabolaVisibleProperty: Property<boolean>;

  public constructor( tandem: Tandem ) {

    super( {
      equationForm: 'vertex',
      vertexVisible: true,
      coordinatesVisible: true,
      tandem: tandem
    } );

    this.focusVisibleProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'focusVisibleProperty' ),
      phetioDocumentation: 'whether the focus manipulator is visible'
    } );

    this.directrixVisibleProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'directrixVisibleProperty' ),
      phetioDocumentation: 'whether the directrix is visible'
    } );

    this.pointOnParabolaVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'pointOnParabolaVisibleProperty' ),
      phetioDocumentation: 'whether the manipulator for the point on the parabola is visible'
    } );
  }

  public override reset(): void {
    this.focusVisibleProperty.reset();
    this.directrixVisibleProperty.reset();
    this.pointOnParabolaVisibleProperty.reset();
    super.reset();
  }
}

graphingQuadratics.register( 'FocusAndDirectrixViewProperties', FocusAndDirectrixViewProperties );