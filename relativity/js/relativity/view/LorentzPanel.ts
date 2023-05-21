// Copyright 2019-2023, University of Colorado Boulder

/**
 * GraphControlPanel is the base class for graph control panels. These panels contain controls that affect the graph.
 *
 * @author Brandon Li
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import {AlignBox, HBox, Node, Text, VBox} from '../../../../scenery/js/imports.js';
import Panel, {PanelOptions} from '../../../../sun/js/Panel.js';
import BooleanProperty from "../../../../axon/js/BooleanProperty.js";
import MathSymbolFont from "../../../../scenery-phet/js/MathSymbolFont.js";
import NumberProperty from "../../../../axon/js/NumberProperty.js";
import Range from "../../../../dot/js/Range.js";
import PlayPauseButton from "../../../../scenery-phet/js/buttons/PlayPauseButton.js";
import Slider from "../../../../sun/js/Slider.js";
import Dimension2 from "../../../../dot/js/Dimension2.js";
import LorentzView from "./LorentzView.js";
import RelativityConstants from "../../common/RelativityConstants";

export default class LorentzPanelView extends Panel {
  public isPlaying: boolean = false;
  public velocity: number=0;
  public aChecked: boolean=true;
  public space_shuttle_x=0
  public space_shuttle_x_=0
  public space_shuttle_t=0
  public space_shuttle_t_=0

  /**
   * @param {Node[]} children
   * @param {Object} [options]
   */
  constructor( options:PanelOptions ) {

    options = merge( {
      cornerRadius: 5,
      xMargin: 6,
      yMargin: 8,
      stroke: 'rgb( 190, 190, 190 )',
      fill: 'rgb( 240, 240, 240 )',
      resize: true,
    }, options );

    const fontSize = 18

    const textSpeed0 = new Text( "洛伦兹变换:", {  fontSize: fontSize  } );
    const lv = new LorentzView({})

    const vBox = new VBox({
      spacing: 6,
      children: [ textSpeed0, lv ],
    });

    super(vBox, options);
  }

  /**
   * @public
   * @override
   */
  /*dispose() {
    assert && assert( false, 'GraphControlPanel is not intended to be disposed' );
  }*/
}

//relativity.register( 'ControlPanelView', ControlPanelView );