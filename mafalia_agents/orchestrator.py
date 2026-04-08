# -*- coding: utf-8 -*-
"""
Mafalia Agent Orchestrator
===========================
Central coordination layer for all 10 Mafalia AI agents.
Routes requests, combines results, and manages agent collaboration.
"""

import os
import sys
import re
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mafalia_agents.agents import (
    ALL_AGENTS, get_agent, list_agents,
    Zara, Kofi, Amara, Idris, Nala, Tariq, Sana, Ravi, Luna, Omar
)


AGENT_ROUTING_MAP = {
    # Vente & Commerce: Restaurant POS, Détaillant, Upsales
    "zara": {
        "keywords": ["revenue", "chiffre", "revenu", "price", "prix", "profit", "marge",
                     "upsell", "bundle", "trend", "tendance", "vente", "sale", "income",
                     "pos", "caisse", "détaillant", "detaillant", "retail", "panier moyen",
                     "boutique", "terminal"],
        "priority": 1,
    },
    # Hôtellerie & Ops: Hotel PMS, Housekeeping, Transport, Livraison
    "kofi": {
        "keywords": ["operation", "commande", "order", "bottleneck", "efficiency",
                     "efficacite", "delivery", "livraison", "staff", "employe", "workflow", "process",
                     "hotel", "pms", "hôtel", "chambre", "room", "booking", "réservation",
                     "housekeeping", "ménage", "menage", "maintenance", "nettoyage", "cleaning",
                     "transport", "logistique", "logistics", "fleet", "véhicule"],
        "priority": 2,
    },
    # Cross-vertical customer analytics
    "amara": {
        "keywords": ["customer", "client", "churn", "loyalty", "fidelite", "retention",
                     "satisfaction", "feedback", "segment", "clv", "lifetime",
                     "fidélité", "point", "guest", "hôte"],
        "priority": 3,
    },
    # Fournisseurs (supply chain), Détaillant stock
    "idris": {
        "keywords": ["stock", "inventory", "inventaire", "reorder", "waste", "gaspi",
                     "expiry", "peremption", "supplier", "fournisseur", "ingredient",
                     "supply chain", "approvisionnement", "chaîne", "catalogue",
                     "réapprovisionnement"],
        "priority": 4,
    },
    # Campagnes Marketing: SMS, WhatsApp & push ciblés
    "nala": {
        "keywords": ["marketing", "campaign", "campagne", "social", "whatsapp", "promo",
                     "promotion", "content", "contenu", "instagram", "roi", "brand",
                     "sms", "push", "notification", "ciblage", "emailing", "newsletter"],
        "priority": 5,
    },
    # Finance & RH: Credit Scoring, API Paiement, Carte Mafalia, Comptabilité
    "tariq": {
        "keywords": ["finance", "cash", "tresorerie", "budget", "tax", "impot",
                     "invest", "investir", "accounting", "comptabilite", "health",
                     "credit", "scoring", "financement", "prêt", "pret", "loan",
                     "paiement", "payment", "gateway", "wave", "orange money",
                     "carte", "card", "salaire", "salary", "masspay",
                     "comptabilité", "facture", "invoice", "bilan"],
        "priority": 6,
    },
    # Carbone mesure + cross-platform data analytics
    "sana": {
        "keywords": ["data", "predict", "forecast", "prevision", "pattern", "anomaly",
                     "anomalie", "correlation", "insight", "model", "statistic", "analyse",
                     "carbon", "carbone", "environnement", "environment", "empreinte",
                     "co2", "durable", "sustainability", "impact",
                     "code review", "data quality", "pipeline audit", "revue"],
        "priority": 7,
    },
    # Equipements: PMS API, Téléphone POS, Terminaux, Tablettes & Kiosques, Imprimantes
    "ravi": {
        "keywords": ["tech", "api", "integration", "security", "securite", "performance",
                     "stack", "automation", "automate", "system", "architecture",
                     "pms api", "terminal", "terminaux", "tablette", "kiosque", "borne",
                     "imprimante", "printer", "téléphone", "telephone", "phone pos",
                     "équipement", "equipment", "hardware", "matériel", "tpe",
                     "code review", "security review", "vulnerability", "audit code",
                     "security audit", "revue de code"],
        "priority": 8,
    },
    # Growth across all verticals
    "luna": {
        "keywords": ["growth", "croissance", "funnel", "conversion", "experiment",
                     "test", "viral", "referral", "parrainage", "scale", "acquisition",
                     "expansion", "nouveau marché"],
        "priority": 9,
    },
    # Partnerships, supplier marketplace, ecosystem
    "omar": {
        "keywords": ["partner", "partenaire", "supplier", "marketplace", "deal",
                     "negotiate", "ecosystem", "financing", "financement", "network",
                     "réseau", "collaboration", "b2b"],
        "priority": 10,
    },
}


class MafaliaOrchestrator:
    """
    Central orchestrator for all Mafalia AI agents.

    Capabilities:
    - Smart routing: Detects which agent(s) best fit a request
    - Multi-agent: Combines insights from multiple agents
    - Parallel execution: Queries agents in optimal order
    - Result synthesis: Merges and ranks outputs
    - Business summary: Full health check using all 10 agents
    """

    def __init__(self, data_dir: str = "."):
        self.data_dir = data_dir
        self._agents: Dict[str, Any] = {}
        self.orchestration_log: List[Dict] = []

    def _get_agent(self, name: str):
        """Lazy-load agents."""
        if name not in self._agents:
            self._agents[name] = get_agent(name, self.data_dir)
        return self._agents[name]

    def route(self, request: str) -> List[Tuple[str, float]]:
        """
        Route a request to the most relevant agents.
        Returns list of (agent_name, confidence_score) sorted by relevance.
        """
        req_lower = request.lower()
        req_terms = set(re.findall(r'\w+', req_lower))

        scores = {}
        for agent_name, config in AGENT_ROUTING_MAP.items():
            matches = sum(1 for kw in config["keywords"] if kw in req_lower)
            term_overlap = len(req_terms & set(config["keywords"]))
            score = (matches * 2 + term_overlap) / max(len(config["keywords"]), 1)
            if score > 0:
                scores[agent_name] = score

        if not scores:
            scores = {name: 0.1 for name in ["zara", "tariq", "kofi"]}

        sorted_agents = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return sorted_agents

    def orchestrate(self, request: str, max_agents: int = 3) -> Dict:
        """
        Orchestrate a request across multiple agents and combine results.
        """
        start_time = datetime.now()
        routing = self.route(request)
        selected = routing[:max_agents]

        if not selected:
            selected = [("zara", 1.0)]

        results = []
        agent_responses = {}

        for agent_name, confidence in selected:
            agent = self._get_agent(agent_name)
            response = agent.process(request)
            agent_responses[agent_name] = {
                "agent": agent_name,
                "tag": agent.profile.tag,
                "title": agent.profile.title,
                "confidence": round(confidence, 3),
                "response": response,
            }
            results.append(agent_responses[agent_name])

        duration = (datetime.now() - start_time).total_seconds()

        log_entry = {
            "request": request,
            "agents_used": [r["agent"] for r in results],
            "duration_seconds": round(duration, 3),
            "timestamp": start_time.isoformat(),
        }
        self.orchestration_log.append(log_entry)

        primary = results[0] if results else {}

        return {
            "request": request,
            "orchestrated": True,
            "agents_consulted": len(results),
            "primary_agent": {
                "name": primary.get("agent"),
                "emoji": primary.get("emoji"),
                "title": primary.get("title"),
            } if primary else None,
            "results": results,
            "routing_confidence": {r["agent"]: r["confidence"] for r in results},
            "execution_time": f"{duration:.3f}s",
            "timestamp": start_time.isoformat(),
        }

    def full_business_summary(self) -> Dict:
        """
        Generate a complete business summary using all 10 agents.
        The ultimate business health check.
        """
        start_time = datetime.now()
        summary_requests = {
            "zara": "revenue",
            "kofi": "efficiency",
            "amara": "customers",
            "idris": "stock",
            "nala": "campaigns",
            "tariq": "health",
            "sana": "insights",
            "ravi": "stack",
            "luna": "growth",
            "omar": "partnerships",
        }

        results = {}
        errors = []

        for agent_name, request in summary_requests.items():
            agent = self._get_agent(agent_name)
            result = agent.process(request)
            if "error" not in result:
                results[agent_name] = {
                    "agent": agent_name,
                    "tag": agent.profile.tag,
                    "title": agent.profile.title,
                    "data": result,
                }
            else:
                errors.append(f"{agent_name}: {result.get('error')}")

        alerts = self._generate_cross_agent_alerts(results)
        opportunities = self._generate_opportunities(results)

        duration = (datetime.now() - start_time).total_seconds()

        return {
            "summary_type": "full_business_health_check",
            "generated_at": start_time.isoformat(),
            "execution_time": f"{duration:.3f}s",
            "agents_active": len(results),
            "agents_with_errors": len(errors),
            "agent_reports": results,
            "cross_agent_alerts": alerts,
            "top_opportunities": opportunities,
            "errors": errors,
        }

    def _generate_cross_agent_alerts(self, results: Dict) -> List[Dict]:
        """Generate alerts by analyzing results across agents."""
        alerts = []

        if "idris" in results:
            idris_data = results["idris"]["data"]
            critical = idris_data.get("critical", 0)
            if critical > 0:
                alerts.append({
                    "severity": "high",
                    "source": "idris",
                    "type": "inventory",
                    "message": f"ALERT: {critical} items critically low in stock",
                    "action": "Run reorder analysis immediately",
                })

        if "zara" in results:
            zara_data = results["zara"]["data"]
            trend = str(zara_data.get("trend_direction", "")).lower()
            if trend == "decreasing":
                alerts.append({
                    "severity": "medium",
                    "source": "zara",
                    "type": "revenue",
                    "message": "WARN: Revenue trend is decreasing",
                    "action": "Activate Nala for marketing campaign",
                })

        if "amara" in results:
            amara_data = results["amara"]["data"]
            at_risk = amara_data.get("at_risk_count", 0)
            if at_risk > 10:
                alerts.append({
                    "severity": "medium",
                    "source": "amara",
                    "type": "customers",
                    "message": f"WARN: {at_risk} customers at churn risk",
                    "action": "Launch re-engagement campaign via Nala",
                })

        if "kofi" in results:
            kofi_data = results["kofi"]["data"]
            bottlenecks = kofi_data.get("bottlenecks", [])
            high_severity = [b for b in bottlenecks if isinstance(b, dict) and b.get("severity") == "high"]
            if high_severity:
                for b in high_severity[:2]:
                    alerts.append({
                        "severity": "high",
                        "source": "kofi",
                        "type": "operations",
                        "message": f"ALERT: Bottleneck: {b.get('issue', 'Unknown issue')}",
                        "action": b.get("action", "Review operations"),
                    })

        if not alerts:
            alerts.append({
                "severity": "low",
                "source": "system",
                "type": "general",
                "message": "OK: No critical alerts detected",
                "action": "Continue monitoring",
            })

        return alerts

    def _generate_opportunities(self, results: Dict) -> List[Dict]:
        """Generate top opportunities from cross-agent analysis."""
        opportunities = []

        if "luna" in results:
            luna_data = results["luna"]["data"]
            quick_wins = luna_data.get("quick_wins", [])
            for win in quick_wins[:2]:
                opportunities.append({
                    "source": "luna",
                    "type": "growth",
                    "opportunity": win.get("strategy", "Growth opportunity"),
                    "impact": win.get("impact", "TBD"),
                    "effort": win.get("effort", "Medium"),
                    "timeline": win.get("timeline", "TBD"),
                })

        if "nala" in results:
            nala_data = results["nala"]["data"]
            campaigns = nala_data.get("campaign_ideas", [])
            if campaigns:
                top = campaigns[0]
                opportunities.append({
                    "source": "nala",
                    "type": "marketing",
                    "opportunity": top.get("name", "Marketing campaign"),
                    "impact": top.get("expected_impact", "TBD"),
                    "effort": top.get("cost", "Medium"),
                    "timeline": top.get("setup_time", "TBD"),
                })

        if "tariq" in results:
            tariq_data = results["tariq"]["data"]
            investments = tariq_data.get("investment_priorities", [])
            if investments:
                top = investments[0]
                opportunities.append({
                    "source": "tariq",
                    "type": "investment",
                    "opportunity": f"Invest in {top.get('area', 'business improvement')}",
                    "impact": top.get("roi_potential", "TBD"),
                    "effort": "High",
                    "timeline": "3-6 months",
                })

        if not opportunities:
            opportunities.append({
                "source": "system",
                "type": "general",
                "opportunity": "Run full analysis to identify specific opportunities",
                "impact": "Variable",
                "effort": "Low",
                "timeline": "Immediate",
            })

        return opportunities[:5]

    def get_key_metrics(self) -> Dict:
        """Get key business metrics snapshot."""
        metrics = {}

        try:
            zara = self._get_agent("zara")
            rev = zara._analyze_revenue()
            metrics["revenue"] = {
                "total": rev.get("total_revenue", "N/A"),
                "transactions": rev.get("transaction_count", 0),
                "avg_order": rev.get("average_order", "N/A"),
            }
        except Exception:
            pass

        try:
            amara = self._get_agent("amara")
            cust = amara._analyze_customers()
            metrics["customers"] = {
                "total": cust.get("total_customers", 0),
                "active": cust.get("active_customers", 0),
                "avg_spent": cust.get("avg_spent_per_customer", "N/A"),
            }
        except Exception:
            pass

        try:
            kofi = self._get_agent("kofi")
            ops = kofi._analyze_order_flow()
            metrics["operations"] = {
                "total_orders": ops.get("total_orders", 0),
                "by_mode": ops.get("by_mode", {}),
            }
        except Exception:
            pass

        try:
            idris = self._get_agent("idris")
            stock = idris._current_stock()
            metrics["inventory"] = {
                "total_items": stock.get("total_items", 0),
                "critical": stock.get("critical", 0),
                "low_stock": stock.get("low_stock", 0),
            }
        except Exception:
            pass

        try:
            tariq = self._get_agent("tariq")
            health = tariq._financial_health()
            metrics["finance"] = {
                "health_score": health.get("overall_health_score", "N/A"),
                "rating": health.get("rating", "N/A"),
            }
        except Exception:
            pass

        metrics["generated_at"] = datetime.now().isoformat()
        return metrics

    def list_agent_capabilities(self) -> Dict:
        """Return all agent capabilities for display."""
        capabilities = {}
        for name in ALL_AGENTS.keys():
            agent = self._get_agent(name)
            p = agent.profile
            capabilities[name] = {
                "name": p.name,
                "title": p.title,
                "tag": p.tag,
                "color": p.color,
                "description": p.description,
                "superpowers": p.superpowers,
                "expertise": p.expertise_areas,
                "routing_keywords": AGENT_ROUTING_MAP[name]["keywords"][:5],
            }
        return capabilities

    def get_orchestration_stats(self) -> Dict:
        """Get stats about orchestration usage."""
        if not self.orchestration_log:
            return {"total_orchestrations": 0}
        agents_used = {}
        for log in self.orchestration_log:
            for agent in log.get("agents_used", []):
                agents_used[agent] = agents_used.get(agent, 0) + 1
        avg_duration = sum(l.get("duration_seconds", 0) for l in self.orchestration_log) / len(self.orchestration_log)
        return {
            "total_orchestrations": len(self.orchestration_log),
            "agent_usage": agents_used,
            "most_used_agent": max(agents_used, key=agents_used.get) if agents_used else None,
            "avg_duration_seconds": round(avg_duration, 3),
        }
