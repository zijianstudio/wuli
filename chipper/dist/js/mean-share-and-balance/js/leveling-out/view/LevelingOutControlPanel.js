// Copyright 2022, University of Colorado Boulder

/**
 * Control panel for the Leveling Out screen that contains an accordion box, sync button, and number spinner.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberSpinner from '../../../../sun/js/NumberSpinner.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import SyncButton from '../../common/view/SyncButton.js';
import chocolateBar_png from '../../../images/chocolateBar_png.js';
import { Shape } from '../../../../kite/js/imports.js';
import InfoBooleanStickyToggleButton from '../../common/view/InfoBooleanStickyToggleButton.js';
import optionize from '../../../../phet-core/js/optionize.js';
import MeanShareAndBalanceConstants from '../../common/MeanShareAndBalanceConstants.js';
import MeanShareAndBalanceStrings from '../../MeanShareAndBalanceStrings.js';
import meanShareAndBalance from '../../meanShareAndBalance.js';
import { GridBox, FireListener, Image, Text, VBox } from '../../../../scenery/js/imports.js';
export default class LevelingOutControlPanel extends GridBox {
  constructor(model, meanCalculationDialogVisibleProperty, providedOptions) {
    const options = providedOptions;

    // Scale down the large chocolate images
    const SCALE_FACTOR = 0.05;
    const meanChocolateBarsNode = new VBox({
      scale: SCALE_FACTOR,
      align: 'left',
      spacing: 1.5 / SCALE_FACTOR,
      layoutOptions: {
        yAlign: 'top'
      }
    });

    // Just for the dimensions
    const chocolateBarImage = new Image(chocolateBar_png);
    model.meanProperty.link(mean => {
      const wholePart = Math.floor(mean);
      const remainder = mean - wholePart;
      const children = _.times(wholePart, () => new Image(chocolateBar_png));
      if (remainder > 0) {
        // Partial chocolate bars are shown on top
        children.unshift(new Image(chocolateBar_png, {
          clipArea: Shape.rect(0, 0, remainder * chocolateBarImage.width, chocolateBarImage.height)
        }));
      }
      meanChocolateBarsNode.children = children;
    });
    const infoButton = new InfoBooleanStickyToggleButton(meanCalculationDialogVisibleProperty, options.tandem);
    const meanNode = new GridBox({
      columns: [[meanChocolateBarsNode], [infoButton]],
      yAlign: 'top',
      spacing: 40
    });
    const meanAccordionBox = new AccordionBox(meanNode, {
      titleNode: new Text('Mean', {
        fontSize: 15,
        maxWidth: MeanShareAndBalanceConstants.MAX_CONTROLS_TEXT_WIDTH
      }),
      expandedProperty: model.isMeanAccordionExpandedProperty,
      layoutOptions: {
        minContentHeight: 200,
        yAlign: 'top'
      },
      // phet-io
      tandem: options.tandem.createTandem('meanAccordionBox')
    });
    const syncListener = new FireListener({
      fire: () => model.syncData(),
      tandem: options.tandem.createTandem('syncListener')
    });
    const syncButton = new SyncButton({
      inputListeners: [syncListener],
      tandem: options.tandem.createTandem('syncButton')
    });

    // REVIEW: How could we do this with putting this metadata on the SyncButton itself? May need to ask @jonathanolson
    const syncVBox = new VBox({
      align: 'left',
      children: [syncButton],
      layoutOptions: {
        row: 1,
        minContentHeight: 38,
        yAlign: 'top'
      }
    });

    // Number Spinner
    const numberOfPeopleText = new Text(MeanShareAndBalanceStrings.numberOfPeopleStringProperty, {
      fontSize: 15,
      maxWidth: MeanShareAndBalanceConstants.MAX_CONTROLS_TEXT_WIDTH
    });
    const numberSpinner = new NumberSpinner(model.numberOfPeopleProperty, model.numberOfPeopleRangeProperty, {
      arrowsPosition: 'leftRight',
      layoutOptions: {
        align: 'left'
      },
      accessibleName: MeanShareAndBalanceStrings.numberOfCupsStringProperty,
      // phet-io
      tandem: options.tandem.createTandem('numberSpinner')
    });
    const numberSpinnerVBox = new VBox({
      children: [numberOfPeopleText, numberSpinner],
      align: 'left',
      justify: 'bottom',
      spacing: 10,
      layoutOptions: {
        row: 2
      }
    });
    const superOptions = optionize()({
      children: [meanAccordionBox, syncVBox, numberSpinnerVBox],
      xAlign: 'left'
    }, providedOptions);
    super(superOptions);
  }
}
meanShareAndBalance.register('LevelingOutControlPanel', LevelingOutControlPanel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJTcGlubmVyIiwiQWNjb3JkaW9uQm94IiwiU3luY0J1dHRvbiIsImNob2NvbGF0ZUJhcl9wbmciLCJTaGFwZSIsIkluZm9Cb29sZWFuU3RpY2t5VG9nZ2xlQnV0dG9uIiwib3B0aW9uaXplIiwiTWVhblNoYXJlQW5kQmFsYW5jZUNvbnN0YW50cyIsIk1lYW5TaGFyZUFuZEJhbGFuY2VTdHJpbmdzIiwibWVhblNoYXJlQW5kQmFsYW5jZSIsIkdyaWRCb3giLCJGaXJlTGlzdGVuZXIiLCJJbWFnZSIsIlRleHQiLCJWQm94IiwiTGV2ZWxpbmdPdXRDb250cm9sUGFuZWwiLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwibWVhbkNhbGN1bGF0aW9uRGlhbG9nVmlzaWJsZVByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsIlNDQUxFX0ZBQ1RPUiIsIm1lYW5DaG9jb2xhdGVCYXJzTm9kZSIsInNjYWxlIiwiYWxpZ24iLCJzcGFjaW5nIiwibGF5b3V0T3B0aW9ucyIsInlBbGlnbiIsImNob2NvbGF0ZUJhckltYWdlIiwibWVhblByb3BlcnR5IiwibGluayIsIm1lYW4iLCJ3aG9sZVBhcnQiLCJNYXRoIiwiZmxvb3IiLCJyZW1haW5kZXIiLCJjaGlsZHJlbiIsIl8iLCJ0aW1lcyIsInVuc2hpZnQiLCJjbGlwQXJlYSIsInJlY3QiLCJ3aWR0aCIsImhlaWdodCIsImluZm9CdXR0b24iLCJ0YW5kZW0iLCJtZWFuTm9kZSIsImNvbHVtbnMiLCJtZWFuQWNjb3JkaW9uQm94IiwidGl0bGVOb2RlIiwiZm9udFNpemUiLCJtYXhXaWR0aCIsIk1BWF9DT05UUk9MU19URVhUX1dJRFRIIiwiZXhwYW5kZWRQcm9wZXJ0eSIsImlzTWVhbkFjY29yZGlvbkV4cGFuZGVkUHJvcGVydHkiLCJtaW5Db250ZW50SGVpZ2h0IiwiY3JlYXRlVGFuZGVtIiwic3luY0xpc3RlbmVyIiwiZmlyZSIsInN5bmNEYXRhIiwic3luY0J1dHRvbiIsImlucHV0TGlzdGVuZXJzIiwic3luY1ZCb3giLCJyb3ciLCJudW1iZXJPZlBlb3BsZVRleHQiLCJudW1iZXJPZlBlb3BsZVN0cmluZ1Byb3BlcnR5IiwibnVtYmVyU3Bpbm5lciIsIm51bWJlck9mUGVvcGxlUHJvcGVydHkiLCJudW1iZXJPZlBlb3BsZVJhbmdlUHJvcGVydHkiLCJhcnJvd3NQb3NpdGlvbiIsImFjY2Vzc2libGVOYW1lIiwibnVtYmVyT2ZDdXBzU3RyaW5nUHJvcGVydHkiLCJudW1iZXJTcGlubmVyVkJveCIsImp1c3RpZnkiLCJzdXBlck9wdGlvbnMiLCJ4QWxpZ24iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkxldmVsaW5nT3V0Q29udHJvbFBhbmVsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb250cm9sIHBhbmVsIGZvciB0aGUgTGV2ZWxpbmcgT3V0IHNjcmVlbiB0aGF0IGNvbnRhaW5zIGFuIGFjY29yZGlvbiBib3gsIHN5bmMgYnV0dG9uLCBhbmQgbnVtYmVyIHNwaW5uZXIuXHJcbiAqXHJcbiAqIEBhdXRob3IgTWFybGEgU2NodWx6IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuaW1wb3J0IE51bWJlclNwaW5uZXIgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL051bWJlclNwaW5uZXIuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgQWNjb3JkaW9uQm94IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9BY2NvcmRpb25Cb3guanMnO1xyXG5pbXBvcnQgU3luY0J1dHRvbiBmcm9tICcuLi8uLi9jb21tb24vdmlldy9TeW5jQnV0dG9uLmpzJztcclxuaW1wb3J0IExldmVsaW5nT3V0TW9kZWwgZnJvbSAnLi4vbW9kZWwvTGV2ZWxpbmdPdXRNb2RlbC5qcyc7XHJcbmltcG9ydCBjaG9jb2xhdGVCYXJfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9jaG9jb2xhdGVCYXJfcG5nLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgSW5mb0Jvb2xlYW5TdGlja3lUb2dnbGVCdXR0b24gZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvSW5mb0Jvb2xlYW5TdGlja3lUb2dnbGVCdXR0b24uanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IE1lYW5TaGFyZUFuZEJhbGFuY2VDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL01lYW5TaGFyZUFuZEJhbGFuY2VDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgTWVhblNoYXJlQW5kQmFsYW5jZVN0cmluZ3MgZnJvbSAnLi4vLi4vTWVhblNoYXJlQW5kQmFsYW5jZVN0cmluZ3MuanMnO1xyXG5pbXBvcnQgbWVhblNoYXJlQW5kQmFsYW5jZSBmcm9tICcuLi8uLi9tZWFuU2hhcmVBbmRCYWxhbmNlLmpzJztcclxuaW1wb3J0IHsgR3JpZEJveCwgRmlyZUxpc3RlbmVyLCBJbWFnZSwgVGV4dCwgR3JpZEJveE9wdGlvbnMsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxudHlwZSBMZXZlbGluZ091dENvbnRyb2xQYW5lbE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8R3JpZEJveE9wdGlvbnMsICdjaGlsZHJlbicgfCAneEFsaWduJz4gJiBQaWNrUmVxdWlyZWQ8R3JpZEJveE9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExldmVsaW5nT3V0Q29udHJvbFBhbmVsIGV4dGVuZHMgR3JpZEJveCB7XHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbDogUGljazxMZXZlbGluZ091dE1vZGVsLCAnaXNNZWFuQWNjb3JkaW9uRXhwYW5kZWRQcm9wZXJ0eScgfCAnbnVtYmVyT2ZQZW9wbGVSYW5nZVByb3BlcnR5JyB8ICdudW1iZXJPZlBlb3BsZVByb3BlcnR5JyB8ICdtZWFuUHJvcGVydHknIHwgJ3N5bmNEYXRhJz4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBtZWFuQ2FsY3VsYXRpb25EaWFsb2dWaXNpYmxlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+LCBwcm92aWRlZE9wdGlvbnM6IExldmVsaW5nT3V0Q29udHJvbFBhbmVsT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gcHJvdmlkZWRPcHRpb25zO1xyXG5cclxuICAgIC8vIFNjYWxlIGRvd24gdGhlIGxhcmdlIGNob2NvbGF0ZSBpbWFnZXNcclxuICAgIGNvbnN0IFNDQUxFX0ZBQ1RPUiA9IDAuMDU7XHJcblxyXG4gICAgY29uc3QgbWVhbkNob2NvbGF0ZUJhcnNOb2RlID0gbmV3IFZCb3goIHtcclxuICAgICAgc2NhbGU6IFNDQUxFX0ZBQ1RPUixcclxuICAgICAgYWxpZ246ICdsZWZ0JyxcclxuICAgICAgc3BhY2luZzogMS41IC8gU0NBTEVfRkFDVE9SLFxyXG4gICAgICBsYXlvdXRPcHRpb25zOiB7XHJcbiAgICAgICAgeUFsaWduOiAndG9wJ1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gSnVzdCBmb3IgdGhlIGRpbWVuc2lvbnNcclxuICAgIGNvbnN0IGNob2NvbGF0ZUJhckltYWdlID0gbmV3IEltYWdlKCBjaG9jb2xhdGVCYXJfcG5nICk7XHJcblxyXG4gICAgbW9kZWwubWVhblByb3BlcnR5LmxpbmsoIG1lYW4gPT4ge1xyXG4gICAgICBjb25zdCB3aG9sZVBhcnQgPSBNYXRoLmZsb29yKCBtZWFuICk7XHJcbiAgICAgIGNvbnN0IHJlbWFpbmRlciA9IG1lYW4gLSB3aG9sZVBhcnQ7XHJcblxyXG4gICAgICBjb25zdCBjaGlsZHJlbiA9IF8udGltZXMoIHdob2xlUGFydCwgKCkgPT4gbmV3IEltYWdlKCBjaG9jb2xhdGVCYXJfcG5nICkgKTtcclxuICAgICAgaWYgKCByZW1haW5kZXIgPiAwICkge1xyXG5cclxuICAgICAgICAvLyBQYXJ0aWFsIGNob2NvbGF0ZSBiYXJzIGFyZSBzaG93biBvbiB0b3BcclxuICAgICAgICBjaGlsZHJlbi51bnNoaWZ0KCBuZXcgSW1hZ2UoIGNob2NvbGF0ZUJhcl9wbmcsIHtcclxuICAgICAgICAgIGNsaXBBcmVhOiBTaGFwZS5yZWN0KCAwLCAwLCByZW1haW5kZXIgKiBjaG9jb2xhdGVCYXJJbWFnZS53aWR0aCwgY2hvY29sYXRlQmFySW1hZ2UuaGVpZ2h0IClcclxuICAgICAgICB9ICkgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgbWVhbkNob2NvbGF0ZUJhcnNOb2RlLmNoaWxkcmVuID0gY2hpbGRyZW47XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgaW5mb0J1dHRvbiA9IG5ldyBJbmZvQm9vbGVhblN0aWNreVRvZ2dsZUJ1dHRvbiggbWVhbkNhbGN1bGF0aW9uRGlhbG9nVmlzaWJsZVByb3BlcnR5LCBvcHRpb25zLnRhbmRlbSApO1xyXG5cclxuICAgIGNvbnN0IG1lYW5Ob2RlID0gbmV3IEdyaWRCb3goIHsgY29sdW1uczogWyBbIG1lYW5DaG9jb2xhdGVCYXJzTm9kZSBdLCBbIGluZm9CdXR0b24gXSBdLCB5QWxpZ246ICd0b3AnLCBzcGFjaW5nOiA0MCB9ICk7XHJcblxyXG4gICAgY29uc3QgbWVhbkFjY29yZGlvbkJveCA9IG5ldyBBY2NvcmRpb25Cb3goIG1lYW5Ob2RlLCB7XHJcbiAgICAgIHRpdGxlTm9kZTogbmV3IFRleHQoICdNZWFuJywgeyBmb250U2l6ZTogMTUsIG1heFdpZHRoOiBNZWFuU2hhcmVBbmRCYWxhbmNlQ29uc3RhbnRzLk1BWF9DT05UUk9MU19URVhUX1dJRFRIIH0gKSxcclxuICAgICAgZXhwYW5kZWRQcm9wZXJ0eTogbW9kZWwuaXNNZWFuQWNjb3JkaW9uRXhwYW5kZWRQcm9wZXJ0eSxcclxuICAgICAgbGF5b3V0T3B0aW9uczogeyBtaW5Db250ZW50SGVpZ2h0OiAyMDAsIHlBbGlnbjogJ3RvcCcgfSxcclxuXHJcbiAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdtZWFuQWNjb3JkaW9uQm94JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgc3luY0xpc3RlbmVyID0gbmV3IEZpcmVMaXN0ZW5lciggeyBmaXJlOiAoKSA9PiBtb2RlbC5zeW5jRGF0YSgpLCB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N5bmNMaXN0ZW5lcicgKSB9ICk7XHJcblxyXG4gICAgY29uc3Qgc3luY0J1dHRvbiA9IG5ldyBTeW5jQnV0dG9uKCB7IGlucHV0TGlzdGVuZXJzOiBbIHN5bmNMaXN0ZW5lciBdLCB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N5bmNCdXR0b24nICkgfSApO1xyXG5cclxuICAgIC8vIFJFVklFVzogSG93IGNvdWxkIHdlIGRvIHRoaXMgd2l0aCBwdXR0aW5nIHRoaXMgbWV0YWRhdGEgb24gdGhlIFN5bmNCdXR0b24gaXRzZWxmPyBNYXkgbmVlZCB0byBhc2sgQGpvbmF0aGFub2xzb25cclxuICAgIGNvbnN0IHN5bmNWQm94ID0gbmV3IFZCb3goIHtcclxuICAgICAgICBhbGlnbjogJ2xlZnQnLCBjaGlsZHJlbjogWyBzeW5jQnV0dG9uIF0sXHJcbiAgICAgICAgbGF5b3V0T3B0aW9uczogeyByb3c6IDEsIG1pbkNvbnRlbnRIZWlnaHQ6IDM4LCB5QWxpZ246ICd0b3AnIH1cclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBOdW1iZXIgU3Bpbm5lclxyXG4gICAgY29uc3QgbnVtYmVyT2ZQZW9wbGVUZXh0ID0gbmV3IFRleHQoIE1lYW5TaGFyZUFuZEJhbGFuY2VTdHJpbmdzLm51bWJlck9mUGVvcGxlU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgZm9udFNpemU6IDE1LFxyXG4gICAgICBtYXhXaWR0aDogTWVhblNoYXJlQW5kQmFsYW5jZUNvbnN0YW50cy5NQVhfQ09OVFJPTFNfVEVYVF9XSURUSFxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IG51bWJlclNwaW5uZXIgPSBuZXcgTnVtYmVyU3Bpbm5lcihcclxuICAgICAgbW9kZWwubnVtYmVyT2ZQZW9wbGVQcm9wZXJ0eSxcclxuICAgICAgbW9kZWwubnVtYmVyT2ZQZW9wbGVSYW5nZVByb3BlcnR5LCB7XHJcbiAgICAgICAgYXJyb3dzUG9zaXRpb246ICdsZWZ0UmlnaHQnLFxyXG4gICAgICAgIGxheW91dE9wdGlvbnM6IHtcclxuICAgICAgICAgIGFsaWduOiAnbGVmdCdcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFjY2Vzc2libGVOYW1lOiBNZWFuU2hhcmVBbmRCYWxhbmNlU3RyaW5ncy5udW1iZXJPZkN1cHNTdHJpbmdQcm9wZXJ0eSxcclxuXHJcbiAgICAgICAgLy8gcGhldC1pb1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnbnVtYmVyU3Bpbm5lcicgKVxyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IG51bWJlclNwaW5uZXJWQm94ID0gbmV3IFZCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFsgbnVtYmVyT2ZQZW9wbGVUZXh0LCBudW1iZXJTcGlubmVyIF0sXHJcbiAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgIGp1c3RpZnk6ICdib3R0b20nLFxyXG4gICAgICBzcGFjaW5nOiAxMCxcclxuICAgICAgbGF5b3V0T3B0aW9uczogeyByb3c6IDIgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHN1cGVyT3B0aW9ucyA9IG9wdGlvbml6ZTxMZXZlbGluZ091dENvbnRyb2xQYW5lbE9wdGlvbnMsIFNlbGZPcHRpb25zLCBHcmlkQm94T3B0aW9ucz4oKSgge1xyXG4gICAgICBjaGlsZHJlbjogWyBtZWFuQWNjb3JkaW9uQm94LCBzeW5jVkJveCwgbnVtYmVyU3Bpbm5lclZCb3ggXSwgeEFsaWduOiAnbGVmdCdcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBzdXBlck9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbm1lYW5TaGFyZUFuZEJhbGFuY2UucmVnaXN0ZXIoICdMZXZlbGluZ091dENvbnRyb2xQYW5lbCcsIExldmVsaW5nT3V0Q29udHJvbFBhbmVsICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsYUFBYSxNQUFNLHFDQUFxQztBQUUvRCxPQUFPQyxZQUFZLE1BQU0sb0NBQW9DO0FBQzdELE9BQU9DLFVBQVUsTUFBTSxpQ0FBaUM7QUFFeEQsT0FBT0MsZ0JBQWdCLE1BQU0scUNBQXFDO0FBQ2xFLFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0MsNkJBQTZCLE1BQU0sb0RBQW9EO0FBQzlGLE9BQU9DLFNBQVMsTUFBNEIsdUNBQXVDO0FBQ25GLE9BQU9DLDRCQUE0QixNQUFNLDhDQUE4QztBQUN2RixPQUFPQywwQkFBMEIsTUFBTSxxQ0FBcUM7QUFDNUUsT0FBT0MsbUJBQW1CLE1BQU0sOEJBQThCO0FBQzlELFNBQVNDLE9BQU8sRUFBRUMsWUFBWSxFQUFFQyxLQUFLLEVB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