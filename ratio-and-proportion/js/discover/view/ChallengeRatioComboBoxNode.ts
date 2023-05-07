// Copyright 2020-2023, University of Colorado Boulder

/**
 * This composes a ComboBox to provide a separate PDOM Node as a heading
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import ComboBox, { ComboBoxItem } from '../../../../sun/js/ComboBox.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import selectionArpeggio001_mp3 from '../../../../tambo/sounds/selectionArpeggio001_mp3.js';
import selectionArpeggio004_mp3 from '../../../../tambo/sounds/selectionArpeggio004_mp3.js';
import selectionArpeggio006_mp3 from '../../../../tambo/sounds/selectionArpeggio006_mp3.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import RAPColors from '../../common/view/RAPColors.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import RatioAndProportionStrings from '../../RatioAndProportionStrings.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import RatioDescriber from '../../common/view/describers/RatioDescriber.js';
import Property from '../../../../axon/js/Property.js';
import { Color, HBox, Node, NodeOptions, Rectangle, RichText } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';

const SOUND_CLIP_OPTIONS = {
  initialOutputLevel: 0.4
};

// Challenge info needed by ChallengeRatioComboBoxNode
type ChallengeInfo = {
  capitalizedStringProperty: TReadOnlyProperty<string>;
  lowercaseStringProperty: TReadOnlyProperty<string>;
  color: Color;
  soundClip: SoundClip;
  a11yNameStringProperty: TReadOnlyProperty<string>;
  tandemName: string;
};

export type RatioToChallengeInfoMap = Map<number, ChallengeInfo>;

class ChallengeRatioComboBoxNode extends Node {

  // Used to get the names of challenges based on the target ratio, NOTE: lowercase strings are only available in the PDOM (not yet i18n)
  public readonly ratioToChallengeInfoMap: RatioToChallengeInfoMap;
  private readonly comboBox: ComboBox<number>;

  /**
   * @param targetRatioProperty
   * @param ratioDescriber
   * @param colorProperty
   * @param comboBoxListParent
   * @param comboBoxTandem - Passed directly to comboBox; keep out of options to prevent instrumenting this intermediate Node.
   * @param [options]
   */
  public constructor( targetRatioProperty: NumberProperty,
                      ratioDescriber: RatioDescriber,
                      colorProperty: Property<Color>,
                      comboBoxListParent: Node,
                      comboBoxTandem: Tandem,
                      options?: StrictOmit<NodeOptions, 'children'> ) {

    super( options );

    this.ratioToChallengeInfoMap = new Map<number, ChallengeInfo>();
    this.ratioToChallengeInfoMap.set( 1 / 2, {
      capitalizedStringProperty: RatioAndProportionStrings.challenge1StringProperty,
      lowercaseStringProperty: RatioAndProportionStrings.a11y.discover.challenge1LowercaseStringProperty,
      color: RAPColors.discoverChallenge1Property.value,
      soundClip: new SoundClip( selectionArpeggio001_mp3, SOUND_CLIP_OPTIONS ),
      a11yNameStringProperty: RatioAndProportionStrings.challenge1StringProperty,
      tandemName: `challenge1${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
    } );
    this.ratioToChallengeInfoMap.set( 1 / 3, {
      capitalizedStringProperty: RatioAndProportionStrings.challenge2StringProperty,
      lowercaseStringProperty: RatioAndProportionStrings.a11y.discover.challenge2LowercaseStringProperty,
      color: RAPColors.discoverChallenge2Property.value,
      soundClip: new SoundClip( selectionArpeggio004_mp3, SOUND_CLIP_OPTIONS ),
      a11yNameStringProperty: RatioAndProportionStrings.challenge2StringProperty,
      tandemName: `challenge2${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
    } );
    this.ratioToChallengeInfoMap.set( 3 / 4, {
      capitalizedStringProperty: RatioAndProportionStrings.challenge3StringProperty,
      lowercaseStringProperty: RatioAndProportionStrings.a11y.discover.challenge3LowercaseStringProperty,
      color: RAPColors.discoverChallenge3Property.value,
      soundClip: new SoundClip( selectionArpeggio006_mp3, SOUND_CLIP_OPTIONS ),
      a11yNameStringProperty: RatioAndProportionStrings.challenge3StringProperty,
      tandemName: `challenge3${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
    } );

    // Add each soundClip to the soundManager.
    for ( const value of this.ratioToChallengeInfoMap.values() ) {
      soundManager.addSoundGenerator( value.soundClip );
    }

    // Set colorProperty to match targetRatioProperty.
    targetRatioProperty.link( targetRatio => {
      const entry = this.ratioToChallengeInfoMap.get( targetRatio );
      assert && assert( entry, `no map entry for targetRatio=${targetRatio}` );
      colorProperty.value = entry!.color;
    } );

    const comboBoxHeading = new Node( {
      innerContent: RatioAndProportionStrings.challengeRatioStringProperty,
      tagName: 'h3'
    } );

    const comboBoxItems: ComboBoxItem<number>[] = [];
    for ( const [ key, value ] of this.ratioToChallengeInfoMap.entries() ) {
      comboBoxItems.push( createComboBoxItem( key, value ) );
    }

    this.comboBox = new ComboBox( targetRatioProperty, comboBoxItems, comboBoxListParent, {
      helpText: RatioAndProportionStrings.a11y.discover.challengesHelpTextStringProperty,
      comboBoxVoicingHintResponse: RatioAndProportionStrings.a11y.discover.challengesHelpTextStringProperty,
      comboBoxVoicingContextResponse: () => ratioDescriber.getProximityToNewChallengeRatioSentence(),
      maxWidth: 250, // empirically determined

      // phet-io
      tandem: comboBoxTandem
    } );

    const proximityToRatioUtterance = new Utterance();
    targetRatioProperty.lazyLink( () => {
      proximityToRatioUtterance.alert = ratioDescriber.getProximityToNewChallengeRatioSentence();
      this.alertDescriptionUtterance( proximityToRatioUtterance );
    } );

    this.children = [
      comboBoxHeading,
      this.comboBox
    ];

    this.pdomOrder = [ comboBoxHeading, this.comboBox ];
  }

  public hideListBox(): void {
    this.comboBox.hideListBox();
  }
}

function createComboBoxItem( targetRatio: number, challengeInfo: ChallengeInfo ): ComboBoxItem<number> {

  const node = new HBox( {
    spacing: 8,
    children: [
      new Rectangle( 0, 0, 15, 15, { fill: challengeInfo.color } ),
      new RichText( challengeInfo.capitalizedStringProperty ) ]
  } );

  return {
    value: targetRatio,
    createNode: tandem => node,
    soundPlayer: challengeInfo.soundClip,
    a11yName: challengeInfo.a11yNameStringProperty,
    tandemName: challengeInfo.tandemName
  };
}

ratioAndProportion.register( 'ChallengeRatioComboBoxNode', ChallengeRatioComboBoxNode );
export default ChallengeRatioComboBoxNode;