export const emptyOrRows = (rows: any): any[] => {
    if (!rows) {
        return [];
    }
    return rows;
}

const camelize = (s: string) => s.replace(/_./g, x=>x[1].toUpperCase())