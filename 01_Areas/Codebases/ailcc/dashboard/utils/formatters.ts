export const slugify = (text: string): string => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-') // Replace spaces, non-word chars and dashes with a single dash
        .replace(/^-+|-+$/g, '')    // Remove leading/trailing dashes
        .replace(/['"]/g, '');      // Remove quotes
};

export const sanitizeId = (text: string): string => {
    if (!text) return 'id-' + Math.random().toString(36).substr(2, 9);
    // Remove anything that isn't alphanumeric or hyphen/underscore
    return 'id-' + text.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 50);
};
