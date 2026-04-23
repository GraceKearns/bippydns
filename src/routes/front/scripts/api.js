/*
---------------
GET
---------------
*/

const API_BASE = '/api';
const PUBLIC_BASE = '/public';
export async function fetchCollections() {
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

export async function fetchUserCollections() {
    const response = await fetch(`${API_BASE}/view-user-records`, {
        credentials: 'include'
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error || 'Could not get session status');
    }
    return data.records || [];
}

export async function fetchImage(name) {
    const response = (await fetch(`${PUBLIC_BASE}/screenshot/${name}`));
    if (!response.ok) throw new Error('Network response was not ok');
    const result = await response.json()
    return result.image;
}

/*
---------------
POST
---------------
*/

export async function signUp(email, password) {
    const response = await fetch(`${PUBLIC_BASE}/post-sign-up`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error || 'Network response was not ok');
    }
    return response.ok;
}

export async function signIn(email, password) {
    const response = await fetch(`${PUBLIC_BASE}/post-sign-in`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    console.log("sign in finished" )
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const err = new Error(data.message || 'Network response was not ok');
        err.unverified = data.unverified === true;
        throw err;
    }
    return response.ok;
}

export async function resendActivation(email) {
    const response = await fetch(`${PUBLIC_BASE}/resend-activation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Could not resend activation');
    return data;
}

export async function signOut() {
    const response = await fetch(`${API_BASE}/sign-out`,
        {
            method: 'POST',
            credentials: 'include'
        }                
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Sign out failed');
    return data;
}

export async function activateAccount(token) {
    const response = await fetch(`${PUBLIC_BASE}/activate-account`, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error || 'Activation failed');
    }
    return data;
}


export async function deleteRecord(userId, recordId) {
    const token = localStorage.getItem("token");
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

export async function postNewUserCollection(domain) {
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


