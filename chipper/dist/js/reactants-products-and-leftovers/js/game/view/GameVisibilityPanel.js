// Copyright 2014-2023, University of Colorado Boulder

/**
 * Panel that contains radio buttons for selecting what's visible/hidden in Game challenges.
 * Provides the ability to hide either molecules or numbers (but not both).
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import H2ONode from '../../../../nitroglycerin/js/nodes/H2ONode.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { AlignBox, AlignGroup, HBox, Node, Path, Text } from '../../../../scenery/js/imports.js';
import eyeSlashSolidShape from '../../../../sherpa/js/fontawesome-5/eyeSlashSolidShape.js';
import eyeSolidShape from '../../../../sherpa/js/fontawesome-5/eyeSolidShape.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import Panel from '../../../../sun/js/Panel.js';
import RPALConstants from '../../common/RPALConstants.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
import ReactantsProductsAndLeftoversStrings from '../../ReactantsProductsAndLeftoversStrings.js';
import GameVisibility from '../model/GameVisibility.js';
const ICON_TEXT_SPACING = 7;
const TEXT_OPTIONS = {
  font: new PhetFont(14),
  maxWidth: 350
};
const FONT_AWESOME_OPTIONS = {
  scale: 0.04,
  fill: 'black'
};
export default class GameVisibilityPanel extends Panel {
  constructor(gameVisibilityProperty, tandem) {
    // To make all icons have the same effective size
    const iconAlignBoxOptions = {
      group: new AlignGroup(),
      xAlign: 'left'
    };
    const radioButtonItems = [{
      value: GameVisibility.SHOW_ALL,
      createNode: tandem => new ShowAllNode(tandem, iconAlignBoxOptions),
      tandemName: 'showAllRadioButton'
    }, {
      value: GameVisibility.HIDE_MOLECULES,
      createNode: tandem => new HideMoleculesNode(tandem, iconAlignBoxOptions),
      tandemName: 'hideMoleculesRadioButton'
    }, {
      value: GameVisibility.HIDE_NUMBERS,
      createNode: tandem => new HideNumbersNode(tandem, iconAlignBoxOptions),
      tandemName: 'hideNumbersRadioButton'
    }];
    const radioButtonGroup = new VerticalAquaRadioButtonGroup(gameVisibilityProperty, radioButtonItems, {
      spacing: 15,
      touchAreaXDilation: 10,
      touchAreaYDilation: 6,
      radioButtonOptions: {
        radius: 8,
        xSpacing: 10
      },
      tandem: tandem.createTandem('radioButtonGroup')
    });
    super(radioButtonGroup, {
      xMargin: 15,
      yMargin: 10,
      fill: 'rgb( 235, 245, 255 )',
      stroke: 'rgb( 180, 180, 180 )',
      lineWidth: 0.5,
      tandem: tandem
    });
  }
}

/**
 * ShowAllNode is the content for the 'Show All' radio button, an open eye with text to the right of it.
 */
class ShowAllNode extends HBox {
  constructor(tandem, iconAlignBoxOptions) {
    const icon = new AlignBox(new Path(eyeSolidShape, FONT_AWESOME_OPTIONS), iconAlignBoxOptions);
    const text = new Text(ReactantsProductsAndLeftoversStrings.showAllStringProperty, combineOptions({
      tandem: tandem.createTandem('text')
    }, TEXT_OPTIONS));
    super({
      children: [icon, text],
      spacing: ICON_TEXT_SPACING
    });
  }
}

/**
 * HideMoleculesNode is the content for the 'Hide Molecules' radio button,
 * a closed eye with '123' at lower right, and text to the right.
 */
class HideMoleculesNode extends HBox {
  constructor(tandem, iconAlignBoxOptions) {
    const eyeNode = new Path(eyeSlashSolidShape, FONT_AWESOME_OPTIONS);
    const moleculeNode = new Node({
      // wrap in a Node because H2ONode doesn't work with standard options
      children: [new H2ONode(RPALConstants.MOLECULE_NODE_OPTIONS)],
      scale: 0.4,
      left: eyeNode.right + 2,
      centerY: eyeNode.bottom
    });
    const icon = new AlignBox(new Node({
      children: [eyeNode, moleculeNode]
    }), iconAlignBoxOptions);
    const text = new Text(ReactantsProductsAndLeftoversStrings.hideMoleculesStringProperty, combineOptions({
      tandem: tandem.createTandem('text')
    }, TEXT_OPTIONS));
    super({
      children: [icon, text],
      spacing: ICON_TEXT_SPACING
    });
  }
}

/**
 * HideNumbersNode is the content for the 'Hide Numbers' radio button,
 * a closed eye with H2O molecule at lower right, and text to the right.
 */
class HideNumbersNode extends HBox {
  constructor(tandem, iconAlignBoxOptions) {
    const eyeNode = new Path(eyeSlashSolidShape, FONT_AWESOME_OPTIONS);
    const numbersNode = new Text('123', {
      font: new PhetFont(8),
      left: eyeNode.right + 2,
      centerY: eyeNode.bottom
    });
    const icon = new AlignBox(new Node({
      children: [eyeNode, numbersNode]
    }), iconAlignBoxOptions);
    const text = new Text(ReactantsProductsAndLeftoversStrings.hideNumbersStringProperty, combineOptions({
      tandem: tandem.createTandem('text')
    }, TEXT_OPTIONS));
    super({
      children: [icon, text],
      spacing: ICON_TEXT_SPACING
    });
  }
}
reactantsProductsAndLeftovers.register('GameVisibilityPanel', GameVisibilityPanel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJIMk9Ob2RlIiwiY29tYmluZU9wdGlvbnMiLCJQaGV0Rm9udCIsIkFsaWduQm94IiwiQWxpZ25Hcm91cCIsIkhCb3giLCJOb2RlIiwiUGF0aCIsIlRleHQiLCJleWVTbGFzaFNvbGlkU2hhcGUiLCJleWVTb2xpZFNoYXBlIiwiVmVydGljYWxBcXVhUmFkaW9CdXR0b25Hcm91cCIsIlBhbmVsIiwiUlBBTENvbnN0YW50cyIsInJlYWN0YW50c1Byb2R1Y3RzQW5kTGVmdG92ZXJzIiwiUmVhY3RhbnRzUHJvZHVjdHNBbmRMZWZ0b3ZlcnNTdHJpbmdzIiwiR2FtZVZpc2liaWxpdHkiLCJJQ09OX1RFWFRfU1BBQ0lORyIsIlRFWFRfT1BUSU9OUyIsImZvbnQiLCJtYXhXaWR0aCIsIkZPTlRfQVdFU09NRV9PUFRJT05TIiwic2NhbGUiLCJmaWxsIiwiR2FtZVZpc2liaWxpdHlQYW5lbCIsImNvbnN0cnVjdG9yIiwiZ2FtZVZpc2liaWxpdHlQcm9wZXJ0eSIsInRhbmRlbSIsImljb25BbGlnbkJveE9wdGlvbnMiLCJncm91cCIsInhBbGlnbiIsInJhZGlvQnV0dG9uSXRlbXMiLCJ2YWx1ZSIsIlNIT1dfQUxMIiwiY3JlYXRlTm9kZSIsIlNob3dBbGxOb2RlIiwidGFuZGVtTmFtZSIsIkhJREVfTU9MRUNVTEVTIiwiSGlkZU1vbGVjdWxlc05vZGUiLCJISURFX05VTUJFUlMiLCJIaWRlTnVtYmVyc05vZGUiLCJyYWRpb0J1dHRvbkdyb3VwIiwic3BhY2luZyIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsInJhZGlvQnV0dG9uT3B0aW9ucyIsInJhZGl1cyIsInhTcGFjaW5nIiwiY3JlYXRlVGFuZGVtIiwieE1hcmdpbiIsInlNYXJnaW4iLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJpY29uIiwidGV4dCIsInNob3dBbGxTdHJpbmdQcm9wZXJ0eSIsImNoaWxkcmVuIiwiZXllTm9kZSIsIm1vbGVjdWxlTm9kZSIsIk1PTEVDVUxFX05PREVfT1BUSU9OUyIsImxlZnQiLCJyaWdodCIsImNlbnRlclkiLCJib3R0b20iLCJoaWRlTW9sZWN1bGVzU3RyaW5nUHJvcGVydHkiLCJudW1iZXJzTm9kZSIsImhpZGVOdW1iZXJzU3RyaW5nUHJvcGVydHkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkdhbWVWaXNpYmlsaXR5UGFuZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUGFuZWwgdGhhdCBjb250YWlucyByYWRpbyBidXR0b25zIGZvciBzZWxlY3Rpbmcgd2hhdCdzIHZpc2libGUvaGlkZGVuIGluIEdhbWUgY2hhbGxlbmdlcy5cclxuICogUHJvdmlkZXMgdGhlIGFiaWxpdHkgdG8gaGlkZSBlaXRoZXIgbW9sZWN1bGVzIG9yIG51bWJlcnMgKGJ1dCBub3QgYm90aCkuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEVudW1lcmF0aW9uUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbnVtZXJhdGlvblByb3BlcnR5LmpzJztcclxuaW1wb3J0IEgyT05vZGUgZnJvbSAnLi4vLi4vLi4vLi4vbml0cm9nbHljZXJpbi9qcy9ub2Rlcy9IMk9Ob2RlLmpzJztcclxuaW1wb3J0IHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IEFsaWduQm94LCBBbGlnbkJveE9wdGlvbnMsIEFsaWduR3JvdXAsIEhCb3gsIE5vZGUsIFBhdGgsIFBhdGhPcHRpb25zLCBUZXh0LCBUZXh0T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBleWVTbGFzaFNvbGlkU2hhcGUgZnJvbSAnLi4vLi4vLi4vLi4vc2hlcnBhL2pzL2ZvbnRhd2Vzb21lLTUvZXllU2xhc2hTb2xpZFNoYXBlLmpzJztcclxuaW1wb3J0IGV5ZVNvbGlkU2hhcGUgZnJvbSAnLi4vLi4vLi4vLi4vc2hlcnBhL2pzL2ZvbnRhd2Vzb21lLTUvZXllU29saWRTaGFwZS5qcyc7XHJcbmltcG9ydCBWZXJ0aWNhbEFxdWFSYWRpb0J1dHRvbkdyb3VwIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9WZXJ0aWNhbEFxdWFSYWRpb0J1dHRvbkdyb3VwLmpzJztcclxuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBSUEFMQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9SUEFMQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IHJlYWN0YW50c1Byb2R1Y3RzQW5kTGVmdG92ZXJzIGZyb20gJy4uLy4uL3JlYWN0YW50c1Byb2R1Y3RzQW5kTGVmdG92ZXJzLmpzJztcclxuaW1wb3J0IFJlYWN0YW50c1Byb2R1Y3RzQW5kTGVmdG92ZXJzU3RyaW5ncyBmcm9tICcuLi8uLi9SZWFjdGFudHNQcm9kdWN0c0FuZExlZnRvdmVyc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgR2FtZVZpc2liaWxpdHkgZnJvbSAnLi4vbW9kZWwvR2FtZVZpc2liaWxpdHkuanMnO1xyXG5pbXBvcnQgeyBBcXVhUmFkaW9CdXR0b25Hcm91cEl0ZW0gfSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQXF1YVJhZGlvQnV0dG9uR3JvdXAuanMnO1xyXG5cclxuY29uc3QgSUNPTl9URVhUX1NQQUNJTkcgPSA3O1xyXG5jb25zdCBURVhUX09QVElPTlM6IFRleHRPcHRpb25zID0ge1xyXG4gIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTQgKSxcclxuICBtYXhXaWR0aDogMzUwXHJcbn07XHJcbmNvbnN0IEZPTlRfQVdFU09NRV9PUFRJT05TOiBQYXRoT3B0aW9ucyA9IHtcclxuICBzY2FsZTogMC4wNCxcclxuICBmaWxsOiAnYmxhY2snXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lVmlzaWJpbGl0eVBhbmVsIGV4dGVuZHMgUGFuZWwge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGdhbWVWaXNpYmlsaXR5UHJvcGVydHk6IEVudW1lcmF0aW9uUHJvcGVydHk8R2FtZVZpc2liaWxpdHk+LCB0YW5kZW06IFRhbmRlbSApIHtcclxuXHJcbiAgICAvLyBUbyBtYWtlIGFsbCBpY29ucyBoYXZlIHRoZSBzYW1lIGVmZmVjdGl2ZSBzaXplXHJcbiAgICBjb25zdCBpY29uQWxpZ25Cb3hPcHRpb25zOiBBbGlnbkJveE9wdGlvbnMgPSB7XHJcbiAgICAgIGdyb3VwOiBuZXcgQWxpZ25Hcm91cCgpLFxyXG4gICAgICB4QWxpZ246ICdsZWZ0J1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCByYWRpb0J1dHRvbkl0ZW1zOiBBcXVhUmFkaW9CdXR0b25Hcm91cEl0ZW08R2FtZVZpc2liaWxpdHk+W10gPSBbXHJcbiAgICAgIHtcclxuICAgICAgICB2YWx1ZTogR2FtZVZpc2liaWxpdHkuU0hPV19BTEwsXHJcbiAgICAgICAgY3JlYXRlTm9kZTogdGFuZGVtID0+IG5ldyBTaG93QWxsTm9kZSggdGFuZGVtLCBpY29uQWxpZ25Cb3hPcHRpb25zICksXHJcbiAgICAgICAgdGFuZGVtTmFtZTogJ3Nob3dBbGxSYWRpb0J1dHRvbidcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHZhbHVlOiBHYW1lVmlzaWJpbGl0eS5ISURFX01PTEVDVUxFUyxcclxuICAgICAgICBjcmVhdGVOb2RlOiAoIHRhbmRlbTogVGFuZGVtICkgPT4gbmV3IEhpZGVNb2xlY3VsZXNOb2RlKCB0YW5kZW0sIGljb25BbGlnbkJveE9wdGlvbnMgKSxcclxuICAgICAgICB0YW5kZW1OYW1lOiAnaGlkZU1vbGVjdWxlc1JhZGlvQnV0dG9uJ1xyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdmFsdWU6IEdhbWVWaXNpYmlsaXR5LkhJREVfTlVNQkVSUyxcclxuICAgICAgICBjcmVhdGVOb2RlOiAoIHRhbmRlbTogVGFuZGVtICkgPT4gbmV3IEhpZGVOdW1iZXJzTm9kZSggdGFuZGVtLCBpY29uQWxpZ25Cb3hPcHRpb25zICksXHJcbiAgICAgICAgdGFuZGVtTmFtZTogJ2hpZGVOdW1iZXJzUmFkaW9CdXR0b24nXHJcbiAgICAgIH1cclxuICAgIF07XHJcblxyXG4gICAgY29uc3QgcmFkaW9CdXR0b25Hcm91cCA9IG5ldyBWZXJ0aWNhbEFxdWFSYWRpb0J1dHRvbkdyb3VwPEdhbWVWaXNpYmlsaXR5PiggZ2FtZVZpc2liaWxpdHlQcm9wZXJ0eSwgcmFkaW9CdXR0b25JdGVtcywge1xyXG4gICAgICBzcGFjaW5nOiAxNSxcclxuICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiAxMCxcclxuICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiA2LFxyXG4gICAgICByYWRpb0J1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICByYWRpdXM6IDgsXHJcbiAgICAgICAgeFNwYWNpbmc6IDEwXHJcbiAgICAgIH0sXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3JhZGlvQnV0dG9uR3JvdXAnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggcmFkaW9CdXR0b25Hcm91cCwge1xyXG4gICAgICB4TWFyZ2luOiAxNSxcclxuICAgICAgeU1hcmdpbjogMTAsXHJcbiAgICAgIGZpbGw6ICdyZ2IoIDIzNSwgMjQ1LCAyNTUgKScsXHJcbiAgICAgIHN0cm9rZTogJ3JnYiggMTgwLCAxODAsIDE4MCApJyxcclxuICAgICAgbGluZVdpZHRoOiAwLjUsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogU2hvd0FsbE5vZGUgaXMgdGhlIGNvbnRlbnQgZm9yIHRoZSAnU2hvdyBBbGwnIHJhZGlvIGJ1dHRvbiwgYW4gb3BlbiBleWUgd2l0aCB0ZXh0IHRvIHRoZSByaWdodCBvZiBpdC5cclxuICovXHJcbmNsYXNzIFNob3dBbGxOb2RlIGV4dGVuZHMgSEJveCB7XHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0YW5kZW06IFRhbmRlbSwgaWNvbkFsaWduQm94T3B0aW9uczogQWxpZ25Cb3hPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IGljb24gPSBuZXcgQWxpZ25Cb3goIG5ldyBQYXRoKCBleWVTb2xpZFNoYXBlLCBGT05UX0FXRVNPTUVfT1BUSU9OUyApLCBpY29uQWxpZ25Cb3hPcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgdGV4dCA9IG5ldyBUZXh0KCBSZWFjdGFudHNQcm9kdWN0c0FuZExlZnRvdmVyc1N0cmluZ3Muc2hvd0FsbFN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBjb21iaW5lT3B0aW9uczxUZXh0T3B0aW9ucz4oIHtcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0ZXh0JyApXHJcbiAgICAgIH0sIFRFWFRfT1BUSU9OUyApICk7XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgY2hpbGRyZW46IFsgaWNvbiwgdGV4dCBdLFxyXG4gICAgICBzcGFjaW5nOiBJQ09OX1RFWFRfU1BBQ0lOR1xyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEhpZGVNb2xlY3VsZXNOb2RlIGlzIHRoZSBjb250ZW50IGZvciB0aGUgJ0hpZGUgTW9sZWN1bGVzJyByYWRpbyBidXR0b24sXHJcbiAqIGEgY2xvc2VkIGV5ZSB3aXRoICcxMjMnIGF0IGxvd2VyIHJpZ2h0LCBhbmQgdGV4dCB0byB0aGUgcmlnaHQuXHJcbiAqL1xyXG5jbGFzcyBIaWRlTW9sZWN1bGVzTm9kZSBleHRlbmRzIEhCb3gge1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdGFuZGVtOiBUYW5kZW0sIGljb25BbGlnbkJveE9wdGlvbnM6IEFsaWduQm94T3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBleWVOb2RlID0gbmV3IFBhdGgoIGV5ZVNsYXNoU29saWRTaGFwZSwgRk9OVF9BV0VTT01FX09QVElPTlMgKTtcclxuICAgIGNvbnN0IG1vbGVjdWxlTm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIC8vIHdyYXAgaW4gYSBOb2RlIGJlY2F1c2UgSDJPTm9kZSBkb2Vzbid0IHdvcmsgd2l0aCBzdGFuZGFyZCBvcHRpb25zXHJcbiAgICAgIGNoaWxkcmVuOiBbIG5ldyBIMk9Ob2RlKCBSUEFMQ29uc3RhbnRzLk1PTEVDVUxFX05PREVfT1BUSU9OUyApIF0sXHJcbiAgICAgIHNjYWxlOiAwLjQsXHJcbiAgICAgIGxlZnQ6IGV5ZU5vZGUucmlnaHQgKyAyLFxyXG4gICAgICBjZW50ZXJZOiBleWVOb2RlLmJvdHRvbVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgaWNvbiA9IG5ldyBBbGlnbkJveCggbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgZXllTm9kZSwgbW9sZWN1bGVOb2RlIF0gfSApLCBpY29uQWxpZ25Cb3hPcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgdGV4dCA9IG5ldyBUZXh0KCBSZWFjdGFudHNQcm9kdWN0c0FuZExlZnRvdmVyc1N0cmluZ3MuaGlkZU1vbGVjdWxlc1N0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBjb21iaW5lT3B0aW9uczxUZXh0T3B0aW9ucz4oIHtcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0ZXh0JyApXHJcbiAgICAgIH0sIFRFWFRfT1BUSU9OUyApICk7XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgY2hpbGRyZW46IFsgaWNvbiwgdGV4dCBdLFxyXG4gICAgICBzcGFjaW5nOiBJQ09OX1RFWFRfU1BBQ0lOR1xyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEhpZGVOdW1iZXJzTm9kZSBpcyB0aGUgY29udGVudCBmb3IgdGhlICdIaWRlIE51bWJlcnMnIHJhZGlvIGJ1dHRvbixcclxuICogYSBjbG9zZWQgZXllIHdpdGggSDJPIG1vbGVjdWxlIGF0IGxvd2VyIHJpZ2h0LCBhbmQgdGV4dCB0byB0aGUgcmlnaHQuXHJcbiAqL1xyXG5jbGFzcyBIaWRlTnVtYmVyc05vZGUgZXh0ZW5kcyBIQm94IHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRhbmRlbTogVGFuZGVtLCBpY29uQWxpZ25Cb3hPcHRpb25zOiBBbGlnbkJveE9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3QgZXllTm9kZSA9IG5ldyBQYXRoKCBleWVTbGFzaFNvbGlkU2hhcGUsIEZPTlRfQVdFU09NRV9PUFRJT05TICk7XHJcbiAgICBjb25zdCBudW1iZXJzTm9kZSA9IG5ldyBUZXh0KCAnMTIzJywge1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDggKSxcclxuICAgICAgbGVmdDogZXllTm9kZS5yaWdodCArIDIsXHJcbiAgICAgIGNlbnRlclk6IGV5ZU5vZGUuYm90dG9tXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBpY29uID0gbmV3IEFsaWduQm94KCBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBleWVOb2RlLCBudW1iZXJzTm9kZSBdIH0gKSwgaWNvbkFsaWduQm94T3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHRleHQgPSBuZXcgVGV4dCggUmVhY3RhbnRzUHJvZHVjdHNBbmRMZWZ0b3ZlcnNTdHJpbmdzLmhpZGVOdW1iZXJzU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGNvbWJpbmVPcHRpb25zPFRleHRPcHRpb25zPigge1xyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RleHQnIClcclxuICAgICAgfSwgVEVYVF9PUFRJT05TICkgKTtcclxuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICBjaGlsZHJlbjogWyBpY29uLCB0ZXh0IF0sXHJcbiAgICAgIHNwYWNpbmc6IElDT05fVEVYVF9TUEFDSU5HXHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5yZWFjdGFudHNQcm9kdWN0c0FuZExlZnRvdmVycy5yZWdpc3RlciggJ0dhbWVWaXNpYmlsaXR5UGFuZWwnLCBHYW1lVmlzaWJpbGl0eVBhbmVsICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsT0FBTyxNQUFNLCtDQUErQztBQUNuRSxTQUFTQyxjQUFjLFFBQVEsdUNBQXVDO0FBQ3RFLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsUUFBUSxFQUFtQkMsVUFBVSxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFlQyxJQUFJLFFBQXFCLG1DQUFtQztBQUMzSSxPQUFPQyxrQkFBa0IsTUFBTSwyREFBMkQ7QUFDMUYsT0FBT0MsYUFBYSxNQUFNLHNEQUFzRDtBQUNoRixPQUFPQyw0QkFBNEIsTUFBTSxvREFBb0Q7QUFDN0YsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUUvQyxPQUFPQyxhQUFhLE1BQU0sK0JBQStCO0FBQ3pELE9BQU9DLDZCQUE2QixNQUFNLHdDQUF3QztBQUNsRixPQUFPQyxvQ0FBb0MsTUFBTSwrQ0FBK0M7QUFDaEcsT0FBT0MsY0FBYyxNQUFNLDRCQUE0QjtBQUd2RCxNQUFNQyxpQkFBaUIsR0FBRyxDQUFDO0FBQzNCLE1BQU1DLFlBQXlCLEdBQUc7RUFDaENDLElBQUksRUFBRSxJQUFJakIsUUFBUSxDQUFFLEVBQUcsQ0FBQztFQUN4QmtCLFFBQVEsRUFBRTtBQUNaLENBQUM7QUFDRCxNQUFNQyxvQkFBaUMsR0FBRztFQUN4Q0MsS0FBSyxFQUFFLElBQUk7RUFDWEMsSUFBSSxFQUFFO0FBQ1IsQ0FBQztBQUVELGVBQWUsTUFBTUMsbUJBQW1CLFNBQVNaLEtBQUssQ0FBQztFQUU5Q2EsV0FBV0EsQ0FBRUMsc0JBQTJELEVBQUVDLE1BQWMsRUFBRztJQUVoRztJQUNBLE1BQU1DLG1CQUFvQyxHQUFHO01BQzNDQyxLQUFLLEVBQUUsSUFBSXpCLFVBQVUsQ0FBQyxDQUFDO01BQ3ZCMEIsTUFBTSxFQUFFO0lBQ1YsQ0FBQztJQUVELE1BQU1DLGdCQUE0RCxHQUFHLENBQ25FO01BQ0VDLEtBQUssRUFBRWhCLGNBQWMsQ0FBQ2lCLFFBQVE7TUFDOUJDLFVBQVUsRUFBRVAsTUFBTSxJQUFJLElBQUlRLFdBQVcsQ0FBRVIsTUFBTSxFQUFFQyxtQkFBb0IsQ0FBQztNQUNwRVEsVUFBVSxFQUFFO0lBQ2QsQ0FBQyxFQUNEO01BQ0VKLEtBQUssRUFBRWhCLGNBQWMsQ0FBQ3FCLGNBQWM7TUFDcENILFVBQVUsRUFBSVAsTUFBYyxJQUFNLElBQUlXLGlCQUFpQixDQUFFWCxNQUFNLEVBQUVDLG1CQUFvQixDQUFDO01BQ3RGUSxVQUFVLEVBQUU7SUFDZCxDQUFDLEVBQ0Q7TUFDRUosS0FBSyxFQUFFaEIsY0FBYyxDQUFDdUIsWUFBWTtNQUNsQ0wsVUFBVSxFQUFJUCxNQUFjLElBQU0sSUFBSWEsZUFBZSxDQUFFYixNQUFNLEVBQUVDLG1CQUFvQixDQUFDO01BQ3BGUSxVQUFVLEVBQUU7SUFDZCxDQUFDLENBQ0Y7SUFFRCxNQUFNSyxnQkFBZ0IsR0FBRyxJQUFJOUIsNEJBQTRCLENBQWtCZSxzQkFBc0IsRUFBRUssZ0JBQWdCLEVBQUU7TUFDbkhXLE9BQU8sRUFBRSxFQUFFO01BQ1hDLGtCQUFrQixFQUFFLEVBQUU7TUFDdEJDLGtCQUFrQixFQUFFLENBQUM7TUFDckJDLGtCQUFrQixFQUFFO1FBQ2xCQyxNQUFNLEVBQUUsQ0FBQztRQUNUQyxRQUFRLEVBQUU7TUFDWixDQUFDO01BQ0RwQixNQUFNLEVBQUVBLE1BQU0sQ0FBQ3FCLFlBQVksQ0FBRSxrQkFBbUI7SUFDbEQsQ0FBRSxDQUFDO0lBRUgsS0FBSyxDQUFFUCxnQkFBZ0IsRUFBRTtNQUN2QlEsT0FBTyxFQUFFLEVBQUU7TUFDWEMsT0FBTyxFQUFFLEVBQUU7TUFDWDNCLElBQUksRUFBRSxzQkFBc0I7TUFDNUI0QixNQUFNLEVBQUUsc0JBQXNCO01BQzlCQyxTQUFTLEVBQUUsR0FBRztNQUNkekIsTUFBTSxFQUFFQTtJQUNWLENBQUUsQ0FBQztFQUNMO0FBQ0Y7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBTVEsV0FBVyxTQUFTOUIsSUFBSSxDQUFDO0VBQ3RCb0IsV0FBV0EsQ0FBRUUsTUFBYyxFQUFFQyxtQkFBb0MsRUFBRztJQUV6RSxNQUFNeUIsSUFBSSxHQUFHLElBQUlsRCxRQUFRLENBQUUsSUFBSUksSUFBSSxDQUFFRyxhQUFhLEVBQUVXLG9CQUFxQixDQUFDLEVBQUVPLG1CQUFvQixDQUFDO0lBRWpHLE1BQU0wQixJQUFJLEdBQUcsSUFBSTlDLElBQUksQ0FBRU8sb0NBQW9DLENBQUN3QyxxQkFBcUIsRUFDL0V0RCxjQUFjLENBQWU7TUFDM0IwQixNQUFNLEVBQUVBLE1BQU0sQ0FBQ3FCLFlBQVksQ0FBRSxNQUFPO0lBQ3RDLENBQUMsRUFBRTlCLFlBQWEsQ0FBRSxDQUFDO0lBRXJCLEtBQUssQ0FBRTtNQUNMc0MsUUFBUSxFQUFFLENBQUVILElBQUksRUFBRUMsSUFBSSxDQUFFO01BQ3hCWixPQUFPLEVBQUV6QjtJQUNYLENBQUUsQ0FBQztFQUNMO0FBQ0Y7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNcUIsaUJBQWlCLFNBQVNqQyxJQUFJLENBQUM7RUFDNUJvQixXQUFXQSxDQUFFRSxNQUFjLEVBQUVDLG1CQUFvQyxFQUFHO0lBRXpFLE1BQU02QixPQUFPLEdBQUcsSUFBSWxELElBQUksQ0FBRUUsa0JBQWtCLEVBQUVZLG9CQUFxQixDQUFDO0lBQ3BFLE1BQU1xQyxZQUFZLEdBQUcsSUFBSXBELElBQUksQ0FBRTtNQUM3QjtNQUNBa0QsUUFBUSxFQUFFLENBQUUsSUFBSXhELE9BQU8sQ0FBRWEsYUFBYSxDQUFDOEMscUJBQXNCLENBQUMsQ0FBRTtNQUNoRXJDLEtBQUssRUFBRSxHQUFHO01BQ1ZzQyxJQUFJLEVBQUVILE9BQU8sQ0FBQ0ksS0FBSyxHQUFHLENBQUM7TUFDdkJDLE9BQU8sRUFBRUwsT0FBTyxDQUFDTTtJQUNuQixDQUFFLENBQUM7SUFDSCxNQUFNVixJQUFJLEdBQUcsSUFBSWxELFFBQVEsQ0FBRSxJQUFJRyxJQUFJLENBQUU7TUFBRWtELFFBQVEsRUFBRSxDQUFFQyxPQUFPLEVBQUVDLFlBQVk7SUFBRyxDQUFFLENBQUMsRUFBRTlCLG1CQUFvQixDQUFDO0lBRXJHLE1BQU0wQixJQUFJLEdBQUcsSUFBSTlDLElBQUksQ0FBRU8sb0NBQW9DLENBQUNpRCwyQkFBMkIsRUFDckYvRCxjQUFjLENBQWU7TUFDM0IwQixNQUFNLEVBQUVBLE1BQU0sQ0FBQ3FCLFlBQVksQ0FBRSxNQUFPO0lBQ3RDLENBQUMsRUFBRTlCLFlBQWEsQ0FBRSxDQUFDO0lBRXJCLEtBQUssQ0FBRTtNQUNMc0MsUUFBUSxFQUFFLENBQUVILElBQUksRUFBRUMsSUFBSSxDQUFFO01BQ3hCWixPQUFPLEVBQUV6QjtJQUNYLENBQUUsQ0FBQztFQUNMO0FBQ0Y7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNdUIsZUFBZSxTQUFTbkMsSUFBSSxDQUFDO0VBQzFCb0IsV0FBV0EsQ0FBRUUsTUFBYyxFQUFFQyxtQkFBb0MsRUFBRztJQUV6RSxNQUFNNkIsT0FBTyxHQUFHLElBQUlsRCxJQUFJLENBQUVFLGtCQUFrQixFQUFFWSxvQkFBcUIsQ0FBQztJQUNwRSxNQUFNNEMsV0FBVyxHQUFHLElBQUl6RCxJQUFJLENBQUUsS0FBSyxFQUFFO01BQ25DVyxJQUFJLEVBQUUsSUFBSWpCLFFBQVEsQ0FBRSxDQUFFLENBQUM7TUFDdkIwRCxJQUFJLEVBQUVILE9BQU8sQ0FBQ0ksS0FBSyxHQUFHLENBQUM7TUFDdkJDLE9BQU8sRUFBRUwsT0FBTyxDQUFDTTtJQUNuQixDQUFFLENBQUM7SUFDSCxNQUFNVixJQUFJLEdBQUcsSUFBSWxELFFBQVEsQ0FBRSxJQUFJRyxJQUFJLENBQUU7TUFBRWtELFFBQVEsRUFBRSxDQUFFQyxPQUFPLEVBQUVRLFdBQVc7SUFBRyxDQUFFLENBQUMsRUFBRXJDLG1CQUFvQixDQUFDO0lBRXBHLE1BQU0wQixJQUFJLEdBQUcsSUFBSTlDLElBQUksQ0FBRU8sb0NBQW9DLENBQUNtRCx5QkFBeUIsRUFDbkZqRSxjQUFjLENBQWU7TUFDM0IwQixNQUFNLEVBQUVBLE1BQU0sQ0FBQ3FCLFlBQVksQ0FBRSxNQUFPO0lBQ3RDLENBQUMsRUFBRTlCLFlBQWEsQ0FBRSxDQUFDO0lBRXJCLEtBQUssQ0FBRTtNQUNMc0MsUUFBUSxFQUFFLENBQUVILElBQUksRUFBRUMsSUFBSSxDQUFFO01BQ3hCWixPQUFPLEVBQUV6QjtJQUNYLENBQUUsQ0FBQztFQUNMO0FBQ0Y7QUFFQUgsNkJBQTZCLENBQUNxRCxRQUFRLENBQUUscUJBQXFCLEVBQUUzQyxtQkFBb0IsQ0FBQyJ9