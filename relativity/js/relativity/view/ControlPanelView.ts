// Copyright 2019-2023, University of Colorado Boulder

/**
 * GraphControlPanel is the base class for graph control panels. These panels contain controls that affect the graph.
 *
 * @author Brandon Li
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import {AlignBox, HBox, Node, Text, VBox} from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import relativity from "../../relativity.js";
import XAxisView from "./XAxisView.js";
import Checkbox from "../../../../sun/js/Checkbox.js";
import BooleanProperty from "../../../../axon/js/BooleanProperty.js";
import MathSymbolFont from "../../../../scenery-phet/js/MathSymbolFont.js";
import PhetFont from "../../../../scenery-phet/js/PhetFont.js";
import ABSwitch from "../../../../sun/js/ABSwitch.js";
import HSlider from "../../../../sun/js/HSlider.js";
import NumberProperty from "../../../../axon/js/NumberProperty.js";
import Range from "../../../../dot/js/Range.js";
import RoundPushButton from "../../../../sun/js/buttons/RoundPushButton.js";
import ButtonNode from "../../../../sun/js/buttons/ButtonNode";
import ArrowButton, {ArrowButtonDirection} from "../../../../sun/js/buttons/ArrowButton.js";
import PlayPauseButton from "../../../../scenery-phet/js/buttons/PlayPauseButton.js";

export default class ControlPanelView extends Panel {
  public isPlaying: boolean = false;
  public velocity: number=0;
  public aChecked: boolean=true;

  /**
   * @param {Node[]} children
   * @param {Object} [options]
   */
  constructor( options ) {


    options = merge( {
      cornerRadius: 5,
      xMargin: 9,
      yMargin: 10,
      stroke: 'rgb( 190, 190, 190 )',
      fill: 'rgb( 240, 240, 240 )'
    }, options );

    const textA = new Text( "在A参考系观察", {
      fontSize:22,
    } );
    const textB = new Text( "在B参考系观察", {
      fontSize:22,
    } );
    const textC = new Text( "B相对A速度（-0.99c~0.99c）", {
      fontSize:22,
    } );

    const aChecked = new BooleanProperty(true);
    const abSwitch = new ABSwitch(aChecked, true, textA, false, textB);

    const v = new NumberProperty(0);
    const slider = new HSlider(v, new Range(-0.99,0.99),{  })


    const vBox = new VBox({
      children: [ textC, slider ]
    } );

    const isPlaying= new BooleanProperty(false);

    const btn3= new PlayPauseButton(isPlaying)

    const content = new HBox( {
      spacing: 50,
      children: [ abSwitch, vBox, btn3,]
    } );

    super(content, options);

    aChecked.link(property=>{
      this.aChecked = property;
    });
    isPlaying.link(property=>{
      this.isPlaying = property;
    });
    v.link(property=>{
      this.velocity = property;
      textC.setString("B相对A速度: " + property.toFixed(2) + "c");
    });
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