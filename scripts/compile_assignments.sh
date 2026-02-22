#!/bin/bash
# AILCC Universal Academic Compilation Script

echo "=> Compiling GENS2101 Exa-Enriched Assignment"
pandoc "/Users/infinite27/AILCC_PRIME/AI-MasterMind-Alliance/02_Resources/Academics/GENS-2101/Assignment_1_Vision_Refined.md" \
  -o "/Users/infinite27/AILCC_PRIME/AI-MasterMind-Alliance/02_Resources/Academics/GENS-2101/GENS2101_Assignment_1_AI_Amplified.docx" \
  --from markdown \
  --to docx \
  --wrap=preserve

echo "=> Compiling HLTH1011 Exa-Enriched Lit Review"
pandoc "/Users/infinite27/AILCC_PRIME/AI-MasterMind-Alliance/02_Resources/Academics/HLTH-1011/Refined_HLTH1011_Lit_Review.md" \
  -o "/Users/infinite27/AILCC_PRIME/AI-MasterMind-Alliance/02_Resources/Academics/HLTH-1011/HLTH1011_Lit_Review_AI_Amplified.docx" \
  --from markdown \
  --to docx \
  --wrap=preserve

echo "=> Compilation Complete. Files saved as *_AI_Amplified.docx"
