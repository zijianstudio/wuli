// Copyright 2023, University of Colorado Boulder

/**
 * TODO Describe this class and its responsibilities.
 *
 * @author Zijian Wang
 */

import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import RelativityConstants from '../../common/RelativityConstants.js';
import relativity from '../../relativity.js';
import RelativityModel from '../model/RelativityModel.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Vector2 from "../../../../dot/js/Vector2.js";
import ModelViewTransform2 from "../../../../phetcommon/js/view/ModelViewTransform2.js";
import PlaneView from "./PlaneView.js";
import {Rectangle, Color, Line, Path, Node, Text} from "../../../../scenery/js/imports.js";
import XAxisView from "./XAxisView.js";
import ControlPanelView from "./ControlPanelView.js";
import Panel from "../../../../sun/js/Panel.js";
import Matrix3 from "../../../../dot/js/Matrix3.js";
import MathSymbolFont from "../../../../scenery-phet/js/MathSymbolFont.js";

type SelfOptions = {
 //TODO add options that are specific to RelativityScreenView here
};

type RelativityScreenViewOptions = SelfOptions & ScreenViewOptions;

export default class RelativityScreenView extends ScreenView {
  private controlPanel: ControlPanelView;
  private nodeA: Node = new Node();
  private nodeAc : Node = new Node();
  private nodeB: Node = new Node(new Vector2(0,0));
  private nodeBc : Node = new Node();
  private mat = new Matrix3();
  private mat0  = new Matrix3();
  private tA: Text[] = [];
  private tB: Text[] = [];
  private tAValue = [0,0,0,0,0,0,0,0,0,0,0,0,0];
  private tBValue = [0,0,0,0,0,0,0,0,0,0,0,0,0];
  private timeScala = 0;
  private vScala= 30;

  public constructor( model: RelativityModel, providedOptions: RelativityScreenViewOptions ) {

    const options = optionize<RelativityScreenViewOptions, SelfOptions, ScreenViewOptions>()( {
      //TODO add default values for optional SelfOptions here
      //TODO add default values for optional ScreenViewOptions here
    }, providedOptions );

    super( options );
    //console.log(this.mat0)
    const center = new Vector2( this.layoutBounds.width/ 2, this.layoutBounds.height / 2 );

    const modelViewTransform = ModelViewTransform2.createOffsetScaleMapping( center, 1 );

    const GRAPH_BACKGROUND_COLOR = Color.white;
    const GRAPH_MAJOR_LINE_COLOR = 'rgb( 212, 212, 212 )'; // gray
    const GRAPH_MINOR_LINE_COLOR = 'rgb( 225, 225, 225 )'; // lighter gray
    const MAJOR_GRID_LINE_WIDTH = 1.5; // view units
    const MINOR_GRID_LINE_WIDTH = 0.7; // view units
    const MAJOR_TICK_SPACING = 5; // model units
    const MINOR_TICK_SPACING = 1;
    const SCALE_FACTOR = 15;
    const MIN_X = 20;
    const MIN_Y = 20;
    const WIDTH = 12 * SCALE_FACTOR * MAJOR_TICK_SPACING;
    const HEIGHT = 2 * SCALE_FACTOR * MAJOR_TICK_SPACING;
    this.timeScala = HEIGHT/2/30;

    let COUNT = 0;
    // Vertical lines
    for (let xValue = -WIDTH/2; xValue <= WIDTH/2 ; xValue += MINOR_TICK_SPACING * SCALE_FACTOR) {
      if(COUNT % MAJOR_TICK_SPACING==0 ){
        this.nodeA.addChild(new Line(xValue, -HEIGHT/2, xValue,HEIGHT/2, {
          stroke: GRAPH_MAJOR_LINE_COLOR, lineWidth: MAJOR_GRID_LINE_WIDTH,
        }));
        const t = new Text("0",{x:xValue-15,y:-15,font: new MathSymbolFont( 28 ),});
        this.tA.push(t);
        this.nodeA.addChild(t)
      }else {
        this.nodeA.addChild(new Line(xValue, -HEIGHT/2, xValue,HEIGHT/2, {
          stroke: GRAPH_MINOR_LINE_COLOR, lineWidth: MINOR_GRID_LINE_WIDTH,
        }));
        //console.log(this.nodeA.x)
      }
      COUNT += 1;
    }
    // Horizontal lines
    COUNT = 0;
    for (let yValue = -HEIGHT/2; yValue <= HEIGHT/2; yValue +=  MINOR_TICK_SPACING * SCALE_FACTOR) {
      if(COUNT%MAJOR_TICK_SPACING==0){
        this.nodeA.addChild(new Line(-WIDTH/2, yValue, WIDTH/2,yValue, {
          stroke: GRAPH_MAJOR_LINE_COLOR, lineWidth: MAJOR_GRID_LINE_WIDTH,
        }));
      }else {
        this.nodeA.addChild(new Line(-WIDTH/2, yValue, WIDTH/2,yValue, {
          stroke: GRAPH_MINOR_LINE_COLOR, lineWidth: MINOR_GRID_LINE_WIDTH,
        }));
      }
      COUNT += 1;
    }
    this.nodeA.addChild(new XAxisView("x, t (A系)",-WIDTH/2-30,0,WIDTH/2+30,0))


    COUNT = 0;
    // Vertical lines
    for (let xValue = -WIDTH/2; xValue <= WIDTH/2 ; xValue += MINOR_TICK_SPACING * SCALE_FACTOR) {
      if(COUNT % MAJOR_TICK_SPACING==0 ){
        this.nodeB.addChild(new Line(xValue, -HEIGHT/2, xValue,HEIGHT/2, {
          stroke: GRAPH_MAJOR_LINE_COLOR, lineWidth: MAJOR_GRID_LINE_WIDTH,
        }));
        const t = new Text("0",{x:xValue-15,y:-15,font: new MathSymbolFont( 28 ),});
        this.tB.push(t)
        this.nodeB.addChild(t)
      }else {
        this.nodeB.addChild(new Line(xValue, -HEIGHT/2, xValue,HEIGHT/2, {
          stroke: GRAPH_MINOR_LINE_COLOR, lineWidth: MINOR_GRID_LINE_WIDTH,
        }));
        //console.log(this.nodeB.x)
      }
      COUNT += 1;
    }
    // Horizontal lines
    COUNT = 0;
    for (let yValue = -HEIGHT/2; yValue <= HEIGHT/2; yValue +=  MINOR_TICK_SPACING * SCALE_FACTOR) {
      if(COUNT%MAJOR_TICK_SPACING==0){
        this.nodeB.addChild(new Line(-WIDTH/2, yValue, WIDTH/2,yValue, {
          stroke: GRAPH_MAJOR_LINE_COLOR, lineWidth: MAJOR_GRID_LINE_WIDTH,
        }));
      }else {
        this.nodeB.addChild(new Line(-WIDTH/2, yValue, WIDTH/2,yValue, {
          stroke: GRAPH_MINOR_LINE_COLOR, lineWidth: MINOR_GRID_LINE_WIDTH,
        }));
      }
      COUNT += 1;
    }
    this.nodeB.addChild(new XAxisView("x', t' (B系)",-WIDTH/2-30,0,WIDTH/2+30,0))


    this.nodeAc.addChild(this.nodeA)
    this.nodeBc.addChild(this.nodeB)

    this.nodeAc.setX(center.x);
    this.nodeAc.setY(center.y-1.2*HEIGHT);
    this.nodeBc.setX(center.x)
    this.nodeBc.setY(center.y)

    this.addChild(this.nodeAc);
    this.addChild(this.nodeBc);

    this.addChild(new PlaneView(new Vector2(0,-80), modelViewTransform));

    this.controlPanel = new ControlPanelView( {
          left: RelativityConstants.SCREEN_VIEW_X_MARGIN,
          bottom: this.layoutBounds.maxY - RelativityConstants.SCREEN_VIEW_Y_MARGIN,
    } );
    this.addChild(this.controlPanel);

    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - RelativityConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - RelativityConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: options.tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );
  }

  /**
   * Resets the view.
   */
  public reset(): void {
    //TODO
  }

  /**
   * Steps the view.
   * @param dt - time step, in seconds
   */
  public override step( dt: number ): void {
    //TODO
    //console.log(this.nodeB.x,",",this.nodeB.y);
    if(this.controlPanel.isPlaying){
      if(this.controlPanel.aChecked){
        this.nodeBc.x += this.vScala* dt * this.controlPanel.velocity;
      }else{
        this.nodeAc.x += - this.vScala* dt * this.controlPanel.velocity;
      }

      for (let i in this.tAValue) {
        this.tAValue[i] += dt/this.timeScala;
      }
      for (let i in this.tBValue) {
        this.tBValue[i] += dt/this.timeScala;
      }
    }

    if(this.controlPanel.aChecked){
      let scaleX = Math.sqrt(1-this.controlPanel.velocity ** 2);
      this.mat.setArray([scaleX,0,0,0,1,0,0,0,1]);
      this.nodeA.setMatrix(this.mat0)
      this.nodeB.setMatrix(this.mat);

      for (let i in this.tA) {
        this.tA[i].setString(this.tAValue[i].toFixed(2));
      }
      for (let i in this.tB) {
        let tt = this.tAValue[i]*Math.sqrt(1-this.controlPanel.velocity ** 2)+(i-6)*this.controlPanel.velocity/this.vScala
        this.tB[i].setString(tt.toFixed(2));
      }
    }else {
      let scaleX = Math.sqrt(1-this.controlPanel.velocity ** 2);
      this.mat.setArray([scaleX,0,0,0,1,0,0,0,1]);
      this.nodeB.setMatrix(this.mat0)
      this.nodeA.setMatrix(this.mat);

      for (let i in this.tA) {
        let tt = this.tBValue[i]*Math.sqrt(1-this.controlPanel.velocity ** 2)-(i-6)*this.controlPanel.velocity/this.vScala
        this.tA[i].setString(tt.toFixed(2));
      }
      for (let i in this.tB) {
        this.tB[i].setString(this.tBValue[i].toFixed(2));
      }
    }
  }
}

relativity.register( 'RelativityScreenView', RelativityScreenView );