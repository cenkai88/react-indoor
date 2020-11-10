precision highp float;
uniform vec4 u_color;
uniform sampler2D u_sampler;
uniform bool u_useTexture;
uniform float u_opacity;
varying vec2 v_texCoord;
void main(){
    vec4 color=u_useTexture ? texture2D(u_sampler,v_texCoord): u_color;
    gl_FragColor=color*u_opacity;
}