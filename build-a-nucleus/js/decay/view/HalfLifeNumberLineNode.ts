// Copyright 2022-2023, University of Colorado Boulder

/**
 * Node that has a number line with makeshift log-scale values and an arrow that points to a specific number on the
 * number line.
 *
 * @author Luisa Vargas
 */

import buildANucleus from '../../buildANucleus.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Range from '../../../../dot/js/Range.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, HBox, Line, Node, NodeOptions, Path, RichText, Text } from '../../../../scenery/js/imports.js';
import ChartTransform from '../../../../bamboo/js/ChartTransform.js';
import TickMarkSet from '../../../../bamboo/js/TickMarkSet.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import TickLabelSet from '../../../../bamboo/js/TickLabelSet.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import BANColors from '../../common/BANColors.js';
import Utils from '../../../../dot/js/Utils.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import optionize from '../../../../phet-core/js/optionize.js';
import BANConstants from '../../common/BANConstants.js';
import ScientificNotationNode from '../../../../scenery-phet/js/ScientificNotationNode.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import InfinityNode from './InfinityNode.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import TProperty from '../../../../axon/js/TProperty.js';
import BANScreenView from '../../common/view/BANScreenView.js';

// types
type SelfOptions = {
  numberLineWidth: number;
  tickMarkExtent: number;
  numberLineLabelFont: PhetFont;
  halfLifeArrowLength: number;

  // scale for the halfLifeDisplayNode
  halfLifeDisplayScale?: number;

  isHalfLifeLabelFixed: boolean; // if the half-life label is fixed, place it centered above the number line, otherwise,
  // animate its position with the half-life arrow

  protonCountProperty?: TReadOnlyProperty<number>;
  neutronCountProperty?: TReadOnlyProperty<number>;
  doesNuclideExistBooleanProperty?: TReadOnlyProperty<boolean>;

  unitsLabelFont?: PhetFont;
};
export type HalfLifeNumberLineNodeOptions = SelfOptions & NodeOptions;

// constants
const TITLE_FONT = new PhetFont( 24 );
const NUMBER_LINE_START_EXPONENT = BANConstants.HALF_LIFE_NUMBER_LINE_START_EXPONENT;
const NUMBER_LINE_END_EXPONENT = BANConstants.HALF_LIFE_NUMBER_LINE_END_EXPONENT;

class HalfLifeNumberLineNode extends Node {

  private readonly numberLineLabelFont: PhetFont | undefined;
  private readonly chartTransform: ChartTransform;
  private readonly tickMarkSet: Path;
  private readonly halfLifeArrowRotationProperty: TProperty<number>;
  private arrowXPositionAnimation: null | Animation;
  private arrowRotationAnimation: null | Animation;

  // x position of half-life arrow in model coordinates
  private readonly arrowXPositionProperty: TProperty<number>;

  // x position of the halfLifeText in model coordinates
  private readonly halfLifeTextXPositionProperty: TProperty<number> | undefined;

  // the half life display node
  public readonly halfLifeDisplayNode: Node;

  public constructor( halfLifeNumberProperty: TReadOnlyProperty<number>,
                      isStableBooleanProperty: TReadOnlyProperty<boolean>,
                      providedOptions: HalfLifeNumberLineNodeOptions ) {
    super();

    const options = optionize<HalfLifeNumberLineNodeOptions, SelfOptions, NodeOptions>()( {
      halfLifeDisplayScale: 1,
      protonCountProperty: new NumberProperty( 0 ),
      neutronCountProperty: new NumberProperty( 0 ),
      doesNuclideExistBooleanProperty: new BooleanProperty( false ),
      unitsLabelFont: new PhetFont( 18 )
    }, providedOptions );

    this.numberLineLabelFont = options.numberLineLabelFont;

    const createExponentialLabel = ( value: number ): Node => {
      const numberValue = value === 0 ? 1 : `10<sup>${value}</sup>`;
      return new RichText( numberValue, {
        font: this.numberLineLabelFont,
        supScale: 0.6,
        supYOffset: -1
      } );
    };

    // create and add numberLineNode
    const numberLineNode = new Node();

    this.chartTransform = new ChartTransform( {
      viewWidth: options.numberLineWidth,
      modelXRange: new Range( NUMBER_LINE_START_EXPONENT, NUMBER_LINE_END_EXPONENT )
    } );

    const tickXSpacing = 3;
    this.tickMarkSet = new TickMarkSet( this.chartTransform, Orientation.HORIZONTAL, tickXSpacing, {
      stroke: Color.BLACK,
      extent: options.tickMarkExtent,
      lineWidth: 2
    } );
    this.tickMarkSet.centerY = 0;
    numberLineNode.addChild( this.tickMarkSet );
    const tickLabelSet = new TickLabelSet( this.chartTransform, Orientation.HORIZONTAL, tickXSpacing, {
      extent: 0,
      createLabel: ( value: number ) => createExponentialLabel( value )
    } );
    tickLabelSet.top = this.tickMarkSet.bottom;
    numberLineNode.addChild( tickLabelSet );
    const numberLine = new Line( {
      x1: this.chartTransform.modelToViewX( NUMBER_LINE_START_EXPONENT ), y1: this.tickMarkSet.centerY,
      x2: this.chartTransform.modelToViewX( NUMBER_LINE_END_EXPONENT ), y2: this.tickMarkSet.centerY,
      stroke: Color.BLACK
    } );
    numberLineNode.addChild( numberLine );
    this.addChild( numberLineNode );

    // create and add the halfLifeArrow
    const arrowNode = new ArrowNode( 0, 0, 0, options.halfLifeArrowLength, {
      fill: BANColors.halfLifeColorProperty,
      stroke: null,
      tailWidth: 4,
      headWidth: 12
    } );
    const halfLifeArrow = new Node();
    this.addChild( halfLifeArrow );
    halfLifeArrow.addChild( arrowNode );

    this.arrowXPositionProperty = new NumberProperty( 0 );
    this.arrowXPositionProperty.link( xPosition => {
      halfLifeArrow.translation = new Vector2( this.chartTransform.modelToViewX( xPosition ),
        this.tickMarkSet.centerY - options.halfLifeArrowLength );
    } );
    this.arrowXPositionAnimation = null;
    this.arrowRotationAnimation = null;

    // create and add the half life display, which is a parent node used to contain the number readout, the infinity
    // symbol, and the 'Unknown' text.
    this.halfLifeDisplayNode = new Node( {
      scale: options.halfLifeDisplayScale,
      excludeInvisibleChildrenFromBounds: true
    } );
    this.addChild( this.halfLifeDisplayNode );

    // create and add the text for "Half-life:"
    const halfLifeColonText = new RichText( BuildANucleusStrings.halfLifeColon, {
      font: TITLE_FONT,
      maxWidth: 115
    } );
    this.halfLifeDisplayNode.addChild( halfLifeColonText );
    this.halfLifeDisplayNode.left = this.left + BANConstants.INFO_BUTTON_INDENT_DISTANCE + BANConstants.INFO_BUTTON_MAX_HEIGHT + 10;
    this.halfLifeDisplayNode.bottom = halfLifeArrow.top - 8;

    // create and add the "Unknown" text
    const halfLifeUnknownText = new RichText( BuildANucleusStrings.unknown, {
      font: TITLE_FONT,
      maxWidth: 115
    } );
    halfLifeUnknownText.left = halfLifeColonText.right + 8;
    halfLifeUnknownText.bottom = halfLifeColonText.bottom;
    this.halfLifeDisplayNode.addChild( halfLifeUnknownText );

    // create and add the infinity node, which represents a math infinity symbol
    const infinityNode = new InfinityNode();
    infinityNode.left = halfLifeUnknownText.left;
    infinityNode.bottom = halfLifeUnknownText.bottom - 5; // offset to match the apparent bottom position of the text
    this.halfLifeDisplayNode.addChild( infinityNode );

    // the half life number in scientific notation with an 's' for seconds at the end
    const halfLifeScientificNotation = new ScientificNotationNode( halfLifeNumberProperty, {
      font: TITLE_FONT
    } );
    const halfLifeNumberText = new HBox( {
      children: [
        halfLifeScientificNotation,
        new Text( BuildANucleusStrings.s, { font: TITLE_FONT, maxWidth: 30 } )
      ],
      align: 'bottom',
      spacing: 10
    } );
    halfLifeNumberText.left = halfLifeUnknownText.left;
    this.halfLifeDisplayNode.addChild( halfLifeNumberText );

    // if the half-life text is a label to the arrow
    if ( !options.isHalfLifeLabelFixed ) {

      const distanceBetweenElementNameAndHalfLifeText = 4;
      const distanceBetweenHalfLifeTextAndArrow = 14;

      // Create the textual readout for the element name.
      const elementName = new Text( '', {
        font: this.numberLineLabelFont,
        fill: Color.RED,
        maxWidth: BANConstants.ELEMENT_NAME_MAX_WIDTH
      } );
      elementName.center = this.halfLifeDisplayNode.center.minusXY( 0, this.halfLifeDisplayNode.height + 10 );
      this.addChild( elementName );

      // Hook up update listeners.
      Multilink.multilink( [ options.protonCountProperty, options.neutronCountProperty, options.doesNuclideExistBooleanProperty ],
        ( protonCount, neutronCount, doesNuclideExist ) =>
          BANScreenView.updateElementName( elementName, protonCount, neutronCount, doesNuclideExist,
            this.halfLifeDisplayNode.centerX,
            this.halfLifeDisplayNode.centerY - this.halfLifeDisplayNode.height - distanceBetweenElementNameAndHalfLifeText )
      );

      this.halfLifeTextXPositionProperty = new NumberProperty( 0 );
      this.halfLifeTextXPositionProperty.link( xPosition => {

        this.halfLifeDisplayNode.translation =
          new Vector2( this.chartTransform.modelToViewX( xPosition ) - this.halfLifeDisplayNode.width / 2,
            halfLifeArrow.top - distanceBetweenHalfLifeTextAndArrow );

        elementName.translation =
          new Vector2( this.chartTransform.modelToViewX( xPosition ) - elementName.width / 2,
            halfLifeArrow.top - this.halfLifeDisplayNode.height - distanceBetweenHalfLifeTextAndArrow
            - distanceBetweenElementNameAndHalfLifeText );

        // left-align the text if it goes over the left edge of the numberLineNode
        if ( this.halfLifeDisplayNode.left < numberLineNode.left ) {
          this.halfLifeDisplayNode.left = numberLineNode.left;
        }
        if ( elementName.left < numberLineNode.left ) {
          elementName.left = numberLineNode.left;
        }

        // right-align the text if it goes over the right edge of the numberLineNode
        if ( this.halfLifeDisplayNode.right > numberLineNode.right ) {
          this.halfLifeDisplayNode.right = numberLineNode.right;
        }
        if ( elementName.right > numberLineNode.right ) {
          elementName.right = numberLineNode.right;
        }
      } );
    }

    this.halfLifeArrowRotationProperty = new NumberProperty( 0 );
    Multilink.multilink( [ this.halfLifeArrowRotationProperty ], rotation => {
      halfLifeArrow.rotation = rotation;
    } );

    // function to show or hide the halfLifeArrow
    const showHalfLifeArrow = ( show: boolean ) => {
      halfLifeArrow.visible = show;
    };

    // link the halfLifeNumberProperty to the half-life arrow indicator and to the half-life number readout
    halfLifeNumberProperty.link( halfLifeNumber => {

      // the nuclide is stable
      if ( isStableBooleanProperty.value ) {
        showHalfLifeArrow( true );

        infinityNode.visible = true;
        halfLifeUnknownText.visible = false;
        halfLifeNumberText.visible = false;

        // peg the indicator to the right when stable
        this.moveHalfLifePointerSet( halfLifeNumber, options.isHalfLifeLabelFixed );
      }

      // the nuclide is unstable or does not exist
      else {
        infinityNode.visible = false;

        // the nuclide does not exist
        if ( halfLifeNumber === 0 ) {
          showHalfLifeArrow( false );

          halfLifeUnknownText.visible = false;
          halfLifeNumberText.visible = false;

          this.moveHalfLifePointerSet( halfLifeNumber, options.isHalfLifeLabelFixed );
        }

        // the nuclide is unstable but the half-life data is unknown
        else if ( halfLifeNumber === -1 ) {
          showHalfLifeArrow( false );

          halfLifeUnknownText.visible = true;
          halfLifeNumberText.visible = false;

          this.moveHalfLifePointerSet( 0, options.isHalfLifeLabelFixed );
        }

        // the nuclide is unstable and the half-life data is known
        else {
          showHalfLifeArrow( true );

          halfLifeUnknownText.visible = false;
          halfLifeNumberText.visible = true;
          halfLifeNumberText.bottom = halfLifeColonText.bottom;

          // peg the indicator to the right when the half-life goes off-scale but still show the accurate half-life readout
          if ( halfLifeNumber > Math.pow( 10, BANConstants.HALF_LIFE_NUMBER_LINE_END_EXPONENT ) ) {
            this.moveHalfLifePointerSet( Math.pow( 10, BANConstants.HALF_LIFE_NUMBER_LINE_END_EXPONENT ),
              options.isHalfLifeLabelFixed );
          }
          else {
            this.moveHalfLifePointerSet( halfLifeNumber, options.isHalfLifeLabelFixed );
          }
        }
      }
    } );

    // create and add the units label on the number line
    const numberLineUnitsLabel = new Text( BuildANucleusStrings.seconds, {
      font: options.unitsLabelFont,
      maxWidth: 150
    } );
    numberLineUnitsLabel.centerY = this.bottom + numberLineUnitsLabel.height / 2;
    numberLineUnitsLabel.centerX = this.centerX;
    this.addChild( numberLineUnitsLabel );
  }

  /**
   * Animate the half-life arrow to the new half-life position along the number line. If the half-life text is a label
   * to the half-life arrow, animate it to its new half-life position too.
   */
  private moveHalfLifePointerSet( halfLife: number, isHalfLifeLabelFixed: boolean ): void {
    const newXPosition = HalfLifeNumberLineNode.logScaleNumberToLinearScaleNumber( halfLife );

    const arrowXPositionAnimationDuration = 0.7; // in seconds

    // animate the half-life arrow's x position
    if ( this.arrowXPositionAnimation ) {
      this.arrowXPositionAnimation.stop();
      this.arrowXPositionAnimation = null;
    }

    if ( isHalfLifeLabelFixed ) {
      this.arrowXPositionAnimation = new Animation( {
        to: newXPosition,
        property: this.arrowXPositionProperty,
        duration: arrowXPositionAnimationDuration,
        easing: Easing.QUADRATIC_IN_OUT
      } );
    }
    else {
      this.arrowXPositionAnimation = new Animation( {
        targets: [ {
          to: newXPosition,
          property: this.arrowXPositionProperty
        }, {
          to: newXPosition,
          property: this.halfLifeTextXPositionProperty
        } ],
        duration: arrowXPositionAnimationDuration,
        easing: Easing.QUADRATIC_IN_OUT
      } );
    }

    const arrowRotationAnimationDuration = 0.1; // in seconds

    // if the halfLife number is stable, then animate the arrow's rotation
    if ( this.arrowRotationAnimation ) {
      this.arrowRotationAnimation.stop();
      this.arrowRotationAnimation = null;
    }

    if ( halfLife === Math.pow( 10, BANConstants.HALF_LIFE_NUMBER_LINE_END_EXPONENT ) ) {

      // rotate arrow horizontally, pointing right
      this.arrowRotationAnimation = new Animation( {
        to: -Math.PI / 2,
        property: this.halfLifeArrowRotationProperty,
        duration: arrowRotationAnimationDuration,
        easing: Easing.QUADRATIC_IN_OUT
      } );

      this.arrowXPositionAnimation.then( this.arrowRotationAnimation );
      this.arrowXPositionAnimation.start();

      this.arrowRotationAnimation.finishEmitter.addListener( () => {
        this.arrowRotationAnimation = null;
        this.arrowXPositionAnimation = null;
      } );
    }
    else {

      // rotate arrow back vertically, pointing down
      this.arrowRotationAnimation = new Animation( {
        to: 0,
        property: this.halfLifeArrowRotationProperty,
        duration: arrowRotationAnimationDuration,
        easing: Easing.QUADRATIC_IN_OUT
      } );

      this.arrowRotationAnimation.then( this.arrowXPositionAnimation );
      this.arrowRotationAnimation.start();

      this.arrowXPositionAnimation.finishEmitter.addListener( () => {
        this.arrowXPositionAnimation = null;
        this.arrowRotationAnimation = null;
      } );
    }
  }

  /**
   * Add an arrow with a label to the number line.
   */
  public addArrowAndLabel( label: string, halfLife: number ): void {
    const xPosition = HalfLifeNumberLineNode.logScaleNumberToLinearScaleNumber( halfLife );
    const arrow = new ArrowNode( this.chartTransform.modelToViewX( xPosition ), -17.5,
      this.chartTransform.modelToViewX( xPosition ), this.tickMarkSet.centerY, {
        fill: BANColors.legendArrowColorProperty,
        stroke: null,
        tailWidth: 1.5,
        headWidth: 5
      } );
    this.addChild( arrow );
    const numberText = new RichText( label, { font: this.numberLineLabelFont, maxWidth: 25 } );
    numberText.bottom = arrow.top;
    numberText.centerX = arrow.centerX;
    this.addChild( numberText );
  }

  /**
   * Convert the half-life number (in seconds) to a linear scale number to plot it on the number line.
   */
  private static logScaleNumberToLinearScaleNumber( halfLifeNumber: number ): number {
    if ( halfLifeNumber === 0 ) {
      return 0;
    }
    return Utils.log10( halfLifeNumber );
  }
}

buildANucleus.register( 'HalfLifeNumberLineNode', HalfLifeNumberLineNode );
export default HalfLifeNumberLineNode;
