// ========================================
// MY VIDEO EDITOR - SCRIPT
// ========================================


// ========================================
// ELEMENTS
// ========================================

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

const trimBtn = document.getElementById("trimBtn");
const addTextBtn = document.getElementById("addText");
const saveProjectBtn = document.getElementById("saveProject");
const exportBtn = document.getElementById("exportBtn");


// ========================================
// DATA
// ========================================

let clips = [];

let musicFile = null;

let voiceFile = null;

let currentClip = null;


// ========================================
// STATUS
// ========================================

function showStatus(message) {
    status.textContent = message;
}


// ========================================
// ADD VIDEO
// ========================================

videoInput.addEventListener("change", function () {

    const files = Array.from(this.files);

    if (files.length === 0) {
        return;
    }

    files.forEach(function (file) {

        if (!file.type.startsWith("video/")) {
            return;
        }

        const videoURL = URL.createObjectURL(file);

        clips.push({

            file: file,

            url: videoURL,

            name: file.name,

            start: 0,

            end: null,

            speed: 1

        });

    });

    renderTimeline();

    // Automatically select the newest video

    if (clips.length > 0) {

        selectClip(clips.length - 1);

    }

    showStatus(
        `${files.length} video added successfully.`
    );

    // Allow selecting the same file again

    this.value = "";

});


// ========================================
// RENDER TIMELINE
// ========================================

function renderTimeline() {

    timeline.innerHTML = "";

    if (clips.length === 0) {

        timeline.innerHTML =
            "<p>No videos added yet.</p>";

        return;

    }


    clips.forEach(function (clip, index) {

        const box =
            document.createElement("div");

        box.className = "clip";


        box.innerHTML = `

            <video
                src="${clip.url}"
                muted
                preload="metadata"
            ></video>

            <div class="clip-name">
                ${index + 1}. ${escapeHTML(clip.name)}
            </div>

            <button
                onclick="selectClip(${index})"
            >
                ✏️ Edit
            </button>

            <button
                onclick="moveLeft(${index})"
            >
                ◀
            </button>

            <button
                onclick="moveRight(${index})"
            >
                ▶
            </button>

            <button
                onclick="deleteClip(${index})"
            >
                🗑️ Delete
            </button>

        `;


        timeline.appendChild(box);

    });

}


// ========================================
// ESCAPE TEXT
// ========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ========================================
// SELECT CLIP
// ========================================

function selectClip(index) {

    if (!clips[index]) {
        return;
    }


    currentClip = index;


    const clip =
        clips[index];


    // Show video

    previewVideo.src =
        clip.url;


    previewVideo.load();


    // Speed

    previewVideo.playbackRate =
        clip.speed || 1;


    // Metadata

    previewVideo.onloadedmetadata =
        function () {

            startTime.value =
                clip.start || 0;


            endTime.value =
                clip.end !== null
                    ? clip.end
                    : previewVideo.duration;

        };


    showStatus(
        `Editing video ${index + 1}`
    );

}


// ========================================
// MOVE LEFT
// ========================================

function moveLeft(index) {

    if (index <= 0) {
        return;
    }


    const temp =
        clips[index - 1];


    clips[index - 1] =
        clips[index];


    clips[index] =
        temp;


    renderTimeline();


    selectClip(index - 1);

}


// ========================================
// MOVE RIGHT
// ========================================

function moveRight(index) {

    if (index >= clips.length - 1) {
        return;
    }


    const temp =
        clips[index + 1];


    clips[index + 1] =
        clips[index];


    clips[index] =
        temp;


    renderTimeline();


    selectClip(index + 1);

}


// ========================================
// DELETE VIDEO
// ========================================

function deleteClip(index) {

    if (!clips[index]) {
        return;
    }


    URL.revokeObjectURL(
        clips[index].url
    );


    clips.splice(index, 1);


    renderTimeline();


    if (clips.length > 0) {

        const newIndex =
            Math.min(
                index,
                clips.length - 1
            );


        selectClip(newIndex);

    } else {

        currentClip = null;


        previewVideo.pause();

        previewVideo.removeAttribute(
            "src"
        );

        previewVideo.load();


        startTime.value = 0;

        endTime.value = 0;

    }


    showStatus(
        "Video deleted."
    );

}


// ========================================
// TRIM
// ========================================

trimBtn.addEventListener(
    "click",
    function () {

        if (currentClip === null) {

            showStatus(
                "पहले video select करो."
            );

            return;
        }


        const start =
            Number(startTime.value);


        const end =
            Number(endTime.value);


        if (
            !Number.isFinite(start) ||
            !Number.isFinite(end) ||
            start < 0 ||
            end <= start
        ) {

            showStatus(
                "❌ Start और End time सही डालो."
            );

            return;
        }


        const clip =
            clips[currentClip];


        clip.start =
            start;


        clip.end =
            end;


        showStatus(
            "✅ Trim settings saved."
        );

    }
);


// ========================================
// SPEED
// ========================================

speed.addEventListener(
    "change",
    function () {

        if (currentClip === null) {

            return;

        }


        const value =
            Number(this.value);


        clips[currentClip].speed =
            value;


        previewVideo.playbackRate =
            value;


        showStatus(
            `Speed: ${value}x`
        );

    }
);


// ========================================
// VIDEO RATIO
// ========================================

ratio.addEventListener(
    "change",
    function () {

        if (this.value === "9:16") {

            previewBox.classList.remove(
                "landscape"
            );

            previewBox.classList.add(
                "portrait"
            );

        } else {

            previewBox.classList.remove(
                "portrait"
            );

            previewBox.classList.add(
                "landscape"
            );

        }

    }
);


// ========================================
// TEXT / CAPTION
// ========================================

addTextBtn.addEventListener(
    "click",
    function () {

        const text =
            caption.value.trim();


        textOverlay.textContent =
            text;


        if (text) {

            showStatus(
                "📝 Caption added."
            );

        } else {

            showStatus(
                "Caption खाली है."
            );

        }

    }
);


// ========================================
// MUSIC
// ========================================

musicInput.addEventListener(
    "change",
    function () {

        if (!this.files.length) {
            return;
        }


        musicFile =
            this.files[0];


        showStatus(
            "🎵 Music added: " +
            musicFile.name
        );


        this.value = "";

    }
);


// ========================================
// VOICE OVER
// ========================================

voiceInput.addEventListener(
    "change",
    function () {

        if (!this.files.length) {
            return;
        }


        voiceFile =
            this.files[0];


        showStatus(
            "🎙️ Voice-over added: " +
            voiceFile.name
        );


        this.value = "";

    }
);


// ========================================
// SAVE PROJECT
// ========================================

saveProjectBtn.addEventListener(
    "click",
    function () {

        const project = {

            ratio: ratio.value,

            caption: caption.value,

            clips: clips.map(
                function (clip) {

                    return {

                        name: clip.name,

                        start: clip.start,

                        end: clip.end,

                        speed: clip.speed

                    };

                }
            )

        };


        localStorage.setItem(
            "myVideoEditorProject",
            JSON.stringify(project)
        );


        showStatus(
            "💾 Project settings saved."
        );

    }
);


// ========================================
// EXPORT
// ========================================

exportBtn.addEventListener(
    "click",
    function () {

        if (clips.length === 0) {

            showStatus(
                "❌ पहले video add करो."
            );

            return;
        }


        showStatus(
            "⚠️ Export engine अभी नहीं जोड़ा गया है."
        );

    }
);


// ========================================
// INITIAL STATE
// ========================================

renderTimeline();

showStatus(
    "Ready — Add Video करके शुरू करो."
);
