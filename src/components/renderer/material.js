function Material(){
    this.mKa = [0.0, 0.0, 0.0, 0.0];
    this.mKs = [0.0, 0.0, 0.0, 0.0];
    this.mKd = [1.0, 1.0, 1.0, 1.0];
    this.mShininess = 10;
}

Material.prototype.setAmbient = function(a) { this.mKa = JSON.parse(JSON.stringify(a)); };
Material.prototype.setSpecular = function(s) { this.mKs = JSON.parse(JSON.stringify(s)); };
Material.prototype.setDiffuse = function(d) { this.mKd = JSON.parse(JSON.stringify(d)); };
Material.prototype.setShininess = function(s) { this.mShininess= s; };
Material.prototype.getAmbient = function() { return this.mKa; };
Material.prototype.getDiffuse = function() { return this.mKd; };
Material.prototype.getSpecular = function() { return this.mKs; };
Material.prototype.getShininess = function() { return this.mShininess; };

function ShaderMaterial(shader){
    this.mGl = gEngine.Core.getGL();
    this.mKaRef = this.mGl.getUniformLocation(shader, "u_material.Ka");
    this.mKdRef = this.mGl.getUniformLocation(shader, "u_material.Kd");
    this.mKsRef = this.mGl.getUniformLocation(shader, "u_material.Ks");
    this.mShineRef = this.mGl.getUniformLocation(shader, "u_material.Shininess");
}
ShaderMaterial.prototype.loadToShader = function (aMaterial) {
    this.mGl.uniform4fv(this.mKaRef, aMaterial.getAmbient());
    this.mGl.uniform4fv(this.mKdRef, aMaterial.getDiffuse());
    this.mGl.uniform4fv(this.mKsRef, aMaterial.getSpecular());
    this.mGl.uniform1f(this.mShineRef, aMaterial.getShininess());
};