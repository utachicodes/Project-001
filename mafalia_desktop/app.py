# -*- coding: utf-8 -*-
"""
Mafalia Desktop - Simple Flask + WebView App
=============================================
A simple desktop app that actually works.
Run: python mafalia_desktop/app.py
"""

import os
import sys
import json
import threading
import webview
from pathlib import Path

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from flask import Flask, render_template, jsonify, request
from mafalia_agents.agents import get_agent, list_agents
from mafalia_agents.orchestrator import MafaliaOrchestrator

# Create Flask app
app = Flask(__name__, 
    template_folder='templates',
    static_folder='static'
)

# Config storage
CONFIG_FILE = Path.home() / '.mafalia' / 'desktop_config.json'

def load_config():
    if CONFIG_FILE.exists():
        return json.loads(CONFIG_FILE.read_text())
    return {'connected': False, 'user': None}

def save_config(cfg):
    CONFIG_FILE.parent.mkdir(exist_ok=True)
    CONFIG_FILE.write_text(json.dumps(cfg, indent=2))

# Global state
orchestrator = None
config = load_config()

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/agents')
def get_agents():
    return jsonify(list_agents())

@app.route('/api/chat', methods=['POST'])
def chat():
    global orchestrator
    data = request.json
    message = data.get('message', '')
    
    if not config.get('connected'):
        return jsonify({
            'response': 'Please connect to mafalia.com first. Click "Connect" in the sidebar.'
        })
    
    # Initialize orchestrator if needed
    if orchestrator is None:
        data_dir = str(Path(__file__).parent.parent)
        orchestrator = MafaliaOrchestrator(data_dir)
    
    # Route to appropriate agent based on message
    try:
        result = orchestrator.orchestrate(message, max_agents=2)
        return jsonify({
            'response': result.get('summary', str(result)),
            'agents_used': result.get('agents_used', [])
        })
    except Exception as e:
        return jsonify({'response': f'Error: {str(e)}'})

@app.route('/api/quick/<action>')
def quick_action(action):
    global orchestrator
    
    if not config.get('connected'):
        return jsonify({'error': 'Not connected'})
    
    if orchestrator is None:
        data_dir = str(Path(__file__).parent.parent)
        orchestrator = MafaliaOrchestrator(data_dir)
    
    try:
        if action == 'revenue':
            agent = get_agent('zara', str(Path(__file__).parent.parent))
            result = agent.process('revenue summary')
            return jsonify({'response': format_agent_response(result)})
        
        elif action == 'customers':
            agent = get_agent('amara', str(Path(__file__).parent.parent))
            result = agent.process('customer overview')
            return jsonify({'response': format_agent_response(result)})
        
        elif action == 'inventory':
            agent = get_agent('idris', str(Path(__file__).parent.parent))
            result = agent.process('stock levels')
            return jsonify({'response': format_agent_response(result)})
        
        elif action == 'orders':
            agent = get_agent('kofi', str(Path(__file__).parent.parent))
            result = agent.process('recent orders')
            return jsonify({'response': format_agent_response(result)})
        
        elif action == 'summary':
            result = orchestrator.full_business_summary()
            return jsonify({'response': result.get('executive_summary', str(result))})
        
        else:
            return jsonify({'response': 'Unknown action'})
    
    except Exception as e:
        return jsonify({'response': f'Error: {str(e)}'})

def format_agent_response(result):
    """Format agent output for display."""
    if isinstance(result, dict):
        lines = []
        for key, value in result.items():
            lines.append(f"**{key.replace('_', ' ').title()}**: {value}")
        return '\n'.join(lines)
    return str(result)

@app.route('/api/connect', methods=['POST'])
def connect():
    data = request.json
    email = data.get('email', '')
    
    # For demo, accept any login
    config['connected'] = True
    config['user'] = {
        'name': email.split('@')[0].title() if email else 'User',
        'email': email,
        'business': 'Mafalia Business'
    }
    save_config(config)
    
    return jsonify({'success': True, 'user': config['user']})

@app.route('/api/disconnect', methods=['POST'])
def disconnect():
    config['connected'] = False
    config['user'] = None
    save_config(config)
    return jsonify({'success': True})

@app.route('/api/status')
def status():
    return jsonify({
        'connected': config.get('connected', False),
        'user': config.get('user')
    })

def run_flask():
    """Run Flask in a thread."""
    app.run(host='127.0.0.1', port=0, debug=False)  # port 0 = auto-assign

if __name__ == '__main__':
    # Start Flask in background thread
    flask_thread = threading.Thread(target=run_flask, daemon=True)
    flask_thread.start()
    
    # Give Flask time to start
    import time
    time.sleep(1)
    
    # Get the actual port
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind(('127.0.0.1', 0))
    port = sock.getsockname()[1]
    sock.close()
    
    # Actually run Flask with the found port
    def run_server():
        app.run(host='127.0.0.1', port=port, debug=False)
    
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(1)
    
    # Create desktop window
    window = webview.create_window(
        'Mafalia Code - Business Assistant',
        f'http://127.0.0.1:{port}/',
        width=1200,
        height=800,
        min_size=(900, 600),
        text_select=True
    )
    
    webview.start()
