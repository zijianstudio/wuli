// Copyright 2022-2023, University of Colorado Boulder

/**
 * ScreenView class that the 'Decay' and 'Nuclide Chart' will extend.
 *
 * @author Luisa Vargas
 */

import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import buildANucleus from '../../buildANucleus.js';
import BANConstants from '../../common/BANConstants.js';
import optionize from '../../../../phet-core/js/optionize.js';
import BANModel from '../model/BANModel.js';
import ArrowButton from '../../../../sun/js/buttons/ArrowButton.js';
import { Color, Node, PressListenerEvent, ProfileColorProperty, Text, VBox } from '../../../../scenery/js/imports.js';
import BANColors from '../BANColors.js';
import NucleonCountPanel from './NucleonCountPanel.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import DoubleArrowButton, { DoubleArrowButtonDirection } from './DoubleArrowButton.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ParticleView from '../../../../shred/js/view/ParticleView.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import NucleonCreatorNode from './NucleonCreatorNode.js';
import ParticleType from './ParticleType.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import BANQueryParameters from '../BANQueryParameters.js';
import ParticleNucleus from '../../chart-intro/model/ParticleNucleus.js';
import ParticleAtomNode from '../../chart-intro/view/ParticleAtomNode.js';

const TOUCH_AREA_Y_DILATION = 3;

// types
type SelfOptions = {
  particleViewPositionVector?: Vector2;
};
export type BANScreenViewOptions = SelfOptions & ScreenViewOptions;
export type ParticleViewMap = Record<number, ParticleView>;

type ParticleTypeInfo = {
  maxCount: number;
  creatorNode: Node;
  numberOfNucleons: number;
  outgoingNucleons: number;
};

// constants
const HORIZONTAL_DISTANCE_BETWEEN_ARROW_BUTTONS = 160;

abstract class BANScreenView<M extends BANModel<ParticleAtom | ParticleNucleus>> extends ScreenView {

  protected model: M;
  private timeSinceCountdownStarted: number;
  private previousProtonCount: number;
  private previousNeutronCount: number;
  public readonly resetAllButton: Node;
  public readonly nucleonCountPanel: Node;

  // ParticleView.id => {ParticleView} - lookup map for efficiency. Used for storage only.
  protected readonly particleViewMap: ParticleViewMap;

  // the NucleonCreatorNode for the protons and neutrons
  protected readonly protonsCreatorNode: Node;
  protected readonly neutronsCreatorNode: Node;

  public protonsCreatorNodeModelCenter: Vector2;
  public neutronsCreatorNodeModelCenter: Vector2;

  protected readonly doubleArrowButtons: Node;
  protected readonly protonArrowButtons: Node;
  protected readonly neutronArrowButtons: Node;
  protected readonly elementName: Text;
  private readonly atomCenter: Vector2;
  private readonly particleViewPositionVector: Vector2;
  protected particleAtomNode: ParticleAtomNode;

  protected constructor( model: M, atomCenter: Vector2, providedOptions?: BANScreenViewOptions ) {

    const options = optionize<BANScreenViewOptions, SelfOptions, ScreenViewOptions>()( {

      particleViewPositionVector: atomCenter
    }, providedOptions );

    super( options );

    this.particleViewPositionVector = options.particleViewPositionVector;
    this.model = model;
    this.timeSinceCountdownStarted = 0;
    this.previousProtonCount = 0;
    this.previousNeutronCount = 0;

    this.atomCenter = atomCenter;

    this.particleViewMap = {};

    this.nucleonCountPanel = new NucleonCountPanel( model.particleAtom.protonCountProperty, model.protonCountRange,
      model.particleAtom.neutronCountProperty, model.neutronCountRange );
    this.nucleonCountPanel.top = this.layoutBounds.minY + BANConstants.SCREEN_VIEW_Y_MARGIN;
    this.addChild( this.nucleonCountPanel );

    // Create the textual readout for the element name.
    this.elementName = new Text( '', {
      font: BANConstants.REGULAR_FONT,
      fill: Color.RED,
      maxWidth: BANConstants.ELEMENT_NAME_MAX_WIDTH
    } );
    this.addChild( this.elementName );

    const arrowButtonSpacing = 7; // spacing between the 'up' arrow buttons and 'down' arrow buttons
    const arrowButtonOptions = {
      arrowWidth: 14,
      arrowHeight: 14,
      fireOnHold: false
    };

    // return if any nuclides exist above, below, or to the left or right of a given nuclide
    const getNextOrPreviousIso = ( direction: string, particleType: ParticleType, protonCount: number, neutronCount: number ) => {

      if ( direction === 'up' ) {

        // proton up arrow
        if ( particleType === ParticleType.PROTON ) {
          return AtomIdentifier.doesNextIsotoneExist( protonCount, neutronCount );
        }

        // neutron up arrow
        return AtomIdentifier.doesNextIsotopeExist( protonCount, neutronCount );
      }

      // proton down arrow
      if ( particleType === ParticleType.PROTON ) {
        return AtomIdentifier.doesPreviousIsotoneExist( protonCount, neutronCount );
      }

      // neutron down arrow
      return AtomIdentifier.doesPreviousIsotopeExist( protonCount, neutronCount );
    };

    // function returns whether the protonCount or neutronCount is at its min or max range
    const isNucleonCountAtRangeBounds = ( direction: string, particleType: ParticleType, protonCount: number, neutronCount: number ) => {
      if ( direction === 'up' ) {

        // proton up arrow
        if ( particleType === ParticleType.PROTON ) {
          return protonCount !== model.protonCountRange.max;
        }

        // neutron up arrow
        return neutronCount !== model.neutronCountRange.max;
      }

      // proton down arrow
      if ( particleType === ParticleType.PROTON ) {
        return protonCount !== model.protonCountRange.min;
      }

      // neutron down arrow
      return neutronCount !== model.neutronCountRange.min;
    };

    // enable or disable the creator node and adjust the opacity accordingly
    const creatorNodeEnabled = ( creatorNode: Node, enable: boolean ) => {
      if ( creatorNode ) {
        creatorNode.inputEnabled = enable;
        creatorNode.opacity = enable ? 1 : 0.5;
      }
    };

    // function to create the arrow enabled properties
    const createArrowEnabledProperty = ( direction: string, firstParticleType: ParticleType, secondParticleType?: ParticleType ) => {
      return new DerivedProperty( [ model.particleAtom.protonCountProperty, model.particleAtom.neutronCountProperty,
          model.incomingProtons.lengthProperty, model.incomingNeutrons.lengthProperty, model.userControlledProtons.lengthProperty,
          model.userControlledNeutrons.lengthProperty ],
        ( atomProtonCount, atomNeutronCount, incomingProtonsCount, incomingNeutronsCount,
          userControlledProtonCount, userControlledNeutronCount ) => {

          const protonCount = atomProtonCount + incomingProtonsCount + userControlledProtonCount;
          const neutronCount = atomNeutronCount + incomingNeutronsCount + userControlledNeutronCount;
          const userControlledNucleonCount = userControlledNeutronCount + userControlledProtonCount;

          // disable all arrow buttons if the nuclide does not exist
          if ( !AtomIdentifier.doesExist( protonCount, neutronCount ) && ( model.particleAtom.massNumberProperty.value !== 0 || userControlledNucleonCount !== 0 ) ) {
            creatorNodeEnabled( this.protonsCreatorNode, false );
            creatorNodeEnabled( this.neutronsCreatorNode, false );
            return false;
          }

          else {
            creatorNodeEnabled( this.protonsCreatorNode, true );
            creatorNodeEnabled( this.neutronsCreatorNode, true );

            const nextOrPreviousIsoExists = secondParticleType ?
                                            !getNextOrPreviousIso( direction, firstParticleType, protonCount, neutronCount ) ||
                                            !getNextOrPreviousIso( direction, secondParticleType, protonCount, neutronCount ) :
                                            !getNextOrPreviousIso( direction, firstParticleType, protonCount, neutronCount );

            const doesNuclideExist = AtomIdentifier.doesExist( protonCount, neutronCount );
            const nuclideExistsBoolean = direction === 'up' ? !doesNuclideExist : doesNuclideExist;

            const doesPreviousNuclideExist = secondParticleType && direction === 'down' ?
                                             !AtomIdentifier.doesPreviousNuclideExist( protonCount, neutronCount ) :
                                             nextOrPreviousIsoExists;

            if ( nuclideExistsBoolean && doesPreviousNuclideExist ) {
              return false;
            }
            return secondParticleType ? isNucleonCountAtRangeBounds( direction, firstParticleType, protonCount, neutronCount ) &&
                                        isNucleonCountAtRangeBounds( direction, secondParticleType, protonCount, neutronCount ) :
                   isNucleonCountAtRangeBounds( direction, firstParticleType, protonCount, neutronCount );
          }

        } );
    };

    // create the arrow enabled properties
    const protonUpArrowEnabledProperty = createArrowEnabledProperty( 'up', ParticleType.PROTON );
    const neutronUpArrowEnabledProperty = createArrowEnabledProperty( 'up', ParticleType.NEUTRON );
    const doubleUpArrowEnabledProperty = createArrowEnabledProperty( 'up', ParticleType.PROTON, ParticleType.NEUTRON );
    const protonDownArrowEnabledProperty = createArrowEnabledProperty( 'down', ParticleType.PROTON );
    const neutronDownArrowEnabledProperty = createArrowEnabledProperty( 'down', ParticleType.NEUTRON );
    const doubleDownArrowEnabledProperty = createArrowEnabledProperty( 'down', ParticleType.PROTON, ParticleType.NEUTRON );

    // function to create the double arrow buttons
    const createDoubleArrowButtons = ( direction: DoubleArrowButtonDirection ): Node => {
      return new DoubleArrowButton( direction,
        direction === 'up' ?
        () => increaseNucleonCountListener( ParticleType.PROTON, ParticleType.NEUTRON ) :
        () => decreaseNucleonCountListener( ParticleType.PROTON, ParticleType.NEUTRON ),
        merge( {
          leftArrowFill: BANColors.protonColorProperty,
          rightArrowFill: BANColors.neutronColorProperty,
          enabledProperty: direction === 'up' ? doubleUpArrowEnabledProperty : doubleDownArrowEnabledProperty,
          touchAreaYDilation: TOUCH_AREA_Y_DILATION
        }, arrowButtonOptions )
      );
    };

    // create the double arrow buttons
    const doubleArrowButtons = new VBox( {
      children: [ createDoubleArrowButtons( 'up' ), createDoubleArrowButtons( 'down' ) ],
      spacing: arrowButtonSpacing
    } );
    doubleArrowButtons.bottom = this.layoutBounds.maxY - BANConstants.SCREEN_VIEW_Y_MARGIN;
    doubleArrowButtons.centerX = this.atomCenter.x;
    this.addChild( doubleArrowButtons );

    // functions to create the listeners that create or remove a particle
    const increaseNucleonCountListener = ( firstNucleonType: ParticleType, secondNucleonType?: ParticleType ) => {
      this.createParticleFromStack( firstNucleonType );
      if ( secondNucleonType ) {
        this.createParticleFromStack( secondNucleonType );
      }
    };
    const decreaseNucleonCountListener = ( firstNucleonType: ParticleType, secondNucleonType?: ParticleType ) => {
      this.returnParticleToStack( firstNucleonType );
      if ( secondNucleonType ) {
        this.returnParticleToStack( secondNucleonType );
      }
    };

    // function to create the single arrow buttons
    const createSingleArrowButtons = ( nucleonType: ParticleType, nucleonColorProperty: ProfileColorProperty ): Node => {
      const singleArrowButtonOptions = merge( { arrowFill: nucleonColorProperty }, arrowButtonOptions );
      const upArrowButton = new ArrowButton( 'up', () => increaseNucleonCountListener( nucleonType ),
        merge( {
            enabledProperty: nucleonType === ParticleType.PROTON ? protonUpArrowEnabledProperty : neutronUpArrowEnabledProperty,
            touchAreaYDilation: TOUCH_AREA_Y_DILATION
          },
          singleArrowButtonOptions )
      );
      const downArrowButton = new ArrowButton( 'down', () => decreaseNucleonCountListener( nucleonType ),
        merge( {
            enabledProperty: nucleonType === ParticleType.PROTON ? protonDownArrowEnabledProperty : neutronDownArrowEnabledProperty,
            touchAreaYDilation: TOUCH_AREA_Y_DILATION
          },
          singleArrowButtonOptions )
      );
      return new VBox( {
        children: [ upArrowButton, downArrowButton ],
        spacing: arrowButtonSpacing
      } );
    };

    // create the single arrow buttons
    const protonArrowButtons = createSingleArrowButtons( ParticleType.PROTON, BANColors.protonColorProperty );
    protonArrowButtons.bottom = this.layoutBounds.maxY - BANConstants.SCREEN_VIEW_Y_MARGIN;
    protonArrowButtons.right = doubleArrowButtons.left - HORIZONTAL_DISTANCE_BETWEEN_ARROW_BUTTONS;
    this.addChild( protonArrowButtons );
    const neutronArrowButtons = createSingleArrowButtons( ParticleType.NEUTRON, BANColors.neutronColorProperty );
    neutronArrowButtons.bottom = this.layoutBounds.maxY - BANConstants.SCREEN_VIEW_Y_MARGIN;
    neutronArrowButtons.left = doubleArrowButtons.right + HORIZONTAL_DISTANCE_BETWEEN_ARROW_BUTTONS;
    this.addChild( neutronArrowButtons );

    // function to keep track of when a double arrow button was clicked
    const createSingleOrDoubleArrowButtonClickedListener = ( isDoubleArrowButton: boolean, arrowButtons: Node ) => {
      const arrowButtonsChildren = arrowButtons.getChildren() as ArrowButton[];
      arrowButtonsChildren.forEach( arrowButton => {
        arrowButton.addListener( () => {
          model.doubleArrowButtonClickedBooleanProperty.value = isDoubleArrowButton;
        } );
      } );
    };

    createSingleOrDoubleArrowButtonClickedListener( true, doubleArrowButtons );
    createSingleOrDoubleArrowButtonClickedListener( false, protonArrowButtons );
    createSingleOrDoubleArrowButtonClickedListener( false, neutronArrowButtons );

    const nucleonLabelTextOptions = { font: new PhetFont( 20 ), maxWidth: 150 };

    // create and add the Protons and Neutrons label
    const protonsLabel = new Text( BuildANucleusStrings.protons, nucleonLabelTextOptions );
    protonsLabel.bottom = doubleArrowButtons.bottom;
    protonsLabel.centerX = ( doubleArrowButtons.left - protonArrowButtons.right ) / 2 + protonArrowButtons.right;
    this.addChild( protonsLabel );

    const neutronsLabel = new Text( BuildANucleusStrings.neutronsUppercase, nucleonLabelTextOptions );
    neutronsLabel.bottom = doubleArrowButtons.bottom;
    neutronsLabel.centerX = ( neutronArrowButtons.left - doubleArrowButtons.right ) / 2 + doubleArrowButtons.right;
    this.addChild( neutronsLabel );

    // create and add the NucleonCreatorNode for the protons
    this.protonsCreatorNode = new NucleonCreatorNode<ParticleAtom | ParticleNucleus>( ParticleType.PROTON, this, options.particleViewPositionVector );
    this.protonsCreatorNode.top = doubleArrowButtons.top;
    this.protonsCreatorNode.centerX = protonsLabel.centerX;
    this.addChild( this.protonsCreatorNode );

    // create and add the NucleonCreatorNode for the neutrons
    this.neutronsCreatorNode = new NucleonCreatorNode<ParticleAtom | ParticleNucleus>( ParticleType.NEUTRON, this, options.particleViewPositionVector );
    this.neutronsCreatorNode.top = doubleArrowButtons.top;
    this.neutronsCreatorNode.centerX = neutronsLabel.centerX;
    this.addChild( this.neutronsCreatorNode );

    this.protonsCreatorNodeModelCenter = this.protonsCreatorNode.center.minus( options.particleViewPositionVector );
    this.neutronsCreatorNodeModelCenter = this.neutronsCreatorNode.center.minus( options.particleViewPositionVector );

    this.resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - BANConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - BANConstants.SCREEN_VIEW_Y_MARGIN
    } );
    this.addChild( this.resetAllButton );

    const userControlledListener = ( isUserControlled: boolean, particle: Particle ) => {
      if ( isUserControlled && this.model.particleAtom.containsParticle( particle ) ) {
        this.model.particleAtom.removeParticle( particle );
      }

      if ( isUserControlled && particle.type === ParticleType.PROTON.name.toLowerCase() && !this.model.userControlledProtons.includes( particle ) ) {
        this.model.userControlledProtons.add( particle );
      }
      else if ( !isUserControlled && particle.type === ParticleType.PROTON.name.toLowerCase() && this.model.userControlledProtons.includes( particle ) ) {
        this.model.userControlledProtons.remove( particle );
      }
      else if ( isUserControlled && particle.type === ParticleType.NEUTRON.name.toLowerCase() && !this.model.userControlledNeutrons.includes( particle ) ) {
        this.model.userControlledNeutrons.add( particle );
      }
      else if ( !isUserControlled && particle.type === ParticleType.NEUTRON.name.toLowerCase() && this.model.userControlledNeutrons.includes( particle ) ) {
        this.model.userControlledNeutrons.remove( particle );
      }
    };

    // convert string particle type to a ParticleType
    const getParticleTypeFromStringType = ( particleTypeString: string ) => {
      const particleType = particleTypeString === ParticleType.PROTON.name.toLowerCase() ? ParticleType.PROTON :
                           particleTypeString === ParticleType.NEUTRON.name.toLowerCase() ? ParticleType.NEUTRON :
                           particleTypeString === ParticleType.ELECTRON.name.toLowerCase() ? ParticleType.ELECTRON :
                           particleTypeString === ParticleType.POSITRON.name.toLowerCase() ? ParticleType.POSITRON :
                           null;
      assert && assert( particleType !== null, `Particle type ${particleTypeString} is not a valid particle type.` );
      return particleType;
    };

    // add ParticleView's to match the model
    this.model.particles.addItemAddedListener( ( particle: Particle ) => {
      const particleView = new ParticleView( particle,
        ModelViewTransform2.createSinglePointScaleMapping( Vector2.ZERO, options.particleViewPositionVector, 1 ) );

      this.particleViewMap[ particleView.particle.id ] = particleView;
      this.addParticleView( particle );
      const particleType = getParticleTypeFromStringType( particle.type );

      if ( particleType === ParticleType.PROTON || particleType === ParticleType.NEUTRON ) {

        // called when a nucleon is finished being dragged
        particle.dragEndedEmitter.addListener( () => { this.dragEndedListener( particle, this.model.particleAtom ); } );
        this.checkIfCreatorNodeShouldBeInvisible( particleType );
      }

      // TODO: unlink userControlledListener
      particle.userControlledProperty.link( isUserControlled => userControlledListener( isUserControlled, particle ) );
    } );

    // remove ParticleView's to match the model
    this.model.particles.addItemRemovedListener( ( particle: Particle ) => {
      const particleView = this.findParticleView( particle );

      particle.dragEndedEmitter.dispose();
      particle.animationEndedEmitter.dispose();

      delete this.particleViewMap[ particleView.particle.id ];

      particleView.dispose();
      particle.dispose();

      const particleType = getParticleTypeFromStringType( particle.type );

      if ( particleType === ParticleType.PROTON || particleType === ParticleType.NEUTRON ) {
        this.checkIfCreatorNodeShouldBeVisible( particleType );
      }
    } );

    this.particleAtomNode = new ParticleAtomNode( this.particleViewMap, this.atomCenter, this.model.protonCountRange );

    // for use in positioning
    this.doubleArrowButtons = doubleArrowButtons;
    this.protonArrowButtons = protonArrowButtons;
    this.neutronArrowButtons = neutronArrowButtons;

    // add initial neutrons and protons specified by the query parameters to the atom
    _.times( Math.max( BANQueryParameters.neutrons, BANQueryParameters.protons ), () => {
      if ( this.model.particleAtom.neutronCountProperty.value < BANQueryParameters.neutrons ) {
        this.addNucleonImmediatelyToAtom( ParticleType.NEUTRON );
      }
      if ( this.model.particleAtom.protonCountProperty.value < BANQueryParameters.protons ) {
        this.addNucleonImmediatelyToAtom( ParticleType.PROTON );
      }
    } );

    // update the cloud size as the massNumber changes
    model.particleAtom.protonCountProperty.link( protonCount => this.particleAtomNode.updateCloudSize( protonCount, 0.27, 10, 20 ) );
  }

  /**
   * Get information for a specific particle type.
   */
  private getInfoForParticleType( particleType: ParticleType ): ParticleTypeInfo {
    const maxCount = particleType === ParticleType.PROTON ? this.model.protonCountRange.max : this.model.neutronCountRange.max;
    const creatorNode = particleType === ParticleType.PROTON ? this.protonsCreatorNode : this.neutronsCreatorNode;
    const numberOfNucleons = [ ...this.model.particles ]
      .filter( particle => particle.type === particleType.name.toLowerCase() ).length;
    const outgoingNucleons = [ ...this.model.outgoingParticles ]
      .filter( particle => particle.type === particleType.name.toLowerCase() ).length;

    return {
      maxCount: maxCount,
      creatorNode: creatorNode,
      numberOfNucleons: numberOfNucleons,
      outgoingNucleons: outgoingNucleons
    };
  }

  /**
   * Hides the given creator node if the count for that nucleon type has reached its max.
   */
  public checkIfCreatorNodeShouldBeInvisible( particleType: ParticleType ): void {
    const infoForParticleType = this.getInfoForParticleType( particleType );

    if ( ( infoForParticleType.numberOfNucleons - infoForParticleType.outgoingNucleons ) >= infoForParticleType.maxCount ) {
      BANScreenView.setCreatorNodeVisibility( infoForParticleType.creatorNode, false );
    }
  }

  /**
   * Shows the given creator node if the count for that nucleon type is below its max.
   */
  public checkIfCreatorNodeShouldBeVisible( particleType: ParticleType ): void {
    const infoForParticleType = this.getInfoForParticleType( particleType );

    if ( ( infoForParticleType.numberOfNucleons - infoForParticleType.outgoingNucleons ) < infoForParticleType.maxCount ) {
      BANScreenView.setCreatorNodeVisibility( infoForParticleType.creatorNode, true );
    }
  }

  /**
   * Create and add a nucleon of particleType immediately to the particleAtom.
   */
  public addNucleonImmediatelyToAtom( particleType: ParticleType ): void {
    const particle = new Particle( particleType.name.toLowerCase(), {
      maxZLayer: BANConstants.NUMBER_OF_NUCLEON_LAYERS - 1
    } );

    // place the particle the center of the particleAtom and add it to the model and particleAtom
    particle.setPositionAndDestination( this.model.particleAtom.positionProperty.value );
    this.model.addParticle( particle );
    this.model.particleAtom.addParticle( particle );
  }

  /**
   * Set the input enabled and visibility of a creator node.
   */
  private static setCreatorNodeVisibility( creatorNode: Node, visible: boolean ): void {
    if ( creatorNode.visible !== visible ) {
      creatorNode.visible = visible;
      creatorNode.inputEnabled = visible;
    }
  }

  /**
   * Create a particle of particleType at its creator node and send it (and add it) to the particleAtom.
   */
  public createParticleFromStack( particleType: ParticleType ): void {

    // create a particle at the center of its creator node
    const particle = new Particle( particleType.name.toLowerCase(), {
      maxZLayer: BANConstants.NUMBER_OF_NUCLEON_LAYERS - 1
    } );
    particle.animationVelocityProperty.value = BANConstants.PARTICLE_ANIMATION_SPEED;
    const origin = particleType === ParticleType.PROTON ?
                   this.protonsCreatorNodeModelCenter : this.neutronsCreatorNodeModelCenter;
    particle.setPositionAndDestination( origin );

    // send the particle the center of the particleAtom and add it to the model
    particle.destinationProperty.value = this.model.getParticleDestination( particleType, particle );
    this.model.addParticle( particle );

    // don't let the particle be clicked until it reaches the particleAtom
    const particleView = this.findParticleView( particle );
    particleView.inputEnabled = false;

    if ( particleType === ParticleType.PROTON ) {
      this.model.incomingProtons.push( particle );
    }
    else {
      this.model.incomingNeutrons.push( particle );
    }

    // add the particle to the particleAtom once it reaches the center of the particleAtom and allow it to be clicked
    particle.animationEndedEmitter.addListener( () => {
      if ( !this.model.particleAtom.containsParticle( particle ) ) {

        // must remove incoming particles before adding it to particleAtom so incoming count is accurate
        if ( particleType === ParticleType.PROTON ) {
          arrayRemove( this.model.incomingProtons, particle );
        }
        else {
          arrayRemove( this.model.incomingNeutrons, particle );
        }

        this.model.particleAtom.addParticle( particle );
        particleView.inputEnabled = true;
        particle.animationEndedEmitter.removeAllListeners();
      }
    } );
  }

  /**
   * Remove a particle of particleType from the particleAtom and send it back to its creator node.
   */
  public returnParticleToStack( particleType: ParticleType ): void {
    const creatorNodePosition = particleType === ParticleType.PROTON ?
                                this.protonsCreatorNodeModelCenter : this.neutronsCreatorNodeModelCenter;

    const particleToReturn = this.model.getParticleToReturn( particleType, creatorNodePosition );

    // remove the particle from the particleAtom and send it back to its creator node position
    this.model.particleAtom.removeParticle( particleToReturn );
    this.animateAndRemoveParticle( particleToReturn, creatorNodePosition );
  }

  /**
   * Animate particle to the given destination and then remove it.
   */
  public animateAndRemoveParticle( particle: Particle, destination?: Vector2 ): void {
    const particleView = this.findParticleView( particle );
    particleView.inputEnabled = false;

    if ( destination ) {
      particle.destinationProperty.value = destination;

      particle.animationEndedEmitter.addListener( () => {
        this.removeParticle( particle );
      } );
    }
    else {
      this.removeParticle( particle );
    }
  }

  /**
   * Remove the given particle from the model.
   */
  protected removeParticle( particle: Particle ): void {
    this.model.outgoingParticles.includes( particle ) && this.model.outgoingParticles.remove( particle );
    this.model.removeParticle( particle );
  }

  /**
   * Add a particle to the model and immediately start dragging it with the provided event.
   */
  public addAndDragParticle( event: PressListenerEvent, particle: Particle ): void {
    this.model.addParticle( particle );
    const particleView = this.findParticleView( particle );
    particleView.startSyntheticDrag( event );
  }

  public reset(): void {
    //TODO
  }

  /**
   * @param dt - time step, in seconds
   */
  public override step( dt: number ): void {
    const protonCount = this.model.particleAtom.protonCountProperty.value;
    const neutronCount = this.model.particleAtom.neutronCountProperty.value;

    if ( !this.model.doesNuclideExistBooleanProperty.value ) {
      this.timeSinceCountdownStarted += dt;
    }
    else {
      this.timeSinceCountdownStarted = 0;

      // keep track of the old values of protonCountProperty and neutronCountProperty to know which value increased
      this.previousProtonCount = protonCount;
      this.previousNeutronCount = neutronCount;
    }

    // show the nuclide that does not exist for one second, then return the necessary particles
    if ( this.timeSinceCountdownStarted >= BANConstants.TIME_TO_SHOW_DOES_NOT_EXIST ) {
      this.timeSinceCountdownStarted = 0;

      // TODO: change this because it is a bit hacky, uses a boolean property to keep track of if a double arrow button
      //  was clicked
      // a proton and neutron were added to create a nuclide that does not exist, so return a proton and neutron
      if ( this.model.doubleArrowButtonClickedBooleanProperty.value &&
           AtomIdentifier.doesPreviousNuclideExist( protonCount, neutronCount ) ) {
        this.returnParticleToStack( ParticleType.NEUTRON );
        this.returnParticleToStack( ParticleType.PROTON );
      }

      // the neutronCount increased to create a nuclide that does not exist, so return a neutron to the stack
      else if ( this.previousNeutronCount < neutronCount &&
                AtomIdentifier.doesPreviousIsotopeExist( protonCount, neutronCount ) ) {
        this.returnParticleToStack( ParticleType.NEUTRON );
      }

      // the protonCount increased to create a nuclide that does not exist, so return a proton to the stack
      else if ( this.previousProtonCount < protonCount &&
                AtomIdentifier.doesPreviousIsotoneExist( protonCount, neutronCount ) ) {
        this.returnParticleToStack( ParticleType.PROTON );
      }
    }
  }

  /**
   * Given a Particle, find our current display (ParticleView) of it.
   */
  public findParticleView( particle: Particle ): ParticleView {
    const particleView = this.particleViewMap[ particle.id ];
    assert && assert( particleView, 'Did not find matching ParticleView for type ' + particle.type + ' and id ' + particle.id );
    return particleView;
  }

  /**
   * Define the update function for the element name.
   */
  public static updateElementName( elementNameText: Text, protonCount: number, neutronCount: number,
                                   doesNuclideExist: boolean, centerX: number, centerY?: number ): void {
    let name = AtomIdentifier.getName( protonCount );
    const massNumber = protonCount + neutronCount;

    // show "{name} - {massNumber} does not form" in the elementName's place when a nuclide that does not exist on Earth is built
    if ( !doesNuclideExist && massNumber !== 0 ) {

      // no protons
      if ( name.length === 0 ) {
        name += massNumber.toString() + ' ' + BuildANucleusStrings.neutronsLowercase + ' ' + BuildANucleusStrings.doesNotForm;
      }
      else {
        name += ' - ' + massNumber.toString() + ' ' + BuildANucleusStrings.doesNotForm;
      }
    }

    // no protons
    else if ( name.length === 0 ) {

      // no neutrons
      if ( neutronCount === 0 ) {
        name = '';
      }

      // only one neutron
      else if ( neutronCount === 1 ) {
        name = neutronCount + ' ' + BuildANucleusStrings.neutronLowercase;
      }

      // multiple neutrons
      else {
        name = StringUtils.fillIn( BuildANucleusStrings.clusterOfNeutronsPattern, {
          neutronNumber: neutronCount
        } );
      }

    }
    else {
      name += ' - ' + massNumber.toString();
    }
    elementNameText.string = name;
    elementNameText.centerX = centerX;
    if ( centerY ) {
      elementNameText.centerY = centerY;
    }
  }

  /**
   * Define a function that will decide where to put nucleons.
   */
  protected dragEndedListener( nucleon: Particle, atom: ParticleAtom ): void {
    const particleCreatorNodeCenter = nucleon.type === ParticleType.PROTON.name.toLowerCase() ?
                                      this.protonsCreatorNode.center : this.neutronsCreatorNode.center;

    if ( this.isNucleonInCaptureArea( nucleon, atom ) ||

         // if removing the nucleon will create a nuclide that does not exist, re-add the nucleon to the atom
         ( ( this.model.particleAtom.protonCountProperty.value + this.model.particleAtom.neutronCountProperty.value ) !== 0 &&
           !AtomIdentifier.doesExist( this.model.particleAtom.protonCountProperty.value, this.model.particleAtom.neutronCountProperty.value )
         )
    ) {
      atom.addParticle( nucleon );
    }

    // only animate the removal of a nucleon if it was dragged out of the creator node
    else if ( nucleon.positionProperty.value.distance( particleCreatorNodeCenter ) > 10 ) {
      this.animateAndRemoveParticle( nucleon, particleCreatorNodeCenter.minus( this.particleViewPositionVector ) );
    }
  }

  protected isNucleonInCaptureArea( nucleon: Particle, atom: ParticleAtom ): boolean {
    // Please see subclass implementations
    return false;
  }

  protected addParticleView( particle: Particle ): void {
    this.particleAtomNode.addParticleView( particle );
  }
}

buildANucleus.register( 'BANScreenView', BANScreenView );
export default BANScreenView;
