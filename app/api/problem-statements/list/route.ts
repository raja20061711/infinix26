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

const DEFAULT_PROBLEM_STATEMENTS: any[] = [];

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
