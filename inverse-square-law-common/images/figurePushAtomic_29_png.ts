/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = 'data:image/png;base64,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';
export default image;