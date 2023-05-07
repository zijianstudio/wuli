// Copyright 2023, University of Colorado Boulder

/**
 * LanguageAndVoiceControl contains two carousels: one for selecting a language, and one for selecting a voice. For use
 * in the Preferences dialog.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import numberSuiteCommon from '../../numberSuiteCommon.js';
import { Color, HBox, HBoxOptions, ManualConstraint, Node, RichText, RichTextOptions, Text, TextOptions, VBox } from '../../../../scenery/js/imports.js';
import optionize, { combineOptions, EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import { Locale } from '../../../../joist/js/i18n/localeProperty.js';
import Property from '../../../../axon/js/Property.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Carousel, { CarouselItem, CarouselOptions } from '../../../../sun/js/Carousel.js';
import TProperty from '../../../../axon/js/TProperty.js';
import CarouselItemNode from './CarouselItemNode.js';
import NumberSuiteCommonStrings from '../../NumberSuiteCommonStrings.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NumberSuiteCommonUtteranceQueue from './NumberSuiteCommonUtteranceQueue.js';
import Multilink from '../../../../axon/js/Multilink.js';
import PageControl from '../../../../sun/js/PageControl.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';

const LABEL_TEXT_OPTIONS = {
  fontWeight: 'bold',
  fontSize: 16
};
const CAROUSEL_OPTIONS: CarouselOptions = {
  itemsPerPage: 10,
  spacing: 6,
  margin: 5,
  orientation: 'vertical'
};
const LABEL_Y_SPACING = 10;

type SelfOptions = EmptySelfOptions;
type LanguageAndVoiceControlOptions = SelfOptions & StrictOmit<HBoxOptions, 'children'>;

type LanguageCarouselItem = { locale: Locale } & CarouselItem;
type VoiceCarouselItem = { voice: SpeechSynthesisVoice } & CarouselItem;

export default class LanguageAndVoiceControl extends HBox {

  public constructor( localeProperty: Property<Locale>,
                      voiceProperty: TProperty<SpeechSynthesisVoice | null>,
                      utteranceQueue: NumberSuiteCommonUtteranceQueue,
                      providedOptions?: LanguageAndVoiceControlOptions ) {

    const options = optionize<LanguageAndVoiceControlOptions, SelfOptions, HBoxOptions>()( {

      // HBoxOptions
      excludeInvisibleChildrenFromBounds: false,
      align: 'top',
      justify: 'left',
      spacing: 10
    }, providedOptions );

    // Carousel for choosing a language.
    const languageCarouselItems: LanguageCarouselItem[] = localeProperty.validValues!.map(
      locale => {
        return {
          locale: locale,
          createNode: () => new CarouselItemNode(
            localeProperty,
            locale,
            StringUtils.localeToLocalizedName( locale ),
            `${locale}`, () => {
              localeProperty.value = locale;

              // Cancel any speech being read out that came from changing the locale, see https://github.com/phetsims/number-suite-common/issues/56#issuecomment-1480063879
              utteranceQueue.cancelSpeechDataSpeaking();

              // Read the test string in the first available voice for the new language, see https://github.com/phetsims/number-suite-common/issues/56
              utteranceQueue.speakTestVoice( voiceProperty.value, locale );
            }
          )
        };
      } );
    const languageCarousel = new Carousel( languageCarouselItems, CAROUSEL_OPTIONS );

    // Scroll the carousel so that the initial selection is shown. See https://github.com/phetsims/number-suite-common/issues/38
    const selectedNode = _.find( languageCarouselItems, item => item.locale === localeProperty.value )!;
    assert && assert( selectedNode );
    languageCarousel.scrollToItem( selectedNode );

    // Record the width of the language carousel for use to ensure the voice column matches. Width of the carousel
    // is dependent and controlled by the size of its content (see CarouselItemNode), use that width to ensure consistent
    // layout and content.
    const languageCarouselWidth = languageCarousel.width;

    const textOptions = combineOptions<TextOptions>( { maxWidth: languageCarouselWidth }, LABEL_TEXT_OPTIONS );

    const languageCarouselLabel = new Text( NumberSuiteCommonStrings.languageTitleStringProperty, textOptions );

    // Carousel for choosing a voice. Recreated when the language changes.
    let voiceCarousel: Node | Carousel = new Node();
    const voiceCarouselLabel = new Text( NumberSuiteCommonStrings.voiceStringProperty, textOptions );
    const noVoiceDescriptionNode = new NoVoiceDescriptionNode( languageCarouselWidth, languageCarousel.height );

    const pageControl = new PageControl( languageCarousel.pageNumberProperty, languageCarousel.numberOfPagesProperty, {
      orientation: 'vertical',
      pageFill: Color.WHITE,
      pageStroke: Color.BLACK,
      currentPageStroke: Color.BLACK,
      interactive: true,
      dotTouchAreaDilation: 5,
      dotMouseAreaDilation: 5,

      // Hide pageControl if there's only one page.
      visibleProperty: new DerivedProperty( [ languageCarousel.numberOfPagesProperty ], numberOfPages => numberOfPages > 1 )
    } );

    const voiceControlVBox = new VBox( {
      children: [ voiceCarouselLabel, voiceCarousel ],
      spacing: LABEL_Y_SPACING,
      align: 'left',
      layoutOptions: {
        minContentWidth: languageCarouselWidth
      }
    } );

    const languageControlVBox = new VBox( {
      children: [ languageCarouselLabel, languageCarousel ],
      spacing: LABEL_Y_SPACING,
      align: 'left'
    } );

    options.children = [

      // Add an extra Node layer so we can move the pageControl with a ManualConstraint below and not create an infinite
      // loop with the alignment layout of this HBox.
      new Node( { children: [ pageControl ] } ),

      languageControlVBox,
      voiceControlVBox
    ];

    super( options );

    // Keep the pageControl vertically centered next to the languageCarousel.
    ManualConstraint.create( this, [ languageCarousel, pageControl ], ( languageCarouselProxy, pageControlProxy ) => {
      pageControlProxy.centerY = languageCarouselProxy.centerY;
    } );

    // Rebuild the voiceCarousel with the available voices when the locale changes or when voices become available
    Multilink.multilink(
      [ localeProperty, utteranceQueue.announcer.voicesProperty ],
      ( locale, voices ) => {
        if ( voices.length ) {
          utteranceQueue.announcer.setFirstAvailableVoiceForLocale( locale, voiceProperty );

          const availableVoicesForLocale = utteranceQueue.announcer.getPrioritizedVoicesForLocale( locale );

          if ( availableVoicesForLocale.length ) {
            const voiceCarouselItems: VoiceCarouselItem[] = availableVoicesForLocale.map(
              voice => {
                return {
                  voice: voice,
                  createNode: () => new CarouselItemNode(
                    voiceProperty,
                    voice,
                    voice.name,
                    voice.lang, () => {
                      voiceProperty.value = voice;
                      utteranceQueue.speakTestVoice( voice, locale );
                    } )
                };
              } );

            voiceCarousel.dispose();
            voiceCarousel = new Carousel( voiceCarouselItems, CAROUSEL_OPTIONS );

            // Set the children so the new carousel is visible.
            voiceControlVBox.children = [ voiceCarouselLabel, voiceCarousel ];
          }
          else {

            // No available voices, so set the children so the noVoicesFoundDescriptionNode is visible instead of the voices.
            voiceControlVBox.children = [ voiceCarouselLabel, noVoiceDescriptionNode ];
          }
        }
      } );
  }

  public override dispose(): void {
    assert && assert( false, 'dispose is not supported, exists for the lifetime of the sim' );
    super.dispose();
  }
}

/**
 * Text for informing the user that there is no available voice for their selected language. The text wraps at the
 * provided width.
 */
class NoVoiceDescriptionNode extends VBox {

  public constructor( maxWidth: number, maxHeight: number ) {

    const richTextOptions: RichTextOptions = {
      font: new PhetFont( 16 ),
      lineWrap: maxWidth
    };

    const noVoiceFoundDescriptionRichText = new RichText(
      NumberSuiteCommonStrings.noVoiceFoundDescriptionStringProperty, richTextOptions );

    const yourDeviceMaySupportDescriptionRichText = new RichText(
      NumberSuiteCommonStrings.yourDeviceMaySupportDescriptionStringProperty, richTextOptions );

    super( {
      children: [ noVoiceFoundDescriptionRichText, yourDeviceMaySupportDescriptionRichText ],
      spacing: 20,
      align: 'left',
      maxHeight: maxHeight
    } );
  }
}

numberSuiteCommon.register( 'LanguageAndVoiceControl', LanguageAndVoiceControl );
