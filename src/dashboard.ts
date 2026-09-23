export function dashboardHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#07111f">
<title>DOLOR3V Microcloud</title>
<style>
*{box-sizing:border-box}
:root{
  color-scheme:dark;
  font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
}
body{
  margin:0;
  min-height:100vh;
  background:#07111f;
  color:#eaf2ff;
}
main{
  width:min(1180px,100%);
  margin:auto;
  padding:24px;
}
header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:20px;
  margin-bottom:24px;
}
h1,h2,p{margin-top:0}
.subtitle{
  color:#91a5bf;
}
.status{
  padding:8px 12px;
  border-radius:999px;
  background:#123b31;
  color:#75f0c5;
  font-size:13px;
  font-weight:700;
}
.grid{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(240px,1fr));
  gap:16px;
}
.card{
  background:#0d1b2e;
  border:1px solid #203653;
  border-radius:16px;
  padding:18px;
}
pre{
  margin:0;
  padding:14px;
  border-radius:10px;
  background:#050b14;
  color:#d8e7fa;
  white-space:pre-wrap;
  overflow:auto;
  min-height:70px;
}
a{
  color:#8fc7ff;
}
</style>
</head>
<body>
<main>
<header>
<div>
<h1>DOLOR3V Microcloud</h1>
<p class="subtitle">
Cloudflare Agents · AHP 0.9.0 · Pollinations · Browser Run
</p>
</div>
<div id="status" class="status">CHECKING</div>
</header>

<div class="grid">
<section class="card">
<h2>Runtime</h2>
<pre id="runtime">loading...</pre>
</section>

<section class="card">
<h2>AHP</h2>
<pre id="ahp">loading...</pre>
</section>

<section class="card">
<h2>AI</h2>
<pre id="ai">loading...</pre>
</section>

<section class="card">
<h2>Agent</h2>
<pre id="agent">loading...</pre>
</section>
</div>

<section class="card" style="margin-top:16px">
<h2>Agent WebSocket</h2>
<pre>/agents/MicrocloudAgentDO/default</pre>
</section>

<section class="card" style="margin-top:16px">
<h2>Agent State</h2>
<pre>/agents/MicrocloudAgentDO/default/state</pre>
</section>
</main>

<script>
(async function(){
  const status = document.querySelector("#status");

  try {
    const response = await fetch("/api/health", {
      cache: "no-store"
    });

    const data = await response.json();

    status.textContent = data.ok ? "ONLINE" : "ERROR";

    document.querySelector("#runtime").textContent =
      JSON.stringify({
        runtime: data.runtime,
        agents: data.agents,
        durableObjects: data.durableObjects,
        sqlite: data.sqlite,
        websocket: data.websocket
      }, null, 2);

    document.querySelector("#ahp").textContent =
      JSON.stringify({
        protocol: data.ahp
      }, null, 2);

    document.querySelector("#ai").textContent =
      JSON.stringify({
        provider: data.ai,
        base: data.base
      }, null, 2);

    document.querySelector("#agent").textContent =
      JSON.stringify({
        class: "MicrocloudAgentDO",
        endpoint: "/agents/MicrocloudAgentDO/default"
      }, null, 2);
  } catch (error) {
    status.textContent = "ERROR";
    document.querySelector("#runtime").textContent =
      String(error);
  }
})();
</script>
</body>
</html>`;
}
