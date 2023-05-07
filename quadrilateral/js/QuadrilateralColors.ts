// Copyright 2021-2023, University of Colorado Boulder

/**
 * Defines the colors for this sim.
 *
 * All simulations should have a Colors.js file, see https://github.com/phetsims/scenery-phet/issues/642.
 *
 * For static colors that are used in more than one place, add them here.
 *
 * For dynamic colors that can be controlled via colorProfileProperty.js, add instances of ProfileColorProperty here,
 * each of which is required to have a default color. Note that dynamic colors can be edited by running the sim from
 * phetmarks using the "Color Edit" mode.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import { Color, ProfileColorProperty } from '../../scenery/js/imports.js';
import quadrilateral from './quadrilateral.js';

const QuadrilateralColors = {

  // Background color for screens in this sim
  screenBackgroundColorProperty: new ProfileColorProperty( quadrilateral, 'background', {
    default: new Color( '#87CEEB' )
  } ),

  // Color for the grid lines in the play area
  gridLinesColorProperty: new ProfileColorProperty( quadrilateral, 'gridLines', {
    default: 'grey'
  } ),

  // Interior grid color in the play area
  gridFillColorProperty: new ProfileColorProperty( quadrilateral, 'gridFill', {
    default: 'white'
  } ),

  // Color for vertices and sides of the quadrilateral shape.
  quadrilateralShapeColorProperty: new ProfileColorProperty( quadrilateral, 'quadrilateralShape', {
    default: new Color( '#FFE657' )
  } ),

  // The color for the quadrilateral when you hit a "named" shape.
  quadrilateralNamedShapeColorProperty: new ProfileColorProperty( quadrilateral, 'quadrilateralNamedShape', {
    default: new Color( 255, 239, 189 )
  } ),

  // Color for strokes of the quadrilateral shape
  quadrilateralShapeStrokeColorProperty: new ProfileColorProperty( quadrilateral, 'quadrilateralShapeStroke', {
    default: 'black'
  } ),

  // Color for the dark segments of the corner guides
  cornerGuideDarkColorProperty: new ProfileColorProperty( quadrilateral, 'cornerGuideDark', {
    default: new Color( 100, 100, 100 )
  } ),

  // Color for the light segments of the corner guides
  cornerGuideLightColorProperty: new ProfileColorProperty( quadrilateral, 'cornerGuideLight', {
    default: 'white'
  } ),

  // Color for the stroke of shape markers (corner guides/unit length indicators)
  markersStrokeColorProperty: new ProfileColorProperty( quadrilateral, 'markersStroke', {
    default: 'black'
  } ),

  // Color for the stroke around right angle indicator
  rightAngleIndicatorStrokeColorProperty: new ProfileColorProperty( quadrilateral, 'rightAngleIndicatorStroke', {
    default: 'black'
  } ),

  // Color for the stroke for the diagonal guides
  diagonalGuidesStrokeColorProperty: new ProfileColorProperty( quadrilateral, 'diagonalGuideStroke', {
    default: '#BABABA'
  } ),

  // Fill color for panels in the UI.
  panelFillColorProperty: new ProfileColorProperty( quadrilateral, 'panelFillColor', {
    default: 'white'
  } ),
  panelStrokeColorProperty: new ProfileColorProperty( quadrilateral, 'panelStrokeColor', {
    default: 'black'
  } ),

  gridStrokeColorProperty: new ProfileColorProperty( quadrilateral, 'playAreaStrokeColor', {
    default: 'black'
  } ),

  // Color for the "Corner Labels" checkbox icon.
  visibilityIconsColorProperty: new ProfileColorProperty( quadrilateral, 'visibilityIconsColorProperty', {
    default: 'black'
  } ),

  // Fill for the "Reset Shape" button
  resetShapeButtonColorProperty: new ProfileColorProperty( quadrilateral, 'resetShapeButtonColor', {
    default: new Color( 'rgb(247, 151, 34)' )
  } ),

  // Color for general buttons in the ScreenView
  screenViewButtonColorProperty: new ProfileColorProperty( quadrilateral, 'screenViewButtonColor', {
    default: 'lightgrey'
  } ),

  // Stroke for the interaction cues around the quadrilateral
  interactionCueColorProperty: new ProfileColorProperty( quadrilateral, 'interactionCueColor', {
    default: new Color( 'blue' )
  } )
};

quadrilateral.register( 'QuadrilateralColors', QuadrilateralColors );
export default QuadrilateralColors;