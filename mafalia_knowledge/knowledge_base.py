# -*- coding: utf-8 -*-
"""
Mafalia Knowledge Base
======================
Structured knowledge base for restaurant business intelligence.
Stores best practices, domain knowledge, and contextual information
accessible to all Mafalia AI agents.
"""

import os
import json
import re
from datetime import datetime
from typing import Any, Dict, List, Optional
from dataclasses import dataclass, field, asdict


@dataclass
class KnowledgeEntry:
    id: str
    title: str
    content: str
    category: str
    tags: List[str]
    source: str
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    relevance_score: float = 1.0


BUILT_IN_KNOWLEDGE: List[Dict] = [
    # ─── RESTAURANT OPERATIONS ───────────────────────────────────────────────
    {
        "id": "rest_001",
        "title": "Restaurant KPIs: Key Performance Indicators",
        "content": (
            "Core restaurant KPIs to track:\n"
            "- Revenue per Available Seat Hour (RevPASH): Total revenue / (seats × open hours)\n"
            "- Food Cost Percentage: Food costs / food sales × 100. Target: 28-35%\n"
            "- Labor Cost Percentage: Labor costs / total sales × 100. Target: 25-35%\n"
            "- Prime Cost: Food cost + labor cost. Target: < 60% of sales\n"
            "- Average Check: Total sales / number of covers\n"
            "- Table Turnover Rate: Covers served / available seats\n"
            "- Customer Retention Rate: Repeat customers / total customers × 100\n"
            "- Net Promoter Score (NPS): Measures customer loyalty"
        ),
        "category": "restaurant",
        "tags": ["kpi", "metrics", "performance", "operations"],
        "source": "Mafalia Best Practices",
    },
    {
        "id": "rest_002",
        "title": "Menu Engineering: Stars, Plowhorses, Puzzles, Dogs",
        "content": (
            "Menu Engineering Matrix:\n"
            "- STARS (high popularity, high profit): Feature prominently, maintain quality\n"
            "- PLOWHORSES (high popularity, low profit): Popular but need cost analysis. Consider price increase or cost reduction\n"
            "- PUZZLES (low popularity, high profit): Good margins but not selling. Improve visibility, rename, or reposition\n"
            "- DOGS (low popularity, low profit): Consider removing from menu\n"
            "\nAction: Analyze each item's contribution margin and sales volume quarterly."
        ),
        "category": "restaurant",
        "tags": ["menu", "engineering", "profitability", "strategy"],
        "source": "Menu Engineering Principles",
    },
    {
        "id": "rest_003",
        "title": "Peak Hour Management and Staffing",
        "content": (
            "Peak hours for restaurant operations (typical West Africa):\n"
            "- Breakfast: 7:00-9:00\n"
            "- Lunch: 12:00-14:30\n"
            "- Dinner: 19:00-22:00\n"
            "\nStaffing principles:\n"
            "- Schedule 1 server per 4-6 tables during peak hours\n"
            "- Cross-train staff for flexibility\n"
            "- Use historical sales data to predict staffing needs\n"
            "- Maintain a minimum 30% overlap between shifts\n"
            "- Brief staff 15 minutes before each shift on specials and VIPs"
        ),
        "category": "restaurant",
        "tags": ["staffing", "peak hours", "operations", "scheduling"],
        "source": "Restaurant Operations Manual",
    },
    {
        "id": "rest_004",
        "title": "Food Safety and HACCP Basics",
        "content": (
            "HACCP (Hazard Analysis Critical Control Points) for restaurants:\n"
            "- Temperature danger zone: 5°C - 60°C (bacteria multiply rapidly)\n"
            "- Cold storage: < 4°C; Frozen: -18°C or below\n"
            "- Hot holding: > 60°C\n"
            "- Cool cooked food from 60°C to 20°C within 2 hours\n"
            "- FIFO rotation: First In, First Out for all ingredients\n"
            "- Regular cleaning schedule: surfaces, equipment, storage areas\n"
            "- Staff handwashing: before food handling, after breaks, after touching face"
        ),
        "category": "restaurant",
        "tags": ["food safety", "haccp", "hygiene", "compliance"],
        "source": "Food Safety Standards",
    },
    # ─── FINANCE ─────────────────────────────────────────────────────────────
    {
        "id": "fin_001",
        "title": "Restaurant Profit Margins: Benchmarks",
        "content": (
            "Restaurant profit margin benchmarks:\n"
            "- Gross Profit Margin: 65-70% (after food costs)\n"
            "- Operating Profit Margin: 15-20%\n"
            "- Net Profit Margin: 3-9%\n"
            "\nCost breakdown targets:\n"
            "- Food costs: 28-35% of revenue\n"
            "- Beverage costs: 18-25% of revenue\n"
            "- Labor costs: 25-35% of revenue\n"
            "- Occupancy costs: 5-10% of revenue\n"
            "- Marketing: 3-6% of revenue\n"
            "- Utilities: 3-5% of revenue"
        ),
        "category": "finance",
        "tags": ["profit", "margin", "benchmarks", "costs"],
        "source": "Restaurant Finance Standards",
    },
    {
        "id": "fin_002",
        "title": "Cash Flow Management for Restaurants",
        "content": (
            "Restaurant cash flow best practices:\n"
            "- Maintain 3-6 months of operating expenses as cash reserve\n"
            "- Reconcile daily cash/POS vs bank deposits\n"
            "- Pay suppliers on Net 30 to preserve cash flow\n"
            "- Invoice for catering/events immediately\n"
            "- Monitor daily cash position via POS reports\n"
            "- Seasonal planning: save during peak periods for slow months\n"
            "- Consider Mafalia BFR (stock financing) for inventory cash needs"
        ),
        "category": "finance",
        "tags": ["cash flow", "treasury", "management"],
        "source": "Mafalia Financial Guide",
    },
    {
        "id": "fin_003",
        "title": "Senegal Tax Obligations for Restaurants",
        "content": (
            "Tax obligations for restaurants in Senegal:\n"
            "- Impôt sur les Sociétés (IS): 30% on net profits\n"
            "- TVA (VAT): 18% standard rate (must register if revenue > 50M FCFA)\n"
            "- Contribution Forfaitaire (CF): For very small businesses\n"
            "- Taxe sur la Valeur Locative: Property/lease tax\n"
            "- CNSS: Social security contributions for employees\n"
            "- Patente: Business license fee (annual)\n"
            "\nImportant: Consult a local expert-comptable for accurate guidance."
        ),
        "category": "finance",
        "tags": ["tax", "senegal", "compliance", "fiscal"],
        "source": "Senegal Tax Authority (DGI)",
    },
    # ─── MARKETING ───────────────────────────────────────────────────────────
    {
        "id": "mkt_001",
        "title": "WhatsApp Marketing for Restaurants in West Africa",
        "content": (
            "WhatsApp is the #1 customer communication channel in West Africa:\n"
            "- Open rates: 85-95% (vs 20% for email)\n"
            "- Best practices:\n"
            "  * Create broadcast lists by customer segment (VIP, regular, new)\n"
            "  * Send 2-3 messages per week maximum to avoid opt-outs\n"
            "  * Best sending times: 11:00-12:00 and 17:00-18:00\n"
            "  * Use personalized names in messages\n"
            "  * Include one clear CTA (call to action) per message\n"
            "  * Use voice notes for more personal connection\n"
            "- Content ideas: daily specials, flash sales, event invitations, feedback requests"
        ),
        "category": "marketing",
        "tags": ["whatsapp", "marketing", "west africa", "digital"],
        "source": "Mafalia Marketing Playbook",
    },
    {
        "id": "mkt_002",
        "title": "Customer Loyalty Programs: Metrics and Design",
        "content": (
            "Designing effective loyalty programs:\n"
            "- Point systems: simple and understandable (1 FCFA = 1 point)\n"
            "- Tiers: Bronze → Silver → Gold → VIP increases engagement\n"
            "- Redemption rate target: 30-50% (too low = not engaging; too high = expensive)\n"
            "- Earning/burning ratio: Make rewards feel achievable but not too easy\n"
            "\nKey metrics:\n"
            "- Program enrollment rate: % of customers enrolled\n"
            "- Active participation rate: % who earned points in last 90 days\n"
            "- Redemption rate: Points redeemed / points issued\n"
            "- Loyalty customer revenue: Revenue from loyalty members vs non-members\n"
            "\nBest practice: Loyalty members spend 67% more than non-members on average."
        ),
        "category": "marketing",
        "tags": ["loyalty", "fidelite", "program", "retention"],
        "source": "Loyalty Program Design Guide",
    },
    {
        "id": "mkt_003",
        "title": "Promotional Strategy: BOGO, Discounts, Bundles",
        "content": (
            "Promotion types and when to use them:\n"
            "- BOGO (Buy One Get One): Great for slow days, increases order size\n"
            "- Percentage discount (10-20%): Works well for new customers\n"
            "- Bundle deals: Increases average check size by 15-25%\n"
            "- Happy hour: Drives traffic during slow periods\n"
            "- Loyalty points multiplier: Increases program engagement\n"
            "\nPromotion ROI formula:\n"
            "(Incremental revenue - promotion cost) / promotion cost × 100\n"
            "\nRule: Never discount more than 20% or it devalues your brand."
        ),
        "category": "marketing",
        "tags": ["promotions", "discounts", "roi", "strategy"],
        "source": "Promotional Marketing Guide",
    },
    # ─── OPERATIONS ──────────────────────────────────────────────────────────
    {
        "id": "ops_001",
        "title": "Inventory Management: Par Levels and Reorder Points",
        "content": (
            "Setting inventory par levels:\n"
            "- Par level = (average daily usage × lead time) + safety stock\n"
            "- Safety stock = 20-30% of average daily usage\n"
            "- Lead time: Number of days from order to delivery\n"
            "\nReorder point formula:\n"
            "Reorder Point = (Average Daily Usage × Lead Time) + Safety Stock\n"
            "\nABC analysis:\n"
            "- A items (top 20% of items, 80% of value): Daily monitoring\n"
            "- B items (next 30% of items, 15% of value): Weekly monitoring\n"
            "- C items (remaining 50% of items, 5% of value): Monthly monitoring\n"
            "\nFIFO is mandatory to minimize waste and expiry losses."
        ),
        "category": "operations",
        "tags": ["inventory", "stock", "par level", "reorder"],
        "source": "Inventory Management Handbook",
    },
    {
        "id": "ops_002",
        "title": "Order Fulfillment and Kitchen Workflow Optimization",
        "content": (
            "Kitchen workflow optimization principles:\n"
            "- Station design: Minimize movement between prep, cook, plate stations\n"
            "- KDS (Kitchen Display System): Reduces ticket times by 20-30%\n"
            "- Mise en place: Prep everything before service begins\n"
            "- FIFO for plating: First ordered = first served\n"
            "- Target ticket times: Fast casual: <10 min; Casual dining: <20 min\n"
            "\nOrder management:\n"
            "- Online orders: Integrate directly with POS (Mafalia)\n"
            "- Delivery orders: Separate prep station recommended\n"
            "- Peak hour playbook: Pre-batch common items"
        ),
        "category": "operations",
        "tags": ["kitchen", "workflow", "orders", "efficiency"],
        "source": "Kitchen Operations Manual",
    },
    {
        "id": "ops_003",
        "title": "Delivery Operations: Standards and KPIs",
        "content": (
            "Delivery operations standards:\n"
            "- Target delivery time: < 45 minutes for urban areas\n"
            "- Packaging: Leak-proof, temperature-maintaining containers\n"
            "- Quality check: All orders verified before handoff to driver\n"
            "\nDelivery KPIs:\n"
            "- On-time rate: > 90% target\n"
            "- Order accuracy: > 99% target\n"
            "- Customer rating: > 4.5/5 target\n"
            "- Average delivery time: Track and optimize continuously\n"
            "\nMafalia TPE App enables drivers to manage orders via mobile POS."
        ),
        "category": "operations",
        "tags": ["delivery", "livraison", "kpi", "standards"],
        "source": "Delivery Operations Guide",
    },
    # ─── TECHNOLOGY ──────────────────────────────────────────────────────────
    {
        "id": "tech_001",
        "title": "Restaurant POS Integration Best Practices",
        "content": (
            "POS system integration checklist:\n"
            "- Real-time inventory deduction on sale\n"
            "- Automatic daily sales reports to management\n"
            "- Customer data capture at every transaction\n"
            "- Payment method breakdown (cash, mobile money, card)\n"
            "- Menu sync across all ordering channels (POS, app, delivery)\n"
            "\nMafalia POS features:\n"
            "- Multi-location management from single dashboard\n"
            "- Offline mode with data sync when connectivity restored\n"
            "- Wave, Orange Money, Free Money, card payments integrated\n"
            "- Real-time analytics and reporting\n"
            "- API access for third-party integrations"
        ),
        "category": "technology",
        "tags": ["pos", "integration", "mafalia", "technology"],
        "source": "Mafalia POS Documentation",
    },
    {
        "id": "tech_002",
        "title": "Data Privacy and Security for Restaurant Businesses",
        "content": (
            "Customer data protection requirements:\n"
            "- Collect only data necessary for the service\n"
            "- Obtain explicit consent for marketing communications\n"
            "- Allow customers to opt-out at any time\n"
            "- Secure storage: encrypt customer data at rest\n"
            "- Access control: Only staff who need data can access it\n"
            "\nMafalia data security:\n"
            "- All data encrypted in transit (TLS 1.3)\n"
            "- Role-based access control (RBAC)\n"
            "- Audit logs for all data access\n"
            "- Daily automated backups\n"
            "- GDPR-inspired data handling practices"
        ),
        "category": "technology",
        "tags": ["security", "privacy", "data", "gdpr"],
        "source": "Mafalia Security Guide",
    },
    {
        "id": "tech_003",
        "title": "AI and Automation Opportunities for Restaurants",
        "content": (
            "High-ROI automation opportunities for restaurants:\n"
            "1. Automated inventory reordering (saves 2-3 hrs/week)\n"
            "2. AI demand forecasting (reduces waste by 15-20%)\n"
            "3. Automated customer re-engagement campaigns (increases retention by 25%)\n"
            "4. Smart pricing (dynamic pricing during peak hours)\n"
            "5. Chatbot for order taking and FAQs (reduces support load by 40%)\n"
            "6. Automated financial reporting (saves 5 hrs/week)\n"
            "7. AI-powered menu recommendations (increases upsell by 15%)\n"
            "\nMafalia AI tools: Coach Mafalia, BFMC scoring, LendIA credit analysis"
        ),
        "category": "technology",
        "tags": ["ai", "automation", "opportunities", "roi"],
        "source": "Mafalia AI Innovation Guide",
    },
    {
        "id": "tech_004",
        "title": "Model Context Protocol (MCP) - What it is",
        "content": (
            "Model Context Protocol (MCP) is an open standard by Anthropic for connecting AI assistants to external tools and data.\n"
            "\nMafalia MCP Server exposes:\n"
            "- 10 named AI agents as MCP tools\n"
            "- Business data as MCP resources\n"
            "- Prompt templates as MCP prompts\n"
            "\nUse cases:\n"
            "- Connect Claude Desktop to your Mafalia business data\n"
            "- Build AI-powered workflows on top of agent capabilities\n"
            "- Integrate with any MCP-compatible AI assistant\n"
            "\nConfiguration: Add to your Claude Desktop config:\n"
            '{"mcpServers": {"mafalia": {"command": "python", "args": ["run_mcp.py"]}}}'
        ),
        "category": "technology",
        "tags": ["mcp", "ai", "protocol", "integration"],
        "source": "Anthropic MCP Documentation",
    },
    # ─── HÔTELLERIE & OPS ─────────────────────────────────────────────────────
    {
        "id": "hotel_001",
        "title": "Hotel PMS: Gestion Hôtelière Intelligente",
        "content": (
            "Mafalia Hotel PMS — système de gestion hôtelière complet:\n"
            "- Réservation en ligne avec channel manager (Booking, Expedia, Airbnb)\n"
            "- Check-in / check-out rapide avec attribution automatique des chambres\n"
            "- Tarification dynamique basée sur le taux d'occupation et la demande\n"
            "- Facturation unifiée: chambre + restaurant + services\n"
            "\nKPIs hôteliers essentiels:\n"
            "- RevPAR (Revenue Per Available Room): Revenu / Chambres disponibles\n"
            "- ADR (Average Daily Rate): Revenu chambres / Chambres vendues\n"
            "- Taux d'occupation: Chambres vendues / Chambres disponibles × 100\n"
            "- Durée moyenne de séjour (LOS)\n"
            "- GOPPAR (Gross Operating Profit Per Available Room)\n"
            "\nIntégrations: POS restaurant, Housekeeping, API Paiement, Campagnes Marketing"
        ),
        "category": "hotel",
        "tags": ["pms", "hotel", "réservation", "revpar", "gestion hôtelière"],
        "source": "Mafalia Hotel PMS Documentation",
    },
    {
        "id": "hotel_002",
        "title": "Housekeeping: Ménage & Maintenance en Temps Réel",
        "content": (
            "Module Housekeeping Mafalia pour hôtels et résidences:\n"
            "- Cycle des chambres: Dirty → Cleaning → Inspected → Ready\n"
            "- Attribution automatique des tâches aux agents de ménage\n"
            "- Notifications temps réel quand une chambre est prête\n"
            "\nTypes de tâches:\n"
            "- Ménage quotidien (check-out et stay-over)\n"
            "- Deep cleaning (hebdomadaire ou mensuel)\n"
            "- Maintenance corrective (réparations urgentes)\n"
            "- Maintenance préventive (planifiée)\n"
            "\nKPIs:\n"
            "- Temps moyen de nettoyage par chambre: cible 25-35 min\n"
            "- Chambres par agent par jour: cible 12-16\n"
            "- Taux de conformité inspection: cible > 95%\n"
            "- Temps de réponse maintenance: cible < 30 min"
        ),
        "category": "hotel",
        "tags": ["housekeeping", "ménage", "maintenance", "hotel", "nettoyage"],
        "source": "Mafalia Housekeeping Guide",
    },
    {
        "id": "hotel_003",
        "title": "Transport: Logistique Fournisseurs Connectée",
        "content": (
            "Module Transport Mafalia pour la logistique connectée:\n"
            "- Suivi GPS des véhicules de livraison en temps réel\n"
            "- Planification optimisée des itinéraires (réduction carburant)\n"
            "- Gestion de la flotte: maintenance, coûts, utilisation\n"
            "\nLogistique fournisseurs:\n"
            "- Suivi des livraisons entrantes de chaque fournisseur\n"
            "- Confirmation de réception avec contrôle qualité\n"
            "- Traçabilité complète de la chaîne d'approvisionnement\n"
            "\nLivraison intégrée:\n"
            "- Attribution automatique des livreurs par zone\n"
            "- Estimation du temps de livraison en temps réel\n"
            "- Preuve de livraison avec signature électronique\n"
            "- KPI cible: > 90% livraisons à l'heure"
        ),
        "category": "hotel",
        "tags": ["transport", "logistique", "livraison", "fleet", "delivery"],
        "source": "Mafalia Transport Documentation",
    },
    {
        "id": "hotel_004",
        "title": "Carbone Mesure: Suivi Impact Environnemental",
        "content": (
            "Module Carbone Mesure Mafalia pour le développement durable:\n"
            "- Calcul automatique de l'empreinte carbone par activité\n"
            "- Sources d'émissions suivies:\n"
            "  * Livraisons: ~0.5 kg CO2 par livraison (moto), ~2 kg (véhicule)\n"
            "  * Chaîne d'approvisionnement: transport fournisseurs\n"
            "  * Énergie: consommation électrique des équipements\n"
            "  * Déchets: gaspillage alimentaire et emballages\n"
            "\nActions de réduction:\n"
            "- Circuits courts (fournisseurs locaux): -30% émissions supply chain\n"
            "- Groupage des livraisons par zone: -20% émissions livraison\n"
            "- Équipements basse consommation: -15% énergie\n"
            "- Emballages biodégradables: réduction déchets\n"
            "\nReporting: Rapport mensuel automatique, export RSE/ESG"
        ),
        "category": "hotel",
        "tags": ["carbone", "environnement", "co2", "durable", "impact"],
        "source": "Mafalia Carbone Mesure Guide",
    },
    # ─── FINANCE & RH ─────────────────────────────────────────────────────────
    {
        "id": "fin_004",
        "title": "Credit Scoring IA: Accès au Financement Mafalia",
        "content": (
            "Credit Scoring Mafalia — algorithme d'accès au financement IA:\n"
            "- Score basé sur les données d'activité Mafalia (pas de garantie bancaire requise)\n"
            "\nFacteurs de scoring (pondération):\n"
            "- Historique de ventes: 35% (volume, régularité, croissance)\n"
            "- Comportement de paiement: 25% (ponctualité, défauts)\n"
            "- Croissance clients: 20% (acquisition, rétention, LTV)\n"
            "- Efficacité opérationnelle: 20% (utilisation des outils Mafalia)\n"
            "\nTypes de financement accessibles:\n"
            "- BFR (Besoin en Fonds de Roulement): Financement du stock\n"
            "- Leasing équipement: Terminal POS, tablettes, imprimantes\n"
            "- Prêt expansion: Ouverture de nouveau point de vente\n"
            "- Ligne de crédit revolving\n"
            "\nProcessus: Scoring automatique → Offre en 24h → Décaissement en 48h"
        ),
        "category": "finance",
        "tags": ["credit", "scoring", "financement", "ia", "prêt"],
        "source": "Mafalia Credit Scoring Documentation",
    },
    {
        "id": "fin_005",
        "title": "API Paiement: Gateway Multi-Devises & Mobile",
        "content": (
            "API Paiement Mafalia — gateway de paiement multi-canaux:\n"
            "\nMéthodes supportées:\n"
            "- Mobile Money: Wave, Orange Money, Free Money, E-Money\n"
            "- Cartes: Visa, Mastercard, GIM-UEMOA\n"
            "- Virement bancaire: BCEAO, inter-bancaire\n"
            "- QR Code: QR Mafalia, QR Wave\n"
            "- Cash: Espèces au comptoir, encaissement livreur\n"
            "\nFonctionnalités API:\n"
            "- SDK mobile (iOS / Android) et plugin web (JavaScript)\n"
            "- Webhooks en temps réel pour chaque transaction\n"
            "- Multi-devises: FCFA, EUR, USD avec conversion automatique\n"
            "- Réconciliation automatique des paiements\n"
            "- Paiement par lien partageable (WhatsApp, SMS)\n"
            "- Paiement récurrent pour abonnements\n"
            "\nSécurité: PCI DSS, tokenisation, 3D Secure"
        ),
        "category": "finance",
        "tags": ["paiement", "payment", "api", "gateway", "mobile money"],
        "source": "Mafalia API Paiement Documentation",
    },
    {
        "id": "fin_006",
        "title": "Carte Mafalia: Carte Salaire pour Employés",
        "content": (
            "Carte Mafalia — solution de paiement des salaires:\n"
            "- Carte Visa prépayée pour chaque employé\n"
            "- Virement de salaire instantané via MassPay\n"
            "\nAvantages employeur:\n"
            "- Éliminer les paiements en espèces (risques, erreurs)\n"
            "- Traçabilité complète de la masse salariale\n"
            "- Avances sur salaire automatisées et contrôlées\n"
            "- Intégration directe avec la comptabilité Mafalia\n"
            "- Charges sociales calculées automatiquement (CNSS, IPM)\n"
            "\nAvantages employé:\n"
            "- Réception du salaire instantanée (pas d'attente bancaire)\n"
            "- Carte Visa acceptée partout (boutiques, DAB, en ligne)\n"
            "- App mobile pour suivi des dépenses\n"
            "- Demande d'avance sur salaire en 1 clic\n"
            "\nSécurité: Blocage/déblocage à distance, plafonds configurables"
        ),
        "category": "finance",
        "tags": ["carte", "salaire", "employé", "masspay", "rh"],
        "source": "Mafalia Carte Documentation",
    },
    {
        "id": "fin_007",
        "title": "Comptabilité Automatisée Mafalia",
        "content": (
            "Module Comptabilité Mafalia — gestion financière automatisée:\n"
            "\nAutomatisations:\n"
            "- Chaque transaction POS → écriture comptable automatique\n"
            "- Paiements fournisseurs → enregistrement automatique\n"
            "- Salaires Carte Mafalia → charges sociales calculées\n"
            "- TVA collectée / déductible → déclaration pré-remplie\n"
            "\nRapports générés:\n"
            "- Bilan mensuel / trimestriel / annuel\n"
            "- Compte de résultat\n"
            "- Tableau de flux de trésorerie\n"
            "- Grand livre et balance\n"
            "- Rapport TVA\n"
            "\nConformité Sénégal:\n"
            "- Plan Comptable SYSCOHADA révisé\n"
            "- Export compatible DGID (Direction Générale des Impôts)\n"
            "- Gestion NINEA et identification fiscale\n"
            "- Déclarations sociales CNSS / IPM automatiques"
        ),
        "category": "finance",
        "tags": ["comptabilité", "accounting", "syscohada", "fiscalité", "bilan"],
        "source": "Mafalia Comptabilité Documentation",
    },
    # ─── SUPPLY CHAIN & DÉTAILLANT ────────────────────────────────────────────
    {
        "id": "ops_004",
        "title": "Fournisseurs: Gestion Supply Chain Mafalia",
        "content": (
            "Module Fournisseurs Mafalia — gestion complète de la chaîne d'approvisionnement:\n"
            "\nFonctionnalités:\n"
            "- Répertoire fournisseurs avec fiches détaillées\n"
            "- Bons de commande automatiques basés sur les niveaux de stock\n"
            "- Validation multi-niveaux des commandes d'achat\n"
            "- Réception et contrôle qualité à la livraison\n"
            "\nScoring fournisseurs:\n"
            "- Délai de livraison (respect des délais annoncés)\n"
            "- Qualité des produits (taux de retours/réclamations)\n"
            "- Compétitivité des prix (benchmark marché)\n"
            "- Fiabilité (taux de commandes complètes)\n"
            "- Score composite sur 100\n"
            "\nMarketplace Mafalia:\n"
            "- Connexion directe avec producteurs locaux\n"
            "- Comparaison de prix multi-fournisseurs\n"
            "- Jusqu'à 50% d'économies sur les achats directs\n"
            "- Traçabilité de la ferme à l'assiette"
        ),
        "category": "operations",
        "tags": ["fournisseur", "supply chain", "approvisionnement", "marketplace"],
        "source": "Mafalia Fournisseurs Documentation",
    },
    {
        "id": "ops_005",
        "title": "Détaillant: Vente au Détail & Gestion de Stock",
        "content": (
            "Module Détaillant Mafalia — solution de vente au détail complète:\n"
            "\nFonctionnalités POS retail:\n"
            "- Gestion de catalogue produits avec codes-barres\n"
            "- Scan rapide des produits (caméra ou lecteur)\n"
            "- Stock en temps réel avec alertes de réapprovisionnement\n"
            "- Multi-point de vente avec synchronisation\n"
            "- Rapports de vente par catégorie, période, vendeur\n"
            "\nGestion de stock avancée:\n"
            "- Inventaire physique assisté (scan pour comptage)\n"
            "- Transferts entre points de vente\n"
            "- Gestion des variantes (taille, couleur)\n"
            "- Dates de péremption pour produits alimentaires\n"
            "\nOutils de croissance:\n"
            "- Upsales: recommandations pour augmenter le panier moyen\n"
            "- Fidélité: programme de points Mafalia\n"
            "- Campagnes ciblées via SMS/WhatsApp"
        ),
        "category": "operations",
        "tags": ["détaillant", "retail", "stock", "vente", "boutique"],
        "source": "Mafalia Détaillant Documentation",
    },
    # ─── ÉQUIPEMENTS ──────────────────────────────────────────────────────────
    {
        "id": "equip_001",
        "title": "Équipements Mafalia: Gamme Complète POS & Périphériques",
        "content": (
            "Gamme d'équipements Mafalia pour commerce et hôtellerie:\n"
            "\nTéléphone Mafalia POS:\n"
            "- Smartphone Android durci avec app Mafalia préinstallée\n"
            "- Idéal: food trucks, petits restaurants, marchés, livraison\n"
            "\nTerminaux POS:\n"
            "- Terminal Pro: 15.6\" tactile, double écran, tiroir-caisse\n"
            "- Terminal Compact: 10\" portable, WiFi + 4G\n"
            "- TPE: 5\" pour encaissement mobile\n"
            "- Certifications: PCI DSS, EMV, GIM-UEMOA\n"
            "\nTablettes & Kiosques:\n"
            "- Borne de commande libre-service (21-32\"): +15-25% panier moyen\n"
            "- Tablette serveur (10\"): prise de commande en salle\n"
            "- Kiosque d'accueil: check-in hôtel automatique\n"
            "\nImprimantes:\n"
            "- Thermique reçus (80mm, USB/WiFi/BT)\n"
            "- Cuisine (résistante chaleur, alerte sonore)\n"
            "- Étiquettes (code-barres, QR, dates péremption)\n"
            "\nSupport: installation sur site, formation, maintenance 24h, hotline 7j/7"
        ),
        "category": "technology",
        "tags": ["équipement", "terminal", "pos", "tablette", "kiosque", "imprimante"],
        "source": "Mafalia Equipment Catalog",
    },
    {
        "id": "equip_002",
        "title": "PMS API: Intégration Hôtelière Sur Mesure",
        "content": (
            "PMS API Mafalia — intégration hôtelière pour développeurs:\n"
            "\nModules API disponibles:\n"
            "- Reservations API: /bookings, /availability, /rates, /channels\n"
            "- Guest API: /guests, /checkin, /checkout, /preferences\n"
            "- Room API: /rooms, /status, /housekeeping, /maintenance\n"
            "- Billing API: /invoices, /charges, /payments, /folios\n"
            "- Reporting API: /reports/occupancy, /reports/revenue, /reports/forecast\n"
            "\nChannel Manager:\n"
            "- Plateformes: Booking.com, Expedia, Airbnb, Hotels.com, Direct\n"
            "- Synchronisation temps réel bidirectionnelle\n"
            "- Parité tarifaire automatique\n"
            "\nOptions d'intégration:\n"
            "- API REST (JSON) avec authentification OAuth2\n"
            "- Webhooks pour événements en temps réel\n"
            "- SDK Python et JavaScript\n"
            "- Import/export CSV et Excel"
        ),
        "category": "technology",
        "tags": ["pms", "api", "hotel", "intégration", "channel manager"],
        "source": "Mafalia PMS API Documentation",
    },
]


class MafaliaKnowledgeBase:
    """
    Structured knowledge base for the Mafalia AI ecosystem.
    Stores and retrieves domain knowledge accessible to all agents.
    """

    def __init__(self, data_dir: str = "."):
        self.data_dir = data_dir
        self._entries: List[KnowledgeEntry] = []
        self._load_built_in()
        self._load_custom()

    def _load_built_in(self):
        for entry_data in BUILT_IN_KNOWLEDGE:
            self._entries.append(KnowledgeEntry(**entry_data))

    def _load_custom(self):
        """Load custom knowledge from JSON file if it exists."""
        kb_path = os.path.join(self.data_dir, "mafalia_knowledge", "custom_knowledge.json")
        if os.path.exists(kb_path):
            try:
                with open(kb_path, "r", encoding="utf-8") as f:
                    custom = json.load(f)
                for entry in custom:
                    self._entries.append(KnowledgeEntry(**entry))
            except Exception:
                pass

    def search(self, query: str, category: Optional[str] = None, top_k: int = 5) -> List[Dict]:
        """
        Search the knowledge base using keyword matching.
        Returns top_k most relevant entries.
        """
        query_terms = set(re.findall(r'\w+', query.lower()))

        results = []
        for entry in self._entries:
            if category and entry.category != category:
                continue

            entry_text = (
                entry.title.lower() + " " +
                entry.content.lower() + " " +
                " ".join(entry.tags)
            )

            entry_terms = set(re.findall(r'\w+', entry_text))
            overlap = len(query_terms & entry_terms)

            if overlap > 0:
                score = overlap / max(len(query_terms), 1)
                results.append({
                    "id": entry.id,
                    "title": entry.title,
                    "content": entry.content,
                    "category": entry.category,
                    "tags": entry.tags,
                    "relevance": round(score, 3),
                })

        results.sort(key=lambda x: x["relevance"], reverse=True)
        return results[:top_k]

    def get_by_id(self, entry_id: str) -> Optional[Dict]:
        for entry in self._entries:
            if entry.id == entry_id:
                return asdict(entry)
        return None

    def get_by_category(self, category: str) -> List[Dict]:
        return [asdict(e) for e in self._entries if e.category == category]

    def get_all_categories(self) -> Dict:
        categories = {}
        for entry in self._entries:
            if entry.category not in categories:
                categories[entry.category] = []
            categories[entry.category].append({
                "id": entry.id,
                "title": entry.title,
                "tags": entry.tags,
            })
        return {
            "categories": list(categories.keys()),
            "entries_by_category": categories,
            "total_entries": len(self._entries),
        }

    def add_entry(self, title: str, content: str, category: str, tags: List[str], source: str = "User") -> Dict:
        """Add a new knowledge entry."""
        entry_id = f"custom_{len(self._entries):04d}"
        entry = KnowledgeEntry(
            id=entry_id,
            title=title,
            content=content,
            category=category,
            tags=tags,
            source=source,
        )
        self._entries.append(entry)
        self._save_custom()
        return asdict(entry)

    def _save_custom(self):
        """Persist custom entries to disk."""
        kb_dir = os.path.join(self.data_dir, "mafalia_knowledge")
        os.makedirs(kb_dir, exist_ok=True)
        kb_path = os.path.join(kb_dir, "custom_knowledge.json")
        custom = [asdict(e) for e in self._entries if e.id.startswith("custom_")]
        with open(kb_path, "w", encoding="utf-8") as f:
            json.dump(custom, f, ensure_ascii=False, indent=2)

    def stats(self) -> Dict:
        categories = {}
        for entry in self._entries:
            categories[entry.category] = categories.get(entry.category, 0) + 1
        return {
            "total_entries": len(self._entries),
            "categories": categories,
            "built_in_count": len(BUILT_IN_KNOWLEDGE),
            "custom_count": len(self._entries) - len(BUILT_IN_KNOWLEDGE),
        }
