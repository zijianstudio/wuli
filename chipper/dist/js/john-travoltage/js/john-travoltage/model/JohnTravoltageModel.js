// Copyright 2013-2022, University of Colorado Boulder

/**
 * Model for John Travoltage.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Vasily Shakhov (Mlearner.com)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import PhetioGroup from '../../../../tandem/js/PhetioGroup.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import johnTravoltage from '../../johnTravoltage.js';
import Arm from './Arm.js';
import Electron from './Electron.js';
import Leg from './Leg.js';
import LineSegment from './LineSegment.js';

// constants
const MAX_ELECTRONS = 100;
const FOOT_ON_CARPET_MIN_ANGLE = 1; // in radians, empirically determined
const FOOT_ON_CARPET_MAX_ANGLE = 2.4; // in radians, empirically determined

class JohnTravoltageModel {
  /**
   * @param {Tandem} tandem
   */
  constructor(tandem) {
    this.electronsToRemove = [];

    //vertices of path, border of body, sampled using a listener in DebugUtils - the charges in
    //this sim are constrained to this shape
    this.bodyVertices = [new Vector2(422.21508828250404, 455.370786516854), new Vector2(403.10754414125205, 424.5521669341895), new Vector2(379.68539325842704, 328.3980738362762), new Vector2(357.4959871589086, 335.17817014446234), new Vector2(309.4189406099519, 448.5906902086678), new Vector2(322.362760834671, 473.86195826645275), new Vector2(284.14767255216697, 461.5345104333869), new Vector2(327.9101123595506, 341.95826645264856), new Vector2(281.6821829855538, 296.34670947030503), new Vector2(286.6131621187801, 202.65810593900486), new Vector2(318.66452648475126, 147.800963081862), new Vector2(349.48314606741576, 118.83146067415731), new Vector2(387.08186195826653, 110.20224719101125), new Vector2(407.42215088282506, 75.06902086677371), new Vector2(425.9133226324238, 75.06902086677371), new Vector2(439.4735152487962, 85.54735152487964), new Vector2(433.9261637239166, 118.21508828250404), new Vector2(420.9823434991975, 126.2279293739968), new Vector2(403.7239165329053, 128.07704654895667), new Vector2(393.2455858747994, 142.25361155698238), new Vector2(408.0385232744784, 171.22311396468703), new Vector2(423.44783306581064, 221.14927768860358), new Vector2(487.5505617977529, 217.45104333868383), new Vector2(485.701444622793, 228.54574638844306), new Vector2(432.07704654895673, 240.25682182985557), new Vector2(392.0128410914928, 224.23113964687002), new Vector2(390.7800963081863, 280.9373996789728), new Vector2(404.34028892455865, 319.1524879614768), new Vector2(414.81861958266455, 404.2118780096309), new Vector2(435.15890850722315, 433.18138041733556), new Vector2(464.1284109149278, 433.79775280898883)];

    // outline of the entire image of johns body excluding the draggable arm and leg - used
    // to determine if pointer is currently over the body shape for accessibility prototyping
    this.touchableBodyVertices = [new Vector2(267.6994577846631, 311.2625871417506), new Vector2(267.1045701006972, 219.64988381099923), new Vector2(305.7722695584818, 136.96049573973664), new Vector2(340.2757552285051, 108.40588690937257), new Vector2(366.45081332300543, 99.48257164988381), new Vector2(379.53834237025563, 100.07745933384972), new Vector2(404.5236250968242, 63.78931061192873), new Vector2(443.7862122385748, 68.54841208365607), new Vector2(459.25329202168865, 80.44616576297443), new Vector2(452.11463981409764, 90.55925639039503), new Vector2(447.95042602633623, 123.2780790085205), new Vector2(433.6731216111542, 139.9349341595662), new Vector2(397.3849728892332, 141.12470952749806), new Vector2(395.60030983733543, 252.3687064291247), new Vector2(403.9287374128583, 287.4670797831139), new Vector2(338.4910921766073, 295.2006196746708), new Vector2(336.1115414407436, 423.6963594113091), new Vector2(316.4802478698684, 457.60495739736643), new Vector2(339.6808675445391, 476.04647560030986), new Vector2(333.73199070488, 492.10844306738966), new Vector2(271.2687838884586, 481.40046475600315), new Vector2(271.8636715724245, 448.08675445391174), new Vector2(309.9364833462433, 358.2587141750581), new Vector2(267.6994577846631, 310.6676994577847)];

    //lines, to which electrons moves, when spark happened
    this.forceLines = [new LineSegment(300.6483412322275, 443.79905213270143, 341.41421800947865, 338.97251184834124), new LineSegment(341.41421800947865, 335.33270142180095, 373.44454976303314, 204.29952606635067), new LineSegment(423.6739336492891, 438.703317535545, 406.2028436018957, 406.6729857819905), new LineSegment(406.2028436018957, 405.2170616113744, 393.0995260663507, 330.2369668246445), new LineSegment(392.37156398104264, 327.3251184834123, 375.6284360189573, 253.80094786729856), new LineSegment(377.08436018957343, 212.30710900473932, 395.28341232227484, 205.02748815165873), new LineSegment(398.92322274881514, 206.48341232227486, 418.5781990521327, 225.4104265402843), new LineSegment(418.5781990521327, 225.4104265402843, 516.8530805687203, 219.58672985781985), new LineSegment(417.85023696682464, 100.9289099526066, 385.81990521327015, 127.13554502369666), new LineSegment(379.9962085308057, 134.41516587677722, 366.89289099526064, 167.17345971563978), new LineSegment(369.8047393364929, 172.26919431279617, 392.37156398104264, 195.563981042654), new LineSegment(317.3914691943128, 255.98483412322273, 355.9734597156398, 222.4985781990521)];

    // vertices of the carpet shape in the background, determined with the listeners in DebugUtils
    this.carpetVertices = [new Vector2(126.67410358565739, 492.91474103585665), new Vector2(233.76573705179285, 446.4063745019921), new Vector2(580.7426294820718, 447.01832669322715), new Vector2(520.1593625498009, 495.3625498007969)];
    this.doorknobPosition = new Vector2(548.4318903113076, 257.5894162536105);

    //Properties of the model.  All user settings belong in the model, whether or not they are part of the physical model
    this.sparkVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('sparkVisibleProperty')
    });

    // true when a reset is in progress
    this.resetInProgressProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('resetInProgressProperty')
    });
    this.electronGroup = new PhetioGroup(tandem => {
      const segment = new LineSegment(424.0642054574639, 452.28892455858755, 433.3097913322633, 445.5088282504014);
      const v = segment.vector;
      const rand = dotRandom.nextDouble() * v.magnitude;
      const point = segment.p0.plus(v.normalized().times(rand));
      return new Electron(point.x, point.y, this, {
        tandem: tandem
      });
    }, [], {
      tandem: tandem.createTandem('electronGroup'),
      phetioType: PhetioGroup.PhetioGroupIO(Electron.ElectronIO)
    });
    this.arm = new Arm(tandem.createTandem('arm'));
    this.leg = new Leg(tandem.createTandem('leg'));
    this.legAngleAtPreviousStep = this.leg.angleProperty.get();

    // @public (read-only) - closed shape for the body that contains electrons, from body vertices above
    this.bodyShape = JohnTravoltageModel.createObjectShape(this.bodyVertices);

    // @public (read-only) - closed shape for the carpet in this sim
    this.carpetShape = JohnTravoltageModel.createObjectShape(this.carpetVertices);

    // @public - shape for the body, used to explore haptic feedback which is presented whenever
    // a pointer interacts with this shape - has no impact on electron motion
    this.touchableBodyShape = JohnTravoltageModel.createObjectShape(this.touchableBodyVertices);

    // @public - emitters for reset and step events
    this.stepEmitter = new Emitter({
      parameters: [{
        valueType: 'number'
      }]
    });

    // @public - emitter called when the reset all button is pressed
    this.resetEmitter = new Emitter({
      tandem: tandem.createTandem('resetEmitter')
    });

    // @public (a11y) - emitter for when an electron discharge finishes or is canceled
    this.dischargeEndedEmitter = new Emitter({
      tandem: tandem.createTandem('dischargeEndedEmitter')
    });

    // @public (a11y) - emits an event when the discharge starts
    this.dischargeStartedEmitter = new Emitter({
      tandem: tandem.createTandem('dischargeStartedEmitter')
    });

    // @public {number} - Number of electrons that left the body in a particular discharge event, resets to 0
    this.numberOfElectronsDischarged = 0;

    // updates the number of electrons discharged in a discharge event
    let numberOfElectronsOnDischargeStart = 0;
    this.dischargeStartedEmitter.addListener(() => {
      numberOfElectronsOnDischargeStart = this.electronGroup.count;
    });
    this.dischargeEndedEmitter.addListener(() => {
      this.numberOfElectronsDischarged = numberOfElectronsOnDischargeStart - this.electronGroup.count;
    });

    //--------------------------------------------------------------------------
    // The following Properties are being used to explore haptic feedback, they
    // are to be used in prototypes and view representations are hidden behind
    // query parameters
    //--------------------------------------------------------------------------

    // TODO: consider an encapsulation for these "touching" Properties
    // @public - true when a pointer is down over the body
    this.touchingBodyProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('touchingBodyProperty')
    });

    // @public - true when a pointer is down over the carpet
    this.touchingCarpetProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('touchingCarpetProperty')
    });
    this.touchingArmProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('touchingArmProperty')
    });
    this.touchingLegProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('touchingLegProperty')
    });

    // TODO: consider moving such an emitter to utteranceQueue if this is useful
    this.utteranceAddedEmitter = new Emitter({
      parameters: [{
        name: 'utterance',
        phetioType: StringIO
      }],
      tandem: tandem.createTandem('utterance')
    });

    //If leg dragged across carpet, add electron.  Lazy link so that it won't add an electron when the sim starts up.
    //The number of electrons accumulated only depends on the total angle subtended
    let lastAngle = this.leg.angleProperty.get();
    let accumulatedAngle = 0;
    const accumulatedAngleThreshold = Math.PI / 16;
    this.leg.angleProperty.lazyLink(angle => {
      if (angle > FOOT_ON_CARPET_MIN_ANGLE && angle < FOOT_ON_CARPET_MAX_ANGLE && this.electronGroup.count < MAX_ELECTRONS && !phet.joist.sim.isSettingPhetioStateProperty.value) {
        // PhET-iO state handles creating its own electrons

        accumulatedAngle += Math.abs(angle - lastAngle);
        while (accumulatedAngle > accumulatedAngleThreshold) {
          if (this.electronGroup.count < MAX_ELECTRONS) {
            this.electronGroup.createNextElement();
          }
          accumulatedAngle -= accumulatedAngleThreshold;
        }
      }
      lastAngle = angle;
    });

    // reset angle counting variables when the sim is reset - does not need to be disposed
    this.resetEmitter.addListener(() => {
      lastAngle = this.leg.angleProperty.initialValue;
      accumulatedAngle = 0;

      // reset the number of electrons discharged for next discharge event
      this.numberOfElectronsDischarged = 0;
    });
    const array = [];
    for (let i = 0; i < this.bodyVertices.length - 1; i++) {
      const current = this.bodyVertices[i];
      const next = this.bodyVertices[i + 1];
      array.push(new LineSegment(current.x, current.y, next.x, next.y));
    }
    const lineSegment = new LineSegment(this.bodyVertices[this.bodyVertices.length - 1].x, this.bodyVertices[this.bodyVertices.length - 1].y, this.bodyVertices[0].x, this.bodyVertices[0].y);
    array.push(lineSegment);
    this.lineSegments = array;
  }

  /**
   * Reset the model when "Reset All" is pressed.
   * @public
   */
  reset() {
    // Properties of the model.  All user settings belong in the model, whether or not they are part of the physical model
    this.resetInProgressProperty.set(true);
    this.resetEmitter.emit();
    this.sparkVisibleProperty.reset();
    this.arm.reset();
    this.leg.reset();
    this.electronGroup.clear();
    this.resetInProgressProperty.set(false);
  }

  /**
   * Main step function for the model, called by animation loop in Sim.
   * @param  {number} dt - seconds
   * @public
   */
  step(dt) {
    //Clamp dt, since navigating to another tab and back gives the particles an apparent burst of energy, see #25
    if (dt > 2 / 60) {
      dt = 2 / 60;
    }

    // Test for spark.  Check every step so that newly added electrons can be assigned to exit if the threshold is still exceeded, see #27
    // If the finger is touching the doorknob, discharge everything
    const distToKnob = this.arm.getFingerPosition().distance(this.doorknobPosition);

    // Minimum distance the finger can be to the knob, if pointed directly at it.  Sampled at runtime by printing angles.  Must be adjusted if the doorknob position is adjusted.
    const actualMin = 15;
    const query = this.electronGroup.count / distToKnob;
    const threshold = 10 / actualMin;
    const electronThresholdExceeded = query > threshold;
    if (electronThresholdExceeded) {
      this.sparkCreationDistToKnob = distToKnob;

      //Mark all electrons for exiting
      for (let j = 0; j < this.electronGroup.count; j++) {
        this.electronGroup.getElement(j).exiting = true;
      }
    }

    // If we are under the threshold, consider stopping the spark, but only if no electrons are close to the finger
    else {
      // Stop the spark, but only if the finger has moved further enough from the doorknob
      // Use an increased threshold to model the more conductive path once the spark has started
      if (this.sparkCreationDistToKnob && distToKnob > this.sparkCreationDistToKnob + 10) {
        for (let k = 0; k < this.electronGroup.count; k++) {
          const electron = this.electronGroup.getElement(k);

          //Tune the distance threshold to make sure the spark will shut off more quickly when the finger moved far from the doorknob, but not soo small that electrons can leak out of the body, see #27
          if (electron.positionProperty.get().distance(this.doorknobPosition) > 100) {
            const wasExiting = electron.exiting;
            electron.exiting = false;

            //Choose a new nearest segment when traveling toward finger again
            electron.segment = null;
            electron.lastSegment = null;

            //Ensure the electron is within the bounds of the body
            if (wasExiting) {
              this.moveElectronInsideBody(electron);
            }
          }
        }
      }
    }

    // Step the model
    const length = this.electronGroup.count;
    for (let i = 0; i < length; i++) {
      this.electronGroup.getElement(i).step(dt);
    }
    const wasSpark = this.sparkVisibleProperty.get();
    if (this.electronsToRemove.length) {
      this.sparkVisibleProperty.set(true);
    }
    if (!wasSpark && this.sparkVisibleProperty.get()) {
      // spark is just turning visible, notify that a dischage has started
      this.dischargeStartedEmitter.emit();
    }
    while (this.electronsToRemove.length) {
      this.electronGroup.disposeElement(this.electronsToRemove.pop());
    }
    if (this.electronGroup.count === 0 || _.filter(this.electronGroup.getArray(), exiting).length === 0) {
      // Make sure the spark shows at least one frame for a single electron exiting, see #55
      if (wasSpark) {
        this.sparkVisibleProperty.set(false);
        delete this.sparkCreationDistToKnob;
        this.dischargeEndedEmitter.emit();
      }
    }
    this.leg.angularVelocityProperty.set((this.leg.angleProperty.get() - this.legAngleAtPreviousStep) / dt);
    this.legAngleAtPreviousStep = this.leg.angleProperty.get();
    this.stepEmitter.emit(dt);
  }

  /**
   * Electrons can get outside of the body when moving to the spark.  This code moves an electron back inside
   * if this happens.
   * @param  {Electron} electron
   * @public
   */
  moveElectronInsideBody(electron) {
    const pt = electron.positionProperty.get();

    //Adjacent segments share vertices, so use a point just before the vertex to find the closest segment, see https://github.com/phetsims/john-travoltage/issues/50
    const closestSegment = _.minBy(this.lineSegments, lineSegment => Utils.distToSegmentSquared(pt, lineSegment.pre0, lineSegment.pre1));
    const vector = pt.minus(closestSegment.center);
    if (vector.dot(closestSegment.normal) > 0) {
      //put it 1px inside the segment
      electron.positionProperty.set(closestSegment.center.plus(closestSegment.normal.times(-1)));
    }
  }

  /**
   * @param point
   * @returns {boolean}
   * @public
   */
  bodyContainsPoint(point) {
    return this.bodyShape.containsPoint(point);
  }

  // statics

  /**
   * Create a shape that defines an object. Vertices are provided and generally determined by inspection with the
   * DebugUtils.debugPositions.
   * @private
   * @static
   *
   * @returns {Shape}
   */
  static createObjectShape(vertices) {
    const objectShape = new Shape();
    objectShape.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 0; i < vertices.length; i++) {
      objectShape.lineTo(vertices[i].x, vertices[i].y);
    }
    objectShape.close();
    return objectShape;
  }
}

// max number of electrons that can be inside the body
JohnTravoltageModel.MAX_ELECTRONS = MAX_ELECTRONS;

// min and max angle where foot is on carpet, in radians
JohnTravoltageModel.FOOT_ON_CARPET_MIN_ANGLE = FOOT_ON_CARPET_MIN_ANGLE;
JohnTravoltageModel.FOOT_ON_CARPET_MAX_ANGLE = FOOT_ON_CARPET_MAX_ANGLE;

//Function to determine if electrons are exiting.
const exiting = e => e.exiting;
johnTravoltage.register('JohnTravoltageModel', JohnTravoltageModel);
export default JohnTravoltageModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbWl0dGVyIiwiZG90UmFuZG9tIiwiVXRpbHMiLCJWZWN0b3IyIiwiU2hhcGUiLCJQaGV0aW9Hcm91cCIsIlN0cmluZ0lPIiwiam9oblRyYXZvbHRhZ2UiLCJBcm0iLCJFbGVjdHJvbiIsIkxlZyIsIkxpbmVTZWdtZW50IiwiTUFYX0VMRUNUUk9OUyIsIkZPT1RfT05fQ0FSUEVUX01JTl9BTkdMRSIsIkZPT1RfT05fQ0FSUEVUX01BWF9BTkdMRSIsIkpvaG5UcmF2b2x0YWdlTW9kZWwiLCJjb25zdHJ1Y3RvciIsInRhbmRlbSIsImVsZWN0cm9uc1RvUmVtb3ZlIiwiYm9keVZlcnRpY2VzIiwidG91Y2hhYmxlQm9keVZlcnRpY2VzIiwiZm9yY2VMaW5lcyIsImNhcnBldFZlcnRpY2VzIiwiZG9vcmtub2JQb3NpdGlvbiIsInNwYXJrVmlzaWJsZVByb3BlcnR5IiwiY3JlYXRlVGFuZGVtIiwicmVzZXRJblByb2dyZXNzUHJvcGVydHkiLCJlbGVjdHJvbkdyb3VwIiwic2VnbWVudCIsInYiLCJ2ZWN0b3IiLCJyYW5kIiwibmV4dERvdWJsZSIsIm1hZ25pdHVkZSIsInBvaW50IiwicDAiLCJwbHVzIiwibm9ybWFsaXplZCIsInRpbWVzIiwieCIsInkiLCJwaGV0aW9UeXBlIiwiUGhldGlvR3JvdXBJTyIsIkVsZWN0cm9uSU8iLCJhcm0iLCJsZWciLCJsZWdBbmdsZUF0UHJldmlvdXNTdGVwIiwiYW5nbGVQcm9wZXJ0eSIsImdldCIsImJvZHlTaGFwZSIsImNyZWF0ZU9iamVjdFNoYXBlIiwiY2FycGV0U2hhcGUiLCJ0b3VjaGFibGVCb2R5U2hhcGUiLCJzdGVwRW1pdHRlciIsInBhcmFtZXRlcnMiLCJ2YWx1ZVR5cGUiLCJyZXNldEVtaXR0ZXIiLCJkaXNjaGFyZ2VFbmRlZEVtaXR0ZXIiLCJkaXNjaGFyZ2VTdGFydGVkRW1pdHRlciIsIm51bWJlck9mRWxlY3Ryb25zRGlzY2hhcmdlZCIsIm51bWJlck9mRWxlY3Ryb25zT25EaXNjaGFyZ2VTdGFydCIsImFkZExpc3RlbmVyIiwiY291bnQiLCJ0b3VjaGluZ0JvZHlQcm9wZXJ0eSIsInRvdWNoaW5nQ2FycGV0UHJvcGVydHkiLCJ0b3VjaGluZ0FybVByb3BlcnR5IiwidG91Y2hpbmdMZWdQcm9wZXJ0eSIsInV0dGVyYW5jZUFkZGVkRW1pdHRlciIsIm5hbWUiLCJsYXN0QW5nbGUiLCJhY2N1bXVsYXRlZEFuZ2xlIiwiYWNjdW11bGF0ZWRBbmdsZVRocmVzaG9sZCIsIk1hdGgiLCJQSSIsImxhenlMaW5rIiwiYW5nbGUiLCJwaGV0Iiwiam9pc3QiLCJzaW0iLCJpc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5IiwidmFsdWUiLCJhYnMiLCJjcmVhdGVOZXh0RWxlbWVudCIsImluaXRpYWxWYWx1ZSIsImFycmF5IiwiaSIsImxlbmd0aCIsImN1cnJlbnQiLCJuZXh0IiwicHVzaCIsImxpbmVTZWdtZW50IiwibGluZVNlZ21lbnRzIiwicmVzZXQiLCJzZXQiLCJlbWl0IiwiY2xlYXIiLCJzdGVwIiwiZHQiLCJkaXN0VG9Lbm9iIiwiZ2V0RmluZ2VyUG9zaXRpb24iLCJkaXN0YW5jZSIsImFjdHVhbE1pbiIsInF1ZXJ5IiwidGhyZXNob2xkIiwiZWxlY3Ryb25UaHJlc2hvbGRFeGNlZWRlZCIsInNwYXJrQ3JlYXRpb25EaXN0VG9Lbm9iIiwiaiIsImdldEVsZW1lbnQiLCJleGl0aW5nIiwiayIsImVsZWN0cm9uIiwicG9zaXRpb25Qcm9wZXJ0eSIsIndhc0V4aXRpbmciLCJsYXN0U2VnbWVudCIsIm1vdmVFbGVjdHJvbkluc2lkZUJvZHkiLCJ3YXNTcGFyayIsImRpc3Bvc2VFbGVtZW50IiwicG9wIiwiXyIsImZpbHRlciIsImdldEFycmF5IiwiYW5ndWxhclZlbG9jaXR5UHJvcGVydHkiLCJwdCIsImNsb3Nlc3RTZWdtZW50IiwibWluQnkiLCJkaXN0VG9TZWdtZW50U3F1YXJlZCIsInByZTAiLCJwcmUxIiwibWludXMiLCJjZW50ZXIiLCJkb3QiLCJub3JtYWwiLCJib2R5Q29udGFpbnNQb2ludCIsImNvbnRhaW5zUG9pbnQiLCJ2ZXJ0aWNlcyIsIm9iamVjdFNoYXBlIiwibW92ZVRvIiwibGluZVRvIiwiY2xvc2UiLCJlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJKb2huVHJhdm9sdGFnZU1vZGVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsIGZvciBKb2huIFRyYXZvbHRhZ2UuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgVmFzaWx5IFNoYWtob3YgKE1sZWFybmVyLmNvbSlcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUGhldGlvR3JvdXAgZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb0dyb3VwLmpzJztcclxuaW1wb3J0IFN0cmluZ0lPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9TdHJpbmdJTy5qcyc7XHJcbmltcG9ydCBqb2huVHJhdm9sdGFnZSBmcm9tICcuLi8uLi9qb2huVHJhdm9sdGFnZS5qcyc7XHJcbmltcG9ydCBBcm0gZnJvbSAnLi9Bcm0uanMnO1xyXG5pbXBvcnQgRWxlY3Ryb24gZnJvbSAnLi9FbGVjdHJvbi5qcyc7XHJcbmltcG9ydCBMZWcgZnJvbSAnLi9MZWcuanMnO1xyXG5pbXBvcnQgTGluZVNlZ21lbnQgZnJvbSAnLi9MaW5lU2VnbWVudC5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTUFYX0VMRUNUUk9OUyA9IDEwMDtcclxuY29uc3QgRk9PVF9PTl9DQVJQRVRfTUlOX0FOR0xFID0gMTsgLy8gaW4gcmFkaWFucywgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG5jb25zdCBGT09UX09OX0NBUlBFVF9NQVhfQU5HTEUgPSAyLjQ7IC8vIGluIHJhZGlhbnMsIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuXHJcbmNsYXNzIEpvaG5UcmF2b2x0YWdlTW9kZWwge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHRhbmRlbSApIHtcclxuXHJcbiAgICB0aGlzLmVsZWN0cm9uc1RvUmVtb3ZlID0gW107XHJcblxyXG4gICAgLy92ZXJ0aWNlcyBvZiBwYXRoLCBib3JkZXIgb2YgYm9keSwgc2FtcGxlZCB1c2luZyBhIGxpc3RlbmVyIGluIERlYnVnVXRpbHMgLSB0aGUgY2hhcmdlcyBpblxyXG4gICAgLy90aGlzIHNpbSBhcmUgY29uc3RyYWluZWQgdG8gdGhpcyBzaGFwZVxyXG4gICAgdGhpcy5ib2R5VmVydGljZXMgPSBbIG5ldyBWZWN0b3IyKCA0MjIuMjE1MDg4MjgyNTA0MDQsIDQ1NS4zNzA3ODY1MTY4NTQgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDQwMy4xMDc1NDQxNDEyNTIwNSwgNDI0LjU1MjE2NjkzNDE4OTUgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDM3OS42ODUzOTMyNTg0MjcwNCwgMzI4LjM5ODA3MzgzNjI3NjIgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDM1Ny40OTU5ODcxNTg5MDg2LCAzMzUuMTc4MTcwMTQ0NDYyMzQgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDMwOS40MTg5NDA2MDk5NTE5LCA0NDguNTkwNjkwMjA4NjY3OCApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggMzIyLjM2Mjc2MDgzNDY3MSwgNDczLjg2MTk1ODI2NjQ1Mjc1ICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAyODQuMTQ3NjcyNTUyMTY2OTcsIDQ2MS41MzQ1MTA0MzMzODY5ICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAzMjcuOTEwMTEyMzU5NTUwNiwgMzQxLjk1ODI2NjQ1MjY0ODU2ICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAyODEuNjgyMTgyOTg1NTUzOCwgMjk2LjM0NjcwOTQ3MDMwNTAzICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAyODYuNjEzMTYyMTE4NzgwMSwgMjAyLjY1ODEwNTkzOTAwNDg2ICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAzMTguNjY0NTI2NDg0NzUxMjYsIDE0Ny44MDA5NjMwODE4NjIgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDM0OS40ODMxNDYwNjc0MTU3NiwgMTE4LjgzMTQ2MDY3NDE1NzMxICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAzODcuMDgxODYxOTU4MjY2NTMsIDExMC4yMDIyNDcxOTEwMTEyNSApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggNDA3LjQyMjE1MDg4MjgyNTA2LCA3NS4wNjkwMjA4NjY3NzM3MSApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggNDI1LjkxMzMyMjYzMjQyMzgsIDc1LjA2OTAyMDg2Njc3MzcxICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCA0MzkuNDczNTE1MjQ4Nzk2MiwgODUuNTQ3MzUxNTI0ODc5NjQgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDQzMy45MjYxNjM3MjM5MTY2LCAxMTguMjE1MDg4MjgyNTA0MDQgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDQyMC45ODIzNDM0OTkxOTc1LCAxMjYuMjI3OTI5MzczOTk2OCApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggNDAzLjcyMzkxNjUzMjkwNTMsIDEyOC4wNzcwNDY1NDg5NTY2NyApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggMzkzLjI0NTU4NTg3NDc5OTQsIDE0Mi4yNTM2MTE1NTY5ODIzOCApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggNDA4LjAzODUyMzI3NDQ3ODQsIDE3MS4yMjMxMTM5NjQ2ODcwMyApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggNDIzLjQ0NzgzMzA2NTgxMDY0LCAyMjEuMTQ5Mjc3Njg4NjAzNTggKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDQ4Ny41NTA1NjE3OTc3NTI5LCAyMTcuNDUxMDQzMzM4NjgzODMgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDQ4NS43MDE0NDQ2MjI3OTMsIDIyOC41NDU3NDYzODg0NDMwNiApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggNDMyLjA3NzA0NjU0ODk1NjczLCAyNDAuMjU2ODIxODI5ODU1NTcgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDM5Mi4wMTI4NDEwOTE0OTI4LCAyMjQuMjMxMTM5NjQ2ODcwMDIgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDM5MC43ODAwOTYzMDgxODYzLCAyODAuOTM3Mzk5Njc4OTcyOCApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggNDA0LjM0MDI4ODkyNDU1ODY1LCAzMTkuMTUyNDg3OTYxNDc2OCApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggNDE0LjgxODYxOTU4MjY2NDU1LCA0MDQuMjExODc4MDA5NjMwOSApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggNDM1LjE1ODkwODUwNzIyMzE1LCA0MzMuMTgxMzgwNDE3MzM1NTYgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDQ2NC4xMjg0MTA5MTQ5Mjc4LCA0MzMuNzk3NzUyODA4OTg4ODMgKSBdO1xyXG5cclxuICAgIC8vIG91dGxpbmUgb2YgdGhlIGVudGlyZSBpbWFnZSBvZiBqb2hucyBib2R5IGV4Y2x1ZGluZyB0aGUgZHJhZ2dhYmxlIGFybSBhbmQgbGVnIC0gdXNlZFxyXG4gICAgLy8gdG8gZGV0ZXJtaW5lIGlmIHBvaW50ZXIgaXMgY3VycmVudGx5IG92ZXIgdGhlIGJvZHkgc2hhcGUgZm9yIGFjY2Vzc2liaWxpdHkgcHJvdG90eXBpbmdcclxuICAgIHRoaXMudG91Y2hhYmxlQm9keVZlcnRpY2VzID0gW1xyXG4gICAgICBuZXcgVmVjdG9yMiggMjY3LjY5OTQ1Nzc4NDY2MzEsIDMxMS4yNjI1ODcxNDE3NTA2ICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAyNjcuMTA0NTcwMTAwNjk3MiwgMjE5LjY0OTg4MzgxMDk5OTIzICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAzMDUuNzcyMjY5NTU4NDgxOCwgMTM2Ljk2MDQ5NTczOTczNjY0ICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAzNDAuMjc1NzU1MjI4NTA1MSwgMTA4LjQwNTg4NjkwOTM3MjU3ICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAzNjYuNDUwODEzMzIzMDA1NDMsIDk5LjQ4MjU3MTY0OTg4MzgxICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAzNzkuNTM4MzQyMzcwMjU1NjMsIDEwMC4wNzc0NTkzMzM4NDk3MiApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggNDA0LjUyMzYyNTA5NjgyNDIsIDYzLjc4OTMxMDYxMTkyODczICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCA0NDMuNzg2MjEyMjM4NTc0OCwgNjguNTQ4NDEyMDgzNjU2MDcgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDQ1OS4yNTMyOTIwMjE2ODg2NSwgODAuNDQ2MTY1NzYyOTc0NDMgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDQ1Mi4xMTQ2Mzk4MTQwOTc2NCwgOTAuNTU5MjU2MzkwMzk1MDMgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDQ0Ny45NTA0MjYwMjYzMzYyMywgMTIzLjI3ODA3OTAwODUyMDUgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDQzMy42NzMxMjE2MTExNTQyLCAxMzkuOTM0OTM0MTU5NTY2MiApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggMzk3LjM4NDk3Mjg4OTIzMzIsIDE0MS4xMjQ3MDk1Mjc0OTgwNiApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggMzk1LjYwMDMwOTgzNzMzNTQzLCAyNTIuMzY4NzA2NDI5MTI0NyApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggNDAzLjkyODczNzQxMjg1ODMsIDI4Ny40NjcwNzk3ODMxMTM5ICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAzMzguNDkxMDkyMTc2NjA3MywgMjk1LjIwMDYxOTY3NDY3MDggKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDMzNi4xMTE1NDE0NDA3NDM2LCA0MjMuNjk2MzU5NDExMzA5MSApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggMzE2LjQ4MDI0Nzg2OTg2ODQsIDQ1Ny42MDQ5NTczOTczNjY0MyApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggMzM5LjY4MDg2NzU0NDUzOTEsIDQ3Ni4wNDY0NzU2MDAzMDk4NiApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggMzMzLjczMTk5MDcwNDg4LCA0OTIuMTA4NDQzMDY3Mzg5NjYgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDI3MS4yNjg3ODM4ODg0NTg2LCA0ODEuNDAwNDY0NzU2MDAzMTUgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDI3MS44NjM2NzE1NzI0MjQ1LCA0NDguMDg2NzU0NDUzOTExNzQgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDMwOS45MzY0ODMzNDYyNDMzLCAzNTguMjU4NzE0MTc1MDU4MSApLFxyXG4gICAgICBuZXcgVmVjdG9yMiggMjY3LjY5OTQ1Nzc4NDY2MzEsIDMxMC42Njc2OTk0NTc3ODQ3IClcclxuICAgIF07XHJcblxyXG4gICAgLy9saW5lcywgdG8gd2hpY2ggZWxlY3Ryb25zIG1vdmVzLCB3aGVuIHNwYXJrIGhhcHBlbmVkXHJcbiAgICB0aGlzLmZvcmNlTGluZXMgPSBbXHJcbiAgICAgIG5ldyBMaW5lU2VnbWVudCggMzAwLjY0ODM0MTIzMjIyNzUsIDQ0My43OTkwNTIxMzI3MDE0MywgMzQxLjQxNDIxODAwOTQ3ODY1LCAzMzguOTcyNTExODQ4MzQxMjQgKSxcclxuICAgICAgbmV3IExpbmVTZWdtZW50KCAzNDEuNDE0MjE4MDA5NDc4NjUsIDMzNS4zMzI3MDE0MjE4MDA5NSwgMzczLjQ0NDU0OTc2MzAzMzE0LCAyMDQuMjk5NTI2MDY2MzUwNjcgKSxcclxuICAgICAgbmV3IExpbmVTZWdtZW50KCA0MjMuNjczOTMzNjQ5Mjg5MSwgNDM4LjcwMzMxNzUzNTU0NSwgNDA2LjIwMjg0MzYwMTg5NTcsIDQwNi42NzI5ODU3ODE5OTA1ICksXHJcbiAgICAgIG5ldyBMaW5lU2VnbWVudCggNDA2LjIwMjg0MzYwMTg5NTcsIDQwNS4yMTcwNjE2MTEzNzQ0LCAzOTMuMDk5NTI2MDY2MzUwNywgMzMwLjIzNjk2NjgyNDY0NDUgKSxcclxuICAgICAgbmV3IExpbmVTZWdtZW50KCAzOTIuMzcxNTYzOTgxMDQyNjQsIDMyNy4zMjUxMTg0ODM0MTIzLCAzNzUuNjI4NDM2MDE4OTU3MywgMjUzLjgwMDk0Nzg2NzI5ODU2ICksXHJcbiAgICAgIG5ldyBMaW5lU2VnbWVudCggMzc3LjA4NDM2MDE4OTU3MzQzLCAyMTIuMzA3MTA5MDA0NzM5MzIsIDM5NS4yODM0MTIzMjIyNzQ4NCwgMjA1LjAyNzQ4ODE1MTY1ODczICksXHJcbiAgICAgIG5ldyBMaW5lU2VnbWVudCggMzk4LjkyMzIyMjc0ODgxNTE0LCAyMDYuNDgzNDEyMzIyMjc0ODYsIDQxOC41NzgxOTkwNTIxMzI3LCAyMjUuNDEwNDI2NTQwMjg0MyApLFxyXG4gICAgICBuZXcgTGluZVNlZ21lbnQoIDQxOC41NzgxOTkwNTIxMzI3LCAyMjUuNDEwNDI2NTQwMjg0MywgNTE2Ljg1MzA4MDU2ODcyMDMsIDIxOS41ODY3Mjk4NTc4MTk4NSApLFxyXG4gICAgICBuZXcgTGluZVNlZ21lbnQoIDQxNy44NTAyMzY5NjY4MjQ2NCwgMTAwLjkyODkwOTk1MjYwNjYsIDM4NS44MTk5MDUyMTMyNzAxNSwgMTI3LjEzNTU0NTAyMzY5NjY2ICksXHJcbiAgICAgIG5ldyBMaW5lU2VnbWVudCggMzc5Ljk5NjIwODUzMDgwNTcsIDEzNC40MTUxNjU4NzY3NzcyMiwgMzY2Ljg5Mjg5MDk5NTI2MDY0LCAxNjcuMTczNDU5NzE1NjM5NzggKSxcclxuICAgICAgbmV3IExpbmVTZWdtZW50KCAzNjkuODA0NzM5MzM2NDkyOSwgMTcyLjI2OTE5NDMxMjc5NjE3LCAzOTIuMzcxNTYzOTgxMDQyNjQsIDE5NS41NjM5ODEwNDI2NTQgKSxcclxuICAgICAgbmV3IExpbmVTZWdtZW50KCAzMTcuMzkxNDY5MTk0MzEyOCwgMjU1Ljk4NDgzNDEyMzIyMjczLCAzNTUuOTczNDU5NzE1NjM5OCwgMjIyLjQ5ODU3ODE5OTA1MjEgKVxyXG4gICAgXTtcclxuXHJcbiAgICAvLyB2ZXJ0aWNlcyBvZiB0aGUgY2FycGV0IHNoYXBlIGluIHRoZSBiYWNrZ3JvdW5kLCBkZXRlcm1pbmVkIHdpdGggdGhlIGxpc3RlbmVycyBpbiBEZWJ1Z1V0aWxzXHJcbiAgICB0aGlzLmNhcnBldFZlcnRpY2VzID0gW1xyXG4gICAgICBuZXcgVmVjdG9yMiggMTI2LjY3NDEwMzU4NTY1NzM5LCA0OTIuOTE0NzQxMDM1ODU2NjUgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDIzMy43NjU3MzcwNTE3OTI4NSwgNDQ2LjQwNjM3NDUwMTk5MjEgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDU4MC43NDI2Mjk0ODIwNzE4LCA0NDcuMDE4MzI2NjkzMjI3MTUgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDUyMC4xNTkzNjI1NDk4MDA5LCA0OTUuMzYyNTQ5ODAwNzk2OSApXHJcbiAgICBdO1xyXG5cclxuICAgIHRoaXMuZG9vcmtub2JQb3NpdGlvbiA9IG5ldyBWZWN0b3IyKCA1NDguNDMxODkwMzExMzA3NiwgMjU3LjU4OTQxNjI1MzYxMDUgKTtcclxuXHJcbiAgICAvL1Byb3BlcnRpZXMgb2YgdGhlIG1vZGVsLiAgQWxsIHVzZXIgc2V0dGluZ3MgYmVsb25nIGluIHRoZSBtb2RlbCwgd2hldGhlciBvciBub3QgdGhleSBhcmUgcGFydCBvZiB0aGUgcGh5c2ljYWwgbW9kZWxcclxuICAgIHRoaXMuc3BhcmtWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzcGFya1Zpc2libGVQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHRydWUgd2hlbiBhIHJlc2V0IGlzIGluIHByb2dyZXNzXHJcbiAgICB0aGlzLnJlc2V0SW5Qcm9ncmVzc1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmVzZXRJblByb2dyZXNzUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmVsZWN0cm9uR3JvdXAgPSBuZXcgUGhldGlvR3JvdXAoIHRhbmRlbSA9PiB7XHJcbiAgICAgIGNvbnN0IHNlZ21lbnQgPSBuZXcgTGluZVNlZ21lbnQoIDQyNC4wNjQyMDU0NTc0NjM5LCA0NTIuMjg4OTI0NTU4NTg3NTUsIDQzMy4zMDk3OTEzMzIyNjMzLCA0NDUuNTA4ODI4MjUwNDAxNCApO1xyXG4gICAgICBjb25zdCB2ID0gc2VnbWVudC52ZWN0b3I7XHJcbiAgICAgIGNvbnN0IHJhbmQgPSBkb3RSYW5kb20ubmV4dERvdWJsZSgpICogdi5tYWduaXR1ZGU7XHJcblxyXG4gICAgICBjb25zdCBwb2ludCA9IHNlZ21lbnQucDAucGx1cyggdi5ub3JtYWxpemVkKCkudGltZXMoIHJhbmQgKSApO1xyXG4gICAgICByZXR1cm4gbmV3IEVsZWN0cm9uKCBwb2ludC54LCBwb2ludC55LCB0aGlzLCB7IHRhbmRlbTogdGFuZGVtIH0gKTtcclxuICAgIH0sIFtdLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VsZWN0cm9uR3JvdXAnICksXHJcbiAgICAgIHBoZXRpb1R5cGU6IFBoZXRpb0dyb3VwLlBoZXRpb0dyb3VwSU8oIEVsZWN0cm9uLkVsZWN0cm9uSU8gKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYXJtID0gbmV3IEFybSggdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2FybScgKSApO1xyXG4gICAgdGhpcy5sZWcgPSBuZXcgTGVnKCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGVnJyApICk7XHJcbiAgICB0aGlzLmxlZ0FuZ2xlQXRQcmV2aW91c1N0ZXAgPSB0aGlzLmxlZy5hbmdsZVByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkgLSBjbG9zZWQgc2hhcGUgZm9yIHRoZSBib2R5IHRoYXQgY29udGFpbnMgZWxlY3Ryb25zLCBmcm9tIGJvZHkgdmVydGljZXMgYWJvdmVcclxuICAgIHRoaXMuYm9keVNoYXBlID0gSm9oblRyYXZvbHRhZ2VNb2RlbC5jcmVhdGVPYmplY3RTaGFwZSggdGhpcy5ib2R5VmVydGljZXMgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIC0gY2xvc2VkIHNoYXBlIGZvciB0aGUgY2FycGV0IGluIHRoaXMgc2ltXHJcbiAgICB0aGlzLmNhcnBldFNoYXBlID0gSm9oblRyYXZvbHRhZ2VNb2RlbC5jcmVhdGVPYmplY3RTaGFwZSggdGhpcy5jYXJwZXRWZXJ0aWNlcyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSBzaGFwZSBmb3IgdGhlIGJvZHksIHVzZWQgdG8gZXhwbG9yZSBoYXB0aWMgZmVlZGJhY2sgd2hpY2ggaXMgcHJlc2VudGVkIHdoZW5ldmVyXHJcbiAgICAvLyBhIHBvaW50ZXIgaW50ZXJhY3RzIHdpdGggdGhpcyBzaGFwZSAtIGhhcyBubyBpbXBhY3Qgb24gZWxlY3Ryb24gbW90aW9uXHJcbiAgICB0aGlzLnRvdWNoYWJsZUJvZHlTaGFwZSA9IEpvaG5UcmF2b2x0YWdlTW9kZWwuY3JlYXRlT2JqZWN0U2hhcGUoIHRoaXMudG91Y2hhYmxlQm9keVZlcnRpY2VzICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIGVtaXR0ZXJzIGZvciByZXNldCBhbmQgc3RlcCBldmVudHNcclxuICAgIHRoaXMuc3RlcEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigge1xyXG4gICAgICBwYXJhbWV0ZXJzOiBbIHtcclxuICAgICAgICB2YWx1ZVR5cGU6ICdudW1iZXInXHJcbiAgICAgIH0gXVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSBlbWl0dGVyIGNhbGxlZCB3aGVuIHRoZSByZXNldCBhbGwgYnV0dG9uIGlzIHByZXNzZWRcclxuICAgIHRoaXMucmVzZXRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmVzZXRFbWl0dGVyJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAoYTExeSkgLSBlbWl0dGVyIGZvciB3aGVuIGFuIGVsZWN0cm9uIGRpc2NoYXJnZSBmaW5pc2hlcyBvciBpcyBjYW5jZWxlZFxyXG4gICAgdGhpcy5kaXNjaGFyZ2VFbmRlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdkaXNjaGFyZ2VFbmRlZEVtaXR0ZXInIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChhMTF5KSAtIGVtaXRzIGFuIGV2ZW50IHdoZW4gdGhlIGRpc2NoYXJnZSBzdGFydHNcclxuICAgIHRoaXMuZGlzY2hhcmdlU3RhcnRlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdkaXNjaGFyZ2VTdGFydGVkRW1pdHRlcicgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bWJlcn0gLSBOdW1iZXIgb2YgZWxlY3Ryb25zIHRoYXQgbGVmdCB0aGUgYm9keSBpbiBhIHBhcnRpY3VsYXIgZGlzY2hhcmdlIGV2ZW50LCByZXNldHMgdG8gMFxyXG4gICAgdGhpcy5udW1iZXJPZkVsZWN0cm9uc0Rpc2NoYXJnZWQgPSAwO1xyXG5cclxuICAgIC8vIHVwZGF0ZXMgdGhlIG51bWJlciBvZiBlbGVjdHJvbnMgZGlzY2hhcmdlZCBpbiBhIGRpc2NoYXJnZSBldmVudFxyXG4gICAgbGV0IG51bWJlck9mRWxlY3Ryb25zT25EaXNjaGFyZ2VTdGFydCA9IDA7XHJcbiAgICB0aGlzLmRpc2NoYXJnZVN0YXJ0ZWRFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIG51bWJlck9mRWxlY3Ryb25zT25EaXNjaGFyZ2VTdGFydCA9IHRoaXMuZWxlY3Ryb25Hcm91cC5jb3VudDtcclxuICAgIH0gKTtcclxuICAgIHRoaXMuZGlzY2hhcmdlRW5kZWRFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIHRoaXMubnVtYmVyT2ZFbGVjdHJvbnNEaXNjaGFyZ2VkID0gbnVtYmVyT2ZFbGVjdHJvbnNPbkRpc2NoYXJnZVN0YXJ0IC0gdGhpcy5lbGVjdHJvbkdyb3VwLmNvdW50O1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIFRoZSBmb2xsb3dpbmcgUHJvcGVydGllcyBhcmUgYmVpbmcgdXNlZCB0byBleHBsb3JlIGhhcHRpYyBmZWVkYmFjaywgdGhleVxyXG4gICAgLy8gYXJlIHRvIGJlIHVzZWQgaW4gcHJvdG90eXBlcyBhbmQgdmlldyByZXByZXNlbnRhdGlvbnMgYXJlIGhpZGRlbiBiZWhpbmRcclxuICAgIC8vIHF1ZXJ5IHBhcmFtZXRlcnNcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBUT0RPOiBjb25zaWRlciBhbiBlbmNhcHN1bGF0aW9uIGZvciB0aGVzZSBcInRvdWNoaW5nXCIgUHJvcGVydGllc1xyXG4gICAgLy8gQHB1YmxpYyAtIHRydWUgd2hlbiBhIHBvaW50ZXIgaXMgZG93biBvdmVyIHRoZSBib2R5XHJcbiAgICB0aGlzLnRvdWNoaW5nQm9keVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndG91Y2hpbmdCb2R5UHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIC0gdHJ1ZSB3aGVuIGEgcG9pbnRlciBpcyBkb3duIG92ZXIgdGhlIGNhcnBldFxyXG4gICAgdGhpcy50b3VjaGluZ0NhcnBldFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndG91Y2hpbmdDYXJwZXRQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMudG91Y2hpbmdBcm1Qcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RvdWNoaW5nQXJtUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnRvdWNoaW5nTGVnUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0b3VjaGluZ0xlZ1Byb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVE9ETzogY29uc2lkZXIgbW92aW5nIHN1Y2ggYW4gZW1pdHRlciB0byB1dHRlcmFuY2VRdWV1ZSBpZiB0aGlzIGlzIHVzZWZ1bFxyXG4gICAgdGhpcy51dHRlcmFuY2VBZGRlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigge1xyXG4gICAgICBwYXJhbWV0ZXJzOiBbIHsgbmFtZTogJ3V0dGVyYW5jZScsIHBoZXRpb1R5cGU6IFN0cmluZ0lPIH0gXSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndXR0ZXJhbmNlJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy9JZiBsZWcgZHJhZ2dlZCBhY3Jvc3MgY2FycGV0LCBhZGQgZWxlY3Ryb24uICBMYXp5IGxpbmsgc28gdGhhdCBpdCB3b24ndCBhZGQgYW4gZWxlY3Ryb24gd2hlbiB0aGUgc2ltIHN0YXJ0cyB1cC5cclxuICAgIC8vVGhlIG51bWJlciBvZiBlbGVjdHJvbnMgYWNjdW11bGF0ZWQgb25seSBkZXBlbmRzIG9uIHRoZSB0b3RhbCBhbmdsZSBzdWJ0ZW5kZWRcclxuICAgIGxldCBsYXN0QW5nbGUgPSB0aGlzLmxlZy5hbmdsZVByb3BlcnR5LmdldCgpO1xyXG4gICAgbGV0IGFjY3VtdWxhdGVkQW5nbGUgPSAwO1xyXG4gICAgY29uc3QgYWNjdW11bGF0ZWRBbmdsZVRocmVzaG9sZCA9IE1hdGguUEkgLyAxNjtcclxuICAgIHRoaXMubGVnLmFuZ2xlUHJvcGVydHkubGF6eUxpbmsoIGFuZ2xlID0+IHtcclxuICAgICAgaWYgKCBhbmdsZSA+IEZPT1RfT05fQ0FSUEVUX01JTl9BTkdMRSAmJlxyXG4gICAgICAgICAgIGFuZ2xlIDwgRk9PVF9PTl9DQVJQRVRfTUFYX0FOR0xFICYmXHJcbiAgICAgICAgICAgdGhpcy5lbGVjdHJvbkdyb3VwLmNvdW50IDwgTUFYX0VMRUNUUk9OUyAmJlxyXG4gICAgICAgICAgICFwaGV0LmpvaXN0LnNpbS5pc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5LnZhbHVlICkgeyAvLyBQaEVULWlPIHN0YXRlIGhhbmRsZXMgY3JlYXRpbmcgaXRzIG93biBlbGVjdHJvbnNcclxuXHJcbiAgICAgICAgYWNjdW11bGF0ZWRBbmdsZSArPSBNYXRoLmFicyggYW5nbGUgLSBsYXN0QW5nbGUgKTtcclxuXHJcbiAgICAgICAgd2hpbGUgKCBhY2N1bXVsYXRlZEFuZ2xlID4gYWNjdW11bGF0ZWRBbmdsZVRocmVzaG9sZCApIHtcclxuICAgICAgICAgIGlmICggdGhpcy5lbGVjdHJvbkdyb3VwLmNvdW50IDwgTUFYX0VMRUNUUk9OUyApIHtcclxuICAgICAgICAgICAgdGhpcy5lbGVjdHJvbkdyb3VwLmNyZWF0ZU5leHRFbGVtZW50KCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBhY2N1bXVsYXRlZEFuZ2xlIC09IGFjY3VtdWxhdGVkQW5nbGVUaHJlc2hvbGQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGxhc3RBbmdsZSA9IGFuZ2xlO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHJlc2V0IGFuZ2xlIGNvdW50aW5nIHZhcmlhYmxlcyB3aGVuIHRoZSBzaW0gaXMgcmVzZXQgLSBkb2VzIG5vdCBuZWVkIHRvIGJlIGRpc3Bvc2VkXHJcbiAgICB0aGlzLnJlc2V0RW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICBsYXN0QW5nbGUgPSB0aGlzLmxlZy5hbmdsZVByb3BlcnR5LmluaXRpYWxWYWx1ZTtcclxuICAgICAgYWNjdW11bGF0ZWRBbmdsZSA9IDA7XHJcblxyXG4gICAgICAvLyByZXNldCB0aGUgbnVtYmVyIG9mIGVsZWN0cm9ucyBkaXNjaGFyZ2VkIGZvciBuZXh0IGRpc2NoYXJnZSBldmVudFxyXG4gICAgICB0aGlzLm51bWJlck9mRWxlY3Ryb25zRGlzY2hhcmdlZCA9IDA7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgYXJyYXkgPSBbXTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuYm9keVZlcnRpY2VzLmxlbmd0aCAtIDE7IGkrKyApIHtcclxuICAgICAgY29uc3QgY3VycmVudCA9IHRoaXMuYm9keVZlcnRpY2VzWyBpIF07XHJcbiAgICAgIGNvbnN0IG5leHQgPSB0aGlzLmJvZHlWZXJ0aWNlc1sgaSArIDEgXTtcclxuICAgICAgYXJyYXkucHVzaCggbmV3IExpbmVTZWdtZW50KCBjdXJyZW50LngsIGN1cnJlbnQueSwgbmV4dC54LCBuZXh0LnkgKSApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGxpbmVTZWdtZW50ID0gbmV3IExpbmVTZWdtZW50KCB0aGlzLmJvZHlWZXJ0aWNlc1sgdGhpcy5ib2R5VmVydGljZXMubGVuZ3RoIC0gMSBdLngsIHRoaXMuYm9keVZlcnRpY2VzWyB0aGlzLmJvZHlWZXJ0aWNlcy5sZW5ndGggLSAxIF0ueSwgdGhpcy5ib2R5VmVydGljZXNbIDAgXS54LCB0aGlzLmJvZHlWZXJ0aWNlc1sgMCBdLnkgKTtcclxuICAgIGFycmF5LnB1c2goIGxpbmVTZWdtZW50ICk7XHJcbiAgICB0aGlzLmxpbmVTZWdtZW50cyA9IGFycmF5O1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0IHRoZSBtb2RlbCB3aGVuIFwiUmVzZXQgQWxsXCIgaXMgcHJlc3NlZC5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcblxyXG4gICAgLy8gUHJvcGVydGllcyBvZiB0aGUgbW9kZWwuICBBbGwgdXNlciBzZXR0aW5ncyBiZWxvbmcgaW4gdGhlIG1vZGVsLCB3aGV0aGVyIG9yIG5vdCB0aGV5IGFyZSBwYXJ0IG9mIHRoZSBwaHlzaWNhbCBtb2RlbFxyXG4gICAgdGhpcy5yZXNldEluUHJvZ3Jlc3NQcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuICAgIHRoaXMucmVzZXRFbWl0dGVyLmVtaXQoKTtcclxuICAgIHRoaXMuc3BhcmtWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuYXJtLnJlc2V0KCk7XHJcbiAgICB0aGlzLmxlZy5yZXNldCgpO1xyXG4gICAgdGhpcy5lbGVjdHJvbkdyb3VwLmNsZWFyKCk7XHJcbiAgICB0aGlzLnJlc2V0SW5Qcm9ncmVzc1Byb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1haW4gc3RlcCBmdW5jdGlvbiBmb3IgdGhlIG1vZGVsLCBjYWxsZWQgYnkgYW5pbWF0aW9uIGxvb3AgaW4gU2ltLlxyXG4gICAqIEBwYXJhbSAge251bWJlcn0gZHQgLSBzZWNvbmRzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG5cclxuICAgIC8vQ2xhbXAgZHQsIHNpbmNlIG5hdmlnYXRpbmcgdG8gYW5vdGhlciB0YWIgYW5kIGJhY2sgZ2l2ZXMgdGhlIHBhcnRpY2xlcyBhbiBhcHBhcmVudCBidXJzdCBvZiBlbmVyZ3ksIHNlZSAjMjVcclxuICAgIGlmICggZHQgPiAyIC8gNjAgKSB7XHJcbiAgICAgIGR0ID0gMiAvIDYwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRlc3QgZm9yIHNwYXJrLiAgQ2hlY2sgZXZlcnkgc3RlcCBzbyB0aGF0IG5ld2x5IGFkZGVkIGVsZWN0cm9ucyBjYW4gYmUgYXNzaWduZWQgdG8gZXhpdCBpZiB0aGUgdGhyZXNob2xkIGlzIHN0aWxsIGV4Y2VlZGVkLCBzZWUgIzI3XHJcbiAgICAvLyBJZiB0aGUgZmluZ2VyIGlzIHRvdWNoaW5nIHRoZSBkb29ya25vYiwgZGlzY2hhcmdlIGV2ZXJ5dGhpbmdcclxuICAgIGNvbnN0IGRpc3RUb0tub2IgPSB0aGlzLmFybS5nZXRGaW5nZXJQb3NpdGlvbigpLmRpc3RhbmNlKCB0aGlzLmRvb3Jrbm9iUG9zaXRpb24gKTtcclxuXHJcbiAgICAvLyBNaW5pbXVtIGRpc3RhbmNlIHRoZSBmaW5nZXIgY2FuIGJlIHRvIHRoZSBrbm9iLCBpZiBwb2ludGVkIGRpcmVjdGx5IGF0IGl0LiAgU2FtcGxlZCBhdCBydW50aW1lIGJ5IHByaW50aW5nIGFuZ2xlcy4gIE11c3QgYmUgYWRqdXN0ZWQgaWYgdGhlIGRvb3Jrbm9iIHBvc2l0aW9uIGlzIGFkanVzdGVkLlxyXG4gICAgY29uc3QgYWN0dWFsTWluID0gMTU7XHJcblxyXG4gICAgY29uc3QgcXVlcnkgPSB0aGlzLmVsZWN0cm9uR3JvdXAuY291bnQgLyBkaXN0VG9Lbm9iO1xyXG4gICAgY29uc3QgdGhyZXNob2xkID0gMTAgLyBhY3R1YWxNaW47XHJcblxyXG4gICAgY29uc3QgZWxlY3Ryb25UaHJlc2hvbGRFeGNlZWRlZCA9IHF1ZXJ5ID4gdGhyZXNob2xkO1xyXG4gICAgaWYgKCBlbGVjdHJvblRocmVzaG9sZEV4Y2VlZGVkICkge1xyXG4gICAgICB0aGlzLnNwYXJrQ3JlYXRpb25EaXN0VG9Lbm9iID0gZGlzdFRvS25vYjtcclxuXHJcbiAgICAgIC8vTWFyayBhbGwgZWxlY3Ryb25zIGZvciBleGl0aW5nXHJcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHRoaXMuZWxlY3Ryb25Hcm91cC5jb3VudDsgaisrICkge1xyXG4gICAgICAgIHRoaXMuZWxlY3Ryb25Hcm91cC5nZXRFbGVtZW50KCBqICkuZXhpdGluZyA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiB3ZSBhcmUgdW5kZXIgdGhlIHRocmVzaG9sZCwgY29uc2lkZXIgc3RvcHBpbmcgdGhlIHNwYXJrLCBidXQgb25seSBpZiBubyBlbGVjdHJvbnMgYXJlIGNsb3NlIHRvIHRoZSBmaW5nZXJcclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gU3RvcCB0aGUgc3BhcmssIGJ1dCBvbmx5IGlmIHRoZSBmaW5nZXIgaGFzIG1vdmVkIGZ1cnRoZXIgZW5vdWdoIGZyb20gdGhlIGRvb3Jrbm9iXHJcbiAgICAgIC8vIFVzZSBhbiBpbmNyZWFzZWQgdGhyZXNob2xkIHRvIG1vZGVsIHRoZSBtb3JlIGNvbmR1Y3RpdmUgcGF0aCBvbmNlIHRoZSBzcGFyayBoYXMgc3RhcnRlZFxyXG4gICAgICBpZiAoIHRoaXMuc3BhcmtDcmVhdGlvbkRpc3RUb0tub2IgJiYgZGlzdFRvS25vYiA+IHRoaXMuc3BhcmtDcmVhdGlvbkRpc3RUb0tub2IgKyAxMCApIHtcclxuICAgICAgICBmb3IgKCBsZXQgayA9IDA7IGsgPCB0aGlzLmVsZWN0cm9uR3JvdXAuY291bnQ7IGsrKyApIHtcclxuICAgICAgICAgIGNvbnN0IGVsZWN0cm9uID0gdGhpcy5lbGVjdHJvbkdyb3VwLmdldEVsZW1lbnQoIGsgKTtcclxuXHJcbiAgICAgICAgICAvL1R1bmUgdGhlIGRpc3RhbmNlIHRocmVzaG9sZCB0byBtYWtlIHN1cmUgdGhlIHNwYXJrIHdpbGwgc2h1dCBvZmYgbW9yZSBxdWlja2x5IHdoZW4gdGhlIGZpbmdlciBtb3ZlZCBmYXIgZnJvbSB0aGUgZG9vcmtub2IsIGJ1dCBub3Qgc29vIHNtYWxsIHRoYXQgZWxlY3Ryb25zIGNhbiBsZWFrIG91dCBvZiB0aGUgYm9keSwgc2VlICMyN1xyXG4gICAgICAgICAgaWYgKCBlbGVjdHJvbi5wb3NpdGlvblByb3BlcnR5LmdldCgpLmRpc3RhbmNlKCB0aGlzLmRvb3Jrbm9iUG9zaXRpb24gKSA+IDEwMCApIHtcclxuICAgICAgICAgICAgY29uc3Qgd2FzRXhpdGluZyA9IGVsZWN0cm9uLmV4aXRpbmc7XHJcbiAgICAgICAgICAgIGVsZWN0cm9uLmV4aXRpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIC8vQ2hvb3NlIGEgbmV3IG5lYXJlc3Qgc2VnbWVudCB3aGVuIHRyYXZlbGluZyB0b3dhcmQgZmluZ2VyIGFnYWluXHJcbiAgICAgICAgICAgIGVsZWN0cm9uLnNlZ21lbnQgPSBudWxsO1xyXG4gICAgICAgICAgICBlbGVjdHJvbi5sYXN0U2VnbWVudCA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAvL0Vuc3VyZSB0aGUgZWxlY3Ryb24gaXMgd2l0aGluIHRoZSBib3VuZHMgb2YgdGhlIGJvZHlcclxuICAgICAgICAgICAgaWYgKCB3YXNFeGl0aW5nICkge1xyXG4gICAgICAgICAgICAgIHRoaXMubW92ZUVsZWN0cm9uSW5zaWRlQm9keSggZWxlY3Ryb24gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFN0ZXAgdGhlIG1vZGVsXHJcbiAgICBjb25zdCBsZW5ndGggPSB0aGlzLmVsZWN0cm9uR3JvdXAuY291bnQ7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKyApIHtcclxuICAgICAgdGhpcy5lbGVjdHJvbkdyb3VwLmdldEVsZW1lbnQoIGkgKS5zdGVwKCBkdCApO1xyXG4gICAgfVxyXG4gICAgY29uc3Qgd2FzU3BhcmsgPSB0aGlzLnNwYXJrVmlzaWJsZVByb3BlcnR5LmdldCgpO1xyXG4gICAgaWYgKCB0aGlzLmVsZWN0cm9uc1RvUmVtb3ZlLmxlbmd0aCApIHtcclxuICAgICAgdGhpcy5zcGFya1Zpc2libGVQcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuICAgIH1cclxuICAgIGlmICggIXdhc1NwYXJrICYmIHRoaXMuc3BhcmtWaXNpYmxlUHJvcGVydHkuZ2V0KCkgKSB7XHJcblxyXG4gICAgICAvLyBzcGFyayBpcyBqdXN0IHR1cm5pbmcgdmlzaWJsZSwgbm90aWZ5IHRoYXQgYSBkaXNjaGFnZSBoYXMgc3RhcnRlZFxyXG4gICAgICB0aGlzLmRpc2NoYXJnZVN0YXJ0ZWRFbWl0dGVyLmVtaXQoKTtcclxuICAgIH1cclxuXHJcbiAgICB3aGlsZSAoIHRoaXMuZWxlY3Ryb25zVG9SZW1vdmUubGVuZ3RoICkge1xyXG4gICAgICB0aGlzLmVsZWN0cm9uR3JvdXAuZGlzcG9zZUVsZW1lbnQoIHRoaXMuZWxlY3Ryb25zVG9SZW1vdmUucG9wKCkgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHRoaXMuZWxlY3Ryb25Hcm91cC5jb3VudCA9PT0gMCB8fCBfLmZpbHRlciggdGhpcy5lbGVjdHJvbkdyb3VwLmdldEFycmF5KCksIGV4aXRpbmcgKS5sZW5ndGggPT09IDAgKSB7XHJcblxyXG4gICAgICAvLyBNYWtlIHN1cmUgdGhlIHNwYXJrIHNob3dzIGF0IGxlYXN0IG9uZSBmcmFtZSBmb3IgYSBzaW5nbGUgZWxlY3Ryb24gZXhpdGluZywgc2VlICM1NVxyXG4gICAgICBpZiAoIHdhc1NwYXJrICkge1xyXG4gICAgICAgIHRoaXMuc3BhcmtWaXNpYmxlUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLnNwYXJrQ3JlYXRpb25EaXN0VG9Lbm9iO1xyXG5cclxuICAgICAgICB0aGlzLmRpc2NoYXJnZUVuZGVkRW1pdHRlci5lbWl0KCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmxlZy5hbmd1bGFyVmVsb2NpdHlQcm9wZXJ0eS5zZXQoICggdGhpcy5sZWcuYW5nbGVQcm9wZXJ0eS5nZXQoKSAtIHRoaXMubGVnQW5nbGVBdFByZXZpb3VzU3RlcCApIC8gZHQgKTtcclxuICAgIHRoaXMubGVnQW5nbGVBdFByZXZpb3VzU3RlcCA9IHRoaXMubGVnLmFuZ2xlUHJvcGVydHkuZ2V0KCk7XHJcblxyXG4gICAgdGhpcy5zdGVwRW1pdHRlci5lbWl0KCBkdCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRWxlY3Ryb25zIGNhbiBnZXQgb3V0c2lkZSBvZiB0aGUgYm9keSB3aGVuIG1vdmluZyB0byB0aGUgc3BhcmsuICBUaGlzIGNvZGUgbW92ZXMgYW4gZWxlY3Ryb24gYmFjayBpbnNpZGVcclxuICAgKiBpZiB0aGlzIGhhcHBlbnMuXHJcbiAgICogQHBhcmFtICB7RWxlY3Ryb259IGVsZWN0cm9uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIG1vdmVFbGVjdHJvbkluc2lkZUJvZHkoIGVsZWN0cm9uICkge1xyXG4gICAgY29uc3QgcHQgPSBlbGVjdHJvbi5wb3NpdGlvblByb3BlcnR5LmdldCgpO1xyXG5cclxuICAgIC8vQWRqYWNlbnQgc2VnbWVudHMgc2hhcmUgdmVydGljZXMsIHNvIHVzZSBhIHBvaW50IGp1c3QgYmVmb3JlIHRoZSB2ZXJ0ZXggdG8gZmluZCB0aGUgY2xvc2VzdCBzZWdtZW50LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaG4tdHJhdm9sdGFnZS9pc3N1ZXMvNTBcclxuICAgIGNvbnN0IGNsb3Nlc3RTZWdtZW50ID0gXy5taW5CeSggdGhpcy5saW5lU2VnbWVudHMsIGxpbmVTZWdtZW50ID0+IFV0aWxzLmRpc3RUb1NlZ21lbnRTcXVhcmVkKCBwdCwgbGluZVNlZ21lbnQucHJlMCwgbGluZVNlZ21lbnQucHJlMSApICk7XHJcbiAgICBjb25zdCB2ZWN0b3IgPSBwdC5taW51cyggY2xvc2VzdFNlZ21lbnQuY2VudGVyICk7XHJcbiAgICBpZiAoIHZlY3Rvci5kb3QoIGNsb3Nlc3RTZWdtZW50Lm5vcm1hbCApID4gMCApIHtcclxuICAgICAgLy9wdXQgaXQgMXB4IGluc2lkZSB0aGUgc2VnbWVudFxyXG4gICAgICBlbGVjdHJvbi5wb3NpdGlvblByb3BlcnR5LnNldCggY2xvc2VzdFNlZ21lbnQuY2VudGVyLnBsdXMoIGNsb3Nlc3RTZWdtZW50Lm5vcm1hbC50aW1lcyggLTEgKSApICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gcG9pbnRcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYm9keUNvbnRhaW5zUG9pbnQoIHBvaW50ICkge1xyXG4gICAgcmV0dXJuIHRoaXMuYm9keVNoYXBlLmNvbnRhaW5zUG9pbnQoIHBvaW50ICk7XHJcbiAgfVxyXG5cclxuICAvLyBzdGF0aWNzXHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhIHNoYXBlIHRoYXQgZGVmaW5lcyBhbiBvYmplY3QuIFZlcnRpY2VzIGFyZSBwcm92aWRlZCBhbmQgZ2VuZXJhbGx5IGRldGVybWluZWQgYnkgaW5zcGVjdGlvbiB3aXRoIHRoZVxyXG4gICAqIERlYnVnVXRpbHMuZGVidWdQb3NpdGlvbnMuXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAc3RhdGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICovXHJcbiAgc3RhdGljIGNyZWF0ZU9iamVjdFNoYXBlKCB2ZXJ0aWNlcyApIHtcclxuICAgIGNvbnN0IG9iamVjdFNoYXBlID0gbmV3IFNoYXBlKCk7XHJcbiAgICBvYmplY3RTaGFwZS5tb3ZlVG8oIHZlcnRpY2VzWyAwIF0ueCwgdmVydGljZXNbIDAgXS55ICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB2ZXJ0aWNlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgb2JqZWN0U2hhcGUubGluZVRvKCB2ZXJ0aWNlc1sgaSBdLngsIHZlcnRpY2VzWyBpIF0ueSApO1xyXG4gICAgfVxyXG4gICAgb2JqZWN0U2hhcGUuY2xvc2UoKTtcclxuXHJcbiAgICByZXR1cm4gb2JqZWN0U2hhcGU7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuLy8gbWF4IG51bWJlciBvZiBlbGVjdHJvbnMgdGhhdCBjYW4gYmUgaW5zaWRlIHRoZSBib2R5XHJcbkpvaG5UcmF2b2x0YWdlTW9kZWwuTUFYX0VMRUNUUk9OUyA9IE1BWF9FTEVDVFJPTlM7XHJcblxyXG4vLyBtaW4gYW5kIG1heCBhbmdsZSB3aGVyZSBmb290IGlzIG9uIGNhcnBldCwgaW4gcmFkaWFuc1xyXG5Kb2huVHJhdm9sdGFnZU1vZGVsLkZPT1RfT05fQ0FSUEVUX01JTl9BTkdMRSA9IEZPT1RfT05fQ0FSUEVUX01JTl9BTkdMRTtcclxuSm9oblRyYXZvbHRhZ2VNb2RlbC5GT09UX09OX0NBUlBFVF9NQVhfQU5HTEUgPSBGT09UX09OX0NBUlBFVF9NQVhfQU5HTEU7XHJcblxyXG4vL0Z1bmN0aW9uIHRvIGRldGVybWluZSBpZiBlbGVjdHJvbnMgYXJlIGV4aXRpbmcuXHJcbmNvbnN0IGV4aXRpbmcgPSBlID0+IGUuZXhpdGluZztcclxuXHJcbmpvaG5UcmF2b2x0YWdlLnJlZ2lzdGVyKCAnSm9oblRyYXZvbHRhZ2VNb2RlbCcsIEpvaG5UcmF2b2x0YWdlTW9kZWwgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEpvaG5UcmF2b2x0YWdlTW9kZWw7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxP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