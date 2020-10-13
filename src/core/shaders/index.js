//  不同类型的layer给不同类型的shader
import frameVertex from './frameVertex.glsl';
import frameFragment from './frameFragment.glsl';
import roomVertex from './roomVertex.glsl';
import roomFragment from './roomFragment.glsl';
import iconVertex from './iconVertex.glsl';
import iconFragment from './iconFragment.glsl';

export const ShaderSource = {
    frame: { vertex: frameVertex, fragment: frameFragment },
    room: { vertex: roomVertex, fragment: roomFragment },
    icon: { vertex: iconVertex, fragment: iconFragment },
};
