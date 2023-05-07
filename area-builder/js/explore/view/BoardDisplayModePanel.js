// Copyright 2014-2022, University of Colorado Boulder

/**
 * Panel that contains a switch that is used to switch between the two exploration modes.
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Color, HBox, Node, Rectangle, VBox } from '../../../../scenery/js/imports.js';
import ABSwitch from '../../../../sun/js/ABSwitch.js';
import Panel from '../../../../sun/js/Panel.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../../common/AreaBuilderSharedConstants.js';

class BoardDisplayModePanel extends Panel {

  /**
   * @param boardDisplayModeProperty
   */
  constructor( boardDisplayModeProperty ) {

    const singleBoardIcon = createIcon( AreaBuilderSharedConstants.ORANGISH_COLOR, 6, [
      new Vector2( 0, 1 ),
      new Vector2( 1, 0 ),
      new Vector2( 1, 1 )
    ] );

    const dualBoardIcon = new HBox( {
        children: [
          createIcon( AreaBuilderSharedConstants.GREENISH_COLOR, 6, [
            new Vector2( 0, 0 ),
            new Vector2( 1, 0 ),
            new Vector2( 1, 1 )
          ] ),
          createIcon( AreaBuilderSharedConstants.PURPLISH_COLOR, 6, [
            new Vector2( 0, 0 ),
            new Vector2( 0, 1 ),
            new Vector2( 1, 0 ),
            new Vector2( 1, 1 )
          ] )
        ],
        spacing: 3
      }
    );

    super(
      new VBox( {
        children: [
          new ABSwitch( boardDisplayModeProperty, 'single', singleBoardIcon, 'dual', dualBoardIcon, {
            toggleSwitchOptions: {
              size: new Dimension2( 36, 18 ),
              thumbTouchAreaXDilation: 5,
              thumbTouchAreaYDilation: 5
            }
          } )
        ],
        spacing: 10 // Empirically determined
      } ), { fill: AreaBuilderSharedConstants.CONTROL_PANEL_BACKGROUND_COLOR, cornerRadius: 4 }
    );
  }
}

// utility function for creating the icons used on this panel
function createIcon( color, rectangleLength, rectanglePositions ) {
  const edgeColor = Color.toColor( color ).colorUtilsDarker( AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR );
  const content = new Node();
  rectanglePositions.forEach( position => {
    content.addChild( new Rectangle( 0, 0, rectangleLength, rectangleLength, 0, 0, {
      fill: color,
      stroke: edgeColor,
      left: position.x * rectangleLength,
      top: position.y * rectangleLength
    } ) );
  } );
  return new Panel( content, { fill: 'white', stroke: 'black', cornerRadius: 0, backgroundPickable: true } );
}

areaBuilder.register( 'BoardDisplayModePanel', BoardDisplayModePanel );
export default BoardDisplayModePanel;