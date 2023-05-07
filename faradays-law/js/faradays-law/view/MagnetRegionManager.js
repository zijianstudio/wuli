// Copyright 2018-2022, University of Colorado Boulder


/**
 * Base type for handling accessibility alert and description logic associated with the position of the magnet. This
 * includes proximity to one or both coils, field strength at one or both coils, sim screen position, and coil
 * entrance/exit regions (informs the user of upper/lower coil position relative to the magnet).
 *
 * @author Michael Barlow (PhET Interactive Simulations)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import LinearFunction from '../../../../dot/js/LinearFunction.js';
import Utils from '../../../../dot/js/Utils.js';
import faradaysLaw from '../../faradaysLaw.js';
import FaradaysLawConstants from '../FaradaysLawConstants.js';
import MagnetDirectionEnum from '../model/MagnetDirectionEnum.js';
import CoilTypeEnum from './CoilTypeEnum.js';

// constants
const NUMBER_OF_ROWS = 3;
const EDGE_TOLERANCE = 5;
const VERTICAL_EDGE_TOLERANCE = Utils.roundSymmetric( FaradaysLawConstants.MAGNET_HEIGHT / 2 ) + EDGE_TOLERANCE;
const HORIZONTAL_EDGE_TOLERANCE = Utils.roundSymmetric( FaradaysLawConstants.MAGNET_WIDTH / 2 ) + EDGE_TOLERANCE;
const { LEFT, RIGHT } = MagnetDirectionEnum;
const SCREEN_MIDPOINT_X = FaradaysLawConstants.LAYOUT_BOUNDS.centerX;

const coilProximityToRegion = new LinearFunction( 95, 260, 1, 3, true ); // determined empirically from sim testing

const rowHeight = Utils.roundSymmetric( FaradaysLawConstants.LAYOUT_BOUNDS.getHeight() / NUMBER_OF_ROWS );
const columnWidth = Utils.roundSymmetric( FaradaysLawConstants.LAYOUT_BOUNDS.getWidth() / NUMBER_OF_ROWS );

// the distance the magnet must mofe in order for the extra prompt to be removed
const DISTANCE_MOVED_THRESHOLD = Utils.roundSymmetric( FaradaysLawConstants.LAYOUT_BOUNDS.width / 5 );

/**
 * Creates a new Bounds2 object centered on the privided vector.
 *
 * @param  {Vector2} vector the position on which to center the bounds
 * @returns {Bounds2}        the bounds of the magnet at the passed position
 */
const createMagnetBounds = vector => {
  const halfWidth = FaradaysLawConstants.MAGNET_WIDTH / 2;
  const halfHeight = FaradaysLawConstants.MAGNET_HEIGHT / 2;
  return new Bounds2(
    vector.x - halfWidth,
    vector.y - halfHeight,
    vector.x + halfWidth,
    vector.y + halfHeight
  );
};

class MagnetRegionManager {

  /**
   * The MagnetRegionManager class accepts an instance of the model for linking the appropriate properties and mapping to
   * numbers and strings for a11y-related alerts and descriptions. We watch model properties and update internal values
   * that can be accessed via public getters by other types.
   *
   * @param {Object} model  FaradaysLawModel
   */
  constructor( model ) {

    this.model = model;
    this.magnet = model.magnet;
    this.topCoil = model.topCoil;
    this.bottomCoil = model.bottomCoil;
    this.bounds = model.bounds;
    this.showExtraMoveText = true; // for displaying detailed magnet movement instructions
    this.magnetIsAnimating = false;
    this.magnetStoppedByKeyboard = false;

    // @private
    // generate bounds to indicate if magnet is inside the coil
    this._topCoilInnerBounds = new Bounds2(
      Math.max( model.topCoilRestrictedBounds[ 0 ].minX, model.topCoilRestrictedBounds[ 1 ].minX ),
      Math.min( model.topCoilRestrictedBounds[ 0 ].maxY, model.topCoilRestrictedBounds[ 1 ].maxY ),
      Math.min( model.topCoilRestrictedBounds[ 0 ].maxX, model.topCoilRestrictedBounds[ 1 ].maxX ),
      Math.max( model.topCoilRestrictedBounds[ 0 ].minY, model.topCoilRestrictedBounds[ 1 ].minY )
    ).eroded( 2 );

    // @private
    this._bottomCoilInnerBounds = new Bounds2(
      Math.max( model.bottomCoilRestrictedBounds[ 0 ].minX, model.bottomCoilRestrictedBounds[ 1 ].minX ),
      Math.min( model.bottomCoilRestrictedBounds[ 0 ].maxY, model.bottomCoilRestrictedBounds[ 1 ].maxY ),
      Math.min( model.bottomCoilRestrictedBounds[ 0 ].maxX, model.bottomCoilRestrictedBounds[ 1 ].maxX ),
      Math.max( model.bottomCoilRestrictedBounds[ 0 ].minY, model.bottomCoilRestrictedBounds[ 1 ].minY )
    ).eroded( 2 );

    // @private
    // TODO: adjust setting this based on magnet and coil bounds instead of position
    this._adjacentCoil = CoilTypeEnum.NO_COIL;
    this._touchingCoil =
      this._magnetScreenSide = 'right';
    this._positionRegion = this.getPositionRegion( model.magnet.positionProperty.get() );
    this._topCoilProximity = 0;
    this._bottomCoilProximity = 0;
    this._topCoilFieldStrength = 0;
    this._bottomCoilFiledStrength = 0;

    Multilink.multilink(
      [ model.topCoilVisibleProperty, model.magnet.positionProperty ],
      ( showTopCoil, position ) => {
        this._adjacentCoil = this.getCoilAdjacentToVector( position, showTopCoil );
      }
    );

    let distanceMoved = 0;

    model.magnet.positionProperty.link( ( position, oldPosition ) => {
      this._positionRegion = this.getPositionRegion( position );

      if ( oldPosition && this.showExtraMoveText ) {
        const delta = position.distance( oldPosition );
        distanceMoved += delta;
        this.showExtraMoveText = distanceMoved < DISTANCE_MOVED_THRESHOLD;
      }

      this._magnetScreenSide = position.x >= SCREEN_MIDPOINT_X ? 'right' : 'left';
      this._magnetInCoil = !this.getTopCoilProximityRegion( position ) || !this.getBottomCoilProximityRegion( position );
    } );
  }

  /*****************************************************************************
   * Magnet position region methods for adjacent coil and sim screen position. *
   *****************************************************************************/

  /**
   * Returns the index of the intersected coil region or -1 on error.
   * @public
   *
   * @returns {Number}
   */
  getTouchingCoil() {
    const coilSides = [
      { side: 'top', coil: CoilTypeEnum.TWO_COIL },
      { side: 'bottom', coil: CoilTypeEnum.TWO_COIL },
      { side: 'top', coil: CoilTypeEnum.FOUR_COIL },
      { side: 'bottom', coil: CoilTypeEnum.FOUR_COIL }
    ];
    const intersectedBounds = this.model.getIntersectedRestrictedBounds( createMagnetBounds( this.magnet.positionProperty.value ) );
    const listOfRestrictedBounds = this.model.bottomCoilRestrictedBounds.concat( this.model.topCoilRestrictedBounds );
    const i = listOfRestrictedBounds.indexOf( intersectedBounds );

    // TODO: The code below looks wrong.  The return type doesn't match the header docs, and the whole thing is too
    //  tightly coupled to the way bounds are managed in the model.  See
    // https://github.com/phetsims/faradays-law/issues/164. Also, it seems like it should return null instead of -1 if
    // no intersection is found.

    if ( i >= 0 ) {
      return coilSides[ i ];
    }
    else {
      return i;
    }
  }

  /**
   * Get the current value of the adjacent coil.
   * @public
   *
   * @returns {String}
   */
  get adjacentCoil() {
    return this._adjacentCoil;
  }

  /**
   * Get the side of the sim screen containing the magnet. The midpoint is set to the 'right' side.
   * @public
   *
   * @returns {String}
   */
  get magnetScreenSide() {
    return this._magnetScreenSide;
  }

  /**
   * Returns true if the magnet intersect the bounds of a coil. Used in conjunction with 'adjacentCoil'.
   * @public
   *
   * @returns {String}
   */
  get magnetInCoil() {
    return this._magnetInCoil;
  }

  /**
   * @public
   * @returns {boolean}
   */
  get magnetInOrVeryCloseToCoil() {
    return this.magnetToBottomCoilProximity <= 1 ||
           ( this.model.topCoilVisibleProperty.get() && this.magnetToTopCoilProximity <= 1 );
  }

  /**
   * Get the coil whose inner vertical bounds contain the y value of the given vector.
   *
   * @private
   * @param  {Vector2} vector
   * @returns {String}
   */
  getCoilAdjacentToVector( vector, showTopCoil ) {
    const y = vector.y;

    if ( showTopCoil && y <= this._topCoilInnerBounds.maxY && y >= this._topCoilInnerBounds.minY ) {
      return CoilTypeEnum.TWO_COIL;
    }

    if ( y <= this._bottomCoilInnerBounds.maxY && y >= this._bottomCoilInnerBounds.minY ) {
      return CoilTypeEnum.FOUR_COIL;
    }

    return CoilTypeEnum.NO_COIL;
  }

  /**
   * Get the current region, one of 0..9
   *
   * @returns {int}
   */
  get positionRegion() {
    return this._positionRegion;
  }

  /**
   * Get the region of the screen that contains the provided vector. For Faraday's Law, the screen is divided into 9
   * regions that are numbered 0 - 8 in row major order, left to right.
   * @public
   *
   * @param  {Vector2} vector
   * @returns {int}
   */
  getPositionRegion( { x, y } ) {
    return ( NUMBER_OF_ROWS * MagnetRegionManager.getRow( y ) ) + MagnetRegionManager.getColumn( x );
  }

  get magnetAtEdge() {
    return this.isVectorAtEdge( this.magnet.positionProperty.get() );
  }

  /**
   * @public
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  isVectorAtEdge( { x, y } ) {
    const { minX, minY, maxX, maxY } = this.bounds;
    const verticalMinDistance = Math.min( Math.abs( y - minY ), Math.abs( y - maxY ) );
    const horizontalMinDistance = Math.min( Math.abs( x - minX ), Math.abs( x - maxX ) );

    return verticalMinDistance <= VERTICAL_EDGE_TOLERANCE || horizontalMinDistance <= HORIZONTAL_EDGE_TOLERANCE;
  }

  /**
   * @public
   * @returns {MagnetDirectionEnum}
   */
  get coilDirection() {
    const coilsCenterX = this.topCoil.position.x + ( this.bottomCoil.position.x - this.topCoil.position.x ) / 2;
    return ( this.magnet.positionProperty.get().x - coilsCenterX ) < 0 ? RIGHT : LEFT;
  }

  /**
   * @public
   * @param {Vector2} vector
   * @returns {string}
   */
  getBottomCoilDirection( vector ) {
    return ( vector.x - this.bottomCoil.position ) < 0 ? RIGHT : LEFT;
  }

  /**
   * @public
   * @returns {number}
   */
  get magnetToTopCoilProximity() {
    return this.getTopCoilProximityRegion( this.magnet.positionProperty.get() );
  }

  /**
   * @public
   * @returns {number}
   */
  get magnetToBottomCoilProximity() {
    return this.getBottomCoilProximityRegion( this.magnet.positionProperty.get() );
  }

  /**
   * @public
   * @param Vector2
   * @returns {number}
   */
  getTopCoilProximityRegion( vector ) {
    if ( !this.model.topCoilVisibleProperty.get() ) {
      return -1;
    }
    return this.getCoilProximityRegion( vector, CoilTypeEnum.TWO_COIL );
  }

  /**
   * @public
   * @param {Vector2} vector
   * @returns {number}
   */
  getBottomCoilProximityRegion( vector ) {
    return this.getCoilProximityRegion( vector, CoilTypeEnum.FOUR_COIL );
  }

  /**
   * @public
   * @param {Vector2} vector
   * @param {CoilTypeEnum} coilType
   * @returns {number}
   */
  getCoilProximityRegion( vector, coilType ) {
    const magnetBounds = createMagnetBounds( vector );
    const coilBounds = coilType === CoilTypeEnum.TWO_COIL ? this._topCoilInnerBounds : this._bottomCoilInnerBounds;

    if ( coilBounds.intersectsBounds( magnetBounds ) ) {
      return 0;
    }

    const distance = this.getDistanceToCoil( vector, coilType );

    return Utils.roundSymmetric( coilProximityToRegion.evaluate( distance ) );
  }

  /**
   * @public
   * @param position
   * @param coilType
   * @returns {number}
   */
  getDistanceToCoil( position, coilType ) {
    const coilPosition = coilType === CoilTypeEnum.TWO_COIL ? this.topCoil.position : this.bottomCoil.position;
    return position.distance( coilPosition );
  }

  /**
   * @public
   * @returns {number}
   */
  getTopCoilFieldStrengthRegion() {
    return this.getFieldStrengthAtCoilRegion( this.topCoil );
  }

  /**
   * @public
   * @returns {number}
   */
  getBottomCoilFieldStrengthRegion() {
    return this.getFieldStrengthAtCoilRegion( this.bottomCoil );
  }

  /**
   * @public
   * @param {Coil} coil
   * @returns {number}
   */
  getFieldStrengthAtCoilRegion( coil ) {
    if ( coil.position.distance( this.magnet.positionProperty.get() ) < 70 ) {
      return 4;
    }

    const fieldStrength = coil.magneticFieldProperty.get();

    return MagnetRegionManager.mapFieldStrengthToInteger( Math.abs( fieldStrength ) );
  }

  /**
   * @public
   */
  stopMagnetAnimationWithKeyboard() {
    this.magnetStoppedByKeyboard = true;
    this.magnetIsAnimating = false;
  }

  /**
   * @public
   * @param isAnimating
   */
  setMagnetIsAnimating( isAnimating ) {
    this.magnetIsAnimating = isAnimating;
  }

  /**
   * @public
   */
  resetKeyboardStop() {
    this.magnetStoppedByKeyboard = false;
  }

  /**
   * Get the 0-based row number for a y coordinate.
   * @public
   * @param  {Number} y
   * @returns {int}
   */
  static getRow( y ) {
    return MagnetRegionManager.mapSegment( y, rowHeight );
  }

  /**
   * Get the 0-based column number for an x coordinate.
   * @public
   * @param  {Number} x
   * @returns {int}
   */
  static getColumn( x ) {
    return MagnetRegionManager.mapSegment( x, columnWidth );
  }

  /**
   * Maps a given number to a given segment number based on the size of the segment. This function assumes that there
   * are an equal number of rows and columns.
   * @public
   *
   * @param  {Number} value
   * @param  {Number} segmentSize
   * @returns {int}
   */
  static mapSegment( value, segmentSize ) {
    for ( let i = 0; i < NUMBER_OF_ROWS; i++ ) {
      if ( value <= ( i + 1 ) * segmentSize ) {
        return i;
      }
    }
    return NUMBER_OF_ROWS - 1;
  }

  /**
   * @public
   * @param {number} fieldStrength
   * @returns {number}
   */
  static mapFieldStrengthToInteger( fieldStrength ) {
    if ( fieldStrength < 0.025 ) {
      return 0;
    }
    else if ( fieldStrength >= 0.025 && fieldStrength < 0.04 ) {
      return 1;
    }
    else if ( fieldStrength >= 0.04 && fieldStrength < 0.075 ) {
      return 2;
    }
    else if ( fieldStrength >= 0.075 && fieldStrength < 0.18 ) {
      return 3;
    }
    else {
      return 4;
    }
  }
}

faradaysLaw.register( 'MagnetRegionManager', MagnetRegionManager );
export default MagnetRegionManager;
