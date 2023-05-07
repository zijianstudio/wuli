// Copyright 2023, University of Colorado Boulder

/**
 * Properties related to visibility of UI components in this simulation.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import quadrilateral from '../../quadrilateral.js';
import QuadrilateralQueryParameters from '../QuadrilateralQueryParameters.js';

export default class QuadrilateralVisibilityModel {

  // Whether markers are visible in this sim - including ticks along the sides, interior, and exerior angle indicators.
  public readonly markersVisibleProperty: BooleanProperty;

  // Whether labels on each vertex are visible.
  public readonly vertexLabelsVisibleProperty: BooleanProperty;

  // Whether the grid is visible.
  public readonly gridVisibleProperty: BooleanProperty;

  // Whether the diagonal guides are visible.
  public readonly diagonalGuidesVisibleProperty: BooleanProperty;

  // Whether the shape name is displayed to the user.
  public readonly shapeNameVisibleProperty: BooleanProperty;

  // If true, a panel displaying model values will be added to the view. Only for debugging.
  public readonly showDebugValuesProperty: BooleanProperty;

  public constructor( tandem: Tandem ) {

    this.gridVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'gridVisibleProperty' )
    } );

    this.vertexLabelsVisibleProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'vertexLabelsVisibleProperty' )
    } );

    this.diagonalGuidesVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'diagonalGuidesVisibleProperty' )
    } );

    this.markersVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'markersVisibleProperty' )
    } );

    this.shapeNameVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'shapeNameVisibleProperty' )
    } );

    this.showDebugValuesProperty = new BooleanProperty( QuadrilateralQueryParameters.showModelValues );
  }

  public reset(): void {
    this.gridVisibleProperty.reset();
    this.vertexLabelsVisibleProperty.reset();
    this.diagonalGuidesVisibleProperty.reset();
    this.markersVisibleProperty.reset();
    this.shapeNameVisibleProperty.reset();
    this.showDebugValuesProperty.reset();
  }
}

quadrilateral.register( 'QuadrilateralVisibilityModel', QuadrilateralVisibilityModel );
