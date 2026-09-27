export type Voice = { source: OscillatorNode; gain: GainNode };

export interface AudioGraphElements {
  context: AudioContext;
  master: GainNode;
  analyser: AnalyserNode;
  filter: BiquadFilterNode;
  bodyFilter: BiquadFilterNode;
  exhaust: Voice;
  body: Voice;
  noise: AudioBufferSourceNode;
  intake: GainNode;
  turboFilter: BiquadFilterNode;
  turboGain: GainNode;
  nodes: AudioNode[];
}

export function buildAudioGraph(
  volume: number,
  onContextCreated?: (ctx: AudioContext) => void,
  onNodeCreated?: (node: AudioNode) => void,
): AudioGraphElements {
  const context = new AudioContext();
  onContextCreated?.(context);
  const nodes: AudioNode[] = [];
  const trackNode = (node: AudioNode) => {
    nodes.push(node);
    onNodeCreated?.(node);
  };

  const master = context.createGain();
  master.gain.value = volume * 0.7;

  const analyser = context.createAnalyser();
  analyser.fftSize = 64;
  master.connect(analyser);
  trackNode(analyser);

  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 280;
  filter.Q.value = 0.5;
  filter.connect(master).connect(context.destination);
  trackNode(filter);
  trackNode(master);

  const bodyFilter = context.createBiquadFilter();
  bodyFilter.type = "lowpass";
  bodyFilter.frequency.value = 320;
  bodyFilter.Q.value = 0.5;
  bodyFilter.connect(master);
  trackNode(bodyFilter);

  const createVoice = (destination: AudioNode): Voice => {
    const source = context.createOscillator();
    const gain = context.createGain();
    gain.gain.value = 0;
    source.frequency.value = 30;
    source.connect(gain).connect(destination);
    trackNode(source);
    trackNode(gain);
    source.start();
    return { source, gain };
  };

  const exhaust = createVoice(filter);
  const body = createVoice(bodyFilter);

  const bodyHarmonics = new Float32Array([0, 1, 0.45, 0.2, 0.08, 0.025]);
  body.source.setPeriodicWave(context.createPeriodicWave(new Float32Array(bodyHarmonics.length), bodyHarmonics));

  const noise = context.createBufferSource();
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const samples = buffer.getChannelData(0);
  let seed = 17;
  for (let i = 0; i < samples.length; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    samples[i] = seed / 2147483648 - 1;
  }
  noise.buffer = buffer;
  noise.loop = true;

  const intake = context.createGain();
  intake.gain.value = 0;
  const band = context.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 180;
  band.Q.value = 0.6;
  noise.connect(band).connect(intake).connect(filter);
  trackNode(noise);
  trackNode(band);
  trackNode(intake);

  const turboFilter = context.createBiquadFilter();
  turboFilter.type = "bandpass";
  turboFilter.frequency.value = 700;
  turboFilter.Q.value = 0.6;
  const turboGain = context.createGain();
  turboGain.gain.value = 0;
  noise.connect(turboFilter).connect(turboGain).connect(master);
  trackNode(turboFilter);
  trackNode(turboGain);
  noise.start();

  return {
    context,
    master,
    analyser,
    filter,
    bodyFilter,
    exhaust,
    body,
    noise,
    intake,
    turboFilter,
    turboGain,
    nodes,
  };
}
