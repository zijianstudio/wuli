// Copyright 2014-2023, University of Colorado Boulder

/**
 * GQModel is the base class for the top-level model in Graphing Quadratics.
 *
 * @author Andrea Lin
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Graph from '../../../../graphing-lines/js/common/model/Graph.js';
import TModel from '../../../../joist/js/TModel.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import GQColors from '../GQColors.js';
import GQConstants from '../GQConstants.js';
import PointTool from './PointTool.js';
import Quadratic from './Quadratic.js';

// constants
const GRAPH_VIEW_ORIGIN = new Vector2( 345, 330 ); // position of the graph's origin, in view coordinates
const GRAPH_VIEW_WIDTH = 530; // width of the graph, in view coordinates

export default class GQModel implements TModel {

  public readonly graph: Graph; // graph where the quadratics will be plotted
  public readonly quadraticProperty: TReadOnlyProperty<Quadratic>; // the interactive quadratic
  public readonly savedQuadraticProperty: Property<Quadratic | null>; // the saved quadratic, null if nothing is saved

  // model-view transform, created in the model because it's dependent on graph axes ranges
  public readonly modelViewTransform: ModelViewTransform2;

  // Quadratic terms to be displayed, in the order that they will be considered by point tools (foreground to background).
  // The array may be empty. ObservableArray is not used here because we need to change the entire array contents atomically.
  public readonly quadraticTermsProperty: Property<Quadratic[]>;

  public readonly leftPointTool: PointTool;
  public readonly rightPointTool: PointTool;

  protected constructor( quadraticProperty: TReadOnlyProperty<Quadratic>, tandem: Tandem ) {

    this.graph = new Graph( GQConstants.X_AXIS_RANGE, GQConstants.Y_AXIS_RANGE );

    this.quadraticProperty = quadraticProperty;

    this.savedQuadraticProperty = new Property<Quadratic | null>( null, {
      valueType: [ Quadratic, null ],
      tandem: tandem.createTandem( 'savedQuadraticProperty' ),
      phetioDocumentation: 'the saved quadratic, null if there is no saved quadratic',
      phetioValueType: NullableIO( Quadratic.QuadraticIO )
    } );

    // scale from model to view
    const modelViewTransformScale = GRAPH_VIEW_WIDTH / this.graph.xRange.getLength();
    this.modelViewTransform = ModelViewTransform2.createOffsetXYScaleMapping(
      GRAPH_VIEW_ORIGIN,
      modelViewTransformScale,
      -modelViewTransformScale // y is inverted (+y is up in the model, +y is down in the view)
    );

    this.quadraticTermsProperty = new Property<Quadratic[]>( [] );

    // {DerivedProperty.<Quadratic[]>} Quadratics that are visible to the point tools,
    // in the order that they will be considered by point tools (foreground to background).
    // ObservableArrayDef is not used here because we need to change the entire array contents atomically.
    const pointToolQuadraticsProperty = new DerivedProperty(
      [ this.quadraticProperty, this.quadraticTermsProperty, this.savedQuadraticProperty ],
      ( quadratic, quadraticTerms, savedQuadratic ) => {
        // order is important! compact to remove nulls
        return _.compact( [ quadratic, ...quadraticTerms, savedQuadratic ] );
      } );

    this.leftPointTool = new PointTool( pointToolQuadraticsProperty, this.graph, {
      probeSide: 'right', // probe is attached to the right side
      position: new Vector2( -2, this.graph.yRange.min - 2 ), // below the graph
      dragBounds: new Bounds2(
        this.graph.xRange.min - 1, this.graph.yRange.min - 3,
        this.graph.xRange.max + 1, this.graph.yRange.max + 1 ),
      tandem: tandem.createTandem( 'leftPointTool' ),
      phetioDocumentation: 'The point tool that is initially on the left. It is typically grabbed from the left, and its probe is on the right.'
    } );

    this.rightPointTool = new PointTool( pointToolQuadraticsProperty, this.graph, {
      probeSide: 'left', // probe is attached to the left side
      position: new Vector2( 2, this.graph.yRange.min - 2 ), // below the graph
      dragBounds: new Bounds2(
        this.graph.xRange.min - 1, this.graph.yRange.min - 3,
        this.graph.xRange.max + 1, this.graph.yRange.max + 1 ),
      tandem: tandem.createTandem( 'rightPointTool' ),
      phetioDocumentation: 'The point tool that is initially on the right. It is typically grabbed from the right, and its probe is on the left.'
    } );
  }

  public reset(): void {
    this.savedQuadraticProperty.reset();
    this.leftPointTool.reset();
    this.rightPointTool.reset();
  }

  /**
   * Saves the interactive quadratic.
   */
  public saveQuadratic(): void {
    this.savedQuadraticProperty.value = this.quadraticProperty.value.withColor( GQColors.SAVED_CURVE );
  }

  /**
   * Erases the saved quadratic.
   */
  public eraseQuadratic(): void {
    this.savedQuadraticProperty.value = null;
  }
}

graphingQuadratics.register( 'GQModel', GQModel );