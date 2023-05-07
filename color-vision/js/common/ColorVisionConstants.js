// Copyright 2014-2022, University of Colorado Boulder

/**
 * Constants used throughout the simulation.
 * @author Aaron Davis
 */

import colorVision from '../colorVision.js';

const ColorVisionConstants = {

  // height of all photonBeamNodes from both screens
  BEAM_HEIGHT: 130,

  // many nodes are positioned with this offset from layoutBounds.centerY
  CENTER_Y_OFFSET: -20,

  // x-velocity of photons, in ScreenView pixels / second
  // Note: The photons in color vision move at a constant x-velocity, not a constant speed.
  // The y-velocity varies only slightly to accommodate the fanning of the photons,
  // so it is not really discernible when looking at the simulation.
  X_VELOCITY: -240,

  // amount of fanning of photons
  FAN_FACTOR: 1.05,
  SLIDER_BORDER_STROKE: '#c0b9b9', // gray
  HOME_SCREEN_ICON_OPTIONS: { fill: 'rgb(20,20,20)' },
  NAVBAR_ICON_OPTIONS: { fill: 'black' },

  // options common to the radio buttons groups in both SingleBulbScreenView and HeadNode
  RADIO_BUTTON_GROUP_OPTIONS: {
    orientation: 'horizontal',
    spacing: 13,
    radioButtonOptions: {
      baseColor: 'black',
      buttonAppearanceStrategyOptions: {
        selectedStroke: 'yellow',
        deselectedStroke: 'yellow',
        selectedLineWidth: 1.3,
        deselectedLineWidth: 0.6
      }
    }
  }
};

colorVision.register( 'ColorVisionConstants', ColorVisionConstants );

export default ColorVisionConstants;