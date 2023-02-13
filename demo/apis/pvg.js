const httpBase = HTTP_BASE;
const aaaBase = AAA_BASE;
const videoBase = 'http://10.50.247.17:8099';

const getAuthHeader = accessToken => ({
    Authorization: `Bearer ${accessToken}`
});

export const fetchApronMap = async (url, token, roleIdsStr) => {
    if (!token || !roleIdsStr) return {}
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
            'x-role-ids': roleIdsStr
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

export const fetchApronDetail = async (url, name, token, roleIdsStr) => {
    if (!name || !token || !roleIdsStr) return {}
    // url
    const { data } = await (await fetch(`${httpBase}${url}`, {
        headers: {
            ...getAuthHeader(token),
            'x-role-ids': roleIdsStr
        }
    })).json();
    return data
}

export const fetchEventList = async (url, token, roleIdsStr) => {
    if (!token || !url || !roleIdsStr) return []
    const { data } = await (await fetch(`${httpBase}${url}`, {
        headers: {
            ...getAuthHeader(token),
            'x-role-ids': roleIdsStr
        }
    })).json();
    return data.objects
}

export const fetchCaseList = async (url, token, roleIdsStr) => {
    if (!token || !url || !roleIdsStr) return []
    const { data } = await (await fetch(`${httpBase}${url}`, {
        headers: {
            ...getAuthHeader(token),
            'x-role-ids': roleIdsStr
        }
    })).json();
    return data.objects
}

export const fetchPropertyList = async (url, category, token, roleIdsStr) => {
    if (!token || !url || !roleIdsStr) return []
    const { data } = await (await fetch(`${httpBase}${url}?category=${category}&count=1000`, {
        headers: {
            ...getAuthHeader(token),
            'x-role-ids': roleIdsStr
        }
    })).json();
    return data.objects
}

export const fetchEmergenceList = async (url, token, roleIdsStr) => {
    if (!token || !url || !roleIdsStr) return []
    const { data } = await (await fetch(`${httpBase}${url}?status=OPEN&count=1000`, {
        headers: {
            ...getAuthHeader(token),
            'x-role-ids': roleIdsStr
        }
    })).json();
    return data.objects
}

export const fetchCommonDictList = async (token, roleIdsStr) => {
    if (!token || !roleIdsStr) return []
    const [{ data: eventCategory }, { data: caseCategory }, { data: propertyCategory }, { data: sourceCategory }] = await Promise.all([
        (await fetch(`${httpBase}/category/event/v1`, { headers: getAuthHeader(token), 'x-role-ids': roleIdsStr })).json(),
        (await fetch(`${httpBase}/category/case/v1`, { headers: getAuthHeader(token), 'x-role-ids': roleIdsStr })).json(),
        (await fetch(`${httpBase}/category/property/v1`, { headers: getAuthHeader(token), 'x-role-ids': roleIdsStr })).json(),
        (await fetch(`${httpBase}/category/source/v1`, { headers: getAuthHeader(token), 'x-role-ids': roleIdsStr })).json(),
    ]);

    return {
        eventCategoryMapping: Object.fromEntries(eventCategory.map(item => [item.id, item.name])),
        caseCategoryMapping: Object.fromEntries(caseCategory.map(item => [item.id, item.name])),
        propertyCategoryMapping: Object.fromEntries(propertyCategory.map(item => [item.id, item.name])),
        sourceCategoryMapping: Object.fromEntries(sourceCategory.map(item => [item.id, item.name])),
    }
}

export const fetchVideoUrl = async (url, cameraName, uuid) => {
    if (!url || !cameraName || !uuid) return ''
    const { url: videoUrl } = await (await fetch(`${videoBase}${url}`, {
        method: 'POST',
        body: `name=${cameraName}&uuid=${uuid}&type=hls&action=play`
    })).json();
    return videoUrl
}

export const fetchHisVideoUrl = async (url, cameraName, uuid, startTime, endTime) => {
    if (!url || !cameraName || !uuid || !startTime || !endTime) return ''
    const { url: videoUrl } = await (await fetch(`${videoBase}${url}`, {
        method: 'POST',
        body: `name=${cameraName}&uuid=${uuid}&type=ws&action=play&starttime=${startTime}&endtime=${endTime}`
    })).json();
    return videoUrl
}

export const stopVideoPlay = async (cameraName, uuid, type = 'hls') => {
    if (!cameraName || !uuid) return ''
    const { url: videoUrl } = await (await fetch(`${videoBase}/video/${type === 'hls' ? 'playVideo' : 'playHisVideo'}`, {
        method: 'POST',
        body: `name=${cameraName}&uuid=${uuid}&type=${type}&action=pause`
    })).json();
    return videoUrl
}

