precision highp float;
uniform vec2 u_resolution;
uniform float u_opacity;
uniform sampler2D u_sampler;
vec3 getColorByAlpha(float alpha){
    vec3 color=vec3(0.0,0.0,alpha);
    if(alpha>0.85){
        return vec3(1.0,1.0-(alpha-0.85)/0.15,0.0);
    } else if(alpha>0.55) {
        return vec3((alpha-0.55)/0.3,1.0,0.0);
    } else if(alpha>0.25) {
        return vec3(0.0,(alpha-0.25)/0.3,1.0-(alpha-0.25)/0.3);
    } else if(alpha>0.0) {
        return vec3(0.0,0.0,1.0);
    }
    return color;
}
void main(){
    vec2 texCoord=gl_FragCoord.xy/u_resolution;
    vec4 color=texture2D(u_sampler,texCoord);
    gl_FragColor=vec4(getColorByAlpha(color.a),color.a)*u_opacity;
}