// ========================================
// MY VIDEO EDITOR - SCRIPT + EXPORT ENGINE
// ========================================

// ELEMENTS
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

// DATA
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

    if (files.length === 0) return;

    let added = 0;

    files.forEach(function (file) {

        if (!file.type.startsWith("video/")) return;

        const videoURL = URL.createObjectURL(file);

        clips.push({
            file: file,
            url: videoURL,
            name: file.name,
            start: 0,
            end: null,
            speed: 1
        });

        added++;
    });

    renderTimeline();

    if (clips.length > 0) {
        selectClip(clips.length - 1);
    }

    showStatus(`✅ ${added} video added successfully.`);

    this.value = "";
});


// ========================================
// TIMELINE
// ========================================

function renderTimeline() {

    timeline.innerHTML = "";

    if (clips.length === 0) {
        timeline.innerHTML = "<p>No videos added yet.</p>";
        return;
    }

    clips.forEach(function (clip, index) {

        const box = document.createElement("div");

        box.className = "clip";

        box.innerHTML = `
            <video
                src="${clip.url}"
                muted
                preload="metadata">
            </video>

            <div class="clip-name">
                ${index + 1}. ${escapeHTML(clip.name)}
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

        timeline.appendChild(box);
    });
}


// ========================================
// SECURITY
// ========================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ========================================
// SELECT CLIP
// ========================================

function selectClip(index) {

    if (!clips[index]) return;

    currentClip = index;

    const clip = clips[index];

    previewVideo.src = clip.url;

    previewVideo.load();

    previewVideo.playbackRate = clip.speed || 1;

    previewVideo.onloadedmetadata = function () {

        startTime.value = clip.start || 0;

        endTime.value =
            clip.end !== null
                ? clip.end
                : previewVideo.duration;
    };

    showStatus(`Editing video ${index + 1}`);
}


// ========================================
// MOVE LEFT
// ========================================

function moveLeft(index) {

    if (index <= 0) return;

    const temp = clips[index - 1];

    clips[index - 1] = clips[index];

    clips[index] = temp;

    renderTimeline();

    selectClip(index - 1);
}


// ========================================
// MOVE RIGHT
// ========================================

function moveRight(index) {

    if (index >= clips.length - 1) return;

    const temp = clips[index + 1];

    clips[index + 1] = clips[index];

    clips[index] = temp;

    renderTimeline();

    selectClip(index + 1);
}


// ========================================
// DELETE
// ========================================

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

        previewVideo.pause();

        previewVideo.removeAttribute("src");

        previewVideo.load();

        startTime.value = 0;

        endTime.value = 0;
    }

    showStatus("🗑️ Video deleted.");
}


// ========================================
// TRIM
// ========================================

trimBtn.addEventListener("click", function () {

    if (currentClip === null) {

        showStatus("पहले video select करो.");

        return;
    }

    const start = Number(startTime.value);

    const end = Number(endTime.value);

    if (
        !Number.isFinite(start) ||
        !Number.isFinite(end) ||
        start < 0 ||
        end <= start
    ) {

        showStatus("❌ Start और End time सही डालो.");

        return;
    }

    const clip = clips[currentClip];

    clip.start = start;

    clip.end = end;

    showStatus("✅ Trim settings saved.");
});


// ========================================
// SPEED
// ========================================

speed.addEventListener("change", function () {

    if (currentClip === null) return;

    const value = Number(this.value);

    clips[currentClip].speed = value;

    previewVideo.playbackRate = value;

    showStatus(`Speed: ${value}x`);
});


// ========================================
// RATIO
// ========================================

ratio.addEventListener("change", function () {

    if (this.value === "9:16") {

        previewBox.classList.remove("landscape");

        previewBox.classList.add("portrait");

    } else {

        previewBox.classList.remove("portrait");

        previewBox.classList.add("landscape");
    }
});


// ========================================
// TEXT
// ========================================

addTextBtn.addEventListener("click", function () {

    const text = caption.value.trim();

    textOverlay.textContent = text;

    if (text) {

        showStatus("📝 Caption added.");

    } else {

        showStatus("Caption खाली है.");
    }
});


// ========================================
// MUSIC
// ========================================

musicInput.addEventListener("change", function () {

    if (!this.files.length) return;

    musicFile = this.files[0];

    showStatus(
        "🎵 Music added: " + musicFile.name
    );

    this.value = "";
});


// ========================================
// VOICE
// ========================================

voiceInput.addEventListener("change", function () {

    if (!this.files.length) return;

    voiceFile = this.files[0];

    showStatus(
        "🎙️ Voice-over added: " + voiceFile.name
    );

    this.value = "";
});


// ========================================
// SAVE PROJECT
// ========================================

saveProjectBtn.addEventListener("click", function () {

    const project = {

        ratio: ratio.value,

        caption: caption.value,

        clips: clips.map(function (clip) {

            return {

                name: clip.name,

                start: clip.start,

                end: clip.end,

                speed: clip.speed
            };
        })
    };

    localStorage.setItem(
        "myVideoEditorProject",
        JSON.stringify(project)
    );

    showStatus("💾 Project settings saved.");
});


// ========================================
// EXPORT ENGINE
// ========================================

exportBtn.addEventListener("click", async function () {

    if (clips.length === 0) {

        showStatus("❌ पहले video add करो.");

        return;
    }

    if (!window.MediaRecorder) {

        showStatus(
            "❌ इस browser में video export supported नहीं है."
        );

        return;
    }

    try {

        exportBtn.disabled = true;

        exportBtn.textContent = "⏳ Exporting...";

        showStatus(
            "⏳ सभी videos को एक साथ export किया जा रहा है..."
        );

        const resultBlob =
            await createMergedVideo();

        showExportPreview(resultBlob);

        showStatus(
            "✅ Export complete! Preview से video download कर सकते हो."
        );

    } catch (error) {

        console.error(error);

        showStatus(
            "❌ Export में error आया: " + error.message
        );

    } finally {

        exportBtn.disabled = false;

        exportBtn.textContent =
            "⬇️ Export Video";
    }
});


// ========================================
// CREATE MERGED VIDEO
// ========================================

async function createMergedVideo() {

    const isPortrait =
        ratio.value === "9:16";

    const canvas =
        document.createElement("canvas");

    if (isPortrait) {

        canvas.width = 1080;

        canvas.height = 1920;

    } else {

        canvas.width = 1920;

        canvas.height = 1080;
    }

    const ctx =
        canvas.getContext("2d");

    ctx.fillStyle = "black";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const canvasStream =
        canvas.captureStream(30);

    let audioContext = null;

    let audioDestination = null;

    let audioSource = null;

    try {

        audioContext =
            new AudioContext();

        audioDestination =
            audioContext.createMediaStreamDestination();

        audioSource =
            audioContext.createMediaElementSource(
                previewVideo
            );

        audioSource.connect(
            audioDestination
        );

        audioSource.connect(
            audioContext.destination
        );

        const combinedStream =
            new MediaStream();

        canvasStream
            .getVideoTracks()
            .forEach(function (track) {

                combinedStream.addTrack(track);
            });

        audioDestination.stream
            .getAudioTracks()
            .forEach(function (track) {

                combinedStream.addTrack(track);
            });

        const recorder =
            new MediaRecorder(
                combinedStream,
                {
                    mimeType:
                        getSupportedMimeType(),
                    videoBitsPerSecond:
                        8000000
                }
            );

        const chunks = [];

        recorder.ondataavailable =
            function (event) {

                if (event.data.size > 0) {

                    chunks.push(event.data);
                }
            };

        const recorderPromise =
            new Promise(function (resolve, reject) {

                recorder.onstop =
                    function () {

                        resolve(
                            new Blob(
                                chunks,
                                {
                                    type: recorder.mimeType
                                }
                            )
                        );
                    };

                recorder.onerror =
                    function (event) {

                        reject(
                            event.error ||
                            new Error(
                                "Recorder error"
                            )
                        );
                    };
            });

        recorder.start(1000);

        // PLAY EVERY CLIP
        for (
            let i = 0;
            i < clips.length;
            i++
        ) {

            const clip = clips[i];

            showStatus(
                `⏳ Exporting video ${i + 1} / ${clips.length}...`
            );

            await playClipToCanvas(
                clip,
                previewVideo,
                ctx,
                canvas
            );
        }

        recorder.stop();

        const blob =
            await recorderPromise;

        return blob;

    } finally {

        if (audioContext) {

            try {

                await audioContext.close();

            } catch (e) {}
        }
    }
}


// ========================================
// PLAY CLIP + DRAW ON CANVAS
// ========================================

function playClipToCanvas(
    clip,
    video,
    ctx,
    canvas
) {

    return new Promise(function (resolve, reject) {

        video.pause();

        video.src = clip.url;

        video.load();

        video.playbackRate =
            clip.speed || 1;

        video.onloadedmetadata =
            async function () {

                try {

                    const start =
                        Math.max(
                            0,
                            Number(clip.start) || 0
                        );

                    const end =
                        clip.end !== null
                            ? Number(clip.end)
                            : video.duration;

                    video.currentTime = start;

                    await waitForSeek(video);

                    await video.play();

                    function drawFrame() {

                        if (
                            video.paused ||
                            video.ended ||
                            video.currentTime >= end
                        ) {

                            video.pause();

                            resolve();

                            return;
                        }

                        drawVideoCover(
                            ctx,
                            video,
                            canvas
                        );

                        requestAnimationFrame(
                            drawFrame
                        );
                    }

                    drawFrame();

                } catch (error) {

                    reject(error);
                }
            };

        video.onerror = function () {

            reject(
                new Error(
                    "Video load नहीं हो पाई: " +
                    clip.name
                )
            );
        };
    });
}


// ========================================
// SEEK HELPER
// ========================================

function waitForSeek(video) {

    return new Promise(function (resolve) {

        if (!video.seeking) {

            resolve();

            return;
        }

        video.addEventListener(
            "seeked",
            resolve,
            { once: true }
        );
    });
}


// ========================================
// DRAW VIDEO
// ========================================

function drawVideoCover(
    ctx,
    video,
    canvas
) {

    const vw = video.videoWidth;

    const vh = video.videoHeight;

    const cw = canvas.width;

    const ch = canvas.height;

    if (!vw || !vh) return;

    const videoRatio =
        vw / vh;

    const canvasRatio =
        cw / ch;

    let drawWidth;

    let drawHeight;

    let x;

    let y;

    if (videoRatio > canvasRatio) {

        drawHeight = ch;

        drawWidth =
            ch * videoRatio;

        x =
            (cw - drawWidth) / 2;

        y = 0;

    } else {

        drawWidth = cw;

        drawHeight =
            cw / videoRatio;

        x = 0;

        y =
            (ch - drawHeight) / 2;
    }

    ctx.fillStyle = "black";

    ctx.fillRect(
        0,
        0,
        cw,
        ch
    );

    ctx.drawImage(
        video,
        x,
        y,
        drawWidth,
        drawHeight
    );

    // TEXT OVERLAY
    if (caption.value.trim()) {

        ctx.font =
            "bold 60px Arial";

        ctx.textAlign = "center";

        ctx.textBaseline = "bottom";

        ctx.fillStyle = "white";

        ctx.strokeStyle = "black";

        ctx.lineWidth = 8;

        const text =
            caption.value.trim();

        ctx.strokeText(
            text,
            cw / 2,
            ch - 80
        );

        ctx.fillText(
            text,
            cw / 2,
            ch - 80
        );
    }
}


// ========================================
// MIME TYPE
// ========================================

function getSupportedMimeType() {

    const types = [

        "video/webm;codecs=vp9,opus",

        "video/webm;codecs=vp8,opus",

        "video/webm"
    ];

    for (const type of types) {

        if (
            MediaRecorder.isTypeSupported(
                type
            )
        ) {

            return type;
        }
    }

    return "";
}


// ========================================
// EXPORT PREVIEW + DOWNLOAD
// ========================================

function showExportPreview(blob) {

    const old =
        document.getElementById(
            "exportResult"
        );

    if (old) old.remove();

    const url =
        URL.createObjectURL(blob);

    const box =
        document.createElement("div");

    box.id = "exportResult";

    box.style.marginTop = "25px";

    box.style.padding = "20px";

    box.style.borderRadius = "12px";

    box.style.background = "#222";

    box.innerHTML = `

        <h2>🎬 Export Complete</h2>

        <p>पूरी merged video तैयार है:</p>

        <video
            id="exportPreviewVideo"
            controls
            playsinline
            style="
                width:100%;
                max-width:900px;
                display:block;
                margin:15px auto;
                border-radius:10px;
                background:#000;
            "
        ></video>

        <div style="text-align:center;">

            <button
                id="downloadExport"
                style="
                    padding:12px 22px;
                    font-size:16px;
                    cursor:pointer;
                "
            >
                ⬇️ Download Video
            </button>

        </div>
    `;

    exportBtn.parentElement.appendChild(box);

    const preview =
        document.getElementById(
            "exportPreviewVideo"
        );

    preview.src = url;

    const download =
        document.getElementById(
            "downloadExport"
        );

    download.addEventListener(
        "click",
        function () {

            const a =
                document.createElement("a");

            a.href = url;

            a.download =
                "my-video-export.webm";

            document.body.appendChild(a);

            a.click();

            a.remove();

            showStatus(
                "⬇️ Download शुरू हो गया."
            );
        }
    );
}


// ========================================
// INITIAL
// ========================================

renderTimeline();

showStatus(
    "Ready — Add Video करके शुरू करो."
);
