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
import ABSwitch from "../../../../sun/js/ABSwitch.js";

export default class ControlPanelView extends Panel {
  public isPlaying
  public velocity: number=0;
  public aChecked;
  public space_shuttle_x=0
  public space_shuttle_x_=0
  public space_shuttle_t=0
  public space_shuttle_t_=0

  textHint1
  textHint2
  textHint3
  textHint4


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
    const text0 = new Text( "地球系观察", {  fontSize: fontSize  } );
    const text1 = new Text( "飞船系观察", {  fontSize: fontSize  } );
    const aChecked = new BooleanProperty(true)
    const abSwitch = new ABSwitch(aChecked,true,text0,false,text1, {} )
    const textSpeed0 = new Text( "飞船速度:", {  fontSize: fontSize  } );
    const textSpeed1 = new Text( "v = 0.00 c", {  font : new MathSymbolFont(fontSize,) } );
    const textSpeed2 = new Text( "γ = 1.250", {  font : new MathSymbolFont(fontSize) } );
    const v = new NumberProperty(0.6);
    const slider = new Slider(v, new Range(-0.99,0.99),{
      roundToStepSize: true, trackSize: new Dimension2(155,5),
    })
    // const textHintT = new Text( "时间单位: 秒", {  fontSize: fontSize  } );
    // const textHintX = new Text( "距离单位: 光秒", {  fontSize: fontSize  } );
    const textHint0 = new Text( "飞船的时空坐标:", {  fontSize: fontSize  } );
    const textHintTX = new Text( "时间单位: s(秒), 距离单位: ls(光秒)", {  fontSize: 10  } );

    //const textHint =  new Text( "暂停可以记录位置和时间", {  fontSize: fontSize, maxWidth:130, } );
    const isPlaying= new BooleanProperty(false);
    const btnPlay= new PlayPauseButton(isPlaying, {})



    const hBox1 = new HBox({
      spacing: 6,
      children: [ textSpeed0,
        slider,
        ],
    });
    const hBox2 = new HBox({
      spacing: 6,
      children: [
        textSpeed1,textSpeed2,
      ],
    });

    const vBox = new VBox({
      spacing: 6,
      children: [
        abSwitch,
        hBox1,hBox2,
        btnPlay,
        textHint0 ],
    });

    super(vBox, options);

    this.textHint1 = new Text( "x = 0.000", {  font : new MathSymbolFont(fontSize) } );
    this.textHint2 = new Text( "t = 0.000", {  font : new MathSymbolFont(fontSize) } );
    this.textHint3 = new Text( "x' = 0.000", {  font : new MathSymbolFont(fontSize) } );
    this.textHint4 = new Text( "t' = 0.000", {  font : new MathSymbolFont(fontSize) } );

    (vBox as Node).addChild(this.textHint1);
    (vBox as Node).addChild(this.textHint2);
    (vBox as Node).addChild(this.textHint3);
    (vBox as Node).addChild(this.textHint4);

    // isPlaying.link(property=>{
    //   this.isPlaying = property;
    // });
    v.link(property=>{
      this.velocity = Math.round(100 * property)/100;
      textSpeed1.setString(`v = ${this.velocity.toFixed(2)} c,  ` );
      textSpeed2.setString(`γ = ${(1/Math.sqrt(1-this.velocity** 2)).toFixed(3)}` );
    });
    // aChecked.link(property=>{
    //   this.aChecked = property
    // })
    this.aChecked = aChecked
    this.isPlaying = isPlaying
  }

  public setText(){
    this.textHint1.setString(`x = ${this.space_shuttle_x.toFixed(3)} 光秒` );
    this.textHint2.setString(`t = ${this.space_shuttle_t.toFixed(3)} 秒` );
    this.textHint3.setString(`x' = ${this.space_shuttle_x_.toFixed(3)} 光秒` );
    this.textHint4.setString(`t' = ${this.space_shuttle_t_.toFixed(3)} 秒` );
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