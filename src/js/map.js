import lista from './variables.js';

const mapCenter = [5.5,-74];

let now = new Date();

let actualLoc = [4.6467863351,-74.0799486565];
let localizacion;
let circle80;
let stationline;
let zoomVH;
(window.screen.width > 961) ? zoomVH = 1.4 : zoomVH = 0; 

let map = L.map("map").setView(mapCenter,5 + zoomVH);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {foo: 'bar', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);

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
    
        distancesTemps.push([cosa[0], distance, cosa[3], timeGps(65 + (3 * (distance - 10))), [[cosa[1], cosa[2]], actualLoc], cosa[4], timeGps(15 + 5*distance)])
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
            stationTitle.innerText = "El menor tiempo";
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
        let arr = [ARR[i][0], ARR[i][2], ARR[i][5], ARR[i][6], ARR[i][1]]
        arrow.onclick = () => ShowDetailedView(arr)
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

function timeGps(temp){
    if(temp >= 60){
        let hrs = temp/60;
        let min = Math.round((hrs - parseInt(hrs)) * 60);
        temp = parseInt(hrs) + " horas y " + min + " minutos";
    } else {
        temp = Math.round(temp) + " minutos"
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
        if(err.code === 1){
            console.log(err.message);
            showPop()
            showBlock()
            return;
        } else if (err.code === 3){
            console.log(err.message);
            showPop()
            showCalibrate()
            return;
        }
        //1: User denied geolocation
        //3: time Out
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
const returnPosition = document.querySelector('.returnPosition')
function toggleToCards(){
    position.classList.toggle('inactive')
    cards.classList.toggle('inactive')
    returnPosition.classList.toggle('inactive')
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
    map.flyTo(mapCenter, 5 + zoomVH)
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
    map.flyTo([latProm, longProm], zoomMap +zoomVH)
}

const infoBtn = document.querySelector('.infoBtn');
const lateralMenu = document.querySelector('.lateralMenuContainer'); 
const closeBurguerMenu = document.querySelector('.closeBurguerMenu');
infoBtn.addEventListener('click',() => lateralMenu.classList.toggle('inactive'))
closeBurguerMenu.addEventListener('click', () => lateralMenu.classList.toggle('inactive'))

const returnBtn = document.querySelector('.returnPosition__return')
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
    // infoBtn.classList.toggle('inactive')  //PILAS YA NO ESTA
    returnTab.classList.toggle('inactive')

    clearInputs()
    position.classList.toggle('inactive')
    tabDiv.classList.toggle('inactive')
}

const tabDiv = document.querySelector('.tab')

const degreesBtn = document.querySelector('.degreesMenu');
const degreesSection = document.querySelector('.tab--section__degrees');

const decimalsBtn = document.querySelector('.decimalsMenu');
const decimalsSection = document.querySelector('.tab--section__decimal');

const returnTab  = document.querySelector('.returnTab')
const ActionReturnBtn  = document.querySelector('.returnTab__button')
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
    actualLoc[0] = parseFloat(((inputDecimalLat.value).toString()).replace(/,/g, '.'));
    actualLoc[1] = parseFloat(((inputDecimalLong.value).toString()).replace(/,/g, '.'));
    console.log(actualLoc[0], actualLoc[1]);
    if(isNaN(actualLoc[0]) || isNaN(actualLoc[1]) ){
        showPop()
        showWarning()
        return;
    }
    
    if(actualLoc[1] > 0){
        actualLoc[1] *= -1;
    }
    
    if(actualLoc[0] > 16 || actualLoc[0] < -4.25 || actualLoc[1] < -81.881 || actualLoc[1] > -66.83){
        showPop()
        showOutColombia()
        return;
    }

    toggleToMenu()
    putMarkNcalc()
}

const calcInDegreessBtn = document.querySelector('.calcInDegrees');
calcInDegreessBtn.addEventListener('click', calcSinceDegrees);
function calcSinceDegrees(){
    const selectorNS = parseFloat(document.querySelector('.degrees--container__selector').value)
    actualLoc[0] = (parseInt(degreesLatGrades.value) + parseInt(degreesLatMinutes.value)/60 + parseFloat(((degreesLatSeconds.value).toString()).replace(/,/g, '.'))/360) * selectorNS;
    actualLoc[1] = parseInt(degreesLongGrades.value) + parseInt(degreesLongMinutes.value)/60 + parseFloat(((degreesLongSeconds.value).toString()).replace(/,/g, '.'))/360;
    console.log(actualLoc[0], actualLoc[1]);
    
    if(isNaN(actualLoc[0]) || isNaN(actualLoc[1]) ){
        showPop()
        showWarning()
        return;
    }
    
    if(actualLoc[1] > 0){
        actualLoc[1] *= -1;
    }

    if(actualLoc[0] > 16 || actualLoc[0] < -4.25 || actualLoc[1] < -81.881 || actualLoc[1] > -66.83){
        showPop()
        showOutColombia()
        return;
    }

    toggleToMenu()
    putMarkNcalc()
}

function putMarkNcalc(){
    clearInputs()

    localizacion = L.marker(actualLoc, {icon: redIcon}).addTo(map);
    localizacion.bindPopup("Ubicación actual");
    
    calcDistances()
    map.flyTo([actualLoc[0], actualLoc[1]], 9 + zoomVH)
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

const popUp = document.querySelector('.popUp');
function showPop(){
    popUp.classList.toggle('inactive')
}

const alertDiv = document.querySelector('.alert');
function showWarning(){
    alertDiv.classList.toggle('inactive')
}

const blockedDiv = document.querySelector('.blocked');
function showBlock(){
    blockedDiv.classList.toggle('inactive')
}
const calibrate = document.querySelector('.calibrate');
function showCalibrate(){
    calibrate.classList.toggle('inactive')
}

const colombia = document.querySelector('.outColombia')
function showOutColombia(){
    colombia.classList.toggle('inactive')
}

const closeWarning = document.querySelector('.closeWarning')
closeWarning.addEventListener('click',() => {
    showWarning()
    showPop()
})

const closeBlock = document.querySelector('.closeBlock')
closeBlock.addEventListener('click',() => {
    showBlock()
    showPop()
})

const closeCalibrate = document.querySelector('.closeCalibrate')
closeCalibrate.addEventListener('click',() => {
    showCalibrate()
    showPop()
})

const closeOutColombia = document.querySelector('.closeOutColombia')
closeOutColombia.addEventListener('click',() => {
    showOutColombia()
    showPop()
})

const cardDetail = document.querySelector('.cardDetail')
function ShowDetailedView(arr){
    console.log(arr);

    
    const cardName = document.querySelector('.cardName');
    cardName.innerText = arr[0]
    const cardLocation = document.querySelector('.cardLocation');
    cardLocation.innerHTML = arr[2]
    
    const cardDetailStatus = document.querySelector('.cardDetailStatus');
    const cardDetailedTimeDescriptor = document.querySelector('.time')
    if(cardDetailedTimeDescriptor.textContent !== ""){
        cardDetailedTimeDescriptor.innerHTML = "";
    }
    const spanStatus = document.createElement('span');
    if(arr[1] != 1){
        cardDetailStatus.innerHTML = "inactiva"
        cardDetailStatus.setAttribute("id", 'inact');
        spanStatus.innerHTML = "*Por lo anterior, no es recomendable posicionar con esta estación"
    } else {
        cardDetailStatus.innerHTML = "activa"
        cardDetailStatus.setAttribute("id", 'act');
        if(!(arr[4] > 229)){
            spanStatus.innerHTML = "*Si quieres más seguridad, te recomendamos posicionar por al menos " + arr[3];
        } else {
            spanStatus.innerHTML = "*Sin embargo, hay opciones mejores que están más cerca de tu ubicación";
        }
    }
    cardDetailedTimeDescriptor.appendChild(spanStatus)


    showPop()
    cardDetail.classList.toggle('inactive')
}

const closeCardDetail = document.querySelector('.closeCardDetail')
closeCardDetail.addEventListener('click', ()=>{
    cardDetail.classList.toggle('inactive')
    showPop()
})


const contextGPSdiv = document.querySelector('.burguerMenu--contextGPS');
getGPScontext()
function getGPScontext(){
    /*GPS WEEK*/ 
    let date = new Date;
    let yearNow = date.getFullYear();
    let monthNow = date.getMonth() + 1;
    let dayNow = date.getDate();
    let EPOCHyears = yearNow - 1980;
    let nowDays = 0;

    for(let i = 0; i < (monthNow - 1); i++){
        if(i === 1){
            nowDays += 28;
        }else if(i < 5){
            if((i % 2) === 0){
                nowDays += 31;
            } else {
                nowDays += 30;
            }
        } else {
            if((i % 2) === 0){
                nowDays += 30;
            } else {
                nowDays += 31;
            }
        }
    }
    nowDays += dayNow
    let GPSweek = Math.floor((nowDays + ((EPOCHyears * 365) + 7))/7);  

    /*JULIAN DAY*/

    if(monthNow < 3) {
        monthNow += 12; //Si la fecha es en enero o febrero, hay que sumar 12 al mes y restarle uno al año
        yearNow -= 1;
    }
    // let hoursNow = (date.getHours()/24) + (date.getMinutes()/1440) + (date.getSeconds()/86400)
    let JD = Math.floor(365.25 * (yearNow + 4716)) + Math.floor(30.6001 * (monthNow + 1)) + (dayNow /*+ hoursNow*/) + (2 - Math.floor(yearNow/100) + Math.floor(Math.floor((yearNow/100)/4))) - 1524.5

    /*GPS WEEK NUMBER*/

    const greeting = document.createElement('h1');
    if(date.getHours() < 12){
        greeting.innerText = "Buenos días";
    } else if(date.getHours() < 18){
        greeting.innerText = "Buenas tardes";
    } else {
        greeting.innerText = "Buenas noches";
    }
    
    const dateP = document.createElement('p');
    dateP.innerHTML = "Hoy: " + dayNow + "/" + monthNow + "/" + yearNow;
    dateP.classList.add('pdate') 

    const day = document.createElement('p');
    day.innerHTML = "Día del año: " + nowDays;
    const GPSweekdiv = document.createElement('p');
    GPSweekdiv.innerText = "Semana GPS: " + GPSweek;
    const JDdiv = document.createElement('p');
    JDdiv.innerText = "Día juliano: " + JD;
    const GPSweekNdiv = document.createElement('p');
    GPSweekNdiv.innerText = "Semana y día GPS: " + (String(GPSweek) + date.getDay());

    contextGPSdiv.appendChild(greeting);
    contextGPSdiv.appendChild(dateP)
    contextGPSdiv.appendChild(day);
    contextGPSdiv.appendChild(GPSweekdiv);
    contextGPSdiv.appendChild(JDdiv);
    contextGPSdiv.appendChild(GPSweekNdiv);
}

const table = document.querySelector('.magnaNet--explanation_table')
function fillTable(){
    let i = 0;
    lista.forEach(cosa => {
        i += 1;
        const container = document.createElement('tr');
        const name = document.createElement('td');
        const lat = document.createElement('td');
        const long = document.createElement('td');
        const act = document.createElement('td');
        const desc = document.createElement('td');
        name.innerText = cosa[0];
        lat.innerText = cosa[1].toFixed(4);
        long.innerText = cosa[2].toFixed(4);
        if(cosa[3] == 1){
            act.innerText = "Activa";
            act.classList.add('act');
        } else{
            act.innerText = "Inactiva";
            act.classList.add('inac');
        } 
        desc.innerText = cosa[4];
        desc.classList.add('desc');

        if(i==81){
            name.classList.add('bottLeft')
            desc.classList.add('bottRight')
            container.classList.add('bottRow')
        }

        container.append(name)
        container.append(lat)
        container.append(long)
        container.append(act)
        container.append(desc)
        table.appendChild(container)

    })
}

fillTable()

const bloque = document.querySelectorAll('.bloque--info')
const bloqueName = document.querySelectorAll('.bloque')

bloqueName.forEach((el, i)=>{
    bloqueName[i].addEventListener('click', ()=>{
        if((bloque[i].classList.contains('active'))){
            bloque[i].classList.remove('active');
        } else {
            bloque.forEach((bloq, i)=>{
                bloque[i].classList.remove('active');
            })
            bloque[i].classList.add('active')
        }
    })
})



const appInfo = document.querySelector('.appInfo')

const infoReturn = document.querySelector('.toReturn__button')
infoReturn.addEventListener('click', openCloseInfo)
function openCloseInfo(){
    appInfo.classList.toggle('inactive')
}
const burguerMenuAppInfo = document.querySelector('.burguerMenu--surveyotInfo__appInfo')
burguerMenuAppInfo.addEventListener('click', openCloseInfo)


const calcInfo = document.querySelector('.calcInfo')
const calcReturn = document.querySelector('.calcReturn__button')
calcReturn.addEventListener('click', openCloseCalcInfo)
function openCloseCalcInfo(){
    calcInfo.classList.toggle('inactive')
}
const burguerMenucalcInfo = document.querySelector('.burguerMenu--surveyotInfo__calcs')
burguerMenucalcInfo.addEventListener('click', openCloseCalcInfo)

const magnaNet = document.querySelector('.magnaNet')
const magnaReturn = document.querySelector('.magnaReturn__button')
magnaReturn.addEventListener('click', openCloseMagnaInfo)
function openCloseMagnaInfo(){
    magnaNet.classList.toggle('inactive')
}
const burguerMenuNetInfo = document.querySelector('.burguerMenu--surveyotInfo__red')
burguerMenuNetInfo.addEventListener('click', openCloseMagnaInfo)

const profesional = document.querySelector('.profesional')
const profesionalReturn = document.querySelector('.profesionalReturn__button')
profesionalReturn.addEventListener('click', openCloseProfesionalInfo)
function openCloseProfesionalInfo(){
    profesional.classList.toggle('inactive')
}
const burguerMenuProf = document.querySelector('.burguerMenu--appInfo__profesionals')
burguerMenuProf.addEventListener('click', openCloseProfesionalInfo)


/*const selectBtn = document.querySelector('.selectPoint')
selectBtn.addEventListener('click', clickOnMap)

const calcBtn = document.querySelector('.calc');
calcBtn.addEventListener('click', changeCoords);

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
*/