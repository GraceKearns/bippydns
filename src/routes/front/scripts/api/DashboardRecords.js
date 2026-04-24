const API_BASE = '/api';

export async function deleteRecord(userId, recordId) {
    const response = await fetch(`${API_BASE}/delete-user-record`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
           
        },
        body: JSON.stringify({ userId, recordId })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error || 'Failed to delete record');
    }
    return data;
}

export async function updateRecord(userId, record_id, ipv4, ipv6) {
    console.log(record_id, ipv4, ipv6)
    const response = await fetch(`${API_BASE}/edit-user-record`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, record_id, ipv4, ipv6 })
    });
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
        throw new Error(data.error || 'Failed to update record');
    }
    return data;
}
export async function getUserRecords() {
    const response = await fetch(`${API_BASE}/view-user-records`, {
        credentials: 'include'
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error || 'Could not get session status');
    }
    return data.records || [];
}

export async function postNewRecord(domain) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/add-user-record`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: domain })
    });
    console.log(response)
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Could not add record');
    }
    return response.ok;
}