// Copyright 2022, University of Colorado Boulder

/**
 * GameInfoDialog shows descriptions for the levels of a game.  Each description is on a separate line.
 * If the simulation supports the gameLevels query parameter (see getGameLevelsSchema.ts) the caller
 * can optionally provide options.gameLevels to control which descriptions are visible.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Node, RichText, RichTextOptions, VBox, VBoxOptions } from '../../scenery/js/imports.js';
import vegas from './vegas.js';
import optionize, { EmptySelfOptions } from '../../phet-core/js/optionize.js';
import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import Dialog, { DialogOptions } from '../../sun/js/Dialog.js';
import Tandem from '../../tandem/js/Tandem.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import ScreenView from '../../joist/js/ScreenView.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';

const DEFAULT_DESCRIPTION_TEXT_FONT = new PhetFont( 24 );

type SelfOptions = {

  // Game levels whose descriptions should be visible in the dialog. Levels are numbered starting from 1.
  // This is typically set to the value of the gameLevels query parameter. See getGameLevelsSchema.ts.
  gameLevels?: number[];

  // Options for the description text nodes
  descriptionTextOptions?: StrictOmit<RichTextOptions, 'tandem'>;

  // Options for the layout (VBox)
  vBoxOptions?: StrictOmit<VBoxOptions, 'children' | 'maxWidth'>;

  // constrains the width of the Dialog's content and title
  maxContentWidth?: number;
};

export type GameInfoDialogOptions = SelfOptions & DialogOptions;

export default class GameInfoDialog extends Dialog {

  private readonly disposeGameInfoDialog: () => void;

  /**
   * @param levelDescriptions - level descriptions, in order of ascending level number
   * @param providedOptions
   */
  public constructor( levelDescriptions: ( string | TReadOnlyProperty<string> )[], providedOptions?: GameInfoDialogOptions ) {

    const options = optionize<GameInfoDialogOptions, StrictOmit<SelfOptions, 'gameLevels'>, DialogOptions>()( {
      descriptionTextOptions: {
        font: DEFAULT_DESCRIPTION_TEXT_FONT
      },
      vBoxOptions: {
        align: 'left',
        spacing: 20
      },
      maxContentWidth: 0.75 * ScreenView.DEFAULT_LAYOUT_BOUNDS.width,
      tandem: Tandem.REQUIRED
    }, providedOptions );

    // Constrain the width of the title, and ensure that the title can still be used with scenery DAG feature.
    if ( options.title ) {
      options.title = new Node( {
        children: [ options.title ],
        maxWidth: options.maxContentWidth
      } );
    }

    const descriptionNodes = levelDescriptions.map( ( levelDescription, index ) =>
      new RichText( levelDescription, optionize<RichTextOptions, EmptySelfOptions, RichTextOptions>()( {
        tandem: options.tandem.createTandem( `level${index}DescriptionText` )
      }, options.descriptionTextOptions ) )
    );

    // Hide descriptions for levels that are not included in options.gameLevels.
    // We must still create these Nodes so that the PhET-iO API is not changed.
    if ( options.gameLevels ) {
      assert && assert( _.every( options.gameLevels, gameLevel => ( Number.isInteger( gameLevel ) && gameLevel > 0 ) ),
        'gameLevels must be positive integers' );
      descriptionNodes.forEach( ( node, index ) => {
        node.visible = options.gameLevels!.includes( index + 1 );
      } );
    }

    // Vertical layout
    const content = new VBox( optionize<VBoxOptions, EmptySelfOptions, VBoxOptions>()( {
      children: descriptionNodes,
      maxWidth: options.maxContentWidth // scale all descriptions uniformly
    }, options.vBoxOptions ) );

    super( content, options );

    this.disposeGameInfoDialog = () => {
      descriptionNodes.forEach( node => node.dispose() );
    };
  }

  public override dispose(): void {
    this.disposeGameInfoDialog();
    super.dispose();
  }
}

vegas.register( 'GameInfoDialog', GameInfoDialog );