attribute vec4 a_position;
attribute vec2 a_normal;
attribute vec2 a_texCoord;
attribute vec3 a_deviation;
uniform float u_lineWidth;
uniform float u_onePixelToWorld;
uniform vec2 u_imgSize;
uniform float u_base;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
varying vec2 v_texCoord;
void main(){
    float halfWidth=u_lineWidth/2.0;
    vec2 normal=a_normal*halfWidth*u_onePixelToWorld;
    vec2 deviation=a_deviation.xy*halfWidth*u_onePixelToWorld;
    if(a_deviation.z!=0.0){
        float num=length(deviation);
        if(num>=a_deviation.z){deviation*=0.0;}
    }
    vec2 texCoord=a_texCoord.xy;
    if(a_texCoord.x!=0.0){
        float lineNum=a_texCoord.x/u_onePixelToWorld/u_imgSize.y;
        float x=lineNum*(u_imgSize.y/u_imgSize.x)*(u_imgSize.y/u_lineWidth/2.0);
        texCoord=vec2(x,a_texCoord.y);
    }
    v_texCoord=texCoord;
    vec4 position=vec4(a_position.xy+deviation+normal,u_base,1.0);
    gl_Position=u_projectionMatrix*u_viewMatrix*position;
}