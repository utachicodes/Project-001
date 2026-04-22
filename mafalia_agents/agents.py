# -*- coding: utf-8 -*-
"""
Mafalia Named AI Agents
========================
10 specialized AI agents with unique names, personalities, and superpowers.
Inspired by Claude CoWork, built for Mafalia.com ecosystem.
"""

import os
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
from abc import ABC, abstractmethod
import re
import hashlib


class AgentPersonality(Enum):
    ANALYTICAL = "analytical"
    CREATIVE = "creative"
    STRATEGIC = "strategic"
    EMPATHETIC = "empathetic"
    TECHNICAL = "technical"
    OPERATIONAL = "operational"


@dataclass
class AgentProfile:
    name: str
    title: str
    personality: AgentPersonality
    superpowers: List[str]
    description: str
    color: str
    tag: str
    voice_style: str
    expertise_areas: List[str]


class BaseMafaliaAgent(ABC):
    """Base class for all Mafalia named agents"""

    def __init__(self, data_dir: str = "."):
        self.data_dir = data_dir
        self.profile = self._get_profile()
        self.memory = {}
        self.task_history = []
        self.conversation_history = []
        self._load_data()

    @abstractmethod
    def _get_profile(self) -> AgentProfile:
        pass

    def _load_data(self):
        """Load CSV data files"""
        self.data = {}
        files = {
            "transactions": "transactions_rows.csv",
            "produits": "produits_rows.csv",
            "produits_commandes": "produits_commandes_rows.csv",
            "clients": "clients_rows.csv",
            "categories": "categories_rows.csv",
            "commandes": "commandes_rows.csv",
            "entrees_stock": "entrees_stock_rows.csv",
            "sorties_stock": "sorties_stock_rows.csv",
            "promos": "promotions_rows.csv",
            "ingredients": "ingredients_rows.csv",
            "menus": "menus_rows.csv",
            "centres": "centre_rows.csv",
            "restaurants": "restaurants_rows.csv",
            "variants": "variants_produits_rows.csv",
            "payment_methods": "payment_methods_rows.csv",
            "tags": "tags_rows.csv",
            "employees": "informations_employees_rows.csv",
        }
        for key, filename in files.items():
            try:
                self.data[key] = pd.read_csv(f"{self.data_dir}/{filename}")
            except:
                pass

    def _parse_dates(self, df: pd.DataFrame, col: str = "created_at") -> pd.DataFrame:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors="coerce")
        return df

    def _sanitize(self, val: Any) -> Any:
        """Deeply sanitize values to be JSON-compliant (replace NaN/Inf)"""
        if isinstance(val, dict):
            return {k: self._sanitize(v) for k, v in val.items()}
        elif isinstance(val, list):
            return [self._sanitize(v) for v in val]
        elif isinstance(val, (float, np.floating)):
            if np.isnan(val) or np.isinf(val):
                return 0.0
            return float(val)
        elif isinstance(val, (int, np.integer)):
            return int(val)
        return val

    def remember(self, key: str, value: Any):
        self.memory[key] = value

    def recall(self, key: str) -> Any:
        return self.memory.get(key)

    def log_task(self, task: str, result: Any):
        self.task_history.append(
            {
                "task": task,
                "result": result,
                "timestamp": datetime.now().isoformat(),
            }
        )

    @abstractmethod
    def process_logic(self, request: str, context: Dict = None) -> Dict:
        pass

    def process(self, request: str, context: Dict = None) -> Dict:
        """Process request and ensure JSON-compliant output"""
        result = self.process_logic(request, context)
        return self._sanitize(result)

    def chat(self, message: str) -> str:
        self.conversation_history.append({"role": "user", "content": message})
        result = self.process(message)
        response = self._format_response(result)
        self.conversation_history.append({"role": "assistant", "content": response})
        return response

    def _format_response(self, result: Dict) -> str:
        if "error" in result:
            return f"Erreur: {result['error']}"
        lines = [f"{self.profile.tag} {self.profile.name} - {self.profile.title}"]
        lines.append("=" * 50)
        for key, value in result.items():
            if isinstance(value, dict):
                lines.append(f"\n[{key.upper()}]")
                for k, v in value.items():
                    lines.append(f"  {k}: {v}")
            elif isinstance(value, list):
                lines.append(f"\n[{key.upper()}]")
                for item in value[:5]:
                    if isinstance(item, dict):
                        lines.append(f"  - {json.dumps(item, ensure_ascii=False)}")
                    else:
                        lines.append(f"  - {item}")
            else:
                lines.append(f"{key}: {value}")
        lines.append("=" * 50)
        return "\n".join(lines)


# ============================================================
# AGENT 1: ZARA - The Revenue Strategist
# ============================================================


class Zara(BaseMafaliaAgent):
    """
    ZARA - The Revenue Strategist
    Superpower: Sees money patterns invisible to others
    Personality: Analytical, sharp, results-driven
    """

    def _get_profile(self) -> AgentProfile:
        return AgentProfile(
            name="Zara",
            title="Revenue Strategist",
            personality=AgentPersonality.ANALYTICAL,
            superpowers=[
                "X-Ray Revenue -- sees hidden profit leaks in every transaction line",
                "Price Pulse -- real-time price elasticity radar across POS and retail",
                "Upsell Sniper -- detects cross-sell and bundle moments before checkout",
                "Margin Sentinel -- guards gross margin and flags erosion instantly",
                "Retail Revenue Lens -- deep analytics for Detaillant catalog performance",
            ],
            description=(
                "Zara sees revenue patterns that others miss. She transforms raw POS transaction data "
                "into actionable profit strategies across Restaurant POS, Détaillant (retail), and Upsales."
            ),
            color="#FF6B35",
            tag="[REV]",
            voice_style="confident, data-driven, strategic",
            expertise_areas=[
                "pricing", "revenue", "profit", "upselling", "bundles",
                "pos", "caisse", "détaillant", "retail", "panier moyen",
            ],
        )

    def process_logic(self, request: str, context: Dict = None) -> Dict:
        req = request.lower()
        if any(kw in req for kw in ["revenue", "chiffre", "revenu"]):
            return self._analyze_revenue()
        elif any(kw in req for kw in ["price", "prix", "tarif"]):
            return self._optimize_pricing()
        elif any(kw in req for kw in ["profit", "marge", "margin"]):
            return self._analyze_profit()
        elif any(kw in req for kw in ["upsell", "panier", "bundle", "panier moyen"]):
            return self._find_upsell_opportunities()
        elif any(kw in req for kw in ["trend", "tendance", "evolution"]):
            return self._revenue_trends()
        elif any(kw in req for kw in ["pos", "caisse", "terminal"]):
            return self._pos_analytics()
        elif any(kw in req for kw in ["retail", "détaillant", "detaillant", "boutique"]):
            return self._retail_revenue()
        else:
            return self._analyze_revenue()

    def _analyze_revenue(self) -> Dict:
        trans = self.data.get("transactions")
        if trans is None or trans.empty:
            return {"error": "No transaction data"}
        trans = self._parse_dates(trans)
        total = trans["amount"].sum() if "amount" in trans.columns else 0
        count = len(trans)
        avg = total / count if count > 0 else 0
        if "created_at" in trans.columns:
            trans["date"] = trans["created_at"].dt.date
            daily = trans.groupby("date")["amount"].sum()
            best_day = str(daily.idxmax()) if len(daily) > 0 else "N/A"
            best_amount = float(daily.max()) if len(daily) > 0 else 0
            worst_day = str(daily.idxmin()) if len(daily) > 0 else "N/A"
        else:
            best_day, best_amount, worst_day = "N/A", 0, "N/A"
        return {
            "total_revenue": f"{total:,.0f} FCFA",
            "transaction_count": count,
            "average_order": f"{avg:,.0f} FCFA",
            "best_day": best_day,
            "best_day_amount": f"{best_amount:,.0f} FCFA",
            "worst_day": worst_day,
        }

    def _optimize_pricing(self) -> Dict:
        produits = self.data.get("produits")
        produits_cmd = self.data.get("produits_commandes")
        if produits is None or produits_cmd is None:
            return {"error": "No product data"}
        sales = produits_cmd.groupby("produit_id")["quantite"].sum()
        recommendations = []
        for pid, qty in sales.nlargest(10).items():
            prod = produits[produits["id"] == pid]
            if not prod.empty:
                name = prod["nom_produit"].values[0]
                price = (
                    prod["base_price"].values[0] if "base_price" in prod.columns else 0
                )
                if qty > 30:
                    new_price = price * 1.08
                    recommendations.append(
                        {
                            "product": name,
                            "current_price": f"{price:,.0f} FCFA",
                            "recommended_price": f"{new_price:,.0f} FCFA",
                            "reason": f"High demand ({qty} sold) - can increase by 8%",
                            "expected_impact": f"+{qty * (new_price - price):,.0f} FCFA additional revenue",
                        }
                    )
                elif qty < 5:
                    new_price = price * 0.9
                    recommendations.append(
                        {
                            "product": name,
                            "current_price": f"{price:,.0f} FCFA",
                            "recommended_price": f"{new_price:,.0f} FCFA",
                            "reason": f"Low demand ({qty} sold) - try discount",
                            "expected_impact": "Increase volume through lower price",
                        }
                    )
        return {"pricing_recommendations": recommendations}

    def _analyze_profit(self) -> Dict:
        trans = self.data.get("transactions")
        if trans is None or trans.empty:
            return {"error": "No data"}
        revenue = trans["amount"].sum() if "amount" in trans.columns else 0
        costs = {
            "food_cost": revenue * 0.30,
            "labor_cost": revenue * 0.25,
            "overhead": revenue * 0.10,
            "marketing": revenue * 0.05,
        }
        total_costs = sum(costs.values())
        profit = revenue - total_costs
        return {
            "total_revenue": f"{revenue:,.0f} FCFA",
            "total_costs": f"{total_costs:,.0f} FCFA",
            "net_profit": f"{profit:,.0f} FCFA",
            "profit_margin": f"{(profit / revenue * 100) if revenue > 0 else 0:.1f}%",
            "cost_breakdown": {
                k: f"{v:,.0f} FCFA ({v / revenue * 100:.1f}%)" for k, v in costs.items()
            },
        }

    def _find_upsell_opportunities(self) -> Dict:
        produits_cmd = self.data.get("produits_commandes")
        produits = self.data.get("produits")
        if produits_cmd is None or produits is None:
            return {"error": "No data"}
        merged = produits_cmd.merge(
            produits[["id", "nom_produit", "categorie_id", "base_price"]],
            left_on="produit_id",
            right_on="id",
            how="left",
        )
        combos = (
            merged.groupby("commande_id")
            .agg(
                {
                    "nom_produit": list,
                    "base_price": list,
                }
            )
            .reset_index()
        )
        bundles = []
        for _, row in combos.iterrows():
            items = row["nom_produit"]
            if len(items) >= 2:
                bundle_key = " + ".join(sorted(items[:3]))
                bundles.append(bundle_key)
        from collections import Counter

        bundle_counts = Counter(bundles).most_common(5)
        suggestions = []
        for bundle, count in bundle_counts:
            suggestions.append(
                {
                    "bundle": bundle,
                    "frequency": count,
                    "recommendation": f"Create combo deal for {bundle}",
                    "suggested_discount": "10-15%",
                }
            )
        return {"bundle_opportunities": suggestions}

    def _revenue_trends(self) -> Dict:
        trans = self.data.get("transactions")
        if trans is None or trans.empty:
            return {"error": "No data"}
        trans = self._parse_dates(trans)
        if "created_at" not in trans.columns:
            return {"error": "No date data"}
        trans["date"] = trans["created_at"].dt.date
        daily = trans.groupby("date")["amount"].sum().sort_index()
        if len(daily) < 2:
            return {"error": "Insufficient data"}
        avg = daily.mean()
        trend = daily.diff().mean()
        volatility = daily.std()
        recent_7 = daily.tail(7).mean()
        previous_7 = daily.tail(14).head(7).mean() if len(daily) >= 14 else avg
        change = ((recent_7 - previous_7) / previous_7 * 100) if previous_7 > 0 else 0
        return {
            "daily_average": f"{avg:,.0f} FCFA",
            "trend_direction": "increasing" if trend > 0 else "decreasing",
            "weekly_change": f"{change:+.1f}%",
            "volatility": f"{volatility:,.0f} FCFA",
            "last_7_days_avg": f"{recent_7:,.0f} FCFA",
            "previous_7_days_avg": f"{previous_7:,.0f} FCFA",
        }

    def _pos_analytics(self) -> Dict:
        """Restaurant POS — Caisse connectée tout-en-un analytics."""
        trans = self.data.get("transactions")
        payment_methods = self.data.get("payment_methods")
        centres = self.data.get("centres")
        result = {"mafalia_product": "Restaurant POS", "description": "Caisse connectée tout-en-un"}
        if trans is not None and not trans.empty:
            result["total_pos_transactions"] = len(trans)
            result["total_pos_revenue"] = f"{trans['amount'].sum():,.0f} FCFA" if "amount" in trans.columns else "N/A"
            if "payment_method" in trans.columns:
                result["payment_breakdown"] = trans["payment_method"].value_counts().to_dict()
            elif payment_methods is not None and not payment_methods.empty:
                result["accepted_methods"] = payment_methods["name"].tolist() if "name" in payment_methods.columns else []
        if centres is not None and not centres.empty:
            result["pos_locations"] = len(centres)
        result["pos_features"] = [
            "Gestion multi-centres",
            "Paiements Wave, Orange Money, cartes",
            "Tickets & reçus automatiques",
            "Mode hors-ligne",
            "Synchronisation cloud temps réel",
        ]
        return result

    def _retail_revenue(self) -> Dict:
        """Détaillant — Vente détaillant & gestion stock revenue analysis."""
        trans = self.data.get("transactions")
        produits = self.data.get("produits")
        result = {"mafalia_product": "Détaillant", "description": "Vente détaillant & gestion stock"}
        if trans is not None and not trans.empty and "amount" in trans.columns:
            result["retail_revenue"] = f"{trans['amount'].sum():,.0f} FCFA"
            result["avg_basket"] = f"{trans['amount'].mean():,.0f} FCFA"
        if produits is not None and not produits.empty:
            result["product_catalog_size"] = len(produits)
            if "base_price" in produits.columns:
                result["avg_product_price"] = f"{produits['base_price'].mean():,.0f} FCFA"
        result["retail_features"] = [
            "Gestion de stock en temps réel",
            "Alertes de réapprovisionnement",
            "Code-barres & scan produits",
            "Rapports de vente par catégorie",
            "Multi-point de vente",
        ]
        result["growth_levers"] = [
            "Augmenter le panier moyen via Upsales",
            "Optimiser les prix avec l'analyse de demande",
            "Fidéliser via le programme de points Mafalia",
        ]
        return result


# ============================================================
# AGENT 2: KOFI - The Operations Commander
# ============================================================


class Kofi(BaseMafaliaAgent):
    """
    KOFI - The Operations Commander
    Superpower: Makes complex operations run like clockwork
    Personality: Operational, efficient, no-nonsense
    """

    def _get_profile(self) -> AgentProfile:
        return AgentProfile(
            name="Kofi",
            title="Operations Commander",
            personality=AgentPersonality.OPERATIONAL,
            superpowers=[
                "Bottleneck Radar -- pinpoints the slowest link in any workflow",
                "Clock Commander -- orchestrates staff schedules to eliminate dead time",
                "Hotel Nerve Center -- PMS check-in/out, room status, and guest flow in one view",
                "Housekeeping Pulse -- real-time task assignment and inspection tracking",
                "Fleet Sync -- transport and delivery dispatch with live route optimization",
            ],
            description=(
                "Kofi ensures every operation runs at peak efficiency across restaurant, hotel, and delivery. "
                "He manages Hotel PMS, Housekeeping, Transport logistics, and Livraison intégrée."
            ),
            color="#2E86AB",
            tag="[OPS]",
            voice_style="direct, efficient, action-oriented",
            expertise_areas=[
                "operations", "workflow", "efficiency", "processes", "automation",
                "hotel", "pms", "housekeeping", "ménage", "transport",
                "livraison", "delivery", "logistique", "maintenance",
            ],
        )

    def process_logic(self, request: str, context: Dict = None) -> Dict:
        req = request.lower()
        if any(kw in req for kw in ["order", "commande", "process"]):
            return self._analyze_order_flow()
        elif any(kw in req for kw in ["bottleneck", "goulot", "slow"]):
            return self._detect_bottlenecks()
        elif any(kw in req for kw in ["efficiency", "efficacite", "performance"]):
            return self._efficiency_score()
        elif any(kw in req for kw in ["delivery", "livraison"]):
            return self._delivery_analysis()
        elif any(kw in req for kw in ["staff", "employe", "team"]):
            return self._staff_analysis()
        elif any(kw in req for kw in ["hotel", "pms", "hôtel", "chambre", "room", "booking", "réservation"]):
            return self._hotel_pms()
        elif any(kw in req for kw in ["housekeeping", "ménage", "menage", "maintenance", "nettoyage", "cleaning"]):
            return self._housekeeping()
        elif any(kw in req for kw in ["transport", "logistique", "logistics", "fleet", "véhicule"]):
            return self._transport_logistics()
        else:
            return self._analyze_order_flow()

    def _analyze_order_flow(self) -> Dict:
        commandes = self.data.get("commandes")
        if commandes is None or commandes.empty:
            return {"error": "No order data"}
        total = len(commandes)
        modes = (
            commandes["mode_livraison"].value_counts().to_dict()
            if "mode_livraison" in commandes.columns
            else {}
        )
        types = (
            commandes["type"].value_counts().to_dict()
            if "type" in commandes.columns
            else {}
        )
        statuses = (
            commandes["statut"].value_counts().to_dict()
            if "statut" in commandes.columns
            else {}
        )
        return {
            "total_orders": total,
            "by_mode": modes,
            "by_type": types,
            "by_status": statuses,
            "avg_order_value": "Calculate from transactions",
        }

    def _detect_bottlenecks(self) -> Dict:
        bottlenecks = []
        commandes = self.data.get("commandes")
        if commandes is not None and not commandes.empty:
            if "statut" in commandes.columns:
                pending = len(commandes[commandes["statut"] == "pending"])
                if pending > 10:
                    bottlenecks.append(
                        {
                            "area": "Order Processing",
                            "issue": f"{pending} orders pending",
                            "severity": "high" if pending > 20 else "medium",
                            "action": "Increase processing capacity or automate order intake",
                        }
                    )
        trans = self.data.get("transactions")
        if trans is not None and not trans.empty:
            if "status" in trans.columns:
                failed = (
                    len(trans[trans["status"] == "failed"])
                    if "status" in trans.columns
                    else 0
                )
                if failed > 5:
                    bottlenecks.append(
                        {
                            "area": "Payment Processing",
                            "issue": f"{failed} failed transactions",
                            "severity": "high",
                            "action": "Check payment gateway integration",
                        }
                    )
        if not bottlenecks:
            bottlenecks.append(
                {
                    "area": "All Systems",
                    "issue": "No critical bottlenecks detected",
                    "severity": "low",
                    "action": "Continue monitoring",
                }
            )
        return {"bottlenecks": bottlenecks}

    def _efficiency_score(self) -> Dict:
        scores = {
            "order_processing": 85,
            "payment_processing": 92,
            "inventory_management": 78,
            "customer_service": 88,
            "delivery_operations": 75,
        }
        avg = sum(scores.values()) / len(scores)
        return {
            "overall_score": f"{avg:.1f}/100",
            "category_scores": {k: f"{v}/100" for k, v in scores.items()},
            "top_performer": max(scores, key=scores.get),
            "needs_improvement": min(scores, key=scores.get),
        }

    def _delivery_analysis(self) -> Dict:
        commandes = self.data.get("commandes")
        if commandes is None or commandes.empty:
            return {"error": "No data"}
        delivery = (
            commandes[commandes["mode_livraison"] == "delivery"]
            if "mode_livraison" in commandes.columns
            else pd.DataFrame()
        )
        pickup = (
            commandes[commandes["mode_livraison"] == "pickup"]
            if "mode_livraison" in commandes.columns
            else pd.DataFrame()
        )
        dine_in = (
            commandes[commandes["type"] == "sur_place"]
            if "type" in commandes.columns
            else pd.DataFrame()
        )
        return {
            "delivery_orders": len(delivery),
            "pickup_orders": len(pickup),
            "dine_in_orders": len(dine_in),
            "delivery_percentage": f"{len(delivery) / len(commandes) * 100:.1f}%"
            if len(commandes) > 0
            else "0%",
        }

    def _staff_analysis(self) -> Dict:
        employees = self.data.get("employees")
        if employees is None or employees.empty:
            return {
                "info": "Employee data not available",
                "recommendation": "Connect HR module for staff analytics",
            }
        total = len(employees)
        roles = (
            employees["role"].value_counts().to_dict()
            if "role" in employees.columns
            else {}
        )
        return {
            "total_staff": total,
            "by_role": roles,
            "recommendation": "Review staffing levels during peak hours",
        }

    def _hotel_pms(self) -> Dict:
        """Hotel PMS — Gestion hôtelière intelligente."""
        return {
            "mafalia_product": "Hotel PMS",
            "description": "Gestion hôtelière intelligente",
            "modules": {
                "reservations": {
                    "features": ["Réservation en ligne", "Channel manager", "Calendrier temps réel", "Confirmation automatique"],
                    "kpis": ["Taux d'occupation", "RevPAR", "ADR", "Durée moyenne de séjour"],
                },
                "front_desk": {
                    "features": ["Check-in / check-out rapide", "Attribution de chambres", "Gestion des clés", "Facturation unifiée"],
                },
                "room_management": {
                    "features": ["Statut des chambres en temps réel", "Tarification dynamique", "Inventaire chambres", "Photos & descriptions"],
                },
                "guest_services": {
                    "features": ["Historique client", "Préférences", "Demandes spéciales", "Feedback automatique"],
                },
            },
            "integrations": ["Mafalia POS (restaurant de l'hôtel)", "Housekeeping module", "API Paiement", "Campagnes Marketing"],
            "recommendations": [
                "Activer la tarification dynamique pour maximiser le RevPAR",
                "Connecter le PMS avec le POS restaurant pour facturation unifiée",
                "Utiliser les données du PMS pour des campagnes ciblées via Nala",
            ],
        }

    def _housekeeping(self) -> Dict:
        """Housekeeping — Ménage & maintenance en temps réel."""
        return {
            "mafalia_product": "Housekeeping",
            "description": "Ménage & maintenance en temps réel",
            "workflow": {
                "room_status_cycle": ["Dirty → Cleaning → Inspected → Ready"],
                "task_types": ["Ménage quotidien", "Deep cleaning", "Maintenance corrective", "Maintenance préventive"],
                "priority_rules": ["Check-out rooms first", "VIP rooms priority", "Maintenance urgente immédiate"],
            },
            "kpis": {
                "avg_cleaning_time": "Temps moyen de nettoyage par chambre",
                "rooms_per_attendant": "Chambres par agent / jour",
                "inspection_pass_rate": "Taux de conformité à l'inspection",
                "maintenance_response_time": "Temps de réponse maintenance",
            },
            "features": [
                "Attribution automatique des tâches aux agents",
                "Notifications en temps réel (chambre prête)",
                "Suivi des produits d'entretien (stock)",
                "Rapport de maintenance avec photos",
                "Planification préventive automatique",
            ],
            "recommendations": [
                "Définir des SLA par type de chambre",
                "Automatiser les rappels de maintenance préventive",
                "Connecter le stock produits d'entretien avec Idris (Inventory)",
            ],
        }

    def _transport_logistics(self) -> Dict:
        """Transport — Logistique fournisseurs connectée."""
        return {
            "mafalia_product": "Transport",
            "description": "Logistique fournisseurs connectée",
            "modules": {
                "fleet_management": {
                    "features": ["Suivi GPS des véhicules", "Planification des itinéraires", "Coûts carburant", "Maintenance véhicules"],
                },
                "supplier_logistics": {
                    "features": ["Suivi des livraisons fournisseurs", "Confirmation de réception", "Gestion des retours", "Traçabilité complète"],
                },
                "delivery_dispatch": {
                    "features": ["Attribution automatique des livreurs", "Suivi en temps réel", "Estimation du temps de livraison", "Preuve de livraison"],
                },
            },
            "kpis": {
                "on_time_delivery_rate": "% de livraisons à l'heure",
                "cost_per_delivery": "Coût moyen par livraison",
                "fleet_utilization": "Taux d'utilisation de la flotte",
                "avg_delivery_time": "Temps moyen de livraison",
            },
            "recommendations": [
                "Optimiser les itinéraires pour réduire les coûts carburant",
                "Grouper les livraisons fournisseurs par zone géographique",
                "Connecter le module transport avec la Livraison intégrée",
            ],
        }


# ============================================================
# AGENT 3: AMARA - The Customer Champion
# ============================================================


class Amara(BaseMafaliaAgent):
    """
    AMARA - The Customer Champion
    Superpower: Reads customer minds through data
    Personality: Empathetic, warm, customer-obsessed
    """

    def _get_profile(self) -> AgentProfile:
        return AgentProfile(
            name="Amara",
            title="Customer Champion",
            personality=AgentPersonality.EMPATHETIC,
            superpowers=[
                "Churn Radar -- predicts at-risk customers 30 days before they leave",
                "Loyalty Architect -- designs tier-based reward programs from transaction data",
                "Sentiment Sonar -- reads customer mood from reviews, orders, and feedback",
                "Lifetime Value Engine -- calculates and ranks every customer by long-term worth",
                "Persona Builder -- auto-segments customers into actionable behavioral groups",
            ],
            description="Amara understands customers better than they understand themselves. She turns customer data into loyalty gold.",
            color="#A23B72",
            tag="[CUS]",
            voice_style="warm, empathetic, insightful",
            expertise_areas=[
                "customers",
                "loyalty",
                "retention",
                "satisfaction",
                "personalization",
            ],
        )

    def process_logic(self, request: str, context: Dict = None) -> Dict:
        req = request.lower()
        if any(kw in req for kw in ["customer", "client", "fidele"]):
            return self._analyze_customers()
        elif any(kw in req for kw in ["churn", "attrition", "perdu"]):
            return self._predict_churn()
        elif any(kw in req for kw in ["loyalty", "fidelite", "point"]):
            return self._loyalty_analysis()
        elif any(kw in req for kw in ["segment", "segmentation"]):
            return self._segment_customers()
        elif any(kw in req for kw in ["clv", "lifetime", "valeur"]):
            return self._customer_lifetime_value()
        else:
            return self._analyze_customers()

    def _analyze_customers(self) -> Dict:
        clients = self.data.get("clients")
        if clients is None or clients.empty:
            return {"error": "No customer data"}
        total = len(clients)
        active = (
            len(clients[clients["order_count"] > 0])
            if "order_count" in clients.columns
            else 0
        )
        inactive = total - active
        avg_orders = (
            clients["order_count"].mean() if "order_count" in clients.columns else 0
        )
        avg_spent = (
            clients["total_spent"].mean() if "total_spent" in clients.columns else 0
        )
        top = (
            clients.nlargest(5, "total_spent")[
                ["first_name", "last_name", "total_spent", "order_count"]
            ].to_dict("records")
            if "total_spent" in clients.columns
            else []
        )
        return {
            "total_customers": total,
            "active_customers": active,
            "inactive_customers": inactive,
            "avg_orders_per_customer": f"{avg_orders:.1f}",
            "avg_spent_per_customer": f"{avg_spent:,.0f} FCFA",
            "top_customers": top,
        }

    def _predict_churn(self) -> Dict:
        clients = self.data.get("clients")
        if clients is None or clients.empty:
            return {"error": "No data"}
        at_risk = []
        if "order_count" in clients.columns and "total_spent" in clients.columns:
            for _, row in clients.iterrows():
                if row["order_count"] == 0 and row["total_spent"] == 0:
                    at_risk.append(
                        {
                            "name": f"{row.get('first_name', '')} {row.get('last_name', '')}",
                            "risk": "high",
                            "reason": "Never placed an order",
                            "action": "Send welcome offer",
                        }
                    )
                elif row["order_count"] <= 1:
                    at_risk.append(
                        {
                            "name": f"{row.get('first_name', '')} {row.get('last_name', '')}",
                            "risk": "medium",
                            "reason": "Only 1 order - may not return",
                            "action": "Send follow-up with discount",
                        }
                    )
        return {
            "at_risk_count": len(at_risk),
            "at_risk_customers": at_risk[:10],
            "recommendation": "Launch re-engagement campaign for at-risk customers",
        }

    def _loyalty_analysis(self) -> Dict:
        clients = self.data.get("clients")
        if clients is None or clients.empty:
            return {"error": "No data"}
        if "point_de_fidelite" not in clients.columns:
            return {"error": "No loyalty data"}
        total_points = clients["point_de_fidelite"].sum()
        avg_points = clients["point_de_fidelite"].mean()
        tiers = {
            "Bronze (0-100)": len(clients[clients["point_de_fidelite"] <= 100]),
            "Silver (100-300)": len(
                clients[
                    (clients["point_de_fidelite"] > 100)
                    & (clients["point_de_fidelite"] <= 300)
                ]
            ),
            "Gold (300-500)": len(
                clients[
                    (clients["point_de_fidelite"] > 300)
                    & (clients["point_de_fidelite"] <= 500)
                ]
            ),
            "VIP (500+)": len(clients[clients["point_de_fidelite"] > 500]),
        }
        return {
            "total_points_issued": int(total_points),
            "avg_points_per_customer": f"{avg_points:.1f}",
            "tier_distribution": tiers,
            "engagement_rate": f"{len(clients[clients['point_de_fidelite'] > 0]) / len(clients) * 100:.1f}%",
        }

    def _segment_customers(self) -> Dict:
        clients = self.data.get("clients")
        if clients is None or clients.empty:
            return {"error": "No data"}
        segments = {}
        if "total_spent" in clients.columns and "order_count" in clients.columns:
            high_value = len(
                clients[
                    (clients["total_spent"] > clients["total_spent"].median())
                    & (clients["order_count"] > 5)
                ]
            )
            new_customers = len(clients[clients["order_count"] <= 1])
            regular = len(
                clients[(clients["order_count"] > 1) & (clients["order_count"] <= 5)]
            )
            loyal = len(clients[clients["order_count"] > 5])
            segments = {
                "VIP (high value, frequent)": high_value,
                "New (first order)": new_customers,
                "Regular (2-5 orders)": regular,
                "Loyal (6+ orders)": loyal,
            }
        return {
            "segments": segments,
            "strategies": {
                "VIP": "Exclusive offers, early access, personal account manager",
                "New": "Welcome series, first-order discount, onboarding",
                "Regular": "Loyalty rewards, personalized recommendations",
                "Loyal": "Referral program, VIP events, surprise gifts",
            },
        }

    def _customer_lifetime_value(self) -> Dict:
        clients = self.data.get("clients")
        if clients is None or clients.empty:
            return {"error": "No data"}
        if "total_spent" not in clients.columns:
            return {"error": "No spending data"}
        avg_clv = clients["total_spent"].mean()
        max_clv = clients["total_spent"].max()
        median_clv = clients["total_spent"].median()
        return {
            "average_clv": f"{avg_clv:,.0f} FCFA",
            "median_clv": f"{median_clv:,.0f} FCFA",
            "max_clv": f"{max_clv:,.0f} FCFA",
            "total_customer_value": f"{clients['total_spent'].sum():,.0f} FCFA",
        }


# ============================================================
# AGENT 4: IDRIS - The Inventory Guardian
# ============================================================


class Idris(BaseMafaliaAgent):
    """
    IDRIS - The Inventory Guardian
    Superpower: Predicts stock needs before they happen
    Personality: Technical, precise, detail-oriented
    """

    def _get_profile(self) -> AgentProfile:
        return AgentProfile(
            name="Idris",
            title="Inventory Guardian",
            personality=AgentPersonality.TECHNICAL,
            superpowers=[
                "Stockout Prophet -- forecasts demand dips and spikes before they hit",
                "Waste Terminator -- traces spoilage to root cause and eliminates it",
                "Auto-Reorder Brain -- generates purchase orders the moment thresholds break",
                "Supplier Scorecard -- ranks vendors on price, reliability, and lead time",
                "Shelf Life Tracker -- countdown alerts for every perishable SKU",
            ],
            description=(
                "Idris never lets a business run out of stock or waste ingredients. He manages Fournisseurs "
                "(supply chain), Détaillant stock, and his predictions are eerily accurate."
            ),
            color="#1B998B",
            tag="[INV]",
            voice_style="precise, technical, methodical",
            expertise_areas=[
                "inventory", "stock", "suppliers", "waste", "forecasting",
                "fournisseur", "supply chain", "approvisionnement", "chaîne",
                "détaillant", "retail", "catalogue",
            ],
        )

    def process_logic(self, request: str, context: Dict = None) -> Dict:
        req = request.lower()
        if any(kw in req for kw in ["stock", "inventaire", "inventory"]):
            return self._current_stock()
        elif any(kw in req for kw in ["reorder", "commande", "achat", "réapprovisionnement"]):
            return self._reorder_suggestions()
        elif any(kw in req for kw in ["waste", "gaspi", "perte"]):
            return self._waste_analysis()
        elif any(kw in req for kw in ["expiry", "peremption", "expiration"]):
            return self._expiry_tracking()
        elif any(kw in req for kw in ["supplier", "fournisseur", "supply chain", "chaîne", "approvisionnement"]):
            return self._fournisseurs()
        else:
            return self._current_stock()

    def _current_stock(self) -> Dict:
        entrees = self.data.get("entrees_stock")
        sorties = self.data.get("sorties_stock")
        if entrees is None or entrees.empty:
            return {"error": "No stock data"}
        stock_in = (
            entrees.groupby("nom_produit")["quantite"].sum()
            if "quantite" in entrees.columns
            else pd.Series()
        )
        stock_out = (
            sorties.groupby("nom_produit")["quantite"].sum()
            if sorties is not None
            and not sorties.empty
            and "quantite" in sorties.columns
            else pd.Series()
        )
        current = stock_in.add(stock_out, fill_value=0)
        items = []
        critical = 0
        low = 0
        for product, qty in current.items():
            status = "critical" if qty < 5 else "low" if qty < 10 else "normal"
            if status == "critical":
                critical += 1
            elif status == "low":
                low += 1
            items.append({"product": product, "quantity": float(qty), "status": status})
        return {
            "total_items": len(items),
            "critical": critical,
            "low_stock": low,
            "normal": len(items) - critical - low,
            "items": sorted(items, key=lambda x: x["quantity"])[:15],
        }

    def _reorder_suggestions(self) -> Dict:
        stock = self._current_stock()
        if "error" in stock:
            return stock
        orders = []
        for item in stock.get("items", []):
            if item["status"] in ["critical", "low"]:
                suggested = 50 if item["status"] == "critical" else 25
                orders.append(
                    {
                        "product": item["product"],
                        "current_stock": item["quantity"],
                        "suggested_order": suggested,
                        "priority": item["status"],
                    }
                )
        return {
            "purchase_orders": orders,
            "total_items_to_order": len(orders),
            "estimated_cost": f"{sum(o['suggested_order'] * 500 for o in orders):,.0f} FCFA",
        }

    def _waste_analysis(self) -> Dict:
        entrees = self.data.get("entrees_stock")
        sorties = self.data.get("sorties_stock")
        if entrees is None or entrees.empty:
            return {"error": "No data"}
        total_in = entrees["quantite"].sum() if "quantite" in entrees.columns else 0
        total_out = (
            sorties["quantite"].sum()
            if sorties is not None
            and not sorties.empty
            and "quantite" in sorties.columns
            else 0
        )
        waste = total_in - total_out if total_in > 0 else 0
        waste_pct = (waste / total_in * 100) if total_in > 0 else 0
        return {
            "total_received": f"{total_in:,.0f} units",
            "total_used": f"{total_out:,.0f} units",
            "estimated_waste": f"{waste:,.0f} units ({waste_pct:.1f}%)",
            "recommendations": [
                "Implement FIFO (First In, First Out) rotation",
                "Track waste by product category",
                "Adjust order quantities based on demand forecasts",
            ],
        }

    def _expiry_tracking(self) -> Dict:
        entrees = self.data.get("entrees_stock")
        if entrees is None or entrees.empty:
            return {"warning": "No expiry data available"}
        if "date_peremption" not in entrees.columns:
            return {"warning": "Expiration dates not tracked"}
        entrees["date_peremption"] = pd.to_datetime(
            entrees["date_peremption"], errors="coerce"
        )
        today = datetime.now()
        week = today + timedelta(days=7)
        expiring = entrees[
            (entrees["date_peremption"] <= week) & (entrees["date_peremption"] >= today)
        ]
        expired = entrees[entrees["date_peremption"] < today]
        return {
            "expiring_this_week": len(expiring),
            "already_expired": len(expired),
            "items_expiring_soon": expiring[
                ["nom_produit", "quantite", "date_peremption"]
            ].to_dict("records")[:10]
            if not expiring.empty
            else [],
            "actions": [
                "Use expiring items in today's specials",
                "Offer discounts on near-expiry items",
                "Review ordering frequency for frequently expiring items",
            ],
        }

    def _supplier_analysis(self) -> Dict:
        return self._fournisseurs()

    def _fournisseurs(self) -> Dict:
        """Fournisseurs — Gestion fournisseurs & supply chain."""
        entrees = self.data.get("entrees_stock")
        result = {
            "mafalia_product": "Fournisseurs",
            "description": "Gestion fournisseurs & supply chain",
        }
        if entrees is not None and not entrees.empty and "fournisseur" in entrees.columns:
            supplier_stats = entrees.groupby("fournisseur").agg(
                {"quantite": "sum"}
            ).round(2)
            result["supplier_stats"] = supplier_stats.to_dict()
            result["total_suppliers"] = len(supplier_stats)
        result["modules"] = {
            "supplier_directory": {
                "features": ["Répertoire fournisseurs", "Fiches détaillées", "Historique commandes", "Notes & évaluations"],
            },
            "purchase_orders": {
                "features": ["Bons de commande automatiques", "Validation multi-niveaux", "Suivi statut livraison", "Réception & contrôle qualité"],
            },
            "supplier_scoring": {
                "criteria": ["Délai de livraison", "Qualité produits", "Prix compétitifs", "Fiabilité", "Communication"],
                "scale": "Score sur 100 par fournisseur",
            },
            "price_comparison": {
                "features": ["Comparaison prix multi-fournisseurs", "Historique des prix", "Alertes hausse de prix", "Négociation assistée"],
            },
        }
        result["supply_chain_features"] = [
            "Traçabilité complète (du fournisseur à l'assiette)",
            "Gestion des retours et litiges",
            "Calendrier de livraisons récurrentes",
            "Intégration avec le module Transport",
            "Marketplace Mafalia (connexion directe producteurs)",
        ]
        result["recommendations"] = [
            "Évaluer les fournisseurs trimestriellement",
            "Négocier des contrats long-terme pour les produits clés",
            "Diversifier les sources d'approvisionnement",
            "Utiliser la Marketplace Mafalia pour comparer les prix",
        ]
        return result


# ============================================================
# AGENT 5: NALA - The Marketing Maven
# ============================================================


class Nala(BaseMafaliaAgent):
    """
    NALA - The Marketing Maven
    Superpower: Creates campaigns that convert
    Personality: Creative, bold, trend-savvy
    """

    def _get_profile(self) -> AgentProfile:
        return AgentProfile(
            name="Nala",
            title="Marketing Maven",
            personality=AgentPersonality.CREATIVE,
            superpowers=[
                "Campaign Forge -- builds SMS, WhatsApp, and push campaigns from templates",
                "A/B Lab -- designs split tests with auto-winner selection",
                "Content Clockwork -- generates 90-day content calendars per vertical",
                "ROI Spotlight -- tracks every marketing franc from spend to conversion",
                "Audience Laser -- micro-targets segments by behavior, location, and spend tier",
            ],
            description=(
                "Nala powers Campagnes Marketing — SMS, WhatsApp & push ciblés. "
                "She creates marketing magic that converts across all Mafalia verticals."
            ),
            color="#F77F00",
            tag="[MKT]",
            voice_style="energetic, creative, persuasive",
            expertise_areas=[
                "marketing", "campaigns", "social", "content", "promotions",
                "sms", "whatsapp", "push", "notification", "ciblage",
                "campagne", "emailing", "newsletter",
            ],
        )

    def process_logic(self, request: str, context: Dict = None) -> Dict:
        req = request.lower()
        if any(kw in req for kw in ["campaign", "campagne", "marketing"]):
            return self._campaign_ideas()
        elif any(kw in req for kw in ["social", "whatsapp", "instagram"]):
            return self._social_strategy()
        elif any(kw in req for kw in ["promo", "promotion", "offer"]):
            return self._promotion_analysis()
        elif any(kw in req for kw in ["content", "contenu", "calendar"]):
            return self._content_calendar()
        elif any(kw in req for kw in ["roi", "return", "impact"]):
            return self._campaign_roi()
        else:
            return self._campaign_ideas()

    def _campaign_ideas(self) -> Dict:
        campaigns = [
            {
                "name": "Happy Hour Digital",
                "channel": "WhatsApp + SMS",
                "description": "Send personalized happy hour offers during slow periods (2-5pm)",
                "target": "Customers who haven't ordered in 7+ days",
                "expected_impact": "+25% afternoon orders",
                "cost": "Low",
                "setup_time": "30 minutes",
            },
            {
                "name": "Birthday Bonanza",
                "channel": "SMS + Email",
                "description": "Automated birthday discounts with personalized messages",
                "target": "All registered customers",
                "expected_impact": "+40% birthday month visits",
                "cost": "Low",
                "setup_time": "1 hour",
            },
            {
                "name": "Flash Friday",
                "channel": "Social Media + Push",
                "description": "Limited-time Friday deals announced at noon",
                "target": "Social media followers",
                "expected_impact": "+30% Friday revenue",
                "cost": "Medium",
                "setup_time": "2 hours",
            },
            {
                "name": "Loyalty Double Points Weekend",
                "channel": "App Push + In-store",
                "description": "Double loyalty points every weekend",
                "target": "Loyalty program members",
                "expected_impact": "+20% weekend traffic",
                "cost": "Medium",
                "setup_time": "15 minutes",
            },
            {
                "name": "Refer & Earn",
                "channel": "WhatsApp + In-app",
                "description": "Give 500 FCFA, Get 500 FCFA referral program",
                "target": "Existing customers",
                "expected_impact": "+15% new customer acquisition",
                "cost": "Medium",
                "setup_time": "1 hour",
            },
        ]
        return {"campaign_ideas": campaigns}

    def _social_strategy(self) -> Dict:
        return {
            "whatsapp": {
                "strategy": "Broadcast lists for promotions, 1-on-1 for VIP customers",
                "frequency": "2-3 times per week",
                "best_times": ["11:00-12:00", "17:00-18:00"],
                "content_types": ["Daily specials", "Flash deals", "Behind the scenes"],
            },
            "instagram": {
                "strategy": "Visual storytelling with food photography",
                "frequency": "Daily stories, 3-4 posts per week",
                "best_times": ["12:00-13:00", "19:00-20:00"],
                "content_types": ["Food photos", "Customer reviews", "Chef stories"],
            },
            "tiktok": {
                "strategy": "Short-form cooking videos and trends",
                "frequency": "3-4 videos per week",
                "best_times": ["18:00-21:00"],
                "content_types": ["Cooking reels", "Food challenges", "Team moments"],
            },
        }

    def _promotion_analysis(self) -> Dict:
        promos = self.data.get("promos")
        if promos is None or promos.empty:
            return {"info": "No promotion data available"}
        active = (
            promos[promos["statut"] == "actif"]
            if "statut" in promos.columns
            else pd.DataFrame()
        )
        types = (
            promos["type_promotion"].value_counts().to_dict()
            if "type_promotion" in promos.columns
            else {}
        )
        return {
            "total_promotions": len(promos),
            "active_promotions": len(active),
            "promotion_types": types,
            "recommendations": [
                "Test time-limited offers to create urgency",
                "Bundle slow-moving items with popular ones",
                "Use customer data for personalized promotions",
            ],
        }

    def _content_calendar(self) -> Dict:
        return {
            "monday": {
                "theme": "Motivation Monday",
                "content": "Inspirational quote + special offer",
            },
            "tuesday": {"theme": "Taste Tuesday", "content": "Featured dish spotlight"},
            "wednesday": {
                "theme": "Wellness Wednesday",
                "content": "Healthy menu options",
            },
            "thursday": {
                "theme": "Throwback Thursday",
                "content": "Customer memories/reviews",
            },
            "friday": {
                "theme": "Flash Friday",
                "content": "Weekend deals announcement",
            },
            "saturday": {
                "theme": "Social Saturday",
                "content": "User-generated content",
            },
            "sunday": {"theme": "Sunday Special", "content": "Family meal deals"},
        }

    def _campaign_roi(self) -> Dict:
        return {
            "metrics_to_track": [
                "Campaign reach (impressions)",
                "Engagement rate (clicks, opens)",
                "Conversion rate (orders from campaign)",
                "Revenue attributed to campaign",
                "Cost per acquisition",
                "Return on ad spend (ROAS)",
            ],
            "benchmark_targets": {
                "whatsapp_open_rate": "> 80%",
                "sms_click_rate": "> 15%",
                "email_conversion": "> 5%",
                "social_engagement": "> 3%",
            },
        }


# ============================================================
# AGENT 6: TARIQ - The Finance Wizard
# ============================================================


class Tariq(BaseMafaliaAgent):
    """
    TARIQ - The Finance Wizard
    Superpower: Turns numbers into business intelligence
    Personality: Strategic, analytical, visionary
    """

    def _get_profile(self) -> AgentProfile:
        return AgentProfile(
            name="Tariq",
            title="Finance Wizard",
            personality=AgentPersonality.STRATEGIC,
            superpowers=[
                "Cash Flow Oracle -- 90-day cash projection with confidence intervals",
                "Credit Score Engine -- AI-powered scoring from Mafalia transaction history",
                "Payment Nexus -- multi-channel gateway analytics (Wave, OM, Visa)",
                "Salary Card Ops -- Carte Mafalia mass payroll and expense tracking",
                "Auto-Ledger -- SYSCOHADA-compliant journal entries from every POS sale",
            ],
            description=(
                "Tariq sees the financial future. He manages Credit Scoring IA, API Paiement (multi-devises & mobile), "
                "Carte Mafalia (salary cards), and Comptabilité automatisée for smarter money decisions."
            ),
            color="#6C5B7B",
            tag="[FIN]",
            voice_style="wise, strategic, authoritative",
            expertise_areas=[
                "finance", "accounting", "tax", "investment", "budgeting",
                "credit", "scoring", "paiement", "payment", "carte", "salary",
                "comptabilité", "facturation", "gateway", "financement",
            ],
        )

    def process_logic(self, request: str, context: Dict = None) -> Dict:
        req = request.lower()
        if any(kw in req for kw in ["cash", "tresorerie", "cashflow"]):
            return self._cash_flow()
        elif any(kw in req for kw in ["health", "sante", "score financier"]):
            return self._financial_health()
        elif any(kw in req for kw in ["budget", "plan"]):
            return self._budget_planning()
        elif any(kw in req for kw in ["tax", "impot", "fiscal"]):
            return self._tax_insights()
        elif any(kw in req for kw in ["invest", "investir"]):
            return self._investment_analysis()
        elif any(kw in req for kw in ["credit", "scoring", "financement", "pr\u00eat", "pret", "loan"]):
            return self._credit_scoring()
        elif any(kw in req for kw in ["paiement", "payment", "gateway", "api paiement", "wave", "orange money"]):
            return self._payment_gateway()
        elif any(kw in req for kw in ["carte", "card", "salaire", "salary", "masspay"]):
            return self._carte_mafalia()
        elif any(kw in req for kw in ["comptabilit", "accounting", "facture", "invoice", "bilan"]):
            return self._comptabilite()
        else:
            return self._financial_health()

    def _cash_flow(self) -> Dict:
        trans = self.data.get("transactions")
        if trans is None or trans.empty:
            return {"error": "No transaction data"}
        trans = self._parse_dates(trans)
        if "created_at" not in trans.columns:
            return {"error": "No date data"}
        trans["date"] = trans["created_at"].dt.date
        daily = trans.groupby("date")["amount"].sum().sort_index()
        if len(daily) < 7:
            return {"error": "Need at least 7 days of data"}
        avg_daily = daily.mean()
        projected_weekly = avg_daily * 7
        projected_monthly = avg_daily * 30
        last_7 = daily.tail(7).sum()
        previous_7 = daily.tail(14).head(7).sum() if len(daily) >= 14 else last_7
        return {
            "average_daily_revenue": f"{avg_daily:,.0f} FCFA",
            "projected_weekly": f"{projected_weekly:,.0f} FCFA",
            "projected_monthly": f"{projected_monthly:,.0f} FCFA",
            "last_7_days": f"{last_7:,.0f} FCFA",
            "previous_7_days": f"{previous_7:,.0f} FCFA",
            "week_over_week": f"{((last_7 - previous_7) / previous_7 * 100) if previous_7 > 0 else 0:+.1f}%",
        }

    def _financial_health(self) -> Dict:
        trans = self.data.get("transactions")
        if trans is None or trans.empty:
            return {"error": "No data"}
        revenue = trans["amount"].sum() if "amount" in trans.columns else 0
        scores = {
            "revenue_growth": 75,
            "profit_margin": 68,
            "cash_flow": 82,
            "customer_retention": 71,
            "operational_efficiency": 79,
        }
        overall = sum(scores.values()) / len(scores)
        return {
            "overall_health_score": f"{overall:.0f}/100",
            "rating": "Good"
            if overall >= 70
            else "Needs Improvement"
            if overall >= 50
            else "Critical",
            "category_scores": {k: f"{v}/100" for k, v in scores.items()},
            "total_revenue": f"{revenue:,.0f} FCFA",
        }

    def _budget_planning(self) -> Dict:
        trans = self.data.get("transactions")
        revenue = (
            trans["amount"].sum()
            if trans is not None and not trans.empty and "amount" in trans.columns
            else 0
        )
        budgets = {
            "food_costs": {"percentage": 30, "amount": revenue * 0.30},
            "labor": {"percentage": 25, "amount": revenue * 0.25},
            "rent_utilities": {"percentage": 10, "amount": revenue * 0.10},
            "marketing": {"percentage": 8, "amount": revenue * 0.08},
            "maintenance": {"percentage": 5, "amount": revenue * 0.05},
            "contingency": {"percentage": 7, "amount": revenue * 0.07},
            "profit_target": {"percentage": 15, "amount": revenue * 0.15},
        }
        return {
            "recommended_budget": {
                k: {
                    "percentage": f"{v['percentage']}%",
                    "amount": f"{v['amount']:,.0f} FCFA",
                }
                for k, v in budgets.items()
            },
            "note": "Adjust percentages based on your business model",
        }

    def _tax_insights(self) -> Dict:
        return {
            "senegal_tax_overview": {
                "corporate_tax": "30% on profits",
                "vat": "18% standard rate",
                "minimum_tax": "0.5% of revenue (minimum 500,000 FCFA)",
                "withholding_tax": "Varies by service type",
            },
            "deductions_available": [
                "Business expenses (rent, utilities, supplies)",
                "Employee salaries and benefits",
                "Depreciation of equipment",
                "Marketing and advertising costs",
                "Professional fees",
            ],
            "recommendations": [
                "Keep detailed records of all business expenses",
                "Consult with a local tax advisor for optimization",
                "Consider VAT registration if revenue exceeds threshold",
                "Track deductible expenses monthly",
            ],
        }

    def _investment_analysis(self) -> Dict:
        return {
            "investment_priorities": [
                {
                    "area": "Technology",
                    "priority": "High",
                    "roi_potential": "30-50%",
                    "reason": "Automation reduces costs",
                },
                {
                    "area": "Marketing",
                    "priority": "High",
                    "roi_potential": "20-40%",
                    "reason": "Customer acquisition",
                },
                {
                    "area": "Staff Training",
                    "priority": "Medium",
                    "roi_potential": "15-25%",
                    "reason": "Better service = more revenue",
                },
                {
                    "area": "Equipment",
                    "priority": "Medium",
                    "roi_potential": "10-20%",
                    "reason": "Efficiency improvements",
                },
                {
                    "area": "Expansion",
                    "priority": "Low",
                    "roi_potential": "Variable",
                    "reason": "After establishing current location",
                },
            ],
            "funding_options": [
                "Mafalia Credit Scoring (financement IA)",
                "Mafalia Stock Financing (BFR)",
                "Bank loans",
                "Angel investors",
                "Government grants for SMEs",
                "Crowdfunding",
            ],
        }

    def _credit_scoring(self) -> Dict:
        """Credit Scoring — Accès au financement IA."""
        trans = self.data.get("transactions")
        clients = self.data.get("clients")
        score_factors = {}
        if trans is not None and not trans.empty and "amount" in trans.columns:
            monthly_revenue = trans["amount"].sum() / max(1, len(set(trans.get("created_at", pd.Series()).astype(str).str[:7])))
            score_factors["revenue_stability"] = min(100, int(monthly_revenue / 10000))
            score_factors["transaction_volume"] = min(100, len(trans) // 5)
        if clients is not None and not clients.empty:
            score_factors["customer_base"] = min(100, len(clients) * 2)
        overall = sum(score_factors.values()) / max(1, len(score_factors)) if score_factors else 50
        return {
            "mafalia_product": "Credit Scoring",
            "description": "Accès au financement IA",
            "credit_score": f"{overall:.0f}/100",
            "rating": "Excellent" if overall >= 80 else "Bon" if overall >= 60 else "Moyen" if overall >= 40 else "À améliorer",
            "score_factors": score_factors,
            "eligible_financing": {
                "stock_financing_bfr": overall >= 40,
                "equipment_leasing": overall >= 50,
                "expansion_loan": overall >= 70,
                "line_of_credit": overall >= 60,
            },
            "how_to_improve": [
                "Augmenter le volume de transactions via le POS Mafalia",
                "Maintenir une régularité dans les ventes",
                "Diversifier la base clients",
                "Utiliser les outils Mafalia de manière constante",
            ],
            "scoring_algorithm": [
                "Historique de ventes (pondération 35%)",
                "Comportement de paiement (25%)",
                "Croissance clients (20%)",
                "Efficacité opérationnelle (20%)",
            ],
        }

    def _payment_gateway(self) -> Dict:
        """API Paiement — Gateway multi-devises & mobile."""
        trans = self.data.get("transactions")
        payment_methods = self.data.get("payment_methods")
        result = {
            "mafalia_product": "API Paiement",
            "description": "Gateway multi-devises & mobile",
            "supported_methods": {
                "mobile_money": ["Wave", "Orange Money", "Free Money", "E-Money"],
                "cards": ["Visa", "Mastercard", "GIM-UEMOA"],
                "bank_transfer": ["Virement BCEAO", "Transfert inter-bancaire"],
                "cash": ["Espèces au comptoir", "Encaissement livreur"],
                "qr_code": ["QR Mafalia", "QR Wave"],
            },
            "api_features": [
                "SDK mobile (iOS / Android)",
                "Plugin web (JavaScript)",
                "Webhooks en temps réel",
                "Multi-devises (FCFA, EUR, USD)",
                "Réconciliation automatique",
                "Tableau de bord marchand",
                "Paiement en lien (share link)",
                "Paiement récurrent (abonnements)",
            ],
        }
        if trans is not None and not trans.empty and "payment_method" in trans.columns:
            result["payment_distribution"] = trans["payment_method"].value_counts().to_dict()
        if payment_methods is not None and not payment_methods.empty:
            result["configured_methods"] = len(payment_methods)
        result["integration_guide"] = {
            "step_1": "Obtenir les clés API depuis le dashboard Mafalia",
            "step_2": "Intégrer le SDK dans votre application",
            "step_3": "Configurer les webhooks pour les notifications",
            "step_4": "Tester en mode sandbox",
            "step_5": "Passer en production",
        }
        return result

    def _carte_mafalia(self) -> Dict:
        """Carte Mafalia — Carte salaire pour vos employés."""
        employees = self.data.get("employees")
        result = {
            "mafalia_product": "Carte Mafalia",
            "description": "Carte salaire pour vos employés",
            "features": [
                "Carte Visa prépayée pour chaque employé",
                "Virement de salaire instantané (MassPay)",
                "Plafonds configurables par employé",
                "Historique des dépenses en temps réel",
                "Blocage / déblocage à distance",
                "Retrait DAB sans frais (réseau partenaire)",
                "Paiements en ligne et en boutique",
            ],
            "benefits_employer": [
                "Éliminer les paiements en espèces",
                "Réduire les erreurs de paie",
                "Traçabilité complète des salaires",
                "Avances sur salaire automatisées",
                "Intégration avec la comptabilité Mafalia",
            ],
            "benefits_employee": [
                "Réception du salaire instantanée",
                "Carte acceptée partout (Visa)",
                "Gestion via app mobile",
                "Demande d'avance en 1 clic",
            ],
        }
        if employees is not None and not employees.empty:
            result["total_employees"] = len(employees)
            result["estimated_monthly_payroll"] = "Connecter le module RH pour le calcul"
        return result

    def _comptabilite(self) -> Dict:
        """Comptabilité — Gestion financière automatisée."""
        trans = self.data.get("transactions")
        result = {
            "mafalia_product": "Comptabilité",
            "description": "Gestion financière automatisée",
            "modules": {
                "journal_entries": "Écritures comptables automatiques à partir du POS",
                "invoicing": "Facturation client et fournisseur",
                "bank_reconciliation": "Rapprochement bancaire automatique",
                "tax_reporting": "Déclarations fiscales (TVA, IS, BIC)",
                "financial_statements": "Bilan, compte de résultat, flux de trésorerie",
                "expense_tracking": "Suivi des dépenses par catégorie",
            },
            "automation_rules": [
                "Chaque transaction POS → écriture comptable automatique",
                "Paiements fournisseurs → enregistrement automatique",
                "Salaires Carte Mafalia → charges sociales calculées",
                "TVA collectée / déductible → déclaration pré-remplie",
            ],
            "reports": [
                "Bilan mensuel / trimestriel / annuel",
                "Compte de résultat",
                "Tableau de flux de trésorerie",
                "Grand livre et balance",
                "Rapport TVA",
                "Tableau de bord financier en temps réel",
            ],
            "compliance_senegal": {
                "syscohada": "Conforme au Plan Comptable SYSCOHADA révisé",
                "dgid": "Export compatible DGID (Direction Générale des Impôts)",
                "ninea": "Gestion du NINEA et identification fiscale",
            },
        }
        if trans is not None and not trans.empty and "amount" in trans.columns:
            result["auto_entries_generated"] = len(trans)
            result["total_recorded_revenue"] = f"{trans['amount'].sum():,.0f} FCFA"
        return result


# ============================================================
# AGENT 7: SANA - The Data Scientist
# ============================================================


class Sana(BaseMafaliaAgent):
    """
    SANA - The Data Scientist
    Superpower: Finds hidden patterns in chaos
    Personality: Technical, curious, methodical
    """

    def _get_profile(self) -> AgentProfile:
        return AgentProfile(
            name="Sana",
            title="Data Scientist",
            personality=AgentPersonality.TECHNICAL,
            superpowers=[
                "Trend Seer -- predictive models that forecast sales, demand, and seasonality",
                "Anomaly Hunter -- catches outliers in transactions, stock, and operations",
                "Code Review -- audits data pipelines and agent logic for correctness and quality",
                "Carbon Gauge -- measures CO2 footprint across delivery, supply chain, and energy",
                "Insight Distiller -- turns messy datasets into one-page executive summaries",
            ],
            description=(
                "Sana turns raw data into crystal-clear insights. She also powers Carbone mesure — "
                "Mafalia's environmental impact tracking for sustainable business operations."
            ),
            color="#2D6A4F",
            tag="[DAT]",
            voice_style="analytical, precise, insightful",
            expertise_areas=[
                "data science", "ml", "statistics", "analytics", "visualization",
                "carbone", "carbon", "environnement", "environment", "impact",
                "sustainability", "empreinte", "développement durable",
            ],
        )

    def process_logic(self, request: str, context: Dict = None) -> Dict:
        req = request.lower()
        if any(kw in req for kw in ["code review", "review code", "data quality", "pipeline audit", "revue"]):
            return self._code_review()
        elif any(kw in req for kw in ["predict", "forecast", "prevision"]):
            return self._predict_sales()
        elif any(kw in req for kw in ["pattern", "tendance"]):
            return self._find_patterns()
        elif any(kw in req for kw in ["anomaly", "anomalie", "unusual"]):
            return self._detect_anomalies()
        elif any(kw in req for kw in ["correlation"]):
            return self._correlation_analysis()
        elif any(kw in req for kw in ["carbon", "carbone", "environnement", "environment", "empreinte", "co2", "durable"]):
            return self._carbone_mesure()
        elif any(kw in req for kw in ["insight", "decouverte"]):
            return self._key_insights()
        else:
            return self._key_insights()

    def _code_review(self) -> Dict:
        return {
            "review_type": "Data Pipeline & Logic Review",
            "agent": "Sana",
            "scope": [
                "Data loading correctness (CSV parsing, column mapping)",
                "Statistical method validity (mean, std, trend calcs)",
                "Edge-case handling (empty datasets, missing columns, NaN values)",
                "Output consistency (all agents return same Dict structure)",
                "Data type enforcement (dates, numerics, categoricals)",
            ],
            "checklist": {
                "data_integrity": {
                    "status": "review",
                    "checks": [
                        "All CSV files validated on load (expected columns present)",
                        "NaN and null values handled before aggregation",
                        "Date parsing uses consistent format with fallback",
                        "Numeric columns cast explicitly, not inferred",
                    ],
                },
                "logic_correctness": {
                    "status": "review",
                    "checks": [
                        "Revenue calculations account for refunds and discounts",
                        "Percentage calculations guard against division by zero",
                        "Trend calculations require minimum data points",
                        "Forecasting confidence intervals are statistically valid",
                    ],
                },
                "output_quality": {
                    "status": "review",
                    "checks": [
                        "All monetary values formatted consistently (FCFA)",
                        "Response dicts always include agent name and timestamp",
                        "Error responses use standard {error: str} format",
                        "List outputs capped to prevent oversized responses",
                    ],
                },
            },
            "recommendations": [
                "Add schema validation on CSV load with column type checks",
                "Create shared utility for safe division and NaN guards",
                "Standardize response envelope across all 10 agents",
                "Add unit tests for each agent's core calculation methods",
            ],
        }

    def _predict_sales(self) -> Dict:
        trans = self.data.get("transactions")
        if trans is None or trans.empty:
            return {"error": "No data"}
        trans = self._parse_dates(trans)
        if "created_at" not in trans.columns:
            return {"error": "No date data"}
        trans["date"] = trans["created_at"].dt.date
        daily = trans.groupby("date")["amount"].sum().sort_index()
        if len(daily) < 3:
            return {"error": "Need more data"}
        avg = daily.mean()
        trend = daily.diff().mean()
        std = daily.std()
        predictions = []
        for i in range(1, 8):
            pred = max(0, avg + trend * i)
            predictions.append(
                {
                    "day": f"+{i} days",
                    "predicted": f"{pred:,.0f} FCFA",
                    "confidence_interval": f"{max(0, pred - std):,.0f} - {pred + std:,.0f} FCFA",
                }
            )
        return {
            "method": "Trend-based forecasting",
            "historical_avg": f"{avg:,.0f} FCFA/day",
            "trend": "increasing" if trend > 0 else "decreasing",
            "predictions": predictions,
        }

    def _find_patterns(self) -> Dict:
        trans = self.data.get("transactions")
        commandes = self.data.get("commandes")
        patterns = []
        if trans is not None and not trans.empty:
            trans = self._parse_dates(trans)
            if "created_at" in trans.columns:
                trans["hour"] = trans["created_at"].dt.hour
                trans["day"] = trans["created_at"].dt.day_name()
                hourly = trans.groupby("hour")["amount"].sum()
                daily = trans.groupby("day")["amount"].sum()
                peak_hour = hourly.idxmax() if len(hourly) > 0 else "N/A"
                peak_day = daily.idxmax() if len(daily) > 0 else "N/A"
                patterns.append(f"Peak hour: {peak_hour}:00")
                patterns.append(f"Peak day: {peak_day}")
        if commandes is not None and not commandes.empty:
            if "mode_livraison" in commandes.columns:
                mode_dist = commandes["mode_livraison"].value_counts()
                patterns.append(
                    f"Most popular order mode: {mode_dist.index[0]} ({mode_dist.iloc[0]} orders)"
                )
        return {"patterns_found": patterns}

    def _detect_anomalies(self) -> Dict:
        trans = self.data.get("transactions")
        if trans is None or trans.empty:
            return {"error": "No data"}
        if "amount" not in trans.columns:
            return {"error": "No amount data"}
        amounts = trans["amount"]
        mean = amounts.mean()
        std = amounts.std()
        threshold = mean + 2 * std
        anomalies = trans[trans["amount"] > threshold]
        low_anomalies = trans[trans["amount"] < mean - 2 * std]
        return {
            "high_value_anomalies": len(anomalies),
            "low_value_anomalies": len(low_anomalies),
            "threshold": f"{threshold:,.0f} FCFA",
            "top_anomalies": anomalies.nlargest(5, "amount")[
                ["amount", "created_at"]
            ].to_dict("records")[:5]
            if not anomalies.empty
            else [],
        }

    def _correlation_analysis(self) -> Dict:
        return {
            "correlations": [
                {
                    "variables": "Temperature vs Cold Drinks Sales",
                    "correlation": "Strong positive",
                    "insight": "Hot days = more cold drink orders",
                },
                {
                    "variables": "Day of Week vs Order Volume",
                    "correlation": "Moderate",
                    "insight": "Weekends typically see 20-30% more orders",
                },
                {
                    "variables": "Promotion vs Sales Lift",
                    "correlation": "Strong positive",
                    "insight": "Active promotions increase sales by 15-25%",
                },
                {
                    "variables": "Time of Day vs Order Value",
                    "correlation": "Moderate",
                    "insight": "Lunch orders tend to be smaller than dinner orders",
                },
            ],
            "note": "Full correlation analysis requires more data points",
        }

    def _key_insights(self) -> Dict:
        insights = []
        trans = self.data.get("transactions")
        clients = self.data.get("clients")
        produits_cmd = self.data.get("produits_commandes")
        if trans is not None and not trans.empty:
            insights.append(f"Total transactions analyzed: {len(trans)}")
            if "amount" in trans.columns:
                insights.append(f"Total revenue: {trans['amount'].sum():,.0f} FCFA")
        if clients is not None and not clients.empty:
            insights.append(f"Total customers: {len(clients)}")
        if produits_cmd is not None and not produits_cmd.empty:
            top = produits_cmd.groupby("produit_id")["quantite"].sum().nlargest(3)
            insights.append(f"Top 3 products by volume identified")
        return {
            "key_insights": insights,
            "data_quality": "Good" if len(insights) > 2 else "Limited",
            "recommendation": "Collect more data for deeper insights",
        }

    def _carbone_mesure(self) -> Dict:
        """Carbone mesure — Suivi impact environnemental."""
        trans = self.data.get("transactions")
        entrees = self.data.get("entrees_stock")
        commandes = self.data.get("commandes")
        result = {
            "mafalia_product": "Carbone mesure",
            "description": "Suivi impact environnemental",
        }
        # Estimate carbon from delivery
        delivery_count = 0
        if commandes is not None and not commandes.empty and "mode_livraison" in commandes.columns:
            delivery_count = len(commandes[commandes["mode_livraison"] == "delivery"])
        carbon_delivery = delivery_count * 0.5  # ~0.5 kg CO2 per delivery
        # Estimate carbon from supply chain
        supply_trips = 0
        if entrees is not None and not entrees.empty:
            supply_trips = len(entrees)
        carbon_supply = supply_trips * 2.0  # ~2 kg CO2 per supplier delivery
        # Estimate from energy (based on transaction volume as proxy)
        energy_kwh = 0
        if trans is not None and not trans.empty:
            energy_kwh = len(trans) * 0.05  # ~0.05 kWh per POS transaction
        carbon_energy = energy_kwh * 0.4  # ~0.4 kg CO2/kWh (Senegal grid)
        total_carbon = carbon_delivery + carbon_supply + carbon_energy
        result["carbon_footprint"] = {
            "total_kg_co2": f"{total_carbon:,.1f} kg CO2",
            "delivery_emissions": f"{carbon_delivery:,.1f} kg CO2 ({delivery_count} livraisons)",
            "supply_chain_emissions": f"{carbon_supply:,.1f} kg CO2 ({supply_trips} réceptions)",
            "energy_emissions": f"{carbon_energy:,.1f} kg CO2 ({energy_kwh:.0f} kWh estimé)",
        }
        result["benchmarks"] = {
            "industry_avg_per_order": "1.2 kg CO2",
            "your_avg_per_order": f"{total_carbon / max(1, delivery_count + (len(trans) if trans is not None else 0)):,.2f} kg CO2",
        }
        result["reduction_actions"] = [
            {"action": "Grouper les livraisons par zone", "impact": "-20% émissions livraison", "effort": "Moyen"},
            {"action": "Fournisseurs locaux (circuits courts)", "impact": "-30% supply chain", "effort": "Moyen"},
            {"action": "Équipements basse consommation", "impact": "-15% énergie", "effort": "Investissement"},
            {"action": "Emballages biodégradables", "impact": "Réduction déchets", "effort": "Faible"},
            {"action": "Compensation carbone via partenaires", "impact": "Neutralité carbone", "effort": "Faible"},
        ]
        result["reporting"] = [
            "Rapport carbone mensuel automatique",
            "Tableau de bord impact environnemental",
            "Certification éco-responsable",
            "Export pour reporting RSE / ESG",
        ]
        return result


# ============================================================
# AGENT 8: RAVI - The Tech Architect
# ============================================================


class Ravi(BaseMafaliaAgent):
    """
    RAVI - The Tech Architect
    Superpower: Builds systems that scale
    Personality: Technical, innovative, forward-thinking
    """

    def _get_profile(self) -> AgentProfile:
        return AgentProfile(
            name="Ravi",
            title="Tech Architect",
            personality=AgentPersonality.TECHNICAL,
            superpowers=[
                "Security Review -- vulnerability scanning, auth audit, and compliance checks",
                "Code Review -- architecture review, dependency audit, and best-practice enforcement",
                "API Weaver -- PMS, POS, and payment API integration with SDK and webhooks",
                "Hardware Quartermaster -- terminal, kiosk, tablet, and printer fleet provisioning",
                "Perf Tuner -- latency profiling, query optimization, and load testing",
            ],
            description=(
                "Ravi designs technology solutions that grow with your business. He manages PMS API, "
                "Téléphone Mafalia POS, Terminaux POS, Tablettes & Kiosques, and Imprimantes."
            ),
            color="#E63946",
            tag="[TEC]",
            voice_style="technical, innovative, practical",
            expertise_areas=[
                "architecture", "api", "integration", "security", "performance",
                "pms api", "terminal", "tablette", "kiosque", "imprimante",
                "téléphone", "équipement", "equipment", "hardware", "printer",
            ],
        )

    def process_logic(self, request: str, context: Dict = None) -> Dict:
        req = request.lower()
        if any(kw in req for kw in ["code review", "review code", "audit code", "revue de code"]):
            return self._code_review()
        elif any(kw in req for kw in ["security review", "security audit", "vulnerability", "securite", "protect"]):
            return self._security_review()
        elif any(kw in req for kw in ["pms api", "hotel api", "intégration hôtelière"]):
            return self._pms_api()
        elif any(kw in req for kw in ["api", "integration", "connect"]):
            return self._api_recommendations()
        elif any(kw in req for kw in ["performance", "speed", "vitesse"]):
            return self._performance_tips()
        elif any(kw in req for kw in ["stack", "tech", "technology"]):
            return self._tech_stack()
        elif any(kw in req for kw in ["automation", "automate"]):
            return self._automation_ideas()
        elif any(kw in req for kw in ["terminal", "terminaux", "caisse tactile", "tpe"]):
            return self._terminaux_pos()
        elif any(kw in req for kw in ["téléphone", "telephone", "phone pos", "mafalia pos"]):
            return self._telephone_mafalia_pos()
        elif any(kw in req for kw in ["tablette", "kiosque", "tablet", "kiosk", "borne"]):
            return self._tablettes_kiosques()
        elif any(kw in req for kw in ["imprimante", "printer", "ticket", "reçu", "recu", "étiquette"]):
            return self._imprimantes()
        elif any(kw in req for kw in ["équipement", "equipment", "hardware", "matériel"]):
            return self._equipment_overview()
        else:
            return self._tech_stack()

    def _code_review(self) -> Dict:
        return {
            "review_type": "Code Review",
            "agent": "Ravi",
            "scope": [
                "Architecture patterns and module structure",
                "Dependency audit (outdated, unused, or vulnerable packages)",
                "API contract consistency (request/response schemas)",
                "Error handling and edge-case coverage",
                "Naming conventions and code style compliance",
                "Dead code and unused imports detection",
            ],
            "checklist": {
                "architecture": {
                    "status": "review",
                    "checks": [
                        "Single responsibility per module",
                        "Clean separation: agents / api / mcp / knowledge / skills",
                        "No circular imports between packages",
                        "Data layer isolated from business logic",
                    ],
                },
                "dependencies": {
                    "status": "review",
                    "checks": [
                        "All requirements pinned with minimum versions",
                        "No known CVEs in dependency tree",
                        "Unused packages flagged for removal",
                    ],
                },
                "best_practices": {
                    "status": "review",
                    "checks": [
                        "Type hints on all public functions",
                        "Docstrings on all classes and public methods",
                        "No hard-coded secrets or credentials",
                        "Consistent return types across agent process() methods",
                    ],
                },
            },
            "recommendations": [
                "Run a static analysis pass with ruff or flake8",
                "Add type-checking with mypy in CI pipeline",
                "Enforce import ordering with isort",
                "Set up pre-commit hooks for automated checks",
            ],
        }

    def _security_review(self) -> Dict:
        return {
            "review_type": "Security Review",
            "agent": "Ravi",
            "scope": [
                "Authentication and authorization audit",
                "Input validation and injection prevention",
                "Data exposure and PII handling",
                "API endpoint security",
                "Dependency vulnerability scan",
                "Infrastructure and deployment hardening",
            ],
            "checklist": {
                "authentication": {
                    "severity": "critical",
                    "checks": [
                        "API keys stored in environment variables, never in code",
                        "JWT or token-based auth on all mutation endpoints",
                        "Rate limiting on /agents/message and /orchestrate",
                        "CORS configured to allow only trusted origins",
                    ],
                },
                "input_validation": {
                    "severity": "high",
                    "checks": [
                        "All user input sanitized before processing",
                        "Request size limits enforced",
                        "SQL injection prevention on any DB queries",
                        "Path traversal prevention on file-based data loading",
                    ],
                },
                "data_protection": {
                    "severity": "high",
                    "checks": [
                        "Customer PII encrypted at rest",
                        "Sensitive fields excluded from API responses",
                        "Logging does not capture passwords or tokens",
                        "CSV data files not publicly accessible via API",
                    ],
                },
                "infrastructure": {
                    "severity": "medium",
                    "checks": [
                        "HTTPS enforced in production",
                        "Debug mode disabled in production",
                        "Error messages do not leak stack traces",
                        "Health check endpoint does not expose internals",
                    ],
                },
            },
            "risk_summary": {
                "critical": "Ensure API auth and secrets management",
                "high": "Validate all inputs, protect customer data",
                "medium": "Harden deployment, disable debug in prod",
            },
            "recommendations": [
                "Add API key middleware to FastAPI app",
                "Run pip-audit or safety check on dependencies",
                "Enable HTTPS with TLS certificates in production",
                "Implement request logging with PII redaction",
                "Set up automated security scanning in CI",
            ],
        }

    def _api_recommendations(self) -> Dict:
        return {
            "mafalia_apis": [
                {
                    "endpoint": "/api/coach/analyze",
                    "method": "GET",
                    "purpose": "Full business analysis",
                },
                {
                    "endpoint": "/api/coach/chat",
                    "method": "POST",
                    "purpose": "Natural language queries",
                },
                {
                    "endpoint": "/api/coach/forecast",
                    "method": "GET",
                    "purpose": "Sales predictions",
                },
                {
                    "endpoint": "/api/coach/stocks",
                    "method": "GET",
                    "purpose": "Inventory management",
                },
                {
                    "endpoint": "/api/coach/customers",
                    "method": "GET",
                    "purpose": "Customer analytics",
                },
                {
                    "endpoint": "/api/coach/finances",
                    "method": "GET",
                    "purpose": "Financial reports",
                },
            ],
            "integration_tips": [
                "Use API keys for authentication",
                "Implement rate limiting",
                "Cache frequently accessed data",
                "Use webhooks for real-time updates",
            ],
        }

    def _security_audit(self) -> Dict:
        return {
            "security_checklist": [
                {
                    "item": "HTTPS encryption",
                    "status": "Required",
                    "priority": "Critical",
                },
                {
                    "item": "API key rotation",
                    "status": "Recommended",
                    "priority": "High",
                },
                {
                    "item": "Data encryption at rest",
                    "status": "Required",
                    "priority": "Critical",
                },
                {
                    "item": "Access control (RBAC)",
                    "status": "Required",
                    "priority": "High",
                },
                {
                    "item": "Audit logging",
                    "status": "Recommended",
                    "priority": "Medium",
                },
                {
                    "item": "Regular security scans",
                    "status": "Recommended",
                    "priority": "Medium",
                },
                {
                    "item": "Backup strategy",
                    "status": "Required",
                    "priority": "Critical",
                },
                {
                    "item": "Incident response plan",
                    "status": "Recommended",
                    "priority": "High",
                },
            ],
            "compliance": [
                "GDPR for EU customers",
                "Senegal data protection laws",
                "PCI DSS for payments",
            ],
        }

    def _performance_tips(self) -> Dict:
        return {
            "database": [
                "Index frequently queried columns",
                "Use connection pooling",
                "Implement query caching",
                "Archive old data",
            ],
            "application": [
                "Use async processing for heavy tasks",
                "Implement CDN for static assets",
                "Optimize image sizes",
                "Use lazy loading",
            ],
            "infrastructure": [
                "Use auto-scaling",
                "Implement load balancing",
                "Monitor with APM tools",
                "Set up alerting",
            ],
        }

    def _tech_stack(self) -> Dict:
        return {
            "recommended_stack": {
                "backend": "Python/FastAPI or Node.js",
                "frontend": "React/Next.js",
                "database": "PostgreSQL",
                "cache": "Redis",
                "message_queue": "RabbitMQ or Celery",
                "monitoring": "Prometheus + Grafana",
                "deployment": "Docker + Kubernetes",
                "ci_cd": "GitHub Actions",
            },
            "mafalia_current": {
                "pos": "Mafalia POS (pre-installed)",
                "mobile": "Mafalia TPE App",
                "payments": "Wave, Orange Money, Cards",
                "analytics": "Mafalia Dashboard",
            },
        }

    def _automation_ideas(self) -> Dict:
        return {
            "automation_opportunities": [
                {
                    "area": "Order Processing",
                    "automation": "Auto-assign orders to kitchen stations",
                    "impact": "Reduce order time by 30%",
                    "complexity": "Low",
                },
                {
                    "area": "Inventory",
                    "automation": "Auto-reorder when stock is low",
                    "impact": "Prevent stockouts",
                    "complexity": "Medium",
                },
                {
                    "area": "Marketing",
                    "automation": "Trigger campaigns based on customer behavior",
                    "impact": "Increase engagement by 40%",
                    "complexity": "Medium",
                },
                {
                    "area": "Reporting",
                    "automation": "Daily/weekly auto-reports via email",
                    "impact": "Save 5 hours/week",
                    "complexity": "Low",
                },
                {
                    "area": "Customer Service",
                    "automation": "AI chatbot for common queries",
                    "impact": "Reduce support tickets by 50%",
                    "complexity": "High",
                },
            ],
        }

    def _pms_api(self) -> Dict:
        """PMS API — Intégration hôtelière sur mesure."""
        return {
            "mafalia_product": "PMS API",
            "description": "Intégration hôtelière sur mesure",
            "api_modules": {
                "reservations_api": {
                    "endpoints": ["/bookings", "/availability", "/rates", "/channels"],
                    "methods": ["GET", "POST", "PUT", "DELETE"],
                    "description": "Gestion complète des réservations par API",
                },
                "guest_api": {
                    "endpoints": ["/guests", "/checkin", "/checkout", "/preferences"],
                    "description": "Profils clients et gestion du séjour",
                },
                "room_api": {
                    "endpoints": ["/rooms", "/status", "/housekeeping", "/maintenance"],
                    "description": "Statut et gestion des chambres",
                },
                "billing_api": {
                    "endpoints": ["/invoices", "/charges", "/payments", "/folios"],
                    "description": "Facturation et paiements hôteliers",
                },
                "reporting_api": {
                    "endpoints": ["/reports/occupancy", "/reports/revenue", "/reports/forecast"],
                    "description": "Rapports hôteliers (RevPAR, ADR, taux d'occupation)",
                },
            },
            "channel_manager": {
                "supported": ["Booking.com", "Expedia", "Airbnb", "Hotels.com", "Direct"],
                "sync": "Temps réel bidirectionnel",
                "rate_parity": "Gestion automatique de la parité tarifaire",
            },
            "integration_options": [
                "API REST (JSON)",
                "Webhooks pour événements en temps réel",
                "SDK Python / JavaScript",
                "Import/export CSV/Excel",
            ],
        }

    def _telephone_mafalia_pos(self) -> Dict:
        """Téléphone Mafalia POS — POS préinstallé, prêt à l'emploi."""
        return {
            "mafalia_product": "Téléphone Mafalia POS",
            "description": "POS préinstallé, prêt à l'emploi",
            "specs": {
                "type": "Smartphone Android durci avec app Mafalia préinstallée",
                "screen": "6.5 pouces tactile",
                "connectivity": "4G LTE, WiFi, Bluetooth",
                "battery": "5000 mAh (journée complète)",
                "printer": "Imprimante thermique intégrée (optionnel)",
                "nfc": "Paiement sans contact",
            },
            "included_software": [
                "Mafalia POS (caisse complète)",
                "Gestion des commandes",
                "Paiements mobile money (Wave, Orange Money)",
                "Gestion de stock basique",
                "Rapports de vente",
                "Mode hors-ligne",
            ],
            "use_cases": [
                "Restaurants de petite taille",
                "Food trucks",
                "Marchés et foires",
                "Livraison (encaissement mobile)",
                "Pop-up stores",
            ],
            "pricing": "Contactez Mafalia pour les tarifs",
        }

    def _terminaux_pos(self) -> Dict:
        """Terminaux POS — Caisses tactiles certifiées."""
        return {
            "mafalia_product": "Terminaux POS",
            "description": "Caisses tactiles certifiées",
            "models": [
                {
                    "name": "Mafalia Terminal Pro",
                    "type": "Terminal tactile fixe",
                    "screen": "15.6 pouces tactile",
                    "features": ["Double écran (client + caissier)", "Lecteur code-barres", "Tiroir-caisse", "Imprimante intégrée"],
                    "ideal_for": "Restaurants, hôtels, grandes boutiques",
                },
                {
                    "name": "Mafalia Terminal Compact",
                    "type": "Terminal tactile portable",
                    "screen": "10 pouces tactile",
                    "features": ["Batterie longue durée", "WiFi + 4G", "Imprimante thermique", "NFC"],
                    "ideal_for": "Comptoirs, petites surfaces, terrasses",
                },
                {
                    "name": "Mafalia TPE",
                    "type": "Terminal de paiement électronique",
                    "screen": "5 pouces tactile",
                    "features": ["Paiement carte", "Mobile money", "QR code", "Connexion 4G"],
                    "ideal_for": "Encaissement mobile, livraison",
                },
            ],
            "certifications": ["PCI DSS", "EMV", "GIM-UEMOA"],
        }

    def _tablettes_kiosques(self) -> Dict:
        """Tablettes & Kiosques — Bornes de commande & accueil."""
        return {
            "mafalia_product": "Tablettes & Kiosques",
            "description": "Bornes de commande & accueil",
            "products": {
                "kiosque_commande": {
                    "description": "Borne de commande en libre-service",
                    "screen": "21-32 pouces tactile",
                    "features": [
                        "Menu interactif avec photos",
                        "Paiement intégré (carte, mobile money, QR)",
                        "Personnalisation des commandes",
                        "Upselling automatique",
                        "File d'attente virtuelle",
                    ],
                    "impact": "+15-25% panier moyen grâce à l'upselling",
                },
                "tablette_serveur": {
                    "description": "Tablette pour prise de commande en salle",
                    "screen": "10 pouces",
                    "features": [
                        "Menu digital avec stock en temps réel",
                        "Envoi direct en cuisine",
                        "Gestion des tables",
                        "Encaissement à table",
                    ],
                },
                "kiosque_accueil": {
                    "description": "Borne d'accueil hôtel / restaurant",
                    "features": [
                        "Check-in / check-out automatique",
                        "Information & orientation",
                        "Réservation sur place",
                        "Affichage promotions",
                    ],
                },
            },
        }

    def _imprimantes(self) -> Dict:
        """Imprimantes — Tickets, reçus, étiquettes."""
        return {
            "mafalia_product": "Imprimantes",
            "description": "Tickets, reçus, étiquettes",
            "models": {
                "thermal_receipt": {
                    "name": "Imprimante thermique de reçus",
                    "width": "80mm",
                    "speed": "200mm/s",
                    "connectivity": "USB, WiFi, Bluetooth",
                    "use": "Reçus clients, tickets de commande",
                },
                "kitchen_printer": {
                    "name": "Imprimante cuisine",
                    "type": "Thermique résistante chaleur/humidité",
                    "features": ["Alerte sonore", "Papier résistant", "Auto-coupure"],
                    "use": "Bons de commande cuisine",
                },
                "label_printer": {
                    "name": "Imprimante d'étiquettes",
                    "features": ["Code-barres", "QR codes", "Étiquettes produits", "Dates de péremption"],
                    "use": "Étiquetage produits, stock, expéditions",
                },
            },
            "integration": "Toutes les imprimantes sont compatibles avec Mafalia POS et se configurent automatiquement",
        }

    def _equipment_overview(self) -> Dict:
        """Vue d'ensemble de tous les équipements Mafalia."""
        return {
            "mafalia_vertical": "Équipements",
            "description": "Gamme complète d'équipements pour votre commerce",
            "products": {
                "telephone_pos": self._telephone_mafalia_pos(),
                "terminaux": self._terminaux_pos(),
                "tablettes_kiosques": self._tablettes_kiosques(),
                "imprimantes": self._imprimantes(),
            },
            "support": {
                "installation": "Installation et configuration sur site",
                "formation": "Formation du personnel incluse",
                "maintenance": "Maintenance et remplacement sous 24h",
                "hotline": "Support technique 7j/7",
            },
        }


# ============================================================
# AGENT 9: LUNA - The Growth Hacker
# ============================================================


class Luna(BaseMafaliaAgent):
    """
    LUNA - The Growth Hacker
    Superpower: Finds growth levers others miss
    Personality: Creative, experimental, data-driven
    """

    def _get_profile(self) -> AgentProfile:
        return AgentProfile(
            name="Luna",
            title="Growth Hacker",
            personality=AgentPersonality.CREATIVE,
            superpowers=[
                "Growth Loop Architect -- designs self-reinforcing acquisition and retention loops",
                "Funnel Surgeon -- diagnoses and fixes conversion drop-offs at every stage",
                "Experiment Engine -- rapid A/B and multivariate test design with auto-analysis",
                "Referral Igniter -- builds viral referral mechanics tuned to local markets",
                "Retention Alchemist -- turns one-time buyers into repeat customers",
            ],
            description="Luna finds growth opportunities hidden in plain sight. She turns small tweaks into big results.",
            color="#9B5DE5",
            tag="[GRO]",
            voice_style="energetic, experimental, results-focused",
            expertise_areas=["growth", "conversion", "funnels", "experiments", "viral"],
        )

    def process_logic(self, request: str, context: Dict = None) -> Dict:
        req = request.lower()
        if any(kw in req for kw in ["growth", "croissance", "scale"]):
            return self._growth_strategies()
        elif any(kw in req for kw in ["funnel", "entonnoir", "conversion"]):
            return self._funnel_analysis()
        elif any(kw in req for kw in ["experiment", "test", "ab"]):
            return self._experiment_ideas()
        elif any(kw in req for kw in ["viral", "referral", "parrainage"]):
            return self._viral_mechanics()
        elif any(kw in req for kw in ["retention", "retention"]):
            return self._retention_strategies()
        else:
            return self._growth_strategies()

    def _growth_strategies(self) -> Dict:
        return {
            "quick_wins": [
                {
                    "strategy": "Add order tracking notifications",
                    "impact": "+15% customer satisfaction",
                    "effort": "Low",
                    "timeline": "1 week",
                },
                {
                    "strategy": "Implement one-click reorder",
                    "impact": "+20% repeat orders",
                    "effort": "Low",
                    "timeline": "2 weeks",
                },
                {
                    "strategy": "Add Google Reviews integration",
                    "impact": "+25% new customer trust",
                    "effort": "Low",
                    "timeline": "3 days",
                },
            ],
            "medium_term": [
                {
                    "strategy": "Launch referral program",
                    "impact": "+30% new customers",
                    "effort": "Medium",
                    "timeline": "1 month",
                },
                {
                    "strategy": "Implement dynamic pricing",
                    "impact": "+10% revenue",
                    "effort": "Medium",
                    "timeline": "2 months",
                },
            ],
            "long_term": [
                {
                    "strategy": "Build loyalty ecosystem",
                    "impact": "+50% customer lifetime value",
                    "effort": "High",
                    "timeline": "3-6 months",
                },
                {
                    "strategy": "Expand to delivery-only kitchens",
                    "impact": "New revenue stream",
                    "effort": "High",
                    "timeline": "6 months",
                },
            ],
        }

    def _funnel_analysis(self) -> Dict:
        return {
            "typical_funnel": {
                "awareness": {
                    "rate": "100%",
                    "description": "People who see your brand",
                },
                "interest": {
                    "rate": "40%",
                    "description": "People who visit your page/menu",
                },
                "consideration": {
                    "rate": "20%",
                    "description": "People who add items to cart",
                },
                "purchase": {"rate": "10%", "description": "People who complete order"},
                "retention": {"rate": "30%", "description": "People who order again"},
            },
            "optimization_tips": [
                "Reduce friction at checkout",
                "Add social proof (reviews, ratings)",
                "Offer first-order discount",
                "Send cart abandonment reminders",
                "Create urgency with limited offers",
            ],
        }

    def _experiment_ideas(self) -> Dict:
        return {
            "experiments": [
                {
                    "name": "Button Color Test",
                    "hypothesis": "Green CTA button converts better than orange",
                    "metric": "Click-through rate",
                    "duration": "2 weeks",
                    "sample_size": "1000 visitors",
                },
                {
                    "name": "Pricing Display",
                    "hypothesis": "Showing original price + discount increases conversions",
                    "metric": "Conversion rate",
                    "duration": "2 weeks",
                    "sample_size": "500 visitors",
                },
                {
                    "name": "Menu Layout",
                    "hypothesis": "Featured items at top increase orders of those items",
                    "metric": "Item order rate",
                    "duration": "1 month",
                    "sample_size": "All customers",
                },
            ],
        }

    def _viral_mechanics(self) -> Dict:
        return {
            "referral_program": {
                "structure": "Give 500 FCFA, Get 500 FCFA",
                "channels": ["WhatsApp", "SMS", "In-app"],
                "incentives": [
                    "Discount on next order",
                    "Free delivery",
                    "Bonus loyalty points",
                ],
                "tracking": "Unique referral codes per customer",
            },
            "social_sharing": {
                "triggers": [
                    "After order completion",
                    "After reaching loyalty milestone",
                    "After receiving discount",
                ],
                "rewards": "Extra loyalty points for sharing",
                "platforms": ["WhatsApp", "Instagram Stories", "Facebook"],
            },
            "user_generated_content": {
                "campaign": "Share your Mafalia meal",
                "hashtag": "#MafaliaMoment",
                "reward": "Monthly prize for best photo",
            },
        }

    def _retention_strategies(self) -> Dict:
        return {
            "strategies": [
                {
                    "name": "Win-back Campaign",
                    "target": "Customers inactive for 30+ days",
                    "action": "Send personalized offer via SMS",
                    "expected_result": "15-20% reactivation rate",
                },
                {
                    "name": "Milestone Rewards",
                    "target": "Customers reaching order milestones",
                    "action": "Surprise reward at 10th, 25th, 50th order",
                    "expected_result": "Increased loyalty",
                },
                {
                    "name": "Exclusive Member Deals",
                    "target": "Loyalty program members",
                    "action": "Weekly member-only offers",
                    "expected_result": "Higher engagement",
                },
                {
                    "name": "Feedback Loop",
                    "target": "All customers after order",
                    "action": "Quick satisfaction survey",
                    "expected_result": "Identify and fix issues early",
                },
            ],
        }


# ============================================================
# AGENT 10: OMAR - The Partnership Connector
# ============================================================


class Omar(BaseMafaliaAgent):
    """
    OMAR - The Partnership Connector
    Superpower: Builds bridges between businesses
    Personality: Strategic, networked, relationship-focused
    """

    def _get_profile(self) -> AgentProfile:
        return AgentProfile(
            name="Omar",
            title="Partnership Connector",
            personality=AgentPersonality.STRATEGIC,
            superpowers=[
                "Deal Architect -- structures win-win partnership terms and revenue shares",
                "Network Mapper -- visualizes business ecosystem and identifies gaps",
                "Supplier Scout -- finds and benchmarks new vendors via Marketplace Mafalia",
                "Negotiation Engine -- data-backed bargaining positions for procurement",
                "Alliance Builder -- creates multi-partner programs across Mafalia verticals",
            ],
            description="Omar connects the right businesses together. His network and deal-making skills create win-win partnerships.",
            color="#06D6A0",
            tag="[PAR]",
            voice_style="diplomatic, strategic, relationship-focused",
            expertise_areas=[
                "partnerships",
                "suppliers",
                "marketplace",
                "negotiation",
                "ecosystem",
            ],
        )

    def process_logic(self, request: str, context: Dict = None) -> Dict:
        req = request.lower()
        if any(kw in req for kw in ["partner", "partenaire", "partnership"]):
            return self._partnership_opportunities()
        elif any(kw in req for kw in ["supplier", "fournisseur", "marketplace"]):
            return self._supplier_matching()
        elif any(kw in req for kw in ["deal", "negociation", "negotiate"]):
            return self._deal_recommendations()
        elif any(kw in req for kw in ["network", "reseau", "ecosystem"]):
            return self._ecosystem_map()
        elif any(kw in req for kw in ["financing", "financement", "loan"]):
            return self._financing_options()
        else:
            return self._partnership_opportunities()

    def _partnership_opportunities(self) -> Dict:
        return {
            "partnership_types": [
                {
                    "type": "Cross-promotion",
                    "description": "Partner with nearby businesses for mutual promotion",
                    "example": "Restaurant + Cinema combo deals",
                    "benefit": "Shared customer base",
                },
                {
                    "type": "Delivery Partnership",
                    "description": "Partner with delivery services",
                    "example": "Integration with local delivery companies",
                    "benefit": "Expanded reach",
                },
                {
                    "type": "Supplier Direct",
                    "description": "Connect directly with producers via Mafalia Marketplace",
                    "example": "Farm-to-table partnerships",
                    "benefit": "Lower costs, fresher ingredients",
                },
                {
                    "type": "Payment Integration",
                    "description": "Accept more payment methods",
                    "example": "Wave, Orange Money, Cards via Mafalia",
                    "benefit": "More customer options",
                },
            ],
            "mafalia_partners": [
                "ORoyal",
                "Sonacos",
                "Nestle",
                "Bictorys",
                "SamirPay",
                "Yas",
                "Kerby",
                "Saprolait",
                "CinetPay",
                "Diamo",
            ],
        }

    def _supplier_matching(self) -> Dict:
        return {
            "mafalia_marketplace": {
                "description": "Connect directly with producers and suppliers",
                "benefits": [
                    "Up to 50% savings on purchase prices",
                    "Direct from source - fresher ingredients",
                    "Transparent pricing",
                    "Reliable delivery schedules",
                ],
                "categories": [
                    "Fresh produce",
                    "Meat & poultry",
                    "Dairy products",
                    "Beverages",
                    "Packaging supplies",
                    "Cleaning supplies",
                ],
            },
            "recommendation": "Use Mafalia Marketplace to find and compare suppliers",
        }

    def _deal_recommendations(self) -> Dict:
        return {
            "negotiation_tips": [
                "Buy in bulk for better prices",
                "Negotiate payment terms (30-60 days)",
                "Ask for volume discounts",
                "Compare multiple suppliers",
                "Build long-term relationships for better deals",
            ],
            "deal_structures": [
                {
                    "type": "Volume Discount",
                    "structure": "Lower price per unit for larger orders",
                    "typical_savings": "10-20%",
                },
                {
                    "type": "Long-term Contract",
                    "structure": "Fixed prices for 6-12 months",
                    "typical_savings": "5-15%",
                },
                {
                    "type": "Exclusive Partnership",
                    "structure": "Exclusive supply rights in exchange for better terms",
                    "typical_savings": "15-25%",
                },
            ],
        }

    def _ecosystem_map(self) -> Dict:
        return {
            "mafalia_ecosystem": {
                "core_platform": "Mafalia POS & Management",
                "financial_services": ["Wallet", "Masspay", "Credit Scoring", "LendIA"],
                "marketing_services": ["Campaigns", "CRM", "Microsite"],
                "operational_services": [
                    "Inventory",
                    "PMS",
                    "Housekeeping",
                    "Transport",
                ],
                "hardware": [
                    "POS Terminals",
                    "Tablets & Kiosks",
                    "Printers",
                    "Phone POS",
                ],
                "marketplace": "Direct supplier connections",
            },
            "integration_opportunities": [
                "Connect POS with accounting software",
                "Link inventory with supplier marketplace",
                "Integrate CRM with marketing campaigns",
                "Connect payment gateway with wallet",
            ],
        }

    def _financing_options(self) -> Dict:
        return {
            "mafalia_financing": {
                "stock_financing": {
                    "description": "Access loans for working capital (BFR)",
                    "how_it_works": "Mafalia scoring algorithm evaluates your business",
                    "benefits": "No traditional bank needed, fast approval",
                },
                "credit_scoring": {
                    "description": "AI-powered credit scoring based on your Mafalia data",
                    "factors": [
                        "Sales history",
                        "Payment behavior",
                        "Customer growth",
                        "Operational efficiency",
                    ],
                },
            },
            "other_options": [
                "Bank loans (traditional)",
                "Microfinance institutions",
                "Government SME programs",
                "Angel investors",
                "Crowdfunding",
            ],
            "recommendation": "Start with Mafalia's credit scoring for fastest access to financing",
        }


# ============================================================
# AGENT REGISTRY
# ============================================================

ALL_AGENTS = {
    "zara": Zara,
    "kofi": Kofi,
    "amara": Amara,
    "idris": Idris,
    "nala": Nala,
    "tariq": Tariq,
    "sana": Sana,
    "ravi": Ravi,
    "luna": Luna,
    "omar": Omar,
}

AGENT_PROFILES = {name: agent(".")._get_profile() for name, agent in ALL_AGENTS.items()}


def get_agent(name: str, data_dir: str = ".") -> BaseMafaliaAgent:
    """Get an agent by name"""
    name = name.lower()
    if name not in ALL_AGENTS:
        raise ValueError(f"Unknown agent: {name}. Available: {list(ALL_AGENTS.keys())}")
    return ALL_AGENTS[name](data_dir)


def list_agents() -> List[Dict]:
    """List all available agents with their profiles"""
    return [
        {
            "name": p.name,
            "title": p.title,
            "tag": p.tag,
            "superpowers": p.superpowers,
            "expertise": p.expertise_areas,
        }
        for p in AGENT_PROFILES.values()
    ]


def demo():
    """Demo all agents"""
    print("=" * 70)
    print("MAFALIA AI AGENTS - DEMO")
    print("=" * 70)
    print()
    for name, agent_class in ALL_AGENTS.items():
        agent = agent_class(".")
        p = agent.profile
        print(f"{p.tag} {p.name} - {p.title}")
        print(f"   {p.description}")
        print(f"   Superpowers: {', '.join(p.superpowers[:3])}...")
        print()


if __name__ == "__main__":
    demo()
