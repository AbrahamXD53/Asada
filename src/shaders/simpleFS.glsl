precision mediump float;

uniform vec4 u_color;
uniform vec4 u_globalAmbientColor;
uniform float u_globalAmbientIntensity;

void main(void) {
    gl_FragColor = u_color*u_globalAmbientColor*u_globalAmbientIntensity;;
}