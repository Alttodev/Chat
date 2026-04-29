let cachedSoundUrl = null;
let sharedAudio = null;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const writeString = (view, offset, value) => {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
};

const buildToneBuffer = () => {
  const sampleRate = 44100;
  const segments = [
    { duration: 0.09, frequency: 880, amplitude: 0.55 },
    { duration: 0.04, frequency: 0, amplitude: 0 },
    { duration: 0.09, frequency: 660, amplitude: 0.5 },
    { duration: 0.10, frequency: 0, amplitude: 0 },
  ];

  const totalSamples = segments.reduce(
    (sum, segment) => sum + Math.floor(segment.duration * sampleRate),
    0,
  );
  const buffer = new ArrayBuffer(44 + totalSamples * 2);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + totalSamples * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, totalSamples * 2, true);

  let offset = 44;
  let sampleIndex = 0;

  segments.forEach((segment) => {
    const sampleCount = Math.floor(segment.duration * sampleRate);
    for (let i = 0; i < sampleCount; i += 1) {
      const progress = i / Math.max(sampleCount, 1);
      const fadeIn = Math.min(progress / 0.08, 1);
      const fadeOut = Math.min((1 - progress) / 0.12, 1);
      const envelope = clamp(fadeIn * fadeOut, 0, 1);
      const value =
        segment.frequency === 0
          ? 0
          : Math.sin((2 * Math.PI * segment.frequency * sampleIndex) / sampleRate) *
            segment.amplitude *
            envelope;

      const sample = clamp(Math.round(value * 32767), -32768, 32767);
      view.setInt16(offset, sample, true);
      offset += 2;
      sampleIndex += 1;
    }
  });

  return buffer;
};

const bufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  return window.btoa(binary);
};

const getSoundUrl = () => {
  if (!cachedSoundUrl) {
    const buffer = buildToneBuffer();
    cachedSoundUrl = `data:audio/wav;base64,${bufferToBase64(buffer)}`;
  }

  return cachedSoundUrl;
};

export const primeNotificationSound = async () => {
  try {
    if (!sharedAudio) {
      sharedAudio = new Audio(getSoundUrl());
      sharedAudio.preload = "auto";
      sharedAudio.volume = 0.9;
    }

    sharedAudio.muted = true;
    const playPromise = sharedAudio.play();
    if (playPromise?.then) {
      await playPromise.catch(() => {});
    }
    sharedAudio.pause();
    sharedAudio.currentTime = 0;
    sharedAudio.muted = false;
  } catch {
    // Ignore unlock failures.
  }
};

export const playNotificationSound = async () => {
  try {
    if (!sharedAudio) {
      sharedAudio = new Audio(getSoundUrl());
      sharedAudio.preload = "auto";
      sharedAudio.volume = 0.9;
    }

    sharedAudio.currentTime = 0;
    const playPromise = sharedAudio.play();
    if (playPromise?.then) {
      await playPromise.catch(() => {});
    }
  } catch {
    // Ignore playback failures.
  }
};
