let usuario = localStorage.getItem("usuarioApp") || "admin"
let password = localStorage.getItem("passwordApp") || "1234"
let passwordCaja = localStorage.getItem("passwordCaja") || "1B3D"

let dineroTotal = 0
let objetosCaja = []
let actividad = []
let intentos = 0

cargarDatos()

setTimeout(()=>{

document.getElementById("splash").style.display="none"
document.getElementById("login").style.display="block"

},2000)


function mostrarPantalla(id){

document.querySelectorAll(".screen").forEach(s=>s.style.display="none")

document.getElementById(id).style.display="block"

}


function login(){

let u=document.getElementById("user").value
let p=document.getElementById("pass").value

if(intentos>=3){

activarBloqueo()
return

}

if(u === usuario && p === password){
intentos = 0

registrarActividad("Inicio de sesión")

mostrarPantalla("panel")

}else{

intentos++

registrarActividad("Intento fallido de login")

document.getElementById("error").innerText="Datos incorrectos"

}

}


function abrirCaja(){

abrirModal("🔐 Ingrese contraseña de la caja","Contraseña", function(ingreso){

if(!ingreso || ingreso.trim() === ""){

setMensajeModal("⚠ No ha introducido ningún carácter");
errorInputModal();
return;

}

ingreso = ingreso.trim();

if(ingreso === passwordCaja){

let comando = "OPEN_BOX_" + ingreso;

enviarComando(comando);

registrarActividad("Solicitud de apertura enviada");

cerrarModal(); // 👈 cerrar AQUÍ

mostrarPantalla("caja");

}else{

registrarActividad("Intento fallido de apertura");

setMensajeModal("❌ Contraseña incorrecta");
errorInputModal();

}

});

}


function bloquearCaja(){

let comando="LOCK_BOX"

enviarComando(comando)

registrarActividad("Solicitud de bloqueo enviada")

mostrarMensaje("🔒 Comando de bloqueo enviado");
setMensajeModal("Caja bloqueda con exito");

}


function volverPanel(){

mostrarPantalla("panel")

}


function verActividad(){

mostrarPantalla("actividad")

mostrarActividad()

}


function agregarDinero(){

abrirModal("💰 Agregar dinero","Cantidad", function(dinero){

if(!dinero || dinero.trim() === ""){
setMensajeModal("⚠ No ha introducido ningún carácter");
errorInputModal();
return;
}

dinero = parseFloat(dinero);

if(isNaN(dinero) || dinero <= 0){
setMensajeModal("❌ Cantidad inválida");
errorInputModal();
return;
}

dineroTotal = (dineroTotal + dinero).toFixed(2);
dineroTotal = parseFloat(dineroTotal);

actualizarDinero();

registrarActividad("Dinero agregado $" + dinero.toFixed(2));

guardarDatos();

cerrarModal();

});

}

function retirarDinero(){

abrirModal("💸 Retirar dinero","Cantidad", function(dinero){

if(!dinero || dinero.trim() === ""){
setMensajeModal("⚠ No ha introducido ningún carácter");
errorInputModal();
return;
}

dinero = parseFloat(dinero);

if(isNaN(dinero) || dinero <= 0){
setMensajeModal("❌ Cantidad inválida");
errorInputModal();
return;
}

if(dinero > dineroTotal){
setMensajeModal("❌ No hay suficiente dinero");
errorInputModal();
return;
}

dineroTotal = (dineroTotal - dinero).toFixed(2);
dineroTotal = parseFloat(dineroTotal);

actualizarDinero();

registrarActividad("Dinero retirado $" + dinero.toFixed(2));

guardarDatos();

cerrarModal();

});

}


function actualizarDinero(){

document.getElementById("totalDinero").innerText="$"+dineroTotal.toFixed(2)

}


function agregarObjeto(){

abrirModal("📦 Agregar objeto","Nombre del objeto", function(objeto){

if(!objeto || objeto.trim() === ""){
setMensajeModal("⚠ No ha introducido ningún carácter");
errorInputModal();
return;
}

objeto = objeto.trim();

objetosCaja.push(objeto);

mostrarObjetos();

registrarActividad("Objeto agregado: " + objeto);

guardarDatos();

cerrarModal();

});

}


function eliminarObjeto(index){

registrarActividad("Objeto eliminado: "+objetosCaja[index])

objetosCaja.splice(index,1)

mostrarObjetos()

guardarDatos()

}


function mostrarObjetos(){

let lista=document.getElementById("listaObjetos")

lista.innerHTML=""

objetosCaja.forEach((obj,index)=>{

let li=document.createElement("li")

li.innerHTML=obj+" <button onclick='eliminarObjeto("+index+")'>❌</button>"

lista.appendChild(li)

})

}


function registrarActividad(texto){

let fecha=new Date()

let dia=fecha.getDate().toString().padStart(2,"0")
let mes=(fecha.getMonth()+1).toString().padStart(2,"0")
let año=fecha.getFullYear()

let hora=fecha.getHours().toString().padStart(2,"0")+":"+
fecha.getMinutes().toString().padStart(2,"0")

let fechaCorta=dia+"/"+mes+"/"+año

actividad.unshift({
fecha:fechaCorta,
hora:hora,
texto:texto
})

guardarDatos()

mostrarActividad()

}


function mostrarActividad(){

let lista=document.getElementById("listaActividad")

if(!lista) return

lista.innerHTML=""

let fechaActual=""

actividad.forEach(item=>{

if(item.fecha!==fechaActual){

fechaActual=item.fecha

let titulo=document.createElement("li")

titulo.innerHTML="📅 "+fechaActual
titulo.style.fontWeight="bold"
titulo.style.marginTop="10px"

lista.appendChild(titulo)

}

let li=document.createElement("li")

li.innerText=item.hora+" - "+item.texto

lista.appendChild(li)

})

}


function borrarHistorial(){

abrirModal("⚠ ¿Desea borrar el historial?","Escriba SI para confirmar", function(confirmar){

if(!confirmar || confirmar.trim() === ""){
setMensajeModal("⚠ No ha introducido ningún carácter");
errorInputModal();
return;
}

confirmar = confirmar.trim().toUpperCase();

if(confirmar === "SI" || confirmar === "si" || confirmar === "Si" || confirmar === "sI"){

actividad = [];

guardarDatos();

mostrarActividad();

cerrarModal();

mostrarMensaje("🗑 Historial de actividades borrado");

}else{

setMensajeModal("❌ Debe escribir SI para confirmar");
errorInputModal();

}

});

}


function exportarDatos(){

let texto="REPORTE GUARDIANBOX\n\n"

texto+="Dinero: $"+dineroTotal+"\n\n"

texto+="Objetos:\n"
objetosCaja.forEach(o=>{
texto+="- "+o+"\n"
})

texto+="\nActividad:\n"

actividad.forEach(item=>{
texto+=item.fecha+" "+item.hora+" - "+item.texto+"\n"
})

// 📱 compartir
if(navigator.share){

navigator.share({
title:"Reporte GuardianBox",
text:texto
}).catch(()=>{
// si falla → copiar
navigator.clipboard.writeText(texto)
alert("Reporte copiado al portapapeles")
})

}else{

navigator.clipboard.writeText(texto)
alert("Reporte copiado al portapapeles")

}

}


function cambiarPasswordCaja(){

// PASO 1: pedir contraseña actual
abrirModal("🔐 Contraseña actual","Ingrese contraseña", function(actual){

if(!actual || actual.trim() === ""){
setMensajeModal("⚠ No ha introducido ningún carácter");
errorInputModal();
return;
}

actual = actual.trim();

if(actual === passwordCaja){

// PASO 2: pedir nueva contraseña
abrirModal("🆕 Nueva contraseña","4 a 6 caracteres (0-9 A B C D)", function(nueva){

if(!nueva || nueva.trim() === ""){
setMensajeModal("⚠ No ha introducido ningún carácter");
errorInputModal();
return;
}

nueva = nueva.toUpperCase().trim();

if(nueva.length < 4 || nueva.length > 6){
setMensajeModal("❌ Debe tener entre 4 y 6 caracteres");
errorInputModal();
return;
}

let permitido = /^[0-9ABCD]+$/;

if(!permitido.test(nueva)){
setMensajeModal("❌ Solo se permiten números y A B C D");
errorInputModal();
return;
}

// GUARDAR
passwordCaja = nueva;
localStorage.setItem("passwordCaja", nueva);

let comando = "CHANGE_PASS_" + nueva;

enviarComando(comando);

registrarActividad("Contraseña de la caja cambiada");

mostrarMensaje("✅ Contraseña actualizada");

});

}else{

setMensajeModal("❌ Contraseña actual incorrecta");
errorInputModal();

}

});

}


function guardarDatos(){

localStorage.setItem("dinero",dineroTotal)
localStorage.setItem("objetos",JSON.stringify(objetosCaja))
localStorage.setItem("actividad",JSON.stringify(actividad))

}


function cargarDatos(){

let dineroGuardado=localStorage.getItem("dinero")
let objetosGuardados=localStorage.getItem("objetos")
let actividadGuardada=localStorage.getItem("actividad")

if(dineroGuardado) dineroTotal=parseFloat(dineroGuardado)

if(objetosGuardados) objetosCaja=JSON.parse(objetosGuardados)

if(actividadGuardada){

actividad=JSON.parse(actividadGuardada)

if(!Array.isArray(actividad)){
actividad=[]
}

}

setTimeout(()=>{

actualizarDinero()
mostrarObjetos()
mostrarActividad()

},100)

}


function activarBloqueo(){

mostrarPantalla("bloqueo")

let tiempo = 30

document.getElementById("contador").innerText = tiempo

let intervalo = setInterval(function(){

tiempo--

document.getElementById("contador").innerText = tiempo

if(tiempo <= 0){

document.getElementById("user").value=""
document.getElementById("pass").value=""

clearInterval(intervalo)

intentos = 0

mostrarPantalla("login")

}

},1000)

}


function togglePassword(){

let input=document.getElementById("pass")
let ojo=document.getElementById("ojoPass")

if(input.type==="password"){

input.type="text"
ojo.innerText="🙈"

}else{

input.type="password"
ojo.innerText="👁"

}

}

function abrirConfiguracion(){

document.getElementById("userActual").value=""
document.getElementById("passActual").value=""
document.getElementById("userNuevo").value=""
document.getElementById("passNuevo").value=""

mostrarPantalla("configuracion")

}


function guardarCredenciales(){

let actualUser=document.getElementById("userActual").value
let actualPass=document.getElementById("passActual").value

if(actualUser===usuario && actualPass===password){

let nuevoUser=document.getElementById("userNuevo").value
let nuevaPass=document.getElementById("passNuevo").value

if(nuevoUser && nuevaPass){

usuario=nuevoUser
password=nuevaPass

localStorage.setItem("usuarioApp",nuevoUser)
localStorage.setItem("passwordApp",nuevaPass)

registrarActividad("Credenciales de la app cambiadas")

mostrarMensaje("📋Datos actualizados");

document.getElementById("userActual").value=""
document.getElementById("passActual").value=""
document.getElementById("userNuevo").value=""
document.getElementById("passNuevo").value=""

volverPanel()

}else{

setMensajeConfig("Ingrese los nuevos datos");

}

}else{

setMensajeConfig("❌ Usuario o contraseña incorrectos");

}

}

let callbackModal = null;

function abrirModal(titulo, placeholder, callback){

document.getElementById("modalTitulo").innerText = titulo;
document.getElementById("modalInput").value = "";
document.getElementById("modalInput").placeholder = placeholder;

let mensaje = document.getElementById("modalMensaje");
mensaje.innerText = "";
mensaje.style.display = "block";

document.getElementById("modal").style.display = "flex";

callbackModal = callback;

}

function confirmarModal(){

let valor = document.getElementById("modalInput").value;

if(callbackModal){
callbackModal(valor);
}

}

function mostrarMensaje(texto){

document.getElementById("modalTitulo").innerHTML = texto.replace(/\n/g, "<br>");
document.getElementById("modalInput").style.display = "none";

document.getElementById("modal").style.display = "flex";

// 👇 hacer que Aceptar solo cierre
callbackModal = function(){
cerrarModal();
};

}

function cerrarModal(){

document.getElementById("modal").style.display = "none";

// limpiar estado SIEMPRE
callbackModal = null;

// restaurar input
document.getElementById("modalInput").style.display = "block";

}

function enviarComando(comando){

let numero="+593999074776"

let url="sms:"+numero+"?body="+encodeURIComponent(comando)

window.location.href=url

}

function setMensajeModal(texto){

let m = document.getElementById("modalMensaje");

// 👇 solo cambia si es diferente (evita bugs)
if(m.innerText !== texto){
m.innerText = texto;
}

}

function errorInputModal(){

let input = document.getElementById("modalInput");

input.style.border = "2px solid red";
input.style.backgroundColor = "#ffe6e6";

// animación tipo temblor 🔥
input.style.animation = "shake 0.3s";

setTimeout(()=>{
input.style.animation = "";
},300);

// volver a normal después
setTimeout(()=>{
input.style.border = "";
input.style.backgroundColor = "";
},1500);

}

function setMensajeConfig(texto){

let m = document.getElementById("mensajeConfig");

if(!m) return;

// 👇 solo cambia si es diferente
if(m.innerText !== texto){
m.innerText = texto;
}

}
