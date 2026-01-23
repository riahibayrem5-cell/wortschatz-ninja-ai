import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MonitorCheck {
  name: string;
  status: "ok" | "warning" | "critical";
  message: string;
  data?: any;
}

interface AlertPayload {
  alert_type: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  details: any;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? `: ${JSON.stringify(details)}` : "";
  console.log(`[AI-MONITOR] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  let checkType = "health";
  try {
    const body = await req.json().catch(() => ({}));
    checkType = body.check || "health";
  } catch {
    // Default to health check
  }

  logStep("Starting monitor run", { checkType });

  const checks: MonitorCheck[] = [];
  const alerts: AlertPayload[] = [];

  try {
    // 1. Check Edge Function Error Rates
    if (checkType === "health" || checkType === "all") {
      logStep("Checking edge function health");
      
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const { data: recentMetrics, error: metricsError } = await supabase
        .from("server_metrics")
        .select("*")
        .gte("created_at", fifteenMinutesAgo)
        .order("created_at", { ascending: false });

      if (!metricsError && recentMetrics) {
        const errorCount = recentMetrics.filter(m => m.status === "error" || m.latency_ms > 5000).length;
        const totalCount = recentMetrics.length;
        const errorRate = totalCount > 0 ? (errorCount / totalCount) * 100 : 0;

        if (errorRate > 20) {
          checks.push({ name: "edge_functions", status: "critical", message: `High error rate: ${errorRate.toFixed(1)}%`, data: { errorRate, errorCount, totalCount } });
          alerts.push({
            alert_type: "error_spike",
            severity: "critical",
            title: `Critical: Edge function error rate at ${errorRate.toFixed(1)}%`,
            details: { errorRate, errorCount, totalCount, recentErrors: recentMetrics.filter(m => m.status === "error").slice(0, 5) }
          });
        } else if (errorRate > 10) {
          checks.push({ name: "edge_functions", status: "warning", message: `Elevated error rate: ${errorRate.toFixed(1)}%`, data: { errorRate } });
          alerts.push({
            alert_type: "error_spike",
            severity: "high",
            title: `Warning: Edge function error rate at ${errorRate.toFixed(1)}%`,
            details: { errorRate, errorCount, totalCount }
          });
        } else {
          checks.push({ name: "edge_functions", status: "ok", message: `Error rate normal: ${errorRate.toFixed(1)}%` });
        }
      }
    }

    // 2. Check User Activity & Streak Risk
    if (checkType === "user_activity" || checkType === "all") {
      logStep("Checking user activity");
      
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Users who were active 2 days ago but not yesterday (streak at risk)
      const { data: atRiskUsers, error: activityError } = await supabase
        .from("daily_activity")
        .select("user_id")
        .eq("activity_date", twoDaysAgo)
        .not("user_id", "in", `(SELECT user_id FROM daily_activity WHERE activity_date = '${yesterday}')`);

      // Get users with high streaks who are at risk
      const { data: highStreakUsers, error: streakError } = await supabase
        .from("user_progress")
        .select("user_id, streak_days")
        .gte("streak_days", 7)
        .lt("last_activity_date", yesterday);

      if (!streakError && highStreakUsers && highStreakUsers.length > 0) {
        checks.push({ 
          name: "streak_risk", 
          status: "warning", 
          message: `${highStreakUsers.length} users with 7+ day streaks at risk`,
          data: { count: highStreakUsers.length }
        });
        
        if (highStreakUsers.length >= 5) {
          alerts.push({
            alert_type: "streak_risk",
            severity: "medium",
            title: `${highStreakUsers.length} high-streak users at risk of losing their streak`,
            details: { userCount: highStreakUsers.length, streakRange: highStreakUsers.map(u => u.streak_days) }
          });
        }
      } else {
        checks.push({ name: "streak_risk", status: "ok", message: "No high-streak users at risk" });
      }

      // Check for inactive users (no activity in 14 days)
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const { data: inactiveCount, error: inactiveError } = await supabase
        .from("user_progress")
        .select("user_id", { count: "exact" })
        .lt("last_activity_date", fourteenDaysAgo);

      if (!inactiveError && inactiveCount) {
        const count = inactiveCount.length;
        if (count > 10) {
          checks.push({ name: "inactive_users", status: "warning", message: `${count} users inactive for 14+ days` });
          alerts.push({
            alert_type: "inactive_users",
            severity: "low",
            title: `${count} users have been inactive for over 14 days`,
            details: { count, threshold: "14 days" }
          });
        } else {
          checks.push({ name: "inactive_users", status: "ok", message: `${count} inactive users (normal)` });
        }
      }
    }

    // 3. Check Payment/Subscription Health
    if (checkType === "payments" || checkType === "all") {
      logStep("Checking payment health");
      
      const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      const now = new Date().toISOString();

      // Check for expiring subscriptions
      const { data: expiringSubs, error: expiringError } = await supabase
        .from("user_subscriptions")
        .select("id, user_id, expires_at")
        .eq("status", "active")
        .eq("is_permanent", false)
        .lte("expires_at", threeDaysFromNow)
        .gte("expires_at", now);

      if (!expiringError && expiringSubs && expiringSubs.length > 0) {
        checks.push({ 
          name: "expiring_subscriptions", 
          status: "warning", 
          message: `${expiringSubs.length} subscriptions expiring in 3 days`,
          data: { count: expiringSubs.length }
        });
        alerts.push({
          alert_type: "subscription_expiring",
          severity: "medium",
          title: `${expiringSubs.length} subscriptions expiring within 3 days`,
          details: { count: expiringSubs.length, subscriptions: expiringSubs.slice(0, 10) }
        });
      } else {
        checks.push({ name: "expiring_subscriptions", status: "ok", message: "No subscriptions expiring soon" });
      }

      // Check for recently cancelled/expired subscriptions
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: recentlyCancelled, error: cancelledError } = await supabase
        .from("user_subscriptions")
        .select("id", { count: "exact" })
        .eq("status", "cancelled")
        .gte("updated_at", oneDayAgo);

      if (!cancelledError && recentlyCancelled) {
        const count = recentlyCancelled.length;
        if (count > 5) {
          alerts.push({
            alert_type: "cancellation_spike",
            severity: "high",
            title: `${count} subscriptions cancelled in the last 24 hours`,
            details: { count, timeframe: "24 hours" }
          });
        }
      }
    }

    // 4. AI-Powered Anomaly Detection (if we have enough data)
    if (lovableApiKey && (checkType === "health" || checkType === "all")) {
      logStep("Running AI anomaly detection");
      
      try {
        // Get historical baselines
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data: weeklyActivity } = await supabase
          .from("daily_activity")
          .select("activity_date, exercises_completed, words_learned")
          .gte("activity_date", oneWeekAgo.split('T')[0]);

        const { data: recentAlerts } = await supabase
          .from("system_alerts")
          .select("alert_type, severity, created_at")
          .gte("created_at", oneWeekAgo)
          .order("created_at", { ascending: false })
          .limit(20);

        // Ask AI to analyze for patterns
        const analysisPrompt = `Analyze this platform health data and identify any concerning patterns or anomalies. Be concise.

Checks performed: ${JSON.stringify(checks)}
Recent alerts (last 7 days): ${JSON.stringify(recentAlerts?.slice(0, 10) || [])}
Weekly activity summary: ${weeklyActivity?.length || 0} activity records

Respond with JSON: { "status": "ok" | "concern", "summary": "brief summary", "recommendations": ["action1", "action2"] }`;

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: "You are a platform health monitoring AI. Analyze data and provide concise insights." },
              { role: "user", content: analysisPrompt }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const aiContent = aiData.choices?.[0]?.message?.content || "";
          
          try {
            const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const analysis = JSON.parse(jsonMatch[0]);
              checks.push({ 
                name: "ai_analysis", 
                status: analysis.status === "concern" ? "warning" : "ok", 
                message: analysis.summary,
                data: { recommendations: analysis.recommendations }
              });
            }
          } catch {
            logStep("AI response parsing failed", { content: aiContent.substring(0, 200) });
          }
        }
      } catch (aiError) {
        logStep("AI analysis error", { error: String(aiError) });
      }
    }

    // Store alerts
    for (const alert of alerts) {
      // Check for duplicate recent alerts
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: existingAlert } = await supabase
        .from("system_alerts")
        .select("id")
        .eq("alert_type", alert.alert_type)
        .gte("created_at", oneHourAgo)
        .limit(1)
        .single();

      if (!existingAlert) {
        await supabase.from("system_alerts").insert(alert);
        logStep("Alert created", { type: alert.alert_type, severity: alert.severity });
      } else {
        logStep("Duplicate alert skipped", { type: alert.alert_type });
      }
    }

    // Log monitor run
    const executionTime = Date.now() - startTime;
    await supabase.from("monitor_runs").insert({
      run_type: checkType,
      status: "success",
      checks_performed: checks.length,
      alerts_triggered: alerts.length,
      execution_time_ms: executionTime,
      details: { checks }
    });

    logStep("Monitor run completed", { checkType, checksPerformed: checks.length, alertsTriggered: alerts.length, executionTime });

    return new Response(JSON.stringify({
      success: true,
      checkType,
      checksPerformed: checks.length,
      alertsTriggered: alerts.length,
      executionTimeMs: executionTime,
      checks
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    logStep("Monitor run failed", { error: String(error) });

    // Log failed run
    await supabase.from("monitor_runs").insert({
      run_type: checkType,
      status: "error",
      execution_time_ms: Date.now() - startTime,
      details: { error: String(error) }
    });

    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
