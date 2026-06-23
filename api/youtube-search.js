// api/youtube-search.js
// Busca un video de ejercicio SOLO dentro del canal del coach (Dragon Team Mexico).
// Si no encuentra nada relevante en el canal, da un link de búsqueda general como respaldo.

const CHANNEL_ID = 'UCRS_j2NaiSQO_rzFgbgYqkA'; // DRAGON TEAM MEXICO

export default async function handler(req, res) {
  const q = req.query.q;
  if (!q) {
    return res.status(400).json({ error: 'Falta el parámetro q (nombre del ejercicio)' });
  }

  const API_KEY = process.env.YOUTUBE_API_KEY;
  const fallbackUrl = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q + ' tecnica');

  if (!API_KEY) {
    // No hay clave configurada todavía: regresamos el respaldo sin tronar la app
    return res.status(200).json({ url: fallbackUrl, fallback: true, motivo: 'Falta YOUTUBE_API_KEY en Vercel' });
  }

  try {
    const apiUrl = 'https://www.googleapis.com/youtube/v3/search'
      + '?part=snippet'
      + '&channelId=' + CHANNEL_ID
      + '&q=' + encodeURIComponent(q)
      + '&type=video'
      + '&maxResults=1'
      + '&key=' + API_KEY;

    const r = await fetch(apiUrl);
    const data = await r.json();

    const item = data && data.items && data.items[0];
    if (item && item.id && item.id.videoId) {
      return res.status(200).json({
        url: 'https://www.youtube.com/watch?v=' + item.id.videoId,
        titulo: (item.snippet && item.snippet.title) || '',
        fallback: false
      });
    }

    // El canal no tiene nada que coincida con esta búsqueda: respaldo
    return res.status(200).json({ url: fallbackUrl, fallback: true, motivo: 'Sin resultados en el canal' });
  } catch (e) {
    return res.status(200).json({ url: fallbackUrl, fallback: true, motivo: 'Error: ' + e.message });
  }
}
