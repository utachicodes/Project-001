# -*- coding: utf-8 -*-
"""
Tests for Mafalia Knowledge Base
==================================
"""

import os
import sys
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mafalia_knowledge.knowledge_base import MafaliaKnowledgeBase

DATA_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class TestKnowledgeBase:
    @pytest.fixture
    def kb(self):
        return MafaliaKnowledgeBase(DATA_DIR)

    def test_init(self, kb):
        assert kb is not None

    def test_search(self, kb):
        results = kb.search("revenue")
        assert isinstance(results, list)

    def test_stats(self, kb):
        stats = kb.stats()
        assert isinstance(stats, dict)
        assert "total_entries" in stats

    def test_overview(self, kb):
        ov = kb.overview()
        assert isinstance(ov, dict)

    def test_add_entry(self, kb):
        entry = kb.add_entry(
            title="Test Entry",
            content="This is a test knowledge entry.",
            category="technology",
            tags=["test"],
        )
        assert isinstance(entry, dict)
        assert entry["title"] == "Test Entry"

    def test_search_with_category(self, kb):
        results = kb.search("revenue", category="restaurant")
        assert isinstance(results, list)
