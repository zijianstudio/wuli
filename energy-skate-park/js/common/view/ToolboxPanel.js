// Copyright 2019-2022, University of Colorado Boulder

/**
 * A panel that will contain icons for draggable tools that can be pulled into the view. Forwards drag events from the
 * icons to the tools in the view.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import MeasuringTapeNode from '../../../../scenery-phet/js/MeasuringTapeNode.js';
import Stopwatch from '../../../../scenery-phet/js/Stopwatch.js';
import StopwatchNode from '../../../../scenery-phet/js/StopwatchNode.js';
import { DragListener, HBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkConstants from '../EnergySkateParkConstants.js';

class ToolboxPanel extends Panel {

  /**
   * @param {EnergySkateParkModel} model
   * @param {EnergySkateParkScreenView} view
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( model, view, tandem, options ) {
    options = merge( {
      align: 'center',

      // smaller y margin to save space when used with very tall ControlPanels (like in the intro screen)
      yMargin: 2
    }, EnergySkateParkConstants.PANEL_OPTIONS, options );

    // create the icons
    const measuringTapeIcon = MeasuringTapeNode.createIcon( {
      cursor: 'pointer'
    } );

    const stopwatchIcon = new StopwatchNode( new Stopwatch( {
      isVisible: true,
      tandem: Tandem.OPT_OUT
    } ), {
      numberDisplayOptions: {
        textOptions: {
          maxWidth: 100
        }
      },
      tandem: Tandem.OPT_OUT
    } ).rasterized( {
      resolution: 5,
      imageOptions: {
        cursor: 'pointer',
        tandem: tandem.createTandem( 'timerIcon' )
      }
    } );

    measuringTapeIcon.setScaleMagnitude( 0.7 );
    stopwatchIcon.setScaleMagnitude( 0.4 );

    // align icons for panel
    const icons = new HBox( {
      children: [ stopwatchIcon, measuringTapeIcon ],
      align: 'center',
      spacing: 20,
      excludeInvisibleChildrenFromBounds: false
    } );

    super( icons, options );

    // create a forwarding listener for the MeasuringTapeNode DragListener
    measuringTapeIcon.addInputListener( DragListener.createForwardingListener( event => {
      if ( !model.measuringTapeVisibleProperty.get() ) {
        model.measuringTapeVisibleProperty.set( true );

        const modelPosition = view.modelViewTransform.viewToModelPosition( this.globalToParentPoint( event.pointer.point ) );
        model.measuringTapeBasePositionProperty.set( modelPosition );
        model.measuringTapeTipPositionProperty.set( modelPosition.plusXY( 1, 0 ) );

        view.measuringTapeNode.startBaseDrag( event );
      }
    } ) );

    // create a forwarding listener for the StopwatchNode DragListener
    stopwatchIcon.addInputListener( DragListener.createForwardingListener( event => {
      if ( !model.stopwatch.isVisibleProperty.get() ) {
        model.stopwatch.isVisibleProperty.value = true;

        const coordinate = this.globalToParentPoint( event.pointer.point ).minusXY(
          view.stopwatchNode.width / 2,
          view.stopwatchNode.height / 2
        );
        model.stopwatch.positionProperty.set( coordinate );
        view.stopwatchNode.dragListener.press( event, view.stopwatchNode );
      }
    } ) );

    ToolboxPanel.attachIconVisibilityListener( measuringTapeIcon, model.measuringTapeVisibleProperty );
    ToolboxPanel.attachIconVisibilityListener( stopwatchIcon, model.stopwatch.isVisibleProperty );
  }

  /**
   * Create and attach a listener that makes the icon visible/invisible while the tool is invisible/visible.
   * Reference to the DerivedProperty is not returned because there is no need to dispose of it. This listener
   * can be attached for the life of the sim.
   * @private
   *
   * @param {Node} icon
   * @param {BooleanProperty} visibleProperty
   */
  static attachIconVisibilityListener( icon, visibleProperty ) {
    const iconVisibleProperty = new DerivedProperty( [ visibleProperty ], visible => {
      return !visible;
    } );
    iconVisibleProperty.linkAttribute( icon, 'visible' );
  }
}

energySkatePark.register( 'ToolboxPanel', ToolboxPanel );
export default ToolboxPanel;