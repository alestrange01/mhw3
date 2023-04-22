const spotify_search = "https://api.spotify.com/v1/search";
const spotify_album = "https://api.spotify.com/v1/albums/"
const limit = 10;
const musixmatch_key = 'f1c58e61bc2daf8979cef74619be2f51';
const musixmatch_search = 'http://api.musixmatch.com/ws/1.1/track.search';
const musixmatch_lyric = 'http://api.musixmatch.com/ws/1.1/track.lyrics.get';
const translation_key = "API con una mia carta prepagata";
const translate_search = "https://api-free.deepl.com/v2/translate";

function onJsonTranslation(json){
    console.log("JSON Translation ricevuto");
    console.log(json);

    if(json === undefined) 
        return;

    const lyric = document.querySelector("#lyric");
    const translation = document.querySelector("#translation");
    if(lyric.textContent === "Nessun lyric trovato."){
        translation.textContent = "No lyrics found."
    }
    else{
        translation.textContent =  json.translations[0].text;
    }

}

function onJsonLyric(json){
    console.log('JSON Lyric ricevuto');
    console.log(json);

    
    const lyric = document.querySelector("#lyric");
    const lyrics_body = json.message.body.lyrics.lyrics_body;
    lyric.textContent = lyrics_body.substring(0,lyrics_body.length -70);
    const text = lyric.textContent;
    // translation.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum ex placeat ullam similique explicabo voluptas consectetur sequi quae quos repellendus error ab ea accusamus nam, ad nobis quidem illum animi.Veniam dicta dolor doloremque quo molestiae, cupiditate nostrum libero. Consequatur quo hic eaque vel dignissimos. Aliquid atque molestiae labore quas nostrum, vero recusandae placeat. Et dignissimos aspernatur quae ea omnis.Adipisci harum assumenda explicabo"



    //DA LEVARE IL COMMENTO A FINE SISTEMAZIONI: 500.000 gratuiti, non di più
    const formattedText = encodeURIComponent(text);
    const request = translate_search + '?text='+formattedText + '&target_lang=EN';
    fetch(request,{
        method: "POST",
        headers:{
            'Content-Type': 'application/x-www-form-urlencoded',    
            'Authorization': 'DeepL-Auth-Key ' + translation_key,
        }}).then(onResponse).then(onJsonTranslation);
    

}


function onJsonTrackID(json){
    console.log('JSON TrackID ricevuto');
    console.log(json);

    const track_id = json.message.body.track_list[0].track.track_id;
    // console.log(track_id);

    if(json.message.body.track_list[0].track.has_lyrics !== 0){
        const lyric_request = musixmatch_lyric + "?track_id="+track_id+ '&apikey='+musixmatch_key;
        fetch(lyric_request).then(onResponse).then(onJsonLyric);
    }
    else {
        const lyric = document.querySelector("#lyric");
        lyric.textContent = "Nessun lyric trovato.";
        translation.textContent = "No lyrics found."
    }

}


function onJsonTrack(json) {
    console.log('JSON Track ricevuto');
    console.log(json);

    album_view.innerHTML = '';
    const tracks = json.tracks.items;
    for (const track of tracks) {
        const song_name = track.name;
        const album = track.album;
        const titolo = album.name;
        const artista = track.artists[0].name;
        const image = album.images[1].url;


        const copertina = document.createElement('div');
        copertina.classList.add('album');
        const img = document.createElement('img');
        img.src = image;
        img.dataset.artist = artista;
        img.dataset.songName = song_name;
        // console.log(img.dataset.songName);
        img.addEventListener('click', apriCanzone);
        const testo = document.createElement('span');
        testo.textContent = '"'+song_name+'"' + ' di ' + artista + ' da ' + titolo;
        copertina.appendChild(img);
        copertina.appendChild(testo);
        album_view.appendChild(copertina);
        }
  }
  
function onResponse(response) {
    // console.log(response);
    if(!response.ok){
        console.log('API key Translate non valida: contattare ale_strange01');
        const translation = document.querySelector("#translation");
        translation.textContent = "API key Translate non valida: contattare ale_strange01";
    }
    else{
        console.log('Risposta ricevuta');
        return response.json();
    }
    
  }


function search(event)
{
  event.preventDefault();

  const content = document.querySelector('#content').value;


    if(content) {
        const song_input = document.querySelector('#content');
        const song_value = encodeURIComponent(song_input.value);
        console.log('Eseguo ricerca: ' + song_value);
        fetch(spotify_search + "?type=track&q=" + song_value + "&limit=" +limit ,{
            headers:{
                'Authorization': 'Bearer ' + token
            }}).then(onResponse).then(onJsonTrack);
    }
    else {
        alert("Inserisci il titolo della canzone per cui effettuare la ricerca");
    }
}



function onTokenJson(json){
  token = json.access_token;
}

function onTokenResponse(response){
  return response.json();
}


function onHome(event){
    event.stopPropagation();
    search_content.classList.remove('hidden');
    canzone.classList.add('hidden');

    album_view.classList.remove('hidden');
    album_view.innerHTML = '';

    const input = document.querySelector('#content');
    input.value = "";
    
}

function onBack(event){
    event.stopPropagation();
    search_content.classList.remove('hidden');
    album_view.classList.remove('hidden');
    canzone.classList.add('hidden');

}

function apriCanzone(event) {
    canzone.innerHTML='';
    canzone.classList.remove('hidden');
    
	const image = document.createElement('img');
	image.id = 'immagine_post';
    img = event.currentTarget;
	image.src = img.src;
    image.dataset.artist, artist = img.dataset.artist;
    image.dataset.songName, songName = img.dataset.songName;

    const home = document.createElement("button");
    home.textContent = "Home";
    home.addEventListener("click", onHome);
    const back = document.createElement("button");
    back.textContent = "Back"
    back.addEventListener("click", onBack);


    
    const sopra = document.createElement("div");
    sopra.id = "sopra";
    
    const title = document.createElement('h1');
    title.textContent = songName + " di " + artist;

    sopra.appendChild(home);
    sopra.appendChild(title);
    sopra.appendChild(back);


    const testi = document.createElement('div');
    testi.id = 'testi';
    const lyric = document.createElement('span');
    lyric.id = 'lyric';
    const translation = document.createElement('span');
    translation.id = 'translation';

    const lyric_request = musixmatch_search + '?apikey='+musixmatch_key+'&q_track='+songName+'&q_artist='+artist;
    fetch(lyric_request).then(onResponse).then(onJsonTrackID);

    testi.appendChild(lyric);
    testi.appendChild(translation);
    canzone.appendChild(sopra);
    canzone.appendChild(image);
    canzone.appendChild(testi);


    search_content.classList.add('hidden');
    album_view.classList.add('hidden');

}


const client_id = '1a8bb20791324f91866e89ef22e9a183';
const client_secret = '823c3c1763d14a76b23aa1d513f763ee';

let token;
fetch("https://accounts.spotify.com/api/token",
	{
   method: "post",
   body: 'grant_type=client_credentials',
   headers:
   {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret)
   }
  }
).then(onTokenResponse).then(onTokenJson);


const form = document.querySelector('#search_content');
form.addEventListener('submit', search);

const modale = document.querySelector('#modale');
// modale.addEventListener("click", chiudiModaleClick);
// window.addEventListener('keydown', chiudiModale);

const album_view = document.querySelector("#album_view"); 
const search_content = document.querySelector("#search_content"); 
const canzone = document.querySelector("#canzone"); 

