// Copyright 2013-2023, University of Colorado Boulder

/**
 * Shows the home screen for a multi-screen simulation, which lets the user see all of the screens and select one.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../dot/js/Bounds2.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { AlignBox, HBox, Node, Text } from '../../scenery/js/imports.js';
import soundManager from '../../tambo/js/soundManager.js';
import HomeScreenButton from './HomeScreenButton.js';
import HomeScreenSoundGenerator from './HomeScreenSoundGenerator.js';
import joist from './joist.js';
import JoistStrings from './JoistStrings.js';
import ScreenView from './ScreenView.js';
import optionize from '../../phet-core/js/optionize.js';
import PatternStringProperty from '../../axon/js/PatternStringProperty.js';
class HomeScreenView extends ScreenView {
  // NOTE: In https://github.com/phetsims/joist/issues/640, we attempted to use ScreenView.DEFAULT_LAYOUT_BOUNDS here.
  // Lots of problems were encountered, since both the Home screen and navigation bar are dependent on this value.
  // If/when joist is cleaned up, this should be ScreenView.DEFAULT_LAYOUT_BOUNDS.
  static LAYOUT_BOUNDS = new Bounds2(0, 0, 768, 504);

  // iPad doesn't support Century Gothic, so fall back to Futura, see http://wordpress.org/support/topic/font-not-working-on-ipad-browser
  static TITLE_FONT_FAMILY = 'Century Gothic, Futura';

  /**
   * @param simNameProperty - the internationalized text for the sim name
   * @param model
   * @param [providedOptions]
   */
  constructor(simNameProperty, model, providedOptions) {
    const options = optionize()({
      layoutBounds: HomeScreenView.LAYOUT_BOUNDS,
      warningNode: null,
      // Remove the "normal" PDOM structure Nodes like the screen summary, play area, and control area Nodes from the
      // HomeScreen. The HomeScreen handles its own description.
      includePDOMNodes: false
    }, providedOptions);
    super(options);
    const homeScreenPDOMNode = new Node({
      tagName: 'p'
    });
    this.addChild(homeScreenPDOMNode);
    this.selectedScreenProperty = model.selectedScreenProperty;
    const titleText = new Text(simNameProperty, {
      font: new PhetFont({
        size: 52,
        family: HomeScreenView.TITLE_FONT_FAMILY
      }),
      fill: 'white',
      y: 130,
      maxWidth: this.layoutBounds.width - 10,
      // To support PhET-iO Clients setting this
      tandem: options.tandem.createTandem('titleText'),
      stringPropertyOptions: {
        phetioReadOnly: true
      }
    });

    // Have this before adding the child to support the startup layout. Use `localBoundsProperty` to avoid an infinite loop.
    titleText.localBoundsProperty.link(() => {
      titleText.centerX = this.layoutBounds.centerX;
    });
    this.addChild(titleText);
    const buttonGroupTandem = options.tandem.createTandem('buttonGroup');
    this.screenButtons = _.map(model.simScreens, screen => {
      assert && assert(screen.nameProperty.value, `name is required for screen ${model.simScreens.indexOf(screen)}`);
      assert && assert(screen.homeScreenIcon, `homeScreenIcon is required for screen ${screen.nameProperty.value}`);
      const homeScreenButton = new HomeScreenButton(screen, model, {
        showUnselectedHomeScreenIconFrame: screen.showUnselectedHomeScreenIconFrame,
        // pdom
        descriptionContent: screen.descriptionContent,
        // voicing
        voicingHintResponse: screen.descriptionContent,
        // phet-io
        tandem: buttonGroupTandem.createTandem(`${screen.tandem.name}Button`)
      });
      homeScreenButton.voicingNameResponse = screen.pdomDisplayNameProperty;
      homeScreenButton.innerContent = screen.pdomDisplayNameProperty;
      return homeScreenButton;
    });

    // Space the icons out more if there are fewer, so they will be spaced nicely.
    // Cannot have only 1 screen because for 1-screen sims there is no home screen.
    let spacing = 60;
    if (model.simScreens.length === 4) {
      spacing = 33;
    }
    if (model.simScreens.length >= 5) {
      spacing = 20;
    }
    this.homeScreenScreenSummaryIntroProperty = new PatternStringProperty(JoistStrings.a11y.homeScreenDescriptionPatternStringProperty, {
      name: simNameProperty,
      screens: model.simScreens.length
    });

    // Add the home screen description, since there are no PDOM container Nodes for this ScreenView
    homeScreenPDOMNode.innerContent = new PatternStringProperty(JoistStrings.a11y.homeScreenIntroPatternStringProperty, {
      description: this.homeScreenScreenSummaryIntroProperty,
      hint: JoistStrings.a11y.homeScreenHintStringProperty
    });
    this.screenButtons.forEach(screenButton => {
      screenButton.voicingContextResponse = simNameProperty;
    });
    const buttonBox = new HBox({
      spacing: spacing,
      align: 'top',
      maxWidth: this.layoutBounds.width - 118,
      // pdom
      tagName: 'ol'
    });
    model.activeSimScreensProperty.link(simScreens => {
      buttonBox.children = simScreens.map(screen => _.find(this.screenButtons, screenButton => screenButton.screen === screen));
    });
    this.addChild(new AlignBox(buttonBox, {
      alignBounds: this.layoutBounds,
      yAlign: 'top',
      topMargin: this.layoutBounds.height / 3 + 20
    }));

    // Add sound generation for screen selection.  This generates sound for all changes between screens, not just for the
    // home screen.
    soundManager.addSoundGenerator(new HomeScreenSoundGenerator(model, {
      initialOutputLevel: 0.5
    }), {
      categoryName: 'user-interface'
    });
    if (options.warningNode) {
      const warningNode = options.warningNode;
      this.addChild(warningNode);
      warningNode.centerX = this.layoutBounds.centerX;
      warningNode.bottom = this.layoutBounds.maxY - 2;
    }
  }

  /**
   * For a11y, highlight the currently selected screen button
   */
  focusHighlightedScreenButton() {
    for (let i = 0; i < this.screenButtons.length; i++) {
      const screenButton = this.screenButtons[i];
      if (screenButton.screen === this.selectedScreenProperty.value) {
        screenButton.focus();
        break;
      }
    }
  }

  /**
   * To support voicing.
   */
  getVoicingOverviewContent() {
    return this.homeScreenScreenSummaryIntroProperty;
  }

  /**
   * To support voicing.
   */
  getVoicingDetailsContent() {
    let details = '';

    // Do this dynamically so that it supports changes that may occur to the pdomDisplayNameProperty
    this.screenButtons.forEach(screenButton => {
      if (details !== '') {
        details += ' ';
      }
      details += StringUtils.fillIn(JoistStrings.a11y.homeScreenButtonDetailsPattern, {
        name: screenButton.screen.pdomDisplayNameProperty.value,
        screenHint: screenButton.screen.descriptionContent
      });
    });
    return details;
  }

  /**
   * To support voicing.
   */
  getVoicingHintContent() {
    return JoistStrings.a11y.homeScreenHintStringProperty;
  }
}
joist.register('HomeScreenView', HomeScreenView);
export default HomeScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiU3RyaW5nVXRpbHMiLCJQaGV0Rm9udCIsIkFsaWduQm94IiwiSEJveCIsIk5vZGUiLCJUZXh0Iiwic291bmRNYW5hZ2VyIiwiSG9tZVNjcmVlbkJ1dHRvbiIsIkhvbWVTY3JlZW5Tb3VuZEdlbmVyYXRvciIsImpvaXN0IiwiSm9pc3RTdHJpbmdzIiwiU2NyZWVuVmlldyIsIm9wdGlvbml6ZSIsIlBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsIkhvbWVTY3JlZW5WaWV3IiwiTEFZT1VUX0JPVU5EUyIsIlRJVExFX0ZPTlRfRkFNSUxZIiwiY29uc3RydWN0b3IiLCJzaW1OYW1lUHJvcGVydHkiLCJtb2RlbCIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJsYXlvdXRCb3VuZHMiLCJ3YXJuaW5nTm9kZSIsImluY2x1ZGVQRE9NTm9kZXMiLCJob21lU2NyZWVuUERPTU5vZGUiLCJ0YWdOYW1lIiwiYWRkQ2hpbGQiLCJzZWxlY3RlZFNjcmVlblByb3BlcnR5IiwidGl0bGVUZXh0IiwiZm9udCIsInNpemUiLCJmYW1pbHkiLCJmaWxsIiwieSIsIm1heFdpZHRoIiwid2lkdGgiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJzdHJpbmdQcm9wZXJ0eU9wdGlvbnMiLCJwaGV0aW9SZWFkT25seSIsImxvY2FsQm91bmRzUHJvcGVydHkiLCJsaW5rIiwiY2VudGVyWCIsImJ1dHRvbkdyb3VwVGFuZGVtIiwic2NyZWVuQnV0dG9ucyIsIl8iLCJtYXAiLCJzaW1TY3JlZW5zIiwic2NyZWVuIiwiYXNzZXJ0IiwibmFtZVByb3BlcnR5IiwidmFsdWUiLCJpbmRleE9mIiwiaG9tZVNjcmVlbkljb24iLCJob21lU2NyZWVuQnV0dG9uIiwic2hvd1Vuc2VsZWN0ZWRIb21lU2NyZWVuSWNvbkZyYW1lIiwiZGVzY3JpcHRpb25Db250ZW50Iiwidm9pY2luZ0hpbnRSZXNwb25zZSIsIm5hbWUiLCJ2b2ljaW5nTmFtZVJlc3BvbnNlIiwicGRvbURpc3BsYXlOYW1lUHJvcGVydHkiLCJpbm5lckNvbnRlbnQiLCJzcGFjaW5nIiwibGVuZ3RoIiwiaG9tZVNjcmVlblNjcmVlblN1bW1hcnlJbnRyb1Byb3BlcnR5IiwiYTExeSIsImhvbWVTY3JlZW5EZXNjcmlwdGlvblBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsInNjcmVlbnMiLCJob21lU2NyZWVuSW50cm9QYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJkZXNjcmlwdGlvbiIsImhpbnQiLCJob21lU2NyZWVuSGludFN0cmluZ1Byb3BlcnR5IiwiZm9yRWFjaCIsInNjcmVlbkJ1dHRvbiIsInZvaWNpbmdDb250ZXh0UmVzcG9uc2UiLCJidXR0b25Cb3giLCJhbGlnbiIsImFjdGl2ZVNpbVNjcmVlbnNQcm9wZXJ0eSIsImNoaWxkcmVuIiwiZmluZCIsImFsaWduQm91bmRzIiwieUFsaWduIiwidG9wTWFyZ2luIiwiaGVpZ2h0IiwiYWRkU291bmRHZW5lcmF0b3IiLCJpbml0aWFsT3V0cHV0TGV2ZWwiLCJjYXRlZ29yeU5hbWUiLCJib3R0b20iLCJtYXhZIiwiZm9jdXNIaWdobGlnaHRlZFNjcmVlbkJ1dHRvbiIsImkiLCJmb2N1cyIsImdldFZvaWNpbmdPdmVydmlld0NvbnRlbnQiLCJnZXRWb2ljaW5nRGV0YWlsc0NvbnRlbnQiLCJkZXRhaWxzIiwiZmlsbEluIiwiaG9tZVNjcmVlbkJ1dHRvbkRldGFpbHNQYXR0ZXJuIiwic2NyZWVuSGludCIsImdldFZvaWNpbmdIaW50Q29udGVudCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiSG9tZVNjcmVlblZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU2hvd3MgdGhlIGhvbWUgc2NyZWVuIGZvciBhIG11bHRpLXNjcmVlbiBzaW11bGF0aW9uLCB3aGljaCBsZXRzIHRoZSB1c2VyIHNlZSBhbGwgb2YgdGhlIHNjcmVlbnMgYW5kIHNlbGVjdCBvbmUuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IEFsaWduQm94LCBIQm94LCBOb2RlLCBUZXh0IH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHNvdW5kTWFuYWdlciBmcm9tICcuLi8uLi90YW1iby9qcy9zb3VuZE1hbmFnZXIuanMnO1xyXG5pbXBvcnQgSG9tZVNjcmVlbkJ1dHRvbiBmcm9tICcuL0hvbWVTY3JlZW5CdXR0b24uanMnO1xyXG5pbXBvcnQgSG9tZVNjcmVlblNvdW5kR2VuZXJhdG9yIGZyb20gJy4vSG9tZVNjcmVlblNvdW5kR2VuZXJhdG9yLmpzJztcclxuaW1wb3J0IGpvaXN0IGZyb20gJy4vam9pc3QuanMnO1xyXG5pbXBvcnQgSm9pc3RTdHJpbmdzIGZyb20gJy4vSm9pc3RTdHJpbmdzLmpzJztcclxuaW1wb3J0IFNjcmVlblZpZXcsIHsgU2NyZWVuVmlld09wdGlvbnMgfSBmcm9tICcuL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgeyBBbnlTY3JlZW4gfSBmcm9tICcuL1NjcmVlbi5qcyc7XHJcbmltcG9ydCBIb21lU2NyZWVuTW9kZWwgZnJvbSAnLi9Ib21lU2NyZWVuTW9kZWwuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1BhdHRlcm5TdHJpbmdQcm9wZXJ0eS5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG5cclxuICAvLyB0byBkaXNwbGF5IGJlbG93IHRoZSBpY29ucyBhcyBhIHdhcm5pbmcgaWYgYXZhaWxhYmxlXHJcbiAgd2FybmluZ05vZGU/OiBOb2RlIHwgbnVsbDtcclxufTtcclxuXHJcbnR5cGUgSG9tZVNjcmVlblZpZXdPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8U2NyZWVuVmlld09wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmNsYXNzIEhvbWVTY3JlZW5WaWV3IGV4dGVuZHMgU2NyZWVuVmlldyB7XHJcblxyXG4gIHByaXZhdGUgaG9tZVNjcmVlblNjcmVlblN1bW1hcnlJbnRyb1Byb3BlcnR5ITogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPjtcclxuICBwcml2YXRlIHNlbGVjdGVkU2NyZWVuUHJvcGVydHk6IFByb3BlcnR5PEFueVNjcmVlbj47XHJcbiAgcHVibGljIHNjcmVlbkJ1dHRvbnM6IEhvbWVTY3JlZW5CdXR0b25bXTtcclxuXHJcbiAgLy8gTk9URTogSW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy82NDAsIHdlIGF0dGVtcHRlZCB0byB1c2UgU2NyZWVuVmlldy5ERUZBVUxUX0xBWU9VVF9CT1VORFMgaGVyZS5cclxuICAvLyBMb3RzIG9mIHByb2JsZW1zIHdlcmUgZW5jb3VudGVyZWQsIHNpbmNlIGJvdGggdGhlIEhvbWUgc2NyZWVuIGFuZCBuYXZpZ2F0aW9uIGJhciBhcmUgZGVwZW5kZW50IG9uIHRoaXMgdmFsdWUuXHJcbiAgLy8gSWYvd2hlbiBqb2lzdCBpcyBjbGVhbmVkIHVwLCB0aGlzIHNob3VsZCBiZSBTY3JlZW5WaWV3LkRFRkFVTFRfTEFZT1VUX0JPVU5EUy5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IExBWU9VVF9CT1VORFMgPSBuZXcgQm91bmRzMiggMCwgMCwgNzY4LCA1MDQgKTtcclxuXHJcbiAgLy8gaVBhZCBkb2Vzbid0IHN1cHBvcnQgQ2VudHVyeSBHb3RoaWMsIHNvIGZhbGwgYmFjayB0byBGdXR1cmEsIHNlZSBodHRwOi8vd29yZHByZXNzLm9yZy9zdXBwb3J0L3RvcGljL2ZvbnQtbm90LXdvcmtpbmctb24taXBhZC1icm93c2VyXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBUSVRMRV9GT05UX0ZBTUlMWSA9ICdDZW50dXJ5IEdvdGhpYywgRnV0dXJhJztcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHNpbU5hbWVQcm9wZXJ0eSAtIHRoZSBpbnRlcm5hdGlvbmFsaXplZCB0ZXh0IGZvciB0aGUgc2ltIG5hbWVcclxuICAgKiBAcGFyYW0gbW9kZWxcclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHNpbU5hbWVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiwgbW9kZWw6IEhvbWVTY3JlZW5Nb2RlbCwgcHJvdmlkZWRPcHRpb25zPzogSG9tZVNjcmVlblZpZXdPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8SG9tZVNjcmVlblZpZXdPcHRpb25zLCBTZWxmT3B0aW9ucywgU2NyZWVuVmlld09wdGlvbnM+KCkoIHtcclxuICAgICAgbGF5b3V0Qm91bmRzOiBIb21lU2NyZWVuVmlldy5MQVlPVVRfQk9VTkRTLFxyXG4gICAgICB3YXJuaW5nTm9kZTogbnVsbCxcclxuXHJcbiAgICAgIC8vIFJlbW92ZSB0aGUgXCJub3JtYWxcIiBQRE9NIHN0cnVjdHVyZSBOb2RlcyBsaWtlIHRoZSBzY3JlZW4gc3VtbWFyeSwgcGxheSBhcmVhLCBhbmQgY29udHJvbCBhcmVhIE5vZGVzIGZyb20gdGhlXHJcbiAgICAgIC8vIEhvbWVTY3JlZW4uIFRoZSBIb21lU2NyZWVuIGhhbmRsZXMgaXRzIG93biBkZXNjcmlwdGlvbi5cclxuICAgICAgaW5jbHVkZVBET01Ob2RlczogZmFsc2VcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgaG9tZVNjcmVlblBET01Ob2RlID0gbmV3IE5vZGUoIHtcclxuICAgICAgdGFnTmFtZTogJ3AnXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBob21lU2NyZWVuUERPTU5vZGUgKTtcclxuXHJcbiAgICB0aGlzLnNlbGVjdGVkU2NyZWVuUHJvcGVydHkgPSBtb2RlbC5zZWxlY3RlZFNjcmVlblByb3BlcnR5O1xyXG5cclxuICAgIGNvbnN0IHRpdGxlVGV4dCA9IG5ldyBUZXh0KCBzaW1OYW1lUHJvcGVydHksIHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCB7XHJcbiAgICAgICAgc2l6ZTogNTIsXHJcbiAgICAgICAgZmFtaWx5OiBIb21lU2NyZWVuVmlldy5USVRMRV9GT05UX0ZBTUlMWVxyXG4gICAgICB9ICksXHJcbiAgICAgIGZpbGw6ICd3aGl0ZScsXHJcbiAgICAgIHk6IDEzMCxcclxuICAgICAgbWF4V2lkdGg6IHRoaXMubGF5b3V0Qm91bmRzLndpZHRoIC0gMTAsIC8vIFRvIHN1cHBvcnQgUGhFVC1pTyBDbGllbnRzIHNldHRpbmcgdGhpc1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RpdGxlVGV4dCcgKSxcclxuICAgICAgc3RyaW5nUHJvcGVydHlPcHRpb25zOiB7IHBoZXRpb1JlYWRPbmx5OiB0cnVlIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBIYXZlIHRoaXMgYmVmb3JlIGFkZGluZyB0aGUgY2hpbGQgdG8gc3VwcG9ydCB0aGUgc3RhcnR1cCBsYXlvdXQuIFVzZSBgbG9jYWxCb3VuZHNQcm9wZXJ0eWAgdG8gYXZvaWQgYW4gaW5maW5pdGUgbG9vcC5cclxuICAgIHRpdGxlVGV4dC5sb2NhbEJvdW5kc1Byb3BlcnR5LmxpbmsoICgpID0+IHtcclxuICAgICAgdGl0bGVUZXh0LmNlbnRlclggPSB0aGlzLmxheW91dEJvdW5kcy5jZW50ZXJYO1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGl0bGVUZXh0ICk7XHJcblxyXG4gICAgY29uc3QgYnV0dG9uR3JvdXBUYW5kZW0gPSBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdidXR0b25Hcm91cCcgKTtcclxuXHJcbiAgICB0aGlzLnNjcmVlbkJ1dHRvbnMgPSBfLm1hcCggbW9kZWwuc2ltU2NyZWVucywgKCBzY3JlZW46IEFueVNjcmVlbiApID0+IHtcclxuXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHNjcmVlbi5uYW1lUHJvcGVydHkudmFsdWUsIGBuYW1lIGlzIHJlcXVpcmVkIGZvciBzY3JlZW4gJHttb2RlbC5zaW1TY3JlZW5zLmluZGV4T2YoIHNjcmVlbiApfWAgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggc2NyZWVuLmhvbWVTY3JlZW5JY29uLCBgaG9tZVNjcmVlbkljb24gaXMgcmVxdWlyZWQgZm9yIHNjcmVlbiAke3NjcmVlbi5uYW1lUHJvcGVydHkudmFsdWV9YCApO1xyXG5cclxuICAgICAgY29uc3QgaG9tZVNjcmVlbkJ1dHRvbiA9IG5ldyBIb21lU2NyZWVuQnV0dG9uKFxyXG4gICAgICAgIHNjcmVlbixcclxuICAgICAgICBtb2RlbCwge1xyXG4gICAgICAgICAgc2hvd1Vuc2VsZWN0ZWRIb21lU2NyZWVuSWNvbkZyYW1lOiBzY3JlZW4uc2hvd1Vuc2VsZWN0ZWRIb21lU2NyZWVuSWNvbkZyYW1lLFxyXG5cclxuICAgICAgICAgIC8vIHBkb21cclxuICAgICAgICAgIGRlc2NyaXB0aW9uQ29udGVudDogc2NyZWVuLmRlc2NyaXB0aW9uQ29udGVudCxcclxuXHJcbiAgICAgICAgICAvLyB2b2ljaW5nXHJcbiAgICAgICAgICB2b2ljaW5nSGludFJlc3BvbnNlOiBzY3JlZW4uZGVzY3JpcHRpb25Db250ZW50LFxyXG5cclxuICAgICAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgICAgIHRhbmRlbTogYnV0dG9uR3JvdXBUYW5kZW0uY3JlYXRlVGFuZGVtKCBgJHtzY3JlZW4udGFuZGVtLm5hbWV9QnV0dG9uYCApXHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgaG9tZVNjcmVlbkJ1dHRvbi52b2ljaW5nTmFtZVJlc3BvbnNlID0gc2NyZWVuLnBkb21EaXNwbGF5TmFtZVByb3BlcnR5O1xyXG4gICAgICBob21lU2NyZWVuQnV0dG9uLmlubmVyQ29udGVudCA9IHNjcmVlbi5wZG9tRGlzcGxheU5hbWVQcm9wZXJ0eTtcclxuXHJcbiAgICAgIHJldHVybiBob21lU2NyZWVuQnV0dG9uO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFNwYWNlIHRoZSBpY29ucyBvdXQgbW9yZSBpZiB0aGVyZSBhcmUgZmV3ZXIsIHNvIHRoZXkgd2lsbCBiZSBzcGFjZWQgbmljZWx5LlxyXG4gICAgLy8gQ2Fubm90IGhhdmUgb25seSAxIHNjcmVlbiBiZWNhdXNlIGZvciAxLXNjcmVlbiBzaW1zIHRoZXJlIGlzIG5vIGhvbWUgc2NyZWVuLlxyXG4gICAgbGV0IHNwYWNpbmcgPSA2MDtcclxuICAgIGlmICggbW9kZWwuc2ltU2NyZWVucy5sZW5ndGggPT09IDQgKSB7XHJcbiAgICAgIHNwYWNpbmcgPSAzMztcclxuICAgIH1cclxuICAgIGlmICggbW9kZWwuc2ltU2NyZWVucy5sZW5ndGggPj0gNSApIHtcclxuICAgICAgc3BhY2luZyA9IDIwO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaG9tZVNjcmVlblNjcmVlblN1bW1hcnlJbnRyb1Byb3BlcnR5ID0gbmV3IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSggSm9pc3RTdHJpbmdzLmExMXkuaG9tZVNjcmVlbkRlc2NyaXB0aW9uUGF0dGVyblN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIG5hbWU6IHNpbU5hbWVQcm9wZXJ0eSxcclxuICAgICAgc2NyZWVuczogbW9kZWwuc2ltU2NyZWVucy5sZW5ndGhcclxuICAgIH0gKTtcclxuXHJcblxyXG4gICAgLy8gQWRkIHRoZSBob21lIHNjcmVlbiBkZXNjcmlwdGlvbiwgc2luY2UgdGhlcmUgYXJlIG5vIFBET00gY29udGFpbmVyIE5vZGVzIGZvciB0aGlzIFNjcmVlblZpZXdcclxuICAgIGhvbWVTY3JlZW5QRE9NTm9kZS5pbm5lckNvbnRlbnQgPSBuZXcgUGF0dGVyblN0cmluZ1Byb3BlcnR5KCBKb2lzdFN0cmluZ3MuYTExeS5ob21lU2NyZWVuSW50cm9QYXR0ZXJuU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgZGVzY3JpcHRpb246IHRoaXMuaG9tZVNjcmVlblNjcmVlblN1bW1hcnlJbnRyb1Byb3BlcnR5LFxyXG4gICAgICBoaW50OiBKb2lzdFN0cmluZ3MuYTExeS5ob21lU2NyZWVuSGludFN0cmluZ1Byb3BlcnR5XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5zY3JlZW5CdXR0b25zLmZvckVhY2goIHNjcmVlbkJ1dHRvbiA9PiB7XHJcbiAgICAgIHNjcmVlbkJ1dHRvbi52b2ljaW5nQ29udGV4dFJlc3BvbnNlID0gc2ltTmFtZVByb3BlcnR5O1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGJ1dHRvbkJveCA9IG5ldyBIQm94KCB7XHJcbiAgICAgIHNwYWNpbmc6IHNwYWNpbmcsXHJcbiAgICAgIGFsaWduOiAndG9wJyxcclxuICAgICAgbWF4V2lkdGg6IHRoaXMubGF5b3V0Qm91bmRzLndpZHRoIC0gMTE4LFxyXG5cclxuICAgICAgLy8gcGRvbVxyXG4gICAgICB0YWdOYW1lOiAnb2wnXHJcbiAgICB9ICk7XHJcbiAgICBtb2RlbC5hY3RpdmVTaW1TY3JlZW5zUHJvcGVydHkubGluayggc2ltU2NyZWVucyA9PiB7XHJcbiAgICAgIGJ1dHRvbkJveC5jaGlsZHJlbiA9IHNpbVNjcmVlbnMubWFwKCBzY3JlZW4gPT4gXy5maW5kKCB0aGlzLnNjcmVlbkJ1dHRvbnMsIHNjcmVlbkJ1dHRvbiA9PiBzY3JlZW5CdXR0b24uc2NyZWVuID09PSBzY3JlZW4gKSEgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgQWxpZ25Cb3goIGJ1dHRvbkJveCwge1xyXG4gICAgICBhbGlnbkJvdW5kczogdGhpcy5sYXlvdXRCb3VuZHMsXHJcbiAgICAgIHlBbGlnbjogJ3RvcCcsXHJcbiAgICAgIHRvcE1hcmdpbjogdGhpcy5sYXlvdXRCb3VuZHMuaGVpZ2h0IC8gMyArIDIwXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvLyBBZGQgc291bmQgZ2VuZXJhdGlvbiBmb3Igc2NyZWVuIHNlbGVjdGlvbi4gIFRoaXMgZ2VuZXJhdGVzIHNvdW5kIGZvciBhbGwgY2hhbmdlcyBiZXR3ZWVuIHNjcmVlbnMsIG5vdCBqdXN0IGZvciB0aGVcclxuICAgIC8vIGhvbWUgc2NyZWVuLlxyXG4gICAgc291bmRNYW5hZ2VyLmFkZFNvdW5kR2VuZXJhdG9yKCBuZXcgSG9tZVNjcmVlblNvdW5kR2VuZXJhdG9yKCBtb2RlbCwgeyBpbml0aWFsT3V0cHV0TGV2ZWw6IDAuNSB9ICksIHtcclxuICAgICAgY2F0ZWdvcnlOYW1lOiAndXNlci1pbnRlcmZhY2UnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgaWYgKCBvcHRpb25zLndhcm5pbmdOb2RlICkge1xyXG4gICAgICBjb25zdCB3YXJuaW5nTm9kZSA9IG9wdGlvbnMud2FybmluZ05vZGU7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIHdhcm5pbmdOb2RlICk7XHJcbiAgICAgIHdhcm5pbmdOb2RlLmNlbnRlclggPSB0aGlzLmxheW91dEJvdW5kcy5jZW50ZXJYO1xyXG4gICAgICB3YXJuaW5nTm9kZS5ib3R0b20gPSB0aGlzLmxheW91dEJvdW5kcy5tYXhZIC0gMjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZvciBhMTF5LCBoaWdobGlnaHQgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBzY3JlZW4gYnV0dG9uXHJcbiAgICovXHJcbiAgcHVibGljIGZvY3VzSGlnaGxpZ2h0ZWRTY3JlZW5CdXR0b24oKTogdm9pZCB7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnNjcmVlbkJ1dHRvbnMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHNjcmVlbkJ1dHRvbiA9IHRoaXMuc2NyZWVuQnV0dG9uc1sgaSBdO1xyXG4gICAgICBpZiAoIHNjcmVlbkJ1dHRvbi5zY3JlZW4gPT09IHRoaXMuc2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICBzY3JlZW5CdXR0b24uZm9jdXMoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVG8gc3VwcG9ydCB2b2ljaW5nLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBnZXRWb2ljaW5nT3ZlcnZpZXdDb250ZW50KCk6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4ge1xyXG4gICAgcmV0dXJuIHRoaXMuaG9tZVNjcmVlblNjcmVlblN1bW1hcnlJbnRyb1Byb3BlcnR5O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVG8gc3VwcG9ydCB2b2ljaW5nLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBnZXRWb2ljaW5nRGV0YWlsc0NvbnRlbnQoKTogc3RyaW5nIHtcclxuXHJcbiAgICBsZXQgZGV0YWlscyA9ICcnO1xyXG5cclxuICAgIC8vIERvIHRoaXMgZHluYW1pY2FsbHkgc28gdGhhdCBpdCBzdXBwb3J0cyBjaGFuZ2VzIHRoYXQgbWF5IG9jY3VyIHRvIHRoZSBwZG9tRGlzcGxheU5hbWVQcm9wZXJ0eVxyXG4gICAgdGhpcy5zY3JlZW5CdXR0b25zLmZvckVhY2goIHNjcmVlbkJ1dHRvbiA9PiB7XHJcbiAgICAgIGlmICggZGV0YWlscyAhPT0gJycgKSB7XHJcbiAgICAgICAgZGV0YWlscyArPSAnICc7XHJcbiAgICAgIH1cclxuICAgICAgZGV0YWlscyArPSBTdHJpbmdVdGlscy5maWxsSW4oIEpvaXN0U3RyaW5ncy5hMTF5LmhvbWVTY3JlZW5CdXR0b25EZXRhaWxzUGF0dGVybiwge1xyXG4gICAgICAgIG5hbWU6IHNjcmVlbkJ1dHRvbi5zY3JlZW4ucGRvbURpc3BsYXlOYW1lUHJvcGVydHkudmFsdWUsXHJcbiAgICAgICAgc2NyZWVuSGludDogc2NyZWVuQnV0dG9uLnNjcmVlbi5kZXNjcmlwdGlvbkNvbnRlbnRcclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG4gICAgcmV0dXJuIGRldGFpbHM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUbyBzdXBwb3J0IHZvaWNpbmcuXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGdldFZvaWNpbmdIaW50Q29udGVudCgpOiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+IHtcclxuICAgIHJldHVybiBKb2lzdFN0cmluZ3MuYTExeS5ob21lU2NyZWVuSGludFN0cmluZ1Byb3BlcnR5O1xyXG4gIH1cclxufVxyXG5cclxuam9pc3QucmVnaXN0ZXIoICdIb21lU2NyZWVuVmlldycsIEhvbWVTY3JlZW5WaWV3ICk7XHJcbmV4cG9ydCBkZWZhdWx0IEhvbWVTY3JlZW5WaWV3OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0seUJBQXlCO0FBQzdDLE9BQU9DLFdBQVcsTUFBTSx5Q0FBeUM7QUFDakUsT0FBT0MsUUFBUSxNQUFNLG1DQUFtQztBQUN4RCxTQUFTQyxRQUFRLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsNkJBQTZCO0FBQ3hFLE9BQU9DLFlBQVks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