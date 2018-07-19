precision mediump float;

uniform sampler2D u_texture;
uniform vec4 u_color;

varying vec2 texCoord;

void main(void){
    //gl_FragColor = texture2D(u_texture,texCoord.xy);

    vec4 c = texture2D(u_texture, texCoord.xy);
    // 
    
    // different options:
    // e.g.  tint the transparent area also
    // vec4 result = c * (1.0-uPixelColor.a) + uPixelColor * uPixelColor.a;
    
    // or: tint the textured area, and leave transparent area as defined by the texture
    vec3 r = c.rgb * (1.0-u_color.a) + u_color.rgb * u_color.a;
    vec4 result = vec4(r, c.a);
    
    // or: ignore pixel tinting ...
    // vec4 result = c;

    // or: simply multiply pixel color with texture color
    // vec4 result = c * uPixelColor;

    gl_FragColor = result;
}