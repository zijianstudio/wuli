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
  constructor(bounds, tandem) {
    // @public (read-only) (Bounds2}
    this.bounds = bounds;

    // @public - Whether the top coil should be shown
    this.topCoilVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('topCoilVisibleProperty'),
      phetioDocumentation: 'True if and only if the top coil is visible'
    });

    // @public - true if the magnet arrows should be shown
    this.magnetArrowsVisibleProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('magnetArrowsVisibleProperty'),
      phetioDocumentation: 'True if the magnet arrows are shown'
    });

    // @public
    this.voltmeterVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('voltmeterVisibleProperty'),
      phetioDocumentation: 'True if the voltmeter is shown'
    });

    // @public {NumberProperty} Voltage indicated by the voltmeter. This drives the needle position and the light bulb brightness.
    this.voltageProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('voltageProperty'),
      phetioDocumentation: 'Voltage indicated by the voltmeter. This drives the needle position and the light bulb brightness.',
      phetioReadOnly: true,
      phetioHighFrequency: true,
      units: 'V'
    });

    // @public - the magnet which can be dragged
    this.magnet = new Magnet(tandem.createTandem('magnet'));

    // @public - bottom coil
    this.bottomCoil = new Coil(FaradaysLawConstants.BOTTOM_COIL_POSITION, 4, this.magnet);

    // @public - top coil
    this.topCoil = new Coil(FaradaysLawConstants.TOP_COIL_POSITION, 2, this.magnet);

    // @public (read-only) {Bounds2[]} - Regions where the magnet cannot be dragged.  There are two for each coil, one
    // for the upper portion of the coil and one for the lower portion.  The hard coded numbers are empirically
    // determined based upon how the artwork for the coils ended up projecting into the view.
    this.topCoilRestrictedBounds = [
    // upper portion of the coil
    Bounds2.rect(this.topCoil.position.x - 7, this.topCoil.position.y - 77, TOP_COIL_RESTRICTED_AREA_WIDTH, COIL_RESTRICTED_AREA_HEIGHT),
    // lower portion of the coil
    Bounds2.rect(this.topCoil.position.x, this.topCoil.position.y + 65, TOP_COIL_RESTRICTED_AREA_WIDTH, COIL_RESTRICTED_AREA_HEIGHT)];
    this.bottomCoilRestrictedBounds = [
    // upper portion of the coil
    Bounds2.rect(this.bottomCoil.position.x - 31, this.bottomCoil.position.y - 77, BOTTOM_COIL_RESTRICTED_AREA_WIDTH, COIL_RESTRICTED_AREA_HEIGHT),
    // lower portion of the coil
    Bounds2.rect(this.bottomCoil.position.x - 23, this.bottomCoil.position.y + 65, BOTTOM_COIL_RESTRICTED_AREA_WIDTH, COIL_RESTRICTED_AREA_HEIGHT)];

    // @public - the Voltmeter
    this.voltmeter = new Voltmeter(this);

    // @public (read-only)
    this.resetInProgressProperty = new BooleanProperty(false);

    // @public (listen-only) - emitter that fires when the magnet bumps into a coil
    this.coilBumpEmitter = new Emitter({
      parameters: [{
        valueType: CoilTypeEnum
      }]
    });

    // @public (listen-only) - emitter that fires when the magnet bumps into the outer drag bounds
    this.edgeBumpEmitter = new Emitter();

    // @private - see this.moveMagnetToPosition method, used to calculate allowed magnet positions
    this.intersectedBounds = null;

    // @private {Bounds2|null} - bounds where magnet was set to on the last movement attempt, used to detect transitions
    // between being totally in bounds and reaching the boundary edge
    this.previousMagnetBounds = null;

    // If the magnet intersects the top coil area when the top coil is shown, then reset the magnet.
    this.topCoilVisibleProperty.link(showTopCoil => {
      if (showTopCoil && this.magnetIntersectsTopCoilArea()) {
        this.magnet.positionProperty.reset();
      }
      this.intersectedBounds = null;
      this.topCoil.reset();
    });
  }

  /**
   * Restore to initial conditions
   * @public
   */
  reset() {
    this.resetInProgressProperty.set(true);
    this.magnet.reset();
    this.topCoilVisibleProperty.reset();
    this.magnetArrowsVisibleProperty.reset();
    this.bottomCoil.reset();
    this.topCoil.reset();
    this.voltmeterVisibleProperty.reset();
    this.resetInProgressProperty.set(false);
  }

  /**
   * Move the model forward in time
   * @param {number} dt - in seconds
   * @public
   */
  step(dt) {
    this.bottomCoil.step(dt);
    this.topCoilVisibleProperty.get() && this.topCoil.step(dt);
    this.voltmeter.step(dt);
  }

  /**
   * Returns true if magnet intersects coil bounds
   * @returns {boolean}
   * @private
   */
  magnetIntersectsTopCoilArea() {
    const magnetBounds = Bounds2.point(this.magnet.positionProperty.get()).dilatedXY(this.magnet.width / 2, this.magnet.height / 2);
    return magnetBounds.intersectsBounds(this.topCoilRestrictedBounds[1]) || magnetBounds.intersectsBounds(this.topCoilRestrictedBounds[0]);
  }

  /**
   * Tests the provided bounds against the current set of restricted bounds and returns the first one for which there
   * is an intersection, null if the provided bounds don't intersect with any of the restricted bounds.
   * @param  {Bounds2} bounds
   * @returns {Bounds2|null}
   * @public
   */
  getIntersectedRestrictedBounds(bounds) {
    let intersectedRestrictedBounds = null;

    // Handle whether one or both coils are visible.
    let restrictedBoundsList = [...this.bottomCoilRestrictedBounds];
    if (this.topCoilVisibleProperty.get()) {
      restrictedBoundsList = restrictedBoundsList.concat(this.topCoilRestrictedBounds);
    }

    // Test against all restricted bounds.
    for (let i = 0; i < restrictedBoundsList.length; i++) {
      if (bounds.intersectsBounds(restrictedBoundsList[i])) {
        intersectedRestrictedBounds = restrictedBoundsList[i];
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
  checkMotionAgainstObstacles(leadingEdgeLines, proposedTranslation, obstacleEdgeLines) {
    // If there is no actual motion proposed, there is nothing to do here.  This is done as an optimization.
    if (proposedTranslation.x === 0 && proposedTranslation.y === 0) {
      return proposedTranslation;
    }

    // Start by assuming that the entire amount of the translation will work.
    let allowedHorizontalMotion = proposedTranslation.x;
    let allowedVerticalMotion = proposedTranslation.y;

    // Check the horizontal motion and limit it if necessary.
    const horizontalDelta = obstacleEdgeLines.verticalEdge.start.x - leadingEdgeLines.verticalEdge.start.x;

    // Test if the restricted bounds are within a distance and on a side where interference could occur.
    if (Math.abs(proposedTranslation.x) > 0 && (Math.sign(proposedTranslation.x) === Math.sign(horizontalDelta) || horizontalDelta === 0) && Math.abs(proposedTranslation.x) >= Math.abs(horizontalDelta)) {
      // Test whether the leading edge line would overlap with the bounds edge if projected to the same location.  In
      // other words, would these two lines collide with each other when moved by the proposed translation?
      const translationScaleFactor = horizontalDelta / proposedTranslation.x;
      assert && assert(translationScaleFactor <= 1, 'if we hit this, something is wrong in the code above');
      const scaledDownTranslation = proposedTranslation.timesScalar(translationScaleFactor);
      const projectedLineStartPoint = leadingEdgeLines.verticalEdge.start.plus(scaledDownTranslation);
      const projectedLineEndPoint = leadingEdgeLines.verticalEdge.end.plus(scaledDownTranslation);

      // Does the translated leading edge line overlap with the restricted bounds?
      const edgeLinesOverlap = projectedLineEndPoint.y > obstacleEdgeLines.verticalEdge.start.y && projectedLineStartPoint.y < obstacleEdgeLines.verticalEdge.end.y || projectedLineStartPoint.y < obstacleEdgeLines.verticalEdge.end.y && projectedLineEndPoint.y > obstacleEdgeLines.verticalEdge.start.y;
      if (edgeLinesOverlap) {
        // The proposed translation would cause the edge lines to collide, so limit the horizontal motion to an amount
        // where overlap will not occur.
        allowedHorizontalMotion = horizontalDelta;
      }
    }

    // Check the vertical motion and limit it if necessary.
    const verticalDelta = obstacleEdgeLines.horizontalEdge.start.y - leadingEdgeLines.horizontalEdge.start.y;

    // Test if the restricted bounds are within a distance and on a side where interference could occur.
    if (Math.abs(proposedTranslation.y) > 0 && (Math.sign(proposedTranslation.y) === Math.sign(verticalDelta) || verticalDelta === 0) && Math.abs(proposedTranslation.y) >= Math.abs(verticalDelta)) {
      // Test whether the leading edge line would overlap with the bounds edge if projected to the same location.  In
      // other words, would these two lines collide with each other when moved by the proposed translation?
      const translationScaleFactor = verticalDelta / proposedTranslation.y;
      assert && assert(translationScaleFactor <= 1, 'if we hit this, something is wrong in the code above');
      const scaledDownTranslation = proposedTranslation.timesScalar(translationScaleFactor);
      const projectedLineStartPoint = leadingEdgeLines.horizontalEdge.start.plus(scaledDownTranslation);
      const projectedLineEndPoint = leadingEdgeLines.horizontalEdge.end.plus(scaledDownTranslation);

      // Does the translated leading edge line overlap with the restricted bounds?
      const edgeLinesOverlap = projectedLineEndPoint.x > obstacleEdgeLines.horizontalEdge.start.x && projectedLineStartPoint.x < obstacleEdgeLines.horizontalEdge.end.x || projectedLineStartPoint.x < obstacleEdgeLines.horizontalEdge.end.x && projectedLineEndPoint.x > obstacleEdgeLines.horizontalEdge.start.x;
      if (edgeLinesOverlap) {
        // The proposed translation would cause the edge lines to collide, so limit the vertical motion to an amount
        // where overlap will not occur.
        allowedVerticalMotion = verticalDelta;
      }
    }
    return new Vector2(allowedHorizontalMotion, allowedVerticalMotion);
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
  checkMotionAgainstBounds(leadingEdgeLines, proposedTranslation, bounds) {
    // If there is no actual motion proposed, there is nothing to do here.  This is done as an optimization.
    if (proposedTranslation.x === 0 && proposedTranslation.y === 0) {
      return proposedTranslation;
    }
    const allowedTranslation = proposedTranslation.copy();

    // x direction
    if (proposedTranslation.x > 0) {
      if (leadingEdgeLines.verticalEdge.start.x + proposedTranslation.x > bounds.maxX) {
        allowedTranslation.setX(bounds.maxX - leadingEdgeLines.verticalEdge.start.x);
      }
    } else {
      if (leadingEdgeLines.verticalEdge.start.x + proposedTranslation.x < bounds.minX) {
        allowedTranslation.setX(bounds.minX - leadingEdgeLines.verticalEdge.start.x);
      }
    }

    // y direction
    if (proposedTranslation.y > 0) {
      if (leadingEdgeLines.horizontalEdge.start.y + proposedTranslation.y > bounds.maxY) {
        allowedTranslation.setY(bounds.maxY - leadingEdgeLines.horizontalEdge.start.y);
      }
    } else {
      if (leadingEdgeLines.horizontalEdge.start.y + proposedTranslation.y < bounds.minY) {
        allowedTranslation.setY(bounds.minY - leadingEdgeLines.horizontalEdge.start.y);
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
  getMotionEdges(proposedTranslation, objectBounds, externalPerspective = true) {
    let horizontalEdge;
    let verticalEdge;
    if (proposedTranslation.x > 0 && externalPerspective || proposedTranslation.x < 0 && !externalPerspective) {
      // The needed edge is the left side of the object or container.
      verticalEdge = new Line(new Vector2(objectBounds.minX, objectBounds.minY), new Vector2(objectBounds.minX, objectBounds.maxY));
    } else {
      // The needed edge is the right side of the object or container.
      verticalEdge = new Line(new Vector2(objectBounds.maxX, objectBounds.minY), new Vector2(objectBounds.maxX, objectBounds.maxY));
    }
    if (proposedTranslation.y > 0 && externalPerspective || proposedTranslation.y < 0 && !externalPerspective) {
      // The needed edge is the top of the object or container (positive Y is in the downward direction).
      horizontalEdge = new Line(new Vector2(objectBounds.minX, objectBounds.minY), new Vector2(objectBounds.maxX, objectBounds.minY));
    } else {
      // The needed edge is the bottom of the object or container (positive Y is in the downward direction).
      horizontalEdge = new Line(new Vector2(objectBounds.minX, objectBounds.maxY), new Vector2(objectBounds.maxX, objectBounds.maxY));
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
  checkProposedMagnetMotion(proposedTranslation) {
    // Get a set of lines that represent the leading edges of the magnet if it is moved using the proposed translation.
    const leadingMagnetEdges = this.getMotionEdges(proposedTranslation, this.magnet.getBounds(), false);

    // Make a list of the restricted bounds that could block the magnet's motion.  This varies based on which coils are
    // currently visible.
    let restrictedBoundsList = [...this.bottomCoilRestrictedBounds];
    if (this.topCoilVisibleProperty.value) {
      restrictedBoundsList = this.bottomCoilRestrictedBounds.concat(this.topCoilRestrictedBounds);
    }

    // Test the proposed motion against the restricted bounds.
    let smallestAllowedTranslation = proposedTranslation.copy();
    restrictedBoundsList.forEach(restrictedBounds => {
      const obstacleEdgeLines = this.getMotionEdges(proposedTranslation, restrictedBounds);
      const allowedTranslation = this.checkMotionAgainstObstacles(leadingMagnetEdges, proposedTranslation, obstacleEdgeLines);
      if (!allowedTranslation.equals(proposedTranslation)) {
        // An obstacle was encountered, so limit the allowed motion.
        if (smallestAllowedTranslation.magnitude > allowedTranslation.magnitude) {
          smallestAllowedTranslation = allowedTranslation;
        }
      }
    });

    // Test against the edges of the sim area.
    smallestAllowedTranslation = this.checkMotionAgainstBounds(leadingMagnetEdges, smallestAllowedTranslation, this.bounds);
    return smallestAllowedTranslation;
  }

  /**
   * Move the magnet to the proposed position unless doing so would cause it to move through obstacles or out of the
   * sim bounds.  In those cases, limit the motion to what can be allowed.  This also fires emitters when the magnet
   * runs into a restricted area or the sim bounds.
   * @param {Vector2} proposedPosition - a proposed position for the magnet
   * @public
   */
  moveMagnetToPosition(proposedPosition) {
    const proposedTranslation = proposedPosition.minus(this.magnet.positionProperty.value);

    // Test the proposed motion against the potential obstacles and the sim bounds.
    const allowedTranslation = this.checkProposedMagnetMotion(proposedTranslation);

    // Set the resultant position for the magnet.
    const newPosition = this.magnet.positionProperty.value.plus(allowedTranslation);
    this.magnet.positionProperty.set(newPosition);

    // Figure out what the bounds ended up being.
    const newMagnetBounds = this.magnet.getBounds();

    // Make a list of the active restricted bounds for testing whether the magnet has bumped up against any of them.
    let restrictedBoundsList = [...this.bottomCoilRestrictedBounds];
    if (this.topCoilVisibleProperty.value) {
      restrictedBoundsList = this.bottomCoilRestrictedBounds.concat(this.topCoilRestrictedBounds);
    }

    // Check whether the position has changed such that the magnet has hit a boundary or a restricted area.
    if (this.previousMagnetBounds) {
      const magnetMotionBounds = this.bounds;

      // If the magnet is now up against the bounds, and it wasn't before, fire the edgeBumpEmitter.
      if (this.previousMagnetBounds.maxX < magnetMotionBounds.maxX && newMagnetBounds.maxX >= magnetMotionBounds.maxX || this.previousMagnetBounds.minX > magnetMotionBounds.minX && newMagnetBounds.minX <= magnetMotionBounds.minX || this.previousMagnetBounds.maxY < magnetMotionBounds.maxY && newMagnetBounds.maxY >= magnetMotionBounds.maxY || this.previousMagnetBounds.minY > magnetMotionBounds.minY && newMagnetBounds.minY <= magnetMotionBounds.minY) {
        this.edgeBumpEmitter.emit();
      }

      // Check whether any restricted bounds have been hit and fire an emitter if so.
      restrictedBoundsList.forEach(restrictedBounds => {
        if (restrictedBounds.intersectsBounds(newMagnetBounds)) {
          if (!restrictedBounds.intersectsBounds(this.previousMagnetBounds)) {
            // The magnet has come into contact with some restricted bounds with which it was NOT in contact during the
            // previous movement.  Emit the appropriate signal.
            if (this.bottomCoilRestrictedBounds.includes(restrictedBounds)) {
              this.coilBumpEmitter.emit(CoilTypeEnum.FOUR_COIL);
            } else {
              this.coilBumpEmitter.emit(CoilTypeEnum.TWO_COIL);
            }
          }
        }
      });
    }

    // Keep a record of the magnet bounds so that bumps can be detected.
    this.previousMagnetBounds = newMagnetBounds;
  }
}
faradaysLaw.register('FaradaysLawModel', FaradaysLawModel);
export default FaradaysLawModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbWl0dGVyIiwiTnVtYmVyUHJvcGVydHkiLCJCb3VuZHMyIiwiVmVjdG9yMiIsIkxpbmUiLCJmYXJhZGF5c0xhdyIsIkZhcmFkYXlzTGF3Q29uc3RhbnRzIiwiQ29pbFR5cGVFbnVtIiwiQ29pbCIsIk1hZ25ldCIsIlZvbHRtZXRlciIsIkNPSUxfUkVTVFJJQ1RFRF9BUkVBX0hFSUdIVCIsIlRPUF9DT0lMX1JFU1RSSUNURURfQVJFQV9XSURUSCIsIkJPVFRPTV9DT0lMX1JFU1RSSUNURURfQVJFQV9XSURUSCIsIkZhcmFkYXlzTGF3TW9kZWwiLCJjb25zdHJ1Y3RvciIsImJvdW5kcyIsInRhbmRlbSIsInRvcENvaWxWaXNpYmxlUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwibWFnbmV0QXJyb3dzVmlzaWJsZVByb3BlcnR5Iiwidm9sdG1ldGVyVmlzaWJsZVByb3BlcnR5Iiwidm9sdGFnZVByb3BlcnR5IiwicGhldGlvUmVhZE9ubHkiLCJwaGV0aW9IaWdoRnJlcXVlbmN5IiwidW5pdHMiLCJtYWduZXQiLCJib3R0b21Db2lsIiwiQk9UVE9NX0NPSUxfUE9TSVRJT04iLCJ0b3BDb2lsIiwiVE9QX0NPSUxfUE9TSVRJT04iLCJ0b3BDb2lsUmVzdHJpY3RlZEJvdW5kcyIsInJlY3QiLCJwb3NpdGlvbiIsIngiLCJ5IiwiYm90dG9tQ29pbFJlc3RyaWN0ZWRCb3VuZHMiLCJ2b2x0bWV0ZXIiLCJyZXNldEluUHJvZ3Jlc3NQcm9wZXJ0eSIsImNvaWxCdW1wRW1pdHRlciIsInBhcmFtZXRlcnMiLCJ2YWx1ZVR5cGUiLCJlZGdlQnVtcEVtaXR0ZXIiLCJpbnRlcnNlY3RlZEJvdW5kcyIsInByZXZpb3VzTWFnbmV0Qm91bmRzIiwibGluayIsInNob3dUb3BDb2lsIiwibWFnbmV0SW50ZXJzZWN0c1RvcENvaWxBcmVhIiwicG9zaXRpb25Qcm9wZXJ0eSIsInJlc2V0Iiwic2V0Iiwic3RlcCIsImR0IiwiZ2V0IiwibWFnbmV0Qm91bmRzIiwicG9pbnQiLCJkaWxhdGVkWFkiLCJ3aWR0aCIsImhlaWdodCIsImludGVyc2VjdHNCb3VuZHMiLCJnZXRJbnRlcnNlY3RlZFJlc3RyaWN0ZWRCb3VuZHMiLCJpbnRlcnNlY3RlZFJlc3RyaWN0ZWRCb3VuZHMiLCJyZXN0cmljdGVkQm91bmRzTGlzdCIsImNvbmNhdCIsImkiLCJsZW5ndGgiLCJjaGVja01vdGlvbkFnYWluc3RPYnN0YWNsZXMiLCJsZWFkaW5nRWRnZUxpbmVzIiwicHJvcG9zZWRUcmFuc2xhdGlvbiIsIm9ic3RhY2xlRWRnZUxpbmVzIiwiYWxsb3dlZEhvcml6b250YWxNb3Rpb24iLCJhbGxvd2VkVmVydGljYWxNb3Rpb24iLCJob3Jpem9udGFsRGVsdGEiLCJ2ZXJ0aWNhbEVkZ2UiLCJzdGFydCIsIk1hdGgiLCJhYnMiLCJzaWduIiwidHJhbnNsYXRpb25TY2FsZUZhY3RvciIsImFzc2VydCIsInNjYWxlZERvd25UcmFuc2xhdGlvbiIsInRpbWVzU2NhbGFyIiwicHJvamVjdGVkTGluZVN0YXJ0UG9pbnQiLCJwbHVzIiwicHJvamVjdGVkTGluZUVuZFBvaW50IiwiZW5kIiwiZWRnZUxpbmVzT3ZlcmxhcCIsInZlcnRpY2FsRGVsdGEiLCJob3Jpem9udGFsRWRnZSIsImNoZWNrTW90aW9uQWdhaW5zdEJvdW5kcyIsImFsbG93ZWRUcmFuc2xhdGlvbiIsImNvcHkiLCJtYXhYIiwic2V0WCIsIm1pblgiLCJtYXhZIiwic2V0WSIsIm1pblkiLCJnZXRNb3Rpb25FZGdlcyIsIm9iamVjdEJvdW5kcyIsImV4dGVybmFsUGVyc3BlY3RpdmUiLCJjaGVja1Byb3Bvc2VkTWFnbmV0TW90aW9uIiwibGVhZGluZ01hZ25ldEVkZ2VzIiwiZ2V0Qm91bmRzIiwidmFsdWUiLCJzbWFsbGVzdEFsbG93ZWRUcmFuc2xhdGlvbiIsImZvckVhY2giLCJyZXN0cmljdGVkQm91bmRzIiwiZXF1YWxzIiwibWFnbml0dWRlIiwibW92ZU1hZ25ldFRvUG9zaXRpb24iLCJwcm9wb3NlZFBvc2l0aW9uIiwibWludXMiLCJuZXdQb3NpdGlvbiIsIm5ld01hZ25ldEJvdW5kcyIsIm1hZ25ldE1vdGlvbkJvdW5kcyIsImVtaXQiLCJpbmNsdWRlcyIsIkZPVVJfQ09JTCIsIlRXT19DT0lMIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJGYXJhZGF5c0xhd01vZGVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsIGNvbnRhaW5lciBmb3IgdGhlICdGYXJhZGF5cyBMYXcnIHNpbXVsYXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgVmFzaWx5IFNoYWtob3YgKE1MZWFybmVyKVxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbi8vIG1vZHVsZXNcclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IExpbmUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZmFyYWRheXNMYXcgZnJvbSAnLi4vLi4vZmFyYWRheXNMYXcuanMnO1xyXG5pbXBvcnQgRmFyYWRheXNMYXdDb25zdGFudHMgZnJvbSAnLi4vRmFyYWRheXNMYXdDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQ29pbFR5cGVFbnVtIGZyb20gJy4uL3ZpZXcvQ29pbFR5cGVFbnVtLmpzJztcclxuaW1wb3J0IENvaWwgZnJvbSAnLi9Db2lsLmpzJztcclxuaW1wb3J0IE1hZ25ldCBmcm9tICcuL01hZ25ldC5qcyc7XHJcbmltcG9ydCBWb2x0bWV0ZXIgZnJvbSAnLi9Wb2x0bWV0ZXIuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcblxyXG4vLyBWYWx1ZXMgdXNlZCBmb3IgdGhlIHJlc3RyaWN0ZWQgem9uZXMgd2hlcmUgdGhlIG1hZ25ldCBjYW4ndCBiZSBkcmFnZ2VkIGR1ZSB0byB0aGUgcHJlc2VuY2Ugb2YgdGhlIGNvaWxzLiAgVGhlc2VcclxuLy8gbnVtYmVycyB3ZXJlIGVtcGlyaWNhbGx5IGRldGVybWluZWQgYmFzZWQgdXBvbiBob3cgdGhlIGFydHdvcmsgZm9yIHRoZSBjb2lscyBhcHBlYXIgaW4gdGhlIHZpZXcuXHJcbmNvbnN0IENPSUxfUkVTVFJJQ1RFRF9BUkVBX0hFSUdIVCA9IDEyO1xyXG5jb25zdCBUT1BfQ09JTF9SRVNUUklDVEVEX0FSRUFfV0lEVEggPSAyNTtcclxuY29uc3QgQk9UVE9NX0NPSUxfUkVTVFJJQ1RFRF9BUkVBX1dJRFRIID0gNTU7XHJcblxyXG5jbGFzcyBGYXJhZGF5c0xhd01vZGVsIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtCb3VuZHMyfSBib3VuZHMgb2YgU2NyZWVuXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBib3VuZHMsIHRhbmRlbSApIHtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIChCb3VuZHMyfVxyXG4gICAgdGhpcy5ib3VuZHMgPSBib3VuZHM7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIFdoZXRoZXIgdGhlIHRvcCBjb2lsIHNob3VsZCBiZSBzaG93blxyXG4gICAgdGhpcy50b3BDb2lsVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndG9wQ29pbFZpc2libGVQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1RydWUgaWYgYW5kIG9ubHkgaWYgdGhlIHRvcCBjb2lsIGlzIHZpc2libGUnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIHRydWUgaWYgdGhlIG1hZ25ldCBhcnJvd3Mgc2hvdWxkIGJlIHNob3duXHJcbiAgICB0aGlzLm1hZ25ldEFycm93c1Zpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbWFnbmV0QXJyb3dzVmlzaWJsZVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVHJ1ZSBpZiB0aGUgbWFnbmV0IGFycm93cyBhcmUgc2hvd24nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpY1xyXG4gICAgdGhpcy52b2x0bWV0ZXJWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd2b2x0bWV0ZXJWaXNpYmxlUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdUcnVlIGlmIHRoZSB2b2x0bWV0ZXIgaXMgc2hvd24nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7TnVtYmVyUHJvcGVydHl9IFZvbHRhZ2UgaW5kaWNhdGVkIGJ5IHRoZSB2b2x0bWV0ZXIuIFRoaXMgZHJpdmVzIHRoZSBuZWVkbGUgcG9zaXRpb24gYW5kIHRoZSBsaWdodCBidWxiIGJyaWdodG5lc3MuXHJcbiAgICB0aGlzLnZvbHRhZ2VQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd2b2x0YWdlUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdWb2x0YWdlIGluZGljYXRlZCBieSB0aGUgdm9sdG1ldGVyLiBUaGlzIGRyaXZlcyB0aGUgbmVlZGxlIHBvc2l0aW9uIGFuZCB0aGUgbGlnaHQgYnVsYiBicmlnaHRuZXNzLicsXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9IaWdoRnJlcXVlbmN5OiB0cnVlLFxyXG4gICAgICB1bml0czogJ1YnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIHRoZSBtYWduZXQgd2hpY2ggY2FuIGJlIGRyYWdnZWRcclxuICAgIHRoaXMubWFnbmV0ID0gbmV3IE1hZ25ldCggdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21hZ25ldCcgKSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSBib3R0b20gY29pbFxyXG4gICAgdGhpcy5ib3R0b21Db2lsID0gbmV3IENvaWwoIEZhcmFkYXlzTGF3Q29uc3RhbnRzLkJPVFRPTV9DT0lMX1BPU0lUSU9OLCA0LCB0aGlzLm1hZ25ldCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSB0b3AgY29pbFxyXG4gICAgdGhpcy50b3BDb2lsID0gbmV3IENvaWwoIEZhcmFkYXlzTGF3Q29uc3RhbnRzLlRPUF9DT0lMX1BPU0lUSU9OLCAyLCB0aGlzLm1hZ25ldCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge0JvdW5kczJbXX0gLSBSZWdpb25zIHdoZXJlIHRoZSBtYWduZXQgY2Fubm90IGJlIGRyYWdnZWQuICBUaGVyZSBhcmUgdHdvIGZvciBlYWNoIGNvaWwsIG9uZVxyXG4gICAgLy8gZm9yIHRoZSB1cHBlciBwb3J0aW9uIG9mIHRoZSBjb2lsIGFuZCBvbmUgZm9yIHRoZSBsb3dlciBwb3J0aW9uLiAgVGhlIGhhcmQgY29kZWQgbnVtYmVycyBhcmUgZW1waXJpY2FsbHlcclxuICAgIC8vIGRldGVybWluZWQgYmFzZWQgdXBvbiBob3cgdGhlIGFydHdvcmsgZm9yIHRoZSBjb2lscyBlbmRlZCB1cCBwcm9qZWN0aW5nIGludG8gdGhlIHZpZXcuXHJcbiAgICB0aGlzLnRvcENvaWxSZXN0cmljdGVkQm91bmRzID0gW1xyXG5cclxuICAgICAgLy8gdXBwZXIgcG9ydGlvbiBvZiB0aGUgY29pbFxyXG4gICAgICBCb3VuZHMyLnJlY3QoXHJcbiAgICAgICAgdGhpcy50b3BDb2lsLnBvc2l0aW9uLnggLSA3LFxyXG4gICAgICAgIHRoaXMudG9wQ29pbC5wb3NpdGlvbi55IC0gNzcsXHJcbiAgICAgICAgVE9QX0NPSUxfUkVTVFJJQ1RFRF9BUkVBX1dJRFRILFxyXG4gICAgICAgIENPSUxfUkVTVFJJQ1RFRF9BUkVBX0hFSUdIVFxyXG4gICAgICApLFxyXG5cclxuICAgICAgLy8gbG93ZXIgcG9ydGlvbiBvZiB0aGUgY29pbFxyXG4gICAgICBCb3VuZHMyLnJlY3QoXHJcbiAgICAgICAgdGhpcy50b3BDb2lsLnBvc2l0aW9uLngsXHJcbiAgICAgICAgdGhpcy50b3BDb2lsLnBvc2l0aW9uLnkgKyA2NSxcclxuICAgICAgICBUT1BfQ09JTF9SRVNUUklDVEVEX0FSRUFfV0lEVEgsXHJcbiAgICAgICAgQ09JTF9SRVNUUklDVEVEX0FSRUFfSEVJR0hUXHJcbiAgICAgIClcclxuICAgIF07XHJcbiAgICB0aGlzLmJvdHRvbUNvaWxSZXN0cmljdGVkQm91bmRzID0gW1xyXG5cclxuICAgICAgLy8gdXBwZXIgcG9ydGlvbiBvZiB0aGUgY29pbFxyXG4gICAgICBCb3VuZHMyLnJlY3QoXHJcbiAgICAgICAgdGhpcy5ib3R0b21Db2lsLnBvc2l0aW9uLnggLSAzMSxcclxuICAgICAgICB0aGlzLmJvdHRvbUNvaWwucG9zaXRpb24ueSAtIDc3LFxyXG4gICAgICAgIEJPVFRPTV9DT0lMX1JFU1RSSUNURURfQVJFQV9XSURUSCxcclxuICAgICAgICBDT0lMX1JFU1RSSUNURURfQVJFQV9IRUlHSFRcclxuICAgICAgKSxcclxuXHJcbiAgICAgIC8vIGxvd2VyIHBvcnRpb24gb2YgdGhlIGNvaWxcclxuICAgICAgQm91bmRzMi5yZWN0KFxyXG4gICAgICAgIHRoaXMuYm90dG9tQ29pbC5wb3NpdGlvbi54IC0gMjMsXHJcbiAgICAgICAgdGhpcy5ib3R0b21Db2lsLnBvc2l0aW9uLnkgKyA2NSxcclxuICAgICAgICBCT1RUT01fQ09JTF9SRVNUUklDVEVEX0FSRUFfV0lEVEgsXHJcbiAgICAgICAgQ09JTF9SRVNUUklDVEVEX0FSRUFfSEVJR0hUXHJcbiAgICAgIClcclxuICAgIF07XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIHRoZSBWb2x0bWV0ZXJcclxuICAgIHRoaXMudm9sdG1ldGVyID0gbmV3IFZvbHRtZXRlciggdGhpcyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSlcclxuICAgIHRoaXMucmVzZXRJblByb2dyZXNzUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKGxpc3Rlbi1vbmx5KSAtIGVtaXR0ZXIgdGhhdCBmaXJlcyB3aGVuIHRoZSBtYWduZXQgYnVtcHMgaW50byBhIGNvaWxcclxuICAgIHRoaXMuY29pbEJ1bXBFbWl0dGVyID0gbmV3IEVtaXR0ZXIoIHsgcGFyYW1ldGVyczogWyB7IHZhbHVlVHlwZTogQ29pbFR5cGVFbnVtIH0gXSB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAobGlzdGVuLW9ubHkpIC0gZW1pdHRlciB0aGF0IGZpcmVzIHdoZW4gdGhlIG1hZ25ldCBidW1wcyBpbnRvIHRoZSBvdXRlciBkcmFnIGJvdW5kc1xyXG4gICAgdGhpcy5lZGdlQnVtcEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gc2VlIHRoaXMubW92ZU1hZ25ldFRvUG9zaXRpb24gbWV0aG9kLCB1c2VkIHRvIGNhbGN1bGF0ZSBhbGxvd2VkIG1hZ25ldCBwb3NpdGlvbnNcclxuICAgIHRoaXMuaW50ZXJzZWN0ZWRCb3VuZHMgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtCb3VuZHMyfG51bGx9IC0gYm91bmRzIHdoZXJlIG1hZ25ldCB3YXMgc2V0IHRvIG9uIHRoZSBsYXN0IG1vdmVtZW50IGF0dGVtcHQsIHVzZWQgdG8gZGV0ZWN0IHRyYW5zaXRpb25zXHJcbiAgICAvLyBiZXR3ZWVuIGJlaW5nIHRvdGFsbHkgaW4gYm91bmRzIGFuZCByZWFjaGluZyB0aGUgYm91bmRhcnkgZWRnZVxyXG4gICAgdGhpcy5wcmV2aW91c01hZ25ldEJvdW5kcyA9IG51bGw7XHJcblxyXG4gICAgLy8gSWYgdGhlIG1hZ25ldCBpbnRlcnNlY3RzIHRoZSB0b3AgY29pbCBhcmVhIHdoZW4gdGhlIHRvcCBjb2lsIGlzIHNob3duLCB0aGVuIHJlc2V0IHRoZSBtYWduZXQuXHJcbiAgICB0aGlzLnRvcENvaWxWaXNpYmxlUHJvcGVydHkubGluayggc2hvd1RvcENvaWwgPT4ge1xyXG4gICAgICBpZiAoIHNob3dUb3BDb2lsICYmIHRoaXMubWFnbmV0SW50ZXJzZWN0c1RvcENvaWxBcmVhKCkgKSB7XHJcbiAgICAgICAgdGhpcy5tYWduZXQucG9zaXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuaW50ZXJzZWN0ZWRCb3VuZHMgPSBudWxsO1xyXG4gICAgICB0aGlzLnRvcENvaWwucmVzZXQoKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc3RvcmUgdG8gaW5pdGlhbCBjb25kaXRpb25zXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5yZXNldEluUHJvZ3Jlc3NQcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuICAgIHRoaXMubWFnbmV0LnJlc2V0KCk7XHJcbiAgICB0aGlzLnRvcENvaWxWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMubWFnbmV0QXJyb3dzVmlzaWJsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmJvdHRvbUNvaWwucmVzZXQoKTtcclxuICAgIHRoaXMudG9wQ29pbC5yZXNldCgpO1xyXG4gICAgdGhpcy52b2x0bWV0ZXJWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMucmVzZXRJblByb2dyZXNzUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW92ZSB0aGUgbW9kZWwgZm9yd2FyZCBpbiB0aW1lXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gaW4gc2Vjb25kc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIHRoaXMuYm90dG9tQ29pbC5zdGVwKCBkdCApO1xyXG4gICAgdGhpcy50b3BDb2lsVmlzaWJsZVByb3BlcnR5LmdldCgpICYmIHRoaXMudG9wQ29pbC5zdGVwKCBkdCApO1xyXG4gICAgdGhpcy52b2x0bWV0ZXIuc3RlcCggZHQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiBtYWduZXQgaW50ZXJzZWN0cyBjb2lsIGJvdW5kc1xyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgbWFnbmV0SW50ZXJzZWN0c1RvcENvaWxBcmVhKCkge1xyXG4gICAgY29uc3QgbWFnbmV0Qm91bmRzID0gQm91bmRzMi5wb2ludCggdGhpcy5tYWduZXQucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApLmRpbGF0ZWRYWSggdGhpcy5tYWduZXQud2lkdGggLyAyLCB0aGlzLm1hZ25ldC5oZWlnaHQgLyAyICk7XHJcbiAgICByZXR1cm4gbWFnbmV0Qm91bmRzLmludGVyc2VjdHNCb3VuZHMoXHJcbiAgICAgIHRoaXMudG9wQ29pbFJlc3RyaWN0ZWRCb3VuZHNbIDEgXSApIHx8IG1hZ25ldEJvdW5kcy5pbnRlcnNlY3RzQm91bmRzKCB0aGlzLnRvcENvaWxSZXN0cmljdGVkQm91bmRzWyAwIF1cclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUZXN0cyB0aGUgcHJvdmlkZWQgYm91bmRzIGFnYWluc3QgdGhlIGN1cnJlbnQgc2V0IG9mIHJlc3RyaWN0ZWQgYm91bmRzIGFuZCByZXR1cm5zIHRoZSBmaXJzdCBvbmUgZm9yIHdoaWNoIHRoZXJlXHJcbiAgICogaXMgYW4gaW50ZXJzZWN0aW9uLCBudWxsIGlmIHRoZSBwcm92aWRlZCBib3VuZHMgZG9uJ3QgaW50ZXJzZWN0IHdpdGggYW55IG9mIHRoZSByZXN0cmljdGVkIGJvdW5kcy5cclxuICAgKiBAcGFyYW0gIHtCb3VuZHMyfSBib3VuZHNcclxuICAgKiBAcmV0dXJucyB7Qm91bmRzMnxudWxsfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRJbnRlcnNlY3RlZFJlc3RyaWN0ZWRCb3VuZHMoIGJvdW5kcyApIHtcclxuXHJcbiAgICBsZXQgaW50ZXJzZWN0ZWRSZXN0cmljdGVkQm91bmRzID0gbnVsbDtcclxuXHJcbiAgICAvLyBIYW5kbGUgd2hldGhlciBvbmUgb3IgYm90aCBjb2lscyBhcmUgdmlzaWJsZS5cclxuICAgIGxldCByZXN0cmljdGVkQm91bmRzTGlzdCA9IFsgLi4udGhpcy5ib3R0b21Db2lsUmVzdHJpY3RlZEJvdW5kcyBdO1xyXG4gICAgaWYgKCB0aGlzLnRvcENvaWxWaXNpYmxlUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIHJlc3RyaWN0ZWRCb3VuZHNMaXN0ID0gcmVzdHJpY3RlZEJvdW5kc0xpc3QuY29uY2F0KCB0aGlzLnRvcENvaWxSZXN0cmljdGVkQm91bmRzICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGVzdCBhZ2FpbnN0IGFsbCByZXN0cmljdGVkIGJvdW5kcy5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHJlc3RyaWN0ZWRCb3VuZHNMaXN0Lmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpZiAoIGJvdW5kcy5pbnRlcnNlY3RzQm91bmRzKCByZXN0cmljdGVkQm91bmRzTGlzdFsgaSBdICkgKSB7XHJcbiAgICAgICAgaW50ZXJzZWN0ZWRSZXN0cmljdGVkQm91bmRzID0gcmVzdHJpY3RlZEJvdW5kc0xpc3RbIGkgXTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBpbnRlcnNlY3RlZFJlc3RyaWN0ZWRCb3VuZHM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHaXZlbiB0aGUgbGVhZGluZyBlZGdlcyBmb3IgYSByZWN0YW5ndWxhciBtb3Zpbmcgb2JqZWN0LCBhIHByb3Bvc2VkIHRyYW5zbGF0aW9uLCBhbmQgdGhlIGVkZ2VzIGZyb20gYW5vdGhlciBvYmplY3RcclxuICAgKiBvciBib3VuZGFyeSB3aXRoIHdoaWNoIHRoZSBmaXJzdCBvbmUgY291bGQgY29sbGlkZSwgcmV0dXJuIGEgdmFsdWUgcmVwcmVzZW50aW5nIHRoZSBhbW91bnQgb2YgdGhlIHRyYW5zbGF0aW9uIHRoYXRcclxuICAgKiBjb3VsZCBvY2N1ciB3aXRob3V0IGNvbGxpc2lvbi5cclxuICAgKiBAcGFyYW0ge3t2ZXJ0aWNhbEVkZ2U6IExpbmUsIGhvcml6b250YWxFZGdlOiBMaW5lIH19IGxlYWRpbmdFZGdlTGluZXNcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHByb3Bvc2VkVHJhbnNsYXRpb25cclxuICAgKiBAcGFyYW0ge3t2ZXJ0aWNhbEVkZ2U6IExpbmUsIGhvcml6b250YWxFZGdlOiBMaW5lIH19IG9ic3RhY2xlRWRnZUxpbmVzXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9IC0gZWl0aGVyIGEgY29weSBvZiB0aGUgcHJvcG9zZWQgdHJhbnNsYXRpb24gb3IsIGlmIHRoZSBvYnN0YWNsZSBlZGdlcyB3b3VsZCBpbnRlcmZlcmUgd2l0aCB0aGVcclxuICAgKiBwcm9wb3NlZCBtb3Rpb24sIGFuZCBsaW1pdGVkIHZlcnNpb24gdGhlcmVvZlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgY2hlY2tNb3Rpb25BZ2FpbnN0T2JzdGFjbGVzKCBsZWFkaW5nRWRnZUxpbmVzLCBwcm9wb3NlZFRyYW5zbGF0aW9uLCBvYnN0YWNsZUVkZ2VMaW5lcyApIHtcclxuXHJcbiAgICAvLyBJZiB0aGVyZSBpcyBubyBhY3R1YWwgbW90aW9uIHByb3Bvc2VkLCB0aGVyZSBpcyBub3RoaW5nIHRvIGRvIGhlcmUuICBUaGlzIGlzIGRvbmUgYXMgYW4gb3B0aW1pemF0aW9uLlxyXG4gICAgaWYgKCBwcm9wb3NlZFRyYW5zbGF0aW9uLnggPT09IDAgJiYgcHJvcG9zZWRUcmFuc2xhdGlvbi55ID09PSAwICkge1xyXG4gICAgICByZXR1cm4gcHJvcG9zZWRUcmFuc2xhdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTdGFydCBieSBhc3N1bWluZyB0aGF0IHRoZSBlbnRpcmUgYW1vdW50IG9mIHRoZSB0cmFuc2xhdGlvbiB3aWxsIHdvcmsuXHJcbiAgICBsZXQgYWxsb3dlZEhvcml6b250YWxNb3Rpb24gPSBwcm9wb3NlZFRyYW5zbGF0aW9uLng7XHJcbiAgICBsZXQgYWxsb3dlZFZlcnRpY2FsTW90aW9uID0gcHJvcG9zZWRUcmFuc2xhdGlvbi55O1xyXG5cclxuICAgIC8vIENoZWNrIHRoZSBob3Jpem9udGFsIG1vdGlvbiBhbmQgbGltaXQgaXQgaWYgbmVjZXNzYXJ5LlxyXG4gICAgY29uc3QgaG9yaXpvbnRhbERlbHRhID0gb2JzdGFjbGVFZGdlTGluZXMudmVydGljYWxFZGdlLnN0YXJ0LnggLSBsZWFkaW5nRWRnZUxpbmVzLnZlcnRpY2FsRWRnZS5zdGFydC54O1xyXG5cclxuICAgIC8vIFRlc3QgaWYgdGhlIHJlc3RyaWN0ZWQgYm91bmRzIGFyZSB3aXRoaW4gYSBkaXN0YW5jZSBhbmQgb24gYSBzaWRlIHdoZXJlIGludGVyZmVyZW5jZSBjb3VsZCBvY2N1ci5cclxuICAgIGlmICggTWF0aC5hYnMoIHByb3Bvc2VkVHJhbnNsYXRpb24ueCApID4gMCAmJlxyXG4gICAgICAgICAoIE1hdGguc2lnbiggcHJvcG9zZWRUcmFuc2xhdGlvbi54ICkgPT09IE1hdGguc2lnbiggaG9yaXpvbnRhbERlbHRhICkgfHwgaG9yaXpvbnRhbERlbHRhID09PSAwICkgJiZcclxuICAgICAgICAgTWF0aC5hYnMoIHByb3Bvc2VkVHJhbnNsYXRpb24ueCApID49IE1hdGguYWJzKCBob3Jpem9udGFsRGVsdGEgKSApIHtcclxuXHJcbiAgICAgIC8vIFRlc3Qgd2hldGhlciB0aGUgbGVhZGluZyBlZGdlIGxpbmUgd291bGQgb3ZlcmxhcCB3aXRoIHRoZSBib3VuZHMgZWRnZSBpZiBwcm9qZWN0ZWQgdG8gdGhlIHNhbWUgbG9jYXRpb24uICBJblxyXG4gICAgICAvLyBvdGhlciB3b3Jkcywgd291bGQgdGhlc2UgdHdvIGxpbmVzIGNvbGxpZGUgd2l0aCBlYWNoIG90aGVyIHdoZW4gbW92ZWQgYnkgdGhlIHByb3Bvc2VkIHRyYW5zbGF0aW9uP1xyXG4gICAgICBjb25zdCB0cmFuc2xhdGlvblNjYWxlRmFjdG9yID0gaG9yaXpvbnRhbERlbHRhIC8gcHJvcG9zZWRUcmFuc2xhdGlvbi54O1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0cmFuc2xhdGlvblNjYWxlRmFjdG9yIDw9IDEsICdpZiB3ZSBoaXQgdGhpcywgc29tZXRoaW5nIGlzIHdyb25nIGluIHRoZSBjb2RlIGFib3ZlJyApO1xyXG4gICAgICBjb25zdCBzY2FsZWREb3duVHJhbnNsYXRpb24gPSBwcm9wb3NlZFRyYW5zbGF0aW9uLnRpbWVzU2NhbGFyKCB0cmFuc2xhdGlvblNjYWxlRmFjdG9yICk7XHJcbiAgICAgIGNvbnN0IHByb2plY3RlZExpbmVTdGFydFBvaW50ID0gbGVhZGluZ0VkZ2VMaW5lcy52ZXJ0aWNhbEVkZ2Uuc3RhcnQucGx1cyggc2NhbGVkRG93blRyYW5zbGF0aW9uICk7XHJcbiAgICAgIGNvbnN0IHByb2plY3RlZExpbmVFbmRQb2ludCA9IGxlYWRpbmdFZGdlTGluZXMudmVydGljYWxFZGdlLmVuZC5wbHVzKCBzY2FsZWREb3duVHJhbnNsYXRpb24gKTtcclxuXHJcbiAgICAgIC8vIERvZXMgdGhlIHRyYW5zbGF0ZWQgbGVhZGluZyBlZGdlIGxpbmUgb3ZlcmxhcCB3aXRoIHRoZSByZXN0cmljdGVkIGJvdW5kcz9cclxuICAgICAgY29uc3QgZWRnZUxpbmVzT3ZlcmxhcCA9ICggcHJvamVjdGVkTGluZUVuZFBvaW50LnkgPiBvYnN0YWNsZUVkZ2VMaW5lcy52ZXJ0aWNhbEVkZ2Uuc3RhcnQueSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0ZWRMaW5lU3RhcnRQb2ludC55IDwgb2JzdGFjbGVFZGdlTGluZXMudmVydGljYWxFZGdlLmVuZC55ICkgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggcHJvamVjdGVkTGluZVN0YXJ0UG9pbnQueSA8IG9ic3RhY2xlRWRnZUxpbmVzLnZlcnRpY2FsRWRnZS5lbmQueSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0ZWRMaW5lRW5kUG9pbnQueSA+IG9ic3RhY2xlRWRnZUxpbmVzLnZlcnRpY2FsRWRnZS5zdGFydC55ICk7XHJcblxyXG4gICAgICBpZiAoIGVkZ2VMaW5lc092ZXJsYXAgKSB7XHJcblxyXG4gICAgICAgIC8vIFRoZSBwcm9wb3NlZCB0cmFuc2xhdGlvbiB3b3VsZCBjYXVzZSB0aGUgZWRnZSBsaW5lcyB0byBjb2xsaWRlLCBzbyBsaW1pdCB0aGUgaG9yaXpvbnRhbCBtb3Rpb24gdG8gYW4gYW1vdW50XHJcbiAgICAgICAgLy8gd2hlcmUgb3ZlcmxhcCB3aWxsIG5vdCBvY2N1ci5cclxuICAgICAgICBhbGxvd2VkSG9yaXpvbnRhbE1vdGlvbiA9IGhvcml6b250YWxEZWx0YTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIENoZWNrIHRoZSB2ZXJ0aWNhbCBtb3Rpb24gYW5kIGxpbWl0IGl0IGlmIG5lY2Vzc2FyeS5cclxuICAgIGNvbnN0IHZlcnRpY2FsRGVsdGEgPSBvYnN0YWNsZUVkZ2VMaW5lcy5ob3Jpem9udGFsRWRnZS5zdGFydC55IC0gbGVhZGluZ0VkZ2VMaW5lcy5ob3Jpem9udGFsRWRnZS5zdGFydC55O1xyXG5cclxuICAgIC8vIFRlc3QgaWYgdGhlIHJlc3RyaWN0ZWQgYm91bmRzIGFyZSB3aXRoaW4gYSBkaXN0YW5jZSBhbmQgb24gYSBzaWRlIHdoZXJlIGludGVyZmVyZW5jZSBjb3VsZCBvY2N1ci5cclxuICAgIGlmICggTWF0aC5hYnMoIHByb3Bvc2VkVHJhbnNsYXRpb24ueSApID4gMCAmJlxyXG4gICAgICAgICAoIE1hdGguc2lnbiggcHJvcG9zZWRUcmFuc2xhdGlvbi55ICkgPT09IE1hdGguc2lnbiggdmVydGljYWxEZWx0YSApIHx8IHZlcnRpY2FsRGVsdGEgPT09IDAgKSAmJlxyXG4gICAgICAgICBNYXRoLmFicyggcHJvcG9zZWRUcmFuc2xhdGlvbi55ICkgPj0gTWF0aC5hYnMoIHZlcnRpY2FsRGVsdGEgKSApIHtcclxuXHJcbiAgICAgIC8vIFRlc3Qgd2hldGhlciB0aGUgbGVhZGluZyBlZGdlIGxpbmUgd291bGQgb3ZlcmxhcCB3aXRoIHRoZSBib3VuZHMgZWRnZSBpZiBwcm9qZWN0ZWQgdG8gdGhlIHNhbWUgbG9jYXRpb24uICBJblxyXG4gICAgICAvLyBvdGhlciB3b3Jkcywgd291bGQgdGhlc2UgdHdvIGxpbmVzIGNvbGxpZGUgd2l0aCBlYWNoIG90aGVyIHdoZW4gbW92ZWQgYnkgdGhlIHByb3Bvc2VkIHRyYW5zbGF0aW9uP1xyXG4gICAgICBjb25zdCB0cmFuc2xhdGlvblNjYWxlRmFjdG9yID0gdmVydGljYWxEZWx0YSAvIHByb3Bvc2VkVHJhbnNsYXRpb24ueTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdHJhbnNsYXRpb25TY2FsZUZhY3RvciA8PSAxLCAnaWYgd2UgaGl0IHRoaXMsIHNvbWV0aGluZyBpcyB3cm9uZyBpbiB0aGUgY29kZSBhYm92ZScgKTtcclxuICAgICAgY29uc3Qgc2NhbGVkRG93blRyYW5zbGF0aW9uID0gcHJvcG9zZWRUcmFuc2xhdGlvbi50aW1lc1NjYWxhciggdHJhbnNsYXRpb25TY2FsZUZhY3RvciApO1xyXG4gICAgICBjb25zdCBwcm9qZWN0ZWRMaW5lU3RhcnRQb2ludCA9IGxlYWRpbmdFZGdlTGluZXMuaG9yaXpvbnRhbEVkZ2Uuc3RhcnQucGx1cyggc2NhbGVkRG93blRyYW5zbGF0aW9uICk7XHJcbiAgICAgIGNvbnN0IHByb2plY3RlZExpbmVFbmRQb2ludCA9IGxlYWRpbmdFZGdlTGluZXMuaG9yaXpvbnRhbEVkZ2UuZW5kLnBsdXMoIHNjYWxlZERvd25UcmFuc2xhdGlvbiApO1xyXG5cclxuICAgICAgLy8gRG9lcyB0aGUgdHJhbnNsYXRlZCBsZWFkaW5nIGVkZ2UgbGluZSBvdmVybGFwIHdpdGggdGhlIHJlc3RyaWN0ZWQgYm91bmRzP1xyXG4gICAgICBjb25zdCBlZGdlTGluZXNPdmVybGFwID0gKCBwcm9qZWN0ZWRMaW5lRW5kUG9pbnQueCA+IG9ic3RhY2xlRWRnZUxpbmVzLmhvcml6b250YWxFZGdlLnN0YXJ0LnggJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdGVkTGluZVN0YXJ0UG9pbnQueCA8IG9ic3RhY2xlRWRnZUxpbmVzLmhvcml6b250YWxFZGdlLmVuZC54ICkgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggcHJvamVjdGVkTGluZVN0YXJ0UG9pbnQueCA8IG9ic3RhY2xlRWRnZUxpbmVzLmhvcml6b250YWxFZGdlLmVuZC54ICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3RlZExpbmVFbmRQb2ludC54ID4gb2JzdGFjbGVFZGdlTGluZXMuaG9yaXpvbnRhbEVkZ2Uuc3RhcnQueCApO1xyXG5cclxuICAgICAgaWYgKCBlZGdlTGluZXNPdmVybGFwICkge1xyXG5cclxuICAgICAgICAvLyBUaGUgcHJvcG9zZWQgdHJhbnNsYXRpb24gd291bGQgY2F1c2UgdGhlIGVkZ2UgbGluZXMgdG8gY29sbGlkZSwgc28gbGltaXQgdGhlIHZlcnRpY2FsIG1vdGlvbiB0byBhbiBhbW91bnRcclxuICAgICAgICAvLyB3aGVyZSBvdmVybGFwIHdpbGwgbm90IG9jY3VyLlxyXG4gICAgICAgIGFsbG93ZWRWZXJ0aWNhbE1vdGlvbiA9IHZlcnRpY2FsRGVsdGE7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoIGFsbG93ZWRIb3Jpem9udGFsTW90aW9uLCBhbGxvd2VkVmVydGljYWxNb3Rpb24gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdpdmVuIHRoZSBsZWFkaW5nIGVkZ2VzIGZvciBhIHJlY3Rhbmd1bGFyIG1vdmluZyBvYmplY3QsIGEgcHJvcG9zZWQgdHJhbnNsYXRpb24sIGFuZCB0aGUgYm91bmRzIGluIHdoaWNoIHRoZSBvYmplY3RcclxuICAgKiBuZWVkcyB0byBiZSBjb250YWluZWQsIHJldHVybiBlaXRoZXIgdGhlIG9yaWdpbmFsIHRyYW5zbGF0aW9uIGlmIG5vIGludGVyYWN0aW9uIHdvdWxkIG9jY3VyIHdpdGggdGhlIGJvdW5kcyBvciBhXHJcbiAgICogcmV2aXNlZCwgbGltaXRlZCB0cmFuc2xhdGlvbiB0aGF0IGlzIHRoZSBhbW91bnQgb2YgbW90aW9uIHBvc3NpYmxlIGJlZm9yZSBoaXR0aW5nIHRoZSBib3VuZHMuXHJcbiAgICogQHBhcmFtIHt7dmVydGljYWxFZGdlOiBMaW5lLCBob3Jpem9udGFsRWRnZTogTGluZSB9fSBsZWFkaW5nRWRnZUxpbmVzXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwcm9wb3NlZFRyYW5zbGF0aW9uXHJcbiAgICogQHBhcmFtIHtCb3VuZHMyfSBib3VuZHNcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn0gLSBlaXRoZXIgYSBjb3B5IG9mIHRoZSBwcm9wb3NlZCB0cmFuc2xhdGlvbiBvciwgaWYgdGhlIG9ic3RhY2xlIGVkZ2VzIHdvdWxkIGludGVyZmVyZSB3aXRoIHRoZVxyXG4gICAqIHByb3Bvc2VkIG1vdGlvbiwgYW5kIGxpbWl0ZWQgdmVyc2lvbiB0aGVyZW9mXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBjaGVja01vdGlvbkFnYWluc3RCb3VuZHMoIGxlYWRpbmdFZGdlTGluZXMsIHByb3Bvc2VkVHJhbnNsYXRpb24sIGJvdW5kcyApIHtcclxuXHJcbiAgICAvLyBJZiB0aGVyZSBpcyBubyBhY3R1YWwgbW90aW9uIHByb3Bvc2VkLCB0aGVyZSBpcyBub3RoaW5nIHRvIGRvIGhlcmUuICBUaGlzIGlzIGRvbmUgYXMgYW4gb3B0aW1pemF0aW9uLlxyXG4gICAgaWYgKCBwcm9wb3NlZFRyYW5zbGF0aW9uLnggPT09IDAgJiYgcHJvcG9zZWRUcmFuc2xhdGlvbi55ID09PSAwICkge1xyXG4gICAgICByZXR1cm4gcHJvcG9zZWRUcmFuc2xhdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhbGxvd2VkVHJhbnNsYXRpb24gPSBwcm9wb3NlZFRyYW5zbGF0aW9uLmNvcHkoKTtcclxuXHJcbiAgICAvLyB4IGRpcmVjdGlvblxyXG4gICAgaWYgKCBwcm9wb3NlZFRyYW5zbGF0aW9uLnggPiAwICkge1xyXG4gICAgICBpZiAoIGxlYWRpbmdFZGdlTGluZXMudmVydGljYWxFZGdlLnN0YXJ0LnggKyBwcm9wb3NlZFRyYW5zbGF0aW9uLnggPiBib3VuZHMubWF4WCApIHtcclxuICAgICAgICBhbGxvd2VkVHJhbnNsYXRpb24uc2V0WCggYm91bmRzLm1heFggLSBsZWFkaW5nRWRnZUxpbmVzLnZlcnRpY2FsRWRnZS5zdGFydC54ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBpZiAoIGxlYWRpbmdFZGdlTGluZXMudmVydGljYWxFZGdlLnN0YXJ0LnggKyBwcm9wb3NlZFRyYW5zbGF0aW9uLnggPCBib3VuZHMubWluWCApIHtcclxuICAgICAgICBhbGxvd2VkVHJhbnNsYXRpb24uc2V0WCggYm91bmRzLm1pblggLSBsZWFkaW5nRWRnZUxpbmVzLnZlcnRpY2FsRWRnZS5zdGFydC54ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyB5IGRpcmVjdGlvblxyXG4gICAgaWYgKCBwcm9wb3NlZFRyYW5zbGF0aW9uLnkgPiAwICkge1xyXG4gICAgICBpZiAoIGxlYWRpbmdFZGdlTGluZXMuaG9yaXpvbnRhbEVkZ2Uuc3RhcnQueSArIHByb3Bvc2VkVHJhbnNsYXRpb24ueSA+IGJvdW5kcy5tYXhZICkge1xyXG4gICAgICAgIGFsbG93ZWRUcmFuc2xhdGlvbi5zZXRZKCBib3VuZHMubWF4WSAtIGxlYWRpbmdFZGdlTGluZXMuaG9yaXpvbnRhbEVkZ2Uuc3RhcnQueSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgaWYgKCBsZWFkaW5nRWRnZUxpbmVzLmhvcml6b250YWxFZGdlLnN0YXJ0LnkgKyBwcm9wb3NlZFRyYW5zbGF0aW9uLnkgPCBib3VuZHMubWluWSApIHtcclxuICAgICAgICBhbGxvd2VkVHJhbnNsYXRpb24uc2V0WSggYm91bmRzLm1pblkgLSBsZWFkaW5nRWRnZUxpbmVzLmhvcml6b250YWxFZGdlLnN0YXJ0LnkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBhbGxvd2VkVHJhbnNsYXRpb247XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGVkZ2VzIG9mIGEgcmVjdGFuZ3VsYXIgb2JqZWN0IHRoYXQgaXMgbW92aW5nIGluIGEgcGFydGljdWxhciBkaXJlY3Rpb24gb3IgdGhhdCBpcyBiZWluZyBtb3ZlZCB0b3dhcmRzLlxyXG4gICAqIFRoZXNlIGVkZ2VzIGFyZSBnZW5lcmFsbHkgdXNlZCB0byB0ZXN0IGZvciBjb2xsaXNpb25zIGJldHdlZW4gb2JqZWN0cy5cclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHByb3Bvc2VkVHJhbnNsYXRpb25cclxuICAgKiBAcGFyYW0ge0JvdW5kczJ9IG9iamVjdEJvdW5kc1xyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZXh0ZXJuYWxQZXJzcGVjdGl2ZSAtIElmIHRydWUsIHJldHVybiB0aGUgZWRnZXMgdGhhdCB3b3VsZCBiZSBlbmNvdW50ZXJlZCBieSBzb21ldGhpbmcgdGhhdCB3YXNcclxuICAgKiBtb3ZpbmcgdG93YXJkcyB0aGlzIG9iamVjdCBpbiB0aGUgZGlyZWN0aW9uIGluZGljYXRlZCBieSB0aGUgdHJhbnNsYXRpb24uICBGb3IgZXhhbXBsZSwgaWYgdGhlIHRyYW5zbGF0aW9uXHJcbiAgICogaW5kaWNhdGVzIG1vdGlvbiB0aGF0IGlzIGRvd24gYW5kIHRvIHRoZSByaWdodCwgdGhlIHRvcCBhbmQgbGVmdCBlZGdlcyBhcmUgcmV0dXJuZWQuICBJZiBmYWxzZSwgYW4gaW50ZXJuYWxcclxuICAgKiBwZXJzcGVjdGl2ZSBpcyBhc3N1bWVkIGFuZCB0aGUgZWRnZXMgYXJlIHByb3ZpZGVkIGFzIGlmIHRoZSB0cmFuc2xhdGlvbiBpcyBvY2N1cnJpbmcgZnJvbSAqaW5zaWRlKiB0aGUgcHJvdmlkZWRcclxuICAgKiByZWN0YW5ndWxhciBvYmplY3QuXHJcbiAgICogQHJldHVybnMge3tob3Jpem9udGFsRWRnZTogTGluZSwgdmVydGljYWxFZGdlOiBMaW5lfX0gLSBhbiBvYmplY3Qgd2l0aCBob3Jpem9udGFsIGFuZCB2ZXJ0aWNhbCBlZGdlc1xyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgZ2V0TW90aW9uRWRnZXMoIHByb3Bvc2VkVHJhbnNsYXRpb24sIG9iamVjdEJvdW5kcywgZXh0ZXJuYWxQZXJzcGVjdGl2ZSA9IHRydWUgKSB7XHJcblxyXG4gICAgbGV0IGhvcml6b250YWxFZGdlO1xyXG4gICAgbGV0IHZlcnRpY2FsRWRnZTtcclxuXHJcbiAgICBpZiAoIHByb3Bvc2VkVHJhbnNsYXRpb24ueCA+IDAgJiYgZXh0ZXJuYWxQZXJzcGVjdGl2ZSB8fCBwcm9wb3NlZFRyYW5zbGF0aW9uLnggPCAwICYmICFleHRlcm5hbFBlcnNwZWN0aXZlICkge1xyXG5cclxuICAgICAgLy8gVGhlIG5lZWRlZCBlZGdlIGlzIHRoZSBsZWZ0IHNpZGUgb2YgdGhlIG9iamVjdCBvciBjb250YWluZXIuXHJcbiAgICAgIHZlcnRpY2FsRWRnZSA9IG5ldyBMaW5lKFxyXG4gICAgICAgIG5ldyBWZWN0b3IyKCBvYmplY3RCb3VuZHMubWluWCwgb2JqZWN0Qm91bmRzLm1pblkgKSxcclxuICAgICAgICBuZXcgVmVjdG9yMiggb2JqZWN0Qm91bmRzLm1pblgsIG9iamVjdEJvdW5kcy5tYXhZIClcclxuICAgICAgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gVGhlIG5lZWRlZCBlZGdlIGlzIHRoZSByaWdodCBzaWRlIG9mIHRoZSBvYmplY3Qgb3IgY29udGFpbmVyLlxyXG4gICAgICB2ZXJ0aWNhbEVkZ2UgPSBuZXcgTGluZShcclxuICAgICAgICBuZXcgVmVjdG9yMiggb2JqZWN0Qm91bmRzLm1heFgsIG9iamVjdEJvdW5kcy5taW5ZICksXHJcbiAgICAgICAgbmV3IFZlY3RvcjIoIG9iamVjdEJvdW5kcy5tYXhYLCBvYmplY3RCb3VuZHMubWF4WSApXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBwcm9wb3NlZFRyYW5zbGF0aW9uLnkgPiAwICYmIGV4dGVybmFsUGVyc3BlY3RpdmUgfHwgcHJvcG9zZWRUcmFuc2xhdGlvbi55IDwgMCAmJiAhZXh0ZXJuYWxQZXJzcGVjdGl2ZSApIHtcclxuXHJcbiAgICAgIC8vIFRoZSBuZWVkZWQgZWRnZSBpcyB0aGUgdG9wIG9mIHRoZSBvYmplY3Qgb3IgY29udGFpbmVyIChwb3NpdGl2ZSBZIGlzIGluIHRoZSBkb3dud2FyZCBkaXJlY3Rpb24pLlxyXG4gICAgICBob3Jpem9udGFsRWRnZSA9IG5ldyBMaW5lKFxyXG4gICAgICAgIG5ldyBWZWN0b3IyKCBvYmplY3RCb3VuZHMubWluWCwgb2JqZWN0Qm91bmRzLm1pblkgKSxcclxuICAgICAgICBuZXcgVmVjdG9yMiggb2JqZWN0Qm91bmRzLm1heFgsIG9iamVjdEJvdW5kcy5taW5ZIClcclxuICAgICAgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gVGhlIG5lZWRlZCBlZGdlIGlzIHRoZSBib3R0b20gb2YgdGhlIG9iamVjdCBvciBjb250YWluZXIgKHBvc2l0aXZlIFkgaXMgaW4gdGhlIGRvd253YXJkIGRpcmVjdGlvbikuXHJcbiAgICAgIGhvcml6b250YWxFZGdlID0gbmV3IExpbmUoXHJcbiAgICAgICAgbmV3IFZlY3RvcjIoIG9iamVjdEJvdW5kcy5taW5YLCBvYmplY3RCb3VuZHMubWF4WSApLFxyXG4gICAgICAgIG5ldyBWZWN0b3IyKCBvYmplY3RCb3VuZHMubWF4WCwgb2JqZWN0Qm91bmRzLm1heFkgKVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGhvcml6b250YWxFZGdlOiBob3Jpem9udGFsRWRnZSxcclxuICAgICAgdmVydGljYWxFZGdlOiB2ZXJ0aWNhbEVkZ2VcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHaXZlbiBhIHByb3Bvc2VkIHRyYW5zbGF0aW9uLCB0ZXN0IHdoZXRoZXIgdGhlIG1hZ25ldCBjYW4gYmUgdHJhbnNsYXRlZCBieSB0aGF0IGFtb3VudCB3aXRob3V0IHJ1bm5pbmcgaW50byBhbnlcclxuICAgKiByZXN0cmljdGVkIGFyZWFzIG9yIGhpdHRpbmcgdGhlIGJvdW5kcy4gIElmIGl0IGNhbiwgdGhlIG9yaWdpbmFsIHByb3Bvc2VkIHRyYW5zbGF0aW9uIGlzIHJldHVybmVkLiAgSWYgdGhlIG1hZ25ldFxyXG4gICAqIHdvdWxkIHJ1biBpbnRvIGEgcmVzdHJpY3RlZCBhcmVhIG9yIGhpdCB0aGUgYm91bmRzLCByZXR1cm4gYSB0cmFuc2xhdGlvbiB0aGF0IHJlcHJlc2VudHMgdGhlIGFtb3VudCBvZiBtb3Rpb24gdGhhdFxyXG4gICAqIHdvdWxkIG1vdmUgdGhlIG1hZ25ldCB0byB0aGUgZWRnZSBvZiB0aGUgcmVzdHJpY3Rpb24uXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwcm9wb3NlZFRyYW5zbGF0aW9uXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGNoZWNrUHJvcG9zZWRNYWduZXRNb3Rpb24oIHByb3Bvc2VkVHJhbnNsYXRpb24gKSB7XHJcblxyXG4gICAgLy8gR2V0IGEgc2V0IG9mIGxpbmVzIHRoYXQgcmVwcmVzZW50IHRoZSBsZWFkaW5nIGVkZ2VzIG9mIHRoZSBtYWduZXQgaWYgaXQgaXMgbW92ZWQgdXNpbmcgdGhlIHByb3Bvc2VkIHRyYW5zbGF0aW9uLlxyXG4gICAgY29uc3QgbGVhZGluZ01hZ25ldEVkZ2VzID0gdGhpcy5nZXRNb3Rpb25FZGdlcyggcHJvcG9zZWRUcmFuc2xhdGlvbiwgdGhpcy5tYWduZXQuZ2V0Qm91bmRzKCksIGZhbHNlICk7XHJcblxyXG4gICAgLy8gTWFrZSBhIGxpc3Qgb2YgdGhlIHJlc3RyaWN0ZWQgYm91bmRzIHRoYXQgY291bGQgYmxvY2sgdGhlIG1hZ25ldCdzIG1vdGlvbi4gIFRoaXMgdmFyaWVzIGJhc2VkIG9uIHdoaWNoIGNvaWxzIGFyZVxyXG4gICAgLy8gY3VycmVudGx5IHZpc2libGUuXHJcbiAgICBsZXQgcmVzdHJpY3RlZEJvdW5kc0xpc3QgPSBbIC4uLnRoaXMuYm90dG9tQ29pbFJlc3RyaWN0ZWRCb3VuZHMgXTtcclxuICAgIGlmICggdGhpcy50b3BDb2lsVmlzaWJsZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICByZXN0cmljdGVkQm91bmRzTGlzdCA9IHRoaXMuYm90dG9tQ29pbFJlc3RyaWN0ZWRCb3VuZHMuY29uY2F0KCB0aGlzLnRvcENvaWxSZXN0cmljdGVkQm91bmRzICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGVzdCB0aGUgcHJvcG9zZWQgbW90aW9uIGFnYWluc3QgdGhlIHJlc3RyaWN0ZWQgYm91bmRzLlxyXG4gICAgbGV0IHNtYWxsZXN0QWxsb3dlZFRyYW5zbGF0aW9uID0gcHJvcG9zZWRUcmFuc2xhdGlvbi5jb3B5KCk7XHJcbiAgICByZXN0cmljdGVkQm91bmRzTGlzdC5mb3JFYWNoKCByZXN0cmljdGVkQm91bmRzID0+IHtcclxuICAgICAgY29uc3Qgb2JzdGFjbGVFZGdlTGluZXMgPSB0aGlzLmdldE1vdGlvbkVkZ2VzKCBwcm9wb3NlZFRyYW5zbGF0aW9uLCByZXN0cmljdGVkQm91bmRzICk7XHJcbiAgICAgIGNvbnN0IGFsbG93ZWRUcmFuc2xhdGlvbiA9IHRoaXMuY2hlY2tNb3Rpb25BZ2FpbnN0T2JzdGFjbGVzKFxyXG4gICAgICAgIGxlYWRpbmdNYWduZXRFZGdlcyxcclxuICAgICAgICBwcm9wb3NlZFRyYW5zbGF0aW9uLFxyXG4gICAgICAgIG9ic3RhY2xlRWRnZUxpbmVzXHJcbiAgICAgICk7XHJcbiAgICAgIGlmICggIWFsbG93ZWRUcmFuc2xhdGlvbi5lcXVhbHMoIHByb3Bvc2VkVHJhbnNsYXRpb24gKSApIHtcclxuXHJcbiAgICAgICAgLy8gQW4gb2JzdGFjbGUgd2FzIGVuY291bnRlcmVkLCBzbyBsaW1pdCB0aGUgYWxsb3dlZCBtb3Rpb24uXHJcbiAgICAgICAgaWYgKCBzbWFsbGVzdEFsbG93ZWRUcmFuc2xhdGlvbi5tYWduaXR1ZGUgPiBhbGxvd2VkVHJhbnNsYXRpb24ubWFnbml0dWRlICkge1xyXG4gICAgICAgICAgc21hbGxlc3RBbGxvd2VkVHJhbnNsYXRpb24gPSBhbGxvd2VkVHJhbnNsYXRpb247XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVGVzdCBhZ2FpbnN0IHRoZSBlZGdlcyBvZiB0aGUgc2ltIGFyZWEuXHJcbiAgICBzbWFsbGVzdEFsbG93ZWRUcmFuc2xhdGlvbiA9IHRoaXMuY2hlY2tNb3Rpb25BZ2FpbnN0Qm91bmRzKFxyXG4gICAgICBsZWFkaW5nTWFnbmV0RWRnZXMsXHJcbiAgICAgIHNtYWxsZXN0QWxsb3dlZFRyYW5zbGF0aW9uLFxyXG4gICAgICB0aGlzLmJvdW5kc1xyXG4gICAgKTtcclxuXHJcbiAgICByZXR1cm4gc21hbGxlc3RBbGxvd2VkVHJhbnNsYXRpb247XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb3ZlIHRoZSBtYWduZXQgdG8gdGhlIHByb3Bvc2VkIHBvc2l0aW9uIHVubGVzcyBkb2luZyBzbyB3b3VsZCBjYXVzZSBpdCB0byBtb3ZlIHRocm91Z2ggb2JzdGFjbGVzIG9yIG91dCBvZiB0aGVcclxuICAgKiBzaW0gYm91bmRzLiAgSW4gdGhvc2UgY2FzZXMsIGxpbWl0IHRoZSBtb3Rpb24gdG8gd2hhdCBjYW4gYmUgYWxsb3dlZC4gIFRoaXMgYWxzbyBmaXJlcyBlbWl0dGVycyB3aGVuIHRoZSBtYWduZXRcclxuICAgKiBydW5zIGludG8gYSByZXN0cmljdGVkIGFyZWEgb3IgdGhlIHNpbSBib3VuZHMuXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwcm9wb3NlZFBvc2l0aW9uIC0gYSBwcm9wb3NlZCBwb3NpdGlvbiBmb3IgdGhlIG1hZ25ldFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBtb3ZlTWFnbmV0VG9Qb3NpdGlvbiggcHJvcG9zZWRQb3NpdGlvbiApIHtcclxuXHJcbiAgICBjb25zdCBwcm9wb3NlZFRyYW5zbGF0aW9uID0gcHJvcG9zZWRQb3NpdGlvbi5taW51cyggdGhpcy5tYWduZXQucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApO1xyXG5cclxuICAgIC8vIFRlc3QgdGhlIHByb3Bvc2VkIG1vdGlvbiBhZ2FpbnN0IHRoZSBwb3RlbnRpYWwgb2JzdGFjbGVzIGFuZCB0aGUgc2ltIGJvdW5kcy5cclxuICAgIGNvbnN0IGFsbG93ZWRUcmFuc2xhdGlvbiA9IHRoaXMuY2hlY2tQcm9wb3NlZE1hZ25ldE1vdGlvbiggcHJvcG9zZWRUcmFuc2xhdGlvbiApO1xyXG5cclxuICAgIC8vIFNldCB0aGUgcmVzdWx0YW50IHBvc2l0aW9uIGZvciB0aGUgbWFnbmV0LlxyXG4gICAgY29uc3QgbmV3UG9zaXRpb24gPSB0aGlzLm1hZ25ldC5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnBsdXMoIGFsbG93ZWRUcmFuc2xhdGlvbiApO1xyXG4gICAgdGhpcy5tYWduZXQucG9zaXRpb25Qcm9wZXJ0eS5zZXQoIG5ld1Bvc2l0aW9uICk7XHJcblxyXG4gICAgLy8gRmlndXJlIG91dCB3aGF0IHRoZSBib3VuZHMgZW5kZWQgdXAgYmVpbmcuXHJcbiAgICBjb25zdCBuZXdNYWduZXRCb3VuZHMgPSB0aGlzLm1hZ25ldC5nZXRCb3VuZHMoKTtcclxuXHJcbiAgICAvLyBNYWtlIGEgbGlzdCBvZiB0aGUgYWN0aXZlIHJlc3RyaWN0ZWQgYm91bmRzIGZvciB0ZXN0aW5nIHdoZXRoZXIgdGhlIG1hZ25ldCBoYXMgYnVtcGVkIHVwIGFnYWluc3QgYW55IG9mIHRoZW0uXHJcbiAgICBsZXQgcmVzdHJpY3RlZEJvdW5kc0xpc3QgPSBbIC4uLnRoaXMuYm90dG9tQ29pbFJlc3RyaWN0ZWRCb3VuZHMgXTtcclxuICAgIGlmICggdGhpcy50b3BDb2lsVmlzaWJsZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICByZXN0cmljdGVkQm91bmRzTGlzdCA9IHRoaXMuYm90dG9tQ29pbFJlc3RyaWN0ZWRCb3VuZHMuY29uY2F0KCB0aGlzLnRvcENvaWxSZXN0cmljdGVkQm91bmRzICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hlY2sgd2hldGhlciB0aGUgcG9zaXRpb24gaGFzIGNoYW5nZWQgc3VjaCB0aGF0IHRoZSBtYWduZXQgaGFzIGhpdCBhIGJvdW5kYXJ5IG9yIGEgcmVzdHJpY3RlZCBhcmVhLlxyXG4gICAgaWYgKCB0aGlzLnByZXZpb3VzTWFnbmV0Qm91bmRzICkge1xyXG5cclxuICAgICAgY29uc3QgbWFnbmV0TW90aW9uQm91bmRzID0gdGhpcy5ib3VuZHM7XHJcblxyXG4gICAgICAvLyBJZiB0aGUgbWFnbmV0IGlzIG5vdyB1cCBhZ2FpbnN0IHRoZSBib3VuZHMsIGFuZCBpdCB3YXNuJ3QgYmVmb3JlLCBmaXJlIHRoZSBlZGdlQnVtcEVtaXR0ZXIuXHJcbiAgICAgIGlmICggKCB0aGlzLnByZXZpb3VzTWFnbmV0Qm91bmRzLm1heFggPCBtYWduZXRNb3Rpb25Cb3VuZHMubWF4WCAmJiBuZXdNYWduZXRCb3VuZHMubWF4WCA+PSBtYWduZXRNb3Rpb25Cb3VuZHMubWF4WCApIHx8XHJcbiAgICAgICAgICAgKCB0aGlzLnByZXZpb3VzTWFnbmV0Qm91bmRzLm1pblggPiBtYWduZXRNb3Rpb25Cb3VuZHMubWluWCAmJiBuZXdNYWduZXRCb3VuZHMubWluWCA8PSBtYWduZXRNb3Rpb25Cb3VuZHMubWluWCApIHx8XHJcbiAgICAgICAgICAgKCB0aGlzLnByZXZpb3VzTWFnbmV0Qm91bmRzLm1heFkgPCBtYWduZXRNb3Rpb25Cb3VuZHMubWF4WSAmJiBuZXdNYWduZXRCb3VuZHMubWF4WSA+PSBtYWduZXRNb3Rpb25Cb3VuZHMubWF4WSApIHx8XHJcbiAgICAgICAgICAgKCB0aGlzLnByZXZpb3VzTWFnbmV0Qm91bmRzLm1pblkgPiBtYWduZXRNb3Rpb25Cb3VuZHMubWluWSAmJiBuZXdNYWduZXRCb3VuZHMubWluWSA8PSBtYWduZXRNb3Rpb25Cb3VuZHMubWluWSApXHJcbiAgICAgICkge1xyXG4gICAgICAgIHRoaXMuZWRnZUJ1bXBFbWl0dGVyLmVtaXQoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ2hlY2sgd2hldGhlciBhbnkgcmVzdHJpY3RlZCBib3VuZHMgaGF2ZSBiZWVuIGhpdCBhbmQgZmlyZSBhbiBlbWl0dGVyIGlmIHNvLlxyXG4gICAgICByZXN0cmljdGVkQm91bmRzTGlzdC5mb3JFYWNoKCByZXN0cmljdGVkQm91bmRzID0+IHtcclxuICAgICAgICBpZiAoIHJlc3RyaWN0ZWRCb3VuZHMuaW50ZXJzZWN0c0JvdW5kcyggbmV3TWFnbmV0Qm91bmRzICkgKSB7XHJcbiAgICAgICAgICBpZiAoICFyZXN0cmljdGVkQm91bmRzLmludGVyc2VjdHNCb3VuZHMoIHRoaXMucHJldmlvdXNNYWduZXRCb3VuZHMgKSApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBtYWduZXQgaGFzIGNvbWUgaW50byBjb250YWN0IHdpdGggc29tZSByZXN0cmljdGVkIGJvdW5kcyB3aXRoIHdoaWNoIGl0IHdhcyBOT1QgaW4gY29udGFjdCBkdXJpbmcgdGhlXHJcbiAgICAgICAgICAgIC8vIHByZXZpb3VzIG1vdmVtZW50LiAgRW1pdCB0aGUgYXBwcm9wcmlhdGUgc2lnbmFsLlxyXG4gICAgICAgICAgICBpZiAoIHRoaXMuYm90dG9tQ29pbFJlc3RyaWN0ZWRCb3VuZHMuaW5jbHVkZXMoIHJlc3RyaWN0ZWRCb3VuZHMgKSApIHtcclxuICAgICAgICAgICAgICB0aGlzLmNvaWxCdW1wRW1pdHRlci5lbWl0KCBDb2lsVHlwZUVudW0uRk9VUl9DT0lMICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5jb2lsQnVtcEVtaXR0ZXIuZW1pdCggQ29pbFR5cGVFbnVtLlRXT19DT0lMICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBLZWVwIGEgcmVjb3JkIG9mIHRoZSBtYWduZXQgYm91bmRzIHNvIHRoYXQgYnVtcHMgY2FuIGJlIGRldGVjdGVkLlxyXG4gICAgdGhpcy5wcmV2aW91c01hZ25ldEJvdW5kcyA9IG5ld01hZ25ldEJvdW5kcztcclxuICB9XHJcbn1cclxuXHJcbmZhcmFkYXlzTGF3LnJlZ2lzdGVyKCAnRmFyYWRheXNMYXdNb2RlbCcsIEZhcmFkYXlzTGF3TW9kZWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgRmFyYWRheXNMYXdNb2RlbDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsT0FBTyxNQUFNLGdDQUFnQztB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