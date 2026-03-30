
window.SUPABASE_URL = "https://unlrlmxlngxhstbnrzax.supabase.co";
window.SUPABASE_ANON_KEY = "sb_publishable_DB9DIVS7RWnE4rEfY4GaHg_Kwc8rhya";

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
