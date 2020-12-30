import { createFFmpeg } from '@ffmpeg/ffmpeg';
import { dataURItoU8A } from './js/Util';
import { setup, drawFrame } from './js/GreenSquareDemo';

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
const player = document.getElementById('player');

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

  const setupData = setup(canvas);

  // Populate canvas frames into u8array for ffmpeg to consume
  const frames = range.map(f => {
    drawFrame(f, totalFrames, setupData);
    return dataURItoU8A(canvas.toDataURL());
  });

  // All ffmpeg work happens in this function
  // A movie file is returned on success
  // No error checking is done currently
  const data = await render(frames);

  player.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
};

// Attaching this to window here so we can easily call it off of e.g. a button click
window.exec = exec;
