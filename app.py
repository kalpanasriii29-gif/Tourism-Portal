from flask import Flask, request, jsonify, render_template, redirect, url_for, flash
import sqlite3
import datetime
import requests
import os
import sys
from functools import wraps

app = Flask(__name__)
# Use environment variable for secret key in production, fallback for development
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# Database initialization
def init_db():
    conn = sqlite3.connect('waterfalls.db')
    cursor = conn.cursor()
    
    # Create waterfalls table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS waterfalls (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            is_open BOOLEAN DEFAULT 1,
            bathing_allowed BOOLEAN DEFAULT 1,
            last_updated TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create emergency contacts table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS emergency_contacts (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            department TEXT NOT NULL,
            phone_number TEXT NOT NULL
        )
    ''')
    
    # Insert default waterfalls data if not exists
    waterfalls = [
        'Coutrallam Main Falls',
        'Coutrallam Old Falls', 
        'Tiger Falls',
        'Chitraruvi',
        'Palaruvi',
        'Five Falls'
    ]
    
    for waterfall in waterfalls:
        cursor.execute('SELECT COUNT(*) FROM waterfalls WHERE name = ?', (waterfall,))
        if cursor.fetchone()[0] == 0:
            cursor.execute('''
                INSERT INTO waterfalls (name, is_open, bathing_allowed, last_updated) 
                VALUES (?, 1, 1, ?)
            ''', (waterfall, datetime.datetime.now().isoformat()))
    
    # Insert default emergency contacts if not exists
    contacts = [
        ('Forest Department', 'Wildlife Protection', '+91-9876543210'),
        ('Police Station', 'Emergency Services', '+91-9876543211'),
        ('Medical Emergency', 'Ambulance Service', '+91-9876543212'),
        ('Tourist Helpline', 'Information Center', '+91-9876543213')
    ]
    
    for name, dept, phone in contacts:
        cursor.execute('SELECT COUNT(*) FROM emergency_contacts WHERE name = ? AND department = ?', (name, dept))
        if cursor.fetchone()[0] == 0:
            cursor.execute('''
                INSERT INTO emergency_contacts (name, department, phone_number) 
                VALUES (?, ?, ?)
            ''', (name, dept, phone))
    
    conn.commit()
    conn.close()

# Simple admin authentication (basic implementation)
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Simple check - hardcoded admin password
        if not request.form.get('admin_key') == 'wdvgtyhnvfr2019pkn' and not request.args.get('admin_key') == 'wdvgtyhnvfr2019pkn':
            return render_template('admin_login.html')
        return f(*args, **kwargs)
    return decorated_function

# API Routes
@app.route('/api/waterfalls')
def get_waterfalls():
    conn = sqlite3.connect('waterfalls.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, name, is_open, bathing_allowed, last_updated FROM waterfalls')
    waterfalls = []
    for row in cursor.fetchall():
        waterfalls.append({
            'id': row[0],
            'name': row[1],
            'is_open': bool(row[2]),
            'bathing_allowed': bool(row[3]),
            'last_updated': row[4]
        })
    conn.close()
    return jsonify(waterfalls)

@app.route('/api/waterfall/<int:waterfall_id>')
def get_waterfall_status(waterfall_id):
    conn = sqlite3.connect('waterfalls.db')
    cursor = conn.cursor()
    cursor.execute('SELECT name, is_open, bathing_allowed, last_updated FROM waterfalls WHERE id = ?', (waterfall_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return jsonify({
            'name': row[0],
            'status': 'Open' if row[1] else 'Closed',
            'bathing': 'Allowed' if row[2] else 'Not Allowed',
            'last_updated': row[3]
        })
    return jsonify({'error': 'Waterfall not found'}), 404

@app.route('/api/emergency-contacts')
def get_emergency_contacts():
    conn = sqlite3.connect('waterfalls.db')
    cursor = conn.cursor()
    cursor.execute('SELECT name, department, phone_number FROM emergency_contacts')
    contacts = []
    for row in cursor.fetchall():
        contacts.append({
            'name': row[0],
            'department': row[1],
            'phone': row[2]
        })
    conn.close()
    return jsonify(contacts)

@app.route('/api/weather-alerts')
def get_weather_alerts():
    try:
        # Fetch weather data for Tenkasi (near the waterfalls)
        response = requests.get('https://wttr.in/Tenkasi?format=3', timeout=10)
        if response.status_code == 200:
            weather_info = response.text.strip()
            return jsonify({
                'location': 'Tenkasi',
                'weather': weather_info,
                'timestamp': datetime.datetime.now().isoformat()
            })
        else:
            return jsonify({'error': 'Weather service unavailable'}), 503
    except requests.RequestException:
        return jsonify({'error': 'Unable to fetch weather data'}), 503

# Frontend Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/admin')
def admin_panel():
    return render_template('admin_login.html')

@app.route('/admin/dashboard', methods=['GET', 'POST'])
@admin_required
def admin_dashboard():
    if request.method == 'POST':
        # Update waterfall statuses
        conn = sqlite3.connect('waterfalls.db')
        cursor = conn.cursor()
        
        # Get all waterfalls
        cursor.execute('SELECT id FROM waterfalls')
        waterfall_ids = [row[0] for row in cursor.fetchall()]
        
        for waterfall_id in waterfall_ids:
            is_open = request.form.get(f'is_open_{waterfall_id}') == 'on'
            bathing_allowed = request.form.get(f'bathing_allowed_{waterfall_id}') == 'on'
            
            cursor.execute('''
                UPDATE waterfalls 
                SET is_open = ?, bathing_allowed = ?, last_updated = ?
                WHERE id = ?
            ''', (is_open, bathing_allowed, datetime.datetime.now().isoformat(), waterfall_id))
        
        conn.commit()
        conn.close()
        flash('Waterfall statuses updated successfully!')
        return redirect(url_for('admin_dashboard', admin_key='wdvgtyhnvfr2019pkn'))
    
    # GET request - show the form
    conn = sqlite3.connect('waterfalls.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, name, is_open, bathing_allowed, last_updated FROM waterfalls')
    waterfalls = []
    for row in cursor.fetchall():
        waterfalls.append({
            'id': row[0],
            'name': row[1],
            'is_open': bool(row[2]),
            'bathing_allowed': bool(row[3]),
            'last_updated': row[4]
        })
    conn.close()
    return render_template('admin_dashboard.html', waterfalls=waterfalls, admin_key='wdvgtyhnvfr2019pkn')

# Emergency Contacts Management Routes
@app.route('/admin/emergency-contacts')
@admin_required
def admin_emergency_contacts():
    conn = sqlite3.connect('waterfalls.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, name, department, phone_number FROM emergency_contacts ORDER BY name')
    contacts = []
    for row in cursor.fetchall():
        contacts.append({
            'id': row[0],
            'name': row[1],
            'department': row[2],
            'phone_number': row[3]
        })
    conn.close()
    return render_template('admin_emergency_contacts.html', contacts=contacts, admin_key='wdvgtyhnvfr2019pkn')

@app.route('/admin/emergency-contacts/add', methods=['POST'])
@admin_required
def add_emergency_contact():
    name = request.form.get('name')
    department = request.form.get('department')
    phone_number = request.form.get('phone_number')
    
    if name and department and phone_number:
        conn = sqlite3.connect('waterfalls.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO emergency_contacts (name, department, phone_number)
            VALUES (?, ?, ?)
        ''', (name, department, phone_number))
        conn.commit()
        conn.close()
        flash('Emergency contact added successfully!')
    else:
        flash('All fields are required!')
    
    return redirect(url_for('admin_emergency_contacts', admin_key='wdvgtyhnvfr2019pkn'))

@app.route('/admin/emergency-contacts/edit/<int:contact_id>', methods=['POST'])
@admin_required
def edit_emergency_contact(contact_id):
    name = request.form.get('name')
    department = request.form.get('department')
    phone_number = request.form.get('phone_number')
    
    if name and department and phone_number:
        conn = sqlite3.connect('waterfalls.db')
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE emergency_contacts 
            SET name = ?, department = ?, phone_number = ?
            WHERE id = ?
        ''', (name, department, phone_number, contact_id))
        conn.commit()
        conn.close()
        flash('Emergency contact updated successfully!')
    else:
        flash('All fields are required!')
    
    return redirect(url_for('admin_emergency_contacts', admin_key='wdvgtyhnvfr2019pkn'))

@app.route('/admin/emergency-contacts/delete/<int:contact_id>', methods=['POST'])
@admin_required
def delete_emergency_contact(contact_id):
    conn = sqlite3.connect('waterfalls.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM emergency_contacts WHERE id = ?', (contact_id,))
    conn.commit()
    conn.close()
    flash('Emergency contact deleted successfully!')
    return redirect(url_for('admin_emergency_contacts', admin_key='wdvgtyhnvfr2019pkn'))

if __name__ == '__main__':
    # Handle command line arguments
    if len(sys.argv) > 1 and sys.argv[1] == '--init-db':
        print("Initializing database...")
        init_db()
        print("Database initialized successfully!")
        sys.exit(0)
    
    # Initialize database on startup
    init_db()
    
    # Get port from environment variable (Render sets this automatically)
    port = int(os.environ.get('PORT', 5000))
    
    # Run in production mode on Render, development mode locally
    debug_mode = os.environ.get('RENDER') is None
    
    app.run(debug=debug_mode, host='0.0.0.0', port=port)
