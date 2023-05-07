// Copyright 2014-2023, University of Colorado Boulder

/**
 * Displays a Substance's icon, which may change dynamically.
 *
 * VERY IMPORTANT NOTES!
 *
 * Scenery is a DAG and allows one instance of a Node to appear in the scenegraph in
 * multiple places, with 2 caveats: (1) a Node cannot be a sibling of itself, and (2)
 * transforming a node will do so everywhere that it appears. Because an icon can
 * appear in multiple places in the view, this type provides a convenient way to
 * wrap an icon, so that we don't accidentally make it a sibling of itself, or
 * attempt to position it.  It also ensures that the icon's origin (0,0) is at the
 * center of its bounds, which we take advantage of in layout code.
 *
 * Substances typically have a lifetime that is longer than this node.
 * When this node is disposed of, the icon needs to be explicitly removed from its parent.
 * This is because scenery nodes keep a reference to their parent. If we don't explicitly
 * remove the icon from the scene graph, then all of its ancestors will be retained,
 * creating a memory leak.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import { Node, NodeOptions, NodeTranslationOptions } from '../../../../scenery/js/imports.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';

type SelfOptions = EmptySelfOptions;

type SubstanceIconOptions = SelfOptions & NodeTranslationOptions;

export default class SubstanceIcon extends Node {

  private readonly disposeSubstanceIcon: () => void;

  public constructor( iconProperty: TReadOnlyProperty<Node>, providedOptions?: SubstanceIconOptions ) {

    const options = optionize<SubstanceIconOptions, SelfOptions, NodeOptions>()( {}, providedOptions );

    // Add a wrapper, so that we can keep the icon centered and not run afoul of scenery DAG feature.
    const wrapperNode = new Node();

    const iconPropertyObserver = ( icon: Node ) => {
      wrapperNode.removeAllChildren();
      wrapperNode.addChild( icon ); // icon must be removed in dispose, since scenery children keep a reference to their parents
      wrapperNode.center = Vector2.ZERO;
    };
    iconProperty.link( iconPropertyObserver ); // must be unlinked in dispose

    options.children = [ wrapperNode ];

    super( options );

    this.disposeSubstanceIcon = () => {
      if ( iconProperty.hasListener( iconPropertyObserver ) ) {
        iconProperty.unlink( iconPropertyObserver );
      }
      wrapperNode.removeAllChildren(); // to disconnect from icon
    };
  }

  public override dispose(): void {
    this.disposeSubstanceIcon();
    super.dispose();
  }
}

reactantsProductsAndLeftovers.register( 'SubstanceIcon', SubstanceIcon );