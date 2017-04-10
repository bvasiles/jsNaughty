//...........................................................................//
// this module does the window handling......................................//

// Author: Ulrich Roegelein

//...........................................................................//
// the scene manager manages the scene instances in a component context......//

VBI.Windows = function()
{
   var windows = {};
   windows.vbiclass = "Windows";
   windows.m_WindowArray = [];

   // loading from the project file..........................................//

   windows.find = function( name )
   {
      // find the window by id...............................................//
      for( var nJ = 0; nJ < windows.m_WindowArray.length; ++nJ )
         if( windows.m_WindowArray[ nJ ].m_ID == "id" ) 
            return windows.m_WindowArray[ nJ ];

      return null;
   };      

   windows.clear = function()
   {
      // clear the windows array.............................................//
      for( var nJ = 0; nJ < windows.m_WindowArray.length; ++nJ )
         windows.m_WindowArray[nJ].clear();

      // empty the windows array.............................................//
      windows.m_WindowArray = [];
   };      

   windows.load = function( dat, ctx )
   {
      if( dat.Set )
      {
         if( jQuery.type( dat.Set ) == 'object' )
         {
            var wnd;

            // this is an object.............................................//
            if( dat.Set.name )
            {
               // set a specific detail window...............................//   
               if( wnd = windows.find( dat.Set.name ) )
               {
                  wnd.load( dat.Set.Window, ctx ); 
                  return;
               } else
               {
                  // create the new scene load it and add it to the scene manager
                  wnd = new VBI.Window();
                  wnd.load( dat.Set.Window, ctx );
                  windows.Add( wnd ); 
                  return;
               }
            }

            //clear windows only when no set of names........................//
            windows.clear();

            if( dat.Set.Window )
            {
               if( jQuery.type( dat.Set.Window ) == 'object' )
               {
                  // create the new scene load it and add it to the scene manager
                  wnd = new VBI.Window();
                  wnd.load( dat.Set.Window, ctx );
                  windows.Add( wnd ); 
               }  
            }
         }  else
         if( jQuery.type( dat.Set ) == 'array' )
         {
            // this is an array..............................................//
            // todo: this is not yet supported
         }
      }
   };
   
   // functions..............................................................//
   windows.Add = function ( wnd ) { windows.m_WindowArray.push( wnd ); };

   // awake
   windows.Awake = function ( target )
   {
      // todo: awake the windows in the right parent child sequence..........//
      // current assumtion is, that sequence is right........................//
      for( var nJ = 0; nJ < windows.m_WindowArray.length; ++nJ )
         windows.m_WindowArray[nJ].Awake( target );
   };

   windows.GetMainWindow = function() 
   {
      // currently first window without a parent is the main.................//
      for( var nJ = 0; nJ < windows.m_WindowArray.length; ++nJ )
      {
         if( windows.m_WindowArray[nJ].m_refParent == null )
            return windows.m_WindowArray[nJ];
      }
      return null;   // scene not known
   };        
   
   // notifications..........................................................//
   windows.NotifyDataChange = function() 
   {
      // notify all windows about a data change..............................//
      var oA = windows.m_WindowArray;
      for( var nJ = 0; nJ < oA.length; ++nJ )
         oA[nJ].NotifyDataChange();

      return null;   // scene not known
   };

   windows.Render = function() 
   {
      // iterate through all windows and render them.........................//
      var oA = windows.m_WindowArray;
      for( var nJ = 0; nJ < oA.length; ++nJ )
         oA[nJ].Render();

      return null;   // scene not known
   };

   return windows;
};

//...........................................................................//
// Window object.............................................................//

VBI.Window = function()
{
   // debugger;
   var window = {};
   window.vbiclass = "Window";
   window.m_ID = "";                // id of window
   window.m_Caption = "";           // caption of window
   window.m_Type = "";              // type of window
   window.m_bModal = true;          // window should be modal
   window.m_refScene = null;        // scene that should be shown in the window
   window.m_refParent = null;       // parent window, null if in scene
   window.m_Width = null;
   window.m_Height = null;
   window.m_Div = null;             // div where the window is placed

   // persisting members.....................................................//

   // clear the window.......................................................//
   window.clear = function()
   {
      // clear references
      window.m_refParent = null;
      window.m_refScene = null; 
   };

   window.load = function( dat, ctx )
   {
      // loading window members
      if( dat.id )
         window.m_ID = dat.id;
      if( dat.caption )
         window.m_Caption = dat.caption;
      if( dat.refParent )
         window.m_refParent = dat.refParent;
      if( dat.modal )
         window.m_bModal = ( dat.ref == "true" ) ? true : false;
      if( dat.width )
         window.m_Width = dat.width;
      if( dat.height )
         window.m_Height = dat.height;

      // get the position....................................................//

      // todo: load all properties of window
      if( dat.refScene )
         window.m_refScene = ctx.m_SceneManager.GetSceneByName( dat.refScene );
      else
         VBI.m_bTrace && VBI.Trace( "ERROR: no scene assigned to window" );
   };

   window.GetScene = function()
   {
      if( window.m_refScene )
         return window.m_refScene;

      return null;
   };

   //........................................................................//
   // notifications..........................................................//

   window.NotifyDataChange = function()
   {
      if( window.m_refScene )
         window.m_refScene.NotifyDataChange();
   };

   window.Render = function()
   {
      if( window.m_refScene )
         window.m_refScene.Render();
   };

   // awake window...........................................................//
   window.Awake = function( target )
   {
      if( window.m_refParent )
         window.Create( target );

      // the target is the id of the dom element tat should be used for......//
      // display.............................................................//
      if( window.m_refScene )
         window.m_refScene.Awake( target );
      else 
         VBI.m_bTrace && VBI.Trace( "ERROR:Window::Awake: no scene assigned to window" );
   };

   //........................................................................//
   // internal functions.....................................................//            

   window.Create = function( target )
   {
      // assign members......................................................//
      if( window.m_refParent && !window.m_Div )
      {
         if (!(window.m_Div = VBI.Utilities.GetDOMElement( target )))
            window.m_Div = VBI.Utilities.CreateDOMElement( target, "1px", "1px" );

         window.m_Div["class"] = "callout";
         window.m_Div.style = "top:100px;left:300px;width:300px";
         window.m_Div.innerHtml = " This is a Detail Window <b class='border-notch notch'></b>";
      }
   };

   window.Destroy = function()
   {
      if( window.m_Div )
      {
         // todo: remove the elements........................................//
      }
   };

   return window;
};



