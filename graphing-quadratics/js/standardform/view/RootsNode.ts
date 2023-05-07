// Copyright 2018-2023, University of Colorado Boulder

/**
 * Displays the roots of a quadratic as non-interactive points with coordinate labels.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Graph from '../../../../graphing-lines/js/common/model/Graph.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { Node, NodeOptions } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import GQColors from '../../common/GQColors.js';
import GQConstants from '../../common/GQConstants.js';
import Quadratic from '../../common/model/Quadratic.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import PointNode, { PointNodeOptions } from './PointNode.js';

// constants
const COORDINATES_X_SPACING = 15; // between root point and its coordinates display

export default class RootsNode extends Node {

  public constructor( quadraticProperty: TReadOnlyProperty<Quadratic>,
                      graph: Graph, modelViewTransform: ModelViewTransform2,
                      rootsVisibleProperty: TReadOnlyProperty<boolean>,
                      coordinatesVisibleProperty: TReadOnlyProperty<boolean>,
                      tandem: Tandem ) {

    const options: NodeOptions = {
      tandem: tandem,
      phetioDocumentation: 'displays the roots of the interactive quadratic'
    };

    // {DerivedProperty.<Vector2|null>} coordinates for the quadratic's left root
    const leftCoordinatesProperty = new DerivedProperty( [ quadraticProperty ],
      quadratic => {
        if ( !quadratic.roots || quadratic.roots.length === 0 ) {

          // no roots
          return null;
        }
        else {
          return quadratic.roots[ 0 ];
        }
      }, {
        tandem: tandem.createTandem( 'leftCoordinatesProperty' ),
        phetioValueType: NullableIO( Vector2.Vector2IO ),
        phetioDocumentation: 'coordinates displayed on the left root, ' +
                             'identical to rightCoordinatesProperty if there is one root, ' +
                             'null if there are no roots or if all points are roots'
      } );

    // {DerivedProperty.<Vector2|null>} coordinates for the quadratic's right root
    const rightCoordinatesProperty = new DerivedProperty( [ quadraticProperty ],
      quadratic => {
        if ( !quadratic.roots || quadratic.roots.length === 0 ) {

          // no roots
          return null;
        }
        else if ( quadratic.roots.length === 1 ) {

          // 1 root, shared by leftCoordinatesProperty and rightCoordinatesProperty
          return quadratic.roots[ 0 ];
        }
        else {

          // 2 roots
          assert && assert( quadratic.roots.length === 2, `expected 2 roots, found ${quadratic.roots.length}` );
          return quadratic.roots[ 1 ];
        }
      }, {
        tandem: tandem.createTandem( 'rightCoordinatesProperty' ),
        phetioValueType: NullableIO( Vector2.Vector2IO ),
        phetioDocumentation: 'coordinates displayed on the right root, ' +
                             'identical to leftCoordinatesProperty if there is one root, ' +
                             'null if there are no roots or if all points are roots'
      } );

    // options common to both PointNode instances
    const pointNodeOptions = {
      radius: modelViewTransform.modelToViewDeltaX( GQConstants.POINT_RADIUS ),
      coordinatesForegroundColor: 'white',
      coordinatesBackgroundColor: GQColors.ROOTS,
      coordinatesDecimals: GQConstants.ROOTS_DECIMALS,
      x: modelViewTransform.modelToViewX( graph.xRange.getCenter() ),
      y: modelViewTransform.modelToViewY( graph.yRange.getCenter() )
    };

    // left root
    const leftRootNode = new PointNode( leftCoordinatesProperty, coordinatesVisibleProperty,
      combineOptions<PointNodeOptions>( {}, pointNodeOptions, {

        // Coordinates to the left of the point
        layoutCoordinates: ( coordinatesNode, pointNode ) => {
          coordinatesNode.right = pointNode.left - COORDINATES_X_SPACING;
          coordinatesNode.centerY = pointNode.centerY;
        },
        tandem: tandem.createTandem( 'leftRootNode' ),
        phetioDocumentation: 'the left root'
      } ) );

    // right root
    const rightRootNode = new PointNode( rightCoordinatesProperty, coordinatesVisibleProperty,
      combineOptions<PointNodeOptions>( {}, pointNodeOptions, {

        // Coordinates to the right of the point
        layoutCoordinates: ( coordinatesNode, pointNode ) => {
          coordinatesNode.left = pointNode.right + COORDINATES_X_SPACING;
          coordinatesNode.centerY = pointNode.centerY;
        },
        tandem: tandem.createTandem( 'rightRootNode' ),
        phetioDocumentation: 'the right root'
      } ) );

    options.children = [ leftRootNode, rightRootNode ];

    // visibility of this Node
    options.visibleProperty = new DerivedProperty(
      [ rootsVisibleProperty, quadraticProperty ],
      ( rootsVisible, quadratic ) =>
        rootsVisible &&  // the Roots checkbox is checked
        !!quadratic.roots && // it is not the case that all points on the quadratic are roots
        quadratic.roots.length !== 0, // there is at least one root
      {
        tandem: tandem.createTandem( 'visibleProperty' ),
        phetioValueType: BooleanIO
      } );

    super( options );

    quadraticProperty.link( quadratic => {

      // start with both roots invisible, make visible the ones that are needed
      leftRootNode.visible = false;
      rightRootNode.visible = false;

      const roots = quadratic.roots;

      if ( roots && roots.length !== 0 ) {
        assert && assert( roots.length === 1 || roots.length === 2, `unexpected number of roots: ${roots.length}` );

        const leftRoot = roots[ 0 ];
        leftRootNode.translation = modelViewTransform.modelToViewPosition( leftRoot );
        leftRootNode.visible = graph.contains( leftRoot );

        if ( roots.length === 2 ) {
          const rightRoot = roots[ 1 ];
          assert && assert( leftRoot.x < rightRoot.x, `unexpected order of roots: ${roots}` );
          rightRootNode.translation = modelViewTransform.modelToViewPosition( rightRoot );
          rightRootNode.visible = graph.contains( rightRoot );
        }
      }
    } );
  }
}

graphingQuadratics.register( 'RootsNode', RootsNode );