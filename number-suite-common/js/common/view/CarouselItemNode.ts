// Copyright 2023, University of Colorado Boulder

/**
 * Class for named items of a Carousel. Text is wrapped in a Rectangle for highlighting and input listeners.
 *
 * TODO: Consider moving to joist and generalizing further, see https://github.com/phetsims/joist/issues/908.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import TProperty from '../../../../axon/js/TProperty.js';
import PreferencesDialog from '../../../../joist/js/preferences/PreferencesDialog.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import { Color, FireListener, HighlightOverlay, Rectangle, Text } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';

const WIDTH = 200;
const PADDING = 5;

export default class CarouselItemNode<T> extends Rectangle {

  private readonly disposeSelectionNode: () => void;

  public constructor( property: TProperty<T | null>,
                      value: T,
                      name: string,
                      devName: string,
                      callback: () => void
  ) {

    // Include the locale code when running with ?dev.
    const string = phet.chipper.queryParameters.dev ? `${name} (${devName})` : name;

    const text = new Text( string, {
      font: PreferencesDialog.CONTENT_FONT,
      maxWidth: WIDTH - PADDING * 2
    } );

    super( {
      rectWidth: WIDTH,
      rectHeight: text.bounds.height + PADDING * 2,
      cursor: 'pointer',

      // So that the item is tab-navigable and can be activated with the FireListener
      tagName: 'button'
    } );
    text.center = this.center;
    this.addChild( text );

    const fireListener = new FireListener( {
      fire: () => {
        callback();
      },

      // Preferences components are not instrumented, see https://github.com/phetsims/joist/issues/744
      tandem: Tandem.OPT_OUT
    } );
    this.addInputListener( fireListener );

    // Will be unlinked with FireListener disposal
    fireListener.isOverProperty.link( isOver => {

      // makes the mouse interactive, keep the same dimensions so the layout will not change
      this.stroke = isOver ? HighlightOverlay.getInnerGroupHighlightColor() : Color.TRANSPARENT;
    } );

    const listener = ( selection: T | null ) => {

      // identifies the selected locale
      this.fill = selection === value ? PhetColorScheme.PHET_LOGO_BLUE : null;
    };
    property.link( listener );

    this.disposeSelectionNode = () => {
      text.dispose();
      property.unlink( listener );
      this.removeInputListener( fireListener );
      fireListener.dispose();
    };
  }

  public override dispose(): void {
    this.disposeSelectionNode();
    super.dispose();
  }
}

numberSuiteCommon.register( 'CarouselItemNode', CarouselItemNode );