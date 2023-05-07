// Copyright 2021-2023, University of Colorado Boulder

/**
 * The ScreenView for this simulation. For readability, implementation of this class is broken into blocks of code that
 *
 * - Create view subcomponents
 * - Set rendering order
 * - Set layout
 * - Set traversal order
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuadrilateralConstants from '../../QuadrilateralConstants.js';
import quadrilateral from '../../quadrilateral.js';
import QuadrilateralModel from '../model/QuadrilateralModel.js';
import { VBox } from '../../../../scenery/js/imports.js';
import QuadrilateralQueryParameters from '../QuadrilateralQueryParameters.js';
import QuadrilateralNode from './QuadrilateralNode.js';
import QuadrilateralSoundView from './sound/QuadrilateralSoundView.js';
import QuadrilateralStrings from '../../QuadrilateralStrings.js';
import QuadrilateralDescriber from './QuadrilateralDescriber.js';
import QuadrilateralDebuggingPanel from './QuadrilateralDebuggingPanel.js';
import QuadrilateralVisibilityControls from './QuadrilateralVisibilityControls.js';
import QuadrilateralGridNode from './QuadrilateralGridNode.js';
import QuadrilateralAlerter from './QuadrilateralAlerter.js';
import QuadrilateralOptionsModel from '../model/QuadrilateralOptionsModel.js';
import QuadrilateralMediaPipe from './prototype/QuadrilateralMediaPipe.js';
import QuadrilateralDiagonalGuidesNode from './QuadrilateralDiagonalGuidesNode.js';
import QuadrilateralShapeNameDisplay from './QuadrilateralShapeNameDisplay.js';
import MediaPipeQueryParameters from '../../../../tangible/js/mediaPipe/MediaPipeQueryParameters.js';
import QuadrilateralInteractionCueNode from './QuadrilateralInteractionCueNode.js';
import ResetShapeButton from './ResetShapeButton.js';
import ShapeSoundsCheckbox from './ShapeSoundsCheckbox.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import SmallStepsLockToggleButton from './SmallStepsLockToggleButton.js';
import QuadrilateralTangibleControls from './prototype/QuadrilateralTangibleControls.js';
import QuadrilateralModelViewTransform from './QuadrilateralModelViewTransform.js';
import QuadrilateralTangibleController from './prototype/QuadrilateralTangibleController.js';
import { SpeakableResolvedResponse } from '../../../../utterance-queue/js/ResponsePacket.js';

export default class QuadrilateralScreenView extends ScreenView {
  private readonly model: QuadrilateralModel;
  private readonly modelViewTransform: ModelViewTransform2;
  private readonly quadrilateralNode: QuadrilateralNode;
  private readonly quadrilateralSoundView: QuadrilateralSoundView;
  private readonly quadrilateralDescriber: QuadrilateralDescriber;
  private readonly quadrilateralAlerter: QuadrilateralAlerter;

  // Prototype components are only constructed and available when running with relevant query parameters.
  private readonly quadrilateralTangibleController: QuadrilateralTangibleController | null = null;
  private readonly quadrilateralMediaPipe: QuadrilateralMediaPipe | null = null;

  public constructor( model: QuadrilateralModel, optionsModel: QuadrilateralOptionsModel, tandem: Tandem ) {
    super( {

      // phet-io
      tandem: tandem
    } );

    this.model = model;
    const visibilityModel = model.visibilityModel;

    //---------------------------------------------------------------------------------------------------------------
    // Create view subcomponents
    //---------------------------------------------------------------------------------------------------------------
    this.modelViewTransform = new QuadrilateralModelViewTransform( QuadrilateralConstants.MODEL_BOUNDS, this.layoutBounds );
    this.quadrilateralDescriber = new QuadrilateralDescriber(
      model.quadrilateralShapeModel,
      visibilityModel.shapeNameVisibleProperty,
      visibilityModel.markersVisibleProperty,
      this.modelViewTransform
    );
    this.quadrilateralSoundView = new QuadrilateralSoundView( model, optionsModel.soundOptionsModel );

    // miscellaneous sim and visibility control components
    const smallStepsLockToggleButton = new SmallStepsLockToggleButton( model.lockToMinorIntervalsProperty, {
      tandem: tandem.createTandem( 'smallStepsLockToggleButton' )
    } );
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
      },
      tandem: tandem.createTandem( 'resetAllButton' )
    } );
    const visibilityControls = new QuadrilateralVisibilityControls(
      visibilityModel,
      {
        tandem: tandem.createTandem( 'visibilityControls' )
      } );

    // shape controls components
    const shapeNameDisplay = new QuadrilateralShapeNameDisplay(
      visibilityModel.shapeNameVisibleProperty,
      model.quadrilateralShapeModel.shapeNameProperty,
      this.quadrilateralDescriber,
      tandem.createTandem( 'quadrilateralShapeNameDisplay' )
    );
    const resetShapeButton = new ResetShapeButton(
      model.quadrilateralShapeModel,
      tandem.createTandem( 'resetShapeButton' )
    );
    const shapeSoundsCheckbox = new ShapeSoundsCheckbox(
      model.shapeSoundEnabledProperty,
      tandem.createTandem( 'shapeSoundsCheckbox' )
    );

    // quadrilateral shape and grid components
    this.quadrilateralNode = new QuadrilateralNode(
      model,
      this.modelViewTransform,
      this.layoutBounds,
      this.quadrilateralDescriber, {
        tandem: tandem.createTandem( 'quadrilateralNode' )
      } );

    const diagonalGuidesNode = new QuadrilateralDiagonalGuidesNode(
      model.quadrilateralShapeModel,
      visibilityModel.diagonalGuidesVisibleProperty,
      this.modelViewTransform
    );
    const interactionCueNode = new QuadrilateralInteractionCueNode(
      model.quadrilateralShapeModel,
      model.tangibleConnectionModel.connectedToDeviceProperty,
      model.resetEmitter,
      this.modelViewTransform
    );
    const gridNode = new QuadrilateralGridNode( visibilityModel.gridVisibleProperty, this.modelViewTransform );

    // debugging components
    const debugValuesPanel = new QuadrilateralDebuggingPanel( model );
    visibilityModel.showDebugValuesProperty.link( showValues => {
      debugValuesPanel.visible = showValues;
    } );

    // tangible components
    if ( QuadrilateralQueryParameters.deviceConnection || MediaPipeQueryParameters.cameraInput === 'hands' ) {
      this.quadrilateralTangibleController = new QuadrilateralTangibleController( model );
    }

    // this parent only has children if relevant query params are provided, but is always created for easy layout
    const deviceConnectionParentNode = new VBox( {
      align: 'left',
      spacing: QuadrilateralConstants.CONTROLS_SPACING
    } );
    if ( QuadrilateralQueryParameters.deviceConnection ) {
      assert && assert( this.quadrilateralTangibleController, 'The QuadrilateralTangibleController is not available' );
      deviceConnectionParentNode.children = [
        new QuadrilateralTangibleControls(
          model.tangibleConnectionModel,
          this.quadrilateralTangibleController!,
          tandem.createTandem( 'connectionControls' )
        )
      ];
      deviceConnectionParentNode.top = gridNode.top;
      deviceConnectionParentNode.left = resetAllButton.left;
    }
    if ( MediaPipeQueryParameters.cameraInput === 'hands' ) {
      assert && assert( this.quadrilateralTangibleController, 'The QuadrilateralTangibleController is not available' );
      this.quadrilateralMediaPipe = new QuadrilateralMediaPipe( model, this.quadrilateralTangibleController! );
    }

    // voicing components
    this.quadrilateralAlerter = new QuadrilateralAlerter( model, this, this.modelViewTransform, this.quadrilateralDescriber );

    //---------------------------------------------------------------------------------------------------------------
    // rendering order - see https://github.com/phetsims/quadrilateral/issues/178
    //---------------------------------------------------------------------------------------------------------------
    this.children = [

      // shape area
      gridNode,
      diagonalGuidesNode,
      this.quadrilateralNode,
      interactionCueNode,
      debugValuesPanel,

      // controls
      visibilityControls,
      smallStepsLockToggleButton,
      resetAllButton,
      shapeSoundsCheckbox,
      shapeNameDisplay,
      resetShapeButton,
      deviceConnectionParentNode
    ];

    //---------------------------------------------------------------------------------------------------------------
    // Layout - all relative to the grid space of the quadrilateral because its size and position is determined by
    // the modelViewTransform
    //---------------------------------------------------------------------------------------------------------------
    resetAllButton.leftBottom = new Vector2(
      gridNode.right + QuadrilateralConstants.VIEW_SPACING,
      this.layoutBounds.maxY - QuadrilateralConstants.SCREEN_VIEW_Y_MARGIN
    );
    smallStepsLockToggleButton.leftBottom = resetAllButton.leftTop.minusXY( 0, QuadrilateralConstants.VIEW_GROUP_SPACING );
    visibilityControls.leftCenter = gridNode.rightCenter.plusXY( QuadrilateralConstants.VIEW_SPACING, 0 );

    shapeNameDisplay.centerBottom = gridNode.centerTop.minusXY( 0, QuadrilateralConstants.VIEW_SPACING );
    shapeSoundsCheckbox.rightCenter = new Vector2( gridNode.right, shapeNameDisplay.centerY );

    // dynamic string layout
    resetShapeButton.boundsProperty.link( () => {
      resetShapeButton.rightCenter = shapeSoundsCheckbox.leftCenter.minusXY(
        // effectively centers this button between the other name display controls
        ( shapeSoundsCheckbox.left - shapeNameDisplay.right - resetShapeButton.width ) / 2, 0
      );
    } );

    deviceConnectionParentNode.leftBottom = visibilityControls.leftTop.minusXY( 0, QuadrilateralConstants.VIEW_GROUP_SPACING );

    debugValuesPanel.leftTop = gridNode.leftTop.plusXY( 5, 5 );

    //---------------------------------------------------------------------------------------------------------------
    // Traversal order
    //---------------------------------------------------------------------------------------------------------------
    this.pdomPlayAreaNode.pdomOrder = [ this.quadrilateralNode, shapeNameDisplay, resetShapeButton, shapeSoundsCheckbox ];
    this.pdomControlAreaNode.pdomOrder = [ visibilityControls, smallStepsLockToggleButton, resetAllButton, deviceConnectionParentNode ];
  }

  /**
   * Get the content that is spoken from the Voicing toolbar to describe this ScreenView.
   */
  public override getVoicingOverviewContent(): SpeakableResolvedResponse {
    return QuadrilateralStrings.a11y.voicing.overviewContentStringProperty;
  }

  /**
   * Get the details content that is spoken from the Voicing toolbar to describe details about the simulation.
   */
  public override getVoicingDetailsContent(): SpeakableResolvedResponse {
    const firstStatement = this.quadrilateralDescriber.getFirstDetailsStatement();
    const secondStatement = this.quadrilateralDescriber.getSecondDetailsStatement();
    const thirdStatement = this.quadrilateralDescriber.getThirdDetailsStatement();
    const fourthStatement = this.quadrilateralDescriber.getFourthDetailsStatement();
    const fifthStatement = this.quadrilateralDescriber.getFifthDetailsStatement();
    assert && assert( firstStatement, 'there should always be a first statement for details' );

    let contentString = firstStatement;

    // Append remaining statements, if they exist with current sim state.
    // NOTE: This is bad for i18n but PhET decided that is OK for now.
    const remainingStatements = [ secondStatement, thirdStatement, fourthStatement, fifthStatement ];
    remainingStatements.forEach( statement => {
      if ( statement ) {

        // i18n not supported, but statements might be a string Property
        const valueString = typeof statement === 'string' ? statement : statement.value;
        contentString += ' ' + valueString;
      }
    } );

    return contentString;
  }

  /**
   * Get the content that is spoken from the Voicing toolbar to describe this ScreenView. In this sim we use the hint
   * button to describe the parallelogram state and shape name of the quadrilateral.
   */
  public override getVoicingHintContent(): SpeakableResolvedResponse {
    return QuadrilateralStrings.a11y.voicing.hintContentStringProperty;
  }

  /**
   * Steps the view.
   * @param dt - time step, in seconds
   */
  public override step( dt: number ): void {
    if ( this.quadrilateralSoundView ) {
      this.quadrilateralSoundView.step( dt );
    }

    this.quadrilateralMediaPipe && this.quadrilateralMediaPipe.step( dt );

    this.quadrilateralNode && this.quadrilateralNode.step( dt );
  }
}

quadrilateral.register( 'QuadrilateralScreenView', QuadrilateralScreenView );