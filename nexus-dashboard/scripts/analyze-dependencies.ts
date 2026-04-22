import madge from 'madge';
import fs from 'fs';
import path from 'path';

const config = {
    baseDir: path.join(process.cwd()),
    includeNpm: false,
    fileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    excludeRegExp: [/node_modules/, /.next/, /dist/],
};

function calculateComplexity(filePath: string): number {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n').length;
        const branches = (content.match(/if\s*\(|for\s*\(|while\s*\(|switch\s*\(|case\s+|\?\s*.*:/g) || []).length;
        return lines + (branches * 5); // Heuristic score
    } catch {
        return 0;
    }
}

async function run() {
    console.log('[DepAnalyze] Starting analysis of:', config.baseDir);
    const res = await madge(config.baseDir, config);
    const tree = res.obj();

    const nodes: any[] = [];
    const links: any[] = [];

    Object.keys(tree).forEach(file => {
        const absolutePath = path.join(config.baseDir, file);
        nodes.push({
            id: file,
            path: absolutePath,
            group: file.includes('pages') ? 1 : (file.includes('components') ? 2 : 3),
            complexity: calculateComplexity(absolutePath)
        });
        tree[file].forEach((dep: string) => {
            links.push({ source: file, target: dep });
        });
    });

    const output = { nodes, links };
    fs.writeFileSync(path.join(process.cwd(), '.dependency-graph.json'), JSON.stringify(output, null, 2));
    console.log('[DepAnalyze] Done. Found', nodes.length, 'nodes and', links.length, 'links.');
}

run().catch(err => {
    console.error('[DepAnalyze] Failed:', err);
    process.exit(1);
});
