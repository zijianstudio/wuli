// Copyright 2015-2023, University of Colorado Boulder

/**
 * Adding screenview for Make a Ten. Allows entering two numbers with a keypad, so that the user can experiment with
 * adding with the sim's usual constraints.
 *
 * @author Sharfudeen Ashraf
 */

import CountingCommonScreenView from '../../../../../counting-common/js/common/view/CountingCommonScreenView.js';
import { Color, Image, Rectangle } from '../../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../../sun/js/buttons/RectangularPushButton.js';
import edit_png from '../../../../images/edit_png.js';
import makeATen from '../../../makeATen.js';
import MakeATenConstants from '../../common/MakeATenConstants.js';
import AdditionTermsNode from '../../common/view/AdditionTermsNode.js';
import ActiveTerm from '../model/ActiveTerm.js';
import KeyboardPanel from './KeyboardPanel.js';

// constants
const MAX_DIGITS = 3;

class MakeATenAddingScreenView extends CountingCommonScreenView {

  /**
   * @param {MakeATenAddingModel} model
   */
  constructor( model ) {

    super( model );

    this.finishInitialization();

    function createEditNumberButton( term ) {
      return new RectangularPushButton( {
        touchAreaXDilation: 10,
        touchAreaYDilation: 10,
        content: new Image( edit_png, { scale: 0.5 } ),
        listener: () => {
          model.additionTerms.activeTermProperty.value = term;
        },
        baseColor: 'white'
      } );
    }

    // The node that display "12 + 100 = "
    const additionTermsNode = new AdditionTermsNode( model.additionTerms, true );
    this.addChild( additionTermsNode );

    additionTermsNode.left = this.layoutBounds.left + 38;
    additionTermsNode.top = this.layoutBounds.top + 85;

    const leftEditButton = createEditNumberButton( ActiveTerm.LEFT );
    const rightEditButton = createEditNumberButton( ActiveTerm.RIGHT );
    leftEditButton.top = rightEditButton.top = this.layoutBounds.top + 32;
    leftEditButton.right = additionTermsNode.getLeftAlignment() + additionTermsNode.x;
    rightEditButton.left = additionTermsNode.getRightAlignment() + additionTermsNode.x;
    this.addChild( leftEditButton );
    this.addChild( rightEditButton );

    // Where all of the counting objects go (from supertype)
    this.addChild( this.countingObjectLayerNode );

    function onNumberSubmit( value ) {
      if ( model.additionTerms.activeTermProperty.value === ActiveTerm.LEFT ) {
        model.additionTerms.leftTermProperty.value = value;
      }
      if ( model.additionTerms.activeTermProperty.value === ActiveTerm.RIGHT ) {
        model.additionTerms.rightTermProperty.value = value;
      }

      model.setupTerms();
      model.additionTerms.activeTermProperty.value = ActiveTerm.NONE;
    }

    const dimBackground = new Rectangle( {
      fill: new Color( MakeATenConstants.SCREEN_BACKGROUND_COLOR ).colorUtilsDarker( 0.4 ).withAlpha( 0.4 )
    } );
    dimBackground.addInputListener( {
      down: event => {
        model.additionTerms.activeTermProperty.value = ActiveTerm.NONE; // this will close the keyboard button
      }
    } );
    this.visibleBoundsProperty.link( visibleBounds => {
      dimBackground.rectBounds = visibleBounds.dilated( 5 ); // Extra dilation so anti-aliasing doesn't mess with borders
    } );
    this.addChild( dimBackground );

    const keyboardPanel = new KeyboardPanel( onNumberSubmit, MAX_DIGITS );
    this.addChild( keyboardPanel );

    keyboardPanel.centerX = additionTermsNode.centerX - 25;
    keyboardPanel.top = additionTermsNode.top + 120;

    model.additionTerms.activeTermProperty.link( term => {
      keyboardPanel.visible = dimBackground.visible = term !== ActiveTerm.NONE;

      if ( term === ActiveTerm.LEFT ) {
        keyboardPanel.setValue( model.additionTerms.leftTermProperty.value );
      }
      if ( term === ActiveTerm.RIGHT ) {
        keyboardPanel.setValue( model.additionTerms.rightTermProperty.value );
      }
    } );

    this.layoutControls();
  }
}

makeATen.register( 'MakeATenAddingScreenView', MakeATenAddingScreenView );
export default MakeATenAddingScreenView;