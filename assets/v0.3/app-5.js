"use strict";
const APP_VERSION="v0.3.6";
if("serviceWorker" in navigator&&location.protocol.indexOf("http")===0){window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").catch(()=>{});let reloaded=false;navigator.serviceWorker.addEventListener("controllerchange",()=>{if(reloaded)return;reloaded=true;if(typeof session!=="undefined"&&session){toast("新しい版があります。区切りで再読み込みしてください");}else location.reload();});});}
