const videoInput = document.getElementById("videoInput");
const musicInput = document.getElementById("musicInput");
const voiceInput = document.getElementById("voiceInput");

const timeline = document.getElementById("timeline");
const previewVideo = document.getElementById("previewVideo");
const previewBox = document.getElementById("previewBox");

const ratio = document.getElementById("ratio");
const speed = document.getElementById("speed");

const startTime = document.getElementById("startTime");
const endTime = document.getElementById("endTime");

const caption = document.getElementById("caption");
const textOverlay = document.getElementById("textOverlay");

const status = document.getElementById("status");

let clips = [];
let musicFile = null;
let voiceFile = null;
let currentClip = null;


// =============================
// ADD VIDEO
// =============================

videoInput.addEventListener("change", function () {

  const files = Array.from(this.files);

  files.forEach(function (file) {

    if (!file.type.startsWith("video/")) {
      return;
    }

    const clip = {
      file: file,
      url: URL.createObjectURL(file),
      start: 0,
      end: null,
      speed: 1
    };

    clips.push(clip);

  });

  renderTimeline();

  if (clips.length > 0) {
    selectClip(clips.length - files.length);
  }

  videoInput.value = "";

});


// =============================
// TIMELINE
// =============================

function renderTimeline() {

  timeline.innerHTML = "";

  if (clips.length === 0) {

    timeline.innerHTML =
      "<p>No videos added yet.</p>";

    return;
  }

  clips.forEach(function (clip, index) {

    const div = document.createElement("div");

    div.className = "clip";

    div.innerHTML = `
      <video src="${clip.url}" muted></video>

      <div class="clip-name">
        ${index + 1}. ${clip.file.name}
      </div>

      <button onclick="selectClip(${index})">
        ✏️ Edit
      </button>

      <button onclick="moveLeft(${index})">
        ◀
      </button>

      <button onclick="moveRight(${index})">
        ▶
      </button>

      <button onclick="deleteClip(${index})">
        🗑️ Delete
      </button>
    `;

    timeline.appendChild(div);

  });

}


// =============================
// SELECT VIDEO
// =============================

function selectClip(index) {

  if (!clips[index]) return;

  currentClip = index;

  const clip = clips[index];

  previewVideo.src = clip.url;

  previewVideo.playbackRate = clip.speed;

  previewVideo.onloadedmetadata = function () {

    startTime.value = clip.start || 0;

    endTime.value =
      clip.end !== null
        ? clip.end
        : previewVideo.duration;

  };

}


// =============================
// MOVE LEFT
// =============================

function moveLeft(index) {

  if (index <= 0) return;

  const temp = clips[index - 1];

  clips[index - 1] = clips[index];
  clips[index] = temp;

  renderTimeline();

  selectClip(index - 1);
}


// =============================
// MOVE RIGHT
// =============================

function moveRight(index) {

  if (index >= clips.length - 1) return;

  const temp = clips[index + 1];

  clips[index + 1] = clips[index];
  clips[index] = temp;

  renderTimeline();

  selectClip(index + 1);
}


// =============================
// DELETE
// =============================

function deleteClip(index) {

  if (!clips[index]) return;

  URL.revokeObjectURL(clips[index].url);

  clips.splice(index, 1);

  renderTimeline();

  if (clips.length > 0) {

    const newIndex =
      Math.min(index, clips.length - 1);

    selectClip(newIndex);

  } else {

    currentClip = null;

    previewVideo.removeAttribute("src");
    previewVideo.load();

  }

}


// =============================
// TRIM
// =============================

document.getElementById("trimBtn")
.addEventListener("click", function () {

  if (currentClip === null) {

    status.textContent =
      "पहले कोई video select करो.";

    return;
  }

  const start = Number(startTime.value);
  const end = Number(endTime.value);

  if (start < 0 || end <= start) {

    status.textContent =
      "Start और End time सही डालो.";

    return;
  }

  clips[currentClip].start = start;
  clips[currentClip].end = end;

  status.textContent =
    "✅ Trim settings saved.";

});


// =============================
// SPEED
// =============================

speed.addEventListener("change", function () {

  if (currentClip === null) return;

  const value = Number(this.value);

  clips[currentClip].speed = value;

  previewVideo.playbackRate = value;

  status.textContent =
    "⏩ Speed changed to " + value + "x";

});


// =============================
// RATIO
// =============================

ratio.addEventListener("change", function () {

  if (this.value === "9:16") {

    previewBox.classList.remove("landscape");
    previewBox.classList.add("portrait");

  } else {

    previewBox.classList.remove("portrait");
    previewBox.classList.add("landscape");

  }

});


// =============================
// TEXT / CAPTION
// =============================

document.getElementById("addText")
.addEventListener("click", function () {

  textOverlay.textContent =
    caption.value;

});


// =============================
// MUSIC
// =============================

musicInput.addEventListener("change", function () {

  musicFile = this.files[0];

  if (musicFile) {

    status.textContent =
      "🎵 Music added: " +
      musicFile.name;

  }

});


// =============================
// VOICE OVER
// =============================

voiceInput.addEventListener("change", function () {

  voiceFile = this.files[0];

  if (voiceFile) {

    status.textContent =
      "🎙️ Voice-over added: " +
      voiceFile.name;

  }

});


// =============================
// SAVE PROJECT SETTINGS
// =============================

document.getElementById("saveProject")
.addEventListener("click", function () {

  const project = {

    ratio: ratio.value,

    clips: clips.map(function (clip) {

      return {
        name: clip.file.name,
        start: clip.start,
        end: clip.end,
        speed: clip.speed
      };

    }),

    caption: caption.value

  };

  localStorage.setItem(
    "myVideoEditorProject",
    JSON.stringify(project)
  );

  status.textContent =
    "💾 Project settings saved.";

});


// =============================
// EXPORT
// =============================

document.getElementById("exportBtn")
.addEventListener("click", function () {

  if (clips.length === 0) {

    status.textContent =
      "पहले video add करो.";

    return;
  }

  status.textContent =
    "⚠️ Export engine अभी अगला step है.";

});
