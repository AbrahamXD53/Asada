attribute vec3 position;
attribute vec2 textureCoordinate;
varying vec2 texCoord;
uniform mat4 u_transform;
uniform mat4 u_viewTransform;
void main(void) {
    gl_Position = u_viewTransform * u_transform * vec4(position, 1.0);
    texCoord = textureCoordinate;
}