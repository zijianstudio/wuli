/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = 'data:image/png;base64,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';
export default image;