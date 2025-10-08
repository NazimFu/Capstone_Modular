import * as ort from 'onnxruntime-node';
import { AutoTokenizer } from '@xenova/transformers';
import path from 'path';

const MODELS_DIR = path.join(__dirname, 'models');
const MAX_SEQ_LENGTH = 128;

let stage1Session: ort.InferenceSession;
let stage2Session: ort.InferenceSession;
let tokenizer: any;

export async function initModels() {
  console.log('Loading ONNX models...');
  
  stage1Session = await ort.InferenceSession.create(
    path.join(MODELS_DIR, 'toxicity-stage1.onnx'),
    { executionProviders: ['cpu'] }
  );
  
  stage2Session = await ort.InferenceSession.create(
    path.join(MODELS_DIR, 'safety-stage2.onnx'),
    { executionProviders: ['cpu'] }
  );
  
  // Load tokenizer from Hugging Face (will cache locally)
  tokenizer = await AutoTokenizer.from_pretrained('unitary/toxic-bert');
  
  console.log('✓ Models loaded successfully');
}

async function tokenizeText(text: string): Promise<{ 
  input_ids: bigint[]; 
  attention_mask: bigint[] 
}> {
  const encoded = await tokenizer(text, {
    max_length: MAX_SEQ_LENGTH,
    padding: 'max_length',
    truncation: true,
    return_tensors: false
  });
  
  return {
    input_ids: encoded.input_ids.map((id: number) => BigInt(id)),
    attention_mask: encoded.attention_mask.map((mask: number) => BigInt(mask))
  };
}

function softmax(logits: Float32Array): number[] {
  const max = Math.max(...Array.from(logits));
  const exps = Array.from(logits).map(x => Math.exp(x - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(x => x / sum);
}

export async function inferStage1(text: string) {
  const { input_ids, attention_mask } = await tokenizeText(text);

  const inputTensor = new ort.Tensor('int64', BigInt64Array.from(input_ids), [1, MAX_SEQ_LENGTH]);
  const maskTensor = new ort.Tensor('int64', BigInt64Array.from(attention_mask), [1, MAX_SEQ_LENGTH]);

  const outputs = await stage1Session.run({
    input_ids: inputTensor,
    attention_mask: maskTensor
  });

  // Get logits - the output name might be 'logits' or 'output'
  const logitsData = (outputs.logits?.data || outputs[Object.keys(outputs)[0]].data) as Float32Array;
  const probs = softmax(logitsData);
  
  // unitary/toxic-bert labels: [toxic, severe_toxic, obscene, threat, insult, identity_hate]
  return {
    toxicity: probs[0] || 0,
    severe_toxic: probs[1] || 0,
    obscene: probs[2] || 0,
    threat: probs[3] || 0,
    insult: probs[4] || 0,
    identity_hate: probs[5] || 0
  };
}

export async function inferStage2(text: string) {
  const { input_ids, attention_mask } = await tokenizeText(text);

  const inputTensor = new ort.Tensor('int64', BigInt64Array.from(input_ids), [1, MAX_SEQ_LENGTH]);
  const maskTensor = new ort.Tensor('int64', BigInt64Array.from(attention_mask), [1, MAX_SEQ_LENGTH]);

  const outputs = await stage2Session.run({
    input_ids: inputTensor,
    attention_mask: maskTensor
  });

  const logitsData = (outputs.logits?.data || outputs[Object.keys(outputs)[0]].data) as Float32Array;
  const probs = softmax(logitsData);
  
  // facebook/roberta-hate-speech-dynabench-r4-target labels: [nothate, hate]
  // Adjust based on your actual Stage-2 model
  return {
    hate: probs[1] || 0,
    harassment: probs[1] || 0, // Using hate as proxy
    sexual_exploitation: 0, // Add separate model if needed
    violence: 0,
    self_harm: 0,
    spam: 0,
    credible_threat: 0
  };
}

// Initialize models on import
initModels().catch(console.error);