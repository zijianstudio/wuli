// Copyright 2016-2022, University of Colorado Boulder

/**
 * Common model (base type) for Masses and Springs
 *
 * @author Matt Pennington (PhET Interactive Simulations)
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import LinearFunction from '../../../../dot/js/LinearFunction.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import Stopwatch from '../../../../scenery-phet/js/Stopwatch.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import massesAndSprings from '../../massesAndSprings.js';
import MassesAndSpringsConstants from '../MassesAndSpringsConstants.js';
import MassesAndSpringsColors from '../view/MassesAndSpringsColors.js';
import OscillatingSpringNode from '../view/OscillatingSpringNode.js';
import Body from './Body.js';
import ForcesMode from './ForcesMode.js';
import Mass from './Mass.js';
import Spring from './Spring.js';

// constants
const GRABBING_DISTANCE = 0.1; // {number} horizontal distance in meters from a mass where a spring will be connected
const RELEASE_DISTANCE = 0.12; // {number} horizontal distance in meters from a mass where a spring will be released
const UPPER_CONSTRAINT = new LinearFunction(20, 60, 1.353, 1.265); // Limits how much we can prime the spring.

class MassesAndSpringsModel {
  /**
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(tandem, options) {
    options = merge({
      damping: 0
    }, options);

    // Flag used to differentiate basics and non-basics version
    this.basicsVersion = true;

    // @public {Property.<boolean>} determines whether the sim is in a play/pause state
    this.playingProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('playingProperty')
    });

    // @public {Property.<number>} coefficient of damping applied to the system
    this.dampingProperty = new NumberProperty(options.damping, {
      units: 'N',
      tandem: tandem.createTandem('dampingProperty')
    });

    // @public {Property.<number|null>} gravitational acceleration association with the spring system
    this.gravityProperty = new Property(MassesAndSpringsConstants.EARTH_GRAVITY, {
      reentrant: true,
      // used due to extremely small rounding
      tandem: tandem.createTandem('gravityProperty'),
      units: 'm/s/s'
    });

    // @private Controls play speed of the simulation
    this.timeSpeedProperty = new EnumerationProperty(TimeSpeed.NORMAL, {
      tandem: tandem.createTandem('timeSpeedProperty')
    });

    // @public {Property.<boolean>} determines visibility of ruler node
    this.rulerVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('rulerVisibleProperty')
    });

    // @public
    this.stopwatch = new Stopwatch({
      timePropertyOptions: {
        range: Stopwatch.ZERO_TO_ALMOST_SIXTY
      },
      tandem: tandem.createTandem('stopwatch')
    });

    // @public {Property.<boolean>} determines whether timer is active or not
    this.timerRunningProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('timerRunningProperty')
    });

    // @public {Property.<boolean>} determines visibility of movable line node
    this.movableLineVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('movableLineVisibleProperty')
    });

    // @public {Property.<boolean>} determines visibility of equilibrium line node
    this.equilibriumPositionVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('equilibriumPositionVisibleProperty')
    });

    // @public {Property.<boolean>} determines visibility of natural length line node. Note this is also used for the
    // displacementArrowNode's visibility because they should both be visible at the same time.
    this.naturalLengthVisibleProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('naturalLengthVisibleProperty')
    });

    // @public {Property.<string>} body of planet selected
    this.bodyProperty = new Property(Body.EARTH, {
      tandem: tandem.createTandem('bodyProperty'),
      phetioValueType: Body.BodyIO
    });

    // Visibility Properties of vectors associated with each mass
    // @public {Property.<boolean>} determines the visibility of the velocity vector
    this.velocityVectorVisibilityProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('velocityVectorVisibilityProperty')
    });

    // @public {Property.<boolean>} determines the visibility of the acceleration vector
    this.accelerationVectorVisibilityProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('accelerationVectorVisibilityProperty')
    });

    // @public {Property.<boolean>} determines the visibility of the gravitational force vector
    this.gravityVectorVisibilityProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('gravityVectorVisibilityProperty')
    });

    // @public {Property.<boolean>} determines the visibility of the spring force vector
    this.springVectorVisibilityProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('springVectorVisibilityProperty')
    });

    // @public {Property.<string>} determines mode of the vectors to be viewed
    this.forcesModeProperty = new EnumerationDeprecatedProperty(ForcesMode, ForcesMode.FORCES, {
      tandem: tandem.createTandem('forcesModeProperty')
    });

    // @public {Spring[]} Array that will contain all of the springs.
    this.springs = [];

    // @public {Mass[]} Array that will contain all of the masses. Order of masses depends on order in array.
    this.masses = [];
  }

  /**
   * Creates new mass object and pushes it into the model's mass array.
   * @public
   *
   * @param {number} mass - mass in kg
   * @param {number} xPosition - starting x-coordinate of the mass object, offset from the first spring position
   * @param {Color} color - color of the MassNode
   * @param {string} specifiedLabel - customized label for the MassNode
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  createMass(mass, xPosition, color, specifiedLabel, tandem, options) {
    this.masses.push(new Mass(mass, xPosition, color, this.gravityProperty, tandem, options));
  }

  /**
   * Creates a new spring and adds it to the model.
   * @public
   *
   * @param {number} x - The x coordinate of the spring, in model coordinates.
   * @param {Tandem} tandem
   */
  createSpring(x, tandem) {
    const spring = new Spring(new Vector2(x, MassesAndSpringsConstants.CEILING_Y), MassesAndSpringsConstants.DEFAULT_SPRING_LENGTH, this.dampingProperty, this.gravityProperty, tandem);
    this.springs.push(spring);
  }

  /**
   * Spring set that contains two springs. Used on the Intro and Vector screens.
   * @protected
   *
   * @param {Tandem} tandem
   */
  addDefaultSprings(tandem) {
    this.createSpring(MassesAndSpringsConstants.LEFT_SPRING_X, tandem.createTandem('leftSpring'));
    this.createSpring(MassesAndSpringsConstants.RIGHT_SPRING_X, tandem.createTandem('rightSpring'));
    this.firstSpring = this.springs[0];
    this.firstSpring.forcesOrientationProperty.set(-1);
    this.secondSpring = this.springs[1];
    this.secondSpring.forcesOrientationProperty.set(1);
  }

  /**
   * Mass set that contains a set of standard masses. Used for several screens in basics and non-basics version.
   * @protected
   *
   * @param {Tandem} tandem
   */
  addDefaultMasses(tandem) {
    if (this.basicsVersion) {
      this.createMass(0.250, 0.12, MassesAndSpringsColors.labeledMassProperty, null, tandem.createTandem('largeMass1'));
      this.createMass(0.250, 0.16, MassesAndSpringsColors.labeledMassProperty, null, tandem.createTandem('largeMass2'));
      this.createMass(0.100, 0.30, MassesAndSpringsColors.labeledMassProperty, null, tandem.createTandem('mediumMass1'));
      this.createMass(0.100, 0.33, MassesAndSpringsColors.labeledMassProperty, null, tandem.createTandem('mediumMass2'));
      this.createMass(0.050, 0.425, MassesAndSpringsColors.labeledMassProperty, null, tandem.createTandem('smallMass1'));
      this.createMass(0.050, 0.445, MassesAndSpringsColors.labeledMassProperty, null, tandem.createTandem('smallMass2'));

      // Mystery masses
      this.createMass(0.200, 0.76, MassesAndSpringsColors.largeMysteryMassProperty, null, tandem.createTandem('largeMysteryMass'), {
        mysteryLabel: true
      });
      this.createMass(0.100, 0.69, MassesAndSpringsColors.mediumMysteryMassProperty, null, tandem.createTandem('mediumMysteryMass'), {
        mysteryLabel: true
      });
      this.createMass(0.075, 0.62, MassesAndSpringsColors.smallMysteryMassProperty, null, tandem.createTandem('smallMysteryMass'), {
        mysteryLabel: true
      });
    } else {
      this.createMass(0.250, 0.12, MassesAndSpringsColors.labeledMassProperty, null, tandem.createTandem('largeMass'));
      this.createMass(0.100, 0.20, MassesAndSpringsColors.labeledMassProperty, null, tandem.createTandem('mediumMass1'));
      this.createMass(0.100, 0.28, MassesAndSpringsColors.labeledMassProperty, null, tandem.createTandem('mediumMass2'));
      this.createMass(0.050, 0.33, MassesAndSpringsColors.labeledMassProperty, null, tandem.createTandem('smallMass'));

      // Mystery masses
      this.createMass(0.200, 0.63, MassesAndSpringsColors.largeMysteryMassProperty, null, tandem.createTandem('largeMysteryMass'), {
        mysteryLabel: true
      });
      this.createMass(0.150, 0.56, MassesAndSpringsColors.mediumMysteryMassProperty, null, tandem.createTandem('mediumMysteryMass'), {
        mysteryLabel: true
      });
      this.createMass(0.075, 0.49, MassesAndSpringsColors.smallMysteryMassProperty, null, tandem.createTandem('smallMysteryMass'), {
        mysteryLabel: true
      });
    }
  }

  /**
   * @public
   */
  reset() {
    this.dampingProperty.reset();
    this.gravityProperty.reset();
    this.bodyProperty.reset();
    this.playingProperty.reset();
    this.timeSpeedProperty.reset();
    this.rulerVisibleProperty.reset();
    this.stopwatch.reset();
    this.timerRunningProperty.reset();
    this.movableLineVisibleProperty.reset();
    this.naturalLengthVisibleProperty.reset();
    this.equilibriumPositionVisibleProperty.reset();
    this.velocityVectorVisibilityProperty.reset();
    this.accelerationVectorVisibilityProperty.reset();
    this.gravityVectorVisibilityProperty.reset();
    this.springVectorVisibilityProperty.reset();
    this.forcesModeProperty.reset();
    this.masses.forEach(mass => {
      mass.reset();
    });
    this.springs.forEach(spring => {
      spring.reset();
    });
  }

  /**
   * Based on new dragged position of mass, try to attach or detach mass if eligible and then update position.
   *
   * @param {Mass} mass
   * @public
   */
  adjustDraggedMassPosition(mass) {
    const massPosition = mass.positionProperty.get();

    // Attempt to detach
    if (mass.springProperty.get() && Math.abs(mass.springProperty.get().positionProperty.get().x - massPosition.x) > RELEASE_DISTANCE) {
      mass.springProperty.get().removeMass();
      mass.detach();
    }

    // Update mass position and spring length if attached
    if (mass.springProperty.get()) {
      // Update the position of the mass
      if (mass.positionProperty.value.x !== mass.springProperty.get().positionProperty.get().x) {
        mass.positionProperty.set(mass.positionProperty.get().copy().setX(mass.springProperty.get().positionProperty.get().x));
      }

      // Update spring displacementProperty so correct spring length is used.
      mass.springProperty.value.updateDisplacement(massPosition.y, false);

      // Maximum y value the spring should be able to contract based on the thickness and amount of spring coils.
      const maxY = mass.springProperty.get().thicknessProperty.get() * OscillatingSpringNode.MAP_NUMBER_OF_LOOPS(mass.springProperty.get().naturalRestingLengthProperty.get());

      // Max Y value in model coordinates
      const modelMaxY = UPPER_CONSTRAINT.evaluate(maxY);

      // Update only the spring's length if we are lower than the max Y
      if (mass.positionProperty.get().y > modelMaxY) {
        // set mass position to maximum y position based on spring coils
        mass.positionProperty.set(mass.positionProperty.get().copy().setY(modelMaxY));

        // Limit the length of the spring based on the spring coils.
        mass.springProperty.value.updateDisplacement(modelMaxY, false);
      }
    }

    // Update mass position if unattached
    else {
      // Attempt to attach. Assumes springs are far enough apart where one mass can't attach to multiple springs.
      this.springs.forEach(spring => {
        if (Math.abs(massPosition.x - spring.positionProperty.get().x) < GRABBING_DISTANCE && Math.abs(massPosition.y - spring.bottomProperty.get()) < GRABBING_DISTANCE && spring.massAttachedProperty.get() === null) {
          spring.setMass(mass);
        }
      });
    }
  }

  /**
   * Responsible for stepping through the model at a specified dt
   * @param {number} dt
   *
   * @public
   */
  stepForward(dt) {
    // steps the nominal amount used by step forward button listener
    this.modelStep(dt);

    // Reset the period trace for each spring.
    // See https://github.com/phetsims/masses-and-springs-basics/issues/58#issuecomment-462860440
    this.springs.forEach(spring => {
      if (spring.periodTrace && spring.periodTrace.stateProperty.value === 4) {
        spring.periodTraceResetEmitter.emit();
      }
    });
  }

  /**
   * @param {number} dt
   * @public
   */
  step(dt) {
    // If simulationTimeStep > 0.3, ignore it - it probably means the user returned to the tab after
    // the tab or the browser was hidden for a while.
    dt = Math.min(dt, 0.3);
    if (this.playingProperty.get()) {
      this.modelStep(dt);
    }
  }

  /**
   * Steps in model time.
   *
   * @param {number} dt
   * @private
   */
  modelStep(dt) {
    const animationDt = dt;

    // Change the dt value if we are playing in slow motion.
    if (this.timeSpeedProperty.get() === TimeSpeed.SLOW && this.playingProperty.get()) {
      dt = dt / MassesAndSpringsConstants.SLOW_SIM_DT_RATIO;
    }
    for (let i = 0; i < this.masses.length; i++) {
      // Fall if not hung or grabbed
      this.masses[i].step(this.gravityProperty.value, MassesAndSpringsConstants.FLOOR_Y + MassesAndSpringsConstants.SHELF_HEIGHT, dt, animationDt);
    }
    this.stopwatch.step(dt);

    // Oscillate springs
    this.springs.forEach(spring => {
      spring.step(dt);
    });
  }
}
massesAndSprings.register('MassesAndSpringsModel', MassesAndSpringsModel);
export default MassesAndSpringsModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSIsIkVudW1lcmF0aW9uUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwiTGluZWFyRnVuY3Rpb24iLCJWZWN0b3IyIiwibWVyZ2UiLCJTdG9wd2F0Y2giLCJUaW1lU3BlZWQiLCJtYXNzZXNBbmRTcHJpbmdzIiwiTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cyIsIk1hc3Nlc0FuZFNwcmluZ3NDb2xvcnMiLCJPc2NpbGxhdGluZ1NwcmluZ05vZGUiLCJCb2R5IiwiRm9yY2VzTW9kZSIsIk1hc3MiLCJTcHJpbmciLCJHUkFCQklOR19ESVNUQU5DRSIsIlJFTEVBU0VfRElTVEFOQ0UiLCJVUFBFUl9DT05TVFJBSU5UIiwiTWFzc2VzQW5kU3ByaW5nc01vZGVsIiwiY29uc3RydWN0b3IiLCJ0YW5kZW0iLCJvcHRpb25zIiwiZGFtcGluZyIsImJhc2ljc1ZlcnNpb24iLCJwbGF5aW5nUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJkYW1waW5nUHJvcGVydHkiLCJ1bml0cyIsImdyYXZpdHlQcm9wZXJ0eSIsIkVBUlRIX0dSQVZJVFkiLCJyZWVudHJhbnQiLCJ0aW1lU3BlZWRQcm9wZXJ0eSIsIk5PUk1BTCIsInJ1bGVyVmlzaWJsZVByb3BlcnR5Iiwic3RvcHdhdGNoIiwidGltZVByb3BlcnR5T3B0aW9ucyIsInJhbmdlIiwiWkVST19UT19BTE1PU1RfU0lYVFkiLCJ0aW1lclJ1bm5pbmdQcm9wZXJ0eSIsIm1vdmFibGVMaW5lVmlzaWJsZVByb3BlcnR5IiwiZXF1aWxpYnJpdW1Qb3NpdGlvblZpc2libGVQcm9wZXJ0eSIsIm5hdHVyYWxMZW5ndGhWaXNpYmxlUHJvcGVydHkiLCJib2R5UHJvcGVydHkiLCJFQVJUSCIsInBoZXRpb1ZhbHVlVHlwZSIsIkJvZHlJTyIsInZlbG9jaXR5VmVjdG9yVmlzaWJpbGl0eVByb3BlcnR5IiwiYWNjZWxlcmF0aW9uVmVjdG9yVmlzaWJpbGl0eVByb3BlcnR5IiwiZ3Jhdml0eVZlY3RvclZpc2liaWxpdHlQcm9wZXJ0eSIsInNwcmluZ1ZlY3RvclZpc2liaWxpdHlQcm9wZXJ0eSIsImZvcmNlc01vZGVQcm9wZXJ0eSIsIkZPUkNFUyIsInNwcmluZ3MiLCJtYXNzZXMiLCJjcmVhdGVNYXNzIiwibWFzcyIsInhQb3NpdGlvbiIsImNvbG9yIiwic3BlY2lmaWVkTGFiZWwiLCJwdXNoIiwiY3JlYXRlU3ByaW5nIiwieCIsInNwcmluZyIsIkNFSUxJTkdfWSIsIkRFRkFVTFRfU1BSSU5HX0xFTkdUSCIsImFkZERlZmF1bHRTcHJpbmdzIiwiTEVGVF9TUFJJTkdfWCIsIlJJR0hUX1NQUklOR19YIiwiZmlyc3RTcHJpbmciLCJmb3JjZXNPcmllbnRhdGlvblByb3BlcnR5Iiwic2V0Iiwic2Vjb25kU3ByaW5nIiwiYWRkRGVmYXVsdE1hc3NlcyIsImxhYmVsZWRNYXNzUHJvcGVydHkiLCJsYXJnZU15c3RlcnlNYXNzUHJvcGVydHkiLCJteXN0ZXJ5TGFiZWwiLCJtZWRpdW1NeXN0ZXJ5TWFzc1Byb3BlcnR5Iiwic21hbGxNeXN0ZXJ5TWFzc1Byb3BlcnR5IiwicmVzZXQiLCJmb3JFYWNoIiwiYWRqdXN0RHJhZ2dlZE1hc3NQb3NpdGlvbiIsIm1hc3NQb3NpdGlvbiIsInBvc2l0aW9uUHJvcGVydHkiLCJnZXQiLCJzcHJpbmdQcm9wZXJ0eSIsIk1hdGgiLCJhYnMiLCJyZW1vdmVNYXNzIiwiZGV0YWNoIiwidmFsdWUiLCJjb3B5Iiwic2V0WCIsInVwZGF0ZURpc3BsYWNlbWVudCIsInkiLCJtYXhZIiwidGhpY2tuZXNzUHJvcGVydHkiLCJNQVBfTlVNQkVSX09GX0xPT1BTIiwibmF0dXJhbFJlc3RpbmdMZW5ndGhQcm9wZXJ0eSIsIm1vZGVsTWF4WSIsImV2YWx1YXRlIiwic2V0WSIsImJvdHRvbVByb3BlcnR5IiwibWFzc0F0dGFjaGVkUHJvcGVydHkiLCJzZXRNYXNzIiwic3RlcEZvcndhcmQiLCJkdCIsIm1vZGVsU3RlcCIsInBlcmlvZFRyYWNlIiwic3RhdGVQcm9wZXJ0eSIsInBlcmlvZFRyYWNlUmVzZXRFbWl0dGVyIiwiZW1pdCIsInN0ZXAiLCJtaW4iLCJhbmltYXRpb25EdCIsIlNMT1ciLCJTTE9XX1NJTV9EVF9SQVRJTyIsImkiLCJsZW5ndGgiLCJGTE9PUl9ZIiwiU0hFTEZfSEVJR0hUIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNYXNzZXNBbmRTcHJpbmdzTW9kZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29tbW9uIG1vZGVsIChiYXNlIHR5cGUpIGZvciBNYXNzZXMgYW5kIFNwcmluZ3NcclxuICpcclxuICogQGF1dGhvciBNYXR0IFBlbm5pbmd0b24gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgRGVuemVsbCBCYXJuZXR0IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTGluZWFyRnVuY3Rpb24gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0xpbmVhckZ1bmN0aW9uLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFN0b3B3YXRjaCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvU3RvcHdhdGNoLmpzJztcclxuaW1wb3J0IFRpbWVTcGVlZCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvVGltZVNwZWVkLmpzJztcclxuaW1wb3J0IG1hc3Nlc0FuZFNwcmluZ3MgZnJvbSAnLi4vLi4vbWFzc2VzQW5kU3ByaW5ncy5qcyc7XHJcbmltcG9ydCBNYXNzZXNBbmRTcHJpbmdzQ29uc3RhbnRzIGZyb20gJy4uL01hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgTWFzc2VzQW5kU3ByaW5nc0NvbG9ycyBmcm9tICcuLi92aWV3L01hc3Nlc0FuZFNwcmluZ3NDb2xvcnMuanMnO1xyXG5pbXBvcnQgT3NjaWxsYXRpbmdTcHJpbmdOb2RlIGZyb20gJy4uL3ZpZXcvT3NjaWxsYXRpbmdTcHJpbmdOb2RlLmpzJztcclxuaW1wb3J0IEJvZHkgZnJvbSAnLi9Cb2R5LmpzJztcclxuaW1wb3J0IEZvcmNlc01vZGUgZnJvbSAnLi9Gb3JjZXNNb2RlLmpzJztcclxuaW1wb3J0IE1hc3MgZnJvbSAnLi9NYXNzLmpzJztcclxuaW1wb3J0IFNwcmluZyBmcm9tICcuL1NwcmluZy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgR1JBQkJJTkdfRElTVEFOQ0UgPSAwLjE7IC8vIHtudW1iZXJ9IGhvcml6b250YWwgZGlzdGFuY2UgaW4gbWV0ZXJzIGZyb20gYSBtYXNzIHdoZXJlIGEgc3ByaW5nIHdpbGwgYmUgY29ubmVjdGVkXHJcbmNvbnN0IFJFTEVBU0VfRElTVEFOQ0UgPSAwLjEyOyAvLyB7bnVtYmVyfSBob3Jpem9udGFsIGRpc3RhbmNlIGluIG1ldGVycyBmcm9tIGEgbWFzcyB3aGVyZSBhIHNwcmluZyB3aWxsIGJlIHJlbGVhc2VkXHJcbmNvbnN0IFVQUEVSX0NPTlNUUkFJTlQgPSBuZXcgTGluZWFyRnVuY3Rpb24oIDIwLCA2MCwgMS4zNTMsIDEuMjY1ICk7IC8vIExpbWl0cyBob3cgbXVjaCB3ZSBjYW4gcHJpbWUgdGhlIHNwcmluZy5cclxuXHJcbmNsYXNzIE1hc3Nlc0FuZFNwcmluZ3NNb2RlbCB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdGFuZGVtLCBvcHRpb25zICkge1xyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIGRhbXBpbmc6IDBcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBGbGFnIHVzZWQgdG8gZGlmZmVyZW50aWF0ZSBiYXNpY3MgYW5kIG5vbi1iYXNpY3MgdmVyc2lvblxyXG4gICAgdGhpcy5iYXNpY3NWZXJzaW9uID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59IGRldGVybWluZXMgd2hldGhlciB0aGUgc2ltIGlzIGluIGEgcGxheS9wYXVzZSBzdGF0ZVxyXG4gICAgdGhpcy5wbGF5aW5nUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BsYXlpbmdQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fSBjb2VmZmljaWVudCBvZiBkYW1waW5nIGFwcGxpZWQgdG8gdGhlIHN5c3RlbVxyXG4gICAgdGhpcy5kYW1waW5nUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIG9wdGlvbnMuZGFtcGluZywge1xyXG4gICAgICB1bml0czogJ04nLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdkYW1waW5nUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48bnVtYmVyfG51bGw+fSBncmF2aXRhdGlvbmFsIGFjY2VsZXJhdGlvbiBhc3NvY2lhdGlvbiB3aXRoIHRoZSBzcHJpbmcgc3lzdGVtXHJcbiAgICB0aGlzLmdyYXZpdHlQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cy5FQVJUSF9HUkFWSVRZLCB7XHJcbiAgICAgIHJlZW50cmFudDogdHJ1ZSwgLy8gdXNlZCBkdWUgdG8gZXh0cmVtZWx5IHNtYWxsIHJvdW5kaW5nXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2dyYXZpdHlQcm9wZXJ0eScgKSxcclxuICAgICAgdW5pdHM6ICdtL3MvcydcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSBDb250cm9scyBwbGF5IHNwZWVkIG9mIHRoZSBzaW11bGF0aW9uXHJcbiAgICB0aGlzLnRpbWVTcGVlZFByb3BlcnR5ID0gbmV3IEVudW1lcmF0aW9uUHJvcGVydHkoIFRpbWVTcGVlZC5OT1JNQUwsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndGltZVNwZWVkUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59IGRldGVybWluZXMgdmlzaWJpbGl0eSBvZiBydWxlciBub2RlXHJcbiAgICB0aGlzLnJ1bGVyVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncnVsZXJWaXNpYmxlUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljXHJcbiAgICB0aGlzLnN0b3B3YXRjaCA9IG5ldyBTdG9wd2F0Y2goIHtcclxuICAgICAgdGltZVByb3BlcnR5T3B0aW9uczoge1xyXG4gICAgICAgIHJhbmdlOiBTdG9wd2F0Y2guWkVST19UT19BTE1PU1RfU0lYVFlcclxuICAgICAgfSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3RvcHdhdGNoJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fSBkZXRlcm1pbmVzIHdoZXRoZXIgdGltZXIgaXMgYWN0aXZlIG9yIG5vdFxyXG4gICAgdGhpcy50aW1lclJ1bm5pbmdQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RpbWVyUnVubmluZ1Byb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fSBkZXRlcm1pbmVzIHZpc2liaWxpdHkgb2YgbW92YWJsZSBsaW5lIG5vZGVcclxuICAgIHRoaXMubW92YWJsZUxpbmVWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtb3ZhYmxlTGluZVZpc2libGVQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gZGV0ZXJtaW5lcyB2aXNpYmlsaXR5IG9mIGVxdWlsaWJyaXVtIGxpbmUgbm9kZVxyXG4gICAgdGhpcy5lcXVpbGlicml1bVBvc2l0aW9uVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZXF1aWxpYnJpdW1Qb3NpdGlvblZpc2libGVQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gZGV0ZXJtaW5lcyB2aXNpYmlsaXR5IG9mIG5hdHVyYWwgbGVuZ3RoIGxpbmUgbm9kZS4gTm90ZSB0aGlzIGlzIGFsc28gdXNlZCBmb3IgdGhlXHJcbiAgICAvLyBkaXNwbGFjZW1lbnRBcnJvd05vZGUncyB2aXNpYmlsaXR5IGJlY2F1c2UgdGhleSBzaG91bGQgYm90aCBiZSB2aXNpYmxlIGF0IHRoZSBzYW1lIHRpbWUuXHJcbiAgICB0aGlzLm5hdHVyYWxMZW5ndGhWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICduYXR1cmFsTGVuZ3RoVmlzaWJsZVByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPHN0cmluZz59IGJvZHkgb2YgcGxhbmV0IHNlbGVjdGVkXHJcbiAgICB0aGlzLmJvZHlQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggQm9keS5FQVJUSCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdib2R5UHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1ZhbHVlVHlwZTogQm9keS5Cb2R5SU9cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBWaXNpYmlsaXR5IFByb3BlcnRpZXMgb2YgdmVjdG9ycyBhc3NvY2lhdGVkIHdpdGggZWFjaCBtYXNzXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59IGRldGVybWluZXMgdGhlIHZpc2liaWxpdHkgb2YgdGhlIHZlbG9jaXR5IHZlY3RvclxyXG4gICAgdGhpcy52ZWxvY2l0eVZlY3RvclZpc2liaWxpdHlQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZlbG9jaXR5VmVjdG9yVmlzaWJpbGl0eVByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPGJvb2xlYW4+fSBkZXRlcm1pbmVzIHRoZSB2aXNpYmlsaXR5IG9mIHRoZSBhY2NlbGVyYXRpb24gdmVjdG9yXHJcbiAgICB0aGlzLmFjY2VsZXJhdGlvblZlY3RvclZpc2liaWxpdHlQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2FjY2VsZXJhdGlvblZlY3RvclZpc2liaWxpdHlQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gZGV0ZXJtaW5lcyB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgZ3Jhdml0YXRpb25hbCBmb3JjZSB2ZWN0b3JcclxuICAgIHRoaXMuZ3Jhdml0eVZlY3RvclZpc2liaWxpdHlQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2dyYXZpdHlWZWN0b3JWaXNpYmlsaXR5UHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59IGRldGVybWluZXMgdGhlIHZpc2liaWxpdHkgb2YgdGhlIHNwcmluZyBmb3JjZSB2ZWN0b3JcclxuICAgIHRoaXMuc3ByaW5nVmVjdG9yVmlzaWJpbGl0eVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3ByaW5nVmVjdG9yVmlzaWJpbGl0eVByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPHN0cmluZz59IGRldGVybWluZXMgbW9kZSBvZiB0aGUgdmVjdG9ycyB0byBiZSB2aWV3ZWRcclxuICAgIHRoaXMuZm9yY2VzTW9kZVByb3BlcnR5ID0gbmV3IEVudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5KFxyXG4gICAgICBGb3JjZXNNb2RlLFxyXG4gICAgICBGb3JjZXNNb2RlLkZPUkNFUywge1xyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZvcmNlc01vZGVQcm9wZXJ0eScgKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7U3ByaW5nW119IEFycmF5IHRoYXQgd2lsbCBjb250YWluIGFsbCBvZiB0aGUgc3ByaW5ncy5cclxuICAgIHRoaXMuc3ByaW5ncyA9IFtdO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge01hc3NbXX0gQXJyYXkgdGhhdCB3aWxsIGNvbnRhaW4gYWxsIG9mIHRoZSBtYXNzZXMuIE9yZGVyIG9mIG1hc3NlcyBkZXBlbmRzIG9uIG9yZGVyIGluIGFycmF5LlxyXG4gICAgdGhpcy5tYXNzZXMgPSBbXTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIG5ldyBtYXNzIG9iamVjdCBhbmQgcHVzaGVzIGl0IGludG8gdGhlIG1vZGVsJ3MgbWFzcyBhcnJheS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbWFzcyAtIG1hc3MgaW4ga2dcclxuICAgKiBAcGFyYW0ge251bWJlcn0geFBvc2l0aW9uIC0gc3RhcnRpbmcgeC1jb29yZGluYXRlIG9mIHRoZSBtYXNzIG9iamVjdCwgb2Zmc2V0IGZyb20gdGhlIGZpcnN0IHNwcmluZyBwb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7Q29sb3J9IGNvbG9yIC0gY29sb3Igb2YgdGhlIE1hc3NOb2RlXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNwZWNpZmllZExhYmVsIC0gY3VzdG9taXplZCBsYWJlbCBmb3IgdGhlIE1hc3NOb2RlXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjcmVhdGVNYXNzKCBtYXNzLCB4UG9zaXRpb24sIGNvbG9yLCBzcGVjaWZpZWRMYWJlbCwgdGFuZGVtLCBvcHRpb25zICkge1xyXG4gICAgdGhpcy5tYXNzZXMucHVzaCggbmV3IE1hc3MoIG1hc3MsIHhQb3NpdGlvbiwgY29sb3IsIHRoaXMuZ3Jhdml0eVByb3BlcnR5LCB0YW5kZW0sIG9wdGlvbnMgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBzcHJpbmcgYW5kIGFkZHMgaXQgdG8gdGhlIG1vZGVsLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gVGhlIHggY29vcmRpbmF0ZSBvZiB0aGUgc3ByaW5nLCBpbiBtb2RlbCBjb29yZGluYXRlcy5cclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY3JlYXRlU3ByaW5nKCB4LCB0YW5kZW0gKSB7XHJcbiAgICBjb25zdCBzcHJpbmcgPSBuZXcgU3ByaW5nKFxyXG4gICAgICBuZXcgVmVjdG9yMiggeCwgTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cy5DRUlMSU5HX1kgKSxcclxuICAgICAgTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cy5ERUZBVUxUX1NQUklOR19MRU5HVEgsXHJcbiAgICAgIHRoaXMuZGFtcGluZ1Byb3BlcnR5LFxyXG4gICAgICB0aGlzLmdyYXZpdHlQcm9wZXJ0eSxcclxuICAgICAgdGFuZGVtXHJcbiAgICApO1xyXG4gICAgdGhpcy5zcHJpbmdzLnB1c2goIHNwcmluZyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3ByaW5nIHNldCB0aGF0IGNvbnRhaW5zIHR3byBzcHJpbmdzLiBVc2VkIG9uIHRoZSBJbnRybyBhbmQgVmVjdG9yIHNjcmVlbnMuXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGFkZERlZmF1bHRTcHJpbmdzKCB0YW5kZW0gKSB7XHJcbiAgICB0aGlzLmNyZWF0ZVNwcmluZyggTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cy5MRUZUX1NQUklOR19YLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGVmdFNwcmluZycgKSApO1xyXG4gICAgdGhpcy5jcmVhdGVTcHJpbmcoIE1hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMuUklHSFRfU1BSSU5HX1gsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyaWdodFNwcmluZycgKSApO1xyXG4gICAgdGhpcy5maXJzdFNwcmluZyA9IHRoaXMuc3ByaW5nc1sgMCBdO1xyXG4gICAgdGhpcy5maXJzdFNwcmluZy5mb3JjZXNPcmllbnRhdGlvblByb3BlcnR5LnNldCggLTEgKTtcclxuICAgIHRoaXMuc2Vjb25kU3ByaW5nID0gdGhpcy5zcHJpbmdzWyAxIF07XHJcbiAgICB0aGlzLnNlY29uZFNwcmluZy5mb3JjZXNPcmllbnRhdGlvblByb3BlcnR5LnNldCggMSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFzcyBzZXQgdGhhdCBjb250YWlucyBhIHNldCBvZiBzdGFuZGFyZCBtYXNzZXMuIFVzZWQgZm9yIHNldmVyYWwgc2NyZWVucyBpbiBiYXNpY3MgYW5kIG5vbi1iYXNpY3MgdmVyc2lvbi5cclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgYWRkRGVmYXVsdE1hc3NlcyggdGFuZGVtICkge1xyXG4gICAgaWYgKCB0aGlzLmJhc2ljc1ZlcnNpb24gKSB7XHJcbiAgICAgIHRoaXMuY3JlYXRlTWFzcyggMC4yNTAsIDAuMTIsIE1hc3Nlc0FuZFNwcmluZ3NDb2xvcnMubGFiZWxlZE1hc3NQcm9wZXJ0eSwgbnVsbCwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xhcmdlTWFzczEnICkgKTtcclxuICAgICAgdGhpcy5jcmVhdGVNYXNzKCAwLjI1MCwgMC4xNiwgTWFzc2VzQW5kU3ByaW5nc0NvbG9ycy5sYWJlbGVkTWFzc1Byb3BlcnR5LCBudWxsLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGFyZ2VNYXNzMicgKSApO1xyXG4gICAgICB0aGlzLmNyZWF0ZU1hc3MoIDAuMTAwLCAwLjMwLCBNYXNzZXNBbmRTcHJpbmdzQ29sb3JzLmxhYmVsZWRNYXNzUHJvcGVydHksIG51bGwsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtZWRpdW1NYXNzMScgKSApO1xyXG4gICAgICB0aGlzLmNyZWF0ZU1hc3MoIDAuMTAwLCAwLjMzLCBNYXNzZXNBbmRTcHJpbmdzQ29sb3JzLmxhYmVsZWRNYXNzUHJvcGVydHksIG51bGwsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtZWRpdW1NYXNzMicgKSApO1xyXG4gICAgICB0aGlzLmNyZWF0ZU1hc3MoIDAuMDUwLCAwLjQyNSwgTWFzc2VzQW5kU3ByaW5nc0NvbG9ycy5sYWJlbGVkTWFzc1Byb3BlcnR5LCBudWxsLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc21hbGxNYXNzMScgKSApO1xyXG4gICAgICB0aGlzLmNyZWF0ZU1hc3MoIDAuMDUwLCAwLjQ0NSwgTWFzc2VzQW5kU3ByaW5nc0NvbG9ycy5sYWJlbGVkTWFzc1Byb3BlcnR5LCBudWxsLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc21hbGxNYXNzMicgKSApO1xyXG5cclxuXHJcbiAgICAgIC8vIE15c3RlcnkgbWFzc2VzXHJcbiAgICAgIHRoaXMuY3JlYXRlTWFzcyggMC4yMDAsIDAuNzYsIE1hc3Nlc0FuZFNwcmluZ3NDb2xvcnMubGFyZ2VNeXN0ZXJ5TWFzc1Byb3BlcnR5LCBudWxsLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGFyZ2VNeXN0ZXJ5TWFzcycgKSwge1xyXG4gICAgICAgIG15c3RlcnlMYWJlbDogdHJ1ZVxyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMuY3JlYXRlTWFzcyggMC4xMDAsIDAuNjksIE1hc3Nlc0FuZFNwcmluZ3NDb2xvcnMubWVkaXVtTXlzdGVyeU1hc3NQcm9wZXJ0eSwgbnVsbCwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21lZGl1bU15c3RlcnlNYXNzJyApLCB7XHJcbiAgICAgICAgbXlzdGVyeUxhYmVsOiB0cnVlXHJcbiAgICAgIH0gKTtcclxuICAgICAgdGhpcy5jcmVhdGVNYXNzKCAwLjA3NSwgMC42MiwgTWFzc2VzQW5kU3ByaW5nc0NvbG9ycy5zbWFsbE15c3RlcnlNYXNzUHJvcGVydHksIG51bGwsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzbWFsbE15c3RlcnlNYXNzJyApLCB7XHJcbiAgICAgICAgbXlzdGVyeUxhYmVsOiB0cnVlXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLmNyZWF0ZU1hc3MoIDAuMjUwLCAwLjEyLCBNYXNzZXNBbmRTcHJpbmdzQ29sb3JzLmxhYmVsZWRNYXNzUHJvcGVydHksIG51bGwsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdsYXJnZU1hc3MnICkgKTtcclxuICAgICAgdGhpcy5jcmVhdGVNYXNzKCAwLjEwMCwgMC4yMCwgTWFzc2VzQW5kU3ByaW5nc0NvbG9ycy5sYWJlbGVkTWFzc1Byb3BlcnR5LCBudWxsLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbWVkaXVtTWFzczEnICkgKTtcclxuICAgICAgdGhpcy5jcmVhdGVNYXNzKCAwLjEwMCwgMC4yOCwgTWFzc2VzQW5kU3ByaW5nc0NvbG9ycy5sYWJlbGVkTWFzc1Byb3BlcnR5LCBudWxsLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbWVkaXVtTWFzczInICkgKTtcclxuICAgICAgdGhpcy5jcmVhdGVNYXNzKCAwLjA1MCwgMC4zMywgTWFzc2VzQW5kU3ByaW5nc0NvbG9ycy5sYWJlbGVkTWFzc1Byb3BlcnR5LCBudWxsLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc21hbGxNYXNzJyApICk7XHJcblxyXG5cclxuICAgICAgLy8gTXlzdGVyeSBtYXNzZXNcclxuICAgICAgdGhpcy5jcmVhdGVNYXNzKCAwLjIwMCwgMC42MywgTWFzc2VzQW5kU3ByaW5nc0NvbG9ycy5sYXJnZU15c3RlcnlNYXNzUHJvcGVydHksIG51bGwsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdsYXJnZU15c3RlcnlNYXNzJyApLCB7XHJcbiAgICAgICAgbXlzdGVyeUxhYmVsOiB0cnVlXHJcbiAgICAgIH0gKTtcclxuICAgICAgdGhpcy5jcmVhdGVNYXNzKCAwLjE1MCwgMC41NiwgTWFzc2VzQW5kU3ByaW5nc0NvbG9ycy5tZWRpdW1NeXN0ZXJ5TWFzc1Byb3BlcnR5LCBudWxsLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbWVkaXVtTXlzdGVyeU1hc3MnICksIHtcclxuICAgICAgICBteXN0ZXJ5TGFiZWw6IHRydWVcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLmNyZWF0ZU1hc3MoIDAuMDc1LCAwLjQ5LCBNYXNzZXNBbmRTcHJpbmdzQ29sb3JzLnNtYWxsTXlzdGVyeU1hc3NQcm9wZXJ0eSwgbnVsbCwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NtYWxsTXlzdGVyeU1hc3MnICksIHtcclxuICAgICAgICBteXN0ZXJ5TGFiZWw6IHRydWVcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5kYW1waW5nUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuZ3Jhdml0eVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmJvZHlQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5wbGF5aW5nUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMudGltZVNwZWVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMucnVsZXJWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc3RvcHdhdGNoLnJlc2V0KCk7XHJcbiAgICB0aGlzLnRpbWVyUnVubmluZ1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLm1vdmFibGVMaW5lVmlzaWJsZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLm5hdHVyYWxMZW5ndGhWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuZXF1aWxpYnJpdW1Qb3NpdGlvblZpc2libGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy52ZWxvY2l0eVZlY3RvclZpc2liaWxpdHlQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5hY2NlbGVyYXRpb25WZWN0b3JWaXNpYmlsaXR5UHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuZ3Jhdml0eVZlY3RvclZpc2liaWxpdHlQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zcHJpbmdWZWN0b3JWaXNpYmlsaXR5UHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuZm9yY2VzTW9kZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLm1hc3Nlcy5mb3JFYWNoKCBtYXNzID0+IHsgbWFzcy5yZXNldCgpOyB9ICk7XHJcbiAgICB0aGlzLnNwcmluZ3MuZm9yRWFjaCggc3ByaW5nID0+IHsgc3ByaW5nLnJlc2V0KCk7IH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEJhc2VkIG9uIG5ldyBkcmFnZ2VkIHBvc2l0aW9uIG9mIG1hc3MsIHRyeSB0byBhdHRhY2ggb3IgZGV0YWNoIG1hc3MgaWYgZWxpZ2libGUgYW5kIHRoZW4gdXBkYXRlIHBvc2l0aW9uLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNYXNzfSBtYXNzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGFkanVzdERyYWdnZWRNYXNzUG9zaXRpb24oIG1hc3MgKSB7XHJcbiAgICBjb25zdCBtYXNzUG9zaXRpb24gPSBtYXNzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcblxyXG4gICAgLy8gQXR0ZW1wdCB0byBkZXRhY2hcclxuICAgIGlmICggbWFzcy5zcHJpbmdQcm9wZXJ0eS5nZXQoKVxyXG4gICAgICAgICAmJiBNYXRoLmFicyggbWFzcy5zcHJpbmdQcm9wZXJ0eS5nZXQoKS5wb3NpdGlvblByb3BlcnR5LmdldCgpLnggLSBtYXNzUG9zaXRpb24ueCApID4gUkVMRUFTRV9ESVNUQU5DRSApIHtcclxuICAgICAgbWFzcy5zcHJpbmdQcm9wZXJ0eS5nZXQoKS5yZW1vdmVNYXNzKCk7XHJcbiAgICAgIG1hc3MuZGV0YWNoKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXBkYXRlIG1hc3MgcG9zaXRpb24gYW5kIHNwcmluZyBsZW5ndGggaWYgYXR0YWNoZWRcclxuICAgIGlmICggbWFzcy5zcHJpbmdQcm9wZXJ0eS5nZXQoKSApIHtcclxuXHJcbiAgICAgIC8vIFVwZGF0ZSB0aGUgcG9zaXRpb24gb2YgdGhlIG1hc3NcclxuICAgICAgaWYgKCBtYXNzLnBvc2l0aW9uUHJvcGVydHkudmFsdWUueCAhPT0gbWFzcy5zcHJpbmdQcm9wZXJ0eS5nZXQoKS5wb3NpdGlvblByb3BlcnR5LmdldCgpLnggKSB7XHJcbiAgICAgICAgbWFzcy5wb3NpdGlvblByb3BlcnR5LnNldCggbWFzcy5wb3NpdGlvblByb3BlcnR5LmdldCgpLmNvcHkoKS5zZXRYKFxyXG4gICAgICAgICAgbWFzcy5zcHJpbmdQcm9wZXJ0eS5nZXQoKS5wb3NpdGlvblByb3BlcnR5LmdldCgpLnggKSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBVcGRhdGUgc3ByaW5nIGRpc3BsYWNlbWVudFByb3BlcnR5IHNvIGNvcnJlY3Qgc3ByaW5nIGxlbmd0aCBpcyB1c2VkLlxyXG4gICAgICBtYXNzLnNwcmluZ1Byb3BlcnR5LnZhbHVlLnVwZGF0ZURpc3BsYWNlbWVudCggbWFzc1Bvc2l0aW9uLnksIGZhbHNlICk7XHJcblxyXG4gICAgICAvLyBNYXhpbXVtIHkgdmFsdWUgdGhlIHNwcmluZyBzaG91bGQgYmUgYWJsZSB0byBjb250cmFjdCBiYXNlZCBvbiB0aGUgdGhpY2tuZXNzIGFuZCBhbW91bnQgb2Ygc3ByaW5nIGNvaWxzLlxyXG4gICAgICBjb25zdCBtYXhZID0gbWFzcy5zcHJpbmdQcm9wZXJ0eS5nZXQoKS50aGlja25lc3NQcm9wZXJ0eS5nZXQoKSAqXHJcbiAgICAgICAgICAgICAgICAgICBPc2NpbGxhdGluZ1NwcmluZ05vZGUuTUFQX05VTUJFUl9PRl9MT09QUyhcclxuICAgICAgICAgICAgICAgICAgICAgbWFzcy5zcHJpbmdQcm9wZXJ0eS5nZXQoKS5uYXR1cmFsUmVzdGluZ0xlbmd0aFByb3BlcnR5LmdldCgpICk7XHJcblxyXG4gICAgICAvLyBNYXggWSB2YWx1ZSBpbiBtb2RlbCBjb29yZGluYXRlc1xyXG4gICAgICBjb25zdCBtb2RlbE1heFkgPSBVUFBFUl9DT05TVFJBSU5ULmV2YWx1YXRlKCBtYXhZICk7XHJcblxyXG4gICAgICAvLyBVcGRhdGUgb25seSB0aGUgc3ByaW5nJ3MgbGVuZ3RoIGlmIHdlIGFyZSBsb3dlciB0aGFuIHRoZSBtYXggWVxyXG4gICAgICBpZiAoIG1hc3MucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS55ID4gbW9kZWxNYXhZICkge1xyXG5cclxuICAgICAgICAvLyBzZXQgbWFzcyBwb3NpdGlvbiB0byBtYXhpbXVtIHkgcG9zaXRpb24gYmFzZWQgb24gc3ByaW5nIGNvaWxzXHJcbiAgICAgICAgbWFzcy5wb3NpdGlvblByb3BlcnR5LnNldCggbWFzcy5wb3NpdGlvblByb3BlcnR5LmdldCgpLmNvcHkoKS5zZXRZKCBtb2RlbE1heFkgKSApO1xyXG5cclxuICAgICAgICAvLyBMaW1pdCB0aGUgbGVuZ3RoIG9mIHRoZSBzcHJpbmcgYmFzZWQgb24gdGhlIHNwcmluZyBjb2lscy5cclxuICAgICAgICBtYXNzLnNwcmluZ1Byb3BlcnR5LnZhbHVlLnVwZGF0ZURpc3BsYWNlbWVudCggbW9kZWxNYXhZLCBmYWxzZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXBkYXRlIG1hc3MgcG9zaXRpb24gaWYgdW5hdHRhY2hlZFxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBBdHRlbXB0IHRvIGF0dGFjaC4gQXNzdW1lcyBzcHJpbmdzIGFyZSBmYXIgZW5vdWdoIGFwYXJ0IHdoZXJlIG9uZSBtYXNzIGNhbid0IGF0dGFjaCB0byBtdWx0aXBsZSBzcHJpbmdzLlxyXG4gICAgICB0aGlzLnNwcmluZ3MuZm9yRWFjaCggc3ByaW5nID0+IHtcclxuICAgICAgICBpZiAoIE1hdGguYWJzKCBtYXNzUG9zaXRpb24ueCAtIHNwcmluZy5wb3NpdGlvblByb3BlcnR5LmdldCgpLnggKSA8IEdSQUJCSU5HX0RJU1RBTkNFICYmXHJcbiAgICAgICAgICAgICBNYXRoLmFicyggbWFzc1Bvc2l0aW9uLnkgLSBzcHJpbmcuYm90dG9tUHJvcGVydHkuZ2V0KCkgKSA8IEdSQUJCSU5HX0RJU1RBTkNFICYmXHJcbiAgICAgICAgICAgICBzcHJpbmcubWFzc0F0dGFjaGVkUHJvcGVydHkuZ2V0KCkgPT09IG51bGwgKSB7XHJcbiAgICAgICAgICBzcHJpbmcuc2V0TWFzcyggbWFzcyApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzcG9uc2libGUgZm9yIHN0ZXBwaW5nIHRocm91Z2ggdGhlIG1vZGVsIGF0IGEgc3BlY2lmaWVkIGR0XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0XHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc3RlcEZvcndhcmQoIGR0ICkge1xyXG5cclxuICAgIC8vIHN0ZXBzIHRoZSBub21pbmFsIGFtb3VudCB1c2VkIGJ5IHN0ZXAgZm9yd2FyZCBidXR0b24gbGlzdGVuZXJcclxuICAgIHRoaXMubW9kZWxTdGVwKCBkdCApO1xyXG5cclxuICAgIC8vIFJlc2V0IHRoZSBwZXJpb2QgdHJhY2UgZm9yIGVhY2ggc3ByaW5nLlxyXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9tYXNzZXMtYW5kLXNwcmluZ3MtYmFzaWNzL2lzc3Vlcy81OCNpc3N1ZWNvbW1lbnQtNDYyODYwNDQwXHJcbiAgICB0aGlzLnNwcmluZ3MuZm9yRWFjaCggc3ByaW5nID0+IHtcclxuICAgICAgaWYgKCBzcHJpbmcucGVyaW9kVHJhY2UgJiYgc3ByaW5nLnBlcmlvZFRyYWNlLnN0YXRlUHJvcGVydHkudmFsdWUgPT09IDQgKSB7XHJcbiAgICAgICAgc3ByaW5nLnBlcmlvZFRyYWNlUmVzZXRFbWl0dGVyLmVtaXQoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG4gICAgLy8gSWYgc2ltdWxhdGlvblRpbWVTdGVwID4gMC4zLCBpZ25vcmUgaXQgLSBpdCBwcm9iYWJseSBtZWFucyB0aGUgdXNlciByZXR1cm5lZCB0byB0aGUgdGFiIGFmdGVyXHJcbiAgICAvLyB0aGUgdGFiIG9yIHRoZSBicm93c2VyIHdhcyBoaWRkZW4gZm9yIGEgd2hpbGUuXHJcbiAgICBkdCA9IE1hdGgubWluKCBkdCwgMC4zICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLnBsYXlpbmdQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgdGhpcy5tb2RlbFN0ZXAoIGR0ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGVwcyBpbiBtb2RlbCB0aW1lLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBtb2RlbFN0ZXAoIGR0ICkge1xyXG4gICAgY29uc3QgYW5pbWF0aW9uRHQgPSBkdDtcclxuXHJcbiAgICAvLyBDaGFuZ2UgdGhlIGR0IHZhbHVlIGlmIHdlIGFyZSBwbGF5aW5nIGluIHNsb3cgbW90aW9uLlxyXG4gICAgaWYgKCB0aGlzLnRpbWVTcGVlZFByb3BlcnR5LmdldCgpID09PSBUaW1lU3BlZWQuU0xPVyAmJiB0aGlzLnBsYXlpbmdQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgZHQgPSBkdCAvIE1hc3Nlc0FuZFNwcmluZ3NDb25zdGFudHMuU0xPV19TSU1fRFRfUkFUSU87XHJcbiAgICB9XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm1hc3Nlcy5sZW5ndGg7IGkrKyApIHtcclxuXHJcbiAgICAgIC8vIEZhbGwgaWYgbm90IGh1bmcgb3IgZ3JhYmJlZFxyXG4gICAgICB0aGlzLm1hc3Nlc1sgaSBdLnN0ZXAoXHJcbiAgICAgICAgdGhpcy5ncmF2aXR5UHJvcGVydHkudmFsdWUsXHJcbiAgICAgICAgTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cy5GTE9PUl9ZICsgTWFzc2VzQW5kU3ByaW5nc0NvbnN0YW50cy5TSEVMRl9IRUlHSFQsXHJcbiAgICAgICAgZHQsXHJcbiAgICAgICAgYW5pbWF0aW9uRHRcclxuICAgICAgKTtcclxuICAgIH1cclxuICAgIHRoaXMuc3RvcHdhdGNoLnN0ZXAoIGR0ICk7XHJcblxyXG4gICAgLy8gT3NjaWxsYXRlIHNwcmluZ3NcclxuICAgIHRoaXMuc3ByaW5ncy5mb3JFYWNoKCBzcHJpbmcgPT4ge1xyXG4gICAgICBzcHJpbmcuc3RlcCggZHQgKTtcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbm1hc3Nlc0FuZFNwcmluZ3MucmVnaXN0ZXIoICdNYXNzZXNBbmRTcHJpbmdzTW9kZWwnLCBNYXNzZXNBbmRTcHJpbmdzTW9kZWwgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1hc3Nlc0FuZFNwcmluZ3NNb2RlbDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLDZCQUE2QixNQUFNLHNEQUFzRDtBQUNoRyxPQUFPQyxtQkFBbUIsTUFBTSw0Q0FBNEM7QUFDNUUsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxRQUFRLE1BQU0saUNB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