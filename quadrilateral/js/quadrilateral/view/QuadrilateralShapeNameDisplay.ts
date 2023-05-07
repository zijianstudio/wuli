// Copyright 2022-2023, University of Colorado Boulder

/**
 * A display for the current quadrilateral shape name. The name can be conditionally displayed, depending on
 * shapeNameVisibleProperty.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Property from '../../../../axon/js/Property.js';
import { Node, Rectangle, VoicingText, VoicingTextOptions } from '../../../../scenery/js/imports.js';
import ExpandCollapseButton from '../../../../sun/js/ExpandCollapseButton.js';
import quadrilateral from '../../quadrilateral.js';
import NamedQuadrilateral from '../model/NamedQuadrilateral.js';
import QuadrilateralConstants from '../../QuadrilateralConstants.js';
import Multilink from '../../../../axon/js/Multilink.js';
import QuadrilateralStrings from '../../QuadrilateralStrings.js';
import QuadrilateralColors from '../../QuadrilateralColors.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuadrilateralDescriber from './QuadrilateralDescriber.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';

// constants
const squareStringProperty = QuadrilateralStrings.shapeNames.squareStringProperty;
const rectangleStringProperty = QuadrilateralStrings.shapeNames.rectangleStringProperty;
const rhombusStringProperty = QuadrilateralStrings.shapeNames.rhombusStringProperty;
const kiteStringProperty = QuadrilateralStrings.shapeNames.kiteStringProperty;
const isoscelesTrapezoidStringProperty = QuadrilateralStrings.shapeNames.isoscelesTrapezoidStringProperty;
const trapezoidStringProperty = QuadrilateralStrings.shapeNames.trapezoidStringProperty;
const concaveQuadrilateralStringProperty = QuadrilateralStrings.shapeNames.concaveQuadrilateralStringProperty;
const convexQuadrilateralStringProperty = QuadrilateralStrings.shapeNames.convexQuadrilateralStringProperty;
const parallelogramStringProperty = QuadrilateralStrings.shapeNames.parallelogramStringProperty;
const dartStringProperty = QuadrilateralStrings.shapeNames.dartStringProperty;
const triangleStringProperty = QuadrilateralStrings.shapeNames.triangleStringProperty;
const shapeNameHiddenStringProperty = QuadrilateralStrings.shapeNameHiddenStringProperty;
const shapeNameHiddenContextResponseStringProperty = QuadrilateralStrings.a11y.voicing.shapeNameHiddenContextResponseStringProperty;
const shapeNameShownContextResponseStringProperty = QuadrilateralStrings.a11y.voicing.shapeNameShownContextResponseStringProperty;

const SHAPE_NAME_MAP = new Map( [
  [ NamedQuadrilateral.SQUARE, squareStringProperty ],
  [ NamedQuadrilateral.RECTANGLE, rectangleStringProperty ],
  [ NamedQuadrilateral.RHOMBUS, rhombusStringProperty ],
  [ NamedQuadrilateral.KITE, kiteStringProperty ],
  [ NamedQuadrilateral.ISOSCELES_TRAPEZOID, isoscelesTrapezoidStringProperty ],
  [ NamedQuadrilateral.TRAPEZOID, trapezoidStringProperty ],
  [ NamedQuadrilateral.CONCAVE_QUADRILATERAL, concaveQuadrilateralStringProperty ],
  [ NamedQuadrilateral.CONVEX_QUADRILATERAL, convexQuadrilateralStringProperty ],
  [ NamedQuadrilateral.PARALLELOGRAM, parallelogramStringProperty ],
  [ NamedQuadrilateral.DART, dartStringProperty ],
  [ NamedQuadrilateral.TRIANGLE, triangleStringProperty ]
] );

// empirically determined
const DISPLAY_WIDTH = 350;
const DISPLAY_HEIGHT = 40;

export default class QuadrilateralShapeNameDisplay extends Node {
  public constructor( shapeNameVisibleProperty: Property<boolean>, shapeNameProperty: TReadOnlyProperty<NamedQuadrilateral>, quadrilateralDescriber: QuadrilateralDescriber, tandem: Tandem ) {
    super();

    // display contents
    const expandCollapseButton = new ExpandCollapseButton( shapeNameVisibleProperty, {
      sideLength: 20,

      // phet-io
      tandem: tandem.createTandem( 'expandCollapseButton' )
    } );

    const shapeNameText = new VoicingText( '', combineOptions<VoicingTextOptions>( {

      // Remove this component from the traversal order even though it uses Voicing. For alt input + voicing,
      // the expandCollapseButton as an interactive component is sufficient, see
      // https://github.com/phetsims/quadrilateral/issues/238#issuecomment-1276306315 for this request
      readingBlockTagName: null
    }, QuadrilateralConstants.SHAPE_NAME_TEXT_OPTIONS ) );

    const backgroundRectangle = new Rectangle( 0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT, QuadrilateralConstants.CORNER_RADIUS, QuadrilateralConstants.CORNER_RADIUS, {
      fill: QuadrilateralColors.panelFillColorProperty,
      stroke: QuadrilateralColors.panelStrokeColorProperty
    } );
    this.children = [ backgroundRectangle, expandCollapseButton, shapeNameText ];

    let wasVisible = shapeNameVisibleProperty.value;

    // Update display text and contents to be spoken from Voicing interactions. See
    // https://github.com/phetsims/quadrilateral/issues/238 for the design of the Voicing responses. Linked
    // to the actual string Properties to support dynamic locales.
    Multilink.multilinkAny( [ shapeNameVisibleProperty, shapeNameProperty, ...SHAPE_NAME_MAP.values(), shapeNameHiddenStringProperty ], () => {
      let textStringProperty;

      if ( shapeNameVisibleProperty.value ) {
        const shapeName = shapeNameProperty.value;
        assert && assert( SHAPE_NAME_MAP.has( shapeName ), 'Shape is not named in SHAPE_NAME_MAP' );
        textStringProperty = SHAPE_NAME_MAP.get( shapeName )!;

        // Text is bold when shape name is visible
        shapeNameText.fontWeight = 'bold';

        // voicing - when shape name is shown we should include the detected shape in the name response
        expandCollapseButton.voicingNameResponse = quadrilateralDescriber.getYouHaveAShapeDescription();
        expandCollapseButton.voicingContextResponse = shapeNameShownContextResponseStringProperty;
        shapeNameText.readingBlockNameResponse = textStringProperty;
      }
      else {
        textStringProperty = shapeNameHiddenStringProperty;
        shapeNameText.fontWeight = 'normal';

        // voicing
        expandCollapseButton.voicingNameResponse = shapeNameHiddenStringProperty;
        expandCollapseButton.voicingContextResponse = shapeNameHiddenContextResponseStringProperty;
        shapeNameText.readingBlockNameResponse = textStringProperty;
      }

      // Only after updating voicing response content, speak the response. We only announce this when visibility
      // changes, not when shapeNameProperty changes. Done in this multilink instead of its own link so that
      // the output is independent of listener order.
      if ( wasVisible !== shapeNameVisibleProperty.value ) {
        expandCollapseButton.voicingSpeakFullResponse();
        wasVisible = shapeNameVisibleProperty.value;
      }

      shapeNameText.string = textStringProperty.value;
      shapeNameText.center = backgroundRectangle.center;
    } );

    // layout
    shapeNameText.center = backgroundRectangle.center;
    expandCollapseButton.leftCenter = backgroundRectangle.leftCenter.plusXY( expandCollapseButton.width / 2, 0 );
  }
}

quadrilateral.register( 'QuadrilateralShapeNameDisplay', QuadrilateralShapeNameDisplay );
