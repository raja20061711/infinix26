import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_THEMES = [
  { id: 'thm-1', title: 'Smart Intelligence', domain: 'AI / ML', description: 'Build intelligent solutions using AI, ML, Computer Vision, and Generative AI.' },
  { id: 'thm-2', title: 'Secure Computing', domain: 'Cybersecurity', description: 'Develop secure digital systems focusing on cyber defense, privacy, and threat detection.' },
  { id: 'thm-3', title: 'Healthcare & MedTech', domain: 'MedTech', description: 'Create innovative medical devices, diagnostics, and digital health tools.' },
  { id: 'thm-4', title: 'Cloud & DevOps', domain: 'Cloud Infrastructure', description: 'Build scalable cloud-native apps with automation, containers, and CI/CD pipelines.' },
  { id: 'thm-5', title: 'FinTech', domain: 'FinTech', description: 'Design smart financial tools for banking, fraud detection, and digital payments.' },
  { id: 'thm-6', title: 'Smart Automation', domain: 'Mechanical & Civil', description: 'Intelligent engineering solutions using Robotics, IoT, BIM, Drones, and Smart Infrastructure.' },
  { id: 'thm-7', title: 'Energy Innovation & Smart Grid', domain: 'EEE & ECE', description: 'Innovative solutions for Smart Grids, Renewable Energy, Electric Mobility, and Power Electronics.' }
];

const DEFAULT_PROBLEM_STATEMENTS = [
  {
    id: 'ps-1',
    psCode: 'PS-AI-01',
    title: 'Real-Time Deep-Sea Sonar Anomaly Detector',
    description: 'Develop a high-precision computer vision or signal processing pipeline that analyzes multi-spectral hydroacoustic signals to detect anomalies in underwater fiber pipelines.',
    themeId: 'thm-1',
    domain: 'Smart Intelligence (AI/ML)',
    pdfUrl: '/sample-ps-ai-01.pdf',
    status: 'Published',
    isPublished: true,
    rules: [
      'Model must run under 100ms latency per hydroacoustic frame.',
      'Zero external cloud reliance during evaluation.',
      'Use open-source synthetic dataset or provided acoustic telemetry samples.'
    ]
  },
  {
    id: 'ps-2',
    psCode: 'PS-SEC-02',
    title: 'Automated Threat Detection & Zero-Trust Mesh Network',
    description: 'Build a decentralized threat monitoring and response system for containerized microservices to prevent unauthorized lateral data movement.',
    themeId: 'thm-2',
    domain: 'Secure Computing (Cybersecurity)',
    pdfUrl: '/sample-ps-sec-02.pdf',
    status: 'Published',
    isPublished: true,
    rules: [
      'Must detect intrusion events within 500ms.',
      'Log audit trail must be tamper-evident.'
    ]
  },
  {
    id: 'ps-3',
    psCode: 'PS-MED-03',
    title: 'AI-Powered Remote Patient Diagnostics & Telemedicine Hub',
    description: 'Create an intelligent diagnostic assistant for rural clinics that processes ECG telemetry and patient vital signs using lightweight Edge AI models.',
    themeId: 'thm-3',
    domain: 'Healthcare & MedTech',
    pdfUrl: '/sample-ps-med-03.pdf',
    status: 'Published',
    isPublished: true,
    rules: ['Offline-first functionality is mandatory.']
  },
  {
    id: 'ps-4',
    psCode: 'PS-CLOUD-04',
    title: 'Self-Healing Microservices & Auto-Scaling Kubernetes Mesh',
    description: 'Design a predictive cloud orchestration engine that automatically forecasts traffic spikes and provisions serverless workloads with zero downtime.',
    themeId: 'thm-4',
    domain: 'Cloud & DevOps',
    pdfUrl: '/sample-ps-cloud-04.pdf',
    status: 'Published',
    isPublished: true,
    rules: ['Must simulate multi-region failover.']
  },
  {
    id: 'ps-5',
    psCode: 'PS-FIN-05',
    title: 'Real-Time Fraud Prevention & UPI Payment Anomaly Engine',
    description: 'Engineers a high-throughput transaction scoring system that identifies fraudulent UPI transfers in real-time using graph neural networks.',
    themeId: 'thm-5',
    domain: 'FinTech',
    pdfUrl: '/sample-ps-fin-05.pdf',
    status: 'Published',
    isPublished: true,
    rules: ['Transaction processing pipeline must handle > 1000 TPS.']
  },
  {
    id: 'ps-6',
    psCode: 'PS-IOT-06',
    title: 'Autonomous Drone Swarm Telemetry & Smart Structural Audit',
    description: 'Develop an IoT telemetry and computer vision platform for inspecting bridge cracks and structural defects using autonomous drone imagery.',
    themeId: 'thm-6',
    domain: 'Smart Automation (Robotics & IoT)',
    pdfUrl: '/sample-ps-iot-06.pdf',
    status: 'Published',
    isPublished: true,
    rules: ['3D mesh rendering or heatmap visualization required.']
  },
  {
    id: 'ps-7',
    psCode: 'PS-EEE-07',
    title: 'Smart Grid Peak Load Balancing & EV Battery Telemetry Engine',
    description: 'Build a smart energy management engine that optimizes EV charging stations during peak grid stress using predictive reinforcement learning.',
    themeId: 'thm-7',
    domain: 'Energy Innovation & Smart Grid',
    pdfUrl: '/sample-ps-eee-07.pdf',
    status: 'Published',
    isPublished: true,
    rules: ['Grid frequency stabilization simulation required.']
  }
];

export async function GET() {
  try {
    let themes = DEFAULT_THEMES;
    let problemStatements = DEFAULT_PROBLEM_STATEMENTS;

    if (isSupabaseConfigured) {
      try {
        const { data: dbThemes } = await supabase.from('themes').select('*');
        if (dbThemes && dbThemes.length > 0) {
          themes = dbThemes;
        }

        const { data: dbPS } = await supabase.from('problem_statements').select('*');
        if (dbPS && dbPS.length > 0) {
          problemStatements = dbPS.map((row: any) => ({
            id: row.id,
            psCode: row.ps_code,
            title: row.title,
            description: row.description,
            themeId: row.theme_id,
            domain: themes.find((t) => t.id === row.theme_id)?.domain || 'General',
            pdfUrl: row.pdf_url,
            status: row.status || 'Published',
            isPublished: row.is_published ?? true,
            rules: Array.isArray(row.rules) ? row.rules : [],
          }));
        }
      } catch (dbErr) {
        console.warn('Supabase PS list fetch fallback:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      themes,
      problemStatements,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message, themes: DEFAULT_THEMES, problemStatements: DEFAULT_PROBLEM_STATEMENTS },
      { status: 500 }
    );
  }
}
