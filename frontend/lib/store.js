export const getReports = () => { if (typeof window === 'undefined') return []; try { return JSON.parse(localStorage.getItem('research_reports') || '[]') } catch { return [] } };
export const saveReports = (reports) => localStorage.setItem('research_reports', JSON.stringify(reports));
export const getUser = () => { if (typeof window === 'undefined') return null; try { return JSON.parse(localStorage.getItem('research_user') || 'null') } catch { return null } };
export const setUser = (user) => localStorage.setItem('research_user', JSON.stringify(user));
export const clearUser = () => localStorage.removeItem('research_user');
export const reportSections = ['introduction', 'background', 'key_findings', 'benefits', 'challenges', 'conclusion', 'references'];
export function validateReport(r) { return !!r && typeof r.title === 'string' && ['introduction', 'background', 'conclusion'].every(k => typeof r[k] === 'string') && ['key_findings', 'benefits', 'challenges', 'references'].every(k => Array.isArray(r[k])); }
