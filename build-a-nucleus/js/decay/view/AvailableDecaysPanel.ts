// Copyright 2022, University of Colorado Boulder

/**
 * A node that represents the available decays a given nuclide can undergo.
 *
 * @author Luisa Vargas
 */

import Panel from '../../../../sun/js/Panel.js';
import buildANucleus from '../../buildANucleus.js';
import { HBox, HSeparator, Line, Node, Rectangle, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ParticleNode from '../../../../shred/js/view/ParticleNode.js';
import ParticleType from '../../common/view/ParticleType.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import DecayType from '../../common/view/DecayType.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PlusNode from '../../../../scenery-phet/js/PlusNode.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import BANColors from '../../common/BANColors.js';
import BANConstants from '../../common/BANConstants.js';
import DecayModel from '../model/DecayModel.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import InfoButton from '../../../../scenery-phet/js/buttons/InfoButton.js';
import Dialog from '../../../../sun/js/Dialog.js';

// constants
const LABEL_FONT = new PhetFont( BANConstants.BUTTONS_AND_LEGEND_FONT_SIZE );
const TITLE_FONT = new PhetFont( 24 );
const SPACING = 10;
const NUCLEON_PARTICLE_RADIUS = BANConstants.PARTICLE_RADIUS * 0.7;
const ELECTRON_PARTICLE_RADIUS = NUCLEON_PARTICLE_RADIUS * 0.8;
const ALPHA_PARTICLE_SPACING = -5;
const BUTTON_TEXT_BOTTOM_MARGIN = 8;
const BUTTON_HEIGHT = 35;
const BUTTON_CONTENT_WIDTH = 145;

type decayTypeButtonIndexType = Record<string, number>;
type SelfOptions = {

  // decay functions
  emitNucleon: ( particleType: ParticleType, fromDecay?: string ) => void;
  emitAlphaParticle: () => void;
  betaDecay: ( betaDecayType: DecayType ) => void;

  // function to store current nucleon counts
  storeNucleonCounts: () => void;

  // function to show and reposition the undo decay button
  showAndRepositionUndoDecayButton: ( decayType: string ) => void;
};
export type AvailableDecaysPanelOptions = SelfOptions;

class AvailableDecaysPanel extends Panel {

  // decay button and icon pair
  public readonly arrangedDecayButtonsAndIcons: Node;

  // map of decayType => {arrayIndex}
  public decayTypeButtonIndexMap: decayTypeButtonIndexType;

  public constructor( model: DecayModel, options: AvailableDecaysPanelOptions ) {

    // create and add the title
    const titleNode = new Text( BuildANucleusStrings.availableDecays, { font: TITLE_FONT, maxWidth: 285 } );

    // create and add the decays info dialog and button
    const decaysInfoDialog = new Dialog(
      new RichText( BuildANucleusStrings.availableDecaysInfoPanelText, {
        font: BANConstants.REGULAR_FONT,
        lineWrap: 400,
        maxWidth: 400
      } ),
      {
        topMargin: 40,
        bottomMargin: 30
      }
    );
    const decaysInfoButton = new InfoButton( {
      listener: () => decaysInfoDialog.show(),
      maxHeight: BANConstants.INFO_BUTTON_MAX_HEIGHT,
      baseColor: 'rgb( 400, 400, 400 )'
    } );

    // function to return the correct enabled derived property for each type of decay
    const returnEnabledDecayButtonProperty = ( decayType: DecayType ): TReadOnlyProperty<boolean> => {
      switch( decayType ) {
        case DecayType.NEUTRON_EMISSION:
          return model.neutronEmissionEnabledProperty;
        case DecayType.PROTON_EMISSION:
          return model.protonEmissionEnabledProperty;
        case DecayType.BETA_PLUS_DECAY:
          return model.betaPlusDecayEnabledProperty;
        case DecayType.BETA_MINUS_DECAY:
          return model.betaMinusDecayEnabledProperty;
        case DecayType.ALPHA_DECAY:
          return model.alphaDecayEnabledProperty;
        default:
          assert && assert( false, 'No valid decay type found: ' + decayType );
          return model.protonEmissionEnabledProperty;
      }
    };

    // function that creates the listeners for the decay buttons. Emits the specified particle depending on the decay type
    const createDecayButtonListener = ( decayType: DecayType ) => {
      options.storeNucleonCounts();
      switch( decayType ) {
        case DecayType.NEUTRON_EMISSION:
          options.emitNucleon( ParticleType.NEUTRON );
          break;
        case DecayType.PROTON_EMISSION:
          options.emitNucleon( ParticleType.PROTON, decayType.name );
          break;
        case DecayType.BETA_PLUS_DECAY:
          options.betaDecay( DecayType.BETA_PLUS_DECAY );
          break;
        case DecayType.BETA_MINUS_DECAY:
          options.betaDecay( DecayType.BETA_MINUS_DECAY );
          break;
        case DecayType.ALPHA_DECAY:
          options.emitAlphaParticle();
          break;
        default:
          break;
      }
      options.showAndRepositionUndoDecayButton( decayType.name.toString() );
    };

    // function to create the decay buttons
    // manually layout the button text due to the superscripts causing the normal layout to look out of place
    const createDecayButton = ( decayType: DecayType ): Node => {
      const buttonBackgroundRectangle = new Rectangle( 0, 0, BUTTON_CONTENT_WIDTH, BUTTON_HEIGHT );
      const buttonText = new RichText( decayType.label, { font: LABEL_FONT, maxWidth: BUTTON_CONTENT_WIDTH } );

      assert && assert( BUTTON_TEXT_BOTTOM_MARGIN + buttonText.height < BUTTON_HEIGHT, 'The button text is changing the size of the button.' );
      buttonText.centerBottom = buttonBackgroundRectangle.centerBottom.minusXY( 0, BUTTON_TEXT_BOTTOM_MARGIN );
      buttonBackgroundRectangle.addChild( buttonText );

      return new RectangularPushButton( {
        content: buttonBackgroundRectangle,
        yMargin: 0,
        baseColor: BANColors.decayButtonColorProperty,
        enabledProperty: returnEnabledDecayButtonProperty( decayType ),
        listener: () => { createDecayButtonListener( decayType ); }
      } );
    };

    // functions to create the decay icons

    // function to create a particle node ( a circle with a specific color ), make it bigger if the particle is a nucleon
    const createParticleNode = ( particleType: ParticleType ): Node => {
      return new ParticleNode( particleType.name.toLowerCase(),
        particleType === ParticleType.PROTON || particleType === ParticleType.NEUTRON ? NUCLEON_PARTICLE_RADIUS : ELECTRON_PARTICLE_RADIUS
      );
    };

    // function to create the right-aligned horizontal motion lines used in the decay icons ( the top and bottom lines are
    // shorter than the middle line )
    const createMotionLines = ( spacingBetweenLines: number, isShort?: boolean ): Node => {
      const motionLines: Line[] = [];
      let topAndBottomLineLength = 25;
      let middleLineLength = 40;

      if ( isShort ) {
        topAndBottomLineLength *= 0.5;
        middleLineLength *= 0.5;
      }

      for ( let i = 0; i < 3; i++ ) {
        motionLines.push( new Line( 0, 0, i % 2 === 0 ? topAndBottomLineLength : middleLineLength, 0,
          { stroke: BANColors.blueDecayIconSymbolsColorProperty } )
        );
      }

      return new VBox( {
        children: motionLines,
        spacing: spacingBetweenLines,
        align: 'right'
      } );
    };

    // function to create the icon for a nucleon emission ( a nucleon particle node with motion lines to its left )
    const createNucleonEmissionIcon = ( particleType: ParticleType ): Node => {
      return new HBox( {
        children: [
          createMotionLines( 4 ),
          new ParticleNode( particleType.name.toLowerCase(), NUCLEON_PARTICLE_RADIUS )
        ],
        spacing: SPACING / 4
      } );
    };

    // function to create the icon for a beta decay ( left to right contents: a nucleon particle node, a right-pointing
    // arrow, a different nucleon particle node than the first one, a mathematical 'plus' symbol, motion lines, and an
    // electron or positron )
    const createBetaDecayIcon = ( isBetaMinusDecay: boolean ): Node => {
      return new HBox( {
        children: [
          isBetaMinusDecay ? createParticleNode( ParticleType.NEUTRON ) : createParticleNode( ParticleType.PROTON ),
          new ArrowNode( 0, 0, 20, 0, {
            fill: BANColors.blueDecayIconSymbolsColorProperty,
            stroke: null,
            tailWidth: 1,
            headWidth: 7.5
          } ),
          isBetaMinusDecay ? createParticleNode( ParticleType.PROTON ) : createParticleNode( ParticleType.NEUTRON ),
          new PlusNode( { fill: BANColors.blueDecayIconSymbolsColorProperty, size: new Dimension2( 9, 2 ) } ),
          createMotionLines( 3.5, true ),
          isBetaMinusDecay ? createParticleNode( ParticleType.ELECTRON ) : createParticleNode( ParticleType.POSITRON )
        ],
        spacing: SPACING / 3
      } );
    };

    // function to create half of an alpha particle ( two particle nodes beside each other, slightly overlapping )
    const createHalfAlphaParticle = ( particleNodes: Node[] ): Node => {
      return new HBox( {
        children: particleNodes,
        spacing: ALPHA_PARTICLE_SPACING
      } );
    };

    // function to create an alpha decay icon ( four slightly overlapping particle nodes, two on top and two on the bottom,
    // with motion lines to their left )
    const createAlphaDecayIcon = (): Node => {
      return new HBox( {
        children: [
          createMotionLines( 6 ),
          new VBox( {
            children: [
              createHalfAlphaParticle( [ createParticleNode( ParticleType.PROTON ), createParticleNode( ParticleType.NEUTRON ) ] ),
              createHalfAlphaParticle( [ createParticleNode( ParticleType.NEUTRON ), createParticleNode( ParticleType.PROTON ) ] )
            ],
            spacing: ALPHA_PARTICLE_SPACING
          } )
        ],
        spacing: SPACING / 4
      } );
    };

    // function to create the decay icons corresponding to a specific DecayType
    const createDecayIcon = ( decayType: DecayType ): Node | null => {
      switch( decayType ) {
        case DecayType.ALPHA_DECAY:
          return createAlphaDecayIcon(); // alpha decay icon
        case DecayType.BETA_MINUS_DECAY:
          return createBetaDecayIcon( true ); // beta minus decay icon
        case DecayType.BETA_PLUS_DECAY:
          return createBetaDecayIcon( false ); // beta plus decay icon
        case DecayType.PROTON_EMISSION:
          return createNucleonEmissionIcon( ParticleType.PROTON ); // proton emission icon
        case DecayType.NEUTRON_EMISSION:
          return createNucleonEmissionIcon( ParticleType.NEUTRON ); // neutron emission icon
        default:
          return null;
      }
    };

    // function to create the decay button and corresponding decay icon pair
    const createDecayButtonAndIcon = ( decayType: DecayType ): Node => {
      return new HBox( {
        children: [
          createDecayButton( decayType ),
          createDecayIcon( decayType )!
        ],
        spacing: SPACING * 1.5,
        align: 'center'
      } );
    };

    // see this.decayTypeButtonIndexMap for detail
    const decayTypeButtonIndexMap: decayTypeButtonIndexType = {};

    // create the decay button and icon pair in a VBox
    const decayButtonsAndIcons: Node[] = [];
    DecayType.enumeration.values.forEach( decayType => {
      decayTypeButtonIndexMap[ decayType.name.toString() ] = decayButtonsAndIcons.push( createDecayButtonAndIcon( decayType ) ) - 1;
    } );
    const arrangedDecayButtonsAndIcons = new VBox( {
      children: decayButtonsAndIcons,
      spacing: SPACING,
      align: 'left'
    } );

    // add the decay buttons and icons
    arrangedDecayButtonsAndIcons.top = titleNode.bottom + SPACING;

    // create and add the separator
    const separator = new HSeparator( { stroke: '#CACACA' } );

    separator.top = arrangedDecayButtonsAndIcons.bottom + SPACING;

    // create and add the particle labels
    // a particle label is a particle node on the left with its corresponding particle name on the right
    const createParticleLabel = ( particleType: ParticleType ): Node => {
      return new HBox( {
        children: [
          new ParticleNode( particleType.name.toLowerCase(), particleType === ParticleType.PROTON || particleType === ParticleType.NEUTRON ? NUCLEON_PARTICLE_RADIUS : ELECTRON_PARTICLE_RADIUS ),
          new Text( particleType.label, { font: LABEL_FONT, maxWidth: 100 } )
        ],
        spacing: SPACING
      } );
    };
    const particleLabels = ParticleType.enumeration.values.map( particleType => createParticleLabel( particleType ) );
    const createParticleLabelsVBox = ( particleLabels: Node[] ) => {
      return new VBox( {
        children: particleLabels,
        spacing: SPACING,
        align: 'left'
      } );
    };
    const particleLabelsLegend = new HBox( {
      children: [
        createParticleLabelsVBox( [ particleLabels[ 0 ], particleLabels[ 2 ] ] ),
        createParticleLabelsVBox( [ particleLabels[ 1 ], particleLabels[ 3 ] ] )
      ],
      spacing: SPACING * 5
    } );
    particleLabelsLegend.top = separator.bottom + SPACING;

    const contentNode = new VBox( {
    children: [
      new HBox( { children: [ titleNode, decaysInfoButton ], spacing: 15 } ),
      arrangedDecayButtonsAndIcons,
      separator,
      particleLabelsLegend
    ],
      spacing: SPACING
    } );

    super( contentNode, {
      xMargin: 15,
      yMargin: 15,
      fill: '#F2F2F2',
      stroke: BANConstants.PANEL_STROKE,
      minWidth: 322,
      cornerRadius: BANConstants.PANEL_CORNER_RADIUS
    } );

    // used when positioning the undo decay buttons
    this.arrangedDecayButtonsAndIcons = arrangedDecayButtonsAndIcons;
    this.decayTypeButtonIndexMap = decayTypeButtonIndexMap;
  }
}

buildANucleus.register( 'AvailableDecaysPanel', AvailableDecaysPanel );
export default AvailableDecaysPanel;