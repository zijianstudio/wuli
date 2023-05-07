// Copyright 2016-2022, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * One scene for the black box screen, which focuses on a single black box and deals with the contents of the
 * black box when the mode changes between investigate and build.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Battery from '../../../../circuit-construction-kit-common/js/model/Battery.js';
import CircuitConstructionKitModel from '../../../../circuit-construction-kit-common/js/model/CircuitConstructionKitModel.js';
import CircuitStruct from '../../../../circuit-construction-kit-common/js/model/CircuitStruct.js';
import LightBulb from '../../../../circuit-construction-kit-common/js/model/LightBulb.js';
import Resistor from '../../../../circuit-construction-kit-common/js/model/Resistor.js';
import Switch from '../../../../circuit-construction-kit-common/js/model/Switch.js';
import Wire from '../../../../circuit-construction-kit-common/js/model/Wire.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import circuitConstructionKitBlackBoxStudy from '../../circuitConstructionKitBlackBoxStudy.js';

class BlackBoxSceneModel extends CircuitConstructionKitModel {

  /**
   * @param {Object} trueBlackBoxCircuitObject - plain object for the circuit inside the black box (the true one, not the user-created one)
   * @param {Tandem} tandem
   */
  constructor( trueBlackBoxCircuitObject, tandem ) {
    super( true, false, tandem, {
      revealing: false,
      blackBoxStudy: true
    } );
    const trueBlackBoxCircuitStruct = CircuitStruct.fromStateObject( this.circuit, trueBlackBoxCircuitObject, this.circuit.wireResistivityProperty, tandem.createTandem( 'circuitStruct' ), {

      // All of the circuit elements in the true black box should be non-interactive
      interactive: false,
      insideTrueBlackBox: true
    } );

    assert && assert( trueBlackBoxCircuitStruct instanceof CircuitStruct, 'circuit should be CircuitStruct' );

    // When loading a black box circuit, none of the vertices should be draggable
    // TODO: Fix this in the saved/loaded data structures, not here as a post-hoc patch.
    for ( let i = 0; i < trueBlackBoxCircuitStruct.vertices.length; i++ ) {
      trueBlackBoxCircuitStruct.vertices[ i ].draggableProperty.set( false );

      if ( trueBlackBoxCircuitStruct.vertices[ i ].attachableProperty.get() ) {
        trueBlackBoxCircuitStruct.vertices[ i ].blackBoxInterfaceProperty.set( true );
      }
      else {
        trueBlackBoxCircuitStruct.vertices[ i ].insideTrueBlackBoxProperty.set( true );
      }
    }

    // @public - true if the user has created a circuit for comparison with the black box (1+ terminal connected)
    this.isRevealEnabledProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isRevealEnabledProperty' )
    } );

    // @public - or syntax highlighting and navigation only
    this.circuit = this.circuit || null;

    // When reveal is pressed, true black box circuit should be shown instead of the user-created circuit
    this.revealingProperty.lazyLink( revealing => this.modeProperty.set( revealing ? 'explore' : 'test' ) );

    // Keep track of what the user has built inside the black box so it may be restored.
    const userBlackBoxCircuitStruct = new CircuitStruct();
    const circuit = this.circuit;

    // Add wire stubs outside the black box, see https://github.com/phetsims/circuit-construction-kit-black-box-study/issues/21
    const addWireStubs = () => {
      for ( let i = 0; i < trueBlackBoxCircuitStruct.vertices.length; i++ ) {
        const vertex = trueBlackBoxCircuitStruct.vertices[ i ];
        if ( vertex.blackBoxInterfaceProperty.get() ) {
          vertex.blackBoxInterfaceProperty.set( false );

          // the center of the black box is approximately (508, 305).  Point the wires away from the box.
          const side = vertex.positionProperty.value.x < 400 ? 'left' :
                       vertex.positionProperty.value.x > 600 ? 'right' :
                       vertex.positionProperty.value.y < 200 ? 'top' :
                       'bottom';

          const extentLength = 40;

          const dx = side === 'left' ? -extentLength :
                     side === 'right' ? +extentLength :
                     0;
          const dy = side === 'top' ? -extentLength :
                     side === 'bottom' ? +extentLength :
                     0;
          const outerVertex = this.circuit.vertexGroup.createNextElement( new Vector2( vertex.positionProperty.value.x + dx, vertex.positionProperty.value.y + dy ) );
          // const outerVertex = new Vertex( new Vector2( vertex.positionProperty.value.x + dx, vertex.positionProperty.value.y + dy ) );
          // outerVertex.attachable = true;
          outerVertex.blackBoxInterfaceProperty.set( true );
          outerVertex.draggableProperty.set( false );
          outerVertex.outerWireStub = true;
          vertex.blackBoxInterfaceProperty.set( true );

          const w = new Wire( vertex, outerVertex, this.circuit.wireResistivityProperty, Tandem.OPT_OUT, {
            wireStub: true,
            interactive: false
          } );
          circuit.circuitElements.push( w );
        }
      }
    };

    addWireStubs();

    /**
     * Check whether the user built (at least part of) their own black box circuit, which enables the reveal button.
     * @returns {boolean}
     */
    const userBuiltSomething = () => {
      let count = 0;
      circuit.circuitElements.forEach( element => {
        const isConnectedToBlackBoxInterface = element.startVertexProperty.get().blackBoxInterfaceProperty.get() || element.endVertexProperty.get().blackBoxInterfaceProperty.get();
        if ( element.interactiveProperty.get() && isConnectedToBlackBoxInterface ) {
          count++;
        }
      } );
      return count > 0;
    };

    // Enable the reveal button if the user has done something in build mode.
    circuit.circuitChangedEmitter.addListener( () => {
      const builtSomething = this.modeProperty.get() === 'test' && userBuiltSomething();
      this.isRevealEnabledProperty.set( this.revealingProperty.get() || builtSomething );
    } );

    /**
     * Remove the true black box contents or user-created black box contents
     * @param {CircuitStruct} blackBoxCircuit
     */
    const removeBlackBoxContents = blackBoxCircuit => {
      // circuit.circuitElements.removeAll( blackBoxCircuit.wires );
      // circuit.circuitElements.removeAll( blackBoxCircuit.lightBulbs );
      // circuit.circuitElements.removeAll( blackBoxCircuit.resistors );
      // circuit.circuitElements.removeAll( blackBoxCircuit.batteries );

      // Remove the vertices but not those on the black box interface
      // for ( const i = 0; i < blackBoxCircuit.vertices.length; i++ ) {
      //   const vertex = blackBoxCircuit.vertexGroup.getElement(i);
      //   if ( !vertex.blackBoxInterfaceProperty.get() ) {
      //     circuit.vertices.remove( vertex );
      //   }
      // }
    };

    /**
     * Add the true black box contents or user-created black box contents
     * @param {CircuitStruct} blackBoxCircuit
     */
    const addBlackBoxContents = blackBoxCircuit => {

      // circuit.circuitElements.addAll( blackBoxCircuit.wires );
      // circuit.circuitElements.addAll( blackBoxCircuit.resistors );
      // circuit.circuitElements.addAll( blackBoxCircuit.batteries );
      // circuit.circuitElements.addAll( blackBoxCircuit.lightBulbs );
      //
      // blackBoxCircuit.circuitElements.forEach( function( circuitElement ) {
      //   circuitElement.moveToFrontEmitter.emit();
      // } );
    };

    // Logic for changing the contents of the black box when the mode changes
    // TODO: All of this logic must be re-read and re-evaluated.
    this.modeProperty.link( mode => {

      // When switching to InteractionMode.TEST mode, remove all of the black box circuitry and vice-versa
      if ( mode === 'test' ) {

        removeBlackBoxContents( trueBlackBoxCircuitStruct );

        // Any draggable vertices that remain should be made unattachable and undraggable, so the user cannot update the
        // circuit outside the box
        circuit.vertexGroup.forEach( vertex => {
          if ( !vertex.blackBoxInterfaceProperty.get() ) {
            vertex.attachableProperty.set( false );
            vertex.draggableProperty.set( false );
            vertex.interactiveProperty.set( false );
          }
        } );
        circuit.circuitElements.forEach( circuitElement => circuitElement.interactiveProperty.set( false ) );
        addBlackBoxContents( userBlackBoxCircuitStruct );
      }
      else {

        // Switched to InteractionMode.EXPLORE. Move interior elements to userBlackBoxCircuit
        userBlackBoxCircuitStruct.clear();
        circuit.vertexGroup.forEach( v => {
          if ( v.interactiveProperty.get() && v.draggableProperty.get() ) {
            userBlackBoxCircuitStruct.vertices.push( v );
          }
        } );
        circuit.circuitElements.forEach( circuitElement => {
          if ( circuitElement.interactiveProperty.get() ) {

            // TODO: abstraction
            if ( circuitElement instanceof Wire ) {
              userBlackBoxCircuitStruct.wires.push( circuitElement );
            }
            else if ( circuitElement instanceof Battery ) {
              userBlackBoxCircuitStruct.batteries.push( circuitElement );
            }
            else if ( circuitElement instanceof LightBulb ) {
              userBlackBoxCircuitStruct.lightBulbs.push( circuitElement );
            }
            else if ( circuitElement instanceof Resistor ) {
              userBlackBoxCircuitStruct.resistors.push( circuitElement );
            }
            else if ( circuitElement instanceof Switch ) {
              userBlackBoxCircuitStruct.switches.push( circuitElement );
            }
          }
        } );
        removeBlackBoxContents( userBlackBoxCircuitStruct );

        // Any attachable vertices outside the box should become attachable and draggable
        circuit.vertexGroup.forEach( vertex => {
          if ( !vertex.blackBoxInterfaceProperty.get() ) {
            vertex.draggableProperty.set( true );
            vertex.attachableProperty.set( true );
            vertex.interactiveProperty.set( true );
          }
        } );
        circuit.circuitElements.forEach( circuitElement => {
          if ( circuitElement.wireStub === true ) {
            // no nop, wire stubs remain non-interactive
          }
          else {
            circuitElement.interactiveProperty.set( true );
          }
        } );

        addBlackBoxContents( trueBlackBoxCircuitStruct );
      }
      circuit.markDirty();
    } );

    // @private - called by reset
    this.resetBlackBoxSceneModel = () => {
      addWireStubs();
      addBlackBoxContents( trueBlackBoxCircuitStruct );
      userBlackBoxCircuitStruct.clear();
    };
  }

  /**
   * Reset the model.
   * @overrides
   * @public
   */
  reset() {
    super.reset();
    this.revealingProperty.reset();
    this.isRevealEnabledProperty.reset();
    this.resetBlackBoxSceneModel();
  }
}

circuitConstructionKitBlackBoxStudy.register( 'BlackBoxSceneModel', BlackBoxSceneModel );
export default BlackBoxSceneModel;