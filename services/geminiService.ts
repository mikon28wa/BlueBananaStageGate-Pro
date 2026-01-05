
import { GoogleGenAI, Type } from "@google/genai";
import { ProductStage, DocumentType, DependencyResult, InfrastructureConfig, SwotData } from "../types";

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
  infrastructureAdvisory?: string;
  swot?: SwotData;
}

export const performDocumentAudit = async (stage: ProductStage, infra: InfrastructureConfig): Promise<AuditResult> => {
  try {
    const ai = getAIInstance();
    const fileList = stage.approvalDocuments.map(doc => `${doc.name} (${doc.type}) via ${doc.sourceSystem || 'Manual Upload'}`).join(', ');
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Du bist die BlueBanana Enterprise Intelligence Engine. 
      Analysiere Dokument-Relationen: ${fileList}.
      Aktuelle Infra: ${infra.deploymentType} (${infra.region}).
      
      MISSIION:
      1. Cross-Check BOM/Schaltplan/Spec.
      2. Generiere eine strukturierte SWOT-Analyse basierend auf dem aktuellen Stage-Status (${stage.name}).
      3. Erstelle Strategic Insights (Risks, Leverage, Positioning).
      
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
            infrastructureAdvisory: { type: Type.STRING },
            swot: {
              type: Type.OBJECT,
              properties: {
                strengths: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { point: { type: Type.STRING }, significance: { type: Type.STRING }, impact: { type: Type.STRING }, isAssumption: { type: Type.BOOLEAN } } } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { point: { type: Type.STRING }, significance: { type: Type.STRING }, impact: { type: Type.STRING } } } },
                opportunities: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { point: { type: Type.STRING }, significance: { type: Type.STRING }, impact: { type: Type.STRING } } } },
                threats: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { point: { type: Type.STRING }, significance: { type: Type.STRING }, impact: { type: Type.STRING } } } },
                strategicRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
                leveragePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                positioning: { type: Type.STRING },
                recommendations: {
                  type: Type.OBJECT,
                  properties: {
                    shortTerm: { type: Type.ARRAY, items: { type: Type.STRING } },
                    midTerm: { type: Type.ARRAY, items: { type: Type.STRING } },
                  }
                }
              }
            },
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
          required: ["status", "report", "justification", "missingRequirements", "complianceScore", "confidenceScore", "dependencies", "infrastructureAdvisory", "swot"],
        },
      },
    });
    return JSON.parse(response.text || '{}') as AuditResult;
  } catch (error) {
    console.error("Enterprise Intelligence Engine Error", error);
    throw error;
  }
};

export const generateIPWhitepaper = async (projectName: string, stage: ProductStage) => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Erstelle ein professionelles Whitepaper zur Datensicherheit für das Projekt "${projectName}". 
      Fokus: Private Cloud vs. On-Premise LLM-Isolation. Erwähne Vertex AI VPC Service Controls.`,
      config: { temperature: 0.3 }
    });
    return response.text;
  } catch (error) {
    return "Whitepaper-Inferenz fehlgeschlagen.";
  }
};

export const generateMarketingMaterials = async (projectName: string, stage: ProductStage) => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Schreibe einen Enterprise-Pitch für "${projectName}". Betone die lückenlose Integration in ERP/PLM und die Datensouveränität.`,
      config: { temperature: 0.8 }
    });
    return response.text;
  } catch (error) {
    return "Pitch-Inferenz fehlgeschlagen.";
  }
};
