export const parseColor = color => {
    if (!color) return [0, 0, 0, 1];
    const arr = [];
    if (color.substr(0, 1) === '#') {
        const str = color.slice(1);
        for (let i = 0; i < 5; i += 2) {
            const num = parseInt(str.substr(i, 2), 16) / 255;
            arr.push(num || 0);
        }
        arr.push(1);
    }
    else if (color.substr(0, 4) === 'rgba') {
        const str = color.slice(5, -1);
        const splitArr = str.split(',');
        for (let i = 0; i < 3; i += 1) {
            const num = Number(splitArr[i]) / 255;
            arr.push(num || 0);
        }
        arr.push(Number(splitArr[3]) || 1);
    }
    else if (color.substr(0, 3) === 'rgb') {
        const str = color.slice(4, -1);
        const splitArr = str.split(',');
        for (let i = 0; i < 3; i += 1) {
            const num = Number(splitArr[i]) / 255;
            arr.push(num || 0);
        }
        arr.push(1);
    }
    if (arr.length !== 4) {
        return [0, 0, 0, 1];
    }
    else {
        return arr;
    }
}

export const getStyle = (layout, name, properties) => {
    const keys = layout.keys, values = layout.values;
    let style = layout[name];
    if (keys && values && properties) {
        for (let i = 0; i < keys.length; i += 1) {
            const otherLayout = values[properties[keys[i]]];
            if (otherLayout && otherLayout[name] !== undefined) {
                style = otherLayout[name];
                return style;
            }
        }
    }
    return style;
}

export default {
    parseColor,
    getStyle,
};