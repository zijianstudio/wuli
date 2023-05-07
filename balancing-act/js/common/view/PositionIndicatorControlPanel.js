// Copyright 2013-2023, University of Colorado Boulder

/**
 * This type defines a control panel that selects between the various types of
 * position markers, i.e. ruler, position markers, or nothing.
 *
 * @author John Blanco
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, HStrut, Text, VBox, VStrut } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import balancingAct from '../../balancingAct.js';
import BalancingActStrings from '../../BalancingActStrings.js';
import PositionIndicatorChoice from '../model/PositionIndicatorChoice.js';

const marksString = BalancingActStrings.marks;
const noneString = BalancingActStrings.none;
const positionString = BalancingActStrings.position;
const rulersString = BalancingActStrings.rulers;

// constants
const RADIO_BUTTON_TEXT_OPTIONS = { font: new PhetFont( 14 ) };
const TITLE_TEXT_OPTIONS = { font: new PhetFont( 16 ) };

class PositionIndicatorControlPanel extends Panel {

  /**
   * @param {Property} positionIndicatorStateProperty
   * @param {Object} [options]
   */
  constructor( positionIndicatorStateProperty, options ) {

    options = merge( {
      titleToControlsVerticalSpace: 5,
      fill: 'rgb( 240, 240, 240 )',
      xMargin: 5,
      align: 'left',
      tandem: Tandem.REQUIRED
    }, options );

    const positionRadioButtonGroup = new VerticalAquaRadioButtonGroup( positionIndicatorStateProperty, [
      {
        createNode: () => new Text( noneString, RADIO_BUTTON_TEXT_OPTIONS ),
        value: PositionIndicatorChoice.NONE,
        tandemName: 'noneRadioButton'
      },
      {
        createNode: () => new Text( rulersString, RADIO_BUTTON_TEXT_OPTIONS ),
        value: PositionIndicatorChoice.RULERS,
        tandemName: 'rulerRadioButton'
      },
      {
        createNode: () => new Text( marksString, RADIO_BUTTON_TEXT_OPTIONS ),
        value: PositionIndicatorChoice.MARKS,
        tandemName: 'marksRadioButton'
      }
    ], {
      radioButtonOptions: { radius: 6 },
      touchAreaDilation: 5,
      tandem: options.tandem.createTandem( 'positionRadioButtonGroup' )
    } );

    const positionMarkerVBox = new VBox( {
      children: [
        new Text( positionString, TITLE_TEXT_OPTIONS ),
        new VStrut( options.titleToControlsVerticalSpace ),
        new HBox( { children: [ new HStrut( 10 ), positionRadioButtonGroup ] } )
      ],
      align: 'left'
    } );

    super( positionMarkerVBox, options );
  }
}

balancingAct.register( 'PositionIndicatorControlPanel', PositionIndicatorControlPanel );
export default PositionIndicatorControlPanel;