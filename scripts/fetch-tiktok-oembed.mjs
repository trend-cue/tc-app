/**
 * Fetches TikTok oEmbed data for a list of URLs and prints mock-data entries.
 * Run: node scripts/fetch-tiktok-oembed.mjs
 */

const URLS = [
  // GYM
  { url: "https://www.tiktok.com/@win_dle/video/7469522451630951726", cluster: "gym" },
  { url: "https://www.tiktok.com/@jacked_paulus/video/6994935115000368390", cluster: "gym" },
  { url: "https://www.tiktok.com/@kimcasv/video/7058733500102413614", cluster: "gym" },
  { url: "https://www.tiktok.com/@allymcclayfits/video/7377488310245068064", cluster: "gym" },
  { url: "https://www.tiktok.com/@charlsieeelifts/video/7248453209751325998", cluster: "gym" },
  // TECH
  { url: "https://www.tiktok.com/@tiffintech/video/7505118171075071237", cluster: "tech" },
  { url: "https://www.tiktok.com/@tech_updt/video/7410382147959278855", cluster: "tech" },
  { url: "https://www.tiktok.com/@podcastcollective_/video/7279020516990553390", cluster: "tech" },
  { url: "https://www.tiktok.com/@top5_r1/video/7395910891918691590", cluster: "tech" },
  { url: "https://www.tiktok.com/@tech.gadgets.368/video/7636300127145118989", cluster: "tech" },
  // FASHION
  { url: "https://www.tiktok.com/@dianakonfederat/video/7489148112913616159", cluster: "fashion" },
  { url: "https://www.tiktok.com/@richelle_zh/video/7524788164637003064", cluster: "fashion" },
];

const CLUSTER_ACCENTS = {
  gym: "#7c6af7",
  tech: "#69c9d0",
  fashion: "#e1306c",
};

function videoIdFromUrl(url) {
  return url.match(/\/video\/(\d+)/)?.[1] ?? null;
}

function tiktokEmbedUrl(videoId) {
  return `https://www.tiktok.com/player/v1/${videoId}?controls=1&description=0&music_info=0`;
}

async function fetchOembed(videoUrl) {
  const endpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`;
  const res = await fetch(endpoint, {
    headers: { "user-agent": "Mozilla/5.0", accept: "application/json" },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

const results = [];

for (const { url, cluster } of URLS) {
  const videoId = videoIdFromUrl(url);
  if (!videoId) { console.error("No video ID:", url); continue; }

  process.stdout.write(`Fetching ${url} ... `);
  try {
    const oe = await fetchOembed(url);
    const handle = url.match(/@([^/]+)/)?.[1] ?? "unknown";
    results.push({
      cluster,
      videoId,
      sourceUrl: url,
      embedUrl: tiktokEmbedUrl(videoId),
      handle: `@${handle}`,
      displayName: oe.author_name ?? handle,
      title: oe.title ?? "",
      thumbnailUrl: oe.thumbnail_url ?? null,
      thumbnailWidth: oe.thumbnail_width ?? null,
      thumbnailHeight: oe.thumbnail_height ?? null,
      accent: CLUSTER_ACCENTS[cluster],
    });
    console.log(`OK — "${oe.author_name}" — thumb: ${oe.thumbnail_url ? "yes" : "no"}`);
  } catch (e) {
    console.log(`FAILED: ${e.message}`);
    // Still add with fallback so we know the video ID
    const handle = url.match(/@([^/]+)/)?.[1] ?? "unknown";
    results.push({
      cluster,
      videoId,
      sourceUrl: url,
      embedUrl: tiktokEmbedUrl(videoId),
      handle: `@${handle}`,
      displayName: handle,
      title: "",
      thumbnailUrl: null,
      accent: CLUSTER_ACCENTS[cluster],
      failed: true,
    });
  }
}

console.log("\n\n=== RESULTS JSON ===\n");
console.log(JSON.stringify(results, null, 2));
