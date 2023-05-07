// Copyright 2014-2023, University of Colorado Boulder

/**
 * Displays substances at random positions in a box.
 * This is used for the 'Before' and 'After' boxes in the Game screen.
 *
 * To improve performance:
 * - Nodes are created as needed.
 * - Nodes are never removed; they remain as children for the lifetime of this node.
 * - The visibility of nodes is adjusted to show the correct quantity of the substance.
 * - When a node becomes visible, it is assigned a position in the grid.
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { Node, NodeOptions, NodeTranslationOptions, Rectangle, TColor } from '../../../../scenery/js/imports.js';
import Substance from '../../common/model/Substance.js';
import RPALColors from '../../common/RPALColors.js';
import SubstanceIcon from '../../common/view/SubstanceIcon.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';

const DEFAULT_BOX_SIZE = new Dimension2( 100, 100 );

type SelfOptions = {
  boxSize?: Dimension2;
  maxQuantity?: number; // the maximum quantity of each substance in the box
  cornerRadius?: number;
  fill?: TColor;
  stroke?: TColor;
  margin?: number; // margin around the inside edge of the box

  // Molecules in the box are arranged in a grid. This option controls how much the molecules are randomly offset
  // from the center of the grid's cells. Higher values make the layout look less grid-like, but result in more
  // overlap of molecules (a trade-off).
  randomOffset?: number;
};

type RandomBoxOptions = SelfOptions & NodeTranslationOptions;

export default class RandomBox extends Node {

  private readonly disposeRandomBox: () => void;

  public constructor( substances: Substance[], providedOptions?: RandomBoxOptions ) {

    const options = optionize<RandomBoxOptions, SelfOptions, NodeOptions>()( {

      // SelfOptions
      boxSize: DEFAULT_BOX_SIZE,
      maxQuantity: 4,
      cornerRadius: 3,
      fill: RPALColors.BOX_FILL,
      stroke: RPALColors.BOX_STROKE,
      margin: 5,
      randomOffset: 8
    }, providedOptions );

    /*
     * Compute the size of the grid needed to accommodate the maximum number of nodes.
     * Assume that the box is square-ish, so can have the same number of rows and columns.
     */
    const rows = Utils.roundSymmetric( Math.sqrt( substances.length * options.maxQuantity ) );
    const columns = rows;

    // Compute positions in the grid, this is our 'pool' of positions.
    const positions: Vector2[] = [];
    const dx = Math.floor( ( options.boxSize.width - ( 2 * options.margin ) - ( 2 * options.randomOffset ) ) / columns );
    const dy = Math.floor( ( options.boxSize.height - ( 2 * options.margin ) - ( 2 * options.randomOffset ) ) / rows );
    for ( let column = 0; column < columns; column++ ) {
      for ( let row = 0; row < rows; row++ ) {
        const x = options.margin + options.randomOffset + ( dx / 2 ) + ( column * dx );
        const y = options.margin + options.randomOffset + ( dy / 2 ) + ( row * dy );
        positions.push( new Vector2( x, y ) );
      }
    }
    assert && assert( positions.length === rows * columns );

    // Chooses a random position and remove it from the pool of positions.
    const choosePosition = () => {
      assert && assert( positions.length > 0 );
      const index = dotRandom.nextIntBetween( 0, positions.length - 1 );
      const position = positions[ index ];
      positions.splice( index, 1 );
      return position;
    };

    // Puts a position back in the pool of positions.
    const releasePosition = ( position: Vector2 ) => positions.push( position );

    // the box
    const boxNode = new Rectangle( 0, 0, options.boxSize.width, options.boxSize.height, options.cornerRadius, options.cornerRadius, {
      fill: options.fill,
      stroke: options.stroke
    } );

    // substances inside the box
    const substanceLayers: SubstanceLayer[] = [];
    const parent = new Node();
    substances.forEach( substance => {
      const substanceLayer = new SubstanceLayer( substance.iconProperty, substance.quantityProperty,
        options.randomOffset, choosePosition, releasePosition );
      parent.addChild( substanceLayer );
      substanceLayers.push( substanceLayer );
    } );

    options.children = [ boxNode, parent ];

    super( options );

    this.disposeRandomBox = () => {
      substanceLayers.forEach( node => node.dispose() );
      substanceLayers.length = 0;
    };
  }

  public override dispose(): void {
    this.disposeRandomBox();
    super.dispose();
  }
}

/**
 * Responsible for managing all nodes for one substance type.
 */
class SubstanceLayer extends Node {

  private readonly disposeSubstanceLayer: () => void;

  public constructor( iconProperty: TReadOnlyProperty<Node>, quantityProperty: TReadOnlyProperty<number>,
                      randomOffset: number, choosePosition: () => Vector2, releasePosition: ( position: Vector2 ) => void ) {

    super();

    const cellNodes: CellNode[] = [];

    const quantityPropertyObserver = ( quantity: number ) => {

      const count = Math.max( quantity, cellNodes.length );

      for ( let i = 0; i < count; i++ ) {

        if ( i < this.getChildrenCount() ) {

          // node already exists
          const node = cellNodes[ i ];
          const nodeWasVisible = node.visible;
          node.visible = ( i < quantity );

          if ( node.visible && !nodeWasVisible ) {
            // when an existing node becomes visible, choose a new position for it
            node.setGridPosition( choosePosition() );
          }
          else if ( !node.visible && nodeWasVisible ) {
            // when a visible node becomes invisible, make its position available
            releasePosition( node.getGridPosition() );
          }
        }
        else {

          // add a node
          const cellNode = new CellNode( iconProperty, choosePosition(), randomOffset );
          this.addChild( cellNode );
          cellNodes.push( cellNode );
        }
      }
    };
    quantityProperty.link( quantityPropertyObserver ); // must be unlinked in dispose

    this.disposeSubstanceLayer = () => {
      cellNodes.forEach( node => node.dispose() ); // also does removeChild
      cellNodes.length = 0;
      quantityProperty.unlink( quantityPropertyObserver );
    };
  }

  public override dispose(): void {
    this.disposeSubstanceLayer();
    super.dispose();
  }
}

/**
 * Icon that occupies a cell in the grid, randomizes its position to make the grid look less regular.
 */
class CellNode extends SubstanceIcon {

  private gridPosition: Vector2;
  private readonly randomOffset: number;

  public constructor( iconProperty: TReadOnlyProperty<Node>, gridPosition: Vector2, randomOffset: number ) {

    super( iconProperty );

    this.gridPosition = gridPosition;
    this.randomOffset = randomOffset;

    this.setGridPosition( gridPosition ); // initialize position
  }

  /**
   * Gets the grid position.
   */
  public getGridPosition(): Vector2 {
    return this.gridPosition;
  }

  /**
   * Sets the grid position.
   */
  public setGridPosition( gridPosition: Vector2 ): void {
    this.gridPosition = gridPosition;
    // Move this node to the specified grid position, with some randomized offset.
    this.centerX = gridPosition.x + dotRandom.nextIntBetween( -this.randomOffset, this.randomOffset );
    this.centerY = gridPosition.y + dotRandom.nextIntBetween( -this.randomOffset, this.randomOffset );
  }
}

reactantsProductsAndLeftovers.register( 'RandomBox', RandomBox );