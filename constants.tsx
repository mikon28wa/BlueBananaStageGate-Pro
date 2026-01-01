
import { ProductStage, StageStatus } from './types';

export const INITIAL_STAGES: ProductStage[] = [
  {
    id: '1',
    name: 'Strategie',
    title: 'ISO 9001: Qualitätsmanagement',
    description: 'Festlegung des QMS-Rahmens und Marktanalysen.',
    status: StageStatus.ACTIVE,
    keyRequirements: ['Kontext-Analyse', 'Risiko-Register'],
    checklist: [
      { id: 'c1-1', label: 'Qualitätsziele abgeglichen', isCompleted: false },
      { id: 'c1-2', label: 'Marktanalyse validiert', isCompleted: false }
    ],
    finance: { budget: 15000, actualSpent: 12500, currency: 'EUR' },
    roadmap: { startDate: '2024-01-01', endDate: '2024-02-15', milestone: 'Business Case Ready' }
  },
  {
    id: '2',
    name: 'Design',
    title: 'IPC-2221: PCB-Entwicklung',
    description: 'Design von Leiterplatten und thermisches Management.',
    status: StageStatus.LOCKED,
    keyRequirements: ['Schaltplan-Review'],
    checklist: [
      { id: 'c2-1', label: 'DRC Check erfolgt', isCompleted: false },
      { id: 'c2-2', label: 'Material spezifiziert', isCompleted: false }
    ],
    finance: { budget: 45000, actualSpent: 0, currency: 'EUR' },
    roadmap: { startDate: '2024-02-16', endDate: '2024-04-30', milestone: 'Gerber Files Final' }
  },
  {
    id: '3',
    name: 'Prototyping',
    title: 'IPC-A-610: Baugruppen-Qualität',
    description: 'Abnahmekriterien für elektronische Baugruppen.',
    status: StageStatus.LOCKED,
    keyRequirements: ['IPC Class Report'],
    checklist: [
      { id: 'c3-1', label: 'Lötstellen-Prüfung', isCompleted: false },
      { id: 'c3-2', label: 'Funktionstest Hardware', isCompleted: false }
    ],
    finance: { budget: 30000, actualSpent: 0, currency: 'EUR' },
    roadmap: { startDate: '2024-05-01', endDate: '2024-06-15', milestone: 'First Article Inspection' }
  },
  {
    id: '4',
    name: 'Sicherheit',
    title: 'IEC 62368-1: Produktsicherheit',
    description: 'Sicherheitsanforderungen für IT-Geräte.',
    status: StageStatus.LOCKED,
    keyRequirements: ['Energiequellen-Audit'],
    checklist: [
      { id: 'c4-1', label: 'ES-Klassifizierung', isCompleted: false },
      { id: 'c4-2', label: 'Erwärmungstest', isCompleted: false }
    ],
    finance: { budget: 20000, actualSpent: 0, currency: 'EUR' },
    roadmap: { startDate: '2024-06-16', endDate: '2024-07-31', milestone: 'Safety Certification' }
  },
  {
    id: '5',
    name: 'Produktion',
    title: 'DFM & Serienreife',
    description: 'Optimierung der Montageprozesse.',
    status: StageStatus.LOCKED,
    keyRequirements: ['DFM Audit'],
    checklist: [
      { id: 'c5-1', label: 'Nutzen-Design optimiert', isCompleted: false },
      { id: 'c5-2', label: 'Testabdeckung final', isCompleted: false }
    ],
    finance: { budget: 100000, actualSpent: 0, currency: 'EUR' },
    roadmap: { startDate: '2024-08-01', endDate: '2024-12-31', milestone: 'Mass Production Start' }
  }
];
