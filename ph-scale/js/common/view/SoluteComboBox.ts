// Copyright 2013-2023, University of Colorado Boulder

/**
 * Combo box for choosing a solute (stock solution).
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickOptional from '../../../../phet-core/js/types/PickOptional.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import ComboBox, { ComboBoxItem, ComboBoxOptions } from '../../../../sun/js/ComboBox.js';
import phScale from '../../phScale.js';
import Solute from '../model/Solute.js';

type SelfOptions = EmptySelfOptions;

type SoluteComboBoxOptions = SelfOptions &
  PickRequired<ComboBoxOptions, 'tandem'> &
  PickOptional<ComboBoxOptions, 'maxWidth'>;

export default class SoluteComboBox extends ComboBox<Solute> {

  public constructor( selectedSoluteProperty: Property<Solute>,
                      soluteListParent: Node,
                      providedOptions: SoluteComboBoxOptions ) {

    const options = optionize<SoluteComboBoxOptions, SelfOptions, ComboBoxOptions>()( {

      // ComboBoxOptions
      listPosition: 'below',
      xMargin: 16,
      yMargin: 16,
      highlightFill: 'rgb( 218, 255, 255 )',
      buttonLineWidth: 2,
      cornerRadius: 10
    }, providedOptions );

    const items: ComboBoxItem<Solute>[] = [];

    const solutes = selectedSoluteProperty.validValues!;
    assert && assert( solutes );

    // Create items for the listbox
    solutes.forEach( solute => {

      // color chip
      const colorNode = new Rectangle( 0, 0, 20, 20, {
        fill: solute.stockColor,
        stroke: solute.stockColor.darkerColor()
      } );

      // label
      const labelText = new Text( solute.nameProperty, {
        font: new PhetFont( 22 ),
        maxWidth: 140 // determined empirically
      } );

      const hBox = new HBox( {
        spacing: 5,
        children: [ colorNode, labelText ]
      } );

      items.push( {
        value: solute,
        createNode: () => hBox,
        tandemName: `${solute.tandemName}${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
      } );
    } );

    super( selectedSoluteProperty, items, soluteListParent, options );
  }
}

phScale.register( 'SoluteComboBox', SoluteComboBox );