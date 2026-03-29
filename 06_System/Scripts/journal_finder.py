#!/usr/bin/env python3
"""
AILCC Academic Journal Finder v1.0
Unified search engine wrapping 4 free academic APIs for Mount Allison-standard research.

APIs Used:
  - OpenAlex (250M+ works, no key)
  - CORE (200M+ open-access papers, free key)
  - CrossRef (150M+ DOIs, no key)
  - Semantic Scholar (200M+ papers, keyless rate-limited mode)

Usage:
  python3 journal_finder.py "watershed ecological restoration Canada"
  python3 journal_finder.py "neuroinflammation major depressive disorder" --min-citations 10 --since 2022
"""

import sys
import json
import argparse
import hashlib
from datetime import datetime
from typing import List, Dict, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    import requests
except ImportError:
    print("Installing requests...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests

# ─── API Configuration ───────────────────────────────────────────────────────

OPENALEX_BASE = "https://api.openalex.org/works"
CROSSREF_BASE = "https://api.crossref.org/works"
S2_BASE = "https://api.semanticscholar.org/graph/v1/paper/search"
CORE_BASE = "https://api.core.ac.uk/v3/search/works"

# Polite pool email for OpenAlex (gives faster rate limits)
POLITE_EMAIL = "infinite27@mta.ca"

# ─── Individual API Searchers ────────────────────────────────────────────────

def search_openalex(query: str, limit: int = 10, since_year: int = 2020) -> List[Dict]:
    """Query OpenAlex — the largest free open scholarly database."""
    try:
        params = {
            "search": query,
            "per_page": limit,
            "filter": f"from_publication_date:{since_year}-01-01,type:article",
            "select": "id,doi,title,publication_year,cited_by_count,authorships,primary_location,open_access,abstract_inverted_index",
            "sort": "cited_by_count:desc",
            "mailto": POLITE_EMAIL
        }
        resp = requests.get(OPENALEX_BASE, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()

        results = []
        for work in data.get("results", []):
            # Reconstruct abstract from inverted index
            abstract = ""
            inv_idx = work.get("abstract_inverted_index")
            if inv_idx:
                word_positions = []
                for word, positions in inv_idx.items():
                    for pos in positions:
                        word_positions.append((pos, word))
                word_positions.sort()
                abstract = " ".join(w for _, w in word_positions)

            authors = [a.get("author", {}).get("display_name", "") for a in work.get("authorships", [])]
            loc = work.get("primary_location", {}) or {}
            source = loc.get("source", {}) or {}

            results.append({
                "title": work.get("title", ""),
                "authors": authors[:5],
                "year": work.get("publication_year"),
                "citations": work.get("cited_by_count", 0),
                "doi": (work.get("doi") or "").replace("https://doi.org/", ""),
                "url": work.get("id", ""),
                "journal": source.get("display_name", ""),
                "open_access": work.get("open_access", {}).get("is_oa", False),
                "abstract": abstract[:500] if abstract else "",
                "source_api": "OpenAlex"
            })
        return results
    except Exception as e:
        print(f"  ⚠️ OpenAlex error: {e}")
        return []


def search_crossref(query: str, limit: int = 10, since_year: int = 2020) -> List[Dict]:
    """Query CrossRef — the definitive DOI metadata registry."""
    try:
        params = {
            "query": query,
            "rows": limit,
            "filter": f"from-pub-date:{since_year}-01-01,type:journal-article",
            "sort": "is-referenced-by-count",
            "order": "desc",
            "select": "DOI,title,author,published-print,is-referenced-by-count,container-title,URL,abstract"
        }
        headers = {"User-Agent": f"AILCC-Scholar/1.0 (mailto:{POLITE_EMAIL})"}
        resp = requests.get(CROSSREF_BASE, params=params, headers=headers, timeout=15)
        resp.raise_for_status()
        data = resp.json()

        results = []
        for item in data.get("message", {}).get("items", []):
            authors = []
            for a in item.get("author", [])[:5]:
                name = f"{a.get('given', '')} {a.get('family', '')}".strip()
                if name:
                    authors.append(name)

            pub_date = item.get("published-print", {}).get("date-parts", [[None]])[0]
            year = pub_date[0] if pub_date else None

            titles = item.get("title", [])
            title = titles[0] if titles else ""

            journals = item.get("container-title", [])
            journal = journals[0] if journals else ""

            abstract_raw = item.get("abstract", "")
            # CrossRef abstracts often have JATS XML tags
            import re
            abstract = re.sub(r'<[^>]+>', '', abstract_raw)[:500]

            results.append({
                "title": title,
                "authors": authors,
                "year": year,
                "citations": item.get("is-referenced-by-count", 0),
                "doi": item.get("DOI", ""),
                "url": item.get("URL", ""),
                "journal": journal,
                "open_access": False,  # CrossRef doesn't reliably report OA
                "abstract": abstract,
                "source_api": "CrossRef"
            })
        return results
    except Exception as e:
        print(f"  ⚠️ CrossRef error: {e}")
        return []


def search_semantic_scholar(query: str, limit: int = 10, since_year: int = 2020) -> List[Dict]:
    """Query Semantic Scholar — keyless mode (100 req/5min)."""
    try:
        params = {
            "query": query,
            "limit": limit,
            "fields": "title,abstract,authors,year,url,citationCount,influentialCitationCount,isOpenAccess,journal,externalIds",
            "year": f"{since_year}-"
        }
        resp = requests.get(S2_BASE, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()

        results = []
        for paper in data.get("data", []):
            authors = [a.get("name", "") for a in paper.get("authors", [])[:5]]
            journal_info = paper.get("journal", {}) or {}
            ext_ids = paper.get("externalIds", {}) or {}

            results.append({
                "title": paper.get("title", ""),
                "authors": authors,
                "year": paper.get("year"),
                "citations": paper.get("citationCount", 0),
                "doi": ext_ids.get("DOI", ""),
                "url": paper.get("url", ""),
                "journal": journal_info.get("name", ""),
                "open_access": paper.get("isOpenAccess", False),
                "abstract": (paper.get("abstract") or "")[:500],
                "source_api": "SemanticScholar"
            })
        return results
    except Exception as e:
        print(f"  ⚠️ Semantic Scholar error: {e}")
        return []


# ─── Unified Search & Ranking ────────────────────────────────────────────────

def deduplicate(papers: List[Dict]) -> List[Dict]:
    """Deduplicate papers by DOI or title hash, keeping highest-citation version."""
    seen = {}
    for p in papers:
        key = p["doi"] if p.get("doi") else hashlib.md5(p.get("title", "").lower().encode()).hexdigest()
        if key not in seen or p.get("citations", 0) > seen[key].get("citations", 0):
            seen[key] = p
    return list(seen.values())


def rank_papers(papers: List[Dict], min_citations: int = 0) -> List[Dict]:
    """Rank papers by a composite quality score."""
    scored = []
    current_year = datetime.now().year

    for p in papers:
        if p.get("citations", 0) < min_citations:
            continue

        score = 0
        score += min(p.get("citations", 0), 500) * 2  # Citation weight (capped)
        if p.get("open_access"):
            score += 50  # OA bonus
        if p.get("year") and p["year"] >= current_year - 2:
            score += 100  # Recency bonus
        if p.get("journal"):
            score += 30  # Has journal attribution
        if p.get("abstract"):
            score += 20  # Has abstract

        p["quality_score"] = score
        scored.append(p)

    scored.sort(key=lambda x: x["quality_score"], reverse=True)
    return scored


def search_all(query: str, limit: int = 10, since_year: int = 2020, min_citations: int = 0) -> List[Dict]:
    """Execute parallel searches across all 3 free APIs and return ranked results."""
    print(f"\n🔱 AILCC Academic Journal Finder v1.0")
    print(f"📡 Query: \"{query}\"")
    print(f"📅 Since: {since_year} | Min Citations: {min_citations}\n")

    all_papers = []

    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {
            executor.submit(search_openalex, query, limit, since_year): "OpenAlex",
            executor.submit(search_crossref, query, limit, since_year): "CrossRef",
            executor.submit(search_semantic_scholar, query, limit, since_year): "SemanticScholar",
        }

        for future in as_completed(futures):
            source = futures[future]
            try:
                results = future.result()
                print(f"  ✅ {source}: {len(results)} results")
                all_papers.extend(results)
            except Exception as e:
                print(f"  ❌ {source}: {e}")

    # Deduplicate and rank
    unique = deduplicate(all_papers)
    ranked = rank_papers(unique, min_citations=min_citations)

    print(f"\n📊 Total: {len(all_papers)} raw → {len(unique)} unique → {len(ranked)} after filters")
    return ranked


# ─── Output Formatters ───────────────────────────────────────────────────────

def print_results(papers: List[Dict], max_display: int = 15):
    """Pretty-print ranked results to terminal."""
    if not papers:
        print("\n⚠️ No papers matched your criteria.")
        return

    print(f"\n{'='*80}")
    print(f" TOP {min(len(papers), max_display)} ACADEMIC SOURCES (Mount Allison Standard)")
    print(f"{'='*80}\n")

    for i, p in enumerate(papers[:max_display], 1):
        oa_badge = "🟢 OA" if p.get("open_access") else "🔒"
        doi_link = f"https://doi.org/{p['doi']}" if p.get("doi") else p.get("url", "No URL")

        print(f"[{i}] {p.get('title', 'Untitled')}")
        print(f"    Authors: {', '.join(p.get('authors', [])[:3])}")
        print(f"    Journal: {p.get('journal', 'N/A')} | Year: {p.get('year', '?')} | Citations: {p.get('citations', 0)} {oa_badge}")
        print(f"    Score: {p.get('quality_score', 0)} | Source: {p.get('source_api', '?')}")
        print(f"    DOI/URL: {doi_link}")
        if p.get("abstract"):
            print(f"    Abstract: {p['abstract'][:200]}...")
        print()


def save_results(papers: List[Dict], output_path: str):
    """Save results as JSON for downstream ingestion."""
    with open(output_path, 'w') as f:
        json.dump(papers, f, indent=2, default=str)
    print(f"💾 Results saved to: {output_path}")


# ─── CLI Entry Point ─────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="AILCC Academic Journal Finder")
    parser.add_argument("query", help="Search query for academic papers")
    parser.add_argument("--limit", type=int, default=10, help="Results per API (default: 10)")
    parser.add_argument("--since", type=int, default=2020, help="Minimum publication year (default: 2020)")
    parser.add_argument("--min-citations", type=int, default=0, help="Minimum citation count filter")
    parser.add_argument("--save", type=str, help="Save results to JSON file")

    args = parser.parse_args()

    results = search_all(args.query, limit=args.limit, since_year=args.since, min_citations=args.min_citations)
    print_results(results)

    if args.save:
        save_results(results, args.save)
    else:
        # Default save location
        default_path = "/Users/infinite27/AILCC_PRIME/02_Resources/Academics/journal_finder_results.json"
        save_results(results, default_path)


if __name__ == "__main__":
    main()
