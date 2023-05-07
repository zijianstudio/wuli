// Copyright 2021-2023, University of Colorado Boulder

/**
 * GreenhouseEffectObservationWindow is a scenery node that presents a view of the ground to the horizon and the sky
 * above.  It is generally used as a base class and additional functionality is added in subclasses.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { AlignBox, Color, FocusableHeadingNode, LinearGradient, ManualConstraint, Node, Rectangle } from '../../../../scenery/js/imports.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import startSunlightChord_mp3 from '../../../sounds/startSunlightChord_mp3.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import GreenhouseEffectStrings from '../../GreenhouseEffectStrings.js';
import GreenhouseEffectConstants from '../GreenhouseEffectConstants.js';
import LayersModel from '../model/LayersModel.js';
import EnergyBalancePanel from './EnergyBalancePanel.js';
import FluxMeterNode from './FluxMeterNode.js';
import InstrumentVisibilityControls from './InstrumentVisibilityControls.js';
import TemperatureSoundGeneratorFiltered from './TemperatureSoundGeneratorFiltered.js';

// constants
const SIZE = new Dimension2(780, 525); // in screen coordinates
const GROUND_VERTICAL_PROPORTION = 0.25; // vertical proportion occupied by the ground, the rest is the sky
const DARKNESS_OPACITY = 0.7;
const EXPECTED_MAX_TEMPERATURE = 309; // in Kelvin

// Standard inset for controls and instruments that exist inside the observation window.
const CONTROL_AND_INSTRUMENT_INSET = 10;
class GreenhouseEffectObservationWindow extends Node {
  // protected so that they can be placed in the pdomOrder in subclasses

  // Observation window UI component visibility controls, public for pdomOrder.

  constructor(model, providedOptions) {
    super();

    // StrictOmit for nested options is required when you don't provide defaults for them, see
    // https://github.com/phetsims/phet-core/issues/128
    const options = optionize()({
      // default position in the GreenhouseEffect sim
      left: GreenhouseEffectConstants.SCREEN_VIEW_X_MARGIN,
      top: GreenhouseEffectConstants.SCREEN_VIEW_Y_MARGIN,
      // phet-io
      tandem: Tandem.REQUIRED
    }, providedOptions);

    // Calculate where we want the ground in the model, which corresponds to y=0, to appear in the view.
    const groundHeight = SIZE.height * GROUND_VERTICAL_PROPORTION / 2;

    // Calculate the aspect ratio of the portion of the observation window that is above the ground.
    const aboveGroundAspectRatio = SIZE.width / (SIZE.height - groundHeight);

    // Check that the aspect ratio of the model will work when mapped into this window.
    assert && assert(Math.abs(aboveGroundAspectRatio - LayersModel.SUNLIGHT_SPAN.width / LayersModel.HEIGHT_OF_ATMOSPHERE) < 0.1, 'the aspect ratio of the observation window doesn\'t match that of the model');

    // Create the model-view transform.  In the models, the ground is a horizontal line at y = 0.  In the view, we give
    // it a bit of perspective, so the ground has some depth.
    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(Vector2.ZERO, new Vector2(SIZE.width / 2, SIZE.height - groundHeight), (SIZE.height - groundHeight) / LayersModel.HEIGHT_OF_ATMOSPHERE);

    // main window frame into which other items will need to fit
    // TODO: 10/13/2021 - I (jbphet) am refactoring the observation window to be in subclasses.  The windowFrame needs
    //                    to be available to subclasses at this moment, but might not eventually, so check this later
    //                    and make it local if possible, or just delete this comment if not.
    this.windowFrame = Rectangle.dimension(SIZE, {
      lineWidth: 0
    });
    this.addChild(this.windowFrame);

    // Clip the root node to stay within the frame.
    this.windowFrame.clipArea = Shape.bounds(this.windowFrame.bounds);

    // The layer that sits in front of the background in the Z-order but behind the controlsLayer.
    this.presentationLayer = new Node();

    //  Background node where items that will generally be behind other nodes (e.g. the ground)
    // should be placed.
    this.backgroundLayer = new Node();

    // top layer in the Z-order
    this.foregroundLayer = new Node();

    // Layers where controls should be added, will be in front of the background.
    this.controlsLayer = new Node();

    // Add the various layer in the order necessary for the desired layering.
    this.windowFrame.addChild(this.backgroundLayer);
    this.windowFrame.addChild(this.presentationLayer);
    this.windowFrame.addChild(this.controlsLayer);
    this.windowFrame.addChild(this.foregroundLayer);
    this.focusableHeadingNode = new FocusableHeadingNode({
      headingLevel: 3,
      innerContent: GreenhouseEffectStrings.a11y.observationWindowLabelStringProperty
    });
    this.foregroundLayer.addChild(this.focusableHeadingNode);

    // Create the node that will represent the sky.
    const skyNode = new Rectangle(0, 0, SIZE.width, SIZE.height, {
      fill: new LinearGradient(0, 0, 0, SIZE.height).addColorStop(0, '#00131A').addColorStop(0.2, '#007399').addColorStop(0.35, '#00ACE6').addColorStop(0.80, '#80DFFF')
    });
    this.backgroundLayer.addChild(skyNode);
    this.backgroundLayer.addChild(this.createGroundNode(model));

    // energy balance
    this.energyBalancePanel = new EnergyBalancePanel(model.energyBalanceVisibleProperty, model.sunEnergySource.outputEnergyRateTracker.energyRateProperty, model.outerSpace.incomingUpwardMovingEnergyRateTracker.energyRateProperty, model.inRadiativeBalanceProperty, model.sunEnergySource.isShiningProperty);
    this.energyBalancePanel.leftTop = this.windowFrame.leftTop.plusXY(GreenhouseEffectObservationWindow.CONTROL_AND_INSTRUMENT_INSET, GreenhouseEffectObservationWindow.CONTROL_AND_INSTRUMENT_INSET);

    // controls for the energy balance indicator and the flux meter, if used in this model
    this.instrumentVisibilityControls = new InstrumentVisibilityControls(model, {
      includeFluxMeterCheckbox: model.fluxMeter !== null,
      tandem: options.tandem.createTandem('instrumentVisibilityControls')
    });
    this.controlsLayer.addChild(this.energyBalancePanel);
    this.controlsLayer.addChild(new AlignBox(this.instrumentVisibilityControls, {
      alignBounds: this.windowFrame.bounds,
      margin: GreenhouseEffectObservationWindow.CONTROL_AND_INSTRUMENT_INSET,
      xAlign: 'right',
      yAlign: 'bottom'
    }));

    // Create a node that will make everything behind it look darkened.  This will be used to make the scene of the
    // ground and sky appear as though it's night, and then will fade away once the sun is shining, allowing the
    // nodes behind it to be seen more clearly.
    const darknessNode = Rectangle.dimension(SIZE, {
      fill: new Color(0, 0, 0, DARKNESS_OPACITY)
    });
    this.foregroundLayer.addChild(darknessNode);

    // {Animation|null} - an animation for fading the darkness out and thus the daylight in
    let fadeToDayAnimation = null;

    // sound generation for sunlight starting
    const sunlightStartingSoundClip = new SoundClip(startSunlightChord_mp3, {
      initialOutputLevel: 0.4
    });
    soundManager.addSoundGenerator(sunlightStartingSoundClip, {
      associatedViewNode: this
    });

    // button used to start and restart sunlight
    this.startSunlightButton = new TextPushButton(GreenhouseEffectStrings.startSunlightStringProperty, {
      font: new PhetFont(18),
      baseColor: PhetColorScheme.BUTTON_YELLOW,
      // keep the size reasonable
      maxTextWidth: 250,
      listener: () => {
        // state checking
        assert && assert(!model.sunEnergySource.isShiningProperty.value, 'it should not be possible to press this button when the sun is already shining');

        // Start the sun shining.
        model.sunEnergySource.isShiningProperty.set(true);

        // Move focus to the top of the observation window - otherwise focus goes to the top of the
        // document when the button disappears, see https://github.com/phetsims/greenhouse-effect/issues/182
        this.focusableHeadingNode.focus();
      },
      // sound generation
      soundPlayer: sunlightStartingSoundClip,
      // pdom
      helpText: GreenhouseEffectStrings.a11y.startSunlightButtonHelpTextStringProperty,
      // phet-io
      tandem: options.tandem.createTandem('startSunlightButton'),
      visiblePropertyOptions: {
        phetioReadOnly: true
      }
    });
    this.foregroundLayer.addChild(this.startSunlightButton);

    // Constrain the button to stay centered in the same position if its bounds change.
    ManualConstraint.create(this, [this.startSunlightButton], startSunlightButtonProxy => {
      // position derived from design doc
      startSunlightButtonProxy.centerX = SIZE.width / 2;
      startSunlightButtonProxy.centerY = SIZE.height * 0.4;
    });

    // Manage the visibility of the start sunlight button and the darkness overlay.
    model.sunEnergySource.isShiningProperty.link(isShining => {
      this.startSunlightButton.visible = !isShining;
      if (isShining) {
        // state checking
        assert && assert(fadeToDayAnimation === null, 'there shouldn\'t be an in-progress animation when starting');

        // If phet-io is setting state, skip the fade in.
        if (phet.joist.sim.isSettingPhetioStateProperty.value) {
          darknessNode.visible = false;
        } else {
          // Fade out the darkness and let the sun shine!
          fadeToDayAnimation = new Animation({
            from: darknessNode.opacity,
            to: 0,
            setValue: opacity => {
              darknessNode.opacity = opacity;
            },
            duration: 2,
            // empirically determined
            easing: Easing.CUBIC_IN_OUT
          });
          fadeToDayAnimation.endedEmitter.addListener(() => {
            fadeToDayAnimation = null;
            darknessNode.visible = false;
          });
          fadeToDayAnimation.start();
        }
      } else {
        if (fadeToDayAnimation) {
          fadeToDayAnimation.stop();
          fadeToDayAnimation = null;
        }
        darknessNode.visible = true;
        darknessNode.opacity = DARKNESS_OPACITY;
      }
    });
    this.mutate(options);

    // Add the flux meter node if it is present in the model.
    if (model.fluxMeter) {
      this.fluxMeterNode = new FluxMeterNode(model.fluxMeter, model.isPlayingProperty, model.fluxMeterVisibleProperty, this.modelViewTransform, this.windowFrame.bounds, combineOptions({
        tandem: options.tandem.createTandem('fluxMeterNode')
      }, options.fluxMeterNodeOptions));
      this.fluxMeterNode.fluxPanel.rightTop = this.windowFrame.rightTop.minusXY(GreenhouseEffectObservationWindow.CONTROL_AND_INSTRUMENT_INSET, -GreenhouseEffectObservationWindow.CONTROL_AND_INSTRUMENT_INSET);

      // set the position of the wire to attach to the flux panel
      model.fluxMeter.wireMeterAttachmentPositionProperty.set(this.modelViewTransform.viewToModelPosition(this.fluxMeterNode.fluxPanel.leftTop.plusXY(0, 50)));
      this.controlsLayer.addChild(this.fluxMeterNode);

      // The flux meter's sensor should be behind the other controls.
      this.fluxMeterNode.moveToBack();
    } else {
      this.fluxMeterNode = null;
    }

    // sound generation

    // Create a derived property that is true when either of the visual surface temperature indicators are enabled.
    const surfaceTemperatureIndicatorEnabledProperty = new DerivedProperty([model.surfaceThermometerVisibleProperty, model.surfaceTemperatureVisibleProperty], (thermometerVisible, temperatureVisible) => thermometerVisible || temperatureVisible);

    // Add the filter-based sound generator for the temperature.
    soundManager.addSoundGenerator(new TemperatureSoundGeneratorFiltered(model.surfaceTemperatureKelvinProperty, model.sunEnergySource.isShiningProperty, new Range(model.groundLayer.minimumTemperature, EXPECTED_MAX_TEMPERATURE), {
      initialOutputLevel: 0.045,
      enableControlProperties: [surfaceTemperatureIndicatorEnabledProperty, model.isPlayingProperty]
    }), {
      associatedViewNode: this
    });
  }
  step(dt) {
    this.energyBalancePanel.step(dt);
    if (this.fluxMeterNode) {
      this.fluxMeterNode.step(dt);
    }
  }

  /**
   * Stub for subclasses to step alerters for Interactive Description.
   */
  stepAlerters(dt) {
    // Does nothing in the base class.
  }
  reset() {
    this.fluxMeterNode?.reset();
  }

  /**
   * Create the visual representation of the ground.  This is quite simple here, and it is meant to be overridden in
   * descendent classes that use more sophisticated representations.
   */
  createGroundNode(model) {
    const topOfGround = this.modelViewTransform.modelToViewY(model.groundLayer.altitude);
    return new Rectangle(0, topOfGround, this.width, this.height - topOfGround, {
      fill: new Color(0, 150, 0)
    });
  }

  /**
   * Create a shape that will be used for the surface temperature glow and potentially for a Node that depicts the
   * ground.  This must match the artwork for the landscapes, and was made to do so manually, and may need to be
   * updated if the artwork changes.
   */
  static createGroundShape() {
    const lowerLeftCorner = Vector2.ZERO;
    const leftSideGroundSurface = new Vector2(0, -SIZE.height * 0.218);
    const controlPoint1 = new Vector2(SIZE.width * 0.52, -SIZE.height * 0.377);
    const rightSideGroundSurface = new Vector2(SIZE.width, -SIZE.height * 0.197);
    const controlPoint2 = new Vector2(SIZE.width * 0.41, -SIZE.height * 0.115);
    const lowerRightCorner = new Vector2(SIZE.width, 0);
    return new Shape().moveToPoint(lowerLeftCorner).lineToPoint(leftSideGroundSurface).cubicCurveToPoint(controlPoint1, controlPoint2, rightSideGroundSurface).lineToPoint(lowerRightCorner).lineToPoint(lowerLeftCorner).close();
  }

  // static values
  static SIZE = SIZE;
  static CONTROL_AND_INSTRUMENT_INSET = CONTROL_AND_INSTRUMENT_INSET;
  static EXPECTED_MAX_TEMPERATURE = EXPECTED_MAX_TEMPERATURE;
}
greenhouseEffect.register('GreenhouseEffectObservationWindow', GreenhouseEffectObservationWindow);
export default GreenhouseEffectObservationWindow;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJEaW1lbnNpb24yIiwiUmFuZ2UiLCJWZWN0b3IyIiwiU2hhcGUiLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIk1vZGVsVmlld1RyYW5zZm9ybTIiLCJQaGV0Q29sb3JTY2hlbWUiLCJQaGV0Rm9udCIsIkFsaWduQm94IiwiQ29sb3IiLCJGb2N1c2FibGVIZWFkaW5nTm9kZSIsIkxpbmVhckdyYWRpZW50IiwiTWFudWFsQ29uc3RyYWludCIsIk5vZGUiLCJSZWN0YW5nbGUiLCJUZXh0UHVzaEJ1dHRvbiIsIlNvdW5kQ2xpcCIsInNvdW5kTWFuYWdlciIsIlRhbmRlbSIsIkFuaW1hdGlvbiIsIkVhc2luZyIsInN0YXJ0U3VubGlnaHRDaG9yZF9tcDMiLCJncmVlbmhvdXNlRWZmZWN0IiwiR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MiLCJHcmVlbmhvdXNlRWZmZWN0Q29uc3RhbnRzIiwiTGF5ZXJzTW9kZWwiLCJFbmVyZ3lCYWxhbmNlUGFuZWwiLCJGbHV4TWV0ZXJOb2RlIiwiSW5zdHJ1bWVudFZpc2liaWxpdHlDb250cm9scyIsIlRlbXBlcmF0dXJlU291bmRHZW5lcmF0b3JGaWx0ZXJlZCIsIlNJWkUiLCJHUk9VTkRfVkVSVElDQUxfUFJPUE9SVElPTiIsIkRBUktORVNTX09QQUNJVFkiLCJFWFBFQ1RFRF9NQVhfVEVNUEVSQVRVUkUiLCJDT05UUk9MX0FORF9JTlNUUlVNRU5UX0lOU0VUIiwiR3JlZW5ob3VzZUVmZmVjdE9ic2VydmF0aW9uV2luZG93IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJsZWZ0IiwiU0NSRUVOX1ZJRVdfWF9NQVJHSU4iLCJ0b3AiLCJTQ1JFRU5fVklFV19ZX01BUkdJTiIsInRhbmRlbSIsIlJFUVVJUkVEIiwiZ3JvdW5kSGVpZ2h0IiwiaGVpZ2h0IiwiYWJvdmVHcm91bmRBc3BlY3RSYXRpbyIsIndpZHRoIiwiYXNzZXJ0IiwiTWF0aCIsImFicyIsIlNVTkxJR0hUX1NQQU4iLCJIRUlHSFRfT0ZfQVRNT1NQSEVSRSIsIm1vZGVsVmlld1RyYW5zZm9ybSIsImNyZWF0ZVNpbmdsZVBvaW50U2NhbGVJbnZlcnRlZFlNYXBwaW5nIiwiWkVSTyIsIndpbmRvd0ZyYW1lIiwiZGltZW5zaW9uIiwibGluZVdpZHRoIiwiYWRkQ2hpbGQiLCJjbGlwQXJlYSIsImJvdW5kcyIsInByZXNlbnRhdGlvbkxheWVyIiwiYmFja2dyb3VuZExheWVyIiwiZm9yZWdyb3VuZExheWVyIiwiY29udHJvbHNMYXllciIsImZvY3VzYWJsZUhlYWRpbmdOb2RlIiwiaGVhZGluZ0xldmVsIiwiaW5uZXJDb250ZW50IiwiYTExeSIsIm9ic2VydmF0aW9uV2luZG93TGFiZWxTdHJpbmdQcm9wZXJ0eSIsInNreU5vZGUiLCJmaWxsIiwiYWRkQ29sb3JTdG9wIiwiY3JlYXRlR3JvdW5kTm9kZSIsImVuZXJneUJhbGFuY2VQYW5lbCIsImVuZXJneUJhbGFuY2VWaXNpYmxlUHJvcGVydHkiLCJzdW5FbmVyZ3lTb3VyY2UiLCJvdXRwdXRFbmVyZ3lSYXRlVHJhY2tlciIsImVuZXJneVJhdGVQcm9wZXJ0eSIsIm91dGVyU3BhY2UiLCJpbmNvbWluZ1Vwd2FyZE1vdmluZ0VuZXJneVJhdGVUcmFja2VyIiwiaW5SYWRpYXRpdmVCYWxhbmNlUHJvcGVydHkiLCJpc1NoaW5pbmdQcm9wZXJ0eSIsImxlZnRUb3AiLCJwbHVzWFkiLCJpbnN0cnVtZW50VmlzaWJpbGl0eUNvbnRyb2xzIiwiaW5jbHVkZUZsdXhNZXRlckNoZWNrYm94IiwiZmx1eE1ldGVyIiwiY3JlYXRlVGFuZGVtIiwiYWxpZ25Cb3VuZHMiLCJtYXJnaW4iLCJ4QWxpZ24iLCJ5QWxpZ24iLCJkYXJrbmVzc05vZGUiLCJmYWRlVG9EYXlBbmltYXRpb24iLCJzdW5saWdodFN0YXJ0aW5nU291bmRDbGlwIiwiaW5pdGlhbE91dHB1dExldmVsIiwiYWRkU291bmRHZW5lcmF0b3IiLCJhc3NvY2lhdGVkVmlld05vZGUiLCJzdGFydFN1bmxpZ2h0QnV0dG9uIiwic3RhcnRTdW5saWdodFN0cmluZ1Byb3BlcnR5IiwiZm9udCIsImJhc2VDb2xvciIsIkJVVFRPTl9ZRUxMT1ciLCJtYXhUZXh0V2lkdGgiLCJsaXN0ZW5lciIsInZhbHVlIiwic2V0IiwiZm9jdXMiLCJzb3VuZFBsYXllciIsImhlbHBUZXh0Iiwic3RhcnRTdW5saWdodEJ1dHRvbkhlbHBUZXh0U3RyaW5nUHJvcGVydHkiLCJ2aXNpYmxlUHJvcGVydHlPcHRpb25zIiwicGhldGlvUmVhZE9ubHkiLCJjcmVhdGUiLCJzdGFydFN1bmxpZ2h0QnV0dG9uUHJveHkiLCJjZW50ZXJYIiwiY2VudGVyWSIsImxpbmsiLCJpc1NoaW5pbmciLCJ2aXNpYmxlIiwicGhldCIsImpvaXN0Iiwic2ltIiwiaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eSIsImZyb20iLCJvcGFjaXR5IiwidG8iLCJzZXRWYWx1ZSIsImR1cmF0aW9uIiwiZWFzaW5nIiwiQ1VCSUNfSU5fT1VUIiwiZW5kZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJzdGFydCIsInN0b3AiLCJtdXRhdGUiLCJmbHV4TWV0ZXJOb2RlIiwiaXNQbGF5aW5nUHJvcGVydHkiLCJmbHV4TWV0ZXJWaXNpYmxlUHJvcGVydHkiLCJmbHV4TWV0ZXJOb2RlT3B0aW9ucyIsImZsdXhQYW5lbCIsInJpZ2h0VG9wIiwibWludXNYWSIsIndpcmVNZXRlckF0dGFjaG1lbnRQb3NpdGlvblByb3BlcnR5Iiwidmlld1RvTW9kZWxQb3NpdGlvbiIsIm1vdmVUb0JhY2siLCJzdXJmYWNlVGVtcGVyYXR1cmVJbmRpY2F0b3JFbmFibGVkUHJvcGVydHkiLCJzdXJmYWNlVGhlcm1vbWV0ZXJWaXNpYmxlUHJvcGVydHkiLCJzdXJmYWNlVGVtcGVyYXR1cmVWaXNpYmxlUHJvcGVydHkiLCJ0aGVybW9tZXRlclZpc2libGUiLCJ0ZW1wZXJhdHVyZVZpc2libGUiLCJzdXJmYWNlVGVtcGVyYXR1cmVLZWx2aW5Qcm9wZXJ0eSIsImdyb3VuZExheWVyIiwibWluaW11bVRlbXBlcmF0dXJlIiwiZW5hYmxlQ29udHJvbFByb3BlcnRpZXMiLCJzdGVwIiwiZHQiLCJzdGVwQWxlcnRlcnMiLCJyZXNldCIsInRvcE9mR3JvdW5kIiwibW9kZWxUb1ZpZXdZIiwiYWx0aXR1ZGUiLCJjcmVhdGVHcm91bmRTaGFwZSIsImxvd2VyTGVmdENvcm5lciIsImxlZnRTaWRlR3JvdW5kU3VyZmFjZSIsImNvbnRyb2xQb2ludDEiLCJyaWdodFNpZGVHcm91bmRTdXJmYWNlIiwiY29udHJvbFBvaW50MiIsImxvd2VyUmlnaHRDb3JuZXIiLCJtb3ZlVG9Qb2ludCIsImxpbmVUb1BvaW50IiwiY3ViaWNDdXJ2ZVRvUG9pbnQiLCJjbG9zZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiR3JlZW5ob3VzZUVmZmVjdE9ic2VydmF0aW9uV2luZG93LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEdyZWVuaG91c2VFZmZlY3RPYnNlcnZhdGlvbldpbmRvdyBpcyBhIHNjZW5lcnkgbm9kZSB0aGF0IHByZXNlbnRzIGEgdmlldyBvZiB0aGUgZ3JvdW5kIHRvIHRoZSBob3Jpem9uIGFuZCB0aGUgc2t5XHJcbiAqIGFib3ZlLiAgSXQgaXMgZ2VuZXJhbGx5IHVzZWQgYXMgYSBiYXNlIGNsYXNzIGFuZCBhZGRpdGlvbmFsIGZ1bmN0aW9uYWxpdHkgaXMgYWRkZWQgaW4gc3ViY2xhc3Nlcy5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCBQaGV0Q29sb3JTY2hlbWUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRDb2xvclNjaGVtZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBBbGlnbkJveCwgQ29sb3IsIEZvY3VzYWJsZUhlYWRpbmdOb2RlLCBMaW5lYXJHcmFkaWVudCwgTWFudWFsQ29uc3RyYWludCwgTm9kZSwgTm9kZU9wdGlvbnMsIFJlY3RhbmdsZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUZXh0UHVzaEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9UZXh0UHVzaEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBTb3VuZENsaXAgZnJvbSAnLi4vLi4vLi4vLi4vdGFtYm8vanMvc291bmQtZ2VuZXJhdG9ycy9Tb3VuZENsaXAuanMnO1xyXG5pbXBvcnQgc291bmRNYW5hZ2VyIGZyb20gJy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kTWFuYWdlci5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBBbmltYXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vdHdpeHQvanMvQW5pbWF0aW9uLmpzJztcclxuaW1wb3J0IEVhc2luZyBmcm9tICcuLi8uLi8uLi8uLi90d2l4dC9qcy9FYXNpbmcuanMnO1xyXG5pbXBvcnQgc3RhcnRTdW5saWdodENob3JkX21wMyBmcm9tICcuLi8uLi8uLi9zb3VuZHMvc3RhcnRTdW5saWdodENob3JkX21wMy5qcyc7XHJcbmltcG9ydCBncmVlbmhvdXNlRWZmZWN0IGZyb20gJy4uLy4uL2dyZWVuaG91c2VFZmZlY3QuanMnO1xyXG5pbXBvcnQgR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MgZnJvbSAnLi4vLi4vR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuanMnO1xyXG5pbXBvcnQgR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cyBmcm9tICcuLi9HcmVlbmhvdXNlRWZmZWN0Q29uc3RhbnRzLmpzJztcclxuaW1wb3J0IExheWVyc01vZGVsIGZyb20gJy4uL21vZGVsL0xheWVyc01vZGVsLmpzJztcclxuaW1wb3J0IEVuZXJneUJhbGFuY2VQYW5lbCBmcm9tICcuL0VuZXJneUJhbGFuY2VQYW5lbC5qcyc7XHJcbmltcG9ydCBGbHV4TWV0ZXJOb2RlLCB7IEZsdXhNZXRlck5vZGVPcHRpb25zIH0gZnJvbSAnLi9GbHV4TWV0ZXJOb2RlLmpzJztcclxuaW1wb3J0IEluc3RydW1lbnRWaXNpYmlsaXR5Q29udHJvbHMgZnJvbSAnLi9JbnN0cnVtZW50VmlzaWJpbGl0eUNvbnRyb2xzLmpzJztcclxuaW1wb3J0IFRlbXBlcmF0dXJlU291bmRHZW5lcmF0b3JGaWx0ZXJlZCBmcm9tICcuL1RlbXBlcmF0dXJlU291bmRHZW5lcmF0b3JGaWx0ZXJlZC5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgU0laRSA9IG5ldyBEaW1lbnNpb24yKCA3ODAsIDUyNSApOyAvLyBpbiBzY3JlZW4gY29vcmRpbmF0ZXNcclxuY29uc3QgR1JPVU5EX1ZFUlRJQ0FMX1BST1BPUlRJT04gPSAwLjI1OyAvLyB2ZXJ0aWNhbCBwcm9wb3J0aW9uIG9jY3VwaWVkIGJ5IHRoZSBncm91bmQsIHRoZSByZXN0IGlzIHRoZSBza3lcclxuY29uc3QgREFSS05FU1NfT1BBQ0lUWSA9IDAuNztcclxuY29uc3QgRVhQRUNURURfTUFYX1RFTVBFUkFUVVJFID0gMzA5OyAvLyBpbiBLZWx2aW5cclxuXHJcbi8vIFN0YW5kYXJkIGluc2V0IGZvciBjb250cm9scyBhbmQgaW5zdHJ1bWVudHMgdGhhdCBleGlzdCBpbnNpZGUgdGhlIG9ic2VydmF0aW9uIHdpbmRvdy5cclxuY29uc3QgQ09OVFJPTF9BTkRfSU5TVFJVTUVOVF9JTlNFVCA9IDEwO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuXHJcbiAgLy8gUGFzc2VkIHRvIHRoZSBGbHV4TWV0ZXJOb2RlLCBidXQgdGhlIHRhbmRlbSBmb3IgdGhlIEZsdXhNZXRlck5vZGUgaXMgYWRkZWQgYnkgdGhpcyBjb21wb25lbnQuXHJcbiAgZmx1eE1ldGVyTm9kZU9wdGlvbnM/OiBTdHJpY3RPbWl0PEZsdXhNZXRlck5vZGVPcHRpb25zLCAndGFuZGVtJz47XHJcbn07XHJcbmV4cG9ydCB0eXBlIEdyZWVuaG91c2VFZmZlY3RPYnNlcnZhdGlvbldpbmRvd09wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIE5vZGVPcHRpb25zO1xyXG5cclxuY2xhc3MgR3JlZW5ob3VzZUVmZmVjdE9ic2VydmF0aW9uV2luZG93IGV4dGVuZHMgTm9kZSB7XHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IG1vZGVsVmlld1RyYW5zZm9ybTogTW9kZWxWaWV3VHJhbnNmb3JtMjtcclxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgd2luZG93RnJhbWU6IFJlY3RhbmdsZTtcclxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgcHJlc2VudGF0aW9uTGF5ZXI6IE5vZGU7XHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGJhY2tncm91bmRMYXllcjogTm9kZTtcclxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZm9yZWdyb3VuZExheWVyOiBOb2RlO1xyXG4gIHByb3RlY3RlZCByZWFkb25seSBjb250cm9sc0xheWVyOiBOb2RlO1xyXG4gIHB1YmxpYyByZWFkb25seSBmbHV4TWV0ZXJOb2RlOiBGbHV4TWV0ZXJOb2RlIHwgbnVsbDtcclxuXHJcbiAgLy8gcHJvdGVjdGVkIHNvIHRoYXQgdGhleSBjYW4gYmUgcGxhY2VkIGluIHRoZSBwZG9tT3JkZXIgaW4gc3ViY2xhc3Nlc1xyXG4gIHByb3RlY3RlZCByZWFkb25seSBzdGFydFN1bmxpZ2h0QnV0dG9uOiBUZXh0UHVzaEJ1dHRvbjtcclxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZm9jdXNhYmxlSGVhZGluZ05vZGU6IEZvY3VzYWJsZUhlYWRpbmdOb2RlO1xyXG4gIHByb3RlY3RlZCByZWFkb25seSBlbmVyZ3lCYWxhbmNlUGFuZWw6IEVuZXJneUJhbGFuY2VQYW5lbDtcclxuXHJcbiAgLy8gT2JzZXJ2YXRpb24gd2luZG93IFVJIGNvbXBvbmVudCB2aXNpYmlsaXR5IGNvbnRyb2xzLCBwdWJsaWMgZm9yIHBkb21PcmRlci5cclxuICBwdWJsaWMgcmVhZG9ubHkgaW5zdHJ1bWVudFZpc2liaWxpdHlDb250cm9sczogSW5zdHJ1bWVudFZpc2liaWxpdHlDb250cm9scztcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbDogTGF5ZXJzTW9kZWwsIHByb3ZpZGVkT3B0aW9ucz86IEdyZWVuaG91c2VFZmZlY3RPYnNlcnZhdGlvbldpbmRvd09wdGlvbnMgKSB7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBTdHJpY3RPbWl0IGZvciBuZXN0ZWQgb3B0aW9ucyBpcyByZXF1aXJlZCB3aGVuIHlvdSBkb24ndCBwcm92aWRlIGRlZmF1bHRzIGZvciB0aGVtLCBzZWVcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWNvcmUvaXNzdWVzLzEyOFxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxHcmVlbmhvdXNlRWZmZWN0T2JzZXJ2YXRpb25XaW5kb3dPcHRpb25zLCBTdHJpY3RPbWl0PFNlbGZPcHRpb25zLCAnZmx1eE1ldGVyTm9kZU9wdGlvbnMnPiwgTm9kZU9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIGRlZmF1bHQgcG9zaXRpb24gaW4gdGhlIEdyZWVuaG91c2VFZmZlY3Qgc2ltXHJcbiAgICAgIGxlZnQ6IEdyZWVuaG91c2VFZmZlY3RDb25zdGFudHMuU0NSRUVOX1ZJRVdfWF9NQVJHSU4sXHJcbiAgICAgIHRvcDogR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cy5TQ1JFRU5fVklFV19ZX01BUkdJTixcclxuXHJcbiAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRURcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIENhbGN1bGF0ZSB3aGVyZSB3ZSB3YW50IHRoZSBncm91bmQgaW4gdGhlIG1vZGVsLCB3aGljaCBjb3JyZXNwb25kcyB0byB5PTAsIHRvIGFwcGVhciBpbiB0aGUgdmlldy5cclxuICAgIGNvbnN0IGdyb3VuZEhlaWdodCA9IFNJWkUuaGVpZ2h0ICogR1JPVU5EX1ZFUlRJQ0FMX1BST1BPUlRJT04gLyAyO1xyXG5cclxuICAgIC8vIENhbGN1bGF0ZSB0aGUgYXNwZWN0IHJhdGlvIG9mIHRoZSBwb3J0aW9uIG9mIHRoZSBvYnNlcnZhdGlvbiB3aW5kb3cgdGhhdCBpcyBhYm92ZSB0aGUgZ3JvdW5kLlxyXG4gICAgY29uc3QgYWJvdmVHcm91bmRBc3BlY3RSYXRpbyA9IFNJWkUud2lkdGggLyAoIFNJWkUuaGVpZ2h0IC0gZ3JvdW5kSGVpZ2h0ICk7XHJcblxyXG4gICAgLy8gQ2hlY2sgdGhhdCB0aGUgYXNwZWN0IHJhdGlvIG9mIHRoZSBtb2RlbCB3aWxsIHdvcmsgd2hlbiBtYXBwZWQgaW50byB0aGlzIHdpbmRvdy5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICAgIE1hdGguYWJzKCBhYm92ZUdyb3VuZEFzcGVjdFJhdGlvIC0gKCBMYXllcnNNb2RlbC5TVU5MSUdIVF9TUEFOLndpZHRoIC8gTGF5ZXJzTW9kZWwuSEVJR0hUX09GX0FUTU9TUEhFUkUgKSApIDwgMC4xLFxyXG4gICAgICAndGhlIGFzcGVjdCByYXRpbyBvZiB0aGUgb2JzZXJ2YXRpb24gd2luZG93IGRvZXNuXFwndCBtYXRjaCB0aGF0IG9mIHRoZSBtb2RlbCdcclxuICAgICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBtb2RlbC12aWV3IHRyYW5zZm9ybS4gIEluIHRoZSBtb2RlbHMsIHRoZSBncm91bmQgaXMgYSBob3Jpem9udGFsIGxpbmUgYXQgeSA9IDAuICBJbiB0aGUgdmlldywgd2UgZ2l2ZVxyXG4gICAgLy8gaXQgYSBiaXQgb2YgcGVyc3BlY3RpdmUsIHNvIHRoZSBncm91bmQgaGFzIHNvbWUgZGVwdGguXHJcbiAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSA9IE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlU2luZ2xlUG9pbnRTY2FsZUludmVydGVkWU1hcHBpbmcoXHJcbiAgICAgIFZlY3RvcjIuWkVSTyxcclxuICAgICAgbmV3IFZlY3RvcjIoIFNJWkUud2lkdGggLyAyLCBTSVpFLmhlaWdodCAtIGdyb3VuZEhlaWdodCApLFxyXG4gICAgICAoIFNJWkUuaGVpZ2h0IC0gZ3JvdW5kSGVpZ2h0ICkgLyBMYXllcnNNb2RlbC5IRUlHSFRfT0ZfQVRNT1NQSEVSRVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBtYWluIHdpbmRvdyBmcmFtZSBpbnRvIHdoaWNoIG90aGVyIGl0ZW1zIHdpbGwgbmVlZCB0byBmaXRcclxuICAgIC8vIFRPRE86IDEwLzEzLzIwMjEgLSBJIChqYnBoZXQpIGFtIHJlZmFjdG9yaW5nIHRoZSBvYnNlcnZhdGlvbiB3aW5kb3cgdG8gYmUgaW4gc3ViY2xhc3Nlcy4gIFRoZSB3aW5kb3dGcmFtZSBuZWVkc1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgIHRvIGJlIGF2YWlsYWJsZSB0byBzdWJjbGFzc2VzIGF0IHRoaXMgbW9tZW50LCBidXQgbWlnaHQgbm90IGV2ZW50dWFsbHksIHNvIGNoZWNrIHRoaXMgbGF0ZXJcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICBhbmQgbWFrZSBpdCBsb2NhbCBpZiBwb3NzaWJsZSwgb3IganVzdCBkZWxldGUgdGhpcyBjb21tZW50IGlmIG5vdC5cclxuICAgIHRoaXMud2luZG93RnJhbWUgPSBSZWN0YW5nbGUuZGltZW5zaW9uKCBTSVpFLCB7IGxpbmVXaWR0aDogMCB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLndpbmRvd0ZyYW1lICk7XHJcblxyXG4gICAgLy8gQ2xpcCB0aGUgcm9vdCBub2RlIHRvIHN0YXkgd2l0aGluIHRoZSBmcmFtZS5cclxuICAgIHRoaXMud2luZG93RnJhbWUuY2xpcEFyZWEgPSBTaGFwZS5ib3VuZHMoIHRoaXMud2luZG93RnJhbWUuYm91bmRzICk7XHJcblxyXG4gICAgLy8gVGhlIGxheWVyIHRoYXQgc2l0cyBpbiBmcm9udCBvZiB0aGUgYmFja2dyb3VuZCBpbiB0aGUgWi1vcmRlciBidXQgYmVoaW5kIHRoZSBjb250cm9sc0xheWVyLlxyXG4gICAgdGhpcy5wcmVzZW50YXRpb25MYXllciA9IG5ldyBOb2RlKCk7XHJcblxyXG4gICAgLy8gIEJhY2tncm91bmQgbm9kZSB3aGVyZSBpdGVtcyB0aGF0IHdpbGwgZ2VuZXJhbGx5IGJlIGJlaGluZCBvdGhlciBub2RlcyAoZS5nLiB0aGUgZ3JvdW5kKVxyXG4gICAgLy8gc2hvdWxkIGJlIHBsYWNlZC5cclxuICAgIHRoaXMuYmFja2dyb3VuZExheWVyID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgICAvLyB0b3AgbGF5ZXIgaW4gdGhlIFotb3JkZXJcclxuICAgIHRoaXMuZm9yZWdyb3VuZExheWVyID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgICAvLyBMYXllcnMgd2hlcmUgY29udHJvbHMgc2hvdWxkIGJlIGFkZGVkLCB3aWxsIGJlIGluIGZyb250IG9mIHRoZSBiYWNrZ3JvdW5kLlxyXG4gICAgdGhpcy5jb250cm9sc0xheWVyID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIHZhcmlvdXMgbGF5ZXIgaW4gdGhlIG9yZGVyIG5lY2Vzc2FyeSBmb3IgdGhlIGRlc2lyZWQgbGF5ZXJpbmcuXHJcbiAgICB0aGlzLndpbmRvd0ZyYW1lLmFkZENoaWxkKCB0aGlzLmJhY2tncm91bmRMYXllciApO1xyXG4gICAgdGhpcy53aW5kb3dGcmFtZS5hZGRDaGlsZCggdGhpcy5wcmVzZW50YXRpb25MYXllciApO1xyXG4gICAgdGhpcy53aW5kb3dGcmFtZS5hZGRDaGlsZCggdGhpcy5jb250cm9sc0xheWVyICk7XHJcbiAgICB0aGlzLndpbmRvd0ZyYW1lLmFkZENoaWxkKCB0aGlzLmZvcmVncm91bmRMYXllciApO1xyXG5cclxuICAgIHRoaXMuZm9jdXNhYmxlSGVhZGluZ05vZGUgPSBuZXcgRm9jdXNhYmxlSGVhZGluZ05vZGUoIHtcclxuICAgICAgaGVhZGluZ0xldmVsOiAzLFxyXG4gICAgICBpbm5lckNvbnRlbnQ6IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkub2JzZXJ2YXRpb25XaW5kb3dMYWJlbFN0cmluZ1Byb3BlcnR5XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmZvcmVncm91bmRMYXllci5hZGRDaGlsZCggdGhpcy5mb2N1c2FibGVIZWFkaW5nTm9kZSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgbm9kZSB0aGF0IHdpbGwgcmVwcmVzZW50IHRoZSBza3kuXHJcbiAgICBjb25zdCBza3lOb2RlID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgU0laRS53aWR0aCwgU0laRS5oZWlnaHQsIHtcclxuICAgICAgZmlsbDogbmV3IExpbmVhckdyYWRpZW50KCAwLCAwLCAwLCBTSVpFLmhlaWdodCApXHJcbiAgICAgICAgLmFkZENvbG9yU3RvcCggMCwgJyMwMDEzMUEnIClcclxuICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLjIsICcjMDA3Mzk5JyApXHJcbiAgICAgICAgLmFkZENvbG9yU3RvcCggMC4zNSwgJyMwMEFDRTYnIClcclxuICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLjgwLCAnIzgwREZGRicgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5iYWNrZ3JvdW5kTGF5ZXIuYWRkQ2hpbGQoIHNreU5vZGUgKTtcclxuXHJcbiAgICB0aGlzLmJhY2tncm91bmRMYXllci5hZGRDaGlsZCggdGhpcy5jcmVhdGVHcm91bmROb2RlKCBtb2RlbCApICk7XHJcblxyXG4gICAgLy8gZW5lcmd5IGJhbGFuY2VcclxuICAgIHRoaXMuZW5lcmd5QmFsYW5jZVBhbmVsID0gbmV3IEVuZXJneUJhbGFuY2VQYW5lbChcclxuICAgICAgbW9kZWwuZW5lcmd5QmFsYW5jZVZpc2libGVQcm9wZXJ0eSxcclxuICAgICAgbW9kZWwuc3VuRW5lcmd5U291cmNlLm91dHB1dEVuZXJneVJhdGVUcmFja2VyLmVuZXJneVJhdGVQcm9wZXJ0eSxcclxuICAgICAgbW9kZWwub3V0ZXJTcGFjZS5pbmNvbWluZ1Vwd2FyZE1vdmluZ0VuZXJneVJhdGVUcmFja2VyLmVuZXJneVJhdGVQcm9wZXJ0eSxcclxuICAgICAgbW9kZWwuaW5SYWRpYXRpdmVCYWxhbmNlUHJvcGVydHksXHJcbiAgICAgIG1vZGVsLnN1bkVuZXJneVNvdXJjZS5pc1NoaW5pbmdQcm9wZXJ0eVxyXG4gICAgKTtcclxuICAgIHRoaXMuZW5lcmd5QmFsYW5jZVBhbmVsLmxlZnRUb3AgPSB0aGlzLndpbmRvd0ZyYW1lLmxlZnRUb3AucGx1c1hZKFxyXG4gICAgICBHcmVlbmhvdXNlRWZmZWN0T2JzZXJ2YXRpb25XaW5kb3cuQ09OVFJPTF9BTkRfSU5TVFJVTUVOVF9JTlNFVCxcclxuICAgICAgR3JlZW5ob3VzZUVmZmVjdE9ic2VydmF0aW9uV2luZG93LkNPTlRST0xfQU5EX0lOU1RSVU1FTlRfSU5TRVRcclxuICAgICk7XHJcblxyXG4gICAgLy8gY29udHJvbHMgZm9yIHRoZSBlbmVyZ3kgYmFsYW5jZSBpbmRpY2F0b3IgYW5kIHRoZSBmbHV4IG1ldGVyLCBpZiB1c2VkIGluIHRoaXMgbW9kZWxcclxuICAgIHRoaXMuaW5zdHJ1bWVudFZpc2liaWxpdHlDb250cm9scyA9IG5ldyBJbnN0cnVtZW50VmlzaWJpbGl0eUNvbnRyb2xzKCBtb2RlbCwge1xyXG4gICAgICBpbmNsdWRlRmx1eE1ldGVyQ2hlY2tib3g6IG1vZGVsLmZsdXhNZXRlciAhPT0gbnVsbCxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdpbnN0cnVtZW50VmlzaWJpbGl0eUNvbnRyb2xzJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5jb250cm9sc0xheWVyLmFkZENoaWxkKCB0aGlzLmVuZXJneUJhbGFuY2VQYW5lbCApO1xyXG4gICAgdGhpcy5jb250cm9sc0xheWVyLmFkZENoaWxkKCBuZXcgQWxpZ25Cb3goIHRoaXMuaW5zdHJ1bWVudFZpc2liaWxpdHlDb250cm9scywge1xyXG4gICAgICBhbGlnbkJvdW5kczogdGhpcy53aW5kb3dGcmFtZS5ib3VuZHMsXHJcbiAgICAgIG1hcmdpbjogR3JlZW5ob3VzZUVmZmVjdE9ic2VydmF0aW9uV2luZG93LkNPTlRST0xfQU5EX0lOU1RSVU1FTlRfSU5TRVQsXHJcbiAgICAgIHhBbGlnbjogJ3JpZ2h0JyxcclxuICAgICAgeUFsaWduOiAnYm90dG9tJ1xyXG4gICAgfSApICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgbm9kZSB0aGF0IHdpbGwgbWFrZSBldmVyeXRoaW5nIGJlaGluZCBpdCBsb29rIGRhcmtlbmVkLiAgVGhpcyB3aWxsIGJlIHVzZWQgdG8gbWFrZSB0aGUgc2NlbmUgb2YgdGhlXHJcbiAgICAvLyBncm91bmQgYW5kIHNreSBhcHBlYXIgYXMgdGhvdWdoIGl0J3MgbmlnaHQsIGFuZCB0aGVuIHdpbGwgZmFkZSBhd2F5IG9uY2UgdGhlIHN1biBpcyBzaGluaW5nLCBhbGxvd2luZyB0aGVcclxuICAgIC8vIG5vZGVzIGJlaGluZCBpdCB0byBiZSBzZWVuIG1vcmUgY2xlYXJseS5cclxuICAgIGNvbnN0IGRhcmtuZXNzTm9kZSA9IFJlY3RhbmdsZS5kaW1lbnNpb24oIFNJWkUsIHtcclxuICAgICAgZmlsbDogbmV3IENvbG9yKCAwLCAwLCAwLCBEQVJLTkVTU19PUEFDSVRZIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuZm9yZWdyb3VuZExheWVyLmFkZENoaWxkKCBkYXJrbmVzc05vZGUgKTtcclxuXHJcbiAgICAvLyB7QW5pbWF0aW9ufG51bGx9IC0gYW4gYW5pbWF0aW9uIGZvciBmYWRpbmcgdGhlIGRhcmtuZXNzIG91dCBhbmQgdGh1cyB0aGUgZGF5bGlnaHQgaW5cclxuICAgIGxldCBmYWRlVG9EYXlBbmltYXRpb246IEFuaW1hdGlvbiB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIC8vIHNvdW5kIGdlbmVyYXRpb24gZm9yIHN1bmxpZ2h0IHN0YXJ0aW5nXHJcbiAgICBjb25zdCBzdW5saWdodFN0YXJ0aW5nU291bmRDbGlwID0gbmV3IFNvdW5kQ2xpcCggc3RhcnRTdW5saWdodENob3JkX21wMywge1xyXG4gICAgICBpbml0aWFsT3V0cHV0TGV2ZWw6IDAuNFxyXG4gICAgfSApO1xyXG4gICAgc291bmRNYW5hZ2VyLmFkZFNvdW5kR2VuZXJhdG9yKCBzdW5saWdodFN0YXJ0aW5nU291bmRDbGlwLCB7IGFzc29jaWF0ZWRWaWV3Tm9kZTogdGhpcyB9ICk7XHJcblxyXG4gICAgLy8gYnV0dG9uIHVzZWQgdG8gc3RhcnQgYW5kIHJlc3RhcnQgc3VubGlnaHRcclxuICAgIHRoaXMuc3RhcnRTdW5saWdodEJ1dHRvbiA9IG5ldyBUZXh0UHVzaEJ1dHRvbiggR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3Muc3RhcnRTdW5saWdodFN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTggKSxcclxuICAgICAgYmFzZUNvbG9yOiBQaGV0Q29sb3JTY2hlbWUuQlVUVE9OX1lFTExPVyxcclxuXHJcbiAgICAgIC8vIGtlZXAgdGhlIHNpemUgcmVhc29uYWJsZVxyXG4gICAgICBtYXhUZXh0V2lkdGg6IDI1MCxcclxuXHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIHN0YXRlIGNoZWNraW5nXHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydChcclxuICAgICAgICAgICFtb2RlbC5zdW5FbmVyZ3lTb3VyY2UuaXNTaGluaW5nUHJvcGVydHkudmFsdWUsXHJcbiAgICAgICAgICAnaXQgc2hvdWxkIG5vdCBiZSBwb3NzaWJsZSB0byBwcmVzcyB0aGlzIGJ1dHRvbiB3aGVuIHRoZSBzdW4gaXMgYWxyZWFkeSBzaGluaW5nJ1xyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vIFN0YXJ0IHRoZSBzdW4gc2hpbmluZy5cclxuICAgICAgICBtb2RlbC5zdW5FbmVyZ3lTb3VyY2UuaXNTaGluaW5nUHJvcGVydHkuc2V0KCB0cnVlICk7XHJcblxyXG4gICAgICAgIC8vIE1vdmUgZm9jdXMgdG8gdGhlIHRvcCBvZiB0aGUgb2JzZXJ2YXRpb24gd2luZG93IC0gb3RoZXJ3aXNlIGZvY3VzIGdvZXMgdG8gdGhlIHRvcCBvZiB0aGVcclxuICAgICAgICAvLyBkb2N1bWVudCB3aGVuIHRoZSBidXR0b24gZGlzYXBwZWFycywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9ncmVlbmhvdXNlLWVmZmVjdC9pc3N1ZXMvMTgyXHJcbiAgICAgICAgdGhpcy5mb2N1c2FibGVIZWFkaW5nTm9kZS5mb2N1cygpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gc291bmQgZ2VuZXJhdGlvblxyXG4gICAgICBzb3VuZFBsYXllcjogc3VubGlnaHRTdGFydGluZ1NvdW5kQ2xpcCxcclxuXHJcbiAgICAgIC8vIHBkb21cclxuICAgICAgaGVscFRleHQ6IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkuc3RhcnRTdW5saWdodEJ1dHRvbkhlbHBUZXh0U3RyaW5nUHJvcGVydHksXHJcblxyXG4gICAgICAvLyBwaGV0LWlvXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3RhcnRTdW5saWdodEJ1dHRvbicgKSxcclxuICAgICAgdmlzaWJsZVByb3BlcnR5T3B0aW9uczogeyBwaGV0aW9SZWFkT25seTogdHJ1ZSB9XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmZvcmVncm91bmRMYXllci5hZGRDaGlsZCggdGhpcy5zdGFydFN1bmxpZ2h0QnV0dG9uICk7XHJcblxyXG4gICAgLy8gQ29uc3RyYWluIHRoZSBidXR0b24gdG8gc3RheSBjZW50ZXJlZCBpbiB0aGUgc2FtZSBwb3NpdGlvbiBpZiBpdHMgYm91bmRzIGNoYW5nZS5cclxuICAgIE1hbnVhbENvbnN0cmFpbnQuY3JlYXRlKCB0aGlzLCBbIHRoaXMuc3RhcnRTdW5saWdodEJ1dHRvbiBdLCBzdGFydFN1bmxpZ2h0QnV0dG9uUHJveHkgPT4ge1xyXG5cclxuICAgICAgLy8gcG9zaXRpb24gZGVyaXZlZCBmcm9tIGRlc2lnbiBkb2NcclxuICAgICAgc3RhcnRTdW5saWdodEJ1dHRvblByb3h5LmNlbnRlclggPSBTSVpFLndpZHRoIC8gMjtcclxuICAgICAgc3RhcnRTdW5saWdodEJ1dHRvblByb3h5LmNlbnRlclkgPSBTSVpFLmhlaWdodCAqIDAuNDtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBNYW5hZ2UgdGhlIHZpc2liaWxpdHkgb2YgdGhlIHN0YXJ0IHN1bmxpZ2h0IGJ1dHRvbiBhbmQgdGhlIGRhcmtuZXNzIG92ZXJsYXkuXHJcbiAgICBtb2RlbC5zdW5FbmVyZ3lTb3VyY2UuaXNTaGluaW5nUHJvcGVydHkubGluayggaXNTaGluaW5nID0+IHtcclxuICAgICAgdGhpcy5zdGFydFN1bmxpZ2h0QnV0dG9uLnZpc2libGUgPSAhaXNTaGluaW5nO1xyXG5cclxuICAgICAgaWYgKCBpc1NoaW5pbmcgKSB7XHJcblxyXG4gICAgICAgIC8vIHN0YXRlIGNoZWNraW5nXHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZmFkZVRvRGF5QW5pbWF0aW9uID09PSBudWxsLCAndGhlcmUgc2hvdWxkblxcJ3QgYmUgYW4gaW4tcHJvZ3Jlc3MgYW5pbWF0aW9uIHdoZW4gc3RhcnRpbmcnICk7XHJcblxyXG4gICAgICAgIC8vIElmIHBoZXQtaW8gaXMgc2V0dGluZyBzdGF0ZSwgc2tpcCB0aGUgZmFkZSBpbi5cclxuICAgICAgICBpZiAoIHBoZXQuam9pc3Quc2ltLmlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgICBkYXJrbmVzc05vZGUudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyBGYWRlIG91dCB0aGUgZGFya25lc3MgYW5kIGxldCB0aGUgc3VuIHNoaW5lIVxyXG4gICAgICAgICAgZmFkZVRvRGF5QW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbigge1xyXG4gICAgICAgICAgICBmcm9tOiBkYXJrbmVzc05vZGUub3BhY2l0eSxcclxuICAgICAgICAgICAgdG86IDAsXHJcbiAgICAgICAgICAgIHNldFZhbHVlOiAoIG9wYWNpdHk6IG51bWJlciApID0+IHsgZGFya25lc3NOb2RlLm9wYWNpdHkgPSBvcGFjaXR5OyB9LFxyXG4gICAgICAgICAgICBkdXJhdGlvbjogMiwgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG4gICAgICAgICAgICBlYXNpbmc6IEVhc2luZy5DVUJJQ19JTl9PVVRcclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICAgIGZhZGVUb0RheUFuaW1hdGlvbi5lbmRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgICAgICAgZmFkZVRvRGF5QW5pbWF0aW9uID0gbnVsbDtcclxuICAgICAgICAgICAgZGFya25lc3NOb2RlLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICAgIGZhZGVUb0RheUFuaW1hdGlvbi5zdGFydCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBpZiAoIGZhZGVUb0RheUFuaW1hdGlvbiApIHtcclxuICAgICAgICAgIGZhZGVUb0RheUFuaW1hdGlvbi5zdG9wKCk7XHJcbiAgICAgICAgICBmYWRlVG9EYXlBbmltYXRpb24gPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkYXJrbmVzc05vZGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgZGFya25lc3NOb2RlLm9wYWNpdHkgPSBEQVJLTkVTU19PUEFDSVRZO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIGZsdXggbWV0ZXIgbm9kZSBpZiBpdCBpcyBwcmVzZW50IGluIHRoZSBtb2RlbC5cclxuICAgIGlmICggbW9kZWwuZmx1eE1ldGVyICkge1xyXG5cclxuICAgICAgdGhpcy5mbHV4TWV0ZXJOb2RlID0gbmV3IEZsdXhNZXRlck5vZGUoXHJcbiAgICAgICAgbW9kZWwuZmx1eE1ldGVyLFxyXG4gICAgICAgIG1vZGVsLmlzUGxheWluZ1Byb3BlcnR5LFxyXG4gICAgICAgIG1vZGVsLmZsdXhNZXRlclZpc2libGVQcm9wZXJ0eSxcclxuICAgICAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSxcclxuICAgICAgICB0aGlzLndpbmRvd0ZyYW1lLmJvdW5kcywgY29tYmluZU9wdGlvbnM8Rmx1eE1ldGVyTm9kZU9wdGlvbnM+KCB7XHJcbiAgICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZsdXhNZXRlck5vZGUnIClcclxuICAgICAgICB9LCBvcHRpb25zLmZsdXhNZXRlck5vZGVPcHRpb25zIClcclxuICAgICAgKTtcclxuICAgICAgdGhpcy5mbHV4TWV0ZXJOb2RlLmZsdXhQYW5lbC5yaWdodFRvcCA9IHRoaXMud2luZG93RnJhbWUucmlnaHRUb3AubWludXNYWShcclxuICAgICAgICBHcmVlbmhvdXNlRWZmZWN0T2JzZXJ2YXRpb25XaW5kb3cuQ09OVFJPTF9BTkRfSU5TVFJVTUVOVF9JTlNFVCxcclxuICAgICAgICAtR3JlZW5ob3VzZUVmZmVjdE9ic2VydmF0aW9uV2luZG93LkNPTlRST0xfQU5EX0lOU1RSVU1FTlRfSU5TRVRcclxuICAgICAgKTtcclxuXHJcbiAgICAgIC8vIHNldCB0aGUgcG9zaXRpb24gb2YgdGhlIHdpcmUgdG8gYXR0YWNoIHRvIHRoZSBmbHV4IHBhbmVsXHJcbiAgICAgIG1vZGVsLmZsdXhNZXRlci53aXJlTWV0ZXJBdHRhY2htZW50UG9zaXRpb25Qcm9wZXJ0eS5zZXQoXHJcbiAgICAgICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxQb3NpdGlvbiggdGhpcy5mbHV4TWV0ZXJOb2RlLmZsdXhQYW5lbC5sZWZ0VG9wLnBsdXNYWSggMCwgNTAgKSApXHJcbiAgICAgICk7XHJcblxyXG4gICAgICB0aGlzLmNvbnRyb2xzTGF5ZXIuYWRkQ2hpbGQoIHRoaXMuZmx1eE1ldGVyTm9kZSApO1xyXG5cclxuICAgICAgLy8gVGhlIGZsdXggbWV0ZXIncyBzZW5zb3Igc2hvdWxkIGJlIGJlaGluZCB0aGUgb3RoZXIgY29udHJvbHMuXHJcbiAgICAgIHRoaXMuZmx1eE1ldGVyTm9kZS5tb3ZlVG9CYWNrKCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5mbHV4TWV0ZXJOb2RlID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBzb3VuZCBnZW5lcmF0aW9uXHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgZGVyaXZlZCBwcm9wZXJ0eSB0aGF0IGlzIHRydWUgd2hlbiBlaXRoZXIgb2YgdGhlIHZpc3VhbCBzdXJmYWNlIHRlbXBlcmF0dXJlIGluZGljYXRvcnMgYXJlIGVuYWJsZWQuXHJcbiAgICBjb25zdCBzdXJmYWNlVGVtcGVyYXR1cmVJbmRpY2F0b3JFbmFibGVkUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbXHJcbiAgICAgICAgbW9kZWwuc3VyZmFjZVRoZXJtb21ldGVyVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICAgIG1vZGVsLnN1cmZhY2VUZW1wZXJhdHVyZVZpc2libGVQcm9wZXJ0eVxyXG4gICAgICBdLFxyXG4gICAgICAoIHRoZXJtb21ldGVyVmlzaWJsZSwgdGVtcGVyYXR1cmVWaXNpYmxlICkgPT4gdGhlcm1vbWV0ZXJWaXNpYmxlIHx8IHRlbXBlcmF0dXJlVmlzaWJsZVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIGZpbHRlci1iYXNlZCBzb3VuZCBnZW5lcmF0b3IgZm9yIHRoZSB0ZW1wZXJhdHVyZS5cclxuICAgIHNvdW5kTWFuYWdlci5hZGRTb3VuZEdlbmVyYXRvcihcclxuICAgICAgbmV3IFRlbXBlcmF0dXJlU291bmRHZW5lcmF0b3JGaWx0ZXJlZChcclxuICAgICAgICBtb2RlbC5zdXJmYWNlVGVtcGVyYXR1cmVLZWx2aW5Qcm9wZXJ0eSxcclxuICAgICAgICBtb2RlbC5zdW5FbmVyZ3lTb3VyY2UuaXNTaGluaW5nUHJvcGVydHksXHJcbiAgICAgICAgbmV3IFJhbmdlKCBtb2RlbC5ncm91bmRMYXllci5taW5pbXVtVGVtcGVyYXR1cmUsIEVYUEVDVEVEX01BWF9URU1QRVJBVFVSRSApLFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGluaXRpYWxPdXRwdXRMZXZlbDogMC4wNDUsXHJcbiAgICAgICAgICBlbmFibGVDb250cm9sUHJvcGVydGllczogW1xyXG4gICAgICAgICAgICBzdXJmYWNlVGVtcGVyYXR1cmVJbmRpY2F0b3JFbmFibGVkUHJvcGVydHksXHJcbiAgICAgICAgICAgIG1vZGVsLmlzUGxheWluZ1Byb3BlcnR5XHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgICApLFxyXG4gICAgICB7IGFzc29jaWF0ZWRWaWV3Tm9kZTogdGhpcyB9XHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0ZXAoIGR0OiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICB0aGlzLmVuZXJneUJhbGFuY2VQYW5lbC5zdGVwKCBkdCApO1xyXG4gICAgaWYgKCB0aGlzLmZsdXhNZXRlck5vZGUgKSB7XHJcbiAgICAgIHRoaXMuZmx1eE1ldGVyTm9kZS5zdGVwKCBkdCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3R1YiBmb3Igc3ViY2xhc3NlcyB0byBzdGVwIGFsZXJ0ZXJzIGZvciBJbnRlcmFjdGl2ZSBEZXNjcmlwdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgc3RlcEFsZXJ0ZXJzKCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgLy8gRG9lcyBub3RoaW5nIGluIHRoZSBiYXNlIGNsYXNzLlxyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5mbHV4TWV0ZXJOb2RlPy5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIHRoZSB2aXN1YWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIGdyb3VuZC4gIFRoaXMgaXMgcXVpdGUgc2ltcGxlIGhlcmUsIGFuZCBpdCBpcyBtZWFudCB0byBiZSBvdmVycmlkZGVuIGluXHJcbiAgICogZGVzY2VuZGVudCBjbGFzc2VzIHRoYXQgdXNlIG1vcmUgc29waGlzdGljYXRlZCByZXByZXNlbnRhdGlvbnMuXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIGNyZWF0ZUdyb3VuZE5vZGUoIG1vZGVsOiBMYXllcnNNb2RlbCApOiBOb2RlIHtcclxuICAgIGNvbnN0IHRvcE9mR3JvdW5kID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCBtb2RlbC5ncm91bmRMYXllci5hbHRpdHVkZSApO1xyXG4gICAgcmV0dXJuIG5ldyBSZWN0YW5nbGUoIDAsIHRvcE9mR3JvdW5kLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCAtIHRvcE9mR3JvdW5kLCB7IGZpbGw6IG5ldyBDb2xvciggMCwgMTUwLCAwICkgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIGEgc2hhcGUgdGhhdCB3aWxsIGJlIHVzZWQgZm9yIHRoZSBzdXJmYWNlIHRlbXBlcmF0dXJlIGdsb3cgYW5kIHBvdGVudGlhbGx5IGZvciBhIE5vZGUgdGhhdCBkZXBpY3RzIHRoZVxyXG4gICAqIGdyb3VuZC4gIFRoaXMgbXVzdCBtYXRjaCB0aGUgYXJ0d29yayBmb3IgdGhlIGxhbmRzY2FwZXMsIGFuZCB3YXMgbWFkZSB0byBkbyBzbyBtYW51YWxseSwgYW5kIG1heSBuZWVkIHRvIGJlXHJcbiAgICogdXBkYXRlZCBpZiB0aGUgYXJ0d29yayBjaGFuZ2VzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlR3JvdW5kU2hhcGUoKTogU2hhcGUge1xyXG5cclxuICAgIGNvbnN0IGxvd2VyTGVmdENvcm5lciA9IFZlY3RvcjIuWkVSTztcclxuICAgIGNvbnN0IGxlZnRTaWRlR3JvdW5kU3VyZmFjZSA9IG5ldyBWZWN0b3IyKCAwLCAtU0laRS5oZWlnaHQgKiAwLjIxOCApO1xyXG4gICAgY29uc3QgY29udHJvbFBvaW50MSA9IG5ldyBWZWN0b3IyKCBTSVpFLndpZHRoICogMC41MiwgLVNJWkUuaGVpZ2h0ICogMC4zNzcgKTtcclxuICAgIGNvbnN0IHJpZ2h0U2lkZUdyb3VuZFN1cmZhY2UgPSBuZXcgVmVjdG9yMiggU0laRS53aWR0aCwgLVNJWkUuaGVpZ2h0ICogMC4xOTcgKTtcclxuICAgIGNvbnN0IGNvbnRyb2xQb2ludDIgPSBuZXcgVmVjdG9yMiggU0laRS53aWR0aCAqIDAuNDEsIC1TSVpFLmhlaWdodCAqIDAuMTE1ICk7XHJcbiAgICBjb25zdCBsb3dlclJpZ2h0Q29ybmVyID0gbmV3IFZlY3RvcjIoIFNJWkUud2lkdGgsIDAgKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFNoYXBlKClcclxuICAgICAgLm1vdmVUb1BvaW50KCBsb3dlckxlZnRDb3JuZXIgKVxyXG4gICAgICAubGluZVRvUG9pbnQoIGxlZnRTaWRlR3JvdW5kU3VyZmFjZSApXHJcbiAgICAgIC5jdWJpY0N1cnZlVG9Qb2ludCggY29udHJvbFBvaW50MSwgY29udHJvbFBvaW50MiwgcmlnaHRTaWRlR3JvdW5kU3VyZmFjZSApXHJcbiAgICAgIC5saW5lVG9Qb2ludCggbG93ZXJSaWdodENvcm5lciApXHJcbiAgICAgIC5saW5lVG9Qb2ludCggbG93ZXJMZWZ0Q29ybmVyIClcclxuICAgICAgLmNsb3NlKCk7XHJcbiAgfVxyXG5cclxuICAvLyBzdGF0aWMgdmFsdWVzXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBTSVpFOiBEaW1lbnNpb24yID0gU0laRTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IENPTlRST0xfQU5EX0lOU1RSVU1FTlRfSU5TRVQ6IG51bWJlciA9IENPTlRST0xfQU5EX0lOU1RSVU1FTlRfSU5TRVQ7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBFWFBFQ1RFRF9NQVhfVEVNUEVSQVRVUkUgPSBFWFBFQ1RFRF9NQVhfVEVNUEVSQVRVUkU7XHJcbn1cclxuXHJcbmdyZWVuaG91c2VFZmZlY3QucmVnaXN0ZXIoICdHcmVlbmhvdXNlRWZmZWN0T2JzZXJ2YXRpb25XaW5kb3cnLCBHcmVlbmhvdXNlRWZmZWN0T2JzZXJ2YXRpb25XaW5kb3cgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEdyZWVuaG91c2VFZmZlY3RPYnNlcnZhdGlvbldpbmRvdztcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsT0FB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