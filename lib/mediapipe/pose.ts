// MediaPipe Pose setup — call initPose() once, then processFrame() per tick
export async function initPose() {}

export async function processFrame(video: HTMLVideoElement) {
  return { landmarks: [] };
}
