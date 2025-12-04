import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateVerificationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'FP-';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { certificateType, moduleId } = await req.json();

    // Get user profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    let title = '';
    let description = '';
    let certificateData: any = {
      userName: profile?.email?.split('@')[0] || 'Student',
      userEmail: user.email,
      issuedAt: new Date().toISOString(),
      platform: 'FluentPass',
    };

    if (certificateType === 'course_completion') {
      // Check if user completed all modules
      const { data: modules } = await supabaseClient
        .from('course_modules')
        .select('id');

      const { data: completedModules } = await supabaseClient
        .from('user_course_progress')
        .select('module_id, status')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .is('lesson_id', null);

      const completedModuleIds = new Set(completedModules?.map(m => m.module_id) || []);
      const allModulesCompleted = modules?.every(m => completedModuleIds.has(m.id));

      if (!allModulesCompleted) {
        return new Response(JSON.stringify({ 
          error: "Complete all 12 modules to earn your course completion certificate." 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Calculate average score
      const { data: scores } = await supabaseClient
        .from('user_course_progress')
        .select('score')
        .eq('user_id', user.id)
        .not('score', 'is', null);

      const avgScore = scores && scores.length > 0 
        ? Math.round(scores.reduce((sum, s) => sum + (s.score || 0), 0) / scores.length)
        : 0;

      title = 'TELC B2 Mastery Course Completion';
      description = 'Successfully completed the 12-week TELC B2 Mastery Course';
      certificateData = {
        ...certificateData,
        courseTitle: 'TELC B2 Mastery Course',
        completionDate: new Date().toISOString(),
        modulesCompleted: 12,
        averageScore: avgScore,
        totalHours: 80,
        level: 'B2',
      };

    } else if (certificateType === 'module_completion' && moduleId) {
      // Check if module is completed
      const { data: moduleProgress } = await supabaseClient
        .from('user_course_progress')
        .select('status, score')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .is('lesson_id', null)
        .single();

      if (moduleProgress?.status !== 'completed') {
        return new Response(JSON.stringify({ 
          error: "Complete this module to earn your certificate." 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: module } = await supabaseClient
        .from('course_modules')
        .select('*')
        .eq('id', moduleId)
        .single();

      title = `Week ${module?.week_number}: ${module?.title}`;
      description = `Completed module: ${module?.title}`;
      certificateData = {
        ...certificateData,
        moduleTitle: module?.title,
        weekNumber: module?.week_number,
        score: moduleProgress?.score || 0,
      };

    } else if (certificateType === 'excellence') {
      // Check for excellence (90%+ average score)
      const { data: scores } = await supabaseClient
        .from('user_course_progress')
        .select('score')
        .eq('user_id', user.id)
        .not('score', 'is', null);

      const avgScore = scores && scores.length > 0 
        ? Math.round(scores.reduce((sum, s) => sum + (s.score || 0), 0) / scores.length)
        : 0;

      if (avgScore < 90) {
        return new Response(JSON.stringify({ 
          error: "Achieve 90% or higher average score to earn the Excellence certificate." 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      title = 'TELC B2 Excellence Award';
      description = 'Achieved exceptional performance in the TELC B2 Mastery Course';
      certificateData = {
        ...certificateData,
        averageScore: avgScore,
        distinction: 'Excellence',
      };
    }

    const verificationCode = generateVerificationCode();

    // Insert certificate
    const { data: certificate, error } = await supabaseClient
      .from('certificates')
      .insert({
        user_id: user.id,
        certificate_type: certificateType,
        title,
        description,
        certificate_data: certificateData,
        verification_code: verificationCode,
      })
      .select()
      .single();

    if (error) {
      console.error("Certificate insert error:", error);
      throw new Error("Failed to generate certificate");
    }

    return new Response(JSON.stringify({ certificate }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Generate certificate error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
