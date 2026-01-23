import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlertEmailRequest {
  alertId?: string;
  digest?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const adminEmail = Deno.env.get("ADMIN_EMAIL") || "admin@fluentpass.de";
  
  if (!resendKey) {
    console.log("RESEND_API_KEY not configured - skipping email");
    return new Response(JSON.stringify({ 
      success: false, 
      message: "Email service not configured" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const resend = new Resend(resendKey);
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body: AlertEmailRequest = await req.json().catch(() => ({}));

    if (body.digest) {
      // Send daily digest of all unacknowledged alerts
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data: alerts, error } = await supabase
        .from("system_alerts")
        .select("*")
        .eq("acknowledged", false)
        .gte("created_at", oneDayAgo)
        .order("severity", { ascending: false })
        .order("created_at", { ascending: false });

      if (error || !alerts || alerts.length === 0) {
        return new Response(JSON.stringify({ 
          success: true, 
          message: "No alerts to send" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const criticalCount = alerts.filter(a => a.severity === "critical").length;
      const highCount = alerts.filter(a => a.severity === "high").length;
      const otherCount = alerts.filter(a => !["critical", "high"].includes(a.severity)).length;

      const alertRows = alerts.map(a => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px; color: ${
            a.severity === "critical" ? "#dc2626" : 
            a.severity === "high" ? "#ea580c" : 
            a.severity === "medium" ? "#ca8a04" : "#6b7280"
          }; font-weight: bold;">${a.severity.toUpperCase()}</td>
          <td style="padding: 12px;">${a.title}</td>
          <td style="padding: 12px; color: #6b7280; font-size: 12px;">${new Date(a.created_at).toLocaleString()}</td>
        </tr>
      `).join("");

      const emailResponse = await resend.emails.send({
        from: "FluentPass Monitor <alerts@fluentpass.de>",
        to: [adminEmail],
        subject: `[FluentPass] Daily Alert Digest: ${criticalCount} critical, ${highCount} high priority`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 24px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">📊 Daily Alert Digest</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0;">FluentPass Platform Monitoring</p>
            </div>
            
            <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
              <div style="display: flex; gap: 16px; margin-bottom: 24px;">
                <div style="flex: 1; background: #fef2f2; padding: 16px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 32px; font-weight: bold; color: #dc2626;">${criticalCount}</div>
                  <div style="color: #991b1b; font-size: 14px;">Critical</div>
                </div>
                <div style="flex: 1; background: #fff7ed; padding: 16px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 32px; font-weight: bold; color: #ea580c;">${highCount}</div>
                  <div style="color: #9a3412; font-size: 14px;">High</div>
                </div>
                <div style="flex: 1; background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 32px; font-weight: bold; color: #6b7280;">${otherCount}</div>
                  <div style="color: #374151; font-size: 14px;">Other</div>
                </div>
              </div>
              
              <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <thead>
                  <tr style="background: #f9fafb;">
                    <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase;">Severity</th>
                    <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase;">Alert</th>
                    <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase;">Time</th>
                  </tr>
                </thead>
                <tbody>
                  ${alertRows}
                </tbody>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 24px; text-align: center;">
                This is an automated message from FluentPass Platform Monitoring.
              </p>
            </div>
          </div>
        `,
      });

      console.log("Digest email sent:", emailResponse);

      return new Response(JSON.stringify({ 
        success: true, 
        alertCount: alerts.length,
        emailId: emailResponse.data?.id 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });

    } else if (body.alertId) {
      // Send single alert email
      const { data: alert, error } = await supabase
        .from("system_alerts")
        .select("*")
        .eq("id", body.alertId)
        .single();

      if (error || !alert) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: "Alert not found" 
        }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const severityColor = 
        alert.severity === "critical" ? "#dc2626" : 
        alert.severity === "high" ? "#ea580c" : 
        alert.severity === "medium" ? "#ca8a04" : "#6b7280";

      const emailResponse = await resend.emails.send({
        from: "FluentPass Monitor <alerts@fluentpass.de>",
        to: [adminEmail],
        subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: ${severityColor}; padding: 24px; border-radius: 12px 12px 0 0;">
              <span style="color: white; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">${alert.severity} ALERT</span>
              <h1 style="color: white; margin: 8px 0 0 0; font-size: 20px;">${alert.title}</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="color: #374151; margin: 0 0 16px 0;">
                <strong>Type:</strong> ${alert.alert_type}<br>
                <strong>Time:</strong> ${new Date(alert.created_at).toLocaleString()}
              </p>
              
              ${alert.details ? `
                <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; margin-top: 16px;">
                  <strong style="color: #374151; display: block; margin-bottom: 8px;">Details:</strong>
                  <pre style="color: #6b7280; font-size: 12px; overflow: auto; margin: 0;">${JSON.stringify(alert.details, null, 2)}</pre>
                </div>
              ` : ""}
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 24px; text-align: center;">
                This is an automated alert from FluentPass Platform Monitoring.
              </p>
            </div>
          </div>
        `,
      });

      console.log("Alert email sent:", emailResponse);

      return new Response(JSON.stringify({ 
        success: true, 
        emailId: emailResponse.data?.id 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: "Must provide alertId or digest: true" 
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Email sending error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
