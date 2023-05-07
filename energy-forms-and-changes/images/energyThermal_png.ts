/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = 'data:image/png;base64,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';
export default image;