// Copyright 2017-2022, University of Colorado Boulder

/**
 * Either a label or an edit readout/button, centered around the origin.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import ReadOnlyProperty from '../../../../axon/js/ReadOnlyProperty.js';
import validate from '../../../../axon/js/validate.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import { Node, RichText } from '../../../../scenery/js/imports.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonConstants from '../../common/AreaModelCommonConstants.js';
import AreaModelCommonColors from '../../common/view/AreaModelCommonColors.js';
import TermEditNode from '../../generic/view/TermEditNode.js';
import EntryDisplayType from '../model/EntryDisplayType.js';
import EntryStatus from '../model/EntryStatus.js';
import GameState from '../model/GameState.js';

class GameEditableLabelNode extends Node {
  /**
   * @param {Object} config - See constructor
   */
  constructor( config ) {

    config = merge( {
      // required
      entryProperty: null, // {Property.<Entry>}
      gameStateProperty: null, // {Property.<GameState>}
      activeEntryProperty: null, // {Property.<Entry|null>}
      colorProperty: null, // {Property.<Color>}
      allowExponentsProperty: null, // {Property.<boolean>}
      orientation: null, // {Orientation}

      // optional
      labelFont: AreaModelCommonConstants.GAME_MAIN_LABEL_FONT,
      editFont: AreaModelCommonConstants.GAME_MAIN_EDIT_FONT
    }, config );

    assert && assert( config.entryProperty instanceof ReadOnlyProperty );
    assert && assert( config.gameStateProperty instanceof ReadOnlyProperty );
    assert && assert( config.activeEntryProperty instanceof ReadOnlyProperty );
    assert && assert( config.colorProperty instanceof ReadOnlyProperty );
    assert && assert( config.allowExponentsProperty instanceof ReadOnlyProperty );
    validate( config.orientation, { validValues: Orientation.enumeration.values } );

    super();

    // Helpful to break out some values
    const entryProperty = config.entryProperty;
    const gameStateProperty = config.gameStateProperty;
    const activeEntryProperty = config.activeEntryProperty;
    const colorProperty = config.colorProperty;
    const allowExponentsProperty = config.allowExponentsProperty;
    const orientation = config.orientation;

    const valueProperty = new DynamicProperty( entryProperty, {
      derive: 'valueProperty',
      bidirectional: true
    } );
    const digitsProperty = new DerivedProperty( [ entryProperty ], _.property( 'digits' ) );
    const statusProperty = new DynamicProperty( entryProperty, {
      derive: 'statusProperty'
    } );
    const isActiveProperty = new DerivedProperty(
      [ entryProperty, activeEntryProperty ],
      ( entry, activeEntry ) => entry === activeEntry );

    const readoutText = new RichText( '?', {
      fill: colorProperty,
      font: config.labelFont
    } );
    this.addChild( readoutText );

    valueProperty.link( termOrList => {
      readoutText.string = termOrList === null ? '?' : termOrList.toRichString( false );
      readoutText.center = Vector2.ZERO;
    } );

    const textColorProperty = new DerivedProperty(
      [ statusProperty, colorProperty, AreaModelCommonColors.errorStatusProperty ],
      ( highlight, color, errorColor ) => {
        if ( highlight === EntryStatus.INCORRECT ) {
          return errorColor;
        }
        else {
          return color;
        }
      } );
    const borderColorProperty = new DerivedProperty( [
      statusProperty,
      colorProperty,
      AreaModelCommonColors.errorStatusProperty,
      AreaModelCommonColors.dirtyStatusProperty
    ], ( highlight, color, errorColor, dirtyColor ) => {
      if ( highlight === EntryStatus.NORMAL ) {
        return color;
      }
      else if ( highlight === EntryStatus.DIRTY ) {
        return dirtyColor;
      }
      else {
        return errorColor;
      }
    } );
    const termEditNode = new TermEditNode( new Property( orientation ), valueProperty, {
      textColorProperty: textColorProperty,
      borderColorProperty: borderColorProperty,
      isActiveProperty: isActiveProperty,
      digitCountProperty: digitsProperty,
      allowExponentsProperty: allowExponentsProperty,
      editCallback: () => {
        if ( gameStateProperty.value === GameState.WRONG_FIRST_ANSWER ) {
          gameStateProperty.value = GameState.SECOND_ATTEMPT;
        }
        if ( activeEntryProperty.value !== entryProperty.value ) {
          activeEntryProperty.value = entryProperty.value;
        }
        else {
          // Pressing on the edit button when that keypad is already open will instead close the keypad.
          // See https://github.com/phetsims/area-model-common/issues/127
          activeEntryProperty.value = null;
        }
      },
      font: config.editFont
    } );
    this.addChild( termEditNode );

    function centerTermEditNode() {
      termEditNode.center = Vector2.ZERO;
    }

    digitsProperty.link( centerTermEditNode );
    allowExponentsProperty.link( centerTermEditNode );

    Multilink.multilink( [ entryProperty, gameStateProperty ], ( entry, gameState ) => {
      const isReadoutOverride = gameState === GameState.CORRECT_ANSWER || gameState === GameState.SHOW_SOLUTION;
      readoutText.visible = entry.displayType === EntryDisplayType.READOUT ||
                            ( isReadoutOverride && entry.displayType === EntryDisplayType.EDITABLE );
      termEditNode.visible = entry.displayType === EntryDisplayType.EDITABLE && !isReadoutOverride;
    } );
  }
}

areaModelCommon.register( 'GameEditableLabelNode', GameEditableLabelNode );

export default GameEditableLabelNode;