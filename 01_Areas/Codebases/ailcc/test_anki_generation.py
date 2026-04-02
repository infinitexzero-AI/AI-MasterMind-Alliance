import sys
import asyncio
from pathlib import Path

# Configure paths
AILCC_PRIME_PATH = Path(__file__).resolve().parent
sys.path.insert(0, str(AILCC_PRIME_PATH))

from automations.skills.mcat_anki_generator import McatAnkiGenerator

async def main():
    print("🚀 === Phase 75: MCAT Anki Generation Test ===")
    
    generator = McatAnkiGenerator()
    
    # Create a mock source file with dense biology context
    mock_src = "/tmp/mock_bio_reading.txt"
    with open(mock_src, "w") as f:
        f.write("The citric acid cycle, also known as the Krebs cycle, occurs in the mitochondrial matrix. It processes acetyl-CoA to produce NADH, FADH2, and ATP or GTP. Glycolysis occurs in the cytoplasm and results in a net gain of 2 ATP per glucose molecule. Hexokinase phosphorylates glucose to glucose-6-phosphate.")
        
    print("\n[1] Executing text extraction and LLM parsing...")
    csv_output_path = await generator.execute_generation(
        task_id="TEST_uni_MCAT_BIO", 
        source_file=mock_src,
        topic="Metabolism Overview"
    )
    
    # Success Check
    if csv_output_path:
        print(f"\n✅ === Anki Deck Generation Complete ===")
        print(f"Deck saved successfully to: {csv_output_path}")
        print("\nCard Preview:")
        with open(csv_output_path, 'r') as f:
            print(f.read())
    else:
        print("\n❌ === Test Failed ===")

if __name__ == "__main__":
    asyncio.run(main())
