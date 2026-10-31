const fs = require('fs');
const path = require('path');

function createWavHeader(dataLength, sampleRate = 44100, numChannels = 2, bitsPerSample = 16) {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const buffer = Buffer.alloc(44);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);

  return buffer;
}

// 1. Generate 22-second Minimal Tech Pulse BGM
function generateBgm() {
  const sampleRate = 44100;
  const duration = 22.0; // 22 seconds
  const totalSamples = Math.floor(sampleRate * duration);
  const buffer = Buffer.alloc(totalSamples * 4); // 16-bit stereo = 4 bytes per sample

  const bpm = 124;
  const beatDuration = 60 / bpm;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;

    // Overall envelope (fade in 1s, fade out last 1.5s)
    let masterEnv = 1.0;
    if (t < 0.8) masterEnv = t / 0.8;
    if (t > 20.5) masterEnv = Math.max(0, (22.0 - t) / 1.5);

    // Beat timing
    const currentBeat = t / beatDuration;
    const beatFraction = currentBeat % 1.0;

    // 1. Kick on every beat (beats 0, 1, 2, 3...)
    let kick = 0;
    if (t >= 0.5 && t < 20.0) {
      const kickT = beatFraction * beatDuration;
      if (kickT < 0.25) {
        const freq = 120 * Math.exp(-kickT * 18) + 42;
        kick = Math.sin(2 * Math.PI * freq * kickT) * Math.exp(-kickT * 12) * 0.45;
      }
    }

    // 2. Crisp Hi-hat / Shaker on 16th notes
    let hat = 0;
    if (t >= 3.5 && t < 19.5) {
      const subBeat = (currentBeat * 4) % 1.0;
      const hatT = subBeat * (beatDuration / 4);
      if (hatT < 0.04) {
        const whiteNoise = (Math.sin(i * 12.9898) * 43758.5453) % 1; // deterministic noise
        hat = whiteNoise * Math.exp(-hatT * 90) * 0.12;
      }
    }

    // 3. Cyber Synth Chord Pluck (Am -> F -> C -> G progression)
    let synth = 0;
    const bar = Math.floor(currentBeat / 4) % 4;
    const chords = [
      [220.0, 261.63, 329.63], // Am
      [174.61, 220.0, 261.63], // F
      [130.81, 164.81, 196.0], // C
      [196.0, 246.94, 293.66], // G
    ];
    const currentChord = chords[bar];
    const chordT = (currentBeat % 2.0) * beatDuration;
    if (t >= 1.0 && chordT < 0.8) {
      const chordEnv = Math.exp(-chordT * 3.5);
      for (const f of currentChord) {
        synth += (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t)) * 0.08 * chordEnv;
      }
    }

    // 4. Sub-bass drone
    let bass = 0;
    if (t >= 0.5 && t < 21.0) {
      const bassFreq = [55.0, 43.65, 65.41, 49.0][bar];
      bass = Math.sin(2 * Math.PI * bassFreq * t) * 0.18;
    }

    const mixed = (kick + hat + synth + bass) * masterEnv;
    const sampleVal = Math.max(-1, Math.min(1, mixed));
    const int16 = Math.floor(sampleVal * 32767);

    // Stereo L and R
    buffer.writeInt16LE(int16, i * 4);
    buffer.writeInt16LE(int16, i * 4 + 2);
  }

  const header = createWavHeader(buffer.length, sampleRate, 2, 16);
  fs.writeFileSync(path.join(__dirname, 'fig-promo', 'assets', 'bgm.wav'), Buffer.concat([header, buffer]));
  console.log('Generated bgm.wav');
}

// 2. Generate UI Click SFX
function generateClick() {
  const sampleRate = 44100;
  const duration = 0.12;
  const totalSamples = Math.floor(sampleRate * duration);
  const buffer = Buffer.alloc(totalSamples * 4);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const freq = 1400 * Math.exp(-t * 40) + 300;
    const wave = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 45) * 0.6;
    const int16 = Math.floor(Math.max(-1, Math.min(1, wave)) * 32767);
    buffer.writeInt16LE(int16, i * 4);
    buffer.writeInt16LE(int16, i * 4 + 2);
  }

  const header = createWavHeader(buffer.length, sampleRate, 2, 16);
  fs.writeFileSync(path.join(__dirname, 'fig-promo', 'assets', 'click.wav'), Buffer.concat([header, buffer]));
  console.log('Generated click.wav');
}

// 3. Generate Radial Whoosh SFX
function generateWhoosh() {
  const sampleRate = 44100;
  const duration = 0.5;
  const totalSamples = Math.floor(sampleRate * duration);
  const buffer = Buffer.alloc(totalSamples * 4);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const env = Math.sin((t / duration) * Math.PI);
    const noise = (Math.sin(i * 14.1234) * 43758.5453) % 1;
    const sweep = Math.sin(2 * Math.PI * (200 + 600 * (t / duration)) * t);
    const wave = (noise * 0.4 + sweep * 0.6) * env * 0.4;
    const int16 = Math.floor(Math.max(-1, Math.min(1, wave)) * 32767);
    buffer.writeInt16LE(int16, i * 4);
    buffer.writeInt16LE(int16, i * 4 + 2);
  }

  const header = createWavHeader(buffer.length, sampleRate, 2, 16);
  fs.writeFileSync(path.join(__dirname, 'fig-promo', 'assets', 'whoosh.wav'), Buffer.concat([header, buffer]));
  console.log('Generated whoosh.wav');
}

generateBgm();
generateClick();
generateWhoosh();
