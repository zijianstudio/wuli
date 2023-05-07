/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = 'data:image/png;base64,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';
export default image;