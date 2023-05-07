// Copyright 2022-2023, University of Colorado Boulder

/**
 * LevelSelectionButtonGroup is a group of related LevelSelectionButtons, used in games.
 *
 * Responsibilities include:
 * - Instantiation of the buttons, based on an 'items' array that describes the buttons.
 * - Setting an effective uniform size for the button icons.
 * - Layout of the buttons, see details below.
 * - Support for the gameLevels query parameter, via LevelSelectionButtonGroupOptions.gameLevels.
 *
 * Layout:
 * - The default layout is a single row of buttons, customizable via LevelSelectionButtonGroupOptions.flowBoxOptions.
 * - To create multiple rows of buttons, see example MultiRowButtonGroup in demoLevelSelectionButtonGroup.ts.
 * - To create a custom layout, see example XButtonGroup in demoLevelSelectionButtonGroup.ts.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import PickRequired from '../../phet-core/js/types/PickRequired.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { AlignBox, AlignGroup, FlowBox, FlowBoxOptions, LayoutNode, Node, NodeLayoutConstraint, NodeOptions } from '../../scenery/js/imports.js';
import LevelSelectionButton, { LevelSelectionButtonOptions } from './LevelSelectionButton.js';
import TProperty from '../../axon/js/TProperty.js';
import Tandem from '../../tandem/js/Tandem.js';
import vegas from './vegas.js';

// Describes one LevelSelectionButton
export type LevelSelectionButtonGroupItem = {

  // The icon displayed on the button
  icon: Node;

  // The score displayed on the button
  scoreProperty: TProperty<number>;

  // Name used when creating the button's tandem, defaults to `level${N}Button`
  tandemName?: string;

  // Options for the button. These will override LevelSelectionButtonGroupOptions.levelSelectionButtonOptions.
  // Setting tandem is the responsibility of the group, so it is omitted here.
  options?: StrictOmit<LevelSelectionButtonOptions, 'tandem'>;
};

type SelfOptions = {

  // Options for all LevelSelectionButton instances in the group.
  // These can be overridden for specific button(s) via LevelSelectionButtonGroupItem.options.
  levelSelectionButtonOptions?: StrictOmit<LevelSelectionButtonOptions, 'tandem'>;

  // Options for the default layout, which is a FlowBox. Ignored if createLayoutNode is provided.
  flowBoxOptions?: StrictOmit<FlowBoxOptions, 'children'>;

  // Creates the Node that handles layout of the buttons.
  // Use this option if you have a custom layout that cannot be achieved using the default FlowBox.
  createLayoutNode?: ( buttons: LevelSelectionButton[] ) => LayoutNode<NodeLayoutConstraint>;

  // Game levels whose buttons should be visible. Levels are numbered starting from 1, to comply with the gameLevels
  // query parameter. Set this to the value of the gameLevels query parameter, if supported by your sim.
  // See getGameLevelsSchema.ts.
  gameLevels?: number[];
};

export type LevelSelectionButtonGroupOptions = SelfOptions & StrictOmit<NodeOptions, 'children'> & PickRequired<NodeOptions, 'tandem'>;

export default class LevelSelectionButtonGroup extends Node {

  // Buttons, ordered by increasing level number.
  // Note that level numbering starts from 1, to match the gameLevels query parameter.
  private readonly buttons: LevelSelectionButton[];

  /**
   * @param items - descriptions of the LevelSelectionButtons, ordered by increasing level number
   * @param [providedOptions]
   */
  public constructor( items: LevelSelectionButtonGroupItem[], providedOptions?: LevelSelectionButtonGroupOptions ) {
    assert && assert( items.length > 0, 'at least one item must be specified' );

    const options = optionize<LevelSelectionButtonGroupOptions,
      StrictOmit<SelfOptions, 'createLayoutNode' | 'gameLevels' | 'levelSelectionButtonOptions'>, NodeOptions>()( {

      // The default layout is a single row of buttons.
      flowBoxOptions: {
        orientation: 'horizontal',
        spacing: 10
      },
      // @ts-expect-error This default is provided for JavaScript simulations.
      tandem: Tandem.REQUIRED
    }, providedOptions );

    // All icons will have the same effective size.
    const alignBoxOptions = {
      group: new AlignGroup()
    };

    // Create the LevelSelectionButton instances.
    const buttons = items.map( ( item, index ) => {

      let tandem = Tandem.OPT_OUT;
      if ( options.tandem.supplied ) {
        const tandemName = item.tandemName || `level${index + 1}Button`;
        tandem = options.tandem.createTandem( tandemName );
      }

      return new LevelSelectionButton( new AlignBox( item.icon, alignBoxOptions ), item.scoreProperty,
        combineOptions<LevelSelectionButtonOptions>( {
          tandem: tandem
        }, options.levelSelectionButtonOptions, item.options ) );
    } );

    // Hide buttons for levels that are not included in gameLevels.
    // All buttons must be instantiated so that the PhET-iO API is not changed conditionally.
    if ( options.gameLevels ) {
      assert && assert( options.gameLevels.length > 0, 'at least 1 gameLevel must be visible' );
      assert && assert( _.every( options.gameLevels, gameLevel => ( Number.isInteger( gameLevel ) && gameLevel > 0 ) ),
        'gameLevels must be positive integers' );
      buttons.forEach( ( button, index ) => {
        button.visible = options.gameLevels!.includes( index + 1 );
      } );
    }

    let layoutNode;
    if ( options.createLayoutNode ) {
      layoutNode = options.createLayoutNode( buttons );
    }
    else {

      // The default layout is a FlowBox, customizable via options.flowBoxOptions.
      layoutNode = new FlowBox( combineOptions<FlowBoxOptions>( {
        children: buttons
      }, options.flowBoxOptions ) );
    }

    options.children = [ layoutNode ];

    super( options );

    this.buttons = buttons;
  }

  /**
   * Sets the focus to the button associated with a specified level number. If your simulation supports keyboard
   * traversal, you'll typically need to call this when returning to the UI that show the LevelSelectionButtonGroup,
   * for example, when the 'Back' or 'Start Over' button is pressed in a game.
   * @param level - numbered starting from 1, to comply with gameLevels query parameter
   */
  public focusLevelSelectionButton( level: number ): void {
    assert && assert( Number.isInteger( level ) && level > 0 && level <= this.buttons.length,
      `invalid level: ${level}` );
    this.buttons[ level - 1 ].focus();
  }
}

vegas.register( 'LevelSelectionButtonGroup', LevelSelectionButtonGroup );