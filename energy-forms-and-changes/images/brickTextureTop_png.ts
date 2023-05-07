/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = 'data:image/png;base64,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';
export default image;