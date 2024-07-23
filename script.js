document.addEventListener('DOMContentLoaded', function () {
  const video = document.getElementById("videoInput");
  const score = document.getElementById("focusScore");

  const mean = (array = []) => array.reduce((acc, x) => acc + x, 0) / array.length;

  function variance(array) {
    const m = mean(array);
    return array.reduce((acc, el) => acc + Math.pow(el - m, 2), 0) / array.length;
  }

  function processVideo() {
    const src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    const gray_src = new cv.Mat(video.height, video.width, cv.CV_8UC1);
    const lap_gray = new cv.Mat(video.height, video.width, cv.CV_64F);
    const cap = new cv.VideoCapture(video);
    const FPS = 15;

    function captureAndProcessFrame() {
      const begin = Date.now();

      // Start processing.
      cap.read(src);

      // Convert to grayscale
      cv.cvtColor(src, gray_src, cv.COLOR_RGBA2GRAY);
      
      // Apply Laplacian
      cv.Laplacian(gray_src, lap_gray, cv.CV_64F);

      // Calculate focus measure
      const focusMeasure = Math.floor(variance(Array.from(lap_gray.data64F)));
      score.innerText = `Focus Score: ${focusMeasure}`;

      // Display processed frame
      cv.imshow("canvasOutput", lap_gray);

      // Check if the focus score is less than 3
      if (focusMeasure <= 3) {
        score.innerText += " - Image is blurred";
      }

      // Schedule the next frame processing
      const delay = 1000 / FPS - (Date.now() - begin);
      setTimeout(captureAndProcessFrame, Math.max(0, delay));
    }

    captureAndProcessFrame();
  }

  function openCvReady() {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => console.log("An error occurred! " + err));

    video.addEventListener("playing", processVideo);
  }

  // Ensure OpenCV is fully loaded before initializing
  if (typeof cv === "undefined") {
    document.getElementById('opencv').addEventListener('load', openCvReady);
  } else {
    cv['onRuntimeInitialized'] = openCvReady;
  }
});
