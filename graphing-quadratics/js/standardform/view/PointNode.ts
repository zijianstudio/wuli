// Copyright 2018-2023, University of Colorado Boulder

/**
 * PointNode is a non-interactive point on the graph, labeled with (x,y) coordinates.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PickOptional from '../../../../phet-core/js/types/PickOptional.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { Circle, Node, NodeOptions, NodeTranslationOptions, TColor } from '../../../../scenery/js/imports.js';
import CoordinatesNode from '../../common/view/CoordinatesNode.js';
import graphingQuadratics from '../../graphingQuadratics.js';

// Positions the coordinates relative to the point
type LayoutCoordinatesFunction = ( coordinatesNode: Node, pointNode: Node ) => void;

const DEFAULT_LAYOUT_COORDINATES: LayoutCoordinatesFunction = ( coordinatesNode, pointNode ) => {
  // centered above the point
  coordinatesNode.centerX = pointNode.centerX;
  coordinatesNode.bottom = pointNode.top - 5;
};

type SelfOptions = {

  // radius of the point
  radius?: number;

  // options passed to CoordinatesNode
  coordinatesBackgroundColor?: TColor;
  coordinatesForegroundColor?: TColor;
  coordinatesDecimals?: number;

  // Positions the coordinates when coordinatesProperty changes
  layoutCoordinates?: LayoutCoordinatesFunction;
};

export type PointNodeOptions = SelfOptions & NodeTranslationOptions &
  PickOptional<NodeOptions, 'visibleProperty' | 'phetioDocumentation'> &
  PickRequired<NodeOptions, 'tandem'>;

export default class PointNode extends Node {

  public constructor( coordinatesProperty: TReadOnlyProperty<Vector2 | null>,
                      coordinatesVisibleProperty: TReadOnlyProperty<boolean>,
                      providedOptions: PointNodeOptions ) {

    const options = optionize<PointNodeOptions, SelfOptions, NodeOptions>()( {

      // SelfOptions
      radius: 10,
      coordinatesBackgroundColor: 'black',
      coordinatesForegroundColor: 'white',
      coordinatesDecimals: 0,
      layoutCoordinates: DEFAULT_LAYOUT_COORDINATES,

      // NodeOptions
      visiblePropertyOptions: { phetioReadOnly: true }
    }, providedOptions );

    // the point
    const pointNode = new Circle( options.radius, {
      fill: options.coordinatesBackgroundColor,
      x: 0,
      y: 0
    } );

    // the coordinates
    const coordinatesNode = new CoordinatesNode( coordinatesProperty, {
      backgroundColor: options.coordinatesBackgroundColor,
      foregroundColor: options.coordinatesForegroundColor,
      decimals: options.coordinatesDecimals,
      visibleProperty: coordinatesVisibleProperty,
      tandem: options.tandem.createTandem( 'coordinatesNode' ),
      phetioDocumentation: 'coordinates displayed on this point'
    } );

    options.children = [ pointNode, coordinatesNode ];

    super( options );

    // Update layout
    coordinatesNode.boundsProperty.link( () => options.layoutCoordinates( coordinatesNode, pointNode ) );
  }
}

graphingQuadratics.register( 'PointNode', PointNode );