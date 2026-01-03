
import { GoogleGenAI, Type } from "@google/genai";
import { ProductStage } from "../types";

const getAIInstance = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getStageGuidance = async (stage: ProductStage) => {
  console.debug(`[DEBUG] Starte getStageGuidance für Phase: ${stage.name}`);
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gib 3 Experten-Tipps für die Phase "${stage.name}" im Kontext von "${stage.title}". Antworte in Deutsch als Markdown-Liste.`,
      config: { temperature: 0.5 }
    });
    return response.text;
  } catch (error) {
    console.error("[ERROR] getStageGuidance fehlgeschlagen:", error);
    return "Guidance nicht verfügbar.";
  }
};

export interface AuditResult {
  status: 'APPROVED' | 'REJECTED' | 'WARNING';
  report: string;
  justification: string;
  missingRequirements: string[];
  complianceScore: number; // 0-100
  confidenceScore: number; // 0-100 (how sure the AI is)
}

export const performDocumentAudit = async (stage: ProductStage, fileNames: string[]): Promise<AuditResult> => {
  console.debug(`[DEBUG] Starte performDocumentAudit für Dokumenten-Set: ${fileNames.join(', ')} in Phase: ${stage.title}`);
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Führe ein Compliance-Audit für "${stage.title}" durch. 
      Hochgeladene Dateien: ${fileNames.map(name => `"${name}"`).join(', ')}. 
      Prüfe, ob diese Dokumente gemeinsam folgende Checkliste erfüllen: ${stage.checklist.map(c => c.label).join(', ')}.
      
      Berechne zwei Metriken:
      1. complianceScore: Wie gut erfüllen die Dokumente die Anforderungen? (0-100)
      2. confidenceScore: Wie sicher bist du dir bei dieser Bewertung? (0-100). Wenn Dokumente fehlen oder unklar sind, senke diesen Wert.

      Antworte in JSON mit status (APPROVED, REJECTED, WARNING), report, justification, missingRequirements, complianceScore (Zahl) und confidenceScore (Zahl).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING },
            report: { type: Type.STRING },
            justification: { type: Type.STRING },
            missingRequirements: { type: Type.ARRAY, items: { type: Type.STRING } },
            complianceScore: { type: Type.NUMBER },
            confidenceScore: { type: Type.NUMBER },
          },
          required: ["status", "report", "justification", "missingRequirements", "complianceScore", "confidenceScore"],
        },
      },
    });
    const result = JSON.parse(response.text || '{}') as AuditResult;
    return result;
  } catch (error) {
    console.error("[ERROR] performDocumentAudit fehlgeschlagen:", error);
    throw error;
  }
};

export const generateMarketingMaterials = async (projectName: string, stage: ProductStage) => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Erstelle Marketing-Material für "${projectName}". Aktuelle Phase: ${stage.name}. Erzeuge einen Elevator Pitch und 3 Key-Highlights auf Deutsch.`,
      config: { temperature: 0.8 }
    });
    return response.text;
  } catch (error) {
    console.error("[ERROR] generateMarketingMaterials fehlgeschlagen:", error);
    return "Marketing-Fehler.";
  }
};
