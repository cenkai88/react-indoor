const frameVertexShaderStr = `attribute vec4 a_position;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform float u_base;
void main(){
    gl_Position=u_projectionMatrix*u_viewMatrix*vec4(a_position.xy,u_base,1.0);
}`;

const frameFragmentShaderStr = `precision highp float;
uniform vec4 u_color;
uniform float u_opacity;
void main(){
    gl_FragColor=u_color*u_opacity;
}`;