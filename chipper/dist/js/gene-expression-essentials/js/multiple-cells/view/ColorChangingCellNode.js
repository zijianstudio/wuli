// Copyright 2015-2022, University of Colorado Boulder

/**
 * Node that represents a cell (as in a biological organism) that changes color as the level of protein within the cell
 * changes. The color change is meant to represent a cell that is expressing a fluorescent protein, something like
 * Green Fluorescent Protein, or GFP.
 *
 * @author John Blanco
 * @author Mohamed Safi
 * @author Aadish Gupta
 */

import Utils from '../../../../dot/js/Utils.js';
import { Color, Node, Path } from '../../../../scenery/js/imports.js';
import geneExpressionEssentials from '../../geneExpressionEssentials.js';
import Cell from '../model/Cell.js';

// constants
const NOMINAL_FILL_COLOR = new Color(30, 30, 40); // Blue Gray
const FLORESCENT_FILL_COLOR = new Color(200, 255, 58);
const LINE_WIDTH = 2;
const STROKE_COLOR = Color.WHITE;
class ColorChangingCellNode extends Node {
  /**
   * @param {Cell} cell
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor(cell, modelViewTransform) {
    super();
    const cellBody = new Path(modelViewTransform.modelToViewShape(cell.getShape()), {
      fill: NOMINAL_FILL_COLOR,
      stroke: STROKE_COLOR,
      lineWidth: LINE_WIDTH,
      lineJoin: 'round',
      boundsMethod: 'unstroked',
      center: modelViewTransform.modelToViewXY(cell.positionX, cell.positionY)
    });
    cell.proteinCount.lazyLink(proteinCount => {
      const florescenceAmount = Utils.clamp((proteinCount - Cell.ProteinLevelWhereColorChangeStarts) / (Cell.ProteinLevelWhereColorChangeCompletes - Cell.ProteinLevelWhereColorChangeStarts), 0, 1.0);
      cellBody.fill = Color.interpolateRGBA(NOMINAL_FILL_COLOR, FLORESCENT_FILL_COLOR, florescenceAmount);
    });
    this.addChild(cellBody);
  }
}

// statics
ColorChangingCellNode.NominalFillColor = NOMINAL_FILL_COLOR;
ColorChangingCellNode.FlorescentFillColor = FLORESCENT_FILL_COLOR;
geneExpressionEssentials.register('ColorChangingCellNode', ColorChangingCellNode);
export default ColorChangingCellNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIkNvbG9yIiwiTm9kZSIsIlBhdGgiLCJnZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMiLCJDZWxsIiwiTk9NSU5BTF9GSUxMX0NPTE9SIiwiRkxPUkVTQ0VOVF9GSUxMX0NPTE9SIiwiTElORV9XSURUSCIsIlNUUk9LRV9DT0xPUiIsIldISVRFIiwiQ29sb3JDaGFuZ2luZ0NlbGxOb2RlIiwiY29uc3RydWN0b3IiLCJjZWxsIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiY2VsbEJvZHkiLCJtb2RlbFRvVmlld1NoYXBlIiwiZ2V0U2hhcGUiLCJmaWxsIiwic3Ryb2tlIiwibGluZVdpZHRoIiwibGluZUpvaW4iLCJib3VuZHNNZXRob2QiLCJjZW50ZXIiLCJtb2RlbFRvVmlld1hZIiwicG9zaXRpb25YIiwicG9zaXRpb25ZIiwicHJvdGVpbkNvdW50IiwibGF6eUxpbmsiLCJmbG9yZXNjZW5jZUFtb3VudCIsImNsYW1wIiwiUHJvdGVpbkxldmVsV2hlcmVDb2xvckNoYW5nZVN0YXJ0cyIsIlByb3RlaW5MZXZlbFdoZXJlQ29sb3JDaGFuZ2VDb21wbGV0ZXMiLCJpbnRlcnBvbGF0ZVJHQkEiLCJhZGRDaGlsZCIsIk5vbWluYWxGaWxsQ29sb3IiLCJGbG9yZXNjZW50RmlsbENvbG9yIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDb2xvckNoYW5naW5nQ2VsbE5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTm9kZSB0aGF0IHJlcHJlc2VudHMgYSBjZWxsIChhcyBpbiBhIGJpb2xvZ2ljYWwgb3JnYW5pc20pIHRoYXQgY2hhbmdlcyBjb2xvciBhcyB0aGUgbGV2ZWwgb2YgcHJvdGVpbiB3aXRoaW4gdGhlIGNlbGxcclxuICogY2hhbmdlcy4gVGhlIGNvbG9yIGNoYW5nZSBpcyBtZWFudCB0byByZXByZXNlbnQgYSBjZWxsIHRoYXQgaXMgZXhwcmVzc2luZyBhIGZsdW9yZXNjZW50IHByb3RlaW4sIHNvbWV0aGluZyBsaWtlXHJcbiAqIEdyZWVuIEZsdW9yZXNjZW50IFByb3RlaW4sIG9yIEdGUC5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIE1vaGFtZWQgU2FmaVxyXG4gKiBAYXV0aG9yIEFhZGlzaCBHdXB0YVxyXG4gKi9cclxuXHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgeyBDb2xvciwgTm9kZSwgUGF0aCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBnZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMgZnJvbSAnLi4vLi4vZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzLmpzJztcclxuaW1wb3J0IENlbGwgZnJvbSAnLi4vbW9kZWwvQ2VsbC5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTk9NSU5BTF9GSUxMX0NPTE9SID0gbmV3IENvbG9yKCAzMCwgMzAsIDQwICk7IC8vIEJsdWUgR3JheVxyXG5jb25zdCBGTE9SRVNDRU5UX0ZJTExfQ09MT1IgPSBuZXcgQ29sb3IoIDIwMCwgMjU1LCA1OCApO1xyXG5jb25zdCBMSU5FX1dJRFRIID0gMjtcclxuY29uc3QgU1RST0tFX0NPTE9SID0gQ29sb3IuV0hJVEU7XHJcblxyXG5jbGFzcyBDb2xvckNoYW5naW5nQ2VsbE5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtDZWxsfSBjZWxsXHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggY2VsbCwgbW9kZWxWaWV3VHJhbnNmb3JtICkge1xyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICBjb25zdCBjZWxsQm9keSA9IG5ldyBQYXRoKCBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdTaGFwZSggY2VsbC5nZXRTaGFwZSgpICksIHtcclxuICAgICAgZmlsbDogTk9NSU5BTF9GSUxMX0NPTE9SLFxyXG4gICAgICBzdHJva2U6IFNUUk9LRV9DT0xPUixcclxuICAgICAgbGluZVdpZHRoOiBMSU5FX1dJRFRILFxyXG4gICAgICBsaW5lSm9pbjogJ3JvdW5kJyxcclxuICAgICAgYm91bmRzTWV0aG9kOiAndW5zdHJva2VkJyxcclxuICAgICAgY2VudGVyOiBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYWSggY2VsbC5wb3NpdGlvblgsIGNlbGwucG9zaXRpb25ZIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjZWxsLnByb3RlaW5Db3VudC5sYXp5TGluayggcHJvdGVpbkNvdW50ID0+IHtcclxuICAgICAgY29uc3QgZmxvcmVzY2VuY2VBbW91bnQgPSBVdGlscy5jbGFtcCggKCBwcm90ZWluQ291bnQgLSBDZWxsLlByb3RlaW5MZXZlbFdoZXJlQ29sb3JDaGFuZ2VTdGFydHMgKSAvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggQ2VsbC5Qcm90ZWluTGV2ZWxXaGVyZUNvbG9yQ2hhbmdlQ29tcGxldGVzIC0gQ2VsbC5Qcm90ZWluTGV2ZWxXaGVyZUNvbG9yQ2hhbmdlU3RhcnRzICksIDAsIDEuMCApO1xyXG4gICAgICBjZWxsQm9keS5maWxsID0gQ29sb3IuaW50ZXJwb2xhdGVSR0JBKCBOT01JTkFMX0ZJTExfQ09MT1IsIEZMT1JFU0NFTlRfRklMTF9DT0xPUiwgZmxvcmVzY2VuY2VBbW91bnQgKTtcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGNlbGxCb2R5ICk7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuLy8gc3RhdGljc1xyXG5Db2xvckNoYW5naW5nQ2VsbE5vZGUuTm9taW5hbEZpbGxDb2xvciA9IE5PTUlOQUxfRklMTF9DT0xPUjtcclxuQ29sb3JDaGFuZ2luZ0NlbGxOb2RlLkZsb3Jlc2NlbnRGaWxsQ29sb3IgPSBGTE9SRVNDRU5UX0ZJTExfQ09MT1I7XHJcblxyXG5nZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMucmVnaXN0ZXIoICdDb2xvckNoYW5naW5nQ2VsbE5vZGUnLCBDb2xvckNoYW5naW5nQ2VsbE5vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IENvbG9yQ2hhbmdpbmdDZWxsTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLFNBQVNDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3JFLE9BQU9DLHdCQUF3QixNQUFNLG1DQUFtQztBQUN4RSxPQUFPQyxJQUFJLE1BQU0sa0JBQWtCOztBQUVuQztBQUNBLE1BQU1DLGtCQUFrQixHQUFHLElBQUlMLEtBQUssQ0FBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUcsQ0FBQyxDQUFDLENBQUM7QUFDcEQsTUFBTU0scUJBQXFCLEdBQUcsSUFBSU4sS0FBSyxDQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRyxDQUFDO0FBQ3ZELE1BQU1PLFVBQVUsR0FBRyxDQUFDO0FBQ3BCLE1BQU1DLFlBQVksR0FBR1IsS0FBSyxDQUFDUyxLQUFLO0FBRWhDLE1BQU1DLHFCQUFxQixTQUFTVCxJQUFJLENBQUM7RUFFdkM7QUFDRjtBQUNBO0FBQ0E7RUFDRVUsV0FBV0EsQ0FBRUMsSUFBSSxFQUFFQyxrQkFBa0IsRUFBRztJQUN0QyxLQUFLLENBQUMsQ0FBQztJQUVQLE1BQU1DLFFBQVEsR0FBRyxJQUFJWixJQUFJLENBQUVXLGtCQUFrQixDQUFDRSxnQkFBZ0IsQ0FBRUgsSUFBSSxDQUFDSSxRQUFRLENBQUMsQ0FBRSxDQUFDLEVBQUU7TUFDakZDLElBQUksRUFBRVosa0JBQWtCO01BQ3hCYSxNQUFNLEVBQUVWLFlBQVk7TUFDcEJXLFNBQVMsRUFBRVosVUFBVTtNQUNyQmEsUUFBUSxFQUFFLE9BQU87TUFDakJDLFlBQVksRUFBRSxXQUFXO01BQ3pCQyxNQUFNLEVBQUVULGtCQUFrQixDQUFDVSxhQUFhLENBQUVYLElBQUksQ0FBQ1ksU0FBUyxFQUFFWixJQUFJLENBQUNhLFNBQVU7SUFDM0UsQ0FBRSxDQUFDO0lBRUhiLElBQUksQ0FBQ2MsWUFBWSxDQUFDQyxRQUFRLENBQUVELFlBQVksSUFBSTtNQUMxQyxNQUFNRSxpQkFBaUIsR0FBRzdCLEtBQUssQ0FBQzhCLEtBQUssQ0FBRSxDQUFFSCxZQUFZLEdBQUd0QixJQUFJLENBQUMwQixrQ0FBa0MsS0FDdEQxQixJQUFJLENBQUMyQixxQ0FBcUMsR0FBRzNCLElBQUksQ0FBQzBCLGtDQUFrQyxDQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUksQ0FBQztNQUN6SWhCLFFBQVEsQ0FBQ0csSUFBSSxHQUFHakIsS0FBSyxDQUFDZ0MsZUFBZSxDQUFFM0Isa0JBQWtCLEVBQUVDLHFCQUFxQixFQUFFc0IsaUJBQWtCLENBQUM7SUFDdkcsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDSyxRQUFRLENBQUVuQixRQUFTLENBQUM7RUFDM0I7QUFDRjs7QUFHQTtBQUNBSixxQkFBcUIsQ0FBQ3dCLGdCQUFnQixHQUFHN0Isa0JBQWtCO0FBQzNESyxxQkFBcUIsQ0FBQ3lCLG1CQUFtQixHQUFHN0IscUJBQXFCO0FBRWpFSCx3QkFBd0IsQ0FBQ2lDLFFBQVEsQ0FBRSx1QkFBdUIsRUFBRTFCLHFCQUFzQixDQUFDO0FBRW5GLGVBQWVBLHFCQUFxQiJ9