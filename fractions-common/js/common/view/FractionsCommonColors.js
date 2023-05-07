// Copyright 2018-2022, University of Colorado Boulder

/**
 * Colors for the fractions simulations.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import { Color, ProfileColorProperty } from '../../../../scenery/js/imports.js';
import fractionsCommon from '../../fractionsCommon.js';

// Colors from the Java version
const LIGHT_RED = new Color( 233, 69, 69 );
const LIGHT_BLUE = new Color( 87, 182, 221 );
const LIGHT_GREEN = new Color( 140, 198, 63 );
const LIGHT_ORANGE = Color.ORANGE;
const LIGHT_PINK = new Color( 255, 112, 213 );

// Initial colors for each profile, by string key. Only profile currently is default (still helpful for making color
// tweaks with the top-level files)
const FractionsCommonColors = {
  introScreenBackgroundProperty: new ProfileColorProperty( fractionsCommon, 'introScreenBackground', { default: Color.WHITE } ),
  otherScreenBackgroundProperty: new ProfileColorProperty( fractionsCommon, 'otherScreenBackground', { default: new Color( 235, 251, 251 ) } ),

  introBucketBackgroundProperty: new ProfileColorProperty( fractionsCommon, 'introBucketBackground', { default: new Color( '#8eb7f2' ) } ),
  introContainerActiveBorderProperty: new ProfileColorProperty( fractionsCommon, 'introContainerActiveBorder', { default: new Color( 'black' ) } ),
  introContainerInactiveBorderProperty: new ProfileColorProperty( fractionsCommon, 'introContainerInactiveBorder', { default: new Color( 'gray' ) } ),
  introContainerBackgroundProperty: new ProfileColorProperty( fractionsCommon, 'introContainerBackground', { default: Color.WHITE } ),
  introNumberLineHighlightProperty: new ProfileColorProperty( fractionsCommon, 'introNumberLineHighlight', { default: Color.YELLOW } ),
  introCircleFillProperty: new ProfileColorProperty( fractionsCommon, 'introCircleFill', { default: new Color( 140, 198, 61 ) } ),
  introHorizontalBarProperty: new ProfileColorProperty( fractionsCommon, 'introHorizontalBar', { default: new Color( '#ED4344' ) } ),
  introVerticalBarProperty: new ProfileColorProperty( fractionsCommon, 'introVerticalBar', { default: new Color( '#FFE600' ) } ),
  introShapeShadowProperty: new ProfileColorProperty( fractionsCommon, 'introShapeShadow', { default: new Color( 0, 0, 0, 0.5 ) } ),
  emptyBeakerProperty: new ProfileColorProperty( fractionsCommon, 'emptyBeaker', { default: new Color( 150, 150, 150, 0.1 ) } ),
  waterProperty: new ProfileColorProperty( fractionsCommon, 'water', { default: new Color( 30, 163, 255, 0.8 ) } ),
  beakerShineProperty: new ProfileColorProperty( fractionsCommon, 'beakerShine', { default: new Color( 255, 255, 255, 0.4 ) } ),

  mixedFractionStrongProperty: new ProfileColorProperty( fractionsCommon, 'mixedFractionStrong', { default: Color.BLACK } ),
  mixedFractionWeakProperty: new ProfileColorProperty( fractionsCommon, 'mixedFractionWeak', { default: new Color( 170, 170, 170 ) } ),

  equalityLabColorProperty: new ProfileColorProperty( fractionsCommon, 'equalityLabColor', { default: new Color( 254, 112, 212 ) } ),
  equalityLabWaterProperty: new ProfileColorProperty( fractionsCommon, 'equalityLabWater', { default: new Color( 254, 112, 212, 0.8 ) } ),

  introPanelBackgroundProperty: new ProfileColorProperty( fractionsCommon, 'introPanelBackground', { default: new Color( 237, 237, 237 ) } ),
  shapePieceStrokeProperty: new ProfileColorProperty( fractionsCommon, 'shapePieceStroke', { default: Color.BLACK } ),

  labPieFillProperty: new ProfileColorProperty( fractionsCommon, 'labPieFill', { default: LIGHT_RED } ),
  labBarFillProperty: new ProfileColorProperty( fractionsCommon, 'labBarFill', { default: LIGHT_BLUE } ),
  shapeShadowProperty: new ProfileColorProperty( fractionsCommon, 'shapeShadow', { default: new Color( 0, 0, 0, 0.5 ) } ),

  shapeStackFillProperty: new ProfileColorProperty( fractionsCommon, 'shapeStackFill', { default: Color.WHITE } ),
  shapeStackStrokeProperty: new ProfileColorProperty( fractionsCommon, 'shapeStackStroke', { default: Color.BLACK } ),
  shapeStackSeparatorStrokeProperty: new ProfileColorProperty( fractionsCommon, 'shapeStackSeparatorStroke', { default: new Color( 170, 170, 170 ) } ),

  shapeContainerFillProperty: new ProfileColorProperty( fractionsCommon, 'shapeContainerFill', { default: Color.WHITE } ),
  shapeContainerStrokeProperty: new ProfileColorProperty( fractionsCommon, 'shapeContainerStroke', { default: Color.BLACK } ),
  shapeContainerPartitionProperty: new ProfileColorProperty( fractionsCommon, 'shapeContainerPartition', { default: new Color( 'rgba(0,0,0,0.5)' ) } ),
  shapeContainerPartitionOffsetProperty: new ProfileColorProperty( fractionsCommon, 'shapeContainerPartitionOffset', { default: new Color( 'rgba(255,255,255,0.7)' ) } ),

  numberStrokeProperty: new ProfileColorProperty( fractionsCommon, 'numberStroke', { default: Color.BLACK } ),
  numberFillProperty: new ProfileColorProperty( fractionsCommon, 'numberFill', { default: Color.WHITE } ),
  numberTextFillProperty: new ProfileColorProperty( fractionsCommon, 'numberTextFill', { default: Color.BLACK } ),
  numberOutlineProperty: new ProfileColorProperty( fractionsCommon, 'numberOutline', { default: Color.RED } ),
  numberFractionLineProperty: new ProfileColorProperty( fractionsCommon, 'numberFractionLine', { default: Color.BLACK } ),
  numberNotAllowedProperty: new ProfileColorProperty( fractionsCommon, 'numberNotAllowed', { default: Color.RED } ),

  radioStrokeProperty: new ProfileColorProperty( fractionsCommon, 'radioStroke', { default: Color.BLACK } ),
  radioBaseProperty: new ProfileColorProperty( fractionsCommon, 'radioBase', { default: Color.WHITE } ),

  yellowRoundArrowButtonProperty: new ProfileColorProperty( fractionsCommon, 'yellowRoundArrowButton', { default: new Color( '#fefd53' ) } ),
  greenRoundArrowButtonProperty: new ProfileColorProperty( fractionsCommon, 'greenRoundArrowButton', { default: new Color( 134, 194, 51 ) } ),
  redRoundArrowButtonProperty: new ProfileColorProperty( fractionsCommon, 'redRoundArrowButton', { default: new Color( 195, 71, 26 ) } ),

  shapePartitionBackgroundProperty: new ProfileColorProperty( fractionsCommon, 'shapePartitionBackground', { default: Color.WHITE } ),
  shapePartitionBorderProperty: new ProfileColorProperty( fractionsCommon, 'shapePartitionBorder', { default: Color.BLACK } ),

  shapeGreenProperty: new ProfileColorProperty( fractionsCommon, 'shapeGreen', { default: LIGHT_GREEN } ),
  shapeBlueProperty: new ProfileColorProperty( fractionsCommon, 'shapeBlue', { default: LIGHT_BLUE } ),
  shapeRedProperty: new ProfileColorProperty( fractionsCommon, 'shapeRed', { default: LIGHT_RED } ),
  shapeOrangeProperty: new ProfileColorProperty( fractionsCommon, 'shapeOrange', { default: LIGHT_ORANGE } ),
  shapePinkProperty: new ProfileColorProperty( fractionsCommon, 'shapePink', { default: LIGHT_PINK } ),
  shapeMagentaProperty: new ProfileColorProperty( fractionsCommon, 'shapeMagenta', { default: new Color( 'magenta' ) } ),
  shapeYellowProperty: new ProfileColorProperty( fractionsCommon, 'shapeYellow', { default: PhetColorScheme.PHET_LOGO_YELLOW } ),
  shapeLighterPinkProperty: new ProfileColorProperty( fractionsCommon, 'shapeLighterPink', { default: new Color( 255, 175, 175 ) } ),
  shapeStrongGreenProperty: new ProfileColorProperty( fractionsCommon, 'shapeStrongGreen', { default: new Color( 0, 2550, 0 ) } ),

  level1Property: new ProfileColorProperty( fractionsCommon, 'level1', { default: LIGHT_RED } ),
  level2Property: new ProfileColorProperty( fractionsCommon, 'level2', { default: LIGHT_BLUE } ),
  level3Property: new ProfileColorProperty( fractionsCommon, 'level3', { default: LIGHT_GREEN } ),
  level4Property: new ProfileColorProperty( fractionsCommon, 'level4', { default: LIGHT_ORANGE } ),
  level5Property: new ProfileColorProperty( fractionsCommon, 'level5', { default: Color.MAGENTA } ),
  level6Property: new ProfileColorProperty( fractionsCommon, 'level6', { default: Color.YELLOW } ),
  level7Property: new ProfileColorProperty( fractionsCommon, 'level7', { default: Color.CYAN } ),
  level8Property: new ProfileColorProperty( fractionsCommon, 'level8', { default: new Color( 146, 54, 173 ) } ),
  level9Property: new ProfileColorProperty( fractionsCommon, 'level9', { default: new Color( 255, 112, 213 ) } ),
  level10Property: new ProfileColorProperty( fractionsCommon, 'level10', { default: new Color( 45, 165, 59 ) } ),

  collectionBackgroundProperty: new ProfileColorProperty( fractionsCommon, 'collectionBackground', { default: Color.WHITE } ),
  collectionBorderProperty: new ProfileColorProperty( fractionsCommon, 'collectionBorder', { default: Color.BLACK } ),

  matchingLevelBackgroundProperty: new ProfileColorProperty( fractionsCommon, 'matchingLevelBackground', { default: new Color( 242, 242, 242 ) } ),
  matchingHomeIconBackgroundProperty: new ProfileColorProperty( fractionsCommon, 'matchingHomeIconBackground', { default: Color.WHITE } ),
  matchingNavbarIconBackgroundProperty: new ProfileColorProperty( fractionsCommon, 'matchingNavbarIconBackground', { default: Color.BLACK } ),
  matchingTargetBackgroundProperty: new ProfileColorProperty( fractionsCommon, 'matchingTargetBackground', { default: new Color( '#C0C0C0' ) } ),
  matchingSourceBackgroundProperty: new ProfileColorProperty( fractionsCommon, 'matchingSourceBackground', { default: Color.WHITE } ),
  matchingSourceBorderProperty: new ProfileColorProperty( fractionsCommon, 'matchingSourceBorder', { default: new Color( '#C0C0C0' ) } ),

  matchingCheckButtonProperty: new ProfileColorProperty( fractionsCommon, 'matchingCheckButton', { default: new Color( '#FFD63F' ) } ),
  matchingOkButtonProperty: new ProfileColorProperty( fractionsCommon, 'matchingOkButton', { default: new Color( '#44FF44' ) } ),
  matchingTryAgainButtonProperty: new ProfileColorProperty( fractionsCommon, 'matchingTryAgainButton', { default: new Color( '#FF7C3B' ) } ),
  matchingShowAnswerButtonProperty: new ProfileColorProperty( fractionsCommon, 'matchingShowAnswerButton', { default: new Color( '#FF7C3B' ) } )
};

fractionsCommon.register( 'FractionsCommonColors', FractionsCommonColors );

export default FractionsCommonColors;