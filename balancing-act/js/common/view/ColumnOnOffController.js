// Copyright 2014-2022, University of Colorado Boulder

/**
 * A user interface control that is used to turn the columns on or off.
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import merge from '../../../../phet-core/js/merge.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import ABSwitch from '../../../../sun/js/ABSwitch.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import balancingAct from '../../balancingAct.js';
import BAQueryParameters from '../BAQueryParameters.js';
import ColumnState from '../model/ColumnState.js';
import ColumnControlIcon from './ColumnControlIcon.js';

// constants
const ICON_WIDTH = 60;

class ColumnOnOffController extends Node {

  constructor( columnState, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED
    }, options );
    super();

    const columnSwitchTandem = options.tandem.createTandem( 'columnSwitch' );
    const columnsOnNode = new ColumnControlIcon( ICON_WIDTH, true, {
      tandem: columnSwitchTandem.createTandem( 'columnsOnNode' )
    } );
    const columnsOffNode = new ColumnControlIcon( ICON_WIDTH, false, {
      tandem: columnSwitchTandem.createTandem( 'columnsOffNode' )
    } );
    const columnSwitch = new ABSwitch( columnState, ColumnState.DOUBLE_COLUMNS, columnsOnNode, ColumnState.NO_COLUMNS, columnsOffNode, {
      toggleSwitchOptions: {
        size: new Dimension2( 32, 16 ),
        thumbTouchAreaXDilation: 5,
        thumbTouchAreaYDilation: 5
      },
      tandem: columnSwitchTandem
    } );

    // TODO: These options were misplaced, should they be deleted?
    // fill: 'rgb( 240, 240, 240 )',
    // cornerRadius: 5
    const panel = new Panel( columnSwitch );
    this.addChild( panel );

    if ( BAQueryParameters.stanford ) {
      const MARGIN = 10;
      const FONT_SIZE = 18;
      const FILL = 'black';
      const textOptions = {
        fill: FILL,
        fontSize: FONT_SIZE
      };
      this.addChild( new Text( 'Setup', merge( {
        right: panel.left - MARGIN,
        bottom: panel.bottom
      }, textOptions ) ) );
      this.addChild( new Text( 'Test', merge( {
        left: panel.right + MARGIN,
        bottom: panel.bottom
      }, textOptions ) ) );
    }

    this.mutate( options );
  }
}

balancingAct.register( 'ColumnOnOffController', ColumnOnOffController );

export default ColumnOnOffController;