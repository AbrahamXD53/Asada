attribute vec3 position;
uniform mat4 u_transform;
uniform mat4 u_viewTransform;
void main(void) {
    gl_Position = u_viewTransform * u_transform * vec4(position, 1.0);
}