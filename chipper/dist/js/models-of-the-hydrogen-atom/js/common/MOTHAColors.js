// Copyright 2019-2022, University of Colorado Boulder

/**
 * MOTHAColors defines the colors for this simulation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import PhetColorScheme from '../../../scenery-phet/js/PhetColorScheme.js';
import { Color, ProfileColorProperty } from '../../../scenery/js/imports.js';
import modelsOfTheHydrogenAtom from '../modelsOfTheHydrogenAtom.js';
const YELLOW = 'rgb( 235, 235, 0 )';
const MOTHAColors = {
  //TODO Should these be changeable? Why are these the same color?
  UV_COLOR: 'rgb( 160, 160, 160 )',
  IR_COLOR: 'rgb( 160, 160, 160 )',
  screenBackgroundColorProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'screenBackgroundColor', {
    default: 'black',
    projector: 'white'
  }),
  //------------------------------------------------------------------------------------------------------------------
  // Boxes
  //------------------------------------------------------------------------------------------------------------------

  boxOfHydrogenLightFillProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'boxOfHydrogenLightFill', {
    default: 'rgb( 249, 249, 249 )'
  }),
  boxOfHydrogenDarkFillProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'boxOfHydrogenDarkFill', {
    default: Color.grayColor(100)
  }),
  boxOfHydrogenStrokeProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'boxOfHydrogenStroke', {
    default: 'black'
  }),
  boxOfHydrogenSymbolColorProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'boxOfHydrogenSymbolColor', {
    default: 'black'
  }),
  zoomedInBoxFillProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'zoomedInBoxFill', {
    default: 'black',
    projector: 'white'
  }),
  zoomedInBoxStrokeProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'zoomedInBoxStroke', {
    default: 'white',
    projector: 'black'
  }),
  //------------------------------------------------------------------------------------------------------------------
  // Particles
  //------------------------------------------------------------------------------------------------------------------

  electronBaseColorProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'electronBaseColor', {
    default: 'rgb( 120, 120, 255 )'
  }),
  electronHighlightColorProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'electronHighlightColor', {
    default: 'rgb( 140, 140, 255 )'
  }),
  neutronBaseColorProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'neutronBaseColor', {
    default: 'rgb( 128, 128, 128 )'
  }),
  neutronHighlightColorProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'neutronHighlightColor', {
    default: 'rgb( 175, 175, 175 )'
  }),
  protonBaseColorProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'protonBaseColor', {
    default: PhetColorScheme.RED_COLORBLIND
  }),
  protonHighlightColorProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'protonHighlightColor', {
    default: 'rgb( 255, 130, 130 )'
  }),
  //------------------------------------------------------------------------------------------------------------------
  // Legend
  //------------------------------------------------------------------------------------------------------------------

  legendTitleFillProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'legendTitleFill', {
    default: YELLOW,
    projector: 'black'
  }),
  legendTextFillProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'legendTextFill', {
    default: 'white',
    projector: 'black'
  }),
  //------------------------------------------------------------------------------------------------------------------
  // Light
  //------------------------------------------------------------------------------------------------------------------

  lightModeRadioButtonFillProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'lightModeRadioButtonFill', {
    default: 'black',
    projector: 'white'
  }),
  lightModeRadioButtonSelectedStrokeProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'lightModeRadioButtonSelectedStroke', {
    default: YELLOW
  }),
  lightModeRadioButtonDeselectedStrokeProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'lightModeRadioButtonDeselectedStroke', {
    default: Color.grayColor(200)
  }),
  showAbsorptionWavelengthTextFillProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'showAbsorptionWavelengthTextFill', {
    default: 'white',
    projector: 'black'
  }),
  showAbsorptionWavelengthCheckboxFillProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'showAbsorptionWavelengthCheckboxFill', {
    default: 'black',
    projector: 'white'
  }),
  showAbsorptionWavelengthCheckboxStrokeProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'showAbsorptionWavelengthCheckboxStroke', {
    default: 'white',
    projector: 'black'
  }),
  beamStrokeProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'beamStroke', {
    default: 'transparent',
    projector: 'black'
  }),
  //------------------------------------------------------------------------------------------------------------------
  // Models panel
  //------------------------------------------------------------------------------------------------------------------

  switchTextFillProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'switchTextFill', {
    default: YELLOW,
    projector: 'black'
  }),
  modelsPanelFillProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'modelsPanelFill', {
    default: 'black',
    projector: 'white'
  }),
  modelsPanelStrokeProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'modelsPanelStroke', {
    default: Color.grayColor(180),
    projector: 'black'
  }),
  modelsRadioButtonTextFillProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'modelsRadioButtonTextFill', {
    default: 'white',
    projector: 'black'
  }),
  modelsRadioButtonFillProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'modelsRadioButtonFill', {
    default: 'black',
    projector: 'white'
  }),
  modelsRadioButtonSelectedStrokeProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'modelsRadioButtonSelectedStroke', {
    default: YELLOW
  }),
  modelsRadioButtonDeselectedStrokeProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'modelsRadioButtonDeselectedStroke', {
    default: Color.grayColor(200)
  }),
  continuumBarFillProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'continuumBarFill', {
    default: Color.grayColor(220)
  }),
  continuumBarTextFillProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'continuumBarTextFill', {
    default: 'black'
  }),
  timeControlRadioButtonFillProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'timeControlRadioButtonFill', {
    default: 'white',
    projector: 'black'
  }),
  //------------------------------------------------------------------------------------------------------------------
  // Spectrometer
  //------------------------------------------------------------------------------------------------------------------

  spectrometerTitleFillProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'spectrometerTitleFill', {
    default: YELLOW,
    projector: 'black'
  }),
  spectrometerSubtitleFillProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'spectrometerSubtitleFill', {
    default: 'white',
    projector: 'black'
  }),
  spectrometerAccordionBoxFillProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'spectrometerAccordionBoxFill', {
    default: Color.grayColor(80),
    projector: Color.grayColor(235)
  }),
  spectrometerAccordionBoxStrokeProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'spectrometerAccordionBoxStroke', {
    default: Color.grayColor(180),
    projector: 'black'
  }),
  spectrometerFillProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'spectrometerFill', {
    default: 'black',
    projector: 'white'
  }),
  spectrometerStrokeProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'spectrometerStroke', {
    default: Color.grayColor(117),
    projector: 'black'
  }),
  //------------------------------------------------------------------------------------------------------------------
  // Snapshots dialog
  //------------------------------------------------------------------------------------------------------------------

  snapshotsDialogFillProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'snapshotsDialogFill', {
    default: 'white'
  }),
  snapshotTextFillProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'snapshotTextFill', {
    default: 'white',
    projector: 'black'
  }),
  //------------------------------------------------------------------------------------------------------------------
  // Electron Energy Level
  //------------------------------------------------------------------------------------------------------------------

  electronEnergyLevelTitleFillProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'electronEnergyLevelTitleFill', {
    default: YELLOW,
    projector: 'black'
  }),
  electronEnergyLevelAccordionBoxFillProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'electronEnergyLevelAccordionBoxFill', {
    default: Color.grayColor(80),
    projector: Color.grayColor(235)
  }),
  electronEnergyLevelAccordionBoxStrokeProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'electronEnergyLevelAccordionBoxStroke', {
    default: Color.grayColor(180),
    projector: 'black'
  }),
  //------------------------------------------------------------------------------------------------------------------
  // Hydrogen Atom models
  //------------------------------------------------------------------------------------------------------------------

  billiardBallColorProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'billiardBallColor', {
    default: 'rgb( 196, 78, 14 )'
  }),
  billiardBallHighlightColorProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'billiardBallHighlightColor', {
    default: 'rgb( 255, 141, 21 )'
  }),
  deBroglieNegativeAmplitudeColorProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'deBroglieNegativeAmplitudeColor', {
    default: 'black'
  }),
  orbitStrokeProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'orbitStroke', {
    default: 'white',
    projector: 'black'
  }),
  stateDisplayFillProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'stateDisplayFill', {
    default: 'white',
    projector: 'black'
  }),
  //------------------------------------------------------------------------------------------------------------------
  // Miscellaneous
  //------------------------------------------------------------------------------------------------------------------

  pushButtonBaseColorProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'pushButtonBaseColor', {
    default: Color.grayColor(245)
  }),
  xzAxesColorProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'xzAxesColor', {
    default: 'white',
    projector: 'black'
  }),
  exciteButtonColorProperty: new ProfileColorProperty(modelsOfTheHydrogenAtom, 'exciteButtonColor', {
    default: PhetColorScheme.BUTTON_YELLOW
  })
};
modelsOfTheHydrogenAtom.register('MOTHAColors', MOTHAColors);
export default MOTHAColors;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGV0Q29sb3JTY2hlbWUiLCJDb2xvciIsIlByb2ZpbGVDb2xvclByb3BlcnR5IiwibW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20iLCJZRUxMT1ciLCJNT1RIQUNvbG9ycyIsIlVWX0NPTE9SIiwiSVJfQ09MT1IiLCJzY3JlZW5CYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsImRlZmF1bHQiLCJwcm9qZWN0b3IiLCJib3hPZkh5ZHJvZ2VuTGlnaHRGaWxsUHJvcGVydHkiLCJib3hPZkh5ZHJvZ2VuRGFya0ZpbGxQcm9wZXJ0eSIsImdyYXlDb2xvciIsImJveE9mSHlkcm9nZW5TdHJva2VQcm9wZXJ0eSIsImJveE9mSHlkcm9nZW5TeW1ib2xDb2xvclByb3BlcnR5Iiwiem9vbWVkSW5Cb3hGaWxsUHJvcGVydHkiLCJ6b29tZWRJbkJveFN0cm9rZVByb3BlcnR5IiwiZWxlY3Ryb25CYXNlQ29sb3JQcm9wZXJ0eSIsImVsZWN0cm9uSGlnaGxpZ2h0Q29sb3JQcm9wZXJ0eSIsIm5ldXRyb25CYXNlQ29sb3JQcm9wZXJ0eSIsIm5ldXRyb25IaWdobGlnaHRDb2xvclByb3BlcnR5IiwicHJvdG9uQmFzZUNvbG9yUHJvcGVydHkiLCJSRURfQ09MT1JCTElORCIsInByb3RvbkhpZ2hsaWdodENvbG9yUHJvcGVydHkiLCJsZWdlbmRUaXRsZUZpbGxQcm9wZXJ0eSIsImxlZ2VuZFRleHRGaWxsUHJvcGVydHkiLCJsaWdodE1vZGVSYWRpb0J1dHRvbkZpbGxQcm9wZXJ0eSIsImxpZ2h0TW9kZVJhZGlvQnV0dG9uU2VsZWN0ZWRTdHJva2VQcm9wZXJ0eSIsImxpZ2h0TW9kZVJhZGlvQnV0dG9uRGVzZWxlY3RlZFN0cm9rZVByb3BlcnR5Iiwic2hvd0Fic29ycHRpb25XYXZlbGVuZ3RoVGV4dEZpbGxQcm9wZXJ0eSIsInNob3dBYnNvcnB0aW9uV2F2ZWxlbmd0aENoZWNrYm94RmlsbFByb3BlcnR5Iiwic2hvd0Fic29ycHRpb25XYXZlbGVuZ3RoQ2hlY2tib3hTdHJva2VQcm9wZXJ0eSIsImJlYW1TdHJva2VQcm9wZXJ0eSIsInN3aXRjaFRleHRGaWxsUHJvcGVydHkiLCJtb2RlbHNQYW5lbEZpbGxQcm9wZXJ0eSIsIm1vZGVsc1BhbmVsU3Ryb2tlUHJvcGVydHkiLCJtb2RlbHNSYWRpb0J1dHRvblRleHRGaWxsUHJvcGVydHkiLCJtb2RlbHNSYWRpb0J1dHRvbkZpbGxQcm9wZXJ0eSIsIm1vZGVsc1JhZGlvQnV0dG9uU2VsZWN0ZWRTdHJva2VQcm9wZXJ0eSIsIm1vZGVsc1JhZGlvQnV0dG9uRGVzZWxlY3RlZFN0cm9rZVByb3BlcnR5IiwiY29udGludXVtQmFyRmlsbFByb3BlcnR5IiwiY29udGludXVtQmFyVGV4dEZpbGxQcm9wZXJ0eSIsInRpbWVDb250cm9sUmFkaW9CdXR0b25GaWxsUHJvcGVydHkiLCJzcGVjdHJvbWV0ZXJUaXRsZUZpbGxQcm9wZXJ0eSIsInNwZWN0cm9tZXRlclN1YnRpdGxlRmlsbFByb3BlcnR5Iiwic3BlY3Ryb21ldGVyQWNjb3JkaW9uQm94RmlsbFByb3BlcnR5Iiwic3BlY3Ryb21ldGVyQWNjb3JkaW9uQm94U3Ryb2tlUHJvcGVydHkiLCJzcGVjdHJvbWV0ZXJGaWxsUHJvcGVydHkiLCJzcGVjdHJvbWV0ZXJTdHJva2VQcm9wZXJ0eSIsInNuYXBzaG90c0RpYWxvZ0ZpbGxQcm9wZXJ0eSIsInNuYXBzaG90VGV4dEZpbGxQcm9wZXJ0eSIsImVsZWN0cm9uRW5lcmd5TGV2ZWxUaXRsZUZpbGxQcm9wZXJ0eSIsImVsZWN0cm9uRW5lcmd5TGV2ZWxBY2NvcmRpb25Cb3hGaWxsUHJvcGVydHkiLCJlbGVjdHJvbkVuZXJneUxldmVsQWNjb3JkaW9uQm94U3Ryb2tlUHJvcGVydHkiLCJiaWxsaWFyZEJhbGxDb2xvclByb3BlcnR5IiwiYmlsbGlhcmRCYWxsSGlnaGxpZ2h0Q29sb3JQcm9wZXJ0eSIsImRlQnJvZ2xpZU5lZ2F0aXZlQW1wbGl0dWRlQ29sb3JQcm9wZXJ0eSIsIm9yYml0U3Ryb2tlUHJvcGVydHkiLCJzdGF0ZURpc3BsYXlGaWxsUHJvcGVydHkiLCJwdXNoQnV0dG9uQmFzZUNvbG9yUHJvcGVydHkiLCJ4ekF4ZXNDb2xvclByb3BlcnR5IiwiZXhjaXRlQnV0dG9uQ29sb3JQcm9wZXJ0eSIsIkJVVFRPTl9ZRUxMT1ciLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1PVEhBQ29sb3JzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1PVEhBQ29sb3JzIGRlZmluZXMgdGhlIGNvbG9ycyBmb3IgdGhpcyBzaW11bGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQaGV0Q29sb3JTY2hlbWUgZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRDb2xvclNjaGVtZS5qcyc7XHJcbmltcG9ydCB7IENvbG9yLCBQcm9maWxlQ29sb3JQcm9wZXJ0eSB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSBmcm9tICcuLi9tb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbS5qcyc7XHJcblxyXG5jb25zdCBZRUxMT1cgPSAncmdiKCAyMzUsIDIzNSwgMCApJztcclxuXHJcbmNvbnN0IE1PVEhBQ29sb3JzID0ge1xyXG5cclxuICAvL1RPRE8gU2hvdWxkIHRoZXNlIGJlIGNoYW5nZWFibGU/IFdoeSBhcmUgdGhlc2UgdGhlIHNhbWUgY29sb3I/XHJcbiAgVVZfQ09MT1I6ICdyZ2IoIDE2MCwgMTYwLCAxNjAgKScsXHJcbiAgSVJfQ09MT1I6ICdyZ2IoIDE2MCwgMTYwLCAxNjAgKScsXHJcblxyXG4gIHNjcmVlbkJhY2tncm91bmRDb2xvclByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIG1vZGVsc09mVGhlSHlkcm9nZW5BdG9tLCAnc2NyZWVuQmFja2dyb3VuZENvbG9yJywge1xyXG4gICAgZGVmYXVsdDogJ2JsYWNrJyxcclxuICAgIHByb2plY3RvcjogJ3doaXRlJ1xyXG4gIH0gKSxcclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBCb3hlc1xyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIGJveE9mSHlkcm9nZW5MaWdodEZpbGxQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSwgJ2JveE9mSHlkcm9nZW5MaWdodEZpbGwnLCB7XHJcbiAgICBkZWZhdWx0OiAncmdiKCAyNDksIDI0OSwgMjQ5ICknXHJcbiAgfSApLFxyXG5cclxuICBib3hPZkh5ZHJvZ2VuRGFya0ZpbGxQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSwgJ2JveE9mSHlkcm9nZW5EYXJrRmlsbCcsIHtcclxuICAgIGRlZmF1bHQ6IENvbG9yLmdyYXlDb2xvciggMTAwIClcclxuICB9ICksXHJcblxyXG4gIGJveE9mSHlkcm9nZW5TdHJva2VQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSwgJ2JveE9mSHlkcm9nZW5TdHJva2UnLCB7XHJcbiAgICBkZWZhdWx0OiAnYmxhY2snXHJcbiAgfSApLFxyXG5cclxuICBib3hPZkh5ZHJvZ2VuU3ltYm9sQ29sb3JQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSwgJ2JveE9mSHlkcm9nZW5TeW1ib2xDb2xvcicsIHtcclxuICAgIGRlZmF1bHQ6ICdibGFjaydcclxuICB9ICksXHJcblxyXG4gIHpvb21lZEluQm94RmlsbFByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIG1vZGVsc09mVGhlSHlkcm9nZW5BdG9tLCAnem9vbWVkSW5Cb3hGaWxsJywge1xyXG4gICAgZGVmYXVsdDogJ2JsYWNrJyxcclxuICAgIHByb2plY3RvcjogJ3doaXRlJ1xyXG4gIH0gKSxcclxuXHJcbiAgem9vbWVkSW5Cb3hTdHJva2VQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSwgJ3pvb21lZEluQm94U3Ryb2tlJywge1xyXG4gICAgZGVmYXVsdDogJ3doaXRlJyxcclxuICAgIHByb2plY3RvcjogJ2JsYWNrJ1xyXG4gIH0gKSxcclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBQYXJ0aWNsZXNcclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICBlbGVjdHJvbkJhc2VDb2xvclByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIG1vZGVsc09mVGhlSHlkcm9nZW5BdG9tLCAnZWxlY3Ryb25CYXNlQ29sb3InLCB7XHJcbiAgICBkZWZhdWx0OiAncmdiKCAxMjAsIDEyMCwgMjU1ICknXHJcbiAgfSApLFxyXG5cclxuICBlbGVjdHJvbkhpZ2hsaWdodENvbG9yUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20sICdlbGVjdHJvbkhpZ2hsaWdodENvbG9yJywge1xyXG4gICAgZGVmYXVsdDogJ3JnYiggMTQwLCAxNDAsIDI1NSApJ1xyXG4gIH0gKSxcclxuXHJcbiAgbmV1dHJvbkJhc2VDb2xvclByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIG1vZGVsc09mVGhlSHlkcm9nZW5BdG9tLCAnbmV1dHJvbkJhc2VDb2xvcicsIHtcclxuICAgIGRlZmF1bHQ6ICdyZ2IoIDEyOCwgMTI4LCAxMjggKSdcclxuICB9ICksXHJcblxyXG4gIG5ldXRyb25IaWdobGlnaHRDb2xvclByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIG1vZGVsc09mVGhlSHlkcm9nZW5BdG9tLCAnbmV1dHJvbkhpZ2hsaWdodENvbG9yJywge1xyXG4gICAgZGVmYXVsdDogJ3JnYiggMTc1LCAxNzUsIDE3NSApJ1xyXG4gIH0gKSxcclxuXHJcbiAgcHJvdG9uQmFzZUNvbG9yUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20sICdwcm90b25CYXNlQ29sb3InLCB7XHJcbiAgICBkZWZhdWx0OiBQaGV0Q29sb3JTY2hlbWUuUkVEX0NPTE9SQkxJTkRcclxuICB9ICksXHJcblxyXG4gIHByb3RvbkhpZ2hsaWdodENvbG9yUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20sICdwcm90b25IaWdobGlnaHRDb2xvcicsIHtcclxuICAgIGRlZmF1bHQ6ICdyZ2IoIDI1NSwgMTMwLCAxMzAgKSdcclxuICB9ICksXHJcblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gTGVnZW5kXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgbGVnZW5kVGl0bGVGaWxsUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20sICdsZWdlbmRUaXRsZUZpbGwnLCB7XHJcbiAgICBkZWZhdWx0OiBZRUxMT1csXHJcbiAgICBwcm9qZWN0b3I6ICdibGFjaydcclxuICB9ICksXHJcblxyXG4gIGxlZ2VuZFRleHRGaWxsUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20sICdsZWdlbmRUZXh0RmlsbCcsIHtcclxuICAgIGRlZmF1bHQ6ICd3aGl0ZScsXHJcbiAgICBwcm9qZWN0b3I6ICdibGFjaydcclxuICB9ICksXHJcblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gTGlnaHRcclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICBsaWdodE1vZGVSYWRpb0J1dHRvbkZpbGxQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSwgJ2xpZ2h0TW9kZVJhZGlvQnV0dG9uRmlsbCcsIHtcclxuICAgIGRlZmF1bHQ6ICdibGFjaycsXHJcbiAgICBwcm9qZWN0b3I6ICd3aGl0ZSdcclxuICB9ICksXHJcblxyXG4gIGxpZ2h0TW9kZVJhZGlvQnV0dG9uU2VsZWN0ZWRTdHJva2VQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSwgJ2xpZ2h0TW9kZVJhZGlvQnV0dG9uU2VsZWN0ZWRTdHJva2UnLCB7XHJcbiAgICBkZWZhdWx0OiBZRUxMT1dcclxuICB9ICksXHJcblxyXG4gIGxpZ2h0TW9kZVJhZGlvQnV0dG9uRGVzZWxlY3RlZFN0cm9rZVByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIG1vZGVsc09mVGhlSHlkcm9nZW5BdG9tLCAnbGlnaHRNb2RlUmFkaW9CdXR0b25EZXNlbGVjdGVkU3Ryb2tlJywge1xyXG4gICAgZGVmYXVsdDogQ29sb3IuZ3JheUNvbG9yKCAyMDAgKVxyXG4gIH0gKSxcclxuXHJcbiAgc2hvd0Fic29ycHRpb25XYXZlbGVuZ3RoVGV4dEZpbGxQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSwgJ3Nob3dBYnNvcnB0aW9uV2F2ZWxlbmd0aFRleHRGaWxsJywge1xyXG4gICAgZGVmYXVsdDogJ3doaXRlJyxcclxuICAgIHByb2plY3RvcjogJ2JsYWNrJ1xyXG4gIH0gKSxcclxuXHJcbiAgc2hvd0Fic29ycHRpb25XYXZlbGVuZ3RoQ2hlY2tib3hGaWxsUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20sICdzaG93QWJzb3JwdGlvbldhdmVsZW5ndGhDaGVja2JveEZpbGwnLCB7XHJcbiAgICBkZWZhdWx0OiAnYmxhY2snLFxyXG4gICAgcHJvamVjdG9yOiAnd2hpdGUnXHJcbiAgfSApLFxyXG5cclxuICBzaG93QWJzb3JwdGlvbldhdmVsZW5ndGhDaGVja2JveFN0cm9rZVByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIG1vZGVsc09mVGhlSHlkcm9nZW5BdG9tLCAnc2hvd0Fic29ycHRpb25XYXZlbGVuZ3RoQ2hlY2tib3hTdHJva2UnLCB7XHJcbiAgICBkZWZhdWx0OiAnd2hpdGUnLFxyXG4gICAgcHJvamVjdG9yOiAnYmxhY2snXHJcbiAgfSApLFxyXG5cclxuICBiZWFtU3Ryb2tlUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20sICdiZWFtU3Ryb2tlJywge1xyXG4gICAgZGVmYXVsdDogJ3RyYW5zcGFyZW50JyxcclxuICAgIHByb2plY3RvcjogJ2JsYWNrJ1xyXG4gIH0gKSxcclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBNb2RlbHMgcGFuZWxcclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICBzd2l0Y2hUZXh0RmlsbFByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIG1vZGVsc09mVGhlSHlkcm9nZW5BdG9tLCAnc3dpdGNoVGV4dEZpbGwnLCB7XHJcbiAgICBkZWZhdWx0OiBZRUxMT1csXHJcbiAgICBwcm9qZWN0b3I6ICdibGFjaydcclxuICB9ICksXHJcblxyXG4gIG1vZGVsc1BhbmVsRmlsbFByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIG1vZGVsc09mVGhlSHlkcm9nZW5BdG9tLCAnbW9kZWxzUGFuZWxGaWxsJywge1xyXG4gICAgZGVmYXVsdDogJ2JsYWNrJyxcclxuICAgIHByb2plY3RvcjogJ3doaXRlJ1xyXG4gIH0gKSxcclxuXHJcbiAgbW9kZWxzUGFuZWxTdHJva2VQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSwgJ21vZGVsc1BhbmVsU3Ryb2tlJywge1xyXG4gICAgZGVmYXVsdDogQ29sb3IuZ3JheUNvbG9yKCAxODAgKSxcclxuICAgIHByb2plY3RvcjogJ2JsYWNrJ1xyXG4gIH0gKSxcclxuXHJcbiAgbW9kZWxzUmFkaW9CdXR0b25UZXh0RmlsbFByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIG1vZGVsc09mVGhlSHlkcm9nZW5BdG9tLCAnbW9kZWxzUmFkaW9CdXR0b25UZXh0RmlsbCcsIHtcclxuICAgIGRlZmF1bHQ6ICd3aGl0ZScsXHJcbiAgICBwcm9qZWN0b3I6ICdibGFjaydcclxuICB9ICksXHJcblxyXG4gIG1vZGVsc1JhZGlvQnV0dG9uRmlsbFByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIG1vZGVsc09mVGhlSHlkcm9nZW5BdG9tLCAnbW9kZWxzUmFkaW9CdXR0b25GaWxsJywge1xyXG4gICAgZGVmYXVsdDogJ2JsYWNrJyxcclxuICAgIHByb2plY3RvcjogJ3doaXRlJ1xyXG4gIH0gKSxcclxuXHJcbiAgbW9kZWxzUmFkaW9CdXR0b25TZWxlY3RlZFN0cm9rZVByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIG1vZGVsc09mVGhlSHlkcm9nZW5BdG9tLCAnbW9kZWxzUmFkaW9CdXR0b25TZWxlY3RlZFN0cm9rZScsIHtcclxuICAgIGRlZmF1bHQ6IFlFTExPV1xyXG4gIH0gKSxcclxuXHJcbiAgbW9kZWxzUmFkaW9CdXR0b25EZXNlbGVjdGVkU3Ryb2tlUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20sICdtb2RlbHNSYWRpb0J1dHRvbkRlc2VsZWN0ZWRTdHJva2UnLCB7XHJcbiAgICBkZWZhdWx0OiBDb2xvci5ncmF5Q29sb3IoIDIwMCApXHJcbiAgfSApLFxyXG5cclxuICBjb250aW51dW1CYXJGaWxsUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20sICdjb250aW51dW1CYXJGaWxsJywge1xyXG4gICAgZGVmYXVsdDogQ29sb3IuZ3JheUNvbG9yKCAyMjAgKVxyXG4gIH0gKSxcclxuXHJcbiAgY29udGludXVtQmFyVGV4dEZpbGxQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSwgJ2NvbnRpbnV1bUJhclRleHRGaWxsJywge1xyXG4gICAgZGVmYXVsdDogJ2JsYWNrJ1xyXG4gIH0gKSxcclxuXHJcbiAgdGltZUNvbnRyb2xSYWRpb0J1dHRvbkZpbGxQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSwgJ3RpbWVDb250cm9sUmFkaW9CdXR0b25GaWxsJywge1xyXG4gICAgZGVmYXVsdDogJ3doaXRlJyxcclxuICAgIHByb2plY3RvcjogJ2JsYWNrJ1xyXG4gIH0gKSxcclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBTcGVjdHJvbWV0ZXJcclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICBzcGVjdHJvbWV0ZXJUaXRsZUZpbGxQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSwgJ3NwZWN0cm9tZXRlclRpdGxlRmlsbCcsIHtcclxuICAgIGRlZmF1bHQ6IFlFTExPVyxcclxuICAgIHByb2plY3RvcjogJ2JsYWNrJ1xyXG4gIH0gKSxcclxuXHJcbiAgc3BlY3Ryb21ldGVyU3VidGl0bGVGaWxsUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20sICdzcGVjdHJvbWV0ZXJTdWJ0aXRsZUZpbGwnLCB7XHJcbiAgICBkZWZhdWx0OiAnd2hpdGUnLFxyXG4gICAgcHJvamVjdG9yOiAnYmxhY2snXHJcbiAgfSApLFxyXG5cclxuICBzcGVjdHJvbWV0ZXJBY2NvcmRpb25Cb3hGaWxsUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20sICdzcGVjdHJvbWV0ZXJBY2NvcmRpb25Cb3hGaWxsJywge1xyXG4gICAgZGVmYXVsdDogQ29sb3IuZ3JheUNvbG9yKCA4MCApLFxyXG4gICAgcHJvamVjdG9yOiBDb2xvci5ncmF5Q29sb3IoIDIzNSApXHJcbiAgfSApLFxyXG5cclxuICBzcGVjdHJvbWV0ZXJBY2NvcmRpb25Cb3hTdHJva2VQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSwgJ3NwZWN0cm9tZXRlckFjY29yZGlvbkJveFN0cm9rZScsIHtcclxuICAgIGRlZmF1bHQ6IENvbG9yLmdyYXlDb2xvciggMTgwICksXHJcbiAgICBwcm9qZWN0b3I6ICdibGFjaydcclxuICB9ICksXHJcblxyXG4gIHNwZWN0cm9tZXRlckZpbGxQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSwgJ3NwZWN0cm9tZXRlckZpbGwnLCB7XHJcbiAgICBkZWZhdWx0OiAnYmxhY2snLFxyXG4gICAgcHJvamVjdG9yOiAnd2hpdGUnXHJcbiAgfSApLFxyXG5cclxuICBzcGVjdHJvbWV0ZXJTdHJva2VQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSwgJ3NwZWN0cm9tZXRlclN0cm9rZScsIHtcclxuICAgIGRlZmF1bHQ6IENvbG9yLmdyYXlDb2xvciggMTE3ICksXHJcbiAgICBwcm9qZWN0b3I6ICdibGFjaydcclxuICB9ICksXHJcblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gU25hcHNob3RzIGRpYWxvZ1xyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIHNuYXBzaG90c0RpYWxvZ0ZpbGxQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSwgJ3NuYXBzaG90c0RpYWxvZ0ZpbGwnLCB7XHJcbiAgICBkZWZhdWx0OiAnd2hpdGUnXHJcbiAgfSApLFxyXG5cclxuICBzbmFwc2hvdFRleHRGaWxsUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20sICdzbmFwc2hvdFRleHRGaWxsJywge1xyXG4gICAgZGVmYXVsdDogJ3doaXRlJyxcclxuICAgIHByb2plY3RvcjogJ2JsYWNrJ1xyXG4gIH0gKSxcclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBFbGVjdHJvbiBFbmVyZ3kgTGV2ZWxcclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICBlbGVjdHJvbkVuZXJneUxldmVsVGl0bGVGaWxsUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20sICdlbGVjdHJvbkVuZXJneUxldmVsVGl0bGVGaWxsJywge1xyXG4gICAgZGVmYXVsdDogWUVMTE9XLFxyXG4gICAgcHJvamVjdG9yOiAnYmxhY2snXHJcbiAgfSApLFxyXG5cclxuICBlbGVjdHJvbkVuZXJneUxldmVsQWNjb3JkaW9uQm94RmlsbFByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIG1vZGVsc09mVGhlSHlkcm9nZW5BdG9tLCAnZWxlY3Ryb25FbmVyZ3lMZXZlbEFjY29yZGlvbkJveEZpbGwnLCB7XHJcbiAgICBkZWZhdWx0OiBDb2xvci5ncmF5Q29sb3IoIDgwICksXHJcbiAgICBwcm9qZWN0b3I6IENvbG9yLmdyYXlDb2xvciggMjM1IClcclxuICB9ICksXHJcblxyXG4gIGVsZWN0cm9uRW5lcmd5TGV2ZWxBY2NvcmRpb25Cb3hTdHJva2VQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSwgJ2VsZWN0cm9uRW5lcmd5TGV2ZWxBY2NvcmRpb25Cb3hTdHJva2UnLCB7XHJcbiAgICBkZWZhdWx0OiBDb2xvci5ncmF5Q29sb3IoIDE4MCApLFxyXG4gICAgcHJvamVjdG9yOiAnYmxhY2snXHJcbiAgfSApLFxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIEh5ZHJvZ2VuIEF0b20gbW9kZWxzXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgYmlsbGlhcmRCYWxsQ29sb3JQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSwgJ2JpbGxpYXJkQmFsbENvbG9yJywge1xyXG4gICAgZGVmYXVsdDogJ3JnYiggMTk2LCA3OCwgMTQgKSdcclxuICB9ICksXHJcblxyXG4gIGJpbGxpYXJkQmFsbEhpZ2hsaWdodENvbG9yUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20sICdiaWxsaWFyZEJhbGxIaWdobGlnaHRDb2xvcicsIHtcclxuICAgIGRlZmF1bHQ6ICdyZ2IoIDI1NSwgMTQxLCAyMSApJ1xyXG4gIH0gKSxcclxuXHJcbiAgZGVCcm9nbGllTmVnYXRpdmVBbXBsaXR1ZGVDb2xvclByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIG1vZGVsc09mVGhlSHlkcm9nZW5BdG9tLCAnZGVCcm9nbGllTmVnYXRpdmVBbXBsaXR1ZGVDb2xvcicsIHtcclxuICAgIGRlZmF1bHQ6ICdibGFjaydcclxuICB9ICksXHJcblxyXG4gIG9yYml0U3Ryb2tlUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20sICdvcmJpdFN0cm9rZScsIHtcclxuICAgIGRlZmF1bHQ6ICd3aGl0ZScsXHJcbiAgICBwcm9qZWN0b3I6ICdibGFjaydcclxuICB9ICksXHJcblxyXG4gIHN0YXRlRGlzcGxheUZpbGxQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSwgJ3N0YXRlRGlzcGxheUZpbGwnLCB7XHJcbiAgICBkZWZhdWx0OiAnd2hpdGUnLFxyXG4gICAgcHJvamVjdG9yOiAnYmxhY2snXHJcbiAgfSApLFxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIE1pc2NlbGxhbmVvdXNcclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICBwdXNoQnV0dG9uQmFzZUNvbG9yUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20sICdwdXNoQnV0dG9uQmFzZUNvbG9yJywge1xyXG4gICAgZGVmYXVsdDogQ29sb3IuZ3JheUNvbG9yKCAyNDUgKVxyXG4gIH0gKSxcclxuXHJcbiAgeHpBeGVzQ29sb3JQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSwgJ3h6QXhlc0NvbG9yJywge1xyXG4gICAgZGVmYXVsdDogJ3doaXRlJyxcclxuICAgIHByb2plY3RvcjogJ2JsYWNrJ1xyXG4gIH0gKSxcclxuXHJcbiAgZXhjaXRlQnV0dG9uQ29sb3JQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSwgJ2V4Y2l0ZUJ1dHRvbkNvbG9yJywge1xyXG4gICAgZGVmYXVsdDogUGhldENvbG9yU2NoZW1lLkJVVFRPTl9ZRUxMT1dcclxuICB9IClcclxufTtcclxuXHJcbm1vZGVsc09mVGhlSHlkcm9nZW5BdG9tLnJlZ2lzdGVyKCAnTU9USEFDb2xvcnMnLCBNT1RIQUNvbG9ycyApO1xyXG5leHBvcnQgZGVmYXVsdCBNT1RIQUNvbG9yczsiXSwi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