
import { GoogleGenAI, Type } from "@google/genai";
import { ProductStage, DocumentType, DependencyResult } from "../types";

const getAIInstance = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getStageGuidance = async (stage: ProductStage) => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Strategische Beratung für "${stage.title}". Fokus: Multi-Dokumenten-Intelligenz. Wie können BOM, Schaltpläne und Specs besser synchronisiert werden? Antworte kurz, professionell, auf Deutsch.`,
      config: { temperature: 0.5 }
    });
    return response.text;
  } catch (error) {
    return "Intelligence Stream temporär unterbrochen.";
  }
};

export interface AuditResult {
  status: 'APPROVED' | 'REJECTED' | 'WARNING';
  report: string;
  justification: string;
  missingRequirements: string[];
  complianceScore: number;
  confidenceScore: number;
  dependencies: DependencyResult[];
}

export const performDocumentAudit = async (stage: ProductStage): Promise<AuditResult> => {
  try {
    const ai = getAIInstance();
    const fileList = stage.approvalDocuments.map(doc => `${doc.name} (${doc.type})`).join(', ');
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Du bist die BlueBanana Multi-Doc Intelligence Engine. 
      Analysiere die Relation zwischen diesen Dokumenten: ${fileList}.
      
      DEINE MISSION: Finde logische Widersprüche (Cross-Check).
      Beispiele:
      - Steht im Lastenheft etwas anderes als im Schaltplan?
      - Passt die Stückliste (BOM) exakt zum Design?
      
      KONFIGURATION:
      - Bewerte die Konsistenz (complianceScore).
      - Erstelle eine Liste von 'dependencies' (sourceDoc, targetDoc, status, finding).
      - Status muss 'CONSISTENT' oder 'CONFLICT' sein.
      
      Antworte in validem JSON.`,
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
            dependencies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sourceDoc: { type: Type.STRING },
                  targetDoc: { type: Type.STRING },
                  status: { type: Type.STRING },
                  finding: { type: Type.STRING },
                }
              }
            }
          },
          required: ["status", "report", "justification", "missingRequirements", "complianceScore", "confidenceScore", "dependencies"],
        },
      },
    });
    return JSON.parse(response.text || '{}') as AuditResult;
  } catch (error) {
    console.error("Multi-Doc Intelligence Engine Error", error);
    throw error;
  }
};

export const generateMarketingMaterials = async (projectName: string, stage: ProductStage) => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Schreibe einen Enterprise-Pitch für "${projectName}". Betone, dass dieses Projekt durch Multi-Doc-Intelligence (automatisierter Dokumenten-Cross-Check) validiert wurde. Deutsch, seriös.`,
      config: { temperature: 0.8 }
    });
    return response.text;
  } catch (error) {
    return "Pitch-Inferenz fehlgeschlagen.";
  }
};
