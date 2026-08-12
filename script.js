//Load navigation bars
if(document.getElementById("left")){
  fetch('navleft.html').then((response) => response.text()).then((data) => {
    document.getElementById("left").innerHTML = data;

    const path = window.location.pathname;
    const items = document.querySelectorAll('#left .sidebar-item');
    items.forEach(item => {
      const href = item.getAttribute('href');
      if (href && (href === path || (href !== '/' && path.includes(href)))) {
        item.classList.add('active');
      } else if (href === '/' && (path === '/' || path === '/index.html' || path === '/home')) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    if (typeof updateUiTexts === "function") updateUiTexts();
  });
}

if(document.getElementById("head")){
  fetch('navtop.html').then((response) => response.text()).then((data) => {
    document.getElementById("head").innerHTML = data;
    if(window.localStorage.getItem("isDev") == 'true'){
      document.getElementById("head").innerHTML += "<span class='devviewstable' onclick='openDevWindow()'>Dev Tools</span>";
    }
  });
}

window.bridge = {
  connected: false,
  openedFile: undefined
};

//General code

var devWindow;
function openDevWindow(){
  devWindow = window.open("/console/", "DevWindow", "width=300,height=400");
  window.onerror = function(error, url, line) {
    devWindow.newError({data: error, url: url, line: line});
  };
}

if(location.protocol != "https:" && location.hostname != '127.0.0.1' && location.hostname != 'localhost'){
  window.location.href= (window.location.href).replaceAll("http:", "https:")
}

function loadApps(){
  var idModifier = "";
  if(window.location.pathname == "/home" || window.location.pathname == "/"){
    idModifier = "-home";
  }
  for(let category of Object.keys(apps)){
    const targetElem = document.getElementById(category + idModifier) || document.getElementById(category);
    if (!targetElem) continue;
    targetElem.innerHTML = "";
    for(let app of apps[category]){
      var label = document.createElement("a");
      label.classList = ['app-label'];
      targetElem.appendChild(label);
      loadApp(app, label, category);
      
      if(app.subapps){
        var subapplistcontainer = document.createElement("li");
        var subapplist = document.createElement("ul");
        
        for(let subapp of app.subapps){
          var subapplabel = document.createElement("a");
          subapplabel.classList = ['app-label'];
          subapplist.appendChild(subapplabel);
          loadApp(subapp, subapplabel, category);
        }
        
        subapplistcontainer.appendChild(subapplist);
        targetElem.appendChild(subapplistcontainer);
      }
    }
  }
}

function reloadCSS(){
  var links = document.getElementsByTagName("link"); for (var i = 0; i < links.length;i++) { var link = links[i]; if (link.rel === "stylesheet") {link.href += "?"; }}
}

function loadApp(path, elem, category){
  if(!path) return;
  var svg = '<svg viewBox="0 0 24 24" class="' + path.icon.class.list + '">' + path.icon.data + "</svg>";
  elem.innerHTML += svg;
  
  var link = path.link;
  
  if(path.hideEmbedded){
    elem.classList.toggle("hide-embedded", true)
  }
  
  var name = document.createElement("span");
  name.innerText = path.name;
  elem.appendChild(name);
  
  elem.href = link;
  
  if(path.confirmUnload){
    elem.setAttribute("confirmUnload", "true");
  }
  
  if(path.tags){
    for(let tag of path.tags){
      var create = true;
      if(tag.conditions){
        for(let condition of tag.conditions){
          if(condition == "selected" && window.location.pathname != path.link) create = false;
          if(condition == "!selected" && window.location.pathname == path.link) create = false;
        }
      }
      if(create){
        var tagElement = document.createElement("span");
        tagElement.classList = ['app-tag'];
        tagElement.innerText = tag.title;
        tagElement.style.backgroundColor = tag.backgroundcolor;
        tagElement.style.color = tag.fontcolor;
        elem.appendChild(tagElement);
      }
    }
  }
}