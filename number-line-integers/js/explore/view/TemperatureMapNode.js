// Copyright 2019-2022, University of Colorado Boulder

/**
 * A node that represents the temperature scene's map image
 *
 * @author Arnab Purkayastha
 */

import { Image, Node } from '../../../../scenery/js/imports.js';
import worldTemperaturesMonthlyAveragedApr2018_jpg from '../../../images/worldTemperaturesMonthlyAveragedApr2018_jpg.js';
import worldTemperaturesMonthlyAveragedAug2018_jpg from '../../../images/worldTemperaturesMonthlyAveragedAug2018_jpg.js';
import worldTemperaturesMonthlyAveragedDec2018_jpg from '../../../images/worldTemperaturesMonthlyAveragedDec2018_jpg.js';
import worldTemperaturesMonthlyAveragedFeb2018_jpg from '../../../images/worldTemperaturesMonthlyAveragedFeb2018_jpg.js';
import worldTemperaturesMonthlyAveragedJan2018_jpg from '../../../images/worldTemperaturesMonthlyAveragedJan2018_jpg.js';
import worldTemperaturesMonthlyAveragedJul2018_jpg from '../../../images/worldTemperaturesMonthlyAveragedJul2018_jpg.js';
import worldTemperaturesMonthlyAveragedJun2018_jpg from '../../../images/worldTemperaturesMonthlyAveragedJun2018_jpg.js';
import worldTemperaturesMonthlyAveragedMar2018_jpg from '../../../images/worldTemperaturesMonthlyAveragedMar2018_jpg.js';
import worldTemperaturesMonthlyAveragedMay2018_jpg from '../../../images/worldTemperaturesMonthlyAveragedMay2018_jpg.js';
import worldTemperaturesMonthlyAveragedNov2018_jpg from '../../../images/worldTemperaturesMonthlyAveragedNov2018_jpg.js';
import worldTemperaturesMonthlyAveragedOct2018_jpg from '../../../images/worldTemperaturesMonthlyAveragedOct2018_jpg.js';
import worldTemperaturesMonthlyAveragedSep2018_jpg from '../../../images/worldTemperaturesMonthlyAveragedSep2018_jpg.js';
import numberLineIntegers from '../../numberLineIntegers.js';

// constants
const TEMPERATURE_IMAGES_MONTHS = [
  worldTemperaturesMonthlyAveragedJan2018_jpg,
  worldTemperaturesMonthlyAveragedFeb2018_jpg,
  worldTemperaturesMonthlyAveragedMar2018_jpg,
  worldTemperaturesMonthlyAveragedApr2018_jpg,
  worldTemperaturesMonthlyAveragedMay2018_jpg,
  worldTemperaturesMonthlyAveragedJun2018_jpg,
  worldTemperaturesMonthlyAveragedJul2018_jpg,
  worldTemperaturesMonthlyAveragedAug2018_jpg,
  worldTemperaturesMonthlyAveragedSep2018_jpg,
  worldTemperaturesMonthlyAveragedOct2018_jpg,
  worldTemperaturesMonthlyAveragedNov2018_jpg,
  worldTemperaturesMonthlyAveragedDec2018_jpg
];

class TemperatureMapNode extends Node {

  /**
   * @param {NumberProperty} monthProperty
   * @param {Bounds2} mapBounds
   * @public
   */
  constructor( monthProperty, mapBounds ) {
    super();

    // @private
    this.mapBounds = mapBounds;

    let lastMonth = 1;

    const images = _.map( TEMPERATURE_IMAGES_MONTHS, image => {
      const imageNode = new Image( image, { visible: false } );
      imageNode.scale(
        this.mapBounds.width / imageNode.width,
        this.mapBounds.height / imageNode.height
      );
      this.addChild( imageNode );
      return imageNode;
    } );

    monthProperty.link( month => {
      images[ lastMonth - 1 ].visible = false;
      images[ month - 1 ].visible = true;
      lastMonth = month;
    } );
  }
}

numberLineIntegers.register( 'TemperatureMapNode', TemperatureMapNode );
export default TemperatureMapNode;