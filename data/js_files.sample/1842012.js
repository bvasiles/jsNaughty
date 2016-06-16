/**
 * Sandy.ShaderAtlas
 * 地图集类
 */

(function (win, undefined) {

    var gl = Sandy.gl;

    var ShaderAtlas = Sandy.Class(function(){
        this.shaders = {};
        this.programs = {};
        this.shaderCount = 0;
    }).methods({
        compileShaderSource : function(name, src, type, meta){
            var isrc;
            
            var ci = meta.common || "";
            if(meta.includes && meta.includes.length > 0) {
                for(var i = 0; i < meta.includes.length; i++) {

                    ci += Sandy.shaderSource[meta.includes[i]];
                }
            }
            
            if (type == Sandy.gl.VERTEX_SHADER) {
                var vi = "";
                if(meta.vertexIncludes && meta.vertexIncludes.length > 0) {
                    for(var i = 0; i < meta.vertexIncludes.length; i++) {
                        vi += Sandy.shaderSource[meta.vertexIncludes[i]];
                    }
                }
                isrc = ci + vi + src;
            } else {
                var fi = "";
                if(meta.fragmentIncludes && meta.fragmentIncludes.length > 0) {
                    for(var i = 0; i < meta.fragmentIncludes.length; i++) {

                        fi += Sandy.shaderSource[meta.fragmentIncludes[i]];
                    }
                }
                isrc = ci + fi + src;
            }	
            
            var shader = Sandy.gl.createShader(type);
            Sandy.gl.shaderSource(shader, isrc);
            Sandy.gl.compileShader(shader);
         
            if (!Sandy.gl.getShaderParameter(shader, Sandy.gl.COMPILE_STATUS)) {
                console.log("ERROR. Shader compile error: " + Sandy.gl.getShaderInfoLog(shader));
            }
            
            this.programs[name] = shader;
        },

        linkShader : function(renderer){
            var name = renderer.name;
            
            var vertName = name + "Vert";
            var fragName = name + "Frag";
            
            var vertexShader = this.programs[vertName];
            var fragmentShader = this.programs[fragName];
            
            var program = Sandy.gl.createProgram();
            Sandy.gl.attachShader(program, vertexShader);
            Sandy.gl.attachShader(program, fragmentShader);
            Sandy.gl.linkProgram(program);
         
            if (!Sandy.gl.getProgramParameter(program, Sandy.gl.LINK_STATUS)) {
                console.log("Error linking program " + name);
            }
            
            Sandy.gl.useProgram(program);
            
            var tid = 0;
            program.uniforms = {};
            var numUni = Sandy.gl.getProgramParameter(program, Sandy.gl.ACTIVE_UNIFORMS);
            for(var i = 0; i < numUni; i++) {
                var acUni = Sandy.gl.getActiveUniform(program, i);
                program.uniforms[acUni.name] = acUni;
                program.uniforms[acUni.name].location = Sandy.gl.getUniformLocation(program, acUni.name);
                if (Sandy.shaderUtil.isTexture(acUni.type)) {
                    program.uniforms[acUni.name].texid = tid;
                    tid++;
                }
            }
            
            program.attributes = {};
            var numAttr = Sandy.gl.getProgramParameter(program, Sandy.gl.ACTIVE_ATTRIBUTES);
            for(var i = 0; i < numAttr; i++) {
                var acAttr = Sandy.gl.getActiveAttrib(program, i);
                program.attributes[acAttr.name] = Sandy.gl.getAttribLocation(program, acAttr.name);
                Sandy.gl.enableVertexAttribArray(program.attributes[acAttr.name]);
            }

            this.shaderCount++;
            this.shaders[name] = program;
        },

        getShader : function (r) {
            if(!this.shaders[r.name]) {
                this.compileShaderSource(r.name + "Vert", r.vertSource(), Sandy.gl.VERTEX_SHADER, r.metaData);
                this.compileShaderSource(r.name + "Frag", r.fragSource(), Sandy.gl.FRAGMENT_SHADER, r.metaData);
                this.linkShader(r);
            }
            
            return this.shaders[r.name];
        }    
    
    });
    
    Sandy.extend({ ShaderAtlas : ShaderAtlas });

})(window);