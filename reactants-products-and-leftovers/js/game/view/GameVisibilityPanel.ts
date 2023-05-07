// Copyright 2014-2023, University of Colorado Boulder

/**
 * Panel that contains radio buttons for selecting what's visible/hidden in Game challenges.
 * Provides the ability to hide either molecules or numbers (but not both).
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import H2ONode from '../../../../nitroglycerin/js/nodes/H2ONode.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { AlignBox, AlignBoxOptions, AlignGroup, HBox, Node, Path, PathOptions, Text, TextOptions } from '../../../../scenery/js/imports.js';
import eyeSlashSolidShape from '../../../../sherpa/js/fontawesome-5/eyeSlashSolidShape.js';
import eyeSolidShape from '../../../../sherpa/js/fontawesome-5/eyeSolidShape.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import RPALConstants from '../../common/RPALConstants.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
import ReactantsProductsAndLeftoversStrings from '../../ReactantsProductsAndLeftoversStrings.js';
import GameVisibility from '../model/GameVisibility.js';
import { AquaRadioButtonGroupItem } from '../../../../sun/js/AquaRadioButtonGroup.js';

const ICON_TEXT_SPACING = 7;
const TEXT_OPTIONS: TextOptions = {
  font: new PhetFont( 14 ),
  maxWidth: 350
};
const FONT_AWESOME_OPTIONS: PathOptions = {
  scale: 0.04,
  fill: 'black'
};

export default class GameVisibilityPanel extends Panel {

  public constructor( gameVisibilityProperty: EnumerationProperty<GameVisibility>, tandem: Tandem ) {

    // To make all icons have the same effective size
    const iconAlignBoxOptions: AlignBoxOptions = {
      group: new AlignGroup(),
      xAlign: 'left'
    };

    const radioButtonItems: AquaRadioButtonGroupItem<GameVisibility>[] = [
      {
        value: GameVisibility.SHOW_ALL,
        createNode: tandem => new ShowAllNode( tandem, iconAlignBoxOptions ),
        tandemName: 'showAllRadioButton'
      },
      {
        value: GameVisibility.HIDE_MOLECULES,
        createNode: ( tandem: Tandem ) => new HideMoleculesNode( tandem, iconAlignBoxOptions ),
        tandemName: 'hideMoleculesRadioButton'
      },
      {
        value: GameVisibility.HIDE_NUMBERS,
        createNode: ( tandem: Tandem ) => new HideNumbersNode( tandem, iconAlignBoxOptions ),
        tandemName: 'hideNumbersRadioButton'
      }
    ];

    const radioButtonGroup = new VerticalAquaRadioButtonGroup<GameVisibility>( gameVisibilityProperty, radioButtonItems, {
      spacing: 15,
      touchAreaXDilation: 10,
      touchAreaYDilation: 6,
      radioButtonOptions: {
        radius: 8,
        xSpacing: 10
      },
      tandem: tandem.createTandem( 'radioButtonGroup' )
    } );

    super( radioButtonGroup, {
      xMargin: 15,
      yMargin: 10,
      fill: 'rgb( 235, 245, 255 )',
      stroke: 'rgb( 180, 180, 180 )',
      lineWidth: 0.5,
      tandem: tandem
    } );
  }
}

/**
 * ShowAllNode is the content for the 'Show All' radio button, an open eye with text to the right of it.
 */
class ShowAllNode extends HBox {
  public constructor( tandem: Tandem, iconAlignBoxOptions: AlignBoxOptions ) {

    const icon = new AlignBox( new Path( eyeSolidShape, FONT_AWESOME_OPTIONS ), iconAlignBoxOptions );

    const text = new Text( ReactantsProductsAndLeftoversStrings.showAllStringProperty,
      combineOptions<TextOptions>( {
        tandem: tandem.createTandem( 'text' )
      }, TEXT_OPTIONS ) );

    super( {
      children: [ icon, text ],
      spacing: ICON_TEXT_SPACING
    } );
  }
}

/**
 * HideMoleculesNode is the content for the 'Hide Molecules' radio button,
 * a closed eye with '123' at lower right, and text to the right.
 */
class HideMoleculesNode extends HBox {
  public constructor( tandem: Tandem, iconAlignBoxOptions: AlignBoxOptions ) {

    const eyeNode = new Path( eyeSlashSolidShape, FONT_AWESOME_OPTIONS );
    const moleculeNode = new Node( {
      // wrap in a Node because H2ONode doesn't work with standard options
      children: [ new H2ONode( RPALConstants.MOLECULE_NODE_OPTIONS ) ],
      scale: 0.4,
      left: eyeNode.right + 2,
      centerY: eyeNode.bottom
    } );
    const icon = new AlignBox( new Node( { children: [ eyeNode, moleculeNode ] } ), iconAlignBoxOptions );

    const text = new Text( ReactantsProductsAndLeftoversStrings.hideMoleculesStringProperty,
      combineOptions<TextOptions>( {
        tandem: tandem.createTandem( 'text' )
      }, TEXT_OPTIONS ) );

    super( {
      children: [ icon, text ],
      spacing: ICON_TEXT_SPACING
    } );
  }
}

/**
 * HideNumbersNode is the content for the 'Hide Numbers' radio button,
 * a closed eye with H2O molecule at lower right, and text to the right.
 */
class HideNumbersNode extends HBox {
  public constructor( tandem: Tandem, iconAlignBoxOptions: AlignBoxOptions ) {

    const eyeNode = new Path( eyeSlashSolidShape, FONT_AWESOME_OPTIONS );
    const numbersNode = new Text( '123', {
      font: new PhetFont( 8 ),
      left: eyeNode.right + 2,
      centerY: eyeNode.bottom
    } );
    const icon = new AlignBox( new Node( { children: [ eyeNode, numbersNode ] } ), iconAlignBoxOptions );

    const text = new Text( ReactantsProductsAndLeftoversStrings.hideNumbersStringProperty,
      combineOptions<TextOptions>( {
        tandem: tandem.createTandem( 'text' )
      }, TEXT_OPTIONS ) );

    super( {
      children: [ icon, text ],
      spacing: ICON_TEXT_SPACING
    } );
  }
}

reactantsProductsAndLeftovers.register( 'GameVisibilityPanel', GameVisibilityPanel );