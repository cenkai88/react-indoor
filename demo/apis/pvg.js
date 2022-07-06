const httpBase = HTTP_BASE;
const aaaBase = AAA_BASE;

const getAuthHeader = accessToken => ({
    Authorization: `Bearer ${accessToken}`
});

export const fetchApronMap = async (url, token) => {
    if (!token) return { }
    // const data = [
    //     { "stand": "120", "status": "CX" },
    //     { "stand": "121", "status": "DV" },
    //     { "stand": "122", "status": "NI" },
    //     { "stand": "123", "status": "RS" },
    //     { "stand": "124", "status": "XF" },
    // ];
    const { data } = await (await fetch(`${httpBase}${url}`, {
        headers: {
            ...getAuthHeader(token),
        }
    })).json();
    const result = {};
    data.forEach(item => {
        result[item.stand] = item.status;
    });
    return {
        mapping: result,
        lastUpdateTs: Date.now()
    }
}

export const fetchApronDetail = async (url, name, token) => {
    if (!name || !token) return {}
    // url
    const { data } = await (await fetch(`${httpBase}${url}`, {
        headers: {
            ...getAuthHeader(token),
        }
    })).json();
    return data
}

export const fetchEventList = async (url, token) => {
    if (!token || !url) return []
    const { data } = await (await fetch(`${httpBase}${url}`, {
        headers: {
            ...getAuthHeader(token),
        }
    })).json();
    return data.objects
}

export const fetchCaseList = async (url, token) => {
    if (!token || !url) return []
    const { data } = await (await fetch(`${httpBase}${url}`, {
        headers: {
            ...getAuthHeader(token),
        }
    })).json();
    return data.objects
}

export const fetchPropertyList = async (url, category, token) => {
    if (!token || !url) return []
    const { data } = await (await fetch(`${httpBase}${url}?category=${category}&count=100`, {
        headers: {
            ...getAuthHeader(token),
        }
    })).json();
    return data.objects
}

export const fetchEmergenceList = async (url, token) => {
    if (!token || !url) return []
    const { data } = await (await fetch(`${httpBase}${url}?status=OPEN&count=100`, {
        headers: {
            ...getAuthHeader(token),
        }
    })).json();
    return data.objects
}

export const fetchCommonDictList = async (token) => {
    if (!token) return []
    const [{ data: eventCategory }, { data: caseCategory }, { data: propertyCategory }, { data: sourceCategory }] = await Promise.all([
        (await fetch(`${httpBase}/category/event/v1`, { headers: getAuthHeader(token) })).json(),
        (await fetch(`${httpBase}/category/case/v1`, { headers: getAuthHeader(token) })).json(),
        (await fetch(`${httpBase}/category/property/v1`, { headers: getAuthHeader(token) })).json(),
        (await fetch(`${httpBase}/category/source/v1`, { headers: getAuthHeader(token) })).json(),
    ]);

    return {
        eventCategoryMapping: Object.fromEntries(eventCategory.map(item => [item.id, item.name])),
        caseCategoryMapping: Object.fromEntries(caseCategory.map(item => [item.id, item.name])),
        propertyCategoryMapping: Object.fromEntries(propertyCategory.map(item => [item.id, item.name])),
        sourceCategoryMapping: Object.fromEntries(sourceCategory.map(item => [item.id, item.name])),
    }
}

export const fetchRefreshToken = async (refreshToken) => {
    if (!refreshToken) return ''
    const { data } = await (await fetch(`${aaaBase}/login/refresh_token/v1`, {
        method: 'POST',
        body: JSON.stringify({
            refreshToken
        })
    })).json();
    return data?.accessToken
}
