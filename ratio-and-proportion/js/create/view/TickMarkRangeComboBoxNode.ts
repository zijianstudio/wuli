// Copyright 2020-2023, University of Colorado Boulder

/**
 * A combo box that displays the possible ranges for the tick marks and labels. The design requirements for this
 * component state that when disabled, that the elements aren't shown (as they are a distraction to the pedagogy).
 * Instead, they are replaced with a solid horizontal line. To accomplish this, two ComboBoxes are created and then
 * swapped out. This ended up being easier and simpler than trying to add the ability to swap-out Nodes (and their PDOM
 * content) dynamically to a single ComboBox instance.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, HBoxOptions, HSeparator, Node, RichText } from '../../../../scenery/js/imports.js';
import ComboBox, { ComboBoxItem, ComboBoxOptions } from '../../../../sun/js/ComboBox.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ActivationUtterance from '../../../../utterance-queue/js/ActivationUtterance.js';
import TickMarkView from '../../common/view/TickMarkView.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RatioAndProportionStrings from '../../RatioAndProportionStrings.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Property from '../../../../axon/js/Property.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';

const TICK_MARK_RANGE_FONT = new PhetFont( 16 );
const RANGE_TEXT_OPTIONS = { font: TICK_MARK_RANGE_FONT, maxWidth: 90 };

type SelfOptions = EmptySelfOptions;

class TickMarkRangeComboBoxNode extends HBox {

  private enabledComboBox: ComboBox<number>;
  private disabledComboBox: ComboBox<true | number>;
  private tickMarkRangeMap: Record<number, TReadOnlyProperty<string>>;
  private tickMarkRangeProperty: Property<number>;

  public constructor( tickMarkRangeProperty: Property<number>, comboBoxParent: Node,
                      tickMarkViewProperty: EnumerationProperty<TickMarkView>, providedOptions?: HBoxOptions ) {

    const options = optionize<HBoxOptions, SelfOptions, HBoxOptions>()( {
      spacing: 10
    }, providedOptions );

    super( options );

    this.tickMarkRangeMap = {
      10: RatioAndProportionStrings.zeroToTenStringProperty,
      20: RatioAndProportionStrings.zeroToTwentyStringProperty,
      30: RatioAndProportionStrings.zeroToThirtyStringProperty
    };
    this.tickMarkRangeProperty = tickMarkRangeProperty;

    const items: ComboBoxItem<number>[] = [
      { value: 10, createNode: () => new RichText( this.tickMarkRangeMap[ 10 ], RANGE_TEXT_OPTIONS ), a11yName: RatioAndProportionStrings.zeroToTenStringProperty },
      { value: 20, createNode: () => new RichText( this.tickMarkRangeMap[ 20 ], RANGE_TEXT_OPTIONS ), a11yName: RatioAndProportionStrings.zeroToTwentyStringProperty },
      { value: 30, createNode: () => new RichText( this.tickMarkRangeMap[ 30 ], RANGE_TEXT_OPTIONS ), a11yName: RatioAndProportionStrings.zeroToThirtyStringProperty }
    ];

    const widestItem = Math.max( ...items.map( item => {
      const node = item.createNode( Tandem.OPT_OUT );
      const width = node.width;
      node.dispose();
      return width;
    } ) );

    const labelNode = new RichText( RatioAndProportionStrings.rangeStringProperty, RANGE_TEXT_OPTIONS );

    const comboBoxOptions: ComboBoxOptions = {
      helpText: RatioAndProportionStrings.a11y.create.tickMarkRangeHelpTextStringProperty,
      accessibleName: RatioAndProportionStrings.rangeStringProperty,
      maxWidth: 250, // empirically determined

      comboBoxVoicingNameResponsePattern: RatioAndProportionStrings.a11y.create.rangeLabelPatternStringProperty,
      comboBoxVoicingContextResponse: () => this.getContextResponse(),
      comboBoxVoicingHintResponse: RatioAndProportionStrings.a11y.create.tickMarkRangeHelpTextStringProperty,

      // phet-io
      tandem: Tandem.OPT_OUT
    };

    this.enabledComboBox = new ComboBox( tickMarkRangeProperty, items, comboBoxParent, comboBoxOptions );

    const value = true;

    // NOTE: The values are [ 10, true ]... so it's typed interestingly.
    this.disabledComboBox = new ComboBox<true | number>( new BooleanProperty( value ) as Property<true | number>, [
      {
        value: value,
        createNode: () => new HSeparator( { preferredWidth: widestItem, centerY: -5 } ),
        a11yName: RatioAndProportionStrings.a11y.tickMark.tickMarksHiddenStringProperty
      },
      items[ 0 ] // add this one to get the proper height of the text.
    ], new Node(), comboBoxOptions );

    // always disabled
    this.disabledComboBox.enabledProperty.value = false;

    // when not displaying the tick marks, show the "blank" line instead of the RichText.
    tickMarkViewProperty.link( tickMarkView => {
      this.children = tickMarkView === TickMarkView.NONE ? [ labelNode, this.disabledComboBox ] : [ labelNode, this.enabledComboBox ];
    } );

    const tickMarkRangeChangedUtterance = new ActivationUtterance();

    tickMarkRangeProperty.lazyLink( () => {
      tickMarkRangeChangedUtterance.alert = this.getContextResponse();
      this.alertDescriptionUtterance( tickMarkRangeChangedUtterance );
    } );
  }

  private getContextResponse(): string {
    // TODO: PatternStringProperty when time, https://github.com/phetsims/ratio-and-proportion/issues/499
    return StringUtils.fillIn( RatioAndProportionStrings.a11y.create.tickMarkRangeContextResponseStringProperty, {
      range: this.tickMarkRangeMap[ this.tickMarkRangeProperty.value ]
    } );
  }

  public hideListBox(): void {
    this.enabledComboBox.hideListBox();
    this.disabledComboBox.hideListBox();
  }
}

ratioAndProportion.register( 'TickMarkRangeComboBoxNode', TickMarkRangeComboBoxNode );
export default TickMarkRangeComboBoxNode;