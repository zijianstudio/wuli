// Copyright 2020-2023, University of Colorado Boulder

/**
 * The main view for the Mystery screen of the Density simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import RefreshButton from '../../../../scenery-phet/js/buttons/RefreshButton.js';
import { AlignBox, Text, VBox } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import Panel from '../../../../sun/js/Panel.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import DensityBuoyancyCommonConstants from '../../common/DensityBuoyancyCommonConstants.js';
import DensityBuoyancyScreenView from '../../common/view/DensityBuoyancyScreenView.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import { BlockSet } from '../model/DensityMysteryModel.js';
import DensityTableNode from './DensityTableNode.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';

// constants
const blockSetStringMap = {
  [BlockSet.SET_1.name]: DensityBuoyancyCommonStrings.blockSet.set1StringProperty,
  [BlockSet.SET_2.name]: DensityBuoyancyCommonStrings.blockSet.set2StringProperty,
  [BlockSet.SET_3.name]: DensityBuoyancyCommonStrings.blockSet.set3StringProperty,
  [BlockSet.RANDOM.name]: DensityBuoyancyCommonStrings.blockSet.randomStringProperty
};
const MARGIN = DensityBuoyancyCommonConstants.MARGIN;
export default class DensityMysteryScreenView extends DensityBuoyancyScreenView {
  constructor(model, options) {
    const tandem = options.tandem;
    super(model, combineOptions({
      cameraLookAt: DensityBuoyancyCommonConstants.DENSITY_CAMERA_LOOK_AT
    }, options));
    const densityTableAccordionBoxTandem = tandem.createTandem('densityTableAccordionBox');
    const densityTableAccordionBox = new AccordionBox(new DensityTableNode(), combineOptions({
      titleNode: new Text(DensityBuoyancyCommonStrings.densityTableStringProperty, {
        font: DensityBuoyancyCommonConstants.TITLE_FONT,
        maxWidth: 200,
        tandem: densityTableAccordionBoxTandem.createTandem('titleText')
      }),
      expandedProperty: model.densityTableExpandedProperty,
      tandem: densityTableAccordionBoxTandem
    }, DensityBuoyancyCommonConstants.ACCORDION_BOX_OPTIONS));
    this.addChild(new AlignBox(densityTableAccordionBox, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'center',
      yAlign: 'top',
      margin: MARGIN
    }));
    const blockSetTandemMap = {
      [BlockSet.SET_1.name]: 'set1',
      [BlockSet.SET_2.name]: 'set2',
      [BlockSet.SET_3.name]: 'set3',
      [BlockSet.RANDOM.name]: 'random'
    };
    const blocksPanelTandem = tandem.createTandem('blocksPanel');
    const blocksRadioButtonGroupTandem = blocksPanelTandem.createTandem('blocksRadioButtonGroup');
    const blocksRadioButtonGroup = new VerticalAquaRadioButtonGroup(model.blockSetProperty, BlockSet.enumeration.values.map(blockSet => {
      return {
        createNode: tandem => new Text(blockSetStringMap[blockSet.name], {
          font: DensityBuoyancyCommonConstants.RADIO_BUTTON_FONT,
          maxWidth: 65,
          tandem: tandem.createTandem('labelText')
        }),
        value: blockSet,
        tandemName: `${blockSetTandemMap[blockSet.name]}RadioButton`
      };
    }), {
      align: 'left',
      spacing: 8,
      tandem: blocksRadioButtonGroupTandem
    });
    const randomBlocksRefreshButton = new RefreshButton({
      listener: () => {
        this.interruptSubtreeInput();
        model.regenerate(BlockSet.RANDOM);
      },
      iconHeight: 20,
      tandem: blocksPanelTandem.createTandem('randomBlocksRefreshButton')
    });
    const blockSetContent = new VBox({
      spacing: 10
    });

    // Include the refresh button when in random blockSet.
    // This instance lives for the lifetime of the simulation, so we don't need to remove this listener
    model.blockSetProperty.link(blockSet => {
      blockSetContent.children = blockSet === BlockSet.RANDOM ? [blocksRadioButtonGroup, randomBlocksRefreshButton] : [blocksRadioButtonGroup];
    });
    const blockSetPanel = new Panel(new VBox({
      children: [new Text(DensityBuoyancyCommonStrings.blocksStringProperty, {
        font: DensityBuoyancyCommonConstants.TITLE_FONT,
        maxWidth: 85,
        tandem: blocksPanelTandem.createTandem('titleText')
      }), blockSetContent],
      spacing: 10,
      align: 'left'
    }), combineOptions({
      tandem: blocksPanelTandem
    }, DensityBuoyancyCommonConstants.PANEL_OPTIONS));
    this.addChild(new AlignBox(blockSetPanel, {
      alignBoundsProperty: this.visibleBoundsProperty,
      xAlign: 'right',
      yAlign: 'top',
      margin: MARGIN
    }));
    this.addChild(this.popupLayer);
  }
}
densityBuoyancyCommon.register('DensityMysteryScreenView', DensityMysteryScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWZyZXNoQnV0dG9uIiwiQWxpZ25Cb3giLCJUZXh0IiwiVkJveCIsIkFjY29yZGlvbkJveCIsIlBhbmVsIiwiVmVydGljYWxBcXVhUmFkaW9CdXR0b25Hcm91cCIsIkRlbnNpdHlCdW95YW5jeUNvbW1vbkNvbnN0YW50cyIsIkRlbnNpdHlCdW95YW5jeVNjcmVlblZpZXciLCJkZW5zaXR5QnVveWFuY3lDb21tb24iLCJEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzIiwiQmxvY2tTZXQiLCJEZW5zaXR5VGFibGVOb2RlIiwiY29tYmluZU9wdGlvbnMiLCJibG9ja1NldFN0cmluZ01hcCIsIlNFVF8xIiwibmFtZSIsImJsb2NrU2V0Iiwic2V0MVN0cmluZ1Byb3BlcnR5IiwiU0VUXzIiLCJzZXQyU3RyaW5nUHJvcGVydHkiLCJTRVRfMyIsInNldDNTdHJpbmdQcm9wZXJ0eSIsIlJBTkRPTSIsInJhbmRvbVN0cmluZ1Byb3BlcnR5IiwiTUFSR0lOIiwiRGVuc2l0eU15c3RlcnlTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsIm9wdGlvbnMiLCJ0YW5kZW0iLCJjYW1lcmFMb29rQXQiLCJERU5TSVRZX0NBTUVSQV9MT09LX0FUIiwiZGVuc2l0eVRhYmxlQWNjb3JkaW9uQm94VGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwiZGVuc2l0eVRhYmxlQWNjb3JkaW9uQm94IiwidGl0bGVOb2RlIiwiZGVuc2l0eVRhYmxlU3RyaW5nUHJvcGVydHkiLCJmb250IiwiVElUTEVfRk9OVCIsIm1heFdpZHRoIiwiZXhwYW5kZWRQcm9wZXJ0eSIsImRlbnNpdHlUYWJsZUV4cGFuZGVkUHJvcGVydHkiLCJBQ0NPUkRJT05fQk9YX09QVElPTlMiLCJhZGRDaGlsZCIsImFsaWduQm91bmRzUHJvcGVydHkiLCJ2aXNpYmxlQm91bmRzUHJvcGVydHkiLCJ4QWxpZ24iLCJ5QWxpZ24iLCJtYXJnaW4iLCJibG9ja1NldFRhbmRlbU1hcCIsImJsb2Nrc1BhbmVsVGFuZGVtIiwiYmxvY2tzUmFkaW9CdXR0b25Hcm91cFRhbmRlbSIsImJsb2Nrc1JhZGlvQnV0dG9uR3JvdXAiLCJibG9ja1NldFByb3BlcnR5IiwiZW51bWVyYXRpb24iLCJ2YWx1ZXMiLCJtYXAiLCJjcmVhdGVOb2RlIiwiUkFESU9fQlVUVE9OX0ZPTlQiLCJ2YWx1ZSIsInRhbmRlbU5hbWUiLCJhbGlnbiIsInNwYWNpbmciLCJyYW5kb21CbG9ja3NSZWZyZXNoQnV0dG9uIiwibGlzdGVuZXIiLCJpbnRlcnJ1cHRTdWJ0cmVlSW5wdXQiLCJyZWdlbmVyYXRlIiwiaWNvbkhlaWdodCIsImJsb2NrU2V0Q29udGVudCIsImxpbmsiLCJjaGlsZHJlbiIsImJsb2NrU2V0UGFuZWwiLCJibG9ja3NTdHJpbmdQcm9wZXJ0eSIsIlBBTkVMX09QVElPTlMiLCJwb3B1cExheWVyIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJEZW5zaXR5TXlzdGVyeVNjcmVlblZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhlIG1haW4gdmlldyBmb3IgdGhlIE15c3Rlcnkgc2NyZWVuIG9mIHRoZSBEZW5zaXR5IHNpbXVsYXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgUmVmcmVzaEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9SZWZyZXNoQnV0dG9uLmpzJztcclxuaW1wb3J0IHsgQWxpZ25Cb3gsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQWNjb3JkaW9uQm94LCB7IEFjY29yZGlvbkJveE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQWNjb3JkaW9uQm94LmpzJztcclxuaW1wb3J0IFBhbmVsLCB7IFBhbmVsT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBWZXJ0aWNhbEFxdWFSYWRpb0J1dHRvbkdyb3VwIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9WZXJ0aWNhbEFxdWFSYWRpb0J1dHRvbkdyb3VwLmpzJztcclxuaW1wb3J0IERlbnNpdHlCdW95YW5jeUNvbW1vbkNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IERlbnNpdHlCdW95YW5jeVNjcmVlblZpZXcsIHsgRGVuc2l0eUJ1b3lhbmN5U2NyZWVuVmlld09wdGlvbnMgfSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9EZW5zaXR5QnVveWFuY3lTY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IGRlbnNpdHlCdW95YW5jeUNvbW1vbiBmcm9tICcuLi8uLi9kZW5zaXR5QnVveWFuY3lDb21tb24uanMnO1xyXG5pbXBvcnQgRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncyBmcm9tICcuLi8uLi9EZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzLmpzJztcclxuaW1wb3J0IERlbnNpdHlNeXN0ZXJ5TW9kZWwsIHsgQmxvY2tTZXQgfSBmcm9tICcuLi9tb2RlbC9EZW5zaXR5TXlzdGVyeU1vZGVsLmpzJztcclxuaW1wb3J0IERlbnNpdHlUYWJsZU5vZGUgZnJvbSAnLi9EZW5zaXR5VGFibGVOb2RlLmpzJztcclxuaW1wb3J0IHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBibG9ja1NldFN0cmluZ01hcCA9IHtcclxuICBbIEJsb2NrU2V0LlNFVF8xLm5hbWUgXTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5ibG9ja1NldC5zZXQxU3RyaW5nUHJvcGVydHksXHJcbiAgWyBCbG9ja1NldC5TRVRfMi5uYW1lIF06IERlbnNpdHlCdW95YW5jeUNvbW1vblN0cmluZ3MuYmxvY2tTZXQuc2V0MlN0cmluZ1Byb3BlcnR5LFxyXG4gIFsgQmxvY2tTZXQuU0VUXzMubmFtZSBdOiBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzLmJsb2NrU2V0LnNldDNTdHJpbmdQcm9wZXJ0eSxcclxuICBbIEJsb2NrU2V0LlJBTkRPTS5uYW1lIF06IERlbnNpdHlCdW95YW5jeUNvbW1vblN0cmluZ3MuYmxvY2tTZXQucmFuZG9tU3RyaW5nUHJvcGVydHlcclxufTtcclxuY29uc3QgTUFSR0lOID0gRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29uc3RhbnRzLk1BUkdJTjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERlbnNpdHlNeXN0ZXJ5U2NyZWVuVmlldyBleHRlbmRzIERlbnNpdHlCdW95YW5jeVNjcmVlblZpZXc8RGVuc2l0eU15c3RlcnlNb2RlbD4ge1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbW9kZWw6IERlbnNpdHlNeXN0ZXJ5TW9kZWwsIG9wdGlvbnM6IERlbnNpdHlCdW95YW5jeVNjcmVlblZpZXdPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IHRhbmRlbSA9IG9wdGlvbnMudGFuZGVtO1xyXG5cclxuICAgIHN1cGVyKCBtb2RlbCwgY29tYmluZU9wdGlvbnM8RGVuc2l0eUJ1b3lhbmN5U2NyZWVuVmlld09wdGlvbnM+KCB7XHJcbiAgICAgIGNhbWVyYUxvb2tBdDogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29uc3RhbnRzLkRFTlNJVFlfQ0FNRVJBX0xPT0tfQVRcclxuICAgIH0sIG9wdGlvbnMgKSApO1xyXG5cclxuICAgIGNvbnN0IGRlbnNpdHlUYWJsZUFjY29yZGlvbkJveFRhbmRlbSA9IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdkZW5zaXR5VGFibGVBY2NvcmRpb25Cb3gnICk7XHJcbiAgICBjb25zdCBkZW5zaXR5VGFibGVBY2NvcmRpb25Cb3ggPSBuZXcgQWNjb3JkaW9uQm94KCBuZXcgRGVuc2l0eVRhYmxlTm9kZSgpLCBjb21iaW5lT3B0aW9uczxBY2NvcmRpb25Cb3hPcHRpb25zPigge1xyXG4gICAgICB0aXRsZU5vZGU6IG5ldyBUZXh0KCBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzLmRlbnNpdHlUYWJsZVN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgICAgZm9udDogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29uc3RhbnRzLlRJVExFX0ZPTlQsXHJcbiAgICAgICAgbWF4V2lkdGg6IDIwMCxcclxuICAgICAgICB0YW5kZW06IGRlbnNpdHlUYWJsZUFjY29yZGlvbkJveFRhbmRlbS5jcmVhdGVUYW5kZW0oICd0aXRsZVRleHQnIClcclxuICAgICAgfSApLFxyXG4gICAgICBleHBhbmRlZFByb3BlcnR5OiBtb2RlbC5kZW5zaXR5VGFibGVFeHBhbmRlZFByb3BlcnR5LFxyXG4gICAgICB0YW5kZW06IGRlbnNpdHlUYWJsZUFjY29yZGlvbkJveFRhbmRlbVxyXG4gICAgfSwgRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29uc3RhbnRzLkFDQ09SRElPTl9CT1hfT1BUSU9OUyApICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IEFsaWduQm94KCBkZW5zaXR5VGFibGVBY2NvcmRpb25Cb3gsIHtcclxuICAgICAgYWxpZ25Cb3VuZHNQcm9wZXJ0eTogdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHksXHJcbiAgICAgIHhBbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgIHlBbGlnbjogJ3RvcCcsXHJcbiAgICAgIG1hcmdpbjogTUFSR0lOXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICBjb25zdCBibG9ja1NldFRhbmRlbU1hcCA9IHtcclxuICAgICAgWyBCbG9ja1NldC5TRVRfMS5uYW1lIF06ICdzZXQxJyxcclxuICAgICAgWyBCbG9ja1NldC5TRVRfMi5uYW1lIF06ICdzZXQyJyxcclxuICAgICAgWyBCbG9ja1NldC5TRVRfMy5uYW1lIF06ICdzZXQzJyxcclxuICAgICAgWyBCbG9ja1NldC5SQU5ET00ubmFtZSBdOiAncmFuZG9tJ1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBibG9ja3NQYW5lbFRhbmRlbSA9IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdibG9ja3NQYW5lbCcgKTtcclxuICAgIGNvbnN0IGJsb2Nrc1JhZGlvQnV0dG9uR3JvdXBUYW5kZW0gPSBibG9ja3NQYW5lbFRhbmRlbS5jcmVhdGVUYW5kZW0oICdibG9ja3NSYWRpb0J1dHRvbkdyb3VwJyApO1xyXG5cclxuICAgIGNvbnN0IGJsb2Nrc1JhZGlvQnV0dG9uR3JvdXAgPSBuZXcgVmVydGljYWxBcXVhUmFkaW9CdXR0b25Hcm91cCggbW9kZWwuYmxvY2tTZXRQcm9wZXJ0eSwgQmxvY2tTZXQuZW51bWVyYXRpb24udmFsdWVzLm1hcCggYmxvY2tTZXQgPT4ge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGNyZWF0ZU5vZGU6IHRhbmRlbSA9PiBuZXcgVGV4dCggYmxvY2tTZXRTdHJpbmdNYXBbIGJsb2NrU2V0Lm5hbWUgXSwge1xyXG4gICAgICAgICAgZm9udDogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29uc3RhbnRzLlJBRElPX0JVVFRPTl9GT05ULFxyXG4gICAgICAgICAgbWF4V2lkdGg6IDY1LFxyXG4gICAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGFiZWxUZXh0JyApXHJcbiAgICAgICAgfSApLFxyXG4gICAgICAgIHZhbHVlOiBibG9ja1NldCxcclxuICAgICAgICB0YW5kZW1OYW1lOiBgJHtibG9ja1NldFRhbmRlbU1hcFsgYmxvY2tTZXQubmFtZSBdfVJhZGlvQnV0dG9uYFxyXG4gICAgICB9O1xyXG4gICAgfSApLCB7XHJcbiAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgIHNwYWNpbmc6IDgsXHJcbiAgICAgIHRhbmRlbTogYmxvY2tzUmFkaW9CdXR0b25Hcm91cFRhbmRlbVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgcmFuZG9tQmxvY2tzUmVmcmVzaEJ1dHRvbiA9IG5ldyBSZWZyZXNoQnV0dG9uKCB7XHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTtcclxuICAgICAgICBtb2RlbC5yZWdlbmVyYXRlKCBCbG9ja1NldC5SQU5ET00gKTtcclxuICAgICAgfSxcclxuICAgICAgaWNvbkhlaWdodDogMjAsXHJcbiAgICAgIHRhbmRlbTogYmxvY2tzUGFuZWxUYW5kZW0uY3JlYXRlVGFuZGVtKCAncmFuZG9tQmxvY2tzUmVmcmVzaEJ1dHRvbicgKVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgYmxvY2tTZXRDb250ZW50ID0gbmV3IFZCb3goIHtcclxuICAgICAgc3BhY2luZzogMTBcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBJbmNsdWRlIHRoZSByZWZyZXNoIGJ1dHRvbiB3aGVuIGluIHJhbmRvbSBibG9ja1NldC5cclxuICAgIC8vIFRoaXMgaW5zdGFuY2UgbGl2ZXMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltdWxhdGlvbiwgc28gd2UgZG9uJ3QgbmVlZCB0byByZW1vdmUgdGhpcyBsaXN0ZW5lclxyXG4gICAgbW9kZWwuYmxvY2tTZXRQcm9wZXJ0eS5saW5rKCBibG9ja1NldCA9PiB7XHJcbiAgICAgIGJsb2NrU2V0Q29udGVudC5jaGlsZHJlbiA9IGJsb2NrU2V0ID09PSBCbG9ja1NldC5SQU5ET00gPyBbXHJcbiAgICAgICAgYmxvY2tzUmFkaW9CdXR0b25Hcm91cCxcclxuICAgICAgICByYW5kb21CbG9ja3NSZWZyZXNoQnV0dG9uXHJcbiAgICAgIF0gOiBbXHJcbiAgICAgICAgYmxvY2tzUmFkaW9CdXR0b25Hcm91cFxyXG4gICAgICBdO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGJsb2NrU2V0UGFuZWwgPSBuZXcgUGFuZWwoIG5ldyBWQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbmV3IFRleHQoIERlbnNpdHlCdW95YW5jeUNvbW1vblN0cmluZ3MuYmxvY2tzU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgICAgIGZvbnQ6IERlbnNpdHlCdW95YW5jeUNvbW1vbkNvbnN0YW50cy5USVRMRV9GT05ULFxyXG4gICAgICAgICAgbWF4V2lkdGg6IDg1LFxyXG4gICAgICAgICAgdGFuZGVtOiBibG9ja3NQYW5lbFRhbmRlbS5jcmVhdGVUYW5kZW0oICd0aXRsZVRleHQnIClcclxuICAgICAgICB9ICksXHJcbiAgICAgICAgYmxvY2tTZXRDb250ZW50XHJcbiAgICAgIF0sXHJcbiAgICAgIHNwYWNpbmc6IDEwLFxyXG4gICAgICBhbGlnbjogJ2xlZnQnXHJcbiAgICB9ICksIGNvbWJpbmVPcHRpb25zPFBhbmVsT3B0aW9ucz4oIHtcclxuICAgICAgdGFuZGVtOiBibG9ja3NQYW5lbFRhbmRlbVxyXG4gICAgfSwgRGVuc2l0eUJ1b3lhbmN5Q29tbW9uQ29uc3RhbnRzLlBBTkVMX09QVElPTlMgKSApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBBbGlnbkJveCggYmxvY2tTZXRQYW5lbCwge1xyXG4gICAgICBhbGlnbkJvdW5kc1Byb3BlcnR5OiB0aGlzLnZpc2libGVCb3VuZHNQcm9wZXJ0eSxcclxuICAgICAgeEFsaWduOiAncmlnaHQnLFxyXG4gICAgICB5QWxpZ246ICd0b3AnLFxyXG4gICAgICBtYXJnaW46IE1BUkdJTlxyXG4gICAgfSApICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5wb3B1cExheWVyICk7XHJcbiAgfVxyXG59XHJcblxyXG5kZW5zaXR5QnVveWFuY3lDb21tb24ucmVnaXN0ZXIoICdEZW5zaXR5TXlzdGVyeVNjcmVlblZpZXcnLCBEZW5zaXR5TXlzdGVyeVNjcmVlblZpZXcgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGFBQWEsTUFBTSxzREFBc0Q7QUFDaEYsU0FB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