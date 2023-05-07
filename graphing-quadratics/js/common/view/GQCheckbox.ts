// Copyright 2018-2023, University of Colorado Boulder

/**
 * GQCheckbox is the base class for a checkbox that is labeled with text, with an optional icon to the right of the text.
 * This provides consistent font and textNode.maxWidth for all checkboxes in the sim, and factory methods for
 * creating each checkbox.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Circle, HBox, Line, Node, RichText, TColor } from '../../../../scenery/js/imports.js';
import Checkbox, { CheckboxOptions } from '../../../../sun/js/Checkbox.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import GQConstants from '../GQConstants.js';
import GraphingQuadraticsStrings from '../../GraphingQuadraticsStrings.js';
import GQColors from '../GQColors.js';
import GQSymbols from '../GQSymbols.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import Manipulator from '../../../../graphing-lines/js/common/view/manipulator/Manipulator.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';

type SelfOptions = {
  string: TReadOnlyProperty<string> | string; // required string for text
  textFill?: TColor; // color of the text
  textMaxWidth?: number; // maxWidth of the text
  font?: PhetFont; // font for the text
  icon?: Node; // optional icon, to the right of the text
};

type GQCheckboxOptions = SelfOptions & PickRequired<CheckboxOptions, 'tandem' | 'phetioDocumentation'>;

export default class GQCheckbox extends Checkbox {

  protected constructor( booleanProperty: Property<boolean>, providedOptions: GQCheckboxOptions ) {

    const options = optionize<GQCheckboxOptions, StrictOmit<SelfOptions, 'icon'>, CheckboxOptions>()( {

      // SelfOptions
      textFill: 'black',
      textMaxWidth: 180, // determined empirically
      font: GQConstants.CHECKBOX_LABEL_FONT
    }, providedOptions );

    const text = new RichText( options.string, {
      fill: options.textFill,
      font: options.font,
      maxWidth: options.textMaxWidth,
      tandem: options.tandem.createTandem( 'text' )
    } );

    const content = ( !options.icon ) ?
                    text :
                    new HBox( {
                      align: 'center',
                      spacing: 8,
                      children: [ text, options.icon ]
                    } );

    super( booleanProperty, content, options );
  }

  /**
   * Creates the checkbox for the quadratic term, y = ax^2
   */
  public static createQuadraticTermCheckbox( property: Property<boolean>, tandem: Tandem ): GQCheckbox {
    return new GQCheckbox( property, {
      string: `${GQSymbols.y} ${MathSymbols.EQUAL_TO} ${GQSymbols.a}${GQSymbols.xSquared}`, // y = ax^2
      textFill: GQColors.QUADRATIC_TERM,
      tandem: tandem,
      phetioDocumentation: 'checkbox that makes the quadratic term (y = ax^2) visible on the graph'
    } );
  }

  /**
   * Creates the checkbox for the linear term, y = bx
   */
  public static createLinearTermCheckbox( property: Property<boolean>, tandem: Tandem ): GQCheckbox {
    return new GQCheckbox( property, {
      string: `${GQSymbols.y} ${MathSymbols.EQUAL_TO} ${GQSymbols.b}${GQSymbols.x}`, // y = bx
      textFill: GQColors.LINEAR_TERM,
      tandem: tandem,
      phetioDocumentation: 'checkbox that makes the linear term (y = bx) visible on the graph'
    } );
  }

  /**
   * Creates the checkbox for the constant term, y = c
   */
  public static createConstantTermCheckbox( property: Property<boolean>, tandem: Tandem ): GQCheckbox {
    return new GQCheckbox( property, {
      string: `${GQSymbols.y} ${MathSymbols.EQUAL_TO} ${GQSymbols.c}`, // y = c
      textFill: GQColors.CONSTANT_TERM,
      tandem: tandem,
      phetioDocumentation: 'checkbox that makes the constant term (y = c) visible on the graph'
    } );
  }

  /**
   * Creates the 'Axis of Symmetry' checkbox, with a vertical dashed line for the icon.
   */
  public static createAxisOfSymmetryCheckbox( property: Property<boolean>, tandem: Tandem ): GQCheckbox {
    return new GQCheckbox( property, {
      string: GraphingQuadraticsStrings.axisOfSymmetryStringProperty,
      icon: new Line( 0, 0, 0, 5 * GQConstants.AXIS_OF_SYMMETRY_LINE_DASH[ 0 ], {
        stroke: GQColors.AXIS_OF_SYMMETRY,
        lineWidth: GQConstants.AXIS_OF_SYMMETRY_LINE_WIDTH,
        lineDash: GQConstants.AXIS_OF_SYMMETRY_LINE_DASH
      } ),
      tandem: tandem,
      phetioDocumentation: 'checkbox that makes the axis of symmetry visible on the graph'
    } );
  }

  /**
   * Creates the 'Coordinates' checkbox.
   */
  public static createCoordinatesCheckbox( property: Property<boolean>, tandem: Tandem ): GQCheckbox {
    return new GQCheckbox( property, {
      string: GraphingQuadraticsStrings.coordinatesStringProperty,
      tandem: tandem,
      phetioDocumentation: 'checkbox that makes the (x,y) coordinates visible on points on the graph'
    } );
  }

  /**
   * Creates the 'Directrix' checkbox, with a horizontal dashed line for the icon.
   */
  public static createDirectrixCheckbox( property: Property<boolean>, tandem: Tandem ): GQCheckbox {
    return new GQCheckbox( property, {
      string: GraphingQuadraticsStrings.directrixStringProperty,
      icon: new Line( 0, 0, 5 * GQConstants.DIRECTRIX_LINE_DASH[ 0 ], 0, {
        stroke: GQColors.DIRECTRIX,
        lineWidth: GQConstants.DIRECTRIX_LINE_WIDTH,
        lineDash: GQConstants.DIRECTRIX_LINE_DASH
      } ),
      tandem: tandem,
      phetioDocumentation: 'checkbox that shows the directrix on the graph'
    } );
  }

  /**
   * Creates the 'Equations' checkbox.
   */
  public static createEquationsCheckbox( property: Property<boolean>, tandem: Tandem ): GQCheckbox {
    return new GQCheckbox( property, {
      string: GraphingQuadraticsStrings.equationsStringProperty,
      tandem: tandem,
      phetioDocumentation: 'checkbox that shows equations on graphed curves'
    } );
  }

  /**
   * Creates the 'Focus' checkbox, with a manipulator icon.
   */
  public static createFocusCheckbox( property: Property<boolean>, tandem: Tandem ): GQCheckbox {
    return new GQCheckbox( property, {
      string: GraphingQuadraticsStrings.focusStringProperty,
      icon: Manipulator.createIcon( 8, GQColors.FOCUS ),
      tandem: tandem,
      phetioDocumentation: 'checkbox that shows the focus on the graph'
    } );
  }

  /**
   * Creates the 'Point on Parabola' checkbox, with a manipulator icon.
   */
  public static createPointOnParabolaCheckbox( property: Property<boolean>, tandem: Tandem ): GQCheckbox {
    return new GQCheckbox( property, {
      string: GraphingQuadraticsStrings.pointOnParabolaStringProperty,
      icon: Manipulator.createIcon( 8, GQColors.POINT_ON_PARABOLA ),
      tandem: tandem,
      phetioDocumentation: 'checkbox that shows the point on the parabola on the graph'
    } );
  }

  /**
   * Creates the 'Roots' checkbox, with a pair of flat points for the icon.
   */
  public static createRootsCheckbox( property: Property<boolean>, tandem: Tandem ): GQCheckbox {

    const circleOptions = {
      radius: 6,
      fill: GQColors.ROOTS
    };

    const icon = new HBox( {
      align: 'center',
      spacing: 5,
      children: [
        new Circle( circleOptions ),
        new Circle( circleOptions )
      ]
    } );

    return new GQCheckbox( property, {
      string: GraphingQuadraticsStrings.rootsStringProperty,
      icon: icon,
      tandem: tandem,
      phetioDocumentation: 'checkbox that shows roots on the graph'
    } );
  }

  /**
   * Creates the 'Vertex' checkbox, with a flat point for the icon.
   */
  public static createVertexPointCheckbox( property: Property<boolean>, tandem: Tandem ): GQCheckbox {
    return new GQCheckbox( property, {
      string: GraphingQuadraticsStrings.vertexStringProperty,
      icon: new Circle( 6, { fill: GQColors.VERTEX } ),
      tandem: tandem,
      phetioDocumentation: 'checkbox that shows the vertex on the graph'
    } );
  }

  /**
   * Creates the 'Vertex' checkbox, with a manipulator icon.
   */
  public static createVertexManipulatorCheckbox( property: Property<boolean>, tandem: Tandem ): GQCheckbox {
    return new GQCheckbox( property, {
      string: GraphingQuadraticsStrings.vertexStringProperty,
      icon: Manipulator.createIcon( 8, GQColors.VERTEX ),
      tandem: tandem,
      phetioDocumentation: 'checkbox that shows the vertex manipulator on the graph'
    } );
  }
}

graphingQuadratics.register( 'GQCheckbox', GQCheckbox );