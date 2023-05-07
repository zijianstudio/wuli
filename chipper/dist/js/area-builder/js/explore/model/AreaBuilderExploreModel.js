// Copyright 2014-2022, University of Colorado Boulder

/**
 * Primary model class for the 'Explore' screen of the Area Builder simulation.
 *
 * @author John Blanco
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import Bucket from '../../../../phetcommon/js/model/Bucket.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../../common/AreaBuilderSharedConstants.js';
import MovableShape from '../../common/model/MovableShape.js';
import ShapePlacementBoard from '../../common/model/ShapePlacementBoard.js';

// constants
const UNIT_SQUARE_LENGTH = AreaBuilderSharedConstants.UNIT_SQUARE_LENGTH;
const UNIT_SQUARE_SHAPE = Shape.rect(0, 0, UNIT_SQUARE_LENGTH, UNIT_SQUARE_LENGTH);
const SMALL_BOARD_SIZE = new Dimension2(UNIT_SQUARE_LENGTH * 9, UNIT_SQUARE_LENGTH * 8);
const LARGE_BOARD_SIZE = new Dimension2(UNIT_SQUARE_LENGTH * 19, UNIT_SQUARE_LENGTH * 8);
const PLAY_AREA_WIDTH = AreaBuilderSharedConstants.LAYOUT_BOUNDS.width;
const SPACE_BETWEEN_PLACEMENT_BOARDS = UNIT_SQUARE_LENGTH;
const BOARD_Y_POS = 70; // Empirically determined from looking at the layout
const BUCKET_SIZE = new Dimension2(90, 45);
const BOARD_TO_BUCKET_Y_SPACING = 45;
class AreaBuilderExploreModel {
  constructor() {
    this.showShapeBoardGridsProperty = new Property(true); // @public
    this.showDimensionsProperty = new Property(true); // @public
    this.boardDisplayModeProperty = new StringProperty('single'); // @public, value values are 'single' and 'dual'

    this.movableShapes = createObservableArray(); // @public
    this.unitSquareLength = UNIT_SQUARE_LENGTH; // @public, @final

    // Create the shape placement boards. Each boardDisplayMode has its own set of boards and buckets so that state can
    // be preserved when switching modes.
    this.leftShapePlacementBoard = new ShapePlacementBoard(SMALL_BOARD_SIZE, UNIT_SQUARE_LENGTH, new Vector2(PLAY_AREA_WIDTH / 2 - SPACE_BETWEEN_PLACEMENT_BOARDS / 2 - SMALL_BOARD_SIZE.width, BOARD_Y_POS), AreaBuilderSharedConstants.GREENISH_COLOR, this.showShapeBoardGridsProperty, this.showDimensionsProperty); // @public
    this.rightShapePlacementBoard = new ShapePlacementBoard(SMALL_BOARD_SIZE, UNIT_SQUARE_LENGTH, new Vector2(PLAY_AREA_WIDTH / 2 + SPACE_BETWEEN_PLACEMENT_BOARDS / 2, BOARD_Y_POS), AreaBuilderSharedConstants.PURPLISH_COLOR, this.showShapeBoardGridsProperty, this.showDimensionsProperty); // @public
    this.singleShapePlacementBoard = new ShapePlacementBoard(LARGE_BOARD_SIZE, UNIT_SQUARE_LENGTH, new Vector2(PLAY_AREA_WIDTH / 2 - LARGE_BOARD_SIZE.width / 2, BOARD_Y_POS), AreaBuilderSharedConstants.ORANGISH_COLOR, this.showShapeBoardGridsProperty, this.showDimensionsProperty); // @public

    // @private, for convenience.
    this.shapePlacementBoards = [this.leftShapePlacementBoard, this.rightShapePlacementBoard, this.singleShapePlacementBoard];

    // Create the buckets that will hold the shapes.
    const bucketYPos = this.leftShapePlacementBoard.bounds.minY + SMALL_BOARD_SIZE.height + BOARD_TO_BUCKET_Y_SPACING;
    this.leftBucket = new Bucket({
      position: new Vector2(this.leftShapePlacementBoard.bounds.minX + SMALL_BOARD_SIZE.width * 0.7, bucketYPos),
      baseColor: '#000080',
      size: BUCKET_SIZE,
      invertY: true
    });
    this.rightBucket = new Bucket({
      position: new Vector2(this.rightShapePlacementBoard.bounds.minX + SMALL_BOARD_SIZE.width * 0.3, bucketYPos),
      baseColor: '#000080',
      size: BUCKET_SIZE,
      invertY: true
    });
    this.singleModeBucket = new Bucket({
      position: new Vector2(this.singleShapePlacementBoard.bounds.minX + LARGE_BOARD_SIZE.width / 2, bucketYPos),
      baseColor: '#000080',
      size: BUCKET_SIZE,
      invertY: true
    });
  }

  /**
   * @param {number} dt
   * @public
   */
  step(dt) {
    this.movableShapes.forEach(movableShape => {
      movableShape.step(dt);
    });
  }

  /**
   * @param movableShape
   * @private
   */
  placeShape(movableShape) {
    let shapePlaced = false;
    for (let i = 0; i < this.shapePlacementBoards.length && !shapePlaced; i++) {
      shapePlaced = this.shapePlacementBoards[i].placeShape(movableShape);
    }
    if (!shapePlaced) {
      movableShape.returnToOrigin(true);
    }
  }

  /**
   * Function for adding new movable shapes to this model when the user creates them, generally by clicking on some
   * some sort of creator node.
   * @public
   * @param movableShape
   */
  addUserCreatedMovableShape(movableShape) {
    const self = this;
    this.movableShapes.push(movableShape);
    movableShape.userControlledProperty.link(userControlled => {
      if (!userControlled) {
        this.placeShape(movableShape);
      }
    });

    // The shape will be removed from the model if and when it returns to its origination point.  This is how a shape
    // can be 'put back' into the bucket.
    movableShape.returnedToOriginEmitter.addListener(() => {
      if (!movableShape.userControlledProperty.get()) {
        // The shape has been returned to the bucket.
        this.movableShapes.remove(movableShape);
      }
    });

    // Another point at which the shape is removed is if it fades away.
    movableShape.fadeProportionProperty.link(function fadeHandler(fadeProportion) {
      if (fadeProportion === 1) {
        self.movableShapes.remove(movableShape);
        movableShape.fadeProportionProperty.unlink(fadeHandler);
      }
    });
  }

  /**
   * fill the boards with unit squares, useful for debugging, not used in general operation of the sim
   * @public
   */
  fillBoards() {
    this.shapePlacementBoards.forEach(board => {
      const numRows = board.bounds.height / UNIT_SQUARE_LENGTH;
      const numColumns = board.bounds.width / UNIT_SQUARE_LENGTH;
      let movableShape;
      let shapeOrigin;
      if (board === this.leftShapePlacementBoard) {
        shapeOrigin = this.leftBucket.position;
      } else if (board === this.rightShapePlacementBoard) {
        shapeOrigin = this.rightBucket.position;
      } else {
        shapeOrigin = this.singleModeBucket.position;
      }
      _.times(numColumns, columnIndex => {
        _.times(numRows, rowIndex => {
          movableShape = new MovableShape(UNIT_SQUARE_SHAPE, board.colorHandled, shapeOrigin);
          movableShape.positionProperty.set(new Vector2(board.bounds.minX + columnIndex * UNIT_SQUARE_LENGTH, board.bounds.minY + rowIndex * UNIT_SQUARE_LENGTH));
          this.addUserCreatedMovableShape(movableShape);
        });
      });
    });
  }

  /**
   * Resets all model elements
   * @public
   */
  reset() {
    this.showShapeBoardGridsProperty.reset();
    this.showDimensionsProperty.reset();
    this.boardDisplayModeProperty.reset();
    this.shapePlacementBoards.forEach(board => {
      board.releaseAllShapes('jumpHome');
    });
    this.movableShapes.clear();
  }
}
areaBuilder.register('AreaBuilderExploreModel', AreaBuilderExploreModel);
export default AreaBuilderExploreModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJQcm9wZXJ0eSIsIlN0cmluZ1Byb3BlcnR5IiwiRGltZW5zaW9uMiIsIlZlY3RvcjIiLCJTaGFwZSIsIkJ1Y2tldCIsImFyZWFCdWlsZGVyIiwiQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMiLCJNb3ZhYmxlU2hhcGUiLCJTaGFwZVBsYWNlbWVudEJvYXJkIiwiVU5JVF9TUVVBUkVfTEVOR1RIIiwiVU5JVF9TUVVBUkVfU0hBUEUiLCJyZWN0IiwiU01BTExfQk9BUkRfU0laRSIsIkxBUkdFX0JPQVJEX1NJWkUiLCJQTEFZX0FSRUFfV0lEVEgiLCJMQVlPVVRfQk9VTkRTIiwid2lkdGgiLCJTUEFDRV9CRVRXRUVOX1BMQUNFTUVOVF9CT0FSRFMiLCJCT0FSRF9ZX1BPUyIsIkJVQ0tFVF9TSVpFIiwiQk9BUkRfVE9fQlVDS0VUX1lfU1BBQ0lORyIsIkFyZWFCdWlsZGVyRXhwbG9yZU1vZGVsIiwiY29uc3RydWN0b3IiLCJzaG93U2hhcGVCb2FyZEdyaWRzUHJvcGVydHkiLCJzaG93RGltZW5zaW9uc1Byb3BlcnR5IiwiYm9hcmREaXNwbGF5TW9kZVByb3BlcnR5IiwibW92YWJsZVNoYXBlcyIsInVuaXRTcXVhcmVMZW5ndGgiLCJsZWZ0U2hhcGVQbGFjZW1lbnRCb2FyZCIsIkdSRUVOSVNIX0NPTE9SIiwicmlnaHRTaGFwZVBsYWNlbWVudEJvYXJkIiwiUFVSUExJU0hfQ09MT1IiLCJzaW5nbGVTaGFwZVBsYWNlbWVudEJvYXJkIiwiT1JBTkdJU0hfQ09MT1IiLCJzaGFwZVBsYWNlbWVudEJvYXJkcyIsImJ1Y2tldFlQb3MiLCJib3VuZHMiLCJtaW5ZIiwiaGVpZ2h0IiwibGVmdEJ1Y2tldCIsInBvc2l0aW9uIiwibWluWCIsImJhc2VDb2xvciIsInNpemUiLCJpbnZlcnRZIiwicmlnaHRCdWNrZXQiLCJzaW5nbGVNb2RlQnVja2V0Iiwic3RlcCIsImR0IiwiZm9yRWFjaCIsIm1vdmFibGVTaGFwZSIsInBsYWNlU2hhcGUiLCJzaGFwZVBsYWNlZCIsImkiLCJsZW5ndGgiLCJyZXR1cm5Ub09yaWdpbiIsImFkZFVzZXJDcmVhdGVkTW92YWJsZVNoYXBlIiwic2VsZiIsInB1c2giLCJ1c2VyQ29udHJvbGxlZFByb3BlcnR5IiwibGluayIsInVzZXJDb250cm9sbGVkIiwicmV0dXJuZWRUb09yaWdpbkVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImdldCIsInJlbW92ZSIsImZhZGVQcm9wb3J0aW9uUHJvcGVydHkiLCJmYWRlSGFuZGxlciIsImZhZGVQcm9wb3J0aW9uIiwidW5saW5rIiwiZmlsbEJvYXJkcyIsImJvYXJkIiwibnVtUm93cyIsIm51bUNvbHVtbnMiLCJzaGFwZU9yaWdpbiIsIl8iLCJ0aW1lcyIsImNvbHVtbkluZGV4Iiwicm93SW5kZXgiLCJjb2xvckhhbmRsZWQiLCJwb3NpdGlvblByb3BlcnR5Iiwic2V0IiwicmVzZXQiLCJyZWxlYXNlQWxsU2hhcGVzIiwiY2xlYXIiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkFyZWFCdWlsZGVyRXhwbG9yZU1vZGVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFByaW1hcnkgbW9kZWwgY2xhc3MgZm9yIHRoZSAnRXhwbG9yZScgc2NyZWVuIG9mIHRoZSBBcmVhIEJ1aWxkZXIgc2ltdWxhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBTdHJpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1N0cmluZ1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEJ1Y2tldCBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL21vZGVsL0J1Y2tldC5qcyc7XHJcbmltcG9ydCBhcmVhQnVpbGRlciBmcm9tICcuLi8uLi9hcmVhQnVpbGRlci5qcyc7XHJcbmltcG9ydCBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgTW92YWJsZVNoYXBlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9Nb3ZhYmxlU2hhcGUuanMnO1xyXG5pbXBvcnQgU2hhcGVQbGFjZW1lbnRCb2FyZCBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvU2hhcGVQbGFjZW1lbnRCb2FyZC5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgVU5JVF9TUVVBUkVfTEVOR1RIID0gQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuVU5JVF9TUVVBUkVfTEVOR1RIO1xyXG5jb25zdCBVTklUX1NRVUFSRV9TSEFQRSA9IFNoYXBlLnJlY3QoIDAsIDAsIFVOSVRfU1FVQVJFX0xFTkdUSCwgVU5JVF9TUVVBUkVfTEVOR1RIICk7XHJcbmNvbnN0IFNNQUxMX0JPQVJEX1NJWkUgPSBuZXcgRGltZW5zaW9uMiggVU5JVF9TUVVBUkVfTEVOR1RIICogOSwgVU5JVF9TUVVBUkVfTEVOR1RIICogOCApO1xyXG5jb25zdCBMQVJHRV9CT0FSRF9TSVpFID0gbmV3IERpbWVuc2lvbjIoIFVOSVRfU1FVQVJFX0xFTkdUSCAqIDE5LCBVTklUX1NRVUFSRV9MRU5HVEggKiA4ICk7XHJcbmNvbnN0IFBMQVlfQVJFQV9XSURUSCA9IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLkxBWU9VVF9CT1VORFMud2lkdGg7XHJcbmNvbnN0IFNQQUNFX0JFVFdFRU5fUExBQ0VNRU5UX0JPQVJEUyA9IFVOSVRfU1FVQVJFX0xFTkdUSDtcclxuY29uc3QgQk9BUkRfWV9QT1MgPSA3MDsgLy8gRW1waXJpY2FsbHkgZGV0ZXJtaW5lZCBmcm9tIGxvb2tpbmcgYXQgdGhlIGxheW91dFxyXG5jb25zdCBCVUNLRVRfU0laRSA9IG5ldyBEaW1lbnNpb24yKCA5MCwgNDUgKTtcclxuY29uc3QgQk9BUkRfVE9fQlVDS0VUX1lfU1BBQ0lORyA9IDQ1O1xyXG5cclxuY2xhc3MgQXJlYUJ1aWxkZXJFeHBsb3JlTW9kZWwge1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICB0aGlzLnNob3dTaGFwZUJvYXJkR3JpZHNQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggdHJ1ZSApOyAvLyBAcHVibGljXHJcbiAgICB0aGlzLnNob3dEaW1lbnNpb25zUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIHRydWUgKTsgLy8gQHB1YmxpY1xyXG4gICAgdGhpcy5ib2FyZERpc3BsYXlNb2RlUHJvcGVydHkgPSBuZXcgU3RyaW5nUHJvcGVydHkoICdzaW5nbGUnICk7IC8vIEBwdWJsaWMsIHZhbHVlIHZhbHVlcyBhcmUgJ3NpbmdsZScgYW5kICdkdWFsJ1xyXG5cclxuICAgIHRoaXMubW92YWJsZVNoYXBlcyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpOyAvLyBAcHVibGljXHJcbiAgICB0aGlzLnVuaXRTcXVhcmVMZW5ndGggPSBVTklUX1NRVUFSRV9MRU5HVEg7IC8vIEBwdWJsaWMsIEBmaW5hbFxyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgc2hhcGUgcGxhY2VtZW50IGJvYXJkcy4gRWFjaCBib2FyZERpc3BsYXlNb2RlIGhhcyBpdHMgb3duIHNldCBvZiBib2FyZHMgYW5kIGJ1Y2tldHMgc28gdGhhdCBzdGF0ZSBjYW5cclxuICAgIC8vIGJlIHByZXNlcnZlZCB3aGVuIHN3aXRjaGluZyBtb2Rlcy5cclxuICAgIHRoaXMubGVmdFNoYXBlUGxhY2VtZW50Qm9hcmQgPSBuZXcgU2hhcGVQbGFjZW1lbnRCb2FyZChcclxuICAgICAgU01BTExfQk9BUkRfU0laRSxcclxuICAgICAgVU5JVF9TUVVBUkVfTEVOR1RILFxyXG4gICAgICBuZXcgVmVjdG9yMiggUExBWV9BUkVBX1dJRFRIIC8gMiAtIFNQQUNFX0JFVFdFRU5fUExBQ0VNRU5UX0JPQVJEUyAvIDIgLSBTTUFMTF9CT0FSRF9TSVpFLndpZHRoLCBCT0FSRF9ZX1BPUyApLFxyXG4gICAgICBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5HUkVFTklTSF9DT0xPUixcclxuICAgICAgdGhpcy5zaG93U2hhcGVCb2FyZEdyaWRzUHJvcGVydHksXHJcbiAgICAgIHRoaXMuc2hvd0RpbWVuc2lvbnNQcm9wZXJ0eVxyXG4gICAgKTsgLy8gQHB1YmxpY1xyXG4gICAgdGhpcy5yaWdodFNoYXBlUGxhY2VtZW50Qm9hcmQgPSBuZXcgU2hhcGVQbGFjZW1lbnRCb2FyZChcclxuICAgICAgU01BTExfQk9BUkRfU0laRSxcclxuICAgICAgVU5JVF9TUVVBUkVfTEVOR1RILFxyXG4gICAgICBuZXcgVmVjdG9yMiggUExBWV9BUkVBX1dJRFRIIC8gMiArIFNQQUNFX0JFVFdFRU5fUExBQ0VNRU5UX0JPQVJEUyAvIDIsIEJPQVJEX1lfUE9TICksXHJcbiAgICAgIEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLlBVUlBMSVNIX0NPTE9SLFxyXG4gICAgICB0aGlzLnNob3dTaGFwZUJvYXJkR3JpZHNQcm9wZXJ0eSxcclxuICAgICAgdGhpcy5zaG93RGltZW5zaW9uc1Byb3BlcnR5XHJcbiAgICApOyAvLyBAcHVibGljXHJcbiAgICB0aGlzLnNpbmdsZVNoYXBlUGxhY2VtZW50Qm9hcmQgPSBuZXcgU2hhcGVQbGFjZW1lbnRCb2FyZChcclxuICAgICAgTEFSR0VfQk9BUkRfU0laRSxcclxuICAgICAgVU5JVF9TUVVBUkVfTEVOR1RILFxyXG4gICAgICBuZXcgVmVjdG9yMiggUExBWV9BUkVBX1dJRFRIIC8gMiAtIExBUkdFX0JPQVJEX1NJWkUud2lkdGggLyAyLCBCT0FSRF9ZX1BPUyApLFxyXG4gICAgICBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5PUkFOR0lTSF9DT0xPUixcclxuICAgICAgdGhpcy5zaG93U2hhcGVCb2FyZEdyaWRzUHJvcGVydHksXHJcbiAgICAgIHRoaXMuc2hvd0RpbWVuc2lvbnNQcm9wZXJ0eVxyXG4gICAgKTsgLy8gQHB1YmxpY1xyXG5cclxuICAgIC8vIEBwcml2YXRlLCBmb3IgY29udmVuaWVuY2UuXHJcbiAgICB0aGlzLnNoYXBlUGxhY2VtZW50Qm9hcmRzID0gWyB0aGlzLmxlZnRTaGFwZVBsYWNlbWVudEJvYXJkLCB0aGlzLnJpZ2h0U2hhcGVQbGFjZW1lbnRCb2FyZCwgdGhpcy5zaW5nbGVTaGFwZVBsYWNlbWVudEJvYXJkIF07XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBidWNrZXRzIHRoYXQgd2lsbCBob2xkIHRoZSBzaGFwZXMuXHJcbiAgICBjb25zdCBidWNrZXRZUG9zID0gdGhpcy5sZWZ0U2hhcGVQbGFjZW1lbnRCb2FyZC5ib3VuZHMubWluWSArIFNNQUxMX0JPQVJEX1NJWkUuaGVpZ2h0ICsgQk9BUkRfVE9fQlVDS0VUX1lfU1BBQ0lORztcclxuICAgIHRoaXMubGVmdEJ1Y2tldCA9IG5ldyBCdWNrZXQoIHtcclxuICAgICAgcG9zaXRpb246IG5ldyBWZWN0b3IyKCB0aGlzLmxlZnRTaGFwZVBsYWNlbWVudEJvYXJkLmJvdW5kcy5taW5YICsgU01BTExfQk9BUkRfU0laRS53aWR0aCAqIDAuNywgYnVja2V0WVBvcyApLFxyXG4gICAgICBiYXNlQ29sb3I6ICcjMDAwMDgwJyxcclxuICAgICAgc2l6ZTogQlVDS0VUX1NJWkUsXHJcbiAgICAgIGludmVydFk6IHRydWVcclxuICAgIH0gKTtcclxuICAgIHRoaXMucmlnaHRCdWNrZXQgPSBuZXcgQnVja2V0KCB7XHJcbiAgICAgIHBvc2l0aW9uOiBuZXcgVmVjdG9yMiggdGhpcy5yaWdodFNoYXBlUGxhY2VtZW50Qm9hcmQuYm91bmRzLm1pblggKyBTTUFMTF9CT0FSRF9TSVpFLndpZHRoICogMC4zLCBidWNrZXRZUG9zICksXHJcbiAgICAgIGJhc2VDb2xvcjogJyMwMDAwODAnLFxyXG4gICAgICBzaXplOiBCVUNLRVRfU0laRSxcclxuICAgICAgaW52ZXJ0WTogdHJ1ZVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5zaW5nbGVNb2RlQnVja2V0ID0gbmV3IEJ1Y2tldCgge1xyXG4gICAgICBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIHRoaXMuc2luZ2xlU2hhcGVQbGFjZW1lbnRCb2FyZC5ib3VuZHMubWluWCArIExBUkdFX0JPQVJEX1NJWkUud2lkdGggLyAyLCBidWNrZXRZUG9zICksXHJcbiAgICAgIGJhc2VDb2xvcjogJyMwMDAwODAnLFxyXG4gICAgICBzaXplOiBCVUNLRVRfU0laRSxcclxuICAgICAgaW52ZXJ0WTogdHJ1ZVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG4gICAgdGhpcy5tb3ZhYmxlU2hhcGVzLmZvckVhY2goIG1vdmFibGVTaGFwZSA9PiB7IG1vdmFibGVTaGFwZS5zdGVwKCBkdCApOyB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gbW92YWJsZVNoYXBlXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBwbGFjZVNoYXBlKCBtb3ZhYmxlU2hhcGUgKSB7XHJcbiAgICBsZXQgc2hhcGVQbGFjZWQgPSBmYWxzZTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuc2hhcGVQbGFjZW1lbnRCb2FyZHMubGVuZ3RoICYmICFzaGFwZVBsYWNlZDsgaSsrICkge1xyXG4gICAgICBzaGFwZVBsYWNlZCA9IHRoaXMuc2hhcGVQbGFjZW1lbnRCb2FyZHNbIGkgXS5wbGFjZVNoYXBlKCBtb3ZhYmxlU2hhcGUgKTtcclxuICAgIH1cclxuICAgIGlmICggIXNoYXBlUGxhY2VkICkge1xyXG4gICAgICBtb3ZhYmxlU2hhcGUucmV0dXJuVG9PcmlnaW4oIHRydWUgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZ1bmN0aW9uIGZvciBhZGRpbmcgbmV3IG1vdmFibGUgc2hhcGVzIHRvIHRoaXMgbW9kZWwgd2hlbiB0aGUgdXNlciBjcmVhdGVzIHRoZW0sIGdlbmVyYWxseSBieSBjbGlja2luZyBvbiBzb21lXHJcbiAgICogc29tZSBzb3J0IG9mIGNyZWF0b3Igbm9kZS5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIG1vdmFibGVTaGFwZVxyXG4gICAqL1xyXG4gIGFkZFVzZXJDcmVhdGVkTW92YWJsZVNoYXBlKCBtb3ZhYmxlU2hhcGUgKSB7XHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHRoaXMubW92YWJsZVNoYXBlcy5wdXNoKCBtb3ZhYmxlU2hhcGUgKTtcclxuICAgIG1vdmFibGVTaGFwZS51c2VyQ29udHJvbGxlZFByb3BlcnR5LmxpbmsoIHVzZXJDb250cm9sbGVkID0+IHtcclxuICAgICAgaWYgKCAhdXNlckNvbnRyb2xsZWQgKSB7XHJcbiAgICAgICAgdGhpcy5wbGFjZVNoYXBlKCBtb3ZhYmxlU2hhcGUgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRoZSBzaGFwZSB3aWxsIGJlIHJlbW92ZWQgZnJvbSB0aGUgbW9kZWwgaWYgYW5kIHdoZW4gaXQgcmV0dXJucyB0byBpdHMgb3JpZ2luYXRpb24gcG9pbnQuICBUaGlzIGlzIGhvdyBhIHNoYXBlXHJcbiAgICAvLyBjYW4gYmUgJ3B1dCBiYWNrJyBpbnRvIHRoZSBidWNrZXQuXHJcbiAgICBtb3ZhYmxlU2hhcGUucmV0dXJuZWRUb09yaWdpbkVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgaWYgKCAhbW92YWJsZVNoYXBlLnVzZXJDb250cm9sbGVkUHJvcGVydHkuZ2V0KCkgKSB7XHJcblxyXG4gICAgICAgIC8vIFRoZSBzaGFwZSBoYXMgYmVlbiByZXR1cm5lZCB0byB0aGUgYnVja2V0LlxyXG4gICAgICAgIHRoaXMubW92YWJsZVNoYXBlcy5yZW1vdmUoIG1vdmFibGVTaGFwZSApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQW5vdGhlciBwb2ludCBhdCB3aGljaCB0aGUgc2hhcGUgaXMgcmVtb3ZlZCBpcyBpZiBpdCBmYWRlcyBhd2F5LlxyXG4gICAgbW92YWJsZVNoYXBlLmZhZGVQcm9wb3J0aW9uUHJvcGVydHkubGluayggZnVuY3Rpb24gZmFkZUhhbmRsZXIoIGZhZGVQcm9wb3J0aW9uICkge1xyXG4gICAgICBpZiAoIGZhZGVQcm9wb3J0aW9uID09PSAxICkge1xyXG4gICAgICAgIHNlbGYubW92YWJsZVNoYXBlcy5yZW1vdmUoIG1vdmFibGVTaGFwZSApO1xyXG4gICAgICAgIG1vdmFibGVTaGFwZS5mYWRlUHJvcG9ydGlvblByb3BlcnR5LnVubGluayggZmFkZUhhbmRsZXIgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogZmlsbCB0aGUgYm9hcmRzIHdpdGggdW5pdCBzcXVhcmVzLCB1c2VmdWwgZm9yIGRlYnVnZ2luZywgbm90IHVzZWQgaW4gZ2VuZXJhbCBvcGVyYXRpb24gb2YgdGhlIHNpbVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBmaWxsQm9hcmRzKCkge1xyXG4gICAgdGhpcy5zaGFwZVBsYWNlbWVudEJvYXJkcy5mb3JFYWNoKCBib2FyZCA9PiB7XHJcbiAgICAgIGNvbnN0IG51bVJvd3MgPSBib2FyZC5ib3VuZHMuaGVpZ2h0IC8gVU5JVF9TUVVBUkVfTEVOR1RIO1xyXG4gICAgICBjb25zdCBudW1Db2x1bW5zID0gYm9hcmQuYm91bmRzLndpZHRoIC8gVU5JVF9TUVVBUkVfTEVOR1RIO1xyXG4gICAgICBsZXQgbW92YWJsZVNoYXBlO1xyXG4gICAgICBsZXQgc2hhcGVPcmlnaW47XHJcbiAgICAgIGlmICggYm9hcmQgPT09IHRoaXMubGVmdFNoYXBlUGxhY2VtZW50Qm9hcmQgKSB7XHJcbiAgICAgICAgc2hhcGVPcmlnaW4gPSB0aGlzLmxlZnRCdWNrZXQucG9zaXRpb247XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIGJvYXJkID09PSB0aGlzLnJpZ2h0U2hhcGVQbGFjZW1lbnRCb2FyZCApIHtcclxuICAgICAgICBzaGFwZU9yaWdpbiA9IHRoaXMucmlnaHRCdWNrZXQucG9zaXRpb247XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgc2hhcGVPcmlnaW4gPSB0aGlzLnNpbmdsZU1vZGVCdWNrZXQucG9zaXRpb247XHJcbiAgICAgIH1cclxuICAgICAgXy50aW1lcyggbnVtQ29sdW1ucywgY29sdW1uSW5kZXggPT4ge1xyXG4gICAgICAgIF8udGltZXMoIG51bVJvd3MsIHJvd0luZGV4ID0+IHtcclxuICAgICAgICAgIG1vdmFibGVTaGFwZSA9IG5ldyBNb3ZhYmxlU2hhcGUoIFVOSVRfU1FVQVJFX1NIQVBFLCBib2FyZC5jb2xvckhhbmRsZWQsIHNoYXBlT3JpZ2luICk7XHJcbiAgICAgICAgICBtb3ZhYmxlU2hhcGUucG9zaXRpb25Qcm9wZXJ0eS5zZXQoIG5ldyBWZWN0b3IyKFxyXG4gICAgICAgICAgICBib2FyZC5ib3VuZHMubWluWCArIGNvbHVtbkluZGV4ICogVU5JVF9TUVVBUkVfTEVOR1RILFxyXG4gICAgICAgICAgICBib2FyZC5ib3VuZHMubWluWSArIHJvd0luZGV4ICogVU5JVF9TUVVBUkVfTEVOR1RIXHJcbiAgICAgICAgICApICk7XHJcbiAgICAgICAgICB0aGlzLmFkZFVzZXJDcmVhdGVkTW92YWJsZVNoYXBlKCBtb3ZhYmxlU2hhcGUgKTtcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0cyBhbGwgbW9kZWwgZWxlbWVudHNcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLnNob3dTaGFwZUJvYXJkR3JpZHNQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zaG93RGltZW5zaW9uc1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmJvYXJkRGlzcGxheU1vZGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zaGFwZVBsYWNlbWVudEJvYXJkcy5mb3JFYWNoKCBib2FyZCA9PiB7IGJvYXJkLnJlbGVhc2VBbGxTaGFwZXMoICdqdW1wSG9tZScgKTsgfSApO1xyXG4gICAgdGhpcy5tb3ZhYmxlU2hhcGVzLmNsZWFyKCk7XHJcbiAgfVxyXG59XHJcblxyXG5hcmVhQnVpbGRlci5yZWdpc3RlciggJ0FyZWFCdWlsZGVyRXhwbG9yZU1vZGVsJywgQXJlYUJ1aWxkZXJFeHBsb3JlTW9kZWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgQXJlYUJ1aWxkZXJFeHBsb3JlTW9kZWw7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLHFCQUFxQixNQUFNLDhDQUE4QztBQUNoRixPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0MsTUFBTSxNQUFNLDJDQUEyQztBQUM5RCxPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBQzlDLE9BQU9DLDBCQUEwQixNQUFNLDRDQUE0QztBQUNuRixPQUFPQyxZQUFZLE1BQU0sb0NBQW9DO0FBQzdELE9BQU9DLG1CQUFtQixNQUFNLDJDQUEyQzs7QUFFM0U7QUFDQSxNQUFNQyxrQkFBa0IsR0FBR0gsMEJBQTBCLENBQUNHLGtCQUFrQjtBQUN4RSxNQUFNQyxpQkFBaUIsR0FBR1AsS0FBSyxDQUFDUSxJQUFJLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRUYsa0JBQWtCLEVBQUVBLGtCQUFtQixDQUFDO0FBQ3BGLE1BQU1HLGdCQUFnQixHQUFHLElBQUlYLFVBQVUsQ0FBRVEsa0JBQWtCLEdBQUcsQ0FBQyxFQUFFQSxrQkFBa0IsR0FBRyxDQUFFLENBQUM7QUFDekYsTUFBTUksZ0JBQWdCLEdBQUcsSUFBSVosVUFBVSxDQUFFUSxrQkFBa0IsR0FBRyxFQUFFLEVBQUVBLGtCQUFrQixHQUFHLENBQUUsQ0FBQztBQUMxRixNQUFNSyxlQUFlLEdBQUdSLDBCQUEwQixDQUFDUyxhQUFhLENBQUNDLEtBQUs7QUFDdEUsTUFBTUMsOEJBQThCLEdBQUdSLGtCQUFrQjtBQUN6RCxNQUFNUyxXQUFXLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDeEIsTUFBTUMsV0FBVyxHQUFHLElBQUlsQixVQUFVLENBQUUsRUFBRSxFQUFFLEVBQUcsQ0FBQztBQUM1QyxNQUFNbUIseUJBQXlCLEdBQUcsRUFBRTtBQUVwQyxNQUFNQyx1QkFBdUIsQ0FBQztFQUU1QkMsV0FBV0EsQ0FBQSxFQUFHO0lBRVosSUFBSSxDQUFDQywyQkFBMkIsR0FBRyxJQUFJeEIsUUFBUSxDQUFFLElBQUssQ0FBQyxDQUFDLENBQUM7SUFDekQsSUFBSSxDQUFDeUIsc0JBQXNCLEdBQUcsSUFBSXpCLFFBQVEsQ0FBRSxJQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3BELElBQUksQ0FBQzBCLHdCQUF3QixHQUFHLElBQUl6QixjQUFjLENBQUUsUUFBUyxDQUFDLENBQUMsQ0FBQzs7SUFFaEUsSUFBSSxDQUFDMEIsYUFBYSxHQUFHNUIscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDOUMsSUFBSSxDQUFDNkIsZ0JBQWdCLEdBQUdsQixrQkFBa0IsQ0FBQyxDQUFDOztJQUU1QztJQUNBO0lBQ0EsSUFBSSxDQUFDbUIsdUJBQXVCLEdBQUcsSUFBSXBCLG1CQUFtQixDQUNwREksZ0JBQWdCLEVBQ2hCSCxrQkFBa0IsRUFDbEIsSUFBSVAsT0FBTyxDQUFFWSxlQUFlLEdBQUcsQ0FBQyxHQUFHRyw4QkFBOEIsR0FBRyxDQUFDLEdBQUdMLGdCQUFnQixDQUFDSSxLQUFLLEVBQUVFLFdBQVksQ0FBQyxFQUM3R1osMEJBQTBCLENBQUN1QixjQUFjLEVBQ3pDLElBQUksQ0FBQ04sMkJBQTJCLEVBQ2hDLElBQUksQ0FBQ0Msc0JBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDSCxJQUFJLENBQUNNLHdCQUF3QixHQUFHLElBQUl0QixtQkFBbUIsQ0FDckRJLGdCQUFnQixFQUNoQkgsa0JBQWtCLEVBQ2xCLElBQUlQLE9BQU8sQ0FBRVksZUFBZSxHQUFHLENBQUMsR0FBR0csOEJBQThCLEdBQUcsQ0FBQyxFQUFFQyxXQUFZLENBQUMsRUFDcEZaLDBCQUEwQixDQUFDeUIsY0FBYyxFQUN6QyxJQUFJLENBQUNSLDJCQUEyQixFQUNoQyxJQUFJLENBQUNDLHNCQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ0gsSUFBSSxDQUFDUSx5QkFBeUIsR0FBRyxJQUFJeEIsbUJBQW1CLENBQ3RESyxnQkFBZ0IsRUFDaEJKLGtCQUFrQixFQUNsQixJQUFJUCxPQUFPLENBQUVZLGVBQWUsR0FBRyxDQUFDLEdBQUdELGdCQUFnQixDQUFDRyxLQUFLLEdBQUcsQ0FBQyxFQUFFRSxXQUFZLENBQUMsRUFDNUVaLDBCQUEwQixDQUFDMkIsY0FBYyxFQUN6QyxJQUFJLENBQUNWLDJCQUEyQixFQUNoQyxJQUFJLENBQUNDLHNCQUNQLENBQUMsQ0FBQyxDQUFDOztJQUVIO0lBQ0EsSUFBSSxDQUFDVSxvQkFBb0IsR0FBRyxDQUFFLElBQUksQ0FBQ04sdUJBQXVCLEVBQUUsSUFBSSxDQUFDRSx3QkFBd0IsRUFBRSxJQUFJLENBQUNFLHlCQUF5QixDQUFFOztJQUUzSDtJQUNBLE1BQU1HLFVBQVUsR0FBRyxJQUFJLENBQUNQLHVCQUF1QixDQUFDUSxNQUFNLENBQUNDLElBQUksR0FBR3pCLGdCQUFnQixDQUFDMEIsTUFBTSxHQUFHbEIseUJBQXlCO0lBQ2pILElBQUksQ0FBQ21CLFVBQVUsR0FBRyxJQUFJbkMsTUFBTSxDQUFFO01BQzVCb0MsUUFBUSxFQUFFLElBQUl0QyxPQUFPLENBQUUsSUFBSSxDQUFDMEIsdUJBQXVCLENBQUNRLE1BQU0sQ0FBQ0ssSUFBSSxHQUFHN0IsZ0JBQWdCLENBQUNJLEtBQUssR0FBRyxHQUFHLEVBQUVtQixVQUFXLENBQUM7TUFDNUdPLFNBQVMsRUFBRSxTQUFTO01BQ3BCQyxJQUFJLEVBQUV4QixXQUFXO01BQ2pCeUIsT0FBTyxFQUFFO0lBQ1gsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDQyxXQUFXLEdBQUcsSUFBSXpDLE1BQU0sQ0FBRTtNQUM3Qm9DLFFBQVEsRUFBRSxJQUFJdEMsT0FBTyxDQUFFLElBQUksQ0FBQzRCLHdCQUF3QixDQUFDTSxNQUFNLENBQUNLLElBQUksR0FBRzdCLGdCQUFnQixDQUFDSSxLQUFLLEdBQUcsR0FBRyxFQUFFbUIsVUFBVyxDQUFDO01BQzdHTyxTQUFTLEVBQUUsU0FBUztNQUNwQkMsSUFBSSxFQUFFeEIsV0FBVztNQUNqQnlCLE9BQU8sRUFBRTtJQUNYLENBQUUsQ0FBQztJQUNILElBQUksQ0FBQ0UsZ0JBQWdCLEdBQUcsSUFBSTFDLE1BQU0sQ0FBRTtNQUNsQ29DLFFBQVEsRUFBRSxJQUFJdEMsT0FBTyxDQUFFLElBQUksQ0FBQzhCLHlCQUF5QixDQUFDSSxNQUFNLENBQUNLLElBQUksR0FBRzVCLGdCQUFnQixDQUFDRyxLQUFLLEdBQUcsQ0FBQyxFQUFFbUIsVUFBVyxDQUFDO01BQzVHTyxTQUFTLEVBQUUsU0FBUztNQUNwQkMsSUFBSSxFQUFFeEIsV0FBVztNQUNqQnlCLE9BQU8sRUFBRTtJQUNYLENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VHLElBQUlBLENBQUVDLEVBQUUsRUFBRztJQUNULElBQUksQ0FBQ3RCLGFBQWEsQ0FBQ3VCLE9BQU8sQ0FBRUMsWUFBWSxJQUFJO01BQUVBLFlBQVksQ0FBQ0gsSUFBSSxDQUFFQyxFQUFHLENBQUM7SUFBRSxDQUFFLENBQUM7RUFDNUU7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRUcsVUFBVUEsQ0FBRUQsWUFBWSxFQUFHO0lBQ3pCLElBQUlFLFdBQVcsR0FBRyxLQUFLO0lBQ3ZCLEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ25CLG9CQUFvQixDQUFDb0IsTUFBTSxJQUFJLENBQUNGLFdBQVcsRUFBRUMsQ0FBQyxFQUFFLEVBQUc7TUFDM0VELFdBQVcsR0FBRyxJQUFJLENBQUNsQixvQkFBb0IsQ0FBRW1CLENBQUMsQ0FBRSxDQUFDRixVQUFVLENBQUVELFlBQWEsQ0FBQztJQUN6RTtJQUNBLElBQUssQ0FBQ0UsV0FBVyxFQUFHO01BQ2xCRixZQUFZLENBQUNLLGNBQWMsQ0FBRSxJQUFLLENBQUM7SUFDckM7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsMEJBQTBCQSxDQUFFTixZQUFZLEVBQUc7SUFDekMsTUFBTU8sSUFBSSxHQUFHLElBQUk7SUFDakIsSUFBSSxDQUFDL0IsYUFBYSxDQUFDZ0MsSUFBSSxDQUFFUixZQUFhLENBQUM7SUFDdkNBLFlBQVksQ0FBQ1Msc0JBQXNCLENBQUNDLElBQUksQ0FBRUMsY0FBYyxJQUFJO01BQzFELElBQUssQ0FBQ0EsY0FBYyxFQUFHO1FBQ3JCLElBQUksQ0FBQ1YsVUFBVSxDQUFFRCxZQUFhLENBQUM7TUFDakM7SUFDRixDQUFFLENBQUM7O0lBRUg7SUFDQTtJQUNBQSxZQUFZLENBQUNZLHVCQUF1QixDQUFDQyxXQUFXLENBQUUsTUFBTTtNQUN0RCxJQUFLLENBQUNiLFlBQVksQ0FBQ1Msc0JBQXNCLENBQUNLLEdBQUcsQ0FBQyxDQUFDLEVBQUc7UUFFaEQ7UUFDQSxJQUFJLENBQUN0QyxhQUFhLENBQUN1QyxNQUFNLENBQUVmLFlBQWEsQ0FBQztNQUMzQztJQUNGLENBQUUsQ0FBQzs7SUFFSDtJQUNBQSxZQUFZLENBQUNnQixzQkFBc0IsQ0FBQ04sSUFBSSxDQUFFLFNBQVNPLFdBQVdBLENBQUVDLGNBQWMsRUFBRztNQUMvRSxJQUFLQSxjQUFjLEtBQUssQ0FBQyxFQUFHO1FBQzFCWCxJQUFJLENBQUMvQixhQUFhLENBQUN1QyxNQUFNLENBQUVmLFlBQWEsQ0FBQztRQUN6Q0EsWUFBWSxDQUFDZ0Isc0JBQXNCLENBQUNHLE1BQU0sQ0FBRUYsV0FBWSxDQUFDO01BQzNEO0lBQ0YsQ0FBRSxDQUFDO0VBQ0w7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRUcsVUFBVUEsQ0FBQSxFQUFHO0lBQ1gsSUFBSSxDQUFDcEMsb0JBQW9CLENBQUNlLE9BQU8sQ0FBRXNCLEtBQUssSUFBSTtNQUMxQyxNQUFNQyxPQUFPLEdBQUdELEtBQUssQ0FBQ25DLE1BQU0sQ0FBQ0UsTUFBTSxHQUFHN0Isa0JBQWtCO01BQ3hELE1BQU1nRSxVQUFVLEdBQUdGLEtBQUssQ0FBQ25DLE1BQU0sQ0FBQ3BCLEtBQUssR0FBR1Asa0JBQWtCO01BQzFELElBQUl5QyxZQUFZO01BQ2hCLElBQUl3QixXQUFXO01BQ2YsSUFBS0gsS0FBSyxLQUFLLElBQUksQ0FBQzNDLHVCQUF1QixFQUFHO1FBQzVDOEMsV0FBVyxHQUFHLElBQUksQ0FBQ25DLFVBQVUsQ0FBQ0MsUUFBUTtNQUN4QyxDQUFDLE1BQ0ksSUFBSytCLEtBQUssS0FBSyxJQUFJLENBQUN6Qyx3QkFBd0IsRUFBRztRQUNsRDRDLFdBQVcsR0FBRyxJQUFJLENBQUM3QixXQUFXLENBQUNMLFFBQVE7TUFDekMsQ0FBQyxNQUNJO1FBQ0hrQyxXQUFXLEdBQUcsSUFBSSxDQUFDNUIsZ0JBQWdCLENBQUNOLFFBQVE7TUFDOUM7TUFDQW1DLENBQUMsQ0FBQ0MsS0FBSyxDQUFFSCxVQUFVLEVBQUVJLFdBQVcsSUFBSTtRQUNsQ0YsQ0FBQyxDQUFDQyxLQUFLLENBQUVKLE9BQU8sRUFBRU0sUUFBUSxJQUFJO1VBQzVCNUIsWUFBWSxHQUFHLElBQUkzQyxZQUFZLENBQUVHLGlCQUFpQixFQUFFNkQsS0FBSyxDQUFDUSxZQUFZLEVBQUVMLFdBQVksQ0FBQztVQUNyRnhCLFlBQVksQ0FBQzhCLGdCQUFnQixDQUFDQyxHQUFHLENBQUUsSUFBSS9FLE9BQU8sQ0FDNUNxRSxLQUFLLENBQUNuQyxNQUFNLENBQUNLLElBQUksR0FBR29DLFdBQVcsR0FBR3BFLGtCQUFrQixFQUNwRDhELEtBQUssQ0FBQ25DLE1BQU0sQ0FBQ0MsSUFBSSxHQUFHeUMsUUFBUSxHQUFHckUsa0JBQ2pDLENBQUUsQ0FBQztVQUNILElBQUksQ0FBQytDLDBCQUEwQixDQUFFTixZQUFhLENBQUM7UUFDakQsQ0FBRSxDQUFDO01BQ0wsQ0FBRSxDQUFDO0lBQ0wsQ0FBRSxDQUFDO0VBQ0w7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRWdDLEtBQUtBLENBQUEsRUFBRztJQUNOLElBQUksQ0FBQzNELDJCQUEyQixDQUFDMkQsS0FBSyxDQUFDLENBQUM7SUFDeEMsSUFBSSxDQUFDMUQsc0JBQXNCLENBQUMwRCxLQUFLLENBQUMsQ0FBQztJQUNuQyxJQUFJLENBQUN6RCx3QkFBd0IsQ0FBQ3lELEtBQUssQ0FBQyxDQUFDO0lBQ3JDLElBQUksQ0FBQ2hELG9CQUFvQixDQUFDZSxPQUFPLENBQUVzQixLQUFLLElBQUk7TUFBRUEsS0FBSyxDQUFDWSxnQkFBZ0IsQ0FBRSxVQUFXLENBQUM7SUFBRSxDQUFFLENBQUM7SUFDdkYsSUFBSSxDQUFDekQsYUFBYSxDQUFDMEQsS0FBSyxDQUFDLENBQUM7RUFDNUI7QUFDRjtBQUVBL0UsV0FBVyxDQUFDZ0YsUUFBUSxDQUFFLHlCQUF5QixFQUFFaEUsdUJBQXdCLENBQUM7QUFDMUUsZUFBZUEsdUJBQXVCIn0=