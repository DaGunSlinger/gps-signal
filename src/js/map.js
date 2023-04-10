import lista from './variables.js';

const mapCenter = [5.5,-74];

let map = L.map("map").setView(mapCenter,5);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {foo: 'bar', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);

let actualLoc = [4.6467863351,-74.0799486565];
let localizacion;
let circle80;
let stationline;

//icons 
const redIcon = L.icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


//Dibujo cada CORS en el mapa
lista.forEach(cosa => {
    L.marker([cosa[1],cosa[2]]).addTo(map).bindPopup(cosa[0]);
})

const cardsDiv = document.querySelector('.cards');
const cardsContainer = document.querySelector('.cardsContainer')

const geoBtn = document.querySelector('.geolocation')


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
    
        distancesTemps.push([cosa[0], distance, cosa[3], timeGps(distance), [[cosa[1], cosa[2]], actualLoc]])
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
    let flag = 0;
    for(let el in ARR){
        const stationDist = document.createElement('p');
    
        const stationActive = document.createElement('p');
        stationActive.classList.add('stationcard--act')
        if(ARR[i][2] === 1) {
            stationActive.innerText = "Activa" 
            stationActive.classList.add('act')
        } else {        
            stationActive.innerText = "Inactiva" 
            stationActive.classList.add('inac')
        }

        stationDist.innerText = ARR[i][1] + " km de tu ubicación"
        stationDist.classList.add('stationcard--dist')
    
        const stationName = document.createElement('p');
        stationName.innerText = ARR[i][0];
        stationName.classList.add('stationcard--name')

        const righTopDiv = document.createElement('div');
        righTopDiv.classList.add('stationcard--rightTop')
        const stationTime = document.createElement('p');
        stationTime.innerText = ARR[i][3];
        stationTime.classList.add('stationcard--time')
    
    
        const stationCard = document.createElement('button');
        stationCard.classList.add('stationcard')

        const containerLeft = document.createElement('div');
        containerLeft.classList.add('stationcard--left')
    
        if(i===0 && ARR[i][1] < 80 && ARR[i][2] === 1){
            const stationTitle = document.createElement('h1');
            stationTitle.innerText = "La mejor opción";
            cardsContainer.appendChild(stationTitle);
        } else if(i === 1 && ARR[i][1] < 80){
            const stationTitle = document.createElement('h1');
            stationTitle.innerText = "Dentro del área de rastreo"
            cardsContainer.appendChild(stationTitle)
        } else if(ARR[i][1] > 80 && flag === 0){
            const stationTitle = document.createElement('h1');
            stationTitle.innerText = "Otras opciones"
            cardsContainer.appendChild(stationTitle)
            flag++
        }

        const arrow = document.createElement('span');
        arrow.classList.add('position--button__arrow')
        const coordsAct = ARR[i][4]
        //console.log('params: ' , coordsAct, actualLoc);
        stationCard.onclick = () => drawLine(coordsAct)

        // const cardsContainer = document.createElement('div')
        // cardsContainer.classList.add('cardsContainer')
        
        containerLeft.append(stationName)
        containerLeft.append(stationActive)
        stationCard.append(containerLeft)
        stationCard.append(stationDist)
        stationCard.append(righTopDiv)
        stationCard.append(stationTime)
        stationCard.append(arrow)
        cardsContainer.appendChild(stationCard)
    
        i++;
    }
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
    const succes = (position) => {
        actualLoc[0] = position.coords.latitude
        actualLoc[1] = position.coords.longitude
        
        putMarkNcalc()
    }
    const error = (err) => {
        console.warn(`Error ${err.code}: ${err.message}`);
    }
    let options = {
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 0
    }
    navigator.geolocation.getCurrentPosition(succes, error, options)
}

const position = document.querySelector('.position')
const cards = document.querySelector('.cards')
function toggleToCards(){
    position.classList.toggle('inactive')
    cards.classList.toggle('inactive')
}

function clearCards(){
    const arrCards = cardsContainer.querySelectorAll(':not(.keep)');
    arrCards.forEach(div => div.remove())

    const arrH1 = cardsContainer.querySelectorAll('h1:not(.keep)');
    arrH1.forEach(el => el.remove())
}

function returnToStart(){
    clearCards()
    map.removeLayer(circle80)
    if(stationline != undefined){
        map.removeLayer(stationline)
    }
    if(localizacion != undefined){
        map.removeLayer(localizacion)
    }
    map.flyTo(mapCenter, 5)
    toggleToCards()
}

function drawLine(coords){
    if(stationline != undefined){
        map.removeLayer(stationline)
    }
    stationline = L.polyline([[coords[0][0],coords[0][1]],[coords[1][0],coords[1][1]]], {color: '#7f59ed'}).addTo(map);

    const latProm = (coords[0][0] + coords[1][0])/2
    const longProm = (coords[0][1] + coords[1][1])/2

    const latDiff = Math.abs(coords[0][0] - coords[1][0]);
    const longDiff = Math.abs(coords[0][1] - coords[1][1]);

    let zoomMap;
    if(latDiff > longDiff){
        if(latDiff < 0.07){
            zoomMap = 12
        } else if (latDiff < 0.2) {
            zoomMap = 11
        } else if (latDiff < 0.9){
            zoomMap = 9
        } else if(latDiff < 1.8){
            zoomMap = 8
        } else if(latDiff < 3.8){
            zoomMap = 7
        } else if(latDiff < 7){
            zoomMap = 6
        } else {
            zoomMap = 5
        }
    } else {
        if(longDiff < 0.07){
            zoomMap = 12
        } else if (longDiff < 0.2) {
            zoomMap = 11
        } else if (longDiff < 0.9){
            zoomMap = 9
        } else if(longDiff < 1.8){
            zoomMap = 8
        } else if(longDiff < 3.8){
            zoomMap = 7
        } else if(longDiff < 7){
            zoomMap = 6
        } else {
            zoomMap = 5
        }
    }
    map.flyTo([latProm, longProm], zoomMap)
}
const infoBtn = document.querySelector('.infoBtn');
const lateralMenu = document.querySelector('.lateralMenuContainer'); 
const closeBurguerMenu = document.querySelector('.closeBurguerMenu');
infoBtn.addEventListener('click',() => lateralMenu.classList.toggle('inactive'))
closeBurguerMenu.addEventListener('click', () => lateralMenu.classList.toggle('inactive'))

const returnBtn = document.querySelector('.cards--navigation__return')
returnBtn.addEventListener('click', returnToStart);

const coordsBtn = document.querySelector('.insertCoords')
coordsBtn.addEventListener('click', toggleToMenu);

function toggleToMenu(){
    if(degreesBtn.classList.contains('inactiveBtn')){
        toggleCalcMode()
    }
    if(document.querySelector('.degrees--container__selector').value === '-1'){
        document.querySelector('.degrees--container__selector').value = '1'
    }
    infoBtn.classList.toggle('inactive')

    clearInputs()
    position.classList.toggle('inactive')
    tabDiv.classList.toggle('inactive')

    ActionReturnBtn.classList.toggle('inactive')
}

const tabDiv = document.querySelector('.tab')

const degreesBtn = document.querySelector('.degreesMenu');
const degreesSection = document.querySelector('.tab--section__degrees');

const decimalsBtn = document.querySelector('.decimalsMenu');
const decimalsSection = document.querySelector('.tab--section__decimal');

const ActionReturnBtn = document.querySelector('.returnBtn'); 
ActionReturnBtn.addEventListener('click', toggleToMenu)

degreesBtn.addEventListener('click', toggleCalcMode)
decimalsBtn.addEventListener('click', toggleCalcMode);

function toggleCalcMode(){
    degreesBtn.classList.toggle('inactiveBtn');
    decimalsBtn.classList.toggle('inactiveBtn');

    degreesSection.classList.toggle('inactive');
    decimalsSection.classList.toggle('inactive');
}

const degreesLatGrades = document.querySelector('.degreesLatGrades');
const degreesLatMinutes = document.querySelector('.degreesLatMinutes');
const degreesLatSeconds = document.querySelector('.degreesLatSeconds');
const degreesLongGrades = document.querySelector('.degreesLongGrades');
const degreesLongMinutes = document.querySelector('.degreesLongMinutes');
const degreesLongSeconds = document.querySelector('.degreesLongSeconds');


const inputDecimalLat = document.querySelector('.decimalLat');
const inputDecimalLong = document.querySelector('.decimalLong');

const calcInDecimalsBtn = document.querySelector('.calcInDecimals');
calcInDecimalsBtn.addEventListener('click', calcSinceDecimals);
function calcSinceDecimals(){
    actualLoc[0] = parseFloat(inputDecimalLat.value);
    actualLoc[1] = parseFloat(inputDecimalLong.value);
    if(isNaN(actualLoc[0]) || isNaN(actualLoc[1]) ){
        showWarning()
        return;
    }
    if(actualLoc[1] > 0){
        actualLoc[1] *= -1;
    }

    toggleToMenu()
    putMarkNcalc()
}

const calcInDegreessBtn = document.querySelector('.calcInDegrees');
calcInDegreessBtn.addEventListener('click', calcSinceDegrees);
function calcSinceDegrees(){
    const selectorNS = parseFloat(document.querySelector('.degrees--container__selector').value)
    actualLoc[0] = (parseInt(degreesLatGrades.value) + parseInt(degreesLatMinutes.value)/60 + parseFloat(degreesLatSeconds.value)/360) * selectorNS;
    actualLoc[1] = parseInt(degreesLongGrades.value) + parseInt(degreesLongMinutes.value)/60 + parseFloat(degreesLongSeconds.value)/360;

    
    if(isNaN(actualLoc[0]) || isNaN(actualLoc[1]) ){
        showWarning()
        return;
    }
    
    if(actualLoc[1] > 0){
        actualLoc[1] *= -1;
    }

    if(actualLoc[1] > 0){
        actualLoc[1] *= -1;
    }

    toggleToMenu()
    putMarkNcalc()
}

function putMarkNcalc(){
    clearInputs()

    localizacion = L.marker(actualLoc, {icon: redIcon}).addTo(map);
    localizacion.bindPopup("Ubicación actual");
    
    calcDistances()
    map.flyTo([actualLoc[0], actualLoc[1]], 9)
    toggleToCards()
}

function clearInputs(){
    degreesLatGrades.value = '';
    degreesLatMinutes.value = '';
    degreesLatSeconds.value = '';
    degreesLongGrades.value = '';
    degreesLongMinutes.value = '';
    degreesLongSeconds.value = '';

    inputDecimalLat.value = '';
    inputDecimalLong.value = '';
}

const warningDiv = document.querySelector('.warning')
function showWarning(){
    warningDiv.classList.toggle('inactive')
}
const closeWarning = document.querySelector('.closeWarning')
closeWarning.addEventListener('click',() => showWarning())

/*const selectBtn = document.querySelector('.selectPoint')
selectBtn.addEventListener('click', clickOnMap)

const calcBtn = document.querySelector('.calc');
calcBtn.addEventListener('click', changeCoords);*/

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