
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
    console.debug(`[RESULT] getStageGuidance erfolgreich: ${response.text?.substring(0, 50)}...`);
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
}

export const performDocumentAudit = async (stage: ProductStage, fileName: string): Promise<AuditResult> => {
  console.debug(`[DEBUG] Starte performDocumentAudit für Dokument: ${fileName} in Phase: ${stage.title}`);
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Führe ein Compliance-Audit für "${stage.title}" durch. Datei: "${fileName}". 
      Checkliste: ${stage.checklist.map(c => c.label).join(', ')}.
      Antworte in JSON mit status (APPROVED, REJECTED, WARNING), report, justification und missingRequirements.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING },
            report: { type: Type.STRING },
            justification: { type: Type.STRING },
            missingRequirements: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["status", "report", "justification", "missingRequirements"],
        },
      },
    });
    const result = JSON.parse(response.text || '{}') as AuditResult;
    console.debug(`[RESULT] performDocumentAudit abgeschlossen. Status: ${result.status}`);
    return result;
  } catch (error) {
    console.error("[ERROR] performDocumentAudit fehlgeschlagen:", error);
    throw error;
  }
};

export const generateMarketingMaterials = async (projectName: string, stage: ProductStage) => {
  console.debug(`[DEBUG] Starte generateMarketingMaterials für Projekt: ${projectName}`);
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Erstelle Marketing-Material für "${projectName}". Aktuelle Phase: ${stage.name}. Meilenstein: ${stage.roadmap.milestone}. Erzeuge einen Elevator Pitch und 3 Key-Highlights auf Deutsch.`,
      config: { temperature: 0.8 }
    });
    console.debug(`[RESULT] generateMarketingMaterials erfolgreich: ${response.text?.substring(0, 50)}...`);
    return response.text;
  } catch (error) {
    console.error("[ERROR] generateMarketingMaterials fehlgeschlagen:", error);
    return "Marketing-Fehler.";
  }
};
