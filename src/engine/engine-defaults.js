var gEngine = gEngine || {};

gEngine.DefaultResources = (function () {
	var kSimpleVS = {
		name: 'simpleVS', program: `attribute vec3 position;
	uniform mat4 u_transform;
	uniform mat4 u_viewTransform;
	void main(void) {
		gl_Position = u_viewTransform * u_transform * vec4(position, 1.0);
	}`};
	var kSimpleFS = {
		name: 'simpleFS', program: `precision mediump float;
	uniform vec4 u_color;
	uniform vec4 u_globalAmbientColor;
	uniform float u_globalAmbientIntensity;
	void main(void) {
		gl_FragColor = u_color*u_globalAmbientColor*u_globalAmbientIntensity;;
	}`};
	var kTextureVS = {
		name: 'textureVS', program: `attribute vec3 position;
	attribute vec2 textureCoordinate;
	varying vec2 texCoord;
	uniform mat4 u_transform;
	uniform mat4 u_viewTransform;
	void main(void) {
		gl_Position = u_viewTransform * u_transform * vec4(position, 1.0);
		texCoord = textureCoordinate;
	}`};
	var kTextureFS = {
		name: 'textureFS', program: `precision mediump float;
	uniform sampler2D u_texture;
	uniform vec4 u_color;
	uniform vec4 u_globalAmbientColor;
	uniform float u_globalAmbientIntensity;
	varying vec2 texCoord;
	void main(void){
		gl_FragColor= texture2D(u_texture, texCoord.xy)*u_color*u_globalAmbientIntensity;
	}`};
	var kFontFS = {
		name: 'fontFS', program: `precision mediump float;
	uniform sampler2D u_texture;
	uniform vec4 u_color;
	varying vec2 texCoord;
	void main(void){
		vec4 c = texture2D(u_texture, texCoord.xy);
		vec3 r = c.rgb * (1.0-u_color.a) + u_color.rgb * u_color.a;
		gl_FragColor = vec4(r, c.a);
	}`};
	var kPixelSnapVS = {
		name: 'pixelSnapVS', program: `attribute vec3 position;
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
	}`};
	var kLightFS = {
		name: 'lightFS', program: `precision mediump float;
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
	vec3 LightEffect(Light lgt) {
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
		return result.rgb;
	}
	void main(void){
		vec4 textureMapColor = texture2D(u_texture, vec2(texCoord));
		vec4 lgtResults = u_globalAmbientColor * u_globalAmbientIntensity;
		if (textureMapColor.a > 0.0) 
		{
			for (int i=0; i<kGLSLuLightArraySize; i++) {
				if (u_lights[i].IsOn) {
					lgtResults.rgb += LightEffect(u_lights[i]);
				}
			}
		}
		lgtResults *= textureMapColor;
		gl_FragColor = lgtResults * u_color;
	}`};
	var kDefaultFont = {name:"system-default-font",
	map:`<?xml version="1.0"?>
	<font>
	  <info face="Consolas" size="32" bold="0" italic="0" charset="" unicode="1" stretchH="100" smooth="1" aa="1" padding="0,0,0,0" spacing="1,1" outline="0"/>
	  <common lineHeight="32" base="25" scaleW="256" scaleH="256" pages="1" packed="0" alphaChnl="0" redChnl="3" greenChnl="3" blueChnl="3"/>
	  <pages>
		<page id="0" file="Consolas-32-NoKerning_0.png" />
	  </pages>
	  <chars count="193">
		<char id="0" x="16" y="49" width="3" height="1" xoffset="-1" yoffset="31" xadvance="15" page="0" chnl="15" />
		<char id="13" x="255" y="0" width="0" height="1" xoffset="0" yoffset="31" xadvance="0" page="0" chnl="15" />
		<char id="32" x="12" y="26" width="3" height="1" xoffset="-1" yoffset="31" xadvance="15" page="0" chnl="15" />
		<char id="33" x="250" y="46" width="5" height="19" xoffset="5" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="34" x="151" y="173" width="9" height="6" xoffset="3" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="35" x="113" y="109" width="15" height="17" xoffset="0" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="36" x="151" y="0" width="13" height="23" xoffset="1" yoffset="5" xadvance="15" page="0" chnl="15" />
		<char id="37" x="141" y="47" width="15" height="19" xoffset="0" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="38" x="124" y="47" width="16" height="19" xoffset="0" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="39" x="161" y="173" width="5" height="6" xoffset="5" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="40" x="8" y="0" width="9" height="25" xoffset="3" yoffset="5" xadvance="15" page="0" chnl="15" />
		<char id="41" x="18" y="0" width="9" height="25" xoffset="3" yoffset="5" xadvance="15" page="0" chnl="15" />
		<char id="42" x="243" y="154" width="11" height="11" xoffset="2" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="43" x="211" y="157" width="15" height="12" xoffset="0" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="44" x="99" y="178" width="9" height="9" xoffset="2" yoffset="21" xadvance="15" page="0" chnl="15" />
		<char id="45" x="73" y="189" width="9" height="2" xoffset="3" yoffset="17" xadvance="15" page="0" chnl="15" />
		<char id="46" x="189" y="172" width="5" height="4" xoffset="5" yoffset="21" xadvance="15" page="0" chnl="15" />
		<char id="47" x="0" y="51" width="12" height="22" xoffset="1" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="48" x="129" y="105" width="15" height="17" xoffset="0" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="49" x="107" y="128" width="13" height="17" xoffset="1" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="50" x="121" y="127" width="13" height="17" xoffset="1" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="51" x="135" y="123" width="13" height="17" xoffset="1" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="52" x="0" y="132" width="15" height="17" xoffset="0" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="53" x="111" y="146" width="12" height="17" xoffset="2" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="54" x="93" y="128" width="13" height="17" xoffset="1" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="55" x="149" y="123" width="13" height="17" xoffset="1" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="56" x="163" y="123" width="13" height="17" xoffset="1" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="57" x="191" y="123" width="13" height="17" xoffset="1" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="58" x="247" y="122" width="5" height="13" xoffset="5" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="59" x="28" y="111" width="8" height="18" xoffset="3" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="60" x="226" y="141" width="12" height="15" xoffset="1" yoffset="10" xadvance="15" page="0" chnl="15" />
		<char id="61" x="123" y="178" width="13" height="7" xoffset="1" yoffset="14" xadvance="15" page="0" chnl="15" />
		<char id="62" x="213" y="141" width="12" height="15" xoffset="2" yoffset="10" xadvance="15" page="0" chnl="15" />
		<char id="63" x="98" y="71" width="10" height="19" xoffset="3" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="64" x="28" y="0" width="16" height="24" xoffset="-1" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="65" x="209" y="105" width="15" height="17" xoffset="0" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="66" x="205" y="123" width="13" height="17" xoffset="1" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="67" x="219" y="123" width="13" height="17" xoffset="1" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="68" x="63" y="128" width="14" height="17" xoffset="1" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="69" x="173" y="141" width="11" height="17" xoffset="2" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="70" x="161" y="141" width="11" height="17" xoffset="2" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="71" x="48" y="128" width="14" height="17" xoffset="0" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="72" x="233" y="122" width="13" height="17" xoffset="1" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="73" x="149" y="141" width="11" height="17" xoffset="2" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="74" x="137" y="141" width="11" height="17" xoffset="2" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="75" x="0" y="150" width="13" height="17" xoffset="1" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="76" x="98" y="146" width="12" height="17" xoffset="2" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="77" x="145" y="105" width="15" height="17" xoffset="0" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="78" x="84" y="146" width="13" height="17" xoffset="1" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="79" x="16" y="132" width="15" height="17" xoffset="0" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="80" x="14" y="150" width="13" height="17" xoffset="1" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="81" x="208" y="0" width="16" height="22" xoffset="0" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="82" x="28" y="150" width="13" height="17" xoffset="2" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="83" x="42" y="148" width="13" height="17" xoffset="1" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="84" x="32" y="130" width="15" height="17" xoffset="0" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="85" x="56" y="146" width="13" height="17" xoffset="1" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="86" x="177" y="105" width="15" height="17" xoffset="0" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="87" x="161" y="105" width="15" height="17" xoffset="0" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="88" x="225" y="104" width="15" height="17" xoffset="0" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="89" x="43" y="110" width="17" height="17" xoffset="-1" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="90" x="70" y="146" width="13" height="17" xoffset="1" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="91" x="85" y="0" width="8" height="24" xoffset="4" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="92" x="13" y="51" width="12" height="22" xoffset="2" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="93" x="94" y="0" width="8" height="24" xoffset="3" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="94" x="109" y="178" width="13" height="8" xoffset="1" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="95" x="218" y="170" width="17" height="2" xoffset="-1" yoffset="28" xadvance="15" page="0" chnl="15" />
		<char id="96" x="201" y="171" width="8" height="3" xoffset="2" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="97" x="79" y="164" width="13" height="13" xoffset="1" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="98" x="42" y="71" width="13" height="19" xoffset="1" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="99" x="149" y="159" width="12" height="13" xoffset="1" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="100" x="56" y="71" width="13" height="19" xoffset="1" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="101" x="121" y="164" width="13" height="13" xoffset="1" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="102" x="173" y="47" width="15" height="19" xoffset="0" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="103" x="140" y="67" width="14" height="18" xoffset="1" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="104" x="70" y="71" width="13" height="19" xoffset="1" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="105" x="140" y="86" width="13" height="18" xoffset="1" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="106" x="178" y="0" width="11" height="23" xoffset="1" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="107" x="84" y="71" width="13" height="19" xoffset="2" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="108" x="236" y="46" width="13" height="19" xoffset="1" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="109" x="0" y="168" width="15" height="13" xoffset="0" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="110" x="135" y="163" width="13" height="13" xoffset="1" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="111" x="64" y="164" width="14" height="13" xoffset="1" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="112" x="210" y="86" width="13" height="18" xoffset="1" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="113" x="182" y="86" width="13" height="18" xoffset="1" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="114" x="162" y="159" width="12" height="13" xoffset="2" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="115" x="199" y="157" width="11" height="13" xoffset="2" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="116" x="78" y="128" width="14" height="17" xoffset="0" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="117" x="107" y="164" width="13" height="13" xoffset="1" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="118" x="48" y="166" width="15" height="13" xoffset="0" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="119" x="32" y="168" width="15" height="13" xoffset="0" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="120" x="16" y="168" width="15" height="13" xoffset="0" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="121" x="109" y="71" width="15" height="18" xoffset="0" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="122" x="93" y="164" width="13" height="13" xoffset="1" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="123" x="72" y="0" width="12" height="24" xoffset="1" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="124" x="0" y="0" width="3" height="27" xoffset="6" yoffset="3" xadvance="15" page="0" chnl="15" />
		<char id="125" x="59" y="0" width="12" height="24" xoffset="2" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="126" x="167" y="173" width="15" height="5" xoffset="0" yoffset="15" xadvance="15" page="0" chnl="15" />
		<char id="160" x="8" y="26" width="3" height="1" xoffset="-1" yoffset="31" xadvance="15" page="0" chnl="15" />
		<char id="161" x="37" y="111" width="5" height="18" xoffset="5" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="162" x="165" y="0" width="12" height="23" xoffset="1" yoffset="5" xadvance="15" page="0" chnl="15" />
		<char id="163" x="241" y="104" width="14" height="17" xoffset="0" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="164" x="199" y="141" width="13" height="15" xoffset="1" yoffset="9" xadvance="15" page="0" chnl="15" />
		<char id="165" x="193" y="105" width="15" height="17" xoffset="0" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="166" x="4" y="0" width="3" height="27" xoffset="6" yoffset="3" xadvance="15" page="0" chnl="15" />
		<char id="167" x="174" y="24" width="13" height="22" xoffset="1" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="168" x="137" y="159" width="11" height="3" xoffset="2" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="169" x="61" y="110" width="17" height="17" xoffset="-1" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="170" x="175" y="159" width="11" height="13" xoffset="2" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="171" x="28" y="182" width="13" height="11" xoffset="1" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="172" x="137" y="177" width="13" height="6" xoffset="1" yoffset="17" xadvance="15" page="0" chnl="15" />
		<char id="173" x="246" y="166" width="9" height="2" xoffset="3" yoffset="17" xadvance="15" page="0" chnl="15" />
		<char id="174" x="0" y="182" width="13" height="12" xoffset="1" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="175" x="236" y="170" width="9" height="2" xoffset="3" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="176" x="87" y="178" width="11" height="9" xoffset="2" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="177" x="185" y="141" width="13" height="16" xoffset="1" yoffset="9" xadvance="15" page="0" chnl="15" />
		<char id="178" x="63" y="180" width="9" height="11" xoffset="3" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="179" x="53" y="180" width="9" height="11" xoffset="3" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="180" x="210" y="171" width="7" height="3" xoffset="6" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="181" x="185" y="67" width="14" height="18" xoffset="1" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="182" x="241" y="0" width="13" height="22" xoffset="1" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="183" x="195" y="172" width="5" height="4" xoffset="5" yoffset="16" xadvance="15" page="0" chnl="15" />
		<char id="184" x="183" y="173" width="5" height="4" xoffset="5" yoffset="25" xadvance="15" page="0" chnl="15" />
		<char id="185" x="42" y="182" width="10" height="11" xoffset="2" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="186" x="187" y="158" width="11" height="13" xoffset="2" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="187" x="14" y="182" width="13" height="11" xoffset="1" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="188" x="157" y="47" width="15" height="19" xoffset="0" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="189" x="189" y="47" width="15" height="19" xoffset="0" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="190" x="205" y="46" width="15" height="19" xoffset="0" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="191" x="244" y="66" width="10" height="18" xoffset="2" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="192" x="144" y="24" width="15" height="22" xoffset="0" yoffset="3" xadvance="15" page="0" chnl="15" />
		<char id="193" x="80" y="25" width="15" height="22" xoffset="0" yoffset="3" xadvance="15" page="0" chnl="15" />
		<char id="194" x="112" y="24" width="15" height="22" xoffset="0" yoffset="3" xadvance="15" page="0" chnl="15" />
		<char id="195" x="96" y="25" width="15" height="22" xoffset="0" yoffset="3" xadvance="15" page="0" chnl="15" />
		<char id="196" x="48" y="25" width="15" height="22" xoffset="0" yoffset="3" xadvance="15" page="0" chnl="15" />
		<char id="197" x="32" y="25" width="15" height="22" xoffset="0" yoffset="3" xadvance="15" page="0" chnl="15" />
		<char id="198" x="79" y="110" width="16" height="17" xoffset="-1" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="199" x="110" y="48" width="13" height="21" xoffset="1" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="200" x="38" y="48" width="11" height="22" xoffset="2" yoffset="3" xadvance="15" page="0" chnl="15" />
		<char id="201" x="86" y="48" width="11" height="22" xoffset="2" yoffset="3" xadvance="15" page="0" chnl="15" />
		<char id="202" x="74" y="48" width="11" height="22" xoffset="2" yoffset="3" xadvance="15" page="0" chnl="15" />
		<char id="203" x="62" y="48" width="11" height="22" xoffset="2" yoffset="3" xadvance="15" page="0" chnl="15" />
		<char id="204" x="244" y="23" width="11" height="22" xoffset="2" yoffset="3" xadvance="15" page="0" chnl="15" />
		<char id="205" x="50" y="48" width="11" height="22" xoffset="2" yoffset="3" xadvance="15" page="0" chnl="15" />
		<char id="206" x="98" y="48" width="11" height="22" xoffset="2" yoffset="3" xadvance="15" page="0" chnl="15" />
		<char id="207" x="26" y="49" width="11" height="22" xoffset="2" yoffset="3" xadvance="15" page="0" chnl="15" />
		<char id="208" x="96" y="110" width="16" height="17" xoffset="-1" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="209" x="160" y="24" width="13" height="22" xoffset="1" yoffset="3" xadvance="15" page="0" chnl="15" />
		<char id="210" x="128" y="24" width="15" height="22" xoffset="0" yoffset="3" xadvance="15" page="0" chnl="15" />
		<char id="211" x="64" y="25" width="15" height="22" xoffset="0" yoffset="3" xadvance="15" page="0" chnl="15" />
		<char id="212" x="16" y="26" width="15" height="22" xoffset="0" yoffset="3" xadvance="15" page="0" chnl="15" />
		<char id="213" x="0" y="28" width="15" height="22" xoffset="0" yoffset="3" xadvance="15" page="0" chnl="15" />
		<char id="214" x="225" y="0" width="15" height="22" xoffset="0" yoffset="3" xadvance="15" page="0" chnl="15" />
		<char id="215" x="73" y="178" width="13" height="10" xoffset="1" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="216" x="119" y="0" width="15" height="23" xoffset="0" yoffset="5" xadvance="15" page="0" chnl="15" />
		<char id="217" x="216" y="23" width="13" height="22" xoffset="1" yoffset="3" xadvance="15" page="0" chnl="15" />
		<char id="218" x="202" y="23" width="13" height="22" xoffset="1" yoffset="3" xadvance="15" page="0" chnl="15" />
		<char id="219" x="230" y="23" width="13" height="22" xoffset="1" yoffset="3" xadvance="15" page="0" chnl="15" />
		<char id="220" x="188" y="24" width="13" height="22" xoffset="1" yoffset="3" xadvance="15" page="0" chnl="15" />
		<char id="221" x="190" y="0" width="17" height="22" xoffset="-1" yoffset="3" xadvance="15" page="0" chnl="15" />
		<char id="222" x="177" y="123" width="13" height="17" xoffset="1" yoffset="8" xadvance="15" page="0" chnl="15" />
		<char id="223" x="28" y="72" width="13" height="19" xoffset="1" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="224" x="196" y="86" width="13" height="18" xoffset="1" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="225" x="168" y="86" width="13" height="18" xoffset="1" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="226" x="224" y="85" width="13" height="18" xoffset="1" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="227" x="238" y="85" width="13" height="18" xoffset="1" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="228" x="0" y="113" width="13" height="18" xoffset="1" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="229" x="0" y="74" width="13" height="19" xoffset="1" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="230" x="239" y="140" width="15" height="13" xoffset="0" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="231" x="124" y="145" width="12" height="17" xoffset="1" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="232" x="14" y="113" width="13" height="18" xoffset="1" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="233" x="56" y="91" width="13" height="18" xoffset="1" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="234" x="230" y="66" width="13" height="18" xoffset="1" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="235" x="0" y="94" width="13" height="18" xoffset="1" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="236" x="14" y="94" width="13" height="18" xoffset="1" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="237" x="28" y="92" width="13" height="18" xoffset="1" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="238" x="42" y="91" width="13" height="18" xoffset="1" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="239" x="154" y="86" width="13" height="18" xoffset="1" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="240" x="14" y="74" width="13" height="19" xoffset="1" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="241" x="70" y="91" width="13" height="18" xoffset="1" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="242" x="170" y="67" width="14" height="18" xoffset="1" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="243" x="155" y="67" width="14" height="18" xoffset="1" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="244" x="125" y="67" width="14" height="18" xoffset="1" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="245" x="215" y="66" width="14" height="18" xoffset="1" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="246" x="200" y="67" width="14" height="18" xoffset="1" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="247" x="227" y="157" width="15" height="12" xoffset="0" yoffset="12" xadvance="15" page="0" chnl="15" />
		<char id="248" x="221" y="46" width="14" height="19" xoffset="1" yoffset="9" xadvance="15" page="0" chnl="15" />
		<char id="249" x="84" y="91" width="13" height="18" xoffset="1" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="250" x="98" y="91" width="13" height="18" xoffset="1" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="251" x="112" y="90" width="13" height="18" xoffset="1" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="252" x="126" y="86" width="13" height="18" xoffset="1" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="253" x="103" y="0" width="15" height="23" xoffset="0" yoffset="7" xadvance="15" page="0" chnl="15" />
		<char id="254" x="45" y="0" width="13" height="24" xoffset="1" yoffset="6" xadvance="15" page="0" chnl="15" />
		<char id="255" x="135" y="0" width="15" height="23" xoffset="0" yoffset="7" xadvance="15" page="0" chnl="15" />
	  </chars>
	</font>`,
	data:"data:image/png;base64,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"};

	var mGlobalAmbientColor = [0.1, 0.1, 0.1, 1];
	var mGlobalAmbientIntensity = 1;

	var mTextureShader = null;
	var mColorShader = null;
	var mSpriteShader = null;
	var mFontShader = null;
	var mLightShader = null;

	var getColorShader = function () { return mColorShader; };
	var getTextureShader = function () { return mTextureShader; };
	var getSpriteShader = function () { return mSpriteShader; };
	var getFontShader = function () { return mFontShader; };
	var getLightShader = function () { return mLightShader; };
	var getGlobalAmbientColor = function () { return mGlobalAmbientColor; };
	var getGlobalAmbientIntensity = function () { return mGlobalAmbientIntensity; };
	var getDefaultFont = function () { return kDefaultFont.name; };

	var setGlobalAmbientIntensity = function (v) { mGlobalAmbientIntensity = v; };
	var setGlobalAmbientColor = function (v) { mGlobalAmbientColor = [v[0], v[1], v[2], v[3]]; };

	var createShaders = function (callbackFunction) {
		mColorShader = new SimpleShader(kSimpleVS.name, kSimpleFS.name);
		mTextureShader = new TextureShader(kTextureVS.name, kTextureFS.name);
		mSpriteShader = new SpriteShader(kPixelSnapVS.name, kTextureFS.name);
		mFontShader = new SpriteShader(kTextureVS.name, kFontFS.name);
		mLightShader = new LightShader(kPixelSnapVS.name, kLightFS.name);
		callbackFunction();
	};

	var initialize = function (callbackFunction) {

		gEngine.ResourceMap.preload(kSimpleVS.name, kSimpleVS.program);
		gEngine.ResourceMap.preload(kSimpleFS.name, kSimpleFS.program);
		gEngine.ResourceMap.preload(kFontFS.name, kFontFS.program);
		gEngine.ResourceMap.preload(kPixelSnapVS.name, kPixelSnapVS.program);
		gEngine.ResourceMap.preload(kTextureFS.name, kTextureFS.program);
		gEngine.ResourceMap.preload(kTextureVS.name, kTextureVS.program);
		gEngine.ResourceMap.preload(kLightFS.name, kLightFS.program);

		gEngine.Fonts.preloadFont(kDefaultFont.name,kDefaultFont.data,kDefaultFont.map);

		gEngine.ResourceMap.setLoadCompleteCallback(function () {
			createShaders(callbackFunction);
		});
	};
	var cleanUp = function () {
		mColorShader.cleanUp();
		mTextureShader.cleanUp();
		mSpriteShader.cleanUp();
		mFontShader.cleanUp();
		mLightShader.cleanUp();

		gEngine.TextFileLoader.unloadTextFile(kSimpleVS);
		gEngine.TextFileLoader.unloadTextFile(kSimpleFS);

		gEngine.TextFileLoader.unloadTextFile(kTextureVS);
		gEngine.TextFileLoader.unloadTextFile(kTextureFS);
		gEngine.TextFileLoader.unloadTextFile(kPixelSnapVS);
		gEngine.TextFileLoader.unloadTextFile(kLightFS);

		gEngine.Fonts.unloadFont(kDefaultFont.name);
	};
	var mPublic = {
		initialize: initialize,
		getColorShader: getColorShader,
		getTextureShader: getTextureShader,
		getSpriteShader: getSpriteShader,
		getDefaultFont: getDefaultFont,
		getFontShader: getFontShader,
		cleanUp: cleanUp,
		getGlobalAmbientColor: getGlobalAmbientColor,
		setGlobalAmbientColor: setGlobalAmbientColor,
		getGlobalAmbientIntensity: getGlobalAmbientIntensity,
		setGlobalAmbientIntensity: setGlobalAmbientIntensity,
		getLightShader: getLightShader
	};
	return mPublic;
}());