// Copyright 2023, University of Colorado Boulder

/**
 * A superclass for movable model components of the quadrilateral. Namely, a superclass for QuadrilateralVertex and QuadrilateralSide.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import quadrilateral from '../../quadrilateral.js';

export default class QuadrilateralMovable {

  // Indicates that this component is "pressed" for user interaction.
  public readonly isPressedProperty: Property<boolean>;

  // Indicates that movement is blocked by model bounds.
  public readonly movementBlockedByBoundsProperty = new BooleanProperty( false );

  // Indicates that movement is blocked by the quadrilateral shape - other sides or vertices.
  public readonly movementBlockedByShapeProperty = new BooleanProperty( false );

  // (Voicing) Indicates that the QuadrilateralSide has received some input and it is time to trigger a new Voicing response
  // the next time Properties are updated in QuadrilateralShapeModel.
  public voicingObjectResponseDirty = false;

  public constructor( tandem: Tandem ) {
    this.isPressedProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isPressedProperty' )
    } );
  }
}

quadrilateral.register( 'QuadrilateralMovable', QuadrilateralMovable );
