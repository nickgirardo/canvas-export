import { createFFmpeg } from '@ffmpeg/ffmpeg';
import { dataURItoU8A } from './js/util';

const framerate = 30;
// Four second loop (integer seconds for now)
const period = 4;
const totalFrames = framerate * period;

const logger = ({ message }) =>
  document.getElementById('logger').innerHTML = message;

const ffmpeg = createFFmpeg({ log: true, logger });

// Load ffmpeg core asynchronously
// Check ffmpeg.isLoaded() before using it
// if it isn't ready yet await this promise
const loadWait = ffmpeg.load();

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const player = document.getElementById('player');

// This function draws framaes to the canvas
const drawCanvasFrame = frameNumber => {
  const cubeSize = 100;
  const offset = Math.sin((Math.PI * 2 / totalFrames) * frameNumber) * 400;
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'green';
  ctx.fillRect(
    (canvas.width / 2) - (cubeSize / 2),
    (canvas.height / 2) - (cubeSize / 2) + offset,
    100,
    100
  );
};

// All of the heavy lifting from ffmpeg happens here
const render = async frames => {
  // Make sure ffmpeg is loaded
  if (!ffmpeg.isLoaded()) { await loadWait; }

  // Before ffmpeg can use our frames, they must be stored in MEMFS (emscripten thing)
  frames.forEach((img, i) => ffmpeg.FS('writeFile', `img${i}`, img));

  // Actually render here
  await ffmpeg.run(
    '-r', framerate.toString(),
    '-f', 'image2',
    '-s', `${canvas.width}x${canvas.height}`,
    '-i', 'img%d',
    '-vcodec', 'libx264',
    '-crf', '25',
    '-pix_fmt', 'yuv420p',
    'output.mp4'
  );

  // Retrieve the output movie file from MEMFS so it can be used
  return ffmpeg.FS('readFile', 'output.mp4');
};

const exec = async() => {
  const range = [...Array(totalFrames).keys()];

  // Populate canvas frames into u8array for ffmpeg to consume
  const frames = range.map(f => {
    drawCanvasFrame(f);
    return dataURItoU8A(canvas.toDataURL());
  });

  // All ffmpeg work happens in this function
  // A movie file is returned on success
  // No error checking is done currently
  const data = await render(frames);

  player.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
};

window.exec = exec;
