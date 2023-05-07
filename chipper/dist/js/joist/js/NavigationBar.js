// Copyright 2013-2023, University of Colorado Boulder

/**
 * The navigation bar at the bottom of the screen.
 * For a single-screen sim, it shows the name of the sim at the far left and the PhET button at the far right.
 * For a multi-screen sim, it additionally shows buttons for each screen, and a home button.
 *
 * Layout of NavigationBar adapts to different text widths, icon widths, and numbers of screens, and attempts to
 * perform an "optimal" layout. The sim title is initially constrained to a max percentage of the bar width,
 * and that's used to compute how much space is available for screen buttons.  After creation and layout of the
 * screen buttons, we then compute how much space is actually available for the sim title, and use that to
 * constrain the title's width.
 *
 * The bar is composed of a background (always pixel-perfect), and expandable content (that gets scaled as one part).
 * If we are width-constrained, the navigation bar is in a 'compact' state where the children of the content (e.g.
 * home button, screen buttons, phet menu, title) do not change positions. If we are height-constrained, the amount
 * available to the bar expands, so we lay out the children to fit. See https://github.com/phetsims/joist/issues/283
 * for more details on how this is done.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import StringProperty from '../../axon/js/StringProperty.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { AlignBox, HBox, ManualConstraint, Node, PDOMPeer, Rectangle, RelaxedManualConstraint, Text } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import A11yButtonsHBox from './A11yButtonsHBox.js';
import HomeButton from './HomeButton.js';
import HomeScreen from './HomeScreen.js';
import HomeScreenView from './HomeScreenView.js';
import joist from './joist.js';
import JoistStrings from './JoistStrings.js';
import NavigationBarScreenButton from './NavigationBarScreenButton.js';
import PhetButton from './PhetButton.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import BooleanProperty from '../../axon/js/BooleanProperty.js';

// constants
// for layout of the NavigationBar, used in the following way:
// [
//  {TITLE_LEFT_MARGIN}Title{TITLE_RIGHT_MARGIN}
//  {HOME_BUTTON_LEFT_MARGIN}HomeButton{HOME_BUTTON_RIGHT_MARGIN} (if visible)
//  {ScreenButtons centered} (if visible)
//  a11yButtonsHBox (if present){PHET_BUTTON_LEFT_MARGIN}PhetButton{PHET_BUTTON_RIGHT_MARGIN}
// ]
const NAVIGATION_BAR_SIZE = new Dimension2(HomeScreenView.LAYOUT_BOUNDS.width, 40);
const TITLE_LEFT_MARGIN = 10;
const TITLE_RIGHT_MARGIN = 25;
const PHET_BUTTON_LEFT_MARGIN = 6;
const PHET_BUTTON_RIGHT_MARGIN = 10;
const HOME_BUTTON_LEFT_MARGIN = 5;
const HOME_BUTTON_RIGHT_MARGIN = HOME_BUTTON_LEFT_MARGIN;
const SCREEN_BUTTON_SPACING = 0;
const MINIMUM_SCREEN_BUTTON_WIDTH = 60; // Make sure each button is at least a minimum width so they don't get too close together, see #279

class NavigationBar extends Node {
  homeButton = null; // mutated if multiscreen sim

  constructor(sim, tandem) {
    super();

    // The nav bar fill and determining fill for elements on the nav bar (if it's black, the elements are white)
    this.navigationBarFillProperty = new DerivedProperty([sim.selectedScreenProperty, sim.lookAndFeel.navigationBarFillProperty], (screen, simNavigationBarFill) => {
      const showHomeScreen = screen === sim.homeScreen;

      // If the homescreen is showing, the navigation bar should blend into it.  This is done by making it the same color.
      // It cannot be made transparent here, because other code relies on the value of navigationBarFillProperty being
      // 'black' to make the icons show up as white, even when the navigation bar is hidden on the home screen.
      return showHomeScreen ? HomeScreen.BACKGROUND_COLOR : simNavigationBarFill;
    });

    // The bar's background (resized in layout)
    this.background = new Rectangle(0, 0, NAVIGATION_BAR_SIZE.width, NAVIGATION_BAR_SIZE.height, {
      pickable: true,
      fill: this.navigationBarFillProperty
    });
    this.addChild(this.background);

    // Everything else besides the background in the navigation bar (used for scaling)
    this.barContents = new Node();
    this.addChild(this.barContents);
    const titleText = new Text(sim.displayedSimNameProperty, {
      font: new PhetFont(16),
      fill: sim.lookAndFeel.navigationBarTextFillProperty,
      tandem: tandem.createTandem('titleText'),
      phetioFeatured: true,
      phetioDocumentation: 'Displays the title of the simulation in the navigation bar (bottom left)',
      visiblePropertyOptions: {
        phetioFeatured: true
      },
      stringPropertyOptions: {
        phetioReadOnly: true
      }
    });

    // Container node so that the visibility of the Navigation Bar title text can be controlled
    // independently by PhET-iO and whether the user is on the homescreen.
    const titleContainerNode = new Node({
      children: [titleText],
      visibleProperty: new DerivedProperty([sim.selectedScreenProperty], screen => screen !== sim.homeScreen)
    });
    this.barContents.addChild(titleContainerNode);

    // PhET button, fill determined by state of navigationBarFillProperty
    const phetButton = new PhetButton(sim, this.navigationBarFillProperty, tandem.createTandem('phetButton'));
    this.barContents.addChild(phetButton);

    // a11y HBox, button fills determined by state of navigationBarFillProperty
    this.a11yButtonsHBox = new A11yButtonsHBox(sim, this.navigationBarFillProperty, {
      tandem: tandem // no need for a container here. If there is a conflict, then it will error loudly.
    });

    this.barContents.addChild(this.a11yButtonsHBox);
    this.localeNode && this.barContents.addChild(this.localeNode);

    // pdom - tell this node that it is aria-labelled by its own labelContent.
    this.addAriaLabelledbyAssociation({
      thisElementName: PDOMPeer.PRIMARY_SIBLING,
      otherNode: this,
      otherElementName: PDOMPeer.LABEL_SIBLING
    });
    let buttons;
    const a11yButtonsWidth = this.a11yButtonsHBox.bounds.isValid() ? this.a11yButtonsHBox.width : 0;

    // No potential for multiple screens if this is true
    if (sim.simScreens.length === 1) {
      /* single-screen sim */

      // title can occupy all space to the left of the PhET button
      titleText.maxWidth = HomeScreenView.LAYOUT_BOUNDS.width - TITLE_LEFT_MARGIN - TITLE_RIGHT_MARGIN - PHET_BUTTON_LEFT_MARGIN - a11yButtonsWidth - (this.localeNode ? this.localeNode.width : 0) - PHET_BUTTON_LEFT_MARGIN - phetButton.width - PHET_BUTTON_RIGHT_MARGIN;
    } else {
      /* multi-screen sim */

      // Start with the assumption that the title can occupy (at most) this percentage of the bar.
      const maxTitleWidth = Math.min(titleText.width, 0.20 * HomeScreenView.LAYOUT_BOUNDS.width);
      const isUserNavigableProperty = new BooleanProperty(true, {
        tandem: Tandem.GENERAL_MODEL.createTandem('screens').createTandem('isUserNavigableProperty'),
        phetioFeatured: true,
        phetioDocumentation: 'If the screens are user navigable, icons are displayed in the navigation bar and the user can switch between screens.'
      });

      // pdom - container for the homeButton and all the screen buttons.
      buttons = new Node({
        tagName: 'ol',
        containerTagName: 'nav',
        labelTagName: 'h2',
        labelContent: JoistStrings.a11y.simScreensStringProperty,
        visibleProperty: new DerivedProperty([sim.activeSimScreensProperty, sim.selectedScreenProperty, isUserNavigableProperty], (screens, screen, isUserNavigable) => {
          return screen !== sim.homeScreen && screens.length > 1 && isUserNavigable;
        })
      });
      buttons.ariaLabelledbyAssociations = [{
        thisElementName: PDOMPeer.CONTAINER_PARENT,
        otherElementName: PDOMPeer.LABEL_SIBLING,
        otherNode: buttons
      }];
      this.barContents.addChild(buttons);

      // Create the home button
      this.homeButton = new HomeButton(NAVIGATION_BAR_SIZE.height, sim.lookAndFeel.navigationBarFillProperty, sim.homeScreen ? sim.homeScreen.pdomDisplayNameProperty : new StringProperty('NO HOME SCREEN'), {
        listener: () => {
          sim.selectedScreenProperty.value = sim.homeScreen;

          // only if fired from a11y
          if (this.homeButton.isPDOMClicking()) {
            sim.homeScreen.view.focusHighlightedScreenButton();
          }
        },
        tandem: tandem.createTandem('homeButton'),
        centerY: NAVIGATION_BAR_SIZE.height / 2
      });

      // Add the home button, but only if the homeScreen exists
      sim.homeScreen && buttons.addChild(this.homeButton);

      /*
       * Allocate remaining horizontal space equally for screen buttons, assuming they will be centered in the navbar.
       * Computations here reflect the left-to-right layout of the navbar.
       */
      // available width left of center
      const availableLeft = HomeScreenView.LAYOUT_BOUNDS.width / 2 - TITLE_LEFT_MARGIN - maxTitleWidth - TITLE_RIGHT_MARGIN - HOME_BUTTON_LEFT_MARGIN - this.homeButton.width - HOME_BUTTON_RIGHT_MARGIN;

      // available width right of center
      const availableRight = HomeScreenView.LAYOUT_BOUNDS.width / 2 - PHET_BUTTON_LEFT_MARGIN - a11yButtonsWidth - (this.localeNode ? this.localeNode.width : 0) - PHET_BUTTON_LEFT_MARGIN - phetButton.width - PHET_BUTTON_RIGHT_MARGIN;

      // total available width for the screen buttons when they are centered
      const availableTotal = 2 * Math.min(availableLeft, availableRight);

      // width per screen button
      const screenButtonWidth = (availableTotal - (sim.simScreens.length - 1) * SCREEN_BUTTON_SPACING) / sim.simScreens.length;

      // Create the screen buttons
      const screenButtons = sim.simScreens.map(screen => {
        return new NavigationBarScreenButton(sim.lookAndFeel.navigationBarFillProperty, sim.selectedScreenProperty, screen, sim.simScreens.indexOf(screen), NAVIGATION_BAR_SIZE.height, {
          maxButtonWidth: screenButtonWidth,
          tandem: tandem.createTandem(`${screen.tandem.name}Button`)
        });
      });
      const allNavBarScreenButtons = [this.homeButton, ...screenButtons];

      // Layout out screen buttons horizontally, with equal distance between their centers
      // Make sure each button is at least a minimum size, so they don't get too close together, see #279
      const maxScreenButtonWidth = Math.max(MINIMUM_SCREEN_BUTTON_WIDTH, _.maxBy(screenButtons, button => {
        return button.width;
      }).width);
      const maxScreenButtonHeight = _.maxBy(screenButtons, button => button.height).height;
      const screenButtonMap = new Map();
      screenButtons.forEach(screenButton => {
        screenButtonMap.set(screenButton.screen, new AlignBox(screenButton, {
          excludeInvisibleChildrenFromBounds: true,
          alignBounds: new Bounds2(0, 0, maxScreenButtonWidth, maxScreenButtonHeight),
          visibleProperty: screenButton.visibleProperty
        }));
      });

      // Put all screen buttons under a parent, to simplify layout
      const screenButtonsContainer = new HBox({
        spacing: SCREEN_BUTTON_SPACING,
        maxWidth: availableTotal // in case we have so many screens that the screen buttons need to be scaled down
      });

      buttons.addChild(screenButtonsContainer);
      sim.activeSimScreensProperty.link(simScreens => {
        screenButtonsContainer.children = simScreens.map(screen => screenButtonMap.get(screen));
      });

      // Screen buttons centered.  These buttons are centered around the origin in the screenButtonsContainer, so the
      // screenButtonsContainer can be put at the center of the navbar.
      ManualConstraint.create(this, [this.background, screenButtonsContainer], (backgroundProxy, screenButtonsContainerProxy) => {
        screenButtonsContainerProxy.center = backgroundProxy.center;
      });

      // home button to the left of screen buttons
      RelaxedManualConstraint.create(this.barContents, [this.homeButton, ...screenButtons], (homeButtonProxy, ...screenButtonProxies) => {
        const visibleScreenButtonProxies = screenButtonProxies.filter(proxy => proxy && proxy.visible);

        // Find the left-most visible button. We don't want the extra padding of the alignbox to be included in this calculation,
        // for backwards compatibility, so it's a lot more complicated.
        if (homeButtonProxy && visibleScreenButtonProxies.length > 0) {
          homeButtonProxy.right = Math.min(...visibleScreenButtonProxies.map(proxy => proxy.left)) - HOME_BUTTON_RIGHT_MARGIN;
        }
      });

      // max width relative to position of home button
      ManualConstraint.create(this.barContents, [this.homeButton, titleText], (homeButtonProxy, titleTextProxy) => {
        titleTextProxy.maxWidth = homeButtonProxy.left - TITLE_LEFT_MARGIN - TITLE_RIGHT_MARGIN;
      });
      sim.simNameProperty.link(simName => {
        allNavBarScreenButtons.forEach(screenButton => {
          screenButton.voicingContextResponse = simName;
        });
      });
    }

    // initial layout (that doesn't need to change when we are re-laid out)
    titleText.left = TITLE_LEFT_MARGIN;
    titleText.centerY = NAVIGATION_BAR_SIZE.height / 2;
    phetButton.centerY = NAVIGATION_BAR_SIZE.height / 2;
    ManualConstraint.create(this, [this.background, phetButton], (backgroundProxy, phetButtonProxy) => {
      phetButtonProxy.right = backgroundProxy.right - PHET_BUTTON_RIGHT_MARGIN;
    });
    ManualConstraint.create(this.barContents, [phetButton, this.a11yButtonsHBox], (phetButtonProxy, a11yButtonsHBoxProxy) => {
      a11yButtonsHBoxProxy.right = phetButtonProxy.left - PHET_BUTTON_LEFT_MARGIN;

      // The icon is vertically adjusted in KeyboardHelpButton, so that the centers can be aligned here
      a11yButtonsHBoxProxy.centerY = phetButtonProxy.centerY;
    });
    if (this.localeNode) {
      ManualConstraint.create(this.barContents, [phetButton, this.a11yButtonsHBox, this.localeNode], (phetButtonProxy, a11yButtonsHBoxProxy, localeNodeProxy) => {
        a11yButtonsHBoxProxy.right = phetButtonProxy.left - PHET_BUTTON_LEFT_MARGIN;

        // The icon is vertically adjusted in KeyboardHelpButton, so that the centers can be aligned here
        a11yButtonsHBoxProxy.centerY = phetButtonProxy.centerY;
        localeNodeProxy.centerY = phetButtonProxy.centerY;
        localeNodeProxy.right = Math.min(a11yButtonsHBoxProxy.left, phetButtonProxy.left) - PHET_BUTTON_LEFT_MARGIN;
      });
    }
    this.layout(1, NAVIGATION_BAR_SIZE.width, NAVIGATION_BAR_SIZE.height);
    const simResourcesContainer = new Node({
      // pdom
      tagName: 'div',
      containerTagName: 'section',
      labelTagName: 'h2',
      labelContent: JoistStrings.a11y.simResourcesStringProperty,
      pdomOrder: [this.a11yButtonsHBox, phetButton].filter(node => node !== undefined)
    });
    simResourcesContainer.ariaLabelledbyAssociations = [{
      thisElementName: PDOMPeer.CONTAINER_PARENT,
      otherElementName: PDOMPeer.LABEL_SIBLING,
      otherNode: simResourcesContainer
    }];
    this.addChild(simResourcesContainer);
  }

  /**
   * Called when the navigation bar layout needs to be updated, typically when the browser window is resized.
   */
  layout(scale, width, height) {
    // resize the background
    this.background.rectWidth = width;
    this.background.rectHeight = height;

    // scale the entire bar contents
    this.barContents.setScaleMagnitude(scale);
  }
  static NAVIGATION_BAR_SIZE = NAVIGATION_BAR_SIZE;
}
joist.register('NavigationBar', NavigationBar);
export default NavigationBar;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJTdHJpbmdQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJQaGV0Rm9udCIsIkFsaWduQm94IiwiSEJveCIsIk1hbnVhbENvbnN0cmFpbnQiLCJOb2RlIiwiUERPTVBlZXIiLCJSZWN0YW5nbGUiLCJSZWxheGVkTWFudWFsQ29uc3RyYWludCIsIlRleHQiLCJUYW5kZW0iLCJBMTF5QnV0dG9uc0hCb3giLCJIb21lQnV0dG9uIiwiSG9tZVNjcmVlbiIsIkhvbWVTY3JlZW5WaWV3Iiwiam9pc3QiLCJKb2lzdFN0cmluZ3MiLCJOYXZpZ2F0aW9uQmFyU2NyZWVuQnV0dG9uIiwiUGhldEJ1dHRvbiIsIkJvdW5kczIiLCJCb29sZWFuUHJvcGVydHkiLCJOQVZJR0FUSU9OX0JBUl9TSVpFIiwiTEFZT1VUX0JPVU5EUyIsIndpZHRoIiwiVElUTEVfTEVGVF9NQVJHSU4iLCJUSVRMRV9SSUdIVF9NQVJHSU4iLCJQSEVUX0JVVFRPTl9MRUZUX01BUkdJTiIsIlBIRVRfQlVUVE9OX1JJR0hUX01BUkdJTiIsIkhPTUVfQlVUVE9OX0xFRlRfTUFSR0lOIiwiSE9NRV9CVVRUT05fUklHSFRfTUFSR0lOIiwiU0NSRUVOX0JVVFRPTl9TUEFDSU5HIiwiTUlOSU1VTV9TQ1JFRU5fQlVUVE9OX1dJRFRIIiwiTmF2aWdhdGlvbkJhciIsImhvbWVCdXR0b24iLCJjb25zdHJ1Y3RvciIsInNpbSIsInRhbmRlbSIsIm5hdmlnYXRpb25CYXJGaWxsUHJvcGVydHkiLCJzZWxlY3RlZFNjcmVlblByb3BlcnR5IiwibG9va0FuZEZlZWwiLCJzY3JlZW4iLCJzaW1OYXZpZ2F0aW9uQmFyRmlsbCIsInNob3dIb21lU2NyZWVuIiwiaG9tZVNjcmVlbiIsIkJBQ0tHUk9VTkRfQ09MT1IiLCJiYWNrZ3JvdW5kIiwiaGVpZ2h0IiwicGlja2FibGUiLCJmaWxsIiwiYWRkQ2hpbGQiLCJiYXJDb250ZW50cyIsInRpdGxlVGV4dCIsImRpc3BsYXllZFNpbU5hbWVQcm9wZXJ0eSIsImZvbnQiLCJuYXZpZ2F0aW9uQmFyVGV4dEZpbGxQcm9wZXJ0eSIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb0ZlYXR1cmVkIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInZpc2libGVQcm9wZXJ0eU9wdGlvbnMiLCJzdHJpbmdQcm9wZXJ0eU9wdGlvbnMiLCJwaGV0aW9SZWFkT25seSIsInRpdGxlQ29udGFpbmVyTm9kZSIsImNoaWxkcmVuIiwidmlzaWJsZVByb3BlcnR5IiwicGhldEJ1dHRvbiIsImExMXlCdXR0b25zSEJveCIsImxvY2FsZU5vZGUiLCJhZGRBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uIiwidGhpc0VsZW1lbnROYW1lIiwiUFJJTUFSWV9TSUJMSU5HIiwib3RoZXJOb2RlIiwib3RoZXJFbGVtZW50TmFtZSIsIkxBQkVMX1NJQkxJTkciLCJidXR0b25zIiwiYTExeUJ1dHRvbnNXaWR0aCIsImJvdW5kcyIsImlzVmFsaWQiLCJzaW1TY3JlZW5zIiwibGVuZ3RoIiwibWF4V2lkdGgiLCJtYXhUaXRsZVdpZHRoIiwiTWF0aCIsIm1pbiIsImlzVXNlck5hdmlnYWJsZVByb3BlcnR5IiwiR0VORVJBTF9NT0RFTCIsInRhZ05hbWUiLCJjb250YWluZXJUYWdOYW1lIiwibGFiZWxUYWdOYW1lIiwibGFiZWxDb250ZW50IiwiYTExeSIsInNpbVNjcmVlbnNTdHJpbmdQcm9wZXJ0eSIsImFjdGl2ZVNpbVNjcmVlbnNQcm9wZXJ0eSIsInNjcmVlbnMiLCJpc1VzZXJOYXZpZ2FibGUiLCJhcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucyIsIkNPTlRBSU5FUl9QQVJFTlQiLCJwZG9tRGlzcGxheU5hbWVQcm9wZXJ0eSIsImxpc3RlbmVyIiwidmFsdWUiLCJpc1BET01DbGlja2luZyIsInZpZXciLCJmb2N1c0hpZ2hsaWdodGVkU2NyZWVuQnV0dG9uIiwiY2VudGVyWSIsImF2YWlsYWJsZUxlZnQiLCJhdmFpbGFibGVSaWdodCIsImF2YWlsYWJsZVRvdGFsIiwic2NyZWVuQnV0dG9uV2lkdGgiLCJzY3JlZW5CdXR0b25zIiwibWFwIiwiaW5kZXhPZiIsIm1heEJ1dHRvbldpZHRoIiwibmFtZSIsImFsbE5hdkJhclNjcmVlbkJ1dHRvbnMiLCJtYXhTY3JlZW5CdXR0b25XaWR0aCIsIm1heCIsIl8iLCJtYXhCeSIsImJ1dHRvbiIsIm1heFNjcmVlbkJ1dHRvbkhlaWdodCIsInNjcmVlbkJ1dHRvbk1hcCIsIk1hcCIsImZvckVhY2giLCJzY3JlZW5CdXR0b24iLCJzZXQiLCJleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzIiwiYWxpZ25Cb3VuZHMiLCJzY3JlZW5CdXR0b25zQ29udGFpbmVyIiwic3BhY2luZyIsImxpbmsiLCJnZXQiLCJjcmVhdGUiLCJiYWNrZ3JvdW5kUHJveHkiLCJzY3JlZW5CdXR0b25zQ29udGFpbmVyUHJveHkiLCJjZW50ZXIiLCJob21lQnV0dG9uUHJveHkiLCJzY3JlZW5CdXR0b25Qcm94aWVzIiwidmlzaWJsZVNjcmVlbkJ1dHRvblByb3hpZXMiLCJmaWx0ZXIiLCJwcm94eSIsInZpc2libGUiLCJyaWdodCIsImxlZnQiLCJ0aXRsZVRleHRQcm94eSIsInNpbU5hbWVQcm9wZXJ0eSIsInNpbU5hbWUiLCJ2b2ljaW5nQ29udGV4dFJlc3BvbnNlIiwicGhldEJ1dHRvblByb3h5IiwiYTExeUJ1dHRvbnNIQm94UHJveHkiLCJsb2NhbGVOb2RlUHJveHkiLCJsYXlvdXQiLCJzaW1SZXNvdXJjZXNDb250YWluZXIiLCJzaW1SZXNvdXJjZXNTdHJpbmdQcm9wZXJ0eSIsInBkb21PcmRlciIsIm5vZGUiLCJ1bmRlZmluZWQiLCJzY2FsZSIsInJlY3RXaWR0aCIsInJlY3RIZWlnaHQiLCJzZXRTY2FsZU1hZ25pdHVkZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTmF2aWdhdGlvbkJhci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGUgbmF2aWdhdGlvbiBiYXIgYXQgdGhlIGJvdHRvbSBvZiB0aGUgc2NyZWVuLlxyXG4gKiBGb3IgYSBzaW5nbGUtc2NyZWVuIHNpbSwgaXQgc2hvd3MgdGhlIG5hbWUgb2YgdGhlIHNpbSBhdCB0aGUgZmFyIGxlZnQgYW5kIHRoZSBQaEVUIGJ1dHRvbiBhdCB0aGUgZmFyIHJpZ2h0LlxyXG4gKiBGb3IgYSBtdWx0aS1zY3JlZW4gc2ltLCBpdCBhZGRpdGlvbmFsbHkgc2hvd3MgYnV0dG9ucyBmb3IgZWFjaCBzY3JlZW4sIGFuZCBhIGhvbWUgYnV0dG9uLlxyXG4gKlxyXG4gKiBMYXlvdXQgb2YgTmF2aWdhdGlvbkJhciBhZGFwdHMgdG8gZGlmZmVyZW50IHRleHQgd2lkdGhzLCBpY29uIHdpZHRocywgYW5kIG51bWJlcnMgb2Ygc2NyZWVucywgYW5kIGF0dGVtcHRzIHRvXHJcbiAqIHBlcmZvcm0gYW4gXCJvcHRpbWFsXCIgbGF5b3V0LiBUaGUgc2ltIHRpdGxlIGlzIGluaXRpYWxseSBjb25zdHJhaW5lZCB0byBhIG1heCBwZXJjZW50YWdlIG9mIHRoZSBiYXIgd2lkdGgsXHJcbiAqIGFuZCB0aGF0J3MgdXNlZCB0byBjb21wdXRlIGhvdyBtdWNoIHNwYWNlIGlzIGF2YWlsYWJsZSBmb3Igc2NyZWVuIGJ1dHRvbnMuICBBZnRlciBjcmVhdGlvbiBhbmQgbGF5b3V0IG9mIHRoZVxyXG4gKiBzY3JlZW4gYnV0dG9ucywgd2UgdGhlbiBjb21wdXRlIGhvdyBtdWNoIHNwYWNlIGlzIGFjdHVhbGx5IGF2YWlsYWJsZSBmb3IgdGhlIHNpbSB0aXRsZSwgYW5kIHVzZSB0aGF0IHRvXHJcbiAqIGNvbnN0cmFpbiB0aGUgdGl0bGUncyB3aWR0aC5cclxuICpcclxuICogVGhlIGJhciBpcyBjb21wb3NlZCBvZiBhIGJhY2tncm91bmQgKGFsd2F5cyBwaXhlbC1wZXJmZWN0KSwgYW5kIGV4cGFuZGFibGUgY29udGVudCAodGhhdCBnZXRzIHNjYWxlZCBhcyBvbmUgcGFydCkuXHJcbiAqIElmIHdlIGFyZSB3aWR0aC1jb25zdHJhaW5lZCwgdGhlIG5hdmlnYXRpb24gYmFyIGlzIGluIGEgJ2NvbXBhY3QnIHN0YXRlIHdoZXJlIHRoZSBjaGlsZHJlbiBvZiB0aGUgY29udGVudCAoZS5nLlxyXG4gKiBob21lIGJ1dHRvbiwgc2NyZWVuIGJ1dHRvbnMsIHBoZXQgbWVudSwgdGl0bGUpIGRvIG5vdCBjaGFuZ2UgcG9zaXRpb25zLiBJZiB3ZSBhcmUgaGVpZ2h0LWNvbnN0cmFpbmVkLCB0aGUgYW1vdW50XHJcbiAqIGF2YWlsYWJsZSB0byB0aGUgYmFyIGV4cGFuZHMsIHNvIHdlIGxheSBvdXQgdGhlIGNoaWxkcmVuIHRvIGZpdC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvMjgzXHJcbiAqIGZvciBtb3JlIGRldGFpbHMgb24gaG93IHRoaXMgaXMgZG9uZS5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBTdHJpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1N0cmluZ1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgQWxpZ25Cb3gsIENvbG9yLCBIQm94LCBNYW51YWxDb25zdHJhaW50LCBOb2RlLCBQRE9NUGVlciwgUmVjdGFuZ2xlLCBSZWxheGVkTWFudWFsQ29uc3RyYWludCwgVGV4dCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBBMTF5QnV0dG9uc0hCb3ggZnJvbSAnLi9BMTF5QnV0dG9uc0hCb3guanMnO1xyXG5pbXBvcnQgSG9tZUJ1dHRvbiBmcm9tICcuL0hvbWVCdXR0b24uanMnO1xyXG5pbXBvcnQgSG9tZVNjcmVlbiBmcm9tICcuL0hvbWVTY3JlZW4uanMnO1xyXG5pbXBvcnQgSG9tZVNjcmVlblZpZXcgZnJvbSAnLi9Ib21lU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBqb2lzdCBmcm9tICcuL2pvaXN0LmpzJztcclxuaW1wb3J0IEpvaXN0U3RyaW5ncyBmcm9tICcuL0pvaXN0U3RyaW5ncy5qcyc7XHJcbmltcG9ydCBOYXZpZ2F0aW9uQmFyU2NyZWVuQnV0dG9uIGZyb20gJy4vTmF2aWdhdGlvbkJhclNjcmVlbkJ1dHRvbi5qcyc7XHJcbmltcG9ydCBQaGV0QnV0dG9uIGZyb20gJy4vUGhldEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBTaW0gZnJvbSAnLi9TaW0uanMnO1xyXG5pbXBvcnQgUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1JlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCB7IEFueVNjcmVlbiB9IGZyb20gJy4vU2NyZWVuLmpzJztcclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuLy8gZm9yIGxheW91dCBvZiB0aGUgTmF2aWdhdGlvbkJhciwgdXNlZCBpbiB0aGUgZm9sbG93aW5nIHdheTpcclxuLy8gW1xyXG4vLyAge1RJVExFX0xFRlRfTUFSR0lOfVRpdGxle1RJVExFX1JJR0hUX01BUkdJTn1cclxuLy8gIHtIT01FX0JVVFRPTl9MRUZUX01BUkdJTn1Ib21lQnV0dG9ue0hPTUVfQlVUVE9OX1JJR0hUX01BUkdJTn0gKGlmIHZpc2libGUpXHJcbi8vICB7U2NyZWVuQnV0dG9ucyBjZW50ZXJlZH0gKGlmIHZpc2libGUpXHJcbi8vICBhMTF5QnV0dG9uc0hCb3ggKGlmIHByZXNlbnQpe1BIRVRfQlVUVE9OX0xFRlRfTUFSR0lOfVBoZXRCdXR0b257UEhFVF9CVVRUT05fUklHSFRfTUFSR0lOfVxyXG4vLyBdXHJcbmNvbnN0IE5BVklHQVRJT05fQkFSX1NJWkUgPSBuZXcgRGltZW5zaW9uMiggSG9tZVNjcmVlblZpZXcuTEFZT1VUX0JPVU5EUy53aWR0aCwgNDAgKTtcclxuY29uc3QgVElUTEVfTEVGVF9NQVJHSU4gPSAxMDtcclxuY29uc3QgVElUTEVfUklHSFRfTUFSR0lOID0gMjU7XHJcbmNvbnN0IFBIRVRfQlVUVE9OX0xFRlRfTUFSR0lOID0gNjtcclxuY29uc3QgUEhFVF9CVVRUT05fUklHSFRfTUFSR0lOID0gMTA7XHJcbmNvbnN0IEhPTUVfQlVUVE9OX0xFRlRfTUFSR0lOID0gNTtcclxuY29uc3QgSE9NRV9CVVRUT05fUklHSFRfTUFSR0lOID0gSE9NRV9CVVRUT05fTEVGVF9NQVJHSU47XHJcbmNvbnN0IFNDUkVFTl9CVVRUT05fU1BBQ0lORyA9IDA7XHJcbmNvbnN0IE1JTklNVU1fU0NSRUVOX0JVVFRPTl9XSURUSCA9IDYwOyAvLyBNYWtlIHN1cmUgZWFjaCBidXR0b24gaXMgYXQgbGVhc3QgYSBtaW5pbXVtIHdpZHRoIHNvIHRoZXkgZG9uJ3QgZ2V0IHRvbyBjbG9zZSB0b2dldGhlciwgc2VlICMyNzlcclxuXHJcbmNsYXNzIE5hdmlnYXRpb25CYXIgZXh0ZW5kcyBOb2RlIHtcclxuICBwcml2YXRlIHJlYWRvbmx5IG5hdmlnYXRpb25CYXJGaWxsUHJvcGVydHk6IFJlYWRPbmx5UHJvcGVydHk8Q29sb3I+O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgYmFja2dyb3VuZDogUmVjdGFuZ2xlO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgYmFyQ29udGVudHM6IE5vZGU7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBhMTF5QnV0dG9uc0hCb3g6IEExMXlCdXR0b25zSEJveDtcclxuICBwcml2YXRlIHJlYWRvbmx5IGxvY2FsZU5vZGUhOiBOb2RlO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgaG9tZUJ1dHRvbjogSG9tZUJ1dHRvbiB8IG51bGwgPSBudWxsOyAvLyBtdXRhdGVkIGlmIG11bHRpc2NyZWVuIHNpbVxyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHNpbTogU2ltLCB0YW5kZW06IFRhbmRlbSApIHtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIFRoZSBuYXYgYmFyIGZpbGwgYW5kIGRldGVybWluaW5nIGZpbGwgZm9yIGVsZW1lbnRzIG9uIHRoZSBuYXYgYmFyIChpZiBpdCdzIGJsYWNrLCB0aGUgZWxlbWVudHMgYXJlIHdoaXRlKVxyXG4gICAgdGhpcy5uYXZpZ2F0aW9uQmFyRmlsbFByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggW1xyXG4gICAgICBzaW0uc2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eSxcclxuICAgICAgc2ltLmxvb2tBbmRGZWVsLm5hdmlnYXRpb25CYXJGaWxsUHJvcGVydHlcclxuICAgIF0sICggc2NyZWVuLCBzaW1OYXZpZ2F0aW9uQmFyRmlsbCApID0+IHtcclxuXHJcbiAgICAgIGNvbnN0IHNob3dIb21lU2NyZWVuID0gc2NyZWVuID09PSBzaW0uaG9tZVNjcmVlbjtcclxuXHJcbiAgICAgIC8vIElmIHRoZSBob21lc2NyZWVuIGlzIHNob3dpbmcsIHRoZSBuYXZpZ2F0aW9uIGJhciBzaG91bGQgYmxlbmQgaW50byBpdC4gIFRoaXMgaXMgZG9uZSBieSBtYWtpbmcgaXQgdGhlIHNhbWUgY29sb3IuXHJcbiAgICAgIC8vIEl0IGNhbm5vdCBiZSBtYWRlIHRyYW5zcGFyZW50IGhlcmUsIGJlY2F1c2Ugb3RoZXIgY29kZSByZWxpZXMgb24gdGhlIHZhbHVlIG9mIG5hdmlnYXRpb25CYXJGaWxsUHJvcGVydHkgYmVpbmdcclxuICAgICAgLy8gJ2JsYWNrJyB0byBtYWtlIHRoZSBpY29ucyBzaG93IHVwIGFzIHdoaXRlLCBldmVuIHdoZW4gdGhlIG5hdmlnYXRpb24gYmFyIGlzIGhpZGRlbiBvbiB0aGUgaG9tZSBzY3JlZW4uXHJcbiAgICAgIHJldHVybiBzaG93SG9tZVNjcmVlbiA/IEhvbWVTY3JlZW4uQkFDS0dST1VORF9DT0xPUiA6IHNpbU5hdmlnYXRpb25CYXJGaWxsO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRoZSBiYXIncyBiYWNrZ3JvdW5kIChyZXNpemVkIGluIGxheW91dClcclxuICAgIHRoaXMuYmFja2dyb3VuZCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIE5BVklHQVRJT05fQkFSX1NJWkUud2lkdGgsIE5BVklHQVRJT05fQkFSX1NJWkUuaGVpZ2h0LCB7XHJcbiAgICAgIHBpY2thYmxlOiB0cnVlLFxyXG4gICAgICBmaWxsOiB0aGlzLm5hdmlnYXRpb25CYXJGaWxsUHJvcGVydHlcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuYmFja2dyb3VuZCApO1xyXG5cclxuICAgIC8vIEV2ZXJ5dGhpbmcgZWxzZSBiZXNpZGVzIHRoZSBiYWNrZ3JvdW5kIGluIHRoZSBuYXZpZ2F0aW9uIGJhciAodXNlZCBmb3Igc2NhbGluZylcclxuICAgIHRoaXMuYmFyQ29udGVudHMgPSBuZXcgTm9kZSgpO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5iYXJDb250ZW50cyApO1xyXG5cclxuICAgIGNvbnN0IHRpdGxlVGV4dCA9IG5ldyBUZXh0KCBzaW0uZGlzcGxheWVkU2ltTmFtZVByb3BlcnR5LCB7XHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTYgKSxcclxuICAgICAgZmlsbDogc2ltLmxvb2tBbmRGZWVsLm5hdmlnYXRpb25CYXJUZXh0RmlsbFByb3BlcnR5LFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0aXRsZVRleHQnICksXHJcbiAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRGlzcGxheXMgdGhlIHRpdGxlIG9mIHRoZSBzaW11bGF0aW9uIGluIHRoZSBuYXZpZ2F0aW9uIGJhciAoYm90dG9tIGxlZnQpJyxcclxuICAgICAgdmlzaWJsZVByb3BlcnR5T3B0aW9uczogeyBwaGV0aW9GZWF0dXJlZDogdHJ1ZSB9LFxyXG4gICAgICBzdHJpbmdQcm9wZXJ0eU9wdGlvbnM6IHsgcGhldGlvUmVhZE9ubHk6IHRydWUgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIENvbnRhaW5lciBub2RlIHNvIHRoYXQgdGhlIHZpc2liaWxpdHkgb2YgdGhlIE5hdmlnYXRpb24gQmFyIHRpdGxlIHRleHQgY2FuIGJlIGNvbnRyb2xsZWRcclxuICAgIC8vIGluZGVwZW5kZW50bHkgYnkgUGhFVC1pTyBhbmQgd2hldGhlciB0aGUgdXNlciBpcyBvbiB0aGUgaG9tZXNjcmVlbi5cclxuICAgIGNvbnN0IHRpdGxlQ29udGFpbmVyTm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIHRpdGxlVGV4dCBdLFxyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgc2ltLnNlbGVjdGVkU2NyZWVuUHJvcGVydHkgXSwgc2NyZWVuID0+IHNjcmVlbiAhPT0gc2ltLmhvbWVTY3JlZW4gKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5iYXJDb250ZW50cy5hZGRDaGlsZCggdGl0bGVDb250YWluZXJOb2RlICk7XHJcblxyXG4gICAgLy8gUGhFVCBidXR0b24sIGZpbGwgZGV0ZXJtaW5lZCBieSBzdGF0ZSBvZiBuYXZpZ2F0aW9uQmFyRmlsbFByb3BlcnR5XHJcbiAgICBjb25zdCBwaGV0QnV0dG9uID0gbmV3IFBoZXRCdXR0b24oXHJcbiAgICAgIHNpbSxcclxuICAgICAgdGhpcy5uYXZpZ2F0aW9uQmFyRmlsbFByb3BlcnR5LFxyXG4gICAgICB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncGhldEJ1dHRvbicgKVxyXG4gICAgKTtcclxuICAgIHRoaXMuYmFyQ29udGVudHMuYWRkQ2hpbGQoIHBoZXRCdXR0b24gKTtcclxuXHJcbiAgICAvLyBhMTF5IEhCb3gsIGJ1dHRvbiBmaWxscyBkZXRlcm1pbmVkIGJ5IHN0YXRlIG9mIG5hdmlnYXRpb25CYXJGaWxsUHJvcGVydHlcclxuICAgIHRoaXMuYTExeUJ1dHRvbnNIQm94ID0gbmV3IEExMXlCdXR0b25zSEJveChcclxuICAgICAgc2ltLFxyXG4gICAgICB0aGlzLm5hdmlnYXRpb25CYXJGaWxsUHJvcGVydHksIHtcclxuICAgICAgICB0YW5kZW06IHRhbmRlbSAvLyBubyBuZWVkIGZvciBhIGNvbnRhaW5lciBoZXJlLiBJZiB0aGVyZSBpcyBhIGNvbmZsaWN0LCB0aGVuIGl0IHdpbGwgZXJyb3IgbG91ZGx5LlxyXG4gICAgICB9XHJcbiAgICApO1xyXG4gICAgdGhpcy5iYXJDb250ZW50cy5hZGRDaGlsZCggdGhpcy5hMTF5QnV0dG9uc0hCb3ggKTtcclxuICAgIHRoaXMubG9jYWxlTm9kZSAmJiB0aGlzLmJhckNvbnRlbnRzLmFkZENoaWxkKCB0aGlzLmxvY2FsZU5vZGUgKTtcclxuXHJcbiAgICAvLyBwZG9tIC0gdGVsbCB0aGlzIG5vZGUgdGhhdCBpdCBpcyBhcmlhLWxhYmVsbGVkIGJ5IGl0cyBvd24gbGFiZWxDb250ZW50LlxyXG4gICAgdGhpcy5hZGRBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uKCB7XHJcbiAgICAgIHRoaXNFbGVtZW50TmFtZTogUERPTVBlZXIuUFJJTUFSWV9TSUJMSU5HLFxyXG4gICAgICBvdGhlck5vZGU6IHRoaXMsXHJcbiAgICAgIG90aGVyRWxlbWVudE5hbWU6IFBET01QZWVyLkxBQkVMX1NJQkxJTkdcclxuICAgIH0gKTtcclxuXHJcbiAgICBsZXQgYnV0dG9uczogTm9kZTtcclxuXHJcbiAgICBjb25zdCBhMTF5QnV0dG9uc1dpZHRoID0gKCB0aGlzLmExMXlCdXR0b25zSEJveC5ib3VuZHMuaXNWYWxpZCgpID8gdGhpcy5hMTF5QnV0dG9uc0hCb3gud2lkdGggOiAwICk7XHJcblxyXG4gICAgLy8gTm8gcG90ZW50aWFsIGZvciBtdWx0aXBsZSBzY3JlZW5zIGlmIHRoaXMgaXMgdHJ1ZVxyXG4gICAgaWYgKCBzaW0uc2ltU2NyZWVucy5sZW5ndGggPT09IDEgKSB7XHJcblxyXG4gICAgICAvKiBzaW5nbGUtc2NyZWVuIHNpbSAqL1xyXG5cclxuICAgICAgLy8gdGl0bGUgY2FuIG9jY3VweSBhbGwgc3BhY2UgdG8gdGhlIGxlZnQgb2YgdGhlIFBoRVQgYnV0dG9uXHJcbiAgICAgIHRpdGxlVGV4dC5tYXhXaWR0aCA9IEhvbWVTY3JlZW5WaWV3LkxBWU9VVF9CT1VORFMud2lkdGggLSBUSVRMRV9MRUZUX01BUkdJTiAtIFRJVExFX1JJR0hUX01BUkdJTiAtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFBIRVRfQlVUVE9OX0xFRlRfTUFSR0lOIC0gYTExeUJ1dHRvbnNXaWR0aCAtICggdGhpcy5sb2NhbGVOb2RlID8gdGhpcy5sb2NhbGVOb2RlLndpZHRoIDogMCApIC0gUEhFVF9CVVRUT05fTEVGVF9NQVJHSU4gLVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBwaGV0QnV0dG9uLndpZHRoIC0gUEhFVF9CVVRUT05fUklHSFRfTUFSR0lOO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvKiBtdWx0aS1zY3JlZW4gc2ltICovXHJcblxyXG4gICAgICAvLyBTdGFydCB3aXRoIHRoZSBhc3N1bXB0aW9uIHRoYXQgdGhlIHRpdGxlIGNhbiBvY2N1cHkgKGF0IG1vc3QpIHRoaXMgcGVyY2VudGFnZSBvZiB0aGUgYmFyLlxyXG4gICAgICBjb25zdCBtYXhUaXRsZVdpZHRoID0gTWF0aC5taW4oIHRpdGxlVGV4dC53aWR0aCwgMC4yMCAqIEhvbWVTY3JlZW5WaWV3LkxBWU9VVF9CT1VORFMud2lkdGggKTtcclxuXHJcbiAgICAgIGNvbnN0IGlzVXNlck5hdmlnYWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICAgIHRhbmRlbTogVGFuZGVtLkdFTkVSQUxfTU9ERUwuY3JlYXRlVGFuZGVtKCAnc2NyZWVucycgKS5jcmVhdGVUYW5kZW0oICdpc1VzZXJOYXZpZ2FibGVQcm9wZXJ0eScgKSxcclxuICAgICAgICBwaGV0aW9GZWF0dXJlZDogdHJ1ZSxcclxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnSWYgdGhlIHNjcmVlbnMgYXJlIHVzZXIgbmF2aWdhYmxlLCBpY29ucyBhcmUgZGlzcGxheWVkIGluIHRoZSBuYXZpZ2F0aW9uIGJhciBhbmQgdGhlIHVzZXIgY2FuIHN3aXRjaCBiZXR3ZWVuIHNjcmVlbnMuJ1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBwZG9tIC0gY29udGFpbmVyIGZvciB0aGUgaG9tZUJ1dHRvbiBhbmQgYWxsIHRoZSBzY3JlZW4gYnV0dG9ucy5cclxuICAgICAgYnV0dG9ucyA9IG5ldyBOb2RlKCB7XHJcbiAgICAgICAgdGFnTmFtZTogJ29sJyxcclxuICAgICAgICBjb250YWluZXJUYWdOYW1lOiAnbmF2JyxcclxuICAgICAgICBsYWJlbFRhZ05hbWU6ICdoMicsXHJcbiAgICAgICAgbGFiZWxDb250ZW50OiBKb2lzdFN0cmluZ3MuYTExeS5zaW1TY3JlZW5zU3RyaW5nUHJvcGVydHksXHJcbiAgICAgICAgdmlzaWJsZVByb3BlcnR5OiBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHNpbS5hY3RpdmVTaW1TY3JlZW5zUHJvcGVydHksIHNpbS5zZWxlY3RlZFNjcmVlblByb3BlcnR5LCBpc1VzZXJOYXZpZ2FibGVQcm9wZXJ0eSBdLCAoIHNjcmVlbnMsIHNjcmVlbiwgaXNVc2VyTmF2aWdhYmxlICkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIHNjcmVlbiAhPT0gc2ltLmhvbWVTY3JlZW4gJiYgc2NyZWVucy5sZW5ndGggPiAxICYmIGlzVXNlck5hdmlnYWJsZTtcclxuICAgICAgICB9IClcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgYnV0dG9ucy5hcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucyA9IFsge1xyXG4gICAgICAgIHRoaXNFbGVtZW50TmFtZTogUERPTVBlZXIuQ09OVEFJTkVSX1BBUkVOVCxcclxuICAgICAgICBvdGhlckVsZW1lbnROYW1lOiBQRE9NUGVlci5MQUJFTF9TSUJMSU5HLFxyXG4gICAgICAgIG90aGVyTm9kZTogYnV0dG9uc1xyXG4gICAgICB9IF07XHJcbiAgICAgIHRoaXMuYmFyQ29udGVudHMuYWRkQ2hpbGQoIGJ1dHRvbnMgKTtcclxuXHJcbiAgICAgIC8vIENyZWF0ZSB0aGUgaG9tZSBidXR0b25cclxuICAgICAgdGhpcy5ob21lQnV0dG9uID0gbmV3IEhvbWVCdXR0b24oXHJcbiAgICAgICAgTkFWSUdBVElPTl9CQVJfU0laRS5oZWlnaHQsXHJcbiAgICAgICAgc2ltLmxvb2tBbmRGZWVsLm5hdmlnYXRpb25CYXJGaWxsUHJvcGVydHksXHJcbiAgICAgICAgc2ltLmhvbWVTY3JlZW4gPyBzaW0uaG9tZVNjcmVlbi5wZG9tRGlzcGxheU5hbWVQcm9wZXJ0eSA6IG5ldyBTdHJpbmdQcm9wZXJ0eSggJ05PIEhPTUUgU0NSRUVOJyApLCB7XHJcbiAgICAgICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgICAgICBzaW0uc2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eS52YWx1ZSA9IHNpbS5ob21lU2NyZWVuITtcclxuXHJcbiAgICAgICAgICAgIC8vIG9ubHkgaWYgZmlyZWQgZnJvbSBhMTF5XHJcbiAgICAgICAgICAgIGlmICggdGhpcy5ob21lQnV0dG9uIS5pc1BET01DbGlja2luZygpICkge1xyXG4gICAgICAgICAgICAgIHNpbS5ob21lU2NyZWVuIS52aWV3LmZvY3VzSGlnaGxpZ2h0ZWRTY3JlZW5CdXR0b24oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2hvbWVCdXR0b24nICksXHJcbiAgICAgICAgICBjZW50ZXJZOiBOQVZJR0FUSU9OX0JBUl9TSVpFLmhlaWdodCAvIDJcclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBBZGQgdGhlIGhvbWUgYnV0dG9uLCBidXQgb25seSBpZiB0aGUgaG9tZVNjcmVlbiBleGlzdHNcclxuICAgICAgc2ltLmhvbWVTY3JlZW4gJiYgYnV0dG9ucy5hZGRDaGlsZCggdGhpcy5ob21lQnV0dG9uICk7XHJcblxyXG4gICAgICAvKlxyXG4gICAgICAgKiBBbGxvY2F0ZSByZW1haW5pbmcgaG9yaXpvbnRhbCBzcGFjZSBlcXVhbGx5IGZvciBzY3JlZW4gYnV0dG9ucywgYXNzdW1pbmcgdGhleSB3aWxsIGJlIGNlbnRlcmVkIGluIHRoZSBuYXZiYXIuXHJcbiAgICAgICAqIENvbXB1dGF0aW9ucyBoZXJlIHJlZmxlY3QgdGhlIGxlZnQtdG8tcmlnaHQgbGF5b3V0IG9mIHRoZSBuYXZiYXIuXHJcbiAgICAgICAqL1xyXG4gICAgICAvLyBhdmFpbGFibGUgd2lkdGggbGVmdCBvZiBjZW50ZXJcclxuICAgICAgY29uc3QgYXZhaWxhYmxlTGVmdCA9ICggSG9tZVNjcmVlblZpZXcuTEFZT1VUX0JPVU5EUy53aWR0aCAvIDIgKSAtIFRJVExFX0xFRlRfTUFSR0lOIC0gbWF4VGl0bGVXaWR0aCAtIFRJVExFX1JJR0hUX01BUkdJTiAtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBIT01FX0JVVFRPTl9MRUZUX01BUkdJTiAtIHRoaXMuaG9tZUJ1dHRvbi53aWR0aCAtIEhPTUVfQlVUVE9OX1JJR0hUX01BUkdJTjtcclxuXHJcbiAgICAgIC8vIGF2YWlsYWJsZSB3aWR0aCByaWdodCBvZiBjZW50ZXJcclxuICAgICAgY29uc3QgYXZhaWxhYmxlUmlnaHQgPSAoIEhvbWVTY3JlZW5WaWV3LkxBWU9VVF9CT1VORFMud2lkdGggLyAyICkgLSBQSEVUX0JVVFRPTl9MRUZUX01BUkdJTiAtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYTExeUJ1dHRvbnNXaWR0aCAtICggdGhpcy5sb2NhbGVOb2RlID8gdGhpcy5sb2NhbGVOb2RlLndpZHRoIDogMCApIC0gUEhFVF9CVVRUT05fTEVGVF9NQVJHSU4gLSBwaGV0QnV0dG9uLndpZHRoIC1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBQSEVUX0JVVFRPTl9SSUdIVF9NQVJHSU47XHJcblxyXG4gICAgICAvLyB0b3RhbCBhdmFpbGFibGUgd2lkdGggZm9yIHRoZSBzY3JlZW4gYnV0dG9ucyB3aGVuIHRoZXkgYXJlIGNlbnRlcmVkXHJcbiAgICAgIGNvbnN0IGF2YWlsYWJsZVRvdGFsID0gMiAqIE1hdGgubWluKCBhdmFpbGFibGVMZWZ0LCBhdmFpbGFibGVSaWdodCApO1xyXG5cclxuICAgICAgLy8gd2lkdGggcGVyIHNjcmVlbiBidXR0b25cclxuICAgICAgY29uc3Qgc2NyZWVuQnV0dG9uV2lkdGggPSAoIGF2YWlsYWJsZVRvdGFsIC0gKCBzaW0uc2ltU2NyZWVucy5sZW5ndGggLSAxICkgKiBTQ1JFRU5fQlVUVE9OX1NQQUNJTkcgKSAvIHNpbS5zaW1TY3JlZW5zLmxlbmd0aDtcclxuXHJcbiAgICAgIC8vIENyZWF0ZSB0aGUgc2NyZWVuIGJ1dHRvbnNcclxuICAgICAgY29uc3Qgc2NyZWVuQnV0dG9ucyA9IHNpbS5zaW1TY3JlZW5zLm1hcCggc2NyZWVuID0+IHtcclxuICAgICAgICByZXR1cm4gbmV3IE5hdmlnYXRpb25CYXJTY3JlZW5CdXR0b24oXHJcbiAgICAgICAgICBzaW0ubG9va0FuZEZlZWwubmF2aWdhdGlvbkJhckZpbGxQcm9wZXJ0eSxcclxuICAgICAgICAgIHNpbS5zZWxlY3RlZFNjcmVlblByb3BlcnR5LFxyXG4gICAgICAgICAgc2NyZWVuLFxyXG4gICAgICAgICAgc2ltLnNpbVNjcmVlbnMuaW5kZXhPZiggc2NyZWVuICksXHJcbiAgICAgICAgICBOQVZJR0FUSU9OX0JBUl9TSVpFLmhlaWdodCwge1xyXG4gICAgICAgICAgICBtYXhCdXR0b25XaWR0aDogc2NyZWVuQnV0dG9uV2lkdGgsXHJcbiAgICAgICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggYCR7c2NyZWVuLnRhbmRlbS5uYW1lfUJ1dHRvbmAgKVxyXG4gICAgICAgICAgfSApO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIGNvbnN0IGFsbE5hdkJhclNjcmVlbkJ1dHRvbnMgPSBbIHRoaXMuaG9tZUJ1dHRvbiwgLi4uc2NyZWVuQnV0dG9ucyBdO1xyXG5cclxuICAgICAgLy8gTGF5b3V0IG91dCBzY3JlZW4gYnV0dG9ucyBob3Jpem9udGFsbHksIHdpdGggZXF1YWwgZGlzdGFuY2UgYmV0d2VlbiB0aGVpciBjZW50ZXJzXHJcbiAgICAgIC8vIE1ha2Ugc3VyZSBlYWNoIGJ1dHRvbiBpcyBhdCBsZWFzdCBhIG1pbmltdW0gc2l6ZSwgc28gdGhleSBkb24ndCBnZXQgdG9vIGNsb3NlIHRvZ2V0aGVyLCBzZWUgIzI3OVxyXG4gICAgICBjb25zdCBtYXhTY3JlZW5CdXR0b25XaWR0aCA9IE1hdGgubWF4KCBNSU5JTVVNX1NDUkVFTl9CVVRUT05fV0lEVEgsIF8ubWF4QnkoIHNjcmVlbkJ1dHRvbnMsIGJ1dHRvbiA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGJ1dHRvbi53aWR0aDtcclxuICAgICAgfSApIS53aWR0aCApO1xyXG4gICAgICBjb25zdCBtYXhTY3JlZW5CdXR0b25IZWlnaHQgPSBfLm1heEJ5KCBzY3JlZW5CdXR0b25zLCBidXR0b24gPT4gYnV0dG9uLmhlaWdodCApIS5oZWlnaHQ7XHJcblxyXG4gICAgICBjb25zdCBzY3JlZW5CdXR0b25NYXAgPSBuZXcgTWFwPEFueVNjcmVlbiwgTm9kZT4oKTtcclxuICAgICAgc2NyZWVuQnV0dG9ucy5mb3JFYWNoKCBzY3JlZW5CdXR0b24gPT4ge1xyXG4gICAgICAgIHNjcmVlbkJ1dHRvbk1hcC5zZXQoIHNjcmVlbkJ1dHRvbi5zY3JlZW4sIG5ldyBBbGlnbkJveCggc2NyZWVuQnV0dG9uLCB7XHJcbiAgICAgICAgICBleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzOiB0cnVlLFxyXG4gICAgICAgICAgYWxpZ25Cb3VuZHM6IG5ldyBCb3VuZHMyKCAwLCAwLCBtYXhTY3JlZW5CdXR0b25XaWR0aCwgbWF4U2NyZWVuQnV0dG9uSGVpZ2h0ICksXHJcbiAgICAgICAgICB2aXNpYmxlUHJvcGVydHk6IHNjcmVlbkJ1dHRvbi52aXNpYmxlUHJvcGVydHlcclxuICAgICAgICB9ICkgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gUHV0IGFsbCBzY3JlZW4gYnV0dG9ucyB1bmRlciBhIHBhcmVudCwgdG8gc2ltcGxpZnkgbGF5b3V0XHJcbiAgICAgIGNvbnN0IHNjcmVlbkJ1dHRvbnNDb250YWluZXIgPSBuZXcgSEJveCgge1xyXG4gICAgICAgIHNwYWNpbmc6IFNDUkVFTl9CVVRUT05fU1BBQ0lORyxcclxuICAgICAgICBtYXhXaWR0aDogYXZhaWxhYmxlVG90YWwgLy8gaW4gY2FzZSB3ZSBoYXZlIHNvIG1hbnkgc2NyZWVucyB0aGF0IHRoZSBzY3JlZW4gYnV0dG9ucyBuZWVkIHRvIGJlIHNjYWxlZCBkb3duXHJcbiAgICAgIH0gKTtcclxuICAgICAgYnV0dG9ucy5hZGRDaGlsZCggc2NyZWVuQnV0dG9uc0NvbnRhaW5lciApO1xyXG4gICAgICBzaW0uYWN0aXZlU2ltU2NyZWVuc1Byb3BlcnR5LmxpbmsoIHNpbVNjcmVlbnMgPT4ge1xyXG4gICAgICAgIHNjcmVlbkJ1dHRvbnNDb250YWluZXIuY2hpbGRyZW4gPSBzaW1TY3JlZW5zLm1hcCggc2NyZWVuID0+IHNjcmVlbkJ1dHRvbk1hcC5nZXQoIHNjcmVlbiApISApO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBTY3JlZW4gYnV0dG9ucyBjZW50ZXJlZC4gIFRoZXNlIGJ1dHRvbnMgYXJlIGNlbnRlcmVkIGFyb3VuZCB0aGUgb3JpZ2luIGluIHRoZSBzY3JlZW5CdXR0b25zQ29udGFpbmVyLCBzbyB0aGVcclxuICAgICAgLy8gc2NyZWVuQnV0dG9uc0NvbnRhaW5lciBjYW4gYmUgcHV0IGF0IHRoZSBjZW50ZXIgb2YgdGhlIG5hdmJhci5cclxuICAgICAgTWFudWFsQ29uc3RyYWludC5jcmVhdGUoIHRoaXMsIFsgdGhpcy5iYWNrZ3JvdW5kLCBzY3JlZW5CdXR0b25zQ29udGFpbmVyIF0sICggYmFja2dyb3VuZFByb3h5LCBzY3JlZW5CdXR0b25zQ29udGFpbmVyUHJveHkgKSA9PiB7XHJcbiAgICAgICAgc2NyZWVuQnV0dG9uc0NvbnRhaW5lclByb3h5LmNlbnRlciA9IGJhY2tncm91bmRQcm94eS5jZW50ZXI7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIGhvbWUgYnV0dG9uIHRvIHRoZSBsZWZ0IG9mIHNjcmVlbiBidXR0b25zXHJcbiAgICAgIFJlbGF4ZWRNYW51YWxDb25zdHJhaW50LmNyZWF0ZSggdGhpcy5iYXJDb250ZW50cywgWyB0aGlzLmhvbWVCdXR0b24sIC4uLnNjcmVlbkJ1dHRvbnMgXSwgKCBob21lQnV0dG9uUHJveHksIC4uLnNjcmVlbkJ1dHRvblByb3hpZXMgKSA9PiB7XHJcblxyXG4gICAgICAgIGNvbnN0IHZpc2libGVTY3JlZW5CdXR0b25Qcm94aWVzID0gc2NyZWVuQnV0dG9uUHJveGllcy5maWx0ZXIoIHByb3h5ID0+IHByb3h5ICYmIHByb3h5LnZpc2libGUgKTtcclxuXHJcbiAgICAgICAgLy8gRmluZCB0aGUgbGVmdC1tb3N0IHZpc2libGUgYnV0dG9uLiBXZSBkb24ndCB3YW50IHRoZSBleHRyYSBwYWRkaW5nIG9mIHRoZSBhbGlnbmJveCB0byBiZSBpbmNsdWRlZCBpbiB0aGlzIGNhbGN1bGF0aW9uLFxyXG4gICAgICAgIC8vIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSwgc28gaXQncyBhIGxvdCBtb3JlIGNvbXBsaWNhdGVkLlxyXG4gICAgICAgIGlmICggaG9tZUJ1dHRvblByb3h5ICYmIHZpc2libGVTY3JlZW5CdXR0b25Qcm94aWVzLmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgICAgICBob21lQnV0dG9uUHJveHkucmlnaHQgPSBNYXRoLm1pbiggLi4udmlzaWJsZVNjcmVlbkJ1dHRvblByb3hpZXMubWFwKCBwcm94eSA9PiBwcm94eSEubGVmdCApICkgLSBIT01FX0JVVFRPTl9SSUdIVF9NQVJHSU47XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBtYXggd2lkdGggcmVsYXRpdmUgdG8gcG9zaXRpb24gb2YgaG9tZSBidXR0b25cclxuICAgICAgTWFudWFsQ29uc3RyYWludC5jcmVhdGUoIHRoaXMuYmFyQ29udGVudHMsIFsgdGhpcy5ob21lQnV0dG9uLCB0aXRsZVRleHQgXSwgKCBob21lQnV0dG9uUHJveHksIHRpdGxlVGV4dFByb3h5ICkgPT4ge1xyXG4gICAgICAgIHRpdGxlVGV4dFByb3h5Lm1heFdpZHRoID0gaG9tZUJ1dHRvblByb3h5LmxlZnQgLSBUSVRMRV9MRUZUX01BUkdJTiAtIFRJVExFX1JJR0hUX01BUkdJTjtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgc2ltLnNpbU5hbWVQcm9wZXJ0eS5saW5rKCBzaW1OYW1lID0+IHtcclxuICAgICAgICBhbGxOYXZCYXJTY3JlZW5CdXR0b25zLmZvckVhY2goIHNjcmVlbkJ1dHRvbiA9PiB7XHJcbiAgICAgICAgICBzY3JlZW5CdXR0b24udm9pY2luZ0NvbnRleHRSZXNwb25zZSA9IHNpbU5hbWU7XHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaW5pdGlhbCBsYXlvdXQgKHRoYXQgZG9lc24ndCBuZWVkIHRvIGNoYW5nZSB3aGVuIHdlIGFyZSByZS1sYWlkIG91dClcclxuICAgIHRpdGxlVGV4dC5sZWZ0ID0gVElUTEVfTEVGVF9NQVJHSU47XHJcbiAgICB0aXRsZVRleHQuY2VudGVyWSA9IE5BVklHQVRJT05fQkFSX1NJWkUuaGVpZ2h0IC8gMjtcclxuICAgIHBoZXRCdXR0b24uY2VudGVyWSA9IE5BVklHQVRJT05fQkFSX1NJWkUuaGVpZ2h0IC8gMjtcclxuXHJcbiAgICBNYW51YWxDb25zdHJhaW50LmNyZWF0ZSggdGhpcywgWyB0aGlzLmJhY2tncm91bmQsIHBoZXRCdXR0b24gXSwgKCBiYWNrZ3JvdW5kUHJveHksIHBoZXRCdXR0b25Qcm94eSApID0+IHtcclxuICAgICAgcGhldEJ1dHRvblByb3h5LnJpZ2h0ID0gYmFja2dyb3VuZFByb3h5LnJpZ2h0IC0gUEhFVF9CVVRUT05fUklHSFRfTUFSR0lOO1xyXG4gICAgfSApO1xyXG5cclxuICAgIE1hbnVhbENvbnN0cmFpbnQuY3JlYXRlKCB0aGlzLmJhckNvbnRlbnRzLCBbIHBoZXRCdXR0b24sIHRoaXMuYTExeUJ1dHRvbnNIQm94IF0sICggcGhldEJ1dHRvblByb3h5LCBhMTF5QnV0dG9uc0hCb3hQcm94eSApID0+IHtcclxuICAgICAgYTExeUJ1dHRvbnNIQm94UHJveHkucmlnaHQgPSBwaGV0QnV0dG9uUHJveHkubGVmdCAtIFBIRVRfQlVUVE9OX0xFRlRfTUFSR0lOO1xyXG5cclxuICAgICAgLy8gVGhlIGljb24gaXMgdmVydGljYWxseSBhZGp1c3RlZCBpbiBLZXlib2FyZEhlbHBCdXR0b24sIHNvIHRoYXQgdGhlIGNlbnRlcnMgY2FuIGJlIGFsaWduZWQgaGVyZVxyXG4gICAgICBhMTF5QnV0dG9uc0hCb3hQcm94eS5jZW50ZXJZID0gcGhldEJ1dHRvblByb3h5LmNlbnRlclk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLmxvY2FsZU5vZGUgKSB7XHJcbiAgICAgIE1hbnVhbENvbnN0cmFpbnQuY3JlYXRlKCB0aGlzLmJhckNvbnRlbnRzLCBbIHBoZXRCdXR0b24sIHRoaXMuYTExeUJ1dHRvbnNIQm94LCB0aGlzLmxvY2FsZU5vZGUgXSwgKCBwaGV0QnV0dG9uUHJveHksIGExMXlCdXR0b25zSEJveFByb3h5LCBsb2NhbGVOb2RlUHJveHkgKSA9PiB7XHJcbiAgICAgICAgYTExeUJ1dHRvbnNIQm94UHJveHkucmlnaHQgPSBwaGV0QnV0dG9uUHJveHkubGVmdCAtIFBIRVRfQlVUVE9OX0xFRlRfTUFSR0lOO1xyXG5cclxuICAgICAgICAvLyBUaGUgaWNvbiBpcyB2ZXJ0aWNhbGx5IGFkanVzdGVkIGluIEtleWJvYXJkSGVscEJ1dHRvbiwgc28gdGhhdCB0aGUgY2VudGVycyBjYW4gYmUgYWxpZ25lZCBoZXJlXHJcbiAgICAgICAgYTExeUJ1dHRvbnNIQm94UHJveHkuY2VudGVyWSA9IHBoZXRCdXR0b25Qcm94eS5jZW50ZXJZO1xyXG5cclxuICAgICAgICBsb2NhbGVOb2RlUHJveHkuY2VudGVyWSA9IHBoZXRCdXR0b25Qcm94eS5jZW50ZXJZO1xyXG4gICAgICAgIGxvY2FsZU5vZGVQcm94eS5yaWdodCA9IE1hdGgubWluKCBhMTF5QnV0dG9uc0hCb3hQcm94eS5sZWZ0LCBwaGV0QnV0dG9uUHJveHkubGVmdCApIC0gUEhFVF9CVVRUT05fTEVGVF9NQVJHSU47XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmxheW91dCggMSwgTkFWSUdBVElPTl9CQVJfU0laRS53aWR0aCwgTkFWSUdBVElPTl9CQVJfU0laRS5oZWlnaHQgKTtcclxuXHJcbiAgICBjb25zdCBzaW1SZXNvdXJjZXNDb250YWluZXIgPSBuZXcgTm9kZSgge1xyXG5cclxuICAgICAgLy8gcGRvbVxyXG4gICAgICB0YWdOYW1lOiAnZGl2JyxcclxuICAgICAgY29udGFpbmVyVGFnTmFtZTogJ3NlY3Rpb24nLFxyXG4gICAgICBsYWJlbFRhZ05hbWU6ICdoMicsXHJcbiAgICAgIGxhYmVsQ29udGVudDogSm9pc3RTdHJpbmdzLmExMXkuc2ltUmVzb3VyY2VzU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIHBkb21PcmRlcjogW1xyXG4gICAgICAgIHRoaXMuYTExeUJ1dHRvbnNIQm94LFxyXG4gICAgICAgIHBoZXRCdXR0b25cclxuICAgICAgXS5maWx0ZXIoIG5vZGUgPT4gbm9kZSAhPT0gdW5kZWZpbmVkIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBzaW1SZXNvdXJjZXNDb250YWluZXIuYXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbnMgPSBbIHtcclxuICAgICAgdGhpc0VsZW1lbnROYW1lOiBQRE9NUGVlci5DT05UQUlORVJfUEFSRU5ULFxyXG4gICAgICBvdGhlckVsZW1lbnROYW1lOiBQRE9NUGVlci5MQUJFTF9TSUJMSU5HLFxyXG4gICAgICBvdGhlck5vZGU6IHNpbVJlc291cmNlc0NvbnRhaW5lclxyXG4gICAgfSBdO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggc2ltUmVzb3VyY2VzQ29udGFpbmVyICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiB0aGUgbmF2aWdhdGlvbiBiYXIgbGF5b3V0IG5lZWRzIHRvIGJlIHVwZGF0ZWQsIHR5cGljYWxseSB3aGVuIHRoZSBicm93c2VyIHdpbmRvdyBpcyByZXNpemVkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBsYXlvdXQoIHNjYWxlOiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgLy8gcmVzaXplIHRoZSBiYWNrZ3JvdW5kXHJcbiAgICB0aGlzLmJhY2tncm91bmQucmVjdFdpZHRoID0gd2lkdGg7XHJcbiAgICB0aGlzLmJhY2tncm91bmQucmVjdEhlaWdodCA9IGhlaWdodDtcclxuXHJcbiAgICAvLyBzY2FsZSB0aGUgZW50aXJlIGJhciBjb250ZW50c1xyXG4gICAgdGhpcy5iYXJDb250ZW50cy5zZXRTY2FsZU1hZ25pdHVkZSggc2NhbGUgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgTkFWSUdBVElPTl9CQVJfU0laRSA9IE5BVklHQVRJT05fQkFSX1NJWkU7XHJcbn1cclxuXHJcbmpvaXN0LnJlZ2lzdGVyKCAnTmF2aWdhdGlvbkJhcicsIE5hdmlnYXRpb25CYXIgKTtcclxuZXhwb3J0IGRlZmF1bHQgTmF2aWdhdGlvbkJhcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSxrQ0FBa0M7QUFDOUQsT0FBT0MsY0FBYyxNQUFNLGlDQUFpQztBQUM1RCxPQUFPQyxVQUFVLE1BQU0sNEJBQTRCO0FBQ25ELE9BQU9DLFFBQVEsTUFBTSxtQ0FBbUM7QUFDeEQsU0FBU0MsUUFBUSxFQUFTQyxJQUFJLEVBQUVDLGdCQUFnQixFQUFFQyxJQUFJLEVBQUVDLFFBQVEsRUFBRUMsU0FBUyxFQUFFQyx1QkFBdUIsRUFBRUMsSUFBSSxRQUFRLDZCQUE2QjtBQUMvSSxPQUFPQyxNQUFNLE1BQU0sMkJBQTJCO0FBQzlDLE9BQU9DLGVBQWUsTUFBTSxzQkFBc0I7QUFDbEQsT0FBT0MsVUFBVSxNQUFNLGlCQUFpQjtBQUN4QyxPQUFPQyxVQUFVLE1BQU0saUJBQWlCO0FBQ3hDLE9BQU9DLGNBQWMsTUFBTSxxQkFBcUI7QUFDaEQsT0FBT0MsS0FBSyxNQUFNLFlBQVk7QUFDOUIsT0FBT0MsWUFBWSxNQUFNLG1CQUFtQjtBQUM1QyxPQUFPQyx5QkFBeUIsTUFBTSxnQ0FBZ0M7QUFDdEUsT0FBT0MsVUFBVSxNQUFNLGlCQUFpQjtBQUd4QyxPQUFPQyxPQUFPLE1BQU0seUJBQXlCO0FBRTdDLE9BQU9DLGVBQWUsTUFBTSxrQ0FBa0M7O0FBRTlEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNQyxtQkFBbUIsR0FBRyxJQUFJckIsVUFBVSxDQUFFYyxjQUFjLENBQUNRLGFBQWEsQ0FBQ0MsS0FBSyxFQUFFLEVBQUcsQ0FBQztBQUNwRixNQUFNQyxpQkFBaUIs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