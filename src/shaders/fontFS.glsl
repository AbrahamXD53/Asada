precision mediump float;
uniform sampler2D u_texture;
uniform vec4 u_color;
varying vec2 texCoord;
void main(void){
    vec4 c = texture2D(u_texture, texCoord.xy);
    vec3 r = c.rgb * (1.0-u_color.a) + u_color.rgb * u_color.a;
    gl_FragColor = vec4(r, c.a);
}