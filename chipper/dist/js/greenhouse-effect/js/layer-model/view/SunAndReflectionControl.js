// Copyright 2021-2023, University of Colorado Boulder

/**
 * Controls for the output level of the sun and the albedo (i.e. reflection level) of the ground.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text, VBox } from '../../../../scenery/js/imports.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Panel from '../../../../sun/js/Panel.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import GreenhouseEffectColors from '../../common/GreenhouseEffectColors.js';
import GreenhouseEffectConstants from '../../common/GreenhouseEffectConstants.js';
import SunEnergySource from '../../common/model/SunEnergySource.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import GreenhouseEffectStrings from '../../GreenhouseEffectStrings.js';
import SolarIntensitySoundPlayer from './SolarIntensitySoundPlayer.js';
import SurfaceAlbedoSoundPlayer from './SurfaceAlbedoSoundPlayer.js';

// constants
const HEADING_FONT = new PhetFont(14);
const TICK_MARK_TEXT_OPTIONS = {
  font: new PhetFont(10),
  maxWidth: 50
};
const PANEL_MARGIN = 5;
const COMMON_SLIDER_OPTIONS = {
  thumbSize: GreenhouseEffectConstants.HORIZONTAL_SLIDER_THUMB_SIZE,
  thumbTouchAreaXDilation: 8,
  thumbTouchAreaYDilation: 8,
  majorTickLength: GreenhouseEffectConstants.HORIZONTAL_SLIDER_THUMB_SIZE.height * 0.6,
  minorTickLength: GreenhouseEffectConstants.HORIZONTAL_SLIDER_THUMB_SIZE.height * 0.25,
  tickLabelSpacing: 2
};
const SURFACE_ALBEDO_SLIDER_STEP_SIZE = 0.1;
const SOLAR_INTENSITY_SLIDER_STEP_SIZE = 0.25;
class SunAndReflectionControl extends Panel {
  constructor(width, layersModel, tandem) {
    const options = {
      minWidth: width,
      maxWidth: width,
      xMargin: PANEL_MARGIN,
      yMargin: PANEL_MARGIN,
      align: 'center',
      fill: GreenhouseEffectColors.controlPanelBackgroundColorProperty,
      // pdom
      tagName: 'div',
      labelTagName: 'h3',
      labelContent: GreenhouseEffectStrings.infraredStringProperty,
      // phet-io
      tandem: tandem
    };

    // Title text for the panel.
    const titleText = new Text(GreenhouseEffectStrings.sunlightStringProperty, {
      font: GreenhouseEffectConstants.TITLE_FONT,
      maxWidth: width - PANEL_MARGIN * 2,
      tandem: options.tandem.createTandem('titleText')
    });

    // convenience variable
    const solarIntensityProportionRange = SunEnergySource.OUTPUT_PROPORTION_RANGE;

    // sound player for the middle range of the solar intensity slider
    const solarIntensitySliderSoundPlayer = new SolarIntensitySoundPlayer(layersModel.sunEnergySource.proportionateOutputRateProperty, solarIntensityProportionRange, {
      initialOutputLevel: 0.075
    });
    soundManager.addSoundGenerator(solarIntensitySliderSoundPlayer);

    // label for the slider that controls the solar intensity
    const solarIntensitySliderLabel = new Text(GreenhouseEffectStrings.solarIntensityStringProperty, {
      font: HEADING_FONT
    });

    // track size of the sliders, based in part on the provided width
    const sliderTrackSize = new Dimension2(width * 0.75, 1);

    // slider for controlling the solar intensity
    const solarIntensitySlider = new HSlider(layersModel.sunEnergySource.proportionateOutputRateProperty, solarIntensityProportionRange, combineOptions({}, COMMON_SLIDER_OPTIONS, {
      trackSize: sliderTrackSize,
      constrainValue: value => Utils.roundToInterval(value, SOLAR_INTENSITY_SLIDER_STEP_SIZE),
      keyboardStep: SOLAR_INTENSITY_SLIDER_STEP_SIZE,
      shiftKeyboardStep: SOLAR_INTENSITY_SLIDER_STEP_SIZE,
      pageKeyboardStep: SOLAR_INTENSITY_SLIDER_STEP_SIZE * 2,
      valueChangeSoundGeneratorOptions: {
        middleMovingUpSoundPlayer: solarIntensitySliderSoundPlayer,
        middleMovingDownSoundPlayer: solarIntensitySliderSoundPlayer,
        minSoundPlayer: solarIntensitySliderSoundPlayer,
        maxSoundPlayer: solarIntensitySliderSoundPlayer
      },
      tandem: tandem.createTandem('solarIntensitySlider')
    }));
    const majorTicksOnSolarIntensitySlider = 4;
    const distanceBetweenMajorTicks = solarIntensityProportionRange.getLength() / (majorTicksOnSolarIntensitySlider - 1);
    _.times(majorTicksOnSolarIntensitySlider, index => {
      // major tick, with label
      const value = solarIntensityProportionRange.min + index * distanceBetweenMajorTicks;
      let labelText;
      if (value === 1) {
        labelText = GreenhouseEffectStrings.ourSunStringProperty;
      } else {
        labelText = new PatternStringProperty(GreenhouseEffectStrings.valuePercentPatternStringProperty, {
          value: value * 100
        });
      }
      solarIntensitySlider.addMajorTick(value, new Text(labelText, TICK_MARK_TEXT_OPTIONS));

      // minor tick
      if (index < majorTicksOnSolarIntensitySlider - 1) {
        solarIntensitySlider.addMinorTick(value + distanceBetweenMajorTicks / 2);
      }
    });

    // Put the label and slider for the solar intensity control into their own VBox.
    const solarIntensityControl = new VBox({
      children: [solarIntensitySliderLabel, solarIntensitySlider],
      spacing: 8
    }); // label for the slider that controls the solar intensity

    const surfaceAlbedoSliderLabel = new Text(GreenhouseEffectStrings.surfaceAlbedoStringProperty, {
      font: HEADING_FONT
    });

    // convenience variable
    const surfaceAlbedoRange = new Range(0, 0.9);

    // sound player for the middle range of the surface albedo slider
    const surfaceAlbedoSliderSoundPlayer = new SurfaceAlbedoSoundPlayer(layersModel.groundLayer.albedoProperty, surfaceAlbedoRange, {
      initialOutputLevel: 0.1
    });
    soundManager.addSoundGenerator(surfaceAlbedoSliderSoundPlayer);

    // slider for controlling the solar intensity
    const surfaceAlbedoSlider = new HSlider(layersModel.groundLayer.albedoProperty, surfaceAlbedoRange, combineOptions({}, COMMON_SLIDER_OPTIONS, {
      trackSize: sliderTrackSize,
      constrainValue: value => Utils.roundToInterval(value, SURFACE_ALBEDO_SLIDER_STEP_SIZE),
      keyboardStep: SURFACE_ALBEDO_SLIDER_STEP_SIZE,
      shiftKeyboardStep: SURFACE_ALBEDO_SLIDER_STEP_SIZE,
      pageKeyboardStep: SURFACE_ALBEDO_SLIDER_STEP_SIZE * 2,
      valueChangeSoundGeneratorOptions: {
        numberOfMiddleThresholds: 8,
        minSoundPlayer: surfaceAlbedoSliderSoundPlayer,
        maxSoundPlayer: surfaceAlbedoSliderSoundPlayer,
        middleMovingUpSoundPlayer: surfaceAlbedoSliderSoundPlayer,
        middleMovingDownSoundPlayer: surfaceAlbedoSliderSoundPlayer
      },
      tandem: tandem.createTandem('surfaceAlbedoSlider')
    }));
    surfaceAlbedoSlider.addMajorTick(surfaceAlbedoRange.min, new Text(surfaceAlbedoRange.min, TICK_MARK_TEXT_OPTIONS));
    surfaceAlbedoSlider.addMajorTick(surfaceAlbedoRange.max, new Text(surfaceAlbedoRange.max, TICK_MARK_TEXT_OPTIONS));
    const distanceBetweenMinorTicks = 0.1; // from design doc
    _.times(surfaceAlbedoRange.getLength() / distanceBetweenMinorTicks - 1, index => {
      surfaceAlbedoSlider.addMinorTick(surfaceAlbedoRange.min + (index + 1) * distanceBetweenMinorTicks);
    });

    // Put the label and slider for the solar intensity control into their own VBox.
    const surfaceAlbedoControl = new VBox({
      children: [surfaceAlbedoSliderLabel, surfaceAlbedoSlider],
      spacing: 1
    });
    const content = new VBox({
      children: [titleText, solarIntensityControl, surfaceAlbedoControl],
      spacing: 24
    });
    super(content, options);
  }
}
greenhouseEffect.register('SunAndReflectionControl', SunAndReflectionControl);
export default SunAndReflectionControl;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJEaW1lbnNpb24yIiwiUmFuZ2UiLCJVdGlscyIsImNvbWJpbmVPcHRpb25zIiwiUGhldEZvbnQiLCJUZXh0IiwiVkJveCIsIkhTbGlkZXIiLCJQYW5lbCIsInNvdW5kTWFuYWdlciIsIkdyZWVuaG91c2VFZmZlY3RDb2xvcnMiLCJHcmVlbmhvdXNlRWZmZWN0Q29uc3RhbnRzIiwiU3VuRW5lcmd5U291cmNlIiwiZ3JlZW5ob3VzZUVmZmVjdCIsIkdyZWVuaG91c2VFZmZlY3RTdHJpbmdzIiwiU29sYXJJbnRlbnNpdHlTb3VuZFBsYXllciIsIlN1cmZhY2VBbGJlZG9Tb3VuZFBsYXllciIsIkhFQURJTkdfRk9OVCIsIlRJQ0tfTUFSS19URVhUX09QVElPTlMiLCJmb250IiwibWF4V2lkdGgiLCJQQU5FTF9NQVJHSU4iLCJDT01NT05fU0xJREVSX09QVElPTlMiLCJ0aHVtYlNpemUiLCJIT1JJWk9OVEFMX1NMSURFUl9USFVNQl9TSVpFIiwidGh1bWJUb3VjaEFyZWFYRGlsYXRpb24iLCJ0aHVtYlRvdWNoQXJlYVlEaWxhdGlvbiIsIm1ham9yVGlja0xlbmd0aCIsImhlaWdodCIsIm1pbm9yVGlja0xlbmd0aCIsInRpY2tMYWJlbFNwYWNpbmciLCJTVVJGQUNFX0FMQkVET19TTElERVJfU1RFUF9TSVpFIiwiU09MQVJfSU5URU5TSVRZX1NMSURFUl9TVEVQX1NJWkUiLCJTdW5BbmRSZWZsZWN0aW9uQ29udHJvbCIsImNvbnN0cnVjdG9yIiwid2lkdGgiLCJsYXllcnNNb2RlbCIsInRhbmRlbSIsIm9wdGlvbnMiLCJtaW5XaWR0aCIsInhNYXJnaW4iLCJ5TWFyZ2luIiwiYWxpZ24iLCJmaWxsIiwiY29udHJvbFBhbmVsQmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJ0YWdOYW1lIiwibGFiZWxUYWdOYW1lIiwibGFiZWxDb250ZW50IiwiaW5mcmFyZWRTdHJpbmdQcm9wZXJ0eSIsInRpdGxlVGV4dCIsInN1bmxpZ2h0U3RyaW5nUHJvcGVydHkiLCJUSVRMRV9GT05UIiwiY3JlYXRlVGFuZGVtIiwic29sYXJJbnRlbnNpdHlQcm9wb3J0aW9uUmFuZ2UiLCJPVVRQVVRfUFJPUE9SVElPTl9SQU5HRSIsInNvbGFySW50ZW5zaXR5U2xpZGVyU291bmRQbGF5ZXIiLCJzdW5FbmVyZ3lTb3VyY2UiLCJwcm9wb3J0aW9uYXRlT3V0cHV0UmF0ZVByb3BlcnR5IiwiaW5pdGlhbE91dHB1dExldmVsIiwiYWRkU291bmRHZW5lcmF0b3IiLCJzb2xhckludGVuc2l0eVNsaWRlckxhYmVsIiwic29sYXJJbnRlbnNpdHlTdHJpbmdQcm9wZXJ0eSIsInNsaWRlclRyYWNrU2l6ZSIsInNvbGFySW50ZW5zaXR5U2xpZGVyIiwidHJhY2tTaXplIiwiY29uc3RyYWluVmFsdWUiLCJ2YWx1ZSIsInJvdW5kVG9JbnRlcnZhbCIsImtleWJvYXJkU3RlcCIsInNoaWZ0S2V5Ym9hcmRTdGVwIiwicGFnZUtleWJvYXJkU3RlcCIsInZhbHVlQ2hhbmdlU291bmRHZW5lcmF0b3JPcHRpb25zIiwibWlkZGxlTW92aW5nVXBTb3VuZFBsYXllciIsIm1pZGRsZU1vdmluZ0Rvd25Tb3VuZFBsYXllciIsIm1pblNvdW5kUGxheWVyIiwibWF4U291bmRQbGF5ZXIiLCJtYWpvclRpY2tzT25Tb2xhckludGVuc2l0eVNsaWRlciIsImRpc3RhbmNlQmV0d2Vlbk1ham9yVGlja3MiLCJnZXRMZW5ndGgiLCJfIiwidGltZXMiLCJpbmRleCIsIm1pbiIsImxhYmVsVGV4dCIsIm91clN1blN0cmluZ1Byb3BlcnR5IiwidmFsdWVQZXJjZW50UGF0dGVyblN0cmluZ1Byb3BlcnR5IiwiYWRkTWFqb3JUaWNrIiwiYWRkTWlub3JUaWNrIiwic29sYXJJbnRlbnNpdHlDb250cm9sIiwiY2hpbGRyZW4iLCJzcGFjaW5nIiwic3VyZmFjZUFsYmVkb1NsaWRlckxhYmVsIiwic3VyZmFjZUFsYmVkb1N0cmluZ1Byb3BlcnR5Iiwic3VyZmFjZUFsYmVkb1JhbmdlIiwic3VyZmFjZUFsYmVkb1NsaWRlclNvdW5kUGxheWVyIiwiZ3JvdW5kTGF5ZXIiLCJhbGJlZG9Qcm9wZXJ0eSIsInN1cmZhY2VBbGJlZG9TbGlkZXIiLCJudW1iZXJPZk1pZGRsZVRocmVzaG9sZHMiLCJtYXgiLCJkaXN0YW5jZUJldHdlZW5NaW5vclRpY2tzIiwic3VyZmFjZUFsYmVkb0NvbnRyb2wiLCJjb250ZW50IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTdW5BbmRSZWZsZWN0aW9uQ29udHJvbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb250cm9scyBmb3IgdGhlIG91dHB1dCBsZXZlbCBvZiB0aGUgc3VuIGFuZCB0aGUgYWxiZWRvIChpLmUuIHJlZmxlY3Rpb24gbGV2ZWwpIG9mIHRoZSBncm91bmQuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1BhdHRlcm5TdHJpbmdQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBIU2xpZGVyIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9IU2xpZGVyLmpzJztcclxuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCB7IFNsaWRlck9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvU2xpZGVyLmpzJztcclxuaW1wb3J0IHNvdW5kTWFuYWdlciBmcm9tICcuLi8uLi8uLi8uLi90YW1iby9qcy9zb3VuZE1hbmFnZXIuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgR3JlZW5ob3VzZUVmZmVjdENvbG9ycyBmcm9tICcuLi8uLi9jb21tb24vR3JlZW5ob3VzZUVmZmVjdENvbG9ycy5qcyc7XHJcbmltcG9ydCBHcmVlbmhvdXNlRWZmZWN0Q29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9HcmVlbmhvdXNlRWZmZWN0Q29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFN1bkVuZXJneVNvdXJjZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvU3VuRW5lcmd5U291cmNlLmpzJztcclxuaW1wb3J0IGdyZWVuaG91c2VFZmZlY3QgZnJvbSAnLi4vLi4vZ3JlZW5ob3VzZUVmZmVjdC5qcyc7XHJcbmltcG9ydCBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncyBmcm9tICcuLi8uLi9HcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5qcyc7XHJcbmltcG9ydCBMYXllck1vZGVsTW9kZWwgZnJvbSAnLi4vbW9kZWwvTGF5ZXJNb2RlbE1vZGVsLmpzJztcclxuaW1wb3J0IFNvbGFySW50ZW5zaXR5U291bmRQbGF5ZXIgZnJvbSAnLi9Tb2xhckludGVuc2l0eVNvdW5kUGxheWVyLmpzJztcclxuaW1wb3J0IFN1cmZhY2VBbGJlZG9Tb3VuZFBsYXllciBmcm9tICcuL1N1cmZhY2VBbGJlZG9Tb3VuZFBsYXllci5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgSEVBRElOR19GT05UID0gbmV3IFBoZXRGb250KCAxNCApO1xyXG5jb25zdCBUSUNLX01BUktfVEVYVF9PUFRJT05TID0ge1xyXG4gIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTAgKSxcclxuICBtYXhXaWR0aDogNTBcclxufTtcclxuY29uc3QgUEFORUxfTUFSR0lOID0gNTtcclxuY29uc3QgQ09NTU9OX1NMSURFUl9PUFRJT05TOiBTbGlkZXJPcHRpb25zID0ge1xyXG4gIHRodW1iU2l6ZTogR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cy5IT1JJWk9OVEFMX1NMSURFUl9USFVNQl9TSVpFLFxyXG4gIHRodW1iVG91Y2hBcmVhWERpbGF0aW9uOiA4LFxyXG4gIHRodW1iVG91Y2hBcmVhWURpbGF0aW9uOiA4LFxyXG4gIG1ham9yVGlja0xlbmd0aDogR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cy5IT1JJWk9OVEFMX1NMSURFUl9USFVNQl9TSVpFLmhlaWdodCAqIDAuNixcclxuICBtaW5vclRpY2tMZW5ndGg6IEdyZWVuaG91c2VFZmZlY3RDb25zdGFudHMuSE9SSVpPTlRBTF9TTElERVJfVEhVTUJfU0laRS5oZWlnaHQgKiAwLjI1LFxyXG4gIHRpY2tMYWJlbFNwYWNpbmc6IDJcclxufTtcclxuY29uc3QgU1VSRkFDRV9BTEJFRE9fU0xJREVSX1NURVBfU0laRSA9IDAuMTtcclxuY29uc3QgU09MQVJfSU5URU5TSVRZX1NMSURFUl9TVEVQX1NJWkUgPSAwLjI1O1xyXG5cclxuY2xhc3MgU3VuQW5kUmVmbGVjdGlvbkNvbnRyb2wgZXh0ZW5kcyBQYW5lbCB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggd2lkdGg6IG51bWJlciwgbGF5ZXJzTW9kZWw6IExheWVyTW9kZWxNb2RlbCwgdGFuZGVtOiBUYW5kZW0gKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcclxuXHJcbiAgICAgIG1pbldpZHRoOiB3aWR0aCxcclxuICAgICAgbWF4V2lkdGg6IHdpZHRoLFxyXG4gICAgICB4TWFyZ2luOiBQQU5FTF9NQVJHSU4sXHJcbiAgICAgIHlNYXJnaW46IFBBTkVMX01BUkdJTixcclxuICAgICAgYWxpZ246ICdjZW50ZXInIGFzIGNvbnN0LFxyXG4gICAgICBmaWxsOiBHcmVlbmhvdXNlRWZmZWN0Q29sb3JzLmNvbnRyb2xQYW5lbEJhY2tncm91bmRDb2xvclByb3BlcnR5LFxyXG5cclxuICAgICAgLy8gcGRvbVxyXG4gICAgICB0YWdOYW1lOiAnZGl2JyxcclxuICAgICAgbGFiZWxUYWdOYW1lOiAnaDMnLFxyXG4gICAgICBsYWJlbENvbnRlbnQ6IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmluZnJhcmVkU3RyaW5nUHJvcGVydHksXHJcblxyXG4gICAgICAvLyBwaGV0LWlvXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFRpdGxlIHRleHQgZm9yIHRoZSBwYW5lbC5cclxuICAgIGNvbnN0IHRpdGxlVGV4dCA9IG5ldyBUZXh0KCBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5zdW5saWdodFN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIGZvbnQ6IEdyZWVuaG91c2VFZmZlY3RDb25zdGFudHMuVElUTEVfRk9OVCxcclxuICAgICAgbWF4V2lkdGg6IHdpZHRoIC0gUEFORUxfTUFSR0lOICogMixcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd0aXRsZVRleHQnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBjb252ZW5pZW5jZSB2YXJpYWJsZVxyXG4gICAgY29uc3Qgc29sYXJJbnRlbnNpdHlQcm9wb3J0aW9uUmFuZ2UgPSBTdW5FbmVyZ3lTb3VyY2UuT1VUUFVUX1BST1BPUlRJT05fUkFOR0U7XHJcblxyXG4gICAgLy8gc291bmQgcGxheWVyIGZvciB0aGUgbWlkZGxlIHJhbmdlIG9mIHRoZSBzb2xhciBpbnRlbnNpdHkgc2xpZGVyXHJcbiAgICBjb25zdCBzb2xhckludGVuc2l0eVNsaWRlclNvdW5kUGxheWVyID0gbmV3IFNvbGFySW50ZW5zaXR5U291bmRQbGF5ZXIoXHJcbiAgICAgIGxheWVyc01vZGVsLnN1bkVuZXJneVNvdXJjZS5wcm9wb3J0aW9uYXRlT3V0cHV0UmF0ZVByb3BlcnR5LFxyXG4gICAgICBzb2xhckludGVuc2l0eVByb3BvcnRpb25SYW5nZSxcclxuICAgICAgeyBpbml0aWFsT3V0cHV0TGV2ZWw6IDAuMDc1IH1cclxuICAgICk7XHJcbiAgICBzb3VuZE1hbmFnZXIuYWRkU291bmRHZW5lcmF0b3IoIHNvbGFySW50ZW5zaXR5U2xpZGVyU291bmRQbGF5ZXIgKTtcclxuXHJcbiAgICAvLyBsYWJlbCBmb3IgdGhlIHNsaWRlciB0aGF0IGNvbnRyb2xzIHRoZSBzb2xhciBpbnRlbnNpdHlcclxuICAgIGNvbnN0IHNvbGFySW50ZW5zaXR5U2xpZGVyTGFiZWwgPSBuZXcgVGV4dCggR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3Muc29sYXJJbnRlbnNpdHlTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBIRUFESU5HX0ZPTlRcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB0cmFjayBzaXplIG9mIHRoZSBzbGlkZXJzLCBiYXNlZCBpbiBwYXJ0IG9uIHRoZSBwcm92aWRlZCB3aWR0aFxyXG4gICAgY29uc3Qgc2xpZGVyVHJhY2tTaXplID0gbmV3IERpbWVuc2lvbjIoIHdpZHRoICogMC43NSwgMSApO1xyXG5cclxuICAgIC8vIHNsaWRlciBmb3IgY29udHJvbGxpbmcgdGhlIHNvbGFyIGludGVuc2l0eVxyXG4gICAgY29uc3Qgc29sYXJJbnRlbnNpdHlTbGlkZXIgPSBuZXcgSFNsaWRlcihcclxuICAgICAgbGF5ZXJzTW9kZWwuc3VuRW5lcmd5U291cmNlLnByb3BvcnRpb25hdGVPdXRwdXRSYXRlUHJvcGVydHksXHJcbiAgICAgIHNvbGFySW50ZW5zaXR5UHJvcG9ydGlvblJhbmdlLFxyXG4gICAgICBjb21iaW5lT3B0aW9uczxTbGlkZXJPcHRpb25zPigge30sIENPTU1PTl9TTElERVJfT1BUSU9OUywge1xyXG4gICAgICAgIHRyYWNrU2l6ZTogc2xpZGVyVHJhY2tTaXplLFxyXG4gICAgICAgIGNvbnN0cmFpblZhbHVlOiAoIHZhbHVlOiBudW1iZXIgKSA9PiBVdGlscy5yb3VuZFRvSW50ZXJ2YWwoIHZhbHVlLCBTT0xBUl9JTlRFTlNJVFlfU0xJREVSX1NURVBfU0laRSApLFxyXG4gICAgICAgIGtleWJvYXJkU3RlcDogU09MQVJfSU5URU5TSVRZX1NMSURFUl9TVEVQX1NJWkUsXHJcbiAgICAgICAgc2hpZnRLZXlib2FyZFN0ZXA6IFNPTEFSX0lOVEVOU0lUWV9TTElERVJfU1RFUF9TSVpFLFxyXG4gICAgICAgIHBhZ2VLZXlib2FyZFN0ZXA6IFNPTEFSX0lOVEVOU0lUWV9TTElERVJfU1RFUF9TSVpFICogMixcclxuICAgICAgICB2YWx1ZUNoYW5nZVNvdW5kR2VuZXJhdG9yT3B0aW9uczoge1xyXG4gICAgICAgICAgbWlkZGxlTW92aW5nVXBTb3VuZFBsYXllcjogc29sYXJJbnRlbnNpdHlTbGlkZXJTb3VuZFBsYXllcixcclxuICAgICAgICAgIG1pZGRsZU1vdmluZ0Rvd25Tb3VuZFBsYXllcjogc29sYXJJbnRlbnNpdHlTbGlkZXJTb3VuZFBsYXllcixcclxuICAgICAgICAgIG1pblNvdW5kUGxheWVyOiBzb2xhckludGVuc2l0eVNsaWRlclNvdW5kUGxheWVyLFxyXG4gICAgICAgICAgbWF4U291bmRQbGF5ZXI6IHNvbGFySW50ZW5zaXR5U2xpZGVyU291bmRQbGF5ZXJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NvbGFySW50ZW5zaXR5U2xpZGVyJyApXHJcbiAgICAgIH0gKVxyXG4gICAgKTtcclxuICAgIGNvbnN0IG1ham9yVGlja3NPblNvbGFySW50ZW5zaXR5U2xpZGVyID0gNDtcclxuICAgIGNvbnN0IGRpc3RhbmNlQmV0d2Vlbk1ham9yVGlja3MgPSBzb2xhckludGVuc2l0eVByb3BvcnRpb25SYW5nZS5nZXRMZW5ndGgoKSAvICggbWFqb3JUaWNrc09uU29sYXJJbnRlbnNpdHlTbGlkZXIgLSAxICk7XHJcbiAgICBfLnRpbWVzKCBtYWpvclRpY2tzT25Tb2xhckludGVuc2l0eVNsaWRlciwgaW5kZXggPT4ge1xyXG5cclxuICAgICAgLy8gbWFqb3IgdGljaywgd2l0aCBsYWJlbFxyXG4gICAgICBjb25zdCB2YWx1ZSA9IHNvbGFySW50ZW5zaXR5UHJvcG9ydGlvblJhbmdlLm1pbiArIGluZGV4ICogZGlzdGFuY2VCZXR3ZWVuTWFqb3JUaWNrcztcclxuICAgICAgbGV0IGxhYmVsVGV4dDtcclxuICAgICAgaWYgKCB2YWx1ZSA9PT0gMSApIHtcclxuICAgICAgICBsYWJlbFRleHQgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5vdXJTdW5TdHJpbmdQcm9wZXJ0eTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBsYWJlbFRleHQgPSBuZXcgUGF0dGVyblN0cmluZ1Byb3BlcnR5KFxyXG4gICAgICAgICAgR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MudmFsdWVQZXJjZW50UGF0dGVyblN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICAgICAgeyB2YWx1ZTogdmFsdWUgKiAxMDAgfVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgICAgc29sYXJJbnRlbnNpdHlTbGlkZXIuYWRkTWFqb3JUaWNrKFxyXG4gICAgICAgIHZhbHVlLFxyXG4gICAgICAgIG5ldyBUZXh0KCBsYWJlbFRleHQsIFRJQ0tfTUFSS19URVhUX09QVElPTlMgKVxyXG4gICAgICApO1xyXG5cclxuICAgICAgLy8gbWlub3IgdGlja1xyXG4gICAgICBpZiAoIGluZGV4IDwgbWFqb3JUaWNrc09uU29sYXJJbnRlbnNpdHlTbGlkZXIgLSAxICkge1xyXG4gICAgICAgIHNvbGFySW50ZW5zaXR5U2xpZGVyLmFkZE1pbm9yVGljayggdmFsdWUgKyBkaXN0YW5jZUJldHdlZW5NYWpvclRpY2tzIC8gMiApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gUHV0IHRoZSBsYWJlbCBhbmQgc2xpZGVyIGZvciB0aGUgc29sYXIgaW50ZW5zaXR5IGNvbnRyb2wgaW50byB0aGVpciBvd24gVkJveC5cclxuICAgIGNvbnN0IHNvbGFySW50ZW5zaXR5Q29udHJvbCA9IG5ldyBWQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIHNvbGFySW50ZW5zaXR5U2xpZGVyTGFiZWwsIHNvbGFySW50ZW5zaXR5U2xpZGVyIF0sXHJcbiAgICAgIHNwYWNpbmc6IDhcclxuICAgIH0gKTsgICAgLy8gbGFiZWwgZm9yIHRoZSBzbGlkZXIgdGhhdCBjb250cm9scyB0aGUgc29sYXIgaW50ZW5zaXR5XHJcblxyXG4gICAgY29uc3Qgc3VyZmFjZUFsYmVkb1NsaWRlckxhYmVsID0gbmV3IFRleHQoIEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLnN1cmZhY2VBbGJlZG9TdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBIRUFESU5HX0ZPTlRcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBjb252ZW5pZW5jZSB2YXJpYWJsZVxyXG4gICAgY29uc3Qgc3VyZmFjZUFsYmVkb1JhbmdlID0gbmV3IFJhbmdlKCAwLCAwLjkgKTtcclxuXHJcbiAgICAvLyBzb3VuZCBwbGF5ZXIgZm9yIHRoZSBtaWRkbGUgcmFuZ2Ugb2YgdGhlIHN1cmZhY2UgYWxiZWRvIHNsaWRlclxyXG4gICAgY29uc3Qgc3VyZmFjZUFsYmVkb1NsaWRlclNvdW5kUGxheWVyID0gbmV3IFN1cmZhY2VBbGJlZG9Tb3VuZFBsYXllcihcclxuICAgICAgbGF5ZXJzTW9kZWwuZ3JvdW5kTGF5ZXIuYWxiZWRvUHJvcGVydHksXHJcbiAgICAgIHN1cmZhY2VBbGJlZG9SYW5nZSwgeyBpbml0aWFsT3V0cHV0TGV2ZWw6IDAuMSB9XHJcbiAgICApO1xyXG4gICAgc291bmRNYW5hZ2VyLmFkZFNvdW5kR2VuZXJhdG9yKCBzdXJmYWNlQWxiZWRvU2xpZGVyU291bmRQbGF5ZXIgKTtcclxuXHJcbiAgICAvLyBzbGlkZXIgZm9yIGNvbnRyb2xsaW5nIHRoZSBzb2xhciBpbnRlbnNpdHlcclxuICAgIGNvbnN0IHN1cmZhY2VBbGJlZG9TbGlkZXIgPSBuZXcgSFNsaWRlcihcclxuICAgICAgbGF5ZXJzTW9kZWwuZ3JvdW5kTGF5ZXIuYWxiZWRvUHJvcGVydHksXHJcbiAgICAgIHN1cmZhY2VBbGJlZG9SYW5nZSxcclxuICAgICAgY29tYmluZU9wdGlvbnM8U2xpZGVyT3B0aW9ucz4oIHt9LCBDT01NT05fU0xJREVSX09QVElPTlMsIHtcclxuICAgICAgICB0cmFja1NpemU6IHNsaWRlclRyYWNrU2l6ZSxcclxuICAgICAgICBjb25zdHJhaW5WYWx1ZTogKCB2YWx1ZTogbnVtYmVyICkgPT4gVXRpbHMucm91bmRUb0ludGVydmFsKCB2YWx1ZSwgU1VSRkFDRV9BTEJFRE9fU0xJREVSX1NURVBfU0laRSApLFxyXG4gICAgICAgIGtleWJvYXJkU3RlcDogU1VSRkFDRV9BTEJFRE9fU0xJREVSX1NURVBfU0laRSxcclxuICAgICAgICBzaGlmdEtleWJvYXJkU3RlcDogU1VSRkFDRV9BTEJFRE9fU0xJREVSX1NURVBfU0laRSxcclxuICAgICAgICBwYWdlS2V5Ym9hcmRTdGVwOiBTVVJGQUNFX0FMQkVET19TTElERVJfU1RFUF9TSVpFICogMixcclxuICAgICAgICB2YWx1ZUNoYW5nZVNvdW5kR2VuZXJhdG9yT3B0aW9uczoge1xyXG4gICAgICAgICAgbnVtYmVyT2ZNaWRkbGVUaHJlc2hvbGRzOiA4LFxyXG4gICAgICAgICAgbWluU291bmRQbGF5ZXI6IHN1cmZhY2VBbGJlZG9TbGlkZXJTb3VuZFBsYXllcixcclxuICAgICAgICAgIG1heFNvdW5kUGxheWVyOiBzdXJmYWNlQWxiZWRvU2xpZGVyU291bmRQbGF5ZXIsXHJcbiAgICAgICAgICBtaWRkbGVNb3ZpbmdVcFNvdW5kUGxheWVyOiBzdXJmYWNlQWxiZWRvU2xpZGVyU291bmRQbGF5ZXIsXHJcbiAgICAgICAgICBtaWRkbGVNb3ZpbmdEb3duU291bmRQbGF5ZXI6IHN1cmZhY2VBbGJlZG9TbGlkZXJTb3VuZFBsYXllclxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3VyZmFjZUFsYmVkb1NsaWRlcicgKVxyXG4gICAgICB9IClcclxuICAgICk7XHJcbiAgICBzdXJmYWNlQWxiZWRvU2xpZGVyLmFkZE1ham9yVGljayhcclxuICAgICAgc3VyZmFjZUFsYmVkb1JhbmdlLm1pbixcclxuICAgICAgbmV3IFRleHQoIHN1cmZhY2VBbGJlZG9SYW5nZS5taW4sIFRJQ0tfTUFSS19URVhUX09QVElPTlMgKVxyXG4gICAgKTtcclxuICAgIHN1cmZhY2VBbGJlZG9TbGlkZXIuYWRkTWFqb3JUaWNrKFxyXG4gICAgICBzdXJmYWNlQWxiZWRvUmFuZ2UubWF4LFxyXG4gICAgICBuZXcgVGV4dCggc3VyZmFjZUFsYmVkb1JhbmdlLm1heCwgVElDS19NQVJLX1RFWFRfT1BUSU9OUyApXHJcbiAgICApO1xyXG4gICAgY29uc3QgZGlzdGFuY2VCZXR3ZWVuTWlub3JUaWNrcyA9IDAuMTsgLy8gZnJvbSBkZXNpZ24gZG9jXHJcbiAgICBfLnRpbWVzKCBzdXJmYWNlQWxiZWRvUmFuZ2UuZ2V0TGVuZ3RoKCkgLyBkaXN0YW5jZUJldHdlZW5NaW5vclRpY2tzIC0gMSwgaW5kZXggPT4ge1xyXG4gICAgICBzdXJmYWNlQWxiZWRvU2xpZGVyLmFkZE1pbm9yVGljayggc3VyZmFjZUFsYmVkb1JhbmdlLm1pbiArICggaW5kZXggKyAxICkgKiBkaXN0YW5jZUJldHdlZW5NaW5vclRpY2tzICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gUHV0IHRoZSBsYWJlbCBhbmQgc2xpZGVyIGZvciB0aGUgc29sYXIgaW50ZW5zaXR5IGNvbnRyb2wgaW50byB0aGVpciBvd24gVkJveC5cclxuICAgIGNvbnN0IHN1cmZhY2VBbGJlZG9Db250cm9sID0gbmV3IFZCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFsgc3VyZmFjZUFsYmVkb1NsaWRlckxhYmVsLCBzdXJmYWNlQWxiZWRvU2xpZGVyIF0sXHJcbiAgICAgIHNwYWNpbmc6IDFcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjb250ZW50ID0gbmV3IFZCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFsgdGl0bGVUZXh0LCBzb2xhckludGVuc2l0eUNvbnRyb2wsIHN1cmZhY2VBbGJlZG9Db250cm9sIF0sXHJcbiAgICAgIHNwYWNpbmc6IDI0XHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIGNvbnRlbnQsIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmdyZWVuaG91c2VFZmZlY3QucmVnaXN0ZXIoICdTdW5BbmRSZWZsZWN0aW9uQ29udHJvbCcsIFN1bkFuZFJlZmxlY3Rpb25Db250cm9sICk7XHJcbmV4cG9ydCBkZWZhdWx0IFN1bkFuZFJlZmxlY3Rpb25Db250cm9sOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxxQkFBcUIsTUFBTSw4Q0FBOEM7QUFDaEYsT0FBT0MsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsU0FBU0MsY0FBYyxRQUFRLHVDQUF1QztBQUN0RSxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUM5RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFFL0MsT0FBT0MsWUFBWSxNQUFNLHNDQUFzQztBQUUvRCxPQUFPQyxzQkFBc0IsTUFBTSx3Q0FBd0M7QUFDM0UsT0FBT0MseUJBQXlCLE1BQU0sMkNBQTJDO0FBQ2pGLE9BQU9DLGVBQWUsTUFBTSx1Q0FBdUM7QUFDbkUs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