// Copyright 2017-2023, University of Colorado Boulder

/**
 * The view for the Explore screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import CCKCScreenView from '../../../../circuit-construction-kit-common/js/view/CCKCScreenView.js';
import CCKCConstants from '../../../../circuit-construction-kit-common/js/CCKCConstants.js';
import CircuitElementToolFactory from '../../../../circuit-construction-kit-common/js/view/CircuitElementToolFactory.js';
import circuitConstructionKitBlackBoxStudy from '../../circuitConstructionKitBlackBoxStudy.js';
class ExploreScreenView extends CCKCScreenView {
  /**
   * @param {CircuitConstructionKitModel} model
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    const circuitElementToolFactory = new CircuitElementToolFactory(model.circuit, model.showLabelsProperty, model.viewTypeProperty, point => this.circuitNode.globalToLocalPoint(point), tandem.createTandem('circuitElementToolbox').createTandem('carousel').createTandem('circuitElementTools'));

    // Tool nodes that appear on every screen. Pagination for the carousel, each page should begin with wire node
    const circuitElementToolNodes = [
    // This page is duplicated in the Lab Screen View
    {
      createNode: tandem => circuitElementToolFactory.createWireToolNode(tandem),
      tandemName: 'wireToolNode1'
    }, {
      createNode: tandem => circuitElementToolFactory.createRightBatteryToolNode(tandem),
      tandemName: 'batteryToolNode'
    }, {
      createNode: tandem => circuitElementToolFactory.createLightBulbToolNode(tandem),
      tandemName: 'lightBulbToolNode'
    }, {
      createNode: tandem => circuitElementToolFactory.createResistorToolNode(tandem),
      tandemName: 'resistorToolNode'
    }, {
      createNode: tandem => circuitElementToolFactory.createSwitchToolNode(tandem),
      tandemName: 'switchToolNode'
    }, {
      createNode: tandem => circuitElementToolFactory.createWireToolNode(tandem),
      tandemName: 'wireToolNode2'
    }, {
      createNode: tandem => circuitElementToolFactory.createFuseToolNode(tandem),
      tandemName: 'fuseToolNode'
    }, {
      createNode: tandem => circuitElementToolFactory.createDollarBillToolNode(tandem),
      tandemName: 'dollarBillToolNode'
    }, {
      createNode: tandem => circuitElementToolFactory.createPaperClipToolNode(tandem),
      tandemName: 'paperClipToolNode'
    }, {
      createNode: tandem => circuitElementToolFactory.createCoinToolNode(tandem),
      tandemName: 'coinToolNode'
    }, {
      createNode: tandem => circuitElementToolFactory.createEraserToolNode(tandem),
      tandemName: 'eraserToolNode'
    }, {
      createNode: tandem => circuitElementToolFactory.createWireToolNode(tandem),
      tandemName: 'wireToolNode3'
    }, {
      createNode: tandem => circuitElementToolFactory.createPencilToolNode(tandem),
      tandemName: 'pencilToolNode'
    }];
    super(model, circuitElementToolNodes, tandem, {
      blackBoxStudy: true,
      circuitElementToolboxOptions: {
        carouselScale: CCKCConstants.DC_CAROUSEL_SCALE
      }
    });
  }
}
circuitConstructionKitBlackBoxStudy.register('ExploreScreenView', ExploreScreenView);
export default ExploreScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDQ0tDU2NyZWVuVmlldyIsIkNDS0NDb25zdGFudHMiLCJDaXJjdWl0RWxlbWVudFRvb2xGYWN0b3J5IiwiY2lyY3VpdENvbnN0cnVjdGlvbktpdEJsYWNrQm94U3R1ZHkiLCJFeHBsb3JlU2NyZWVuVmlldyIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJ0YW5kZW0iLCJjaXJjdWl0RWxlbWVudFRvb2xGYWN0b3J5IiwiY2lyY3VpdCIsInNob3dMYWJlbHNQcm9wZXJ0eSIsInZpZXdUeXBlUHJvcGVydHkiLCJwb2ludCIsImNpcmN1aXROb2RlIiwiZ2xvYmFsVG9Mb2NhbFBvaW50IiwiY3JlYXRlVGFuZGVtIiwiY2lyY3VpdEVsZW1lbnRUb29sTm9kZXMiLCJjcmVhdGVOb2RlIiwiY3JlYXRlV2lyZVRvb2xOb2RlIiwidGFuZGVtTmFtZSIsImNyZWF0ZVJpZ2h0QmF0dGVyeVRvb2xOb2RlIiwiY3JlYXRlTGlnaHRCdWxiVG9vbE5vZGUiLCJjcmVhdGVSZXNpc3RvclRvb2xOb2RlIiwiY3JlYXRlU3dpdGNoVG9vbE5vZGUiLCJjcmVhdGVGdXNlVG9vbE5vZGUiLCJjcmVhdGVEb2xsYXJCaWxsVG9vbE5vZGUiLCJjcmVhdGVQYXBlckNsaXBUb29sTm9kZSIsImNyZWF0ZUNvaW5Ub29sTm9kZSIsImNyZWF0ZUVyYXNlclRvb2xOb2RlIiwiY3JlYXRlUGVuY2lsVG9vbE5vZGUiLCJibGFja0JveFN0dWR5IiwiY2lyY3VpdEVsZW1lbnRUb29sYm94T3B0aW9ucyIsImNhcm91c2VsU2NhbGUiLCJEQ19DQVJPVVNFTF9TQ0FMRSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRXhwbG9yZVNjcmVlblZpZXcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhlIHZpZXcgZm9yIHRoZSBFeHBsb3JlIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQ0NLQ1NjcmVlblZpZXcgZnJvbSAnLi4vLi4vLi4vLi4vY2lyY3VpdC1jb25zdHJ1Y3Rpb24ta2l0LWNvbW1vbi9qcy92aWV3L0NDS0NTY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IENDS0NDb25zdGFudHMgZnJvbSAnLi4vLi4vLi4vLi4vY2lyY3VpdC1jb25zdHJ1Y3Rpb24ta2l0LWNvbW1vbi9qcy9DQ0tDQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IENpcmN1aXRFbGVtZW50VG9vbEZhY3RvcnkgZnJvbSAnLi4vLi4vLi4vLi4vY2lyY3VpdC1jb25zdHJ1Y3Rpb24ta2l0LWNvbW1vbi9qcy92aWV3L0NpcmN1aXRFbGVtZW50VG9vbEZhY3RvcnkuanMnO1xyXG5pbXBvcnQgY2lyY3VpdENvbnN0cnVjdGlvbktpdEJsYWNrQm94U3R1ZHkgZnJvbSAnLi4vLi4vY2lyY3VpdENvbnN0cnVjdGlvbktpdEJsYWNrQm94U3R1ZHkuanMnO1xyXG5cclxuY2xhc3MgRXhwbG9yZVNjcmVlblZpZXcgZXh0ZW5kcyBDQ0tDU2NyZWVuVmlldyB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7Q2lyY3VpdENvbnN0cnVjdGlvbktpdE1vZGVsfSBtb2RlbFxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIHRhbmRlbSApIHtcclxuICAgIGNvbnN0IGNpcmN1aXRFbGVtZW50VG9vbEZhY3RvcnkgPSBuZXcgQ2lyY3VpdEVsZW1lbnRUb29sRmFjdG9yeShcclxuICAgICAgbW9kZWwuY2lyY3VpdCxcclxuICAgICAgbW9kZWwuc2hvd0xhYmVsc1Byb3BlcnR5LFxyXG4gICAgICBtb2RlbC52aWV3VHlwZVByb3BlcnR5LFxyXG4gICAgICBwb2ludCA9PiB0aGlzLmNpcmN1aXROb2RlLmdsb2JhbFRvTG9jYWxQb2ludCggcG9pbnQgKSxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NpcmN1aXRFbGVtZW50VG9vbGJveCcgKS5jcmVhdGVUYW5kZW0oICdjYXJvdXNlbCcgKS5jcmVhdGVUYW5kZW0oICdjaXJjdWl0RWxlbWVudFRvb2xzJyApXHJcbiAgICApO1xyXG5cclxuICAgIC8vIFRvb2wgbm9kZXMgdGhhdCBhcHBlYXIgb24gZXZlcnkgc2NyZWVuLiBQYWdpbmF0aW9uIGZvciB0aGUgY2Fyb3VzZWwsIGVhY2ggcGFnZSBzaG91bGQgYmVnaW4gd2l0aCB3aXJlIG5vZGVcclxuICAgIGNvbnN0IGNpcmN1aXRFbGVtZW50VG9vbE5vZGVzID0gW1xyXG5cclxuICAgICAgLy8gVGhpcyBwYWdlIGlzIGR1cGxpY2F0ZWQgaW4gdGhlIExhYiBTY3JlZW4gVmlld1xyXG4gICAgICB7IGNyZWF0ZU5vZGU6IHRhbmRlbSA9PiBjaXJjdWl0RWxlbWVudFRvb2xGYWN0b3J5LmNyZWF0ZVdpcmVUb29sTm9kZSggdGFuZGVtICksIHRhbmRlbU5hbWU6ICd3aXJlVG9vbE5vZGUxJyB9LFxyXG4gICAgICB7IGNyZWF0ZU5vZGU6IHRhbmRlbSA9PiBjaXJjdWl0RWxlbWVudFRvb2xGYWN0b3J5LmNyZWF0ZVJpZ2h0QmF0dGVyeVRvb2xOb2RlKCB0YW5kZW0gKSwgdGFuZGVtTmFtZTogJ2JhdHRlcnlUb29sTm9kZScgfSxcclxuICAgICAgeyBjcmVhdGVOb2RlOiB0YW5kZW0gPT4gY2lyY3VpdEVsZW1lbnRUb29sRmFjdG9yeS5jcmVhdGVMaWdodEJ1bGJUb29sTm9kZSggdGFuZGVtICksIHRhbmRlbU5hbWU6ICdsaWdodEJ1bGJUb29sTm9kZScgfSxcclxuICAgICAgeyBjcmVhdGVOb2RlOiB0YW5kZW0gPT4gY2lyY3VpdEVsZW1lbnRUb29sRmFjdG9yeS5jcmVhdGVSZXNpc3RvclRvb2xOb2RlKCB0YW5kZW0gKSwgdGFuZGVtTmFtZTogJ3Jlc2lzdG9yVG9vbE5vZGUnIH0sXHJcbiAgICAgIHsgY3JlYXRlTm9kZTogdGFuZGVtID0+IGNpcmN1aXRFbGVtZW50VG9vbEZhY3RvcnkuY3JlYXRlU3dpdGNoVG9vbE5vZGUoIHRhbmRlbSApLCB0YW5kZW1OYW1lOiAnc3dpdGNoVG9vbE5vZGUnIH0sXHJcblxyXG4gICAgICB7IGNyZWF0ZU5vZGU6IHRhbmRlbSA9PiBjaXJjdWl0RWxlbWVudFRvb2xGYWN0b3J5LmNyZWF0ZVdpcmVUb29sTm9kZSggdGFuZGVtICksIHRhbmRlbU5hbWU6ICd3aXJlVG9vbE5vZGUyJyB9LFxyXG4gICAgICB7IGNyZWF0ZU5vZGU6IHRhbmRlbSA9PiBjaXJjdWl0RWxlbWVudFRvb2xGYWN0b3J5LmNyZWF0ZUZ1c2VUb29sTm9kZSggdGFuZGVtICksIHRhbmRlbU5hbWU6ICdmdXNlVG9vbE5vZGUnIH0sXHJcbiAgICAgIHsgY3JlYXRlTm9kZTogdGFuZGVtID0+IGNpcmN1aXRFbGVtZW50VG9vbEZhY3RvcnkuY3JlYXRlRG9sbGFyQmlsbFRvb2xOb2RlKCB0YW5kZW0gKSwgdGFuZGVtTmFtZTogJ2RvbGxhckJpbGxUb29sTm9kZScgfSxcclxuICAgICAgeyBjcmVhdGVOb2RlOiB0YW5kZW0gPT4gY2lyY3VpdEVsZW1lbnRUb29sRmFjdG9yeS5jcmVhdGVQYXBlckNsaXBUb29sTm9kZSggdGFuZGVtICksIHRhbmRlbU5hbWU6ICdwYXBlckNsaXBUb29sTm9kZScgfSxcclxuICAgICAgeyBjcmVhdGVOb2RlOiB0YW5kZW0gPT4gY2lyY3VpdEVsZW1lbnRUb29sRmFjdG9yeS5jcmVhdGVDb2luVG9vbE5vZGUoIHRhbmRlbSApLCB0YW5kZW1OYW1lOiAnY29pblRvb2xOb2RlJyB9LFxyXG4gICAgICB7IGNyZWF0ZU5vZGU6IHRhbmRlbSA9PiBjaXJjdWl0RWxlbWVudFRvb2xGYWN0b3J5LmNyZWF0ZUVyYXNlclRvb2xOb2RlKCB0YW5kZW0gKSwgdGFuZGVtTmFtZTogJ2VyYXNlclRvb2xOb2RlJyB9LFxyXG5cclxuICAgICAgeyBjcmVhdGVOb2RlOiB0YW5kZW0gPT4gY2lyY3VpdEVsZW1lbnRUb29sRmFjdG9yeS5jcmVhdGVXaXJlVG9vbE5vZGUoIHRhbmRlbSApLCB0YW5kZW1OYW1lOiAnd2lyZVRvb2xOb2RlMycgfSxcclxuICAgICAgeyBjcmVhdGVOb2RlOiB0YW5kZW0gPT4gY2lyY3VpdEVsZW1lbnRUb29sRmFjdG9yeS5jcmVhdGVQZW5jaWxUb29sTm9kZSggdGFuZGVtICksIHRhbmRlbU5hbWU6ICdwZW5jaWxUb29sTm9kZScgfVxyXG4gICAgXTtcclxuICAgIHN1cGVyKCBtb2RlbCwgY2lyY3VpdEVsZW1lbnRUb29sTm9kZXMsIHRhbmRlbSwge1xyXG4gICAgICBibGFja0JveFN0dWR5OiB0cnVlLFxyXG4gICAgICBjaXJjdWl0RWxlbWVudFRvb2xib3hPcHRpb25zOiB7IGNhcm91c2VsU2NhbGU6IENDS0NDb25zdGFudHMuRENfQ0FST1VTRUxfU0NBTEUgfVxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuY2lyY3VpdENvbnN0cnVjdGlvbktpdEJsYWNrQm94U3R1ZHkucmVnaXN0ZXIoICdFeHBsb3JlU2NyZWVuVmlldycsIEV4cGxvcmVTY3JlZW5WaWV3ICk7XHJcbmV4cG9ydCBkZWZhdWx0IEV4cGxvcmVTY3JlZW5WaWV3OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxjQUFjLE1BQU0sdUVBQXVFO0FBQ2xHLE9BQU9DLGFBQWEsTUFBTSxpRUFBaUU7QUFDM0YsT0FBT0MseUJBQXlCLE1BQU0sa0ZBQWtGO0FBQ3hILE9BQU9DLG1DQUFtQyxNQUFNLDhDQUE4QztBQUU5RixNQUFNQyxpQkFBaUIsU0FBU0osY0FBYyxDQUFDO0VBRTdDO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VLLFdBQVdBLENBQUVDLEtBQUssRUFBRUMsTUFBTSxFQUFHO0lBQzNCLE1BQU1DLHlCQUF5QixHQUFHLElBQUlOLHlCQUF5QixDQUM3REksS0FBSyxDQUFDRyxPQUFPLEVBQ2JILEtBQUssQ0FBQ0ksa0JBQWtCLEVBQ3hCSixLQUFLLENBQUNLLGdCQUFnQixFQUN0QkMsS0FBSyxJQUFJ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