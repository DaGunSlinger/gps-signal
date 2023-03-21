let map = L.map("map").setView([1,-74],5);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {foo: 'bar', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);

//let actualLoc = [4.63867863351,-74.0799486565];
let actualLoc = [4.6467863351,-74.0799486565];
let localizacion;
let circle80;

//let localizacion = L.marker(actualLoc).addTo(map);

const banco1 = [["AECH",3.72494334743,-75.4659905729,1] ,["AEFO",1.58893489508,-75.5621476533,0],["AEGU",4.80967974001,-74.0575915961,1],["AGCA",8.31504997055,-73.5954166055,1],["ALBE",7.76053994385,-73.3894285632,1],["ANDS",12.5863463152,-81.7007308608,0],["APTO",7.87778695951,-76.6323916295,1],["ARCA",7.08428034163,-70.758529778,1],["BECE",9.70212772954,-73.27927227,1],["BEJA",7.06063891906,-73.8755888826,1],["BERR",6.49268346774,-74.4103105046,1],["BNGA",7.10489863418,-73.1237315495,1],["BOGA",4.63867863351,-74.0799486565,1],["BOSC",9.96690164914,-73.88623614,1],["BQLA",11.0197192782,-74.8496328024,1],["CALI",3.3757850809,-76.5325648121,1],["CAN0",6.18521498953,-67.4821216701,1],["CART",10.3913593054,-75.5338736804,0],["CASI",7.98884421424,-75.2000360804,1],["CUCU",7.8984714713,-72.4879394526,1],["DORA",5.45384744068,-74.6633165003,1],["FQNE",5.4673420837,-73.7348091843,0],["GARA",5.08134442268,-73.3600413939,1],["GGUE",9.24233233348,-74.7598650383,0],["IBAG",4.42804686944,-75.2147268927,1],["INIR",3.86620462598,-67.925825,0],["LETA",-4.21417871297,-69.9429704659,0],["MEDE",6.19945271862,-75.5788967446,1],["MOTE",8.7919649298,-75.8606695182,0],["NEVA",2.93729882773,-75.293031756,1],["OVEJ",9.52896883082,-75.2278116448,1],["PAMP",7.38417984216,-72.647789881,1],["PERA",4.79249988437,-75.689525746,1],["POPA",2.44311295242,-76.6012061689,1],["PSTO",1.2117091239,-77.277081704,1],["QUIB",5.69963675663,-76.6567310342,0],["RIOH",11.5132212447,-72.8696994634,0],["RUBI",3.79339848566,-71.4237639939,1],["SAMA",11.2252523256,-74.1870954093,1],["SINC",9.3156252954,-75.387688173,1],["SNSN",5.71507598997,-75.3083416948,1],["TUMA",1.82228889473,-78.7304128343,1],["TUNA",5.53133867641,-73.3638895198,1],["TUQU",1.09396848284,-77.6309812946,1],["VALL",10.4739640294,-73.2519602474,1],["VIVI",4.07467291029,-73.5839956674,1],["YOPA",5.32175994196,-72.3889941302,1],["ZARZ",4.39661682763,-76.0675782174,1],["SJNE",9.9567345712,-75.07499613,1],["SONE",9.72813056305,-75.5249396759,1],["AEP1",3.20017449824,-75.6411129909,1],["SILP",2.60757157242,-76.3731455081,1],["SUES",2.94471688767,-76.706855466,0],["EBPT",7.59181542271,-74.7914903193,1],["PULE",3.25373469428,-73.3953750934,0],["SOCB",5.99669226757,-72.6985243622,1],["BUEN",3.88202381051,-77.0104201471,1],["TARZ",7.57001146091,-75.4072540935,0],["BOGT",4.64007400033,-74.0809400002,1],["ABPW",4.68956906384,-73.9951145944,1],["ABCC",4.66123389698,-74.126921939,1],["LIPA",6.78789445523,-71.0252758281,1]];
const banco2 = [["AQTA",7.02503227256,-71.4069070726,1],["RSLA",5.04565368323,-70.7236414801,1],["AGAB",10.5849034668,-74.1893499941,1],["SUAN",10.3403774138,-74.8799420642,1],["SDTA",8.08345547769,-72.8022858448,1],["TIBU",8.631430658,-72.736101144,0],["TUMC",1.550874622,-78.697869587,1],["COLH",3.530816953,-74.718452628,1],["ZBNO",9.73532055579,-74.8350636113,1],["CMNI",9.201947,-73.531596,1],["PINI",8.914462,-74.458681,1],["NSRI",8.536864,-74.034979,1],["ARGL",2.288465,-77.240415,1],["PTIA",1.972752,-77.119639,1],["SARO",1.705623,-76.573034,1],["MGUI",1.763059,-78.180865,1],["CMBI",1.652002,-77.579536,1],["GVRE",2.571673619,-72.641220265,0]]
const lista = [...banco1, ...banco2]

for (cosa of lista){
    L.marker([cosa[1],cosa[2]]).addTo(map).bindPopup(cosa[0]);
}
const cardsDiv = document.querySelector('.cards')
let cardsDivs;

const geoBtn = document.querySelector('.geolocation')

/*const selectBtn = document.querySelector('.selectPoint')
selectBtn.addEventListener('click', clickOnMap)

const calcBtn = document.querySelector('.calc');
calcBtn.addEventListener('click', changeCoords);*/

let distancesTemps = []

function calcDistances(){
    circle80 = L.circle(actualLoc, {radius: 80000})
    map.addLayer(circle80)
    const radius = 6378; //6371
    for (cosa of lista){
        const dLat = toRadians(actualLoc[0] - cosa[1]);
        const dLong = toRadians(actualLoc[1] - cosa[2]);
        const a = Math.pow(Math.sin(dLat/2), 2) + Math.cos(toRadians(actualLoc[0])) * Math.cos(toRadians(cosa[1])) * Math.pow(Math.sin(dLong/2), 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = (radius * c).toFixed(3);

        distancesTemps.push([cosa[0], distance, cosa[3], timeGps(distance)])
    }
    distancesTemps.sort((a, b)=>{
        return a[1] - b[1]
    })

    printCards(distancesTemps)
}

function toRadians(value){
    const valueRad = (Math.PI * value)/180
    return valueRad
}

function printCards(lista){
    console.log(cardsDivs);
    if(cardsDivs != null){
        for (let j = 0; j < 80; j++) {
            cardsDivs.remove()
            cardsDivs = document.querySelector('.stationcard')
            console.log(j);
        }
    }
    let i = 0;
    for (cosa of lista){
        const stationParm = document.createElement('p');

        let active;
        if(lista[i][2] === 1) active = "Activa" 
        else active = "Inactiva" 
        stationParm.innerText = lista[i][1] + " km ," + active;

        const stationName = document.createElement('p');
        stationName.innerText = lista[i][0] + ": " + lista[i][3];


        const stationCard = document.createElement('div');
        stationCard.classList.add('stationcard')

        if(i===0 && lista[i][1] < 80 && lista[i][2] === 1){
            const stationTitle = document.createElement('h1');
            stationTitle.innerText = "La mejor opción"
            stationCard.append(stationTitle)
        }

        if(i > 0 && lista[i][1] < 80){
            const stationTitle = document.createElement('h2');
            stationTitle.innerText = "Dentro del área de rastreo"
            stationCard.append(stationTitle)
        }
        
        stationCard.append(stationParm)
        stationCard.append(stationName)
        cardsDiv.appendChild(stationCard)

        i++;
    }
    cardsDivs = document.querySelector('.stationcard')
}

function timeGps(distance){
    let temp = 65 + (3 * (distance - 10))
    if(temp >= 60){
        hrs = temp/60
        min = Math.round((hrs - parseInt(hrs)) * 60 + 1)
        temp = parseInt(hrs) + " horas y " + min + " minutos"
    } else {
        temp = Math.round(temp + 1) + " minutos"
    }
    return temp
}

geoBtn.addEventListener('click', getGeolocation);
function getGeolocation(){
    options = {
        enableHighAccuracy:true,
        timeout: 7000,
        maximumAge: 0
    }
    const succes = (position) => {
        actualLoc[0] = position.coords.latitude
        actualLoc[1] = position.coords.longitude

        let localizacion = L.marker(actualLoc).addTo(map);
        localizacion.bindPopup("Ubicación actual");

        console.log(position.coords.latitude);
        console.log(position.coords.longitude);

        calcDistances()
        map.flyTo([actualLoc[0], actualLoc[1]], 9)
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
    




