// Copyright 2019-2022, University of Colorado Boulder

/**
 * A circle that becomes visible and is positioned under the inspected skater sample to indicate
 * that the user is inspecting that point.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import { Circle } from '../../../../scenery/js/imports.js';
import EnergySkateParkColorScheme from '../../common/view/EnergySkateParkColorScheme.js';
import energySkatePark from '../../energySkatePark.js';

// constants
const HALO_RADIUS = 9;

class InspectedSampleHaloNode extends Circle {

  /**
   * @param {ObservableArrayDef.<EnergySkateParkDataSample>} dataSamples
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor( dataSamples, modelViewTransform ) {
    super( HALO_RADIUS, {
      fill: EnergySkateParkColorScheme.haloFill,

      // not visible until a EnergySkateParkDataSample becomes inspected
      visible: false
    } );

    // Whenever a new sample is added, adds a listener to make the halo visible when a sample
    // is inspected and puts it in the correct position. Removes the listeners on item removal
    // for memory management
    const sampleAddedListener = addedSample => {

      // handles visibility and positioning
      const inspectedListener = inspected => {
        this.visible = inspected;
        if ( inspected ) {
          this.visible = true;
          this.center = modelViewTransform.modelToViewPosition( addedSample.position );
        }
      };

      // linked lazily, we don't want to change visibility when a new sample is added
      addedSample.inspectedProperty.lazyLink( inspectedListener );

      // handles memory management
      const sampleRemovedListener = removedSample => {
        if ( addedSample === removedSample ) {

          // if inspected sample is being removed, halo should become invisible
          if ( removedSample.inspectedProperty.get() ) {
            this.visible = false;
          }

          removedSample.inspectedProperty.unlink( inspectedListener );
          dataSamples.removeItemRemovedListener( sampleRemovedListener );
        }
      };
      dataSamples.addItemRemovedListener( sampleRemovedListener );
    };

    dataSamples.addItemAddedListener( sampleAddedListener );
  }
}

energySkatePark.register( 'InspectedSampleHaloNode', InspectedSampleHaloNode );
export default InspectedSampleHaloNode;