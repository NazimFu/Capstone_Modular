import { inferStage1, inferStage2 } from '../ml/inference';
import { normalizeText } from '../utils/text-normalizer';
import User from '../models/user.model';

export async function runModerationPipeline(text: string, channel: string) {
  const normalized = normalizeText(text);
  
  // TODO: Load thresholds for channel from User model
  const thresholds = {
    p_toxic_delete: 0.85,
    p_toxic_allow: 0.30,
    stage2_hate: 0.80,
    stage2_harassment: 0.80,
    stage2_sexual: 0.80
  };

  const stage1 = await inferStage1(normalized);
  
  // Calculate max toxicity from all Stage-1 labels
  const p_toxic = Math.max(
    stage1.toxicity,
    stage1.severe_toxic,
    stage1.insult,
    stage1.threat,
    stage1.obscene,
    stage1.identity_hate
  );

  if (p_toxic >= thresholds.p_toxic_delete) {
    return {
      action: 'delete_for_all',
      labels: stage1,
      confidence: p_toxic,
      severity: 'high',
      modelVersions: { stage1: 'toxic-bert-v1' }
    };
  }

  if (p_toxic <= thresholds.p_toxic_allow) {
    return {
      action: 'allow',
      labels: stage1,
      confidence: p_toxic,
      severity: 'low',
      modelVersions: { stage1: 'toxic-bert-v1' }
    };
  }

  // Run Stage-2 for borderline cases
  const stage2 = await inferStage2(normalized);

  if (stage2.hate >= thresholds.stage2_hate) {
    return {
      action: 'delete_for_all',
      labels: { ...stage1, ...stage2 },
      confidence: stage2.hate,
      severity: 'high',
      modelVersions: { stage1: 'toxic-bert-v1', stage2: 'roberta-hate-v1' }
    };
  }

  if (stage2.harassment >= thresholds.stage2_harassment || p_toxic >= 0.60) {
    return {
      action: 'hide',
      labels: { ...stage1, ...stage2 },
      confidence: Math.max(stage2.harassment, p_toxic),
      severity: 'medium',
      modelVersions: { stage1: 'toxic-bert-v1', stage2: 'roberta-hate-v1' }
    };
  }

  return {
    action: 'allow',
    labels: { ...stage1, ...stage2 },
    confidence: p_toxic,
    severity: 'low',
    modelVersions: { stage1: 'toxic-bert-v1', stage2: 'roberta-hate-v1' }
  };
}