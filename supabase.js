
window.SUPABASE_URL = "YOUR_SUPABASE_URL";
window.SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

(function () {
  if (!window.supabase) {
    console.error("Supabase SDK chưa được nạp");
    return;
  }
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY || window.SUPABASE_URL.includes("YOUR_")) {
    console.warn("Chưa điền SUPABASE_URL / SUPABASE_ANON_KEY trong supabase.js");
  }
  window.supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
})();
