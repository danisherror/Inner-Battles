// Old links look like sin.html?id=Pride&topic=effects&lens=buddhism; send them to the static page.
// The valid ids are in data attributes on <main>, written by build.js.
(() => {
  const main = document.querySelector("main[data-topics]");
  const topics = JSON.parse(main.dataset.topics);
  const lenses = main.dataset.lenses.split(" ");
  let saved = null;
  try { saved = localStorage.getItem("lens"); } catch (e) {}
  const q = new URLSearchParams(location.search);
  const id = q.get("id");
  if (!Object.hasOwn(topics, id)) return;
  const topic = topics[id].includes(q.get("topic")) ? q.get("topic") : topics[id][0];
  const lens = [q.get("lens"), saved].find(l => lenses.includes(l)) || lenses[0];
  location.replace(id + "/" + topic + "/" + lens + ".html");
})();
