import lista from './variables.js';

let map = L.map("map").setView([1,-74],5);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {foo: 'bar', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);

//let actualLoc = [4.63867863351,-74.0799486565];
let actualLoc = [4.6467863351,-74.0799486565];
let localizacion;
let circle80;

//let localizacion = L.marker(actualLoc).addTo(map);

/*//icons 

let iconoBase = L.Icon.extend({
    options: {
        iconSize:     [38, 95],
        iconAnchor:   [22, 94],
        popupAnchor:  [-3, -76]
    }
});

const CORS = new L.Icon({
    iconUrl: '../assets/locationmap.png',
    iconSize: [50, 50],
    iconAnchor: [25, 50]
})*/

//Dibujo cada CORS en el mapa
lista.forEach(cosa => {
    L.marker([cosa[1],cosa[2]]).addTo(map).bindPopup(cosa[0]);
})

const cardsDiv = document.querySelector('.cards');

const geoBtn = document.querySelector('.geolocation')

/*const selectBtn = document.querySelector('.selectPoint')
selectBtn.addEventListener('click', clickOnMap)

const calcBtn = document.querySelector('.calc');
calcBtn.addEventListener('click', changeCoords);*/


function calcDistances(){
    let distancesTemps = []
    circle80 = L.circle(actualLoc, {radius: 80000})
    map.addLayer(circle80)
    const radius = 6378; //6371
    lista.forEach(cosa => {
        const dLat = toRadians(actualLoc[0] - cosa[1]);
        const dLong = toRadians(actualLoc[1] - cosa[2]);
        const a = Math.pow(Math.sin(dLat/2), 2) + Math.cos(toRadians(actualLoc[0])) * Math.cos(toRadians(cosa[1])) * Math.pow(Math.sin(dLong/2), 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = (radius * c).toFixed(3);
    
        distancesTemps.push([cosa[0], distance, cosa[3], timeGps(distance)])
    })

    distancesTemps.sort((a, b)=>{
        return a[1] - b[1]
    })

    printCards(distancesTemps)
}

function toRadians(value){
    const valueRad = (Math.PI * value)/180
    return valueRad
}

function printCards(ARR){
    let i = 0;
    ARR.forEach(cosa => {
        const stationParm = document.createElement('p');
    
        let active;
        if(ARR[i][2] === 1) active = "Activa" 
        else active = "Inactiva" 
        stationParm.innerText = ARR[i][1] + " km ," + active;
    
        const stationName = document.createElement('p');
        stationName.innerText = ARR[i][0] + ": " + ARR[i][3];
    
    
        const stationCard = document.createElement('div');
        stationCard.classList.add('stationcard')
    
        if(i===0 && ARR[i][1] < 80 && ARR[i][2] === 1){
            const stationTitle = document.createElement('h1');
            stationTitle.innerText = "La mejor opción"
            stationCard.append(stationTitle)
        }
    
        if(i > 0 && ARR[i][1] < 80){
            const stationTitle = document.createElement('h2');
            stationTitle.innerText = "Dentro del área de rastreo"
            stationCard.append(stationTitle)
        }
        
        stationCard.append(stationParm)
        stationCard.append(stationName)
        cardsDiv.appendChild(stationCard)
    
        i++;
    })
}

function timeGps(distance){
    let temp = 65 + (3 * (distance - 10))
    if(temp >= 60){
        let hrs = temp/60;
        let min = Math.round((hrs - parseInt(hrs)) * 60 + 1);
        temp = parseInt(hrs) + " horas y " + min + " minutos";
    } else {
        temp = Math.round(temp + 1) + " minutos"
    }
    return temp
}

geoBtn.addEventListener('click', getGeolocation);
function getGeolocation(){
    let options = {
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 0
    }
    const succes = (position) => {
        actualLoc[0] = position.coords.latitude
        actualLoc[1] = position.coords.longitude

        let localizacion = L.marker(actualLoc).addTo(map);
        localizacion.bindPopup("Ubicación actual");

        // console.log(position.coords.latitude);
        // console.log(position.coords.longitude);

        calcDistances()
        map.flyTo([actualLoc[0] - 0.4, actualLoc[1]], 9)
        toggleToCards()
    }
    const error = (err) => {
        console.warn(`Error ${err.code}: ${err.message}`);
    }
    navigator.geolocation.getCurrentPosition(succes, error, options)
}
const position = document.querySelector('.position')
const cards = document.querySelector('.cards')
function toggleToCards(){
    position.classList.toggle('inactive')
    cards.classList.toggle('inactive')
}

function returnToStart(){
    const arrCards = cardsDiv.querySelectorAll('div:not(.cards--return)');
    arrCards.forEach(div => div.remove())
    map.removeLayer(circle80)
    map.flyTo([1, -74], 5)
    toggleToCards()
}

const returnBtn = document.querySelector('.cards--return')
returnBtn.addEventListener('click', returnToStart);

function clickOnMap(){
    const center = map.getCenter()
    const centerLat = center.lat
    const centerLng = center.lng
    localizacion = L.marker([centerLat,centerLng], {draggable: true})
    localizacion.bindPopup("Ubicación actual");
    map.addLayer(localizacion)
} 

function changeCoords(){
    if(circle80 != undefined){
        map.removeLayer(circle80)
    }
    actualLoc[0] = localizacion._latlng.lat
    actualLoc[1] = localizacion._latlng.lng
    calcDistances()
}