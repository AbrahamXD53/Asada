let ComponetType = Object.freeze({
    transform: 'Transform',
    renderer: 'Renderer',
    physics: 'Physics'
});
function Component() {
    this.mParent = null;
    this.mActive = true;
}
Component.prototype.setParent = function (parent) { this.mParent = parent; };
Component.prototype.getParent = function () { return this.getParent; };
Component.prototype.setActive = function (a) { this.mActive = a; };
Component.prototype.getActibe = function () { return this.mActive; };