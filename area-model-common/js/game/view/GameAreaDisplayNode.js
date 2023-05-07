// Copyright 2017-2022, University of Colorado Boulder

/**
 * Supertype for view of Area objects.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import { Node, Rectangle } from '../../../../scenery/js/imports.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonConstants from '../../common/AreaModelCommonConstants.js';
import OrientationPair from '../../common/model/OrientationPair.js';
import AreaModelCommonColors from '../../common/view/AreaModelCommonColors.js';
import RangeLabelNode from '../../common/view/RangeLabelNode.js';
import GenericAreaDisplayNode from '../../generic/view/GenericAreaDisplayNode.js';
import TermKeypadPanel from '../../generic/view/TermKeypadPanel.js';
import Entry from '../model/Entry.js';
import EntryType from '../model/EntryType.js';
import InputMethod from '../model/InputMethod.js';
import GameEditableLabelNode from './GameEditableLabelNode.js';

// constants
const MAX_PARTITIONS = 3; // The maximum number of partitions for a specific dimension

class GameAreaDisplayNode extends Node {
  /**
   * @param {GameAreaDisplay} areaDisplay
   * @param {Property.<Entry|null>} activeEntryProperty
   * @param {Property.<GameState>} gameStateProperty
   * @param {function} setActiveTerm - function( {Term|null} ) - Called when the value of the edited term should be set.
   */
  constructor( areaDisplay, activeEntryProperty, gameStateProperty, setActiveTerm ) {

    super();

    const singleOffset = AreaModelCommonConstants.AREA_SIZE * AreaModelCommonConstants.GENERIC_SINGLE_OFFSET;
    const firstOffset = AreaModelCommonConstants.AREA_SIZE * AreaModelCommonConstants.GENERIC_FIRST_OFFSET;
    const secondOffset = AreaModelCommonConstants.AREA_SIZE * AreaModelCommonConstants.GENERIC_SECOND_OFFSET;
    const fullOffset = AreaModelCommonConstants.AREA_SIZE;

    // Background fill and stroke
    this.addChild( new Rectangle( 0, 0, AreaModelCommonConstants.AREA_SIZE, AreaModelCommonConstants.AREA_SIZE, {
      fill: AreaModelCommonColors.areaBackgroundProperty,
      stroke: AreaModelCommonColors.areaBorderProperty
    } ) );

    this.addChild( GenericAreaDisplayNode.createPartitionLines( areaDisplay.layoutProperty, AreaModelCommonConstants.AREA_SIZE ) );

    // Range views
    const tickVariations = {
      1: [ 0, fullOffset ],
      2: [ 0, singleOffset, fullOffset ],
      3: [ 0, firstOffset, secondOffset, fullOffset ]
    };
    Orientation.enumeration.values.forEach( orientation => {
      const colorProperty = AreaModelCommonColors.genericColorProperties.get( orientation );
      const termListProperty = areaDisplay.totalProperties.get( orientation );
      const tickPositionsProperty = new DerivedProperty( [ areaDisplay.layoutProperty ], layout => tickVariations[ layout.getPartitionQuantity( orientation ) ] );
      this.addChild( new RangeLabelNode( termListProperty, orientation, tickPositionsProperty, colorProperty, false ) );
    } );

    // {OrientationPair.<Array.<Property.<number>>>} - The visual centers of all of the partitions.
    // This duplicates some logic from GenericArea's coordinateRangeProperty handling, but here we need the full-length
    // array every time.
    const centerProperties = OrientationPair.create( orientation => [
      new DerivedProperty( [ areaDisplay.layoutProperty ], layout => {
        const partitionCount = layout.getPartitionQuantity( orientation );
        if ( partitionCount === 1 ) {
          return fullOffset / 2;
        }
        else if ( partitionCount === 2 ) {
          return singleOffset / 2;
        }
        else if ( partitionCount === 3 ) {
          return firstOffset / 2;
        }
        else {
          throw new Error( `unsupported value for partitionCount: ${partitionCount}` );
        }
      } ),
      new DerivedProperty( [ areaDisplay.layoutProperty ], layout => {
        const partitionCount = layout.getPartitionQuantity( orientation );
        if ( partitionCount === 2 ) {
          return ( fullOffset + singleOffset ) / 2;
        }
        else if ( partitionCount === 3 ) {
          return ( secondOffset + firstOffset ) / 2;
        }
        else {
          return 0; // no need to position here, since this will never be used with a partitionCount of 1
        }
      } ),
      new Property( ( fullOffset + secondOffset ) / 2 )
    ] );

    // Partition size labels
    Orientation.enumeration.values.forEach( orientation => {
      _.range( 0, MAX_PARTITIONS ).forEach( partitionIndex => {
        const entryProperty = new DerivedProperty(
          [ areaDisplay.partitionSizeEntriesProperties.get( orientation ) ],
          entries => entries[ partitionIndex ] ? entries[ partitionIndex ] : new Entry( null ) );
        const colorProperty = AreaModelCommonColors.genericColorProperties.get( orientation );

        const label = new GameEditableLabelNode( {
          entryProperty: entryProperty,
          gameStateProperty: gameStateProperty,
          activeEntryProperty: activeEntryProperty,
          colorProperty: colorProperty,
          allowExponentsProperty: areaDisplay.allowExponentsProperty,
          orientation: orientation
        } );

        label[ orientation.opposite.coordinate ] = AreaModelCommonConstants.PARTITION_OFFSET.get( orientation );
        this.addChild( label );

        centerProperties.get( orientation )[ partitionIndex ].link( position => {
          label[ orientation.coordinate ] = position;
        } );
      } );
    } );

    // Labels for each partitioned area
    _.range( 0, MAX_PARTITIONS ).forEach( horizontalIndex => {
      _.range( 0, MAX_PARTITIONS ).forEach( verticalIndex => {
        const entryProperty = new DerivedProperty( [ areaDisplay.partialProductEntriesProperty ], values => ( values[ verticalIndex ] && values[ verticalIndex ][ horizontalIndex ] )
                                                                                                            ? values[ verticalIndex ][ horizontalIndex ]
                                                                                                            : new Entry( null ) );

        const colorProperty = new DerivedProperty( [
          entryProperty,
          AreaModelCommonColors.dynamicPartialProductProperty,
          AreaModelCommonColors.fixedPartialProductProperty
        ], ( entry, dynamicColor, fixedColor ) => {
          if ( entry && entry.type === EntryType.DYNAMIC ) {
            return dynamicColor;
          }
          else {
            return fixedColor;
          }
        } );

        const label = new GameEditableLabelNode( {
          entryProperty: entryProperty,
          gameStateProperty: gameStateProperty,
          activeEntryProperty: activeEntryProperty,
          colorProperty: colorProperty,
          allowExponentsProperty: areaDisplay.allowExponentsProperty,
          orientation: Orientation.VERTICAL,
          labelFont: AreaModelCommonConstants.GAME_PARTIAL_PRODUCT_LABEL_FONT,
          editFont: AreaModelCommonConstants.GAME_PARTIAL_PRODUCT_EDIT_FONT
        } );
        this.addChild( label );

        centerProperties.horizontal[ horizontalIndex ].linkAttribute( label, 'x' );
        centerProperties.vertical[ verticalIndex ].linkAttribute( label, 'y' );
      } );
    } );

    const digitsProperty = new DerivedProperty( [ activeEntryProperty ], entry => entry ? entry.digits : 1 );

    const keypadOptions = {
      // padding constant allows it to fit between the area and the other panels
      x: AreaModelCommonConstants.AREA_SIZE + AreaModelCommonConstants.KEYPAD_LEFT_PADDING,
      top: 0
    };
    const noExponentKeypadPanel = new TermKeypadPanel( digitsProperty, false, false, setActiveTerm, keypadOptions );
    const exponentKeypadPanel = new TermKeypadPanel( digitsProperty, true, true, setActiveTerm, keypadOptions );

    this.addChild( noExponentKeypadPanel );
    this.addChild( exponentKeypadPanel );

    activeEntryProperty.link( newEntry => {
      noExponentKeypadPanel.clear();
      exponentKeypadPanel.clear();

      noExponentKeypadPanel.visible = newEntry !== null && newEntry.inputMethod === InputMethod.CONSTANT;
      exponentKeypadPanel.visible = newEntry !== null && newEntry.inputMethod === InputMethod.TERM;
    } );
  }
}

areaModelCommon.register( 'GameAreaDisplayNode', GameAreaDisplayNode );

export default GameAreaDisplayNode;
