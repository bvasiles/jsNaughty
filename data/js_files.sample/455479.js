joo.classLoader.prepare(/*
 * Copyright 2009 CoreMedia AG
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0 
 *
 * Unless required by applicable law or agreed to in writing, 
 * software distributed under the License is distributed on an "AS
 * IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either 
 * express or implied. See the License for the specific language 
 * governing permissions and limitations under the License.
 */

// JangarooScript runtime support. Author: Frank Wienberg

"package joo",/* {*/

"public class SystemClassLoader",function($$l,$$private){var is=joo.is,assert=joo.assert,trace=joo.trace,$$bound=joo.boundMethod,$super=$$l+'super';return[function(){joo.classLoader.init(joo.NativeClassDeclaration,Error,joo.SystemClassDeclaration);}, function()

{
  joo.classLoader = new joo.SystemClassLoader();
},

  "public static const",{ classDeclarationsByName/* : Object*//*<String,SystemClassDeclaration>*/ :function(){return( {});}},

  "public var",{ debug/* : Boolean*/ : false},

  "public function SystemClassLoader",function $SystemClassLoader() {this[$super]();    
  },

  "public function prepare",function prepare(packageDef/* : String*/, classDef/* : String*/, memberFactory/* : Function*/,
                          publicStaticMethodNames/* : Array*/, dependencies/* : Array*/)/* : SystemClassDeclaration*/ {
    var cd/* : SystemClassDeclaration*/ = this.createClassDeclaration(packageDef, classDef, memberFactory, publicStaticMethodNames, dependencies);
    joo.SystemClassLoader.classDeclarationsByName[cd.fullClassName] = cd;
    return cd;
  },

  "protected function createClassDeclaration",function createClassDeclaration(packageDef/* : String*/, classDef/* : String*/, memberFactory/* : Function*/,
                          publicStaticMethodNames/* : Array*/, dependencies/* : Array*/)/* : SystemClassDeclaration*/ {
    return new joo.SystemClassDeclaration(packageDef, classDef, memberFactory, publicStaticMethodNames).init()/*as SystemClassDeclaration*/;
  },

  "public function getClassDeclaration",function getClassDeclaration(fullClassName/* : String*/)/* : NativeClassDeclaration*/ {
    var cd/* : NativeClassDeclaration*/ = joo.SystemClassLoader.classDeclarationsByName[fullClassName];
    if (!cd) {
      var constructor_/* : Function*/ = joo.getQualifiedObject(fullClassName);
      if (constructor_) {
        if (!constructor_["$class"]) {
          // create SystemClassDeclaration for native classes:
          cd = this.createNativeClassDeclaration(fullClassName, constructor_).init();
          joo.SystemClassLoader.classDeclarationsByName[fullClassName] = cd;
        } else {
          cd = constructor_["$class"];
        }
      }
    }
    return cd;
  },

  /**
   * @param className
   * @return NativeClassDeclaration the class declaration with the given name.
   * @throws Error - ClassNotFound
   */
  "public function getRequiredClassDeclaration",function getRequiredClassDeclaration(className/* : String*/)/* : NativeClassDeclaration*/ {
    var cd/* : NativeClassDeclaration*/ = this.getClassDeclaration(className);
    if (!cd) {
      throw new Error("Class not found: "+className);
    }
    return cd;
  },

  "protected function createNativeClassDeclaration",function createNativeClassDeclaration(fullClassName/* : String*/, nativeClass/* : Function*/)/* : NativeClassDeclaration*/ {
    return new joo.NativeClassDeclaration().create(fullClassName, nativeClass);
  },

  "public function init",function init(/*... classes*/)/* :Function*/ {var classes=arguments;
    return null;
  },
];},[],["joo.SystemClassDeclaration","Error","joo.NativeClassDeclaration"]
);