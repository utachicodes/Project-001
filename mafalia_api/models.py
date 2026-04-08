# -*- coding: utf-8 -*-
"""
Mafalia API - Pydantic Models
==============================
Request/response models for the FastAPI server.
"""

from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional
from enum import Enum


class AgentName(str, Enum):
    zara = "zara"
    kofi = "kofi"
    amara = "amara"
    idris = "idris"
    nala = "nala"
    tariq = "tariq"
    sana = "sana"
    ravi = "ravi"
    luna = "luna"
    omar = "omar"


class AgentMessageRequest(BaseModel):
    agent: AgentName = Field(..., description="Name of the agent to query")
    message: str = Field(..., min_length=1, description="Message or question for the agent")


class AgentMessageResponse(BaseModel):
    agent: str
    tag: str
    title: str
    message: str
    response: Dict[str, Any]
    timestamp: str


class OrchestrateRequest(BaseModel):
    request: str = Field(..., min_length=1, description="Request to orchestrate across agents")
    max_agents: int = Field(default=3, ge=1, le=10, description="Maximum agents to involve")


class KnowledgeSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Search query")
    category: Optional[str] = Field(default=None, description="Filter by category: restaurant/finance/marketing/operations/technology")
    top_k: int = Field(default=5, ge=1, le=20, description="Number of results to return")


class KnowledgeAddRequest(BaseModel):
    title: str = Field(..., min_length=1)
    content: str = Field(..., min_length=1)
    category: str = Field(..., description="Category: restaurant/finance/marketing/operations/technology")
    tags: List[str] = Field(default_factory=list)
    source: str = Field(default="User")


class AgentMemorySetRequest(BaseModel):
    agent: AgentName
    key: str = Field(..., min_length=1)
    value: Any
    persistent: bool = Field(default=False, description="Whether to persist to long-term memory")
    tags: List[str] = Field(default_factory=list)


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    agents: int
    data_dir: str


class AgentProfileResponse(BaseModel):
    name: str
    title: str
    personality: str
    description: str
    tag: str
    color: str
    voice_style: str
    superpowers: List[str]
    expertise_areas: List[str]
