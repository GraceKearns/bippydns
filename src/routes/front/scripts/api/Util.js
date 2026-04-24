const PUBLIC_BASE = '/public';

export async function fetchAllRecords() {
    const response = await fetch(`${PUBLIC_BASE}/get-collections`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
}

export async function fetchSessionStatus() {
    const response = await fetch(`${PUBLIC_BASE}/session`, {
        credentials: 'include'
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error || 'Could not get session status');
    }
    return data;
}

export async function fetchRecordImage(name) {
    const response = (await fetch(`${PUBLIC_BASE}/screenshot/${name}`));
    if (!response.ok) throw new Error('Network response was not ok');
    const result = await response.json()
    return result.image;
}