// Copyright 2020-2022, University of Colorado Boulder

/**
 * Shows a 2d version of the model, with assorted debugging information
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { DragListener, Node, Path, Rectangle } from '../../../../scenery/js/imports.js';
import Boat from '../../buoyancy/model/Boat.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyModel from '../model/DensityBuoyancyModel.js';
import Mass from '../model/Mass.js';

// constants
const scratchMatrix = new Matrix3();

export default class DebugView extends Node {

  private model: DensityBuoyancyModel;
  private layoutBounds: Bounds2;
  private modelViewTransform: ModelViewTransform2;
  private poolPath: Path;
  private massNodes: DebugMassNode[];

  // proportional to the area at that level that is displaced in the pool
  private poolAreaPath: Path;

  // proportional to the volume up to that level that is displaced in the pool
  private poolVolumePath: Path;

  // proportional to the area at that level that is displaced in the boat
  private boatAreaPath: Path;

  // proportional to the volume up to that level that is displaced in the boat
  private boatVolumePath: Path;

  public constructor( model: DensityBuoyancyModel, layoutBounds: Bounds2 ) {
    super();

    this.model = model;
    this.layoutBounds = layoutBounds;
    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping( Vector2.ZERO, this.layoutBounds.center, 600 );

    this.addChild( Rectangle.bounds( layoutBounds, {
      fill: 'rgba(255,255,255,0.5)'
    } ) );
    this.poolPath = new Path( null, {
      fill: 'rgba(0,128,255,0.5)',
      stroke: 'black'
    } );
    this.addChild( this.poolPath );

    const modelPoolShape = Shape.polygon( model.groundPoints );
    const viewPoolShape = this.modelViewTransform.modelToViewShape( modelPoolShape );

    this.addChild( new Path( viewPoolShape, {
      fill: 'rgba(161,101,47,0.5)',
      stroke: 'black'
    } ) );

    this.massNodes = [];

    const onMassAdded = ( mass: Mass ) => {
      const massNode = new DebugMassNode( model, mass, this.modelViewTransform );
      this.addChild( massNode );
      this.massNodes.push( massNode );
    };
    model.masses.addItemAddedListener( onMassAdded );
    model.masses.forEach( onMassAdded );

    model.masses.addItemRemovedListener( mass => {
      const massNode = _.find( this.massNodes, massNode => massNode.mass === mass )!;
      this.removeChild( massNode );
      massNode.dispose();
    } );

    this.poolAreaPath = new Path( null, {
      stroke: 'red'
    } );
    this.addChild( this.poolAreaPath );

    this.poolVolumePath = new Path( null, {
      stroke: 'green'
    } );
    this.addChild( this.poolVolumePath );

    this.boatAreaPath = new Path( null, {
      stroke: 'red'
    } );
    this.addChild( this.boatAreaPath );

    this.boatVolumePath = new Path( null, {
      stroke: 'green'
    } );
    this.addChild( this.boatVolumePath );
  }

  /**
   * Steps forward in time.
   */
  public step( dt: number ): void {
    if ( !this.visible ) {
      return;
    }

    let poolShape = Shape.bounds( new Bounds2(
      this.model.poolBounds.minX, this.model.poolBounds.minY,
      this.model.poolBounds.maxX, this.model.pool.liquidYInterpolatedProperty.value
    ) );
    this.model.masses.forEach( mass => {
      try {
        poolShape = poolShape.shapeDifference( mass.shapeProperty.value.transformed( mass.matrix ) );
        if ( mass instanceof Boat ) {
          const multiplier = Math.pow( mass.displacementVolumeProperty.value / 0.001, 1 / 3 );
          poolShape = poolShape.shapeDifference( mass.basin.oneLiterShape.transformed( Matrix3.scaling( multiplier ) ).transformed( mass.matrix ) );
        }
      }
      catch( e ) {
        console.log( e );
      }
    } );
    poolShape = this.modelViewTransform.modelToViewShape( poolShape );
    this.poolPath.shape = poolShape;

    const poolYValues = _.range( this.model.pool.stepBottom, this.model.pool.stepTop, 0.002 );

    const poolAreaShape = new Shape();
    poolYValues.map( y => new Vector2( this.model.pool.getDisplacedArea( y ), y ) ).forEach( point => {
      poolAreaShape.lineTo( this.modelViewTransform.modelToViewX( this.model.pool.bounds.maxX ) + point.x * 2000, this.modelViewTransform.modelToViewY( point.y ) );
    } );
    this.poolAreaPath.shape = poolAreaShape;

    const poolVolumeShape = new Shape();
    poolYValues.map( y => new Vector2( this.model.pool.getDisplacedVolume( y ), y ) ).forEach( point => {
      poolVolumeShape.lineTo( this.modelViewTransform.modelToViewX( this.model.pool.bounds.maxX ) + point.x * 10000, this.modelViewTransform.modelToViewY( point.y ) );
    } );
    this.poolVolumePath.shape = poolVolumeShape;

    const boat = this.model.masses.find( mass => mass.isBoat() );
    if ( boat instanceof Boat ) {
      const boatYValues = _.range( boat.stepBottom, boat.stepTop, 0.002 );

      const boatNode = _.find( this.massNodes, massNode => massNode.mass === boat )!;

      const boatAreaShape = new Shape();
      boatYValues.map( y => new Vector2( boat.basin.getDisplacedArea( y ), y ) ).forEach( point => {
        boatAreaShape.lineTo( boatNode.right + point.x * 2000, this.modelViewTransform.modelToViewY( point.y ) );
      } );
      this.boatAreaPath.shape = boatAreaShape;

      const boatVolumeShape = new Shape();
      boatYValues.map( y => new Vector2( boat.basin.getDisplacedVolume( y ), y ) ).forEach( point => {
        boatVolumeShape.lineTo( boatNode.right + point.x * 10000, this.modelViewTransform.modelToViewY( point.y ) );
      } );
      this.boatVolumePath.shape = boatVolumeShape;
    }
    else {
      this.boatAreaPath.shape = null;
      this.boatVolumePath.shape = null;
    }
  }
}

class DebugMassNode extends Node {

  public readonly mass: Mass;
  private readonly dragListener: DragListener;

  public constructor( model: DensityBuoyancyModel, mass: Mass, modelViewTransform: ModelViewTransform2 ) {
    super( {
      cursor: 'pointer'
    } );

    const path = new Path( null, {
      fill: 'rgba(160,255,100,0.5)',
      stroke: 'black'
    } );
    this.addChild( path );

    const intersectionPath = new Path( null, {
      stroke: 'black'
    } );
    this.addChild( intersectionPath );

    this.mass = mass;

    const shapeListener = ( shape: Shape ) => {
      const matrix = scratchMatrix.set( modelViewTransform.getMatrix() );

      // Zero out the translation
      matrix.set02( 0 );
      matrix.set12( 0 );

      if ( mass instanceof Boat ) {
        const multiplier = Math.pow( mass.displacementVolumeProperty.value / 0.001, 1 / 3 );
        const basinShape = mass.basin.oneLiterShape.transformed( Matrix3.scaling( multiplier ) );
        path.shape = shape.shapeDifference( basinShape ).transformed( matrix );
        intersectionPath.shape = shape.transformed( matrix );
      }
      else {
        path.shape = shape.transformed( matrix );
      }
    };
    mass.shapeProperty.link( shapeListener );
    this.disposeEmitter.addListener( () => {
      mass.shapeProperty.unlink( shapeListener );
    } );

    const transformListener = () => {
      const viewMatrix = scratchMatrix.set( modelViewTransform.getMatrix() ).multiplyMatrix( mass.matrix );
      this.translation = viewMatrix.translation;
      this.rotation = viewMatrix.rotation;
    };
    mass.transformedEmitter.addListener( transformListener );
    this.disposeEmitter.addListener( () => {
      mass.transformedEmitter.removeListener( transformListener );
    } );
    transformListener();

    if ( mass instanceof Boat ) {
      const waterPath = new Path( null, {
        fill: 'rgba(0,128,255,0.5)',
        stroke: 'black'
      } );
      this.addChild( waterPath );

      const hitPath = new Path( null, {
        stroke: 'red',
        pickable: false
      } );
      this.addChild( hitPath );

      const displacementListener = ( volume: number ) => {
        const matrix = scratchMatrix.set( modelViewTransform.getMatrix() );

        // Zero out the translation
        matrix.set02( 0 );
        matrix.set12( 0 );

        const multiplier = Math.pow( volume / 0.001, 1 / 3 );
        const basinShape = mass.basin.oneLiterShape.transformed( Matrix3.scaling( multiplier ) );

        hitPath.shape = basinShape.transformed( matrix );
      };
      mass.displacementVolumeProperty.link( displacementListener );
      this.disposeEmitter.addListener( () => {
        mass.displacementVolumeProperty.unlink( displacementListener );
      } );

      // @ts-expect-error
      const block = model.block;
      const liquidListener = () => {
        const y = mass.basin.liquidYInterpolatedProperty.value;

        if ( mass.basin.liquidVolumeProperty.value > 0 ) {
          const matrix = scratchMatrix.set( modelViewTransform.getMatrix() );

          // Zero out the translation
          matrix.set02( 0 );
          matrix.set12( 0 );

          const invertedMatrix = mass.matrix.inverted();

          const multiplier = Math.pow( mass.displacementVolumeProperty.value / 0.001, 1 / 3 );
          const basinShape = mass.basin.oneLiterShape.transformed( Matrix3.scaling( multiplier ) );
          const rectangleShape = Shape.bounds( new Bounds2( -10, -10, 10, y ) ).transformed( invertedMatrix );

          let waterShape = rectangleShape.shapeIntersection( basinShape );

          // assume BuoyancyApplicationsModel
          try {
            const blockShape = block.shapeProperty.value.transformed( block.matrix ).transformed( invertedMatrix );
            waterShape = waterShape.shapeDifference( blockShape );
          }
          catch( e ) {
            console.log( e );
          }

          waterPath.shape = waterShape.transformed( matrix );
        }
        else {
          waterPath.shape = null;
        }
      };
      mass.basin.liquidYInterpolatedProperty.link( liquidListener );
      block.shapeProperty.lazyLink( liquidListener );
      block.transformedEmitter.addListener( liquidListener );
      this.disposeEmitter.addListener( () => {
        mass.basin.liquidYInterpolatedProperty.unlink( liquidListener );
        block.shapeProperty.unlink( liquidListener );
        block.transformedEmitter.removeListener( liquidListener );
      } );
    }

    this.dragListener = new DragListener( {
      transform: modelViewTransform,
      applyOffset: false,
      start: ( event, listener ) => {
        mass.startDrag( listener.modelPoint );
      },
      drag: ( event, listener ) => {
        mass.updateDrag( listener.modelPoint );
      },
      end: () => {
        mass.endDrag();
      }
    } );
    this.addInputListener( this.dragListener );
  }
}

densityBuoyancyCommon.register( 'DebugView', DebugView );
