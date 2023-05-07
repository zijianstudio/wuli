// Copyright 2014-2022, University of Colorado Boulder

/**
 * Reward node that shows many nodes animating continuously, for fun!  Shown when a perfect score is achieved in a game.
 * You can also test this by running vegas/vegas_en.html and clicking on the "Reward" screen.
 * Note that the number of images falling is constant, so if the screen is stretched out vertically (tall thin window)
 * they will be less dense.
 *
 * There are two ways to run the animation step function.  The client code can manually call step(dt), or the client
 * code can pass in an Events instance that triggers events on 'step'. In the latter case, the listener will
 * automatically be removed when the animation is complete.
 *
 * For details about the development of the RewardNode, please see https://github.com/phetsims/vegas/issues/4
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import TEmitter from '../../axon/js/TEmitter.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import dotRandom from '../../dot/js/dotRandom.js';
import ScreenView from '../../joist/js/ScreenView.js';
import getGlobal from '../../phet-core/js/getGlobal.js';
import optionize from '../../phet-core/js/optionize.js';
import FaceNode from '../../scenery-phet/js/FaceNode.js';
import StarNode from '../../scenery-phet/js/StarNode.js';
import { CanvasNode, CanvasNodeOptions, Display, Node, TransformTracker } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import vegas from './vegas.js';

// constants
const DEBUG_CANVAS_NODE_BOUNDS = false; // shows a gray rectangle for the CanvasNode to help ensure that its bounds are accurate
const MAX_SPEED = 200; // The maximum speed an image can fall in screen pixels per second.

// Data structure to hold a cached HTMLImageElement and its associated properties.
type CachedImage = {

  // The image to be rendered in the canvas, to be filled in by toImage callback.
  image: HTMLImageElement | null;

  // Node that the cached images is associated with
  node: Node;

  // Width and height of the associated Node, so that image can be positioned before the toImage call has completed.
  width: number;
  height: number;
};

// Data structure that describes each individual image that you see animating.
type RewardImage = {

  // Data structure that describes the image to render
  cachedImage: CachedImage;

  // Current x and y coordinates of the image
  x: number;
  y: number;

  // Random speed at which to animate the image
  speed: number;
};

type SelfOptions = {

  // Nodes to appear in the reward node. They will be cached as images to improve performance.
  // If null, then default Nodes will be created.
  nodes?: Node[] | null;

  // Scale things up for rasterization, then back down for rendering, so they have nice quality on retina displays.
  scaleForResolution?: number;

  // If you pass in a stepEmitter {Emitter}, it will drive the animation
  stepEmitter?: TEmitter<[ number ]> | null;
};

export type RewardNodeOptions = SelfOptions & CanvasNodeOptions;

export default class RewardNode extends CanvasNode {

  // See SelfOptions.nodes
  private readonly nodes: Node[];

  // See SelfOptions.scaleForResolution
  private readonly scaleForResolution: number;

  // Data structure for each cached image.
  private readonly cachedImages: CachedImage[];

  // Data structure for each image that is draw in the reward. Set by initialize, so it's not readonly.
  private rewardImages: RewardImage[];

  // Bounds in which to render the canvas, which represents the full window. See below for how this is computed based
  // on ScreenView bounds and relative transforms. Set by initialize, so it's not readonly.
  private canvasDisplayBounds: Bounds2;

  // Will watch the transform of Nodes along the Trail to this Node so that we can update the canvasDisplayBounds
  // when the RewardNode or any of its ancestors has a change in transform. Set by initialize, so it's not readonly.
  private transformTracker: TransformTracker | null;

  // Set by initialize, so not readonly.
  private isInitialized: boolean;

  // If you provide RewardNodeOptions.stepEmitter, it will call this method to drive animation
  private readonly stepEmitterListener: ( dt: number ) => void;

  // For PhET-iO brand only: make sure this Node is initialized when state is being set for PhET-iO
  private readonly initializer: () => void;

  private readonly disposeRewardNode: () => void;

  public constructor( providedOptions?: RewardNodeOptions ) {

    const options = optionize<RewardNodeOptions, SelfOptions, CanvasNodeOptions>()( {

      // SelfOptions
      nodes: null,
      scaleForResolution: 2,
      stepEmitter: null
    }, providedOptions );

    super( options );

    this.scaleForResolution = options.scaleForResolution;
    this.rewardImages = [];
    this.canvasDisplayBounds = new Bounds2( 0, 0, 0, 0 );
    this.transformTracker = null;
    this.isInitialized = false;

    this.stepEmitterListener = ( dt: number ) => this.step( dt );
    options.stepEmitter && options.stepEmitter.addListener( this.stepEmitterListener );

    // Use the provided Nodes, or create defaults.
    this.nodes = options.nodes || RewardNode.createRandomNodes( [
      new FaceNode( 40, { headStroke: 'black', headLineWidth: 1.5 } ),
      new StarNode()
    ], 150 );

    // For each unique Node, cache its rasterized image.
    this.cachedImages = _.uniq( this.nodes ).map( node => {

      const cachedImage: CachedImage = {
        image: null,
        node: node,
        width: node.width,
        height: node.height
      };

      const parent = new Node( {
        children: [ node ],
        scale: this.scaleForResolution
      } );

      parent.toImage( image => {
        cachedImage.image = image;
        parent.dispose(); // not needed anymore, see https://github.com/phetsims/area-model-common/issues/128
      } );

      return cachedImage;
    } );

    this.initializer = () => this.initialize();
    Tandem.PHET_IO_ENABLED && phet.phetio.phetioEngine.phetioStateEngine.stateSetEmitter.addListener( this.initializer );

    this.disposeRewardNode = () => {
      options.stepEmitter && options.stepEmitter.removeListener( this.stepEmitterListener );
      this.transformTracker && this.transformTracker.dispose();
      Tandem.PHET_IO_ENABLED && phet.phetio.phetioEngine.phetioStateEngine.stateSetEmitter.removeListener( this.initializer );
    };
  }

  public override dispose(): void {
    this.disposeRewardNode();
    super.dispose();
  }

  /**
   * Paint the rewards on the canvas.
   */
  public paintCanvas( context: CanvasRenderingContext2D ): void {

    // If the debugging flag is on, show the bounds of the canvas
    if ( DEBUG_CANVAS_NODE_BOUNDS ) {
      const bounds = this.canvasDisplayBounds;

      // Fill the canvas with gray
      context.fillStyle = 'rgba(50,50,50,0.5)';
      context.fillRect( bounds.minX, bounds.minY, bounds.width, bounds.height );

      // Stroke the canvas border with blue
      context.strokeStyle = '#0000ff';
      context.lineWidth = 5;
      context.strokeRect( bounds.minX, bounds.minY, bounds.width, bounds.height );
    }

    context.scale( 1 / this.scaleForResolution, 1 / this.scaleForResolution );

    // Display the rewards.
    this.rewardImages.forEach( reward => {
      if ( reward.cachedImage.image ) {
        context.drawImage( reward.cachedImage.image, reward.x, reward.y );
      }
    } );
  }

  /**
   * Finds the first parent that is a ScreenView, so we can listen for its transform,
   * see https://github.com/phetsims/vegas/issues/4
   */
  private getScreenView(): Node {
    return this.getUniqueTrail( node => node instanceof ScreenView ).rootNode();
  }

  /**
   * Only initialize after being attached to the scene graph, since we must ascertain the local bounds are such that
   * they take up the global screen. Do not move the RewardNode in the scene graph after calling initialize.
   *
   * 1. Listen to the size of the scene/display.
   * 2. Record the trail between the scene and your CanvasNode, and
   * 3. Apply the inverse of that transform to the CanvasNode (whenever an ancestor's transform changes, or when the
   *    scene/display size changes).
   *
   * @jonathanolson said: For implementing now, I'd watch the iso transform, compute the inverse, and set bounds on
   * changes to be precise (since you need them anyways to draw).
   */
  private initialize(): void {

    const display: Display = getGlobal( 'phet.joist.display' );

    if ( !this.isInitialized && this.getUniqueTrail().length > 0 ) {

      const uniqueTrail = this.getUniqueTrail();
      const indexOfScreenView = uniqueTrail.nodes.indexOf( this.getScreenView() );
      const trailFromScreenViewToThis = uniqueTrail.slice( indexOfScreenView );

      // Listen to the bounds of the scene, so the canvas can be resized if the window is reshaped.
      const updateBounds = () => {
        assert && assert( this.getUniqueTrail().equals( uniqueTrail ),
          'Do not move the RewardNode in the scene graph after calling initialize or the transformation may break.' );

        // These bounds represent the full window relative to the scene. It is transformed by the inverse of the
        // ScreenView's matrix (globalToLocalBounds) because the RewardNode is meant to fill the ScreenView. RewardNode
        // nodes are placed within these bounds.
        this.canvasDisplayBounds = trailFromScreenViewToThis.globalToLocalBounds( display.bounds );

        const local = this.globalToLocalBounds( display.bounds );
        this.setCanvasBounds( local );
      };

      this.transformTracker = new TransformTracker( uniqueTrail );
      this.transformTracker.addListener( updateBounds );

      // Set the initial bounds.
      updateBounds();

      // Initialize, now that we have bounds.
      this.rewardImages = this.nodes.map( node => {

        // Find the cachedImage that corresponds to the node
        const cachedImage = _.find( this.cachedImages, cachedImage => cachedImage.node === node )!;

        const reward: RewardImage = {
          cachedImage: cachedImage,
          x: this.randomX( cachedImage.width ),
          y: this.randomY( cachedImage.height ),
          speed: ( dotRandom.nextDouble() + 1 ) * MAX_SPEED
        };

        return reward;
      } );

      this.isInitialized = true;
    }
  }

  /**
   * Selects a random X value for the image when it is created.
   */
  private randomX( nodeWidth: number ): number {
    return ( dotRandom.nextDouble() * this.canvasDisplayBounds.width + this.canvasDisplayBounds.left ) *
           this.scaleForResolution - nodeWidth / 2;
  }

  /**
   * Selects a random Y value for the image when it is created, or when it goes back to the top of the screen.
   * This start about 1 second off the top of the screen
   */
  private randomY( nodeHeight: number ): number {
    return this.canvasDisplayBounds.top - dotRandom.nextDouble() * this.canvasDisplayBounds.height * 2 -
           MAX_SPEED - nodeHeight;
  }

  /**
   * Animates the images.
   */
  public step( dt: number ): void {
    this.initialize();

    const maxY = this.canvasDisplayBounds.height * this.scaleForResolution;

    // Move all images.
    this.rewardImages.forEach( reward => {

      // Move each image straight down at constant speed.
      reward.y += reward.speed * dt;

      // Move back to the top after the image falls off the bottom.
      if ( reward.y > maxY ) {
        reward.x = this.randomX( reward.cachedImage.width );
        reward.y = this.randomY( reward.cachedImage.height );
      }
    } );

    this.invalidatePaint();
  }

  /**
   * Convenience factory method to create an array of the specified Nodes in an even distribution.
   */
  public static createRandomNodes( nodes: Node[], count: number ): Node[] {
    const array = [];
    for ( let i = 0; i < count; i++ ) {
      array.push( nodes[ i % nodes.length ] );
    }
    return array;
  }
}

vegas.register( 'RewardNode', RewardNode );