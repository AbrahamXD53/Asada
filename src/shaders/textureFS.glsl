precision mediump float;

uniform sampler2D u_texture;
uniform vec4 u_color;
uniform vec4 u_globalAmbientColor;
uniform float u_globalAmbientIntensity;

varying vec2 texCoord;

void main(void){
    gl_FragColor= texture2D(u_texture, texCoord.xy)*u_color*u_globalAmbientIntensity;
}