'use strict';
function FontRenderable(aString) {
    this.mFont = gEngine.DefaultResources.getDefaultFont();
    this.mOneChar = new Sprite(this.mFont + '.png');
    this.mOneChar.setShader(gEngine.DefaultResources.getFontShader());
    this.mTransform = new Transform();
    this.mText = aString;
}
FontRenderable.prototype.draw = function (vpMatrix) {
    var charWidth = this.mTransform.getScaleX() / this.mText.length;
    var charHeight = this.mTransform.getScaleY();
    var yPos = this.mTransform.getPositionY();
    var xPos = this.mTransform.getPositionX() - (charWidth / 2) + (charWidth * 0.5);

    var aChar, charInfo, xSize, ySize, xOffset, yOffset;
    var rotation = this.mTransform.getRotation();
    this.mOneChar.getTransform().setRotation(rotation);
    for (var charIndex = 0, limit = this.mText.length; charIndex < limit; charIndex++) {
        aChar = this.mText.charCodeAt(charIndex);
        charInfo = gEngine.Fonts.getCharInfo(this.mFont, aChar);

        this.mOneChar.setTextureCoordUV(charInfo.mTexCoordLeft,charInfo.mTexCoordRight,charInfo.mTexCoordBottom, charInfo.mTexCoordTop);
        xSize = charWidth * charInfo.mCharWidth;
        ySize = charHeight * charInfo.mCharHeight;
        this.mOneChar.getTransform().setScale([xSize, ySize, 1]);

        xOffset = charWidth * charInfo.mCharWidthOffset*0.5;
        yOffset = Math.cos(rotation)*charHeight * charInfo.mCharHeightOffset * 0.5;
        this.mOneChar.getTransform().setPosition([xPos - xOffset, yPos - yOffset,0]);
        this.mOneChar.draw(vpMatrix);
        xPos += charWidth * Math.cos(rotation);
        yPos += charWidth * Math.sin(rotation);
    }
};
FontRenderable.prototype.setText = function (text) {
    this.mText = text;
    this.setTextHeight(this.mTransform.getScaleY());
};
FontRenderable.prototype.setFont = function (font) {
    this.mFont = font;
    this.mOneChar.setTexture(this.mFont + ".png");
};
FontRenderable.prototype.setTextHeight = function (height) {
    var charInfo = gEngine.Fonts.getCharInfo(this.mFont, "A".charCodeAt(0));
    var w = height * charInfo.mCharAspectRatio;
    this.mTransform.setScale([w * this.mText.length, height, 1]);
};
FontRenderable.prototype.setColor = function (color) { this.mOneChar.setColor(color); };

FontRenderable.prototype.getColor = function () { return this.mOneChar.getColor(); };
FontRenderable.prototype.getTransform = function () { return this.mTransform; };
FontRenderable.prototype.getFont = function () { return this.mFont; };
FontRenderable.prototype.getText = function () { return this.mText; };