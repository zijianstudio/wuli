// Copyright 2022-2023, University of Colorado Boulder

/**
 * Panel that contains a stack of  paper ones or objects, which can be clicked or dragged to create draggable
 * paper ones or objects. It also contains spinner buttons that can send a paper one or object out of the panel, or
 * request them to be brought back into the panel.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { DragListener, Node, PressListenerEvent, Rectangle } from '../../../../scenery/js/imports.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import TenFrameNode from '../../common/view/TenFrameNode.js';
import TenFrame from '../model/TenFrame.js';
import LabModel from '../model/LabModel.js';
import LabScreenView from './LabScreenView.js';
import NumberSuiteCommonPanel from '../../common/view/NumberSuiteCommonPanel.js';
import NumberSuiteCommonConstants from '../../common/NumberSuiteCommonConstants.js';
import NumberSuiteCommonPreferences from '../../common/model/NumberSuiteCommonPreferences.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';

const ICON_SIE_LENGTH = 20;

class TenFrameCreatorPanel extends NumberSuiteCommonPanel {
  public readonly iconNode: Node;

  // the scale of the icon relative to the standard ten frame size, which is the size of the ten frames in the countingArea
  public static readonly ICON_SCALE = ICON_SIE_LENGTH / TenFrame.SQUARE_SIDE_LENGTH;

  public constructor( model: LabModel, screenView: LabScreenView<NumberSuiteCommonPreferences> ) {

    // create the ten frame icon and the plus icon
    const iconNode = TenFrameNode.getTenFramePath( {
      sideLength: ICON_SIE_LENGTH,
      lineWidth: 0.8,
      visibleProperty: new DerivedProperty( [ model.tenFrames.lengthProperty ],
        length => length < NumberSuiteCommonConstants.MAX_AMOUNT_OF_TEN_FRAMES )
    } );

    const creatorNodeBackground = new Rectangle( 0, 0, iconNode.width, NumberSuiteCommonConstants.CREATOR_ICON_HEIGHT );
    iconNode.center = creatorNodeBackground.center;
    creatorNodeBackground.addChild( iconNode );

    const dragListener = DragListener.createForwardingListener( ( event: PressListenerEvent ) => {
      const tenFrame = new TenFrame( Vector2.ZERO );
      tenFrame.positionProperty.value = screenView.globalToLocalPoint( event.pointer.point ).minus( tenFrame.localBounds.centerBottom );
      model.dragTenFrameFromIcon( tenFrame );
      const tenFrameNode = screenView.getTenFrameNode( tenFrame );
      tenFrameNode.dragListener.press( event, tenFrameNode );
    } );

    iconNode.cursor = 'pointer';
    iconNode.inputListeners = [ dragListener ];

    super( creatorNodeBackground, {
      xMargin: 10
    } );

    this.iconNode = iconNode;
  }
}

numberSuiteCommon.register( 'TenFrameCreatorPanel', TenFrameCreatorPanel );
export default TenFrameCreatorPanel;
