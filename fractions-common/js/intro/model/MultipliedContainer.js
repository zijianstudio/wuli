// Copyright 2018-2020, University of Colorado Boulder

/**
 * A container that behaves like another (source) container, but with each cell split into X others (the multiplier).
 *
 * NOTE: These are kept around for the life of the source container, so they won't need to be disposed.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import fractionsCommon from '../../fractionsCommon.js';
import Container from './Container.js';

class MultipliedContainer extends Container {
  /**
   * @param {Container} container
   * @param {Property.<number>} multiplierProperty
   */
  constructor( container, multiplierProperty ) {
    super();

    // @private {Container}
    this.container = container;

    // @private {Property.<number>}
    this.multiplierProperty = multiplierProperty;

    const updateListener = this.update.bind( this );

    container.cells.forEach( cell => {
      cell.isFilledProperty.lazyLink( updateListener );
    } );

    container.cells.addItemAddedListener( cell => {
      cell.isFilledProperty.lazyLink( updateListener );
      this.update();
    } );
    container.cells.addItemRemovedListener( cell => {
      cell.isFilledProperty.unlink( updateListener );
      this.update();
    } );
    multiplierProperty.lazyLink( updateListener );

    this.update();
  }

  /**
   * Updates the status of this entire container, based on its source container.
   * @private
   */
  update() {
    const multiplier = this.multiplierProperty.value;
    const quantity = this.container.cells.length * multiplier;

    // Contain the correct number of cells
    if ( this.cells.length > quantity ) {
      this.removeCells( this.cells.length - quantity );
    }
    if ( quantity > this.cells.length ) {
      this.addCells( quantity - this.cells.length );
    }

    // Synchronize the cells
    for ( let i = 0; i < this.container.cells.length; i++ ) {
      const filled = this.container.cells.get( i ).isFilledProperty.value;
      for ( let j = 0; j < multiplier; j++ ) {
        this.cells.get( i * multiplier + j ).setFilled( filled );
      }
    }
  }
}

fractionsCommon.register( 'MultipliedContainer', MultipliedContainer );
export default MultipliedContainer;