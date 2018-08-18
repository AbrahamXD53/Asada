precision mediump float;

uniform sampler2D u_texture;
uniform vec4 u_color;
uniform vec4 u_globalAmbientColor;
uniform float u_globalAmbientIntensity;

varying vec2 texCoord;

uniform bool u_lightOn;
uniform vec4 u_lightColor;
uniform vec4 u_lightPosition;
uniform float u_lightRadius;

void main(void){
    vec4 textureMapColor = texture2D(u_texture, vec2(texCoord.xy));
    vec4 lgtResults = u_globalAmbientColor * u_globalAmbientIntensity;
    if (u_lightOn && (textureMapColor.a > 0.0)) {
        float dist = length(u_lightPosition.xyz - gl_FragCoord.xyz);
        if (dist <= u_lightRadius)
            lgtResults.rgb += u_lightColor.rgb;
    }
    lgtResults *= textureMapColor;
    // tint the textured area, and leave transparent area as defined by the texture
    //vec3 r = vec3(lgtResults) * (1.0-u_color.a) + vec3(u_color) * u_color.a;
    //vec4 result = vec4(r, lgtResults.a);
    gl_FragColor = lgtResults * u_color;
}