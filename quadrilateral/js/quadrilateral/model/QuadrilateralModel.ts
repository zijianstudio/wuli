// Copyright 2021-2023, University of Colorado Boulder

/**
 * The base model class for the sim. Assembles all model components and responsible for managing Properties
 * that indicate the state of the Quadrilateral shape. Also includes Properties that manage the state of the Sim (UI
 * element visibility and so on).
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuadrilateralQueryParameters from '../QuadrilateralQueryParameters.js';
import QuadrilateralShapeModel, { VertexLabelToProposedPositionMap } from './QuadrilateralShapeModel.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Utils from '../../../../dot/js/Utils.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import QuadrilateralOptionsModel from './QuadrilateralOptionsModel.js';
import TProperty from '../../../../axon/js/TProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import quadrilateral from '../../quadrilateral.js';
import QuadrilateralConstants from '../../QuadrilateralConstants.js';
import TangibleConnectionModel from './prototype/TangibleConnectionModel.js';
import QuadrilateralVisibilityModel from './QuadrilateralVisibilityModel.js';
import TModel from '../../../../joist/js/TModel.js';

export default class QuadrilateralModel implements TModel {

  // Manages visibility of view components
  public readonly visibilityModel: QuadrilateralVisibilityModel;

  // Controls runtime options for the simulation.
  public readonly optionsModel: QuadrilateralOptionsModel;

  // A model that manages Properties used by prototype connections with tangible devdevices (Serial, OpenCV, BLE).
  public readonly tangibleConnectionModel: TangibleConnectionModel;

  // Whether a reset is currently in progress. Added for sound. If the model is actively resetting, SoundManagers
  // are disabled so we don't play sounds for transient model states. Tracks when the reset is NOT in progress
  // because that makes it most convenient to pass to SoundGenerator enableControlProperties.
  public readonly resetNotInProgressProperty: TProperty<boolean>;

  // The available bounds for smooth vertex dragging (the model bounds eroded by the width of a vertex so a vertex
  // can never go out of the model bounds.
  public readonly vertexDragBounds = QuadrilateralConstants.MODEL_BOUNDS.eroded( QuadrilateralConstants.VERTEX_WIDTH / 2 );

  // The interval that Vertices are constrained to during interaction. There are many things that control the value:
  //  - A button in the UI to lock to small intervals (see useMinorIntervalsProperty and lockToMinorIntervalsProperty)
  //  - A global hotkey for small intervals (see useMinorIntervalsProperty and minorIntervalsFromGlobalHotkeyProperty)
  //  - Using ?reducedStepSize to make all intervals smaller (see vertexIntervalProperty derivation)
  //  - Connecting to a prototype tangible device (see vertexIntervalProperty derivation)
  public readonly vertexIntervalProperty: TReadOnlyProperty<number>;

  // Whether vertices are going to snap to the minor intervals of the model grid. The user can "lock" this setting
  // from the user interface. There is also a global hotkey to toggle this quickly during interaction. Derived from
  // lockToMinorIntervalsProperty and minorIntervalsFromGlobalKeyProperty.
  private readonly useMinorIntervalsProperty: TReadOnlyProperty<boolean>;

  // Whether the vertices will lock to the minor grid intervals during interaction. Controlled by a toggle in the UI.
  // When true, the global hotkey for using minor intervals does nothing.
  public readonly lockToMinorIntervalsProperty: BooleanProperty;

  // Whether the vertices should snap to the minor grid intervals because of pressing a hotkey.
  public readonly minorIntervalsFromGlobalKeyProperty: TProperty<boolean>;

  // Whether the simulation sound design is enabled to play as the shape changes. For now,
  // this only controls the "Tracks" sound designs in this simulation. When this is false,
  // we will still hear general and common code sounds.
  public readonly shapeSoundEnabledProperty: BooleanProperty;

  // Model component for the quadrilateral shape.
  public readonly quadrilateralShapeModel: QuadrilateralShapeModel;

  // A reference to a "test" model for the simulation. Used to validate vertex positions before setting them for
  // the "real" quadrilateralShapeModel. See QuadrilateralShapeModel.isQuadrilateralShapeAllowed().
  public readonly quadrilateralTestShapeModel: QuadrilateralShapeModel;

  // Emits an event when a full model reset happens (but not when a shape reset happens)
  public readonly resetEmitter = new Emitter();

  public constructor( optionsModel: QuadrilateralOptionsModel, tandem: Tandem ) {
    this.optionsModel = optionsModel;

    this.resetNotInProgressProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'resetNotInProgressProperty' )
    } );

    const smoothingLengthProperty = optionsModel.tangibleOptionsModel.smoothingLengthProperty;
    this.quadrilateralShapeModel = new QuadrilateralShapeModel( this.resetNotInProgressProperty, smoothingLengthProperty, {
      tandem: tandem.createTandem( 'quadrilateralShapeModel' )
    } );
    this.quadrilateralTestShapeModel = new QuadrilateralShapeModel( this.resetNotInProgressProperty, smoothingLengthProperty, {
      validateShape: false
    } );

    this.visibilityModel = new QuadrilateralVisibilityModel( tandem.createTandem( 'visibilityModel' ) );
    this.tangibleConnectionModel = new TangibleConnectionModel(
      this.quadrilateralShapeModel,
      this.quadrilateralTestShapeModel,
      this.optionsModel.tangibleOptionsModel,
      tandem.createTandem( 'tangibleConnectionModel' )
    );

    this.shapeSoundEnabledProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'shapeSoundEnabledProperty' )
    } );

    this.minorIntervalsFromGlobalKeyProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'minorIntervalsFromGlobalKeyProperty' )
    } );
    this.lockToMinorIntervalsProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'lockToMinorIntervalsProperty' )
    } );
    this.useMinorIntervalsProperty = DerivedProperty.or( [ this.minorIntervalsFromGlobalKeyProperty, this.lockToMinorIntervalsProperty ] );

    // QuadrilateralVertex intervals are controlled whether we are "locked" to smaller steps, whether we are temporarily using
    // smaller steps because of a hotkey, or if running with ?reducedStepSize
    this.vertexIntervalProperty = new DerivedProperty(
      [ this.useMinorIntervalsProperty, this.tangibleConnectionModel.connectedToDeviceProperty, optionsModel.tangibleOptionsModel.deviceGridSpacingProperty ],
      ( useMinorIntervals, connectedToDevice, deviceGridSpacing ) => {
        return connectedToDevice ? deviceGridSpacing :
               QuadrilateralQueryParameters.reducedStepSize ? ( useMinorIntervals ? QuadrilateralConstants.MINOR_REDUCED_SIZE_VERTEX_INTERVAL : QuadrilateralConstants.MAJOR_REDUCED_SIZE_VERTEX_INTERVAL ) :
               useMinorIntervals ? QuadrilateralQueryParameters.minorVertexInterval : QuadrilateralQueryParameters.majorVertexInterval;
      }
    );

    // Adds a function to the window that prints the current vertex positions (only for development)
    if ( phet.chipper.queryParameters.dev ) {

      // @ts-expect-error - assigning to the window is bad, but its fine for this debugging tool
      window.printVertexPositions = () => {
        this.quadrilateralShapeModel.vertices.forEach( vertex => {
          console.log( vertex.vertexLabel.name, vertex.positionProperty.value );
        } );
      };
    }
  }

  /**
   * Returns true if the two vertex positions are allowed for the quadrilateral.
   */
  public areVertexPositionsAllowed( labelToPositionMap: VertexLabelToProposedPositionMap ): boolean {

    // Set the test shape to the current value of the actual shape before proposed positions
    this.quadrilateralTestShapeModel.setFromShape( this.quadrilateralShapeModel );
    this.quadrilateralTestShapeModel.setVertexPositions( labelToPositionMap );
    return QuadrilateralShapeModel.isQuadrilateralShapeAllowed( this.quadrilateralTestShapeModel );
  }

  /**
   * Resets the model.
   */
  public reset(): void {

    // reset is in progress (not-not in progress)
    this.resetNotInProgressProperty.value = false;

    this.visibilityModel.reset();
    this.lockToMinorIntervalsProperty.reset();
    this.shapeSoundEnabledProperty.reset();

    this.quadrilateralShapeModel.reset();
    this.quadrilateralTestShapeModel.reset();

    this.resetEmitter.emit();

    // reset is not in progress anymore
    this.resetNotInProgressProperty.value = true;
  }

  /**
   * Returns the closest position in the model from the point provided that will be constrain the position to align
   * with the model grid. See vertexIntervalProperty for more information about how the intervals of the grid
   * can change.
   */
  public getClosestGridPosition( proposedPosition: Vector2 ): Vector2 {

    const interval = this.vertexIntervalProperty.value;
    return new Vector2( Utils.roundToInterval( proposedPosition.x, interval ), Utils.roundToInterval( proposedPosition.y, interval ) );
  }

  /**
   * Get the closest grid position to the proposed position, in x/y dimensions OR along the diagonal if we detect
   * movement close to the diagonal. This allows you to drag diagonally across grid cells if you want to, creating
   * more intuitive interaction.
   *
   * The implementation of this function is summarized by
   * https://github.com/phetsims/quadrilateral/issues/406#issuecomment-1485982113. If the proposed position
   * is close enough to a diagonal line between the grid points, we assume that the user wants to move diagonally
   * so we don't snap to axis-aligned positions.
   */
  public getClosestGridPositionAlongDiagonal( currentPosition: Vector2, proposedPosition: Vector2 ): Vector2 {

    // At this tiny step size, this feature is more harm than help and the grid size is so small that it
    // makes sense to just get the closest grid position.
    if ( this.useMinorIntervalsProperty.value && QuadrilateralQueryParameters.reducedStepSize ) {
      return this.getClosestGridPosition( proposedPosition );
    }

    const interval = this.vertexIntervalProperty.value;

    // create a diagonal line from currentPosition to next interval, in the direction of movement
    const diagonalIntervalPosition = currentPosition.plusXY(
      interval * ( proposedPosition.x > currentPosition.x ? 1 : -1 ),
      interval * ( proposedPosition.y > currentPosition.y ? 1 : -1 )
    );

    // If we are within this distance to the diagonal line between currentPosition and proposedPosition we are
    // moving along the diagonal and should try to find the closest grid position along that diagonal line.
    // This value was chosen by inspection. It is difficult to get a value that "feels right" without being too biased
    // toward diagonal or movement along the axis.
    const maximumDiagonalDistance = interval / 400;

    const distanceToDiagonal = Utils.distToSegmentSquared( proposedPosition, currentPosition, diagonalIntervalPosition );
    if ( distanceToDiagonal < maximumDiagonalDistance ) {

      // Close enough to be moving along the diagonal, so the interval needs to be larger to trigger a transition.
      // Value is the interval along the diagonal so we use the pythagorean theorem.
      const halfInterval = interval / 2;
      const diagonalInterval = Math.sqrt( halfInterval * halfInterval + halfInterval * halfInterval );
      const distanceToCurrentPosition = currentPosition.distance( proposedPosition );

      if ( distanceToCurrentPosition > diagonalInterval ) {
        return diagonalIntervalPosition;
      }
      else {

        // distance along the diagonal was not large enough, don't move
        return currentPosition;
      }
    }
    else {
      return this.getClosestGridPosition( proposedPosition );
    }
  }

  /**
   * Get the closest grid position to the provided position, in the direction of the provided directionVector.
   * Use this when you need to move to the closest grid position in one dimension, instead of moving to the
   * closest grid position in both X and Y.
   */
  public getClosestGridPositionInDirection( currentPosition: Vector2, directionVector: Vector2 ): Vector2 {
    let nextX = currentPosition.x;
    let nextY = currentPosition.y;

    if ( directionVector.x !== 0 ) {
      nextX = this.getNextPositionInDimension( currentPosition, directionVector, 'x' );
    }
    else if ( directionVector.y !== 0 ) {
      nextY = this.getNextPositionInDimension( currentPosition, directionVector, 'y' );
    }

    return new Vector2( nextX, nextY );
  }

  /**
   * Get the next value on the interval in provided dimension. The following diagram demonstrates how this works:
   *                interval
   *           |---------------|
   *              A
   *         |---------|
   * -----C--*-|-*-----|-----*-|-*-----------------
   *                   |---------|
   *                        B
   *  C: currentValue
   *  A: If the value lands in this region, next position should be left side of interval.
   *  B: If value lands in this region, next position should be right side of interval.
   *  *: small offset so if currentValue is very close to the interval, we will round to next interval.
   *
   *  So the length of A (or B) is added to currentValue before rounding to the interval.
   *
   *  See https://github.com/phetsims/quadrilateral/issues/402 for more implementation notes.
   */
  private getNextPositionInDimension( currentPosition: Vector2, directionVector: Vector2, dimension: 'x' | 'y' ): number {
    const currentValue = currentPosition[ dimension ];
    const gettingLarger = directionVector[ dimension ] > 0;
    const interval = this.vertexIntervalProperty.value;

    const delta = 0.01 + interval / 2;
    const sign = gettingLarger ? 1 : -1;
    return Utils.roundToInterval( currentValue + sign * delta, interval );
  }
}

quadrilateral.register( 'QuadrilateralModel', QuadrilateralModel );
