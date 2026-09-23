import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const TABLE_SMILE_EVENTS = "tblp04smileevents";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-code",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

function normalizeAccount(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function isValidAccount(value: string): boolean {
  return /^[a-zA-Z0-9._%+-]+$/.test(normalizeAccount(value));
}

function getServiceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function smileTypeLabel(type: unknown): string {
  switch (Number(type)) {
    case 1: return "微笑";
    case 2: return "問候";
    case 3: return "鼓勵";
    case 4: return "幫助";
    default: return "善意";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ success: false, message: "Method not allowed" }, 405);

  try {
    const body = await req.json();

    const account = normalizeAccount(body?.account);
    const mode = String(body?.mode ?? "").trim();
    const pageRaw = Number(body?.page ?? 1);
    const page = Number.isFinite(pageRaw) ? Math.max(Math.floor(pageRaw), 1) : 1;
    const pageSize = 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    if (!isValidAccount(account)) {
      return jsonResponse({ success: false, code: "INVALID_ACCOUNT", message: "帳號格式不正確。" }, 400);
    }

    if (!["smiler", "responder"].includes(mode)) {
      return jsonResponse({ success: false, code: "INVALID_MODE", message: "mode 必須是 smiler 或 responder。" }, 400);
    }

    const supabase = getServiceClient();

    const filterColumn = mode === "smiler" ? "smiler_account" : "responder_account";

    const { data, error, count } = await supabase
      .from(TABLE_SMILE_EVENTS)
      .select("created_at, smiler_account, smiler_nickname, responder_account, responder_nickname, smile_type", { count: "exact" })
      .eq(filterColumn, account)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      return jsonResponse({ success: false, code: error.code, message: error.message }, 500);
    }

    const rows = (data ?? []).map((row: any) => ({
      created_at: row.created_at,
      smiler_account: row.smiler_account,
      smiler_nickname: row.smiler_nickname || row.smiler_account,
      responder_account: row.responder_account,
      responder_nickname: row.responder_nickname || row.responder_account,
      smile_type: row.smile_type,
      smile_type_label: smileTypeLabel(row.smile_type),
    }));

    const total = count ?? 0;
    const total_pages = Math.max(Math.ceil(total / pageSize), 1);

    return jsonResponse({
      success: true,
      mode,
      account,
      page,
      page_size: pageSize,
      total,
      total_pages,
      rows,
    });
  } catch (error) {
    return jsonResponse({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    }, 500);
  }
});
