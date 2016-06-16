eXo.require("eXo.projects.Module") ;
eXo.require("eXo.projects.Product") ;

function getModule(params) {
  var module = {} ;
  
  module.version = "1.8.1" ;
  module.relativeMavenRepo =  "org/exoplatform/jcr" ;
  module.relativeSRCRepo =  "jcr/tags/1.8.1" ;
  module.name =  "jcr" ;
    
  module.services = {}
  module.services.jcr = 
    new Project("org.exoplatform.jcr", "exo.jcr.component.core", "jar", module.version).
    addDependency(new Project("org.exoplatform.jcr", "exo.jcr.component.ext", "jar", module.version)).
    addDependency(new Project("org.exoplatform.jcr", "exo.jcr.component.webdav", "jar", module.version)).
    addDependency(new Project("org.exoplatform.jcr", "exo.jcr.component.ftp", "jar", module.version)) .
    addDependency(new Project("jcr", "jcr", "jar", "1.0")).
    addDependency(new Project("concurrent", "concurrent", "jar", "1.3.4")).
    addDependency(new Project("javagroups", "jgroups-all", "jar", "2.5.0")).
    addDependency(new Project("stax", "stax-api", "jar", "1.0")).
//		addDependency(new Project("stax", "stax", "jar", "1.2.0")).
		addDependency(new Project("org.apache.ws.commons","ws-commons-util","jar","1.0.1")).
    addDependency(new Project("lucene", "lucene", "jar", "1.4.3")) ;

  module.frameworks = {}
  module.frameworks.web = 
    new Project("org.exoplatform.jcr", "exo.jcr.framework.web", "jar", module.version).  
    addDependency(new Project("org.exoplatform.ws.rest", "exo.ws.rest.core", "jar", "1.1")).
    addDependency(new Project("org.exoplatform.ws.commons", "exo.ws.commons", "jar", "1.1")).
    addDependency(new Project("commons-chain", "commons-chain", "jar", "1.0")).
    addDependency(new Project("log4j", "log4j", "jar", "1.2.8")) ;

  module.frameworks.command = new Project("org.exoplatform.jcr", "exo.jcr.framework.command", "jar", module.version).
    addDependency(new Project("commons-fileupload", "commons-fileupload", "jar", "1.0")); 
    
  return module ;
}
