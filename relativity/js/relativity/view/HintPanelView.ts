// Copyright 2019-2023, University of Colorado Boulder

/**
 * GraphControlPanel is the base class for graph control panels. These panels contain controls that affect the graph.
 *
 * @author Brandon Li
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import {AlignBox, HBox, Node, RichText, Text, VBox} from '../../../../scenery/js/imports.js';
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

export default class HintPanelView extends Panel {
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
      resize: false,
    }, options );

    const fontSize = 18
    let a = new RichText("说明：<br><br>可演示内容：动尺变短，动钟变慢，验证洛伦兹变换公式，以及双生子佯谬。<br><br>" +
        "我们假定，每次速度发生变化，都是由飞船引起。飞船变速这一事件，在两个系的时空坐标记作 (x1, t1), (x1', t1')。将其设置为新的时空原点，" +
        "对于之后任意时刻飞船的新坐标 (x2, t2), (x2', t2')，(x2-x1, t2-t1) 与 (x2'-x1', t2'-t1') 服从洛伦兹变换，直到下次变速过程发生，并再次更新时空原点。",{ lineWrap: 419})
    const textSpeed0 = new Text( "可以演示动尺变短，动钟变慢，验证洛伦兹变换公式，以及双生子佯谬:", {  fontSize: fontSize  } );
    const lv = new LorentzView({})

    const vBox = new VBox({
      spacing: 6,
      children: [ a ],
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