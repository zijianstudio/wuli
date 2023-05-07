// Copyright 2020-2022, University of Colorado Boulder

/**
 * A ComboBox with a label for the EnergySkateParkControlPanel. The layout of this type is meant to match
 * other controls in the EnergySkateParkControlPanel, and so layout is set with matchLayout(). See that
 * function for more information.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import { Node, Spacer, Text, VBox } from '../../../../scenery/js/imports.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkConstants from '../EnergySkateParkConstants.js';

class LabelledComboBox extends VBox {

  /**
   * @param {ComboBox} comboBox - the ComboBox to be labelled
   * @param {string} titleString
   * @param {Tandem} tandem
   */
  constructor( comboBox, titleString, tandem ) {
    super( {
      spacing: 5
    } );

    // @private {ComboBox}
    this.comboBox = comboBox;

    // @private {Text}
    this.titleNode = new Text( titleString, {
      font: EnergySkateParkConstants.CONTROL_TITLE_FONT,
      maxWidth: this.comboBox.width / 2
    } );

    // initial children, but layout probably needs to be specified with matchLayout()
    this.children = [ this.titleNode, this.comboBox ];
  }

  /**
   * Adjust the layout of the ComboBox and title to match the layout of other controls in the
   * EnergySkateParkControlPanel. The title will be left aligned with extra spacing to the right so
   * that the title aligns with other controls. The ComboBox remains center aligned.
   * @public
   *
   * @param {number} width - width of other controls to match, so that titleNode can align with other controls.
   */
  matchLayout( width ) {
    const spacer = new Spacer( width - this.titleNode.width, 0 );
    spacer.leftCenter = this.titleNode.rightCenter;
    const titleWithSpacer = new Node( { children: [ this.titleNode, spacer ] } );

    this.children = [ titleWithSpacer, this.comboBox ];
  }
}

energySkatePark.register( 'LabelledComboBox', LabelledComboBox );
export default LabelledComboBox;