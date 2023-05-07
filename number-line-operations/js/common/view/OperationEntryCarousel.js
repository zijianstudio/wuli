// Copyright 2020-2023, University of Colorado Boulder

/**
 * OperationEntryCarousel is a carousel and page control that contains controls used for entering operations on to a
 * number line.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import merge from '../../../../phet-core/js/merge.js';
import { Color, Node } from '../../../../scenery/js/imports.js';
import Carousel from '../../../../sun/js/Carousel.js';
import PageControl from '../../../../sun/js/PageControl.js';
import numberLineOperations from '../../numberLineOperations.js';
import OperationEntryControl from './OperationEntryControl.js';

// constants
const DEFAULT_THEME_COLOR = new Color( 153, 206, 255 );
const PageControlPosition = EnumerationDeprecated.byKeys( [ 'ABOVE', 'BELOW' ] );

class OperationEntryCarousel extends Node {

  /**
   * @param {OperationTrackingNumberLine} numberLine
   * @param {Object} [options]
   */
  constructor( numberLine, options ) {

    // Get the theme color defined before working on the other options, since there are some dependencies here.
    options = merge( { themeColor: DEFAULT_THEME_COLOR }, options );

    // Define the rest of the options.
    options = merge( {
      entryControl1Options: {
        buttonBaseColor: options.themeColor
      },
      entryControl2Options: {
        buttonBaseColor: options.themeColor
      },
      pageControlPosition: PageControlPosition.BELOW
    }, options );

    // @private {OperationEntryControl[]} - operation entry controls
    const operationEntryControls = [ {
      createNode: tandem => new OperationEntryControl(
        numberLine.operations[ 0 ],
        options.entryControl1Options
      )
    }, {
      createNode: tandem => new OperationEntryControl(
        numberLine.operations[ 1 ],
        options.entryControl2Options
      )
    } ];

    // carousel in which the operation entry controls reside
    const carousel = new Carousel( operationEntryControls, {
      orientation: 'horizontal',
      itemsPerPage: 1,
      margin: 10,
      fill: new Color( 255, 255, 255, 0.5 ),
      stroke: options.themeColor,
      buttonOptions: {
        baseColor: options.themeColor,
        stroke: new Color( 255, 255, 255, 0.1 ),
        disabledColor: new Color( 255, 255, 255, 0.1 )
      }
    } );

    // page indicator
    const pageControl = new PageControl( carousel.pageNumberProperty, carousel.numberOfPagesProperty, {
      orientation: 'horizontal',
      interactive: true,
      centerX: carousel.centerX
    } );
    if ( options.pageControlPosition === PageControlPosition.BELOW ) {
      pageControl.top = carousel.bottom + 10;
    }
    else {
      pageControl.bottom = carousel.top - 10;
    }

    super(
      merge(
        {
          children: [ carousel, pageControl ],
          stroke: options.themeColor,
          buttonColor: options.themeColor
        },
        options )
    );

    // @public {NumberProperty} (read-only) - make the page number visible to outside observers
    this.selectedPageProperty = carousel.pageNumberProperty;

    // @private - make these into properties so that they can be reset
    this.operationEntryControls = operationEntryControls;
    this.carousel = carousel;

    // @private - make this available so that it can be used in a method
    this.numberLine = numberLine;
  }

  /**
   * Make sure that the operation with the provided endpoint is the one that is being shown in the carousel.
   * @param {NumberLinePoint} endpoint
   * @public
   */
  showOperationWithEndpoint( endpoint ) {
    const endpointIndex = this.numberLine.endpoints.indexOf( endpoint );
    if ( endpointIndex >= 0 ) {
      this.selectedPageProperty.set( endpointIndex );
    }
  }

  /**
   * Restore initial state.
   * @public
   */
  reset() {
    this.carousel.pageNumberProperty.reset();
    this.operationEntryControls.forEach( control => this.carousel.getNodeForItem( control ).reset() );
  }
}

// statics
OperationEntryCarousel.PageControlPosition = PageControlPosition;

numberLineOperations.register( 'OperationEntryCarousel', OperationEntryCarousel );
export default OperationEntryCarousel;