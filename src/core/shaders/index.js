//  不同类型的layer给不同类型的shader
import fillVertex from './fillVertex.glsl';
import fillFragment from './fillFragment.glsl';

export const ShaderSource = {
    fill: { vertex: fillVertex, fragment: fillFragment },
};
