let usuario=localStorage.getItem("usuarioApp") || "admin"
let contraseña=localStorage.getItem("passwordApp") || "1234"
let contraseñaCaja=localStorage.getItem("passwordCaja") || "1B3D"

let tiempoBloqueo=30
let temporizador
let dineroTotal=0
let objetosCaja=[]
let actividad=[]
let intentos=1

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

if(u===usuario && p===contraseña){

registrarActividad("Inicio de sesión")

mostrarPantalla("panel")

}else{

intentos++

registrarActividad("Intento fallido de login")

document.getElementById("error").innerText="Datos incorrectos"

}

}

function abrirCaja(){

let ingreso=prompt("Ingrese la contraseña de la caja")

if(!ingreso) return

ingreso=ingreso.trim()

if(ingreso===contraseñaCaja){

let comando="OPEN_BOX_"+ingreso

enviarComando(comando)

registrarActividad("Solicitud de apertura enviada")

mostrarPantalla("caja")

}else{

alert("Contraseña incorrecta")

registrarActividad("Intento fallido de apertura")

}

}

function bloquearCaja(){

let comando="LOCK_BOX"

enviarComando(comando)

registrarActividad("Solicitud de bloqueo enviada")

document.getElementById("mensaje").innerText="Comando de bloqueo enviado"

}

function volverPanel(){

mostrarPantalla("panel")

}

function verActividad(){

mostrarPantalla("actividad")

mostrarActividad()

}

function cambiarPassword(){

let nueva=prompt("Nueva contraseña")

if(nueva){

contraseña=nueva

registrarActividad("Contraseña cambiada")

alert("Contraseña actualizada")

}

}

function agregarDinero(){

let dinero=prompt("Cantidad a guardar")

if(dinero===null) return

dinero=parseFloat(dinero)

if(isNaN(dinero) || dinero<=0){

alert("Ingrese una cantidad válida")

return

}

dineroTotal=(dineroTotal+dinero).toFixed(2)
dineroTotal=parseFloat(dineroTotal)

actualizarDinero()

registrarActividad("Dinero agregado $" + dinero.toFixed(2))

guardarDatos()

}

function retirarDinero(){

let dinero=prompt("Cantidad a retirar")

if(dinero===null) return

dinero=parseFloat(dinero)

if(isNaN(dinero) || dinero<=0){

alert("Ingrese una cantidad válida")

return

}

if(dinero<=dineroTotal){

dineroTotal=(dineroTotal-dinero).toFixed(2)
dineroTotal=parseFloat(dineroTotal)

actualizarDinero()

registrarActividad("Dinero retirado $" + dinero.toFixed(2))

guardarDatos()

}else{

alert("No hay suficiente dinero")

}

}

function actualizarDinero(){

document.getElementById("totalDinero").innerText="$"+dineroTotal.toFixed(2)

}

function agregarObjeto(){

let objeto=prompt("Objeto a guardar")

if(objeto){

objetosCaja.push(objeto)

mostrarObjetos()

registrarActividad("Objeto agregado: "+objeto)

guardarDatos()

}

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

let hora=fecha.getHours().toString().padStart(2,"0")+":"+
fecha.getMinutes().toString().padStart(2,"0")

actividad.unshift(hora+" - "+texto)

mostrarActividad()

guardarDatos()

}

function mostrarActividad(){

let lista=document.getElementById("listaActividad")

if(!lista) return

lista.innerHTML=""

actividad.forEach(item=>{

let li=document.createElement("li")

li.innerText=item

lista.appendChild(li)

})

}

function exportarDatos(){

let texto="REPORTE DE CAJA FUERTE\n\n"

texto+="Dinero total: $"+dineroTotal+"\n\n"

texto+="Objetos guardados:\n"

objetosCaja.forEach(o=>{

texto+="- "+o+"\n"

})

texto+="\nActividad:\n"

actividad.forEach(a=>{

texto+=a+"\n"

})

let blob=new Blob([texto],{type:"text/plain"})

let link=document.createElement("a")

link.href=URL.createObjectURL(blob)

link.download="reporte_caja.txt"

link.click()

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

if(actividadGuardada) actividad=JSON.parse(actividadGuardada)

setTimeout(()=>{

actualizarDinero()
mostrarObjetos()
mostrarActividad()

},100)

}

function cambiarPasswordCaja(){

let actual=prompt("Ingrese la contraseña actual de la caja")

if(actual===contraseñaCaja){

let nueva=prompt("Ingrese la nueva contraseña (4 caracteres: 0-9, A, B, C, D)")

if(!nueva) return

nueva=nueva.toUpperCase().trim()

// Validar longitud
if(nueva.length<4 || nueva.length>6){

alert("La contraseña debe tener entre 4 y 6 caracteres")
return

}

// Validar caracteres permitidos
let permitido=/^[0-9ABCD]+$/

if(!permitido.test(nueva)){

alert("Solo se permiten números y las letras A, B, C, D")
return

}

contraseñaCaja=nueva

localStorage.setItem("passwordCaja",nueva)

// enviar al Arduino
let comando="CHANGE_PASS_"+nueva
enviarComando(comando)

registrarActividad("Contraseña de la caja cambiada")

alert("Contraseña actualizada")

}else{

alert("Contraseña incorrecta")

}

}

function enviarComando(comando){

let numero="+593999074776"; // número del SIM800L

let url="sms:"+numero+"?body="+encodeURIComponent(comando);

window.location.href=url;

}


function guardarCredenciales(){

let actualUser=document.getElementById("userActual").value
let actualPass=document.getElementById("passActual").value

if(actualUser===usuario && actualPass===contraseña){

let nuevoUser=document.getElementById("userNuevo").value
let nuevaPass=document.getElementById("passNuevo").value

if(nuevoUser && nuevaPass){

usuario=nuevoUser
contraseña=nuevaPass

localStorage.setItem("usuarioApp",nuevoUser)
localStorage.setItem("passwordApp",nuevaPass)

registrarActividad("Credenciales de la app cambiadas")

alert("Datos actualizados")

// LIMPIAR CAMPOS
document.getElementById("userActual").value=""
document.getElementById("passActual").value=""
document.getElementById("userNuevo").value=""
document.getElementById("passNuevo").value=""

volverPanel()

}else{

alert("Ingrese los nuevos datos")

}

}else{

alert("Usuario o contraseña incorrectos")

}

}

function abrirConfiguracion(){

document.getElementById("userActual").value=""
document.getElementById("passActual").value=""
document.getElementById("userNuevo").value=""
document.getElementById("passNuevo").value=""

mostrarPantalla("configuracion")

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