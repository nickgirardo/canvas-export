// This function does any preparation which might be needed before runs
// The object it returns is passed to the drawFrame function below
// In this instance it is quite simple, just returning the canvas as passed
// and getting a 2d render context
// Why is this done here?
// For more complex 3d animations much more setup work might need to be done
// For instance setting up buffers, creating programs, etc
// Furthermore, getting the context is done here for the same reason.
// In this case we get a 2d context, in other demos we might get 3d
// The rest of the program doesn't need to be aware of this (I hope)
export const setup = canvas => ({
  canvas,
  ctx: canvas.getContext('2d'),
});

// This function draws framaes to the canvas
export const drawFrame = (frameNumber, totalFrames, setupData) => {
  // Values passed from setup fn above
  const { canvas, ctx } = setupData;
  const progress = frameNumber / totalFrames;
  const offset = Math.sin(Math.PI * 2 * progress) * 400;
  const cubeSize = 100;

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
