precision mediump float;

#define kGLSLuLightArraySize 4

struct Light {
    vec4 Position; 
    vec4 Color;
    float Near; 
    float Far; 
    float Intensity;
    bool IsOn;
};

uniform sampler2D u_texture;
uniform vec4 u_color;
uniform vec4 u_globalAmbientColor;
uniform float u_globalAmbientIntensity;
uniform Light u_lights[kGLSLuLightArraySize];

varying vec2 texCoord;


vec4 LightEffect(Light lgt) {
    vec4 result = vec4(0);
    float atten = 0.0;
    float dist = length(lgt.Position.xyz - gl_FragCoord.xyz);
    if (dist <= lgt.Far) {
        if (dist <= lgt.Near)
            atten = 1.0;
        else {
            float n = dist - lgt.Near;
            float d = lgt.Far - lgt.Near;
            atten = smoothstep(0.0, 1.0, 1.0-(n*n)/(d*d)); 
        }
    }
    result = atten * lgt.Intensity * lgt.Color;
    return result;
}

void main(void){
    vec4 textureMapColor = texture2D(u_texture, vec2(texCoord.xy));
    vec4 lgtResults = u_globalAmbientColor * u_globalAmbientIntensity;
    if (textureMapColor.a > 0.0) 
    {
        for (int i=0; i<kGLSLuLightArraySize; i++) {
            if (u_lights[i].IsOn) {
                lgtResults += LightEffect(u_lights[i]);
            }
        }
    }
    lgtResults *= textureMapColor;
    gl_FragColor = lgtResults * u_color;
}