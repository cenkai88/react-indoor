attribute vec2 a_normal;
uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;
uniform vec2 u_position;
uniform vec2 u_resolution;
uniform float u_radius;
varying vec4 v_color;
mat4 translate(mat4 matrix,float x,float y,float z){
    matrix[3].x+=matrix[0].x*x+matrix[1].x*y+matrix[2].x*z;
    matrix[3].y+=matrix[0].y*x+matrix[1].y*y+matrix[2].y*z;
    matrix[3].z+=matrix[0].z*x+matrix[1].z*y+matrix[2].z*z;
    matrix[3].w+=matrix[0].w*x+matrix[1].w*y+matrix[2].w*z;
    return matrix;
}
mat4 scale(mat4 matrix,float x,float y,float z){
    matrix[0].x*=x;
    matrix[1].x*=y;
    matrix[2].x*=z;
    matrix[0].y*=x;
    matrix[1].y*=y;
    matrix[2].y*=z;
    matrix[0].z*=x;
    matrix[1].z*=y;
    matrix[2].z*=z;
    matrix[0].w*=x;
    matrix[1].w*=y;
    matrix[2].w*=z;
    return matrix;
}
void main(){
    mat4 modelMatrix=mat4(1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0);
    modelMatrix=translate(modelMatrix,u_position.x,u_position.y,0.0);
    vec4 pos=u_viewMatrix*vec4(u_position.xy,0.0,1.0);
    float scaleNum=pos.z/u_resolution.y*-0.82843*u_radius;
    modelMatrix=scale(modelMatrix,scaleNum,scaleNum,scaleNum);
    modelMatrix=translate(modelMatrix,-u_position.x,-u_position.y,0.0);
    mat4 pvm=u_projectionMatrix*u_viewMatrix*modelMatrix;
    vec4 position=vec4(u_position+a_normal,0.0,1.0);
    gl_Position=pvm*position;v_color=vec4(0.0,0.0,0.0,0.0);
    if(a_normal.x==0.0&&a_normal.y==0.0){
        v_color=vec4(0.0,0.0,0.0,1.0);
    }
    gl_PointSize=1.0;
}