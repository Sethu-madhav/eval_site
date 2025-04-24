/* === Configuration === */
// ✂ remove your old static list:
// const IMAGE_PATH = "images/";
// const FILENAME_LIST = [ /* … */ ];
// const TOTAL_IMAGES  = FILENAME_LIST.length;

// ✂ instead, track a dynamic array from the file-picker:
let filesArray    = [];
let TOTAL_IMAGES  = 0;

/* === Internal state === */
let currentIndex = 0;
const results    = [];

/* === Utility functions === */
const updateProgress = () => {
  const progress = document.getElementById("progress");
  progress.textContent =
    TOTAL_IMAGES === 0
      ? "No folder selected"
      : `Image ${Math.min(currentIndex + 1, TOTAL_IMAGES)} of ${TOTAL_IMAGES}`;
};

const updateImage = () => {
  // nothing to show until user picks a folder
  if (filesArray.length === 0) return;

  if (currentIndex >= TOTAL_IMAGES) {
    // All done – clean up UI
    document.getElementById("image").style.display       = "none";
    document.querySelector(".btn-group").style.display   = "none";
    document.getElementById("progress").textContent      = "All images classified ✔";
    return;
  }

  const imgEl = document.getElementById("image");
  // create a blob URL for the chosen file
  const file = filesArray[currentIndex];
  imgEl.src = URL.createObjectURL(file);

  updateProgress();
};

/* === Init – now waits for folder selection === */
window.addEventListener("DOMContentLoaded", () => {
  // no-op until user picks a folder
});

/* === Folder upload handling === */
document.getElementById("folderInput").addEventListener("change", (e) => {
  // grab only image files, sort by name
  filesArray = Array.from(e.target.files)
    .filter((f) => f.type.startsWith("image/"))
    .sort((a, b) => a.name.localeCompare(b.name));

  TOTAL_IMAGES = filesArray.length;
  currentIndex = 0;
  results.length = 0;            // clear old results

  // show image + buttons now that we have data
  document.getElementById("image").style.display = "";
  document.querySelector(".btn-group").style.display = "";

  updateImage();
});

/* === Classification clicks === */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-label]");
  if (!btn || filesArray.length === 0) return;

  const label    = btn.dataset.label;
  const filename = filesArray[currentIndex].name; // take real name
  results.push({ filename, label });

  currentIndex += 1;
  updateImage();
});

/* === CSV download === */
document.getElementById("downloadBtn").addEventListener("click", () => {
  if (results.length === 0) {
    alert("No classifications yet!");
    return;
  }

  // Build CSV with separate columns for each label category
  const header = "image,real_photo,edited_photo,AI_generated\n";
  const rows = results.map((r) => {
    const real = r.label === "real_photo"      ? "Yes" : "No";
    const edited = r.label === "edited_photo"  ? "Yes" : "No";
    const aiGen = r.label === "AI_generated"   ? "Yes" : "No";
    return `${r.filename},${real},${edited},${aiGen}`;
  }).join("\n");
  const csvContent = header + rows;

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "classification_results.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
});