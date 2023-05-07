/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = 'data:image/png;base64,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';
export default image;