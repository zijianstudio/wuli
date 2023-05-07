// Copyright 2017-2022, University of Colorado Boulder

/**
 * An edit button and readout for the associated term.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import ReadOnlyProperty from '../../../../axon/js/ReadOnlyProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import { Color, FireListener, FlowBox, Path, Rectangle, RichText } from '../../../../scenery/js/imports.js';
import editSolidShape from '../../../../sherpa/js/fontawesome-5/editSolidShape.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonConstants from '../../common/AreaModelCommonConstants.js';
import Term from '../../common/model/Term.js';
import AreaModelCommonColors from '../../common/view/AreaModelCommonColors.js';

class TermEditNode extends FlowBox {
  /**
   * @param {Property.<Orientation>} orientationProperty
   * @param {Property.<Term|null>} termProperty
   * @param {Object} [options]
   */
  constructor( orientationProperty, termProperty, options ) {
    assert && assert( orientationProperty instanceof ReadOnlyProperty );
    assert && assert( termProperty instanceof ReadOnlyProperty );

    options = merge( {
      // {Property.<Color>} - The color of the readout text
      textColorProperty: new Property( Color.BLACK ),

      // {Property.<Color>} - The color of the border around the readout
      borderColorProperty: new Property( Color.BLACK ),

      // {Property.<boolean>} - Whether this term is the one being edited right now
      isActiveProperty: new BooleanProperty( false ),

      // {Property.<number>} - How many digits are allowed to be used for this term
      digitCountProperty: new NumberProperty( 1 ),

      // {Property.<boolean>} - Whether exponents are allowed for this term
      allowExponentsProperty: new BooleanProperty( false ),

      // {function} - Called with no arguments when this term should start being edited
      editCallback: _.noop,

      // {Font}
      font: AreaModelCommonConstants.TERM_EDIT_READOUT_FONT
    }, options );


    const readoutText = new RichText( '', {
      fill: options.textColorProperty,
      font: options.font
    } );

    const readoutBackground = new Rectangle( {
      stroke: options.borderColorProperty,
      cornerRadius: 4,
      children: [
        readoutText
      ],
      // Allow clicking the readout to edit, see https://github.com/phetsims/area-model-common/issues/23
      cursor: 'pointer',
      inputListeners: [
        new FireListener( {
          fire: options.editCallback
        } )
      ]
    } );

    super( {
      orientation: orientationProperty.value.flowBoxOrientation,
      spacing: 4,
      children: [
        readoutBackground,
        new RectangularPushButton( {
          content: new Path( editSolidShape, {
            fill: 'black',
            scale: 0.03,
            xMargin: 6,
            yMargin: 4
          } ),
          listener: () => {
            options.editCallback();
          },
          baseColor: AreaModelCommonColors.editButtonBackgroundProperty
        } )
      ]
    } );
    orientationProperty.link( orientation => {
      this.orientation = orientation.flowBoxOrientation;
    } );

    options.isActiveProperty.link( isActive => {
      readoutBackground.fill = isActive
                               ? AreaModelCommonColors.editActiveBackgroundProperty
                               : AreaModelCommonColors.editInactiveBackgroundProperty;
    } );

    const updateText = () => {
      if ( termProperty.value === null ) {
        readoutText.string = '';
      }
      else {
        readoutText.string = termProperty.value.toRichString( false );
      }

      readoutText.center = readoutBackground.selfBounds.center;
      readoutBackground.touchArea = readoutBackground.parentToLocalBounds( this.localBounds ).dilated( 6 );
    };

    function updateDigits() {
      readoutText.string = Term.getLargestGenericString( options.allowExponentsProperty.value, options.digitCountProperty.value );
      readoutBackground.rectWidth = readoutText.width + 5;
      readoutBackground.rectHeight = readoutText.height + 5;
      updateText();
    }

    termProperty.lazyLink( updateText );
    options.digitCountProperty.lazyLink( updateDigits );
    options.allowExponentsProperty.lazyLink( updateDigits );
    orientationProperty.lazyLink( updateDigits );

    updateDigits();
  }
}

areaModelCommon.register( 'TermEditNode', TermEditNode );

export default TermEditNode;