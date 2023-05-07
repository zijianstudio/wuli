// Copyright 2014-2022, University of Colorado Boulder

/**
 * Model container for the 'Faradays Law' simulation.
 *
 * @author Vasily Shakhov (MLearner)
 * @author Sam Reid (PhET Interactive Simulations)
 */

// modules
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Line } from '../../../../kite/js/imports.js';
import faradaysLaw from '../../faradaysLaw.js';
import FaradaysLawConstants from '../FaradaysLawConstants.js';
import CoilTypeEnum from '../view/CoilTypeEnum.js';
import Coil from './Coil.js';
import Magnet from './Magnet.js';
import Voltmeter from './Voltmeter.js';

// constants

// Values used for the restricted zones where the magnet can't be dragged due to the presence of the coils.  These
// numbers were empirically determined based upon how the artwork for the coils appear in the view.
const COIL_RESTRICTED_AREA_HEIGHT = 12;
const TOP_COIL_RESTRICTED_AREA_WIDTH = 25;
const BOTTOM_COIL_RESTRICTED_AREA_WIDTH = 55;

class FaradaysLawModel {

  /**
   * @param {Bounds2} bounds of Screen
   * @param {Tandem} tandem
   */
  constructor( bounds, tandem ) {

    // @public (read-only) (Bounds2}
    this.bounds = bounds;

    // @public - Whether the top coil should be shown
    this.topCoilVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'topCoilVisibleProperty' ),
      phetioDocumentation: 'True if and only if the top coil is visible'
    } );

    // @public - true if the magnet arrows should be shown
    this.magnetArrowsVisibleProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'magnetArrowsVisibleProperty' ),
      phetioDocumentation: 'True if the magnet arrows are shown'
    } );

    // @public
    this.voltmeterVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'voltmeterVisibleProperty' ),
      phetioDocumentation: 'True if the voltmeter is shown'
    } );

    // @public {NumberProperty} Voltage indicated by the voltmeter. This drives the needle position and the light bulb brightness.
    this.voltageProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'voltageProperty' ),
      phetioDocumentation: 'Voltage indicated by the voltmeter. This drives the needle position and the light bulb brightness.',
      phetioReadOnly: true,
      phetioHighFrequency: true,
      units: 'V'
    } );

    // @public - the magnet which can be dragged
    this.magnet = new Magnet( tandem.createTandem( 'magnet' ) );

    // @public - bottom coil
    this.bottomCoil = new Coil( FaradaysLawConstants.BOTTOM_COIL_POSITION, 4, this.magnet );

    // @public - top coil
    this.topCoil = new Coil( FaradaysLawConstants.TOP_COIL_POSITION, 2, this.magnet );

    // @public (read-only) {Bounds2[]} - Regions where the magnet cannot be dragged.  There are two for each coil, one
    // for the upper portion of the coil and one for the lower portion.  The hard coded numbers are empirically
    // determined based upon how the artwork for the coils ended up projecting into the view.
    this.topCoilRestrictedBounds = [

      // upper portion of the coil
      Bounds2.rect(
        this.topCoil.position.x - 7,
        this.topCoil.position.y - 77,
        TOP_COIL_RESTRICTED_AREA_WIDTH,
        COIL_RESTRICTED_AREA_HEIGHT
      ),

      // lower portion of the coil
      Bounds2.rect(
        this.topCoil.position.x,
        this.topCoil.position.y + 65,
        TOP_COIL_RESTRICTED_AREA_WIDTH,
        COIL_RESTRICTED_AREA_HEIGHT
      )
    ];
    this.bottomCoilRestrictedBounds = [

      // upper portion of the coil
      Bounds2.rect(
        this.bottomCoil.position.x - 31,
        this.bottomCoil.position.y - 77,
        BOTTOM_COIL_RESTRICTED_AREA_WIDTH,
        COIL_RESTRICTED_AREA_HEIGHT
      ),

      // lower portion of the coil
      Bounds2.rect(
        this.bottomCoil.position.x - 23,
        this.bottomCoil.position.y + 65,
        BOTTOM_COIL_RESTRICTED_AREA_WIDTH,
        COIL_RESTRICTED_AREA_HEIGHT
      )
    ];

    // @public - the Voltmeter
    this.voltmeter = new Voltmeter( this );

    // @public (read-only)
    this.resetInProgressProperty = new BooleanProperty( false );

    // @public (listen-only) - emitter that fires when the magnet bumps into a coil
    this.coilBumpEmitter = new Emitter( { parameters: [ { valueType: CoilTypeEnum } ] } );

    // @public (listen-only) - emitter that fires when the magnet bumps into the outer drag bounds
    this.edgeBumpEmitter = new Emitter();

    // @private - see this.moveMagnetToPosition method, used to calculate allowed magnet positions
    this.intersectedBounds = null;

    // @private {Bounds2|null} - bounds where magnet was set to on the last movement attempt, used to detect transitions
    // between being totally in bounds and reaching the boundary edge
    this.previousMagnetBounds = null;

    // If the magnet intersects the top coil area when the top coil is shown, then reset the magnet.
    this.topCoilVisibleProperty.link( showTopCoil => {
      if ( showTopCoil && this.magnetIntersectsTopCoilArea() ) {
        this.magnet.positionProperty.reset();
      }
      this.intersectedBounds = null;
      this.topCoil.reset();
    } );
  }

  /**
   * Restore to initial conditions
   * @public
   */
  reset() {
    this.resetInProgressProperty.set( true );
    this.magnet.reset();
    this.topCoilVisibleProperty.reset();
    this.magnetArrowsVisibleProperty.reset();
    this.bottomCoil.reset();
    this.topCoil.reset();
    this.voltmeterVisibleProperty.reset();
    this.resetInProgressProperty.set( false );
  }

  /**
   * Move the model forward in time
   * @param {number} dt - in seconds
   * @public
   */
  step( dt ) {
    this.bottomCoil.step( dt );
    this.topCoilVisibleProperty.get() && this.topCoil.step( dt );
    this.voltmeter.step( dt );
  }

  /**
   * Returns true if magnet intersects coil bounds
   * @returns {boolean}
   * @private
   */
  magnetIntersectsTopCoilArea() {
    const magnetBounds = Bounds2.point( this.magnet.positionProperty.get() ).dilatedXY( this.magnet.width / 2, this.magnet.height / 2 );
    return magnetBounds.intersectsBounds(
      this.topCoilRestrictedBounds[ 1 ] ) || magnetBounds.intersectsBounds( this.topCoilRestrictedBounds[ 0 ]
    );
  }

  /**
   * Tests the provided bounds against the current set of restricted bounds and returns the first one for which there
   * is an intersection, null if the provided bounds don't intersect with any of the restricted bounds.
   * @param  {Bounds2} bounds
   * @returns {Bounds2|null}
   * @public
   */
  getIntersectedRestrictedBounds( bounds ) {

    let intersectedRestrictedBounds = null;

    // Handle whether one or both coils are visible.
    let restrictedBoundsList = [ ...this.bottomCoilRestrictedBounds ];
    if ( this.topCoilVisibleProperty.get() ) {
      restrictedBoundsList = restrictedBoundsList.concat( this.topCoilRestrictedBounds );
    }

    // Test against all restricted bounds.
    for ( let i = 0; i < restrictedBoundsList.length; i++ ) {
      if ( bounds.intersectsBounds( restrictedBoundsList[ i ] ) ) {
        intersectedRestrictedBounds = restrictedBoundsList[ i ];
        break;
      }
    }

    return intersectedRestrictedBounds;
  }

  /**
   * Given the leading edges for a rectangular moving object, a proposed translation, and the edges from another object
   * or boundary with which the first one could collide, return a value representing the amount of the translation that
   * could occur without collision.
   * @param {{verticalEdge: Line, horizontalEdge: Line }} leadingEdgeLines
   * @param {Vector2} proposedTranslation
   * @param {{verticalEdge: Line, horizontalEdge: Line }} obstacleEdgeLines
   * @returns {Vector2} - either a copy of the proposed translation or, if the obstacle edges would interfere with the
   * proposed motion, and limited version thereof
   * @private
   */
  checkMotionAgainstObstacles( leadingEdgeLines, proposedTranslation, obstacleEdgeLines ) {

    // If there is no actual motion proposed, there is nothing to do here.  This is done as an optimization.
    if ( proposedTranslation.x === 0 && proposedTranslation.y === 0 ) {
      return proposedTranslation;
    }

    // Start by assuming that the entire amount of the translation will work.
    let allowedHorizontalMotion = proposedTranslation.x;
    let allowedVerticalMotion = proposedTranslation.y;

    // Check the horizontal motion and limit it if necessary.
    const horizontalDelta = obstacleEdgeLines.verticalEdge.start.x - leadingEdgeLines.verticalEdge.start.x;

    // Test if the restricted bounds are within a distance and on a side where interference could occur.
    if ( Math.abs( proposedTranslation.x ) > 0 &&
         ( Math.sign( proposedTranslation.x ) === Math.sign( horizontalDelta ) || horizontalDelta === 0 ) &&
         Math.abs( proposedTranslation.x ) >= Math.abs( horizontalDelta ) ) {

      // Test whether the leading edge line would overlap with the bounds edge if projected to the same location.  In
      // other words, would these two lines collide with each other when moved by the proposed translation?
      const translationScaleFactor = horizontalDelta / proposedTranslation.x;
      assert && assert( translationScaleFactor <= 1, 'if we hit this, something is wrong in the code above' );
      const scaledDownTranslation = proposedTranslation.timesScalar( translationScaleFactor );
      const projectedLineStartPoint = leadingEdgeLines.verticalEdge.start.plus( scaledDownTranslation );
      const projectedLineEndPoint = leadingEdgeLines.verticalEdge.end.plus( scaledDownTranslation );

      // Does the translated leading edge line overlap with the restricted bounds?
      const edgeLinesOverlap = ( projectedLineEndPoint.y > obstacleEdgeLines.verticalEdge.start.y &&
                                 projectedLineStartPoint.y < obstacleEdgeLines.verticalEdge.end.y ) ||
                               ( projectedLineStartPoint.y < obstacleEdgeLines.verticalEdge.end.y &&
                                 projectedLineEndPoint.y > obstacleEdgeLines.verticalEdge.start.y );

      if ( edgeLinesOverlap ) {

        // The proposed translation would cause the edge lines to collide, so limit the horizontal motion to an amount
        // where overlap will not occur.
        allowedHorizontalMotion = horizontalDelta;
      }
    }

    // Check the vertical motion and limit it if necessary.
    const verticalDelta = obstacleEdgeLines.horizontalEdge.start.y - leadingEdgeLines.horizontalEdge.start.y;

    // Test if the restricted bounds are within a distance and on a side where interference could occur.
    if ( Math.abs( proposedTranslation.y ) > 0 &&
         ( Math.sign( proposedTranslation.y ) === Math.sign( verticalDelta ) || verticalDelta === 0 ) &&
         Math.abs( proposedTranslation.y ) >= Math.abs( verticalDelta ) ) {

      // Test whether the leading edge line would overlap with the bounds edge if projected to the same location.  In
      // other words, would these two lines collide with each other when moved by the proposed translation?
      const translationScaleFactor = verticalDelta / proposedTranslation.y;
      assert && assert( translationScaleFactor <= 1, 'if we hit this, something is wrong in the code above' );
      const scaledDownTranslation = proposedTranslation.timesScalar( translationScaleFactor );
      const projectedLineStartPoint = leadingEdgeLines.horizontalEdge.start.plus( scaledDownTranslation );
      const projectedLineEndPoint = leadingEdgeLines.horizontalEdge.end.plus( scaledDownTranslation );

      // Does the translated leading edge line overlap with the restricted bounds?
      const edgeLinesOverlap = ( projectedLineEndPoint.x > obstacleEdgeLines.horizontalEdge.start.x &&
                                 projectedLineStartPoint.x < obstacleEdgeLines.horizontalEdge.end.x ) ||
                               ( projectedLineStartPoint.x < obstacleEdgeLines.horizontalEdge.end.x &&
                                 projectedLineEndPoint.x > obstacleEdgeLines.horizontalEdge.start.x );

      if ( edgeLinesOverlap ) {

        // The proposed translation would cause the edge lines to collide, so limit the vertical motion to an amount
        // where overlap will not occur.
        allowedVerticalMotion = verticalDelta;
      }
    }

    return new Vector2( allowedHorizontalMotion, allowedVerticalMotion );
  }

  /**
   * Given the leading edges for a rectangular moving object, a proposed translation, and the bounds in which the object
   * needs to be contained, return either the original translation if no interaction would occur with the bounds or a
   * revised, limited translation that is the amount of motion possible before hitting the bounds.
   * @param {{verticalEdge: Line, horizontalEdge: Line }} leadingEdgeLines
   * @param {Vector2} proposedTranslation
   * @param {Bounds2} bounds
   * @returns {Vector2} - either a copy of the proposed translation or, if the obstacle edges would interfere with the
   * proposed motion, and limited version thereof
   * @private
   */
  checkMotionAgainstBounds( leadingEdgeLines, proposedTranslation, bounds ) {

    // If there is no actual motion proposed, there is nothing to do here.  This is done as an optimization.
    if ( proposedTranslation.x === 0 && proposedTranslation.y === 0 ) {
      return proposedTranslation;
    }

    const allowedTranslation = proposedTranslation.copy();

    // x direction
    if ( proposedTranslation.x > 0 ) {
      if ( leadingEdgeLines.verticalEdge.start.x + proposedTranslation.x > bounds.maxX ) {
        allowedTranslation.setX( bounds.maxX - leadingEdgeLines.verticalEdge.start.x );
      }
    }
    else {
      if ( leadingEdgeLines.verticalEdge.start.x + proposedTranslation.x < bounds.minX ) {
        allowedTranslation.setX( bounds.minX - leadingEdgeLines.verticalEdge.start.x );
      }
    }

    // y direction
    if ( proposedTranslation.y > 0 ) {
      if ( leadingEdgeLines.horizontalEdge.start.y + proposedTranslation.y > bounds.maxY ) {
        allowedTranslation.setY( bounds.maxY - leadingEdgeLines.horizontalEdge.start.y );
      }
    }
    else {
      if ( leadingEdgeLines.horizontalEdge.start.y + proposedTranslation.y < bounds.minY ) {
        allowedTranslation.setY( bounds.minY - leadingEdgeLines.horizontalEdge.start.y );
      }
    }

    return allowedTranslation;
  }

  /**
   * Get the edges of a rectangular object that is moving in a particular direction or that is being moved towards.
   * These edges are generally used to test for collisions between objects.
   * @param {Vector2} proposedTranslation
   * @param {Bounds2} objectBounds
   * @param {boolean} externalPerspective - If true, return the edges that would be encountered by something that was
   * moving towards this object in the direction indicated by the translation.  For example, if the translation
   * indicates motion that is down and to the right, the top and left edges are returned.  If false, an internal
   * perspective is assumed and the edges are provided as if the translation is occurring from *inside* the provided
   * rectangular object.
   * @returns {{horizontalEdge: Line, verticalEdge: Line}} - an object with horizontal and vertical edges
   * @private
   */
  getMotionEdges( proposedTranslation, objectBounds, externalPerspective = true ) {

    let horizontalEdge;
    let verticalEdge;

    if ( proposedTranslation.x > 0 && externalPerspective || proposedTranslation.x < 0 && !externalPerspective ) {

      // The needed edge is the left side of the object or container.
      verticalEdge = new Line(
        new Vector2( objectBounds.minX, objectBounds.minY ),
        new Vector2( objectBounds.minX, objectBounds.maxY )
      );
    }
    else {

      // The needed edge is the right side of the object or container.
      verticalEdge = new Line(
        new Vector2( objectBounds.maxX, objectBounds.minY ),
        new Vector2( objectBounds.maxX, objectBounds.maxY )
      );
    }

    if ( proposedTranslation.y > 0 && externalPerspective || proposedTranslation.y < 0 && !externalPerspective ) {

      // The needed edge is the top of the object or container (positive Y is in the downward direction).
      horizontalEdge = new Line(
        new Vector2( objectBounds.minX, objectBounds.minY ),
        new Vector2( objectBounds.maxX, objectBounds.minY )
      );
    }
    else {

      // The needed edge is the bottom of the object or container (positive Y is in the downward direction).
      horizontalEdge = new Line(
        new Vector2( objectBounds.minX, objectBounds.maxY ),
        new Vector2( objectBounds.maxX, objectBounds.maxY )
      );
    }

    return {
      horizontalEdge: horizontalEdge,
      verticalEdge: verticalEdge
    };
  }

  /**
   * Given a proposed translation, test whether the magnet can be translated by that amount without running into any
   * restricted areas or hitting the bounds.  If it can, the original proposed translation is returned.  If the magnet
   * would run into a restricted area or hit the bounds, return a translation that represents the amount of motion that
   * would move the magnet to the edge of the restriction.
   * @param {Vector2} proposedTranslation
   * @returns {Vector2}
   * @public
   */
  checkProposedMagnetMotion( proposedTranslation ) {

    // Get a set of lines that represent the leading edges of the magnet if it is moved using the proposed translation.
    const leadingMagnetEdges = this.getMotionEdges( proposedTranslation, this.magnet.getBounds(), false );

    // Make a list of the restricted bounds that could block the magnet's motion.  This varies based on which coils are
    // currently visible.
    let restrictedBoundsList = [ ...this.bottomCoilRestrictedBounds ];
    if ( this.topCoilVisibleProperty.value ) {
      restrictedBoundsList = this.bottomCoilRestrictedBounds.concat( this.topCoilRestrictedBounds );
    }

    // Test the proposed motion against the restricted bounds.
    let smallestAllowedTranslation = proposedTranslation.copy();
    restrictedBoundsList.forEach( restrictedBounds => {
      const obstacleEdgeLines = this.getMotionEdges( proposedTranslation, restrictedBounds );
      const allowedTranslation = this.checkMotionAgainstObstacles(
        leadingMagnetEdges,
        proposedTranslation,
        obstacleEdgeLines
      );
      if ( !allowedTranslation.equals( proposedTranslation ) ) {

        // An obstacle was encountered, so limit the allowed motion.
        if ( smallestAllowedTranslation.magnitude > allowedTranslation.magnitude ) {
          smallestAllowedTranslation = allowedTranslation;
        }
      }
    } );

    // Test against the edges of the sim area.
    smallestAllowedTranslation = this.checkMotionAgainstBounds(
      leadingMagnetEdges,
      smallestAllowedTranslation,
      this.bounds
    );

    return smallestAllowedTranslation;
  }

  /**
   * Move the magnet to the proposed position unless doing so would cause it to move through obstacles or out of the
   * sim bounds.  In those cases, limit the motion to what can be allowed.  This also fires emitters when the magnet
   * runs into a restricted area or the sim bounds.
   * @param {Vector2} proposedPosition - a proposed position for the magnet
   * @public
   */
  moveMagnetToPosition( proposedPosition ) {

    const proposedTranslation = proposedPosition.minus( this.magnet.positionProperty.value );

    // Test the proposed motion against the potential obstacles and the sim bounds.
    const allowedTranslation = this.checkProposedMagnetMotion( proposedTranslation );

    // Set the resultant position for the magnet.
    const newPosition = this.magnet.positionProperty.value.plus( allowedTranslation );
    this.magnet.positionProperty.set( newPosition );

    // Figure out what the bounds ended up being.
    const newMagnetBounds = this.magnet.getBounds();

    // Make a list of the active restricted bounds for testing whether the magnet has bumped up against any of them.
    let restrictedBoundsList = [ ...this.bottomCoilRestrictedBounds ];
    if ( this.topCoilVisibleProperty.value ) {
      restrictedBoundsList = this.bottomCoilRestrictedBounds.concat( this.topCoilRestrictedBounds );
    }

    // Check whether the position has changed such that the magnet has hit a boundary or a restricted area.
    if ( this.previousMagnetBounds ) {

      const magnetMotionBounds = this.bounds;

      // If the magnet is now up against the bounds, and it wasn't before, fire the edgeBumpEmitter.
      if ( ( this.previousMagnetBounds.maxX < magnetMotionBounds.maxX && newMagnetBounds.maxX >= magnetMotionBounds.maxX ) ||
           ( this.previousMagnetBounds.minX > magnetMotionBounds.minX && newMagnetBounds.minX <= magnetMotionBounds.minX ) ||
           ( this.previousMagnetBounds.maxY < magnetMotionBounds.maxY && newMagnetBounds.maxY >= magnetMotionBounds.maxY ) ||
           ( this.previousMagnetBounds.minY > magnetMotionBounds.minY && newMagnetBounds.minY <= magnetMotionBounds.minY )
      ) {
        this.edgeBumpEmitter.emit();
      }

      // Check whether any restricted bounds have been hit and fire an emitter if so.
      restrictedBoundsList.forEach( restrictedBounds => {
        if ( restrictedBounds.intersectsBounds( newMagnetBounds ) ) {
          if ( !restrictedBounds.intersectsBounds( this.previousMagnetBounds ) ) {

            // The magnet has come into contact with some restricted bounds with which it was NOT in contact during the
            // previous movement.  Emit the appropriate signal.
            if ( this.bottomCoilRestrictedBounds.includes( restrictedBounds ) ) {
              this.coilBumpEmitter.emit( CoilTypeEnum.FOUR_COIL );
            }
            else {
              this.coilBumpEmitter.emit( CoilTypeEnum.TWO_COIL );
            }
          }
        }
      } );
    }

    // Keep a record of the magnet bounds so that bumps can be detected.
    this.previousMagnetBounds = newMagnetBounds;
  }
}

faradaysLaw.register( 'FaradaysLawModel', FaradaysLawModel );
export default FaradaysLawModel;