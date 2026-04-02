import ast
import json
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [ASTValidator] %(message)s")
logger = logging.getLogger(__name__)

class ASTValidator:
    """
    Natively parses Python code strings for compilation errors without executing them.
    Used by the Singularity Engine and Vanguard Swarm to validate generated code before proposing it to the Commander.
    """
    @staticmethod
    def check(code: str) -> dict:
        """
        Parses the code string and returns a dictionary with 'valid' status and 'error' details if any.
        """
        try:
            ast.parse(code)
            return {"valid": True, "error": None}
        except SyntaxError as e:
            text = e.text.strip() if e.text else ""
            error_msg = f"SyntaxError on line {e.lineno}, offset {e.offset}: {e.msg} -> '{text}'"
            logger.warning(f"Intercepted broken syntax: {error_msg}")
            return {"valid": False, "error": error_msg}
        except Exception as e:
            logger.error(f"Failed to parse AST natively: {e}")
            return {"valid": False, "error": str(e)}

if __name__ == "__main__":
    # Mathematical Unit Test
    logger.info("Executing Native AST Validation Suite...")
    
    valid_code = "def vanguard_orbit():\n    return 42"
    invalid_code = "for i in range(10)\n    print(i)  # Missing colon intentionally"
    
    logger.info("--- Testing Valid Code ---")
    valid_result = ASTValidator.check(valid_code)
    print(json.dumps(valid_result, indent=2))
    
    logger.info("--- Testing Invalid Code ---")
    invalid_result = ASTValidator.check(invalid_code)
    print(json.dumps(invalid_result, indent=2))
    
    if valid_result["valid"] and not invalid_result["valid"]:
        logger.info("✅ AST Validation Suite PASSED.")
    else:
        logger.error("❌ AST Validation Suite FAILED.")
