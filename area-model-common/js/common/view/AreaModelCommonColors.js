// Copyright 2017-2022, University of Colorado Boulder

/**
 * Colors for the Area Model simulations.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import { Color, ProfileColorProperty } from '../../../../scenery/js/imports.js';
import areaModelCommon from '../../areaModelCommon.js';
import OrientationPair from '../model/OrientationPair.js';

// Initial colors for each profile, by string key. Only profile currently is default (still helpful for making color
// tweaks with the top-level files)
const AreaModelCommonColors = {
  /*---------------------------------------------------------------------------*
  * Common colors
  *----------------------------------------------------------------------------*/

  // Main background color for the sim
  backgroundProperty: new ProfileColorProperty( areaModelCommon, 'background', { default: new Color( 244, 252, 254 ) } ),

  // Radio buttons for scene selection / area-model calculation / partial products
  radioBorderProperty: new ProfileColorProperty( areaModelCommon, 'radioBorder', { default: new Color( 97, 200, 216 ) } ),
  radioBackgroundProperty: new ProfileColorProperty( areaModelCommon, 'radioBackground', { default: Color.WHITE } ),

  // Things that look like panels (except for the keypad panel)
  panelBorderProperty: new ProfileColorProperty( areaModelCommon, 'panelBorder', { default: new Color( 0x3, 0x3, 0x3 ) } ),
  panelBackgroundProperty: new ProfileColorProperty( areaModelCommon, 'panelBackground', { default: Color.WHITE } ),

  // Main appearance
  areaBackgroundProperty: new ProfileColorProperty( areaModelCommon, 'areaBackground', { default: Color.WHITE } ),
  areaBorderProperty: new ProfileColorProperty( areaModelCommon, 'areaBorder', { default: Color.BLACK } ),

  // Partition line (stroke includes handle)
  partitionLineBorderProperty: new ProfileColorProperty( areaModelCommon, 'partitionLineBorder', { default: Color.BLACK } ),
  partitionLineStrokeProperty: new ProfileColorProperty( areaModelCommon, 'partitionLineStroke', { default: Color.BLACK } ),

  // Calculation "base" colors
  calculationActiveProperty: new ProfileColorProperty( areaModelCommon, 'calculationActive', { default: Color.BLACK } ),
  calculationInactiveProperty: new ProfileColorProperty( areaModelCommon, 'calculationInactive', { default: new Color( 0xaaaaaa ) } ),

  // Calculation next/previous arrows
  calculationArrowUpProperty: new ProfileColorProperty( areaModelCommon, 'calculationArrowUp', { default: Color.BLACK } ),
  calculationArrowDisabledProperty: new ProfileColorProperty( areaModelCommon, 'calculationArrowDisabled', { default: new Color( 0xaaaaaa ) } ),

  // Calculation icon (in area-model-calculation panel)
  calculationIconDarkProperty: new ProfileColorProperty( areaModelCommon, 'calculationIconDark', { default: Color.BLACK } ),
  calculationIconLightProperty: new ProfileColorProperty( areaModelCommon, 'calculationIconLight', { default: new Color( 0xaaaaaa ) } ),

  // Shown behind partial product labels
  partialProductBackgroundProperty: new ProfileColorProperty( areaModelCommon, 'partialProductBackground', { default: new Color( 255, 255, 255, 0.75 ) } ),
  partialProductBorderProperty: new ProfileColorProperty( areaModelCommon, 'partialProductBorder', { default: new Color( 0, 0, 0, 0.2 ) } ),

  selectionSeparatorProperty: new ProfileColorProperty( areaModelCommon, 'selectionSeparator', { default: new Color( 0xaaaaaa ) } ),

  /*---------------------------------------------------------------------------*
  * Proportional colors
  *----------------------------------------------------------------------------*/

  // Main "color" identity for proportional width/height
  proportionalWidthProperty: new ProfileColorProperty( areaModelCommon, 'proportionalWidth', { default: new Color( 181, 45, 0 ) } ), // red
  proportionalHeightProperty: new ProfileColorProperty( areaModelCommon, 'proportionalHeight', { default: new Color( 0, 71, 253 ) } ), // blue

  // Grid lines for within the area
  gridLineProperty: new ProfileColorProperty( areaModelCommon, 'gridLine', { default: new Color( 0xdd, 0xdd, 0xdd ) } ),

  // The "active" part of the area (within the width/height selected)
  proportionalActiveAreaBorderProperty: new ProfileColorProperty( areaModelCommon, 'proportionalActiveAreaBorder', { default: new Color( 0x66, 0x66, 0x66 ) } ),
  proportionalActiveAreaBackgroundProperty: new ProfileColorProperty( areaModelCommon, 'proportionalActiveAreaBackground', { default: new Color( 0, 0, 0, 0.1 ) } ),

  // Drag handle to the lower-right of the proportional areas
  proportionalDragHandleBorderProperty: new ProfileColorProperty( areaModelCommon, 'proportionalDragHandleBorder', { default: new Color( 0x66, 0x66, 0x66 ) } ),
  proportionalDragHandleBackgroundProperty: new ProfileColorProperty( areaModelCommon, 'proportionalDragHandleBackground', { default: new Color( 172, 201, 184 ) } ),

  // Tiles (proportional screens)
  bigTileProperty: new ProfileColorProperty( areaModelCommon, 'bigTile', { default: new Color( 255, 220, 120 ) } ),
  mediumTileProperty: new ProfileColorProperty( areaModelCommon, 'mediumTile', { default: new Color( 249, 244, 136 ) } ),
  smallTileProperty: new ProfileColorProperty( areaModelCommon, 'smallTile', { default: new Color( 252, 250, 202 ) } ),
  semiTransparentSmallTileProperty: new ProfileColorProperty( areaModelCommon, 'semiTransparentSmallTile', { default: new Color( 243, 235, 43, 0.25 ) } ), // blends onto white to look the same as smallTile
  tileBorderProperty: new ProfileColorProperty( areaModelCommon, 'tileBorder', { default: new Color( 0xaaaaaa ) } ),

  // Proportional icon colors
  gridIconProperty: new ProfileColorProperty( areaModelCommon, 'gridIcon', { default: new Color( 0x55, 0x55, 0x55 ) } ),
  tileIconStrokeProperty: new ProfileColorProperty( areaModelCommon, 'tileIconStroke', { default: Color.BLACK } ),
  partitionLineIconBorderProperty: new ProfileColorProperty( areaModelCommon, 'partitionLineIconBorder', { default: new Color( 0xaa, 0xaa, 0xaa ) } ),
  partitionLineIconBackgroundProperty: new ProfileColorProperty( areaModelCommon, 'partitionLineIconBackground', { default: Color.WHITE } ),
  partitionLineIconLineProperty: new ProfileColorProperty( areaModelCommon, 'partitionLineIconLine', { default: Color.BLACK } ),
  partitionLineIconHandleProperty: new ProfileColorProperty( areaModelCommon, 'partitionLineIconHandle', { default: new Color( 0x33, 0x33, 0x33 ) } ),

  // Color for the counting/numbering labels for each grid square
  countingLabelProperty: new ProfileColorProperty( areaModelCommon, 'countingLabel', { default: Color.BLACK } ),

  /*---------------------------------------------------------------------------*
  * Generic colors
  *----------------------------------------------------------------------------*/

  // Main "color" identity for generic width/height
  genericWidthProperty: new ProfileColorProperty( areaModelCommon, 'genericWidth', { default: new Color( 0, 165, 83 ) } ), // green
  genericHeightProperty: new ProfileColorProperty( areaModelCommon, 'genericHeight', { default: new Color( 91, 42, 194 ) } ), // purple

  // Edit button
  editButtonBackgroundProperty: new ProfileColorProperty( areaModelCommon, 'editButtonBackground', { default: new Color( 241, 232, 0 ) } ),

  // Edit readout
  editActiveBackgroundProperty: new ProfileColorProperty( areaModelCommon, 'editActiveBackground', { default: new Color( 255, 255, 130 ) } ),
  editInactiveBackgroundProperty: new ProfileColorProperty( areaModelCommon, 'editInactiveBackground', { default: Color.WHITE } ),

  // Keypad panel
  keypadPanelBorderProperty: new ProfileColorProperty( areaModelCommon, 'keypadPanelBorder', { default: new Color( 0x99, 0x99, 0x99 ) } ),
  keypadPanelBackgroundProperty: new ProfileColorProperty( areaModelCommon, 'keypadPanelBackground', { default: new Color( 230, 230, 230 ) } ),

  keypadReadoutBorderProperty: new ProfileColorProperty( areaModelCommon, 'keypadReadoutBorder', { default: Color.BLACK } ),
  keypadReadoutBackgroundProperty: new ProfileColorProperty( areaModelCommon, 'keypadReadoutBackground', { default: Color.WHITE } ),

  keypadEnterBackgroundProperty: new ProfileColorProperty( areaModelCommon, 'keypadEnterBackground', { default: new Color( 241, 232, 0 ) } ),

  // Area sign highlights
  genericPositiveBackgroundProperty: new ProfileColorProperty( areaModelCommon, 'genericPositiveBackground', { default: new Color( 0xd4f3fe ) } ),
  genericNegativeBackgroundProperty: new ProfileColorProperty( areaModelCommon, 'genericNegativeBackground', { default: new Color( 0xe5a5ab ) } ),

  // Layout grid icon color
  layoutGridProperty: new ProfileColorProperty( areaModelCommon, 'layoutGrid', { default: Color.BLACK } ),
  layoutIconFillProperty: new ProfileColorProperty( areaModelCommon, 'layoutIconFill', { default: Color.WHITE } ),
  layoutHoverProperty: new ProfileColorProperty( areaModelCommon, 'layoutHover', { default: new Color( 240, 240, 240 ) } ),

  /*---------------------------------------------------------------------------*
  * Game colors
  *----------------------------------------------------------------------------*/

  numbersIconBackgroundProperty: new ProfileColorProperty( areaModelCommon, 'numbersIconBackground', { default: new Color( '#b26fac' ) } ),
  variablesIconBackgroundProperty: new ProfileColorProperty( areaModelCommon, 'variablesIconBackground', { default: new Color( '#6f9fb2' ) } ),

  gameButtonBackgroundProperty: new ProfileColorProperty( areaModelCommon, 'gameButtonBackground', { default: new Color( 241, 232, 0 ) } ),

  // border/text highlights for editable values
  errorStatusProperty: new ProfileColorProperty( areaModelCommon, 'errorStatus', { default: Color.RED } ),
  dirtyStatusProperty: new ProfileColorProperty( areaModelCommon, 'dirtyStatus', { default: new Color( '#3B97BA' ) } ),

  dynamicPartialProductProperty: new ProfileColorProperty( areaModelCommon, 'dynamicPartialProduct', { default: new Color( 128, 130, 133 ) } ),
  fixedPartialProductProperty: new ProfileColorProperty( areaModelCommon, 'fixedPartialProduct', { default: Color.BLACK } ),
  totalEditableProperty: new ProfileColorProperty( areaModelCommon, 'totalEditable', { default: Color.BLACK } ),

  startOverButtonBaseColorProperty: new ProfileColorProperty( areaModelCommon, 'startOverButtonBaseColor', { default: PhetColorScheme.BUTTON_YELLOW } )
};

// @public {OrientationPair.<Property.<Color>>}
AreaModelCommonColors.proportionalColorProperties = new OrientationPair(
  AreaModelCommonColors.proportionalWidthProperty,
  AreaModelCommonColors.proportionalHeightProperty
);
AreaModelCommonColors.genericColorProperties = new OrientationPair(
  AreaModelCommonColors.genericWidthProperty,
  AreaModelCommonColors.genericHeightProperty
);

areaModelCommon.register( 'AreaModelCommonColors', AreaModelCommonColors );

export default AreaModelCommonColors;