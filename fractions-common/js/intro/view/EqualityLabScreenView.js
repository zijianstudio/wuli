// Copyright 2018-2023, University of Colorado Boulder

/**
 * ScreenView for the "Equality Lab" screen of Fractions: Equality
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import PropertyFractionNode from '../../../../scenery-phet/js/PropertyFractionNode.js';
import { AlignBox, HBox, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import FractionsCommonConstants from '../../common/FractionsCommonConstants.js';
import FractionsCommonGlobals from '../../common/FractionsCommonGlobals.js';
import FractionsCommonColors from '../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../fractionsCommon.js';
import Container from '../model/Container.js';
import IntroRepresentation from '../model/IntroRepresentation.js';
import BeakerContainerNode from './beaker/BeakerContainerNode.js';
import BeakerSceneNode from './beaker/BeakerSceneNode.js';
import CellSceneNode from './CellSceneNode.js';
import CircularContainerNode from './circular/CircularContainerNode.js';
import CircularSceneNode from './circular/CircularSceneNode.js';
import ContainerSetScreenView from './ContainerSetScreenView.js';
import IntroRadioButtonGroup from './IntroRadioButtonGroup.js';
import NumberLineNode from './numberline/NumberLineNode.js';
import NumberLineSceneNode from './numberline/NumberLineSceneNode.js';
import NumberLineOrientation from './NumberLineOrientation.js';
import RectangularContainerNode from './rectangular/RectangularContainerNode.js';
import RectangularSceneNode from './rectangular/RectangularSceneNode.js';
import RectangularOrientation from './RectangularOrientation.js';
import RoundNumberSpinner from './RoundNumberSpinner.js';

// constants
const MARGIN = FractionsCommonConstants.PANEL_MARGIN;

class EqualityLabScreenView extends ContainerSetScreenView {
  /**
   * @param {EqualityLabModel} model
   */
  constructor( model ) {
    super( model, {
      spinnersOnRight: false
    } );

    const equalsText = new Text( MathSymbols.EQUAL_TO, { font: new PhetFont( 90 ) } );

    const multipliedNumeratorProperty = new DerivedProperty( [ model.numeratorProperty, model.multiplierProperty ], ( numerator, multiplier ) => {
      return numerator * multiplier;
    } );
    const multipliedDenominatorProperty = new DerivedProperty( [ model.denominatorProperty, model.multiplierProperty ], ( denominator, multiplier ) => {
      return denominator * multiplier;
    } );

    const multipliedFractionNode = new PropertyFractionNode( multipliedNumeratorProperty, multipliedDenominatorProperty, {
      scale: 3,

      maxNumerator: model.numeratorProperty.range.max * model.multiplierProperty.range.max,
      maxDenominator: model.denominatorProperty.range.max * model.multiplierProperty.range.max
    } );

    const multiplierSpinner = new RoundNumberSpinner(
      model.multiplierProperty,
      new DerivedProperty( [ model.multiplierProperty ], multiplier => multiplier < model.multiplierProperty.range.max ),
      new DerivedProperty( [ model.multiplierProperty ], multiplier => multiplier > model.multiplierProperty.range.min ), {
        baseColor: FractionsCommonColors.greenRoundArrowButtonProperty,
        rotation: Math.PI / 2
      } );

    const circularIcon = CircularSceneNode.getIcon( true );
    const horizontalIcon = RectangularSceneNode.getIcon( RectangularOrientation.HORIZONTAL, true );
    const verticalIcon = RectangularSceneNode.getIcon( RectangularOrientation.VERTICAL, true );
    const beakerIcon = BeakerSceneNode.getIcon( true );
    const variableIcon = new Node( {
      children: [
        circularIcon,
        horizontalIcon,
        verticalIcon,
        beakerIcon
      ]
    } );
    // No unlink needed, the ScreenView is permanent.
    model.representationProperty.link( representation => {
      circularIcon.visible = representation === IntroRepresentation.CIRCLE;
      horizontalIcon.visible = representation === IntroRepresentation.HORIZONTAL_BAR;
      verticalIcon.visible = representation === IntroRepresentation.VERTICAL_BAR;
      beakerIcon.visible = representation === IntroRepresentation.BEAKER;
    } );

    const showNumberLineNode = new IntroRadioButtonGroup( model.showNumberLineProperty, [
      {
        value: false,
        createNode: () => variableIcon
      },
      {
        value: true,
        createNode: () => NumberLineSceneNode.getIcon()
      }
    ] );

    const showNumberLinePanel = new Panel( new AlignBox( showNumberLineNode, {
      group: this.topAlignGroup
    } ), {
      fill: FractionsCommonColors.introPanelBackgroundProperty,
      xMargin: FractionsCommonConstants.PANEL_MARGIN,
      yMargin: FractionsCommonConstants.PANEL_MARGIN
    } );

    const multipliedViewContainer = new Node( {
      pickable: false
    } );

    this.children = [
      equalsText,
      multipliedFractionNode,
      multiplierSpinner,
      showNumberLinePanel,
      multipliedViewContainer,
      ...this.children
    ];

    // layout

    // We need to rescale some parts (which we can't just re-parent and put under a single node)
    const bottomControlScale = 0.85;
    this.adjustableFractionNode.scale( bottomControlScale );
    equalsText.scale( bottomControlScale );
    multipliedFractionNode.scale( bottomControlScale );
    multiplierSpinner.scale( bottomControlScale );

    // Center things with the equals sign at the center of the screen (with everything positioned based on it)
    equalsText.centerX = this.layoutBounds.centerX;
    this.adjustableFractionNode.right = equalsText.left - MARGIN;
    this.bucketContainer.right = this.adjustableFractionNode.left - MARGIN;
    multipliedFractionNode.left = equalsText.right + MARGIN;
    multiplierSpinner.left = multipliedFractionNode.right + MARGIN;

    // Align the left/right edges for the radio button groups and other controls.
    this.representationPanel.right = this.adjustableFractionNode.right;
    this.representationPanel.top = this.layoutBounds.top + MARGIN;
    showNumberLinePanel.left = multipliedFractionNode.left;
    showNumberLinePanel.top = this.layoutBounds.top + MARGIN;

    const centerY = this.layoutBounds.centerY - 40;
    this.viewContainer.y = centerY;
    multipliedViewContainer.y = centerY;

    // The bucket should always be at the bottom
    this.bucketContainer.bottom = this.layoutBounds.bottom - MARGIN;

    // Center the remaining controls adjacent to the bottom
    const bottomAlignY = this.layoutBounds.bottom - MARGIN - this.adjustableFractionNode.height / 2;
    this.adjustableFractionNode.centerY = bottomAlignY;
    equalsText.centerY = bottomAlignY;
    multipliedFractionNode.centerY = bottomAlignY;
    multiplierSpinner.centerY = bottomAlignY;

    // No unlink needed, the ScreenView is permanent.
    model.representationProperty.link( () => {
      this.viewContainer.right = this.representationPanel.right;
    } );

    let containerNodes = [];
    let lastRepresentation = null;

    function spacedBox( numPerRow, nodes, representation ) {
      return new VBox( {
        center: Vector2.ZERO,
        spacing: CellSceneNode.getVerticalSpacing( representation ),
        children: _.chunk( nodes, numPerRow ).map( rowNodes => new HBox( {
          spacing: CellSceneNode.getHorizontalSpacing( representation ),
          children: rowNodes
        } ) )
      } );
    }

    const semitransparentColorOverride = new DerivedProperty( [
      FractionsCommonColors.equalityLabColorProperty
    ], color => color.withAlpha( 0.8 ) );

    Multilink.multilink( [ model.representationProperty, model.showNumberLineProperty ], ( representation, showNumberLine ) => {
      representation = showNumberLine ? IntroRepresentation.NUMBER_LINE : representation;
      if ( representation !== lastRepresentation ) {
        containerNodes.forEach( containerNode => containerNode.dispose() );
        containerNodes = [];
        multipliedViewContainer.children.forEach( child => child.dispose() );
        lastRepresentation = representation;

        const containers = model.multipliedContainers;

        const colorOverride = FractionsCommonColors.equalityLabColorProperty;
        let containerOffset = 0;

        if ( representation === IntroRepresentation.CIRCLE ) {
          containerNodes = containers.map( container => new CircularContainerNode( container, {
            colorOverride: colorOverride
          } ) );
          multipliedViewContainer.addChild( spacedBox( 2, containerNodes, representation ) );
        }
        else if ( representation === IntroRepresentation.HORIZONTAL_BAR ) {
          containerNodes = containers.map( container => new RectangularContainerNode( container, {
            rectangularOrientation: RectangularOrientation.HORIZONTAL,
            colorOverride: colorOverride
          } ) );
          multipliedViewContainer.addChild( spacedBox( 1, containerNodes, representation ) );
        }
        else if ( representation === IntroRepresentation.VERTICAL_BAR ) {
          containerNodes = containers.map( container => new RectangularContainerNode( container, {
            rectangularOrientation: RectangularOrientation.VERTICAL,
            colorOverride: colorOverride
          } ) );
          multipliedViewContainer.addChild( spacedBox( 4, containerNodes, representation ) );
        }
        else if ( representation === IntroRepresentation.BEAKER ) {
          containerNodes = containers.map( container => new BeakerContainerNode( container, {
            colorOverride: FractionsCommonColors.equalityLabWaterProperty
          } ) );
          multipliedViewContainer.addChild( spacedBox( 4, containerNodes, representation ) );
        }
        else if ( representation === IntroRepresentation.NUMBER_LINE ) {
          const multipliedNumberLine = new NumberLineNode( model.numeratorProperty, model.denominatorProperty, model.containerCountProperty, {
            multiplierProperty: model.multiplierProperty,
            orientation: NumberLineOrientation.VERTICAL,
            unitSize: 60,
            arrowFill: colorOverride,
            markerFill: semitransparentColorOverride,
            showArrow: true,
            markerLineWidth: 2,
            markerRadius: 8,
            arrowOffset: 15
          } );
          containerNodes = [ multipliedNumberLine ];
          multipliedViewContainer.addChild( multipliedNumberLine );

          const parentLayoutPoint = multipliedNumberLine.localToParentPoint( multipliedNumberLine.localLayoutPoint );
          containerOffset = multipliedNumberLine.left - parentLayoutPoint.x;
        }

        if ( multipliedViewContainer.bounds.isValid() ) {
          multipliedViewContainer.left = multipliedFractionNode.left + containerOffset;
        }
      }
    } );
  }

  /**
   * Creates the icon for the screen.
   * @public
   *
   * @returns {Node}
   */
  static createScreenIcon() {
    const leftContainer = new Container();
    const rightContainer = new Container();

    leftContainer.addCells( 3 );
    rightContainer.addCells( 9 );

    _.times( 2, () => {
      leftContainer.getNextEmptyCell().setFilled( true );
    } );
    _.times( 6, () => {
      rightContainer.getNextEmptyCell().setFilled( true );
    } );

    const equalsText = new Text( MathSymbols.EQUAL_TO, { font: new PhetFont( 80 ) } );

    const leftContainerNode = new RectangularContainerNode( leftContainer );
    const rightContainerNode = new RectangularContainerNode( rightContainer, {
      colorOverride: FractionsCommonColors.equalityLabColorProperty
    } );

    return FractionsCommonGlobals.wrapIcon( new HBox( {
      spacing: 13,
      children: [
        leftContainerNode,
        equalsText,
        rightContainerNode
      ],
      scale: 1.5
    } ), FractionsCommonColors.introScreenBackgroundProperty );
  }

}

fractionsCommon.register( 'EqualityLabScreenView', EqualityLabScreenView );
export default EqualityLabScreenView;