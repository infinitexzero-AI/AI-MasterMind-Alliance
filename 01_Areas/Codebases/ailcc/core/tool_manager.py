
import inspect
import json
import logging
from typing import Dict, Any, Callable, List, Optional
from functools import wraps

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ToolManager:
    """
    Manages registration, schema generation, and execution of tools.
    """
    def __init__(self):
        self.tools: Dict[str, Callable] = {}
        self.schemas: List[Dict[str, Any]] = []

    def register_tool(self, name: str, description: str):
        """
        Decorator to register a function as a tool.
        """
        def decorator(func):
            self.tools[name] = func
            
            # Generate schema from signature and docstring
            sig = inspect.signature(func)
            parameters = {
                "type": "object",
                "properties": {},
                "required": []
            }
            
            for param_name, param in sig.parameters.items():
                param_type = "string" # Default
                if param.annotation == int:
                    param_type = "integer"
                elif param.annotation == bool:
                    param_type = "boolean"
                
                parameters["properties"][param_name] = {
                    "type": param_type,
                    "description": f"Parameter: {param_name}" 
                }
                if param.default == inspect.Parameter.empty:
                    parameters["required"].append(param_name)

            schema = {
                "name": name,
                "description": description,
                "parameters": parameters
            }
            self.schemas.append(schema)
            
            @wraps(func)
            def wrapper(*args, **kwargs):
                return func(*args, **kwargs)
            return wrapper
        return decorator

    def get_tool_schemas(self) -> List[Dict[str, Any]]:
        """Return the JSON schemas for all registered tools."""
        return self.schemas

    def execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> str:
        """Execute a tool by name with provided arguments."""
        if tool_name not in self.tools:
            return f"Error: Tool '{tool_name}' not found."
        
        try:
            logger.info(f"Executing tool: {tool_name} with args: {arguments}")
            func = self.tools[tool_name]
            result = func(**arguments)
            return str(result)
        except Exception as e:
            logger.error(f"Tool Execution Failed: {e}")
            return f"Error executing '{tool_name}': {str(e)}"

# Singleton instance
tool_manager = ToolManager()
