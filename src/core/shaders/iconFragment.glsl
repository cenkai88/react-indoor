precision highp float;
uniform sampler2D u_sampler;
uniform float u_opacity;
varying vec2 v_texCoord;
void main(){
    vec4 color=texture2D(u_sampler,v_texCoord);
    gl_FragColor=vec4(color.rgb,color.a*u_opacity);
}