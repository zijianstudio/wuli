// Copyright 2022-2023, University of Colorado Boulder

/**
 * ScreenView for the 'Nuclide Chart Intro' screen.
 *
 * @author Luisa Vargas
 */

import buildANucleus from '../../buildANucleus.js';
import ChartIntroModel, { SelectedChartType } from '../model/ChartIntroModel.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import BANScreenView, { BANScreenViewOptions } from '../../common/view/BANScreenView.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import Multilink from '../../../../axon/js/Multilink.js';
import PeriodicTableAndIsotopeSymbol from './PeriodicTableAndIsotopeSymbol.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import { Color, Line, Node, Rectangle, RichText, Text } from '../../../../scenery/js/imports.js';
import BANConstants from '../../common/BANConstants.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import BANColors from '../../common/BANColors.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import NucleonShellView from './NucleonShellView.js';
import ParticleType from '../../common/view/ParticleType.js';
import AtomNode from '../../../../shred/js/view/AtomNode.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import ParticleView from '../../../../shred/js/view/ParticleView.js';
import NuclideChartAccordionBox from './NuclideChartAccordionBox.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';

// types
export type NuclideChartIntroScreenViewOptions = BANScreenViewOptions;

class ChartIntroScreenView extends BANScreenView<ChartIntroModel> {

  private readonly periodicTableAndIsotopeSymbol: PeriodicTableAndIsotopeSymbol;
  private readonly protonEnergyLevelNode: NucleonShellView;
  private readonly neutronEnergyLevelNode: NucleonShellView;
  private readonly energyLevelLayer: Node;

  public constructor( model: ChartIntroModel, providedOptions?: NuclideChartIntroScreenViewOptions ) {

    const options = optionize<NuclideChartIntroScreenViewOptions, EmptySelfOptions, BANScreenViewOptions>()( {

      // centers particle atoms on energy levels
      particleViewPositionVector: new Vector2( 135, 245 - BANConstants.PARTICLE_RADIUS ) // top left corner of proton energy levels

    }, providedOptions );

    super( model, new Vector2( BANConstants.SCREEN_VIEW_ATOM_CENTER_X, 87 ), options );

    this.model = model;
    this.energyLevelLayer = new Node();

    const miniAtomMVT = ModelViewTransform2.createSinglePointScaleMapping( Vector2.ZERO, this.particleAtomNode.emptyAtomCircle.center, 1 );
    const miniAtomNode = new AtomNode( model.miniParticleAtom, miniAtomMVT, {
      showCenterX: false,
      showElementNameProperty: new BooleanProperty( false ),
      showNeutralOrIonProperty: new BooleanProperty( false ),
      showStableOrUnstableProperty: new BooleanProperty( false ),
      electronShellDepictionProperty: new StringProperty( 'cloud' )
    } );
    miniAtomNode.center = this.particleAtomNode.emptyAtomCircle.center;
    this.addChild( miniAtomNode );

    // update nucleons in mini-particle as the particleAtom's nucleon count properties change
    const nucleonCountListener = ( nucleonCount: number, particleType: ParticleType ) => {
      const currentMiniAtomNucleonCount = particleType === ParticleType.PROTON ?
                                          model.miniParticleAtom.protonCountProperty.value :
                                          model.miniParticleAtom.neutronCountProperty.value;

      // difference between particleAtom's nucleon count and miniAtom's nucleon count
      const nucleonDelta = currentMiniAtomNucleonCount - nucleonCount;

      // add nucleons to miniAtom
      if ( nucleonDelta < 0 ) {
        _.times( nucleonDelta * -1, () => {
          const miniParticle = model.createMiniParticleModel( particleType );
          this.particleViewMap[ miniParticle.id ] = new ParticleView( miniParticle, miniAtomMVT );
          this.particleAtomNode.addParticleView( miniParticle );
        } );
      }

      // remove nucleons from miniAtom
      else if ( nucleonDelta > 0 ) {
        _.times( nucleonDelta, () => {
          const particle = model.miniParticleAtom.extractParticle( particleType.name.toLowerCase() );
          const particleView = this.findParticleView( particle );
          delete this.particleViewMap[ particleView.particle.id ];

          particleView.dispose();
          particle.dispose();
          model.miniParticleAtom.reconfigureNucleus();
        } );
      }
    };
    model.particleAtom.protonCountProperty.link( protonCount => nucleonCountListener( protonCount, ParticleType.PROTON ) );
    model.particleAtom.neutronCountProperty.link( neutronCount => nucleonCountListener( neutronCount, ParticleType.NEUTRON ) );
    const particleAtomNodeCenter = this.particleAtomNode.center;
    this.particleAtomNode.scale( 0.75 );
    this.particleAtomNode.center = particleAtomNodeCenter;

    // create and add the periodic table and symbol
    this.periodicTableAndIsotopeSymbol = new PeriodicTableAndIsotopeSymbol( model.particleAtom );
    this.periodicTableAndIsotopeSymbol.top = this.nucleonCountPanel.top;
    this.periodicTableAndIsotopeSymbol.right = this.resetAllButton.right;
    this.addChild( this.periodicTableAndIsotopeSymbol );

    this.elementName.centerX = this.doubleArrowButtons.centerX;
    this.elementName.top = this.nucleonCountPanel.top;

    this.nucleonCountPanel.left = this.layoutBounds.left + 20;

    // Hook up update listeners.
    Multilink.multilink( [ model.particleAtom.protonCountProperty, model.particleAtom.neutronCountProperty, model.doesNuclideExistBooleanProperty ],
      ( protonCount: number, neutronCount: number, doesNuclideExist: boolean ) =>
        BANScreenView.updateElementName( this.elementName, protonCount, neutronCount, doesNuclideExist,
          this.doubleArrowButtons.centerX )
    );

    // create and add the 'Nuclear Shell Model' title
    const nuclearShellModelText = new RichText( BuildANucleusStrings.nuclearShellModel, { font: BANConstants.REGULAR_FONT } );
    nuclearShellModelText.centerX = this.doubleArrowButtons.centerX;
    nuclearShellModelText.centerY = this.periodicTableAndIsotopeSymbol.bottom + 20;

    // create the 'highlight' text behind 'Nuclear Shell Model' text
    const nuclearShellModelTextHighlight = new Rectangle( nuclearShellModelText.bounds.dilateXY( 15, 5 ), {
      fill: BANColors.shellModelTextHighlightColorProperty,
      cornerRadius: 10
    } );
    nuclearShellModelTextHighlight.centerX = nuclearShellModelText.centerX;
    nuclearShellModelTextHighlight.centerY = nuclearShellModelText.centerY;

    // place highlight behind the text
    this.addChild( nuclearShellModelTextHighlight );
    this.addChild( nuclearShellModelText );

    // create and add the 'Energy' label
    const energyText = new RichText( BuildANucleusStrings.energy, { font: BANConstants.REGULAR_FONT } );
    energyText.rotate( -Math.PI / 2 );
    energyText.left = this.nucleonCountPanel.left;
    energyText.centerY = this.layoutBounds.centerY + 20;
    this.addChild( energyText );

    // create and add the 'Energy' arrow
    const energyTextDistanceFromArrow = 10;
    const arrow = new ArrowNode( energyText.right + energyTextDistanceFromArrow, this.protonArrowButtons.top - 30,
      energyText.right + energyTextDistanceFromArrow, this.periodicTableAndIsotopeSymbol.bottom + 15, { tailWidth: 2 } );
    this.addChild( arrow );

    // add energy level node
    this.protonEnergyLevelNode = new NucleonShellView( ParticleType.PROTON, model.particleAtom.protonShellPositions,
      model.particleAtom.protonCountProperty, options.particleViewPositionVector );
    this.addChild( this.protonEnergyLevelNode );
    this.neutronEnergyLevelNode = new NucleonShellView( ParticleType.NEUTRON, model.particleAtom.neutronShellPositions,
      model.particleAtom.neutronCountProperty, options.particleViewPositionVector, {
      xOffset: BANConstants.X_DISTANCE_BETWEEN_ENERGY_LEVELS
    } );
    this.addChild( this.neutronEnergyLevelNode );

    // create and add dashed 'zoom' lines
    // TODO: position based on the small atom
    const dashedLineOptions = { stroke: Color.BLACK, lineDash: [ 6, 3 ] };
    const leftDashedLine = new Line( this.protonEnergyLevelNode.left, arrow.top, this.doubleArrowButtons.left,
      this.periodicTableAndIsotopeSymbol.centerY, dashedLineOptions );
    this.addChild( leftDashedLine );
    const rightDashedLine = new Line( this.neutronEnergyLevelNode.right, arrow.top, this.doubleArrowButtons.right,
      this.periodicTableAndIsotopeSymbol.centerY, dashedLineOptions );
    this.addChild( rightDashedLine );

    // TODO: use align group to match width's of accordion box and periodic table
    const nuclideChartAccordionBox = new NuclideChartAccordionBox( this.model.particleAtom.protonCountProperty,
      this.model.particleAtom.neutronCountProperty, this.periodicTableAndIsotopeSymbol.width,
      this.model.selectedNuclideChartProperty );
    nuclideChartAccordionBox.top = this.periodicTableAndIsotopeSymbol.bottom + 5;
    nuclideChartAccordionBox.left = this.periodicTableAndIsotopeSymbol.left;
    this.addChild( nuclideChartAccordionBox );

    const partialChartRadioButton = new RectangularRadioButtonGroup<SelectedChartType>( this.model.selectedNuclideChartProperty,
      [ { value: 'partial', createNode: () => new Text( 'partial' ) }, { value: 'zoom', createNode: () => new Text( 'zoom' ) } ],
      { leftTop: nuclideChartAccordionBox.leftBottom, orientation: 'horizontal' } );
    this.addChild( partialChartRadioButton );

    // add the particleViewLayerNode after everything else so particles are in the top layer
    this.addChild( this.particleAtomNode );
    this.addChild( this.energyLevelLayer );

    // only show the emptyAtomCircle when there are zero nucleons
    Multilink.multilink( [ this.model.particleAtom.protonCountProperty, this.model.particleAtom.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) => {
        this.particleAtomNode.emptyAtomCircle.visible = ( protonCount + neutronCount ) === 0;
      } );
  }

  /**
   * Returns whether the nucleon is within a rectangular capture radius defined by the left edge of the proton arrow
   * buttons, the right edge of the neutron arrow buttons, below the periodic table, and above the arrow buttons.
   */
  protected override isNucleonInCaptureArea( nucleon: Particle, atom: ParticleAtom ): boolean {
    const nucleonViewPosition = nucleon.positionProperty.value.plus(
      new Vector2( 135, 193 - BANConstants.PARTICLE_RADIUS ) // top left corner of proton energy levels
    );
    return this.protonEnergyLevelNode.boundsProperty.value.dilated( BANConstants.PARTICLE_RADIUS * 2 ).containsPoint( nucleonViewPosition ) ||
           this.neutronEnergyLevelNode.boundsProperty.value.dilated( BANConstants.PARTICLE_RADIUS * 2 ).containsPoint( nucleonViewPosition );
  }

  protected override addParticleView( particle: Particle ): void {
    this.energyLevelLayer.addChild( this.findParticleView( particle ) );
  }
}

buildANucleus.register( 'ChartIntroScreenView', ChartIntroScreenView );
export default ChartIntroScreenView;