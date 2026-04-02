from pydantic import BaseModel, Field, ValidationError
from typing import Optional, Dict, Any, List
from datetime import datetime

class TaskPayload(BaseModel):
    prompt: str = Field(..., description="The natural language command to process. Must not be empty.")
    trace: bool = Field(default=False, description="Enable deep Omni-Tracing.")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Arbitrary metadata from UI.")
    source: Optional[str] = Field(default="ORCHESTRATOR", description="Identifies the origin of the payload (e.g., iOS_BRIDGE).")

class OmniCommandPayload(BaseModel):
    command: str = Field(..., description="The internal CLI command to invoke.")
    payload: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
class AgentRegistration(BaseModel):
    name: str = Field(...)
    role: str = Field(...)
    capabilities: List[str] = Field(default_factory=list)
    status: str = Field(default="ONLINE")

class BaseAILCCEvent(BaseModel):
    """
    Standardizes all inbound websockets and pub/sub events.
    """
    type: str = Field(..., description="The internal event mapping router key.")
    timestamp: Optional[str] = None
    payload: Any = Field(default=None, description="The abstract body. Processed later based on type.")

class SystemErrorPayload(BaseModel):
    metadata: Dict[str, str] = Field(..., description="Contains log_file and trace information.")

def validate_event(raw_dict: dict) -> BaseAILCCEvent:
    return BaseAILCCEvent(**raw_dict)

def validate_task_payload(raw_payload: dict) -> TaskPayload:
    return TaskPayload(**raw_payload)

def validate_omni_command(raw_payload: dict) -> OmniCommandPayload:
    return OmniCommandPayload(**raw_payload)

def validate_system_error(raw_payload: dict) -> SystemErrorPayload:
    return SystemErrorPayload(**raw_payload)
