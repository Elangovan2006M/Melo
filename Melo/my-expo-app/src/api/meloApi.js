const API_BASE_URL = 'http://localhost:3001';

export const getHomeFeed = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/getHomeFeed`);
    if (!response.ok) throw new Error('Failed to fetch home feed');
    return await response.json();
  } catch (error) {
    console.error(error)
    return null;
  }
};

export const searchApi = async (keyword, lang = 'ta') => {
  try {
    const response = await fetch(`${API_BASE_URL}/search?keyword=${keyword}&lang=${lang}`);
    if (!response.ok) throw new Error('Failed to search');
    return await response.json();
  } catch (error) {
    console.log(error)
    return [];
  }
};

export const getLanguageHomePage = async (lang = 'ta') => {
  try {
    const response = await fetch(`${API_BASE_URL}/getLanguageHomePage?lang=${lang}`);
    if (!response.ok) throw new Error('Failed to fetch lang home page');
    return await response.json();
  } catch (error) {
    return null;
  }
};

export const getAlbumDetails = async (path, lang = 'ta') => {
  try {
    const url = new URL(path);
    const justPath = url.pathname;

    const response = await fetch(`${API_BASE_URL}/getAlbumDetails?path=${justPath}&lang=${lang}`);
    if (!response.ok) throw new Error('Failed to fetch album details');
    
    const data = await response.json();
    
    const processedTracks = data.tracks.map(track => ({
      ...track,
      albumPageUrl: path,
      lang: lang,
    }));

    return { ...data, tracks: processedTracks };

  } catch (error) {
    return null;
  }
};