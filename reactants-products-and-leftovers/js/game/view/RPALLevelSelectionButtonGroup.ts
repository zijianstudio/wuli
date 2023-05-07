// Copyright 2014-2023, University of Colorado Boulder

/**
 * RPALLevelSelectionButtonGroup is the group of level-selection buttons for the 'Game' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import H2ONode from '../../../../nitroglycerin/js/nodes/H2ONode.js';
import HClNode from '../../../../nitroglycerin/js/nodes/HClNode.js';
import NH3Node from '../../../../nitroglycerin/js/nodes/NH3Node.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { AlignBox, AlignGroup, HBox, Node, Text, TextOptions, VBox } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import LevelSelectionButtonGroup, { LevelSelectionButtonGroupItem } from '../../../../vegas/js/LevelSelectionButtonGroup.js';
import ScoreDisplayStars from '../../../../vegas/js/ScoreDisplayStars.js';
import RPALConstants from '../../common/RPALConstants.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
import ReactantsProductsAndLeftoversStrings from '../../ReactantsProductsAndLeftoversStrings.js';
import GameModel from '../model/GameModel.js';

const MOLECULE_SCALE = 3; // scale of the molecule icons used on the level-selection buttons
const QUESTION_MARK_OPTIONS: TextOptions = {
  font: new PhetFont( { size: 70, weight: 'bold' } ),
  maxWidth: 100
};

export default class RPALLevelSelectionButtonGroup extends LevelSelectionButtonGroup {

  public constructor( model: GameModel, tandem: Tandem ) {

    // To make all button icons have the same effective size
    const iconAlignGroup = new AlignGroup();

    // Functions to create icons for the level-selection buttons, indexed by level.
    const buttonIconFunctions = [ createLevel1ButtonIcon, createLevel2ButtonIcon, createLevel3ButtonIcon ];
    assert && assert( buttonIconFunctions.length === model.numberOfLevels );

    // Description of LevelSelectionButtons
    const levelSelectionButtonGroupItems: LevelSelectionButtonGroupItem[] = [];
    for ( let level = 0; level < model.numberOfLevels; level++ ) {
      const buttonTandemName = `level${level}Button`;
      levelSelectionButtonGroupItems.push( {
        icon: buttonIconFunctions[ level ]( iconAlignGroup ),
        scoreProperty: model.bestScoreProperties[ level ],
        options: {
          bestTimeProperty: model.bestTimeProperties[ level ],
          createScoreDisplay: ( scoreProperty: TReadOnlyProperty<number> ) => new ScoreDisplayStars( scoreProperty, {
            numberOfStars: model.getNumberOfChallenges( level ),
            perfectScore: model.getPerfectScore( level )
          } ),
          listener: () => model.play( level ),
          soundPlayerIndex: level
        },
        tandemName: buttonTandemName
      } );
    }

    super( levelSelectionButtonGroupItems, {
      levelSelectionButtonOptions: {
        baseColor: 'rgb( 240, 255, 204 )',
        xMargin: 15,
        yMargin: 15,
        buttonWidth: 150,
        buttonHeight: 150,
        bestTimeVisibleProperty: model.timerEnabledProperty
      },
      flowBoxOptions: {
        spacing: 40
      },
      tandem: tandem
    } );
  }
}

/*
 *  Level N
 *  leftNode -> rightNode
 */
function createButtonIcon( level: number, leftNode: Node, rightNode: Node, iconAlignGroup: AlignGroup ): Node {

  // Icon
  const arrowNode = new ArrowNode( 0, 0, 50, 0, {
    headHeight: 20,
    headWidth: 20,
    tailWidth: 6
  } );
  const icon = new AlignBox( new HBox( {
    children: [ leftNode, arrowNode, rightNode ],
    spacing: 20
  } ), {
    group: iconAlignGroup
  } );

  // Text
  const stringProperty = new PatternStringProperty( ReactantsProductsAndLeftoversStrings.pattern_Level_0StringProperty, {
    level: level
  }, {
    formatNames: [ 'level' ] // to map '{0}' to '{{level}}'
  } );
  const text = new Text( stringProperty, {
    font: new PhetFont( 45 ),
    maxWidth: icon.width
  } );

  return new VBox( {
    children: [ text, icon ],
    spacing: 30
  } );
}

/**
 *  Level 1
 *  ? -> HCl
 */
function createLevel1ButtonIcon( iconAlignGroup: AlignGroup ): Node {
  const leftNode = new Text( ReactantsProductsAndLeftoversStrings.questionMarkStringProperty, QUESTION_MARK_OPTIONS );
  const rightNode = new HClNode( RPALConstants.MOLECULE_NODE_OPTIONS );
  rightNode.setScaleMagnitude( MOLECULE_SCALE );
  return createButtonIcon( 1, leftNode, rightNode, iconAlignGroup );
}

/**
 *  Level 2
 *  H2O -> ?
 */
function createLevel2ButtonIcon( iconAlignGroup: AlignGroup ): Node {
  const leftNode = new H2ONode( RPALConstants.MOLECULE_NODE_OPTIONS );
  leftNode.setScaleMagnitude( MOLECULE_SCALE );
  const rightNode = new Text( ReactantsProductsAndLeftoversStrings.questionMarkStringProperty, QUESTION_MARK_OPTIONS );
  return createButtonIcon( 2, leftNode, rightNode, iconAlignGroup );
}

/**
 *  Level 3
 *  NH3 -> ??
 */
function createLevel3ButtonIcon( iconAlignGroup: AlignGroup ): Node {
  const leftNode = new NH3Node( RPALConstants.MOLECULE_NODE_OPTIONS );
  leftNode.setScaleMagnitude( MOLECULE_SCALE );
  const rightNode = new Text( ReactantsProductsAndLeftoversStrings.doubleQuestionMarkStringProperty, QUESTION_MARK_OPTIONS );
  return createButtonIcon( 3, leftNode, rightNode, iconAlignGroup );
}

reactantsProductsAndLeftovers.register( 'RPALLevelSelectionButtonGroup', RPALLevelSelectionButtonGroup );