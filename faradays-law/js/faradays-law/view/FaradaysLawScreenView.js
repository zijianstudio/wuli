// Copyright 2014-2022, University of Colorado Boulder

/**
 * Scene graph for the 'Faraday's Law' screen.
 *
 * @author Vasily Shakhov (MLearner)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import { Node } from '../../../../scenery/js/imports.js';
import boundaryReachedSoundPlayer from '../../../../tambo/js/shared-sound-players/boundaryReachedSoundPlayer.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import coilBumpHigh_mp3 from '../../../sounds/coilBumpHigh_mp3.js';
import coilBumpLow_mp3 from '../../../sounds/coilBumpLow_mp3.js';
import faradaysLaw from '../../faradaysLaw.js';
import FaradaysLawStrings from '../../FaradaysLawStrings.js';
import FaradaysLawConstants from '../FaradaysLawConstants.js';
import BulbNode from './BulbNode.js';
import CircuitDescriptionNode from './CircuitDescriptionNode.js';
import CoilNode from './CoilNode.js';
import CoilsWiresNode from './CoilsWiresNode.js';
import CoilTypeEnum from './CoilTypeEnum.js';
import ControlPanelNode from './ControlPanelNode.js';
import MagnetNodeWithField from './MagnetNodeWithField.js';
import VoltageSoundGenerator from './VoltageSoundGenerator.js';
import VoltmeterAndWiresNode from './VoltmeterAndWiresNode.js';

// constants
const summaryDescriptionString = FaradaysLawStrings.a11y.summaryDescription;
const moveMagnetToPlayString = FaradaysLawStrings.a11y.moveMagnetToPlay;
const COIL_BUMP_SOUND_LEVEL = 0.25;

class FaradaysLawScreenView extends ScreenView {

  /**
   * @param {FaradaysLawModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    // pdom - screen Summary
    const summaryNode = new Node();
    summaryNode.addChild( new Node( { tagName: 'p', innerContent: summaryDescriptionString } ) );
    summaryNode.addChild( new Node( { tagName: 'p', innerContent: moveMagnetToPlayString } ) );

    super( {
      layoutBounds: FaradaysLawConstants.LAYOUT_BOUNDS,
      screenSummaryContent: summaryNode,
      tandem: tandem
    } );

    const circuitDescriptionNode = new CircuitDescriptionNode( model );
    this.addChild( circuitDescriptionNode );

    // coils
    const bottomCoilNode = new CoilNode( CoilTypeEnum.FOUR_COIL, {
      x: model.bottomCoil.position.x,
      y: model.bottomCoil.position.y
    } );

    const topCoilNode = new CoilNode( CoilTypeEnum.TWO_COIL, {
      x: model.topCoil.position.x,
      y: model.topCoil.position.y
    } );

    // @public {Vector2[]}
    this.bottomCoilEndPositions = {
      topEnd: bottomCoilNode.endRelativePositions.topEnd.plus( model.bottomCoil.position ),
      bottomEnd: bottomCoilNode.endRelativePositions.bottomEnd.plus( model.bottomCoil.position )
    };

    // @public {Vector2[]}
    this.topCoilEndPositions = {
      topEnd: topCoilNode.endRelativePositions.topEnd.plus( model.topCoil.position ),
      bottomEnd: topCoilNode.endRelativePositions.bottomEnd.plus( model.topCoil.position )
    };

    // voltmeter and bulb created
    const voltmeterAndWiresNode = new VoltmeterAndWiresNode( model.voltmeter.needleAngleProperty, tandem.createTandem( 'voltmeterNode' ) );
    const bulbNode = new BulbNode( model.voltageProperty, {
      center: FaradaysLawConstants.BULB_POSITION
    } );

    // wires
    this.addChild( new CoilsWiresNode( this, model.topCoilVisibleProperty ) );

    // exists for the lifetime of the sim, no need to dispose
    model.voltmeterVisibleProperty.link( showVoltmeter => {
      voltmeterAndWiresNode.visible = showVoltmeter;
    } );

    // When PhET-iO Studio makes the voltmeter invisible, we should also uncheck the checkbox.
    voltmeterAndWiresNode.visibleProperty.lazyLink( () => {
      model.voltmeterVisibleProperty.value = voltmeterAndWiresNode.visible;
    } );

    // bulb added
    this.addChild( bulbNode );

    // coils added
    this.addChild( bottomCoilNode );
    this.addChild( topCoilNode );
    model.topCoilVisibleProperty.linkAttribute( topCoilNode, 'visible' );

    // control panel
    const controlPanel = new ControlPanelNode( model, tandem );
    this.addChild( controlPanel );

    // voltmeter added
    this.addChild( voltmeterAndWiresNode );

    // @private
    this.magnetNodeWithField = new MagnetNodeWithField( model, tandem.createTandem( 'magnetNode' ) );
    this.addChild( this.magnetNodeWithField );
    this.pdomPlayAreaNode.pdomOrder = [ circuitDescriptionNode, this.magnetNodeWithField ];
    this.pdomControlAreaNode.pdomOrder = [ controlPanel ];

    // move coils to front
    bottomCoilNode.frontImage.detach();
    this.addChild( bottomCoilNode.frontImage );
    bottomCoilNode.frontImage.center = model.bottomCoil.position.plus( new Vector2( CoilNode.xOffset, 0 ) );

    topCoilNode.frontImage.detach();
    this.addChild( topCoilNode.frontImage );
    topCoilNode.frontImage.center = model.topCoil.position.plus( new Vector2( CoilNode.xOffset + CoilNode.twoOffset, 0 ) );
    model.topCoilVisibleProperty.linkAttribute( topCoilNode.frontImage, 'visible' );

    // ------------------------------------------------------------------------------------------------------------------
    // sound generation
    // ------------------------------------------------------------------------------------------------------------------

    // sounds for when the magnet bumps into the coils
    const lowerCoilBumpSoundClip = new SoundClip( coilBumpLow_mp3, { initialOutputLevel: COIL_BUMP_SOUND_LEVEL } );
    soundManager.addSoundGenerator( lowerCoilBumpSoundClip );
    const upperCoilBumpSoundClip = new SoundClip( coilBumpHigh_mp3, { initialOutputLevel: COIL_BUMP_SOUND_LEVEL } );
    soundManager.addSoundGenerator( upperCoilBumpSoundClip );
    model.coilBumpEmitter.addListener( coilType => {
      coilType === CoilTypeEnum.FOUR_COIL ? lowerCoilBumpSoundClip.play() : upperCoilBumpSoundClip.play();
    } );
    model.edgeBumpEmitter.addListener( () => {
      boundaryReachedSoundPlayer.play();
    } );

    // sound generation for voltage
    soundManager.addSoundGenerator( new VoltageSoundGenerator( model.voltageProperty ) );
  }
}

faradaysLaw.register( 'FaradaysLawScreenView', FaradaysLawScreenView );
export default FaradaysLawScreenView;