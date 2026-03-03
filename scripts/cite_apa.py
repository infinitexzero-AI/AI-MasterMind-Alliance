#!/usr/bin/env python3
"""Format a DOI or raw citation into APA 7th edition format."""
import sys, json, os, ssl

def fetch_citation(doi):
    from urllib.request import Request, urlopen
    from urllib.error import URLError
    
    # SSL workaround for macOS
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    # Use CrossRef API to get metadata
    url = f"https://api.crossref.org/works/{doi}"
    req = Request(url, headers={"User-Agent": "AILCC-Scholar/1.0"})
    
    try:
        with urlopen(req, timeout=10, context=ctx) as res:
            data = json.loads(res.read())["message"]
    except (URLError, Exception) as e:
        print(f"Error fetching DOI: {e}")
        return None
    
    # Extract fields
    authors = []
    for a in data.get("author", []):
        last = a.get("family", "")
        first = a.get("given", "")
        initials = ". ".join([n[0] for n in first.split() if n]) + "." if first else ""
        authors.append(f"{last}, {initials}")
    
    author_str = ""
    if len(authors) == 1:
        author_str = authors[0]
    elif len(authors) == 2:
        author_str = f"{authors[0]} & {authors[1]}"
    elif len(authors) <= 20:
        author_str = ", ".join(authors[:-1]) + f", & {authors[-1]}"
    else:
        author_str = ", ".join(authors[:19]) + f", ... {authors[-1]}"
    
    # Year
    date_parts = data.get("published-print", data.get("published-online", data.get("created", {})))
    year = date_parts.get("date-parts", [[""]])[0][0] if date_parts else "n.d."
    
    # Title
    title = data.get("title", ["Untitled"])[0]
    
    # Journal
    journal = data.get("container-title", [""])[0]
    volume = data.get("volume", "")
    issue = data.get("issue", "")
    pages = data.get("page", "")
    
    # Format APA 7
    citation = f"{author_str} ({year}). {title}."
    if journal:
        citation += f" *{journal}*"
        if volume:
            citation += f", *{volume}*"
        if issue:
            citation += f"({issue})"
        if pages:
            citation += f", {pages}"
        citation += "."
    citation += f" https://doi.org/{doi}"
    
    return citation

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 cite_apa.py <DOI>")
        print("Example: python3 cite_apa.py 10.1371/journal.pmen.0000065")
        sys.exit(1)
    
    doi = sys.argv[1].replace("https://doi.org/", "").replace("http://dx.doi.org/", "")
    result = fetch_citation(doi)
    if result:
        print("\n--- APA 7th Edition ---")
        print(result)
        print()
