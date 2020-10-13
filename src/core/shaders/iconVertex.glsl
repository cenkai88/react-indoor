uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_modelMatrix;
uniform vec2 u_position;
uniform vec2 u_offset;
uniform vec2 u_resolution;
uniform float u_base;
attribute vec4 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
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
    modelMatrix=translate(modelMatrix,u_position.x,u_position.y,u_base);
    vec4 pos=u_viewMatrix*vec4(u_position.xy,u_base,1.0);
    float scaleNum=pos.z/u_resolution.y*-0.82843;
    modelMatrix=modelMatrix*scale(u_modelMatrix,scaleNum,scaleNum,scaleNum);
    modelMatrix=translate(modelMatrix,-u_position.x,-u_position.y,-u_base);
    mat4 pvm=u_projectionMatrix*u_viewMatrix*modelMatrix;
    gl_Position=pvm*vec4(a_position.xy+u_offset,a_position.z+u_base,a_position.w);
    v_texCoord=a_texCoord;
}