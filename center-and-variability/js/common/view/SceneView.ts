// Copyright 2023, University of Colorado Boulder

import { Node } from '../../../../scenery/js/imports.js';
import SoccerBallNode from './SoccerBallNode.js';
import { AnimationMode } from '../model/AnimationMode.js';
import CAVObjectType from '../model/CAVObjectType.js';
import CAVSceneModel from '../model/CAVSceneModel.js';
import SoccerPlayerNode from './SoccerPlayerNode.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import CAVModel from '../model/CAVModel.js';
import centerAndVariability from '../../centerAndVariability.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import DragIndicatorArrowNode from './DragIndicatorArrowNode.js';
import PlayAreaMedianIndicatorNode from './PlayAreaMedianIndicatorNode.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import InfoDialog from '../../variability/view/InfoDialog.js';
import VariabilitySceneModel from '../../variability/model/VariabilitySceneModel.js';
import VariabilityModel from '../../variability/model/VariabilityModel.js';
import Multilink from '../../../../axon/js/Multilink.js';

export default class SceneView {

  private readonly updateMedianNode: () => void;

  public constructor(
    model: CAVModel,
    sceneModel: CAVSceneModel,
    backObjectLayer: Node,
    frontObjectLayer: Node,
    modelViewTransform: ModelViewTransform2,
    getAccordionBox: () => AccordionBox | null,
    options: { tandem: Tandem } ) {

    const objectNodeGroupTandem = options.tandem.createTandem( 'soccerBallNodeGroup' );

    const objectNodesInputEnabledProperty = new BooleanProperty( true, {
      tandem: objectNodeGroupTandem.createTandem( 'inputEnabledProperty' )
    } );

    const dragIndicatorArrowNode = new DragIndicatorArrowNode( {
      tandem: options.tandem.createTandem( 'dragIndicatorArrowNode' ),
      visible: false
    } );

    backObjectLayer.addChild( dragIndicatorArrowNode );

    const updateDragIndictatorVisible = () => {

      // add the dragIndicatorArrowNode above the last object when it is added to the play area. if an object was
      // moved before this happens, don't show the dragIndicatorArrowNode
      if ( sceneModel.soccerBallCountProperty.value === sceneModel.maxSoccerBalls &&
           objectNodesInputEnabledProperty.value &&
           _.every( sceneModel.soccerBalls, soccerBall => soccerBall.valueProperty.value !== null ) &&
           !model.soccerBallHasBeenDraggedProperty.value ) {

        const lastBall = sceneModel.soccerBalls[ sceneModel.soccerBalls.length - 1 ];
        const value = lastBall.valueProperty.value!;

        dragIndicatorArrowNode.centerX = modelViewTransform.modelToViewX( value );

        const dragIndicatorArrowNodeMargin = 6;

        // calculate where the top object is
        const topObjectPositionY = modelViewTransform.modelToViewY( 0 ) -
                                   ( sceneModel.getOtherObjectsAtTarget( lastBall ).length + 1 ) *
                                   Math.abs( modelViewTransform.modelToViewDeltaY( CAVObjectType.SOCCER_BALL.radius ) ) * 2 -
                                   dragIndicatorArrowNodeMargin;

        dragIndicatorArrowNode.bottom = topObjectPositionY;
        dragIndicatorArrowNode.visible = true;
      }
      else {
        dragIndicatorArrowNode.visible = false;
      }
    };

    model.soccerBallHasBeenDraggedProperty.link( updateDragIndictatorVisible );

    sceneModel.soccerBalls.forEach( ( soccerBall, index ) => {
      const soccerBallNode = new SoccerBallNode(
        soccerBall,
        sceneModel.isVisibleProperty,
        model.isShowingPlayAreaMedianProperty,
        modelViewTransform,
        objectNodesInputEnabledProperty, {
          tandem: options.tandem.createTandem( 'soccerBalls' ).createTandem( 'soccerBallNode' + index )
        } );

      backObjectLayer.addChild( soccerBallNode );

      // While flying, it should be in front in z-order, to be in front of the accordion box
      soccerBall.animationModeProperty.lazyLink( ( animationMode, oldAnimationModel ) => {
        if ( animationMode === AnimationMode.FLYING ) {
          backObjectLayer.removeChild( soccerBallNode );
          frontObjectLayer.addChild( soccerBallNode );
        }
        else if ( oldAnimationModel ) {
          frontObjectLayer.removeChild( soccerBallNode );
          backObjectLayer.addChild( soccerBallNode );
        }
      } );

      soccerBall.valueProperty.link( ( value, oldValue ) => updateDragIndictatorVisible() );

      soccerBall.valueProperty.link( ( value, oldValue ) => {

        // If the value changed from numeric to numeric, it must have been by user dragging it.
        // It's simpler to have the listener here because in the model or drag listener, there is rounding/snapping
        // And we only want to hide the indicator of the user dragged the ball a full tick mark
        if ( oldValue !== null ) {
          model.soccerBallHasBeenDraggedProperty.value = true;
        }
      } );
    } );

    const playAreaMedianIndicatorNode = new PlayAreaMedianIndicatorNode();
    frontObjectLayer.addChild( playAreaMedianIndicatorNode );

    this.updateMedianNode = () => {
      const medianValue = sceneModel.medianValueProperty.value;
      const visible = medianValue !== null && model.isShowingPlayAreaMedianProperty.value && sceneModel.isVisibleProperty.value;

      if ( visible ) {

        // if there is a ball at that location, go above the ball
        const ballsAtLocation = sceneModel.soccerBalls.filter( soccerBall => soccerBall.valueProperty.value === medianValue );
        const modelHeight = ballsAtLocation.length * CAVObjectType.SOCCER_BALL.radius * 2; // assumes no spacing

        const viewHeight = modelViewTransform.modelToViewDeltaY( modelHeight );

        playAreaMedianIndicatorNode.centerX = modelViewTransform.modelToViewX( medianValue );
        playAreaMedianIndicatorNode.bottom = modelViewTransform.modelToViewY( 0 ) + viewHeight;

        const accordionBox = getAccordionBox();

        // The arrow shouldn't overlap the accordion box
        if ( accordionBox ) {
          const accordionBoxHeight = accordionBox.expandedProperty.value ? accordionBox.getExpandedBoxHeight() : accordionBox.getCollapsedBoxHeight();
          if ( playAreaMedianIndicatorNode.top < accordionBox.top + accordionBoxHeight ) {
            playAreaMedianIndicatorNode.top = accordionBox.top + accordionBoxHeight + 4;
          }
        }
      }
      playAreaMedianIndicatorNode.visible = visible;
    };
    sceneModel.medianValueProperty.link( this.updateMedianNode );
    sceneModel.objectChangedEmitter.addListener( this.updateMedianNode );
    sceneModel.isVisibleProperty.link( this.updateMedianNode );

    const soccerPlayerNodes = sceneModel.soccerPlayers.map( soccerPlayer => new SoccerPlayerNode( soccerPlayer, modelViewTransform, sceneModel.isVisibleProperty ) );

    soccerPlayerNodes.forEach( soccerPlayerNode => frontObjectLayer.addChild( soccerPlayerNode ) );

    const varModel = model as VariabilityModel;
    const varSceneModel = sceneModel as VariabilitySceneModel;

    if ( varModel && varModel.isInfoShowingProperty && varModel.selectedSceneModelProperty && varSceneModel ) {
      const infoDialog = new InfoDialog( varModel, varSceneModel, {
        tandem: options.tandem.createTandem( 'infoDialog' )
      } );

      Multilink.multilink( [ varModel.isInfoShowingProperty, varSceneModel.isVisibleProperty ],
        ( isInfoShowing, isVisible ) => {
          if ( isInfoShowing && isVisible ) {
            infoDialog.show();
          }
          else {
            infoDialog.hide();
          }
        } );
    }

    model.isShowingPlayAreaMedianProperty.link( this.updateMedianNode );
  }
}

centerAndVariability.register( 'SceneView', SceneView );