// Copyright 2023, University of Colorado Boulder

import CAVObjectNode, { CAVObjectNodeOptions } from './CAVObjectNode.js';
import centerAndVariability from '../../centerAndVariability.js';
import SoccerBall from '../model/SoccerBall.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import CAVObjectType from '../model/CAVObjectType.js';
import { Circle, Node, Path, TColor } from '../../../../scenery/js/imports.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import timesSolidShape from '../../../../sherpa/js/fontawesome-5/timesSolidShape.js';
import CAVConstants from '../CAVConstants.js';
import PlotType from '../model/PlotType.js';
import Multilink from '../../../../axon/js/Multilink.js';

export default class DataPointNode extends CAVObjectNode {

  public constructor( soccerBall: SoccerBall, isShowingPlayAreaMedianProperty: TReadOnlyProperty<boolean>,
                      modelViewTransform: ModelViewTransform2,
                      options: CAVObjectNodeOptions & { fill: TColor } ) {

    super( soccerBall, isShowingPlayAreaMedianProperty, modelViewTransform, CAVObjectType.DATA_POINT.radius, options );

    const viewRadius = modelViewTransform.modelToViewDeltaX( CAVObjectType.DATA_POINT.radius );

    const circle = new Circle( viewRadius, {
      fill: options.fill,
      center: Vector2.ZERO
    } );
    const cross = new Path( timesSolidShape, {

      // Leave some spacing between the stacked 'x' marks
      fill: options.fill,
      maxWidth: viewRadius * 2 * 0.8,
      center: Vector2.ZERO
    } );
    CAVConstants.PLOT_TYPE_PROPERTY.link( plotType => {
      circle.visible = plotType === PlotType.DOT_PLOT;
      cross.visible = plotType === PlotType.LINE_PLOT;
    } );
    const node = new Node( {
      children: [ circle, cross ],

      // if the child node is non-square, it should still fit within specified dimensions. Note: this does not change the
      // aspect ratio.
      maxWidth: viewRadius * 2,
      maxHeight: viewRadius * 2,
      center: Vector2.ZERO
    } );

    this.addChild( node );

    // Data point should be visible if the soccer ball is active AND if the soccer ball took a non-null value.
    Multilink.multilink( [ soccerBall.isActiveProperty, soccerBall.valueProperty ], ( isActive, value ) => {
      this.visible = isActive && value !== null;
    } );

    // show or hide the median highlight
    Multilink.multilink(
      [ soccerBall.isMedianObjectProperty, isShowingPlayAreaMedianProperty, soccerBall.isShowingAnimationHighlightProperty ],
      ( isMedianObject, isShowingPlayAreaMedian, isShowingAnimationHighlight ) => {
        this.medianHighlight.visible = isShowingAnimationHighlight;

        // Median highlights should be in front in z-ordering. Rather than accomplishing this via a different layer,
        // move this to the front when it is visible.
        if ( this.medianHighlight.visible ) {
          this.moveToFront();
        }
      } );
  }
}

centerAndVariability.register( 'DataPointNode', DataPointNode );