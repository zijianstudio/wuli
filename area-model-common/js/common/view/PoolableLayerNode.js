// Copyright 2018-2021, University of Colorado Boulder

/**
 * Common logic for where we have a variable number of nodes that need to be used.
 *
 * This is helpful in the situation (that occurs 3 times in this sim) where you need to have a layer with a variable
 * number of objects (where, for memory/performance needs, you need to pool them). So given a maximum number N, you'll
 * have a current number X <= N that are used. We don't create new ones, we just reuse a pool of nodes, having
 * X be visible, and any other nodes beyond will be hidden.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../../../phet-core/js/merge.js';
import { Node } from '../../../../scenery/js/imports.js';
import areaModelCommon from '../../areaModelCommon.js';

class PoolableLayerNode extends Node {
  /**
   * So you have a Property.<Array.<Item>>, and you want to lazily create ItemNodes for each? And say each ItemNode
   * has something like itemNode.itemProperty which controls which item it displays? And if the property is null, it
   * doesn't display? Do I have the incredibly-specific helper type for you! For the LOW LOW price of moving it to a
   * common repo, YOU COULD HAVE IT TOO!
   *
   * Hopefully this doesn't become a common pattern. We have 3+ usages of it, and it cleans things up overall to have
   * the not-super-simple logic in one place. Enjoy.
   *
   * @param {Object} config
   */
  constructor( config ) {

    config = merge( {
      // required
      arrayProperty: null, // {Property.<Array.<*>>} - Property that has an array of items
      createNode: null, // {function} - function( {*} item ): {Node} - Create a node from an item
      getItemProperty: null, // {function} - function( {*} itemNode ): {Property.<*>} - ItemNode => Item Property

      // Allow providing references
      usedArray: [],
      unusedArray: [],

      // Called after we run an update.
      updatedCallback: null
    }, config );

    super();

    const usedArray = config.usedArray;
    const unusedArray = config.unusedArray;

    config.arrayProperty.link( items => {

      // Unuse all of the item nodes (set their property to null, hiding them, and put them in the unused array)
      while ( usedArray.length ) {
        const oldItemNode = usedArray.pop();
        config.getItemProperty( oldItemNode ).value = null;
        unusedArray.push( oldItemNode );
      }

      items.forEach( item => {
        let itemNode;

        // Grab one from the pool
        if ( unusedArray.length ) {
          itemNode = unusedArray.pop();
          config.getItemProperty( itemNode ).value = item;
        }

        // Or create a new one
        else {
          itemNode = config.createNode( item );
          this.addChild( itemNode );
        }

        usedArray.push( itemNode );
      } );

      config.updatedCallback && config.updatedCallback();
    } );
  }
}

areaModelCommon.register( 'PoolableLayerNode', PoolableLayerNode );

export default PoolableLayerNode;