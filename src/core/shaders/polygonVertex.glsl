attribute vec4 a_position;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
void main(){
    gl_Position=u_projectionMatrix*u_viewMatrix*vec4(a_position.xy,0.0,1.0);
}