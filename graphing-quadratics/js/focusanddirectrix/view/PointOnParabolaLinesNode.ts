// Copyright 2018-2023, University of Colorado Boulder

/**
 * Dashed lines that connect the 'point on parabola' to the focus and directrix.
 * The visibility of the point-focus and point-directrix lines is controlled independently.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { Line, LineOptions, Node } from '../../../../scenery/js/imports.js';
import GQColors from '../../common/GQColors.js';
import GQConstants from '../../common/GQConstants.js';
import Quadratic from '../../common/model/Quadratic.js';
import graphingQuadratics from '../../graphingQuadratics.js';

export default class PointOnParabolaLinesNode extends Node {

  public constructor( quadraticProperty: TReadOnlyProperty<Quadratic>,
                      pointOnParabolaProperty: TReadOnlyProperty<Vector2>,
                      modelViewTransform: ModelViewTransform2,
                      pointOnParabolaVisibleProperty: TReadOnlyProperty<boolean>,
                      focusVisibleProperty: TReadOnlyProperty<boolean>,
                      directrixVisibleProperty: TReadOnlyProperty<boolean> ) {

    const pathOptions = {
      stroke: GQColors.POINT_ON_PARABOLA,
      lineWidth: GQConstants.POINT_ON_PARABOLA_LINE_WIDTH,
      lineDash: GQConstants.POINT_ON_PARABOLA_LINE_DASH
    };

    // line connecting point and focus
    const focusLine = new Line( 0, 0, 0, 1, combineOptions<LineOptions>( {
      visibleProperty: new DerivedProperty(
        [ pointOnParabolaVisibleProperty, focusVisibleProperty ],
        ( pointOnParabolaVisible, focusVisibleProperty ) => {
          return ( pointOnParabolaVisible && focusVisibleProperty );
        } )
    }, pathOptions ) );

    // line connecting point and directrix                                             
    const directrixLine = new Line( 0, 0, 0, 1, combineOptions<LineOptions>( {
      visibleProperty: new DerivedProperty(
        [ pointOnParabolaVisibleProperty, directrixVisibleProperty ],
        ( pointOnParabolaVisible, directrixVisible ) => {
          return ( pointOnParabolaVisible && directrixVisible );
        } )
    }, pathOptions ) );

    super( {
      children: [ focusLine, directrixLine ]
    } );

    // update the lines
    Multilink.multilink( [ quadraticProperty, pointOnParabolaProperty ],
      ( quadratic, pointOnParabola ) => {

        assert && assert( quadratic.isaParabola(), `expected a parabola, quadratic=${quadratic}` );
        assert && assert( quadratic.focus );
        assert && assert( quadratic.directrix !== undefined );

        const pointView = modelViewTransform.modelToViewPosition( pointOnParabola );
        const focusView = modelViewTransform.modelToViewPosition( quadratic.focus! );
        const directrixView = modelViewTransform.modelToViewY( quadratic.directrix! );

        focusLine.setLine( pointView.x, pointView.y, focusView.x, focusView.y );
        directrixLine.setLine( pointView.x, pointView.y, pointView.x, directrixView );
      } );
  }
}

graphingQuadratics.register( 'PointOnParabolaLinesNode', PointOnParabolaLinesNode );