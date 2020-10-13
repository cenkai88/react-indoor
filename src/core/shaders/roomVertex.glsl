attribute vec4 a_position;
attribute vec4 a_normal;
uniform bool u_drawLine;
uniform float u_height;
uniform float u_base;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform vec4 u_color;
uniform mat4 u_normalMatrix;
uniform vec3 u_lightPos;
uniform vec3 u_ambientColor;
uniform vec3 u_ambientMaterial;
uniform vec3 u_diffuseColor;
uniform vec3 u_diffuseMaterial;
varying vec4 v_color;
void main(){
    bool isTopFace=mod(a_normal.z,2.0)>0.0&&a_normal.z>1.0;
    float height;
    vec4 originNormal;
    if(mod(a_normal.z,2.0)>0.0){
        height=u_height+u_base;
        if(u_drawLine){height+=0.01;}
        originNormal=vec4(a_normal.xy,a_normal.z-1.0,1.0);
    }else{
        height=u_base;
        originNormal=a_normal;
    }
    gl_Position=u_projectionMatrix*u_viewMatrix*vec4(a_position.xy,height,1.0);
    vec3 normal=normalize(vec3(u_normalMatrix*originNormal));
    vec3 lightPos=normalize(u_lightPos);
    vec3 ambientColor=u_color.rgb*u_ambientColor*u_ambientMaterial;
    float diffuseIntentsity=max(0.0,dot(lightPos,normal));
    vec3 diffuseColor=u_color.rgb*u_diffuseColor*u_diffuseMaterial*diffuseIntentsity;
    v_color=isTopFace ? u_color : vec4(ambientColor+diffuseColor,u_color.a);
}
