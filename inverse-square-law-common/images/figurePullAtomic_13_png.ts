/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = 'data:image/png;base64,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';
export default image;