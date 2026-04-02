import re
import logging

logger = logging.getLogger("AcademicDefense")

# The absolute constraint array.
# Keys are regex patterns matching typical LLM clichés.
# Values are neutral, rigorous academic replacements (or empty strings to delete entirely).
BANNED_LEXICON_MATRIX = {
    r"\\bdelve(?:s|d|ing)?(?: into)?\\b": "examine",
    r"\\b(?:a )?rich tapestry\\b": "a complex framework",
    r"\\btestament to\\b": "evidence of",
    r"\\b(?:in conclusion|to conclude),?\\b": "ultimately,",
    r"\\bpivotal\\b": "significant",
    r"\\bcrucial\\b": "essential",
    r"\\bmultifaceted\\b": "complex",
    r"\\bfamous\\b": "prominent",
    r"\\bmoreover,?\\b": "furthermore,",
    r"\\bnotably,?\\b": "specifically,",
    r"\\bin today'?s rapidly evolving [^,]+,\\b": "",
    r"\\bit is important to note that\\b": "significantly,",
    r"\\bseamless(?:ly)?\\b": "integrated",
    r"\\bshed(?:s|ding)? light on\\b": "clarifies",
    r"\\bbeyond the scope of this\\b": "outside the parameters of this",
    r"\\bstark reminder\\b": "indication",
    r"\\bnavigating the complexities\\b": "managing the variables"
}

def apply_defense_array(text: str) -> str:
    """
    Epoch 31 Task 19: The Academic Defense Middleware.
    Executes a brutal, uncompromising regex sweep across generated LLM strings.
    It isolates and annihilates recognizable AI vocabulary signatures, enforcing 
    a colder, more objective Academic tone associated with the Commander's voice structure.
    """
    logger.info("🛡️ Engaging Academic Defense Middleware: Stripping LLM string signatures...")
    
    clean_text = text
    substitutions_made = 0
    
    for pattern, replacement in BANNED_LEXICON_MATRIX.items():
        # Compile case-insensitive matching
        regex = re.compile(pattern, re.IGNORECASE)
        
        # Count matches before replacing for telemetry
        matches = regex.findall(clean_text)
        if matches:
            substitutions_made += len(matches)
            # Apply mathematical substitution
            clean_text = regex.sub(replacement, clean_text)
            
    # Clean up double spaces caused by empty replacements
    clean_text = re.sub(r' {2,}', ' ', clean_text)
    
    if substitutions_made > 0:
        logger.info(f"✅ Defense Sequence Complete: Annihilated {substitutions_made} AI-identified tokens.")
    else:
        logger.info("✅ Defense Sequence Complete: Payload is structurally clean. Zero identified tokens found.")
        
    return clean_text

if __name__ == "__main__":
    # Test array execution
    sample = "In today's rapidly evolving landscape, it is important to note that researchers delve into the rich tapestry of neuroscience. This is a testament to the crucial and pivotal nature of the field. In conclusion, it seamlessly sheds light on the mind."
    print("--- [RAW LLM DRAFT] ---")
    print(sample)
    print("\\n--- [DEFENSE SANITIZED DRAFT] ---")
    print(apply_defense_array(sample))
