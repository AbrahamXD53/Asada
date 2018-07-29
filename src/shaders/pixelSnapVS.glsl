attribute vec3 position;
attribute vec2 textureCoordinate;

varying vec2 texCoord;

uniform mat4 u_transform;
uniform mat4 u_viewTransform;
uniform vec2 u_screenSize;

void main(void) {
    gl_Position = u_viewTransform * u_transform * vec4(position, 1.0);
    vec2 hpc = u_screenSize * 0.5;
    vec2 pixelPos = floor (((gl_Position.xy / gl_Position.w) * hpc)+0.5);
    gl_Position.xy = pixelPos / hpc * gl_Position.w;
    texCoord = textureCoordinate;
}