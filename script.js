// =============================
// ELEMENTS
// =============================

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


// =============================
// VARIABLES
// =============================

let clips = [];
let musicFile = null;
let voiceFile = null;
let currentClip = null;

let ffmpeg = null;
let ffmpegLoaded = false;


// =============================
// ADD VIDEO
// =============================

videoInput.addEventListener("change", function () {

  const files = Array.from(this.files);

  files.forEach(function (file) {

    if (!file.type.startsWith("video/")) {
      return;
    }

    clips.push({
      file: file,
      url: URL.createObjectURL(file),
      start: 0,
      end: null,
      speed: 1
    });

  });

  renderTimeline();

  if (clips.length > 0) {
    selectClip(clips.length - 1);
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
// SELECT CLIP
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

  [clips[index - 1], clips[index]] =
    [clips[index], clips[index - 1]];

  renderTimeline();

  selectClip(index - 1);
}


// =============================
// MOVE RIGHT
// =============================

function moveRight(index) {

  if (index >= clips.length - 1) return;

  [clips[index + 1], clips[index]] =
    [clips[index], clips[index + 1]];

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

    selectClip(
      Math.min(index, clips.length - 1)
    );

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
      "पहले video select करो.";

    return;
  }

  const start = Number(startTime.value);
  const end = Number(endTime.value);

  if (start < 0 || end <= start) {

    status.textContent =
      "❌ Start और End सही डालो.";

    return;
  }

  clips[currentClip].start = start;
  clips[currentClip].end = end;

  status.textContent =
    "✅ Trim saved.";
});


// =============================
// SPEED
// =============================

speed.addEventListener("change", function () {

  if (currentClip === null) return;

  const value = Number(this.value);

  clips[currentClip].speed = value;

  previewVideo.playbackRate = value;
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
// TEXT
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
      "🎵 Music added: " + musicFile.name;
  }
});


// =============================
// VOICE
// =============================

voiceInput.addEventListener("change", function () {

  voiceFile = this.files[0];

  if (voiceFile) {

    status.textContent =
      "🎙️ Voice-over added: " + voiceFile.name;
  }
});


// =============================
// SAVE PROJECT
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
// LOAD FFMPEG
// =============================

async function loadFFmpeg() {

  if (ffmpegLoaded) return;

  if (
    typeof FFmpegWASM === "undefined" ||
    typeof FFmpegUtil === "undefined"
  ) {

    throw new Error(
      "FFmpeg library load नहीं हुई."
    );
  }

  ffmpeg =
    new FFmpegWASM.FFmpeg();

  status.textContent =
    "⏳ Export engine loading...";

  const baseURL =
    "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";

  await ffmpeg.load({

    coreURL:
      baseURL + "/ffmpeg-core.js",

    wasmURL:
      baseURL + "/ffmpeg-core.wasm"

  });

  ffmpegLoaded = true;

  status.textContent =
    "✅ Export engine ready.";
}


// =============================
// EXPORT ALL CLIPS
// =============================

document.getElementById("exportBtn")
.addEventListener("click", async function () {

  if (clips.length === 0) {

    status.textContent =
      "❌ पहले videos add करो.";

    return;
  }

  try {

    this.disabled = true;

    await loadFFmpeg();

    status.textContent =
      "🎬 Videos तैयार हो रही हैं...";


    // Upload clips into FFmpeg

    for (let i = 0; i < clips.length; i++) {

      status.textContent =
        `⏳ Video ${i + 1}/${clips.length} loading...`;

      const data =
        await FFmpegUtil.fetchFile(
          clips[i].file
        );

      await ffmpeg.writeFile(
        `input${i}.mp4`,
        data
      );
    }


    // Create list

    let list = "";

    for (let i = 0; i < clips.length; i++) {

      list += `file 'input${i}.mp4'\n`;
    }

    await ffmpeg.writeFile(
      "list.txt",
      list
    );


    // Merge

    status.textContent =
      "🔗 Clips जोड़ी जा रही हैं...";


    await ffmpeg.exec([

      "-f",
      "concat",

      "-safe",
      "0",

      "-i",
      "list.txt",

      "-c",
      "copy",

      "final.mp4"

    ]);


    // Read output

    status.textContent =
      "📦 Final video तैयार हो रही है...";


    const output =
      await ffmpeg.readFile(
        "final.mp4"
      );


    const blob =
      new Blob(
        [output.buffer],
        {
          type: "video/mp4"
        }
      );


    const downloadURL =
      URL.createObjectURL(blob);


    // Download

    const link =
      document.createElement("a");

    link.href =
      downloadURL;

    link.download =
      "My-Final-Video.mp4";

    document.body.appendChild(link);

    link.click();

    link.remove();


    setTimeout(function () {

      URL.revokeObjectURL(
        downloadURL
      );

    }, 60000);


    status.textContent =
      "✅ Download शुरू हो गया!";

  } catch (error) {

    console.error(error);

    status.textContent =
      "❌ Export failed: " +
      error.message;

  } finally {

    this.disabled = false;
  }

});
