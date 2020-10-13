precision highp float;
varying vec4 v_color;
uniform float u_opacity;
void main(){
    gl_FragColor=v_color*u_opacity;
}