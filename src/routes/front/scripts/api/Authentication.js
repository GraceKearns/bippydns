const API_BASE = '/api';
const PUBLIC_BASE = '/public';

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
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const err = new Error(data.message || 'Network response was not ok');
        err.unverified = data.unverified === true;
        throw err;
    }
    return response.ok;
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