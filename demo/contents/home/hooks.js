import useSWR from "swr";
import { fetchApronMap, fetchCommonDictList } from "../../apis/pvg";

const prefix = '000001';

export const useFloorData = (pvgData, token, roleIdsStr, selectedLine) => {
    const { data: {
        mapping: apronMap,
        // lastUpdateTs
    } = {}, error } = useSWR(['/map/apron/v1', token, roleIdsStr], fetchApronMap, { refreshInterval: 60 * 1e3 });
    const apronRoomIdList = [];
    // if (!apronMap) return { data: pvgData, lastUpdateTs: Date.now(), }
    pvgData[0]?.room?.features.forEach(item => {
        if (item?.properties?.colorid.slice(0, prefix.length) === '000009') {
            if (selectedLine && item?.properties?.name === selectedLine?.name) {
                item.properties.colorid = `000009-${selectedLine.color}`;
            } else {
                item.properties.colorid = `000009`;
            }
        }
        if (!apronMap || !apronMap[item?.properties?.name] || item?.properties?.colorid.slice(0, prefix.length) !== prefix) return
        item.properties.colorid = `${prefix}-${apronMap[item?.properties?.name]}`;
        apronRoomIdList.push(item.properties.id);
    });
    return {
        data: pvgData,
        lastUpdateTs: Date.now(),
        apronRoomIdList
    }
}

export const useDictData = (token, roleIdsStr) => {
    const { data: {
        eventCategoryMapping,
        caseCategoryMapping,
        sourceCategoryMapping,
        propertyCategoryMapping
    } = {}, error } = useSWR([token, roleIdsStr], fetchCommonDictList, { refreshInterval: 120 * 1e3 });
    return {
        eventCategoryMapping,
        caseCategoryMapping,
        sourceCategoryMapping,
        propertyCategoryMapping
    }
}