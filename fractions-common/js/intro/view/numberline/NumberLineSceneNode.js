// Copyright 2018-2022, University of Colorado Boulder

/**
 * Scene for the number-line representation
 *
 * @author Vincent Davis (Berea College)
 * @author Dusty Cole (Berea College)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { Shape } from '../../../../../kite/js/imports.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { Node, Path, Text } from '../../../../../scenery/js/imports.js';
import fractionsCommon from '../../../fractionsCommon.js';
import SceneNode from '../SceneNode.js';
import NumberLineNode from './NumberLineNode.js';

class NumberLineSceneNode extends SceneNode {
  /**
   * @param {ContainerSetModel} model
   */
  constructor( model ) {
    super( model );

    // @private {NumberLineNode}
    this.numberLineNode = new NumberLineNode( model.numeratorProperty, model.denominatorProperty, model.containerCountProperty, {
      interactive: true
    } );
    this.addChild( this.numberLineNode );
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    this.numberLineNode.dispose();

    super.dispose();
  }

  /**
   * Returns the icon node to be used for this representation.
   * @public
   *
   * @returns {Node}
   */
  static getIcon() {
    const lineLength = 55;
    const tickHeight = 20;

    return new Node( {
      children: [
        new Path( new Shape().moveTo( 0, 0 ).verticalLineToRelative( tickHeight )
          .moveTo( lineLength, 0 )
          .verticalLineToRelative( tickHeight )
          .moveTo( 0, tickHeight / 2 )
          .horizontalLineToRelative( lineLength ), { stroke: 'black' } ),
        new Text( '0', { font: new PhetFont( 10 ), centerX: 0, top: tickHeight } ),
        new Text( '1', { font: new PhetFont( 10 ), centerX: lineLength, top: tickHeight } )
      ]
    } );
  }
}

fractionsCommon.register( 'NumberLineSceneNode', NumberLineSceneNode );
export default NumberLineSceneNode;