export default async function handler(req, res) {
  const key = process.env.LINEAR_API_KEY;
  if (!key) return res.json([]);
  try {
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': key },
      body: JSON.stringify({
        query: `{ issues(filter: { state: { type: { eq: "started" } } }, orderBy: updatedAt) {
          nodes { id identifier title url state { name } }
        } }`
      }),
    });
    const data = await response.json();
    res.json(data.data?.issues?.nodes ?? []);
  } catch {
    res.json([]);
  }
}
