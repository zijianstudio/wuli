(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{15:function(e,t,n){},16:function(e,t,n){"use strict";n.r(t);var a=n(0),s=n.n(a),i=n(8),c=n.n(i),o=n(1),l=n(2),r=n(4),m=n(3),u=n(5),h=(n(15),n(6),function(e){function t(e){var n;return Object(o.a)(this,t),(n=Object(r.a)(this,Object(m.a)(t).call(this,e))).state={title:e.title,elements:e.elements},n}return Object(u.a)(t,e),Object(l.a)(t,[{key:"componentWillReceiveProps",value:function(e){e.title!==this.state.title&&this.setState({title:e.title,elements:e.elements})}},{key:"createPanel",value:function(){var e=this.state.elements,t=[];return t.push(s.a.createElement("h3",null,this.state.title)),e.forEach(function(e){t.push(s.a.createElement("p",null,e))}),t}},{key:"render",value:function(){return s.a.createElement("div",{className:"panel"},this.createPanel())}}]),t}(s.a.Component)),d=function(e){function t(e){var n;return Object(o.a)(this,t),(n=Object(r.a)(this,Object(m.a)(t).call(this,e))).state={sims:e.sims},n}return Object(u.a)(t,e),Object(l.a)(t,[{key:"createSimList",value:function(){var e=this,t=this.state.sims,n=[],a=function(a){var i=t[a],c=s.a.createElement("button",{className:"link-button",onClick:function(){return e.loadComponentsForSim(i.name)}},i.name);n.push(c)};for(var i in t)a(i);return n}},{key:"loadComponentsForSim",value:function(e){var t=this.state.sims;for(var n in t){var a=t[n];a.name===e&&this.setState({simsPanel:s.a.createElement(h,{title:e,elements:a.components})})}}},{key:"render",value:function(){return s.a.createElement("div",{className:"page"},s.a.createElement("div",{className:"list"},this.createSimList()),this.state.simsPanel)}}]),t}(s.a.Component),v=function(e){function t(e){var n;return Object(o.a)(this,t),(n=Object(r.a)(this,Object(m.a)(t).call(this,e))).state={components:e.components,simsPanel:null},n}return Object(u.a)(t,e),Object(l.a)(t,[{key:"createComponentList",value:function(){var e=this,t=this.state.components,n=[];return t.forEach(function(t){var a=s.a.createElement("button",{className:"link-button",onClick:function(){return e.loadSimsForComponent(t.name)}},t.name);n.push(a)}),n}},{key:"loadSimsForComponent",value:function(e){var t=this;this.state.components.forEach(function(n){n.name===e&&t.setState({simsPanel:s.a.createElement(h,{title:e,elements:n.sims})})})}},{key:"render",value:function(){return s.a.createElement("div",{className:"page"},s.a.createElement("div",{className:"list"},this.createComponentList()),this.state.simsPanel)}}]),t}(s.a.Component),p=function(e){function t(e){var n;return Object(o.a)(this,t),(n=Object(r.a)(this,Object(m.a)(t).call(this,e))).state={selectedButtonId:null,selectedPage:null},fetch("./binderjson.json").then(function(e){return e.json()}).then(function(e){var t=e.components,a=e.sims,i=Object.keys(t).map(function(e){return{name:e,sims:Object.keys(t[e])}});n.setState({simsByComponent:s.a.createElement(v,{components:i}),componentsBySim:s.a.createElement(d,{sims:a})});var c=n.state.selectedButtonId||"simsByComponent";n.selectPage(c)}),n}return Object(u.a)(t,e),Object(l.a)(t,[{key:"selectClass",value:function(e){return this.state.selectedButtonId===e?"selected":""}},{key:"selectPage",value:function(e){this.setState({selectedButtonId:e,selectedPage:this.state[e]})}},{key:"render",value:function(){var e=this,t=function(t){return s.a.createElement("button",{className:"nav-button ".concat(e.selectClass(t.id)),onClick:function(){return e.selectPage(t.id)}},t.label)};return s.a.createElement("div",{id:"index-page"},s.a.createElement("div",{id:"side-nav"},s.a.createElement("div",{className:"title-container"},s.a.createElement("img",{src:"./img/phet.png",className:"title-image",alt:"PhET"}),s.a.createElement("h1",{className:"title-text"},"Binder")),s.a.createElement("div",{className:"nav-buttons"},s.a.createElement(t,{id:"simsByComponent",label:"SIMS BY COMPONENT"}),s.a.createElement(t,{id:"componentsBySim",label:"COMPONENTS BY SIM"}))),s.a.createElement("div",{id:"selected-page"},this.state.selectedPage))}}]),t}(s.a.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));c.a.render(s.a.createElement(p,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})},6:function(e,t,n){},9:function(e,t,n){e.exports=n(16)}},[[9,1,2]]]);
//# sourceMappingURL=main.428d3405.chunk.js.map