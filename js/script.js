console.log("Lets write javascript");
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  // Show all the song in playlist
  let songUL = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li data-song="${song}">
                  <img class="invert" src="image/music.svg" alt="">
                  <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                  </div>
                  <div class="playnow">
                    <span>Play Now</span>
                  <img class="invert" src="image/play.svg" alt="">
                </div>
                </li>`;
  }
  // Attach an event listener to each song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      const songFile = e.getAttribute("data-song");
      playMusic(songFile);
    });
  });
  return songs; // <-- Return the songs array
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "image/pause.svg";
  } else {
    play.src = "image/play.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};
async function main() {
  // // Make the song loop continuously
  // currentSong.loop = true;

  //Get the lists of all the songs
  await getSongs("songs/cs");
  playMusic(songs[0], true);

  //Attach an event listner to play next and previous song
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "image/pause.svg";
    } else {
      currentSong.pause();
      play.src = "image/play.svg";
    }

    // Play next song automatically when current ends
    currentSong.addEventListener("ended", () => {
      let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
      if (index + 1 < songs.length) {
        playMusic(songs[index + 1]);
      } else {
        // To loop playlist, uncomment the next line:
        // playMusic(songs[0]);
      }
    });
  });

  //Listen for time update event
  currentSong.addEventListener("timeupdate", () => {
    // Avoid NaN errors if duration is not loaded yet
    const duration = isNaN(currentSong.duration) ? 0 : currentSong.duration;
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )}/${secondsToMinutesSeconds(duration)}`;
    document.querySelector(".circle").style.left = duration
      ? (currentSong.currentTime / duration) * 100 + "%"
      : "0%";
  });

  //Add event listner to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  //Add an event listner to hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  //Add an event listner to close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  //Add an event listner to previous
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });
  //Add an event listner to next
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  //Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume > 0) {
        document.querySelector(".volume>img").src = document
          .querySelector(".volume>img")
          .src.replace("mute.svg", "volume.svg");
      }
    });

  //Load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      // Fixed typo: currentTargettarget -> currentTarget
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0], true); // Optionally auto-select first song
    });
  });

  //Add event listner to mute the volume
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 50;

      currentSong.volume = 0.1;
    }
  });
}
main();
