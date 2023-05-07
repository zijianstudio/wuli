// Copyright 2019-2022, University of Colorado Boulder

/**
 * ElevationSceneModel is the model for the "Elevation" scene
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import LockToNumberLine from '../../../../number-line-common/js/common/model/LockToNumberLine.js';
import PointController from '../../../../number-line-common/js/common/model/PointController.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import { Color } from '../../../../scenery/js/imports.js';
import NLIConstants from '../../common/NLIConstants.js';
import numberLineIntegers from '../../numberLineIntegers.js';
import ElevationPointController from './ElevationPointController.js';
import SceneModel from './SceneModel.js';

// constants
const SCENE_BOUNDS = NLIConstants.NLI_LAYOUT_BOUNDS; // bounds for the scenes match the layout bounds

class ElevationSceneModel extends SceneModel {

  /**
   * @public
   */
  constructor() {

    const seaLevel = SCENE_BOUNDS.centerY + 10; // sea level in model coordinates
    const numberLineRange = new Range( -80, 100 ); // in meters

    // Define the bounds of the area where the interactive elevation area will be shown, values empirically determined
    // to match the design spec.
    const elevationAreaWidth = 600;
    const elevationAreaHeight = 430;
    const elevationAreaCenter = new Vector2(
      SCENE_BOUNDS.centerX,
      seaLevel - numberLineRange.getCenter() * elevationAreaHeight / numberLineRange.getLength()
    );
    const elevationAreaBounds = new Bounds2(
      elevationAreaCenter.x - elevationAreaWidth / 2,
      elevationAreaCenter.y - elevationAreaHeight / 2,
      elevationAreaCenter.x + elevationAreaWidth / 2,
      elevationAreaCenter.y + elevationAreaHeight / 2
    );

    super( {
      numberLineZeroPositions: [ new Vector2( elevationAreaBounds.minX / 2, seaLevel ) ],
      commonNumberLineOptions: {
        initialOrientation: Orientation.VERTICAL,
        initialDisplayedRange: numberLineRange,
        labelsInitiallyVisible: true,
        heightInModelSpace: elevationAreaHeight
      }
    } );

    // @public (read-only) {Bounds2} - bounds of the interactive elevation area
    this.elevationAreaBounds = elevationAreaBounds;

    // @public (read-only) {number} - sea level in model coordinates
    this.seaLevel = seaLevel;

    // Specify the position of the box that will hold the elevatable items.
    const boxWidth = elevationAreaWidth * 0.6;
    const boxHeight = ( SCENE_BOUNDS.maxY - elevationAreaBounds.maxY ) * 0.7;
    const boxCenter = new Vector2( elevationAreaCenter.x, ( SCENE_BOUNDS.maxY + elevationAreaBounds.maxY ) / 2 );

    // @public (read-only) {Bounds2} - holding area for the items that the user can elevate
    this.elevatableItemsBoxBounds = new Bounds2(
      boxCenter.x - boxWidth / 2,
      boxCenter.y - boxHeight / 2,
      boxCenter.x + boxWidth / 2,
      boxCenter.y + boxHeight / 2
    );

    // There is only one number line in this scene - create a local reference to it for convenience.
    const numberLine = this.numberLines[ 0 ];

    // @public (read-only) - the point controllers that can be moved into the elevation scene
    this.permanentPointControllers = [
      new ElevationPointController( numberLine, elevationAreaBounds, { color: new Color( '#EE3937' ) } ),
      new ElevationPointController( numberLine, elevationAreaBounds, { color: new Color( 'black' ) } ),
      new ElevationPointController( numberLine, elevationAreaBounds, { color: new Color( '#446ab7' ) } )
    ];

    // Put the permanent point controllers in their starting positions.
    this.permanentPointControllers.forEach( pointController => {
      this.putPointControllerInBox( pointController );
    } );

    // If the point controllers are released outside of the elevation areas, send them home.
    this.permanentPointControllers.forEach( pointController => {
      pointController.isDraggingProperty.lazyLink( isDragging => {
        if ( !isDragging &&
             !pointController.overElevationAreaProperty.value &&
             !pointController.isControllingNumberLinePoint() ) {
          this.putPointControllerInBox( pointController, true );
        }
      } );
    } );

    // @public (read-only) - array of point controllers that are attached to the number line when a corresponding
    // elevatable controller is over the elevation area
    this.numberLineAttachedPointControllers = createObservableArray();

    // Watch for points coming and going on the number line and add the additional point controllers for them.
    numberLine.residentPoints.addItemAddedListener( addedPoint => {

      addedPoint.numberLine = numberLine;

      // Add a point controller that will remain attached to the number line that will control this point.
      const pointController = new PointController( {
        color: addedPoint.colorProperty.value,
        lockToNumberLine: LockToNumberLine.ALWAYS,
        numberLinePoints: [ addedPoint ],
        numberLines: [ numberLine ]
      } );
      this.numberLineAttachedPointControllers.push( pointController );

      // Handle removal of this point from the number line.
      const handlePointRemoved = removedPoint => {
        if ( addedPoint === removedPoint ) {
          pointController.clearNumberLinePoints();
          pointController.dispose();
          numberLine.residentPoints.removeItemRemovedListener( handlePointRemoved );
          this.numberLineAttachedPointControllers.remove( pointController );
        }
      };
      numberLine.residentPoints.addItemRemovedListener( handlePointRemoved );
    } );
  }

  /**
   * Place the provided point controller into the holding box. This is generally done on init, reset, and when the user
   * "puts it away".
   * @param {ElevationPointController} pointController
   * @param {boolean} [animate] - controls whether to animate the return to the box or do it instantly
   * @private
   */
  putPointControllerInBox( pointController, animate = false ) {

    const index = this.permanentPointControllers.indexOf( pointController );
    const numPositions = this.permanentPointControllers.length;

    // error checking
    assert && assert( index >= 0, 'point controller not found on list' );
    assert && assert(
      !pointController.isControllingNumberLinePoint(),
      'point controller should not be put away while controlling a point'
    );

    const spacing = this.elevatableItemsBoxBounds.width / numPositions;
    const destination = new Vector2(
      this.elevatableItemsBoxBounds.minX + spacing / 2 + spacing * index,
      this.elevatableItemsBoxBounds.centerY
    );
    pointController.goToPosition( destination, animate );
  }

  /**
   * Restore initial state to the scene.
   * @override
   * @public
   */
  resetScene() {

    // Put the point controllers back into their starting positions.
    this.permanentPointControllers.forEach( pointController => {
      pointController.removeClearAndDisposePoints();
      this.putPointControllerInBox( pointController );
    } );
  }
}

numberLineIntegers.register( 'ElevationSceneModel', ElevationSceneModel );
export default ElevationSceneModel;