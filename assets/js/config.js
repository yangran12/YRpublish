/* ==========================================================================
   Site configuration
   --------------------------------------------------------------------------
   Edit this file to change site-wide settings. Nothing else needs to change.
   ========================================================================== */

window.TDF_CONFIG = {

  /* ---------------------------------------------------------------------
     1. Identity
     --------------------------------------------------------------------- */

  name:      "Transactions on Decarbonization Frontiers",
  shortName: "TDF",
  subtitle:  "Electric Mobility · Renewable Energy · Smart Grids · Artificial Intelligence",

  // Shown in the footer and on the submit page. Use an address you actually read.
  // NOTE: this address is rendered into a public web page and will be scraped by
  // spambots. If it is tied to a phone number, consider a dedicated address.
  contactEmail: "18755246110@163.com",

  // The founding editor, shown on the about page and in the footer.
  // An ORCID iD is a persistent researcher identifier — https://orcid.org
  editorName:  "Ran Yang",
  editorOrcid: "0009-0002-4895-7752",

  // Your GitHub organisation/repo, used for the submission queue and review archive.
  githubRepo: "https://github.com/yangran12/YRpublish",

  // Zenodo community that collects accepted papers. Create it at zenodo.org/communities
  zenodoCommunity: "https://zenodo.org/communities/tdf",

  /* ---------------------------------------------------------------------
     2. Supabase (accounts + submission database)
     ---------------------------------------------------------------------
     NOT CONFIGURED YET -> the site still works. Sign-in is disabled and the
     submit form falls back to email. Fill these two in to switch it on.

     How to get them (free, ~5 minutes):
       1. Go to https://supabase.com and create a project
       2. Project Settings -> API
       3. Copy "Project URL" and the "anon public" key below
       4. Run the SQL in docs/supabase-setup.md in the SQL editor
     --------------------------------------------------------------------- */

  // NOTE: the project root only — supabase-js appends /auth/v1 and /rest/v1 itself.
  supabaseUrl:     "https://eaueuxvizikfepbfponj.supabase.co",   // e.g. "https://abcdefgh.supabase.co"
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhdWV1eHZpemlrZmVwYmZwb25qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0ODUxMDYsImV4cCI6MjEwNjA2MTEwNn0.D2bqjMsI7idKusWO7zKZHoWO6w5cfcd8_4la3K2tgg0",   // e.g. "eyJhbGciOiJIUzI1NiIsInR5cCI6..."

  /* ---------------------------------------------------------------------
     3. Editorial defaults
     --------------------------------------------------------------------- */

  // Rough turnaround the editorial office commits to.
  reviewTurnaroundDays: 14,
  initialScreeningDays: 3,

  // Language the site loads in before the visitor picks one: "en" or "zh"
  defaultLang: "en",
};

/* Do not edit below this line. ------------------------------------------------- */

/* Whether accounts are actually available. Every page checks this. */
window.TDF_CONFIG.authEnabled = Boolean(
  window.TDF_CONFIG.supabaseUrl && window.TDF_CONFIG.supabaseAnonKey
);
