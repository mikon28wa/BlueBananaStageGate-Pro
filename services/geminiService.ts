
import { GoogleGenAI, Type } from "@google/genai";
import { ProductStage, DocumentType, DependencyResult, InfrastructureConfig, SwotData, IntegrationStatus } from "../types";

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

export const performDocumentAudit = async (
  stage: ProductStage, 
  infra: InfrastructureConfig,
  integrations: IntegrationStatus[]
): Promise<AuditResult> => {
  try {
    const ai = getAIInstance();
    
    // Kontext-Aufbereitung für den Prompt
    const fileList = stage.approvalDocuments.length > 0 
      ? stage.approvalDocuments.map(doc => `- ${doc.name} (${doc.type}) via ${doc.sourceSystem || 'Manual Upload'}`).join('\n')
      : "WARNUNG: Keine Dokumente hochgeladen.";

    const checklistStatus = stage.checklist.map(c => `- [${c.isCompleted ? 'X' : ' '}] ${c.label}`).join('\n');
    const financeStatus = `Budget: ${stage.finance.budget} ${stage.finance.currency}, Ausgegeben: ${stage.finance.actualSpent} ${stage.finance.currency}`;
    const roles = stage.requiredRoles.join(', ');
    
    const integrationContext = integrations.map(i => 
      `- ${i.systemName} (${i.type}): ${i.status} (Silos Broken: ${i.silosBroken}%)`
    ).join('\n');

    const promptContext = `
      PROJEKT-KONTEXT:
      Phase: "${stage.name}" (${stage.title})
      Beschreibung: ${stage.description}
      
      FINANZEN:
      ${financeStatus}
      
      ERFORDERLICHE ROLLEN:
      ${roles}
      
      CHECKLISTEN-STATUS:
      ${checklistStatus}
      
      VERFÜGBARE DOKUMENTE (ARTEFAKTE):
      ${fileList}
      
      INFRASTRUKTUR & INTEGRATIONEN:
      Deployment: ${infra.deploymentType} (${infra.region})
      Systeme:
      ${integrationContext}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Du bist die BlueBanana Enterprise Intelligence Engine.
      
      ${promptContext}

      AUFGABE:
      Führe eine umfassende Prüfung (Audit) der Projektunterlagen für die Phase "${stage.name}" durch.
      Identifiziere fehlende Dokumente und Compliance-Lücken basierend auf den Normen im Titel (z.B. ISO 9001, IEC 62368-1).

      ANFORDERUNGEN AN DIE ANALYSE:
      1. Status: Bestimme den Status (APPROVED, WARNING, REJECTED). REJECTED, wenn kritische Dokumente fehlen.
      2. Missing Documents: Liste alle fehlenden Artefakte auf (z.B. Testberichte, Zertifikate, Protokolle), die für diese Norm erforderlich wären.
      3. Compliance: Bewerte die Einhaltung der Normen (Score 0-100).
      4. Recommendations: Gib Empfehlungen zur Schließung der Lücken.
      5. SWOT: Erstelle zusätzlich eine SWOT-Analyse basierend auf dem aktuellen Stand.

      Antworte im validen JSON-Format gemäß Schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, enum: ["APPROVED", "REJECTED", "WARNING"] },
            report: { type: Type.STRING },
            justification: { type: Type.STRING },
            missingRequirements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Liste der konkret fehlenden Dokumente oder Nachweise" },
            complianceScore: { type: Type.NUMBER },
            confidenceScore: { type: Type.NUMBER },
            infrastructureAdvisory: { type: Type.STRING, description: "Empfehlungen zur Schließung der Lücken" },
            swot: {
              type: Type.OBJECT,
              properties: {
                strengths: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { point: { type: Type.STRING }, significance: { type: Type.STRING }, impact: { type: Type.STRING, enum: ["low", "medium", "high"] }, isAssumption: { type: Type.BOOLEAN } } } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { point: { type: Type.STRING }, significance: { type: Type.STRING }, impact: { type: Type.STRING, enum: ["low", "medium", "high"] } } } },
                opportunities: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { point: { type: Type.STRING }, significance: { type: Type.STRING }, impact: { type: Type.STRING, enum: ["low", "medium", "high"] } } } },
                threats: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { point: { type: Type.STRING }, significance: { type: Type.STRING }, impact: { type: Type.STRING, enum: ["low", "medium", "high"] } } } },
                strategicRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
                leveragePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                positioning: { type: Type.STRING, enum: ["Conservative", "Balanced", "Aggressive"] },
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
      contents: `Erstelle ein professionelles Whitepaper zur Datensicherheit für das Projekt "${projectName}" in der Phase "${stage.name}". 
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
      contents: `Schreibe einen Enterprise-Pitch für "${projectName}" (Phase: ${stage.name}). Betone die lückenlose Integration in ERP/PLM und die Datensouveränität.`,
      config: { temperature: 0.8 }
    });
    return response.text;
  } catch (error) {
    return "Pitch-Inferenz fehlgeschlagen.";
  }
};
