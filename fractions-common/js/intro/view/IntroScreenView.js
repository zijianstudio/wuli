// Copyright 2018-2022, University of Colorado Boulder

/**
 * ScreenView for intro screens.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import MixedFractionNode from '../../../../scenery-phet/js/MixedFractionNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import PropertyFractionNode from '../../../../scenery-phet/js/PropertyFractionNode.js';
import { AlignBox, HBox, Text, VBox } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Panel from '../../../../sun/js/Panel.js';
import FractionsCommonConstants from '../../common/FractionsCommonConstants.js';
import FractionsCommonGlobals from '../../common/FractionsCommonGlobals.js';
import FractionsCommonColors from '../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../fractionsCommon.js';
import FractionsCommonStrings from '../../FractionsCommonStrings.js';
import Container from '../model/Container.js';
import CakeContainerNode from './cake/CakeContainerNode.js';
import ContainerSetScreenView from './ContainerSetScreenView.js';
import MaxNode from './MaxNode.js';
import NumberLineNode from './numberline/NumberLineNode.js';

const equationString = FractionsCommonStrings.equation;
const mixedNumberString = FractionsCommonStrings.mixedNumber;

// constants
const MARGIN = FractionsCommonConstants.PANEL_MARGIN;

class IntroScreenView extends ContainerSetScreenView {
  /**
   * @param {IntroModel} model
   */
  constructor( model ) {
    super( model );

    // "Max" panel
    const maxPanel = new Panel( new AlignBox( new MaxNode( model.containerCountProperty ), {
      group: this.topAlignGroup
    } ), {
      fill: FractionsCommonColors.introPanelBackgroundProperty,
      xMargin: 16,
      yMargin: 10,
      right: this.layoutBounds.right - MARGIN,
      top: this.layoutBounds.top + MARGIN
    } );
    this.insertChild( 0, maxPanel );

    if ( model.allowMixedNumbers ) {

      // Use a "weaker" / grayer color when showing 0/x
      const partialFractionColorProperty = new DerivedProperty( [
        model.numeratorProperty,
        model.denominatorProperty,
        FractionsCommonColors.mixedFractionStrongProperty,
        FractionsCommonColors.mixedFractionWeakProperty
      ], ( numerator, denominator, strongColor, weakColor ) => {
        return numerator % denominator === 0 ? weakColor : strongColor;
      } );

      // Separate options/fraction created since we need to grab the "maximum" bounds to do proper layout. Can't use
      // "starting" bounds, since it's at 0 and would be smaller.
      const fractionNodeOptions = {
        type: PropertyFractionNode.DisplayType.MIXED,
        simplify: true,

        maxWhole: model.containerCountProperty.range.max,
        maxNumerator: model.denominatorProperty.range.max - 1,
        maxDenominator: model.denominatorProperty.range.max,

        wholeFill: FractionsCommonColors.mixedFractionStrongProperty,
        numeratorFill: partialFractionColorProperty,
        denominatorFill: partialFractionColorProperty,
        separatorFill: partialFractionColorProperty,

        // Node options
        scale: 2
      };
      const maxMixedFractionNodeBounds = new MixedFractionNode( merge( {}, fractionNodeOptions, {
        whole: 0,
        numerator: 0,
        denominator: 0,
        simplify: false
      } ) ).bounds;

      // @private {Node}
      this.mixedFractionNode = new AlignBox( new PropertyFractionNode( model.numeratorProperty, model.denominatorProperty, fractionNodeOptions ), {
        alignBounds: maxMixedFractionNodeBounds,
        xAlign: 'right'
      } );
      model.showMixedNumbersProperty.linkAttribute( this.mixedFractionNode, 'visible' );

      const label = new Text( mixedNumberString, {
        font: new PhetFont( 26 ),
        maxWidth: 270
      } );
      const showMixedCheckbox = new Checkbox( model.showMixedNumbersProperty, label, {
        boxWidth: 30,
        right: this.layoutBounds.right - MARGIN,
        bottom: this.resetAllButton.top - 40
      } );
      showMixedCheckbox.touchArea = showMixedCheckbox.localBounds.dilated( 18 );

      // Options for the "Equation" accordion box (bottom-left)
      const equationScale = 1.5;
      const equationLeftOptions = {
        type: PropertyFractionNode.DisplayType.MIXED,
        simplify: true,
        showZeroImproperFraction: false,

        maxWhole: model.containerCountProperty.range.max,
        maxNumerator: model.denominatorProperty.range.max - 1,
        maxDenominator: model.denominatorProperty.range.max,

        wholeFill: FractionsCommonColors.mixedFractionStrongProperty,
        numeratorFill: FractionsCommonColors.mixedFractionStrongProperty,
        denominatorFill: FractionsCommonColors.mixedFractionStrongProperty,
        separatorFill: FractionsCommonColors.mixedFractionStrongProperty,

        scale: equationScale
      };
      const equationRightOptions = {
        type: PropertyFractionNode.DisplayType.IMPROPER,

        maxNumerator: model.denominatorProperty.range.max * model.containerCountProperty.range.max,
        maxDenominator: model.denominatorProperty.range.max,

        scale: equationScale
      };

      const equationBoxContent = new HBox( {
        spacing: 10,
        children: [
          new AlignBox( new PropertyFractionNode( model.numeratorProperty, model.denominatorProperty, equationLeftOptions ), {
            alignBounds: new MixedFractionNode( merge( {}, equationLeftOptions, {
              whole: 0,
              numerator: 0,
              denominator: 0,
              simplify: false
            } ) ).bounds,
            xAlign: 'right'
          } ),
          new Text( MathSymbols.EQUAL_TO, { font: new PhetFont( 30 * equationScale ) } ),
          new PropertyFractionNode( model.numeratorProperty, model.denominatorProperty, equationRightOptions )
        ]
      } );

      const equationBox = new AccordionBox( equationBoxContent, {
        titleNode: new Text( equationString, {
          font: new PhetFont( 20 ),
          maxWidth: 200
        } ),
        showTitleWhenExpanded: false,
        bottom: this.layoutBounds.bottom - MARGIN,
        left: this.layoutBounds.left + 50,
        fill: 'white',
        expandedProperty: model.mixedNumbersBoxExpandedProperty,
        expandCollapseButtonOptions: {
          touchAreaXDilation: 15,
          touchAreaYDilation: 15
        }
      } );
      model.showMixedNumbersProperty.linkAttribute( equationBox, 'visible' );

      this.children = [
        this.mixedFractionNode,
        showMixedCheckbox,
        equationBox,
        ...this.children
      ];
    }

    // layout
    const centerY = this.layoutBounds.centerY - 30;
    this.adjustableFractionNode.right = this.layoutBounds.right - MARGIN;
    this.adjustableFractionNode.centerY = centerY;
    if ( this.mixedFractionNode ) {
      this.mixedFractionNode.left = this.layoutBounds.left + MARGIN;
      this.mixedFractionNode.centerY = centerY;
    }

    this.representationPanel.top = this.layoutBounds.top + MARGIN;
    const left = this.model.allowMixedNumbers ? this.mixedFractionNode.right : this.layoutBounds.left;
    const right = this.adjustableFractionNode.left;
    const centerX = ( left + right ) / 2;
    this.representationPanel.centerX = centerX;
    this.viewContainer.x = centerX;
    this.viewContainer.y = centerY;
    this.bucketContainer.centerX = centerX;
    this.bucketContainer.bottom = this.layoutBounds.bottom - MARGIN;
  }

  /**
   * Returns a number line node with the given (unchanging) attributes.
   * @private
   *
   * @param {number} numerator
   * @param {number} denominator
   * @param {number} wholes
   * @returns {Node}
   */
  static createStaticNumberLine( numerator, denominator, wholes ) {
    return new NumberLineNode(
      new NumberProperty( numerator, { range: new Range( 0, numerator ) } ),
      new NumberProperty( denominator, { range: new Range( 1, denominator ) } ),
      new NumberProperty( wholes, { range: new Range( 0, wholes ) } )
    );
  }

  /**
   * Creates the icon for the unmixed intro screens.
   * @public
   *
   * @returns {Node}
   */
  static createUnmixedScreenIcon() {
    const container = new Container();

    container.addCells( 4 );
    _.times( 3, () => {
      container.getNextEmptyCell().setFilled( true );
    } );

    const cakeNode = new CakeContainerNode( container );

    const numberLineNode = IntroScreenView.createStaticNumberLine( 3, 4, 1 );

    return FractionsCommonGlobals.wrapIcon( new HBox( {
      spacing: 30,
      children: [
        cakeNode,
        numberLineNode
      ],
      scale: 1.3
    } ), FractionsCommonColors.introScreenBackgroundProperty );
  }

  /**
   * Creates the thumbnail for the unmixed intro screens.
   * @public
   *
   * @returns {Node}
   */
  static createUnmixedScreenThumbnail() {
    const container = new Container();

    container.addCells( 4 );
    _.times( 3, () => {
      container.getNextEmptyCell().setFilled( true );
    } );

    const cakeNode = new CakeContainerNode( container, {
      scale: 2.5
    } );

    return FractionsCommonGlobals.wrapIcon( cakeNode, FractionsCommonColors.introScreenBackgroundProperty );
  }

  /**
   * Creates the icon for the mixed intro screens.
   * @public
   *
   * @returns {Node}
   */
  static createMixedScreenIcon() {
    const fractionNode = new MixedFractionNode( {
      whole: 2,
      numerator: 1,
      denominator: 2,
      scale: 2.4
    } );

    const numberLineNode = IntroScreenView.createStaticNumberLine( 5, 2, 3 );

    return FractionsCommonGlobals.wrapIcon( new VBox( {
      spacing: 15,
      children: [
        fractionNode,
        numberLineNode
      ],
      scale: 1
    } ), FractionsCommonColors.introScreenBackgroundProperty );
  }

  /**
   * Creates the thumbnail for the mixed intro screens.
   * @public
   *
   * @returns {Node}
   */
  static createMixedScreenThumbnail() {
    const numberLineNode = IntroScreenView.createStaticNumberLine( 3, 2, 2 );
    numberLineNode.scale( 1.5 );

    return FractionsCommonGlobals.wrapIcon( numberLineNode, FractionsCommonColors.introScreenBackgroundProperty );
  }

}

fractionsCommon.register( 'IntroScreenView', IntroScreenView );
export default IntroScreenView;