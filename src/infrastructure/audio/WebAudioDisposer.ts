import type { Voice } from "./WebAudioGraphBuilder";

export async function disposeAudioGraph(
  context: AudioContext | null,
  exhaust: Voice | null,
  body: Voice | null,
  noise: AudioBufferSourceNode | null,
  nodes: AudioNode[],
): Promise<void> {
  try {
    exhaust?.source.stop();
  } catch {}
  try {
    body?.source.stop();
  } catch {}
  try {
    noise?.stop();
  } catch {}
  nodes.forEach((node) => {
    try {
      node.disconnect();
    } catch {}
  });
  try {
    await context?.close();
  } catch {}
}
