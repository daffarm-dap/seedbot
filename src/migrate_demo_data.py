"""
Migration script untuk mengisi database dengan data demo
Jalankan setelah database schema sudah dibuat

Usage:
    python migrate_demo_data.py
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_db_connection():
    """Get database connection"""
    try:
        conn = psycopg2.connect(
            os.getenv('DATABASE_URL'),
            cursor_factory=RealDictCursor
        )
        return conn
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return None

def migrate_users():
    """Migrate demo users to database"""
    print("\n📝 Migrating users...")
    
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cur = conn.cursor()
        
        # Check if users already exist
        cur.execute("SELECT COUNT(*) as count FROM users")
        result = cur.fetchone()
        
        if result['count'] > 0:
            print("⚠️  Users already exist. Skipping user migration.")
            return True
        
        users = [
            ('admin', 'admin123', 'Evan Nathanael', 'admin'),
            ('evan', 'evan123', 'Evan Nathanael', 'petani'),
            ('daffa', 'daffa123', "Daffa Rif'at", 'petani'),
            ('asri', 'asri', 'Asri Sarassufi', 'petani'),
        ]
        
        for username, password, full_name, role in users:
            # Hash password
            hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            
            cur.execute(
                """INSERT INTO users (username, password, full_name, role, status) 
                   VALUES (%s, %s, %s, %s, %s)""",
                (username, hashed.decode('utf-8'), full_name, role, 'Aktif')
            )
            print(f"✅ Created user: {username} ({role})")
        
        conn.commit()
        print("✅ Users migration completed!")
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error migrating users: {e}")
        return False
    finally:
        cur.close()
        conn.close()

def migrate_news():
    """Migrate demo news articles to database"""
    print("\n📰 Migrating news articles...")
    
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cur = conn.cursor()
        
        # Check if news already exist
        cur.execute("SELECT COUNT(*) as count FROM news")
        result = cur.fetchone()
        
        if result['count'] > 0:
            print("⚠️  News articles already exist. Skipping news migration.")
            return True
        
        news_articles = [
            (
                'Revolusi Pertanian dengan AI & Robotik',
                'SeedBot menunjukkan peningkatan produktivitas hingga 40% dengan sistem tanam otomatis berbasis machine learning. Teknologi ini memungkinkan petani untuk mengoptimalkan proses penanaman dengan presisi tinggi.',
                'https://images.unsplash.com/photo-1581092335878-2d9ff86ca2bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyZSUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzYyMzU2OTc2fDA&ixlib=rb-4.1.0&q=80&w=1080',
                '2025-10-20',
                'Published'
            ),
            (
                'Hasil Panen Jagung Meningkat 35%',
                'Petani di Jawa Tengah melaporkan peningkatan signifikan hasil panen setelah menggunakan sistem SeedBot. Sistem ini mampu mengatur jarak tanam dan kedalaman yang optimal untuk setiap benih.',
                'https://images.unsplash.com/photo-1609130855718-882c8515f8e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3JuJTIwZmllbGQlMjBmYXJtfGVufDF8fHx8MTc2MjQwODE3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
                '2025-10-18',
                'Published'
            ),
            (
                'Teknologi IoT untuk Pertanian Modern',
                'Integrasi sensor tanah dan GPS mengoptimalkan proses penanaman benih jagung. Sistem monitoring real-time membantu petani membuat keputusan yang lebih baik berdasarkan data akurat.',
                'https://images.unsplash.com/photo-1593850684972-6ea75dfb77bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXJtaW5nJTIwbW9kZXJufGVufDF8fHx8MTc2MjQwODE3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
                '2025-10-15',
                'Published'
            ),
        ]
        
        for title, content, image_url, date, status in news_articles:
            cur.execute(
                """INSERT INTO news (title, content, image_url, date, status) 
                   VALUES (%s, %s, %s, %s, %s)""",
                (title, content, image_url, date, status)
            )
            print(f"✅ Created news: {title[:50]}...")
        
        conn.commit()
        print("✅ News migration completed!")
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error migrating news: {e}")
        return False
    finally:
        cur.close()
        conn.close()

def migrate_system_parameters():
    """Migrate system parameters"""
    print("\n⚙️  Migrating system parameters...")
    
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cur = conn.cursor()
        
        # Check if parameters already exist
        cur.execute("SELECT COUNT(*) as count FROM system_parameters")
        result = cur.fetchone()
        
        if result['count'] > 0:
            print("⚠️  System parameters already exist. Skipping parameters migration.")
            return True
        
        parameters = [
            ('default_depth', 5.0, 'cm', 'Kedalaman Tanam Default'),
            ('default_spacing', 20.0, 'cm', 'Jarak Antar Benih Default'),
        ]
        
        for param_name, param_value, unit, description in parameters:
            cur.execute(
                """INSERT INTO system_parameters (parameter_name, parameter_value, unit, description) 
                   VALUES (%s, %s, %s, %s)""",
                (param_name, param_value, unit, description)
            )
            print(f"✅ Created parameter: {param_name} = {param_value} {unit}")
        
        conn.commit()
        print("✅ System parameters migration completed!")
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error migrating parameters: {e}")
        return False
    finally:
        cur.close()
        conn.close()

def migrate_demo_sensor_data():
    """Migrate demo sensor data for testing"""
    print("\n🔬 Migrating demo sensor data...")
    
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cur = conn.cursor()
        
        # Get petani user IDs
        cur.execute("SELECT id FROM users WHERE role = 'petani'")
        users = cur.fetchall()
        
        if not users:
            print("⚠️  No petani users found. Skipping sensor data migration.")
            return True
        
        for user in users:
            user_id = user['id']
            
            # Create sensor realtime data
            cur.execute(
                """INSERT INTO sensor_realtime 
                   (user_id, suhu, kelembapan, ph, nitrogen, phospor, kalium)
                   VALUES (%s, %s, %s, %s, %s, %s, %s)
                   ON CONFLICT (user_id) DO NOTHING""",
                (user_id, 28.5, 65.3, 6.8, 45.2, 38.7, 52.1)
            )
            
            # Create robot status
            cur.execute(
                """INSERT INTO robot_status 
                   (user_id, connection_status, operation_status, benih_tertanam, baterai)
                   VALUES (%s, %s, %s, %s, %s)
                   ON CONFLICT (user_id) DO NOTHING""",
                (user_id, 'terhubung', 'Standby', 0, 100)
            )
            
            print(f"✅ Created demo data for user ID: {user_id}")
        
        conn.commit()
        print("✅ Demo sensor data migration completed!")
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error migrating sensor data: {e}")
        return False
    finally:
        cur.close()
        conn.close()

def main():
    """Main migration function"""
    print("🚀 Starting SeedBot Database Migration")
    print("=" * 50)
    
    # Check database connection
    conn = get_db_connection()
    if not conn:
        print("\n❌ Cannot connect to database. Please check your .env file.")
        return
    conn.close()
    print("✅ Database connection successful!")
    
    # Run migrations
    success = True
    success = migrate_users() and success
    success = migrate_news() and success
    success = migrate_system_parameters() and success
    success = migrate_demo_sensor_data() and success
    
    print("\n" + "=" * 50)
    if success:
        print("✅ All migrations completed successfully!")
        print("\n📋 Demo Accounts:")
        print("   Admin: admin / admin123")
        print("   Petani: evan / evan123")
        print("   Petani: daffa / daffa123")
        print("   Petani: asri / asri")
    else:
        print("⚠️  Some migrations failed. Please check the errors above.")
    print("=" * 50)

if __name__ == '__main__':
    main()
