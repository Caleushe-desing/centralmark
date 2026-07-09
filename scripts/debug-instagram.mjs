import "dotenv/config";

const accessToken = process.env.META_ACCESS_TOKEN;
const igAccountId = process.env.META_INSTAGRAM_ACCOUNT_ID;
const imageUrl =
  "https://www.mizo.cl/markmall/generated/offer-cmrb97wro0000zcnqx1r2s5gu.png";

async function main() {
  console.log("Image URL:", imageUrl);

  const imgRes = await fetch(imageUrl, { method: "HEAD" });
  console.log("Image HEAD:", imgRes.status, imgRes.headers.get("content-type"));

  const containerRes = await fetch(
    `https://graph.facebook.com/v21.0/${igAccountId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: "Test MarkMall",
        access_token: accessToken,
      }),
    }
  );
  const containerData = await containerRes.json();
  console.log("Container create:", JSON.stringify(containerData, null, 2));

  if (!containerData.id) return;

  for (let i = 0; i < 12; i++) {
    const statusRes = await fetch(
      `https://graph.facebook.com/v21.0/${containerData.id}?fields=status_code,status&access_token=${accessToken}`
    );
    const statusData = await statusRes.json();
    console.log(`Status poll ${i + 1}:`, statusData);

    if (statusData.status_code === "FINISHED") break;
    if (statusData.status_code === "ERROR") return;

    await new Promise((r) => setTimeout(r, 5000));
  }

  const publishRes = await fetch(
    `https://graph.facebook.com/v21.0/${igAccountId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: containerData.id,
        access_token: accessToken,
      }),
    }
  );
  const publishData = await publishRes.json();
  console.log("Publish:", JSON.stringify(publishData, null, 2));

  const debugRes = await fetch(
    `https://graph.facebook.com/v21.0/debug_token?input_token=${accessToken}&access_token=${accessToken}`
  );
  const debugData = await debugRes.json();
  console.log("Token debug:", JSON.stringify(debugData, null, 2));
}

main().catch(console.error);
