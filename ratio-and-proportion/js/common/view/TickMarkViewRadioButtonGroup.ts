// Copyright 2020-2022, University of Colorado Boulder

/**
 * Radio button group for choosing what Tick Marks are visible in the ratio view.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import { ParallelDOM, Path, PathOptions } from '../../../../scenery/js/imports.js';
import eyeSlashSolidShape from '../../../../sherpa/js/fontawesome-5/eyeSlashSolidShape.js';
import ActivationUtterance from '../../../../utterance-queue/js/ActivationUtterance.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RatioAndProportionStrings from '../../RatioAndProportionStrings.js';
import TickMarkView from './TickMarkView.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import RectangularRadioButtonGroup, { RectangularRadioButtonGroupOptions } from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import Tandem from '../../../../tandem/js/Tandem.js';

// constants
const ICON_SCALE = 0.45;

class TickMarkViewRadioButtonGroup extends RectangularRadioButtonGroup<TickMarkView> {

  public constructor( tickMarkViewProperty: EnumerationProperty<TickMarkView>, providedOptions?: RectangularRadioButtonGroupOptions ) {

    const options = optionize<RectangularRadioButtonGroupOptions, EmptySelfOptions>()( {
      orientation: 'horizontal',
      radioButtonOptions: {
        baseColor: 'white',
        xMargin: 8,
        yMargin: 14
      },

      // pdom
      labelContent: RatioAndProportionStrings.a11y.tickMark.headingStringProperty,
      helpTextBehavior: ParallelDOM.HELP_TEXT_BEFORE_CONTENT
    }, providedOptions );

    const radioButtonItemData = [ {
      createNode: ( tandem: Tandem ) => new Path( eyeSlashSolidShape, { scale: 0.05, fill: 'black' } ),
      value: TickMarkView.NONE,

      interactiveDescriptionContextResponse: RatioAndProportionStrings.a11y.tickMark.tickMarksHiddenStringProperty,
      voicingContextResponse: RatioAndProportionStrings.a11y.tickMark.tickMarksHiddenStringProperty,

      // pdom
      labelContent: RatioAndProportionStrings.a11y.tickMark.showNoStringProperty,

      // phet-io
      tandemName: 'showNoRadioButton'
    }, {
      createNode: ( tandem: Tandem ) => new TickMarksIconPath(),
      value: TickMarkView.VISIBLE,

      interactiveDescriptionContextResponse: RatioAndProportionStrings.a11y.tickMark.tickMarksShownStringProperty,
      voicingContextResponse: RatioAndProportionStrings.a11y.tickMark.tickMarksShownStringProperty,

      // pdom
      labelContent: RatioAndProportionStrings.a11y.tickMark.showStringProperty,

      // phet-io
      tandemName: 'showRadioButton'
    }, {
      createNode: ( tandem: Tandem ) => new NumberedTickMarksIconPath(),
      value: TickMarkView.VISIBLE_WITH_UNITS,

      interactiveDescriptionContextResponse: RatioAndProportionStrings.a11y.tickMark.numberedTickMarksShownStringProperty,
      voicingContextResponse: RatioAndProportionStrings.a11y.tickMark.numberedTickMarksShownStringProperty,

      // pdom
      labelContent: RatioAndProportionStrings.a11y.tickMark.showNumberedStringProperty,

      // phet-io
      tandemName: 'showNumberedRadioButton'
    } ];
    super( tickMarkViewProperty, radioButtonItemData, options );

    const tickMarkContextResponseUtterance = new ActivationUtterance();
    tickMarkViewProperty.lazyLink( tickMarkView => {
      const currentRadioButtonItem = _.find( radioButtonItemData, item => item.value === tickMarkView )!;
      assert && assert( currentRadioButtonItem, 'radio button item expected' );

      // interactive description alert
      tickMarkContextResponseUtterance.alert = currentRadioButtonItem.interactiveDescriptionContextResponse;
      this.alertDescriptionUtterance( tickMarkContextResponseUtterance );
    } );
  }
}

class NumberedTickMarksIconPath extends Path {

  public constructor( providedOptions?: PathOptions ) {

    const options = optionize<PathOptions, EmptySelfOptions>()( {
      fill: 'black',
      scale: ICON_SCALE
    }, providedOptions );

    const shape = 'm60.25 69.833h34v5h-34zm-54.5 0h34v5h-34zm54.5-22.334h34v5h-34zm-54.5 0h34v5h-34zm54.5-22.198h34v5h-34zm-54.5 ' +
                  '0h34v5h-34zm46.985 54.939h-3.019v-11.376c-1.103 1.031-2.402 1.794-3.899 2.288v-2.739c0.788-0.258 1.644-0.747 ' +
                  '2.567-1.467s1.558-1.559 1.901-2.519h2.449v15.813zm2.471-25.138v2.804h-10.581c0.114-1.06 0.458-2.063 ' +
                  '1.031-3.013s1.704-2.208 3.395-3.776c1.36-1.268 2.195-2.127 2.503-2.578 0.415-0.623 0.623-1.239 0.623-1.848 ' +
                  '0-0.673-0.181-1.19-0.543-1.552-0.361-0.361-0.86-0.542-1.498-0.542-0.63 0-1.132 0.19-1.504 0.569-0.372 ' +
                  '0.38-0.587 1.01-0.645 1.891l-3.008-0.301c0.179-1.661 0.741-2.854 1.687-3.577 0.945-0.723 2.127-1.085 ' +
                  '3.545-1.085 1.554 0 2.775 0.419 3.663 1.257s1.332 1.88 1.332 3.126c0 0.709-0.127 1.384-0.381 2.025-0.255 ' +
                  '0.641-0.657 1.312-1.209 2.014-0.365 0.466-1.024 1.135-1.977 2.009-0.952 0.874-1.556 1.454-1.811 1.74-0.254 ' +
                  '0.287-0.46 0.566-0.617 0.838h5.995zm-10.303-23.708 2.922-0.354c0.093 0.745 0.344 1.314 0.752 1.708s0.902 ' +
                  '0.591 1.482 0.591c0.623 0 1.147-0.236 1.573-0.709 0.427-0.473 0.64-1.11 0.64-1.912 ' +
                  '0-0.759-0.204-1.36-0.612-1.805-0.408-0.444-0.906-0.666-1.493-0.666-0.387 ' +
                  '0-0.849 0.075-1.386 0.226l0.333-2.46c0.816 0.021 1.439-0.156 1.869-0.532s0.645-0.875 ' +
                  '0.645-1.499c0-0.53-0.157-0.952-0.473-1.268-0.315-0.315-0.734-0.473-1.257-0.473-0.516 0-0.956 0.179-1.321 0.537s-0.587 0.881-0.666 ' +
                  '1.568l-2.782-0.473c0.193-0.952 0.485-1.713 0.875-2.283 0.391-0.569 0.936-1.017 1.633-1.343 0.699-0.326 1.481-0.489 2.348-0.489 1.482 ' +
                  '0 2.671 0.473 3.566 1.418 0.737 0.773 1.106 1.647 1.106 2.621 0 1.382-0.756 2.485-2.267 3.309 0.902 0.193 1.624 0.627 2.164 1.3 0.541 ' +
                  '0.673 0.812 1.486 0.812 2.438 0 1.382-0.505 2.561-1.515 3.534-1.01 0.974-2.267 1.461-3.771 1.461-1.425 ' +
                  '0-2.606-0.41-3.545-1.23-0.937-0.817-1.481-1.89-1.632-3.215z';

    super( shape, options );
  }
}

class TickMarksIconPath extends Path {

  public constructor( providedOptions?: PathOptions ) {

    const options = optionize<PathOptions, EmptySelfOptions>()( {
      fill: 'black',
      scale: ICON_SCALE
    }, providedOptions );

    const shape = 'm5.25 25.166v5h89v-5zm0 22.334v5h89v-5zm0.5 22.332v5h89v-5z';

    super( shape, options );
  }
}

ratioAndProportion.register( 'TickMarkViewRadioButtonGroup', TickMarkViewRadioButtonGroup );
export default TickMarkViewRadioButtonGroup;