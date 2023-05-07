// Copyright 2018-2023, University of Colorado Boulder

/**
 * Displays 'NO REAL ROOTS', used when a quadratic has no real roots.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { Node, NodeOptions, Rectangle, Text } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import GQColors from '../../common/GQColors.js';
import GQConstants from '../../common/GQConstants.js';
import Quadratic from '../../common/model/Quadratic.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import GraphingQuadraticsStrings from '../../GraphingQuadraticsStrings.js';

// const
const Y_OFFSET = 2; // min offset from vertex, determined empirically

export default class NoRealRootsNode extends Node {

  public constructor( rootsVisibleProperty: TReadOnlyProperty<boolean>,
                      vertexVisibleProperty: TReadOnlyProperty<boolean>,
                      coordinatesVisibleProperty: TReadOnlyProperty<boolean>,
                      quadraticProperty: TReadOnlyProperty<Quadratic>,
                      modelViewTransform: ModelViewTransform2,
                      tandem: Tandem ) {

    const options: NodeOptions = {
      maxWidth: 200, // determined empirically
      tandem: tandem,
      phetioDocumentation: 'displays NO REAL ROOTS when the interactive quadratic has no real roots'
    };

    const textNode = new Text( GraphingQuadraticsStrings.noRealRoots, {
      font: GQConstants.NO_REAL_ROOTS_FONT,
      fill: 'white'
    } );

    const backgroundNode = new Rectangle( textNode.bounds.dilatedXY( 5, 1 ), {
      fill: GQColors.ROOTS,
      opacity: 0.75,
      cornerRadius: 4,
      center: textNode.center
    } );

    options.children = [ backgroundNode, textNode ];

    // visibility of this Node
    options.visibleProperty = new DerivedProperty(
      [ rootsVisibleProperty, quadraticProperty ],
      ( rootsVisible, quadratic ) =>
        rootsVisible && // the Roots checkbox is checked
        !!( quadratic.roots && quadratic.roots.length === 0 ), // the interactive quadratic has no roots
      {
        tandem: tandem.createTandem( 'visibleProperty' ),
        phetioValueType: BooleanIO
      } );

    super( options );

    // Part of the graph where 'NO REAL ROOTS' may overlap with vertex coordinates, when 'NO REAL ROOTS' is
    // typically centered at the origin. Width is based on maxWidth, height was determined empirically.
    // See https://github.com/phetsims/graphing-quadratics/issues/88
    const maxWidth = options.maxWidth!;
    assert && assert( maxWidth !== null && maxWidth !== undefined );
    const vertexOverlapBounds = new Bounds2(
      modelViewTransform.viewToModelDeltaX( -0.6 * maxWidth ), -Y_OFFSET,
      modelViewTransform.viewToModelDeltaX( 0.6 * maxWidth ), Y_OFFSET );

    // The center of this Node, typically at the origin, except when that would overlap the vertex's coordinates.
    // In that case, position above or below the x axis, depending on which way the parabola opens.
    // See https://github.com/phetsims/graphing-quadratics/issues/88
    const centerProperty = new DerivedProperty(
      [ vertexVisibleProperty, coordinatesVisibleProperty, quadraticProperty ],
      ( vertexVisible, coordinatesVisible, quadratic ) => {
        if ( vertexVisible && // the Vertex checkbox is checked
             coordinatesVisible && // the Coordinates checkbox is checked
             ( quadratic.roots && quadratic.roots.length === 0 ) && // no roots
             // vertex is in a position where its coordinates will overlap
             ( quadratic.vertex && vertexOverlapBounds.containsPoint( quadratic.vertex ) ) ) {
          // center above or below the x axis, y offset determined empirically
          const y = quadratic.vertex.y + ( quadratic.a > 0 ? -Y_OFFSET : Y_OFFSET );
          return modelViewTransform.modelToViewXY( 0, y );
        }
        else {
          // center at the origin
          return modelViewTransform.modelToViewXY( 0, 0 );
        }
      }
    );
    centerProperty.linkAttribute( this, 'center' );
  }
}

graphingQuadratics.register( 'NoRealRootsNode', NoRealRootsNode );