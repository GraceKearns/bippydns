

export async function fetchCollections() {
    const response = await fetch('/get-collections');
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
}

export async function signUp(email,password) {  
    const response = await fetch(`/post-sign-up`, {
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

export async function signIn(email,password) {  
    const response = await fetch(`/post-sign-in`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json().catch(()=>({}));
    
    if (!response.ok) {
        const err = new Error(data.message || 'Network response was not ok');
        err.unverified = data.unverified === true;
        throw err;
    }
    return response.ok;
}

export async function resendActivation(email) {
    const response = await fetch('/resend-activation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    const data = await response.json().catch(()=>({}));
    if (!response.ok) throw new Error(data.error || 'Could not resend activation');
    return data;
}

export async function signOut() {
    const response = await fetch('/sign-out', { method: 'POST' });
    const data = await response.json().catch(()=>({}));
    if (!response.ok) throw new Error(data.error || 'Sign out failed');
    return data;
}

export async function activateAccount(token) {
    const response = await fetch('/activate-account', {
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

export async function fetchSessionStatus() {
    const response = await fetch('/auth/session');
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error || 'Could not get session status');
    }
    return data;
}

export async function fetchUserCollections() {
    const response = await fetch('/view-user-records');
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error || 'Could not get session status');
    }
    return data.records || [];
}

export async function postNewUserCollection(domain) {
    const response = await fetch('/add-user-record',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: domain })
    });
    if (!response.ok) {
        throw new Error(response.error || 'Could not add record');
    }
    return response.ok;
}

export async function fetchImage(name) {
    const response = (await fetch(`/screenshot/${name}`));
    if (!response.ok) throw new Error('Network response was not ok');
    const result = await response.json()
    return result.image;
}

